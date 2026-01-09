/**
 * Cart Store (Zustand)
 * Persists to localStorage + syncs to backend API
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/types/product'
import type { CartItem, CartItemCustomizations, ShippingAddress } from '@/types/cart'

interface CartState {
  items: CartItem[]
  totalItems: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  promoCode?: string
  isLoading: boolean
  error: string | null
  lastSynced?: string
}

interface CartActions {
  addItem: (product: Product, quantity?: number, customizations?: CartItemCustomizations) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (productId: string) => boolean
  getItem: (productId: string) => CartItem | undefined
  getProductQuantity: (productId: string) => number
  applyPromoCode: (code: string) => Promise<{ success: boolean; discount: number; message?: string }>
  removePromoCode: () => void
  calculateShipping: (address?: ShippingAddress) => Promise<number>
  syncCart: () => Promise<void>
  loadCart: () => Promise<void>
  validateCart: () => Promise<{ valid: boolean; errors: Array<{ itemId: string; productId: string; message: string }> }>
  clearCorruptedCart: () => void
}

interface CartStore extends CartState, CartActions {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getItemById: (itemId: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      promoCode: undefined,
      isLoading: false,
      error: null,
      isOpen: false,

      addItem: async (product, quantity = 1, customizations) => {
        set({ isLoading: true, error: null })
        
        try {
          const productId = product._id || product.id || ''
          const newItem: CartItem = {
            id: `${productId}-${Date.now()}`,
            productId,
            product,
            quantity,
            customizations,
            addedAt: new Date().toISOString(),
            priceAtAdd: product.price,
          }

          set((state) => {
            const existingIndex = state.items.findIndex(
              item =>
                item.productId === productId &&
                JSON.stringify(item.customizations) === JSON.stringify(customizations)
            )

            if (existingIndex > -1) {
              const updated = [...state.items]
              updated[existingIndex].quantity += quantity
              return {
                items: updated,
                totalItems: updated.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
                subtotal: updated.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
                total: updated.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0) - state.discount + state.shipping,
                isOpen: true
              }
            }

            const newItems = [...state.items, newItem]
            return {
              items: newItems,
              totalItems: newItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              subtotal: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
              total: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0) - state.discount + state.shipping,
              isOpen: true
            }
          })
        } catch (error) {
          set({ error: 'Failed to add item to cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null })
        
        try {
          set((state) => {
            const newItems = state.items.filter(item => item.id !== itemId)
            return {
              items: newItems,
              totalItems: newItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              subtotal: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
              total: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0) - state.discount + state.shipping
            }
          })
        } catch (error) {
          set({ error: 'Failed to remove item from cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null })
        
        try {
          if (quantity <= 0) {
            await get().removeItem(itemId)
            return
          }

          set((state) => {
            const newItems = state.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            )
            return {
              items: newItems,
              totalItems: newItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              subtotal: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
              total: newItems.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0) - state.discount + state.shipping
            }
          })
        } catch (error) {
          set({ error: 'Failed to update quantity' })
        } finally {
          set({ isLoading: false })
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null })
        
        try {
          set({
            items: [],
            totalItems: 0,
            subtotal: 0,
            total: 0,
            discount: 0,
            shipping: 0
          })
        } catch (error) {
          set({ error: 'Failed to clear cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      isInCart: (productId) => {
        return get().items.some(item => item.productId === productId)
      },

      getItem: (productId) => {
        return get().items.find(item => item.productId === productId)
      },

      getProductQuantity: (productId) => {
        return get().items
          .filter(item => item.productId === productId)
          .reduce((sum, item) => sum + item.quantity, 0)
      },

      applyPromoCode: async (code: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/v1/cart/promo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code })
          })
          
          const data = await response.json()
          
          if (data.success) {
            set({
              promoCode: code,
              discount: data.discount || 0,
              total: get().subtotal - (data.discount || 0) + get().shipping
            })
            return { success: true, discount: data.discount, message: data.message }
          }
          
          return { success: false, discount: 0, message: data.message || 'Invalid promo code' }
        } catch (error) {
          set({ error: 'Failed to apply promo code' })
          return { success: false, discount: 0, message: 'Network error' }
        } finally {
          set({ isLoading: false })
        }
      },

      removePromoCode: () => {
        set({
          promoCode: undefined,
          discount: 0,
          total: get().subtotal + get().shipping
        })
      },

      calculateShipping: async (address?: ShippingAddress) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/v1/cart/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ address })
          })
          
          const data = await response.json()
          
          if (data.success) {
            const shippingCost = data.cost || 0
            set({
              shipping: shippingCost,
              total: get().subtotal - get().discount + shippingCost
            })
            return shippingCost
          }
          
          return 0
        } catch (error) {
          set({ error: 'Failed to calculate shipping' })
          return 0
        } finally {
          set({ isLoading: false })
        }
      },

      syncCart: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/v1/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              items: get().items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtAdd: item.priceAtAdd,
                customizations: item.customizations,
                isCustom: item.isCustom || false
              }))
            })
          })
          
          const data = await response.json()
          
          if (data.success && data.items) {
            set({
              items: data.items,
              totalItems: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              subtotal: data.items.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
              lastSynced: new Date().toISOString()
            })
          }
        } catch (error) {
          set({ error: 'Failed to sync cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      loadCart: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/v1/cart', {
            credentials: 'include'
          })
          
          const data = await response.json()
          
          if (data.success && data.items) {
            set({
              items: data.items,
              totalItems: data.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),
              subtotal: data.items.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0),
              total: data.items.reduce((sum: number, item: CartItem) => sum + (item.priceAtAdd || 0) * item.quantity, 0) - get().discount + get().shipping,
              lastSynced: new Date().toISOString()
            })
          }
        } catch (error) {
          set({ error: 'Failed to load cart' })
        } finally {
          set({ isLoading: false })
        }
      },

      validateCart: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/v1/cart/validate', {
            method: 'POST',
            credentials: 'include'
          })
          
          const data = await response.json()
          
          if (data.success) {
            return {
              valid: data.valid,
              errors: data.errors || []
            }
          }
          
          return {
            valid: false,
            errors: []
          }
        } catch (error) {
          set({ error: 'Failed to validate cart' })
          return {
            valid: false,
            errors: []
          }
        } finally {
          set({ isLoading: false })
        }
      },

      clearCorruptedCart: () => {
        set((state) => ({
          items: state.items.filter(item =>
            item.id &&
            item.productId &&
            item.quantity > 0 &&
            item.product &&
            item.product.title &&
            item.product.price
          )
        }))
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getItemById: (itemId) => get().items.find(item => item.id === itemId),
    }),
    {
      name: 'laraib-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, lastSynced: state.lastSynced }),
    }
  )
)

// Helper functions
export async function syncCartToBackend() {
  const store = useCartStore.getState()
  await store.syncCart()
}

export async function loadCartFromBackend() {
  const store = useCartStore.getState()
  await store.loadCart()
}
