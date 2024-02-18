"use strict";

/**
 * @type {Record<string, KDSideRoom>}
 */
let KDSideRooms = {
	"DemonTransition": {
		name: "DemonTransition",
		roomType: undefined,
		weight: 150,
		chance: 0.5,
		filter: (slot, top) => {
			// Top reserved for lairs
			if (top) return 0;
			return slot.Checkpoint == 'ore' ? 1 : 0;
		},
		altRoom: "DemonTransition",
		mapMod: "None",
		escapeMethod: "None",
	},

};

// KDGetMapGenList(3, KDMapMods);
/**
 * @param {KDJourneySlot} slot
 * @param {boolean} side
 * @param {string[]} ignore
 * @returns {KDSideRoom}
 */
function KDGetSideRoom(slot, side, ignore) {
	let genWeightTotal = 0;
	let genWeights = [];
	let mult = 1.0;

	for (let mod of Object.values(KDSideRooms)) {
		if (!ignore.includes(mod.name)) {
			mult = mod.filter(slot, side);
			if (mult > 0 && (mod.chance*mult >= 1 || KDRandom() < mod.chance*mult)) {
				genWeights.push({mod: mod, weight: genWeightTotal});
				genWeightTotal += mod.weight;
			}
		}
	}

	let selection = KDRandom() * genWeightTotal;

	for (let L = genWeights.length - 1; L >= 0; L--) {
		if (selection > genWeights[L].weight) {
			return genWeights[L].mod;
		}
	}
	return undefined;
}