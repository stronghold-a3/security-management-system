/**
 * Main Application Component
 * Integrates all security, performance, error handling, and monitoring features
 * 
 * Architecture:
 * - Error Boundary: Catches React errors
 * - Security Headers: HTTPS, CSP, XSS protection
 * - React Query: Optimized data fetching and caching
 * - Service Worker: Offline support
 * - Logging & Monitoring: Sentry integration
 * - Theme & UI: Tailwind + Radix UI
 */

import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";

// Security middleware
import { applySecurityHeadersToDOM, getEnvironmentSecurityConfig } from "@/middleware/securityHeaders";
import { enforceHTTPSClientSide, getEnvironmentHTTPSConfig } from "@/middleware/httpsRedirect";
import { setupCSPViolationReporter, getEnvironmentCSPConfig } from "@/middleware/cspMiddleware";

// Performance & Caching
import { queryClient } from "@/lib/queryClient";
import { registerServiceWorker, setupOnlineOfflineListeners } from "@/lib/serviceWorkerManager";

// Logging & Monitoring
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/react";

// Lazy loaded routes
import { lazyRoute } from "@/lib/lazyRoutes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load secondary routes for code splitting
const Dashboard = lazyRoute(() => import('./pages/Dashboard'));
const Settings = lazyRoute(() => import('./pages/Settings'));

/**
 * Initialize Sentry for error tracking and monitoring
 */\nconst initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });

    logger.info('Sentry initialized', {
      environment: import.meta.env.MODE,
      dsn: import.meta.env.VITE_SENTRY_DSN.substring(0, 20) + '***',
    });
  }
};

/**
 * Initialize all security features
 */\nconst initSecurityFeatures = () => {
  try {\n    // Enforce HTTPS
    const httpsConfig = getEnvironmentHTTPSConfig();
    enforceHTTPSClientSide(httpsConfig);

    // Apply security headers to DOM
    const securityConfig = getEnvironmentSecurityConfig();
    applySecurityHeadersToDOM(securityConfig);

    // Setup CSP violation reporting
    const cspConfig = getEnvironmentCSPConfig();
    setupCSPViolationReporter(cspConfig.reportUri);

    logger.info('Security features initialized', {
      httpsEnforced: httpsConfig.enforceHTTPS,
      cspEnabled: cspConfig.enableCSP,
      environment: import.meta.env.MODE,
    });
  } catch (error) {
    logger.error('Failed to initialize security features', error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Initialize offline support and caching
 */\nconst initOfflineSupport = () => {
  try {\n    // Register service worker
    registerServiceWorker();

    // Setup online/offline listeners
    const unsubscribe = setupOnlineOfflineListeners();

    // Listen for SW updates
    window.addEventListener('sw-updated', () => {
      logger.info('Service worker updated');
      // You could show a toast notification here
    });

    // Listen for offline events
    window.addEventListener('app-offline', () => {
      logger.warn('Application is offline');
    });

    window.addEventListener('app-online', () => {
      logger.info('Application is online');
    });

    logger.info('Offline support initialized');

    return unsubscribe;
  } catch (error) {
    logger.warn('Failed to initialize offline support', { error: String(error) });
  }
};

/**
 * Monitor app performance
 */\nconst initPerformanceMonitoring = () => {
  if ('PerformanceObserver' in window) {
    try {\n      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {\n          logger.info('Performance metric', {
            name: entry.name,
            value: (entry as any).value,
            rating: (entry as any).rating,
          });

          // Send to Sentry
          if (window.__SENTRY__) {\n            window.__SENTRY__.captureMessage(`Web Vital: ${entry.name}`, 'info', {
              extra: {\n                value: (entry as any).value,
                rating: (entry as any).rating,\n              },\n            });
          }
        }
      });

      // Observe all performance entries
      observer.observe({
        type: 'largest-contentful-paint',\n        buffered: true,\n      });

      logger.info('Performance monitoring initialized');
    } catch (error) {\n      logger.warn('Failed to initialize performance monitoring', { error: String(error) });\n    }
  }
};

/**
 * Main App Component
 */\nconst App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize all systems
    logger.info('Initializing application', {
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    });

    // Initialize Sentry
    initSentry();

    // Initialize security features
    initSecurityFeatures();

    // Initialize offline support
    const unsubscribeOffline = initOfflineSupport();

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Mark app as ready
    setIsReady(true);

    logger.info('Application initialized successfully');

    // Cleanup on unmount
    return () => {
      unsubscribeOffline?.();
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Initializing Security Management System...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Wrap with Sentry for error tracking
const SentryApp = Sentry.withProfiler(App);

export default SentryApp;
