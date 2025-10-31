import { useState, useEffect } from 'react';

/**
 * Hook to debounce any value with a configurable delay.
 * Useful for search inputs, form validation, or any value that changes frequently.
 * 
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} [delay=500] - Debounce delay in milliseconds
 * @returns {T} The debounced value
 * 
 * @example
 * // Debounce search input
 * const SearchComponent = () => {
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebounce(search)
 * 
 *   useEffect(() => {
 *     // API call with debouncedSearch
 *   }, [debouncedSearch])
 * 
 *   return <input value={search} onChange={e => setSearch(e.target.value)} />
 * }
 * 
 * @example
 * // Custom delay for specific use case
 * const debouncedValue = useDebounce(value, 1000)
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on value or delay change
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
