/**
 * Product Model Schema for LaraibCreative
 * Supports both ready-made products and custom stitching services
 * Handles brand article replicas and fully custom designs
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

// Sub-schema for fabric details
const FabricSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Fabric type is required'],
    enum: [
      'Lawn',
      'Chiffon',
      'Silk',
      'Cotton',
      'Velvet',
      'Organza',
      'Georgette',
      'Jacquard',
      'Linen',
      'Khaddar',
      'Karandi',
      'Cambric',
      'Marina',
      'Net',
      'Banarsi',
      'Raw Silk',
      'Jamawar',
      'Other'
    ],
    index: true // For filtering by fabric type
  },
  composition: {
    type: String,
    trim: true,
    maxlength: [200, 'Fabric composition cannot exceed 200 characters'],
    default: ''
  },
  weight: {
    type: String, // e.g., "Light", "Medium", "Heavy"
    enum: ['Light', 'Medium', 'Heavy', ''],
    default: ''
  },
  care: {
    type: String,
    trim: true,
    maxlength: [500, 'Care instructions cannot exceed 500 characters'],
    default: 'Dry clean recommended. Iron on medium heat.'
  },
  stretchable: {
    type: Boolean,
    default: false
  },
  texture: {
    type: String,
    enum: ['Smooth', 'Textured', 'Embroidered', 'Printed', 'Plain', ''],
    default: ''
  }
}, { _id: false });

// Sub-schema for pricing structure
const PricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
    index: true // For price range filtering
  },
  customStitchingCharge: {
    type: Number,
    default: 0,
    min: [0, 'Custom stitching charge cannot be negative']
  },
  brandArticleCharge: {
    type: Number,
    default: 0,
    min: [0, 'Brand article charge cannot be negative'],
    // Additional charge for copying brand articles
  },
  fabricProvidedByLC: {
    // If LC provides fabric, this is the cost
    type: Number,
    default: 0,
    min: [0, 'Fabric cost cannot be negative']
  },
  rushOrderFee: {
    // Express delivery additional charge
    type: Number,
    default: 0,
    min: [0, 'Rush order fee cannot be negative']
  },
  discount: {
    percentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0
    },
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative'],
      default: 0
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  currency: {
    type: String,
    default: 'PKR',
    enum: ['PKR', 'USD']
  }
}, { _id: false });

// Sub-schema for customization options
const CustomizationSchema = new mongoose.Schema({
  allowFullyCustom: {
    type: Boolean,
    default: true,
    // Customer provides design idea + measurements
  },
  allowBrandArticle: {
    type: Boolean,
    default: true,
    // Customer uploads brand article photos to replicate
  },
  allowOwnFabric: {
    type: Boolean,
    default: true,
    // Customer can provide their own fabric
  },
  maxReferenceImages: {
    type: Number,
    default: 5,
    min: [1, 'At least 1 reference image allowed'],
    max: [10, 'Maximum 10 reference images allowed']
  },
  availableAddOns: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  estimatedStitchingDays: {
    type: Number,
    default: 10,
    min: [3, 'Minimum stitching time is 3 days'],
    max: [60, 'Maximum stitching time is 60 days']
  }
}, { _id: false });

// Sub-schema for size and measurements
const SizeAvailabilitySchema = new mongoose.Schema({
  standardSizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  }],
  customSizeOnly: {
    type: Boolean,
    default: false
  },
  measurementGuide: {
    type: String,
    trim: true,
    maxlength: [1000, 'Measurement guide too long']
  }
}, { _id: false });

// Sub-schema for SEO
const SEOSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title should not exceed 60 characters'],
    default: function() {
      return this.title;
    }
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description should not exceed 160 characters']
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  focusKeyword: {
    type: String,
    trim: true,
    lowercase: true
  },
  ogImage: {
    type: String,
    // Open Graph image for social sharing
  }
}, { _id: false });

// Sub-schema for inventory (if tracking stock)
const InventorySchema = new mongoose.Schema({
  trackInventory: {
    type: Boolean,
    default: false // Most items are made-to-order
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },
  sku: {
    type: String,
    unique: true,
    sparse: true, // Allows null values
    uppercase: true,
    trim: true
  }
}, { _id: false });

// Main Product Schema
const ProductSchema = new mongoose.Schema({
  // ============ BASIC INFORMATION ============
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: 'text' // Text search index
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true, // Important for SEO URLs
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [250, 'Short description cannot exceed 250 characters']
  },

  // ============ DESIGN CODE ============
  designCode: {
    type: String,
    required: [true, 'Design code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    // Format: LC-2025-001, LC-2025-002, etc.
    match: [/^LC-\d{4}-\d{3,4}$/, 'Invalid design code format. Use LC-YYYY-XXX']
  },

  // ============ CATEGORIZATION ============
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true
  },
  
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  
  occasion: {
    type: String,
    enum: [
      'Bridal',
      'Party Wear',
      'Casual',
      'Formal',
      'Semi-Formal',
      'Mehndi',
      'Walima',
      'Engagement',
      'Eid',
      'Summer',
      'Winter',
      'Everyday',
      'Office Wear',
      'Other'
    ],
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],

  // ============ IMAGES ============
  images: {
    type: [{
      url: {
        type: String,
        required: true
      },
      publicId: String, // Cloudinary public ID for deletion
      altText: String,
      displayOrder: {
        type: Number,
        default: 0
      }
    }],
    validate: {
      validator: function(images) {
        return images.length >= 1 && images.length <= 15;
      },
      message: 'Product must have between 1 and 15 images'
    }
  },
  
  primaryImage: {
    type: String,
    required: [true, 'Primary image is required']
    // Set automatically to first image if not specified
  },
  
  thumbnailImage: {
    type: String
    // Optimized thumbnail for grid views
  },

  // ============ COLORS ============
  availableColors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    hexCode: {
      type: String,
      match: [/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color code']
    },
    image: String, // Image showing this color variant
    inStock: {
      type: Boolean,
      default: true
    }
  }],

  // ============ FABRIC DETAILS ============
  fabric: {
    type: FabricSchema,
    required: true
  },

  // ============ PRICING ============
  pricing: {
    type: PricingSchema,
    required: true
  },

  // ============ CUSTOMIZATION OPTIONS ============
  customization: {
    type: CustomizationSchema,
    required: true
  },

  // ============ SIZE & MEASUREMENTS ============
  sizeAvailability: {
    type: SizeAvailabilitySchema,
    required: true
  },

  // ============ PRODUCT TYPE ============
  productType: {
    type: String,
    enum: [
      'ready-made',        // Pre-stitched, ready to ship
      'custom-only',       // Only available as custom order
      'both'              // Available both ready-made and custom
    ],
    default: 'both',
    required: true,
    index: true
  },

  // ============ AVAILABILITY ============
  availability: {
    status: {
      type: String,
      enum: ['in-stock', 'made-to-order', 'out-of-stock', 'discontinued'],
      default: 'made-to-order',
      index: true
    },
    expectedRestockDate: Date
  },

  // ============ INVENTORY (OPTIONAL) ============
  inventory: InventorySchema,

  // ============ FEATURES & HIGHLIGHTS ============
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature description too long']
  }],
  
  whatsIncluded: [{
    type: String,
    trim: true
    // e.g., "Shirt", "Trouser", "Dupatta"
  }],

  // ============ PRODUCT STATUS ============
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isNewArrival: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isBestSeller: {
    type: Boolean,
    default: false
  },

  // ============ PERFORMANCE METRICS ============
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  
  clicks: {
    type: Number,
    default: 0,
    min: 0
  },
  
  addedToCart: {
    type: Number,
    default: 0,
    min: 0
  },
  
  purchased: {
    type: Number,
    default: 0,
    min: 0
  },
  
  wishlistedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // ============ REVIEWS & RATINGS ============
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    set: val => Math.round(val * 10) / 10 // Round to 1 decimal
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  ratingDistribution: {
    five: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    one: { type: Number, default: 0 }
  },

  // ============ SEO OPTIMIZATION ============
  seo: SEOSchema,

  // ============ RELATED PRODUCTS ============
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // ============ ADMIN METADATA ============
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes too long']
    // Internal notes not visible to customers
  },

  // ============ SOFT DELETE ============
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: Date,
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============ INDEXES FOR PERFORMANCE ============
// Compound indexes for common queries
ProductSchema.index({ category: 1, isActive: 1, isFeatured: -1 });
ProductSchema.index({ 'pricing.basePrice': 1, isActive: 1 });
ProductSchema.index({ occasion: 1, isActive: 1 });
ProductSchema.index({ 'fabric.type': 1, isActive: 1 });
ProductSchema.index({ productType: 1, 'availability.status': 1 });
ProductSchema.index({ isFeatured: -1, createdAt: -1 });
ProductSchema.index({ isNewArrival: -1, createdAt: -1 });
ProductSchema.index({ views: -1 }); // For popular products
ProductSchema.index({ purchased: -1 }); // For best sellers
ProductSchema.index({ averageRating: -1, totalReviews: -1 }); // For top-rated

// Text index for search functionality
ProductSchema.index({
  title: 'text',
  description: 'text',
  'seo.keywords': 'text',
  designCode: 'text'
}, {
  weights: {
    title: 10,
    designCode: 8,
    'seo.keywords': 5,
    description: 2
  }
});

// ============ VIRTUAL FIELDS ============
// Calculate final price after discount
ProductSchema.virtual('finalPrice').get(function() {
  const { basePrice, discount } = this.pricing;
  
  if (!discount || !discount.isActive) {
    return basePrice;
  }
  
  // Check if discount is still valid
  const now = new Date();
  if (discount.startDate && now < discount.startDate) {
    return basePrice;
  }
  if (discount.endDate && now > discount.endDate) {
    return basePrice;
  }
  
  // Apply discount
  if (discount.percentage > 0) {
    return basePrice - (basePrice * discount.percentage / 100);
  } else if (discount.amount > 0) {
    return Math.max(0, basePrice - discount.amount);
  }
  
  return basePrice;
});

// Check if product is on sale
ProductSchema.virtual('isOnSale').get(function() {
  if (!this.pricing.discount || !this.pricing.discount.isActive) {
    return false;
  }
  
  const now = new Date();
  const { startDate, endDate } = this.pricing.discount;
  
  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;
  
  return (this.pricing.discount.percentage > 0 || this.pricing.discount.amount > 0);
});

// Calculate discount percentage for display
ProductSchema.virtual('discountPercentage').get(function() {
  if (!this.isOnSale) return 0;
  
  const { basePrice, discount } = this.pricing;
  
  if (discount.percentage > 0) {
    return discount.percentage;
  } else if (discount.amount > 0) {
    return Math.round((discount.amount / basePrice) * 100);
  }
  
  return 0;
});

// Virtual for URL
ProductSchema.virtual('url').get(function() {
  return `/products/${this.slug}`;
});

// Check if low stock (if tracking inventory)
ProductSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackInventory) return false;
  return this.inventory.stockQuantity <= this.inventory.lowStockThreshold;
});

// ============ PRE-SAVE HOOKS ============
// Generate slug from title
ProductSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    // Add design code to slug for uniqueness
    if (this.designCode) {
      this.slug = `${this.slug}-${this.designCode.toLowerCase()}`;
    }
  }
  next();
});

// Set primary image if not set
ProductSchema.pre('save', function(next) {
  if (!this.primaryImage && this.images && this.images.length > 0) {
    this.primaryImage = this.images[0].url;
  }
  next();
});

// Generate thumbnail if not set (assuming you have image processing)
ProductSchema.pre('save', function(next) {
  if (!this.thumbnailImage && this.primaryImage) {
    // In production, you'd generate a thumbnail using Sharp or Cloudinary
    // For now, just use primary image
    this.thumbnailImage = this.primaryImage;
  }
  next();
});

// Auto-generate SEO fields if not provided
ProductSchema.pre('save', function(next) {
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.shortDescription || 
      this.description.substring(0, 160);
  }
  
  if (!this.seo.ogImage) {
    this.seo.ogImage = this.primaryImage;
  }
  
  next();
});

// Sanitize HTML in description (prevent XSS)
ProductSchema.pre('save', function(next) {
  // In production, use a library like DOMPurify or sanitize-html
  // For now, basic sanitization
  if (this.isModified('description')) {
    this.description = this.description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  next();
});

// Update isNewArrival automatically (products are new for 30 days)
ProductSchema.pre('save', function(next) {
  if (this.isNew) {
    this.isNewArrival = true;
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (this.createdAt < thirtyDaysAgo) {
      this.isNewArrival = false;
    }
  }
  next();
});

// Validate discount dates
ProductSchema.pre('save', function(next) {
  const { discount } = this.pricing;
  
  if (discount && discount.isActive) {
    if (discount.startDate && discount.endDate) {
      if (discount.startDate >= discount.endDate) {
        return next(new Error('Discount end date must be after start date'));
      }
    }
  }
  
  next();
});

// ============ INSTANCE METHODS ============
// Increment view count
ProductSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Increment clicks
ProductSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  return this.save({ validateBeforeSave: false });
};

// Increment cart additions
ProductSchema.methods.incrementCartAdditions = async function() {
  this.addedToCart += 1;
  return this.save({ validateBeforeSave: false });
};

// Increment purchase count
ProductSchema.methods.incrementPurchases = async function() {
  this.purchased += 1;
  return this.save({ validateBeforeSave: false });
};

// Update rating (called when new review is added)
ProductSchema.methods.updateRating = async function(newRating) {
  // Update rating distribution
  this.ratingDistribution[
    newRating === 5 ? 'five' :
    newRating === 4 ? 'four' :
    newRating === 3 ? 'three' :
    newRating === 2 ? 'two' : 'one'
  ] += 1;
  
  // Recalculate average rating
  const totalRatings = 
    (this.ratingDistribution.five * 5) +
    (this.ratingDistribution.four * 4) +
    (this.ratingDistribution.three * 3) +
    (this.ratingDistribution.two * 2) +
    (this.ratingDistribution.one * 1);
  
  this.totalReviews += 1;
  this.averageRating = totalRatings / this.totalReviews;
  
  return this.save({ validateBeforeSave: false });
};

// Check if in stock
ProductSchema.methods.isInStock = function() {
  if (this.availability.status === 'out-of-stock' || 
      this.availability.status === 'discontinued') {
    return false;
  }
  
  if (this.inventory.trackInventory) {
    return this.inventory.stockQuantity > 0;
  }
  
  // Made-to-order products are always "in stock"
  return true;
};

// Soft delete
ProductSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.isActive = false;
  return this.save({ validateBeforeSave: false });
};

// Restore soft deleted product
ProductSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.isActive = true;
  return this.save({ validateBeforeSave: false });
};

// ============ STATIC METHODS ============
// Find active products only (excluding soft deleted)
ProductSchema.statics.findActive = function(conditions = {}) {
  return this.find({
    ...conditions,
    isActive: true,
    isDeleted: false
  });
};

// Find featured products
ProductSchema.statics.findFeatured = function(limit = 8) {
  return this.find({
    isFeatured: true,
    isActive: true,
    isDeleted: false
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

// Find new arrivals
ProductSchema.statics.findNewArrivals = function(limit = 12) {
  return this.find({
    isNewArrival: true,
    isActive: true,
    isDeleted: false
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

// Find best sellers
ProductSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({
    isActive: true,
    isDeleted: false
  })
  .sort({ purchased: -1 })
  .limit(limit);
};

// Find by price range
ProductSchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    'pricing.basePrice': { $gte: min, $lte: max },
    isActive: true,
    isDeleted: false
  });
};

// Search products
ProductSchema.statics.search = function(query, options = {}) {
  const {
    category,
    occasion,
    fabricType,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 20
  } = options;
  
  const filter = {
    $text: { $search: query },
    isActive: true,
    isDeleted: false
  };
  
  if (category) filter.category = category;
  if (occasion) filter.occasion = occasion;
  if (fabricType) filter['fabric.type'] = fabricType;
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {};
    if (minPrice) filter['pricing.basePrice'].$gte = minPrice;
    if (maxPrice) filter['pricing.basePrice'].$lte = maxPrice;
  }
  
  return this.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-adminNotes');
};

// Auto-generate design code
ProductSchema.statics.generateDesignCode = async function() {
  const year = new Date().getFullYear();
  const prefix = `LC-${year}-`;
  
  // Find the last product of this year
  const lastProduct = await this.findOne({
    designCode: new RegExp(`^${prefix}`)
  })
  .sort({ designCode: -1 })
  .select('designCode');
  
  if (!lastProduct) {
    return `${prefix}001`;
  }
  
  // Extract number and increment
  const lastNumber = parseInt(lastProduct.designCode.split('-')[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// ============ POST HOOKS ============
// Update category product count after save
ProductSchema.post('save', async function(doc) {
  if (doc.category) {
    const Category = mongoose.model('Category');
    await Category.updateProductCount(doc.category);
  }
});

// Update category product count after delete
ProductSchema.post('remove', async function(doc) {
  if (doc.category) {
    const Category = mongoose.model('Category');
    await Category.updateProductCount(doc.category);
  }
});

// ============ QUERY HELPERS ============
ProductSchema.query.active = function() {
  return this.where({ isActive: true, isDeleted: false });
};

ProductSchema.query.featured = function() {
  return this.where({ isFeatured: true });
};

ProductSchema.query.inStock = function() {
  return this.where({ 'availability.status': { $in: ['in-stock', 'made-to-order'] } });
};

ProductSchema.query.byCategory = function(categoryId) {
  return this.where({ category: categoryId });
};

ProductSchema.query.byOccasion = function(occasion) {
  return this.where({ occasion });
};

// ============ EXPORT MODEL ============
module.exports = mongoose.model('Product', ProductSchema);