"use strict";
const InventoryItemHoodCanvasHoodAllowedChars = /^(?:\w|[ ~!$#%*+])*$/;
const InventoryItemHoodCanvasHoodMaxLength = 12;
const InventoryItemHoodCanvasHoodInputId = "InventoryItemHoodCanvasHoodText";
const InventoryItemHoodCanvasHoodFont = "'Saira Stencil One', 'Arial', sans-serif";

/**
 * Loads the canvas hood's extended item properties
 * @returns {void} - Nothing
 */
function InventoryItemHoodCanvasHoodLoad() {
	// Load the font
	DynamicDrawLoadFont(InventoryItemHoodCanvasHoodFont);

	const C = CharacterGetCurrent();
	let MustRefresh = false;

	/** @type {ItemProperties} */
	const Property = DialogFocusItem.Property = DialogFocusItem.Property || {};
	if (typeof Property.Text !== "string") {
		Property.Text = "";
		MustRefresh = true;
	}

	if (MustRefresh) {
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}

	ElementCreateInput(InventoryItemHoodCanvasHoodInputId, "text", Property.Text, InventoryItemHoodCanvasHoodMaxLength);
}

/**
 * Draw handler for the canvas hood's extended item screen
 * @returns {void} - Nothing
 */
function InventoryItemHoodCanvasHoodDraw() {
	// Draw the header and item
	DrawAssetPreview(1387, 125, DialogFocusItem.Asset);

	const updateAllowed = InventoryItemHoodCanvasHoodAllowedChars.test(InventoryItemHoodCanvasHoodGetText());
	DrawTextFit(DialogFindPlayer("CanvasHoodLabel"), 1505, 620, 350, "#fff", "#000");
	ElementPosition(InventoryItemHoodCanvasHoodInputId, 1505, 680, 350);
	DrawButton(1330, 731, 340, 64, DialogFindPlayer("SaveText"), updateAllowed ? "White" : "#888", "");
}

/**
 * Click handler for the canvas hood's extended item screen
 * @returns {void} - Nothing
 */
function InventoryItemHoodCanvasHoodClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		return InventoryItemHoodCanvasHoodExit();
	}

	const text = InventoryItemHoodCanvasHoodGetText();
	if (MouseIn(1330, 731, 340, 64) && InventoryItemHoodCanvasHoodAllowedChars.test(text)) {
		DialogFocusItem.Property.Text = text;
		InventoryItemHoodCanvasHoodChange(text);
	}
}

/**
 * Exits the canvas hood's extended item screen and cleans up inputs and text
 * @returns {void} - Nothing
 */
function InventoryItemHoodCanvasHoodExit() {
	ElementRemove(InventoryItemHoodCanvasHoodInputId);
	PreferenceMessage = "";
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild(CharacterGetCurrent());
}

/**
 * Handles canvas hood text changes. Refreshes the character and sends an
 * appropriate chatroom message
 * @returns {void} - Nothing
 */
function InventoryItemHoodCanvasHoodChange(text) {
	var C = CharacterGetCurrent();
	CharacterRefresh(C);
	if (CurrentScreen == "ChatRoom") {
		var Dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "NewText", Text: text }
		];
		ChatRoomPublishCustomAction("CanvasHoodChange", true, Dictionary);
		InventoryItemHoodCanvasHoodExit();
	}
}

/**
 * Fetches the current input text, trimmed appropriately
 * @returns {string} - The text in the canvas hood's input element
 */
function InventoryItemHoodCanvasHoodGetText() {
	return ElementValue(InventoryItemHoodCanvasHoodInputId).substring(0, InventoryItemHoodCanvasHoodMaxLength);
}

/**
 * Post-render drawing function. Draws custom text in a slight arc to mimic the
 * curvature of the character's head.
 * @type {DynamicAfterDrawCallback}
 */
function AssetsItemHoodCanvasHoodAfterDraw({ C, A, X, Y, L, Property, drawCanvas, drawCanvasBlink, AlphaMasks, Color }) {
	if (L === "_Text") {
		// Fetch the text property and assert that it matches the character
		// and length requirements
		let text = Property && typeof Property.Text === "string" && InventoryItemHoodCanvasHoodAllowedChars.test(Property.Text) ? Property.Text : "";
		text = text.substring(0, InventoryItemHoodCanvasHoodMaxLength);

		// Prepare a temporary canvas to draw the text to
		const height = 50;
		const width = 120;
		const tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
		const ctx = tempCanvas.getContext("2d");

		DynamicDrawTextArc(text, ctx, width / 2, height / 2, {
			fontSize: 36,
			fontFamily: InventoryItemHoodCanvasHoodFont,
			width,
			color: Color,
		});

		const drawX = X + (200 - width) / 2;
		const drawY = Y + 80;

		// Draw the temporary canvas onto the main canvas
		drawCanvas(tempCanvas, drawX, drawY, AlphaMasks);
		drawCanvasBlink(tempCanvas, drawX, drawY, AlphaMasks);
	}
}
