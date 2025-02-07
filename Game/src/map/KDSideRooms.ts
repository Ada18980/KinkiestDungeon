"use strict";

let KDSideRooms: Record<string, KDSideRoom> = {
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
		hidden: true,
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
		wandertags: {
			void: 10,
		},
	},
	"BanditFort": {
		name: "BanditFort",
		weight: 150,
		chance: 0.5,
		hidden: true,
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
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "shoppe"}, x, y, 1.5);
			return true;
		},
		wandertags: {
			bandit: 10,
			bounty: 1,
			criminal: 5,
		},
		worldGenScript: (coord) => {
			// Generate the bandit highsec prison and its entrances
			KDAddOutpost(
				KDGetWorldMapLocation(KDCoordToPoint(coord)),
				"BanditFort",
				"Jail",
				"Bandit",
				false,
				"Jail",
				KDGetWorldMapLocation(KDCoordToPoint(coord))?.main || "",
				"Jail",
				"Jail"
			);

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
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "cst"}, x, y, 1.5);
			return true;
		},
		wandertags: {
			nature: 10,
			treasure: 1,
			generic: 1,
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
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "bel"}, x, y, 1.5);
			return true;
		},
		wandertags: {
			treasure: 1,
			danger: 5,
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
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "tmb"}, x, y, 1.5);
			return true;
		},
		wandertags: {
			danger: 1,
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
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "tmb"}, x, y, 1.5);
			return true;
		},
		wandertags: {
		},
	},
	"GoldVault": {
		name: "GoldVault",
		weight: 100,
		chance: 0.4,
		filter: (_slot, top) => {
			if (top) return 0;
			return 1;
		},
		altRoom: "GoldVault",
		mapMod: "None",
		escapeMethod: "None",
		faction: "AncientRobot",
		stairCreation: (_tile, x, y) => {
			KinkyDungeonSkinArea({skin: "vault"}, x, y, 1.5);
			return true;
		},
		wandertags: {
			danger: 5,
			treasure: 5,
			tech: 1,
		},
	},
};

// KDGetMapGenList(3, KDMapMods);
/**
 * @param slot
 * @param side
 * @param ignore
 * @param [requireTag]
 */
function KDGetSideRoom(slot: KDJourneySlot, side: boolean, ignore: string[], requireTag?: string): KDSideRoom {
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
