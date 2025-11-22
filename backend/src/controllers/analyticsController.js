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
