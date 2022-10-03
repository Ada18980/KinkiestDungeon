"use strict";

// Loads the item extension properties
function InventoryItemMiscLoversPadlockLoad() {
}

// Draw the extension screen
function InventoryItemMiscLoversPadlockDraw() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);
    DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Intro"), 1500, 600, "white", "gray");
    if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.LockMemberNumber != null))
        DrawText(DialogFindPlayer("LockMemberNumber") + " " + DialogFocusSourceItem.Property.LockMemberNumber.toString(), 1500, 700, "white", "gray");
    DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Detail"), 1500, 800, "white", "gray");
}

// Catches the item extension clicks
function InventoryItemMiscLoversPadlockClick() {
    if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
}
