/**
 * Product Routes
 * Defines all product-related API endpoints
 * 
 * Public routes: Browse, search, view products
 * Protected routes: Create, update, delete (Admin only)
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { validateProduct, validateProductUpdate } = require('../middleware/validate.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering, search, pagination
 * @access  Public
 * @query   page, limit, sort, search, category, fabric, minPrice, maxPrice, etc.
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 * @query   limit (default: 8)
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/products/search/autocomplete
 * @desc    Get search suggestions
 * @access  Public
 * @query   q (search query), limit (default: 5)
 */
router.get('/search/autocomplete', productController.searchAutocomplete);

/**
 * @route   GET /api/products/slug/:slug
 * @desc    Get single product by slug (SEO-friendly)
 * @access  Public
 * @param   slug - Product slug
 */
router.get('/slug/:slug', productController.getProductBySlug);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 * @param   id - Product ObjectId
 */
router.get('/:id', productController.getProductById);

/**
 * @route   GET /api/products/:id/related
 * @desc    Get related products
 * @access  Public
 * @param   id - Product ObjectId
 * @query   limit (default: 6)
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * @route   POST /api/products/:id/view
 * @desc    Increment product view count
 * @access  Public
 * @param   id - Product ObjectId
 */
router.post('/:id/view', productController.incrementViews);

// ============================================
// PROTECTED ROUTES (Admin Only)
// ============================================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private/Admin
 * @body    title, description, category, pricing, fabric, images (files)
 */
router.post(
  '/',
  protect,
  adminOnly,
  uploadMultiple('images', 10), // Max 10 images
  validateProduct,
  productController.createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private/Admin
 * @param   id - Product ObjectId
 * @body    Any product fields to update
 */
router.put(
  '/:id',
  protect,
  adminOnly,
  uploadMultiple('images', 10),
  validateProductUpdate,
  productController.updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private/Admin
 * @param   id - Product ObjectId
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  productController.deleteProduct
);

/**
 * @route   DELETE /api/products/:id/image
 * @desc    Delete specific image from product
 * @access  Private/Admin
 * @param   id - Product ObjectId
 * @body    imageUrl - URL of image to delete
 */
router.delete(
  '/:id/image',
  protect,
  adminOnly,
  productController.deleteProductImage
);

module.exports = router;