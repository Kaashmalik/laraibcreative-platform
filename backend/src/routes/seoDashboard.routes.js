/**
 * SEO Dashboard Routes
 * Routes for SEO analytics, AI content generation dashboard, and optimization
 * Mounted at: /api/v1/admin/seo
 * 
 * @module routes/seoDashboard.routes
 */

const express = require('express');
const router = express.Router();
const seoDashboardController = require('../controllers/seoDashboardController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route   GET /api/v1/admin/seo/dashboard
 * @desc    Get SEO dashboard overview with metrics
 * @access  Private (Admin)
 */
router.get('/dashboard', seoDashboardController.getDashboardOverview);

/**
 * @route   GET /api/v1/admin/seo/products-analysis
 * @desc    Get SEO analysis for all products
 * @access  Private (Admin)
 */
router.get('/products-analysis', seoDashboardController.getProductsSEOAnalysis);

/**
 * @route   GET /api/v1/admin/seo/products/:id/analysis
 * @desc    Get detailed SEO analysis for a specific product
 * @access  Private (Admin)
 */
router.get('/products/:id/analysis', seoDashboardController.getProductSEODetail);

/**
 * @route   POST /api/v1/admin/seo/products/:id/optimize
 * @desc    Generate and apply AI-optimized SEO content for a product
 * @access  Private (Admin)
 */
router.post('/products/:id/optimize', seoDashboardController.optimizeProductSEO);

/**
 * @route   POST /api/v1/admin/seo/bulk-optimize
 * @desc    Bulk optimize multiple products with AI
 * @access  Private (Admin)
 */
router.post('/bulk-optimize', seoDashboardController.bulkOptimizeSEO);

/**
 * @route   GET /api/v1/admin/seo/content-history
 * @desc    Get AI content generation history
 * @access  Private (Admin)
 */
router.get('/content-history', seoDashboardController.getContentHistory);

/**
 * @route   GET /api/v1/admin/seo/keywords-performance
 * @desc    Get keywords performance analytics
 * @access  Private (Admin)
 */
router.get('/keywords-performance', seoDashboardController.getKeywordsPerformance);

/**
 * @route   POST /api/v1/admin/seo/analyze-content
 * @desc    Analyze content quality and SEO score
 * @access  Private (Admin)
 */
router.post('/analyze-content', seoDashboardController.analyzeContent);

/**
 * @route   GET /api/v1/admin/seo/suggestions
 * @desc    Get AI-powered SEO improvement suggestions
 * @access  Private (Admin)
 */
router.get('/suggestions', seoDashboardController.getSEOSuggestions);

/**
 * @route   GET /api/v1/admin/seo/ai-usage
 * @desc    Get AI service usage statistics
 * @access  Private (Admin)
 */
router.get('/ai-usage', seoDashboardController.getAIUsageStats);

module.exports = router;
