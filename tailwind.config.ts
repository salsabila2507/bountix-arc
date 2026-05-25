import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#050606",
          925: "#080a09",
          900: "#0b0f0d",
          850: "#111612",
          800: "#171d18",
          700: "#242b25",
        },
        acid: {
          300: "#dbff73",
          400: "#baff35",
          500: "#9af216",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        "acid-soft": "0 0 36px rgba(186, 255, 53, 0.16)",
        panel: "0 26px 80px rgba(0, 0, 0, 0.42)",
      },
    },
  },
  plugins: [],
};

export default config;
