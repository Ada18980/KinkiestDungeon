"use strict";
const InventoryItemDevicesLockerOpacityInputId = "InventoryItemDevicesLockerOpacity";

const ItemDevicesLockerOptions = [
	{
		Name: "Vents",
		Property: { Type: null }
	}, {
		Name: "Ventless",
		Property: { Type: "Ventless", Effect: ["GagLight", "BlindHeavy"] }
	}
];

function InventoryItemDevicesLockerLoad() {
	const C = CharacterGetCurrent();
	const item = DialogFocusItem;
	/** @type {ItemProperties} */
	const property = item.Property = item.Property || {};
	let refresh = false;
	if (typeof property.Opacity !== "number") {
		property.Opacity = 0;
		refresh = true;
	}

	if (!ItemDevicesLockerOptions.find(option => option.Property.Type === property.Type)) {
		property.Type = ItemDevicesLockerOptions[0].Property.Type;
		refresh = true;
	}

	if (refresh) CharacterRefresh(C, false);

	const opacitySlider = ElementCreateRangeInput(InventoryItemDevicesLockerOpacityInputId, property.Opacity, item.Asset.MinOpacity, item.Asset.MaxOpacity, 0.01, "blindfold");
	if (opacitySlider) {
		opacitySlider.addEventListener("input", (e) => InventoryItemDevicesLockerOpacityChange(C, item, Number(e.target.value)));
	}
}

function InventoryItemDevicesLockerDraw() {
	const asset = DialogFocusItem.Asset;
	const property = DialogFocusItem.Property;

	// Draw the header and item
	DrawAssetPreview(1387, 55, asset);

	MainCanvas.textAlign = "left";
	DrawTextFit(DialogFindPlayer("InventoryItemDevicesLockerOpacity"), 1185, 430, 400, "#fff", "#000");
	ElementPosition(InventoryItemDevicesLockerOpacityInputId, 1700, 430, 425);
	MainCanvas.textAlign = "center";

	DrawTextFit(DialogFindPlayer("InventoryItemDevicesLockerType"), 1500, 530, 800, "#fff", "#000");

	ItemDevicesLockerOptions.forEach((option, i) => {
		const x = ExtendedXY[ItemDevicesLockerOptions.length][i][0];
		const y = ExtendedXY[ItemDevicesLockerOptions.length][i][1] + 80;
		const isSelected = property.Type === option.Property.Type;
		const description = DialogFindPlayer(`InventoryItemDevicesLockerType${option.Name}`);

		DrawPreviewBox(
			x, y, `${AssetGetInventoryPath(asset)}/${option.Name}.png`, description,
			{ Border: true, Hover: true, Disabled: isSelected },
		);
	});
}

function InventoryItemDevicesLockerClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		return InventoryItemDevicesLockerExit();
	}

	// Option clicked
	const C = CharacterGetCurrent();
	ItemDevicesLockerOptions.forEach((option, i) => {
		const x = ExtendedXY[ItemDevicesLockerOptions.length][i][0];
		const y = ExtendedXY[ItemDevicesLockerOptions.length][i][1] + 80;

		if (MouseIn(x, y, 225, 275)) {
			ExtendedItemHandleOptionClick(C, ItemDevicesLockerOptions, option);
		}
	});
}

/**
 * Throttled callback for opacity slider changes
 * @param {Character} C - The character being modified
 * @param {Item} item - The item being modified
 * @param {number} brightness - The new brightness to set on the item
 * @returns {void} - Nothing
 */
const InventoryItemDevicesLockerOpacityChange = CommonLimitFunction((C, item, brightness) => {
	item.Property.Opacity = brightness;
	CharacterLoadCanvas(C);
});

/**
 * Exit handler for the item's extended item screen. Updates the character and removes UI components.
 * @returns {void} - Nothing
 */
function InventoryItemDevicesLockerExit() {
	const C = CharacterGetCurrent();
	const item = DialogFocusItem;

	item.Property.Opacity = Number(ElementValue(InventoryItemDevicesLockerOpacityInputId));
	ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

	ElementRemove(InventoryItemDevicesLockerOpacityInputId);
	PreferenceMessage = "";
	DialogFocusItem = null;
}

/**
 * Publishes the message to the chat
 * @param {Character} C - The target character
 * @param {ExtendedItemOption} Option - The currently selected Option
 * @returns {void} - Nothing
 */
function InventoryItemDevicesLockerPublishAction(C, Option) {
	var msg = "InventoryItemDevicesLockerChange";
	var Dictionary = [];
	Dictionary.push({ Tag: "SourceCharacter", Text: CharacterNickname(Player), MemberNumber: Player.MemberNumber });
	Dictionary.push({ Tag: "DestinationCharacter", Text: CharacterNickname(C), MemberNumber: C.MemberNumber });
	ChatRoomPublishCustomAction(msg, true, Dictionary);
}

/**
 * The NPC dialog is for what the NPC says to you when you make a change to their restraints
 * @param {Character} C - The NPC to whom the restraint is applied
 * @param {ExtendedItemOption} Option - The chosen option for this extended item
 * @returns {void} - Nothing
 */
function InventoryItemDevicesLockerNpcDialog(C, Option) {
	C.CurrentDialog = DialogFind(C, "LockerState" + Option.Name, "ItemDevices");
}
