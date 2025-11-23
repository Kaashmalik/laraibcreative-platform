'use client';


import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import ProductFilters from './ProductFilters';
import ActiveFilters from './ActiveFilters';

/**
 * MobileFilterDrawer Component
 * Full-screen drawer for mobile filter interface
 * 
 * @component
 */
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters?: import('@/types/filters').ProductFilters;
  updateFilter?: <K extends keyof import('@/types/filters').ProductFilters>(
    key: K,
    value: import('@/types/filters').ProductFilters[K]
  ) => void;
  filterCounts?: {
    fabric?: Record<string, number>;
    color?: Record<string, number>;
    size?: Record<string, number>;
    occasion?: Record<string, number>;
  };
}

export default function MobileFilterDrawer({ 
  isOpen, 
  onClose,
  filters: propFilters,
  updateFilter: propUpdateFilter,
  filterCounts 
}: MobileFilterDrawerProps) {
  const hookFilters = useFilters({
    syncWithURL: false,
    persistToLocalStorage: false,
  });
  
  const filters = propFilters || hookFilters.filters;
  const { activeFiltersCount } = propFilters ? { activeFiltersCount: 0 } : hookFilters;

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Product filters"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close filters"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            {/* Active Filters */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <ActiveFilters />
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto">
              <ProductFilters 
                filters={filters}
                filterCounts={filterCounts}
                onFilterChange={(newFilters) => {
                  if (propUpdateFilter) {
                    Object.keys(newFilters).forEach((key) => {
                      propUpdateFilter(key as keyof typeof newFilters, newFilters[key as keyof typeof newFilters]);
                    });
                  }
                }}
              />
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-3">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-h-[44px]"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

