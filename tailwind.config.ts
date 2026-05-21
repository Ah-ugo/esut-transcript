/** @format */

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
        'esut-green': {
          DEFAULT: '#1a5c38',
          dark: '#113d25',
          light: '#2d7a50',
        },
        'esut-gold': {
          DEFAULT: '#c9a84c',
          light: '#d4ba70',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        gold: '0 4px 16px rgba(201, 168, 76, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
        card: '0 2px 8px rgba(26, 92, 56, 0.08), 0 0 0 1px rgba(26, 92, 56, 0.04)',
        'card-hover':
          '0 8px 24px rgba(26, 92, 56, 0.14), 0 0 0 1px rgba(26, 92, 56, 0.08)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
