export type { SideBarProps, RouterButtonProps, LowerButtonProps } from './comps/SideBar/SideBarProps';
export type { RouteType } from './comps/SideBar/routes';

export type { ImportModuleProps, SorterProps, UploadMode } from './pages/Upload/Upload';

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

export type { TableProps, TableDispatchAction, TableContextType, ResizeStyle } from './comps/Table/Table';

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

export type { TableRow, DerefRow, CustomerKeys, CustomerReferences, BaseRow, UploadRow } from './database/DataBaseData';

export type { ContextMenuProps, MenuItem } from './comps/ContextMenu/ContextMenu';

export type { ArticleDBObjectStores, ArticleSortingMap } from './database/ArticleTypes';

export type { DocumentDBObjectStores, DocumentSortingMap } from './database/DocumentTypes';

export type { CompressionTypes, ExportWorkerRequest, ExportWorkerResponse, ExportFileStreamer } from './worker/export.worker';
