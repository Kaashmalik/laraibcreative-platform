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
const { productSchema } = require('../utils/validationSchemas');

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
      featured = '',
      type = '' // NEW: Suit type filter (ready-made, replica, karhai)
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

    // Color filter - support both colors and availableColors fields
    if (color) {
      const colorArray = color.split(',').map(c => c.trim());
      const colorRegex = colorArray.map(c => new RegExp(c, 'i'));
      const colorConditions = [
        { colors: { $in: colorRegex } },
        { 'availableColors.name': { $in: colorRegex } }
      ];
      
      // If there's already an $or condition (from search), combine with $and
      if (filter.$or && Array.isArray(filter.$or)) {
        filter.$and = [
          { $or: filter.$or },
          { $or: colorConditions }
        ];
        delete filter.$or;
      } else {
        // If no existing $or, create new one
        if (!filter.$or) {
          filter.$or = [];
        }
        filter.$or = Array.isArray(filter.$or) 
          ? [...filter.$or, ...colorConditions]
          : colorConditions;
      }
    }

    // Availability filter
    if (availability) {
      filter.availability = availability;
    }

    // Featured products filter
    if (featured === 'true') {
      filter.featured = true;
    }

    // Suit type filter (NEW)
    if (type) {
      // Support comma-separated values for multiple types
      const types = type.split(',').map(t => t.trim());
      if (types.length === 1) {
        filter.type = types[0];
      } else {
        filter.type = { $in: types };
      }
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
    const { limit = 6, type, category } = req.query;

    // Get current product
    const product = await Product.findById(id).select('category subcategory occasion type');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build filter for related products
    const filter = {
      _id: { $ne: id }, // Exclude current product
      isActive: true,
      $or: [
        { category: category || product.category },
        { subcategory: product.subcategory },
        { occasion: product.occasion },
        { type: type || product.type } // NEW: Include type matching
      ]
    };

    // Add type filter if specified
    if (type) {
      filter.type = type;
    }

    // Find related products
    const relatedProducts = await Product.find(filter)
      .populate('category', 'name slug')
      .sort('-views -createdAt')
      .limit(parseInt(limit))
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      products: relatedProducts,
      data: relatedProducts // For backward compatibility
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

// ============================================
// ADMIN CONTROLLER METHODS
// ============================================

/**
 * GET /api/v1/admin/products
 * Get all products for admin with advanced filters, search, and pagination
 * @access Private (Admin)
 */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      status = '',
      featured = '',
      productType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice = '',
      maxPrice = '',
      occasion = ''
    } = req.query;

    // Build filter object
    const filter = { isDeleted: { $ne: true } }; // Exclude soft-deleted products

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { designCode: { $regex: search, $options: 'i' } },
        { 'inventory.sku': { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Status filter (availability status)
    if (status) {
      filter['availability.status'] = status;
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    } else if (featured === 'false') {
      filter.isFeatured = false;
    }

    // Product type filter
    if (productType) {
      filter.productType = productType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Occasion filter
    if (occasion) {
      filter.occasion = occasion;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .select('-__v')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          productsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error in getAllProductsAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/products
 * Create new product (admin only)
 * @access Private (Admin)
 */
exports.createProductAdmin = async (req, res) => {
  try {
    // Parse form data (handles both JSON and form-data)
    let productData = {};
    
    // If body is JSON string, parse it
    if (typeof req.body === 'string') {
      try {
        productData = JSON.parse(req.body);
      } catch (e) {
        productData = req.body;
      }
    } else {
      productData = req.body;
    }

    // Parse nested objects if they're strings
    if (typeof productData.pricing === 'string') {
      productData.pricing = JSON.parse(productData.pricing);
    }
    if (typeof productData.fabric === 'string') {
      productData.fabric = JSON.parse(productData.fabric);
    }
    if (typeof productData.inventory === 'string') {
      productData.inventory = JSON.parse(productData.inventory);
    }
    if (typeof productData.availability === 'string') {
      productData.availability = JSON.parse(productData.availability);
    }
    if (typeof productData.seo === 'string') {
      productData.seo = JSON.parse(productData.seo);
    }
    if (typeof productData.sizeAvailability === 'string') {
      productData.sizeAvailability = JSON.parse(productData.sizeAvailability);
    }
    if (typeof productData.availableColors === 'string') {
      productData.availableColors = JSON.parse(productData.availableColors);
    }

    // Validate required fields
    if (!productData.title || !productData.description || !productData.category || !productData.pricing?.basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, pricing.basePrice'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(productData.category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Generate unique slug
    let slug = generateSlug(productData.title);
    let slugExists = await Product.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(productData.title)}-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // Generate design code if not provided
    if (!productData.designCode) {
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 9000) + 1000;
      productData.designCode = `LC-${year}-${random}`;
    }

    // Generate SKU if not provided
    if (!productData.inventory?.sku) {
      const sku = `LC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      if (!productData.inventory) productData.inventory = {};
      productData.inventory.sku = sku;
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: file.path || file.secure_url,
          publicId: file.filename || file.public_id,
          altText: productData.title,
          displayOrder: images.length
        });
      });
    }

    // Set primary image
    const primaryImage = images.length > 0 ? images[0].url : '';
    const thumbnailImage = primaryImage;

    // Create product
    const product = await Product.create({
      title: productData.title,
      slug,
      description: productData.description,
      shortDescription: productData.shortDescription || '',
      designCode: productData.designCode,
      category: productData.category,
      subcategory: productData.subcategory || '',
      occasion: productData.occasion || '',
      tags: productData.tags || [],
      images,
      primaryImage,
      thumbnailImage,
      fabric: productData.fabric || {},
      pricing: productData.pricing,
      inventory: productData.inventory || { trackInventory: false, stockQuantity: 0, lowStockThreshold: 5 },
      availability: productData.availability || { status: 'made-to-order' },
      productType: productData.productType || 'both',
      sizeAvailability: productData.sizeAvailability || { availableSizes: [], customSizesAvailable: false },
      availableColors: productData.availableColors || [],
      features: productData.features || [],
      whatsIncluded: productData.whatsIncluded || [],
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      isFeatured: productData.isFeatured || false,
      isNewArrival: productData.isNewArrival || false,
      isBestSeller: productData.isBestSeller || false,
      seo: productData.seo || {},
      adminNotes: productData.adminNotes || '',
      createdBy: req.user.id
    });

    // Populate category for response
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error in createProductAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/products/:id/edit
 * Get product data for editing
 * @access Private (Admin)
 */
exports.getProductForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .lean();

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
    console.error('Error in getProductForEdit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PUT /api/v1/admin/products/:id
 * Update existing product (admin only)
 * @access Private (Admin)
 */
exports.updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Parse form data
    let updateData = {};
    if (typeof req.body === 'string') {
      try {
        updateData = JSON.parse(req.body);
      } catch (e) {
        updateData = req.body;
      }
    } else {
      updateData = req.body;
    }

    // Parse nested objects
    ['pricing', 'fabric', 'inventory', 'availability', 'seo', 'sizeAvailability', 'availableColors'].forEach(key => {
      if (typeof updateData[key] === 'string') {
        try {
          updateData[key] = JSON.parse(updateData[key]);
        } catch (e) {
          // Keep as is if parsing fails
        }
      }
    });

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
      const newImages = req.files.map((file, index) => ({
        url: file.path || file.secure_url,
        publicId: file.filename || file.public_id,
        altText: updateData.title || product.title,
        displayOrder: (product.images?.length || 0) + index
      }));

      // Merge with existing images or replace
      if (updateData.replaceImages) {
        // Delete old images from Cloudinary
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            try {
              if (img.publicId) {
                await deleteFromCloudinary(img.publicId);
              }
            } catch (err) {
              console.error('Error deleting old image:', err);
            }
          }
        }
        updateData.images = newImages;
      } else {
        updateData.images = [...(product.images || []), ...newImages];
      }

      // Update primary image if not set
      if (!updateData.primaryImage && newImages.length > 0) {
        updateData.primaryImage = newImages[0].url;
      }
    }

    // Update lastModifiedBy
    updateData.lastModifiedBy = req.user.id;

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
    console.error('Error in updateProductAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/v1/admin/products/:id
 * Delete product (admin only) - Soft delete
 * @access Private (Admin)
 */
exports.deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete (mark as deleted)
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.deletedBy = req.user.id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteProductAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/v1/admin/products/bulk-delete
 * Bulk delete products
 * @access Private (Admin)
 */
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    // Soft delete all products
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user.id
        }
      }
    );

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.modifiedCount} product(s)`,
      data: {
        deletedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error in bulkDeleteProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * PATCH /api/v1/admin/products/bulk-update
 * Bulk update products
 * @access Private (Admin)
 */
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    // Convert nested field updates (e.g., 'availability.status' to nested object)
    const updateObject = {};
    Object.keys(updates).forEach(key => {
      if (key.includes('.')) {
        const keys = key.split('.');
        let current = updateObject;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = updates[key];
      } else {
        updateObject[key] = updates[key];
      }
    });

    // Add lastModifiedBy
    updateObject.lastModifiedBy = req.user.id;

    // Update all products
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateObject }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} product(s)`,
      data: {
        updatedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Error in bulkUpdateProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/v1/admin/products/:id/duplicate
 * Duplicate existing product
 * @access Private (Admin)
 */
exports.duplicateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const originalProduct = await Product.findById(id).lean();
    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Remove MongoDB-specific fields
    delete originalProduct._id;
    delete originalProduct.__v;
    delete originalProduct.createdAt;
    delete originalProduct.updatedAt;
    delete originalProduct.views;
    delete originalProduct.clicks;
    delete originalProduct.addedToCart;
    delete originalProduct.purchased;
    delete originalProduct.wishlistedBy;
    delete originalProduct.averageRating;
    delete originalProduct.totalReviews;
    delete originalProduct.ratingDistribution;

    // Generate new slug
    let slug = generateSlug(`${originalProduct.title} Copy`);
    let slugExists = await Product.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(originalProduct.title)}-copy-${counter}`;
      slugExists = await Product.findOne({ slug });
      counter++;
    }

    // Generate new design code
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const designCode = `LC-${year}-${random}`;

    // Generate new SKU
    const sku = `LC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create duplicated product
    const duplicatedProduct = await Product.create({
      ...originalProduct,
      title: `${originalProduct.title} (Copy)`,
      slug,
      designCode,
      'inventory.sku': sku,
      isActive: false, // Set as inactive by default
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      createdBy: req.user.id
    });

    await duplicatedProduct.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      data: duplicatedProduct
    });

  } catch (error) {
    console.error('Error in duplicateProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/v1/admin/products/export
 * Export products to CSV
 * @access Private (Admin)
 */
exports.exportProducts = async (req, res) => {
  try {
    const { search, category, status, featured, productType } = req.query;

    // Build filter (same as getAllProductsAdmin)
    const filter = { isDeleted: { $ne: true } };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { designCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (status) filter['availability.status'] = status;
    if (featured === 'true') filter.isFeatured = true;
    if (productType) filter.productType = productType;

    // Get all products matching filter
    const products = await Product.find(filter)
      .populate('category', 'name')
      .select('title designCode inventory.sku pricing.basePrice availability.status isActive isFeatured category createdAt')
      .lean();

    // Generate CSV
    const { generateProductCSV } = require('../utils/csvGenerator');
    const csvContent = generateProductCSV(products);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=products-export-${Date.now()}.csv`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error in exportProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = exports;