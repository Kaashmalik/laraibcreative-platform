/**
 * React Cache for Data Fetching
 * Provides request-level caching for server components
 */

import { cache } from 'react';

/**
 * Cached fetch wrapper with revalidation
 * Uses React Cache for request-level deduplication
 */
export const cachedFetch = cache(async (
  url: string,
  options?: RequestInit & { next?: { revalidate?: number } }
) => {
  const response = await fetch(url, {
    ...options,
    next: {
      revalidate: options?.next?.revalidate || 3600, // Default 1 hour
      ...options?.next,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
});

/**
 * Cached API call wrapper
 */
export const cachedApiCall = cache(async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  // This will be deduplicated within the same request
  return apiCall();
});

