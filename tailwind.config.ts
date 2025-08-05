import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8b93f8',
          500: '#ff6b35', // Creative orange
          600: '#e55a2b',
          700: '#cc4e24', // Darker orange
          800: '#1e40af',
          900: '#1a1a1a', // Deep charcoal for headers
        },
        // Creative Agency Accent Colors
        accent: {
          cyan: '#00d4ff',
          purple: '#9d4edd',
          orange: '#ff6b35',
          yellow: '#ffd23f',
          pink: '#ff006e',
          green: '#06ffa5',
        },
        // Enhanced gray palette
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#1a1a1a',
        },
        // Creative specific colors
        creative: {
          orange: '#ff6b35',
          purple: '#9d4edd',
          blue: '#00d4ff',
          yellow: '#ffd23f',
          pink: '#ff006e',
          green: '#06ffa5',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1' }],
        heading: ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.2' }],
        body: ['clamp(1rem, 2vw, 1.125rem)', { lineHeight: '1.6' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.7s ease-out',
        'fade-in-down': 'fadeInDown 0.7s ease-out',
        'fade-in-left': 'fadeInLeft 0.7s ease-out',
        'fade-in-right': 'fadeInRight 0.7s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'reveal-text': 'revealText 0.8s ease-out',
        'stagger-fade': 'staggerFade 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' },
        },
        revealText: {
          '0%': { opacity: '0', transform: 'translateY(20px) rotateX(90deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0deg)' },
        },
        staggerFade: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      // Custom utilities for design system
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom plugin for design system utilities
    function({ addUtilities, theme }: { addUtilities: any; theme: any }) {
      const newUtilities = {
        // Glass morphism effect
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        // Gradient backgrounds
        '.bg-gradient-primary': {
          'background': 'linear-gradient(135deg, #3b82f6 0%, #1e293b 100%)',
        },
        '.bg-gradient-accent': {
          'background': 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        },
        '.bg-gradient-hero': {
          'background': 'linear-gradient(135deg, #0a0e1a 0%, #1e293b 50%, #3b82f6 100%)',
        },
        // Interactive states
        '.interactive': {
          'transition': 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
          'cursor': 'pointer',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
        },
        // Text effects
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-glow': {
          'text-shadow': '0 0 20px rgba(59, 130, 246, 0.5)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};

export default config;
