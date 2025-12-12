/**
 * Loading Components for Dynamic Imports
 * Custom loading skeletons for heavy components
 */

import React from 'react';

/**
 * CustomOrderPage Loading Skeleton
 */
export function CustomOrderLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                {step < 5 && (
                  <div className="flex-1 h-1 bg-gray-200 mx-2 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content Skeleton */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * RichTextEditor Loading Skeleton
 */
export function RichTextEditorLoading() {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar Skeleton */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Editor Area Skeleton */}
      <div className="p-4 bg-white min-h-[400px]">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Chart Loading Skeleton
 */
export function ChartLoading({ height = 300 }: { height?: number }) {
  // Generate consistent heights for bars
  const barHeights = [65, 45, 80, 55, 70, 40, 75, 50];
  
  return (
    <div 
      className="rounded-lg p-6"
      style={{ height: `${height}px` }}
    >
      {/* Chart Area Skeleton */}
      <div className="relative h-full">
        {/* Y-axis skeleton */}
        <div className="absolute left-0 top-0 bottom-8 w-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-3 bg-gray-600/30 dark:bg-gray-500/30 rounded animate-pulse" />
          ))}
        </div>

        {/* Chart bars/lines skeleton - vibrant gradient colors */}
        <div className="ml-12 mr-4 h-full flex items-end justify-between gap-2 pb-8">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t animate-pulse"
              style={{ 
                height: `${h}%`,
                background: `linear-gradient(180deg, 
                  ${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#6366f1'][i]} 80%, 
                  ${['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#6366f1'][i]}40 100%)`,
                opacity: 0.7
              }}
            />
          ))}
        </div>

        {/* X-axis skeleton */}
        <div className="absolute bottom-0 left-12 right-4 h-8 flex justify-between items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-3 bg-gray-600/30 dark:bg-gray-500/30 rounded w-8 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ImageGallery Loading Skeleton
 */
export function ImageGalleryLoading() {
  return (
    <div className="space-y-4">
      {/* Main Image Skeleton */}
      <div className="relative aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
      </div>

      {/* Thumbnails Skeleton */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative aspect-square bg-gray-200 rounded overflow-hidden animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generic Component Loading Skeleton
 */
export function ComponentLoading({ 
  height = 'auto',
  className = ''
}: { 
  height?: string | number;
  className?: string;
}) {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 animate-pulse ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

