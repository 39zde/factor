import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join, resolve } from 'path';
import {
	readFileSync,
	writeFileSync,
	copyFileSync,
	readdirSync,
	mkdirSync,
} from 'fs';
import { env } from 'process';
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
			// nodeIntegration: false,
			defaultEncoding: 'UTF-8',
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
	let homeDir = resolve('$HOME');
	if (env['HOME'] !== undefined) {
		homeDir = resolve(env['HOME']);
	}
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
	let homeDir = resolve('$HOME');
	if (env['HOME'] !== undefined) {
		homeDir = resolve(env['HOME']);
	}
	writeFileSync(
		homeDir + '/.factor/settings.json',
		JSON.stringify(settings),
		'utf8'
	);
}

function initSettings() {
	let homeDir = resolve('$HOME');
	if (env['HOME'] !== undefined) {
		homeDir = resolve(env['HOME']);
	}
	const homeDirContents = readdirSync(homeDir, 'utf8');
	if (!homeDirContents.includes('.factor')) {
		mkdirSync(homeDir + '/.factor');
	}
	const factorContents = readdirSync(homeDir + '/.factor', 'utf8');
	if (!factorContents.includes('settings.json')) {
		copyFileSync(
			__dirname + '../../../resources/defaultSettings.json',
			homeDir + '/.factor/settings.json'
		);
	}
}
