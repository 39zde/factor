import { useState, useEffect, useRef, createRef, useContext } from 'react';
import { ResizeElement } from './ResizeElement';
import { AppContext } from '@renderer/App';
import { TableContext } from './Table';

export function TableHead() {
	const { appearances } = useContext(AppContext);
	const { columns, scope, cursorX, isMouseDown, setIsMouseDown } =
		useContext(TableContext);
	const [resizeElemHeight] = useState<number>(
		4 * scope + (scope + 2) * appearances.rowHeight + 6
	);
	const colRefs = useRef(columns.map(() => createRef<HTMLTableCellElement>()));
	const [activeCol, setActiveCol] = useState<number>(0);
	const [activeBg, setActiveBg] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (isMouseDown === false) {
			// stop adjusting the col width
			setActiveBg(undefined);
		} else if (isMouseDown === true) {
			//start adjusting the col width

			const currentWidth =
				colRefs.current[activeCol].current?.getBoundingClientRect().width;
			const currentX =
				colRefs.current[activeCol].current?.getBoundingClientRect().left;
			// console.log(colRefs.current[activeCol].current?.getBoundingClientRect());
			if (currentWidth !== undefined && currentX !== undefined) {
				const a = currentX;
				const b = cursorX;
				const newWidth = Math.abs(Math.abs(b - a));
				// console.log({
				// 	currentWidth: currentWidth,
				// 	cursor: cursorX,
				// 	currentX: currentX,
				// 	newWidth: newWidth,
				// });

				if (!isNaN(newWidth)) {
					// console.log(offset)
					colRefs.current[activeCol].current?.setAttribute(
						'style',
						'min-width: ' +
							newWidth +
							'px; max-width: ' +
							newWidth +
							'px; border-top: none'
					);
				}
			}
		}
	}, [isMouseDown, cursorX, activeCol]);

	const mouseDownHandler = (e: MouseEvent, index: number) => {
		// console.log("setting mouse down to true");
		setIsMouseDown(true);

		// console.log('setting active INdex to ', index);
		setActiveBg(index);
		setActiveCol(index);
		// console.log(e);
	};

	const mouseEnterHandler = (index: number): void => {
		// console.log('setting activeBG to ', index);

		if (isMouseDown === false) {
			setActiveBg(index);
		}
	};

	const mouseLeaveHandler = () => {
		if (isMouseDown === false) {
			setActiveBg(undefined);
		}
	};

	return (
		<>
			<thead>
				<tr
					style={{
						height: appearances.rowHeight,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}>
					{columns.map((item, index) => {
						if (colRefs !== undefined && resizeElemHeight !== undefined) {
							return (
								<>
									<th
										style={{
											borderTop: 'none',
											borderLeft: index === 0 ? 'none' : 'inherit',
											minWidth: 150,
										}}
										ref={colRefs.current[index]}
										key={`thead-tr-th${index}`}>
										<span className="guts">{item}</span>
										{resizeElemHeight !== undefined &&
										index !== columns.length - 1 ? (
											<>
												<ResizeElement
													onMouseEnter={() =>
														mouseEnterHandler(index)
													}
													onMouseLeave={mouseLeaveHandler}
													key={`rz-${index}`}
													tableHeight={resizeElemHeight}
													onMouseDown={(e: any) =>
														mouseDownHandler(e, index)
													}
													style={{
														background:
															activeBg !== undefined
																? activeBg === index
																	? 'light-dark(var(--color-dark-2),var(--color-light-2))'
																	: 'none'
																: 'none',
														cursor:
															activeBg !== undefined
																? activeBg === index
																	? 'col-resize'
																	: 'initial'
																: 'initial',
													}}
												/>
											</>
										) : (
											<></>
										)}
									</th>
								</>
							);
						} else {
							return (
								<>
									<th key={`thead-tr-th${index}-default`}>
										<span className="guts"></span>
									</th>
								</>
							);
						}
					})}
				</tr>
			</thead>
		</>
	);
}
