import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTableContext, useTableDispatch } from './Table';

export function ColumnOrderer(): React.JSX.Element {
	const { columns, allColumns, colsRef, columnWidths } = useTableContext();
	const dispatch = useTableDispatch();
	const [draggedElementIndex, setDraggedElementIndex] = useState<number>(-1);
	const [dragIndicatorIndex, setDragIndicatorIndex] = useState<number>(-1);
	const lastDragIndicatorIndex = useRef<number>(-1);
	const elementRef = useRef<HTMLDivElement>(null);
	const [useUpper, setUseUpper] = useState<boolean>(true);

	const mouseUpHandler = () => {
		let cols = allColumns.toSpliced(draggedElementIndex, 1);
		let colWidths = columnWidths;
		let colWidth = colWidths.splice(draggedElementIndex, 1);
		let colsRefCopy = colsRef;
		let colsRefElement: React.RefObject<HTMLTableCellElement> | undefined;
		if (colsRefCopy !== null) {
			colsRefElement = colsRefCopy.splice(draggedElementIndex, 1)[0];
		}
		if (useUpper) {
			cols.splice(lastDragIndicatorIndex.current !== 0 ? lastDragIndicatorIndex.current : 1, 0, allColumns[draggedElementIndex]);
			colWidths.splice(lastDragIndicatorIndex.current !== 0 ? lastDragIndicatorIndex.current : 1, 0, colWidth[0]);
			if (colsRefCopy !== null && colsRefElement !== undefined) {
				colsRefCopy.splice(lastDragIndicatorIndex.current !== 0 ? lastDragIndicatorIndex.current : 1, 0, colsRefElement);
			}
		} else {
			cols.splice(lastDragIndicatorIndex.current + 1, 0, allColumns[draggedElementIndex]);
			colWidths.splice(lastDragIndicatorIndex.current !== 0 ? lastDragIndicatorIndex.current + 1 : 1, 0, colWidth[0]);
			if (colsRefCopy !== null && colsRefElement !== undefined) {
				colsRefCopy.splice(lastDragIndicatorIndex.current !== 0 ? lastDragIndicatorIndex.current + 1 : 1, 0, colsRefElement);
			}
		}
		dispatch({
			type: 'set',
			name: 'allColumns',
			newVal: cols,
		});
		dispatch({
			type: 'set',
			name: 'colsRef',
			newVal: colsRefCopy,
		});
		dispatch({
			type: 'set',
			name: 'columnWidths',
			newVal: colWidths,
		});
		setDraggedElementIndex(-1);
		setDragIndicatorIndex(-1);
	};

	function mouseMoveHandler(e: MouseEvent) {
		if (elementRef !== null) {
			//@ts-expect-error blah blah
			let indicatorIndex = dragIndicatorIndex - Math.round((elementRef.current?.getBoundingClientRect().y - e.pageY) / 33.5);
			if (indicatorIndex >= 1 && indicatorIndex <= allColumns.length) {
				setDragIndicatorIndex(indicatorIndex);
				lastDragIndicatorIndex.current = indicatorIndex;
			}
			if (indicatorIndex - draggedElementIndex >= 0) {
				setUseUpper(false);
			} else {
				setUseUpper(true);
			}
		}
	}

	useEffect(() => {
		if (draggedElementIndex > 0) {
			document.addEventListener('mouseup', mouseUpHandler);
			document.addEventListener('mousemove', mouseMoveHandler);
		}
		return () => {
			document.removeEventListener('mouseup', mouseUpHandler);
			document.removeEventListener('mousemove', mouseMoveHandler);
		};
	}, [draggedElementIndex]);

	return (
		<>
			<div
				className="columnOrderer"
				aria-modal="true"
				style={{
					cursor: draggedElementIndex > 0 ? 'grabbing' : 'grab',
					width: '100%',
				}}>
				{allColumns.map((item, index) => {
					if (index !== 0) {
						return (
							<>
								{dragIndicatorIndex === index && useUpper ? (
									<>
										<div aria-modal="true" key={`upper-Indicator-${item}`} className="dragIndicator" />
									</>
								) : (
									<>
										<div aria-modal="true" key={`upper-Indicator-${item}`} className="dargIndicatorPlaceholder" />
									</>
								)}
								<div
									ref={index === draggedElementIndex ? elementRef : undefined}
									aria-modal="true"
									onMouseDown={() => {
										setDraggedElementIndex(index);
										setDragIndicatorIndex(index);
									}}
									style={{
										background: draggedElementIndex === index ? 'light-dark(var(--color-light-3),var(--color-dark-3))' : 'none',
									}}
									key={`column-orderer-${index}`}>
									<p
										aria-modal="true"
										style={{
											textDecoration: !columns.includes(item) ? 'line-through' : 'none',
											color: !columns.includes(item) ? 'light-dark(var(--color-dark-3),var(--color-light-3))' : 'inherit',
										}}>
										{item}
									</p>
								</div>
								{dragIndicatorIndex === index + 1 && !useUpper ? (
									<>
										<div aria-modal="true" key={`lower-Indicator-${item}`} className="dragIndicator" />
									</>
								) : (
									<>
										<div aria-modal="true" key={`lower-Indicator-${item}`} className="dargIndicatorPlaceholder" />
									</>
								)}
							</>
						);
					}
				})}
			</div>
		</>
	);
}
