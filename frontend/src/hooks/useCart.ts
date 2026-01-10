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
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const subtotal = useCartStore((state) => state.subtotal);
  const tax = useCartStore((state) => state.tax);
  const shipping = useCartStore((state) => state.shipping);
  const discount = useCartStore((state) => state.discount);
  const total = useCartStore((state) => state.total);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const promoCode = useCartStore((state) => state.promoCode);

  const addItemAction = useCartStore((state) => state.addItem);
  const removeItemAction = useCartStore((state) => state.removeItem);
  const updateQuantityAction = useCartStore((state) => state.updateQuantity);
  const clearCartAction = useCartStore((state) => state.clearCart);
  const isInCartAction = useCartStore((state) => state.isInCart);
  const getItemAction = useCartStore((state) => state.getItem);
  const getProductQuantityAction = useCartStore((state) => state.getProductQuantity);
  const applyPromoCodeAction = useCartStore((state) => state.applyPromoCode);
  const removePromoCodeAction = useCartStore((state) => state.removePromoCode);
  const calculateShippingAction = useCartStore((state) => state.calculateShipping);
  const syncCartAction = useCartStore((state) => state.syncCart);
  const validateCartAction = useCartStore((state) => state.validateCart);
  const loadCartAction = useCartStore((state) => state.loadCart);
  const clearCorruptedCartAction = useCartStore((state) => state.clearCorruptedCart);

  // Clear corrupted cart on mount and load from backend (if authenticated)
  useEffect(() => {
    // Clear any corrupted cart items
    clearCorruptedCartAction();

    const loadCart = async () => {
      try {
        await loadCartAction();
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };

    // Check if user is authenticated
    const token = typeof window !== 'undefined'
      ? document.cookie.split('; ').find(row => row.startsWith('token='))
      : null;

    if (token) {
      loadCart();
    }
  }, [clearCorruptedCartAction, loadCartAction]);

  // Wrapper functions with better error handling
  const addItem = useCallback(
    async (product: Product, quantity: number = 1, customizations?: CartItemCustomizations) => {
      try {
        await addItemAction(product, quantity, customizations);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to add item to cart');
      }
    },
    [addItemAction]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        await removeItemAction(itemId);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to remove item from cart');
      }
    },
    [removeItemAction]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await updateQuantityAction(itemId, quantity);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update quantity');
      }
    },
    [updateQuantityAction]
  );

  const clearCart = useCallback(async () => {
    try {
      await clearCartAction();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to clear cart');
    }
  }, [clearCartAction]);

  const applyPromoCode = useCallback(
    async (code: string) => {
      try {
        return await applyPromoCodeAction(code);
      } catch (err: any) {
        throw new Error(err.message || 'Failed to apply promo code');
      }
    },
    [applyPromoCodeAction]
  );

  return {
    // State
    items,
    totalItems,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    isLoading,
    error,
    promoCode,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart: isInCartAction,
    getItem: getItemAction,
    getProductQuantity: getProductQuantityAction,
    applyPromoCode,
    removePromoCode: removePromoCodeAction,
    calculateShipping: calculateShippingAction,
    syncCart: syncCartAction,
    validateCart: validateCartAction,
  };
}

export default useCart;

