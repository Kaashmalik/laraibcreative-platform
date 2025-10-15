'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import ImageUploadMultiple from '@/components/admin/ImageUploadMultiple';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { generateSlug, generateSKU } from '@/lib/utils';

/**
 * Product Form Component
 * 
 * Complete form for creating/editing products with:
 * - Basic information (title, description, SKU)
 * - Category and subcategory
 * - Multiple image upload
 * - Fabric details
 * - Pricing (base price, custom stitching charge, discount)
 * - SEO fields
 * - Availability status
 * - Featured product toggle
 * - Form validation
 * - Auto-save draft
 * 
 * @param {Object} props
 * @param {Object} props.initialData - Existing product data (for edit mode)
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {Function} props.onPreview - Preview handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.isEdit - Edit mode flag
 * @returns {JSX.Element}
 */
export default function ProductForm({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  onPreview,
  loading = false,
  isEdit = false 
}) {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    description: '',
    category: '',
    subcategory: '',
    images: [],
    primaryImage: '',
    fabric: {
      type: '',
      composition: '',
      care: ''
    },
    pricing: {
      basePrice: '',
      customStitchingCharge: '',
      discount: 0
    },
    availability: 'in-stock',
    featured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    }
  });
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  
  /**
   * Load initial data if editing
   */
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        sku: initialData.sku || '',
        description: initialData.description || '',
        category: initialData.category?._id || initialData.category || '',
        subcategory: initialData.subcategory || '',
        images: initialData.images || [],
        primaryImage: initialData.primaryImage || '',
        fabric: {
          type: initialData.fabric?.type || '',
          composition: initialData.fabric?.composition || '',
          care: initialData.fabric?.care || ''
        },
        pricing: {
          basePrice: initialData.pricing?.basePrice || '',
          customStitchingCharge: initialData.pricing?.customStitchingCharge || '',
          discount: initialData.pricing?.discount || 0
        },
        availability: initialData.availability || 'in-stock',
        featured: initialData.featured || false,
        seo: {
          metaTitle: initialData.seo?.metaTitle || '',
          metaDescription: initialData.seo?.metaDescription || '',
          keywords: initialData.seo?.keywords || []
        }
      });
    }
  }, [initialData, isEdit]);
  
  /**
   * Fetch categories
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  /**
   * Fetch subcategories when category changes
   */
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      setSubcategories(selectedCategory?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [formData.category, categories]);
  
  /**
   * Auto-generate slug from title
   */
  useEffect(() => {
    if (formData.title && !isEdit) {
      const slug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEdit]);
  
  /**
   * Auto-generate SKU if empty
   */
  useEffect(() => {
    if (!formData.sku && formData.title) {
      const sku = generateSKU(formData.title);
      setFormData(prev => ({ ...prev, sku }));
    }
  }, [formData.title, formData.sku]);
  
  /**
   * Track form changes
   */
  useEffect(() => {
    if (!isEdit || (isEdit && initialData)) {
      setIsDirty(true);
      sessionStorage.setItem('productFormDirty', 'true');
    }
  }, [formData, isEdit, initialData]);
  
  /**
   * Handle input changes
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  /**
   * Handle nested object changes (fabric, pricing, seo)
   */
  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };
  
  /**
   * Handle image upload
   */
  const handleImagesChange = (images) => {
    setFormData(prev => ({
      ...prev,
      images,
      primaryImage: images[0] || prev.primaryImage
    }));
  };
  
  /**
   * Handle primary image selection
   */
  const handlePrimaryImageChange = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      primaryImage: imageUrl
    }));
  };
  
  /**
   * Handle keyword addition
   */
  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const keywords = formData.seo.keywords;
      if (!keywords.includes(keywordInput.trim())) {
        setFormData(prev => ({
          ...prev,
          seo: {
            ...prev.seo,
            keywords: [...prev.seo.keywords, keywordInput.trim()]
          }
        }));
      }
      setKeywordInput('');
    }
  };
  
  /**
   * Handle keyword removal
   */
  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };
  
  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Product slug is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'Product SKU is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    // Pricing validation
    if (!formData.pricing.basePrice || formData.pricing.basePrice <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
    }
    
    if (formData.pricing.discount < 0 || formData.pricing.discount > 100) {
      newErrors.discount = 'Discount must be between 0 and 100';
    }
    
    // SEO validation
    if (formData.seo.metaDescription && formData.seo.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should be under 160 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = (e, draft = false) => {
    e.preventDefault();
    
    // Validate only if publishing (not draft)
    if (!draft && !validateForm()) {
      return;
    }
    
    // Clear dirty flag
    sessionStorage.removeItem('productFormDirty');
    setIsDirty(false);
    
    // Submit form
    onSubmit(formData, draft);
  };
  
  /**
   * Handle preview
   */
  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };
  
  /**
   * Calculate final price after discount
   */
  const calculateFinalPrice = () => {
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;
    const discount = parseFloat(formData.pricing.discount) || 0;
    return basePrice - (basePrice * discount / 100);
  };
  
  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {/* Basic Information */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Basic Information
        </h2>
        
        <div className="space-y-4">
          {/* Title */}
          <div>
            <Input
              label="Product Title *"
              placeholder="e.g., Red Velvet Bridal Lehnga"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={errors.title}
              helperText="Choose a descriptive, keyword-rich title"
            />
          </div>
          
          {/* Slug and SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="URL Slug *"
              placeholder="red-velvet-bridal-lehnga"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              error={errors.slug}
              helperText="Auto-generated from title"
            />
            
            <Input
              label="SKU (Stock Keeping Unit) *"
              placeholder="LC-BRD-001"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              error={errors.sku}
              helperText="Unique product identifier"
            />
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Write a detailed product description including fabric details, care instructions, and styling suggestions..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Category */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Category
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Category *"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            error={errors.category}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
          
          <Select
            label="Subcategory"
            value={formData.subcategory}
            onChange={(e) => handleChange('subcategory', e.target.value)}
            disabled={!formData.category || subcategories.length === 0}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map(sub => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>
      </section>
      
      {/* Images */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Product Images *
        </h2>
        
        <ImageUploadMultiple
          images={formData.images}
          primaryImage={formData.primaryImage}
          onImagesChange={handleImagesChange}
          onPrimaryImageChange={handlePrimaryImageChange}
          maxImages={10}
          error={errors.images}
        />
        
        <p className="mt-2 text-sm text-gray-600">
          Upload at least 5 high-quality images from different angles. First image will be the primary image.
        </p>
      </section>
      
      {/* Fabric Details */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Fabric Details
        </h2>
        
        <div className="space-y-4">
          <Select
            label="Fabric Type"
            value={formData.fabric.type}
            onChange={(e) => handleNestedChange('fabric', 'type', e.target.value)}
          >
            <option value="">Select Fabric</option>
            <option value="lawn">Lawn</option>
            <option value="chiffon">Chiffon</option>
            <option value="silk">Silk</option>
            <option value="cotton">Cotton</option>
            <option value="velvet">Velvet</option>
            <option value="organza">Organza</option>
            <option value="linen">Linen</option>
            <option value="georgette">Georgette</option>
            <option value="khaddar">Khaddar</option>
            <option value="karandi">Karandi</option>
            <option value="jamawar">Jamawar</option>
            <option value="other">Other</option>
          </Select>
          
          <Textarea
            label="Fabric Composition"
            placeholder="e.g., 100% Pure Silk, 70% Cotton 30% Polyester"
            value={formData.fabric.composition}
            onChange={(e) => handleNestedChange('fabric', 'composition', e.target.value)}
            rows={2}
          />
          
          <Textarea
            label="Care Instructions"
            placeholder="e.g., Dry clean only, Hand wash in cold water, Iron on low heat"
            value={formData.fabric.care}
            onChange={(e) => handleNestedChange('fabric', 'care', e.target.value)}
            rows={3}
          />
        </div>
      </section>
      
      {/* Pricing */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Pricing
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Base Price (PKR) *"
              type="number"
              placeholder="5000"
              value={formData.pricing.basePrice}
              onChange={(e) => handleNestedChange('pricing', 'basePrice', e.target.value)}
              error={errors.basePrice}
              min="0"
              step="0.01"
            />
            
            <Input
              label="Custom Stitching Charge (PKR)"
              type="number"
              placeholder="2000"
              value={formData.pricing.customStitchingCharge}
              onChange={(e) => handleNestedChange('pricing', 'customStitchingCharge', e.target.value)}
              min="0"
              step="0.01"
              helperText="Additional charge for custom stitching"
            />
            
            <Input
              label="Discount (%)"
              type="number"
              placeholder="0"
              value={formData.pricing.discount}
              onChange={(e) => handleNestedChange('pricing', 'discount', e.target.value)}
              error={errors.discount}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          
          {/* Price Preview */}
          {formData.pricing.basePrice && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-900 font-medium">Final Price</p>
                  {formData.pricing.discount > 0 && (
                    <p className="text-xs text-blue-700 line-through">
                      PKR {parseFloat(formData.pricing.basePrice).toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  PKR {calculateFinalPrice().toLocaleString()}
                </p>
              </div>
              {formData.pricing.discount > 0 && (
                <p className="text-xs text-blue-700 mt-2">
                  You save PKR {(parseFloat(formData.pricing.basePrice) - calculateFinalPrice()).toLocaleString()} ({formData.pricing.discount}% off)
                </p>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Availability */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Availability
        </h2>
        
        <div className="space-y-4">
          <Select
            label="Availability Status"
            value={formData.availability}
            onChange={(e) => handleChange('availability', e.target.value)}
          >
            <option value="in-stock">In Stock (Ready to Ship)</option>
            <option value="custom-only">Custom Order Only</option>
            <option value="out-of-stock">Out of Stock</option>
          </Select>
          
          <Checkbox
            label="Featured Product"
            checked={formData.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            helperText="Featured products appear on homepage and category highlights"
          />
        </div>
      </section>
      
      {/* SEO Optimization */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          SEO Optimization
        </h2>
        
        <div className="space-y-4">
          <Input
            label="Meta Title"
            placeholder="Leave empty to use product title"
            value={formData.seo.metaTitle}
            onChange={(e) => handleNestedChange('seo', 'metaTitle', e.target.value)}
            maxLength={60}
            helperText={`${formData.seo.metaTitle.length}/60 characters`}
          />
          
          <div>
            <Textarea
              label="Meta Description"
              placeholder="Brief description for search engines (150-160 characters)"
              value={formData.seo.metaDescription}
              onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
              rows={3}
              maxLength={160}
              error={errors.metaDescription}
            />
            <p className="mt-1 text-xs text-gray-600">
              {formData.seo.metaDescription.length}/160 characters
            </p>
          </div>
          
          <div>
            <Input
              label="Keywords"
              placeholder="Type keyword and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              helperText="Press Enter to add keyword"
            />
            
            {/* Keywords Pills */}
            {formData.seo.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.seo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <div className="flex items-center gap-3">
          {onPreview && (
            <Button
              type="button"
              variant="outlined"
              onClick={handlePreviewClick}
              icon={<Eye size={18} />}
              disabled={loading}
            >
              Preview
            </Button>
          )}
          
          <Button
            type="button"
            variant="outlined"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            Save Draft
          </Button>
          
          <Button
            type="submit"
            loading={loading}
            icon={<Save size={18} />}
          >
            {isEdit ? 'Update Product' : 'Publish Product'}
          </Button>
        </div>
      </div>
      
      {/* Unsaved Changes Warning */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm text-yellow-800">
            You have unsaved changes
          </p>
        </div>
      )}
    </form>
  );
}