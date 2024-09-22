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
	type: 'import' | 'align' | 'rankColsByCondition' | 'deleteCol' | 'sort';
	dbVersion: number;
	dataBaseName: 'factor_db';
	targetDBName?: DataBaseNames;
	data: null | AlignVariable | RemoveVariables | string | CustomerSortingMap | ArticleSortingMap | DocumentSortingMap;
};

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

export type RemoveCondition = 'empty text' | 'undefined' | 'null' | '0' | 'custom string' | 'custom number' | '-' | 'column';
