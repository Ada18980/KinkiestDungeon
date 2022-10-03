"use strict";

const InventoryItemMiscPasswordPadlockPasswordRegex = /^[A-Z]+$/;

// Loads the item extension properties
function InventoryItemMiscPasswordPadlockLoad() {
	if (!DialogFocusSourceItem) return;

	if (!DialogFocusSourceItem.Property) DialogFocusSourceItem.Property = {};
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	if (Property.Password == null) Property.Password = "PASSWORD";
	if (Property.Hint == null) Property.Hint = "Take a guess...";
	if (Property.LockSet == null) Property.LockSet = false;
	if (Property.RemoveOnUnlock == null) Property.RemoveOnUnlock = false;

	// Only create the inputs if the zone isn't blocked
	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) return;

	if (InventoryItemMiscPasswordPadlockIsSet()) {
		// Normal lock interface
		ElementCreateInput("Password", "text", "", "8");
		// the current code is shown for owners, lovers and the member whose number is on the padlock
		if (
			Player.MemberNumber === Property.LockMemberNumber ||
			C.IsOwnedByPlayer() ||
			C.IsLoverOfPlayer()
		) {
			document.getElementById("Password").setAttribute("placeholder", Property.Password);
		}
	} else {
		// Set a password and hint
		ElementCreateInput("SetHint", "text", "", "140");
		ElementCreateInput("SetPassword", "text", "", "8");
		// the current code is shown for owners, lovers and the member whose number is on the padlock
		document.getElementById("SetPassword").setAttribute("placeholder", Property.Password);
		document.getElementById("SetHint").setAttribute("placeholder", Property.Hint);
	}
}

// Draw the extension screen
function InventoryItemMiscPasswordPadlockDraw() {
	if (!DialogFocusItem || !DialogFocusSourceItem) return InventoryItemMiscPasswordPadlockExit();
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);

	if (Property && Property.LockMemberNumber != null) {
		DrawText(
			DialogFindPlayer("LockMemberNumber") + " " + Property.LockMemberNumber.toString(),
			1500, 600, "white", "gray",
		);
	}

	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) {
		// If the zone is blocked, just display some text informing the player that they can't access the lock
		DrawText(DialogFindPlayer("LockZoneBlocked"), 1500, 800, "white", "gray");
	} else {
		InventoryItemMiscPasswordPadlockDrawControls();
	}
}

function InventoryItemMiscPasswordPadlockDrawControls() {
	const Property = DialogFocusSourceItem.Property;

	if (InventoryItemMiscPasswordPadlockIsSet()) {
		// Normal lock interface
		if (Property && Property.Hint) {
			DrawTextWrap("\"" + Property.Hint + "\"", 1000, 640, 1000, 120, null, null, 2);
		}
		MainCanvas.textAlign = "right";
		DrawText(DialogFindPlayer("PasswordPadlockOld"), 1350, 810, "white", "gray");
		ElementPosition("Password", 1643, 805, 550);
		MainCanvas.textAlign = "center";
		DrawButton(1360, 871, 250, 64, DialogFindPlayer("PasswordPadlockEnter"), "White", "");
		if (PreferenceMessage != "") DrawText(DialogFindPlayer(PreferenceMessage), 1500, 963, "Red", "Black");
	} else {
		ElementPosition("SetHint", 1643, 700, 550);
		ElementPosition("SetPassword", 1643, 770, 550);
		MainCanvas.textAlign = "left";
		DrawText(DialogFindPlayer("PasswordPadlockSetHint"), 1100, 705, "white", "gray");
		DrawText(DialogFindPlayer("PasswordPadlockSetPassword"), 1100, 775, "white", "gray");
		MainCanvas.textAlign = "center";
		DrawButton(1360, 891, 250, 64, DialogFindPlayer("PasswordPadlockChangePassword"), "White", "");
		if (PreferenceMessage != "") DrawText(DialogFindPlayer(PreferenceMessage), 1500, 963, "Red", "Black");

		if (Property) {
			DrawButton(1600, 820, 64, 64, "", "White", Property.RemoveOnUnlock ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("PasswordPadlockRemoveOnUnlock"), 1400, 855, "White", "Gray");
		}
	}
}

// Catches the item extension clicks
function InventoryItemMiscPasswordPadlockClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		return InventoryItemMiscPasswordPadlockExit();
	}

	const C = CharacterGetCurrent();
	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) return;

	InventoryItemMiscPasswordPadlockControlsClick(InventoryItemMiscPasswordPadlockExit);
}

function InventoryItemMiscPasswordPadlockControlsClick(ExitCallback) {
	if (!DialogFocusSourceItem) return;

	if (InventoryItemMiscPasswordPadlockIsSet()) {
		if (MouseIn(1360, 871, 250, 64)) {
			InventoryItemMiscPasswordPadlockHandleOpenClick(ExitCallback);
		}
	} else {
		if (MouseIn(1600, 820, 250, 64)) {
			DialogFocusSourceItem.Property.RemoveOnUnlock = !DialogFocusSourceItem.Property.RemoveOnUnlock;
		} else if (MouseIn(1360, 891, 250, 64)) {
			InventoryItemMiscPasswordPadlockHandleFirstSet(ExitCallback);
		}
	}
}

function InventoryItemMiscPasswordPadlockHandleOpenClick(ExitCallback) {
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	// Opens the padlock
	if (ElementValue("Password").toUpperCase() === Property.Password) {
		if (DialogFocusSourceItem.Property.RemoveOnUnlock) {
			InventoryRemove(CurrentCharacter, C.FocusGroup.Name, true);
			if (CurrentScreen == "ChatRoom") {
				ChatRoomCharacterUpdate(C);
			}
		}
		CommonPadlockUnlock(C, DialogFocusSourceItem);
		ExitCallback();
	}

	// Send fail message if online
	else if (CurrentScreen == "ChatRoom") {
		const Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name },
			{ Tag: "Password", Text: ElementValue("Password") },
		];
		ChatRoomPublishCustomAction("PasswordFail", true, Dictionary);
		ExitCallback();
	} else { PreferenceMessage = "PasswordPadlockError"; }
}

function InventoryItemMiscPasswordPadlockHandleFirstSet(ExitCallback) {
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	const pw = ElementValue("SetPassword").toUpperCase();
	const hint = ElementValue("SetHint");
	// We only accept code made of letters
	if (pw === "" || pw.match(InventoryItemMiscPasswordPadlockPasswordRegex)) {
		Property.LockSet = true;
		if (pw !== "") Property.Password = pw;
		if (hint !== "") Property.Hint = hint;

		for (let A = 0; A < C.Appearance.length; A++) {
			if (C.Appearance[A].Asset.Group.Name == C.FocusGroup.Name) {
				C.Appearance[A] = DialogFocusSourceItem;
				break;
			}
		}

		if (CurrentScreen === "ChatRoom") {
			InventoryItemMiscPasswordPadlockPublishPasswordChange(C);
			ExitCallback();
		} else {
			CharacterRefresh(C);
			ExitCallback();
		}
	} else { PreferenceMessage = "PasswordPadlockErrorInput"; }
}

function InventoryItemMiscPasswordPadlockExit() {
	ElementRemove("Password");
	ElementRemove("SetPassword");
	ElementRemove("SetHint");
	PreferenceMessage = "";
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild(CharacterGetCurrent());
}

function InventoryItemMiscPasswordPadlockIsSet() {
	if (!DialogFocusSourceItem || !DialogFocusSourceItem.Property) {
		return false;
	} else if (DialogFocusSourceItem.Property.LockSet) {
		return true;
	} else {
		const { LockMemberNumber } = DialogFocusSourceItem.Property;
		return LockMemberNumber != null && LockMemberNumber !== Player.MemberNumber;
	}
}

function InventoryItemMiscPasswordPadlockPublishPasswordChange(C) {
	const Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name },
	];
	ChatRoomPublishCustomAction("PasswordChangeSuccess", true, Dictionary);
}
