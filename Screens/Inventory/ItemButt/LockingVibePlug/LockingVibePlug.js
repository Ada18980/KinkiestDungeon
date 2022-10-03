"use strict";

function InventoryItemButtLockingVibePlugLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtLockingVibePlugDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtLockingVibePlugClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemButtLockingVibePlugScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
