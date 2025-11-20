/**
 * Cart Store Unit Tests
 * Tests for cart state management logic
 * 
 * @module __tests__/cart/cartStore.test
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { useCartStore } from '@/store/cartStore';

// Mock API
jest.mock('@/lib/api', () => ({
  default: {
    cart: {
      sync: jest.fn().mockResolvedValue({ success: true }),
      get: jest.fn().mockResolvedValue({ items: [] }),
      applyPromoCode: jest.fn().mockResolvedValue({ success: true, discount: 10, discountType: 'percentage' }),
      calculateShipping: jest.fn().mockResolvedValue({ cost: 200 }),
    },
    products: {
      getById: jest.fn().mockResolvedValue({
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 10,
      }),
    },
  },
}));

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
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
    });
  });

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 10,
      };

      await useCartStore.getState().addItem(product, 2);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[0].productId).toBe('product1');
      expect(state.totalItems).toBe(2);
    });

    it('should update quantity if item already exists', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 10,
      };

      await useCartStore.getState().addItem(product, 2);
      await useCartStore.getState().addItem(product, 3);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
      expect(state.totalItems).toBe(5);
    });

    it('should throw error if quantity exceeds stock', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 5,
      };

      await expect(
        useCartStore.getState().addItem(product, 10)
      ).rejects.toThrow('Only 5 items available in stock');
    });

    it('should throw error if quantity is invalid', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
      };

      await expect(
        useCartStore.getState().addItem(product, 0)
      ).rejects.toThrow('Quantity must be between 1 and 99');

      await expect(
        useCartStore.getState().addItem(product, 100)
      ).rejects.toThrow('Quantity must be between 1 and 99');
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
      };

      await useCartStore.getState().addItem(product, 2);
      const itemId = useCartStore.getState().items[0].id;

      await useCartStore.getState().removeItem(itemId);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.totalItems).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 10,
      };

      await useCartStore.getState().addItem(product, 2);
      const itemId = useCartStore.getState().items[0].id;

      await useCartStore.getState().updateQuantity(itemId, 5);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(5);
      expect(state.totalItems).toBe(5);
    });

    it('should remove item if quantity is 0', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
      };

      await useCartStore.getState().addItem(product, 2);
      const itemId = useCartStore.getState().items[0].id;

      await useCartStore.getState().updateQuantity(itemId, 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should throw error if quantity exceeds stock', async () => {
      const product = {
        _id: 'product1',
        title: 'Test Product',
        price: 1000,
        stockQuantity: 5,
      };

      await useCartStore.getState().addItem(product, 2);
      const itemId = useCartStore.getState().items[0].id;

      await expect(
        useCartStore.getState().updateQuantity(itemId, 10)
      ).rejects.toThrow('Only 5 items available in stock');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const product1 = { _id: 'product1', title: 'Product 1', price: 1000 };
      const product2 = { _id: 'product2', title: 'Product 2', price: 2000 };

      await useCartStore.getState().addItem(product1, 2);
      await useCartStore.getState().addItem(product2, 1);

      await useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.totalItems).toBe(0);
      expect(state.subtotal).toBe(0);
    });
  });

  describe('totals calculation', () => {
    it('should calculate subtotal correctly', async () => {
      const product1 = { _id: 'product1', title: 'Product 1', price: 1000 };
      const product2 = { _id: 'product2', title: 'Product 2', price: 2000 };

      await useCartStore.getState().addItem(product1, 2);
      await useCartStore.getState().addItem(product2, 1);

      const state = useCartStore.getState();
      expect(state.subtotal).toBe(4000); // (1000 * 2) + (2000 * 1)
    });

    it('should calculate tax correctly', async () => {
      const product = { _id: 'product1', title: 'Product 1', price: 1000 };

      await useCartStore.getState().addItem(product, 2);

      const state = useCartStore.getState();
      expect(state.tax).toBe(100); // 2000 * 0.05
    });

    it('should calculate total correctly', async () => {
      const product = { _id: 'product1', title: 'Product 1', price: 1000 };

      await useCartStore.getState().addItem(product, 2);
      await useCartStore.getState().calculateShipping();

      const state = useCartStore.getState();
      // subtotal: 2000, tax: 100, shipping: 200, discount: 0
      expect(state.total).toBe(2300);
    });
  });

  describe('applyPromoCode', () => {
    it('should apply promo code successfully', async () => {
      const product = { _id: 'product1', title: 'Product 1', price: 1000 };
      await useCartStore.getState().addItem(product, 2);

      const result = await useCartStore.getState().applyPromoCode('TEST10');

      expect(result.success).toBe(true);
      expect(result.discount).toBeGreaterThan(0);
    });
  });

  describe('isInCart', () => {
    it('should return true if product is in cart', async () => {
      const product = { _id: 'product1', title: 'Product 1', price: 1000 };
      await useCartStore.getState().addItem(product, 1);

      const isInCart = useCartStore.getState().isInCart('product1');
      expect(isInCart).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      const isInCart = useCartStore.getState().isInCart('product1');
      expect(isInCart).toBe(false);
    });
  });

  describe('getProductQuantity', () => {
    it('should return correct quantity for product', async () => {
      const product = { _id: 'product1', title: 'Product 1', price: 1000 };
      await useCartStore.getState().addItem(product, 3);

      const quantity = useCartStore.getState().getProductQuantity('product1');
      expect(quantity).toBe(3);
    });
  });
});

