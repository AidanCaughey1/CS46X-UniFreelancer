import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  // -------------------- Node Backend --------------------
  {
    files: ["dummy-backend/**/*.js", "backend/**/*.js"],
    languageOptions: {
      sourceType: "script", // Node usually uses CommonJS
      globals: globals.node, // Node globals: process, __dirname, etc.
    },
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      // customize as needed
    },
  },

  // -------------------- Frontend React --------------------
  {
    files: ["frontend/**/*.js", "frontend/**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module", // for import/export
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser, // browser globals like window
    },
    plugins: { react: pluginReact },
    extends: ["plugin:react/recommended", "js/recommended"],
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/no-unescaped-entities": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // -------------------- Testing (Mocha) --------------------
  {
    files: ["testing/**/*.js", "testing/**/*.mjs"],
    env: { mocha: true, node: true },
    languageOptions: {
      globals: globals.node,
    },
    extends: ["js/recommended"],
    rules: {
      // you can customize rules for tests here
    },
  },
]);
