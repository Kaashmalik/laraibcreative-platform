import { create } from 'zustand';

interface UIState {
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = typeof window === 'undefined'
  ? // Server-side: return mock
    ((selector?: any) => {
      const defaultState: UIState = {
        isQuickViewOpen: false,
        quickViewProductId: null,
        openQuickView: () => {},
        closeQuickView: () => {},
        isCartOpen: false,
        toggleCart: () => {},
        openCart: () => {},
        closeCart: () => {},
        isMobileMenuOpen: false,
        toggleMobileMenu: () => {},
        closeMobileMenu: () => {},
      };
      return selector ? selector(defaultState) : defaultState;
    }) as any
  : // Client-side: create actual store
    create<UIState>((set) => ({
      // Quick View Modal
      isQuickViewOpen: false,
      quickViewProductId: null,
      openQuickView: (productId) => set({ isQuickViewOpen: true, quickViewProductId: productId }),
      closeQuickView: () => set({ isQuickViewOpen: false, quickViewProductId: null }),

      // Cart Drawer
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Mobile Menu
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }));
