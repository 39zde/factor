export interface Article {
	row: number;
	// unique article identifier
	articleID: string;
	// article Name
	name: string;
	// total article count in ownership
	count: number | null;
	// (optional) meters or Pieces or hours of work
	unit?: string;
	// (optional) notes regrading the article
	notes?: string[];
	/** price of one Unit */
	price: PriceType;
	// the last time this article experienced some sort of action
	lastSeen?: Date;
	// the security deposit amount for one unit of article
	securityDeposit?: number;
	// (optional) notes on what to look out for while shipping
	shippingNotes?: string[];
	// (optional) acquisition information
	acquisition?: ArrayBuffer;
	// (optional) category Type
	category?: CategoryType[];
	// (optional) how the price changes, when ordering more than one unit
	bulkDiscount?: DiscountRange[];
}

export type PriceType = {
	VAT: number;
	unit: 'EUR' | 'USD';
	/** discount  in percent */
	discount: number;
	/** price without vat and discount */
	price: number;
};

export interface AcquisitionType {
	row: number;
	articleID: string;
	// when the article was obtained
	date: Date;
	// who much of it
	count: number;
	// at what costs
	totalCost: PriceType;
	// (optional) where
	location?: string;
	// (optional) additional notes
	notes?: string[];
	//(optional) some identifier for purchase
	purchaseInvoiceID?: string;
}

// ordered list from first:  parent category -> ...sub categories -> article category
type CategoryType = Set<string>;

/**
 * range: first number marks start, second number marks the end
 * type: should the amount interpreted a percentage or as a monetary value
 * */
export type DiscountRange = {
	range: [number, number];
	/** type applies to the amount prop */
	type: 'percentage' | 'monetary';
	amount: number;
};

export type ArticleDBObjectStores = 'articles' | 'acquisitions';

export type ArticleSortingMap = {
	row: number;
	articles: {};
	discounts: {};
};
