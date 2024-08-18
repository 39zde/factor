import React from 'react';

import { TableFoot } from './TableFoot';

import type { TableFootDisplayProps } from '@renderer/util/types/types';

export function TableFootDisplay({
	columns,
	update,
}: TableFootDisplayProps): React.JSX.Element {
	switch (update) {
		case undefined:
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return <TableFoot key={'TableFoot'} columns={columns} />;
				}
			}
			return <></>;
		case true:
		default:
			return <></>;
	}
}
