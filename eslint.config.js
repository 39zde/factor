import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import * as tsParser from '@typescript-eslint/parser';

// set ESLINT_USE_FLAT_CONFIG=true as as system environment variable

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	{
		name: 'project settings',
		files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
		ignores: [],
		plugins: {
			react,
		},
		rules: {},
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.web.json',
				tsconfigRootDir: import.meta.dirname,
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	}
);
