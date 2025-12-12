const mongoose = require('mongoose');
const slugify = require('slugify');

// Sub-schema for fabric details
const FabricSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Fabric type is required'],
    enum: [
      'Lawn', 'Chiffon', 'Silk', 'Cotton', 'Velvet', 'Organza',
      'Georgette', 'Jacquard', 'Linen', 'Khaddar', 'Karandi',
      'Cambric', 'Marina', 'Net', 'Banarsi', 'Raw Silk',
      'Jamawar', 'Other'
    ],
    index: true
  },
  composition: {
    type: String,
    trim: true,
    maxlength: [200, 'Fabric composition cannot exceed 200 characters'],
    default: ''
  },
  weight: {
    type: String,
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

// Sub-schema for pricing
const PricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  customStitchingCharge: {
    type: Number,
    default: 0,
    min: [0, 'Custom stitching charge cannot be negative']
  },
  brandArticleCharge: {
    type: Number,
    default: 0,
    min: [0, 'Brand article charge cannot be negative']
  },
  fabricProvidedByLC: {
    type: Number,
    default: 0,
    min: [0, 'Fabric cost cannot be negative']
  },
  rushOrderFee: {
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

// Sub-schema for customization
const CustomizationSchema = new mongoose.Schema({
  allowFullyCustom: {
    type: Boolean,
    default: true
  },
  allowBrandArticle: {
    type: Boolean,
    default: true
  },
  allowOwnFabric: {
    type: Boolean,
    default: true
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

// Sub-schema for size
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
    maxlength: [60, 'Meta title should not exceed 60 characters']
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
  ogImage: String
}, { _id: false });

// Sub-schema for inventory
const InventorySchema = new mongoose.Schema({
  trackInventory: {
    type: Boolean,
    default: false
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
    sparse: true,
    uppercase: true,
    trim: true
  }
}, { _id: false });

// Main Product Schema
const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: 'text'
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
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

  designCode: {
    type: String,
    required: [true, 'Design code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    // Relaxed regex: accepts LC-YYYY-XXX, LC-timestamp-random, or any LC- prefix format
    match: [/^LC-[A-Z0-9-]+$/i, 'Invalid design code format. Must start with LC-']
  },

  // FIXED: Enhanced category reference with validation
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true,
    validate: {
      validator: async function(value) {
        try {
          const Category = mongoose.model('Category');
          const category = await Category.findById(value);
          return category && category.isActive;
        } catch (error) {
          return false;
        }
      },
      message: 'Selected category does not exist or is inactive'
    }
  },
  
  // FIXED: Category snapshot for historical data
  categorySnapshot: {
    name: String,
    slug: String
  },
  
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  
  occasion: {
    type: String,
    enum: [
      'Bridal', 'Party Wear', 'Casual', 'Formal', 'Semi-Formal',
      'Mehndi', 'Walima', 'Engagement', 'Eid', 'Summer', 'Winter',
      'Everyday', 'Office Wear', 'Other'
    ],
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],

  images: {
    type: [{
      url: {
        type: String,
        required: true
      },
      publicId: String,
      altText: String,
      displayOrder: {
        type: Number,
        default: 0
      },
      imageType: {
        type: String,
        enum: ['front', 'back', 'side', 'detail', 'closeup', 'dupatta', 'trouser', 'full-set', 'model', 'flat-lay', 'other'],
        default: 'other'
      },
      caption: {
        type: String,
        trim: true,
        maxlength: [100, 'Image caption cannot exceed 100 characters']
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
  },
  
  thumbnailImage: String,

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
    image: String,
    inStock: {
      type: Boolean,
      default: true
    }
  }],

  fabric: {
    type: FabricSchema,
    required: true
  },

  pricing: {
    type: PricingSchema,
    required: true
  },

  customization: {
    type: CustomizationSchema,
    required: true
  },

  sizeAvailability: {
    type: SizeAvailabilitySchema,
    required: true
  },

  productType: {
    type: String,
    enum: ['ready-made', 'custom-only', 'both'],
    default: 'both',
    required: true,
    index: true
  },

  // NEW: Suit type classification (ready-made, replica, karhai)
  type: {
    type: String,
    enum: ['ready-made', 'replica', 'karhai', 'hand-karhai'],
    index: true,
    default: 'ready-made'
  },

  // Article/Design name for easy identification (e.g., "Rose Garden", "Royal Elegance")
  articleName: {
    type: String,
    trim: true,
    maxlength: [100, 'Article name cannot exceed 100 characters'],
    index: true
  },

  // Article code/number for internal reference
  articleCode: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Article code cannot exceed 50 characters'],
    index: true
  },

  // Embroidery details for karhai suits
  embroideryDetails: {
    workType: {
      type: String,
      enum: [
        'hand-karhai', 'machine-embroidery', 'zardozi', 'aari', 'gota-kinari',
        'dabka', 'kora', 'sequins', 'beads', 'thread-work', 'resham',
        'tilla', 'mirror-work', 'applique', 'cutwork', 'shadow-work',
        'chikankari', 'phulkari', 'kashmiri', 'mixed', 'none'
      ],
      default: 'none'
    },
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'intricate', 'heavy', 'bridal'],
      default: 'simple'
    },
    coverage: {
      type: String,
      enum: ['minimal', 'partial', 'full', 'heavy', 'all-over'],
      default: 'minimal'
    },
    placement: [{
      type: String,
      enum: ['front-panel', 'back-panel', 'sleeves', 'neckline', 'daman', 'dupatta', 'trouser', 'border', 'motifs']
    }],
    estimatedHours: {
      type: Number,
      min: 0,
      default: 0
    },
    additionalCost: {
      type: Number,
      min: 0,
      default: 0
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Embroidery description cannot exceed 500 characters']
    },
    threadColors: [{
      type: String,
      trim: true
    }]
  },

  // Suit components included
  suitComponents: {
    shirt: {
      included: { type: Boolean, default: true },
      length: { type: String, trim: true }, // e.g., "2.5 meters"
      description: { type: String, trim: true }
    },
    dupatta: {
      included: { type: Boolean, default: true },
      fabric: { type: String, trim: true },
      length: { type: String, trim: true },
      description: { type: String, trim: true }
    },
    trouser: {
      included: { type: Boolean, default: true },
      fabric: { type: String, trim: true },
      length: { type: String, trim: true },
      description: { type: String, trim: true }
    }
  },

  availability: {
    status: {
      type: String,
      enum: ['in-stock', 'made-to-order', 'out-of-stock', 'discontinued'],
      default: 'made-to-order',
      index: true
    },
    expectedRestockDate: Date
  },

  inventory: InventorySchema,

  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature description too long']
  }],
  
  whatsIncluded: [{
    type: String,
    trim: true
  }],

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

  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    set: val => Math.round(val * 10) / 10
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

  seo: SEOSchema,

  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

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
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: Date,
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // ============ DRAFT & AI CONTENT ============
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },

  // AI-generated content storage
  aiGeneratedContent: {
    description: String,
    shortDescription: String,
    features: [String],
    whatsIncluded: [String],
    keywords: [String],
    focusKeyword: String,
    metaTitle: String,
    metaDescription: String,
    careInstructions: String,
    generatedAt: Date,
    appliedAt: Date,
    model: String, // AI model used
    isApplied: {
      type: Boolean,
      default: false
    }
  },

  // Track if content was AI-assisted
  contentSource: {
    type: String,
    enum: ['manual', 'ai-generated', 'ai-assisted', 'imported'],
    default: 'manual'
  },

  // Publishing workflow
  publishedAt: Date,
  scheduledPublishAt: Date,
  
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastEditedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============ INDEXES ============
ProductSchema.index({ category: 1, isActive: 1, isFeatured: -1 });
ProductSchema.index({ 'pricing.basePrice': 1, isActive: 1 });
ProductSchema.index({ occasion: 1, isActive: 1 });
ProductSchema.index({ 'fabric.type': 1, isActive: 1 });
ProductSchema.index({ productType: 1, 'availability.status': 1 });
ProductSchema.index({ isFeatured: -1, createdAt: -1 });
ProductSchema.index({ isNewArrival: -1, createdAt: -1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ purchased: -1 });
ProductSchema.index({ averageRating: -1, totalReviews: -1 });

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

// ============ VIRTUALS ============
ProductSchema.virtual('finalPrice').get(function() {
  const { basePrice, discount } = this.pricing;
  
  if (!discount || !discount.isActive) {
    return basePrice;
  }
  
  const now = new Date();
  if (discount.startDate && now < discount.startDate) {
    return basePrice;
  }
  if (discount.endDate && now > discount.endDate) {
    return basePrice;
  }
  
  if (discount.percentage > 0) {
    return basePrice - (basePrice * discount.percentage / 100);
  } else if (discount.amount > 0) {
    return Math.max(0, basePrice - discount.amount);
  }
  
  return basePrice;
});

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

ProductSchema.virtual('url').get(function() {
  return `/products/${this.slug}`;
});

ProductSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackInventory) return false;
  return this.inventory.stockQuantity <= this.inventory.lowStockThreshold;
});

// ============ PRE-SAVE HOOKS ============
// FIXED: Improved slug generation with better collision handling
ProductSchema.pre('save', async function(next) {
  if (this.isModified('title') || !this.slug) {
    let baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    if (this.designCode) {
      baseSlug = `${baseSlug}-${this.designCode.toLowerCase()}`;
    }

    let slug = baseSlug;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const existing = await mongoose.model('Product').findOne(
          { 
            slug, 
            _id: { $ne: this._id },
            isDeleted: false 
          }
        );
        
        if (!existing) {
          this.slug = slug;
          break;
        }
        
        attempts++;
        slug = `${baseSlug}-${attempts}`;
        
      } catch (error) {
        if (error.code === 11000 && attempts < maxAttempts) {
          attempts++;
          slug = `${baseSlug}-${attempts}`;
          continue;
        }
        throw error;
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique slug after maximum attempts');
    }
  }
  next();
});

// FIXED: Store category snapshot
ProductSchema.pre('save', async function(next) {
  if ((this.isModified('category') || this.isNew) && this.category) {
    try {
      const Category = mongoose.model('Category');
      const category = await Category.findById(this.category).select('name slug');
      
      if (category) {
        this.categorySnapshot = {
          name: category.name,
          slug: category.slug
        };
      }
    } catch (error) {
      console.error('Error storing category snapshot:', error);
    }
  }
  next();
});

ProductSchema.pre('save', function(next) {
  if (!this.primaryImage && this.images && this.images.length > 0) {
    this.primaryImage = this.images[0].url;
  }
  next();
});

ProductSchema.pre('save', function(next) {
  if (!this.thumbnailImage && this.primaryImage) {
    this.thumbnailImage = this.primaryImage;
  }
  next();
});

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

ProductSchema.pre('save', function(next) {
  if (this.isModified('description')) {
    this.description = this.description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  next();
});

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
ProductSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

ProductSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  return this.save({ validateBeforeSave: false });
};

ProductSchema.methods.incrementCartAdditions = async function() {
  this.addedToCart += 1;
  return this.save({ validateBeforeSave: false });
};

ProductSchema.methods.incrementPurchases = async function() {
  this.purchased += 1;
  return this.save({ validateBeforeSave: false });
};

ProductSchema.methods.updateRating = async function(newRating) {
  this.ratingDistribution[
    newRating === 5 ? 'five' :
    newRating === 4 ? 'four' :
    newRating === 3 ? 'three' :
    newRating === 2 ? 'two' : 'one'
  ] += 1;
  
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

ProductSchema.methods.isInStock = function() {
  if (this.availability.status === 'out-of-stock' || 
      this.availability.status === 'discontinued') {
    return false;
  }
  
  if (this.inventory.trackInventory) {
    return this.inventory.stockQuantity > 0;
  }
  
  return true;
};

ProductSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  this.isActive = false;
  return this.save({ validateBeforeSave: false });
};

ProductSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.isActive = true;
  return this.save({ validateBeforeSave: false });
};

// ============ STATIC METHODS ============
ProductSchema.statics.findActive = function(conditions = {}) {
  return this.find({
    ...conditions,
    isActive: true,
    isDeleted: false
  });
};

ProductSchema.statics.findFeatured = function(limit = 8) {
  return this.find({
    isFeatured: true,
    isActive: true,
    isDeleted: false
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

ProductSchema.statics.findNewArrivals = function(limit = 12) {
  return this.find({
    isNewArrival: true,
    isActive: true,
    isDeleted: false
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

ProductSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({
    isActive: true,
    isDeleted: false
  })
  .sort({ purchased: -1 })
  .limit(limit);
};

ProductSchema.statics.findByPriceRange = function(min, max) {
  return this.find({
    'pricing.basePrice': { $gte: min, $lte: max },
    isActive: true,
    isDeleted: false
  });
};

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

ProductSchema.statics.generateDesignCode = async function() {
  const year = new Date().getFullYear();
  const prefix = `LC-${year}-`;
  
  const lastProduct = await this.findOne({
    designCode: new RegExp(`^${prefix}`)
  })
  .sort({ designCode: -1 })
  .select('designCode');
  
  if (!lastProduct) {
    return `${prefix}001`;
  }
  
  const lastNumber = parseInt(lastProduct.designCode.split('-')[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};

// ============ POST HOOKS ============
ProductSchema.post('save', async function(doc) {
  if (doc.category) {
    try {
      const Category = mongoose.model('Category');
      await Category.updateProductCount(doc.category);
    } catch (error) {
      console.error('Error updating category product count:', error);
    }
  }
});

ProductSchema.post('remove', async function(doc) {
  if (doc.category) {
    try {
      const Category = mongoose.model('Category');
      await Category.updateProductCount(doc.category);
    } catch (error) {
      console.error('Error updating category product count:', error);
    }
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