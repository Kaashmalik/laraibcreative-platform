/**
 * Custom hook to debounce any value with configurable delay
 * Useful for search inputs, API calls, or any rapidly changing values
 * 
 * @module hooks/useDebounce
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {*} The debounced value
 * 
 * @example
 * import { useState } from 'react'
 * import useDebounce from '@/hooks/useDebounce'
 * 
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300)
 *   
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // API call will only fire after user stops typing for 300ms
 *       searchAPI(debouncedSearchTerm)
 *     }
 *   }, [debouncedSearchTerm])
 *   
 *   return (
 *     <input 
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search products..."
 *     />
 *   )
 * }
 * 
 * @example
 * // With custom delay
 * function LivePreview() {
 *   const [content, setContent] = useState('')
 *   const debouncedContent = useDebounce(content, 1000)
 *   
 *   useEffect(() => {
 *     // Save draft to server every 1 second after user stops typing
 *     saveDraft(debouncedContent)
 *   }, [debouncedContent])
 *   
 *   return (
 *     <textarea 
 *       value={content}
 *       onChange={(e) => setContent(e.target.value)}
 *     />
 *   )
 * }
 */

import { useState, useEffect } from 'react'

function useDebounce(value, delay = 500) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on component unmount)
    // This prevents the debounced value from updating if value is changed
    // within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Only re-call effect if value or delay changes

  return debouncedValue
}

export default useDebounce