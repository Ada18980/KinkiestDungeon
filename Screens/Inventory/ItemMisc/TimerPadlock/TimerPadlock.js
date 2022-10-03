"use strict";

// Loads the item extension properties
function InventoryItemMiscTimerPadlockLoad() {
	if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property == null)) DialogFocusSourceItem.Property = {};
	if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.RemoveItem == null)) DialogFocusSourceItem.Property.RemoveItem = false;
}

// Draw the extension screen
function InventoryItemMiscTimerPadlockDraw() {
	if ((DialogFocusItem == null) || (DialogFocusSourceItem.Property.RemoveTimer < CurrentTime)) { InventoryItemMiscTimerPadlockExit(); return; }
	DrawText(DialogFindPlayer("TimerLeft") + " " + TimerToString(DialogFocusSourceItem.Property.RemoveTimer - CurrentTime), 1500, 150, "white", "gray");
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);
	DrawText(DialogFindPlayer(DialogFocusItem.Asset.Group.Name + DialogFocusItem.Asset.Name + "Intro"), 1500, 600, "white", "gray");
	if ((DialogFocusSourceItem != null) && (DialogFocusSourceItem.Property != null) && (DialogFocusSourceItem.Property.LockMemberNumber != null))
		DrawText(DialogFindPlayer("LockMemberNumber") + " " + DialogFocusSourceItem.Property.LockMemberNumber.toString(), 1500, 700, "white", "gray");
	if ((Player.MemberNumber == DialogFocusSourceItem.Property.LockMemberNumber) && Player.CanInteract()) {
		MainCanvas.textAlign = "left";
		DrawButton(1100, 836, 64, 64, "", "White", (DialogFocusSourceItem.Property.RemoveItem) ? "Icons/Checked.png" : "");
		DrawText(DialogFindPlayer("RemoveItemWithTimer"), 1200, 868, "white", "gray");
		MainCanvas.textAlign = "center";
	} else DrawText(DialogFindPlayer((DialogFocusSourceItem.Property.RemoveItem) ? "WillRemoveItemWithTimer" : "WontRemoveItemWithTimer"), 1500, 868, "white", "gray");
	if (Player.CanInteract()) DrawButton(1350, 910, 300, 65, DialogFindPlayer("RestartTimer"), "White");
}

// Catches the item extension clicks
function InventoryItemMiscTimerPadlockClick() {
	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) InventoryItemMiscTimerPadlockExit();
	if ((MouseX >= 1100) && (MouseX <= 1164) && (MouseY >= 836) && (MouseY <= 900) && (Player.MemberNumber == DialogFocusSourceItem.Property.LockMemberNumber) && Player.CanInteract()) {
		DialogFocusSourceItem.Property.RemoveItem = !(DialogFocusSourceItem.Property.RemoveItem);
		if (CurrentScreen == "ChatRoom") ChatRoomCharacterItemUpdate(CharacterGetCurrent());
	}
	if ((MouseX >= 1350) && (MouseX <= 1650) && (MouseY >= 910) && (MouseY <= 975) && Player.CanInteract()) InventoryItemMiscTimerPadlockReset();
}

// When the timer resets
function InventoryItemMiscTimerPadlockReset() {
	if (DialogFocusItem.Asset.RemoveTimer > 0) DialogFocusSourceItem.Property.RemoveTimer = Math.round(CurrentTime + (DialogFocusItem.Asset.RemoveTimer * 1000));
	if (CurrentScreen == "ChatRoom") {
		var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
		var msg = "TimerRestart";
		/** @type {ChatMessageDictionary} */
		var Dictionary = [];
		Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
		Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
		Dictionary.push({Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name});
		ChatRoomPublishCustomAction(msg, true, Dictionary);
	}
	InventoryItemMiscTimerPadlockExit();
}

// Exits the extended menu
function InventoryItemMiscTimerPadlockExit() {
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild((Player.FocusGroup != null) ? Player : CurrentCharacter);
}
