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
        sanctuary: {
          950: "#090706", // Deepest warm espresso
          900: "#130E0B", // Dark hearth
          850: "#1C1410", // Warm velvet
          800: "#261C16", // Roasted hazelnut
          700: "#3D2E25", // Cashmere border
          600: "#5A4437", // Warm muted text
          500: "#8C6D58", // Subtle sand
          400: "#B89B84", // Warm parchment
          300: "#D9C3B0", // Soft cream
          200: "#EDE1D4", // Gentle glow
          100: "#F7F3EE", // Crisp linen
          50: "#FAF7F2",  // Pure warm white
        },
        hearth: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B", // Golden amber
          600: "#D97706", // Warm flame
          700: "#B45309", // Glowing ember
          800: "#92400E",
          900: "#78350F",
        },
        rosewood: {
          500: "#E07A5F",
          600: "#C85A3F",
          700: "#9B3D28",
        },
        sage: {
          500: "#81B29A",
          600: "#60937A",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "breathe-slow": "breathe 8s ease-in-out infinite",
        "flame-pulse": "flameGlow 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float-gentle": "float 6s ease-in-out infinite",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        flameGlow: {
          "0%, 100%": { opacity: "0.7", filter: "blur(40px)" },
          "50%": { opacity: "0.95", filter: "blur(60px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hearth-glow": "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 45%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
