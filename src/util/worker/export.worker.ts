import type { ExportWorkerRequest, CompressionTypes, TableRow } from '@typings';

self.onmessage = (event: MessageEvent) => {
	const eventData = event.data as ExportWorkerRequest;
	switch (eventData.type) {
		case 'oStore':
			if (eventData.oStoreName !== undefined) {
				exportOStore(eventData.dataBaseName, eventData.dbVersion, eventData.oStoreName, eventData.format, false, () => {});
			}
			break;
		case 'db':
			exportIDBDatabase(eventData.dataBaseName, eventData.dbVersion, eventData.format);
			break;
		case 'all':
			break;
	}
};

function exportIDBDatabase(dataBaseName: string, dbVersion: number, format: 'json' | 'csv', compression?: CompressionTypes) {
	if (format === 'json') {
		let channel = new BroadcastChannel('file-callbacks');
		const today = new Date();
		let fileName = dataBaseName + '.' + today.getFullYear() + '.' + today.getMonth() + '.' + today.getDate() + '.' + format;
		// create the combined file
		postMessage({ type: 'create', data: fileName, scope: 'db' });
		channel.onmessage = (e) => {
			// wait for the signal, that a file Handle is active
			if (e.data.name === fileName && format === 'json' && e.data.type === 'create' && e.data.scope === 'db') {
				// write the primer for the oStores
				postMessage({ type: 'data', data: new TextEncoder().encode(`{"${dataBaseName}":{`) });
				// loop the oStores
				startExporting(fileName);
			}
		};
	}
	if (format == 'csv') {
		// there can't be a combined file, so exporting each oStore separately will do
		startExporting(undefined);
	}
	// export every oStore in a db
	function startExporting(fileName: string | undefined) {
		// open the db
		const dbRequest = indexedDB.open(dataBaseName, dbVersion);
		dbRequest.onsuccess = () => {
			const db = dbRequest.result;
			const objectStores = db.objectStoreNames;

			// create a generator, which stops and waits for every oStore to receive the callback
			function* iterStores(stores: string[]) {
				let index: number = 0;
				for (index; index < stores.length; index++) {
					if (format === 'json') {
						// yield a promise, which resolves, once the oStore has finished exporting
						yield new Promise<string>((resolve) => {
							// since writing to a combined json file make sure isChild=true
							exportOStore(dataBaseName, dbVersion, stores[index], 'json', true, () => {
								resolve(stores[index]);
							});
						});
					}

					if (format === 'csv') {
						// yield a promise, which resolves, once the oStore has finished exporting
						yield new Promise<string>((resolve) => {
							// csv file, so isChild=false
							exportOStore(dataBaseName, dbVersion, stores[index], 'csv', false, () => {
								resolve(stores[index]);
							});
						});
					}
				}
			}
			// call the generator
			const iter = iterStores(Array.from(objectStores));

			// call next on the iterator, once the promise resolves, therefore exporting the next oStore
			function callIter(iter: Generator<Promise<string>, void, unknown>) {
				let value = iter.next();
				if (!value.done) {
					Promise.resolve(value.value).then(() => {
						callIter(iter);
					});
				} else {
					if (format === 'json' && fileName !== undefined) {
						// if this is a combined file close the "${databaseName}" and the json bracket
						postMessage({ type: 'data', data: new TextEncoder().encode('}}') });
						// close the file
						postMessage({ type: 'close', data: fileName, scope: 'db' });
						// csv files get closed before reaching this point
					}
				}
			}

			// let everything run
			callIter(iter);
		};
	}
}

function exportOStore(
	dataBaseName: string,
	dbVersion: number,
	oStoreName: string,
	format: 'json' | 'csv',
	isChild: boolean,
	callback: () => void,
	compression?: CompressionTypes
) {
	let fuse = new WeakMap();
	let channel = new BroadcastChannel('file-callbacks');
	// create file name
	const today = new Date();
	let fileName = dataBaseName + '.' + oStoreName + '.' + today.getFullYear() + '.' + today.getMonth() + '.' + today.getDate() + '.' + format;
	if (compression !== undefined) {
		fileName = fileName + '.' + compression;
	}
	if (!isChild) {
		// we are not part of a database to json export
		// send a request to create a file
		postMessage({ type: 'create', data: fileName, scope: 'oStore' });

		channel.onmessage = (e) => {
			if (e.data.name === fileName && e.data.scope !== undefined && e.data.scope === 'oStore' && e.data.type === 'create') {
				// once we got the confirmation compile the data
				compileData();
			}
		};
	} else {
		// we are part of a database to json export
		compileData();
	}

	function compileData() {
		// open the database
		const dataBaseRequest = indexedDB.open(dataBaseName, dbVersion);
		dataBaseRequest.onsuccess = () => {
			// create a encoder stream
			const encoder = new TextEncoderStream();
			const encoderWriter = encoder.writable.getWriter();
			const encoderReader = encoder.readable.getReader();
			// create a fuse fuse for determining if it is the fist call of the writeable stream
			fuse.set(encoder, true);
			let weak = new WeakMap();

			// create the writeStream
			const sourceStream = new WritableStream({
				write(chunk: TableRow) {
					// create the output string

					for (const [key, val] of Object.entries(chunk)) {
						// go through the chunk
						if (val instanceof ArrayBuffer) {
							// if it is an ArrayBuffer decode it to an Array of regular Numbers
							//@ts-expect-error will match because of data structure
							chunk[key] = turnArrayBufferIntoNumberArray(val);
						}
					}
					if (format === 'csv') {
						// csv formatted
						if (fuse.get(encoder) && !isChild) {
							// first write call and csv also can not be written to the save file
							weak.set(chunk, Object.keys(chunk).join(';') + '\n' + turnObjectToCSVRow(chunk));
							//indicate, that the fuse is used now
							fuse.set(encoder, false);
						} else {
							// write to out
							weak.set(chunk, turnObjectToCSVRow(chunk));
						}
					}
					if (format === 'json') {
						// json formatted
						if (fuse.get(encoder)) {
							// first write call
							if (isChild) {
								// we are writing to combined file
								weak.set(chunk, `"${oStoreName}":[` + JSON.stringify(chunk) + ',');
							} else {
								// we are exporting only this oStore
								weak.set(chunk, `{"${dataBaseName}":{"${oStoreName}":[` + JSON.stringify(chunk) + ',');
							}
							// indicate the fuse is used now
							fuse.set(encoder, false);
						} else {
							weak.set(chunk, JSON.stringify(chunk)+ ",");
						}
					}
					encoderWriter.write(weak.get(chunk));
				},
			});

			// get the writer
			const sourceWriter = sourceStream.getWriter();

			// read the stream recursively
			encoderReader.read().then(function postStream(value: ReadableStreamReadResult<Uint8Array>) {
				let ch = new BroadcastChannel('file-callbacks');
				if (value.value) {
					// if the value is defined
					// send the data to the front
					postMessage({ type: 'data', data: value.value });
					// then do read further
					encoderReader.read().then(postStream);
				} else {
					// the stream has ended
					if (format === 'json') {
						if (isChild) {
							// closing brackets for this OStore
							postMessage({ type: 'data', data: new TextEncoder().encode('],') });
							// end it with a callback
							return callback();
						} else {
							// closing brackets for the file
							postMessage({ type: 'data', data: new TextEncoder().encode(']}}') });
							//no  callback fall trough
						}
					}
					if (!isChild) {
						// send the signal to close the file, wait for callback on channel
						postMessage({ type: 'close', data: fileName, scope: 'oStore' });
					}
				}
				ch.onmessage = (e) => {
					// get confirmation that the file has been closed
					if (e.data.type === 'close' && e.data.scope === 'oStore') {
						// callback

						callback();
					}
				};
			});

			// start the IDB transaction
			const db: IDBDatabase = dataBaseRequest.result;
			const transaction = db.transaction(oStoreName, 'readonly', { durability: 'strict' });
			const oStore = transaction.objectStore(oStoreName);
			const cursorRequest = oStore.openCursor(null, 'next');
			cursorRequest.onsuccess = () => {
				const cursor: IDBCursorWithValue | null = cursorRequest.result;
				if (cursor) {
					// write to the stream
					sourceWriter.write(cursor.value);
					cursor.continue();
				}else{
					encoderWriter.close();
					sourceWriter.close();
				}
			};
			cursorRequest.onerror = () => {};
		};
		dataBaseRequest.onblocked = () => {};
		dataBaseRequest.onerror = () => {};
		dataBaseRequest.onupgradeneeded = () => {};
	}
}

function turnArrayBufferIntoNumberArray(input: ArrayBuffer): number[] {
	const output: number[] = [];
	const view = new DataView(input);
	const byteLength = view.byteLength;
	for (let i = 0; i < byteLength; i += 2) {
		output.push(view.getUint16(i));
	}
	return output;
}

function turnObjectToCSVRow(input: TableRow): string {
	let out = '';
	const keys: string[] = Object.keys(input);
	for (let i = 0; i < keys.length; i++) {
		let value = input[keys[i]];
		if (value === undefined) {
			out += '';
		} else {
			out += value;
		}
		if (i !== keys.length - 1) {
			out += ';';
		} else {
			out += '\n';
		}
	}
	return out;
}
