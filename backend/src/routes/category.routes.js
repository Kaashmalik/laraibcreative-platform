/**
 * Category Routes
 * Handles all category management endpoints
 * 
 * Public routes: GET operations
 * Admin routes: POST, PUT, DELETE operations
 * Mounted at: /api/v1/categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// ==================== ADMIN ROUTES ====================

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post(
  '/',
  protect,
  adminOnly,
  uploadSingle('image'),
  categoryController.createCategory
);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadSingle('image'),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;
