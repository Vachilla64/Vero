/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F4F6F9",
        ink: "#2B3445",
        surface: "#FFFFFF",
        trust: {
          critical: "#FF4B4B",
          highRisk: "#FF9800",
          medium: "#FFC107",
          good: "#4CAF50",
          highTrust: "#00C853"
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
