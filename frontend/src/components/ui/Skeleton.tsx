/**
 * Enhanced Skeleton Component - Production Ready
 * Beautiful loading placeholders with smooth animations
 * 
 * @module components/ui/Skeleton
 */

import React from 'react';

export type SkeletonVariant = 'rectangular' | 'circle' | 'text';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Width of skeleton */
  width?: string | number;
  /** Height of skeleton */
  height?: string | number;
  /** Number of lines (for text variant) */
  count?: number;
  /** Additional CSS classes */
  className?: string;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Dark mode support */
  dark?: boolean;
}

/**
 * Base Skeleton Component
 */
export function Skeleton({
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  count = 1,
  className = '',
  animation = 'pulse',
  dark = false,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  const animationStyles: Record<SkeletonAnimation, string> = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: '',
  };

  const variantStyles: Record<SkeletonVariant, string> = {
    rectangular: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded',
  };

  const baseStyles = `
    ${dark ? 'bg-gray-700' : 'bg-gray-200'}
    ${variantStyles[variant]}
    ${animationStyles[animation]}
    ${className}
  `;

  // Text variant with multiple lines
  if (variant === 'text' && count > 1) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading content">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={baseStyles}
            style={{
              width: i === count - 1 ? '70%' : widthStyle,
              height: heightStyle,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseStyles}
      style={{ width: widthStyle, height: heightStyle }}
      aria-label="Loading..."
      role="status"
      aria-live="polite"
    />
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
        >
          {/* Image skeleton */}
          <Skeleton variant="rectangular" height="300px" className="rounded-none" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <Skeleton variant="text" height="16px" width="80%" />
            <Skeleton variant="text" height="14px" width="60%" />
            <div className="flex items-center gap-2 pt-2">
              <Skeleton variant="text" height="20px" width="100px" />
              <Skeleton variant="text" height="16px" width="80px" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Product Detail Skeleton
 */
export function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Skeleton variant="rectangular" height="600px" className="rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="112px" className="rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton variant="text" height="20px" width="80px" />
            <Skeleton variant="text" height="32px" width="80%" />
            <Skeleton variant="text" height="16px" width="60%" />
          </div>
          <Skeleton variant="text" height="40px" width="200px" />
          <Skeleton variant="text" count={4} height="16px" />
          <div className="space-y-4">
            <Skeleton variant="text" height="20px" width="100px" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="circle" width="44px" height="44px" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton variant="rectangular" height="48px" width="200px" />
            <Skeleton variant="rectangular" height="48px" width="48px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Post Skeleton
 */
export function BlogPostSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton variant="rectangular" height="400px" className="rounded-lg mb-6" />
      <Skeleton variant="text" height="32px" width="80%" className="mb-4" />
      <Skeleton variant="text" height="16px" width="200px" className="mb-6" />
      <Skeleton variant="text" count={8} height="16px" />
    </div>
  );
}

/**
 * Blog List Skeleton
 */
export function BlogListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <Skeleton variant="rectangular" height="200px" />
          <div className="p-4 space-y-3">
            <Skeleton variant="text" height="20px" width="80%" />
            <Skeleton variant="text" count={2} height="14px" />
            <Skeleton variant="text" height="12px" width="100px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Cart Item Skeleton
 */
export function CartItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <Skeleton variant="rectangular" width="100px" height="100px" className="rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height="20px" width="60%" />
            <Skeleton variant="text" height="16px" width="40%" />
            <Skeleton variant="text" height="20px" width="100px" />
          </div>
          <Skeleton variant="rectangular" width="100px" height="40px" />
        </div>
      ))}
    </div>
  );
}

/**
 * Checkout Step Skeleton
 */
export function CheckoutStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton variant="text" height="24px" width="200px" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" height="16px" width="100px" />
              <Skeleton variant="rectangular" height="44px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Skeleton
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <Skeleton variant="text" height="16px" width="100px" className="mb-2" />
            <Skeleton variant="text" height="32px" width="150px" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton variant="text" height="24px" width="200px" className="mb-4" />
          <Skeleton variant="rectangular" height="300px" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <Skeleton variant="text" height="24px" width="200px" className="mb-4" />
          <Skeleton variant="rectangular" height="300px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Custom Order Wizard Skeleton
 */
export function CustomOrderWizardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <Skeleton variant="circle" width="40px" height="40px" />
            {i < 4 && <Skeleton variant="rectangular" height="2px" width="100%" className="mx-2" />}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-8 space-y-6">
        <Skeleton variant="text" height="32px" width="60%" />
        <Skeleton variant="text" height="16px" width="80%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" height="16px" width="100px" />
              <Skeleton variant="rectangular" height="44px" />
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton variant="rectangular" height="48px" width="120px" />
          <Skeleton variant="rectangular" height="48px" width="120px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;

