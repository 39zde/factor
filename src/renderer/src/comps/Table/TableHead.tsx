import React, { useContext } from 'react';
import { ResizeElement } from './ResizeElement';
import { AppContext } from '@renderer/App';
import { useTableContext, useTableDispatch } from './Table';

export function TableHead(): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	const tableState = useTableContext();
	const dispatch = useTableDispatch();

	return (
		<>
			<thead>
				<tr
					style={{
						height: appearances.rowHeight,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{tableState.columns.map((item, index) => {
						return (
							<>
								<th
									style={{
										borderTop: 'none',
										borderLeft: index === 0 ? 'none' : 'inherit',
										minWidth: tableState.columnWidths[index],
										maxWidth: tableState.columnWidths[index],
									}}
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
										onMouseLeave={() =>
											dispatch({
												type: 'mouseLeave',
												newVal: index,
											})
										}
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
					})}
				</tr>
			</thead>
		</>
	);
}
