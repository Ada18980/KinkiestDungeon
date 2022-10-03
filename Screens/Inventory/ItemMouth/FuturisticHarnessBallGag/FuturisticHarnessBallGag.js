"use strict";

/** @type ExtendedItemOption[] */
var InventoryItemMouthFuturisticBallGagOptions = [
	{
		Name: "LightBall",
		Property: {
			Type: null,
			Effect: ["BlockMouth", "GagLight"],
		},
	},
	{
		Name: "Ball",
		Property: {
			Type: "Ball",
			Effect: ["BlockMouth", "GagMedium"],
		},
	},
	{
		Name: "Plug",
		Property: {
			Type: "Plug",
			Effect: ["BlockMouth", "GagTotal"],
		},
	},
];

/**
 * Loads the item extension properties
 * @returns {void} - Nothing
 */
function InventoryItemMouthFuturisticHarnessBallGagLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	} else {
		ExtendedItemLoad(InventoryItemMouthFuturisticBallGagOptions, "SelectGagType");
		if (DialogFocusItem.Property == null) DialogFocusItem.Property = { Type: null, Option: InventoryItemMouthFuturisticBallGagOptions[0],
			AutoPunish: 0, AutoPunishUndoTime: 300000 , OriginalSetting: "Padded", ChatMessage: true};
		if (DialogFocusItem.Property.AutoPunish == null) DialogFocusItem.Property.AutoPunish = 0;
		if (DialogFocusItem.Property.AutoPunishUndoTime == null) DialogFocusItem.Property.AutoPunishUndoTime = 0;
		if (DialogFocusItem.Property.AutoPunishUndoTimeSetting == null) DialogFocusItem.Property.AutoPunishUndoTimeSetting = 300000;
		if (DialogFocusItem.Property.OriginalSetting == null) DialogFocusItem.Property.OriginalSetting = null;
		if (DialogFocusItem.Property.ChatMessage == null) DialogFocusItem.Property.ChatMessage = true;
		if (DialogFocusItem.Property.BlinkState == null) DialogFocusItem.Property.BlinkState = 0;
	}
}

function InventoryItemMouthFuturisticHarnessBallGagExit() {
	InventoryItemMouthFuturisticPanelGagExit();
}

/**
* Draw the item extension screen
* @returns {void} - Nothing
*/
function InventoryItemMouthFuturisticHarnessBallGagDraw() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else {
		DrawAssetPreview(1387, 75, DialogFocusItem.Asset);

		if (DialogFocusItem.Property.AutoPunishUndoTime - CurrentTime > 0)
			DrawText(DialogFindPlayer("FuturisticPanelGagMouthDeflationTime") + " " + TimerToString(DialogFocusItem.Property.AutoPunishUndoTime - CurrentTime), 1500, 415, "White", "Gray");

		var type = "FuturisticPanelGagMouthType" + ((DialogFocusItem.Property.Type != null) ?
			((DialogFocusItem.Property.Type != "Ball") ? DialogFocusItem.Property.Type : "BallLarge")
			: "BallGag");
		DrawText(DialogFindPlayer("FuturisticPanelGagMouthTypeDesc") + " " +
			DialogFindPlayer(type), 1350, 475, "White", "Gray");

		MainCanvas.textAlign = "left";
		DrawCheckbox(1100, 890, 64, 64, "", DialogFocusItem.Property.ChatMessage, "White");
		DrawText(DialogFindPlayer("FuturisticPanelGagMouthButtonChatMessage"), 1200, 923, "White", "Gray");
		MainCanvas.textAlign = "center";

		var autopunish = "Off";
		if (DialogFocusItem.Property.AutoPunish == 0) {autopunish = "Off";}
		else if (DialogFocusItem.Property.AutoPunish == 1) {autopunish = "Low";}
		else if (DialogFocusItem.Property.AutoPunish == 2) {autopunish = "Medium";}
		else {autopunish = "Maximum";}

		DrawText(DialogFindPlayer("FuturisticPanelGagMouthButtonAutoPunish") + " " + autopunish, 1350, 683, "White", "Gray");
		if (DialogFocusItem) {
			if (DialogFocusItem.Property.Type != null) DrawButton(1250, 500, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthTypeBallGag"), "White", "");
			if (DialogFocusItem.Property.Type != "Ball") DrawButton(1100, 570, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthTypeBallLarge"), "White", "");
			if (DialogFocusItem.Property.Type != "Plug") DrawButton(1400, 570, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthTypePlug"), "White", "");

			if (DialogFocusItem.Property.AutoPunish != 0) DrawButton(1100, 707, 200, 64, DialogFindPlayer("TurnOff"), "White", "");
			if (DialogFocusItem.Property.AutoPunish != 1) DrawButton(1400, 707, 200, 64, DialogFindPlayer("Low"), "White", "");
			if (DialogFocusItem.Property.AutoPunish != 2) DrawButton(1100, 777, 200, 64, DialogFindPlayer("Medium"), "White", "");
			if (DialogFocusItem.Property.AutoPunish != 3) DrawButton(1400, 777, 200, 64, DialogFindPlayer("Maximum"), "White", "");

			DrawText(DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeSetting" + DialogFocusItem.Property.AutoPunishUndoTimeSetting), 1775, 475, "White", "Gray");
			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 120000) DrawButton(1675, 500, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButton120000"), "White", "");
			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 300000) DrawButton(1675, 570, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButton300000"), "White", "");
			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 900000) DrawButton(1675, 640, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButton900000"), "White", "");
			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 3600000) DrawButton(1675, 710, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButton3600000"), "White", "");
			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 72000000) DrawButton(1675, 780, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButton72000000"), "White", "");

			if (DialogFocusItem.Property.AutoPunishUndoTimeSetting) DrawButton(1675, 880, 200, 64, DialogFindPlayer("FuturisticPanelGagMouthDeflationTimeButtonPump"), "White", "");
		}

	}
}


/**
 * Catches the item extension clicks
 * @returns {void} - Nothing
 */
function InventoryItemMouthFuturisticHarnessBallGagClick() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticClickAccessDenied();
	} else {
		if (MouseIn(1885, 25, 90, 90)) InventoryItemMouthFuturisticPanelGagExit();

		else if (MouseIn(1100, 890, 64, 64)) DialogFocusItem.Property.ChatMessage = !DialogFocusItem.Property.ChatMessage;


		else if (DialogFocusItem.Property.Type != null && MouseIn(1250, 500, 200, 64)) {
			DialogFocusItem.Property.AutoPunishUndoTime = 0;
			DialogFocusItem.Property.OriginalSetting = "LightBall";
			ExtendedItemSetType(C, InventoryItemMouthFuturisticBallGagOptions, InventoryItemMouthFuturisticBallGagOptions[0]);}
		else if (DialogFocusItem.Property.Type != "Ball" && MouseIn(1100, 570, 200, 64)) {
			DialogFocusItem.Property.AutoPunishUndoTime = 0;
			DialogFocusItem.Property.OriginalSetting = "Ball";
			ExtendedItemSetType(C, InventoryItemMouthFuturisticBallGagOptions, InventoryItemMouthFuturisticBallGagOptions[1]);}
		else if (DialogFocusItem.Property.Type != "Plug" && MouseIn(1400, 570, 200, 64)) {
			DialogFocusItem.Property.AutoPunishUndoTime = 0;
			DialogFocusItem.Property.OriginalSetting = "Plug";
		ExtendedItemSetType(C, InventoryItemMouthFuturisticBallGagOptions, InventoryItemMouthFuturisticBallGagOptions[2]);}

		else if (DialogFocusItem.Property.AutoPunish != 0 && MouseIn(1100, 707, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunish(C, DialogFocusItem, 0);
		else if (DialogFocusItem.Property.AutoPunish != 1 && MouseIn(1400, 707, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunish(C, DialogFocusItem, 1);
		else if (DialogFocusItem.Property.AutoPunish != 2 && MouseIn(1100, 777, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunish(C, DialogFocusItem, 2);
		else if (DialogFocusItem.Property.AutoPunish != 3 && MouseIn(1400, 777, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunish(C, DialogFocusItem, 3);


		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 120000 && MouseIn(1675, 500, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunishTime(C, DialogFocusItem, 120000);
		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 300000 && MouseIn(1675, 570, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunishTime(C, DialogFocusItem, 300000);
		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 900000 && MouseIn(1675, 640, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunishTime(C, DialogFocusItem, 900000);
		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 3600000 && MouseIn(1675, 710, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunishTime(C, DialogFocusItem, 3600000);
		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting != 72000000 && MouseIn(1675, 780, 200, 64)) InventoryItemMouthFuturisticPanelGagSetAutoPunishTime(C, DialogFocusItem, 72000000);

		else if (DialogFocusItem.Property.AutoPunishUndoTimeSetting && MouseIn(1675, 880, 200, 64)) {
			InventoryItemMouthFuturisticPanelGagTrigger(C, DialogFocusItem, false, InventoryItemMouthFuturisticBallGagOptions);
			DialogFocusItem.Property.AutoPunishUndoTime = CurrentTime + DialogFocusItem.Property.AutoPunishUndoTimeSetting; // Reset the deflation time
			CharacterRefresh(C, true); // Does not sync appearance while in the wardrobe
			ChatRoomCharacterUpdate(C);
		}

	}
}

/**
 * Validates, if the chosen option is possible. Sets the global variable 'DialogExtendedMessage' to the appropriate error message, if not.
 * @param {Character} C - The character to validate the option for
 * @param {Item} Item - The equipped item
 * @returns {string} - Returns false and sets DialogExtendedMessage, if the chosen option is not possible.
 */
function InventoryItemMouthFuturisticHarnessBallGagValidate(C, Item) {
	return InventoryItemFuturisticValidate(C, Item) ;
}

/**
 * Publishes the message to the chat
 * @param {Character} C - The target character
 * @param {ExtendedItemOption} Option - The currently selected Option
 * @returns {void} - Nothing
 */
 function InventoryItemMouthFuturisticHarnessBallGagPublishAction(C, Option) {
	var msg = "FuturisticPanelGagMouthSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

/**
 * The NPC dialog is for what the NPC says to you when you make a change to their restraints - the dialog lookup is on a
 * per-NPC basis. You basically put the "AssetName" + OptionName in there to allow individual NPCs to override their default
 * "GroupName" dialog if for example we ever wanted an NPC to react specifically to having the restraint put on them.
 * That could be done by adding an "AssetName" entry (or entries) to that NPC's dialog CSV
 * @param {Character} C - The NPC to whom the restraint is applied
 * @param {ExtendedItemOption} Option - The chosen option for this extended item
 * @returns {void} - Nothing
 */
function InventoryItemMouthFuturisticHarnessBallGagNpcDialog(C, Option) {
	InventoryItemMouthFuturisticPanelGagNpcDialog(C, Option);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemMouthFuturisticHarnessBallGagScriptDraw(data) {
	var persistentData = data.PersistentData();
	/** @type {ItemProperties} */
	var property = (data.Item.Property = data.Item.Property || {});
	if (typeof persistentData.UpdateTime !== "number") persistentData.UpdateTime = CommonTime() + 4000;
	if (typeof persistentData.LastMessageLen !== "number") persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
	if (typeof property.BlinkState !== "number") property.BlinkState = 0;

	if (ChatRoomLastMessage && ChatRoomLastMessage.length != persistentData.LastMessageLen && data.Item && data.Item.Property && data.Item.Property.Sensitivity > 0)
		persistentData.ChangeTime = Math.min(persistentData.ChangeTime, CommonTime() + 400); // Trigger shortly after if the user speaks

	if (persistentData.UpdateTime < CommonTime() && data.C == Player) {
		if (CurrentScreen == "ChatRoom") {

			AssetsItemMouthFuturisticPanelGagScriptUpdatePlayer(data, InventoryItemMouthFuturisticBallGagOptions);

			persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
		}

		property.BlinkState = (property.BlinkState + 1) % 2;

		var timeToNextRefresh = 3025;
		persistentData.UpdateTime = CommonTime() + timeToNextRefresh;
		AnimationRequestRefreshRate(data.C, 5000 - timeToNextRefresh);
		AnimationRequestDraw(data.C);
	}
}


/** @type {DynamicBeforeDrawCallback} */
function AssetsItemMouthFuturisticHarnessBallGagBeforeDraw(data) {
	return AssetsItemMouthFuturisticPanelGagBeforeDraw(data);
}
