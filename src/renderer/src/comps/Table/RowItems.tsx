import React, { useContext, useId } from 'react';
import { AppContext } from '@renderer/App';
import type { TableRowItemProps } from '@util/types/table/TableRowItemProps';
export function RowItems({ items }: TableRowItemProps): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			{Object.keys(items).map((col) => {
				return (
					<>
						<td
							style={{
								maxHeight: appearances.rowHeight,
								height: appearances.rowHeight,
							}}
							key={useId() + useId() + useId()}
						>
							{items[col]}
						</td>
					</>
				);
			})}
		</>
	);
}
