import React, {
	useState,
	useEffect,
	useRef,
	MouseEvent,
	useContext,
	useMemo,
	memo,
	createContext,
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
} from '@util/types/types';
import type { Table as TableType } from 'dexie';

export const TableContext = createContext<TableContextType>({
	tableName: '',
	uniqueKey: '',
	scope: 0,
	setScope: (newVal: number): void => {},
	count: 0,
	setCount: (newVal: number): void => {},
	isMouseDown: false,
	setIsMouseDown: (newVal: boolean): void => {},
	columns: [],
	setColumns: (newVal: string[]): void => {},
	dbTable: undefined,
	cursor: 'initial',
	setCursor: (newVal: 'initial' | 'col-resize'): void => {},
	cursorX: 0,
	setCursorX: (newVal: number): void => {},
	userSelect: 'initial',
	setUserSelect: (newVal: 'none' | 'initial'): void => {},
	update: false,
	setUpdate: (newVal: boolean): void => {},
});

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
	const [scope, setScope] = useState<number>(0);
	const start = useRef<number>(0);
	const [count, setCount] = useState<number>(0);
	const [cursorX, setCursorX] = useState<number>(0);
	const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
	const [columns, setColumns] = useState<string[]>([]);
	//@ts-ignore allowing type of any,any,any to not be restricted of what tables can be used
	const [dbTable, setDBTable] = useState<TableType<any, any, any>>();
	const [cursor, setCursor] = useState<'col-resize' | 'initial'>('initial');
	const [userSelect, setUserSelect] = useState<'none' | 'initial'>('initial');
	const [TableContextValue] = useState<TableContextType>({
		tableName: tableName,
		uniqueKey: uniqueKey,
		scope: scope,
		setScope: (newVal: number): void => {
			setScope(newVal);
		},
		count: count,
		setCount: (newVal: number): void => {
			setCount(newVal);
		},
		isMouseDown: false,
		setIsMouseDown: (newVal: boolean): void => {
			if (typeof newVal === 'boolean') {
				setCursor('col-resize');
				setUserSelect('none');
				setIsMouseDown(newVal);
			}
		},
		columns: columns,
		setColumns: (newVal: string[]): void => {
			setColumns(newVal);
		},
		dbTable: dbTable,
		cursor: cursor,
		setCursor: (newVal: 'initial' | 'col-resize'): void => {
			setCursor(newVal);
		},
		cursorX: cursorX,
		setCursorX: (newVal: number): void => {
			setCursorX(newVal);
		},
		userSelect: userSelect,
		setUserSelect: (newVal: 'none' | 'initial'): void => {
			setUserSelect(newVal);
		},
		update: updateHook?.update,
		setUpdate: (newVal: boolean): void => {
			if (updateHook !== undefined) {
				updateHook.setUpdate(newVal);
			}
		},
	});

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
				let scrollBarHeight: number = 5;
				const rowCount =
					Math.round(wrapperHeight - scrollBarHeight) /
					appearances.rowHeight;
				// console.log({clientHeight: clientHeight, wrapperHeight: wrapperHeight, rowCount: parseInt(rowCount.toString().split(".")[0])})
				let newScope = parseInt(rowCount.toString().split('.')[0]);
				if (newScope > 2 && newScope < 15) {
					setScope(parseInt(rowCount.toString().split('.')[0]) - 2);
				} else if (newScope >= 15) {
					setScope(parseInt(rowCount.toString().split('.')[0]) - 3);
				} else {
					setScope(2);
				}
			} else {
				setScope(0);
			}
		}
	}, [clientHeight, appearances.rowHeight]);


	const mouseMoveHandler = (e: MouseEvent) => {
		if (isMouseDown === true) {
			setCursorX(e.pageX);
			// console.log(e);
		}
	};

	const mouseUpHandler = (): void => {
		setCursor('initial');
		setUserSelect('initial');
		setIsMouseDown(false);
	};
	const TableFootDisplayMemo = memo(
		({ columns, update }: TableFootDisplayProps) => {
			return <TableFootDisplay columns={columns} update={update} />;
		}
	);

	return (
		<>
			<TableContext.Provider value={TableContextValue}>
				<div tabIndex={-1} className="tableWrapper">
					<div
						className="tableElement"
						ref={wrapperRef}
						onMouseMove={mouseMoveHandler}
						onMouseUp={mouseUpHandler}>
						<table
							style={{
								cursor: cursor,
								userSelect: userSelect,
							}}>
							<TableHeadDisplay />
							<TableBodyDisplay
								uniqueKey={uniqueKey}
								tableName={tableName}
								updateHook={updateHook}
								scope={scope}
								tableBodyRef={tableBodyRef}
								count={count}
								start={start}
							/>

							<TableFootDisplayMemo
								columns={columns}
								update={updateHook?.update}
							/>
						</table>
					</div>
				</div>
			</TableContext.Provider>
		</>
	);
}
