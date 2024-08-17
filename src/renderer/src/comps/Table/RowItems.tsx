import React, { useContext } from 'react';
import { AppContext } from '@renderer/App';
import type { TableRowItemProps } from '@renderer/util/types/comps/Table/TableRowItemProps';
import { useTableContext } from './Table';

export function RowItems({
	items,
	uniqueParentKey,
}: TableRowItemProps): React.JSX.Element {
	const tableState = useTableContext();
	return (
		<>
			{tableState.columns.map((columnName, index) => {
				return (
					<>
						<TableCellWrapper key={`col${index}${uniqueParentKey}`}>
							<TableCell
								parentKey={`col${index}${uniqueParentKey}`}
								contents={items[columnName]}
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
				{/* <ul className="TableCellList">
					{contents.map((content) => {
						if (typeof content === 'object') {
							return <></>;
						} else {
							return <></>;
						}
					})}
				</ul> */}
			</>
		);
	} else {
		switch (typeof contents) {
			case 'object':
				return <></>;
			case 'number':
				return <>{contents}</>;
			case 'boolean':
				return <>{contents}</>;
			case 'string':
				return <>{contents}</>;
			default:
				return <>[default]</>;
		}
	}
}

function TableCellWrapper({
	children,
}: {
	key?: string;
	children: React.JSX.Element | string;
}): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			<td
				style={{
					maxHeight: appearances.rowHeight,
					height: appearances.rowHeight,
					minHeight: appearances.rowHeight,
				}}>
				<span className="guts">{children}</span>
			</td>
		</>
	);
}
