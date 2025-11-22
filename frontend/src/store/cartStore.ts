/**
 * Zustand Cart Store with Middleware
 * Production-ready cart state management
 * 
 * @module store/cartStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CartStore, CartItem, CartItemCustomizations, ShippingAddress, PromoCodeResponse } from '@/types/cart';
import type { Product } from '@/types/product';
import api from '@/lib/api';

/**
 * Calculate cart totals
 */
function calculateTotals(items: CartItem[], taxRate: number = 0.05, shipping: number = 0, discount: number = 0): {
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
} {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.priceAtAdd || item.product.pricing?.basePrice || item.product.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * taxRate;
  const total = Math.max(0, subtotal + tax + shipping - discount);
  
  return {
    totalItems,
    subtotal,
    tax,
    shipping,
    discount,
    total,
  };
}

/**
 * Cart Store with Persistence and Sync
 */
export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      subscribeWithSelector(
      (set, get) => ({
        // Initial State
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        isLoading: false,
        error: null,
        lastSynced: undefined,

        // Actions
        addItem: async (product: Product, quantity: number = 1, customizations?: CartItemCustomizations) => {
          try {
            set({ isLoading: true, error: null });

            // Validate quantity
            if (quantity < 1 || quantity > 99) {
              throw new Error('Quantity must be between 1 and 99');
            }

            // Check stock availability
            const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
            if (stockAvailable > 0 && quantity > stockAvailable) {
              throw new Error(`Only ${stockAvailable} items available in stock`);
            }

            const currentItems = get().items;
            const existingItemIndex = currentItems.findIndex(
              item =>
                item.productId === product._id || item.productId === product.id &&
                JSON.stringify(item.customizations || {}) === JSON.stringify(customizations || {})
            );

            let newItems: CartItem[];
            if (existingItemIndex >= 0) {
              // Update existing item
              const existingItem = currentItems[existingItemIndex];
              const newQuantity = existingItem.quantity + quantity;
              
              if (stockAvailable > 0 && newQuantity > stockAvailable) {
                throw new Error(`Cannot add more. Only ${stockAvailable} items available in stock`);
              }

              newItems = currentItems.map((item, index) => {
                if (index === existingItemIndex) {
                  return {
                    ...item,
                    quantity: newQuantity,
                  };
                }
                return item;
              });
            } else {
              // Add new item
              const newItem: CartItem = {
                id: `${product._id || product.id}_${Date.now()}`,
                productId: product._id || product.id || '',
                product,
                quantity,
                customizations: customizations || {},
                isCustom: !!customizations?.measurements,
                addedAt: new Date().toISOString(),
                stockAvailable,
                priceAtAdd: product.pricing?.basePrice || product.price,
              };
              newItems = [...currentItems, newItem];
            }

            const totals = calculateTotals(newItems, 0.05, get().shipping, get().discount);

            set({
              items: newItems,
              ...totals,
              isLoading: false,
            });

            // Sync with backend (non-blocking)
            get().syncCart().catch(console.error);
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to add item to cart',
            });
            throw error;
          }
        },

        removeItem: async (itemId: string) => {
          try {
            set({ isLoading: true, error: null });

            const newItems = get().items.filter(item => item.id !== itemId);
            const currentShipping = get().shipping;
            const currentDiscount = get().discount;
            const totals = calculateTotals(newItems, 0.05, currentShipping, currentDiscount);

            set({
              items: newItems,
              ...totals,
              isLoading: false,
            });

            // Sync with backend
            await get().syncCart();
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to remove item',
            });
            throw error;
          }
        },

        updateQuantity: async (itemId: string, quantity: number) => {
          try {
            if (quantity < 1) {
              return get().removeItem(itemId);
            }

            if (quantity > 99) {
              throw new Error('Maximum quantity is 99');
            }

            set({ isLoading: true, error: null });

            const item = get().items.find(i => i.id === itemId);
            if (!item) {
              throw new Error('Item not found in cart');
            }

            // Check stock
            const stockAvailable = item.stockAvailable || item.product.inventory?.stockQuantity || item.product.stockQuantity || 0;
            if (stockAvailable > 0 && quantity > stockAvailable) {
              throw new Error(`Only ${stockAvailable} items available in stock`);
            }

            const newItems = get().items.map(item => {
              if (item.id === itemId) {
                return { ...item, quantity };
              }
              return item;
            });

            const currentShipping = get().shipping;
            const currentDiscount = get().discount;
            const totals = calculateTotals(newItems, 0.05, currentShipping, currentDiscount);

            set({
              items: newItems,
              ...totals,
              isLoading: false,
            });

            // Sync with backend
            await get().syncCart();
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to update quantity',
            });
            throw error;
          }
        },

        clearCart: async () => {
          try {
            set({ isLoading: true, error: null });

            set({
              items: [],
              totalItems: 0,
              subtotal: 0,
              tax: 0,
              shipping: 0,
              discount: 0,
              total: 0,
              promoCode: undefined,
              isLoading: false,
            });

            // Sync with backend
            await get().syncCart();
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to clear cart',
            });
            throw error;
          }
        },

        isInCart: (productId: string) => {
          return get().items.some(item => item.productId === productId);
        },

        getItem: (productId: string) => {
          return get().items.find(item => item.productId === productId);
        },

        getProductQuantity: (productId: string) => {
          return get().items
            .filter(item => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
        },

        applyPromoCode: async (code: string) => {
          try {
            set({ isLoading: true, error: null });

            const response = await api.cart.applyPromoCode(code, get().items) as any;
            
            if (response.success) {
              const currentSubtotal = get().subtotal;
              const currentShipping = get().shipping;
              const discount = response.discountType === 'percentage'
                ? (currentSubtotal * response.discount) / 100
                : response.discount;

              const totals = calculateTotals(
                get().items,
                0.05,
                currentShipping,
                discount
              );

              set({
                ...totals,
                discount,
                promoCode: code,
                isLoading: false,
              });

              return { success: true, discount, message: response.message };
            } else {
              throw new Error(response.message || 'Invalid promo code');
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to apply promo code',
            });
            throw error;
          }
        },

        removePromoCode: () => {
          const currentShipping = get().shipping;
          const totals = calculateTotals(get().items, 0.05, currentShipping, 0);
          set({
            ...totals,
            discount: 0,
            promoCode: undefined,
          });
        },

        calculateShipping: async (address?: ShippingAddress) => {
          try {
            // Free shipping over 5000 PKR
            if (get().subtotal >= 5000) {
              set({ shipping: 0 });
              return 0;
            }

            // Calculate based on address if provided
            if (address) {
              const response = await api.cart.calculateShipping(address, get().items);
              set({ shipping: response.cost });
              return response.cost;
            }

            // Default flat rate
            const defaultShipping = 200;
            set({ shipping: defaultShipping });
            return defaultShipping;
          } catch (error: any) {
            // Fallback to default shipping
            const defaultShipping = 200;
            set({ shipping: defaultShipping });
            return defaultShipping;
          }
        },

        syncCart: async () => {
          try {
            // Only sync if user is authenticated
            const token = typeof window !== 'undefined' 
              ? document.cookie.split('; ').find(row => row.startsWith('token='))
              : null;
            
            if (!token) return;

            const response = await api.cart.sync(get().items) as any;
            
            if (response.success) {
              set({
                lastSynced: new Date().toISOString(),
              });
            }
          } catch (error) {
            // Fail silently - cart is still in localStorage
            console.error('Cart sync failed:', error);
          }
        },

        loadCart: async () => {
          try {
            set({ isLoading: true, error: null });

            const token = typeof window !== 'undefined' 
              ? document.cookie.split('; ').find(row => row.startsWith('token='))
              : null;
            
            if (!token) {
              set({ isLoading: false });
              return;
            }

            const response = await api.cart.get() as any;
            
            if (response.items && response.items.length > 0) {
              const totals = calculateTotals(response.items, 0.05, get().shipping, get().discount);
              set({
                items: response.items,
                ...totals,
                isLoading: false,
                lastSynced: new Date().toISOString(),
              });
            } else {
              set({ isLoading: false });
            }
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to load cart',
            });
          }
        },

        validateCart: async () => {
          try {
            const errors: Array<{ itemId: string; productId: string; message: string }> = [];
            const items = get().items;

            for (const item of items) {
              // Check if product still exists
              try {
                const response = await api.products.getById(item.productId);
                const product = response.data;
                
                // Check stock
                const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
                if (stockAvailable > 0 && item.quantity > stockAvailable) {
                  errors.push({
                    itemId: item.id,
                    productId: item.productId,
                    message: `Only ${stockAvailable} items available in stock`,
                  });
                }

                // Check price changes
                const currentPrice = product.pricing?.basePrice || product.price || 0;
                const cartPrice = item.priceAtAdd || currentPrice;
                if (Math.abs(currentPrice - cartPrice) > 0.01) {
                  errors.push({
                    itemId: item.id,
                    productId: item.productId,
                    message: 'Product price has changed',
                  });
                }
              } catch (error) {
                errors.push({
                  itemId: item.id,
                  productId: item.productId,
                  message: 'Product no longer available',
                });
              }
            }

            return {
              valid: errors.length === 0,
              errors,
            };
          } catch (error: any) {
            return {
              valid: false,
              errors: [{ itemId: '', productId: '', message: error.message || 'Validation failed' }],
            };
          }
        },
      })
      ),
      {
        name: 'laraibcreative-cart',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          items: state.items,
          promoCode: state.promoCode,
          discount: state.discount,
        }),
      }
    ),
    { name: 'CartStore' }
  )
);

// Analytics middleware - track cart events
useCartStore.subscribe(
  (state) => state.totalItems,
  (totalItems, prevTotalItems) => {
    if (typeof window !== 'undefined' && totalItems !== prevTotalItems) {
      // Track add to cart events
      if (window.gtag) {
        window.gtag('event', 'cart_item_count', {
          value: totalItems,
        });
      }
      
      // Facebook Pixel
      if (window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_ids: state.items.map(item => item.productId),
          value: state.subtotal,
          currency: 'PKR',
        });
      }
    }
  }
);

// Track cart abandonment
useCartStore.subscribe(
  (state) => state.items.length,
  (itemCount) => {
    if (typeof window !== 'undefined' && itemCount > 0) {
      // Set abandonment timer (30 minutes)
      const abandonmentTimer = setTimeout(() => {
        const currentItems = useCartStore.getState().items;
        if (currentItems.length > 0) {
          // Track abandonment
          if (window.gtag) {
            window.gtag('event', 'cart_abandonment', {
              value: useCartStore.getState().subtotal,
              currency: 'PKR',
            });
          }
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      return () => clearTimeout(abandonmentTimer);
    }
  }
);

// Export as default
export default useCartStore;

