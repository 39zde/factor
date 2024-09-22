import mkcert from 'vite-plugin-mkcert';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), mkcert()],
	appType: 'spa',
	build: {
		reportCompressedSize: true,
		minify: 'esbuild',
		outDir: 'bundle-prod',
		rollupOptions: {
			input: './index.html',
			output: {
				generatedCode: 'es2015',
				interop: 'auto',
				format: 'es',
				intro: `window.__FACTOR_VERSION__= ${JSON.stringify(process.env.npm_package_version)}; window.__USE_TAURI__ = true;`,
			},
			logLevel: 'silent',
		},
	},
	worker: {
		format: 'es',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.d.ts'],
		alias: {
			'@typings': resolve('./src/util/types/types.d.ts'),
			'@util': resolve('./src/util/util.ts'),
			'@comps': resolve('./src/comps/Comps.ts'),
			'@app': resolve('./src/App.tsx'),
			'@worker': resolve('./src/util/worker'),
		},
	},
	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 5173,
		strictPort: true,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},
	},
	define: {
		__FACTOR_VERSION__: JSON.stringify(process.env.npm_package_version),
		__USE_TAURI__: true,
	},
	// to access the Tauri environment variables set by the CLI with information about the current target
	envPrefix: [
		'VITE_',
		'TAURI_PLATFORM',
		'TAURI_ARCH',
		'TAURI_FAMILY',
		'TAURI_PLATFORM_VERSION',
		'TAURI_PLATFORM_TYPE',
		'TAURI_DEBUG',
		'__TAURI_METADATA__',
	],
});
