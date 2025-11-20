/**
 * Admin Order Management Flow Integration Tests
 * Tests for admin updating order status
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestAdmin, createTestOrder, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
const Order = require('../../models/Order');

describe('Admin Order Management Flow', () => {
  let admin, adminToken, order;

  beforeAll(async () => {
    await setupTestDB();
    admin = await createTestAdmin();
    adminToken = generateTestToken(admin._id, admin.role);
    order = await createTestOrder();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/v1/admin/orders', () => {
    it('should get all orders as admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set(getAuthHeaders(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toBeInstanceOf(Array);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set(getAuthHeaders(adminToken))
        .query({ status: 'pending-payment' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders.every(o => o.status === 'pending-payment')).toBe(true);
    });

    it('should require admin role', async () => {
      const customer = await createTestUser();
      const customerToken = generateTestToken(customer._id, customer.role);

      const response = await request(app)
        .get('/api/v1/admin/orders')
        .set(getAuthHeaders(customerToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/admin/orders/:id/status', () => {
    it('should update order status as admin', async () => {
      // First verify payment
      await request(app)
        .post(`/api/v1/admin/orders/${order._id}/verify-payment`)
        .set(getAuthHeaders(adminToken))
        .send({
          verified: true,
          verificationNotes: 'Payment verified',
        });

      // Update status
      const response = await request(app)
        .put(`/api/v1/admin/orders/${order._id}/status`)
        .set(getAuthHeaders(adminToken))
        .send({
          status: 'payment-verified',
          note: 'Payment verified, proceeding with order',
          notifyCustomer: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('payment-verified');
    });

    it('should reject invalid status', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/orders/${order._id}/status`)
        .set(getAuthHeaders(adminToken))
        .send({
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should prevent status update without payment verification', async () => {
      const newOrder = await createTestOrder();

      const response = await request(app)
        .put(`/api/v1/admin/orders/${newOrder._id}/status`)
        .set(getAuthHeaders(adminToken))
        .send({
          status: 'in-progress',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('payment');
    });
  });

  describe('POST /api/v1/admin/orders/:id/verify-payment', () => {
    it('should verify payment as admin', async () => {
      const newOrder = await createTestOrder();

      const response = await request(app)
        .post(`/api/v1/admin/orders/${newOrder._id}/verify-payment`)
        .set(getAuthHeaders(adminToken))
        .send({
          verified: true,
          verificationNotes: 'Payment receipt verified',
          transactionId: 'TXN123456',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.payment.status).toBe('verified');
    });

    it('should reject payment as admin', async () => {
      const newOrder = await createTestOrder();

      const response = await request(app)
        .post(`/api/v1/admin/orders/${newOrder._id}/verify-payment`)
        .set(getAuthHeaders(adminToken))
        .send({
          verified: false,
          verificationNotes: 'Receipt unclear, please resubmit',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.payment.status).toBe('failed');
    });
  });

  describe('POST /api/v1/admin/orders/:id/notes', () => {
    it('should add admin note to order', async () => {
      const response = await request(app)
        .post(`/api/v1/admin/orders/${order._id}/notes`)
        .set(getAuthHeaders(adminToken))
        .send({
          text: 'Customer requested rush delivery',
          isImportant: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBeInstanceOf(Array);
      expect(response.body.data.notes.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/admin/orders/:id/invoice', () => {
    it('should download invoice as admin', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/orders/${order._id}/invoice`)
        .set(getAuthHeaders(adminToken))
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.body).toBeInstanceOf(Buffer);
    });
  });
});

