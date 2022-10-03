"use strict";

const InventoryItemMiscWoodenSignFont = "'Calligraffitti', cursive";

// Loads the item extension properties
function InventoryItemMiscWoodenSignLoad() {
	DynamicDrawLoadFont(InventoryItemMiscWoodenSignFont);

	var C = CharacterGetCurrent();
	var MustRefresh = false;

	if (DialogFocusItem.Property == null) DialogFocusItem.Property = {};
	if (typeof DialogFocusItem.Property.Text !== "string") {
		DialogFocusItem.Property.Text = "";
		MustRefresh = true;
	}
	if (typeof DialogFocusItem.Property.Text2 !== "string") {
		DialogFocusItem.Property.Text2 = "";
		MustRefresh = true;
	}
	if (MustRefresh) {
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}

	const input1 = ElementCreateInput("WoodenSignText1", "text", DialogFocusItem.Property.Text, "12");
	const input2 = ElementCreateInput("WoodenSignText2", "text", DialogFocusItem.Property.Text2, "12");
	if (input1) input1.pattern = DynamicDrawTextInputPattern;
	if (input2) input2.pattern = DynamicDrawTextInputPattern;
}

// Draw the extension screen
function InventoryItemMiscWoodenSignDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	ElementPosition("WoodenSignText1", 1505, 600, 350);
	ElementPosition("WoodenSignText2", 1505, 680, 350);
	DrawButton(
		1330, 731, 340, 64, DialogFindPlayer("SaveText"),
		(ElementValue("WoodenSignText1") + ElementValue("WoodenSignText2")).match(DynamicDrawTextRegex) ? "White" : "#888", "",
	);
}

// Catches the item extension clicks
function InventoryItemMiscWoodenSignClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemMiscWoodenSignExit();
	}

	if (MouseIn(1330, 731, 340, 64) && (ElementValue("WoodenSignText1") + ElementValue("WoodenSignText2")).match(DynamicDrawTextRegex)) {
		DialogFocusItem.Property.Text = ElementValue("WoodenSignText1");
		DialogFocusItem.Property.Text2 = ElementValue("WoodenSignText2");
		InventoryItemMiscWoodenSignChange();
	}
}

// Leaves the extended screen
function InventoryItemMiscWoodenSignExit() {
	ElementRemove("WoodenSignText1");
	ElementRemove("WoodenSignText2");
	PreferenceMessage = "";
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild(CharacterGetCurrent());
}

// When the text is changed
function InventoryItemMiscWoodenSignChange() {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [];
		Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
		Dictionary.push({ Tag: "TargetCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
		ChatRoomPublishCustomAction("WoodenSignChange", true, Dictionary);
		InventoryItemMiscWoodenSignExit();
	}
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemMiscWoodenSignAfterDraw({
	C, A, X, Y, L, Property, drawCanvas, drawCanvasBlink, AlphaMasks, Color
}) {
	if (L === "_Text") {
		// We set up a canvas
		const height = 200;
		const width = 155;
		const tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
		const ctx = tempCanvas.getContext("2d");

		// One line of text will be centered
		const text1 = (Property && typeof Property.Text === "string" && DynamicDrawTextRegex.test(Property.Text) ? Property.Text : "♠");
		const text2 = (Property && typeof Property.Text2 === "string" && DynamicDrawTextRegex.test(Property.Text2) ? Property.Text2 : "♠");
		const isAlone = !text1 || !text2;

		const drawOptions = {
			fontSize: 30,
			fontFamily: InventoryItemMiscWoodenSignFont,
			color: Color,
			effect: DynamicDrawTextEffect.BURN,
			width,
		};

		// Reposition and orient the text when hanging upside-down
		if (C.IsInverted()) {
			ctx.rotate(Math.PI);
			ctx.translate(-tempCanvas.width, -tempCanvas.height);
			Y -= 168;
		}

		DynamicDrawText(text1, ctx, width / 2, height / (isAlone ? 2 : 2.25), drawOptions);
		DynamicDrawText(text2, ctx, width / 2, height / (isAlone ? 2 : 1.75), drawOptions);

		// We print the canvas on the character based on the asset position
		drawCanvas(tempCanvas, X + 170, Y + 200, AlphaMasks);
		drawCanvasBlink(tempCanvas, X + 170, Y + 200, AlphaMasks);
	}
}
