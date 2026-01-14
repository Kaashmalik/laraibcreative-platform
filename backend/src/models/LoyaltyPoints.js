const mongoose = require('mongoose');

/**
 * Loyalty Points Model
 * Tracks loyalty points (1 point = Rs.1, redeemable)
 */

const loyaltyTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['earned', 'redeemed', 'expired', 'adjusted'],
    required: true
  },
  
  points: {
    type: Number,
    required: true
  },
  
  // Value in currency (1 point = Rs.1)
  value: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    enum: ['PKR', 'USD', 'SAR'],
    default: 'PKR'
  },
  
  // Source/Reason
  source: {
    type: String,
    enum: ['order', 'referral', 'review', 'social-share', 'birthday', 'manual', 'redemption'],
    required: true
  },
  
  // Related entities
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral'
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    default: function() {
      // Points expire after 1 year
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry;
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  
  // Notes
  description: String
}, {
  timestamps: true
});

// Main loyalty account schema
const loyaltyAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
    // Note: unique: true already creates an index, no need for index: true
  },
  
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalPointsRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  currentBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Conversion rate (1 point = Rs.1)
  conversionRate: {
    type: Number,
    default: 1,
    min: 0
  },
  
  // Transactions
  transactions: [loyaltyTransactionSchema],
  
  // Tier/Level
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  
  // Tier benefits
  tierBenefits: {
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    freeShipping: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes - compound and non-field indexes only
// Note: userId already has unique: true which creates an index
loyaltyAccountSchema.index({ currentBalance: -1 });
loyaltyAccountSchema.index({ tier: 1 });

// Virtual: Calculate tier based on total points
loyaltyAccountSchema.virtual('calculatedTier').get(function() {
  const total = this.totalPointsEarned;
  if (total >= 10000) return 'platinum';
  if (total >= 5000) return 'gold';
  if (total >= 2000) return 'silver';
  return 'bronze';
});

// Method: Add points
loyaltyAccountSchema.methods.addPoints = function(points, source, orderId = null) {
  this.currentBalance += points;
  this.totalPointsEarned += points;
  
  this.transactions.push({
    type: 'earned',
    points,
    value: points * this.conversionRate,
    source,
    orderId,
    status: 'active'
  });
  
  // Update tier
  this.tier = this.calculatedTier;
  
  return this.save();
};

// Method: Redeem points
loyaltyAccountSchema.methods.redeemPoints = function(points) {
  if (points > this.currentBalance) {
    throw new Error('Insufficient points balance');
  }
  
  this.currentBalance -= points;
  this.totalPointsRedeemed += points;
  
  this.transactions.push({
    type: 'redeemed',
    points: -points,
    value: points * this.conversionRate,
    source: 'redemption',
    status: 'used'
  });
  
  return this.save();
};

// Static method: Get or create account
loyaltyAccountSchema.statics.getOrCreate = async function(userId) {
  let account = await this.findOne({ userId });
  
  if (!account) {
    account = await this.create({ userId });
  }
  
  return account;
};

const LoyaltyAccount = mongoose.model('LoyaltyAccount', loyaltyAccountSchema);

module.exports = LoyaltyAccount;

