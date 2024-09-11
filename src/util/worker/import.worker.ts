'use strict';
// the use of import modules inside of workers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#browser_compatibility
import type {
	PersonType,
	EmailType,
	PhoneNumberType,
	AddressType,
	BankType,
	CompanyType,
	Customer,
	AddDataArgs,
	DateInput,
	UploadRow,
	DerefPersonType,
	ArticleSortingMap,
	CustomerSortingMap,
	DocumentSortingMap,
	CustomersMap,
	EmailMap,
	PhoneMap,
	ContactType,
	PreInsertCustomer,
	TableRow,
	TableRowCounter
} from '@typings';
import { getAddressHash } from '@util';

self.onmessage = (e: MessageEvent): void => {
	if (e.data.dataBaseName === undefined) {
		return;
	}
	switch (e.data.type) {
		case 'import':
			if (typeof e.data.data !== 'string') {
				return postMessage({
					type: 'error',
					data: 'invalid input: data is not of type string',
				});
			}
			importData(e.data.dataBaseName, e.data.dbVersion, e.data.data);
			break;
		case 'align':
			alignData(e.data.dataBaseName, e.data.dbVersion, e.data.data);
			break;
		case 'rankColsByCondition':
			let condition = e.data.data.condition;
			switch (condition) {
				case 'empty text':
					condition = '';
					break;
				case 'undefined':
					condition = undefined;
					break;
				case 'null':
					condition = null;
					break;
				case '0':
					condition = 0;
					break;
				case 'custom text':
					condition = e.data.data.custom.string;
					break;
				case 'custom number':
					condition = e.data.data.custom.number;
					break;
				default:
					condition = '';
			}
			rankColsByCondition(condition, e.data.dataBaseName, e.data.dbVersion);
			break;
		case 'deleteCol':
			deleteCol(e.data.data);
			break;
		case 'sort':
			sortData(e.data.dataBaseName, e.data.dbVersion, e.data.targetDBName, e.data.data);
			break;
		default:
			return postMessage({
				type: 'error',
				data: `${e.data.type} is an invalid data type`,
			});
	}
};

const templates = new Map([
	[
		'customer',
		{
			id: '',
			row: 0,
			addresses: undefined,
			altIDs: undefined,
			persons: undefined,
			banks: undefined,
			company: undefined,
			emails: undefined,
			phones: undefined,
			description: undefined,
			firstContact: undefined,
			latestContact: undefined,
			created: new Date(),
			website: undefined,
		},
	],
	[
		'persons',
		{
			firstName: '',
			lastName: '',
			row: 0,
			emails: [],
			phones: [],
			title: '',
			alias: undefined,
			notes: undefined,
		},
	],
	[
		'phones',
		{
			row: 0,
			phone: '',
			notes: undefined,
			type: undefined,
		},
	],
	[
		'addresses',
		{
			city: '',
			country: '',
			row: 0,
			street: '',
			zip: '',
			notes: undefined,
			type: undefined,
			hash: undefined,
		},
	],
	[
		'company',
		{
			alias: undefined,
			row: 0,
			name: '',
			notes: undefined,
		},
	],
	[
		'banks',
		{
			row: 0,
			name: '',
			bankCode: undefined,
			bic: undefined,
			iban: '',
			notes: undefined,
		},
	],
]);

function parseDate(input: string, type: DateInput): Date {
	switch (type) {
		case 'YYYYMMDD':
			const arrayed = Array.from(input);
			const year = arrayed.splice(0, 4);
			const month = arrayed.splice(0, 2);
			return new Date(parseInt(year.join('')), parseInt(month.join('')) - 1, parseInt(arrayed.join('')));
		case 'YYYY-MM-DD hh:mm:ss':
			return new Date(input);
		default:
			return new Date();
	}
}

const updateManager = (total: number) => {
	const increment = 0.1;
	let ratchet = 0.1;
	let counter = 0;
	let progress = 0;
	function postUpdate(msg: string): void {
		postMessage({
			type: 'progress',
			data: msg,
		});
	}

	function update(): void {
		counter += 1;
		progress = counter / total;
		if (progress > ratchet) {
			ratchet += increment;
			postUpdate(`${(progress * 100).toFixed(0)}%`);
			if (progress === 1) {
				ratchet = 0.1;
				counter = 0;
				progress = 0;
			}
		}
	}
	return update;
};

function importData(dataBaseName: string, dbVersion: number, data: string) {
	function getKeys(row: string) {
		const keys = row.split(';');
		return keys;
	}
	let rows: string[] = data.split('\n');
	const line: string = rows[0];
	if (line.endsWith('\r')) {
		rows = data.split('\r\n');
	}
	if (rows[rows.length - 1].length === 0) {
		rows.pop();
	}
	const keys = getKeys(rows[0]);
	const request = indexedDB.open(dataBaseName, dbVersion);

	request.onupgradeneeded = () => {
		const db = request.result;
		db.createObjectStore('data_upload', { keyPath: 'row' });
		// console.log('created oStore data_upload');
	};

	request.onsuccess = () => {
		const db = request.result;
		if (db.objectStoreNames.contains('data_upload')) {
			// console.log('db contains data_upload');
			function deleteData(db: IDBDatabase) {
				const transaction = db.transaction('data_upload', 'readwrite', { durability: 'strict' });
				const objectStore = transaction.objectStore('data_upload');
				objectStore.clear();
				transaction.commit();
			}
			function addData({ keys, rows, db }: AddDataArgs) {
				const transaction = db.transaction('data_upload', 'readwrite', { durability: 'strict' });
				const objectStore = transaction.objectStore('data_upload');
				let i = 1;
				while (i < rows.length) {
					const columns = rows[i].split(';');
					const out = {
						row: 0
					} as TableRow;
					out['row'] = i;
					for (let j = 0; j < keys.length; j++) {
						out[keys[j]] = columns[j];
					}
					objectStore.add(out);
					i++;
				}
				transaction.commit();
			}
			deleteData(db);
			addData({ keys, rows, db });
			const copy = [...keys];
			copy.splice(0, 0, 'row');
			return postMessage({
				type: 'imported',
				data: [rows.length, copy],
			});
		}
	};
	request.onerror = () => {
		return postMessage({
			type: 'error',
			data: 'failed to open database',
		});
	};
}

function alignData(
	dataBaseName: string,
	dbVersion: number,
	alignVariables: {
		col: string; // column name
		value: string; // the value of the outlier
		offset: number; // the shift amount
		direction: 'Left' | 'Right'; // the direction to shift to
	}
) {
	function performShift(to: number, item: TableRow) {
		const out = item;
		const copy = structuredClone(item);
		const keys = Object.keys(item);
		if (to > 0) {
			for (let i = 1; i < keys.length; i++) {
				let key = keys[i]
				if (i <= Math.abs(to)) {
					let filler: string | number = '';
					if ((typeof copy[key]) as string === 'number') {
						filler = 0;
					}
					out[key] = filler;
				} else {
					out[key] = out[keys[i - Math.abs(to)]];
				}
			}
		} else if (to < 0) {
			for (let i = 1; i < keys.length; i++) {
				if (i < keys.length - Math.abs(to)) {
					out[keys[i]] = out[keys[i + Math.abs(to)]];
				} else {
					out[keys[i]] = '';
				}
			}
		} else {
			return null;
		}
		return out;
	}

	let shiftAmount = alignVariables.offset;
	if (alignVariables.direction === 'Left') {
		shiftAmount = shiftAmount - 2 * shiftAmount;
	}

	const request = indexedDB.open(dataBaseName, dbVersion);
	request.onsuccess = () => {
		const db = request.result;
		const transaction = db.transaction(['data_upload'], 'readwrite');
		const objectStore = transaction.objectStore('data_upload');
		let count: number;
		const countRequest = objectStore.count();
		countRequest.onsuccess = () => {
			count = countRequest.result;
			return (objectStore.openCursor(null, 'next').onsuccess = (ev) => {
				//@ts-expect-error the event of a IDB request always has a target prop
				const cursor: IDBCursorWithValue | null = ev.target.result;
				if (cursor !== null) {
					if (cursor.value[alignVariables.col] == undefined) {
						cursor.continue();
					}

					if (cursor.value[alignVariables.col] === alignVariables.value) {
						performShift(shiftAmount, cursor.value);
					}

					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						return postMessage({
							type: 'success',
							data: 'aligned values',
						});
					}
				} else {
					// return postMessage({ type: 'error', data: 'invalid cursor' })
				}
			});
		};
	};
}

function rankColsByCondition(dataBaseName: string, dbVersion: number, condition: string | null | number | undefined) {
	function compareItemToCondition(condition: string | null | number | undefined, value: string | number): boolean {
		switch (typeof condition) {
			case undefined:
				if (value === undefined && value !== null) {
					return true;
				}
				return false;
			case null:
				if (value !== undefined && value === null) {
					return true;
				}
				return false;
			case 'number':
				if (typeof value === 'number' || typeof value === 'bigint') {
					if (value === condition) {
						return true;
					}
				} else {
					if (condition) {
						if (value === condition.toString()) {
							return true;
						}
					}
				}
				return false;
			case 'string':
				if (typeof condition === 'string') {
					if (condition.length === 0) {
						if (typeof value === 'string') {
							if (value.trim().length === 0) {
								return true;
							}
						} else {
							if (typeof value === 'undefined' || typeof value === null) {
							}
						}
					} else {
						if (value === condition) {
							return true;
						}
					}
					return false;
				}
				return false;
			default:
				return false;
		}
	}

	const dbRequest = indexedDB.open(dataBaseName, dbVersion);
	dbRequest.onsuccess = () => {
		const db: IDBDatabase = dbRequest.result;
		const t = db.transaction('data_upload');
		const objStore = t.objectStore('data_upload');
		const keysRequest = objStore.count();
		keysRequest.onsuccess = () => {
			const count = keysRequest.result;
			const keysReq = objStore.get(1);
			keysReq.onsuccess = () => {
				let firstRow: TableRow = keysReq.result
				const keys = Object.keys(firstRow);
				keys.splice(keys.indexOf('row'), 1);
				const counter = firstRow as TableRowCounter;
				const update = updateManager(count * keys.length);
				for (const [k] of Object.entries(counter)) {
					counter[k] = 0;
				}

				objStore.openCursor(null, 'next').onsuccess = (e) => {
					//@ts-expect-error the event of a IDB request always has a target prop
					const cursor: IDBCursorWithValue | null = e.target.result;
					if (cursor) {
						for (const key of keys) {
							update();
							const value = cursor.value[key];
							const test = compareItemToCondition(condition, value);
							if (test) {
								counter[key] = counter[key] + 1;
							}
						}

						//@ts-expect-error since the cursor is not null it therefore has to have a key prop
						if (cursor.key < count) {
							cursor.continue();
						} else {
							const ranking = Object.entries(counter);
							ranking.sort((a, b) => b[1] - a[1]);
							postMessage({ type: 'ranking', data: ranking });
						}
					} else {
						return postMessage({
							type: 'error',
							data: 'cursor is null',
						});
					}
				};
			};
		};
	};
}

function deleteCol(col: string) {
	const dbRequest = indexedDB.open('factor_db');
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		const transaction = db.transaction('data_upload', 'readwrite', {
			durability: 'strict',
		});
		const objStore = transaction.objectStore('data_upload');
		const countRequest = objStore.count();
		countRequest.onsuccess = () => {
			const count = countRequest.result;
			const cursorRequest = objStore.openCursor(null, 'next');
			cursorRequest.onsuccess = () => {
				const cursor: IDBCursorWithValue | null = cursorRequest.result;
				if (cursor) {
					const newValue = cursor.value;
					delete newValue[col];
					cursor.update(newValue);

					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						postMessage({
							type: 'colDeletion',
							data: `deleted col: ${col}`,
						});
					}
				}
			};
		};
	};
}

function sortData(
	dataBaseName: string,
	dbVersion: number,
	targetDBName: 'article_db' | 'customer_db' | 'document_db',
	sortingMap: CustomerSortingMap | ArticleSortingMap | DocumentSortingMap
) {
	const request = indexedDB.open(dataBaseName, dbVersion);
	request.onsuccess = () => {
		const sourceDB = request.result;
		const dbTransaction = sourceDB.transaction('data_upload', 'readonly');
		const dataUpload = dbTransaction.objectStore('data_upload');
		const dataUploadCountRequest = dataUpload.count();

		dataUploadCountRequest.onsuccess = () => {
			const dataCount = dataUploadCountRequest.result;
			const update = updateManager(dataCount);
			const cursorRequest = dataUpload.openCursor(null, 'next');

			function parseCustomerData(dataBaseName: string, dbVersion: number, map: CustomerSortingMap, row: UploadRow) {
				const customerDBrequest = indexedDB.open(dataBaseName, dbVersion);

				customerDBrequest.onupgradeneeded = function upgradeCustomerDB(e: IDBVersionChangeEvent): void {
					const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
					const db = target.result;
					const stores = db.objectStoreNames;

					if (!stores.contains('customers')) {
						const customer = db.createObjectStore('customers', {
							keyPath: 'row',
						});
						customer.createIndex('customers-id', 'id', {
							unique: true,
						});
					}

					if (!stores.contains('persons')) {
						const persons = db.createObjectStore('persons', {
							keyPath: 'row',
						});

						persons.createIndex('persons-lastName', 'lastName', {
							unique: false,
						});

						persons.createIndex('persons-firstName', 'firstName', {
							unique: false,
						});
					}

					if (!stores.contains('emails')) {
						const email = db.createObjectStore('emails', {
							keyPath: 'row',
						});

						email.createIndex('emails-email', 'email', {
							unique: true,
						});
					}

					if (!stores.contains('phones')) {
						const phone = db.createObjectStore('phones', {
							keyPath: 'row',
						});

						phone.createIndex('phones-phone', 'phone', {
							unique: true,
						});
					}

					if (!stores.contains('addresses')) {
						const address = db.createObjectStore('addresses', {
							keyPath: 'row',
						});

						address.createIndex('addresses-street', 'street', {
							unique: false,
						});
						address.createIndex('addresses-city', 'city', {
							unique: false,
						});
						address.createIndex('addresses-zip', 'zip', {
							unique: false,
						});
						address.createIndex('addresses-country', 'country', {
							unique: false,
						});
						address.createIndex('addresses-hash', 'hash', {
							unique: true,
						});
					}

					if (!stores.contains('banks')) {
						const bank = db.createObjectStore('banks', {
							keyPath: 'row',
						});

						bank.createIndex('banks-name', 'name', {
							multiEntry: true,
						});
						bank.createIndex('banks-iban', 'iban', {
							unique: true,
						});
					}

					if (!stores.contains('company')) {
						const company = db.createObjectStore('company', {
							keyPath: 'row',
						});

						company.createIndex('company-name', 'name', {
							unique: false,
						});

						company.createIndex('company-taxID', 'taxID', {
							unique: false,
						});
						company.createIndex('company-taxNumber', 'taxNumber', {
							unique: false,
						});
						company.createIndex('company-ustID', 'ustID', {
							unique: false,
						});
					}
				};

				customerDBrequest.onsuccess = () => {
					// variable definitions
					const customerDB = customerDBrequest.result;
					const oStores = customerDB.objectStoreNames;
					const customer = structuredClone(templates.get('customer')) as PreInsertCustomer;
					const customerCounter = {
						count: 0,
						total: 0,
					};
					const customerTrackerHandler = {
						set(target: typeof customerCounter, prop: "count" | "total", value: number) {
							target[prop] = value;
							if (prop === 'count') {
								if (target['count'] == target['total']) {
									insertCustomers(customer);
								}
							}
							return true;
						},
					};
					const customerTracker = new Proxy<typeof customerCounter>(customerCounter, customerTrackerHandler);
					// function definitions
					// these need to be done in the customerDB request scope to 'function' properly
					function insertEmail(data: EmailType, callback: (result: number | null) => void): void {
						if (oStores.contains('emails')) {
							const emailTransaction = customerDB.transaction('emails', 'readwrite', { durability: 'strict' });
							const oStoreEmail = emailTransaction.objectStore('emails');
							if (oStoreEmail.indexNames.contains('emails-email')) {
								const emailIndex = oStoreEmail.index('emails-email');
								const emailIndexRequest = emailIndex.get(data.email);
								emailIndexRequest.onsuccess = () => {
									if (emailIndexRequest.result !== undefined) {
										// the email already exists
										const preexistingEmailRow = emailIndexRequest.result as EmailType;
										if (data.notes !== undefined) {
											if (preexistingEmailRow.notes !== undefined) {
												preexistingEmailRow.notes = [...preexistingEmailRow.notes, ...data.notes];
											} else {
												preexistingEmailRow.notes = data.notes;
											}
										}
										if (data.type !== undefined) {
											preexistingEmailRow.type = data.type;
										}
										const putRequest = oStoreEmail.put(preexistingEmailRow);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											emailTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											emailTransaction.commit();
										};
									} else {
										// the email does not exist already
										const emailCountRequest = oStoreEmail.count();
										emailCountRequest.onsuccess = () => {
											const emailCount = emailCountRequest.result;
											data.row = emailCount + 1;
											const addRequest = oStoreEmail.add(data);
											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												emailTransaction.commit();
											};
											addRequest.onerror = () => {
												callback(null);
												emailTransaction.commit();
											};
										};
										emailCountRequest.onerror = () => {
											callback(null);
											emailTransaction.commit();
										};
									}
								};
								emailIndexRequest.onerror = () => {
									callback(null);
									emailTransaction.commit();
								};
							} else {
								callback(null);
								emailTransaction.commit();
							}
						} else {
							callback(null);
						}
					}

					function insertPhone(data: PhoneNumberType, callback: (result: number | null) => void): void {
						if (oStores.contains('phones')) {
							const phoneTransaction = customerDB.transaction('phones', 'readwrite', { durability: 'strict' });
							const oStorePhone = phoneTransaction.objectStore('phones');
							if (oStorePhone.indexNames.contains('phones-phone')) {
								const phoneIndex = oStorePhone.index('phones-phone');
								const phoneIndexRequest = phoneIndex.get(data.phone);
								phoneIndexRequest.onsuccess = () => {
									if (phoneIndexRequest.result !== undefined) {
										// the phone already exists
										const preexistingPhoneRow = phoneIndexRequest.result as PhoneNumberType;
										if (data.notes !== undefined) {
											if (preexistingPhoneRow.notes !== undefined) {
												preexistingPhoneRow.notes = [...preexistingPhoneRow.notes, ...data.notes];
											} else {
												preexistingPhoneRow.notes = data.notes;
											}
										}
										if (data.type !== undefined) {
											preexistingPhoneRow.type = data.type;
										}
										const putRequest = oStorePhone.put(preexistingPhoneRow);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											phoneTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											phoneTransaction.commit();
										};
									} else {
										// the phone does not exist already
										const phoneCountRequest = oStorePhone.count();
										phoneCountRequest.onsuccess = () => {
											const phoneCount = phoneCountRequest.result;
											data.row = phoneCount + 1;
											const addRequest = oStorePhone.add(data);
											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												phoneTransaction.commit();
											};
											addRequest.onerror = () => {
												callback(null);
												phoneTransaction.commit();
											};
										};
										phoneCountRequest.onerror = () => {
											callback(null);
											phoneTransaction.commit();
										};
									}
								};
								phoneIndexRequest.onerror = () => {
									callback(null);
									phoneTransaction.commit();
								};
							} else {
								callback(null);
								phoneTransaction.commit();
							}
						} else {
							callback(null);
						}
					}

					function insertAddress(data: AddressType, callback: (result: number | null) => void): void {
						//add address to indexedDB
						if (oStores.contains('addresses')) {
							const addressesTransaction = customerDB.transaction('addresses', 'readwrite', { durability: 'strict' });
							const oStoreAddresses = addressesTransaction.objectStore('addresses');
							if (oStoreAddresses.indexNames.contains('addresses-hash')) {
								const addressIndex = oStoreAddresses.index('addresses-hash');
								const addressIndexRequest = addressIndex.get(data.hash);

								addressIndexRequest.onsuccess = () => {
									if (addressIndexRequest.result !== undefined) {
										// address exist already
										const addressRow = addressIndexRequest.result as AddressType;
										if (data.notes !== undefined) {
											if (addressRow.notes !== undefined) {
												addressRow.notes = [...addressRow.notes, ...data.notes];
											} else {
												addressRow.notes = data.notes;
											}
										}
										if (data.country !== undefined) {
											addressRow.country = data.country;
										}
										if (data.type !== undefined) {
											addressRow.type = data.type;
										}
										const putRequest = oStoreAddresses.put(addressRow);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											addressesTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											addressesTransaction.commit();
										};
									} else {
										// address does not exist already
										const addressesCountRequest = oStoreAddresses.count();
										addressesCountRequest.onsuccess = () => {
											const addressCount = addressesCountRequest.result;
											data.row = addressCount + 1;
											const addRequest = oStoreAddresses.add(data);

											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												addressesTransaction.commit();
											};

											addRequest.onerror = () => {
												callback(null);
												addressesTransaction.commit();
											};
										};
										addressesCountRequest.onerror = () => {
											callback(null);
											addressesTransaction.commit();
										};
									}
								};

								addressIndexRequest.onerror = () => {
									callback(null);
									addressesTransaction.commit();
								};
							} else {
								callback(null);
								addressesTransaction.commit();
							}
						} else {
							callback(null);
						}
					}

					function insertBank(data: BankType, callback: (result: number | null) => void): void {
						//add bank to indexedDB
						if (oStores.contains('banks')) {
							const bankTransaction = customerDB.transaction('banks', 'readwrite', { durability: 'strict' });
							const oStoreBank = bankTransaction.objectStore('banks');
							if (oStoreBank.indexNames.contains('banks-iban') && data.iban !== undefined) {
								const bankIndex = oStoreBank.index('banks-iban');
								const bankIndexRequest = bankIndex.get(data.iban);
								bankIndexRequest.onsuccess = () => {
									if (bankIndexRequest.result !== undefined) {
										// the iban already exists
										const preexistingBankRow = bankIndexRequest.result as BankType;
										if (data.notes !== undefined) {
											if (preexistingBankRow.notes !== undefined) {
												preexistingBankRow.notes = [...preexistingBankRow.notes, ...data.notes];
											} else {
												preexistingBankRow.notes = data.notes;
											}
										}
										if (data.bankCode !== undefined) {
											preexistingBankRow.bankCode = data.bankCode;
										}
										if (data.bic !== undefined) {
											preexistingBankRow.bic = data.bic;
										}
										if (data.name !== undefined) {
											preexistingBankRow.name = data.name;
										}

										const putRequest = oStoreBank.put(preexistingBankRow);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											bankTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											bankTransaction.commit();
										};
									} else {
										// the iban does not exist already
										const bankCountRequest = oStoreBank.count();
										bankCountRequest.onsuccess = () => {
											const bankCount = bankCountRequest.result;
											data.row = bankCount + 1;
											const addRequest = oStoreBank.add(data);
											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												bankTransaction.commit();
											};
											addRequest.onerror = () => {
												callback(null);
												bankTransaction.commit();
											};
										};
										bankCountRequest.onerror = () => {
											callback(null);
											bankTransaction.commit();
										};
									}
								};
								bankIndexRequest.onerror = () => {
									callback(null);
									bankTransaction.commit();
								};
							} else {
								callback(null);
								bankTransaction.commit();
							}
						} else {
							callback(null);
						}
					}

					function insertCompany(data: CompanyType, callback: (result: number | null) => void): void {
						// add company to indexedDB0
						if (oStores.contains('company')) {
							const companyTransaction = customerDB.transaction('company', 'readwrite', { durability: 'strict' });
							const oStoreCompany = companyTransaction.objectStore('company');
							if (oStoreCompany.indexNames.contains('company-name')) {
								const companyIndex = oStoreCompany.index('company-name');
								const companyIndexRequest = companyIndex.get(data.name);
								companyIndexRequest.onsuccess = () => {
									if (companyIndexRequest.result !== undefined) {
										// the iban already exists
										const preexistingCompanyRow = companyIndexRequest.result as CompanyType;
										if (data.notes !== undefined) {
											if (preexistingCompanyRow.notes !== undefined) {
												preexistingCompanyRow.notes = [...preexistingCompanyRow.notes, ...data.notes];
											} else {
												preexistingCompanyRow.notes = data.notes;
											}
										}
										if (data.alias !== undefined) {
											if (preexistingCompanyRow.alias !== undefined) {
												preexistingCompanyRow.alias = [...preexistingCompanyRow.alias, ...data.alias];
											} else {
												preexistingCompanyRow.alias = data.alias;
											}
										}

										if (data.taxID !== undefined) {
											preexistingCompanyRow.taxID = data.taxID;
										}

										if (data.taxNumber !== undefined) {
											preexistingCompanyRow.taxNumber = data.taxNumber;
										}

										const putRequest = oStoreCompany.put(preexistingCompanyRow);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											companyTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											companyTransaction.commit();
										};
									} else {
										// the iban does not exist already
										const companyCountRequest = oStoreCompany.count();
										companyCountRequest.onsuccess = () => {
											const companyCount = companyCountRequest.result;
											data.row = companyCount + 1;
											const addRequest = oStoreCompany.add(data);
											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												companyTransaction.commit();
											};
											addRequest.onerror = () => {
												callback(null);
												companyTransaction.commit();
											};
										};
										companyCountRequest.onerror = () => {
											callback(null);
											companyTransaction.commit();
										};
									}
								};
								companyIndexRequest.onerror = () => {
									callback(null);
									companyTransaction.commit();
								};
							} else {
								callback(null);
								companyTransaction.commit();
							}
						} else {
							callback(null);
						}
					}

					function insertPerson(data: PersonType, callback: (status: boolean, rowNumber?: number) => void): void {
						if (oStores.contains('persons')) {
							const personsTransaction = customerDB.transaction('persons', 'readwrite', { durability: 'strict' });
							const oStorePersons = personsTransaction.objectStore('persons');
							const personsCountRequest = oStorePersons.count();
							personsCountRequest.onsuccess = () => {
								const personsCount = personsCountRequest.result;
								data.row = personsCount + 1;
								const addRequest = oStorePersons.add(data);
								addRequest.onsuccess = () => {
									personsTransaction.commit();
									callback(true, addRequest.result as number);
								};

								addRequest.onerror = () => {
									personsTransaction.commit();
									callback(false);
								};
							};
							personsCountRequest.onerror = () => {
								personsTransaction.commit();
								callback(false);
							};
						} else {
							callback(false);
						}
					}

					function insertCustomer(data: Customer, callback: (rowNumber: number | null) => void): void {
						if (oStores.contains('customers')) {
							const customerTransaction = customerDB.transaction('customers', 'readwrite', { durability: 'strict' });
							const oStoreCustomers = customerTransaction.objectStore('customers');
							if (oStoreCustomers.indexNames.contains('customers-id')) {
								const customerIndex = oStoreCustomers.index('customers-id');
								const customersIndexRequest = customerIndex.get(data.id);
								customersIndexRequest.onsuccess = () => {
									if (customersIndexRequest.result !== undefined) {
										// the customer already exists
										// so we update the data
										const preexistingCustomer = customersIndexRequest.result as Customer;
										if (data.addresses !== undefined) {
											preexistingCustomer.addresses = updateArrayBuffer(preexistingCustomer.addresses, data.addresses);
										}
										if (data.banks !== undefined) {
											preexistingCustomer.banks = updateArrayBuffer(preexistingCustomer.banks, data.banks);
										}
										if (data.company !== undefined) {
											preexistingCustomer.company = updateArrayBuffer(preexistingCustomer.company, data.company);
										}
										if (data.description !== undefined) {
											preexistingCustomer.description = data.description;
										}
										if (data.notes !== undefined) {
											if (preexistingCustomer.notes !== undefined) {
												preexistingCustomer.notes = [...preexistingCustomer.notes, ...data.notes];
											} else {
												preexistingCustomer.notes = data.notes;
											}
										}
										if (data.altIDs !== undefined) {
											if (preexistingCustomer.altIDs !== undefined) {
												preexistingCustomer.altIDs = [...preexistingCustomer.altIDs, ...data.altIDs];
											} else {
												preexistingCustomer.altIDs = data.altIDs;
											}
										}
										if (data.emails !== undefined) {
											preexistingCustomer.emails = updateArrayBuffer(preexistingCustomer.emails, data.emails);
										}
										if (data.persons !== undefined) {
											preexistingCustomer.persons = updateArrayBuffer(preexistingCustomer.persons, data.persons);
										}
										if (data.phones !== undefined) {
											preexistingCustomer.phones = updateArrayBuffer(preexistingCustomer.phones, data.phones);
										}
										if (data.firstContact !== undefined) {
											preexistingCustomer.firstContact = data.firstContact;
										}
										if (data.latestContact !== undefined) {
											preexistingCustomer.latestContact = data.latestContact;
										}
										if (data.website !== undefined) {
											preexistingCustomer.website = data.website;
										}
										const putRequest = oStoreCustomers.put(preexistingCustomer);
										putRequest.onsuccess = () => {
											callback(putRequest.result as number);
											customerTransaction.commit();
										};
										putRequest.onerror = () => {
											callback(null);
											customerTransaction.commit();
										};
									} else {
										// the customer does not already exist
										// we can add
										const customersCountRequest = oStoreCustomers.count();
										customersCountRequest.onsuccess = () => {
											const customerCount = customersCountRequest.result;
											data.row = customerCount + 1;
											const addRequest = oStoreCustomers.add(data);
											addRequest.onsuccess = () => {
												callback(addRequest.result as number);
												customerTransaction.commit();
											};
											addRequest.onerror = () => {
												callback(null);
												customerTransaction.commit();
											};
										};
									}
								};
								customersIndexRequest.onerror = () => {
									callback(null);
									customerTransaction.commit();
								};
							}
						} else {
							callback(null);
						}
					}

					function insertCustomers(customer: PreInsertCustomer) {
						parseCustomer([customer], (result: Customer[] | null) => {
							if (result !== null) {
								for (let i = 0; i < result.length; i++) {
									insertCustomer(result[i], (rowNumber: number | null) => {
										if (rowNumber !== null) {
											// console.log('done with customer in row : ' + rowNumber);
										}
									});
								}
							}
						});
					}

					function parsePersons(data: DerefPersonType[], callback: (result: PersonType[] | null) => void): void {
						const reffedPersons: PersonType[] = [];
						let emailHolder = new WeakMap();
						let phoneHolder = new WeakMap();
						const counter = {
							count: 0,
							total: 0,
						};

						const counterHandler = {
							set(target: typeof counter, prop: "count" | "total", value: number) {
								target[prop] = value;
								if (prop === 'count') {
									if (target['count'] === target['total']) {
										callback(reffedPersons);
										counter.count = 0;
										counter.count = 0;
										phoneHolder = new WeakMap();
										emailHolder = new WeakMap();
									}
								}
								return true;
							},
						};
						const tracker = new Proxy<typeof counter>(counter, counterHandler);

						for (let i = 0; i < data.length; i++) {
							emailHolder.set(data[i], data[i].emails);
							phoneHolder.set(data[i], data[i].phones);
							const refPerson = data[i] as PersonType;
							refPerson.emails = undefined;
							refPerson.phones = undefined;
							reffedPersons[i] = refPerson;

							if (emailHolder.get(data[i]) !== undefined) {
								for (let j = 0; j < emailHolder.get(data[i]).length; j++) {
									tracker.total += 1;
									insertEmail(emailHolder.get(data[i])[j], (result: number | null) => {
										if (result !== null) {
											reffedPersons[i].emails = updateArrayBuffer(reffedPersons[i].emails, result);
										}
										tracker.count += 1;
									});
								}
							}

							if (phoneHolder.get(data[i]) !== undefined) {
								for (let j = 0; j < phoneHolder.get(data[i]).length; j++) {
									tracker.total += 1;
									insertPhone(phoneHolder.get(data[i])[j], (result: number | null) => {
										if (result !== null) {
											reffedPersons[i].phones = updateArrayBuffer(reffedPersons[i].phones, result);
										}
										tracker.count += 1;
									});
								}
							}
						}
					}

					function parseAddress(data: AddressType[], callback: (rowNumbers: number[]) => void): void {
						const weakMap = new WeakMap();
						const addressReferences: number[] = [];
						weakMap.set(data, addressReferences);
						const counter = {
							count: 0,
							total: 0,
						};
						const trackerHandler = {
							set(target: typeof counter, prop: "count" | "total", value: number) {
								target[prop] = value;
								if (prop === 'count') {
									if (target['count'] === target['total']) {
										callback(weakMap.get(data));
									}
								}
								return true;
							},
						};
						const tracker = new Proxy<typeof counter>(counter, trackerHandler);
						for (let i = 0; i < data.length; i++) {
							getAddressHash(data[i].street, data[i].zip, data[i].city).then((hash: string) => {
								data[i].hash = hash;
								tracker.total += 1;
								insertAddress(data[i], (result: number | null) => {
									if (result !== null) {
										weakMap.get(data).push(result);
									}
									tracker.count += 1;
								});
							});
						}
					}

					function parseBanks(data: BankType[], callback: (rowNumbers: number[]) => void): void {
						const weakMap = new WeakMap();
						const companyReferences: number[] = [];
						weakMap.set(data, companyReferences);
						const counter = {
							count: 0,
							total: 0,
						};
						const trackerHandler = {
							set(target: typeof counter, prop: "count"|"total", value: number) {
								target[prop] = value;
								if (prop === 'count') {
									if (target['count'] === target['total']) {
										callback(weakMap.get(data));
									}
								}
								return true;
							},
						};
						const tracker = new Proxy<typeof counter>(counter, trackerHandler);
						for (let i = 0; i < data.length; i++) {
							tracker.total += 1;
							insertBank(data[i], (result: number | null) => {
								if (result !== null) {
									weakMap.get(data).push(result);
								}
								tracker.count += 1;
							});
						}
					}

					function parseCompany(data: CompanyType[], callback: (rowNumbers: number[]) => void): void {
						const weakMap = new WeakMap();
						const companyReferences: number[] = [];
						weakMap.set(data, companyReferences);
						const counter = {
							count: 0,
							total: 0,
						};
						const trackerHandler = {
							set(target: typeof counter, prop: "count" | "total", value: number) {
								target[prop] = value;
								if (prop === 'count') {
									if (target['count'] === target['total']) {
										callback(weakMap.get(data));
									}
								}
								return true;
							},
						};
						const tracker = new Proxy<typeof counter>(counter, trackerHandler);
						for (let i = 0; i < data.length; i++) {
							tracker.total += 1;
							insertCompany(data[i], (result: number | null) => {
								if (result !== null) {
									weakMap.get(data).push(result);
								}
								tracker.count += 1;
							});
						}
					}

					function parseCustomer(data: PreInsertCustomer[], callback: (result: Customer[] | null) => void): void {
						const reffedCustomers: Customer[] = [];
						let emailHolder = new WeakMap();
						let phoneHolder = new WeakMap();
						const counter = {
							count: 0,
							total: 0,
						};

						const counterHandler = {
							set(target: typeof counter, prop: "count" | "total", value: number) {
								target[prop] = value;
								if (prop === 'count') {
									if (target['count'] === target['total']) {
										callback(reffedCustomers);
										counter.count = 0;
										counter.count = 0;
										phoneHolder = new WeakMap();
										emailHolder = new WeakMap();
									}
								}
								return true;
							},
						};
						const tracker = new Proxy<typeof counter>(counter, counterHandler);

						for (let i = 0; i < data.length; i++) {
							emailHolder.set(data[i], data[i].emails);
							phoneHolder.set(data[i], data[i].phones);
							const refCustomer = data[i] as Customer;
							refCustomer.emails = undefined;
							refCustomer.phones = undefined;
							reffedCustomers[i] = refCustomer;

							if (emailHolder.get(data[i]) !== undefined) {
								for (let j = 0; j < emailHolder.get(data[i]).length; j++) {
									tracker.total += 1;
									insertEmail(emailHolder.get(data[i])[j], (result: number | null) => {
										if (result !== null) {
											reffedCustomers[i].emails = updateArrayBuffer(reffedCustomers[i].emails, result);
										}
										tracker.count += 1;
									});
								}
							}

							if (phoneHolder.get(data[i]) !== undefined) {
								for (let j = 0; j < phoneHolder.get(data[i]).length; j++) {
									tracker.total += 1;
									insertPhone(phoneHolder.get(data[i])[j], (result: number | null) => {
										if (result !== null) {
											reffedCustomers[i].phones = updateArrayBuffer(reffedCustomers[i].phones, result);
										}
										tracker.count += 1;
									});
								}
							}
						}
					}

					//the actual sorting logic

					customer.id = trimWhiteSpace(row[map.customers.id] as string);
					customer.row = row.row;
					customer.created = new Date();

					const quedPersons: DerefPersonType[] = [];
					const quedAddresses: AddressType[] = [];
					const quedBanks: BankType[] = [];
					const quedCompany: CompanyType[] = [];

					// fill oStoreItems with templates
					// the templates as filled with values from row[...]
					for (const [k, v] of Object.entries(map)) {
						// walk the map
						const key = k as keyof CustomerSortingMap;
						if (key !== 'row' && key !== 'customers') {
							// if the prop is not "row"
							// and also not email
							// and also not phone
							// because those are nested
							// get the value of the prop
							const value: CustomerSortingMap[typeof key] = v;
							const mainKey: 'persons' | 'banks' | 'addresses' | 'company' = key;
							if (Object.keys(value).length !== 0) {
								// if there are actually any props in value
								// clone the correct template
								const template = structuredClone(templates.get(mainKey));
								for (const [nk, nv] of Object.entries(value)) {
									// walk the value
									const nestedValue = nv; // this is the columnsName in row
									const nestedKey = nk;
									if (typeof nestedValue === 'string') {
										// if the value is not undefined
										if (nestedKey !== 'emails' && nestedKey !== 'phones') {
											// we do not have another layer
											Object.defineProperty(template, nestedKey, {
												value: trimWhiteSpace(row[nestedValue]),
												enumerable: true,
												configurable: true,
												writable: true,
											});
										}
									} else {
										// this means nestedKey is either "phones" or "emails"
										// this also means that key is either "customers" or "persons"
										const nestedKeyLetterList: string[] = Array.from(nestedKey);
										nestedKeyLetterList.pop();
										const nestedNestedKey: 'email' | 'phone' = nestedKeyLetterList.join('') as 'email' | 'phone';
										//@ts-expect-error this way we can handle emails and phone with the same code
										const nestedMainValue = trimWhiteSpace(row[nestedValue[nestedNestedKey]])
											.split(',')
											.map((item) => trimWhiteSpace(item));
										const personEmails = nestedMainValue.map((val: string) => {
											const out: {
												notes?: string[];
												type?: string;
											} = {
												notes: undefined,
												type: undefined,
											};
											if (nestedValue['notes'] !== undefined) {
												if (row[nestedValue['notes']].includes(',')) {
													out.notes = row[nestedValue['notes']].split(',').map((item) => trimWhiteSpace(item));
												}
											}

											if (nestedValue['type'] !== undefined) {
												out.type = row[nestedValue['type']];
											}
											//@ts-expect-error this way we can handle emails and phone with the same code
											out[nestedNestedKey] = val.toLowerCase();
											return out;
										});
										Object.defineProperty(template, nestedKey, {
											value: personEmails,
											enumerable: true,
											configurable: true,
											writable: true,
										});
									}
								}
								switch (mainKey) {
									case 'addresses':
										//@ts-expect-error the template matches the mainKey regardless
										quedAddresses.push(template as AddressType);
										break;
									case 'banks':
										quedBanks.push(template as BankType);
										break;
									case 'company':
										quedCompany.push(template as CompanyType);
										break;
									case 'persons':
										quedPersons.push(template as DerefPersonType);
								}
							}
						}

						if (key === 'customers') {
							const value = v as CustomersMap;
							for (const [nk, nv] of Object.entries(value)) {
								const nestedKey = nk as keyof CustomersMap;
								if (nv !== undefined) {
									if (nestedKey === 'notes' || nestedKey === 'altIDs') {
										const itemValue = trimWhiteSpace(row[nv as string] as string);
										const itemValues = itemValue.split(',').map((item) => trimWhiteSpace(item));
										if (customer[nestedKey] === undefined) {
											customer[nestedKey] = [];
										}
										for (const item of itemValues) {
											if (item.trim() !== '') {
												customer[nestedKey].push(item);
											}
										}
									}
									if (nestedKey === 'phones') {
										const nestedValue = nv as PhoneMap;
										if (nestedValue.phone !== undefined) {
											const mainItem = row[nestedValue.phone];
											const phone = mainItem.split(',');
											const phones: PhoneNumberType[] = phone.map(
												(item: string): PhoneNumberType => ({
													row: 0,
													phone: trimWhiteSpace(item),
													type: nestedValue.type !== undefined ? (trimWhiteSpace(row[nestedValue.type]) as ContactType) : undefined,
													notes:
														nestedValue.notes !== undefined
															? row[nestedValue.notes].split(',').map((note) => trimWhiteSpace(note))
															: undefined,
												})
											);
											customer[nestedKey] = phones;
										}
									}
									if (nestedKey === 'emails') {
										const nestedValue = nv as EmailMap;
										if (nestedValue.email !== undefined) {
											const mainItem = row[nestedValue.email];
											const email = mainItem.split(',');
											const emails: EmailType[] = email.map(
												(item: string): EmailType => ({
													row: 0,
													email: trimWhiteSpace(item),
													type: nestedValue.type !== undefined ? (trimWhiteSpace(row[nestedValue.type]) as ContactType) : undefined,
													notes:
														nestedValue.notes !== undefined
															? row[nestedValue.notes].split(',').map((note) => trimWhiteSpace(note))
															: undefined,
												})
											);
											customer[nestedKey] = emails;
										}
									}
									if (nestedKey === 'firstContact' || nestedKey === 'latestContact') {
										customer[nestedKey] = parseDate(row[nv as string] as string, 'YYYY-MM-DD hh:mm:ss');
									}
									if (nestedKey === 'website') {
										const website = trimWhiteSpace(row[nv as string]);
										website.replace('http://', 'https://');
										customer[nestedKey] = website;
									}
									if (nestedKey === 'description') {
										customer[nestedKey] = trimWhiteSpace(row[nv as string]);
									}
								}
							}
						}
					}

					parsePersons(quedPersons, (result) => {
						if (result !== null) {
							customerTracker.total += result.length;
							for (let i = 0; i < result.length; i++) {
								insertPerson(result[i], (status: boolean, rowNumber: number | undefined) => {
									if (status && rowNumber !== undefined) {
										customer.persons = updateArrayBuffer(customer.persons, rowNumber);
										customerTracker.count += 1;
									}
								});
							}
						}
					});

					parseAddress(quedAddresses, (rowNumbers: number[]) => {
						if (rowNumbers.length !== 0) {
							customerTracker.total += rowNumbers.length;
							for (let i = 0; i < rowNumbers.length; i++) {
								customer.addresses = updateArrayBuffer(customer.addresses, rowNumbers[i]);
								customerTracker.count += 1;
							}
						}
					});

					parseBanks(quedBanks, (rowNumbers: number[]) => {
						if (rowNumbers.length !== 0) {
							customerTracker.total += rowNumbers.length;

							for (let i = 0; i < rowNumbers.length; i++) {
								customer.banks = updateArrayBuffer(customer.addresses, rowNumbers[i]);
								customerTracker.count += 1;
							}
						}
					});

					parseCompany(quedCompany, (rowNumbers: number[]) => {
						if (rowNumbers.length !== 0) {
							customerTracker.total += rowNumbers.length;
							for (let i = 0; i < rowNumbers.length; i++) {
								customer.company = updateArrayBuffer(customer.addresses, rowNumbers[i]);
								customerTracker.count += 1;
							}
						}
					});

					if (quedAddresses.length === 0 && quedBanks.length === 0 && quedCompany.length === 0 && quedPersons.length === 0) {
						insertCustomers(customer);
					}
				};

				customerDBrequest.onblocked = () => {
					throw new Error('opening customerDB was block');
				};

				cursorRequest.onerror = () => {
					throw new Error('opening customerDB failed');
				};
			}

			function parseArticleData(dataBaseName: string, dataBaseVersion: number, map: ArticleSortingMap, row: UploadRow) {
				//function definitions
				// function upgradeArticleDB(e: IDBVersionChangeEvent): void {
				// 	const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
				// 	const db = target.result;
				// 	const stores = db.objectStoreNames;

				// 	if (!stores.contains('articles')) {
				// 		const articles = db.createObjectStore('articles', {
				// 			keyPath: 'row',
				// 		});
				// 		articles.createIndex('articles-id', 'id', {
				// 			unique: true,
				// 		});
				// 		articles.createIndex('articles-name', 'name', {
				// 			unique: false,
				// 		});
				// 		articles.createIndex('articles-count', 'count', {
				// 			unique: false,
				// 		});
				// 		articles.createIndex('articles-unit', 'unit', {
				// 			unique: false,
				// 		});
				// 		articles.createIndex('articles-lastSeen', 'lastSeen', {
				// 			unique: false,
				// 		});
				// 		articles.createIndex('articles-securityDeposit', 'securityDeposit', {
				// 			unique: false,
				// 		});
				// 	}

				// 	if (!stores.contains('acquisitions')) {
				// 		const acquisitions = db.createObjectStore('acquisitions', {
				// 			keyPath: 'row',
				// 		});
				// 		acquisitions.createIndex('acquisitions-date', 'date', {
				// 			unique: false,
				// 		});
				// 		acquisitions.createIndex('acquisitions-totalCost', 'totalCost', {
				// 			unique: false,
				// 		});
				// 		acquisitions.createIndex('acquisitions-purchaseInvoiceID', 'purchaseInvoiceID', {
				// 			unique: false,
				// 		});
				// 	}
				// }
				const v1 = dataBaseName;
				const v2 = dataBaseVersion;
				const v3 = map;
				const v4 = row;
				console.log(v1, v2, v3, v4);
			}

			function parseDocumentData(dataBaseName: string, dataBaseVersion: number, map: DocumentSortingMap, row: UploadRow) {
				//function definitions
				// function upgradeDocumentDB(e: IDBVersionChangeEvent): void {
				// 	const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
				// 	const db = target.result;
				// 	const stores = db.objectStoreNames;

				// 	if (!stores.contains('quotes')) {
				// 		const quotes = db.createObjectStore('quotes', {
				// 			keyPath: 'row',
				// 		});

				// 		quotes.createIndex('quotes-id', 'id', {
				// 			unique: true,
				// 		});

				// 		quotes.createIndex('quotes-date', 'date', {
				// 			unique: true,
				// 		});

				// 		quotes.createIndex('quotes-customerID', 'customerID', {
				// 			unique: true,
				// 		});
				// 	}

				// 	if (!stores.contains('invoices')) {
				// 		const invoices = db.createObjectStore('invoices', {
				// 			keyPath: 'row',
				// 		});

				// 		invoices.createIndex('invoices-id', 'id', {
				// 			unique: true,
				// 		});

				// 		invoices.createIndex('invoices-date', 'date', {
				// 			unique: false,
				// 		});

				// 		invoices.createIndex('invoices-customerID', 'customerID', {
				// 			unique: false,
				// 		});
				// 	}

				// 	if (!stores.contains('deliveries')) {
				// 		const deliveries = db.createObjectStore('deliveries', {
				// 			keyPath: 'row',
				// 		});

				// 		deliveries.createIndex('deliveries-id', 'id', {
				// 			unique: true,
				// 		});

				// 		deliveries.createIndex('deliveries-date', 'date', {
				// 			unique: false,
				// 		});

				// 		deliveries.createIndex('deliveries-customerID', 'customerID', {
				// 			unique: false,
				// 		});
				// 	}

				// 	if (!stores.contains('returnees')) {
				// 		const returnees = db.createObjectStore('returnees', {
				// 			keyPath: 'row',
				// 		});

				// 		returnees.createIndex('returnees-id', 'id', {
				// 			unique: true,
				// 		});

				// 		returnees.createIndex('returnees-date', 'date', {
				// 			unique: false,
				// 		});

				// 		returnees.createIndex('returnees-customerID', 'customerID', {
				// 			unique: false,
				// 		});
				// 	}
				// }
				const v1 = dataBaseName;
				const v2 = dataBaseVersion;
				const v3 = map;
				const v4 = row;
				console.log(v1, v2, v3, v4);
			}

			cursorRequest.onsuccess = () => {
				const cursor: IDBCursorWithValue | null = cursorRequest.result;
				if (cursor) {
					switch (targetDBName) {
						case 'article_db':
							parseArticleData('article_db', dbVersion, sortingMap as ArticleSortingMap, cursor.value);
							break;
						case 'customer_db':
							parseCustomerData('customer_db', dbVersion, sortingMap as CustomerSortingMap, cursor.value);
							break;
						case 'document_db':
							parseDocumentData('document_db', dbVersion, sortingMap as DocumentSortingMap, cursor.value);
							break;
						default:
							break;
					}
					update();
					cursor.continue();
				} else {
					return;
				}
			};
		};

		dataUploadCountRequest.onerror = () => {
			postMessage({
				type: 'error',
				data: 'doCustomers: failed to count',
			});
		};

		dbTransaction.oncomplete = () => {
			postMessage({
				type: 'success',
				data: 'customers',
			});
		};
	};
}

/**
 *
 * @param buffer the preexisting Arraybuffer, if there is note one will be created
 * @param value the number to add to the array buffer
 */
function updateArrayBuffer(buffer: ArrayBuffer | undefined, value: number | ArrayBuffer): ArrayBuffer {
	if (value instanceof ArrayBuffer) {
		if (buffer instanceof ArrayBuffer) {
			const base = new DataView(buffer);
			const incoming = new DataView(value);
			const start = base.byteLength / 2 - 1;
			for (let i = 0; i < incoming.byteLength / 2 - 1; i++) {
				let skip = false;
				for (let j = start; j > 0; j--) {
					if (base.getUint16(j) === base.getUint16(i)) {
						skip = true;
					}
				}
				if (!skip) {
					// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
					if (base.buffer.resizable === true) {
						// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
						base.buffer.resize(buf.byteLength + 2);
						const insertIndex = base.byteLength / 2 - 1;
						base.setUint16(insertIndex, incoming.getUint16(i));
					}
				}
			}
			return base.buffer;
		} else {
			return value;
		}
	} else {
		if (buffer instanceof ArrayBuffer) {
			const buf = buffer;

			for (let i = new DataView(buf).byteLength / 2 - 1; i > 0; i--) {
				if (new DataView(buf).getUint16(i) === value) {
					return buf;
				}
			}

			// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
			if (buf.resizable === true) {
				if (buf.byteLength === 128) {
					// Array buffer is maxed out
					return buf;
				}

				// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
				buf.resize(buf.byteLength + 2);
				const view = new DataView(buf);
				const index = (view.byteLength as number) / 2 - 1;

				view.setUint16(index, value);

				return buf;
			} else {
				return buf;
			}
		} else {
			// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
			const buf = new ArrayBuffer(2, { maxByteLength: 128 });
			new DataView(buf).setUint16(0, value);
			return buf;
		}
	}
}

function trimWhiteSpace(input: string): string {
	let out = input;
	if (out !== undefined) {
		out = out.replaceAll(/(((?<=\s)\s+)|(^\s+)|(\s+$))/gm, '');
	} else {
		out = '';
	}
	return out;
}
