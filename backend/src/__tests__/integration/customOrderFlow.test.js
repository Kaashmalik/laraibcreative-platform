/**
 * Custom Order Flow Integration Tests
 * End-to-end tests for custom order submission flow
 * 
 * @module __tests__/integration/customOrderFlow.test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Order = require('../../models/Order');
const User = require('../../models/User');

describe('Custom Order Flow Integration', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/laraibcreative_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '03001234567',
      password: 'password123',
      role: 'customer'
    });

    const jwt = require('jsonwebtoken');
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
  });

  afterEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
  });

  describe('Complete Custom Order Flow', () => {
    it('should complete full custom order flow', async () => {
      // Step 1: Upload reference images (if brand-article)
      // Note: This would require actual file uploads in a real test
      
      // Step 2: Submit custom order
      const orderData = {
        serviceType: 'fully-custom',
        designIdea: 'I want a beautiful royal blue suit with golden embroidery work on the neckline and sleeves. The design should be modern yet traditional, perfect for a wedding event.',
        fabricSource: 'lc-provides',
        selectedFabric: {
          id: 1,
          name: 'Premium Lawn',
          type: 'Lawn',
          color: 'Blue',
          price: 1500
        },
        useStandardSize: true,
        standardSize: 'M',
        measurements: {
          shirtStyle: 'normal'
        },
        saveMeasurements: true,
        measurementLabel: 'My Wedding Size',
        specialInstructions: 'Please use matching golden thread for embroidery',
        rushOrder: false,
        customerInfo: {
          fullName: 'Test Customer',
          email: 'customer@example.com',
          phone: '03001234567',
          whatsapp: '03001234567'
        },
        estimatedPrice: 3000
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.orderNumber).toBeDefined();

      // Step 3: Verify order was created
      const order = await Order.findById(response.body.orderId);
      expect(order).toBeDefined();
      expect(order.isCustom).toBe(true);
      expect(order.items[0].isCustom).toBe(true);
      expect(order.items[0].customDetails.serviceType).toBe('fully-custom');

      // Step 4: Verify order can be retrieved
      const getResponse = await request(app)
        .get(`/api/v1/orders/custom/${order._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.order.orderNumber).toBe(order.orderNumber);
    });

    it('should handle brand-article order flow', async () => {
      const orderData = {
        serviceType: 'brand-article',
        referenceImages: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg'
        ],
        fabricSource: 'customer-provides',
        fabricDetails: 'I will provide 3 meters of royal blue chiffon fabric with silver zari work. The fabric is lightweight and perfect for summer wear.',
        useStandardSize: false,
        measurements: {
          shirtLength: 40,
          shoulderWidth: 14.5,
          bust: 20.5,
          waist: 20,
          shirtStyle: 'normal'
        },
        specialInstructions: 'Please match the design exactly as shown in reference images',
        rushOrder: true,
        customerInfo: {
          fullName: 'Test Customer',
          email: 'customer@example.com',
          phone: '03001234567'
        },
        estimatedPrice: 3500
      };

      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      
      const order = await Order.findById(response.body.orderId);
      expect(order.items[0].customDetails.serviceType).toBe('brand-article-copy');
      expect(order.items[0].customDetails.referenceImages.length).toBe(3);
      expect(order.items[0].customDetails.rushOrder).toBe(true);
      expect(order.priority).toBe('high');
    });
  });
});

module.exports = {};

