/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        esut: {
          DEFAULT: "#721500",
          maroon: "#721500",
          "maroon-light": "#8f1a00",
          "maroon-dark": "#4a0e00",
          red: "#721500",
          "red-light": "#8f1a00",
          "red-dark": "#4a0e00",
          green: "#721500", // backward compatibility alias for esut-green
          "green-light": "#8f1a00",
          "green-dark": "#4a0e00",
          gold: "#c9a84c",
          "gold-light": "#e0c06a",
          "gold-dark": "#a88530",
        },
        "esut-red": {
          DEFAULT: "#721500",
          dark: "#4a0e00",
          light: "#8f1a00",
        },
        "esut-maroon": {
          DEFAULT: "#721500",
          dark: "#4a0e00",
          light: "#8f1a00",
        },
        "esut-green": {
          DEFAULT: "#721500",
          dark: "#4a0e00",
          light: "#8f1a00",
        },
        "esut-gold": {
          DEFAULT: "#c9a84c",
          light: "#d4ba70",
          dark: "#a88530",
        },
        surface: {
          DEFAULT: "#ffffff",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sora)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSlight 2s infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: 0, transform: "translateX(16px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        bounceSlight: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.08)",
        "glass-lg": "0 20px 60px rgba(0, 0, 0, 0.12)",
        card: "0 2px 8px rgba(114, 21, 0, 0.08), 0 0 0 1px rgba(114, 21, 0, 0.04)",
        "card-hover": "0 8px 24px rgba(114, 21, 0, 0.14), 0 0 0 1px rgba(114, 21, 0, 0.08)",
        gold: "0 4px 16px rgba(201, 168, 76, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
