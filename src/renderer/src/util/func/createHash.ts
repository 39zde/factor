export async function createHash(data: ArrayBuffer): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-1', data);
	const view = new Uint8Array(hash);
	const out = Array.from(view)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return out;
}

export async function getHash(data: string): Promise<string> {
	const encoder = new TextEncoder();
	const view = encoder.encode(data);
	return await createHash(view.buffer);
}

export async function getAddressHash(street: string | undefined, zip: string | undefined, city: string | undefined) {
	// get clean Strings
	const cStreet = street === undefined ? '' : street.replaceAll(/[\s]/gm, '');
	const cZip = zip === undefined ? '' : zip.replaceAll(/[\s]/gm, '');
	const cCity = city === undefined ? '' : city.replaceAll(/[\s]/gm, '');

	const bundle = [cStreet.toLowerCase(), cZip.toLowerCase(), cCity.toLowerCase()];
	return await getHash(bundle.join(''));
}
