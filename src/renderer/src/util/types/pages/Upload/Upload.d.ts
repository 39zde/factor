import type { TablePages } from '../pages';
import type { CustomerSortingMap } from "../../database/CustomerTypes"

export interface ArticleSortingMap {
	articleID: string;
}

export interface ImportModuleProps {
	mode: TablePages;
	columns: string[];
	hook: {
		map: CustomerSortingMap | ArticleSortingMap;
		setMap: (newVal: CustomerSortingMap | ArticleSortingMap) => void;
	};
}

export type UploadMode =
	| 'articles'
	| 'customers'
	| 'quotes'
	| 'invoices'
	| 'deliveries'
	| 'returnees';
