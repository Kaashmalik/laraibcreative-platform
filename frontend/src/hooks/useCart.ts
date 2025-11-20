/**
 * useCart Hook
 * Custom hook for cart operations with Zustand store
 * 
 * @module hooks/useCart
 */

import { useCartStore } from '@/store/cartStore';
import { useCallback, useEffect } from 'react';
import type { CartItemCustomizations } from '@/types/cart';
import type { Product } from '@/types/product';

/**
 * useCart Hook
 * Provides cart state and actions
 * 
 * @example
 * const { items, addItem, removeItem, total } = useCart();
 */
export function useCart() {
  const store = useCartStore();

  // Load cart from backend on mount (if authenticated)
  useEffect(() => {
    const loadCart = async () => {
      try {
        await store.loadCart();
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    // Check if user is authenticated
    const token = typeof window !== 'undefined' 
      ? document.cookie.split('; ').find(row => row.startsWith('token='))
      : null;

    if (token) {
      loadCart();
    }
  }, [store]);

  // Wrapper functions with better error handling
  const addItem = useCallback(
    async (product: Product, quantity: number = 1, customizations?: CartItemCustomizations) => {
      try {
        await store.addItem(product, quantity, customizations);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to add item to cart');
      }
    },
    [store]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        await store.removeItem(itemId);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to remove item from cart');
      }
    },
    [store]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await store.updateQuantity(itemId, quantity);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update quantity');
      }
    },
    [store]
  );

  const clearCart = useCallback(async () => {
    try {
      await store.clearCart();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear cart');
    }
  }, [store]);

  const applyPromoCode = useCallback(
    async (code: string) => {
      try {
        return await store.applyPromoCode(code);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to apply promo code');
      }
    },
    [store]
  );

  return {
    // State
    items: store.items,
    totalItems: store.totalItems,
    subtotal: store.subtotal,
    tax: store.tax,
    shipping: store.shipping,
    discount: store.discount,
    total: store.total,
    isLoading: store.isLoading,
    error: store.error,
    promoCode: store.promoCode,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart: store.isInCart,
    getItem: store.getItem,
    getProductQuantity: store.getProductQuantity,
    applyPromoCode,
    removePromoCode: store.removePromoCode,
    calculateShipping: store.calculateShipping,
    syncCart: store.syncCart,
    validateCart: store.validateCart,
  };
}

export default useCart;

