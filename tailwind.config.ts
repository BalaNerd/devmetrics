import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0a0707",
          surface: "#120909",
          card: "rgba(19, 11, 11, 0.6)",
        },
        burgundy: {
          DEFAULT: "#590907",
          hover: "#730e0b",
          light: "#8a1614",
          muted: "rgba(89, 9, 7, 0.25)",
          glow: "rgba(89, 9, 7, 0.45)",
        },
        beige: {
          DEFAULT: "#E8D2B5",
          muted: "rgba(232, 210, 181, 0.7)",
        },
        sage: {
          DEFAULT: "#A5A79B",
          muted: "rgba(165, 167, 155, 0.6)",
          border: "rgba(165, 167, 155, 0.15)",
        },
      },
    },
  },
  plugins: [],
};

export default config;

