'use client'

/**
 * Product Card Component - Phase 6
 * Displays product in grid/list view
 */

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { cloudinaryPresets } from '@/lib/cloudinary'
import type { Product } from '@/lib/tidb/products'

interface ProductCardProps {
  product: Product
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const addItem = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  
  const isWishlisted = isInWishlist(product.id)
  
  // Parse pricing
  const pricing = typeof product.pricing === 'string' 
    ? JSON.parse(product.pricing) 
    : product.pricing
  const hasDiscount = pricing.sale && pricing.sale < pricing.base
  const displayPrice = pricing.sale || pricing.base
  const discountPercent = hasDiscount 
    ? Math.round((1 - pricing.sale / pricing.base) * 100) 
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      productId: product.id,
      quantity: 1,
      product: {
        title: product.title,
        slug: product.slug,
        image: product.thumbnail_image || '',
        price: pricing.base,
        salePrice: pricing.sale,
        stitchingPrice: pricing.stitching,
      },
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    toggleItem(product.id, {
      title: product.title,
      slug: product.slug,
      image: product.thumbnail_image || '',
      price: pricing.base,
      salePrice: pricing.sale,
    })
  }

  return (
    <motion.article
      className={cn(
        'group relative bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          {/* Main Image */}
          <Image
            src={cloudinaryPresets.thumbnail(product.thumbnail_image || product.primary_image || '')}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-transform duration-500',
              isHovered && 'scale-105',
              !imageLoaded && 'opacity-0'
            )}
            priority={priority}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse" />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-accent-coral text-white text-xs font-semibold rounded-full">
                -{discountPercent}%
              </span>
            )}
            {product.is_new_arrival && (
              <span className="px-2.5 py-1 bg-primary-gold text-white text-xs font-semibold rounded-full">
                New
              </span>
            )}
            {product.is_best_seller && (
              <span className="px-2.5 py-1 bg-neutral-charcoal text-white text-xs font-semibold rounded-full">
                Bestseller
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div 
            className={cn(
              'absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0 md:opacity-0'
            )}
          >
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                isWishlisted 
                  ? 'bg-primary-rose text-white' 
                  : 'bg-white/90 backdrop-blur-sm text-neutral-600 hover:bg-primary-rose hover:text-white'
              )}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
            </button>
            
            <Link
              href={`/products/${product.slug}`}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-neutral-600 hover:bg-primary-gold hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>

          {/* Add to Cart Button */}
          <div 
            className={cn(
              'absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300',
              isHovered ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-primary-gold text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-gold-dark transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category_name && (
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              {product.category_name}
            </p>
          )}

          {/* Title */}
          <h3 className="font-heading text-lg text-neutral-800 line-clamp-2 group-hover:text-primary-gold transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          {product.total_reviews > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < Math.floor(product.average_rating) 
                        ? 'text-primary-gold fill-current' 
                        : 'text-neutral-300'
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                ({product.total_reviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-lg font-bold text-primary-gold">
              PKR {displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                PKR {pricing.base.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stitching Available */}
          {pricing.stitching && (
            <p className="text-xs text-neutral-500 mt-1">
              + PKR {pricing.stitching.toLocaleString()} stitching
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}

export default ProductCard
