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
			stream(eventData);
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

function fillReferences(
	dataBase: IDBDatabase,
	row: TableRow,
	actionType: TableWorkerRequestMessageActionType
): void {
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
		set(target: CounterType, prop: string, value: any) {
			if (prop !== 'count') return Reflect.set(target, prop, value);
			// every time we increase the counter we check if it was the last request
			if (value === targetCount) {
				// if we are on the last result finally send the back the response
				// this is a very neat way of handling things
				postStream(copy, actionType, row.row);
			}
			return Reflect.set(target, prop, value);
		},
	};

	const proxy = new Proxy(counter, handler);
	for (const [key, value] of Object.entries(row)) {
		if (value instanceof ArrayBuffer) {
			//in row $copy.row : $key is of type ArrayBuffer
			// increase $targetCunt by $increment
			let increment = new DataView(value).byteLength / 2;
			targetCount += increment;

			// replace the ArrayBuffer with an regular array in our copy
			copy[key] = new Array(increment);
			for (let i = 0; i < increment; i++) {
				let location = new DataView(value).getInt16(i);
				// the ArrayBuffer has stored $location at $i

				// query the object store $key at $location
				const transaction = dataBase.transaction(key, 'readonly');
				const oStore = transaction.objectStore(key);
				let only = IDBKeyRange.only(location);
				let request = oStore.get(only);
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
		postStream(copy, actionType, copy.row);
	}
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

function stream(eventData: TableWorkerRequestMessage) {
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
