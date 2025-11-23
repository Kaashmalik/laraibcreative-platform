/**
 * Optimized Product Card Component
 * Uses React Compiler and optimized image loading
 */

'use client';


// @react-compiler
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types/product';
import { generateBlurPlaceholder } from '@/lib/image-loader';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  priority?: boolean;
}

/**
 * Product Card Component
 * Optimized with React Compiler and proper image handling
 */
export default function ProductCard({ 
  product, 
  viewMode = 'grid',
  priority = false 
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productImageRaw = product.primaryImage || product.images?.[0] || '/images/placeholder.png';
  const productImage = typeof productImageRaw === 'string' 
    ? productImageRaw 
    : (productImageRaw as any)?.url || '/images/placeholder.png';
  const productTitle = product.title || product.name || 'Product';
  const productPrice = product.pricing?.basePrice || product.price || 0;
  const productId = product._id || product.id;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Link href={`/products/${productId}`} className="block">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-64 aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100 flex-shrink-0">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <Image
                  src={productImage}
                  alt={`${productTitle} - ${product.fabric?.type || 'Premium fabric'} ladies suit`}
                  fill
                  sizes="(max-width: 640px) 100vw, 256px"
                  className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  quality={75}
                  placeholder="blur"
                  blurDataURL={generateBlurPlaceholder()}
                  loading={priority ? 'eager' : 'lazy'}
                />
              </div>
              <div className="flex-1 p-6">
                <h3 className="text-xl font-semibold mb-2">{productTitle}</h3>
                <p className="text-pink-600 font-bold text-lg mb-4">
                  Rs. {productPrice.toLocaleString()}
                </p>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {product.shortDescription || product.description}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/products/${productId}`} className="block">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg">
          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <Image
              src={productImage}
              alt={`${productTitle} - ${product.fabric?.type || 'Premium fabric'} ladies suit`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              priority={priority}
              quality={75}
              placeholder="blur"
              blurDataURL={generateBlurPlaceholder()}
            />
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all z-10"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'text-pink-600 fill-current' : 'text-gray-600'}`}
              />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{productTitle}</h3>
            <p className="text-pink-600 font-bold">
              Rs. {productPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

