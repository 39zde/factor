import React from 'react';
import type { ResizeElementProps } from '@util/types/table/ResizeElementProps';

export function ResizeElement({
	tableHeight,
	...props
}: ResizeElementProps): React.JSX.Element {
	return (
		<div
			{...props}
			style={{ height: tableHeight }}
			className="colSlider"
		></div>
	);
}
