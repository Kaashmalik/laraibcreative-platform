'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Eye, Copy } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Admin Edit Product Page
 * 
 * Features:
 * - Load existing product data
 * - Update product information
 * - Delete product
 * - Duplicate product
 * - View product on storefront
 * - Track edit history
 * 
 * @returns {JSX.Element} Edit product page
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  /**
   * Fetch product data
   */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setToast({
          type: 'error',
          message: 'Failed to load product. Please try again.'
        });
        
        // Redirect to products list after error
        setTimeout(() => {
          router.push('/admin/products');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);
  
  /**
   * Handle form submission
   * Updates existing product in database
   * 
   * @param {Object} productData - Updated product data from form
   * @param {boolean} draft - Whether to save as draft or publish
   */
  const handleSubmit = async (productData, draft = false) => {
    setSaving(true);
    
    try {
      // Add draft status to product data
      const dataToSubmit = {
        ...productData,
        status: draft ? 'draft' : 'published'
      };
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(dataToSubmit)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }
      
      const result = await response.json();
      
      setToast({
        type: 'success',
        message: 'Product updated successfully'
      });
      
      // Update local product state
      setProduct(result);
      
      // Clear form dirty flag
      sessionStorage.removeItem('productFormDirty');
      
    } catch (error) {
      console.error('Error updating product:', error);
      setToast({
        type: 'error',
        message: error.message || 'Failed to update product. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Handle product deletion
   */
  const handleDelete = async () => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      setToast({
        type: 'success',
        message: 'Product deleted successfully'
      });
      
      // Redirect to products list
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({
        type: 'error',
        message: 'Failed to delete product. Please try again.'
      });
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
  
  /**
   * Handle product duplication
   * Creates a copy of current product with " (Copy)" appended to title
   */
  const handleDuplicate = async () => {
    if (!confirm('Create a duplicate of this product?')) return;
    
    try {
      const duplicateData = {
        ...product,
        _id: undefined,
        title: `${product.title} (Copy)`,
        slug: `${product.slug}-copy`,
        sku: `${product.sku}-COPY`,
        status: 'draft'
      };
      
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(duplicateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to duplicate product');
      }
      
      const result = await response.json();
      
      setToast({
        type: 'success',
        message: 'Product duplicated successfully'
      });
      
      // Redirect to edit page of new product
      setTimeout(() => {
        router.push(`/admin/products/edit/${result._id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error duplicating product:', error);
      setToast({
        type: 'error',
        message: 'Failed to duplicate product. Please try again.'
      });
    }
  };
  
  /**
   * View product on storefront
   */
  const handleViewProduct = () => {
    if (product && product.slug) {
      window.open(`/products/${product.slug}`, '_blank');
    }
  };
  
  /**
   * Handle cancel - redirect back to products list
   */
  const handleCancel = () => {
    const hasUnsavedChanges = sessionStorage.getItem('productFormDirty') === 'true';
    
    if (hasUnsavedChanges) {
      const confirmLeave = confirm('Are you sure you want to leave? Any unsaved changes will be lost.');
      if (!confirmLeave) return;
    }
    
    router.push('/admin/products');
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-10" />
          <div className="flex-1">
            <Skeleton className="w-64 h-8 mb-2" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }
  
  // Error state - product not found
  if (!product && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Link href="/admin/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }
  
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-600 mt-1">
              SKU: {product?.sku || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handleViewProduct}
            icon={<Eye size={18} />}
          >
            View
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleDuplicate}
            icon={<Copy size={18} />}
          >
            Duplicate
          </Button>
          
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            icon={<Trash2 size={18} />}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Product Status Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-2 font-semibold ${
              product.status === 'published' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {product.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Created:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(product.updatedAt).toLocaleDateString()}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Views:</span>
            <span className="ml-2 font-medium text-gray-900">
              {product.views || 0}
            </span>
          </div>
        </div>
      </div>
      
      {/* Product Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
          isEdit={true}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{product?.title}</strong>? This action cannot be undone.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> All product data, images, and reviews will be permanently deleted.
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}