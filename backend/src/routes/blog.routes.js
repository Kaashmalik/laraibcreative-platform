// backend/src/routes/blog.routes.js

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Blog Routes
 * Separate public and admin routes
 */

// ==================== VALIDATION RULES ====================

const blogValidation = {
  create: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    
    body('excerpt')
      .trim()
      .notEmpty()
      .withMessage('Excerpt is required')
      .isLength({ min: 50, max: 300 })
      .withMessage('Excerpt must be between 50 and 300 characters'),
    
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 500 })
      .withMessage('Content must be at least 500 characters'),
    
    body('featuredImage')
      .trim()
      .notEmpty()
      .withMessage('Featured image is required')
      .isURL()
      .withMessage('Featured image must be a valid URL'),
    
    body('featuredImageAlt')
      .optional()
      .trim()
      .isLength({ max: 125 })
      .withMessage('Alt text should not exceed 125 characters'),
    
    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category is required')
      .isIn([
        'Stitching Tips & Tricks',
        'Fabric Guide',
        'Styling Ideas',
        'Bridal Fashion Trends',
        'Seasonal Collections',
        'Behind the Scenes',
        'Customer Stories',
        'Fashion News',
        'Care Instructions',
        'Design Inspiration'
      ])
      .withMessage('Invalid category'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with maximum 10 items'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'scheduled', 'archived'])
      .withMessage('Invalid status'),
    
    body('seo.metaTitle')
      .optional()
      .trim()
      .isLength({ max: 60 })
      .withMessage('Meta title should not exceed 60 characters'),
    
    body('seo.metaDescription')
      .optional()
      .trim()
      .isLength({ min: 120, max: 160 })
      .withMessage('Meta description should be between 120 and 160 characters'),
    
    body('relatedProducts')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Related products must be an array with maximum 5 items'),
    
    body('relatedPosts')
      .optional()
      .isArray({ max: 3 })
      .withMessage('Related posts must be an array with maximum 3 items')
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Title must be between 10 and 200 characters'),
    
    body('excerpt')
      .optional()
      .trim()
      .isLength({ min: 50, max: 300 })
      .withMessage('Excerpt must be between 50 and 300 characters'),
    
    body('content')
      .optional()
      .trim()
      .isLength({ min: 500 })
      .withMessage('Content must be at least 500 characters'),
    
    body('featuredImage')
      .optional()
      .trim()
      .isURL()
      .withMessage('Featured image must be a valid URL'),
    
    body('category')
      .optional()
      .isIn([
        'Stitching Tips & Tricks',
        'Fabric Guide',
        'Styling Ideas',
        'Bridal Fashion Trends',
        'Seasonal Collections',
        'Behind the Scenes',
        'Customer Stories',
        'Fashion News',
        'Care Instructions',
        'Design Inspiration'
      ])
      .withMessage('Invalid category'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'scheduled', 'archived'])
      .withMessage('Invalid status')
  ],

  schedule: [
    body('publishDate')
      .notEmpty()
      .withMessage('Publish date is required')
      .isISO8601()
      .withMessage('Invalid date format')
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error('Publish date must be in the future');
        }
        return true;
      })
  ],

  bulkUpdate: [
    body('ids')
      .isArray({ min: 1 })
      .withMessage('IDs array is required with at least one ID'),
    
    body('ids.*')
      .isMongoId()
      .withMessage('Invalid blog ID'),
    
    body('status')
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Invalid status')
  ],

  bulkDelete: [
    body('ids')
      .isArray({ min: 1 })
      .withMessage('IDs array is required with at least one ID'),
    
    body('ids.*')
      .isMongoId()
      .withMessage('Invalid blog ID')
  ],

  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid blog ID')
  ],

  slug: [
    param('slug')
      .trim()
      .notEmpty()
      .withMessage('Slug is required')
  ]
};

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/blogs
 * @desc    Get all published blogs with filters and pagination
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().trim(),
    query('tag').optional().trim(),
    query('search').optional().trim(),
    query('sortBy').optional().trim(),
    query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    validateRequest
  ],
  blogController.getPublishedBlogs
);

/**
 * @route   GET /api/blogs/trending
 * @desc    Get trending blog posts
 * @access  Public
 */
router.get(
  '/trending',
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    validateRequest
  ],
  blogController.getTrendingBlogs
);

/**
 * @route   GET /api/blogs/featured
 * @desc    Get featured blog posts
 * @access  Public
 */
router.get(
  '/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10'),
    validateRequest
  ],
  blogController.getFeaturedBlogs
);

/**
 * @route   GET /api/blogs/categories
 * @desc    Get all categories with post count
 * @access  Public
 */
router.get('/categories', blogController.getCategories);

/**
 * @route   GET /api/blogs/tags
 * @desc    Get all tags with usage count
 * @access  Public
 */
router.get('/tags', blogController.getTags);

/**
 * @route   GET /api/blogs/:slug
 * @desc    Get single blog post by slug
 * @access  Public
 */
router.get(
  '/:slug',
  [
    ...blogValidation.slug,
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('ipAddress').optional().trim(),
    validateRequest
  ],
  blogController.getBlogBySlug
);

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Like/unlike a blog post
 * @access  Private (Customer)
 */
router.post(
  '/:id/like',
  protect,
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.toggleLike
);

/**
 * @route   POST /api/blogs/:id/share
 * @desc    Increment share count
 * @access  Public
 */
router.post(
  '/:id/share',
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.incrementShare
);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/admin/blogs
 * @desc    Get all blogs for admin (including drafts)
 * @access  Private (Admin)
 */
router.get(
  '/admin/all',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'published', 'scheduled', 'archived']).withMessage('Invalid status'),
    query('category').optional().trim(),
    query('author').optional().isMongoId().withMessage('Invalid author ID'),
    query('search').optional().trim(),
    query('sortBy').optional().trim(),
    validateRequest
  ],
  blogController.getAllBlogsAdmin
);

/**
 * @route   GET /api/admin/blogs/:id
 * @desc    Get single blog by ID for admin
 * @access  Private (Admin)
 */
router.get(
  '/admin/:id',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.getBlogByIdAdmin
);

/**
 * @route   POST /api/admin/blogs
 * @desc    Create new blog post
 * @access  Private (Admin)
 */
router.post(
  '/admin',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.create,
    validateRequest
  ],
  blogController.createBlog
);

/**
 * @route   PUT /api/admin/blogs/:id
 * @desc    Update blog post
 * @access  Private (Admin)
 */
router.put(
  '/admin/:id',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    ...blogValidation.update,
    validateRequest
  ],
  blogController.updateBlog
);

/**
 * @route   DELETE /api/admin/blogs/:id
 * @desc    Delete blog post
 * @access  Private (Admin)
 */
router.delete(
  '/admin/:id',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.deleteBlog
);

/**
 * @route   PATCH /api/admin/blogs/:id/publish
 * @desc    Publish blog post
 * @access  Private (Admin)
 */
router.patch(
  '/admin/:id/publish',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.publishBlog
);

/**
 * @route   PATCH /api/admin/blogs/:id/schedule
 * @desc    Schedule blog post
 * @access  Private (Admin)
 */
router.patch(
  '/admin/:id/schedule',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    ...blogValidation.schedule,
    validateRequest
  ],
  blogController.scheduleBlog
);

/**
 * @route   PATCH /api/admin/blogs/:id/archive
 * @desc    Archive blog post
 * @access  Private (Admin)
 */
router.patch(
  '/admin/:id/archive',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.archiveBlog
);

/**
 * @route   PATCH /api/admin/blogs/bulk-update
 * @desc    Bulk update blog status
 * @access  Private (Admin)
 */
router.patch(
  '/admin/bulk-update',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.bulkUpdate,
    validateRequest
  ],
  blogController.bulkUpdateStatus
);

/**
 * @route   DELETE /api/admin/blogs/bulk-delete
 * @desc    Bulk delete blogs
 * @access  Private (Admin)
 */
router.delete(
  '/admin/bulk-delete',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.bulkDelete,
    validateRequest
  ],
  blogController.bulkDelete
);

/**
 * @route   GET /api/admin/blogs/:id/analytics
 * @desc    Get blog analytics
 * @access  Private (Admin)
 */
router.get(
  '/admin/:id/analytics',
  protect,
  restrictTo('admin', 'superadmin'),
  [
    ...blogValidation.mongoId,
    validateRequest
  ],
  blogController.getBlogAnalytics
);

/**
 * @route   GET /api/admin/blogs/scheduled/due
 * @desc    Get posts scheduled for publication (for cron jobs)
 * @access  Private (Admin/System)
 */
router.get(
  '/admin/scheduled/due',
  protect,
  restrictTo('admin', 'superadmin'),
  blogController.getScheduledPosts
);

module.exports = router;