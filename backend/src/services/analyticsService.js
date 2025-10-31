// backend/src/services/analyticsService.js

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

class AnalyticsService {
  /**
   * Get dashboard overview statistics
   * @param {Object} dateRange - Start and end dates
   * @returns {Object} Dashboard statistics
   */
  async getDashboardStats(dateRange = {}) {
    try {
      const { startDate, endDate } = this._getDateRange(dateRange);

      const [
        revenueStats,
        orderStats,
        customerStats,
        productStats,
        comparisonData
      ] = await Promise.all([
        this._getRevenueStats(startDate, endDate),
        this._getOrderStats(startDate, endDate),
        this._getCustomerStats(startDate, endDate),
        this._getProductStats(startDate, endDate),
        this._getComparisonData(startDate, endDate)
      ]);

      return {
        success: true,
        data: {
          revenue: revenueStats,
          orders: orderStats,
          customers: customerStats,
          products: productStats,
          comparison: comparisonData,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw new Error(`Failed to get dashboard statistics: ${error.message}`);
    }
  }

  /**
   * Get revenue statistics
   * @private
   */
  async _getRevenueStats(startDate, endDate) {
    const revenueData = await Order.aggregate([
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
          totalRevenue: { $sum: '$pricing.total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$pricing.total' },
          totalDiscount: { $sum: '$pricing.discount' },
          totalShipping: { $sum: '$pricing.shippingCharges' }
        }
      }
    ]);

    const result = revenueData[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
      totalShipping: 0
    };

    // Calculate net revenue (after discounts)
    result.netRevenue = result.totalRevenue - result.totalDiscount;

    return result;
  }

  /**
   * Get order statistics
   * @private
   */
  async _getOrderStats(startDate, endDate) {
    const orderData = await Order.aggregate([
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
    ]);

    const stats = {
      total: 0,
      pendingPayment: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      outForDelivery: 0,
      delivered: 0
    };

    orderData.forEach(item => {
      stats.total += item.count;
      const statusKey = item._id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      stats[statusKey] = item.count;
    });

    // Calculate completion rate
    stats.completionRate = stats.total > 0 
      ? ((stats.completed + stats.delivered) / stats.total * 100).toFixed(2)
      : 0;

    // Calculate cancellation rate
    stats.cancellationRate = stats.total > 0
      ? (stats.cancelled / stats.total * 100).toFixed(2)
      : 0;

    return stats;
  }

  /**
   * Get customer statistics
   * @private
   */
  async _getCustomerStats(startDate, endDate) {
    const [newCustomers, totalCustomers, returningCustomers] = await Promise.all([
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
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
          $count: 'returningCustomers'
        }
      ])
    ]);

    const returningCount = returningCustomers[0]?.returningCustomers || 0;
    
    return {
      total: totalCustomers,
      new: newCustomers,
      returning: returningCount,
      retentionRate: newCustomers > 0 
        ? (returningCount / newCustomers * 100).toFixed(2)
        : 0
    };
  }

  /**
   * Get product statistics
   * @private
   */
  async _getProductStats(startDate, endDate) {
    const [topProducts, totalProducts, lowStockCount] = await Promise.all([
      Order.aggregate([
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
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.price' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
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
            totalSold: 1,
            revenue: 1
          }
        }
      ]),
      Product.countDocuments(),
      Product.countDocuments({ 'inventory.stock': { $lt: 10, $gt: 0 } })
    ]);

    return {
      total: totalProducts,
      lowStock: lowStockCount,
      topSelling: topProducts
    };
  }

  /**
   * Get comparison data (current vs previous period)
   * @private
   */
  async _getComparisonData(startDate, endDate) {
    const periodDiff = endDate - startDate;
    const prevStartDate = new Date(startDate.getTime() - periodDiff);
    const prevEndDate = new Date(startDate);

    const [currentPeriod, previousPeriod] = await Promise.all([
      this._getPeriodRevenue(startDate, endDate),
      this._getPeriodRevenue(prevStartDate, prevEndDate)
    ]);

    const revenueChange = this._calculatePercentageChange(
      previousPeriod.revenue,
      currentPeriod.revenue
    );

    const orderChange = this._calculatePercentageChange(
      previousPeriod.orders,
      currentPeriod.orders
    );

    return {
      revenue: {
        current: currentPeriod.revenue,
        previous: previousPeriod.revenue,
        change: revenueChange
      },
      orders: {
        current: currentPeriod.orders,
        previous: previousPeriod.orders,
        change: orderChange
      }
    };
  }

  /**
   * Get period revenue
   * @private
   */
  async _getPeriodRevenue(startDate, endDate) {
    const result = await Order.aggregate([
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
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 }
        }
      }
    ]);

    return result[0] || { revenue: 0, orders: 0 };
  }

  /**
   * Get sales report with daily/weekly/monthly breakdown
   * @param {String} period - 'daily', 'weekly', 'monthly', 'yearly'
   * @param {Object} dateRange - Start and end dates
   * @returns {Object} Sales report
   */
  async getSalesReport(period = 'daily', dateRange = {}) {
    try {
      const { startDate, endDate } = this._getDateRange(dateRange);
      const groupFormat = this._getGroupFormat(period);

      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            'payment.status': 'verified',
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: groupFormat,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            averageOrderValue: { $avg: '$pricing.total' },
            customOrders: {
              $sum: {
                $cond: [{ $eq: ['$orderType', 'custom'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Fill gaps in data for better visualization
      const filledData = this._fillDateGaps(salesData, startDate, endDate, period);

      return {
        success: true,
        data: {
          sales: filledData,
          period,
          dateRange: { startDate, endDate },
          summary: this._calculateSummary(filledData)
        }
      };
    } catch (error) {
      console.error('Error in getSalesReport:', error);
      throw new Error(`Failed to generate sales report: ${error.message}`);
    }
  }

  /**
   * Get customer analytics report
   * @param {Object} dateRange - Start and end dates
   * @returns {Object} Customer analytics
   */
  async getCustomerReport(dateRange = {}) {
    try {
      const { startDate, endDate } = this._getDateRange(dateRange);

      const [
        customerSegments,
        topCustomers,
        customerGrowth,
        lifetimeValue
      ] = await Promise.all([
        this._getCustomerSegments(startDate, endDate),
        this._getTopCustomers(startDate, endDate),
        this._getCustomerGrowth(startDate, endDate),
        this._getCustomerLifetimeValue()
      ]);

      return {
        success: true,
        data: {
          segments: customerSegments,
          topCustomers,
          growth: customerGrowth,
          lifetimeValue,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error in getCustomerReport:', error);
      throw new Error(`Failed to generate customer report: ${error.message}`);
    }
  }

  /**
   * Get customer segments (VIP, Regular, First-time, Inactive)
   * @private
   */
  async _getCustomerSegments(startDate, endDate) {
    const segments = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$customer',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      {
        $bucket: {
          groupBy: '$orderCount',
          boundaries: [1, 2, 5, 10, 999],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            customers: { $push: '$_id' },
            avgSpent: { $avg: '$totalSpent' }
          }
        }
      }
    ]);

    const segmentNames = {
      1: 'First-time',
      2: 'Regular',
      5: 'Loyal',
      10: 'VIP'
    };

    return segments.map(seg => ({
      segment: segmentNames[seg._id] || 'Other',
      customerCount: seg.count,
      averageSpent: Math.round(seg.avgSpent)
    }));
  }

  /**
   * Get top customers by revenue
   * @private
   */
  async _getTopCustomers(startDate, endDate, limit = 10) {
    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: '$customer',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          lastOrderDate: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          customerId: '$_id',
          name: '$customerDetails.fullName',
          email: '$customerDetails.email',
          phone: '$customerDetails.phone',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$totalOrders'] },
          lastOrderDate: 1
        }
      }
    ]);

    return topCustomers;
  }

  /**
   * Get customer growth over time
   * @private
   */
  async _getCustomerGrowth(startDate, endDate) {
    const growth = await User.aggregate([
      {
        $match: {
          role: 'customer',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          newCustomers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Calculate cumulative total
    let cumulative = 0;
    return growth.map(item => {
      cumulative += item.newCustomers;
      return {
        date: new Date(item._id.year, item._id.month - 1, item._id.day),
        newCustomers: item.newCustomers,
        totalCustomers: cumulative
      };
    });
  }

  /**
   * Get customer lifetime value
   * @private
   */
  async _getCustomerLifetimeValue() {
    const ltv = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          'payment.status': 'verified'
        }
      },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$pricing.total' },
          orderCount: { $sum: 1 },
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          averageLTV: { $avg: '$totalSpent' },
          averageOrders: { $avg: '$orderCount' },
          totalCustomers: { $sum: 1 }
        }
      }
    ]);

    return ltv[0] || {
      averageLTV: 0,
      averageOrders: 0,
      totalCustomers: 0
    };
  }

  /**
   * Get product performance report
   * @param {Object} options - Report options
   * @returns {Object} Product performance data
   */
  async getProductReport(options = {}) {
    try {
      const { startDate, endDate } = this._getDateRange(options.dateRange || {});
      const limit = options.limit || 20;
      const sortBy = options.sortBy || 'revenue'; // 'revenue', 'quantity', 'views'

      const [bestSellers, lowPerformers, categoryPerformance] = await Promise.all([
        this._getBestSellingProducts(startDate, endDate, limit, sortBy),
        this._getLowPerformingProducts(startDate, endDate),
        this._getCategoryPerformance(startDate, endDate)
      ]);

      return {
        success: true,
        data: {
          bestSellers,
          lowPerformers,
          categoryPerformance,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error in getProductReport:', error);
      throw new Error(`Failed to generate product report: ${error.message}`);
    }
  }

  /**
   * Get best selling products
   * @private
   */
  async _getBestSellingProducts(startDate, endDate, limit, sortBy) {
    const sortField = sortBy === 'quantity' ? 'totalQuantity' : 'totalRevenue';

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
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { [sortField]: -1 } },
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
          category: '$productDetails.category',
          totalQuantity: 1,
          totalRevenue: 1,
          orderCount: 1,
          averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
        }
      }
    ]);

    return products;
  }

  /**
   * Get low performing products
   * @private
   */
  async _getLowPerformingProducts(startDate, endDate) {
    const thirtyDaysAgo = new Date(endDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lowPerformers = await Product.aggregate([
      {
        $match: {
          createdAt: { $lt: thirtyDaysAgo },
          availability: 'in-stock'
        }
      },
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { $unwind: '$items' },
            {
              $match: {
                $expr: { $eq: ['$items.product', '$$productId'] },
                createdAt: { $gte: startDate, $lte: endDate }
              }
            }
          ],
          as: 'orders'
        }
      },
      {
        $match: {
          $or: [
            { orders: { $size: 0 } },
            { views: { $lt: 50 } }
          ]
        }
      },
      {
        $project: {
          title: 1,
          sku: 1,
          category: 1,
          views: 1,
          orderCount: { $size: '$orders' },
          createdAt: 1,
          daysSinceCreation: {
            $divide: [
              { $subtract: [endDate, '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $sort: { orderCount: 1, views: 1 } },
      { $limit: 10 }
    ]);

    return lowPerformers;
  }

  /**
   * Get category performance
   * @private
   */
  async _getCategoryPerformance(startDate, endDate) {
    const performance = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
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
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Calculate percentages
    const totalRevenue = performance.reduce((sum, cat) => sum + cat.totalRevenue, 0);
    
    return performance.map(cat => ({
      ...cat,
      revenuePercentage: totalRevenue > 0 
        ? ((cat.totalRevenue / totalRevenue) * 100).toFixed(2)
        : 0
    }));
  }

  /**
   * Get conversion funnel data
   * @param {Object} dateRange - Start and end dates
   * @returns {Object} Funnel data
   */
  async getConversionFunnel(dateRange = {}) {
    try {
      const { startDate, endDate } = this._getDateRange(dateRange);

      // This would require additional tracking events in production
      // For now, we'll use proxy metrics from available data
      
      const [productViews, cartsCreated, checkoutsStarted, ordersCompleted] = await Promise.all([
        Product.aggregate([
          {
            $match: {
              updatedAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$views' }
            }
          }
        ]),
        Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate }
        }),
        Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'pending-payment' }
        }),
        Order.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          'payment.status': 'verified'
        })
      ]);

      const views = productViews[0]?.totalViews || 0;
      const carts = cartsCreated;
      const checkouts = checkoutsStarted;
      const orders = ordersCompleted;

      return {
        success: true,
        data: {
          funnel: [
            {
              stage: 'Product Views',
              count: views,
              dropoff: 0,
              conversionRate: 100
            },
            {
              stage: 'Add to Cart',
              count: carts,
              dropoff: views > 0 ? ((views - carts) / views * 100).toFixed(2) : 0,
              conversionRate: views > 0 ? (carts / views * 100).toFixed(2) : 0
            },
            {
              stage: 'Checkout Started',
              count: checkouts,
              dropoff: carts > 0 ? ((carts - checkouts) / carts * 100).toFixed(2) : 0,
              conversionRate: views > 0 ? (checkouts / views * 100).toFixed(2) : 0
            },
            {
              stage: 'Order Completed',
              count: orders,
              dropoff: checkouts > 0 ? ((checkouts - orders) / checkouts * 100).toFixed(2) : 0,
              conversionRate: views > 0 ? (orders / views * 100).toFixed(2) : 0
            }
          ],
          overallConversionRate: views > 0 ? (orders / views * 100).toFixed(2) : 0,
          dateRange: { startDate, endDate }
        }
      };
    } catch (error) {
      console.error('Error in getConversionFunnel:', error);
      throw new Error(`Failed to get conversion funnel: ${error.message}`);
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get date range from options or use defaults
   * @private
   */
  _getDateRange(options = {}) {
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const startDate = options.startDate 
      ? new Date(options.startDate)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days

    // Set to start/end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Get MongoDB group format based on period
   * @private
   */
  _getGroupFormat(period) {
    switch (period) {
      case 'hourly':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
      case 'daily':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
      case 'weekly':
        return {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
      case 'monthly':
        return {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
      case 'yearly':
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
   * Fill gaps in date series for better visualization
   * @private
   */
  _fillDateGaps(data, startDate, endDate, period) {
    // Implementation depends on period granularity
    // This is a simplified version
    return data;
  }

  /**
   * Calculate summary statistics
   * @private
   */
  _calculateSummary(data) {
    if (!data.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }

  /**
   * Calculate percentage change between two values
   * @private
   */
  _calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  }
}

module.exports = new AnalyticsService();