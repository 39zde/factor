import React, { useContext, useEffect, useRef } from 'react';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import type { TableBodyDisplayProps } from '@util/types/types';
import { useTableContext, useTableDispatch } from './Table';

import { ChevronDown, ChevronUp } from 'lucide-react';

export function TableBodyDisplay({
	tableBodyRef,
	causeRerender,
}: TableBodyDisplayProps): React.JSX.Element {
	const tableState = useTableContext();
	const dispatch = useTableDispatch();
	const { worker, database, general, appearances } = useContext(AppContext);
	const lastOrdered = useRef<number>(-1);
	const start = useRef<number>(0);

	useEffect(() => {
		start.current = 0;
	}, [tableState.tableName]);

	function increase() {
		if (tableState.scope + start.current  <= tableState.count) {
			start.current = start.current + 1
			lastOrdered.current = start.current + tableState.scope - 1;
			// console.log('ordering ', lastOrdered.current);
			worker.TableWorker.postMessage({
				type: 'stream',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				action: {
					type: 'next',
					pos: lastOrdered.current,
				},
			});
		}
	}

	function decrease() {
		if (start.current - 1 >= 1) {
			start.current = Math.max(start.current - 1, 1);
			lastOrdered.current = start.current;
			// console.log('ordering ', lastOrdered.current);
			worker.TableWorker.postMessage({
				type: 'stream',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				action: {
					type: 'prev',
					pos: lastOrdered.current,
				},
			});
		}
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
				increase();
			}
		} else if (e.deltaY < 0) {
			// scroll up
			dispatch({
				type: 'changeAccept',
				newVal: 'prev',
			});

			for (let i = 0; i < general.scrollSpeed; i++) {
				if (i == tableState.scope) {
					break;
				}
				decrease();
			}
		}
	};

	const iconProps = {
		color: 'light-dark(var(--color-dark-1),var(--color-light-1))',
		size: appearances.rowHeight - 10,
		strokeWidth: 2,
	};

	const upHandler = () => {
		dispatch({
			type: 'changeAccept',
			newVal: 'prev',
		});
		decrease();
	};
	const downHandler = () => {
		dispatch({
			type: 'changeAccept',
			newVal: 'next',
		});
		increase();
	};

	return (
		<>
			<button
				onClick={upHandler}
				tabIndex={-1}
				className="rowNavigator"
				style={{
					height: appearances.rowHeight,
					width: 30,
					top: 0,
				}}>
				<ChevronUp {...iconProps} />
			</button>
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
			<button
				tabIndex={-1}
				onClick={downHandler}
				className="rowNavigator"
				style={{
					height: appearances.rowHeight - 10,
					width: 30,
					bottom: 0,
				}}>
				<ChevronDown {...iconProps} />
			</button>
		</>
	);
}
