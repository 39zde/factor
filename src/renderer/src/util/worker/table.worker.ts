self.onmessage = function requestHandler(e: MessageEvent) {
	switch (e.data.type) {
		case 'steam':
			const dbRequest = indexedDB.open('factor_db', e.data.dbVersion);
			dbRequest.onsuccess = () => {
				const streamDB = dbRequest.result;
				let counterNext = 0;
				let counterPrev = 0;
				const transaction = streamDB.transaction(
					e.data.storeName,
					'readwrite'
				);
				const oStore = transaction.objectStore(e.data.storeName);
				switch (e.data.action.type) {
					case 'next':
						let lower = IDBKeyRange.lowerBound(e.data.action.pos, false);

						const cursorLowerRequest = oStore.openCursor(
							lower,
							'nextunique'
						);
						cursorLowerRequest.onsuccess = () => {
							let streamLowerCursor: IDBCursorWithValue | boolean =
								cursorLowerRequest.result ?? false;
							if (streamLowerCursor) {
								if (counterNext <= e.data.action.pos) {
									counterNext += 1;
									streamLowerCursor.continue();
								} else {
									postMessage({
										type: 'stream',
										action: 'next',
										data: streamLowerCursor.value,
										index: e.data.action.pos,
									});
									transaction.commit();
								}
							}
						};
						break;
					case 'prev':
						let upper = IDBKeyRange.lowerBound(e.data.action.pos, false);
						const cursorUpperRequest = oStore.openCursor(
							upper,
							'nextunique'
						);
						cursorUpperRequest.onsuccess = () => {
							let streamUpperCursor: IDBCursorWithValue | boolean =
								cursorUpperRequest.result ?? false;
							if (streamUpperCursor) {
								if (counterPrev < e.data.action.pos) {
									counterPrev += 1;
									streamUpperCursor.continue();
								} else {
									postMessage({
										type: 'stream',
										action: 'prev',
										data: streamUpperCursor.value,
										index: e.data.action.pos,
									});
									transaction.commit();
								}
							}
						};
						break;
				}
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
		let cursor: IDBCursorWithValue | false;
		let cursorRequest: IDBRequest<IDBCursorWithValue | null>;

		cursorRequest = db
			.transaction(storeName, 'readwrite', { durability: 'strict' })
			.objectStore(storeName)
			.openCursor();

		cursorRequest.onsuccess = () => {
			cursor = cursorRequest.result ?? false;
			if (cursor) {
				output.push(cursor.value);
				if (counter < scope) {
					counter += 1;
					cursor.continue();
				} else {
					cursor = false;
				}
			}
			if (!cursor) {
				postMessage({ type: 'startingRows', data: output });
			}
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
