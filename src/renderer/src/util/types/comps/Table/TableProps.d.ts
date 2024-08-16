export interface TableProps {
	tableName: string;
	colsHook?: { cols: Array<string>; setCols: Function };
	entriesHook?: { entries: number; setEntries: Function };
	updateHook?: { update: boolean; setUpdate: Function };
	uniqueKey: string;
}
