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
	CustomerReferences,
	AddDataArgs,
	DateInput,
	UploadRow,
	DerefPersonType,
	CustomerBaseData,
	ArticleSortingMap,
	DocumentSortingMap,
} from '../types/types';
import { getAddressHash } from '../func/func';

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
			const mode: 'articles' | 'customers' | 'documents' = e.data.content;
			switch (mode) {
				case 'articles':
					const articlesMap: ArticleSortingMap = e.data.message;
					doArticles(articlesMap, e.data.dataBaseName, e.data.dbVersion);
					break;
				case 'customers':
					const columnsMap: CustomerSortingMap = e.data.message;
					doCustomers(columnsMap, e.data.dataBaseName, e.data.dbVersion);
					break;
				case 'documents':
					const documentsMap: DocumentSortingMap = e.data.message;
					doDocuments(documentsMap, e.data.dataBaseName, e.data.dbVersion);
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

// const customerTemplate: Customer = {
// 	id: '',
// 	row: 0,
// 	addresses: undefined,
// 	altIDs: undefined,
// 	persons: undefined,
// 	banks: undefined,
// 	company: undefined,
// 	emails: undefined,
// 	phones: undefined,
// 	description: undefined,
// 	firstContact: undefined,
// 	latestContact: undefined,
// 	created: new Date(),
// 	website: undefined,
// };

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

			dataUploadCountRequest.onerror = () => {
				postMessage({
					type: 'error',
					message: 'doCustomers: failed to count',
				});
			};

			dbTransaction.oncomplete = () => {
				postMessage({
					type: 'success',
					message: 'customers',
				});
			};
		};
	};

	request.onupgradeneeded = createCustomerObjectStores;
}

function parseCustomer(
	map: CustomerSortingMap,
	row: UploadRow,
	customerDB: IDBDatabase
): void {
	const customer: Customer = structuredClone(
		templates.get('customer')
	) as Customer;
	customer.id = trimWhiteSpace(row[map.customers.id] as string);
	customer.row = row.row;
	customer.created = new Date();

	/**
	 *
	 * @param buffer the preexisting Arraybuffer, if there is note one will be created
	 * @param value the number to add to the array buffer
	 */
	function updateArrayBuffer(
		buffer: ArrayBuffer | undefined,
		value: number
	): ArrayBuffer {
		if (buffer instanceof ArrayBuffer) {
			let buf = buffer;

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

	/**
	 *	updates the references (array buffer) on the customer with the customerID id
	 * @param id customerID
	 * @param key "company" | "persons" | "addresses" | "banks"
	 * @param value number
	 */
	function updateCustomer(id: string, key: CustomerReferences, value: number) {
		const transaction = customerDB.transaction('customers', 'readwrite');
		const oStore = transaction.objectStore('customers');
		const index = oStore.index('customers-id');
		const request = index.get(id);
		// get the customer
		request.onsuccess = () => {
			const entry: Customer = request.result;
			if (entry) {
				// the customer exists
				if (Object.keys(entry).includes(key)) {
					// the property does exist
					entry[key] = updateArrayBuffer(entry[key], value);
				} else {
					// the property does not exist
					// so we create it
					// the max count of references this buffer holds = max size / size of one item = 128/2 = 64
					// so one array contains a max 64 references
					// a reference is just an integer , which shows the position of an item in another object store
					const buf = updateArrayBuffer(undefined, value);
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

	async function insertEmail(data: EmailType): Promise<number> {
		return new Promise((resolve, reject) => {
			const transaction = customerDB.transaction('emails');
			const oStore = transaction.objectStore('emails');
			const index = oStore.index('email');
			const indexRequest = index.get(data.email);
			indexRequest.onsuccess = () => {
				const result = indexRequest.result;
				if (result === undefined) {
					// the email does not exist in the oStore
					// so we can add it
					const countRequest = oStore.count();
					countRequest.onsuccess = () => {
						const count = countRequest.result;
						data.row = count + 1;
						oStore.add(data);
						transaction.commit();
						resolve(count + 1);
					};
					countRequest.onerror = () => {
						reject('insertEmail: countRequest failed');
					};
				} else {
					resolve((result as EmailType).row);
				}
			};
			indexRequest.onerror = () => {
				reject('insertEmail: indexRequestFailed');
			};
		});
	}

	async function insertPhone(data: PhoneNumberType): Promise<number> {
		return new Promise((resolve, reject) => {
			const transaction = customerDB.transaction('phones');
			const oStore = transaction.objectStore('phones');
			const index = oStore.index('phone');
			const indexRequest = index.get(data.phone);
			indexRequest.onsuccess = () => {
				const result = indexRequest.result;
				if (result === undefined) {
					// the email does not exist in the oStore
					// so we can add it
					const countRequest = oStore.count();
					countRequest.onsuccess = () => {
						const count = countRequest.result;
						data.row = count + 1;
						oStore.add(data);
						transaction.commit();
						resolve(count + 1);
					};
					countRequest.onerror = () => {
						reject('insertPhone: countRequest failed');
					};
				} else {
					resolve((result as PhoneNumberType).row);
				}
			};
			indexRequest.onerror = () => {
				reject('insertPhone: indexRequestFailed');
			};
		});
	}

	function addParsedData(
		data: DerefPersonType[] | AddressType[] | CompanyType[] | BankType[],
		type: keyof CustomerBaseData
	): void {
		// create a new transaction
		// open the oStore
		const transaction = customerDB.transaction(type, 'readwrite');
		const oStore = transaction.objectStore(type);
		for (const value of data) {
			switch (type) {
				case 'persons':
					let personsRow = value as DerefPersonType;
					let personsToAdd: DerefPersonType[] = [];
					if (personsRow.firstName !== undefined) {
						if (personsRow.firstName.includes('&')) {
							let person1 = structuredClone(personsRow);
							let person2 = structuredClone(personsRow);
							let personNames = personsRow.firstName
								.split('&')
								.map((item) => trimWhiteSpace(item));
							person1.firstName = personNames[0];
							person2.firstName = personNames[1];
							personsToAdd.push(person1);
							personsToAdd.push(person2);
						} else {
							personsToAdd.push(personsRow);
						}
					} else {
						personsToAdd.push(personsRow);
					}
					let reffedPersons: PersonType[] = [];
					for (const [index, person] of personsToAdd.entries()) {
						const refPerson = person as PersonType;
						refPerson.emails = undefined;
						refPerson.phones = undefined;
						reffedPersons[index] = refPerson;

						if (person.emails !== undefined) {
							let promises: Promise<number>[] = [];
							for (const email of person.emails) {
								promises.push(insertEmail(email));
							}
							Promise.all(promises).then((emailRowNumbers: number[]) => {
								emailRowNumbers.forEach((value) => {
									reffedPersons[index].emails = updateArrayBuffer(
										reffedPersons[index].emails,
										value
									);
								});
							});
						}

						if (person.phones !== undefined) {
							let promises: Promise<number>[] = [];
							for (const phone of person.phones) {
								promises.push(insertPhone(phone));
							}
							Promise.all(promises).then((phoneRowNumbers: number[]) => {
								phoneRowNumbers.forEach((value) => {
									reffedPersons[index].phones = updateArrayBuffer(
										reffedPersons[index].phones,
										value
									);
								});
							});
						}
					}

					let personsCountRequest = oStore.count();
					personsCountRequest.onsuccess = () => {
						const count = personsCountRequest.result;
						for (const [index, person] of reffedPersons.entries()) {
							person.row = count + index + 1;
							oStore.add(person);
							updateCustomer(row[map.customers.id], type, person.row);
						}
					};
					break;
				case 'addresses':
					let addressRow = value as AddressType;
					getAddressHash(
						addressRow.street ?? '',
						addressRow.zip ?? '',
						addressRow.city ?? ''
					).then((hash) => {
						//check if the address already exists
						let oStoreIndex = oStore.index('addresses-hash');
						let addressRequest = oStoreIndex.get(hash);
						addressRequest.onsuccess = () => {
							if (addressRequest.result !== undefined) {
								// address already exits
								// the only thing to do is overwrite other values, if we can
								if (
									addressRow.country !== undefined ||
									addressRow.notes !== undefined ||
									addressRow.type !== undefined
								) {
									let result = addressRequest.result as AddressType;
									if (addressRow.country !== undefined) {
										result.country = addressRow.country;
									}
									if (addressRow.notes !== undefined) {
										if (result.notes !== undefined) {
											result.notes = [
												...result.notes,
												...addressRow.notes,
											];
										} else {
											result.notes = addressRow.notes;
										}
									}
									if (addressRow.type !== undefined) {
										result.type = addressRow.type;
									}
									oStore.put(result);
								}
							} else {
								// the address does not already exist
								const CountRequest = oStore.count();
								CountRequest.onsuccess = () => {
									const count = CountRequest.result;
									addressRow.row = count + 1;
									addressRow.hash = hash;
									oStore.add(addressRow);
								};
							}
						};
					});
					break;
				case 'banks':
					let banksRow = value as BankType;
					if (banksRow.iban !== undefined) {
						let oStoreIndex = oStore.index('banks-iban');
						let indexRequest = oStoreIndex.get(banksRow.iban);
						indexRequest.onsuccess = () => {
							if (indexRequest.result) {
								// the iban exists
								let result = indexRequest.result as BankType;
								updateCustomer(row[map.customers.id], type, result.row);
								for (let [k, v] of Object.entries(result)) {
									let key = k as keyof BankType;
									if (key !== 'row') {
										if (banksRow[key] === undefined) {
											banksRow[key] = v;
										} else {
											if (key === 'notes') {
												banksRow[key] = [
													...v,
													...(banksRow[key] as string[]),
												];
											}
										}
									}
								}
								oStore.put(banksRow);
							} else {
								// the iban does not exist
								let countRequest = oStore.count();
								countRequest.onsuccess = () => {
									let count = countRequest.result;
									banksRow.row = count + 1;
									oStore.add(banksRow);

									updateCustomer(
										row[map.customers.id],
										type,
										count + 1
									);
								};
							}
						};
					} else {
						// there is no iban
						// so we just add a new entry
						let countRequest = oStore.count();
						countRequest.onsuccess = () => {
							let count = countRequest.result;
							banksRow.row = count + 1;
							oStore.add(banksRow);

							updateCustomer(row[map.customers.id], type, count + 1);
						};
					}

					break;
				case 'company':
					let companyRow = value as CompanyType;
					let index = oStore.index('company-name');
					let indexRequest = index.get(companyRow.name);
					indexRequest.onsuccess = () => {
						if (indexRequest.result) {
							// the company already exists
							let result = indexRequest.result as CompanyType;
							updateCustomer(row[map.customers.id], type, result.row);
							for (let [k, v] of Object.entries(result)) {
								let key = k as keyof CompanyType;
								if (key !== 'row') {
									if (companyRow[key] === undefined) {
										companyRow[key] = v;
									} else {
										if (key === 'notes') {
											companyRow[key] = [
												...v,
												...(companyRow[key] as string[]),
											];
										}
									}
								}
							}
							oStore.put(companyRow);
						} else {
							// the company does not exist
							// so we add it
							let countRequest = oStore.count();
							countRequest.onsuccess = () => {
								let count = countRequest.result;
								companyRow.row = count + 1;
								oStore.add(companyRow);
								updateCustomer(row[map.customers.id], type, count + 1);
							};
						}
					};
					break;
				default:
					console.error('addParsedData: ' + type + ' not found');
			}
		}
	}

	if (map.customers.notes !== undefined) {
		const note = trimWhiteSpace(row[map.customers.notes] as string);
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

	if (map.customers.description !== undefined) {
		customer.description = trimWhiteSpace(
			row[map.customers.description] as string
		);
	}

	if (map.customers.firstContact !== undefined) {
		customer.firstContact = parseDate(
			row[map.customers.firstContact] as string,
			'YYYY-MM-DD hh:mm:ss'
		);
	}

	if (map.customers.latestContact !== undefined) {
		customer.firstContact = parseDate(
			row[map.customers.latestContact] as string,
			'YYYY-MM-DD hh:mm:ss'
		);
	}

	if (map.customers.altIDs !== undefined) {
		const altIDs = trimWhiteSpace(row[map.customers.altIDs] as string);
		const ids = altIDs.split(',').map((item) => trimWhiteSpace(item));
		if (customer.altIDs === undefined) {
			customer.altIDs = [];
		}
		for (const id of ids) {
			if (id.trim() !== '') {
				customer.altIDs.push(id);
			}
		}
	}

	if (map.customers.website !== undefined) {
		let website = trimWhiteSpace(row[map.customers.website]);
		if (website.includes('http')) {
			if (website.includes('http://')) {
				website.replace('http://', 'https://');
			}
		} else {
			website = 'https://' + website;
		}
		customer.website = website;
	}

	const transaction = customerDB.transaction('customers', 'readwrite');
	const oStoreCustomers = transaction.objectStore('customers');
	const customersIndex = oStoreCustomers.index('customers-id');
	const customersIndexRequest = customersIndex.get(customer.id);
	customersIndexRequest.onsuccess = () => {
		if (customersIndexRequest.result) {
			//customer with this id already exists
			let preexistingCustomer = customersIndexRequest.result as Customer;
			for (let [k, v] of Object.entries(preexistingCustomer)) {
				const key = k as keyof Customer;
				if (key !== 'row' && !(v instanceof ArrayBuffer)) {
					if (customer[key] !== undefined) {
						if (key === 'notes') {
							if (v !== undefined) {
								let value = v as string[];
								preexistingCustomer[key] = [...value, ...customer[key]];
							} else {
								preexistingCustomer[key] = customer[key];
							}
						} else {
							// overwrite data
							// @ts-expect-error the types will match, because the key is the same
							preexistingCustomer[key] = customer[key];
						}
					}
				}
			}
			oStoreCustomers.put(preexistingCustomer);
		} else {
			// customer does not exist
			// oStore.put(customer);
			let customersCountRequest = oStoreCustomers.count();
			customersCountRequest.onsuccess = () => {
				let customersCount = customersCountRequest.result;
				customer.row = customersCount + 1;
				oStoreCustomers.add(customer);
			};
		}
	};

	let oStoreItems: CustomerBaseData = {
		persons: [],
		addresses: [],
		company: [],
		banks: [],
	};

	// fill oStoreItems with templates
	// the templates as filled with values from row[...]
	for (const [k, v] of Object.entries(map)) {
		// walk the map
		let key = k as keyof CustomerSortingMap;
		if (key !== 'row' && key !== 'customers') {
			// if the prop is not "row"
			// and also not email
			// and also not phone
			// because those are nested
			// get the value of the prop
			let value: CustomerSortingMap[typeof key] = v;
			if (Object.keys(value).length !== 0) {
				// if there are actually any props in value
				// clone the correct template
				let template = structuredClone(templates.get(key));
				for (const [nk, nv] of Object.entries(value)) {
					// walk the value
					if (nv !== undefined) {
						if (typeof nv == 'string' && nv.length !== 0) {
							let nestedValue = nv; // this is the columnsName in row
							let nestedKey = nk;
							// if the value is not undefined
							if (typeof nestedValue !== 'object') {
								// we do not have another layer
								let column: string = map[key][nestedKey] as string;
								//@ts-expect-error ts does not what the template actually is
								template[nestedKey] = trimWhiteSpace(row[column]);
							} else {
								// this means nestedKey is ether "phones" or "emails"
								// this also means that key is either "customers" or "persons"
								let nestedKeyLetterList: string[] =
									Array.from(nestedKey);
								nestedKeyLetterList.pop();
								let nestedNestedKey: 'email' | 'phone' =
									nestedKeyLetterList.join('') as 'email' | 'phone';
								let nestedMainValue = trimWhiteSpace(
									row[map[key][nestedKey][nestedNestedKey]]
								)
									.split(',')
									.map((item) => trimWhiteSpace(item));
								//@ts-expect-error ts does not what the template actually is
								template[key][nestedKey] = nestedMainValue.map(
									(val: string) => {
										let out: {
											notes?: string[];
											type?: string;
										} = {
											notes: undefined,
											type: undefined,
										};
										if (map[key][nestedKey]['notes'] !== undefined) {
											if (
												row[map[key][nestedKey]['notes']].includes(
													','
												)
											) {
												out.notes = row[
													map[key][nestedKey]['notes']
												]
													.split(',')
													.map((item) => trimWhiteSpace(item));
											} else {
												out.notes = [
													row[map[key][nestedKey]['notes']],
												];
											}
										}

										if (map[key][nestedKey]['type'] !== undefined) {
											out.type = row[map[key][nestedKey]['type']];
										}
										out[nestedNestedKey] = val.toLowerCase();
										return out;
									}
								);
							}
						}
					}
				}
				(oStoreItems[key] as Array<typeof template>).push(template);
			}
		}
	}

	for (const [key, value] of Object.entries(oStoreItems)) {
		if (value.length !== 0) {
			addParsedData(value, key as keyof CustomerBaseData);
		}
	}
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
	}
}

function doArticles(map: ArticleSortingMap, dbName: string, dbVersion: number) {
	const dbRequest = indexedDB.open(dbName, dbVersion);
	console.log(map);
	dbRequest.onupgradeneeded = createArticleObjectStores;
}

function createArticleObjectStores(e: IDBVersionChangeEvent): void {
	const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
	const db = target.result;
	const stores = db.objectStoreNames;

	if (!stores.contains('articles')) {
		const articles = db.createObjectStore('articles', {
			keyPath: 'row',
		});
		articles.createIndex('articles-id', 'id', {
			unique: true,
		});
		articles.createIndex('articles-name', 'name', {
			unique: false,
		});
		articles.createIndex('articles-count', 'count', {
			unique: false,
		});
		articles.createIndex('articles-unit', 'unit', {
			unique: false,
		});
		articles.createIndex('articles-lastSeen', 'lastSeen', {
			unique: false,
		});
		articles.createIndex('articles-securityDeposit', 'securityDeposit', {
			unique: false,
		});
	}

	if (!stores.contains('acquisitions')) {
		const acquisitions = db.createObjectStore('acquisitions', {
			keyPath: 'row',
		});
		acquisitions.createIndex('acquisitions-date', 'date', {
			unique: false,
		});
		acquisitions.createIndex('acquisitions-totalCost', 'totalCost', {
			unique: false,
		});
		acquisitions.createIndex(
			'acquisitions-purchaseInvoiceID',
			'purchaseInvoiceID',
			{
				unique: false,
			}
		);
	}
}

function doDocuments(
	map: DocumentSortingMap,
	dbName: string,
	dbVersion: number
) {
	const dbRequest = indexedDB.open(dbName, dbVersion);
	console.log(map);
	dbRequest.onupgradeneeded = createDocumentObjectStores;
}

function createDocumentObjectStores(e: IDBVersionChangeEvent): void {
	const target: IDBOpenDBRequest = e.target as IDBOpenDBRequest;
	const db = target.result;
	const stores = db.objectStoreNames;

	if (!stores.contains('quotes')) {
		const quotes = db.createObjectStore('quotes', {
			keyPath: 'row',
		});

		quotes.createIndex('quotes-id', 'id', {
			unique: true,
		});

		quotes.createIndex('quotes-date', 'date', {
			unique: true,
		});

		quotes.createIndex('quotes-customerID', 'customerID', {
			unique: true,
		});
	}

	if (!stores.contains('invoices')) {
		const invoices = db.createObjectStore('invoices', {
			keyPath: 'row',
		});

		invoices.createIndex('invoices-id', 'id', {
			unique: true,
		});

		invoices.createIndex('invoices-date', 'date', {
			unique: false,
		});

		invoices.createIndex('invoices-customerID', 'customerID', {
			unique: false,
		});
	}

	if (!stores.contains('deliveries')) {
		const deliveries = db.createObjectStore('deliveries', {
			keyPath: 'row',
		});

		deliveries.createIndex('deliveries-id', 'id', {
			unique: true,
		});

		deliveries.createIndex('deliveries-date', 'date', {
			unique: false,
		});

		deliveries.createIndex('deliveries-customerID', 'customerID', {
			unique: false,
		});
	}

	if (!stores.contains('returnees')) {
		const returnees = db.createObjectStore('returnees', {
			keyPath: 'row',
		});

		returnees.createIndex('returnees-id', 'id', {
			unique: true,
		});

		returnees.createIndex('returnees-date', 'date', {
			unique: false,
		});

		returnees.createIndex('returnees-customerID', 'customerID', {
			unique: false,
		});
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
