import React, { useContext, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import type { TableBodyDisplayProps } from '@util/types/types';
import { useTableContext } from './Table';

export function TableBodyDisplay({
	tableBodyRef,
}: TableBodyDisplayProps): React.JSX.Element {
	const tableState = useTableContext();
	const { appearances } = useContext(AppContext);
	const [startNumber, setStartNumber] = useState<number>(0);
	const { clientHeight } = useContext(WindowContext);
	const start = useRef<number>(0);
	const table = useLiveQuery(
		() => {
			// console.log(scope);
			// console.log(start,scope,clientHeight,dbTable,columns)
			// is there an update signal to listen to?
			if (tableState.update === true) {
				// if so, what to do when updating
				return []; // don't show any rows
			}

			if (
				Number.isNaN(tableState.scope) === false &&
				tableState.dbTable !== undefined
			) {
				return tableState.dbTable
					.where(tableState.columns[0])
					.aboveOrEqual(startNumber)
					.limit(tableState.scope)
					.toArray();
			} else {
				return [];
			}
		},
		[
			startNumber,
			tableState.scope,
			clientHeight,
			tableState.dbTable,
			tableState.columns,
			tableState.update,
		],
		[]
	);
	//@ts-ignore
	const scrollHandler = (e: WheelEvent<HTMLTableSectionElement>): void => {
		if (e.shiftKey === true || tableState.count === undefined) {
			return;
		}
		if (e.deltaY > 0) {
			// scroll down
			if (start.current < tableState.count) {
				start.current = Math.max(
					Math.min(
						start.current + 2,
						tableState.count - tableState.scope + 2
					),
					1
				);
			}
		} else if (e.deltaY < 0) {
			// scroll up
			start.current = start.current - 2;
		} else {
		}
		setStartNumber(start.current);
	};

	return (
		<>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				onWheel={scrollHandler}>
				{table !== undefined &&
				tableState.dbTable !== undefined &&
				tableState.count !== undefined ? (
					<>
						<TableRows
							uniqueKey={tableState.uniqueKey}
							table={table}
							rowHeight={appearances.rowHeight}
							rowCount={tableState.count}
						/>
					</>
				) : (
					<></>
				)}
			</tbody>
		</>
	);
}
