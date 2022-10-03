"use strict";

var InventoryItemTorso2FuturisticHarnessOptions = [
	{
		Name: "Full",
		Property: { Type: null, Difficulty: 2},
	},
	{
		Name: "Upper",
		Property: { Type: "Upper", Difficulty: 0},
	},
	{
		Name: "Lower",
		Property: { Type: "Lower", Difficulty: 0},
	},
];

// Loads the item extension properties
function InventoryItemTorso2FuturisticHarnessLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	}  else
		ExtendedItemLoad(InventoryItemTorso2FuturisticHarnessOptions, "FuturisticHarnessType");
}

// Draw the item extension screen
function InventoryItemTorso2FuturisticHarnessDraw() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else {
		ExtendedItemDraw(InventoryItemTorso2FuturisticHarnessOptions, "FuturisticHarnessType");

		DrawAssetPreview(1387, 75, DialogFocusItem.Asset);

		var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);

		if (FuturisticCollarItems.length > 0) {
			DrawButton(1400, 910, 200, 55, DialogFindPlayer("FuturisticCollarColor"), "White");
		}
	}
}


function InventoryItemTorso2FuturisticHarnessPublishAction(C, Option) {
	var msg = "FuturisticHarnessSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

// Catches the item extension clicks
function InventoryItemTorso2FuturisticHarnessClick() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	} else {

		ExtendedItemClick(InventoryItemTorso2FuturisticHarnessOptions);

		var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);
		if (MouseIn(1400, 910, 200, 55) && FuturisticCollarItems.length > 0 && DialogFocusItem) { InventoryItemNeckFuturisticCollarColor(C, DialogFocusItem); InventoryItemTorso2FuturisticHarnessExit();}
	}
}

function InventoryItemTorso2FuturisticHarnessExit() {
	InventoryItemFuturisticExitAccessDenied();
}