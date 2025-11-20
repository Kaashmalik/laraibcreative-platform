'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import type { ProductFilters as ProductFiltersType, FilterOption } from '@/types/filters';

/**
 * ProductFilters Component - Production Ready
 * 
 * Features:
 * - Price range slider
 * - Fabric type checkboxes with counts
 * - Color picker with hex codes
 * - Size select dropdown
 * - Occasion checkboxes
 * - Collapsible sections
 * - Filter count badges
 * - Smooth animations
 * - Dark mode support
 * 
 * @component
 */
interface ProductFiltersProps {
  filters?: ProductFiltersType;
  onFilterChange?: (filters: ProductFiltersType) => void;
  filterCounts?: {
    fabric?: Record<string, number>;
    color?: Record<string, number>;
    size?: Record<string, number>;
    occasion?: Record<string, number>;
  };
  className?: string;
}

export default function ProductFilters({ 
  filters: propFilters,
  onFilterChange, 
  filterCounts = {},
  className = '' 
}: ProductFiltersProps) {
  // Use filters from props or fallback to hook
  // Parent component should manage filters via useFilters hook
  const hookFilters = useFilters({
    syncWithURL: false,
    persistToLocalStorage: false,
  });
  
  const filters = propFilters || hookFilters.filters;
  const updateFilter = propFilters 
    ? (key: keyof ProductFiltersType, value: any) => {
        if (onFilterChange) {
          onFilterChange({ ...filters, [key]: value });
        }
      }
    : hookFilters.updateFilter;

  // Expanded sections state
  const [expanded, setExpanded] = useState({
    fabric: true,
    price: true,
    occasion: true,
    color: true,
    size: true,
    availability: true,
  });

  // Filter options with counts
  const fabricOptions: FilterOption[] = useMemo(() => [
    { value: 'Lawn', label: 'Lawn', count: filterCounts.fabric?.Lawn || 0 },
    { value: 'Chiffon', label: 'Chiffon', count: filterCounts.fabric?.Chiffon || 0 },
    { value: 'Silk', label: 'Silk', count: filterCounts.fabric?.Silk || 0 },
    { value: 'Cotton', label: 'Cotton', count: filterCounts.fabric?.Cotton || 0 },
    { value: 'Velvet', label: 'Velvet', count: filterCounts.fabric?.Velvet || 0 },
    { value: 'Organza', label: 'Organza', count: filterCounts.fabric?.Organza || 0 },
    { value: 'Georgette', label: 'Georgette', count: filterCounts.fabric?.Georgette || 0 },
    { value: 'Jacquard', label: 'Jacquard', count: filterCounts.fabric?.Jacquard || 0 },
    { value: 'Linen', label: 'Linen', count: filterCounts.fabric?.Linen || 0 },
  ].filter(opt => opt.count > 0 || !filterCounts.fabric), [filterCounts.fabric]);

  const occasionOptions: FilterOption[] = useMemo(() => [
    { value: 'bridal', label: 'Bridal', icon: '👰', count: filterCounts.occasion?.bridal || 0 },
    { value: 'party', label: 'Party Wear', icon: '🎉', count: filterCounts.occasion?.party || 0 },
    { value: 'casual', label: 'Casual', icon: '👕', count: filterCounts.occasion?.casual || 0 },
    { value: 'formal', label: 'Formal', icon: '💼', count: filterCounts.occasion?.formal || 0 },
    { value: 'festive', label: 'Festive', icon: '🎊', count: filterCounts.occasion?.festive || 0 },
  ].filter(opt => opt.count > 0 || !filterCounts.occasion), [filterCounts.occasion]);

  const colorOptions: FilterOption[] = useMemo(() => [
    { value: 'red', hexCode: '#EF4444', label: 'Red', count: filterCounts.color?.red || 0 },
    { value: 'pink', hexCode: '#EC4899', label: 'Pink', count: filterCounts.color?.pink || 0 },
    { value: 'purple', hexCode: '#A855F7', label: 'Purple', count: filterCounts.color?.purple || 0 },
    { value: 'blue', hexCode: '#3B82F6', label: 'Blue', count: filterCounts.color?.blue || 0 },
    { value: 'green', hexCode: '#10B981', label: 'Green', count: filterCounts.color?.green || 0 },
    { value: 'yellow', hexCode: '#F59E0B', label: 'Yellow', count: filterCounts.color?.yellow || 0 },
    { value: 'black', hexCode: '#000000', label: 'Black', count: filterCounts.color?.black || 0 },
    { value: 'white', hexCode: '#FFFFFF', label: 'White', count: filterCounts.color?.white || 0 },
    { value: 'beige', hexCode: '#D4C5B9', label: 'Beige', count: filterCounts.color?.beige || 0 },
    { value: 'gold', hexCode: '#FFD700', label: 'Gold', count: filterCounts.color?.gold || 0 },
  ].filter(opt => opt.count > 0 || !filterCounts.color), [filterCounts.color]);

  const sizeOptions: FilterOption[] = useMemo(() => [
    { value: 'XS', label: 'XS', count: filterCounts.size?.XS || 0 },
    { value: 'S', label: 'S', count: filterCounts.size?.S || 0 },
    { value: 'M', label: 'M', count: filterCounts.size?.M || 0 },
    { value: 'L', label: 'L', count: filterCounts.size?.L || 0 },
    { value: 'XL', label: 'XL', count: filterCounts.size?.XL || 0 },
    { value: 'XXL', label: 'XXL', count: filterCounts.size?.XXL || 0 },
    { value: 'Custom', label: 'Custom', count: filterCounts.size?.Custom || 0 },
  ].filter(opt => opt.count > 0 || !filterCounts.size), [filterCounts.size]);

  // Handlers
  const handleCheckboxChange = useCallback((filterType: 'fabric' | 'occasion' | 'color' | 'size' | 'availability', value: string) => {
    const currentValues = Array.isArray(filters[filterType]) ? filters[filterType] : [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(filterType, newValues);
  }, [filters, updateFilter]);

  const handlePriceChange = useCallback((type: 'minPrice' | 'maxPrice', value: number) => {
    updateFilter(type, value);
  }, [updateFilter]);

  const toggleSection = useCallback((section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expanded.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
              <span>PKR {filters.minPrice.toLocaleString()}</span>
              <span>PKR {filters.maxPrice.toLocaleString()}</span>
            </div>

            {/* Dual range slider */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.minPrice}
                onChange={(e) => handlePriceChange('minPrice', parseInt(e.target.value, 10))}
                className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 z-10"
                style={{
                  background: `linear-gradient(to right, 
                    #ec4899 0%, 
                    #ec4899 ${(filters.minPrice / 50000) * 100}%, 
                    #e5e7eb ${(filters.minPrice / 50000) * 100}%, 
                    #e5e7eb ${(filters.maxPrice / 50000) * 100}%, 
                    #ec4899 ${(filters.maxPrice / 50000) * 100}%, 
                    #ec4899 100%)`
                }}
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', parseInt(e.target.value, 10))}
                className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-primary-600 z-20"
              />
            </div>
          </div>
        </FilterSection>

        {/* Fabric Type */}
        <FilterSection
          title="Fabric Type"
          isExpanded={expanded.fabric}
          onToggle={() => toggleSection('fabric')}
          badge={filters.fabric.length > 0 ? filters.fabric.length : undefined}
        >
          <div className="space-y-1 px-4 py-2">
            {fabricOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.fabric.includes(option.value)}
                    onChange={() => handleCheckboxChange('fabric', option.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Occasion */}
        <FilterSection
          title="Occasion"
          isExpanded={expanded.occasion}
          onToggle={() => toggleSection('occasion')}
          badge={filters.occasion.length > 0 ? filters.occasion.length : undefined}
        >
          <div className="space-y-1 px-4 py-2">
            {occasionOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors min-h-[44px]"
              >
                <input
                  type="checkbox"
                  checked={filters.occasion.includes(option.value)}
                  onChange={() => handleCheckboxChange('occasion', option.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                />
                {option.icon && <span className="text-lg" aria-hidden="true">{option.icon}</span>}
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection
          title="Color"
          isExpanded={expanded.color}
          onToggle={() => toggleSection('color')}
          badge={filters.color.length > 0 ? filters.color.length : undefined}
        >
          <div className="grid grid-cols-5 gap-3 px-4 py-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleCheckboxChange('color', option.value)}
                className={`relative w-full aspect-square rounded-lg transition-all min-h-[44px] ${
                  filters.color.includes(option.value)
                    ? 'ring-2 ring-primary-600 dark:ring-primary-400 ring-offset-2 dark:ring-offset-gray-900 scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: option.hexCode }}
                aria-label={option.label}
                title={option.label}
              >
                {option.value === 'white' && (
                  <div className="absolute inset-0 border border-gray-300 dark:border-gray-600 rounded-lg" />
                )}
                {filters.color.includes(option.value) && (
                  <svg
                    className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
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

        {/* Size */}
        <FilterSection
          title="Size"
          isExpanded={expanded.size}
          onToggle={() => toggleSection('size')}
          badge={filters.size.length > 0 ? filters.size.length : undefined}
        >
          <div className="space-y-1 px-4 py-2">
            {sizeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.size.includes(option.value)}
                    onChange={() => handleCheckboxChange('size', option.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                </div>
                {option.count !== undefined && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection
          title="Availability"
          isExpanded={expanded.availability}
          onToggle={() => toggleSection('availability')}
          badge={filters.availability.length > 0 ? filters.availability.length : undefined}
        >
          <div className="space-y-1 px-4 py-2">
            {[
              { value: 'in-stock', label: 'In Stock' },
              { value: 'made-to-order', label: 'Made to Order' },
              { value: 'custom-only', label: 'Custom Only' },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors min-h-[44px]"
              >
                <input
                  type="checkbox"
                  checked={filters.availability.includes(option.value)}
                  onChange={() => handleCheckboxChange('availability', option.value)}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

/**
 * Reusable FilterSection component with accordion functionality
 */
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: number;
}

function FilterSection({ title, isExpanded, onToggle, children, badge }: FilterSectionProps) {
  return (
    <div className="py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-6 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
        </motion.div>
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
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

