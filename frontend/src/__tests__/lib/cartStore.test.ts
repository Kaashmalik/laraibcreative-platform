import { describe, it, expect, beforeEach } from '@jest/globals'
import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/store/cartStore'

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-123'
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => mockUUID,
  },
  writable: true,
})

describe('Cart Store', () => {
  beforeEach(async () => {
    // Reset store state
    const { result } = renderHook(() => useCartStore())
    await act(async () => {
      await result.current.clearCart()
    })
  })

  const mockProduct = {
    id: 'prod-1',
    title: 'Test Product',
    slug: 'test-product',
    image: '/test.jpg',
    pricing: {
      basePrice: 5000,
      comparePrice: 4500,
      customStitchingCharge: 1000,
    },
  }

  describe('addItem', () => {
    it('should add item to cart', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].productId).toBe('prod-1')
    })

    it('should increase quantity for duplicate items', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
        await result.current.addItem(mockProduct)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(2)
    })

    it('should open cart drawer when adding item', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      await act(async () => {
        await result.current.updateQuantity(result.current.items[0].id, 3)
      })

      expect(result.current.items[0].quantity).toBe(3)
    })

    it('should remove item when quantity is 0', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      await act(async () => {
        await result.current.updateQuantity(result.current.items[0].id, 0)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      await act(async () => {
        await result.current.removeItem(result.current.items[0].id)
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should clear all items', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
        await result.current.addItem({ ...mockProduct, id: 'prod-2' })
        await result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('computed values', () => {
    it('should calculate correct item count', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      await act(async () => {
        await result.current.updateQuantity(result.current.items[0].id, 3)
      })

      expect(result.current.totalItems).toBe(3)
    })

    it('should calculate correct subtotal with sale price', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct)
      })

      await act(async () => {
        await result.current.updateQuantity(result.current.items[0].id, 2)
      })

      // 4500 (comparePrice) * 2 = 9000
      expect(result.current.subtotal).toBe(9000)
    })

    it('should calculate stitching total correctly', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct, 2, { isStitched: true })
      })

      // 1000 (stitching) * 2 = 2000
      expect(result.current.total - result.current.subtotal).toBe(2000)
    })

    it('should calculate correct total', async () => {
      const { result } = renderHook(() => useCartStore())

      await act(async () => {
        await result.current.addItem(mockProduct, 1, { isStitched: true })
      })

      // 4500 (sale) + 1000 (stitching) = 5500
      expect(result.current.total).toBe(5500)
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
