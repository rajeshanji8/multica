// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    // Ignored globally — build artifacts and deps.
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Backend runs in Node.
    files: ['backend/**/*.{ts,js}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Frontend runs in the browser.
    files: ['frontend/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  // Keep ESLint out of Prettier's way (must be last).
  prettier,
);
