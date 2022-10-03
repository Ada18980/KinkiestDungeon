"use strict";
var InventoryItemNeckRestraintsPetPostAllowedChars = /^[a-zA-Z0-9 ~!'.,?!-*€$/]*$/;
// Loads the item extension properties
function InventoryItemNeckRestraintsPetPostTxt0Load() {
	ElementCreateInput("SignText", "text", DialogFocusItem.Property.Text || "", "14");
	ElementCreateInput("SignText2", "text2", DialogFocusItem.Property.Text2 || "", "14");
	ElementCreateInput("SignText3", "text3", DialogFocusItem.Property.Text3 || "", "14");
}

// Draw the extension screen
function InventoryItemNeckRestraintsPetPostTxt0Draw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Tag data
	ElementPosition("SignText", 1510, 560, 250);
	ElementPosition("SignText2", 1510, 620, 250);
	ElementPosition("SignText3", 1510, 680, 250);
	DrawButton(1375, 740, 250, 64, DialogFindPlayer("PetPostText"), ElementValue("SignText").match(InventoryItemNeckRestraintsPetPostAllowedChars) ? "White" : "#888", "");
}

// Catches the item extension clicks
function InventoryItemNeckRestraintsPetPostTxt0Click() {
	if (
		MouseIn(1375, 740, 250, 64) && 
		(
		DialogFocusItem.Property.Text !== ElementValue("SignText") &&
		ElementValue("SignText").match(InventoryItemNeckRestraintsPetPostAllowedChars)||
		DialogFocusItem.Property.Text2 !== ElementValue("SignText2") &&
		ElementValue("SignText2").match(InventoryItemNeckRestraintsPetPostAllowedChars)||
		DialogFocusItem.Property.Text3 !== ElementValue("SignText3") &&
		ElementValue("SignText3").match(InventoryItemNeckRestraintsPetPostAllowedChars)
		)
	) {
		DialogFocusItem.Property.Text = ElementValue("SignText");
		DialogFocusItem.Property.Text2 = ElementValue("SignText2");
		DialogFocusItem.Property.Text3 = ElementValue("SignText3");
		InventoryItemNeckRestraintsPetPostChange();
	}

	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemNeckRestraintsPetPostExit();
	}
}

// Leaves the extended screen
function InventoryItemNeckRestraintsPetPostExit() {
	ElementRemove("SignText");
	ElementRemove("SignText2");
	ElementRemove("SignText3");
	ExtendedItemSubscreen = null;
}

// When the tag is changed
function InventoryItemNeckRestraintsPetPostChange() {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [];
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
		Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		ChatRoomPublishCustomAction("ChangeSign", false, Dictionary);
	}
	InventoryItemNeckRestraintsPetPostExit();
}

// Drawing function for the text on the sign
function AssetsItemNeckRestraintsPetPostAfterDraw({
    C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color
}) {
    if (L === "_Text") {
        // Determine the canvas position and size
        const Properties = Property || {};
        const Type = Properties.Type || "t0";

        // We set up a canvas
        let Height = 100;
		let Width = 90;
        let YOffset = 20;
        const FontName = "sans-serif";
        const TempCanvas = AnimationGenerateTempCanvas(C, A, Width, Height);
        let text = Property && typeof Property.Text === "string" && InventoryItemNeckRestraintsPetPostAllowedChars.test(Property.Text) ? Property.Text : "Pet";
		let text2 = Property && typeof Property.Text2 === "string" && InventoryItemNeckRestraintsPetPostAllowedChars.test(Property.Text2) ? Property.Text2 : "Leashing";
		let text3 = Property && typeof Property.Text3 === "string" && InventoryItemNeckRestraintsPetPostAllowedChars.test(Property.Text2) ? Property.Text3 : "Post";

        // We draw the desired info on that canvas
        let context = TempCanvas.getContext('2d');
        context.font = "22px " + FontName;
        context.fillStyle = Color;
        context.textAlign = "center";
        context.fillText(text, Width / 2, Height / 2, Width);
        context.fillText(text2, Width / 2, Height / 2 + 24, Width);
		context.fillText(text3, Width / 2, Height / 2 + 46, Width);

        // We print the canvas to the character based on the asset position
        drawCanvas(TempCanvas, X + 24, Y + YOffset, AlphaMasks);
        drawCanvasBlink(TempCanvas, X + 24, Y + YOffset, AlphaMasks);
    }
}

/*

*/
