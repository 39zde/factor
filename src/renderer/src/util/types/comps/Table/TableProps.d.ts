export interface TableProps {
	tableName: string;
	colsHook?: { cols: string[]; setCols: (newVal: string[]) => void };
	entriesHook?: { entries: number; setEntries: (newVal: number) => void };
	// when update is true, the table stops to render
	updateHook?: { update: boolean; setUpdate: (newVal: boolean) => void };
	uniqueKey: string;
}
