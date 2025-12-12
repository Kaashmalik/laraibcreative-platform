// ==========================================
// PRODUCT SERVICE - TiDB Implementation
// ==========================================
// Replaces MongoDB Product model with SQL queries
// ==========================================

const { execute, queryOne, executeUpdate } = require('../config/tidb');
const { generateSlug } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

class ProductService {
  /**
   * Get all products with filtering and pagination
   */
  async getAllProducts(options = {}) {
    const {
      page = 1,
      limit = 12,
      sort = 'created_at DESC',
      search = '',
      category = '',
      subcategory = '',
      fabric = '',
      minPrice = '',
      maxPrice = '',
      occasion = '',
      color = '',
      availability = '',
      featured = '',
      type = ''
    } = options;

    // Build WHERE conditions
    const conditions = ['is_deleted = FALSE', 'is_active = TRUE'];
    const params = [];

    // Search condition
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR design_code LIKE ? OR JSON_EXTRACT(seo, "$.keywords") LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      conditions.push('category_id = ?');
      params.push(category);
    }

    // Subcategory filter
    if (subcategory) {
      conditions.push('subcategory LIKE ?');
      params.push(`%${subcategory}%`);
    }

    // Fabric filter
    if (fabric) {
      const fabrics = fabric.split(',').map(f => f.trim());
      const fabricConditions = fabrics.map(() => 'JSON_EXTRACT(fabric, "$.type") LIKE ?').join(' OR ');
      conditions.push(`(${fabricConditions})`);
      fabrics.forEach(f => params.push(`%${f}%`));
    }

    // Price range filter
    if (minPrice !== '' || maxPrice !== '') {
      if (minPrice !== '') {
        conditions.push('JSON_EXTRACT(pricing, "$.basePrice") >= ?');
        params.push(parseFloat(minPrice));
      }
      if (maxPrice !== '') {
        conditions.push('JSON_EXTRACT(pricing, "$.basePrice") <= ?');
        params.push(parseFloat(maxPrice));
      }
    }

    // Occasion filter
    if (occasion) {
      const occasions = occasion.split(',').map(o => o.trim());
      const occasionConditions = occasions.map(() => 'occasion = ?').join(' OR ');
      conditions.push(`(${occasionConditions})`);
      params.push(...occasions);
    }

    // Color filter
    if (color) {
      conditions.push('(JSON_CONTAINS(available_colors, JSON_QUOTE(?)) OR JSON_CONTAINS(JSON_EXTRACT(available_colors, "$[*].name"), ?))');
      const colors = color.split(',').map(c => c.trim());
      params.push(colors[0], colors[0]);
    }

    // Availability filter
    if (availability) {
      const availabilities = availability.split(',').map(a => a.trim());
      const availabilityConditions = availabilities.map(() => 'availability_status = ?').join(' OR ');
      conditions.push(`(${availabilityConditions})`);
      params.push(...availabilities);
    }

    // Featured filter
    if (featured === 'true') {
      conditions.push('is_featured = TRUE');
    }

    // Type filter
    if (type) {
      const types = type.split(',').map(t => t.trim());
      const typeConditions = types.map(() => 'type = ?').join(' OR ');
      conditions.push(`(${typeConditions})`);
      params.push(...types);
    }

    // Build the query
    const whereClause = conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const countResult = await queryOne(countQuery, params);
    const total = countResult.total;

    // Get products
    const productsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${sort}
      LIMIT ? OFFSET ?
    `;
    
    const products = await execute(productsQuery, [...params, parseInt(limit), offset]);

    // Format products to match frontend expectations
    const formattedProducts = products.map(product => ({
      ...product,
      // Parse JSON fields
      fabric: typeof product.fabric === 'string' ? JSON.parse(product.fabric) : product.fabric,
      pricing: typeof product.pricing === 'string' ? JSON.parse(product.pricing) : product.pricing,
      customization: typeof product.customization === 'string' ? JSON.parse(product.customization) : product.customization,
      size_availability: typeof product.size_availability === 'string' ? JSON.parse(product.size_availability) : product.size_availability,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      available_colors: typeof product.available_colors === 'string' ? JSON.parse(product.available_colors) : product.available_colors,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      features: typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
      whats_included: typeof product.whats_included === 'string' ? JSON.parse(product.whats_included) : product.whats_included,
      seo: typeof product.seo === 'string' ? JSON.parse(product.seo) : product.seo,
      inventory: typeof product.inventory === 'string' ? JSON.parse(product.inventory) : product.inventory,
      rating_distribution: typeof product.rating_distribution === 'string' ? JSON.parse(product.rating_distribution) : product.rating_distribution,
      related_products: typeof product.related_products === 'string' ? JSON.parse(product.related_products) : product.related_products,
      embroidery_details: typeof product.embroidery_details === 'string' ? JSON.parse(product.embroidery_details) : product.embroidery_details,
      
      // Add category object for compatibility
      category: product.category_id ? {
        _id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      } : null,
      
      // Clean up duplicate fields
      category_name: undefined,
      category_slug: undefined
    }));

    return {
      products: formattedProducts,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        productsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrevPage: parseInt(page) > 1
      }
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_deleted = FALSE
    `;
    
    const product = await queryOne(query, [id]);
    
    if (!product) return null;

    // Parse JSON fields
    return {
      ...product,
      fabric: typeof product.fabric === 'string' ? JSON.parse(product.fabric) : product.fabric,
      pricing: typeof product.pricing === 'string' ? JSON.parse(product.pricing) : product.pricing,
      customization: typeof product.customization === 'string' ? JSON.parse(product.customization) : product.customization,
      size_availability: typeof product.size_availability === 'string' ? JSON.parse(product.size_availability) : product.size_availability,
      images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
      available_colors: typeof product.available_colors === 'string' ? JSON.parse(product.available_colors) : product.available_colors,
      tags: typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags,
      features: typeof product.features === 'string' ? JSON.parse(product.features) : product.features,
      whats_included: typeof product.whats_included === 'string' ? JSON.parse(product.whats_included) : product.whats_included,
      seo: typeof product.seo === 'string' ? JSON.parse(product.seo) : product.seo,
      inventory: typeof product.inventory === 'string' ? JSON.parse(product.inventory) : product.inventory,
      rating_distribution: typeof product.rating_distribution === 'string' ? JSON.parse(product.rating_distribution) : product.rating_distribution,
      related_products: typeof product.related_products === 'string' ? JSON.parse(product.related_products) : product.related_products,
      embroidery_details: typeof product.embroidery_details === 'string' ? JSON.parse(product.embroidery_details) : product.embroidery_details,
      
      // Add category object
      category: product.category_id ? {
        _id: product.category_id,
        name: product.category_name,
        slug: product.category_slug
      } : null,
      
      // Clean up
      category_name: undefined,
      category_slug: undefined
    };
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug) {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_deleted = FALSE
    `;
    
    const product = await queryOne(query, [slug]);
    
    if (!product) return null;

    // Parse JSON fields (same as above)
    return this._parseProductJson(product);
  }

  /**
   * Create new product
   */
  async createProduct(productData, userId = null) {
    try {
      // Generate UUID for the product
      const productId = uuidv4();

      // Generate unique slug
      let slug = generateSlug(productData.title);
      let slugExists = await this.getProductBySlug(slug);
      let counter = 1;

      while (slugExists) {
        slug = `${generateSlug(productData.title)}-${counter}`;
        slugExists = await this.getProductBySlug(slug);
        counter++;
      }

      // Generate design code if not provided
      const designCode = productData.designCode || await this._generateDesignCode();

      // Generate SKU if not provided
      const sku = productData.inventory?.sku || `LC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Handle images
      const images = productData.images || [];
      const primaryImage = images.length > 0 ? images[0].url || images[0] : '';

      // Prepare inventory with SKU
      const inventory = {
        ...productData.inventory,
        sku,
        trackInventory: productData.inventory?.trackInventory || false,
        stockQuantity: productData.inventory?.stockQuantity || 0,
        lowStockThreshold: productData.inventory?.lowStockThreshold || 5
      };

      // Prepare SEO data
      const seo = {
        metaTitle: productData.seo?.metaTitle || productData.title,
        metaDescription: productData.seo?.metaDescription || productData.description?.substring(0, 160),
        keywords: productData.seo?.keywords || [],
        focusKeyword: productData.seo?.focusKeyword || '',
        ogImage: primaryImage
      };

      const query = `
        INSERT INTO products (
          id, title, slug, description, short_description, design_code,
          category_id, category_snapshot_name, category_snapshot_slug,
          subcategory, occasion, tags, images, primary_image, thumbnail_image,
          available_colors, fabric, pricing, customization, size_availability,
          product_type, type, embroidery_details, availability_status,
          inventory, features, whats_included, is_active, is_featured,
          is_new_arrival, is_best_seller, seo, created_by, publishing_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
      `;

      const params = [
        productId,
        productData.title,
        slug,
        productData.description,
        productData.shortDescription || '',
        designCode,
        productData.category,
        '', // Will be updated by trigger or separate query
        '',
        productData.subcategory || '',
        productData.occasion || '',
        JSON.stringify(productData.tags || []),
        JSON.stringify(images),
        primaryImage,
        primaryImage,
        JSON.stringify(productData.availableColors || []),
        JSON.stringify(productData.fabric || {}),
        JSON.stringify(productData.pricing || {}),
        JSON.stringify(productData.customization || {}),
        JSON.stringify(productData.sizeAvailability || {}),
        productData.productType || 'both',
        productData.type || 'ready-made',
        JSON.stringify(productData.embroideryDetails || {}),
        productData.availability || 'made-to-order',
        JSON.stringify(inventory),
        JSON.stringify(productData.features || []),
        JSON.stringify(productData.whatsIncluded || []),
        productData.isActive !== undefined ? productData.isActive : true,
        productData.isFeatured || false,
        productData.isNewArrival || false,
        productData.isBestSeller || false,
        JSON.stringify(seo),
        userId
      ];

      await execute(query, params);
      
      // Update category snapshot
      await this._updateCategorySnapshot(productId, productData.category);

      return await this.getProductById(productId);
    } catch (error) {
      console.error('ProductService.createProduct error:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Update product
   */
  async updateProduct(id, updateData, userId = null) {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) return null;

    // If title is being updated, regenerate slug
    if (updateData.title && updateData.title !== existingProduct.title) {
      let slug = generateSlug(updateData.title);
      let slugExists = await this.getProductBySlug(slug);
      let counter = 1;

      while (slugExists && slugExists.id !== id) {
        slug = `${generateSlug(updateData.title)}-${counter}`;
        slugExists = await this.getProductBySlug(slug);
        counter++;
      }
      updateData.slug = slug;
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];

    const allowedFields = [
      'title', 'slug', 'description', 'short_description', 'design_code',
      'category_id', 'subcategory', 'occasion', 'images', 'primary_image',
      'thumbnail_image', 'available_colors', 'fabric', 'pricing',
      'customization', 'size_availability', 'product_type', 'type',
      'embroidery_details', 'availability_status', 'inventory',
      'features', 'whats_included', 'is_active', 'is_featured',
      'is_new_arrival', 'is_best_seller', 'seo', 'tags'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        
        // Handle JSON fields
        if (['fabric', 'pricing', 'customization', 'size_availability', 'inventory', 
             'seo', 'images', 'available_colors', 'tags', 'features', 'whats_included',
             'embroidery_details'].includes(field)) {
          params.push(JSON.stringify(updateData[field]));
        } else {
          params.push(updateData[field]);
        }
      }
    });

    if (updateFields.length === 0) return existingProduct;

    updateFields.push('last_modified_by = ?');
    params.push(userId);
    params.push(id);

    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    await execute(query, params);

    // Update category snapshot if category changed
    if (updateData.category_id && updateData.category_id !== existingProduct.category_id) {
      await this._updateCategorySnapshot(id, updateData.category_id);
    }

    return await this.getProductById(id);
  }

  /**
   * Delete product (soft delete)
   */
  async deleteProduct(id, userId = null) {
    const query = `
      UPDATE products 
      SET is_deleted = TRUE, deleted_at = NOW(), deleted_by = ?, is_active = FALSE
      WHERE id = ?
    `;
    
    const result = await execute(query, [userId, id]);
    return result.affectedRows > 0;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8) {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_featured = TRUE AND p.is_active = TRUE AND p.is_deleted = FALSE
      ORDER BY p.created_at DESC
      LIMIT ?
    `;
    
    const products = await execute(query, [limit]);
    return products.map(p => this._parseProductJson(p));
  }

  /**
   * Increment product views
   */
  async incrementViews(id) {
    const query = 'UPDATE products SET views = views + 1 WHERE id = ?';
    await execute(query, [id]);
  }

  /**
   * Helper method to parse JSON fields
   */
  _parseProductJson(product) {
    const jsonFields = [
      'fabric', 'pricing', 'customization', 'size_availability',
      'images', 'available_colors', 'tags', 'features', 'whats_included',
      'seo', 'inventory', 'rating_distribution', 'related_products',
      'embroidery_details'
    ];

    const parsed = { ...product };
    
    jsonFields.forEach(field => {
      if (parsed[field]) {
        parsed[field] = typeof parsed[field] === 'string' ? JSON.parse(parsed[field]) : parsed[field];
      }
    });

    // Add category object
    parsed.category = product.category_id ? {
      _id: product.category_id,
      name: product.category_name,
      slug: product.category_slug
    } : null;

    // Clean up
    delete parsed.category_name;
    delete parsed.category_slug;

    return parsed;
  }

  /**
   * Generate unique design code
   */
  async _generateDesignCode() {
    const year = new Date().getFullYear();
    const prefix = `LC-${year}-`;
    
    const query = `
      SELECT design_code FROM products 
      WHERE design_code LIKE ? 
      ORDER BY design_code DESC 
      LIMIT 1
    `;
    
    const result = await queryOne(query, [`${prefix}%`]);
    
    if (!result) {
      return `${prefix}001`;
    }
    
    const lastNumber = parseInt(result.design_code.split('-')[2]);
    const newNumber = (lastNumber + 1).toString().padStart(3, '0');
    
    return `${prefix}${newNumber}`;
  }

  /**
   * Update category snapshot
   */
  async _updateCategorySnapshot(productId, categoryId) {
    const categoryQuery = 'SELECT name, slug FROM categories WHERE id = ?';
    const category = await queryOne(categoryQuery, [categoryId]);
    
    if (category) {
      const updateQuery = `
        UPDATE products 
        SET category_snapshot_name = ?, category_snapshot_slug = ?
        WHERE id = ?
      `;
      await execute(updateQuery, [category.name, category.slug, productId]);
    }
  }
}

module.exports = new ProductService();
