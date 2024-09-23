import React, { useState, createContext, useMemo, useCallback, useEffect, useReducer, useContext } from 'react';
import { requestPermission } from '@tauri-apps/plugin-notification';
// non-lib imports
import { Pages } from './pages/Pages';
import Comps from '@comps';
import { getSettings, getDatabases, appReducer, disableMenu, defaultSettings } from '@util';
import type { RouteType, AppContextType, AppSettingsChange, AppAction, AppSolidsType } from '@typings';
import './App.css';

disableMenu();

const ImportWorker = (() => {
	const work = new Worker(new URL('@worker/import.worker.ts', import.meta.url), {
		type: 'module',
	});
	return work;
})();

const ExportWorker = (() => {
	const work = new Worker(new URL('@worker/export.worker.ts', import.meta.url), {
		type: 'module',
	});
	return work;
})();

const TableWorker = (() => {
	const work = new Worker(new URL('@worker/table.worker.ts', import.meta.url), {
		type: 'module',
	});
	return work;
})();

export const solids: AppSolidsType = {
	icon: {
		size: {
			large: 28,
			regular: 22,
			small: 16,
			tiny: 12,
		},
		strokeWidth: {
			large: 2.5,
			regular: 2,
			small: 1.5,
			tiny: 3,
		},
	},
	contextMenu: {
		width: 225,
		normalItemHeight: 32,
	},
};

const defaultContext: AppContextType = {
	...defaultSettings,
	worker: {
		ImportWorker: ImportWorker,
		TableWorker: TableWorker,
		ExportWorker: ExportWorker,
	},
};

const AppContext = createContext<AppContextType>(defaultContext);
//@ts-expect-error reducer error
const ChangeContext = createContext<React.Dispatch<AppAction>>(appReducer);

export function useAppContext() {
	return useContext(AppContext);
}
export function useChangeContext() {
	return useContext(ChangeContext);
}

function App(): JSX.Element {
	const [route, setRoute] = useState<RouteType>('Home');
	const [showSettings, setShowSettings] = useState<boolean>(false);
	const [showHelp, setShowHelp] = useState<boolean>(false);
	const getHeight = useCallback(() => window.innerHeight, []);
	const getWidth = useCallback(() => window.innerWidth, []);
	const [appState, dispatch] = useReducer(appReducer, defaultContext);

	const resizeHandler = () => {
		const height = getHeight();
		const width = getWidth();
		const newValues: AppSettingsChange = {
			appearances: {
				width: width,
				height: height,
			},
		};
		dispatch({
			type: 'setHW',
			change: newValues,
		});
	};

	// init the app state async once on app start, therefore the empty deps array
	useEffect(() => {
		getSettings()
			.then((settings) => {
				dispatch({
					type: 'set',
					change: settings,
				});
				return getDatabases();
			})
			.then((databases) => {
				dispatch({
					type: 'set',
					change: {
						database: {
							databases: databases,
						},
					},
				});
			})
			.finally(() => {
				resizeHandler();
			});
		if (window.__USE_TAURI__) {
			requestPermission();
		}
	}, []);

	useMemo(() => {
		navigator.storage.persist();
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
			<AppContext.Provider value={appState}>
				<ChangeContext.Provider value={dispatch}>
					<link
						rel="stylesheet"
						href={new URL(`./util/theme/scrollbarColor-${appState.appearances.colorTheme.split(' ').join('')}.css`, import.meta.url).href}
						type="text/css"
					/>
					<div
						className="appWrapper"
						style={{
							paddingLeft: appState.appearances.sideBarWidth + 26,
						}}>
						<Comps.SideBar routesHook={routeHook} />
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
				</ChangeContext.Provider>
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
		case 'Templates':
			return <Pages.Templates />;
		default:
			return <Pages.Home />;
	}
}

export default App;
