import React, { useState, createContext, useEffect } from 'react';
import SideBar from '@comps/SideBar/SideBar';
import { Pages } from './pages/Pages';
import Dexie from 'dexie';
import { WindowContextProvider } from '@comps/WindowContext';
import type { RouteType } from './util/types/routes';
import type { AppContextType, AppSettingsType } from '@util/App';

import './App.css';

const db = new Dexie('factor_db', {
	autoOpen: true,
	cache: 'cloned',
	allowEmptyDB: true,
});
const ImportWorker = new Worker(
	new URL('@util/worker/import.worker.ts', import.meta.url)
);

const defaultContext: AppContextType = {
	appearances: {
		colorTheme: 'system',
		rowHeight: 38,
	},
	database: {
		database: db,
		dbVersion: 1,
		tables: [],
	},
	general: {
		decimalSeparator: ',',
		language: 'english',
	},
	worker: {
		ImportWorker: ImportWorker,
	},
	changeContext: () => {},
};

const defaultSettingsJson = {
	appearances: {
		colorTheme: 'system',
		rowHeight: 38,
	},
	database: {
		dbVersion: 1,
		tables: [],
	},
	general: {
		decimalSeparator: ',',
		language: 'english',
	},
};

export const AppContext = createContext<AppContextType>(defaultContext);

function App(): JSX.Element {
	const [route, setRoute] = useState<RouteType>('Home');
	const [contextValue, setContextValue] = useState<AppContextType>({
		database: {
			database: db,
			dbVersion: 1,
			tables: [],
		},
		appearances: {
			colorTheme: 'system',
			rowHeight: 38,
		},
		general: {
			decimalSeparator: ',',
			language: 'english',
		},
		worker: {
			ImportWorker: ImportWorker,
		},
		changeContext: (newContext: AppContextType) => {
			const settingsFileObj: AppSettingsType = {
				appearances: {
					...newContext.appearances,
				},
				database: {
					dbVersion: newContext.database.dbVersion,
					tables: newContext.database.tables,
				},
				general: {
					...newContext.general,
				},
			};
			localStorage.setItem('settings', JSON.stringify(settingsFileObj));
			setContextValue(newContext);
		},
	});

	// init
	useEffect(() => {
		const initStorageMode = navigator.storage.persist();

		const storedSettings = localStorage.getItem('settings');
		const readSettings = async (): Promise<void> => {
			try {
				const locker = new LockManager();
				const tes = await locker.query();
				console.log(tes);
				const root = await navigator.storage.getDirectory();
				const draft = await root.getFileHandle('settings.json', {
					create: true,
				});
				const access = await draft.getFile();
				if (access.size === 0) {
					const writeable = await draft.createWritable({
						keepExistingData: true,
					});
					const blob = new Blob([JSON.stringify(defaultSettingsJson)], {
						type: 'text/json',
						endings: 'native',
					});
					await writeable.write(blob);
				} else {
					const data = await access.text();
					const parsed = JSON.parse(data);
					if (parsed !== undefined && parsed !== null) {
						console.log(parsed);
					}
				}
			} catch (e) {
				console.log(e);
			}
		};
		if (storedSettings !== null) {
			const settings: AppSettingsType = JSON.parse(storedSettings);
			setContextValue({
				general: {
					...settings.general,
				},
				database: {
					...settings.database,
					database: db,
				},
				appearances: {
					...settings.appearances,
				},
				worker: {
					ImportWorker: ImportWorker,
				},
				changeContext: (newContext: AppContextType) => {
					const settingsFileObj: AppSettingsType = {
						appearances: {
							...newContext.appearances,
						},
						database: {
							dbVersion: newContext.database.dbVersion,
							tables: newContext.database.tables,
						},
						general: {
							...newContext.general,
						},
					};
					localStorage.setItem(
						'settings',
						JSON.stringify(settingsFileObj)
					);
					setContextValue(newContext);
				},
			});
		} else {
			setContextValue({
				general: {
					decimalSeparator: ',',
					language: 'english',
				},
				database: {
					database: db,
					dbVersion: 1,
					tables: [],
				},
				appearances: {
					// colorTheme: window.Electron.nativeTheme.shouldUseDarkColors ? "dark" : "light",
					colorTheme: 'dark',
					rowHeight: 38,
				},
				worker: {
					ImportWorker: ImportWorker,
				},
				changeContext: (newContext: AppContextType) => {
					const settingsFileObj: AppSettingsType = {
						appearances: {
							...newContext.appearances,
						},
						database: {
							dbVersion: newContext.database.dbVersion,
							tables: newContext.database.tables,
						},
						general: {
							...newContext.general,
						},
					};
					localStorage.setItem(
						'settings',
						JSON.stringify(settingsFileObj)
					);
					setContextValue(newContext);
				},
			});
		}
		const setStorageMode = async (): Promise<void> => {
			await initStorageMode;
		};
		setStorageMode();
		readSettings();
		// console.log(window.electron.process)
	}, []);

	const routeHook = {
		route: route,
		setRoute: (newRoute: RouteType): void => {
			setRoute(newRoute);
		},
	};

	return (
		<>
			<AppContext.Provider value={contextValue}>
				<WindowContextProvider>
					<div className="appWrapper">
						<SideBar routesHook={routeHook} />
						<Router route={route} />
					</div>
				</WindowContextProvider>
			</AppContext.Provider>
		</>
	);
}

function Router({ route }: { route: RouteType }): React.JSX.Element {
	switch (route) {
		case 'Home':
			return <Pages.Home />;
		case 'Settings':
			return <Pages.Settings />;
		case 'Upload':
			return <Pages.Upload />;
		case 'Customers':
			return <Pages.Customers />;

		default:
			return <Pages.Home />;
	}
}

export default App;
