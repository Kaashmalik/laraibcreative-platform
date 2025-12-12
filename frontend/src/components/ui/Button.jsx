'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button Component - Reusable button with multiple variants and states
 * * @component
 * @example
 * // Primary button
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * * // Secondary button with icon
 * * <Button variant="secondary" leftIcon={<Icon />}>
 *   With Icon
 * </Button>
 * * // Loading state
 * <Button isLoading>Processing...</Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  loading = false, // Alias for isLoading to prevent DOM warning
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...rest
}) => {
  // Support both loading and isLoading props
  const showLoading = isLoading || loading;
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
 // Added missing 'outline' variant from CartPage.js usage
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
      disabled={disabled || showLoading}
      onClick={onClick}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={showLoading}
      {...rest}
    >
      {showLoading && <LoadingSpinner />}
      {!showLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {!showLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Visual style variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success', 'outline']), // Added 'outline' for CartPage usage
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

export default Button;
export { Button };