// ==========================================
// PRODUCTS SEED DATA
// ==========================================
// Seed script for products
// Run: node src/seeds/products.seed.js
// Note: Requires categories to be seeded first
// ==========================================

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sample product data
const products = [
  // Bridal Wear Products
  {
    title: 'Red Velvet Bridal Suit',
    slug: 'red-velvet-bridal-suit',
    sku: 'LC-BR-001',
    description: 'Exquisite red velvet bridal suit with intricate gold embroidery. Perfect for your special day with premium quality fabric and craftsmanship.',
    category: null, // Will be set to bridal-wear category ID
    subcategory: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    fabric: {
      type: 'Velvet',
      composition: '100% Premium Velvet',
      weight: 'Heavy',
      care: 'Dry clean only. Store in a cool, dry place.',
      texture: 'Embroidered'
    },
    pricing: {
      basePrice: 25000,
      customStitchingCharge: 5000,
      brandArticleCharge: 3000,
      fabricProvidedByLC: 8000,
      rushOrderFee: 2000,
      currency: 'PKR'
    },
    availability: 'custom-only',
    featured: true,
    inStock: true,
    seo: {
      metaTitle: 'Red Velvet Bridal Suit | Custom Bridal Stitching | LaraibCreative',
      metaDescription: 'Exquisite red velvet bridal suit with gold embroidery. Custom stitching available. Premium quality fabric.',
      keywords: ['red bridal suit', 'velvet bridal', 'custom bridal stitching', 'gold embroidery']
    }
  },
  {
    title: 'Pink Silk Bridal Suit',
    slug: 'pink-silk-bridal-suit',
    sku: 'LC-BR-002',
    description: 'Elegant pink silk bridal suit with delicate embroidery work. Soft and luxurious fabric perfect for brides.',
    category: null,
    subcategory: 'Bridal',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    fabric: {
      type: 'Silk',
      composition: '100% Pure Silk',
      weight: 'Medium',
      care: 'Dry clean recommended. Handle with care.',
      texture: 'Embroidered'
    },
    pricing: {
      basePrice: 22000,
      customStitchingCharge: 5000,
      brandArticleCharge: 3000,
      fabricProvidedByLC: 7000,
      currency: 'PKR'
    },
    availability: 'custom-only',
    featured: true,
    inStock: true,
    seo: {
      metaTitle: 'Pink Silk Bridal Suit | Silk Bridal Dresses | LaraibCreative',
      metaDescription: 'Elegant pink silk bridal suit with delicate embroidery. Custom stitching available.',
      keywords: ['pink bridal suit', 'silk bridal', 'bridal dresses']
    }
  },
  // Party Wear Products
  {
    title: 'Blue Chiffon Party Suit',
    slug: 'blue-chiffon-party-suit',
    sku: 'LC-PW-001',
    description: 'Stunning blue chiffon party suit with sequin work. Perfect for weddings and special occasions.',
    category: null,
    subcategory: 'Party Wear',
    images: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    fabric: {
      type: 'Chiffon',
      composition: '100% Premium Chiffon',
      weight: 'Light',
      care: 'Hand wash or dry clean. Iron on low heat.',
      texture: 'Printed'
    },
    pricing: {
      basePrice: 12000,
      customStitchingCharge: 3500,
      brandArticleCharge: 2000,
      fabricProvidedByLC: 4000,
      currency: 'PKR'
    },
    availability: 'in-stock',
    featured: true,
    inStock: true,
    seo: {
      metaTitle: 'Blue Chiffon Party Suit | Party Wear Dresses | LaraibCreative',
      metaDescription: 'Stunning blue chiffon party suit with sequin work. Perfect for weddings and occasions.',
      keywords: ['party suit', 'chiffon suit', 'blue party wear', 'occasion wear']
    }
  },
  {
    title: 'Green Lawn Party Suit',
    slug: 'green-lawn-party-suit',
    sku: 'LC-PW-002',
    description: 'Comfortable green lawn party suit with beautiful prints. Ideal for summer parties and events.',
    category: null,
    subcategory: 'Party Wear',
    images: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    fabric: {
      type: 'Lawn',
      composition: '100% Premium Lawn',
      weight: 'Light',
      care: 'Machine washable. Iron on medium heat.',
      texture: 'Printed'
    },
    pricing: {
      basePrice: 8000,
      customStitchingCharge: 2500,
      brandArticleCharge: 1500,
      fabricProvidedByLC: 3000,
      currency: 'PKR'
    },
    availability: 'in-stock',
    featured: true,
    inStock: true,
    seo: {
      metaTitle: 'Green Lawn Party Suit | Lawn Party Wear | LaraibCreative',
      metaDescription: 'Comfortable green lawn party suit with beautiful prints. Perfect for summer parties.',
      keywords: ['lawn party suit', 'green party wear', 'summer party suit']
    }
  },
  // Casual Suits
  {
    title: 'White Cotton Casual Suit',
    slug: 'white-cotton-casual-suit',
    sku: 'LC-CS-001',
    description: 'Comfortable white cotton casual suit perfect for everyday wear. Simple yet elegant design.',
    category: null,
    subcategory: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800',
    fabric: {
      type: 'Cotton',
      composition: '100% Pure Cotton',
      weight: 'Medium',
      care: 'Machine washable. Easy to maintain.',
      texture: 'Plain'
    },
    pricing: {
      basePrice: 5000,
      customStitchingCharge: 2000,
      brandArticleCharge: 1000,
      fabricProvidedByLC: 2000,
      currency: 'PKR'
    },
    availability: 'in-stock',
    featured: false,
    inStock: true,
    seo: {
      metaTitle: 'White Cotton Casual Suit | Casual Wear | LaraibCreative',
      metaDescription: 'Comfortable white cotton casual suit for everyday wear. Simple and elegant.',
      keywords: ['casual suit', 'cotton suit', 'everyday wear', 'comfortable suits']
    }
  },
  {
    title: 'Printed Casual Suit',
    slug: 'printed-casual-suit',
    sku: 'LC-CS-002',
    description: 'Stylish printed casual suit with modern design. Perfect for daily wear and casual outings.',
    category: null,
    subcategory: 'Casual',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    fabric: {
      type: 'Lawn',
      composition: '100% Premium Lawn',
      weight: 'Light',
      care: 'Machine washable. Iron on medium heat.',
      texture: 'Printed'
    },
    pricing: {
      basePrice: 6000,
      customStitchingCharge: 2000,
      brandArticleCharge: 1000,
      fabricProvidedByLC: 2500,
      currency: 'PKR'
    },
    availability: 'in-stock',
    featured: false,
    inStock: true,
    seo: {
      metaTitle: 'Printed Casual Suit | Casual Dresses | LaraibCreative',
      metaDescription: 'Stylish printed casual suit with modern design. Perfect for daily wear.',
      keywords: ['printed suit', 'casual dress', 'daily wear suit']
    }
  },
  // Formal Wear
  {
    title: 'Navy Blue Formal Suit',
    slug: 'navy-blue-formal-suit',
    sku: 'LC-FW-001',
    description: 'Professional navy blue formal suit perfect for office and business occasions. Classic design with modern fit.',
    category: null,
    subcategory: 'Formal',
    images: [
      'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800',
    fabric: {
      type: 'Cotton',
      composition: '100% Premium Cotton',
      weight: 'Medium',
      care: 'Dry clean recommended for best results.',
      texture: 'Plain'
    },
    pricing: {
      basePrice: 7000,
      customStitchingCharge: 2500,
      brandArticleCharge: 1500,
      fabricProvidedByLC: 3000,
      currency: 'PKR'
    },
    availability: 'in-stock',
    featured: false,
    inStock: true,
    seo: {
      metaTitle: 'Navy Blue Formal Suit | Office Wear | Formal Dresses | LaraibCreative',
      metaDescription: 'Professional navy blue formal suit for office and business occasions.',
      keywords: ['formal suit', 'office wear', 'business suit', 'professional wear']
    }
  },
  // Designer Replicas
  {
    title: 'Designer Replica Suit - Collection 1',
    slug: 'designer-replica-suit-collection-1',
    sku: 'LC-DR-001',
    description: 'High-quality replica of famous designer suit. Get the designer look at an affordable price with premium quality.',
    category: null,
    subcategory: 'Designer Replica',
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
    fabric: {
      type: 'Silk',
      composition: '100% Premium Silk',
      weight: 'Medium',
      care: 'Dry clean only. Handle with care.',
      texture: 'Embroidered'
    },
    pricing: {
      basePrice: 18000,
      customStitchingCharge: 4000,
      brandArticleCharge: 5000,
      fabricProvidedByLC: 6000,
      currency: 'PKR'
    },
    availability: 'custom-only',
    featured: true,
    inStock: true,
    seo: {
      metaTitle: 'Designer Replica Suit | Designer Copy | LaraibCreative',
      metaDescription: 'High-quality replica of famous designer suit. Get designer look at affordable price.',
      keywords: ['designer replica', 'designer copy', 'replica stitching', 'designer suit replica']
    }
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connected to MongoDB');

    // Get category IDs
    const bridalCategory = await Category.findOne({ slug: 'bridal-wear' });
    const partyCategory = await Category.findOne({ slug: 'party-wear' });
    const casualCategory = await Category.findOne({ slug: 'casual' });
    const formalCategory = await Category.findOne({ slug: 'formal-wear' });
    const designerCategory = await Category.findOne({ slug: 'designer-replicas' });

    if (!bridalCategory || !partyCategory || !casualCategory || !formalCategory || !designerCategory) {
      throw new Error('Categories not found. Please run categories seed first: node src/seeds/categories.seed.js');
    }

    // Map products to categories
    const productsWithCategories = products.map(product => {
      let categoryId = null;
      
      if (product.sku.startsWith('LC-BR')) {
        categoryId = bridalCategory._id;
      } else if (product.sku.startsWith('LC-PW')) {
        categoryId = partyCategory._id;
      } else if (product.sku.startsWith('LC-CS')) {
        categoryId = casualCategory._id;
      } else if (product.sku.startsWith('LC-FW')) {
        categoryId = formalCategory._id;
      } else if (product.sku.startsWith('LC-DR')) {
        categoryId = designerCategory._id;
      }

      return {
        ...product,
        category: categoryId
      };
    });

    // Clear existing products (optional)
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Successfully seeded ${insertedProducts.length} products`);

    // Display seeded products
    console.log('\n📋 Seeded Products:');
    insertedProducts.forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.title} (${prod.sku}) - ${prod.pricing.basePrice} PKR`);
    });

    console.log('\n✅ Products seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, products };

