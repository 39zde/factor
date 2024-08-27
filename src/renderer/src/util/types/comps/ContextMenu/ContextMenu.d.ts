import React from 'react';
export interface ContextMenuProps {
	active: boolean;
	x: number;
	y: number;
	items: MenuItem[] | undefined;
	/** the level of nested-ness, important for indexing */
	tree: ("left" | "right" | null)[];
}

export type MenuItem = {
	/** the action executed on click, only if component */
	action?: () => void;
	/** the component, that will be wrapped in a li
	 *  - has always a width of 200px
	 *  - has a min-height of
	 */
	component: React.JSX.Element
	/** sub menu */
	subMenu?: MenuItem[]
};
