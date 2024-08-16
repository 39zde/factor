import { Table as TableType } from 'dexie';

export type TableContextType = {
	tableName: string;
	uniqueKey: string;
	scope: number;
	count: number;
	isMouseDown: boolean;
	columns: string[];
	dbTable: TableType<any, any, any> | undefined;
	cursor: 'initial' | 'col-resize';
	cursorX: number;
	userSelect: 'initial' | 'none';
	update: boolean;
	activeBg: number | undefined;
	activeCol: number | undefined;
	columnWidths: number[];
	resizeElemHeight: number;
	colsRef: React.RefObject<HTMLTableCellElement>[] | any;
	resizeStyles: ResizeStyle[];
};

export type ResizeStyle = {
	background: 'light-dark(var(--color-dark-2),var(--color-light-2))' | 'none';
	cursor: 'col-resize' | 'initial';
};


export type TableDispatchAction = {
	type:
		| 'set'
		| 'mouseDown'
		| 'mouseUp'
		| 'mouseMove'
		| 'mouseEnter'
		| 'mouseLeave';
	index?: number;
	name?:
		| 'scope'
		| 'count'
		| 'cursorX'
		| 'isMouseDown'
		| 'columns'
		| 'dbTable'
		| 'cursor'
		| 'userSelect'
		| 'uniqueKey'
		| 'tableName'
		| 'update'
		| 'activeBg'
		| 'activeCol'
		| 'columnWidths'
		| 'tableHeight'
		| 'resizeElemHeight'
		| 'colRefs'
		| 'resizeStyles';
	newVal: any;
};