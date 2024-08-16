import React, { useContext } from 'react';
import { RowItems } from './RowItems';
import { useTableContext } from './Table';
import { AppContext } from '@renderer/App';
export function TableRows(): React.JSX.Element {
	const tableState = useTableContext();
	const { appearances} = useContext(AppContext)
	return (
		<>
			{tableState.rows.map((item, index) => {
				const uni = `row${index}key${item[tableState.uniqueKey]}`;
				return (
					<>
						<tr
							style={{
								maxHeight: appearances.rowHeight,
								minHeight: appearances.rowHeight,
								height: appearances.rowHeight,
								overflow: "hidden"
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
