import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#030d08',
          900: '#051912',
          800: '#0a2f20',
          700: '#0f4430',
          600: '#186348',
          500: '#268a65',
          400: '#3eb88a',
          300: '#6ee7b7',
        },
        moss: '#2d5a3f',
        canopy: '#0e241b',
        gold: {
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
          glow: '#ffdf85',
        },
        amber: {
          ray: '#ffb347',
          soft: '#f6a23a',
        },
        teal: {
          shadow: '#0d3238',
          mist: '#0b2a2e',
        },
        spore: '#a7f3d0',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
