// backend/src/models/Blog.js

const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Blog Schema
 * Manages blog posts for SEO and customer engagement
 * Supports rich content, SEO optimization, and scheduling
 */
const blogSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFORMATION ====================
    
    /**
     * Blog post title
     * Used for display and SEO
     * @required
     */
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true // For search functionality
    },

    /**
     * URL-friendly slug
     * Auto-generated from title if not provided
     * Must be unique for proper routing
     * @unique
     */
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // Critical for fast page loads
    },

    /**
     * Short excerpt/summary
     * Displayed in blog listing pages and meta descriptions
     * @required
     */
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      minlength: [50, 'Excerpt must be at least 50 characters'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters']
    },

    /**
     * Main content (HTML)
     * Rich text editor output (sanitized)
     * @required
     */
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      minlength: [500, 'Content must be at least 500 characters for SEO']
    },

    /**
     * Featured image URL
     * Main image for the blog post
     * Cloudinary URL with optimization parameters
     * @required
     */
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif)$/i.test(v);
        },
        message: 'Please provide a valid image URL'
      }
    },

    /**
     * Featured image alt text
     * Important for accessibility and SEO
     */
    featuredImageAlt: {
      type: String,
      trim: true,
      maxlength: [125, 'Alt text should not exceed 125 characters']
    },

    // ==================== AUTHORSHIP ====================

    /**
     * Blog post author
     * Reference to admin user who created the post
     * @required
     */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true // For filtering by author
    },

    /**
     * Author name (denormalized for performance)
     * Stored to avoid joins when displaying author
     */
    authorName: {
      type: String,
      trim: true
    },

    // ==================== CATEGORIZATION ====================

    /**
     * Blog category
     * For organizing and filtering posts
     * @required
     */
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Karhai Trends',
          'Replica Guides',
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
        ],
        message: '{VALUE} is not a valid category'
      },
      index: true // For category filtering
    },

    /**
     * Tags for better discovery
     * Searchable keywords related to the content
     */
    tags: {
      type: [String],
      validate: {
        validator: function(v) {
          return v.length <= 10;
        },
        message: 'Cannot have more than 10 tags'
      },
      lowercase: true,
      trim: true,
      index: true // For tag-based search
    },

    // ==================== SEO OPTIMIZATION ====================

    /**
     * SEO meta title
     * Optimized for search engines (50-60 chars)
     * Falls back to title if not provided
     */
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title should not exceed 60 characters']
      },

      /**
       * SEO meta description
       * Appears in search results (150-160 chars)
       */
      metaDescription: {
        type: String,
        trim: true,
        minlength: [120, 'Meta description should be at least 120 characters'],
        maxlength: [160, 'Meta description should not exceed 160 characters']
      },

      /**
       * Focus keyword for SEO
       * Primary keyword to rank for
       */
      focusKeyword: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [50, 'Focus keyword too long']
      },

      /**
       * Additional keywords
       * Related keywords for better ranking
       */
      keywords: {
        type: [String],
        validate: {
          validator: function(v) {
            return v.length <= 5;
          },
          message: 'Cannot have more than 5 SEO keywords'
        }
      },

      /**
       * Canonical URL
       * For duplicate content prevention
       */
      canonicalUrl: {
        type: String,
        trim: true
      },

      /**
       * No-index flag
       * Prevent search engine indexing if true
       */
      noIndex: {
        type: Boolean,
        default: false
      }
    },

    // ==================== PUBLISHING STATUS ====================

    /**
     * Publication status
     * Controls visibility and scheduling
     * @default: draft
     */
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'scheduled', 'archived'],
        message: '{VALUE} is not a valid status'
      },
      default: 'draft',
      index: true // Critical for filtering published posts
    },

    /**
     * Scheduled publish date
     * When to automatically publish (for scheduled posts)
     */
    publishDate: {
      type: Date,
      index: true // For scheduling queries
    },

    /**
     * Actual published timestamp
     * When the post was made public
     */
    publishedAt: {
      type: Date
    },

    // ==================== ENGAGEMENT METRICS ====================

    /**
     * View count
     * Total number of times the post was viewed
     * Incremented on each page view
     */
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },

    /**
     * Unique views tracking
     * Array of user IDs or IP hashes who viewed
     * Limited to last 1000 for performance
     */
    viewedBy: {
      type: [String],
      select: false, // Don't include in normal queries
      validate: {
        validator: function(v) {
          return v.length <= 1000;
        },
        message: 'ViewedBy array exceeded limit'
      }
    },

    /**
     * Estimated reading time
     * In minutes, calculated from content length
     * Auto-calculated on save
     */
    readTime: {
      type: Number,
      min: 1,
      default: 5
    },

    /**
     * Like count
     * Number of users who liked the post
     */
    likes: {
      type: Number,
      default: 0,
      min: [0, 'Likes cannot be negative']
    },

    /**
     * Users who liked this post
     * For preventing duplicate likes
     */
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      select: false
    },

    /**
     * Share count
     * Number of times shared on social media
     */
    shares: {
      type: Number,
      default: 0,
      min: [0, 'Shares cannot be negative']
    },

    // ==================== COMMENTS (Optional) ====================

    /**
     * Comments enabled flag
     * Toggle comments on/off per post
     */
    commentsEnabled: {
      type: Boolean,
      default: true
    },

    /**
     * Comment count
     * Denormalized for performance
     */
    commentCount: {
      type: Number,
      default: 0,
      min: [0, 'Comment count cannot be negative']
    },

    // ==================== INTERNAL MANAGEMENT ====================

    /**
     * Featured post flag
     * Display prominently on homepage
     */
    isFeatured: {
      type: Boolean,
      default: false,
      index: true // For featured posts query
    },

    /**
     * Sticky post flag
     * Keep at top of blog list
     */
    isSticky: {
      type: Boolean,
      default: false
    },

    /**
     * Display order
     * Manual ordering for featured/sticky posts
     */
    displayOrder: {
      type: Number,
      default: 0
    },

    /**
     * Related products
     * Link blog posts to relevant products
     * Helps with internal linking and conversions
     */
    relatedProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Product',
      validate: {
        validator: function(v) {
          return v.length <= 5;
        },
        message: 'Cannot link more than 5 related products'
      }
    },

    /**
     * Related posts
     * Manually curated related content
     */
    relatedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Blog',
      validate: {
        validator: function(v) {
          return v.length <= 3;
        },
        message: 'Cannot link more than 3 related posts'
      }
    },

    /**
     * Admin notes
     * Internal notes not visible to customers
     */
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin notes too long'],
      select: false // Never include in public queries
    },

    /**
     * Last edited by
     * Track who made the last modification
     */
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    /**
     * Version history flag
     * Enable/disable version tracking
     */
    trackVersions: {
      type: Boolean,
      default: false
    }
  },
  {
    // ==================== SCHEMA OPTIONS ====================
    
    timestamps: true, // Adds createdAt and updatedAt automatically
    
    // Optimize JSON output
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove sensitive fields from API responses
        delete ret.__v;
        delete ret.viewedBy;
        delete ret.likedBy;
        delete ret.adminNotes;
        return ret;
      }
    },
    
    toObject: { 
      virtuals: true 
    }
  }
);

// ==================== INDEXES ====================

/**
 * Compound index for published posts sorted by date
 * Most common query: get all published posts ordered by recent
 */
blogSchema.index({ status: 1, publishedAt: -1 });

/**
 * Compound index for category filtering
 * Query: get published posts by category
 */
blogSchema.index({ category: 1, status: 1, publishedAt: -1 });

/**
 * Text index for full-text search
 * Searches across title, excerpt, content, and tags
 */
blogSchema.index({ 
  title: 'text', 
  excerpt: 'text', 
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,      // Title most important
    tags: 5,        // Tags second
    excerpt: 3,     // Excerpt third
    content: 1      // Content base weight
  },
  name: 'blog_text_search'
});

/**
 * Index for scheduled posts cron job
 * Find posts ready to publish
 */
blogSchema.index({ status: 1, publishDate: 1 });

/**
 * Index for featured posts query
 */
blogSchema.index({ isFeatured: 1, status: 1, displayOrder: -1 });

/**
 * Index for author's posts
 */
blogSchema.index({ author: 1, createdAt: -1 });

/**
 * Index for sitemap generation
 * All published posts ordered by last update
 */
blogSchema.index({ status: 1, updatedAt: -1 });

// ==================== VIRTUAL FIELDS ====================

/**
 * Full URL path
 * Constructs the complete blog post URL
 */
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

/**
 * Is published
 * Quick check if post is publicly visible
 */
blogSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && 
         (!this.publishDate || this.publishDate <= new Date());
});

/**
 * Formatted publish date
 * Human-readable date string
 */
blogSchema.virtual('formattedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

/**
 * Reading time text
 * Display-friendly reading time
 */
blogSchema.virtual('readTimeText').get(function() {
  return `${this.readTime} min read`;
});

/**
 * Engagement score
 * Combined metric for sorting by popularity
 */
blogSchema.virtual('engagementScore').get(function() {
  return (this.views * 1) + (this.likes * 5) + (this.shares * 10) + (this.commentCount * 3);
});

// ==================== PRE-SAVE HOOKS ====================

/**
 * Generate slug from title
 * Only if slug is not provided or title changed
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

/**
 * Calculate reading time from content
 * Average reading speed: 200 words per minute
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Strip HTML tags for word count
    const plainText = this.content.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

/**
 * Auto-fill SEO fields from content if not provided
 */
blogSchema.pre('save', function(next) {
  // Set meta title from title if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }

  // Set meta description from excerpt if not provided
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }

  // Extract first tag as focus keyword if not provided
  if (!this.seo.focusKeyword && this.tags.length > 0) {
    this.seo.focusKeyword = this.tags[0];
  }

  next();
});

/**
 * Set publishedAt timestamp when status changes to published
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

/**
 * Denormalize author name for performance
 */
blogSchema.pre('save', async function(next) {
  if (this.isModified('author') && this.author) {
    try {
      const User = mongoose.model('User');
      const author = await User.findById(this.author).select('fullName');
      if (author) {
        this.authorName = author.fullName;
      }
    } catch (error) {
      console.error('Error fetching author name:', error);
    }
  }
  next();
});

/**
 * Sanitize content to prevent XSS
 * Strip dangerous HTML tags and attributes
 */
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Basic sanitization - in production, use a library like DOMPurify or sanitize-html
    const dangerousTags = /<script|<iframe|<object|<embed|onerror|onload/gi;
    if (dangerousTags.test(this.content)) {
      return next(new Error('Content contains potentially dangerous HTML'));
    }
  }
  next();
});

/**
 * Validate slug uniqueness manually
 * (Since unique index might not catch updates properly)
 */
blogSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const existingPost = await this.constructor.findOne({ 
      slug: this.slug,
      _id: { $ne: this._id } 
    });
    
    if (existingPost) {
      // Append timestamp to make unique
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Increment view count
 * Tracks unique views by user ID or IP
 * @param {String} identifier - User ID or IP address hash
 */
blogSchema.methods.incrementView = async function(identifier = null) {
  // If identifier provided, check if already viewed
  if (identifier) {
    if (this.viewedBy.includes(identifier)) {
      return this; // Already viewed, don't increment
    }
    
    // Add to viewedBy array
    this.viewedBy.push(identifier);
    
    // Keep only last 1000 viewers
    if (this.viewedBy.length > 1000) {
      this.viewedBy = this.viewedBy.slice(-1000);
    }
  }
  
  this.views += 1;
  await this.save();
  return this;
};

/**
 * Toggle like
 * Add or remove user from liked list
 * @param {String} userId - User who liked/unliked
 */
blogSchema.methods.toggleLike = async function(userId) {
  const index = this.likedBy.indexOf(userId);
  
  if (index > -1) {
    // Unlike
    this.likedBy.splice(index, 1);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    // Like
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  await this.save();
  return { liked: index === -1, likeCount: this.likes };
};

/**
 * Increment share count
 */
blogSchema.methods.incrementShare = async function() {
  this.shares += 1;
  await this.save();
  return this;
};

/**
 * Publish post
 * Change status to published and set timestamp
 */
blogSchema.methods.publish = async function() {
  this.status = 'published';
  this.publishedAt = new Date();
  await this.save();
  return this;
};

/**
 * Schedule post
 * Set for future publication
 * @param {Date} publishDate - When to publish
 */
blogSchema.methods.schedule = async function(publishDate) {
  if (publishDate <= new Date()) {
    throw new Error('Publish date must be in the future');
  }
  this.status = 'scheduled';
  this.publishDate = publishDate;
  await this.save();
  return this;
};

/**
 * Archive post
 * Remove from public view but keep in database
 */
blogSchema.methods.archive = async function() {
  this.status = 'archived';
  await this.save();
  return this;
};

/**
 * Get related posts by tags and category
 * @param {Number} limit - Maximum number of related posts
 */
blogSchema.methods.getRelatedPosts = async function(limit = 3) {
  return await this.constructor.find({
    _id: { $ne: this._id },
    status: 'published',
    $or: [
      { category: this.category },
      { tags: { $in: this.tags } }
    ]
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage category publishedAt readTime views');
};

// ==================== STATIC METHODS ====================

/**
 * Get published posts with pagination
 * @param {Object} options - Query options
 */
blogSchema.statics.getPublished = function(options = {}) {
  const {
    page = 1,
    limit = 10,
    category = null,
    tag = null,
    author = null,
    featured = null,
    sortBy = '-publishedAt'
  } = options;

  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (author) query.author = author;
  if (featured !== null) query.isFeatured = featured;

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('author', 'fullName profileImage')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-content -adminNotes -viewedBy -likedBy');
};

/**
 * Search posts
 * Full-text search across multiple fields
 * @param {String} searchTerm - Search query
 */
blogSchema.statics.search = function(searchTerm, options = {}) {
  const { limit = 10, page = 1 } = options;
  const skip = (page - 1) * limit;

  return this.find(
    { 
      $text: { $search: searchTerm },
      status: 'published'
    },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .skip(skip)
  .limit(limit)
  .select('title slug excerpt featuredImage category publishedAt readTime');
};

/**
 * Get trending posts
 * Based on engagement score
 * @param {Number} limit - Number of posts to return
 * @param {Number} days - Consider posts from last X days
 */
blogSchema.statics.getTrending = function(limit = 5, days = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  return this.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: dateThreshold }
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: ['$views', 1] },
            { $multiply: ['$likes', 5] },
            { $multiply: ['$shares', 10] },
            { $multiply: ['$commentCount', 3] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1 } },
    { $limit: limit },
    {
      $project: {
        title: 1,
        slug: 1,
        excerpt: 1,
        featuredImage: 1,
        category: 1,
        publishedAt: 1,
        views: 1,
        likes: 1,
        readTime: 1,
        engagementScore: 1
      }
    }
  ]);
};

/**
 * Get posts scheduled for publication
 * Used by cron job
 */
blogSchema.statics.getDueForPublication = function() {
  return this.find({
    status: 'scheduled',
    publishDate: { $lte: new Date() }
  });
};

/**
 * Get popular categories
 * Categories with most posts
 */
blogSchema.statics.getPopularCategories = function() {
  return this.aggregate([
    { $match: { status: 'published' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        category: '$_id',
        count: 1,
        totalViews: 1,
        _id: 0
      }
    }
  ]);
};

/**
 * Get all tags with usage count
 */
blogSchema.statics.getAllTags = function() {
  return this.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        tag: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

/**
 * Get sitemap data
 * All published posts for XML sitemap
 */
blogSchema.statics.getSitemapData = function() {
  return this.find({ status: 'published' })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .lean();
};

// ==================== EXPORT MODEL ====================

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;