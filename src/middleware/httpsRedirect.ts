/**
 * HTTPS Redirect Middleware
 * Enforces secure HTTPS connections and redirects HTTP requests
 * 
 * Implementation Strategy:
 * 1. Client-side: Detect insecure connection and redirect
 * 2. Server-side (if using backend): Implement HTTP -> HTTPS redirect
 * 3. Production: Rely on reverse proxy/load balancer for enforcement
 */

export interface HTTPSRedirectConfig {
  enforceHTTPS: boolean;
  allowLocalhost: boolean;
  allowedInsecureOrigins: string[];
  redirectStatusCode: 301 | 302 | 303 | 307 | 308;
}

/**
 * Default HTTPS redirect configuration
 */
const defaultConfig: HTTPSRedirectConfig = {
  enforceHTTPS: true,
  allowLocalhost: true,
  allowedInsecureOrigins: [],
  redirectStatusCode: 301, // Permanent redirect
};

/**
 * Client-side HTTPS enforcement
 * Detects if the application is served over HTTP and redirects to HTTPS
 * Call this early in your application initialization (e.g., in main.tsx or App.tsx)
 */
export const enforceHTTPSClientSide = (config: HTTPSRedirectConfig = defaultConfig): void => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  const { enforceHTTPS, allowLocalhost } = config;

  if (!enforceHTTPS) return;

  // Allow localhost for development
  if (allowLocalhost && window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }

  // Redirect HTTP to HTTPS
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    const httpsURL = 'https:' + window.location.href.substring(5);
    window.location.href = httpsURL;
  }
};

/**
 * Server-side middleware for Express.js (for Node.js backends)
 * Use this in your backend API if you have one
 * 
 * Example usage in Express:
 * ```typescript
 * import express from 'express';
 * import { httpsRedirectMiddleware } from './middleware/httpsRedirect';
 * 
 * const app = express();
 * app.use(httpsRedirectMiddleware());
 * ```
 */
export const httpsRedirectMiddleware = (config: HTTPSRedirectConfig = defaultConfig) => {
  return (req: any, res: any, next: any): void => {
    // Skip redirect for health checks
    if (req.path === '/health' || req.path === '/healthz') {
      return next();
    }

    // Check if already using HTTPS
    const isHTTPS = req.secure || req.get('x-forwarded-proto') === 'https';
    
    if (!isHTTPS && config.enforceHTTPS) {
      // Allow localhost in development
      if (config.allowLocalhost && (req.hostname === 'localhost' || req.hostname === '127.0.0.1')) {
        return next();
      }

      // Check if origin is in allowedInsecureOrigins
      if (config.allowedInsecureOrigins.includes(req.hostname)) {
        return next();
      }

      // Redirect to HTTPS
      const httpsURL = `https://${req.get('host')}${req.originalUrl}`;
      return res.redirect(config.redirectStatusCode, httpsURL);
    }

    next();
  };
};

/**
 * Vite plugin configuration for development server
 * Ensures development server uses HTTPS when needed
 * 
 * Example usage in vite.config.ts:
 * ```typescript
 * import { defineConfig } from 'vite';
 * import react from '@vitejs/plugin-react-swc';
 * import { getViteHTTPSConfig } from './src/middleware/httpsRedirect';
 * 
 * export default defineConfig({
 *   plugins: [react()],
 *   server: getViteHTTPSConfig()
 * });
 * ```
 */
export const getViteHTTPSConfig = (useHTTPS: boolean = false) => {
  if (!useHTTPS) {
    return {
      host: '::',
      port: 8080,
    };
  }

  return {
    host: '::',
    port: 8080,
    https: true, // Enable HTTPS in dev server
  };
};

/**
 * Check if current connection is secure
 */
export const isSecureConnection = (): boolean => {
  if (typeof window === 'undefined') return true;

  const isHTTPS = window.location.protocol === 'https:';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return isHTTPS || isLocalhost;
};

/**
 * Get the secure URL for a given path
 */
export const getSecureURL = (path: string, host?: string): string => {
  if (typeof window === 'undefined') {
    if (!host) throw new Error('host parameter required in non-browser environment');
    return `https://${host}${path}`;
  }

  const baseURL = `${window.location.protocol}//${window.location.host}`;
  return `${baseURL}${path}`;
};

/**
 * Environment-specific HTTPS configuration
 */
export const getEnvironmentHTTPSConfig = (): HTTPSRedirectConfig => {
  const env = import.meta.env.MODE || 'development';

  if (env === 'production') {
    return {
      enforceHTTPS: true,
      allowLocalhost: false,
      allowedInsecureOrigins: [],
      redirectStatusCode: 301,
    };
  }

  if (env === 'staging') {
    return {
      enforceHTTPS: true,
      allowLocalhost: true,
      allowedInsecureOrigins: [],
      redirectStatusCode: 302,
    };
  }

  // Development
  return {
    enforceHTTPS: false,
    allowLocalhost: true,
    allowedInsecureOrigins: ['localhost', '127.0.0.1'],
    redirectStatusCode: 307,
  };
};

export default enforceHTTPSClientSide;
