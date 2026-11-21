/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0D7F55', dark: '#09643F', light: '#7ACB4B', coral: '#FF6B4A' },
        ink: '#0E1B15',
        paper: '#F5F3EC',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Sora', 'Inter', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(14,27,21,.04), 0 10px 30px -14px rgba(14,27,21,.16)',
        glow: '0 8px 22px -8px rgba(13,127,85,.55)',
      },
    },
  },
  plugins: [],
};
