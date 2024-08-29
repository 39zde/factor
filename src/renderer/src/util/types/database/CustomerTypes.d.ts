export interface Customer {
	row: number;
	/** An unique ID  */
	id: string;
	/** old or alternative Identifiers */
	altIDs?: string[];
	/** Reference Index to persons */
	persons?: ArrayBuffer;
	/** Reference Index to addresses oStore */
	addresses?: ArrayBuffer;
	/** Reference Index to banks oStore */
	banks?: ArrayBuffer;
	/** Reference Index to company oStore  */
	company?: ArrayBuffer;
	/** Reference Index to emails oStore  */
	emails?: ArrayBuffer;
	/** Reference Index to phones oStore  */
	phones?: ArrayBuffer;
	/** Description of the customer; What do they do? */
	description?: string;
	/** Date of the first interaction  */
	firstContact?: Date;
	/** Date of the most recent interaction  */
	latestContact?: Date;
	/** When was this customer added to the database; will be added automatically */
	created: Date;
	/** Anything to remember about the customer */
	notes?: string[];
}

/** Dereferenced Version of Customer. This is what will be posted to main tread */
export interface CustomerRow {
	row: number;
	id: string;
	altIDs?: string[];
	persons?: PersonType[];
	addresses?: AddressType[];
	banks?: BankType[];
	company?: CompanyType;
	emails?: EmailType[];
	phones?: PhoneNumberType[];
	description?: string;
	firstContact?: Date;
	latestContact?: Date;
	created: Date;
	notes?: string[];
}

/** customer_db>persons oStore item */
export interface PersonType {
	row: number;
	/** title */
	title: TitleType;
	/** first Name (including middle Names) */
	firstName: string;
	/** any last Names */
	lastName: string;
	/** (optional) */
	alias?: string[];
	/** Reference numbers  to associated email addresses */
	email?: number[];
	/**  Reference numbers associated phone information */
	phone?: number[] | null | undefined;
	/** (optional) notes on that person */
	notes?: string[];
}

/** customer_db>emails oStore item */
export interface EmailType {
	row: number;
	email: string;
	type?: ContactType;
	notes?: string[];
}

/** customer_db>phones oStore item */
export interface PhoneNumberType {
	row: number;
	// (optional) the type of phone number
	type?: ContactType;
	// phone number
	phone: string;
	// (optional) note for the phone number
	notes?: string[];
}

/** customer_db>addresses oStore item */
export interface AddressType {
	/** unique identifier */
	row: number;
	/** what kind of address */
	type?: ContactType;
	/**  street name */
	street: string;
	/** (optional) the city name */
	city: string;
	/** postal code */
	zip: string;
	/** country or country code */
	country: string;
	/** (optional) additional notes */
	notes?: string[];
	/** hash of the fields street, city and zip. joined with "" */
	hash: string;
}

/** customer_db>banks oStore item */
export interface BankType {
	row: number;
	name: string;
	iban?: string;
	bic?: string;
	bankCode?: string;
	notes?: string[];
}

/** customer_db>company oStore item */
export interface CompanyType {
	row: number;
	name: string;
	alias?: string[];
	notes?: string[];
	tax?: TaxInfos;
}

export interface TaxInfos {
	USTID: string;
	SteuerNummer: string;
	SteuerID: string;
}

export type ContactType =
	| 'private'
	| 'business'
	| 'mobile'
	| 'landline'
	| 'family'
	| 'backup'
	| 'emergency'
	| 'sales'
	| 'media'
	| 'logistics'
	| 'office'
	| 'marketing'
	| 'hr'
	| 'rnd'
	| 'accounting'
	| 'management'
	| 'primary'
	| 'secondary'
	| 'alternative'
	| 'home'
	| 'billing'
	| 'delivery'
	| '';

export interface CustomerSortingMap {
	row: 'row';
	customers: {
		id: string;
		altIDs?: string;
		description?: string;
		firstContact?: string;
		latestContact?: string;
		notes?: string;
		website?: string;
		emails?: {
			type?: string;
			email?: string;
			notes?: string;
		};
		phones?: {
			type?: string;
			phone?: string;
			notes?: string;
		};
	};
	persons?: {
		title?: string;
		firstName?: string;
		personAlias?: string;
		lastName?: string;
		emails?: {
			type?: string;
			email?: string;
			notes?: string;
		};
		phones?: {
			type?: string;
			email?: string;
			notes?: string;
		};
		notes?: string;
	};
	addresses?: {
		type?: string;
		street?: string;
		zip?: string;
		city?: string;
		country?: string;
		notes?: string;
	};
	banks?: {
		name?: string;
		iban?: string;
		bic?: string;
		code?: string;
		notes?: string;
	};
	company?: {
		name?: string;
		alias?: string;
		notes?: string;
		taxID?: string;
		taxNumber?: string;
		ustID?: string;
	};
}

export type CustomerSortingMapProps = keyof CustomerSortingMap;

export type CustomerDBObjectStores =
	| 'customers'
	| 'persons'
	| 'emails'
	| 'phones'
	| 'addresses'
	| 'banks'
	| 'company';
