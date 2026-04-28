export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern:
        /bg-(red|blue|lime|purple|yellow|indigo|pink|teal)-(200|300|900)/,
      variants: ["dark", "dark/40"],
    },
    {
      pattern: /text-(red|blue|lime|purple|yellow|indigo|pink|teal)-(900|200)/,
      variants: ["dark"],
    },
    {
      pattern:
        /border-(red|blue|lime|purple|yellow|indigo|pink|teal)-(300|800)/,
      variants: ["dark"],
    },
    "dark:bg-red-900/40",
    "dark:bg-blue-900/40",
    "dark:bg-lime-900/40",
    "dark:bg-purple-900/40",
    "dark:bg-yellow-900/40",
    "dark:bg-indigo-900/40",
    "dark:bg-pink-900/40",
    "dark:bg-teal-900/40",
  ],
  plugins: [],
};
