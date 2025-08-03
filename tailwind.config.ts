/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        typewriter: ['"Courier Prime"', "Courier", "monospace"],
        handwriting: ['"Homemade Apple"', "cursive"],
        caveat: ['"Caveat"', "cursive"],
      },
    },
  },
  plugins: [],
};
