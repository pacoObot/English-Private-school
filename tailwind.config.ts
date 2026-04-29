import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1e3a8a",
          deep: "#0f172a"
        },
        crimson: {
          DEFAULT: "#e11d48"
        }
      },
      boxShadow: {
        soft: "0 24px 80px -32px rgba(15, 23, 42, 0.28)",
        card: "0 16px 50px -30px rgba(15, 23, 42, 0.35)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem"
      }
    }
  },
  plugins: []
};

export default config;
