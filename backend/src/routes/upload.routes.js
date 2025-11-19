// backend/src/routes/upload.routes.js
// ==========================================
// UPLOAD ROUTES
// ==========================================
// Defines all upload-related API endpoints with authentication and rate limiting
// ==========================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

// Middleware
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const {
  uploadSingle,
  uploadMultiple,
  uploadFields
} = require('../middleware/upload.middleware');

// Controllers
const {
  uploadSingle: uploadSingleController,
  uploadMultiple: uploadMultipleController,
  uploadProductImages,
  uploadReferenceImages,
  uploadPaymentReceipt,
  uploadBlogImage,
  uploadAvatar,
  deleteUploadedImage,
  deleteMultipleUploadedImages,
  getUploadStats
} = require('../controllers/uploadController');

// ==========================================
// RATE LIMITING
// ==========================================

// General upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes
  message: {
    success: false,
    message: 'Too many upload requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for avatar uploads
const avatarLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 avatar uploads per hour
  message: {
    success: false,
    message: 'Too many avatar upload attempts. Please try again later.'
  }
});

// ==========================================
// ROUTES
// ==========================================

/**
 * @route   POST /api/upload/single
 * @desc    Upload single file (generic)
 * @access  Private
 */
router.post(
  '/single',
  protect,
  uploadLimiter,
  uploadSingle('file', 'product'),
  uploadSingleController
);

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files (generic)
 * @access  Private
 */
router.post(
  '/multiple',
  protect,
  uploadLimiter,
  uploadMultiple('files', 10, 'product'),
  uploadMultipleController
);

/**
 * @route   POST /api/upload/product
 * @desc    Upload product images with metadata
 * @access  Private/Admin
 */
router.post(
  '/product',
  protect,
  admin,
  uploadLimiter,
  uploadMultiple('images', 10, 'product'),
  uploadProductImages
);

/**
 * @route   POST /api/upload/reference
 * @desc    Upload reference images for custom orders
 * @access  Private
 */
router.post(
  '/reference',
  protect,
  uploadLimiter,
  uploadMultiple('images', 5, 'reference'),
  uploadReferenceImages
);

/**
 * @route   POST /api/upload/receipt
 * @desc    Upload payment receipt (image or PDF)
 * @access  Private
 */
router.post(
  '/receipt',
  protect,
  uploadLimiter,
  uploadSingle('receipt', 'receipt'),
  uploadPaymentReceipt
);

/**
 * @route   POST /api/upload/blog
 * @desc    Upload blog post image
 * @access  Private/Admin
 */
router.post(
  '/blog',
  protect,
  admin,
  uploadLimiter,
  uploadSingle('image', 'blog'),
  uploadBlogImage
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload user avatar/profile picture
 * @access  Private
 */
router.post(
  '/avatar',
  protect,
  avatarLimiter,
  uploadSingle('avatar', 'avatar'),
  uploadAvatar
);

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete single image from Cloudinary
 * @access  Private
 * @note    publicId should be URL encoded
 */
router.delete(
  '/:publicId',
  protect,
  deleteUploadedImage
);

/**
 * @route   POST /api/upload/delete-multiple
 * @desc    Delete multiple images from Cloudinary
 * @access  Private/Admin
 */
router.post(
  '/delete-multiple',
  protect,
  admin,
  deleteMultipleUploadedImages
);

/**
 * @route   GET /api/upload/stats
 * @desc    Get upload statistics (Cloudinary usage)
 * @access  Private/Admin
 */
router.get(
  '/stats',
  protect,
  admin,
  getUploadStats
);

// ==========================================
// ERROR HANDLING FOR MULTER
// ==========================================

// Handle Multer errors globally
router.use((error, req, res, next) => {
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message
    });
  }
  
  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Unknown error occurred during upload'
    });
  }
  
  next();
});

module.exports = router;