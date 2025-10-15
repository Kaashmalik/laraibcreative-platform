const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Review Schema for LaraibCreative E-Commerce Platform
 * 
 * Handles customer reviews for products with image support and moderation.
 * Supports verified purchase badges and helpfulness voting.
 * 
 * Key Features:
 * - Star rating system (1-5)
 * - Multiple review images
 * - Verified purchase badge
 * - Helpfulness voting
 * - Admin moderation (pending/approved/rejected)
 * - Automatic product rating updates
 * 
 * Related Models:
 * - Product: The reviewed product
 * - User (Customer): Review author
 * - Order: Verified purchase reference
 */

const reviewSchema = new Schema(
  {
    // ============================================================
    // RELATIONSHIPS
    // ============================================================
    
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
      validate: {
        validator: async function(productId) {
          const Product = mongoose.model('Product');
          const product = await Product.findById(productId);
          return !!product;
        },
        message: 'Referenced product does not exist'
      }
    },

    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true,
      validate: {
        validator: async function(customerId) {
          const User = mongoose.model('User');
          const user = await User.findById(customerId);
          return user && user.role === 'customer';
        },
        message: 'Referenced customer does not exist or is not a customer'
      }
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
      // Optional: Only required if isVerifiedPurchase is true
      validate: {
        validator: function(orderId) {
          // If this is a verified purchase, order must be provided
          if (this.isVerifiedPurchase && !orderId) {
            return false;
          }
          return true;
        },
        message: 'Order reference required for verified purchases'
      }
    },

    // ============================================================
    // RATING & REVIEW CONTENT
    // ============================================================
    
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number'
      },
      index: true
    },

    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
      // Sanitize HTML and special characters
      set: function(title) {
        return title.replace(/<[^>]*>/g, '').trim();
      }
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      // Sanitize HTML
      set: function(comment) {
        return comment.replace(/<[^>]*>/g, '').trim();
      }
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(images) {
          // Max 5 images per review
          return images.length <= 5;
        },
        message: 'Maximum 5 images allowed per review'
      },
      // Validate each image URL
      validate: {
        validator: function(images) {
          const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif)$/i;
          return images.every(url => urlPattern.test(url));
        },
        message: 'Invalid image URL format'
      }
    },

    // ============================================================
    // VERIFICATION & TRUST
    // ============================================================
    
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
      // Automatically set based on order existence
      validate: {
        validator: function(isVerified) {
          if (isVerified && !this.order) {
            return false;
          }
          return true;
        },
        message: 'Cannot mark as verified purchase without order reference'
      }
    },

    // ============================================================
    // MODERATION & STATUS
    // ============================================================
    
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be: pending, approved, or rejected'
      },
      default: 'pending',
      index: true,
      lowercase: true,
      trim: true
    },

    moderationNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Moderation note cannot exceed 500 characters'],
      // Only visible to admins, stores reason for rejection
      select: false, // Don't include in queries by default
      default: null
    },

    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // Admin who approved/rejected
      validate: {
        validator: async function(adminId) {
          if (!adminId) return true;
          const User = mongoose.model('User');
          const admin = await User.findById(adminId);
          return admin && (admin.role === 'admin' || admin.role === 'superadmin');
        },
        message: 'Moderator must be an admin user'
      }
    },

    moderatedAt: {
      type: Date,
      default: null,
      index: true
    },

    // ============================================================
    // HELPFULNESS VOTING
    // ============================================================
    
    helpfulCount: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
      index: true // For sorting by helpful reviews
    },

    // Track users who marked this review as helpful
    helpfulBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      select: false, // Don't include in queries by default
      validate: {
        validator: function(users) {
          // Prevent duplicate votes
          return users.length === new Set(users.map(id => id.toString())).size;
        },
        message: 'Duplicate helpful votes detected'
      }
    },

    // ============================================================
    // ADMIN FLAGS
    // ============================================================
    
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
      // Featured reviews appear prominently on product page
    },

    isReported: {
      type: Boolean,
      default: false,
      index: true,
      // Flag for reviews reported by other users
    },

    reportCount: {
      type: Number,
      default: 0,
      min: [0, 'Report count cannot be negative']
    },

    reportReasons: {
      type: [String],
      default: [],
      select: false,
      // Store reasons why users reported this review
    },

    // ============================================================
    // METADATA
    // ============================================================
    
    isEdited: {
      type: Boolean,
      default: false
    },

    editedAt: {
      type: Date,
      default: null
    },

    // Store customer name at review time (in case user deletes account)
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Customer name too long']
    },

    // IP address for fraud detection (hashed for privacy)
    ipAddressHash: {
      type: String,
      select: false, // Privacy: don't include by default
      index: true
    },

    // User agent for device info
    userAgent: {
      type: String,
      select: false
    }

  },
  {
    // ============================================================
    // SCHEMA OPTIONS
    // ============================================================
    
    timestamps: true, // Adds createdAt and updatedAt
    
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.ipAddressHash;
        delete ret.userAgent;
        delete ret.helpfulBy;
        delete ret.reportReasons;
        delete ret.moderationNote;
        delete ret.__v;
        return ret;
      }
    },
    
    toObject: { virtuals: true }
  }
);

// ============================================================
// INDEXES FOR PERFORMANCE
// ============================================================

// Compound index: Get all approved reviews for a product, sorted by date
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

// Compound index: Get verified purchase reviews for a product
reviewSchema.index({ product: 1, isVerifiedPurchase: 1, status: 1 });

// Compound index: Customer's reviews across all products
reviewSchema.index({ customer: 1, createdAt: -1 });

// Index for moderation queue (pending reviews)
reviewSchema.index({ status: 1, createdAt: -1 });

// Index for featured reviews
reviewSchema.index({ isFeatured: 1, status: 1 });

// Index for reported reviews (admin moderation)
reviewSchema.index({ isReported: 1, reportCount: -1 });

// Index for helpful reviews (sorting)
reviewSchema.index({ helpfulCount: -1, status: 1 });

// Unique constraint: One review per customer per product
reviewSchema.index({ customer: 1, product: 1 }, { unique: true });

// Text search index for review content
reviewSchema.index({ title: 'text', comment: 'text' });

// ============================================================
// VIRTUAL FIELDS
// ============================================================

// Virtual: Review age in days
reviewSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual: Is this review recent? (within 7 days)
reviewSchema.virtual('isRecent').get(function() {
  return this.ageInDays <= 7;
});

// Virtual: Helpfulness ratio (for sorting)
reviewSchema.virtual('helpfulnessRatio').get(function() {
  // If no votes yet, return 0
  if (this.helpfulCount === 0) return 0;
  // Simple ratio (can be enhanced with total votes)
  return this.helpfulCount;
});

// Virtual: Review quality score (for ranking)
reviewSchema.virtual('qualityScore').get(function() {
  let score = 0;
  
  // Base points from rating
  score += this.rating * 10;
  
  // Bonus for verified purchase
  if (this.isVerifiedPurchase) score += 20;
  
  // Bonus for detailed review
  if (this.comment.length > 200) score += 15;
  
  // Bonus for images
  score += this.images.length * 5;
  
  // Bonus for helpful votes
  score += this.helpfulCount * 2;
  
  // Penalty for being reported
  score -= this.reportCount * 10;
  
  return Math.max(0, score);
});

// ============================================================
// INSTANCE METHODS
// ============================================================

/**
 * Mark review as helpful by a user
 * @param {ObjectId} userId - ID of user marking as helpful
 * @returns {Promise<Review>}
 */
reviewSchema.methods.markAsHelpful = async function(userId) {
  // Check if user already marked as helpful
  const hasVoted = this.helpfulBy.some(id => id.toString() === userId.toString());
  
  if (hasVoted) {
    throw new Error('You have already marked this review as helpful');
  }
  
  this.helpfulBy.push(userId);
  this.helpfulCount += 1;
  
  return this.save();
};

/**
 * Unmark review as helpful by a user
 * @param {ObjectId} userId - ID of user removing helpful mark
 * @returns {Promise<Review>}
 */
reviewSchema.methods.unmarkAsHelpful = async function(userId) {
  const index = this.helpfulBy.findIndex(id => id.toString() === userId.toString());
  
  if (index === -1) {
    throw new Error('You have not marked this review as helpful');
  }
  
  this.helpfulBy.splice(index, 1);
  this.helpfulCount = Math.max(0, this.helpfulCount - 1);
  
  return this.save();
};

/**
 * Report review for inappropriate content
 * @param {String} reason - Reason for reporting
 * @returns {Promise<Review>}
 */
reviewSchema.methods.report = async function(reason) {
  this.isReported = true;
  this.reportCount += 1;
  
  if (reason) {
    this.reportReasons.push({
      reason: reason,
      reportedAt: new Date()
    });
  }
  
  // Auto-reject if reported more than 5 times
  if (this.reportCount >= 5) {
    this.status = 'rejected';
    this.moderationNote = 'Auto-rejected: Multiple reports';
  }
  
  return this.save();
};

/**
 * Approve review (Admin action)
 * @param {ObjectId} adminId - ID of admin approving
 * @returns {Promise<Review>}
 */
reviewSchema.methods.approve = async function(adminId) {
  this.status = 'approved';
  this.moderatedBy = adminId;
  this.moderatedAt = new Date();
  
  await this.save();
  
  // Update product aggregate rating
  await this.updateProductRating();
  
  return this;
};

/**
 * Reject review (Admin action)
 * @param {ObjectId} adminId - ID of admin rejecting
 * @param {String} reason - Reason for rejection
 * @returns {Promise<Review>}
 */
reviewSchema.methods.reject = async function(adminId, reason) {
  this.status = 'rejected';
  this.moderatedBy = adminId;
  this.moderatedAt = new Date();
  this.moderationNote = reason || 'Rejected by admin';
  
  await this.save();
  
  // Update product aggregate rating
  await this.updateProductRating();
  
  return this;
};

/**
 * Update product's aggregate rating
 * @returns {Promise<void>}
 */
reviewSchema.methods.updateProductRating = async function() {
  const Product = mongoose.model('Product');
  
  // Calculate aggregate rating for the product
  const stats = await this.constructor.aggregate([
    {
      $match: {
        product: this.product,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'aggregateRating.ratingValue': stats[0].averageRating.toFixed(1),
      'aggregateRating.reviewCount': stats[0].reviewCount
    });
  } else {
    // No approved reviews, reset rating
    await Product.findByIdAndUpdate(this.product, {
      'aggregateRating.ratingValue': 0,
      'aggregateRating.reviewCount': 0
    });
  }
};

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Get reviews for a product with pagination
 * @param {ObjectId} productId - Product ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
reviewSchema.statics.getProductReviews = async function(productId, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    rating = null,
    verified = null
  } = options;
  
  const query = {
    product: productId,
    status: 'approved'
  };
  
  // Filter by rating if specified
  if (rating) {
    query.rating = parseInt(rating);
  }
  
  // Filter by verified purchase if specified
  if (verified !== null) {
    query.isVerifiedPurchase = verified === 'true' || verified === true;
  }
  
  const skip = (page - 1) * limit;
  
  // Determine sort field
  let sort = {};
  if (sortBy === 'helpful') {
    sort = { helpfulCount: sortOrder === 'asc' ? 1 : -1 };
  } else if (sortBy === 'rating') {
    sort = { rating: sortOrder === 'asc' ? 1 : -1 };
  } else {
    sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };
  }
  
  const [reviews, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customer', 'fullName profileImage')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    reviews,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

/**
 * Get rating distribution for a product
 * @param {ObjectId} productId - Product ID
 * @returns {Promise<Object>}
 */
reviewSchema.statics.getRatingDistribution = async function(productId) {
  const distribution = await this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  // Format as object: { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(item => {
    result[item._id] = item.count;
  });
  
  return result;
};

/**
 * Check if customer can review a product
 * @param {ObjectId} customerId - Customer ID
 * @param {ObjectId} productId - Product ID
 * @returns {Promise<Object>}
 */
reviewSchema.statics.canReview = async function(customerId, productId) {
  // Check if already reviewed
  const existingReview = await this.findOne({
    customer: customerId,
    product: productId
  });
  
  if (existingReview) {
    return {
      canReview: false,
      reason: 'You have already reviewed this product'
    };
  }
  
  // Check if customer has purchased this product
  const Order = mongoose.model('Order');
  const purchase = await Order.findOne({
    customer: customerId,
    'items.product': productId,
    status: 'completed'
  });
  
  return {
    canReview: true,
    isVerifiedPurchase: !!purchase,
    orderId: purchase ? purchase._id : null
  };
};

/**
 * Get pending reviews for moderation
 * @param {Number} limit - Number of reviews to fetch
 * @returns {Promise<Array>}
 */
reviewSchema.statics.getPendingReviews = async function(limit = 50) {
  return this.find({ status: 'pending' })
    .sort({ createdAt: 1 }) // Oldest first
    .limit(limit)
    .populate('customer', 'fullName email')
    .populate('product', 'title sku images')
    .lean();
};

/**
 * Get reported reviews for admin review
 * @returns {Promise<Array>}
 */
reviewSchema.statics.getReportedReviews = async function() {
  return this.find({ isReported: true })
    .sort({ reportCount: -1 })
    .populate('customer', 'fullName email')
    .populate('product', 'title sku')
    .select('+reportReasons')
    .lean();
};

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

/**
 * Pre-save hook: Set customer name and verify purchase status
 */
reviewSchema.pre('save', async function(next) {
  // If this is a new review
  if (this.isNew) {
    // Fetch and store customer name
    if (!this.customerName) {
      const User = mongoose.model('User');
      const customer = await User.findById(this.customer).select('fullName');
      if (customer) {
        this.customerName = customer.fullName;
      }
    }
    
    // Auto-set verified purchase if order is provided
    if (this.order && !this.isVerifiedPurchase) {
      const Order = mongoose.model('Order');
      const order = await Order.findOne({
        _id: this.order,
        customer: this.customer,
        status: 'completed'
      });
      
      if (order) {
        // Check if product is in this order
        const hasProduct = order.items.some(
          item => item.product.toString() === this.product.toString()
        );
        
        if (hasProduct) {
          this.isVerifiedPurchase = true;
        }
      }
    }
  }
  
  // Track if review was edited
  if (!this.isNew && (this.isModified('title') || this.isModified('comment'))) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

/**
 * Post-save hook: Update product rating after review is saved
 */
reviewSchema.post('save', async function(doc) {
  // Only update if status is approved or rejected (affects rating)
  if (doc.status === 'approved' || doc.status === 'rejected') {
    await doc.updateProductRating();
  }
});

/**
 * Post-remove hook: Update product rating after review is deleted
 */
reviewSchema.post('remove', async function(doc) {
  await doc.updateProductRating();
});

/**
 * Pre-remove hook: Clean up associated data
 */
reviewSchema.pre('remove', async function(next) {
  // Future: Remove review images from storage
  // if (this.images.length > 0) {
  //   await deleteImagesFromCloudinary(this.images);
  // }
  
  next();
});

// ============================================================
// QUERY HELPERS
// ============================================================

/**
 * Query helper: Get only approved reviews
 */
reviewSchema.query.approved = function() {
  return this.where({ status: 'approved' });
};

/**
 * Query helper: Get only verified purchase reviews
 */
reviewSchema.query.verified = function() {
  return this.where({ isVerifiedPurchase: true });
};

/**
 * Query helper: Get featured reviews
 */
reviewSchema.query.featured = function() {
  return this.where({ isFeatured: true, status: 'approved' });
};

/**
 * Query helper: Get reviews with images
 */
reviewSchema.query.withImages = function() {
  return this.where('images.0').exists(true);
};

/**
 * Query helper: Sort by helpfulness
 */
reviewSchema.query.byHelpfulness = function() {
  return this.sort({ helpfulCount: -1, createdAt: -1 });
};

// ============================================================
// SECURITY & DATA SANITIZATION
// ============================================================

/**
 * Sanitize review content before saving
 */
reviewSchema.pre('validate', function(next) {
  // Remove any potential XSS attempts
  if (this.title) {
    this.title = this.title.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  if (this.comment) {
    this.comment = this.comment.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  next();
});

// ============================================================
// MODEL EXPORT
// ============================================================

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;