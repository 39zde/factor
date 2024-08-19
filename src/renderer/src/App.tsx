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
		let settings: AppSettingsType = {
			appearances: {
				sideBarWidth: changed.appearances?.sideBarWidth ?? contextValue.appearances.sideBarWidth,
				rowHeight: changed.appearances?.rowHeight ?? contextValue.appearances.rowHeight,
				colorTheme: changed.appearances?.colorTheme ?? contextValue.appearances.colorTheme,
				columnWidth: changed.appearances?.columnWidth ?? contextValue.appearances.columnWidth,
				height: contextValue.appearances.height,
				width: contextValue.appearances.width,
				x: contextValue.appearances.x,
				y: contextValue.appearances.y
			},
			database: {
				dbVersion: changed.database?.dbVersion ?? contextValue.database.dbVersion,
				tables: changed.database?.tables ?? contextValue.database.tables
			},
			general: {
				decimalSeparator: changed.general?.decimalSeparator ?? contextValue.general.decimalSeparator,
				language: changed.general?.language ?? contextValue.general.language,
				scrollSpeed: changed.general?.scrollSpeed ?? contextValue.general.scrollSpeed
			},
		};

		const newContext = {
			...settings,
			worker: {
				ImportWorker: contextValue.worker.ImportWorker,
				TableWorker: contextValue.worker.TableWorker,
			},
			changeContext: changeContextFunction,
		};
		if (changed.appearances?.colorTheme !== undefined) {
			// @ts-expect-error typescript does not know about this html-tag
			document.getElementById('theme').innerText =
				`:root{ color-scheme: ${changed.appearances.colorTheme} ; }`;
		}
		let changedProps = Object.keys(changed);
		if (changedProps.length === 1 && changedProps.includes('appearances')) {
			let props = Object.keys(changed[changedProps[0]]);
			if (
				(props.includes('width') || props.includes('height')) &&
				(props.length === 1 || props.length === 2)
			) {
				// if the window resizes don't bother to save to file: return
				// we only save those values, when the window closes (see main/index.ts)
				// @ts-ignore
				setContextValue(newContext as AppContextType);
				return;
			}
		}

		const result = window.electron.ipcRenderer.sendSync('settings', {
			type: 'writeSettings',
			data: settings,
		});
		if (result !== 'success') {
			window.alert('settings not saved');
		}
		console.log(newContext);
		// @ts-ignore
		setContextValue(newContext as AppContextType);
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

		setContextValue(context);
		// @ts-expect-error typescript does not know about this html-tag
		document.getElementById('theme').innerText =
			`:root{ color-scheme: ${settingsFile.appearances.colorTheme} ; }`;
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
