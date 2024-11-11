import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginNoRelativeImport from 'eslint-plugin-no-relative-import-paths';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // pluginReact.configs.flat['jsx-runtime'],
  {
    plugins: {
      'no-relative-import-paths': pluginNoRelativeImport,
    },
    rules: {
      'no-relative-import-paths/no-relative-import-paths': 'error',
    },
  },
];
