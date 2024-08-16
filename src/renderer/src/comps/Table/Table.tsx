import React, {
	useRef,
	createRef,
	useContext,
	memo,
	createContext,
	useReducer,
	Dispatch,
	useEffect,
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
						tableState.colsRef[
							tableState.activeCol ?? 0
						].current?.setAttribute(
							'style',
							`max-width: ${newWidth}; min-width: ${newWidth}px; border-top: none`
						);
					}
				}
			} else {
				tableState.activeBg = undefined;
			}
			return tableState;
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
	const { clientHeight } = useContext(WindowContext);
	const { database, appearances } = useContext(AppContext);
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const colsRef = useRef<React.RefObject<HTMLTableCellElement>[]>([]).current;
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

			// get out.dbTable and out.count
			async function getTableInfo() {
				try {
					const open = await args.db.open();
					for (const table of open.tables) {
						if (table.name === args.tableName) {
							out.dbTable = table;

							// get columns
							if (args.colsHook === undefined) {
								out.columns = Object.keys(
									await table.limit(1).toArray()[0]
								);
							}

							// get count
							if (args.entriesHook === undefined) {
								out.count = await table.count();
							} else {
								out.count = args.entriesHook.entries;
							}
							out.columnWidths = new Array(out.count).fill(150);
						}
					}
				} catch (e) {
					console.log(e);
				}
			}
			let infoPromise = getTableInfo();

			// get out.scope

			Promise.resolve(infoPromise);

			return out;
		}
	);

	useEffect(() => {
		if (wrapperRef.current !== null) {
			const wrapperHeight =
				wrapperRef.current.getBoundingClientRect().height;
			if (wrapperHeight !== undefined) {
				let scrollBarHeight: number = 5;
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) /
					appearances.rowHeight;
				let newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 15) {
					dispatch({
						type: 'set',
						name: 'scope',
						newVal: parseInt(rowCount.toString().split('.')[0]) - 2,
					});
					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal:
							4 * (parseInt(rowCount.toString().split('.')[0]) - 2) +
							(parseInt(rowCount.toString().split('.')[0]) - 2 + 2) *
								appearances.rowHeight +
							6,
					});
				} else if (newScope >= 15) {
					dispatch({
						type: 'set',
						name: 'scope',
						newVal: parseInt(rowCount.toString().split('.')[0]) - 3,
					});
					dispatch({
						type: 'set',
						name: 'resizeElemHeight',
						newVal:
							4 * (parseInt(rowCount.toString().split('.')[0]) - 3) +
							(parseInt(rowCount.toString().split('.')[0]) - 3 + 2) *
								appearances.rowHeight +
							6,
					});
				} else {
					dispatch({
						type: 'set',
						name: 'scope',
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
					type: 'set',
					name: 'scope',
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
								dispatch({
									type: 'mouseMove',
									newVal: e.pageX,
								});
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
								<TableBodyDisplay tableBodyRef={tableBodyRef} />
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
