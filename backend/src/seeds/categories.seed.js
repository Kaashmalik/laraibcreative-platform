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
    name: 'Bridal Wear',
    slug: 'bridal-wear',
    description: 'Exquisite bridal collections with intricate embroidery and premium fabrics. Perfect for your special day.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Bridal Wear Collection | Custom Stitching | LaraibCreative',
    metaDescription: 'Discover our stunning bridal wear collection. Custom stitched bridal suits with premium fabrics and exquisite embroidery.',
    keywords: ['bridal wear', 'bridal suits', 'wedding dresses', 'custom bridal stitching']
  },
  {
    name: 'Party Wear',
    slug: 'party-wear',
    description: 'Elegant party wear suits for weddings, engagements, and special occasions. Stand out with our designer collection.',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800',
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Party Wear Suits | Designer Party Dresses | LaraibCreative',
    metaDescription: 'Shop elegant party wear suits for all occasions. Designer party dresses with custom stitching available.',
    keywords: ['party wear', 'party suits', 'designer dresses', 'occasion wear']
  },
  {
    name: 'Casual Suits',
    slug: 'casual',
    description: 'Comfortable and stylish casual suits for everyday wear. Perfect blend of comfort and fashion.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    displayOrder: 3,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Casual Suits | Everyday Wear | LaraibCreative',
    metaDescription: 'Browse our collection of comfortable casual suits. Perfect for daily wear with modern designs.',
    keywords: ['casual suits', 'everyday wear', 'comfortable suits', 'daily wear']
  },
  {
    name: 'Formal Wear',
    slug: 'formal-wear',
    description: 'Professional and elegant formal wear for office and business occasions. Classic designs with modern touch.',
    image: 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800',
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Formal Wear | Office Wear | Professional Suits | LaraibCreative',
    metaDescription: 'Shop professional formal wear suits. Elegant office wear with custom fitting available.',
    keywords: ['formal wear', 'office wear', 'professional suits', 'business wear']
  },
  {
    name: 'Designer Replicas',
    slug: 'designer-replicas',
    description: 'High-quality replicas of famous designer suits. Get the designer look at affordable prices.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    displayOrder: 5,
    isActive: true,
    isFeatured: true,
    metaTitle: 'Designer Replicas | Designer Suit Replicas | LaraibCreative',
    metaDescription: 'Shop designer replica suits. High-quality replicas of famous designer collections at affordable prices.',
    keywords: ['designer replicas', 'designer suits', 'replica stitching', 'designer copies']
  },
  {
    name: 'Summer Collection',
    slug: 'summer-collection',
    description: 'Light and breathable summer suits in lawn, chiffon, and cotton. Stay cool and stylish.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    displayOrder: 6,
    isActive: true,
    isFeatured: false,
    metaTitle: 'Summer Collection | Summer Suits | Light Fabrics | LaraibCreative',
    metaDescription: 'Browse our summer collection. Light and breathable suits perfect for hot weather.',
    keywords: ['summer suits', 'lawn suits', 'summer collection', 'light fabrics']
  },
  {
    name: 'Winter Collection',
    slug: 'winter-collection',
    description: 'Warm and cozy winter suits in velvet, silk, and heavy fabrics. Perfect for cold weather.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    displayOrder: 7,
    isActive: true,
    isFeatured: false,
    metaTitle: 'Winter Collection | Winter Suits | Warm Fabrics | LaraibCreative',
    metaDescription: 'Shop our winter collection. Warm and cozy suits in velvet and silk for cold weather.',
    keywords: ['winter suits', 'velvet suits', 'winter collection', 'warm fabrics']
  },
  {
    name: 'Embroidered Suits',
    slug: 'embroidered-suits',
    description: 'Beautifully embroidered suits with intricate thread work and embellishments. Traditional meets modern.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
    displayOrder: 8,
    isActive: true,
    isFeatured: false,
    metaTitle: 'Embroidered Suits | Thread Work Suits | LaraibCreative',
    metaDescription: 'Discover our embroidered suits collection. Beautiful thread work and embellishments.',
    keywords: ['embroidered suits', 'thread work', 'embellished suits', 'traditional embroidery']
  },
  {
    name: 'Ready-Made Suits',
    slug: 'ready-made-suits',
    description: 'Ready-to-wear ladies suits in standard sizes. Perfect fit guaranteed with instant delivery. Shop ready-made ladies suits Pakistan.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800',
    displayOrder: 9,
    isActive: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Ready-Made Ladies Suits Pakistan | Instant Delivery | LaraibCreative',
      metaDescription: 'Shop ready-made ladies suits in Pakistan. Standard sizes available with perfect fit guarantee. Fast delivery across Pakistan.',
      keywords: ['ready-made ladies suits Pakistan', 'ready to wear suits', 'instant delivery suits', 'standard size suits']
    }
  },
  {
    name: 'Brand Replicas',
    slug: 'brand-replicas',
    description: 'High-quality brand replica stitching online. Get designer look at affordable prices. Expert brand replica stitching services.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    displayOrder: 10,
    isActive: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Brand Replica Stitching Online | Designer Replicas | LaraibCreative',
      metaDescription: 'Expert brand replica stitching online. High-quality designer replicas at affordable prices. Custom brand replica suits.',
      keywords: ['brand replica stitching online', 'designer replicas', 'brand copies', 'replica stitching service']
    }
  },
  {
    name: 'Hand-Made Karhai Suits',
    slug: 'hand-made-karhai-suits',
    description: 'Exquisite hand-made karhai suits with intricate embroidery. Traditional karhai work in Lahore. Custom hand-made karhai suits.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800',
    displayOrder: 11,
    isActive: true,
    isFeatured: true,
    seo: {
      metaTitle: 'Hand-Made Karhai Suits Lahore | Traditional Karhai Work | LaraibCreative',
      metaDescription: 'Shop hand-made karhai suits in Lahore. Exquisite traditional karhai embroidery work. Custom hand-made karhai suits with perfect fit.',
      keywords: ['hand-made karhai suits Lahore', 'karhai work suits', 'traditional karhai embroidery', 'hand-made karhai stitching']
    }
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

