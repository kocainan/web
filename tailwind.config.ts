import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-hero": "#0a0a0a",
        "bg-chat": "#111111",
        "bg-card": "#1a1a1a",
        "border-default": "#1f1f1f",
        "border-card": "#333333",
        "text-primary": "#ffffff",
        "text-muted": "#888888",
        accent: "#3b82f6",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
export default config;
