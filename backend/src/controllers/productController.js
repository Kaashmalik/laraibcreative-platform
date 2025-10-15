/**
 * Product Controller
 * Handles all product-related business logic
 * 
 * Features:
 * - CRUD operations with validation
 * - Advanced filtering and search
 * - SEO-friendly slug generation
 * - View tracking
 * - Related products algorithm
 * - Image management
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const { generateSlug, calculateReadTime } = require('../utils/helpers');
const { deleteFromCloudinary } = require('../config/cloudinary');

/**
 * GET /api/products
 * Get all products with advanced filtering, search, and pagination
 * Public access
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search = '',
      category = '',
      subcategory = '',
      fabric = '',
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      occasion = '',
      color = '',
      availability = '',
      featured = ''
    } = req.query;

    // Build filter object
    const filter = {};

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Subcategory filter
    if (subcategory) {
      filter.subcategory = { $regex: subcategory, $options: 'i' };
    }

    // Fabric type filter
    if (fabric) {
      filter['fabric.type'] = { $regex: fabric, $options: 'i' };
    }

    // Price range filter
    filter['pricing.basePrice'] = {
      $gte: parseFloat(minPrice),
      $lte: parseFloat(maxPrice)
    };

    // Occasion filter
    if (occasion) {
      filter.occasion = { $regex: occasion, $options: 'i' };
    }

    // Color filter
    if (color) {
      filter.colors = { $regex: color, $options: 'i' };
    }

    // Availability filter
    if (availability) {
      filter.availability = availability;
    }

    // Featured products filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        productsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

/**
 * GET /api/products/:id
 * Get single product by ID
 * Public access
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'customer',
          select: 'fullName profileImage'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

/**
 * GET /api/products/slug/:slug
 * Get product by SEO-friendly slug
 * Public access
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug description')
      .populate({
        path: 'reviews',
        populate: {
          path: 'customer',
          select: 'fullName profileImage'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

/**
 * POST /api/products
 * Create new product
 * Admin access only
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      fabric,
      pricing,
      availability,
      featured,
      seo,
      occasion,
      colors,
      sizes
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !pricing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, pricing'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Generate unique slug
    let slug = generateSlug(title);
    let slugExists = await Product.findOne({ slug });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // Generate SKU
    const sku = `LC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.path) : [];
    const primaryImage = images.length > 0 ? images[0] : '';

    // Create product
    const product = await Product.create({
      title,
      slug,
      sku,
      description,
      category,
      subcategory,
      fabric,
      pricing,
      images,
      primaryImage,
      availability: availability || 'in-stock',
      featured: featured || false,
      seo: {
        metaTitle: seo?.metaTitle || title,
        metaDescription: seo?.metaDescription || description.substring(0, 160),
        keywords: seo?.keywords || []
      },
      occasion,
      colors,
      sizes
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

/**
 * PUT /api/products/:id
 * Update existing product
 * Admin access only
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If title is being updated, regenerate slug
    if (updateData.title && updateData.title !== product.title) {
      let slug = generateSlug(updateData.title);
      let slugExists = await Product.findOne({ slug, _id: { $ne: id } });
      let counter = 1;

      while (slugExists) {
        slug = `${generateSlug(updateData.title)}-${counter}`;
        slugExists = await Product.findOne({ slug, _id: { $ne: id } });
        counter++;
      }

      updateData.slug = slug;
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      updateData.images = [...product.images, ...newImages];
      
      // Update primary image if not set or if requested
      if (!product.primaryImage || updateData.setPrimaryImage) {
        updateData.primaryImage = newImages[0];
      }
    }

    // Update SEO fields if not provided
    if (updateData.title && !updateData.seo?.metaTitle) {
      updateData['seo.metaTitle'] = updateData.title;
    }

    if (updateData.description && !updateData.seo?.metaDescription) {
      updateData['seo.metaDescription'] = updateData.description.substring(0, 160);
    }

    // Perform update
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

/**
 * DELETE /api/products/:id
 * Delete product
 * Admin access only
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          await deleteFromCloudinary(imageUrl);
        } catch (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      }
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

/**
 * GET /api/products/featured
 * Get featured products
 * Public access
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ featured: true })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
};

/**
 * POST /api/products/:id/view
 * Increment product view count
 * Public access
 */
exports.incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).select('views');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { views: product.views }
    });

  } catch (error) {
    console.error('Error in incrementViews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment views',
      error: error.message
    });
  }
};

/**
 * GET /api/products/:id/related
 * Get related products based on category and tags
 * Public access
 */
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    // Get current product
    const product = await Product.findById(id).select('category subcategory occasion');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build filter for related products
    const filter = {
      _id: { $ne: id }, // Exclude current product
      $or: [
        { category: product.category },
        { subcategory: product.subcategory },
        { occasion: product.occasion }
      ]
    };

    // Find related products
    const relatedProducts = await Product.find(filter)
      .populate('category', 'name slug')
      .sort('-views -createdAt')
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      data: relatedProducts
    });

  } catch (error) {
    console.error('Error in getRelatedProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch related products',
      error: error.message
    });
  }
};

/**
 * DELETE /api/products/:id/image
 * Delete specific image from product
 * Admin access only
 */
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove image from array
    product.images = product.images.filter(img => img !== imageUrl);

    // Update primary image if it was deleted
    if (product.primaryImage === imageUrl) {
      product.primaryImage = product.images.length > 0 ? product.images[0] : '';
    }

    await product.save();

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(imageUrl);
    } catch (err) {
      console.error('Error deleting from Cloudinary:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

/**
 * GET /api/products/search/autocomplete
 * Search autocomplete suggestions
 * Public access
 */
exports.searchAutocomplete = async (req, res) => {
  try {
    const { q = '', limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const suggestions = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    })
      .select('title slug primaryImage sku')
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Error in searchAutocomplete:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

module.exports = exports;