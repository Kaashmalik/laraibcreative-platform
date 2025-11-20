/**
 * TypeScript Types for Dynamic Imports
 * Type definitions for dynamically imported components
 */

import { ComponentType, ReactNode } from 'react';

/**
 * Dynamic import configuration options
 */
export interface DynamicImportConfig {
  /** Loading component to show while importing */
  loading?: ComponentType | (() => ReactNode);
  /** Disable server-side rendering */
  ssr?: boolean;
  /** Component name for error messages */
  componentName?: string;
  /** Custom error boundary fallback */
  fallback?: ReactNode;
  /** Show retry button in error boundary */
  showRetry?: boolean;
  /** Retry callback */
  onRetry?: () => void;
}

/**
 * Dynamic import result
 */
export interface DynamicImportResult<P = {}> {
  default: ComponentType<P>;
}

/**
 * Component with error boundary props
 */
export interface ComponentWithErrorBoundary {
  componentName?: string;
  fallback?: ReactNode;
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Loading component props
 */
export interface LoadingComponentProps {
  /** Custom height */
  height?: number | string;
  /** Additional className */
  className?: string;
  /** Component name for loading message */
  componentName?: string;
}

