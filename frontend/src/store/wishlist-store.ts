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
  synced: boolean
  
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
      synced: false,

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

      clearWishlist: () => set({ items: [], synced: false }),

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
  try {
    const axiosInstance = (await import('@/lib/axios')).default
    const response = await axiosInstance.post('/customers/wishlist', {
      items: useWishlistStore.getState().items
    }) as any;
    if (response.success) {
      // Update synced state using setState
      useWishlistStore.setState({ synced: true });
    }
  } catch (error) {
    console.error('Failed to sync wishlist:', error);
  }
}

// Load wishlist from backend API
export async function loadWishlistFromBackend() {
  try {
    const axiosInstance = (await import('@/lib/axios')).default
    const response = await axiosInstance.get('/customers/wishlist') as any;
    if (response.success && response.data) {
      const backendItems = response.data.items || [];
      const localItems = useWishlistStore.getState().items;
      
      // Merge: backend items + local items not in backend
      const backendIds = new Set(backendItems.map((item: any) => item.productId));
      const localOnlyItems = localItems.filter(item => !backendIds.has(item.productId));
      
      useWishlistStore.setState({ items: [...backendItems, ...localOnlyItems], synced: true });
    }
  } catch (error) {
    console.error('Failed to load wishlist from backend:', error)
  }
}
