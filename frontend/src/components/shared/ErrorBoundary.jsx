import { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Error boundary component that catches JavaScript errors in child components
 * @component
 * @example
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback UI
 * <ErrorBoundary
 *   fallback={<CustomError />}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  /**
   * Default fallback UI when an error occurs
   */
  DefaultFallback = () => (
    <div
      role="alert"
      className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center"
    >
      <AlertTriangle className="h-16 w-16 text-red-500" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="max-w-md text-gray-600">
        {this.state.error?.message || 'An unexpected error occurred.'}
      </p>
      <Button 
        onClick={this.resetError}
        variant="primary"
        className="mt-4"
      >
        Try Again
      </Button>
    </div>
  );

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it; otherwise use default
      return this.props.fallback ? (
        <this.props.fallback 
          error={this.state.error}
          resetError={this.resetError}
        />
      ) : (
        <this.DefaultFallback />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /** Content to be rendered */
  children: PropTypes.node.isRequired,
  /** Optional custom fallback component to render when an error occurs */
  fallback: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element
  ])
};

export default ErrorBoundary;
