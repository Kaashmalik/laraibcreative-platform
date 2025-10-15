/**
 * Category Controller
 * Handles product category management
 * 
 * Features:
 * - CRUD operations for categories
 * - Hierarchical categories (parent/subcategories)
 * - SEO-friendly slugs
 * - Category product counts
 * - Active/inactive status
 */

const Category = require('../models/Category');
const Product = require('../models/Product');
const { generateSlug } = require('../utils/helpers');
const { deleteFromCloudinary, extractPublicId } = require('../middleware/upload.middleware');

/**
 * GET /api/categories
 * Get all categories
 * Public access
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive = 'false', includeProductCount = 'true' } = req.query;

    // Build filter
    const filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Get categories
    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort('displayOrder name')
      .lean();

    // Add product count if requested
    if (includeProductCount === 'true') {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.countDocuments({ 
            category: category._id,
            availability: { $ne: 'deleted' }
          });
          return {
            ...category,
            productCount
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: categoriesWithCount
      });
    }

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/:id
 * Get single category by ID
 * Public access
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug description');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({ 
      category: category._id,
      availability: { $ne: 'deleted' }
    });

    // Get subcategories
    const subcategories = await Category.find({ 
      parentCategory: category._id,
      isActive: true 
    }).select('name slug image');

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount,
        subcategories
      }
    });

  } catch (error) {
    console.error('Error in getCategoryById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/slug/:slug
 * Get category by slug
 * Public access
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug })
      .populate('parentCategory', 'name slug description');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count
    const productCount = await Product.countDocuments({ 
      category: category._id,
      availability: { $ne: 'deleted' }
    });

    // Get subcategories
    const subcategories = await Category.find({ 
      parentCategory: category._id,
      isActive: true 
    }).select('name slug image');

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        productCount,
        subcategories
      }
    });

  } catch (error) {
    console.error('Error in getCategoryBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

/**
 * POST /api/categories
 * Create new category
 * Admin access only
 */
exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      parentCategory,
      displayOrder,
      isActive
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if parent category exists (if provided)
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await Category.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await Category.findOne({ slug });
      counter++;
    }

    // Handle uploaded image
    const image = req.file ? req.file.path : '';

    // Create category
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

/**
 * PUT /api/categories/:id
 * Update category
 * Admin access only
 */
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // If name is being updated, regenerate slug
    if (updateData.name && updateData.name !== category.name) {
      let slug = generateSlug(updateData.name);
      let slugExists = await Category.findOne({ slug, _id: { $ne: id } });
      let counter = 1;

      while (slugExists) {
        slug = `${generateSlug(updateData.name)}-${counter}`;
        slugExists = await Category.findOne({ slug, _id: { $ne: id } });
        counter++;
      }

      updateData.slug = slug;
    }

    // Handle new uploaded image
    if (req.file) {
      // Delete old image from Cloudinary
      if (category.image) {
        try {
          const publicId = extractPublicId(category.image);
          await deleteFromCloudinary(publicId);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      updateData.image = req.file.path;
    }

    // Validate parent category if being updated
    if (updateData.parentCategory) {
      // Prevent category from being its own parent
      if (updateData.parentCategory === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parent = await Category.findById(updateData.parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Error in updateCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete category
 * Admin access only
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} product(s) associated with it. Please reassign or delete the products first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parentCategory: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategory(ies). Please delete subcategories first.`
      });
    }

    // Delete image from Cloudinary
    if (category.image) {
      try {
        const publicId = extractPublicId(category.image);
        await deleteFromCloudinary(publicId);
      } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
      }
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/:id/products
 * Get products in a category
 * Public access
 */
exports.getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products
    const products = await Product.find({ 
      category: id,
      availability: { $ne: 'deleted' }
    })
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Product.countDocuments({ 
      category: id,
      availability: { $ne: 'deleted' }
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        productsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error in getCategoryProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products',
      error: error.message
    });
  }
};

/**
 * GET /api/categories/hierarchy
 * Get categories in hierarchical structure
 * Public access
 */
exports.getCategoryHierarchy = async (req, res) => {
  try {
    // Get all active categories
    const categories = await Category.find({ isActive: true })
      .sort('displayOrder name')
      .lean();

    // Build hierarchy
    const buildHierarchy = (parentId = null) => {
      return categories
        .filter(cat => {
          if (parentId === null) {
            return !cat.parentCategory;
          }
          return cat.parentCategory && cat.parentCategory.toString() === parentId.toString();
        })
        .map(cat => ({
          ...cat,
          children: buildHierarchy(cat._id)
        }));
    };

    const hierarchy = buildHierarchy();

    res.status(200).json({
      success: true,
      data: hierarchy
    });

  } catch (error) {
    console.error('Error in getCategoryHierarchy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category hierarchy',
      error: error.message
    });
  }
};

module.exports = exports;