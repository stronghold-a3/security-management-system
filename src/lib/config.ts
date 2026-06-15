/**
 * Environment-Specific Configuration
 * Manages different configurations for development, staging, and production
 *
 * What it does:
 * - Loads environment-specific variables
 * - Validates required variables
 * - Provides typed configuration object
 * - Supports .env.local, .env.{environment}, and .env files
 */

/**
 * Application configuration
 */
export interface AppConfig {
  // App Info
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  isDev: boolean;
  isProd: boolean;

  // API
  apiBaseURL: string;
  apiTimeout: number;
  
  // Supabase
  supabaseUrl: string;
  supabaseKey: string;

  // Sentry
  sentryDsn?: string;
  sentryEnvironment: string;

  // Feature Flags
  features: {
    smSgateway: boolean;
    viberIntegration: boolean;
    radioMesh: boolean;
    offlineMode: boolean;
    advancedAnalytics: boolean;
    bulkOperations: boolean;
  };

  // Security
  security: {
    enableHTTPS: boolean;
    enableCSP: boolean;
    corsAllowedOrigins: string[];
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };

  // Compliance & Organization Info
  compliance: {
    doleRegistrationNumber: string;
    organizationName: string;
    organizationTaxId: string;
    organizationLocation: string;
  };

  // Cache & Performance
  cache: {
    queryStaleTime: number;
    queryGCTime: number;
    enableServiceWorker: boolean;
  };

  // Logging & Monitoring
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableRemote: boolean;
    logEndpoint?: string;
  };
}

/**
 * Load and validate environment configuration
 */
export const loadConfig = (): AppConfig => {
  const env = import.meta.env;
  const mode = env.MODE || 'development';

  // Validate required environment variables
  const requiredVars = [
    'VITE_APP_NAME',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter(varName => !env[varName]);
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const config: AppConfig = {
    // App Info
    appName: env.VITE_APP_NAME || 'Security Management System',
    appVersion: env.VITE_APP_VERSION || '1.0.0',
    environment: (mode as any) || 'development',
    isDev: mode === 'development',
    isProd: mode === 'production',

    // API
    apiBaseURL: env.VITE_API_BASE_URL || (mode === 'production' 
      ? 'https://api.strongholda3.com' 
      : 'http://localhost:3001'),
    apiTimeout: parseInt(env.VITE_API_TIMEOUT || '30000'),

    // Supabase
    supabaseUrl: env.VITE_SUPABASE_URL,
    supabaseKey: env.VITE_SUPABASE_ANON_KEY,

    // Sentry
    sentryDsn: env.VITE_SENTRY_DSN,
    sentryEnvironment: env.VITE_SENTRY_ENVIRONMENT || mode,

    // Feature Flags
    features: {
      smSgateway: env.VITE_FEATURE_SMS_GATEWAY !== 'false',
      viberIntegration: env.VITE_FEATURE_VIBER !== 'false',
      radioMesh: env.VITE_FEATURE_RADIO_MESH !== 'false',
      offlineMode: env.VITE_FEATURE_OFFLINE !== 'false',
      advancedAnalytics: env.VITE_FEATURE_ANALYTICS !== 'false',
      bulkOperations: env.VITE_FEATURE_BULK_OPS !== 'false',
    },

    // Security
    security: {
      enableHTTPS: mode === 'production',
      enableCSP: true,
      corsAllowedOrigins: (env.VITE_CORS_ORIGINS || 'http://localhost:8080').split(','),
      rateLimitWindow: parseInt(env.VITE_RATE_LIMIT_WINDOW || '900000'),
      rateLimitMaxRequests: parseInt(env.VITE_RATE_LIMIT_MAX || '100'),
    },

    // Compliance & Organization Info
    compliance: {
      doleRegistrationNumber: env.VITE_DOLE_REG_NUMBER || 'DO-174-XXXXX',
      organizationName: env.VITE_ORG_NAME || 'Stronghold A3 Security Agency',
      organizationTaxId: env.VITE_ORG_TAX_ID || '123-456-789-000',
      organizationLocation: env.VITE_ORG_LOCATION || 'Eastern Visayas, Philippines',
    },

    // Cache & Performance
    cache: {
      queryStaleTime: parseInt(env.VITE_QUERY_STALE_TIME || '300000'), // 5 minutes
      queryGCTime: parseInt(env.VITE_QUERY_GC_TIME || '600000'), // 10 minutes
      enableServiceWorker: env.VITE_ENABLE_SW !== 'false',
    },

    // Logging & Monitoring
    logging: {
      level: (env.VITE_LOG_LEVEL || (mode === 'production' ? 'error' : 'debug')) as any,
      enableRemote: mode === 'production',
      logEndpoint: env.VITE_LOG_ENDPOINT,
    },
  };

  return config;
};

/**
 * Global app configuration instance
 */
export const appConfig = loadConfig();

/**
 * Get configuration value with fallback
 */
export const getConfigValue = <T = any>(path: string, defaultValue?: T): T => {
  const keys = path.split('.');
  let value: any = appConfig;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue as T;
    }
  }

  return value as T;
};

export default appConfig;
