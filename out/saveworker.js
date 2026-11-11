// eslint-disable-next-line strict
importScripts('../Scripts/lib/LZString.js');

try {
	// Backup gzip implementation for browsers without CompressionStream.
	importScripts('../Scripts/lib/fflate.js');
} catch (err) {
	console.log (`Couldn't load fflate: ${err}`);
}

/** Base64-encode bytes; chunked so large saves don't overflow String.fromCharCode's argument limit. */
function bytesToBase64 (bytes) {
	let bin = "";
	const chunk = 0x8000;
	for (let i = 0; i < bytes.length; i += chunk) {
		bin += String.fromCharCode.apply (null, bytes.subarray (i, i + chunk));
	}
	return btoa (bin);
}

/** same output format as compressNative. */
function compressFflate (data, mime_type) {
	if (typeof fflate == 'undefined') throw new Error ("fflate not available");
	const save_z = fflate.gzipSync (fflate.strToU8 (data));
	return `data:${mime_type};base64,${bytesToBase64 (save_z)}`;
}


// Included for reference.
//enum SaveType {
//	Game     = 'game',
//	Outfit   = 'outfit',
//	Wardrobe = 'wardrobe',	// Complete outfit collection; TBD
//}
//
//interface SaveWorkerMsg {
//	op:	'cmp' | 'err';
//	type:	SaveType;
//	data:	string;
//}

onmessage = async (ev) => {
	const msg = ev?.data;
	if (!msg  ||  !msg.op  ||  !msg.type  ||  !msg.data) {
		if (!msg) {
			console.log ("Missing worker MessageEvent payload.");
		} else {
			console.log (`Missing worker message field(s); only got ${msg}`);
		}
		postMessage ({ op: 'err', data: '' });
		return;
	}

	if (msg.op != "cmp"  &&  msg.op != "cmp-legacy") {
		postMessage ({ op: 'err', data: '' });
		return;
	}

	console.log ("Compressing save in worker thread...");
	const mime_type = `application/vnd.straightlaced.kinkydungeon.save.${msg.type}+gzip;version=2`;
	try {
		/*
		 * FIXME: Temporary.  Delete when all compression call sites updated.
		 */
		if (msg.op === 'cmp-legacy') {
			throw new Error ("Legacy compression requested");
		}
		// Blob.  CompressionStream discards MIME-type; we'll add it later.
		const save_b_js = new Blob ([msg.data]);
		const save_pipe = save_b_js.stream().pipeThrough (new CompressionStream ('gzip'));

		// Compressed blob.
		const resp = new Response (save_pipe, { headers: [["Content-Type", mime_type ]]});
		const save_b_z = await resp.blob();

		// Snarfed from MDN Web docs.
		async function toBase64DataURL (blob) {
			return await new Promise ((resolve, reject) => {
				const reader = Object.assign (new FileReader(), {
					onload:  () => resolve (reader.result),
					onerror: () => reject (reader.error)
				});
				reader.readAsDataURL (blob);
			});
		}

		const save_z64 = await toBase64DataURL (save_b_z);

		msg.data = save_z64;
	} catch (err) {
		try {
			console.log (`Caught ${err}; falling back to fflate...`);
			msg.data = compressFflate (msg.data, mime_type);
		} catch (err) {
			console.log (`Caught ${err}; falling back to LZString...`);
			msg.data = LZString.compressToBase64 (msg.data);
		}
	}
	postMessage (msg);
	// Is this necessary?
	close();
};