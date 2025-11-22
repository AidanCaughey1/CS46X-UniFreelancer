import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // Node files
  {
    files: ["backend/**/*.js", "dummy-backend/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      // Ignore unused arguments that start with _
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },

  // Frontend source files
  {
    files: ["frontend/src/**/*.{js,jsx}"],
    plugins: { js, react: pluginReact },
    extends: ["js/recommended", pluginReact.configs.flat.recommended],
    languageOptions: { globals: globals.browser, sourceType: "module" },
    settings: { react: { version: "detect" } },
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },

  // Frontend build files (ignore generated warnings)
  {
    files: ["frontend/build/**/*.js"],
    rules: {
      "no-prototype-builtins": "off",
      "no-unused-vars": "off",
      "no-cond-assign": "off",
      "no-undef": "off",
    },
  },

  // Test files
  {
    files: ["**/*.test.js"],
    languageOptions: { globals: { ...globals.node, describe: true, it: true, expect: true } },
  },
]);
