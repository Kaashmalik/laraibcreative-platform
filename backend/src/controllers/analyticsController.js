const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

/**
 * Get business metrics dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Default to last 30 days
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo || new Date();

    const data = await analyticsService.getDashboardData(from, to);

    res.status(200).json({
      success: true,
      data
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
 * Get revenue metrics
 */
exports.getRevenue = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo || new Date();

    const data = await analyticsService.getRevenueMetrics(from, to);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error fetching revenue metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue metrics'
    });
  }
};

/**
 * Get customer metrics
 */
exports.getCustomers = async (req, res) => {
  try {
    const data = await analyticsService.getCustomerMetrics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error fetching customer metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer metrics'
    });
  }
};

/**
 * Get product metrics
 */
exports.getProducts = async (req, res) => {
  try {
    const data = await analyticsService.getProductMetrics();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Error fetching product metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product metrics'
    });
  }
};

/**
 * Get revenue trends for charts
 */
exports.getRevenueTrends = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    
    // Generate sample data for now (replace with actual service call)
    const trends = [];
    const labels = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      trends.push(Math.floor(Math.random() * 50000) + 10000);
    }

    res.status(200).json({
      success: true,
      data: { labels, data: trends, period }
    });
  } catch (error) {
    logger.error('Error fetching revenue trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue trends'
    });
  }
};

/**
 * Get order distribution by status
 */
exports.getOrderDistribution = async (req, res) => {
  try {
    // Generate sample data (replace with actual service call)
    const distribution = {
      pending: 12,
      processing: 8,
      shipped: 25,
      delivered: 45,
      cancelled: 5,
      returned: 5
    };

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    logger.error('Error fetching order distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order distribution'
    });
  }
};

/**
 * Get top performing products
 */
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Generate sample data (replace with actual service call)
    const products = [
      { id: 1, name: 'Luxury Bridal Dress', sales: 45, revenue: 450000 },
      { id: 2, name: 'Designer Kurti Set', sales: 38, revenue: 152000 },
      { id: 3, name: 'Embroidered Suit', sales: 32, revenue: 192000 },
      { id: 4, name: 'Party Wear Collection', sales: 28, revenue: 224000 },
      { id: 5, name: 'Casual Cotton Set', sales: 25, revenue: 75000 }
    ];

    res.status(200).json({
      success: true,
      data: products.slice(0, parseInt(limit))
    });
  } catch (error) {
    logger.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top products'
    });
  }
};

/**
 * Get inventory alerts (low stock)
 */
exports.getInventoryAlerts = async (req, res) => {
  try {
    // Generate sample data (replace with actual service call)
    const alerts = [
      { id: 1, name: 'White Cotton Fabric', stock: 5, threshold: 10, status: 'critical' },
      { id: 2, name: 'Gold Thread', stock: 8, threshold: 15, status: 'low' },
      { id: 3, name: 'Red Silk Material', stock: 12, threshold: 20, status: 'low' }
    ];

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error fetching inventory alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory alerts'
    });
  }
};

/**
 * Get SEO analytics data
 */
exports.getSeo = async (req, res) => {
  try {
    // Return SEO analytics data (can be enhanced with real data later)
    const seoData = {
      pageViews: {
        total: 0,
        trend: 0,
        topPages: []
      },
      searchPerformance: {
        impressions: 0,
        clicks: 0,
        averagePosition: 0,
        ctr: 0
      },
      topKeywords: [],
      indexedPages: 0,
      crawlErrors: 0,
      mobileUsability: {
        score: 100,
        issues: []
      },
      coreWebVitals: {
        lcp: 0,
        fid: 0,
        cls: 0
      }
    };

    res.status(200).json({
      success: true,
      data: seoData
    });
  } catch (error) {
    console.error('Error fetching SEO analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO analytics'
    });
  }
};
