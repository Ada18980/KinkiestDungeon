'use strict';


/**
 * Contains a list of curse variant types
 * Can be modified dynamically so mods can add basic curses
 */
let KDHexVariantList = {
	"Base": [
		"Common",
	],
	"Common": [
		"Tickle",
		"Punish",
		"Light",
		"Attraction",
		"Submission",
		"Distraction",
		"Breathlessness",
		"Futility",
		"Sensitivity",
	],
	"CursedCollar": [
		"CursedHeal",
		"CursedCorruption",
		"CursedDistract",
		"CursedPunishment",
		"CursedSubmission",
		"CursedDenial",
	],
	"CursedCollar2": [
		"CursedHeal",
		"CursedCorruption",
		"CursedDistract",
		"CursedPunishment",
		"CursedSubmission",
		"CursedDenial",
	],
};

let KDEventHexModular: Record<string, {level: number, weight: (item: string, allHex: string[], data: KDHexEnchantWeightData) => number, events: (data: KDHexEnchantEventsData) => KinkyDungeonEvent[]}> = {
	"AntiMagic": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 10;
		},
		events: (_data) => [
			{trigger: "beforeEnemyLoop", type: "AntiMagicEnemyDebuff"},
			{trigger: "tick", type: "AntiMagicGag", inheritLinked: true, count: 8, power: 0.4, mult: 0.1},
			{trigger: "apply", type: "FilterLayer", inheritLinked: true, kind: "Ball", filter:
				{"gamma":1,"saturation":0.03333333333333333,"contrast":1,"brightness":1,"red":1,"green":3.016666666666667,"blue":3.95,"alpha":1},
			},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "AntiMagic", color: "#92e8c0", inheritLinked: true, original: "AntiMagic", always: true},

			{original: "AntiMagic", trigger: "inventoryTooltip", type: "varModifier", msg: "AntiMagic", color: "#000000", bgcolor: "#ff5277"},
			{original: "AntiMagic", trigger: "icon", type: "tintIcon", power: 8, bgcolor: "#ff5277", color: "#ff5277"},
		]},
	"Light": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Light"},
			{type: "ItemLight", trigger: "getLights", prereq: "noCorruption", power: 3.5, color: "#ffff55", inheritLinked: true, curse: true, original: "Light"},
			{trigger: "tick", type: "sneakBuff", power: -1.0, inheritLinked: true, curse: true, original: "Light"},
			{trigger: "drawSGTooltip", type: "curseInfo", prereq: "noCorruption", msg: "Illumination", color: "#ff5555", inheritLinked: true, original: "Light"},
			{trigger: "drawBuffIcons", type: "curseInfo", prereq: "noCorruption", msg: "Illumination", color: "#ff5555", inheritLinked: true, original: "Light"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Attraction": {level: 4,
		weight: (_item, allHex, _data) => {
			return (!allHex?.includes("Attraction")) ? 2 : 0;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Attraction"},
			{type: "CurseAttraction", trigger: "calcPlayChance", power: 0.5, inheritLinked: true, curse: true, original: "Attraction"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true, original: "Attraction"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true, original: "Attraction"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Sensitivity": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Sensitivity"},
			{type: "CurseSensitivity", trigger: "calcOrgThresh", power: 0.5, inheritLinked: true, curse: true, original: "Sensitivity"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true, original: "Sensitivity"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true, original: "Sensitivity"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Submission": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Submission"},
			{type: "CurseSubmission", trigger: "orgasm", power: 10, inheritLinked: true, curse: true, original: "Submission"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true, original: "Submission"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true, original: "Submission"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Distraction": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Distraction"},
			{type: "multDistractionPos", trigger: "changeDistraction", power: 1.5, inheritLinked: true, curse: true, original: "Distraction"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true, original: "Distraction"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true, original: "Distraction"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Breathlessness": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Breathlessness"},
			{type: "multStaminaPos", trigger: "changeStamina", power: 0.75, inheritLinked: true, curse: true, original: "Breathlessness"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true, original: "Breathlessness"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true, original: "Breathlessness"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Futility": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Futility"},
			{type: "multWillPos", trigger: "changeWill", power: 0.5, inheritLinked: true, curse: true, original: "Futility"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true, original: "Futility"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true, original: "Futility"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Tickle": {level: 1,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Tickle"},
			{trigger: "tick", type: "tickleDrain", power: -0.1, inheritLinked: true, curse: true, original: "Tickle"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true, original: "Tickle"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true, original: "Tickle"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"Punish": {level: 2,
		weight: (_item, _allHex, _data) => {
			return 8;
		},
		events: (_data) => [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Punish"},
			{trigger: "playerAttack", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true, original: "Punish"},
			{trigger: "playerCast", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true, original: "Punish"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true, original: "Punish"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true, original: "Punish"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},

	//region Cursed
	"CursedHeal": {level: 5,
		weight: (_item, _allHex, _data) => {
			return 30;
		},
		events: (_data) => [
			{trigger: "tick", type: "CursedHeal", power: 0.5, inheritLinked: true, curse: true, original: "CursedHeal"},
			{trigger: "orgasm", type: "CursedHeal", power: 10.0, inheritLinked: true, curse: true, original: "CursedHeal"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedHeal", color: "#9074ab", inheritLinked: true, original: "CursedHeal"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedHeal", color: "#9074ab", inheritLinked: true, original: "CursedHeal"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"CursedCorruption": {level: 6,
		weight: (_item, _allHex, _data) => {
			return 40;
		},
		events: (_data) => [
			{trigger: "tick", type: "CursedCorruption", power: 0.1, limit: -0.9, inheritLinked: true, curse: true, original: "CursedCorruption"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedCorruption", color: "#9074ab", inheritLinked: true, original: "CursedCorruption"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedCorruption", color: "#9074ab", inheritLinked: true, original: "CursedCorruption"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"CursedDistract": {level: 4,
		weight: (_item, _allHex, _data) => {
			return 80;
		},
		events: (_data) => [
			{trigger: "afterPlayerDamage", type: "CursedDistract", power: 0.3, time: 10, mult: 0.5, inheritLinked: true, curse: true, original: "CursedDistract"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDistract", color: "#9074ab", inheritLinked: true, original: "CursedDistract"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedDistract", color: "#9074ab", inheritLinked: true, original: "CursedDistract"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"CursedPunishment": {level: 8,
		weight: (_item, _allHex, _data) => {
			return 80;
		},
		events: (_data) => [
			{trigger: "kill", type: "CursedPunishment", time: 4, dist: 8, inheritLinked: true, curse: true, original: "CursedPunishment"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedPunishment", color: "#9074ab", inheritLinked: true, original: "CursedPunishment"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedPunishment", color: "#9074ab", inheritLinked: true, original: "CursedPunishment"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"CursedSubmission": {level: 8,
		weight: (_item, _allHex, _data) => {
			return 80;
		},
		events: (_data) => [
			{trigger: "tickAfter", type: "CursedSubmission", dist: 2.5, count: 2, tags: ["shadowHands"], inheritLinked: true, curse: true, original: "CursedSubmission"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedSubmission", color: "#9074ab", inheritLinked: true, original: "CursedSubmission"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedSubmission", color: "#9074ab", inheritLinked: true, original: "CursedSubmission"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	"CursedDenial": {level: 8,
		weight: (_item, _allHex, _data) => {
			return KinkyDungeonStatsChoice.get("arousalMode") ? 35 : 0;
		},
		events: (_data) => [
			{trigger: "tryOrgasm", type: "CursedDenial", mult: 0, power: 1.0, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "orgasm", type: "CursedDenial", count: 3, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "edge", type: "CursedDenial", count: 3, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDenial", color: "#9074ab", inheritLinked: true, original: "CursedDenial"},
			{trigger: "drawBuffIcons", type: "curseInfo", msg: "CursedDenial", color: "#9074ab", inheritLinked: true, original: "CursedDenial"},
			{trigger: "postApply", inheritLinked: true, type: "cursePrefix"},
		]},
	//endregion
};
