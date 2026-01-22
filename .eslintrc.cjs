module.exports = {
  root: true,
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"],
      },
    },
  },
  env: { browser: true, es2021: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "airbnb",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "18.2" } },
  plugins: ["react", "react-refresh"],
  rules: {
    "global-require": 0,
    "react/prop-types": [0],
    "react/jsx-filename-extension": [0],
    "react/no-array-index-key": [0],
    "react/jsx-props-no-spreading": "off",
    "no-param-reassign": [0],
    "max-len": ["error", { code: 150 }],
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
  },
};
