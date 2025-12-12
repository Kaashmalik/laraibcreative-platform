/**
 * Professional Seed Data for LaraibCreative
 * 
 * Seeds the database with:
 * - Categories with icons
 * - Professional product listings
 * - Sample settings
 * 
 * Run: npm run seed:professional
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// ============ CATEGORY DATA WITH ICONS ============
const categories = [
  {
    name: 'Bridal Collection',
    slug: 'bridal-collection',
    description: 'Exquisite bridal wear for your special day. From traditional reds to contemporary designs.',
    icon: '👰',
    image: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800',
    isActive: true,
    displayOrder: 1,
    subcategories: ['Bridal Lehenga', 'Bridal Sharara', 'Bridal Gharara', 'Walima Dress', 'Mehndi Dress']
  },
  {
    name: 'Party Wear',
    slug: 'party-wear',
    description: 'Glamorous outfits for celebrations and special occasions.',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800',
    isActive: true,
    displayOrder: 2,
    subcategories: ['Evening Gowns', 'Cocktail Dresses', 'Anarkali Suits', 'Sharara Sets']
  },
  {
    name: 'Formal Collection',
    slug: 'formal-collection',
    description: 'Elegant formal wear for office and sophisticated gatherings.',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800',
    isActive: true,
    displayOrder: 3,
    subcategories: ['Kurta Sets', 'Trouser Suits', 'Palazzo Sets', 'Straight Suits']
  },
  {
    name: 'Casual Wear',
    slug: 'casual-wear',
    description: 'Comfortable and stylish everyday Pakistani fashion.',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
    isActive: true,
    displayOrder: 4,
    subcategories: ['Lawn Suits', 'Cotton Suits', 'Kurti', 'Pret Wear']
  },
  {
    name: 'Luxury Pret',
    slug: 'luxury-pret',
    description: 'Premium ready-to-wear designer collection.',
    icon: '💎',
    image: 'https://images.unsplash.com/photo-1614786269829-d24616faf56d?w=800',
    isActive: true,
    displayOrder: 5,
    subcategories: ['Designer Kurtas', 'Embroidered Suits', 'Premium Pret']
  },
  {
    name: 'Festive Collection',
    slug: 'festive-collection',
    description: 'Special collection for Eid, weddings, and festive celebrations.',
    icon: '🎉',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
    isActive: true,
    displayOrder: 6,
    subcategories: ['Eid Collection', 'Wedding Guest', 'Festive Formals']
  },
  {
    name: 'Unstitched Fabric',
    slug: 'unstitched-fabric',
    description: 'Premium unstitched fabrics for custom tailoring.',
    icon: '🧵',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    isActive: true,
    displayOrder: 7,
    subcategories: ['3-Piece Suits', '2-Piece Suits', 'Fabric Meters']
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look with our curated accessories.',
    icon: '👜',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800',
    isActive: true,
    displayOrder: 8,
    subcategories: ['Clutches', 'Jewelry', 'Dupattas', 'Footwear']
  }
];

// ============ SAMPLE PRODUCTS ============
const generateProducts = (categoryId, categoryName) => {
  const products = [];
  
  const productTemplates = {
    'Bridal Collection': [
      {
        title: 'Royal Crimson Bridal Lehenga',
        description: 'Exquisite handcrafted bridal lehenga in deep crimson velvet, featuring intricate zardozi embroidery with gold and silver threads. The heavily embellished blouse pairs perfectly with a matching dupatta adorned with gota work borders. Perfect for the modern bride who appreciates traditional craftsmanship.',
        shortDescription: 'Luxurious crimson velvet bridal lehenga with zardozi work',
        basePrice: 175000,
        fabric: { type: 'velvet', composition: '100% Pure Velvet with Silk Lining', care: 'Dry clean only' },
        occasion: 'wedding',
        tags: ['bridal', 'wedding', 'lehenga', 'velvet', 'zardozi'],
        features: ['Handcrafted Zardozi Embroidery', 'Pure Velvet Fabric', 'Cancan Layered Lehenga', 'Heavy Dupatta', 'Custom Fitting Available']
      },
      {
        title: 'Emerald Green Bridal Gharara',
        description: 'Stunning emerald green bridal gharara set featuring delicate dabka and pearl work. The short kurti is paired with flared gharara pants and a heavily embroidered dupatta. A regal choice for the bride who wants to stand out.',
        shortDescription: 'Elegant emerald gharara with pearl embellishments',
        basePrice: 145000,
        fabric: { type: 'organza', composition: 'Pure Organza with Silk Base', care: 'Dry clean only' },
        occasion: 'wedding',
        tags: ['bridal', 'gharara', 'green', 'dabka', 'pearl'],
        features: ['Dabka & Pearl Work', 'Flared Gharara', 'Matching Accessories', 'Premium Finishing', 'Made to Measure']
      },
      {
        title: 'Blush Pink Walima Dress',
        description: 'Ethereal blush pink walima ensemble with silver thread embroidery. Features a long trail gown silhouette with delicate sequin work. The perfect romantic choice for your walima reception.',
        shortDescription: 'Romantic blush pink walima gown with trail',
        basePrice: 125000,
        fabric: { type: 'silk', composition: 'Pure Silk with Net Overlay', care: 'Dry clean recommended' },
        occasion: 'walima',
        tags: ['walima', 'pink', 'gown', 'reception', 'bridal'],
        features: ['Trail Gown Style', 'Silver Threadwork', 'Sequin Detailing', 'Concealed Zip', 'Padded Bust']
      }
    ],
    'Party Wear': [
      {
        title: 'Midnight Blue Anarkali',
        description: 'Stunning midnight blue Anarkali suit with silver star-dust embroidery. The floor-length silhouette creates an elegant flow, perfect for evening celebrations.',
        shortDescription: 'Elegant midnight blue Anarkali with silver embroidery',
        basePrice: 35000,
        fabric: { type: 'georgette', composition: 'Premium Georgette with Santoon Lining', care: 'Dry clean only' },
        occasion: 'party',
        tags: ['anarkali', 'party', 'blue', 'evening'],
        features: ['Floor Length Design', 'Silver Embroidery', 'Free Flowing Silhouette', 'Matching Dupatta', 'Ready to Wear']
      },
      {
        title: 'Rose Gold Sharara Set',
        description: 'Glamorous rose gold sharara set with mirror work and sequin embellishments. The short kurti features a sweetheart neckline, paired with wide-leg sharara pants.',
        shortDescription: 'Glamorous rose gold sharara with mirror work',
        basePrice: 42000,
        fabric: { type: 'silk', composition: 'Art Silk with Shimmer', care: 'Dry clean recommended' },
        occasion: 'party',
        tags: ['sharara', 'rose gold', 'mirror work', 'party'],
        features: ['Mirror Work', 'Sweetheart Neckline', 'Wide Leg Sharara', 'Net Dupatta', 'Side Zip']
      }
    ],
    'Formal Collection': [
      {
        title: 'Ivory Straight Suit',
        description: 'Sophisticated ivory straight suit with subtle thread embroidery. Perfect for office wear and formal gatherings. Features clean lines and minimalist elegance.',
        shortDescription: 'Elegant ivory formal suit with subtle embroidery',
        basePrice: 18000,
        fabric: { type: 'cotton', composition: 'Premium Cotton Blend', care: 'Machine wash cold' },
        occasion: 'formal',
        tags: ['formal', 'office', 'ivory', 'straight suit'],
        features: ['Subtle Embroidery', 'Comfortable Fit', 'Breathable Fabric', 'Matching Trouser', 'Day to Night Wear']
      },
      {
        title: 'Navy Blue Kurta Set',
        description: 'Classic navy blue kurta set with white churidar. Features delicate chikankari work on the yoke. A versatile choice for formal occasions.',
        shortDescription: 'Classic navy kurta with chikankari detailing',
        basePrice: 15000,
        fabric: { type: 'lawn', composition: '100% Premium Lawn', care: 'Machine wash cold' },
        occasion: 'formal',
        tags: ['formal', 'kurta', 'navy', 'chikankari'],
        features: ['Chikankari Work', 'A-Line Silhouette', 'Included Churidar', 'Button Placket', 'Side Pockets']
      }
    ],
    'Casual Wear': [
      {
        title: 'Floral Print Lawn Suit',
        description: 'Fresh and vibrant floral print lawn suit perfect for everyday wear. Light, breathable fabric ideal for Pakistani summers. Three-piece set includes shirt, trouser, and dupatta.',
        shortDescription: 'Vibrant floral lawn 3-piece suit',
        basePrice: 5500,
        fabric: { type: 'lawn', composition: '100% Premium Lawn', care: 'Machine washable' },
        occasion: 'casual',
        tags: ['lawn', 'casual', 'floral', 'summer', '3-piece'],
        features: ['Digital Print', 'Breathable Fabric', '3-Piece Set', 'Color Fast', 'Easy Care']
      },
      {
        title: 'Mustard Embroidered Kurti',
        description: 'Cheerful mustard kurti with delicate white thread embroidery. Perfect for casual outings and daily wear. Pair with jeans or palazzo pants.',
        shortDescription: 'Casual mustard kurti with white embroidery',
        basePrice: 3200,
        fabric: { type: 'cotton', composition: '100% Cotton', care: 'Machine washable' },
        occasion: 'casual',
        tags: ['kurti', 'casual', 'mustard', 'embroidered'],
        features: ['Thread Embroidery', 'Comfortable Fit', 'Side Slits', 'Rounded Hem', 'All Day Comfort']
      }
    ],
    'Luxury Pret': [
      {
        title: 'Black Velvet Evening Suit',
        description: 'Sophisticated black velvet suit with gold zari border work. A statement piece for high-end events. Features structured shoulders and elegant neckline.',
        shortDescription: 'Premium black velvet suit with gold accents',
        basePrice: 55000,
        fabric: { type: 'velvet', composition: 'Pure Velvet', care: 'Dry clean only' },
        occasion: 'party',
        tags: ['velvet', 'luxury', 'black', 'gold', 'evening'],
        features: ['Gold Zari Border', 'Structured Silhouette', 'Premium Velvet', 'Hand Finished', 'Designer Piece']
      }
    ],
    'Festive Collection': [
      {
        title: 'Maroon Eid Special Suit',
        description: 'Beautiful maroon Eid suit with intricate cutwork embroidery. Features a peplum style top with flared palazzo pants. Complete with matching organza dupatta.',
        shortDescription: 'Festive maroon peplum suit for Eid',
        basePrice: 28000,
        fabric: { type: 'jamawar', composition: 'Premium Jamawar', care: 'Dry clean recommended' },
        occasion: 'eid',
        tags: ['eid', 'festive', 'maroon', 'peplum'],
        features: ['Cutwork Embroidery', 'Peplum Style', 'Palazzo Pants', 'Organza Dupatta', 'Festive Ready']
      }
    ],
    'Unstitched Fabric': [
      {
        title: 'Sage Green 3-Piece Unstitched',
        description: 'Premium sage green unstitched fabric set. Includes embroidered shirt fabric, plain trouser fabric, and embroidered chiffon dupatta. Perfect for custom tailoring.',
        shortDescription: 'Sage green 3-piece unstitched with embroidery',
        basePrice: 8500,
        fabric: { type: 'lawn', composition: 'Swiss Lawn', care: 'Machine wash after stitching' },
        occasion: 'casual',
        tags: ['unstitched', '3-piece', 'lawn', 'embroidered'],
        features: ['Swiss Lawn Shirt', 'Plain Trouser Fabric', 'Chiffon Dupatta', 'Machine Embroidery', 'Custom Tailoring Ready']
      }
    ],
    'Accessories': [
      {
        title: 'Gold Plated Kundan Earrings',
        description: 'Stunning gold-plated kundan earrings with pearl drops. Perfect complement to any traditional outfit. Lightweight and comfortable for all-day wear.',
        shortDescription: 'Elegant kundan earrings with pearl drops',
        basePrice: 2800,
        fabric: { type: 'other', composition: 'Gold Plated Brass with Kundan', care: 'Store in dry place' },
        occasion: 'party',
        tags: ['earrings', 'kundan', 'jewelry', 'gold'],
        features: ['Gold Plated', 'Kundan Stones', 'Pearl Drops', 'Lightweight', 'Hypoallergenic']
      }
    ]
  };
  
  const templates = productTemplates[categoryName] || [];
  
  templates.forEach((template, index) => {
    const year = new Date().getFullYear();
    const designCode = `LC-${year}-${String(index + 1).padStart(3, '0')}`;
    
    products.push({
      title: template.title,
      description: template.description,
      shortDescription: template.shortDescription,
      designCode,
      category: categoryId,
      occasion: template.occasion,
      tags: template.tags,
      fabric: template.fabric,
      pricing: {
        basePrice: template.basePrice,
        customStitchingCharge: Math.round(template.basePrice * 0.15),
        discount: { percentage: 0, isActive: false }
      },
      features: template.features,
      whatsIncluded: ['Main Outfit', 'Matching Dupatta', 'Quality Packaging'],
      images: [{
        url: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 100000000}?w=800`,
        altText: template.title,
        displayOrder: 0
      }],
      primaryImage: `https://images.unsplash.com/photo-${1500000000000 + Math.random() * 100000000}?w=800`,
      isActive: true,
      isFeatured: index === 0,
      isNewArrival: index < 2,
      status: 'published',
      contentSource: 'manual',
      seo: {
        metaTitle: `${template.title} | LaraibCreative`,
        metaDescription: template.shortDescription,
        keywords: template.tags
      },
      availability: { status: 'made-to-order' },
      customization: {
        allowCustomStitching: true,
        requiresMeasurements: true
      },
      sizeAvailability: {
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'],
        customSizesAvailable: true
      },
      productType: 'both'
    });
  });
  
  return products;
};

// ============ SETTINGS DATA ============
const settingsData = {
  siteName: 'LaraibCreative',
  tagline: 'Luxury Pakistani Fashion',
  description: 'Premium Pakistani fashion e-commerce platform featuring bridal wear, party wear, and designer collections with custom tailoring services.',
  logo: '/images/logo.png',
  favicon: '/images/favicon.ico',
  primaryColor: '#D4AF37',
  secondaryColor: '#E8B4B8',
  accentColor: '#F7E7CE',
  contactEmail: 'contact@laraibcreative.com',
  contactPhone: '+92 303 8111297',
  whatsappNumber: '+923038111297',
  address: 'Lahore, Pakistan',
  socialLinks: {
    facebook: 'https://facebook.com/laraibcreative',
    instagram: 'https://instagram.com/laraibcreative',
    pinterest: 'https://pinterest.com/laraibcreative'
  },
  shippingInfo: {
    freeShippingThreshold: 15000,
    domesticShippingFee: 300,
    estimatedDelivery: '5-7 business days',
    internationalShipping: true
  },
  paymentMethods: ['cod', 'jazzcash', 'easypaisa', 'bank_transfer'],
  currency: 'PKR',
  currencySymbol: 'Rs.',
  seo: {
    metaTitle: 'LaraibCreative - Luxury Pakistani Fashion | Bridal & Designer Wear',
    metaDescription: 'Shop premium Pakistani fashion including bridal lehengas, party wear, and designer collections. Custom tailoring available. Free shipping on orders above Rs. 15,000.',
    keywords: ['pakistani fashion', 'bridal wear', 'party wear', 'designer clothes', 'custom tailoring', 'lehenga', 'sharara']
  }
};

// ============ MAIN SEED FUNCTION ============
async function seedProfessionalData() {
  try {
    console.log('🚀 Starting professional data seed...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing data (optional - comment out to append)
    console.log('🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Seed Categories
    console.log('📁 Seeding categories...');
    const createdCategories = [];
    for (const category of categories) {
      const created = await Category.create(category);
      createdCategories.push(created);
      console.log(`   ✅ Created: ${category.icon} ${category.name}`);
    }
    console.log(`\n✅ Created ${createdCategories.length} categories\n`);
    
    // Seed Products
    console.log('🛍️  Seeding products...');
    let totalProducts = 0;
    for (const category of createdCategories) {
      const products = generateProducts(category._id, category.name);
      if (products.length > 0) {
        await Product.insertMany(products);
        totalProducts += products.length;
        console.log(`   ✅ ${category.name}: ${products.length} products`);
      }
    }
    console.log(`\n✅ Created ${totalProducts} products\n`);
    
    // Seed Settings (update or create)
    console.log('⚙️  Seeding settings...');
    await Settings.findOneAndUpdate(
      {},
      settingsData,
      { upsert: true, new: true }
    );
    console.log('✅ Settings updated\n');
    
    console.log('═'.repeat(50));
    console.log('🎉 Professional seed completed successfully!');
    console.log('═'.repeat(50));
    console.log(`
📊 Summary:
   • Categories: ${createdCategories.length}
   • Products: ${totalProducts}
   • Settings: Updated
   
🌐 Your website is now ready with professional data!
    `);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seed
seedProfessionalData();
