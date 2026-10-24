/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  // Tailwind class sorting — must stay last when adding more plugins
  plugins: ["prettier-plugin-tailwindcss"],

  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: "always",
  endOfLine: "lf",

  // The plugin cannot read the Sass entry (app/globals.scss).
  tailwindStylesheet: "./styles/prettier.css",
  tailwindFunctions: ["cn", "clsx"],
};

export default config;
