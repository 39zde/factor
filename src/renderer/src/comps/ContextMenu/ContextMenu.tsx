import React, { MouseEvent, useEffect, useState } from 'react';
import { ChevronRightIcon } from 'lucide-react';

import { solids } from '@renderer/App';
import { CheckBox } from '../CheckBox/CheckBox';
import type { ContextMenuProps, MenuItem } from '@renderer/util/types/types';
import './ContextMenu.css';

export function ContextMenu({
	active,
	x,
	y,
	menuItems,
	component,
}: ContextMenuProps): React.JSX.Element {
	const [nestedX, setNestedX] = useState<number>(0);
	const [nestedY, setNestedY] = useState<number>(0);
	const [nestedActive, setNestedActive] = useState<boolean>(false);
	// use a iife
	const [checkBoxChecked, setCheckBoxChecked] = useState<
		(boolean | undefined)[] | undefined
	>(
		(() =>
			menuItems !== undefined
				? menuItems.map((item) => item?.checkBox)
				: undefined)()
	);
	const [nestedItems, setNestedItems] = useState<
		Array<MenuItem | undefined> | undefined
	>(undefined);
	const [nestedComponent, setNestedComponent] = useState<
		React.JSX.Element | undefined
	>(undefined);

	useEffect(() => {
		setNestedActive(false);
		setNestedX(x + 200);
		setNestedY(y);
	}, [x, y]);

	return (
		<>
			<div
				aria-modal="true"
				className="contextMenu"
				style={{
					top: y,
					left: x,
					display: active ? 'block' : 'none',
				}}>
				<ul className="contextMenuList">
					{component !== undefined ? <>{component}</> : <></>}
					{menuItems !== undefined ? (
						menuItems.map((item, index) => {
							if (item !== undefined) {
								return (
									<>
										<li
											aria-modal="true"
											key={item.name + index.toString() + '-1'}
											onClick={() => {
												if (item.action !== undefined) {
													item.action();
												}
											}}
											onMouseDown={(e: MouseEvent) => {
												if (
													item.checkBox !== undefined &&
													checkBoxChecked !== undefined &&
													checkBoxChecked[index] !== undefined
												) {
													setCheckBoxChecked(
														checkBoxChecked.toSpliced(
															index,
															1,
															!checkBoxChecked[index]
														)
													);
												}
												if (
													item.menuItems !== undefined ||
													item.component !== undefined
												) {
													setNestedActive(!nestedActive);
													setNestedY(
														// @ts-ignore
														e.target.getBoundingClientRect().y
													);
													setNestedX(x + 200);
													if (item.menuItems !== undefined) {
														setNestedComponent(undefined);
														setNestedItems(item.menuItems);
													}
													if (item.component !== undefined) {
														setNestedItems(undefined);
														setNestedComponent(item.component);
													}
												}
											}}>
											{item.name}
											{item.menuItems !== undefined ||
											item.component !== undefined ? (
												<>
													<ChevronRightIcon
														aria-modal="true"
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={solids.icon.size.small}
														strokeWidth={
															solids.icon.strokeWidth.small
														}
													/>
												</>
											) : (
												<></>
											)}
											{item.checkBox !== undefined &&
											checkBoxChecked !== undefined &&
											checkBoxChecked[index] !== undefined ? (
												<>
													<CheckBox
														ticked={checkBoxChecked[index]}
													/>
												</>
											) : (
												<></>
											)}
										</li>
										{index !== menuItems.length - 1 ? (
											<>
												<div
													aria-modal="true"
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
			{nestedItems !== undefined || nestedComponent !== undefined ? (
				<>
					<NestedContextMenu
						active={nestedActive === true && active === true}
						menuItems={nestedItems}
						x={nestedX}
						y={nestedY}
						component={nestedComponent}
					/>
				</>
			) : (
				<></>
			)}
		</>
	);
}
export function NestedContextMenu({
	active,
	x,
	y,
	menuItems,
	component,
}: ContextMenuProps): React.JSX.Element {
	const [nestedX, setNestedX] = useState<number>(0);
	const [nestedY, setNestedY] = useState<number>(0);
	const [nestedActive, setNestedActive] = useState<boolean>(false);
	// use a iife
	const [checkBoxChecked, setCheckBoxChecked] = useState<
		(boolean | undefined)[] | undefined
	>(
		(() =>
			menuItems !== undefined
				? menuItems.map((item) => item?.checkBox)
				: undefined)()
	);
	const [nestedItems, setNestedItems] = useState<
		Array<MenuItem | undefined> | undefined
	>(undefined);
	const [nestedComponent, setNestedComponent] = useState<
		React.JSX.Element | undefined
	>(undefined);

	useEffect(() => {
		setNestedActive(false);
		setNestedX(x + 200);
		setNestedY(y);
	}, [x, y]);

	return (
		<>
			<div
				aria-modal="true"
				className="contextMenu"
				style={{
					top: y,
					left: x,
					display: active ? 'block' : 'none',
				}}>
				<ul className="contextMenuList">
					{component !== undefined ? <>{component}</> : <></>}
					{menuItems !== undefined ? (
						menuItems.map((item, index) => {
							if (item !== undefined) {
								return (
									<>
										<li
											key={item.name + index.toString() + '-1'}
											onClick={() => {
												if (item.action !== undefined) {
													item.action();
												}
											}}
											aria-modal="true"
											onMouseDown={(e: MouseEvent) => {
												if (
													item.checkBox !== undefined &&
													checkBoxChecked !== undefined &&
													checkBoxChecked[index] !== undefined
												) {
													setCheckBoxChecked(
														checkBoxChecked.toSpliced(
															index,
															1,
															!checkBoxChecked[index]
														)
													);
												}
												if (
													item.menuItems !== undefined ||
													item.component !== undefined
												) {
													setNestedActive(!nestedActive);
													setNestedY(
														// @ts-ignore
														e.target.getBoundingClientRect().y
													);
													setNestedX(x + 200);
													if (item.menuItems !== undefined) {
														setNestedComponent(undefined);
														setNestedItems(item.menuItems);
													}
													if (item.component !== undefined) {
														setNestedItems(undefined);
														setNestedComponent(item.component);
													}
												}
											}}>
											{item.name}
											{item.menuItems !== undefined ||
											item.component !== undefined ? (
												<>
													<ChevronRightIcon
														aria-modal="true"
														color="light-dark(var(--color-dark-1),var(--color-light-1))"
														size={16}
														strokeWidth={1.5}
													/>
												</>
											) : (
												<></>
											)}
											{item.checkBox !== undefined &&
											checkBoxChecked !== undefined ? (
												<>
													<CheckBox
														ticked={checkBoxChecked[index]}
													/>
												</>
											) : (
												<></>
											)}
										</li>
										{index !== menuItems.length - 1 ? (
											<>
												<div
													aria-modal="true"
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
			{nestedItems !== undefined || nestedComponent !== undefined ? (
				<>
					<ContextMenu
						active={nestedActive === true && active === true}
						menuItems={nestedItems}
						x={nestedX}
						y={nestedY}
						component={nestedComponent}
					/>
				</>
			) : (
				<></>
			)}
		</>
	);
}
