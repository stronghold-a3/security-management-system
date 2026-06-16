import { Request, Response, NextFunction } from 'express';

interface HTTPSConfig {
  enabled: boolean;
  trustProxy: boolean;
}

export const getEnvironmentHTTPSConfig = (): HTTPSConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    enabled: isProduction || process.env.FORCE_HTTPS === 'true',
    trustProxy: isProduction,
  };
};

export const httpsRedirectMiddleware = (config: HTTPSConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (config.enabled && config.trustProxy) {
      if (req.header('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.header('host')}${req.url}`);
      }
    }
    next();
  };
};
