/**
 * PromoCode Model
 * Stores promotional codes and their rules
 */

const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  userLimit: {
    type: Number,
    default: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludeCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludeProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
};

// Method to increment usage count
promoCodeSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  return await this.save();
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);
