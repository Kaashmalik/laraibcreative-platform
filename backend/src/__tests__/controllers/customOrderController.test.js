/**
 * Custom Order Controller Unit Tests
 * Tests for custom order submission and image upload
 * 
 * @module __tests__/controllers/customOrderController.test
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Measurement = require('../../models/Measurement');

// Mock Cloudinary
jest.mock('../../config/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    success: true,
    url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
    publicId: 'test_public_id'
  })
}));

// Mock WhatsApp
jest.mock('../../config/whatsapp', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({
    success: true,
    sid: 'test_sid'
  })
}));

// Mock Email
jest.mock('../../config/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({
    success: true,
    messageId: 'test_message_id'
  })
}));

describe('Custom Order Controller', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/laraibcreative_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '03001234567',
      password: 'password123',
      role: 'customer'
    });

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
  });

  afterEach(async () => {
    // Clean up
    await Order.deleteMany({});
    await User.deleteMany({});
    await Measurement.deleteMany({});
    jest.clearAllMocks();
  });

  describe('POST /api/v1/orders/custom/upload-images', () => {
    it('should upload reference images successfully', async () => {
      // This test would require actual file uploads
      // In a real scenario, you'd use a library like form-data
      // For now, we'll test the endpoint structure
      
      const response = await request(app)
        .post('/api/v1/orders/custom/upload-images')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('images', Buffer.from('fake image'), 'test.jpg');

      // Note: This test may need adjustment based on your multer configuration
      expect(response.status).toBe(200);
    });

    it('should reject too many images', async () => {
      // Test max file limit
      // Implementation depends on your test setup
    });

    it('should reject invalid file types', async () => {
      // Test file type validation
    });
  });

  describe('POST /api/v1/orders/custom', () => {
    const validOrderData = {
      serviceType: 'fully-custom',
      designIdea: 'I want a beautiful royal blue suit with golden embroidery work on the neckline and sleeves. The design should be modern yet traditional.',
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
      saveMeasurements: false,
      specialInstructions: 'Please use matching thread',
      rushOrder: false,
      customerInfo: {
        fullName: 'Test Customer',
        email: 'customer@example.com',
        phone: '03001234567',
        whatsapp: '03001234567'
      },
      estimatedPrice: 3000
    };

    it('should create custom order successfully', async () => {
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.orderNumber).toBeDefined();
      expect(response.body.orderId).toBeDefined();
    });

    it('should validate service type', async () => {
      const invalidData = { ...validOrderData, serviceType: 'invalid' };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate design idea for fully-custom', async () => {
      const invalidData = { ...validOrderData, designIdea: 'Short' };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate reference images for brand-article', async () => {
      const invalidData = {
        ...validOrderData,
        serviceType: 'brand-article',
        referenceImages: ['only-one-image.jpg']
      };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate fabric selection', async () => {
      const invalidData = {
        ...validOrderData,
        fabricSource: 'lc-provides',
        selectedFabric: null
      };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate measurements', async () => {
      const invalidData = {
        ...validOrderData,
        useStandardSize: false,
        standardSize: '',
        measurements: {}
      };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should save measurements if requested', async () => {
      const dataWithMeasurements = {
        ...validOrderData,
        saveMeasurements: true,
        measurementLabel: 'My Size'
      };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dataWithMeasurements);

      expect(response.status).toBe(201);
      
      // Check if measurements were saved
      const savedMeasurement = await Measurement.findOne({ user: testUser._id });
      expect(savedMeasurement).toBeDefined();
      expect(savedMeasurement.label).toBe('My Size');
    });

    it('should calculate price correctly', async () => {
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(201);
      
      const order = await Order.findById(response.body.orderId);
      expect(order.pricing.total).toBeGreaterThan(0);
      expect(order.pricing.subtotal).toBeGreaterThan(0);
      expect(order.pricing.tax).toBeGreaterThan(0);
    });

    it('should handle rush order fee', async () => {
      const rushOrderData = { ...validOrderData, rushOrder: true };
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(rushOrderData);

      expect(response.status).toBe(201);
      
      const order = await Order.findById(response.body.orderId);
      // Rush order should add 1000 PKR
      expect(order.pricing.total).toBeGreaterThan(3000);
    });

    it('should send notifications', async () => {
      const { sendWhatsAppMessage } = require('../../config/whatsapp');
      const { sendEmail } = require('../../config/email');
      
      const response = await request(app)
        .post('/api/v1/orders/custom')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData);

      expect(response.status).toBe(201);
      
      // Check if notifications were sent
      expect(sendWhatsAppMessage).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/orders/custom/:id', () => {
    it('should get custom order by ID', async () => {
      // Create a test order
      const order = await Order.create({
        orderNumber: 'LC-2025-0001',
        customer: testUser._id,
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567'
        },
        items: [{
          isCustom: true,
          customDetails: {
            serviceType: 'fully-custom'
          },
          price: 3000,
          quantity: 1,
          subtotal: 3000
        }],
        shippingAddress: {
          fullName: 'Test User',
          phone: '03001234567',
          addressLine1: 'Test Address',
          city: 'Lahore',
          province: 'Punjab'
        },
        payment: {
          method: 'pending',
          status: 'pending'
        },
        pricing: {
          subtotal: 3000,
          tax: 150,
          total: 3150
        },
        status: 'pending-payment'
      });

      const response = await request(app)
        .get(`/api/v1/orders/custom/${order._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderNumber).toBe('LC-2025-0001');
    });

    it('should deny access to other users', async () => {
      // Create another user
      const otherUser = await User.create({
        fullName: 'Other User',
        email: 'other@example.com',
        phone: '03009876543',
        password: 'password123',
        role: 'customer'
      });

      const jwt = require('jsonwebtoken');
      const otherToken = jwt.sign({ id: otherUser._id }, process.env.JWT_SECRET || 'test_secret');

      // Create order for testUser
      const order = await Order.create({
        orderNumber: 'LC-2025-0001',
        customer: testUser._id,
        customerInfo: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '03001234567'
        },
        items: [],
        shippingAddress: {},
        payment: {},
        pricing: {},
        status: 'pending-payment'
      });

      const response = await request(app)
        .get(`/api/v1/orders/custom/${order._id}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});

module.exports = {};

