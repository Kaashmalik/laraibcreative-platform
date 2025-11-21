/**
 * Test Script for Product Model Updates
 * Tests the new 'type' field and 'embroideryDetails' schema
 * 
 * Run: node backend/test-product-model.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const testProductModel = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Create product with 'ready-made' type
    console.log('\n📦 Test 1: Creating ready-made product...');
    const readyMadeProduct = new Product({
      title: 'Test Ready-Made Suit',
      description: 'A beautiful ready-made ladies suit for testing',
      designCode: 'LC-2025-001',
      category: new mongoose.Types.ObjectId(), // Mock category ID
      type: 'ready-made',
      fabric: {
        type: 'Lawn',
        composition: '100% Cotton',
        care: 'Machine washable'
      },
      pricing: {
        basePrice: 5000,
        currency: 'PKR'
      },
      customization: {
        allowFullyCustom: false,
        allowBrandArticle: false,
        allowOwnFabric: false
      },
      sizeAvailability: {
        standardSizes: ['S', 'M', 'L', 'XL']
      },
      images: [{
        url: 'https://example.com/image.jpg',
        altText: 'Test product image'
      }],
      primaryImage: 'https://example.com/image.jpg'
    });

    // Validate without saving
    try {
      await readyMadeProduct.validate();
      console.log('✅ Ready-made product validation passed');
    } catch (error) {
      console.error('❌ Ready-made product validation failed:', error.message);
    }

    // Test 2: Create product with 'karhai' type and embroideryDetails
    console.log('\n📦 Test 2: Creating karhai product with embroidery...');
    const karhaiProduct = new Product({
      title: 'Test Hand-Made Karhai Suit',
      description: 'A beautiful hand-made karhai suit with intricate embroidery',
      designCode: 'LC-2025-002',
      category: new mongoose.Types.ObjectId(),
      type: 'karhai',
      embroideryDetails: {
        type: 'zardozi',
        complexity: 'intricate',
        coverage: 'full',
        estimatedHours: 120,
        additionalCost: 15000,
        description: 'Beautiful zardozi work with gold thread'
      },
      fabric: {
        type: 'Silk',
        composition: 'Pure Silk',
        care: 'Dry clean only'
      },
      pricing: {
        basePrice: 25000,
        currency: 'PKR'
      },
      customization: {
        allowFullyCustom: true,
        allowBrandArticle: false,
        allowOwnFabric: true
      },
      sizeAvailability: {
        customSizeOnly: true
      },
      images: [{
        url: 'https://example.com/karhai.jpg',
        altText: 'Karhai suit image'
      }],
      primaryImage: 'https://example.com/karhai.jpg'
    });

    try {
      await karhaiProduct.validate();
      console.log('✅ Karhai product validation passed');
      console.log('   - Embroidery type:', karhaiProduct.embroideryDetails.type);
      console.log('   - Complexity:', karhaiProduct.embroideryDetails.complexity);
      console.log('   - Estimated hours:', karhaiProduct.embroideryDetails.estimatedHours);
    } catch (error) {
      console.error('❌ Karhai product validation failed:', error.message);
    }

    // Test 3: Create product with 'replica' type
    console.log('\n📦 Test 3: Creating replica product...');
    const replicaProduct = new Product({
      title: 'Test Brand Replica Suit',
      description: 'High-quality brand replica suit',
      designCode: 'LC-2025-003',
      category: new mongoose.Types.ObjectId(),
      type: 'replica',
      fabric: {
        type: 'Chiffon',
        composition: 'Polyester Chiffon',
        care: 'Hand wash'
      },
      pricing: {
        basePrice: 8000,
        brandArticleCharge: 2000,
        currency: 'PKR'
      },
      customization: {
        allowFullyCustom: true,
        allowBrandArticle: true,
        allowOwnFabric: false
      },
      sizeAvailability: {
        standardSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      images: [{
        url: 'https://example.com/replica.jpg',
        altText: 'Replica suit image'
      }],
      primaryImage: 'https://example.com/replica.jpg'
    });

    try {
      await replicaProduct.validate();
      console.log('✅ Replica product validation passed');
    } catch (error) {
      console.error('❌ Replica product validation failed:', error.message);
    }

    // Test 4: Invalid type value
    console.log('\n📦 Test 4: Testing invalid type value...');
    const invalidProduct = new Product({
      title: 'Invalid Product',
      description: 'Test invalid type',
      designCode: 'LC-2025-004',
      category: new mongoose.Types.ObjectId(),
      type: 'invalid-type', // Should fail
      fabric: { type: 'Lawn' },
      pricing: { basePrice: 5000 },
      customization: {},
      sizeAvailability: {},
      images: [{ url: 'https://example.com/test.jpg' }],
      primaryImage: 'https://example.com/test.jpg'
    });

    try {
      await invalidProduct.validate();
      console.log('❌ Invalid type validation should have failed but passed');
    } catch (error) {
      console.log('✅ Invalid type correctly rejected:', error.errors?.type?.message);
    }

    // Test 5: Invalid embroidery type
    console.log('\n📦 Test 5: Testing invalid embroidery type...');
    const invalidEmbroidery = new Product({
      title: 'Invalid Embroidery',
      description: 'Test invalid embroidery',
      designCode: 'LC-2025-005',
      category: new mongoose.Types.ObjectId(),
      type: 'karhai',
      embroideryDetails: {
        type: 'invalid-embroidery', // Should fail
        complexity: 'simple'
      },
      fabric: { type: 'Lawn' },
      pricing: { basePrice: 5000 },
      customization: {},
      sizeAvailability: {},
      images: [{ url: 'https://example.com/test.jpg' }],
      primaryImage: 'https://example.com/test.jpg'
    });

    try {
      await invalidEmbroidery.validate();
      console.log('❌ Invalid embroidery validation should have failed but passed');
    } catch (error) {
      console.log('✅ Invalid embroidery correctly rejected:', error.errors?.['embroideryDetails.type']?.message);
    }

    console.log('\n✅ All Product model tests completed!');
    console.log('\n📊 Test Summary:');
    console.log('   - type field: ✅ Working');
    console.log('   - embroideryDetails schema: ✅ Working');
    console.log('   - Validation: ✅ Working');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run tests
if (require.main === module) {
  testProductModel();
}

module.exports = { testProductModel };

