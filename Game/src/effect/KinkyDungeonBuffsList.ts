"use strict";


let KDConduction = {id: "Conduction", type: "event", aura: "#ffff88", noAuraColor: true, aurasprite: "Conduction", power: 7.0, player: true, duration: 5, enemies: true, range: 2.99, events: [
	{type: "RemoveConduction", duration: 1, trigger: "tick"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "playerTakeDamage"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "beforeDamageEnemy"},
]};

let KDDrenched = {id: "Drenched", type: "fireDamageResist", aura: "#59a0d1", aurasprite: "Drenched", power: 0.425, player: true, duration: 20, enemies: true, events: [
	{type: "RemoveDrench", duration: 1, trigger: "tick"},
	{type: "Evaporate", mult: 1, trigger: "tick"},
	{type: "ApplyConduction", duration: 1, trigger: "tick", kind: "invis"},
	{type: "ApplyConduction", duration: 1, trigger: "tickAfter", kind: "invis"},
]};


let KDAdrenaline = {
	// Is a hell of a drug
	id: "Adrenaline", type: "VisionRad", power: 0.5, duration: 2, tags: ["adren"],
};

let KDAdrenaline2 = {
	// Is a hell of a drug
	id: "Adrenaline2", type: "VisionRad", power: 2, duration: 2,
};

let KDBurning = {id: "Burning", type: "event", aura: "#ff8933", aurasprite: "Flaming", noAuraColor: true, power: 0.5, player: true, duration: 6, enemies: true, events: [
	{type: "RemoveBurning", trigger: "tick"},
	{type: "ElementalEffect", power: 0.5, damage: "fire", trigger: "tick"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "beforeDamageEnemy"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "playerTakeDamage"},
]};

let KDTrainingUnit = {id: "TrainingUnit", type: "TrainingUnit", aura: "#00ff00", power: -0.5, player: false, duration: 9999, infinite: true, enemies: true,
	events: [
		{type: "TrainingUnit", trigger: "tick"},
		{type: "TrainingUnitReveal", trigger: "tick"},
	],
};

let KDDisenchant1 = {id: "Disenchant1", type: "MoveSpeed", aura: "#440088", power: -0.5, player: false, duration: 9999, infinite: true, enemies: true};
let KDDisenchant2 = {id: "Disenchant2", type: "AttackSlow", aura: "#440088", power: 0.5, player: false, duration: 9999, infinite: true, enemies: true};

let KDVolcanism = {id: "Volcanism", type: "event", aura: "#ff5277", power: 0.5, player: false, duration: 9999, infinite: true, enemies: true, events: [
	{type: "Volcanism", power: 4.0, damage: "fire", trigger: "beforeDamageEnemy"},
]};

let KDDrenched2 = {id: "Drenched2", type: "electricDamageResist", power: -0.2, player: true, duration: 20, enemies: true,
	events: [
		{type: "Evaporate", mult: 1, trigger: "tick"},
	],
};
let KDDrenched3 = {id: "Drenched3", type: "iceDamageResist", power: -0.35, player: true, duration: 20, enemies: true,
	events: [
		{type: "Evaporate", mult: 1, trigger: "tick"},
	],
};

let KDBoundByFate = {id: "BoundByFate", type: "Fate", power: 1, player: true, duration: 3, enemies: false, aura: "#dddddd", events: [
	{type: "BoundByFate", kind: "mithrilRope", count: 2, trigger: "tick", power: 1, damage: "cold"},
]};

let KDTaunted = {id: "Taunted", type: "Taunt", power: 1, player: true, duration: 3, enemies: false, aura: "#dddddd", events: [
	{type: "Taunted", count: 2, trigger: "tick", power: 3, damage: "soul"},
]};

let KDEager = {
	id: "Eager", type: "MoveSpeed", power: 0.1, duration: 1, events: [
		{type: "ApplyVuln", duration: 1, trigger: "tick"},
		{type: "ApplyVuln", duration: 1, power: -1.0, trigger: "tickAfter"},
	]
};
let KDMasochist = {
	id: "Masochist", type: "DamageAmp", power: -1, duration: 1
};

let KDChilled = {id: "Chilled", aura: "#73efe8", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 2,};
let KDSlimed = {
	id: "Slimed", aura: "#dc16bc", aurasprite: "Slimed", noAuraColor: true, type: "SlimeProgress", power: 1.0, player: true, enemies: true, duration: 3, range: 0.5, hideHelpless: true, tags: ["slimed"], events: [
		{type: "RemoveSlimeWalk", duration: 1, trigger: "tick"},
		{type: "Flammable", trigger: "beforeDamageEnemy"},
		{type: "Flammable", trigger: "beforePlayerDamage"},
		{type: "ApplySlowed", duration: 1, power: -1.0, trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -1.0, trigger: "tickAfter"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.3, trigger: "tick"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.3, trigger: "tickAfter"},
	]
};
let KDEncased = {
	id: "Encased", type: "SlimeProgress", power: 2.0, player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, replaceSpriteBound: "EncasedFactoryDoll", replaceSprite: "EncasedDoll", tags: ["encased"], events: [
		{type: "RemoveSlimeWalk", duration: 1, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tickAfter"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tick"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tickAfter"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tick"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tickAfter"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tick"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tickAfter"},
	]
};
let KDEncasedMetal = {
	id: "Encased", type: "SlimeProgress", power: 2.5, player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, replaceSpriteBound: "EncasedFactoryDollMetal", replaceSprite: "EncasedDollMetal", tags: ["encased"], events: [
		{type: "RemoveSlimeWalk", duration: 1, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick"},
		{type: "ApplyKnockback", duration: 1, power: -2.0, trigger: "tick"},
		{type: "ApplyKnockback", duration: 1, power: -2.0, trigger: "tickAfter"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tickAfter"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tick"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tickAfter"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tick"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tickAfter"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tick"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tickAfter"},
	]
};
let KDEncasedDoll = {
	id: "EncasedDoll", type: "SlimeProgress", power: 2.0, player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, replaceSpriteBound: "EncasedFactoryDoll", replaceSprite: "EncasedFactoryDoll", tags: ["encased"], events: [
		{type: "RemoveSlimeWalk", duration: 1, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -2.0, trigger: "tickAfter"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tick"},
		{type: "ApplyAttackSlow", duration: 1, power: 1.0, trigger: "tickAfter"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tick"},
		{type: "ApplySilence", duration: 2, power: 1.0, trigger: "tickAfter"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tick"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.5, trigger: "tickAfter"},
	]
};
let KDChastity = {
	id: "Chastity", type: "Chastity", power: 1.0, aura: "#dddddd", aurasprite: "Chastity", player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, tags: ["chastity"], events: [
		{type: "Distract", power: 0.01, trigger: "tick", prereq: "bound"},
	]
};
let KDVibrate1 = {
	id: "Vibrate", type: "Vibration", power: 1.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDVibrate2 = {
	id: "Vibrate2", type: "Vibration", power: 2.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDVibrate3 = {
	id: "Vibrate3", type: "Vibration", power: 3.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDToySecret = {
	id: "Toy", type: "Plug", power: 0.1, duration: 9999, infinite: true, range: 0.5, tags: ["toy"],
};
let KDToy = {
	id: "Toy", type: "Plug", power: 0.1, aura: "#dddddd", aurasprite: "Toy", player: false, enemies: true, duration: 30, range: 0.5, tags: ["toy"],
	events: [
		{type: "ExtendDisabledOrHelplessOrChastity", trigger: "tick"},
	]
};
let KDPlugged = {
	id: "Plugged", type: "Plug", power: 1.0, aura: "#dddddd", aurasprite: "Plugged", player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 0.2, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
	]
};
let KDDoublePlugged = {
	id: "DoublePlugged", type: "Plug", power: 2.0, aura: "#dddddd", aurasprite: "DoublePlugged", player: false, enemies: true, duration: 9998, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 0.5, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
	]
};

let KDTaped = {
	id: "Taped", type: "chainDamageResist", power: -0.15, duration: 1, replaceSpriteBound: "TapedDoll", tags: ["taped"], aura: "#4fa4b8", replacePower: 1.0,
	events: [
		{type: "ExtendDisabledOrHelpless", trigger: "tick"},
		{type: "RemoveAuraHelpless", trigger: "tick"},
	]
};

let KDGlueVulnLow = {
	id: "GlueVuln", type: "glueDamageResist", power: -0.3, player: true, enemies: true, duration: 1
};
let KDGlueResist = {
	id: "GlueVuln", type: "glueDamageResist", power: 0.5, player: false, enemies: true, duration: 1
};
let KDDollDebuff = {
	id: "DollDebuff", type: "soulDamageResist", power: -0.5, player: false, enemies: true, duration: 2, aura: "#ff8888",
};
let KDDollDebuff2 = {
	id: "DollDebuff2", type: "charmDamageResist", power: -0.5, player: false, enemies: true, duration: 2
};
let KDSlowed = {
	id: "Slowed", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1
};
let KDSlowedSlightly = {
	id: "Slowed", type: "MoveSpeed", power: -.5, player: true, enemies: true, duration: 1
};
let KDKnockbackable = {
	id: "Knockbackable", type: "Knockback", power: 2.0, player: true, enemies: true, duration: 1
};
let KDAttackSlow = {
	id: "AttackSlow", type: "AttackSlow", power: 0.5, player: true, enemies: true, duration: 1
};


let KDAntiMagicMiscast = {id: "AntiMagicMiscast", aura: "#00ffff", type: "Miscast", power: 0.5, player: false, enemies: true,
	duration: 2,};

let KDUnsteady = {id: "Unsteady", aura: "#aa8888", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1,};
let KDUnsteady2 = {id: "Unsteady2", aura: "#aa8888", type: "HeelPower", power: 2.5, player: true, enemies: false, duration: 3,};
let KDUnsteady3 = {id: "Unsteady3", type: "Evasion", power: -0.5, player: true, enemies: false, duration: 3,};

let KDWaterSlow = {id: "WaterSlow", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1,};

let KDNoChill = {id: "ChillWalk", aura: "#73efe8", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
let KDNoChillNoAura = {id: "ChillWalk2", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
function KDChillWalk(entity: entity) {
	return KDEntityHasBuff(entity, "ChillWalk") || KDEntityHasBuff(entity, "ChillWalk2");
}

let KDRestraintDisarmLight = {id: "RestDisarmLight", aura: "#ff5555", type: "DisarmOnAttack", power: 3, player: false, enemies: true, duration: 9999, infinite: true, events: [
	{type: "RemoveRestraint", trigger: "tick"},
	{type: "ApplyDisarm", trigger: "playerAttack"},
]};

let KDRestraintReduceAccuracy = {id: "RestraintAccPen", type: "AccuracyPenalty", power: 0, duration: 2,};

let KDBuffReference = {
	"RestraintDisarmLight": [KDRestraintDisarmLight],
	"Unsteady": [KDUnsteady, KDUnsteady2, KDUnsteady3],
	"Plugged": [KDPlugged],
	"DoublePlugged": [KDDoublePlugged],
	"Chastity": [KDChastity],
	"Vibrate1": [KDVibrate1],
	"Vibrate2": [KDVibrate2],
	"Vibrate3": [KDVibrate3],
};

let KDDisenchantSelf = {id: "DisenchantSelf", aura: "#8888ff", type: "Disenchant", power: 9.9, player: true, enemies: true, duration: 10,};

let KDCustomBuff: Record<string, (entity: entity, buff: any) => void> = {
};

/**
 */
let KDBuffClick: Record<string, (buff: any, entity: entity) => void> = {
	"SlimeMimic": (_buff, entity) => {
		// Toggle SlimeMimic on/off
		let b = KinkyDungeonPlayerBuffs.d_SlimeMimic;
		if (b && b.duration > 0) {
			b.duration = 0;
		} else {
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "d_SlimeMimic", click: "SlimeMimic", type: "d_SlimeMimic", aura: "#ffffff", aurasprite: "Null", duration: 9999, infinite: true, power: 1}
			);
		}
	},
	"OrgasmResist": (_buff, entity) => {
		// Toggle SlimeMimic on/off
		let b = KinkyDungeonPlayerBuffs.d_OrgasmResist;
		if (b && b.duration > 0) {
			b.duration = 0;
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "e_OrgasmResist", click: "OrgasmResist", type: "e_OrgasmResist", buffSprite: true, aura: "#ffffff", aurasprite: "Null", duration: 9999, infinite: true, power: 1}
			);
		} else {
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "d_OrgasmResist", click: "OrgasmResist", type: "d_OrgasmResist", buffSprite: true, aura: "#ffffff", aurasprite: "Null", duration: 9999, infinite: true, power: 1}
			);
			if (KinkyDungeonPlayerBuffs.e_OrgasmResist) KinkyDungeonPlayerBuffs.e_OrgasmResist.duration = 0;
		}
	},
};
