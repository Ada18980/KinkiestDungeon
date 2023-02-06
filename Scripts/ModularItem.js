"use strict";

/**
 * A lookup for the modular item configurations for each registered modular item
 * @const
 * @type {Record<string, ModularItemData>}
 * @see {@link ModularItemData}
 */
const ModularItemDataLookup = {};

/**
 * Merges all of the selected module options for a modular item into a single Property object to set on the item
 * @param {ModularItemData} data - The modular item's data
 * @param {number[]} moduleValues - The numeric values representing the current options for each module
 * @returns {ItemProperties} - A property object created from combining each module of the modular item
 */
function ModularItemMergeModuleValues({ asset, modules }, moduleValues) {
	return;
}