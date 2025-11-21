/**
 * Dashboard Controller
 * Unified dashboard endpoint that combines all analytics data
 */

const analyticsService = require('../services/analyticsService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Export dashboard data
 * @route GET /api/admin/dashboard/export
 * @access Private (Admin)
 */
exports.exportDashboard = async (req, res) => {
  try {
    const { format = 'csv', period = 'month', startDate, endDate } = req.query;
    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    // Fetch dashboard data
    const [
      stats,
      revenueTrends,
      orderDistribution,
      popularProducts,
      recentOrders,
      lowStockAlerts
    ] = await Promise.all([
      getDashboardStats(dateRange),
      getRevenueTrends(dateRange),
      getOrderDistribution(dateRange),
      getPopularProducts(dateRange),
      getRecentOrders(100), // Get more for export
      getLowStockAlerts(100)
    ]);

    if (format === 'csv') {
      return exportDashboardToCSV(res, {
        stats,
        revenueTrends,
        orderDistribution,
        popularProducts,
        recentOrders,
        lowStockAlerts
      }, period);
    }

    if (format === 'pdf') {
      const { generateDashboardPDF } = require('../utils/pdfGenerator');
      return await generateDashboardPDF(res, {
        stats,
        revenueTrends,
        orderDistribution,
        popularProducts,
        recentOrders,
        lowStockAlerts,
        dateRange
      }, period);
    }

    // JSON export (default)
    res.status(200).json({
      success: true,
      data: {
        stats,
        revenueTrends,
        orderDistribution,
        popularProducts,
        recentOrders,
        lowStockAlerts,
        dateRange: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          period
        }
      },
      exportedAt: new Date()
    });
  } catch (error) {
    logger.error('Error exporting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get complete dashboard data
 * @route GET /api/admin/dashboard
 * @access Private (Admin)
 */
exports.getDashboard = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Convert period to date range
    const dateRange = getDateRangeFromPeriod(period, startDate, endDate);

    // Fetch all dashboard data in parallel
    const [
      stats,
      revenueTrends,
      orderDistribution,
      popularProducts,
      recentOrders,
      lowStockAlerts,
      suitTypeSales
    ] = await Promise.all([
      getDashboardStats(dateRange),
      getRevenueTrends(dateRange),
      getOrderDistribution(dateRange),
      getPopularProducts(dateRange),
      getRecentOrders(10),
      getLowStockAlerts(),
      getSuitTypeSales(dateRange)
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        revenueTrends,
        orderDistribution,
        popularProducts,
        recentOrders,
        lowStockAlerts,
        suitTypeSales,
        dateRange: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          period
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get dashboard statistics
 */
async function getDashboardStats(dateRange) {
  const { startDate, endDate } = dateRange;
  
  // Previous period for comparison
  const periodDiff = endDate - startDate;
  const prevStartDate = new Date(startDate.getTime() - periodDiff);
  const prevEndDate = new Date(startDate);

  const [
    currentRevenue,
    previousRevenue,
    currentOrders,
    previousOrders,
    orderStats,
    customerStats,
    productStats
  ] = await Promise.all([
    // Current period revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          'payment.status': 'verified',
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
          avg: { $avg: '$pricing.total' }
        }
      }
    ]),
    // Previous period revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lte: prevEndDate },
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
    // Current period orders
    Order.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    }),
    // Previous period orders
    Order.countDocuments({
      createdAt: { $gte: prevStartDate, $lte: prevEndDate }
    }),
    // Order statistics
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    // Customer statistics
    Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: prevStartDate, $lte: prevEndDate }
      })
    ]),
    // Product statistics
    Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        'inventory.stock': { $gt: 0, $lt: 10 }
      }),
      Product.countDocuments({
        'inventory.stock': 0
      })
    ])
  ]);

  const revenue = currentRevenue[0] || { total: 0, count: 0, avg: 0 };
  const prevRevenue = previousRevenue[0] || { total: 0 };
  const revenueChange = parseFloat(calculatePercentageChange(prevRevenue.total, revenue.total));

  const ordersChange = parseFloat(calculatePercentageChange(previousOrders, currentOrders));

  // Process order stats
  const orderStatusCounts = {
    total: currentOrders,
    active: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  };

  orderStats.forEach(item => {
    const status = item._id;
    orderStatusCounts.total += item.count;
    if (status === 'pending-payment') orderStatusCounts.pending = item.count;
    else if (['payment-verified', 'fabric-arranged', 'stitching-in-progress', 'quality-check'].includes(status)) {
      orderStatusCounts.inProgress += item.count;
    } else if (['ready-for-dispatch', 'dispatched', 'delivered'].includes(status)) {
      orderStatusCounts.completed += item.count;
    } else if (status === 'cancelled') {
      orderStatusCounts.cancelled = item.count;
    }
  });

  orderStatusCounts.active = orderStatusCounts.pending + orderStatusCounts.inProgress;
  orderStatusCounts.completionRate = orderStatusCounts.total > 0
    ? ((orderStatusCounts.completed / orderStatusCounts.total) * 100).toFixed(2)
    : 0;
  orderStatusCounts.cancellationRate = orderStatusCounts.total > 0
    ? ((orderStatusCounts.cancelled / orderStatusCounts.total) * 100).toFixed(2)
    : 0;
  orderStatusCounts.change = parseFloat(ordersChange);

  // Customer stats
  const [totalCustomers, newCustomers, prevNewCustomers] = customerStats;
  const customersChange = parseFloat(calculatePercentageChange(prevNewCustomers, newCustomers));

  // Product stats
  const [totalProducts, lowStock, outOfStock] = productStats;

  // Get today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = await Order.aggregate([
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
  ]);

  // Get week's revenue
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: weekStart },
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
  ]);

  // Get month's revenue
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart },
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
  ]);

  // Get year's revenue
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearRevenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yearStart },
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
  ]);

  return {
    revenue: {
      total: revenue.total,
      today: todayRevenue[0]?.total || 0,
      week: weekRevenue[0]?.total || 0,
      month: monthRevenue[0]?.total || 0,
      year: yearRevenue[0]?.total || 0,
      change: parseFloat(revenueChange),
      netRevenue: revenue.total,
      averageOrderValue: revenue.avg || 0
    },
    orders: orderStatusCounts,
    customers: {
      total: totalCustomers,
      new: newCustomers,
      returning: totalCustomers - newCustomers,
      change: parseFloat(customersChange),
      retentionRate: newCustomers > 0 ? ((totalCustomers - newCustomers) / newCustomers * 100).toFixed(2) : 0
    },
    products: {
      total: totalProducts,
      lowStock,
      outOfStock,
      change: 0 // Can be calculated if needed
    }
  };
}

/**
 * Get revenue trends for chart
 */
async function getRevenueTrends(dateRange) {
  const { startDate, endDate } = dateRange;
  
  const trends = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        'payment.status': 'verified',
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$pricing.total' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  return trends.map(item => ({
    date: formatDate(item._id),
    revenue: Math.round(item.revenue),
    orders: item.orders,
    averageOrderValue: Math.round(item.averageOrderValue || 0)
  }));
}

/**
 * Get order distribution by status
 */
async function getOrderDistribution(dateRange) {
  const { startDate, endDate } = dateRange;
  
  const distribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
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

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return distribution.map(item => ({
    status: item._id,
    count: item.count,
    percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(2)) : 0,
    revenue: Math.round(item.revenue)
  }));
}

/**
 * Get popular products
 */
async function getPopularProducts(dateRange, limit = 10) {
  const { startDate, endDate } = dateRange;
  
  const products = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        sales: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { sales: -1 } },
    { $limit: limit },
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
        sales: 1,
        revenue: 1,
        orderCount: 1,
        averagePrice: { $divide: ['$revenue', '$sales'] }
      }
    }
  ]);

  return products.map(item => ({
    productId: item.productId.toString(),
    title: item.title,
    sku: item.sku,
    image: item.image,
    sales: item.sales,
    revenue: Math.round(item.revenue),
    orderCount: item.orderCount,
    averagePrice: Math.round(item.averagePrice || 0)
  }));
}

/**
 * Get recent orders
 */
async function getRecentOrders(limit = 10) {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'fullName email')
    .select('orderNumber customer customerInfo items pricing.total status payment.method payment.status createdAt')
    .lean();

  return orders.map(order => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    customer: order.customer?.fullName || order.customerInfo?.name || 'Guest',
    customerEmail: order.customer?.email || order.customerInfo?.email,
    total: order.pricing?.total || 0,
    status: order.status,
    date: order.createdAt.toISOString(),
    items: order.items?.length || 0,
    paymentMethod: order.payment?.method,
    paymentStatus: order.payment?.status
  }));
}

/**
 * Get low stock alerts
 */
async function getLowStockAlerts(limit = 20) {
  const products = await Product.find({
    'inventory.stock': { $gt: 0, $lte: 10 },
    availability: 'in-stock'
  })
    .select('title sku inventory.stock category images')
    .limit(limit)
    .lean();

  return products.map(product => ({
    productId: product._id.toString(),
    title: product.title,
    sku: product.sku,
    stock: product.inventory?.stock || 0,
    category: product.category?.name || product.category,
    image: product.images?.[0]
  }));
}

/**
 * Get suit type sales distribution
 */
async function getSuitTypeSales(dateRange) {
  const { startDate, endDate } = dateRange;
  
  const suitTypeSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
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

  return suitTypeSales.map(item => ({
    suitType: item._id || 'ready-made',
    label: item._id === 'karhai' ? 'Hand-Made Karhai' : 
           item._id === 'replica' ? 'Brand Replicas' : 
           'Ready-Made',
    revenue: Math.round(item.revenue),
    orders: item.orders,
    quantity: item.quantity,
    percentage: totalRevenue > 0 ? parseFloat(((item.revenue / totalRevenue) * 100).toFixed(2)) : 0
  }));
}

/**
 * Helper: Convert period to date range
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
      case 'week':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Helper: Calculate percentage change
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }
  return ((newValue - oldValue) / oldValue * 100).toFixed(2);
}

/**
 * Helper: Format date for display
 */
function formatDate(dateObj) {
  if (!dateObj) return '';
  const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Export dashboard data to CSV
 */
function exportDashboardToCSV(res, data, period) {
  try {
    let csvContent = 'Dashboard Export Report\n';
    csvContent += `Period: ${period}\n`;
    csvContent += `Generated: ${new Date().toISOString()}\n\n`;

    // Stats Section
    csvContent += '=== STATISTICS ===\n';
    csvContent += `Total Revenue,${data.stats.revenue.total}\n`;
    csvContent += `Total Orders,${data.stats.orders.total}\n`;
    csvContent += `Total Customers,${data.stats.customers.total}\n`;
    csvContent += `Total Products,${data.stats.products.total}\n`;
    csvContent += `Low Stock Products,${data.stats.products.lowStock}\n\n`;

    // Revenue Trends
    csvContent += '=== REVENUE TRENDS ===\n';
    csvContent += 'Date,Revenue,Orders,Average Order Value\n';
    data.revenueTrends.forEach(item => {
      csvContent += `${item.date},${item.revenue},${item.orders},${item.averageOrderValue}\n`;
    });
    csvContent += '\n';

    // Order Distribution
    csvContent += '=== ORDER DISTRIBUTION ===\n';
    csvContent += 'Status,Count,Percentage,Revenue\n';
    data.orderDistribution.forEach(item => {
      csvContent += `${item.status},${item.count},${item.percentage},${item.revenue}\n`;
    });
    csvContent += '\n';

    // Popular Products
    csvContent += '=== POPULAR PRODUCTS ===\n';
    csvContent += 'Product,Title,Sales,Revenue,Order Count,Average Price\n';
    data.popularProducts.forEach((item, index) => {
      csvContent += `${index + 1},${item.title},${item.sales},${item.revenue},${item.orderCount},${item.averagePrice}\n`;
    });
    csvContent += '\n';

    // Recent Orders
    csvContent += '=== RECENT ORDERS ===\n';
    csvContent += 'Order Number,Customer,Items,Total,Status,Date\n';
    data.recentOrders.forEach(item => {
      csvContent += `${item.orderNumber},${item.customer},${item.items},${item.total},${item.status},${item.date}\n`;
    });
    csvContent += '\n';

    // Low Stock Alerts
    csvContent += '=== LOW STOCK ALERTS ===\n';
    csvContent += 'Product,SKU,Stock,Category\n';
    data.lowStockAlerts.forEach(item => {
      csvContent += `${item.title},${item.sku || 'N/A'},${item.stock},${item.category || 'N/A'}\n`;
    });

    const filename = `dashboard-export-${period}-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    logger.error('Error exporting dashboard to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export dashboard to CSV',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

