'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// Calculate totals helper
const calculateTotals = (items) => {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  };
};

// Debounce helper for API calls
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

export function CartProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync cart with backend (debounced)
  const syncCartToBackend = useCallback(async (items) => {
    try {
      // Only sync if user is authenticated
      const token = document.cookie.split('; ').find(row => row.startsWith('token='));
      if (!token) return;
      
      // Call your API to sync cart
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.split('=')[1]}`
        },
        body: JSON.stringify({ items })
      });
    } catch (err) {
      console.error('Cart sync failed:', err);
      // Don't show error to user, fail silently
    }
  }, []);
  
  const debouncedSync = useDebounce(syncCartToBackend, 1000);
  
  // Sync cart changes to backend
  useEffect(() => {
    if (state.items.length > 0) {
      debouncedSync(state.items);
    }
  }, [state.items, debouncedSync]);
  
  // Track cart events for analytics
  const trackCartEvent = useCallback((eventName, data) => {
    if (window.gtag) {
      window.gtag('event', eventName, data);
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ecommerce: data
      });
    }
  }, []);

  // Add item to cart
  const addItem = useCallback((product, quantity = 1, customizations = {}, measurements = {}) => {
    setState(current => {
      const existingItemIndex = current.items.findIndex(item => 
        item.productId === product.id && 
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = current.items.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + quantity
            };
          }
          return item;
        });
      } else {
        // Add new item
        newItems = [...current.items, {
          id: `${product.id}_${Date.now()}`, // Unique cart item ID
          productId: product.id,
          product,
          quantity,
          customizations,
          measurements,
          addedAt: new Date().toISOString()
        }];
      }
      
      // Track add to cart event
      trackCartEvent('add_to_cart', {
        currency: 'PKR',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity
        }]
      });

      toast.success('Item added to cart');
      
      return {
        items: newItems,
        ...calculateTotals(newItems)
      };
    });
  }, [trackCartEvent]);

  // Remove item from cart
  const removeItem = useCallback((cartItemId) => {
    setState(current => {
      const item = current.items.find(i => i.id === cartItemId);
      const newItems = current.items.filter(item => item.id !== cartItemId);
      
      // Track remove from cart
      if (item) {
        trackCartEvent('remove_from_cart', {
          currency: 'PKR',
          value: item.product.price * item.quantity,
          items: [{
            item_id: item.productId,
            item_name: item.product.name,
            item_category: item.product.category,
            price: item.product.price,
            quantity: item.quantity
          }]
        });
      }
      
      toast.success('Item removed from cart');
      
      return {
        items: newItems,
        ...calculateTotals(newItems)
      };
    });
  }, [trackCartEvent]);

  // Update item quantity
  const updateQuantity = useCallback((cartItemId, quantity) => {
    if (quantity < 1) {
      return removeItem(cartItemId);
    }

    setState(current => {
      const newItems = current.items.map(item => {
        if (item.id === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });

      return {
        items: newItems,
        ...calculateTotals(newItems)
      };
    });
  }, [removeItem]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setState(initialState);
    toast.success('Cart cleared');
    
    // Track cart clear
    trackCartEvent('cart_cleared', {});
  }, [trackCartEvent]);

  // Check if product is in cart
  const isInCart = useCallback((productId) => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);
  
  // Get item by product ID
  const getItem = useCallback((productId) => {
    return state.items.find(item => item.productId === productId);
  }, [state.items]);
  
  // Get total quantity for a specific product
  const getProductQuantity = useCallback((productId) => {
    return state.items
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);
  
  // Apply discount code
  const applyDiscount = useCallback(async (code) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, items: state.items })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Discount applied: ${data.discount}% off`);
        return data;
      } else {
        throw new Error(data.message || 'Invalid discount code');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to apply discount');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [state.items]);
  
  // Begin checkout process
  const beginCheckout = useCallback(() => {
    // Track begin checkout
    trackCartEvent('begin_checkout', {
      currency: 'PKR',
      value: state.totalPrice,
      items: state.items.map(item => ({
        item_id: item.productId,
        item_name: item.product.name,
        item_category: item.product.category,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
  }, [state.items, state.totalPrice, trackCartEvent]);

  const value = {
    ...state,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItem,
    getProductQuantity,
    applyDiscount,
    beginCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

// Cart badge component for header
export function CartBadge() {
  const { totalItems } = useCart();
  
  if (totalItems === 0) return null;
  
  return (
    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  );
}

// Calculate shipping cost based on cart
export function useShippingCost() {
  const { totalPrice } = useCart();
  
  // Free shipping over 5000 PKR
  if (totalPrice >= 5000) return 0;
  
  // Flat rate shipping
  return 200;
}