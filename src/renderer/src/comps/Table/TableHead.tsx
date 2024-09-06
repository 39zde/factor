import React, { useEffect, useState } from 'react';
import { ResizeElement } from './ResizeElement';
import { useAppContext } from '@renderer/App';
import { useTableContext, useTableDispatch } from './Table';

export function TableHead(): React.JSX.Element {
	const { appearances } = useAppContext();
	const [tableColumns, setTableColumns] = useState<string[]>([]);
	const tableState = useTableContext();
	const dispatch = useTableDispatch();

	useEffect(() => {
		setTableColumns(tableState.columns);
	}, [tableState.columns]);

	return (
		<>
			<thead
				style={{
					height: appearances.rowHeight,
					maxHeight: appearances.rowHeight,
					minHeight: appearances.rowHeight,
				}}>
				<tr
					key={`tableHeadRow-${tableState.tableName}`}
					style={{
						height: appearances.rowHeight,
						maxHeight: appearances.rowHeight,
						minHeight: appearances.rowHeight,
					}}>
					{tableState.allColumns.map((item, index) => {
						if (tableColumns.includes(item)) {
							return (
								<>
									<th
										style={{
											height: appearances.rowHeight,
											maxHeight: appearances.rowHeight,
											minHeight: appearances.rowHeight,
											minWidth: tableState.columnWidths[index],
											maxWidth: tableState.columnWidths[index],
											width: tableState.columnWidths[index],
										}}
										// @ts-expect-error we accept the ref might be null
										ref={tableState.colsRef[index]}
										key={`thead-tr-th${index}`}>
										<span className="guts">{index !== 0 ? item : ''}</span>
										{index !== 0 ? (
											<>
												<ResizeElement
													index={index}
													onMouseEnter={() =>
														dispatch({
															type: 'mouseEnter',
															newVal: index,
														})
													}
													onMouseLeave={() => {
														if (!tableState.isMouseDown) {
															dispatch({
																type: 'mouseLeave',
																newVal: index,
															});
														}
													}}
													key={`rz-${index}-${tableState.allColumns[index]}`}
													onMouseDown={() => {
														dispatch({
															type: 'mouseDown',
															newVal: index,
														});
													}}
												/>
											</>
										) : (
											<></>
										)}
									</th>
								</>
							);
						}
					})}
				</tr>
			</thead>
		</>
	);
}
