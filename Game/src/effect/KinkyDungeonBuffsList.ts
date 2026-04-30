"use strict";

const KDAim: KDBuff = {
	id: "Aim", replaceSpriteSuff: "_Aim", replacePower: 0.5,
	type: "Aim", power: 1, duration: 3, events: [
		{type: "EnemyAim", trigger: "tickAfter", dist: 2},
		{type: "EnemyAim", sprite: "UI/Crosshair", trigger: "draw"},
	]};
const KDEquip: KDBuff = {
	id: "Equip", replaceSpriteSuff: "_Equip", replacePower: 0.25,
	type: "Equip", power: 1, duration: 3};
const KDAim2: KDBuff = {
	id: "Aim2",
	type: "MoveSpeed", power: -2, duration: 1};
const KDAim3: KDBuff = {
	id: "Aim3",
	type: "AttackSlow", power: 2, duration: 1};

const KDConduction: KDBuff = {id: "Conduction", type: "event", aura: "#ffff88", noAuraColor: true, auraSprite: "Conduction", power: 7.0, player: true, duration: 5, enemies: true, range: 2.99, events: [
	{type: "RemoveConduction", duration: 1, trigger: "tick"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "playerTakeDamage"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "beforeDamageEnemy"},
]};

const KDDrenched: KDBuff = {id: "Drenched", type: "fireDamageResist", aura: "#59a0d1", auraSprite: "Drenched", power: 0.425, player: true, duration: 20, enemies: true, events: [
	{type: "RemoveDrench", duration: 1, trigger: "tick"},
	{type: "Evaporate", mult: 1, trigger: "tick"},
	{type: "ApplyConduction", duration: 1, trigger: "tick", kind: "invis"},
	{type: "ApplyConduction", duration: 1, trigger: "tickAfter", kind: "invis"},
]};


const KDAdrenaline: KDBuff = {
	// Is a hell of a drug
	id: "Adrenaline", type: "VisionRad", power: 0.5, duration: 2, tags: ["adren"],
};

const KDAdrenaline2: KDBuff = {
	// Is a hell of a drug
	id: "Adrenaline2", type: "VisionRad", power: 2, duration: 2,
};

const KDBurning: KDBuff = {id: "Burning", type: "event", aura: "#ff8933", auraSprite: "Flaming", noAuraColor: true, power: 0.5, player: true, duration: 6, enemies: true, events: [
	{type: "RemoveBurning", trigger: "tick"},
	{type: "ElementalEffect", power: 0.5, damage: "fire", trigger: "tick"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "beforeDamageEnemy"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "playerTakeDamage"},
]};

const KDTrainingUnit: KDBuff = {id: "TrainingUnit", type: "TrainingUnit", aura: KDBaseLime, power: -0.5, player: false, duration: 9999, infinite: true, enemies: true,
	events: [
		{type: "TrainingUnit", trigger: "tick"},
		{type: "TrainingUnitReveal", trigger: "tick"},
	],
};

const KDDisenchant1: KDBuff = {id: "Disenchant1", type: "MoveSpeed", aura: "#440088", power: -0.5, player: false, duration: 9999, infinite: true, enemies: true};
const KDDisenchant2: KDBuff = {id: "Disenchant2", type: "AttackSlow", aura: "#440088", power: 0.5, player: false, duration: 9999, infinite: true, enemies: true};

const KDVolcanism: KDBuff = {id: "Volcanism", type: "event", aura: KDBaseRed, power: 0.5, player: false, duration: 9999, infinite: true, enemies: true, events: [
	{type: "Volcanism", power: 4.0, damage: "fire", trigger: "beforeDamageEnemy"},
]};

const KDDrenched2: KDBuff = {id: "Drenched2", type: "electricDamageResist", power: -0.2, player: true, duration: 20, enemies: true,
	events: [
		{type: "Evaporate", mult: 1, trigger: "tick"},
	],
};
const KDDrenched3: KDBuff = {id: "Drenched3", type: "iceDamageResist", power: -0.35, player: true, duration: 20, enemies: true,
	events: [
		{type: "Evaporate", mult: 1, trigger: "tick"},
	],
};

const KDBoundByFate: KDBuff = {id: "BoundByFate", type: "Fate", power: 1, player: true, duration: 3, enemies: false, aura: "#dddddd", events: [
	{type: "BoundByFate", kind: "mithrilRope", count: 2, trigger: "tick", power: 1, damage: "cold"},
]};

const KDTaunted: KDBuff = {id: "Taunted", type: "Taunt", power: 1, player: true, duration: 3, enemies: false, aura: "#dddddd", events: [
	{type: "Taunted", count: 2, trigger: "tick", power: 3, damage: "soul"},
]};

const KDPoisonSleep: KDBuff = {
	id: "poisonSleep", type: "Event", power: 0.1, duration: 10, events: [
		{type: "poisonSleep", trigger: "tick"},
		{type: "poisonSleep", trigger: "expireBuff"},
	], tags: ["poison"]
}

const KDPoisonSleepLong: KDBuff = {
	id: "poisonSleep", type: "Event", power: 0.03, duration: 30, events: [
		{type: "poisonSleep", trigger: "tick"},
		{type: "poisonSleep", trigger: "expireBuff"},
	], tags: ["poison"]
}
const KDArousalOverTime: KDBuff = {
	id: "arousalOverTime", type: "restore_ap", power: 0.5, duration: 30, tags: ["poison"]
}
const KDArousalOverTime2: KDBuff = {
	id: "arousalOverTime2", type: "restore_dp", power: 0.05, duration: 30, tags: ["poison"]
}



const KDEager: KDBuff = {
	id: "Eager", type: "MoveSpeed", power: 0.1, duration: 1, events: [
		{type: "ApplyVuln", duration: 1, trigger: "tick"},
		{type: "ApplyVuln", duration: 1, power: -1.0, trigger: "tickAfter"},
	]
};
const KDMasochist: KDBuff = {
	id: "Masochist", type: "DamageAmp", power: -1, duration: 1
};

const KDChilled: KDBuff = {id: "Chilled", aura: "#73efe8", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 2,};
const KDSlimed: KDBuff = {
	// hideHelpless doesn't seem to be used anymore
	id: "Slimed", aura: "#dc16bc", auraSprite: "Slimed", noAuraColor: true, type: "SlimeProgress", power: 1.0, player: true, enemies: true, duration: 3, range: 0.5, /* hideHelpless: true, */ tags: ["slimed"], events: [
		{type: "RemoveSlimeWalk", duration: 1, trigger: "tick"},
		{type: "Flammable", trigger: "beforeDamageEnemy"},
		{type: "Flammable", trigger: "beforePlayerDamage"},
		{type: "ApplySlowed", duration: 1, power: -1.0, trigger: "tick"},
		{type: "ApplySlowed", duration: 1, power: -1.0, trigger: "tickAfter"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.3, trigger: "tick"},
		{type: "ApplyGlueVuln", duration: 1, power: -0.3, trigger: "tickAfter"},
	]
};
const KDEncased: KDBuff = {
	id: "Encased", type: "SlimeProgress", power: 2.0, player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, replaceSpriteBound: "EncasedFactoryDoll", replacePower: 2.5, replaceSprite: "EncasedDoll", tags: ["encased"], events: [
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
const KDEncasedMetal: KDBuff = {
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
const KDEncasedDoll: KDBuff = {
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
const KDChastity: KDBuff = {
	id: "Chastity", type: "Chastity", power: 1.0, aura: "#dddddd", auraSprite: "Chastity", player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, tags: ["chastity"], events: [
		{type: "Distract", power: 0.01, trigger: "tick", prereq: "bound"},
		{type: "RemoveNoBelt", trigger: "tick"},
		{type: "NoRemoveBelt", trigger: "canNPCRemove", power: 10},
	]
};
const KDVibrate1: KDBuff = {
	id: "Vibrate", type: "Vibration", power: 1.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
const KDVibrate2: KDBuff = {
	id: "Vibrate2", type: "Vibration", power: 2.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
const KDVibrate3: KDBuff = {
	id: "Vibrate3", type: "Vibration", power: 3.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
const KDToySecret: KDBuff = {
	id: "Toy", type: "Plug", power: 0.1, duration: 9999, infinite: true, range: 0.5, tags: ["toy"],
};
const KDToy: KDBuff = {
	id: "Toy", type: "Plug", power: 0.1, aura: "#dddddd", auraSprite: "Toy", player: false, enemies: true, duration: 30, range: 0.5, tags: ["toy"],
	events: [
		{type: "ExtendDisabledOrHelplessOrChastity", trigger: "tick"},
	]
};
const KDPlugged: KDBuff = {
	id: "Plugged", type: "Plug", power: 1.0, aura: "#dddddd", auraSprite: "Plugged", player: false, enemies: true, duration: 9999, infinite: true, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 0.2, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
	]
};
const KDDoublePlugged: KDBuff = {
	id: "DoublePlugged", type: "Plug", power: 2.0, aura: "#dddddd", auraSprite: "DoublePlugged", player: false, enemies: true, duration: 9998, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 0.5, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
	]
};

const KDTaped: KDBuff = {
	id: "Taped", type: "chainDamageResist", power: -0.15, duration: 1, replaceSpriteBound: "TapedDoll", tags: ["taped"], aura: "#4fa4b8", replacePower: 2.0,
	events: [
		{type: "ExtendDisabledOrHelpless", trigger: "tick"},
		{type: "RemoveAuraHelpless", trigger: "tick"},
	]
};

const KDGlueVulnLow: KDBuff = {
	id: "GlueVuln", type: "glueDamageResist", power: -0.3, player: true, enemies: true, duration: 1
};
const KDGlueResist: KDBuff = {
	id: "GlueVuln", type: "glueDamageResist", power: 0.5, player: false, enemies: true, duration: 1
};
const KDDollDebuff: KDBuff = {
	id: "DollDebuff", type: "soulDamageResist", power: -0.5, player: false, enemies: true, duration: 2, aura: KDBasePink,
};
const KDDollDebuff2: KDBuff = {
	id: "DollDebuff2", type: "charmDamageResist", power: -0.5, player: false, enemies: true, duration: 2
};
const KDSlowed: KDBuff = {
	id: "Slowed", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1
};
const KDSlowedSlightly: KDBuff = {
	id: "Slowed", type: "MoveSpeed", power: -.5, player: true, enemies: true, duration: 1
};
const KDKnockbackable: KDBuff = {
	id: "Knockbackable", type: "Knockback", power: 2.0, player: true, enemies: true, duration: 1
};
const KDAttackSlow: KDBuff = {
	id: "AttackSlow", type: "AttackSlow", power: 0.5, player: true, enemies: true, duration: 1
};


const Silenced: KDBuff = {id: "Silenced", aura: KDBaseLightGrey, type: "Miscast", power: 1.0, player: false, enemies: true, buffSprite: true,
	events: [
			{type: "AddMiscast", trigger: "beforeCast", power: 1.0, inheritLinked: true},
	],
	duration: 2,};
const KDAntiMagicMiscast: KDBuff = {id: "AntiMagicMiscast", aura: KDBaseCyan, type: "MiscastChance", power: 0.5, player: false, enemies: true,
	duration: 2,};

const KDUnsteady: KDBuff = {id: "Unsteady", aura: "#aa8888", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1,};
const KDUnsteady2: KDBuff = {id: "Unsteady2", aura: "#aa8888", type: "HeelPower", power: 2.5, player: true, enemies: false, duration: 3,};
const KDUnsteady3: KDBuff = {id: "Unsteady3", type: "Evasion", power: -0.5, player: true, enemies: false, duration: 3,};

const KDWaterSlow: KDBuff = {id: "WaterSlow", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1,};

const KDNoChill: KDBuff = {id: "ChillWalk", aura: "#73efe8", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
const KDNoChillNoAura: KDBuff = {id: "ChillWalk2", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
function KDChillWalk(entity: entity) {
	return KDEntityHasBuff(entity, "ChillWalk") || KDEntityHasBuff(entity, "ChillWalk2");
}

const KDRestraintDisarmLight: KDBuff = {id: "RestDisarmLight", aura: KDBaseRed, type: "DisarmOnAttack", power: 3, player: false, enemies: true, duration: 9999, infinite: true, events: [
	{type: "RemoveRestraint", trigger: "tick"},
	{type: "ApplyDisarm", trigger: "playerAttack"},
]};

const KDRestraintReduceAccuracy: KDBuff = {id: "RestraintAccPen", type: "AccuracyPenalty", power: 0, duration: 2,};

const KDBuffReference: Record<string, KDBuff[]> = {
	"RestraintDisarmLight": [KDRestraintDisarmLight],
	"Unsteady": [KDUnsteady, KDUnsteady2, KDUnsteady3],
	"Plugged": [KDPlugged],
	"DoublePlugged": [KDDoublePlugged],
	"Chastity": [KDChastity],
	"Vibrate1": [KDVibrate1],
	"Vibrate2": [KDVibrate2],
	"Vibrate3": [KDVibrate3],
	"Silenced": [Silenced],
};

const KDDisenchantSelf: KDBuff = {id: "DisenchantSelf", aura: KDBaseLightBlue, type: "Disenchant", power: 9.9, player: true, enemies: true, duration: 10,};

let KDCustomBuff: Record<string, (entity: entity, buff: KDBuff) => void> = {
};

/**
 */
let KDBuffClick: Record<string, (buff: KDBuff, entity: entity, data: any) => void> = {
	"Training": (_buff, entity, data) => {
		KinkyDungeonDrawState = "Progress";
		if (data?.training) {
			KDCurrentProgressMainSelection = "Training" + data.training;
		}
	},
	"SlimeMimic": (_buff, entity) => {
		// Toggle SlimeMimic on/off
		let b = KinkyDungeonPlayerBuffs.d_SlimeMimic;
		if (b && b.duration > 0) {
			b.duration = 0;
		} else {
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "d_SlimeMimic", click: "SlimeMimic", type: "d_SlimeMimic", aura: KDBaseWhite, auraSprite: "Null", duration: 9999, infinite: true, power: 1}
			);
		}
	},
	"OrgasmResist": (_buff, entity) => {
		// Toggle SlimeMimic on/off
		let b = KinkyDungeonPlayerBuffs.d_OrgasmResist;
		if (b && b.duration > 0) {
			b.duration = 0;
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "e_OrgasmResist", click: "OrgasmResist", type: "e_OrgasmResist", buffSprite: true, aura: KDBaseWhite, auraSprite: "Null", duration: 9999, infinite: true, power: 1}
			);
		} else {
			KinkyDungeonApplyBuffToEntity(entity,
				{id: "d_OrgasmResist", click: "OrgasmResist", type: "d_OrgasmResist", buffSprite: true, aura: KDBaseWhite, auraSprite: "Null", duration: 9999, infinite: true, power: 1}
			);
			if (KinkyDungeonPlayerBuffs.e_OrgasmResist) KinkyDungeonPlayerBuffs.e_OrgasmResist.duration = 0;
		}
	},
};
