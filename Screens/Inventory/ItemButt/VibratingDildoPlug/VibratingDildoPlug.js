"use strict";

function InventoryItemButtVibratingDildoPlugLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtVibratingDildoPlugDraw() {
	VibratorModeDraw([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemButtVibratingDildoPlugClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemButtVibratingDildoPlugScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
