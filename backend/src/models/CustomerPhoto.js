const mongoose = require('mongoose');

// Customer photo schema for UGC gallery
const customerPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    index: true
  },
  
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true
  },
  
  // Photo URLs
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // Cloudinary public ID
    thumbnailUrl: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Customer details (snapshot at time of upload)
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Review/Testimonial
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
      trim: true
    },
    verifiedPurchase: {
      type: Boolean,
      default: true
    }
  },
  
  // Moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderatedAt: Date,
  
  moderationNotes: String,
  
  // Consent
  consentGiven: {
    type: Boolean,
    required: true,
    default: false
  },
  
  consentDate: {
    type: Date,
    default: Date.now
  },
  
  // Display settings
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Engagement metrics
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  views: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
customerPhotoSchema.index({ productId: 1, moderationStatus: 1, isPublic: 1 });
customerPhotoSchema.index({ isFeatured: 1, moderationStatus: 1 });
customerPhotoSchema.index({ createdAt: -1 });

// Static method to get approved photos for product
customerPhotoSchema.statics.getProductPhotos = function(productId, limit = 20) {
  return this.find({
    productId,
    moderationStatus: 'approved',
    isPublic: true
  })
  .populate('userId', 'fullName profileImage')
  .sort({ isFeatured: -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get featured photos
customerPhotoSchema.statics.getFeaturedPhotos = function(limit = 12) {
  return this.find({
    moderationStatus: 'approved',
    isPublic: true,
    isFeatured: true
  })
  .populate('userId', 'fullName profileImage')
  .populate('productId', 'title slug primaryImage')
  .sort({ createdAt: -1 })
  .limit(limit);
};

const CustomerPhoto = mongoose.model('CustomerPhoto', customerPhotoSchema);

module.exports = CustomerPhoto;

