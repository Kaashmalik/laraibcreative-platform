import React from 'react';
import PropTypes from 'prop-types';

/**
 * Spinner Component - Loading indicators with multiple variants
 * 
 * @component
 * @example
 * // Basic spinner
 * <Spinner />
 * 
 * // With size and color
 * <Spinner size="lg" color="primary" />
 * 
 * // Full page loading
 * <FullPageSpinner message="Loading products..." />
 * 
 * // Button spinner
 * <Spinner size="sm" color="white" />
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  variant = 'circular',
  className = '',
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'border-pink-500',
    secondary: 'border-purple-500',
    white: 'border-white',
    gray: 'border-gray-500',
    success: 'border-green-500',
    error: 'border-red-500',
  };

  const borderWidths = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-3',
    xl: 'border-4',
  };

  if (variant === 'circular') {
    return (
      <div
        className={`
          ${sizes[size]} ${borderWidths[size]}
          border-t-transparent ${colors[color]}
          rounded-full animate-spin
          ${className}
        `}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === 'dots') {
    const dotColor = colors[color].replace('border-', 'bg-');
    const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : 
                    size === 'sm' ? 'w-2 h-2' : 
                    size === 'md' ? 'w-3 h-3' : 
                    size === 'lg' ? 'w-4 h-4' : 'w-5 h-5';

    return (
      <div className={`flex gap-2 ${className}`} role="status" aria-label="Loading">
        <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`${dotSize} ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    const pulseColor = colors[color].replace('border-', 'bg-');
    return (
      <div
        className={`
          ${sizes[size]} ${pulseColor}
          rounded-full animate-pulse
          ${className}
        `}
        role="status"
        aria-label="Loading"
      />
    );
  }

  return null;
};

Spinner.propTypes = {
  /** Spinner size */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  /** Spinner color */
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']),
  /** Spinner variant */
  variant: PropTypes.oneOf(['circular', 'dots', 'pulse']),
  /** Additional classes */
  className: PropTypes.string,
};

// Full Page Spinner
const FullPageSpinner = ({ 
  message = 'Loading...', 
  size = 'xl',
  color = 'primary',
  backdrop = true,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {backdrop && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
    )}
    <div className="relative flex flex-col items-center gap-4">
      <Spinner size={size} color={color} />
      {message && (
        <p className="text-gray-700 font-medium animate-pulse">{message}</p>
      )}
    </div>
  </div>
);

FullPageSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']),
  backdrop: PropTypes.bool,
};

// Inline Spinner (with text)
const InlineSpinner = ({ 
  message = 'Loading...', 
  size = 'sm',
  color = 'primary',
  className = '',
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Spinner size={size} color={color} />
    <span className="text-gray-600">{message}</span>
  </div>
);

InlineSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'success', 'error']),
  className: PropTypes.string,
};

// Card Loading Overlay
const CardLoadingOverlay = ({ message = 'Loading...' }) => (
  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
    <div className="flex flex-col items-center gap-3">
      <Spinner size="lg" color="primary" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

CardLoadingOverlay.propTypes = {
  message: PropTypes.string,
};

// Demo Component
const SpinnerDemo = () => {
  const [loadingStates, setLoadingStates] = React.useState({
    fullPage: false,
    card1: false,
    card2: false,
    button: false,
  });

  const simulateLoading = (key, duration = 2000) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, duration);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Spinner Component Library
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready loading indicators for LaraibCreative platform
          </p>

          {/* Sizes */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sizes</h2>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner size="xs" />
                <span className="text-xs text-gray-500">XS</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs text-gray-500">SM</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="md" />
                <span className="text-xs text-gray-500">MD</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="lg" />
                <span className="text-xs text-gray-500">LG</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner size="xl" />
                <span className="text-xs text-gray-500">XL</span>
              </div>
            </div>
          </section>

          {/* Colors */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Colors</h2>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner color="primary" />
                <span className="text-xs text-gray-500">Primary</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner color="secondary" />
                <span className="text-xs text-gray-500">Secondary</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-lg">
                <Spinner color="white" />
                <span className="text-xs text-gray-300">White</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner color="gray" />
                <span className="text-xs text-gray-500">Gray</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner color="success" />
                <span className="text-xs text-gray-500">Success</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner color="error" />
                <span className="text-xs text-gray-500">Error</span>
              </div>
            </div>
          </section>

          {/* Variants */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Variants</h2>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <Spinner variant="circular" size="lg" />
                <span className="text-sm text-gray-600">Circular</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Spinner variant="dots" size="lg" />
                <span className="text-sm text-gray-600">Dots</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Spinner variant="pulse" size="lg" />
                <span className="text-sm text-gray-600">Pulse</span>
              </div>
            </div>
          </section>

          {/* With Text */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">With Text</h2>
            <div className="space-y-4">
              <InlineSpinner message="Loading products..." />
              <InlineSpinner message="Processing payment..." size="md" />
              <InlineSpinner message="Uploading images..." variant="dots" />
            </div>
          </section>

          {/* In Buttons */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Button States</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => simulateLoading('button', 3000)}
                disabled={loadingStates.button}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-75 flex items-center gap-2"
              >
                {loadingStates.button ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <button
                disabled={loadingStates.button}
                className="px-6 py-3 bg-white border-2 border-pink-500 text-pink-500 rounded-lg font-medium hover:bg-pink-50 transition-colors disabled:opacity-75 flex items-center gap-2"
              >
                {loadingStates.button ? (
                  <>
                    <Spinner size="sm" color="primary" />
                    Loading...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>

              <button
                disabled={loadingStates.button}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-75 flex items-center gap-2"
              >
                {loadingStates.button ? (
                  <>
                    <Spinner size="sm" color="white" variant="dots" />
                    Uploading...
                  </>
                ) : (
                  'Upload Files'
                )}
              </button>
            </div>
          </section>

          {/* Card Overlay */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card Loading Overlay</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 min-h-[200px]">
                <h3 className="font-semibold text-gray-900 mb-2">Product Card</h3>
                <p className="text-gray-600">This card can show a loading overlay</p>
                <button
                  onClick={() => simulateLoading('card1', 2000)}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Load Data
                </button>
                {loadingStates.card1 && <CardLoadingOverlay message="Loading product..." />}
              </div>

              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 min-h-[200px]">
                <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                <p className="text-gray-600">Fetch order information with overlay</p>
                <button
                  onClick={() => simulateLoading('card2', 2000)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Refresh
                </button>
                {loadingStates.card2 && <CardLoadingOverlay message="Fetching order..." />}
              </div>
            </div>
          </section>

          {/* Full Page Demo */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Full Page Loading</h2>
            <button
              onClick={() => simulateLoading('fullPage', 3000)}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
            >
              Show Full Page Loader
            </button>
          </section>
        </div>

        {/* Use Cases */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Page Load', spinner: <Spinner size="xl" />, desc: 'Initial page loading' },
              { title: 'Button Action', spinner: <Spinner size="sm" color="white" />, desc: 'Form submission' },
              { title: 'Data Fetch', spinner: <Spinner variant="dots" />, desc: 'API calls' },
              { title: 'File Upload', spinner: <Spinner color="success" />, desc: 'Image uploads' },
              { title: 'Search', spinner: <Spinner size="sm" />, desc: 'Search results' },
              { title: 'Infinite Scroll', spinner: <Spinner variant="pulse" />, desc: 'Load more items' },
            ].map((item, i) => (
              <div key={i} className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  {item.spinner}
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic spinner
<Spinner />

// Custom size and color
<Spinner size="lg" color="primary" />

// Different variants
<Spinner variant="circular" />
<Spinner variant="dots" />
<Spinner variant="pulse" />

// In buttons
<button disabled={loading}>
  {loading ? (
    <>
      <Spinner size="sm" color="white" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>

// Inline with text
<InlineSpinner message="Loading products..." />

// Full page loading
{isLoading && (
  <FullPageSpinner message="Loading products..." />
)}

// Card overlay
<div className="relative">
  {/* Card content */}
  {loading && <CardLoadingOverlay message="Loading..." />}
</div>

// LaraibCreative examples:

// Product listing
{loadingProducts && <InlineSpinner message="Loading products..." />}

// Add to cart
<button onClick={handleAddToCart} disabled={adding}>
  {adding ? (
    <><Spinner size="sm" color="white" /> Adding...</>
  ) : (
    'Add to Cart'
  )}
</button>

// Order submission
{submitting && (
  <FullPageSpinner message="Processing your order..." />
)}

// Image upload
{uploading && (
  <InlineSpinner 
    message="Uploading reference images..." 
    color="success" 
  />
)}`}
          </pre>
        </div>
      </div>

      {/* Full Page Spinner Demo */}
      {loadingStates.fullPage && (
        <FullPageSpinner 
          message="Loading your custom order details..." 
          size="xl"
        />
      )}
    </div>
  );
};

export { 
  Spinner, 
  FullPageSpinner, 
  InlineSpinner, 
  CardLoadingOverlay 
};

export default SpinnerDemo;