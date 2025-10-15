/**
 * Category Model
 * 
 * Manages product categories and subcategories for LaraibCreative
 * Supports hierarchical structure (parent-child relationships)
 * Used for product organization and filtering
 * 
 * Related Models:
 * - Product.js (one-to-many: one category has many products)
 * 
 * Key Features:
 * - Hierarchical categories (parent/subcategories)
 * - SEO-friendly slugs with auto-generation
 * - Display order management
 * - Active/inactive status
 * - Category images for visual catalog
 * - Automatic product count tracking
 */

const mongoose = require('mongoose');
const slugify = require('slugify'); // npm install slugify

const categorySchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
      index: true, // Index for search queries
    },

    // SEO-Friendly URL slug
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Critical for URL lookups - indexed for performance
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },

    // Category description for SEO and display
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // Category image (Cloudinary URL)
    image: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          // Allow empty string or valid URL
          if (!v) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif)$/i.test(v);
        },
        message: 'Please provide a valid image URL',
      },
    },

    // Cloudinary public_id for image management
    imagePublicId: {
      type: String,
      trim: true,
    },

    // Hierarchical Structure - Parent Category
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true, // Index for filtering subcategories
      validate: {
        validator: async function(value) {
          // Prevent self-reference
          if (value && value.toString() === this._id.toString()) {
            return false;
          }
          // Prevent circular references (max 2 levels deep)
          if (value) {
            const parent = await mongoose.model('Category').findById(value);
            if (parent && parent.parentCategory) {
              return false; // Only allow 2-level hierarchy
            }
          }
          return true;
        },
        message: 'Invalid parent category - check for self-reference or depth > 2 levels',
      },
    },

    // Display Order (for sorting categories)
    displayOrder: {
      type: Number,
      default: 0,
      index: true, // Index for efficient ordering queries
      min: [0, 'Display order cannot be negative'],
    },

    // Active Status (for hiding categories without deleting)
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Index for filtering active categories
    },

    // Featured category (for homepage display)
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Icon for category (optional - for UI display)
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon name cannot exceed 50 characters'],
    },

    // Color theme for category cards (hex color)
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code'],
      default: '#D946A6', // Brand pink
    },

    // SEO Metadata
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'Meta title should not exceed 60 characters for SEO'],
      },
      metaDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'Meta description should not exceed 160 characters for SEO'],
      },
      keywords: {
        type: [String],
        default: [],
        validate: {
          validator: function(arr) {
            return arr.length <= 10;
          },
          message: 'Maximum 10 keywords allowed',
        },
      },
    },

    // Product count (updated via virtual or cron job)
    productCount: {
      type: Number,
      default: 0,
      min: [0, 'Product count cannot be negative'],
    },

    // Created by admin (for audit trail)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Last updated by admin (for audit trail)
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to object
  }
);

// ============================================================
// INDEXES FOR PERFORMANCE OPTIMIZATION
// ============================================================

// Compound index for active categories ordered by displayOrder
categorySchema.index({ isActive: 1, displayOrder: 1 });

// Compound index for parent-child queries
categorySchema.index({ parentCategory: 1, isActive: 1 });

// Text index for search functionality
categorySchema.index({ name: 'text', description: 'text' });

// Index for featured active categories
categorySchema.index({ isFeatured: 1, isActive: 1 });

// ============================================================
// VIRTUAL FIELDS
// ============================================================

// Virtual: Full URL path for category
categorySchema.virtual('url').get(function() {
  return `/products/${this.slug}`;
});

// Virtual: Check if category is parent (has no parent)
categorySchema.virtual('isParentCategory').get(function() {
  return !this.parentCategory;
});

// Virtual: Check if category is subcategory
categorySchema.virtual('isSubcategory').get(function() {
  return !!this.parentCategory;
});

// Virtual populate: Get subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  options: { sort: { displayOrder: 1 } },
});

// Virtual populate: Get products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

// Auto-generate slug from name if not provided
categorySchema.pre('save', async function(next) {
  try {
    // Generate slug if not provided or name changed
    if (!this.slug || this.isModified('name')) {
      let baseSlug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

      // Ensure slug uniqueness by appending number if needed
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await mongoose.model('Category').findOne({ 
          slug, 
          _id: { $ne: this._id } 
        });
        
        if (!existing) {
          this.slug = slug;
          break;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Auto-generate SEO meta title if not provided
    if (!this.seo.metaTitle) {
      this.seo.metaTitle = `${this.name} - LaraibCreative`;
    }

    // Auto-generate SEO meta description if not provided
    if (!this.seo.metaDescription && this.description) {
      this.seo.metaDescription = this.description.substring(0, 160);
    } else if (!this.seo.metaDescription) {
      this.seo.metaDescription = `Shop ${this.name} collection at LaraibCreative. Custom stitching available.`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Prevent deletion if category has products
categorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Product = mongoose.model('Product');
    const productCount = await Product.countDocuments({ category: this._id });
    
    if (productCount > 0) {
      throw new Error(
        `Cannot delete category '${this.name}' because it has ${productCount} product(s). ` +
        `Please reassign or delete the products first.`
      );
    }

    // Check for subcategories
    const subcategoryCount = await mongoose.model('Category').countDocuments({ 
      parentCategory: this._id 
    });
    
    if (subcategoryCount > 0) {
      throw new Error(
        `Cannot delete category '${this.name}' because it has ${subcategoryCount} subcategory(ies). ` +
        `Please delete or reassign subcategories first.`
      );
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update product count before saving
categorySchema.pre('save', async function(next) {
  try {
    if (!this.isNew) {
      const Product = mongoose.model('Product');
      this.productCount = await Product.countDocuments({ 
        category: this._id,
        // Only count active products (if you have isActive field in Product)
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// INSTANCE METHODS
// ============================================================

/**
 * Get full category hierarchy path
 * @returns {Array} Array of category objects from root to current
 */
categorySchema.methods.getHierarchyPath = async function() {
  const path = [this];
  let current = this;

  while (current.parentCategory) {
    current = await mongoose.model('Category')
      .findById(current.parentCategory)
      .select('_id name slug');
    
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }

  return path;
};

/**
 * Get breadcrumb data for SEO
 * @returns {Array} Breadcrumb items
 */
categorySchema.methods.getBreadcrumbs = async function() {
  const path = await this.getHierarchyPath();
  return path.map((cat, index) => ({
    name: cat.name,
    url: cat.url || `/products/${cat.slug}`,
    position: index + 1,
  }));
};

/**
 * Toggle active status
 * @returns {Category} Updated category
 */
categorySchema.methods.toggleActive = async function() {
  this.isActive = !this.isActive;
  return await this.save();
};

/**
 * Get all descendant categories (subcategories recursively)
 * @returns {Array} Array of category IDs
 */
categorySchema.methods.getAllDescendants = async function() {
  const descendants = [];
  
  const getChildren = async (parentId) => {
    const children = await mongoose.model('Category').find({ 
      parentCategory: parentId 
    }).select('_id');
    
    for (const child of children) {
      descendants.push(child._id);
      await getChildren(child._id);
    }
  };

  await getChildren(this._id);
  return descendants;
};

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Get all parent categories (top-level)
 * @param {Boolean} activeOnly - Return only active categories
 * @returns {Array} Array of parent categories
 */
categorySchema.statics.getParentCategories = function(activeOnly = true) {
  const query = { parentCategory: null };
  if (activeOnly) query.isActive = true;
  
  return this.find(query)
    .sort({ displayOrder: 1 })
    .select('name slug image icon color productCount isFeatured');
};

/**
 * Get category tree with subcategories
 * @param {Boolean} activeOnly - Return only active categories
 * @returns {Array} Hierarchical category tree
 */
categorySchema.statics.getCategoryTree = async function(activeOnly = true) {
  const query = activeOnly ? { isActive: true } : {};
  
  const categories = await this.find(query)
    .sort({ displayOrder: 1 })
    .lean();

  // Build tree structure
  const categoryMap = {};
  const tree = [];

  // First pass: create map
  categories.forEach(cat => {
    categoryMap[cat._id] = { ...cat, subcategories: [] };
  });

  // Second pass: build tree
  categories.forEach(cat => {
    if (cat.parentCategory) {
      const parent = categoryMap[cat.parentCategory];
      if (parent) {
        parent.subcategories.push(categoryMap[cat._id]);
      }
    } else {
      tree.push(categoryMap[cat._id]);
    }
  });

  return tree;
};

/**
 * Get featured categories for homepage
 * @param {Number} limit - Maximum number of categories
 * @returns {Array} Featured categories
 */
categorySchema.statics.getFeaturedCategories = function(limit = 6) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ displayOrder: 1 })
    .limit(limit)
    .select('name slug image icon color productCount description');
};

/**
 * Search categories by name or description
 * @param {String} searchTerm - Search query
 * @returns {Array} Matching categories
 */
categorySchema.statics.searchCategories = function(searchTerm) {
  return this.find(
    { 
      $text: { $search: searchTerm },
      isActive: true 
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .select('name slug image description productCount');
};

/**
 * Update product count for a category
 * @param {ObjectId} categoryId - Category ID
 * @returns {Category} Updated category
 */
categorySchema.statics.updateProductCount = async function(categoryId) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ category: categoryId });
  
  return await this.findByIdAndUpdate(
    categoryId,
    { productCount: count },
    { new: true }
  );
};

/**
 * Reorder categories
 * @param {Array} orderArray - Array of { id, displayOrder } objects
 * @returns {Promise}
 */
categorySchema.statics.reorderCategories = async function(orderArray) {
  const bulkOps = orderArray.map(item => ({
    updateOne: {
      filter: { _id: item.id },
      update: { displayOrder: item.displayOrder },
    },
  }));

  return await this.bulkWrite(bulkOps);
};

// ============================================================
// SECURITY & DATA SANITIZATION
// ============================================================

// Remove sensitive fields when converting to JSON (if any in future)
categorySchema.methods.toJSON = function() {
  const obj = this.toObject();
  
  // Remove internal fields if needed
  // delete obj.__v;
  
  return obj;
};

// ============================================================
// ERROR HANDLING
// ============================================================

// Handle duplicate key errors
categorySchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.slug) {
      next(new Error('A category with this slug already exists'));
    } else {
      next(new Error('Duplicate key error'));
    }
  } else {
    next(error);
  }
});

// ============================================================
// MODEL EXPORT
// ============================================================

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;