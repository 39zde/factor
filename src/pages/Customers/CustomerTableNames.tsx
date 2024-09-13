import React from 'react';
// non-lib imports
import { useAppContext } from '@app';
import type { CustomerDBObjectStores } from '@typings';

export function CustomerTableNames({ tableName }: { tableName: CustomerDBObjectStores }): React.JSX.Element {
	const { general } = useAppContext();
	switch (tableName) {
		case 'addresses':
			return <>{general.language === 'deutsch' ? 'Adressen' : 'Addresses'}</>;
		case 'banks':
			return <>{general.language === 'deutsch' ? 'Banken' : 'Banks'}</>;
		case 'company':
			return <>{general.language === 'deutsch' ? 'Firmen' : 'Companies'}</>;
		case 'customers':
			return <>{general.language === 'deutsch' ? 'Kunden' : 'Customers'}</>;
		case 'emails':
			return <>{general.language === 'deutsch' ? 'Emails' : 'Emails'}</>;
		case 'persons':
			return <>{general.language === 'deutsch' ? 'Personen' : 'Persons'}</>;
		case 'phones':
			return <>{general.language === 'deutsch' ? 'Telefonnummern' : 'Phone-Numbers'}</>;
		default:
			return <></>;
	}
}
