"use strict";

// Loads the item extension properties
function InventoryItemNeckShockCollarLoad() {
	InventoryItemNeckAccessoriesCollarShockUnitLoad();
}

// Draw the item extension screen
function InventoryItemNeckShockCollarDraw() {
	InventoryItemNeckAccessoriesCollarShockUnitDraw();
}

// Catches the item extension clicks
function InventoryItemNeckShockCollarClick() {
	InventoryItemNeckAccessoriesCollarShockUnitClick();
}

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemNeckShockCollarBeforeDraw(data) {
	return AssetsItemNeckAccessoriesCollarShockUnitBeforeDraw(data);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNeckShockCollarScriptDraw(data) {
	AssetsItemNeckAccessoriesCollarShockUnitScriptDraw(data);
}
