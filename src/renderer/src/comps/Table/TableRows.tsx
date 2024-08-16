import React from 'react';
import type { TableRowProps } from '@renderer/util/types/comps/Table/TableRowProps';
import { RowItems } from './RowItems';

export function TableRows({
	table,
	rowHeight,
	uniqueKey,
}: TableRowProps): React.JSX.Element {
	return (
		<>
			{table.map((item, index) => {
				const uni = `td-${item[uniqueKey]}-${index}`;
				return (
					<>
						<tr
							style={{
								height: rowHeight,
								maxHeight: rowHeight,
								minHeight: rowHeight,
							}}
							key={`tr-${item[uniqueKey]}`}>
							<RowItems
								key={uni}
								items={item}
								colIndex={index}
								uniqueParentKey={uni}
							/>
						</tr>
					</>
				);
			})}
		</>
	);
}
