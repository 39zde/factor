import { copyFile } from 'fs/promises';

// relative to root
const devHtmlPath = './src/index.demo.html';
const devHtmlTargetPath = './index.html';

async function main() {
	try {
		await copyFile(devHtmlPath, devHtmlTargetPath);
	} catch (e) {
		console.error(e);
	}
}

main();
