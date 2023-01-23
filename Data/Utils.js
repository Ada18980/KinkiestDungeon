"use strict";

/**
 * Returns a map from a list
 * @template {Namable} N
 * @param {N[]} Named
 */
function ToNamedMap(Named) {
	/**
	 * @type {Record<string, N>}
	 */
	let list = {};
	for (let n of Named) {
		list[n.Name] = n;
	}
	return list;
}

/**
 * @param {string[]} Array
 * @param {string[]} [Extra]
 */
function ToMap(Array, ...Extra) {
	if (Extra) {
		Array = [...Array, ...Extra];
	}
	/**
	 * @type {Record<string, boolean>}
	 */
	let list = {};
	for (let n of Array) {
		list[n] = true;
	}
	return list;
}

/**
 * @param {string[]} Array
 * @param {string[]} Subtract
 */
function ToMapSubtract(Array, Subtract) {
	/**
	 * @type {Record<string, boolean>}
	 */
	let list = {};
	for (let n of Array) {
		list[n] = true;
	}
	// O(n) instead of O(n^2) to check while creating the first array
	for (let n of Subtract) {
		delete list[n];
	}
	return list;
}

/**
 * @param {string[]} Array
 * @param {string} Default
 */
function ToMapDefault(Array, Default = "") {
	/**
	 * @type {Record<string, Default>}
	 */
	let list = {};
	for (let n of Array) {
		list[n] = Default;
	}
	return list;
}