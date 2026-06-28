/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#c9873a',
        dark: '#2c1a0e',
        bg: '#f5f0e8',
        'hero-bg': '#3b2009',
        border: '#ddd0b8',
        muted: '#8a7260'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
