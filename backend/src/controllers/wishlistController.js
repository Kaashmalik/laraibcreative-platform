/**
 * Wishlist Controller
 * Manages user wishlist operations
 */

const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get user's wishlist
 * GET /api/wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const wishlist = await Wishlist.findOne({ userId })
      .populate('items.productId', 'title slug primaryImage pricing availabilityStatus');

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { items: [] }
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    logger.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};

/**
 * Add item to wishlist
 * POST /api/wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ 
      _id: productId,
      isActive: true,
      isDeleted: false
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Check if item already exists
    const existingItem = wishlist.items.find(
      item => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add item to wishlist
    wishlist.items.push({
      productId,
      addedAt: new Date()
    });

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.productId', 'title slug primaryImage pricing availabilityStatus');

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: wishlist
    });
  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to wishlist'
    });
  }
};

/**
 * Remove item from wishlist
 * DELETE /api/wishlist/:productId
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove item
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId
    );

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.productId', 'title slug primaryImage pricing availabilityStatus');

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from wishlist'
    });
  }
};

/**
 * Clear wishlist
 * DELETE /api/wishlist
 */
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared',
      data: wishlist
    });
  } catch (error) {
    logger.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist'
    });
  }
};

/**
 * Sync wishlist (merge local wishlist with backend)
 * POST /api/wishlist/sync
 */
exports.syncWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    // Sync items - add new items from local wishlist
    for (const item of items) {
      const exists = wishlist.items.find(
        wi => wi.productId.toString() === item.productId
      );

      if (!exists) {
        // Verify product exists
        const product = await Product.findOne({
          _id: item.productId,
          isActive: true,
          isDeleted: false
        });

        if (product) {
          wishlist.items.push({
            productId: item.productId,
            addedAt: item.addedAt ? new Date(item.addedAt) : new Date()
          });
        }
      }
    }

    await wishlist.save();

    // Populate product details
    await wishlist.populate('items.productId', 'title slug primaryImage pricing availabilityStatus');

    res.status(200).json({
      success: true,
      message: 'Wishlist synced successfully',
      data: wishlist
    });
  } catch (error) {
    logger.error('Error syncing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync wishlist'
    });
  }
};

/**
 * Check if product is in wishlist
 * GET /api/wishlist/check/:productId
 */
exports.checkInWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: { inWishlist: false }
      });
    }

    const inWishlist = wishlist.items.some(
      item => item.productId.toString() === productId
    );

    res.status(200).json({
      success: true,
      data: { inWishlist }
    });
  } catch (error) {
    logger.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist'
    });
  }
};
