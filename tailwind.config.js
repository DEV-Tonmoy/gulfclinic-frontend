/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Medical color palette
        clinic: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          600: '#0284c7', // Primary Blue
          700: '#0369a1', // Hover Blue
          900: '#0c4a6e', // Text Dark
        }
      }
    },
  },
  plugins: [],
}