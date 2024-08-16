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
						<TableCellWrapper key={`col${index}${uniqueParentKey}`}>
							<TableCell
								parentKey={`col${index}${uniqueParentKey}`}
								contents={items[col]}
							/>
						</TableCellWrapper>
					</>
				);
			})}
		</>
	);
}

function TableCell({
	contents,
}: {
	parentKey: string;
	contents:
		| string
		| string[]
		| object
		| object[]
		| number
		| number[]
		| boolean;
}): React.JSX.Element {
	if (Array.isArray(contents)) {
		return (
			<>
				<ul className="TableCellList">
					{contents.map((content, index) => {
						if (typeof content === 'object') {
							return <></>;
						} else {
							return <></>;
						}
					})}
				</ul>
			</>
		);
	} else {
		switch (typeof contents) {
			case 'object':
				return <></>;
			case 'number':
				return <></>;
			case 'boolean':
				return <></>;
			case 'string':
				return <></>;
			default:
				return <></>;
		}
	}
}

function TableCellWrapper({
	children,
}: {
	key?: string;
	children: React.JSX.Element;
}): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			<td
				style={{
					maxHeight: appearances.rowHeight,
					height: appearances.rowHeight,
				}}>
				<span className="guts">{children}</span>
			</td>
		</>
	);
}
