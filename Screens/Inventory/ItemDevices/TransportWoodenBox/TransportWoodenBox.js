"use strict";
function InventoryItemDevicesTransportWoodenBoxLoad() {
	InventoryItemDevicesWoodenBoxLoad();
}

function InventoryItemDevicesTransportWoodenBoxDraw() {
	InventoryItemDevicesWoodenBoxDraw();
}

function InventoryItemDevicesTransportWoodenBoxClick() {
	InventoryItemDevicesWoodenBoxClick();
}

function InventoryItemDevicesTransportWoodenBoxSetOpacity(property, opacity) {
	if (opacity !== property.opacity) property.Opacity = opacity;
	if (!Array.isArray(property.Effect)) property.Effect = [];
	const transparent = property.Opacity < 0.15;
	const effectsToApply = transparent ? ["Prone", "Enclose", "Freeze", "Leash"] : ["Prone", "Enclose", "BlindNormal", "GagLight", "Freeze", "Leash"];
	const effectsToRemoves = transparent ? ["BlindNormal", "GagLight"] : [];
	property.Effect = property.Effect.filter(e => !effectsToRemoves.includes(e));
	effectsToApply.forEach(e => {
		if (!property.Effect.includes(e)) property.Effect.push(e);
	});
}

function InventoryItemDevicesTransportWoodenBoxExit() {
	InventoryItemDevicesWoodenBoxExit();
}

/** @type {DynamicAfterDrawCallback} */
function AssetsItemDevicesTransportWoodenBoxAfterDraw(options) {
	AssetsItemDevicesWoodenBoxAfterDraw(options);
}
