import React, { MouseEvent, useEffect, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { CheckBox } from '../CheckBox/CheckBox';
import type { ContextMenuProps, MenuItem } from '@renderer/util/types/types';
import './ContextMenu.css';

export function ContextMenu({
	active,
	x,
	y,
	menuItems,
}: ContextMenuProps): React.JSX.Element {
	const [nestedX, setNestedX] = useState<number>(0);
	const [nestedY, setNestedY] = useState<number>(0);
	const [nestedActive, setNestedActive] = useState<boolean>(false);
	const [nestedItems, setNestedItems] = useState<
		Array<MenuItem | undefined> | undefined
	>(undefined);

	useEffect(() => {
		setNestedActive(false);
		setNestedX(x + 200);
		setNestedY(y);
	}, [x, y]);

	return (
		<>
			<div
				className="contextMenu"
				style={{
					top: y,
					left: x,
					display: active ? 'block' : 'none',
				}}>
				<ul className="contextMenuList">
					{menuItems !== undefined ? (
						menuItems.map((item, index) => {
							if (item !== undefined) {
								return (
									<>
										<li
											key={item.name + index.toString() + "-1"}
											onClick={() => {
												if (item.action !== undefined) {
													item.action();
												}
											}}
											onMouseDown={(e: MouseEvent) => {
												if (item.menuItems !== undefined) {
													setNestedActive(!nestedActive);
													setNestedY(
														// @ts-ignore
														e.target.getBoundingClientRect().y
													);
													setNestedX(x + 200);
													setNestedItems(item.menuItems);
												}
											}}>
											{item.name}
											{item.menuItems !== undefined ? (
												<>
													<ChevronRightIcon
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={16}
														strokeWidth={1.5}
													/>
												</>
											) : (
												<></>
											)}
											{item.checkBox !== undefined ? (
												<>
													<CheckBox ticked={item.checkBox} />
												</>
											) : (
												<></>
											)}
										</li>
										{index !== menuItems.length - 1 ? (
											<>
												<div
													style={{
														height: 1,
														width: '100%',
														background:
															'light-dark(var(--color-dark-3),var(--color-light-3))',
													}}></div>
											</>
										) : (
											<></>
										)}
									</>
								);
							} else {
								return <></>;
							}
						})
					) : (
						<></>
					)}
				</ul>
			</div>
			{nestedItems !== undefined ? (
				<>
					<NestedContextMenu
						active={nestedActive === true && active === true}
						menuItems={nestedItems}
						x={nestedX}
						y={nestedY}
					/>
				</>
			) : (
				<></>
			)}
		</>
	);
}

function NestedContextMenu({
	active,
	x,
	y,
	menuItems,
}: ContextMenuProps): React.JSX.Element {
	const [nestedX, setNestedX] = useState<number>(0);
	const [nestedY, setNestedY] = useState<number>(0);
	const [nestedActive, setNestedActive] = useState<boolean>(false);
	const [nestedItems, setNestedItems] = useState<
		Array<MenuItem | undefined> | undefined
	>(undefined);

	useEffect(() => {
		setNestedActive(false);
		setNestedX(x + 200);
		setNestedY(y);
	}, [x, y]);
	return (
		<>
			<div
				className="contextMenu"
				style={{
					top: y,
					left: x,
					display: active ? 'block' : 'none',
				}}>
				<ul className="contextMenuList">
					{menuItems !== undefined ? (
						menuItems.map((item, index) => {
							if (item !== undefined) {
								return (
									<>
										<li
											key={item.name + index.toString() + "-2"}
											onClick={() => {
												if (item.action !== undefined) {
													item.action();
												}
											}}
											onMouseDown={(e: MouseEvent) => {
												if (item.menuItems !== undefined) {
													setNestedActive(!nestedActive);
													setNestedY(
														// @ts-ignore
														e.target.getBoundingClientRect().y
													);
													setNestedX(x + 200);
													setNestedItems(item.menuItems);
												}
											}}>
											{item.name}
											{item.menuItems !== undefined ? (
												<>
													<ChevronRightIcon
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={16}
														strokeWidth={1.5}
													/>
												</>
											) : (
												<></>
											)}
											{item.checkBox !== undefined ? (
												<>
													<CheckBox ticked={item.checkBox} />
												</>
											) : (
												<></>
											)}
										</li>
									</>
								);
							} else {
								return <></>;
							}
						})
					) : (
						<></>
					)}
				</ul>
			</div>
			{nestedItems !== undefined ? (
				<>
					<ContextMenu
						active={nestedActive}
						menuItems={nestedItems}
						x={nestedX}
						y={nestedY}
					/>
				</>
			) : (
				<></>
			)}
		</>
	);
}
