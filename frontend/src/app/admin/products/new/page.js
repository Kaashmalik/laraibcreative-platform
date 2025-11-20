'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import api from '@/lib/api';

/**
 * Admin Add New Product Page
 * 
 * Features:
 * - Complete product creation form
 * - Auto-save draft functionality
 * - Preview before publish
 * - Image upload with optimization
 * - SEO fields
 * - Form validation
 * 
 * @returns {JSX.Element} Add product page
 */
export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  
  /**
   * Handle form submission
   * Creates new product in database
   * 
   * @param {Object} productData - Complete product data from form
   * @param {boolean} draft - Whether to save as draft or publish
   */
  const handleSubmit = async (productData, draft = false) => {
    setLoading(true);
    setIsDraft(draft);
    
    try {
      // Add draft status to product data
      const dataToSubmit = {
        ...productData,
        status: draft ? 'draft' : 'published'
      };
      
      // Create FormData for file uploads
      const formData = new FormData();
      Object.keys(dataToSubmit).forEach(key => {
        if (key === 'images' && Array.isArray(dataToSubmit[key])) {
          dataToSubmit[key].forEach((img, index) => {
            if (typeof img === 'object' && img.file) {
              formData.append(`images[${index}]`, img.file);
            } else {
              formData.append(`images[${index}]`, JSON.stringify(img));
            }
          });
        } else if (typeof dataToSubmit[key] === 'object') {
          formData.append(key, JSON.stringify(dataToSubmit[key]));
        } else {
          formData.append(key, dataToSubmit[key]);
        }
      });
      
      const response = await api.products.createAdmin(formData);
      
      const result = response.data;
      
      setToast({
        type: 'success',
        message: draft 
          ? 'Product saved as draft successfully' 
          : 'Product created successfully'
      });
      
      // Redirect to products list after short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating product:', error);
      setToast({
        type: 'error',
        message: error.message || 'Failed to create product. Please try again.'
      });
      setLoading(false);
    }
  };
  
  /**
   * Handle preview
   * Opens product preview in new tab
   * 
   * @param {Object} productData - Product data to preview
   */
  const handlePreview = (productData) => {
    // Store preview data in sessionStorage
    sessionStorage.setItem('productPreview', JSON.stringify(productData));
    
    // Open preview in new tab
    window.open('/admin/products/preview', '_blank');
  };
  
  /**
   * Handle cancel
   * Prompts user to confirm before leaving if form has changes
   */
  const handleCancel = () => {
    const confirmLeave = confirm('Are you sure you want to leave? Any unsaved changes will be lost.');
    if (confirmLeave) {
      router.push('/admin/products');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" icon={<ArrowLeft size={18} />}>
              Back
            </Button>
          </Link>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create a new product for your catalog
            </p>
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
            i
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Product Creation Tips
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload at least 5 high-quality images from different angles</li>
              <li>• Write detailed descriptions including fabric details and care instructions</li>
              <li>• Fill in SEO fields to improve search visibility</li>
              <li>• Use descriptive, keyword-rich titles</li>
              <li>• Enable "Featured" for products you want to highlight on homepage</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Product Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onPreview={handlePreview}
          loading={loading}
        />
      </div>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Auto-save Indicator */}
      {isDraft && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Save size={16} />
          <span className="text-sm font-medium">Draft saved</span>
        </div>
      )}
    </div>
  );
}

/**
 * Prevent accidental navigation away from page with unsaved changes
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    const hasUnsavedChanges = sessionStorage.getItem('productFormDirty') === 'true';
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}