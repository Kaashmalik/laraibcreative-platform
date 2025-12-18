'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

/**
 * ProductCard Component
 * Premium card design with hover effects, quick actions, and image carousel
 */
export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();

  // Get product images (handle both string URLs and object structure)
  const getProductImages = () => {
    const images = [];

    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (typeof img === 'string') {
          images.push(img);
        } else if (img?.url) {
          images.push(img.url);
        }
      });
    }

    if (product.primaryImage && !images.includes(product.primaryImage)) {
      // Ensure primary image is first
      const primaryIndex = images.indexOf(product.primaryImage);
      if (primaryIndex > -1) {
        images.splice(primaryIndex, 1);
      }
      images.unshift(product.primaryImage);
    }

    if (images.length === 0) {
      images.push('/images/placeholder.png');
    }

    return images;
  };

  const productImages = getProductImages();
  const hasMultipleImages = productImages.length > 1;

  // Auto-slide on hover
  useEffect(() => {
    let interval;
    if (isHovered && hasMultipleImages) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % productImages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isHovered, hasMultipleImages, productImages.length]);

  // Reset to first image when not hovering
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0);
    }
  }, [isHovered]);

  const price = product.pricing?.basePrice || product.price || 0;
  const salePrice = product.pricing?.salePrice;
  const slug = product.slug || product._id;

  // Calculate discount percentage
  const discountPercentage = salePrice && price > salePrice
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">

        {/* Product Images */}
        <Image
          src={productImages[currentImageIndex]}
          alt={product.title || product.name || 'Product Image'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />

        {/* Overlay gradient for text contrast if needed */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {productImages.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentImageIndex
                  ? 'w-4 bg-white'
                  : 'w-1 bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Badge: Sale or Featured */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {(product.isFeatured || product.featured) && (
            <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider font-semibold rounded-sm">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="px-3 py-1 bg-red-600/90 text-white text-[10px] uppercase tracking-wider font-semibold rounded-sm">
              -{discountPercentage}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-3 py-1 bg-blue-600/90 text-white text-[10px] uppercase tracking-wider font-semibold rounded-sm">
              New
            </span>
          )}
        </div>

        {/* Quick Actions Overlay (Appears on Hover) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg ${isWishlisted ? 'bg-pink-50 text-pink-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-600' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/products/${slug}`);
              }}
              className="w-10 h-10 bg-white text-gray-700 rounded-full flex items-center justify-center hover:scale-110 hover:bg-gray-50 transition-all shadow-lg"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>

            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  setIsAdding(true);
                  await addItem(product, 1);
                  toast.success(`${product.title || product.name} added to cart!`);
                } catch (error) {
                  toast.error(error.message || 'Failed to add to cart');
                } finally {
                  setIsAdding(false);
                }
              }}
              disabled={isAdding}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg text-white ${isAdding ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
              aria-label="Add to cart"
            >
              <ShoppingCart className={`w-5 h-5 ${isAdding ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category */}
        <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
          {product.category?.name || 'Fashion'}
        </div>

        {/* Title */}
        <Link
          href={`/products/${slug}`}
          className="mb-2"
        >
          <h3 className="text-base font-medium text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2 leading-snug">
            {product.title || product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">
                  Rs. {price.toLocaleString()}
                </span>
                {salePrice && salePrice < price && (
                  <span className="text-sm text-gray-400 line-through decoration-gray-400">
                    Rs. {salePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Rating (Optional - only if non-zero) */}
            {product.rating?.average > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-gray-600">{product.rating.average}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}