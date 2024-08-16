import React, { useContext } from 'react';

import { AppContext } from '@renderer/App';
import { TableHead } from './TableHead';
import type { TableHeadDisplayProps } from '@util/types/types';

export function TableHeadDisplay({
	columns,
	update,
	scope,
	cursorX,
	mouseDownHook,
	sortingHook,
}: TableHeadDisplayProps): React.JSX.Element {
	const { appearances } = useContext(AppContext);

	switch (update) {
		case true:
			return <></>;
		case false:
		case undefined:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return (
						<TableHead
							columns={columns}
							resizeElemHeight={(scope + 2) * appearances.rowHeight}
							cursorX={cursorX}
							mouseHook={mouseDownHook}
							sortingHook={sortingHook}
						/>
					);
				}
			}
			return <></>;
		default:
			return <></>;
	}
}
