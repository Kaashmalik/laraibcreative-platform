/**
 * Custom hook for localStorage with state synchronization
 * Provides a simple API to store and retrieve data from localStorage while keeping React state in sync
 * 
 * @module hooks/useLocalStorage
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [storedValue, setValue] - Similar to useState API
 * 
 * @example
 * import useLocalStorage from '@/hooks/useLocalStorage'
 * 
 * function ThemeToggle() {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light')
 *   
 *   const toggleTheme = () => {
 *     setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
 *   }
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current Theme: {theme}
 *     </button>
 *   )
 * }
 * 
 * @example
 * // With objects
 * function UserPreferences() {
 *   const [preferences, setPreferences] = useLocalStorage('userPrefs', {
 *     notifications: true,
 *     emailUpdates: false
 *   })
 *   
 *   const updatePref = (key, value) => {
 *     setPreferences(prev => ({ ...prev, [key]: value }))
 *   }
 *   
 *   return (
 *     <div>
 *       <input 
 *         type="checkbox" 
 *         checked={preferences.notifications}
 *         onChange={(e) => updatePref('notifications', e.target.checked)}
 *       />
 *     </div>
 *   )
 * }
 */

import { useState } from 'react'

function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage