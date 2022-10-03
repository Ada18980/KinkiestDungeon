"use strict";

function InventoryItemButtEggVibePlugXXLLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtEggVibePlugXXLDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtEggVibePlugXXLClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemButtEggVibePlugXXLScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
