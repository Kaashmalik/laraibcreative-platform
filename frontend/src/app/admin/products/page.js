'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import ProductTable from '@/components/admin/ProductTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import useDebounce from '@/hooks/useDebounce';
import api from '@/lib/api';
import DeleteConfirmModal from '@/components/admin/products/DeleteConfirmModal';

/**
 * Admin Products List Page
 * 
 * Features:
 * - Searchable and filterable product table
 * - Bulk actions (delete, feature, hide)
 * - Quick edit functionality
 * - Export products to CSV
 * - Import products from CSV
 * - Pagination
 * - Real-time search with debouncing
 * 
 * @returns {JSX.Element} Products management page
 */
export default function AdminProductsPage() {
  const router = useRouter();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;
  
  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Debounced search term for API calls
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  /**
   * Fetch products from API
   * Includes filters, search, pagination, and sorting
   */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        sortBy,
        sortOrder
      };
      
      const response = await api.products.getAllAdmin(params);
      setProducts(response.products || response);
      setTotalPages(response.pagination?.totalPages || response.totalPages || 1);
      setTotalProducts(response.pagination?.totalProducts || response.totalProducts || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load products. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch categories for filter dropdown
   */
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
  
  // Fetch products when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch, selectedCategory, selectedStatus, sortBy, sortOrder]);
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  /**
   * Handle product selection for bulk actions
   */
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  
  /**
   * Select all products on current page
   */
  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };
  
  /**
   * Bulk delete selected products
   */
  const handleBulkDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setBulkActionLoading(true);
    try {
      await api.products.bulkDelete(selectedProducts);
      
      setToast({
        type: 'success',
        message: `Successfully deleted ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}`
      });
      setSelectedProducts([]);
      setShowDeleteModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete products. Please try again.'
      });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  /**
   * Bulk update featured status
   */
  const handleBulkFeature = async (featured) => {
    setBulkActionLoading(true);
    try {
      await api.products.bulkUpdateAdmin(selectedProducts, { isFeatured: featured });
      
      setToast({
        type: 'success',
        message: `Successfully ${featured ? 'featured' : 'unfeatured'} ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}`
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating products:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update products. Please try again.'
      });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  /**
   * Bulk update availability status
   */
  const handleBulkAvailability = async (availability) => {
    setBulkActionLoading(true);
    try {
      await api.products.bulkUpdateAdmin(selectedProducts, { 
        'availability.status': availability 
      });
      
      setToast({
        type: 'success',
        message: `Successfully updated ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} to ${availability}`
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error updating products:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update products. Please try again.'
      });
    } finally {
      setBulkActionLoading(false);
    }
  };
  
  /**
   * Export products to CSV
   */
  const handleExport = async () => {
    try {
      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : '',
        status: selectedStatus !== 'all' ? selectedStatus : '',
        search: debouncedSearch,
      };
      
      const blob = await api.products.export(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setToast({
        type: 'success',
        message: 'Products exported successfully'
      });
    } catch (error) {
      console.error('Error exporting products:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to export products. Please try again.'
      });
    }
  };
  
  /**
   * Clear all filters and reset to default view
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your product catalog ({totalProducts} total)
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={handleExport}
            icon={<Download size={18} />}
          >
            Export
          </Button>
          
          <Link href="/admin/products/new">
            <Button icon={<Plus size={18} />}>
              Add Product
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by title, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          
          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full lg:w-48"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </Select>
          
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full lg:w-48"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="custom-only">Custom Only</option>
            <option value="out-of-stock">Out of Stock</option>
          </Select>
          
          {/* Filter Button */}
          <Button
            variant="outlined"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter size={18} />}
          >
            {showFilters ? 'Hide' : 'More'} Filters
          </Button>
        </div>
        
        {/* Advanced Filters (Collapsible) */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Sort by: Date Added</option>
                <option value="title">Sort by: Title</option>
                <option value="pricing.basePrice">Sort by: Price</option>
                <option value="views">Sort by: Views</option>
              </Select>
              
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
              
              <Button
                variant="ghost"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedProducts.length} product(s) selected
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleBulkFeature(true)}
              >
                Feature
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleBulkFeature(false)}
              >
                Unfeature
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleBulkAvailability('in-stock')}
              >
                Set In Stock
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleBulkAvailability('custom-only')}
              >
                Set Custom Only
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Table */}
      <ProductTable
        products={products}
        loading={loading}
        selectedProducts={selectedProducts}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onRefresh={fetchProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        productCount={selectedProducts.length}
        productNames={products
          .filter(p => selectedProducts.includes(p._id))
          .map(p => p.title)
          .slice(0, 5)}
        isBulk={true}
        isLoading={bulkActionLoading}
      />

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