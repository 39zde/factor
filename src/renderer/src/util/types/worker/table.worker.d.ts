import type { DerefRow, TableRow } from '../database/DataBaseData';

export interface TableWorkerRequestMessage {
	type: TableWorkerMessageType;
	dataBaseName: string;
	dbVersion: number;
	storeName: string;
	action?: TableWorkerRequestMessageAction;
	scope?: number;
}

export interface TableWorkerRequestMessageAction {
	type: TableWorkerRequestMessageActionType;
	pos: number;
}

export type TableWorkerRequestMessageActionType = 'add' | 'next' | 'prev';

export type TableWorkerRequestMessageType = 'stream' | 'columns' | 'count' | 'startingRows' | 'startingPackage';

export interface TableWorkerResponseMessage {
	type: TableWorkerResponseMessageType;
	data: TableRow | Array<TableRow | string> | number | StarterPackage;
	index?: number;
	action?: TableWorkerRequestMessageActionType;
}

export type TableWorkerResponseMessageType = TableWorkerRequestMessageType | 'error' | 'success';

export type DoneHandler = {
	data: DerefRow[];
	add: DerefRow;
};

export type StarterPackage = {
	startingCount: number | undefined;
	startingColumns: string[] | undefined;
	starterRows: DerefRow[] | undefined;
};

export type StarterPackageResponse = {
	startingCount: number;
	startingColumns: string[];
	starterRows: DerefRow[];
};
