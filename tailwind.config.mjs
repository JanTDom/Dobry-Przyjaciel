/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF9",
          100: "#FAF7F2",
          200: "#F5EFE6",
          300: "#EFE5D6",
          400: "#DFCBB3",
          500: "#C6AC90",
          600: "#9E8266",
          700: "#705842",
          800: "#4A3728",
          900: "#2A1D15",
          950: "#1A100B",
        },
        sun: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
        },
        warmth: {
          coral: "#F87171",
          peach: "#FB923C",
          honey: "#F59E0B",
          sage: "#34D399",
          sky: "#38BDF8",
        },
        sanctuary: {
          950: "#1A100B",
          900: "#2A1D15",
          800: "#4A3728",
          700: "#705842",
          600: "#9E8266",
          500: "#C6AC90",
          400: "#DFCBB3",
          300: "#EFE5D6",
          200: "#F5EFE6",
          100: "#FAF7F2",
          50: "#FFFDF9",
        },
        hearth: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "warm-sm": "0 2px 8px -1px rgba(74, 55, 40, 0.06)",
        "warm-md": "0 8px 24px -4px rgba(74, 55, 40, 0.08)",
        "warm-lg": "0 16px 40px -8px rgba(74, 55, 40, 0.12)",
        "sun-glow": "0 0 35px 5px rgba(245, 158, 11, 0.25)",
      }
    },
  },
  plugins: [],
};
