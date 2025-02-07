let KDRender = {
	JourneyMap: () => {
		// Render the journey map
		if (KDGameData.JourneyMap) {

			let X = KDGameData.JourneyX;
			let Y = KDGameData.JourneyY;
			KDRenderJourneyMap(X, Math.floor(Y / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint,
			undefined, KDLevelsPerCheckpoint);
		}
	},
};

let KDCustomDrawState = {
	JourneyMap: (xOffset) => {
		// Non choice version
		if (KDGameData.JourneyMap) {

			//let X = KDGameData.JourneyX;
			let Y = KDGameData.JourneyY;
			KDRenderJourneyMap(0, Math.floor(Y / KDLevelsPerCheckpoint) * KDLevelsPerCheckpoint,
			undefined, KDLevelsPerCheckpoint, undefined, undefined, undefined, undefined, undefined, undefined,
				true, false);
			KDDrawLoreRepTabs(xOffset);
		}
	},
}