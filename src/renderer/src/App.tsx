import React, {
	useState,
	createContext,
	useMemo,
	useCallback,
	useEffect,
} from 'react';
import SideBar from '@comps/SideBar/SideBar';
import { Pages } from './pages/Pages';
import type { RouteType } from './util/types/types';
import type {
	AppContextType,
	AppSettingsType,
	AppSettingsChange,
} from '@util/App';

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
		colorTheme: 'light dark',
		rowHeight: 38,
		columnWidth: 160,
		sideBarWidth: 170,
		height: 1000,
		width: 1000,
		x: 100,
		y: 100,
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
	const getHeight = useCallback(() => window.innerHeight, []);
	const getWidth = useCallback(() => window.innerWidth, []);
	const [contextValue, setContextValue] =
		useState<AppContextType>(defaultContext);

	const changeContextFunction = (changed: AppSettingsChange): void => {
		if (contextValue !== undefined) {
			let copy: AppSettingsType = {
				appearances: {
					...contextValue.appearances,
				},
				database: {
					...contextValue.database,
				},
				general: {
					...contextValue.general,
				},
			};

			for (const [key, value] of Object.entries(changed)) {
				for (const [nestedKey, nestedValue] of Object.entries(value)) {
					copy[key][nestedKey] = nestedValue;
					if (nestedKey === 'colorTheme') {
						// @ts-expect-error typescript does not know about this html-tag
						document.getElementById('theme').innerText =
							`:root{ color-scheme: ${nestedValue}} ; }`;
					}
				}
			}

			const result = window.electron.ipcRenderer.sendSync('settings', {
				type: 'writeSettings',
				data: copy,
			});
			if (result !== 'success') {
				window.alert('settings not saved');
			}

			let newContext = copy as AppContextType;
			newContext.worker = contextValue.worker;
			newContext.changeContext = changeContextFunction;

			if (changed.appearances !== undefined) {
				if (
					changed.appearances.width !== undefined ||
					changed.appearances.height !== undefined
				) {
					// if the window resizes don't bother to save to file: return
					// we only save those values, when the window closes (see main/index.ts)

					setContextValue(newContext);
					return;
				}
			}

			setContextValue(newContext);
		}
	};

	const resizeHandler = () => {
		let height = getHeight();
		let width = getWidth();
		const newValues: AppSettingsChange = {
			appearances: {
				width: width,
				height: height,
			},
		};
		changeContextFunction(newValues);
	};

	useMemo(() => {
		navigator.permissions
			.query({ name: 'persistent-storage' })
			.then((_res) => {
				// console.log('persistent Storage: ', res);
			});

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
		context.appearances.width = getWidth();
		context.appearances.height = getHeight();
		// @ts-expect-error typescript does not know about this html-tag
		document.getElementById('theme').innerText =
			`:root{ color-scheme: ${settingsFile.appearances.colorTheme} ; }`;
		setContextValue(context);

		window.indexedDB.databases().then((dbs) => {
			let tables: string[] = [];
			for (const item of dbs) {
				if (item.name !== undefined) {
					tables.push(item.name);
				}
			}
			changeContextFunction({ database: { tables: tables } });
		});
	}, []);

	useEffect(() => {
		window.addEventListener('resize', resizeHandler);
		return () => window.removeEventListener('resize', resizeHandler);
	}, [getHeight, getWidth]);

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
				<div
					className="appWrapper"
					style={{
						paddingLeft: contextValue.appearances.sideBarWidth + 24,
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
