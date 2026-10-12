/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedd',
          400: '#619ecb',
          500: '#3c82b5',
          600: '#2b6899',
          700: '#23537c',
          800: '#1e4364',
          900: '#0f2038', // Deep Navy Brand Color
          950: '#081220',
        },
        navy: {
          800: '#142238',
          900: '#0b1626',
          950: '#060d17',
        }
      },
    },
  },
  plugins: [],
}
