// This file is used by vite.config.ts for local development and preview

interface ViteServerConfig {
  host?: string;
  port?: number;
  https?: boolean;
  open?: boolean;
}

export const getViteHTTPSConfig = (useHTTPS: boolean = false): ViteServerConfig => {
  const config: ViteServerConfig = {
    host: '::', // Listen on all IPv6 and IPv4 addresses
  };

  // FIX: Removed hardcoded port 8080.
  // Allow deployment platforms to dictate the port via process.env.PORT.
  // If not set, Vite will use its default ports (5173 for dev, 4173 for preview).
  if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
  }

  if (useHTTPS) {
    config.https = true;
  }

  return config;
};
