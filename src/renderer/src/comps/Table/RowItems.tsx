import React from 'react';
import { useAppContext } from '@renderer/App';
import type { TableRowItemProps } from '@renderer/util/types/comps/Table/TableRowItemProps';
import { useTableContext } from './Table';
import { NestedTableCell } from './NestedTableCell';

export function RowItems({ items, uniqueParentKey }: TableRowItemProps): React.JSX.Element {
	const tableState = useTableContext();
	return (
		<>
			{tableState.allColumns.map((columnName, index) => {
				if (tableState.columns.includes(columnName)) {
					return (
						<>
							<TableCellWrapper key={`col${index}${uniqueParentKey}`}>
								<TableCell parentKey={`col${index}${uniqueParentKey}`} contents={items[columnName]} columnName={columnName} />
							</TableCellWrapper>
						</>
					);
				} else {
					return <></>;
				}
			})}
		</>
	);
}

function TableCell({
	contents,
	columnName,
}: {
	parentKey: string;
	contents: string | object | object[] | number | boolean;
	columnName: string;
}): React.JSX.Element {
	if (Array.isArray(contents)) {
		return <NestedTableCell columnName={columnName} data={contents} />;
	} else {
		switch (typeof contents) {
			case 'object':
				switch (contents.constructor.name) {
					case 'Date':
						return <>{(contents as Date).toLocaleDateString()}</>;
					case 'Object':
						return <>Company</>;
				}
				return <></>;
			case 'number':
				return <>{contents}</>;
			case 'boolean':
				return <>{contents}</>;
			case 'string':
				if (columnName === 'website') {
					return <NestedTableCell columnName={columnName} data={[contents]} />;
				}
				return <>{contents}</>;
			default:
				return <></>;
		}
	}
}

function TableCellWrapper({ children }: { key?: string; children: React.JSX.Element | string }): React.JSX.Element {
	const { appearances } = useAppContext();
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
