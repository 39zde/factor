import type { Options } from '@tauri-apps/plugin-notification';
// import type { CustomerDBObjectStores, ArticleDBObjectStores, DocumentDBObjectStores } from './database/DataBaseData';
import type { CustomerDBObjectStores } from './database/CustomerTypes';
import type { ArticleDBObjectStores } from './database/ArticleTypes';
import type { DocumentDBObjectStores } from './database/DocumentTypes';

export interface AppContextType extends AppSettingsType, Object {
	worker: {
		/**
		 * stores and cleans uploaded data and assigns the date to various tables
		 */
		ImportWorker: Worker;
		/**
		 * streams data from IDB
		 */
		TableWorker: Worker;
		/** Export Worker: writes the data in a specified format to files */
		ExportWorker: Worker;
	};
}

export interface AppSettingsType {
	appearances: {
		colorTheme: ColorThemeSetting;
		rowHeight: number;
		columnWidth: number;
		sideBarWidth: number;
		/**
		 * the inner height of the window
		 */
		height: number;
		/**
		 * the inner width of the window
		 */
		width: number;
	};
	database: {
		/** what data bases are populated and with what oStores */
		databases: AppSettingsDatabaseDatabases;
		/** on what database version we are on. this applies to all all databases */
		dbVersion: number;
	};
	general: {
		language: LanguageSetting;
		decimalSeparator: DecimalSeparatorSetting;
		/**
		 * how many rows to change on on scroll event
		 */
		scrollSpeed: number;
		notifications: boolean;
	};
}
export type AppSettingsDatabaseDatabases = {
	customer_db: CustomerDBObjectStores[] | null;
	article_db: ArticleDBObjectStores[] | null;
	document_db: DocumentDBObjectStores[] | null;
};

export type AppSettingsAppearance = {
	colorTheme: ColorThemeSetting;
	rowHeight: number;
	columnWidth: number;
	sideBarWidth: number;
	/**
	 * the inner height of the window
	 */
	height: number;
	/**
	 * the inner width of the window
	 */
	width: number;
};
export type AppSettingsDatabase = {
	/** what data bases are populated and with what oStores */
	databases: AppSettingsDatabaseDatabases;
	/** on what database version we are on. this applies to all all databases */
	dbVersion: number;
};
export type AppSettingsGeneral = {
	language: LanguageSetting;
	decimalSeparator: DecimalSeparatorSetting;
	/**
	 * how many rows to change on on scroll event
	 */
	scrollSpeed: number;
	notifications: boolean;
};

export type AppSettingsChange = {
	[prop in keyof AppSettingsType]?: {
		[key in keyof AppSettingsType[prop]]?: AppSettingsType[prop][key];
	};
};

export type LanguageSetting = 'english' | 'deutsch';

export type DecimalSeparatorSetting = '.' | ',';

export type ColorThemeSetting = 'light' | 'dark' | 'light dark';

export type AppAction = {
	type: 'set' | 'setHW' | "notify";
	change?: AppSettingsChange;
	notification?: Options
};

/** Some value to be used all over, to be consistent with styling,sizing... , easy controllable */
export type AppSolidsType = {
	icon: {
		size: {
			large: number;
			regular: number;
			small: number;
			tiny: number;
		};
		strokeWidth: {
			large: number;
			regular: number;
			small: number;
			tiny: number;
		};
	};
	contextMenu: {
		width: number;
		normalItemHeight: number;
	};
};
