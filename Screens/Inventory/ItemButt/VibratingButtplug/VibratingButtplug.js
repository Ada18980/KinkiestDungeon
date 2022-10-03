"use strict";

function InventoryItemButtVibratingButtplugLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtVibratingButtplugDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtVibratingButtplugClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemButtVibratingButtplugScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
