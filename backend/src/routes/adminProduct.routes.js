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
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

// All routes require admin authentication
router.use(protect, adminOnly);

/**
 * @route   GET /api/v1/admin/products
 * @desc    Get all products for admin (with advanced filters, search, pagination)
 * @access  Private (Admin)
 */
router.get('/', productController.getAllProductsAdmin);

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
 * @route   GET /api/v1/admin/products/export
 * @desc    Export products to CSV
 * @access  Private (Admin)
 */
router.get('/export', productController.exportProducts);

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
 * @desc    Get product for editing
 * @access  Private (Admin)
 */
router.get('/:id/edit', productController.getProductById);

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
 * @route   POST /api/v1/admin/products/:id/duplicate
 * @desc    Duplicate existing product
 * @access  Private (Admin)
 */
router.post('/:id/duplicate', productController.duplicateProduct);

module.exports = router;

