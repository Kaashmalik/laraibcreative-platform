/**
 * Admin Product Routes
 * Handles all admin product management endpoints
 * 
 * All routes require admin authentication
 * Mounted at: /api/v1/admin/products
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

// All routes require admin authentication
router.use(authenticate, adminOnly);

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products for admin (with advanced filters, search, pagination)
 * @access  Private (Admin)
 */
router.get('/', productController.getAllProductsAdmin);

/**
 * @route   POST /api/v1/admin/products
 * @desc    Create new product
 * @access  Private (Admin)
 */
router.post(
  '/',
  uploadMultiple('images', 10), // Max 10 images
  productController.createProductAdmin
);

/**
 * @route   GET /api/v1/admin/products/:id/edit
const { protect, adminOnly } = require('../middleware/auth.middleware');
 * @access  Private (Admin)
 */
router.use(protect, adminOnly);

/**
 * @route   PUT /api/v1/admin/products/:id
 * @desc    Update existing product
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  uploadMultiple('images', 10),
  productController.updateProductAdmin
);

/**
 * @route   DELETE /api/v1/admin/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete('/:id', productController.deleteProductAdmin);

/**
 * @route   DELETE /api/v1/admin/products/bulk-delete
 * @desc    Bulk delete products
 * @access  Private (Admin)
 */
router.delete('/bulk-delete', productController.bulkDeleteProducts);

/**
 * @route   PATCH /api/v1/admin/products/bulk-update
 * @desc    Bulk update products
 * @access  Private (Admin)
 */
router.patch('/bulk-update', productController.bulkUpdateProducts);

/**
 * @route   POST /api/v1/admin/products/:id/duplicate
 * @desc    Duplicate existing product
 * @access  Private (Admin)
 */
router.post('/:id/duplicate', productController.duplicateProduct);

/**
 * @route   GET /api/v1/admin/products/export
 * @desc    Export products to CSV
 * @access  Private (Admin)
 */
router.get('/export', productController.exportProducts);

module.exports = router;

