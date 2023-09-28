"use strict";

let KinkyDungeonStatStaminaCostAttack = -1.0; // Cost to attack

/**
 * @type {Record<string, weapon>}
 */
let KinkyDungeonWeapons = {
	"Unarmed": {name: "Unarmed", dmg: 2, chance: 0.9, type: "unarmed", unarmed: true, rarity: 0, shop: false, noequip: true, sfx: "Unarmed"},

	// Knives
	"Knife": {name: "Knife", dmg: 2.0, chance: 0.9, staminacost: 1.5, type: "slash", unarmed: false, rarity: 1, cutBonus: 0.05, shop: true, sfx: "Unarmed", light: true,
		crit: 1.5,
	},
	"EnchKnife": {name: "EnchKnife", dmg: 2.5, chance: 0.9, staminacost: 1.5, type: "cold", unarmed: false, rarity: 1, cutBonus: 0.05, magic: true, shop: true, sfx: "MagicSlash", light: true,
		crit: 1.5,
	},
	"Dirk": {name: "Dirk", dmg: 2.5, chance: 1.0, staminacost: 1.8, type: "slash", unarmed: false, rarity: 2, shop: true, cutBonus: 0.05, light: true, sfx: "LightSwing",
		crit: 1.75,
		events: [
			{type: "ChangeDamageUnaware", trigger: "beforePlayerAttack", power: 4, damage: "pierce"},
		],
	},

	// Shields
	"Shield": {name: "Shield", dmg: 2.0, chance: 0.6, staminacost: 5.5,  type: "crush", unarmed: false, rarity: 2, shop: false, sfx: "HeavySwing",
		crit: 1.1,
		events: [
			{type: "blockBuff", trigger: "tick", power: 0.6},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "stun", time: 4}
		]},
	"ShieldTower": {name: "ShieldTower", dmg: 4.0, chance: 0.25, staminacost: 6.0,  type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "HeavySwing",
		crit: 1.1,
		events: [
			{type: "armorBuff", trigger: "tick", power: 3.0},
			{type: "blockBuff", trigger: "tick", power: 1.2},
			{type: "slowLevel", trigger: "tick", power: 1},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "stun", time: 7}
		]},
	"ShieldReinforced": {name: "ShieldReinforced", dmg: 3.0, chance: 0.4, staminacost: 5.5,  type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "HeavySwing",
		crit: 1.1,
		events: [
			{type: "armorBuff", trigger: "tick", power: 1.5},
			{type: "blockBuff", trigger: "tick", power: 0.8},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "stun", time: 5}
		]},
	"ShieldMagic": {name: "ShieldMagic", dmg: 3.0, chance: 0.4, staminacost: 5.5,  type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "HeavySwing",
		crit: 1.1,
		events: [
			{type: "spellWardBuff", trigger: "tick", power: 2.0},
			{type: "blockBuff", trigger: "tick", power: 0.8},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "stun", time: 5}
		]},

	// Swords
	"Sword": {name: "Sword", dmg: 3, chance: 1.5, staminacost: 2.4, type: "slash", unarmed: false, rarity: 2, shop: false, cutBonus: 0.01, sfx: "LightSwing"},
	"ChainSword": {name: "ChainSword", dmg: 2.5, bind: 0.5, bindType: "Metal", chance: 1.6, staminacost: 2.4, type: "slash", unarmed: false, rarity: 3, shop: true, cutBonus: 0.01, sfx: "Chain"},
	"SlimeSword": {name: "SlimeSword", dmg: 2.4, bind: 2.5, bindEff: 0, bindType: "Slime", chance: 1.3, staminacost: 2.6, type: "glue", unarmed: false, rarity: 3, shop: true, sfx: "RubberBolt"},
	"Katana": {name: "Katana", dmg: 3, chance: 1.5, staminacost: 3.0, type: "slash", unarmed: false, rarity: 3, shop: true, cutBonus: 0.01, sfx: "LightSwing",
		crit: 1.5,
		events: [
			{type: "Patience", trigger: "tick", power: 11, buffType: "KatanaCharge", color: "#ffffff"},
			{type: "KatanaBoost", trigger: "beforePlayerAttack", power: 0.25, sfx: "Fwoosh"},
		]
	},
	"DarkKatana": {name: "DarkKatana", dmg: 3, chance: 2.0, staminacost: 2.6, type: "cold", unarmed: false, rarity: 4, shop: false, magic: true, cutBonus: 0.01, sfx: "LightSwing",
		crit: 2.0,
		events: [
			{type: "DamageMultInShadow", trigger: "beforePlayerAttack", power: 2.0, sfx: "Fwoosh"},
		]
	},
	"MagicSword": {name: "MagicSword", dmg: 3, chance: 2, staminacost: 2.3, type: "slash", unarmed: false, rarity: 4, shop: false, magic: true, cutBonus: 0.1, sfx: "LightSwing"},
	"Flamberge": {name: "Flamberge", dmg: 2.0, chance: 1.0, staminacost: 2.8, type: "fire", unarmed: false, rarity: 3, shop: true, cutBonus: 0.1, sfx: "FireSpell", magic: true,
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 2.0, damage: "slash"}, {type: "WeaponLight", trigger: "getLights", power: 5}],
		special: {type: "ignite"},},
	"FrostSword": {name: "FrostSword", dmg: 1.5, chance: 1.0, staminacost: 2.5, type: "slash", unarmed: false, rarity: 3, shop: true, cutBonus: 0.1, sfx: "LesserFreeze", magic: true,
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 2.0, time: 5, damage: "frost"}, {type: "WeaponLight", trigger: "getLights", power: 3, color: "#92e8c0"}]
	},
	"Foil": {name: "Foil", dmg: 0.8, chance: 1.5, staminacost: 1.5, type: "pierce", unarmed: false, rarity: 3, shop: true, sfx: "Miss",
		crit: 2.0,
		events: [
			{type: "ChangeDamageVulnerable", trigger: "beforePlayerAttack", power: 3.0, damage: "pierce"},
		],
	},
	"Rapier": {name: "Rapier", dmg: 2.5, chance: 1.3, staminacost: 3.0, type: "slash", unarmed: false, rarity: 3, shop: true, sfx: "LightSwing",
		crit: 1.5,
		events: [
			{type: "ChangeDamageVulnerable", trigger: "beforePlayerAttack", power: 5.0, damage: "pierce"},
		],
	},

	// Axes
	"Axe": {name: "Axe", dmg: 4, chance: 1.0, staminacost: 4, type: "slash", unarmed: false, rarity: 2, shop: false, sfx: "HeavySwing",
		events: [{type: "Cleave", trigger: "playerAttack", power: 2, damage: "slash"}]},
	"MagicAxe": {name: "MagicAxe", dmg: 4, chance: 1.0, staminacost: 4, type: "cold", unarmed: false, rarity: 4, magic: true, shop: false, cutBonus: 0.2, sfx: "HeavySwing",
		events: [{type: "Cleave", trigger: "playerAttack", power: 2, damage: "cold", time: 3}, {type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "cold", time: 3}]},

	// Hammers
	"Hammer": {name: "Hammer", dmg: 5, chance: 1.0, staminacost: 6, type: "crush", unarmed: false, rarity: 2, shop: true, sfx: "HeavySwing", cutBonus: 0.01,
		crit: 1.2,
		events: [{type: "Knockback", trigger: "playerAttack", dist: 1}]},
	"MagicHammer": {name: "MagicHammer", dmg: 6, chance: 1.0, staminacost: 5.5, type: "crush", unarmed: false, rarity: 4, magic: true, shop: false, cutBonus: 0.2, sfx: "HeavySwing",
		crit: 1.2,
		events: [{type: "Knockback", trigger: "playerAttack", dist: 1}]},
	"IceBreaker": {name: "IceBreaker", dmg: 4.3, chance: 1.2, staminacost: 4, type: "crush", unarmed: false, rarity: 4, magic: true, shop: false, sfx: "HeavySwing",
		events: [{type: "MultiplyDamageFrozen", trigger: "beforeDamageEnemy", power: 1.5}]},
	"StormBreaker": {name: "StormBreaker", dmg: 4, chance: 1.0, staminacost: 5, type: "crush", unarmed: false, rarity: 4, magic: true, shop: false, sfx: "HeavySwing",
		crit: 1.4,
		events: [
			{type: "StormBreakerDamage", trigger: "playerAttack", power: 4.0, sfx: "Shock", aoe: 1.5, damage: "electric"},
			{type: "StormBreakerCharge", trigger: "beforePlayerDamage", power: 1.5, damageTrigger: "electric", color: "#3de1ff"},
		]},

	// Flails
	"Flail": {name: "Flail", dmg: 2.5, chance: 1.4, staminacost: 2.8, type: "crush", unarmed: false, rarity: 2, shop: true, sfx: "LightSwing",
		crit: 1.5,
		events: [{type: "Cleave", trigger: "playerAttack", power: 1, damage: "crush"}]},
	"MagicFlail": {name: "MagicFlail", dmg: 3, chance: 1.25, staminacost: 3.0, type: "crush", unarmed: false, rarity: 4, magic: true, shop: false, sfx: "LightSwing",
		crit: 1.6,
		events: [{type: "Cleave", trigger: "playerAttack", power: 3, damage: "crush"}]},

	// Spears
	"Spear": {name: "Spear", dmg: 4.0, chance: 1.0, staminacost: 3.3, type: "pierce", unarmed: false, rarity: 2, shop: false, sfx: "LightSwing",
		crit: 1.4,
		events: [{type: "Pierce", trigger: "playerAttack", power: 4.0, damage: "pierce"}]},
	"MagicSpear": {name: "MagicSpear", dmg: 4.0, chance: 1.5, staminacost: 3.3, type: "pierce", unarmed: false, rarity: 4, magic: true, shop: true, sfx: "LightSwing",
		events: [{type: "Pierce", trigger: "playerAttack", power: 4.0, damage: "pierce", dist: 2}]},

	// Specialty Weapons
	"StaffTape": {name: "StaffTape", dmg: 1, bindEff: 2.0, bindType: "Tape", chance: 1.0, staminacost: 1.5, type: "chain", unarmed: false, rarity: 4, shop: true, sfx: "Tape", magic: false,
		events: [
			{type: "ApplyTaped", trigger: "playerAttack", power: -0.15, duration: 12},
			{type: "DealDamageToTaped", trigger: "playerMove", power: 1.0, dist: 1.5, damage: "chain", bindType: "Tape", bindEff: 2.0, sfx: "TapeStruggle"},
		]
	},

	// Tier 1 Staves
	"StaffFlame": {name: "StaffFlame", dmg: 4, chance: 0.85, staminacost: 5.0, type: "fire", unarmed: false, rarity: 3, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.15, buffType: "fireDamageBuff"}],
		special: {type: "ignite"},},
	"StaffChain": {name: "StaffChain", dmg: 3, bindEff: 1.25, bindType: "Metal", chance: 1.1, staminacost: 3.0, type: "chain", unarmed: false, rarity: 3, shop: true, sfx: "Chain", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.1, buffType: "chainDamageBuff"},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "chain", time: 2}]},
	"StaffGlue": {name: "StaffGlue", dmg: 3, bindEff: 1.5, bindType: "Slime", chance: 1.0, staminacost: 4.0, type: "glue", unarmed: false, rarity: 3, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.1, buffType: "glueDamageBuff"}]},
	"StaffElectric": {name: "StaffElectric", dmg: 3, chance: 1.1, staminacost: 4.0, type: "electric", unarmed: false, rarity: 3, shop: true, sfx: "Shock", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.1, buffType: "electricDamageBuff"}, {type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "electric", time: 3, chance: 0.1}]},
	"StaffPermafrost": {name: "StaffPermafrost", dmg: 4, chance: 1.0, staminacost: 4.0, type: "ice", unarmed: false, rarity: 3, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.1, buffType: "iceDamageBuff"},
			{type: "Buff", trigger: "tick", power: 0.1, buffType: "frostDamageBuff"},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "ice", time: 4, chance: 0.15},
			{type: "MultiplyTime", trigger: "beforeDamageEnemy", power: 1.5, damage: "ice"}]},

	// Tier 2 Staves
	"StaffBind": {name: "StaffBind", dmg: 2.3, bindEff: 1, bindType: "Metal", chance: 1.0, staminacost: 3.0, type: "chain", unarmed: false, rarity: 4, shop: true, sfx: "Chain", magic: true,
		crit: 1.1,
		events: [
			{type: "Buff", trigger: "tick", power: 0.2, buffType: "chainDamageBuff"},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "chain", time: 4}]},
	"StaffIncineration": {name: "StaffIncineration", dmg: 6, chance: 0.7, staminacost: 5.0, type: "fire", unarmed: false, rarity: 4, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [
			{type: "Buff", trigger: "tick", power: 0.25, buffType: "fireDamageBuff"},
			{type: "AoEDamageBurning", trigger: "tick", aoe: 10, power: 0.5, damage: "fire"}],
		special: {type: "ignite"},},
	"StaffStorm": {name: "StaffStorm", dmg: 4.5, chance: 1.0, staminacost: 4.5, type: "electric", unarmed: false, rarity: 4, shop: true, sfx: "Shock", magic: true,
		crit: 1.1,
		events: [
			{type: "Buff", trigger: "tick", power: 0.2, buffType: "electricDamageBuff"},
			{type: "EchoDamage", trigger: "beforeDamageEnemy", aoe: 2.99, power: 1.5, damage: "electric"}]},
	"StaffDoll": {name: "StaffDoll", dmg: 3.0, chance: 1.0, staminacost: 4.0, type: "soul", unarmed: false, rarity: 4, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [
			{type: "Buff", trigger: "tick", power: 0.15, buffType: "glueDamageBuff"},
			{type: "Dollmaker", trigger: "capture"}]},
	"StaffFrostbite": {name: "StaffFrostbite", dmg: 4, chance: 1.0, staminacost: 4.0, type: "ice", unarmed: false, rarity: 4, shop: true, sfx: "MagicSlash", magic: true,
		crit: 1.1,
		events: [{type: "Buff", trigger: "tick", power: 0.2, buffType: "iceDamageBuff"},
			{type: "Buff", trigger: "tick", power: 0.2, buffType: "frostDamageBuff"},
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "ice", time: 4, chance: 0.25},
			{type: "AoEDamageFrozen", trigger: "tick", aoe: 10, power: 0.5, damage: "ice"}]},

	// Tier 1 orbs
	"ArcaneCrystal": {name: "ArcaneCrystal", dmg: 3.3, chance: 0.8, staminacost: 3.0, type: "cold", noHands: true, unarmed: false, novulnerable: true, magic: true, rarity: 2, shop: true, sfx: "Laser",
		events: [{type: "WeaponLight", trigger: "getLights", power: 3.5, color: "#6700ff"}]},

	// Techy
	"Slimethrower": {name: "Slimethrower", dmg: 3.5, chance: 1.0, staminacost: 6.0, type: "crush", unarmed: false, rarity: 10, shop: false, sfx: "HeavySwing",
		crit: 1.1,
		special: {type: "spell", spell: "Slimethrower", requiresEnergy: true, energyCost: 0.015}},
	"EscortDrone": {name: "EscortDrone", dmg: 1.5, chance: 1.0, staminacost: 0.0, type: "electric", noHands: true, unarmed: false, rarity: 10, shop: false, sfx: "Laser",
		crit: 1.1,
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 0, chance: 0.33, damage: "electric", time: 4}, {type: "WeaponLight", trigger: "getLights", power: 4}]},

	// Special
	"BoltCutters": {name: "BoltCutters", dmg: 3.5, staminacost: 3.8, chance: 1.0, type: "crush", unarmed: false, rarity: 3, shop: false, cutBonus: 0.3, sfx: "Unarmed",
		crit: 1.1,
		events: [{type: "DamageToTag", trigger: "playerAttack", requiredTag: "lock", power: 7, damage: "slash", chance: 1.0}]},
	"Pickaxe": {name: "Pickaxe", dmg: 3, chance: 1.0, staminacost: 3.0, type: "pierce", unarmed: false, rarity: 3, shop: true, sfx: "LightSwing",
		crit: 1.4,
		events: [{type: "ApplyBuff", trigger: "playerAttack", buff: {id: "ArmorDown", type: "ArmorBreak", duration: 6, power: -1.5, player: true, enemies: true, tags: ["debuff", "armor"]}}]},
	"Torch": {name: "Torch", dmg: 1.5, chance: 0.75, type: "fire", unarmed: false, rarity: 1, shop: true, sfx: "FireSpell",
		crit: 1.1,
		events: [{type: "WeaponLight", trigger: "getLights", power: 6, color: "#ff8933"}],
		special: {type: "ignite"},},

	// BDSM Gear
	"Feather": {name: "Feather", dmg: 0.5, chance: 2.0,
		crit: 1.5,
		staminacost: 0.5, distract: 2, type: "tickle", unarmed: false, rarity: 1, shop: true, sfx: "Tickle"},
	"Crop": {name: "Crop", dmg: 2.5, chance: 1.0, staminacost: 2.0,
		crit: 1.8, distract: 3, type: "pain", tease: true, unarmed: false, rarity: 2, shop: true, sfx: "Whip"},
	"IceCube": {name: "IceCube", dmg: 1.5, chance: 1.0, staminacost: 1.0,
		crit: 2.0,
		distract: 1, type: "ice", tease: true, unarmed: false, rarity: 1, shop: true, sfx: "Freeze",
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "ice", time: 3, chance: 0.1}]},
	"Rope": {name: "Rope", dmg: 1.0, bind: 5, chance: 1.0, staminacost: 1.0, type: "chain",
		crit: 1.1, unarmed: false, rarity: 1, shop: true, sfx: "Struggle", bindType: "Rope"},
	"MagicRope": {name: "MagicRope", dmg: 1.0, bind: 5, chance: 1.0, staminacost: 1.0, type: "chain", unarmed: false, rarity: 3, magic: true, shop: true, sfx: "TapeStruggle", bindType: "Rope",
		events: [
			{type: "MagicRope", trigger: "playerAttack", power: 0, cost: 1, bindType: "Magic", bind: 5},
			{type: "WeaponLight", trigger: "getLights", power: 3, color: "#92e8c0"}
		],
	},
	"VibeWand": {name: "VibeWand", dmg: 2.0, chance: 1.0, staminacost: 1.5, type: "charm", unarmed: false, rarity: 1, shop: true, sfx: "Vibe",
		crit: 1.4,
		playSelfBonus: 4,
		arousalMode: true,
		playSelfMsg: "KinkyDungeonPlaySelfVibeWand",
		playSelfSound: "Vibe",
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "stun", time: 2, chance: 0.2}]},
	"BagOfGoodies": {name: "BagOfGoodies", arousalMode: true, dmg: 0.4, chance: 1.0, staminacost: 0.5, type: "charm", unarmed: false, rarity: 2, shop: false, sfx: "Vibe",
		crit: 1.1,
		playSelfBonus: 3,
		playSelfMsg: "KinkyDungeonPlaySelfBagOfGoodies",
		playSelfSound: "Vibe",
		events: [
			{type: "ApplyToy", trigger: "playerAttack", duration: 40},
		],
		special: {type: "spell", spell: "CommandVibrateBagOfGoodies", requiresEnergy: true, energyCost: 0.01, range: 4.5},
	},
	"VibeRemote": {name: "VibeRemote", dmg: 0.1, chance: 0.4, staminacost: 0.5, type: "charm", unarmed: false, rarity: 2, shop: true, magic: true, sfx: "Vibe",
		crit: 1.1,
		arousalMode: true,
		events: [{type: "ActivateVibration", trigger: "playerAttack", power: 1, time: 5}],
		special: {type: "spell", spell: "CommandVibrateVibeRemote", requiresEnergy: true, energyCost: 0.015}},


	"DildoBat": {name: "DildoBat", dmg: 1.5, chance: 2.0, staminacost: 3,
		crit: 3.0, type: "grope", unarmed: false, rarity: 2, shop: true, sfx: "RubberBolt"},
	"DildoBatPlus": {name: "DildoBatPlus", dmg: 2.0, chance: 2.0, staminacost: 3, type: "grope", unarmed: false, rarity: 4, shop: false, sfx: "RubberBolt",
		crit: 3.0,
		special: {type: "spell", selfCast: true, spell: "DildoBatBuff", requiresEnergy: true, energyCost: 0.04},
	},

	"Scissors": {name: "Scissors", dmg: 1.2, chance: 1.8, staminacost: 0.7, type: "slash", unarmed: false, rarity: 2, shop: true, light: true, cutBonus: 0.1, sfx: "Cut"},

	"Blaster": {name: "Blaster", dmg: 1, chance: 1.0, crit: 1.1, staminacost: 0.5, type: "tickle", unarmed: false, rarity: 5, shop: false, sfx: "Shock",
		special: {type: "spell", spell: "BlasterBlast", requiresEnergy: true, energyCost: 0.01, range: 8}},

	// Bows
	"Bow": {name: "Bow", dmg: 1.0, chance: 0.8, staminacost: 1, type: "crush", unarmed: false, rarity: 2, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 1.5,
		tags: ["bow", "normalbow"],
		special: {type: "spell", spell: "ArrowNormal", requiresEnergy: true, energyCost: 0.01, range: 6}},
	"BowRecurve": {name: "BowRecurve", dmg: 1.3, chance: 0.7, staminacost: 1, type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 1.5,
		tags: ["bow", "normalbow"],
		events: [
			{type: "Reload", trigger: "tick", requireEnergy: true, energyCost: 0.014, power: 1, color: "#ffffff", prereq: "LightLoad"},
			{type: "Unload", trigger: "playerCastSpecial", power: 0, mult: 0},
		],
		special: {type: "spell", spell: "ArrowRecurve", prereq: "Loaded", requiresEnergy: true, energyCost: 0.014, range: 6}},
	"Longbow": {name: "Longbow", dmg: 1.4, chance: 0.6, staminacost: 1, type: "crush", unarmed: false, rarity: 4, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 1.5,
		tags: ["bow", "normalbow"],
		events: [
			{type: "Reload", trigger: "tick", requireEnergy: true, energyCost: 0.018, power: 2, color: "#ffffff", prereq: "LightLoad"},
			{type: "Unload", trigger: "playerCastSpecial", power: 0, mult: 0},
		],
		special: {type: "spell", spell: "ArrowLongbow", prereq: "Loaded", requiresEnergy: true, energyCost: 0.018, range: 8}},

	"Crossbow": {name: "Crossbow", dmg: 1.5, chance: 0.5, staminacost: 1, type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 2.0,
		tags: ["bow", "normalbow", "crossbow"],
		events: [
			{type: "Reload", trigger: "tick", requireEnergy: true, energyCost: 0.02, power: 3, color: "#ffffff", prereq: "HeavyLoad"},
			{type: "Unload", trigger: "playerCastSpecial", power: 0, mult: 0},
		],
		special: {type: "spell", spell: "ArrowBolt", prereq: "Loaded", requiresEnergy: true, energyCost: 0.02, range: 8}},

	"CrossbowPistol": {name: "CrossbowPistol", dmg: 1.5, chance: 1.0, staminacost: 1, type: "crush", unarmed: false, rarity: 3, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 2.0,
		tags: ["bow", "normalbow", "crossbow"],
		events: [
			{type: "Reload", trigger: "tick", requireEnergy: true, energyCost: 0.015, power: 3, color: "#ffffff", prereq: "LightLoad"},
			{type: "Unload", trigger: "playerCastSpecial", power: 0, mult: 0},
		],
		special: {type: "spell", spell: "ArrowBoltPistol", prereq: "Loaded", requiresEnergy: true, energyCost: 0.015, range: 9}},

	"CrossbowHeavy": {name: "CrossbowHeavy", dmg: 3.0, chance: 0.3, staminacost: 2.0, type: "crush", unarmed: false, rarity: 4, shop: true, sfx: "Miss",
		clumsy: true,
		crit: 2.5,
		tags: ["bow", "normalbow", "crossbow"],
		events: [
			{type: "Reload", trigger: "tick", requireEnergy: true, energyCost: 0.025, power: 5, color: "#ffffff", prereq: "HeavyLoad"},
			{type: "Unload", trigger: "playerCastSpecial", power: 0, mult: 0},
		],
		special: {type: "spell", spell: "ArrowBoltHeavy", prereq: "Loaded", requiresEnergy: true, energyCost: 0.025, range: 12}},

	// Divine
	"MoiraiScissors": {name: "MoiraiScissors", crit: 2.0, dmg: 1.5, chance: 1.1, staminacost: 1.5, type: "slash", unarmed: false, rarity: 10, shop: false, magic: true, cutBonus: 0.2, sfx: "Cut",
		events: [
			{type: "DoubleStrike", trigger: "afterPlayerAttack", requireEnergy: true, energyCost: 0.005},
			{type: "ConvertBindingToDamage", trigger: "afterPlayerAttack", power: 1.0, bind: 3.0, damage: "soul"},
		],
	},
	"Dreamcatcher": {name: "Dreamcatcher", crit: 1.5, dmg: 2.5, chance: 1.0, staminacost: 1.5, type: "cold", unarmed: false, rarity: 10, shop: false, magic: true, cutBonus: 0.15, sfx: "Fwoosh",
		events: [
			{type: "Dreamcatcher", trigger: "playerAttack", time: 20, requireEnergy: true, energyCost: 0.03},
			{type: "ElementalDreamcatcher", trigger: "playerAttack", power: 3.0, damage: "soul"},
		],
	},
	"MessengerOfLove": {name: "MessengerOfLove", crit: 1.1, dmg: 2, chance: 0.75, staminacost: 1, type: "crush", unarmed: false, rarity: 10, shop: false, magic: true, sfx: "Unarmed",
		special: {type: "spell", spell: "HeartArrow", requiresEnergy: true, energyCost: 0.05, range: 50},
		tags: ["bow", "specialbow"],
	},
	"Dragonslaver": {name: "Dragonslaver", crit: 1.4, dmg: 3.5, chance: 1.25, staminacost: 2.5, type: "slash", unarmed: false, rarity: 10, shop: false, cutBonus: 0.1, sfx: "LightSwing",
		events: [{type: "CastSpell", spell: "BeltStrike", trigger: "playerAttack", requireEnergy: true, energyCost: 0.008}],
		special: {type: "hitorspell", spell: "BeltStrike", requiresEnergy: true, energyCost: 0.0075, range: 2.99}},
	"Arbiter": {name: "Arbiter", crit: 1.1, bindcrit: 2.0, dmg: 3.5, bindEff: 1.25, chance: 2.0, bindType: "Metal", staminacost: 3, type: "chain", unarmed: false, rarity: 10, shop: false, magic: true, sfx: "HeavySwing",
		events: [
			{type: "BuffMulti", trigger: "tick", power: 0.25, buffTypes: [
				"glueDamageBuff",
				"chainDamageBuff",
			]},
			{type: "DamageToSummons", trigger: "playerAttack", power: 4, damage: "cold", chance: 1.0}
		],
		special: {type: "spell", spell: "Disarm", requiresEnergy: true, energyCost: 0.025, range: 3.99}},
	"BondageBuster": {name: "BondageBuster", crit: 1.5, dmg: 0.7, chance: 1.0, staminacost: 0.5,  type: "tickle", unarmed: false, rarity: 10, shop: false, sfx: "Shock",
		events: [
			{type: "ElementalEffect", trigger: "playerAttack", power: 0, time: 4, damage: "tickle"},
			{type: "Charge", trigger: "tick", power: 11, buffType: "BondageBustCharge", color: "#ffff00"},
			{type: "BondageBustBoost", trigger: "spellCast", power: 0.25, sfx: "Shock", energyCost: 0.0025},
		],
		special: {type: "spell", spell: "BondageBust", requiresEnergy: true, energyCost: 0.005, range: 4}},
	"TheEncaser": {name: "TheEncaser", dmg: 4, chance: 1.0, bindType: "Slime", staminacost: 3.0, type: "glue", unarmed: false, rarity: 10, shop: false, magic: true, sfx: "MagicSlash", crit: 1.25,
		events: [{type: "ElementalEffect", trigger: "playerAttack", power: 0, damage: "glue", time: 2}],
		special: {type: "spell", selfCast: true, spell: "SlimeForm", requiresEnergy: true, energyCost: 0.025}},
	"FourSeasons": {name: "FourSeasons", dmg: 4, chance: 1.0, staminacost: 4.0, type: "cold", unarmed: false, rarity: 10, shop: false, magic: true, sfx: "Fwoosh", crit: 1.25,
		events: [
			{type: "BuffMulti", trigger: "tick", power: 0.25, buffTypes: [
				"fireDamageBuff",
				"iceDamageBuff",
				"frostDamageBuff",
				"acidDamageBuff",
				"electricDamageBuff",
				"crushDamageBuff",
				"gravityDamageBuff",
				"stunDamageBuff",
			]}
		],
		special: {type: "spell", selfCast: true, spell: "AvatarForm", requiresEnergy: true, energyCost: 0.05}},


};


