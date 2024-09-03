import type { TablePages } from '../pages';
import type { CustomerSortingMap } from '../../database/CustomerTypes';
import type { DocumentSortingMap } from '../../database/DocumentTypes';
import type { ArticleSortingMap } from '../../database/ArticleTypes';

export interface ImportModuleProps {
	mode: UploadMode;
	columns: string[];
	hook: {
		map: CustomerSortingMap | ArticleSortingMap | DocumentSortingMap;
		setMap: (newVal: CustomerSortingMap | ArticleSortingMap | DocumentSortingMap) => void;
	};
}

export type UploadMode =
	| 'article_db'
	| 'customer_db'
	| 'document_db'
