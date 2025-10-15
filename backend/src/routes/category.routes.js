/**
 * Category Routes
 * Defines all category-related API endpoints
 * 
 * Public routes: Browse categories, view category products
 * Protected routes: Create, update, delete (Admin only)
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { validateCategory } = require('../middleware/validate.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 * @query   includeInactive (default: false), includeProductCount (default: true)
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/categories/hierarchy
 * @desc    Get categories in hierarchical structure
 * @access  Public
 */
router.get('/hierarchy', categoryController.getCategoryHierarchy);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 * @param   slug - Category slug
 */
router.get('/slug/:slug', categoryController.getCategoryBySlug);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID
 * @access  Public
 * @param   id - Category ObjectId
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @route   GET /api/categories/:id/products
 * @desc    Get products in a category
 * @access  Public
 * @param   id - Category ObjectId
 * @query   page, limit, sort
 */
router.get('/:id/products', categoryController.getCategoryProducts);

// ============================================
// PROTECTED ROUTES (Admin Only)
// ============================================

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private/Admin
 * @body    name, description, parentCategory, image (file), displayOrder, isActive
 */
router.post(
  '/',
  protect,
  adminOnly,
  uploadSingle('image', 'product'),
  validateCategory,
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 * @param   id - Category ObjectId
 * @body    Any category fields to update
 */
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadSingle('image', 'product'),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 * @param   id - Category ObjectId
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;