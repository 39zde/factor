import type { TablePages } from '../pages';
export interface CustomerSortingMap {
	customerID: string;
	title?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	web?: string;
	companyName?: string;
	alias?: string;
	street?: string;
	zip?: string;
	city?: string;
	country?: string;
	first?: string;
	latest?: string;
	notes?: string;
}

export interface ArticleSortingMap {
	articleID: string;
}

export interface ImportModuleProps {
	mode: TablePages;
	columns: string[];
	hook: {
		sortingMap: CustomerSortingMap | ArticleSortingMap;
		setSortingMap: (newVal: CustomerSortingMap | ArticleSortingMap) => void;
	};
}

export type UploadMode =
	| 'articles'
	| 'customers'
	| 'quotes'
	| 'invoices'
	| 'deliveries'
	| 'returnees';
