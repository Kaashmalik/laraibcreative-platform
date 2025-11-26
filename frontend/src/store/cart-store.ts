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

// Hook to sync cart with Supabase when user logs in
export async function syncCartToSupabase(userId: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const items = useCartStore.getState().items

  // Clear existing cart items for user
  await supabase.from('cart_items').delete().eq('user_id', userId)

  // Insert current cart items
  if (items.length > 0) {
    await supabase.from('cart_items').insert(
      items.map(item => ({
        user_id: userId,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        customization: item.customization || null,
      }))
    )
  }
}

// Hook to load cart from Supabase when user logs in
// TODO: Implement batch product fetching from TiDB
export async function loadCartFromSupabase(userId: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  // @ts-expect-error - Types will be available after running: npx supabase gen types
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)

  if (!cartItems || cartItems.length === 0) return

  // Merge with local cart
  const localItems = useCartStore.getState().items
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const item of cartItems as any[]) {
    const exists = localItems.some(
      (local: CartItem) => local.productId === item.product_id && local.variantId === item.variant_id
    )
    
    if (!exists) {
      // TODO: Fetch product details from TiDB using batch API
      // For now, items without product details are skipped
      console.log('Cart item needs product details:', item.product_id)
    }
  }
}
