"use strict";

// How to make your item futuristic!

// In the load function, add this before your load function, without changing functions from the
// futuristic panel gag functions. Just make sure your item loads after the panel gag and not before in index.html:
/*
 	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied()
	} else
*/

// In the draw function, add:
/*
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied()
	} else
*/

// In the click function, add:
/*
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied()
	} else
*/

// In the exit function, add:
/*
	InventoryItemFuturisticExitAccessDenied()
*/

// In the validate function, add:
/*
 	return InventoryItemFuturisticValidate(C, Item)
*/

var FuturisticAccessDeniedMessage = "";

var FuturisticAccessCollarGroups = ["ItemNeck", "ItemNeckAccessories", "ItemEars", "ItemHead", "ItemHood", "ItemMouth", "ItemMouth2", "ItemMouth3", "ItemDevices"];
var FuturisticAccessArmGroups = ["ItemArms", "ItemHands"];
var FuturisticAccessLegGroups = ["ItemLegs", "ItemFeet", "ItemBoots"];
var FuturisticAccessChastityGroups = ["ItemPelvis", "ItemTorso", "ItemButt", "ItemVulva", "ItemVulvaPiercings", "ItemBreast", "ItemNipples", "ItemNipplesPiercings"];

/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {function} OriginalFunction - The function that is normally called when an archetypical item reaches this point.
 * @returns {void} - Nothing
 */
function FuturisticAccessLoad(OriginalFunction) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied()
	} else OriginalFunction();
}

/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {function} OriginalFunction - The function that is normally called when an archetypical item reaches this point.
 * @returns {void} - Nothing
 */
function FuturisticAccessClick(OriginalFunction) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied()
	} else OriginalFunction();
}

/**
 * Hook script for injecting futuristic features into an archetypical item
 * @param {function} OriginalFunction - The function that is normally called when an archetypical item reaches this point.
 * @returns {void} - Nothing
 */
function FuturisticAccessDraw(OriginalFunction) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied()
	} else OriginalFunction();
}

/**
 * Hook script for injecting futuristic features into an archetypical item
 * @returns {void} - Nothing
 */
 function FuturisticAccessExit() {
	InventoryItemFuturisticExitAccessDenied();
}

/**
 * Hook script for injecting futuristic features into a typed or modular item
 * @param {ExtendedItemValidateCallback<OptionType>} OriginalFunction - The function that is normally called when an archetypical item reaches this point.
 * @param {Character} C - The character to validate the option
 * @param {Item} Item - The equipped item
 * @param {OptionType} Option - The selected option
 * @param {OptionType} CurrentOption - The currently selected option
 * @returns {string} - Returns false and sets DialogExtendedMessage, if the chosen option is not possible.
 * @template OptionType
 */
function FuturisticAccessValidate(OriginalFunction, C, Item, Option, CurrentOption) {
	let futureString = InventoryItemFuturisticValidate(C, Item);
	if (futureString) return futureString;
	else return OriginalFunction(C, Item, Option, CurrentOption);
}



// Load the futuristic item ACCESS DENIED screen
function InventoryItemFuturisticLoadAccessDenied() {
	ElementCreateInput("PasswordField", "text", "", "12");
	if (!FuturisticAccessDeniedMessage)
		FuturisticAccessDeniedMessage = "";
}

// Draw the futuristic item ACCESS DENIED screen
function InventoryItemFuturisticDrawAccessDenied() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);

	DrawText(DialogFindPlayer("FuturisticItemLoginScreen"), 1500, 600, "White", "Gray");

	ElementPosition("PasswordField", 1505, 750, 350);
	DrawText(DialogFindPlayer("FuturisticItemPassword"), 1500, 700, "White", "Gray");
	DrawButton(1400, 800, 200, 64, DialogFindPlayer("FuturisticItemLogIn"), "White", "");

	if (FuturisticAccessDeniedMessage && FuturisticAccessDeniedMessage != "") DrawText(FuturisticAccessDeniedMessage, 1500, 963, "Red", "Black");

}

// Click the futuristic item ACCESS DENIED screen
function InventoryItemFuturisticClickAccessDenied() {
	if (MouseIn(1885, 25, 90, 90)) InventoryItemFuturisticExitAccessDenied();

	if (MouseIn(1400, 800, 200, 64)) {
		var pw = ElementValue("PasswordField").toUpperCase();
		if (DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy == "PasswordPadlock" && pw == DialogFocusItem.Property.Password) {
			let C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
			CommonPadlockUnlock(C, DialogFocusItem);
			DialogFocusItem = null;
			Player.FocusGroup = null;
			InventoryItemFuturisticExitAccessDenied();
		} else if (DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy == "TimerPasswordPadlock" && pw == DialogFocusItem.Property.Password) {
			let C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
			CommonPadlockUnlock(C, DialogFocusItem);
			DialogFocusItem = null;
			Player.FocusGroup = null;
			InventoryItemFuturisticExitAccessDenied();
		} else if (DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy == "CombinationPadlock" && pw == DialogFocusItem.Property.CombinationNumber) {
			let C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
			InventoryItemMiscCombinationPadlockUnlock(C, DialogFocusItem);
			DialogFocusItem = null;
			Player.FocusGroup = null;
			InventoryItemFuturisticExitAccessDenied();
		} else {
			FuturisticAccessDeniedMessage = DialogFindPlayer("CantChangeWhileLockedFuturistic");
			AudioPlayInstantSound("Audio/AccessDenied.mp3");
			if (CurrentScreen == "ChatRoom") {
				InventoryItemFuturisticPublishAccessDenied((Player.FocusGroup != null) ? Player : CurrentCharacter);
			}
		}
	}
}

function InventoryItemFuturisticExitAccessDenied() {
	ElementRemove("PasswordField");
	FuturisticAccessDeniedMessage = "";
	DialogFocusItem = null;
}

/**
 * Validates, if the chosen option is possible. Sets the global variable 'DialogExtendedMessage' to the appropriate error message, if not.
 * @param {Character} C - The character to validate the option
 * @param {Item} Item - The equipped item
 * @returns {string} - Returns false and sets DialogExtendedMessage, if the chosen option is not possible.
 */
function InventoryItemFuturisticValidate(C, Item = DialogFocusItem) {
	var Allowed = "";

	if (Item && Item.Property && Item.Property.LockedBy && !DialogCanUnlock(C, Item)) {
		var collar = InventoryGet(C, "ItemNeck");
		if (!collar || (!collar.Property ||
			(FuturisticAccessCollarGroups.includes(Item.Asset.Group.Name) && collar.Property.OpenPermission != true) ||
			(FuturisticAccessArmGroups.includes(Item.Asset.Group.Name) && collar.Property.OpenPermissionArm != true) ||
			(FuturisticAccessLegGroups.includes(Item.Asset.Group.Name) && collar.Property.OpenPermissionLeg != true) ||
			(FuturisticAccessChastityGroups.includes(Item.Asset.Group.Name) && collar.Property.OpenPermissionChastity != true))) {
			Allowed = DialogExtendedMessage = DialogFindPlayer("CantChangeWhileLockedFuturistic");
		}
	}

	return Allowed;
}

function InventoryItemFuturisticPublishAccessDenied(C) {
	var msg = "FuturisticItemLoginLoginAttempt";
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name}
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}
