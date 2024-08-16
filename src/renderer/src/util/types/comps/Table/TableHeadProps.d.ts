import React from 'react';

export interface TableHeadProps {
	// An Array containing the column names
	columns: string[];
	// A ref to the Table Body, to know the height of the table body
	resizeElemHeight: number;
	// the x position of the cursor equivalent to event.pageX
	cursorX: number;
	// the hook for managing if the mouse is down, so columns can be resized
	mouseHook: { value: boolean; setValue: (newVal: boolean) => void };
	// sorting arrow indication
	arrow?: React.JSX.Element;
	// what column should be sorted by
	sortingHook?: SortingHookType;
	key?: string;
}

export interface TableHeadDisplayProps {
	columns: string[] | undefined;
	update: boolean | undefined;
	scope: number;
	cursorX: number;
	mouseDownHook: {
		value: boolean;
		setValue: (newVal: boolean) => void;
	};
	arrow?: React.JSX.Element;
	sortingHook?: SortingHookType;
}

export type SortingHookType = {
	sortingCol: string | undefined;
	sortingDirection: 'asc' | 'dsc' | undefined;
	setSortingDirection: (newVal: 'asc' | 'dsc' | undefined) => void;
	setSortingCol: (newVal: string | undefined) => void;
	sortable: string[];
};
