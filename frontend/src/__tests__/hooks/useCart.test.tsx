/**
 * useCart Hook Tests
 * Tests for the useCart custom hook
 */

import { renderHook } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import { mockProducts } from '../__fixtures__/cart.fixtures';
import { AllTheProviders } from '../__mocks__/test-utils';

// Mock the cart store
jest.mock('@/store/cartStore');

describe('useCart Hook', () => {
  const mockStore = {
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
    addItem: jest.fn(),
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    isInCart: jest.fn(),
    getItem: jest.fn(),
    getProductQuantity: jest.fn(),
    applyPromoCode: jest.fn(),
    removePromoCode: jest.fn(),
    calculateShipping: jest.fn(),
    syncCart: jest.fn(),
    validateCart: jest.fn(),
    loadCart: jest.fn(),
  };

  beforeEach(() => {
    (useCartStore as any).mockReturnValue(mockStore);
    jest.clearAllMocks();
  });

  it('should return cart state and actions', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.addItem).toBeDefined();
    expect(result.current.removeItem).toBeDefined();
  });

  it('should call addItem from store', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await result.current.addItem(mockProducts[0], 1);

    expect(mockStore.addItem).toHaveBeenCalledWith(mockProducts[0], 1, undefined);
  });

  it('should handle addItem errors', async () => {
    mockStore.addItem.mockRejectedValueOnce(new Error('Failed to add'));

    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await expect(
      result.current.addItem(mockProducts[0], 1)
    ).rejects.toThrow('Failed to add item to cart');
  });

  it('should call removeItem from store', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await result.current.removeItem('item-id');

    expect(mockStore.removeItem).toHaveBeenCalledWith('item-id');
  });

  it('should call updateQuantity from store', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await result.current.updateQuantity('item-id', 3);

    expect(mockStore.updateQuantity).toHaveBeenCalledWith('item-id', 3);
  });

  it('should call clearCart from store', async () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await result.current.clearCart();

    expect(mockStore.clearCart).toHaveBeenCalled();
  });

  it('should call applyPromoCode from store', async () => {
    mockStore.applyPromoCode.mockResolvedValueOnce({ success: true, discount: 10 });

    const { result } = renderHook(() => useCart(), {
      wrapper: AllTheProviders,
    });

    await result.current.applyPromoCode('TEST10');

    expect(mockStore.applyPromoCode).toHaveBeenCalledWith('TEST10');
  });
});

