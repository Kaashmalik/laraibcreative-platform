// backend/src/services/orderService.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Generate unique order number
 * Format: LC-YYYY-NNNN (e.g., LC-2025-0001)
 * Uses atomic update to prevent race conditions
 */
exports.generateOrderNumber = async () => {
  try {
    const Counter = require('../models/Counter'); // Ensure Counter model exists
    const currentYear = new Date().getFullYear();
    const prefix = `LC-${currentYear}-`;

    // Atomic increment
    const counter = await Counter.findOneAndUpdate(
      { _id: 'orderNumber', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Pad with zeros (4 digits)
    const paddedNumber = String(counter.seq).padStart(4, '0');
    return `${prefix}${paddedNumber}`;

  } catch (error) {
    logger.error('Error generating order number:', error);
    // Fallback to random if counter fails (should not happen)
    return `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};

/**
 * Validate and process order items
 * - Verify products exist and are available
 * - Create product snapshots
 * - Calculate item prices
 */
exports.validateAndProcessItems = async (items) => {
  try {
    const processedItems = [];

    for (const item of items) {
      // Fetch product details
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Check availability for non-custom orders
      if (!item.isCustom && product.availability === 'custom-only') {
        throw new Error(`Product ${product.title} is only available for custom orders`);
      }

      // Calculate item price
      let itemPrice = product.pricing.basePrice;

      // Add custom stitching charges if custom order
      if (item.isCustom) {
        itemPrice += product.pricing.customStitchingCharge || 0;

        // Validate measurements for custom orders
        if (!item.measurements || Object.keys(item.measurements).length === 0) {
          throw new Error(`Measurements required for custom order: ${product.title}`);
        }
      }

      // Create product snapshot (store product details at order time)
      const productSnapshot = {
        title: product.title,
        sku: product.sku,
        images: product.images,
        category: product.category,
        fabric: product.fabric,
        basePrice: product.pricing.basePrice,
        customStitchingCharge: product.pricing.customStitchingCharge
      };

      processedItems.push({
        product: product._id,
        productSnapshot,
        isCustom: item.isCustom || false,
        measurements: item.measurements || null,
        referenceImages: item.referenceImages || [],
        specialInstructions: item.specialInstructions || '',
        fabric: item.fabric || product.fabric?.type || '',
        price: itemPrice,
        quantity: item.quantity || 1
      });
    }

    return processedItems;

  } catch (error) {
    logger.error('Error validating order items:', error);
    throw error;
  }
};

/**
 * Calculate order pricing
 * - Subtotal
 * - Shipping charges based on city
 * - Discount (if applicable)
 * - Total
 */
exports.calculateOrderPricing = (items, city) => {
  try {
    // Calculate subtotal
    const subtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Shipping charges based on city (Pakistan)
    const shippingCharges = calculateShippingCharges(city, subtotal);

    // Calculate discount (can be extended for coupon codes)
    const discount = 0;

    // Calculate total
    const total = subtotal + shippingCharges - discount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shippingCharges: parseFloat(shippingCharges.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };

  } catch (error) {
    logger.error('Error calculating order pricing:', error);
    throw new Error('Failed to calculate order pricing');
  }
};

/**
 * Calculate shipping charges based on city
 */
function calculateShippingCharges(city, subtotal) {
  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 5000;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  // Major cities in Pakistan with shipping rates
  const cityRates = {
    'Lahore': 150,
    'Karachi': 200,
    'Islamabad': 180,
    'Rawalpindi': 180,
    'Faisalabad': 170,
    'Multan': 180,
    'Peshawar': 200,
    'Quetta': 250,
    'Sialkot': 160,
    'Gujranwala': 160
  };

  // Normalize city name
  const normalizedCity = city.trim();

  // Return specific rate or default rate
  return cityRates[normalizedCity] || 200;
}

/**
 * Calculate estimated delivery date
 * Based on order type and complexity
 */
exports.calculateEstimatedDelivery = (items) => {
  try {
    let maxDays = 0;

    for (const item of items) {
      let itemDays = 5; // Base delivery days for ready products

      if (item.isCustom) {
        // Custom orders take longer
        itemDays = 10; // Base custom stitching time

        // Add extra days for complex measurements
        if (item.measurements && Object.keys(item.measurements).length > 10) {
          itemDays += 2;
        }

        // Add extra days if reference images provided (replica stitching)
        if (item.referenceImages && item.referenceImages.length > 0) {
          itemDays += 3;
        }
      }

      // Add shipping time (2-3 days average)
      itemDays += 3;

      maxDays = Math.max(maxDays, itemDays);
    }

    // Add buffer days
    maxDays += 2;

    // Calculate estimated date
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + maxDays);

    return estimatedDate;

  } catch (error) {
    logger.error('Error calculating estimated delivery:', error);
    // Return default 15 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 15);
    return defaultDate;
  }
};

/**
 * Get order statistics for dashboard
 */
exports.getOrderStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      pendingPayment,
      activeOrders,
      completedOrders,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ createdAt: { $gte: thisWeekStart } }),
      Order.countDocuments({ createdAt: { $gte: thisMonthStart } }),
      Order.countDocuments({ 'payment.status': 'pending' }),
      Order.countDocuments({
        status: {
          $in: ['payment-verified', 'fabric-arranged', 'stitching-in-progress', 'quality-check', 'ready-for-dispatch']
        }
      }),
      Order.countDocuments({ status: 'delivered' }),
      
      // Revenue calculations
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, 'payment.status': 'verified' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, 'payment.status': 'verified' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisWeekStart }, 'payment.status': 'verified' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thisMonthStart }, 'payment.status': 'verified' } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    return {
      orders: {
        total: totalOrders,
        today: todayOrders,
        thisWeek: weekOrders,
        thisMonth: monthOrders,
        pendingPayment,
        active: activeOrders,
        completed: completedOrders
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        thisWeek: weekRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0
      }
    };

  } catch (error) {
    logger.error('Error getting order stats:', error);
    throw new Error('Failed to fetch order statistics');
  }
};

/**
 * Get detailed statistics for analytics
 */
exports.getDetailedStats = async (period = 'month') => {
  try {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'month':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$payment.method', count: { $sum: 1 }, total: { $sum: '$pricing.total' } } },
      { $sort: { count: -1 } }
    ]);

    // Custom vs Ready orders
    const orderTypeDistribution = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.isCustom',
        count: { $sum: 1 },
        revenue: { $sum: '$items.price' }
      }}
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, avg: { $avg: '$pricing.total' } } }
    ]);

    // Daily revenue trend (for charts)
    const revenuetrend = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, 'payment.status': 'verified' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top cities by orders
    const topCities = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: '$shippingAddress.city',
        orders: { $sum: 1 },
        revenue: { $sum: '$pricing.total' }
      }},
      { $sort: { orders: -1 } },
      { $limit: 10 }
    ]);

    return {
      period,
      startDate,
      endDate: now,
      statusDistribution,
      paymentMethodDistribution,
      orderTypeDistribution: {
        custom: orderTypeDistribution.find(d => d._id === true) || { count: 0, revenue: 0 },
        ready: orderTypeDistribution.find(d => d._id === false) || { count: 0, revenue: 0 }
      },
      averageOrderValue: avgOrderValue[0]?.avg || 0,
      revenuetrend,
      topCities
    };

  } catch (error) {
    logger.error('Error getting detailed stats:', error);
    throw new Error('Failed to fetch detailed statistics');
  }
};

/**
 * Check if order can be cancelled by customer
 */
exports.canCustomerCancel = (order) => {
  const nonCancellableStatuses = [
    'stitching-in-progress',
    'quality-check',
    'ready-for-dispatch',
    'out-for-delivery',
    'delivered',
    'cancelled'
  ];

  return !nonCancellableStatuses.includes(order.status);
};

/**
 * Get next valid status transitions
 */
exports.getValidStatusTransitions = (currentStatus) => {
  const transitions = {
    'pending-payment': ['payment-verified', 'cancelled'],
    'payment-verified': ['fabric-arranged', 'cancelled'],
    'fabric-arranged': ['stitching-in-progress', 'cancelled'],
    'stitching-in-progress': ['quality-check'],
    'quality-check': ['ready-for-dispatch', 'stitching-in-progress'], // Can go back for rework
    'ready-for-dispatch': ['out-for-delivery'],
    'out-for-delivery': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  return transitions[currentStatus] || [];
};

/**
 * Calculate order completion rate
 */
exports.calculateCompletionRate = async (startDate, endDate) => {
  try {
    const [total, completed] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }),
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'delivered'
      })
    ]);

    const rate = total > 0 ? (completed / total) * 100 : 0;
    return parseFloat(rate.toFixed(2));

  } catch (error) {
    logger.error('Error calculating completion rate:', error);
    return 0;
  }
};

/**
 * Get average processing time
 */
exports.getAverageProcessingTime = async () => {
  try {
    const result = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          actualCompletion: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$actualCompletion', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$processingTime' }
        }
      }
    ]);

    return result[0]?.avgDays ? parseFloat(result[0].avgDays.toFixed(1)) : 0;

  } catch (error) {
    logger.error('Error calculating average processing time:', error);
    return 0;
  }
};

module.exports = exports;