/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Light, professional palette used across the whole app
        bg: "#F7F7F4",
        surface: "#FFFFFF",
        ink: "#1C2321",
        muted: "#6B7570",
        border: "#E4E4DE",
        primary: {
          DEFAULT: "#1F6F5C",
          dark: "#17564A",
          light: "#E4F2EE",
        },
        accent: {
          DEFAULT: "#D98E4A",
          light: "#FBEEE0",
        },
        danger: {
          DEFAULT: "#C0442E",
          light: "#FBE9E5",
        },
        warn: {
          DEFAULT: "#B8860B",
          light: "#FBF1DD",
        },
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 33, 0.06), 0 4px 14px rgba(28, 35, 33, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
