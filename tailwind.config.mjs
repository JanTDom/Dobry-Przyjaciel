/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0D13",
        surface: {
          50: "#1A1D27",
          100: "#141722",
          200: "#0F121C",
          300: "#0A0C14",
        },
        warm: {
          50: "#FDF8F3",
          100: "#F9EFE6",
          200: "#EED9C4",
          300: "#DEBA9A",
          400: "#CA9469",
          500: "#B27242",
          600: "#94542B",
        },
        amberGold: {
          400: "#F59E0B",
          500: "#D97706",
          600: "#B45309",
        },
        calmTeal: {
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
        indigoNight: {
          800: "#1E1B4B",
          900: "#0F172A",
          950: "#070B14",
        }
      }
    }
  },
  plugins: [],
};
