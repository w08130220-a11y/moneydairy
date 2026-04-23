import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Apple-style near-black as primary; headings go pure black
        brand: {
          50: "#f5f5f7",
          100: "#eaeaec",
          200: "#d2d2d7",
          300: "#a1a1a6",
          400: "#6e6e73",
          500: "#1d1d1f",   // primary CTA / text
          600: "#000000",   // hero headings
          700: "#1d1d1f",   // dark panels (rarely used)
          800: "#111113",
          900: "#0a0a0b",
        },
        // Apple Blue — "income / primary action / link" semantic
        accent: {
          DEFAULT: "#0071e3",
          hover: "#0077ed",
          soft: "#e8f1fc",
          deep: "#0058b0",
        },
        // Apple Tangerine — "expense / in-progress / deadline" semantic (warm, active)
        tangerine: {
          DEFAULT: "#ff6a3d",
          hover: "#ff8661",
          deep: "#d14a20",
          soft: "#fff0ea",
        },
        // Canvas neutrals
        cream: "#fbfbfd",     // page canvas (Apple's off-white)
        ceramic: "#f5f5f7",   // zone separator / row hover
        // Text ink scale (Apple grays)
        ink: {
          DEFAULT: "#1d1d1f",
          soft: "#6e6e73",
          mute: "#86868b",
        },
        // Functional (semantic) — kept very muted, Apple-flat
        success: {
          DEFAULT: "#03a75d",
          soft: "#e6f6ee",
        },
        danger: {
          DEFAULT: "#b5231c",
          soft: "#fbe9e7",
        },
        warn: {
          DEFAULT: "#8a6d3b",
          soft: "#faf3e3",
        },
      },
      borderRadius: {
        pill: "980px",   // Apple's "continuous" pill
        card: "18px",    // Apple product-card radius
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "var(--font-inter)",
          "Segoe UI",
          "PingFang TC",
          "Microsoft JhengHei",
          "Noto Sans TC",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightsb: "-0.022em",     // Apple signature tight headings
        tightbody: "-0.01em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.06)",
        "card-lg": "0 8px 24px -4px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06)",
        nav: "0 1px 0 0 rgba(0,0,0,0.06)",
        pop: "0 20px 40px -12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)",
      },
      fontSize: {
        hero: ["48px", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "700" }],
        display: ["34px", { lineHeight: "1.1", letterSpacing: "-0.022em", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
export default config;
