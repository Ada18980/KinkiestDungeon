"use strict";

let InventoryItemArmsTransportJacketOriginalText = null;
const InventoryItemArmsTransportJacketInputId = "TransportJacketText";
const InventoryItemArmsTransportJacketMaxLength = 14;
const InventoryItemArmsTransportJacketFont = "'Saira Stencil One', 'Arial', sans-serif";

/** @type ExtendedItemOption[] */
const InventoryItemArmsTransportJacketOptions = [
	{
		Name: "NoShorts",
		Property: { Type: null, Difficulty: 0 },
	},
	{
		Name: "Shorts",
		Property: {
			Type: "Shorts",
			Block: ["ItemNipples", "ItemNipplesPiercings", "ItemTorso", "ItemBreast", "ItemHands", "ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemPelvis"],
			Hide: ["Cloth", "ClothLower", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPiercings", "ItemButt", "Panties", "Corset"],
			HideItemExclude: ["ClothLowerJeans1", "ClothLowerJeans2", "ClothLowerLatexPants1", "ClothLowerLeggings1", "ClothLowerLeggings2", "PantiesHarnessPanties1", "PantiesHarnessPanties2"],
		},
	},
	{
		Name: "ShortsAndStraps",
		Property: {
			Type: "ShortsAndStraps",
			Block: ["ItemNipples", "ItemNipplesPiercings", "ItemTorso", "ItemBreast", "ItemHands", "ItemVulva", "ItemVulvaPiercings", "ItemButt", "ItemPelvis"],
			Hide: ["Cloth", "ClothLower", "ItemNipplesPiercings", "ItemVulva", "ItemVulvaPiercings", "ItemButt", "Panties", "Corset"],
			HideItemExclude: ["ClothLowerJeans1", "ClothLowerJeans2", "ClothLowerLatexPants1", "ClothLowerLeggings1", "ClothLowerLeggings2", "PantiesHarnessPanties1", "PantiesHarnessPanties2"],
		},
	},
];

function InventoryItemArmsTransportJacketLoad() {
	ExtendedItemLoad(InventoryItemArmsTransportJacketOptions, "ItemArmsTransportJacketSelect");

	const C = CharacterGetCurrent();

	let refresh = false;
	if (!DialogFocusItem.Property) DialogFocusItem.Property = {};
	if (DialogFocusItem.Property.Text == null) {
		DialogFocusItem.Property.Text = "";
		refresh = true;
	}
	if (refresh) {
		CharacterRefresh(C);
		ChatRoomCharacterItemUpdate(C, DialogFocusItem.Asset.Group.Name);
	}

	if (InventoryItemArmsTransportJacketOriginalText == null) {
		InventoryItemArmsTransportJacketOriginalText = DialogFocusItem.Property.Text;
	}

	const input = ElementCreateInput(
		InventoryItemArmsTransportJacketInputId, "text", DialogFocusItem.Property.Text, InventoryItemArmsTransportJacketMaxLength);
	if (input) {
		input.pattern = DynamicDrawTextInputPattern;
		input.addEventListener("input", (e) => InventoryItemArmsTransportJacketTextChange(C, DialogFocusItem, e.target.value));
	}
}

function InventoryItemArmsTransportJacketDraw() {
	ExtendedItemDraw(InventoryItemArmsTransportJacketOptions, "ItemArmsTransportJacket", 3);

	MainCanvas.textAlign = "right";
	DrawTextFit(DialogFindPlayer("ItemArmsTransportJacketTextLabel"), 1475, 860, 400, "#fff", "#000");
	ElementPosition(InventoryItemArmsTransportJacketInputId, 1725, 860, 400);
	MainCanvas.textAlign = "center";
}

function InventoryItemArmsTransportJacketClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemArmsTransportJacketExit();
		return ExtendedItemExit();
	}

	ExtendedItemClick(InventoryItemArmsTransportJacketOptions, 3);
}

function InventoryItemArmsTransportJacketPublishAction(C, Option, PreviousOption) {
	var msg = "ItemArmsTransportJacketSet" + PreviousOption.Name + Option.Name;
	var Dictionary = [
		{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
		{ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
		{ Tag: "AssetName", AssetName: DialogFocusItem.Asset.Name },
	];
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

const InventoryItemArmsTransportJacketTextChange = CommonLimitFunction((C, item, text) => {
	item = DialogFocusItem || item;
	if (DynamicDrawTextRegex.test(text)) {
		item.Property.Text = text.substring(0, InventoryItemArmsTransportJacketMaxLength);
		CharacterLoadCanvas(C);
	}
});

function InventoryItemArmsTransportJacketExit() {
	const C = CharacterGetCurrent();
	const item = DialogFocusItem;

	const text = ElementValue(InventoryItemArmsTransportJacketInputId).substring(0, InventoryItemArmsTransportJacketMaxLength);
	if (DynamicDrawTextRegex.test(text)) item.Property.Text = text;
	if (CurrentScreen === "ChatRoom" && text !== InventoryItemArmsTransportJacketOriginalText) {
		const dictionary = [
			{ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber },
			{ Tag: "DestinationCharacterName", Text: CharacterNickname(C), MemberNumber: C.MemberNumber },
			{ Tag: "NewText", Text: text },
			{ Tag: "AssetName", AssetName: item.Asset.Name },
		];
		const msg = text === "" ? "ItemArmsTransportJacketTextRemove" : "ItemArmsTransportJacketTextChange";
		ChatRoomPublishCustomAction(msg, false, dictionary);
	}

	CharacterRefresh(C);
	ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

	ElementRemove(InventoryItemArmsTransportJacketInputId);
	InventoryItemArmsTransportJacketOriginalText = null;
	DialogFocusItem = null;
	if (DialogInventory != null) DialogMenuButtonBuild(C);
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemArmsTransportJacketAfterDraw({ C, A, X, Y, L, Pose, Property, drawCanvas, drawCanvasBlink, AlphaMasks, Color }) {
	if (L === "_Text") {
		const width = 150;
		const height = 60;
		const flatCanvas = AnimationGenerateTempCanvas(C, A, width, height);
		const flatCtx = flatCanvas.getContext("2d");

		let text = Property && typeof Property.Text === "string" && DynamicDrawTextRegex.test(Property.Text) ? Property.Text : "";
		text = text.substring(0, InventoryItemArmsTransportJacketMaxLength);

		DynamicDrawText(text, flatCtx, width / 2, height / 2, {
			fontSize: 40,
			fontFamily: InventoryItemArmsTransportJacketFont,
			color: Color,
			width,
		});

		const interpolatedCanvas = AnimationGenerateTempCanvas(C, A, width, height);
		const interpolatedCtx = interpolatedCanvas.getContext("2d");

		const xTop = width * 0.15;
		for (let i = 0; i < height; i++) {
			const xStart = xTop - (xTop * i) / height;
			interpolatedCtx.drawImage(flatCanvas, 0, i, width, 1, xStart, i, width - xStart * 2, 1);
		}

		const drawX = X + (300 - width) / 2;
		const drawY = Y + 75;
		drawCanvas(interpolatedCanvas, drawX, drawY, AlphaMasks);
		drawCanvasBlink(interpolatedCanvas, drawX, drawY, AlphaMasks);
	}
}
