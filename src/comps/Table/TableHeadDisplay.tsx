import React from 'react';
// non-lib imports
import { TableHead } from './TableHead';
import { useTableContext } from './Table';

export function TableHeadDisplay(): React.JSX.Element {
	const tableState = useTableContext();
	switch (tableState.update) {
		case true:
			return <></>;
		case false:
		case undefined:
			if (tableState.columns !== undefined) {
				if (tableState.columns.length !== 0) {
					return <TableHead />;
				}
			}
			return <></>;
		default:
			return <></>;
	}
}
