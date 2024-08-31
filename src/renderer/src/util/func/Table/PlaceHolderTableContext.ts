import type { TableContextType } from '../../types/comps/Table/Table';
/** Starting Table context */
export const PlaceHolderTableContext: TableContextType = {
	dataBaseName: '',
	tableName: '',
	uniqueKey: '',
	scope: 0,
	count: 0,
	isMouseDown: false,
	columns: [],
	allColumns: [],
	cursor: 'initial',
	cursorX: 0,
	userSelect: 'initial',
	update: false,
	activeBg: undefined,
	activeCol: undefined,
	columnWidths: [],
	resizeElemHeight: 150,
	colsRef: null,
	resizeStyles: [],
	rows: [],
	start: 0,
	dbVersion: 1,
	accept: 'next',
	lastReceived: 0,
	hasStarted: false,
	footerRowFirstElementRef: null
};
