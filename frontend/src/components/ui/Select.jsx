import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Select Component
 * 
 * A custom dropdown select component with keyboard navigation and accessibility
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of option objects [{value, label}] or strings
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Input label
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.error - Error state
 * @param {string} props.errorMessage - Error message text
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * <Select
 *   options={[
 *     { value: 'lawn', label: 'Lawn' },
 *     { value: 'chiffon', label: 'Chiffon' }
 *   ]}
 *   value={fabric}
 *   onChange={setFabric}
 *   label="Select Fabric"
 *   placeholder="Choose fabric type"
 * />
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options to always have value/label structure
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(normalizedOptions[focusedIndex]);
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < normalizedOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;
      case 'Tab':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const baseClasses = `
    w-full rounded-lg border transition-all duration-200 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-[#D946A6] focus:ring-offset-2
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-[#D946A6]'}
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${sizeClasses[size]}
  `;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      
      <div
        className={baseClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-invalid={error}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          ref={listRef}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No options available
            </div>
          ) : (
            normalizedOptions.map((option, index) => (
              <div
                key={option.value}
                className={`
                  px-4 py-2.5 cursor-pointer transition-colors duration-150
                  flex items-center justify-between
                  ${focusedIndex === index ? 'bg-purple-50' : ''}
                  ${value === option.value ? 'bg-purple-50 text-[#D946A6]' : 'text-gray-900'}
                  hover:bg-purple-50
                `}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                role="option"
                aria-selected={value === option.value}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-5 h-5 text-[#D946A6]" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {error && errorMessage && (
        <p className="mt-1.5 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

// Demo Component
const SelectDemo = () => {
  const [fabric, setFabric] = useState('');
  const [city, setCity] = useState('lahore');
  const [size, setSize] = useState('');

  const fabricOptions = [
    { value: 'lawn', label: 'Lawn' },
    { value: 'chiffon', label: 'Chiffon' },
    { value: 'silk', label: 'Silk' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'velvet', label: 'Velvet' },
    { value: 'organza', label: 'Organza' }
  ];

  const cityOptions = [
    { value: 'lahore', label: 'Lahore' },
    { value: 'karachi', label: 'Karachi' },
    { value: 'islamabad', label: 'Islamabad' },
    { value: 'faisalabad', label: 'Faisalabad' },
    { value: 'multan', label: 'Multan' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Select Component
          </h1>
          <p className="text-gray-600">
            Custom dropdown with keyboard navigation and accessibility
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Default Select */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Default Select
            </h3>
            <Select
              options={fabricOptions}
              value={fabric}
              onChange={setFabric}
              label="Select Fabric Type"
              placeholder="Choose your fabric"
            />
            {fabric && (
              <p className="mt-3 text-sm text-gray-600">
                Selected: <span className="font-medium text-[#D946A6]">{fabric}</span>
              </p>
            )}
          </div>

          {/* With Value */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              With Default Value
            </h3>
            <Select
              options={cityOptions}
              value={city}
              onChange={setCity}
              label="Delivery City"
            />
            <p className="mt-3 text-sm text-gray-600">
              Current: <span className="font-medium text-[#D946A6]">{city}</span>
            </p>
          </div>

          {/* Size Variants */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Size Variants
            </h3>
            <div className="space-y-4">
              <Select
                options={['Small', 'Medium', 'Large']}
                value={size}
                onChange={setSize}
                placeholder="Small select"
                size="sm"
              />
              <Select
                options={['Small', 'Medium', 'Large']}
                value={size}
                onChange={setSize}
                placeholder="Medium select"
                size="md"
              />
              <Select
                options={['Small', 'Medium', 'Large']}
                value={size}
                onChange={setSize}
                placeholder="Large select"
                size="lg"
              />
            </div>
          </div>

          {/* States */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              States
            </h3>
            <div className="space-y-4">
              <Select
                options={fabricOptions}
                placeholder="Disabled select"
                disabled
                label="Disabled"
              />
              <Select
                options={fabricOptions}
                placeholder="With error"
                error
                errorMessage="Please select a fabric type"
                label="With Error"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Full keyboard navigation (Arrow keys, Enter, Escape, Tab)</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Accessible with ARIA attributes</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Click outside to close</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Scroll focused item into view</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Multiple size variants</span>
            </li>
            <li className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Error and disabled states</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SelectDemo;