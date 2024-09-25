import { BaseDirectory, readFile, exists, create, writeFile } from '@tauri-apps/plugin-fs';
import { isPermissionGranted, sendNotification, requestPermission } from '@tauri-apps/plugin-notification';
import type { Options } from '@tauri-apps/plugin-notification';
// non-lib imports
import type {
	AppSettingsType,
	AppSettingsDatabaseDatabases,
	AppContextType,
	AppAction,
	AppSettingsAppearance,
	CustomerDBObjectStores,
	ArticleDBObjectStores,
	DocumentDBObjectStores,
} from '@type';

export const defaultSettings: AppSettingsType = {
	appearances: {
		colorTheme: 'light dark',
		rowHeight: 40,
		columnWidth: 120,
		sideBarWidth: 200,
		height: 1000,
		width: 1000,
	},
	database: {
		dbVersion: 1,
		databases: {
			customer_db: null,
			article_db: null,
			document_db: null,
		},
	},
	general: {
		decimalSeparator: '.',
		language: 'english',
		scrollSpeed: 2,
		notifications: true,
	},
};

export async function getSettings(): Promise<AppSettingsType> {
	try {
		let settings: AppSettingsType;
		if (window.__USE_TAURI__) {
			const settingsExist = await exists('settings.json', { baseDir: BaseDirectory.AppConfig });
			if (!settingsExist) {
				const settingsFile = await create('settings.json', { baseDir: BaseDirectory.AppConfig });
				await settingsFile.write(new TextEncoder().encode(JSON.stringify(defaultSettings)));
				await settingsFile.close();
				settings = defaultSettings;
			} else {
				const existingSettingsFile = await readFile('settings.json', { baseDir: BaseDirectory.AppConfig });
				settings = JSON.parse(new TextDecoder().decode(existingSettingsFile));
			}
		} else {
			let localSettings = localStorage.getItem('settings');
			if (localSettings === null) {
				localStorage.setItem('settings', JSON.stringify(defaultSettings));
				localSettings = JSON.stringify(defaultSettings);
			}
			settings = JSON.parse(localSettings);
		}
		return settings;
	} catch (e) {
		console.log('failed to read settings');
		console.error(e);
	}
	return defaultSettings;
}

export async function writeSettings(settings: AppSettingsType): Promise<boolean> {
	try {
		if (window.__USE_TAURI__) {
			await writeFile('settings.json', new TextEncoder().encode(JSON.stringify(settings)), { baseDir: BaseDirectory.AppConfig });
		}
		return true;
	} catch (e) {
		console.warn('failed to save settings', e);
		return false;
	}
}

export async function getDatabases(): Promise<AppSettingsDatabaseDatabases> {
	const databases: AppSettingsDatabaseDatabases = {
		article_db: null,
		customer_db: null,
		document_db: null,
	};
	try {
		const dbs = await window.indexedDB.databases();
		const requests: Promise<{
			dbName: string;
			db: IDBDatabase | string;
		}>[] = [];
		for (const item of dbs) {
			if (item.name !== undefined && item.version !== undefined) {
				if (item.name === 'customer_db' || item.name === 'article_db' || item.name === 'document_db') {
					requests.push(
						new Promise((resolve, reject) => {
							const request = indexedDB.open(item.name as string, item.version);
							request.onsuccess = () => {
								resolve({
									dbName: item.name as string,
									db: request.result,
								});
							};
							request.onerror = () => {
								reject(`error: failed to open ${item.name} database`);
							};
						})
					);
				}
			}
		}

		const result = await Promise.all(requests);
		for (const item of result) {
			if (typeof item.db !== 'string') {
				if (item.db.objectStoreNames.length !== 0) {
					databases[item.dbName as 'customer_db' | 'article_db' | 'document_db'] = Array.from(
						item.db.objectStoreNames
					) as CustomerDBObjectStores[] & ArticleDBObjectStores[] & DocumentDBObjectStores[];
				} else {
					databases[item.dbName as 'customer_db' | 'article_db' | 'document_db'] = null;
				}
			} else {
				databases[item.dbName as 'customer_db' | 'article_db' | 'document_db'] = null;
			}
		}
	} catch {
	} finally {
		return databases;
	}
}

export function disableMenu() {
	document.addEventListener(
		'contextmenu',
		(e) => {
			e.preventDefault();
			return false;
		},
		{ capture: true }
	);

	// document.addEventListener(
	// 	'selectstart',
	// 	(e) => {
	// 		e.preventDefault();
	// 		return false;
	// 	},
	// 	{ capture: true }
	// );
}

export function appReducer(appState: AppContextType, action: AppAction): AppContextType {
	switch (action.type) {
		case 'set': {
			if (action.change !== undefined) {
				if (action.change.appearances !== undefined) {
					const appearanceChanges = action.change.appearances as AppSettingsAppearance;
					if (appearanceChanges.colorTheme !== undefined) {
						const themeTag = document.getElementById('theme');
						if (themeTag !== null) {
							themeTag.innerText = `:root{ color-scheme: ${appearanceChanges.colorTheme} ; }`;
						}
					}
				}
				if (action.change.database !== undefined) {
					if (action.change.database.databases !== undefined) {
						for (const [key, val] of Object.entries(action.change.database.databases)) {
							if (val === null) {
								indexedDB.deleteDatabase(key);
							}
						}
					}
				}
				const stagedSettings: AppSettingsType = {
					appearances: {
						colorTheme:
							action.change?.appearances?.colorTheme !== undefined ? action.change.appearances.colorTheme : appState.appearances.colorTheme,
						columnWidth:
							action.change?.appearances?.columnWidth !== undefined ? action.change.appearances.columnWidth : appState.appearances.columnWidth,
						height: appState.appearances.height,
						rowHeight:
							action.change?.appearances?.rowHeight !== undefined ? action.change.appearances.rowHeight : appState.appearances.rowHeight,
						sideBarWidth:
							action.change?.appearances?.sideBarWidth !== undefined
								? action.change.appearances.sideBarWidth
								: appState.appearances.sideBarWidth,
						width: appState.appearances.width,
					},
					database: {
						dbVersion: action.change?.database?.dbVersion !== undefined ? action.change.database.dbVersion : appState.database.dbVersion,
						databases: {
							customer_db:
								action.change?.database?.databases?.customer_db !== undefined
									? action.change.database.databases.customer_db
									: appState.database.databases.customer_db,
							article_db:
								action.change?.database?.databases?.article_db !== undefined
									? action.change.database.databases.article_db
									: appState.database.databases.article_db,
							document_db:
								action.change?.database?.databases?.document_db !== undefined
									? action.change.database.databases.document_db
									: appState.database.databases.document_db,
						},
					},
					general: {
						decimalSeparator:
							action.change?.general?.decimalSeparator !== undefined
								? action.change.general.decimalSeparator
								: appState.general.decimalSeparator,
						language: action.change?.general?.language !== undefined ? action.change.general.language : appState.general.language,
						scrollSpeed: action.change?.general?.scrollSpeed !== undefined ? action.change.general.scrollSpeed : appState.general.scrollSpeed,
						notifications:
							action.change?.general?.notifications !== undefined ? action.change.general.notifications : appState.general.notifications,
					},
				};
				writeSettings(stagedSettings).then((result) => {
					if (!result) {
						notify({ title: 'An error occurred', body: 'settings could not be saved' }, appState);
					}
				});
				return {
					...appState,
					...stagedSettings,
				};
			} else {
				return appState;
			}
		}
		case 'setHW': {
			if (action.change !== undefined) {
				return {
					...appState,
					appearances: {
						colorTheme: appState.appearances.colorTheme,
						columnWidth: appState.appearances.columnWidth,
						height: action.change.appearances?.height !== undefined ? action.change.appearances.height : appState.appearances.height,
						rowHeight: appState.appearances.rowHeight,
						sideBarWidth: appState.appearances.sideBarWidth,
						width: action.change.appearances?.width !== undefined ? action.change.appearances.width : appState.appearances.width,
					},
				};
			} else {
				return appState;
			}
		}
		case 'notify': {
			if (action.notification !== undefined) {
				notify(action.notification, appState);
			}
			return appState;
		}
		default:
			notify(
				{
					title: 'An Error occurred',
					body: 'performed unknown action on app context',
				},
				appState
			);
			return appState;
	}
}

// defaultContext.constructor.prototype.notify = notify;
async function notify(options: Options, context: AppContextType): Promise<string> {
	try {
		if (window.__TAURI__) {
			const permissionGranted = await isPermissionGranted();
			if (!permissionGranted) {
				if (context.general.notifications) {
					await requestPermission();
				}
			}
			if (permissionGranted && context.general.notifications) {
				sendNotification({
					...options,
				});
				return 'success';
			} else {
				return 'disallowed';
			}
		} else {
			new Notification(options.title, { ...options });
			return 'success';
		}
	} catch (e) {
		console.error(e);
		return 'error';
	}
}
