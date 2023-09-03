module.exports = {
  prefix: "",
  safelist: [
    "bg-red-100",
    "bg-red-500",
    "bg-red-600",
    "hover:bg-red-500",
    "hover:bg-opacity-10",
    "hover:bg-green-500",
    "hover:bg-red-700",
    "bg-blue-700",
    "hover:bg-blue-800",
    "bg-indigo-100",
    "bg-indigo-600",
    "bg-indigo-500",
    "text-indigo-500",
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
      colors: {
        "gray-850": "rgb(24, 32, 47)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
