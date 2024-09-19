import React, { memo } from 'react';
// non-lib imports
import { ColumnTitle } from './ColumnTitle';

/** mostly  a copy of table head without the ability to  resize */
export const TableFoot = memo(function TableFoot({
	rowHeight,
	columns,
	allColumns,
	tableName,
	footerRowFirstElementRef,
	nativeColumnNames,
}: {
	rowHeight: number;
	columns: string[];
	allColumns: string[];
	tableName: string;
	footerRowFirstElementRef: React.RefObject<HTMLTableCellElement> | null;
	nativeColumnNames: boolean;
}): React.JSX.Element {
	return (
		<>
			<tfoot
				style={{
					height: rowHeight,
					maxHeight: rowHeight,
					minHeight: rowHeight,
				}}>
				<tr
					key={`tableFootRow-${tableName}`}
					style={{
						maxHeight: rowHeight,
						height: '100%',
						borderBottom: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{allColumns.map((item, index) => {
						if (columns.includes(item)) {
							return (
								<>
									<th
										style={{
											maxHeight: rowHeight,
										}}
										key={`tfoot-${index}-${item}`}
										ref={index === 0 ? footerRowFirstElementRef : undefined}>
										<span className="guts">{index !== 0 ? nativeColumnNames ? <>{item}</> : <ColumnTitle column={item} /> : ''}</span>
									</th>
								</>
							);
						}
					})}
				</tr>
			</tfoot>
		</>
	);
});
