"use strict";

const InventoryItemPelvisObedienceBeltEngraveFont = "Arial, sans-serif";
const InventoryItemPelvisObedienceBeltEngraveLength = 13;

function InventoryItemPelvisObedienceBeltEngraving0Load() {
	// Load the font
	DynamicDrawLoadFont(InventoryItemPelvisObedienceBeltEngraveFont);

	InventoryItemPelvisObedienceBeltInit(DialogFocusItem);

	const input = ElementCreateInput("EngraveText", "text", DialogFocusItem.Property.Text, InventoryItemPelvisObedienceBeltEngraveLength);
	if (input) input.pattern = DynamicDrawTextInputPattern;
}

function InventoryItemPelvisObedienceBeltEngraving0Draw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	const valid = DynamicDrawTextRegex.test(ElementValue("EngraveText"));
	DrawTextFit(DialogFindPlayer("ObedienceBeltEngraveLabel"), 1505, 560, 550, "#fff", "#000");
	ElementPosition("EngraveText", 1510, 620, 300);
	DrawButton(1375, 740, 250, 64, DialogFindPlayer("ObedienceBeltEngrave"), valid ? "White" : "#888", "");
}

function InventoryItemPelvisObedienceBeltEngraving0Click() {
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemPelvisObedienceBeltEngraving0Exit();
		return;
	}

	const text = ElementValue("EngraveText");
	if (MouseIn(1375, 740, 250, 64) && DynamicDrawTextRegex.test(text)) {
		DialogFocusItem.Property.Text = text;
		InventoryItemPelvisObedienceBeltEngravingUpdated(text);
		return;
	}
}

function InventoryItemPelvisObedienceBeltEngraving0Exit() {
	ElementRemove("EngraveText");
	ExtendedItemSubscreen = null;
}

/**
 * Handles text changes. Refreshes the character and sends an appropriate chatroom message
 * @param {string} text
 * @returns {void} - Nothing
 */
function InventoryItemPelvisObedienceBeltEngravingUpdated(text) {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen !== "ChatRoom") return;

	const Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "NewText", Text: text }
	];

	if (text.trim().length > 0) {
		ChatRoomPublishCustomAction("ObedienceBeltEngravingUpdated", true, Dictionary);
	} else {
		ChatRoomPublishCustomAction("ObedienceBeltEngravingErased", true, Dictionary);
	}
}

function InventoryItemPelvisObedienceBeltShockModule1Load() {
	InventoryItemPelvisObedienceBeltInit(DialogFocusItem);
}

function InventoryItemPelvisObedienceBeltShockModule1Draw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	MainCanvas.textAlign = "left";
	DrawCheckbox(1100, 590, 64, 64, DialogFindPlayer("ObedienceBeltShowChatMessage"), DialogFocusItem.Property.ChatMessage, false, "White");
	DrawCheckbox(1100, 660, 64, 64, DialogFindPlayer("ObedienceBeltPunishOrgasm"), DialogFocusItem.Property.PunishOrgasm, false, "White");
	DrawCheckbox(1100, 730, 64, 64, DialogFindPlayer("ObedienceBeltPunishStandup"), DialogFocusItem.Property.PunishStandup, false, "White");

	MainCanvas.textAlign = "center";
	DrawButton(1387, 800, 225, 55, DialogFindPlayer("TriggerShock"), "White");
}

function InventoryItemPelvisObedienceBeltShockModule1Click() {
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemPelvisObedienceBeltShockModule1Exit();
		return;
	}

	const C = CharacterGetCurrent();
	if (MouseIn(1100, 590, 64, 64)) {
		DialogFocusItem.Property.ChatMessage = !DialogFocusItem.Property.ChatMessage;
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
		return;
	}

	if (MouseIn(1100, 660, 64, 64)) {
		DialogFocusItem.Property.PunishOrgasm = !DialogFocusItem.Property.PunishOrgasm;
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
		return;
	}

	if (MouseIn(1100, 730, 64, 64)) {
		DialogFocusItem.Property.PunishStandup = !DialogFocusItem.Property.PunishStandup;
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
		return;
	}

	if (MouseIn(1387, 800, 225, 55)) {
		InventoryItemPelvisObedienceBeltScriptTrigger(C, DialogFocusItem, "Trigger");
		return;
	}
}

function InventoryItemPelvisObedienceBeltShockModule1Exit() {
	ExtendedItemSubscreen = null;
}

/**
 * @param {Item} item
 */
function InventoryItemPelvisObedienceBeltInit(item) {
	if (!item) return;
	item.Property = item.Property || {};
	if (typeof item.Property.Type !== "string") item.Property.Type = "";
	if (typeof item.Property.ChatMessage !== "boolean") item.Property.ChatMessage = false;
	if (typeof item.Property.PunishOrgasm !== "boolean") item.Property.PunishOrgasm = false;
	if (typeof item.Property.PunishStandup !== "boolean") item.Property.PunishStandup = false;
	if (typeof item.Property.NextShockTime !== "number") item.Property.NextShockTime = 0;
	if (typeof item.Property.Text !== "string") item.Property.Text = "";
}

/**
 * Trigger a shock automatically
 * @param {Character} C
 * @param {Item} Item
 * @param {string} ShockType
 */
function InventoryItemPelvisObedienceBeltScriptTrigger(C, Item, ShockType) {

	if (!(CurrentScreen == "ChatRoom")) {
		AudioPlayInstantSound("Audio/Shocks.mp3");
	} else {
		const Dictionary = [];
		Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "AssetName", AssetName: Item.Asset.Name});
		Dictionary.push({ Tag: "ActivityName", Text: "ShockItem" });
		Dictionary.push({ Tag: "ActivityGroup", Text: Item.Asset.Group.Name });
		Dictionary.push({ AssetName: Item.Asset.Name });
		Dictionary.push({ AssetGroupName: Item.Asset.Group.Name });
		Dictionary.push({ ShockIntensity : 2});
		if (Item.Property && Item.Property.ChatMessage) {
			if (ShockType !== "Trigger")
				Dictionary.push({ Automatic: true });
			ServerSend("ChatRoomChat", { Content: "ObedienceBeltShock" + ShockType, Type: "Action", Dictionary });
		} else {
			ChatRoomMessage({ Content: "ObedienceBeltShock" + ShockType, Type: "Action", Sender: Player.MemberNumber, Dictionary: Dictionary  });
		}
	}
	InventoryShockExpression(C);
}


/**
 * @param {Item} Item
 */
function InventoryObedienceBeltCheckPunish(Item) {
	const { Type, PunishOrgasm, PunishStandup } = Item.Property;
	const wearsShockModule = Type.includes("s1");
	if (Item.Property.NextShockTime - CurrentTime <= 0 && PunishOrgasm && wearsShockModule && Player.ArousalSettings && Player.ArousalSettings.OrgasmStage > 1) {
		// Punish the player if they orgasm
		Item.Property.NextShockTime = CurrentTime + FuturisticChastityBeltShockCooldownOrgasm; // Difficult to have two orgasms in 10 seconds
		return "Orgasm";
	} else if (PunishStandup && wearsShockModule && FuturisticTrainingBeltStandUpFlag) {
		// Punish the player if they stand up
		FuturisticTrainingBeltStandUpFlag = false;
		return "StandUp";
	}
	return "";
}

function AssetsItemPelvisObedienceBeltUpdate(data, LastTime) {
	let Item = data.Item;
	let C = data.C;

	if (!Item.Property) return;

	let punishment = InventoryObedienceBeltCheckPunish(Item);
	switch (punishment) {
		case "Orgasm":
			InventoryItemPelvisObedienceBeltScriptTrigger(C, Item, "Orgasm");
			break;
		case "StandUp":
			InventoryItemPelvisObedienceBeltScriptTrigger(C, Item, "Standup");
			CharacterSetActivePose(Player, "Kneel");
			ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
			break;
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemPelvisObedienceBeltScriptDraw(data) {
	const persistentData = data.PersistentData();
	if (typeof persistentData.UpdateTime !== "number") persistentData.UpdateTime = CommonTime() + 4000;
	if (typeof persistentData.LastMessageLen !== "number") persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
	if (typeof persistentData.CheckTime !== "number") persistentData.CheckTime = 0;

	InventoryItemPelvisObedienceBeltInit(data.Item);

	// Trigger a check if a new message is detected
	let lastMsgIndex = ChatRoomChatLog.length - 1;
	if (lastMsgIndex >= 0 && ChatRoomChatLog[lastMsgIndex].Time > persistentData.CheckTime)
		persistentData.UpdateTime = Math.min(persistentData.UpdateTime, CommonTime() + 200); // Trigger if the user speaks

	if (persistentData.UpdateTime < CommonTime() && data.C == Player) {

		if (CommonTime() > data.Item.Property.NextShockTime) {
			AssetsItemPelvisObedienceBeltUpdate(data, persistentData.CheckTime);
			persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
		}

		// Set CheckTime to last processed chat message time
		persistentData.CheckTime = (lastMsgIndex >= 0 ? ChatRoomChatLog[lastMsgIndex].Time : 0);
	}
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemPelvisObedienceBeltAfterDraw({
	C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color
}) {
	if (L !== "_Text") return;

	// Fetch the text property and assert that it matches the character
	// and length requirements
	let text = Property && typeof Property.Text === "string" && DynamicDrawTextRegex.test(Property.Text) ? Property.Text : "";
	text = text.substring(0, InventoryItemPelvisObedienceBeltEngraveLength);

	// Prepare a temporary canvas to draw the text to
	const height = 60;
	const width = 130;
	const tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
	const ctx = tempCanvas.getContext("2d");

	DynamicDrawTextArc(text, ctx, width / 2, 42, {
		fontSize: 28,
		fontFamily: InventoryItemPelvisObedienceBeltEngraveFont,
		width,
		color: Color,
		angle: Math.PI,
		direction: DynamicDrawTextDirection.ANTICLOCKWISE,
		textCurve: DynamicDrawTextCurve.SMILEY,
		radius: 300,
	});

	// Draw the temporary canvas onto the main canvas
	drawCanvas(tempCanvas, X + 59, Y + 29, AlphaMasks);
	drawCanvasBlink(tempCanvas, X + 59, Y + 29, AlphaMasks);
}
