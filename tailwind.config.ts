import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/pages/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132238",
        mist: "#f4f7fb",
        ocean: "#1d6cf2",
        mint: "#3ecf8e",
        coral: "#ff7c67",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(33, 59, 97, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
