import React from 'react';

import { CustomerSorter } from './TableSorters/CustomerSorter';
import type { ImportModuleProps } from '@util/types/types';

export function ImportModule({
	mode,
	columns,
	hook,
}: ImportModuleProps): React.JSX.Element {
	switch (mode) {
		case 'customers':
			return <CustomerSorter columns={columns} hook={hook} />;
		case 'articles':
			return <></>;
		case 'deliveries':
			return <></>;
		case 'invoices':
			return <></>;
		case 'quotes':
			return <></>;
		case 'returnees':
			return <></>;
		default:
			return <></>;
	}
}
