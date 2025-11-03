'use client';

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'cart-items';

const CartContext = createContext(null);

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

const calculateTotals = (items) => {
  return {
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  };
};

export function CartProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        return {
          items: parsedCart,
          ...calculateTotals(parsedCart)
        };
      }
    }
    return initialState;
  });

  const { success } = useToast();

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

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
          productId: product.id,
          product,
          quantity,
          customizations,
          measurements
        }];
      }

      success('Item added to cart');
      
      return {
        items: newItems,
        ...calculateTotals(newItems)
      };
    });
  }, [success]);

  const removeItem = useCallback((productId) => {
    setState(current => {
      const newItems = current.items.filter(item => item.productId !== productId);
      success('Item removed from cart');
      return {
        items: newItems,
        ...calculateTotals(newItems)
      };
    });
  }, [success]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) {
      return removeItem(productId);
    }

    setState(current => {
      const newItems = current.items.map(item => {
        if (item.productId === productId) {
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

  const clearCart = useCallback(() => {
    setState(initialState);
    success('Cart cleared');
  }, [success]);

  const isInCart = useCallback((productId) => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart
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
