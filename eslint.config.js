import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".wrangler/**", "**/*.config.js", "test/**"],
  },
  // Frontend (browser) source
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Real correctness checks (not style):
      "react/jsx-key": "error",
      "react/no-children-prop": "error",
      "react/no-direct-mutation-state": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      // Dev-only HMR hint; the provider+hook pattern is intentional here.
      "react-refresh/only-export-components": "off",
      // Auto-removable unused imports; unused vars are warnings (allow _ prefix).
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      // Pragmatic for an app of this size:
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
  // Worker (Cloudflare) source
  {
    files: ["worker/**/*.ts"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.worker },
    },
    plugins: { "unused-imports": unusedImports },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { vars: "all", varsIgnorePattern: "^_", args: "none", caughtErrors: "none" }],
      "@typescript-eslint/no-explicit-any": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  }
);
