/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/custom-order/**/*.{js,ts,jsx,tsx,mdx}',
    './src/checkout/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/store/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LaraibCreative Design System
        'brand-pink': '#D946A6',
        'brand-purple': '#7C3AED',
        'brand-rose-gold': '#E8B4B8',
        
        'primary-gold': {
          DEFAULT: '#D4AF37',
          light: '#E8C84A',
          dark: '#B8941F',
        },
        'primary-rose': {
          DEFAULT: '#E8B4B8',
          light: '#F5D5D7',
          dark: '#D49599',
        },
        'secondary-champagne': '#F7E7CE',
        'accent-coral': '#FF7F7F',
        'accent-emerald': '#2DD4BF',
        'neutral-charcoal': '#36454F',
        'neutral-cream': '#FAF9F6',
        
        // Aliases for compatibility
        primary: {
          50: '#FEF9E7',
          100: '#FDF3CF',
          200: '#FBE79F',
          300: '#F9DB6F',
          400: '#E8C84A',
          500: '#D4AF37',
          600: '#B8941F',
          700: '#9C7A18',
          800: '#806011',
          900: '#64460A',
          DEFAULT: '#D4AF37',
        },
        neutral: {
          50: '#FAF9F6',
          100: '#F5F4F1',
          200: '#E5E4E1',
          300: '#D4D3D0',
          400: '#A3A2A0',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#36454F',
          900: '#1F2937',
          background: '#FFFFFF',
          surface: '#FAF9F6',
          border: '#E5E4E1',
        },
        semantic: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Playfair Display', 'ui-serif', 'Georgia', 'serif'],
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        heading: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        accent: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],      // 14px
        'base': ['1rem', { lineHeight: '1.5', letterSpacing: '0' }],              // 16px
        'lg': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],     // 18px
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.025em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],     // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.035em' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.04em' }],        // 48px
        '6xl': ['3.75rem', { lineHeight: '1.15', letterSpacing: '-0.045em' }],   // 60px
        'display-xl': ['4rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.2', fontWeight: '600' }],
        'display-md': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h1': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', fontWeight: '600' }],
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
        'loose': '2',
      },
      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      spacing: {
        // 8px grid system
        'xs': '0.25rem',    // 4px
        'sm': '0.5rem',     // 8px
        'md': '1rem',       // 16px
        'lg': '1.5rem',     // 24px
        'xl': '2rem',       // 32px
        '2xl': '3rem',      // 48px
        '3xl': '4rem',      // 64px
        '4xl': '6rem',      // 96px
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
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'elevated': '0 10px 40px rgba(0, 0, 0, 0.12)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-rose': '0 0 20px rgba(232, 180, 184, 0.5)',
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