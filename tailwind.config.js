module.exports = {
  prefix: "",
  safelist: [
    "bg-red-100",
    "bg-red-500",
    "bg-red-600",
    "bg-green-100",
    "bg-green-500",
    "bg-green-600",
    "bg-blue-500",
    "bg-blue-700",
    "bg-indigo-100",
    "bg-indigo-500",
    "bg-indigo-600",
    "bg-orange-500",
    "hover:bg-red-500",
    "hover:bg-red-700",
    "hover:bg-green-500",
    "hover:bg-green-700",
    "hover:bg-blue-800",
    "hover:bg-opacity-10",
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
