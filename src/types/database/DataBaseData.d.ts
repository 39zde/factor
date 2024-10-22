export interface TableRow extends BaseRow {
	row: number;
}
export interface TableRowCounter {
	row: number;
	[key: string]: number;
}

export interface UploadRow {
	row: number;
	[key: string]: string;
}

export type BaseRow = {
	[key: string]: number | Date | string | string[] | ArrayBuffer;
};

export type DerefRow = {
	row: number;
	[key: CustomerKeys]: number | Date | string | string[] | DerefRow[];
};

export type CustomerKeys = 'row' | 'id' | 'altIDs' | 'description' | 'firstContact' | 'latestContact' | 'created' | 'notes' | CustomerReferences;

export type CustomerReferences = 'company' | 'persons' | 'addresses' | 'banks';

export type DataBaseNames = 'article_db' | 'customer_db' | 'document_db';
