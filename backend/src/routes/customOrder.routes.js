/**
 * Custom Order Routes
 * Routes for custom order submission and image uploads
 * 
 * @module routes/customOrder.routes
 */

const express = require('express');
const router = express.Router();
const customOrderController = require('../controllers/customOrderController');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

/**
 * @route POST /api/v1/orders/custom/upload-images
 * @desc Upload reference images for custom order
 * @access Public (or Private if user is logged in)
 */
router.post(
  '/upload-images',
  optionalAuth,
  uploadMultiple('images', 6, 'reference'), // field name, max files, upload type
  customOrderController.uploadReferenceImages
);

/**
 * @route POST /api/v1/orders/custom
 * @desc Submit custom order
 * @access Public (or Private if user is logged in)
 */
router.post(
  '/',
  optionalAuth,
  customOrderController.submitCustomOrder
);

/**
 * @route GET /api/v1/orders/custom/:id
 * @desc Get custom order by ID
 * @access Private
 */
router.get(
  '/:id',
  protect,
  customOrderController.getCustomOrder
);

module.exports = router;

