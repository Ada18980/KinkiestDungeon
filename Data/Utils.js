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
 */
function ToMap(Array) {
	/**
	 * @type {Record<string, boolean>}
	 */
	let list = {};
	for (let n of Array) {
		list[n] = true;
	}
	return list;
}