"use strict";

// This should be true only for standalone
let StandalonePatched = true;


let ArcadeDeviousChallenge = false;


let ChatRoomChatLog = [];
let ChatRoomCharacter = null;

let DialogText = "";
let DialogTextDefault = "";
let DialogTextDefaultTimer = -1;
let StruggleProgress = -1;
let DialogColor = null;
let DialogExpressionColor = null;
let DialogColorSelect = null;
let DialogPreviousCharacterData = {};
let DialogInventory = [];
let DialogInventoryOffset = 0;
/** @type {Item|null} */
let DialogFocusItem = null;
/** @type {Item|null} */
let DialogFocusSourceItem = null;
let DialogFocusItemColorizationRedrawTimer = null;
/** @type {string[]} */
let DialogMenuButton = [];
let DialogItemToLock = null;
let DialogAllowBlush = false;
let DialogAllowEyebrows = false;
let DialogAllowFluids = false;
let DialogFacialExpressions = [];
let DialogFacialExpressionsSelected = -1;
let DialogFacialExpressionsSelectedBlindnessLevel = 2;
let DialogSavedExpressionPreviews = [];
/** @type {Pose[][]} */
let DialogActivePoses = [];
let DialogItemPermissionMode = false;
let DialogExtendedMessage = "";
let DialogActivityMode = false;
/** @type {Record<"Enabled" | "Equipped" | "BothFavoriteUsable" | "TargetFavoriteUsable" | "PlayerFavoriteUsable" | "Usable" | "TargetFavoriteUnusable" | "PlayerFavoriteUnusable" | "Unusable" | "Blocked", DialogSortOrder>} */
let DialogSortOrder = {
	Enabled: 1,
	Equipped: 2,
	BothFavoriteUsable: 3,
	TargetFavoriteUsable: 4,
	PlayerFavoriteUsable: 5,
	Usable: 6,
	TargetFavoriteUnusable: 7,
	PlayerFavoriteUnusable: 8,
	Unusable: 9,
	Blocked: 10
};
let DialogSelfMenuSelected = null;
let DialogLeaveDueToItem = false; // This allows dynamic items to call DialogLeave() without crashing the game
let DialogLockMenu = false;
let DialogLentLockpicks = false;
let DialogGamingPreviousRoom = "";
let DialogGamingPreviousModule = "";
let DialogButtonDisabledTester = /Disabled(For\w+)?$/u;

/** @type {Map<string, string>} */
let PlayerDialog = new Map();

let DialogFavoriteStateDetails = [];


function DialogCanUnlock() {
	return true;
}

// This file patches KD
function CheatFactor() {
	return 1;
}

/**
 * Returns the expressions of character C as a single big object
 * @param {Character} C - The character whose expressions should be returned
 * @returns {object} Expression - The expresssion of a character
 */
function WardrobeGetExpression(C) {
	let characterExpression = {};
	ServerAppearanceBundle(C.Appearance).filter(item => item.Property != null && item.Property.Expression != null).forEach(item => characterExpression[item.Group] = item.Property.Expression);
	return characterExpression;
}
/**
 * Draws the online game images/text needed on the characters
 * @param {Character} C - Character to draw the info for
 * @param {number} X - Position of the character the X axis
 * @param {number} Y - Position of the character the Y axis
 * @param {number} Zoom - Amount of zoom the character has (Height)
 * @returns {void} - Nothing
 */
function OnlineGameDrawCharacter(C, X, Y, Zoom) {

}

/**
 * Returns the background color of a dialog menu button based on the button name.
 * @param {string} ButtonName - The menu button name
 * @returns {string} - The background color that the menu button should use
 */
function DialogGetMenuButtonColor(ButtonName) {
	if (DialogIsMenuButtonDisabled(ButtonName)) {
		return "#808080";
	} else if (ButtonName === "ColorPick") {
		return DialogColorSelect || "#fff";
	} else {
		return "#fff";
	}
}
/**
 * Determines whether or not a given dialog menu button should be disabled based on the button name.
 * @param {string} ButtonName - The menu button name
 * @returns {boolean} - TRUE if the menu button should be disabled, FALSE otherwise
 */
function DialogIsMenuButtonDisabled(ButtonName) {
	return DialogButtonDisabledTester.test(ButtonName);
}

/**
 * Build the buttons in the top menu
 * @param {Character} C - The character for whom the dialog is prepared
 * @returns {void} - Nothing
 */
function DialogMenuButtonBuild(C) {

}


/**
 * Checks whether the player can color the given item on the given character
 * @param {Character} C - The character on whom the item is equipped
 * @param {Item} Item - The item to check the player's ability to color against
 * @returns {boolean} - TRUE if the player is able to color the item, FALSE otherwise
 */
function DialogCanColor(C, Item) {
	const ItemColorable = !Item || (Item && Item.Asset && Item.Asset.ColorableLayerCount > 0);
	return ItemColorable;
}

/**
 * Sort the inventory list by the global variable SortOrder (a fixed number & current language description)
 * @returns {void} - Nothing
 */
function DialogInventorySort() {
	DialogInventory.sort((a, b) => a.SortOrder.localeCompare(b.SortOrder, undefined, { numeric: true, sensitivity: 'base' }));
}

/**
 * Create a stringified list of the group and the assets currently in the dialog inventory
 * @param {Character} C - The character the dialog inventory has been built for
 * @returns {string} - The list of assets as a string
 */
function DialogInventoryStringified(C) {
	return (C.FocusGroup ? C.FocusGroup.Name : "") + (DialogInventory ? JSON.stringify(DialogInventory.map(I => I.Asset.Name).sort()) : "");
}



/**
 * Adds the item in the dialog list
 * @param {Character} C - The character the inventory is being built for
 * @param {Item} item - The item to be added to the inventory
 * @param {boolean} isWorn - Should be true, if the item is currently being worn, false otherwise
 * @param {DialogSortOrder} [sortOrder] - Defines where in the inventory list the item is sorted
 * @returns {void} - Nothing
 */
function DialogInventoryAdd(C, item, isWorn, sortOrder) {


}



/**
 * Searches in the dialog for a specific stage keyword and returns that dialog option if we find it, error otherwise
 * @param {string} KeyWord - The key word to search for
 * @returns {string}
 */
function DialogFindPlayer(KeyWord) {
	const res = PlayerDialog.get(KeyWord);
	return res !== undefined ? res : `MISSING PLAYER DIALOG: ${KeyWord}`;
}

/**
 * Build the inventory listing for the dialog which is what's equipped,
 * the player's inventory and the character's inventory for that group
 * @param {Character} C - The character whose inventory must be built
 * @param {number} [Offset] - The offset to be at, if specified.
 * @param {boolean} [redrawPreviews=false] - If TRUE and if building a list of preview character images, redraw the canvases
 * @returns {void} - Nothing
 */
function DialogInventoryBuild(C, Offset, redrawPreviews = false) {

}

/**
 * Leaves the item menu of the focused item. Constructs a function name from the
 * item's asset group name and the item's name and tries to call that.
 * @returns {boolean} - Returns true, if an item specific exit function was called, false otherwise
 */
function DialogLeaveFocusItem() {
	if (DialogFocusItem != null) {
		if (DialogFocusItem.Asset.Extended) {
			ExtendedItemExit();
		}

		let funcName = "Inventory" + DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Exit";
		if (typeof window[funcName] === "function") {
			window[funcName]();
			DialogFocusItem = null;
			return true;
		}
		DialogFocusItem = null;
	}
	return false;
}

/**
 * Returns a specific reputation value for the player
 * @param {string} RepType - Type/name of the reputation to get the value of.
 * @returns {number} - Returns the value of the reputation. It can range from 100 to -100, and it defaults to 0 if the player never earned this type of reputation before.
 */
function ReputationGet(RepType) {
	return 0;
}
/** Smile and wave */
function DialogSetReputation(a, b) {
}

function remap(src) {
	return src;
}

function ChatRoomCharacterUpdate(C) {
	// Nothing.
}


let KDPatched = true;
