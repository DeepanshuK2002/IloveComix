import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF453A",
          hover: "#ff5e54",
          active: "#e0382e",
          foreground: "#ffffff",
          50: "#fff1f0",
          100: "#ffe1df",
          200: "#ffc8c4",
          300: "#ffa49d",
          400: "#ff7468",
          500: "#FF453A",
          600: "#eb2f24",
          700: "#c72016",
          800: "#a31d16",
          900: "#861e18",
          950: "#490a06",
        },
        brand: {
          DEFAULT: "#FF453A",
          hover: "#ff5e54",
        },
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        accent: {
          primary: "#FF453A",
          secondary: "var(--accent-secondary)",
          hover: "#ff5e54",
          brand: "#FF453A",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        cyan: {
          50: "#fff1f0",
          100: "#ffe1df",
          200: "#ffc8c4",
          300: "#DF301C",
          400: "#DF301C",
          500: "#c72016",
          600: "#a31d16",
        },
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dark: {
          "base-100": "#000000",
          "base-200": "#09090b",
          "base-300": "#121214",
          "base-content": "#ededed",
          primary: "#FF453A",
          "primary-content": "#ffffff",
          secondary: "#a1a1aa",
          accent: "#18181b",
          neutral: "#09090b",
          "neutral-content": "#a1a1aa",
          info: "#38bdf8",
          success: "#34d399",
          warning: "#fbbf24",
          error: "#f87171",
        },
        light: {
          "base-100": "#ffffff",
          "base-200": "#f8f9fa",
          "base-300": "#f1f3f5",
          "base-content": "#0f172a",
          primary: "#FF453A",
          "primary-content": "#ffffff",
          secondary: "#475569",
          accent: "#f1f3f5",
          neutral: "#f1f3f5",
          "neutral-content": "#475569",
          info: "#0284c7",
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
        },
      },
    ],
  },
};

export default config;
