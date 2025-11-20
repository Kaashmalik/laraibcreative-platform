/**
 * Dynamic Import Configurations
 * Centralized dynamic import configurations for heavy components
 * 
 * This file provides pre-configured dynamic imports with loading states,
 * error boundaries, and TypeScript types.
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';
import {
  CustomOrderLoading,
  RichTextEditorLoading,
  ChartLoading,
  ImageGalleryLoading,
} from '@/components/shared/LoadingComponents';
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Dynamic import options
 */
export interface DynamicImportOptions {
  /** Loading component */
  loading?: ComponentType | (() => ReactElement);
  /** Disable SSR */
  ssr?: boolean;
  /** Component name for error messages */
  componentName?: string;
}

// ============================================================================
// CUSTOM ORDER PAGE
// ============================================================================

/**
 * Dynamically imported CustomOrderPage component
 * 
 * Why dynamic:
 * - Large component with multiple sub-components
 * - Only needed on custom-order page
 * - Contains heavy form logic and state management
 * 
 * SSR: false (client-side only, uses localStorage)
 */
export const DynamicCustomOrderPage = dynamic(
  () => import('@/components/custom-order/CustomOrderPage'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="CustomOrderPage">
        <CustomOrderLoading />
      </DynamicErrorBoundary>
    ),
    ssr: false, // Uses localStorage, client-side only
  }
);

// ============================================================================
// RICH TEXT EDITOR
// ============================================================================

/**
 * Dynamically imported RichTextEditor component
 * 
 * Why dynamic:
 * - Heavy WYSIWYG editor with toolbar
 * - Only used in admin blog/product forms
 * - Contains complex editor logic
 * 
 * SSR: false (editor requires browser APIs)
 */
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="RichTextEditor">
        <RichTextEditorLoading />
      </DynamicErrorBoundary>
    ),
    ssr: false, // Editor requires browser APIs (contentEditable, etc.)
  }
);

// ============================================================================
// CHART COMPONENTS
// ============================================================================

/**
 * Dynamically imported RevenueChart component
 * 
 * Why dynamic:
 * - Uses recharts library (~100KB)
 * - Only shown on admin dashboard
 * - Heavy chart rendering logic
 * 
 * SSR: false (charts require browser canvas APIs)
 */
export const DynamicRevenueChart = dynamic(
  () => import('@/app/admin/dashboard/components/RevenueChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="RevenueChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false, // Charts require canvas/DOM APIs
  }
);

/**
 * Dynamically imported OrdersPieChart component
 */
export const DynamicOrdersPieChart = dynamic(
  () => import('@/app/admin/dashboard/components/OrdersPieChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="OrdersPieChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

/**
 * Dynamically imported PopularProductsChart component
 */
export const DynamicPopularProductsChart = dynamic(
  () => import('@/app/admin/dashboard/components/PopularProductsChart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="PopularProductsChart">
        <ChartLoading height={350} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

/**
 * Dynamically imported Chart component (base chart wrapper)
 */
export const DynamicChart = dynamic(
  () => import('@/components/admin/Chart'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="Chart">
        <ChartLoading height={300} />
      </DynamicErrorBoundary>
    ),
    ssr: false,
  }
);

// ============================================================================
// IMAGE GALLERY
// ============================================================================

/**
 * Dynamically imported ImageGallery component
 * 
 * Why dynamic:
 * - Heavy component with lightbox, zoom, animations
 * - Uses framer-motion (~50KB)
 * - Only needed on product detail pages
 * 
 * SSR: true (can be server-rendered, but lazy load for performance)
 */
export const DynamicImageGallery = dynamic(
  () => import('@/components/customer/ImageGallery'),
  {
    loading: () => (
      <DynamicErrorBoundary componentName="ImageGallery">
        <ImageGalleryLoading />
      </DynamicErrorBoundary>
    ),
    ssr: true, // Can be server-rendered, but lazy loaded
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a dynamic import with error boundary wrapper
 * 
 * @param importFn - Dynamic import function
 * @param options - Dynamic import options
 * @returns Dynamically imported component wrapped in error boundary
 */
export function createDynamicImport<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicImportOptions = {}
) {
  const {
    loading: LoadingComponent,
    ssr = false,
    componentName = 'Component',
  } = options;

  return dynamic(importFn, {
    loading: LoadingComponent
      ? () => {
          const Loader = LoadingComponent as ComponentType;
          return (
            <DynamicErrorBoundary componentName={componentName}>
              <Loader />
            </DynamicErrorBoundary>
          );
        }
      : undefined,
    ssr,
  });
}

/**
 * Preload a dynamically imported component
 * Useful for components that will likely be needed soon
 * 
 * @param importFn - Dynamic import function
 */
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    importFn();
  }
}

