/**
 * Cart Store (Zustand)
 * Persists to localStorage + syncs to Supabase for logged-in users
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  variantId?: string
  quantity: number
  customization?: {
    isStitched: boolean
    measurementId?: string
    neckStyle?: string
    sleeveStyle?: string
    bottomStyle?: string
  }
  product: {
    title: string
    slug: string
    image: string
    price: number
    salePrice?: number
    stitchingPrice?: number
  }
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateCustomization: (itemId: string, customization: CartItem['customization']) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  
  // Drawer
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  
  // Computed
  getItemCount: () => number
  getSubtotal: () => number
  getStitchingTotal: () => number
  getTotal: () => number
  getItemById: (id: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const id = crypto.randomUUID()
        set((state) => {
          // Check if same product+variant+customization exists
          const existingIndex = state.items.findIndex(
            item => 
              item.productId === newItem.productId && 
              item.variantId === newItem.variantId &&
              JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
          )
          
          if (existingIndex > -1) {
            const updated = [...state.items]
            updated[existingIndex].quantity += newItem.quantity
            return { items: updated, isOpen: true }
          }
          
          return { items: [...state.items, { ...newItem, id }], isOpen: true }
        })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        }))
      },

      updateCustomization: (itemId, customization) => {
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, customization } : item
          )
        }))
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () => get().items.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price
        return sum + (price * item.quantity)
      }, 0),

      getStitchingTotal: () => get().items.reduce((sum, item) => {
        if (item.customization?.isStitched && item.product.stitchingPrice) {
          return sum + (item.product.stitchingPrice * item.quantity)
        }
        return sum
      }, 0),

      getTotal: () => get().getSubtotal() + get().getStitchingTotal(),

      getItemById: (id) => get().items.find(item => item.id === id),
    }),
    {
      name: 'laraib-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)

// Hook to sync cart with backend API when user logs in
// Unified with backend JWT authentication
export async function syncCartToBackend() {
  const items = useCartStore.getState().items

  try {
    // TODO: Implement cart sync with backend API
    // await api.cart.sync({ items: items.map(item => ({
    //   productId: item.productId,
    //   variantId: item.variantId,
    //   quantity: item.quantity,
    //   customization: item.customization
    // })) })
    console.log('Cart sync not yet implemented', items.length, 'items')
  } catch (error) {
    console.error('Failed to sync cart to backend:', error)
  }
}

// Hook to load cart from backend API when user logs in
// Unified with backend JWT authentication
export async function loadCartFromBackend() {
  try {
    // TODO: Implement cart loading from backend API
    // const response = await api.cart.get()
    // if (response.success && response.data) {
    //   const store = useCartStore.getState()
    //   const localItems = store.items
    //   
    //   response.data.items.forEach((item: any) => {
    //     const exists = localItems.some(
    //       (local: CartItem) => local.productId === item.productId && local.variantId === item.variantId
    //     )

    //     if (!exists) {
    //       // TODO: Fetch product details from TiDB using batch API
    //       // For now, items without product details are skipped
    //       console.log('Cart item needs product details:', item.product_id)
    //     }
    //   })
    // }
    console.log('Cart load from backend not yet implemented')
  } catch (error) {
    console.error('Failed to load cart from backend:', error)
  }
}
