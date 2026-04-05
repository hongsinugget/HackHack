// tailwindcss is not installed — this config is ready for when it is added.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    "var(--brand-primary)",
          dark:       "var(--brand-dark)",
          light:      "var(--brand-light)",
          hover:      "var(--brand-hover)",
          "tag-purple": "var(--brand-tag-purple)",
          "team-tag": "var(--brand-team-tag)",
        },
        "text-main":    "var(--text-main)",
        "text-subtle":  "var(--text-subtle)",
        "text-muted":   "var(--text-muted)",
        "text-light":   "var(--text-light)",
        "bg-main":      "var(--bg-main)",
        "bg-input":     "var(--bg-input)",
        "bg-surface":   "var(--bg-surface)",
        "border-subtle":"var(--border-subtle)",
        status: {
          ongoing:  "var(--status-ongoing-text)",
          upcoming: "var(--status-upcoming-text)",
          ended:    "var(--status-ended-text)",
        },
        prize: {
          gold:   "#fbbf24",
          indigo: "#4b0082",
        },
      },
      fontFamily: {
        base: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "9999px",
        xl:   "20px",
        lg:   "16px",
        md:   "12px",
        sm:   "8px",
        xs:   "6px",
        tag:  "2px",
      },
    },
  },
  plugins: [],
};

export default config;
