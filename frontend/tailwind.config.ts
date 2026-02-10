import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: "#0b1f1f",
        accent: "#00b894",
      },
      boxShadow: {
        card: "0 15px 35px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
