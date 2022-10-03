"use strict";

// Loads the item extension properties
function InventoryItemNeckAutoShockCollarLoad() {
	InventoryItemNeckAccessoriesCollarAutoShockUnitLoad();
}

// Draw the item extension screen
function InventoryItemNeckAutoShockCollarDraw() {
	InventoryItemNeckAccessoriesCollarAutoShockUnitDraw();
}

// Catches the item extension clicks
function InventoryItemNeckAutoShockCollarClick() {
	InventoryItemNeckAccessoriesCollarAutoShockUnitClick();
}

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemNeckAutoShockCollarBeforeDraw(data) {
	return AssetsItemNeckAccessoriesCollarAutoShockUnitBeforeDraw(data);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNeckAutoShockCollarScriptDraw(data) {
	AssetsItemNeckAccessoriesCollarAutoShockUnitScriptDraw(data);
}
