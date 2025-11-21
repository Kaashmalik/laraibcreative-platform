// backend/src/controllers/analyticsController.js

const analyticsService = require('../services/analyticsService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Get dashboard overview statistics
 * @route GET /api/analytics/overview
 * @access Admin
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const { startDate, endDate, period = 'last30days' } = req.query;

    // Convert period shortcuts to date range
    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    const stats = await analyticsService.getDashboardStats(dateRange);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getDashboardOverview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message
    });
  }
};

/**
 * Get sales report
 * @route GET /api/analytics/sales
 * @access Admin
 */
exports.getSalesReport = async (req, res) => {
  try {
    const {
      period = 'daily',
      startDate,
      endDate,
      groupBy = 'day',
      export: shouldExport = false
    } = req.query;

    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    const report = await analyticsService.getSalesReport(groupBy, dateRange);

    // Handle export functionality
    if (shouldExport === 'true' || shouldExport === true) {
      return exportReport(res, report.data, 'sales', groupBy);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
};

/**
 * Get customer analytics report
 * @route GET /api/analytics/customers
 * @access Admin
 */
exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'last30days' } = req.query;

    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    const report = await analyticsService.getCustomerReport(dateRange);

    res.status(200).json(report);
  } catch (error) {
    console.error('Error in getCustomerReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report',
      error: error.message
    });
  }
};

/**
 * Get product performance report
 * @route GET /api/analytics/products
 * @access Admin
 */
exports.getProductReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      period = 'last30days',
      sortBy = 'revenue',
      limit = 20
    } = req.query;

    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    const report = await analyticsService.getProductReport({
      dateRange,
      sortBy,
      limit: parseInt(limit)
    });

    res.status(200).json(report);
  } catch (error) {
    console.error('Error in getProductReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product report',
      error: error.message
    });
  }
};

/**
 * Get revenue trends (for charts)
 * @route GET /api/analytics/revenue-trends
 * @access Admin
 */
exports.getRevenueTrends = async (req, res) => {
  try {
    const { period = 'last30days', groupBy = 'day' } = req.query;

    const dateRange = getDateRangeFromPeriod(period);

    const trends = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          'payment.status': 'verified',
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: getGroupByFormat(groupBy),
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format dates for frontend
    const formattedTrends = trends.map(item => ({
      date: formatDate(item._id, groupBy),
      revenue: Math.round(item.revenue),
      orders: item.orders,
      averageOrderValue: Math.round(item.averageOrderValue)
    }));

    res.status(200).json({
      success: true,
      data: {
        trends: formattedTrends,
        period,
        groupBy
      }
    });
  } catch (error) {
    console.error('Error in getRevenueTrends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue trends',
      error: error.message
    });
  }
};

/**
 * Get order status distribution (for pie chart)
 * @route GET /api/analytics/order-distribution
 * @access Admin
 */
exports.getOrderDistribution = async (req, res) => {
  try {
    const { period = 'last30days' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    const distribution = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$payment.status', 'verified'] },
                '$pricing.total',
                0
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalOrders = distribution.reduce((sum, item) => sum + item.count, 0);

    const formattedDistribution = distribution.map(item => ({
      status: item._id,
      count: item.count,
      percentage: totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(2) : 0,
      revenue: Math.round(item.revenue)
    }));

    res.status(200).json({
      success: true,
      data: {
        distribution: formattedDistribution,
        totalOrders,
        period
      }
    });
  } catch (error) {
    console.error('Error in getOrderDistribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order distribution',
      error: error.message
    });
  }
};

/**
 * Get top performing products
 * @route GET /api/analytics/top-products
 * @access Admin
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { period = 'last30days', limit = 10, sortBy = 'revenue' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    const sortField = sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue';

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { [sortField]: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          productId: '$_id',
          title: '$productDetails.title',
          sku: '$productDetails.sku',
          image: { $arrayElemAt: ['$productDetails.images', 0] },
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        products: topProducts,
        period,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error in getTopProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products',
      error: error.message
    });
  }
};

/**
 * Get customer growth over time
 * @route GET /api/analytics/customer-growth
 * @access Admin
 */
exports.getCustomerGrowth = async (req, res) => {
  try {
    const { period = 'last12months', groupBy = 'month' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    const growth = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          }
        }
      },
      {
        $group: {
          _id: getGroupByFormat(groupBy),
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate cumulative total
    let cumulative = 0;
    const formattedGrowth = growth.map(item => {
      cumulative += item.newCustomers;
      return {
        date: formatDate(item._id, groupBy),
        newCustomers: item.newCustomers,
        totalCustomers: cumulative
      };
    });

    res.status(200).json({
      success: true,
      data: {
        growth: formattedGrowth,
        period,
        groupBy
      }
    });
  } catch (error) {
    console.error('Error in getCustomerGrowth:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer growth',
      error: error.message
    });
  }
};

/**
 * Get conversion funnel data
 * @route GET /api/analytics/conversion-funnel
 * @access Admin
 */
exports.getConversionFunnel = async (req, res) => {
  try {
    const { period = 'last30days' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    const funnel = await analyticsService.getConversionFunnel(dateRange);

    res.status(200).json(funnel);
  } catch (error) {
    console.error('Error in getConversionFunnel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel',
      error: error.message
    });
  }
};

/**
 * Get real-time statistics
 * @route GET /api/analytics/realtime
 * @access Admin
 */
exports.getRealtimeStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayOrders, todayRevenue, pendingOrders, activeCustomers] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: today }
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            'payment.status': 'verified',
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.total' }
          }
        }
      ]),
      Order.countDocuments({
        status: 'pending-payment'
      }),
      User.countDocuments({
        role: 'customer',
        lastLogin: { $gte: new Date(now - 24 * 60 * 60 * 1000) }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingOrders,
        activeCustomers,
        timestamp: now
      }
    });
  } catch (error) {
    console.error('Error in getRealtimeStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time statistics',
      error: error.message
    });
  }
};

/**
 * Get suit type sales distribution (for pie chart)
 * @route GET /api/analytics/suit-type-sales
 * @access Admin
 */
exports.getSuitTypeSales = async (req, res) => {
  try {
    const { period = 'last30days' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    const suitTypeSales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate
          },
          'payment.status': 'verified',
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.type',
          revenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          },
          orders: { $sum: 1 },
          quantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    const totalRevenue = suitTypeSales.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = suitTypeSales.reduce((sum, item) => sum + item.orders, 0);

    const formattedData = suitTypeSales.map(item => ({
      suitType: item._id || 'ready-made',
      label: item._id === 'karhai' ? 'Hand-Made Karhai' : 
             item._id === 'replica' ? 'Brand Replicas' : 
             'Ready-Made',
      revenue: Math.round(item.revenue),
      orders: item.orders,
      quantity: item.quantity,
      percentage: totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        distribution: formattedData,
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        period
      }
    });
  } catch (error) {
    console.error('Error in getSuitTypeSales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suit type sales',
      error: error.message
    });
  }
};

/**
 * Get replica conversion metrics
 * @route GET /api/analytics/replica-conversion
 * @access Admin
 */
exports.getReplicaConversion = async (req, res) => {
  try {
    const { period = 'last30days' } = req.query;
    const dateRange = getDateRangeFromPeriod(period);

    // Get replica product views and orders
    const [replicaViews, replicaOrders, totalReplicaProducts] = await Promise.all([
      Product.aggregate([
        {
          $match: {
            type: 'replica',
            updatedAt: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: dateRange.startDate,
              $lte: dateRange.endDate
            },
            'payment.status': 'verified',
            status: { $ne: 'cancelled' }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $match: {
            'productDetails.type': 'replica'
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] }
            },
            totalQuantity: { $sum: '$items.quantity' }
          }
        }
      ]),
      Product.countDocuments({ type: 'replica' })
    ]);

    const views = replicaViews[0]?.totalViews || 0;
    const orders = replicaOrders[0]?.totalOrders || 0;
    const revenue = replicaOrders[0]?.totalRevenue || 0;
    const quantity = replicaOrders[0]?.totalQuantity || 0;

    // Calculate conversion rate
    const conversionRate = views > 0 ? ((orders / views) * 100).toFixed(2) : 0;
    const averageOrderValue = orders > 0 ? (revenue / orders).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        views,
        orders,
        revenue: Math.round(revenue),
        quantity,
        conversionRate: parseFloat(conversionRate),
        averageOrderValue: parseFloat(averageOrderValue),
        totalReplicaProducts,
        period
      }
    });
  } catch (error) {
    console.error('Error in getReplicaConversion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch replica conversion metrics',
      error: error.message
    });
  }
};

/**
 * Get inventory alerts
 * @route GET /api/analytics/inventory-alerts
 * @access Admin
 */
exports.getInventoryAlerts = async (req, res) => {
  try {
    const [lowStock, outOfStock] = await Promise.all([
      Product.find({
        'inventory.stock': { $gt: 0, $lt: 10 },
        availability: 'in-stock'
      })
        .select('title sku inventory.stock category')
        .limit(20),
      Product.find({
        'inventory.stock': 0,
        availability: 'in-stock'
      })
        .select('title sku category')
        .limit(20)
    ]);

    res.status(200).json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        totalAlerts: lowStock.length + outOfStock.length
      }
    });
  } catch (error) {
    console.error('Error in getInventoryAlerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory alerts',
      error: error.message
    });
  }
};

/**
 * Export analytics data
 * @route GET /api/analytics/export
 * @access Admin
 */
exports.exportAnalytics = async (req, res) => {
  try {
    const { type, period = 'last30days', format = 'json' } = req.query;

    const dateRange = getDateRangeFromPeriod(period);

    let data;
    switch (type) {
      case 'sales':
        data = await analyticsService.getSalesReport('daily', dateRange);
        break;
      case 'customers':
        data = await analyticsService.getCustomerReport(dateRange);
        break;
      case 'products':
        data = await analyticsService.getProductReport({ dateRange });
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      return exportToCSV(res, data.data, type);
    }

    res.status(200).json({
      success: true,
      data,
      exportedAt: new Date()
    });
  } catch (error) {
    console.error('Error in exportAnalytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert period shortcuts to date range
 */
function getDateRangeFromPeriod(period, customStart, customEnd) {
  const now = new Date();
  const endDate = customEnd ? new Date(customEnd) : now;
  let startDate;

  if (customStart) {
    startDate = new Date(customStart);
  } else {
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate.setMonth(endDate.getMonth(), 0); // Last day of last month
        break;
      case 'last12months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // Set to start/end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Get MongoDB group format based on grouping
 */
function getGroupByFormat(groupBy) {
  switch (groupBy) {
    case 'hour':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
    case 'day':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    case 'week':
      return {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    case 'month':
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    case 'year':
      return {
        year: { $year: '$createdAt' }
      };
    default:
      return {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }
}

/**
 * Format grouped date for display
 */
function formatDate(groupedDate, groupBy) {
  if (!groupedDate) return null;

  switch (groupBy) {
    case 'hour':
      return new Date(
        groupedDate.year,
        groupedDate.month - 1,
        groupedDate.day,
        groupedDate.hour
      );
    case 'day':
      return new Date(groupedDate.year, groupedDate.month - 1, groupedDate.day);
    case 'week':
      return `${groupedDate.year}-W${groupedDate.week}`;
    case 'month':
      return new Date(groupedDate.year, groupedDate.month - 1, 1);
    case 'year':
      return groupedDate.year;
    default:
      return new Date(groupedDate.year, groupedDate.month - 1, groupedDate.day);
  }
}

/**
 * Export data to CSV format
 */
function exportToCSV(res, data, type) {
  try {
    let csvContent = '';
    let filename = `${type}-report-${Date.now()}.csv`;

    // Generate CSV based on type
    // This is a simplified version - expand based on actual data structure
    if (type === 'sales' && data.sales) {
      csvContent = 'Date,Revenue,Orders,Average Order Value\n';
      data.sales.forEach(item => {
        csvContent += `${item.date || item._id},${item.revenue},${item.orders},${item.averageOrderValue}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export to CSV',
      error: error.message
    });
  }
}

/**
 * Export report in various formats
 */
function exportReport(res, data, reportType, period) {
  const filename = `${reportType}-${period}-${Date.now()}.json`;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json({
    success: true,
    reportType,
    period,
    generatedAt: new Date(),
    data
  });
}

module.exports = exports;