import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import type { TableBodyDisplayProps } from '@util/types/types';
import { useTableContext, useTableDispatch } from './Table';

export function TableBodyDisplay({
	tableBodyRef,
	causeRerender,
}: TableBodyDisplayProps): React.JSX.Element {
	const tableState = useTableContext();
	const dispatch = useTableDispatch();
	const { worker, database, general } = useContext(AppContext);
	const { clientHeight } = useContext(WindowContext);
	const lastOrdered = useRef<number>(-1);
	const start = useRef<number>(0);

	useEffect(() => {
		start.current = 0;
	}, [tableState.tableName]);

	function increase() {
		start.current = Math.max(
			Math.min(start.current + 1, tableState.count - tableState.scope - 1),
			1
		);

		if (!(start.current + tableState.scope > tableState.count)) {
			lastOrdered.current = start.current + tableState.scope;
			// console.log("ordering ", lastOrdered.current)
			worker.TableWorker.postMessage({
				type: 'stream',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				action: {
					type: 'next',
					pos: start.current + tableState.scope,
				},
			});
		}
	}

	function decrease() {
		start.current = Math.max(start.current - 1, 1);
		// console.log("ordering ", lastOrdered.current)
		lastOrdered.current = start.current - 1;
		worker.TableWorker.postMessage({
			type: 'stream',
			storeName: tableState.tableName,
			dbVersion: database.dbVersion,
			action: {
				type: 'prev',
				pos: start.current - 1,
			},
		});
	}

	//@ts-ignore
	const scrollHandler = (e: WheelEvent<HTMLTableSectionElement>): void => {
		// console.log("scroll")
		if (e.shiftKey === true || tableState.count === undefined) {
			return;
		}
		if (lastOrdered.current !== -1) {
			if (
				Math.abs(lastOrdered.current - tableState.lastReceived) >
				tableState.scope
			) {
				// console.log("lastOrdered: ", lastOrdered.current, " lastReceived: ", tableState.lastReceived )
				console.log('returning');
				return;
			}
		}

		if (e.deltaY > 0) {
			// scroll down
			dispatch({
				type: 'changeAccept',
				newVal: 'next',
			});

			for (let i = 0; i < general.scrollSpeed; i++) {
				if (i == tableState.scope) {
					break;
				}

				if (start.current <= tableState.count + 1) {
					increase();
				}
			}
		} else if (e.deltaY < 0) {
			// scroll up
			dispatch({
				type: 'changeAccept',
				newVal: 'prev',
			});

			for (let i = 0; i < general.scrollSpeed; i++) {
				if (start.current !== 1) {
					if (i == tableState.scope) {
						break;
					}
					decrease();
				}
			}
		}
	};

	return (
		<>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				onWheel={scrollHandler}>
				<tr
					spellCheck={causeRerender}
					style={{
						position: 'absolute',
						height: 0,
						width: 0,
						display: 'none',
						userSelect: 'none',
						margin: 0,
						zIndex: -10,
					}}></tr>
				<TableRows />
			</tbody>
		</>
	);
}
