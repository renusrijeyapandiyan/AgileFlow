/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        brand: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,.04), 0 4px 16px -4px rgba(15,23,42,.08)',
        lift: '0 2px 4px rgba(15,23,42,.04), 0 12px 32px -8px rgba(14,165,233,.22)',
        glow: '0 8px 24px -6px rgba(14,165,233,.45)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)' }, '50%': { transform: 'translate3d(30px,-40px,0) scale(1.12)' } },
        shimmer: { '0%': { backgroundPosition: '0% 50%' }, '100%': { backgroundPosition: '200% 50%' } },
        pop: { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: { 'fade-up': 'fadeUp .35s ease-out both', pop: 'pop .18s ease-out both', float: 'float 14s ease-in-out infinite', 'float-slow': 'float 22s ease-in-out infinite reverse', shimmer: 'shimmer 6s linear infinite' },
    },
  },
  plugins: [],
};
