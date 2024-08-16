// eslint-disable-next-line
self.navigator.locks.query().then((res) => {
	// console.log(res);
	if (res !== undefined) {
		if (res.held !== undefined && res.pending !== undefined) {
			if (res.pending.length === 0) {
				if (res.held.length === 0) {
					self.navigator.locks.request(
						'table.worker.ts',
						{ mode: 'exclusive', ifAvailable: true },
						(e) => {
							// console.log(e);
							self.onmessage = requestHandler;
							// console.log('acquired lock');
						}
					);
					// .then((e) => console.log(e));
				}
			}
		}
	}
});

function requestHandler(e: MessageEvent) {
	switch (e.data.type) {
		case 'retrieve':
			const tableName: string = e.data.tableName;
			const start: number = e.data.number;
			const scope: number = e.data.scope;
			break;
		default:
			break;
	}
}

function createStream() {
	async function start() {}

	async function pull() {}

	async function cancel() {}

	const streamFunctions = { start, pull, cancel };
	return new ReadableStream(streamFunctions);
}
