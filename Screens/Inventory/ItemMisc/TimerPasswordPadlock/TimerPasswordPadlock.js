"use strict";

const PasswordTimerChooseList = [5, 10, 15, 30, 60, 120, 180, 240, -180, -120, -60, -30, -15];
let PasswordTimerChooseIndex = 0;

// Loads the item extension properties
function InventoryItemMiscTimerPasswordPadlockLoad() {
	if (!DialogFocusSourceItem) return;

	if (!DialogFocusSourceItem.Property) DialogFocusSourceItem.Property = {};
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	if (Property.Password == null) Property.Password = "PASSWORD";
	if (Property.Hint == null) Property.Hint = "Take a guess...";
	if (Property.LockSet == null) Property.LockSet = false;
	if (Property.RemoveItem == null) Property.RemoveItem = false;
	if (Property.ShowTimer == null) Property.ShowTimer = true;
	if (Property.EnableRandomInput == null) Property.EnableRandomInput = false;
	if (Property.MemberNumberList == null) Property.MemberNumberList = [];

	// Only create the inputs if the zone isn't blocked
	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) return;

	// Only create the inputs if the zone isn't blocked
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
		document.getElementById("SetPassword").setAttribute("placeholder", DialogFocusSourceItem.Property.Password);
		document.getElementById("SetHint").setAttribute("placeholder", DialogFocusSourceItem.Property.Hint);
	}
}

// Draw the extension screen
function InventoryItemMiscTimerPasswordPadlockDraw() {
	if (
		!DialogFocusItem ||
		!DialogFocusSourceItem ||
		!DialogFocusSourceItem.Property ||
		DialogFocusSourceItem.Property.RemoveTimer < CurrentTime
	) {
		return InventoryItemMiscTimerPasswordPadlockExit();
	}

	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	if (Property && Property.ShowTimer) {
		DrawText(DialogFindPlayer("TimerLeft") + " " +
			TimerToString(Property.RemoveTimer - CurrentTime), 1500, 100, "white", "gray");
	} else {
		DrawText(DialogFindPlayer("TimerUnknown"), 1500, 150, "white", "gray");
	}

	DrawAssetPreview(1387, 175, DialogFocusItem.Asset);

	if (Property && Property.LockMemberNumber != null) {
		const Text = DialogFindPlayer("LockMemberNumber") + " " + Property.LockMemberNumber;
		DrawText(Text, 1500, 500, "white", "gray");
	}

	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) {
		// If the zone is blocked, just display some text informing the player that they can't access the lock
		DrawText(DialogFindPlayer("LockZoneBlocked"), 1500, 550, "white", "gray");
		return;
	}

	if (InventoryItemMiscPasswordPadlockIsSet()) {
		// Normal lock interface
		if (Property && Property.Hint) {
			DrawText("\"" + Property.Hint + "\"", 1500, 550, "white", "gray");
		}
		MainCanvas.textAlign = "right";
		DrawText(DialogFindPlayer("PasswordPadlockOld"), 1390, 610, "white", "gray");
		ElementPosition("Password", 1585, 605, 350);
		MainCanvas.textAlign = "center";
		DrawButton(1775, 575, 200, 64, DialogFindPlayer("PasswordPadlockEnter"), "White", "");
		if (PreferenceMessage != "") DrawText(DialogFindPlayer(PreferenceMessage), 1500, 200, "Red", "Black");
	} else {
		ElementPosition("SetHint", 1675, 550, 600);
		ElementPosition("SetPassword", 1563, 620, 375);
		MainCanvas.textAlign = "left";
		DrawText(DialogFindPlayer("PasswordPadlockSetHint"), 1100, 553, "white", "gray");
		DrawText(DialogFindPlayer("PasswordPadlockSetPassword"), 1100, 623, "white", "gray");
		MainCanvas.textAlign = "center";
		DrawButton(1765, 591, 200, 64, DialogFindPlayer("PasswordPadlockChangePassword"), "White", "");
		if (PreferenceMessage != "") DrawText(DialogFindPlayer(PreferenceMessage), 1500, 200, "Red", "Black");
	}

	// Draw the settings
	if (Player.CanInteract() && (Player.MemberNumber == Property.LockMemberNumber)) {
		MainCanvas.textAlign = "left";
		DrawCheckbox(1100, 666, 64, 64, DialogFindPlayer("RemoveItemWithTimer"), Property.RemoveItem, false, "#fff");
		DrawCheckbox(
			1100, 746, 64, 64, DialogFindPlayer("ShowItemWithTimerRemaining"), Property.ShowTimer, false, "#fff");
		DrawCheckbox(
			1100, 828, 64, 64, DialogFindPlayer("EnableRandomInput"), Property.EnableRandomInput, false, "#fff");
		MainCanvas.textAlign = "center";
	} else {
		const RemoveTextKey = (Property.RemoveItem) ? "WillRemoveItemWithTimer" : "WontRemoveItemWithTimer";
		DrawText(DialogFindPlayer(RemoveTextKey), 1500, 868, "white", "gray");
	}

	const Minutes = DialogFindPlayer("Minutes");
	// Draw buttons to add/remove time if available
	if (Player.CanInteract() && (Player.MemberNumber == Property.LockMemberNumber)) {
		DrawButton(1100, 910, 250, 70, DialogFindPlayer("AddTimerTime"), "White");
		DrawBackNextButton(1400, 910, 250, 70,
			PasswordTimerChooseList[PasswordTimerChooseIndex] + " " + Minutes,
			"White",
			"",
			() => PasswordTimerChooseList[(PasswordTimerChooseList.length + PasswordTimerChooseIndex - 1) %
			PasswordTimerChooseList.length] + " " + Minutes,
			() => PasswordTimerChooseList[(PasswordTimerChooseIndex + 1) % PasswordTimerChooseList.length] + " " +
				Minutes,
		);
	} else if (Player.CanInteract() && Property.EnableRandomInput) {
		for (let I = 0; I < Property.MemberNumberList.length; I++) {
			if (Property.MemberNumberList[I] == Player.MemberNumber) return;
		}
		const TimeButtonSuffix = `${DialogFocusItem.Asset.RemoveTimer * 3 / 60} ${Minutes}`;
		DrawButton(1100, 910, 250, 70, `- ${TimeButtonSuffix}`, "White");
		DrawButton(1400, 910, 250, 70, DialogFindPlayer("Random"), "White");
		DrawButton(1700, 910, 250, 70, `+ ${TimeButtonSuffix}`, "White");
	}
}

// Catches the item extension clicks
function InventoryItemMiscTimerPasswordPadlockClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemMiscTimerPasswordPadlockExit();
	}

	if (!DialogFocusSourceItem) return;
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	if (InventoryGroupIsBlocked(C, C.FocusGroup.Name)) return;

	if (InventoryItemMiscPasswordPadlockIsSet() && MouseIn(1775, 575, 200, 64)) {
		InventoryItemMiscPasswordPadlockHandleOpenClick(InventoryItemMiscTimerPasswordPadlockExit);
	} else if (MouseIn(1765, 591, 200, 64)) {
		InventoryItemMiscPasswordPadlockHandleFirstSet(InventoryItemMiscTimerPasswordPadlockExit);
	}

	if (!Player.CanInteract()) return;

	if (Player.MemberNumber === Property.LockMemberNumber) {
		if (MouseXIn(1100, 64)) {
			let Update = true;
			if (MouseYIn(666, 64)) {
				Property.RemoveItem = !Property.RemoveItem;
			} else if (MouseYIn(746, 64)) {
				Property.ShowTimer = !Property.ShowTimer;
			} else if (MouseYIn(826, 64)) {
				Property.EnableRandomInput = !Property.EnableRandomInput;
			} else {
				Update = false;
			}
			if (Update && CurrentScreen == "ChatRoom") ChatRoomCharacterItemUpdate(C);
		}
	}

	if (MouseYIn(910, 70)) {
		if (Player.MemberNumber === Property.LockMemberNumber) {
			if (MouseXIn(1100, 250)) {
				InventoryItemMiscTimerPasswordPadlockAdd(PasswordTimerChooseList[PasswordTimerChooseIndex] * 60, false);
			} else if (MouseXIn(1400, 250)) {
				if (MouseX <= 1525) {
					PasswordTimerChooseIndex = (PasswordTimerChooseList.length + PasswordTimerChooseIndex - 1) %
						PasswordTimerChooseList.length;
				} else {
					PasswordTimerChooseIndex = (PasswordTimerChooseIndex + 1) % PasswordTimerChooseList.length;
				}
			}
		} else if (Property.EnableRandomInput) {
			for (let I = 0; I < Property.MemberNumberList.length; I++) {
				if (Property.MemberNumberList[I] == Player.MemberNumber) return;
			}
			const RemoveTimer = DialogFocusItem.Asset.RemoveTimer;
			let TimeToAdd = 0;
			if (MouseXIn(1100, 250)) TimeToAdd = -RemoveTimer * 2;
			else if (MouseXIn(1400, 250)) TimeToAdd = RemoveTimer * 4 * ((Math.random() >= 0.5) ? 1 : -1);
			else if (MouseXIn(1700, 250)) TimeToAdd = RemoveTimer * 2;

			if (TimeToAdd) InventoryItemMiscTimerPasswordPadlockAdd(TimeToAdd, true);
		}
	}
}

// When a value is added to the timer, can be a negative one
function InventoryItemMiscTimerPasswordPadlockAdd(TimeToAdd, PlayerMemberNumberToList) {
	const Property = DialogFocusSourceItem.Property;
	const C = CharacterGetCurrent();

	if (PlayerMemberNumberToList) Property.MemberNumberList.push(Player.MemberNumber);
	const TimerBefore = Property.RemoveTimer;
	if (DialogFocusItem.Asset.RemoveTimer > 0) Property.RemoveTimer = Math.round(
		Math.min(Property.RemoveTimer + (TimeToAdd * 1000), CurrentTime + (DialogFocusItem.Asset.MaxTimer * 1000)));
	if (CurrentScreen === "ChatRoom") {
		const timeAdded = (Property.RemoveTimer - TimerBefore) / (1000 * 60);
		const msg = ((timeAdded < 0) && Property.ShowTimer ? "TimerRemoveTime" : "TimerAddTime");
		/** @type {ChatMessageDictionary} */
		const Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "FocusAssetGroup", AssetGroupName: C.FocusGroup.Name },
		];
		if (Property.ShowTimer) {
			Dictionary.push({ Tag: "TimerTime", Text: Math.round(Math.abs(timeAdded)).toString() });
			Dictionary.push({ Tag: "TimerUnit", TextToLookUp: "Minutes" });
		} else {
			Dictionary.push({ Tag: "TimerTime", TextToLookUp: "TimerAddRemoveUnknownTime" });
			Dictionary.push({ Tag: "TimerUnit", Text: "" });
		}

		for (let A = 0; A < C.Appearance.length; A++) {
			if (C.Appearance[A].Asset.Group.Name == C.FocusGroup.Name) {
				C.Appearance[A] = DialogFocusSourceItem;
				break;
			}
		}

		ChatRoomPublishCustomAction(msg, true, Dictionary);
	} else {
		CharacterRefresh(C);
	}

	InventoryItemMiscTimerPasswordPadlockExit();
}

function InventoryItemMiscTimerPasswordPadlockExit() {
	InventoryItemMiscPasswordPadlockExit();
}
