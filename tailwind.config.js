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
        naver: {
          green: '#03C75A',
          hover: '#02b351',
          light: '#EBF9F1',
          dark: '#028A3E',
        }
      }
    },
  },
  plugins: [],
}
