"use strict";


var FuturisticCollarPage = 0;
var FuturisticCollarMaxPage = 2;

// Loads the item extension properties
function InventoryItemNeckFuturisticCollarLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	} else {
		if (DialogFocusItem.Property == null) DialogFocusItem.Property = { OpenPermission: false };
		if (DialogFocusItem.Property.OpenPermission == null) DialogFocusItem.Property.OpenPermission = false;
		if (DialogFocusItem.Property.OpenPermissionChastity == null) DialogFocusItem.Property.OpenPermissionChastity = false;
		if (DialogFocusItem.Property.OpenPermissionArm == null) DialogFocusItem.Property.OpenPermissionArm = false;
		if (DialogFocusItem.Property.OpenPermissionLeg == null) DialogFocusItem.Property.OpenPermissionLeg = false;
		if (DialogFocusItem.Property.BlockRemotes == null) DialogFocusItem.Property.BlockRemotes = false;

		ElementCreateInput("FutureCollarPasswordField", "text", "", "8");
		ElementCreateInput("FutureCollarTimeField", "text", "", "4");
	}
}

// Draw the item extension screen
function InventoryItemNeckFuturisticCollarDraw() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else {
		DrawAssetPreview(1387, 65, DialogFocusItem.Asset);

		if (FuturisticCollarPage == 0) {
			if ((DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) {
				DrawText(DialogFindPlayer("FuturisticCollarOptionsLockout"), 1500, 375, "White", "Gray");
			}


			MainCanvas.textAlign = "left";
			DrawButton(1125, 395, 64, 64, "", "White", DialogFocusItem.Property.OpenPermission ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("FuturisticCollarOpenPermission"), 1200, 425, "White", "Gray");
			DrawButton(1125, 495, 64, 64, "", "White", DialogFocusItem.Property.BlockRemotes ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("FuturisticCollarBlockRemotes"), 1200, 525, "White", "Gray");
			DrawButton(1125, 595, 64, 64, "", "White", DialogFocusItem.Property.OpenPermissionChastity ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("FuturisticCollarOpenPermissionChastity"), 1200, 625, "White", "Gray");
			DrawButton(1125, 695, 64, 64, "", "White", DialogFocusItem.Property.OpenPermissionArm ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("FuturisticCollarOpenPermissionArm"), 1200, 725, "White", "Gray");
			DrawButton(1125, 795, 64, 64, "", "White", DialogFocusItem.Property.OpenPermissionLeg ? "Icons/Checked.png" : "");
			DrawText(DialogFindPlayer("FuturisticCollarOpenPermissionLeg"), 1200, 825, "White", "Gray");

			MainCanvas.textAlign = "center";

			ElementPosition("FutureCollarPasswordField", 3050, 750, 400); // Hide it off the canvas
			ElementPosition("FutureCollarTimeField", 3050, 805, 400);
		} else if (FuturisticCollarPage == 1 || FuturisticCollarPage == 2) {
			var FuturisticCollarStatus = "NoItems";
			var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);
			var FuturisticCollarItemsUnlockable = InventoryItemNeckFuturisticCollarGetItems(C, true);
			var lockedItems = 0;
			for (let I = 0; I < FuturisticCollarItems.length; I++) {
				if (InventoryGetLock(FuturisticCollarItems[I])) {
					lockedItems += 1;
				}
			}
			if (FuturisticCollarItems.length > 0) {
				if (lockedItems == 0) FuturisticCollarStatus = "NoLocks";
				else if (lockedItems < FuturisticCollarItems.length) FuturisticCollarStatus = "PartialLocks";
				else if (lockedItems == FuturisticCollarItems.length) FuturisticCollarStatus = "FullyLocked";
			}

			DrawText(DialogFindPlayer("FuturisticCollarOptions" + FuturisticCollarStatus), 1500, 380, "White", "Gray");

			if (FuturisticCollarItems.length > 0 && lockedItems < FuturisticCollarItems.length) {
				if (FuturisticCollarPage == 1) {
					DrawButton(1250, 410, 200, 55, DialogFindPlayer("FuturisticCollarLockMetal"), InventoryItemNeckFuturisticCollarCanLock(C, "MetalPadlock") ? "White" : "Pink");
					DrawButton(1550, 410, 200, 55, DialogFindPlayer("FuturisticCollarLockExclusive"), InventoryItemNeckFuturisticCollarCanLock(C, "ExclusivePadlock") ? "White" : "Pink");
					DrawButton(1250, 470, 200, 55, DialogFindPlayer("FuturisticCollarLockIntricate"), InventoryItemNeckFuturisticCollarCanLock(C, "IntricatePadlock") ? "White" : "Pink");
					DrawButton(1550, 470, 200, 55, DialogFindPlayer("FuturisticCollarLockHighSec"), InventoryItemNeckFuturisticCollarCanLock(C, "HighSecurityPadlock") ? "White" : "Pink");
					DrawButton(1250, 530, 200, 55, DialogFindPlayer("FuturisticCollarLockTimer"), InventoryItemNeckFuturisticCollarCanLock(C, "TimerPadlock") ? "White" : "Pink");
					DrawButton(1550, 530, 200, 55, DialogFindPlayer("FuturisticCollarLockMistress"), InventoryItemNeckFuturisticCollarCanLock(C, "MistressPadlock") ? "White" : "Pink");
					DrawButton(1250, 590, 200, 55, DialogFindPlayer("FuturisticCollarLockLover"), InventoryItemNeckFuturisticCollarCanLock(C, "LoversPadlock") ? "White" : "Pink");
					DrawButton(1550, 590, 200, 55, DialogFindPlayer("FuturisticCollarLockOwner"), InventoryItemNeckFuturisticCollarCanLock(C, "OwnerPadlock") ? "White" : "Pink");
					DrawButton(1250, 650, 200, 55, DialogFindPlayer("FuturisticCollarLockPandora"), InventoryItemNeckFuturisticCollarCanLock(C, "PandoraPadlock") ? "White" : "Pink");
					DrawButton(1550, 650, 200, 55, DialogFindPlayer("FuturisticCollarLockCombination"), InventoryItemNeckFuturisticCollarCanLock(C, "CombinationPadlock") ? "White" : "Pink");
					DrawButton(1250, 710, 200, 55, DialogFindPlayer("FuturisticCollarLockPassword"), InventoryItemNeckFuturisticCollarCanLock(C, "PasswordPadlock") ? "White" : "Pink");
					DrawButton(1550, 710, 200, 55, DialogFindPlayer("FuturisticCollarLockSafeword"), InventoryItemNeckFuturisticCollarCanLock(C, "SafewordPadlock") ? "White" : "Pink");

					ElementPosition("FutureCollarTimeField", 3050, 805, 400);
				} else {
					DrawButton(1250, 410, 200, 55, DialogFindPlayer("FuturisticCollarLockTimerMiss"), InventoryItemNeckFuturisticCollarCanLock(C, "MistressTimerPadlock") ? "White" : "Pink");
					DrawButton(1550, 410, 200, 55, DialogFindPlayer("FuturisticCollarLockTimerPassword"), InventoryItemNeckFuturisticCollarCanLock(C, "TimerPasswordPadlock") ? "White" : "Pink");
					DrawButton(1250, 470, 200, 55, DialogFindPlayer("FuturisticCollarLockTimerLovers"), InventoryItemNeckFuturisticCollarCanLock(C, "LoversTimerPadlock") ? "White" : "Pink");
					DrawButton(1550, 470, 200, 55, DialogFindPlayer("FuturisticCollarLockTimerOwner"), InventoryItemNeckFuturisticCollarCanLock(C, "OwnerTimerPadlock") ? "White" : "Pink");

					DrawText(DialogFindPlayer("FuturisticCollarTime"), 1250, 710, "White", "Gray");
					ElementPosition("FutureCollarTimeField", 1650, 705, 400);
				}
			} else {
				ElementPosition("FutureCollarTimeField", 3050, 805, 400);
				ElementPosition("FutureCollarPasswordField", 3050, 750, 400); // Hide it off the canvas
			}

			let drawCode = false;
			if (FuturisticCollarItemsUnlockable.length > 0) {
				DrawButton(1400, 850, 200, 55, DialogFindPlayer("FuturisticCollarUnlock"), "White");
				drawCode = true;
			}
			if (FuturisticCollarItems.length > 0 && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) {
				DrawButton(1400, 910, 200, 55, DialogFindPlayer("FuturisticCollarColor"), "White");
				drawCode = true;
			}
			if (drawCode) {
				DrawText(DialogFindPlayer("FuturisticCollarPassword"), 1350, 810, "White", "Gray");
				ElementPosition("FutureCollarPasswordField", 1650, 805, 400);
			} else {
				ElementPosition("FutureCollarPasswordField", 3050, 750, 400); // Hide it off the canvas
			}
		}

		// Draw the back/next button
		const currPage = FuturisticCollarPage + 1;
		const totalPages = FuturisticCollarMaxPage + 1;
		DrawBackNextButton(1675, 240, 300, 90, DialogFindPlayer("Page") + " " + currPage.toString() + " / " + totalPages.toString(), "White", "", () => "", () => "");
	}
}

function InventoryItemNeckFuturisticCollarExit() {
	ElementRemove("FutureCollarPasswordField");
	ElementRemove("FutureCollarTimeField");
	InventoryItemFuturisticExitAccessDenied();
}

// Catches the item extension clicks
function InventoryItemNeckFuturisticCollarClick() {

	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	} else {

		var CollarAction = 0; // 0 - nothing, 1 - Lock, 2 - Unlock, 3 - Color

		if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) InventoryItemNeckFuturisticCollarExit();
		else if (FuturisticCollarPage == 0) {


			if (MouseIn(1125, 395, 64, 64) && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) InventoryItemNeckFuturisticCollarTogglePermission(C, DialogFocusItem, "Collar");
			else if (MouseIn(1125, 495, 64, 64) && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) InventoryItemNeckFuturisticCollarToggleRemotes(C, DialogFocusItem);
			else if (MouseIn(1125, 595, 64, 64) && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) InventoryItemNeckFuturisticCollarTogglePermission(C, DialogFocusItem, "Chastity");
			else if (MouseIn(1125, 695, 64, 64) && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) InventoryItemNeckFuturisticCollarTogglePermission(C, DialogFocusItem, "Arm");
			else if (MouseIn(1125, 795, 64, 64) && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) InventoryItemNeckFuturisticCollarTogglePermission(C, DialogFocusItem, "Leg");
		} else if (FuturisticCollarPage == 1 || FuturisticCollarPage == 2) {
			{
				var FuturisticCollarItems = InventoryItemNeckFuturisticCollarGetItems(C);
				var FuturisticCollarItemsUnlockable = InventoryItemNeckFuturisticCollarGetItems(C, true);
				var lockedItems = 0;
				for (let I = 0; I < FuturisticCollarItems.length; I++) {
					if (InventoryGetLock(FuturisticCollarItems[I])) {
						lockedItems += 1;
					}
				}

				if (FuturisticCollarItems.length > 0 ) {

					if (lockedItems < FuturisticCollarItems.length) {
						if (FuturisticCollarPage == 1) {
							if (MouseIn(1250, 410, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "MetalPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "MetalPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 410, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "ExclusivePadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "ExclusivePadlock"); CollarAction = 1;}
							if (MouseIn(1250, 470, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "IntricatePadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "IntricatePadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 470, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "HighSecurityPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "HighSecurityPadlock"); CollarAction = 1;}
							else if (MouseIn(1250, 530, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "TimerPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "TimerPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 530, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "MistressPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "MistressPadlock"); CollarAction = 1;}
							else if (MouseIn(1250, 590, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "LoversPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "LoversPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 590, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "OwnerPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "OwnerPadlock"); CollarAction = 1;}
							else if (MouseIn(1250, 650, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "PandoraPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "PandoraPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 650, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "CombinationPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "CombinationPadlock"); CollarAction = 1;}
							else if (MouseIn(1250, 710, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "PasswordPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "PasswordPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 710, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "SafewordPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "SafewordPadlock"); CollarAction = 1;}
						} else {
							if (MouseIn(1250, 410, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "MistressTimerPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "MistressTimerPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 410, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "TimerPasswordPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "TimerPasswordPadlock"); CollarAction = 1;}
							if (MouseIn(1250, 470, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "LoversTimerPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "LoversTimerPadlock"); CollarAction = 1;}
							else if (MouseIn(1550, 470, 200, 55) && InventoryItemNeckFuturisticCollarCanLock(C, "OwnerTimerPadlock")) { InventoryItemNeckFuturisticCollarLockdown(C, "OwnerTimerPadlock"); CollarAction = 1;}
						}
					}
				}
				if (MouseIn(1400, 850, 200, 55) && FuturisticCollarItemsUnlockable.length > 0) { InventoryItemNeckFuturisticCollarUnlock(C); CollarAction = 2;}
				if (MouseIn(1400, 910, 200, 55) && FuturisticCollarItems.length > 0 && DialogFocusItem && !(DialogFocusItem && DialogFocusItem.Property && DialogFocusItem.Property.LockedBy && !DialogCanUnlock(C, DialogFocusItem))) {
					InventoryItemNeckFuturisticCollarColor(C, DialogFocusItem); CollarAction = 3;
				}

			}
		}
		if (CollarAction > 0) InventoryItemNeckFuturisticCollarExit();

		// Pagination buttons
		if (MouseIn(1675, 240, 150, 90) && FuturisticCollarPage > 0) {
			FuturisticCollarPage = FuturisticCollarPage - 1;
		}
		else if (MouseIn(1825, 240, 150, 90) && FuturisticCollarPage < FuturisticCollarMaxPage) {
			FuturisticCollarPage = FuturisticCollarPage + 1;
		}
	}
}

function InventoryItemNeckFuturisticCollarCanLock(C, LockType) {
	//InventoryAvailable(Player, LockType, "ItemMisc");
	var LockItem = null;
	// First, we check if the inventory already exists, exit if it's the case
	for (let I = 0; I < Player.Inventory.length; I++)
		if ((Player.Inventory[I].Name == LockType) && (Player.Inventory[I].Group == "ItemMisc")) {
			LockItem = Player.Inventory[I];
			break;
		}
	// Next we check if the target player has it, but not for the mistress, owner, or lover locks
	if (LockItem == null && LockType != "MistressPadlock" && LockType != "LoversPadlock" && LockType != "OwnerPadlock") {
		for (let I = 0; I < C.Inventory.length; I++) {
			if ((C.Inventory[I].Name == LockType) && (C.Inventory[I].Group == "ItemMisc")) {
				LockItem = C.Inventory[I];
				break;
			}
		}
	}



	if (LockItem && !(InventoryBlockedOrLimited(C, LockItem))) {



		// Make sure we do not add owner/lover only items for invalid characters, owner/lover locks can be applied on the player by the player for self-bondage
		if (LockItem.Asset.OwnerOnly && !C.IsOwnedByPlayer())
			if ((C.ID != 0) || ((C.Owner == "") && (C.Ownership == null)) || ((C.ID == 0) && LogQuery("BlockOwnerLockSelf", "OwnerRule")))
				return false;
		if (LockItem.Asset.LoverOnly && !C.IsLoverOfPlayer())
			if ((C.ID != 0) || (C.Lovership.length == 0) || ((C.ID == 0) && C.GetLoversNumbers(true).length == 0))
				return false;

		if (LockItem.Asset.Name == "TimerPasswordPadlock" || LockItem.Asset.Name == "MistressTimerPadlock" || LockItem.Asset.Name == "LoversTimerPadlock" || LockItem.Asset.Name == "OwnerTimerPadlock") {
			if (!(parseInt(ElementValue("FutureCollarTimeField")) > 0)) return false;
		}

		if (LockItem.Asset.Name == "CombinationPadlock" && !ValidationCombinationNumberRegex.test(ElementValue("FutureCollarPasswordField"))) return false;
		if (LockItem.Asset.Name == "TimerPasswordPadlock" && !ValidationPasswordRegex.test(ElementValue("FutureCollarPasswordField").toUpperCase())) return false;
		if (LockItem.Asset.Name == "PasswordPadlock" && !ValidationPasswordRegex.test(ElementValue("FutureCollarPasswordField").toUpperCase())) return false;
		if (LockItem.Asset.Name == "SafewordPadlock" && !ValidationPasswordRegex.test(ElementValue("FutureCollarPasswordField").toUpperCase())) return false;
		return true;
	}
	return false;
}

function InventoryItemNeckFuturisticCollarGetItems(C, OnlyUnlockable) {
	var ItemList = [];

	for (let E = C.Appearance.length - 1; E >= 0; E--)
		if (((C.Appearance[E].Asset.Name.indexOf("Futuristic") >= 0 || C.Appearance[E].Asset.Name.indexOf("Interactive") >= 0 || C.Appearance[E].Asset.Name.indexOf("Electronic") >= 0) && (!OnlyUnlockable || C.Appearance[E].Asset.Group.Name != "ItemNeck")) &&
			(C.Appearance[E].Asset.AllowLock)
			&& (!OnlyUnlockable || (InventoryGetLock(C.Appearance[E]) != null && InventoryItemHasEffect(C.Appearance[E], "Lock", true) && InventoryItemNeckFuturisticCollarCanUnlock(C, C.Appearance[E], InventoryGetLock(C.Appearance[E]), true)))) {
			ItemList.push(C.Appearance[E]);
		}

	return ItemList;
}

function InventoryItemNeckFuturisticCollarValidate(C, Item) {
	return InventoryItemFuturisticValidate(C, Item);
}

function InventoryItemNeckFuturisticCollarLockdown(C, LockType) {
	for (let E = C.Appearance.length - 1; E >= 0; E--)
		if (((C.Appearance[E].Asset.Name.indexOf("Futuristic") >= 0 || C.Appearance[E].Asset.Name.indexOf("Interactive") >= 0 || C.Appearance[E].Asset.Name.indexOf("Electronic") >= 0) &&
			(C.Appearance[E].Asset.AllowLock && InventoryGetLock(C.Appearance[E]) == null))) {
			InventoryLock(C, C.Appearance[E], LockType, Player.MemberNumber);
			let LockItem = InventoryGetLock(C.Appearance[E]);
			let Item = C.Appearance[E];

			if (LockItem.Asset.Name == "TimerPasswordPadlock" || LockItem.Asset.Name == "MistressTimerPadlock" || LockItem.Asset.Name == "LoversTimerPadlock" || LockItem.Asset.Name == "OwnerTimerPadlock") {
				if (parseInt(ElementValue("FutureCollarTimeField")) > 0) {
					if (!Item.Property) Item.Property = {};
					let Property = Item.Property;
					if (Property.RemoveItem == null) Property.RemoveItem = false;
					if (Property.ShowTimer == null) Property.ShowTimer = true;
					if (Property.EnableRandomInput == null) Property.EnableRandomInput = false;
					if (Property.MemberNumberList == null) Property.MemberNumberList = [];
					let maxTimer = LockItem.Asset.MaxTimer ? LockItem.Asset.MaxTimer/60 : 5;
					Property.RemoveTimer = CurrentTime + 60000*Math.max(1, Math.min(maxTimer, parseInt(ElementValue("FutureCollarTimeField"))));
				}
			}

			if (LockItem.Asset.Name == "CombinationPadlock") {
				Item.Property.CombinationNumber = ElementValue("FutureCollarPasswordField");
			} else if (LockItem.Asset.Name == "TimerPasswordPadlock" || LockItem.Asset.Name == "PasswordPadlock" || LockItem.Asset.Name == "SafewordPadlock") {
				if (!Item.Property) Item.Property = {};
				Item.Property.Password = ElementValue("FutureCollarPasswordField").toUpperCase();
				Item.Property.Hint = "~Locked by " + Player.Name;
				Item.Property.LockSet = true;
				if (LockItem.Asset.Name == "SafewordPadlock") Item.Property.RemoveOnUnlock = true;
				else Item.Property.RemoveOnUnlock = false;
			}
		}

	ChatRoomCharacterUpdate(C);
	CharacterRefresh(C, true);



	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		];

		ServerSend("ChatRoomChat", { Content: "FuturisticCollarTriggerLockdown", Type: "Action", Dictionary });
	}
}

function InventoryItemNeckFuturisticCollarCanUnlock(C, Item, LockItem, Attempt) {
	if (LockItem.Asset.Name == "CombinationPadlock")
		return Attempt || (Item.Property && Item.Property.CombinationNumber == ElementValue("FutureCollarPasswordField"));
	if (LockItem.Asset.Name == "TimerPasswordPadlock" || LockItem.Asset.Name == "PasswordPadlock" || LockItem.Asset.Name == "SafewordPadlock")
		return Attempt || (Item.Property && Item.Property.Password == ElementValue("FutureCollarPasswordField").toUpperCase());

	return DialogCanUnlock(C, Item);
}

function InventoryItemNeckFuturisticCollarUnlock(C) {
	for (let E = C.Appearance.length - 1; E >= 0; E--)
		if (((C.Appearance[E].Asset.Name.indexOf("Futuristic") >= 0 || C.Appearance[E].Asset.Name.indexOf("Interactive") >= 0 || C.Appearance[E].Asset.Name.indexOf("Electronic") >= 0) && C.Appearance[E].Asset.Group.Name != "ItemNeck") &&
			(InventoryGetLock(C.Appearance[E]) != null && InventoryItemHasEffect(C.Appearance[E], "Lock", true) && InventoryItemNeckFuturisticCollarCanUnlock(C, C.Appearance[E], InventoryGetLock(C.Appearance[E]), false))) {
			InventoryUnlock(C, C.Appearance[E]);
		}

	ChatRoomCharacterUpdate(C);
	CharacterRefresh(C, true);

	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		];

		ServerSend("ChatRoomChat", { Content: "FuturisticCollarTriggerUnlock", Type: "Action", Dictionary });
	}

}

function InventoryItemNeckFuturisticCollarColor(C, Item) {
	for (let E = C.Appearance.length - 1; E >= 0; E--)
		if (C.Appearance[E].Asset && C.Appearance[E].Asset.FuturisticRecolor && C.Appearance[E].Asset.Group.Name != "ItemNeck") {

			if (C.Appearance[E].Asset.Layer.length > 1 && typeof C.Appearance[E].Color === "string") {
				let color = C.Appearance[E].Color;
				C.Appearance[E].Color = [];
				for (let L = C.Appearance[E].Asset.Layer.length - 1; L >= 0; L--) {
					C.Appearance[E].Color.push(color);
				}
			}

			for (let L = C.Appearance[E].Asset.Layer.length - 1; L >= 0; L--) {

				if (C.Appearance[E].Asset.Layer[L].Name != "Light" && C.Appearance[E].Asset.Layer[L].Name != "Shine") {
					if (!C.Appearance[E].Asset.Layer[L].Name) {
						if (Item.Color[3] != "Default")
							C.Appearance[E].Color = (C.Appearance[E].Asset.FuturisticRecolorDisplay) ? Item.Color[0] : Item.Color[3];
					} else if (C.Appearance[E].Asset.Layer[L].Name == "Lock") {
						if (Item.Color[3] != "Default")
							C.Appearance[E].Color[L] = Item.Color[3];
					} else if (C.Appearance[E].Asset.Layer[L].Name == "Display" || C.Appearance[E].Asset.Layer[L].Name == "Screen" || C.Appearance[E].Asset.Layer[L].Name == "Ball") {
						if (Item.Color[0] != "Default")
							C.Appearance[E].Color[L] = Item.Color[0];
					} else if (C.Appearance[E].Asset.Layer[L].Name != "Mesh" && C.Appearance[E].Asset.Layer[L].Name != "Text") {
						if (Item.Color[1] != "Default")
							C.Appearance[E].Color[L] = Item.Color[1];
					} else if (C.Appearance[E].Asset.Layer[L].Name != "Text") {
						if (Item.Color[2] != "Default")
							C.Appearance[E].Color[L] = Item.Color[2];
					}
				}
			}
		}

	ChatRoomCharacterUpdate(C);
	CharacterRefresh(C, true);

	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		];

		ServerSend("ChatRoomChat", { Content: "FuturisticCollarTriggerColor", Type: "Action", Dictionary });
	}

}

function InventoryItemNeckFuturisticCollarTogglePermission(C, Item, Permission) {
	if (Item.Property && Item.Property.OpenPermission != null) {
		let property = "OpenPermission";
		switch (Permission) {
			case "Leg": property += "Leg"; break;
			case "Arm": property += "Arm"; break;
			case "Chastity": property += "Chastity"; break;
		}
		if (Item.Property && Item.Property[property] != undefined) {
			Item.Property[property] = !Item.Property[property];

			ChatRoomCharacterUpdate(C);
			CharacterRefresh(C, true);

			if (CurrentScreen == "ChatRoom") {
				var Message = "FuturisticCollarSetOpenPermission" + Permission + (Item.Property[property] ? "On" : "Off");

				var Dictionary = [
					{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
					{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
				];

				ServerSend("ChatRoomChat", { Content: Message, Type: "Action", Dictionary });
			}
		}
	}
}

function InventoryItemNeckFuturisticCollarToggleRemotes(C, Item) {
	if (Item.Property && Item.Property.BlockRemotes != null) {
		Item.Property.BlockRemotes = !Item.Property.BlockRemotes;

		// Default the previous Property and Type to the first option if not found on the current item
		var PreviousProperty = DialogFocusItem.Property;

		// Create a new Property object based on the previous one
		var NewProperty = Object.assign({}, PreviousProperty);


		NewProperty.Effect = [];

		// If the item is locked, ensure it has the "Lock" effect
		if (NewProperty.LockedBy && !(NewProperty.Effect || []).includes("Lock")) {
			NewProperty.Effect = (NewProperty.Effect || []);
			NewProperty.Effect.push("Lock");
		}

		// If the item is locked, ensure it has the "Lock" effect
		if (Item.Property.BlockRemotes) {
			NewProperty.Effect = (NewProperty.Effect || []);
			NewProperty.Effect.push("BlockRemotes");
		}

		DialogFocusItem.Property = NewProperty;


		ChatRoomCharacterUpdate(C);
		CharacterRefresh(C, true);

		if (CurrentScreen == "ChatRoom") {
			var Message = "FuturisticCollarSetBlockRemotes" + (Item.Property.BlockRemotes ? "On" : "Off");

			var Dictionary = [
				{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
				{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			];

			ServerSend("ChatRoomChat", { Content: Message, Type: "Action", Dictionary });
		}
	}
}
