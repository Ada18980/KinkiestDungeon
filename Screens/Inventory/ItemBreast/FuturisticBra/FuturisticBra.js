"use strict";

var small_yoffset = -5;
var normal_yoffset = 0;
var large_yoffset = 4;
var xlarge_yoffset = 7;

/** @type ExtendedItemOption[] */
var InventoryItemBreastFuturisticBraOptions = [
	{
		Name: "Show",
		Property: {
			Type: null,
		},
	},
	{
		Name: "Solid",
		Property: {
			Type: "Solid",
		},
	},
	{
		Name: "Show2",
		Property: {
			Type: "Show2",
		},
	},
	{
		Name: "Solid2",
		Property: {
			Type: "Solid2",
		},
	},
];


// Loads the item extension properties
function InventoryItemBreastFuturisticBraLoad() {
	if (DialogFocusItem.Property == null) DialogFocusItem.Property = { HeartRate: 0, HeartIcon: false };
	if (DialogFocusItem.Property.HeartRate == null) DialogFocusItem.Property.HeartRate = 0;
	if (DialogFocusItem.Property.HeartIcon == null) DialogFocusItem.Property.HeartIcon = false;
}

function InventoryItemBreastFuturisticBraUpdate(C) {
	var current_bpm = 65;
	var current_breathing = "Low";
	var current_temp = 37;

	if (C.MemberNumber) {
		current_bpm += C.MemberNumber % 20; // 'Pseudo random baseline'
	}

	if (C.ArousalSettings && C.ArousalSettings.Progress > 0) {
		var Progress = C.ArousalSettings.Progress;
		current_bpm += Math.floor(Progress*0.60);
		current_temp += Math.floor(Progress*0.1)/10;
		if ((C.ArousalSettings.OrgasmStage && C.ArousalSettings.OrgasmStage > 0) || (C.ArousalSettings.ProgressTimer && C.ArousalSettings.ProgressTimer > 1)) {
			current_breathing = "Action";
			current_bpm += 10;
			current_temp += 0.5;
		} else if (C.ArousalSettings.Progress > 10) {
			if (C.ArousalSettings.Progress > 90) {
				current_breathing = "High";
			} else {
				current_breathing = "Med";
			}
		}

	}
	return { bpm: current_bpm, breathing: current_breathing, temp: current_temp };
}

// Draw the item extension screen
function InventoryItemBreastFuturisticBraDraw() {
	DrawAssetPreview(1387, 225, DialogFocusItem.Asset);

	var C = CharacterGetCurrent();

	var update = InventoryItemBreastFuturisticBraUpdate(C);
	var current_bpm = update.bpm;
	var current_breathing = update.breathing;
	var current_temp = update.temp;

	DrawText(DialogFindPlayer("FuturisticBraPlayerDesc") + " " + C.MemberNumber, 1500, 600, "White", "Gray");
	DrawText(DialogFindPlayer("FuturisticBraPlayerHeartRate") + " " + current_bpm + " " + DialogFindPlayer("FuturisticBraPlayerHeartRateBPM"), 1500, 680, "White", "Gray");
	DrawText(DialogFindPlayer("FuturisticBraPlayerTemp") + " " + current_temp + DialogFindPlayer("FuturisticBraPlayerTempC"), 1500, 730, "White", "Gray");
	DrawText(DialogFindPlayer("FuturisticBraPlayerBreathing") + " " + DialogFindPlayer("FuturisticBraPlayerBreathing" + current_breathing), 1500, 780, "White", "Gray");
	DrawText(DialogFindPlayer("FuturisticBraPlayerTracking"), 1500, 830, "White", "Gray");

	// If the player can modify
	if (InventoryItemFuturisticValidate(C) == "") {
		if (DialogFocusItem.Property.Type != null) {
			DrawButton(1150, 900, 150, 64, DialogFindPlayer("FuturisticBraPlayerShow"), "White", "");
		} if (DialogFocusItem.Property.Type != "Solid") {
			DrawButton(1337, 900, 150, 64, DialogFindPlayer("FuturisticBraPlayerSolid"), "White", "");
		} if (DialogFocusItem.Property.Type != "Show2") {
			DrawButton(1525, 900, 150, 64, DialogFindPlayer("FuturisticBraPlayerShow2"), "White", "");
		} if (DialogFocusItem.Property.Type != "Solid2") {
			DrawButton(1712, 900, 150, 64, DialogFindPlayer("FuturisticBraPlayerSolid2"), "White", "");
		}
	}

}

// Catches the item extension clicks
function InventoryItemBreastFuturisticBraClick() {
	if (MouseIn(1885, 25, 90, 90)) DialogFocusItem = null;

	if (MouseIn(1150, 900, 800, 64)) {
		var C = (Player.FocusGroup != null) ? Player : CurrentCharacter;

		// If the player can modify
		if (InventoryItemFuturisticValidate(C) == "") {
			if (DialogFocusItem.Property.Type != null && MouseIn(1150, 900, 150, 64)) {
				DialogFocusItem.Property.Type = "";
				if (CurrentScreen == "ChatRoom")
					InventoryItemBreastFuturisticBraPublishAction(C, InventoryItemBreastFuturisticBraOptions[0]);
			} else if (DialogFocusItem.Property.Type != "Solid" && MouseIn(1337, 900, 150, 64)) {
				DialogFocusItem.Property.Type = "Solid";
				if (CurrentScreen == "ChatRoom")
					InventoryItemBreastFuturisticBraPublishAction(C, InventoryItemBreastFuturisticBraOptions[1]);
			} else if (DialogFocusItem.Property.Type != "Show2" && MouseIn(1525, 900, 150, 64)) {
				DialogFocusItem.Property.Type = "Show2";
				if (CurrentScreen == "ChatRoom")
					InventoryItemBreastFuturisticBraPublishAction(C, InventoryItemBreastFuturisticBraOptions[2]);
			} else if (DialogFocusItem.Property.Type != "Solid2" && MouseIn(1712, 900, 150, 64)) {
				DialogFocusItem.Property.Type = "Solid2";
				if (CurrentScreen == "ChatRoom")
					InventoryItemBreastFuturisticBraPublishAction(C, InventoryItemBreastFuturisticBraOptions[3]);
			}

			CharacterRefresh(C, true);
			ChatRoomCharacterUpdate(C);
		}
	}
}

function InventoryItemBreastFuturisticBraPublishAction(C, Option) {
	var msg = "InventoryItemBreastFuturisticBraSet" + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}


/** @type {DynamicAfterDrawCallback} */
function AssetsItemBreastFuturisticBraAfterDraw({
    C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, G, Color
}) {
	if (L === "_Text" && Property && (Property.Type != "Solid" && Property.Type != "Solid2")) {

		var offset = normal_yoffset;
		if (G == "_Large") offset = large_yoffset;
		if (G == "_XLarge") offset = xlarge_yoffset;
		if (G == "_Small") offset = small_yoffset;

		// We set up a canvas
		const Height = 50;
		const Width = 55;
		const TempCanvas = AnimationGenerateTempCanvas(C, A, Width, Height);

		// We draw the desired info on that canvas
		let context = TempCanvas.getContext('2d');
		context.font = "bold 14px sansserif";
		context.fillStyle = "Black";
		context.textAlign = "center";
		const rate = (Property && Property.HeartRate) ? Property.HeartRate.toString() : "--";
		context.fillText(rate, Width / 2 + 1, Width / 2 - 1, Width);
		context.fillText(rate, Width / 2 - 1, Width / 2 + 1, Width);
		context.fillText(rate, Width / 2 + 1, Width / 2 + 1, Width);
		context.fillText(rate, Width / 2 - 1, Width / 2 - 1, Width);

		context.font = "bold 14px sansserif";
		context.fillStyle = Color;
		context.textAlign = "center";
		context.fillText(rate, Width / 2, Width / 2, Width);

		// We print the canvas to the character based on the asset position
		drawCanvas(TempCanvas, X + 47, Y + 103.5 + offset, AlphaMasks);
		drawCanvasBlink(TempCanvas, X + 47, Y + 103.5 + offset, AlphaMasks);
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemBreastFuturisticBraScriptDraw(data) {
	var persistentData = data.PersistentData();
	/** @type {ItemProperties} */
	var property = (data.Item.Property = data.Item.Property || {});
	if (typeof persistentData.UpdateTime !== "number") persistentData.UpdateTime = CommonTime() + 4000;

	if (persistentData.UpdateTime < CommonTime()) {
		var update = InventoryItemBreastFuturisticBraUpdate(data.C);
		property.HeartRate = update.bpm;
		if (property.Type != "Solid" && property.Type != "Solid2")
			if (property.Type == "Show2Heart" || property.Type == "Show2")
				property.Type = (update.breathing == "Action" || update.breathing == "High") ? "Show2Heart" : "Show2";
			else property.Type = (update.breathing == "Action" || update.breathing ==  "High") ? "Heart" : null;

		var timeToNextRefresh = 1100;
		persistentData.UpdateTime = CommonTime() + timeToNextRefresh;
		AnimationRequestRefreshRate(data.C, 5000 - timeToNextRefresh);
		AnimationRequestDraw(data.C);
	}
}
