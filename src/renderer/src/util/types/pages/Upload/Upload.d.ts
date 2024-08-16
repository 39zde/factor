import type { TablePages } from '../pages';
export type CustomerMapType = {
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
	firstContact?: string;
	latestContact?: string;
	notes?: string;
};

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
