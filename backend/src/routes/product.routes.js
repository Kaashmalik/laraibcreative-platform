/**
 * Product Routes (Public)
 * Handles all public product-related API endpoints
 * 
 * Public Routes:
 * - GET /api/v1/products - Get all products (with filters)
 * - GET /api/v1/products/:id - Get product by ID
 * - GET /api/v1/products/slug/:slug - Get product by slug
 * 
 * Note: Admin routes are in adminProduct.routes.js
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  cacheProducts,
  cacheProductById,
  cacheProductBySlug,
  cacheFeaturedProducts,
  cacheNewArrivals,
  cacheBestSellers,
} = require('../middleware/cache.middleware');

// ============================================
// PUBLIC ROUTES (with caching)
// ============================================

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters, search, and pagination
 * @access  Public
 */
router.get('/', cacheProducts, productController.getAllProducts);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', cacheFeaturedProducts, productController.getFeaturedProducts);

/**
 * @route   GET /api/v1/products/new-arrivals
 * @desc    Get new arrival products
 * @access  Public
 */
router.get('/new-arrivals', cacheNewArrivals, productController.getNewArrivals);

/**
 * @route   GET /api/v1/products/best-sellers
 * @desc    Get best seller products
 * @access  Public
 */
router.get('/best-sellers', cacheBestSellers, productController.getBestSellers);

/**
 * @route   GET /api/v1/products/slug/:slug
 * @desc    Get product by SEO-friendly slug
 * @access  Public
 */
router.get('/slug/:slug', cacheProductBySlug, productController.getProductBySlug);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', productController.getProductById);

/**
 * @route   GET /api/v1/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * @route   POST /api/v1/products/:id/view
 * @desc    Increment product view count
 * @access  Public
 */
router.post('/:id/view', productController.incrementViews);

module.exports = router;
