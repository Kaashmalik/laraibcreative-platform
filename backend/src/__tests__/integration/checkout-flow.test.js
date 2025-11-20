/**
 * Checkout Flow Integration Tests
 * Tests for complete guest checkout process
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestUser, createTestProduct, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
const Order = require('../../models/Order');

describe('Guest Checkout Flow', () => {
  let product;

  beforeAll(async () => {
    await setupTestDB();
    product = await createTestProduct({
      pricing: { basePrice: 5000 },
      inventory: { stockQuantity: 10 },
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/orders (Guest Checkout)', () => {
    it('should create order for guest user', async () => {
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 2,
          },
        ],
        customerInfo: {
          name: 'Guest User',
          email: 'guest@example.com',
          phone: '03001234567',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
        payment: {
          method: 'cod',
          advanceAmount: 5000,
          receiptImage: 'https://example.com/receipt.jpg',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toHaveProperty('orderNumber');
      expect(response.body.data.order.customerInfo.email).toBe(orderData.customerInfo.email);
      expect(response.body.data.order.status).toBe('pending-payment');
    });

    it('should calculate order totals correctly', async () => {
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 2,
          },
        ],
        customerInfo: {
          name: 'Guest User',
          email: 'guest2@example.com',
          phone: '03001234568',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
          postalCode: '54000',
          country: 'Pakistan',
        },
        payment: {
          method: 'cod',
          advanceAmount: 5000,
          receiptImage: 'https://example.com/receipt.jpg',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const order = response.body.data.order;
      expect(order.pricing.subtotal).toBe(10000); // 5000 * 2
      expect(order.pricing.tax).toBeGreaterThan(0);
      expect(order.pricing.total).toBeGreaterThan(order.pricing.subtotal);
    });

    it('should reject order without items', async () => {
      const orderData = {
        items: [],
        customerInfo: {
          name: 'Guest User',
          email: 'guest3@example.com',
          phone: '03001234569',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
        },
        payment: {
          method: 'cod',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject order with invalid payment method', async () => {
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 1,
          },
        ],
        customerInfo: {
          name: 'Guest User',
          email: 'guest4@example.com',
          phone: '03001234570',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
        },
        payment: {
          method: 'invalid-method',
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require advance payment receipt for COD', async () => {
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 1,
          },
        ],
        customerInfo: {
          name: 'Guest User',
          email: 'guest5@example.com',
          phone: '03001234571',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
        },
        payment: {
          method: 'cod',
          advanceAmount: 2500,
          // Missing receiptImage
        },
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/track/:orderNumber', () => {
    it('should track order by order number', async () => {
      // Create order first
      const orderData = {
        items: [
          {
            product: product._id,
            quantity: 1,
          },
        ],
        customerInfo: {
          name: 'Guest User',
          email: 'track@example.com',
          phone: '03001234572',
        },
        shippingAddress: {
          addressLine1: '123 Guest Street',
          city: 'Lahore',
          province: 'Punjab',
        },
        payment: {
          method: 'cod',
          advanceAmount: 2500,
          receiptImage: 'https://example.com/receipt.jpg',
        },
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData);

      const orderNumber = createResponse.body.data.order.orderNumber;

      // Track order
      const response = await request(app)
        .get(`/api/orders/track/${orderNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe(orderNumber);
      expect(response.body.data.currentStatus).toBeDefined();
    });

    it('should return 404 for invalid order number', async () => {
      const response = await request(app)
        .get('/api/orders/track/LC-2024-INVALID')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

