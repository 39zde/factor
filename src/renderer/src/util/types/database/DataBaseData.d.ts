export interface TableRow extends BaseRow {
	row: number;
}

export type BaseRow = {
	[key: string]: Array<number | string> | number | string | Date;
};
