import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable TypeScript unused vars errors (make them warnings)
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Allow require() imports
      "@typescript-eslint/no-require-imports": "off",
      
      // Allow unescaped entities in JSX (like apostrophes)
      "react/no-unescaped-entities": "off",
      
      // Turn off the router-dom error
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;