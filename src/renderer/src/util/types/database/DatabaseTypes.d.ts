export interface CustomerType {
	// unique customer id
	customerID: string;
	// (optional) old customer ids, for backward compatibility
	oldCustomerIDs: string[];
	// (optional) the Corporate person-hood or company name of there are any
	company?: CompanyType;
	// (optional) All associated real persons
	persons?: PersonType[];
	// (optional) associated Addresses
	addresses?: AddressType[];
	// banking info
	bank?: BankType[];
	// (optional) official or primary email address associate with the customer
	email?: EmailType[];
	// (optional)
	phone?: PhoneNumberType[];
	// (optional) the date of the fist meeting
	fistContact?: Date;
	// (optional) the date of the last encounter
	latestContact?: Date;
	// (optional) notes
	note?: string[];
}

export type NameType = {
	// (optional) the name of the company
	name?: string;
	// (optional) alternative names of the company
	alias?: Array<string>;

	// (optional) company description
	description?: string;
	// (optional) any additional Information
	notes?: string[];
};

export type AddressType = {
	// unique identifier
	addressID: string;
	// what kind of address
	type: 'delivery' | 'billing' | 'both' | undefined;
	//  (optional) street name
	street?: string;
	// (optional) street number eg. 12 or 12a
	number?: string;
	// (optional) the city name
	city?: string;
	// (optional) postal code
	zip?: string;
	// (optional) country or country code
	country?: string;
	// (optional) additional notes
	notes?: string[];
};

export type PersonType = {
	// (optional) title
	title?: TitleType;
	// (optional) first Name (including middle Names)
	firstName?: string;
	// (optional) any last Names
	lastName?: string;
	// (optional)
	alias?: string[];
	// (optional) associated email addresses
	email?: string[];
	//  (optional) associated phone numbers
	phone?: PhoneNumberType[];
	// (optional) notes on that person
	notes?: string[];
};

export type TileType =
	| 'Herr'
	| 'Frau'
	| 'Mr.'
	| 'Ms.'
	| 'Dr.'
	| 'Herr Dr.'
	| 'Frau Dr.'
	| 'Herr Dr. med. Dr. jur.'
	| 'Frau Dr. med. Dr. jur.'
	| 'Herr Dr. med.'
	| 'Herr Dr. med. dent.'
	| 'Frau Dr. med.'
	| 'Frau Dr. med. dent.'
	| 'Herr Dr. jur.'
	| 'Frau Dr. jur.'
	| 'Herr Dipl.-Ing.'
	| 'Frau Dipl.-Ing.'
	| 'Herr Dipl.-Kfm.'
	| 'Frau Dipl.-Kfr.'
	| 'Herr Mag.'
	| 'Frau Mag. '
	| undefined;

export type PhoneNumberType = {
	// (optional) the type of phone number
	type?:
		| 'private'
		| 'business'
		| 'mobile'
		| 'landline'
		| 'family'
		| 'backup'
		| 'accounting'
		| 'marketing'
		| 'management'
		| 'office'
		| 'logistics'
		| 'emergency'
		| 'boss'
		| string;
	// phone number
	number: string;
	// (optional) note for the phone number
	notes?: string;
};

export type EmailType = {
	// (optional) the type of email
	type?:
		| 'private'
		| 'business'
		| 'mobile'
		| 'landline'
		| 'family'
		| 'backup'
		| 'accounting'
		| 'marketing'
		| 'management'
		| 'office'
		| 'logistics'
		| 'emergency'
		| 'boss'
		| string;
	// email
	email: string;
	// (optional) note for the phone number
	notes?: string[];
};

export type BankType = {
	bank: string;
	bankCode?: string;
	IBAN?: string;
	BIC?: string;
};

export interface ArticleType {
	// unique article identifier
	articleID: string;
	// article Name
	name: string;
	// total article count in ownership
	count: number | 'n/a' | 'N/A';
	// (optional) meters or Pieces or hours of work
	unit?: string;
	// (optional) notes regrading the article
	notes?: string[];
	// value added Tax (VAT) in percent
	VAT: number;
	// price of one Unit of article
	price: PriceType;
	// the last time this article experienced some sort of action
	lastSeen?: Date;
	// the security deposit amount for one unit of article
	securityDeposit?: number;
	// (optional) notes on what to look out for while shipping
	shippingNotes?: string[];
	// (optional) acquisition information
	acquisition?: AcquisitionType[];
	// (optional) category Type
	category?: CategoryType[];
	// (optional) how the price changes, when ordering more than one unit
	bulkDiscount?: StepDiscountType | PercentDiscountType;
}

export type PriceType = {
	withVAT: number;
	noVAT: number;
	unit: 'EUR' | 'DM' | 'USD';
};

export type AcquisitionType = {
	// when the article was obtained
	date: Date;
	// who much of it
	count: number;
	// at what costs
	price: PriceType;
	// (optional) where
	location?: string;
	// (optional) additional notes
	notes?: string[];
	//(optional) some identifier for purchase
	purchaseInvoiceID?: string;
};

export type LastEncounterType = {
	date: Date;
	// (optional) id of corresponding quote
	QuoteID?: string;
	// (optional) id of corresponding invoice
	InvoiceID?: string;
	// (optional) id of corresponding delivery note
	DeliveryID?: string;
};

// ordered list from first:  parent category -> ...sub categories -> article category
export type CategoryType = Set<string>;

export type StepDiscountType = {
	type: 'step';
	// at what number of items a new price gets applies
	steps: Array<number>;
	prices: Set<number>;
	// (optional) at what price the discount the should be stopped, regardless of count
	minPrice?: number;
};

export type PercentDiscountType = {
	type: 'percent';
	// when to apply a new percentage
	steps: Set<number>;
	// the percentage ( 0 - 100)
	percentage: Set<number>;
	// (optional) at what price the discount the should be stopped, regardless of count
	minPrice?: number;
};

export type DiscountType = {
	amount: number;
	unit: 'EUR' | 'DM' | 'USD' | '%';
};

export interface BaseType {
	customerID: string | string[];
	// all article Ids and how many of them
	articleList: Array<ArticleListItem>;
	date: Date;
	addressIDs: {
		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "shipping" or "both"
		shipping?: string;
		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "billing" or "both"
		billing?: string;
	};
}

export type ArticleListItem = {
	// the article ID
	articleID: string;
	// how many
	count: number;
};
export interface QuoteType extends BaseType {
	// unique id for the quote
	quoteID: string;
	// (optional) if the articles are rented when are they going to be returned
	returning?: Date;
	// (optional) time in hours
	duration?: number;
}

export interface InvoiceType extends BaseType {
	// unique identifier
	invoiceID: string;
	// total price without discount
	price: PriceType;
	// (optional) total price with discount
	priceWithDiscount?: PriceType;
	// (optional) a discount if there are any to apply
	totalDiscount?: DiscountType;
}

export interface DeliveryType extends BaseType {
	deliveryID: string;
}

export interface ReturnType extends BaseType {
	returnID: string;
	// the Date and time when the item was returned
	returned: Date;
	// (optional) Notes on the returned Items
	notes?: string[];
}
