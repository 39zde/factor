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
};

function tableReducer(
	tableState: TableContextType,
	action: TableDispatchAction
): TableContextType {
	// console.log(action);
	//! For Some Reason the new States need to be both 'changed' in the immutable (provided) tableState and also returned. I have not looked further into it, for now it works.
	switch (action.type) {
		case 'changeAccept': {
			tableState.accept = action.newVal;
			return {
				//@ts-expect-error we want to override
				accept: action.newVal,
				...tableState,
			};
		}
		case 'increase': {
			if (tableState.rows.includes(action.newVal)) {
				return tableState;
			}
			if (action.index !== undefined) {
				tableState.start = action.index;
			}
			tableState.rows.splice(0, 1);
			tableState.rows.push(action.newVal);
			return tableState;
		}
		case 'decrease': {
			if (tableState.rows.includes(action.newVal)) {
				return tableState;
			}
			if (action.index !== undefined) {
				tableState.start = action.index;
			}
			tableState.rows.pop();
			tableState.rows.splice(0, 0, action.newVal);
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
			// console.log(tableState.resizeStyles);
			tableState.cursor = 'initial';
			tableState.userSelect = 'initial';
			tableState.isMouseDown = false;
			tableState.activeBg = undefined;
			tableState.activeCol = undefined;
			tableState.resizeStyles[action.newVal] = {
				background: 'none',
				cursor: 'initial',
			};
			// console.log(tableState.resizeStyles[action.newVal]);

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
			// console.log(action.newVal);

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
			// console.log(action.newVal)
			// console.log(tableState.resizeStyles[action.newVal])
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
	const INITIAL_COLUMN_WIDTH = 150;
	const { clientHeight } = useContext(WindowContext);
	const { database, appearances, worker } = useContext(AppContext);
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const colsRef = useRef<React.RefObject<HTMLTableCellElement>[]>([]).current;
	const [causeRerender, setCauseRerender] = useState<boolean>(false);
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
			let out: TableContextType = PlaceHolderTableContext;
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
				let scrollBarHeight: number = 5;
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) /
					appearances.rowHeight;
				let newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 12) {
					let cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 2;
					if (tableState.scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
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
				} else if (newScope >= 12) {
					let cleanedScope =
						parseInt(rowCount.toString().split('.')[0]) - 3;
					if (tableState.scope === 0) {
						dispatch({
							type: 'set',
							name: 'scope',
							newVal: cleanedScope,
						});
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
						dispatch({
							type: 'increase',
							newVal: e.data.data,
							index: e.data.start,
						});
					}
					break;
				case 'prev':
					if (tableState.accept === 'prev') {
						dispatch({
							type: 'decrease',
							newVal: e.data.data,
							index: e.data.start,
						});
					}
					break;
				default:
					break;
			}
			// console.log("causeRerender")
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
				newVal: e.data.data.map(() => INITIAL_COLUMN_WIDTH),
			});
		} else if (e.data.type === 'count') {
			console.log('count: ', e.data.data);
			dispatch({
				type: 'set',
				name: 'count',
				newVal: e.data.data,
			});
		} else if ((e.data.type = 'startingRows')) {
			// console.log('rows: ', e.data.data);
			dispatch({
				type: 'set',
				name: 'rows',
				newVal: e.data.data,
			});
		}
	};

	useEffect(() => {
		if (colsHook === undefined) {
			// console.log('no cols');
			worker.TableWorker.postMessage({
				type: 'columns',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
			});
		}
		if (entriesHook === undefined) {
			worker.TableWorker.postMessage({
				type: 'count',
				storeName: tableState.tableName,
				dbVersion: database.dbVersion,
			});
		}

		worker.TableWorker.postMessage({
			type: 'startingRows',
			storeName: tableState.tableName,
			dbVersion: database.dbVersion,
			scope: tableState.scope,
		});
	}, [tableState.tableName, database.dbVersion, colsHook, entriesHook]);

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
