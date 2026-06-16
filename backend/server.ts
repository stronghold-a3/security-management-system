import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { createClient as createRedisClient } from 'redis';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import multer from 'multer';

import { httpsRedirectMiddleware, getEnvironmentHTTPSConfig } from './middleware/httpsRedirect';
import { cspMiddleware, getEnvironmentCSPConfig } from './middleware/cspMiddleware';
import { generateSecurityHeaders } from './middleware/securityHeaders';

// Load environment variables
dotenv.config();

const app = express();

// ============================================================================
// 1. INITIALIZATION OF EXTERNAL SERVICES (Based on .env)
// ============================================================================

// Sentry Monitoring
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Supabase Client (Backend Service Role)
const supabase = createSupabaseClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PostgreSQL Database Pool
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  min: parseInt(process.env.DB_CONNECTION_POOL_MIN || '5', 10),
  max: parseInt(process.env.DB_CONNECTION_POOL_MAX || '20', 10),
  ssl: process.env.DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false,
});

// Redis Cache & Session Store
const redisClient = createRedisClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD || undefined,
  socket: { tls: process.env.REDIS_TLS === 'true' }
});
redisClient.connect().catch(console.error);

// Twilio SMS Client
const twilioClient = process.env.FEATURE_TWILIO_SMS === 'true' 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTHTOKEN) 
  : null;

// Nodemailer SMTP Transport (SendGrid)
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Multer for File Uploads (Memory Storage for Supabase)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10) * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowedTypes.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// ============================================================================
// 2. GLOBAL MIDDLEWARE
// ============================================================================

// CORS Configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: process.env.CORS_ALLOWED_METHODS?.split(',') || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: process.env.CORS_ALLOW_CREDENTIALS === 'true',
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Security Middleware
const httpsConfig = getEnvironmentHTTPSConfig();
app.use(httpsRedirectMiddleware(httpsConfig));

const cspConfig = getEnvironmentCSPConfig();
app.use(cspMiddleware(cspConfig));

app.use((req, res, next) => {
  const headers = generateSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    if (value) res.setHeader(key, value);
  });
  next();
});

// ============================================================================
// 3. API ROUTES (Mapped to .env configurations)
// ============================================================================

// --- Health & System Routes ---
app.get('/api/health', async (req, res) => {
  try {
    await dbPool.query('SELECT 1');
    const redisPing = await redisClient.ping();
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      services: {
        database: 'connected',
        redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
        supabase: 'configured'
      }
    });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Service unavailable', details: error });
  }
});

// --- Feature Flags Route ---
app.get('/api/config/features', (req, res) => {
  res.status(200).json({
    twilio_sms: process.env.FEATURE_TWILIO_SMS === 'true',
    viber_integration: process.env.FEATURE_VIBER_INTEGRATION === 'true',
    radio_mesh: process.env.FEATURE_RADIO_MESH === 'true',
    offline_mode: process.env.FEATURE_OFFLINE_MODE === 'true',
    advanced_analytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
    bulk_operations: process.env.FEATURE_BULK_OPERATIONS === 'true',
  });
});

// --- Security & Monitoring Routes ---
// CSP Violation Reporting (Matches CSP_REPORT_URI path: /csp-report)
app.post('/csp-report', express.text({ type: ['text/xml', 'application/csp-report', 'application/json'] }), (req, res) => {
  console.warn('CSP Violation Report:', req.body);
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`CSP Violation: ${req.body}`, 'warning');
  }
  res.status(204).send();
});

// Performance Metrics Endpoint (Matches PERFORMANCE_API_ENDPOINT path: /metrics)
app.post('/metrics', (req, res) => {
  const metrics = req.body;
  console.log('Received Performance Metrics:', metrics);
  // TODO: Save metrics to PostgreSQL or forward to analytics service
  res.status(200).json({ status: 'received' });
});

// --- Notification Routes ---
// SMS via Twilio
app.post('/api/notifications/sms', async (req, res) => {
  if (!twilioClient) return res.status(501).json({ error: 'SMS feature is disabled' });
  
  const { to, body } = req.body;
  try {
    const message = await twilioClient.messages.create({
      body,
      from: process.env.SMS_SENDER_ID,
      to
    });
    res.status(200).json({ success: true, sid: message.sid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send SMS', details: error });
  }
});

// Email via SendGrid/SMTP
app.post('/api/notifications/email', async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    await mailTransporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email', details: error });
  }
});

// Viber Integration
app.post('/api/notifications/viber', async (req, res) => {
  if (process.env.FEATURE_VIBER_INTEGRATION !== 'true') {
    return res.status(501).json({ error: 'Viber feature is disabled' });
  }
  // TODO: Implement Viber API call using VIBER_API_URL and VIBER_ACCOUNT_TOKEN
  res.status(200).json({ success: true, message: 'Viber message queued' });
});

// --- File Storage Routes ---
// Upload to Supabase Storage
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const bucketName = process.env.STORAGE_BUCKET_NAME || 'sop-files';
  const filePath = `${Date.now()}-${req.file.originalname}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    res.status(200).json({ success: true, url: urlData.publicUrl, path: data.path });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed', details: error });
  }
});

// ============================================================================
// 4. SERVE FRONTEND STATIC FILES
// ============================================================================
const frontendDistPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(frontendDistPath));

// Fallback to index.html for client-side routing (e.g., React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ============================================================================
// 5. ERROR HANDLING & SERVER STARTUP
// ============================================================================

// Sentry Error Handler (Must be after all routes)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`[Server] Running on http://${host}:${port}`);
  console.log(`[Environment] ${process.env.NODE_ENV || 'development'}`);
});

export default app;
