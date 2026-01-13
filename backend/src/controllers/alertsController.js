/**
 * Alerts Controller
 * Manages system alerts for admin dashboard
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Run system alert checks
 * POST /api/v1/admin/alerts/check
 */
exports.checkAlerts = async (req, res) => {
  try {
    const results = {
      lowStock: 0,
      failedPayments: 0,
      pendingOrders: 0,
      warnings: [],
      timestamp: new Date()
    };

    // Check 1: Low stock products
    const lowStockProducts = await Product.find({
      isActive: true,
      isDeleted: false,
      'inventory.stockQuantity': { $lte: 5 }
    }).select('title inventory stockQuantity');

    results.lowStock = lowStockProducts.length;
    
    if (lowStockProducts.length > 0) {
      results.warnings.push(
        `${lowStockProducts.length} products with low stock (≤5 units)`
      );
      
      // Log low stock products
      lowStockProducts.forEach(product => {
        logger.warn('Low stock alert', {
          product: product.title,
          stockQuantity: product.inventory.stockQuantity
        });
      });
    }

    // Check 2: Failed payments (orders with payment status failed)
    const failedPayments = await Order.countDocuments({
      'payment.status': 'failed'
    });

    results.failedPayments = failedPayments;
    
    if (failedPayments > 0) {
      results.warnings.push(
        `${failedPayments} orders with failed payments`
      );
    }

    // Check 3: Pending orders older than 24 hours
    const pendingThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pendingOrders = await Order.countDocuments({
      status: 'pending-payment',
      createdAt: { $lt: pendingThreshold }
    });

    results.pendingOrders = pendingOrders;
    
    if (pendingOrders > 0) {
      results.warnings.push(
        `${pendingOrders} pending orders older than 24 hours`
      );
    }

    // Check 4: Orders stuck in 'material-arranged' for more than 7 days
    const stuckOrders = await Order.countDocuments({
      status: 'material-arranged',
      updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (stuckOrders > 0) {
      results.warnings.push(
        `${stuckOrders} orders stuck in 'material-arranged' for 7+ days`
      );
    }

    // Check 5: High value orders without payment verification
    const highValueUnverified = await Order.countDocuments({
      'pricing.total': { $gte: 50000 },
      'payment.status': { $ne: 'verified' }
    });

    if (highValueUnverified > 0) {
      results.warnings.push(
        `${highValueUnverified} high-value orders (≥Rs. 50,000) without verified payment`
      );
    }

    logger.info('Alert checks completed', results);

    res.status(200).json({
      success: true,
      message: 'Alert checks completed',
      data: results
    });
  } catch (error) {
    logger.error('Error running alert checks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run alert checks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get alert history
 * GET /api/v1/admin/alerts/history
 */
exports.getAlertHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // This would typically fetch from an alerts collection
    // For now, return recent system logs
    const alerts = [];

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: 0
      }
    });
  } catch (error) {
    logger.error('Error fetching alert history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert history'
    });
  }
};
