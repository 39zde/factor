import React from 'react';
import { useTableContext } from './Table';
import { ColumnTitle } from './ColumnTitle';
import { useAppContext } from '@renderer/App';
/** mostly  a copy of table head without the ability to  resize */
export function TableFoot(): React.JSX.Element {
	const tableState = useTableContext();
	const { appearances } = useAppContext();
	return (
		<>
			<tfoot
				style={{
					height: appearances.rowHeight,
					maxHeight: appearances.rowHeight,
					minHeight: appearances.rowHeight,
				}}>
				<tr
					key={`tableFootRow-${tableState.tableName}`}
					style={{
						maxHeight: appearances.rowHeight,
						height: '100%',
						borderBottom: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{tableState.allColumns.map((item, index) => {
						if (tableState.columns.includes(item)) {
							return (
								<>
									<th
										style={{
											maxHeight: appearances.rowHeight,
										}}
										key={`tfoot-${index}-${item}`}
										ref={index === 0 ? tableState.footerRowFirstElementRef : undefined}>
										<span className="guts">{index !== 0 ? <ColumnTitle column={item} /> : ''}</span>
									</th>
								</>
							);
						}
					})}
				</tr>
			</tfoot>
		</>
	);
}
