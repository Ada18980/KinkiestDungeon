"use strict";

/**
 * An object defining a group of layers which can be colored together
 * @typedef {object} ColorGroup
 * @property {string} name - The name of the color group
 * @property {AssetLayer[]} layers - The layers contained within the color group
 * @property {number} colorIndex - The color index for the color group - this is the lowest color index of any of the layers within the
 * color group
 */

/**
 * A callback function that is called when the item color UI exits
 * @callback itemColorExitListener
 * @param {Character} c - The character being colored
 * @param {Item} item - The item being colored
 * @param {boolean} save - Whether the item's appearance changes should be saved
 */

/**
 * A configuration object containing constants used by the ItemColor UI scripts
 * @constant {{
 *     colorPickerButtonWidth: number,
 *     colorInputHeight: number,
 *     colorDisplayWidth: number,
 *     buttonSpacing: number,
 *     headerButtonSize: number,
 *     buttonSize: number,
 * }}
 */
const ItemColorConfig = {
	buttonSpacing: 20,
	buttonSize: 65,
	headerButtonSize: 90,
	colorPickerButtonWidth: 65,
	colorDisplayWidth: 160,
	colorInputHeight: 45,
};

/**
 * An enum for the possible item color UI modes
 * @readonly
 * @enum {string}
 */
const ItemColorMode = {
	DEFAULT: "Default",
	COLOR_PICKER: "ColorPicker",
};

let ItemColorCharacter;
let ItemColorItem;
let ItemColorCurrentMode = ItemColorMode.DEFAULT;
let ItemColorStateKey;
let ItemColorState;
let ItemColorPage;
let ItemColorLayerPages = {};
let ItemColorPickerBackup;
let ItemColorPickerIndices = [];
let ItemColorExitListeners = [];
let ItemColorBackup;
let ItemColorText = new TextCache("Screens/Character/ItemColor/ItemColor.csv");
let ItemColorLayerNames;
let ItemColorGroupNames;

/**
 * Loads the item color UI with the provided character, item and positioning parameters.
 * @param {Character} c - The character being colored
 * @param {Item} item - The item being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} [includeResetButton] - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
function ItemColorLoad(c, item, x, y, width, height, includeResetButton) {
	ItemColorReset();
	ItemColorCharacter = c;
	ItemColorItem = item;
	ItemColorBackup = AppearanceItemStringify(item);
	ItemColorStateBuild(c, item, x, y, width, height, includeResetButton);
	if (ItemColorState.simpleMode) {
		ItemColorOpenPicker(ItemColorState.colorGroups[0]);
	}
	ItemColorLayerNames = new TextCache(`Assets/${c.AssetFamily}/LayerNames.csv`);
	ItemColorGroupNames = new TextCache(`Assets/${c.AssetFamily}/ColorGroups.csv`);
}

/**
 * Draws the item color UI according to its current state
 * @param {Character} c - The character being colored
 * @param {string} group - The name of the item group being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} includeResetButton - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
function ItemColorDraw(c, group, x, y, width, height, includeResetButton) {
	const item = InventoryGet(c, group);
	if (!item) {
		return;
	}
	ItemColorStateBuild(c, item, x, y, width, height, includeResetButton);

	const headerButtonSize = ItemColorConfig.headerButtonSize;

	if (ItemColorCurrentMode === ItemColorMode.DEFAULT && ItemColorState.pageCount > 1) {
		DrawButton(
			ItemColorState.paginationButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Next.png",
			ItemColorText.get("Next"),
		);
	}

	if (ItemColorCurrentMode === ItemColorMode.COLOR_PICKER) {
		if (ItemColorState.drawExport) {
			DrawButton(ItemColorState.exportButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Export.png");
		}
		if (ItemColorState.drawImport) {
			DrawButton(ItemColorState.importButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Import.png");
		}
		if (includeResetButton) {
			DrawButton(ItemColorState.resetButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Reset.png");
		}
	}

	DrawButton(
		ItemColorState.cancelButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Cancel.png",
	);

	DrawButton(
		ItemColorState.saveButtonX, y, headerButtonSize, headerButtonSize, "", "#fff", "Icons/Accept.png",
	);

	const contentY = ItemColorState.contentY;

	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			ElementPosition(
				"InputColor",
				ItemColorState.colorInputX,
				ItemColorState.colorInputY,
				ItemColorState.colorInputWidth,
				ItemColorConfig.colorInputHeight,
			);
			return ColorPickerDraw(
				x, contentY, width, y + height - contentY, document.getElementById("InputColor"), ItemColorOnPickerChange);
		default:
			return ItemColorDrawDefault(x, contentY);
	}
}

/**
 * Draws the item color UI in default mode
 * @param {number} x - The x-coordinate at which to draw the default UI
 * @param {number} y - The y-coordinate at which to draw the default UI
 * @returns {void} - Nothing
 */
function ItemColorDrawDefault(x, y) {
	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const buttonSpacing = ItemColorConfig.buttonSpacing;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const colorPickerButtonX = ItemColorState.colorPickerButtonX;
	const colorDisplayButtonX = ItemColorState.colorDisplayButtonX;
	const groupButtonWidth = ItemColorState.groupButtonWidth;
	const pageStart = ItemColorPage * ItemColorState.pageSize;
	const colorGroups = ItemColorState.colorGroups.slice(pageStart, pageStart + ItemColorState.pageSize);
	const colors = ItemColorState.colors;

	colorGroups.forEach((colorGroup, i) => {
		const groupY = y + (i * (buttonHeight + buttonSpacing));
		const asset = ItemColorItem.Asset;
		let groupName, buttonText, buttonColor;
		let isBackNextButton = false;
		if (colorGroup.name === null) {
			groupName = ItemColorText.get("WholeItem");
			buttonText = ItemColorGetColorButtonText(colors);
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
		} else if (colorGroup.layers.length === 1) {
			groupName = ItemColorLayerNames.get(asset.Group.Name + asset.Name + colorGroup.name);
			buttonText = colors[colorGroup.layers[0].ColorIndex];
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
		} else {
			let currentColors;
			const layerPage = ItemColorLayerPages[colorGroup.name];
			const colorGroupName = ItemColorGroupNames.get(asset.Group.Name + asset.Name + colorGroup.name);
			if (layerPage === 0) {
				currentColors = colorGroup.layers.map(layer => colors[layer.ColorIndex]);
				groupName = colorGroupName + ": " + ItemColorText.get("All");
			} else {
				const layer = colorGroup.layers[layerPage - 1];
				currentColors = colors[layer.ColorIndex];
				groupName = colorGroupName + ": " + ItemColorLayerNames.get(asset.Group.Name + asset.Name + (layer.Name || ""));
			}
			buttonText = ItemColorGetColorButtonText(currentColors);
			buttonColor = buttonText.startsWith("#") ? buttonText : "#fff";
			isBackNextButton = true;
		}
		if (isBackNextButton) {
			DrawBackNextButton(x, groupY, groupButtonWidth, buttonHeight, groupName, "#fff", null, () => "Previous", () => "Next");
		} else {
			DrawButton(x, groupY, groupButtonWidth, buttonHeight, groupName, "#fff");
		}
		DrawButton(colorDisplayButtonX, groupY, colorDisplayWidth, buttonHeight, buttonText, buttonColor);
		DrawButton(colorPickerButtonX, groupY, colorPickerButtonWidth, buttonHeight, "", "#fff", "Icons/Color.png");
	});
}

/**
 * A debounced callback for when the item color picker changes its value. This sets the color for the currently selected set of color
 * indices
 * @const {function(): void}
 */
const ItemColorOnPickerChange = CommonLimitFunction((color) => {
	if (!ItemColorState) return;
	const newColors = ItemColorState.colors.slice();
	ItemColorPickerIndices.forEach(i => newColors[i] = color);
	ItemColorItem.Color = newColors;
	CharacterLoadCanvas(ItemColorCharacter);
});

/**
 * Click handler for the item color UI according to its current state
 * @param {Character} c - The character being colored
 * @param {string} group - The name of the item group being colored
 * @param {number} x - The x-coordinate at which the UI was drawn
 * @param {number} y - The y-coordinate at which the UI was drawn
 * @param {number} width - The width with which the UI was drawn
 * @param {number} height - The height with which the UI was drawn
 * @param {boolean} includeResetButton - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
function ItemColorClick(c, group, x, y, width, height, includeResetButton) {
	const item = InventoryGet(c, group);
	if (!item) {
		return;
	}
	ItemColorStateBuild(c, item, x, y, width, height, includeResetButton);

	const headerButtonSize = ItemColorConfig.headerButtonSize;

	if (MouseIn(ItemColorState.cancelButtonX, y, headerButtonSize, headerButtonSize)) {
		return ItemColorExitClick();
	}

	if (MouseIn(ItemColorState.saveButtonX, y, headerButtonSize, headerButtonSize)) {
		return ItemColorSaveClick();
	}

	if (ItemColorCurrentMode === ItemColorMode.COLOR_PICKER) {
		if (ItemColorState.drawExport && MouseIn(ItemColorState.exportButtonX, y, headerButtonSize, headerButtonSize)) {
			navigator.clipboard
				.writeText(ElementValue("InputColor"))
				.catch(err => console.error("Clipboard write error: " + err));
			return;
		}

		if (ItemColorState.drawImport && MouseIn(ItemColorState.importButtonX, y, headerButtonSize, headerButtonSize)) {
			navigator.clipboard.readText()
				.then(txt => ElementValue("InputColor", txt))
				.catch(err => console.error("Clipboard read error: " + err));
			return;
		}

		if (includeResetButton && MouseIn(ItemColorState.resetButtonX, y, headerButtonSize, headerButtonSize)) {
			ElementValue("InputColor", "Default");
			return;
		}
	}

	if (
		ItemColorCurrentMode === ItemColorMode.DEFAULT &&
		ItemColorState.pageCount > 1 &&
		MouseIn(ItemColorState.paginationButtonX, y, headerButtonSize, headerButtonSize)
	) {
		return ItemColorPaginationClick();
	}

	if (ItemColorCurrentMode === ItemColorMode.DEFAULT) {
		return ItemColorClickDefault(x, ItemColorState.contentY, width);
	}
}

/**
 * Click handler for the item color UI when it's in default mode
 * @param {number} x - The x-coordinate at which the default UI was drawn
 * @param {number} y - The y-coordinate at which the default UI was drawn
 * @param {number} width - The width with which the default UI was drawn
 * @returns {void} - Nothing
 */
function ItemColorClickDefault(x, y, width) {
	const pageStart = ItemColorPage * ItemColorState.pageSize;
	const colorGroups = ItemColorState.colorGroups.slice(pageStart, pageStart + ItemColorState.pageSize);
	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const colorPickerButtonX = ItemColorState.colorPickerButtonX;
	const colorDisplayButtonX = ItemColorState.colorDisplayButtonX;
	const groupButtonWidth = ItemColorState.groupButtonWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const rowHeight = buttonHeight + ItemColorConfig.buttonSpacing;
	const clickZoneHeight = colorGroups.length * (rowHeight);

	if (!MouseIn(x, y, width, clickZoneHeight)) {
		return;
	}

	colorGroups.some((colorGroup, i) => {
		if (MouseYIn(y + i * rowHeight, buttonHeight)) {
			if (MouseXIn(colorPickerButtonX, colorPickerButtonWidth)) {
				// Color picker button
				ItemColorOpenPicker(colorGroup);
			} else if (MouseXIn(colorDisplayButtonX, colorDisplayWidth)) {
				// Cycle through the color schema
				ItemColorNextColor(colorGroup);
			} else if (colorGroup.layers.length > 1) {
				if (MouseXIn(x, groupButtonWidth / 2)) {
					// Previous layer button
					ItemColorPreviousLayer(colorGroup);
				} else if (MouseXIn(x + groupButtonWidth / 2, x + groupButtonWidth)) {
					// Next layer button
					ItemColorNextLayer(colorGroup);
				}
			}
			return true;
		}
	});
}

/**
 * Handles pagination clicks on the item color UI
 * @returns {void} - Nothing
 */
function ItemColorPaginationClick() {
	ItemColorPage = (ItemColorPage + 1) % ItemColorState.pageCount;
}

/**
 *  Handles exit button clicks on the item color UI
 *  @returns {void} - Nothing
 */
function ItemColorExitClick() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorPickerCancel();
		case ItemColorMode.DEFAULT:
		default:
			if (ItemColorBackup && ItemColorCharacter) {
				Object.assign(ItemColorItem, AppearanceItemParse(ItemColorBackup));
				CharacterLoadCanvas(ItemColorCharacter);
			}
			ItemColorFireExit(false);
	}
}

/**
 * Saves any item color changes and exits the item color screen completely
 * @returns {void} - Nothing
 */
function ItemColorSaveAndExit() {
	if (ItemColorCurrentMode === ItemColorMode.COLOR_PICKER) {
		ElementRemove("InputColor");
		ColorPickerHide();
	}
	ItemColorFireExit(true);
}

/**
 * Discards any item color changes and exits the item color screen completely
 * @returns {void} - Nothing
 */
function ItemColorCancelAndExit() {
	if (ItemColorItem && ItemColorBackup && ItemColorCharacter) {
		Object.assign(ItemColorItem, AppearanceItemParse(ItemColorBackup));
		CharacterLoadCanvas(ItemColorCharacter);
	}
	ElementRemove("InputColor");
	ColorPickerHide();
	ItemColorFireExit(false);
}

/**
 * Handles save button clicks on the item color UI
 * @returns {void} - Nothing
 */
function ItemColorSaveClick() {
	switch (ItemColorCurrentMode) {
		case ItemColorMode.COLOR_PICKER:
			return ItemColorCloseColorPicker(true);
		case ItemColorMode.DEFAULT:
		default:
			ItemColorFireExit(true);
	}
}

/**
 * Handles color picker cancellation clicks when the item color UI is in color picker mode
 * @returns {void} - Nothing
 */
function ItemColorPickerCancel() {
	Object.assign(ItemColorItem, AppearanceItemParse(ItemColorPickerBackup));
	CharacterLoadCanvas(ItemColorCharacter);
	ItemColorCloseColorPicker(false);
}

/**
 * Takes the item color UI out of color picker mode. If the item being colored only has a single color index, this function calls any
 * registered item color exit handlers
 * @param {boolean} save - Whether or not changes should be saved on exiting color picker mode
 * @returns {void} - Nothing
 */
function ItemColorCloseColorPicker(save) {
	ElementRemove("InputColor");
	ColorPickerHide();
	if (ItemColorState.simpleMode) {
		ItemColorFireExit(save);
	} else {
		ItemColorCurrentMode = ItemColorMode.DEFAULT;
	}
}

/**
 * Gets the color indices that belong in the provided color group
 * @param {ColorGroup} colorGroup - The color group to fetch color indices for
 * @returns {number[]} - A list of color indices for any layers within the provided color group
 */
function ItemColorGetColorIndices(colorGroup) {
	if (colorGroup.name === null) {
		return ItemColorState.colors.map((c, i) => i);
	} else if (colorGroup.layers.length === 1) {
		return [colorGroup.layers[0].ColorIndex];
	} else {
		const layerPage = ItemColorLayerPages[colorGroup.name];
		if (layerPage === 0) {
			return colorGroup.layers.map(layer => layer.ColorIndex);
		} else if (layerPage <= colorGroup.layers.length) {
			return [colorGroup.layers[layerPage - 1].ColorIndex];
		}
	}
	return [];
}

/**
 * Toggles the item color UI into color picker mode
 * @param {ColorGroup} colorGroup - The color group that is being colored
 * @returns {void} - Nothing
 */
function ItemColorOpenPicker(colorGroup) {
	ItemColorCurrentMode = ItemColorMode.COLOR_PICKER;
	ItemColorPickerBackup = AppearanceItemStringify(ItemColorItem);
	ItemColorPickerIndices = ItemColorGetColorIndices(colorGroup);
	const groupColors = ItemColorState.colors.filter((c, i) => ItemColorPickerIndices.includes(i));
	const colorText = ItemColorGetColorButtonText(groupColors);
	ElementCreateInput("InputColor", "text", colorText.startsWith("#") ? colorText : "#", "7");
}

/**
 * Cycles a color group's color to the next color in the asset group's color schema, or to "Default" if the color group is not currently
 * colored with a single color from the color schema
 * @param {ColorGroup} colorGroup - The color group that is being colored
 * @returns {void} - Nothing
 */
function ItemColorNextColor(colorGroup) {
	const colorIndicesToSet = ItemColorGetColorIndices(colorGroup);
	const groupColors = ItemColorState.colors.filter((c, i) => colorIndicesToSet.includes(i));
	const colorTextKey = ItemColorGetColorButtonTextKey(groupColors);
	const schema = ItemColorItem.Asset.Group.ColorSchema;
	const nextIndex = (schema.indexOf(colorTextKey) + 1) % schema.length;
	const nextColor = schema[nextIndex];
	const newColors = ItemColorState.colors.slice();
	colorIndicesToSet.forEach(i => newColors[i] = nextColor);
	ItemColorItem.Color = newColors;
	CharacterLoadCanvas(ItemColorCharacter);
}

/**
 * Switches the item color UI to the next layer within the provided color group
 * @param {ColorGroup} colorGroup - The color group whose layers to cycle
 * @returns {void} - Nothing
 */
function ItemColorNextLayer(colorGroup) {
	const currentPage = ItemColorLayerPages[colorGroup.name];
	ItemColorLayerPages[colorGroup.name] = (currentPage + 1) % (colorGroup.layers.length + 1);
}

/**
 * Switches the item color UI to the previous layer within the provided color group
 * @param {ColorGroup} colorGroup - The color group whose layers to cycle
 * @returns {void} - Nothing
 */
function ItemColorPreviousLayer(colorGroup) {
	const currentPage = ItemColorLayerPages[colorGroup.name];
	const totalPages = colorGroup.layers.length + 1;
	ItemColorLayerPages[colorGroup.name] = (currentPage + totalPages - 1) % totalPages;
}

/**
 * Builds the item color UI's current state based on the provided character, item and position parameters. This only rebuilds the state if
 * needed.
 * @param {Character} c - The character being colored
 * @param {Item} item - The item being colored
 * @param {number} x - The x-coordinate at which to draw the UI
 * @param {number} y - The y-coordinate at which to draw the UI
 * @param {number} width - The width the UI should be drawn at
 * @param {number} height - The height the UI should be drawn at
 * @param {boolean} [includeResetButton=false] - Whether or not to include the "Reset to default" button
 * @returns {void} - Nothing
 */
function ItemColorStateBuild(c, item, x, y, width, height, includeResetButton = false) {
	ItemColorCharacter = c;
	ItemColorItem = item;
	const itemKey = AppearanceItemStringify({ item, x, y, width, height });
	if (!item || (ItemColorState && ItemColorStateKey === itemKey)) {
		return;
	}

	ItemColorStateKey = itemKey;
	const colorableLayers = ItemColorGetColorableLayers(item);
	const groupMap = colorableLayers.reduce((groupLookup, layer) => {
		const groupKey = layer.ColorGroup || layer.Name || "";
		(groupLookup[groupKey] || (groupLookup[groupKey] = [])).push(layer);
		return groupLookup;
	}, /** @type {Record<String, AssetLayer[]>} */({}));

	const colorGroups = Object.keys(groupMap)
		.map(key => {
			ItemColorLayerPages[key] = ItemColorLayerPages[key] || 0;
			return {
				name: key,
				layers: groupMap[key],
				colorIndex: groupMap[key].reduce((min, layer) => Math.min(min, layer.ColorIndex), Infinity),
			};
		})
		.sort((g1, g2) => g1.colorIndex - g2.colorIndex);

	if (item.Asset.AllowColorizeAll) {
		colorGroups.unshift({ name: null, layers: [], colorIndex: -1 });
	}

	let colors;
	if (Array.isArray(item.Color)) {
		colors = item.Color;
		for (let i = colors.length; i < item.Asset.ColorableLayerCount; i++) {
			colors.push("Default");
		}
	} else {
		const colorStr = typeof item.Color === "string" ? item.Color : "Default";
		colors = [];
		for (let i = 0; i < item.Asset.ColorableLayerCount; i++) {
			colors.push(colorStr);
		}
	}

	const simpleMode = colorableLayers.length === 1;

	const colorPickerButtonWidth = ItemColorConfig.colorPickerButtonWidth;
	const buttonSpacing = ItemColorConfig.buttonSpacing;
	const colorDisplayWidth = ItemColorConfig.colorDisplayWidth;
	const buttonHeight = ItemColorConfig.buttonSize;
	const headerButtonSize = ItemColorConfig.headerButtonSize;

	const drawExport = typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText;
	const drawImport = typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText;
	const paginationButtonX = x + width - 3 * headerButtonSize - 2 * buttonSpacing;
	const cancelButtonX = x + width - 2 * headerButtonSize - buttonSpacing;
	const saveButtonX = x + width - headerButtonSize;
	let importButtonX = 0;
	let exportButtonX = 0;
	let resetButtonX = 0;
	let nbButtons = 2;
	if (drawImport) {
		importButtonX = x + width - (nbButtons + 1) * headerButtonSize - nbButtons * buttonSpacing;
		nbButtons++;
	}
	if (drawExport) {
		exportButtonX = x + width - (nbButtons + 1) * headerButtonSize - nbButtons * buttonSpacing;
		nbButtons++;
	}
	resetButtonX = x + width - (nbButtons + 1) * headerButtonSize - nbButtons * buttonSpacing;
	const colorPickerButtonX = x + width - colorPickerButtonWidth;
	const colorDisplayButtonX = colorPickerButtonX - buttonSpacing - colorDisplayWidth;
	const contentY = y + ItemColorConfig.headerButtonSize + buttonSpacing;
	const groupButtonWidth = colorDisplayButtonX - buttonSpacing - x;
	const pageSize = Math.floor((height - headerButtonSize - buttonSpacing) / (buttonHeight + buttonSpacing));
	const pageCount = Math.ceil(colorGroups.length / pageSize);
	const buttonCount = includeResetButton ? 5 : 4;
	const colorInputWidth = Math.min(220, width - buttonCount * (headerButtonSize + buttonSpacing));
	const colorInputX = x + 0.5 * colorInputWidth;
	const colorInputY = y + 0.5 * headerButtonSize;

	ItemColorState = {
		colorGroups,
		colors,
		simpleMode,
		paginationButtonX,
		cancelButtonX,
		saveButtonX,
		colorPickerButtonX,
		colorDisplayButtonX,
		contentY,
		groupButtonWidth,
		pageSize,
		pageCount,
		colorInputWidth,
		colorInputX,
		colorInputY,
		exportButtonX,
		importButtonX,
		resetButtonX,
		drawImport,
		drawExport,
	};
}

/**
 * Returns layers of the asset which can be given distinct colors
 * @param {Item} item - The item to be colored
 * @returns {AssetLayer[]} - The colourable layers
 */
function ItemColorGetColorableLayers(item) {
	return item.Asset.Layer.filter(layer => !layer.CopyLayerColor && layer.AllowColorize && !layer.HideColoring);
}

/**
 * Returns whether or not the item can have only a single color or multiple colors
 * @param {Item} item - The item to be colored
 * @returns {boolean} - Whether the item only allows one color
 */
function ItemColorIsSimple(item) {
	if (item && item.Asset && item.Asset.Layer) {
		return ItemColorGetColorableLayers(item).length === 1;
	}
	else return true;
}

/**
 * Fetches the color button text key for the provided item color. If the item's color is already a string, the color string is returned.
 * Otherwise, returns "Many" or "Default" as appropriate.
 * @param {string|string[]} color - The item color
 * @returns {string} - The appropriate color button key for the provided item color(s)
 */
function ItemColorGetColorButtonTextKey(color) {
	if (Array.isArray(color)) {
		const initialColor = color[0];
		return color.some(c => c !== initialColor) ? "Many" : initialColor;
	} else if (typeof color !== "string") {
		return "Default";
	}
	return color;
}

/**
 * Fetches the color button text for the provided item color. If the item's color is already a string, the color string is returned.
 * Otherwise, returns "Many" or "Default" as appropriate.
 * @param {string|string[]} color - The item color
 * @returns {string} - The appropriate color button text for the provided item color(s), translated to the current game language
 */
function ItemColorGetColorButtonText(color) {
	return ItemColorText.get(ItemColorGetColorButtonTextKey(color)).trim();
}

/**
 * Registers an exit callback to the item color UI which will be called when the UI is exited.
 * @param {itemColorExitListener} callback - The exit listener to register
 * @returns {void} - Nothing
 */
function ItemColorOnExit(callback) {
	ItemColorExitListeners.push(callback);
}

/**
 * Handles exiting the item color UI. Appropriate text caches are dropped, and any registered exit listeners are called.
 * @param {boolean} save - Whether or not the appearance changes applied by the item color UI should be saved
 * @returns {void} - Nothing
 */
function ItemColorFireExit(save) {
	ItemColorExitListeners.forEach(listener => listener(ItemColorCharacter, ItemColorItem, save));
	ItemColorReset();
}

/**
 * Resets color UI related global variables back to their default states.
 * @returns {void} - Nothing
 */
function ItemColorReset() {
	ItemColorCharacter = null;
	ItemColorItem = null;
	ItemColorCurrentMode = ItemColorMode.DEFAULT;
	ItemColorStateKey = null;
	ItemColorState = null;
	ItemColorPage = 0;
	ItemColorLayerPages = {};
	ItemColorPickerBackup = null;
	ItemColorPickerIndices = [];
	ItemColorExitListeners = [];
	ItemColorBackup = null;
	ItemColorLayerNames = null;
	ItemColorGroupNames = null;
}

/**
 * Check whether the current colors of the item match the item's default colors
 * @param {Item} Item - The appearance item to check
 * @returns {boolean} - Whether the item has default color(s)
 */
function ItemColorIsDefault(Item) {
	const Color = Item.Color;
	let AssetDefault = Item.Asset.DefaultColor;
	if (typeof Color === "string") return (Color === "Default" || (typeof AssetDefault === "string" && Color === AssetDefault));
	if (Array.isArray(Color)) {
		if (!AssetDefault) {
			return Color.every(c => c === "Default");
		}
		if (!Array.isArray(AssetDefault)) {
			AssetDefault = [AssetDefault];
		}
		return Color.slice(0, Math.min(Color.length, AssetDefault.length)).every((c, i) => c === "Default" || c === AssetDefault[i]);
	}
	return true;
}
