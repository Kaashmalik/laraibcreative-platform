/**
 * Cart Model
 * Stores user shopping cart items
 */

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
    default: 1
  },
  priceAtAdd: {
    type: Number,
    required: true
  },
  customizations: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  promoCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
cartSchema.index({ userId: 1 });

// Method to calculate totals
cartSchema.methods.calculateTotals = function() {
  const subtotal = this.items.reduce((sum, item) => {
    return sum + (item.priceAtAdd * item.quantity);
  }, 0);

  const tax = subtotal * 0.05; // 5% tax
  const total = Math.max(0, subtotal + tax + this.shipping - this.discount);

  return {
    subtotal,
    tax,
    shipping: this.shipping,
    discount: this.discount,
    total
  };
};

// Method to get total items count
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
