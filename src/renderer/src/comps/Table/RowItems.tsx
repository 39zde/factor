import React, { useContext, ReactElement, JSXElementConstructor } from 'react';
import { AppContext } from '@renderer/App';
import type { TableRowItemProps } from '@renderer/util/types/comps/Table/TableRowItemProps';
export function RowItems({
	items,
	uniqueParentKey,
}: TableRowItemProps): React.JSX.Element {
	return (
		<>
			{Object.keys(items).map((col, index) => {
				return (
					<>
						<TableCell key={`col${index}${uniqueParentKey}`}>
							<span className="guts">{items[col]}</span>
						</TableCell>
					</>
				);
			})}
		</>
	);
}

function TableCell({
	children,
}: {
	key: string;
	children: ReactElement<
		{ className: string },
		JSXElementConstructor<HTMLSpanElement>
	>;
}): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			<td
				style={{
					maxHeight: appearances.rowHeight,
					height: appearances.rowHeight,
				}}>
				{children}
			</td>
		</>
	);
}
