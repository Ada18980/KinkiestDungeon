'use strict';


/**
 * Contains a list of modifier variant effects classes
 * Can be modified dynamically so mods can add basic curses
 */
let KDModifierEffectVariantList = {
	"Common": [
		"SpellDamageBuff",
	],
};
/**
 * Contains a list of modifier variant condition classes
 * Can be modified dynamically so mods can add basic curses
 */
let KDModifierConditionVariantList = {
	"Common": [
		"OnTease",
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
				filter: (item, positive) => {
					return true;
				},
				weight: (item, positive) => {
					return 10;
				},
				events: (item, positive) => {
					return [
						{trigger: "CONDITION", inheritLinked: true, type: "BuffSelf", buffType: "spellDamageBuff", time: 20, power: 0.2, desc: "SpellDamageBuff", buffSprite: "SpellDamageUp", },
						{original: "SpellDamageBuff", inheritLinked: true, trigger: "inventoryTooltip", type: "effectModifier", msg: "SpellDamageBuff", power: 20, duration: 20, color: "#000000", bgcolor: "#8888ff"},
						{original: "SpellDamageBuff", inheritLinked: true, trigger: "icon", type: "tintIcon", power: 4, color: "#ff8800"},
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
				filter: (item, pos, neut, neg) => {
					return true;
				},
				weight: (item, pos, neut, neg) => {
					return 10;
				},
				events: (item, pos, neut, neg) => {
					let effects = KDGenericEffects(item, KDModifierEnum.restraint, pos, neut, neg);
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
};

/**
 *
 * @param {string} item
 * @param {ModifierEnum} type
 * @param {KDModifierEffect[]} pos
 * @param {KDModifierEffect[]} neut
 * @param {KDModifierEffect[]} neg
 * @returns {KinkyDungeonEvent[]}
 */
function KDGenericEffects(item, type, pos, neut, neg) {
	let effects = [];
	for (let eff of [...pos]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.positive));
	}
	for (let eff of [...neut]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.neutral));
	}
	for (let eff of [...neg]) {
		effects.push(...eff.types[type].events(item, KDPosNeutNeg.negative));
	}
	return effects;
}