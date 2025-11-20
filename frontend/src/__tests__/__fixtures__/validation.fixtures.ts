/**
 * Validation Test Fixtures
 * Mock data for validation schema tests
 */

export const validProductData = {
  title: 'Test Product',
  designCode: 'LC-2024-001',
  sku: 'TEST-001',
  description: 'This is a test product description',
  category: 'category-id-123',
  pricing: {
    basePrice: 5000,
    customStitchingCharge: 1000,
  },
  inventory: {
    stockQuantity: 10,
    lowStockThreshold: 5,
  },
  images: [
    {
      url: 'https://example.com/image.jpg',
      altText: 'Test product image',
    },
  ],
  availability: {
    status: 'in-stock',
  },
  isActive: true,
};

export const invalidProductData = {
  title: '', // Empty title
  designCode: 'INVALID', // Invalid format
  sku: 'ab', // Too short
  pricing: {
    basePrice: -100, // Negative price
  },
  inventory: {
    stockQuantity: -5, // Negative stock
  },
};

export const validCustomOrderData = {
  serviceType: 'fully-custom',
  designIdea: 'I want a beautiful suit with intricate embroidery',
  fabricSource: 'lc-provides',
  selectedFabric: {
    id: 'fabric-123',
    name: 'Premium Silk',
    price: 3000,
    image: '/images/fabric.jpg',
    inStock: true,
  },
  useStandardSize: false,
  measurements: {
    shirtLength: '28',
    shoulderWidth: '16',
    bust: '36',
    waist: '30',
  },
  customerInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '03001234567',
  },
  agreeToTerms: true,
};

export const invalidCustomOrderData = {
  serviceType: 'invalid-type', // Invalid enum
  designIdea: 'Short', // Too short
  fabricSource: 'lc-provides',
  selectedFabric: null, // Required but null
  measurements: {
    shirtLength: '', // Required but empty
  },
  customerInfo: {
    fullName: '', // Empty
    email: 'invalid-email', // Invalid format
    phone: '123', // Invalid format
  },
  agreeToTerms: false, // Must be true
};

export const validCheckoutData = {
  customerInfo: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '03001234567',
  },
  shippingAddress: {
    addressLine1: '123 Main Street',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: '54000',
    country: 'Pakistan',
  },
  payment: {
    method: 'bank-transfer',
    transactionId: 'TXN123456',
  },
  agreeToTerms: true,
};

export const invalidCheckoutData = {
  customerInfo: {
    fullName: '', // Empty
    email: 'invalid', // Invalid email
    phone: '123', // Invalid phone
  },
  shippingAddress: {
    addressLine1: '', // Empty
    city: '', // Empty
  },
  payment: {
    method: 'invalid', // Invalid method
  },
  agreeToTerms: false, // Must be true
};

