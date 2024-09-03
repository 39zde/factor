import React from 'react';
import { RowItems } from './RowItems';
import { useTableContext } from './Table';
import { useAppContext } from '@renderer/App';
export function TableRows(): React.JSX.Element {
	const tableState = useTableContext();
	const { appearances } = useAppContext();
	return (
		<>
			{tableState.rows.length === 0 ? (
				<>
					{new Array(tableState.scope).fill('').map((_item, index) => {
						const uni = `row${index}keyDefault${index}`;

						return (
							<>
								<tr
									style={{
										maxHeight: appearances.rowHeight,
										minHeight: appearances.rowHeight,
										height: appearances.rowHeight,
										overflow: 'hidden',
									}}
									key={uni}>
									<td>{index + 1}</td>
									<td colSpan={100}> loading...</td>
								</tr>
							</>
						);
					})}
				</>
			) : (
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
										overflow: 'hidden',
									}}
									key={uni}>
									<RowItems key={`i-${uni}`} items={item} colIndex={index} uniqueParentKey={uni} />
								</tr>
							</>
						);
					})}
				</>
			)}
		</>
	);
}
