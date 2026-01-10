'use client';


/**
 * Enhanced CartContext - Production Ready
 * Provides cart state and actions with backend sync
 * 
 * @module context/CartContext
 */



import { createContext, useContext, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useCartSync } from '@/hooks/useCartSync';
import type { CartContextValue } from '@/types/cart';

const CartContext = createContext<CartContextValue | null>(null);

/**
 * CartProvider Component
 * Wraps app with cart context and sync functionality
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
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
  const lastSynced = useCartStore((state) => state.lastSynced);

  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const isInCart = useCartStore((state) => state.isInCart);
  const getItem = useCartStore((state) => state.getItem);
  const getProductQuantity = useCartStore((state) => state.getProductQuantity);
  const applyPromoCode = useCartStore((state) => state.applyPromoCode);
  const removePromoCode = useCartStore((state) => state.removePromoCode);
  const calculateShipping = useCartStore((state) => state.calculateShipping);
  const syncCart = useCartStore((state) => state.syncCart);
  const loadCartAction = useCartStore((state) => state.loadCart);
  const validateCart = useCartStore((state) => state.validateCart);

  // Enable cart sync across tabs and with backend
  useCartSync({
    syncInterval: 30000, // Sync every 30 seconds
    enableCrossTab: true,
  });

  // Load cart from backend on mount (if authenticated)
  useEffect(() => {
    const fetchCart = async () => {
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
      fetchCart();
    }
  }, [loadCartAction]);

  const value: CartContextValue = {
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
    lastSynced,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItem,
    getProductQuantity,
    applyPromoCode,
    removePromoCode,
    calculateShipping,
    syncCart,
    loadCart: loadCartAction,
    validateCart,
    clearCorruptedCart: () => {
      console.warn('clearCorruptedCart not implemented in store');
    },
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

