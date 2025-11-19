/**
 * Custom hook to detect scroll to bottom for pagination
 * Triggers a callback when user scrolls near the bottom of the page
 * 
 * @module hooks/useInfiniteScroll
 * @param {Function} callback - Function to call when scroll threshold is reached
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Distance from bottom in pixels to trigger callback (default: 100)
 * @param {boolean} options.enabled - Whether the hook is active (default: true)
 * 
 * @example
 * import useInfiniteScroll from '@/hooks/useInfiniteScroll'
 * import useProducts from '@/hooks/useProducts'
 * 
 * function ProductList() {
 *   const { products, isLoading, hasMore, loadMore } = useProducts()
 *   
 *   useInfiniteScroll(loadMore, {
 *     threshold: 200,
 *     enabled: hasMore && !isLoading
 *   })
 *   
 *   return (
 *     <div>
 *       {products.map(product => (
 *         <ProductCard key={product.id} {...product} />
 *       ))}
 *       {isLoading && <LoadingSpinner />}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // With custom threshold
 * function FeedComponent() {
 *   const [posts, setPosts] = useState([])
 *   const [page, setPage] = useState(1)
 *   const [hasMore, setHasMore] = useState(true)
 *   
 *   const loadMorePosts = async () => {
 *     const newPosts = await fetchPosts(page + 1)
 *     setPosts(prev => [...prev, ...newPosts])
 *     setPage(prev => prev + 1)
 *     setHasMore(newPosts.length > 0)
 *   }
 *   
 *   useInfiniteScroll(loadMorePosts, {
 *     threshold: 300,
 *     enabled: hasMore
 *   })
 *   
 *   return (
 *     <div>
 *       {posts.map(post => <PostCard key={post.id} {...post} />)}
 *     </div>
 *   )
 * }
 * 
 * @example
 * // Conditional enable/disable
 * function SearchResults() {
 *   const [results, setResults] = useState([])
 *   const [isSearching, setIsSearching] = useState(false)
 *   const [hasMore, setHasMore] = useState(true)
 *   
 *   useInfiniteScroll(loadMoreResults, {
 *     enabled: !isSearching && hasMore
 *   })
 *   
 *   return <ResultsList results={results} />
 * }
 */

import { useEffect } from 'react'

function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, enabled = true } = options

  useEffect(() => {
    // Don't set up listener if not enabled
    if (!enabled) {
      return
    }

    // Handle scroll event
    const handleScroll = () => {
      // Get scroll dimensions
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      // Check if user has scrolled to threshold distance from bottom
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        callback()
      }
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [callback, threshold, enabled]) // Re-run effect if any dependency changes
}

export default useInfiniteScroll