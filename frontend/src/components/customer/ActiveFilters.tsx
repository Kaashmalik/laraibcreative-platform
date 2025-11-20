'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import type { ProductFilters as ProductFiltersType } from '@/types/filters';

/**
 * ActiveFilters Component
 * Displays active filters with remove option
 * 
 * @component
 */
interface ActiveFiltersProps {
  filters?: ProductFiltersType;
  onRemoveFilter?: (type: keyof ProductFiltersType, value: string) => void;
  onClearAll?: () => void;
}

export default function ActiveFilters({ 
  filters: propFilters,
  onRemoveFilter: propRemoveFilter,
  onClearAll: propClearAll
}: ActiveFiltersProps = {}) {
  const hookFilters = useFilters({
    syncWithURL: false,
    persistToLocalStorage: false,
  });
  
  const filters = propFilters || hookFilters.filters;
  const removeFilter = propRemoveFilter || hookFilters.removeFilter;
  const clearAllFilters = propClearAll || hookFilters.clearAllFilters;
  
  // Calculate active filters
  const activeFilters = useMemo(() => {
    const active: Array<{ type: keyof ProductFiltersType; label: string; value: string; displayValue: string }> = [];

    // Price range
    if (filters.minPrice > 0 || filters.maxPrice < 50000) {
      active.push({
        type: 'minPrice',
        label: 'Price',
        value: `${filters.minPrice}-${filters.maxPrice}`,
        displayValue: `PKR ${filters.minPrice.toLocaleString()} - PKR ${filters.maxPrice.toLocaleString()}`,
      });
    }

    // Array filters
    const arrayFilters: (keyof ProductFiltersType)[] = ['fabric', 'color', 'size', 'occasion', 'availability'];
    arrayFilters.forEach((type) => {
      const values = filters[type];
      if (Array.isArray(values) && values.length > 0) {
        values.forEach((value) => {
          active.push({
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value: String(value),
            displayValue: String(value),
          });
        });
      }
    });

    return active;
  }, [filters]);
  
  const hasActiveFilters = activeFilters.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active filters:</span>
        
        {activeFilters.map((filter, index) => (
          <motion.button
            key={`${filter.type}-${filter.value}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              if (filter.type === 'minPrice' || filter.type === 'maxPrice') {
                // Reset price range
                if (propRemoveFilter) {
                  propRemoveFilter('minPrice', '');
                  propRemoveFilter('maxPrice', '');
                } else {
                  removeFilter('minPrice', '');
                  removeFilter('maxPrice', '');
                }
              } else {
                removeFilter(filter.type, filter.value);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors min-h-[32px]"
            aria-label={`Remove ${filter.label} filter: ${filter.displayValue}`}
          >
            <span>{filter.displayValue}</span>
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </motion.button>
        ))}

        <button
          onClick={clearAllFilters}
          className="ml-auto text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors min-h-[32px] px-2"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
