import { Table as TableType } from 'dexie';

export type TableContextType = {
	tableName: string;
	uniqueKey: string;
	scope: number;
	setScope: (newVal: number) => void;
	count: number;
	setCount: (newVal: number) => void;
	isMouseDown: boolean;
	setIsMouseDown: (newVal: boolean) => void;
	columns: string[];
	setColumns: (newVal: string[]) => void;
	dbTable: TableType<any, any, any> | undefined;
	setDbTable: (newVal: TableType<any, any, any>) => void;
	cursor: 'initial' | 'col-resize';
	setCursor: (newVal: 'initial' | 'col-resize') => void;
	cursorX: number;
	setCursorX: (newVal: number) => void;
	userSelect: 'none' | 'initial';
	setUserSelect: (newVal: 'none' | 'initial') => void;
	update: boolean | undefined;
	setUpdate: (newVal: boolean) => void;
};
