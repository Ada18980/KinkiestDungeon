"use strict";

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemArmsHempRopeBeforeDraw(data) {
	if (data.LayerType === "BedSpreadEagle") {
		return {
			X: data.X - 50,
			Y: data.Y - 150,
		};
	}
	else if (data.Property && data.Property.Type === "SuspensionKneelingHogtie" && data.L === "_Suspension") {
		return {
			// Hide the rope split-into-four behind hair as otherwise it appears odd
			Y: data.Y + 30,
		};
	}

	return null;
}
