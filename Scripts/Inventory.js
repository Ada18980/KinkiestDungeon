"use strict";

/**
* Add a new item by group & name to character inventory
* @param {Character} C - The character that gets the new item added to her inventory
* @param {string} NewItemName - The name of the new item to add
* @param {string} NewItemGroup - The group name of the new item to add
* @param {boolean} [Push=true] - Set to TRUE to push to the server
*/
function InventoryAdd(C, NewItemName, NewItemGroup, Push) {

}


/**
* Checks if the character has the inventory available
* @param {Character} C - The character on which we should remove the item
* @param {String} InventoryName - The name of the item to validate
* @param {String} InventoryGroup - The group name of the item to validate
*/
function InventoryAvailable(C, InventoryName, InventoryGroup) {

	return true;
}


/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * whose name matches one of the names in the provided list.
 * @param {Character} C - The character for whom to check equipped items
 * @param {String} ItemGroup - The name of the item group to check
 * @param {String[]} ItemList - A list of item names to check against
 * @returns {boolean} - TRUE if the character has an item from the item list equipped in the named slot, FALSE
 * otherwise
 */
function InventoryIsItemInList(C, ItemGroup, ItemList) {
	const Item = InventoryGet(C, ItemGroup);
	return Item && ItemList.includes(Item.Asset.Name);
}

/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in the provided group
 * which has the provided prerequisite.
 * @param {Character} C - The character whose items should be checked
 * @param {String} ItemGroup - The name of the item group to check
 * @param {String} Prerequisite - The name of the prerequisite to look for
 * @returns {boolean} - TRUE if the character has an item equipped in the named slot which has the named prerequisite,
 * FALSE otherwise
 */
function InventoryDoesItemHavePrerequisite(C, ItemGroup, Prerequisite) {
	const Item = InventoryGet(C, ItemGroup);
	return Item && Item.Asset.Prerequisite && Item.Asset.Prerequisite.includes(Prerequisite);
}


/**
 * Prerequisite utility function that returns TRUE if the given character has an item equipped in any of the named group
 * slots.
 * @param {Character} C - The character whose items should be checked
 * @param {String[]} GroupList - The list of groups to check for items in
 * @returns {boolean} - TRUE if the character has any item equipped in any of the named groups, FALSE otherwise.
 */
function InventoryHasItemInAnyGroup(C, GroupList) {
	return GroupList.some(GroupName => !!InventoryGet(C, GroupName));
}

/**
 * Check if there are any gags with prerequisites that block the new gag from being applied
 * @param {Character} C - The character on which we check for prerequisites
 * @param {Array} BlockingPrereqs - The prerequisites we check for on lower gags
 * @returns {String} - Returns the prerequisite message if the gag is blocked, or an empty string if not
 */
function InventoryPrerequisiteConflictingGags(C, BlockingPrereqs) {
	// Index of the gag we're trying to add (1-indexed)
	let GagIndex = 4; // By default, assume no gag slots are allowed to conflict
	if (C.FocusGroup && C.FocusGroup.Name.startsWith("ItemMouth")) {
		// If there's a focus group, calculate the gag index
		GagIndex = Number(C.FocusGroup.Name.replace("ItemMouth", "") || 1);
	}
	const MouthItems = [InventoryGet(C, "ItemMouth"), InventoryGet(C, "ItemMouth2"), InventoryGet(C, "ItemMouth3")];
	let MinBlockingIndex = 0;
	for (let i = 0; i < MouthItems.length && !MinBlockingIndex; i++) {
		// Find the lowest indexed slot in which there is a gag with a prerequisite that blocks the new gag
		let AssetPrerequisites = MouthItems[i] && MouthItems[i].Asset.Prerequisite;
		if (!Array.isArray(AssetPrerequisites)) {
			AssetPrerequisites = [AssetPrerequisites];
		}
		if (AssetPrerequisites.some((Prerequisite) => BlockingPrereqs.includes(Prerequisite))) {
			MinBlockingIndex = i + 1;
		}
	}
	// Not allowed to add the new gag if there is a blocking gag anywhere below it
	if (MinBlockingIndex && GagIndex > MinBlockingIndex) return "CannotBeUsedOverGag";
	else return "";
}

/**
 * Returns TRUE if we can add the item, no other items must block that prerequisite
 * @param {Character} C - The character on which we check for prerequisites
 * @param {Asset} asset - The asset for which prerequisites should be checked. Any item equipped in the asset's group
 * will be ignored for the purposes of the prerequisite check.
 * @param {string|string[]} [prerequisites=asset.Prerequisite] - An array of prerequisites or a string for a single
 * prerequisite. If nothing is provided, the asset's default prerequisites will be used
 * @param {boolean} [setDialog=true] - If TRUE, set the screen dialog message at the same time
 * @returns {boolean} - TRUE if the item can be added to the character
 */
function InventoryAllow(C, asset, prerequisites = asset.Prerequisite, setDialog = true) {
	return true;
}

/**
* Gets the current item / cloth worn a specific area (AssetGroup)
* @param {Character} C - The character on which we must check the appearance
* @param {String} AssetGroup - The name of the asset group to scan
* @returns {Item|null} - Returns the appearance which is the item / cloth asset, color and properties
*/
function InventoryGet(C, AssetGroup) {
	for (let A = 0; A < C.Appearance.length; A++)
		if ((C.Appearance[A].Asset != null) && (C.Appearance[A].Asset.Group.Family == C.AssetFamily) && (C.Appearance[A].Asset.Group.Name == AssetGroup))
			return C.Appearance[A];
	return null;
}


/**
* Makes the character wear an item on a body area
* @param {Character} C - The character that must wear the item
* @param {string} AssetName - The name of the asset to wear
* @param {string} AssetGroup - The name of the asset group to wear
* @param {string | string[]} [ItemColor] - The hex color of the item, can be undefined or "Default"
* @param {number} [Difficulty] - The difficulty, on top of the base asset difficulty, to assign to the item
* @param {number} [MemberNumber] - The member number of the character putting the item on - defaults to -1
* @param {Object} [Craft] - The crafting properties of the item
*/
function InventoryWear(C, AssetName, AssetGroup, ItemColor, Difficulty, MemberNumber, Craft) {

}


/**
* Removes a specific item from a character body area
* @param {Character} C - The character on which we must remove the item
* @param {String} AssetGroup - The name of the asset group (body area)
* @param {boolean} [Refresh] - Whether or not to trigger a character refresh. Defaults to false
*/
function InventoryRemove(C, AssetGroup, Refresh) {

}

/**
* Returns the padlock item that locks another item
* @param {Item} Item - The item from appearance that must be scanned
* @returns {Item} - A padlock item or NULL if none
*/
function InventoryGetLock(Item) {
	return null;
}



/**
* Returns TRUE if at least one item on the character can be locked
* @param {Character} C - The character to scan
* @returns {Boolean} - TRUE if at least one item can be locked
*/
function InventoryHasLockableItems(C) {
	return C.Appearance.some((item) => InventoryDoesItemAllowLock(item) && InventoryGetLock(item) == null);
}

/**
 * Determines whether an item in its current state permits locks.
 * @param {Item} item - The item to check
 * @returns {boolean} - TRUE if the asset's current type permits locks
 */
function InventoryDoesItemAllowLock(item) {
	return true;
}

/**
 * Applies a lock to an appearance item of a character
 * @param {Character} C - The character on which the lock must be applied
 * @param {Item|string} Item - The item from appearance to lock
 * @param {Item|string} Lock - The asset of the lock or the name of the lock asset
 * @param {number|string} [MemberNumber] - The member number to put on the lock, or message to show
 * @param {boolean} [Update=true] - Whether or not to update the character
 */
function InventoryLock(C, Item, Lock, MemberNumber, Update = true) {
	return;
}

/**
* Unlocks an item and removes all related properties
* @param {Character} C - The character on which the item must be unlocked
* @param {Item|string} Item - The item from appearance to unlock
*/
function InventoryUnlock(C, Item) {
	return;
}
