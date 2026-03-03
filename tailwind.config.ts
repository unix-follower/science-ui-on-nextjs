/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}"],
  safelist: [/^tw-template\d+$/],
  theme: {
    extend: {},
  },
  plugins: [],
}
