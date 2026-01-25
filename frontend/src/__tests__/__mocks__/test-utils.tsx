/**
 * Test Utilities
 * Helper functions and components for testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { CartProvider } from '@/context/CartContext';

/**
 * Custom render function with providers
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

/**
 * Wait for async updates
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock user data
 */
export const mockUser = {
  _id: 'user123',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '03001234567',
  role: 'customer',
  isActive: true,
  createdAt: new Date('2024-01-01'),
};

/**
 * Mock admin user
 */
export const mockAdminUser = {
  ...mockUser,
  role: 'admin',
  email: 'admin@example.com',
};

/**
 * Mock product data
 */
export const mockProduct = {
  _id: 'product123',
  id: 'product123',
  title: 'Test Product',
  slug: 'test-product',
  price: 1000,
  pricing: {
    basePrice: 1000,
    customStitchingCharge: 500,
  },
  inventory: {
    quantity: 10,
    sku: 'TEST-001',
  },
  stockQuantity: 10,
  stock: 10,
  images: ['/images/test-product.jpg'],
  image: '/images/test-product.jpg',
  category: {
    _id: 'cat123',
    name: 'Test Category',
  },
  availability: {
    status: 'in-stock',
  },
  isActive: true,
};

/**
 * Mock cart item
 */
export const mockCartItem = {
  id: 'cart-item-123',
  productId: 'product123',
  product: mockProduct,
  quantity: 2,
  priceAtAdd: 1000,
  customizations: {},
  isCustom: false,
  addedAt: new Date().toISOString(),
};

/**
 * Create mock product
 */
export const createMockProduct = (overrides = {}) => ({
  ...mockProduct,
  ...overrides,
});

/**
 * Create mock cart item
 */
export const createMockCartItem = (overrides = {}) => ({
  ...mockCartItem,
  ...overrides,
});

/**
 * Create mock user
 */
export const createMockUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});

/**
 * Mock API response
 */
export const createMockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {},
});

/**
 * Mock API error
 */
export const createMockApiError = (message: string, status = 400) => ({
  response: {
    data: {
      success: false,
      message,
    },
    status,
    statusText: 'Error',
    headers: {},
  },
  message,
  isAxiosError: true,
});

