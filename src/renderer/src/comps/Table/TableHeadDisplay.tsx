import React, { useId } from 'react';

import { TableHead } from './TableHead';
import type { TableHeadDisplayProps } from '@util/types/types';

export function TableHeadDisplay({
	columns,
	update,
	scope,
	cursorX,
	rowHeight,
	mouseDownHook,
	minWidths,
	arrow,
	sortingHook,
}: TableHeadDisplayProps): React.JSX.Element {
	switch (update) {
		case undefined:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return (
						<TableHead
							columns={columns}
							resizeElemHeight={(scope + 2) * rowHeight}
							cursorX={cursorX}
							mouseHook={mouseDownHook}
							minWidths={minWidths}
							arrow={arrow()}
							sortingHook={sortingHook}
						/>
					);
				}
			}
			return <></>;
		case true:
			return <></>;
		case false:
			if (columns !== undefined) {
				if (columns.length !== 0) {
					return (
						<TableHead
							key={useId() + useId()}
							columns={columns}
							resizeElemHeight={(scope + 2) * rowHeight}
							cursorX={cursorX}
							mouseHook={mouseDownHook}
							minWidths={minWidths}
							arrow={arrow()}
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
