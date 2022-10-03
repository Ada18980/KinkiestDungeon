"use strict";
const InventoryItemDevicesPetBowlMaxLength = 12;
const InventoryItemDevicesPetBowlInputId = "InventoryItemDevicesPetBowlText";
const InventoryItemDevicesPetBowlFont = "'Saira Stencil One', 'Arial', sans-serif";

/**
 * Loads the extended item properties
 * @returns {void} - Nothing
 */
function InventoryItemDevicesPetBowlLoad() {
	// Load the font
	DynamicDrawLoadFont(InventoryItemDevicesPetBowlFont);

	const C = CharacterGetCurrent();
	let MustRefresh = false;

	/** @type {ItemProperties} */
	const Property = (DialogFocusItem.Property = DialogFocusItem.Property || {});
	if (typeof Property.Text !== "string") {
		Property.Text = "";
		MustRefresh = true;
	}

	if (MustRefresh) {
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}

	const input = ElementCreateInput(InventoryItemDevicesPetBowlInputId, "text", Property.Text, InventoryItemDevicesPetBowlMaxLength);
	if (input) input.pattern = DynamicDrawTextInputPattern;
}

/**
 * Draw handler for the extended item screen
 * @returns {void} - Nothing
 */
function InventoryItemDevicesPetBowlDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	const updateAllowed = DynamicDrawTextRegex.test(InventoryItemDevicesPetBowlGetText());
	DrawTextFit(DialogFindPlayer("PetBowlLabel"), 1505, 620, 350, "#fff", "#000");
	ElementPosition(InventoryItemDevicesPetBowlInputId, 1505, 680, 350);
	DrawButton(1330, 731, 340, 64, DialogFindPlayer("SaveText"), updateAllowed ? "White" : "#888", "");
}

/**
 * Click handler for the extended item screen
 * @returns {void} - Nothing
 */
function InventoryItemDevicesPetBowlClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		return InventoryItemDevicesPetBowlExit();
	}

	const text = InventoryItemDevicesPetBowlGetText();
	if (MouseIn(1330, 731, 340, 64) && DynamicDrawTextRegex.test(text)) {
		DialogFocusItem.Property.Text = text;
		InventoryItemDevicesPetBowlChange(text);
	}
}

/**
 * Exits the extended item screen and cleans up inputs and text
 * @returns {void} - Nothing
 */
function InventoryItemDevicesPetBowlExit() {
	ElementRemove(InventoryItemDevicesPetBowlInputId);
	DialogFocusItem = null;
}

/**
 * Handles text changes. Refreshes the character and sends an appropriate chatroom message
 * @returns {void} - Nothing
 */
function InventoryItemDevicesPetBowlChange(text) {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "NewText", Text: text }
		];
		ChatRoomPublishCustomAction("PetBowlChange", true, Dictionary);
		InventoryItemDevicesPetBowlExit();
	}
}

/**
 * Fetches the current input text, trimmed appropriately
 * @returns {string} - The text in the canvas hood's input element
 */
function InventoryItemDevicesPetBowlGetText() {
	return ElementValue(InventoryItemDevicesPetBowlInputId).substring(0, InventoryItemDevicesPetBowlMaxLength);
}

/**
 * Post-render drawing function. Draws custom text in a slight arc to mimic the
 * curvature of the bowl.
 * @type {DynamicAfterDrawCallback}
 */
function AssetsItemDevicesPetBowlAfterDraw({ C, A, X, Y, L, Property, drawCanvas, drawCanvasBlink, AlphaMasks, Color }) {
	if (L === "_Text") {
		// Fetch the text property and assert that it matches the character
		// and length requirements
		let text = Property && typeof Property.Text === "string" && DynamicDrawTextRegex.test(Property.Text) ? Property.Text : "";
		text = text.substring(0, InventoryItemDevicesPetBowlMaxLength);

		// Prepare a temporary canvas to draw the text to
		const height = 60;
		const width = 130;
		const tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
		const ctx = tempCanvas.getContext("2d");

		// Reposition and orient the text when hanging upside-down
		if (C.IsInverted()) {
			ctx.rotate(Math.PI);
			ctx.translate(-tempCanvas.width, -tempCanvas.height);
			Y -= 60;
			X -= 300;
		}

		DynamicDrawTextArc(text, ctx, width / 2, 42, {
			fontSize: 36,
			fontFamily: InventoryItemDevicesPetBowlFont,
			width,
			color: Color,
			angle: Math.PI,
			direction: DynamicDrawTextDirection.ANTICLOCKWISE,
			textCurve: DynamicDrawTextCurve.SMILEY,
			radius: 350,
		});

		// Draw the temporary canvas onto the main canvas
		drawCanvas(tempCanvas, X, Y, AlphaMasks);
		drawCanvasBlink(tempCanvas, X, Y, AlphaMasks);
	}
}
