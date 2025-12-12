/**
 * React Query Client Configuration
 * Centralized query client setup with optimized defaults
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * Handle query errors globally
 */
const handleQueryError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An error occurred';
  
  // Don't show toast for canceled requests
  if (message.includes('canceled') || message.includes('abort')) {
    return;
  }
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Query Error:', error);
  }
};

/**
 * Handle mutation errors globally
 */
const handleMutationError = (error: unknown, _variables: unknown, _context: unknown, mutation: unknown) => {
  const message = error instanceof Error ? error.message : 'An error occurred';
  
  // Show toast for mutation errors unless explicitly disabled
  // @ts-ignore - meta property access
  if (!(mutation as any)?.options?.meta?.skipErrorToast) {
    toast.error(message);
  }
  
  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Mutation Error:', error);
  }
};

/**
 * Create the query client with optimized settings
 */
export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
    }),
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes for most data
        staleTime: 5 * 60 * 1000,
        
        // Cache time: 30 minutes
        gcTime: 30 * 60 * 1000,
        
        // Retry failed requests up to 2 times
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        
        // Don't refetch on reconnect by default
        refetchOnReconnect: true,
        
        // Keep previous data while fetching new
        // placeholderData: 'keepPrevious', // For TanStack Query v5
        
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
        retryDelay: 1000,
        
        // Network mode
        networkMode: 'online',
      },
    },
  });
};

/**
 * Query keys factory for consistent key management
 */
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.products.all, 'slug', slug] as const,
    featured: () => [...queryKeys.products.all, 'featured'] as const,
    newArrivals: () => [...queryKeys.products.all, 'new-arrivals'] as const,
    bestSellers: () => [...queryKeys.products.all, 'best-sellers'] as const,
    search: (query: string) => [...queryKeys.products.all, 'search', query] as const,
    related: (id: string) => [...queryKeys.products.all, 'related', id] as const,
  },
  
  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    tree: () => [...queryKeys.categories.all, 'tree'] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
    bySlug: (slug: string) => [...queryKeys.categories.all, 'slug', slug] as const,
  },
  
  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.orders.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    track: (orderNumber: string) => [...queryKeys.orders.all, 'track', orderNumber] as const,
    stats: () => [...queryKeys.orders.all, 'stats'] as const,
  },
  
  // Cart
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
    summary: () => [...queryKeys.cart.all, 'summary'] as const,
  },
  
  // Wishlist
  wishlist: {
    all: ['wishlist'] as const,
    items: () => [...queryKeys.wishlist.all, 'items'] as const,
  },
  
  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
    measurements: () => [...queryKeys.user.all, 'measurements'] as const,
  },
  
  // Dashboard (Admin)
  dashboard: {
    all: ['dashboard'] as const,
    stats: (period: string) => [...queryKeys.dashboard.all, 'stats', period] as const,
    analytics: () => [...queryKeys.dashboard.all, 'analytics'] as const,
    recent: () => [...queryKeys.dashboard.all, 'recent'] as const,
  },
  
  // Reviews
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: string) => [...queryKeys.reviews.all, 'product', productId] as const,
    byUser: () => [...queryKeys.reviews.all, 'user'] as const,
  },
};

/**
 * Mutation keys for tracking mutation state
 */
export const mutationKeys = {
  products: {
    create: ['products', 'create'] as const,
    update: ['products', 'update'] as const,
    delete: ['products', 'delete'] as const,
  },
  orders: {
    create: ['orders', 'create'] as const,
    updateStatus: ['orders', 'update-status'] as const,
    cancel: ['orders', 'cancel'] as const,
  },
  cart: {
    add: ['cart', 'add'] as const,
    update: ['cart', 'update'] as const,
    remove: ['cart', 'remove'] as const,
    clear: ['cart', 'clear'] as const,
  },
  wishlist: {
    add: ['wishlist', 'add'] as const,
    remove: ['wishlist', 'remove'] as const,
  },
  user: {
    updateProfile: ['user', 'update-profile'] as const,
    addAddress: ['user', 'add-address'] as const,
    updateAddress: ['user', 'update-address'] as const,
    deleteAddress: ['user', 'delete-address'] as const,
  },
};

/**
 * Default query client instance
 */
let queryClient: QueryClient | null = null;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

export default getQueryClient;

