/**
 * Custom hook to fetch products with filters, pagination, loading and error states
 * Provides comprehensive product data management with automatic and manual fetching
 * 
 * @module hooks/useProducts
 * @param {Object} filters - Filter parameters for products
 * @param {string} filters.category - Category filter
 * @param {string} filters.search - Search query
 * @param {number} filters.minPrice - Minimum price filter
 * @param {number} filters.maxPrice - Maximum price filter
 * @param {string} filters.sortBy - Sort field
 * @param {string} filters.sortOrder - Sort order (asc/desc)
 * @param {Object} options - Hook configuration options
 * @param {boolean} options.autoFetch - Whether to fetch automatically (default: true)
 * @param {number} options.limit - Products per page (default: 12)
 * @returns {Object} Products state and methods
 * 
 * @example
 * import useProducts from '@/hooks/useProducts'
 * 
 * function ProductCatalog() {
 *   const { products, isLoading, error, hasMore, loadMore, refetch } = useProducts({
 *     category: 'stitched',
 *     sortBy: 'price',
 *     sortOrder: 'asc'
 *   })
 *   
 *   if (isLoading && products.length === 0) {
 *     return <LoadingSpinner />
 *   }
 *   
 *   if (error) {
 *     return <ErrorMessage message={error} onRetry={refetch} />
 *   }
 *   
 *   return (
 *     <div>
 *       <ProductGrid products={products} />
 *       {hasMore && (
 *         <button onClick={loadMore} disabled={isLoading}>
 *           {isLoading ? 'Loading...' : 'Load More'}
 *         </button>
 *       )}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // With search functionality
 * function SearchableProducts() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearch = useDebounce(searchTerm, 300)
 *   
 *   const { products, isLoading } = useProducts({
 *     search: debouncedSearch,
 *     minPrice: 1000,
 *     maxPrice: 5000
 *   })
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={searchTerm}
 *         onChange={(e) => setSearchTerm(e.target.value)}
 *         placeholder="Search products..."
 *       />
 *       <ProductList products={products} loading={isLoading} />
 *     </div>
 *   )
 * }
 * 
 * @example
 * // Manual fetching with custom limit
 * function FeaturedProducts() {
 *   const { products, isLoading, refetch } = useProducts(
 *     { featured: true },
 *     { autoFetch: false, limit: 6 }
 *   )
 *   
 *   useEffect(() => {
 *     refetch()
 *   }, [refetch])
 *   
 *   return <ProductCarousel products={products} />
 * }
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/lib/api'

function useProducts(filters = {}, options = {}) {
  const { autoFetch = true, limit = 12 } = options
  
  // State management
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Use refs to store latest values without causing re-renders
  const filtersRef = useRef(filters)
  const limitRef = useRef(limit)
  
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])
  
  useEffect(() => {
    limitRef.current = limit
  }, [limit])

  /**
   * Fetch products from API
   * @param {number} pageNum - Page number to fetch
   */
  const fetchProducts = useCallback(async (pageNum = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.products.getAll({
        ...filtersRef.current,
        page: pageNum,
        limit: limitRef.current
      })
      
      // Reset products if fetching first page, otherwise append
      if (pageNum === 1) {
        setProducts(response.products)
      } else {
        setProducts(prev => [...prev, ...response.products])
      }
      
      // Update pagination state
      setHasMore(response.products.length === limitRef.current)
      setPage(pageNum)
    } catch (err) {
      setError(err.message || 'Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Load next page of products
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchProducts(page + 1)
    }
  }, [isLoading, hasMore, page, fetchProducts])

  /**
   * Refetch products from first page
   */
  const refetch = useCallback(() => {
    fetchProducts(1)
  }, [fetchProducts])

  // Auto-fetch products when filters change
  const stringifiedFilters = JSON.stringify(filters)
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1)
    }
  }, [autoFetch, fetchProducts, stringifiedFilters])

  return {
    products,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch
  }
}

export default useProducts