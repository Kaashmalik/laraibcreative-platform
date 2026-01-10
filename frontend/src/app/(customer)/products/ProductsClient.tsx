'use client';


import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import ProductCard from '@/components/customer/ProductCard';
import ProductFilters from '@/components/customer/ProductFilters';
import MobileFilterDrawer from '@/components/customer/MobileFilterDrawer';
import ActiveFilters from '@/components/customer/ActiveFilters';
import Pagination from '@/components/customer/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import { useFilters } from '@/hooks/useFilters';
import api from '@/lib/api';
import type { ProductFilters as ProductFiltersType } from '@/types/filters';

/**
 * ProductsContent Component
 * Main content with filtering and product listing
 */
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [filterCounts, setFilterCounts] = useState({
    fabric: {} as Record<string, number>,
    color: {} as Record<string, number>,
    size: {} as Record<string, number>,
    occasion: {} as Record<string, number>,
  });

  // Use filters hook with URL sync and localStorage
  // Note: onFilterChange is NOT used here - fetch is triggered via useEffect watching filter props
  const { filters, activeFiltersCount, updateFilter } = useFilters({
    syncWithURL: true,
    persistToLocalStorage: false,
  });

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams?.get('page') || '1', 10)
  );
  const productsPerPage = 12;

  // Fetch products with filters
  const fetchProducts = useCallback(async (filterParams?: ProductFiltersType) => {
    try {
      setLoading(true);
      const activeFilters = filterParams || filters;

      // Build API params from filters
      const params: any = {
        page: currentPage,
        limit: productsPerPage,
        sortBy: activeFilters.sortBy || 'newest',
      };

      // Add price range only if changed from defaults
      // Don't send price filters if they're at default values (0 and 50000)
      // This allows backend to show all products regardless of price
      const defaultMinPrice = 0;
      const defaultMaxPrice = 50000;
      const hasMinPriceFilter = activeFilters.minPrice !== undefined &&
        activeFilters.minPrice !== null &&
        activeFilters.minPrice > defaultMinPrice;
      const hasMaxPriceFilter = activeFilters.maxPrice !== undefined &&
        activeFilters.maxPrice !== null &&
        activeFilters.maxPrice < defaultMaxPrice;

      if (hasMinPriceFilter) {
        params.minPrice = activeFilters.minPrice;
      }
      if (hasMaxPriceFilter) {
        params.maxPrice = activeFilters.maxPrice;
      }

      // Add category if present
      // Add category if present and not 'all'
      if (activeFilters.category && activeFilters.category !== 'all') {
        params.category = activeFilters.category;
      }

      // Add search if present
      if (activeFilters.search) {
        params.search = activeFilters.search;
      }

      // Add fabric filter (can be array or string)
      if (activeFilters.fabric && activeFilters.fabric.length > 0) {
        params.fabric = activeFilters.fabric.join(',');
      }

      // Add occasion filter
      if (activeFilters.occasion && activeFilters.occasion.length > 0) {
        params.occasion = activeFilters.occasion.join(',');
      }

      // Add color filter
      if (activeFilters.color && activeFilters.color.length > 0) {
        params.color = activeFilters.color.join(',');
      }

      // Add size filter
      if (activeFilters.size && activeFilters.size.length > 0) {
        params.size = activeFilters.size.join(',');
      }

      // Add availability filter (handle both array and string)
      if (activeFilters.availability) {
        if (Array.isArray(activeFilters.availability) && activeFilters.availability.length > 0) {
          params.availability = activeFilters.availability.join(',');
        } else if (typeof activeFilters.availability === 'string' && activeFilters.availability) {
          params.availability = activeFilters.availability;
        }
      }

      // Add suit type filter (NEW)
      if (activeFilters.suitType && activeFilters.suitType.length > 0) {
        params.type = activeFilters.suitType.join(',');
      }

      // Debug logging
      if (true) {
        console.log('Fetching products with params:', params);
      }

      const response = await api.products.getAll(params);

      let products: any[] = [];
      if (response) {
        const data = response as any;
        // Handle both response structures: { products, total } or { data: products, pagination: { totalProducts } }
        products = data.products || data.data || [];
        const total = data.total || data.pagination?.totalProducts || products.length;

        // Debug logging
        if (true) {
          console.log('Products response:', { productsCount: products.length, total, data });
        }

        setProducts(products);
        setTotalProducts(total);

        // Use facets from API if available, otherwise fallback to local calculation
        if (data.facets) {
          setFilterCounts(data.facets);
        } else {
          calculateFilterCounts(products);
        }
      } else {
        setProducts([]);
        setTotalProducts(0);
        calculateFilterCounts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, productsPerPage]);

  // Calculate filter counts from products
  const calculateFilterCounts = useCallback((productsList: any[]) => {
    const counts = {
      fabric: {} as Record<string, number>,
      color: {} as Record<string, number>,
      size: {} as Record<string, number>,
      occasion: {} as Record<string, number>,
    };

    productsList.forEach((product) => {
      // Fabric counts
      if (product.fabric?.type) {
        counts.fabric[product.fabric.type] = (counts.fabric[product.fabric.type] || 0) + 1;
      }

      // Color counts
      if (product.availableColors && Array.isArray(product.availableColors)) {
        product.availableColors.forEach((color: any) => {
          if (color.name) {
            counts.color[color.name.toLowerCase()] = (counts.color[color.name.toLowerCase()] || 0) + 1;
          }
        });
      }

      // Size counts
      if (product.sizeAvailability?.standardSizes && Array.isArray(product.sizeAvailability.standardSizes)) {
        product.sizeAvailability.standardSizes.forEach((size: string) => {
          counts.size[size] = (counts.size[size] || 0) + 1;
        });
      }

      // Occasion counts
      if (product.occasion) {
        counts.occasion[product.occasion.toLowerCase()] = (counts.occasion[product.occasion.toLowerCase()] || 0) + 1;
      }
    });

    setFilterCounts(counts);
  }, []);

  // Fetch products when filters or page change
  // Use a ref to ensure initial fetch happens only once
  const hasMountedRef = useRef(false);
  useEffect(() => {
    // Always fetch on mount
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      fetchProducts();
      return;
    }
    // On subsequent filter/page changes, fetch again
    fetchProducts();
  }, [filters.minPrice, filters.maxPrice, filters.fabric, filters.color, filters.size, filters.occasion, filters.availability, filters.sortBy, filters.search, filters.category, filters.suitType, currentPage]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string) => {
    updateFilter('sortBy', sortBy);
    setCurrentPage(1);
  }, [updateFilter]);

  // SEO Structured Data
  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Products - LaraibCreative',
    description: 'Browse our complete collection of custom stitched ladies suits, bridal wear, party suits, and designer replicas.',
    url: typeof window !== 'undefined' ? window.location.href : '',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalProducts,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: product.title || product.name,
        description: product.description,
        image: product.primaryImage || product.images?.[0],
        offers: {
          '@type': 'Offer',
          price: product.pricing?.basePrice || product.price,
          priceCurrency: 'PKR',
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      }))
    }
  }), [products, totalProducts]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our collection of beautiful Pakistani fashion
          </p>
        </header>

        {/* Active Filters Bar */}
        <ActiveFilters
          filters={filters}
          onRemoveFilter={(type, value) => {
            if (type === 'minPrice' || type === 'maxPrice') {
              updateFilter('minPrice', 0);
              updateFilter('maxPrice', 50000);
            } else {
              const currentValue = filters[type];
              if (Array.isArray(currentValue)) {
                updateFilter(type, currentValue.filter(v => v !== value));
              }
            }
          }}
          onClearAll={() => {
            updateFilter('minPrice', 0);
            updateFilter('maxPrice', 50000);
            updateFilter('fabric', []);
            updateFilter('color', []);
            updateFilter('size', []);
            updateFilter('occasion', []);
            updateFilter('availability', []);
          }}
        />

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-[44px]"
          >
            <Filter className="w-5 h-5" aria-hidden="true" />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <ProductFilters
                filters={filters}
                filterCounts={filterCounts}
                onFilterChange={(newFilters) => {
                  // Update each filter individually
                  Object.keys(newFilters).forEach((key) => {
                    updateFilter(key as keyof ProductFiltersType, newFilters[key as keyof ProductFiltersType]);
                  });
                }}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <section className="lg:col-span-3">
            {/* Results count and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Showing{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {products.length > 0 ? ((currentPage - 1) * productsPerPage + 1) : 0}
                </span>
                {' - '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {Math.min(currentPage * productsPerPage, totalProducts)}
                </span>
                {' of '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {totalProducts}
                </span>
                {' products'}
              </p>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 min-h-[44px]"
                aria-label="Sort products"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Spinner className="w-12 h-12 text-primary-600" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
              </div>
            ) : error ? (
              /* Error State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{error}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Please check your connection and try again</p>
                <button
                  onClick={() => {
                    setError(null);
                    fetchProducts();
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-h-[44px]"
                >
                  Retry
                </button>
              </motion.div>
            ) : products.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No products found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters</p>
                <button
                  onClick={() => {
                    // Clear all filters
                    updateFilter('minPrice', 0);
                    updateFilter('maxPrice', 50000);
                    updateFilter('fabric', []);
                    updateFilter('color', []);
                    updateFilter('size', []);
                    updateFilter('occasion', []);
                    updateFilter('availability', []);
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors min-h-[44px]"
                >
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              /* Products Grid */
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {products.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filterCounts={filterCounts}
        filters={filters}
        updateFilter={updateFilter}
      />
    </>
  );
}

/**
 * Products Client Component
 * Wrapper with Suspense for async search params
 */
export default function ProductsClient() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Spinner className="w-12 h-12 text-primary-600" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

