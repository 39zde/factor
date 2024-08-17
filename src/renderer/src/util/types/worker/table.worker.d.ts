export interface TableWorkerRequestMessage {
	type: TableWorkerMessageType;
	dataBaseName: string;
	dbVersion: number;
	storeName: string;
	action?: TableWorkerRequestMessageAction;
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
	data: Object;
	index?: number;
	action?: TableWorkerRequestMessageActionType;
}

export type TableWorkerResponseMessageType =
	| TableWorkerRequestMessageType
	| 'error'
	| 'success'
	| 'progress';
