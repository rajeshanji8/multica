// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    // Ignored globally — build artifacts, deps and generated test reports.
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Allow intentionally-unused identifiers when prefixed with `_`
    // (e.g. required-but-unused Express middleware args like `_req`/`_next`).
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
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
  {
    // Standalone tooling scripts run in Node.
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Playwright E2E tests + config run in Node.
    files: ['e2e/**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Keep ESLint out of Prettier's way (must be last).
  prettier,
);
