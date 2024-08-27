// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import * as tsParser from '@typescript-eslint/parser';

// set ESLINT_USE_FLAT_CONFIG=true as as system environment variable

export default tseslint.config(
	tseslint.configs.eslintRecommended,
	tseslint.configs.base,
	...tseslint.configs.recommended,
	{
		name: 'project settings',
		files: [
			'src/renderer/src/env.d.ts',
			'src/renderer/src/**/*',
			'src/renderer/src/**/*.tsx',
			'src/preload/*.d.ts',
		],
		ignores: [
			'node_modules',
			'dist',
			'contributing.md',
			'roadmap.md',
			'./resources/*',
			'./out/renderer/assets/*.js',
			'./out/main/index.js',
			'dist/*',
			'pnpm-lock.yaml',
			'LICENSE.md',
			'tsconfig.json',
			'tsconfig.*.json',
			'.prettierrc.yaml',
			'.prettierignore',
			'.yarnrc.yaml',
			'.npmrc',
			'.gitignore',
			'.editorconfig',
			'README.md',
			'*.svg',
			'*.png',
			'*.yaml',
			'yarn.lock',
			'.yml',
			'*.ico',
			'./electron.vite.config.ts',
			'./eslint.config.js',
		],
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
				project: ['./tsconfig.web.json'],
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: 'latest',
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	}
);
