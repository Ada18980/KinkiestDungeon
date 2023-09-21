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

/** @type {Record<string, {level: number, weight: (item: string, allHex: string[]) => number, events: KinkyDungeonEvent[]}>} */
let KDEventHexModular = {
	"Light": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Light"},
			{type: "ItemLight", trigger: "getLights", prereq: "noCorruption", power: 3.5, color: "#ffff55", inheritLinked: true, curse: true, original: "Light"},
			{trigger: "tick", type: "sneakBuff", power: -1.0, inheritLinked: true, curse: true, original: "Light"},
			{trigger: "drawSGTooltip", type: "curseInfo", prereq: "noCorruption", msg: "Illumination", color: "#ff5555", inheritLinked: true, original: "Light"},
		]},
	"Attraction": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Attraction"},
			{type: "CurseAttraction", trigger: "calcPlayChance", power: 0.5, inheritLinked: true, curse: true, original: "Attraction"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true, original: "Attraction"}
		]},
	"Sensitivity": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Sensitivity"},
			{type: "CurseSensitivity", trigger: "calcOrgThresh", power: 0.5, inheritLinked: true, curse: true, original: "Sensitivity"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true, original: "Sensitivity"}
		]},
	"Submission": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Submission"},
			{type: "CurseSubmission", trigger: "orgasm", power: 10, inheritLinked: true, curse: true, original: "Submission"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true, original: "Submission"}
		]},
	"Distraction": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Distraction"},
			{type: "multDistractionPos", trigger: "changeDistraction", power: 1.5, inheritLinked: true, curse: true, original: "Distraction"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true, original: "Distraction"}
		]},
	"Breathlessness": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Breathlessness"},
			{type: "multStaminaPos", trigger: "changeStamina", power: 0.6, inheritLinked: true, curse: true, original: "Breathlessness"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true, original: "Breathlessness"}
		]},
	"Futility": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Futility"},
			{type: "multWillPos", trigger: "changeWill", power: 0.5, inheritLinked: true, curse: true, original: "Futility"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true, original: "Futility"}
		]},
	"Tickle": {level: 1,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Tickle"},
			{trigger: "tick", type: "tickleDrain", power: -0.1, inheritLinked: true, curse: true, original: "Tickle"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true, original: "Tickle"}
		]},
	"Punish": {level: 2,
		weight: (item, allHex) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true, kind: "transform", original: "Punish"},
			{trigger: "playerAttack", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true, original: "Punish"},
			{trigger: "playerCast", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true, original: "Punish"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true, original: "Punish"}
		]},

	//region Cursed
	"CursedHeal": {level: 5,
		weight: (item, allHex) => {
			return 30;
		},
		events: [
			{trigger: "tick", type: "CursedHeal", power: 0.5, inheritLinked: true, curse: true, original: "CursedHeal"},
			{trigger: "orgasm", type: "CursedHeal", power: 10.0, inheritLinked: true, curse: true, original: "CursedHeal"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedHeal", color: "#9074ab", inheritLinked: true, original: "CursedHeal"}
		]},
	"CursedCorruption": {level: 6,
		weight: (item, allHex) => {
			return 40;
		},
		events: [
			{trigger: "tick", type: "CursedCorruption", power: 0.1, limit: -0.9, inheritLinked: true, curse: true, original: "CursedCorruption"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedCorruption", color: "#9074ab", inheritLinked: true, original: "CursedCorruption"}
		]},
	"CursedDistract": {level: 4,
		weight: (item, allHex) => {
			return 80;
		},
		events: [
			{trigger: "afterPlayerDamage", type: "CursedDistract", power: 0.3, time: 10, mult: 0.5, inheritLinked: true, curse: true, original: "CursedDistract"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDistract", color: "#9074ab", inheritLinked: true, original: "CursedDistract"}
		]},
	"CursedPunishment": {level: 8,
		weight: (item, allHex) => {
			return 80;
		},
		events: [
			{trigger: "kill", type: "CursedPunishment", time: 4, dist: 8, inheritLinked: true, curse: true, original: "CursedPunishment"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedPunishment", color: "#9074ab", inheritLinked: true, original: "CursedPunishment"}
		]},
	"CursedSubmission": {level: 8,
		weight: (item, allHex) => {
			return 80;
		},
		events: [
			{trigger: "tickAfter", type: "CursedSubmission", dist: 2.5, count: 2, tags: ["shadowHands"], inheritLinked: true, curse: true, original: "CursedSubmission"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedSubmission", color: "#9074ab", inheritLinked: true, original: "CursedSubmission"}
		]},
	"CursedDenial": {level: 8,
		weight: (item, allHex) => {
			return KinkyDungeonStatsChoice.get("arousalMode") ? 35 : 0;
		},
		events: [
			{trigger: "tryOrgasm", type: "CursedDenial", mult: 0, power: 1.0, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "orgasm", type: "CursedDenial", count: 3, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "edge", type: "CursedDenial", count: 3, inheritLinked: true, curse: true, original: "CursedDenial"},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDenial", color: "#9074ab", inheritLinked: true, original: "CursedDenial"}
		]},
	//endregion
};