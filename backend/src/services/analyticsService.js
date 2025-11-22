const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Analytics Service
 * Business metrics calculation
 */

/**
 * Get revenue metrics
 */
exports.getRevenueMetrics = async (dateFrom, dateTo) => {
  const matchStage = {
    'payment.status': 'completed',
    createdAt: {
      $gte: new Date(dateFrom),
      $lte: new Date(dateTo)
    }
  };

  const revenueData = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$total' }
      }
    }
  ]);

  // Daily revenue
  const dailyRevenue = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return {
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    totalOrders: revenueData[0]?.totalOrders || 0,
    averageOrderValue: revenueData[0]?.averageOrderValue || 0,
    dailyRevenue
  };
};

/**
 * Get customer metrics
 */
exports.getCustomerMetrics = async () => {
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  
  // Repeat customers (customers with more than 1 order)
  const repeatCustomers = await Order.aggregate([
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 }
      }
    },
    {
      $match: {
        orderCount: { $gt: 1 }
      }
    },
    {
      $count: 'repeatCustomers'
    }
  ]);

  // Customer lifetime value
  const customerLTV = await Order.aggregate([
    {
      $group: {
        _id: '$customer',
        totalSpent: { $sum: '$total' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        averageLTV: { $avg: '$totalSpent' }
      }
    }
  ]);

  const repeatRate = totalCustomers > 0
    ? ((repeatCustomers[0]?.repeatCustomers || 0) / totalCustomers) * 100
    : 0;

  return {
    totalCustomers,
    repeatCustomers: repeatCustomers[0]?.repeatCustomers || 0,
    repeatRate: repeatRate.toFixed(2),
    averageLTV: customerLTV[0]?.averageLTV || 0
  };
};

/**
 * Get product metrics
 */
exports.getProductMetrics = async () => {
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalSold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        productId: '$_id',
        productName: '$product.title',
        totalSold: 1,
        totalRevenue: 1
      }
    }
  ]);

  return {
    topProducts
  };
};

/**
 * Get conversion metrics
 */
exports.getConversionMetrics = async () => {
  // Cart abandonment (orders created but not completed)
  const abandonedCarts = await Order.countDocuments({
    status: { $in: ['pending', 'cart'] },
    'payment.status': { $ne: 'completed' }
  });

  // Conversion rate (completed orders / total orders)
  const [totalOrders, completedOrders] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ 'payment.status': 'completed' })
  ]);

  const conversionRate = totalOrders > 0
    ? ((completedOrders / totalOrders) * 100).toFixed(2)
    : 0;

  return {
    abandonedCarts,
    conversionRate: parseFloat(conversionRate),
    totalOrders,
    completedOrders
  };
};

/**
 * Get comprehensive dashboard data
 */
exports.getDashboardData = async (dateFrom, dateTo) => {
  const [revenue, customers, products, conversion] = await Promise.all([
    exports.getRevenueMetrics(dateFrom, dateTo),
    exports.getCustomerMetrics(),
    exports.getProductMetrics(),
    exports.getConversionMetrics()
  ]);

  return {
    revenue,
    customers,
    products,
    conversion,
    generatedAt: new Date()
  };
};
