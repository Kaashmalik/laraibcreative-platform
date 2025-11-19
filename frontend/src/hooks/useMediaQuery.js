/**
 * Custom hook for responsive breakpoints
 * Tracks window size and returns current breakpoint information
 * 
 * @module hooks/useMediaQuery
 * @returns {Object} Breakpoint object with boolean flags for each breakpoint
 * @property {boolean} isMobile - True if width < 768px
 * @property {boolean} isTablet - True if width >= 768px && width < 1024px
 * @property {boolean} isDesktop - True if width >= 1024px && width < 1280px
 * @property {boolean} isLargeDesktop - True if width >= 1280px
 * 
 * @example
 * import useMediaQuery from '@/hooks/useMediaQuery'
 * 
 * function ResponsiveComponent() {
 *   const { isMobile, isTablet, isDesktop, isLargeDesktop } = useMediaQuery()
 *   
 *   if (isMobile) {
 *     return <MobileView />
 *   }
 *   
 *   if (isTablet) {
 *     return <TabletView />
 *   }
 *   
 *   return <DesktopView />
 * }
 * 
 * @example
 * // Conditional rendering based on breakpoint
 * function Navigation() {
 *   const { isMobile } = useMediaQuery()
 *   
 *   return (
 *     <nav>
 *       {isMobile ? (
 *         <MobileMenu />
 *       ) : (
 *         <DesktopMenu />
 *       )}
 *     </nav>
 *   )
 * }
 * 
 * @example
 * // Dynamic grid columns
 * function ProductGrid() {
 *   const { isMobile, isTablet, isDesktop } = useMediaQuery()
 *   
 *   const columns = isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4
 *   
 *   return (
 *     <div className={`grid grid-cols-${columns} gap-4`}>
 *       {products.map(product => <ProductCard key={product.id} {...product} />)}
 *     </div>
 *   )
 * }
 */

import { useState, useEffect } from 'react'

function useMediaQuery() {
  // Initialize state with default values
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false
  })

  useEffect(() => {
    // Function to update breakpoint state
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      setBreakpoint({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280
      })
    }

    // Set initial breakpoint
    updateBreakpoint()

    // Add event listener for window resize
    window.addEventListener('resize', updateBreakpoint)

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, []) // Empty dependency array means this effect runs once on mount

  return breakpoint
}

export default useMediaQuery