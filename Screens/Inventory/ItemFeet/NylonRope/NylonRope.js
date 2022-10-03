"use strict";

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemFeetNylonRopeBeforeDraw(data) {
	if (data.Property && data.Property.Type === "BedSpreadEagle") {
		return {
			X: data.X -125,
			Y: data.Y -170,
		};
	}
	return null;
}
