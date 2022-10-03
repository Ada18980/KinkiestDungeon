"use strict";

// Loads the item extension properties
function InventoryItemButtInflVibeButtPlugLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { InflateLevel: 0 };
	if (DialogFocusItem.Property.InflateLevel == null) DialogFocusItem.Property.InflateLevel = 0;
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Intensity: -1 };
	if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = -1;
}

// Draw the item extension screen
function InventoryItemButtInflVibeButtPlugDraw() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset, {Vibrating: DialogFocusItem.Property.Intensity >= 0});
	const {InflateLevel, Intensity} = DialogFocusItem.Property;

	DrawText(DialogFindPlayer("InflateLevel" + DialogFocusItem.Property.InflateLevel.toString()), 1500, 750, "White", "Gray");
	if (InflateLevel !== 0) DrawButton(1200, 775, 200, 55, DialogFindPlayer("Empty"), "White");
	if (InflateLevel !== 1) DrawButton(1550, 775, 200, 55, DialogFindPlayer("Light"), "White");
	if (InflateLevel !== 2) DrawButton(1200, 835, 200, 55, DialogFindPlayer("Inflated"), "White");
	if (InflateLevel !== 3) DrawButton(1550, 835, 200, 55, DialogFindPlayer("Bloated"), "White");
	if (InflateLevel !== 4) DrawButton(1375, 895, 200, 55, DialogFindPlayer("Maximum"), "White");
	DrawText(DialogFindPlayer("Intensity" + DialogFocusItem.Property.Intensity.toString()), 1500, 525, "White", "Gray");
	if (Intensity !== -1) DrawButton(1200, 550, 200, 55, DialogFindPlayer("TurnOff"), "White");
	if (Intensity !== 0) DrawButton(1550, 550, 200, 55, DialogFindPlayer("Low"), "White");
	if (Intensity !== 1) DrawButton(1200, 610, 200, 55, DialogFindPlayer("Medium"), "White");
	if (Intensity !== 2) DrawButton(1550, 610, 200, 55, DialogFindPlayer("High"), "White");
	if (Intensity !== 3) DrawButton(1375, 670, 200, 55, DialogFindPlayer("Maximum"), "White");
}

// Catches the item extension clicks
function InventoryItemButtInflVibeButtPlugClick(actionPrefix) {
	actionPrefix = actionPrefix || "InflVibeButtPlug";
	if (MouseIn(1885, 25, 90, 90)) DialogFocusItem = null;
	else if (MouseIn(1200, 775, 200, 55) && (DialogFocusItem.Property.InflateLevel !== 0)) InventoryItemButtInflVibeButtPlugInflation(0 - DialogFocusItem.Property.InflateLevel, actionPrefix);
	else if (MouseIn(1550, 775, 200, 55) && (DialogFocusItem.Property.InflateLevel !== 1)) InventoryItemButtInflVibeButtPlugInflation(1 - DialogFocusItem.Property.InflateLevel, actionPrefix);
	else if (MouseIn(1200, 835, 200, 55) && (DialogFocusItem.Property.InflateLevel !== 2)) InventoryItemButtInflVibeButtPlugInflation(2 - DialogFocusItem.Property.InflateLevel, actionPrefix);
	else if (MouseIn(1550, 835, 200, 55) && (DialogFocusItem.Property.InflateLevel !== 3)) InventoryItemButtInflVibeButtPlugInflation(3 - DialogFocusItem.Property.InflateLevel, actionPrefix);
	else if (MouseIn(1375, 895, 200, 55) && (DialogFocusItem.Property.InflateLevel !== 4)) InventoryItemButtInflVibeButtPlugInflation(4 - DialogFocusItem.Property.InflateLevel, actionPrefix);
	else if (MouseIn(1200, 550, 200, 55) && (DialogFocusItem.Property.Intensity !== -1)) InventoryItemButtInflVibeButtPlugSetIntensity(-1 - DialogFocusItem.Property.Intensity, actionPrefix);
	else if (MouseIn(1550, 550, 200, 55) && (DialogFocusItem.Property.Intensity !== 0)) InventoryItemButtInflVibeButtPlugSetIntensity(0 - DialogFocusItem.Property.Intensity, actionPrefix);
	else if (MouseIn(1200, 610, 200, 55) && (DialogFocusItem.Property.Intensity !== 1)) InventoryItemButtInflVibeButtPlugSetIntensity(1 - DialogFocusItem.Property.Intensity, actionPrefix);
	else if (MouseIn(1550, 610, 200, 55) && (DialogFocusItem.Property.Intensity !== 2)) InventoryItemButtInflVibeButtPlugSetIntensity(2 - DialogFocusItem.Property.Intensity, actionPrefix);
	else if (MouseIn(1375, 670, 200, 55) && (DialogFocusItem.Property.Intensity !== 3)) InventoryItemButtInflVibeButtPlugSetIntensity(3 - DialogFocusItem.Property.Intensity, actionPrefix);
}

// Sets the inflatable vibe butt plug pump Level
function InventoryItemButtInflVibeButtPlugInflation(Modifier, actionPrefix) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	DialogFocusItem.Property.InflateLevel = DialogFocusItem.Property.InflateLevel + Modifier;
	if (C.ID == 0) ServerPlayerAppearanceSync();
	var Dictionary = [];
	Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber});
	Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
    ChatRoomPublishCustomAction(actionPrefix + "_Pump" + ((Modifier > 0) ? "pumps" : "deflates") + "To" + DialogFocusItem.Property.InflateLevel, true, Dictionary);

}

// Sets the inflatable vibe butt plug vibration Level
function InventoryItemButtInflVibeButtPlugSetIntensity(Modifier, actionPrefix) {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	DialogFocusItem.Property.Intensity = DialogFocusItem.Property.Intensity + Modifier;
	if (DialogFocusItem.Property.Intensity == -1) DialogFocusItem.Property.Effect = ["Egged"];
	if (DialogFocusItem.Property.Intensity >= 0) DialogFocusItem.Property.Effect = ["Egged", "Vibrating"];
	CharacterLoadEffect(C);
	if (C.ID == 0) ServerPlayerAppearanceSync();
	ChatRoomPublishCustomAction( actionPrefix + "_Vibe" + ((Modifier > 0) ? "Increase" : "Decrease") + "To" + DialogFocusItem.Property.Intensity, true, [{Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber}]);
}
