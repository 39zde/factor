import React from 'react';
import type { CustomerSortingMap, CustomerSortingMapProps } from '../../database/CustomerTypes';
import type { DocumentSortingMap } from '../../database/DocumentTypes';
import type { ArticleSortingMap } from '../../database/ArticleTypes';

export interface ImportModuleProps extends SorterProps {
	mode: UploadMode;
}

export interface SorterProps {
	columns: string[];
	hook: {
		map: CustomerSortingMap | ArticleSortingMap | DocumentSortingMap;
		setMap: (newVal: CustomerSortingMap | ArticleSortingMap | DocumentSortingMap) => void;
	};
}

export type CustomerSorterInputGroup = {
	head: string;
	mapKey: CustomerSortingMapProps;
	underlings: CustomerSorterInputGroupUnderling[];
};

export type CustomerSorterInputGroupUnderling = {
	name: string;
	mapKey?: 'emails' | 'phones';
	fields: string[];
	refGroup: React.MutableRefObject<React.RefObject<HTMLSelectElement>[]>;
	fieldKeys: string[];
};
