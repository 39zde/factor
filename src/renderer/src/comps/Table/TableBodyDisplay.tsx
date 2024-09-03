import React, { useCallback, useEffect, useRef, forwardRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TableRows } from './TableBody';

import { useAppContext, solids } from '@renderer/App';
import { useTableContext, useTableDispatch } from './Table';

import { ChevronDown, ChevronUp } from 'lucide-react';

export const TableBodyDisplay = forwardRef<HTMLTableSectionElement>(function TableBodyDisplay(_props, ref): React.JSX.Element {
	const tableState = useTableContext();
	const dispatch = useTableDispatch();
	const { worker, database, general, appearances } = useAppContext();
	const lastOrdered = useRef<number>(-1);
	const start = useRef<number>(1);

	useEffect(() => {
		start.current = 1;
		lastOrdered.current = -1;
	}, [tableState.tableName, tableState.dbVersion, tableState.dataBaseName]);

	const increase = useCallback(() => {
		if (tableState.scope + start.current <= tableState.count) {
			start.current = start.current + 1;
			lastOrdered.current = start.current + tableState.scope - 1;
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
	}, [tableState.count, tableState.scope, database.dbVersion, tableState.tableName, tableState.lastReceived]);

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
	}, [tableState.count, tableState.scope, database.dbVersion, tableState.tableName, tableState.lastReceived]);

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
					if (Math.abs(lastOrdered.current - tableState.lastReceived) > tableState.scope) {
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
		[tableState.scope, tableState.lastReceived, general.scrollSpeed, tableState.count]
	);

	const iconProps = useMemo(() => {
		return {
			color: 'light-dark(var(--color-dark-1),var(--color-light-1))',
			size: solids.icon.size.regular,
			strokeWidth: solids.icon.strokeWidth.regular,
		};
	}, [solids]);

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
			<tbody
				className="tableBody"
				ref={ref}
				//@ts-expect-error miss match of WheelEvent and SyntheticEvent<HTMLTableSectionElement,WheelEvent>
				onWheel={scrollHandler}>
				{tableState.colsRef !== null && tableState.colsRef[0].current !== null ? (
					createPortal(
						<>
							<button
								style={{
									height: appearances.rowHeight,
									width: 44,
								}}
								onClick={upHandler}
								tabIndex={-1}
								className="rowNavigator rowNavigatorTop">
								<ChevronUp {...iconProps} />
							</button>
						</>,
						//@ts-expect-error we know that this is a span.guts element
						tableState.colsRef[0].current.firstChild,
						'upButton'
					)
				) : (
					<></>
				)}
				<TableRows />
				{tableState.footerRowFirstElementRef !== null && tableState.footerRowFirstElementRef.current !== null ? (
					createPortal(
						<>
							<button
								style={{
									height: 20,
									width: 44,
								}}
								onClick={downHandler}
								tabIndex={-1}
								className="rowNavigator rowNavigatorBottom">
								<ChevronDown {...iconProps} />
							</button>
						</>,
						//@ts-expect-error we know that this is a span.guts element
						tableState.footerRowFirstElementRef.current?.firstChild,
						'downButton'
					)
				) : (
					<></>
				)}
			</tbody>
		</>
	);
});
