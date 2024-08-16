import React from "react";

export interface TableHeadDisplayProps {
	columns: Array<string> | undefined;
	update: boolean | undefined;
	scope: number;
	cursorX: number;
	rowHeight: number;
	mouseDownHook: {
		value: boolean;
		setValue: Function;
	};
	minWidths: number[] | null;
	arrow: () => React.JSX.Element;
	sortingHook: {
		sortingCol: string | undefined;
		sortingDirection: 'asc' | 'dsc' | undefined;
		setSortingDirection: Function;
		setSortingCol: Function;
		sortable: Array<string>;
	};
}
