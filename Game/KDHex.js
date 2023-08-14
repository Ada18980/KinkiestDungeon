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
};

/** @type {Record<string, {level: number, weight: (item: string) => number, events: KinkyDungeonEvent[]}>} */
let KDEventHexModular = {
	"Light": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "ItemLight", trigger: "getLights", power: 3.5, color: "#ffff55", inheritLinked: true, curse: true},
			{trigger: "tick", type: "sneakBuff", power: -1.0, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Illumination", color: "#ff5555", inheritLinked: true},
		]},
	"Attraction": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "CurseAttraction", trigger: "calcPlayChance", power: 0.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true}
		]},
	"Sensitivity": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "CurseSensitivity", trigger: "calcOrgThresh", power: 0.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true}
		]},
	"Submission": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "CurseSubmission", trigger: "orgasm", power: 10, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true}
		]},
	"Distraction": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "multDistractionPos", trigger: "changeDistraction", power: 1.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true}
		]},
	"Breathlessness": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "multStaminaPos", trigger: "changeStamina", power: 0.6, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true}
		]},
	"Futility": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{type: "multWillPos", trigger: "changeWill", power: 0.25, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true}
		]},
	"Tickle": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{trigger: "tick", type: "tickleDrain", power: -0.02, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true}
		]},
	"Punish": {level: 2,
		weight: (item) => {
			return 8;
		},
		events: [
			// All hexes have this
			{trigger: "CurseTransform", type: "transform", chance: 0.05, inheritLinked: true},
			{trigger: "playerAttack", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true},
			{trigger: "playerCast", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true}
		]},

	//region Cursed
	"CursedHeal": {level: 5,
		weight: (item) => {
			return 30;
		},
		events: [
			{trigger: "tick", type: "CursedHeal", power: 0.5, inheritLinked: true, curse: true},
			{trigger: "orgasm", type: "CursedHeal", power: 10.0, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedHeal", color: "#9074ab", inheritLinked: true}
		]},
	"CursedCorruption": {level: 6,
		weight: (item) => {
			return 40;
		},
		events: [
			{trigger: "tick", type: "CursedCorruption", power: 0.1, limit: -0.9, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedCorruption", color: "#9074ab", inheritLinked: true}
		]},
	"CursedDistract": {level: 4,
		weight: (item) => {
			return 80;
		},
		events: [
			{trigger: "afterPlayerDamage", type: "CursedDistract", power: 0.3, time: 10, mult: 0.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDistract", color: "#9074ab", inheritLinked: true}
		]},
	"CursedPunishment": {level: 8,
		weight: (item) => {
			return 80;
		},
		events: [
			{trigger: "kill", type: "CursedPunishment", time: 4, dist: 8, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedPunishment", color: "#9074ab", inheritLinked: true}
		]},
	"CursedSubmission": {level: 8,
		weight: (item) => {
			return 80;
		},
		events: [
			{trigger: "tickAfter", type: "CursedSubmission", dist: 2.5, count: 2, tags: ["shadowHands"], inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedSubmission", color: "#9074ab", inheritLinked: true}
		]},
	"CursedDenial": {level: 8,
		weight: (item) => {
			return KinkyDungeonStatsChoice.get("arousalMode") ? 35 : 0;
		},
		events: [
			{trigger: "tryOrgasm", type: "CursedDenial", mult: 0, power: 1.0, inheritLinked: true, curse: true},
			{trigger: "orgasm", type: "CursedDenial", count: 3, inheritLinked: true, curse: true},
			{trigger: "edge", type: "CursedDenial", count: 3, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "CursedDenial", color: "#9074ab", inheritLinked: true}
		]},
	//endregion
};