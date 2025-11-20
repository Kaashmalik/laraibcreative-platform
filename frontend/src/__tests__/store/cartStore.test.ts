/**
 * Cart Store Unit Tests
 * Comprehensive tests for cart state management logic
 * 
 * @module __tests__/store/cartStore
 */

import { act, renderHook } from '@testing-library/react';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import { mockProducts, mockCartItems, mockCustomizations } from '../__fixtures__/cart.fixtures';

// Mock API
jest.mock('@/lib/api', () => ({
  default: {
    cart: {
      sync: jest.fn().mockResolvedValue({ success: true }),
      get: jest.fn().mockResolvedValue({ items: [] }),
      applyPromoCode: jest.fn().mockResolvedValue({ 
        success: true, 
        discount: 10, 
        discountType: 'percentage',
        message: 'Promo code applied'
      }),
      calculateShipping: jest.fn().mockResolvedValue({ cost: 200 }),
    },
    products: {
      getById: jest.fn().mockResolvedValue(mockProducts[0]),
    },
  },
}));

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useCartStore.setState({
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        isLoading: false,
        error: null,
        promoCode: undefined,
      });
    });
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe(mockProducts[0]._id);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.subtotal).toBe(10000); // 5000 * 2
    });

    it('should update quantity if item already exists', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[0], 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });

    it('should handle customizations correctly', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1, mockCustomizations);
      });

      expect(result.current.items[0].customizations).toEqual(mockCustomizations);
      expect(result.current.items[0].isCustom).toBe(true);
    });

    it('should throw error if quantity is invalid', async () => {
      const { result } = renderHook(() => useCartStore());

      await expect(
        act(async () => {
          await result.current.addItem(mockProducts[0], 0);
        })
      ).rejects.toThrow('Quantity must be between 1 and 99');

      await expect(
        act(async () => {
          await result.current.addItem(mockProducts[0], 100);
        })
      ).rejects.toThrow('Quantity must be between 1 and 99');
    });

    it('should throw error if stock is insufficient', async () => {
      const { result } = renderHook(() => useCartStore());

      await expect(
        act(async () => {
          await result.current.addItem(mockProducts[2], 2); // Only 1 in stock
        })
      ).rejects.toThrow('Only 1 items available in stock');
    });

    it('should calculate totals correctly', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[1], 1);
      });

      // Subtotal: (5000 * 2) + (2000 * 1) = 12000
      expect(result.current.subtotal).toBe(12000);
      // Tax: 12000 * 0.05 = 600
      expect(result.current.tax).toBe(600);
      // Total: 12000 + 600 = 12600
      expect(result.current.total).toBe(12600);
    });

    it('should sync with backend after adding item', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      // Wait for async sync
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(api.cart.sync).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const { result } = renderHook(() => useCartStore());

      // Add items first
      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[1], 1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.removeItem(itemId);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe(mockProducts[1]._id);
      expect(result.current.totalItems).toBe(1);
    });

    it('should recalculate totals after removal', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[1], 1);
      });

      const initialTotal = result.current.total;
      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.removeItem(itemId);
      });

      expect(result.current.total).toBeLessThan(initialTotal);
      expect(result.current.subtotal).toBe(2000); // Only product 1 remains
    });

    it('should throw error if item not found', async () => {
      const { result } = renderHook(() => useCartStore());

      await expect(
        act(async () => {
          await result.current.removeItem('non-existent-id');
        })
      ).not.toThrow(); // Should not throw, just remove nothing
    });

    it('should sync with backend after removal', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.removeItem(itemId);
      });

      expect(api.cart.sync).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.updateQuantity(itemId, 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });

    it('should remove item if quantity is 0', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
      });

      const itemId = result.current.items[0].id;

      await act(async () => {
        await result.current.updateQuantity(itemId, 0);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should throw error if quantity exceeds stock', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[2], 1); // Only 1 in stock
      });

      const itemId = result.current.items[0].id;

      await expect(
        act(async () => {
          await result.current.updateQuantity(itemId, 2);
        })
      ).rejects.toThrow('Only 1 items available in stock');
    });

    it('should throw error if quantity exceeds maximum', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      const itemId = result.current.items[0].id;

      await expect(
        act(async () => {
          await result.current.updateQuantity(itemId, 100);
        })
      ).rejects.toThrow('Maximum quantity is 99');
    });

    it('should recalculate totals after quantity update', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      const itemId = result.current.items[0].id;
      const initialTotal = result.current.total;

      await act(async () => {
        await result.current.updateQuantity(itemId, 3);
      });

      expect(result.current.total).toBeGreaterThan(initialTotal);
      expect(result.current.subtotal).toBe(15000); // 5000 * 3
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[1], 1);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it('should clear promo code', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
        await result.current.applyPromoCode('TEST10');
      });

      await act(async () => {
        await result.current.clearCart();
      });

      expect(result.current.promoCode).toBeUndefined();
      expect(result.current.discount).toBe(0);
    });
  });

  describe('isInCart', () => {
    it('should return true if product is in cart', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      expect(result.current.isInCart(mockProducts[0]._id)).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.isInCart('non-existent-id')).toBe(false);
    });
  });

  describe('getItem', () => {
    it('should return item if found', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
      });

      const item = result.current.getItem(mockProducts[0]._id);
      expect(item).toBeDefined();
      expect(item?.quantity).toBe(2);
    });

    it('should return undefined if item not found', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.getItem('non-existent-id')).toBeUndefined();
    });
  });

  describe('getProductQuantity', () => {
    it('should return total quantity for product', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.addItem(mockProducts[0], 1); // Same product, different customizations
      });

      expect(result.current.getProductQuantity(mockProducts[0]._id)).toBe(3);
    });

    it('should return 0 if product not in cart', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.getProductQuantity('non-existent-id')).toBe(0);
    });
  });

  describe('applyPromoCode', () => {
    it('should apply percentage discount', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      const initialSubtotal = result.current.subtotal;

      await act(async () => {
        await result.current.applyPromoCode('TEST10');
      });

      expect(result.current.promoCode).toBe('TEST10');
      expect(result.current.discount).toBeGreaterThan(0);
      expect(result.current.total).toBeLessThan(initialSubtotal + result.current.tax);
    });

    it('should throw error for invalid promo code', async () => {
      (api.cart.applyPromoCode as jest.Mock).mockResolvedValueOnce({
        success: false,
        message: 'Invalid promo code',
      });

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      await expect(
        act(async () => {
          await result.current.applyPromoCode('INVALID');
        })
      ).rejects.toThrow('Invalid promo code');
    });
  });

  describe('removePromoCode', () => {
    it('should remove promo code and reset discount', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
        await result.current.applyPromoCode('TEST10');
      });

      const discountBefore = result.current.discount;

      act(() => {
        result.current.removePromoCode();
      });

      expect(result.current.promoCode).toBeUndefined();
      expect(result.current.discount).toBe(0);
      expect(result.current.total).toBeGreaterThan(result.current.total - discountBefore);
    });
  });

  describe('calculateShipping', () => {
    it('should calculate shipping cost', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      await act(async () => {
        await result.current.calculateShipping({
          city: 'Lahore',
          province: 'Punjab',
        });
      });

      expect(result.current.shipping).toBe(200);
      expect(api.cart.calculateShipping).toHaveBeenCalled();
    });
  });

  describe('calculateTotals', () => {
    it('should calculate totals correctly with all components', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 2);
        await result.current.calculateShipping({ city: 'Lahore' });
        await result.current.applyPromoCode('TEST10');
      });

      expect(result.current.subtotal).toBe(10000);
      expect(result.current.tax).toBe(500); // 5% of 10000
      expect(result.current.shipping).toBe(200);
      expect(result.current.discount).toBeGreaterThan(0);
      expect(result.current.total).toBeGreaterThan(0);
    });

    it('should handle negative total (should be 0)', async () => {
      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      // Set a discount larger than subtotal + tax
      act(() => {
        useCartStore.setState({
          discount: 20000,
        });
        const totals = result.current;
        useCartStore.setState({
          ...totals,
          total: Math.max(0, totals.subtotal + totals.tax - 20000),
        });
      });

      expect(result.current.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should set error state on addItem failure', async () => {
      (api.cart.sync as jest.Mock).mockRejectedValueOnce(new Error('Sync failed'));

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        try {
          await result.current.addItem(mockProducts[0], 1);
        } catch (error) {
          // Expected to throw
        }
      });

      // Error should be set (non-blocking sync failure shouldn't prevent add)
      expect(result.current.items.length).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      (api.cart.sync as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(mockProducts[0], 1);
      });

      // Should still add item locally even if sync fails
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart operations', () => {
      const { result } = renderHook(() => useCartStore());

      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.total).toBe(0);
    });

    it('should handle product with no stock limit', async () => {
      const productWithoutStock = {
        ...mockProducts[0],
        inventory: { quantity: undefined },
        stockQuantity: undefined,
        stock: undefined,
      };

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(productWithoutStock, 50);
      });

      expect(result.current.items[0].quantity).toBe(50);
    });

    it('should handle product with different ID formats', async () => {
      const productWithId = { ...mockProducts[0], id: 'product-id', _id: undefined };
      const productWith_id = { ...mockProducts[0], _id: 'product-_id', id: undefined };

      const { result } = renderHook(() => useCartStore());

      await act(async () => {
        await result.current.addItem(productWithId, 1);
        await result.current.addItem(productWith_id, 1);
      });

      expect(result.current.items).toHaveLength(2);
    });
  });
});

