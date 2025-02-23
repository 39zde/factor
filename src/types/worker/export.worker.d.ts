export type CompressionTypes = 'deflate' | 'gzip';
export type ExportWorkerRequest = {
	type: 'db' | 'oStore' | 'all';
	dataBaseName: string;
	dbVersion: number;
	oStoreName?: string;
	format: 'json' | 'csv';
	compression: CompressionTypes | undefined;
	sender: MessagePort;
};

export type ExportWorkerResponse = {
	type: 'create' | 'data' | 'close';
	data: Uint8Array | string;
	scope?: 'db' | 'oStore' | 'all';
};

export type ExportFileStreamer = {
	filePath: string;
	fileName: string;
	stream: TextDecoderStream;
	writer: WritableStreamDefaultWriter<BufferSource>;
	reader: ReadableStreamDefaultReader<string>;
	compression?: CompressionTypes;
};
