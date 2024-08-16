import {
	useState,
	useEffect,
	useRef,
	createRef,
	useContext,
	useId,
} from 'react';
import type { TableHeadProps } from '@renderer/util/types/comps/Table/TableHeadProps';
import { ResizeElement } from './ResizeElement';
import { AppContext } from '@renderer/App';

export function TableHead({
	columns,
	resizeElemHeight,
	cursorX,
	mouseHook,
	minWidths,
	arrow,
	sortingHook,
}: TableHeadProps) {
	const { appearances } = useContext(AppContext);
	const colRefs = useRef(columns.map(() => createRef<HTMLTableCellElement>()));
	const [activeCol, setActiveCol] = useState<number>(0);
	const [activeBg, setActiveBg] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (mouseHook !== undefined && cursorX !== undefined) {
			if (mouseHook.value === false) {
				// stop adjusting the col width
				setActiveBg(undefined);
			} else if (mouseHook.value === true) {
				//start adjusting the col width

				const currentWidth =
					colRefs.current[activeCol].current?.getBoundingClientRect()
						.width;
				const currentX =
					colRefs.current[activeCol].current?.getBoundingClientRect().left;
				// console.log(colRefs.current[activeCol].current?.getBoundingClientRect());
				if (
					currentWidth !== undefined &&
					currentX !== undefined &&
					cursorX !== null
				) {
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
		}
	}, [mouseHook?.value, cursorX, activeCol]);

	const mouseDownHandler = (e: MouseEvent, index: number) => {
		if (mouseHook !== undefined) {
			// console.log("setting mouse down to true");
			mouseHook.setValue(true);
		}
		// console.log('setting active INdex to ', index);
		setActiveBg(index);
		setActiveCol(index);
		// console.log(e);
	};

	const sortingHandler = (item: string) => {
		if (sortingHook !== undefined) {
			if (sortingHook.sortable.includes(item)) {
				if (sortingHook.sortingCol === item) {
					if (sortingHook.sortingDirection === 'asc') {
						sortingHook.setSortingDirection('dsc');
					} else if (sortingHook.sortingDirection === 'dsc') {
						sortingHook.setSortingDirection(undefined);
						sortingHook.setSortingCol(undefined);
					} else {
						sortingHook.setSortingDirection('asc');
					}
				} else {
					sortingHook.setSortingCol(item);
					sortingHook.setSortingDirection('asc');
				}
			}
		}
	};

	const mouseEnterHandler = (index: number): void => {
		// console.log('setting activeBG to ', index);
		if (mouseHook !== undefined) {
			if (!mouseHook.value) {
				setActiveBg(index);
			}
		}
	};

	const mouseLeaveHandler = () => {
		if (mouseHook.value === false) {
			setActiveBg(undefined);
		}
	};

	return (
		<>
			<thead key={useId()}>
				<tr
					key={useId()}
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
										key={useId()}
										onClick={() => sortingHandler(item)}>
										<span key={useId()} className="guts">
											{item}
											{/* {sortingHook !== undefined &&
											sortingHook.sortingCol === item ? (
												// <>{arrow()}</>
												<></>
											) : (
												<></>
											)} */}
										</span>
										{resizeElemHeight !== undefined &&
										index !== columns.length - 1 ? (
											<>
												<ResizeElement
													onMouseEnter={() =>
														mouseEnterHandler(index)
													}
													onMouseLeave={mouseLeaveHandler}
													key={useId()}
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
						}
					})}
				</tr>
			</thead>
		</>
	);
}
