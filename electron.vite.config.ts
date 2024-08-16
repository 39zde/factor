import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
	},
	renderer: {
		// assetsInclude: ['src/renderer/src/util/worker/*.js'],
		worker: {
			format: 'es',
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.d.ts'],
			alias: {
				'@renderer': resolve('src/renderer/src'),
				'@util': resolve('src/renderer/src/util'),
				'@comps': resolve('src/renderer/src/comps'),
			},
		},
		plugins: [react()],
	},
});
