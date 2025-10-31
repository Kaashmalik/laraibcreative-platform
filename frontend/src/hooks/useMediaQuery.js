import { useState, useEffect } from 'react';

/**
 * Hook for responsive breakpoints that returns boolean flags for different screen sizes.
 * Uses Tailwind's default breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: 1024px - 1279px
 * - largeDesktop: >= 1280px
 * 
 * @returns {{
 *   isMobile: boolean,
 *   isTablet: boolean,
 *   isDesktop: boolean,
 *   isLargeDesktop: boolean
 * }} Object containing boolean flags for each breakpoint
 * 
 * @example
 * function ResponsiveComponent() {
 *   const { isMobile, isTablet, isDesktop } = useMediaQuery()
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileView />}
 *       {isTablet && <TabletView />}
 *       {isDesktop && <DesktopView />}
 *     </div>
 *   )
 * }
 */
function useMediaQuery() {
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280
      });
    };

    // Initial check
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

export default useMediaQuery;
