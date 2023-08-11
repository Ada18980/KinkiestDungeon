'use strict';


/** @type {Record<string, {level: number, weight: (item: string) => number, events: KinkyDungeonEvent[]}>} */
let KDEventHexModular = {
	"Light": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "ItemLight", trigger: "getLights", power: 3.5, color: "#ffff55", inheritLinked: true, curse: true},
			{trigger: "tick", type: "sneakBuff", power: -1.0, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Illumination", color: "#ff5555", inheritLinked: true},
		]},
	"Attraction": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "CurseAttraction", trigger: "calcPlayChance", power: 0.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Attraction", color: "#ff5555", inheritLinked: true}
		]},
	"Sensitivity": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "CurseSensitivity", trigger: "calcOrgThresh", power: 0.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Sensitivity", color: "#ff5555", inheritLinked: true}
		]},
	"Submission": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "CurseSubmission", trigger: "orgasm", power: 10, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Submission", color: "#ff5555", inheritLinked: true}
		]},
	"Distraction": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "multDistractionPos", trigger: "changeDistraction", power: 1.5, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Distraction", color: "#ff5555", inheritLinked: true}
		]},
	"Breathlessness": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "multStaminaPos", trigger: "changeStamina", power: 0.6, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Breathlessness", color: "#ff5555", inheritLinked: true}
		]},
	"Futility": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{type: "multWillPos", trigger: "changeWill", power: 0.25, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Futile", color: "#ff5555", inheritLinked: true}
		]},
	"Tickle": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: [
			{trigger: "tick", type: "tickleDrain", power: -0.02, inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Tickle", color: "#ff5555", inheritLinked: true}
		]},
	"Punish": {level: 2,
		weight: (item) => {
			return 8;
		},
		events: [
			{trigger: "playerAttack", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true},
			{trigger: "playerCast", type: "cursePunish", chance: 1, damage: "souldrain", power: 1, sfx: "SoftShield", msg: "KinkyDungeonPunishPlayerCurse", inheritLinked: true, curse: true},
			{trigger: "drawSGTooltip", type: "curseInfo", msg: "Punish", color: "#ff5555", inheritLinked: true}
		]},
};