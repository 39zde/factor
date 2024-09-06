import type { TableRow } from '../../database/DataBaseData';

export interface TableContextType {
	/** indexedDB database name */
	dataBaseName: string;
	/** indexedDB oStore name */
	tableName: string;
	uniqueKey: string;
	/**
	 * how many rows are shown at once
	 */
	scope: number;
	/**
	 * how many rows there are in the table
	 */
	count: number;
	/**
	 * tracks if the mouse is currently down, to display the correct cursor
	 */
	isMouseDown: boolean;
	/**
	 *  unordered list of visible columns
	 *  uses localStorage to persist values between tables and restarts
	 * */
	columns: string[];
	/**
	 *  ordered list of all columns (properties of the object stored in an oStore) of a table (oStore of a database)
	 *  uses localStorage to persist values between tables and restarts
	 *  */
	allColumns: string[];
	cursor: 'initial' | 'col-resize';
	/**
	 * if the mouse is down tracks the x value, to use for resizing columns
	 */
	cursorX: number;
	/**
	 * disables userSelect while resizing the table
	 */
	userSelect: 'initial' | 'none';
	/**
	 * signal to display nothing, because some big update is happening. Prevents react from crashing form different amount of hook usage between rerenders
	 */
	update: boolean;
	/**
	 * index of the current active/visible Resize element
	 */
	activeBg: number | undefined;
	/**
	 * saved the index of the actively being resized element
	 */
	activeCol: number | undefined;
	columnWidths: number[];
	/**
	 * is set to the table body height
	 */
	resizeElemHeight: number;
	colsRef: React.RefObject<HTMLTableCellElement>[] | null;
	resizeStyles: ResizeStyle[];
	/**
	 * what rows are currently on display
	 */
	rows: TableRow[];
	dbVersion: number;
	start: number;
	accept: 'prev' | 'next';
	lastReceived: number;
	hasStarted: boolean;
	/**
	 * used for portal-ing the lower row arrow button to the table foot
	 */
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
