/**
 * Custom hook to detect scroll direction
 * Returns 'up' or 'down' based on scroll direction
 * 
 * @module hooks/useScrollDirection
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Minimum scroll distance to trigger direction change (default: 10)
 * @param {boolean} options.initialDirection - Initial scroll direction (default: 'up')
 * @returns {string} 'up' | 'down' - Current scroll direction
 * 
 * @example
 * import { useScrollDirection } from '@/hooks/useScrollDirection'
 * 
 * function Header() {
 *   const scrollDirection = useScrollDirection({ threshold: 5 })
 *   
 *   return (
 *     <header className={scrollDirection === 'down' ? 'hidden' : 'block'}>
 *       Navigation
 *     </header>
 *   )
 * }
 */

import { useState, useEffect, useRef } from 'react';

export type ScrollDirection = 'up' | 'down';

export interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: ScrollDirection;
}

export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): ScrollDirection {
  const { threshold = 10, initialDirection = 'up' } = options;
  
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Only update if scroll distance exceeds threshold
      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        ticking.current = false;
        return;
      }

      const direction: ScrollDirection = scrollY > lastScrollY.current ? 'down' : 'up';
      
      setScrollDirection(direction);
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    // Set initial scroll position
    lastScrollY.current = window.scrollY;

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [threshold]);

  return scrollDirection;
}

