import React from 'react';

import { useAppContext } from '@renderer/App';

export function ColumnTitle({ column }: { column: string }): React.JSX.Element {
	const { general } = useAppContext();
	switch (column) {
		case 'id':
			return <>{<h4>{general.language === 'deutsch' ? 'Kundennummer' : 'Customer ID'}</h4>}</>;
		case 'persons':
			return <>{<h4>{general.language === 'deutsch' ? 'Personen' : 'Persons'}</h4>}</>;
		case 'company':
			return <>{<h4>{general.language === 'deutsch' ? 'Firma' : 'Company'}</h4>}</>;
		case 'description':
			return <>{<h4>{general.language === 'deutsch' ? 'Beschreibung' : 'Description'}</h4>}</>;
		case 'altIDs':
			return <>{<h4>{general.language === 'deutsch' ? 'Alte Kundennummern' : 'Old Customer IDs'}</h4>}</>;
		case 'website':
			return <>{<h4>{general.language === 'deutsch' ? 'Internetseite' : 'Website'}</h4>}</>;
		case 'addresses':
			return <>{<h4>{general.language === 'deutsch' ? 'Adressen' : 'Addresses'}</h4>}</>;
		case 'banks':
			return <>{<h4>{general.language === 'deutsch' ? 'Bankverbindung' : 'Bank Details'}</h4>}</>;
		case 'emails':
			return <>{<h4>{general.language === 'deutsch' ? 'Email' : 'Email'}</h4>}</>;
		case 'phones':
			return <>{<h4>{general.language === 'deutsch' ? 'Telefon' : 'Phone'}</h4>}</>;
		case 'firstContact':
			return <>{<h4>{general.language === 'deutsch' ? 'Erstkontakt' : 'First Interaction'}</h4>}</>;
		case 'latestContact':
			return <>{<h4>{general.language === 'deutsch' ? 'Zuletzt Gesehen' : 'Last Seen'}</h4>}</>;
		case 'created':
			return <>{<h4>{general.language === 'deutsch' ? 'Erstellungsdatum' : 'Creation Date'}</h4>}</>;
		case 'firstName':
			return <>{<h4>{general.language === 'deutsch' ? 'Vorname' : 'First Name'}</h4>}</>;
		case 'lastName':
			return <>{<h4>{general.language === 'deutsch' ? 'Nachname' : 'Last Name'}</h4>}</>;
		case 'name':
			return <>{<h4>{general.language === 'deutsch' ? 'Name' : 'Name'}</h4>}</>;
		case 'notes':
			return <>{<h4>{general.language === 'deutsch' ? 'Notizen' : 'Notes'}</h4>}</>;
		case 'city':
			return <>{<h4>{general.language === 'deutsch' ? 'Stadt' : 'City'}</h4>}</>;
		case 'country':
			return <>{<h4>{general.language === 'deutsch' ? 'Nation' : 'Nation'}</h4>}</>;
		case 'street':
			return <>{<h4>{general.language === 'deutsch' ? 'Straße' : 'Street'}</h4>}</>;
		case 'zip':
			return <>{<h4>{general.language === 'deutsch' ? 'Postleitzahl' : 'Postal Code'}</h4>}</>;
		case 'hash':
			return <>{<h4>{general.language === 'deutsch' ? 'Hash' : 'Hash'}</h4>}</>;
		case 'type':
			return <>{<h4>{general.language === 'deutsch' ? 'Art' : 'Category'}</h4>}</>;
		case 'bic':
			return <>{<h4>{general.language === 'deutsch' ? 'BIC' : 'BIC'}</h4>}</>;
		case 'bankCode':
			return <>{<h4>{general.language === 'deutsch' ? 'BLZ' : 'Bank Code'}</h4>}</>;
		case 'iban':
			return <>{<h4>{general.language === 'deutsch' ? 'IBAN' : 'IBAN'}</h4>}</>;
		case 'title':
			return <>{<h4>{general.language === 'deutsch' ? 'Anrede' : 'Title'}</h4>}</>;
		case 'alias':
			return <>{<h4>{general.language === 'deutsch' ? 'Alias' : 'Alias'}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		// case '':
		// 	return <>{<h4>{general.language === 'deutsch' ? '' : ''}</h4>}</>;
		default:
			return <></>;
	}
}
