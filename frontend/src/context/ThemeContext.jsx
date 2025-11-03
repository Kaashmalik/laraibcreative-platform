'use client';

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'theme-preference';
const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (savedTheme) {
        return savedTheme;
      }
      // Then check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEME_DARK;
      }
    }
    return THEME_LIGHT;
  });

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setThemeState(e.matches ? THEME_DARK : THEME_LIGHT);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEME_LIGHT, THEME_DARK);
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === THEME_LIGHT || newTheme === THEME_DARK) {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(current => current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT);
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === THEME_LIGHT,
    isDark: theme === THEME_DARK
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
