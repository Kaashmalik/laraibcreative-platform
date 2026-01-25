'use client';


import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Eye, Star, MoreVertical, Copy, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Checkbox from '@/components/ui/Checkbox';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/customer/Pagination';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

/**
 * Product Table Component
 * 
 * Displays products in a sortable, filterable table with:
 * - Product image thumbnail
 * - Title and SKU
 * - Category
 * - Price with discount indicator
 * - Stock status
 * - Featured status
 * - Views count
 * - Action buttons (edit, delete, view)
 * - Bulk selection
 * - Quick edit modal
 * - Responsive design
 * 
 * @param {Object} props
 * @param {Array} props.products - Array of products
 * @param {boolean} props.loading - Loading state
 * @param {Array} props.selectedProducts - Selected product IDs
 * @param {Function} props.onSelectProduct - Product selection handler
 * @param {Function} props.onSelectAll - Select all handler
 * @param {Function} props.onRefresh - Refresh data handler
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total pages
 * @param {Function} props.onPageChange - Page change handler
 * @returns {JSX.Element}
 */
export default function ProductTable({
  products = [],
  loading = false,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll,
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {
  const [quickEditProduct, setQuickEditProduct] = useState(null);
  
  /**
   * Get status badge variant
   */
  const getStatusVariant = (availability) => {
    switch (availability) {
      case 'in-stock':
        return 'success';
      case 'custom-only':
        return 'info';
      case 'out-of-stock':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * Get suit type badge variant and color
   */
  const getSuitTypeBadge = (suitType) => {
    if (!suitType) return null;
    
    const variants = {
      'ready-made': { variant: 'default', label: 'Ready-Made', className: 'bg-blue-100 text-blue-800' },
      'replica': { variant: 'warning', label: 'Replica', className: 'bg-purple-100 text-purple-800' },
      'karhai': { variant: 'success', label: 'Karhai', className: 'bg-rose-100 text-rose-800' }
    };
    
    const config = variants[suitType] || { variant: 'default', label: suitType, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };
  
  /**
   * Get status label
   */
  const getStatusLabel = (availability) => {
    switch (availability) {
      case 'in-stock':
        return 'In Stock';
      case 'custom-only':
        return 'Custom Only';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return availability;
    }
  };
  
  /**
   * Format price with discount
   */
  const formatPrice = (product) => {
    const basePrice = product.pricing?.basePrice || 0;
    const discount = product.pricing?.discount || 0;
    
    if (discount > 0) {
      const finalPrice = basePrice - (basePrice * discount / 100);
      return (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            PKR {finalPrice.toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 line-through">
            PKR {basePrice.toLocaleString()}
          </span>
        </div>
      );
    }
    
    return (
      <span className="text-sm font-semibold text-gray-900">
        PKR {basePrice.toLocaleString()}
      </span>
    );
  };
  
  /**
   * Handle quick actions using proper API
   */
  const handleQuickAction = useCallback(async (productId, action) => {
    const loadingToast = toast.loading('Updating product...');
    try {
      await api.products.admin.bulkUpdateAdmin([productId], { [action]: true });
      
      toast.success('Product updated successfully', { id: loadingToast });
      
      // Refresh table
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product', { id: loadingToast });
    }
  }, [onRefresh]);
  
  /**
   * Handle product deletion using proper API
   */
  const handleDelete = useCallback(async (productId, productTitle) => {
    const confirmDelete = confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    
    const loadingToast = toast.loading('Deleting product...');
    try {
      await api.products.admin.delete(productId);
      
      toast.success('Product deleted successfully', { id: loadingToast });
      
      // Refresh table
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product', { id: loadingToast });
    }
  }, [onRefresh]);
  
  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Skeleton className="w-4 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-20 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-32 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-24 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-20 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-16 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-20 h-4" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="w-16 h-4" />
                </th>
                <th className="w-24 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(10)].map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-4">
                    <Skeleton className="w-4 h-4" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-16 h-16 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-48 h-4 mb-2" />
                    <Skeleton className="w-32 h-3" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-24 h-4" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-20 h-4" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-16 h-6 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-12 h-4" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-16 h-4" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="w-20 h-8" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  /**
   * Empty state
   */
  if (!loading && products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Products Found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first product to the catalog.
          </p>
          <Link href="/admin/products/new">
            <Button>Add Product</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={selectedProducts.length === products.length}
                    onChange={onSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suit Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="w-24 px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => onSelectProduct(product._id)}
                    />
                  </td>
                  
                  {/* Image */}
                  <td className="px-4 py-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          quality={60}
                          sizes="64px"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Product Info */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <Link 
                        href={`/admin/products/edit/${product._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {product.title}
                      </Link>
                      <span className="text-xs text-gray-500 mt-1">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </td>
                  
                  {/* Category */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">
                      {product.category?.name || 'N/A'}
                    </span>
                    {product.subcategory && (
                      <span className="block text-xs text-gray-500">
                        {product.subcategory}
                      </span>
                    )}
                  </td>
                  
                  {/* Suit Type */}
                  <td className="px-4 py-4">
                    {getSuitTypeBadge(product.type)}
                  </td>
                  
                  {/* Price */}
                  <td className="px-4 py-4">
                    {formatPrice(product)}
                    {product.pricing?.discount > 0 && (
                      <Badge variant="success" size="sm" className="mt-1">
                        {product.pricing.discount}% OFF
                      </Badge>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge variant={getStatusVariant(product.availability)}>
                      {getStatusLabel(product.availability)}
                    </Badge>
                  </td>
                  
                  {/* Featured */}
                  <td className="px-4 py-4">
                    {product.featured ? (
                      <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    ) : (
                      <Star size={18} className="text-gray-300" />
                    )}
                  </td>
                  
                  {/* Views */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Eye size={14} className="text-gray-400" />
                      <span>{product.views || 0}</span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu
                      stopPropagation
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<MoreVertical size={16} />}
                        />
                      }
                    >
                      <Link href={`/admin/products/edit/${product._id}`}>
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Edit size={16} />
                          Edit
                        </button>
                      </Link>
                      
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Eye size={16} />
                          View on Store
                        </button>
                      </Link>
                      
                      <button
                        onClick={() => handleQuickAction(product._id, 'featured')}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Star size={16} />
                        {product.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      
                      <button
                        onClick={() => handleQuickAction(product._id, 'duplicate')}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Copy size={16} />
                        Duplicate
                      </button>
                      
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      <button
                        onClick={() => handleDelete(product._id, product.title)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}