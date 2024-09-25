import mkcert from 'vite-plugin-mkcert';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

interface PreRenderedChunk {
	exports: string[];
	facadeModuleId: string | null;
	isDynamicEntry: boolean;
	isEntry: boolean;
	isImplicitEntry: boolean;
	moduleIds: string[];
	name: string;
	type: 'chunk';
}

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), mkcert()],
	appType: 'spa',
	build: {
		reportCompressedSize: true,
		minify: 'esbuild',
		outDir: 'bundle-demo',
		rollupOptions: {
			cache: false,
			logLevel: 'warn',
			input: './index.html',
			output: {
				hashCharacters: 'base36',
				sanitizeFileName: false,
				banner:
					'/*\nThis is a demo build, made to be functional as a website. Not all features will be enabled.\nThe full version of the Tauri App can be found on this github page: https://github.com/39zde/factor\n- 39zde*/',
				footer:
					'/*\nThis is a demo build, made to be functional as a website. Not all features will be enabled.\nThe full version of the Tauri App can be found on this github page: https://github.com/39zde/factor\n- 39zde*/',
				name: 'Factor-Demo',
				chunkFileNames: '[name].js',
				assetFileNames: 'src/[name][extname]',
				entryFileNames: 'src/[name].js',
				intro: `window.__FACTOR_VERSION__= ${JSON.stringify(process.env.npm_package_version)}; window.__USE_TAURI__ = false;`,
				generatedCode: 'es2015',
				interop: 'auto',
				format: 'es',
			},
		},
	},
	worker: {
		format: 'es',
		rollupOptions: {
			output: {
				entryFileNames: 'src/[name].js',
			},
		},
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.d.ts'],
		alias: {
			'@type': resolve('./src/types/types.d.ts'),
			'@util': resolve('./src/util/util.ts'),
			'@comps': resolve('./src/comps/Comps.ts'),
			'@app': resolve('./src/App.tsx'),
			'@worker': resolve('./src/worker'),
			'@base': resolve('./src/base.css'),
		},
	},
	define: {
		__FACTOR_VERSION__: JSON.stringify(process.env.npm_package_version),
		__USE_TAURI__: false,
	},
	// to access the Tauri environment variables set by the CLI with information about the current target
	envPrefix: ['VITE_'],
});
