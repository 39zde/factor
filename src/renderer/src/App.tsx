import React, { useState, createContext, useMemo } from 'react';
import SideBar from '@comps/SideBar/SideBar';
import { Pages } from './pages/Pages';
import Dexie from 'dexie';
import { WindowContextProvider } from '@comps/WindowContext';
import type { RouteType } from './util/types/comps/SideBar/routes';
import type { AppContextType, AppSettingsType } from '@util/App';

import './App.css';

const db = new Dexie('factor_db', {
	autoOpen: true,
	cache: 'cloned',
	allowEmptyDB: true,
});
const ImportWorker = (() => {
	const work = new Worker(
		new URL('@util/worker/import.worker.ts', import.meta.url)
	);
	return work;
})();

const defaultContext: AppContextType = {
	appearances: {
		colorTheme: 'system',
		rowHeight: 38,
		sideBarWidth: 160,
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

export const AppContext = createContext<AppContextType>(defaultContext);

function App(): JSX.Element {
	const [route, setRoute] = useState<RouteType>('Home');

	const [contextValue, setContextValue] =
		useState<AppContextType>(defaultContext);

	const changeContextFunction = (newContext: AppSettingsType): void => {
		const contextObj: AppContextType = {
			appearances: {
				colorTheme: newContext.appearances.colorTheme,
				rowHeight: newContext.appearances.rowHeight,
				sideBarWidth: newContext.appearances.sideBarWidth,
			},
			database: {
				database: contextValue.database.database,
				dbVersion: newContext.database.dbVersion,
				tables: newContext.database.tables,
			},
			general: {
				decimalSeparator: newContext.general.decimalSeparator,
				language: newContext.general.language,
			},
			worker: {
				ImportWorker: contextValue.worker.ImportWorker,
			},
			changeContext: changeContextFunction,
		};
		if (
			contextValue.appearances.colorTheme !==
			contextObj.appearances.colorTheme
		) {
			//@ts-ignore
			document.getElementById('theme').innerHTML =
				`:root{ color-scheme: ${newContext.appearances.colorTheme} ; }`;
		}
		const result = window.electron.ipcRenderer.sendSync('settings', {
			type: 'writeSettings',
			data: newContext,
		});
		if (result !== 'success') {
			window.alert('settings not saved');
		}
		setContextValue(contextObj);
	};

	useMemo(() => {
		// console.log('readingSettings');
		// const locker = new LockManager();
		navigator.storage.persist();
		// window.electron.ipcRenderer.send("ping")
		const settingsFile: AppSettingsType =
			window.electron.ipcRenderer.sendSync('settings', {
				type: 'readSettings',
			});
		const context: AppContextType = {
			appearances: {
				...settingsFile.appearances,
			},
			database: {
				...settingsFile.database,
				database: db,
			},
			general: {
				...settingsFile.general,
			},
			worker: {
				ImportWorker: ImportWorker,
			},
			changeContext: changeContextFunction,
		};

		setContextValue(context);
		//@ts-ignore
		document.getElementById('theme').innerHTML =
			`:root{ color-scheme: ${settingsFile.appearances.colorTheme} ; }`;
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
					<div
						className="appWrapper"
						style={{
							paddingLeft: contextValue.appearances.sideBarWidth,
						}}>
						<SideBar routesHook={routeHook} />
						<div className="page">
							<Router route={route} />
						</div>
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
		case 'Articles':
			return <Pages.Articles />;
		case 'Deliveries':
			return <Pages.Deliveries />;
		case 'Invoices':
			return <Pages.Invoices />;
		case 'Quotes':
			return <Pages.Quotes />;
		case 'Returnees':
			return <Pages.Returnees />;
		case 'ExportPage':
			return <Pages.ExportPage />;
		default:
			return <Pages.Home />;
	}
}

export default App;
