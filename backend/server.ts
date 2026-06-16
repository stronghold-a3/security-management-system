import express from 'express';
import { httpsRedirectMiddleware, getEnvironmentHTTPSConfig } from './middleware/httpsRedirect';
import { cspMiddleware, getEnvironmentCSPConfig } from './middleware/cspMiddleware';
import { generateSecurityHeaders } from './middleware/securityHeaders';

const app = express();

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
    res.setHeader(key, value);
  });
  next();
});

// Rest of your app...
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
