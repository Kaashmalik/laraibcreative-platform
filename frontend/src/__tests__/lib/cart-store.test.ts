/**
 * Cart Store Tests - Phase 8
 */

import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/store/cart-store'

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-123'
global.crypto = {
  ...global.crypto,
  randomUUID: () => mockUUID,
}

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useCartStore())
    act(() => {
      result.current.clearCart()
    })
  })

  const mockProduct = {
    productId: 'prod-1',
    quantity: 1,
    product: {
      title: 'Test Product',
      slug: 'test-product',
      image: '/test.jpg',
      price: 5000,
      salePrice: 4500,
      stitchingPrice: 1000,
    },
  }

  describe('addItem', () => {
    it('should add item to cart', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].productId).toBe('prod-1')
    })

    it('should increase quantity for duplicate items', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.addItem(mockProduct)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(2)
    })

    it('should open cart drawer when adding item', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
      })

      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.updateQuantity(result.current.items[0].id, 3)
      })

      expect(result.current.items[0].quantity).toBe(3)
    })

    it('should remove item when quantity is 0', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.updateQuantity(result.current.items[0].id, 0)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.removeItem(result.current.items[0].id)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should clear all items', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.addItem({ ...mockProduct, productId: 'prod-2' })
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('computed values', () => {
    it('should calculate correct item count', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.updateQuantity(result.current.items[0].id, 3)
      })

      expect(result.current.getItemCount()).toBe(3)
    })

    it('should calculate correct subtotal with sale price', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem(mockProduct)
        result.current.updateQuantity(result.current.items[0].id, 2)
      })

      // 4500 (sale price) * 2 = 9000
      expect(result.current.getSubtotal()).toBe(9000)
    })

    it('should calculate stitching total correctly', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem({
          ...mockProduct,
          customization: { isStitched: true },
        })
        result.current.updateQuantity(result.current.items[0].id, 2)
      })

      // 1000 (stitching) * 2 = 2000
      expect(result.current.getStitchingTotal()).toBe(2000)
    })

    it('should calculate correct total', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.addItem({
          ...mockProduct,
          customization: { isStitched: true },
        })
      })

      // 4500 (sale) + 1000 (stitching) = 5500
      expect(result.current.getTotal()).toBe(5500)
    })
  })

  describe('drawer state', () => {
    it('should open and close drawer', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.openCart()
      })
      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.closeCart()
      })
      expect(result.current.isOpen).toBe(false)
    })

    it('should toggle drawer', () => {
      const { result } = renderHook(() => useCartStore())

      act(() => {
        result.current.toggleCart()
      })
      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.toggleCart()
      })
      expect(result.current.isOpen).toBe(false)
    })
  })
})
