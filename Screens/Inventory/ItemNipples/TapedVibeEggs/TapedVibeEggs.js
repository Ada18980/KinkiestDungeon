"use strict";
function InventoryItemNipplesTapedVibeEggsLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesTapedVibeEggsDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemNipplesTapedVibeEggsClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemNipplesTapedVibeEggsScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
