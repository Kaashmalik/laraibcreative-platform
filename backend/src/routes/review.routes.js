const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getReview,
  getRatingDistribution,
  getFeaturedReviews,
  markAsHelpful,
  unmarkAsHelpful,
  reportReview,
  getPendingReviews,
  getReportedReviews,
  getAllReviews,
  approveReview,
  rejectReview,
  toggleFeatured,
  bulkApprove,
  bulkReject,
  deleteReviewAdmin,
  getReviewStats
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * Review Routes for LaraibCreative E-Commerce Platform
 * 
 * Public routes: Getting product reviews, rating distribution
 * Customer routes: Creating, updating, voting on reviews
 * Admin routes: Moderation, approval, statistics
 * 
 * Base URL: /api/reviews
 * 
 * @module reviewRoutes
 */

// ============================================================
// VALIDATION RULES
// ============================================================

const createReviewValidation = [
  body('product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Valid order ID required if provided')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

const reportReviewValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Report reason must be between 10 and 500 characters')
];

const rejectReviewValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters')
];

const bulkApproveValidation = [
  body('reviewIds')
    .isArray({ min: 1 })
    .withMessage('Review IDs array is required'),
  body('reviewIds.*')
    .isMongoId()
    .withMessage('Each review ID must be valid')
];

const bulkRejectValidation = [
  body('reviewIds')
    .isArray({ min: 1 })
    .withMessage('Review IDs array is required'),
  body('reviewIds.*')
    .isMongoId()
    .withMessage('Each review ID must be valid'),
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Rejection reason must be between 5 and 500 characters')
];

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a product (with filtering and sorting)
 * @access  Public
 */
router.get(
  '/product/:productId',
  [
    param('productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'rating', 'helpful'])
      .withMessage('Sort by must be: createdAt, rating, or helpful'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating filter must be between 1 and 5'),
    query('verified')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Verified must be true or false')
  ],
  getProductReviews
);

/**
 * @route   GET /api/reviews/product/:productId/distribution
 * @desc    Get rating distribution for a product
 * @access  Public
 */
router.get(
  '/product/:productId/distribution',
  [
    param('productId')
      .isMongoId()
      .withMessage('Invalid product ID')
  ],
  getRatingDistribution
);

/**
 * @route   GET /api/reviews/featured
 * @desc    Get featured reviews
 * @access  Public
 */
router.get(
  '/featured',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be between 1 and 20')
  ],
  getFeaturedReviews
);

/**
 * @route   GET /api/reviews/:reviewId
 * @desc    Get single review
 * @access  Public
 */
router.get(
  '/:reviewId',
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  getReview
);

// ============================================================
// CUSTOMER ROUTES (Protected)
// ============================================================

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private (Customer)
 */
router.post('/', protect, createReviewValidation, createReview);

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update own review
 * @access  Private (Customer - own reviews only)
 */
router.put(
  '/:reviewId',
  protect,
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID'),
    ...updateReviewValidation
  ],
  updateReview
);

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete own review
 * @access  Private (Customer - own reviews only)
 */
router.delete(
  '/:reviewId',
  protect,
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  deleteReview
);

// ============================================================
// HELPFULNESS VOTING (Protected)
// ============================================================

/**
 * @route   POST /api/reviews/:reviewId/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.post(
  '/:reviewId/helpful',
  protect,
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  markAsHelpful
);

/**
 * @route   DELETE /api/reviews/:reviewId/helpful
 * @desc    Remove helpful mark from review
 * @access  Private
 */
router.delete(
  '/:reviewId/helpful',
  protect,
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  unmarkAsHelpful
);

// ============================================================
// REPORTING (Protected)
// ============================================================

/**
 * @route   POST /api/reviews/:reviewId/report
 * @desc    Report a review
 * @access  Private
 */
router.post(
  '/:reviewId/report',
  protect,
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID'),
    ...reportReviewValidation
  ],
  reportReview
);

// ============================================================
// ADMIN ROUTES (Protected - Admin Only)
// ============================================================

/**
 * @route   GET /api/reviews/admin/stats
 * @desc    Get review statistics
 * @access  Private (Admin)
 */
router.get(
  '/admin/stats',
  protect,
  authorize('admin', 'superadmin'),
  getReviewStats
);

/**
 * @route   GET /api/reviews/admin/pending
 * @desc    Get pending reviews
 * @access  Private (Admin)
 */
router.get(
  '/admin/pending',
  protect,
  authorize('admin', 'superadmin'),
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  getPendingReviews
);

/**
 * @route   GET /api/reviews/admin/reported
 * @desc    Get reported reviews
 * @access  Private (Admin)
 */
router.get(
  '/admin/reported',
  protect,
  authorize('admin', 'superadmin'),
  getReportedReviews
);

/**
 * @route   GET /api/reviews/admin/all
 * @desc    Get all reviews with filters
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  protect,
  authorize('admin', 'superadmin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected'])
      .withMessage('Status must be: pending, approved, or rejected'),
    query('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    query('verified')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Verified must be true or false'),
    query('reported')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Reported must be true or false'),
    query('featured')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Featured must be true or false')
  ],
  getAllReviews
);

/**
 * @route   PUT /api/reviews/:reviewId/approve
 * @desc    Approve review
 * @access  Private (Admin)
 */
router.put(
  '/:reviewId/approve',
  protect,
  authorize('admin', 'superadmin'),
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  approveReview
);

/**
 * @route   PUT /api/reviews/:reviewId/reject
 * @desc    Reject review
 * @access  Private (Admin)
 */
router.put(
  '/:reviewId/reject',
  protect,
  authorize('admin', 'superadmin'),
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID'),
    ...rejectReviewValidation
  ],
  rejectReview
);

/**
 * @route   PUT /api/reviews/:reviewId/featured
 * @desc    Toggle featured status
 * @access  Private (Admin)
 */
router.put(
  '/:reviewId/featured',
  protect,
  authorize('admin', 'superadmin'),
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  toggleFeatured
);

/**
 * @route   POST /api/reviews/admin/bulk-approve
 * @desc    Bulk approve reviews
 * @access  Private (Admin)
 */
router.post(
  '/admin/bulk-approve',
  protect,
  authorize('admin', 'superadmin'),
  bulkApproveValidation,
  bulkApprove
);

/**
 * @route   POST /api/reviews/admin/bulk-reject
 * @desc    Bulk reject reviews
 * @access  Private (Admin)
 */
router.post(
  '/admin/bulk-reject',
  protect,
  authorize('admin', 'superadmin'),
  bulkRejectValidation,
  bulkReject
);

/**
 * @route   DELETE /api/reviews/admin/:reviewId
 * @desc    Delete review (admin)
 * @access  Private (Admin)
 */
router.delete(
  '/admin/:reviewId',
  protect,
  authorize('admin', 'superadmin'),
  [
    param('reviewId')
      .isMongoId()
      .withMessage('Invalid review ID')
  ],
  deleteReviewAdmin
);

module.exports = router;