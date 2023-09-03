module.exports = {
  prefix: "",
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
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("daisyui"),
    require("flowbite/plugin"),
  ],
};
