"use strict";

// Loads the item extension properties
function InventoryItemVulvaClitAndDildoVibratorbeltLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Intensity: -1 };
	if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = -1;
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Intensity: -1 };
	if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = -1;
}

// Draw the item extension screen
function InventoryItemVulvaClitAndDildoVibratorbeltDraw() {
	const {Intensity} = DialogFocusItem.Property;
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset, {Vibrating: Intensity >= 0});
	DrawText(DialogFindPlayer("DildoIntensity" + Intensity.toString()), 1500, 750, "White", "Gray");
	if (Intensity !== -1) DrawButton(1200, 775, 200, 55, DialogFindPlayer("TurnOff"), "White");
	if (Intensity !== 0) DrawButton(1550, 775, 200, 55, DialogFindPlayer("Low"), "White");
	if (Intensity !== 1) DrawButton(1200, 835, 200, 55, DialogFindPlayer("Medium"), "White");
	if (Intensity !== 2) DrawButton(1550, 835, 200, 55, DialogFindPlayer("High"), "White");
	if (Intensity !== 3) DrawButton(1375, 895, 200, 55, DialogFindPlayer("Maximum"), "White");
	DrawText(DialogFindPlayer("EggIntensity" + Intensity.toString()), 1500, 525, "White", "Gray");
	if (Intensity !== -1) DrawButton(1200, 550, 200, 55, DialogFindPlayer("TurnOff"), "White");
	if (Intensity !== 0) DrawButton(1550, 550, 200, 55, DialogFindPlayer("Low"), "White");
	if (Intensity !== 1) DrawButton(1200, 610, 200, 55, DialogFindPlayer("Medium"), "White");
	if (Intensity !== 2) DrawButton(1550, 610, 200, 55, DialogFindPlayer("High"), "White");
	if (Intensity !== 3) DrawButton(1375, 670, 200, 55, DialogFindPlayer("Maximum"), "White");
}

// Catches the item extension clicks
function InventoryItemVulvaClitAndDildoVibratorbeltClick() {
	if (MouseIn(1885, 25, 90, 90)) DialogFocusItem = null;
	else if (MouseIn(1200, 775, 200, 55) && (DialogFocusItem.Property.Intensity !== -1)) InventoryItemVulvaClitAndDildoVibratorbeltIntensity(-1 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1550, 775, 200, 55) && (DialogFocusItem.Property.Intensity !== 0)) InventoryItemVulvaClitAndDildoVibratorbeltIntensity(0 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1200, 835, 200, 55) && (DialogFocusItem.Property.Intensity !== 1)) InventoryItemVulvaClitAndDildoVibratorbeltIntensity(1 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1550, 835, 200, 55) && (DialogFocusItem.Property.Intensity !== 2)) InventoryItemVulvaClitAndDildoVibratorbeltIntensity(2 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1375, 895, 200, 55) && (DialogFocusItem.Property.Intensity !== 3)) InventoryItemVulvaClitAndDildoVibratorbeltIntensity(3 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1200, 550, 200, 55) && (DialogFocusItem.Property.Intensity !== -1)) InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(-1 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1550, 550, 200, 55) && (DialogFocusItem.Property.Intensity !== 0)) InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(0 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1200, 610, 200, 55) && (DialogFocusItem.Property.Intensity !== 1)) InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(1 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1550, 610, 200, 55) && (DialogFocusItem.Property.Intensity !== 2)) InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(2 - DialogFocusItem.Property.Intensity);
	else if (MouseIn(1375, 670, 200, 55) && (DialogFocusItem.Property.Intensity !== 3)) InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(3 - DialogFocusItem.Property.Intensity);
}

// Sets the vibration Level on the dildo
function InventoryItemVulvaClitAndDildoVibratorbeltIntensity(Modifier) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	DialogFocusItem.Property.Intensity = DialogFocusItem.Property.Intensity + Modifier;
	if (DialogFocusItem.Property.Intensity == -1) DialogFocusItem.Property.Effect = ["Egged"];
	if (DialogFocusItem.Property.Intensity >= 0) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];

	// Adds the lock effect back if it was padlocked
	if ((DialogFocusItem.Property.LockedBy != null) && (DialogFocusItem.Property.LockedBy != "")) {
		if (DialogFocusItem.Property.Effect == null) DialogFocusItem.Property.Effect = [];
		DialogFocusItem.Property.Effect.push("Lock");
	}

	CharacterLoadEffect(C);
	if (C.ID == 0) ServerPlayerAppearanceSync();
	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
    ChatRoomPublishCustomAction("Dildo" + ((Modifier > 0) ? "Increase" : "Decrease") + "To" + DialogFocusItem.Property.Intensity, true, Dictionary);
}

// Sets the of the vibe egg
function InventoryItemVulvaClitAndDildoVibratorbeltSetIntensity(Modifier) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	DialogFocusItem.Property.Intensity = DialogFocusItem.Property.Intensity + Modifier;
	if (DialogFocusItem.Property.Intensity == -1) DialogFocusItem.Property.Effect = ["Egged"];
	if (DialogFocusItem.Property.Intensity == 0) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];
	if (DialogFocusItem.Property.Intensity == 1) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];
	if (DialogFocusItem.Property.Intensity == 2) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];
	if (DialogFocusItem.Property.Intensity == 3) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];

	// Adds the lock effect back if it was padlocked
	if ((DialogFocusItem.Property.LockedBy != null) && (DialogFocusItem.Property.LockedBy != "")) {
		if (DialogFocusItem.Property.Effect == null) DialogFocusItem.Property.Effect = [];
		DialogFocusItem.Property.Effect.push("Lock");
	}

	CharacterLoadEffect(C);
	if (C.ID == 0) ServerPlayerAppearanceSync();

	ChatRoomPublishCustomAction("Egg" + ((Modifier > 0) ? "Increase" : "Decrease") + "To" + DialogFocusItem.Property.Intensity, true, [{Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber}]);
}
