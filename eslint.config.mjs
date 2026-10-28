import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**", ".next/**"],
  },
  // Size limits from docs/agents/coding-conventions.md
  {
    rules: {
      "max-lines-per-function": [
        "warn",
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "warn",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
    },
  },
];

export default eslintConfig;
