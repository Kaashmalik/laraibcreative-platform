import React, { useState } from 'react';
import { Check, Minus } from 'lucide-react';

/**
 * Checkbox Component
 * 
 * Custom checkbox with indeterminate state support
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.indeterminate - Indeterminate state (for parent checkboxes)
 * @param {string} props.label - Checkbox label
 * @param {string} props.description - Description text below label
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Checkbox
 *   checked={agreedToTerms}
 *   onChange={setAgreedToTerms}
 *   label="I agree to terms and conditions"
 *   required
 * />
 */
const Checkbox = ({
  checked = false,
  onChange,
  indeterminate = false,
  label,
  description,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  return (
    <label 
      className={`flex items-start cursor-pointer group ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-invalid={error}
          {...props}
        />
        <div
          className={`
            ${sizeClasses[size]} rounded border-2 transition-all duration-200
            flex items-center justify-center
            ${checked || indeterminate
              ? 'bg-[#D946A6] border-[#D946A6]'
              : error
              ? 'border-red-500 bg-white'
              : 'border-gray-300 bg-white group-hover:border-[#D946A6]'
            }
            ${!disabled && 'group-hover:shadow-sm'}
            focus-within:ring-2 focus-within:ring-[#D946A6] focus-within:ring-offset-2
          `}
        >
          {indeterminate ? (
            <Minus className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
          ) : checked ? (
            <Check className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-white`} />
          ) : null}
        </div>
      </div>

      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <span className={`${labelSizeClasses[size]} font-medium text-gray-900 block`}>
              {label}
            </span>
          )}
          {description && (
            <span className="text-sm text-gray-500 block mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
