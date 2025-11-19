/**
 * Design Tokens
 * Centralized design system values for consistent styling across the application
 * 
 * These tokens are used by both Tailwind config and component styles
 */

export const SPACING = {
  // 8px grid system
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
};

export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    loose: '2',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const COLORS = {
  brand: {
    pink: '#D946A6',
    purple: '#7C3AED',
    'rose-gold': '#E8B4B8',
  },
  primary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#D946A6',
    700: '#BE185D',
    800: '#9F1239',
    900: '#831843',
    950: '#500724',
  },
  neutral: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    'text-primary': '#111827',
    'text-secondary': '#6B7280',
    'text-muted': '#9CA3AF',
  },
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.375rem',   // 6px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  'glow-pink': '0 0 20px rgba(217, 70, 166, 0.5)',
  'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const CONTAINER = {
  maxWidth: '1280px',
  padding: {
    mobile: '1rem',      // 16px
    tablet: '1.5rem',    // 24px
    desktop: '2rem',     // 32px
  },
};

export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  'modal-backdrop': 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

export const TRANSITIONS = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
};

export const TOUCH_TARGETS = {
  minimum: '44px',  // iOS/Android minimum touch target
  comfortable: '48px',
  large: '56px',
};

// Export all tokens as a single object
export const DESIGN_TOKENS = {
  SPACING,
  TYPOGRAPHY,
  COLORS,
  BORDER_RADIUS,
  SHADOWS,
  BREAKPOINTS,
  CONTAINER,
  Z_INDEX,
  TRANSITIONS,
  TOUCH_TARGETS,
};

export default DESIGN_TOKENS;

