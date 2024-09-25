import React, { memo } from 'react';
// non-lib imports
import { useTableDispatch } from './Table';
import { ResizeElement } from './ResizeElement';
import { ColumnTitle } from './ColumnTitle';

export const TableHead = memo(function TableHead({
	rowHeight,
	columns,
	allColumns,
	tableName,
	columnWidths,
	colsRef,
	nativeColumnNames,
	isMouseDown,
}: {
	rowHeight: number;
	columns: string[];
	allColumns: string[];
	tableName: string;
	columnWidths: number[];
	colsRef: React.RefObject<HTMLTableCellElement>[] | null;
	nativeColumnNames: boolean;
	isMouseDown: boolean;
}): React.JSX.Element {
	const dispatch = useTableDispatch();

	return (
		<>
			<thead
				style={{
					height: rowHeight,
					maxHeight: rowHeight,
					minHeight: rowHeight,
				}}>
				<tr
					key={`tableHeadRow-${tableName}`}
					style={{
						height: rowHeight,
						maxHeight: rowHeight,
						minHeight: rowHeight,
					}}>
					{allColumns.map((item, index) => {
						if (columns.includes(item)) {
							return (
								<th
									style={{
										height: rowHeight,
										maxHeight: rowHeight,
										minHeight: rowHeight,
										minWidth: columnWidths[index],
										maxWidth: columnWidths[index],
										width: columnWidths[index],
									}}
									// @ts-expect-error we accept the ref might be null
									ref={colsRef[index]}
									key={`thead-tr-th${index}`}>
									<span className="guts">{index !== 0 ? nativeColumnNames ? <>{item}</> : <ColumnTitle column={item} /> : ''}</span>
									{index !== 0 ? (
										<ResizeElement
											index={index}
											onMouseEnter={() =>
												dispatch({
													type: 'mouseEnter',
													newVal: index,
												})
											}
											onMouseLeave={() => {
												if (!isMouseDown) {
													dispatch({
														type: 'mouseLeave',
														newVal: index,
													});
												}
											}}
											key={`rz-${index}-${allColumns[index]}`}
											onMouseDown={() => {
												dispatch({
													type: 'mouseDown',
													newVal: index,
												});
											}}
										/>
									) : (
										<></>
									)}
								</th>
							);
						}
					})}
				</tr>
			</thead>
		</>
	);
});
