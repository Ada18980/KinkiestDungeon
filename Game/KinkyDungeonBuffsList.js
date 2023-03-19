"use strict";


let KDConduction = {id: "Conduction", type: "event", aura: "#ffff88", noAuraColor: true, aurasprite: "Conduction", power: 7.0, player: true, duration: 5, enemies: true, range: 2.99, events: [
	{type: "RemoveConduction", duration: 1, trigger: "tick"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "playerTakeDamage"},
	{type: "Conduction", power: 0.5, duration: 5, damage: "electric", aoe: 3.99, trigger: "beforeDamageEnemy"},
]};

let KDDrenched = {id: "Drenched", type: "fireDamageResist", aura: "#59a0d1", aurasprite: "Drenched", power: 0.425, player: true, duration: 20, enemies: true, events: [
	{type: "RemoveDrench", duration: 1, trigger: "tick"},
	{type: "ApplyConduction", duration: 1, trigger: "tick", kind: "invis"},
	{type: "ApplyConduction", duration: 1, trigger: "tickAfter", kind: "invis"},
]};

let KDBurning = {id: "Burning", type: "event", aura: "#ff8933", aurasprite: "Flaming", noAuraColor: true, power: 0.5, player: true, duration: 6, enemies: true, events: [
	{type: "RemoveBurning", trigger: "tick"},
	{type: "ElementalEffect", power: 0.5, damage: "fire", trigger: "tick"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "beforeDamageEnemy"},
	{type: "EchoDamage", power: 1.0, damage: "fire", damageTrigger: "stun", trigger: "playerTakeDamage"},
]};

let KDDisenchant1 = {id: "Disenchant1", type: "MoveSpeed", aura: "#440088", power: -0.5, player: false, duration: 9999, enemies: true};
let KDDisenchant2 = {id: "Disenchant2", type: "AttackSlow", aura: "#440088", power: 0.5, player: false, duration: 9999, enemies: true};

let KDVolcanism = {id: "Volcanism", type: "event", aura: "#ff0000", power: 0.5, player: false, duration: 9999, enemies: true, events: [
	{type: "Volcanism", power: 4.0, damage: "fire", trigger: "beforeDamageEnemy"},
]};

let KDDrenched2 = {id: "Drenched2", type: "electricDamageResist", power: -0.2, player: true, duration: 20, enemies: true};
let KDDrenched3 = {id: "Drenched3", type: "iceDamageResist", power: -0.35, player: true, duration: 20, enemies: true};

let KDBoundByFate = {id: "BoundByFate", type: "Fate", power: 1, player: true, duration: 3, enemies: false, aura: "#dddddd", events: [
	{type: "BoundByFate", kind: "mithrilRope", count: 2, trigger: "tick", power: 1},
]};

let KDEager = {
	id: "Eager", type: "MoveSpeed", power: 0.95, duration: 1, events: [
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
	id: "Encased", type: "SlimeProgress", power: 2.0, player: false, enemies: true, duration: 9999, range: 0.5, replaceSprite: "EncasedDoll", tags: ["encased"], events: [
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
let KDEncasedDoll = {
	id: "EncasedDoll", type: "SlimeProgress", power: 2.0, player: false, enemies: true, duration: 9999, range: 0.5, replaceSprite: "EncasedFactoryDoll", tags: ["encased"], events: [
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
	id: "Chastity", type: "Chastity", power: 1.0, aura: "#dddddd", aurasprite: "Chastity", player: false, enemies: true, duration: 9999, range: 0.5, tags: ["chastity"], events: [
		{type: "Distract", power: 0.1, trigger: "tick", prereq: "bound"},
	]
};
let KDVibrate1 = {
	id: "Vibrate1", type: "Vibration", power: 1.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDVibrate2 = {
	id: "Vibrate2", type: "Vibration", power: 1.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDVibrate3 = {
	id: "Vibrate3", type: "Vibration", power: 1.0, aura: "#ffaaaa", duration: 3, tags: ["plugged"], events: [
		{type: "RemoveNoPlug", trigger: "tick"},
	]
};
let KDToy = {
	id: "Toy", type: "Plug", power: 0.1, aura: "#dddddd", aurasprite: "Toy", player: false, enemies: true, duration: 30, range: 0.5, tags: ["toy"]
};
let KDPlugged = {
	id: "Plugged", type: "Plug", power: 1.0, aura: "#dddddd", aurasprite: "Plugged", player: false, enemies: true, duration: 9999, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 2.0, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
	]
};
let KDDoublePlugged = {
	id: "DoublePlugged", type: "Plug", power: 2.0, aura: "#dddddd", aurasprite: "DoublePlugged", player: false, enemies: true, duration: 9998, range: 0.5, tags: ["plugged"], events: [
		{type: "Distract", power: 5.0, trigger: "tick"},
		{type: "RemoveFree", trigger: "tick", prereq: "NoChastity"},
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
let KDAttackSlow = {
	id: "AttackSlow", type: "AttackSlow", power: 0.5, player: true, enemies: true, duration: 1
};
let KDUnsteady = {id: "Unsteady", aura: "#aa8888", type: "MoveSpeed", power: -1.0, player: true, enemies: true, duration: 1,};
let KDUnsteady2 = {id: "Unsteady2", aura: "#aa8888", type: "Armor", power: -1.0, player: true, enemies: false, duration: 3,};
let KDUnsteady3 = {id: "Unsteady3", type: "Evasion", power: -0.5, player: true, enemies: false, duration: 3,};

let KDNoChill = {id: "ChillWalk", aura: "#73efe8", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
let KDNoChillNoAura = {id: "ChillWalk2", type: "ChillWalk", power: -1.0, player: true, enemies: true, duration: 2,};
function KDChillWalk(entity) {
	return KDEntityHasBuff(entity, "ChillWalk") || KDEntityHasBuff(entity, "ChillWalk2");
}

let KDRestraintDisarmLight = {id: "RestDisarmLight", aura: "#ff5555", type: "DisarmOnAttack", power: 3, player: false, enemies: true, duration: 9999, events: [
	{type: "RemoveRestraint", trigger: "tick"},
	{type: "ApplyDisarm", trigger: "playerAttack"},
]};

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