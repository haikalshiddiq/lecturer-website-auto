import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', '.astro/**', '.vercel/**', 'node_modules/**', 'apps/**', 'worker/**', 'output/**']
  },
  {
    files: ['*.mjs', 'scripts/*.mjs'],
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        document: 'readonly'
      }
    }
  },
  {
    files: ['public/sw.js'],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.serviceworker
    }
  },
  ...astro.configs['flat/recommended'],
  {
    files: ['src/**/*.astro'],
    languageOptions: {
      globals: globals.browser
    }
  }
];
