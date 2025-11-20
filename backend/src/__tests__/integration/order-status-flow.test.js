/**
 * Order Status Flow Integration Tests
 * Tests for viewing and tracking order status
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestUser, createTestOrder, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
const Order = require('../../models/Order');

describe('Order Status Flow', () => {
  let user, token, order;

  beforeAll(async () => {
    await setupTestDB();
    user = await createTestUser();
    token = generateTestToken(user._id, user.role);
    order = await createTestOrder({ customer: user._id });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set(getAuthHeaders(token))
        .query({ status: 'pending-payment' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'pending-payment')).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order details', async () => {
      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toHaveProperty('_id', order._id.toString());
      expect(response.body.data.order).toHaveProperty('orderNumber');
      expect(response.body.data.order).toHaveProperty('status');
    });

    it('should not allow viewing other user orders', async () => {
      const otherUser = await createTestUser();
      const otherUserToken = generateTestToken(otherUser._id, otherUser.role);

      const response = await request(app)
        .get(`/api/orders/${order._id}`)
        .set(getAuthHeaders(otherUserToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/track/:orderNumber', () => {
    it('should track order by order number (public)', async () => {
      const response = await request(app)
        .get(`/api/orders/track/${order.orderNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe(order.orderNumber);
      expect(response.body.data.currentStatus).toBeDefined();
      expect(response.body.data.timeline).toBeInstanceOf(Array);
    });

    it('should return 404 for invalid order number', async () => {
      const response = await request(app)
        .get('/api/orders/track/LC-2024-INVALID')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

