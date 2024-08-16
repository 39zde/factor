import React, { useContext, useMemo, useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import type { TableBodyDisplayProps } from '@util/types/types';
import type { Table as TableType } from 'dexie';

export function TableBodyDisplay({
	tableBodyRef,
	count,
	tableName,
	updateHook,
	uniqueKey,
	scope,
	start,
}: TableBodyDisplayProps): React.JSX.Element {
	const [dbTable, setDBTable] = useState<TableType<any, any, any>>();
	const { appearances, database } = useContext(AppContext);
	const [startNumber, setStartNumber] = useState<number>(0);
	const { clientHeight } = useContext(WindowContext);
	const [columns, setColumns] = useState<string[] | undefined>();
	useMemo(() => {
		async function getTable() {
			try {
				const open = await database.database.open();
				for (const table of open.tables) {
					if (table.name === tableName) {
						setDBTable(table);
						let example = await table.limit(1).toArray();
						setColumns(Object.keys(example[0]));
					}
				}
			} catch (e) {
				console.log(e);
			}
			return null;
		}
		getTable();
	}, []);

	const table = useLiveQuery(
		() => {
			// console.log(scope);
			// console.log(start,scope,clientHeight,dbTable,columns)
			if (updateHook !== undefined) {
				// is there an update signal to listen to?
				if (updateHook.update === true) {
					// if so, what to do when updating
					return []; // don't show any rows
				}
			}
			if (
				dbTable !== undefined &&
				columns !== undefined &&
				Number.isNaN(scope) === false
			) {
				return dbTable
					.where(columns[0])
					.aboveOrEqual(startNumber)
					.limit(scope)
					.toArray();
			} else {
				return [];
			}
		},
		[startNumber, scope, clientHeight, dbTable, columns, updateHook?.update],
		[]
	);
	//@ts-ignore
	const scrollHandler = (e: WheelEvent<HTMLTableSectionElement>): void => {
		if (e.shiftKey === true || count === undefined) {
			return;
		}
		if (e.deltaY > 0) {
			// scroll down
			if (start.current < count) {
				start.current = Math.max(
					Math.min(start.current + 2, count - scope + 2),
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
				dbTable !== undefined &&
				count !== undefined ? (
					<>
						<TableRows
							uniqueKey={uniqueKey}
							table={table}
							rowHeight={appearances.rowHeight}
							rowCount={count}
						/>
					</>
				) : (
					<></>
				)}
			</tbody>
		</>
	);
}
