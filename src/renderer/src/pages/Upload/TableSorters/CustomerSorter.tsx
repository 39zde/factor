import React, { useRef, useState, useEffect } from 'react';

import { ColumnSetter } from './ColumnSetter';
import { useAppContext } from '@renderer/App';
import type { CustomerSortingMap, SorterProps } from '@util/types/types';

export function CustomerSorter({ columns, hook }: SorterProps): React.JSX.Element {
	const { general } = useAppContext();
	const [sortingMap, setSortingMap] = useState<CustomerSortingMap>({
		addresses: {},
		banks: {},
		company: {},
		customers: { id: '' },
		persons: {},
		row: 'row',
	});
	const customerFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const customerFields = [
		general.language === 'deutsch' ? 'Kunden ID' : 'Customers ID',
		general.language === 'deutsch' ? 'Alternative/Alte Kunden IDs' : 'Alternative/Old Customer IDs',
		general.language === 'deutsch' ? 'Beschreibung' : 'Description',
		general.language === 'deutsch' ? 'Datum des Erstkontakt' : 'Date of first Interaction',
		general.language === 'deutsch' ? 'Datum des jüngsten Kontakts' : 'Date of the latest Interaction',
		general.language === 'deutsch' ? 'Notizen zum Kunden' : 'Notes about the Customer',
		general.language === 'deutsch' ? 'Website' : 'Website',
	];
	const customerFieldKeys = ['id', 'altIDs', 'description', 'firstContact', 'latestContact', 'notes', 'website'];
	//  customers emails
	const customersEmailFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const customersEmailFields = [
		general.language === 'deutsch' ? 'Kunden-Email' : 'Customer email',
		general.language === 'deutsch' ? 'Art der Kunden-Email ' : 'Type of customer email',
		general.language === 'deutsch' ? 'Notizen zur Kunden-Email' : 'Notes about customer email',
	];

	const emailFieldKeys = ['email', 'type', 'notes'];

	//  customer phones
	const customerPhoneFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const customerPhoneFields = [
		general.language === 'deutsch' ? 'Kunden-Telefonnummer' : 'Customer phone number',
		general.language === 'deutsch' ? 'Art der Kunden-Telefonnummer' : 'Type of customer phone number',
		general.language === 'deutsch' ? 'Notizen zur Kunden-Telefonnummer' : 'Notes about the customer phone number',
	];
	const phoneFieldKeys = ['phone', 'type', 'notes'];

	//persons
	const personFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const personFields = [
		general.language === 'deutsch' ? 'Anrede' : 'Title',
		general.language === 'deutsch' ? 'Vorname' : 'First name',
		general.language === 'deutsch' ? 'Nachname' : 'Last name',
		general.language === 'deutsch' ? 'Alias' : 'Alias',
		general.language === 'deutsch' ? 'Notizen zur Person' : 'Notes about this Person',
	];
	const personFieldKeys = ['title', 'firstName', 'lastName', 'alias', 'notes'];
	//  customers emails

	const personsEmailFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const personsEmailFields = [
		general.language === 'deutsch' ? 'Person Email' : 'Person email',
		general.language === 'deutsch' ? 'Art der Person-Email ' : 'Type of person email',
		general.language === 'deutsch' ? 'Notizen zur Person-Email' : 'Notes about person email',
	];

	//  person phones

	const personPhoneFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const personPhoneFields = [
		general.language === 'deutsch' ? 'Person-Telefonnummer' : 'Person phone number',
		general.language === 'deutsch' ? 'Art der Person-Telefonnummer' : 'Type of person phone number',
		general.language === 'deutsch' ? 'Notizen zur Kunden-Telefonnummer' : 'Notes about the customer phone number',
	];

	// addresses
	const addressesFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const addressFields = [
		general.language === 'deutsch' ? 'Art der Adresse' : 'Type of Address',
		general.language === 'deutsch' ? 'Straße' : 'Street',
		general.language === 'deutsch' ? 'Postleitzahl (PLZ)' : 'Zip Code',
		general.language === 'deutsch' ? 'Ort' : 'City',
		general.language === 'deutsch' ? 'Land' : 'Country',
		general.language === 'deutsch' ? 'Notizen zur Adresse' : 'Notes about address',
	];
	const addressesFieldKeys = ['type', 'street', 'zip', 'city', 'country', 'notes'];
	// banks
	const banksFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const bankFields = [
		general.language === 'deutsch' ? 'Name der Bank' : 'Name of Bank',
		general.language === 'deutsch' ? 'IBAN' : 'IBAN',
		general.language === 'deutsch' ? 'BIC' : 'BIC',
		general.language === 'deutsch' ? 'Bankleitzahl (BLZ)' : 'Bank code',
		general.language === 'deutsch' ? 'Notizen zur Bank' : 'Notes about the Bank',
	];
	const bankFieldKeys = ['name', 'iban', 'bic', 'code', 'notes'];

	// company
	const companyFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([]);
	const companyFields = [
		general.language === 'deutsch' ? 'Firmenname' : 'Company name',
		general.language === 'deutsch' ? 'Firmenalias' : 'Alias of the company',
		general.language === 'deutsch' ? 'Notizen zur Firma' : 'Notes about the company',
		general.language === 'deutsch' ? 'SteuerID' : 'Tax ID',
		general.language === 'deutsch' ? 'Steuernummer' : 'Tax number',
		general.language === 'deutsch' ? 'UstID' : 'UstID',
	];
	const companyFieldKeys = ['name', 'alias', 'notes', 'taxID', 'taxNumber', 'ustID'];
	const groups = [
		{
			head: general.language === 'deutsch' ? 'Kunde' : 'Customer',
			mapKey: 'customers',
			underlings: [
				{
					name: general.language === 'deutsch' ? 'Kunde' : 'Customer',
					fields: customerFields,
					refGroup: customerFieldsRefs,
					fieldKeys: customerFieldKeys,
				},
				{
					name: general.language === 'deutsch' ? 'Kunden Email' : 'Customer email',
					mapKey: 'emails',
					fields: customersEmailFields,
					refGroup: customersEmailFieldsRefs,
					fieldKeys: emailFieldKeys,
				},
				{
					name: general.language === 'deutsch' ? 'Kunden Telefon' : 'Customer Phone',
					mapKey: 'phones',
					fields: customerPhoneFields,
					refGroup: customerPhoneFieldsRef,
					fieldKeys: phoneFieldKeys,
				},
			],
		},
		{
			head: general.language === 'deutsch' ? 'Person' : 'Person',
			mapKey: 'persons',
			underlings: [
				{
					name: general.language === 'deutsch' ? 'Zur Person' : 'About the Person',
					fields: personFields,
					refGroup: personFieldsRefs,
					fieldKeys: personFieldKeys,
				},
				{
					name: general.language === 'deutsch' ? 'Person Email' : 'Person email',
					mapKey: 'emails',
					fields: personsEmailFields,
					refGroup: personsEmailFieldsRefs,
					fieldKeys: emailFieldKeys,
				},
				{
					name: general.language === 'deutsch' ? 'Person Telefon' : 'Person phone',
					mapKey: 'phones',
					fields: personPhoneFields,
					refGroup: personPhoneFieldsRef,
					fieldKeys: phoneFieldKeys,
				},
			],
		},
		{
			head: general.language === 'deutsch' ? 'Unternehmen' : 'Company',
			mapKey: 'company',
			underlings: [
				{
					name: general.language === 'deutsch' ? 'Firma' : 'Company',
					fields: companyFields,
					refGroup: companyFieldsRefs,
					fieldKeys: companyFieldKeys,
				},
			],
		},
		{
			head: general.language === 'deutsch' ? 'Postanschrift' : 'Address',
			mapKey: 'addresses',
			underlings: [
				{
					name: general.language === 'deutsch' ? 'Adresse' : 'Address',
					fields: addressFields,
					refGroup: addressesFieldsRef,
					fieldKeys: addressesFieldKeys,
				},
			],
		},
		{
			head: general.language === 'deutsch' ? 'Bank' : 'Bank',
			mapKey: 'banks',
			underlings: [
				{
					name: general.language === 'deutsch' ? 'Bank' : 'Bank',
					fields: bankFields,
					refGroup: banksFieldsRef,
					fieldKeys: bankFieldKeys,
				},
			],
		},
	];

	useEffect(() => {
		console.log(sortingMap);
		hook.setMap(sortingMap);
	}, [sortingMap]);

	const inputHandler = (group, subject, index: number) => {
		const currentMap = sortingMap;
		if (subject.mapKey !== undefined) {
			if (currentMap[group.mapKey][subject.mapKey] === undefined) {
				Object.defineProperty(currentMap[group.mapKey], subject.mapKey, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: {},
				});
			}
			Object.defineProperty(currentMap[group.mapKey][subject.mapKey], subject.fieldKeys[index], {
				configurable: true,
				enumerable: true,
				writable: true,
				value: subject.refGroup.current[index].current?.value ?? undefined,
			});
		} else {
			Object.defineProperty(currentMap[group.mapKey], subject.fieldKeys[index], {
				enumerable: true,
				configurable: true,
				writable: true,
				value: subject.refGroup.current[index].current?.value ?? undefined,
			});
		}
		setSortingMap(currentMap);
	};

	return (
		<>
			<div className="customerOptions">
				{groups.map((group) => {
					return (
						<>
							<h2 key={group.head + 'h2'}>{group.head}</h2>
							{group.underlings.map((subject) => {
								return (
									<>
										<p key={group.head + subject.name + 'p'}>{subject.name}</p>
										<div className="dataRowWrapper" key={group.head + subject.name + 'div'}>
											{subject.fields.map((field, index) => {
												const fieldRef = useRef<HTMLSelectElement>(null);
												subject.refGroup.current[index] = fieldRef;
												return (
													<>
														<div className="dataRowWrapper" key={group.head + subject.name + field + 'div'}>
															<ColumnSetter
																columns={columns}
																name={field}
																onInput={() => {
																	inputHandler(group, subject, index);
																}}
																ref={fieldRef}
															/>
														</div>
													</>
												);
											})}
										</div>
									</>
								);
							})}
						</>
					);
				})}
			</div>
		</>
	);
}
