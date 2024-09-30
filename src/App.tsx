import React, { useState, createContext, useMemo, useCallback, useEffect, useReducer, useContext } from 'react';
import { requestPermission } from '@tauri-apps/plugin-notification';
// non-lib imports
import { Pages } from './pages/Pages';
import Comps from '@comps';
import { getSettings, getDatabases, appReducer, disableMenu, defaultSettings } from '@util';
import type { RouteType, AppContextType, AppSettingsChange, AppAction, AppSolidsType } from '@type';
import './App.css';

disableMenu();

const ImportWorker = (() => {
	const work = new Worker(new URL('./worker/import.worker.ts', import.meta.url), {
		type: 'module',
		name: 'import.worker.ts',
	});
	return work;
})();

const ExportWorker = (() => {
	const work = new Worker(new URL('./worker/export.worker.ts', import.meta.url), {
		type: 'module',
		name: 'export.worker.ts',
	});
	return work;
})();

const TableWorker = (() => {
	const work = new Worker(new URL('./worker/table.worker.ts', import.meta.url), {
		type: 'module',
		name: 'table.worker.ts',
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
		} else {
			// preset local storage for demo
			localStorage.setItem('addresses-allColumns', 'row,type,street,zip,city,country,notes,hash');
			localStorage.setItem('addresses-columnWidths', '40,156,200,88.5,173.5,58,191,391');
			localStorage.setItem('addresses-columns', 'row,city,country,street,zip,notes,type');
			localStorage.setItem('banks-allColumns', 'row,name,bic,iban,notes,code');
			localStorage.setItem('banks-columnWidths', '40,164.5,124,295.5,373,326');
			localStorage.setItem('banks-columns', 'row,name,bankCode,bic,iban,notes');
			localStorage.setItem('company-allColumns', 'row,alias,name,notes,taxID,taxNumber,vatID');
			localStorage.setItem('company-columns', 'row,name,notes,taxID,taxNumber,vatID');
			localStorage.setItem(
				'customers-allColumns',
				'row,id,addresses,persons,banks,company,emails,phones,description,firstContact,latestContact,created,website,notes'
			);
			localStorage.setItem('customers-columnWidths', '40,96.5,179,184,282,281,368,150,149,202.5,160,160,290,117,252');
			localStorage.setItem('customers-columns', 'row,id,addresses,persons,banks,company,emails,phones,description,website,notes');
			localStorage.setItem('emails-allColumns', 'row,notes,type,email');
			localStorage.setItem('emails-columnWidths', '40,404.5,160,285.5');
			localStorage.setItem('emails-columns', 'row,type,email');
			localStorage.setItem('persons-allColumns', 'row,firstName,lastName,emails,phones,title,alias,notes');
			localStorage.setItem('persons-columnWidths', '40,59,95.5,147,246,198,104,426');
			localStorage.setItem('persons-columns', 'row,firstName,lastName,emails,phones,title,notes');
			localStorage.setItem('phones-allColumns', 'row,phone,type,notes');
			localStorage.setItem('phones-columnWidths', '40,160,111.5,199.5');
			localStorage.setItem('phones-columns', 'row,notes,type,phone');
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
						href={new URL(`./theme-${appState.appearances.colorTheme.split(' ').join('')}.css`, import.meta.url).href}
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
