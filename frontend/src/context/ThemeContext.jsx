import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return THEME_DARK;
      }
    }
    return THEME_LIGHT;
  });
  
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setThemeState(e.matches ? THEME_DARK : THEME_LIGHT);
      
      // Track theme change
      if (window.gtag) {
        window.gtag('event', 'theme_change', {
          theme: e.matches ? 'dark' : 'light',
          source: 'system'
        });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document with SEO considerations
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove old theme classes
    root.classList.remove(THEME_LIGHT, THEME_DARK);
    body.classList.remove(THEME_LIGHT, THEME_DARK);
    
    // Add new theme class
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Set color-scheme for better browser rendering
    root.style.colorScheme = theme;
    
    // Update meta theme-color for mobile browsers (important for PWA/SEO)
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Set appropriate theme color
    metaThemeColor.content = theme === THEME_DARK ? '#1a1a1a' : '#ffffff';
    
    // Update meta for Safari
    let appleMobileWebAppStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMobileWebAppStatusBar) {
      appleMobileWebAppStatusBar = document.createElement('meta');
      appleMobileWebAppStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleMobileWebAppStatusBar);
    }
    appleMobileWebAppStatusBar.content = theme === THEME_DARK ? 'black-translucent' : 'default';
    
  }, [theme, mounted]);

  // Set specific theme
  const setTheme = useCallback((newTheme) => {
    if (newTheme === THEME_LIGHT || newTheme === THEME_DARK) {
      setThemeState(newTheme);
      
      // Track theme change
      if (window.gtag) {
        window.gtag('event', 'theme_change', {
          theme: newTheme,
          source: 'manual'
        });
      }
    }
  }, []);

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setTheme(newTheme);
  }, [theme, setTheme]);
  
  // Get CSS variables for current theme
  const getThemeColors = useCallback(() => {
    if (theme === THEME_DARK) {
      return {
        background: '#1a1a1a',
        foreground: '#ffffff',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        muted: '#374151',
        border: '#4b5563'
      };
    }
    return {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#d97706',
      muted: '#f3f4f6',
      border: '#e5e7eb'
    };
  }, [theme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === THEME_LIGHT,
    isDark: theme === THEME_DARK,
    mounted,
    getThemeColors
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

// Theme toggle button component
export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button 
        className={`p-2 rounded-lg transition-colors ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      </button>
    );
  }
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
        </svg>
      )}
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string
};

// Hook to prevent flash of wrong theme
export function usePreventThemeFlash() {
  const { mounted } = useTheme();
  return mounted;
}

// SEO-friendly theme script (inject in _document.js or index.html)
export const themeScript = `
(function() {
  try {
    var theme = 'light';
    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (systemPrefersDark) {
      theme = 'dark';
    }
    
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;