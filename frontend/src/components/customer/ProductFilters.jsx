'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ProductFilters Component
 * 
 * Advanced filtering sidebar with:
 * - Fabric type selection
 * - Price range slider
 * - Occasion selection
 * - Color palette picker
 * - Availability status
 * - Active filters display
 * - Clear all button
 * - Responsive mobile drawer
 * 
 * @param {Object} initialFilters - Initial filter values from URL
 */
export default function ProductFilters({ initialFilters = {} }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState({
    fabric: initialFilters.fabric || [],
    minPrice: initialFilters.minPrice || 0,
    maxPrice: initialFilters.maxPrice || 50000,
    occasion: initialFilters.occasion || [],
    color: initialFilters.color || [],
    availability: initialFilters.availability || '',
  });

  // Expanded sections state
  const [expanded, setExpanded] = useState({
    fabric: true,
    price: true,
    occasion: true,
    color: true,
    availability: true,
  });

  // Filter options
  const fabricOptions = [
    { value: 'lawn', label: 'Lawn', count: 124 },
    { value: 'chiffon', label: 'Chiffon', count: 89 },
    { value: 'silk', label: 'Silk', count: 67 },
    { value: 'cotton', label: 'Cotton', count: 92 },
    { value: 'velvet', label: 'Velvet', count: 45 },
    { value: 'organza', label: 'Organza', count: 38 },
    { value: 'linen', label: 'Linen', count: 52 },
  ];

  const occasionOptions = [
    { value: 'bridal', label: 'Bridal', icon: '👰' },
    { value: 'party', label: 'Party Wear', icon: '🎉' },
    { value: 'casual', label: 'Casual', icon: '👕' },
    { value: 'formal', label: 'Formal', icon: '💼' },
    { value: 'festive', label: 'Festive', icon: '🎊' },
  ];

  const colorOptions = [
    { value: 'red', hex: '#EF4444', label: 'Red' },
    { value: 'pink', hex: '#EC4899', label: 'Pink' },
    { value: 'purple', hex: '#A855F7', label: 'Purple' },
    { value: 'blue', hex: '#3B82F6', label: 'Blue' },
    { value: 'green', hex: '#10B981', label: 'Green' },
    { value: 'yellow', hex: '#F59E0B', label: 'Yellow' },
    { value: 'black', hex: '#000000', label: 'Black' },
    { value: 'white', hex: '#FFFFFF', label: 'White' },
    { value: 'beige', hex: '#D4C5B9', label: 'Beige' },
    { value: 'gold', hex: '#FFD700', label: 'Gold' },
  ];

  /**
   * Update URL with new filters
   */
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update each filter in URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1
    params.set('page', '1');

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  /**
   * Handle checkbox filter change (fabric, occasion)
   */
  const handleCheckboxChange = (filterType, value) => {
    setFilters(prev => {
      const currentValues = Array.isArray(prev[filterType]) ? prev[filterType] : [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newFilters = { ...prev, [filterType]: newValues };
      updateFilters(newFilters);
      return newFilters;
    });
  };

  /**
   * Handle price range change
   */
  const handlePriceChange = (type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [type]: parseInt(value) };
      return newFilters;
    });
  };

  /**
   * Apply price filter (on mouse up)
   */
  const applyPriceFilter = () => {
    updateFilters(filters);
  };

  /**
   * Handle color selection
   */
  const handleColorChange = (value) => {
    handleCheckboxChange('color', value);
  };

  /**
   * Handle availability change
   */
  const handleAvailabilityChange = (value) => {
    setFilters(prev => {
      const newFilters = { ...prev, availability: prev.availability === value ? '' : value };
      updateFilters(newFilters);
      return newFilters;
    });
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    const clearedFilters = {
      fabric: [],
      minPrice: 0,
      maxPrice: 50000,
      occasion: [],
      color: [],
      availability: '',
    };
    setFilters(clearedFilters);
    router.push('/products');
  };

  /**
   * Toggle section expansion
   */
  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = () => {
    return (
      (Array.isArray(filters.fabric) && filters.fabric.length > 0) ||
      filters.minPrice > 0 ||
      filters.maxPrice < 50000 ||
      (Array.isArray(filters.occasion) && filters.occasion.length > 0) ||
      (Array.isArray(filters.color) && filters.color.length > 0) ||
      filters.availability !== ''
    );
  };

  /**
   * Get active filters count
   */
  const getActiveFiltersCount = () => {
    let count = 0;
    if (Array.isArray(filters.fabric)) count += filters.fabric.length;
    if (Array.isArray(filters.occasion)) count += filters.occasion.length;
    if (Array.isArray(filters.color)) count += filters.color.length;
    if (filters.minPrice > 0 || filters.maxPrice < 50000) count += 1;
    if (filters.availability) count += 1;
    return count;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters() && (
            <span className="px-2 py-1 bg-pink-100 text-pink-600 text-xs font-semibold rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="divide-y divide-gray-200">
        {/* Fabric Type */}
        <FilterSection
          title="Fabric Type"
          isExpanded={expanded.fabric}
          onToggle={() => toggleSection('fabric')}
        >
          <div className="space-y-2">
            {fabricOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={Array.isArray(filters.fabric) && filters.fabric.includes(option.value)}
                    onChange={() => handleCheckboxChange('fabric', option.value)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">({option.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expanded.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="px-4">
            {/* Price display */}
            <div className="flex items-center justify-between mb-4 text-sm font-medium text-gray-900">
              <span>PKR {filters.minPrice.toLocaleString()}</span>
              <span>PKR {filters.maxPrice.toLocaleString()}</span>
            </div>

            {/* Min price slider */}
            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-2">Minimum</label>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                onMouseUp={applyPriceFilter}
                onTouchEnd={applyPriceFilter}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
            </div>

            {/* Max price slider */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Maximum</label>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                onMouseUp={applyPriceFilter}
                onTouchEnd={applyPriceFilter}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
            </div>
          </div>
        </FilterSection>

        {/* Occasion */}
        <FilterSection
          title="Occasion"
          isExpanded={expanded.occasion}
          onToggle={() => toggleSection('occasion')}
        >
          <div className="space-y-2">
            {occasionOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(filters.occasion) && filters.occasion.includes(option.value)}
                  onChange={() => handleCheckboxChange('occasion', option.value)}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
                />
                <span className="text-lg" aria-hidden="true">{option.icon}</span>
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection
          title="Color"
          isExpanded={expanded.color}
          onToggle={() => toggleSection('color')}
        >
          <div className="grid grid-cols-5 gap-3 px-4">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleColorChange(option.value)}
                className={`relative w-full aspect-square rounded-lg transition-all ${
                  Array.isArray(filters.color) && filters.color.includes(option.value)
                    ? 'ring-2 ring-pink-600 ring-offset-2'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: option.hex }}
                aria-label={option.label}
                title={option.label}
              >
                {option.value === 'white' && (
                  <div className="absolute inset-0 border border-gray-300 rounded-lg" />
                )}
                {Array.isArray(filters.color) && filters.color.includes(option.value) && (
                  <svg
                    className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection
          title="Availability"
          isExpanded={expanded.availability}
          onToggle={() => toggleSection('availability')}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filters.availability === 'in-stock'}
                onChange={() => handleAvailabilityChange('in-stock')}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">In Stock</span>
            </label>
            <label className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filters.availability === 'custom-only'}
                onChange={() => handleAvailabilityChange('custom-only')}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-2 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Custom Order Only</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

/**
 * Reusable FilterSection component with accordion functionality
 */
function FilterSection({ title, isExpanded, onToggle, children }) {
  return (
    <div className="py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-2 text-left"
        aria-expanded={isExpanded}
      >
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <motion.svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}