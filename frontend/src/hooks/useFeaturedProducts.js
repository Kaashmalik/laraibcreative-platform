'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * Hook to fetch featured products with fallback
 * Ensures products are available even if SSR fails
 */
export function useFeaturedProducts(initialProducts = [], limit = 8) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch on client if we don't have products from SSR
    if (initialProducts.length === 0 && products.length === 0 && !loading) {
      setLoading(true);
      
      api.products.getFeatured(limit)
        .then(response => {
          // Handle different response formats
          let fetchedProducts = [];
          if (response && response.success && Array.isArray(response.data)) {
            fetchedProducts = response.data;
          } else if (response && Array.isArray(response.data)) {
            fetchedProducts = response.data;
          } else if (Array.isArray(response)) {
            fetchedProducts = response;
          }
          
          setProducts(fetchedProducts);
          setError(null);
        })
        .catch(err => {
          console.error('Client-side featured products fetch failed:', err);
          setError(err.message);
          // Set empty array to prevent infinite retries
          setProducts([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [limit, initialProducts.length, products.length, loading]);

  return { products, loading, error };
}

/**
 * Hook to fetch categories with fallback
 */
export function useCategories(initialCategories = []) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch on client if we don't have categories from SSR
    if (initialCategories.length === 0 && categories.length === 0 && !loading) {
      setLoading(true);
      
      api.categories.getAll()
        .then(response => {
          // Handle different response formats
          let fetchedCategories = [];
          if (response && response.success && Array.isArray(response.data)) {
            fetchedCategories = response.data;
          } else if (response && Array.isArray(response.data)) {
            fetchedCategories = response.data;
          } else if (Array.isArray(response)) {
            fetchedCategories = response;
          }
          
          setCategories(fetchedCategories);
          setError(null);
        })
        .catch(err => {
          console.error('Client-side categories fetch failed:', err);
          setError(err.message);
          setCategories([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [initialCategories.length, categories.length, loading]);

  return { categories, loading, error };
}
