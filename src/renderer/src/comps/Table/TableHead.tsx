import {
	useState,
	useEffect,
	useRef,
	createRef,
	useMemo,
	useContext,
	useId,
} from 'react';
import type { TableHeadProps } from '@util/types/table/TableHeadProps';
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
	const { general, appearances } = useContext(AppContext);
	const colRefs = useRef(columns.map(() => createRef<HTMLTableCellElement>()));
	const [activeCol, setActiveCol] = useState<number>(0);

	useEffect(() => {
		if (mouseHook !== undefined && cursorX !== undefined) {
			if (mouseHook.value === false) {
				// stop adjusting the col width
			} else if (mouseHook.value === true) {
				//start adjusting the col width
				if (activeCol !== 0) {
					const currentWidth =
						colRefs.current[activeCol].current?.getBoundingClientRect()
							.width;
					const currentX =
						colRefs.current[activeCol].current?.getBoundingClientRect()
							.left;
					// console.log(colRefs.current[activeCol].current?.getBoundingClientRect());
					if (
						currentWidth !== undefined &&
						currentX !== undefined &&
						cursorX !== null
					) {
						let currentPadding = colRefs.current[
							activeCol
						].current?.style.paddingRight.replace('px', '');
						if (currentPadding !== undefined) {
							if (currentPadding === '') {
								currentPadding = '0';
							}
							const originalWidth =
								currentWidth - parseFloat(currentPadding);
							const a = currentX;
							const b = cursorX;
							const offset = Math.abs(Math.abs(b - a) - originalWidth);
							// console.log({currentWidth: currentWidth,currentX: currentX, currentPadding: currentPadding, ogWidth: originalWidth, cursor: cursorX, offset: offset})

							if (!isNaN(offset)) {
								// console.log(offset)
								colRefs.current[activeCol].current?.setAttribute(
									'style',
									'padding-right: ' + offset + 'px; border-top: none'
								);
							}
						}
					}
				}
			}
		}
	}, [mouseHook?.value, cursorX, activeCol]);

	const mouseDownHandler = (e: MouseEvent, index: number) => {
		if (mouseHook !== undefined) {
			// console.log("setting mouse down to true");
			mouseHook?.setValue(true);
		}
		// console.log("setting active INdex to ", +index);
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

	return (
		<>
			<thead>
				<tr
					key={useId()}
					style={{
						height: appearances.rowHeight,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
					}}
				>
					{columns.map((item, index) => {
						if (colRefs !== undefined && resizeElemHeight !== undefined) {
							return (
								<>
									<th
										style={{
											borderTop: 'none',
											borderLeft: index === 0 ? 'none' : 'inherit',
											minWidth:
												minWidths !== null
													? minWidths[index]
													: 'initial',
											cursor: sortingHook.sortable.includes(item)
												? 'cursor'
												: 'default',
										}}
										ref={colRefs.current[index]}
										key={useId()}
										onClick={() => sortingHandler(item)}
									>
										<span className="guts">
											{item}
											{sortingHook !== undefined &&
											sortingHook.sortingCol === item ? (
												<>{arrow()}</>
											) : (
												<></>
											)}
										</span>
										{resizeElemHeight !== undefined &&
										index !== columns.length - 1 ? (
											<>
												<ResizeElement
													key={useId()}
													tableHeight={resizeElemHeight}
													onMouseDown={(e: any) =>
														mouseDownHandler(e, index)
													}
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
