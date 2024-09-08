import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join, resolve } from 'path';
import { readFileSync, writeFileSync, copyFileSync, readdirSync, mkdirSync } from 'fs';
import { userInfo, homedir } from 'os';
import { env, platform } from 'process';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { AppSettingsType } from '../renderer/src/util/App';

function createWindow(): void {
	const settings = readSettings();
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		// load saved window position and size
		width: settings?.appearances.width ?? 1000,
		height: settings?.appearances.height ?? 1000,
		x: settings?.appearances.x ?? 100,
		y: settings?.appearances.y ?? 100,
		frame: true,
		show: false,
		alwaysOnTop: false,
		center: true,
		autoHideMenuBar: true,
		title: 'Factor',
		icon:
			process.platform === 'win32'
				? join(__dirname, '../../resources/icons/ico/solo_transparent.ico')
				: process.platform === 'linux'
					? join(__dirname, '../../resources/icons/linux/icon.png')
					: process.platform === 'android'
						? join(__dirname, '../../resources/icons/android/*')
						: '',
		// ...(process.platform === 'linux' ? { icon } : process.platform === "win32" ? {iconICO}: {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.mjs'),
			sandbox: false,
			nodeIntegrationInWorker: false,
			nodeIntegration: true,
			defaultEncoding: 'UTF-8',
			contextIsolation: false, // needed for export worker MessageChannel
		},
		// fullscreen: true,
		resizable: true,
		closable: true,
	});

	mainWindow.on('ready-to-show', () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		details.disposition = 'new-window';
		return { action: 'deny' };
	});

	// save Screen position and size on close
	mainWindow.on('close', () => {
		const settings = readSettings();
		if (settings !== null) {
			const { x, y, width, height } = mainWindow.getContentBounds();
			settings.appearances.x = x;
			settings.appearances.y = y;
			settings.appearances.width = width;
			settings.appearances.height = height;
			writeSettings(settings);
		}
	});

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
		mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
	}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// save system color theme
	// Set app user model id for windows
	electronApp.setAppUserModelId('de.39z.factor');

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// create default settings file and .factor directory, if not present
	initSettings();
	// IPC test
	ipcMain.on('ping', () => console.log('[index.ts] ', 'pong'));

	// save and read settings
	ipcMain.on('settings', (e, message) => {
		// console.log(message);
		switch (message.type) {
			case 'readSettings':
				const settings = readSettings();
				e.returnValue = settings;
				break;
			case 'writeSettings':
				writeSettings(message.data as AppSettingsType);
				e.returnValue = 'success';
				break;
			default:
				console.log('[index.ts] ', 'defaulted Settings');
		}
	});

	// In the main process, we receive the port.
	ipcMain.once('port', (event) => {
		// When we receive a MessagePort in the main process, it becomes a
		// MessagePortMain.
		console.log('test1');
		const port = event.ports[0];

		// MessagePortMain uses the Node.js-style events API, rather than the
		// web-style events API. So .on('message', ...) instead of .onmessage = ...
		port.on('message', (event) => {
			// data is { answer: 42 }
			const data = event.data;
			console.log(data);
			// const downloadsDir = getDownloadsFolder();
			// const activeExports = new Map();
			// 	switch (data.type) {
			// 		case 'init':
			// 			let fileName = downloadsDir + '/' + data.fileName;
			// 			let stream = new TextDecoderStream();
			// 			let writer = stream.writable.getWriter();
			// 			let reader = stream.readable.getReader();
			// 			let initObj : ExportFileStreamer = {
			// 				filePath: downloadsDir + '/' + data.fileName,
			// 				fileName: data.fileName,
			// 				stream: stream,
			// 				writer: writer,
			// 				reader: reader,
			// 				compression: data.compression
			// 			};
			// 			function readData(value:ReadableStreamReadResult<string>){
			// 				if(!value.done){
			// 					reader.read().then(readData)
			// 					console.log(value.value)
			// 				}
			// 			}
			// 			reader.read().then(readData)
			// 			activeExports.set(fileName, initObj);
			// 			break;
			// 		case 'stream':
			// 			let streamer = activeExports.get(data.fileName) as ExportFileStreamer
			// 			streamer.writer.ready.then(()=>streamer.writer.write(data.data))
			// 			break;
			// 		case 'finish':
			// 			break;
			// 		default:
			// 			break;
			// 	}
		});

		// MessagePortMain queues messages until the .start() method has been called.
		port.start();
	});

	// open urls in external Browser
	ipcMain.on('openURL', (_e, message: string) => {
		shell.openExternal(message);
	});

	createWindow();

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.setName('Factor');

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

function readSettings(): AppSettingsType | null {
	const homeDir = getHomeDir();
	const settingsFile = readFileSync(homeDir + '/.factor/settings.json', {
		encoding: 'utf8',
		flag: 'r',
	});
	const settings = JSON.parse(settingsFile);
	if (typeof settings === 'object') {
		return settings;
	}
	return null;
}

function writeSettings(settings: AppSettingsType) {
	const homeDir = getHomeDir();
	writeFileSync(homeDir + '/.factor/settings.json', JSON.stringify(settings), 'utf8');
}

function initSettings() {
	const homeDir = getHomeDir();

	const homeDirContents = readdirSync(homeDir, 'utf8');
	if (!homeDirContents.includes('.factor')) {
		mkdirSync(homeDir + '/.factor');
	}
	const factorContents = readdirSync(homeDir + '/.factor', 'utf8');
	if (!factorContents.includes('settings.json')) {
		copyFileSync(__dirname + '../../../resources/defaultSettings.json', homeDir + '/.factor/settings.json');
	}
}

function getHomeDir(): string {
	let homeDir = userInfo().homedir;
	if (homeDir === undefined) {
		let osHome = homedir();
		if (osHome === '') {
			if (env['HOME'] !== undefined) {
				homeDir = resolve(env['HOME']);
			} else if (env['HOMEPATH'] !== undefined) {
				homeDir = resolve(env['HOMEPATH']);
			} else {
				if (platform === 'win32') {
					homeDir = 'C:/Users/' + userInfo().username;
				} else if (platform === 'linux') {
					homeDir = '/home/' + userInfo().username;
				}
			}
		} else {
			homeDir = osHome;
		}
	}

	return resolve(homeDir);
}

function getDownloadsFolder(): string {
	const homeDir = getHomeDir();
	const homeDirFiles = readdirSync(homeDir);
	let downloadsDir = homeDir;
	if (homeDirFiles.includes('Downloads')) {
		downloadsDir += downloadsDir + '/Downloads';
	} else if (homeDirFiles.includes('downloads')) {
		downloadsDir += downloadsDir + '/downloads';
	}
	return resolve(downloadsDir);
}
