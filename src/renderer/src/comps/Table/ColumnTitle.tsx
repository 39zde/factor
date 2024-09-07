import React from 'react';

import { useAppContext } from '@renderer/App';

export function ColumnTitle({ column }: { column: string }): React.JSX.Element {
	return (
		<>
			<h4>
				<ColumnTitleString column={column} />
			</h4>
		</>
	);
}

export function ColumnTitleString({ column }: { column: string }): string {
	const { general } = useAppContext();
	switch (column) {
		case 'id':
			return general.language === 'deutsch' ? 'Kundennummer' : 'Customer ID';
		case 'persons':
			return general.language === 'deutsch' ? 'Personen' : 'Persons';
		case 'company':
			return general.language === 'deutsch' ? 'Firma' : 'Company';
		case 'description':
			return general.language === 'deutsch' ? 'Beschreibung' : 'Description';
		case 'altIDs':
			return general.language === 'deutsch' ? 'Alte Kundennummern' : 'Old Customer IDs';
		case 'website':
			return general.language === 'deutsch' ? 'Internetseite' : 'Website';
		case 'addresses':
			return general.language === 'deutsch' ? 'Adressen' : 'Addresses';
		case 'banks':
			return general.language === 'deutsch' ? 'Bankverbindung' : 'Bank Details';
		case 'emails':
			return general.language === 'deutsch' ? 'Email' : 'Email';
		case 'phones':
			return general.language === 'deutsch' ? 'Telefon' : 'Phone';
		case 'firstContact':
			return general.language === 'deutsch' ? 'Erstkontakt' : 'First Interaction';
		case 'latestContact':
			return general.language === 'deutsch' ? 'Zuletzt Gesehen' : 'Last Seen';
		case 'created':
			return general.language === 'deutsch' ? 'Erstellungsdatum' : 'Creation Date';
		case 'firstName':
			return general.language === 'deutsch' ? 'Vorname' : 'First Name';
		case 'lastName':
			return general.language === 'deutsch' ? 'Nachname' : 'Last Name';
		case 'name':
			return general.language === 'deutsch' ? 'Name' : 'Name';
		case 'notes':
			return general.language === 'deutsch' ? 'Notizen' : 'Notes';
		case 'city':
			return general.language === 'deutsch' ? 'Stadt' : 'City';
		case 'country':
			return general.language === 'deutsch' ? 'Nation' : 'Nation';
		case 'street':
			return general.language === 'deutsch' ? 'Straße' : 'Street';
		case 'zip':
			return general.language === 'deutsch' ? 'Postleitzahl' : 'Postal Code';
		case 'hash':
			return general.language === 'deutsch' ? 'Hash' : 'Hash';
		case 'type':
			return general.language === 'deutsch' ? 'Art' : 'Category';
		case 'bic':
			return general.language === 'deutsch' ? 'BIC' : 'BIC';
		case 'bankCode':
			return general.language === 'deutsch' ? 'BLZ' : 'Bank Code';
		case 'iban':
			return general.language === 'deutsch' ? 'IBAN' : 'IBAN';
		case 'title':
			return general.language === 'deutsch' ? 'Anrede' : 'Title';
		case 'alias':
			return general.language === 'deutsch' ? 'Alias' : 'Alias';
		case 'email':
			return general.language === 'deutsch' ? 'Email' : 'Email';
		case 'phone':
			return general.language === 'deutsch' ? 'Telefonnummer' : 'Phone Number';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		// case '':
		// 	return general.language === 'deutsch' ? '' : '';
		default:
			return column;
	}
}
