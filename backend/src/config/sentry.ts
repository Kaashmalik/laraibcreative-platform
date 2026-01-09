/**
 * Sentry Configuration for Backend
 * Error tracking and monitoring
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry
 */
export const initSentry = (): void => {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Filter out health checks and other noise
    beforeSend(event) {
      // Don't send events for health checks
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },
    // Set user context
    initialScope: {
      tags: {
        component: 'backend',
      },
    },
  });

  console.log('✅ Sentry initialized');
};

/**
 * Sentry error handler middleware
 */
export const sentryErrorHandler = (_err: Error, _req: any, _res: any, next: any) => {
  next(_err);
};

/**
 * Sentry request handler middleware
 */
export const sentryRequestHandler = (_req: any, _res: any, next: any) => {
  next();
};

/**
 * Capture exception with context
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value as Record<string, any>);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Capture message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context
 */
export const setUser = (user: {
  id?: string;
  email?: string;
  username?: string;
}): void => {
  Sentry.setUser(user);
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb): void => {
  Sentry.addBreadcrumb(breadcrumb);
};

