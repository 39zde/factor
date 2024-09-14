import { app, core, dpi, event, image, menu, mocks, path, tray, webview, webviewWindow, window } from '@tauri-apps/api';

export type { SideBarProps, RouterButtonProps, LowerButtonProps } from './comps/SideBar/SideBarProps';
export type { RouteType } from './comps/SideBar/routes';

export type { ImportModuleProps, SorterProps, CustomerSorterInputGroup, CustomerSorterInputGroupUnderling } from './pages/Upload/Upload';

export type {
	Customer,
	DerefCustomer,
	PersonType,
	EmailType,
	PhoneNumberType,
	AddressType,
	BankType,
	CompanyType,
	ContactType,
	CustomerDBObjectStores,
	CustomerSortingMap,
	CustomerSortingMapProps,
	DerefPersonType,
	CustomerBaseData,
	CustomersMap,
	PhoneMap,
	EmailMap,
	PreInsertCustomer,
	BaseCustomer,
} from './database/CustomerTypes';

export type { TableProps, TableDispatchAction, TableContextType, ResizeStyle, TableRowItemProps, ResizeElementProps } from './comps/Table/Table';

export type { HelpTexts, HelpItem } from './pages/Help/HelpTexts';

export type {
	TableWorkerRequestMessage,
	TableWorkerRequestMessageAction,
	TableWorkerRequestMessageActionType,
	TableWorkerRequestMessageType,
	TableWorkerResponseMessage,
	TableWorkerResponseMessageType,
	DoneHandler,
	StarterPackage,
	StarterPackageResponse,
} from './worker/table.worker';

export type { AddDataArgs, DateInput } from './worker/import.worker';

export type { TableRow, DerefRow, CustomerKeys, CustomerReferences, BaseRow, UploadRow, TableRowCounter, DataBaseNames } from './database/DataBaseData';

export type { ContextMenuProps, MenuItem } from './comps/ContextMenu/ContextMenu';

export type { ArticleDBObjectStores, ArticleSortingMap } from './database/ArticleTypes';

export type { DocumentDBObjectStores, DocumentSortingMap } from './database/DocumentTypes';

export type { CompressionTypes, ExportWorkerRequest, ExportWorkerResponse, ExportFileStreamer } from './worker/export.worker';

export type {
	AppContextType,
	AppSettingsType,
	AppSettingsChange,
	LanguageSetting,
	DecimalSeparatorSetting,
	ColorThemeSetting,
	AppAction,
	AppSolidsType,
	AppSettingsAppearance,
	AppSettingsDatabase,
	AppSettingsGeneral,
	AppSettingsDatabaseDatabases,
} from './App';

declare global {
	interface Window {
		__TAURI__: {
			app: typeof app;
			core: typeof core;
			dpi: typeof dpi;
			event: typeof event;
			image: typeof image;
			menu: typeof menu;
			mocks: typeof mocks;
			path: typeof path;
			tray: typeof tray;
			webview: typeof webview;
			webviewWindow: typeof webviewWindow;
			window: typeof window;
		};
		__FACTOR_VERSION__: string;
		navigator: {
			userAgentData: {
				mobile: boolean;
				platform: string;
			};
		};
	}
}
