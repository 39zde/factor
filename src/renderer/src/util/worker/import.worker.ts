// the use of import modules inside of workers
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#browser_compatibility
import type {
	CustomerSortingMap,
	PersonType,
	EmailType,
	PhoneNumberType,
	AddressType,
	BankType,
	CompanyType,
	Customer,
	TableRow,
	CustomerReferences,
	AddDataArgs,
	DateInput,
} from '../types/types';
import { rx, getAddressHash } from '../func/func';

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
				const db = request.result;
				deleteData(db);
				addData({ keys, rows, db });
				const copy = [...keys];
				copy.splice(0, 0, 'row');
				return postMessage({
					type: 'imported',
					message: [rows.length, copy],
				});
			};
			request.onerror = () => {
				return postMessage({
					type: 'error',
					message: 'failed to open database',
				});
			};

			request.onupgradeneeded = () => {
				const db = request.result;
				db.createObjectStore('data_upload', { keyPath: 'row' });
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
			deleteCol(colToBeDeleted);
			break;
		case 'sort':
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

const PersonTemplate: PersonType = {
	firstName: '',
	lastName: '',
	row: 0,
	phone: null,
	title: '',
	alias: undefined,
	notes: undefined,
};

const EmailTemplate: EmailType = {
	email: '',
	row: 0,
	notes: [],
	type: undefined,
};

const PhoneTemplate: PhoneNumberType = {
	row: 0,
	phone: '',
	notes: undefined,
	type: undefined,
};

const AddressTemplate: AddressType = {
	city: '',
	country: '',
	row: 0,
	street: '',
	zip: '',
	notes: undefined,
	type: undefined,
};

const CompanyTemplate: CompanyType = {
	alias: undefined,
	row: 0,
	name: '',
	notes: undefined,
};

const BankTemplate: BankType = {
	row: 0,
	name: '',
	bankCode: undefined,
	bic: undefined,
	iban: '',
	notes: undefined,
};

function parseDate(input: string, type: DateInput): Date {
	switch (type) {
		case 'YYYYMMDD':
			const arrayed = Array.from(input);
			const year = arrayed.splice(0, 4);
			const month = arrayed.splice(0, 2);
			return new Date(
				parseInt(year.join('')),
				parseInt(month.join('')) - 1,
				parseInt(arrayed.join(''))
			);
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

function addData({ keys, rows, db }: AddDataArgs) {
	const transaction = db.transaction(['data_upload'], 'readwrite');
	const objectStore = transaction.objectStore('data_upload');
	let i = 1;
	while (i < rows.length) {
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
			//@ts-expect-error the event of a IDB request always has a target prop
			count = e.target.result;
			return (objectStore.openCursor(null, 'next').onsuccess = (ev) => {
				//@ts-expect-error the event of a IDB request always has a target prop
				const cursor: IDBCursorWithValue | null = ev.target.result;
				if (cursor !== null) {
					if (cursor.value[col] == undefined) {
						cursor.continue();
					}

					if (cursor.value[col] === searchValue) {
						performShift(shiftAmount, cursor.value);
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
	const out = item;
	const copy = structuredClone(item);
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

function rankColsByCondition(
	condition: string | null | number | undefined,
	dbName: string,
	dbVersion: number
) {
	const dbRequest = indexedDB.open(dbName, dbVersion);
	dbRequest.onsuccess = () => {
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
							postMessage({ type: 'ranking', message: ranking });
						}
					} else {
						return postMessage({
							type: 'error',
							message: 'cursor is null',
						});
					}
				};
			};
		};
	};
}

function compareItemToCondition(
	condition: string | null | number | undefined,
	value: string | number
): boolean {
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

function deleteCol(col: string) {
	const dbRequest = indexedDB.open('factor_db');
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		const transaction = db.transaction('data_upload', 'readwrite');
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
			const db = request.result;
			const customerDB = customerDBrequest.result;
			const dbTransaction = db.transaction(['data_upload'], 'readonly');
			const dataUpload = dbTransaction.objectStore('data_upload');
			const dataUploadCountRequest = dataUpload.count();

			dataUploadCountRequest.onsuccess = () => {
				const dataCount = dataUploadCountRequest.result;
				const update = updateManager(dataCount);
				const cursorRequest = dataUpload.openCursor(null, 'next');
				cursorRequest.onsuccess = () => {
					const cursor: IDBCursorWithValue | null = cursorRequest.result;
					if (cursor) {
						const value = cursor.value;
						parseCustomer(map, value, customerDB);

						update();
						cursor.continue();
					} else {
						return;
					}
				};
			};

			dbTransaction.oncomplete = () => {
				postMessage({
					type: 'success',
					message: 'customers',
				});
			};
		};
	};
}

function parseCustomer(
	map: CustomerSortingMap,
	row: TableRow,
	customerDB: IDBDatabase
): void {
	const customer: Customer = {
		id: trimWhiteSpace(row[map.id] as string),
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

	function updateCustomer(id: string, key: CustomerReferences, value: number) {
		const transaction = customerDB.transaction('customers', 'readwrite');
		const oStore = transaction.objectStore('customers');
		const index = oStore.index('customers-id');
		const request = index.get(id);
		request.onsuccess = () => {
			const entry: Customer = request.result;
			if (entry) {
				if (Object.keys(entry).includes(key)) {
					// the property does exist
					if (entry[key] instanceof ArrayBuffer) {
						// is there already something
						const buf: ArrayBuffer = entry[key];

						//check if the ArrayBuffer already contains our item
						for (
							let i = new DataView(buf).byteLength / 2 - 1;
							i > 0;
							i--
						) {
							if (new DataView(buf).getUint16(i) === value) {
								return;
							}
						}

						// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
						if (buf.resizable === true) {
							if (buf.byteLength === 128) {
								return postMessage({
									type: 'error',
									message: 'array buffer space is maxed out',
								});
							}
							// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
							buf.resize(buf.byteLength + 2);
							const view = new DataView(buf);
							const index = (view.byteLength as number) / 2 - 1;
							view.setUint16(index, value);
							entry[key] = buf;
						}
					} else {
						// there is no Array buffer
						// so we create one
						// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
						const buf = new ArrayBuffer(2, { maxByteLength: 128 });
						new DataView(buf).setUint16(0, value);
						entry[key] = buf;
					}
				} else {
					// the property does not exist
					// so we create it
					// the max count of references this buffer holds = max size / size of one item = 128/2 = 64
					// so one array contains a max 64 references
					// a reference just an integer , which shows the position of an item in another object store

					//
					// @ts-expect-error this is valid, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/ArrayBuffer#parameters
					const buf = new ArrayBuffer(2, { maxByteLength: 128 });
					new DataView(buf).setUint16(0, value);
					Object.defineProperty(entry, key, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: buf,
					});
				}

				oStore.put(entry);
				transaction.commit();
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
		type: CustomerReferences
	): void {
		if (data.length !== 0) {
			const transaction = customerDB.transaction(type, 'readwrite');
			const oStore = transaction.objectStore(type);
			const CountRequest = oStore.count();
			CountRequest.onsuccess = () => {
				const count = CountRequest.result;
				for (const [index, value] of data.entries()) {
					const id = count + index + 1;
					value.row = id;
					oStore.add(value);
					updateCustomer(row[map.id] as string, type, id);
				}
				transaction.commit();
			};
		}
	}

	if (map.customerNotes !== undefined) {
		const note = trimWhiteSpace(row[map.customerNotes] as string);
		const notes = note.split(',').map((item) => trimWhiteSpace(item));
		if (customer.notes === undefined) {
			customer.notes = [];
		}
		for (const n of notes) {
			if (n.trim() !== '') {
				customer.notes.push(n);
			}
		}
	}

	if (map.description !== undefined) {
		customer.description = trimWhiteSpace(row[map.description] as string);
	}

	if (map.firstContact !== undefined) {
		customer.firstContact = parseDate(
			row[map.firstContact] as string,
			'YYYY-MM-DD hh:mm:ss'
		);
	}

	if (map.latestContact !== undefined) {
		customer.firstContact = parseDate(
			row[map.latestContact] as string,
			'YYYY-MM-DD hh:mm:ss'
		);
	}

	const transaction = customerDB.transaction('customers', 'readwrite');
	const oStore = transaction.objectStore('customers');
	oStore.put(customer);

	const persons: PersonType[] = [];
	const emails: EmailType[] = [];
	const phones: PhoneNumberType[] = [];
	const addresses: AddressType[] = [];
	const companies: CompanyType[] = [];
	const banks: BankType[] = [];

	// parse Persons
	if (map.firstName !== undefined || map.lastName !== undefined) {
		// now we know there is something which fits the scheme of a person
		if (map.firstName !== undefined) {
			// if there is a first Name
			const firstName = trimWhiteSpace(row[map.firstName] as string);
			if (firstName.includes('&')) {
				// its actually to persons (related or married)
				const names = firstName
					.split('&')
					.map((item) => trimWhiteSpace(item));
				const person1 = structuredClone(PersonTemplate);
				const person2 = structuredClone(PersonTemplate);
				person1.firstName = names[0];
				person2.firstName = names[1];
				persons.push(person1);
				persons.push(person2);
			} else {
				// only one person
				const person = structuredClone(PersonTemplate);
				person.firstName = firstName;
				persons.push(person);
			}
		}

		if (map.lastName !== undefined) {
			// if there is a last name
			if (persons.length !== 0) {
				// are the any persons already
				for (const p of persons) {
					p.lastName = trimWhiteSpace(row[map.lastName] as string);
				}
			} else {
				// create a person
				const person = structuredClone(PersonTemplate);
				person.lastName = trimWhiteSpace(row[map.lastName] as string);
				person.firstName = '';
				persons.push(person);
			}
		}

		if (map.title !== undefined) {
			if (persons.length !== 0) {
				for (const p of persons) {
					p.title = trimWhiteSpace(row[map.title] as string);
				}
			}
		}
	}

	if (map.companyName === undefined && map.alias !== undefined) {
		// if the is no company name assume the alias field applies to the person
		for (const p of persons) {
			if (p.alias === undefined) {
				p.alias = [];
			}
			p.alias.push(trimWhiteSpace(row[map.alias] as string));
		}
	}

	if (persons.length !== 0 && map.personNotes !== undefined) {
		// if there are persons and we can assign notes then do so
		for (const p of persons) {
			if (p.notes === undefined) {
				p.notes = [];
			}
			const note = trimWhiteSpace(row[map.personNotes] as string);
			const notes = note.split(',').map((item) => trimWhiteSpace(item));
			for (const n of notes) {
				if (n.trim() !== '') {
					p.notes.push(n);
				}
			}
		}
	}

	addParsedData(persons, 'persons');

	// parse address
	const addressParams = ['city', 'street', 'zip', 'country'];
	if (
		map.city !== undefined ||
		map.street !== undefined ||
		map.zip !== undefined ||
		map.country !== undefined
	) {
		const address = structuredClone(AddressTemplate);
		for (const param of addressParams) {
			if (map[param] !== undefined) {
				address[param] = trimWhiteSpace(row[map[param]] as string);
			}
		}
		addresses.push(address);
	}

	addParsedData(addresses, 'addresses');

	// parse email
	if (map.email !== undefined) {
		const mail = trimWhiteSpace(row[map.email] as string);
		if (mail.trim() !== '') {
			const mails = mail.split(',').map((item) => trimWhiteSpace(item));
			for (const m of mails) {
				const email = structuredClone(EmailTemplate);
				const matched = rx.EmailRx.exec(m);
				if (matched?.[0] !== null && matched?.[0] !== undefined) {
					email.email = matched[0];
					if (email.notes === undefined) {
						email.notes = [];
					}
					const note = trimWhiteSpace(m.replace(matched[0], ''));
					if (note !== '') {
						email.notes.push(note);
					}
				}
				emails.push(email);
			}
		}
	}

	if (emails.length !== 0 && map.emailNotes !== undefined) {
		for (const m of emails) {
			if (!Array.isArray(m.notes)) {
				m.notes = [];
			}
			const note = trimWhiteSpace(row[map.emailNotes] as string);
			const notes = note.split(',').map((item) => trimWhiteSpace(item));
			for (const n of notes) {
				if (n.trim() !== '') {
					m.notes.push(n);
				}
			}
		}
	}

	addParsedData(emails, 'emails');

	// parse phone number
	if (map.phone !== undefined) {
		const phone = structuredClone(PhoneTemplate);
		const number = trimWhiteSpace(row[map.phone] as string);
		phone.phone = number.replaceAll('[^0-9+]', '');
		phones.push(phone);
	}

	if (phones.length !== 0 && map.phoneNotes !== undefined) {
		const note = trimWhiteSpace(row[map.phoneNotes] as string);
		const notes = note.split(',').map((item) => trimWhiteSpace(item));

		for (const p of phones) {
			if (!Array.isArray(p.notes)) {
				p.notes = [];
			}
			for (const n of notes) {
				if (n.trim() !== '') {
					p.notes.push(n);
				}
			}
		}
	}

	addParsedData(phones, 'phones');

	// parse company
	if (map.companyName !== undefined) {
		const company = structuredClone(CompanyTemplate);
		company.name = trimWhiteSpace(row[map.companyName] as string);
		companies.push(company);
	}

	if (companies.length !== 0 && map.companyNotes !== undefined) {
		const note = trimWhiteSpace(row[map.companyNotes] as string);
		const notes = note.split(',').map((item) => trimWhiteSpace(item));
		for (const c of companies) {
			if (c.notes === undefined) {
				c.notes = [];
			}
			for (const n of notes) {
				if (n.trim() !== '') {
					c.notes.push(n);
				}
			}
		}
	}

	addParsedData(companies, 'company');

	// parse bank
	if (map.bankName !== undefined) {
		const bank = structuredClone(BankTemplate);
		bank.name = trimWhiteSpace(row[map.bankName] as string);
		if (map.bankCode !== undefined)
			bank.bankCode = trimWhiteSpace(row[map.bankCode] as string);
		if (map.iban !== undefined)
			bank.iban = trimWhiteSpace(row[map.iban] as string);
		if (map.bic !== undefined)
			bank.bic = trimWhiteSpace(row[map.bic] as string);
		if (map.bankNotes !== undefined) {
			const note = trimWhiteSpace(row[map.bankNotes] as string);
			const notes = note.split(',').map((item) => trimWhiteSpace(item));
			if (bank.notes === undefined) {
				bank.notes = [];
			}
			for (const n of notes) {
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
		db.createObjectStore('company', {
			keyPath: 'row',
		});
	}
}

function trimWhiteSpace(input: string): string {
	let out = input;
	out = out.replaceAll(rx.WhiteSpaceRx, '');
	return out;
}
