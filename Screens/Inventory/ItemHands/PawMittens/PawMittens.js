"use strict";
var InventoryItemHandsPawMittensMsg = null;

// Loads the item extension properties
function InventoryItemHandsPawMittensLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = {};
	InventoryItemHandsPawMittensMsg = null;
}

// Draw the item extension screen
function InventoryItemHandsPawMittensDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Draw the possible options
	DrawText(DialogFindPlayer("SelectFeature"), 1500, 500, "white", "gray");
	DrawPreviewBox(1250, 550, `${AssetGetInventoryPath(DialogFocusItem.Asset)}/AdultBabyHarness.png`, "", {Hover: true});
	DrawText(DialogFindPlayer("mittenstoharness"), 1375, 800, "white", "gray");

	// Draw the message if present
	if (InventoryItemHandsPawMittensMsg != null) DrawTextWrap(DialogFindPlayer(InventoryItemHandsPawMittensMsg), 1100, 850, 800, 160, "White");
}

// Catches the item extension clicks
function InventoryItemHandsPawMittensClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
	if ((MouseX >= 1250) && (MouseX <= 1475) && (MouseY >= 550) && (MouseY <= 775)) InventoryItemHandsPawMittensChain();
}

// Chain/Unchain function
function InventoryItemHandsPawMittensChain() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryGet(C, "ItemArms") == null) {
		if (InventoryGet(C, "ItemTorso") != null) {
			if (InventoryGet(C, "ItemTorso").Asset.Name == "AdultBabyHarness") {
				InventoryWear(C, "MittenChain1", "ItemArms");
				if (C.ID == 0) ServerPlayerAppearanceSync();
				if (CurrentScreen == "ChatRoom") {
					var Dictionary = [];
					Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
					Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
					ChatRoomPublishCustomAction("MittenChain", true, Dictionary);
					ChatRoomCharacterUpdate(C);
				}
			} else InventoryItemHandsPawMittensMsg = "NeedHarness";
		} else InventoryItemHandsPawMittensMsg = "NeedHarness";
	} else InventoryItemHandsPawMittensMsg = "FreeArms";
}
