'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/ui/Spinner';

/**
 * Route Loading Screen
 * Global loading screen for route transitions
 * 
 * @component
 */
interface RouteLoadingScreenProps {
  /** Minimum display time in milliseconds (prevents flash) */
  minimumDisplayTime?: number;
  /** Custom loading message */
  message?: string;
}

export function RouteLoadingScreen({ 
  minimumDisplayTime = 300,
  message = 'Loading...'
}: RouteLoadingScreenProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Show loading screen
    setIsVisible(true);

    // Calculate remaining time to meet minimum display time
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minimumDisplayTime - elapsed);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, remaining);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [pathname, minimumDisplayTime, startTime]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner size="lg" className="text-primary-600 dark:text-primary-400" />
          </motion.div>
          
          {message && (
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="mt-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {message}
            </motion.p>
          )}

          <span className="sr-only">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to show loading screen during route transitions
 */
export function useRouteLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}

export default RouteLoadingScreen;

