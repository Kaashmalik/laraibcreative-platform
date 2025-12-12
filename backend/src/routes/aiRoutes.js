/**
 * AI Routes
 * 
 * Routes for AI-powered content generation
 * All routes require admin authentication
 * 
 * @module routes/aiRoutes
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

/**
 * Apply authentication middleware to all routes
 * Only authenticated admins can access AI features
 */
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/v1/admin/ai/status
 * @desc    Check AI service configuration status
 * @access  Private (Admin)
 */
router.get('/status', aiController.getStatus);

/**
 * @route   POST /api/v1/admin/ai/generate-description
 * @desc    Generate product description from title
 * @access  Private (Admin)
 * @body    { title, category?, fabricType?, occasion? }
 */
router.post('/generate-description', aiController.generateDescription);

/**
 * @route   POST /api/v1/admin/ai/generate-keywords
 * @desc    Generate SEO keywords from product info
 * @access  Private (Admin)
 * @body    { title, description?, category?, fabricType? }
 */
router.post('/generate-keywords', aiController.generateKeywords);

/**
 * @route   POST /api/v1/admin/ai/generate-complete
 * @desc    Generate complete product content (description + keywords + SEO)
 * @access  Private (Admin)
 * @body    { title, category?, fabricType?, occasion? }
 */
router.post('/generate-complete', aiController.generateCompleteContent);

/**
 * @route   POST /api/v1/admin/ai/save-draft
 * @desc    Save AI-generated content as draft
 * @access  Private (Admin)
 * @body    { productId?, generatedContent, title }
 */
router.post('/save-draft', aiController.saveDraft);

module.exports = router;
