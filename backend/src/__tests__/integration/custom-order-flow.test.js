/**
 * Custom Order Flow Integration Tests
 * Tests for placing custom orders
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestUser, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
// Custom orders are stored in Order model with isCustom flag
const Order = require('../../models/Order');

describe('Custom Order Flow', () => {
  let user, token;

  beforeAll(async () => {
    await setupTestDB();
    user = await createTestUser();
    token = generateTestToken(user._id, user.role);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/v1/orders/custom', () => {
    it('should create custom order successfully', async () => {
      const orderData = {
        serviceType: 'fully-custom',
        designIdea: 'I want a beautiful suit with intricate embroidery and modern design',
        fabricSource: 'lc-provides',
        selectedFabric: {
          id: 'fabric-123',
          name: 'Premium Silk',
          price: 3000,
        },
        measurements: {
          shirtLength: '28',
          shoulderWidth: '16',
          bust: '36',
          waist: '30',
          hip: '38',
        },
        customerInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
        specialInstructions: 'Please ensure high quality stitching',
        rushOrder: false,
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set(getAuthHeaders(token))
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toHaveProperty('orderNumber');
      expect(response.body.data.order.serviceType).toBe('fully-custom');
    });

    it('should require design idea for fully-custom orders', async () => {
      const orderData = {
        serviceType: 'fully-custom',
        // Missing designIdea
        fabricSource: 'lc-provides',
        measurements: {
          shirtLength: '28',
          shoulderWidth: '16',
        },
        customerInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set(getAuthHeaders(token))
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require measurements', async () => {
      const orderData = {
        serviceType: 'fully-custom',
        designIdea: 'Test design',
        fabricSource: 'lc-provides',
        // Missing measurements
        customerInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set(getAuthHeaders(token))
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate estimated price', async () => {
      const orderData = {
        serviceType: 'fully-custom',
        designIdea: 'Test design',
        fabricSource: 'lc-provides',
        selectedFabric: {
          id: 'fabric-123',
          name: 'Premium Silk',
          price: 3000,
        },
        measurements: {
          shirtLength: '28',
          shoulderWidth: '16',
          bust: '36',
        },
        customerInfo: {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        },
        rushOrder: true,
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set(getAuthHeaders(token))
        .send(orderData)
        .expect(201);

      expect(response.body.data.order).toHaveProperty('estimatedPrice');
      expect(response.body.data.order.estimatedPrice).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/orders (with custom filter)', () => {
    it('should get user custom orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set(getAuthHeaders(token))
        .query({ isCustom: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

