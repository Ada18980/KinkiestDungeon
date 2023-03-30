/**
 * Returns a map from a list
 */
function ToNamedMap<N extends Namable>(Named: N[]): {[_: string]: N} {
	let list = {};
	for (let n of Named) {
		list[n.Name] = n;
	}
	return list;
}

function ToMap(Array: string[], ...Extra: string[]): {[_: string]: boolean} {
	if (Extra) {
		Array = [...Array, ...Extra];
	}
	let list: {[_: string]: boolean} = {};
	for (let n of Array) {
		list[n] = true;
	}
	return list;
}

function ToMapSubtract(Array: string[], Subtract: string[]): {[_: string]: boolean} {
	let list: {[_: string]: boolean} = {};
	for (let n of Array) {
		list[n] = true;
	}
	// O(n) instead of O(n^2) to check while creating the first array
	for (let n of Subtract) {
		delete list[n];
	}
	return list;
}

function ToMapDefault(Array: string[], Default: string = ""): {[_: string]: string} {
	let list: {[_: string]: string} = {};
	for (let n of Array) {
		list[n] = Default;
	}
	return list;
}