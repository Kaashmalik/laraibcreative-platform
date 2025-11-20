'use client';

/**
 * Enhanced CartContext - Production Ready
 * Provides cart state and actions with backend sync
 * 
 * @module context/CartContext
 */

import { createContext, useContext, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCartSync } from '@/hooks/useCartSync';
import type { CartContextValue, Product, CartItemCustomizations } from '@/types/cart';

const CartContext = createContext<CartContextValue | null>(null);

/**
 * CartProvider Component
 * Wraps app with cart context and sync functionality
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = useCartStore();

  // Enable cart sync across tabs and with backend
  useCartSync({
    syncInterval: 30000, // Sync every 30 seconds
    enableCrossTab: true,
  });

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

  const value: CartContextValue = {
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
    lastSynced: store.lastSynced,

    // Actions
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isInCart: store.isInCart,
    getItem: store.getItem,
    getProductQuantity: store.getProductQuantity,
    applyPromoCode: store.applyPromoCode,
    removePromoCode: store.removePromoCode,
    calculateShipping: store.calculateShipping,
    syncCart: store.syncCart,
    loadCart: store.loadCart,
    validateCart: store.validateCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * useCartContext Hook
 * Access cart context
 * 
 * @throws {Error} If used outside CartProvider
 */
export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}

/**
 * useCart Hook (alias for useCartContext)
 * Access cart context - provided for backward compatibility
 * 
 * @throws {Error} If used outside CartProvider
 */
export const useCart = useCartContext;

export default CartProvider;

