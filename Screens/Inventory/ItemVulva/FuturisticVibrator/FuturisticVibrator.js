"use strict";

var ItemVulvaFuturisticVibratorTriggers = ["Increase", "Decrease", "Disable", "Edge", "Random", "Deny", "Tease", "Shock"];
var ItemVulvaFuturisticVibratorTriggerValues = [];

const ItemVulvaFuturisticVibratorAccessMode = {
	EVERYONE: "",
	PROHIBIT_SELF: "ProhibitSelf",
	LOCK_MEMBER_ONLY: "LockMember",
}
const ItemVulvaFuturisticVibratorAccessModes = Object.values(ItemVulvaFuturisticVibratorAccessMode);

function InventoryItemVulvaFuturisticVibratorLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	} else {
		VibratorModeLoad([VibratorModeSet.ADVANCED, VibratorModeSet.STANDARD]);
		if ((DialogFocusItem != null) && (DialogFocusItem.Property != null) && (DialogFocusItem.Property.TriggerValues == null)) DialogFocusItem.Property.TriggerValues = CommonConvertArrayToString(ItemVulvaFuturisticVibratorTriggers);

		ItemVulvaFuturisticVibratorTriggerValues = DialogFocusItem.Property.TriggerValues.split(',');

		// Only create the inputs if the zone isn't blocked
		ItemVulvaFuturisticVibratorTriggers.forEach((trigger, i) => {
			const input = ElementCreateInput("FuturisticVibe" + trigger, "text", "", "12");
			if (input) input.setAttribute("placeholder", ItemVulvaFuturisticVibratorTriggerValues[i]);
		});
	}
}

function InventoryItemVulvaFuturisticVibratorDraw() {
	var C = CharacterGetCurrent();
	var Item = DialogFocusItem;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else {
		// Draw the preview & current mode
		DrawAssetPreview(1387, 50, DialogFocusItem.Asset);
		const mode = DialogFindPlayer((DialogFocusItem.Property.Mode && typeof DialogFocusItem.Property.Mode === "string" ) ? DialogFocusItem.Property.Mode : "Off");
		DrawText(`${DialogFindPlayer("CurrentMode")} ${mode}`, 1500, 375, "white", "gray");
		// Draw each of the triggers and position their inputs
		ItemVulvaFuturisticVibratorTriggers.forEach((trigger, i) => {
			MainCanvas.textAlign = "right";
			DrawText(DialogFindPlayer("FuturisticVibrator" + trigger), 1400, 450 + 60 * i, "white", "gray");
			MainCanvas.textAlign = "center";
			ElementPosition("FuturisticVibe" + trigger, 1650, 450 + 60 * i, 400);
		});
		// Draw the save button
		DrawButton(1525, 450 + 60 * ItemVulvaFuturisticVibratorTriggers.length, 350, 64, DialogFindPlayer("FuturisticVibratorSaveVoiceCommands"), "White", "");

		DrawBackNextButton(1100, 450 + 60 * ItemVulvaFuturisticVibratorTriggers.length, 350, 64, DialogFindPlayer("FuturisticVibratorPermissions" + (Item.Property.AccessMode || "")), "White", "",
			() => DialogFindPlayer("FuturisticVibratorPermissions" + InventoryItemVulvaFuturisticVibratorPreviousAccessMode(Item.Property.AccessMode || "")),
			() => DialogFindPlayer("FuturisticVibratorPermissions" + InventoryItemVulvaFuturisticVibratorNextAccessMode(Item.Property.AccessMode || "")));
	}
}

function InventoryItemVulvaFuturisticVibratorPreviousAccessMode(current) {
	return ItemVulvaFuturisticVibratorAccessModes[(ItemVulvaFuturisticVibratorAccessModes.indexOf(current) + ItemVulvaFuturisticVibratorAccessModes.length - 1) % ItemVulvaFuturisticVibratorAccessModes.length];
}

function InventoryItemVulvaFuturisticVibratorNextAccessMode(current) {
	return ItemVulvaFuturisticVibratorAccessModes[(ItemVulvaFuturisticVibratorAccessModes.indexOf(current) + 1) % ItemVulvaFuturisticVibratorAccessModes.length];
}

function InventoryItemVulvaFuturisticVibratorClick() {
	var C = CharacterGetCurrent();
	var Item = DialogFocusItem;
	if (InventoryItemFuturisticValidate(C) !== "") InventoryItemFuturisticClickAccessDenied();
	else if (MouseIn(1885, 25, 90, 90)) InventoryItemVulvaFuturisticVibratorExit();
	else if (MouseIn(1525, 450 + 60 * ItemVulvaFuturisticVibratorTriggers.length, 350, 64)) InventoryItemVulvaFuturisticVibratorClickSet();
	else if (MouseIn(1100, 450 + 60 * ItemVulvaFuturisticVibratorTriggers.length, 350, 64)) {
		if (MouseX < 1100 + (350 / 2)) {
			InventoryItemVulvaFuturisticVibratorSetAccessMode(C, Item, InventoryItemVulvaFuturisticVibratorPreviousAccessMode(Item.Property.AccessMode || ""));
		} else {
			InventoryItemVulvaFuturisticVibratorSetAccessMode(C, Item, InventoryItemVulvaFuturisticVibratorNextAccessMode(Item.Property.AccessMode || ""));
		}
	}
}


function InventoryItemVulvaFuturisticVibratorClickSet() {
	if ((DialogFocusItem != null) && (DialogFocusItem.Property != null)) {
		var ItemVulvaFuturisticVibratorTriggerValuesTemp = [];
		for (let I = 0; I < ItemVulvaFuturisticVibratorTriggers.length; I++) {
			ItemVulvaFuturisticVibratorTriggerValuesTemp.push((ElementValue("FuturisticVibe" + ItemVulvaFuturisticVibratorTriggers[I]) != "") ? ElementValue("FuturisticVibe" + ItemVulvaFuturisticVibratorTriggers[I])
				: ItemVulvaFuturisticVibratorTriggerValues[I]);
		}

		ItemVulvaFuturisticVibratorTriggerValues = ItemVulvaFuturisticVibratorTriggerValuesTemp;

		var temp = CommonConvertArrayToString(ItemVulvaFuturisticVibratorTriggerValues);

		if (temp != "" && typeof temp === "string") {
			DialogFocusItem.Property.TriggerValues = temp;
			if (CurrentScreen == "ChatRoom") {
				var Dictionary = [];
				Dictionary.push({Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber});
				Dictionary.push({Tag: "DestinationCharacter", Text: CharacterNickname(CurrentCharacter), MemberNumber: CurrentCharacter.MemberNumber});
				Dictionary.push({Tag: "FocusAssetGroup", AssetGroupName: CurrentCharacter.FocusGroup.Name});
				ChatRoomPublishCustomAction("FuturisticVibratorSaveVoiceCommandsAction", true, Dictionary);
			}
			InventoryItemVulvaFuturisticVibratorExit();
		}
	}
}

function InventoryItemVulvaFuturisticVibratorExit() {
	InventoryItemFuturisticExitAccessDenied();
	for (let I = 0; I <= ItemVulvaFuturisticVibratorTriggers.length; I++)
		ElementRemove("FuturisticVibe" + ItemVulvaFuturisticVibratorTriggers[I]);
}

function InventoryItemVulvaFuturisticVibratorDetectMsg(msg, TriggerValues) {
	var commandsReceived = [];

	// If the message is OOC, just return immediately
	if (msg.indexOf('(') == 0) return commandsReceived;

	for (let I = 0; I < TriggerValues.length; I++) {
		// Don't execute arbitrary regex
		let regexString = TriggerValues[I].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		// Allow `*` wildcard, and normalize case
		regexString = regexString.replace(/\*/g, ".*")//regexString.replaceAll("\\*", ".*")
		regexString = regexString.toUpperCase()

		const nonLatinCharRegex = new RegExp('^([^\\x20-\\x7F]|\\\\.\\*)+$');
		let triggerRegex;

		// In general, in most of the Asian language, the full sentence will be considered as one whole word
		// Because how regex consider word boundaries to be position between \w -> [A-Za-z0-9_] and \W. 

		// So if commands are set to those languages, the command will never be triggered.
		// Or if the command is not a word 
		// This enhancement should allow Asian language commands, and also emoji/special characters
		// (e.g. A symbol such as ↑ or ↓, Languages in CJK group such as Chinese, Japanese, and Korean.)
		// This should be a fun addition to boost the user's experience.
		if (nonLatinCharRegex.test(regexString)) {
			triggerRegex = new RegExp(regexString);
		} else {
			triggerRegex = new RegExp(`\\b${regexString}\\b`);
		}
		const success = triggerRegex.test(msg);

		if (success) commandsReceived.push(ItemVulvaFuturisticVibratorTriggers[I]);
	}
	return commandsReceived;
}

function InventoryItemVulvaFuturisticVibratorSetAccessMode(C, Item, Option) {
	if (!Item.Property) VibratorModeSetProperty(Item, VibratorModeOptions[VibratorModeSet.STANDARD][0].Property);
	Item.Property.AccessMode = Option;
	CharacterRefresh(C);
	ChatRoomCharacterItemUpdate(C, Item.Asset.Group.Name);
}

function InventoryItemVulvaFuturisticVibratorGetMode(Item, Increase) {
	if (Item.Property.Mode == VibratorMode.MAXIMUM) return (Increase ? VibratorMode.MAXIMUM : VibratorMode.HIGH);
	if (Item.Property.Mode == VibratorMode.HIGH) return (Increase ? VibratorMode.MAXIMUM : VibratorMode.MEDIUM);
	if (Item.Property.Mode == VibratorMode.MEDIUM) return (Increase ? VibratorMode.HIGH : VibratorMode.LOW);
	if (Item.Property.Mode == VibratorMode.LOW) return (Increase ? VibratorMode.MEDIUM : VibratorMode.OFF);

	return (Increase ? ((Item.Property.Mode == VibratorMode.OFF) ? VibratorMode.LOW : VibratorMode.MAXIMUM ): VibratorMode.LOW);
}

function InventoryItemVulvaFuturisticVibratorSetMode(C, Item, Option, IgnoreSame) {
	var OldIntensity = Item.Property.Intensity;
	VibratorModeSetProperty(Item, Option.Property);
	CharacterRefresh(C);
	ChatRoomCharacterItemUpdate(C, Item.Asset.Group.Name);

	if (CurrentScreen == "ChatRoom") {
		var Message;
		/** @type {ChatMessageDictionary} */
		var Dictionary = [
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "AssetName", AssetName: Item.Asset.Name },
		];

		if (Item.Property.Intensity !== OldIntensity) {
			var Direction = Item.Property.Intensity > OldIntensity ? "Increase" : "Decrease";
			Message = "Vibe" + Direction + "To" + Item.Property.Intensity;
		} else if (!IgnoreSame) {
			Message = "FuturisticVibratorChange";
			Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
		}

		Dictionary.push({ Automatic: true });
		ServerSend("ChatRoomChat", { Content: Message, Type: "Action", Dictionary });
	}

	if (C.OnlineSharedSettings && C.OnlineSharedSettings.ItemsAffectExpressions) {
		if (Item.Property.Intensity > -1) {
			CharacterSetFacialExpression(C, "Blush", "Medium", 5);
		} else {
			CharacterSetFacialExpression(C, "Eyebrows", "Soft", 5);
		}
	}
}

// Trigger a shock automatically
function InventoryItemVulvaFuturisticVibratorTriggerShock(C, Item) {

	if (CurrentScreen == "ChatRoom") {
		/** @type {ChatMessageDictionary} */
		var Dictionary = [];
		Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "AssetName", AssetName: Item.Asset.Name});
		Dictionary.push({ ShockIntensity : 2});

		ServerSend("ChatRoomChat", { Content: "FuturisticVibratorShockTrigger", Type: "Action", Dictionary });
	}

	InventoryShockExpression(C);
}


function InventoryItemVulvaFuturisticVibratorHandleChat(C, Item, LastTime) {
	if (!Item) return;
	if (!Item.Property) VibratorModeSetProperty(Item, VibratorModeOptions[VibratorModeSet.STANDARD][0].Property);
	var TriggerValues = Item.Property.TriggerValues && Item.Property.TriggerValues.split(',');
	if (!TriggerValues) TriggerValues = ItemVulvaFuturisticVibratorTriggers;

	// Search from latest message backwards, allowing early exit
	for (let CH = ChatRoomChatLog.length - 1; CH >= 0; CH--) {

		// Messages are in order, no need to keep looping
		if (ChatRoomChatLog[CH].Time <= LastTime) break

		// Skip messages from unauthorized users
		if (Item.Property.AccessMode === ItemVulvaFuturisticVibratorAccessMode.PROHIBIT_SELF && ChatRoomChatLog[CH].SenderMemberNumber === Player.MemberNumber) continue;
		if (Item.Property.AccessMode === ItemVulvaFuturisticVibratorAccessMode.LOCK_MEMBER_ONLY && ChatRoomChatLog[CH].SenderMemberNumber !== Item.Property.LockMemberNumber) continue;

		var msg = InventoryItemVulvaFuturisticVibratorDetectMsg(ChatRoomChatLog[CH].Chat.toUpperCase(), TriggerValues);

		if (msg.length > 0) {
			//vibrator modes, can only pick one
			if (msg.includes("Edge")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(VibratorMode.EDGE));
			else if (msg.includes("Deny")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(VibratorMode.DENY));
			else if (msg.includes("Tease")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(VibratorMode.TEASE));
			else if (msg.includes("Random")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(VibratorMode.RANDOM));
			else if (msg.includes("Disable")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(VibratorMode.OFF));
			else if (msg.includes("Increase")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(InventoryItemVulvaFuturisticVibratorGetMode(Item, true)), true);
			else if (msg.includes("Decrease")) InventoryItemVulvaFuturisticVibratorSetMode(C, Item, VibratorModeGetOption(InventoryItemVulvaFuturisticVibratorGetMode(Item, false)), true);

			//triggered actions
			if (msg.includes("Shock")) InventoryItemVulvaFuturisticVibratorTriggerShock(C, Item);
		}
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemVulvaFuturisticVibratorScriptDraw(data) {
	var PersistentData = data.PersistentData();
	var C = data.C;
	var Item = data.Item;
	// Only run updates on the player and NPCs
	if (C.ID !== 0 && C.MemberNumber !== null) return;

	// Default to some number that just means all messages are viable
	if (typeof PersistentData.CheckTime !== "number") PersistentData.CheckTime = 0;

	// Trigger a check if a new message is detected
	let lastMsgIndex = ChatRoomChatLog.length - 1
	if (lastMsgIndex >= 0 && ChatRoomChatLog[lastMsgIndex].Time > PersistentData.CheckTime) {
		InventoryItemVulvaFuturisticVibratorHandleChat(C, Item, PersistentData.CheckTime);
		PersistentData.CheckTime = ChatRoomChatLog[lastMsgIndex].Time;
	}

	VibratorModeScriptDraw(data);
}
