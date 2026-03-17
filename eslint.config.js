// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const angularPlugin = require('@angular-eslint/eslint-plugin');
const angularTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { projectService: true, tsconfigRootDir: __dirname } },
    plugins: { '@typescript-eslint': tseslint, '@angular-eslint': angularPlugin },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: { parser: angularTemplateParser },
    plugins: { '@angular-eslint/template': angularTemplatePlugin },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules,
    },
  },
];
