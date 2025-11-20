/**
 * Admin Product Management Flow Integration Tests
 * Tests for admin creating and managing products
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestAdmin, createTestProduct, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
const Product = require('../../models/Product');
const Category = require('../../models/Category');

describe('Admin Product Management Flow', () => {
  let admin, adminToken, category;

  beforeAll(async () => {
    await setupTestDB();
    admin = await createTestAdmin();
    adminToken = generateTestToken(admin._id, admin.role);

    // Create test category
    category = await createTestCategory({
      name: 'Admin Test Category',
      slug: 'admin-test-category',
    });
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/v1/admin/products', () => {
    it('should create product as admin', async () => {
      const productData = {
        title: 'Admin Created Product',
        slug: 'admin-created-product',
        designCode: `LC-2024-${Date.now()}`,
        description: 'Product created by admin',
        category: category._id.toString(),
        pricing: {
          basePrice: 8000,
          customStitchingCharge: 1500,
        },
        inventory: {
          stockQuantity: 20,
          lowStockThreshold: 5,
        },
        images: [
          {
            url: 'https://example.com/admin-product.jpg',
            altText: 'Admin product image',
          },
        ],
        availability: {
          status: 'in-stock',
        },
        isActive: true,
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .set(getAuthHeaders(adminToken))
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty('title', productData.title);
      expect(response.body.data.product).toHaveProperty('pricing.basePrice', productData.pricing.basePrice);
    });

    it('should reject product creation without admin role', async () => {
      const customer = await createTestUser();
      const customerToken = generateTestToken(customer._id, customer.role);

      const productData = {
        title: 'Unauthorized Product',
        pricing: { basePrice: 5000 },
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .set(getAuthHeaders(customerToken))
        .send(productData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const productData = {
        // Missing title
        pricing: { basePrice: 5000 },
      };

      const response = await request(app)
        .post('/api/v1/admin/products')
        .set(getAuthHeaders(adminToken))
        .send(productData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/admin/products/:id', () => {
    it('should update product as admin', async () => {
      const product = await createTestProduct();

      const updateData = {
        title: 'Updated Product Title',
        pricing: {
          basePrice: 10000,
        },
      };

      const response = await request(app)
        .put(`/api/v1/admin/products/${product._id}`)
        .set(getAuthHeaders(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty('title', updateData.title);
    });
  });

  describe('DELETE /api/v1/admin/products/:id', () => {
    it('should delete product as admin', async () => {
      const product = await createTestProduct();

      const response = await request(app)
        .delete(`/api/v1/admin/products/${product._id}`)
        .set(getAuthHeaders(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('GET /api/v1/admin/products', () => {
    it('should get all products for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/products')
        .set(getAuthHeaders(adminToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
    });

    it('should filter and search products', async () => {
      await createTestProduct({ title: 'Searchable Product' });

      const response = await request(app)
        .get('/api/v1/admin/products')
        .set(getAuthHeaders(adminToken))
        .query({ search: 'Searchable' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.some(p => 
        p.title.includes('Searchable')
      )).toBe(true);
    });
  });
});

