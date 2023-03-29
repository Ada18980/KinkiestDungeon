"use strict";

// Loads the item extension properties
function InventoryItemMiscMistressPadlockLoad() {
}

// Draw the extension screen
function InventoryItemMiscMistressPadlockDraw() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);
	DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Intro"), 1500, 600, "white", "gray");
	// @ts-ignore
	if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.LockMemberNumber != null) && (DialogFocusSourceItem.Property.LockMemberNumber >= 0))
		DrawText(DialogFindPlayer("LockMemberNumber") + " " + DialogFocusSourceItem.Property.LockMemberNumber.toString(), 1500, 700, "white", "gray");
}

// Catches the item extension clicks
function InventoryItemMiscMistressPadlockClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
}
