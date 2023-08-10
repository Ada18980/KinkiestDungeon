"use strict";


/**
 * Contains a list of enchantment variant types
 * Can be modified dynamically so mods can add basic curses
 */
let KDEnchantVariantList = {
	"Common": [
		"Evasion",
		"Sneak",
		"Accuracy",
		"SpellWard",
		"BondageResist",
		"DamageResist",
		"DamageBuff",
		"ManaCost",
		"ManaRegen",
		"BaseDamageBuffMelee",
		//"DPDecay",
		//"DPGain",
		//"DPGainWhenAttacked",
	],
	"Gold": [
		"ElementalEcho",
		"ElementalDmg",
		"BaseDamageBuffMelee",
		"BaseDamageBuffMagic",
		"ManaRegenOnKill",
		"DamageBuff",
		"ManaCost",
	],
};

/**
 *
 * @param {number} amt
 * @param {string} item
 * @param {any} Loot
 * @param {string} curse
 * @param {string} primaryEnchantment
 * @returns {number}
 */
function KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment) {
	if (Loot?.amtMult) amt *= Loot.amtMult;
	if (primaryEnchantment) amt *= 0.6; // Reduce the power if there are already enchantments
	if (curse && KDEventCurseModular[curse]?.level > 0) amt *= 1 + 0.5 * Math.pow(KDEventCurseModular[curse].level, 0.5);
	return Math.ceil(amt);
}

/** @type {Record<string, {level: number, weight: (item: string) => number, events: (item: string, Loot: any, curse: string, primaryEnchantment: string) => KinkyDungeonEvent[]}>} */
let KDEventEnchantmentModular = {
	"Evasion": {level: 1,
		weight: (item) => {
			return 8;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 4);
			let amt = 10 + Math.round(KDRandom() * 5 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "evasionBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Evasion", power: amt, color: "#004400", bgcolor: "#88ff88"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#88ff88"},
			];}},
	"Accuracy": {level: 1,
		weight: (item) => {
			return 10;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 3);
			let amt = 6 + Math.round(KDRandom() * 8 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "AccuracyBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Accuracy", power: amt, color: "#004400", bgcolor: "#aaffaa"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#ffffff"},
			];}},
	"Sneak": {level: 2,
		weight: (item) => {
			return 13;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 2);
			let amt = 5 + Math.round(KDRandom() * 5 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "sneakBuff", power: amt/100, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "Sneak", power: -amt, color: "#330033", bgcolor: "#692464"},
				{trigger: "icon", type: "tintIcon", power: 1, color: "#692464"},
			];}},
	"SpellWard": {level: 2,
		weight: (item) => {
			return 5;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 3);
			let amt = 3 + Math.round(KDRandom() * 3 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "spellWardBuff", power: amt/10, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "SpellWard", power: amt, color: "#000044", bgcolor: "#8888ff"},
				{trigger: "icon", type: "tintIcon", power: 2, color: "#aaaaff"},
			];}},
	"BondageResist": {level: 2,
		weight: (item) => {
			return 10;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 5);
			let amt = 20 + Math.round(KDRandom() * 20 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "restraintBlock", power: amt/10, inheritLinked: true},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "BondageResist", power: amt, color: "#441100", bgcolor: "#ffaa88"},
				{trigger: "icon", type: "tintIcon", power: 2, color: "#ffaa88"},
			];}},
	"DamageResist": {level: 3,
		weight: (item) => {
			return 20;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 4);
			let amt = 10 + Math.round(KDRandom() * 10 * Math.pow(power, 0.75));
			let types = ['fire', 'ice', 'acid', 'glue', 'chain', 'grope', 'crush', 'cold', 'electric', 'poison', 'soul', 'tickle'];
			let type = CommonRandomItemFromList("", types);
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageResist", inheritLinked: true},
				{trigger: "icon", type: "tintIcon", power: 3, bgcolor: KinkyDungeonDamageTypes[type].color},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "DamageResist", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
			];}},
	"DamageBuff": {level: 4,
		weight: (item) => {
			return 15;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 2);
			let amt = 2 + Math.round(KDRandom() * 4 * Math.pow(power, 0.75));
			let types = ['fire', 'ice', 'acid', 'slash', 'pierce', 'unarmed', 'pain', 'cold', 'glue', 'chain', 'tickle', 'crush', 'electric', 'soul', 'charm'];
			let type = CommonRandomItemFromList("", types);
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageBuff", inheritLinked: true},
				{trigger: "icon", type: "tintIcon", power: 4, bgcolor: KinkyDungeonDamageTypes[type].color},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "DamageBuff", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
			];}},
	"ManaCost": {level: 5,
		weight: (item) => {
			return 8;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 1 + Math.round(KDRandom() * 3 * Math.pow(power, 0.5));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "afterCalcMana", type: "ManaCost", power: 1 - Math.min(0.99, amt*0.01)},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "ManaCost", power: -amt, color: "#0000ff", bgcolor: "#8888ff"},
				{trigger: "icon", type: "tintIcon", power: 5, color: "#0000ff"},
			];}},
	"ManaRegenOnKill": {level: 5,
		weight: (item) => {
			return 6;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 0.5 + Math.round(KDRandom() * 1.5 * Math.pow(power, 0.5));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "capture", type: "ManaBounty", power: amt * 0.1},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "ManaRegenOnKill", power: amt, color: "#0000ff", bgcolor: "#8888ff"},
				{trigger: "icon", type: "tintIcon", power: 5, color: "#00bbbb"},
			];}},
	"ElementalEcho": {level: 5,
		weight: (item) => {
			return 9;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 2 + Math.round(KDRandom() * 4 * Math.pow(power, 0.5));
			let types = ['fire', 'ice', 'acid', 'cold', 'electric', 'stun', 'soul'];
			let type = CommonRandomItemFromList("", types);
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "playerAttack", type: "ElementalEffect", power: amt * 0.01 * KinkyDungeonPlayerDamage.dmg, damage: type},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "ElementalEcho", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
				{trigger: "icon", type: "tintIcon", power: 5, color: "#ffff00", bgcolor: KinkyDungeonDamageTypes[type].color},
			];}},
	"ElementalDmg": {level: 5,
		weight: (item) => {
			return 7;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 0.8 + Math.round(KDRandom() * 2.8 * Math.pow(power, 0.4));
			let types = ['fire', 'ice', 'acid', 'cold', 'electric', 'stun', 'soul'];
			let type = CommonRandomItemFromList("", types);
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "playerAttack", type: "ElementalEffect", power: amt * 0.1, damage: type},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "ElementalDmg", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
				{trigger: "icon", type: "tintIcon", power: 5, color: "#ff0000", bgcolor: KinkyDungeonDamageTypes[type].color},
			];}},
	"ManaRegen": {level: 2,
		weight: (item) => {
			return 12;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 3);
			let amt = 15 + Math.round(KDRandom() * 10 * Math.pow(power, 0.75));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "afterCalcManaPool", type: "MultManaPoolRegen", power: 1 + amt*0.01},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "ManaRegen", power: amt, color: "#0088ff", bgcolor: "#88aaff"},
				{trigger: "icon", type: "tintIcon", power: 2, color: "#0055aa"},
			];}},
	"BaseDamageBuffMelee": {level: 4,
		weight: (item) => {
			return 5;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 1.5 + Math.round(KDRandom() * 3.5 * Math.pow(power, 0.33));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "beforePlayerAttack", type: "AmpDamage", prereq: "damageType", kind: "melee", power: amt*.01},
				{trigger: "calcDisplayDamage", type: "AmpDamage", prereq: "damageType", kind: "melee", power: amt*.01},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "BaseDamageBuffMelee", power: amt, color: "#000000", bgcolor: "#ff0000"},
				{trigger: "icon", type: "tintIcon", power: 4, color: "#ff0000"},
			];}},
	"BaseDamageBuffMagic": {level: 5,
		weight: (item) => {
			return 3;
		},
		events: (item, Loot, curse, primaryEnchantment) => {
			let power = Math.max(KDGetItemPower(item), 1);
			let amt = 1.8 + Math.round(KDRandom() * 4 * Math.pow(power, 0.4));
			amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
			return [
				{trigger: "beforePlayerAttack", type: "AmpDamage", prereq: "damageType", kind: "magic", power: amt*.01},
				{trigger: "calcDisplayDamage", type: "AmpDamage", prereq: "damageType", kind: "magic", power: amt*.01},
				{trigger: "inventoryTooltip", type: "varModifier", msg: "BaseDamageBuffMagic", power: amt, color: "#000000", bgcolor: "#8800ff"},
				{trigger: "icon", type: "tintIcon", power: 5, color: "#8800ff"},
			];}},
};

function KDGetItemPower(item) {
	return KinkyDungeonGetRestraintByName(item)?.displayPower || KinkyDungeonGetRestraintByName(item)?.power || 0;
}