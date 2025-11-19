// backend/src/controllers/blogController.js

const Blog = require('../models/Blog');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Blog Controller
 * Handles all blog-related operations for both admin and customer
 */

// ==================== CUSTOMER ENDPOINTS ====================

/**
 * @desc    Get all published blog posts (with pagination and filters)
 * @route   GET /api/blogs
 * @access  Public
 */
exports.getPublishedBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      sortBy = '-publishedAt',
      featured
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Handle search
    let blogs;
    let total;

    if (search) {
      // Use text search
      blogs = await Blog.find(
        {
          ...query,
          $text: { $search: search }
        },
        { score: { $meta: 'textScore' } }
      )
        .populate('author', 'fullName profileImage')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limitNum)
        .select('-content -adminNotes -viewedBy -likedBy');

      total = await Blog.countDocuments({
        ...query,
        $text: { $search: search }
      });
    } else {
      // Regular query
      blogs = await Blog.find(query)
        .populate('author', 'fullName profileImage')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .select('-content -adminNotes -viewedBy -likedBy');

      total = await Blog.countDocuments(query);
    }

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalBlogs: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single published blog post by slug
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId, ipAddress } = req.query; // Optional tracking

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'fullName profileImage bio')
      .populate('relatedProducts', 'title slug price images category')
      .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt readTime');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count (track unique views)
    const identifier = userId || ipAddress;
    if (identifier) {
      await blog.incrementView(identifier);
    } else {
      blog.views += 1;
      await blog.save();
    }

    // Get related posts if not manually set
    let relatedPosts = blog.relatedPosts;
    if (!relatedPosts || relatedPosts.length === 0) {
      relatedPosts = await blog.getRelatedPosts(3);
    }

    res.status(200).json({
      success: true,
      data: {
        blog,
        relatedPosts
      }
    });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Get trending blog posts
 * @route   GET /api/blogs/trending
 * @access  Public
 */
exports.getTrendingBlogs = async (req, res) => {
  try {
    const { limit = 5, days = 30 } = req.query;

    const trending = await Blog.getTrending(parseInt(limit), parseInt(days));

    res.status(200).json({
      success: true,
      data: trending
    });
  } catch (error) {
    console.error('Error fetching trending blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured blog posts
 * @route   GET /api/blogs/featured
 * @access  Public
 */
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const featured = await Blog.find({
      status: 'published',
      isFeatured: true
    })
      .populate('author', 'fullName profileImage')
      .sort({ displayOrder: -1, publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-content -adminNotes -viewedBy -likedBy');

    res.status(200).json({
      success: true,
      data: featured
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get all categories with post count
 * @route   GET /api/blogs/categories
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Blog.getPopularCategories();

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * @desc    Get all tags with usage count
 * @route   GET /api/blogs/tags
 * @access  Public
 */
exports.getTags = async (req, res) => {
  try {
    const tags = await Blog.getAllTags();

    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
};

/**
 * @desc    Like/Unlike a blog post
 * @route   POST /api/blogs/:id/like
 * @access  Private (Customer)
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const result = await blog.toggleLike(userId);

    res.status(200).json({
      success: true,
      data: result,
      message: result.liked ? 'Post liked' : 'Post unliked'
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update like',
      error: error.message
    });
  }
};

/**
 * @desc    Increment share count
 * @route   POST /api/blogs/:id/share
 * @access  Public
 */
exports.incrementShare = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.incrementShare();

    res.status(200).json({
      success: true,
      data: { shares: blog.shares },
      message: 'Share count updated'
    });
  } catch (error) {
    console.error('Error incrementing share:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update share count',
      error: error.message
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * @desc    Get all blogs for admin (including drafts)
 * @route   GET /api/admin/blogs
 * @access  Private (Admin)
 */
exports.getAllBlogsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      author,
      search,
      sortBy = '-createdAt'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    // Handle search
    let blogs;
    let total;

    if (search) {
      blogs = await Blog.find({
        ...query,
        $text: { $search: search }
      })
        .populate('author', 'fullName email profileImage')
        .populate('lastEditedBy', 'fullName')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .select('-content'); // Exclude content for list view

      total = await Blog.countDocuments({
        ...query,
        $text: { $search: search }
      });
    } else {
      blogs = await Blog.find(query)
        .populate('author', 'fullName email profileImage')
        .populate('lastEditedBy', 'fullName')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .select('-content');

      total = await Blog.countDocuments(query);
    }

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalBlogs: total,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get single blog by ID for admin
 * @route   GET /api/admin/blogs/:id
 * @access  Private (Admin)
 */
exports.getBlogByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id)
      .populate('author', 'fullName email profileImage')
      .populate('lastEditedBy', 'fullName email')
      .populate('relatedProducts', 'title slug price images')
      .populate('relatedPosts', 'title slug excerpt featuredImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Create new blog post
 * @route   POST /api/admin/blogs
 * @access  Private (Admin)
 */
exports.createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id,
      authorName: req.user.fullName
    };

    // Validate required fields
    const requiredFields = ['title', 'excerpt', 'content', 'category', 'featuredImage'];
    const missingFields = requiredFields.filter(field => !blogData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate related products if provided
    if (blogData.relatedProducts && blogData.relatedProducts.length > 0) {
      const validProducts = await Product.countDocuments({
        _id: { $in: blogData.relatedProducts }
      });
      
      if (validProducts !== blogData.relatedProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related products are invalid'
        });
      }
    }

    // Validate related posts if provided
    if (blogData.relatedPosts && blogData.relatedPosts.length > 0) {
      const validPosts = await Blog.countDocuments({
        _id: { $in: blogData.relatedPosts }
      });
      
      if (validPosts !== blogData.relatedPosts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related posts are invalid'
        });
      }
    }

    const blog = await Blog.create(blogData);

    // Populate for response
    await blog.populate([
      { path: 'author', select: 'fullName email profileImage' },
      { path: 'relatedProducts', select: 'title slug price images' },
      { path: 'relatedPosts', select: 'title slug excerpt featuredImage' }
    ]);

    res.status(201).json({
      success: true,
      data: blog,
      message: 'Blog post created successfully'
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Update blog post
 * @route   PUT /api/admin/blogs/:id
 * @access  Private (Admin)
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Validate related products if provided
    if (req.body.relatedProducts) {
      const validProducts = await Product.countDocuments({
        _id: { $in: req.body.relatedProducts }
      });
      
      if (validProducts !== req.body.relatedProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related products are invalid'
        });
      }
    }

    // Validate related posts if provided
    if (req.body.relatedPosts) {
      // Remove self from related posts
      const relatedPosts = req.body.relatedPosts.filter(
        postId => postId.toString() !== id
      );
      
      const validPosts = await Blog.countDocuments({
        _id: { $in: relatedPosts }
      });
      
      if (validPosts !== relatedPosts.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more related posts are invalid'
        });
      }
      
      req.body.relatedPosts = relatedPosts;
    }

    // Update lastEditedBy
    req.body.lastEditedBy = req.user._id;

    // Update blog
    Object.assign(blog, req.body);
    await blog.save();

    // Populate for response
    await blog.populate([
      { path: 'author', select: 'fullName email profileImage' },
      { path: 'lastEditedBy', select: 'fullName email' },
      { path: 'relatedProducts', select: 'title slug price images' },
      { path: 'relatedPosts', select: 'title slug excerpt featuredImage' }
    ]);

    res.status(200).json({
      success: true,
      data: blog,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A blog post with this slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Delete blog post
 * @route   DELETE /api/admin/blogs/:id
 * @access  Private (Admin)
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Publish blog post
 * @route   PATCH /api/admin/blogs/:id/publish
 * @access  Private (Admin)
 */
exports.publishBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.publish();

    res.status(200).json({
      success: true,
      data: blog,
      message: 'Blog post published successfully'
    });
  } catch (error) {
    console.error('Error publishing blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Schedule blog post
 * @route   PATCH /api/admin/blogs/:id/schedule
 * @access  Private (Admin)
 */
exports.scheduleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { publishDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    if (!publishDate) {
      return res.status(400).json({
        success: false,
        message: 'Publish date is required'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.schedule(new Date(publishDate));

    res.status(200).json({
      success: true,
      data: blog,
      message: 'Blog post scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Archive blog post
 * @route   PATCH /api/admin/blogs/:id/archive
 * @access  Private (Admin)
 */
exports.archiveBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.archive();

    res.status(200).json({
      success: true,
      data: blog,
      message: 'Blog post archived successfully'
    });
  } catch (error) {
    console.error('Error archiving blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive blog post',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk update blog status
 * @route   PATCH /api/admin/blogs/bulk-update
 * @access  Private (Admin)
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Blog IDs array is required'
      });
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const result = await Blog.updateMany(
      { _id: { $in: ids } },
      updateData
    );

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} blog posts updated successfully`
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog posts',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk delete blogs
 * @route   DELETE /api/admin/blogs/bulk-delete
 * @access  Private (Admin)
 */
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Blog IDs array is required'
      });
    }

    const result = await Blog.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      },
      message: `${result.deletedCount} blog posts deleted successfully`
    });
  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog posts',
      error: error.message
    });
  }
};

/**
 * @desc    Get blog analytics
 * @route   GET /api/admin/blogs/:id/analytics
 * @access  Private (Admin)
 */
exports.getBlogAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }

    const blog = await Blog.findById(id).select(
      'title slug views likes shares commentCount engagementScore createdAt publishedAt'
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        blog,
        metrics: {
          views: blog.views,
          likes: blog.likes,
          shares: blog.shares,
          comments: blog.commentCount,
          engagementScore: blog.engagementScore
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get posts scheduled for publication (cron job helper)
 * @route   GET /api/admin/blogs/scheduled/due
 * @access  Private (Admin/System)
 */
exports.getScheduledPosts = async (req, res) => {
  try {
    const posts = await Blog.getDueForPublication();

    res.status(200).json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduled posts',
      error: error.message
    });
  }
};