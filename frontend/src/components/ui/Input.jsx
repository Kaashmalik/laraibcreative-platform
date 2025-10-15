import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Input Component - Reusable text input with validation and states
 * 
 * @component
 * @example
 * // Basic input
 * <Input 
 *   label="Email" 
 *   type="email" 
 *   placeholder="Enter your email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * 
 * // With error
 * <Input 
 *   label="Phone" 
 *   error="Please enter a valid phone number"
 *   required
 * />
 * 
 * // With icon
 * <Input 
 *   label="Search" 
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search products..."
 * />
 */
const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  onFocus,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  readOnly = false,
  leftIcon = null,
  rightIcon = null,
  rightElement = null,
  className = '',
  inputClassName = '',
  name,
  id,
  autoComplete,
  maxLength,
  pattern,
  min,
  max,
  step,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Base styles
  const containerStyles = `relative ${className}`;

  const labelStyles = `
    block text-sm font-medium mb-1.5
    ${hasError ? 'text-red-600' : 'text-gray-700'}
    ${disabled ? 'text-gray-400' : ''}
  `;

  const inputWrapperStyles = `
    relative flex items-center
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  const baseInputStyles = `
    w-full px-4 py-2.5 text-base
    border-2 rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${leftIcon ? 'pl-11' : ''}
    ${rightIcon || rightElement || type === 'password' ? 'pr-11' : ''}
    ${inputClassName}
  `;

  const inputStateStyles = hasError
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
    : isFocused
    ? 'border-pink-500 ring-pink-500 bg-white shadow-sm'
    : 'border-gray-300 hover:border-gray-400 bg-white';

  const iconStyles = 'absolute top-1/2 -translate-y-1/2 text-gray-400';

  // Password visibility toggle
  const PasswordToggle = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      tabIndex={-1}
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className={containerStyles}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className={inputWrapperStyles}>
        {/* Left icon */}
        {leftIcon && (
          <span className={`${iconStyles} left-3`}>
            {leftIcon}
          </span>
        )}

        {/* Input field */}
        <input
          id={inputId}
          name={name}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          min={min}
          max={max}
          step={step}
          className={`${baseInputStyles} ${inputStateStyles}`}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...rest}
        />

        {/* Right icon or element */}
        {type === 'password' && <PasswordToggle />}
        {type !== 'password' && rightIcon && (
          <span className={`${iconStyles} right-3`}>
            {rightIcon}
          </span>
        )}
        {type !== 'password' && rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Helper text or error */}
      {(helperText || error) && (
        <p
          id={hasError ? `${inputId}-error` : `${inputId}-helper`}
          className={`mt-1.5 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}
        >
          {hasError ? error : helperText}
        </p>
      )}

      {/* Character count (if maxLength is set) */}
      {maxLength && value && (
        <p className="mt-1 text-xs text-gray-400 text-right">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  /** Input label */
  label: PropTypes.string,
  /** Input type */
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date']),
  /** Placeholder text */
  placeholder: PropTypes.string,
  /** Input value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Change handler */
  onChange: PropTypes.func,
  /** Blur handler */
  onBlur: PropTypes.func,
  /** Focus handler */
  onFocus: PropTypes.func,
  /** Error message */
  error: PropTypes.string,
  /** Helper text */
  helperText: PropTypes.string,
  /** Required field */
  required: PropTypes.bool,
  /** Disabled state */
  disabled: PropTypes.bool,
  /** Read-only state */
  readOnly: PropTypes.bool,
  /** Icon on the left */
  leftIcon: PropTypes.node,
  /** Icon on the right */
  rightIcon: PropTypes.node,
  /** Custom element on the right */
  rightElement: PropTypes.node,
  /** Container class name */
  className: PropTypes.string,
  /** Input class name */
  inputClassName: PropTypes.string,
  /** Input name */
  name: PropTypes.string,
  /** Input id */
  id: PropTypes.string,
  /** Autocomplete attribute */
  autoComplete: PropTypes.string,
  /** Max length */
  maxLength: PropTypes.number,
  /** Pattern for validation */
  pattern: PropTypes.string,
  /** Min value (for number type) */
  min: PropTypes.number,
  /** Max value (for number type) */
  max: PropTypes.number,
  /** Step value (for number type) */
  step: PropTypes.number,
};

// Demo component
const InputDemo = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    price: '',
    search: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleBlur = (field) => () => {
    // Validation on blur
    if (field === 'email' && formData.email && !formData.email.includes('@')) {
      setErrors({ ...errors, email: 'Please enter a valid email address' });
    }
    if (field === 'phone' && formData.phone && formData.phone.length < 10) {
      setErrors({ ...errors, phone: 'Phone number must be at least 10 digits' });
    }
  };

  // Icons
  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const MailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const PhoneIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Input Component Library
          </h1>
          <p className="text-gray-600 mb-8">
            Production-ready input fields for LaraibCreative platform
          </p>

          {/* Basic Inputs */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Inputs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                error={errors.email}
                required
              />
            </div>
          </section>

          {/* With Icons */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">With Icons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Search Products"
                type="search"
                placeholder="Search for suits..."
                leftIcon={<SearchIcon />}
                value={formData.search}
                onChange={handleChange('search')}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+92 300 1234567"
                leftIcon={<PhoneIcon />}
                value={formData.phone}
                onChange={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={errors.phone}
                helperText="Enter your WhatsApp number"
              />
            </div>
          </section>

          {/* Password */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Password Field</h2>
            <div className="max-w-md">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange('password')}
                helperText="Must be at least 8 characters"
                required
              />
            </div>
          </section>

          {/* Number Input */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Number Input</h2>
            <div className="max-w-md">
              <Input
                label="Price Range"
                type="number"
                placeholder="5000"
                value={formData.price}
                onChange={handleChange('price')}
                min={0}
                step={100}
                rightElement={<span className="text-gray-500 font-medium">PKR</span>}
              />
            </div>
          </section>

          {/* States */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Disabled Input"
                type="text"
                value="Cannot edit this"
                disabled
              />
              <Input
                label="Read-only Input"
                type="text"
                value="Can select but not edit"
                readOnly
              />
            </div>
          </section>

          {/* With Character Count */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">With Character Count</h2>
            <div className="max-w-md">
              <Input
                label="Product Title"
                type="text"
                placeholder="Enter product title"
                maxLength={50}
                value={formData.name}
                onChange={handleChange('name')}
                helperText="Keep it short and descriptive"
              />
            </div>
          </section>

          {/* Form Example */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Form Example</h2>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-xl">
              <form className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  leftIcon={<UserIcon />}
                  placeholder="Laraib Khan"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  leftIcon={<MailIcon />}
                  placeholder="laraib@example.com"
                  required
                />
                <Input
                  label="Phone/WhatsApp"
                  type="tel"
                  leftIcon={<PhoneIcon />}
                  placeholder="+92 300 1234567"
                  helperText="We'll send order updates on WhatsApp"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </form>
            </div>
          </section>
        </div>

        {/* Usage Code */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-gray-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-3 text-pink-400">Usage Examples</h3>
          <pre className="text-sm">
{`// Basic input
<Input 
  label="Email" 
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// With icon and validation
<Input 
  label="Phone Number"
  type="tel"
  leftIcon={<PhoneIcon />}
  value={phone}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.phone}
  helperText="Enter your WhatsApp number"
/>

// Password with toggle
<Input 
  label="Password"
  type="password"
  placeholder="Enter password"
  required
/>

// With character count
<Input 
  label="Description"
  maxLength={100}
  value={description}
  onChange={handleChange}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InputDemo;