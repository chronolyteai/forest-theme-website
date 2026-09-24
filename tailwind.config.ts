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
        deepShadow: '#0a1f1a',
        midForest: '#1a3d2e',
        mossAccent: '#2d5a4a',
        sunGold: '#c9a961',
        warmAmber: '#ffb347',
        fireflyLime: '#d4ff7a',
        spiritCyan: '#7fffcf',
        fogWarm: '#e8dcc4',
        skyTop: '#4a7a6a',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
