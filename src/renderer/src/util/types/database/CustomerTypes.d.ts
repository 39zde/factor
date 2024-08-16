export interface Customer {
	row: number;
	id: string;
	/**
	 * old or alternative Identifiers
	 */
	altIDs?: string[];
	/**
	 * Reference Index to persons
	 */
	persons?: number[];
	addresses?: number[];
	banks?: number[];
	company?: number;
	emails?: number[];
	phones?: number[];
	description?: string;
	firstContact?: Date;
	latestContact?: Date;
	created: Date;
	notes?: string[]
}

export interface PersonType {
	/**
	 * unique person identifier
	 */
	id: number;
	/**
	 * title
	 */
	title: TitleType;
	/**
	 * first Name (including middle Names)
	 */
	firstName: string;
	/**
	 * any last Names
	 */
	lastName: string;
	/**
	 * (optional)
	 */
	alias?: string[];
	/**
	 * Reference numbers  to associated email addresses
	 */
	email?: number[];
	/**
	 *  Reference numbers associated phone information
	 */
	phone?: number[] | null | undefined;
	/**
	 * (optional) notes on that person
	 *  */
	notes?: string[];
}

export interface EmailType {
	id: number;
	email: string;
	type?: ContactType;
	notes?: string[];
}

export interface PhoneNumberType {
	id: number;
	// (optional) the type of phone number
	type?: ContactType;
	// phone number
	phone: string;
	// (optional) note for the phone number
	notes?: string[];
}

export interface AddressType {
	// unique identifier
	id: number;
	// what kind of address
	type?: ContactType;
	//  street name
	street: string;
	// (optional) street number eg. 12 or 12a
	number?: string;
	// (optional) the city name
	city: string;
	// postal code
	zip: string;
	// country or country code
	country: string;
	// (optional) additional notes
	notes?: string[];
	// hash of street number city zip and country
	hash: string;
}

export interface BankType {
	id: number;
	name: string;
	iban?: string;
	bic?: string;
	bankCode?: string;
	notes?: string[];
}

export interface CompanyType {
	id: number;
	name: string;
	alias?: string[];
	notes?: string[];
	tax?: TaxInfos;
}


export interface TaxInfos {
	USTID: string;
	SteuerNummer: string;
	SteuerID: string
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
	row: string;
	id: string;
	title?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	web?: string;
	companyName?: string;
	alias?: string;
	street?: string;
	zip?: string;
	city?: string;
	country?: string;
	firstContact?: string;
	latestContact?: string;
	customerNotes?: string;
	addressNotes?: string;
	bankNotes?: string;
	emailNotes?: string;
	personNotes?: string;
	phoneNotes?: string;
	personNotes?: string;
	companyNotes?: string;
	iban?: string;
	bic?: string;
	bankName?: string;
	bankCode?: string;
	description?: string;
}

export type CustomerDBObjectStores =
	| 'customer'
	| 'person'
	| 'email'
	| 'phone'
	| 'address'
	| 'bank'
	| 'company';