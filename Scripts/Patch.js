"use strict";
let ArcadeDeviousChallenge = false;

var DialogText = "";
var DialogTextDefault = "";
var DialogTextDefaultTimer = -1;
var StruggleProgress = -1;
var DialogColor = null;
var DialogExpressionColor = null;
var DialogColorSelect = null;
var DialogPreviousCharacterData = {};
/** @type DialogInventoryItem[] */
var DialogInventory = [];
var DialogInventoryOffset = 0;
/** @type {Item|null} */
var DialogFocusItem = null;
/** @type {Item|null} */
var DialogFocusSourceItem = null;
var DialogFocusItemColorizationRedrawTimer = null;
/** @type {string[]} */
var DialogMenuButton = [];
var DialogItemToLock = null;
var DialogAllowBlush = false;
var DialogAllowEyebrows = false;
var DialogAllowFluids = false;
var DialogFacialExpressions = [];
var DialogFacialExpressionsSelected = -1;
var DialogFacialExpressionsSelectedBlindnessLevel = 2;
var DialogSavedExpressionPreviews = [];
/** @type {Pose[][]} */
var DialogActivePoses = [];
var DialogItemPermissionMode = false;
var DialogExtendedMessage = "";
var DialogActivityMode = false;
/** @type {Array<Activity>} */
var DialogActivity = [];
/** @type {Record<"Enabled" | "Equipped" | "BothFavoriteUsable" | "TargetFavoriteUsable" | "PlayerFavoriteUsable" | "Usable" | "TargetFavoriteUnusable" | "PlayerFavoriteUnusable" | "Unusable" | "Blocked", DialogSortOrder>} */
var DialogSortOrder = {
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
var DialogSelfMenuSelected = null;
var DialogLeaveDueToItem = false; // This allows dynamic items to call DialogLeave() without crashing the game
var DialogLockMenu = false;
var DialogLentLockpicks = false;
var DialogGamingPreviousRoom = "";
var DialogGamingPreviousModule = "";
var DialogButtonDisabledTester = /Disabled(For\w+)?$/u;

/** @type {Map<string, string>} */
var PlayerDialog = new Map();

/** @type {FavoriteState[]} */
var DialogFavoriteStateDetails = [
	{
		TargetFavorite: true,
		PlayerFavorite: true,
		Icon: "FavoriteBoth",
		UsableOrder: DialogSortOrder.BothFavoriteUsable,
		UnusableOrder: DialogSortOrder.TargetFavoriteUnusable
	},
	{
		TargetFavorite: true,
		PlayerFavorite: false,
		Icon: "Favorite",
		UsableOrder: DialogSortOrder.TargetFavoriteUsable,
		UnusableOrder: DialogSortOrder.TargetFavoriteUnusable
	},
	{
		TargetFavorite: false,
		PlayerFavorite: true,
		Icon: "FavoritePlayer",
		UsableOrder: DialogSortOrder.PlayerFavoriteUsable,
		UnusableOrder: DialogSortOrder.PlayerFavoriteUnusable
	},
	{
		TargetFavorite: false,
		PlayerFavorite: false,
		Icon: null,
		UsableOrder: DialogSortOrder.Usable,
		UnusableOrder: DialogSortOrder.Unusable
	},
];


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
	var characterExpression = {};
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

	// The "Exit" button is always available
	DialogMenuButton = ["Exit"];

	/** The item in the current slot */
	const Item = InventoryGet(C, C.FocusGroup.Name);
	const ItemBlockedOrLimited = !!Item && InventoryBlockedOrLimited(C, Item);

	// In color picker mode
	if (DialogColor != null && Item == null) {
		DialogMenuButton.push("ColorCancel");
		DialogMenuButton.push("ColorSelect");
		return;
	}

	// Pushes all valid main buttons, based on if the player is restrained, has a blocked group, has the key, etc.
	const IsGroupBlocked = InventoryGroupIsBlocked(C);

	if ((DialogInventory != null) && (DialogInventory.length > 12) && ((Player.CanInteract() && !IsGroupBlocked) || DialogItemPermissionMode)) {
		DialogMenuButton.push("Next");
		DialogMenuButton.push("Prev");
	}

	if (C.FocusGroup.Name == "ItemMouth" || C.FocusGroup.Name == "ItemMouth2" || C.FocusGroup.Name == "ItemMouth3")
		DialogMenuButton.push("ChangeLayersMouth");

	// Color selection
	if (DialogCanColor(C, Item)) DialogMenuButton.push(ItemBlockedOrLimited ? "ColorPickDisabled" : "ColorPick");

	// Item permission enter/exit
	if (C.ID == 0) {
		if (DialogItemPermissionMode) DialogMenuButton.push("DialogNormalMode");
		else DialogMenuButton.push("DialogPermissionMode");
	}

	// Make sure the previous button doesn't overflow the menu
	if ((DialogMenuButton.length >= 10) && (DialogMenuButton.indexOf("Prev") >= 0))
		DialogMenuButton.splice(DialogMenuButton.indexOf("Prev"), 1);

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
	if (!DialogItemPermissionMode) {
		const asset = item.Asset;
		// Make sure we do not duplicate the item in the list, including crafted items
		for (let I = 0; I < DialogInventory.length; I++)
			if ((DialogInventory[I].Asset.Group.Name == asset.Group.Name) && (DialogInventory[I].Asset.Name == asset.Name)) {
				if ((item.Craft == null) && (DialogInventory[I].Craft != null)) continue;
				if ((item.Craft != null) && (DialogInventory[I].Craft == null)) continue;
				if ((item.Craft != null) && (DialogInventory[I].Craft != null) && (item.Craft.Name != DialogInventory[I].Craft.Name)) continue;
				return;
			}
	}

	// Adds the item to the selection list
	const inventoryItem = DialogInventoryCreateItem(C, item, isWorn, sortOrder);
	if (item.Craft != null) {
		inventoryItem.Craft = item.Craft;
		if (inventoryItem.SortOrder.charAt(0) == DialogSortOrder.Usable.toString()) inventoryItem.SortOrder = DialogSortOrder.PlayerFavoriteUsable.toString() + item.Asset.Description;
		if (inventoryItem.SortOrder.charAt(0) == DialogSortOrder.Unusable.toString()) inventoryItem.SortOrder = DialogSortOrder.PlayerFavoriteUnusable.toString() + item.Asset.Description;
	}
	DialogInventory.push(inventoryItem);

}


/**
 * Returns settings for an item based on whether the player and target have favorited it, if any
 * @param {Character} C - The targeted character
 * @param {Asset} asset - The asset to check favorite settings for
 * @param {string} [type=null] - The type of the asset to check favorite settings for
 * @returns {FavoriteState} - The details to use for the asset
 */
function DialogGetFavoriteStateDetails(C, asset, type = null) {
	const isTargetFavorite = InventoryIsFavorite(C, asset.Name, asset.Group.Name, type);
	const isPlayerFavorite = C.ID !== 0 && InventoryIsFavorite(Player, asset.Name, asset.Group.Name, type);
	return DialogFavoriteStateDetails.find(F => F.TargetFavorite == isTargetFavorite && F.PlayerFavorite == isPlayerFavorite);
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
 * Creates an individual item for the dialog inventory list
 * @param {Character} C - The character the inventory is being built for
 * @param {Item} item - The item to be added to the inventory
 * @param {boolean} isWorn - Should be true if the item is currently being worn, false otherwise
 * @param {DialogSortOrder} [sortOrder] - Defines where in the inventory list the item is sorted
 * @returns {DialogInventoryItem} - The inventory item
 */
function DialogInventoryCreateItem(C, item, isWorn, sortOrder) {
	const asset = item.Asset;
	const favoriteStateDetails = DialogGetFavoriteStateDetails(C, asset);

	// Determine the sorting order for the item
	if (!DialogItemPermissionMode) {
		if (InventoryBlockedOrLimited(C, item)) {
			sortOrder = DialogSortOrder.Blocked;
		}
		else if (sortOrder == null) {
			if (asset.DialogSortOverride != null) {
				sortOrder = asset.DialogSortOverride;
			} else {
				if (InventoryAllow(C, asset, undefined, false) && InventoryChatRoomAllow(asset.Category)) {
					sortOrder = favoriteStateDetails.UsableOrder;
				} else {
					sortOrder = favoriteStateDetails.UnusableOrder;
				}
			}
		}
	} else if (sortOrder == null) {
		sortOrder = DialogSortOrder.Enabled;
	}

	// Determine the icons to display in the preview image
	let icons = [];
	if (favoriteStateDetails.Icon) icons.push(favoriteStateDetails.Icon);
	if (InventoryItemHasEffect(item, "Lock", true)) icons.push(isWorn ? "Locked" : "Unlocked");
	if (!C.IsPlayer() && InventoryIsAllowedLimited(C, item)) icons.push("AllowedLimited");
	icons = icons.concat(DialogGetAssetIcons(asset));

	/** @type {DialogInventoryItem} */
	const inventoryItem = {
		Asset: asset,
		Worn: isWorn,
		// @ts-ignore
		Icons: icons,
		SortOrder: sortOrder.toString() + asset.Description,
		Hidden: CharacterAppearanceItemIsHidden(asset.Name, asset.Group.Name),
		Vibrating: isWorn && InventoryItemHasEffect(item, "Vibrating", true)
	};
	return inventoryItem;
}

/**
 * Returns a list of icons associated with the asset
 * @param {Asset} asset - The asset to get icons for
 * @returns {InventoryIcon[]} - A list of icon names
 */
function DialogGetAssetIcons(asset) {
	let icons = [];
	icons = icons.concat(asset.PreviewIcons);
	return icons;
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

	// Make sure there's a focused group
	DialogInventoryOffset = Offset == null ? 0 : Offset;
	const DialogInventoryBefore = DialogInventoryStringified(C);
	DialogInventory = [];
	if (C.FocusGroup != null) {

		// First, we add anything that's currently equipped
		const CurItem = C.Appearance.find(A => A.Asset.Group.Name == C.FocusGroup.Name && A.Asset.DynamicAllowInventoryAdd(C));
		if (CurItem)
			DialogInventoryAdd(C, CurItem, true, DialogSortOrder.Enabled);

		// In item permission mode we add all the enable items except the ones already on, unless on Extreme difficulty
		if (DialogItemPermissionMode) {
			for (const A of C.FocusGroup.Asset) {
				if (!A.Enable)
					continue;

				if (A.Wear) {
					if ((CurItem == null) || (CurItem.Asset.Name != A.Name) || (CurItem.Asset.Group.Name != A.Group.Name))
						DialogInventoryAdd(Player, { Asset: A }, false, DialogSortOrder.Enabled);
				} else if (A.IsLock) {
					const LockIsWorn = InventoryCharacterIsWearingLock(C, A.Name);
					DialogInventoryAdd(Player, { Asset: A }, LockIsWorn, DialogSortOrder.Enabled);
				}
			}
		} else {

			// Second, we add everything from the victim inventory
			for (const I of C.Inventory)
				if ((I.Asset != null) && (I.Asset.Group.Name == C.FocusGroup.Name) && I.Asset.DynamicAllowInventoryAdd(C))
					DialogInventoryAdd(C, I, false);

			// Third, we add everything from the player inventory if the player isn't the victim
			if (C.ID != 0)
				for (const I of Player.Inventory)
					if ((I.Asset != null) && (I.Asset.Group.Name == C.FocusGroup.Name) && I.Asset.DynamicAllowInventoryAdd(C))
						DialogInventoryAdd(C, I, false);

			// Fourth, we add all free items (especially useful for clothes), or location-specific always available items
			for (const A of Asset)
				if (A.Group.Name === C.FocusGroup.Name && A.DynamicAllowInventoryAdd(C))
					if (A.Value === 0)
						DialogInventoryAdd(C, { Asset: A }, false);

		}

		// Rebuilds the dialog menu and its buttons
		DialogInventorySort();
		DialogMenuButtonBuild(C);

		// Build the list of preview images
		const DialogInventoryAfter = DialogInventoryStringified(C);
		const redraw = redrawPreviews || (DialogInventoryBefore !== DialogInventoryAfter);
		AppearancePreviewBuild(C, redraw);
	}
}


/**
 * Shows the extended item menue for a given item, if possible.
 * Therefore a dynamic function name is created and then called.
 * @param {Item} Item - The item the extended menu should be shown for
 * @param {Item} [SourceItem] - The source of the extended menu
 * @returns {void} - Nothing
 */
function DialogExtendItem(Item, SourceItem) {
	const C = CharacterGetCurrent();
	if (InventoryBlockedOrLimited(C, Item)) return;
	StruggleProgress = -1;
	DialogLockMenu = false;
	DialogColor = null;
	DialogFocusItem = Item;
	DialogFocusSourceItem = SourceItem;
	CommonDynamicFunction("Inventory" + Item.Asset.Group.Name + Item.Asset.Name + "Load()");
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

		var funcName = "Inventory" + DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Exit";
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
