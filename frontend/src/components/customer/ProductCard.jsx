'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * ProductCard Component
 * 
 * Displays product information in grid or list view with:
 * - Image with hover zoom effect
 * - Title, price, fabric type
 * - Rating stars
 * - Wishlist heart icon (animated)
 * - Custom stitching badge
 * - Quick view button (modal)
 * - Smooth animations
 * 
 * @param {Object} product - Product data object
 * @param {string} viewMode - 'grid' or 'list'
 */
export default function ProductCard({ product, viewMode = 'grid' }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * Toggle wishlist status
   */
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent navigation to product page
    
    // Optimistic UI update
    setIsWishlisted(!isWishlisted);

    try {
      // API call to add/remove from wishlist
      const response = await fetch('/api/wishlist', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        // Revert on error
        setIsWishlisted(isWishlisted);
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      // Show toast notification
    }
  };

  /**
   * Handle quick view (opens modal)
   */
  const handleQuickView = (e) => {
    e.preventDefault();
    // Dispatch custom event or use context to open modal
    window.dispatchEvent(
      new CustomEvent('openQuickView', { detail: { productId: product._id } })
    );
  };

  /**
   * Render rating stars
   */
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  /**
   * Grid view layout
   */
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        className="group"
      >
        <Link href={`/products/${product._id || product.id}`} className="block">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg">
            {/* Image container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              {/* Product image with hover zoom */}
              <Image
                src={product.primaryImage || product.images?.[0] || '/images/placeholder.png'}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadingComplete={() => setImageLoaded(true)}
                priority={false}
              />

              {/* Wishlist button - Top right */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all z-10"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <motion.svg
                  className={`w-5 h-5 ${isWishlisted ? 'text-pink-600 fill-current' : 'text-gray-600'}`}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </motion.svg>
              </button>

              {/* Badges - Top left */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.featured && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}
                {product.discount && (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                    -{product.discount}%
                  </span>
                )}
                {product.availability === 'custom-only' && (
                  <span className="px-3 py-1 bg-pink-600 text-white text-xs font-semibold rounded-full">
                    Custom Only
                  </span>
                )}
              </div>

              {/* Quick view button - Appears on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <motion.button
                  onClick={handleQuickView}
                  className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Quick View
                </motion.button>
              </div>
            </div>

            {/* Product info */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                {product.title || product.name}
              </h3>

              {/* Fabric type */}
              <p className="text-sm text-gray-600 mb-2">
                {product.fabric?.type || 'Premium Fabric'}
              </p>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(product.averageRating || 0)}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    PKR {(product.pricing?.basePrice || product.price || 0).toLocaleString()}
                  </span>
                  {product.pricing?.discount?.percentage && (
                    <span className="text-sm text-gray-500 line-through">
                      PKR {((product.pricing.basePrice || product.price || 0) * (1 + product.pricing.discount.percentage / 100)).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Custom stitching indicator */}
                {product.pricing?.customStitchingCharge && (
                  <div className="text-xs text-pink-600 font-medium">
                    + Stitching
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  /**
   * List view layout
   */
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/products/${product._id}`} className="block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-64 aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}

              <Image
                src={product.primaryImage || product.images?.[0] || '/images/placeholder.png'}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, 256px"
                className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoadingComplete={() => setImageLoaded(true)}
              />

              {/* Wishlist button */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all z-10"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg
                  className={`w-5 h-5 ${isWishlisted ? 'text-pink-600 fill-current' : 'text-gray-600'}`}
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                {product.featured && (
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                )}
                {product.discount && (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Fabric and SKU */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {product.fabric?.type || 'Premium Fabric'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>SKU: {product.sku}</span>
                  </div>

                  {/* Description preview */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="mb-4">
                    {renderStars(product.averageRating || 0)}
                  </div>
                </div>

                {/* Bottom section */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">
                        PKR {product.pricing?.basePrice?.toLocaleString()}
                      </span>
                      {product.pricing?.discount && (
                        <span className="text-sm text-gray-500 line-through">
                          PKR {(product.pricing.basePrice * (1 + product.pricing.discount / 100)).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.pricing?.customStitchingCharge && (
                      <p className="text-sm text-pink-600 font-medium">
                        + PKR {product.pricing.customStitchingCharge.toLocaleString()} custom stitching
                      </p>
                    )}
                  </div>

                  {/* Quick view button */}
                  <button
                    onClick={handleQuickView}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Quick View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}