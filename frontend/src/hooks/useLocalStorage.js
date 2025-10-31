import { useState } from 'react';

/**
 * Hook for managing values in localStorage with state synchronization.
 * 
 * @template T
 * @param {string} key - The key to store in localStorage
 * @param {T} initialValue - Initial value if no value exists in localStorage
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple with the stored value and a setter function
 * 
 * @example
 * // Store simple value
 * const [name, setName] = useLocalStorage('user-name', '')
 * setName('John Doe')
 * 
 * @example
 * // Store object
 * const [settings, setSettings] = useLocalStorage('app-settings', {
 *   theme: 'light',
 *   notifications: true
 * })
 * setSettings(prev => ({ ...prev, theme: 'dark' }))
 * 
 * @example
 * // Store array
 * const [todos, setTodos] = useLocalStorage('todos', [])
 * setTodos(prev => [...prev, newTodo])
 */
function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  /**
   * Function to update stored value and localStorage
   * @param {T | ((val: T) => T)} value - New value or update function
   */
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
