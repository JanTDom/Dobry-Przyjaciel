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
          DEFAULT: "#F6F1EA",
          dark: "#EEE8DE",
          surface: "rgba(255, 253, 249, 0.78)",
        },
        ink: {
          DEFAULT: "#1C1916",
          muted: "#625B53",
          subtle: "#8C847B",
        },
        warm: {
          amber: "#C38B46",
          apricot: "#D9A181",
          sage: "#718077",
          dusk: "#536873",
        },
        night: {
          DEFAULT: "#111514",
          card: "#181D1B",
          surface: "rgba(32, 37, 34, 0.68)",
          text: "#F1ECE4",
          muted: "#B9B1A5",
        },
        cream: {
          50: "#FFFDF9",
          100: "#F6F1EA",
          200: "#EEE8DE",
          300: "#E4DCCE",
          400: "#D3C7B5",
          500: "#B8AA95",
          600: "#8C847B",
          700: "#625B53",
          800: "#3E3730",
          900: "#2A241F",
          950: "#1C1916",
        },
        sun: {
          50: "#FAF5ED",
          100: "#F5EBE0",
          200: "#EBD7C4",
          300: "#E0BE9D",
          400: "#D3A575",
          500: "#C38B46",
          600: "#AB7232",
          700: "#8F5923",
          800: "#744319",
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
