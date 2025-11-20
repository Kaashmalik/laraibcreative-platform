/**
 * TypeScript types for product filtering system
 */

export interface ProductFilters {
  // Price range
  minPrice: number;
  maxPrice: number;
  
  // Fabric types (multiple selection)
  fabric: string[];
  
  // Colors (multiple selection)
  color: string[];
  
  // Sizes (multiple selection)
  size: string[];
  
  // Occasions (multiple selection)
  occasion: string[];
  
  // Availability status
  availability: string[];
  
  // Sort option
  sortBy?: string;
  
  // Search query
  search?: string;
  
  // Category
  category?: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  hexCode?: string;
  icon?: string;
}

export interface ActiveFilter {
  type: keyof ProductFilters;
  label: string;
  value: string;
  displayValue: string;
}

export interface FilterCounts {
  fabric: Record<string, number>;
  color: Record<string, number>;
  size: Record<string, number>;
  occasion: Record<string, number>;
  availability: Record<string, number>;
}

export interface UseFiltersOptions {
  initialFilters?: Partial<ProductFilters>;
  onFilterChange?: (filters: ProductFilters) => void;
  debounceMs?: number;
  persistToLocalStorage?: boolean;
  syncWithURL?: boolean;
}

export interface UseFiltersReturn {
  filters: ProductFilters;
  activeFilters: ActiveFilter[];
  activeFiltersCount: number;
  updateFilter: <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K]
  ) => void;
  removeFilter: (type: keyof ProductFilters, value: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

