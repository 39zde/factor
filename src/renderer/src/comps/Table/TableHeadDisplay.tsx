import React, { useContext } from 'react';

import { TableHead } from './TableHead';
import { TableContext } from './Table';

export function TableHeadDisplay(): React.JSX.Element {
	const { columns, update } = useContext(TableContext);
	switch (update) {
		case true:
			return <></>;
		case false:
		case undefined:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableHead />;
				}
			}
			return <></>;
		default:
			return <></>;
	}
}
