// eslint-disable-next-line
self.navigator.locks.query().then((res) => {
	// console.log(res);
	if (res !== undefined) {
		if (res.held !== undefined && res.pending !== undefined) {
			if (res.pending.length === 0) {
				if (res.held.length === 0) {
					self.navigator.locks.request(
						'import.worker.ts',
						{ mode: 'exclusive', ifAvailable: true },
						(e) => {
							// console.log(e);
							self.onmessage = requestHandler;
							// console.log('acquired lock');
						}
					);
					// .then((e) => console.log(e));
				}
			}
		}
	}
});
//@ts-ignore
const requestHandler = (e: MessageEvent): void => {
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

			const request = indexedDB.open('factor_db');

			request.onsuccess = () => {
				// console.log('success')
				// console.log(e)
				// @ts-ignore
				const db = request.result;
				deleteData(db);
				addData(keys, rows, db);
				const copy = [...keys];
				copy.splice(0, 0, 'factor_db_id');
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
				db.createObjectStore('data_upload', { keyPath: 'factor_db_id' });
				// let objectStore = db.createObjectStore('data_upload', { keyPath: 'factor_db_id' })
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
			alignData(alignVariables.col, alignVariables.value, offset);

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
			rankColsByCondition(condition);
			break;
		case 'deleteCol':
			const colToBeDeleted: string = e.data.message;
			console.log('about to delete col ' + colToBeDeleted);
			deleteCol(colToBeDeleted);
			break;

		case 'sort':
			interface SortingMap {
				customerID: string;
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
				first?: string;
				latest?: string;
				notes?: string;
			}
			console.log('do sorting');
			const columnsMap: SortingMap = e.data.message;
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
					doCustomers(columnsMap);
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
	for (let i = 1; i < rows.length; i++) {
		const columns = rows[i].split(';');
		const out = {};
		out['factor_db_id'] = i;
		for (let j = 0; j < keys.length; j++) {
			out[keys[j]] = columns[j];
		}
		objectStore.add(out);
	}
}

function deleteData(db: IDBDatabase) {
	const transaction = db.transaction(['data_upload'], 'readwrite');
	const objectStore = transaction.objectStore('data_upload');
	objectStore.clear();
}

function alignData(col: string, searchValue: string, shiftAmount: number) {
	const request = indexedDB.open('factor_db');
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

function rankColsByCondition(condition: string | null | number | undefined) {
	const dbRequest = indexedDB.open('factor_db');
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
				keys.splice(keys.indexOf('factor_db_id'), 1);
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
						console.log(index);
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
			console.log('unknown type of condition', typeof condition, condition);
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
			console.log('start col deletion');
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
						console.log('deleted col');
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

function doCustomers(map: CustomerMapType) {
	const request = indexedDB.open('factor_db', 2);

	request.onupgradeneeded = () => {
		const db = request.result;

		if (!db.objectStoreNames.contains('customers')) {
			console.log('creating object store');
			const store = db.createObjectStore('customers', {
				keyPath: 'customerID',
			});
			store.createIndex('customerID', 'customerID', { unique: true });
			store.createIndex('oldCustomerIDs', 'oldCustomerIDs');
			store.createIndex('companyName', 'companyName');
			store.createIndex('alias', 'alias');
			store.createIndex('persons', 'persons');
			store.createIndex('addresses', 'addresses');
			store.createIndex('bank', 'bank');
			store.createIndex('email', 'email');
			store.createIndex('phone', 'phone');
			store.createIndex('firstContact', 'firstContact');
			store.createIndex('latestContact', 'latestContact');
			store.createIndex('notes', 'notes');
		}
		if (!db.objectStoreNames.contains('articles')) {
			db.createObjectStore('articles', { keyPath: ['articleID'] });
		}
		if (!db.objectStoreNames.contains('quotes')) {
			db.createObjectStore('quotes', { keyPath: ['quoteID'] });
		}
		if (!db.objectStoreNames.contains('invoices')) {
			db.createObjectStore('invoices', { keyPath: ['invoiceID'] });
		}
		if (!db.objectStoreNames.contains('deliveries')) {
			db.createObjectStore('deliveries', { keyPath: ['deliveryID'] });
		}
		if (!db.objectStoreNames.contains('returnees')) {
			db.createObjectStore('returnees', { keyPath: ['returnID'] });
		}
		console.log('upgraded DB');
	};

	request.onsuccess = () => {
		const db = request.result;
		const transaction = db.transaction(
			['customers', 'data_upload'],
			'readwrite'
		);
		const customers = transaction.objectStore('customers');
		const data_upload = transaction.objectStore('data_upload');
		console.log('start count');
		data_upload.count().onsuccess = (ev) => {
			//@ts-expect-error
			const count: number = ev.target.result;
			const update = updateManager(count);
			console.log('start cursor');
			data_upload.openCursor(null, 'next').onsuccess = (e) => {
				// @ts-expect-error
				const cursor: IDBCursorWithValue = e.target.result;
				if (cursor !== null) {
					const row = cursor.value;

					const customerRow: CustomerType = parseCustomer(map, row);
					update();
					customers.put(customerRow);
					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						postMessage({ type: 'success' });
						console.log('done adding data');
					}
				}
			};
		};
	};
}

function parseCustomer(map: CustomerMapType, row: any): CustomerType {
	let customerRow: CustomerType;
	customerRow = {
		customerID: '',
		addresses: [],
		bank: [],
		companyName: undefined,
		email: [],
		firstContact: undefined,
		latestContact: new Date(),
		notes: [],
		oldCustomerIDs: [],
		persons: [],
		phone: [],
		alias: [],
	};
	let tmp: string = '';

	for (const [key, value] of Object.entries(map)) {
		if (value !== '-' && value.trim().length !== 0) {
			switch (key) {
				case 'customerID':
					tmp = row[value];
					tmp = tmp.trim();
					customerRow['customerID'] = tmp;
					break;
				case 'title':
					tmp = row[value];
					tmp = tmp.trim();
					let title = new TitleType(tmp);
					let customerPerson: PersonType = {
						title: undefined,
					};
					if (title.title === undefined) {
						break;
					}
					if (customerRow.persons !== undefined) {
						if (customerRow.persons.length === 0) {
							customerPerson.title = title;
							customerRow.persons.push({ title: title });
						} else {
							if (customerRow.persons.length === 1) {
								if (customerRow.persons[0].title === undefined) {
									customerRow.persons[0].title = title;
								}
							}
						}
					}
					break;
				case 'firstName':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.persons === undefined) {
						customerRow.persons = [];
					}
					if (tmp.includes('&') || tmp.includes('+')) {
						tmp.replaceAll('&', ':');
						tmp.replaceAll('+', ':');
						let firstNames = tmp.split(':');
						firstNames.forEach((elem, index) => {
							let firstName = elem.trim();
							if (customerRow.persons !== undefined) {
								if (customerRow.persons[index] === undefined) {
									customerRow.persons[index] = {
										firstName: firstName,
									};
								} else {
									customerRow.persons[index].firstName = firstName;
								}
							}
						});
					} else {
						if (customerRow.persons !== undefined) {
							if (customerRow.persons.length === 0) {
								customerRow.persons.push({
									firstName: tmp,
								});
							} else {
								if (customerRow.persons[0].firstName === undefined) {
									customerRow.persons[0].firstName = tmp;
								}
							}
						}
					}
					break;
				case 'lastName':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.persons === undefined) {
						customerRow.persons = [];
					}

					if (customerRow.persons !== undefined) {
						if (customerRow.persons.length === 0) {
							customerRow.persons.push({ lastName: tmp });
						} else {
							if (customerRow.persons[0].lastName === undefined) {
								customerRow.persons[0].lastName = tmp;
							}
						}
					}
					break;
				case 'email':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.email === undefined) {
						customerRow.email = [];
					}
					if (customerRow.email !== undefined) {
						// check if a company name exists
						if (map['companyName'] !== undefined) {
							if (row[map['companyName']] !== undefined) {
								if (row[map['companyName']].trim().length !== 0) {
									// a company name exists, so assign the emails to the top level
									if (tmp.includes(',')) {
										let emails = tmp.split(',');
										emails.forEach((elem, index) => {
											if (elem.trim.length !== 0) {
												if (customerRow.email !== undefined) {
													if (customerRow.email)
														customerRow.email[index] = {
															email: elem.trim(),
														};
												}
											}
										});
									} else {
										customerRow.email.push({ email: tmp });
									}
								}
							}
						} else {
							if (
								map['firstName'] !== undefined ||
								map['lastName'] !== undefined
							) {
								if (customerRow.persons !== undefined) {
									if (customerRow.persons.length === 0) {
										customerRow.persons[0] = {
											email: [{ email: tmp }],
										};
									} else {
										if (customerRow.persons[0].email !== undefined) {
											customerRow.persons[0].email.push({
												email: tmp,
											});
										}
									}
								}
							}
						}
					}
					break;
				case 'phone':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.phone === undefined) {
						customerRow.phone = [];
					}

					if (customerRow.phone !== undefined) {
						customerRow.phone.push({ number: tmp });
					}
					break;
				case 'web':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					// not yet implemented
					break;
				case 'companyName':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.companyName === undefined) {
						customerRow.companyName = tmp;
					}
					break;
				case 'alias':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					// not yet implemented
					break;
				case 'street':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.addresses === undefined) {
						customerRow.addresses = [];
					}

					if (customerRow.addresses !== undefined) {
						if (customerRow.addresses.length === 0) {
							const addressID = crypto.randomUUID();
							customerRow.addresses.push({
								addressID: addressID,
								street: tmp,
								type: undefined,
							});
						} else {
							customerRow.addresses[0].street = tmp;
						}
					}
					break;
				case 'zip':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.addresses === undefined) {
						customerRow.addresses = [];
					}

					if (customerRow.addresses !== undefined) {
						if (customerRow.addresses.length === 0) {
							const addressID = crypto.randomUUID();
							customerRow.addresses.push({
								addressID: addressID,
								zip: tmp,
								type: undefined,
							});
						} else {
							customerRow.addresses[0].zip = tmp;
						}
					}
					break;
				case 'city':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.addresses === undefined) {
						customerRow.addresses = [];
					}

					if (customerRow.addresses !== undefined) {
						if (customerRow.addresses.length === 0) {
							const addressID = crypto.randomUUID();
							customerRow.addresses.push({
								addressID: addressID,
								city: tmp,
								type: undefined,
							});
						} else {
							customerRow.addresses[0].city = tmp;
						}
					}
					break;
				case 'country':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.addresses === undefined) {
						customerRow.addresses = [];
					}

					if (customerRow.addresses !== undefined) {
						if (customerRow.addresses.length === 0) {
							const addressID = crypto.randomUUID();
							customerRow.addresses.push({
								addressID: addressID,
								country: tmp,
								type: undefined,
							});
						} else {
							customerRow.addresses[0].country = tmp;
						}
					}
					break;
				case 'firstContact':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					let ymd = [
						parseInt(tmp[0] + tmp[1] + tmp[2] + tmp[3]),
						parseInt(tmp[4] + tmp[5]),
						parseInt(tmp[6] + tmp[7]),
					];
					for (const item of ymd) {
						if (isNaN(item)) {
							break;
						}
					}
					let firstContact = new Date(ymd[0], ymd[1], ymd[2]);
					if (customerRow.firstContact === undefined) {
						customerRow.firstContact = firstContact;
					}

					break;
				case 'latestContact':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						if (customerRow.latestContact === undefined) {
							customerRow.latestContact = new Date();
						}
						break;
					}
					let ymd2 = [
						parseInt(tmp[0] + tmp[1] + tmp[2] + tmp[3]),
						parseInt(tmp[4] + tmp[5]),
						parseInt(tmp[6] + tmp[7]),
					];
					for (const item of ymd2) {
						if (isNaN(item)) {
							break;
						}
					}
					let latestContact = new Date(ymd2[0], ymd2[1], ymd2[2]);
					if (customerRow.latestContact === undefined) {
						customerRow.latestContact = latestContact;
					}
					break;
				case 'notes':
					tmp = row[value];
					tmp = tmp.trim();
					if (tmp.length === 0) {
						break;
					}
					if (customerRow.notes === undefined) {
						customerRow.notes = [];
					}
					if (customerRow.notes !== undefined) {
						let notes = tmp.split(',');
						notes.forEach((note) => {
							if (customerRow.notes !== undefined) {
								customerRow.notes.push(note);
							}
						});
					}
					break;
				default:
					break;
				// console.log('');
			}
		}
	}
	// console.table([customerRow])
	return customerRow;
}

// types (copy of @util/types/database/DatabaseTypes.d.ts)
const TitleRx = new RegExp(
	'^(?<title>(?<start>^[hHmMFfDd])(?<afterStart>((?<=[Hh])e?r{1,2}.?)|((?<=[Ff])ra?u?.?)|((?<=[Mm])(((iste)?r)|(is)?s).?)|((?<=[Dd])(octo)?r.?)))s?(?<doctorTitle>([dD](octo)?r.?s{0,3}((([mM]ed.?)|([jJ]ur.?)|([Dd]ent.?))s{0,3}){0,2}){1,3})?(?<diploma>(([dD]ipl(oma?)?.?)(-?s{0,2}?((Ing)|(Kf[mr])).?)|([BM].[ABCEMPST]{1}((omp|hem|ath|ci?|hil|con|ech|cc|rim).)?)){0,2}|([mM]ag.))?[W]?$',
	'gm'
);

type CustomerMapType = {
	customerID: string;
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
	notes?: string;
};

interface CustomerType {
	// unique customer id
	customerID: string;
	// (optional) old customer ids, for backward compatibility
	oldCustomerIDs?: string[];
	// (optional) the Corporate person-hood or company name of there are any
	companyName?: string;
	// (optional) company alias
	alias?: string[];
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
	firstContact?: Date;
	// (optional) the date of the last encounter
	latestContact?: Date;
	// (optional) notes
	notes?: string[];
}

interface NameType {
	// (optional) the name of the company
	name?: string;
	// (optional) alternative names of the company
	alias?: string[];

	// (optional) company description
	description?: string;
	// (optional) any additional Information
	notes?: string[];
}

interface AddressType {
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
}

interface PersonType {
	// (optional) title
	title?: TitleType;
	// (optional) first Name (including middle Names)
	firstName?: string;
	// (optional) any last Names
	lastName?: string;
	// (optional)
	alias?: string[];
	// (optional) associated email addresses
	email?: EmailType[];
	//  (optional) associated phone numbers
	phone?: PhoneNumberType[];
	// (optional) notes on that person
	notes?: string[];
}

interface TitleValidator {
	isAcceptable(s: string): boolean;
}

class TitleType implements TitleValidator {
	title: string | undefined;

	constructor(input: string) {
		if (this.isAcceptable(input)) {
			this.title = input;
		}
	}
	isAcceptable(s: string): boolean {
		return TitleRx.test(s);
	}
}

interface PhoneNumberType {
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
		| 'boss';
	// phone number
	number: string;
	// (optional) note for the phone number
	notes?: string;
}

interface EmailType {
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
}

interface BankType {
	bank: string;
	bankCode?: string;
	IBAN?: string;
	BIC?: string;
}

interface ArticleType {
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

interface PriceType {
	withVAT: number;
	noVAT: number;
	unit: 'EUR' | 'DM' | 'USD';
}

interface AcquisitionType {
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
}

interface LastEncounterType {
	date: Date;
	// (optional) id of corresponding quote
	QuoteID?: string;
	// (optional) id of corresponding invoice
	InvoiceID?: string;
	// (optional) id of corresponding delivery note
	DeliveryID?: string;
}

// ordered list from first:  parent category -> ...sub categories -> article category
type CategoryType = Set<string>;

interface StepDiscountType {
	type: 'step';
	// at what number of items a new price gets applies
	steps: number[];
	prices: Set<number>;
	// (optional) at what price the discount the should be stopped, regardless of count
	minPrice?: number;
}

interface PercentDiscountType {
	type: 'percent';
	// when to apply a new percentage
	steps: Set<number>;
	// the percentage ( 0 - 100)
	percentage: Set<number>;
	// (optional) at what price the discount the should be stopped, regardless of count
	minPrice?: number;
}

interface DiscountType {
	amount: number;
	unit: 'EUR' | 'DM' | 'USD' | '%';
}

interface BaseType {
	customerID: string | string[];
	// all article Ids and how many of them
	articleList: ArticleListItem[];
	date: Date;
	addressIDs: {
		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "shipping" or "both"
		shipping?: string;
		// (optional) the address id stored in the CustomerType>addresses[n]>addressID with type "billing" or "both"
		billing?: string;
	};
}

interface ArticleListItem {
	// the article ID
	articleID: string;
	// how many
	count: number;
}

interface QuoteType extends BaseType {
	// unique id for the quote
	quoteID: string;
	// (optional) if the articles are rented when are they going to be returned
	returning?: Date;
	// (optional) time in hours
	duration?: number;
}

interface InvoiceType extends BaseType {
	// unique identifier
	invoiceID: string;
	// total price without discount
	price: PriceType;
	// (optional) total price with discount
	priceWithDiscount?: PriceType;
	// (optional) a discount if there are any to apply
	totalDiscount?: DiscountType;
}

interface DeliveryType extends BaseType {
	deliveryID: string;
}

interface ReturneeType extends BaseType {
	returnID: string;
	// the Date and time when the item was returned
	returned: Date;
	// (optional) Notes on the returned Items
	notes?: string[];
}
