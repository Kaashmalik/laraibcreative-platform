import { useEffect } from 'react';

/**
 * Hook for detecting when user has scrolled near the bottom of the page.
 * Useful for implementing infinite scroll or load-more functionality.
 * 
 * @param {Function} callback - Function to call when scroll threshold is reached
 * @param {Object} [options] - Configuration options
 * @param {number} [options.threshold=100] - Distance from bottom (in pixels) to trigger callback
 * @param {boolean} [options.enabled=true] - Whether to enable scroll detection
 * 
 * @example
 * // Basic infinite scroll
 * function ProductList() {
 *   const { products, loadMore, hasMore } = useProducts()
 *   
 *   useInfiniteScroll(loadMore, { enabled: hasMore })
 *   
 *   return <div>{products.map(product => (
 *     <ProductCard key={product.id} product={product} />
 *   ))}</div>
 * }
 * 
 * @example
 * // Custom threshold
 * useInfiniteScroll(loadMore, { 
 *   threshold: 200,
 *   enabled: !isLoading && hasMore 
 * })
 */
function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      // Check if user has scrolled near bottom
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        callback();
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);

    return () => window.removeEventListener('scroll', throttledScroll);
  }, [callback, threshold, enabled]);
}

export default useInfiniteScroll;
