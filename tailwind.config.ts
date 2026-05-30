import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinical: {
          teal: "#0F766E",
          sage: "#E7EFE7",
          warm: "#FFFDF8",
          canvas: "#F7F3EA",
          slate: "#172033",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "DM Serif Display", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        base: "10px",
        card: "16px",
        pill: "999px",
      },
      boxShadow: {
        clinical: "0 14px 40px rgba(15, 23, 42, 0.08)",
      },
      spacing: {
        touch: "44px",
      },
    },
  },
};

export default config;
