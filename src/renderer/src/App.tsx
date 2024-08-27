import React, {
	useState,
	createContext,
	useMemo,
	useCallback,
	useEffect,
	useReducer,
	useContext,
} from 'react';
import SideBar from '@comps/SideBar/SideBar';
import { Pages } from './pages/Pages';
import type { RouteType } from './util/types/types';
import type {
	AppContextType,
	AppSettingsType,
	AppSettingsChange,
	AppAction,
	AppSolidsType,
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
		width: 200,
		normalItemHeight: 32
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
		x: 100,
		y: 100,
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
	},
};

function appReducer(
	appState: AppContextType,
	action: AppAction
): AppContextType {
	switch (action.type) {
		case 'set': {
			if (action.change.appearances?.colorTheme !== undefined) {
				const themeTag = document.getElementById('theme');
				if (themeTag !== null) {
					themeTag.innerText = `:root{ color-scheme: ${action.change.appearances?.colorTheme} ; }`;
				}
			}
			const result = window.electron.ipcRenderer.sendSync('settings', {
				type: 'writeSettings',
				data: {
					appearances: {
						colorTheme:
							action.change?.appearances?.colorTheme !== undefined
								? action.change.appearances.colorTheme
								: appState.appearances.colorTheme,
						columnWidth:
							action.change?.appearances?.columnWidth !== undefined
								? action.change.appearances.columnWidth
								: appState.appearances.columnWidth,
						height: appState.appearances.height,
						rowHeight:
							action.change?.appearances?.rowHeight !== undefined
								? action.change.appearances.rowHeight
								: appState.appearances.rowHeight,
						sideBarWidth:
							action.change?.appearances?.sideBarWidth !== undefined
								? action.change.appearances.sideBarWidth
								: appState.appearances.sideBarWidth,
						width: appState.appearances.width,
						x: appState.appearances.x,
						y: appState.appearances.y,
					},
					database: {
						dbVersion:
							action.change?.database?.dbVersion !== undefined
								? action.change.database.dbVersion
								: appState.database.dbVersion,
						databases: {
							customer_db:
								action.change?.database?.databases?.customer_db !==
								undefined
									? action.change.database.databases.customer_db
									: appState.database.databases.customer_db,
							article_db:
								action.change?.database?.databases?.article_db !==
								undefined
									? action.change.database.databases.article_db
									: appState.database.databases.article_db,
							document_db:
								action.change?.database?.databases?.document_db !==
								undefined
									? action.change.database.databases.document_db
									: appState.database.databases.document_db,
						},
					},
					general: {
						decimalSeparator:
							action.change?.general?.decimalSeparator !== undefined
								? action.change.general.decimalSeparator
								: appState.general.decimalSeparator,
						language:
							action.change?.general?.language !== undefined
								? action.change.general.language
								: appState.general.language,
						scrollSpeed:
							action.change?.general?.scrollSpeed !== undefined
								? action.change.general.scrollSpeed
								: appState.general.scrollSpeed,
					},
				},
			});
			if (result !== 'success') {
				window.alert('settings not saved');
			}
			return {
				appearances: {
					colorTheme:
						action.change?.appearances?.colorTheme !== undefined
							? action.change.appearances.colorTheme
							: appState.appearances.colorTheme,
					columnWidth:
						action.change?.appearances?.columnWidth !== undefined
							? action.change.appearances.columnWidth
							: appState.appearances.columnWidth,
					height: appState.appearances.height,
					rowHeight:
						action.change?.appearances?.rowHeight !== undefined
							? action.change.appearances.rowHeight
							: appState.appearances.rowHeight,
					sideBarWidth:
						action.change?.appearances?.sideBarWidth !== undefined
							? action.change.appearances.sideBarWidth
							: appState.appearances.sideBarWidth,
					width: appState.appearances.width,
					x: appState.appearances.x,
					y: appState.appearances.y,
				},
				database: {
					dbVersion:
						action.change?.database?.dbVersion !== undefined
							? action.change.database.dbVersion
							: appState.database.dbVersion,
					databases: {
						customer_db:
							action.change?.database?.databases?.customer_db !==
							undefined
								? action.change.database.databases.customer_db
								: appState.database.databases.customer_db,
						article_db:
							action.change?.database?.databases?.article_db !==
							undefined
								? action.change.database.databases.article_db
								: appState.database.databases.article_db,
						document_db:
							action.change?.database?.databases?.document_db !==
							undefined
								? action.change.database.databases.document_db
								: appState.database.databases.document_db,
					},
				},
				general: {
					decimalSeparator:
						action.change?.general?.decimalSeparator !== undefined
							? action.change.general.decimalSeparator
							: appState.general.decimalSeparator,
					language:
						action.change?.general?.language !== undefined
							? action.change.general.language
							: appState.general.language,
					scrollSpeed:
						action.change?.general?.scrollSpeed !== undefined
							? action.change.general.scrollSpeed
							: appState.general.scrollSpeed,
				},
				worker: {
					ImportWorker: appState.worker.ImportWorker,
					TableWorker: appState.worker.TableWorker,
				},
			};
		}
		case 'setHW': {
			return {
				appearances: {
					colorTheme: appState.appearances.colorTheme,
					columnWidth: appState.appearances.columnWidth,
					height:
						action.change.appearances?.height !== undefined
							? action.change.appearances.height
							: appState.appearances.height,
					rowHeight: appState.appearances.rowHeight,
					sideBarWidth: appState.appearances.sideBarWidth,
					width:
						action.change.appearances?.width !== undefined
							? action.change.appearances.width
							: appState.appearances.width,
					x: appState.appearances.x,
					y: appState.appearances.y,
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
				},
			};
		}

		default:
			console.log('app State error');
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
	const [appState, dispatch] = useReducer(
		appReducer,
		{ defaultContext, document, TableWorker, ImportWorker, window },
		(args): AppContextType => {
			const dataBasesPromise = args.window.indexedDB.databases();
			let out: AppContextType;
			const storedSettings: AppSettingsType | null =
				args.window.electron.ipcRenderer.sendSync('settings', {
					type: 'readSettings',
				});
			if (storedSettings !== null) {
				out = {
					...storedSettings,
					worker: {
						ImportWorker: args.ImportWorker,
						TableWorker: args.TableWorker,
					},
				};
				const themeTag = args.document.getElementById('theme');
				if (themeTag !== null) {
					themeTag.innerText = `:root{ color-scheme: ${storedSettings.appearances.colorTheme} ; }`;
				}
			} else {
				out = args.defaultContext;
			}

			dataBasesPromise
				.then((dbs) => {
					const requests: Promise<{
						dbName: string;
						db: IDBDatabase | string;
					}>[] = [];
					for (const item of dbs) {
						if (item.name !== undefined && item.version !== undefined) {
							if (
								item.name === 'customer_db' ||
								item.name === 'article_db'
							) {
								requests.push(
									new Promise((resolve, reject) => {
										const request = indexedDB.open(
											item.name as string,
											item.version
										);
										request.onsuccess = () => {
											resolve({
												dbName: item.name as string,
												db: request.result,
											});
										};
										request.onerror = () => {
											reject(
												`error: failed to open ${item.name} database`
											);
										};
									})
								);
							}
						}
					}
					return Promise.all(requests);
				})
				.then((result) => {
					for (const item of result) {
						if (typeof item.db !== 'string') {
							out.database.databases[item.dbName] = Array.from(
								item.db.objectStoreNames
							);
						} else {
							out.database.databases[item.dbName] = null;
						}
					}
				})
				.catch((error) => {
					console.log(error);
				});
			out.appearances.height = window.innerHeight;
			out.appearances.width = window.innerWidth;

			return out;
		}
	);

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
						href={
							new URL(
								`./util/theme/scrollbarColor-${appState.appearances.colorTheme.split(' ').join('')}.css`,
								import.meta.url
							).href
						}
						type="text/css"
					/>
					<div
						className="appWrapper"
						style={{
							paddingLeft: appState.appearances.sideBarWidth + 26,
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
