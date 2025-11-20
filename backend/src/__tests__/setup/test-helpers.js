/**
 * Test Helpers
 * Utility functions for integration tests
 */

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Category = require('../../models/Category');

/**
 * Generate JWT token for testing
 */
function generateTestToken(userId, role = 'customer') {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

/**
 * Create test user
 */
async function createTestUser(userData = {}) {
  const defaultUser = {
    fullName: 'Test User',
    email: `test${Date.now()}@example.com`,
    phone: '03001234567',
    password: 'Test123!@#',
    role: 'customer',
    isActive: true,
    isEmailVerified: true,
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return user;
}

/**
 * Create test admin user
 */
async function createTestAdmin(adminData = {}) {
  return createTestUser({
    email: `admin${Date.now()}@example.com`,
    role: 'admin',
    ...adminData,
  });
}

/**
 * Create test category
 */
async function createTestCategory(categoryData = {}) {
  const defaultCategory = {
    name: `Test Category ${Date.now()}`,
    slug: `test-category-${Date.now()}`,
    description: 'Test category description',
    isActive: true,
  };

  const category = await Category.create({ ...defaultCategory, ...categoryData });
  return category;
}

/**
 * Create test product
 */
async function createTestProduct(productData = {}) {
  // Create category if not provided
  let category = productData.category;
  if (!category) {
    const testCategory = await createTestCategory();
    category = testCategory._id;
  }

  const defaultProduct = {
    title: 'Test Product',
    slug: `test-product-${Date.now()}`,
    designCode: `LC-2024-${String(Date.now()).slice(-3)}`,
    description: 'Test product description',
    category: category,
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
        url: 'https://example.com/test-image.jpg',
        altText: 'Test product image',
      },
    ],
    availability: {
      status: 'in-stock',
    },
    isActive: true,
  };

  const product = await Product.create({ ...defaultProduct, ...productData });
  return product;
}

/**
 * Create test order
 */
async function createTestOrder(orderData = {}) {
  // Create user and product if not provided
  const user = orderData.customer || await createTestUser();
  const product = orderData.items?.[0]?.product || await createTestProduct();

  const defaultOrder = {
    orderNumber: `LC-2024-${String(Date.now()).slice(-4)}`,
    customer: user._id,
    customerInfo: {
      name: user.fullName,
      email: user.email,
      phone: user.phone,
    },
    items: [
      {
        product: product._id,
        productSnapshot: {
          title: product.title,
          sku: product.sku,
          primaryImage: product.images[0]?.url,
        },
        quantity: 1,
        price: product.pricing.basePrice,
        isCustom: false,
      },
    ],
    shippingAddress: {
      addressLine1: '123 Test Street',
      city: 'Lahore',
      province: 'Punjab',
      postalCode: '54000',
      country: 'Pakistan',
    },
    payment: {
      method: 'cod',
      status: 'pending',
      advanceAmount: 2500,
    },
    pricing: {
      subtotal: product.pricing.basePrice,
      tax: product.pricing.basePrice * 0.05,
      shippingCharges: 200,
      total: product.pricing.basePrice * 1.05 + 200,
    },
    status: 'pending-payment',
  };

  const order = await Order.create({ ...defaultOrder, ...orderData });
  return order;
}

/**
 * Get authenticated request headers
 */
function getAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Wait for async operations
 */
function wait(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  generateTestToken,
  createTestUser,
  createTestAdmin,
  createTestCategory,
  createTestProduct,
  createTestOrder,
  getAuthHeaders,
  wait,
};
