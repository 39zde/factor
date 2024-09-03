import React from 'react';
import type { ResizeElementProps } from '@renderer/util/types/comps/Table/ResizeElementProps';
import { useTableContext } from './Table';

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
