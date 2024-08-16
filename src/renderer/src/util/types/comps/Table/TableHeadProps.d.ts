export type TableHeadProps = {
	// An Array containing the column names
	columns: Array<string>;
	// A ref to the Table Body, to know the height of the table body
	resizeElemHeight: number;
	// the x position of the cursor equivalent to event.pageX
	cursorX: number;
	// the hook for managing if the mouse is down, so columns can be resized
	mouseHook: { value: boolean; setValue: Function };
	// the minimum Width for each column, so when scrolling the columns don't jum around
	minWidths: Array<number> | null;
	// sorting arrow indication
	arrow: React.JSX.Element;
	// what column should be sorted by
	sortingHook: {
		sortingCol: string | undefined;
		sortingDirection: 'asc' | 'dsc' | undefined;
		setSortingDirection: Function;
		setSortingCol: Function;
		sortable: Array<string>;
	};
	key?: string;
};
