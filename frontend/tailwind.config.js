/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        franken: {
          dark: '#0d1117', surface: '#131922', card: '#19212c', border: '#263241',
          glow: '#4bbf78', toxic: '#83d6a0', neon: '#a2e5b8', zap: '#a78bfa', pulse: '#8b7cf6',
          danger: '#f87171', warning: '#fbbf24',
        },
      },
      boxShadow: {
        'glow-emerald': '0 10px 30px -16px rgba(131, 214, 160, .65)',
        'glow-purple': '0 10px 30px -16px rgba(167, 139, 250, .55)',
        'glow-danger': '0 10px 30px -16px rgba(248, 113, 113, .45)',
      },
      fontFamily: { sans: ['DM Sans', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
