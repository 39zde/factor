import React, { useRef, useState, useEffect, useId, forwardRef } from 'react';

import { ColumnSetter } from './ColumnSetter';
import { useAppContext } from '@renderer/App';
import type {
	CustomerSortingMap,
	ArticleSortingMap,
} from '@renderer/util/types/types';

export function CustomerSorter({
	columns,
	hook,
}: {
	columns: string[];
	hook: {
		map: any;
		setMap: (newVal: CustomerSortingMap | ArticleSortingMap) => void;
	};
}): React.JSX.Element {
	const { general } = useAppContext();

	const idRef = useRef<HTMLSelectElement>(null);
	const altIDRef = useRef<HTMLSelectElement>(null);
	const firstContactRef = useRef<HTMLSelectElement>(null);
	const latestContactRef = useRef<HTMLSelectElement>(null);
	const descriptionRef = useRef<HTMLSelectElement>(null);
	const notesRef = useRef<HTMLSelectElement>(null);
	const customerFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([
		idRef,
		altIDRef,
		descriptionRef,
		firstContactRef,
		latestContactRef,
		notesRef,
	]);
	const customerFields = [
		general.language === 'deutsch' ? 'Kunden ID' : 'Customers ID',
		general.language === 'deutsch'
			? 'Alternative/Alte Kunden IDs'
			: 'Alternative/Old Customer IDs',
		general.language === 'deutsch' ? 'Beschreibung' : 'Description',
		general.language === 'deutsch'
			? 'Datum des Erstkontakt'
			: 'Date of first Interaction',
		general.language === 'deutsch'
			? 'Datum des jüngsten Kontakts'
			: 'Date of the latest Interaction',
		general.language === 'deutsch'
			? 'Notizen zum Kunden'
			: 'Notes about the Customer',
	];

	//persons
	const titleRef = useRef<HTMLSelectElement>(null);
	const firstNameRef = useRef<HTMLSelectElement>(null);
	const lastNameRef = useRef<HTMLSelectElement>(null);
	const personAliasRef = useRef<HTMLSelectElement>(null);
	const personEmailRef = useRef<HTMLSelectElement>(null);
	const personPhoneRef = useRef<HTMLSelectElement>(null);
	const personNotesRef = useRef<HTMLSelectElement>(null);
	const personFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([
		titleRef,
		firstNameRef,
		personAliasRef,
		lastNameRef,
		personEmailRef,
		personPhoneRef,
		personNotesRef,
	]);

	const personFields = [
		general.language === 'deutsch' ? 'Anrede' : 'Title',
		general.language === 'deutsch' ? 'Vorname' : 'First name',
		general.language === 'deutsch' ? 'Alias' : 'Alias',
		general.language === 'deutsch' ? 'Nachname' : 'Last name',
		general.language === 'deutsch'
			? 'Persönliche Email-Adresse(n)'
			: 'Personal email-address(es)',
		general.language === 'deutsch'
			? 'Persönliche Telefonnummer(n)'
			: 'Personal email-address(es)',
		general.language === 'deutsch'
			? 'Notizen zur Person'
			: 'Notes about this Person',
	];

	// addresses
	const addressTypeRef = useRef<HTMLSelectElement>(null);
	const streetRef = useRef<HTMLSelectElement>(null);
	const cityRef = useRef<HTMLSelectElement>(null);
	const countryRef = useRef<HTMLSelectElement>(null);
	const addressNotesRef = useRef<HTMLSelectElement>(null);
	const addressesFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([
		addressTypeRef,
		streetRef,
		cityRef,
		countryRef,
		addressNotesRef,
	]);
	const addressFields = [
		general.language === 'deutsch' ? 'Art der Adresse' : 'Type of Address',
		general.language === 'deutsch' ? 'Straße' : 'Street',
		general.language === 'deutsch' ? 'Postleitzahl (PLZ)' : 'Zip Code',
		general.language === 'deutsch' ? 'Ort' : 'City',
		general.language === 'deutsch' ? 'Land' : 'Country',
	];

	// banks
	const ibanRef = useRef<HTMLSelectElement>(null);
	const bankNameRef = useRef<HTMLSelectElement>(null);
	const bicRef = useRef<HTMLSelectElement>(null);
	const bankCodeRef = useRef<HTMLSelectElement>(null);
	const bankNotesRef = useRef<HTMLSelectElement>(null);
	const banksFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([
		bankNameRef,
		ibanRef,
		bicRef,
		bankCodeRef,
		bankNotesRef,
	]);

	const bankFields = [
		general.language === 'deutsch' ? 'Name der Bank' : 'Name of Bank',
		general.language === 'deutsch' ? 'IBAN' : 'IBAN',
		general.language === 'deutsch' ? 'BIC' : 'BIC',
		general.language === 'deutsch' ? 'Bankleitzahl (BLZ)' : 'Bank code',
		general.language === 'deutsch'
			? 'Notizen zur Bank'
			: 'Notes about the Bank',
	];

	// company
	const companyNameRef = useRef<HTMLSelectElement>(null);
	const companyAliasRef = useRef<HTMLSelectElement>(null);
	const companyNotesRef = useRef<HTMLSelectElement>(null);
	// company>tax
	const taxIDRef = useRef<HTMLSelectElement>(null);
	const taxNumberRef = useRef<HTMLSelectElement>(null);
	const ustidRef = useRef<HTMLSelectElement>(null);
	const companyFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([
		companyNameRef,
		companyAliasRef,
		companyNotesRef,
		taxIDRef,
		taxNumberRef,
		ustidRef,
	]);

	const companyFields = [
		general.language === 'deutsch' ? 'Firmenname' : 'Company name',
		general.language === 'deutsch' ? 'Firmenalias' : 'Alias of the company',
		general.language === 'deutsch'
			? 'Notizen zur Firma'
			: 'Notes about the company',
		general.language === 'deutsch' ? 'SteuerID' : 'Tax ID',
		general.language === 'deutsch' ? 'Steuernummer' : 'Tax number',
		general.language === 'deutsch' ? 'UstID' : 'UstID',
	];

	// emails
	const emailRef = useRef<HTMLSelectElement>(null);
	const emailTypeRef = useRef<HTMLSelectElement>(null);
	const emailNotesRef = useRef<HTMLSelectElement>(null);
	const emailFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([
		emailRef,
		emailTypeRef,
		emailNotesRef,
	]);
	const emailFields = [
		general.language === 'deutsch' ? 'Kunden-Email' : 'Customer email',
		general.language === 'deutsch'
			? 'Art der Kunden-Email '
			: 'Type of customer email',
		general.language === 'deutsch'
			? 'Notizen zur Kunden-Email'
			: 'Notes about customer email',
	];

	// phones
	const phoneRef = useRef<HTMLSelectElement>(null);
	const phoneTypeRef = useRef<HTMLSelectElement>(null);
	const phoneNotesRef = useRef<HTMLSelectElement>(null);
	const phoneFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([
		phoneRef,
		phoneTypeRef,
		phoneNotesRef,
	]);
	const phoneFields = [
		general.language === 'deutsch'
			? 'Kunden-Telefonnummer'
			: 'Customer phone number',
		general.language === 'deutsch'
			? 'Art der Kunden-Telefonnummer'
			: 'Type of customer phone number',
		general.language === 'deutsch'
			? 'Notizen zur Kunden-Telefonnummer'
			: 'Notes about the customer phone number',
	];

	// useEffect(() => {
	// 	const map: CustomerSortingMap = {
	// 		row: 'row',
	// 		id: idCol,
	// 		alias: aliasCol,
	// 		city: cityCol,
	// 		companyName: companyNameCol,
	// 		country: countryCol,
	// 		email: emailCol,
	// 		firstName: firstNameCol,
	// 		lastName: lastNameCol,
	// 		customerNotes: customerNotesCol,
	// 		phone: phoneCol,
	// 		street: streetCol,
	// 		title: titleCol,
	// 		web: webCol,
	// 		zip: zipCol,
	// 		firstContact: firstContactCol,
	// 		latestContact: latestContactCol,
	// 		addressNotes: addressNotesCol,
	// 		personNotes: personNotesCol,
	// 		companyNotes: companyNotesCol,
	// 		bic: bicCol,
	// 		iban: ibanCol,
	// 		bankCode: bankCodeCol,
	// 		bankName: bankNameCol,
	// 		bankNotes: bankNotesCol,
	// 		description: descriptionCol,
	// 	};

	// 	hook.setMap(map);
	// }, [
	// 	customerNotesCol,
	// 	latestContactCol,
	// 	firstContactCol,
	// 	countryCol,
	// 	cityCol,
	// 	zipCol,
	// 	streetCol,
	// 	aliasCol,
	// 	companyNameCol,
	// 	webCol,
	// 	phoneCol,
	// 	emailCol,
	// 	lastNameCol,
	// 	firstNameCol,
	// 	titleCol,
	// 	idCol,
	// 	addressNotesCol,
	// 	personNotesCol,
	// 	companyNotesCol,
	// 	bicCol,
	// 	ibanCol,
	// 	bankNameCol,
	// 	bankNotesCol,
	// 	bankCodeCol,
	// 	descriptionCol,
	// ]);
	return (
		<>
			<div className="customerOptions">
				<p>Customer</p>
				<div>
					{customerFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={customerFieldsRefs[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>
					{general.language === 'deutsch'
						? 'Zur Person'
						: 'About the Person'}
				</p>
				<div>
					{personFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={personFieldsRefs[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Adresse' : 'Address'}</p>
				<div>
					{addressFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={addressesFieldsRef[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Adresse' : 'Address'}</p>
				<div>
					{addressFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={addressesFieldsRef[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Bank' : 'Bank'}</p>
				<div>
					{bankFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={banksFieldsRef[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Firma' : 'Company'}</p>
				<div>
					{companyFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={companyFieldsRefs[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Email' : 'Email'}</p>
				<div>
					{emailFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={emailFieldsRefs[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Telefon' : 'Phone'}</p>
				<div>
					{phoneFields.map((item, index) => {
						return (
							<>
								<div
									className="dataRow"
									key={`customer-data-row-${index}:${item}`}>
									<ColumnSetter
										ref={phoneFieldsRef[index]}
										props={{
											columns: columns,
											name: item,
											onInput: () => {},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
			</div>
		</>
	);
}
