/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        brand: "#6ea8fe",
        brand2: "#a07bff",
        card: "#121831",
        bg: "#0b1020",
      },
      boxShadow: {
        card: "0 20px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04)",
      },
    },
  },
  plugins: [],
};
