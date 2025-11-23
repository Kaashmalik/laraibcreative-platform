'use client';


/**
 * App-Level Error Boundary
 * Wraps the entire application to catch errors
 * 
 * @module components/shared/AppErrorBoundary
 */

import { ErrorBoundary } from './ErrorBoundary';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Application-wide error boundary
 * Use this in your root layout or app component
 */
export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      showRetry={true}
      onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('App Error:', error, errorInfo);
        
        // Send to error tracking (e.g., Sentry)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default AppErrorBoundary;

