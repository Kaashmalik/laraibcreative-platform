'use client';


import { useState, useEffect } from 'react';
import { Save, Eye, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import ImageUploadMultiple from '@/components/admin/ImageUploadMultiple';
import AIContentGenerator from '@/components/admin/AIContentGenerator';
import dynamic from 'next/dynamic';
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';
import { RichTextEditorLoading } from '@/components/shared/LoadingComponents';

// Dynamically import RichTextEditor (heavy component with editor logic)
const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="RichTextEditor">
        <RichTextEditorLoading />
      </DynamicErrorBoundary>
    ),
    ssr: false, // Editor requires browser APIs
  }
);
import { generateSlug, generateSKU } from '@/lib/utils';
import axios from '@/lib/axios';

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
    occasion: '',
    images: [],
    primaryImage: '',
    // Suit type and article info
    type: 'ready-made',
    articleName: '',
    articleCode: '',
    // Embroidery details for Hand Karhai
    embroideryDetails: {
      workType: 'none',
      complexity: 'simple',
      coverage: 'minimal',
      placement: [],
      estimatedHours: 0,
      additionalCost: 0,
      description: '',
      threadColors: []
    },
    // Suit components
    suitComponents: {
      shirt: { included: true, length: '', description: '' },
      dupatta: { included: true, fabric: '', length: '', description: '' },
      trouser: { included: true, fabric: '', length: '', description: '' }
    },
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
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [draftSaving, setDraftSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
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
        occasion: initialData.occasion || '',
        images: initialData.images || [],
        primaryImage: initialData.primaryImage || '',
        type: initialData.type || 'ready-made',
        articleName: initialData.articleName || '',
        articleCode: initialData.articleCode || '',
        embroideryDetails: {
          workType: initialData.embroideryDetails?.workType || 'none',
          complexity: initialData.embroideryDetails?.complexity || 'simple',
          coverage: initialData.embroideryDetails?.coverage || 'minimal',
          placement: initialData.embroideryDetails?.placement || [],
          estimatedHours: initialData.embroideryDetails?.estimatedHours || 0,
          additionalCost: initialData.embroideryDetails?.additionalCost || 0,
          description: initialData.embroideryDetails?.description || '',
          threadColors: initialData.embroideryDetails?.threadColors || []
        },
        suitComponents: {
          shirt: {
            included: initialData.suitComponents?.shirt?.included ?? true,
            length: initialData.suitComponents?.shirt?.length || '',
            description: initialData.suitComponents?.shirt?.description || ''
          },
          dupatta: {
            included: initialData.suitComponents?.dupatta?.included ?? true,
            fabric: initialData.suitComponents?.dupatta?.fabric || '',
            length: initialData.suitComponents?.dupatta?.length || '',
            description: initialData.suitComponents?.dupatta?.description || ''
          },
          trouser: {
            included: initialData.suitComponents?.trouser?.included ?? true,
            fabric: initialData.suitComponents?.trouser?.fabric || '',
            length: initialData.suitComponents?.trouser?.length || '',
            description: initialData.suitComponents?.trouser?.description || ''
          }
        },
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
   * Fetch categories with loading state
   */
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await Promise.race([
          axios.get('/categories', { signal: controller.signal }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Categories fetch timeout')), 10000)
          )
        ]);
        const data = response.data?.data || response.data || [];
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
          if (!(error?.code === 'ERR_CANCELED' || (typeof error.message === 'string' && error.message.toLowerCase().includes('canceled')))) { console.error('Error fetching categories:', error.message); }
        }
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
    
    return () => controller.abort();
  }, []);
  
  /**
   * Load draft from localStorage on mount (only for new products)
   */
  useEffect(() => {
    if (!isEdit) {
      try {
        const savedDraft = localStorage.getItem('productFormDraft');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // Check if draft is less than 24 hours old
          if (draft._savedAt && Date.now() - draft._savedAt < 24 * 60 * 60 * 1000) {
            delete draft._savedAt;
            setFormData(prev => ({ ...prev, ...draft }));
            setLastSaved(new Date(draft._savedAt));
          } else {
            // Clear old draft
            localStorage.removeItem('productFormDraft');
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [isEdit]);
  
  /**
   * Auto-save draft to localStorage (debounced)
   */
  useEffect(() => {
    if (isEdit) return; // Don't auto-save for edit mode
    
    const saveTimeout = setTimeout(() => {
      if (formData.title || formData.description) {
        setDraftSaving(true);
        try {
          const draftData = {
            ...formData,
            _savedAt: Date.now()
          };
          localStorage.setItem('productFormDraft', JSON.stringify(draftData));
          setLastSaved(new Date());
        } catch (error) {
          console.error('Error saving draft:', error);
        } finally {
          setDraftSaving(false);
        }
      }
    }, 2000); // Save after 2 seconds of inactivity
    
    return () => clearTimeout(saveTimeout);
  }, [formData, isEdit]);
  
  /**
   * Clear draft from localStorage
   */
  const clearDraft = () => {
    localStorage.removeItem('productFormDraft');
    setLastSaved(null);
  };
  
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
   * Handle AI-generated content application (all fields)
   */
  const handleApplyAIContent = (aiContent) => {
    setFormData(prev => ({
      ...prev,
      description: aiContent.description || prev.description,
      shortDescription: aiContent.shortDescription || prev.shortDescription,
      features: aiContent.features || prev.features,
      whatsIncluded: aiContent.whatsIncluded || prev.whatsIncluded,
      fabric: {
        ...prev.fabric,
        care: aiContent.careInstructions || prev.fabric.care
      },
      seo: {
        ...prev.seo,
        metaTitle: aiContent.metaTitle || prev.seo.metaTitle,
        metaDescription: aiContent.metaDescription || prev.seo.metaDescription,
        keywords: aiContent.keywords || prev.seo.keywords,
        focusKeyword: aiContent.focusKeyword || prev.seo.focusKeyword
      }
    }));
  };
  
  /**
   * Handle AI-generated content application (single field)
   */
  const handleApplyAIField = (fieldPath, value) => {
    if (fieldPath.includes('.')) {
      // Handle nested fields like 'seo.keywords'
      const [parent, child] = fieldPath.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [fieldPath]: value
      }));
    }
  };
  
  /**
   * Validate form - matches backend Mongoose schema requirements
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Title: required, min 5 chars, max 200 chars
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    // Description: required, min 20 chars
    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    // Category: required
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    // Images: required
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    // Fabric type: required enum
    if (!formData.fabric?.type) {
      newErrors.fabricType = 'Fabric type is required';
    }
    
    // Pricing: basePrice required and > 0
    if (!formData.pricing?.basePrice || parseFloat(formData.pricing.basePrice) <= 0) {
      newErrors.basePrice = 'Base price must be greater than 0';
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
    
    // Clear dirty flag and draft
    sessionStorage.removeItem('productFormDirty');
    localStorage.removeItem('productFormDraft');
    setIsDirty(false);
    setLastSaved(null);
    
    // Transform data before submission to match backend schema
    const transformedData = {
      ...formData,
      // Convert availability string to object format for backend
      availability: typeof formData.availability === 'string' 
        ? { status: formData.availability === 'custom-only' ? 'made-to-order' : formData.availability }
        : formData.availability,
      // Ensure pricing discount is a number
      pricing: {
        ...formData.pricing,
        basePrice: parseFloat(formData.pricing.basePrice) || 0,
        customStitchingCharge: parseFloat(formData.pricing.customStitchingCharge) || 0,
        discount: parseFloat(formData.pricing.discount) || 0
      }
    };
    
    // Submit transformed form data
    onSubmit(transformedData, draft);
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
          
          {/* AI Content Generator */}
          <AIContentGenerator
            title={formData.title}
            category={categories.find(c => c._id === formData.category)?.name || ''}
            fabricType={formData.fabric.type}
            occasion={formData.occasion || ''}
            onApplyContent={handleApplyAIContent}
            onApplyField={handleApplyAIField}
            currentContent={formData}
          />
          
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
      
      {/* Classification - Category, Type & Occasion */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Product Classification
        </h2>
        
        <div className="space-y-4">
          {/* Category, Type, Occasion in one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Category *"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                error={errors.category}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {categoriesLoading && (
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  Loading...
                </div>
              )}
            </div>
            
            <Select
              label="Product Type *"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="ready-made">Ready Made</option>
              <option value="replica">Brand Replica</option>
              <option value="karhai">Machine Karhai</option>
              <option value="hand-karhai">Hand Karhai (Artisan)</option>
            </Select>
            
            <Select
              label="Occasion"
              value={formData.occasion}
              onChange={(e) => handleChange('occasion', e.target.value)}
            >
              <option value="">Select Occasion</option>
              <option value="Bridal">Bridal</option>
              <option value="Party Wear">Party Wear</option>
              <option value="Formal">Formal</option>
              <option value="Casual">Casual</option>
              <option value="Eid">Eid</option>
              <option value="Mehndi">Mehndi</option>
              <option value="Walima">Walima</option>
              <option value="Engagement">Engagement</option>
              <option value="Everyday">Everyday</option>
            </Select>
          </div>
          
          {/* Article Name & Code - optional identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Article/Design Name"
              placeholder="e.g., Rose Garden, Royal Elegance"
              value={formData.articleName}
              onChange={(e) => handleChange('articleName', e.target.value)}
              helperText="Optional: Unique name for this design"
            />
            
            <Input
              label="Article Code"
              placeholder="e.g., HK-001, RG-2024"
              value={formData.articleCode}
              onChange={(e) => handleChange('articleCode', e.target.value)}
              helperText="Optional: Internal reference code"
            />
          </div>
        </div>
      </section>
      
      {/* Hand Karhai / Embroidery Details - Only show for karhai types */}
      {(formData.type === 'karhai' || formData.type === 'hand-karhai') && (
        <section className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-pink-200 flex items-center gap-2">
            <span className="text-2xl">âœ¨</span>
            {formData.type === 'hand-karhai' ? 'Hand Karhai Details' : 'Embroidery Details'}
          </h2>
          
          <div className="space-y-4">
            {/* Work Type and Complexity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Embroidery Work Type *"
                value={formData.embroideryDetails.workType}
                onChange={(e) => handleNestedChange('embroideryDetails', 'workType', e.target.value)}
              >
                <option value="none">None</option>
                <option value="hand-karhai">Hand Karhai</option>
                <option value="machine-embroidery">Machine Embroidery</option>
                <option value="zardozi">Zardozi (Gold Thread)</option>
                <option value="aari">Aari Work</option>
                <option value="gota-kinari">Gota Kinari</option>
                <option value="dabka">Dabka Work</option>
                <option value="kora">Kora Work</option>
                <option value="sequins">Sequins</option>
                <option value="beads">Beads Work</option>
                <option value="thread-work">Thread Work</option>
                <option value="resham">Resham (Silk Thread)</option>
                <option value="tilla">Tilla Work</option>
                <option value="mirror-work">Mirror Work</option>
                <option value="applique">Applique</option>
                <option value="cutwork">Cutwork</option>
                <option value="shadow-work">Shadow Work</option>
                <option value="chikankari">Chikankari</option>
                <option value="phulkari">Phulkari</option>
                <option value="kashmiri">Kashmiri</option>
                <option value="mixed">Mixed Techniques</option>
              </Select>
              
              <Select
                label="Complexity Level"
                value={formData.embroideryDetails.complexity}
                onChange={(e) => handleNestedChange('embroideryDetails', 'complexity', e.target.value)}
              >
                <option value="simple">Simple (Basic patterns)</option>
                <option value="moderate">Moderate (Detailed work)</option>
                <option value="intricate">Intricate (Fine details)</option>
                <option value="heavy">Heavy (Dense coverage)</option>
                <option value="bridal">Bridal (Premium quality)</option>
              </Select>
              
              <Select
                label="Coverage Area"
                value={formData.embroideryDetails.coverage}
                onChange={(e) => handleNestedChange('embroideryDetails', 'coverage', e.target.value)}
              >
                <option value="minimal">Minimal (10-20%)</option>
                <option value="partial">Partial (30-50%)</option>
                <option value="full">Full (60-80%)</option>
                <option value="heavy">Heavy (80-90%)</option>
                <option value="all-over">All-Over (90-100%)</option>
              </Select>
            </div>
            
            {/* Placement Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Embroidery Placement
              </label>
              <div className="flex flex-wrap gap-3">
                {['front-panel', 'back-panel', 'sleeves', 'neckline', 'daman', 'dupatta', 'trouser', 'border', 'motifs'].map((placement) => (
                  <label key={placement} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-pink-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.embroideryDetails.placement?.includes(placement)}
                      onChange={(e) => {
                        const currentPlacements = formData.embroideryDetails.placement || [];
                        const newPlacements = e.target.checked
                          ? [...currentPlacements, placement]
                          : currentPlacements.filter(p => p !== placement);
                        handleNestedChange('embroideryDetails', 'placement', newPlacements);
                      }}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{placement.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Estimated Hours and Additional Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Estimated Work Hours"
                type="number"
                placeholder="e.g., 40"
                value={formData.embroideryDetails.estimatedHours}
                onChange={(e) => handleNestedChange('embroideryDetails', 'estimatedHours', parseInt(e.target.value) || 0)}
                min="0"
                helperText="Approximate hours for embroidery work"
              />
              
              <Input
                label="Additional Embroidery Cost (PKR)"
                type="number"
                placeholder="e.g., 5000"
                value={formData.embroideryDetails.additionalCost}
                onChange={(e) => handleNestedChange('embroideryDetails', 'additionalCost', parseInt(e.target.value) || 0)}
                min="0"
                helperText="Extra cost for embroidery work"
              />
            </div>
            
            {/* Embroidery Description */}
            <Textarea
              label="Embroidery Description"
              placeholder="Describe the embroidery work in detail - patterns, motifs, thread colors, special techniques used..."
              value={formData.embroideryDetails.description}
              onChange={(e) => handleNestedChange('embroideryDetails', 'description', e.target.value)}
              rows={3}
              maxLength={500}
            />
            {formData.embroideryDetails.description && formData.embroideryDetails.description.length > 450 && (
              <p className={`mt-1 text-sm ${formData.embroideryDetails.description.length > 500 ? 'text-red-600' : 'text-yellow-600'}`}>
                {formData.embroideryDetails.description.length}/500 characters
              </p>
            )}
          </div>
        </section>
      )}
      
      {/* Suit Components */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
          <span className="text-2xl">ðŸ“¦</span>
          What's Included
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shirt */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Shirt / Kameez</h3>
              <Checkbox
                checked={formData.suitComponents.shirt.included}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    suitComponents: {
                      ...prev.suitComponents,
                      shirt: { ...prev.suitComponents.shirt, included: e.target.checked }
                    }
                  }));
                }}
              />
            </div>
            {formData.suitComponents.shirt.included && (
              <div className="space-y-2">
                <Input
                  label="Length"
                  placeholder="e.g., 2.5 meters"
                  value={formData.suitComponents.shirt.length}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        shirt: { ...prev.suitComponents.shirt, length: e.target.value }
                      }
                    }));
                  }}
                />
                <Input
                  label="Description"
                  placeholder="e.g., Fully embroidered front"
                  value={formData.suitComponents.shirt.description}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        shirt: { ...prev.suitComponents.shirt, description: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Dupatta */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Dupatta</h3>
              <Checkbox
                checked={formData.suitComponents.dupatta.included}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    suitComponents: {
                      ...prev.suitComponents,
                      dupatta: { ...prev.suitComponents.dupatta, included: e.target.checked }
                    }
                  }));
                }}
              />
            </div>
            {formData.suitComponents.dupatta.included && (
              <div className="space-y-2">
                <Input
                  label="Fabric"
                  placeholder="e.g., Chiffon, Organza"
                  value={formData.suitComponents.dupatta.fabric}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        dupatta: { ...prev.suitComponents.dupatta, fabric: e.target.value }
                      }
                    }));
                  }}
                />
                <Input
                  label="Length"
                  placeholder="e.g., 2.5 meters"
                  value={formData.suitComponents.dupatta.length}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        dupatta: { ...prev.suitComponents.dupatta, length: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
            )}
          </div>
          
          {/* Trouser */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Trouser / Shalwar</h3>
              <Checkbox
                checked={formData.suitComponents.trouser.included}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    suitComponents: {
                      ...prev.suitComponents,
                      trouser: { ...prev.suitComponents.trouser, included: e.target.checked }
                    }
                  }));
                }}
              />
            </div>
            {formData.suitComponents.trouser.included && (
              <div className="space-y-2">
                <Input
                  label="Fabric"
                  placeholder="e.g., Matching, Plain"
                  value={formData.suitComponents.trouser.fabric}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        trouser: { ...prev.suitComponents.trouser, fabric: e.target.value }
                      }
                    }));
                  }}
                />
                <Input
                  label="Length"
                  placeholder="e.g., 2.5 meters"
                  value={formData.suitComponents.trouser.length}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      suitComponents: {
                        ...prev.suitComponents,
                        trouser: { ...prev.suitComponents.trouser, length: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
            )}
          </div>
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
            <option value="Lawn">Lawn</option>
            <option value="Chiffon">Chiffon</option>
            <option value="Silk">Silk</option>
            <option value="Cotton">Cotton</option>
            <option value="Velvet">Velvet</option>
            <option value="Organza">Organza</option>
            <option value="Linen">Linen</option>
            <option value="Georgette">Georgette</option>
            <option value="Khaddar">Khaddar</option>
            <option value="Karandi">Karandi</option>
            <option value="Jamawar">Jamawar</option>
            <option value="Jacquard">Jacquard</option>
            <option value="Cambric">Cambric</option>
            <option value="Marina">Marina</option>
            <option value="Net">Net</option>
            <option value="Banarsi">Banarsi</option>
            <option value="Raw Silk">Raw Silk</option>
            <option value="Other">Other</option>
          </Select>
          
          <Textarea
            label="Fabric Composition"
            placeholder="e.g., 100% Pure Silk, 70% Cotton 30% Polyester"
            value={formData.fabric.composition}
            onChange={(e) => handleNestedChange('fabric', 'composition', e.target.value)}
            rows={2}
            maxLength={200}
            showCharacterCount={true}
          />
          {formData.fabric.composition && formData.fabric.composition.length > 180 && (
            <p className={`mt-1 text-sm ${formData.fabric.composition.length > 200 ? 'text-red-600' : 'text-yellow-600'}`}>
              {formData.fabric.composition.length}/200 characters
            </p>
          )}
          
          <Textarea
            label="Care Instructions"
            placeholder="e.g., Dry clean only, Hand wash in cold water, Iron on low heat"
            value={formData.fabric.care}
            onChange={(e) => handleNestedChange('fabric', 'care', e.target.value)}
            rows={3}
            maxLength={500}
            showCharacterCount={true}
          />
          {formData.fabric.care && formData.fabric.care.length > 450 && (
            <p className={`mt-1 text-sm ${formData.fabric.care.length > 500 ? 'text-red-600' : 'text-yellow-600'}`}>
              {formData.fabric.care.length}/500 characters
            </p>
          )}
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
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          ðŸ” SEO Optimization
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          AI can auto-generate SEO content. Use the AI Content Generator above to fill these fields automatically.
        </p>
        
        <div className="space-y-4">
          <Input
            label="Meta Title"
            placeholder="e.g., Red Velvet Bridal Lehnga | Custom Stitching | LaraibCreative"
            value={formData.seo.metaTitle}
            onChange={(e) => handleNestedChange('seo', 'metaTitle', e.target.value)}
            maxLength={60}
            helperText={`${formData.seo.metaTitle.length}/60 characters â€” Include your main keyword`}
          />
          
          <div>
            <Textarea
              label="Meta Description"
              placeholder="e.g., Shop stunning red velvet bridal lehnga with heavy embroidery. Custom stitching available. Free delivery across Pakistan."
              value={formData.seo.metaDescription}
              onChange={(e) => handleNestedChange('seo', 'metaDescription', e.target.value)}
              rows={3}
              maxLength={160}
              error={errors.metaDescription}
            />
            <p className="mt-1 text-xs text-gray-600">
              {formData.seo.metaDescription.length}/160 characters â€” Include a call-to-action
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Long-Tail Keywords
            </label>
            <p className="text-xs text-gray-500 mb-2">
              ðŸ’¡ Use specific phrases like "hand karhai bridal suit Lahore" instead of just "bridal suit"
            </p>
            <Input
              placeholder="Type keyword phrase and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleAddKeyword}
              helperText="Examples: 'custom stitched party wear Pakistan', 'zardozi embroidery bridal suit'"
            />
            
            {/* Keywords Pills */}
            {formData.seo.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.seo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white text-blue-800 text-sm rounded-full border border-blue-200 shadow-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {formData.seo.keywords.length === 0 && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ðŸ’¡ Tip: Add 5-10 long-tail keywords for better search rankings
              </p>
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
      
      {/* Unsaved Changes & Auto-save Status */}
      {(isDirty || lastSaved || draftSaving) && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
          {draftSaving && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-sm">Saving draft...</span>
            </div>
          )}
          {!draftSaving && lastSaved && !isEdit && (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">
                Draft saved {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          {isDirty && (
            <p className="text-sm text-yellow-700 border-l border-gray-300 pl-3">
              Unsaved changes
            </p>
          )}
        </div>
      )}
    </form>
  );
}

