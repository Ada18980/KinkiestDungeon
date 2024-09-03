"use strict";

interface KDRegiment {
	id: number,
	location: WorldCoord,
	room: string,
}

/** Leave blank to get all regiments */
function KDGetRegiments(location?: {x: number, y: number}, Room?: string) {
	if (!KDGameData.Regiments) KDGameData.Regiments = {};

	if (!location) {
		return Object.values(KDGameData.Regiments);
	}
}

/**
 * Updates a map's data to include all the global regiments
 */
function UpdateRegiments(coords: WorldCoord) {
	let loc = KDGetWorldMapLocation({x: coords.mapX, y: coords.mapY});
	if (!loc) return;
	let Map = loc.data[coords.room]
	Map.Regiments = {};

	for (let reg of KDGetRegiments()) {
		if (KDCompareLocation(reg.location, coords)) {
			Map.Regiments[reg.id] = reg.id;
		}
	}
}