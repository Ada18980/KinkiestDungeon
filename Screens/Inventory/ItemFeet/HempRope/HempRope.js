"use strict";

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemFeetHempRopeBeforeDraw(data) {
	if (data.LayerType === "BedSpreadEagle") {
		return {
			X: data.X -125,
			Y: data.Y -170,
		};
	}
	return null;
}
