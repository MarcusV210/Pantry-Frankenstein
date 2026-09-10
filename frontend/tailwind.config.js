/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        franken: {
          dark: '#0a0d14',
          surface: '#111827',
          card: '#162032',
          border: '#1f293d',
          glow: '#10b981',
          toxic: '#22c55e',
          neon: '#a3e635',
          zap: '#a855f7',
          pulse: '#8b5cf6',
          danger: '#ef4444',
          warning: '#f59e0b',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 20px -5px rgba(168, 85, 247, 0.4)',
        'glow-danger': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}


