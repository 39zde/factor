import { useId, useState, useEffect } from 'react';
import type { TableRowProps } from '@renderer/util/types/comps/Table/TableRowProps';
import { RowItems } from './RowItems';

export function TableRows({
	table,
	rowHeight,
	rowCount,
	uniqueKey,
}: TableRowProps) {
	// const [items, setItems] = useState<Array<object>>([])

	// useEffect(() => {
	//   let rows: Array<object> = []
	//   if (table !== undefined) {
	//     for (let i = 0; i < rowCount; i++) {
	//       rows.push(table[i])
	//     }
	//     setItems(rows)
	//   }
	// }, [rowCount, table, rowHeight])

	return (
		<>
			{table.map((item, index) => {
				const uni: string = `td-${item[uniqueKey]}`;
				return (
					<>
						<tr
							style={{
								height: rowHeight,
								maxHeight: rowHeight,
								minHeight: rowHeight,
							}}
							key={`tr-${item[uniqueKey]}`}
						>
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
