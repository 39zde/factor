import React from 'react';
// non-lib imports
import { useTableContext } from './Table';
import type { ResizeElementProps } from '@typings';

export function ResizeElement({ index, ...props }: ResizeElementProps): React.JSX.Element {
	const tableState = useTableContext();
	return (
		<div
			{...props}
			style={{
				height: tableState.resizeElemHeight,
				...tableState.resizeStyles[index],
			}}
			className="resizeElement"></div>
	);
}
