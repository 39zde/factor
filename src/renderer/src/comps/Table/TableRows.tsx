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
				const uni = `row${index}key${item[uniqueKey]}`;
				return (
					<>
						<tr
							style={{
								maxHeight: rowHeight,
								minHeight: rowHeight,
							}}
							key={uni}>
							<RowItems
								key={`i-${uni}`}
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
