'use client';

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * SearchBar Component
 * 
 * Features:
 * - Modal overlay on mobile/desktop
 * - Auto-complete suggestions
 * - Recent searches (stored in memory)
 * - Product quick results
 * - Popular searches
 * - Keyboard navigation (Arrow keys, Enter, Esc)
 * - Debounced search API calls
 */
export default function SearchBar({ isOpen, onClose }) {
  const router = useRouter()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  // Popular search terms
  const popularSearches = [
    'Bridal suits',
    'Party wear',
    'Designer replicas',
    'Casual lawn suits',
    'Formal wear',
    'Custom stitching'
  ]

  // Load recent searches from memory on mount
  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(sessionStorage.getItem('recentSearches') || '[]')
      setRecentSearches(stored.slice(0, 5))
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Debounced search function
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        // API call for search suggestions
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
        const data = await response.json()
        setSuggestions(data.results || [])
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Handle search submission
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return

    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    sessionStorage.setItem('recentSearches', JSON.stringify(updated))

    // Navigate to search results
    router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
    onClose()
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : popularSearches
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        const selectedItem = suggestions[selectedIndex] || popularSearches[selectedIndex]
        handleSearch(typeof selectedItem === 'string' ? selectedItem : selectedItem.title)
      } else {
        handleSearch(query)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    sessionStorage.removeItem('recentSearches')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center px-6 py-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for products, categories, designs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-gray-900 placeholder-gray-400 outline-none text-base"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results / Suggestions */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query ? (
                  // Search Results
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="space-y-2">
                        {suggestions.map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={onClose}
                            className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                              selectedIndex === index
                                ? 'bg-primary-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <Image
                              src={product.image || '/images/placeholder.png'}
                              alt={product.title}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {product.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                PKR {product.price?.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">No products found for "{query}"</p>
                        <button
                          onClick={() => handleSearch(query)}
                          className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Search anyway →
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Default View: Recent + Popular Searches
                  <div className="p-4 space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            Recent Searches
                          </h3>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear all
                          </button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              onClick={() => handleSearch(search)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedIndex === index
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}