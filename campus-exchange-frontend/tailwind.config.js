/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF3E0",
        pine: "#6B8F71",
        mint: "#A8D5BA",
        clay: "#D8A47F",
      },
      borderRadius: {
        soft: "20px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
