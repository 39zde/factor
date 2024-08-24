// export interface ArticleType {
// 	// unique article identifier
// 	articleID: string;
// 	// article Name
// 	name: string;
// 	// total article count in ownership
// 	count: number | 'n/a' | 'N/A';
// 	// (optional) meters or Pieces or hours of work
// 	unit?: string;
// 	// (optional) notes regrading the article
// 	notes?: string[];
// 	// value added Tax (VAT) in percent
// 	VAT: number;
// 	// price of one Unit of article
// 	price: PriceType;
// 	// the last time this article experienced some sort of action
// 	lastSeen?: Date;
// 	// the security deposit amount for one unit of article
// 	securityDeposit?: number;
// 	// (optional) notes on what to look out for while shipping
// 	shippingNotes?: string[];
// 	// (optional) acquisition information
// 	acquisition?: AcquisitionType[];
// 	// (optional) category Type
// 	category?: CategoryType[];
// 	// (optional) how the price changes, when ordering more than one unit
// 	bulkDiscount?: StepDiscountType | PercentDiscountType;
// }

// export interface PriceType {
// 	withVAT: number;
// 	noVAT: number;
// 	unit: 'EUR' | 'DM' | 'USD';
// }

// export interface AcquisitionType {
// 	// when the article was obtained
// 	date: Date;
// 	// who much of it
// 	count: number;
// 	// at what costs
// 	price: PriceType;
// 	// (optional) where
// 	location?: string;
// 	// (optional) additional notes
// 	notes?: string[];
// 	//(optional) some identifier for purchase
// 	purchaseInvoiceID?: string;
// }

// export interface LastEncounterType {
// 	date: Date;
// 	// (optional) id of corresponding quote
// 	QuoteID?: string;
// 	// (optional) id of corresponding invoice
// 	InvoiceID?: string;
// 	// (optional) id of corresponding delivery note
// 	DeliveryID?: string;
// }

// // ordered list from first:  parent category -> ...sub categories -> article category
// type CategoryType = Set<string>;

// interface StepDiscountType {
// 	type: 'step';
// 	// at what number of items a new price gets applies
// 	steps: number[];
// 	prices: Set<number>;
// 	// (optional) at what price the discount the should be stopped, regardless of count
// 	minPrice?: number;
// }

// export interface PercentDiscountType {
// 	type: 'percent';
// 	// when to apply a new percentage
// 	steps: Set<number>;
// 	// the percentage ( 0 - 100)
// 	percentage: Set<number>;
// 	// (optional) at what price the discount the should be stopped, regardless of count
// 	minPrice?: number;
// }

// export interface DiscountType {
// 	amount: number;
// 	unit: 'EUR' | 'DM' | 'USD' | '%';
// }

// interface BaseType {
// 	customerID: string | string[];
// 	// all article Ids and how many of them
// 	articleList: ArticleListItem[];
// 	date: Date;
// 	addressIDs: {
// 		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "shipping" or "both"
// 		shipping?: string;
// 		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "billing" or "both"
// 		billing?: string;
// 	};
// }

// export interface ArticleListItem {
// 	// the article ID
// 	articleID: string;
// 	// how many
// 	count: number;
// }

export type ArticleDBObjectStores = string
