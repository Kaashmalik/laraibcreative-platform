const mongoose = require('mongoose');

/**
 * Referral Model
 * Tracks referrals and rewards (both get Rs.500 off)
 */

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referrer ID is required'],
    index: true
  },
  
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Referee ID is required'],
    index: true
  },
  
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Rewards
  referrerReward: {
    amount: {
      type: Number,
      default: 500,
      min: 0
    },
    currency: {
      type: String,
      enum: ['PKR', 'USD', 'SAR'],
      default: 'PKR'
    },
    status: {
      type: String,
      enum: ['pending', 'credited', 'used', 'expired'],
      default: 'pending'
    },
    creditedAt: Date,
    expiresAt: Date
  },
  
  refereeReward: {
    amount: {
      type: Number,
      default: 500,
      min: 0
    },
    currency: {
      type: String,
      enum: ['PKR', 'USD', 'SAR'],
      default: 'PKR'
    },
    status: {
      type: String,
      enum: ['pending', 'credited', 'used', 'expired'],
      default: 'pending'
    },
    creditedAt: Date,
    expiresAt: Date
  },
  
  // Trigger order (first order by referee)
  triggerOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Completion criteria
  completedAt: Date,
  
  // Notes
  notes: String
}, {
  timestamps: true
});

// Indexes - compound indexes only (simple indexes defined on fields)
referralSchema.index({ referrerId: 1, status: 1 });
// Note: refereeId and referralCode already have index: true on field definitions

// Static method: Generate unique referral code
referralSchema.statics.generateCode = function(userId) {
  const prefix = 'LC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Static method: Find by code
referralSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    referralCode: code.toUpperCase(),
    status: 'pending'
  });
};

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;

