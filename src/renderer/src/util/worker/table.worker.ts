import type {
	TableWorkerRequestMessage,
	TableRow,
	TableWorkerRequestMessageActionType,
	DerefRow,
} from '../types/types';

self.onmessage = function requestHandler(e: MessageEvent) {
	const eventData = e.data as TableWorkerRequestMessage;
	if (eventData.dataBaseName === undefined) {
		return;
	}
	switch (eventData.type) {
		case 'stream':
			const dbRequest = indexedDB.open(
				eventData.dataBaseName,
				eventData.dbVersion
			);
			dbRequest.onsuccess = () => {
				const streamDB = dbRequest.result;
				const transaction = streamDB.transaction(
					eventData.storeName,
					'readwrite'
				);
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
						let row = req.result as TableRow;
						let out = fillReferences(streamDB, row);
						postStream(out, eventData.action.type, eventData.action.pos);
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
			break;
		case 'columns':
			getColumns(
				eventData.dataBaseName,
				eventData.dbVersion,
				eventData.storeName
			);
			break;
		case 'count':
			getCount(
				eventData.dataBaseName,
				eventData.dbVersion,
				eventData.storeName
			);
			break;
		case 'startingRows':
			if (eventData.scope === undefined) {
				return postMessage({
					type: 'error',
					data: 'undefined action',
				});
			}
			startingRows(
				eventData.dataBaseName,
				eventData.dbVersion,
				eventData.storeName,
				eventData.scope
			);
			break;
		default:
			break;
	}
};

function startingRows(
	name: string,
	version: number,
	storeName: string,
	scope: number
) {
	let output: any[] = [];

	const dbRequest = indexedDB.open(name, version);

	dbRequest.onblocked = () => {
		console.log('blocked');
	};

	dbRequest.onerror = (e: any) => {
		postMessage({
			type: 'error',
			data: e,
		});
	};

	dbRequest.onupgradeneeded = () => {
		console.log('upgradeNeeded');
	};

	dbRequest.onsuccess = () => {
		let counter: number = 0;
		const db = dbRequest.result;
		let cursorRequest: IDBRequest<IDBCursorWithValue | null>;

		cursorRequest = db
			.transaction(storeName, 'readonly')
			.objectStore(storeName)
			.openCursor();

		cursorRequest.onsuccess = () => {
			const cursor: IDBCursorWithValue | null = cursorRequest.result;
			if (cursor) {
				// console.log(counter, scope);
				if (counter < scope) {
					// console.log(cursor.value);
					output.push(cursor.value);
					counter += 1;
					cursor.continue();
				} else {
					return postMessage({ type: 'startingRows', data: output });
				}
			}
			// if (!cursor) {
			// }
		};
		cursorRequest.onerror = (e) =>
			postMessage({
				type: 'error',
				data: e,
			});
	};
}

function getColumns(name: string, version: number, storeName: string) {
	const dbRequest = indexedDB.open(name, version);
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		if (!db.objectStoreNames.contains(storeName)) {
			throw new Error('unknown Object Store');
		}
		const objectStore = db
			.transaction(storeName, 'readonly')
			.objectStore(storeName);
		const cursorRequest = objectStore.openCursor(null);
		cursorRequest.onsuccess = () => {
			let cursor = cursorRequest.result ?? false;
			if (cursor) {
				// console.log("keys")
				// console.log(Object.keys(cursor.value))
				postMessage({ type: 'columns', data: Object.keys(cursor.value) });
				cursor = false;
			}
		};
		cursorRequest.onerror = (e) =>
			postMessage({
				type: 'error',
				data: e,
			});
	};
	dbRequest.onerror = (e) => {
		postMessage({
			type: 'error',
			data: e,
		});
	};
}

function getCount(name: string, version: number, storeName: string) {
	const dbRequest = indexedDB.open(name, version);
	dbRequest.onsuccess = () => {
		const db = dbRequest.result;
		if (!db.objectStoreNames.contains(storeName)) {
			throw new Error('unknown Object Store');
		}
		const countRequest = db
			.transaction(storeName, 'readonly')
			.objectStore(storeName)
			.count();

		countRequest.onsuccess = () => {
			postMessage({ type: 'count', data: countRequest.result });
		};

		countRequest.onerror = (e) => {
			postMessage({
				type: 'error',
				data: e,
			});
		};
	};

	dbRequest.onerror = (e) => {
		postMessage({
			type: 'error',
			data: e,
		});
	};
}

function fillReferences(dataBase: IDBDatabase, row: TableRow): DerefRow {
	function fillReference(
		dataBase: IDBDatabase,
		storeName: string,
		position: number,
		parent: any[],
		index: number
	) {
		const transaction = dataBase.transaction(storeName, 'readonly');
		const oStore = transaction.objectStore(storeName);
		const request = oStore.get(position);
		request.onsuccess = () => {
			parent[index] = request.result;
			transaction.commit();
		};
	}

	const copy = structuredClone(row);
	for (const [key, value] of Object.entries(row)) {
		if (value instanceof ArrayBuffer) {
			copy[key] = new Array(value.byteLength / 2);
			for (let i = 0; i < value.byteLength / 2; i++) {
				fillReference(
					dataBase,
					key,
					new DataView(value).getUint16(i),
					copy[key],
					i
				);
			}
		}
	}

	return copy as DerefRow;
}

function postStream(
	oStoreItem: DerefRow,
	actionType: TableWorkerRequestMessageActionType,
	position: number
): void {
	if (
		Object.keys(oStoreItem).includes('row') &&
		typeof oStoreItem.row === 'number'
	) {
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
