import React from 'react';
import type { ResizeElementProps } from '@renderer/util/types/comps/Table/ResizeElementProps';

export function ResizeElement({
	tableHeight,
	...props
}: ResizeElementProps): React.JSX.Element {
	return (
		<div
			{...props}
			style={{ height: tableHeight, ...props.style }}
			className="resizeElement"></div>
	);
}
