import type { ExportWorkerRequest, CompressionTypes, TableRow } from '../types/types';

self.onmessage = (event: MessageEvent) => {
	const eventData = event.data as ExportWorkerRequest;
	console.log(eventData);
	switch (eventData.type) {
		case 'oStore':
			if (eventData.oStoreName !== undefined) {
				exportOStore(eventData.dataBaseName, eventData.dbVersion, eventData.oStoreName, eventData.format, event.ports[0] as MessagePort);
			}
			break;
		case 'db':
			break;
		case 'all':
			break;
	}
};

function exportOStore(
	dataBaseName: string,
	dbVersion: number,
	oStoreName: string,
	format: 'json' | 'csv',
	sender: MessagePort,
	compression?: CompressionTypes
) {
	const today = new Date();
	let fileName = dataBaseName + '.' + oStoreName + '.' + today.getFullYear() + '.' + today.getMonth() + '.' + today.getDate() + '.' + format;
	if (compression !== undefined) {
		fileName = fileName + '.' + compression;
	}
	sender.postMessage({ type: 'init', fileName: fileName, compression: compression });

	const dataBaseRequest = indexedDB.open(dataBaseName, dbVersion);
	dataBaseRequest.onsuccess = () => {
		const fuse: boolean = true;
		const encoder = new TextEncoderStream();
		const encoderWriter = encoder.writable.getWriter();
		const encoderReader = encoder.readable.getReader();

		const sourceStream = new WritableStream({
			write(chunk: TableRow) {
				let out: string = '';
				for (const [key, val] of Object.entries(chunk)) {
					if (val instanceof ArrayBuffer) {
						//@ts-expect-error will match because of data structure
						chunk[key] = turnArrayBufferIntoNumberArray(val);
					}
				}
				if (format === 'csv') {
					if (fuse) {
						out = Object.keys(chunk).join(';') + '\n';
					}
					out += turnObjectToCSVRow(chunk);
				}
				if (format === 'json') {
					out = JSON.stringify(chunk) + ',\n';
				}
				encoderWriter.write(out);
			},
		});
		function postStream(value: ReadableStreamReadResult<Uint8Array>) {
			sender.postMessage({ fileName: fileName, data: value.value, type: 'stream' });
			if (!value.done) {
				encoderReader.read().then(postStream);
			}
		}
		encoderReader.read().then(postStream);
		const sourceWriter = sourceStream.getWriter();

		const db: IDBDatabase = dataBaseRequest.result;
		const transaction = db.transaction(oStoreName, 'readonly', { durability: 'strict' });
		const oStore = transaction.objectStore(oStoreName);
		const cursorRequest = oStore.openCursor(null, 'next');
		cursorRequest.onsuccess = () => {
			const cursor: IDBCursorWithValue | null = cursorRequest.result;
			if (cursor) {
				sourceWriter.write(cursor.value);
				cursor.continue();
			} else {
				encoderWriter.close();
				sourceWriter.close();
				sender.postMessage({ type: 'finish', fileName: fileName });
			}
		};
		cursorRequest.onerror = () => {};
	};
	dataBaseRequest.onblocked = () => {};
	dataBaseRequest.onerror = () => {};
	dataBaseRequest.onupgradeneeded = () => {};
}

function turnArrayBufferIntoNumberArray(input: ArrayBuffer): number[] {
	const output: number[] = [];
	const view = new DataView(input);
	for (let i: number = 0; i < view.byteLength / 2 - 1; i++) {
		output.push(view.getUint16(i));
	}
	return output;
}

function turnObjectToCSVRow(input: TableRow): string {
	let out = '';
	const keys: string[] = Object.keys(input);
	for (let i = 0; i < keys.length; i++) {
		out += input[i];
		if (i !== keys.length - 1) {
			out += ';';
		} else {
			out += '\n';
		}
	}
	return out;
}
