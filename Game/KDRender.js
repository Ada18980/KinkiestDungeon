"use strict";


let KDRender = {
	JourneyMap: () => {
		// Render the journey map
		if (KDGameData.JourneyMap) {

			let X = KDGameData.JourneyX;
			let Y = KDGameData.JourneyY;
			KDRenderJourneyMap(Math.floor(X / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint, Y, KDLevelsPerCheckpoint);
		}
	},
};