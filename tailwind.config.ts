import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary brand blue
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // Honey accent, used sparingly (the "bee" nod in the wordmark only)
        honey: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
