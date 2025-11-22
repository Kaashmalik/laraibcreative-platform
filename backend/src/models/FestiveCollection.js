const mongoose = require('mongoose');

/**
 * Festive Collection Model
 * Auto-publish collections for Eid, Winter, etc.
 */

const festiveCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['eid', 'winter', 'summer', 'wedding-season', 'new-year', 'custom'],
    required: true,
    index: true
  },
  
  // Auto-publish dates
  publishDate: {
    type: Date,
    required: true,
    index: true
  },
  
  unpublishDate: {
    type: Date,
    required: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'unpublished', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Products in collection
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Collection details
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  bannerImage: {
    url: String,
    publicId: String
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Email campaign
  emailCampaign: {
    enabled: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    template: String
  },
  
  // Social media
  socialMedia: {
    instagram: {
      enabled: Boolean,
      postedAt: Date
    },
    facebook: {
      enabled: Boolean,
      postedAt: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
festiveCollectionSchema.index({ publishDate: 1, status: 1 });
festiveCollectionSchema.index({ type: 1, status: 1 });

// Pre-save: Auto-update status based on dates
festiveCollectionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'draft') {
    // Check if it's time to publish
    if (this.publishDate <= now && this.unpublishDate > now) {
      this.status = 'published';
    } else if (this.publishDate > now) {
      this.status = 'scheduled';
    }
  } else if (this.status === 'published' || this.status === 'scheduled') {
    // Check if it's time to unpublish
    if (this.unpublishDate <= now) {
      this.status = 'unpublished';
    } else if (this.publishDate <= now && this.unpublishDate > now) {
      this.status = 'published';
    }
  }
  
  next();
});

// Static method: Get active collections
festiveCollectionSchema.statics.getActive = function() {
  const now = new Date();
  return this.find({
    status: 'published',
    publishDate: { $lte: now },
    unpublishDate: { $gt: now }
  }).populate('products');
};

// Static method: Get scheduled collections
festiveCollectionSchema.statics.getScheduled = function() {
  const now = new Date();
  return this.find({
    status: 'scheduled',
    publishDate: { $gt: now }
  });
};

const FestiveCollection = mongoose.model('FestiveCollection', festiveCollectionSchema);

module.exports = FestiveCollection;

