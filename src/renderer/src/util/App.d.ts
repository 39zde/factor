import type Dexie from 'dexie';
export type AppContextType = {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
	};
	database: {
		tables: Array<string>;
		dbVersion: number;
		database: Dexie;
	};
	general: {
		language: 'english' | 'deutsch';
		decimalSeparator: '.' | ',';
	};
	worker: {
		ImportWorker: Worker;
	};
	changeContext: Function;
};

export type AppSettingsType = {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
	};
	database: {
		tables: Array<string>;
		dbVersion: number;
	};
	general: {
		language: 'english' | 'deutsch';
		decimalSeparator: '.' | ',';
	};
};
