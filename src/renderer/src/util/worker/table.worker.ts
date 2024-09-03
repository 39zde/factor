import type { TableWorkerRequestMessage, TableRow, TableWorkerRequestMessageActionType, DerefRow, DoneHandler, StarterPackage } from '../types/types';

self.onmessage = function requestHandler(e: MessageEvent) {
	const eventData = e.data as TableWorkerRequestMessage;
	if (eventData.dataBaseName === undefined) {
		return;
	}
	switch (eventData.type) {
		case 'stream':
			stream(eventData);
			break;
		case 'startingPackage':
			if (eventData.scope === undefined) {
				return postMessage({
					type: 'error',
					data: 'undefined action',
				});
			}
			const starterPackage: StarterPackage = {
				startingCount: undefined,
				startingColumns: undefined,
				starterRows: undefined,
			};
			const starterHandler = {
				set(target: StarterPackage, prop: keyof StarterPackage, value: number | string[] | DerefRow[]) {
					let undefinedCount = 0;
					// @ts-expect-error the values will match the prop
					target[prop] = value;
					for (const key of Object.keys(target)) {
						if (target[key] === undefined) {
							undefinedCount += 1;
						}
					}
					if (undefinedCount === 0) {
						postMessage({
							type: 'startingPackage',
							data: target,
						});
					} else {
						undefinedCount = 0;
					}
					return true;
				},
			};
			const proxy = new Proxy(starterPackage, starterHandler);
			getCount(eventData.dataBaseName, eventData.dbVersion, eventData.storeName, (count: number | undefined) => {
				if (count !== undefined) {
					proxy.startingCount = count;
				}
			});
			getColumns(eventData.dataBaseName, eventData.dbVersion, eventData.storeName, (cols: string[] | undefined) => {
				if (cols !== undefined) {
					proxy.startingColumns = cols;
				}
			});
			getStartingRows(eventData.dataBaseName, eventData.dbVersion, eventData.storeName, eventData.scope, (rows: DerefRow[] | undefined) => {
				if (rows !== undefined) {
					proxy.starterRows = rows;
				}
			});

			break;
		case 'columns':
			getColumns(eventData.dataBaseName, eventData.dbVersion, eventData.storeName);
			break;
		case 'count':
			getCount(eventData.dataBaseName, eventData.dbVersion, eventData.storeName);
			break;
		case 'startingRows':
			if (eventData.scope === undefined) {
				return postMessage({
					type: 'error',
					data: 'undefined action',
				});
			}
			getStartingRows(eventData.dataBaseName, eventData.dbVersion, eventData.storeName, eventData.scope);
			break;
		default:
			postMessage({ type: 'error', data: 'unknown request type' });
			break;
	}
};

function getStartingRows(
	dataBaseName: string,
	dbVersion: number,
	storeName: string,
	scope: number,
	callback?: (rows: DerefRow[] | undefined) => void | undefined
) {
	const dbRequest = indexedDB.open(dataBaseName, dbVersion);

	dbRequest.onblocked = (e: Event) => {
		if (callback !== undefined) {
			callback(undefined);
		} else {
			postMessage({
				type: 'error',
				data: e,
			});
		}
	};

	dbRequest.onerror = (e: Event) => {
		if (callback !== undefined) {
			callback(undefined);
		} else {
			postMessage({
				type: 'error',
				data: e,
			});
		}
	};

	dbRequest.onupgradeneeded = () => {
		console.log('upgradeNeeded');
	};

	dbRequest.onsuccess = () => {
		let received: number = 0;
		let counter: number = 0;
		const done: DoneHandler = {
			data: [],
			add: { row: 0 },
		};

		const doneListener = {
			set(target: DoneHandler, prop: keyof DoneHandler, value: boolean | DerefRow) {
				if (prop === 'add' && typeof value === 'object') {
					const data = target['data'];
					data.push(value);
					Reflect.set(target, 'data', data);
					received += 1;
					if (received === scope) {
						if (callback !== undefined) {
							callback(data);
						} else {
							postMessage({ type: 'startingRows', data: target.data });
						}
					}
					return Reflect.set(target, prop, value);
				} else {
					return Reflect.set(target, prop, value);
				}
			},
		};

		const db = dbRequest.result;
		const transaction = db.transaction(storeName, 'readonly');
		const oStore = transaction.objectStore(storeName);
		const cursorRequest = oStore.openCursor(null, 'nextunique');
		const doneHandler = new Proxy(done, doneListener);
		cursorRequest.onsuccess = () => {
			const cursor: IDBCursorWithValue | null = cursorRequest.result;
			if (cursor) {
				if (counter < scope) {
					fillReferences(db, cursor.value, undefined, doneHandler);
					counter += 1;
					cursor.continue();
				}
			}
		};
	};
}

function getColumns(dataBaseName: string, dbVersion: number, storeName: string, callback?: (cols: string[] | undefined) => void) {
	const dbRequest = indexedDB.open(dataBaseName, dbVersion);
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		if (!db.objectStoreNames.contains(storeName)) {
			if (callback !== undefined) {
				callback(undefined);
			} else {
				postMessage({
					type: 'error',
					data: 'unknown Object Store',
				});
			}
		}
		const objectStore = db.transaction(storeName, 'readonly').objectStore(storeName);
		const cursorRequest = objectStore.openCursor(null);
		cursorRequest.onsuccess = () => {
			let cursor = cursorRequest.result ?? false;
			if (cursor) {
				// console.log("keys")
				// console.log(Object.keys(cursor.value))
				if (callback !== undefined) {
					callback(Object.keys(cursor.value));
				} else {
					postMessage({
						type: 'columns',
						data: Object.keys(cursor.value),
					});
				}
				cursor = false;
			}
		};

		cursorRequest.onerror = (e) => {
			if (callback !== undefined) {
				callback(undefined);
			} else {
				postMessage({
					type: 'error',
					data: e,
				});
			}
		};

		dbRequest.onerror = (e) => {
			if (callback !== undefined) {
				callback(undefined);
			} else {
				postMessage({
					type: 'error',
					data: e,
				});
			}
		};
	};
}
function getCount(dataBaseName: string, dbVersion: number, storeName: string, callback?: (count: number | undefined) => void) {
	const dbRequest = indexedDB.open(dataBaseName, dbVersion);
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		if (!db.objectStoreNames.contains(storeName)) {
			if (callback !== undefined) {
				callback(undefined);
			} else {
				postMessage({
					type: 'error',
					data: 'unknown Object Store',
				});
				throw new Error('unknown Object Store: ' + storeName);
			}
		}
		const countRequest = db.transaction(storeName, 'readonly').objectStore(storeName).count();

		countRequest.onsuccess = () => {
			if (callback !== undefined) {
				callback(countRequest.result);
			} else {
				postMessage({ type: 'count', data: countRequest.result });
			}
		};

		countRequest.onerror = (e) => {
			if (callback !== undefined) {
				callback(undefined);
			} else {
				postMessage({
					type: 'error',
					data: e,
				});
			}
		};
	};

	dbRequest.onerror = (e) => {
		if (callback !== undefined) {
			callback(undefined);
		} else {
			postMessage({
				type: 'error',
				data: e,
			});
		}
	};
}

function fillReferences(dataBase: IDBDatabase, row: TableRow, actionType?: TableWorkerRequestMessageActionType, doneHandler?: DoneHandler): void {
	const copy = structuredClone(row);
	let targetCount = 0;
	type CounterType = {
		count: number;
	};
	const counter: CounterType = {
		count: 0,
	};
	// this handler acts as a sort of event listener
	const handler = {
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/set#parameters
		set(target: CounterType, prop: string, value: number) {
			if (prop !== 'count') return Reflect.set(target, prop, value);
			// every time we increase the counter we check if it was the last request
			if (value === targetCount) {
				// if we are on the last result finally send the back the response
				// this is a very neat way of handling things
				if (actionType !== undefined) {
					postStream(copy, actionType, row.row);
				}

				if (doneHandler !== undefined) {
					doneHandler.add = copy;
				}
			}
			return Reflect.set(target, prop, value);
		},
	};

	const proxy = new Proxy(counter, handler);
	for (const [key, value] of Object.entries(row)) {
		if (value instanceof ArrayBuffer) {
			//in row $copy.row : $key is of type ArrayBuffer
			// increase $targetCunt by $increment
			const increment = new DataView(value).byteLength / 2;
			targetCount += increment;

			// replace the ArrayBuffer with an regular array in our copy
			copy[key] = new Array(increment);
			for (let i = 0; i < increment; i++) {
				const location = new DataView(value).getInt16(i);
				// the ArrayBuffer has stored $location at $i

				// query the object store $key at $location
				const transaction = dataBase.transaction(key, 'readonly');
				const oStore = transaction.objectStore(key);
				const only = IDBKeyRange.only(location);
				const request = oStore.get(only);
				request.onsuccess = () => {
					// insert the requested item into our copy
					copy[key][i] = request.result;
					// increase the counter
					proxy.count += 1;
				};
				request.onerror = () => {
					proxy.count += 1;
				};
			}
		}
	}
	if (targetCount === 0) {
		if (actionType !== undefined) {
			postStream(copy, actionType, copy.row);
		}
		if (doneHandler !== undefined) {
			doneHandler.add = copy;
		}
	}
}

function postStream(oStoreItem: DerefRow, actionType: TableWorkerRequestMessageActionType, position: number): void {
	if (Object.keys(oStoreItem).includes('row') && typeof oStoreItem.row === 'number') {
		// what if there is a row property
		postMessage({
			type: 'stream',
			action: actionType,
			data: oStoreItem,
			index: oStoreItem.row,
		});
	} else {
		// if there is now row prop take the one from the request add add  it
		oStoreItem.row = position;
		postMessage({
			type: 'stream',
			action: actionType,
			data: oStoreItem,
			index: position,
		});
	}
}

function stream(eventData: TableWorkerRequestMessage) {
	const dbRequest = indexedDB.open(eventData.dataBaseName, eventData.dbVersion);
	dbRequest.onsuccess = () => {
		const streamDB = dbRequest.result;
		const transaction = streamDB.transaction(eventData.storeName, 'readwrite');
		const oStore = transaction.objectStore(eventData.storeName);
		if (eventData.action === undefined) {
			return postMessage({
				type: 'error',
				data: 'undefined action',
			});
		}
		const only = IDBKeyRange.only(eventData.action.pos);
		const req = oStore.get(only);
		req.onsuccess = () => {
			if (eventData.action === undefined) {
				return postMessage({
					type: 'error',
					data: 'undefined action',
				});
			}
			if (req.result) {
				const row = req.result as TableRow;
				fillReferences(streamDB, row, eventData.action.type);
			}
		};
		req.onerror = (ev) => {
			if (eventData.action === undefined) {
				return postMessage({
					type: 'error',
					data: 'undefined action',
				});
			}
			postMessage({
				type: 'error',
				action: eventData.action.type,
				data: ev,
				index: eventData.action.pos,
			});
		};
	};
}
