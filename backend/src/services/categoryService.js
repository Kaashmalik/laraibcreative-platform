// ==========================================
// CATEGORY SERVICE - TiDB Implementation
// ==========================================
// Replaces MongoDB Category model with SQL queries
// ==========================================

const { execute, queryOne, executeUpdate } = require('../config/tidb');
const { generateSlug } = require('../utils/helpers');
const { v4: uuidv4 } = require('uuid');

class CategoryService {
  /**
   * Get all categories with optional filtering
   */
  async getAllCategories(options = {}) {
    const {
      activeOnly = true,
      parentOnly = false,
      includeSubcategories = false,
      sortBy = 'display_order ASC'
    } = options;

    try {
      let query = `
        SELECT c.*, 
               pc.name as parent_name,
               pc.slug as parent_slug,
               (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_deleted = FALSE AND is_active = TRUE) as product_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_category_id = pc.id
      `;

      const conditions = [];
      const params = [];

      if (activeOnly) {
        conditions.push('c.is_active = TRUE');
      }

      if (parentOnly) {
        conditions.push('c.parent_category_id IS NULL');
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY ${sortBy}`;

      const categories = await execute(query, params);

      // Format categories to match frontend expectations
      const formattedCategories = categories.map(category => ({
        ...category,
        _id: category.id,
        seo: {
          metaTitle: category.seo_meta_title,
          metaDescription: category.seo_meta_description,
          keywords: typeof category.seo_keywords === 'string' ? JSON.parse(category.seo_keywords) : category.seo_keywords
        },
        parentCategory: category.parent_category_id ? {
          _id: category.parent_category_id,
          name: category.parent_name,
          slug: category.parent_slug
        } : null,
        // Clean up duplicate fields
        parent_name: undefined,
        parent_slug: undefined
      }));

      // Include subcategories if requested
      if (includeSubcategories) {
        for (const category of formattedCategories) {
          category.subcategories = await this.getSubcategories(category.id);
        }
      }

      return formattedCategories;
    } catch (error) {
      console.error('CategoryService.getAllCategories error:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id) {
    try {
      const query = `
        SELECT c.*, 
               pc.name as parent_name,
               pc.slug as parent_slug,
               (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_deleted = FALSE AND is_active = TRUE) as product_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_category_id = pc.id
        WHERE c.id = ?
      `;

      const category = await queryOne(query, [id]);
      
      if (!category) return null;

      return {
        ...category,
        _id: category.id,
        seo: {
          metaTitle: category.seo_meta_title,
          metaDescription: category.seo_meta_description,
          keywords: typeof category.seo_keywords === 'string' ? JSON.parse(category.seo_keywords) : category.seo_keywords
        },
        parentCategory: category.parent_category_id ? {
          _id: category.parent_category_id,
          name: category.parent_name,
          slug: category.parent_slug
        } : null,
        subcategories: await this.getSubcategories(category.id),
        // Clean up
        parent_name: undefined,
        parent_slug: undefined
      };
    } catch (error) {
      console.error('CategoryService.getCategoryById error:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug) {
    try {
      const query = `
        SELECT c.*, 
               pc.name as parent_name,
               pc.slug as parent_slug,
               (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_deleted = FALSE AND is_active = TRUE) as product_count
        FROM categories c
        LEFT JOIN categories pc ON c.parent_category_id = pc.id
        WHERE c.slug = ?
      `;

      const category = await queryOne(query, [slug]);
      
      if (!category) return null;

      return this._formatCategory(category);
    } catch (error) {
      console.error('CategoryService.getCategoryBySlug error:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
  }

  /**
   * Get parent categories only
   */
  async getParentCategories(activeOnly = true) {
    return this.getAllCategories({ activeOnly, parentOnly: true });
  }

  /**
   * Get subcategories for a parent category
   */
  async getSubcategories(parentId, activeOnly = true) {
    try {
      const conditions = ['parent_category_id = ?'];
      const params = [parentId];

      if (activeOnly) {
        conditions.push('is_active = TRUE');
      }

      const query = `
        SELECT id, name, slug, display_order, is_active, is_featured, icon, color, product_count
        FROM categories
        WHERE ${conditions.join(' AND ')}
        ORDER BY display_order ASC
      `;

      const subcategories = await execute(query, params);
      
      return subcategories.map(sub => ({
        ...sub,
        _id: sub.id
      }));
    } catch (error) {
      console.error('CategoryService.getSubcategories error:', error);
      throw new Error(`Failed to fetch subcategories: ${error.message}`);
    }
  }

  /**
   * Get category tree structure
   */
  async getCategoryTree(activeOnly = true) {
    try {
      const categories = await this.getAllCategories({ activeOnly, includeSubcategories: false });
      const categoryMap = {};
      const tree = [];

      // Create map
      categories.forEach(cat => {
        categoryMap[cat.id] = { ...cat, subcategories: [] };
      });

      // Build tree
      categories.forEach(cat => {
        if (cat.parent_category_id) {
          const parent = categoryMap[cat.parent_category_id];
          if (parent) {
            parent.subcategories.push(categoryMap[cat.id]);
          }
        } else {
          tree.push(categoryMap[cat.id]);
        }
      });

      return tree;
    } catch (error) {
      console.error('CategoryService.getCategoryTree error:', error);
      throw new Error(`Failed to fetch category tree: ${error.message}`);
    }
  }

  /**
   * Create new category
   */
  async createCategory(categoryData, userId = null) {
    try {
      // Generate UUID
      const categoryId = uuidv4();

      // Generate unique slug
      let slug = generateSlug(categoryData.name);
      let slugExists = await this.getCategoryBySlug(slug);
      let counter = 1;

      while (slugExists) {
        slug = `${generateSlug(categoryData.name)}-${counter}`;
        slugExists = await this.getCategoryBySlug(slug);
        counter++;
      }

      // Validate parent category if provided
      if (categoryData.parentCategory) {
        const parent = await this.getCategoryById(categoryData.parentCategory);
        if (!parent) {
          throw new Error('Parent category not found');
        }
      }

      const query = `
        INSERT INTO categories (
          id, name, slug, description, image, image_public_id,
          parent_category_id, display_order, is_active, is_featured,
          icon, color, seo_meta_title, seo_meta_description, seo_keywords,
          created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        categoryId,
        categoryData.name,
        slug,
        categoryData.description || '',
        categoryData.image || '',
        categoryData.imagePublicId || '',
        categoryData.parentCategory || null,
        categoryData.displayOrder || 0,
        categoryData.isActive !== undefined ? categoryData.isActive : true,
        categoryData.isFeatured || false,
        categoryData.icon || '',
        categoryData.color || '#D946A6',
        categoryData.seo?.metaTitle || '',
        categoryData.seo?.metaDescription || '',
        JSON.stringify(categoryData.seo?.keywords || []),
        userId,
        userId
      ];

      await execute(query, params);

      return await this.getCategoryById(categoryId);
    } catch (error) {
      console.error('CategoryService.createCategory error:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Update category
   */
  async updateCategory(id, updateData, userId = null) {
    try {
      const existingCategory = await this.getCategoryById(id);
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // If name is being updated, regenerate slug
      if (updateData.name && updateData.name !== existingCategory.name) {
        let slug = generateSlug(updateData.name);
        let slugExists = await this.getCategoryBySlug(slug);
        let counter = 1;

        while (slugExists && slugExists.id !== id) {
          slug = `${generateSlug(updateData.name)}-${counter}`;
          slugExists = await this.getCategoryBySlug(slug);
          counter++;
        }
        updateData.slug = slug;
      }

      // Build dynamic update query
      const updateFields = [];
      const params = [];

      const allowedFields = [
        'name', 'slug', 'description', 'image', 'image_public_id',
        'parent_category_id', 'display_order', 'is_active', 'is_featured',
        'icon', 'color', 'seo_meta_title', 'seo_meta_description', 'seo_keywords'
      ];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = ?`);
          
          if (field === 'seo_keywords') {
            params.push(JSON.stringify(updateData[field]));
          } else {
            params.push(updateData[field]);
          }
        }
      });

      if (updateFields.length === 0) return existingCategory;

      updateFields.push('updated_by = ?', 'updated_at = NOW()');
      params.push(userId, id);

      const query = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`;
      await execute(query, params);

      return await this.getCategoryById(id);
    } catch (error) {
      console.error('CategoryService.updateCategory error:', error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id, userId = null) {
    try {
      // Check if category has products
      const productCountQuery = 'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_deleted = FALSE';
      const productResult = await queryOne(productCountQuery, [id]);
      
      if (productResult.count > 0) {
        throw new Error(`Cannot delete category with ${productResult.count} products. Please reassign products first.`);
      }

      // Check if category has subcategories
      const subcategoryCountQuery = 'SELECT COUNT(*) as count FROM categories WHERE parent_category_id = ?';
      const subcategoryResult = await queryOne(subcategoryCountQuery, [id]);
      
      if (subcategoryResult.count > 0) {
        throw new Error(`Cannot delete category with ${subcategoryResult.count} subcategories. Please delete subcategories first.`);
      }

      const query = 'UPDATE categories SET is_active = FALSE, updated_by = ? WHERE id = ?';
      const result = await execute(query, [userId, id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('CategoryService.deleteCategory error:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  /**
   * Update product count for a category
   */
  async updateProductCount(categoryId) {
    try {
      const query = `
        UPDATE categories 
        SET product_count = (
          SELECT COUNT(*) 
          FROM products 
          WHERE category_id = ? AND is_deleted = FALSE AND is_active = TRUE
        ),
        updated_at = NOW()
        WHERE id = ?
      `;
      
      await execute(query, [categoryId, categoryId]);
      
      return await this.getCategoryById(categoryId);
    } catch (error) {
      console.error('CategoryService.updateProductCount error:', error);
      throw new Error(`Failed to update product count: ${error.message}`);
    }
  }

  /**
   * Get featured categories
   */
  async getFeaturedCategories(limit = 6) {
    try {
      const query = `
        SELECT id, name, slug, description, image, icon, color, product_count
        FROM categories
        WHERE is_featured = TRUE AND is_active = TRUE
        ORDER BY display_order ASC
        LIMIT ?
      `;

      const categories = await execute(query, [limit]);
      
      return categories.map(cat => ({
        ...cat,
        _id: cat.id
      }));
    } catch (error) {
      console.error('CategoryService.getFeaturedCategories error:', error);
      throw new Error(`Failed to fetch featured categories: ${error.message}`);
    }
  }

  /**
   * Helper method to format category data
   */
  _formatCategory(category) {
    return {
      ...category,
      _id: category.id,
      seo: {
        metaTitle: category.seo_meta_title,
        metaDescription: category.seo_meta_description,
        keywords: typeof category.seo_keywords === 'string' ? JSON.parse(category.seo_keywords) : category.seo_keywords
      },
      parentCategory: category.parent_category_id ? {
        _id: category.parent_category_id,
        name: category.parent_name,
        slug: category.parent_slug
      } : null,
      subcategories: [], // Will be populated if needed
      // Clean up
      parent_name: undefined,
      parent_slug: undefined
    };
  }
}

module.exports = new CategoryService();
