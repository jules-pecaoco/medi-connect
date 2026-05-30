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
      animation: {
        "fade-in": "fadeIn var(--motion-normal) var(--ease-out) both",
        "slide-up": "slideUp var(--motion-normal) var(--ease-out) both",
        "slide-in-right": "slideInRight var(--motion-normal) var(--ease-out) both",
        "scale-in": "scaleIn var(--motion-fast) var(--ease-spring) both",
        skeleton: "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
};

export default config;
