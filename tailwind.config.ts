import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        torii: {
          50: "#fdf3f2",
          100: "#fbe4e2",
          200: "#f7ceca",
          300: "#f0aca4",
          400: "#e47e72",
          500: "#d35445",
          600: "#bc3d2e",
          700: "#9d3124",
          800: "#822c22",
          900: "#6d2922",
          950: "#3b120d",
        },
        kiniro: {
          50: "#faf8f2",
          100: "#f3ede0",
          200: "#e7d9be",
          300: "#d8c095",
          400: "#c8a56f",
          500: "#b98e51",
          600: "#a67742",
          700: "#865c36",
          800: "#6e4a30",
          900: "#5b3e2b",
        },
        sumi: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#1a1a1a",
          950: "#0e0e0e",
        },
        washi: {
          50: "#fdfcf9",
          100: "#faf7f2",
          200: "#f4eee3",
          300: "#ede2cf",
          400: "#e0d0b3",
          500: "#cfb993",
        },
        aiiro: {
          50: "#f2f5f9",
          100: "#e1e9f1",
          200: "#c7d7e6",
          300: "#9fbcd5",
          400: "#719bc0",
          500: "#4f7ea8",
          600: "#3d648b",
          700: "#325171",
          800: "#2d455e",
          900: "#1c2b3c",
          950: "#111b27",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-jp)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'sumi-sm': '0 2px 8px -2px rgba(14, 14, 14, 0.08), 0 1px 4px -1px rgba(14, 14, 14, 0.04)',
        'sumi-md': '0 8px 24px -4px rgba(14, 14, 14, 0.12), 0 4px 12px -2px rgba(14, 14, 14, 0.06)',
        'sumi-lg': '0 16px 40px -8px rgba(14, 14, 14, 0.18), 0 8px 20px -4px rgba(14, 14, 14, 0.10)',
        'glow-torii': '0 0 25px -5px rgba(211, 84, 69, 0.35)',
        'glow-gold': '0 0 25px -5px rgba(185, 142, 81, 0.35)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
