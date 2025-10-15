/**
 * Measurement Model
 * Stores customer body measurements for custom stitching orders
 * Supports both standard size charts and custom measurements
 * 
 * Relations:
 * - Belongs to User (customer)
 * - Can be referenced by Orders for custom stitching
 * 
 * Security:
 * - User can only access their own measurements
 * - Measurements validated before saving
 * - Audit trail maintained
 */

const mongoose = require('mongoose');

// Standard size chart reference (read-only)
const SIZE_CHART = {
  XS: {
    shoulder: 13.5,
    bust: 18,
    waist: 17.5,
    hip: 19,
    armhole: 8.5,
    wrist: 10,
    sleeveLength: 21,
    normalShirtLength: 37,
    capeLength: 35,
    shirtWithShalwarLength: 32,
    mGirlShirtLength: 34,
    trouserLength: 38,
    trouserWaist: 29,
    shalwarLength: 40
  },
  S: {
    shoulder: 14,
    bust: 19,
    waist: 18.5,
    hip: 20.5,
    armhole: 9,
    wrist: 11,
    sleeveLength: 21.5,
    normalShirtLength: 38,
    capeLength: 36,
    shirtWithShalwarLength: 33,
    mGirlShirtLength: 35,
    trouserLength: 39,
    trouserWaist: 30,
    shalwarLength: 41
  },
  M: {
    shoulder: 14.5,
    bust: 20.5,
    waist: 20,
    hip: 22,
    armhole: 9.75,
    wrist: 12,
    sleeveLength: 22,
    normalShirtLength: 40,
    capeLength: 38,
    shirtWithShalwarLength: 36,
    mGirlShirtLength: 36,
    trouserLength: 40,
    trouserWaist: 32,
    shalwarLength: 42
  },
  L: {
    shoulder: 15,
    bust: 22.5,
    waist: 22,
    hip: 24.5,
    armhole: 11,
    wrist: 13,
    sleeveLength: 22.5,
    normalShirtLength: 40,
    capeLength: 39,
    shirtWithShalwarLength: 36,
    mGirlShirtLength: 38,
    trouserLength: 41,
    trouserWaist: 34,
    shalwarLength: 43
  },
  XL: {
    shoulder: 16,
    bust: 24.5,
    waist: 24,
    hip: 26.5,
    armhole: 11.75,
    wrist: 14,
    sleeveLength: 23,
    normalShirtLength: 41,
    capeLength: 40,
    shirtWithShalwarLength: 37,
    mGirlShirtLength: 39,
    trouserLength: 42,
    trouserWaist: 35,
    shalwarLength: 44
  }
};

// Sub-schema for measurement details
const MeasurementDetailsSchema = new mongoose.Schema({
  // Upper Body Measurements (in inches)
  shoulder: {
    type: Number,
    min: [10, 'Shoulder width must be at least 10 inches'],
    max: [25, 'Shoulder width cannot exceed 25 inches'],
    required: [true, 'Shoulder measurement is required']
  },
  bust: {
    type: Number,
    alias: 'chest',
    min: [15, 'Bust measurement must be at least 15 inches'],
    max: [50, 'Bust measurement cannot exceed 50 inches'],
    required: [true, 'Bust measurement is required']
  },
  waist: {
    type: Number,
    min: [15, 'Waist measurement must be at least 15 inches'],
    max: [50, 'Waist measurement cannot exceed 50 inches'],
    required: [true, 'Waist measurement is required']
  },
  hip: {
    type: Number,
    min: [15, 'Hip measurement must be at least 15 inches'],
    max: [55, 'Hip measurement cannot exceed 55 inches'],
    required: [true, 'Hip measurement is required']
  },
  armhole: {
    type: Number,
    min: [7, 'Armhole must be at least 7 inches'],
    max: [18, 'Armhole cannot exceed 18 inches'],
    required: [true, 'Armhole measurement is required']
  },
  wrist: {
    type: Number,
    alias: 'wristCircumference',
    min: [6, 'Wrist must be at least 6 inches'],
    max: [18, 'Wrist cannot exceed 18 inches'],
    required: [true, 'Wrist measurement is required']
  },
  sleeveLength: {
    type: Number,
    min: [15, 'Sleeve length must be at least 15 inches'],
    max: [30, 'Sleeve length cannot exceed 30 inches'],
    required: [true, 'Sleeve length is required']
  },
  
  // Neck Measurements
  frontNeckDepth: {
    type: Number,
    min: [5, 'Front neck depth must be at least 5 inches'],
    max: [15, 'Front neck depth cannot exceed 15 inches'],
    default: 8
  },
  backNeckDepth: {
    type: Number,
    min: [1, 'Back neck depth must be at least 1 inch'],
    max: [8, 'Back neck depth cannot exceed 8 inches'],
    default: 2
  },
  
  // Shirt Length Options (customer chooses based on style)
  shirtLength: {
    type: Number,
    min: [25, 'Shirt length must be at least 25 inches'],
    max: [55, 'Shirt length cannot exceed 55 inches'],
    required: [true, 'Shirt length is required']
  },
  shirtStyle: {
    type: String,
    enum: {
      values: ['normal', 'cape', 'withShalwar', 'mGirl', 'custom'],
      message: '{VALUE} is not a valid shirt style'
    },
    default: 'normal'
  },
  
  // Lower Body Measurements
  trouserLength: {
    type: Number,
    min: [30, 'Trouser length must be at least 30 inches'],
    max: [50, 'Trouser length cannot exceed 50 inches']
  },
  trouserWaist: {
    type: Number,
    min: [20, 'Trouser waist must be at least 20 inches'],
    max: [50, 'Trouser waist cannot exceed 50 inches']
  },
  trouserHip: {
    type: Number,
    min: [25, 'Trouser hip must be at least 25 inches'],
    max: [60, 'Trouser hip cannot exceed 60 inches']
  },
  thigh: {
    type: Number,
    min: [15, 'Thigh measurement must be at least 15 inches'],
    max: [40, 'Thigh measurement cannot exceed 40 inches']
  },
  bottom: {
    type: Number,
    alias: 'pajamaBottom',
    min: [10, 'Bottom measurement must be at least 10 inches'],
    max: [30, 'Bottom measurement cannot exceed 30 inches']
  },
  kneeLength: {
    type: Number,
    min: [15, 'Knee length must be at least 15 inches'],
    max: [30, 'Knee length cannot exceed 30 inches']
  },
  
  // Shalwar Measurements
  shalwarLength: {
    type: Number,
    min: [35, 'Shalwar length must be at least 35 inches'],
    max: [50, 'Shalwar length cannot exceed 50 inches']
  },
  shalwarWaist: {
    type: Number,
    min: [20, 'Shalwar waist must be at least 20 inches'],
    max: [50, 'Shalwar waist cannot exceed 50 inches']
  },
  
  // Dupatta Measurements
  dupattaLength: {
    type: Number,
    min: [80, 'Dupatta length must be at least 80 inches'],
    max: [120, 'Dupatta length cannot exceed 120 inches']
  },
  dupattaWidth: {
    type: Number,
    min: [30, 'Dupatta width must be at least 30 inches'],
    max: [50, 'Dupatta width cannot exceed 50 inches']
  }
}, { _id: false });

// Main Measurement Schema
const MeasurementSchema = new mongoose.Schema({
  // Reference to the user who owns these measurements
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true // Index for fast user-based queries
  },
  
  // Label to identify this measurement set
  label: {
    type: String,
    required: [true, 'Measurement label is required'],
    trim: true,
    maxlength: [50, 'Label cannot exceed 50 characters'],
    default: 'My Measurements'
  },
  
  // Measurement type: standard size or custom
  measurementType: {
    type: String,
    enum: {
      values: ['standard', 'custom'],
      message: '{VALUE} is not a valid measurement type'
    },
    required: true,
    default: 'custom'
  },
  
  // If standard size is selected
  standardSize: {
    type: String,
    enum: {
      values: ['XS', 'S', 'M', 'L', 'XL', null],
      message: '{VALUE} is not a valid standard size'
    },
    default: null
  },
  
  // Actual measurements (required for custom, auto-filled for standard)
  measurements: {
    type: MeasurementDetailsSchema,
    required: [true, 'Measurement details are required']
  },
  
  // Unit of measurement (locked to inches for consistency)
  unit: {
    type: String,
    enum: ['inches'],
    default: 'inches',
    immutable: true
  },
  
  // Optional measurement reference image
  measurementImage: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  },
  
  // Special notes or preferences for tailor
  tailorNotes: {
    type: String,
    maxlength: [500, 'Tailor notes cannot exceed 500 characters'],
    trim: true
  },
  
  // Body type for better recommendations
  bodyType: {
    type: String,
    enum: {
      values: ['petite', 'regular', 'plus', 'tall', null],
      message: '{VALUE} is not a valid body type'
    },
    default: null
  },
  
  // Is this the default measurement set for quick orders
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  
  // Measurement verification status
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  
  // Soft delete support
  isDeleted: {
    type: Boolean,
    default: false,
    select: false, // Don't include in normal queries
    index: true
  },
  deletedAt: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================

// Compound index for querying user's active measurements
MeasurementSchema.index({ user: 1, isDeleted: 1, isDefault: -1 });

// Index for finding default measurements quickly
MeasurementSchema.index({ user: 1, isDefault: 1 });

// Text search index for labels
MeasurementSchema.index({ label: 'text', tailorNotes: 'text' });

// ==================== VIRTUALS ====================

// Full name virtual (user's name + label)
MeasurementSchema.virtual('displayName').get(function() {
  return `${this.label}`;
});

// Check if measurements are complete
MeasurementSchema.virtual('isComplete').get(function() {
  const required = ['shoulder', 'bust', 'waist', 'hip', 'armhole', 'wrist', 'sleeveLength', 'shirtLength'];
  return required.every(field => this.measurements[field] && this.measurements[field] > 0);
});

// Calculate measurement completeness percentage
MeasurementSchema.virtual('completenessPercentage').get(function() {
  const allFields = Object.keys(MeasurementDetailsSchema.obj);
  const filledFields = allFields.filter(field => 
    this.measurements[field] && this.measurements[field] > 0
  );
  return Math.round((filledFields.length / allFields.length) * 100);
});

// Check if measurements need update (older than 6 months)
MeasurementSchema.virtual('needsUpdate').get(function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return this.updatedAt < sixMonthsAgo;
});

// ==================== PRE-SAVE HOOKS ====================

// Auto-fill measurements from standard size chart
MeasurementSchema.pre('save', function(next) {
  // If standard size is selected, auto-fill measurements
  if (this.measurementType === 'standard' && this.standardSize && SIZE_CHART[this.standardSize]) {
    const sizeData = SIZE_CHART[this.standardSize];
    
    // Map size chart data to measurement fields
    this.measurements = {
      shoulder: sizeData.shoulder,
      bust: sizeData.bust,
      waist: sizeData.waist,
      hip: sizeData.hip,
      armhole: sizeData.armhole,
      wrist: sizeData.wrist,
      sleeveLength: sizeData.sleeveLength,
      frontNeckDepth: this.measurements.frontNeckDepth || 8,
      backNeckDepth: this.measurements.backNeckDepth || 2,
      shirtLength: sizeData.normalShirtLength,
      shirtStyle: 'normal',
      trouserLength: sizeData.trouserLength,
      trouserWaist: sizeData.trouserWaist,
      shalwarLength: sizeData.shalwarLength
    };
  }
  
  next();
});

// Ensure only one default measurement per user
MeasurementSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other measurements of this user
    await this.constructor.updateMany(
      { 
        user: this.user, 
        _id: { $ne: this._id },
        isDeleted: false
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Sanitize input data
MeasurementSchema.pre('save', function(next) {
  // Trim string fields
  if (this.label) this.label = this.label.trim();
  if (this.tailorNotes) this.tailorNotes = this.tailorNotes.trim();
  
  // Round measurements to 2 decimal places
  const measurementFields = Object.keys(this.measurements.toObject());
  measurementFields.forEach(field => {
    if (typeof this.measurements[field] === 'number') {
      this.measurements[field] = Math.round(this.measurements[field] * 100) / 100;
    }
  });
  
  next();
});

// Update lastUsedAt when measurements are used
MeasurementSchema.pre('save', function(next) {
  if (this.isModified('usageCount')) {
    this.lastUsedAt = new Date();
  }
  next();
});

// ==================== INSTANCE METHODS ====================

// Mark measurement as used (called when used in an order)
MeasurementSchema.methods.markAsUsed = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

// Set as default measurement
MeasurementSchema.methods.setAsDefault = async function() {
  // Remove default from others
  await this.constructor.updateMany(
    { 
      user: this.user, 
      _id: { $ne: this._id },
      isDeleted: false
    },
    { $set: { isDefault: false } }
  );
  
  this.isDefault = true;
  return this.save();
};

// Soft delete
MeasurementSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.isDefault = false; // Remove default flag if set
  return this.save();
};

// Restore soft-deleted measurement
MeasurementSchema.methods.restore = async function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Verify measurements (admin action)
MeasurementSchema.methods.verify = async function(adminId) {
  this.isVerified = true;
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  return this.save();
};

// Create a copy of measurements with new label
MeasurementSchema.methods.duplicate = async function(newLabel) {
  const duplicate = new this.constructor({
    user: this.user,
    label: newLabel || `${this.label} (Copy)`,
    measurementType: this.measurementType,
    standardSize: this.standardSize,
    measurements: this.measurements.toObject(),
    tailorNotes: this.tailorNotes,
    bodyType: this.bodyType
  });
  
  return duplicate.save();
};

// Get measurement comparison with standard size
MeasurementSchema.methods.compareWithStandardSize = function(size) {
  if (!SIZE_CHART[size]) {
    throw new Error('Invalid standard size');
  }
  
  const sizeData = SIZE_CHART[size];
  const comparison = {};
  
  Object.keys(sizeData).forEach(key => {
    const measurementKey = key === 'chest' ? 'bust' : key;
    if (this.measurements[measurementKey]) {
      comparison[key] = {
        standard: sizeData[key],
        custom: this.measurements[measurementKey],
        difference: Math.abs(this.measurements[measurementKey] - sizeData[key])
      };
    }
  });
  
  return comparison;
};

// Suggest best fitting standard size
MeasurementSchema.methods.suggestStandardSize = function() {
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  let bestMatch = null;
  let lowestDifference = Infinity;
  
  sizes.forEach(size => {
    const sizeData = SIZE_CHART[size];
    const keyMeasurements = ['bust', 'waist', 'hip'];
    
    let totalDifference = 0;
    keyMeasurements.forEach(key => {
      if (this.measurements[key]) {
        totalDifference += Math.abs(this.measurements[key] - sizeData[key]);
      }
    });
    
    if (totalDifference < lowestDifference) {
      lowestDifference = totalDifference;
      bestMatch = size;
    }
  });
  
  return {
    suggestedSize: bestMatch,
    confidence: lowestDifference < 5 ? 'high' : lowestDifference < 10 ? 'medium' : 'low',
    averageDifference: (lowestDifference / 3).toFixed(2)
  };
};

// ==================== STATIC METHODS ====================

// Get user's default measurements
MeasurementSchema.statics.getDefaultForUser = async function(userId) {
  return this.findOne({ 
    user: userId, 
    isDefault: true,
    isDeleted: false 
  });
};

// Get all measurements for a user (excluding deleted)
MeasurementSchema.statics.getAllForUser = async function(userId, includeDeleted = false) {
  const query = { user: userId };
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  return this.find(query)
    .sort({ isDefault: -1, updatedAt: -1 })
    .select('-__v');
};

// Get standard size chart
MeasurementSchema.statics.getSizeChart = function() {
  return SIZE_CHART;
};

// Find measurements similar to given measurements (for recommendations)
MeasurementSchema.statics.findSimilar = async function(measurements, limit = 5) {
  // This is a simplified similarity search
  // In production, consider using MongoDB aggregation or specialized search
  const allMeasurements = await this.find({ isDeleted: false });
  
  const scored = allMeasurements.map(m => {
    let score = 0;
    ['bust', 'waist', 'hip'].forEach(key => {
      if (m.measurements[key] && measurements[key]) {
        score += Math.abs(m.measurements[key] - measurements[key]);
      }
    });
    return { measurement: m, score };
  });
  
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(s => s.measurement);
};

// Bulk verify measurements
MeasurementSchema.statics.bulkVerify = async function(measurementIds, adminId) {
  return this.updateMany(
    { _id: { $in: measurementIds }, isDeleted: false },
    {
      $set: {
        isVerified: true,
        verifiedBy: adminId,
        verifiedAt: new Date()
      }
    }
  );
};

// Get measurement statistics for admin dashboard
MeasurementSchema.statics.getStats = async function() {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalMeasurements: { $sum: 1 },
        verifiedCount: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        standardSizeCount: {
          $sum: { $cond: [{ $eq: ['$measurementType', 'standard'] }, 1, 0] }
        },
        customCount: {
          $sum: { $cond: [{ $eq: ['$measurementType', 'custom'] }, 1, 0] }
        },
        avgUsageCount: { $avg: '$usageCount' }
      }
    }
  ]);
};

// ==================== QUERY HELPERS ====================

// Query helper to exclude deleted measurements
MeasurementSchema.query.active = function() {
  return this.where({ isDeleted: false });
};

// Query helper to get only verified measurements
MeasurementSchema.query.verified = function() {
  return this.where({ isVerified: true });
};

// Query helper to get measurements needing update
MeasurementSchema.query.needingUpdate = function() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return this.where({ updatedAt: { $lt: sixMonthsAgo } });
};

// ==================== EXPORT ====================

const Measurement = mongoose.model('Measurement', MeasurementSchema);

module.exports = Measurement;