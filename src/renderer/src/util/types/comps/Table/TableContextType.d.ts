import type { TableRow } from '../../database/DataBaseData';

export interface TableContextType {
	dataBaseName: string;
	tableName: string;
	uniqueKey: string;
	scope: number;
	count: number;
	isMouseDown: boolean;
	columns: string[];
	allColumns: string[];
	cursor: 'initial' | 'col-resize';
	cursorX: number;
	userSelect: 'initial' | 'none';
	update: boolean;
	activeBg: number | undefined;
	activeCol: number | undefined;
	columnWidths: number[];
	resizeElemHeight: number;
	colsRef: React.RefObject<HTMLTableCellElement>[] | null;
	resizeStyles: ResizeStyle[];
	rows: TableRow[];
	dbVersion: number;
	start: number;
	accept: 'prev' | 'next';
	lastReceived: number;
	hasStarted: boolean;
	footerRowFirstElementRef: React.RefObject<HTMLTableCellElement> | null;
}

export interface ResizeStyle {
	background: 'light-dark(var(--color-dark-3),var(--color-dark-3))' | 'none';
	cursor: 'col-resize' | 'initial';
}

export interface TableDispatchAction {
	type: TableDispatchActionType;
	index?: number;
	name?: 'set' extends TableDispatchAction['type'] ? keyof TableContextType : undefined;
	newVal: TableContextType[TableDispatchAction['name']];
	worker?: Worker;
}

export type TableDispatchActionType = 'set' | 'mouseDown' | 'mouseUp' | 'mouseMove' | 'mouseEnter' | 'mouseLeave' | 'changeAccept';
