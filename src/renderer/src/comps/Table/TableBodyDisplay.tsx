import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import type { TableBodyDisplayProps } from '@renderer/util/types/types';
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
	const start = useRef<number>(1);

	useEffect(() => {
		start.current = 1;
		lastOrdered.current = -1;
	}, [tableState.tableName]);

	const increase = useCallback(() => {
		// console.log(lastOrdered.current)
		// console.log(tableState.lastReceived)
		if (tableState.scope + start.current <= tableState.count) {
			start.current = start.current + 1;
			lastOrdered.current = start.current + tableState.scope - 1;
			// console.log('ordering ', lastOrdered.current);
			worker.TableWorker.postMessage({
				type: 'stream',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				dataBaseName: tableState.dataBaseName,
				action: {
					type: 'next',
					pos: lastOrdered.current,
				},
			});
		}
	}, [
		tableState.count,
		tableState.scope,
		database.dbVersion,
		tableState.tableName,
		tableState.lastReceived,
	]);

	const decrease = useCallback(() => {
		if (start.current - 1 >= 1) {
			start.current = Math.max(start.current - 1, 1);
			lastOrdered.current = start.current;
			// console.log('ordering ', lastOrdered.current);
			worker.TableWorker.postMessage({
				type: 'stream',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				dataBaseName: tableState.dataBaseName,
				action: {
					type: 'prev',
					pos: lastOrdered.current,
				},
			});
		}
	}, [
		tableState.count,
		tableState.scope,
		database.dbVersion,
		tableState.tableName,
		tableState.lastReceived,
	]);

	const scrollHandler = useCallback(
		(e: WheelEvent): void => {
			if (e.shiftKey === true || tableState.count === undefined) {
				return;
			}
			if (lastOrdered.current !== -1) {
				if (tableState.lastReceived == 0) {
					start.current = tableState.start;
					lastOrdered.current = tableState.start + tableState.scope;
				} else {
					if (
						Math.abs(lastOrdered.current - tableState.lastReceived) >
						tableState.scope
					) {
						// console.log(
						// 	'lastOrdered: ',
						// 	lastOrdered.current,
						// 	' lastReceived: ',
						// 	tableState.lastReceived
						// );
						// console.log('returning');
						return;
					}
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
		},
		[
			tableState.scope,
			tableState.lastReceived,
			general.scrollSpeed,
			tableState.count,
		]
	);

	const iconProps = {
		color: 'light-dark(var(--color-dark-1),var(--color-light-1))',
		size: 20,
		strokeWidth: 1.5,
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
					width: 40,
					top: 0,
				}}>
				<ChevronUp {...iconProps} />
			</button>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				//@ts-ignore miss match of WheelEvent and SyntheticEvent<HTMLTableSectionElement,WheelEvent>
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
					height: 20,
					width: 40,
					bottom: 0,
				}}>
				<ChevronDown {...iconProps} />
			</button>
		</>
	);
}
