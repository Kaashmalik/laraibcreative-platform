const mongoose = require('mongoose');

// Measurement schema (reused from Order model)
const measurementSchema = new mongoose.Schema({
  shirtLength: { type: Number, min: 0, max: 100 },
  shoulderWidth: { type: Number, min: 0, max: 50 },
  sleeveLength: { type: Number, min: 0, max: 60 },
  armHole: { type: Number, min: 0, max: 40 },
  bust: { type: Number, min: 0, max: 100 },
  waist: { type: Number, min: 0, max: 100 },
  hip: { type: Number, min: 0, max: 120 },
  frontNeckDepth: { type: Number, min: 0, max: 20 },
  backNeckDepth: { type: Number, min: 0, max: 20 },
  wrist: { type: Number, min: 0, max: 30 },
  trouserLength: { type: Number, min: 0, max: 80 },
  trouserWaist: { type: Number, min: 0, max: 100 },
  trouserHip: { type: Number, min: 0, max: 120 },
  thigh: { type: Number, min: 0, max: 60 },
  bottom: { type: Number, min: 0, max: 40 },
  kneeLength: { type: Number, min: 0, max: 40 },
  dupattaLength: { type: Number, min: 0, max: 150 },
  dupattaWidth: { type: Number, min: 0, max: 60 },
  unit: { type: String, enum: ['inches', 'cm'], default: 'inches' },
  sizeLabel: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'] }
}, { _id: false });

const measurementProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Profile name is required'],
    trim: true,
    maxlength: [50, 'Profile name cannot exceed 50 characters']
  },
  
  type: {
    type: String,
    enum: ['casual', 'formal', 'wedding', 'party', 'custom'],
    default: 'custom',
    required: true
  },
  
  measurements: {
    type: measurementSchema,
    required: [true, 'Measurements are required']
  },
  
  // Optional notes for this profile
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters'],
    trim: true
  },
  
  // Avatar/preview image (optional)
  avatarImage: {
    type: String,
    default: ''
  },
  
  // Whether this is the default profile
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Last used date for sorting
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for user profiles
measurementProfileSchema.index({ userId: 1, createdAt: -1 });

// Ensure only one default profile per user
measurementProfileSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Static method to get user profiles
measurementProfileSchema.statics.getUserProfiles = function(userId) {
  return this.find({ userId }).sort({ isDefault: -1, lastUsed: -1, createdAt: -1 });
};

// Static method to get default profile
measurementProfileSchema.statics.getDefaultProfile = function(userId) {
  return this.findOne({ userId, isDefault: true });
};

const MeasurementProfile = mongoose.model('MeasurementProfile', measurementProfileSchema);

module.exports = MeasurementProfile;

