import type Dexie from 'dexie';
export interface AppContextType {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
		sideBarWidth: number;
	};
	database: {
		tables: string[];
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
	changeContext: (newVal: AppSettingsType) => void;
}

export interface AppSettingsType {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
		sideBarWidth: number;
	};
	database: {
		tables: string[];
		dbVersion: number;
	};
	general: {
		language: 'english' | 'deutsch';
		decimalSeparator: '.' | ',';
	};
}
