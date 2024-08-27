import React, {
	MouseEvent,
	useEffect,
	useState,
	useRef,
	forwardRef,
} from 'react';

import { useAppContext, solids } from '@renderer/App';
import type { ContextMenuProps, MenuItem } from '@renderer/util/types/types';
import './ContextMenu.css';

/** This works, but it not to my liking. consider this a work in progress */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
	function Menu(props, ref): React.JSX.Element {
		const { x, active, items, tree, y } = props;
		const { appearances } = useAppContext();
		const menuRef = useRef<HTMLUListElement>(null);
		const nestedRef = useRef<HTMLDivElement>(null);
		const [ownX, setOwnX] = useState<number>(0);
		const [ownY, setOwnY] = useState<number>(0);
		const [ownActive, setOwnActive] = useState<boolean>(false);
		const [opacity, setOpacity] = useState<0 | 1>(0);
		const [area, setArea] = useState<0 | 1 | 2 | 3>(0);
		const [nestedX, setNestedX] = useState<number>(0);
		const [nestedY, setNestedY] = useState<number>(0);
		const [nestedActive, setNestedActive] = useState<boolean>(false);
		const [nestedItems, setNestedItems] = useState<
			Array<MenuItem> | undefined
		>(undefined);

		useEffect(() => {
			setOpacity(0);
			setOwnX(x);
			setOwnY(y);
			setNestedActive(false);
			// determine the distance between the right edge of the contextMenu and the right edge of the window
			let rightDistance = appearances.width - x - solids.contextMenu.width;
			// determine the distance between the bottom edge of the contextMenu and the bottom edge of the window
			let bottomDistance = appearances.height - y;
			if (menuRef.current !== null) {
				bottomDistance -= menuRef.current.getBoundingClientRect().height;
				/*
				P(x,y) is the click point
				x ∈ ax
				y ∈ ay
				ay
				▲
				│	 	3 │ 2
				│	 y ──┼──
				│		1 │ 0
				│    	  x
				└──────────► ax
			*/

				let sum: 0 | 1 | 2 | 3 = 0;
				if (rightDistance < 0) {
					// if the rightDistance < 0
					// add one
					sum += 1;
				}
				if (bottomDistance < 0) {
					// if the bottom distance < 0
					// add 2
					sum += 2;
				}
				// the sum shows us what area we need to avoid 'overflowing'
				switch (sum) {
					case 1:
						setArea(sum);
						setOwnX(x - solids.contextMenu.width);
						setOwnY(y);
						setOpacity(1);
						break;
					case 2:
						setArea(sum);
						setOwnX(x);
						setOwnY(y - menuRef.current.getBoundingClientRect().height);
						setOpacity(1);
						break;
					case 3:
						setArea(sum);
						setOwnX(x - solids.contextMenu.width);
						setOwnY(y - menuRef.current.getBoundingClientRect().height);
						setOpacity(1);
						break;
					case 0:
						setArea(0);
						setOwnX(x);
						setOwnY(y);
						setOpacity(1);
					default:
						break;
				}
			}
		}, [x, y, appearances.width, menuRef.current]);

		useEffect(() => {
			if (active === false) {
				setNestedActive(false);
			}
			setOwnActive(active);
		}, [active]);

		return (
			<>
				<div
					ref={ref}
					aria-modal="true"
					className="contextMenu"
					style={{
						opacity: opacity,
						left: ownX,
						top: ownY,
						display: ownActive ? 'block' : 'none',
					}}>
					<ul className="contextMenuList" ref={menuRef}>
						{items !== undefined ? (
							items.map((item, index) => {
								return (
									<>
										<li
											aria-modal="true"
											key={tree.join('-') + '-' + index.toString()}
											onClick={() => {
												if (
													item.action !== undefined &&
													item.subMenu === undefined
												) {
													item.action();
												}
											}}
											onMouseDown={(e: MouseEvent) => {
												if (item.subMenu !== undefined) {
													setNestedActive(!nestedActive);
													setNestedItems(item.subMenu);
													setNestedY(
														// @ts-expect-error ts does not know about this dom element
														e.target.getBoundingClientRect().y
													);
													if (tree.length === 1) {
														if (area === 1 || area === 3) {
															setNestedX(
																ownX - solids.contextMenu.width
															);
														} else {
															setNestedX(
																ownX + solids.contextMenu.width
															);
														}
													} else {
														if (
															tree[tree.length - 1] === 'left'
														) {
															setNestedX(
																ownX - solids.contextMenu.width
															);
														} else if (
															tree[tree.length - 1] === 'right'
														) {
															setNestedX(
																ownX + solids.contextMenu.width
															);
														}
													}
												}
											}}>
											{item.component}
										</li>
									</>
								);
							})
						) : (
							<></>
						)}
					</ul>
				</div>
				{nestedItems !== undefined ? (
					<>
						<ContextMenu2
							active={nestedActive === true && active === true}
							items={nestedItems}
							tree={[
								...tree,
								area === 1 || area === 3 ? 'left' : 'right',
							]}
							x={nestedX}
							y={nestedY}
							ref={nestedRef}
						/>
					</>
				) : (
					<></>
				)}
			</>
		);
	}
);

export const ContextMenu2 = forwardRef<HTMLDivElement, ContextMenuProps>(
	function Menu2(props, ref): React.JSX.Element {
		const { x, active, items, tree, y } = props;
		const { appearances } = useAppContext();
		const menuRef = useRef<HTMLUListElement>(null);
		const nestedRef = useRef<HTMLDivElement>(null);
		const [ownX, setOwnX] = useState<number>(0);
		const [ownY, setOwnY] = useState<number>(0);
		const [ownActive, setOwnActive] = useState<boolean>(false);
		const [area, setArea] = useState<0 | 1 | 2 | 3>(0);
		const [nestedX, setNestedX] = useState<number>(0);
		const [nestedY, setNestedY] = useState<number>(0);
		const [nestedActive, setNestedActive] = useState<boolean>(false);
		const [nestedItems, setNestedItems] = useState<
			Array<MenuItem> | undefined
		>(undefined);

		useEffect(() => {
			setNestedActive(false);
			// determine the distance between the right edge of the contextMenu and the right edge of the window
			let rightDistance = appearances.width - x - solids.contextMenu.width;
			// determine the distance between the bottom edge of the contextMenu and the bottom edge of the window
			let bottomDistance = appearances.height - y;
			if (menuRef.current !== null) {
				bottomDistance -= menuRef.current.getBoundingClientRect().height;

				/*
				P(x,y) is the click point
				x ∈ ax
				y ∈ ay
				ay
				▲
				│	 	3 │ 2
				│	 y ──┼──
				│		1 │ 0
				│    	  x
				└──────────► ax
			*/

				let sum: 0 | 1 | 2 | 3 = 0;
				if (rightDistance < 0) {
					// if the rightDistance < 0
					// add one
					sum += 1;
				}
				if (bottomDistance < 0) {
					// if the bottom distance < 0
					// add 2
					sum += 2;
				}

				// the sum shows us what area we need to avoid 'overflowing'
				switch (sum) {
					case 1:
						setArea(sum);
						setOwnX(x - solids.contextMenu.width);
						setOwnY(y);
						break;
					case 2:
						setArea(sum);
						setOwnX(x);
						if (menuRef.current !== null) {
							setOwnY(
								y - menuRef.current.getBoundingClientRect().height
							);
						} else {
							setOwnY(y);
						}
						break;
					case 3:
						setArea(sum);
						setOwnX(x - solids.contextMenu.width);
						if (menuRef.current !== null) {
							setOwnY(
								y - menuRef.current.getBoundingClientRect().height
							);
						} else {
							setOwnY(y);
						}
						break;
					case 0:
					default:
						setArea(0);
						setOwnX(x);
						setOwnY(y);
						break;
				}
			}
		}, [x, y, appearances.width]);

		useEffect(() => {
			if (active === false) {
				setNestedActive(false);
			}
			setOwnActive(active);
		}, [active]);

		return (
			<>
				<div
					ref={ref}
					aria-modal="true"
					className="contextMenu"
					style={{
						left: ownX,
						top: ownY,
						display: ownActive ? 'block' : 'none',
					}}>
					<ul className="contextMenuList" ref={menuRef}>
						{items !== undefined ? (
							items.map((item, index) => {
								return (
									<>
										<li
											aria-modal="true"
											key={tree.join('-') + '-' + index.toString()}
											onClick={() => {
												if (
													item.action !== undefined &&
													item.subMenu === undefined
												) {
													item.action();
												}
											}}
											onMouseDown={(e: MouseEvent) => {
												if (item.subMenu !== undefined) {
													setNestedItems(item.subMenu);
													setNestedY(
														// @ts-expect-error ts does not know about this dom element
														e.target.getBoundingClientRect().y
													);
													if (tree.length === 1) {
														if (area === 1 || area === 3) {
															setNestedX(
																ownX - solids.contextMenu.width
															);
														} else {
															setNestedX(
																ownX + solids.contextMenu.width
															);
														}
													} else {
														if (
															tree[tree.length - 1] === 'left'
														) {
															setNestedX(
																ownX - solids.contextMenu.width
															);
														} else if (
															tree[tree.length - 1] === 'right'
														) {
															setNestedX(
																ownX + solids.contextMenu.width
															);
														}
													}

													setNestedActive(!nestedActive);
												}
											}}>
											{item.component}
										</li>
									</>
								);
							})
						) : (
							<></>
						)}
					</ul>
				</div>
				{nestedItems !== undefined ? (
					<>
						<ContextMenu
							active={nestedActive === true && active === true}
							items={nestedItems}
							tree={[
								...tree,
								area === 1 || area === 3 ? 'left' : 'right',
							]}
							x={nestedX}
							y={nestedY}
							ref={nestedRef}
						/>
					</>
				) : (
					<></>
				)}
			</>
		);
	}
);
