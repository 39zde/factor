import { app, core, dpi, event, image, menu, mocks, path, tray, webview, webviewWindow, window } from '@tauri-apps/api';

// pages

export type { HelpTexts, HelpItem } from './pages/Help/HelpTexts';

export type {
	ImportModuleProps,
	SorterProps,
	CustomerSorterInputGroup,
	CustomerSorterInputGroupUnderling,
	ColumnSetterProps,
} from './pages/Upload/Upload';

// database
export type { ArticleDBObjectStores, ArticleSortingMap } from './database/ArticleTypes';

export type { DocumentDBObjectStores, DocumentSortingMap } from './database/DocumentTypes';

export type {
	TableRow,
	DerefRow,
	CustomerKeys,
	CustomerReferences,
	BaseRow,
	UploadRow,
	TableRowCounter,
	DataBaseNames,
} from './database/DataBaseData';

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

// worker
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

export type {
	AddDataArgs,
	DateInput,
	ImportWorkerMessage,
	AlignVariables,
	RemoveCondition,
	RemoveVariables,
	ImportWorkerMessageResponse,
	RankDoneData,
	RankedDeletion,
	UpdateMessage,
} from './worker/import.worker';

export type { CompressionTypes, ExportWorkerRequest, ExportWorkerResponse, ExportFileStreamer } from './worker/export.worker';

// comps

export type { CheckBoxProps } from './comps/CheckBox/CheckBox';

export type { ContextMenuProps, MenuItem } from './comps/ContextMenu/ContextMenu';

export type { RouteType } from './comps/SideBar/routes';
export type { SideBarProps, RouterButtonProps, LowerButtonProps } from './comps/SideBar/SideBarProps';

export type { TableProps, TableDispatchAction, TableContextType, ResizeStyle, TableRowItemProps, ResizeElementProps } from './comps/Table/Table';

// globals

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
		__USE_TAURI__: boolean;
		navigator: {
			userAgentData: {
				mobile: boolean;
				platform: string;
			};
		};
	}
}
