/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const scrollbarPlugin = require("tailwind-scrollbar");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xxs: "375px",
      xs: "425px",

      ...defaultTheme.screens,
    },
    extend: {
      animation: {
        text: "text 5s ease infinite",
        "accordion-down": "accordion-down 0.15s linear",
        "accordion-up": "accordion-up 0.15s linear",
        "slide-in": "slide-in 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      boxShadow: {
        menu: "0 0 10px 0px rgba(144, 224, 239, 0.1)",
        light: "0 2px 10px 2px rgba(0, 0, 0, 0.1)",
        button: "0 0px 5px 0.5px rgba(0, 0, 0, 0.1)",
        glow: "0 0 20px rgba(144, 224, 239, 0.3)",
      },
      textColor: {
        "gray-500": "#6c757d",
      },
      fontWeight: {
        bold: "700",
      },
      padding: {
        nav: "5.3rem",
      },
      colors: {
        // Background colors - Dark theme
        primary: "#0a0e14",
        secondary: "#141921",
        "secondary-light": "#1f2937",
        tertiary: "#1a202c",
        tersier: "#0c0d10",

        // Brand color - Light blue (#90e0ef)
        brand: {
          50: "#f0fbfd",
          100: "#d9f5fb",
          200: "#baeef8",
          300: "#90e0ef", // Main brand color
          400: "#61d0e8",
          500: "#3bb5d4",
          600: "#2a96b6",
          700: "#247894",
          800: "#226379",
          900: "#225366",
          950: "#123546",
          DEFAULT: "#90e0ef",
        },

        // Action/accent color
        action: "#90e0ef",

        // Image placeholder
        image: "#1e2530",

        // Text colors
        txt: "#e2e8f0",
        "txt-muted": "#94a3b8",
        "txt-dim": "#64748b",

        // Status colors
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      display: ["Outfit", "Inter", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
      outfit: ["Outfit", "sans-serif"],
      inter: ["Inter", "sans-serif"],
    },
  },
  variants: {
    extend: {
      display: ["group-focus"],
      opacity: ["group-focus"],
      inset: ["group-focus"],
      backgroundImage: ["dark"],
    },
    textColor: ["responsive", "hover", "focus"],
    fontWeight: ["responsive", "hover", "focus"],
    scrollbar: ["rounded"],
  },
  plugins: [
    scrollbarPlugin({
      nocompatible: true,
    }),
    require("tailwind-scrollbar-hide"),
    require("@vidstack/react/tailwind.cjs")({
      prefix: "media",
    }),
    require("tailwindcss-animate"),
    customVariants,
  ],
};

function customVariants({ addVariant, matchVariant }) {
  matchVariant("parent-data", (value) => `.parent[data-${value}] > &`);
  addVariant("hocus", ["&:hover", "&:focus-visible"]);
  addVariant("group-hocus", [".group:hover &", ".group:focus-visible &"]);
}
