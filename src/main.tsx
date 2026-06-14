import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { enforceHTTPSClientSide, getEnvironmentHTTPSConfig } from './middleware/httpsRedirect'
import { setupCSPViolationReporter, getEnvironmentCSPConfig } from './middleware/cspMiddleware'

// Enforce HTTPS in production
const httpsConfig = getEnvironmentHTTPSConfig()
enforceHTTPSClientSide(httpsConfig)

// Setup CSP violation reporting
const cspConfig = getEnvironmentCSPConfig()
setupCSPViolationReporter(cspConfig.reportUri)

createRoot(document.getElementById("root")!).render(<App />)
