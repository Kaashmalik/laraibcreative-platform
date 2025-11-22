const mongoose = require('mongoose');

// Draft order schema for save & resume functionality
const draftOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Unique token for resuming without login
  resumeToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  resumeTokenExpires: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  
  // Draft name/description
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Draft name cannot exceed 100 characters'],
    default: 'My Design'
  },
  
  // Custom order data (same structure as Order.customDetails)
  customDetails: {
    serviceType: {
      type: String,
      enum: ['fully-custom', 'brand-article-copy'],
      required: true
    },
    
    measurements: {
      shirtLength: Number,
      shoulderWidth: Number,
      sleeveLength: Number,
      armHole: Number,
      bust: Number,
      waist: Number,
      hip: Number,
      frontNeckDepth: Number,
      backNeckDepth: Number,
      wrist: Number,
      trouserLength: Number,
      trouserWaist: Number,
      trouserHip: Number,
      thigh: Number,
      bottom: Number,
      kneeLength: Number,
      dupattaLength: Number,
      dupattaWidth: Number,
      unit: { type: String, enum: ['inches', 'cm'], default: 'inches' },
      sizeLabel: String
    },
    
    // Reference to measurement profile if used
    measurementProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeasurementProfile'
    },
    
    referenceImages: [{
      url: {
        type: String,
        required: true
      },
      caption: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      publicId: String // Cloudinary public ID
    }],
    
    fabric: {
      providedBy: {
        type: String,
        enum: ['customer', 'laraibcreative'],
        required: true
      },
      type: String,
      color: String,
      quality: String,
      metersRequired: Number,
      fabricId: mongoose.Schema.Types.ObjectId // If selecting from inventory
    },
    
    style: {
      type: String,
      trim: true
    },
    
    color: String,
    
    specialInstructions: {
      type: String,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    },
    
    addOns: [{
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true,
        min: 0
      },
      description: String
    }],
    
    rushOrder: {
      type: Boolean,
      default: false
    },
    
    estimatedDays: {
      type: Number,
      default: 7
    }
  },
  
  // Calculated price breakdown (snapshot)
  priceBreakdown: {
    basePrice: { type: Number, default: 0 },
    fabricCost: { type: Number, default: 0 },
    embroideryCost: { type: Number, default: 0 },
    addOnsCost: { type: Number, default: 0 },
    rushOrderFee: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Current wizard step
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 6
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'abandoned', 'converted'],
    default: 'draft',
    index: true
  },
  
  // Converted to order
  convertedToOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  convertedAt: Date
}, {
  timestamps: true
});

// Indexes
draftOrderSchema.index({ userId: 1, status: 1, createdAt: -1 });
draftOrderSchema.index({ resumeToken: 1 });
draftOrderSchema.index({ createdAt: 1 }); // For abandoned cart cleanup

// Generate resume token
draftOrderSchema.methods.generateResumeToken = function() {
  const crypto = require('crypto');
  this.resumeToken = crypto.randomBytes(32).toString('hex');
  this.resumeTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  return this.resumeToken;
};

// Check if token is valid
draftOrderSchema.methods.isTokenValid = function() {
  return this.resumeTokenExpires && this.resumeTokenExpires > new Date();
};

// Static method to get user drafts
draftOrderSchema.statics.getUserDrafts = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['draft', 'abandoned'] }
  }).sort({ updatedAt: -1 });
};

// Static method to find by token
draftOrderSchema.statics.findByToken = function(token) {
  return this.findOne({ 
    resumeToken: token,
    resumeTokenExpires: { $gt: new Date() },
    status: { $in: ['draft', 'abandoned'] }
  });
};

const DraftOrder = mongoose.model('DraftOrder', draftOrderSchema);

module.exports = DraftOrder;

