export type CompressionTypes = 'br' | 'zz' | 'gz';
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
	type: 'init' | 'finish' | 'stream';
	fileName: string;
	compression?: CompressionTypes;
	data?: Uint8Array;
};

export type ExportFileStreamer = {
	filePath: string;
	fileName: string;
	stream: TextDecoderStream;
	writer: WritableStreamDefaultWriter<BufferSource>;
	reader: ReadableStreamDefaultReader<string>;
	compression?: CompressionTypes;
};
