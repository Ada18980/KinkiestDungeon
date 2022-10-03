"use strict";

function InventoryItemVulvaLoversVibratorLoad() {
	VibratorModeLoad([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED]);
}

function InventoryItemVulvaLoversVibratorDraw() {
	var { Asset, Property } = DialogFocusItem;
	VibratorModeDrawHeader();
	var ItemMemberNumber = DialogFindPlayer("ItemMemberNumber").replace("Item", Asset.Description);
	DrawText(ItemMemberNumber + " " + Property.ItemMemberNumber, 1500, 450, "white", "gray");
	VibratorModeDrawControls([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED], 525);
}

function InventoryItemVulvaLoversVibratorClick() {
	VibratorModeClick([VibratorModeSet.STANDARD, VibratorModeSet.ADVANCED], 525);
}

/** @type {DynamicScriptDrawCallback} */
function AssetsItemVulvaLoversVibratorScriptDraw(data) {
	VibratorModeScriptDraw(data);
}
