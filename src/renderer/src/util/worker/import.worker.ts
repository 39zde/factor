import type { CustomerType } from '@util/types/database/DatabaseTypes';
// eslint-disable-next-line
self.navigator.locks.query().then((res) => {
	console.log(res);
	if (res !== undefined) {
		if (res.held !== undefined && res.pending !== undefined) {
			if (res.pending.length === 0) {
				if (res.held.length === 0) {
					self.navigator.locks
						.request(
							'import.worker.ts',
							{ mode: 'exclusive', ifAvailable: true },
							(e) => {
								console.log(e);
								self.onmessage = requestHandler;
								console.log('acquired lock');
							}
						)
						.then((e) => console.log(e));
				}
			}
		}
	}
});

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

			let rows: Array<string> = data.split('\n');
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
			let offset = alignVariables['offset'];
			if (alignVariables['direction'] === 'Left') {
				offset = offset - 2 * offset;
			}
			alignData(alignVariables['col'], alignVariables['value'], offset);

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
			type SortingMap = {
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
			};
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

function getKeys(row: string) {
	const keys = row.split(';');
	return keys;
}

function addData(keys: Array<string>, rows: Array<string>, db: IDBDatabase) {
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
				let progress: number = 0;
				let ratchet = 0.1;
				const counter: object = keysReq.result;
				for (const [k] of Object.entries(counter)) {
					counter[k] = 0;
				}

				// console.log(counter, keys)
				objStore.openCursor(null, 'next').onsuccess = (e) => {
					//@ts-ignore
					const cursor: IDBCursorWithValue | null = e.target.result;
					if (cursor !== null) {
						for (const key of keys) {
							progress += 1;
							const total = progress / (count * keys.length);
							if (total > ratchet) {
								ratchet += 0.1;
								postMessage({
									type: 'progress',
									message: `${(total * 100).toFixed(2)}%`,
								});
							}
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

function doCustomers(map: {
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
}) {
	const request = indexedDB.open('factor_db', 2);

	request.onupgradeneeded = () => {
		const db = request.result;

		if (!db.objectStoreNames.contains('customers')) {
			console.log('creating object store');
			db.createObjectStore('customers', {
				keyPath: 'customerID',
			});
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
			console.log('start cursor');
			data_upload.openCursor(null, 'next').onsuccess = (e) => {
				// @ts-expect-error
				const cursor: IDBCursorWithValue = e.target.result;
				if (cursor !== null) {
					const row = cursor.value;
					const customerRow: CustomerType = { customerID: '' };

					for (const [key, value] of Object.entries(map)) {
						if (value !== '-' && value.trim().length !== 0) {
							switch (key) {
								case '':
									break;
								default:
									console.log('');
							}
							customerRow[key] = row[value];
						}
					}
					console.log(customerRow);
					customers.put(customerRow);
					if (parseInt(cursor.key.toString()) < count) {
						cursor.continue();
					} else {
						console.log('done adding data');
					}
				}
			};
		};
	};
}
