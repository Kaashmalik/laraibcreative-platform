const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

/**
 * Review Controller for LaraibCreative E-Commerce Platform
 * 
 * Handles all review-related operations including:
 * - Creating and managing product reviews
 * - Moderation (approve/reject)
 * - Helpfulness voting
 * - Reporting inappropriate reviews
 * - Review statistics and filtering
 * 
 * @module reviewController
 */

// ============================================================
// CUSTOMER REVIEW OPERATIONS
// ============================================================

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
exports.createReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { product, rating, title, comment, images, orderId } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if customer can review this product
  const canReview = await Review.canReview(req.user._id, product);
  if (!canReview.canReview) {
    res.status(400);
    throw new Error(canReview.reason);
  }

  // Hash IP address for privacy
  const ipAddress = req.ip || req.connection.remoteAddress;
  const ipAddressHash = crypto
    .createHash('sha256')
    .update(ipAddress)
    .digest('hex');

  // Create review
  const review = await Review.create({
    product,
    customer: req.user._id,
    order: orderId || canReview.orderId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: canReview.isVerifiedPurchase,
    customerName: req.user.fullName,
    ipAddressHash,
    userAgent: req.get('user-agent')
  });

  const populatedReview = await Review.findById(review._id)
    .populate('customer', 'fullName profileImage')
    .populate('product', 'title sku');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully and is pending approval',
    data: populatedReview
  });
});

/**
 * @desc    Update own review
 * @route   PUT /api/reviews/:reviewId
 * @access  Private (Customer - own reviews only)
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const review = await Review.findOne({
    _id: req.params.reviewId,
    customer: req.user._id
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found or unauthorized');
  }

  // Only allow editing pending or approved reviews
  if (review.status === 'rejected') {
    res.status(400);
    throw new Error('Cannot edit rejected reviews');
  }

  const { rating, title, comment, images } = req.body;

  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;
  if (images) review.images = images;

  // Reset status to pending if it was approved
  if (review.status === 'approved') {
    review.status = 'pending';
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review updated successfully and is pending re-approval',
    data: review
  });
});

/**
 * @desc    Delete own review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (Customer - own reviews only)
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    customer: req.user._id
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found or unauthorized');
  }

  await review.remove();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// ============================================================
// PUBLIC REVIEW QUERIES
// ============================================================

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    rating,
    verified
  } = req.query;

  const result = await Review.getProductReviews(productId, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
    rating,
    verified
  });

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:reviewId
 * @access  Public
 */
exports.getReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.reviewId,
    status: 'approved'
  })
    .populate('customer', 'fullName profileImage')
    .populate('product', 'title sku images')
    .lean();

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

/**
 * @desc    Get rating distribution for a product
 * @route   GET /api/reviews/product/:productId/distribution
 * @access  Public
 */
exports.getRatingDistribution = asyncHandler(async (req, res) => {
  const distribution = await Review.getRatingDistribution(req.params.productId);

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  res.status(200).json({
    success: true,
    data: {
      distribution,
      total,
      percentages: {
        5: total > 0 ? ((distribution[5] / total) * 100).toFixed(1) : 0,
        4: total > 0 ? ((distribution[4] / total) * 100).toFixed(1) : 0,
        3: total > 0 ? ((distribution[3] / total) * 100).toFixed(1) : 0,
        2: total > 0 ? ((distribution[2] / total) * 100).toFixed(1) : 0,
        1: total > 0 ? ((distribution[1] / total) * 100).toFixed(1) : 0
      }
    }
  });
});

/**
 * @desc    Get featured reviews
 * @route   GET /api/reviews/featured
 * @access  Public
 */
exports.getFeaturedReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const reviews = await Review.find()
    .featured()
    .sort({ helpfulCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('customer', 'fullName profileImage')
    .populate('product', 'title images.thumbnail')
    .lean();

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// ============================================================
// HELPFULNESS VOTING
// ============================================================

/**
 * @desc    Mark review as helpful
 * @route   POST /api/reviews/:reviewId/helpful
 * @access  Private
 */
exports.markAsHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.status !== 'approved') {
    res.status(400);
    throw new Error('Cannot vote on non-approved reviews');
  }

  try {
    await review.markAsHelpful(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulCount
      }
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Remove helpful mark from review
 * @route   DELETE /api/reviews/:reviewId/helpful
 * @access  Private
 */
exports.unmarkAsHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  try {
    await review.unmarkAsHelpful(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Helpful mark removed',
      data: {
        helpfulCount: review.helpfulCount
      }
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ============================================================
// REPORTING REVIEWS
// ============================================================

/**
 * @desc    Report a review
 * @route   POST /api/reviews/:reviewId/report
 * @access  Private
 */
exports.reportReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    res.status(400);
    throw new Error('Report reason is required');
  }

  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Don't allow reporting own reviews
  if (review.customer.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot report your own review');
  }

  await review.report(reason);

  res.status(200).json({
    success: true,
    message: 'Review reported successfully. Our team will review it.'
  });
});

// ============================================================
// ADMIN MODERATION
// ============================================================

/**
 * @desc    Get pending reviews (Admin)
 * @route   GET /api/reviews/admin/pending
 * @access  Private (Admin)
 */
exports.getPendingReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const reviews = await Review.getPendingReviews(limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

/**
 * @desc    Get reported reviews (Admin)
 * @route   GET /api/reviews/admin/reported
 * @access  Private (Admin)
 */
exports.getReportedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.getReportedReviews();

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

/**
 * @desc    Get all reviews with filters (Admin)
 * @route   GET /api/reviews/admin/all
 * @access  Private (Admin)
 */
exports.getAllReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Apply filters
  if (req.query.status) query.status = req.query.status;
  if (req.query.rating) query.rating = parseInt(req.query.rating);
  if (req.query.verified === 'true') query.isVerifiedPurchase = true;
  if (req.query.reported === 'true') query.isReported = true;
  if (req.query.featured === 'true') query.isFeatured = true;

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customer', 'fullName email')
      .populate('product', 'title sku images.thumbnail')
      .populate('moderatedBy', 'fullName')
      .select('+moderationNote')
      .lean(),
    Review.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    },
    data: reviews
  });
});

/**
 * @desc    Approve review (Admin)
 * @route   PUT /api/reviews/:reviewId/approve
 * @access  Private (Admin)
 */
exports.approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.status === 'approved') {
    res.status(400);
    throw new Error('Review is already approved');
  }

  await review.approve(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Review approved successfully',
    data: review
  });
});

/**
 * @desc    Reject review (Admin)
 * @route   PUT /api/reviews/:reviewId/reject
 * @access  Private (Admin)
 */
exports.rejectReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length === 0) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }

  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.status === 'rejected') {
    res.status(400);
    throw new Error('Review is already rejected');
  }

  await review.reject(req.user._id, reason);

  res.status(200).json({
    success: true,
    message: 'Review rejected successfully',
    data: review
  });
});

/**
 * @desc    Toggle featured status (Admin)
 * @route   PUT /api/reviews/:reviewId/featured
 * @access  Private (Admin)
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.status !== 'approved') {
    res.status(400);
    throw new Error('Only approved reviews can be featured');
  }

  review.isFeatured = !review.isFeatured;
  await review.save();

  res.status(200).json({
    success: true,
    message: `Review ${review.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    data: {
      isFeatured: review.isFeatured
    }
  });
});

/**
 * @desc    Bulk approve reviews (Admin)
 * @route   POST /api/reviews/admin/bulk-approve
 * @access  Private (Admin)
 */
exports.bulkApprove = asyncHandler(async (req, res) => {
  const { reviewIds } = req.body;

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    res.status(400);
    throw new Error('Review IDs array is required');
  }

  const results = await Promise.allSettled(
    reviewIds.map(async (reviewId) => {
      const review = await Review.findById(reviewId);
      if (review && review.status !== 'approved') {
        return review.approve(req.user._id);
      }
      return null;
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

  res.status(200).json({
    success: true,
    message: `${successful} reviews approved successfully`,
    data: {
      total: reviewIds.length,
      successful,
      failed: reviewIds.length - successful
    }
  });
});

/**
 * @desc    Bulk reject reviews (Admin)
 * @route   POST /api/reviews/admin/bulk-reject
 * @access  Private (Admin)
 */
exports.bulkReject = asyncHandler(async (req, res) => {
  const { reviewIds, reason } = req.body;

  if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
    res.status(400);
    throw new Error('Review IDs array is required');
  }

  if (!reason || reason.trim().length === 0) {
    res.status(400);
    throw new Error('Rejection reason is required');
  }

  const results = await Promise.allSettled(
    reviewIds.map(async (reviewId) => {
      const review = await Review.findById(reviewId);
      if (review && review.status !== 'rejected') {
        return review.reject(req.user._id, reason);
      }
      return null;
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;

  res.status(200).json({
    success: true,
    message: `${successful} reviews rejected successfully`,
    data: {
      total: reviewIds.length,
      successful,
      failed: reviewIds.length - successful
    }
  });
});

/**
 * @desc    Delete review (Admin)
 * @route   DELETE /api/reviews/admin/:reviewId
 * @access  Private (Admin)
 */
exports.deleteReviewAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await review.remove();

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// ============================================================
// STATISTICS
// ============================================================

/**
 * @desc    Get review statistics (Admin)
 * @route   GET /api/reviews/admin/stats
 * @access  Private (Admin)
 */
exports.getReviewStats = asyncHandler(async (req, res) => {
  const [
    total,
    pending,
    approved,
    rejected,
    reported,
    featured,
    verifiedPurchase,
    withImages
  ] = await Promise.all([
    Review.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    Review.countDocuments({ status: 'approved' }),
    Review.countDocuments({ status: 'rejected' }),
    Review.countDocuments({ isReported: true }),
    Review.countDocuments({ isFeatured: true }),
    Review.countDocuments({ isVerifiedPurchase: true, status: 'approved' }),
    Review.countDocuments({ 'images.0': { $exists: true }, status: 'approved' })
  ]);

  // Average rating across all approved reviews
  const ratingStats = await Review.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalHelpfulVotes: { $sum: '$helpfulCount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      byStatus: {
        pending,
        approved,
        rejected
      },
      flags: {
        reported,
        featured
      },
      quality: {
        verifiedPurchase,
        withImages,
        averageRating: ratingStats[0]?.averageRating.toFixed(2) || 0,
        totalHelpfulVotes: ratingStats[0]?.totalHelpfulVotes || 0
      }
    }
  });
});

module.exports = exports;