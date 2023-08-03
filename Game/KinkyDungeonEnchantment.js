"use strict";


/**
 * Contains a list of enchantment variant types
 * Can be modified dynamically so mods can add basic curses
 */
let KDEnchantVariantList = {
	"Base": [
		"Common",
	],
	"Common": [
		"Evasion",
		"Sneak",
		"Accuracy",
		"SpellWard",
		"BondageResist",
		"DamageResist",
		"DamageBuff",
	],
};

/** @type {Record<string, {level: number, weight: (item: string) => number, events: (item: string) => KinkyDungeonEvent[]}>} */
let KDEventEnchantmentModular = {
	"Evasion": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 4);
			let amt = 10 + Math.round(KDRandom() * 10 * power);
			return [
				{trigger: "tick", type: "evasionBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Evasion", power: amt, color: "#004400", bgcolor: "#88ff88"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#88ff88"},
			];}},
	"Accuracy": {level: 1,
		weight: (item) => {
			return 10;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 3);
			let amt = 6 + Math.round(KDRandom() * 12 * power);
			return [
				{trigger: "tick", type: "AccuracyBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Accuracy", power: amt, color: "#004400", bgcolor: "#aaffaa"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#ffffff"},
			];}},
	"Sneak": {level: 2,
		weight: (item) => {
			return 13;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 2);
			let amt = 5 + Math.round(KDRandom() * 10 * power);
			return [
				{trigger: "tick", type: "sneakBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Sneak", power: amt, color: "#330033", bgcolor: "#692464"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#692464"},
			];}},
	"SpellWard": {level: 2,
		weight: (item) => {
			return 5;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 3);
			let amt = 3 + Math.round(KDRandom() * 3 * power);
			return [
				{trigger: "tick", type: "spellWardBuff", power: amt/10, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "SpellWard", power: amt, color: "#000044", bgcolor: "#8888ff"},
				{trigger: "icon", type: "tintIcon", power: 2, color: "#aaaaff"},
			];}},
	"BondageResist": {level: 2,
		weight: (item) => {
			return 10;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 5);
			let amt = 20 + Math.round(KDRandom() * 20 * power);
			return [
				{trigger: "tick", type: "restraintBlock", power: amt/10, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "BondageResist", power: amt, color: "#441100", bgcolor: "#ffaa88"},
				{trigger: "icon", type: "tintIcon", power: 2, color: "#ffaa88"},
			];}},
	"DamageResist": {level: 3,
		weight: (item) => {
			return 40;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 4);
			let amt = 10 + Math.round(KDRandom() * 10 * power);
			let types = ['fire', 'ice', 'acid', 'glue', 'chain', 'grope', 'crush', 'cold', 'electric', 'poison', 'soul', 'tickle'];
			let type = CommonRandomItemFromList("", types);
			return [
				{trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageResist", inheritLinked: true},
				{trigger: "icon", type: "tintIcon", power: 3, bgcolor: KinkyDungeonDamageTypes[type].color},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "DamageResist", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
			];}},
	"DamageBuff": {level: 4,
		weight: (item) => {
			return 25;
		},
		events: (item) => {
			let power = Math.max(KinkyDungeonGetRestraintByName(item)?.power || 0, 2);
			let amt = 2 + Math.round(KDRandom() * 4 * power);
			let types = ['fire', 'ice', 'acid', 'slash', 'pierce', 'unarmed', 'pain', 'cold', 'glue', 'chain', 'tickle', 'crush', 'electric', 'soul', 'charm'];
			let type = CommonRandomItemFromList("", types);
			return [
				{trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageBuff", inheritLinked: true},
				{trigger: "icon", type: "tintIcon", power: 4, bgcolor: KinkyDungeonDamageTypes[type].color},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "DamageBuff", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
			];}},
};