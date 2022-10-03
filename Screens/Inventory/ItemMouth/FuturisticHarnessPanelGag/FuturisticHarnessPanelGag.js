"use strict";

// Loads the item extension properties
function InventoryItemMouthFuturisticHarnessPanelGagLoad() {
	InventoryItemMouthFuturisticPanelGagLoad();
}

// Draw the item extension screen
function InventoryItemMouthFuturisticHarnessPanelGagDraw() {
	InventoryItemMouthFuturisticPanelGagDraw();
}

// Catches the item extension clicks
function InventoryItemMouthFuturisticHarnessPanelGagClick() {
	InventoryItemMouthFuturisticPanelGagClick();
}

function InventoryItemMouthFuturisticHarnessPanelGagExit() {
	InventoryItemMouthFuturisticPanelGagExit();
}

function InventoryItemMouthFuturisticHarnessPanelGagValidate(C, Item) {
	return InventoryItemFuturisticValidate(C, Item);
}


function InventoryItemMouthFuturisticHarnessPanelGagPublishAction(C, Option) {
	InventoryItemMouthFuturisticPanelGagPublishAction(C, Option);
}

function InventoryItemMouthFuturisticHarnessPanelNpcDialog(C, Option) {
	InventoryItemMouthFuturisticPanelGagNpcDialog(C, Option);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemMouthFuturisticHarnessPanelGagScriptDraw(data) {
	AssetsItemMouthFuturisticPanelGagScriptDraw(data);
}

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemMouthFuturisticHarnessPanelGagBeforeDraw(data) {
	return AssetsItemMouthFuturisticPanelGagBeforeDraw(data);
}
