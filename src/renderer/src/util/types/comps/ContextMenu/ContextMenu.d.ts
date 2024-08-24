import React from 'react';
export interface ContextMenuProps {
	active: boolean;
	x: number;
	y: number;
	menuItems: Array<MenuItem | undefined> | undefined;
	component?: React.JSX.Element | undefined;
}

export type MenuItem = {
	name: string;
	menuItems?: Array<MenuItem | undefined>;
	action?: () => void;
	/**
	 * undefined means, there is no checkbox
	 * true or false means the is a check box and also shows the state of which
	 */
	checkBox?: boolean | undefined;
	/** if defined overrides menuItems */
	component?: React.JSX.Element;
};
