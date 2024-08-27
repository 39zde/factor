import { updateScope } from './updateScope';

import type { Dispatch } from 'react';
import type { TableDispatchAction } from '../../types/comps/Table/Table';
import { DerefRow } from '../../types/database/DataBaseData';

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
