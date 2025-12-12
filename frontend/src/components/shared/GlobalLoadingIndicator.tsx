/**
 * Global Loading Indicator
 * Shows loading state for React Query operations
 * 
 * Features:
 * - Shows progress bar during data fetching
 * - Debounced to avoid flickering
 * - Accessible with aria labels
 */

'use client';

import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

interface GlobalLoadingIndicatorProps {
  /** Minimum time to show loading (prevents flickering) */
  minDisplayTime?: number;
  /** Delay before showing loading (prevents flash for fast requests) */
  showDelay?: number;
  /** Custom color for the loading bar */
  color?: string;
  /** Height of the loading bar in pixels */
  height?: number;
}

export function GlobalLoadingIndicator({
  minDisplayTime = 200,
  showDelay = 100,
  color = '#8b5cf6', // Purple
  height = 3,
}: GlobalLoadingIndicatorProps) {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  const [showLoading, setShowLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    if (isLoading) {
      // Show loading after delay
      showTimeout = setTimeout(() => {
        setShowLoading(true);
        setProgress(10);

        // Animate progress
        progressInterval = setInterval(() => {
          setProgress((prev) => {
            // Slowly increase but never reach 100
            if (prev >= 90) return prev;
            return prev + Math.random() * 10;
          });
        }, 200);
      }, showDelay);
    } else if (showLoading) {
      // Complete the progress bar
      setProgress(100);

      // Hide after animation completes
      hideTimeout = setTimeout(() => {
        setShowLoading(false);
        setProgress(0);
      }, minDisplayTime);
    }

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearInterval(progressInterval);
    };
  }, [isLoading, showLoading, showDelay, minDisplayTime]);

  if (!showLoading && progress === 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Loading content"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ height }}
    >
      <div
        className="h-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`,
        }}
      />
    </div>
  );
}

/**
 * Simple Spinner Loading Indicator
 */
export function GlobalSpinner() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 shadow-lg">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Full Page Loading Overlay
 * Use for critical operations like checkout
 */
export function FullPageLoader({ message = 'Processing...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to check if any queries are loading
 */
export function useIsGlobalLoading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  
  return {
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
    isLoading: isFetching > 0 || isMutating > 0,
    fetchingCount: isFetching,
    mutatingCount: isMutating,
  };
}

export default GlobalLoadingIndicator;

