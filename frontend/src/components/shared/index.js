/**
 * Barrel export file for shared components
 * Location: frontend/src/components/shared/index.js
 * 
 * This file allows importing all shared components from a single location
 * 
 * @example
 * // Instead of multiple imports:
 * import LoadingScreen from '@/components/shared/LoadingScreen'
 * import EmptyState from '@/components/shared/EmptyState'
 * import SEO from '@/components/shared/SEO'
 * 
 * // Use single import:
 * import { LoadingScreen, EmptyState, SEO } from '@/components/shared'
 * 
 * @example
 * // Import SEO helper functions:
 * import { SEO, generateProductSchema, generateArticleSchema } from '@/components/shared'
 */

// ==================== Component Exports ====================

export { default as LoadingScreen } from './LoadingScreen';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as EmptyState } from './EmptyState';
export { default as ProtectedRoute } from './ProtectedRoute';

// SEO Component and Helper Functions
export { 
  default as SEO,
  generateProductSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateReviewSchema
} from './SEO';

// Product Structured Data Component (TypeScript)
export { default as ProductStructuredData } from './ProductStructuredData';

// Dynamic Import Components
export { DynamicErrorBoundary, withErrorBoundary } from './DynamicErrorBoundary';
export {
  CustomOrderLoading,
  RichTextEditorLoading,
  ChartLoading,
  ImageGalleryLoading,
  ComponentLoading
} from './LoadingComponents';

// ==================== Re-export Types (for TypeScript users) ====================
// If you convert to TypeScript later, you can add type exports here

/**
 * Usage Examples:
 * 
 * 1. Basic Component Import:
 * ```jsx
 * import { LoadingScreen } from '@/components/shared';
 * 
 * function MyPage() {
 *   return <LoadingScreen message="Loading..." />;
 * }
 * ```
 * 
 * 2. Multiple Components:
 * ```jsx
 * import { ErrorBoundary, EmptyState, ProtectedRoute } from '@/components/shared';
 * 
 * function Dashboard() {
 *   return (
 *     <ErrorBoundary>
 *       <ProtectedRoute>
 *         <EmptyState title="No data" />
 *       </ProtectedRoute>
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 * 
 * 3. SEO with Helpers:
 * ```jsx
 * import { SEO, generateProductSchema } from '@/components/shared';
 * 
 * function ProductPage({ product }) {
 *   return (
 *     <>
 *       <SEO 
 *         title={product.title}
 *         structuredData={generateProductSchema(product)}
 *       />
 *       <main>{product.content}</main>
 *     </>
 *   );
 * }
 * ```
 */