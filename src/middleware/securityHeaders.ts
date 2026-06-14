/**
 * Security Headers Middleware
 * Implements comprehensive security headers to protect against:
 * - XSS attacks (X-XSS-Protection, X-Content-Type-Options)
 * - Clickjacking (X-Frame-Options)
 * - MIME-type sniffing (X-Content-Type-Options)
 * - Insecure protocol usage (Strict-Transport-Security)
 * - Other common web vulnerabilities
 */

export interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  hstsMaxAge?: number;
  hstsIncludeSubDomains?: boolean;
  hstsPreload?: boolean;
  enableXFrameOptions?: boolean;
  xFrameOptionsValue?: string;
  enableXContentTypeOptions?: boolean;
  enableXXSSProtection?: boolean;
  enableCSP?: boolean;
  cspDirectives?: Record<string, string>;
  enableReferrerPolicy?: boolean;
  referrerPolicyValue?: string;
  enablePermissionsPolicy?: boolean;
  permissionsPolicyDirectives?: Record<string, string>;
}

/**
 * Default security configuration
 * Optimized for production environments
 */
const defaultConfig: SecurityHeadersConfig = {
  enableHSTS: true,
  hstsMaxAge: 31536000, // 1 year in seconds
  hstsIncludeSubDomains: true,
  hstsPreload: true,
  enableXFrameOptions: true,
  xFrameOptionsValue: 'DENY',
  enableXContentTypeOptions: true,
  enableXXSSProtection: true,
  enableCSP: true,
  cspDirectives: {
    'default-src': "'self'",
    'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com",
    'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
    'img-src': "'self' data: https: blob:",
    'font-src': "'self' https://fonts.gstatic.com data:",
    'connect-src': "'self' https://fhwhqoiucfxmfsclianh.supabase.co https://api.strongholda3.com https://sentry.io",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'upgrade-insecure-requests': '',
  },
  enableReferrerPolicy: true,
  referrerPolicyValue: 'strict-origin-when-cross-origin',
  enablePermissionsPolicy: true,
  permissionsPolicyDirectives: {
    'geolocation': '()',
    'microphone': '()',
    'camera': '()',
    'magnetometer': '()',
    'gyroscope': '()',
    'accelerometer': '()',
    'payment': '()',
    'usb': '()',
  },
};

/**
 * Generate HTTP Security Headers based on configuration
 * @param config - Security configuration object
 * @returns Object with security header key-value pairs
 */
export const generateSecurityHeaders = (
  config: SecurityHeadersConfig = defaultConfig
): Record<string, string> => {
  const headers: Record<string, string> = {};

  // Strict-Transport-Security (HSTS)
  if (config.enableHSTS !== false) {
    const maxAge = config.hstsMaxAge ?? 31536000;
    let hstsValue = `max-age=${maxAge}`;
    
    if (config.hstsIncludeSubDomains !== false) {
      hstsValue += '; includeSubDomains';
    }
    
    if (config.hstsPreload !== false) {
      hstsValue += '; preload';
    }
    
    headers['Strict-Transport-Security'] = hstsValue;
  }

  // X-Frame-Options
  if (config.enableXFrameOptions !== false) {
    headers['X-Frame-Options'] = config.xFrameOptionsValue || 'DENY';
  }

  // X-Content-Type-Options
  if (config.enableXContentTypeOptions !== false) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // X-XSS-Protection
  if (config.enableXXSSProtection !== false) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Content-Security-Policy
  if (config.enableCSP !== false && config.cspDirectives) {
    const cspString = Object.entries(config.cspDirectives)
      .map(([key, value]) => (value ? `${key} ${value}` : key))
      .join('; ');
    headers['Content-Security-Policy'] = cspString;
  }

  // Referrer-Policy
  if (config.enableReferrerPolicy !== false) {
    headers['Referrer-Policy'] = config.referrerPolicyValue || 'strict-origin-when-cross-origin';
  }

  // Permissions-Policy (modern alternative to Feature-Policy)
  if (config.enablePermissionsPolicy !== false && config.permissionsPolicyDirectives) {
    const permissionsPolicyString = Object.entries(config.permissionsPolicyDirectives)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ');
    headers['Permissions-Policy'] = permissionsPolicyString;
  }

  // Additional security headers
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';

  return headers;
};

/**
 * Apply security headers to the document meta tags
 * Useful for CSP reporting and other meta-based configurations
 */
export const applySecurityHeadersToDOM = (config: SecurityHeadersConfig = defaultConfig): void => {
  if (typeof document === 'undefined') return;

  // Create and apply CSP meta tag
  if (config.enableCSP !== false && config.cspDirectives) {
    const cspString = Object.entries(config.cspDirectives)
      .map(([key, value]) => (value ? `${key} ${value}` : key))
      .join('; ');

    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = cspString;
      document.head.appendChild(meta);
    }
  }
};

/**
 * Environment-specific security configuration
 * Returns different settings based on environment
 */
export const getEnvironmentSecurityConfig = (): SecurityHeadersConfig => {
  const env = import.meta.env.MODE || 'development';

  if (env === 'production') {
    return {
      ...defaultConfig,
      enableHSTS: true,
      hstsMaxAge: 31536000,
      hstsPreload: true,
    };
  }

  if (env === 'staging') {
    return {
      ...defaultConfig,
      enableHSTS: true,
      hstsMaxAge: 86400, // 1 day for staging
    };
  }

  // Development
  return {
    ...defaultConfig,
    enableHSTS: false,
    enableCSP: true,
    cspDirectives: {
      ...defaultConfig.cspDirectives,
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net http://localhost:* ws://localhost:*",
      'style-src': "'self' 'unsafe-inline'",
    },
  };
};

export default generateSecurityHeaders;
