"use strict";

function InventoryItemNipplesPiercingsVibeHeartPiercingsLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesPiercingsVibeHeartPiercingsDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesPiercingsVibeHeartPiercingsClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNipplesPiercingsVibeHeartPiercingsScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
