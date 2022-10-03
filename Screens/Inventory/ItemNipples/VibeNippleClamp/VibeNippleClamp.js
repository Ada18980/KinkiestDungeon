"use strict";

function InventoryItemNipplesVibeNippleClampLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesVibeNippleClampDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesVibeNippleClampClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNipplesVibeNippleClampScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
