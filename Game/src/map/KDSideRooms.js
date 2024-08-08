"use strict";

/**
 * @type {Record<string, KDSideRoom>}
 */
let KDSideRooms = {
	"DemonTransition": {
		name: "DemonTransition",
		weight: 150,
		chance: 1.0,
		filter: (slot, top) => {
			// Top reserved for lairs
			if (top) return 0;
			if (slot.Checkpoint == 'ore') return 1;
			if (slot.Checkpoint == 'tmp') return 0.25;
			return 0;
		},
		altRoom: "DemonTransition",
		mapMod: "None",
		escapeMethod: "None",
		faction: "Observer",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "DemonTransition"}, x, y, 1.5);
			tile.Skin = "DimensionRift";
			KDCreateEffectTile(x, y, {
				name: "Portals/DarkPortal",
				duration: 9999, infinite: true,
			}, 0);
			return true;
		},
	},
	"BanditFort": {
		name: "BanditFort",
		weight: 150,
		chance: 0.5,
		filter: (slot, top) => {
			// Top reserved for lairs
			if (top) return 0;
			if (slot.Checkpoint == 'ore') return 0.25;
			if (slot.Checkpoint == 'tmp') return 0.5;
			if (slot.Checkpoint == 'cat') return 0.75;
			if (slot.Checkpoint == 'tmb') return 0.75;
			return 1;
		},
		altRoom: "BanditFort",
		mapMod: "None",
		escapeMethod: "None",
		faction: "Bandit",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "shoppe"}, x, y, 1.5);
			return true;
		},
	},
	"Caldera": {
		name: "Caldera",
		weight: 250,
		chance: 0.15,
		filter: (slot, top) => {
			if (top) return 0.5;
			if (slot.Checkpoint == 'cst') return 0;
			return 1;
		},
		altRoom: "Caldera",
		mapMod: "None",
		escapeMethod: "None",
		faction: "Elf",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "cst"}, x, y, 1.5);
			return true;
		},
	},
	"ElevatorRoom": {
		name: "ElevatorRoom",
		weight: 400,
		chance: 0.4,
		tags: ["elevator"],
		filter: (slot, top) => {
			if (!top) return 0;
			return slot.Checkpoint == 'tmb' ? 0 : 1;
		},
		altRoom: "ElevatorRoom",
		mapMod: "None",
		escapeMethod: "None",
		faction: "AncientRobot",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "bel"}, x, y, 1.5);
			return true;
		},
	},
	"ElevatorEgyptian": {
		name: "ElevatorEgyptian",
		weight: 800,
		chance: 0.4,
		filter: (slot, top) => {
			if (!top) return 0;
			return slot.Checkpoint == 'tmb' ? 1 : 0.1;
		},
		tags: ["elevator", "elevatorstart"],
		altRoom: "ElevatorEgyptian",
		mapMod: "None",
		escapeMethod: "None",
		faction: "Bast",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "tmb"}, x, y, 1.5);
			return true;
		},
	},
	"ElevatorEgyptian2": {
		name: "ElevatorEgyptian2",
		weight: 200,
		chance: 0.4,
		filter: (slot, top) => {
			if (!top) return 0;
			return slot.Checkpoint == 'tmb' ? 0.4 : 0.01;
		},
		tags: ["elevator", "elevatorstart"],
		altRoom: "ElevatorEgyptian2",
		mapMod: "None",
		escapeMethod: "None",
		faction: "Bast",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "tmb"}, x, y, 1.5);
			return true;
		},
	},
	"GoldVault": {
		name: "GoldVault",
		weight: 100,
		chance: 0.4,
		filter: (slot, top) => {
			if (top) return 0;
			return 1;
		},
		altRoom: "GoldVault",
		mapMod: "None",
		escapeMethod: "None",
		faction: "AncientRobot",
		stairCreation: (tile, x, y) => {
			KinkyDungeonSkinArea({skin: "vault"}, x, y, 1.5);
			return true;
		},
	},
};

// KDGetMapGenList(3, KDMapMods);
/**
 * @param {KDJourneySlot} slot
 * @param {boolean} side
 * @param {string[]} ignore
 * @param {string} [requireTag]
 * @returns {KDSideRoom}
 */
function KDGetSideRoom(slot, side, ignore, requireTag) {
	let genWeightTotal = 0;
	let genWeights = [];
	let mult = 1.0;

	for (let mod of Object.values(KDSideRooms)) {
		if (!ignore.includes(mod.name)) {
			mult = mod.filter(slot, side);
			if (mult > 0 && (mod.chance*mult >= 1 || KDRandom() < mod.chance*mult)
				&& (!requireTag || (mod.tags && mod.tags.includes(requireTag)))) {
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