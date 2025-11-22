/**
 * Sentry Configuration for Frontend (Next.js)
 * Error tracking and monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry
 */
export const initSentry = (): void => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Filter out noise
    beforeSend(event, hint) {
      // Don't send events for development errors
      if (process.env.NODE_ENV === 'development' && event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message.includes('ResizeObserver')) {
          return null; // Ignore ResizeObserver errors
        }
      }
      return event;
    },
    // Set initial tags
    initialScope: {
      tags: {
        component: 'frontend',
      },
    },
  });

  console.log('✅ Sentry initialized');
};

