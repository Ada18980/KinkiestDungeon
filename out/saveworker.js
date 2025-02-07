// eslint-disable-next-line strict
importScripts('../Scripts/lib/LZString.js');

onmessage = (e) => {
	console.log("Compressing save in worker thread...");
	postMessage(LZString.compressToBase64(e.data));
};