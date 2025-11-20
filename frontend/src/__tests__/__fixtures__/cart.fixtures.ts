/**
 * Cart Test Fixtures
 * Mock data for cart-related tests
 */

import type { Product, CartItem, CartItemCustomizations } from '@/types/cart';

export const mockProducts: Product[] = [
  {
    _id: 'prod1',
    id: 'prod1',
    title: 'Premium Suit',
    slug: 'premium-suit',
    price: 5000,
    pricing: {
      basePrice: 5000,
      customStitchingCharge: 1000,
    },
    inventory: {
      quantity: 5,
      sku: 'PS-001',
    },
    stockQuantity: 5,
    stock: 5,
    images: ['/images/premium-suit.jpg'],
    image: '/images/premium-suit.jpg',
    category: { _id: 'cat1', name: 'Suits' },
    availability: { status: 'in-stock' },
    isActive: true,
  },
  {
    _id: 'prod2',
    id: 'prod2',
    title: 'Custom Shirt',
    slug: 'custom-shirt',
    price: 2000,
    pricing: {
      basePrice: 2000,
      customStitchingCharge: 500,
    },
    inventory: {
      quantity: 10,
      sku: 'CS-001',
    },
    stockQuantity: 10,
    stock: 10,
    images: ['/images/custom-shirt.jpg'],
    image: '/images/custom-shirt.jpg',
    category: { _id: 'cat2', name: 'Shirts' },
    availability: { status: 'in-stock' },
    isActive: true,
  },
  {
    _id: 'prod3',
    id: 'prod3',
    title: 'Limited Edition',
    slug: 'limited-edition',
    price: 10000,
    pricing: {
      basePrice: 10000,
    },
    inventory: {
      quantity: 1,
      sku: 'LE-001',
    },
    stockQuantity: 1,
    stock: 1,
    images: ['/images/limited-edition.jpg'],
    image: '/images/limited-edition.jpg',
    category: { _id: 'cat1', name: 'Suits' },
    availability: { status: 'in-stock' },
    isActive: true,
  },
  {
    _id: 'prod4',
    id: 'prod4',
    title: 'Out of Stock Product',
    slug: 'out-of-stock',
    price: 3000,
    pricing: {
      basePrice: 3000,
    },
    inventory: {
      quantity: 0,
      sku: 'OOS-001',
    },
    stockQuantity: 0,
    stock: 0,
    images: ['/images/out-of-stock.jpg'],
    image: '/images/out-of-stock.jpg',
    category: { _id: 'cat1', name: 'Suits' },
    availability: { status: 'out-of-stock' },
    isActive: true,
  },
];

export const mockCustomizations: CartItemCustomizations = {
  fabric: 'Silk',
  color: 'Navy Blue',
  measurements: {
    chest: '38',
    waist: '32',
    sleeveLength: '24',
  },
};

export const mockCartItems: CartItem[] = [
  {
    id: 'item1',
    productId: 'prod1',
    product: mockProducts[0],
    quantity: 2,
    priceAtAdd: 5000,
    customizations: {},
    isCustom: false,
    addedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'item2',
    productId: 'prod2',
    product: mockProducts[1],
    quantity: 1,
    priceAtAdd: 2000,
    customizations: mockCustomizations,
    isCustom: true,
    addedAt: new Date('2024-01-02').toISOString(),
  },
];

export const mockEmptyCart = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
};

export const mockCartWithItems = {
  items: mockCartItems,
  totalItems: 3,
  subtotal: 12000, // (5000 * 2) + (2000 * 1)
  tax: 600, // 5% of 12000
  shipping: 200,
  discount: 0,
  total: 12800,
};

