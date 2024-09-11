import React, { useState, createContext, useMemo, useCallback, useEffect, useReducer, useContext } from 'react';
// non-lib imports
import { Pages } from './pages/Pages';
import Comps from '@comps';
import { getSettings, getDatabases, writeSettings, disableMenu } from '@util';
import type { AppSettingsAppearance, RouteType, AppContextType, AppSettingsChange, AppAction, AppSolidsType } from '@typings';
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
	appearances: {
		colorTheme: 'light dark',
		rowHeight: 38,
		columnWidth: 160,
		sideBarWidth: 170,
		height: 1000,
		width: 1000,
	},
	database: {
		dbVersion: 1,
		databases: {
			article_db: null,
			customer_db: null,
			document_db: null,
		},
	},
	general: {
		decimalSeparator: '.',
		language: 'english',
		scrollSpeed: 2,
	},
	worker: {
		ImportWorker: ImportWorker,
		TableWorker: TableWorker,
		ExportWorker: ExportWorker,
	},
};

function appReducer(appState: AppContextType, action: AppAction): AppContextType {
	switch (action.type) {
		case 'set': {
			if (action.change.appearances !== undefined) {
				const appearanceChanges = action.change.appearances as AppSettingsAppearance;
				if (appearanceChanges.colorTheme !== undefined) {
					const themeTag = document.getElementById('theme');
					if (themeTag !== null) {
						themeTag.innerText = `:root{ color-scheme: ${appearanceChanges.colorTheme} ; }`;
					}
				}
			}
			const stagedSettings = {
				appearances: {
					colorTheme:
						action.change?.appearances?.colorTheme !== undefined ? action.change.appearances.colorTheme : appState.appearances.colorTheme,
					columnWidth:
						action.change?.appearances?.columnWidth !== undefined ? action.change.appearances.columnWidth : appState.appearances.columnWidth,
					height: appState.appearances.height,
					rowHeight: action.change?.appearances?.rowHeight !== undefined ? action.change.appearances.rowHeight : appState.appearances.rowHeight,
					sideBarWidth:
						action.change?.appearances?.sideBarWidth !== undefined ? action.change.appearances.sideBarWidth : appState.appearances.sideBarWidth,
					width: appState.appearances.width,
				},
				database: {
					dbVersion: action.change?.database?.dbVersion !== undefined ? action.change.database.dbVersion : appState.database.dbVersion,
					databases: {
						customer_db:
							action.change?.database?.databases?.customer_db !== undefined
								? action.change.database.databases.customer_db
								: appState.database.databases.customer_db,
						article_db:
							action.change?.database?.databases?.article_db !== undefined
								? action.change.database.databases.article_db
								: appState.database.databases.article_db,
						document_db:
							action.change?.database?.databases?.document_db !== undefined
								? action.change.database.databases.document_db
								: appState.database.databases.document_db,
					},
				},
				general: {
					decimalSeparator:
						action.change?.general?.decimalSeparator !== undefined ? action.change.general.decimalSeparator : appState.general.decimalSeparator,
					language: action.change?.general?.language !== undefined ? action.change.general.language : appState.general.language,
					scrollSpeed: action.change?.general?.scrollSpeed !== undefined ? action.change.general.scrollSpeed : appState.general.scrollSpeed,
				},
			};
			writeSettings(stagedSettings).then((result) => {
				if (!result) {
					new Notification('An error occurred', {
						body: 'settings could not be saved',
					});
				}
			});
			return {
				appearances: {
					colorTheme:
						action.change?.appearances?.colorTheme !== undefined ? action.change.appearances.colorTheme : appState.appearances.colorTheme,
					columnWidth:
						action.change?.appearances?.columnWidth !== undefined ? action.change.appearances.columnWidth : appState.appearances.columnWidth,
					height: appState.appearances.height,
					rowHeight: action.change?.appearances?.rowHeight !== undefined ? action.change.appearances.rowHeight : appState.appearances.rowHeight,
					sideBarWidth:
						action.change?.appearances?.sideBarWidth !== undefined ? action.change.appearances.sideBarWidth : appState.appearances.sideBarWidth,
					width: appState.appearances.width,
				},
				database: {
					dbVersion: action.change?.database?.dbVersion !== undefined ? action.change.database.dbVersion : appState.database.dbVersion,
					databases: {
						customer_db:
							action.change?.database?.databases?.customer_db !== undefined
								? action.change.database.databases.customer_db
								: appState.database.databases.customer_db,
						article_db:
							action.change?.database?.databases?.article_db !== undefined
								? action.change.database.databases.article_db
								: appState.database.databases.article_db,
						document_db:
							action.change?.database?.databases?.document_db !== undefined
								? action.change.database.databases.document_db
								: appState.database.databases.document_db,
					},
				},
				general: {
					decimalSeparator:
						action.change?.general?.decimalSeparator !== undefined ? action.change.general.decimalSeparator : appState.general.decimalSeparator,
					language: action.change?.general?.language !== undefined ? action.change.general.language : appState.general.language,
					scrollSpeed: action.change?.general?.scrollSpeed !== undefined ? action.change.general.scrollSpeed : appState.general.scrollSpeed,
				},
				worker: {
					ImportWorker: appState.worker.ImportWorker,
					TableWorker: appState.worker.TableWorker,
					ExportWorker: appState.worker.ExportWorker,
				},
			};
		}
		case 'setHW': {
			return {
				appearances: {
					colorTheme: appState.appearances.colorTheme,
					columnWidth: appState.appearances.columnWidth,
					height: action.change.appearances?.height !== undefined ? action.change.appearances.height : appState.appearances.height,
					rowHeight: appState.appearances.rowHeight,
					sideBarWidth: appState.appearances.sideBarWidth,
					width: action.change.appearances?.width !== undefined ? action.change.appearances.width : appState.appearances.width,
				},
				database: {
					dbVersion: appState.database.dbVersion,
					databases: {
						customer_db: appState.database.databases.customer_db,
						article_db: appState.database.databases.article_db,
						document_db: appState.database.databases.document_db,
					},
				},
				general: {
					decimalSeparator: appState.general.decimalSeparator,
					language: appState.general.language,
					scrollSpeed: appState.general.scrollSpeed,
				},
				worker: {
					ImportWorker: appState.worker.ImportWorker,
					TableWorker: appState.worker.TableWorker,
					ExportWorker: appState.worker.ExportWorker,
				},
			};
		}

		default:
			new Notification('An Error occurred', {
				body: 'performed unknown action on app context',
			});
			return appState;
	}
}

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
