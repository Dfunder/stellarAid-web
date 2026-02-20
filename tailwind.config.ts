import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // Dark mode via class strategy — toggled by adding 'dark' to <html>
  darkMode: "class",

  theme: {
    // ─── Custom Breakpoints ───────────────────────────────────────────────────
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      // ─── StellarAid Brand Colors ─────────────────────────────────────────────
      colors: {
        // Primary – deep cosmic blue
        primary: {
          50: "#eef4ff",
          100: "#d9e7ff",
          200: "#bcd3ff",
          300: "#8eb5fe",
          400: "#598afc",
          500: "#3461f9", // main brand color
          600: "#1d3ef0",
          700: "#1730dd",
          800: "#1928b3",
          900: "#1a278d",
          950: "#141856",
        },
        // Secondary – warm stellar gold
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde58a",
          300: "#fcd14e",
          400: "#fbbb25", // main brand gold
          500: "#f59d0b",
          600: "#d97706",
          700: "#b45309",
          800: "#923f09",
          900: "#78340f",
          950: "#451a03",
        },
        // Accent – nebula violet
        accent: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6", // main accent
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Success – aurora green
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          300: "#6ee7b7",
          500: "#10b981",
          700: "#047857",
          900: "#064e3b",
        },
        // Warning – solar orange
        warning: {
          50: "#fff7ed",
          100: "#ffedd5",
          300: "#fdba74",
          500: "#f97316",
          700: "#c2410c",
          900: "#7c2d12",
        },
        // Danger – red dwarf
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          300: "#fca5a5",
          500: "#ef4444",
          700: "#b91c1c",
          900: "#7f1d1d",
        },
        // Neutral – deep space grays
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // CSS variable aliases for dark mode theming
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
      },

      // ─── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },

      // ─── Spacing Tokens ───────────────────────────────────────────────────────
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "128": "32rem",
        "144": "36rem",
      },

      // ─── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ─── Shadows ─────────────────────────────────────────────────────────────
      boxShadow: {
        "stellar-sm": "0 2px 8px -1px rgba(52, 97, 249, 0.12)",
        stellar: "0 4px 16px -2px rgba(52, 97, 249, 0.18)",
        "stellar-lg": "0 8px 32px -4px rgba(52, 97, 249, 0.22)",
        glow: "0 0 20px rgba(52, 97, 249, 0.4)",
        "glow-gold": "0 0 20px rgba(251, 187, 37, 0.4)",
      },

      // ─── Animations ───────────────────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },

      // ─── Gradient Backgrounds ─────────────────────────────────────────────────
      backgroundImage: {
        "stellar-gradient": "linear-gradient(135deg, #3461f9 0%, #8b5cf6 100%)",
        "stellar-gradient-gold":
          "linear-gradient(135deg, #f59d0b 0%, #ef4444 100%)",
        "stellar-gradient-dark":
          "linear-gradient(135deg, #141856 0%, #2e1065 100%)",
        "shimmer-gradient":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
      },
    },
  },

  plugins: [],
};

export default config;
