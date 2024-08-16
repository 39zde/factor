// the use of import mdules inside of workers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#browser_compatibility
import {
	CustomerSortingMap,
	PersonType,
	EmailType,
	PhoneNumberType,
	AddressType,
	BankType,
	CompanyType,
	Customer,
} from '../types/types';
import { rx } from '../func/regex';

self.onmessage = (e: MessageEvent): void => {
	if (e.data.dataBaseName === undefined) {
		return;
	}
	switch (e.data.type) {
		case 'import':
			const data = e.data.message;

			if (typeof e.data.message !== 'string') {
				return postMessage({
					type: 'error',
					message: 'invalid input: data is not of type string',
				});
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

			const request = indexedDB.open(e.data.dataBaseName, e.data.dbVersion);

			request.onsuccess = () => {
				// console.log('success')
				// console.log(e)
				// @ts-ignore
				const db = request.result;
				self.Storage;
				deleteData(db);
				addData(keys, rows, db);
				const copy = [...keys];
				copy.splice(0, 0, 'row');
				return postMessage({
					type: 'imported',
					message: [rows.length, copy],
				});
			};
			request.onerror = () => {
				// console.log('error')
				// console.log(e)
				return postMessage({
					type: 'error',
					message: 'failed to open database',
				});
			};

			request.onupgradeneeded = () => {
				// console.log(e)
				const db = request.result;
				db.createObjectStore('data_upload', { keyPath: 'row' });
				// let objectStore = db.createObjectStore('data_upload', { keyPath: 'row' })
				// let objectStoreIndex = objectStore.createIndex('keyIndex','key',{unique: true})
			};

			break;
		case 'align':
			/**
			 * {
			 *  col: string; // column name
			 *  value: string; // the value of the outlier
			 *  offset: number; // the shift amount
			 *  direction: "Left" | "Right"; // the direction to shift to
			 * }
			 */
			const alignVariables = e.data.message;
			let offset = alignVariables.offset;
			if (alignVariables.direction === 'Left') {
				offset = offset - 2 * offset;
			}
			alignData(
				alignVariables.col,
				alignVariables.value,
				offset,
				e.data.dataBaseName,
				e.data.dbVersion
			);
			break;
		case 'rankColsByCondition':
			let condition = e.data.message.condition;
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
					condition = e.data.message.custom.string;
					break;
				case 'custom number':
					condition = e.data.message.custom.number;
					break;
				default:
					condition = '';
			}
			rankColsByCondition(condition, e.data.dataBaseName, e.data.dbVersion);
			break;
		case 'deleteCol':
			const colToBeDeleted: string = e.data.message;
			// console.log('about to delete col ' + colToBeDeleted);
			deleteCol(colToBeDeleted);
			break;
		case 'sort':
			// console.log('do sorting');
			const columnsMap: CustomerSortingMap = e.data.message;
			const mode:
				| 'articles'
				| 'customers'
				| 'quotes'
				| 'invoices'
				| 'deliveries' = e.data.content;
			switch (mode) {
				case 'articles':
					break;
				case 'customers':
					// console.log('do customers');
					doCustomers(columnsMap, e.data.dataBaseName, e.data.dbVersion);
					break;
				case 'quotes':
					break;
				case 'invoices':
					break;
				case 'deliveries':
					break;
				default:
					postMessage({
						type: 'error',
						message: `unknown sorting mode ${mode}`,
					});
			}
			break;
		default:
			return postMessage({
				type: 'error',
				message: `${e.data.type} is an invalid message type`,
			});
	}
};

let PersonTemplate: PersonType = {
	firstName: '',
	lastName: '',
	id: 0,
	phone: null,
	title: '',
	alias: undefined,
	notes: undefined,
};

let EmailTemplate: EmailType = {
	email: '',
	id: 0,
	notes: [],
	type: undefined,
};

let PhoneTemplate: PhoneNumberType = {
	id: 0,
	phone: '',
	notes: undefined,
	type: undefined,
};

let AddressTemplate: AddressType = {
	city: '',
	country: '',
	hash: '',
	id: 0,
	street: '',
	zip: '',
	notes: undefined,
	number: undefined,
	type: undefined,
};

let CompanyTemplate: CompanyType = {
	alias: undefined,
	id: 0,
	name: '',
	notes: undefined,
};

let BankTemplate: BankType = {
	id: 0,
	name: '',
	bankCode: undefined,
	bic: undefined,
	iban: '',
	notes: undefined,
};

const updateManager = (total: number) => {
	const increment = 0.1;
	let ratchet = 0.1;
	let counter = 0;
	let progress = 0;
	function postUpdate(msg: string): void {
		postMessage({
			type: 'progress',
			message: msg,
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

function getKeys(row: string) {
	const keys = row.split(';');
	return keys;
}

function addData(keys: string[], rows: string[], db: IDBDatabase) {
	const transaction = db.transaction(['data_upload'], 'readwrite');
	const objectStore = transaction.objectStore('data_upload');
	let i = 1;
	while (i < rows.length) {
		// console.log(i)
		const columns = rows[i].split(';');
		const out = {};
		out['row'] = i;
		for (let j = 0; j < keys.length; j++) {
			out[keys[j]] = columns[j];
		}
		objectStore.add(out);
		i++;
	}
}

function deleteData(db: IDBDatabase) {
	const transaction = db.transaction(['data_upload'], 'readwrite');
	const objectStore = transaction.objectStore('data_upload');
	objectStore.clear();
}

function alignData(
	col: string,
	searchValue: string,
	shiftAmount: number,
	dbName: string,
	dbVersion: number
) {
	const request = indexedDB.open(dbName, dbVersion);
	return (request.onsuccess = () => {
		const db = request.result;
		const transaction = db.transaction(['data_upload'], 'readwrite');
		const objectStore = transaction.objectStore('data_upload');
		let count: number;
		return (objectStore.count().onsuccess = (e) => {
			//@ts-ignore
			count = e.target.result;
			return (objectStore.openCursor(null, 'next').onsuccess = (ev) => {
				//@ts-ignore
				const cursor: IDBCursorWithValue | null = ev.target.result;
				if (cursor !== null) {
					if (cursor.value[col] == undefined) {
						cursor.continue();
					}

					if (cursor.value[col] === searchValue) {
						const shiftedRow = performShift(shiftAmount, cursor.value);
						cursor.update(shiftedRow).onsuccess = () => {
							// console.log(cursor.key)
							// console.log(cursor.primaryKey)
							// console.log(cursor.source)
							// console.log(cursor.value)
							// console.log(cursor.direction)
						};
					}

					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						return postMessage({
							type: 'success',
							message: 'aligned values',
						});
					}
				} else {
					// return postMessage({ type: 'error', message: 'invalid cursor' })
				}
			});
		});
	});
}

function performShift(to: number, item: object) {
	// console.log(item)
	const out = item;
	const copy = item;
	const keys = Object.keys(item);
	if (to > 0) {
		for (let i = 1; i < keys.length; i++) {
			if (i <= Math.abs(to)) {
				let filler: string | number = '';
				if (typeof copy[keys[i]] === 'number') {
					filler = 0;
				}
				out[keys[i]] = filler;
			} else {
				out[keys[i]] = out[keys[i - Math.abs(to)]];
			}
		}
	} else if (to < 0) {
		for (let i = 1; i < keys.length; i++) {
			// console.log(keys[i],i)
			if (i < keys.length - Math.abs(to)) {
				out[keys[i]] = out[keys[i + Math.abs(to)]];
			} else {
				out[keys[i]] = '';
			}
		}
	} else {
		return null;
	}
	// console.log(out)
	return out;
}

function rankColsByCondition(
	condition: string | null | number | undefined,
	dbName: string,
	dbVersion: number
) {
	const dbRequest = indexedDB.open(dbName, dbVersion);
	dbRequest.onsuccess = () => {
		//@ts-ignore
		const db: IDBDatabase = dbRequest.result;
		const t = db.transaction('data_upload');
		const objStore = t.objectStore('data_upload');
		const keysRequest = objStore.count();
		keysRequest.onsuccess = () => {
			const count = keysRequest.result;
			const keysReq = objStore.get(1);
			keysReq.onsuccess = () => {
				const keys = Object.keys(keysReq.result);
				keys.splice(keys.indexOf('row'), 1);
				const counter: object = keysReq.result;
				const update = updateManager(count * keys.length);
				for (const [k] of Object.entries(counter)) {
					counter[k] = 0;
				}

				// console.log(counter, keys)
				objStore.openCursor(null, 'next').onsuccess = (e) => {
					//@ts-ignore
					const cursor: IDBCursorWithValue | null = e.target.result;
					if (cursor !== null) {
						for (const key of keys) {
							update();
							const value = cursor.value[key];
							//@ts-ignore
							const test = compareItemToCondition(
								condition,
								value,
								parseInt(cursor.key.toString())
							);
							// console.log(test)
							if (test) {
								counter[key] = counter[key] + 1;
							}
						}

						//@ts-ignore
						if (cursor.key < count) {
							cursor.continue();
						} else {
							// console.log(counter)
							const ranking = Object.entries(counter);
							ranking.sort((a, b) => b[1] - a[1]);
							postMessage({ type: 'ranking', message: ranking });
						}

						//   cursor.continue()
					} else {
						// return postMessage({ type: 'error', message: 'cursor is null' })
					}
					// console.log(counter)
				};
			};
		};
	};
}

function compareItemToCondition(
	condition: string | null | number | undefined,
	value: any,
	index: number
): boolean {
	switch (typeof condition) {
		case 'number':
			if (typeof value === 'number' || typeof value === 'bigint') {
				if (value === condition) {
					return true;
				}
			} else {
				//@ts-ignore
				if (value === condition.toString()) {
					return true;
				}
			}
			return false;
		case 'string':
			// console.log(value, condition)
			//@ts-ignore
			if (condition.length === 0) {
				// console.log(0)
				if (typeof value === 'string') {
					if (value.trim().length === 0) {
						return true;
					}
				} else {
					// if(value.toString() === value){
					//   return true
					// }
					if (typeof value === 'undefined' || typeof value === null) {
						// console.log(index);
					}
				}
			} else {
				if (value === condition) {
					return true;
				}
			}
			return false;

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
		default:
			// console.log('unknown type of condition', typeof condition, condition);
			return false;
	}
}

function deleteCol(col: string) {
	const dbRequest = indexedDB.open('factor_db');
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		const transaction = db.transaction('data_upload', 'readwrite');
		const objStore = transaction.objectStore('data_upload');
		const countRequest = objStore.count();
		countRequest.onsuccess = () => {
			const count = countRequest.result;
			// console.log('start col deletion');
			objStore.openCursor(null, 'next').onsuccess = (e) => {
				//@ts-ignore
				const cursor: IDBCursorWithValue = e.target.result;
				if (cursor !== null) {
					const newValue = cursor.value;
					delete newValue[col];
					// console.log(Object.entries(newValue).length)
					cursor.update(newValue);

					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						// console.log('deleted col');
						postMessage({
							type: 'colDeletion',
							message: `deleted col: ${col}`,
						});
					}
				}
			};
		};
	};
}

function doCustomers(
	map: CustomerSortingMap,
	dbName: string,
	dbVersion: number
) {
	const request = indexedDB.open(dbName, dbVersion);
	request.onsuccess = () => {
		const customerDBrequest = indexedDB.open('customer_db', dbVersion);
		customerDBrequest.onupgradeneeded = createCustomerObjectStores;
		customerDBrequest.onsuccess = () => {
			// console.log('opened ', 'customer_db');
			const db = request.result;
			const customerDB = customerDBrequest.result;
			const dbTransaction = db.transaction(['data_upload'], 'readonly');
			const dataUpload = dbTransaction.objectStore('data_upload');
			// console.log('count data upload');
			const dataUploadCountRequest = dataUpload.count();

			dataUploadCountRequest.onsuccess = () => {
				let dataCount = dataUploadCountRequest.result;
				// console.log('counted data upload: ', dataCount);
				const update = updateManager(dataCount);
				// console.log('open cursor');
				const cursorRequest = dataUpload.openCursor(null, 'next');
				cursorRequest.onsuccess = () => {
					const cursor: IDBCursorWithValue | null = cursorRequest.result;
					if (cursor) {
						const value = cursor.value;
						parseCustomer(map, value, customerDB);

						update();
						cursor.continue();
					} else {
						postMessage({
							type: 'success',
							message: 'customers',
						});
					}
				};
			};
		};
	};
}

type RowType = {
	row: number;
	[key: string]: any;
};

function parseCustomer(
	map: CustomerSortingMap,
	row: RowType,
	customerDB: IDBDatabase
): void {
	// console.log(map);
	let customer: Customer = {
		id: trimWhiteSpace(row[map.id]),
		row: row.row,
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
	};

	function updateCustomer(
		id: string,
		key: 'persons' | 'emails' | 'addresses' | 'banks' | 'company' | 'phones',
		value: number
	) {
		let transaction = customerDB.transaction('customers', 'readwrite');
		let oStore = transaction.objectStore('customers');
		let index = oStore.index('customers-id');
		let request = index.get(id);

		request.onsuccess = () => {
			let entry: Customer = request.result;
			if (entry) {
				if (key !== 'company') {
					if (Object.keys(entry).includes(key)) {
						if (!Array.isArray(entry[key])) {
							Object.defineProperty(entry, key, {
								configurable: true,
								enumerable: true,
								writable: true,
								value: [value],
							});
						} else {
							if (!entry[key].includes(value)) {
								entry[key].push(value);
							}
						}
					} else {
						Object.defineProperty(entry, key, {
							configurable: true,
							enumerable: true,
							writable: true,
							value: [value],
						});
					}
				} else {
					Object.defineProperty(entry, key, {
						configurable: true,
						enumerable: false,
						writable: true,
						value: value,
					});
				}
				oStore.put(entry);
			}
		};
	}

	function addParsedData(
		data:
			| PersonType[]
			| EmailType[]
			| PhoneNumberType[]
			| AddressType[]
			| CompanyType[]
			| BankType[],
		type: 'persons' | 'emails' | 'addresses' | 'banks' | 'company' | 'phones'
	): void {
		if (data.length !== 0) {
			const transaction = customerDB.transaction(type, 'readwrite');
			const oStore = transaction.objectStore(type);
			let CountRequest = oStore.count();
			// console.log("countRequest")
			CountRequest.onsuccess = () => {
				let count = CountRequest.result;
				for (let [index, value] of data.entries()) {
					let id = count + index + 1;
					value.id = id;
					oStore.add(value);
					updateCustomer(row[map.id], type, id);
				}
			};
		}
	}

	if (map.customerNotes !== undefined) {
		let note = trimWhiteSpace(row[map.customerNotes]);
		let notes = note.split(',').map((item) => trimWhiteSpace(item));
		if (customer.notes === undefined) {
			customer.notes = [];
		}
		for (let n of notes) {
			if (n.trim() !== '') {
				customer.notes.push(n);
			}
		}
	}

	if (map.description !== undefined) {
		customer.description = trimWhiteSpace(row[map.description]);
	}

	if (map.firstContact !== undefined) {
		let date = Array.from(row[map.firstContact]);
		let year = date.splice(0, 4);
		let month = date.splice(0, 2);
		customer.firstContact = new Date(
			parseInt(year.join('')),
			parseInt(month.join('')) - 1,
			parseInt(date.join(''))
		);
	}

	if (map.latestContact !== undefined) {
		let date = Array.from(row[map.latestContact]);
		let year = date.splice(0, 4);
		let month = date.splice(0, 2);
		customer.latestContact = new Date(
			parseInt(year.join('')),
			parseInt(month.join('')) - 1,
			parseInt(date.join(''))
		);
	}

	let transaction = customerDB.transaction('customers', 'readwrite');
	let oStore = transaction.objectStore('customers');
	oStore.put(customer);

	let persons: PersonType[] = [];
	let emails: EmailType[] = [];
	let phones: PhoneNumberType[] = [];
	let addresses: AddressType[] = [];
	let companies: CompanyType[] = [];
	let banks: BankType[] = [];

	// parse Persons
	if (map.firstName !== undefined || map.lastName !== undefined) {
		// now we know there is something which fits the scheme of a person
		if (map.firstName !== undefined) {
			// if there is a first Name
			let firstName = trimWhiteSpace(row[map.firstName]);
			if (firstName.includes('&')) {
				// its actually to persons (related or married)
				let names = firstName
					.split('&')
					.map((item) => trimWhiteSpace(item));
				let person1 = structuredClone(PersonTemplate);
				let person2 = structuredClone(PersonTemplate);
				person1.firstName = names[0];
				person2.firstName = names[1];
				persons.push(person1);
				persons.push(person2);
			} else {
				// only one person
				let person = structuredClone(PersonTemplate);
				person.firstName = firstName;
				persons.push(person);
			}
		}

		if (map.lastName !== undefined) {
			// if there is a last name
			if (persons.length !== 0) {
				// are the any persons already
				for (let p of persons) {
					p.lastName = trimWhiteSpace(row[map.lastName]);
				}
			} else {
				// create a person
				let person = structuredClone(PersonTemplate);
				person.lastName = trimWhiteSpace(row[map.lastName]);
				person.firstName = '';
				persons.push(person);
			}
		}

		if (map.title !== undefined) {
			if (persons.length !== 0) {
				for (let p of persons) {
					p.title = trimWhiteSpace(row[map.title]);
				}
			}
		}
	}

	if (map.companyName === undefined && map.alias !== undefined) {
		// if the is no company name assume the alias field applies to the person
		for (let p of persons) {
			if (p.alias === undefined) {
				p.alias = [];
			}
			p.alias.push(trimWhiteSpace(row[map.alias]));
		}
	}

	if (persons.length !== 0 && map.personNotes !== undefined) {
		// if there are persons and we can assign notes then do so
		for (let p of persons) {
			if (p.notes === undefined) {
				p.notes = [];
			}
			let note = trimWhiteSpace(row[map.personNotes]);
			let notes = note.split(',').map((item) => trimWhiteSpace(item));
			for (let n of notes) {
				if (n.trim() !== '') {
					p.notes.push(n);
				}
			}
		}
	}

	addParsedData(persons, 'persons');

	// parse address
	let addressParams = ['city', 'street', 'zip', 'country'];
	if (
		map.city !== undefined ||
		map.street !== undefined ||
		map.zip !== undefined ||
		map.country !== undefined
	) {
		let address = structuredClone(AddressTemplate);
		for (const param of addressParams) {
			if (map[param] !== undefined) {
				address[param] = trimWhiteSpace(row[map[param]]);
			}
		}
		addresses.push(address);
	}

	addParsedData(addresses, 'addresses');

	// parse email
	if (map.email !== undefined) {
		let mail = trimWhiteSpace(row[map.email]);
		if (mail.trim() !== '') {
			let mails = mail.split(',').map((item) => trimWhiteSpace(item));
			for (const m of mails) {
				let email = structuredClone(EmailTemplate);
				let matched = rx.EmailRx.exec(m);
				if (matched?.[0] !== null && matched?.[0] !== undefined) {
					email.email = matched[0];
					if (email.notes === undefined) {
						email.notes = [];
					}
					let note = trimWhiteSpace(m.replace(matched[0], ''));
					if (note !== '') {
						email.notes.push(note);
					}
				}
				emails.push(email);
			}
		}
	}

	if (emails.length !== 0 && map.emailNotes !== undefined) {
		for (let m of emails) {
			if (!Array.isArray(m.notes)) {
				m.notes = [];
			}
			let note = trimWhiteSpace(row[map.emailNotes]);
			let notes = note.split(',').map((item) => trimWhiteSpace(item));
			for (let n of notes) {
				if (n.trim() !== '') {
					m.notes.push(n);
				}
			}
		}
	}

	addParsedData(emails, 'emails');

	// parse phone number
	if (map.phone !== undefined) {
		let phone = structuredClone(PhoneTemplate);
		let number = trimWhiteSpace(row[map.phone]);
		phone.phone = number.replaceAll('[^0-9+]', '');
		phones.push(phone);
	}

	if (phones.length !== 0 && map.phoneNotes !== undefined) {
		let note = trimWhiteSpace(row[map.phoneNotes]);
		let notes = note.split(',').map((item) => trimWhiteSpace(item));

		for (let p of phones) {
			if (!Array.isArray(p.notes)) {
				p.notes = [];
			}
			for (let n of notes) {
				if (n.trim() !== '') {
					p.notes.push(n);
				}
			}
		}
	}

	addParsedData(phones, 'phones');

	// parse company
	if (map.companyName !== undefined) {
		let company = structuredClone(CompanyTemplate);
		company.name = trimWhiteSpace(row[map.companyName]);
		companies.push(company);
	}

	if (companies.length !== 0 && map.companyNotes !== undefined) {
		let note = trimWhiteSpace(row[map.companyNotes]);
		let notes = note.split(',').map((item) => trimWhiteSpace(item));
		for (let c of companies) {
			if (c.notes === undefined) {
				c.notes = [];
			}
			for (let n of notes) {
				if (n.trim() !== '') {
					c.notes.push(n);
				}
			}
		}
	}

	addParsedData(companies, 'company');

	// parse bank
	if (map.bankName !== undefined) {
		let bank = structuredClone(BankTemplate);
		bank.name = trimWhiteSpace(row[map.bankName]);
		if (map.bankCode !== undefined)
			bank.bankCode = trimWhiteSpace(row[map.bankCode]);
		if (map.iban !== undefined) bank.iban = trimWhiteSpace(row[map.iban]);
		if (map.bic !== undefined) bank.bic = trimWhiteSpace(row[map.bic]);
		if (map.bankNotes !== undefined) {
			let note = trimWhiteSpace(row[map.bankNotes]);
			let notes = note.split(',').map((item) => trimWhiteSpace(item));
			if (bank.notes === undefined) {
				bank.notes = [];
			}
			for (let n of notes) {
				if (n.trim() !== '') {
					bank.notes.push(n);
				}
			}
		}
		banks.push(bank);
	}

	addParsedData(banks, 'banks');
}

function createCustomerObjectStores(e: IDBVersionChangeEvent): void {
	// console.log('upgrade customer_db');
	const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
	const db = target.result;
	const stores = db.objectStoreNames;

	if (!stores.contains('customers')) {
		const customer = db.createObjectStore('customers', {
			keyPath: 'row',
			autoIncrement: true,
		});
		customer.createIndex('customers-id', 'id', {
			unique: true,
		});
	}

	if (!stores.contains('persons')) {
		const persons = db.createObjectStore('persons', {
			keyPath: 'id',
			autoIncrement: true,
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
			keyPath: 'id',
		});

		email.createIndex('emails-email', 'email', {
			unique: true,
		});
	}

	if (!stores.contains('phones')) {
		const phone = db.createObjectStore('phones', {
			keyPath: 'id',
		});

		phone.createIndex('phones-phone', 'phone', {
			unique: true,
		});
	}

	if (!stores.contains('addresses')) {
		const address = db.createObjectStore('addresses', {
			keyPath: 'id',
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
	}

	if (!stores.contains('banks')) {
		const bank = db.createObjectStore('banks', {
			keyPath: 'id',
		});

		bank.createIndex('banks-name', 'name', {
			multiEntry: true,
		});
		bank.createIndex('banks-iban', 'iban', {
			unique: true,
		});
	}

	if (!stores.contains('company')) {
		db.createObjectStore('company', {
			keyPath: 'id',
		});
	}
}

function trimWhiteSpace(input: string): string {
	if (typeof input !== 'string') {
		// console.log(typeof input);
	}
	let out = input;
	if (out.length !== 0) {
		out.replaceAll(rx.WhiteSpaceRx, '');
	}
	return out;
}
