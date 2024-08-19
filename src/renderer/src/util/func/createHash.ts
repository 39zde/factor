export async function createHash(data: ArrayBuffer): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-1', data);
	const view = new Uint8Array(hash);
	const out = Array.from(view)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return out;
}
