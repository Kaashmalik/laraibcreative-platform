// ==========================================
// CATEGORIES SEED DATA
// ==========================================
// Seed script for product categories
// Run: node src/seeds/categories.seed.js
// ==========================================

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  {
    name: 'Ready-Made Suits',
    slug: 'ready-made-suits',
    description: 'Ready-to-wear ladies suits in standard sizes. Perfect fit guaranteed with instant delivery across Pakistan.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446.jpg',
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Ready-Made Ladies Suits Pakistan | LaraibCreative',
    metaDescription: 'Shop ready-made ladies suits in Pakistan. Standard sizes with perfect fit. Fast delivery across Pakistan.',
    keywords: ['ready-made suits', 'ready to wear suits', 'ladies suits Pakistan']
  },
  {
    name: 'Brand Replicas',
    slug: 'brand-replicas',
    description: 'High-quality brand replica stitching. Get designer look at affordable prices with expert craftsmanship.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8.jpg',
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Brand Replica Stitching Online | LaraibCreative',
    metaDescription: 'Expert brand replica stitching online. High-quality designer replicas at affordable prices.',
    keywords: ['brand replica stitching', 'designer replicas', 'replica suits']
  },
  {
    name: 'Hand Karhai Collection',
    slug: 'hand-karhai-collection',
    description: 'Exquisite hand-made karhai suits with intricate embroidery. Traditional artisan craftsmanship from Lahore.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e.jpg',
    displayOrder: 3,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Hand Karhai Suits Lahore | LaraibCreative',
    metaDescription: 'Shop hand-made karhai suits in Lahore. Traditional karhai embroidery with premium craftsmanship.',
    keywords: ['hand karhai suits', 'karhai embroidery', 'handmade suits Lahore']
  },
  {
    name: 'Unstitched Fabric',
    slug: 'unstitched-fabric',
    description: 'Premium unstitched fabric collections. Choose your fabric and get custom stitching to your measurements.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b.jpg',
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Unstitched Fabric Collection | LaraibCreative',
    metaDescription: 'Shop premium unstitched fabric with custom stitching service. Choose from lawn, chiffon, silk and more.',
    keywords: ['unstitched fabric', 'custom stitching', 'fabric collection']
  },
  {
    name: 'Bridal Collection',
    slug: 'bridal-collection',
    description: 'Exquisite bridal wear with heavy embroidery and premium fabrics. Make your special day unforgettable.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1.jpg',
    displayOrder: 5,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Bridal Wear Collection | LaraibCreative',
    metaDescription: 'Stunning bridal wear collection with custom stitching. Premium fabrics and exquisite embroidery.',
    keywords: ['bridal wear', 'bridal suits', 'wedding dresses Pakistan']
  },
  {
    name: 'Party & Formal Wear',
    slug: 'party-formal-wear',
    description: 'Elegant suits for weddings, parties, and formal occasions. Stand out with our designer collection.',
    image: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6.jpg',
    displayOrder: 6,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Party & Formal Wear | LaraibCreative',
    metaDescription: 'Shop elegant party wear and formal suits for all occasions. Designer collection with custom stitching.',
    keywords: ['party wear', 'formal wear', 'occasion wear']
  },
  {
    name: 'Casual & Everyday',
    slug: 'casual-everyday',
    description: 'Comfortable and stylish suits for everyday wear. Perfect blend of comfort, quality and fashion.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b.jpg',
    displayOrder: 7,
    isActive: true,
    isFeatured: false,
    metaTitle: 'Casual Suits | Everyday Wear | LaraibCreative',
    metaDescription: 'Comfortable casual suits for daily wear. Quality fabrics with modern designs.',
    keywords: ['casual suits', 'everyday wear', 'daily wear suits']
  }
];

const seedCategories = async () => {
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

    // Clear existing categories (optional - comment out if you want to keep existing)
    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing categories`);

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${insertedCategories.length} categories`);

    // Display seeded categories
    console.log('\n📋 Seeded Categories:');
    insertedCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
    });

    console.log('\n✅ Categories seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories, categories };

