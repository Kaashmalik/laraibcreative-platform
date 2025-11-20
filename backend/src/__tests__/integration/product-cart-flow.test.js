/**
 * Product Browse and Cart Flow Integration Tests
 * Tests for browsing products, filtering, and adding to cart
 */

const request = require('supertest');
const app = require('../setup/test-server');
const { setupTestDB, teardownTestDB } = require('../setup/test-db');
const { createTestUser, createTestProduct, generateTestToken, getAuthHeaders } = require('../setup/test-helpers');
const Product = require('../../models/Product');
const Category = require('../../models/Category');

describe('Product Browse and Cart Flow', () => {
  let user, token, products, category;

  beforeAll(async () => {
    await setupTestDB();
    
    // Create test user
    user = await createTestUser();
    token = generateTestToken(user._id, user.role);

    // Create test category
    category = await createTestCategory();

    // Create test products
    products = await Promise.all([
      createTestProduct({
        title: 'Product 1',
        slug: 'product-1',
        category: category._id,
        pricing: { basePrice: 5000 },
        inventory: { stockQuantity: 10 },
      }),
      createTestProduct({
        title: 'Product 2',
        slug: 'product-2',
        category: category._id,
        pricing: { basePrice: 3000 },
        inventory: { stockQuantity: 5 },
      }),
      createTestProduct({
        title: 'Product 3',
        slug: 'product-3',
        category: category._id,
        pricing: { basePrice: 7000 },
        inventory: { stockQuantity: 0 },
        availability: { status: 'out-of-stock' },
      }),
    ]);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: category._id.toString() })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.every(p => 
        p.category === category._id.toString() || 
        p.category?._id === category._id.toString()
      )).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ minPrice: 4000, maxPrice: 6000 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.every(p => {
        const price = p.pricing?.basePrice || p.price || 0;
        return price >= 4000 && price <= 6000;
      })).toBe(true);
    });

    it('should search products by title', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ search: 'Product 1' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.some(p => 
        p.title.includes('Product 1')
      )).toBe(true);
    });

    it('should paginate products', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const response = await request(app)
        .get(`/api/products/${products[0]._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product).toHaveProperty('_id', products[0]._id.toString());
      expect(response.body.data.product).toHaveProperty('title', products[0].title);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/cart/add', () => {
    it('should add product to cart', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[0]._id,
          quantity: 2,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart.items).toBeInstanceOf(Array);
      expect(response.body.data.cart.items.length).toBeGreaterThan(0);
    });

    it('should update quantity if product already in cart', async () => {
      // Add product first
      await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[0]._id,
          quantity: 1,
        });

      // Add same product again
      const response = await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[0]._id,
          quantity: 2,
        })
        .expect(200);

      const item = response.body.data.cart.items.find(
        item => item.product._id === products[0]._id.toString()
      );
      expect(item.quantity).toBe(3); // 1 + 2
    });

    it('should reject adding out-of-stock product', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[2]._id, // Out of stock
          quantity: 1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject adding more than available stock', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[1]._id, // Only 5 in stock
          quantity: 10,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/cart', () => {
    it('should get user cart', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set(getAuthHeaders(token))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cart).toBeDefined();
      expect(response.body.data.cart.items).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/cart/update', () => {
    it('should update cart item quantity', async () => {
      // Add item first
      await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[1]._id,
          quantity: 1,
        });

      // Get cart to find item ID
      const cartResponse = await request(app)
        .get('/api/cart')
        .set(getAuthHeaders(token));

      const itemId = cartResponse.body.data.cart.items[0]._id;

      // Update quantity
      const response = await request(app)
        .put('/api/cart/update')
        .set(getAuthHeaders(token))
        .send({
          itemId,
          quantity: 3,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/cart/remove', () => {
    it('should remove item from cart', async () => {
      // Add item first
      await request(app)
        .post('/api/cart/add')
        .set(getAuthHeaders(token))
        .send({
          productId: products[1]._id,
          quantity: 1,
        });

      // Get cart to find item ID
      const cartResponse = await request(app)
        .get('/api/cart')
        .set(getAuthHeaders(token));

      const itemId = cartResponse.body.data.cart.items[0]._id;

      // Remove item
      const response = await request(app)
        .delete('/api/cart/remove')
        .set(getAuthHeaders(token))
        .send({ itemId })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

