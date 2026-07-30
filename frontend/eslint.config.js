import tsParser from '@typescript-eslint/parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const noPlainButton = require('./eslint-local-rules/no-plain-button.cjs');

export default [
  // Main config: TypeScript linting for src/
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      local: {
        rules: {
          'no-plain-button': noPlainButton,
        },
      },
    },
    rules: {
      'no-console': 'off',

      // Custom rule: prefer <Button> over plain <button>
      'local/no-plain-button': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/',
      'node_modules/',
      'test-results/',
      'playwright.config.ts',
      'playwright.e2e.config.ts',
      'e2e/',
      'vite.config.ts',
    ],
  },
];
