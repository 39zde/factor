import React, { useContext } from 'react';

import { TableRows } from './TableRows';

import { AppContext } from '@renderer/App';
import type { TableBodyDisplayProps } from '@util/types/types';

export function TableBodyDisplay({
	tableBodyRef,
	scrollHandler,
	table,
	dbTable,
	count,
	uniqueKey,
}: TableBodyDisplayProps): React.JSX.Element {
	const { appearances } = useContext(AppContext);
	return (
		<>
			<tbody
				className="tableBody"
				ref={tableBodyRef}
				onWheel={scrollHandler}>
				{table !== undefined &&
				dbTable !== undefined &&
				count !== undefined ? (
					<>
						<TableRows
							uniqueKey={uniqueKey}
							table={table}
							rowHeight={appearances.rowHeight}
							rowCount={count}
						/>
					</>
				) : (
					<></>
				)}
			</tbody>
		</>
	);
}
