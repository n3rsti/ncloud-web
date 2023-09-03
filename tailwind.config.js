module.exports = {
  prefix: "",
  safelist: [
    "bg-red-100",
    "hover:bg-red-500",
    "hover:bg-opacity-10",
    "hover:bg-green-500",
  ],
  content: ["./node_modules/flowbite/**/*.js", "./src/**/*.{html,ts}"],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "1/10": "10%",
        "1/8": "12.5%",
        "1/7": "calc(100% / 7)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
