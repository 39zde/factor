import { copyFile, mkdir } from 'fs/promises';

async function main() {
	// relative to root
	const outDir = './bundle-demo/assets/';
	const manifestPath = './resources/build-files/manifest.json';
	const iconsPath = './src-tauri/icons/';
	try {
		let actions = [];
		let action1 = copyFile(manifestPath, outDir + 'manifest.json');
		actions.push(action1);
		let action2 = mkdir(outDir + 'icons');
		actions.push(action2);
		let action3 = copyFile(iconsPath + '32x32.png', outDir + 'icons/32x32.png');
		actions.push(action3);
		let action4 = copyFile(iconsPath + '128x128.png', outDir + 'icons/128x128.png');
		actions.push(action4);
		let action5 = copyFile(iconsPath + '128x128@2x.png', outDir + 'icons/128x128@2x.png');
		actions.push(action5);
		await Promise.all(actions);
	} catch (e) {
		console.error(e);
	}
}

main();
