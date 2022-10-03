"use strict";

// Loads the item extension properties
function InventoryItemNeckTechnoCollarShockModule1Load() {
	InventoryItemNeckAccessoriesCollarShockUnitLoad();
}

// Draw the item extension screen
function InventoryItemNeckTechnoCollarShockModule1Draw() {
	if (DialogFocusItem && DialogFocusItem.Property) {
		if (DialogFocusItem.Property.Intensity == null) DialogFocusItem.Property.Intensity = 0;
		if (DialogFocusItem.Property.TriggerCount == null) DialogFocusItem.Property.TriggerCount = 0;
	}
	InventoryItemNeckAccessoriesCollarShockUnitDraw();
}

// Catches the item extension clicks
function InventoryItemNeckTechnoCollarShockModule1Click() {
	InventoryItemNeckAccessoriesCollarShockUnitClick();

	// Exits the screen
	if (MouseIn(1885, 25, 90, 90)) {
		InventoryItemNeckTechnoCollarShockModule1Exit();
	}
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNeckTechnoCollarShockModule1ScriptDraw(data) {
	AssetsItemNeckAccessoriesCollarShockUnitScriptDraw(data);
}

// Leaves the extended screen
function InventoryItemNeckTechnoCollarShockModule1Exit() {
	ExtendedItemSubscreen = null;
}
