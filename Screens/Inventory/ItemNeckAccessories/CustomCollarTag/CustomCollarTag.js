"use strict";
var InventoryItemNeckAccessoriesCustomCollarTagAllowedChars = /^[a-zA-Z0-9 ~!]*$/;
// Loads the item extension properties
function InventoryItemNeckAccessoriesCustomCollarTagTxt0Load() {
	ElementCreateInput("TagText", "text", DialogFocusItem.Property.Text || "", "9");
}

// Draw the extension screen
function InventoryItemNeckAccessoriesCustomCollarTagTxt0Draw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Tag data
	ElementPosition("TagText", 1375, 680, 250);
	DrawButton(1500, 651, 350, 64, DialogFindPlayer("CustomTagText"), ElementValue("TagText").match(InventoryItemNeckAccessoriesCustomCollarTagAllowedChars) ? "White" : "#888", "");
}

// Catches the item extension clicks
function InventoryItemNeckAccessoriesCustomCollarTagTxt0Click() {
	if (
		MouseIn(1500, 651, 350, 64) &&
		DialogFocusItem.Property.Text !== ElementValue("TagText") &&
		ElementValue("TagText").match(InventoryItemNeckAccessoriesCustomCollarTagAllowedChars)
	) {
		DialogFocusItem.Property.Text = ElementValue("TagText");
		InventoryItemNeckAccessoriesCustomCollarTagChange();
	}

	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemNeckAccessoriesCustomCollarTagExit();
	}
}

// Leaves the extended screen
function InventoryItemNeckAccessoriesCustomCollarTagExit() {
	ElementRemove("TagText");
	ExtendedItemSubscreen = null;
}

// When the tag is changed
function InventoryItemNeckAccessoriesCustomCollarTagChange() {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [];
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
		Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		ChatRoomPublishCustomAction("ChangeCustomTag", false, Dictionary);
	}
	InventoryItemNeckAccessoriesCustomCollarTagExit();
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemNeckAccessoriesCustomCollarTagAfterDraw({
	C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color
}) {
	if (L === "_Text") {
		// Determine the canvas position and size
		const Properties = Property || {};
		const Type = Properties.Type || "t0";

		// We set up a canvas
		let Height = 50;
		let Width = 45;
		let YOffset = 30;
		const FontName = "sans-serif";
		const TempCanvas = AnimationGenerateTempCanvas(C, A, Width, Height);

		if (Type.includes("t1")) {
			YOffset = 45;
		} else if (Type.includes("t3")) {
			YOffset = 32;
		} else if (Type.includes("t4")) {
			YOffset = 31;
		} else if (Type.includes("t5")) {
			YOffset = 31;
		}

		const text = Property && typeof Property.Text === "string" && InventoryItemNeckAccessoriesCustomCollarTagAllowedChars.test(Property.Text) ? Property.Text : "Tag";

		// We draw the desired info on that canvas
		let context = TempCanvas.getContext('2d');
		context.font = "13px " + FontName;
		context.fillStyle = Color;
		context.textAlign = "center";
		context.fillText(text, Width / 2, Width / 2, Width);

		// We print the canvas to the character based on the asset position
		drawCanvas(TempCanvas, X + 227.5, Y + YOffset, AlphaMasks);
		drawCanvasBlink(TempCanvas, X + 227.5, Y + YOffset, AlphaMasks);
	}
}
