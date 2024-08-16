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
} from 'react';
import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import { TableHeadDisplay } from './TableHeadDisplay';
import { TableBodyDisplay } from './TableBodyDisplay';
import { TableFootDisplay } from './TableFootDisplay';
import './Table.css';

import type {
	TableProps,
	TableFootDisplayProps,
	TableContextType,
	TableDispatchAction,
} from '@util/types/types';

const PlaceHolderTableContext: TableContextType = {
	tableName: '',
	uniqueKey: '',
	scope: 0,
	count: 0,
	isMouseDown: false,
	columns: [],
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
};

function tableReducer(
	tableState: TableContextType,
	action: TableDispatchAction
): TableContextType {
	// console.log(action);
	//! For Some Reason the new States need to be both 'changed' in the immutable (provided) tableState and also returned. I have not looked further into it, for now it works.
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
			return tableState;
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
			return tableState;
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
		case 'scopeChange': {
			if (tableState.scope > action.newVal) {
				tableState.rows.pop();
				tableState.scope = action.newVal;
			} else if (tableState.scope < action.newVal) {
				if (action.worker !== undefined) {
					action.worker.postMessage({
						type: 'steam',
						storeName: tableState.tableName,
						dbVersion: tableState.dbVersion,
						action: {
							type: 'next',
							start: tableState.start,
							scope: tableState.scope,
							pos: tableState.start + tableState.scope,
						},
					});
				}
			}
			return tableState;
		}
		default: {
			return tableState;
		}
	}
}

const TableContext = createContext<TableContextType>(PlaceHolderTableContext);
const TableDispatchContext =
	// @ts-ignore
	createContext<Dispatch<TableDispatchAction>>(tableReducer);

export function useTableContext() {
	return useContext<TableContextType>(TableContext);
}

export function useTableDispatch() {
	return useContext(TableDispatchContext);
}

export function Table({
	tableName,
	colsHook,
	entriesHook,
	updateHook,
	uniqueKey,
}: TableProps): React.JSX.Element {
	const rowColumnWidth = 30;
	const { clientHeight } = useContext(WindowContext);
	const { database, appearances, worker } = useContext(AppContext);
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const colsRef = useRef<React.RefObject<HTMLTableCellElement>[]>([]).current;
	const [causeRerender, setCauseRerender] = useState<boolean>(false);
	const [hasStarted, setHasStarted] = useState<boolean>(false);
	const [tableState, dispatch] = useReducer(
		tableReducer,
		{
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
			// get out.update
			if (args.updateHook !== undefined) {
				out.update = args.updateHook.update;
			} else {
				out.update = false;
			}

			// get cols
			if (args.colsHook !== undefined) {
				out.columns = args.colsHook.cols;
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

	useEffect(() => {
		// console.log(clientHeight)
		if (wrapperRef.current !== null) {
			const wrapperHeight =
				wrapperRef.current.getBoundingClientRect().height;
			if (wrapperHeight !== undefined) {
				const scrollBarHeight = 5;
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) /
					appearances.rowHeight;
				const newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 12) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 2;
					if (tableState.scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
						setCauseRerender(!causeRerender);
					} else {
						dispatch({
							type: 'scopeChange',
							newVal: cleanedScope,
						});
						setCauseRerender(!causeRerender);
					}

					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal:
							4 * cleanedScope +
							(cleanedScope + 2) * appearances.rowHeight +
							6,
					});
				} else if (newScope >= 12) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 3;
					if (tableState.scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
						setCauseRerender(!causeRerender);
					} else {
						dispatch({
							type: 'scopeChange',
							newVal: cleanedScope,
						});
					}
					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal:
							4 * cleanedScope +
							(cleanedScope + 2) * appearances.rowHeight +
							6,
					});
				} else {
					dispatch({
						type: 'scopeChange',
						newVal: 2,
					});
					setCauseRerender(!causeRerender);

					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal: 4 * 2 + (2 + 2) * appearances.rowHeight + 6,
					});
				}
			} else {
				dispatch({
					type: 'scopeChange',
					newVal: 0,
				});
				dispatch({
					type: 'set',
					name: 'resizeElemHeight',
					newVal: 4 * 0 + (0 + 2) * appearances.rowHeight + 6,
				});
			}
		}
	}, [clientHeight, appearances.rowHeight]);

	worker.TableWorker.onmessage = (e) => {
		if (e.data.type === 'stream') {
			switch (e.data.action) {
				case 'next':
					if (tableState.accept === 'next') {
						let rows = tableState.rows;
						if (!tableState.rows.includes(e.data.data)) {
							if (e.data.index !== undefined) {
								dispatch({
									type: 'set',
									name: 'start',
									newVal: e.data.index - tableState.scope + 1,
								});
								dispatch({
									type: 'set',
									name: 'lastReceived',
									newVal: e.data.index,
								});
							}
						}
						rows.splice(0, 1);
						rows.push(e.data.data);
						// console.log('received data: ', e.data.index);
						dispatch({
							type: 'set',
							name: 'rows',
							newVal: rows,
						});
					}
					break;
				case 'prev':
					if (tableState.accept === 'prev') {
						let rows = tableState.rows;
						if (!tableState.rows.includes(e.data.data)) {
							if (!tableState.rows.includes(e.data.data)) {
								if (e.data.index !== undefined) {
									dispatch({
										type: 'set',
										name: 'start',
										newVal: e.data.index,
									});
									dispatch({
										type: 'set',
										name: 'lastReceived',
										newVal: e.data.index,
									});
								}
							}
							rows.pop();
							rows.splice(0, 0, e.data.data);
							// console.log("received ", e.data.index)
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
		} else if (e.data.type === 'columns') {
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: e.data.data,
			});
			dispatch({
				type: 'set',
				name: 'colsRef',
				newVal: e.data.data.map(() => createRef<HTMLTableCellElement>()),
			});
			dispatch({
				type: 'set',
				name: 'resizeStyles',
				newVal: e.data.data.map(() => ({
					background: 'none',
					cursor: 'initial',
				})),
			});
			dispatch({
				type: 'set',
				name: 'columnWidths',
				newVal: e.data.data.map((val, index) =>
					index === 0 ? rowColumnWidth : appearances.columnWidth
				),
			});
		} else if (e.data.type === 'count') {
			// console.log('count: ', e.data.data);
			dispatch({
				type: 'set',
				name: 'count',
				newVal: e.data.data,
			});
			setCauseRerender(!causeRerender);
		} else if ((e.data.type = 'startingRows')) {
			// console.log('startingRows');
			dispatch({
				type: 'set',
				name: 'rows',
				newVal: e.data.data,
			});
			if (Array.isArray(e.data.data)) {
				if (e.data.data.length == 0) {
					console.log('rows is 0');
				}
			}
			setCauseRerender(!causeRerender);
		} else if (e.data.type === 'error') {
			console.log(e.data.data);
		}
	};

	useEffect(() => {
		if (entriesHook === undefined) {
			worker.TableWorker.postMessage({
				type: 'count',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
			});
		}
		// reimplement the reducer init function
		dispatch({
			type: 'set',
			name: 'lastReceived',
			newVal: 0,
		});
		if (colsHook !== undefined) {
			dispatch({
				type: 'set',
				name: 'columns',
				newVal: colsHook.cols,
			});
			dispatch({
				type: 'set',
				name: 'colsRef',
				newVal: colsHook.cols.map(() => createRef<HTMLTableCellElement>()),
			});
			dispatch({
				type: 'set',
				name: 'resizeStyles',
				newVal: colsHook.cols.map(() => ({
					background: 'none',
					cursor: 'initial',
				})),
			});
			dispatch({
				type: 'set',
				name: 'columnWidths',
				newVal: colsHook.cols.map((val, index) =>
					index === 0 ? rowColumnWidth : appearances.columnWidth
				),
			});
		}
		worker.TableWorker.postMessage({
			type: 'columns',
			storeName: tableState.tableName,
			dbVersion: database.dbVersion,
		});
		worker.TableWorker.postMessage({
			type: 'count',
			storeName: tableState.tableName,
			dbVersion: database.dbVersion,
		});

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

		dispatch({
			type: 'set',
			name: 'dbVersion',
			newVal: database.dbVersion,
		});
	}, [tableState.tableName, database.dbVersion, colsHook, entriesHook]);

	useEffect(() => {
		if (!hasStarted) {
			if (tableState.rows.length === 0 && tableState.scope !== 0) {
				worker.TableWorker.postMessage({
					type: 'startingRows',
					storeName: tableState.tableName,
					dbVersion: database.dbVersion,
					scope: tableState.scope,
				});
				setHasStarted(true);
			}
		}
	}, [tableState.rows, tableState.scope, hasStarted]);

	const TableFootDisplayMemo = memo(
		({ columns, update }: TableFootDisplayProps) => {
			return <TableFootDisplay columns={columns} update={update} />;
		}
	);

	return (
		<>
			<TableContext.Provider value={tableState}>
				<TableDispatchContext.Provider value={dispatch}>
					<div tabIndex={-1} className="tableWrapper">
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
								<TableFootDisplayMemo
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
