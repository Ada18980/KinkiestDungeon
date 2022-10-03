//Heavily References Bib.js and Transport Jacket
"use strict";
let InventoryItemHeadDroneMaskOriginalText = "";
//let DroneMaskPreviousText = null;
const InventoryItemHeadDroneMaskInputId = "DroneMaskText";
const InventoryItemHeadDroneMaskFont = "Impact";
const InventoryItemHeadDroneMaskAllowedChars = /^[a-zA-Z0-9 ~!]*$/;
const InventoryItemHeadDroneMaskMaxChars = 16;
var InventoryItemHeadDroneMaskYOffset = 89; // For testing text position for those with longer hair

// Load item extension properties
function InventoryItemHeadDroneMaskPattern5Load() {
	InventoryItemHeadDroneMaskOriginalText = DialogFocusItem.Property.Text;
	InventoryItemHeadDroneMaskPattern5LoadBase();
}

function InventoryItemHeadDroneMaskPattern5LoadBase() {

	const C = CharacterGetCurrent();

	// Dynamically displayed input
	const input = ElementCreateInput(
		InventoryItemHeadDroneMaskInputId, "text", DialogFocusItem.Property.Text || "",
		InventoryItemHeadDroneMaskMaxChars.toString(),
	);
	if (input) {
		input.pattern = DynamicDrawTextInputPattern;
		input.addEventListener("input", (e) => InventoryItemHeadDroneMaskTextChange(C, DialogFocusItem, e.target.value))
	}
}

// Draw extension screen image
function InventoryItemHeadDroneMaskPattern5Draw() {
    // Draw header and item
    DrawAssetPreview(1387,125, DialogFocusItem.Asset);

    // Tag data
    ElementPosition (InventoryItemHeadDroneMaskInputId, 1505, 600, 250);
    DrawButton(1330,731,340,64, DialogFindPlayer("CustomTagText"), (ElementValue(InventoryItemHeadDroneMaskInputId)).match(InventoryItemHeadDroneMaskAllowedChars) ? "White" : "#888", "");
}

// Click function
function InventoryItemHeadDroneMaskPattern5Click() {
	if (MouseIn(1330, 731, 340, 64)) {
		InventoryItemHeadDroneMaskPattern5SaveAndExit(InventoryItemHeadDroneMaskOriginalText);
		InventoryItemHeadDroneMaskPattern5ExitSubscreen();
	}
	// Exits screen
	else if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemHeadDroneMaskPattern5Exit(InventoryItemHeadDroneMaskOriginalText);
		InventoryItemHeadDroneMaskPattern5ExitSubscreen();
	}
}

// Exit the subscreen
function InventoryItemHeadDroneMaskPattern5ExitSubscreen() {
	ElementRemove(InventoryItemHeadDroneMaskInputId);
	InventoryItemHeadDroneMaskOriginalText = "";
	ExtendedItemSubscreen = null;
}

// Save text changes and exit subscreen
function InventoryItemHeadDroneMaskPattern5SaveAndExit(OriginalText) {
	const C = CharacterGetCurrent();
	const item = DialogFocusItem;

	const text = ElementValue(InventoryItemHeadDroneMaskInputId).substring(0, InventoryItemHeadDroneMaskMaxChars);
	if (InventoryItemHeadDroneMaskAllowedChars.test(text)) {
		item.Property.Text = text;
	}
	if (CurrentScreen === "ChatRoom" && text !== OriginalText) {
		const dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "NewText", Text: text },
			{ Tag: "AssetName", AssetName: item.Asset.Name },
		];
		const msg = text === "" ? "ItemHeadDroneMaskTextRemove" : "ItemHeadDroneMaskTextChange";
		ChatRoomPublishCustomAction(msg, false, dictionary);
	}
	CharacterRefresh(C);
	ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
}

// Revert text changes and exit subscreen
function InventoryItemHeadDroneMaskPattern5Exit(OriginalText) {
	DialogFocusItem.Property.Text = OriginalText;
	CharacterLoadCanvas(CharacterGetCurrent());
}

// Exit the item's extended screen
function InventoryItemHeadDroneMaskExit() {
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild(CharacterGetCurrent());
	return ExtendedItemExit();
}

// Referenced from TransportJacket for dynamic display
const InventoryItemHeadDroneMaskTextChange = CommonLimitFunction((C, item, text) => {
	item = DialogFocusItem || item;
	if (DynamicDrawTextRegex.test(text)) {
		item.Property.Text = text.substring(0, InventoryItemHeadDroneMaskMaxChars);
		CharacterLoadCanvas(C);
	}
});

/** @type {DynamicAfterDrawCallback} */
function AssetsItemHeadDroneMaskAfterDraw({
    C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color
}) {
	const YOffset = InventoryItemHeadDroneMaskYOffset;
	AssetsItemHeadDroneMaskAfterDrawBase({
		C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color, YOffset,
	})
}

function AssetsItemHeadDroneMaskAfterDrawBase({
    C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color, YOffset,
}) {
	if (L === "_Text"){
		const Properties = Property || {};
		const Type = Properties.Type || "p0";
		if (!Type.includes("p5")) return;

		// Canvas setup
		let Height = 65;
		let Width = 65;
		let XOffset = 67;
		// let YOffset = 89;
		const FontName = InventoryItemHeadDroneMaskFont;
		const TempCanvas = AnimationGenerateTempCanvas(C, A, Width, Height);

		const text = Property && typeof Property.Text === "string" && InventoryItemHeadDroneMaskAllowedChars.test(Property.Text) ? Property.Text : "";
		const isAlone = !text;

		const drawOptions = {
			fontSize: 20,
			fontFamily: FontName,
			color: Color,
			width: Width,
		};

		// Draw the text onto the canvas
		let ctx = TempCanvas.getContext('2d');
		DynamicDrawText(text, ctx, Width/2, Height/ (isAlone? 2: 2.5), drawOptions);

		//And print the canvas onto the character based on the above positions
		drawCanvas(TempCanvas, X+ XOffset, Y + YOffset, AlphaMasks);
		drawCanvasBlink(TempCanvas, X + XOffset, Y + YOffset, AlphaMasks);
	}
}
