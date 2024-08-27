import React, { useRef, useState, useEffect } from 'react';

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

	const [idCol, setIdCol] = useState<string>('');
	const [altIDCol, setAltIDCol] = useState<string>('');
	const [firstContactCol, setFirstContactCol] = useState<string>('');
	const [latestContactCol, setLatestContactCol] = useState<string>('');
	const [descriptionCol, setDescriptionCol] = useState<string>('');
	const [notesCol, setNotesCol] = useState<string>('');
	const [websiteCol, setWebsiteCol] = useState<string>('');

	const idRef = useRef<HTMLSelectElement>(null);
	const altIDRef = useRef<HTMLSelectElement>(null);
	const firstContactRef = useRef<HTMLSelectElement>(null);
	const latestContactRef = useRef<HTMLSelectElement>(null);
	const descriptionRef = useRef<HTMLSelectElement>(null);
	const notesRef = useRef<HTMLSelectElement>(null);
	const websiteRef = useRef<HTMLSelectElement>(null);
	const customerFieldsRefs = useRef<React.RefObject<HTMLSelectElement>[]>([
		idRef,
		altIDRef,
		descriptionRef,
		firstContactRef,
		latestContactRef,
		notesRef,
		websiteRef,
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
		general.language === 'deutsch' ? 'Website' : 'Website',
	];
	const customerKeys = [
		'idRef',
		'altIDRef',
		'descriptionRef',
		'firstContactRef',
		'latestContactRef',
		'notesRef',
		'websiteRef',
	];

	//persons
	const [titleCol, setTitleCol] = useState<string>('');
	const [firstNameCol, setFirstNameCol] = useState<string>('');
	const [lastNameCol, setLastNameCol] = useState<string>('');
	const [personAliasCol, setPersonAliasCol] = useState<string>('');
	const [personEmailCol, setPersonEmailCol] = useState<string>('');
	const [personPhoneCol, setPersonPhoneCol] = useState<string>('');
	const [personNotesCol, setPersonNotesCol] = useState<string>('');

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
	const personKeys = [
		'titleRef',
		'firstNameRef',
		'personAliasRef',
		'lastNameRef',
		'personEmailRef',
		'personPhoneRef',
		'personNotesRef',
	];

	// addresses
	const [addressTypeCol, setAddressTypeCol] = useState<string>('');
	const [streetCol, setStreetCol] = useState<string>('');
	const [cityCol, setCityCol] = useState<string>('');
	const [countryCol, setCountryCol] = useState<string>('');
	const [addressNotesCol, setAddressNotesCol] = useState<string>('');
	const [zipCol, setZipCol] = useState<string>('');

	const addressTypeRef = useRef<HTMLSelectElement>(null);
	const streetRef = useRef<HTMLSelectElement>(null);
	const zipRef = useRef<HTMLSelectElement>(null);
	const cityRef = useRef<HTMLSelectElement>(null);
	const countryRef = useRef<HTMLSelectElement>(null);
	const addressNotesRef = useRef<HTMLSelectElement>(null);
	const addressesFieldsRef = useRef<React.RefObject<HTMLSelectElement>[]>([
		addressTypeRef,
		streetRef,
		zipRef,
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
		general.language === 'deutsch'
			? 'Notizen zur Adresse'
			: 'Notes about address',
	];
	const addressKeys = [
		'addressTypeRef',
		'streetRef',
		'zipRef',
		'cityRef',
		'countryRef',
		'addressNotesRef',
	];

	// banks
	const [ibanCol, setIbanCol] = useState<string>('');
	const [bankNameCol, setBankNameCol] = useState<string>('');
	const [bicCol, setBicCol] = useState<string>('');
	const [bankCodeCol, setBankCodeCol] = useState<string>('');
	const [bankNotesCol, setBankNotesCol] = useState<string>('');

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
	const banksKeys = [
		'bankNameRef',
		'ibanRef',
		'bicRef',
		'bankCodeRef',
		'bankNotesRef',
	];

	// company
	const [companyNameCol, setCompanyNameCol] = useState<string>('');
	const [companyAliasCol, setCompanyAliasCol] = useState<string>('');
	const [companyNotesCol, setCompanyNotesCol] = useState<string>('');
	const [taxIDCol, setTaxIDCol] = useState<string>('');
	const [taxNumberCol, setTaxNumberCol] = useState<string>('');
	const [ustidCol, setUstidCol] = useState<string>('');

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
	const companyKeys = [
		'companyNameRef',
		'companyAliasRef',
		'companyNotesRef',
		'taxIDRef',
		'taxNumberRef',
		'ustidRef',
	];

	// emails
	const [emailCol, setEmailCol] = useState<string>('');
	const [emailTypeCol, setEmailTypeCol] = useState<string>('');
	const [emailNotesCol, setEmailNotesCol] = useState<string>('');

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
	const emailKeys = ['emailRef', 'emailTypeRef', 'emailNotesRef'];

	// phones
	const [phoneCol, setPhoneCol] = useState<string>('');
	const [phoneTypeCol, setPhoneTypeCol] = useState<string>('');
	const [phoneNotesCol, setPhoneNotesCol] = useState<string>('');

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
	const phoneKeys = ['phoneRef', 'phoneTypeRef', 'phoneNotesRef'];

	const inputHandler = (name: string) => {
		switch (name) {
			case 'idRef':
				setIdCol(idRef.current?.value ?? '');
				break;
			case 'altIDRef':
				setAltIDCol(altIDRef.current?.value ?? '');
				break;
			case 'descriptionRef':
				setDescriptionCol(descriptionRef.current?.value ?? '');
				break;
			case 'firstContactRef':
				setFirstContactCol(firstContactRef.current?.value ?? '');
				break;
			case 'latestContactRef':
				setLatestContactCol(latestContactRef.current?.value ?? '');
				break;
			case 'notesRef':
				setNotesCol(notesRef.current?.value ?? '');
				break;
			case 'websiteRef':
				setWebsiteCol(websiteRef.current?.value ?? '');
				break;
			case 'titleRef':
				setTitleCol(titleRef.current?.value ?? '');
				break;
			case 'firstNameRef':
				setFirstNameCol(firstNameRef.current?.value ?? '');
				break;
			case 'personAliasRef':
				setPersonAliasCol(personAliasRef.current?.value ?? '');
				break;
			case 'lastNameRef':
				setLastNameCol(lastNameRef.current?.value ?? '');
				break;
			case 'personEmailRef':
				setPersonEmailCol(personEmailRef.current?.value ?? '');
				break;
			case 'personPhoneRef':
				setPersonPhoneCol(personPhoneRef.current?.value ?? '');
				break;
			case 'personNotesRef':
				setPersonNotesCol(personNotesRef.current?.value ?? '');
				break;
			case 'addressTypeRef':
				setAddressTypeCol(addressTypeRef.current?.value ?? '');
				break;
			case 'streetRef':
				setStreetCol(streetRef.current?.value ?? '');
				break;
			case 'zipRef':
				setZipCol(zipRef.current?.value ?? '');
				break;
			case 'cityRef':
				setCityCol(cityRef.current?.value ?? '');
				break;
			case 'countryRef':
				setCountryCol(countryRef.current?.value ?? '');
				break;
			case 'addressNotesRef':
				setAddressNotesCol(addressNotesRef.current?.value ?? '');
				break;
			case 'bankNameRef':
				setBankNameCol(bankNameRef.current?.value ?? '');
				break;
			case 'ibanRef':
				setIbanCol(ibanRef.current?.value ?? '');
				break;
			case 'bicRef':
				setBicCol(bicRef.current?.value ?? '');
				break;
			case 'bankCodeRef':
				setBankCodeCol(bankCodeRef.current?.value ?? '');
				break;
			case 'bankNotesRef':
				setBankNotesCol(bankNotesRef.current?.value ?? '');
				break;
			case 'companyNameRef':
				setCompanyNameCol(companyNameRef.current?.value ?? '');
				break;
			case 'companyAliasRef':
				setCompanyAliasCol(companyAliasRef.current?.value ?? '');
				break;
			case 'companyNotesRef':
				setCompanyNotesCol(companyNotesRef.current?.value ?? '');
				break;
			case 'taxIDRef':
				setTaxIDCol(taxIDRef.current?.value ?? '');
				break;
			case 'taxNumberRef':
				setTaxNumberCol(taxNumberRef.current?.value ?? '');
				break;
			case 'ustidRef':
				setUstidCol(ustidRef.current?.value ?? '');
				break;
			case 'emailRef':
				setEmailCol(emailRef.current?.value ?? '');
				break;
			case 'emailTypeRef':
				setEmailTypeCol(emailTypeRef.current?.value ?? '');
				break;
			case 'emailNotesRef':
				setEmailNotesCol(emailNotesRef.current?.value ?? '');
				break;
			case 'phoneRef':
				setPhoneCol(phoneRef.current?.value ?? '');
				break;
			case 'phoneTypeRef':
				setPhoneTypeCol(phoneTypeRef.current?.value ?? '');
				break;
			case 'phoneNotesRef':
				setPhoneNotesCol(phoneNotesRef.current?.value ?? '');
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		const map: CustomerSortingMap = {
			row: 'row',
			id: idCol,
			alias: companyAliasCol,
			city: cityCol,
			companyName: companyNameCol,
			country: countryCol,
			email: emailCol,
			firstName: firstNameCol,
			lastName: lastNameCol,
			customerNotes: notesCol,
			phone: phoneCol,
			street: streetCol,
			title: titleCol,
			web: websiteCol,
			zip: zipCol,
			firstContact: firstContactCol,
			latestContact: latestContactCol,
			addressNotes: addressNotesCol,
			personNotes: personNotesCol,
			companyNotes: companyNotesCol,
			bic: bicCol,
			iban: ibanCol,
			bankCode: bankCodeCol,
			bankName: bankNameCol,
			bankNotes: bankNotesCol,
			description: descriptionCol,
		};

		hook.setMap(map);
	}, [
		idCol,
		altIDCol,
		descriptionCol,
		firstContactCol,
		latestContactCol,
		notesCol,
		websiteCol,
		titleCol,
		firstNameCol,
		personAliasCol,
		lastNameCol,
		personEmailCol,
		personPhoneCol,
		personNotesCol,
		addressTypeCol,
		streetCol,
		zipCol,
		cityCol,
		countryCol,
		addressNotesCol,
		bankNameCol,
		ibanCol,
		bicCol,
		bankCodeCol,
		bankNotesCol,
		companyNameCol,
		companyAliasCol,
		companyNotesCol,
		taxIDCol,
		taxNumberCol,
		ustidCol,
		emailCol,
		emailTypeCol,
		emailNotesCol,
		phoneCol,
		phoneTypeCol,
		phoneNotesCol,
	]);
	return (
		<>
			<div className="customerOptions">
				<p>{general.language === 'deutsch' ? 'Kunde' : 'Customer'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(customerKeys[index]);
											},
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
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(personKeys[index]);
											},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Adresse' : 'Address'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(addressKeys[index]);
											},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Bank' : 'Bank'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(banksKeys[index]);
											},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Firma' : 'Company'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(companyKeys[index]);
											},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Email' : 'Email'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(emailKeys[index]);
											},
										}}
									/>
								</div>
							</>
						);
					})}
				</div>
				<p>{general.language === 'deutsch' ? 'Telefon' : 'Phone'}</p>
				<div className="dataRowWrapper">
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
											onInput: () => {
												inputHandler(phoneKeys[index]);
											},
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
