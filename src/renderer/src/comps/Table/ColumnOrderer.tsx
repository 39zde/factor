import React, { useEffect, useState } from 'react';
import { useTableContext } from './Table';

export function ColumnOrderer(): React.JSX.Element {
	const { columns } = useTableContext();
	const [draggedElementIndex, setDraggedElementIndex] = useState<number>(-1);

	function mouseUpHandler() {
		setDraggedElementIndex(-1);
	}

	useEffect(() => {
		if (draggedElementIndex > 0) {
			document.addEventListener('mouseup', mouseUpHandler);
		}
		return () => {
			document.removeEventListener('mouseup', mouseUpHandler);
		};
	}, [draggedElementIndex]);

	return (
		<>
			<div
				aria-modal="true"
				style={{
					cursor: draggedElementIndex > 0 ? 'grabbing' : 'grab',
				}}>
				{columns.map((item, index) => {
					if (index !== 0) {
						return (
							<p
								aria-modal="true"
								onMouseDown={() => {
									setDraggedElementIndex(index);
								}}
								style={{
									background:
										draggedElementIndex === index
											? 'light-dark(var(--color-light-3),var(--color-dark-3))'
											: 'none',
									userSelect: 'none',
									padding: '0 0 0 6px',
								}}
								key={`column-orderer-${index}`}>
								{item}
							</p>
						);
					}
				})}
			</div>
		</>
	);
}
