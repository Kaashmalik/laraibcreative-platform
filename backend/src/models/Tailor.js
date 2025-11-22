const mongoose = require('mongoose');

/**
 * Tailor Model
 * Manages tailor assignments and capacity for production scaling
 */

const tailorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tailor name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  whatsapp: {
    type: String,
    trim: true
  },
  
  // Specializations
  specializations: [{
    type: String,
    enum: ['bridal', 'formal', 'casual', 'embroidery', 'cutting', 'finishing']
  }],
  
  // Capacity management
  capacity: {
    maxOrdersPerDay: {
      type: Number,
      default: 5,
      min: [1, 'Minimum capacity is 1 order per day']
    },
    currentOrders: {
      type: Number,
      default: 0
    },
    estimatedCompletionDays: {
      type: Number,
      default: 7,
      min: [3, 'Minimum completion time is 3 days']
    }
  },
  
  // Performance metrics
  performance: {
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave', 'terminated'],
    default: 'active',
    index: true
  },
  
  // Availability
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: String },
    tuesday: { available: { type: Boolean, default: true }, hours: String },
    wednesday: { available: { type: Boolean, default: true }, hours: String },
    thursday: { available: { type: Boolean, default: true }, hours: String },
    friday: { available: { type: Boolean, default: true }, hours: String },
    saturday: { available: { type: Boolean, default: true }, hours: String },
    sunday: { available: { type: Boolean, default: false }, hours: String }
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
tailorSchema.index({ status: 1, 'capacity.currentOrders': 1 });
tailorSchema.index({ specializations: 1 });

// Virtual: Check if tailor has capacity
tailorSchema.virtual('hasCapacity').get(function() {
  return this.capacity.currentOrders < this.capacity.maxOrdersPerDay;
});

// Static method: Find available tailors
tailorSchema.statics.findAvailable = function(specialization = null) {
  const query = {
    status: 'active',
    $expr: {
      $lt: ['$capacity.currentOrders', '$capacity.maxOrdersPerDay']
    }
  };
  
  if (specialization) {
    query.specializations = specialization;
  }
  
  return this.find(query).sort({ 'performance.averageRating': -1 });
};

// Method: Assign order
tailorSchema.methods.assignOrder = function() {
  if (this.capacity.currentOrders >= this.capacity.maxOrdersPerDay) {
    throw new Error('Tailor has reached maximum capacity');
  }
  this.capacity.currentOrders += 1;
  return this.save();
};

// Method: Complete order
tailorSchema.methods.completeOrder = function() {
  if (this.capacity.currentOrders > 0) {
    this.capacity.currentOrders -= 1;
    this.performance.completedOrders += 1;
    this.performance.totalOrders += 1;
    return this.save();
  }
};

const Tailor = mongoose.model('Tailor', tailorSchema);

module.exports = Tailor;

