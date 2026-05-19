import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-card": "var(--bg-card)",
        "bg-elevated": "var(--bg-elevated)",
        border: "var(--border)",
        "border-muted": "var(--border-muted)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        green: "var(--green)",
        orange: "var(--orange)",
        red: "var(--red)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
