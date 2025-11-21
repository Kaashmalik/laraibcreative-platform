"use client";

import { Component } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Global Error Boundary Component
 * Wraps the entire application to catch any unhandled errors
 * Provides user-friendly error UI and error reporting
 */
export default function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('🚨 Global Error Boundary caught error:', error);
          console.error('Error Info:', errorInfo);
        }

        // Send to error tracking service (e.g., Sentry)
        if (typeof window !== 'undefined') {
          // Log to console for now (can be replaced with Sentry/LogRocket)
          const errorData = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          };

          // Store error for potential reporting
          try {
            const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
            errors.push(errorData);
            // Keep only last 10 errors
            if (errors.length > 10) {
              errors.shift();
            }
            localStorage.setItem('appErrors', JSON.stringify(errors));
          } catch (e) {
            // Ignore localStorage errors
          }

          // Send to error tracking service if available
          if (window.errorReporter) {
            window.errorReporter.captureException(error, {
              contexts: {
                react: {
                  componentStack: errorInfo.componentStack,
                },
              },
              tags: {
                errorBoundary: 'global'
              }
            });
          }

          // Send to Sentry if available
          if (window.Sentry) {
            window.Sentry.captureException(error, {
              contexts: {
                react: {
                  componentStack: errorInfo.componentStack,
                },
              },
              tags: {
                errorBoundary: 'global'
              }
            });
          }
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

