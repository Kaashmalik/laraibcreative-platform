import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Toast Notification System
 * 
 * @example
 * // In your app root
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // In any component
 * const { showToast } = useToast();
 * showToast('Success!', 'success');
 * showToast('Error occurred', 'error');
 * showToast('Warning message', 'warning');
 * showToast('Info message', 'info');
 */

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Single Toast Component
const Toast = ({ id, message, type, duration, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  return (
    <div
      className={`
        flex items-start gap-3 min-w-[300px] max-w-md p-4 rounded-lg border-2 shadow-lg
        transition-all duration-300 ease-out
        ${styles[type]}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconColors[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1 text-sm font-medium pr-2">
        {message}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={closeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Demo Component
const ToastDemo = () => {
  const { showToast } = useToast();

  const examples = [
    {
      label: 'Success Toast',
      message: 'Order placed successfully!',
      type: 'success',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Error Toast',
      message: 'Failed to process payment',
      type: 'error',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Warning Toast',
      message: 'Your session will expire soon',
      type: 'warning',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      label: 'Info Toast',
      message: 'New collection available now',
      type: 'info',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];

  const useCases = [
    {
      scenario: 'Add to Cart',
      message: 'Product added to cart',
      type: 'success',
    },
    {
      scenario: 'Remove from Cart',
      message: 'Product removed from cart',
      type: 'info',
    },
    {
      scenario: 'Order Confirmed',
      message: 'Order #LC-2025-001 confirmed',
      type: 'success',
    },
    {
      scenario: 'Payment Error',
      message: 'Payment verification failed',
      type: 'error',
    },
    {
      scenario: 'Form Validation',
      message: 'Please fill all required fields',
      type: 'warning',
    },
    {
      scenario: 'Network Error',
      message: 'Connection lost. Please try again',
      type: 'error',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Toast Notification System
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready toast notifications for LaraibCreative platform
          </p>

          {/* Basic Types */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {examples.map(({ label, message, type, color }) => (
                <button
                  key={type}
                  onClick={() => showToast(message, type)}
                  className={`px-6 py-4 ${color} text-white rounded-lg font-medium transition-all hover:shadow-lg transform hover:scale-105`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Auto-dismiss after 4 seconds',
                'Manual close button',
                'Smooth slide-in animations',
                'Stack multiple notifications',
                'Color-coded by type',
                'Accessible (ARIA labels)',
                'Customizable duration',
                'Position: top-right (configurable)',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Real-world Use Cases */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">E-commerce Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map(({ scenario, message, type }) => (
                <button
                  key={scenario}
                  onClick={() => showToast(message, type)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      type === 'success' ? 'bg-green-500' :
                      type === 'error' ? 'bg-red-500' :
                      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                      {scenario}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 ml-4">{message}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Multiple Toasts Demo */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Stack Multiple Notifications</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  showToast('Step 1: Product added to cart', 'success', 3000);
                  setTimeout(() => showToast('Step 2: Proceeding to checkout', 'info', 3000), 500);
                  setTimeout(() => showToast('Step 3: Order confirmed!', 'success', 3000), 1000);
                }}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Show Order Flow
              </button>

              <button
                onClick={() => {
                  showToast('Checking inventory...', 'info', 2000);
                  setTimeout(() => showToast('Item is in stock!', 'success', 3000), 2000);
                }}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
              >
                Stock Check Demo
              </button>

              <button
                onClick={() => {
                  showToast('Uploading image...', 'info', 2000);
                  setTimeout(() => showToast('Upload failed. File too large', 'error', 4000), 2000);
                }}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Upload Error Demo
              </button>
            </div>
          </section>

          {/* Custom Duration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Duration</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => showToast('Quick message (2s)', 'info', 2000)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                2 Seconds
              </button>
              <button
                onClick={() => showToast('Normal duration (4s)', 'info', 4000)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                4 Seconds (Default)
              </button>
              <button
                onClick={() => showToast('Longer message (8s)', 'info', 8000)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                8 Seconds
              </button>
            </div>
          </section>
        </div>

        {/* Usage Documentation */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// 1. Wrap your app with ToastProvider
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

// 2. Use in any component
import { useToast } from './components/ui/Toast';

function ProductPage() {
  const { showToast } = useToast();

  const addToCart = () => {
    // Add product logic...
    showToast('Product added to cart!', 'success');
  };

  const handleError = () => {
    showToast('Failed to load product', 'error');
  };

  const showWarning = () => {
    showToast('Stock running low', 'warning', 5000); // 5 seconds
  };

  return (
    <button onClick={addToCart}>Add to Cart</button>
  );
}

// Common patterns for LaraibCreative:

// Order confirmation
showToast('Order #LC-2025-001 confirmed', 'success');

// Payment verification
showToast('Payment receipt uploaded successfully', 'success');

// Form validation
showToast('Please fill all required fields', 'warning');

// Network errors
showToast('Connection failed. Please try again', 'error');

// Info messages
showToast('New collection arriving soon!', 'info');

// Cart actions
showToast('Product removed from cart', 'info');

// Wishlist
showToast('Added to wishlist ❤️', 'success', 3000);`}
          </pre>
        </div>

        {/* Integration Tips */}
        <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Integration Tips</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <strong>Keep messages short:</strong> Aim for 1-2 lines max for better readability
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong>Use appropriate types:</strong> Success for confirmations, Error for failures, Warning for cautions, Info for neutral updates
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <strong>Adjust duration wisely:</strong> Longer messages need more time (5-8s), quick actions need less (2-3s)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong>User actions:</strong> Always show feedback for user actions (add to cart, form submission, etc.)
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚫</span>
              <div>
                <strong>Avoid spam:</strong> Don't show multiple toasts for the same action in quick succession
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap demo in provider
const ToastDemoWithProvider = () => (
  <ToastProvider>
    <ToastDemo />
  </ToastProvider>
);

export default ToastDemoWithProvider;