// ==========================================
// BULK PRODUCT SEED FROM CSV/JSON
// ==========================================
// Fast way to seed real products with Cloudinary image upload
// 
// Usage:
//   1. Put your product images in: backend/seed-images/
//   2. Create products.json or products.csv in: backend/seed-data/
//   3. Run: node src/seeds/bulkProductSeed.js
// ==========================================

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const Category = require('../models/Category');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Paths
const SEED_DATA_DIR = path.join(__dirname, '../../seed-data');
const SEED_IMAGES_DIR = path.join(__dirname, '../../seed-images');

/**
 * Upload image to Cloudinary
 */
async function uploadToCloudinary(imagePath, folder = 'products') {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: `laraibcreative/${folder}`,
      transformation: [
        { width: 1200, height: 1600, crop: 'limit', quality: 'auto:good' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Parse CSV file to array of objects
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    // Handle quoted values with commas
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

/**
 * Main seed function
 */
async function seedFromData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI not defined');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check for data file (JSON or CSV)
    let products = [];
    const jsonPath = path.join(SEED_DATA_DIR, 'products.json');
    const csvPath = path.join(SEED_DATA_DIR, 'products.csv');

    if (fs.existsSync(jsonPath)) {
      console.log('📄 Reading products.json...');
      products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    } else if (fs.existsSync(csvPath)) {
      console.log('📄 Reading products.csv...');
      products = parseCSV(csvPath);
    } else {
      // Create sample template
      console.log('⚠️  No data file found. Creating template...');
      await createTemplate();
      return;
    }

    console.log(`📦 Found ${products.length} products to seed`);

    // Get categories map
    const categories = await Category.find({ isActive: true });
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat._id;
      categoryMap[cat.slug] = cat._id;
    });

    // Process each product
    const results = { success: 0, failed: 0 };
    
    for (const [index, productData] of products.entries()) {
      try {
        console.log(`\n[${index + 1}/${products.length}] Processing: ${productData.title}`);
        
        // Handle images
        let images = [];
        let primaryImage = '';

        // Check if images are local files or URLs
        if (productData.images) {
          const imageList = typeof productData.images === 'string' 
            ? productData.images.split('|').map(s => s.trim())
            : productData.images;

          for (const img of imageList) {
            if (img.startsWith('http')) {
              // Already a URL
              images.push(img);
            } else {
              // Local file - upload to Cloudinary
              const localPath = path.join(SEED_IMAGES_DIR, img);
              if (fs.existsSync(localPath)) {
                console.log(`   📤 Uploading: ${img}`);
                const url = await uploadToCloudinary(localPath);
                if (url) images.push(url);
              } else {
                console.log(`   ⚠️  Image not found: ${localPath}`);
              }
            }
          }
        }

        primaryImage = images[0] || '';

        // Map category
        const categoryKey = (productData.category || '').toLowerCase();
        const categoryId = categoryMap[categoryKey];
        
        if (!categoryId) {
          console.log(`   ⚠️  Category not found: ${productData.category}`);
          results.failed++;
          continue;
        }

        // Build product object
        const product = {
          title: productData.title,
          slug: productData.slug || generateSlug(productData.title),
          sku: productData.sku || generateSKU(productData.title),
          description: productData.description || `${productData.title} - Premium quality Pakistani fashion.`,
          category: categoryId,
          subcategory: productData.subcategory || '',
          occasion: productData.occasion || '',
          images,
          primaryImage,
          type: productData.type || 'ready-made',
          fabric: {
            type: productData.fabricType || 'Lawn',
            composition: productData.fabricComposition || '',
            care: productData.fabricCare || ''
          },
          pricing: {
            basePrice: parseFloat(productData.basePrice) || 5000,
            customStitchingCharge: parseFloat(productData.stitchingCharge) || 2500,
            discount: {
              percentage: parseFloat(productData.discountPercent) || 0,
              isActive: (parseFloat(productData.discountPercent) || 0) > 0
            },
            currency: 'PKR'
          },
          availability: productData.availability || 'in-stock',
          featured: productData.featured === 'true' || productData.featured === true,
          seo: {
            metaTitle: productData.metaTitle || `${productData.title} | LaraibCreative`,
            metaDescription: productData.metaDescription || productData.description?.substring(0, 160) || '',
            keywords: productData.keywords ? productData.keywords.split(',').map(k => k.trim()) : []
          }
        };

        // Check if product exists (by SKU)
        const existing = await Product.findOne({ sku: product.sku });
        if (existing) {
          await Product.updateOne({ sku: product.sku }, product);
          console.log(`   ✏️  Updated: ${product.title}`);
        } else {
          await Product.create(product);
          console.log(`   ✅ Created: ${product.title}`);
        }
        
        results.success++;
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        results.failed++;
      }
    }

    console.log('\n==========================================');
    console.log(`✅ Seeding Complete!`);
    console.log(`   Success: ${results.success}`);
    console.log(`   Failed: ${results.failed}`);
    console.log('==========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

/**
 * Create template files
 */
async function createTemplate() {
  // Ensure directories exist
  if (!fs.existsSync(SEED_DATA_DIR)) fs.mkdirSync(SEED_DATA_DIR, { recursive: true });
  if (!fs.existsSync(SEED_IMAGES_DIR)) fs.mkdirSync(SEED_IMAGES_DIR, { recursive: true });

  // Sample CSV template
  const csvTemplate = `title,sku,category,fabricType,basePrice,stitchingCharge,discountPercent,description,images,featured,availability
"Red Bridal Suit",LC-BR-001,bridal-wear,Velvet,25000,5000,0,"Beautiful red bridal suit with gold embroidery",red-bridal-1.jpg|red-bridal-2.jpg,true,custom-only
"Blue Chiffon Party Dress",LC-PW-001,party-wear,Chiffon,12000,3500,10,"Stunning blue party dress",blue-party-1.jpg,true,in-stock
"White Cotton Casual",LC-CS-001,casual,Cotton,5000,2000,0,"Comfortable everyday wear",white-casual-1.jpg,false,in-stock`;

  // Sample JSON template
  const jsonTemplate = [
    {
      title: "Red Bridal Suit",
      sku: "LC-BR-001",
      category: "bridal-wear",
      fabricType: "Velvet",
      basePrice: 25000,
      stitchingCharge: 5000,
      discountPercent: 0,
      description: "Beautiful red bridal suit with gold embroidery",
      images: ["red-bridal-1.jpg", "red-bridal-2.jpg"],
      featured: true,
      availability: "custom-only"
    },
    {
      title: "Blue Chiffon Party Dress",
      sku: "LC-PW-001", 
      category: "party-wear",
      fabricType: "Chiffon",
      basePrice: 12000,
      stitchingCharge: 3500,
      discountPercent: 10,
      description: "Stunning blue party dress",
      images: ["blue-party-1.jpg"],
      featured: true,
      availability: "in-stock"
    }
  ];

  fs.writeFileSync(path.join(SEED_DATA_DIR, 'products.template.csv'), csvTemplate);
  fs.writeFileSync(path.join(SEED_DATA_DIR, 'products.template.json'), JSON.stringify(jsonTemplate, null, 2));

  console.log(`
✅ Template files created!

📁 Folder Structure:
   backend/
   ├── seed-data/
   │   ├── products.template.csv   ← Copy to products.csv and edit
   │   └── products.template.json  ← Or use JSON format
   └── seed-images/
       └── (put your product images here)

📋 Next Steps:
   1. Copy template to products.csv or products.json
   2. Add your real product data
   3. Put product images in seed-images/ folder
   4. Run: node src/seeds/bulkProductSeed.js

💡 Tips:
   - Images can be filenames (uploaded to Cloudinary) or URLs
   - Use | to separate multiple images in CSV
   - Category must match existing category slug
`);
  
  process.exit(0);
}

// Helpers
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function generateSKU(title) {
  const prefix = title.substring(0, 2).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LC-${prefix}-${random}`;
}

// Run
seedFromData();
