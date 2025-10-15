import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component - Reusable button with multiple variants and states
 * 
 * @component
 * @example
 * // Primary button
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * // Secondary button with icon
 * <Button variant="secondary" leftIcon={<Icon />}>
 *   With Icon
 * </Button>
 * 
 * // Loading state
 * <Button isLoading>Processing...</Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...rest
}) => {
  // Base styles - mobile-first approach
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  // Variant styles
  const variants = {
    primary: `
      bg-gradient-to-r from-pink-500 to-purple-600
      text-white shadow-md
      hover:shadow-lg hover:scale-[1.02]
      active:scale-[0.98]
      focus:ring-pink-500
      disabled:hover:scale-100
    `,
    secondary: `
      bg-white border-2 border-pink-500
      text-pink-500
      hover:bg-pink-50 hover:shadow-md
      active:scale-[0.98]
      focus:ring-pink-500
    `,
    ghost: `
      bg-transparent
      text-gray-700
      hover:bg-gray-100
      active:bg-gray-200
      focus:ring-gray-400
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 hover:shadow-md
      active:scale-[0.98]
      focus:ring-red-500
    `,
    success: `
      bg-green-500 text-white
      hover:bg-green-600 hover:shadow-md
      active:scale-[0.98]
      focus:ring-green-500
    `
  };

  // Size styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2.5 text-base rounded-lg gap-2',
    lg: 'px-6 py-3.5 text-lg rounded-lg gap-2.5'
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Visual style variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Make button full width */
  fullWidth: PropTypes.bool,
  /** Disable button */
  disabled: PropTypes.bool,
  /** Show loading state */
  isLoading: PropTypes.bool,
  /** Icon on the left side */
  leftIcon: PropTypes.node,
  /** Icon on the right side */
  rightIcon: PropTypes.node,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button type attribute */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessibility label */
  ariaLabel: PropTypes.string,
};

// Demo component
const ButtonDemo = () => {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const HeartIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );

  const ArrowIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Button Component Library
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready buttons for LaraibCreative platform
          </p>

          {/* Variants */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="success">Success Button</Button>
            </div>
          </section>

          {/* Sizes */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          {/* With Icons */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">With Icons</h2>
            <div className="flex flex-wrap gap-4">
              <Button leftIcon={<HeartIcon />}>Add to Wishlist</Button>
              <Button variant="secondary" rightIcon={<ArrowIcon />}>
                Browse Products
              </Button>
              <Button variant="ghost" leftIcon={<HeartIcon />} rightIcon={<ArrowIcon />}>
                Both Sides
              </Button>
            </div>
          </section>

          {/* States */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">States</h2>
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled Button</Button>
              <Button isLoading={loading} onClick={handleClick}>
                {loading ? 'Processing...' : 'Click to Load'}
              </Button>
              <Button variant="secondary" isLoading>
                Loading...
              </Button>
            </div>
          </section>

          {/* Full Width */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Full Width</h2>
            <div className="max-w-md">
              <Button fullWidth className="mb-3">Proceed to Checkout</Button>
              <Button variant="secondary" fullWidth>Continue Shopping</Button>
            </div>
          </section>

          {/* Responsive Example */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Responsive (Full width on mobile)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button fullWidth className="md:w-auto">
                Start Custom Order
              </Button>
              <Button variant="secondary" fullWidth className="md:w-auto">
                Browse Collections
              </Button>
            </div>
          </section>
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic button
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

// With icons
<Button 
  variant="secondary" 
  leftIcon={<Icon />}
  rightIcon={<ArrowIcon />}
>
  Browse Products
</Button>

// Loading state
<Button isLoading={isProcessing}>
  {isProcessing ? 'Processing...' : 'Submit Order'}
</Button>

// Full width responsive
<Button 
  fullWidth 
  className="md:w-auto"
>
  Checkout
</Button>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ButtonDemo;