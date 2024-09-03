/*
Quote
  |
  ▼
Invoice
  |
  ▼
Delivery
  |
  ▼
Returnee
 */

export interface QuoteType extends BaseType {
	// unique id for the quote
	id: string;
	// (optional) if the articles are rented when are they going to be returned
	returning?: Date;
	// (optional) time in hours
	duration?: number;
}

export interface InvoiceType extends BaseType {
	// unique identifier
	id: string;
	// total price without discount
	price: PriceType;
	// (optional) total price with discount
	priceWithDiscount?: PriceType;
	// (optional) a discount if there are any to apply
	totalDiscount?: DiscountType;
	parentQuote?: ArrayBuffer;
}

export interface DeliveryType extends BaseType {
	id: string;
	parentQuote: ArrayBuffer;
	parentInvoice: ArrayBuffer;
}

export interface ReturneeType extends BaseType {
	id: string;
	// the Date and time when the item was returned
	returned: Date;
	// (optional) Notes on the returned Items
	notes?: string[];
	parentQuote: ArrayBuffer;
	parentInvoice: ArrayBuffer;
	parentDelivery: ArrayBuffer;
}

interface BaseType {
	customerID: string | string[];
	// all article Ids and how many of them
	articles: ArrayBuffer;
	date: Date;
	addressIDs: {
		/** (optional) the address id stored in the customer_db>addresses with type "shipping" or "both" */
		shipping?: ArrayBuffer;
		/** (optional) the address id stored in the customer_db>addresses with type "billing" or "both" */
		billing?: ArrayBuffer;
	};
}

export type DocumentDBObjectStores = 'deliveries' | 'invoices' | 'quotes' | 'returnees';

export type DocumentSortingMap = {
	row: number;
	deliveries: {};
};
