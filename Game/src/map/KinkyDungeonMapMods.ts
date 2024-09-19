"use strict";

let KDMapMods: Record<string, MapMod> = {
	"None": {
		name: "None",
		roomType: "",
		weight: 300,
		filter: (_slot) => {
			return 1.0;
		},
		tags: [],
		bonusTags: {},
		bonussetpieces: [
			//{Type: "BanditPrison", Weight: 12},
		],
		altRoom: "",
	},
	"Mold": {
		name: "Mold",
		roomType: "",
		weight: 50,
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		tags: ["maid", "mold"],
		faction: "Maidforce",
		tagsOverride: ["maid", "mold"],
		jailType: "Maidforce",
		guardType: "Maidforce",
		bonusTags: {
			"mold": {bonus: 4, mult: 2.5},
			"maid": {bonus: 5, mult: 1.5},
			"construct": {bonus: 0, mult: 0},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["mold"], tags: [], currentCount: 0, maxCount: 0.5, ignoreAllyCount: true},
			{requiredTags: ["maid"], tags: [], currentCount: 0, maxCount: 0.25, ignoreAllyCount: true},
		],
	},
	"Bandit": {
		name: "Bandit",
		roomType: "",
		weight: 50,
		tags: ["bandit", "banditleader", "bountyhunter", "dragon"],
		faction: "Bandit",
		jailType: "Bandit",
		guardType: "Bandit",
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		bonusTags: {
			"bandit": {bonus: 4, mult: 2.5},
			"bountyhunter": {bonus: 1, mult: 2.5},
			"banditleader": {bonus: 40, mult: 0.3},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["bandit"], tags: [], currentCount: 0, maxCount: 0.4, ignoreAllyCount: true},
			{requiredTags: ["bountyhunter"], tags: [], currentCount: 0, maxCount: 0.2, ignoreAllyCount: true},
		],
	},
	"Dragon": {
		name: "Dragon",
		roomType: "",
		weight: 50,
		tags: ["witch", "elemental", "dragon"],
		faction: "Dragon",
		jailType: "Dragon",
		guardType: "Dragon",
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		bonusTags: {
			"dragon": {bonus: 7, mult: 2},
			"elemental": {bonus: 3, mult: 1.5},
		},
		bonussetpieces: [
			{Type: "BanditPrison", Weight: 8},
		],
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["dragon"], tags: [], currentCount: 0, maxCount: 0.33, ignoreAllyCount: true},
			{requiredTags: ["elemental"], tags: [], currentCount: 0, maxCount: 0.33, ignoreAllyCount: true},
		],
	},
	"Witch": {
		name: "Witch",
		roomType: "",
		weight: 50,
		tags: ["witch", "apprentice", "skeleton"],
		faction: "Witch",
		jailType: "Witch",
		guardType: "Apprentice",
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		bonusTags: {
			"witch": {bonus: 3, mult: 1.5},
			"apprentice": {bonus: 3, mult: 1.4},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["witch"], tags: [], currentCount: 0, maxCount: 0.25, ignoreAllyCount: true},
			{requiredTags: ["apprentice"], tags: [], currentCount: 0, maxCount: 0.25, ignoreAllyCount: true},
		],
	},
	"Wolf": {
		name: "Wolf",
		roomType: "",
		weight: 70,
		tags: ["nevermere"],
		faction: "Nevermere",
		jailType: "Nevermere",
		guardType: "Nevermere",
		filter: (slot) => {
			if (slot?.y < 3) return 0;
			return 1.0;
		},
		bonusTags: {
			"nevermere": {bonus: 11, mult: 1.5},
			"trainer": {bonus: 11, mult: 0.75},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["nevermere"], tags: [], currentCount: 0, maxCount: 0.3, ignoreAllyCount: true},
		],
	},
	"Robot": {
		name: "Robot",
		roomType: "",
		weight: 35,
		tags: ["robot", "robotturret"],
		faction: "AncientRobot",
		jailType: "AncientRobot",
		guardType: "AncientRobot",
		filter: (slot) => {
			if (slot?.y < 3) return 0;
			return 1.0;
		},
		bonusTags: {
			"robot": {bonus: 10, mult: 4},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["robot"], tags: [], currentCount: 0, maxCount: 0.3, ignoreAllyCount: true},
		],
	},
	"Plant": {
		name: "Plant",
		roomType: "",
		weight: 50,
		tags: ["plant", "elf"],
		jailType: "Elf",
		guardType: "Elf",
		faction: "Elf",
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		bonusTags: {
			"plant": {bonus: 5, mult: 2},
			"maid": {bonus: 4.5, mult: 1},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["plant"], tags: [], currentCount: 0, maxCount: 0.35, ignoreAllyCount: true},
		],
	},
	"Slime": {
		name: "Slime",
		roomType: "",
		weight: 50,
		tags: ["slime", "alchemist"],
		faction: "Alchemist",
		jailType: "Alchemist",
		guardType: "Alchemist",
		filter: (slot) => {
			if (slot?.y < 2) return 0;
			return 1.0;
		},
		bonusTags: {
			"slime": {bonus: 1.5, mult: 2},
			"maid": {bonus: 4.5, mult: 1.5},
			"alchemist": {bonus: 1.5, mult: 1.5},
		},
		altRoom: "",
		spawnBoxes: [
			{requiredTags: ["slime"], tags: [], currentCount: 0, maxCount: 0.3, ignoreAllyCount: true},
		],
	},
};

// KDGetMapGenList(3, KDMapMods);
/**
 * @param count
 * @param mods
 * @param slot
 */
function KDGetMapGenList(count: number, mods: Record<string, MapMod>, slot: KDJourneySlot): MapMod[] {
	let ret: MapMod[] = [];
	for (let i = 0; i < count; i++) {
		let genWeightTotal = 0;
		let genWeights = [];
		let mult = 1.0;

		for (let mod of Object.values(mods)) {
			if (!ret.includes(mod)) {
				mult = mod.filter(slot);
				if (mult > 0) {
					genWeights.push({mod: mod, weight: genWeightTotal});
					genWeightTotal += mod.weight * mult;
				}
			}
		}

		let selection = KDRandom() * genWeightTotal;

		for (let L = genWeights.length - 1; L >= 0; L--) {
			if (selection > genWeights[L].weight) {
				ret.push(genWeights[L].mod);
				break;
			}
		}
	}
	return ret;
}
