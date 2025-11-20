'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Switch Component
 * 
 * Toggle switch with customizable appearance
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - Size: 'sm', 'md', 'lg'
 * @param {string} props.variant - Variant: 'primary', 'secondary', 'success', 'danger'
 * @param {string} props.label - Label text
 * @param {string} props.description - Description text
 * @param {string} props.labelPosition - Label position: 'left', 'right'
 * @param {ReactNode} props.icon - Icon when checked
 * @param {boolean} props.loading - Loading state
 * 
 * @example
 * <Switch
 *   checked={darkMode}
 *   onChange={setDarkMode}
 *   label="Dark Mode"
 *   icon={<Moon className="w-3 h-3" />}
 * />
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'primary',
  label,
  description,
  labelPosition = 'right',
  icon,
  loading = false,
  className = ''
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled || loading) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const sizes = {
    sm: { 
      track: 'w-8 h-4', 
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: { 
      track: 'w-11 h-6', 
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: { 
      track: 'w-14 h-7', 
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const variants = {
    primary: 'bg-[#D946A6]',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    success: 'bg-green-500',
    danger: 'bg-red-500'
  };

  const SwitchElement = (
    <button
      role="switch"
      type="button"
      aria-checked={isChecked}
      aria-label={label}
      disabled={disabled || loading}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        relative inline-flex items-center ${sizes[size].track}
        rounded-full transition-colors duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-[#D946A6] focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isChecked ? variants[variant] : 'bg-gray-300 dark:bg-gray-600'}
      `}
    >
      <span
        className={`
          inline-block ${sizes[size].thumb} rounded-full
          bg-white shadow-md transform transition-transform duration-200 ease-out
          flex items-center justify-center
          ${isChecked ? sizes[size].translate : 'translate-x-0.5'}
        `}
      >
        {loading ? (
          <div className="w-2 h-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          icon && isChecked && (
            <span className="text-[#D946A6]">
              {icon}
            </span>
          )
        )}
      </span>
    </button>
  );

  if (!label && !description) {
    return <div className={className}>{SwitchElement}</div>;
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {labelPosition === 'left' && (
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}

      {SwitchElement}

      {labelPosition === 'right' && (
        <div className="flex-1">
          {label && (
            <label 
              className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger']),
  label: PropTypes.string,
  description: PropTypes.string,
  labelPosition: PropTypes.oneOf(['left', 'right']),
  icon: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default Switch;
