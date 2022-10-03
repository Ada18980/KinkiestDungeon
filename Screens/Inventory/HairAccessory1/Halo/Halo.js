"use strict";
const InventoryHairAccessory1HaloBrightnessInputId = "InventoryHairAccessory1HaloBrightness";

const InventoryHairAccessory1HaloOptions = [
	{
		Name: "Default",
		Property: { Type: null },
	},
	{
		Name: "Broken",
		Property: { Type: "Broken" },
	},
];

/**
 * Loads the extended item's properties
 * @returns {void} - Nothing
 */
function InventoryHairAccessory1HaloLoad() {
	const C = CharacterAppearanceSelection;
	const item = DialogFocusItem;
	/** @type {ItemProperties} */
	const property = item.Property = item.Property || {};
	let refresh = false;
	if (typeof property.Opacity !== "number") {
		property.Opacity = 0;
		refresh = true;
	}

	if (!InventoryHairAccessory1HaloOptions.find(option => option.Property.Type === property.Type)) {
		property.Type = InventoryHairAccessory1HaloOptions[0].Property.Type;
		refresh = true;
	}

	if (refresh) CharacterRefresh(C, false);

	const brightnessInput = ElementCreateRangeInput(
		InventoryHairAccessory1HaloBrightnessInputId, property.Opacity, item.Asset.MinOpacity, item.Asset.MaxOpacity, 0.01, "lightbulb");
	if (brightnessInput) {
		brightnessInput.addEventListener(
			"input",
			(e) => InventoryHairAccessory1HaloBrightnessChange(C, item, Number(e.target.value)),
		);
	}
}

/**
 * Handles drawing the Halo's extended item screen
 * @returns {void} - Nothing
 */
function InventoryHairAccessory1HaloDraw() {
	const asset = DialogFocusItem.Asset;
	const property = DialogFocusItem.Property;

	// Draw the header and item
	DrawAssetPreview(1387, 55, asset);

	MainCanvas.textAlign = "left";
	DrawTextFit(DialogFindPlayer("InventoryHairAccessory1HaloBrightness"), 1185, 430, 200, "#fff", "#000");
	ElementPosition(InventoryHairAccessory1HaloBrightnessInputId, 1630, 430, 400);
	MainCanvas.textAlign = "center";

	DrawTextFit(DialogFindPlayer("InventoryHairAccessory1HaloType"), 1500, 530, 800, "#fff", "#000");

	InventoryHairAccessory1HaloOptions.forEach((option, i) => {
		const x = ExtendedXY[InventoryHairAccessory1HaloOptions.length][i][0];
		const y = ExtendedXY[InventoryHairAccessory1HaloOptions.length][i][1] + 80;
		const isSelected = property.Type === option.Property.Type;
		const description = DialogFindPlayer(`InventoryHairAccessory1HaloType${option.Name}`);

		DrawPreviewBox(
			x, y, `${AssetGetInventoryPath(asset)}/${option.Name}.png`, description,
			{ Border: true, Hover: true, Disabled: isSelected },
		);
	});
}

/**
 * Handles clicks on the Halo's extended item screen
 * @returns {void} - Nothing
 */
function InventoryHairAccessory1HaloClick() {
	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		return InventoryHairAccessory1HaloExit();
	}

	const C = CharacterGetCurrent();

	InventoryHairAccessory1HaloOptions.forEach((option, i) => {
		const x = ExtendedXY[InventoryHairAccessory1HaloOptions.length][i][0];
		const y = ExtendedXY[InventoryHairAccessory1HaloOptions.length][i][1] + 80;

		if (MouseIn(x, y, 225, 275)) {
			ExtendedItemHandleOptionClick(C, InventoryHairAccessory1HaloOptions, option);
		}
	});
}

/**
 * Debounced callback for opacity slider changes
 * @param {Character} C - The character being modified
 * @param {Item} item - The halo item being modified
 * @param {number} brightness - The new brightness to set on the halo
 * @returns {void} - Nothing
 */
const InventoryHairAccessory1HaloBrightnessChange = CommonLimitFunction((C, item, brightness) => {
	item.Property.Opacity = brightness;
	CharacterLoadCanvas(C);
});

/**
 * Exit handler for the Halo's extended item screen. Updates the character and removes UI components.
 * @returns {void} - Nothing
 */
function InventoryHairAccessory1HaloExit() {
	const C = CharacterAppearanceSelection;
	const item = DialogFocusItem;

	item.Property.Opacity = Number(ElementValue(InventoryHairAccessory1HaloBrightnessInputId));
	ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

	ElementRemove(InventoryHairAccessory1HaloBrightnessInputId);
	PreferenceMessage = "";
	DialogFocusItem = null;
}
