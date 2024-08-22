export interface AppContextType extends AppSettingsType {
	worker: {
		/**
		 * stores and cleans uploaded data and assigns the date to various tables
		 */
		ImportWorker: Worker;
		//
		/**
		 * streams data from IDB
		 */
		TableWorker: Worker;
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
		x: number;
		y: number;
	};
	database: {
		/**
		 * what data bases are Populated
		 */
		tables: string[];
		/**
		 * on what database version we are on. this applies to all all databases
		 */
		dbVersion: number;
	};
	general: {
		language: LanguageSetting;
		decimalSeparator: DecimalSeparatorSetting;
		/**
		 * how many rows to change on on scroll event
		 */
		scrollSpeed: number;
	};
}

export type AppSettingsChange = {
	[prop in keyof AppSettingsType]?: {
		[key in keyof AppSettingsType[prop]]?: AppSettingsType[prop][key];
	};
};

export type LanguageSetting = 'english' | 'deutsch';

export type DecimalSeparatorSetting = '.' | ',';

export type ColorThemeSetting = 'light' | 'dark' | 'light dark';

export type AppAction = {
	type: 'set' | 'setHW';
	change: AppSettingsChange;
};
