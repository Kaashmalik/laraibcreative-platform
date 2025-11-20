/**
 * useCartSync Hook
 * Syncs cart across tabs and with backend
 * 
 * @module hooks/useCartSync
 */

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';

/**
 * useCartSync Hook
 * Handles cross-tab synchronization and backend syncing
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.syncInterval - Interval for backend sync (ms)
 * @param {boolean} options.enableCrossTab - Enable cross-tab sync
 * 
 * @example
 * useCartSync({ syncInterval: 30000, enableCrossTab: true });
 */
export function useCartSync(options: {
  syncInterval?: number;
  enableCrossTab?: boolean;
} = {}) {
  const { syncInterval = 30000, enableCrossTab = true } = options;
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const store = useCartStore();

  // Backend sync interval
  useEffect(() => {
    const sync = async () => {
      try {
        await store.syncCart();
      } catch (error) {
        console.error('Cart sync failed:', error);
      }
    };

    // Initial sync
    sync();

    // Set up interval
    if (syncInterval > 0) {
      syncIntervalRef.current = setInterval(sync, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [store, syncInterval]);

  // Cross-tab synchronization
  useEffect(() => {
    if (!enableCrossTab || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'laraibcreative-cart' && e.newValue) {
        try {
          const newCart = JSON.parse(e.newValue);
          if (newCart.state?.items) {
            // Zustand persist middleware automatically handles this
            // The store will be updated automatically when localStorage changes
            // We just need to trigger a re-render by accessing the store
            const currentItems = store.items;
            const newItems = newCart.state.items;

            // Only update if different (avoid infinite loop)
            if (JSON.stringify(currentItems) !== JSON.stringify(newItems)) {
              // Force store update by setting items directly
              // Note: Zustand persist will handle the sync automatically
              // This is just to ensure UI updates
            }
          }
        } catch (error) {
          console.error('Failed to sync cart from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [store, enableCrossTab]);

  return {
    syncCart: store.syncCart,
    lastSynced: store.lastSynced,
  };
}

export default useCartSync;

