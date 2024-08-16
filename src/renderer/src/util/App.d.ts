export interface AppContextType {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
		columnWidth: number;
		sideBarWidth: number;
	};
	database: {
		tables: string[];
		dbVersion: number;
	};
	general: {
		language: 'english' | 'deutsch';
		decimalSeparator: '.' | ',';
		scrollSpeed: number;
	};
	worker: {
		// stores and cleans uploaded data and assigns the date to various tables
		ImportWorker: Worker;
		// streams data from IDB
		TableWorker: Worker;
	};
	changeContext: (newVal: AppSettingsType) => void;
}

export interface AppSettingsType {
	appearances: {
		colorTheme: 'light' | 'dark' | 'system';
		rowHeight: number;
		columnWidth: number;
		sideBarWidth: number;
	};
	database: {
		tables: string[];
		dbVersion: number;
	};
	general: {
		language: 'english' | 'deutsch';
		decimalSeparator: '.' | ',';
		scrollSpeed: number;
	};
}
