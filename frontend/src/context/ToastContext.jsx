import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

const THEME_LIGHT = 'light';
const THEME_DARK = 'dark';
const THEME_AUTO = 'auto';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Production-ready theme management with SEO optimization
 * Features:
 * - System preference detection
 * - SEO meta tags (theme-color, color-scheme)
 * - Accessibility support
 * - Analytics tracking
 * - Hydration-safe (no localStorage)
 * - PWA support
 */
export function ThemeProvider({ children }) {
  // Detect system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return THEME_LIGHT;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT;
  }, []);

  const [themePreference, setThemePreference] = useState(THEME_AUTO);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [mounted, setMounted] = useState(false);
  const mediaQueryRef = useRef(null);

  // Calculate effective theme
  const effectiveTheme = themePreference === THEME_AUTO ? systemTheme : themePreference;

  // Mark component as mounted (prevent hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    mediaQueryRef.current = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? THEME_DARK : THEME_LIGHT;
      setSystemTheme(newSystemTheme);
      
      // Track system theme change
      if (window.gtag) {
        window.gtag('event', 'theme_system_change', {
          theme: newSystemTheme
        });
      }
      
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'theme_system_change',
          theme: newSystemTheme
        });
      }
    };

    mediaQueryRef.current.addEventListener('change', handleChange);
    
    return () => {
      if (mediaQueryRef.current) {
        mediaQueryRef.current.removeEventListener('change', handleChange);
      }
    };
  }, []);

  // Apply theme to document with comprehensive SEO optimization
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove old theme classes
    root.classList.remove(THEME_LIGHT, THEME_DARK);
    body.classList.remove(THEME_LIGHT, THEME_DARK);
    
    // Add new theme class
    root.classList.add(effectiveTheme);
    body.classList.add(effectiveTheme);
    
    // Set color-scheme CSS property (improves browser rendering & form controls)
    root.style.colorScheme = effectiveTheme;
    
    // Update or create theme-color meta tag (important for mobile browsers & PWA)
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Set appropriate theme color based on theme
    const themeColors = {
      light: '#ffffff',
      dark: '#0f172a'
    };
    metaThemeColor.content = themeColors[effectiveTheme];
    
    // Add media query for dynamic theme-color (advanced SEO)
    let metaThemeColorDark = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
    if (!metaThemeColorDark) {
      metaThemeColorDark = document.createElement('meta');
      metaThemeColorDark.name = 'theme-color';
      metaThemeColorDark.media = '(prefers-color-scheme: dark)';
      document.head.appendChild(metaThemeColorDark);
    }
    metaThemeColorDark.content = themeColors.dark;
    
    // Update Apple mobile web app status bar (iOS Safari)
    let appleMobileWebAppStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMobileWebAppStatusBar) {
      appleMobileWebAppStatusBar = document.createElement('meta');
      appleMobileWebAppStatusBar.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(appleMobileWebAppStatusBar);
    }
    appleMobileWebAppStatusBar.content = effectiveTheme === THEME_DARK ? 'black-translucent' : 'default';
    
    // Update MS tile color (Windows)
    let msTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!msTileColor) {
      msTileColor = document.createElement('meta');
      msTileColor.name = 'msapplication-TileColor';
      document.head.appendChild(msTileColor);
    }
    msTileColor.content = effectiveTheme === THEME_DARK ? '#0f172a' : '#ffffff';
    
    // Update manifest theme color dynamically (PWA support)
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink && window.fetch) {
      fetch(manifestLink.href)
        .then(res => res.json())
        .then(manifest => {
          manifest.theme_color = themeColors[effectiveTheme];
          manifest.background_color = themeColors[effectiveTheme];
          
          const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          manifestLink.href = url;
        })
        .catch(err => console.warn('Could not update manifest:', err));
    }
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', effectiveTheme);
    
    // Track theme application
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'theme_applied',
        theme: effectiveTheme,
        preference: themePreference
      });
    }
    
  }, [effectiveTheme, mounted, themePreference]);

  // Set specific theme with analytics
  const setTheme = useCallback((newTheme) => {
    if (![THEME_LIGHT, THEME_DARK, THEME_AUTO].includes(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Must be 'light', 'dark', or 'auto'`);
      return;
    }
    
    setThemePreference(newTheme);
    
    // Track theme change
    if (window.gtag) {
      window.gtag('event', 'theme_change', {
        theme: newTheme,
        source: 'manual'
      });
    }
    
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'theme_change',
        theme: newTheme,
        source: 'manual'
      });
    }
  }, []);

  // Toggle between light and dark (ignores auto)
  const toggleTheme = useCallback(() => {
    const newTheme = effectiveTheme === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    setTheme(newTheme);
  }, [effectiveTheme, setTheme]);

  // Get theme-specific colors for dynamic styling
  const getThemeColors = useCallback(() => {
    const darkColors = {
      // Background colors
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      
      // Text colors
      foreground: '#f1f5f9',
      foregroundSecondary: '#cbd5e1',
      foregroundMuted: '#94a3b8',
      
      // Brand colors
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#8b5cf6',
      secondaryHover: '#7c3aed',
      accent: '#f59e0b',
      accentHover: '#d97706',
      
      // UI colors
      muted: '#374151',
      border: '#475569',
      borderLight: '#334155',
      
      // Semantic colors
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      
      // Card/Surface
      card: '#1e293b',
      cardHover: '#334155',
      
      // Input
      input: '#334155',
      inputBorder: '#475569',
      inputFocus: '#3b82f6'
    };
    
    const lightColors = {
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      
      // Text colors
      foreground: '#0f172a',
      foregroundSecondary: '#475569',
      foregroundMuted: '#64748b',
      
      // Brand colors
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      secondary: '#7c3aed',
      secondaryHover: '#6d28d9',
      accent: '#d97706',
      accentHover: '#b45309',
      
      // UI colors
      muted: '#f1f5f9',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      
      // Semantic colors
      success: '#059669',
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      
      // Card/Surface
      card: '#ffffff',
      cardHover: '#f8fafc',
      
      // Input
      input: '#ffffff',
      inputBorder: '#e2e8f0',
      inputFocus: '#2563eb'
    };
    
    return effectiveTheme === THEME_DARK ? darkColors : lightColors;
  }, [effectiveTheme]);

  // Get contrast color for text on colored backgrounds
  const getContrastColor = useCallback((backgroundColor) => {
    // Simple contrast calculation
    const rgb = backgroundColor.match(/\w\w/g);
    if (!rgb) return effectiveTheme === THEME_DARK ? '#ffffff' : '#000000';
    
    const [r, g, b] = rgb.map(x => parseInt(x, 16));
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [effectiveTheme]);

  // Check if user prefers reduced motion (accessibility)
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const value = {
    // Current theme
    theme: effectiveTheme,
    themePreference,
    systemTheme,
    
    // Theme setters
    setTheme,
    toggleTheme,
    
    // Theme checks
    isLight: effectiveTheme === THEME_LIGHT,
    isDark: effectiveTheme === THEME_DARK,
    isAuto: themePreference === THEME_AUTO,
    
    // Utility
    mounted,
    getThemeColors,
    getContrastColor,
    prefersReducedMotion,
    
    // Constants
    THEME_LIGHT,
    THEME_DARK,
    THEME_AUTO
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

/**
 * useTheme Hook
 * Access theme context in any component
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * ThemeToggle Component
 * Pre-built theme toggle button with icons
 */
export function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme, mounted } = useTheme();
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button 
        className={`inline-flex items-center gap-2 p-2 rounded-lg transition-colors ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      </button>
    );
  }
  
  const Icon = theme === 'light' ? MoonIcon : SunIcon;
  const label = theme === 'light' ? 'Dark mode' : 'Light mode';
  
  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={label}
    >
      <Icon className="w-5 h-5" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool
};

/**
 * ThemeSelect Component
 * Dropdown to select theme preference (light/dark/auto)
 */
export function ThemeSelect({ className = '' }) {
  const { themePreference, setTheme, mounted, THEME_LIGHT, THEME_DARK, THEME_AUTO } = useTheme();
  
  if (!mounted) return null;
  
  return (
    <select
      value={themePreference}
      onChange={(e) => setTheme(e.target.value)}
      className={`px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label="Theme preference"
    >
      <option value={THEME_LIGHT}>☀️ Light</option>
      <option value={THEME_DARK}>🌙 Dark</option>
      <option value={THEME_AUTO}>🔄 Auto</option>
    </select>
  );
}

ThemeSelect.propTypes = {
  className: PropTypes.string
};

/**
 * Icon Components
 */
function SunIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
    </svg>
  );
}

SunIcon.propTypes = {
  className: PropTypes.string
};

function MoonIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

MoonIcon.propTypes = {
  className: PropTypes.string
};

/**
 * usePreventThemeFlash Hook
 * Returns mounted state to prevent flash of wrong theme
 */
export function usePreventThemeFlash() {
  const { mounted } = useTheme();
  return mounted;
}

/**
 * Theme initialization script for HTML <head>
 * Inject this in _document.js or index.html to prevent flash
 */
export const themeInitScript = `
(function() {
  try {
    // Detect system preference
    var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = systemPrefersDark ? 'dark' : 'light';
    
    // Apply theme immediately
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    
    // Set initial meta theme-color
    var metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    document.head.appendChild(metaThemeColor);
  } catch (e) {
    console.error('Theme initialization failed:', e);
  }
})();
`;

/**
 * CSS Variables injection (optional)
 * Can be used in global CSS file
 */
export const themeCSS = `
:root {
  --theme-transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Light theme */
.light {
  --color-background: 255 255 255;
  --color-foreground: 15 23 42;
  --color-primary: 37 99 235;
  --color-border: 226 232 240;
}

/* Dark theme */
.dark {
  --color-background: 15 23 42;
  --color-foreground: 241 245 249;
  --color-primary: 59 130 246;
  --color-border: 71 85 105;
}

/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;