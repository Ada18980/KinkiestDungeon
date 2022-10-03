// Wrap around the itemHead/DroneMask/DroneMask.js code as much as possible

"use strict";
let InventoryItemHoodDroneMaskOriginalText = "";
var InventoryItemHoodDroneMaskYOffset = 89; // For testing text position for those with longer hair

// Load item extension properties
function InventoryItemHoodDroneMaskPattern5Load() {
	InventoryItemHoodDroneMaskOriginalText = DialogFocusItem.Property.Text;
	InventoryItemHeadDroneMaskPattern5LoadBase();
}

// Draw extension screen image
function InventoryItemHoodDroneMaskPattern5Draw() {
    InventoryItemHeadDroneMaskPattern5Draw();
}

// Click function
function InventoryItemHoodDroneMaskPattern5Click() {
	if (MouseIn(1330, 731, 340, 64)) {
		InventoryItemHeadDroneMaskPattern5SaveAndExit(InventoryItemHoodDroneMaskOriginalText);
		InventoryItemHoodDroneMaskPattern5ExitSubscreen();
	}
	// Exits screen
	else if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemHeadDroneMaskPattern5Exit(InventoryItemHoodDroneMaskOriginalText);
		InventoryItemHoodDroneMaskPattern5ExitSubscreen();
	}
}

// Exit the subscreen
function InventoryItemHoodDroneMaskPattern5ExitSubscreen() {
	ElementRemove(InventoryItemHeadDroneMaskInputId);
	InventoryItemHoodDroneMaskOriginalText = "";
	ExtendedItemSubscreen = null;
}

// Exit the item's extended screen
function InventoryItemHoodDroneMaskExit() {
	InventoryItemHeadDroneMaskExit();
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemHoodDroneMaskAfterDraw({
    C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color,
}) {
	let YOffset = InventoryItemHoodDroneMaskYOffset;
	AssetsItemHeadDroneMaskAfterDrawBase({
		C, A, X, Y, Property, drawCanvas, drawCanvasBlink, AlphaMasks, L, Color, YOffset,
	})
}
