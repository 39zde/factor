import React from 'react';

export interface TableHeadDisplayProps {
	columns: string[] | undefined;
	update: boolean | undefined;
	scope: number;
	cursorX: number;
	rowHeight: number;
	mouseDownHook: {
		value: boolean;
		setValue: (newVal: boolean) => void;
	};
	minWidths: number[] | null;
	arrow: () => React.JSX.Element;
	sortingHook: {
		sortingCol: string | undefined;
		sortingDirection: 'asc' | 'dsc' | undefined;
		setSortingDirection: (newVal: 'asc' | 'dsc') => void;
		setSortingCol: (newVal: string) => void;
		sortable: string[];
	};
}
