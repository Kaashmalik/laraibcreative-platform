'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Textarea Component
 * 
 * Multi-line text input with character counting and auto-resize
 * 
 * @param {Object} props
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.errorMessage - Error message text
 * @param {string} props.helperText - Helper text below input
 * @param {number} props.maxLength - Maximum character length
 * @param {number} props.rows - Initial number of rows
 * @param {boolean} props.autoResize - Auto-resize based on content
 * @param {boolean} props.showCount - Show character count
 * @param {boolean} props.required - Required field
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.resize - Resize behavior: 'none', 'vertical', 'horizontal', 'both'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Textarea
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   label="Product Description"
 *   placeholder="Enter detailed description..."
 *   maxLength={500}
 *   showCount
 *   autoResize
 * />
 */
const Textarea = ({
  value = '',
  onChange,
  label,
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  helperText,
  maxLength,
  rows = 4,
  autoResize = false,
  showCount = false,
  required = false,
  size = 'md',
  resize = 'vertical',
  className = '',
  ...props
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e) => {
    if (maxLength && e.target.value.length > maxLength) return;
    onChange?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  };

  const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-[#D946A6] focus:ring-offset-2
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
    ${error ? 'border-red-500' : isFocused ? 'border-[#D946A6]' : 'border-gray-300'}
    ${sizeClasses[size]}
    ${resizeClasses[resize]}
  `;

  const charCount = value?.length || 0;
  const isNearLimit = maxLength && charCount >= maxLength * 0.9;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={autoResize ? 1 : rows}
        maxLength={maxLength}
        required={required}
        aria-invalid={error}
        aria-describedby={
          error ? 'error-message' : helperText ? 'helper-text' : undefined
        }
        className={baseClasses}
        {...props}
      />

      {(showCount || maxLength) && (
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex-1">
            {error && errorMessage && (
              <p id="error-message" className="flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errorMessage}
              </p>
            )}
            {!error && helperText && (
              <p id="helper-text" className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          
          {showCount && maxLength && (
            <span 
              className={`text-sm ml-2 ${
                isNearLimit ? 'text-orange-600 font-medium' : 'text-gray-500'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Demo Component
const TextareaDemo = () => {
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('Please add extra buttons on the sleeves');
  const [message, setMessage] = useState('');
  const [autoText, setAutoText] = useState('Type here and watch me grow...');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Textarea Component
          </h1>
          <p className="text-gray-600">
            Multi-line text input with character counting and auto-resize
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Textarea */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Basic Usage
            </h3>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              label="Product Description"
              placeholder="Enter detailed product description..."
              helperText="Provide a clear and detailed description"
            />
          </div>

          {/* With Character Count */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              With Character Count
            </h3>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              label="Special Instructions"
              placeholder="Add any special requirements..."
              maxLength={200}
              showCount
              required
            />
          </div>

          {/* Auto Resize */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Auto Resize
            </h3>
            <Textarea
              value={autoText}
              onChange={(e) => setAutoText(e.target.value)}
              label="Auto-growing Textarea"
              placeholder="Start typing..."
              autoResize
              showCount
              maxLength={500}
              helperText="This textarea grows as you type"
            />
          </div>

          {/* Size Variants */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Size Variants
            </h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Small textarea"
                size="sm"
                rows={2}
              />
              <Textarea
                placeholder="Medium textarea (default)"
                size="md"
                rows={2}
              />
              <Textarea
                placeholder="Large textarea"
                size="lg"
                rows={2}
              />
            </div>
          </div>

          {/* Error State */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Error State
            </h3>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              label="Customer Message"
              placeholder="Enter your message"
              error
              errorMessage="Message is required and must be at least 10 characters"
              required
            />
          </div>

          {/* Disabled State */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Disabled State
            </h3>
            <Textarea
              value="This textarea is disabled"
              label="Disabled Textarea"
              disabled
              helperText="This field cannot be edited"
            />
          </div>

          {/* Resize Options */}
          <div className="bg-white rounded-xl p-6 shadow-md md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Resize Options
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Textarea
                placeholder="No resize"
                resize="none"
                rows={3}
                label="No Resize"
              />
              <Textarea
                placeholder="Vertical resize (default)"
                resize="vertical"
                rows={3}
                label="Vertical Resize"
              />
            </div>
          </div>
        </div>

        {/* Use Case Example */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Custom Order Form Example
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Textarea
              label="Measurement Notes"
              placeholder="Add any specific measurement instructions..."
              rows={4}
              helperText="e.g., 'Prefer loose fitting around waist'"
            />
            <Textarea
              label="Design Preferences"
              placeholder="Describe your design preferences..."
              maxLength={300}
              showCount
              autoResize
              helperText="Be as detailed as possible"
            />
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Auto-resize based on content
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Character count with limit warning
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Multiple size variants
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Configurable resize behavior
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Error and disabled states
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Helper text support
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Accessible with ARIA attributes
              </li>
              <li className="flex items-start">
                <span className="text-[#D946A6] mr-2">✓</span>
                Smooth focus transitions
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Textarea;
export { Textarea };