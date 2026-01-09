/**
 * Wishlist Store (Zustand)
 * Persists to localStorage + syncs to Supabase
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  addedAt: string
  product?: {
    title: string
    slug: string
    image: string
    price: number
    salePrice?: number
  }
}

interface WishlistStore {
  items: WishlistItem[]
  
  // Actions
  addItem: (productId: string, product?: WishlistItem['product']) => void
  removeItem: (productId: string) => void
  toggleItem: (productId: string, product?: WishlistItem['product']) => void
  clearWishlist: () => void
  
  // Queries
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, product) => {
        set((state) => {
          if (state.items.some(item => item.productId === productId)) {
            return state // Already exists
          }
          return {
            items: [...state.items, {
              productId,
              addedAt: new Date().toISOString(),
              product
            }]
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }))
      },

      toggleItem: (productId, product) => {
        const exists = get().isInWishlist(productId)
        if (exists) {
          get().removeItem(productId)
        } else {
          get().addItem(productId, product)
        }
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => 
        get().items.some(item => item.productId === productId),

      getItemCount: () => get().items.length,
    }),
    {
      name: 'laraib-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Sync wishlist to backend API
// Unified with backend JWT authentication
export async function syncWishlistToBackend() {
  const items = useWishlistStore.getState().items

  try {
    // TODO: Implement wishlist sync with backend API
    // await api.customers.syncWishlist({ items: items.map(item => ({
    //   productId: item.productId,
    //   addedAt: item.addedAt
    // })) })
    console.log('Wishlist sync not yet implemented', items.length, 'items')
  } catch (error) {
    console.error('Failed to sync wishlist to backend:', error)
  }
}

// Load wishlist from backend API
export async function loadWishlistFromBackend() {
  try {
    // TODO: Implement wishlist loading from backend API
    // const response = await api.customers.getWishlist()
    // if (response.success && response.data) {
    //   const store = useWishlistStore.getState()
    //   const localItems = store.items
    //   
    //   response.data.forEach((item: any) => {
    //     const exists = localItems.some((local: WishlistItem) => local.productId === item.productId)
    //     if (!exists) {
    //       store.addItem(item.productId)
    //     }
    //   })
    // }
    console.log('Wishlist load from backend not yet implemented')
  } catch (error) {
    console.error('Failed to load wishlist from backend:', error)
  }
}
