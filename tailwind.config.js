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
          DEFAULT: '#3a4b95',
          light: '#3a4b95d9',
          dark: '#2a3b75',
        },
        secondary: {
          DEFAULT: '#c4886a',
          light: '#d4a88a',
          dark: '#a4684a',
        },
      },
      fontFamily: {
        sans: ['"DIN Next LT Arabic"', 'Poppins', 'sans-serif'],
        en: ['Poppins', '"DIN Next LT Arabic"', 'sans-serif'],
        ar: ['"DIN Next LT Arabic"', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
