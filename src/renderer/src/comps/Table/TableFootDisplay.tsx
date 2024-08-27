import React from 'react';

import { TableFoot } from './TableFoot';
import { useTableContext } from './Table';

export function TableFootDisplay(): React.JSX.Element {
	const tableState = useTableContext();
	switch (tableState.update) {
		case undefined:
		case false:
			if (tableState.columns !== undefined) {
				if (tableState.columns.length !== 0) {
					return <TableFoot />;
				}
			}
			return <></>;
		case true:
		default:
			return <></>;
	}
}
