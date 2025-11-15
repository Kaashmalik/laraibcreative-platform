'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Add item to cart
  const addToCart = useCallback((product, options = {}) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.product._id === product._id && 
          JSON.stringify(item.options) === JSON.stringify(options)
      );

      if (existingIndex > -1) {
        // Item exists, update quantity
        const updated = [...prev];
        updated[existingIndex].quantity += options.quantity || 1;
        toast.success('Cart updated');
        return updated;
      } else {
        // New item
        toast.success('Added to cart');
        return [
          ...prev,
          {
            id: Date.now() + Math.random(),
            product,
            quantity: options.quantity || 1,
            options,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  }, [toast]);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info('Item removed from cart');
  }, [toast]);

  // Update item quantity
  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.info('Cart cleared');
  }, [toast]);

  // Calculate totals
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product.pricing?.basePrice || 0;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
    itemCount: getItemCount(),
    total: getCartTotal(),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}