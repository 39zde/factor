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
	TableRowCounter,
	ImportWorkerMessage,
	AlignVariables,
	RemoveVariables,
	DataBaseNames,
	RemoveCondition,
	RankedDeletion,
	UpdateMessage,
} from '@type';
import { getAddressHash, rx } from '@util';

self.onmessage = (e: MessageEvent): void => {
	const eventData = Array.isArray(e.data) ? (e.data[0] as ImportWorkerMessage) : (e.data as ImportWorkerMessage);
	if (eventData.dataBaseName === undefined) {
		return postMessage({
			type: 'error',
			data: `undefined Database name`,
		});
	}

	switch (eventData.type) {
		case 'import':
			importData(eventData.dataBaseName, eventData.dbVersion, 'data_upload', eventData.data as 'json' | 'csv', e.data[1] as ReadableStream);
			break;
		case 'restore':
			restoreBackup(eventData.dbVersion, e.data[1] as ReadableStream);
			break;
		case 'align':
			alignData(eventData.dataBaseName, eventData.dbVersion, eventData.data as AlignVariables);
			break;
		case 'rankColsByCondition':
			rankColsByCondition(eventData.dataBaseName, eventData.dbVersion, eventData.data as RemoveVariables);
			break;
		case 'delete-col':
			deleteCol(eventData.data as string, eventData.type);
			break;
		case 'delete-rank':
			deleteCol((eventData.data as RankedDeletion).columnName, eventData.type, (eventData.data as RankedDeletion).columnIndex);
			break;
		case 'sort':
			self.navigator.locks.request('sorting-lock', () => {
				if (eventData.targetDBName !== undefined) {
					sortData(
						eventData.dataBaseName,
						eventData.dbVersion,
						eventData.targetDBName,
						eventData.data as ArticleSortingMap | CustomerSortingMap | DocumentSortingMap
					);
				} else {
					return postMessage({
						type: 'error',
						data: `target data base name is undefined`,
					});
				}
			});
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

const updateManager = (
	task: 'import' | 'align' | 'sort' | 'delete-rank' | 'rank' | 'delete-col',
	total: number,
	addons?: (object | string | number)[]
) => {
	const increment = 0.1;
	let ratchet = 0.1;
	let counter = 0;
	let progress = 0;
	function postUpdate(msg: string): void {
		const updateMessage: UpdateMessage = {
			type: `${task}-progress`,
			data: msg,
		};
		if (addons !== undefined) {
			updateMessage.addons = addons;
		}
		postMessage(updateMessage);
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

function importData(dataBaseName: string, dbVersion: number, oStore: string, fileType: 'json' | 'csv', data: ReadableStream) {
	const request = indexedDB.open(dataBaseName, dbVersion);
	const readable = data.pipeThrough(new TextDecoderStream('utf-8'));
	const reader = readable.getReader();
	const update = updateManager('import', 4);
	let fuse = true;
	let lineEnd = '\n';
	const columns: string[] = [];
	let pos = 0;
	let tail: string | undefined = undefined;
	let nextTail: string | undefined = undefined;
	update();
	function genDBRow(columns: string[], values: string[], rowNumber: number) {
		const out = {
			row: rowNumber,
		};
		for (const [index, col] of columns.entries()) {
			Object.defineProperty(out, col, {
				configurable: true,
				enumerable: true,
				writable: true,
				value: values[index],
			});
		}
		return out;
	}

	request.onupgradeneeded = () => {
		const db = request.result;
		db.createObjectStore('data_upload', { keyPath: 'row' });
	};

	request.onsuccess = () => {
		const db = request.result;
		update();
		const transaction = db.transaction('data_upload', 'readwrite', { durability: 'strict' });
		const oStore = transaction.objectStore('data_upload');
		const clearRequest = oStore.clear();
		const promises: Promise<number | null>[] = [];

		clearRequest.onsuccess = () => {
			update();
			reader.read().then(function readDataUpload(value) {
				if (!value.done) {
					if (fileType === 'csv') {
						let rows = value.value.split(lineEnd);
						if (value.value.endsWith(lineEnd)) {
							rows.pop();
						} else {
							nextTail = rows.pop();
						}
						if (fuse) {
							if (rows[0].endsWith('\r')) {
								lineEnd = '\r\n';
								rows = value.value.split('\r\n');
								if (value.value.endsWith('\r\n')) {
									rows.pop();
								} else {
									nextTail = rows.pop();
								}
							}
							if (!rows[0].includes(';')) {
								return postMessage({
									type: 'error',
									data: 'This csv file is not separated by semicolons (;)',
								});
							}
							const cols = rows.splice(0, 1);
							cols[0].split(';').forEach((v) => {
								columns.push(v);
							});
							fuse = false;
						}
						for (const [index, row] of rows.entries()) {
							let dbRow;
							if (index === 0 && tail !== undefined) {
								dbRow = genDBRow(columns, (tail + row).split(';'), pos + 1);
								tail = undefined;
							} else {
								dbRow = genDBRow(columns, row.split(';'), pos + 1);
							}
							promises.push(addRowPromise(dataBaseName, dbVersion, 'data_upload', dbRow));
							pos += 1;
						}
						tail = nextTail;
						nextTail = undefined;
						console.log("read agaion")
						reader.read().then(readDataUpload);
					}
				} else {
					console.log("steam end, resolve promises")
					Promise.all(promises).then(() => {
						update();
						console.log('promises released');
						postMessage({
							type: 'import-done',
							data: [pos, columns],
						});
					});
				}
			});
		};
		transaction.oncomplete = () => {
			// db.close();
			// console.log('completed');
			// return postMessage({
			// 	type: 'imported',
			// 	data: [pos, columns],
			// });
		};
		transaction.onerror = (ev) => {
			console.log(ev);
			return postMessage({
				type: 'error',
				data: 'Database transaction failed',
			});
		};
		clearRequest.onerror = () => {
			console.log('clear error');
		};
	};

	request.onerror = () => {
		return postMessage({
			type: 'error',
			data: 'failed to open database',
		});
	};
}

function addRowPromise(dataBaseName: string, dbVersion: number, oStoreName: string, row: TableRow): Promise<number | null> {
	return new Promise((resolve, reject) => {
		addRow(dataBaseName, dbVersion, oStoreName, row, (result: number | null) => {
			if (result !== null) {
				resolve(result);
			} else {
				reject(null);
			}
		});
	});
}

function addRow(dataBaseName: string, dbVersion: number, oStoreName: string, row: TableRow, callback: (result: number | null) => void) {
	const dbRequest = indexedDB.open(dataBaseName, dbVersion);
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		const transaction = db.transaction(oStoreName, 'readwrite', { durability: 'strict' });
		const oStore = transaction.objectStore(oStoreName);
		const addRequest = oStore.add(row);
		addRequest.onsuccess = () => {
			transaction.commit();
			callback(row.row);
		};
		addRequest.onerror = () => {
			transaction.abort();
			callback(null);
		};
	};
	dbRequest.onblocked = () => {
		callback(null);
	};

	dbRequest.onerror = () => {
		callback(null);
	};
}

async function putRowPromise(dataBaseName: string, dbVersion: number, oStoreName: string, row: TableRow): Promise<number | null> {
	return new Promise((resolve, reject) => {
		putRow(dataBaseName, dbVersion, oStoreName, row, (result: number | null) => {
			if (result !== null) {
				resolve(result);
			} else {
				reject(null);
			}
		});
	});
}

function putRow(dataBaseName: string, dbVersion: number, oStoreName: string, row: TableRow, callback: (result: number | null) => void) {
	const dbRequest = indexedDB.open(dataBaseName, dbVersion);

	switch (dataBaseName) {
		case 'customer_db':
			dbRequest.onupgradeneeded = upgradeCustomerDB;
			break;
		case 'article_db':
			break;
		case 'document_db':
			break;
	}

	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		if (!db.objectStoreNames.contains(oStoreName)) {
			console.error(`${oStoreName} does not exist`);
			callback(null);
		} else {
			const transaction = db.transaction(oStoreName, 'readwrite', { durability: 'strict' });
			const oStore = transaction.objectStore(oStoreName);
			const putRequest = oStore.put(row);
			putRequest.onsuccess = () => {
				transaction.commit();
				callback(row.row);
			};
			putRequest.onerror = () => {
				transaction.abort();
				callback(null);
			};
		}
	};
	dbRequest.onblocked = () => {
		callback(null);
	};

	dbRequest.onerror = () => {
		callback(null);
	};
}

function alignData(dataBaseName: string, dbVersion: number, alignVariables: AlignVariables) {
	console.log(alignVariables);
	function performShift(to: number, item: TableRow) {
		const out = item;
		const copy = structuredClone(item);
		const keys = Object.keys(item);
		if (to > 0) {
			// ignore the first key (row key)
			for (let i = 1; i < keys.length; i++) {
				const key = keys[i];
				if (i <= Math.abs(to)) {
					let filler: string | number = '';
					if ((typeof copy[key] as string) === 'number') {
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
		const countRequest = objectStore.count();
		countRequest.onsuccess = () => {
			const count = countRequest.result;
			const update = updateManager('align', count);
			const cursorRequest = objectStore.openCursor(null, 'next');
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;
				if (cursor) {
					const row = cursor.value as TableRow;
					if (row[alignVariables.col] === undefined) {
						cursor.continue();
					}
					if (row[alignVariables.col] === alignVariables.value) {
						const result = performShift(shiftAmount, cursor.value);
						const updateRequest = cursor.update(result);
						updateRequest.onsuccess = () => {
							update();
							cursor.continue();
						};
						updateRequest.onerror = () => {
							console.error('failed to shift row ', cursor.value.row);
							update();
							cursor.continue();
						};
					} else {
						update();
						cursor.continue();
					}
				} else {
					postMessage({
						type: 'align-done',
						data: 'aligned values',
					});
				}
			};
		};
	};
}

function rankColsByCondition(dataBaseName: string, dbVersion: number, condition: RemoveVariables) {
	function compareItemToCondition(compareCondition: RemoveCondition, value: string | number): boolean {
		switch (compareCondition) {
			case 'undefined':
				if (value === undefined && value !== null) {
					return true;
				}
				return false;
			case 'null':
				if (value !== undefined && value === null) {
					return true;
				}
				return false;
			case 'custom number':
				if (typeof value === 'number' || typeof value === 'bigint') {
					if (value.toFixed(2) === parseFloat(condition.custom.number).toFixed(2)) {
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
			case 'custom string':
				if (typeof value === 'string') {
					if (value.trim() === condition.custom.string.trim()) {
						return true;
					}
					return false;
				}
				return false;
			case '0':
				let testVar;
				if (typeof value === 'number') {
					testVar = value.toFixed(2);
				} else {
					testVar = value;
				}
				if (testVar === '0.00') {
					return true;
				}
				return false;
			case 'empty text':
				if (typeof value !== 'string') {
					return false;
				}
				if (value.trim() === '') {
					return true;
				}
				return false;
			case '-':
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
				const firstRow: TableRow = keysReq.result;
				const keys = Object.keys(firstRow);
				keys.splice(keys.indexOf('row'), 1);
				const counter = firstRow as TableRowCounter;
				const update = updateManager('rank', count * keys.length);
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
							const test = compareItemToCondition(condition.condition, value);
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
							postMessage({ type: 'rank-done', data: ranking });
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

function deleteCol(col: string, responseType: 'delete-rank' | 'delete-col', rankedIndex?: number) {
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
			const update = updateManager(responseType, count, rankedIndex ? [rankedIndex] : undefined);
			const cursorRequest = objStore.openCursor(null, 'next');
			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;
				if (cursor) {
					const newValue = cursor.value;
					delete newValue[col];
					cursor.update(newValue);
					update();
					cursor.continue();
				} else {
					postMessage({
						type: `${responseType}-done`,
						data: rankedIndex,
					});
				}
			};
		};
	};
}

function restoreBackup(dbVersion: number, data: ReadableStream) {
	const readable = new TextDecoderStream('utf-8');
	const source = data.pipeThrough(readable);
	const reader = source.getReader();
	let dataBaseName: string | undefined = undefined;
	let oStoreName: string | undefined = undefined;
	let tail: string | undefined = undefined;
	let prevTail: string | undefined = undefined;
	let fuse = true;
	const promises: Promise<number | null>[] = [];
	reader.read().then(function readBackup(value) {
		if (!value.done) {
			// if there is data we can process
			let oStoreData = value.value.split(rx.importExportRx.oStoreSplitter);
			if (oStoreData.length > 1 && !rx.importExportRx.tailTester.test(oStoreData[oStoreData.length - 1])) {
				// if there are more than 1 oStores in this run and the last oStore does not end with `]`
				// store the last oStore in the tail an remove it from the oStores
				// in the next run we will add it again
				tail = oStoreData.pop();
			} else {
				tail === undefined;
			}

			for (const [index, store] of oStoreData.entries()) {
				// iterate the oStores
				let currentStore = store;
				if (index === 0 && prevTail !== undefined) {
					// if it is the first oStore and we have something stored from the previous run
					// add it in front of the current oStore
					currentStore = prevTail + currentStore;
					// discard once used
					prevTail = undefined;
				}
				if (fuse) {
					// runs once at the beginning of the stream
					// get the name of the database
					let dbNameSearch = rx.importExportRx.dbNameSelector.exec(currentStore);
					if (dbNameSearch !== null) {
						if (typeof dbNameSearch[0] === 'string') {
							dataBaseName = dbNameSearch[0];
							currentStore = currentStore.replace(rx.importExportRx.dbNameRemover, '');
						} else {
							console.error('failed to match dataBaseName');
						}
					} else {
						console.error('failed to match dataBaseName');
					}
					// burn the fuse
					fuse = false;
				}
				if (currentStore.trimStart().startsWith(`"`)) {
					// get oStoreName
					if (/^[\s]{0,}\"\w+\"/gm.test(currentStore)) {
						let testedOStore = currentStore.slice(currentStore.indexOf(`"`) + 1, currentStore.indexOf(':') - 1);
						testedOStore.replaceAll(`"`, '');
						oStoreName = testedOStore;
						currentStore = currentStore.replace(rx.importExportRx.oStoreNameRemover, '');
						// inform user about it
						postMessage({
							type: 'restore-progress',
							data: `restoring ${testedOStore}...`,
						});
					}
				}
				// split oStore data into rows
				const rows = currentStore.split(rx.importExportRx.rowSplitter);
				for (const [rowIndex, row] of rows.entries()) {
					let currentRow = row;
					if (currentRow.endsWith('}]')) {
						// if its the end of an oStore remove the square brackets
						currentRow = currentRow.slice(0, currentRow.length - 1);
					}
					if (currentRow.endsWith('}]}}')) {
						// if it is the end of the backup remove `]}}`
						currentRow = currentRow.slice(0, currentRow.length - 3);
					}

					if (!currentRow.startsWith('{') || !currentRow.endsWith('}')) {
						// if the row is cut somewhere
						if (rowIndex === rows.length - 1) {
							// and it is the last item of rows
							// add the data to the tail
							if (tail === undefined) {
								tail = currentRow;
							} else {
								tail += currentRow;
							}
						}
					} else {
						// if the row is cut nowhere
						try {
							// parse the row as json
							const parsedRow = JSON.parse(currentRow, (_key, value) => {
								if (Array.isArray(value)) {
									// when making changes to this keep the fillReferences function of the table worker in mind
									if (value.length !== 0) {
										if (typeof value[0] === 'number') {
											return createArrayBuffer(value);
										} else {
											return value;
										}
									} else {
										return undefined;
									}
								}
								return value;
							});
							if (parsedRow && dataBaseName && oStoreName) {
								// if successfully parsed, put the row into place
								// add the promise to our task list
								promises.push(putRowPromise(dataBaseName, dbVersion, oStoreName, parsedRow));
							}
						} catch (e) {
							console.error('failed to parse json', currentRow);
						}
					}
				}
			}
			// tail now becomes the previous tail
			prevTail = tail;
			tail = undefined;
			// proceed to the next chuck
			reader.read().then(readBackup);
		} else {
			// if there is no more data
			// resolve all promises
			Promise.all(promises).then(() => {
				// then inform the user we are done here
				console.log('restore done');
				console.log('all promises resolved');
				postMessage({
					type: 'restore-done',
					data: dataBaseName,
				});
			});
		}
	});
}

function parseCustomerData(
	dataBaseName: string,
	dbVersion: number,
	map: CustomerSortingMap,
	row: UploadRow,
	doneCallback: (result: number | null) => void
) {
	const customerDBrequest = indexedDB.open(dataBaseName, dbVersion);

	customerDBrequest.onupgradeneeded = upgradeCustomerDB;

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
			set(target: typeof customerCounter, prop: 'count' | 'total', value: number) {
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
		// these need to be defined in the customerDB request scope to 'function' properly
		function insertEmail(data: EmailType, callback: (result: number | null) => void): void {
			if (oStores.contains('emails')) {
				const emailData = data;
				emailData.email = emailData.email.toLowerCase();
				const emailTransaction = customerDB.transaction('emails', 'readwrite', { durability: 'strict' });
				const oStoreEmail = emailTransaction.objectStore('emails');
				if (oStoreEmail.indexNames.contains('emails-email')) {
					const emailIndex = oStoreEmail.index('emails-email');
					const emailIndexRequest = emailIndex.get(emailData.email);
					emailIndexRequest.onsuccess = () => {
						if (emailIndexRequest.result !== undefined) {
							// the email already exists
							const preexistingEmailRow = emailIndexRequest.result as EmailType;
							if (emailData.notes !== undefined) {
								preexistingEmailRow.notes = mergeArray(preexistingEmailRow.notes, emailData.notes);
							}
							if (emailData.type !== undefined) {
								preexistingEmailRow.type = emailData.type;
							}
							const putRequest = oStoreEmail.put(preexistingEmailRow);
							putRequest.onsuccess = () => {
								emailTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								emailTransaction.abort();
								callback(null);
							};
						} else {
							// the email does not exist already
							const emailCountRequest = oStoreEmail.count();
							emailCountRequest.onsuccess = () => {
								const emailCount = emailCountRequest.result;
								emailData.row = emailCount + 1;
								const addRequest = oStoreEmail.add(emailData);
								addRequest.onsuccess = () => {
									emailTransaction.commit();
									callback(addRequest.result as number);
								};
								addRequest.onerror = () => {
									emailTransaction.abort();
									callback(null);
								};
							};
							emailCountRequest.onerror = () => {
								emailTransaction.abort();
								callback(null);
							};
						}
					};
					emailIndexRequest.onerror = () => {
						emailTransaction.abort();
						callback(null);
					};
				} else {
					emailTransaction.abort();
					callback(null);
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
								preexistingPhoneRow.notes = mergeArray(preexistingPhoneRow.notes, data.notes);
							}
							if (data.type !== undefined) {
								preexistingPhoneRow.type = data.type;
							}
							const putRequest = oStorePhone.put(preexistingPhoneRow);
							putRequest.onsuccess = () => {
								phoneTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								phoneTransaction.abort();
								callback(null);
							};
						} else {
							// the phone does not exist already
							const phoneCountRequest = oStorePhone.count();
							phoneCountRequest.onsuccess = () => {
								const phoneCount = phoneCountRequest.result;
								data.row = phoneCount + 1;
								const addRequest = oStorePhone.add(data);
								addRequest.onsuccess = () => {
									phoneTransaction.commit();
									callback(addRequest.result as number);
								};
								addRequest.onerror = () => {
									phoneTransaction.abort();
									callback(null);
								};
							};
							phoneCountRequest.onerror = () => {
								phoneTransaction.abort();
								callback(null);
							};
						}
					};
					phoneIndexRequest.onerror = () => {
						phoneTransaction.abort();
						callback(null);
					};
				} else {
					phoneTransaction.abort();
					callback(null);
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
							const preexistingAddressRow = addressIndexRequest.result as AddressType;
							if (data.notes !== undefined) {
								preexistingAddressRow.notes = mergeArray(preexistingAddressRow.notes, data.notes);
							}
							if (data.country !== undefined) {
								preexistingAddressRow.country = data.country;
							}
							if (data.type !== undefined) {
								preexistingAddressRow.type = data.type;
							}
							const putRequest = oStoreAddresses.put(preexistingAddressRow);
							putRequest.onsuccess = () => {
								addressesTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								addressesTransaction.abort();
								callback(null);
							};
						} else {
							// address does not exist already
							const addressesCountRequest = oStoreAddresses.count();
							addressesCountRequest.onsuccess = () => {
								const addressCount = addressesCountRequest.result;
								data.row = addressCount + 1;
								const addRequest = oStoreAddresses.add(data);

								addRequest.onsuccess = () => {
									addressesTransaction.commit();
									callback(addRequest.result as number);
								};

								addRequest.onerror = () => {
									addressesTransaction.abort();
									callback(null);
								};
							};
							addressesCountRequest.onerror = () => {
								addressesTransaction.abort();
								callback(null);
							};
						}
					};

					addressIndexRequest.onerror = () => {
						addressesTransaction.abort();
						callback(null);
					};
				} else {
					addressesTransaction.abort();
					callback(null);
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
								preexistingBankRow.notes = mergeArray(preexistingBankRow.notes, data.notes);
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
								bankTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								bankTransaction.abort();
								callback(null);
							};
						} else {
							// the iban does not exist already
							const bankCountRequest = oStoreBank.count();
							bankCountRequest.onsuccess = () => {
								const bankCount = bankCountRequest.result;
								data.row = bankCount + 1;
								const addRequest = oStoreBank.add(data);
								addRequest.onsuccess = () => {
									bankTransaction.commit();
									callback(addRequest.result as number);
								};
								addRequest.onerror = () => {
									bankTransaction.abort();
									callback(null);
								};
							};
							bankCountRequest.onerror = () => {
								bankTransaction.abort();
								callback(null);
							};
						}
					};
					bankIndexRequest.onerror = () => {
						bankTransaction.abort();
						callback(null);
					};
				} else {
					bankTransaction.abort();
					callback(null);
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
								preexistingCompanyRow.notes = mergeArray(preexistingCompanyRow.notes, data.notes);
							}
							if (data.alias !== undefined) {
								preexistingCompanyRow.alias = mergeArray(preexistingCompanyRow.notes, data.alias);
							}

							if (data.taxID !== undefined) {
								preexistingCompanyRow.taxID = data.taxID;
							}

							if (data.taxNumber !== undefined) {
								preexistingCompanyRow.taxNumber = data.taxNumber;
							}

							const putRequest = oStoreCompany.put(preexistingCompanyRow);
							putRequest.onsuccess = () => {
								companyTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								companyTransaction.abort();
								callback(null);
							};
						} else {
							// the iban does not exist already
							const companyCountRequest = oStoreCompany.count();
							companyCountRequest.onsuccess = () => {
								const companyCount = companyCountRequest.result;
								data.row = companyCount + 1;
								const addRequest = oStoreCompany.add(data);
								addRequest.onsuccess = () => {
									companyTransaction.commit();
									callback(addRequest.result as number);
								};
								addRequest.onerror = () => {
									companyTransaction.abort();
									callback(null);
								};
							};
							companyCountRequest.onerror = () => {
								companyTransaction.abort();
								callback(null);
							};
						}
					};
					companyIndexRequest.onerror = () => {
						companyTransaction.abort();
						callback(null);
					};
				} else {
					companyTransaction.abort();
					callback(null);
				}
			} else {
				callback(null);
			}
		}

		function insertPerson(data: PersonType, callback: (result: number | null) => void): void {
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
						callback(addRequest.result as number);
					};

					addRequest.onerror = () => {
						personsTransaction.abort();
						callback(null);
					};
				};
				personsCountRequest.onerror = () => {
					personsTransaction.abort();
					callback(null);
				};
			} else {
				callback(null);
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
								preexistingCustomer.notes = mergeArray(preexistingCustomer.notes, data.notes);
							}
							if (data.altIDs !== undefined) {
								preexistingCustomer.altIDs = mergeArray(preexistingCustomer.altIDs, data.altIDs);
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
								customerTransaction.commit();
								callback(putRequest.result as number);
							};
							putRequest.onerror = () => {
								customerTransaction.abort();
								callback(null);
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
									customerTransaction.commit();
									callback(addRequest.result as number);
								};
								addRequest.onerror = () => {
									// revert any changes
									customerTransaction.abort();
									callback(null);
								};
							};
						}
					};
					customersIndexRequest.onerror = () => {
						// revert any changes
						customerTransaction.abort();
						callback(null);
					};
				}
			} else {
				callback(null);
			}
		}

		// this is the finalizing function, once it is done the will be no more
		function insertCustomers(customer: PreInsertCustomer) {
			parseCustomer([customer], (result: Customer[] | null) => {
				// console.log('parseCustomerCallback');
				if (result !== null) {
					// the will be only one entry in result
					for (let i = 0; i < result.length; i++) {
						insertCustomer(result[i], (rowNumber: number | null) => {
							if (rowNumber !== null) {
								doneCallback(rowNumber);
							} else {
								doneCallback(null);
								// console.error('failed to insert');
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
				set(target: typeof counter, prop: 'count' | 'total', value: number) {
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
				if (data[i].emails !== undefined) {
					emailHolder.set(data[i], data[i].emails);
				} else {
					emailHolder.set(data[i], []);
				}
				if (data[i].phones !== undefined) {
					phoneHolder.set(data[i], data[i].phones);
				} else {
					phoneHolder.set(data[i], []);
				}
				const refPerson = data[i] as PersonType;
				refPerson.emails = undefined;
				refPerson.phones = undefined;
				reffedPersons[i] = refPerson;

				if (emailHolder.has(data[i]) && emailHolder.get(data[i]) !== undefined) {
					const emailArray = emailHolder.get(data[i]) as EmailType[];
					for (let j = 0; j < emailArray.length; j++) {
						tracker.total += 1;
						insertEmail(emailHolder.get(data[i])[j], (result: number | null) => {
							if (result !== null) {
								reffedPersons[i].emails = updateArrayBuffer(reffedPersons[i].emails, result);
							}
							tracker.count += 1;
						});
					}
				}

				if (phoneHolder.has(data[i]) && phoneHolder.get(data[i]) !== undefined) {
					const phoneArray = phoneHolder.get(data[i]) as PhoneNumberType[];
					for (let j = 0; j < phoneArray.length; j++) {
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
				set(target: typeof counter, prop: 'count' | 'total', value: number) {
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
				set(target: typeof counter, prop: 'count' | 'total', value: number) {
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
				set(target: typeof counter, prop: 'count' | 'total', value: number) {
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
				set(target: typeof counter, prop: 'count' | 'total', value: number) {
					target[prop] = value;
					if (prop === 'count') {
						if (target['count'] === target['total']) {
							counter.count = 0;
							counter.count = 0;
							phoneHolder = new WeakMap();
							emailHolder = new WeakMap();
							callback(reffedCustomers);
						}
					}
					return true;
				},
			};
			const tracker = new Proxy<typeof counter>(counter, counterHandler);

			for (let i = 0; i < data.length; i++) {
				if (data[i] !== undefined) {
					if (data[i].emails === undefined) {
						emailHolder.set(data[i], []);
					} else {
						emailHolder.set(data[i], data[i].emails);
					}
					if (data[i].phones === undefined) {
						phoneHolder.set(data[i], []);
					} else {
						phoneHolder.set(data[i], data[i].phones);
					}
					const refCustomer = data[i] as Customer;
					refCustomer.emails = undefined;
					refCustomer.phones = undefined;
					reffedCustomers[i] = refCustomer;

					if (Array.isArray(emailHolder.get(data[i])) && emailHolder.get(data[i]).length !== 0) {
						for (let j = 0; j < emailHolder.get(data[i]).length; j++) {
							tracker.total += 1;
							insertEmail(emailHolder.get(data[i])[j], (result: number | null) => {
								if (result !== null) {
									reffedCustomers[i].emails = updateArrayBuffer(reffedCustomers[i].emails, result);
								}
								tracker.count += 1;
							});
						}
					} else {
						tracker.total += 1;
					}

					if (Array.isArray(phoneHolder.get(data[i])) && phoneHolder.get(data[i]).length !== 0) {
						for (let j = 0; j < phoneHolder.get(data[i]).length; j++) {
							tracker.total += 1;
							insertPhone(phoneHolder.get(data[i])[j], (result: number | null) => {
								if (result !== null) {
									reffedCustomers[i].phones = updateArrayBuffer(reffedCustomers[i].phones, result);
								}
								tracker.count += 1;
							});
						}
					} else {
						tracker.total += 1;
					}

					if (!Array.isArray(phoneHolder.get(data[i])) || emailHolder.get(data[i]).length === 0) {
						tracker.count += 1;
					}
					if (!Array.isArray(emailHolder.get(data[i])) || emailHolder.get(data[i]).length === 0) {
						tracker.count += 1;
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
							// this also means that key is "persons", since "customers" is handled separately
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
									out.notes = row[nestedValue['notes']].split(',').map((item) => trimWhiteSpace(item));
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
											nestedValue.notes !== undefined ? row[nestedValue.notes].split(',').map((note) => trimWhiteSpace(note)) : undefined,
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
											nestedValue.notes !== undefined ? row[nestedValue.notes].split(',').map((note) => trimWhiteSpace(note)) : undefined,
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
					insertPerson(result[i], (result: null | number) => {
						if (result !== null) {
							customer.persons = updateArrayBuffer(customer.persons, result);
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
		doneCallback(null);
		// throw new Error('opening customerDB was block');
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

function sortData(
	dataBaseName: string,
	dbVersion: number,
	targetDBName: DataBaseNames,
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
			const update = updateManager('sort', dataCount);
			const cursorRequest = dataUpload.openCursor(null, 'next');
			type PromiseCounterType = {
				promises: Promise<number | null>[];
				add: null | Promise<number | null>;
				total: number;
			};
			const promiseCounter: PromiseCounterType = {
				promises: [],
				add: null,
				total: dataCount,
			};
			const proxyHandler = {
				set(target: PromiseCounterType, prop: keyof PromiseCounterType, value: Promise<number | null> | number) {
					if (prop === 'add') {
						if (typeof value !== 'number') {
							target['promises'].push(value);
							// console.log(target['promises'].length / target['total']);
							if (target['promises'].length === target['total']) {
								postMessage({
									type: 'sort-progress',
									data: 'processing...',
								});

								Promise.all(target['promises']).then((results) => {
									if (results.includes(null)) {
										console.error('not all items imported');
									}
									postMessage({
										type: 'sort-done',
										data: targetDBName,
									});
								});
								postMessage({
									type: 'sort-progress',
									data: 'processing...',
								});
							}
						}
					}
					return true;
				},
			};
			const proxy = new Proxy<typeof promiseCounter>(promiseCounter, proxyHandler);

			cursorRequest.onsuccess = function sortDataCursorSuccess() {
				const cursor: IDBCursorWithValue | null = cursorRequest.result;
				const canContinue = new WeakMap();
				if (cursor) {
					canContinue.set(cursor.value, false);
					// adding the data to a completely different indexedDB, so is ok to call a function, that is not in scope of the source db
					switch (targetDBName) {
						case 'article_db':
							parseArticleData('article_db', dbVersion, sortingMap as ArticleSortingMap, cursor.value);
							break;
						case 'customer_db':
							// console.log('starting with: ', cursor.value.row);
							proxy.add = new Promise<number | null>((resolve) => {
								parseCustomerData('customer_db', dbVersion, sortingMap as CustomerSortingMap, cursor.value, (result) => {
									resolve(result);
								});
							});
							update();
							cursor.continue();
							break;
						case 'document_db':
							parseDocumentData('document_db', dbVersion, sortingMap as DocumentSortingMap, cursor.value);
							break;
						default:
							break;
					}
				} else {
					// don't return, because this will stop all running functions to abort
				}
			};

			cursorRequest.onerror = () => {
				throw new Error('opening customerDB failed');
			};
		};

		dataUploadCountRequest.onerror = () => {
			postMessage({
				type: 'error',
				data: 'doCustomers: failed to count',
			});
		};

		dbTransaction.oncomplete = () => {
			// postMessage({
			// 	type: 'success',
			// 	data: 'customer_db',
			// });
		};
	};
}

function upgradeCustomerDB(e: IDBVersionChangeEvent): void {
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
		company.createIndex('company-vatID', 'vatID', {
			unique: false,
		});
	}
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
			const view = new DataView(buf);
			const byteLength = view.byteLength;
			for (let i = byteLength - 2; i > 0; i -= 2) {
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
				buf.resize(byteLength + 2);
				const viewer = new DataView(buf);
				viewer.setUint16(byteLength, value);

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

function mergeArray(base: string[] | undefined, addition: string[] | string): string[] {
	if (!Array.isArray(addition)) {
		addition = (addition as string).split(',');
	}
	if (base !== undefined) {
		addition = addition.filter((val) => !base.includes(val));
		if (addition.length !== 0) {
			return [...base, ...addition];
		} else {
			return base;
		}
	} else {
		return addition;
	}
}

function createArrayBuffer(numbers: number[]): ArrayBuffer {
	// @ts-expect-error no ts implementation (or at least I wasn't able find the correct way)
	const buffer = new ArrayBuffer(numbers.length * 2, { maxByteLength: 128 });
	const view = new DataView(buffer);
	for (let i = 0; i < numbers.length * 2; i += 2) {
		view.setInt16(i, numbers[i / 2]);
	}
	return buffer;
}
