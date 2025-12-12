/**
 * React Query Hooks for Products
 * Optimized data fetching with caching and automatic refetching
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '@/lib/queryClient';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  designCode: string;
  category: string | { _id: string; name: string; slug: string };
  images: Array<{ url: string; publicId?: string; altText?: string }>;
  primaryImage: string;
  pricing: {
    basePrice: number;
    discount?: {
      percentage: number;
      isActive: boolean;
    };
  };
  fabric: {
    type: string;
    composition?: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  fabric?: string;
  occasion?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch products with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      const response = await api.products.getAll(filters);
      return response as ProductsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Infinite scroll products
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.products.lists(), 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.products.getAll({
        ...filters,
        page: pageParam,
        limit: filters.limit || 12,
      });
      return response as ProductsResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const response = await api.products.getById(id);
      return response.product as Product;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch product by slug
 */
export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.bySlug(slug),
    queryFn: async () => {
      const response = await api.products.getBySlug(slug);
      return response.product as Product;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch featured products
 */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.featured(),
    queryFn: async () => {
      const response = await api.products.getFeatured(limit);
      return response.products as Product[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Fetch new arrivals
 */
export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.newArrivals(),
    queryFn: async () => {
      const response = await api.products.getNewArrivals(limit);
      return response.products as Product[];
    },
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Fetch best sellers
 */
export function useBestSellers(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.bestSellers(),
    queryFn: async () => {
      const response = await api.products.getBestSellers(limit);
      return response.products as Product[];
    },
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Search products
 */
export function useProductSearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: async () => {
      const response = await api.products.search(query);
      return response.products as Product[];
    },
    enabled: options?.enabled !== false && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch related products
 */
export function useRelatedProducts(productId: string, limit = 4) {
  return useQuery({
    queryKey: queryKeys.products.related(productId),
    queryFn: async () => {
      const response = await api.products.getRelated(productId, limit);
      return response.products as Product[];
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create product (Admin)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.products.create,
    mutationFn: async (data: Partial<Product>) => {
      const response = await api.products.create(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate product lists
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

/**
 * Update product (Admin)
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.products.update,
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await api.products.update(id, data);
      return response;
    },
    onSuccess: (_data, variables) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

/**
 * Delete product (Admin)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.products.delete,
    mutationFn: async (id: string) => {
      const response = await api.products.delete(id);
      return response;
    },
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}

// ============================================
// PREFETCH FUNCTIONS
// ============================================

/**
 * Prefetch products for navigation optimization
 */
export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  const prefetchProducts = async (filters: ProductFilters = {}) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(filters),
      queryFn: async () => {
        const response = await api.products.getAll(filters);
        return response as ProductsResponse;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProduct = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: async () => {
        const response = await api.products.getById(id);
        return response.product as Product;
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  return { prefetchProducts, prefetchProduct };
}

export default useProducts;

