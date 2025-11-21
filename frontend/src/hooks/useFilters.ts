/**
 * Custom hook for managing product filters
 * 
 * Features:
 * - URL state synchronization
 * - localStorage persistence
 * - Debounced updates
 * - Active filters tracking
 * - Performance optimizations
 * 
 * @module hooks/useFilters
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { ProductFilters, ActiveFilter, UseFiltersOptions, UseFiltersReturn } from '@/types/filters';

const DEFAULT_FILTERS: ProductFilters = {
  minPrice: 0,
  maxPrice: 50000,
  fabric: [],
  color: [],
  size: [],
  occasion: [],
  availability: [],
  suitType: [],
  sortBy: 'newest',
  search: '',
  category: '',
};

const STORAGE_KEY = 'laraibcreative_product_filters';
const DEBOUNCE_MS = 300;

/**
 * Get filter label for display
 */
function getFilterLabel(type: keyof ProductFilters, value: string): string {
  const labelMap: Record<string, Record<string, string>> = {
    fabric: {
      'Lawn': 'Lawn',
      'Chiffon': 'Chiffon',
      'Silk': 'Silk',
      'Cotton': 'Cotton',
      'Velvet': 'Velvet',
      'Organza': 'Organza',
      'Georgette': 'Georgette',
      'Jacquard': 'Jacquard',
      'Linen': 'Linen',
    },
    occasion: {
      'bridal': 'Bridal',
      'party': 'Party Wear',
      'casual': 'Casual',
      'formal': 'Formal',
      'festive': 'Festive',
    },
    size: {
      'XS': 'XS',
      'S': 'S',
      'M': 'M',
      'L': 'L',
      'XL': 'XL',
      'XXL': 'XXL',
      'Custom': 'Custom',
    },
    availability: {
      'in-stock': 'In Stock',
      'made-to-order': 'Made to Order',
      'out-of-stock': 'Out of Stock',
      'custom-only': 'Custom Only',
    },
  };

  return labelMap[type]?.[value] || value;
}

/**
 * Parse filters from URL search params
 */
function parseFiltersFromURL(searchParams: URLSearchParams): Partial<ProductFilters> {
  const filters: Partial<ProductFilters> = {};

  // Price range
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice) filters.minPrice = parseInt(minPrice, 10);
  if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);

  // Array filters
  const arrayFilters: (keyof ProductFilters)[] = ['fabric', 'color', 'size', 'occasion', 'availability'];
  arrayFilters.forEach((key) => {
    const value = searchParams.get(key);
    if (value) {
      (filters as any)[key] = value.split(',').filter(Boolean);
    }
  });

  // String filters
  const sortBy = searchParams.get('sortBy');
  if (sortBy) filters.sortBy = sortBy;

  const search = searchParams.get('search');
  if (search) filters.search = search;

  const category = searchParams.get('category');
  if (category) filters.category = category;

  return filters;
}

/**
 * Build URL search params from filters
 */
function buildURLFromFilters(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();

  // Price range
  if (filters.minPrice > 0) {
    params.set('minPrice', filters.minPrice.toString());
  }
  if (filters.maxPrice < 50000) {
    params.set('maxPrice', filters.maxPrice.toString());
  }

  // Array filters
  const arrayFilters: (keyof ProductFilters)[] = ['fabric', 'color', 'size', 'occasion', 'availability'];
  arrayFilters.forEach((key) => {
    const value = filters[key];
    if (Array.isArray(value) && value.length > 0) {
      params.set(key, value.join(','));
    }
  });

  // String filters
  if (filters.sortBy && filters.sortBy !== 'newest') {
    params.set('sortBy', filters.sortBy);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }
  if (filters.category) {
    params.set('category', filters.category);
  }

  return params;
}

/**
 * Load filters from localStorage
 */
function loadFiltersFromStorage(): Partial<ProductFilters> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading filters from storage:', error);
  }
  
  return {};
}

/**
 * Save filters to localStorage
 */
function saveFiltersToStorage(filters: ProductFilters): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to storage:', error);
  }
}

export function useFilters(options: UseFiltersOptions = {}): UseFiltersReturn {
  const {
    initialFilters = {},
    onFilterChange,
    debounceMs = DEBOUNCE_MS,
    persistToLocalStorage = true,
    syncWithURL = true,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize filters from URL, localStorage, or defaults
  const initializeFilters = useCallback((): ProductFilters => {
    let filters: Partial<ProductFilters> = { ...DEFAULT_FILTERS };

    // 1. Load from URL (highest priority)
    if (syncWithURL) {
      const urlFilters = parseFiltersFromURL(searchParams);
      filters = { ...filters, ...urlFilters };
    }

    // 2. Load from localStorage
    if (persistToLocalStorage) {
      const storedFilters = loadFiltersFromStorage();
      // Only use stored filters if URL doesn't have them
      Object.keys(storedFilters).forEach((key) => {
        if (!filters[key as keyof ProductFilters]) {
          (filters as any)[key as keyof ProductFilters] = storedFilters[key as keyof ProductFilters];
        }
      });
    }

    // 3. Apply initial filters
    filters = { ...filters, ...initialFilters };

    return filters as ProductFilters;
  }, [searchParams, syncWithURL, persistToLocalStorage, initialFilters]);

  const [filters, setFilters] = useState<ProductFilters>(initializeFilters);

  // Update filters when URL changes (browser back/forward)
  useEffect(() => {
    if (syncWithURL) {
      const urlFilters = parseFiltersFromURL(searchParams);
      setFilters((prev) => ({ ...prev, ...urlFilters }));
    }
  }, [searchParams, syncWithURL]);

  // Debounced filter update
  const updateFilters = useCallback(
    (newFilters: ProductFilters) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Update state immediately
      setFilters(newFilters);

      // Debounce URL and storage updates
      debounceTimerRef.current = setTimeout(() => {
        // Update URL
        if (syncWithURL) {
          const params = buildURLFromFilters(newFilters);
          const newURL = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;
          router.replace(newURL, { scroll: false });
        }

        // Save to localStorage
        if (persistToLocalStorage) {
          saveFiltersToStorage(newFilters);
        }

        // Call callback
        if (onFilterChange) {
          onFilterChange(newFilters);
        }
      }, debounceMs);
    },
    [syncWithURL, persistToLocalStorage, onFilterChange, debounceMs, pathname, router]
  );

  // Update a specific filter
  const updateFilter = useCallback(
    <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
      const newFilters = { ...filters, [key]: value };
      updateFilters(newFilters);
    },
    [filters, updateFilters]
  );

  // Remove a specific filter value
  const removeFilter = useCallback(
    (type: keyof ProductFilters, value: string) => {
      const currentValue = filters[type];
      
      if (Array.isArray(currentValue)) {
        const newValue = currentValue.filter((v) => v !== value);
        updateFilter(type, newValue as ProductFilters[typeof type]);
      } else if (type === 'minPrice' || type === 'maxPrice') {
        // Reset price to default
        if (type === 'minPrice') {
          updateFilter('minPrice', 0);
        } else {
          updateFilter('maxPrice', 50000);
        }
      } else {
        // Reset other single-value filters
        updateFilter(type, DEFAULT_FILTERS[type]);
      }
    },
    [filters, updateFilter]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const clearedFilters = { ...DEFAULT_FILTERS };
    updateFilters(clearedFilters);
  }, [updateFilters]);

  // Reset to initial filters
  const resetFilters = useCallback(() => {
    const resetFilters = { ...DEFAULT_FILTERS, ...initialFilters };
    updateFilters(resetFilters);
  }, [initialFilters, updateFilters]);

  // Calculate active filters
  const activeFilters = useMemo((): ActiveFilter[] => {
    const active: ActiveFilter[] = [];

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
    const arrayFilters: (keyof ProductFilters)[] = ['fabric', 'color', 'size', 'occasion', 'availability'];
    arrayFilters.forEach((type) => {
      const values = filters[type];
      if (Array.isArray(values) && values.length > 0) {
        values.forEach((value) => {
          active.push({
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            value,
            displayValue: getFilterLabel(type, value),
          });
        });
      }
    });

    return active;
  }, [filters]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    // Price range counts as 1
    if (filters.minPrice > 0 || filters.maxPrice < 50000) {
      count += 1;
    }

    // Count array filters
    const arrayFilters: (keyof ProductFilters)[] = ['fabric', 'color', 'size', 'occasion', 'availability'];
    arrayFilters.forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        count += value.length;
      }
    });

    return count;
  }, [filters]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFiltersCount > 0;
  }, [activeFiltersCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    filters,
    activeFilters,
    activeFiltersCount,
    updateFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    resetFilters,
  };
}

