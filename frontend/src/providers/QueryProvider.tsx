/**
 * React Query Provider
 * Wraps the application with React Query context
 */

'use client';

import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/queryClient';
import { GlobalLoadingIndicator } from '@/components/shared/GlobalLoadingIndicator';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client once per component instance
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Global loading indicator */}
      <GlobalLoadingIndicator 
        color="#8b5cf6" 
        height={3} 
        showDelay={100}
        minDisplayTime={200}
      />
      
      {/* App content */}
      {children}
      
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;

