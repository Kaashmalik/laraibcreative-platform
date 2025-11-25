'use client'

import { cn } from '@/lib/utils'

interface ShimmerLoaderProps {
  variant?: 'text' | 'card' | 'image' | 'avatar' | 'button'
  className?: string
  lines?: number
}

export function ShimmerLoader({ variant = 'text', className, lines = 1 }: ShimmerLoaderProps) {
  const baseClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]'

  switch (variant) {
    case 'avatar':
      return <div className={cn(baseClass, 'w-10 h-10 rounded-full', className)} />
    
    case 'button':
      return <div className={cn(baseClass, 'h-10 w-24 rounded-lg', className)} />
    
    case 'image':
      return <div className={cn(baseClass, 'w-full aspect-square rounded-xl', className)} />
    
    case 'card':
      return (
        <div className={cn('space-y-3', className)}>
          <div className={cn(baseClass, 'w-full aspect-[4/3] rounded-xl')} />
          <div className={cn(baseClass, 'h-4 w-3/4 rounded')} />
          <div className={cn(baseClass, 'h-4 w-1/2 rounded')} />
        </div>
      )
    
    case 'text':
    default:
      return (
        <div className={cn('space-y-2', className)}>
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className={cn(baseClass, 'h-4 rounded', i === lines - 1 ? 'w-2/3' : 'w-full')}
            />
          ))}
        </div>
      )
  }
}

export default ShimmerLoader
