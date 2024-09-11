// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import * as tsParser from '@typescript-eslint/parser';

// set ESLINT_USE_FLAT_CONFIG=true as as system environment variable

export default tseslint.config(tseslint.configs.eslintRecommended, tseslint.configs.base, ...tseslint.configs.recommended, {
	name: 'project settings',
	files: ['./src/vite.env.d.ts', './src/**/*.tsx', './src/*.d.ts', './src/**/*.ts'],
	plugins: {
		react,
	},
	languageOptions: {
		globals: {
			...globals.browser,
		},
		parser: tsParser,
		ecmaVersion: 'latest',
		sourceType: 'module',
		parserOptions: {
			project: ['./tsconfig.json'],
			tsconfigRootDir: import.meta.dirname,
			ecmaVersion: 'latest',
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
});
