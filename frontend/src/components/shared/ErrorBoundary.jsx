"use client";

import { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error boundary component that catches JavaScript errors in child components
 * Includes error reporting and user-friendly fallback UI
 * 
 * @component
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback UI
 * <ErrorBoundary fallback={CustomError}>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With error reporting callback
 * <ErrorBoundary onError={(error, errorInfo) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Increment error count
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1
    }));

    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error caught by ErrorBoundary:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (e.g., Sentry, LogRocket)
    if (typeof window !== 'undefined' && window.errorReporter) {
      window.errorReporter.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  /**
   * Default fallback UI when an error occurs
   */
  DefaultFallback = () => {
    const { error, errorInfo, errorCount } = this.state;
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
      <div
        role="alert"
        className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
      >
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle 
                className="h-12 w-12 text-red-600" 
                aria-hidden="true" 
              />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-center text-gray-600">
            {isDevelopment && error?.message
              ? error.message
              : 'We encountered an unexpected error. Please try again.'}
          </p>

          {/* Error Count Warning */}
          {errorCount > 2 && (
            <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Multiple errors detected.</strong> If this issue persists, 
                please try refreshing the page or contact support.
              </p>
            </div>
          )}

          {/* Development Error Details */}
          {isDevelopment && (
            <details className="mt-6 rounded-md bg-gray-50 p-4">
              <summary className="cursor-pointer font-medium text-gray-700">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <h3 className="font-semibold text-sm text-gray-700">Error:</h3>
                  <pre className="mt-1 overflow-auto rounded bg-red-50 p-2 text-xs text-red-900">
                    {error?.toString()}
                  </pre>
                </div>
                {errorInfo?.componentStack && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700">
                      Component Stack:
                    </h3>
                    <pre className="mt-1 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-800">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button 
              onClick={this.resetError}
              variant="primary"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={this.reloadPage}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Reload Page
            </Button>

            <Button 
              onClick={this.goHome}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Need help?{' '}
            <a 
              href="/contact" 
              className="font-medium text-primary hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it; otherwise use default
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
          />
        );
      }
      
      return <this.DefaultFallback />;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** Content to be rendered */
  children: PropTypes.node.isRequired,
  /** Optional custom fallback component to render when an error occurs */
  fallback: PropTypes.elementType,
  /** Optional callback function called when an error is caught */
  onError: PropTypes.func
};

export default ErrorBoundary;