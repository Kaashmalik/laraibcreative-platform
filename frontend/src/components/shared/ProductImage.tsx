'use client'

/**
 * Product Image Component
 * Handles image loading, error states, and fallbacks
 */

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  fallbackText?: string
  showPlaceholder?: boolean
}

export function ProductImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  sizes,
  fallbackText = 'No Image',
  showPlaceholder = true
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If image failed or no src, show fallback
  if (imageError || !src) {
    if (!showPlaceholder) {
      return null
    }

    return (
      <div
        className={cn(
          'flex items-center justify-center bg-neutral-100',
          fill ? 'absolute inset-0' : 'aspect-[3/4]',
          className
        )}
      >
        <div className="flex flex-col items-center gap-2 text-neutral-400">
          <Package className="w-12 h-12" />
          <span className="text-sm">{fallbackText}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', fill ? 'absolute inset-0' : '', className)}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 animate-pulse',
            fill ? 'absolute inset-0' : ''
          )}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}

export default ProductImage
