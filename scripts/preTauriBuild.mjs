import { copyFile } from 'fs/promises';

// relative to root
const devConfigPath = './src-tauri/conf/tauri.prod.conf.json';
const devConfigTargetPath = './src-tauri/tauri.conf.json';
const devHtmlPath = './src/index.prod.html';
const devHtmlTargetPath = './index.html';

async function main() {
	try {
		let promises = [copyFile(devConfigPath, devConfigTargetPath), copyFile(devHtmlPath, devHtmlTargetPath)];
		await Promise.all(promises);
	} catch (e) {
		console.error(e);
	}
}

main();
