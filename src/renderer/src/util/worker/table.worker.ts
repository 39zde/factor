self.onmessage = function requestHandler(e: MessageEvent) {
	switch (e.data.type) {
		case 'stream':
			const dbRequest = indexedDB.open('factor_db', e.data.dbVersion);
			dbRequest.onsuccess = () => {
				const streamDB = dbRequest.result;
				const transaction = streamDB.transaction(
					e.data.storeName,
					'readwrite'
				);
				const oStore = transaction.objectStore(e.data.storeName);
				const only = IDBKeyRange.only(e.data.action.pos);
				const req = oStore.get(only);
				req.onsuccess = () => {
					postMessage({
						type: 'stream',
						action: e.data.action.type,
						data: req.result,
						index: req.result['row'],
					});
					transaction.commit();
				};
			};
			break;
		case 'columns':
			getColumns('factor_db', e.data.dbVersion, e.data.storeName);
			break;
		case 'count':
			getCount('factor_db', e.data.dbVersion, e.data.storeName);
			break;
		case 'startingRows':
			startingRows(
				'factor_db',
				e.data.dbVersion,
				e.data.storeName,
				e.data.scope
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
		console.log(e);
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
	};
}
