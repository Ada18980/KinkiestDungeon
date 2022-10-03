"use strict";
var InventoryItemHandsPaddedMittensMsg = null;

// Loads the item extension properties
function InventoryItemHandsPaddedMittensLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = {};
	InventoryItemHandsPaddedMittensMsg = null;
}

// Draw the item extension screen
function InventoryItemHandsPaddedMittensDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Draw the possible options
	DrawText(DialogFindPlayer("SelectFeature"), 1500, 500, "white", "gray");
	DrawPreviewBox(1250, 550, `${AssetGetInventoryPath(DialogFocusItem.Asset)}/AdultBabyHarness.png`, "", {Hover: true});
	DrawText(DialogFindPlayer("mittenstoharness"), 1375, 800, "white", "gray");

	// Draw the message if present
	if (InventoryItemHandsPaddedMittensMsg != null) DrawTextWrap(DialogFindPlayer(InventoryItemHandsPaddedMittensMsg), 1100, 850, 800, 160, "White");
}

// Catches the item extension clicks
function InventoryItemHandsPaddedMittensClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
	if ((MouseX >= 1250) && (MouseX <= 1475) && (MouseY >= 550) && (MouseY <= 775)) InventoryItemHandsPaddedMittensChain();
}

// Chain/Unchain function
function InventoryItemHandsPaddedMittensChain() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryGet(C, "ItemArms") != null) {
		InventoryItemHandsPaddedMittensMsg = "FreeArms";
		return;
	}

	if (!CharacterHasItemWithAttribute(C, "CanAttachMittens")) {
		InventoryItemHandsPaddedMittensMsg = "NeedHarness";
		return;
	}

	InventoryWear(C, "MittenChain1", "ItemArms");
	if (C.ID == 0) ServerPlayerAppearanceSync();
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [];
		Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
		Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
		ChatRoomPublishCustomAction("MittenChain", true, Dictionary);
		ChatRoomCharacterUpdate(C);
	}
}
