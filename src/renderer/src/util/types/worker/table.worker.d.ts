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

export type TableWorkerRequestMessageType =
	| 'stream'
	| 'columns'
	| 'count'
	| 'startingRows';

export interface TableWorkerResponseMessage {
	type: TableWorkerResponseMessageType;
	data: TableRow | Array<TableRow> | number;
	index?: number;
	action?: TableWorkerRequestMessageActionType;
}

export type TableWorkerResponseMessageType =
	| TableWorkerRequestMessageType
	| 'error'
	| 'success';

export interface TableRow extends BaseRow {
	row: number;
}

export type BaseRow = {
	[key: string]: Array<number | string> | number | string | Date;
};
