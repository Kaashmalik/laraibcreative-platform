'use client'

/**
 * Product Grid Component - Phase 6
 * Responsive grid layout for products
 */

import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/tidb/products'

interface ProductGridProps {
  products: Product[]
  className?: string
  columns?: 2 | 3 | 4
  loading?: boolean
}

export function ProductGrid({ 
  products, 
  className, 
  columns = 4,
  loading = false 
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }

  if (loading) {
    return (
      <div className={cn('grid gap-4 md:gap-6', gridCols[columns], className)}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-neutral-500 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <motion.div 
      className={cn('grid gap-4 md:gap-6', gridCols[columns], className)}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
    >
      {products.map((product, index) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          priority={index < 4}
        />
      ))}
    </motion.div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft animate-pulse">
      <div className="aspect-[3/4] bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        <div className="h-5 bg-neutral-200 rounded w-full" />
        <div className="h-5 bg-neutral-200 rounded w-2/3" />
        <div className="h-6 bg-neutral-200 rounded w-1/2" />
      </div>
    </div>
  )
}

export default ProductGrid
