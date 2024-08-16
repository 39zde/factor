import React, { useState, createContext, useMemo } from 'react';
import SideBar from '@comps/SideBar/SideBar';
import { Pages } from './pages/Pages';
import { WindowContextProvider } from '@comps/WindowContext';
import type { RouteType } from './util/types/comps/SideBar/routes';
import type { AppContextType, AppSettingsType } from '@util/App';

import './App.css';

const ImportWorker = (() => {
	const work = new Worker(
		new URL('@util/worker/import.worker.ts', import.meta.url),
		{
			type: 'module',
		}
	);
	return work;
})();

const TableWorker = (() => {
	const work = new Worker(
		new URL('@util/worker/table.worker.ts', import.meta.url),
		{
			type: 'module',
		}
	);
	return work;
})();

const defaultContext: AppContextType = {
	appearances: {
		colorTheme: 'system',
		rowHeight: 38,
		columnWidth: 160,
		sideBarWidth: 170,
	},
	database: {
		dbVersion: 1,
		tables: [],
	},
	general: {
		decimalSeparator: ',',
		language: 'english',
		scrollSpeed: 2,
	},
	worker: {
		ImportWorker: ImportWorker,
		TableWorker: TableWorker,
	},
	changeContext: () => {
		console.log('change context default');
	},
};

export const AppContext = createContext<AppContextType>(defaultContext);

function App(): JSX.Element {
	const [route, setRoute] = useState<RouteType>('Home');
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [showHelp, setShowHelp] = useState<boolean>(false);
	const [contextValue, setContextValue] =
		useState<AppContextType>(defaultContext);

	const changeContextFunction = (newContext: AppSettingsType): void => {
		const contextObj: AppContextType = {
			appearances: {
				colorTheme: newContext.appearances.colorTheme,
				rowHeight: newContext.appearances.rowHeight,
				columnWidth: newContext.appearances.columnWidth,
				sideBarWidth: newContext.appearances.sideBarWidth,
			},
			database: {
				dbVersion: newContext.database.dbVersion,
				tables: newContext.database.tables,
			},
			general: {
				decimalSeparator: newContext.general.decimalSeparator,
				language: newContext.general.language,
				scrollSpeed: newContext.general.scrollSpeed,
			},
			worker: {
				ImportWorker: contextValue.worker.ImportWorker,
				TableWorker: contextValue.worker.TableWorker,
			},
			changeContext: changeContextFunction,
		};
		if (
			contextValue.appearances.colorTheme !==
			contextObj.appearances.colorTheme
		) {
			// @ts-expect-error typescript does not know about this html-tag
			document.getElementById('theme').innerText =
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
		navigator.storage.persist();
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
			},
			general: {
				...settingsFile.general,
			},
			worker: {
				ImportWorker: ImportWorker,
				TableWorker: TableWorker,
			},
			changeContext: changeContextFunction,
		};

		setContextValue(context);
		// @ts-expect-error typescript does not know about this html-tag
		document.getElementById('theme').innerText =
			`:root{ color-scheme: ${settingsFile.appearances.colorTheme} ; }`;
	}, []);

	const routeHook = {
		route: route,
		setRoute: (newRoute: RouteType): void => {
			setRoute(newRoute);
		},
		showSettings: showSettings,
		setShowSettings: (newVal: boolean): void => {
			setShowSettings(newVal);
		},
		showHelp: showHelp,
		setShowHelp: (newVal: boolean): void => {
			setShowHelp(newVal);
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
							{showHelp ? (
								<>
									<Pages.Help />
								</>
							) : (
								<></>
							)}
							{showSettings ? (
								<>
									<Pages.Settings />
								</>
							) : (
								<></>
							)}
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
