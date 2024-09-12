import React, {
	useRef,
	createRef,
	useContext,
	createContext,
	useReducer,
	Dispatch,
	useEffect,
	MouseEvent,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { ChevronRight } from 'lucide-react';
// non-lib imports
import { TableHeadDisplay } from './TableHeadDisplay';
import { TableBodyDisplay } from './TableBodyDisplay';
import { TableFootDisplay } from './TableFootDisplay';
import { ColumnCheckBox } from './ColumnCheckBox';
import { ContextMenu } from '../ContextMenu/ContextMenu';
import { ColumnOrderer } from './ColumnOrderer';
import { solids, useAppContext } from '@app';
import { tableReducer, updateSizing, PlaceHolderTableContext } from '@util';
import type {
	TableProps,
	TableContextType,
	TableDispatchAction,
	TableWorkerResponseMessage,
	DerefRow,
	StarterPackageResponse,
	MenuItem,
} from '@typings';
import './Table.css';

const TableContext = createContext<TableContextType>(PlaceHolderTableContext);
const TableDispatchContext =
	//!TODO find the correct type for this to not need ts-ignore
	// @ts-expect-error unintuitive typing with useReducer in combination with useContext
	createContext<Dispatch<TableDispatchAction>>(tableReducer);

export function useTableContext() {
	return useContext<TableContextType>(TableContext);
}

export function useTableDispatch() {
	return useContext(TableDispatchContext);
}

export function Table({ dataBaseName, tableName, colsHook, entriesHook, updateHook, uniqueKey, update }: TableProps): React.JSX.Element {
	const rowColumnWidth = 30;
	const scrollBarHeight = 5;
	const { database, appearances, worker, general, notify } = useAppContext();
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [menuActive, setMenuActive] = useState<boolean>(false);
	const [x, setX] = useState<number>(0);
	const [y, setY] = useState<number>(0);
	const menuRef = useRef<HTMLDivElement>(null);
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const [tableState, dispatch] = useReducer(tableReducer, PlaceHolderTableContext);
	/** dispatch all tableState properties or invoke functions that do so */
	const initTableState = useCallback(() => {
		setMenuItems([]);
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
		// also mutate the state directly, just to be sure
		tableState.rows = [];
		tableState.start = 0;
		if (tableState.dataBaseName !== dataBaseName) {
			// set new dataBaseName
			dispatch({
				type: 'set',
				name: 'dataBaseName',
				newVal: dataBaseName,
			});
		}
		dispatch({
			type: 'set',
			name: 'tableName',
			newVal: tableName,
		});
		if (tableState.tableName !== tableName) {
			// set new tableName
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
					hasStarted: false,
					oldScope: tableState.scope,
					start: tableState.start,
					tableName: tableName,
					tableRows: tableState.rows,
				},
				wrapperRef.current,
				scrollBarHeight,
				appearances.rowHeight,
				worker.TableWorker
			);
		}
	}, [tableName, dataBaseName, uniqueKey, database.dbVersion]);

	// start populating the context once the table Body is there
	useEffect(() => {
		if (tableBodyRef.current !== undefined && tableState.hasStarted === false) {
			initTableState();
		}
	}, [tableBodyRef.current, tableState.hasStarted]);

	// listen for any updates
	useEffect(() => {
		setMenuActive(false);
		if (update !== undefined) {
			if (tableState.update !== update) {
				dispatch({
					type: 'set',
					name: 'update',
					newVal: update,
				});
				if (update) {
					initTableState();
				}
			}
		}
	}, [update]);

	// if we register a change from out side the table component execute it
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
		if (tableState.hasStarted && wrapperRef.current !== null) {
			// if we already have started and we have the wrapper element to pull a height from
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
				worker.TableWorker
			);
		}
		// don't put tableState.scope into the deps array, because the function updateSizing changes tableState.scope, therefore creating a cycle
	}, [appearances.height, appearances.rowHeight, tableState.hasStarted]);

	//  handle the messages coming from table.worker.ts
	//  this also includes responses from messages made in files other than this one.
	// dispatches: rows, lastReceived, start, columns, allColumns, resizeStyles, columnWidths, count, hasStarted
	worker.TableWorker.onmessage = (e: MessageEvent) => {
		const eventData = e.data as TableWorkerResponseMessage;
		switch (eventData.type) {
			case 'stream':
				if (eventData.action === undefined) {
					return;
				}
				switch (eventData.action) {
					case 'add':
						// adds data, when the scope changes
						// copy current rows
						const rows = tableState.rows;
						// check if the soon to be added element is already in the rows
						const filtered = rows.filter((value) => {
							//@ts-expect-error value is unknown to ts, because it was obtained by onMessage
							if (value.row === eventData.data.row) return true;
							return false;
						});
						if (filtered.length === 0 && typeof eventData.data !== 'number' && !Array.isArray(eventData.data)) {
							/// add the row to the tableState
							rows.push(eventData.data as DerefRow);
							dispatch({
								type: 'set',
								name: 'rows',
								newVal: rows,
							});
							// also change the last receive value
							dispatch({
								type: 'set',
								name: 'lastReceived',
								newVal: (eventData.data as DerefRow).row,
							});
						}
						break;
					case 'next':
						// the responses from a scroll down action action
						if (tableState.accept === 'next') {
							const rows = tableState.rows;
							// check if the soon to be added element is already in the rows

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
								// set the last received  value
								dispatch({
									type: 'set',
									name: 'lastReceived',
									newVal: eventData.index,
								});
								// set the start value
								dispatch({
									type: 'set',
									name: 'start',
									newVal: (eventData.data as DerefRow).row - tableState.scope,
								});
								// remove the first element and append the received row to the end
								rows.splice(0, 1);
								rows.push(eventData.data as DerefRow);
								// finally set the new rows
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
							// copy the current rows
							const rows = tableState.rows;
							// check if the incoming item is already in rows
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
								// if we don't have the incoming item in rows and
								// and the incoming item is valid
								// update the staring point to be the one from the incoming item
								dispatch({
									type: 'set',
									name: 'start',
									newVal: eventData.index,
								});
								// make sure everyone knows that this is the latest item
								dispatch({
									type: 'set',
									name: 'lastReceived',
									newVal: eventData.index,
								});
								// remove the row at end
								rows.pop();
								// and insert the incoming item
								rows.splice(0, 0, eventData.data as DerefRow);
								// finally update the rows
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
				break;
			case 'startingPackage':
				const data = eventData.data as StarterPackageResponse;
				// set how many entries there are in the table
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
				// make sure rows is always on the first position
				const cols = data.startingColumns.toSpliced(data.startingColumns.indexOf('row'), 1).toSpliced(0, 0, 'row');
				// set the menu items
				setMenuItems([
					{
						component: (
							<>
								<p aria-modal={'true'} className="menuRow">
									{general.language === 'deutsch' ? 'Spalten' : 'Columns'}
									<ChevronRight
										size={solids.icon.size.small}
										strokeWidth={solids.icon.strokeWidth.small}
										color="light-dark(var(--color-dark-1),var(--color-light-1))"
									/>
								</p>
							</>
						),
						subMenu: cols
							.map((item, index) => {
								return {
									component: (
										<>
											<ColumnCheckBox index={index} columnName={item} />
										</>
									),
								};
							})
							.toSpliced(0, 1),
					},
				]);
				// first check for saved columns older
				const savedAllColumns = localStorage.getItem(`${tableName}-allColumns`);
				if (savedAllColumns !== null) {
					// use them if they are there
					dispatch({
						type: 'set',
						name: 'allColumns',
						newVal: savedAllColumns.split(','),
					});
				} else {
					dispatch({
						type: 'set',
						name: 'allColumns',
						newVal: cols,
					});
				}
				// first check for saved columns
				const savedColumns = localStorage.getItem(`${tableName}-columns`);
				if (savedColumns !== null) {
					// if not, the use the default
					dispatch({
						type: 'set',
						name: 'columns',
						newVal: savedColumns.split(','),
					});
				} else {
					// if not, the use the default
					dispatch({
						type: 'set',
						name: 'columns',
						newVal: cols,
					});
				}
				// create refs used for getting the with of a columns.
				// we need this for resizing the columns
				dispatch({
					type: 'set',
					name: 'colsRef',
					newVal: cols.map(() => createRef<HTMLTableCellElement>()),
				});
				// create the ref for the first element of in tfoot>tr
				// we need this for creating a portal from the table body
				dispatch({
					type: 'set',
					name: 'footerRowFirstElementRef',
					newVal: createRef<HTMLTableCellElement>(),
				});
				// also create the style for every resizeElement
				dispatch({
					type: 'set',
					name: 'resizeStyles',
					newVal: cols.map(() => ({
						background: 'none',
						cursor: 'initial',
					})),
				});
				// only search for saved columns if we are not in the factor_db database.
				// the factor_db database hold changing and unstructured/uploaded data
				// therefore we want the column widths to be the default every time
				if (dataBaseName !== 'factor_db') {
					// check if there are already saved columnsWidths in localStorage
					const savedColumnsWidths = localStorage.getItem(`${tableName}-columnWidths`);
					if (savedColumnsWidths !== null && savedColumnsWidths !== 'NaN') {
						// if so use those
						dispatch({
							type: 'set',
							name: 'columnWidths',
							newVal: savedColumnsWidths.split(',').map((item, index) => (index === 0 ? rowColumnWidth : parseFloat(item))),
						});
					} else {
						// create if there nothing in local Storage
						localStorage.setItem(
							`${tableName}-columnWidths`,
							cols
								.map((_item, index) => (index === 0 ? rowColumnWidth : isNaN(appearances.columnWidth) ? 100 : appearances.columnWidth))
								.join(',')
						);
						dispatch({
							type: 'set',
							name: 'columnWidths',
							newVal: cols.map((_item, index) =>
								index === 0 ? rowColumnWidth : isNaN(appearances.columnWidth) ? 100 : appearances.columnWidth
							),
						});
					}
				} else {
					// set the width of every column to be the default width set in the settings
					// unless it's the fist column (row column)
					dispatch({
						type: 'set',
						name: 'columnWidths',
						newVal: data.startingColumns.map((_value, index) => (index === 0 ? rowColumnWidth : appearances.columnWidth)),
					});
				}
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
				// now every tableState has been set and we can tell everyone we have started
				dispatch({
					type: 'set',
					name: 'hasStarted',
					newVal: true,
				});
				dispatch({
					type: 'set',
					name: 'update',
					newVal: false,
				});
				if (updateHook !== undefined) {
					updateHook.setUpdate(false);
				}
				break;
			case 'error':
				notify({ title: general.language === 'deutsch' ? 'Ein Fehler ist aufgetreten' : 'An error occurred', body: eventData.data as string})
				break;
			case 'success':
				notify({ title: general.language === 'deutsch' ? 'Action erfolgreich' : 'Action successful', body: eventData.data as string, silent: true})
				break;
			default:
				break;
		}
	};

	// memorize the table scrollBar color
	const tableScrollBarColor = useMemo(() => {
		if (appearances.colorTheme === 'dark') {
			return 'var(--color-dark-3) var(--color-dark-2)';
		}
		if (appearances.colorTheme === 'light') {
			return 'var(--color-light-3) var(--color-light-2)';
		}

		return 'initial';
	}, [appearances.colorTheme]);

	// we only need that function, when the mouse is down
	// so we cache the function and only update if once the isMouseDown value changes
	/** if tableState.isMouseDown turns out to be true dispatch mouseMove with newVal=e.pageX */
	const mouseMoveHandler = useCallback(
		(e: MouseEvent) => {
			if (tableState.isMouseDown) {
				dispatch({
					type: 'mouseMove',
					newVal: e.pageX,
				});
			}
		},
		[tableState.isMouseDown]
	);

	/**
	 *  If we detect the mouse 'lifting' dispatch 'mouseUp'
	 *  resets the resize styles in addition to
	 *	 activeCol: undefined
	 *	 activeBg: undefined
	 *	 cursor: 'initial'
	 *	 userSelect: 'initial'
	 *	 isMouseDown: false
	 *  */
	const mouseUpHandler = useCallback(() => {
		dispatch({
			type: 'mouseUp',
			newVal: tableState.activeBg,
		});
	}, [tableState.activeBg]);

	/**
	 *  composes the style prop of the <table> an memorizes
	 *  disables userSelect and sets the cursor to 'col-resize', while resizing a column
	 * */
	const tableStyle = useMemo(() => {
		return {
			cursor: tableState.cursor,
			userSelect: tableState.userSelect,
		};
	}, [tableState.cursor, tableState.userSelect]);

	/**
	 * handles the contextMenu
	 */
	const mouseDownHandler = (e: MouseEvent) => {
		if (e.button === 2) {
			// if we detect a right-click
			setMenuActive(true);
			setX(e.pageX);
			setY(e.pageY);
		}
		if (menuActive) {
			// if the menu is already active
			if (
				//@ts-expect-error ts does not know about this dom element
				e.target.ariaModal !== 'true'
			) {
				// if the click target does not have the aria-modal prop set to true
				setMenuActive(false);
			}
		}
	};

	// update the Menu Items, on language change
	useEffect(() => {
		setMenuItems([
			{
				component: (
					<>
						<div aria-modal={'true'} className="menuRow">
							<p>{general.language === 'deutsch' ? 'Spalten' : 'Columns'}</p>
							<ChevronRight
								size={solids.icon.size.small}
								strokeWidth={solids.icon.strokeWidth.small}
								color="light-dark(var(--color-dark-1),var(--color-light-1))"
							/>
						</div>
					</>
				),
				subMenu: tableState.allColumns
					.map((item, index) => {
						return {
							component: (
								<>
									<ColumnCheckBox key={`context-checkbox${index}`} index={index} columnName={item} />
								</>
							),
						};
					})
					.toSpliced(0, 1),
			},
			{
				component: (
					<div aria-modal={'true'} className="menuRow">
						<p>{general.language === 'deutsch' ? 'Spalten anordnen' : 'Order columns'}</p>
						<ChevronRight
							size={solids.icon.size.small}
							strokeWidth={solids.icon.strokeWidth.small}
							color="light-dark(var(--color-dark-1),var(--color-light-1))"
						/>
					</div>
				),
				subMenu: [{ component: <ColumnOrderer /> }],
			},
			{
				component: (
					<>
						<div aria-modal="true" className="menuRow">
							<p>{general.language === 'deutsch' ? 'Spaltenbreite zurücksetzen' : 'Reset column widths'}</p>
						</div>
					</>
				),
				action: () => {
					dispatch({
						type: 'set',
						name: 'columnWidths',
						newVal: tableState.allColumns.map((_v, index) => (index !== 0 ? appearances.columnWidth : rowColumnWidth)),
					});
				},
			},
		]);
	}, [general.language, tableState.allColumns, tableName]);

	return (
		<>
			<TableContext.Provider value={tableState}>
				<TableDispatchContext.Provider value={dispatch}>
					<div tabIndex={-1} className="tableWrapper">
						<div
							className="tableElement"
							style={{
								scrollbarColor: tableScrollBarColor,
							}}
							ref={wrapperRef}
							onMouseDown={mouseDownHandler}
							onMouseMove={mouseMoveHandler}
							onMouseUp={mouseUpHandler}>
							<table style={tableStyle}>
								<TableHeadDisplay />
								<TableBodyDisplay ref={tableBodyRef} />
								<TableFootDisplay />
							</table>
						</div>
					</div>
					<ContextMenu active={menuActive} items={menuItems} tree={[null]} x={x} y={y} ref={menuRef} />
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
|		|-tableState.columns (can use localStorage)
|		|-tableState.allColumns (can use localStorage)
|		|-tableState.colsRef
|		|-tableState.resizeStyles
|		|-tableState.columnWidths
|		|-tableState.rows
|		|-tableState.lastReceived
|		|-tableState.hasStarted
|
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
 */
