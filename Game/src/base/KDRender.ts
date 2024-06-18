let KDRender = {
	JourneyMap: () => {
		// Render the journey map
		if (KDGameData.JourneyMap) {

			let X = KDGameData.JourneyX;
			let Y = KDGameData.JourneyY;
			KDRenderJourneyMap(X, Math.floor(Y / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint, undefined, KDLevelsPerCheckpoint);
		}
	},
};