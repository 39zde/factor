export interface TableProps {
	tableName: string;
	colsHook?: { cols: string[]; setCols: (newVal: string[]) => void };
	entriesHook?: { entries: number; setEntries: (newVal: number) => void };
	updateHook?: { update: boolean; setUpdate: (newVal: boolean) => void };
	uniqueKey: string;
}
