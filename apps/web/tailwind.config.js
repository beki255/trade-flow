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
        corridor: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#1E293B',
          accent: '#10B981', // Emerald Green (TradeFlow primary)
          gold: '#F59E0B',   // Gold Amber (Ethiopian trade heritage)
          blue: '#3B82F6',   // Logistics Blue
          crimson: '#EF4444',// Alert Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
