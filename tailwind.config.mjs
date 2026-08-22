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
        paper: {
          DEFAULT: "#FCFAF6",
          dark: "#F4EEE2",
          surface: "rgba(255, 255, 255, 0.92)",
        },
        ink: {
          DEFAULT: "#1C1917",
          muted: "#57534E",
          subtle: "#78716C",
        },
        warm: {
          amber: "#D97706",
          gold: "#F59E0B",
          honey: "#FBBF24",
          apricot: "#FB923C",
          sage: "#5A6B5C",
          dusk: "#475569",
        },
        night: {
          DEFAULT: "#111514",
          card: "#181D1B",
          surface: "rgba(32, 37, 34, 0.68)",
          text: "#F1ECE4",
          muted: "#B9B1A5",
        },
        cream: {
          50: "#FFFEFA",
          100: "#FCFAF6",
          200: "#F5EFE4",
          300: "#ECE2D0",
          400: "#DFD1B8",
          500: "#C5B294",
          600: "#9E8B70",
          700: "#70604A",
          800: "#44392B",
          900: "#2B2319",
          950: "#1C1917",
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
          900: "#78350F",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Lora", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "quiet-sm": "0 1px 3px rgba(28, 25, 22, 0.03), 0 4px 12px rgba(28, 25, 22, 0.03)",
        "quiet-md": "0 4px 16px -2px rgba(28, 25, 22, 0.05), 0 12px 32px -4px rgba(28, 25, 22, 0.04)",
        "quiet-lg": "0 12px 32px -4px rgba(28, 25, 22, 0.08), 0 24px 64px -8px rgba(195, 139, 70, 0.08)",
        "presence-glow": "0 0 60px 10px rgba(195, 139, 70, 0.18)",
      },
      borderRadius: {
        "control": "12px",
        "card": "18px",
        "surface": "28px",
      }
    },
  },
  plugins: [],
};
