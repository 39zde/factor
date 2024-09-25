import type { Dispatch } from 'react';
import type { DerefRow, TableDispatchAction, TableContextType } from '@type';

/**
 * calculate the scope from rowHeight and Table height
 * @dispatches resizeElemHeight
 * @invokes updateScope()
 */
export function updateSizing(
	dispatch: Dispatch<TableDispatchAction>,
	tableValues: {
		hasStarted: boolean;
		tableRows: DerefRow[];
		oldScope: number;
		tableName: string;
		dbVersion: number;
		dataBaseName: string;
		start: number;
	},
	body: HTMLDivElement,
	scrollBarHeight: number,
	rowHeight: number,
	worker: Worker
) {
	let cleanedScope = 0;
	const wrapperHeight = body.getBoundingClientRect().height;
	if (wrapperHeight !== undefined) {
		dispatch({
			type: 'set',
			name: 'resizeElemHeight',
			newVal: wrapperHeight,
		});
		const rowCount = Math.round(wrapperHeight - scrollBarHeight) / rowHeight;
		const newScope = parseInt(rowCount.toString().split('.')[0]);
		if (newScope > 2 && newScope < 10) {
			cleanedScope = parseInt(rowCount.toString().split('.')[0]) - 2;
		} else if (newScope >= 10 && newScope < 20) {
			cleanedScope = parseInt(rowCount.toString().split('.')[0]) - 3;
		} else if (newScope >= 20) {
			cleanedScope = parseInt(rowCount.toString().split('.')[0]) - 6;
		} else {
			cleanedScope = 2;
		}
	} else {
		cleanedScope = 0;
	}
	updateScope(
		dispatch,
		{
			dataBaseName: tableValues.dataBaseName,
			dbVersion: tableValues.dbVersion,
			hasStarted: tableValues.hasStarted,
			newScope: cleanedScope,
			oldScope: tableValues.oldScope,
			start: tableValues.start,
			tableName: tableValues.tableName,
			tableRows: tableValues.tableRows,
		},
		worker
	);
}

/**
 * set the scope, initialize Rows if they have not started yet, add rows, if the scope increased,	remove rows, if the scope decreased
 * @param { Dispatch<TableDispatchAction>} dispatch
 * @param {{hasStarted: boolean;tableRows: DerefRow[];oldScope: number;newScope: number;tableName: string; dbVersion: number;dataBaseName: string;start: number;}} tableValues
 * @param {Worker} worker
 * @use tableState.hasStarted, tableState.rows, tableState.scope, tableState.dbVersion, tableState.dataBaseName, tableState.start
 * @invokes causeRerender, TableWorker: startingRows, stream
 * @dispatches lastReceived, rows, scope
 */
export function updateScope(
	dispatch: Dispatch<TableDispatchAction>,
	tableValues: {
		hasStarted: boolean;
		tableRows: DerefRow[];
		oldScope: number;
		newScope: number;
		tableName: string;
		dbVersion: number;
		dataBaseName: string;
		start: number;
	},
	worker: Worker
) {
	dispatch({
		type: 'set',
		name: 'scope',
		newVal: tableValues.newScope,
	});

	if (tableValues.hasStarted) {
		// we already have started, so there is already a scope and rows we need to take into consideration

		// check by how much the 2 scopes differ
		const diff = Math.abs(tableValues.oldScope - tableValues.newScope);

		if (tableValues.newScope < tableValues.oldScope && tableValues.newScope !== 0) {
			// the new scope is smaller than the previous one
			// we need to take away rows

			// clone the current rows
			const rows = tableValues.tableRows;
			if (rows.length !== 0) {
				// take away items from the end until the row count matches the scope
				for (let i = tableValues.oldScope; i > tableValues.newScope; i--) {
					rows.splice(i, 1);
				}
				dispatch({
					type: 'set',
					name: 'rows',
					newVal: rows,
				});
				// now that we removed them out last received item needs to change too
				// the last received keeps track of what comes back from the worker
				// if the lastOrdered and lastReceived are too far apart
				// the scrollHandler in TableBodyDisplay will prevent form making new requests
				// thats why we need to change it here, to prevent a scroll blockage
				dispatch({
					type: 'set',
					name: 'lastReceived',
					// we set the lastReceived to the value of the key row of the last item in rows
					newVal: rows[rows.length - 1].row,
				});
			}
		} else if (tableValues.newScope > tableValues.oldScope) {
			// the new scope is larger than the previous one
			// we need add rows
			for (let i = 0; i < diff; i++) {
				// request those rows one after another
				// with the action type 'add'
				worker.postMessage({
					type: 'stream',
					storeName: tableValues.tableName,
					dbVersion: tableValues.dbVersion,
					dataBaseName: tableValues.dataBaseName,
					action: {
						type: 'add',
						pos: tableValues.start + tableValues.oldScope + i,
					},
				});
			}
		}
	} else {
		// we have not started yet
		// there are no rows, so we request them
		worker.postMessage({
			type: 'startingPackage',
			storeName: tableValues.tableName,
			dbVersion: tableValues.dbVersion,
			dataBaseName: tableValues.dataBaseName,
			scope: tableValues.newScope,
		});
	}
}

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
	footerRowFirstElementRef: null,
	nativeColumnNames: false,
};

export { tableReducer } from './tableReducer';
export { rx } from './regex';
export { createHash, getAddressHash, getHash } from './createHash';
