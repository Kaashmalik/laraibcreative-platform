/**
 * Page Loading Components
 * Loading states for each page type matching actual layout
 * 
 * @module components/loading/PageLoadingComponents
 */

import { ProductCardSkeleton, BlogListSkeleton, ProductDetailSkeleton, BlogPostSkeleton, CartItemSkeleton, CheckoutStepSkeleton, AdminDashboardSkeleton, CustomOrderWizardSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Products Listing Page Loading
 */
export function ProductsPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" height="48px" width="300px" className="mb-2" />
        <Skeleton variant="text" height="20px" width="400px" />
      </div>

      {/* Active Filters Skeleton */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="32px" width="100px" className="rounded-full" />
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton variant="text" height="20px" width="100px" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton variant="rectangular" width="16px" height="16px" />
                      <Skeleton variant="text" height="16px" width="80px" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6">
            <Skeleton variant="text" height="20px" width="200px" />
            <Skeleton variant="rectangular" height="44px" width="180px" />
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCardSkeleton count={9} />
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height="40px" width="40px" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Product Detail Page Loading
 */
export function ProductDetailPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton variant="text" height="16px" width="60px" />
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton variant="text" height="16px" width="80px" />
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton variant="text" height="16px" width="120px" />
      </div>

      <ProductDetailSkeleton />

      {/* Related Products */}
      <div className="mt-12">
        <Skeleton variant="text" height="32px" width="200px" className="mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCardSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Listing Page Loading
 */
export function BlogListingPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton variant="text" height="48px" width="300px" className="mx-auto mb-2" />
        <Skeleton variant="text" height="20px" width="400px" className="mx-auto" />
      </div>

      {/* Categories Filter */}
      <div className="mb-8 flex justify-center gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="36px" width="100px" className="rounded-full" />
        ))}
      </div>

      {/* Blog Posts */}
      <BlogListSkeleton count={6} />

      {/* Pagination */}
      <div className="mt-12 flex justify-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height="40px" width="40px" />
        ))}
      </div>
    </div>
  );
}

/**
 * Blog Post Detail Page Loading
 */
export function BlogPostDetailPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton variant="text" height="16px" width="60px" />
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton variant="text" height="16px" width="80px" />
        <Skeleton variant="circle" width="16px" height="16px" />
        <Skeleton variant="text" height="16px" width="120px" />
      </div>

      <BlogPostSkeleton />

      {/* Related Posts */}
      <div className="mt-12">
        <Skeleton variant="text" height="32px" width="200px" className="mb-6" />
        <BlogListSkeleton count={3} />
      </div>
    </div>
  );
}

/**
 * Custom Order Wizard Page Loading
 */
export function CustomOrderWizardPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <CustomOrderWizardSkeleton />
    </div>
  );
}

/**
 * Cart Page Loading
 */
export function CartPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" height="48px" width="200px" className="mb-2" />
        <Skeleton variant="text" height="20px" width="300px" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <CartItemSkeleton count={3} />
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <Skeleton variant="text" height="24px" width="150px" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton variant="text" height="16px" width="100px" />
                <Skeleton variant="text" height="16px" width="80px" />
              </div>
              <div className="flex justify-between">
                <Skeleton variant="text" height="16px" width="100px" />
                <Skeleton variant="text" height="16px" width="80px" />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <Skeleton variant="text" height="20px" width="100px" />
                  <Skeleton variant="text" height="20px" width="100px" />
                </div>
              </div>
            </div>
            <Skeleton variant="rectangular" height="48px" width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Checkout Page Loading
 */
export function CheckoutPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" height="48px" width="200px" className="mb-2" />
        <Skeleton variant="text" height="20px" width="300px" />
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between max-w-2xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <Skeleton variant="circle" width="40px" height="40px" />
            {i < 3 && <Skeleton variant="rectangular" height="2px" width="100%" className="mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <CheckoutStepSkeleton />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 sticky top-4">
            <Skeleton variant="text" height="24px" width="150px" />
            <CartItemSkeleton count={2} />
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <Skeleton variant="text" height="16px" width="100px" />
                <Skeleton variant="text" height="16px" width="80px" />
              </div>
              <div className="flex justify-between">
                <Skeleton variant="text" height="16px" width="100px" />
                <Skeleton variant="text" height="16px" width="80px" />
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <Skeleton variant="text" height="20px" width="100px" />
                  <Skeleton variant="text" height="20px" width="100px" />
                </div>
              </div>
            </div>
            <Skeleton variant="rectangular" height="48px" width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Page Loading
 */
export function AdminDashboardPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton variant="text" height="48px" width="300px" className="mb-2" />
        <Skeleton variant="text" height="20px" width="400px" />
      </div>

      <AdminDashboardSkeleton />

      {/* Recent Orders Table */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <Skeleton variant="text" height="24px" width="200px" className="mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton variant="rectangular" width="60px" height="60px" className="rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" height="16px" width="200px" />
                <Skeleton variant="text" height="14px" width="150px" />
              </div>
              <Skeleton variant="rectangular" width="100px" height="32px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

