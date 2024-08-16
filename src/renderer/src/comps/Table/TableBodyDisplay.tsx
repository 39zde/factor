import React, { useContext, useRef, useState } from 'react';

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
	const { worker, database } = useContext(AppContext);
	const [startNumber, setStartNumber] = useState<number>(0);
	const { clientHeight } = useContext(WindowContext);
	const lastOrdered = useRef<number>(-1)
	const start = useRef<number>(0);

	//@ts-ignore
	const scrollHandler = (e: WheelEvent<HTMLTableSectionElement>): void => {
		if (e.shiftKey === true || tableState.count === undefined) {
			return;
		}
		if (lastOrdered.current !== -1){
			if( Math.abs(lastOrdered.current - tableState.lastReceived) > 10){
				// console.log("lastOrdered: ", lastOrdered.current, " lastReceived: ", tableState.lastReceived )
				// console.log("returning")
				return;
			}
		}

		if (e.deltaY > 0) {
			// scroll down
			dispatch({
				type: 'changeAccept',
				newVal: 'next',
			});

			if (start.current < tableState.count) {
				start.current = Math.max(
					Math.min(
						start.current + 1,
						tableState.count - tableState.scope + 1
					),
					1
				);
				setStartNumber(start.current);

				lastOrdered.current = start.current + tableState.scope
				worker.TableWorker.postMessage({
					type: 'steam',
					storeName: tableState.tableName,
					dbVersion: database.dbVersion,
					action: {
						type: 'next',
						start: start.current,
						scope: tableState.scope,
						pos: start.current + tableState.scope,
					},
				});
			}
		} else if (e.deltaY < 0) {
			// scroll up
			dispatch({
				type: 'changeAccept',
				newVal: 'prev',
			});

			start.current = Math.max(start.current - 1, 1);
			setStartNumber(start.current);

			if (start.current !== 1) {
				lastOrdered.current  = start.current - 1
				worker.TableWorker.postMessage({
					type: 'steam',
					storeName: tableState.tableName,
					dbVersion: database.dbVersion,
					action: {
						type: 'prev',
						start: start.current,
						scope: tableState.scope,
						pos: start.current - 1,
					},
				});
			}
		}
		setStartNumber(start.current);
	};

	return (
		<>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				onWheel={scrollHandler}>
				<div
					spellCheck={causeRerender}
					style={{
						position: 'absolute',
						height: 0,
						width: 0,
						display: 'none',
						userSelect: 'none',
						margin: 0,
						zIndex: -10,
					}}></div>
				<TableRows />
			</tbody>
		</>
	);
}
