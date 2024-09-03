import React from 'react';

import { CustomerSorter } from './TableSorters/CustomerSorter';
import type { ImportModuleProps } from '@util/types/types';

export function ImportModule({ mode, columns, hook }: ImportModuleProps): React.JSX.Element {
	switch (mode) {
		case 'customer_db':
			return <CustomerSorter columns={columns} hook={hook} />;
		case 'article_db':
			return <></>;
		case 'document_db':
			return <></>;
		default:
			return <></>;
	}
}
