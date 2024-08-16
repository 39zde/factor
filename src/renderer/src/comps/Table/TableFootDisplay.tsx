import React from 'react';

import { TableFoot } from './TableFoot';

import type { TableFootDisplayProps } from '@util/types/types';

export function TableFootDisplay({
	columns,
	update,
}: TableFootDisplayProps): React.JSX.Element {
	switch (update) {
		case undefined:
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableFoot columns={columns} />;
				}
			}
			return <></>;
		case true:
			return <></>;
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableFoot columns={columns} />;
				}
			}
			return <></>;
		default:
			return <></>;
	}
}
