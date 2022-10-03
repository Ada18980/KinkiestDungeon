"use strict";
var InventoryClothAccessoryBibAllowedChars = /^[a-zA-Z0-9 ~!]*$/;
// Loads the item extension properties
function InventoryClothAccessoryBibTxt1Load() {
	ElementCreateInput("TagText", "text", DialogFocusItem.Property.Text || "", "24");
	ElementCreateInput("TagText2", "text", DialogFocusItem.Property.Text2 || "", "24");
}

// Draw the extension screen
function InventoryClothAccessoryBibTxt1Draw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	// Tag data
	ElementPosition("TagText", 1505, 600, 250);
	ElementPosition("TagText2", 1505, 680, 250);
	DrawButton(1330, 731, 340, 64, DialogFindPlayer("CustomTagText"), (ElementValue("TagText") + ElementValue("TagText2")).match(InventoryClothAccessoryBibAllowedChars) ? "White" : "#888", "");
}

// Catches the item extension clicks
function InventoryClothAccessoryBibTxt1Click() {
	if (
		MouseIn(1330, 731, 340, 64) &&
		(DialogFocusItem.Property.Text !== ElementValue("TagText") || DialogFocusItem.Property.Text2 !== ElementValue("TagText2")) &&
		(ElementValue("TagText") + ElementValue("TagText2")).match(InventoryClothAccessoryBibAllowedChars)
	) {
		DialogFocusItem.Property.Text = ElementValue("TagText");
		DialogFocusItem.Property.Text2 = ElementValue("TagText2");
		InventoryClothAccessoryBibChange();
	}

	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryClothAccessoryBibExit();
	}
}

// Leaves the extended screen
function InventoryClothAccessoryBibExit() {
	ElementRemove("TagText");
	ElementRemove("TagText2");
	ExtendedItemSubscreen = null;
}

// When the tag is changed
function InventoryClothAccessoryBibChange() {
	var C = CharacterGetCurrent();
	CharacterRefresh(C, false);
	InventoryClothAccessoryBibExit();
}

/** @type {DynamicAfterDrawCallback} */
function AssetsClothAccessoryBibAfterDraw({
	C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color
}) {
	if (L === "_Text") {
		const Properties = Property || {};
		const Type = Properties.Type || "x0";
		if (!Type.includes("x1")) return;

		// We set up a canvas
		let Height = 65;
		let Width = 120;
		let XOffset = 10;
		let YOffset = 40;
		const FontName = "Pacifico";
		const TempCanvas = AnimationGenerateTempCanvas(C, A, Width, Height);

		const text1 = Property && typeof Property.Text === "string" && InventoryClothAccessoryBibAllowedChars.test(Property.Text) ? Property.Text : "";
		const text2 = Property && typeof Property.Text2 === "string" && InventoryClothAccessoryBibAllowedChars.test(Property.Text2) ? Property.Text2 : "";
		const isAlone = !text1 || !text2;

		const drawOptions = {
			fontSize: 20,
			fontFamily: FontName,
			color: Color,
			width: Width,
		};

		// We draw the desired info on that canvas
		let ctx = TempCanvas.getContext('2d');
		DynamicDrawText(text1, ctx, Width / 2, Height / (isAlone ? 2 : 2.5), drawOptions);
		DynamicDrawText(text2, ctx, Width / 2, Height / (isAlone ? 2 : 1.5), drawOptions);


		// We print the canvas to the character based on the asset position
		drawCanvas(TempCanvas, X + XOffset, Y + YOffset, AlphaMasks);
		drawCanvasBlink(TempCanvas, X + XOffset, Y + YOffset, AlphaMasks);
	}
}
