'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Props for DynamicErrorBoundary
 */
interface DynamicErrorBoundaryProps {
  children: ReactNode;
  /** Component name for error message */
  componentName?: string;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
}

/**
 * State for DynamicErrorBoundary
 */
interface DynamicErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for Dynamically Imported Components
 * 
 * Catches errors in dynamically loaded components and displays
 * a user-friendly error message with retry option.
 * 
 * @example
 * ```tsx
 * <DynamicErrorBoundary componentName="CustomOrderPage">
 *   <DynamicCustomOrderPage />
 * </DynamicErrorBoundary>
 * ```
 */
export class DynamicErrorBoundary extends Component<
  DynamicErrorBoundaryProps,
  DynamicErrorBoundaryState
> {
  constructor(props: DynamicErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DynamicErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[DynamicErrorBoundary] Error caught:', error);
      console.error('[DynamicErrorBoundary] Error info:', errorInfo);
    }

    // Log to error tracking service in production
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Force page reload as last resort
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentName = this.props.componentName || 'Component';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg border border-red-200 shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Failed to Load {componentName}
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading this component. Please try again.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-50 rounded p-3 text-xs font-mono text-red-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-2 text-gray-500">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.props.showRetry !== false && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              )}
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <DynamicErrorBoundary componentName={componentName}>
        <Component {...props} />
      </DynamicErrorBoundary>
    );
  };
}

