"use strict";
var FuturisticChastityBeltShockCooldownOrgasm = 15000; // 15 sec
var FuturisticChastityBeltConfigure = false;
var FuturisticChastityBeltSwitchModel = false;

var InventoryItemPelvisFuturisticChastityBeltTamperZones = [
	"ItemPelvis",
	"ItemButt",
	"ItemVulva",
];

/**
 * @param {Item} Item
 */
function InventoryFuturisticChastityBeltCheckPunish(Item) {
	// Punish the player if they try to mess with the groin area
	if ((Item.Property.PunishStruggle || (Item.Property.Type && (Item.Property.Type.includes("t1") || Item.Property.Type.includes("t2")))) && Player.FocusGroup && (StruggleProgress >= 0 || StruggleLockPickProgressCurrentTries > 0) && StruggleProgressPrevItem != null && StruggleProgressStruggleCount > 0) {
		var inFocus = false;
		for (var Z = 0; Z < InventoryItemPelvisFuturisticChastityBeltTamperZones.length; Z++)
			if (Player.FocusGroup.Name == InventoryItemPelvisFuturisticChastityBeltTamperZones[Z])
				inFocus = true;

		if (inFocus) {
			return "Struggle";
		}
	}

	// Punish the player if they struggle anywhere
	if ((Item.Property.PunishStruggleOther || (Item.Property.Type && Item.Property.Type.includes("t2"))) && Player.FocusGroup && StruggleProgressPrevItem != null && StruggleProgressStruggleCount > 0 && (StruggleProgress > 50 || StruggleLockPickProgressCurrentTries > 2)) {
		return "StruggleOther";
	}

	// Punish the player if they orgasm
	if (Item.Property.NextShockTime - CurrentTime <= 0 && (Item.Property.PunishOrgasm || (Item.Property.Type && Item.Property.Type.includes("o1"))) && Player.ArousalSettings && Player.ArousalSettings.OrgasmStage > 1) {
		// Punish the player if they orgasm
		return "Orgasm";
	}
	return "";
}

function AssetsItemPelvisFuturisticChastityBeltScriptUpdatePlayer(data) {
	var Item = data.Item;

	const punishment = InventoryFuturisticChastityBeltCheckPunish(Item);
	if (punishment) {
		if (punishment == "Orgasm") {
			AssetsItemPelvisFuturisticChastityBeltScriptTrigger(Player, Item, "Orgasm");
			Item.Property.NextShockTime = CurrentTime + FuturisticChastityBeltShockCooldownOrgasm; // Difficult to have two orgasms in 10 seconds
		} else if (punishment == "StruggleOther") {
			AssetsItemPelvisFuturisticChastityBeltScriptTrigger(Player, Item, "StruggleOther");
			StruggleProgressStruggleCount = 0;
			StruggleProgress = 0;
			DialogLeaveDueToItem = true;
		} else if (punishment == "Struggle") {
			AssetsItemPelvisFuturisticChastityBeltScriptTrigger(Player, Item, "Struggle");
			StruggleProgressStruggleCount = 0;
			DialogLeaveDueToItem = true;
		}
	}
}

// Trigger a shock automatically
function AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, ShockType, ReplacementWord, NoShock) {

	if (!(CurrentScreen == "ChatRoom")) {
		if (!NoShock)
			AudioPlayInstantSound("Audio/Shocks.mp3");
	} else {

		var Dictionary = [];
		Dictionary.push({ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		if (ReplacementWord)
			Dictionary.push({ Tag: "ReplacementWord", Text: ReplacementWord });
		Dictionary.push({Tag: "AssetName", AssetName: Item.Asset.Name});
		Dictionary.push({ Tag: "ActivityName", Text: "ShockItem" });
		Dictionary.push({ Tag: "ActivityGroup", Text: Item.Asset.Group.Name });
		Dictionary.push({ AssetName: Item.Asset.Name });
		Dictionary.push({ AssetGroupName: Item.Asset.Group.Name });
		let ShockPhrase = !NoShock ? "Shock" : "Punish"
		if (!NoShock) Dictionary.push({ ShockIntensity : 2});
		if (Item.Property && Item.Property.ChatMessage) {
			Dictionary.push({ Automatic: true });
			ServerSend("ChatRoomChat", { Content: "FuturisticChastityBelt" + ShockPhrase + ShockType, Type: "Action", Dictionary });
		} else {
			ChatRoomMessage({ Content: "FuturisticChastityBelt" + ShockPhrase + ShockType, Type: "Action", Sender: Player.MemberNumber, Dictionary: Dictionary  });
		}
	}
	InventoryShockExpression(C);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemPelvisFuturisticChastityBeltScriptDraw(data) {
	var persistentData = data.PersistentData();
	/** @type {ItemProperties} */
	var property = (data.Item.Property = data.Item.Property || {});
	if (typeof persistentData.UpdateTime !== "number") persistentData.UpdateTime = CommonTime() + 4000;
	if (typeof persistentData.LastMessageLen !== "number") persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
	if (typeof property.NextShockTime !== "number") property.NextShockTime = 0;


	if (persistentData.UpdateTime < CommonTime() && data.C == Player) {

		if (CommonTime() > property.NextShockTime) {
			AssetsItemPelvisFuturisticChastityBeltScriptUpdatePlayer(data);
			persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
		}

		var timeToNextRefresh = 950;
		persistentData.UpdateTime = CommonTime() + timeToNextRefresh;
		AnimationRequestRefreshRate(data.C, 5000 - timeToNextRefresh);
		AnimationRequestDraw(data.C);
	}
}
