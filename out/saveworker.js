// eslint-disable-next-line strict
importScripts('../Scripts/lib/LZString.js');

async function compressGzip(input) {
	const encoder = new TextEncoder();
	const inputBytes = encoder.encode(input);

	const cs = new CompressionStream('gzip');
	const writer = cs.writable.getWriter();
	writer.write(inputBytes);
	writer.close();

	const chunks = [];
	const reader = cs.readable.getReader();
	while (true) {
		const {done, value} = await reader.read();
		if (done) break;
		chunks.push(value);
	}

	const totalLen = chunks.reduce((sum, c) => sum + c.length, 0);
	const compressed = new Uint8Array(totalLen);
	let offset = 0;
	for (const chunk of chunks) {
		compressed.set(chunk, offset);
		offset += chunk.length;
	}

	let binary = '';
	for (let i = 0; i < compressed.length; i++) {
		binary += String.fromCharCode(compressed[i]);
	}
	return 'gzip:' + btoa(binary);
}

onmessage = async (e) => {
	console.log("Compressing save in worker thread...");
	// Support both old format (string) and new format ({save, useGzip})
	const data = typeof e.data === 'string' ? e.data : e.data.save;
	const useGzip = typeof e.data === 'string' ? false : e.data.useGzip;

	if (useGzip && typeof CompressionStream !== 'undefined') {
		postMessage(await compressGzip(data));
	} else {
		postMessage(LZString.compressToBase64(data));
	}
	close();
};