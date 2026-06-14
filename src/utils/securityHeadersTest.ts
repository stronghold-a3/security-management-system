import { generateSecurityHeaders, getEnvironmentSecurityConfig } from '@/middleware/securityHeaders';
import { generateCSPHeader, getEnvironmentCSPConfig, validateCSPConfig } from '@/middleware/cspMiddleware';

export const testSecurityHeaders = () => {
  const securityConfig = getEnvironmentSecurityConfig();
  const headers = generateSecurityHeaders(securityConfig);
  
  console.log('=== Security Headers ===');
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  const cspConfig = getEnvironmentCSPConfig();
  const cspHeader = generateCSPHeader(cspConfig);
  console.log('\n=== CSP Header ===');
  console.log(cspHeader);
  
  // Validate CSP configuration
  const warnings = validateCSPConfig(cspConfig);
  if (warnings.length > 0) {
    console.log('\n=== CSP Warnings ===');
    warnings.forEach(w => console.warn(w));
  }
};

// Call this in development to verify headers
if (import.meta.env.DEV) {
  testSecurityHeaders();
}
