/**
 * Hook to ensure minimum display time for loading states
 * Prevents flash of loading skeleton
 * 
 * @module hooks/useMinimumDisplayTime
 */

import { useState, useEffect, useRef } from 'react';

interface UseMinimumDisplayTimeOptions {
  /** Minimum display time in milliseconds */
  minimumTime?: number;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook to ensure loading state displays for minimum time
 * 
 * @example
 * const { displayLoading } = useMinimumDisplayTime({
 *   minimumTime: 500,
 *   isLoading: loading
 * });
 * 
 * return displayLoading ? <Skeleton /> : <Content />;
 */
export function useMinimumDisplayTime({
  minimumTime = 300,
  isLoading,
}: UseMinimumDisplayTimeOptions): boolean {
  const [displayLoading, setDisplayLoading] = useState(isLoading);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - record start time
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      setDisplayLoading(true);
    } else {
      // Stop loading - calculate elapsed time
      if (startTimeRef.current !== null) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, minimumTime - elapsed);

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Wait for remaining time before hiding
        timeoutRef.current = setTimeout(() => {
          setDisplayLoading(false);
          startTimeRef.current = null;
        }, remaining);
      } else {
        // No start time recorded, hide immediately
        setDisplayLoading(false);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, minimumTime]);

  return displayLoading;
}

export default useMinimumDisplayTime;

