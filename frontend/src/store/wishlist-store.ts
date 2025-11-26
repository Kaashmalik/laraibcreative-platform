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

// Sync wishlist to Supabase
// TODO: Regenerate Supabase types after running migrations
export async function syncWishlistToSupabase(userId: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const items = useWishlistStore.getState().items

  // Clear existing wishlist for user
  await supabase.from('wishlists').delete().eq('user_id', userId)

  // Insert current wishlist items
  if (items.length > 0) {
    const wishlistData = items.map(item => ({
      user_id: userId,
      product_id: item.productId,
      created_at: item.addedAt
    }))
    // @ts-expect-error - Types will be available after running: npx supabase gen types
    await supabase.from('wishlists').insert(wishlistData)
  }
}

// Load wishlist from Supabase
export async function loadWishlistFromSupabase(userId: string) {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  const { data: wishlistItems } = await supabase
    .from('wishlists')
    .select('product_id, created_at')
    .eq('user_id', userId) as { data: { product_id: string; created_at: string }[] | null }

  if (!wishlistItems || wishlistItems.length === 0) return

  // Merge with local wishlist (local takes priority for product details)
  const store = useWishlistStore.getState()
  const localItems = store.items
  
  wishlistItems.forEach((item) => {
    const exists = localItems.some((local: WishlistItem) => local.productId === item.product_id)
    if (!exists) {
      store.addItem(item.product_id)
    }
  })
}
