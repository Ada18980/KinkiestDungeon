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
		"ManaCostSpecific",
		"ManaRegen",
		"BaseDamageBuffMelee",
		"CommonPair",
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
		"ManaCostSpecific",
	],
	"CommonWeapon": [
		"Accuracy",
		"SpellWard",
		"ElementalDmg",
		"AoEDamageFrozen",
		"ShadowBleed",
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
	amt *= 1 + ((KDGetEffLevel() - 1)/(KinkyDungeonMaxLevel - 1)); // Higher floor = higher rewards
	if (Loot?.amtMult) amt *= Loot.amtMult;
	if (primaryEnchantment) amt *= 0.45; // Reduce the power if there are already enchantments
	if (curse && KDEventHexModular[curse]?.level > 0) amt *= 1 + 0.5 * Math.pow(KDEventHexModular[curse].level, 0.5);
	return Math.ceil(amt);
}
/**
 * Normalized for stats that are multiplicative, E.G mana costs
 * Only works for stuff normalized to a range of (0-100)
 * @param {number} amt
 * @param {string} item
 * @param {any} Loot
 * @param {string} curse
 * @param {string} primaryEnchantment
 * @returns {number}
 */
function KDNormalizedMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment) {
	let original = amt * 0.01;
	amt *= 1 + ((KDGetEffLevel() - 1)/(KinkyDungeonMaxLevel - 1)); // Higher floor = higher rewards
	if (Loot?.amtMult) amt *= Loot.amtMult;
	if (primaryEnchantment) amt *= 0.3; // Reduce the power if there are already enchantments
	if (curse && KDEventHexModular[curse]?.level > 0) amt *= 1 + 0.5 * Math.pow(KDEventHexModular[curse].level, 0.5);
	return 100 * (1 - (1 - original) * Math.pow(1 - original, (amt / (100 * original))));
}

/** @type {Record<string, KDEnchantment>} */
let KDEventEnchantmentModular = {
	"CommonPair": {
		tags: ["condition"],
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 1,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("condition")) return 0;
					return 5;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					return [
						...KDGenerateEffectConditionPair("Common", "Common", KDModifierEnum.restraint, item, 0, 10, 1)
					];}},
		}},

	"Evasion": {
		tags: ["evasion", "defense", "passive"],
		suffix: "Evasion",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 1,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("Evasion")) return 0;
					if (allEnchant.includes("Sneak")) return 20;
					if (KDRestraint({name: item})?.blockfeet) return 0;
					if (KDRestraint({name: item})?.shrine?.includes("Light")) return 10;
					if (KDRestraint({name: item})?.hobble) return 20;
					return 3;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 4);
					let amt = 7 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "Evasion", trigger: "tick", type: "evasionBuff", power: amt/100, inheritLinked: true},
						{original: "Evasion", trigger: "inventoryTooltip", type: "varModifier", msg: "Evasion", power: amt, color: "#004400", bgcolor: "#88ff88"},
						{original: "Evasion", trigger: "icon", type: "tintIcon", power: 1, color: "#88ff88"},
					];}},
		}},
	"Accuracy": {
		tags: ["accuracy", "offense", "passive"],
		prefix: "Accuracy",
		types: {
			2: null, //consumable
			1: /*weapon*/{level: 1,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("Accuracy")) return 0;
					if (allEnchant.includes("Sneak")) return 20;
					if (KDWeapon({name: item})?.crit > KDDefaultCrit) return 10;
					return 4;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemRarity(item), 1);
					let amt = 15 + Math.round((0.4 + 0.6*KDRandom()) * 10 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "Accuracy", trigger: "calcEvasion", type: "IsMagic"},
						{original: "Accuracy", trigger: "tick", type: "AccuracyBuff", power: amt/100},
						{original: "Accuracy", trigger: "inventoryTooltip", type: "varModifier", msg: "Accuracy", power: amt, color: "#004400", bgcolor: "#aaffaa"},
						{original: "Accuracy", trigger: "icon", type: "tintIcon", power: 1, color: "#ffffff"},
					];}},
			0: /*restraint*/{level: 1,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("Accuracy")) return 0;
					if (KDRestraint({name: item})?.blindfold) return 40;
					if (KDRestraint({name: item})?.bindhands) return 4;
					if (KDRestraint({name: item})?.bindarms) return 1;
					return 24;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 3);
					let amt = 6 + Math.round((0.4 + 0.6*KDRandom()) * 8 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "Accuracy", trigger: "tick", type: "AccuracyBuff", power: amt/100, inheritLinked: true},
						{original: "Accuracy", trigger: "inventoryTooltip", type: "varModifier", msg: "Accuracy", power: amt, color: "#004400", bgcolor: "#aaffaa"},
						{original: "Accuracy", trigger: "icon", type: "tintIcon", power: 1, color: "#ffffff"},
					];}},
		}},
	"Sneak": {
		tags: ["stealth", "defense", "passive"],
		prefix: "Sneak",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 2,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("Sneak")) return 0;
					if (allEnchant.includes("Evasion")) return 20;
					if (allEnchant.includes("Accuracy")) return 20;
					if (KDRestraint({name: item})?.shrine?.includes("Light")) return 10;
					if (!KDRestraint({name: item})?.armor) return 15;
					return 4;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 2);
					let amt = 5 + Math.round((0.4 + 0.6*KDRandom()) * 5 * Math.pow(power, 0.5));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					amt = Math.pow(amt, 0.9);
					return [
						{original: "Sneak", trigger: "tick", type: "sneakBuff", power: amt/100, inheritLinked: true},
						{original: "Sneak", trigger: "inventoryTooltip", type: "varModifier", msg: "Sneak", power: amt, color: "#330033", bgcolor: "#692464"},
						{original: "Sneak", trigger: "icon", type: "tintIcon", power: 1, color: "#692464"},
					];}},
		}},
	"AoEDamageFrozen": {
		tags: ["magic", "offense", "ice", "passive"],
		prefix: "AoEDamageFrozen",
		types: {
			2: null, //consumable
			1: /*weapon*/{level: 1,
				filter: (item, allEnchant) => {
					return (KinkyDungeonWeapons[item]?.type == 'ice' || KinkyDungeonWeapons[item]?.type == 'frost');
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("AoEDamageFrozen")) return 0;
					if (KDWeapon({name: item})?.type == "ice" || KDWeapon({name: item})?.type == "frost") return 100;
					return 15;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemRarity(item), 1);
					let amt = 1 + Math.round((0.4 + 0.6*KDRandom()) * 2 * Math.pow(power, 0.6));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "AoEDamageFrozen", trigger: "calcEvasion", type: "IsMagic"},
						{original: "AoEDamageFrozen", type: "AoEDamageFrozen", trigger: "tick", aoe: 10, power: amt, damage: "ice"},
						{original: "AoEDamageFrozen", trigger: "inventoryTooltip", type: "varModifier", msg: "AoEDamageFrozen", power: amt, color: "#000044", bgcolor: "#aaddff"},
						{original: "AoEDamageFrozen", trigger: "icon", type: "tintIcon", power: 2, color: "#aaddff"},
					];}},
			0: /*restraint*/null
		}
	},
	"ShadowBleed": {
		tags: ["magic", "offense", "shadow", "passive"],
		prefix: "ShadowBleed",
		types: {
			2: null, //consumable
			1: /*weapon*/{level: 1,
				filter: (item, allEnchant) => {
					return (KinkyDungeonWeapons[item]?.type == 'cold' || KinkyDungeonWeapons[item]?.light);
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ShadowBleed")) return 0;
					if (KDWeapon({name: item})?.tease) return 0;
					if (KDWeapon({name: item})?.type == "charm") return 0;
					if (KDWeapon({name: item})?.type == "tickle") return 0;
					if (KDWeapon({name: item})?.type == "cold") return 100;
					return 20;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemRarity(item), 1);
					let amt = 4 + Math.round((0.4 + 0.6*KDRandom()) * 5 * Math.pow(power, 0.7));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ShadowBleed", type: "ShadowBleed", trigger: "afterPlayerAttack", time: 10, power: 0.1 * amt, damage: "cold"},
						{original: "ShadowBleed", trigger: "calcEvasion", type: "IsMagic"},
						{original: "ShadowBleed", trigger: "inventoryTooltip", type: "varModifier", msg: "ShadowBleed", power: amt, color: "#000044", bgcolor: "#aa00ff"},
						{original: "ShadowBleed", trigger: "icon", type: "tintIcon", power: 2, color: "#aa00ff"},
					];}},
			0: /*restraint*/null
		}
	},
	"SpellWard": {
		tags: ["magic", "defense", "passive"],
		suffix: "SpellWard",
		types: {
			2: null, //consumable
			1: /*weapon*/{level: 1,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("SpellWard")) return 0;
					return KinkyDungeonWeapons[item]?.magic ? 12 : 2 + (KinkyDungeonWeapons[item]?.tags?.includes("shield") ? 30 : 0);
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemRarity(item), 1);
					let amt = 7 + Math.round((0.4 + 0.6*KDRandom()) * 20 * Math.pow(power, 0.6));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "SpellWard", trigger: "calcEvasion", type: "IsMagic"},
						{original: "SpellWard", trigger: "tick", type: "spellWardBuff", power: amt/10, inheritLinked: true},
						{original: "SpellWard", trigger: "inventoryTooltip", type: "varModifier", msg: "SpellWard", power: amt, color: "#000044", bgcolor: "#4444ff"},
						{original: "SpellWard", trigger: "icon", type: "tintIcon", power: 2, color: "#4444ff"},
					];}},
			0: /*restraint*/{level: 2,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("SpellWard")) return 0;
					if (KDRestraint({name: item})?.magic) return 40;
					return 5;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 3);
					let amt = 3 + Math.round((0.4 + 0.6*KDRandom()) * 3 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "SpellWard", trigger: "tick", type: "spellWardBuff", power: amt/10, inheritLinked: true},
						{original: "SpellWard", trigger: "inventoryTooltip", type: "varModifier", msg: "SpellWard", power: amt, color: "#000044", bgcolor: "#4444ff"},
						{original: "SpellWard", trigger: "icon", type: "tintIcon", power: 2, color: "#4444ff"},
					];}},
		}},
	"BondageResist": {
		tags: ["melee", "bondage", "defense", "passive"],
		suffix: "BondageResist",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 2,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("BondageResist")) return 0;
					if (KDRestraint({name: item})?.armor || KDRestraint({name: item})?.good) return 10;
					return 0;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 5);
					let amt = 10 + Math.round((0.4 + 0.6*KDRandom()) * 8 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "BondageResist", trigger: "tick", type: "RestraintBlock", power: amt/10, inheritLinked: true},
						{original: "BondageResist", trigger: "inventoryTooltip", type: "varModifier", msg: "BondageResist", power: amt, color: "#441100", bgcolor: "#ffaa88"},
						{original: "BondageResist", trigger: "icon", type: "tintIcon", power: 2, color: "#ffaa88"},
					];}},
		}},
	"DamageResist": {
		tags: ["damage", "defense", "passive"],
		suffix: "DamageResist",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 3,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("DamageResist")) return 0;
					if (allEnchant.includes("DamageBuff")) return 40;
					if (KDRestraint({name: item})?.armor) return 40;
					return 20;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 4);
					let amt = 10 + Math.round((0.4 + 0.6*KDRandom()) * 10 * Math.pow(power, 0.75));
					let types = ['fire', 'ice', 'acid', 'glue', 'chain', 'grope', 'crush', 'cold', 'electric', 'poison', 'soul', 'tickle'];
					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "DamageResist", trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageResist", kind: type, inheritLinked: true},
						{original: "DamageResist", trigger: "icon", type: "tintIcon", power: 3, bgcolor: KinkyDungeonDamageTypes[type].color},
						{original: "DamageResist", trigger: "inventoryTooltip", type: "varModifier", msg: "DamageResist", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
					];}},
		}},
	"DamageBuff": {
		tags: ["damage", "offense", "passive"],
		suffix: "DamageBuff",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 4,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("DamageBuff")) return 0;
					if (allEnchant.includes("DamageResist")) return 40;
					if (KDRestraint({name: item})?.magic) return 40;
					return 15;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 2);
					let amt = 2 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.75));
					let types = ['fire', 'ice', 'acid', 'slash', 'pierce', 'unarmed', 'pain', 'cold', 'glue', 'chain', 'tickle', 'crush', 'electric', 'soul', 'charm'];
					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);

					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "DamageBuff", trigger: "tick", type: "buff", power: amt/100, buff: type+"DamageBuff", kind: type, inheritLinked: true},
						{original: "DamageBuff", trigger: "icon", type: "tintIcon", power: 4, bgcolor: KinkyDungeonDamageTypes[type].color},
						{original: "DamageBuff", trigger: "inventoryTooltip", type: "varModifier", msg: "DamageBuff", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
					];}},
		}},
	"ManaCost": {
		tags: ["magic", "mana", "economy", "passive"],
		prefix: "ManaCost",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ManaCost")) return 0;
					if (allEnchant.includes("ManaCostSpecific")) return 0;
					if (KDRestraint({name: item})?.magic) return 18;
					if (KDRestraint({name: item})?.blindfold) return 14;
					if (KDRestraint({name: item})?.gag) return 14;
					if (KDRestraint({name: item})?.bindhands) return 9;
					if (KDRestraint({name: item})?.armor) return 8;
					return 3;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 1 + Math.round((0.4 + 0.6*KDRandom()) * 50 * (1-Math.pow(0.98, power)));
					amt = KDNormalizedMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ManaCost", trigger: "calcMultMana", type: "ManaCost", power: 1 - Math.min(0.99, amt*0.01), inheritLinked: true},
						{original: "ManaCost", trigger: "inventoryTooltip", type: "varModifier", msg: "ManaCost", power: -amt, color: "#0000ff", bgcolor: "#8888ff"},
						{original: "ManaCost", trigger: "icon", type: "tintIcon", power: 5, color: "#0000ff"},
					];}},
		}},
	"ManaCostSpecific": {
		tags: ["magic", "mana", "economy", "passive"],
		prefix: "ManaCostSpecific",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ManaCost")) return 0;
					if (allEnchant.includes("ManaCostSpecific")) return 0;
					if (KDRestraint({name: item})?.magic) return 25;
					if (KDRestraint({name: item})?.blindfold) return 20;
					if (KDRestraint({name: item})?.gag) return 20;
					if (KDRestraint({name: item})?.bindhands) return 15;
					if (KDRestraint({name: item})?.armor) return 14;
					return 6;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 3);
					let amt = 5 + Math.round((0.4 + 0.6*KDRandom()) * 70 * (1-Math.pow(0.975, power)));
					let types = ['air', 'earth', 'fire', 'water', 'electric', 'ice', 'latex', 'metal', 'rope', 'leather', 'light', 'shadow', 'stealth', 'summon', 'knowledge', 'arrow'];

					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);

					amt = KDNormalizedMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ManaCostSpecific", trigger: "calcMultMana", type: "ManaCost", condition: "spellType", kind: type, power: 1 - Math.min(0.99, amt*0.01), inheritLinked: true},
						{original: "ManaCostSpecific", trigger: "inventoryTooltip", type: "varModifier", msg: "ManaCostSpecific", kind: TextGet("KinkyDungeonFilter" + type), power: -amt, color: "#0000ff", bgcolor: "#8888ff"},
						{original: "ManaCostSpecific", trigger: "icon", type: "tintIcon", power: 5, color: "#0000ff"},
					];}},
		}},
	"ManaRegenOnKill": {
		tags: ["magic", "mana", "economy", "trigger"],
		prefix: "ManaRegenOnKill",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ManaRegenOnKill")) return 0;
					if (KDRestraint({name: item})?.magic) return 12;
					return 6;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 0.5 + Math.round((0.4 + 0.6*KDRandom()) * 1.5 * Math.pow(power, 0.5));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ManaRegenOnKill", trigger: "capture", type: "ManaBounty", power: amt * 0.1, inheritLinked: true},
						{original: "ManaRegenOnKill", trigger: "inventoryTooltip", type: "varModifier", msg: "ManaRegenOnKill", power: amt, color: "#0000ff", bgcolor: "#8888ff"},
						{original: "ManaRegenOnKill", trigger: "icon", type: "tintIcon", power: 5, color: "#00bbbb"},
					];}},
		}},
	"ElementalEcho": {
		tags: ["melee", "magic", "elemental", "offense", "passive"],
		suffix: "ElementalEcho",
		types: {
			2: null, //consumable
			1: null, // weapon
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ElementalEcho")) return 0;
					if (KDRestraint({name: item})?.bindarms) return 1;
					if (KDRestraint({name: item})?.bindhands) return 2;
					if (KDRestraint({name: item})?.armor) return 40;
					if (["ItemArms", "ItemHands", "ItemBoots", "ItemHead", "ItemVulva", "ItemVulvaPiercings", "ItemNipplesPiercings"].includes(KDRestraint({name: item})?.Group)) return 13;
					return 3;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 2 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.5));
					let types = ['fire', 'ice', 'acid', 'cold', 'electric', 'stun', 'soul'];

					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ElementalEcho", trigger: "playerAttack", type: "ElementalEcho", power: amt * 0.01, kind: type, damage: type, inheritLinked: true},
						{original: "ElementalEcho", trigger: "inventoryTooltip", type: "varModifier", msg: "ElementalEcho", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
						{original: "ElementalEcho", trigger: "icon", type: "tintIcon", power: 5, color: "#ffff00", bgcolor: KinkyDungeonDamageTypes[type].color},
					];}},
		}},
	"ElementalDmg": {
		tags: ["magic", "elemental", "offense", "passive"],
		prefix: "ElementalDmg",
		types: {
			2: null, //consumable
			1: /*weapon*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ElementalDmg")) return 0;
					if (!KinkyDungeonMeleeDamageTypes.includes(KinkyDungeonWeapons[item]?.type)) return 0;
					if (["ItemArms", "ItemHands", "ItemBoots", "ItemHead", "ItemVulva", "ItemVulvaPiercings", "ItemNipplesPiercings"].includes(KDRestraint({name: item})?.Group)) return 20;
					return 14;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemRarity(item), 1);
					let amt = 3 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.7));
					let types = ['fire', 'ice', 'acid', 'cold', 'electric', 'stun', 'soul'];

					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ElementalDmg", trigger: "calcEvasion", type: "IsMagic"},
						{original: "ElementalDmg", trigger: "playerAttack", type: "ElementalEffect", power: amt * 0.1, kind: type, damage: type},
						{original: "ElementalDmg", trigger: "inventoryTooltip", type: "varModifier", msg: "ElementalDmg", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
						{original: "ElementalDmg", trigger: "icon", type: "tintIcon", power: 5, color: "#ffff00", bgcolor: KinkyDungeonDamageTypes[type].color},
					];}},
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant, data) => {
					if (allEnchant.includes("ElementalDmg")) return 0;
					if (KDRestraint({name: item})?.armor) return 11;
					return 8;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 0.8 + Math.round((0.4 + 0.6*KDRandom()) * 2.8 * Math.pow(power, 0.4));
					let types = ['fire', 'ice', 'acid', 'cold', 'electric', 'stun', 'soul'];

					let type = KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types);
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ElementalDmg", trigger: "playerAttack", type: "ElementalEffect", power: amt * 0.1, damage: type, inheritLinked: true},
						{original: "ElementalDmg", trigger: "inventoryTooltip", type: "varModifier", msg: "ElementalDmg", power: amt, kind: TextGet("KinkyDungeonDamageType" + type), bgcolor: KinkyDungeonDamageTypes[type].color, color: KinkyDungeonDamageTypes[type].bg || "#004400"},
						{original: "ElementalDmg", trigger: "icon", type: "tintIcon", power: 5, color: "#ff0000", bgcolor: KinkyDungeonDamageTypes[type].color},
					];}},
		}},
	"ManaRegen": {
		tags: ["magic", "mana", "passive"],
		prefix: "ManaRegen",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 2,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("ManaRegen")) return 0;
					if (KDRestraint({name: item})?.gag) return 20;
					return 12;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 3);
					let amt = 15 + Math.round((0.4 + 0.6*KDRandom()) * 10 * Math.pow(power, 0.75));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "ManaRegen", trigger: "afterCalcManaPool", type: "MultManaPoolRegen", power: 1 + amt*0.01, inheritLinked: true},
						{original: "ManaRegen", trigger: "inventoryTooltip", type: "varModifier", msg: "ManaRegen", power: amt, color: "#0088ff", bgcolor: "#88aaff"},
						{original: "ManaRegen", trigger: "icon", type: "tintIcon", power: 2, color: "#0055aa"},
					];}},
		}},
	"BaseDamageBuffMelee": {
		tags: ["melee", "offense", "damage", "passive"],
		suffix: "BaseDamageBuffMelee",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 4,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("BaseDamageBuffMelee")) return 0;
					if (KDRestraint({name: item})?.bindarms) return 3;
					if (KDRestraint({name: item})?.bindhands) return 1;
					return 18;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 1.5 + Math.round((0.4 + 0.6*KDRandom()) * 3.5 * Math.pow(power, 0.33));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "BaseDamageBuffMelee", trigger: "beforePlayerAttack", type: "AmpDamage", prereq: "damageType", kind: "melee", power: amt*.01, inheritLinked: true},
						{original: "BaseDamageBuffMelee", trigger: "calcDisplayDamage", type: "AmpDamage", prereq: "damageType", kind: "melee", power: amt*.01, inheritLinked: true},
						{original: "BaseDamageBuffMelee", trigger: "inventoryTooltip", type: "varModifier", msg: "BaseDamageBuffMelee", power: amt, color: "#000000", bgcolor: "#ff0000"},
						{original: "BaseDamageBuffMelee", trigger: "icon", type: "tintIcon", power: 4, color: "#ff0000"},
					];}},
		}},
	"BaseDamageBuffMagic": {
		tags: ["magic", "damage", "offense", "passive"],
		suffix: "BaseDamageBuffMagic",
		types: {
			2: null, //consumable
			1: null, //weapon
			0: /*restraint*/{level: 5,
				filter: (item, allEnchant) => {
					return true;
				},
				weight: (item, allEnchant) => {
					if (allEnchant.includes("BaseDamageBuffMagic")) return 0;
					if (KDRestraint({name: item})?.bindarms) return 15;
					if (KDRestraint({name: item})?.bindhands) return 11;
					if (KDRestraint({name: item})?.gag) return 9;
					if (KDRestraint({name: item})?.heelpower) return 5;
					return 3;
				},
				events: (item, Loot, curse, primaryEnchantment, enchantments, data) => {
					let power = Math.max(KDGetItemPower(item), 1);
					let amt = 1.8 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.4));
					amt = KDGenericMultEnchantmentAmount(amt, item, Loot, curse, primaryEnchantment);
					return [
						{original: "BaseDamageBuffMagic", trigger: "beforePlayerAttack", type: "AmpDamage", prereq: "damageType", kind: "magic", power: amt*.01, inheritLinked: true},
						{original: "BaseDamageBuffMagic", trigger: "calcDisplayDamage", type: "AmpDamage", prereq: "damageType", kind: "magic", power: amt*.01, inheritLinked: true},
						{original: "BaseDamageBuffMagic", trigger: "inventoryTooltip", type: "varModifier", msg: "BaseDamageBuffMagic", power: amt, color: "#000000", bgcolor: "#8800ff"},
						{original: "BaseDamageBuffMagic", trigger: "icon", type: "tintIcon", power: 5, color: "#8800ff"},
					];}},
		}},
};

function KDGetItemPower(item) {
	return KinkyDungeonGetRestraintByName(item)?.displayPower || KinkyDungeonGetRestraintByName(item)?.power || 0;
}

function KDGetItemRarity(item) {
	return KinkyDungeonFindWeapon(item)?.rarity || KinkyDungeonFindConsumable(item)?.rarity || 0;
}

/**
 *
 * @param {string} item
 * @param {*} Loot
 * @param {string} curse
 * @param {string} primaryEnchantment
 * @param {string[]} enchantments
 * @param {KDHexEnchantEventsData} data
 * @param {string[]} types
 * @returns {string}
 */
function KDEnchantDetermineKind(item, Loot, curse, primaryEnchantment, enchantments, data, types) {
	let type = CommonRandomItemFromList("", types);
	if (data?.variant?.events) {
		for (let event of data?.variant?.events) {
			if (types.includes(event.kind) && KDRandom() < 0.8) {
				return event.kind;
			} else if (types.includes(event.damage) && KDRandom() < 0.8) {
				return event.damage;
			} else if (event.kind == "melee" && KDRandom() < 0.8) {
				types.filter((typ) => {return KinkyDungeonMeleeDamageTypes.includes(typ);});
				return CommonRandomItemFromList("", types) || type;
			} else if (event.kind == "magic" && KDRandom() < 0.8) {
				types.filter((typ) => {return !KinkyDungeonMeleeDamageTypes.includes(typ);});
				return CommonRandomItemFromList("", types) || type;
			}
			else if (event.kind == "latex" && types.includes('glue') && KDRandom() < 0.8) {
				return 'glue';
			} else if (event.kind == "glue" && types.includes('latex') && KDRandom() < 0.8) {
				return 'latex';
			}
			else if ((event.kind == "leather" || event.kind == "rope" || event.kind == "metal") && types.includes('chain') && KDRandom() < 0.8) {
				return 'chain';
			} else if (event.kind == "chain" && KDRandom() < 0.8) {
				if (types.includes('leather')) return 'leather';
				if (types.includes('metal')) return 'leather';
				if (types.includes('rope')) return 'leather';
			}
			else if (event.kind == "water" && types.includes('acid') && KDRandom() < 0.8) {
				return 'acid';
			} else if (event.kind == "acid" && types.includes('water') && KDRandom() < 0.8) {
				return 'water';
			}
			else if (event.kind == "earth" && types.includes('crush') && KDRandom() < 0.8) {
				return 'crush';
			} else if (event.kind == "crush" && types.includes('earth') && KDRandom() < 0.8) {
				return 'earth';
			}
			else if (event.kind == "air" && types.includes('stun') && KDRandom() < 0.8) {
				return 'stun';
			} else if (event.kind == "stun" && types.includes('air') && KDRandom() < 0.8) {
				return 'air';
			}
			else if (event.kind == "light" && types.includes('holy') && KDRandom() < 0.8) {
				return 'holy';
			} else if (event.kind == "holy" && types.includes('light') && KDRandom() < 0.8) {
				return 'light';
			}
			else if (event.kind == "shadow" && types.includes('cold') && KDRandom() < 0.8) {
				return 'cold';
			} else if (event.kind == "cold" && types.includes('shadow') && KDRandom() < 0.8) {
				return 'shadow';
			}
		}
	}
	return type;
}