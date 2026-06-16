import express from 'express';
import cors from 'cors';
import path from 'path';
import { httpsRedirectMiddleware, getEnvironmentHTTPSConfig } from './middleware/httpsRedirect';
import { cspMiddleware, getEnvironmentCSPConfig } from './middleware/cspMiddleware';
import { generateSecurityHeaders } from './middleware/securityHeaders';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Apply HTTPS redirect middleware
const httpsConfig = getEnvironmentHTTPSConfig();
app.use(httpsRedirectMiddleware(httpsConfig));

// Apply CSP middleware
const cspConfig = getEnvironmentCSPConfig();
app.use(cspMiddleware(cspConfig));

// Apply all security headers
app.use((req, res, next) => {
  const headers = generateSecurityHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    if (value) res.setHeader(key, value);
  });
  next();
});

// --- API ROUTES ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Add your other backend API routes here...
// app.use('/api/users', userRoutes);

// --- SERVE FRONTEND STATIC FILES ---
// This allows the Express server to serve the Vite build output
const frontendDistPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(frontendDistPath));

// Fallback to index.html for client-side routing (e.g., React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// --- START SERVER ---
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
