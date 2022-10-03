"use strict";

var InventoryItemTorsoFuturisticHarnessOptions = [
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
function InventoryItemTorsoFuturisticHarnessLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	}  else
		ExtendedItemLoad(InventoryItemTorsoFuturisticHarnessOptions, "FuturisticHarnessType");
}

// Draw the item extension screen
function InventoryItemTorsoFuturisticHarnessDraw() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else {
		ExtendedItemDraw(InventoryItemTorsoFuturisticHarnessOptions, "FuturisticHarnessType");

		DrawAssetPreview(1387, 75, DialogFocusItem.Asset);

		var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);

		if (FuturisticCollarItems.length > 0) {
			DrawButton(1400, 910, 200, 55, DialogFindPlayer("FuturisticCollarColor"), "White");
		}
	}
}


function InventoryItemTorsoFuturisticHarnessPublishAction(C, Option) {
	var msg = "FuturisticHarnessSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

// Catches the item extension clicks
function InventoryItemTorsoFuturisticHarnessClick() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	} else {

		ExtendedItemClick(InventoryItemTorsoFuturisticHarnessOptions);

		var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);
		if (MouseIn(1400, 910, 200, 55) && FuturisticCollarItems.length > 0 && DialogFocusItem) { InventoryItemNeckFuturisticCollarColor(C, DialogFocusItem); InventoryItemTorsoFuturisticHarnessExit();}
	}
}

function InventoryItemTorsoFuturisticHarnessExit() {
	InventoryItemFuturisticExitAccessDenied();
}