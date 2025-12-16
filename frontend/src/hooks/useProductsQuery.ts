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
  [key: string]: string | number | boolean | undefined;
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

// API response types
interface ApiProductsResponse {
  success?: boolean;
  products?: Product[];
  data?: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    currentPage?: number;
    totalPages?: number;
  };
}

interface ApiProductResponse {
  success?: boolean;
  product?: Product;
  data?: Product;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch products with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await api.products.getAll(filters) as ApiProductsResponse;
      // Normalize response structure
      return {
        success: response.success ?? true,
        products: response.products ?? response.data ?? [],
        pagination: response.pagination ?? {
          page: 1,
          limit: 12,
          total: 0,
          pages: 1,
        },
      } as ProductsResponse;
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
      }) as ApiProductsResponse;
      // Normalize response
      const pagination = response.pagination;
      const page = pagination?.page ?? (pagination as { currentPage?: number })?.currentPage ?? pageParam;
      const limit = pagination?.limit ?? 12;
      const total = pagination?.total ?? 0;
      const pages = pagination?.pages ?? (pagination as { totalPages?: number })?.totalPages ?? 1;
      return {
        success: response.success ?? true,
        products: response.products ?? response.data ?? [],
        pagination: { page, limit, total, pages },
      } as ProductsResponse;
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
      const response = await api.products.getById(id) as ApiProductResponse;
      return (response.product ?? response.data ?? response) as Product;
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
      const response = await api.products.getBySlug(slug) as ApiProductResponse;
      return (response.product ?? response.data ?? response) as Product;
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
      const response = await api.products.getFeatured(limit) as ApiProductsResponse;
      return (response.products ?? response.data ?? []) as Product[];
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
      const response = await api.products.getNewArrivals(limit) as ApiProductsResponse;
      return (response.products ?? response.data ?? []) as Product[];
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
      const response = await api.products.getBestSellers(limit) as ApiProductsResponse;
      return (response.products ?? response.data ?? []) as Product[];
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
      const response = await api.products.search(query) as ApiProductsResponse;
      return (response.products ?? response.data ?? []) as Product[];
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
      const response = await api.products.getRelated(productId, { limit }) as ApiProductsResponse;
      return (response.products ?? response.data ?? []) as Product[];
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
      queryKey: queryKeys.products.list(filters as Record<string, unknown>),
      queryFn: async () => {
        const response = await api.products.getAll(filters) as ApiProductsResponse;
        return {
          success: response.success ?? true,
          products: response.products ?? response.data ?? [],
          pagination: response.pagination ?? {
            page: 1,
            limit: 12,
            total: 0,
            pages: 1,
          },
        } as ProductsResponse;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProduct = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(id),
      queryFn: async () => {
        const response = await api.products.getById(id) as ApiProductResponse;
        return (response.product ?? response.data ?? response) as Product;
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  return { prefetchProducts, prefetchProduct };
}

export default useProducts;
