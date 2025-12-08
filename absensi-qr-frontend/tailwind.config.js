/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1D4ED8', // Tailwind's blue-700
        'secondary': '#6B7280', // Tailwind's gray-500
      }
    },
  },
  plugins: [],
}