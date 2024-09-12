import { BaseDirectory, readFile, exists, create, writeFile } from '@tauri-apps/plugin-fs';
import type { AppSettingsType, AppSettingsDatabaseDatabases } from '../types/App';
import type { CustomerDBObjectStores } from '../types/database/CustomerTypes';
import type { ArticleDBObjectStores } from '../types/database/ArticleTypes';
import type { DocumentDBObjectStores } from '../types/database/DocumentTypes';

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
		const settingsExist = await exists('settings.json', { baseDir: BaseDirectory.AppConfig });
		let settings: AppSettingsType;
		if (!settingsExist) {
			const settingsFile = await create('settings.json', { baseDir: BaseDirectory.AppConfig });
			await settingsFile.write(new TextEncoder().encode(JSON.stringify(defaultSettings)));
			await settingsFile.close();
			settings = defaultSettings;
		} else {
			const existingSettingsFile = await readFile('settings.json', { baseDir: BaseDirectory.AppConfig });
			settings = JSON.parse(new TextDecoder().decode(existingSettingsFile));
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
		await writeFile('settings.json', new TextEncoder().encode(JSON.stringify(settings)), { baseDir: BaseDirectory.AppConfig });
		return true;
	} catch (e) {
		console.warn('failed to save settings');
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
