import type { CustomerSortingMap } from '../database/CustomerTypes';
import type { ArticleSortingMap } from '../database/ArticleTypes';
import type { DocumentSortingMap } from '../database/DocumentTypes';
import type { DataBaseNames } from '../database/DataBaseData';

export type AddDataArgs = {
	keys: string[];
	rows: string[];
	db: IDBDatabase;
};

export type DateInput = 'YYYYMMDD' | 'YYYY-MM-DD hh:mm:ss';

export type ImportWorkerMessage = {
	type: 'import' | 'align' | 'rankColsByCondition' | 'delete-col' | 'sort' | 'delete-rank' | 'restore';
	dbVersion: number;
	dataBaseName: 'factor_db';
	targetDBName?: DataBaseNames;
	data: null | AlignVariable | RemoveVariables | string | CustomerSortingMap | ArticleSortingMap | DocumentSortingMap | RankedDeletion;
};
export type RankedDeletion = {
	columnName: string;
	columnIndex: number;
};
export type UpdateMessage = {
	type: 'import-progress' | 'align-progress' | 'sort-progress' | 'delete-col-progress' | 'delete-rank-progress' | 'rank-progress';
	data: string;
	addons?: (object | string | number)[];
};

export type ImportWorkerMessageResponse = {
	type:
		| 'import-progress'
		| 'import-done'
		| 'align-progress'
		| 'align-done'
		| 'sort-progress'
		| 'sort-done'
		| 'delete-col-progress'
		| 'delete-col-done'
		| 'delete-rank-progress'
		| 'delete-rank-done'
		| 'rank-progress'
		| 'rank-done'
		| 'restore-progress'
		| 'restore-done'
		| 'error';
	data: string | ImportDoneData | RankDoneData | DeleteRankProgress | number;
	addons?: (object | string | number)[];
};
export type DeleteRankProgress = {
	index: number;
	progress: string;
};

/**
 * [entries, columnNames[]]
 */
export type ImportDoneData = [number, string[]];
/**
 * @description [
 *
 * 	[columnName1, numberConditionFails],
 *
 * 	[columnName2, numberConditionFails],
 *
 * 	...
 *
 * ]
 */
export type RankDoneData = [string, number][];

export type AlignVariables = {
	col: string; // column name
	value: string; // the value of the outlier
	offset: number; // the shift amount
	direction: 'Left' | 'Right'; // the direction to shift to
};

export type RemoveVariables = {
	condition: RemoveCondition;
	custom: {
		string: string;
		number: string;
		column: string;
	};
};

export type RemoveCondition = 'empty text' | 'undefined' | 'null' | '0' | 'custom string' | 'custom number' | '-';
