export interface TableProps {
	dataBaseName: string;
	/** tableName is the same as the oStore name in the database  */
	tableName: string;
	/** read and write the columns from outside the Table comp */
	colsHook?: {
		cols: string[];
		setCols: (newVal: string[]) => void;
		setAllCols: (newVal: string[]) => void;
	};
	/** read only table row count  */
	entriesHook?: (newVal: number) => void;
	/**  when update is true, the table stops to render,  */
	updateHook?: { update: boolean; setUpdate: (newVal: boolean) => void };
	/** what unique key to use */
	uniqueKey: string;
	key?: string;
	update?: boolean;
}
