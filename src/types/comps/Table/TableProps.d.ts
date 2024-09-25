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
	/**  when update is true, the table stops to render.
	 *   if update is set to true it will init the table state again.
	 *   updating the props: tableName, dataBaseName, uniqueKey require setting update=true afterwards, to take effect
	 *   also, update does not be to be set to false, the table does it itself
	 */
	updateHook?: { update: boolean; setUpdate: (newVal: boolean) => void };
	/** what unique key to use */
	uniqueKey: string;
	key?: string;
	nativeColumnNames?: boolean;
}
