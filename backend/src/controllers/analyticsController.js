// ==========================================
// ANALYTICS CONTROLLER
// ==========================================
// Handles analytics and reporting endpoints
// ==========================================

const analyticsService = require('../services/analyticsService');
const { adminOnly } = require('../middleware/auth.middleware');

/**
 * Get dashboard statistics
 * @route GET /api/v1/analytics/dashboard
 * @access Private (Admin)
 */
exports.getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const result = await analyticsService.getDashboardStats(dateRange);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get sales report
 * @route GET /api/v1/analytics/sales
 * @access Private (Admin)
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const result = await analyticsService.getSalesReport(period, dateRange);

    res.status(200).json({
      success: true,
      message: 'Sales report generated successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getSalesReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get customer analytics report
 * @route GET /api/v1/analytics/customers
 * @access Private (Admin)
 */
exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const result = await analyticsService.getCustomerReport(dateRange);

    res.status(200).json({
      success: true,
      message: 'Customer report generated successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getCustomerReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get product performance report
 * @route GET /api/v1/analytics/products
 * @access Private (Admin)
 */
exports.getProductReport = async (req, res) => {
  try {
    const { startDate, endDate, limit, sortBy } = req.query;
    
    const options = {
      dateRange: {},
      limit: limit ? parseInt(limit) : 20,
      sortBy: sortBy || 'revenue'
    };
    
    if (startDate) options.dateRange.startDate = startDate;
    if (endDate) options.dateRange.endDate = endDate;

    const result = await analyticsService.getProductReport(options);

    res.status(200).json({
      success: true,
      message: 'Product report generated successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getProductReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate product report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get conversion funnel data
 * @route GET /api/v1/analytics/funnel
 * @access Private (Admin)
 */
exports.getConversionFunnel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const result = await analyticsService.getConversionFunnel(dateRange);

    res.status(200).json({
      success: true,
      message: 'Conversion funnel data retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getConversionFunnel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversion funnel data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

