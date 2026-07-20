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
        surface: "#FFFFFF",
        ink: "#2B3445",
        slate: "#A0AAB2",
        hairline: "#EEF1F5",
        "risk-critical": "#FF4B4B",
        "risk-high": "#FF8A00",
        "risk-neutral": "#FFC300",
        "trust-good": "#00E676",
        "trust-high": "#00C853"
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'app': '0 30px 70px rgba(43,52,69,.14), 0 6px 16px rgba(43,52,69,.06)',
        'card': '0 20px 50px rgba(43,52,69,.06), 0 4px 12px rgba(43,52,69,.04)',
        'card-sm': '0 12px 30px rgba(43,52,69,.06)',
        'card-xs': '0 8px 20px rgba(43,52,69,.05)',
        'btn-green': '0 12px 28px rgba(0,200,83,.28)',
        'btn-amber': '0 12px 28px rgba(255,195,0,.3)',
        'btn-red': '0 12px 28px rgba(255,75,75,.3)'
      }
    },
  },
  plugins: [],
}
