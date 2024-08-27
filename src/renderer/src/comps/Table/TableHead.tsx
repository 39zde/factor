import React from 'react';
import { ResizeElement } from './ResizeElement';
import { useAppContext } from '@renderer/App';
import { useTableContext, useTableDispatch } from './Table';

export function TableHead(): React.JSX.Element {
	const { appearances } = useAppContext();
	const tableState = useTableContext();
	const dispatch = useTableDispatch();

	return (
		<>
			<thead>
				<tr
					style={{
						height: appearances.rowHeight,
						maxHeight: appearances.rowHeight,
						minHeight: appearances.rowHeight,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{tableState.allColumns.map((item, index) => {
						if (tableState.columns.includes(item)) {
							return (
								<>
									<th
										style={{
											borderTop: 'none',
											minWidth: tableState.columnWidths[index],
											maxWidth: tableState.columnWidths[index],
											width: tableState.columnWidths[index],
										}}
										// @ts-expect-error we accept the ref might be null
										ref={tableState.colsRef[index]}
										key={`thead-tr-th${index}`}>
										<span className="guts">{item}</span>
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
											key={`rz-${index}`}
											onMouseDown={() => {
												dispatch({
													type: 'mouseDown',
													newVal: index,
												});
											}}
										/>
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
