/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#139A4F', light: '#7ACB4B', dark: '#0E7A3E', coral: '#FF6B4A' },
        ink: '#1D211C',
        paper: '#F7F7F4',
      },
      fontFamily: { sans: ['Sora', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
