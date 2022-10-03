"use strict";
function InventoryItemPelvisSciFiPleasurePantiesLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	}
    else{
        if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Intensity: -1, ShockLevel: 0, ShowText: true, Effect: ["Egged"], LockButt: false, LockCrotch: false, Block: [], OrgasmLock: 0};
        if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = -1;
        if (DialogFocusItem.Property.ShockLevel == null) DialogFocusItem.Property.ShockLevel = 0;
        if (DialogFocusItem.Property.ShowText == null) DialogFocusItem.Property.ShowText = true;
        if (DialogFocusItem.Property.Effect == null) DialogFocusItem.Property.Effect = ["Egged"];
        if (DialogFocusItem.Property.LockButt == null) DialogFocusItem.Property.LockButt = false;
        if (DialogFocusItem.Property.LockCrotch == null) DialogFocusItem.Property.LockCrotch = false;
        if (DialogFocusItem.Property.Block == null) DialogFocusItem.Property.Block = [];
        if (DialogFocusItem.Property.OrgasmLock == null) DialogFocusItem.Property.OrgasmLock = 0;
    }
}

function InventoryItemPelvisSciFiPleasurePantiesDraw() {

	const Vibrating = DialogFocusItem.Property.Intensity >= 0;
	DrawAssetPreview(1387, 175, DialogFocusItem.Asset, {Vibrating});

    var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	}
    else if (DialogFocusItem && DialogFocusItem.Property) {

        DrawButton(1175, 580, 200, 55, DialogFind(Player, "TurnOff"), (DialogFocusItem.Property.Intensity == -1) ? "#888888" : "White");
        DrawButton(1400, 580, 200, 55, DialogFind(Player, "Low"), (DialogFocusItem.Property.Intensity == 0) ? "#888888" : "White");
        DrawButton(1625, 580, 200, 55, DialogFind(Player, "Medium"), (DialogFocusItem.Property.Intensity == 1) ? "#888888" : "White");
        DrawButton(1175, 650, 200, 55, DialogFind(Player, "High"), (DialogFocusItem.Property.Intensity == 2) ? "#888888" : "White");
		DrawButton(1400, 650, 200, 55, DialogFind(Player, "Maximum"), (DialogFocusItem.Property.Intensity == 3) ? "#888888" : "White");
        DrawButton(1150, 930, 200, 55, DialogFind(Player, "UnlockOrgasm"), (DialogFocusItem.Property.OrgasmLock == 0 || !DialogFocusItem.Property.OrgasmLock) ? "#888888" : "White");
        DrawButton(1400, 930, 200, 55, DialogFind(Player, "LockOrgasm"), (DialogFocusItem.Property.OrgasmLock == 1) ? "#888888" : "White");
        DrawButton(1650, 930, 200, 55, DialogFind(Player, "DenyOrgasm"), (DialogFocusItem.Property.OrgasmLock == 2) ? "#888888" : "White");

		DrawText(DialogFind(Player, "Intensity" + DialogFocusItem.Property.ShockLevel.toString()).replace("Item", DialogFocusItem.Asset.Description).replace("intensity", "Shock Intensity").replace("Vibe", "Shock Vibe"), 1500, 750, "White", "Gray");
        DrawButton(1175, 780, 200, 55, DialogFind(Player, "Low"), (DialogFocusItem.Property.ShockLevel == 0) ? "#888888" : "White");
        DrawButton(1400, 780, 200, 55, DialogFind(Player, "Medium"), (DialogFocusItem.Property.ShockLevel == 1) ? "#888888" : "White");
        DrawButton(1625, 780, 200, 55, DialogFind(Player, "High"), (DialogFocusItem.Property.ShockLevel == 2) ? "#888888" : "White");
        if (CurrentScreen == "ChatRoom") DrawButton(1175, 850, 64, 64, "", "White", DialogFocusItem.Property.ShowText ? "Icons/Checked.png" : "");
        if (CurrentScreen == "ChatRoom") DrawText(DialogFind(Player, "ShockCollarShowChat"), 1420, 880, "White", "Gray");
		DrawButton(1625, 850, 200, 55, DialogFind(Player, "TriggerShock"), (!Player.CanInteract()) ? "#888888" : "White");

		DrawButton(1550, 480, 250, 65, DialogFind(Player, DialogFocusItem.Property.LockButt ? "LoveChastityBeltUnlockButt" : "LoveChastityBeltLockButt"), "White");

		DrawButton(1200, 480, 250, 65, DialogFind(Player, DialogFocusItem.Property.LockCrotch ? "LoveChastityBeltUnlockClosed" : "LoveChastityBeltAddShield"), "White");
    }
}

function InventoryItemPelvisSciFiPleasurePantiesClick() {

	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	}
    else {

		if (MouseIn(1885, 25, 90, 85)) DialogFocusItem = null;
		if (MouseIn(1175, 580, 200, 55) && (DialogFocusItem.Property.Intensity != -1)) InventoryItemPelvisSciFiPleasurePantiesSetIntensity(-1 - DialogFocusItem.Property.Intensity);
		if (MouseIn(1400, 580, 200, 55) && (DialogFocusItem.Property.Intensity != 0)) InventoryItemPelvisSciFiPleasurePantiesSetIntensity(0 - DialogFocusItem.Property.Intensity);
		if (MouseIn(1625, 580, 200, 55) && (DialogFocusItem.Property.Intensity != 1)) InventoryItemPelvisSciFiPleasurePantiesSetIntensity(1 - DialogFocusItem.Property.Intensity);
		if (MouseIn(1175, 650, 200, 55) && (DialogFocusItem.Property.Intensity != 2)) InventoryItemPelvisSciFiPleasurePantiesSetIntensity(2 - DialogFocusItem.Property.Intensity);
		if (MouseIn(1400, 650, 200, 55) && (DialogFocusItem.Property.Intensity != 3)) InventoryItemPelvisSciFiPleasurePantiesSetIntensity(3 - DialogFocusItem.Property.Intensity);
		if (MouseIn(1150, 930, 200, 45) && (DialogFocusItem.Property.OrgasmLock != 0)) InventoryItemPelvisSciFiPleasurePantiesLockOrgasm(false, false);
		if (MouseIn(1400, 930, 200, 45) && (DialogFocusItem.Property.OrgasmLock != 1)) InventoryItemPelvisSciFiPleasurePantiesLockOrgasm(true, false);
		if (MouseIn(1650, 930, 200, 45) && (DialogFocusItem.Property.OrgasmLock != 2)) InventoryItemPelvisSciFiPleasurePantiesLockOrgasm(true, true);

		if (MouseIn(1175, 850, 64, 64) && (CurrentScreen == "ChatRoom")) {
			DialogFocusItem.Property.ShowText = !DialogFocusItem.Property.ShowText;
		}
		if (MouseIn(1175, 780, 200, 55) && (DialogFocusItem.Property.ShockLevel != 0)) InventoryItemPelvisSciFiPleasurePantiesSetShockLevel(0 - DialogFocusItem.Property.ShockLevel);
		if (MouseIn(1400, 780, 200, 55) && (DialogFocusItem.Property.ShockLevel != 1)) InventoryItemPelvisSciFiPleasurePantiesSetShockLevel(1 - DialogFocusItem.Property.ShockLevel);
		if (MouseIn(1625, 780, 200, 55) && (DialogFocusItem.Property.ShockLevel != 2)) InventoryItemPelvisSciFiPleasurePantiesSetShockLevel(2 - DialogFocusItem.Property.ShockLevel);
		if (Player.CanInteract() && MouseIn(1625, 850, 200, 55)) InventoryItemPelvisSciFiPleasurePantiesShockTrigger();

		if (MouseIn(1550, 480, 250, 65)) {
			DialogFocusItem.Property.LockButt = !DialogFocusItem.Property.LockButt;
			InventoryItemPelvisSciFiPleasurePantiesLockButt();
			CharacterRefresh(C);
            if (CharacterGetCurrent().ID == 0) ServerPlayerAppearanceSync();
            if (CurrentScreen == "ChatRoom") ChatRoomCharacterItemUpdate(C, "ItemPelvis");
			let Dictionary = [];
			Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
			ChatRoomPublishCustomAction("SciFiPleasurePantiesAction" + (DialogFocusItem.Property.LockButt ? "LockButt" : "UnlockButt"), true, Dictionary);
		}

		if (MouseIn(1200, 480, 250, 65)) {
			DialogFocusItem.Property.LockCrotch = !DialogFocusItem.Property.LockCrotch;
			InventoryItemPelvisSciFiPleasurePantiesLockCrotch();
			CharacterRefresh(C);
			if (CharacterGetCurrent().ID == 0) ServerPlayerAppearanceSync();
			if (CurrentScreen == "ChatRoom") ChatRoomCharacterItemUpdate(C, "ItemPelvis");
			let Dictionary = [];
			Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
			ChatRoomPublishCustomAction("SciFiPleasurePantiesAction" + (DialogFocusItem.Property.LockCrotch ? "AddShield" : "RemoveShield"), true, Dictionary);
		}
	}
}

function InventoryItemPelvisSciFiPleasurePantiesLockOrgasm(OrgasmLock, DenyMode) {
	let C = CharacterGetCurrent();

    if (OrgasmLock == true && !DialogFocusItem.Property.Effect.includes("DenialMode")) {
		DialogFocusItem.Property.Effect.push("DenialMode");
		DialogFocusItem.Property.OrgasmLock = 1;
	}
    else if (OrgasmLock == false && DialogFocusItem.Property.Effect.includes("DenialMode")) {
		DialogFocusItem.Property.OrgasmLock = 0;
        for (let E = 0; E < DialogFocusItem.Property.Effect.length; E++) {
            let Effect = DialogFocusItem.Property.Effect[E];
            if (Effect == "DenialMode") {
                DialogFocusItem.Property.Effect.splice(E, 1);
                E--;
            }
        }
	}
    if (DenyMode == true && !DialogFocusItem.Property.Effect.includes("RuinOrgasms")) {
		DialogFocusItem.Property.Effect.push("RuinOrgasms");
		DialogFocusItem.Property.OrgasmLock = 2;
	}
    else if (DenyMode == false && DialogFocusItem.Property.Effect.includes("RuinOrgasms")) {
		DialogFocusItem.Property.OrgasmLock = OrgasmLock ? 1 : 0;
        for (let E = 0; E < DialogFocusItem.Property.Effect.length; E++) {
            let Effect = DialogFocusItem.Property.Effect[E];
            if (Effect == "RuinOrgasms") {
                DialogFocusItem.Property.Effect.splice(E, 1);
                E--;
            }
        }
	}

	CharacterLoadEffect(C);
    if (C.ID == 0) ServerPlayerAppearanceSync();

	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
    ChatRoomPublishCustomAction("SciFiPleasurePantiesBeep" + ((OrgasmLock == true) ? ((DenyMode == true) ? "DenialModeActivate" :  "EdgeModeActivate") : "DenialModeDeactivate"), true, Dictionary);
}

function InventoryItemPelvisSciFiPleasurePantiesLockButt() {
	if (DialogFocusItem.Property.LockButt == true) DialogFocusItem.Property.Block.push("ItemButt");
    else {
        for (let E = 0; E < DialogFocusItem.Property.Block.length; E++) {
            if (DialogFocusItem.Property.Block[E] == "ItemButt") {
                DialogFocusItem.Property.Block.splice(E, 1);
                E--;
            }
        }
    }
}

function InventoryItemPelvisSciFiPleasurePantiesLockCrotch() {
	if (DialogFocusItem.Property.LockCrotch == true) DialogFocusItem.Property.Block.push("ItemVulva", "ItemVulvaPiercings");
    else {
        for (let E = 0; E < DialogFocusItem.Property.Block.length; E++) {
            if (DialogFocusItem.Property.Block[E] == "ItemVulva" || DialogFocusItem.Property.Block[E] == "ItemVulvaPiercings") {
                DialogFocusItem.Property.Block.splice(E, 1);
                E--;
            }
        }
    }
}

function InventoryItemPelvisSciFiPleasurePantiesSetIntensity(Modifier) {
	var C = CharacterGetCurrent();

	DialogFocusItem.Property.Intensity = DialogFocusItem.Property.Intensity + Modifier;

	if (DialogFocusItem.Property.Intensity == -1) {
        for (let E = 0; E < DialogFocusItem.Property.Effect.length; E++) {
            var Effect = DialogFocusItem.Property.Effect[E];
            if (Effect == "Vibrating") {
                DialogFocusItem.Property.Effect.splice(E, 1);
                E--;
            }
        }
	}
	if (DialogFocusItem.Property.Intensity > -1 && !DialogFocusItem.Property.Effect.includes("Vibrating")) DialogFocusItem.Property.Effect.push("Vibrating");

	CharacterLoadEffect(C);
	if (C.ID == 0) ServerPlayerAppearanceSync();

	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	ChatRoomPublishCustomAction("SciFiPleasurePantiesVibe" + ((Modifier > 0) ? "Increase" : "Decrease") + "To" + DialogFocusItem.Property.Intensity, true, Dictionary);
}

function InventoryItemPelvisSciFiPleasurePantiesSetShockLevel(Modifier) {

	// Gets the current item and character
	var C = CharacterGetCurrent();
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemPelvisSciFiPleasurePantiesLoad();
	}

	DialogFocusItem.Property.ShockLevel = DialogFocusItem.Property.ShockLevel + Modifier;
	if (DialogFocusItem.Property.ShowText && CurrentScreen == "ChatRoom") {
		var Dictionary = [];
		Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
		ChatRoomPublishCustomAction("SciFiPleasurePantiesShockSet" + DialogFocusItem.Property.ShockLevel, true, Dictionary);
	}
	else if (CurrentScreen == "ChatRoom")
        DialogFocusItem = null;

}

function InventoryItemPelvisSciFiPleasurePantiesShockTrigger() {
	// Gets the current item and character
	var C = CharacterGetCurrent();
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemPelvisSciFiPleasurePantiesLoad();
	}

	if (C.ID == Player.ID) {
		// The Player shocks herself
		ActivityArousalItem(C, C, DialogFocusItem.Asset);
	}

	var Dictionary = [];
	Dictionary.push({ Tag: "AssetName", Text: DialogFocusItem.Asset.Description.toLowerCase() });
	Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	Dictionary.push({ ShockIntensity : DialogFocusItem.Property.Intensity * 1.5});
    ChatRoomPublishCustomAction("SciFiPleasurePantiesShockTrigger" + DialogFocusItem.Property.ShockLevel, true, Dictionary);

	InventoryShockExpression(C);
}

function InventoryItemPelvisSciFiPleasurePantiesExit() {
	InventoryItemFuturisticExitAccessDenied();
}