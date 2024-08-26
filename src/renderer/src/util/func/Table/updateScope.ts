import type { Dispatch } from 'react';
import type {
	TableContextType,
	TableDispatchAction,
} from '../../types/comps/Table/Table';
import { DerefRow } from '../../types/database/DataBaseData';

/**
 * set the scope, initialize Rows if they have not started yet, add rows, if the scope increased,	remove rows, if the scope decreased
 * @param {number} newScope
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
	triggerRerender: () => void,
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

		if (
			tableValues.newScope < tableValues.oldScope &&
			tableValues.newScope !== 0
		) {
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

			triggerRerender();
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
		// let dummyRows = new Array(newScope).fill({
		// 	row: '-',
		// 	value: 'loading...',
		// });
		// // and dispatch dummy rows for now
		// dispatch({
		// 	type: 'set',
		// 	name: 'rows',
		// 	newVal: dummyRows,
		// });
	}
}
