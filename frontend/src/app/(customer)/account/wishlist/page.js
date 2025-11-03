"use client";

export const dynamic = 'force-dynamic';

// app/(customer)/account/wishlist/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart,
  ShoppingCart,
  Eye,
  Trash2,
  Share2,
  Filter,
  Grid,
  List,
  X
} from 'lucide-react';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'bridal', label: 'Bridal Wear' },
    { value: 'party', label: 'Party Wear' },
    { value: 'casual', label: 'Casual' },
    { value: 'formal', label: 'Formal' }
  ];

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [wishlistItems, selectedCategory, sortBy]);

  const fetchWishlist = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockWishlist = [
        {
          id: '1',
          productId: 'P001',
          name: 'Velvet Bridal Suit - Maroon',
          category: 'bridal',
          price: 15000,
          originalPrice: 18000,
          image: '/images/placeholder.png',
          inStock: true,
          addedAt: '2025-10-05',
          sku: 'LC-BR-001'
        },
        {
          id: '2',
          productId: 'P002',
          name: 'Chiffon Party Wear - Pink',
          category: 'party',
          price: 8500,
          originalPrice: 8500,
          image: '/images/placeholder.png',
          inStock: true,
          addedAt: '2025-10-03',
          sku: 'LC-PW-045'
        },
        {
          id: '3',
          productId: 'P003',
          name: 'Lawn Summer Collection',
          category: 'casual',
          price: 4500,
          originalPrice: 5500,
          image: '/images/placeholder.png',
          inStock: false,
          addedAt: '2025-09-28',
          sku: 'LC-CS-078'
        },
        {
          id: '4',
          productId: 'P004',
          name: 'Designer Silk Suit',
          category: 'formal',
          price: 12000,
          originalPrice: 12000,
          image: '/images/placeholder.png',
          inStock: true,
          addedAt: '2025-09-25',
          sku: 'LC-FM-023'
        },
        {
          id: '5',
          productId: 'P005',
          name: 'Embroidered Bridal Lehnga',
          category: 'bridal',
          price: 25000,
          originalPrice: 30000,
          image: '/images/placeholder.png',
          inStock: true,
          addedAt: '2025-09-20',
          sku: 'LC-BR-089'
        }
      ];
      
      setWishlistItems(mockWishlist);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = [...wishlistItems];

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.addedAt) - new Date(a.addedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.addedAt) - new Date(b.addedAt);
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });

    setFilteredItems(filtered);
  };

  const handleRemoveFromWishlist = async (itemId) => {
    if (confirm('Remove this item from your wishlist?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        
        // Show success message
        showToast('Removed from wishlist');
      } catch (error) {
        console.error('Failed to remove from wishlist:', error);
        alert('Failed to remove item. Please try again.');
      }
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message
      showToast(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handleMoveAllToCart = async () => {
    if (confirm('Add all available items to your cart?')) {
      try {
        const availableItems = filteredItems.filter(item => item.inStock);
        
        if (availableItems.length === 0) {
          alert('No items available in stock');
          return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showToast(`${availableItems.length} items added to cart!`);
      } catch (error) {
        console.error('Failed to add items to cart:', error);
        alert('Failed to add items to cart. Please try again.');
      }
    }
  };

  const handleClearWishlist = async () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setWishlistItems([]);
        showToast('Wishlist cleared');
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
        alert('Failed to clear wishlist. Please try again.');
      }
    }
  };

  const handleShareWishlist = () => {
    // Create shareable link
    const shareUrl = `${window.location.origin}/wishlist/shared/user123`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Wishlist link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link');
    });
  };

  const showToast = (message) => {
    // Simple toast notification (you can replace with a proper toast library)
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDiscount = (original, current) => {
    if (original === current) return null;
    return Math.round(((original - current) / original) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleShareWishlist}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Filters and View Controls */}
        {wishlistItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 border-l border-gray-300 ${
                  viewMode === 'list'
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Move All to Cart */}
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              Add All to Cart
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {wishlistItems.length === 0 ? 'Your wishlist is empty' : 'No items match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {wishlistItems.length === 0 
              ? 'Start adding items you love to your wishlist'
              : 'Try adjusting your filters'
            }
          </p>
          {wishlistItems.length === 0 && (
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const discount = calculateDiscount(item.originalPrice, item.price);
                
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <Link href={`/products/${item.productId}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discount && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {!item.inStock && (
                          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                      </button>

                      {/* Quick Actions */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Link
                            href={`/products/${item.productId}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          {item.inStock && (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-colors"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{item.sku}</p>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-pink-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.price)}
                        </span>
                        {discount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Added Date */}
                      <p className="text-xs text-gray-500">
                        Added {formatDate(item.addedAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const discount = calculateDiscount(item.originalPrice, item.price);
                
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-32 h-40 sm:h-32 flex-shrink-0">
                        <Link href={`/products/${item.productId}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </Link>

                        {/* Badges */}
                        {discount && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            {discount}% OFF
                          </span>
                        )}
                        {!item.inStock && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">{item.sku}</p>
                            <Link href={`/products/${item.productId}`}>
                              <h3 className="font-semibold text-gray-900 mb-1 hover:text-pink-600 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.category.replace('-', ' ')}
                            </p>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveFromWishlist(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-gray-900">
                                {formatCurrency(item.price)}
                              </span>
                              {discount && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatCurrency(item.originalPrice)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Added {formatDate(item.addedAt)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Link
                              href={`/products/${item.productId}`}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            {item.inStock && (
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Summary Footer */}
      {filteredItems.length > 0 && (
        <div className="mt-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ready to shop?
              </h3>
              <p className="text-gray-600">
                {filteredItems.filter(i => i.inStock).length} items available in your wishlist
              </p>
            </div>
            <button
              onClick={handleMoveAllToCart}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Add All to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}