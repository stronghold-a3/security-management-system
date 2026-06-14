/**
 * Content Security Policy (CSP) Middleware
 * Prevents XSS attacks by controlling which resources can be loaded
 * 
 * CSP directives control:
 * - Script execution (prevents inline scripts, limits script sources)
 * - Style loading (prevents unsafe styles)
 * - Image loading (prevents loading from untrusted sources)
 * - Font loading
 * - API calls (connect-src)
 * - Form submissions
 * - Frame embedding
 * - And more...
 */

export interface CSPConfig {
  enableCSP: boolean;
  reportUri?: string;
  reportOnly?: boolean;
  directives: Record<string, string>;
  nonce?: string;
}

/**
 * Generate a nonce for inline scripts/styles
 * Nonce should be regenerated for each request
 */
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto support
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Production CSP configuration
 * Strict policy that only allows explicitly whitelisted resources
 */
export const productionCSPConfig: CSPConfig = {
  enableCSP: true,
  reportOnly: false,
  reportUri: 'https://api.strongholda3.com/csp-report',
  directives: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com",
    'script-src-attr': "'none'",
    'script-src-elem': "'self' https://cdn.jsdelivr.net",
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    'style-src-attr': "'unsafe-inline'",
    'img-src': "'self' data: https: blob:",
    'font-src': "'self' https://fonts.gstatic.com data:",
    'connect-src': "'self' https://fhwhqoiucfxmfsclianh.supabase.co https://api.strongholda3.com https://sentry.io wss:",
    'media-src': "'self'",
    'object-src': "'none'",
    'frame-src': "'none'",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'manifest-src': "'self'",
    'upgrade-insecure-requests': '',
  },
};

/**
 * Staging CSP configuration
 * Slightly more permissive for testing
 */
export const stagingCSPConfig: CSPConfig = {
  enableCSP: true,
  reportOnly: true, // Report-only mode for testing
  reportUri: 'https://staging-api.strongholda3.com/csp-report',
  directives: {
    ...productionCSPConfig.directives,
  },
};

/**
 * Development CSP configuration
 * Permissive for development workflow
 */
export const developmentCSPConfig: CSPConfig = {
  enableCSP: true,
  reportOnly: true,
  reportUri: 'http://localhost:3000/csp-report',
  directives: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https: blob:",
    'font-src': "'self' data:",
    'connect-src': "'self' http://localhost:* ws://localhost:*",
    'frame-ancestors': "'self'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'upgrade-insecure-requests': '',
  },
};

/**
 * Generate CSP header string
 */
export const generateCSPHeader = (config: CSPConfig, nonce?: string): string => {
  if (!config.enableCSP) {
    return '';
  }

  const directives = Object.entries(config.directives)
    .map(([key, value]) => {
      if (nonce && (key === 'script-src' || key === 'style-src')) {
        return `${key} 'nonce-${nonce}' ${value}`.trim();
      }
      return `${key} ${value}`.trim();
    })
    .join('; ');

  if (config.reportUri) {
    return `${directives}; report-uri ${config.reportUri}`;
  }

  return directives;
};

/**
 * Express.js middleware for CSP
 * 
 * Usage in Express:
 * ```typescript
 * import express from 'express';
 * import { cspMiddleware } from './middleware/cspMiddleware';
 * import { getEnvironmentCSPConfig } from './middleware/cspMiddleware';
 * 
 * const app = express();
 * const cspConfig = getEnvironmentCSPConfig();
 * app.use(cspMiddleware(cspConfig));
 * ```
 */
export const cspMiddleware = (config: CSPConfig) => {
  return (req: any, res: any, next: any): void => {
    const nonce = generateCSPNonce();
    
    // Store nonce in request for template use
    (req as any).cspNonce = nonce;
    
    // Set CSP header
    const headerName = config.reportOnly 
      ? 'Content-Security-Policy-Report-Only' 
      : 'Content-Security-Policy';
    
    const headerValue = generateCSPHeader(config, nonce);
    res.setHeader(headerName, headerValue);
    
    next();
  };
};

/**
 * Apply CSP to DOM meta tags
 * Useful for client-side rendering
 */
export const applyCSPToDOM = (config: CSPConfig, nonce?: string): void => {
  if (typeof document === 'undefined') return;

  const headerName = config.reportOnly 
    ? 'Content-Security-Policy-Report-Only' 
    : 'Content-Security-Policy';

  const existingMeta = document.querySelector(`meta[http-equiv="${headerName}"]`);
  if (existingMeta) {
    existingMeta.remove();
  }

  const meta = document.createElement('meta');
  meta.httpEquiv = headerName;
  meta.content = generateCSPHeader(config, nonce);
  document.head.appendChild(meta);
};

/**
 * Get CSP nonce from meta tag
 * Use this in inline scripts to whitelist them with nonce
 */
export const getCSPNonce = (): string | null => {
  if (typeof document === 'undefined') return null;

  const meta = document.querySelector('meta[property="csp-nonce"]');
  return meta?.getAttribute('content') || null;
};

/**
 * CSP Violation Reporter
 * Logs CSP violations for monitoring
 */
export const setupCSPViolationReporter = (reportUri?: string): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
    const violation = {
      'document-uri': event.documentURI,
      'violated-directive': event.violatedDirective,
      'effective-directive': event.effectiveDirective,
      'original-policy': event.originalPolicy,
      'disposition': event.disposition,
      'blocked-uri': event.blockedURI,
      'status-code': event.statusCode,
      'line-number': event.lineNumber,
      'column-number': event.columnNumber,
      'source-file': event.sourceFile,
      'timestamp': new Date().toISOString(),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('CSP Violation:', violation);
    }

    // Send to reporting endpoint
    if (reportUri) {
      fetch(reportUri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'csp-report': violation,
        }),
      }).catch(err => console.error('Failed to report CSP violation:', err));
    }
  });
};

/**
 * Get environment-specific CSP configuration
 */
export const getEnvironmentCSPConfig = (): CSPConfig => {
  const env = import.meta.env.MODE || 'development';

  if (env === 'production') {
    return productionCSPConfig;
  }

  if (env === 'staging') {
    return stagingCSPConfig;
  }

  return developmentCSPConfig;
};

/**
 * Validate CSP configuration
 * Returns warnings about potentially weak CSP rules
 */
export const validateCSPConfig = (config: CSPConfig): string[] => {
  const warnings: string[] = [];

  Object.entries(config.directives).forEach(([directive, value]) => {
    if (value.includes("'unsafe-inline'") && !directive.includes('-attr')) {
      warnings.push(`⚠️  CSP Warning: ${directive} uses 'unsafe-inline' which reduces XSS protection`);
    }

    if (value.includes("'unsafe-eval'")) {
      warnings.push(`⚠️  CSP Warning: ${directive} uses 'unsafe-eval' which is a significant security risk`);
    }

    if (value === '*' || value === "'self' *") {
      warnings.push(`⚠️  CSP Warning: ${directive} allows all sources which defeats the purpose of CSP`);
    }
  });

  if (!config.directives['object-src']?.includes("'none'")) {
    warnings.push("⚠️  CSP Warning: object-src should be set to 'none' to prevent plugin-based attacks");
  }

  if (!config.directives['frame-ancestors']?.includes("'none'")) {
    warnings.push("⚠️  CSP Warning: frame-ancestors should be set to 'none' to prevent clickjacking");
  }

  return warnings;
};

export default {
  generateCSPNonce,
  generateCSPHeader,
  setupCSPViolationReporter,
  getEnvironmentCSPConfig,
  validateCSPConfig,
};
