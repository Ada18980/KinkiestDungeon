"use strict";

/*FuturisticTrainingBeltPunishSpeech,,,Punishment for speaking too much: ,,
FuturisticTrainingBeltPunishSpeech0,,,None,,
FuturisticTrainingBeltPunishSpeech1,,,Shock,,
FuturisticTrainingBeltPunishSpeech2,,,Edge for 10m,,
FuturisticTrainingBeltPunishSpeech3,,,Vibe for 10m,,
FuturisticTrainingBeltPunishRequiredSpeech,,,Punishment for not saying word: ,,
FuturisticTrainingBeltPunishRequiredSpeech0,,,None,,
FuturisticTrainingBeltPunishRequiredSpeech1,,,Shock,,
FuturisticTrainingBeltPunishRequiredSpeech2,,,Edge for 10m,,
FuturisticTrainingBeltPunishRequiredSpeech3,,,Vibe for 10m,,*/

var FuturisticTrainingBeltPermissions = ["Public", "Mistresses", "Locked"];
var FuturisticTrainingBeltSpeechPunishments = ["None", "Shock", "Edge", "Vibe"];
var FuturisticTrainingBeltModes = ["None", "Tease", "Excite", "FullPower", "EdgeAndDeny", "RandomTeasing", "RandomOrgasm"];
var FuturisticTrainingBeltStates = ["None", "LowPriorityEdge", "LowPriorityTease", "LowPriorityLow", "LowPriorityMedium", "LowPriorityMax", "HighPriorityEdge", "HighPriorityMax", "Cooldown"];

var FuturisticTrainingBeltSetMode = -1;

var FuturisticTrainingBeltStandUpFlag = false;

var FuturisticTrainingBeltSpeechCharacterLimit = 25;

var FuturisticTrainingBeltRandomEdgeCycle = 150000; // 150s = 20% downtime at low intensity, so 30 of low and 120s of high

var FuturisticTrainingBeltRandomTeaseDurationMin = 30000; // 30 seconds
var FuturisticTrainingBeltRandomTeaseDurationMax = 300000; // 5 minutes
var FuturisticTrainingBeltRandomTeaseDurationCooldown = 60000; // 60 seconds
var FuturisticTrainingBeltRandomTeaseChance = 0.015; // Chance per second that this happens
var FuturisticTrainingBeltRandomTeaseMaxChance = 0.1; // Chance that teasing will be maximum
var FuturisticTrainingBeltRandomDenyChance = 0.01; // Chance per second we will deny the player
var FuturisticTrainingBeltRandomDenyDuration = 30000;

var FuturisticTrainingBeltRandomOrgasmDurationMin = 60000; // 1 minute
var FuturisticTrainingBeltRandomOrgasmDurationMax = 3*60000; // 3 minutes
var FuturisticTrainingBeltRandomOrgasmDurationCooldown = 60000; // 1 minute
var FuturisticTrainingBeltRandomOrgasmChance = 0.015; // Chance per second that this happens

var FuturisticTrainingBeltPunishmentEdgeDuration = 5*60000; // 5 minutes edge
var FuturisticTrainingBeltPunishmentVibeDuration = 5*60000; // 5 minutes constant orgasms

var FuturisticTrainingBeltPage = 0;
var FuturisticTrainingBeltMaxPage = 1;

function InventoryItemPelvisFuturisticTrainingBeltLoad() {
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticLoadAccessDenied();
	} else{
		if (DialogFocusItem.Property == null) DialogFocusItem.Property = {
			Intensity: -1,
			// Security
			ChatMessage: false,
			NextShockTime: 0,
			PunishStruggle: false,
			PunishStruggleOther: false,
			PunishOrgasm: false,
			PunishStandup: false,
			PunishSpeech: 0,
			PunishRequiredSpeech: 0,
			PunishRequiredSpeechWord: "Miss",
			PunishProhibitedSpeech: 0,
			PunishProhibitedSpeechWords: "I,me,am,my,im",
			// Public Modes
			PublicModeCurrent: 0,
			PublicModePermission: 0,
			// State machine
			//DeviceState: 0,
			//DeviceStateTimer: 0, // Timer for the end of the current state
			//DeviceVibeMode: VibratorMode.OFF, // Timer for the end of the current state
		};
		// Security
		if (DialogFocusItem.Property.NextShockTime == null) DialogFocusItem.Property.NextShockTime = 0;
		if (DialogFocusItem.Property.PunishStruggle == null) DialogFocusItem.Property.PunishStruggle = false;
		if (DialogFocusItem.Property.PunishSpeech == null) DialogFocusItem.Property.PunishSpeech = 0;
		if (DialogFocusItem.Property.PunishRequiredSpeech == null) DialogFocusItem.Property.PunishRequiredSpeech = 0;
		if (DialogFocusItem.Property.PunishRequiredSpeechWord == null) DialogFocusItem.Property.PunishRequiredSpeechWord = "Miss";
		if (DialogFocusItem.Property.PunishProhibitedSpeech == null) DialogFocusItem.Property.PunishProhibitedSpeech = 0;
		if (DialogFocusItem.Property.PunishProhibitedSpeechWords == null) DialogFocusItem.Property.PunishProhibitedSpeechWords = "I,me,am,my,im";
		if (DialogFocusItem.Property.PunishStandup == null) DialogFocusItem.Property.PunishStandup = false;
		if (DialogFocusItem.Property.PunishStruggleOther == null) DialogFocusItem.Property.PunishStruggleOther = false;
		if (DialogFocusItem.Property.PunishOrgasm == null) DialogFocusItem.Property.PunishOrgasm = false;
		if (DialogFocusItem.Property.ChatMessage == null) DialogFocusItem.Property.ChatMessage = false;
		if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = -1;
		if (DialogFocusItem.Property.PublicModeCurrent == null) DialogFocusItem.Property.PublicModeCurrent = 0;
		if (DialogFocusItem.Property.PublicModePermission == null) DialogFocusItem.Property.PublicModePermission = 0;

		// Non persistent properties
		//if (DialogFocusItem.Property.DeviceState == null) DialogFocusItem.Property.DeviceState = 0;
		//if (DialogFocusItem.Property.DeviceStateTimer == null) DialogFocusItem.Property.DeviceStateTimer = 0;
		//if (DialogFocusItem.Property.DeviceVibeMode == null) DialogFocusItem.Property.DeviceVibeMode = VibratorMode.OFF;

		// Validation
		if (typeof DialogFocusItem.Property.PunishRequiredSpeechWord != "string") DialogFocusItem.Property.PunishRequiredSpeechWord = "Miss";
		if (typeof DialogFocusItem.Property.PunishProhibitedSpeechWords != "string") DialogFocusItem.Property.PunishProhibitedSpeechWords = "I,me,am,my,im";
		if (DialogFocusItem.Property.PublicModePermission >= FuturisticTrainingBeltPermissions.length || DialogFocusItem.Property.PublicModePermission < 0) DialogFocusItem.Property.PublicModePermission = 2;
		if (DialogFocusItem.Property.PublicModeCurrent >= FuturisticTrainingBeltModes.length || DialogFocusItem.Property.PublicModeCurrent < 0) DialogFocusItem.Property.PublicModeCurrent = 0;
		//if (DialogFocusItem.Property.DeviceState >= FuturisticTrainingBeltStates.length || DialogFocusItem.Property.DeviceState < 0) DialogFocusItem.Property.DeviceState = 0;
		//if (DialogFocusItem.Property.DeviceStateTimer >= CommonTime() + 3600000) DialogFocusItem.Property.DeviceStateTimer = 0; // Prevents people from hacking in ultra-long state timers


		const input = ElementCreateInput("PunishRequiredSpeechWord", "text", "", "70");
		if (input) input.setAttribute("placeholder", DialogFocusItem.Property.PunishRequiredSpeechWord);
		const input2 = ElementCreateInput("PunishProhibitedSpeechWords", "text", "", "70");
		if (input2) input2.setAttribute("placeholder", DialogFocusItem.Property.PunishProhibitedSpeechWords);
	}


	if (FuturisticTrainingBeltSetMode < 0 || FuturisticTrainingBeltSetMode > FuturisticTrainingBeltModes.length)
		FuturisticTrainingBeltSetMode = DialogFocusItem.Property.PublicModeCurrent;
}

function InventoryItemPelvisFuturisticTrainingBeltDraw() {
	const Item = DialogFocusItem;
	var canViewMode = false;
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		InventoryItemFuturisticDrawAccessDenied();
	} else if (DialogFocusItem && DialogFocusItem.Property) {
		DrawAssetPreview(1387, 125, DialogFocusItem.Asset);


		if (FuturisticTrainingBeltPage == 0) {
			MainCanvas.textAlign = "left";
			DrawCheckbox(1100, 450, 64, 64, DialogFindPlayer("FuturisticChastityBeltPunishChatMessage"), DialogFocusItem.Property.ChatMessage, false, "White");
			DrawCheckbox(1100, 520, 64, 64, DialogFindPlayer("FuturisticChastityBeltPunishStruggle"), DialogFocusItem.Property.PunishStruggle, false, "White");
			DrawCheckbox(1100, 590, 64, 64, DialogFindPlayer("FuturisticChastityBeltPunishStruggleOther"), DialogFocusItem.Property.PunishStruggleOther, false, "White");
			DrawCheckbox(1100, 660, 64, 64, DialogFindPlayer("FuturisticChastityBeltPunishOrgasm"), DialogFocusItem.Property.PunishOrgasm, false, "White");
			DrawCheckbox(1100, 730, 64, 64, DialogFindPlayer("FuturisticTrainingBeltPunishStandup"), DialogFocusItem.Property.PunishStandup, false, "White");

			ElementPosition("PunishRequiredSpeechWord", 3050, 750, 400); // Hide it off the canvas
			ElementPosition("PunishProhibitedSpeechWords", 3050, 900, 400); // Hide it off the canvas
		} else if (FuturisticTrainingBeltPage == 1) {

			if (ElementValue("PunishRequiredSpeechWord") && ElementValue("PunishRequiredSpeechWord").length > 1) FuturisticChastityBeltConfigure = true;
			if (ElementValue("PunishProhibitedSpeechWords") && ElementValue("PunishProhibitedSpeechWords").length > 1) FuturisticChastityBeltConfigure = true;

			MainCanvas.textAlign = "left";


			DrawText(DialogFindPlayer("FuturisticTrainingBeltPunishSpeech"), 1100, 480, "white", "gray");
			DrawText(DialogFindPlayer("FuturisticTrainingBeltPunishRequiredSpeech"), 1100, 620, "white", "gray");
			DrawText(DialogFindPlayer("FuturisticTrainingBeltPunishProhibitedSpeech"), 1100, 760, "white", "gray");

			ElementPosition("PunishRequiredSpeechWord", 1800, 610, 245);
			ElementPosition("PunishProhibitedSpeechWords", 1800, 750, 245);


			MainCanvas.textAlign = "center";

			DrawBackNextButton(1100, 510, 350, 64, DialogFindPlayer("FuturisticTrainingBeltPunishSpeech" + Item.Property.PunishSpeech), "White", "",
				() => DialogFindPlayer("FuturisticTrainingBeltPunishSpeech" + ((Item.Property.PunishSpeech + FuturisticTrainingBeltSpeechPunishments.length - 1) % FuturisticTrainingBeltSpeechPunishments.length)),
				() => DialogFindPlayer("FuturisticTrainingBeltPunishSpeech" + ((Item.Property.PunishSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length)));

			DrawBackNextButton(1100, 640, 350, 64, DialogFindPlayer("FuturisticTrainingBeltPunishRequiredSpeech" + Item.Property.PunishRequiredSpeech), "White", "",
				() => DialogFindPlayer("FuturisticTrainingBeltPunishRequiredSpeech" + ((Item.Property.PunishRequiredSpeech + FuturisticTrainingBeltSpeechPunishments.length - 1) % FuturisticTrainingBeltSpeechPunishments.length)),
				() => DialogFindPlayer("FuturisticTrainingBeltPunishRequiredSpeech" + ((Item.Property.PunishRequiredSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length)));

			DrawBackNextButton(1100, 780, 350, 64, DialogFindPlayer("FuturisticTrainingBeltPunishProhibitedSpeech" + Item.Property.PunishProhibitedSpeech), "White", "",
				() => DialogFindPlayer("FuturisticTrainingBeltPunishProhibitedSpeech" + ((Item.Property.PunishProhibitedSpeech + FuturisticTrainingBeltSpeechPunishments.length - 1) % FuturisticTrainingBeltSpeechPunishments.length)),
				() => DialogFindPlayer("FuturisticTrainingBeltPunishProhibitedSpeech" + ((Item.Property.PunishProhibitedSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length)));

		}

		MainCanvas.textAlign = "left";

		DrawText(DialogFindPlayer("FuturisticTrainingBeltPermissions"), 1100, 875, "white", "gray");

		MainCanvas.textAlign = "center";

		DrawBackNextButton(1550, 840, 350, 64, DialogFindPlayer("FuturisticTrainingBeltPermissions" + Item.Property.PublicModePermission), "White", "",
			() => DialogFindPlayer("FuturisticTrainingBeltPermissions" + ((Item.Property.PublicModePermission + FuturisticTrainingBeltPermissions.length - 1) % FuturisticTrainingBeltPermissions.length)),
			() => DialogFindPlayer("FuturisticTrainingBeltPermissions" + ((Item.Property.PublicModePermission + 1) % FuturisticTrainingBeltPermissions.length)));

		// Draw the back/next button
		const currPage = FuturisticTrainingBeltPage + 1;
		const totalPages = FuturisticTrainingBeltMaxPage + 1;
		DrawBackNextButton(1675, 240, 300, 90, DialogFindPlayer("Page") + " " + currPage.toString() + " / " + totalPages.toString(), "White", "", () => "", () => "");

		canViewMode = true;
	}


	MainCanvas.textAlign = "left";
	DrawText(DialogFindPlayer("FuturisticTrainingBeltMode"), 1100, 945, "white", "gray");

	MainCanvas.textAlign = "center";
	if (Item.Property.PublicModePermission == 0 || (Item.Property.PublicModePermission == 1 && LogQuery("ClubMistress", "Management"))) canViewMode = true;
	DrawBackNextButton(1550, 910, 350, 64, DialogFindPlayer("FuturisticTrainingBeltMode" + FuturisticTrainingBeltSetMode), !canViewMode ? "Gray" : "White", "",
		() => !canViewMode ? "" : DialogFindPlayer("FuturisticTrainingBeltMode" + ((FuturisticTrainingBeltSetMode + FuturisticTrainingBeltModes.length - 1) % FuturisticTrainingBeltModes.length)),
		() => !canViewMode ? "" : DialogFindPlayer("FuturisticTrainingBeltMode" + ((FuturisticTrainingBeltSetMode + 1) % FuturisticTrainingBeltModes.length)));

	if (!FuturisticChastityBeltConfigure) {
		FuturisticTrainingBeltSetMode = DialogFocusItem.Property.PublicModeCurrent;
	}


}

function InventoryItemPelvisFuturisticTrainingBeltClick() {
	const Item = DialogFocusItem;
	var canViewMode = false;
	var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;
	if (InventoryItemFuturisticValidate(C) !== "") {
		if (MouseIn(1885, 25, 90, 90)) InventoryItemPelvisFuturisticTrainingBeltExit();
		else InventoryItemFuturisticClickAccessDenied();
	} else {
		if (MouseIn(1885, 25, 90, 90)) InventoryItemPelvisFuturisticTrainingBeltExit();

		if (FuturisticTrainingBeltPage == 0) {
			if (MouseIn(1100, 450, 64, 64)) {
				DialogFocusItem.Property.ChatMessage = !DialogFocusItem.Property.ChatMessage;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 520, 64, 64)) {
				DialogFocusItem.Property.PunishStruggle = !DialogFocusItem.Property.PunishStruggle;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 590, 64, 64)) {
				DialogFocusItem.Property.PunishStruggleOther = !DialogFocusItem.Property.PunishStruggleOther;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 660, 64, 64)) {
				DialogFocusItem.Property.PunishOrgasm = !DialogFocusItem.Property.PunishOrgasm;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 730, 64, 64)) {
				DialogFocusItem.Property.PunishStandup = !DialogFocusItem.Property.PunishStandup;
				FuturisticChastityBeltConfigure = true;
			}
		} else if (FuturisticTrainingBeltPage == 1) {
			if (MouseIn(1100, 510, 350, 64)) {
				if (MouseX <= 1275) Item.Property.PunishSpeech = (FuturisticTrainingBeltSpeechPunishments.length + Item.Property.PunishSpeech - 1) % FuturisticTrainingBeltSpeechPunishments.length;
				else Item.Property.PunishSpeech = (Item.Property.PunishSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 640, 350, 64)) {
				if (MouseX <= 1275) Item.Property.PunishRequiredSpeech = (FuturisticTrainingBeltSpeechPunishments.length + Item.Property.PunishRequiredSpeech - 1) % FuturisticTrainingBeltSpeechPunishments.length;
				else Item.Property.PunishRequiredSpeech = (Item.Property.PunishRequiredSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length;
				FuturisticChastityBeltConfigure = true;
			} else if (MouseIn(1100, 780, 350, 64)) {
				if (MouseX <= 1275) Item.Property.PunishProhibitedSpeech = (FuturisticTrainingBeltSpeechPunishments.length + Item.Property.PunishProhibitedSpeech - 1) % FuturisticTrainingBeltSpeechPunishments.length;
				else Item.Property.PunishProhibitedSpeech = (Item.Property.PunishProhibitedSpeech + 1) % FuturisticTrainingBeltSpeechPunishments.length;
				FuturisticChastityBeltConfigure = true;
			}
		}

		// Pagination buttons
		if (MouseIn(1675, 240, 150, 90) && FuturisticTrainingBeltPage > 0) {
			FuturisticTrainingBeltPage = FuturisticTrainingBeltPage - 1;
		}
		else if (MouseIn(1825, 240, 150, 90) && FuturisticTrainingBeltPage < FuturisticTrainingBeltMaxPage) {
			FuturisticTrainingBeltPage = FuturisticTrainingBeltPage + 1;
		}

		if (MouseIn(1550, 840, 350, 64)) {
			if (MouseX <= 1725) Item.Property.PublicModePermission = (FuturisticTrainingBeltPermissions.length + Item.Property.PublicModePermission - 1) % FuturisticTrainingBeltPermissions.length;
			else Item.Property.PublicModePermission = (Item.Property.PublicModePermission + 1) % FuturisticTrainingBeltPermissions.length;
			FuturisticChastityBeltConfigure = true;
		}

		canViewMode = true;
	}


	if (canViewMode || Item.Property.PublicModePermission == 0 || (Item.Property.PublicModePermission == 1 && LogQuery("ClubMistress", "Management"))) {
		if (MouseIn(1550, 910, 350, 64)) {
			if (MouseX <= 1725) FuturisticTrainingBeltSetMode = (FuturisticTrainingBeltModes.length + FuturisticTrainingBeltSetMode - 1) % FuturisticTrainingBeltModes.length;
			else FuturisticTrainingBeltSetMode = (FuturisticTrainingBeltSetMode + 1) % FuturisticTrainingBeltModes.length;
			FuturisticChastityBeltConfigure = true;
		}
	}
}

function InventoryItemPelvisFuturisticTrainingBeltExit() {
	if (FuturisticChastityBeltConfigure) {
		FuturisticChastityBeltConfigure = false;
		DialogFocusItem.Property.PublicModeCurrent = FuturisticTrainingBeltSetMode;
		FuturisticTrainingBeltSetMode = -1; // Reset for future
		FuturisticTrainingBeltPage = 0; // Reset for future

		if (ElementValue("PunishRequiredSpeechWord") && ElementValue("PunishRequiredSpeechWord").length > 0) {
			DialogFocusItem.Property.PunishRequiredSpeechWord = ElementValue("PunishRequiredSpeechWord").split(',').map(_ => _.replace(/[\p{P}~+=^$|\\<>`\s]+/ugm, "")).join(',');
		}

		if (ElementValue("PunishProhibitedSpeechWords") && ElementValue("PunishProhibitedSpeechWords").length > 0) {
			DialogFocusItem.Property.PunishProhibitedSpeechWords = ElementValue("PunishProhibitedSpeechWords").split(',').map(_ => _.replace(/[\p{P}~+=^$|\\<>`\s]+/ugm, "")).join(',');
		}

		InventoryItemPelvisFuturisticTrainingBeltPublishGeneric(CurrentCharacter, "FuturisticTrainingBeltSetGeneric");
	}

	InventoryItemFuturisticExitAccessDenied();

	ElementRemove("PunishRequiredSpeechWord");
	ElementRemove("PunishProhibitedSpeechWords");
}

function InventoryItemPelvisFuturisticTrainingBeltPublishAction(C, Option) {
	if (FuturisticChastityBeltSwitchModel) {
		FuturisticChastityBeltSwitchModel = false;
		return;
	}
	var msg = "FuturisticChastityBeltSet" + Option.Name;
	InventoryItemPelvisFuturisticTrainingBeltPublishGeneric(C, msg);
}

function InventoryItemPelvisFuturisticTrainingBeltPublishMode(C, Setting, Active) {
	var msg = "FuturisticChastityBeltSet" + Setting + ((Active) ? "On" : "Off");
	InventoryItemPelvisFuturisticTrainingBeltPublishGeneric(C, msg);
}

function InventoryItemPelvisFuturisticTrainingBeltPublishGeneric(C, msg) {
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, false, Dictionary);
}

function InventoryItemPelvisFuturisticTrainingBeltValidate(C, Item) {
	return InventoryItemFuturisticValidate(C, Item); // All futuristic items refer to the gag
}

function InventoryItemPelvisFuturisticTrainingBeltNpcDialog(C, Option) {
	InventoryItemPelvisMetalChastityBeltNpcDialog(C, Option);
}

function InventoryItemPelvisFuturisticTrainingBeltGetVibeMode(C, State, First) {
	const ArousalActive = C.ArousalSettings && C.ArousalSettings.Progress && ["Manual", "Hybrid", "Automatic"].includes(C.ArousalSettings.Active);
	if (State.includes("Edge")) {
		if (First || (ArousalActive &&(C.ArousalSettings.Progress < 60 || C.ArousalSettings.Progress > 90)) || (CommonTime() % FuturisticTrainingBeltRandomEdgeCycle > FuturisticTrainingBeltRandomEdgeCycle / 5)) {
			if ((ArousalActive && C.ArousalSettings.Progress > 90))
				return VibratorMode.MAXIMUM;
			else return VibratorMode.HIGH;
		} else
			return VibratorMode.LOW;
	}
	if (State.includes("Tease")) {
		if (Math.random() < FuturisticTrainingBeltRandomTeaseMaxChance) return VibratorMode.MAXIMUM;
		if (ArousalActive) {
			if (C.ArousalSettings.Progress < 35) return VibratorMode.HIGH;
			if (C.ArousalSettings.Progress < 70) return VibratorMode.MEDIUM;
		}
		return VibratorMode.LOW;
	}
	if (State.includes("Max")) return VibratorMode.MAXIMUM;
	if (State.includes("Medium")) return VibratorMode.MEDIUM;
	if (State.includes("Low")) return VibratorMode.LOW;
	return VibratorMode.OFF;
}

// This function sets the vibration mode, similar to the extended vibrators
function InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item, Force) {
	var OldIntensity = Item.Property.Intensity;
	var State = (Item.Property && PersistentData.DeviceState) ? FuturisticTrainingBeltStates[PersistentData.DeviceState] : "None";
	var VibeMode = InventoryItemPelvisFuturisticTrainingBeltGetVibeMode(C, State, OldIntensity < 0);

	if (Force || PersistentData.DeviceVibeMode != VibeMode || (OldIntensity > -1 && VibeMode == "Off")) {
		PersistentData.DeviceVibeMode = VibeMode;

		var Option = VibratorModeGetOption(VibeMode);
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

			Dictionary.push({ Automatic: true });

			Message = "FuturisticTrainingBeltSetState" + FuturisticTrainingBeltStates[PersistentData.DeviceState] + VibeMode;
			Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(C), MemberNumber: Player.MemberNumber });
			// This is meant to cut down on spam for other players
			if (FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("Edge") && (OldIntensity >= 0 && OldIntensity < 3))
				ChatRoomMessage({ Content: Message+"Self", Type: "Action", Sender: Player.MemberNumber, Dictionary: Dictionary  });
			else {
				if (Item.Property && Item.Property.ChatMessage) {
					ServerSend("ChatRoomChat", { Content: Message, Type: "Action", Dictionary });
				} else {
					ChatRoomMessage({ Content: Message, Type: "Action", Sender: Player.MemberNumber, Dictionary: Dictionary  });
				}
			}

		}
		if (Item.Property.Intensity > OldIntensity) {
			if (Item.Property.Intensity >= 3)
				CharacterSetFacialExpression(C, "Blush", "Extreme", 5);
			else if (Item.Property.Intensity > 1)
				CharacterSetFacialExpression(C, "Blush", "VeryHigh", 5);
			else
				CharacterSetFacialExpression(C, "Blush", "Medium", 5);
		}
	}
}

function InventoryFuturisticTrainingBeltCheckPunishSpeech(Item, LastTime) {
	if (!Item) return "";
	if (!Item.Property) return "";
	// Search from latest message backwards, allowing early exit
	for (let CH = ChatRoomChatLog.length - 1; CH >= 0; CH--) {

		// Messages are in order, no need to keep looping
		if (ChatRoomChatLog[CH].Time <= LastTime) break;

		// If the message is OOC, just return immediately
		if (ChatRoomChatLog[CH].Original.indexOf('(') == 0) return "";

		if (ChatRoomChatLog[CH].SenderMemberNumber == Player.MemberNumber) {
			let msg = ChatRoomChatLog[CH].Original.toUpperCase().replace(/[\p{P}~+=^$|\\<>`]+/ugm, " ");
			let msgTruncated = ChatRoomChatLog[CH].Original.toUpperCase().replace(/[\p{P}~+=^$|\\<>`\s]+/ugm, "");

			if (Item.Property.PunishSpeech > 0 && msgTruncated.length > FuturisticTrainingBeltSpeechCharacterLimit) return "Speech";


			if (Item.Property.PunishRequiredSpeech > 0 && Item.Property.PunishRequiredSpeechWord && msg.length > 0) {
				let gagLevel = SpeechGetTotalGagLevel(Player);
				let words =  Item.Property.PunishRequiredSpeechWord.split(",");
				if (gagLevel < 8) {
					let pass = false;
					for (let W = 0; W <  words.length; W++) {
						let checkWord = words[W].replace(/[\p{P} ~+=^$|\\<>`]+/ugm, "").toUpperCase();
						if (msgTruncated.includes(checkWord)) {pass = true; break;}
					}
					if (!pass) return "RequiredSpeech";
				}
			}

			if (Item.Property.PunishProhibitedSpeech > 0 && Item.Property.PunishProhibitedSpeechWords && msg.length > 0) {
				let gagLevel = SpeechGetTotalGagLevel(Player);
				let words =  Item.Property.PunishProhibitedSpeechWords.split(",");

				const nonLatinCharRegex = new RegExp('^([^\\x20-\\x7F]|\\\\.\\*)+$');
				let triggerRegex;

				if (gagLevel < 8) {
					for (let W = 0; W <  words.length; W++) {
						let checkWord = words[W].replace(/[\p{P} ~+=^$|\\<>`]+/ugm, "").toUpperCase();

						if (nonLatinCharRegex.test(checkWord)) {
							triggerRegex = new RegExp(checkWord);
						} else {
							triggerRegex = new RegExp(`\\b${checkWord}\\b`);
						}

						const success = triggerRegex.test(msg);

						if (success) return { name: "ProhibitedSpeech", word: checkWord };
					}
				}
			}
		}
	}
}

function AssetsItemPelvisFuturisticTrainingBeltScriptUpdatePlayer(data, LastTime) {
	let Item = data.Item;
	let C = data.C;
	let PersistentData = data.PersistentData();

	if (Item.Property) {
		let punishment = InventoryFuturisticChastityBeltCheckPunish(Item);
		if (punishment != "") {
			if (punishment == "Orgasm") {
				if (Item.Property.PunishOrgasm && C.ArousalSettings && C.ArousalSettings.OrgasmStage > 1) {
					AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "Orgasm");
					Item.Property.NextShockTime = CurrentTime + FuturisticChastityBeltShockCooldownOrgasm; // Difficult to have two orgasms in 10 seconds
				}
			} else if (punishment == "StruggleOther") {
				AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "StruggleOther");
				StruggleProgressStruggleCount = 0;
				StruggleProgress = 0;
				DialogLeaveDueToItem = true;
			} else if (punishment == "Struggle") {
				AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "Struggle");
				StruggleProgressStruggleCount = 0;
				DialogLeaveDueToItem = true;
			}
		} else if (Item.Property.PunishStandup && FuturisticTrainingBeltStandUpFlag) {
			AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "Standup");
			CharacterSetActivePose(Player, "Kneel");
			ServerSend("ChatRoomCharacterPoseUpdate", { Pose: Player.ActivePose });
		} else {
			// @ts-ignore
			punishment = InventoryFuturisticTrainingBeltCheckPunishSpeech(Item, LastTime);
			let Property = Item.Property;
			if (punishment == "Speech") {
				let NoShock = true;
				if (Item.Property.PunishSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Shock")) NoShock = false;
				else if (Item.Property.PunishSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Edge")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority")) {
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityEdge");
						PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentEdgeDuration;
					} else PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration;
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				} else if (Item.Property.PunishSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Vibe")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority"))
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityMax");
					PersistentData.DeviceStateTimer = Math.max(PersistentData.DeviceStateTimer, CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration);
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				}

				AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "Speech", "", NoShock);
			} else if (punishment == "RequiredSpeech")  {
				let NoShock = true;
				if (Item.Property.PunishRequiredSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Shock")) NoShock = false;
				else if (Item.Property.PunishRequiredSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Edge")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority")) {
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityEdge");
						PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentEdgeDuration;
					} else PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration;
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				} else if (Item.Property.PunishRequiredSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Vibe")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority"))
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityMax");
					PersistentData.DeviceStateTimer = Math.max(PersistentData.DeviceStateTimer, CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration);
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				}

				AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "RequiredSpeech", Item.Property.PunishRequiredSpeechWord.replace(/[^a-z0-9,]/gmi, " ").replace(/\s+/g, '').replace(/,/g, "/"), NoShock);
			// @ts-ignore
			} else if (punishment && punishment.name == "ProhibitedSpeech" && punishment.word)  {
				let NoShock = true;
				if (Item.Property.PunishProhibitedSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Shock")) NoShock = false;
				else if (Item.Property.PunishProhibitedSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Edge")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority")) {
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityEdge");
						PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentEdgeDuration;
					} else PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration;
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				} else if (Item.Property.PunishProhibitedSpeech == FuturisticTrainingBeltSpeechPunishments.indexOf("Vibe")) {
					if (!FuturisticTrainingBeltStates[PersistentData.DeviceState].includes("HighPriority"))
						PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("HighPriorityMax");
					PersistentData.DeviceStateTimer = Math.max(PersistentData.DeviceStateTimer, CommonTime() + FuturisticTrainingBeltPunishmentVibeDuration);
					InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);
				}

				AssetsItemPelvisFuturisticChastityBeltScriptTrigger(C, Item, "ProhibitedSpeech", punishment.word, NoShock);
			}
		}
	}

	FuturisticTrainingBeltStandUpFlag = false;
}

function AssetsItemPelvisFuturisticTrainingBeltScriptStateMachine(data) {

	// GGTS level 4 or more can short-cut the state machine
	if ((CurrentModule == "Online") && (CurrentScreen == "ChatRoom") && (ChatRoomGame == "GGTS") && (ChatRoomSpace === "Asylum") && (AsylumGGTSGetLevel(Player) >= 4)) return;

	// We have a state machine
	var update = false;
	var Item = data.Item;
	var C = data.C;
	let PersistentData = data.PersistentData();

	var ArousalActive = C.ArousalSettings && C.ArousalSettings.Progress && ["Manual", "Hybrid", "Automatic"].includes(C.ArousalSettings.Active);
	var Property = Item ? Item.Property : null;
	if (!Property) return;

	// Get the state
	var State = FuturisticTrainingBeltStates[PersistentData.DeviceState ? PersistentData.DeviceState : FuturisticTrainingBeltStates.indexOf("None")];
	var Mode = FuturisticTrainingBeltModes[Property.PublicModeCurrent ? Property.PublicModeCurrent : 0];
	var StateTimerReady = !(PersistentData.DeviceStateTimer > 0); // Are we ready to start a new event?
	var StateTimerOver = CommonTime() > PersistentData.DeviceStateTimer; // End the current event



	// Basics of the state machine
	// In high priority, the state must time out before anything special happens.

	if (State.includes("HighPriority")) {// High priority timer
		if (StateTimerOver) {
			PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("None");
			update = true;
		}
	} else if (State.includes("LowPriority") || State == "None") {// Check low priority states
		var DeviceSetToState = -1;
		var DeviceTimer = 0;
		if (State != "None" && Mode == "None") { // If the mode is None then we turn off if we are LowPriority regardless of what
			PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("None"); // None
			update = true;
		} else if (Mode == "EdgeAndDeny") {
			if (State != "Cooldown")
				DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityEdge");
			if (ArousalActive && C.ArousalSettings.Progress > 90) {
				if (Math.random() < FuturisticTrainingBeltRandomDenyChance) {
					DeviceSetToState = FuturisticTrainingBeltStates.indexOf("Cooldown");
					PersistentData.DeviceStateTimer = CommonTime() + FuturisticTrainingBeltRandomDenyDuration;
					update = true;
				}
			}

		} else if (Mode == "RandomTeasing") {
			if (State != "LowPriorityTease")
				DeviceSetToState = 0;
			if (State == "None") {
				if (Math.random() < FuturisticTrainingBeltRandomTeaseChance) {
					const r = Math.random();
					DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityTease");
					DeviceTimer = FuturisticTrainingBeltRandomTeaseDurationMin + (FuturisticTrainingBeltRandomTeaseDurationMax - FuturisticTrainingBeltRandomTeaseDurationMin) * r * r * r;
				}
			} else {
				DeviceTimer = 1;
				if (StateTimerOver) DeviceSetToState = 0;
			}
		} else if (Mode == "RandomOrgasm") {
			if (State != "LowPriorityMax")
				DeviceSetToState = 0;

			if (State == "None") {
				if (Math.random() < FuturisticTrainingBeltRandomOrgasmChance) {
					const r = Math.random();
					DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityMax");
					DeviceTimer = FuturisticTrainingBeltRandomOrgasmDurationMin + (FuturisticTrainingBeltRandomOrgasmDurationMax - FuturisticTrainingBeltRandomOrgasmDurationMin) * r * r * r;
				} else DeviceSetToState = -1;
			} else {
				DeviceTimer = 1;
				if (StateTimerOver) DeviceSetToState = 0;
			}
		} else if (Mode == "FullPower") {
			DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityMax");
		} else if (Mode == "Tease") {
			DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityLow");
		} else if (Mode == "Excite") {
			DeviceSetToState = FuturisticTrainingBeltStates.indexOf("LowPriorityMedium");
		}
		if (DeviceSetToState > -1) {
			if (DeviceSetToState != PersistentData.DeviceState) {
				PersistentData.DeviceState = DeviceSetToState; // Low priority edge
				PersistentData.DeviceStateTimer = CommonTime() + DeviceTimer;
				update = true;
			} else if (StateTimerOver && DeviceTimer != 0) {
				PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("Cooldown");
				PersistentData.DeviceStateTimer = CommonTime();
				update = true;
			}

			StateTimerReady = false;
		}
	} else if (State == "Cooldown" && StateTimerReady) PersistentData.DeviceState = FuturisticTrainingBeltStates.indexOf("None"); // Return to None state

	if (State == "None" && Property.Intensity >= 0) update = true;
	// In the cooldown state we decide when to get ready for another round of good vibrations
	if (State == "Cooldown") {
		var Cooldown = 0;
		if (!State.includes("HighPriority")) {
			if (Mode == "RandomTeasing") {
				Cooldown = FuturisticTrainingBeltRandomTeaseDurationCooldown;
			} else if (Mode == "RandomOrgasm") {
				Cooldown = FuturisticTrainingBeltRandomOrgasmDurationCooldown;
			} else if (Mode == "EdgeAndDeny") {
				Cooldown = FuturisticTrainingBeltRandomDenyDuration;
			}
		}
		if (CommonTime() > PersistentData.DeviceStateTimer + Cooldown) {
			StateTimerReady = true;
		} else StateTimerReady = false;
	}

	// Reset state timers
	if (Mode == "None" && !State.includes("HighPriority")) {
		StateTimerOver = true;
		StateTimerReady = true;
	}
	if (StateTimerReady)
		PersistentData.DeviceStateTimer = 0;

	if (update || State.includes("Edge")) InventoryItemPelvisFuturisticTrainingBeltUpdateVibeMode(C, PersistentData, Item);

	let EdgeMode = State.includes("Edge") || Mode == "EdgeAndDeny" || Mode == "RandomTeasing";


	if (EdgeMode) {
		if (Item.Property.Effect && !Item.Property.Effect.includes("DenialMode")) {
			Item.Property.Effect.push("DenialMode");
		}
		if (Item.Property.Effect && !Item.Property.Effect.includes("RuinOrgasms")) {
			Item.Property.Effect.push("RuinOrgasms");
		}
	} else {
		if (Item.Property.Effect && Item.Property.Effect.includes("DenialMode")) {
			for (let E = 0; E < Item.Property.Effect.length; E++) {
				let Effect = Item.Property.Effect[E];
				if (Effect == "DenialMode") {
					Item.Property.Effect.splice(E, 1);
					E--;
				}
			}
		}
		if (Item.Property.Effect && Item.Property.Effect.includes("RuinOrgasms")) {
			for (let E = 0; E < Item.Property.Effect.length; E++) {
				let Effect = Item.Property.Effect[E];
				if (Effect == "RuinOrgasms") {
					Item.Property.Effect.splice(E, 1);
					E--;
				}
			}
		}
	}



	if (ArousalActive) {
		if (EdgeMode && C.ArousalSettings.Progress > 96 && !((ActivityOrgasmGameTimer != null) && (ActivityOrgasmGameTimer > 0) && (CurrentTime < C.ArousalSettings.OrgasmTimer))) { // Manually trigger orgasm at this stage
			DialogLeave();
			ActivityOrgasmPrepare(C, true);
			// Continuous edging~
			if (Mode == "EdgeAndDeny")
				C.ArousalSettings.Progress = 80;
		}
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemPelvisFuturisticTrainingBeltScriptDraw(data) {
	var persistentData = data.PersistentData();
	/** @type {ItemProperties} */
	var property = (data.Item.Property = data.Item.Property || {});
	if (typeof persistentData.UpdateTime !== "number") persistentData.UpdateTime = CommonTime() + 4000;
	if (typeof persistentData.LastMessageLen !== "number") persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
	if (typeof persistentData.CheckTime !== "number") persistentData.CheckTime = 0;


	// Non persistent properties
	if (typeof persistentData.DeviceState !== "number") persistentData.DeviceState = 0;
	if (typeof persistentData.DeviceStateTimer !== "number") persistentData.DeviceStateTimer = 0;
	if (typeof persistentData.DeviceVibeMode !== "string") persistentData.DeviceVibeMode = VibratorMode.OFF;

	// Trigger a check if a new message is detected
	let lastMsgIndex = ChatRoomChatLog.length - 1;
	if (lastMsgIndex >= 0 && ChatRoomChatLog[lastMsgIndex].Time > persistentData.CheckTime)
		persistentData.UpdateTime = Math.min(persistentData.UpdateTime, CommonTime() + 200); // Trigger if the user speaks

	if (persistentData.UpdateTime < CommonTime() && data.C == Player) {

		if (CommonTime() > property.NextShockTime) {
			AssetsItemPelvisFuturisticTrainingBeltScriptUpdatePlayer(data, persistentData.CheckTime);
			AssetsItemPelvisFuturisticTrainingBeltScriptStateMachine(data);
			persistentData.LastMessageLen = (ChatRoomLastMessage) ? ChatRoomLastMessage.length : 0;
		}

		var timeToNextRefresh = 950;
		persistentData.UpdateTime = CommonTime() + timeToNextRefresh;
		AnimationRequestRefreshRate(data.C, 5000 - timeToNextRefresh);
		AnimationRequestDraw(data.C);

		// Set CheckTime to last processed chat message time
		persistentData.CheckTime = (lastMsgIndex >= 0 ? ChatRoomChatLog[lastMsgIndex].Time : 0);
	}
}
