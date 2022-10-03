"use strict";

// Loads the item extension properties
function InventoryItemNeckAccessoriesCollarShockUnitLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Intensity: 0, ShowText: true };
	if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = 0;
	if (DialogFocusItem.Property.TriggerCount == null) DialogFocusItem.Property.TriggerCount = 0;
	if (DialogFocusItem.Property.ShowText == null) DialogFocusItem.Property.ShowText = true;
}

// Draw the item extension screen
function InventoryItemNeckAccessoriesCollarShockUnitDraw() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);
	DrawText(DialogFindPlayer("Intensity" + DialogFocusItem.Property.Intensity.toString()).replace("Item", DialogFocusItem.Asset.Description), 1500, 550, "White", "Gray");
	DrawText(DialogFindPlayer("ShockCount").replace("ShockCount", DialogFocusItem.Property.TriggerCount), 1500, 600, "White", "Gray");
	DrawButton(1200, 650, 200, 55, DialogFindPlayer("Low"), DialogFocusItem.Property.Intensity > 0 ? "White" : "Gray");
	DrawButton(1550, 650, 200, 55, DialogFindPlayer("Medium"), (DialogFocusItem.Property.Intensity < 1 || DialogFocusItem.Property.Intensity > 1) ? "White" : "Gray");
	DrawButton(1375, 710, 200, 55, DialogFindPlayer("High"), DialogFocusItem.Property.Intensity < 2 ? "White" : "Gray");
	if (CurrentScreen == "ChatRoom") DrawButton(1325, 800, 64, 64, "", "White", DialogFocusItem.Property.ShowText ? "Icons/Checked.png" : "");
	if (CurrentScreen == "ChatRoom") DrawText(DialogFindPlayer("ShockCollarShowChat"), 1570, 833, "White", "Gray");
	DrawButton(1250, 900, 200, 55, DialogFindPlayer("ResetShockCount"), Player.CanInteract() && DialogFocusItem.Property.TriggerCount > 0 ? "White" : "Gray");
	DrawButton(1500, 900, 200, 55, DialogFindPlayer("TriggerShock"), Player.CanInteract() ? "White" : "Gray");
}

// Catches the item extension clicks
function InventoryItemNeckAccessoriesCollarShockUnitClick() {
	if (MouseIn(1325, 800, 64, 64) && (CurrentScreen == "ChatRoom")) {
		DialogFocusItem.Property.ShowText = !DialogFocusItem.Property.ShowText;
		return;
	}

	if (MouseIn(1200, 650, 200, 55) && (DialogFocusItem.Property.Intensity > 0)) {
		InventoryItemNeckAccessoriesCollarShockUnitSetIntensity(0 - DialogFocusItem.Property.Intensity);
		return;
	}

	if (MouseIn(1550, 650, 200, 55) && (DialogFocusItem.Property.Intensity < 1 || DialogFocusItem.Property.Intensity > 1)) {
		InventoryItemNeckAccessoriesCollarShockUnitSetIntensity(1 - DialogFocusItem.Property.Intensity);
		return;
	}

	if (MouseIn(1375, 710, 200, 55) && (DialogFocusItem.Property.Intensity < 2)) {
		InventoryItemNeckAccessoriesCollarShockUnitSetIntensity(2 - DialogFocusItem.Property.Intensity);
		return;
	}

	if (Player.CanInteract() && MouseIn(1500, 900, 200, 55)) {
		InventoryItemNeckAccessoriesCollarShockUnitTrigger();
		return;
	}

	if (Player.CanInteract() && DialogFocusItem.Property.TriggerCount > 0 && MouseIn(1250, 900, 200, 55)) {
		InventoryItemNeckAccessoriesCollarShockUnitResetCount();
		return;
	}

	if ((MouseX >= 1885) && (MouseX <= 1975) && (MouseY >= 25) && (MouseY <= 110)) DialogFocusItem = null;
}

// Resets the trigger count
function InventoryItemNeckAccessoriesCollarShockUnitResetCount() {
	// Gets the current item and character
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemNeckAccessoriesCollarShockUnitLoad();
	}

	DialogFocusItem.Property.TriggerCount = 0;

	var Dictionary = [];
	Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
	Dictionary.push({ Tag: "AssetName", AssetName: DialogFocusItem.Asset.Name });
	Dictionary.push({ AssetName: DialogFocusItem.Asset.Name });
	Dictionary.push({ AssetGroupName: DialogFocusItem.Asset.Group.Name });

	ChatRoomPublishCustomAction("ShockCountReset", false, Dictionary);

}

// Sets the shock collar intensity
function InventoryItemNeckAccessoriesCollarShockUnitSetIntensity(Modifier) {

	// Gets the current item and character
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemNeckAccessoriesCollarShockUnitLoad();
	}

	DialogFocusItem.Property.Intensity = DialogFocusItem.Property.Intensity + Modifier;
	if (DialogFocusItem.Property.ShowText) {
		var Dictionary = [];
		Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
		Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
		Dictionary.push({Tag: "AssetName", AssetName: DialogFocusItem.Asset.Name});
		ChatRoomPublishCustomAction("ShockCollarSet" + DialogFocusItem.Property.Intensity, true, Dictionary);
	}
	else
		DialogLeave();

}

// Trigger a shock from the dialog menu
function InventoryItemNeckAccessoriesCollarShockUnitTrigger() {
	// Gets the current item and character
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if ((CurrentScreen == "ChatRoom") || (DialogFocusItem == null)) {
		DialogFocusItem = InventoryGet(C, C.FocusGroup.Name);
		InventoryItemNeckAccessoriesCollarShockUnitLoad();
	}

	DialogFocusItem.Property.TriggerCount++;

	var Dictionary = [];
	Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
	Dictionary.push({ Tag: "AssetName", AssetName: DialogFocusItem.Asset.Name});
	Dictionary.push({ Tag: "ActivityName", Text: "ShockItem" });
	Dictionary.push({ Tag: "ActivityGroup", Text: DialogFocusItem.Asset.Group.Name });
	Dictionary.push({ ShockIntensity : DialogFocusItem.Property.Intensity * 1.5});
	Dictionary.push({ AssetName: DialogFocusItem.Asset.Name });
	Dictionary.push({ AssetGroupName: DialogFocusItem.Asset.Group.Name });

	ChatRoomPublishCustomAction("TriggerShock" + DialogFocusItem.Property.Intensity, false, Dictionary);

	if (C.ID == Player.ID) {
		// The Player shocks herself
		ActivityArousalItem(C, C, DialogFocusItem.Asset);
	}
	if (CurrentScreen == "ChatRoom")
		DialogLeave();

	InventoryShockExpression(C);
}

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemNeckAccessoriesCollarShockUnitBeforeDraw(data) {
	if (data.L === "_Light") {
		var persistentData = data.PersistentData();
		var property = data.Property || {};
		var Triggered = persistentData.LastTriggerCount < property.TriggerCount;
		var intensity = property.Intensity ? property.Intensity : 0;
		var wasBlinking = property.Type === "Blink";
		if (wasBlinking && Triggered) persistentData.DisplayCount++;
		if (persistentData.DisplayCount >= intensity * 1.5 + 3) {
			persistentData.DisplayCount = 0;
			persistentData.LastTriggerCount = property.TriggerCount;
		}
		return { Color: Triggered ? "#f00" : "#2f0" };
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNeckAccessoriesCollarShockUnitScriptDraw(data) {
	var persistentData = data.PersistentData();
	/** @type {ItemProperties} */
	var property = (data.Item.Property = data.Item.Property || {});
	if (typeof persistentData.ChangeTime !== "number") persistentData.ChangeTime = CommonTime() + 4000;
	if (typeof persistentData.DisplayCount !== "number") persistentData.DisplayCount = 0;
	if (typeof persistentData.LastTriggerCount !== "number") persistentData.LastTriggerCount = property.TriggerCount;


	var isTriggered = persistentData.LastTriggerCount < property.TriggerCount;
	var newlyTriggered = isTriggered && persistentData.DisplayCount == 0;
	if (newlyTriggered)
		persistentData.ChangeTime = Math.min(persistentData.ChangeTime, CommonTime());

	if (persistentData.ChangeTime < CommonTime()) {
		if (persistentData.LastTriggerCount > property.TriggerCount) persistentData.LastTriggerCount = 0;
		var wasBlinking = property.Type === "Blink";
		property.Type = wasBlinking && !newlyTriggered ? null : "Blink";
		var timeFactor = isTriggered ? 12 : 1;
		var timeToNextRefresh = (wasBlinking ? 4000 : 1000) / timeFactor;
		persistentData.ChangeTime = CommonTime() + timeToNextRefresh;
		AnimationRequestRefreshRate(data.C, (5000 / timeFactor) - timeToNextRefresh);
		AnimationRequestDraw(data.C);
	}
}

/**
 * @returns {[string, number]}
 */
function InventoryItemNeckAccessoriesCollarShockUnitDynamicAudio(data) {
	var Modifier = parseInt(data.Content.substr(data.Content.length - 1));
	if (isNaN(Modifier)) Modifier = 0;
	return ["Shocks", Modifier * 3];
}
