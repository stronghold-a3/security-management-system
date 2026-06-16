import { Request, Response, NextFunction } from 'express';

interface CSPConfig {
  directives: Record<string, string[]>;
}

export const getEnvironmentCSPConfig = (): CSPConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    directives: {
      'default-src': ["'self'"],
      'script-src': isProduction ? ["'self'"] : ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "https:"],
      'connect-src': ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      'font-src': ["'self'", "https:", "data:"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
    },
  };
};

export const cspMiddleware = (config: CSPConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cspHeader = Object.entries(config.directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
    
    res.setHeader('Content-Security-Policy', cspHeader);
    next();
  };
};
