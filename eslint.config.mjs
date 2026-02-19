import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  { ignores: ["packages/server/", "node_modules/", "dist/", "main.js"] },
  ...obsidianmd.configs.recommended,
  ...obsidianmd.configs.recommendedWithLocalesEn,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Image: "readonly",
        FileReader: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLSelectElement: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        ClipboardEvent: "readonly",
        Blob: "readonly",
        File: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        AbortController: "readonly",
        Headers: "readonly",
        Response: "readonly",
        Map: "readonly",
        Set: "readonly",
        Promise: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // Rules the bot doesn't check / false positives for Obsidian plugins
      "no-undef": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",

      // Rules the bot DOES check
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      "obsidianmd/ui/sentence-case": [
        "warn",
        {
          brands: ["Life Companion AI", "Syncthing", "DuckDuckGo", "Claude Code", "Brave Search", "Full Calendar", "OpenAI", "Gemini", "Groq", "Telegram", "Tiếng Việt"],
          acronyms: ["API", "OK", "ID", "BSA", "UI"],
        },
      ],
    },
  },
]);
