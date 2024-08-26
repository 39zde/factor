import React, {
	useRef,
	createRef,
	useContext,
	createContext,
	useReducer,
	Dispatch,
	useEffect,
	useState,
	MouseEvent,
	useCallback,
} from 'react';
import { useAppContext } from '@renderer/App';
import { TableHeadDisplay } from './TableHeadDisplay';
import { TableBodyDisplay } from './TableBodyDisplay';
import { TableFootDisplay } from './TableFootDisplay';
import { ColumnOrderer } from './ColumnOrderer';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import './Table.css';

import {
	tableReducer,
	updateSizing,
	PlaceHolderTableContext,
} from '@renderer/util/func/func';
import type {
	TableProps,
	TableContextType,
	TableDispatchAction,
	TableWorkerResponseMessage,
	MenuItem,
	DerefRow,
	StarterPackageResponse,
} from '@renderer/util/types/types';

const TableContext = createContext<TableContextType>(PlaceHolderTableContext);
const TableDispatchContext =
	//!TODO find the correct type for this to not need ts-ignore
	// @ts-ignore unintuitive typing with useReducer in combination with useContext
	createContext<Dispatch<TableDispatchAction>>(tableReducer);

export function useTableContext() {
	return useContext<TableContextType>(TableContext);
}

export function useTableDispatch() {
	return useContext(TableDispatchContext);
}

export function Table({
	dataBaseName,
	tableName,
	colsHook,
	entriesHook,
	updateHook,
	uniqueKey,
}: TableProps): React.JSX.Element {
	const rowColumnWidth = 30;
	const scrollBarHeight = 5;
	const { database, appearances, worker, general } = useAppContext();
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [causeRerender, setCauseRerender] = useState<boolean>(false);
	const [menuX, setMenuX] = useState<number>(0);
	const [menuY, setMenuY] = useState<number>(0);
	const [menuActive, setMenuActive] = useState<boolean>(false);
	const [tableState, dispatch] = useReducer(
		tableReducer,
		PlaceHolderTableContext
	);

	const initTableState = useCallback(() => {
		// signal that we haven't started
		dispatch({
			type: 'set',
			name: 'hasStarted',
			newVal: false,
		});
		// set the table staring point to 1
		dispatch({
			type: 'set',
			name: 'start',
			newVal: 1,
		});
		// reset the rows
		dispatch({
			type: 'set',
			name: 'rows',
			newVal: [],
		});
		tableState.rows = [];
		tableState.start = 0;
		setCauseRerender(!causeRerender);
		if (tableState.dataBaseName !== dataBaseName) {
			// set new dataBaseName
			dispatch({
				type: 'set',
				name: 'dataBaseName',
				newVal: dataBaseName,
			});
		}
		if (tableState.tableName !== tableName) {
			// set new tableName
			dispatch({
				type: 'set',
				name: 'tableName',
				newVal: tableName,
			});
		}
		if (tableState.uniqueKey !== uniqueKey) {
			// set new uniqueKey
			dispatch({
				type: 'set',
				name: 'uniqueKey',
				newVal: uniqueKey,
			});
		}
		if (tableState.dbVersion !== database.dbVersion) {
			// set new dbVersion
			dispatch({
				type: 'set',
				name: 'dbVersion',
				newVal: database.dbVersion,
			});
		}
		// figure out the scope
		if (wrapperRef.current !== null) {
			updateSizing(
				dispatch,
				{
					dataBaseName: dataBaseName,
					dbVersion: database.dbVersion,
					hasStarted: tableState.hasStarted,
					oldScope: tableState.scope,
					start: tableState.start,
					tableName: tableName,
					tableRows: tableState.rows,
				},
				wrapperRef.current,
				scrollBarHeight,
				appearances.rowHeight,
				() => {
					setCauseRerender(!causeRerender);
				},
				worker.TableWorker
			);
		}
	}, [tableName, dataBaseName, uniqueKey, database.dbVersion]);

	// start populating the context once the table Body
	useEffect(() => {
		if (
			tableBodyRef.current !== undefined &&
			tableState.hasStarted === false
		) {
			initTableState();
		}
	}, [tableBodyRef.current, tableState.hasStarted]);

	// listen for any updates
	useEffect(() => {
		if (updateHook !== undefined) {
			dispatch({
				type: 'set',
				name: 'update',
				newVal: updateHook?.update,
			});
		}
	}, [updateHook]);

	useCallback(() => {
		if (colsHook !== undefined) {
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: colsHook.cols,
			});
		}
	}, [colsHook?.cols]);

	// dynamically update rowHeight and scope, if the window resizes or the rowHeight changed in settings
	useEffect(() => {
		if (tableState.hasStarted) {
			if (wrapperRef.current !== null) {
				updateSizing(
					dispatch,
					{
						dataBaseName: dataBaseName,
						dbVersion: database.dbVersion,
						hasStarted: true,
						oldScope: tableState.scope,
						start: tableState.start,
						tableName: tableName,
						tableRows: tableState.rows,
					},
					wrapperRef.current,
					scrollBarHeight,
					appearances.rowHeight,
					() => {
						setCauseRerender(!causeRerender);
					},
					worker.TableWorker
				);
			}
		}
		// don't put tableState.scope into the deps array, because the function updateSizing changes tableState.scope, therefore creating a cycle
	}, [appearances.height, appearances.rowHeight, tableState.hasStarted]);

	/**
	 *  handle the messages coming from table.worker.ts
	 *  dispatches: rows, lastReceived, start, columns, allColumns, resizeStyles, columnWidths, count, hasStarted
	 *  **/
	worker.TableWorker.onmessage = (e: MessageEvent) => {
		const eventData = e.data as TableWorkerResponseMessage;
		switch (eventData.type) {
			case 'stream':
				if (eventData.action === undefined) {
					return;
				}
				switch (eventData.action) {
					case 'add':
						const rows = tableState.rows;
						const filtered = rows.filter((value) => {
							//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
							if (value.row === eventData.data.row) return true;
							return false;
						});
						if (
							filtered.length === 0 &&
							typeof eventData.data !== 'number' &&
							!Array.isArray(eventData.data)
						) {
							rows.push(eventData.data as DerefRow);
							dispatch({
								type: 'set',
								name: 'rows',
								newVal: rows,
							});
							dispatch({
								type: 'set',
								name: 'lastReceived',
								newVal: (eventData.data as DerefRow).row,
							});
						}
						setCauseRerender(!causeRerender);
						break;
					case 'next':
						// the responses from a scroll down action action
						if (tableState.accept === 'next') {
							const rows = tableState.rows;
							const filtered = rows.filter((value) => {
								//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
								if (value.row === eventData.data.row) return true;
								return false;
							});
							if (
								filtered.length === 0 &&
								eventData.index !== undefined &&
								typeof eventData.data !== 'number' &&
								!Array.isArray(eventData.data)
							) {
								dispatch({
									type: 'set',
									name: 'start',
									newVal: eventData.index - tableState.scope + 1,
								});
								dispatch({
									type: 'set',
									name: 'lastReceived',
									newVal: eventData.index,
								});
								dispatch({
									type: 'set',
									name: 'start',
									newVal:
										(eventData.data as DerefRow).row -
										tableState.scope,
								});
								rows.splice(0, 1);
								rows.push(eventData.data as DerefRow);
								dispatch({
									type: 'set',
									name: 'rows',
									newVal: rows,
								});
							}
						}
						break;
					case 'prev':
						if (tableState.accept === 'prev') {
							const rows = tableState.rows;
							const filtered = rows.filter((value) => {
								//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
								if (value.row === eventData.data.row) return true;
								return false;
							});
							if (
								filtered.length === 0 &&
								eventData.index !== undefined &&
								typeof eventData.data !== 'number' &&
								!Array.isArray(eventData.data)
							) {
								dispatch({
									type: 'set',
									name: 'start',
									newVal: eventData.index,
								});
								dispatch({
									type: 'set',
									name: 'lastReceived',
									newVal: eventData.index,
								});
								rows.pop();
								rows.splice(0, 0, eventData.data as DerefRow);
								// console.log("received ", eventData.index)
								dispatch({
									type: 'set',
									name: 'rows',
									newVal: rows,
								});
							}
						}
						break;
					default:
						break;
				}
				setCauseRerender(!causeRerender);
				break;
			case 'startingPackage':
				let data = eventData.data as StarterPackageResponse;
				// count
				dispatch({
					type: 'set',
					name: 'count',
					newVal: data.startingCount,
				});
				if (entriesHook !== undefined) {
					// make count accessible outside of Table comp
					entriesHook(data.startingCount);
				}
				// column related
				dispatch({
					type: 'set',
					name: 'columns',
					newVal: data.startingColumns
						.toSpliced(data.startingColumns.indexOf('row'), 1)
						.toSpliced(0, 0, 'row'),
				});
				dispatch({
					type: 'set',
					name: 'columns',
					newVal: data.startingColumns
						.toSpliced(data.startingColumns.indexOf('row'), 1)
						.toSpliced(0, 0, 'row'),
				});
				dispatch({
					type: 'set',
					name: 'colsRef',
					newVal: data.startingColumns.map(() =>
						createRef<HTMLTableCellElement>()
					),
				});
				dispatch({
					type: 'set',
					name: 'resizeStyles',
					newVal: data.startingColumns.map(() => ({
						background: 'none',
						cursor: 'initial',
					})),
				});
				dispatch({
					type: 'set',
					name: 'columnWidths',
					newVal: data.startingColumns.map((_value, index) =>
						index === 0 ? rowColumnWidth : appearances.columnWidth
					),
				});
				if (colsHook !== undefined) {
					// make make columns outside of Table comp
					colsHook.setAllCols(data.startingColumns);
					colsHook.setCols(data.startingColumns);
				}
				// startingRow related
				dispatch({
					type: 'set',
					name: 'rows',
					newVal: data.starterRows,
				});
				dispatch({
					type: 'set',
					name: 'lastReceived',
					newVal: data.starterRows[data.starterRows.length - 1].row,
				});
				dispatch({
					type: 'set',
					name: 'hasStarted',
					newVal: true,
				});
				setCauseRerender(!causeRerender);
				break;
			case 'error':
				console.log(eventData);
				break;
			case 'success':
				console.log(eventData);
				break;
			default:
				break;
		}
	};

	const clickHandler = (e: MouseEvent) => {
		if (e.button === 2) {
			setMenuActive(true);
			setMenuX(e.pageX);
			setMenuY(e.pageY);
		}
		if (menuActive) {
			if (
				//@ts-expect-error ts does not know about this dom element
				e.target.ariaModal !== 'true'
			) {
				setMenuActive(false);
			}
		}
	};

	const columnChecker = (index: number, item: string) => {
		if (tableState.columns.includes(item)) {
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: tableState.columns.toSpliced(
					tableState.columns.indexOf(item),
					1
				),
			});
		} else {
			let insertIndex = index;
			for (const col of tableState.allColumns) {
				if (col === item) {
					break;
				}
				// if there is a column before our item, which is not visible, subtract 1 from the insertion index
				if (!tableState.columns.includes(col)) {
					insertIndex -= 1;
				}
			}
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: tableState.columns.toSpliced(
					insertIndex,
					0,
					tableState.allColumns[index]
				),
			});
		}
		setCauseRerender(!causeRerender);
	};

	const menuItems: Array<MenuItem> = [
		{
			name: general.language === 'deutsch' ? 'Spalten' : 'Columns',
			menuItems: tableState.allColumns.map(
				(item, index): MenuItem | undefined => {
					if (index !== 0) {
						return {
							name: item,
							checkBox: tableState.columns.includes(item) ?? true,
							action: () => {
								columnChecker(index, item);
							},
						};
					} else {
						return undefined;
					}
				}
			),
		},
		{
			name:
				general.language === 'deutsch'
					? 'Spalten Reihenfolge'
					: 'Column Order',
			component: <ColumnOrderer />,
		},
	];

	return (
		<>
			<TableContext.Provider value={tableState}>
				<TableDispatchContext.Provider value={dispatch}>
					<div
						tabIndex={-1}
						className="tableWrapper"
						onMouseDown={clickHandler}>
						<ContextMenu
							active={menuActive}
							x={menuX}
							y={menuY}
							menuItems={menuItems}
						/>
						<div
							className="tableElement"
							style={{
								scrollbarColor:
									appearances.colorTheme === 'light'
										? 'var(--color-light-3) var(--color-light-2)'
										: appearances.colorTheme === 'dark'
											? 'var(--color-dark-3) var(--color-dark-2)'
											: 'initial',
							}}
							ref={wrapperRef}
							onMouseMove={(e) => {
								if (tableState.isMouseDown) {
									dispatch({
										type: 'mouseMove',
										newVal: e.pageX,
									});
								}
							}}
							onMouseUp={() => {
								dispatch({
									type: 'mouseUp',
									newVal: tableState.activeBg,
								});
							}}>
							<table
								style={{
									cursor: tableState.cursor,
									userSelect: tableState.userSelect,
								}}>
								<TableHeadDisplay causeRerender={causeRerender} />
								<TableBodyDisplay
									causeRerender={causeRerender}
									ref={tableBodyRef}
								/>
								<TableFootDisplay
									columns={tableState.columns}
									update={tableState.update}
								/>
							</table>
						</div>
					</div>
				</TableDispatchContext.Provider>
			</TableContext.Provider>
		</>
	);
}

/**

Data Information Flow


Start
|
├useReducer-init
|		|- tableState.uniqueKey
|		|- tableState.cursorX
| 		|- tableState.cursor
|		|- tableState.isMouseDown
|		|- tableState.userSelect
|		|- tableState.activeBg
|		|- tableState.activeCol
|		|- tableState.start
|		|- tableState.lastReceived
|		|- tableState.hasStarted
|		|- tableState.update
|
initTableState[tableName, dataBaseName, uniqueKey, database.dbVersion]
|		|-tableState.hasStared => false
|		|-tableState.dataBaseName
|		|-tableState.tableName
|		|-tableState.uniqueKey
|     |-tableState.dbVersion
|
|
updateSizing()
|		|-tableState.resizeElemHeight
|
updateScope()
|		|-tableState.scope
|
|
tableWorkerRequest: starterPackage
|
... wait for the worker to do its work
|
tableWorkerResponse: starterPackage
|		|-tableState.count
|		|-tableState.columns
|		|-tableState.allColumns
|		|-tableState.colsRef
|		|-tableState.resizeStyles
|		|-tableState.columnWidths
|		|-tableState.rows
|		|-tableState.lastReceived
|		|-tableState.hasStarted
|
triggerRerender
|
|
|
|<---------------------let us say the  tableName changes
|
|
initTableState[tableName, dataBaseName, uniqueKey, database.dbVersion]
|		|-tableState.hasStared => false
|		|-tableState.dataBaseName
|		|-tableState.tableName
|		|-tableState.uniqueKey
|     |-tableState.dbVersion
|
|
updateSizing()
|		|-tableState.resizeElemHeight
|
updateScope()
|		|-tableState.scope
|
newScope < oldScope
|
|
├---------------┐
|					 |
false 			true
|   				 |
|		  	       |-tableState.rows
|		          |-tableState.lastReceived
|
tableWorkerRequest: stream (action: add)
|
... wait for the worker to do its work
|
tableWorkerResponse: stream(action: add)
| 	 |-tableState.rows
|	 |-tableState.lastReceived
|
triggerRerender
 */
