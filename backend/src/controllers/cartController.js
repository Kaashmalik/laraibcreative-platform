/**
 * Cart Controller
 * Handles cart operations including guest cart sync, validation, promo codes
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const PromoCode = require('../models/PromoCode');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

/**
 * GET /api/cart
 * Get user's cart
 * @access Private
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(200).json({
        success: true,
        items: [],
        message: 'No user logged in'
      });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId', 'title slug images pricing availability');

    if (!cart) {
      return res.status(200).json({
        success: true,
        items: [],
        subtotal: 0,
        total: 0
      });
    }

    // Validate items and remove out-of-stock products
    const validItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive || product.isDeleted) {
        continue; // Skip invalid products
      }

      const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
      const availableQuantity = stockAvailable > 0 ? Math.min(item.quantity, stockAvailable) : item.quantity;

      if (availableQuantity > 0) {
        validItems.push({
          productId: item.productId,
          quantity: availableQuantity,
          priceAtAdd: item.priceAtAdd,
          customizations: item.customizations,
          isCustom: item.isCustom,
          product: {
            title: product.title,
            slug: product.slug,
            images: product.images,
            primaryImage: product.primaryImage,
            pricing: product.pricing,
            availability: product.availability
          }
        });

        subtotal += item.priceAtAdd * availableQuantity;
      }
    }

    // Update cart with valid items
    cart.items = validItems;
    await cart.save();

    res.status(200).json({
      success: true,
      items: validItems,
      subtotal,
      total: subtotal * 1.05 // Including 5% tax
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

/**
 * POST /api/cart/sync
 * Sync cart with backend (merge guest cart with user cart)
 * @access Private
 */
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart items'
      });
    }

    // Get existing cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Merge items: existing cart takes priority, add new items from guest cart
    const existingItemsMap = new Map();
    cart.items.forEach(item => {
      const key = `${item.productId}_${JSON.stringify(item.customizations || {})}`;
      existingItemsMap.set(key, item);
    });

    // Process incoming items
    for (const item of items) {
      const key = `${item.productId}_${JSON.stringify(item.customizations || {})}`;
      
      if (existingItemsMap.has(key)) {
        // Update quantity
        const existingItem = existingItemsMap.get(key);
        existingItem.quantity = Math.min(existingItem.quantity + item.quantity, 99);
      } else {
        // Add new item
        existingItemsMap.set(key, {
          productId: item.productId,
          quantity: Math.min(item.quantity, 99),
          priceAtAdd: item.priceAtAdd,
          customizations: item.customizations,
          isCustom: item.isCustom,
          addedAt: new Date()
        });
      }
    }

    // Validate and update cart
    const validItems = [];
    for (const [key, item] of existingItemsMap) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive || product.isDeleted) {
        continue;
      }

      const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
      const validQuantity = stockAvailable > 0 ? Math.min(item.quantity, stockAvailable) : item.quantity;

      if (validQuantity > 0) {
        validItems.push({
          ...item,
          quantity: validQuantity
        });
      }
    }

    cart.items = validItems;
    await cart.save();

    res.status(200).json({
      success: true,
      items: validItems,
      message: 'Cart synced successfully'
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync cart',
      error: error.message
    });
  }
};

/**
 * POST /api/cart/promo
 * Apply promo code to cart
 * @access Private
 */
exports.applyPromoCode = async (req, res) => {
  try {
    const { code, items } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    // Find promo code
    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'This promo code has reached its usage limit'
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.priceAtAdd * item.quantity);
    }, 0);

    // Check minimum order value
    if (promo.minOrderValue && subtotal < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of PKR ${promo.minOrderValue.toLocaleString()} required`
      });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = subtotal * (promo.discountValue / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else if (promo.discountType === 'fixed') {
      discount = promo.discountValue;
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    res.status(200).json({
      success: true,
      discount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      message: `Promo code applied! You saved PKR ${discount.toLocaleString()}`
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promo code',
      error: error.message
    });
  }
};

/**
 * POST /api/cart/shipping
 * Calculate shipping cost
 * @access Private
 */
exports.calculateShipping = async (req, res) => {
  try {
    const { address, items } = req.body;

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.priceAtAdd * item.quantity);
    }, 0);

    // Free shipping threshold
    const FREE_SHIPPING_THRESHOLD = 5000;
    
    // Base shipping rates (PKR)
    const SHIPPING_RATES = {
      'Karachi': 200,
      'Lahore': 200,
      'Islamabad': 250,
      'Rawalpindi': 250,
      'Faisalabad': 300,
      'Multan': 350,
      'Peshawar': 350,
      'Quetta': 400,
      'Default': 400
    };

    // Check if eligible for free shipping
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return res.status(200).json({
        success: true,
        cost: 0,
        message: 'Free shipping applied!'
      });
    }

    // Calculate shipping based on city
    const city = address?.city || 'Default';
    let shippingCost = SHIPPING_RATES[city] || SHIPPING_RATES['Default'];

    // Additional cost for custom stitching items
    const hasCustomItems = items.some(item => item.isCustom);
    if (hasCustomItems) {
      shippingCost += 100;
    }

    res.status(200).json({
      success: true,
      cost: shippingCost,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping',
      error: error.message
    });
  }
};

/**
 * POST /api/cart/validate
 * Validate cart items (stock availability, price changes)
 * @access Private
 */
exports.validateCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        valid: true,
        errors: []
      });
    }

    const errors = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        errors.push({
          productId: item.productId,
          message: 'Product no longer available'
        });
        continue;
      }

      if (!product.isActive || product.isDeleted) {
        errors.push({
          productId: item.productId,
          productName: product.title,
          message: 'Product is no longer available'
        });
        continue;
      }

      const stockAvailable = product.inventory?.stockQuantity || product.stockQuantity || 0;
      
      if (stockAvailable > 0 && item.quantity > stockAvailable) {
        errors.push({
          productId: item.productId,
          productName: product.title,
          message: `Only ${stockAvailable} items available in stock`,
          availableQuantity: stockAvailable,
          requestedQuantity: item.quantity
        });
        
        // Adjust quantity to available stock
        validItems.push({
          ...item,
          quantity: stockAvailable
        });
      } else if (stockAvailable === 0) {
        errors.push({
          productId: item.productId,
          productName: product.title,
          message: 'Product is out of stock'
        });
      } else {
        validItems.push(item);
      }
    }

    // Update cart with valid items
    cart.items = validItems;
    await cart.save();

    res.status(200).json({
      success: true,
      valid: errors.length === 0,
      errors,
      items: validItems,
      message: errors.length > 0 
        ? `${errors.length} item(s) need attention` 
        : 'All items are valid'
    });
  } catch (error) {
    console.error('Error validating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart',
      error: error.message
    });
  }
};

/**
 * DELETE /api/cart
 * Clear cart
 * @access Private
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?._id;

    await Cart.findOneAndDelete({ userId });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};
