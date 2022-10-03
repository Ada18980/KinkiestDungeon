"use strict";

/** @type {DynamicBeforeDrawCallback} */
function AssetsItemNipplesLactationPumpBeforeDraw(data) {
	// If suspended off the ground, use the normal pose image
	if (data.C.IsSuspended() && data.C.HeightRatioProportion < 1) {
		return { Pose: "" };
	}

	return null;
}
