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
	cachedRowHeight: 0,
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
	key,
}: TableProps): React.JSX.Element {
	const rowColumnWidth = 30;
	const scrollBarHeight = 5;
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
			out.cachedRowHeight = args.rowHeight;
			out.rows = []
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
		setHasStarted(false);
	});

	function updateScope(newScope: number) {
		let diff = Math.abs(tableState.scope - newScope);
		if (newScope < tableState.scope) {
			let rows = tableState.rows;

			for (let i = tableState.scope; i > newScope; i--) {
				rows.splice(i, 1);
			}

			dispatch({
				type: 'set',
				name: 'lastReceived',
				//@ts-ignore
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

			setCauseRerender(!causeRerender);
		} else if (newScope > tableState.scope) {
			for (let i = 0; i < diff; i++) {
				worker.TableWorker.postMessage({
					type: 'stream',
					storeName: tableState.tableName,
					dbVersion: tableState.dbVersion,
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
	}

	function updateSizing(
		scope: number,
		rowHeight: number,
		clHeight: number,
		body: HTMLDivElement | null
	) {
		const clientHasHeight = clHeight;
		if (body !== null) {
			const wrapperHeight = body.getBoundingClientRect().height;
			if (wrapperHeight !== undefined) {
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) / rowHeight;
				const newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 10) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 2;
					if (scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
						setCauseRerender(!causeRerender);
					} else {
						updateScope(cleanedScope);
					}

					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal: 4 * cleanedScope + (cleanedScope + 2) * rowHeight + 6,
					});
				} else if (newScope >= 10) {
					const cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 3;
					if (scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
						setCauseRerender(!causeRerender);
					} else {
						updateScope(cleanedScope);
					}
					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal: 4 * cleanedScope + (cleanedScope + 2) * rowHeight + 6,
					});
				} else {
					updateScope(2);

					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal: 4 * 2 + (2 + 2) * rowHeight + 6,
					});
				}
			} else {
				updateScope(0);

				dispatch({
					type: 'set',
					name: 'resizeElemHeight',
					newVal: 4 * 0 + (0 + 2) * rowHeight + 6,
				});
			}
		}
	}

	useEffect(() => {
		updateSizing(
			tableState.scope,
			appearances.rowHeight,
			clientHeight,
			wrapperRef.current
		);
	}, [clientHeight, appearances.rowHeight]);

	worker.TableWorker.onmessage = (e) => {
		if (e.data.type === 'stream') {
			switch (e.data.action) {
				case 'next':
					if (tableState.accept === 'next') {
						let rows = tableState.rows;
						let filtered = rows.filter((value, index, array) => {
							//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
							if (value.row === e.data.data.row) return true;
							return false;
						});
						if (filtered.length === 0) {
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
								rows.splice(0, 1);
								rows.push(e.data.data);
								dispatch({
									type: 'set',
									name: 'rows',
									newVal: rows,
								});
							}
							// console.log('received data: ', e.data.index);
						}
					}
					break;
				case 'prev':
					if (tableState.accept === 'prev') {
						let rows = tableState.rows;
						let filtered = rows.filter((value, index, array) => {
							//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
							if (value.row === e.data.data.row) return true;
							return false;
						});
						if (filtered.length === 0) {
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
				case 'add':
					let rows = tableState.rows;
					let filtered = rows.filter((value, index, array) => {
						//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
						if (value.row === e.data.data.row) return true;
						return false;
					});
					if (filtered.length === 0) {
						rows.push(e.data.data);
						dispatch({
							type: 'set',
							name: 'rows',
							newVal: rows,
						});
						dispatch({
							type: 'set',
							name: 'lastReceived',
							newVal: e.data.data.row,
						});
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
		} else if (e.data.type === 'startingRows') {
			// console.log('startingRows');
			dispatch({
				type: 'set',
				name: 'rows',
				newVal: e.data.data,
			});
			if (e.data.data.length !== 0) {
				dispatch({
					type: 'set',
					name: 'lastReceived',
					newVal: e.data.data[e.data.data.length - 1].row,
				});
			}
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
	}, [tableState.tableName, database.dbVersion, colsHook, entriesHook, key]);

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

	useEffect(() => {
		if (appearances.rowHeight !== tableState.cachedRowHeight) {
			console.log('updating cache');
			dispatch({
				type: 'set',
				name: 'cachedRowHeight',
				newVal: appearances.rowHeight,
			});
		}
		setCauseRerender(!causeRerender);
	}, [appearances.rowHeight]);

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
