/**
 * Wishlist Model
 * Stores user wishlist items
 */

const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

// Index for efficient queries
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ userId: 1, 'items.productId': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
