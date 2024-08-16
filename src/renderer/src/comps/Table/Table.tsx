import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	MouseEvent,
	WheelEvent,
	useContext,
	useMemo,
	useId,
} from 'react';
import { Table as TableType } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppContext } from '@renderer/App';
import { WindowContext } from '../WindowContext';
import './Table.css';
import { TableHead } from './TableHead';
import { TableFoot } from './TableFoot';
import { TableRows } from './TableRows';

import { ArrowDown, ArrowUp } from 'lucide-react';

export function Table({
	tableName,
	colsHook,
	entriesHook,
	updateHook,
	uniqueKey,
}: {
	tableName: string;
	colsHook?: { cols: Array<string>; setCols: Function };
	entriesHook?: { entries: number; setEntries: Function };
	updateHook?: { update: boolean; setUpdate: Function };
	uniqueKey: string;
}): React.JSX.Element {
	const { clientHeight } = useContext(WindowContext);
	const { database, appearances } = useContext(AppContext);
	const tableBodyRef = useRef<HTMLTableSectionElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const [scope, setScope] = useState<number>(0);
	const [start, setStart] = useState<number>(0);
	const [count, setCount] = useState<number>();
	const [cursorX, setCursorX] = useState<number>(0);
	const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
	const [columns, setColumns] = useState<Array<string>>();
	const [dbTable, setDBTable] = useState<TableType<any, any, any>>();
	const [minWidths, setMinWidths] = useState<Array<number>>([]);
	const [cursor, setCursor] = useState<'col-resize' | 'initial'>('initial');
	const [userSelect, setUserSelect] = useState<'none' | 'initial'>('initial');
	const [sortingDirection, setSortingDirection] = useState<
		'asc' | 'dsc' | undefined
	>(undefined);
	const [sortingCol, setSortingCol] = useState<string | undefined>(undefined);
	const [sortable, setSortable] = useState<Array<string>>([]);

	const table = useLiveQuery(
		() => {
			console.log(scope);
			// console.log(start,scope,clientHeight,dbTable,columns)
			if (updateHook !== undefined) {
				// is there an update signal to listen to?
				if (updateHook.update === true) {
					// if so, what to do when updating
					return []; // don't show any rows
				}
			}
			if (
				dbTable !== undefined &&
				columns !== undefined &&
				Number.isNaN(scope) === false
			) {
				return dbTable
					.where(columns[0])
					.aboveOrEqual(start)
					.limit(scope)
					.toArray();
			} else {
				return [];
			}
		},
		[
			start,
			scope,
			clientHeight,
			dbTable,
			columns,
			updateHook?.update,
			sortingCol,
		],
		[]
	);

	useMemo(() => {
		if (colsHook !== undefined) {
			// if controlled by a parent take the provided value
			setColumns(colsHook.cols);
		}
		if (entriesHook !== undefined) {
			// if controlled by a parent take the provided value
			setCount(entriesHook.entries);
		}
		async function getTable() {
			try {
				const open = await database.database.open();
				for (const table of open.tables) {
					if (table.name === tableName) {
						const sortableCols: Array<string> = [];
						sortableCols.push(table.schema.primKey.name);
						for (const index of table.schema.indexes) {
							sortableCols.push(index.name);
						}
						// console.log(sortableCols);
						setSortable(sortableCols);

						if (entriesHook === undefined) {
							const tableLength = await table.count();
							setCount(tableLength);
						}
						if (colsHook === undefined) {
							const first = await table.get(1);
							setColumns(Object.keys(first));
						}
						setDBTable(table);
					}
				}
			} catch (e) {
				console.log(e);
			}
			return null;
		}
		getTable();
	}, [tableName, colsHook?.cols, entriesHook?.entries]);

	// get table length once at the beginning update ,wehen the window is being resized
	useEffect(() => {
		if (wrapperRef.current !== null) {
			const wrapperHeight =
				wrapperRef.current?.getBoundingClientRect().height;
			if (wrapperHeight !== undefined) {
				const rowCount = Math.round(wrapperHeight) / appearances.rowHeight;
				// console.log({clientHeight: clientHeight, wrapperHeight: wrapperHeight, rowCount: parseInt(rowCount.toString().split(".")[0])})
				setScope(parseInt(rowCount.toString().split('.')[0]) - 2);
			} else {
				setScope(0);
			}
		}
	}, [clientHeight]);

	const mouseDownHook = {
		value: isMouseDown,
		setValue: (newValue: boolean) => {
			if (typeof newValue === 'boolean') {
				setCursor('col-resize');
				setUserSelect('none');
				setIsMouseDown(newValue);
			}
		},
	};

	const mouseMoveHandler = useCallback(
		(e: MouseEvent) => {
			if (isMouseDown === true) {
				setCursorX(e.pageX);
				// console.log(e);
			}
		},
		[isMouseDown]
	);

	const mouseUpHandler = (): void => {
		setCursor('initial');
		setUserSelect('initial');
		setIsMouseDown(false);
	};

	const getMinWidths = () => {
		if (tableBodyRef.current?.children[0].childNodes !== undefined) {
			const colWidths: number[] = [];
			for (const td of tableBodyRef.current?.children[0].children) {
				const width = td.getBoundingClientRect().width;
				colWidths.push(width + 25);
			}
			setMinWidths(colWidths);
		}
	};

	const scrollHandler = (e: WheelEvent): void => {
		if (minWidths.length === 0) {
			getMinWidths();
		}
		if (e.shiftKey === true || count === undefined) {
			return;
		}
		if (e.deltaY > 0) {
			// scroll down
			if (start < count) {
				setStart((value) =>
					Math.max(Math.min(value + 2, count - scope + 2), 1)
				);
			}
		} else if (e.deltaY < 0) {
			// scroll up
			setStart((value) => value - 2);
		} else {
		}
	};

	const sortingHook = {
		sortingCol: sortingCol,
		sortingDirection: sortingDirection,
		setSortingCol: (newVal: string) => {
			setSortingCol(newVal);
		},
		setSortingDirection: (newVal: 'asc' | 'dsc' | undefined) => {
			setSortingDirection(newVal);
		},
		sortable: sortable,
	};

	return (
		<>
			<div tabIndex={-1} className="tableWrapper">
				<div
					className="tableElement"
					ref={wrapperRef}
					onMouseMove={mouseMoveHandler}
					onMouseUp={mouseUpHandler}
				>
					<table
						style={{
							cursor: cursor,
							userSelect: userSelect,
						}}
					>
						<TableHeadDisplay
							columns={columns}
							cursorX={cursorX}
							minWidths={minWidths}
							mouseDownHook={mouseDownHook}
							scope={scope}
							rowHeight={appearances.rowHeight}
							update={updateHook?.update}
							sortingHook={sortingHook}
							arrow={(): React.JSX.Element => {
								if (sortingDirection === 'asc') {
									return (
										<ArrowUp
											size={18}
											color="white"
											strokeWidth={2}
										/>
									);
								} else if (sortingDirection === 'dsc') {
									return (
										<ArrowDown
											size={18}
											color="white"
											strokeWidth={2}
										/>
									);
								} else {
									return <></>;
								}
							}}
						/>
						<TableBodyDisplay
							uniqueKey={uniqueKey}
							table={table}
							tableBodyRef={tableBodyRef}
							count={count}
							dbTable={dbTable}
							scrollHandler={scrollHandler}
						/>

						<TableFootDisplay
							columns={columns}
							update={updateHook?.update}
						/>
					</table>
				</div>
			</div>
		</>
	);
}

function TableHeadDisplay({
	columns,
	update,
	scope,
	cursorX,
	rowHeight,
	mouseDownHook,
	minWidths,
	arrow,
	sortingHook,
}: {
	columns: Array<string> | undefined;
	update: boolean | undefined;
	scope: number;
	cursorX: number;
	rowHeight: number;
	mouseDownHook: {
		value: boolean;
		setValue: Function;
	};
	minWidths: number[] | null;
	arrow: () => React.JSX.Element;
	sortingHook: {
		sortingCol: string | undefined;
		sortingDirection: 'asc' | 'dsc' | undefined;
		setSortingDirection: Function;
		setSortingCol: Function;
		sortable: Array<string>;
	};
}) {
	switch (update) {
		case undefined:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return (
						<TableHead
							columns={columns}
							resizeElemHeight={(scope + 2) * rowHeight}
							cursorX={cursorX}
							mouseHook={mouseDownHook}
							minWidths={minWidths}
							arrow={arrow()}
							sortingHook={sortingHook}
						/>
					);
				}
			}
			return <></>;
		case true:
			return <></>;
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return (
						<TableHead
							key={useId() + useId()}
							columns={columns}
							resizeElemHeight={(scope + 2) * rowHeight}
							cursorX={cursorX}
							mouseHook={mouseDownHook}
							minWidths={minWidths}
							arrow={arrow()}
							sortingHook={sortingHook}
						/>
					);
				}
			}
			return <></>;
		default:
			return <></>;
	}
}

function TableFootDisplay({
	columns,
	update,
	key,
}: {
	columns: Array<string> | undefined;
	update: boolean | undefined;
	key?: string;
}) {
	switch (update) {
		case undefined:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableFoot columns={columns} />;
				}
			}
			return <></>;
		case true:
			return <></>;
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableFoot columns={columns} />;
				}
			}
			return <></>;
		default:
			return <></>;
	}
}

function TableBodyDisplay({
	tableBodyRef,
	scrollHandler,
	table,
	dbTable,
	count,
	uniqueKey,
}: {
	tableBodyRef: React.RefObject<HTMLTableSectionElement>;
	scrollHandler: (e: WheelEvent) => void;
	table: any[] | never[];
	dbTable: TableType<any, any, any> | undefined;
	count: number | undefined;
	uniqueKey: string;
}): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				onWheel={scrollHandler}
			>
				{table !== undefined &&
				dbTable !== undefined &&
				count !== undefined ? (
					<>
						<TableRows
							uniqueKey={uniqueKey}
							table={table}
							rowHeight={appearances.rowHeight}
							rowCount={count}
						/>
					</>
				) : (
					<></>
				)}
			</tbody>
		</>
	);
}
