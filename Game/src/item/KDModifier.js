'use strict';




let KDELEMENTS = [
	"fire",
	"soap",
	"crush",
	"stun",
	"electric",
	"ice",
];

/**
 * Contains a list of modifier variant effects classes
 * Can be modified dynamically so mods can add basic curses
 */
let KDModifierEffectVariantList = {
	"Common": [
		"SpellDamageBuff",
		"ElementalBuff",
		"ElementalResist",
	],
};
/**
 * Contains a list of modifier variant condition classes
 * Can be modified dynamically so mods can add basic curses
 */
let KDModifierConditionVariantList = {
	"Common": [
		"OnTease",
		"OnElementalSpell",
	],
};

/**@type {Record<string, KDModifierEffect>} */
let KDModifierEffects = {
	SpellDamageBuff: {
		tags: ['buff', 'positive', 'temp', 'magic'],
		types: {
			// Weapon
			2: null,
			// Consumable
			1: null,
			// Restraint
			0: {
				level: 6,
				filter: (item, positive, data) => {
					return true;
				},
				weight: (item, positive, data) => {
					return 10;
				},
				events: (item, positive, data) => {
					let power = Math.max(KDGetItemPower(item), 2);
					let amt = 5 + Math.round((0.4 + 0.6*KDRandom()) * 4 * Math.pow(power, 0.7));

					amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
					let time = 12 + Math.floor(KDRandom() * amt * 0.35);

					return [
						{trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: "spellDamageBuff", time: time, power: 0.01*amt, desc: "SpellDamageBuff", buffSprite: "SpellDamageUp", },
						{original: "SpellDamageBuff", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "SpellDamageBuff", power: amt, duration: time, color: "#000000", bgcolor: "#8888ff"},
						{original: "SpellDamageBuff", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, color: "#ff8933"},
					];
				},
			},
		}
	},
	ElementalBuff: {
		tags: ['buff', 'positive', 'temp', 'magic', "element"],
		types: {
			// Weapon
			2: null,
			// Consumable
			1: null,
			// Restraint
			0: {
				level: 5,
				filter: (item, positive, data) => {
					return true;
				},
				weight: (item, positive, data) => {
					return 10;
				},
				onSelect: (item, data) => {
					if (!data.element)
						data.element = CommonRandomItemFromList("", KDELEMENTS);
				},
				events: (item, positive, data) => {
					let type = data.element;

					let power = Math.max(KDGetItemPower(item), 2);
					let amt = 8 + Math.round((0.4 + 0.6*KDRandom()) * 5 * Math.pow(power, 0.75));

					amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
					let time = 6 + Math.floor(KDRandom() * amt * 0.2);

					return [
						{trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: type + "DamageBuff", time: time, power: 0.01*amt, desc: "ElementalBuff", damage: data.element, buffSprite: "SpellDamageUp",},
						{original: "ElementalBuff", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "ElementalBuff", damage: data.element, power: amt, duration: time, color: "#000000",
							bgcolor: KinkyDungeonDamageTypes[type].color},
						{original: "ElementalBuff", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, color: KinkyDungeonDamageTypes[type].color},
					];
				},
			},
		}
	},
	ElementalResist: {
		tags: ['buff', 'positive', 'temp', 'magic', "element"],
		types: {
			// Weapon
			2: null,
			// Consumable
			1: null,
			// Restraint
			0: {
				level: 4,
				filter: (item, positive, data) => {
					return true;
				},
				weight: (item, positive, data) => {
					return 10;
				},
				onSelect: (item, data) => {
					if (!data.element)
						data.element = CommonRandomItemFromList("", KDELEMENTS);
				},
				events: (item, positive, data) => {
					let type = data.element;

					let power = Math.max(KDGetItemPower(item), 2);
					let amt = 20 + Math.round((0.4 + 0.6*KDRandom()) * 15 * Math.pow(power, 0.75));

					amt = KDGenericMultEnchantmentAmount(amt, item, data.Loot, data.curse, data.primaryEnchantment);
					let time = 15 + Math.floor(KDRandom() * amt * 0.15);

					return [
						{trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: type + "DamageResist", time: time, power: 0.01*amt, desc: "ElementalResist", damage: data.element, buffSprite: "SpellDamageUp",},
						{original: "ElementalResist", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "ElementalResist", damage: data.element, power: amt, duration: time, color: "#000000",
							bgcolor: KinkyDungeonDamageTypes[type].color},
						{original: "ElementalResist", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, bgcolor: KinkyDungeonDamageTypes[type].color},
					];
				},
			},
		}
	},
};

/**@type {Record<string, KDModifierCondition>} */
let KDModifierConditions = {
	OnTease: {
		tags: ['accessible', 'melee', 'common', 'riskmed'],
		types: {
			// Weapon
			2: null,
			// Consumable
			1: null,
			// Restraint
			0: {
				level: 6,
				filter: (item, pos, neut, neg, data) => {
					return true;
				},
				weight: (item, pos, neut, neg, data) => {
					return 10;
				},
				events: (item, pos, neut, neg, data) => {
					let effects = KDGenericEffects(item, KDModifierEnum.restraint, pos, neut, neg, data);
					for (let eff of effects) {
						if (eff.trigger == "CONDITION") {
							eff.trigger = "playerAttack";
							eff.targetType = "enemy";
							eff.attackerType = "KDPLAYER";
							eff.condition = "DamageTypeTeasing";
							eff.dynamic = true;
						}
					}
					return [
						{original: "OnTease", inheritLinked: true, trigger: "inventoryTooltip", type: "conditionModifier", msg: "OnTease", color: "#000000", bgcolor: "#ffffff"},
						...effects];
				},
			},
		}
	},
	OnElementalSpell: {
		tags: ['accessible', 'melee', 'common', 'riskmed'],
		types: {
			// Weapon
			2: null,
			// Consumable
			1: null,
			// Restraint
			0: {
				level: 6,
				filter: (item, pos, neut, neg, data) => {
					return data.element && KDELEMENTS.includes(data.element);
				},
				weight: (item, pos, neut, neg, data) => {
					return 100;
				},
				events: (item, pos, neut, neg, data) => {
					let effects = KDGenericEffects(item, KDModifierEnum.restraint, pos, neut, neg, data);
					for (let eff of effects) {
						if (eff.trigger == "CONDITION") {
							eff.trigger = "playerCast";
							eff.targetType = "enemy";
							eff.attackerType = "KDPLAYER";
							eff.condition = "spellType";
							eff.damage = data.element;
							eff.kind = data.element;
							eff.dynamic = true;
						}
					}
					return [
						{original: "OnElementalSpell", inheritLinked: true, trigger: "inventoryTooltip", type: "conditionModifier", msg: "OnElementalCast", damage: data.element, color: "#000000", bgcolor: "#ffffff"},
						...effects];
				},
			},
		}
	},
};

/**
 *
 * @param {string} item
 * @param {ModifierEnum} type
 * @param {KDModifierEffect[]} pos
 * @param {KDModifierEffect[]} neut
 * @param {KDModifierEffect[]} neg
 * @param {KDModifierConditionData} data
 * @returns {KinkyDungeonEvent[]}
 */
function KDGenericEffects(item, type, pos, neut, neg, data) {
	let effects = [];
	for (let eff of [...pos]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.positive, data));
	}
	for (let eff of [...neut]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.neutral, data));
	}
	for (let eff of [...neg]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.negative, data));
	}
	return effects;
}