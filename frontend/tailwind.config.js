/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#D946A6',
          purple: '#7C3AED',
          'rose-gold': '#E8B4B8',
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-md': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.15)',
        'glow-pink': '0 0 20px rgba(217, 70, 166, 0.5)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #D946A6 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(to bottom right, #FDF2F8, #FAE8FF)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;