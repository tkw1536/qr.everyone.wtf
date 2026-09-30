// @ts-check

import js from '@eslint/js'
import react from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const files = ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx']

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '.yarn/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files,
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'max-classes-per-file': 'off',
      'no-restricted-globals': 'off',
      'no-use-before-define': 'off',
      'class-methods-use-this': 'off',
      'max-len': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react/jsx-key': 'error',
    },
  },
)
