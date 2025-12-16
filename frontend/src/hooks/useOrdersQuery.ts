/**
 * React Query Hooks for Orders
 * Optimized order management with caching and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '@/lib/queryClient';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
export interface OrderItem {
  product: string | { _id: string; title: string; primaryImage: string };
  quantity: number;
  price: number;
  customizations?: Record<string, unknown>;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | { _id: string; fullName: string; email: string };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  items: OrderItem[];
  shippingAddress: {
    fullAddress: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  payment: {
    method: 'cod' | 'bank-transfer' | 'easypaisa' | 'jazzcash';
    status: 'pending' | 'verified' | 'failed' | 'refunded';
    receiptImage?: { url: string };
    transactionId?: string;
  };
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  estimatedCompletion?: string;
  actualCompletion?: string;
  tracking?: {
    courierService?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  [key: string]: string | number | undefined;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      ordersPerPage: number;
    };
  };
}

// API response types
interface ApiOrdersResponse {
  success?: boolean;
  orders?: Order[];
  data?: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      ordersPerPage: number;
    };
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    ordersPerPage: number;
  };
}

interface ApiOrderResponse {
  success?: boolean;
  order?: Order;
  data?: Order;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Fetch orders with filters (Admin)
 */
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await api.orders.getAll(filters) as ApiOrdersResponse;
      // Normalize response structure
      return {
        success: response.success ?? true,
        data: response.data ?? {
          orders: response.orders ?? [],
          pagination: response.pagination ?? {
            currentPage: 1,
            totalPages: 1,
            totalOrders: 0,
            ordersPerPage: 10,
          },
        },
      } as OrdersResponse;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Fetch customer's orders
 */
export function useCustomerOrders(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.orders.all, 'customer'],
    queryFn: async () => {
      const response = await api.orders.getAll({ customer: 'me' }) as ApiOrdersResponse;
      return (response.orders ?? response.data?.orders ?? []) as Order[];
    },
    enabled: options?.enabled !== false,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch single order by ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      const response = await api.orders.getById(id) as ApiOrderResponse;
      return (response.order ?? response.data ?? response) as Order;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Track order by order number (public)
 */
export function useTrackOrder(orderNumber: string) {
  return useQuery({
    queryKey: queryKeys.orders.track(orderNumber),
    queryFn: async () => {
      const response = await api.orders.track(orderNumber) as { data?: unknown };
      return response.data ?? response;
    },
    enabled: !!orderNumber && orderNumber.length >= 5,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Fetch order statistics (Admin)
 */
export function useOrderStats(period = 'month') {
  return useQuery({
    queryKey: queryKeys.orders.stats(),
    queryFn: async () => {
      const response = await api.orders.admin.getAll({ period }) as { stats?: unknown };
      return response.stats ?? response;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.orders.create,
    mutationFn: async (orderData: Partial<Order>) => {
      const response = await api.orders.create(orderData);
      return response;
    },
    onSuccess: (data: { data?: { order?: { orderNumber?: string } } }) => {
      // Invalidate order lists
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      // Clear cart
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      toast.success(`Order ${data.data?.order?.orderNumber ?? ''} placed successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });
}

/**
 * Update order status (Admin)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.orders.updateStatus,
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) => {
      const response = await api.orders.updateStatus(id, status, note);
      return response;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.detail(id) });
      
      // Snapshot previous value
      const previousOrder = queryClient.getQueryData<Order>(queryKeys.orders.detail(id));
      
      // Optimistically update
      if (previousOrder) {
        queryClient.setQueryData(queryKeys.orders.detail(id), {
          ...previousOrder,
          status,
        });
      }
      
      return { previousOrder };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousOrder) {
        queryClient.setQueryData(
          queryKeys.orders.detail(variables.id),
          context.previousOrder
        );
      }
      toast.error(error.message || 'Failed to update order status');
    },
    onSuccess: (_data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success('Order status updated');
    },
  });
}

/**
 * Verify payment (Admin)
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      verified,
      notes,
    }: {
      id: string;
      verified: boolean;
      notes?: string;
    }) => {
      const response = await api.orders.admin.verifyPayment(id, { verified, notes });
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success(variables.verified ? 'Payment verified' : 'Payment rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify payment');
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.orders.cancel,
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.orders.cancel(id, reason);
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success('Order cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order');
    },
  });
}

/**
 * Add order note (Admin)
 */
export function useAddOrderNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const response = await api.orders.admin.addNote(id, { note });
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.id) });
      toast.success('Note added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add note');
    },
  });
}

export default useOrders;
