import React, {
	useRef,
	createRef,
	useContext,
	memo,
	createContext,
	useReducer,
	Dispatch,
	useEffect,
	useState,
	MouseEvent,
} from 'react';
import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import { TableHeadDisplay } from './TableHeadDisplay';
import { TableBodyDisplay } from './TableBodyDisplay';
import { TableFootDisplay } from './TableFootDisplay';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import './Table.css';

import type {
	TableProps,
	TableFootDisplayProps,
	TableContextType,
	TableDispatchAction,
	TableWorkerResponseMessage,
	MenuItem,
} from '@renderer/util/types/types';

const PlaceHolderTableContext: TableContextType = {
	dataBaseName: '',
	tableName: '',
	uniqueKey: '',
	scope: 0,
	count: 0,
	isMouseDown: false,
	columns: [],
	allColumns: [],
	cursor: 'initial',
	cursorX: 0,
	userSelect: 'initial',
	update: false,
	activeBg: undefined,
	activeCol: undefined,
	columnWidths: [],
	resizeElemHeight: 150,
	colsRef: null,
	resizeStyles: [],
	rows: [],
	start: 0,
	dbVersion: 1,
	accept: 'next',
	lastReceived: 0,
	cachedRowHeight: 0,
};

function tableReducer(
	tableState: TableContextType,
	action: TableDispatchAction
): TableContextType {
	switch (action.type) {
		case 'changeAccept': {
			if (action.newVal === 'next' || action.newVal === 'prev') {
				tableState.accept = action.newVal;
				return {
					//@ts-expect-error we want to override
					accept: action.newVal,
					...tableState,
				};
			}
			return {
				// @ts-expect-error we want to overwrite
				accept:
					action.newVal === 'next' || action.newVal === 'prev'
						? action.newVal
						: tableState.accept,
				...tableState,
			};
		}
		case 'set': {
			//@ts-ignore
			tableState[action.name] = action.newVal;
			return tableState;
		}
		case 'mouseDown': {
			tableState.isMouseDown = true;
			tableState.activeBg = action.newVal;
			tableState.activeCol = action.newVal;
			tableState.cursor = 'col-resize';
			tableState.userSelect = 'none';
			return {
				// @ts-expect-error we want to overwrite
				isMouseDown: true,
				// @ts-expect-error we want to overwrite
				activeBg: action.newVal,
				// @ts-expect-error we want to overwrite
				activeCol: action.newVal,
				// @ts-expect-error we want to overwrite
				cursor: 'col-resize',
				// @ts-expect-error we want to overwrite
				userSelect: 'none',
				...tableState,
			};
		}
		case 'mouseUp': {
			tableState.cursor = 'initial';
			tableState.userSelect = 'initial';
			tableState.isMouseDown = false;
			tableState.activeBg = undefined;
			tableState.activeCol = undefined;
			tableState.resizeStyles[action.newVal] = {
				background: 'none',
				cursor: 'initial',
			};

			return {
				// @ts-expect-error we want to overwrite
				activeCol: undefined,
				// @ts-expect-error we want to overwrite
				activeBg: undefined,
				// @ts-expect-error we want to overwrite
				cursor: 'initial',
				// @ts-expect-error we want to overwrite
				userSelect: 'initial',
				// @ts-expect-error we want to overwrite
				isMouseDown: false,
				// @ts-expect-error we want to overwrite
				resizeStyles: tableState.resizeStyles.map((val, index) => ({
					background: 'none',
					cursor: 'initial',
				})),
				...tableState,
			};
		}
		case 'mouseMove': {
			if (tableState.isMouseDown === true) {
				tableState.cursorX = action.newVal;
				const currentWidth =
					tableState.colsRef[
						tableState.activeCol ?? 0
					].current?.getBoundingClientRect().width;
				const currentX =
					tableState.colsRef[
						tableState.activeCol ?? 0
					].current?.getBoundingClientRect().left;
				if (currentWidth !== undefined && currentX !== undefined) {
					const a = currentX;
					const b = action.newVal;
					const newWidth = Math.abs(Math.abs(b - a));
					if (!isNaN(newWidth)) {
						tableState.columnWidths[tableState.activeCol ?? 0] = newWidth;
						return {
							// @ts-expect-error we want to overwrite
							columnWidths: tableState.columnWidths.map(
								(value, index) =>
									index === tableState.activeCol ? newWidth : value
							),
							...tableState,
						};
					}
				}
			} else {
				tableState.activeBg = undefined;
			}
			return {
				...tableState,
			};
		}
		case 'mouseLeave': {
			if (tableState.isMouseDown === false) {
				tableState.activeBg = undefined;
				tableState.resizeStyles[action.newVal] = {
					background: 'none',
					cursor: 'initial',
				};
			}
			return {
				// @ts-expect-error we want to overwrite
				resizeStyles: tableState.isMouseDown
					? tableState.resizeStyles
					: tableState.resizeStyles.map((val, index) =>
							action.newVal === index
								? { background: 'none', cursor: 'initial' }
								: val
						),
				//@ts-expect-error we want to overwrite
				activeBg: tableState.isMouseDown ? tableState.activeBg : undefined,
				...tableState,
			};
		}
		case 'mouseEnter': {
			if (tableState.isMouseDown === false) {
				tableState.activeBg = action.newVal;
				tableState.resizeStyles[action.newVal] = {
					background:
						'light-dark(var(--color-dark-2),var(--color-light-2))',
					cursor: 'col-resize',
				};
			}
			return {
				// @ts-expect-error we want to overwrite
				resizeStyles: tableState.isMouseDown
					? tableState.resizeStyles
					: tableState.resizeStyles.map((val, index) =>
							action.newVal === index
								? {
										background:
											'light-dark(var(--color-dark-2),var(--color-light-2))',
										cursor: 'col-resize',
									}
								: val
						),
				//@ts-expect-error we want to overwrite
				activeBg: tableState.isMouseDown
					? tableState.activeBg
					: action.newVal,
				...tableState,
			};
		}
		default: {
			return tableState;
		}
	}
}

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
	const { clientHeight } = useContext(WindowContext);
	const { database, appearances, worker, general } = useContext(AppContext);
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const colsRef = useRef<React.RefObject<HTMLTableCellElement>[]>([]).current;
	const [causeRerender, setCauseRerender] = useState<boolean>(false);
	const [hasStarted, setHasStarted] = useState<boolean>(false);
	const [menuX, setMenuX] = useState<number>(0);
	const [menuY, setMenuY] = useState<number>(0);
	const [menuActive, setMenuActive] = useState<boolean>(false);
	const [tableState, dispatch] = useReducer(
		tableReducer,
		{
			dataBaseName: dataBaseName,
			tableName: tableName,
			colsHook: colsHook,
			entriesHook: entriesHook,
			updateHook: updateHook,
			dbVersion: database.dbVersion,
			uniqueKey: uniqueKey,
			tableBodyRef: tableBodyRef,
			rowHeight: appearances.rowHeight,
			colsRef: colsRef,
			TableWorker: worker.TableWorker,
		},
		(args): TableContextType => {
			const out: TableContextType = PlaceHolderTableContext;
			out.dataBaseName = args.dataBaseName;
			out.tableName = args.tableName;
			out.uniqueKey = args.uniqueKey;
			out.cursorX = 0;
			out.cursor = 'initial'; // "col-resize"
			out.isMouseDown = false;
			out.userSelect = 'initial'; // "none"
			out.activeBg = undefined;
			out.activeCol = undefined;
			out.dbVersion = args.dbVersion;
			out.start = 0;
			out.accept = 'next';
			out.lastReceived = 0;
			out.cachedRowHeight = args.rowHeight;
			out.rows = [];
			// get out.update
			if (args.updateHook !== undefined) {
				out.update = args.updateHook.update;
			} else {
				out.update = false;
			}

			// get cols
			if (args.colsHook !== undefined) {
				// ensure row is always the first
				out.columns = args.colsHook.cols
					.toSpliced(args.colsHook.cols.indexOf('row'), 1)
					.toSpliced(0, 0, 'row');
				out.allColumns = out.columns;
				out.colsRef = args.colsRef;
				out.colsRef = out.columns.map(() =>
					createRef<HTMLTableCellElement>()
				);
				out.resizeStyles = out.columns.map(() => ({
					background: 'none',
					cursor: 'initial',
				}));
			}

			return out;
		}
	);

	// reset the table stated to a state as if it were initialized (see the function in useReducer)
	function resetTableState() {
		for (const [key, val] of Object.entries(PlaceHolderTableContext)) {
			switch (key) {
				case 'count':
					worker.TableWorker.postMessage({
						type: 'count',
						storeName: tableState.tableName,
						dbVersion: database.dbVersion,
						dataBaseName: tableState.dataBaseName,
					});
					break;
				case 'columns':
					if (colsHook !== undefined) {
						// set the columns
						dispatch({
							type: 'set',
							name: 'columns',
							newVal: colsHook.cols,
						});
						dispatch({
							type: 'set',
							name: 'allColumns',
							newVal: colsHook.cols,
						});
						// make new colRefs
						dispatch({
							type: 'set',
							name: 'colsRef',
							newVal: colsHook.cols.map(() =>
								createRef<HTMLTableCellElement>()
							),
						});
						// make ne resizeStyles
						dispatch({
							type: 'set',
							name: 'resizeStyles',
							newVal: colsHook.cols.map(() => ({
								background: 'none',
								cursor: 'initial',
							})),
						});
						// make new colWidths
						dispatch({
							type: 'set',
							name: 'columnWidths',
							newVal: colsHook.cols.map((_value, index) =>
								index === 0 ? rowColumnWidth : appearances.columnWidth
							),
						});
					} else {
						worker.TableWorker.postMessage({
							type: 'columns',
							storeName: tableState.tableName,
							dbVersion: database.dbVersion,
							dataBaseName: tableState.dataBaseName,
						});
					}
					break;
				case 'allColumns':
				case 'colsRef':
				case 'columnWidths':
				case 'resizeStyles':
					break;
				case 'update':
					if (updateHook !== undefined) {
						dispatch({
							type: 'set',
							name: 'update',
							newVal: updateHook.update,
						});
					} else {
						dispatch({
							type: 'set',
							name: 'update',
							newVal: false,
						});
					}
					break;
				case 'dataBaseName':
					dispatch({
						type: 'set',
						name: 'dataBaseName',
						newVal: dataBaseName,
					});
					break;
				case 'dbVersion':
					dispatch({
						type: 'set',
						name: 'dbVersion',
						newVal: database.dbVersion,
					});
				case 'uniqueKey':
					dispatch({
						type: 'set',
						name: 'uniqueKey',
						newVal: uniqueKey,
					});
					break;
				case 'resizeElemHeight':
				case 'scope':
					break;
				default:
					dispatch({
						type: 'set',
						// @ts-expect-error the key are from PlaceHolderTableContext, which is of type TableContextType
						name: key,
						newVal: val,
					});
			}
		}
	}

	// set the scope
	// initialize Rows if they have not started yet
	// add rows, if the scope increased
	// remove rows, if the scope decreased
	function updateScope(newScope: number) {
		if (hasStarted) {
			let diff = Math.abs(tableState.scope - newScope);
			if (newScope < tableState.scope && newScope !== 0) {
				let rows = tableState.rows;
				// console.log(rows)
				if (rows.length !== 0) {
					for (let i = tableState.scope; i > newScope; i--) {
						rows.splice(i, 1);
					}
					dispatch({
						type: 'set',
						name: 'lastReceived',
						newVal: rows[rows.length - 1].row,
					});
					dispatch({
						type: 'set',
						name: 'rows',
						newVal: rows,
					});
					dispatch({
						type: 'set',
						name: 'scope',
						newVal: newScope,
					});
				}

				setCauseRerender(!causeRerender);
			} else if (newScope > tableState.scope) {
				for (let i = 0; i < diff; i++) {
					worker.TableWorker.postMessage({
						type: 'stream',
						storeName: tableState.tableName,
						dbVersion: tableState.dbVersion,
						dataBaseName: tableState.dataBaseName,
						action: {
							type: 'add',
							pos: tableState.start + tableState.scope + i,
						},
					});
				}
				dispatch({
					type: 'set',
					name: 'scope',
					newVal: newScope,
				});
				setCauseRerender(!causeRerender);
			}
		} else {
			worker.TableWorker.postMessage({
				type: 'startingRows',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
				scope: newScope,
				dataBaseName: tableState.dataBaseName,
			});
			dispatch({
				type: 'set',
				name: 'scope',
				newVal: newScope,
			});
		}
	}

	// calculate the scope from rowHeight and Table height
	function updateSizing(rowHeight: number, body: HTMLDivElement | null) {
		if (body !== null) {
			const wrapperHeight = body.getBoundingClientRect().height;
			if (wrapperHeight !== undefined) {
				dispatch({
					type: 'set',
					name: 'resizeElemHeight',
					newVal: wrapperHeight,
				});
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) / rowHeight;
				const newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 10) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 2;
					updateScope(cleanedScope);
				} else if (newScope >= 10 && newScope < 20) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 3;
					updateScope(cleanedScope);
				} else if (newScope >= 20) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 6;
					updateScope(cleanedScope);
				} else {
					updateScope(2);
				}
			} else {
				updateScope(0);
			}
		}
	}

	// exec once on first render
	useEffect(() => {
		setHasStarted(false);
	}, []);

	// dynamically update rowHeight and scope, if the window resizes or the rowHeight changed in settings
	useEffect(() => {
		// update the scope, because the window resized
		updateSizing(appearances.rowHeight, wrapperRef.current);

		//  update rowHeight, when setting change
		if (appearances.rowHeight !== tableState.cachedRowHeight) {
			dispatch({
				type: 'set',
				name: 'cachedRowHeight',
				newVal: appearances.rowHeight,
			});
			setCauseRerender(!causeRerender);
		}

		// don't put tableState.scope into the deps array, because the function updateSizing changes tableState.scope, therefore creating a cycle
	}, [clientHeight, appearances.rowHeight]);

	// the database or db Version has changed init a new table and clear any old values
	useEffect(() => {
		setHasStarted(false);
		resetTableState();
	}, [tableState.tableName, database.dbVersion, colsHook, entriesHook]);

	// handle the messages coming from table.worker.ts
	worker.TableWorker.onmessage = (e: MessageEvent) => {
		const eventData = e.data as TableWorkerResponseMessage;
		switch (eventData.type) {
			case 'stream':
				if (eventData.action === undefined) {
					return;
				}
				switch (eventData.action) {
					case 'add':
						let rows = tableState.rows;
						let filtered = rows.filter((value) => {
							//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
							if (value.row === eventData.data.row) return true;
							return false;
						});
						if (
							filtered.length === 0 &&
							typeof eventData.data !== 'number' &&
							!Array.isArray(eventData.data)
						) {
							rows.push(eventData.data);
							dispatch({
								type: 'set',
								name: 'rows',
								newVal: rows,
							});
							dispatch({
								type: 'set',
								name: 'lastReceived',
								newVal: eventData.data.row,
							});
						}
						break;
					case 'next':
						if (tableState.accept === 'next') {
							let rows = tableState.rows;
							let filtered = rows.filter((value) => {
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
								rows.splice(0, 1);
								rows.push(eventData.data);
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
							let rows = tableState.rows;
							let filtered = rows.filter((value) => {
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
								rows.splice(0, 0, eventData.data);
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
			case 'columns':
				if (Array.isArray(eventData.data)) {
					dispatch({
						type: 'set',
						name: 'columns',
						newVal: eventData.data
							.toSpliced(eventData.data.indexOf('row'), 1)
							.toSpliced(0, 0, 'row'),
					});
					dispatch({
						type: 'set',
						name: 'allColumns',
						newVal: eventData.data
							.toSpliced(eventData.data.indexOf('row'), 1)
							.toSpliced(0, 0, 'row'),
					});
					dispatch({
						type: 'set',
						name: 'colsRef',
						newVal: eventData.data.map(() =>
							createRef<HTMLTableCellElement>()
						),
					});
					dispatch({
						type: 'set',
						name: 'resizeStyles',
						newVal: eventData.data.map(() => ({
							background: 'none',
							cursor: 'initial',
						})),
					});
					dispatch({
						type: 'set',
						name: 'columnWidths',
						newVal: eventData.data.map((_value, index) =>
							index === 0 ? rowColumnWidth : appearances.columnWidth
						),
					});
				}
				break;
			case 'count':
				dispatch({
					type: 'set',
					name: 'count',
					newVal: eventData.data,
				});
				setCauseRerender(!causeRerender);
				break;
			case 'startingRows':
				if (Array.isArray(eventData.data)) {
					dispatch({
						type: 'set',
						name: 'rows',
						newVal: eventData.data,
					});
					dispatch({
						type: 'set',
						name: 'lastReceived',
						// @ts-ignore
						newVal: eventData.data[eventData.data.length - 1].row,
					});
					setHasStarted(true);
				}
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
				//@ts-ignore
				e.target.localName !== 'li' &&
				//@ts-ignore
				e.target.localName !== 'ul' &&
				//@ts-ignore
				e.target.localName !== 'svg' &&
				//@ts-ignore
				e.target.localName !== 'path'
			) {
				setMenuActive(false);
			}
		}
	};

	const menuItems: Array<MenuItem> = [
		{
			name: 'item1',
			menuItems: [{ name: 'nested1' }],
		},
		{
			name: general.language === 'deutsch' ? 'Spalten' : 'Columns',
			menuItems: tableState.allColumns.map(
				(item, index): MenuItem | undefined => {
					if (index !== 0) {
						return {
							name: item,
							checkBox: tableState.columns.includes(item),
							action: () => {
								// let cols = tableState.columns
								// console.log(cols[index])+
								console.log(tableState);
								if (tableState.columns.includes(item)) {
									dispatch({
										type: 'set',
										name: 'columns',
										newVal: tableState.columns.toSpliced(index, 1),
									});
									setCauseRerender(!causeRerender);
									setCauseRerender(!causeRerender);
								} else {
									dispatch({
										type: 'set',
										name: 'columns',
										newVal: tableState.columns.toSpliced(
											index,
											0,
											tableState.allColumns[index]
										),
									});
									setCauseRerender(!causeRerender);
									setCauseRerender(!causeRerender);
								}
								setMenuActive(false)
							},
						};
					} else {
						return undefined;
					}
				}
			),
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
								<TableHeadDisplay />
								<TableBodyDisplay
									causeRerender={causeRerender}
									tableBodyRef={tableBodyRef}
								/>
							<TableFootDisplay columns={tableState.columns} update={tableState.update} />
							</table>
						</div>
					</div>
				</TableDispatchContext.Provider>
			</TableContext.Provider>
		</>
	);
}
