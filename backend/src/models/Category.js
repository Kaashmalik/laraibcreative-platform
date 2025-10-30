const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    image: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif)$/i.test(v);
        },
        message: 'Please provide a valid image URL',
      },
    },

    imagePublicId: {
      type: String,
      trim: true,
    },

    // FIXED: Improved circular reference validation
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
      validate: {
        validator: async function(value) {
          if (!value) return true;
          
          // Prevent self-reference
          if (this._id && value.toString() === this._id.toString()) {
            return false;
          }
          
          // Check hierarchy depth and prevent circular references
          let currentParentId = value;
          let depth = 1;
          const maxDepth = 2;
          const visitedIds = new Set();
          
          if (this._id) {
            visitedIds.add(this._id.toString());
          }
          
          while (currentParentId && depth <= maxDepth + 1) {
            const parentIdStr = currentParentId.toString();
            
            // Circular reference detected
            if (visitedIds.has(parentIdStr)) {
              return false;
            }
            visitedIds.add(parentIdStr);
            
            try {
              const parent = await mongoose.model('Category')
                .findById(currentParentId)
                .select('parentCategory')
                .lean();
              
              if (!parent) break;
              
              if (parent.parentCategory) {
                depth++;
                if (depth > maxDepth) {
                  return false;
                }
                currentParentId = parent.parentCategory;
              } else {
                break;
              }
            } catch (error) {
              console.error('Category validation error:', error);
              return false;
            }
          }
          
          return true;
        },
        message: 'Invalid parent category: circular reference detected or exceeds maximum depth of 2 levels',
      },
    },

    displayOrder: {
      type: Number,
      default: 0,
      index: true,
      min: [0, 'Display order cannot be negative'],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Icon name cannot exceed 50 characters'],
    },

    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code'],
      default: '#D946A6',
    },

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

    productCount: {
      type: Number,
      default: 0,
      min: [0, 'Product count cannot be negative'],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================================
// INDEXES
// ============================================================

categorySchema.index({ isActive: 1, displayOrder: 1 });
categorySchema.index({ parentCategory: 1, isActive: 1 });
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ isFeatured: 1, isActive: 1 });

// ============================================================
// VIRTUAL FIELDS
// ============================================================

categorySchema.virtual('url').get(function() {
  return `/products/${this.slug}`;
});

categorySchema.virtual('isParentCategory').get(function() {
  return !this.parentCategory;
});

categorySchema.virtual('isSubcategory').get(function() {
  return !!this.parentCategory;
});

categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
  options: { sort: { displayOrder: 1 } },
});

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

categorySchema.pre('save', async function(next) {
  try {
    if (!this.slug || this.isModified('name')) {
      let baseSlug = slugify(this.name, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

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
        
        if (counter > 100) {
          throw new Error('Unable to generate unique slug');
        }
      }
    }

    if (!this.seo.metaTitle) {
      this.seo.metaTitle = `${this.name} - LaraibCreative`;
    }

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

categorySchema.pre('save', async function(next) {
  try {
    if (!this.isNew) {
      const Product = mongoose.model('Product');
      this.productCount = await Product.countDocuments({ 
        category: this._id,
        isDeleted: false,
        isActive: true
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

categorySchema.methods.getBreadcrumbs = async function() {
  const path = await this.getHierarchyPath();
  return path.map((cat, index) => ({
    name: cat.name,
    url: cat.url || `/products/${cat.slug}`,
    position: index + 1,
  }));
};

categorySchema.methods.toggleActive = async function() {
  this.isActive = !this.isActive;
  return await this.save();
};

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

categorySchema.statics.getParentCategories = function(activeOnly = true) {
  const query = { parentCategory: null };
  if (activeOnly) query.isActive = true;
  
  return this.find(query)
    .sort({ displayOrder: 1 })
    .select('name slug image icon color productCount isFeatured');
};

categorySchema.statics.getCategoryTree = async function(activeOnly = true) {
  const query = activeOnly ? { isActive: true } : {};
  
  const categories = await this.find(query)
    .sort({ displayOrder: 1 })
    .lean();

  const categoryMap = {};
  const tree = [];

  categories.forEach(cat => {
    categoryMap[cat._id] = { ...cat, subcategories: [] };
  });

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

categorySchema.statics.getFeaturedCategories = function(limit = 6) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ displayOrder: 1 })
    .limit(limit)
    .select('name slug image icon color productCount description');
};

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

categorySchema.statics.updateProductCount = async function(categoryId) {
  try {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ 
      category: categoryId,
      isDeleted: false,
      isActive: true
    });
    
    return await this.findByIdAndUpdate(
      categoryId,
      { productCount: count },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating product count:', error);
    return null;
  }
};

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
// ERROR HANDLING
// ============================================================

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