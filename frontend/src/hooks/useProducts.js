import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

/**
 * Hook for fetching and managing products with filtering and pagination.
 * 
 * @typedef {Object} UseProductsOptions
 * @property {boolean} [autoFetch=true] - Whether to fetch products automatically on mount and filters change
 * @property {number} [limit=12] - Number of products per page
 * 
 * @typedef {Object} UseProductsReturn
 * @property {Array} products - List of products
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message if any
 * @property {boolean} hasMore - Whether more products can be loaded
 * @property {Function} loadMore - Function to load next page
 * @property {Function} refetch - Function to refresh products
 * 
 * @param {Object} [filters={}] - Filters to apply to products query
 * @param {UseProductsOptions} [options={}] - Configuration options
 * @returns {UseProductsReturn} Products data and control functions
 * 
 * @example
 * // Basic usage
 * function ProductList() {
 *   const { products, isLoading } = useProducts()
 *   
 *   if (isLoading) return <Spinner />
 *   return products.map(product => (
 *     <ProductCard key={product.id} product={product} />
 *   ))
 * }
 * 
 * @example
 * // With filters and pagination
 * function FilteredProducts() {
 *   const [filters, setFilters] = useState({ category: 'shirts' })
 *   const { products, hasMore, loadMore } = useProducts(filters)
 *   
 *   return (
 *     <div>
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *       {hasMore && <button onClick={loadMore}>Load More</button>}
 *     </div>
 *   )
 * }
 */
function useProducts(filters = {}, options = {}) {
  const { autoFetch = true, limit = 12 } = options;
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.products.getAll({
        ...filters,
        page: pageNum,
        limit
      });
      
      if (pageNum === 1) {
        setProducts(response.products);
      } else {
        setProducts(prev => [...prev, ...response.products]);
      }
      
      setHasMore(response.products.length === limit);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit]);

  // Auto fetch on mount and filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1);
    }
  }, [fetchProducts, autoFetch]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchProducts(page + 1);
    }
  }, [fetchProducts, isLoading, hasMore, page]);

  const refetch = useCallback(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
    page
  };
}

export default useProducts;
