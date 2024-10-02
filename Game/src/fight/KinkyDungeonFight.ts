"use strict";
let KinkyDungeonKilledEnemy = null;
let KinkyDungeonAlert = 0;

let KDMaxPreviousWeapon = 4;

let KDMINDAMAGENOISE = 2;
let KDDMGSOUNDMULT = 1.5;

let KDBrawlerAmount = 1.0;
let KDClumsyAmount = 0.7;
let KDUnfocusedParams = {
	AmountMin: 0.9,
	AmountMax: 0.6,
	ThreshMin: 0.1,
	ThreshMax: 0.9,
};

interface KDBulletVisual {
	end: boolean,
	temporary: boolean,
	zIndex: number,
	spin: number,
	spinAngle: number,
	name: string,
	size: number,
	spriteID: string,
	xx:number,
	yy:number,
	visual_x: number,
	visual_y: number,
	aoe?: boolean,
	updated: boolean,
	vx: number,
	vy: number,
	scale: number,
	alpha: number,
	delay: number};

let KDDodgeAmount = 0.75;
let KinkyDungeonMissChancePerBlind = 0.1; // Max 3
let KinkyDungeonBlockMissChancePerBlind = 0.1; // Max 3
let KinkyDungeonMissChancePerSlow = 0.1; // Max 3
KDMapData.Bullets = []; // Bullets on the game board
let KinkyDungeonBulletsVisual: Map<string, KDBulletVisual> = new Map(); // Bullet sprites on the game board
let KinkyDungeonBulletsID = {}; // Bullets on the game board

let KDVulnerableDmg = 1.0;
let KDVulnerableHitMult = 2.00;

let KDVulnerableBlockHitMult = 2.0;
let KDPacifistReduction = 0.1;
let KDEnemyResistHPMult = 1.4;
let KDRiggerDmgBoost = 0.2;
let KDRiggerBindBoost = 0.3;
let KDStealthyHPMult = 1.5;
let KDStealthyEvaMult = 0.8;
let KDResilientHPMult = 1.3;
let KDStealthyEnemyCountMult = 1.7;
let KDBoundPowerMult = 0.4;
let KDBerserkerAmp = 0.3;
let KDUnstableAmp = 0.6;

let KDFightParams = {
	KDFreezeMeleeMult: 1.5,
	KDFreezeShatterMult: 2.5,
};

let KinkyDungeonOpenObjects = KinkyDungeonTransparentObjects; // Objects bullets can pass thru
let KinkyDungeonMeleeDamageTypes = ["unarmed", "crush", "slash", "pierce", "grope", "pain", "chain", "tickle"];
let KinkyDungeonTeaseDamageTypes = ["tickle", "charm", "grope", "pain", "plush"];
let KinkyDungeonPacifistDamageTypes = ["tickle", "charm", "grope", "pain", "chain", "glue", "grope", "soul"];
let KinkyDungeonStunDamageTypes = ["fire", "electric", "stun"];
let KinkyDungeonBindDamageTypes = ["chain", "glue", "holy"];
let KinkyDungeonFreezeDamageTypes = ["ice"];
let KinkyDungeonSlowDamageTypes = ["crush", "slash", "pierce", "soap", "frost", "cold", "poison"];
let KinkyDungeonVulnerableDamageTypes = ["tickle", "acid", "magicbind", "estim"];
let KinkyDungeonMeltDamageTypes = ["fire", "holy", "acid"];
let KinkyDungeonShatterDamageTypes = ["crush", "stun", "fire"];
let KinkyDungeonDismantleDamageTypes = ["stun", "fire", ...KinkyDungeonMeleeDamageTypes, "electric", "holy", "acid", "magicbind", "cold", "ice", "soap"];
let KinkyDungeonIgnoreShieldTypes = ["soul", "holy"];
let KinkyDungeonIgnoreBlockTypes = ["soul", "charm", "gas"];

let KDTorchExtinguishTypes = ["ice", "frost", "cold", "soap", "water", "stun", "glue"];
let KDSlimeExtinguishTypes = ["ice", "frost", "cold", "acid", "soap", "water"];
let KDIgnitionSources = ["fire", "electric"];

let KDDamageEquivalencies = {
	"frost": "ice",
	//"happygas": "charm",
	"souldrain": "soul",
	"drain": "soul",
	"shock": "electric",
	"blast": "stun",
	"estim": "electric",
};

let KDDamageBinds = {
	"glue": "Slime",
	"ice": "Ice",
	"frost": "Ice",
	"crush": "Metal",
};
let KDSpellTagBinds = {
	"rope": "Rope",
	"leather": "Leather",
	"chain": "Metal",
	"metal": "Metal",
	"vine": "Vine",
	"nature": "Vine",
};

let KDResistanceProfiles = {
	rope: KDMapInit(["poisonresist", "fireweakness", "slashweakness", "acidweakness", "chainresist", ]),
	construct: KDMapInit(["soulimmune", "charmimmune", "poisonimmune"]),
	catgirl: KDMapInit(["acidweakness", "stunweakness", "coldresist", "plushweakness"]),
	alchemist: KDMapInit(["electricresist", "iceweakness", "glueresist", "acidresist", "gropeweakness"]),
};

/**
 * These also are affected by resistances to the second damage type, but not weaknesses
 * Repeats up to 3 times
 */
let KinkyDungeonDamageTypesExtension = {
	"tickle": "charm",
	"grope": "charm",
	"pain": "charm",
	"happygas": "charm",
	"charm": "soul",
};

let KinkyDungeonBindingDamageTypes = ["chain", "glue", "magicbind"];
let KinkyDungeonDistractDamageTypes = ["tickle", "grope", "happygas", "charm"];
let KinkyDungeonMasochistDamageTypes = ["crush", "pain", "unarmed", "electric", "shock", "fire", "magicbind", "glue", "chain", "souldrain", "drain"];

// Weapons
let KinkyDungeonPlayerWeapon = "";
let KinkyDungeonPlayerWeaponLastEquipped = "";
let KinkyDungeonPlayerDamageDefault: weapon = {name: "", damage: 2, chance: 0.9, type: "unarmed", unarmed: true, rarity: 0, shop: false, sfx: "Unarmed"};
let KinkyDungeonPlayerDamage: weapon = KinkyDungeonPlayerDamageDefault;

let KinkyDungeonDamageTypes = {
	heal: {name: "heal", color: "#88ff88", bg: "black", harmless: true},
	holy: {name: "holy", color: "#ffff88", bg: "black"},
	acid: {name: "acid", color: "#9bd45d", bg: "black"},
	soap: {name: "soap", color: "#44aaff", bg: "black"},
	cold: {name: "cold", color: "#554bd4", bg: "black"},
	arcane: {name: "arcane", color: "#ff5277", bg: "black"},
	ice: {name: "ice", color: "#00D8FF", bg: "black"},
	frost: {name: "ice", color: "#00D8FF", bg: "black"},
	fire: {name: "fire", color: "#FF6A00", bg: "black"},
	poison: {name: "poison", color: "#00D404", bg: "black"},
	happygas: {name: "happygas", color: "#E27CD0", bg: "black"},
	charm: {name: "charm", color: "#E27CD0", bg: "black"},
	soul: {name: "soul", color: "#E27CD0", bg: "black"},
	drain: {name: "soul", color: "#E27CD0", bg: "black"},
	souldrain: {name: "soul", color: "#E27CD0", bg: "black"},
	electric: {name: "electric", color: "#FFD800", bg: "black"},
	estim: {name: "estim", color: "#ff52eb", bg: "black"},
	glue: {name: "glue", color: "#E200D0", bg: "black"},
	stun: {name: "stun", color: "#f4f390", bg: "black"},
	chain: {name: "chain", color: "#ffffff", bg: "black"},
	tickle: {name: "tickle", color: "#72a6b7", bg: "black"},
	plush: {name: "plush", color: "#92c6d7", bg: "black"},
	crush: {name: "crush", color: "#a16640", bg: "black"},
	grope: {name: "grope", color: "#ffabe5", bg: "black"},
	slash: {name: "slash", color: "#a14052", bg: "black"},
	pierce: {name: "pierce", color: "#9c5f7b", bg: "black"},
	pain: {name: "pain", color: "#aa80d1", bg: "black"},
	unarmed: {name: "unarmed", color: "#dcc186", bg: "black"},
	magic: {name: "magic", color: "#00FF90", bg: "black"},
	melee: {name: "melee", color: "#aaaaaa", bg: "black"},
	spell: {name: "spell", color: "#00FF90", bg: "black"},
};

/**
 * @param item
 */
function KDWeapon(item: Named): weapon {
	if (!item) return null;
	return KinkyDungeonWeapons[KinkyDungeonWeaponVariants[item.name]?.template || item.name];
}


function KinkyDungeonFindWeapon(Name: string) {
	for (let con of Object.values(KinkyDungeonWeapons)) {
		if (con.name == Name) return con;
	}
	return undefined;
}

function KinkyDungeonWeaponCanCut(RequireInteract: boolean, MagicOnly?: boolean): boolean {
	if (KinkyDungeonPlayerWeapon
		&& KDWeapon({name: KinkyDungeonPlayerWeapon})?.cutBonus != undefined
		&& (!MagicOnly || KDWeaponIsMagic({name: KinkyDungeonPlayerWeapon}))
		&& (!RequireInteract || !KinkyDungeonIsHandsBound(false, false, 0.55))) return true;
	if (KinkyDungeonPlayerBuffs) {
		for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
			if (b && b.tags && (b.tags.includes("allowCutMagic") || (!MagicOnly && b.tags.includes("allowCut")))) return true;
		}
	}
	return false;
}

/**
 * We reset the pity timer on weapon switch to prevent issues
 * @param Weapon
 * @param [forced]
 */
function KDSetWeapon(Weapon: string, forced?: boolean) {
	if (!Weapon) Weapon = 'Unarmed';
	KinkyDungeonEvasionPityModifier = 0;
	KinkyDungeonPlayerWeapon = Weapon;
	if (!forced)
		KinkyDungeonPlayerWeaponLastEquipped = Weapon;
}

/*
function KDCanWieldWeapon(weapon, HandsFree, NoOverride) {
	let flags = {
		KDDamageHands: true.valueOf,
		KDDamageArms: true.valueOf,
	};
	if (!NoOverride)
		KinkyDungeonSendEvent("calcDamage", {flags: flags});
	if (weapon && weapon.noHands) HandsFree = true;
	let armBondage = KinkyDungeonIsArmsBound(false, true);
	if (!HandsFree
		|| (KinkyDungeonStatsChoice.get("Brawler") && !KinkyDungeonPlayerWeapon)
		|| (weapon.clumsy && flags.KDDamageArms && armBondage)) {
		return false;
	}
	return true;
}*/

function KinkyDungeonGetPlayerWeaponDamage(HandsFree?: boolean, NoOverride?: boolean): weapon {
	let flags = {
		KDDamageHands: true.valueOf,
		KDDamageArms: true.valueOf,
	};
	let damage = KinkyDungeonPlayerDamageDefault;
	let weapon = KDWeapon({name: KinkyDungeonPlayerWeapon});
	if (weapon && weapon?.noHands) HandsFree = true;

	let data = {flags: flags, accuracyMult: 1.0, damageMult: 1.0, weapon: weapon, HandsFree: HandsFree,
		canUse: KinkyDungeonCanUseWeapon(NoOverride, undefined, weapon),
		forceUse: false, // Set this to true if you want to disable accuracy penalty from Telekinesis 101
		handBondage:  KDHandBondageTotal(true),
		armBondage : KinkyDungeonIsArmsBound(false, true),
		legBondage: !KDGetAvailablePosesLegs(KinkyDungeonPlayer, undefined, true)
			.includes("Spread"),
		brawler: KinkyDungeonStatsChoice.get("Brawler"),
	};

	if (!NoOverride)
		KinkyDungeonSendEvent("calcDamage", data);

	if (!NoOverride)
		KinkyDungeonSendEvent("calcDamage2", data);

	if (!data.canUse && !weapon?.unarmed) {
		damage = KinkyDungeonPlayerDamageDefault;
		if (!NoOverride) {
			if (weapon && KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon))
				KinkyDungeonSendTextMessage(10, TextGet("KDCantWield").replace("WPN", KDGetItemName(KinkyDungeonInventoryGetWeapon(KinkyDungeonPlayerWeapon))),
					"#ff5555", 1, false, true, undefined, "Action");
			KDSetWeapon('Unarmed', true);
		}
	} else if (KinkyDungeonPlayerWeapon && weapon) {
		damage = weapon;
	}


	KinkyDungeonPlayerDamage = JSON.parse(JSON.stringify(damage));
	if (KinkyDungeonWeaponVariants[KinkyDungeonPlayerWeapon]) {
		if (!KinkyDungeonPlayerDamage.events) KinkyDungeonPlayerDamage.events = [];
		KinkyDungeonPlayerDamage.events.push(...KinkyDungeonWeaponVariants[KinkyDungeonPlayerWeapon].events);
	}



	if (KinkyDungeonStatsChoice.get("Brawler") && isUnarmed(KinkyDungeonPlayerDamage)) {
		KinkyDungeonPlayerDamage.damage += KDBrawlerAmount;
	}


	if (((KDForcedToGround() || data.legBondage || KinkyDungeonSlowLevel > 1) && data.armBondage)
		&& (flags.KDDamageHands || weapon?.unarmed) && (!weapon || !weapon.noHands || weapon.unarmed)) {
		// Total helplessness
		KinkyDungeonPlayerDamage.chance *= (KDForcedToGround() || data.legBondage) ? 0.5
			: Math.max(0.5, Math.min(1.0, 1.25 - 0.25 * KinkyDungeonSlowLevel));

		if ((!data.brawler || !weapon?.unarmed) && !KDWeaponNoDamagePenalty(KinkyDungeonPlayerDamage))
			KinkyDungeonPlayerDamage.damage *= KDIsHogtied() ? 0.01 : 0.5;
	}

	if (data.legBondage || !data.brawler || !isUnarmed(KinkyDungeonPlayerDamage)) {
		if (data.armBondage && (flags.KDDamageArms || isUnarmed(KinkyDungeonPlayerDamage))
			&& (!weapon?.noHands)) {
			KinkyDungeonPlayerDamage.chance *= KDIsHogtied(KinkyDungeonPlayer) ? 0.1 : 0.5;
			if ((!data.brawler || !isUnarmed(KinkyDungeonPlayerDamage))
				&& !KDWeaponNoDamagePenalty(KinkyDungeonPlayerDamage))
				KinkyDungeonPlayerDamage.damage /= 2;
		} else if (data.handBondage && (flags.KDDamageHands || isUnarmed(KinkyDungeonPlayerDamage))
			&& (!weapon || !weapon.noHands || (!data.brawler && isUnarmed(KinkyDungeonPlayerDamage)))) {
			KinkyDungeonPlayerDamage.chance *= 0.5 + Math.max(0, 0.5 * Math.min(1, data.handBondage));
			if ((!data.brawler || !isUnarmed(KinkyDungeonPlayerDamage))
				&& !KDWeaponNoDamagePenalty(KinkyDungeonPlayerDamage))
				KinkyDungeonPlayerDamage.damage *= 0.5 + Math.max(0, 0.5 * Math.min(1, data.handBondage));
		}
		if (KinkyDungeonSlowLevel > 1) {
			if (!data.brawler && !isUnarmed(KinkyDungeonPlayerDamage))
				KinkyDungeonPlayerDamage.damage *= Math.max(0.5, Math.min(1.0, 1.25 - 0.25 * KinkyDungeonSlowLevel));
		}
	}

	KinkyDungeonPlayerDamage.chance *= data.accuracyMult;
	KinkyDungeonPlayerDamage.damage *= data.damageMult;
	return KinkyDungeonPlayerDamage;
}
/**
 * @param weapon
 * @returns true if the weapon represents Unarmed
 */
function isUnarmed(weapon: weapon): boolean {
	return !weapon || !weapon.name || weapon.name == "Unarmed" || weapon.unarmed;
}


let KinkyDungeonEvasionPityModifier = 0; // Current value
let KinkyDungeonEvasionPityModifierIncrementPercentage = 0.5; // Percent of the base hit chance to add
let KDDefaultCrit = 1.3;
let KDDefaultBindCrit = 1.5;

function KinkyDungeonGetCrit(accuracy?: number, Damage?: damageInfo, Enemy?: entity) {
	if (accuracy == undefined) accuracy = KinkyDungeonGetEvasion();
	let data = {
		Damage: Damage,
		accuracy: accuracy,
		enemy: Enemy,
		basecrit: Damage?.crit || KDDefaultCrit,
		critmult: 1.0 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerEntity, "CritMult"),
		critboost: 0.0 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerEntity, "CritBoost"),
	};
	KinkyDungeonSendEvent("calcCrit", data);

	return (data.basecrit + data.critboost) * data.critmult;
}
function KinkyDungeonGetBindCrit(accuracy?: number, Damage?: damageInfo, Enemy?: entity) {
	if (accuracy == undefined) accuracy = KinkyDungeonGetEvasion();
	let data = {
		Damage: Damage,
		accuracy: accuracy,
		enemy: Enemy,
		basecrit: Damage?.bindcrit || KDDefaultBindCrit,
		critmult: 1.0,
		critboost: 0.0,
	};
	KinkyDungeonSendEvent("calcBindCrit", data);

	return (data.basecrit + data.critboost) * data.critmult;
}

function KDGetSpellAccuracy() {
	let data = {
		accuracy: KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Accuracy")),
		accuracyBonus: 0,
		accuracyMult: 1,
	};
	KinkyDungeonSendEvent("calcSpellAccuracy", data);
	return (data.accuracy + data.accuracyBonus) * data.accuracyMult;
}

function KDGetSlowMult(Enemy: entity): number {
	let mult = 1;

	if (Enemy && Enemy.bind > 0) mult *= 2;
	else if (Enemy && Enemy.slow > 0) mult *= 1.4;

	if (Enemy && KinkyDungeonIsStunned(Enemy)) mult *= 5;
	else {
		if (Enemy && Enemy.distraction > 0) mult *= 1 + 2 * Math.min(1, Enemy.distraction / Enemy.Enemy.maxhp);
		if (Enemy) mult *= 1 + 0.125 * KDBoundEffects(Enemy);
	}

	return mult;
}

function KinkyDungeonGetEvasion(Enemy?: entity, NoOverride?: boolean, IsSpell?: boolean, IsMagic?: boolean, cost?: boolean): number {
	let flags = {
		KDEvasionHands: true,
		KDEvasionSight: true,
		KDEvasionDeaf: true,
		KDEvasionSlow: true,
	};
	let data = {enemy: Enemy,
		isSpell: IsSpell,
		isMagic: IsMagic,
		flags: flags,
		cost: cost,
		hitmult: 1.0,
	};

	if (!NoOverride)
		KinkyDungeonSendEvent("calcEvasion", data);
	let hitChance = (Enemy && Enemy.buffs) ? KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(Enemy.buffs, "Evasion")) : 1.0;
	hitChance *= data.hitmult;

	if (KinkyDungeonStatsChoice.get("Clumsy")) hitChance *= KDClumsyAmount;
	if (KinkyDungeonStatsChoice.get("Unfocused")) {
		let amount = 1;
		let dist = KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax;
		if (dist >= KDUnfocusedParams.ThreshMin) {
			amount = KDUnfocusedParams.AmountMin + (KDUnfocusedParams.AmountMax - KDUnfocusedParams.AmountMin) * (dist - KDUnfocusedParams.ThreshMin) / (KDUnfocusedParams.ThreshMax - KDUnfocusedParams.ThreshMin);
		}
		if (amount != 1) hitChance *= amount;
	}

	if (Enemy && Enemy.Enemy && Enemy.Enemy.evasion && ((!(Enemy.stun > 0) && !(Enemy.freeze > 0)) || Enemy.Enemy.alwaysEvade || Enemy.Enemy.evasion < 0)) hitChance *= Math.max(0,
		(Enemy.aware ? KinkyDungeonMultiplicativeStat(Enemy.Enemy.evasion) : Math.max(1, KinkyDungeonMultiplicativeStat(Enemy.Enemy.evasion))));
	if (Enemy && Enemy.Enemy && Enemy.Enemy.tags.ghost && (IsMagic || (KinkyDungeonPlayerDamage && KDWeaponIsMagic({name: KinkyDungeonPlayerWeapon})))) hitChance = Math.max(hitChance, 1.0);
	if (Enemy && Enemy.Enemy && Enemy.Enemy.Resistance?.alwaysHitByMagic && (IsMagic || (KinkyDungeonPlayerDamage && KDWeaponIsMagic({name: KinkyDungeonPlayerWeapon})))) hitChance = Math.max(hitChance, 1.0);

	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Accuracy")) {
		hitChance *= KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Accuracy"));
	}

	if (!IsSpell) hitChance *= KinkyDungeonPlayerDamage.chance;
	let slowMult = KDGetSlowMult(Enemy);
	hitChance *= slowMult;
	if (Enemy && Enemy.vulnerable) hitChance *= KDVulnerableHitMult;

	if (!IsSpell) {
		if (flags.KDEvasionSight)
			hitChance = Math.min(hitChance, Math.max(0.1, hitChance - Math.min(3, KinkyDungeonBlindLevel) * KinkyDungeonMissChancePerBlind));
		if (flags.KDEvasionSlow && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.name && KinkyDungeonSlowLevel > 0) hitChance *= 1.0 - Math.max(0.5, KinkyDungeonMissChancePerSlow * KinkyDungeonSlowLevel);
	}
	return hitChance;
}


function KinkyDungeonAggro(Enemy: entity, Spell: spell, Attacker: entity, Faction?: string) {
	if (Enemy?.Enemy
		&& (!Spell || !Spell.enemySpell)
		&& (!Spell || !Spell.noAggro)
		&& (!Faction || Faction == "Player")
		&& !(Enemy.rage > 0)
		&& (!Attacker || Attacker.player || Attacker.Enemy.allied)) {
		if (Enemy.playWithPlayer && (KDCanDom(Enemy) || !KDHostile(Enemy))) {
			KDAddThought(Enemy.id, "Embarrassed", 5, 1);
			Enemy.distraction = (Enemy.distraction || 0) + Enemy.Enemy.maxhp * 0.1;
			if (KDCanDom(Enemy)) {
				if (!KDEntityHasFlag(Enemy, "playOpin")) {
					KDAddOpinionPersistent(Enemy.id, 1);
					KinkyDungeonSetEnemyFlag(Enemy, "playOpin", -1);
				}
			}
		} else {
			KinkyDungeonApplyBuffToEntity(Enemy, KDAdrenaline, {
				duration: 4,
				power: 0.8,
			});
			KinkyDungeonApplyBuffToEntity(Enemy, KDAdrenaline2, {
				duration: 2,
				power: 0.5,
			});
			if (Enemy && !Enemy.Enemy.allied) {
				if (Enemy.vp) Enemy.vp = Math.min(2, Enemy.vp*2);
				KinkyDungeonSetFlag("PlayerCombat", 8);
				if (!Enemy.hostile) {
					KDAddOpinionPersistent(Enemy.id, -10);
				}
				KinkyDungeonAggroAction('attack', {enemy: Enemy});
			}
		}
	}
}

function KDPlayerEvasionPenalty() {
	if (KinkyDungeonFlags.get("ZeroResistance")) return 1000;
	let evasionPenalty = .25 * KinkyDungeonSlowLevel;
	if (KinkyDungeonStatBlind > 0) evasionPenalty += 0.5;
	if (KDGameData.MovePoints < 0) evasionPenalty += 0.5;
	if (KinkyDungeonStatFreeze) evasionPenalty += 1;

	evasionPenalty += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "EvasionPenalty");

	return evasionPenalty;
}
function KDPlayerBlockPenalty() {
	if (KinkyDungeonFlags.get("ZeroResistance")) return 1000;
	let blockPenalty = Math.min(0.5, .1 * KinkyDungeonBlindLevel);

	if (KinkyDungeonIsArmsBound(false, true)) blockPenalty = blockPenalty + (1 - blockPenalty) * 0.7;
	if (KinkyDungeonStatFreeze) blockPenalty += 1;
	if (KinkyDungeonStatBlind) blockPenalty += 0.5;

	blockPenalty += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BlockPenalty");


	return Math.min(1, blockPenalty);
}
function KDRestraintBlockPenalty() {
	if (KinkyDungeonFlags.get("ZeroResistance")) return 1000;
	let RestraintBlockPenalty = .1 * KinkyDungeonSlowLevel;
	if (KinkyDungeonIsArmsBound(false, true)) RestraintBlockPenalty += .25;
	if (KinkyDungeonStatFreeze) RestraintBlockPenalty += 0.8;
	if (KinkyDungeonStatBlind) RestraintBlockPenalty += 0.4;

	RestraintBlockPenalty += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RestraintBlockPenalty");


	return RestraintBlockPenalty;
}

function KDCalcRestraintBlock() {
	let RestraintBlock = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RestraintBlock");
	let RestraintBlockPenalty = KDRestraintBlockPenalty();
	let val = RestraintBlock * Math.max(0, 1 - RestraintBlockPenalty)
		+ KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "RestraintBlockProtected");

	return val;
}

function KinkyDungeonPlayerEvasion(Event?: boolean): number {
	let data = {
		playerEvasionMult: 1.0,
		penalty: KDPlayerEvasionPenalty(),
		eva: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion"),
		evaPenalty: 0,
		val: 0
	};

	data.evaPenalty = data.eva > 0 ? Math.min(1, data.penalty) : 0;


	KinkyDungeonSendEvent(Event ? "beforecalcPlayerEvasionEvent" : "beforecalcPlayerEvasion", data);
	data.val = data.playerEvasionMult * KinkyDungeonMultiplicativeStat(data.eva * (1 - data.evaPenalty) / Math.max(1, data.penalty)
	+ KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "EvasionProtected"));

	KinkyDungeonSendEvent(Event ? "calcPlayerEvasionEvent" : "calcPlayerEvasion", data);

	return data.val;
}

function KinkyDungeonPlayerBlock(_Event?: boolean): number {
	let playerBlockMult = 1.0;
	let blk = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Block");
	let playerBlockPenalty = blk > 0 ? Math.min(1, KDPlayerBlockPenalty()) : 0;
	let val = playerBlockMult * KinkyDungeonMultiplicativeStat(blk * (1 - playerBlockPenalty)
		+ KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BlockProtected"));

	return val;
}

function KinkyDungeonPlayerBlockLinear() {
	let playerBlockMult = 1.0;
	let blk = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Block");
	let playerBlockPenalty = blk > 0 ? Math.min(1, KDPlayerBlockPenalty()) : 0;
	let val = playerBlockMult * (blk * (1 - playerBlockPenalty)
		+ KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BlockProtected"));

	return val;
}

function KinkyDungeonGetPlayerStat(stat: any, mult?: number) {
	let data = {
		mult: mult,
		stat: !mult ? KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat) : KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat)),
	};
	KinkyDungeonSendEvent("calcPlayer" + stat, data);

	return data.stat;
}

function KDRestraintBlockPower(block: any, power: number): number {
	return KinkyDungeonMultiplicativeStat(block / Math.max(1, power));
}

function KinkyDungeonEvasion(Enemy: entity, IsSpell?: boolean, IsMagic?: boolean, Attacker?: entity, chance?: number) {


	let hitChance = chance != undefined ? chance : KinkyDungeonGetEvasion(Enemy, undefined, IsSpell, IsMagic, true);

	if (KDHostile(Enemy) && KinkyDungeonStatsChoice.get("Stealthy")) {
		hitChance *= KDStealthyEvaMult;
	}

	if (!Enemy) KinkyDungeonSleepTime = 0;

	let dodged = false;
	if (hitChance > 0) {
		if ((Enemy.lifetime > 9000 || !Enemy.maxlifetime)) KinkyDungeonAggro(Enemy, undefined, Attacker);
		// Smart enemies wont even try if they cant dodge it. Dumb enemies will
		if (Enemy.dodges >= 1 && (Enemy.dodges >= hitChance || KDRandom() < 1 - 0.2 * KDEnemyRank(Enemy))) {
			if (Enemy?.Enemy.preferDodge || Enemy.hp < 0.5 * Enemy.Enemy.maxhp || ((!Enemy.blocks || Enemy.blocks < 1 || !KDCanBlock(Enemy)) && Enemy.hp < 0.65 * Enemy.Enemy.maxhp) || ((Enemy.hp < 0.9 * Enemy.Enemy.maxhp ? true : KDRandom() < 0.33))) {
				while (Enemy?.dodges >= 1 && KDCanDodge(Enemy) && hitChance > 0) {
					hitChance -= 1;
					// The way this works:
					// Positive accuracy has higher hitchance, so it requires more dodges
					// Negative accuracy has a chance to not consume the dodge token
					if (hitChance >= 0 || KDRandom() > -hitChance)
						Enemy.dodges = Math.max(0, Enemy.dodges - 1);
					Enemy.blockedordodged = (Enemy.blockedordodged || 0) + 1;
					dodged = true;
				}
			}
		}


		if (dodged) {
			let point = KinkyDungeonGetNearbyPoint(Enemy.x, Enemy.y, true, undefined, true, true, (x, y) => {return x != Enemy.x && y != Enemy.y;});
			if (point) {
				KDMoveEntity(Enemy, point.x, point.y, true, true, true, false);
				Enemy.movePoints = 0;
				if (!Enemy.Enemy.attackWhileMoving) {
					Enemy.attackPoints = 0;
					Enemy.warningTiles = [];
				}
			}
		}
	}

	if (!dodged && hitChance > 0.6) return true;


	if (KDRandom() < hitChance + KinkyDungeonEvasionPityModifier) {
		KinkyDungeonEvasionPityModifier = 0; // Reset the pity timer
		return true;
	}

	if (Enemy) {
		// Increment the pity timer
		KinkyDungeonEvasionPityModifier += KinkyDungeonEvasionPityModifierIncrementPercentage * hitChance;
	}

	return false;
}


/**
 *
 * @param {Record<string, boolean>} tags
 * @param {string[] | undefined} profile
 * @param {string} type
 * @param {string} resist
 * @param {number} mode - 0 = either, 1 = specific, 2 = general
 * @returns {boolean}
 */
function KinkyDungeonGetImmunity(tags, profile, type, resist, mode = 0) {
	let t = type;
	if (KDDamageEquivalencies[type]) t = KDDamageEquivalencies[type];

	for (let i = 0; i < 10 && KinkyDungeonDamageTypesExtension[t]; i++) {
		if (KinkyDungeonDamageTypesExtension[t] && resist != "weakness" && resist != "severeweakness") t = KinkyDungeonDamageTypesExtension[t];
	}
	if (!mode || mode == 1) {
		if (tags && tags[t + resist])
			return true;
		if (profile) {
			for (let pp of profile) {
				let p = KDResistanceProfiles[pp];
				if (p && (p[t + resist]))
					return true;
			}
		}
	}
	if (!mode || mode == 2) {
		if (tags && (((KinkyDungeonMeleeDamageTypes.includes(t) && (type != "unarmed" || !resist.includes("weakness"))) && tags["melee" + resist])
			|| (!KinkyDungeonMeleeDamageTypes.includes(t) && tags["magic"+resist])))
			return true;
		if (profile) {
			for (let pp of profile) {
				let p = KDResistanceProfiles[pp];
				if (p && (((KinkyDungeonMeleeDamageTypes.includes(t) && (type != "unarmed" || !resist.includes("weakness"))) && p["melee" + resist])
					|| (!KinkyDungeonMeleeDamageTypes.includes(t) && p["magic"+resist])))
					return true;
			}
		}
	}

	return false;
}

let KDDamageQueue = [];

function KDArmorFormula(DamageAmount: number, Armor: number): number {
	if (DamageAmount <= 0) return 1;
	if (Armor < 0) return Math.min(3, (DamageAmount - Armor) / DamageAmount);
	return DamageAmount / (DamageAmount + Armor);
}


/**
 * @param Enemy
 * @param Damage
 * @param Ranged
 * @param NoMsg
 * @param [Spell]
 * @param [bullet]
 * @param [attacker]
 * @param [Delay]
 * @param [noAlreadyHit]
 * @param [noVuln]
 * @param [Critical]
 * @param [Attack]
 */
function KinkyDungeonDamageEnemy(Enemy: entity, Damage: damageInfo, Ranged: boolean, NoMsg: boolean, Spell?: any, bullet?: any, attacker?: entity, Delay?: any, noAlreadyHit?: boolean, noVuln?: boolean, Critical?: any, Attack?: boolean): number {
	if (bullet && !noAlreadyHit) {
		if (!bullet.alreadyHit) bullet.alreadyHit = [];
		// A bullet can only damage an enemy once per turn
		if (bullet.alreadyHit.includes(Enemy.id)) return 0;
		bullet.alreadyHit.push(Enemy.id);
	}

	let predata = {
		allowConjuredRestraint: !!Damage?.addBind,
		useRealRestraint: Damage?.realBind,
		shieldBlocked: false,
		aggro: false,
		faction: "Enemy",
		enemy: Enemy,
		spell: Spell,
		bullet: bullet,
		attacker: attacker,
		nocrit: Spell?.nocrit || Enemy?.Enemy.tags?.nocrit || Damage?.nocrit,
		crit: KDDefaultCrit,
		bindcrit: KDDefaultBindCrit,
		type: (Damage) ? Damage.type : "stun",
		bufftype: (Damage) ? Damage.type : 0,
		time: (Damage) ? Damage.time : 0,
		dmg: (Damage) ? Damage.damage : 0,
		bind: (Damage) ? Damage.bind : 0,
		bindType: (Damage) ? Damage.bindType : "Leather",
		flags: (Damage) ? Damage.flags : undefined,
		boundBonus: (Damage) ? Damage.boundBonus : 0,
		bindEff: (Damage) ? (Damage.bindEff || 1) : 1,
		distract: (Damage) ? Damage.distract : 0,
		distractEff: (Damage) ? Damage.distractEff : 0,
		desireMult: (Damage) ? Damage.desireMult : 0,
		incomingDamage: Damage,
		dmgDealt: 0,
		dmgShieldDealt: 0,
		freezebroke: false,
		froze: 0,
		vulnerable: (Enemy.vulnerable || (KDHostile(Enemy) && !Enemy.aware)) && Damage && !Damage.novulnerable && (!Enemy.Enemy.tags || !Enemy.Enemy.tags.nonvulnerable),
		vulnConsumed: false,
		critical: Critical,
		forceCrit: false,
		customCrit: false,
		noblock: !Damage || Damage.noblock,
		blocked: false,
		Delay: Delay,
		ignoreshield: (Damage?.ignoreshield != undefined) ? Damage.ignoreshield : KinkyDungeonIgnoreShieldTypes.includes(Damage?.type || ""),
		shield_crit: Damage?.shield_crit, // Crit thru shield
		shield_stun: Damage?.shield_stun, // stun thru shield
		shield_freeze: Damage?.shield_freeze, // freeze thru shield
		shield_bind: Damage?.shield_bind, // bind thru shield
		shield_snare: Damage?.shield_snare, // snare thru shield
		shield_slow: Damage?.shield_slow, // slow thru shield
		shield_distract: Damage?.shield_distract, // Distract thru shield
		shield_vuln: Damage?.shield_vuln, // Vuln thru shield
		tease: Damage?.tease,
		stunResist: 0,
		distractMult: undefined,
	};

	if (KDDamageEquivalencies[predata.type]) predata.bufftype = KDDamageEquivalencies[predata.type];

	if (attacker) {
		if (attacker.player) predata.faction = "Player";
		else if (attacker.Enemy) predata.faction = KDGetFaction(attacker);
	} else if (bullet) {
		if (bullet.bullet.faction) predata.faction = bullet.bullet.faction;
		else if (bullet.bullet.spell && bullet.bullet.spell.enemySpell) predata.faction = "Enemy";
		else predata.faction = "Player";
	} else if (Spell) {
		if (Spell.enemySpell) predata.faction = "Enemy";
		else predata.faction = "Player";
	}

	KinkyDungeonSendEvent("beforeCrit", predata);

	// Only player can crit on spells

	if (!predata.blocked)
		if (!Enemy.shield || predata.ignoreshield || predata.shield_crit)
			if (!predata.nocrit && (predata.faction == "Player" || predata.forceCrit) && predata.type != 'heal') {
				if ((predata.vulnerable && (predata.dmg > 0.5 || predata.bind > 1)) || predata.forceCrit) {
					predata.crit = KinkyDungeonGetCrit(KDGetSpellAccuracy(), Damage, Enemy) || KDDefaultCrit;
					if (KDToughArmor(Enemy) && predata.crit > 1) predata.crit = 1 + (predata.crit - 1)*0.5; // TOUGH armor
					predata.bindcrit = KinkyDungeonGetBindCrit(KDGetSpellAccuracy(), Damage, Enemy) || KDDefaultBindCrit;

					predata.critical = true;
					if (!predata.forceCrit && (predata.dmg > 0 || predata.bind > 0)) {
						predata.vulnConsumed = true;
					}

					KinkyDungeonSendEvent("duringCrit", predata);
					let dmgBonus = predata.dmg * (predata.crit - 1);
					predata.dmg = Math.max(0, predata.dmg + dmgBonus);
					predata.bindEff *= predata.bindcrit;
					if (!NoMsg)
						KinkyDungeonSendTextMessage(4, TextGet((Enemy.vulnerable || Enemy.distraction > Enemy.Enemy.maxhp) ? "KinkyDungeonVulnerable" : "KinkyDungeonUnseen")
							.replace("AMOUNT", "" + Math.round(10 * dmgBonus))
							.replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), "lightgreen", 2,
						undefined, undefined, undefined, "Combat");



					KinkyDungeonSendEvent("afterCrit", predata);

					if (predata.critical && Enemy.buffs) KinkyDungeonTickBuffTag(Enemy, "crit");
				}
			}

	KinkyDungeonSendEvent("beforeDamageEnemy", predata);

	if (!predata.dmg) predata.dmg = 0;
	//let type = (Damage) ? Damage.type : "";
	let effect = false;
	let resistStun = 0;
	let resistSlow = 0;
	let resistDamage = 0;
	let spellResist = (Damage && Enemy.Enemy.spellResist && !KinkyDungeonMeleeDamageTypes.includes(predata.type)) ? Enemy.Enemy.spellResist : 0;
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResist")) spellResist += KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResist");
	let armor = (Damage && Enemy.Enemy.armor && KinkyDungeonMeleeDamageTypes.includes(predata.type)) ? Enemy.Enemy.armor : 0;
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "Armor")) armor += KinkyDungeonGetBuffedStat(Enemy.buffs, "Armor");

	predata.stunResist += KinkyDungeonGetBuffedStat(Enemy.buffs, "StunResist");

	if (!predata.critical && !KinkyDungeonIsDisabled(Enemy)) {
		let block_phys = (Enemy.Enemy.Resistance?.block_phys || 0) + KinkyDungeonGetBuffedStat(Enemy.buffs, "BlockPhys");
		let block_magic = (Enemy.Enemy.Resistance?.block_magic || 0) + KinkyDungeonGetBuffedStat(Enemy.buffs, "BlockMagic");
		if (block_phys) armor += block_phys;
		if (block_magic) spellResist += block_magic;
	}


	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "ArmorBreak")) armor -= Math.min(Math.max(0, armor), KinkyDungeonGetBuffedStat(Enemy.buffs, "ArmorBreak"));
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResistBreak")) spellResist -= Math.min(Math.max(0, spellResist), KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResistBreak"));

	if (Enemy.freeze > 0 && Damage && KinkyDungeonShatterDamageTypes.includes(predata.type)) {
		predata.dmg *= KDFightParams.KDFreezeShatterMult;
	} else if (Enemy.freeze > 0 && Damage && KinkyDungeonMeleeDamageTypes.includes(predata.type)) {
		predata.dmg *= KDFightParams.KDFreezeMeleeMult;
	}


	let miss = !(!Damage || !Damage.evadeable || KinkyDungeonEvasion(Enemy, (true && Spell), !KinkyDungeonMeleeDamageTypes.includes(predata.type), attacker));
	if (Damage && !miss) {
		if (predata.faction == "Player") {
			if (!predata.tease && KinkyDungeonStatsChoice.get("Pacifist") && Enemy.Enemy.bound && !Enemy.Enemy.nonHumanoid && !KinkyDungeonPacifistDamageTypes.includes(predata.type)) {
				predata.dmg *= KDPacifistReduction;
			}
			if (KinkyDungeonStatsChoice.get("EnemyArmor")) {
				armor += KDPerkParams.KDEnemyArmorBoost;
				spellResist += KDPerkParams.KDEnemyArmorBoost;
			}
		}
		KDUpdatePerksBonus();
		let DamageAmpBonusPerks = KDDamageAmpPerks
			+ (KinkyDungeonMeleeDamageTypes.includes(predata.type) ? KDDamageAmpPerksMelee : KDDamageAmpPerksMagic)
			+ (Spell && !Spell.allySpell && !Spell.enemySpell ? KDDamageAmpPerksSpell : 0);
		let damageAmp = KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(Enemy.buffs, "DamageAmp") - (KDHostile(Enemy) && (!attacker || attacker.player) ? (DamageAmpBonusPerks) : 0));
		let buffreduction = KinkyDungeonGetBuffedStat(Enemy.buffs, "DamageReduction");
		let buffresist = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(Enemy.buffs, predata.bufftype + "DamageResist"));
		buffresist *= KinkyDungeonMeleeDamageTypes.includes(predata.type) ?
			KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(Enemy.buffs, "meleeDamageResist"))
			: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(Enemy.buffs, "magicDamageResist"));
		let buffType = predata.bufftype + "DamageBuff";
		let buffAmount = 1 + (KDHostile(Enemy) ? KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, buffType) : 0);
		predata.dmg *= buffAmount;
		predata.dmg *= buffresist;

		if (KinkyDungeonMeltDamageTypes.includes(predata.type) && Enemy.freeze > 0) {
			predata.dmg *= 1.4;
		}

		if (damageAmp) predata.dmg *= damageAmp;



		if (Enemy.Enemy.tags) {
			if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "severeweakness", 1)) resistDamage = -2;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "weakness", 1)) resistDamage = -1;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "resist", 1)) resistDamage = 1;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "immune", 1)) resistDamage = 2;

			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "severeweakness", 2)) resistDamage = -2;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "weakness", 2)) resistDamage = -1;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "resist", 2)) resistDamage = 1;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, Enemy.Enemy.Resistance?.profile, predata.type, "immune", 2)) resistDamage = 2;

			if (Enemy.Enemy.tags.unstoppable) resistStun = 2;
			else if (Enemy.Enemy.tags.unflinching) resistStun = 1;
			if (Enemy.Enemy.tags.unslowable) resistSlow = 2;
			else if (Enemy.Enemy.tags.slowresist) resistSlow = 1;

		}

		if (Enemy.boundLevel > 0 && (KinkyDungeonTeaseDamageTypes.includes(predata.type) || KDIsTeasing(Damage))) {
			let eff = KDBoundEffects(Enemy);
			let mult = 1.0;
			if (eff > 0) {
				mult += 0.5;
			}
			if (eff > 3) {
				mult += 0.5;
			}

			if (KinkyDungeonGetBuffedStat(Enemy.buffs, "TeaseVuln")) mult += KinkyDungeonGetBuffedStat(Enemy.buffs, "TeaseVuln");
			if (attacker?.player && KDEntityBuffedStat(attacker, "TeaseBuff")) mult += KDEntityBuffedStat(attacker, "TeaseBuff");
			predata.dmg *= mult;
		}
		if (Enemy.boundLevel > 0 && Damage && Damage.boundBonus) {
			let eff = KDBoundEffects(Enemy);
			predata.dmg += Damage.boundBonus * eff;
		}

		let killed = Enemy.hp > 0;
		let forceKill = false;


		let time = predata.time ? predata.time : 0;
		if (!KinkyDungeonMeleeDamageTypes.includes(predata.type)) {
			if (time && spellResist)
				time = Math.max(0, Math.ceil(time * KDArmorFormula(predata.dmg, spellResist)));
			//predata.dmg = Math.max(0, predata.dmg * KDArmorFormula(predata.dmg, spellResist));
			armor = spellResist || 0;
		}

		if (time > 0 && predata.stunResist) {
			time = Math.max(0, Math.min(time - predata.stunResist, time * KDArmorFormula(time, predata.stunResist)));
		}

		if (predata.type != "inert" && resistDamage < 2) {
			if (resistDamage == 1) {
				predata.dmgDealt = Math.max(predata.dmg * KDArmorFormula(predata.dmg, armor), 0); // Armor goes before resistance
				predata.dmgDealt = predata.dmgDealt*0.5; // Enemies that are vulnerable take either dmg+0.5 or 1.5x damage, whichever is greater
			} else if (resistDamage == -1) {
				if (predata.dmg > 0)
					predata.dmgDealt = Math.max(predata.dmg+0.5, predata.dmg*1.5); // Enemies that are vulnerable take either dmg+1 or 1.5x damage, whichever is greater
				else predata.dmgDealt = 0;
				predata.dmgDealt = Math.max(predata.dmgDealt * KDArmorFormula(predata.dmg, armor), 0); // Armor comes after vulnerability
			} else if (resistDamage == -2) {
				predata.dmgDealt = Math.max(predata.dmg+1, predata.dmg*2); // Enemies that are severely vulnerable take either dmg+1 or 2x damage, whichever is greater
				predata.dmgDealt = Math.max(predata.dmgDealt * KDArmorFormula(predata.dmg, armor), 0); // Armor comes after vulnerability
			} else {
				predata.dmgDealt = Math.max(predata.dmg * KDArmorFormula(predata.dmg, armor), 0);
			}

			if (Enemy.Enemy.tags && Enemy.Enemy.tags.playerinstakill && attacker && attacker.player) predata.dmgDealt = Enemy.hp;
			else if (buffreduction && predata.dmgDealt > 0) {
				predata.dmgDealt = Math.max(predata.dmgDealt - buffreduction, 0);
				KinkyDungeonTickBuffTag(Enemy, "damageTaken", 1);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Shield.ogg");
			}

			if (!predata.blocked)
				if (!Enemy.shield || predata.ignoreshield)
					if (Enemy.freeze > 0 && predata.dmgDealt > 0) {
						if ((KinkyDungeonShatterDamageTypes.includes(predata.type)) || (KinkyDungeonMeleeDamageTypes.includes(predata.type))) {
							Enemy.freeze = 0;
						} else if (!["ice", "frost"].includes(predata.type)) {
							Enemy.freeze = Math.max(0, Enemy.freeze - predata.dmgDealt * (predata.type == "fire" ? 0.75 : 0.25));
						}
						if (Enemy.freeze == 0) {
							predata.freezebroke = true;
						}
					}

			KinkyDungeonSendEvent("duringDamageEnemy", predata);

			if (Spell && Spell.hitsfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Spell.hitsfx + ".ogg");
			else if (!(Spell && Spell.hitsfx) && predata.dmgDealt > 0 && bullet) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/DealDamage.ogg");
			if (!predata.blocked && !KinkyDungeonIgnoreBlockTypes.includes(predata.type) && predata.dmgDealt >= 1 && !predata.noblock && Enemy.blocks >= 1 && KDCanBlock(Enemy)) {
				let blockCount = 1;
				Enemy.blocks -= 1;
				Enemy.blockedordodged = (Enemy.blockedordodged || 0) + 1;
				let amount = KDGetBlockAmount(Enemy);
				let orig = predata.dmgDealt;
				predata.dmgDealt -= Math.max(0, amount);

				while (predata.dmgDealt > 0 && Enemy.blocks >= 1 && (predata.dmgDealt > Enemy.hp * 0.1 || predata.dmgDealt > Enemy.Enemy.maxhp*0.5)) {
					blockCount += 1;
					Enemy.blocks -= 1;
					Enemy.blockedordodged = (Enemy.blockedordodged || 0) + 1;
					amount = KDGetBlockAmount(Enemy);
					predata.dmgDealt -= Math.max(0, amount);
				}

				let knockback = () => {
					if (blockCount > 1 && Enemy.Enemy.tags.noknockback && !KDIsImmobile(Enemy)) {
						if (bullet && (bullet.vx || bullet.vy)) {
							// Gets pushed back by the projectile
							let dist = blockCount - 1;
							let speed = KDistEuclidean(bullet.vx, bullet.vy);
							for (let i = dist; i > 0; i--) {
								let newX = Enemy.x + Math.round(i * bullet.vx/speed);
								let newY = Enemy.y + Math.round(i * bullet.vy/speed);
								if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
								&& (i == 1 || KinkyDungeonCheckProjectileClearance(Enemy.x, Enemy.y, newX, newY))) {
									KDMoveEntity(Enemy, newX, newY, false);
								}
							}
						} else if (bullet && (Enemy.x != bullet.x || Enemy.y != bullet.y)) {
							// Gets knocked away from the explosion
							let dist = blockCount - 1;
							let speed = KDistEuclidean(Enemy.x - bullet.x, Enemy.y - bullet.y);
							for (let i = dist; i > 0; i--) {
								let newX = Enemy.x + Math.round(-i * (Enemy.x - bullet.x)/speed);
								let newY = Enemy.y + Math.round(-i * (Enemy.y - bullet.y)/speed);
								if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
								&& (i == 1 || KinkyDungeonCheckProjectileClearance(Enemy.x, Enemy.y, newX, newY))) {
									KDMoveEntity(Enemy, newX, newY, false);
								}
							}
						} else if (!bullet && attacker && !Spell) {
							// Gets knocked away from the explosion
							let dist = blockCount - 1;
							let speed = KDistEuclidean(Enemy.x - attacker.x, Enemy.y - attacker.y);
							for (let i = dist; i > 0; i--) {
								let newX = Enemy.x + Math.round(-i * (Enemy.x - attacker.x)/speed);
								let newY = Enemy.y + Math.round(-i * (Enemy.y - attacker.y)/speed);
								if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(newX, newY)) && KinkyDungeonNoEnemy(newX, newY, true)
								&& (i == 1 || KinkyDungeonCheckProjectileClearance(Enemy.x, Enemy.y, newX, newY))) {
									KDMoveEntity(Enemy, newX, newY, false);
								}
							}
						}
					}
				};

				if (predata.dmgDealt <= 0) {
					predata.dmgDealt = 0;
					predata.blocked = true;
					if (!NoMsg && predata.faction == "Player") {
						KinkyDungeonSendTextMessage(4, TextGet(blockCount == 1 ? "KDEnemyBlockSuccess" : "KDEnemyBlockSuccessMulti")
							.replace("ENMY", TextGet("Name" + Enemy.Enemy.name)), "orange", 2, undefined, undefined, undefined, "Combat");
					}

					knockback();
				} else {
					if (!NoMsg && predata.faction == "Player") {
						KinkyDungeonSendTextMessage(4, TextGet(blockCount == 1 ? "KDEnemyBlockPartial" : "KDEnemyBlockPartialMulti")
							.replace("PCNT", "" + Math.round(100 * amount/orig))
							.replace("ENMY", TextGet("Name" + Enemy.Enemy.name)), "orange", 2, undefined, undefined, undefined, "Combat");
					}

					knockback();
				}
			}

			if (Damage && Damage.damage) {
				if (predata.faction == "Player" || KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0) {
					if (predata.critical && !predata.customCrit) KDDamageQueue.push({floater: TextGet("KDCritical"), Entity: Enemy, Color: "#e7cf1a", Delay: Delay});
					KDDamageQueue.push({floater: Math.round(predata.dmgDealt*10) + ` ${TextGet("KinkyDungeonDamageType" + KinkyDungeonDamageTypes[predata.type]?.name)} ${TextGet("KDdmg")}`,
						Entity: Enemy, Color: "#ff4444", Delay: Delay,
						size: 12 + Math.min(24, Math.floor(predata.dmgDealt * 2))});
				}
			}

			if (Enemy.shield > 0 && predata.dmgDealt > 0) {
				let orig = predata.dmgDealt;
				Enemy.shield -= predata.dmgDealt;
				if (Enemy.shield <= 0) {
					predata.dmgShieldDealt += predata.dmgDealt + Enemy.shield;
					predata.dmgDealt = -Enemy.shield;

					delete Enemy.shield;
				} else {
					Enemy.playerdmg = (Enemy.playerdmg || 0) + orig;
					predata.dmgShieldDealt += predata.dmgDealt;
					predata.dmgDealt = 0;
					predata.shieldBlocked = true;
				}
			}
			if (predata.dmgDealt > 0) {
				Enemy.hp -= predata.dmgDealt;
			}
			if (Enemy.hp > 0 && Enemy.hp <= 0.51 && predata.dmgDealt > 0.51 && !forceKill && KDBoundEffects(Enemy) < 4) {
				Enemy.hp = 0;
			}
			if (predata.dmgDealt > 0) Enemy.revealed = true;
		}


		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_stun)
				if ((KinkyDungeonStunDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
					effect = true;
					if (!Enemy.stun) KDAddThought(Enemy.id, "Status", 5, 1);
					if (!Enemy.stun) Enemy.stun = 0;
					let origStun = Enemy.stun;
					if (resistStun == 2 || resistDamage == 2)
						Enemy.stun = Math.max(Enemy.stun, Math.min(Math.floor(time/3), time-2));
						// Unstoppable have stuns reduced to 1/3, and anything that stuns them for 2 turns doesn't affect them
					else if (resistStun == 1 || resistDamage == 1)
						Enemy.stun = Math.max(Enemy.stun, Math.min(Math.floor(time/2), time-1));
						// Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
					else Enemy.stun = Math.max(Enemy.stun, time);

					if (Enemy.stun > origStun) {
						KinkyDungeonSendEvent("stun", predata);
					}
				}

		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_freeze)
				if ((KinkyDungeonFreezeDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
					effect = true;
					if (!Enemy.freeze) KDAddThought(Enemy.id, "Freeze", 5, 1);
					if (!(Enemy.freeze > 0)) Enemy.freeze = 0;
					let preFreeze = Enemy.freeze > 0;
					let origStun = Enemy.freeze;
					if (resistDamage == 2 || resistStun == 2)
						Enemy.freeze = Math.max(Enemy.freeze, Math.min(Math.floor(time/3), time-2));
					else if (resistDamage == 1 || resistStun == 1)
						Enemy.freeze = Math.max(Enemy.freeze, Math.min(Math.floor(time/2), time-1));
						// Enemies with ice resistance have freeze reduced to 1/2, and anything that freezes them for one turn doesn't affect them
					else Enemy.freeze = Math.max(Enemy.freeze, time);
					predata.froze = (Enemy.freeze > 0 && !preFreeze) ? Enemy.freeze : 0;

					if (Enemy.freeze > origStun) {
						KinkyDungeonSendEvent("freeze", predata);
					}
				}
		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_snare)
				if ((KinkyDungeonBindDamageTypes.includes(predata.type))) { // Being immune to the damage stops the bind
					effect = true;
					if (!Enemy.bind) Enemy.bind = 0;
					let origStun = Enemy.bind;
					if (resistDamage == 2 || resistStun == 2)
						Enemy.bind = Math.max(Enemy.bind, Math.min(Math.floor(time/3), time-2));
					else if (resistDamage == 1 || resistStun == 1)
						Enemy.bind = Math.max(Enemy.bind, Math.min(Math.floor(time/2), time-1));
						// Enemies with resistance have bind reduced to 1/2, and anything that binds them for one turn doesn't affect them
					else Enemy.bind = Math.max(Enemy.bind, time);

					if (Enemy.bind > origStun) {
						KinkyDungeonSendEvent("bind", predata);
					}
				}
		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_bind)
				if ((predata.dmg || predata.bind) && Enemy.Enemy.bound && (resistDamage < 2) && (predata.bind || predata.bindType || KinkyDungeonBindingDamageTypes.includes(predata.type))) {
					effect = true;
					if (!Enemy.boundLevel) Enemy.boundLevel = 0;

					let effmult = 1;
					if (resistDamage == 1) {
						predata.bindEff *= 0.75;
						effmult *= 0.75;
					}
					if (resistDamage == 2) {
						predata.bindEff *= 0.5;
						effmult *= 0.5;
					}
					if (KinkyDungeonIsDisabled(Enemy)) {
						predata.bindEff *= 2;
						effmult *= 2;
					} else if (KinkyDungeonIsSlowed(Enemy)) {
						predata.bindEff *= 1.5;
						effmult *= 1.5;
					}

					if (predata.faction == "Player") {
						let bindAmpModBase = KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BindAmp"));
						let amp = KDGetBindAmp(Enemy, bindAmpModBase);
						predata.bindEff *= amp;
					}

					if (!(Enemy.boundLevel > 0)) {
						let Thought = "Annoyed";
						if (KDStrictPersonalities.includes(Enemy.personality)) Thought = "Struggle";
						else if (KDLoosePersonalities.includes(Enemy.personality)) Thought = "Embarrassed";
						KDAddThought(Enemy.id, Thought, 5, 2);
					}


					let amt = predata.bindEff * (predata.bind ? predata.bind : predata.dmg);
					/*if (predata.vulnerable && predata.bindEff * (predata.bind ? predata.bind : predata.dmg) > 0.01 && Enemy.boundLevel < Enemy.Enemy.maxhp * 0.4) {
						amt += Enemy.Enemy.maxhp * 0.2;
					}*/
					// Determine binding type based on damage and spell -- best guess
					if (amt > 0 && !predata.bindType) {
						if (KDDamageBinds[predata.type]) predata.bindType = KDDamageBinds[predata.type];
						else if (Spell) {
							if (Spell.tags) {
								for (let t of Spell.tags) {
									if (KDSpellTagBinds[t]) {
										predata.bindType = KDSpellTagBinds[t];
										break;
									}
								}
							}
						}
					}
					// Do the deed
					KDTieUpEnemy(Enemy, amt, predata.bindType, predata.dmg, predata.faction == "Player", Delay);

					if (predata.bindType && predata.allowConjuredRestraint)
						KDBindEnemyWithTags(Enemy.id, KDGetBulletBindingTags(predata.bindType, undefined, false),
					0,
					amt, !predata.useRealRestraint, undefined, false, false);

					if (!NoMsg && predata.faction == "Player") {
						KinkyDungeonSendTextMessage(4, TextGet(effmult == 1 ? "KDIsBound" : (effmult > 1 ? "KDDisabledBonus" : "KDUnflinchingPenalty"))
							.replace("AMNT", "" + Math.round(10 * amt))
							.replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)), "lightgreen", 2, undefined, undefined, undefined, "Combat");
					}

				}
		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_distract)
				if ((predata.dmg || predata.distract) && Enemy.Enemy.bound && (resistDamage < 2)
					&& (predata.distract || KinkyDungeonDistractDamageTypes.includes(predata.type) || (KDLoosePersonalities.includes(Enemy.personality) && KinkyDungeonMasochistDamageTypes.includes(predata.type)))) {
					if (!Enemy.distraction) Enemy.distraction = 0;
					if (Enemy.distraction < Enemy.Enemy.maxhp) {
						effect = true;

						let efficiency = predata.distractEff ? predata.distractEff : 1.0;
						efficiency *= 1; // Always multiply by 2
						if (resistDamage == 1) {
							efficiency *= 0.75;
						}
						if (resistDamage == 2) {
							efficiency *= 0.5;
						}
						if (predata.vulnerable || Enemy.boundLevel > 0) {
							efficiency *= 1 + Math.min(1, predata.vulnerable ? 1 : Enemy.boundLevel / Enemy.Enemy.maxhp);
						}

						if (!(Enemy.distraction > 0)) {
							let Thought = "Embarrassed";
							if (KDStrictPersonalities.includes(Enemy.personality)) Thought = "Angry";
							else if (KDLoosePersonalities.includes(Enemy.personality)) Thought = "Play";
							KDAddThought(Enemy.id, Thought, 5, 2);
						}

						KDAddDistraction(Enemy, efficiency * (predata.distract ? predata.distract : predata.dmg), predata.distractMult != undefined ? predata.distractMult : 0.25);
						if (predata.vulnerable && efficiency * (predata.distract ? predata.distract : predata.dmg) > 0.01 && Enemy.distraction < Enemy.Enemy.maxhp * 0.5) {
							KDAddDistraction(Enemy, Enemy.Enemy.maxhp*0.35, 0.1);
						}
						if (Enemy.distraction >= Enemy.Enemy.maxhp && (predata.tease || KDIsTeasing(Damage)) && !predata.flags?.includes("BurningDamage")) {
							KDEnemyRelease(Enemy);
						}
					}
				}

		if (!forceKill && (KDBoundEffects(Enemy) > 3 || KDIsInParty(Enemy) || Damage.nokill) && (Enemy.hp <= 0 || (KDBoundEffects(Enemy) > 3 && Enemy.hp <= Enemy.Enemy.maxhp * 0.1))) {
			if (!(Enemy.boundLevel > 0) && KDIsInParty(Enemy)) {
				KDTieUpEnemy(Enemy, 2*Enemy.Enemy.maxhp, "Null");
			}
			if ((predata.faction == "Player" || KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0) && Enemy.hp > 0.001) {
				let Thought = "GiveUp";
				if (KDStrictPersonalities.includes(Enemy.personality)) Thought = "Fire";
				else if (KDLoosePersonalities.includes(Enemy.personality)) Thought = "Play";
				if (!(Enemy.boundLevel > 0)) KDAddThought(Enemy.id, Thought, 6, 3);
				KDAddThought(Enemy.id, Thought, 6, 3);
				KDDamageQueue.push({floater: TextGet("KDHelpless"), Entity: Enemy, Color: "#ff5555", Time: 2, Delay: Delay});
			}
			if (killed)
				Enemy.hp = 0.001;
		}

		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_slow)
				if ((resistSlow < 2 && resistDamage < 2) && (KinkyDungeonSlowDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
					effect = true;
					if (!Enemy.slow) KDAddThought(Enemy.id, "Annoyed", 5, 1);
					if (!Enemy.slow) Enemy.slow = 0;
					let origStun = Enemy.slow;
					if (resistSlow == 1 || resistDamage == 1)
						Enemy.slow = Math.max(Enemy.slow, Math.min(Math.floor(time/2), time-1)); // Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
					else Enemy.slow = Math.max(Enemy.slow, time);


					if (Enemy.slow > origStun) {
						KinkyDungeonSendEvent("slow", predata);
					}
				}

		if (predata.vulnConsumed && !noVuln) {
			KinkyDungeonSetEnemyFlag(Enemy, "removeVuln", 1);
			//Enemy.vulnerable = 0;
		}
		if (!predata.blocked)
			if (!Enemy.shield || predata.ignoreshield || predata.shield_vuln)
				if ((resistDamage < 2) && (KinkyDungeonVulnerableDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
					effect = true;
					if (!Enemy.vulnerable) KDAddThought(Enemy.id, "Status", 4, 1);
					if (!Enemy.vulnerable && predata.dmg > 0) Enemy.vulnerable = 0;
					let origStun = Enemy.vulnerable;
					if (resistDamage == 1)
						Enemy.vulnerable = Math.max(Enemy.vulnerable, Math.min(Math.floor(time/2), time-1)); // Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
					else Enemy.vulnerable = Math.max(Enemy.vulnerable, time);


					if (Enemy.vulnerable > origStun) {
						KinkyDungeonSendEvent("vulnerable", predata);
					}
				}
	} else {
		predata.vulnConsumed = false;
	}

	if (KDBoundEffects(Enemy) > 3) {
		if (!Enemy.vulnerable && predata.dmg > 0) Enemy.vulnerable = 0;
		Enemy.vulnerable = Math.max(Enemy.vulnerable, 1);
	}

	predata.aggro =
		KDGetFaction(Enemy) != "Player"
		&& (Enemy.lifetime > 9000 || !Enemy.maxlifetime)
		&& predata.type != "heal"
		&& predata.type != "inert"
		&& (!Spell
			|| !Spell.allySpell)
		&& (!bullet
			|| !bullet.spell
			|| (!bullet.spell.allySpell && !bullet.spell.enemySpell));

	KinkyDungeonSendEvent("afterDamageEnemy", predata);

	let atkname = (Spell) ? TextGet("KinkyDungeonSpell" + Spell.name) : TextGet("KinkyDungeonBasicAttack");
	let damageName = TextGet("KinkyDungeonDamageType" + predata.type);
	if (!NoMsg && !Spell && !Attack) {
		atkname = TextGet("KinkyDungeonBasicDamage");
	}

	if (Enemy.hp <= 0) {
		KinkyDungeonKilledEnemy = Enemy;
	}
	let mod = "";
	if (resistDamage == 1) mod = "Weak";
	if (resistDamage == 2) mod = "Immune";
	if (resistDamage == -1) mod = "Strong";
	if (resistDamage == -2) mod = "VeryStrong";
	if (Damage && !mod && spellResist > 0 && !KinkyDungeonMeleeDamageTypes.includes(predata.type)) mod = "SpellResist";

	if (predata.faction == "Player") {
		if (!Enemy.playerdmg) Enemy.playerdmg = 0.01;
		Enemy.playerdmg += predata.dmgDealt;
	}

	if (!NoMsg && (!predata.blocked) && (predata.dmgDealt > 0 || !Spell || effect) && (!Damage || Damage.damage > 0)) {KinkyDungeonSendActionMessage(4 + predata.dmgDealt * 0.01, (Damage && predata.dmgDealt > 0) ?
		TextGet((Ranged) ? "PlayerRanged" + mod : "PlayerAttack" + mod).replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)).replace("AttackName", atkname).replace("DamageDealt", "" + Math.round(predata.dmgDealt * 10)).replace("DamageType", ("" + damageName).toLowerCase())
		: TextGet("PlayerMiss" + ((Damage && !miss) ? (predata.shieldBlocked ? "Shield" : "Armor") : "")).replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)),
			(Damage && (predata.dmg > 0 || effect)) ? "orange" : "#ff5277", 2, undefined, undefined, Enemy, "Combat", predata.dmgDealt == 0 ? "Action" : undefined);
	}

	if (Enemy && Enemy.Enemy && KDAmbushAI(Enemy) && Spell) {
		Enemy.ambushtrigger = true;
	}


	if (!Damage && predata.type != "inert" && predata.dmgDealt <= 0) {
		KDAddThought(Enemy.id, "Laugh", 4, 1);

		if (Enemy.playerdmg || KinkyDungeonVisionGet(Enemy.x, Enemy.y)) {
			KDDamageQueue.push({floater: TextGet("KDMissed"), Entity: Enemy, Color: "#ff5555", Time: 0.5, Delay: Delay});
			if (KDRandom() < actionDialogueChanceIntense)
				KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(Enemy) ? KDGetEnemyPlayLine(Enemy) : "") + "MissedMe").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5, false, true);
		}

		let vol = KDCanHearSound(KinkyDungeonPlayerEntity, Math.max(KDMINDAMAGENOISE, KDDMGSOUNDMULT * Math.max(predata.dmg, predata.dmgDealt)), Enemy.x, Enemy.y, 1.0);
		if (vol > 0) {
			if (KDSoundEnabled() && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx.Miss) {
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx.Miss + ".ogg", undefined, Math.min(1, vol));
			}
		}
	} else if (Damage && Damage.damage > 0 && predata.type != "inert" && predata.dmgDealt <= 0 && !miss) {
		if (KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0) {
			KDAddThought(Enemy.id, "Laugh", 5, 3);
			if (KDRandom() < actionDialogueChanceIntense)
				KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(Enemy) ? KDGetEnemyPlayLine(Enemy) : "") + "BlockedMe").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5, false, true);
			KDDamageQueue.push({floater: TextGet("KDBlocked"), Entity: Enemy, Color: "#ff5555", Time: 0.5, Delay: Delay});
		}

		let type = KinkyDungeonMeleeDamageTypes.includes(predata.type) ? "Block" : "Resist";
		let vol = KDCanHearSound(KinkyDungeonPlayerEntity, Math.max(KDMINDAMAGENOISE, KDDMGSOUNDMULT * Math.max(predata.dmg, predata.dmgDealt)), Enemy.x, Enemy.y, 1.0);
		if (vol > 0) {
			if (KDSoundEnabled() && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx[type]) {
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx[type] + ".ogg", undefined, Math.min(1, vol));
			}
		}
		//KinkyDungeonSendFloater({x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, TextGet("KDBlocked"), "white", 2);
	} else if (predata.dmgDealt > 0 && KDSoundEnabled() && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx.Damage) {
		let vol = KDCanHearSound(KinkyDungeonPlayerEntity, Math.max(KDMINDAMAGENOISE, KDDMGSOUNDMULT * Math.max(predata.dmg, predata.dmgDealt)), Enemy.x, Enemy.y, 1.0);
		if (vol > 0) {
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx.Damage + ".ogg", undefined, Math.min(1, vol));
		}
		if (KDRandom() < actionDialogueChance)
			KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (KDGetEnemyPlayLine(Enemy) ? KDGetEnemyPlayLine(Enemy) : "") + "Hit").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5);
	}

	if (predata.aggro)
		KinkyDungeonAggro(Enemy, Spell, attacker, predata.faction);

	if (predata.dmg > 0) {
		KinkyDungeonTickBuffTag(Enemy, "takeDamage", 1);
		KinkyDungeonSetEnemyFlag(Enemy, "wander", 0);
		KinkyDungeonSetEnemyFlag(Enemy, "blocked", 0);
		KinkyDungeonSetEnemyFlag(Enemy, "genpath", 0);
		KinkyDungeonSetEnemyFlag(Enemy, "failpath", 0);
	}

	return predata.dmgDealt + predata.dmgShieldDealt;
}

function KinkyDungeonDisarm(Enemy: entity, suff?: string): boolean {
	if (!KinkyDungeonPlayerDamage || KinkyDungeonPlayerDamage.unarmed) return false;

	if (!Enemy) {
		console.log("Error processing disarm! Please report!");
		return false;
	}
	if (KDRandom() < KinkyDungeonWeaponGrabChance) {
		let slots = [];
		for (let X = -Math.ceil(1); X <= Math.ceil(1); X++)
			for (let Y = -Math.ceil(1); Y <= Math.ceil(1); Y++) {
				if ((X != 0 || Y != 0) && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(Enemy.x + X, Enemy.y + Y))) {
					// We add the slot and those around it
					slots.push({x:Enemy.x + X, y:Enemy.y + Y});
					for (let XX = -Math.ceil(1); XX <= Math.ceil(1); XX++)
						for (let YY = -Math.ceil(1); YY <= Math.ceil(1); YY++) {
							if ((Math.abs(X + XX) > 1 || Math.abs(Y + YY) > 1) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(Enemy.x + XX + X, Enemy.y + YY + Y))) {
								slots.push({x:Enemy.x + XX + X, y:Enemy.y + YY + Y});
							}
						}
				}
			}

		let foundslot = null;
		for (let C = 0; C < 100; C++) {
			let slot = slots[Math.floor(KDRandom() * slots.length)];
			if (slot && KinkyDungeonNoEnemy(slot.x, slot.y, true)
				&& Math.max(Math.abs(KinkyDungeonPlayerEntity.x - slot.x), Math.abs(KinkyDungeonPlayerEntity.y - slot.y)) > 1.5
				&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(slot.x, slot.y))) {
				foundslot = {x: slot.x, y: slot.y};

				C = 100;
			} else slots.splice(C, 1);
		}

		if (foundslot) {
			let weapon = KinkyDungeonPlayerWeapon;

			let dropped = {x:foundslot.x, y:foundslot.y, name: weapon};

			KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, TextGet("KDDisarmed"), "#ff5555", KDToggles.FastFloaters ? 1.5 : 3);

			KDSetWeapon('Unarmed', true);
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
			KinkyDungeonInventoryRemove(KinkyDungeonInventoryGetWeapon(weapon));

			KDMapData.GroundItems.push(dropped);
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonDisarm" + (suff ? suff : "")), "#ff5277", 2,
				undefined, undefined, undefined, "Combat");

			return true;
		}
	}
	return false;
}

/**
 * @param Enemy
 * @param Damage
 * @param [chance]
 * @param [bullet]
 */
function KinkyDungeonAttackEnemy(Enemy: entity, Damage: damageInfo, chance?: number, bullet?: any): boolean {
	let disarm = false;
	if ((Damage && !Damage.nodisarm) && Enemy.Enemy && Enemy.Enemy.disarm && Enemy.disarmflag > 0) {
		if (Enemy.stun > 0 || Enemy.freeze > 0 || Enemy.blind > 0 || Enemy.teleporting > 0 || (Enemy.playWithPlayer && !Enemy.hostile)) Enemy.disarmflag = 0;
		else if (Enemy.Enemy && Enemy.Enemy.disarm && Enemy.disarmflag >= 0.97 && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
			Enemy.disarmflag = 0;
			disarm = true;
		}
	}
	let evaded = KinkyDungeonEvasion(Enemy, false, undefined, KinkyDungeonPlayerEntity, chance);
	let dmg = Damage;
	let buffdmg = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg");
	let channel = KinkyDungeonPlayerDamage?.channel || 0;
	let slow = KinkyDungeonPlayerDamage?.channelslow || 0;
	let predata = {
		bullet: bullet,
		channel: channel,
		slow: slow,
		targetX: Enemy.x,
		targetY: Enemy.y,
		enemy: Enemy,
		evaded: evaded,
		miss: !evaded,
		disarm: disarm,
		eva: !disarm && evaded,
		Damage: Damage,
		buffdmg: buffdmg,
		vulnConsumed: Enemy.vulnerable > 0,
		critical: false,
		vulnerable: (Enemy.vulnerable || (KDHostile(Enemy) && !Enemy.aware)) && dmg && !dmg.novulnerable && (!Enemy.Enemy.tags || !Enemy.Enemy.tags.nonvulnerable),
	};
	KinkyDungeonSendEvent("beforePlayerAttack", predata);

	if (predata.buffdmg) dmg.damage = Math.max(0, dmg.damage + predata.buffdmg);

	/*if (predata.vulnerable && (predata.eva)) {
		let crit = KinkyDungeonGetCrit(KinkyDungeonGetEvasion(), KinkyDungeonPlayerDamage, Enemy) || KDDefaultCrit;
		let dmgBonus = Math.max(Math.min(dmg.damage, KDVulnerableDmg), dmg.damage * (crit - 1));
		dmg.damage = Math.max(0, dmg.damage + dmgBonus);
		KinkyDungeonSendTextMessage(4, TextGet((Enemy.vulnerable || Enemy.distraction > Enemy.Enemy.maxhp) ? "KinkyDungeonVulnerable" : "KinkyDungeonUnseen")
			.replace("AMOUNT", "" + Math.round(10 * dmgBonus))
			.replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), "lightgreen", 2);

		predata.critical = true;
		if (dmg.damage > 0 || dmg.bind > 0)
			predata.vulnConsumed = true;
	}*/


	let hp = Enemy.hp;
	KinkyDungeonDamageEnemy(Enemy, (predata.eva) ? dmg : null, undefined, undefined, undefined, bullet, KinkyDungeonPlayerEntity, undefined, undefined, predata.vulnConsumed, predata.critical, true);
	if (predata.eva && (Damage.sfx || (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.sfx))) {
		if (KDSoundEnabled()) KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/" + (Damage.sfx || KinkyDungeonPlayerDamage.sfx) + ".ogg"});
		//AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + KinkyDungeonPlayerDamage.sfx + ".ogg");
	} else if (!predata.eva) if (KDSoundEnabled()) KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/Miss.ogg"});
	//AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	if (disarm) {
		//KinkyDungeonDisarm(Enemy);
		KinkyDungeonSendTextMessage(10, TextGet("KDDisarmFlag")
			.replace("ENMY", TextGet("Name" + Enemy.Enemy.name)),
		"#ff8844", 2, undefined, undefined, undefined, "Combat");
		AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Grope.ogg");
		KinkyDungeonSetFlag("disarmFlagVulnerable", 2);
	}
	if (!KinkyDungeonPlayerDamage || !KinkyDungeonPlayerDamage.silent || !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Silence") > 0)) {
		if (Enemy && hp < Enemy.Enemy.maxhp) {
			KinkyDungeonAlert = 4;
		} else {
			KinkyDungeonAlert = 2;
		}
	} else {
		if (!KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Silence") || KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Silence") < 2) {
			if (KinkyDungeonAlert) {
				KinkyDungeonAlert = 2;
			} else {
				KinkyDungeonAlert = 1;
			}
		} else if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Silence") < 3) {
			// Meep
		}
	}

	if (Enemy.Enemy && Enemy.Enemy.disarm && !disarm && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
		if (!Enemy.disarmflag) Enemy.disarmflag = 0;
		Enemy.disarmflag += Enemy.Enemy.disarm;
	}
	let data = {
		bullet: bullet,
		channel: predata.channel,
		slow: predata.slow,
		targetX: Enemy.x,
		targetY: Enemy.y,
		enemy: Enemy,
		miss: !evaded,
		disarm: disarm,
		damage: Damage,
		vulnConsumed: predata.vulnConsumed,
		attacker: KinkyDungeonPlayerEntity,
		predata: predata,
	};
	KinkyDungeonSendEvent("playerAttack", data);

	if (data.slow) {
		KDGameData.MovePoints = Math.min(KDGameData.MovePoints, -1);
	}
	if (data.channel) {
		KinkyDungeonSetFlag("channeling", data.channel);
		KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, data.channel);
		KinkyDungeonSleepTime = CommonTime() + 200;
	}

	KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "damage", 1);
	KinkyDungeonTickBuffTag(Enemy, "incomingHit", 1);
	if (predata.eva)
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "hit", 1);


	KinkyDungeonSendEvent("afterPlayerAttack", data);

	if (data.vulnConsumed) {
		KinkyDungeonSetEnemyFlag(Enemy, "removeVuln", 1);
	}
	return predata.eva;
}

let KDBulletWarnings = [];
let KDUniqueBulletHits = new Map();


function KDUpdateBulletEffects(b: any, d: number) {
	// At the start we guarantee interactions
	if (!b.bullet.noInteractTiles) {
		let rad = b.bullet.aoe || 0.5;
		for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
			for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
				if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletAoEMod(b))) {
					KDEffectTileInteractions(b.x + X, b.y + Y, b, d);
				}
			}
	}
}

function KinkyDungeonUpdateBullets(delta: number, Allied?: boolean): void {
	if (delta > 0) {

		if (Allied) KDUniqueBulletHits = new Map();

		for (let b of KDMapData.Bullets) {
			if ((Allied && b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell) || (!Allied && !(b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell))) {
				if (b.bullet.followPlayer) {
					b.x = KinkyDungeonPlayerEntity.x;
					b.y = KinkyDungeonPlayerEntity.y;
				} else if (b.bullet.followCaster) {
					let enemy = KinkyDungeonFindID(b.bullet.followCaster);
					if (enemy) {
						b.x = enemy.x;
						b.y = enemy.y;
					}
				}
				if (b.bullet.cancelCaster) {
					let enemy = KinkyDungeonFindID(b.bullet.cancelCaster);
					if (!enemy) {
						b.lifetime = 0;
					}
				}

				KinkyDungeonSendEvent("bulletTick", {bullet: b, delta: delta, allied: Allied});
				if (b.bullet && b.bullet.dot) {
					KinkyDungeonBulletDoT(b);
				}
				if (b.bullet.cast && b.bullet.spell && b.bullet.spell.castDuringDelay && (!b.bullet.cast.chance || KDRandom() < b.bullet.cast.chance) && b.time > 1) {
					let xx = b.bullet.cast.tx;
					let yy = b.bullet.cast.ty;
					if (b.bullet.cast.targetID) {
						if (b.bullet.cast.targetID == -1) {
							xx = KinkyDungeonPlayerEntity.x;
							yy = KinkyDungeonPlayerEntity.y;
						} else {
							let enemy = KinkyDungeonFindID(b.bullet.cast.targetID);
							if (enemy) {
								xx = enemy.x;
								yy = enemy.y;
							}
						}

					}
					let castingSpell = KinkyDungeonFindSpell(b.bullet.cast.spell, true);
					if (b.bullet.cast.spread) {
						let xxx = xx + Math.round(-b.bullet.cast.spread + 2*b.bullet.cast.spread * KDRandom());
						let yyy = yy + Math.round(-b.bullet.cast.spread + 2*b.bullet.cast.spread * KDRandom());
						if (xxx != b.x || yyy != b.y || castingSpell.type != 'bolt') {
							xx = xxx;
							yy = yyy;
						}
					}

					if (castingSpell.type != 'bolt') {
						if (!xx) xx = b.x;
						if (!yy) yy = b.y;
					} else if (xx == b.x && yy == b.y) {
						for (let i = 0; i < 20; i++) {
							xx = b.x + Math.floor(KDRandom() * 3 - 1);
							yy = b.y + Math.floor(KDRandom() * 3 - 1);
							if (xx != b.x || yy != b.y) i = 1000;
							else if (i > 19) {
								xx = b.x + 1;
								yy = b.y + 0;
							}
						}
					}

					KinkyDungeonCastSpell(xx, yy, castingSpell, undefined, undefined, b);
					if (b.bullet.cast.sfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + b.bullet.cast.sfx + ".ogg");
				}
			}
		}
	}
	if (Allied && delta > 0) {
		KDBulletWarnings = [];
	}
	for (let E = 0; E < KDMapData.Bullets.length; E++) {
		let b = KDMapData.Bullets[E];

		if ((Allied && b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell) || (!Allied && !(b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell))) {
			let d = delta;
			let first = true;
			let justBorn = false;
			let trailSquares = [];
			let startx = b.x;
			let starty = b.y;
			let end = false;
			let mod = (b.bullet.spell && !b.bullet.spell.slowStart && (b.bullet.spell.fastStart || (b.bullet.spell.speed > (KDGetSpellRange(b.bullet.spell) || b.bullet.spell.range) * 0.8 && b.bullet.spell.speed > 1) || (!b.bullet.spell.enemySpell && !b.bullet.spell.allySpell && (b.vx != 0 || b.vy != 0)))) ? 1 : 0;

			KDBulletEffectTiles(b);
			KDUpdateBulletEffects(b, 0);

			let dt = 0.1;
			while (d >= 0.05) {
				dt = (d - Math.max(0, d - 1))/Math.sqrt(Math.max(1, b.vx*b.vx+b.vy*b.vy));
				if (!first && delta > 0) {
					if (b.born >= 0) {
						b.born -= dt;
						justBorn = true;
					}
					if (b.born < mod) {
						b.xx += b.vx * dt;
						b.yy += b.vy * dt;
						b.time -= dt;
					} else if (mod <= 0) {
						d = 0;
						b.born = 0;
					}

					if (b.bullet.spell && (b.trail || b.trailEffectTile) && (b.x != Math.round(b.xx) || b.y != Math.round(b.yy) || (b.bullet.spell && b.bullet.spell.trailOnSelf))
						&& !trailSquares.includes(Math.round(b.xx) + "," + Math.round(b.yy))) {
						if (KinkyDungeonBulletTrail(b)) {
							trailSquares.push(Math.round(b.xx) + "," + Math.round(b.yy));
						}
					}

					b.x = Math.round(b.xx);
					b.y = Math.round(b.yy);

					d -= dt;
				} else first = false;

				let outOfRange = false;
				let endTime = false;
				if (b.bullet && b.bullet.origin) {
					let dist = Math.sqrt((b.bullet.origin.x - b.x) * (b.bullet.origin.x - b.x) + (b.bullet.origin.y - b.y) * (b.bullet.origin.y - b.y));
					if (dist > b.bullet.range) outOfRange = true;
					if (dist >= b.bullet.range) endTime = true;
				}
				let outOfTime = (b.bullet.lifetime != 0 && b.time <= 0.001);
				end = false;
				let checkCollision = (b.bullet.faction == "Player" && (b.x != KinkyDungeonPlayerEntity.x || b.y != KinkyDungeonPlayerEntity.y))
					|| justBorn || (b.x != startx || b.y != starty) || (!b.vx && !b.vy) || (KDistEuclidean(b.vx, b.vy) < 0.9); // Check collision for bullets only once they leave their square or if they are slower than one
				if ((checkCollision && !KinkyDungeonBulletsCheckCollision(b, undefined, undefined, delta - d, false)) || outOfTime || outOfRange) {
					if (!(b.bullet.spell
						&& (
							(!b.bullet.trail
								&& (b.bullet.spell.piercing
									|| (b.bullet.spell.pierceEnemies
										&& KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y)))))
							|| (b.bullet.trail
								&& b.bullet.spell.piercingTrail)))
						|| outOfRange
						|| outOfTime)
						end = true;
					if (end) {
						d = 0;
						KDMapData.Bullets.splice(E, 1);
						KinkyDungeonBulletsID[b.spriteID] = null;
						KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:outOfRange, outOfTime: outOfTime});
						E -= 1;
					}
					if (!((outOfTime || outOfRange) && b.bullet.spell && ((!b.bullet.trail && b.bullet.spell.nonVolatile) || (b.bullet.trail && b.bullet.spell.nonVolatileTrail))))
						KinkyDungeonBulletHit(b, 1.0, outOfTime, outOfRange, d, dt, end);
				}
				if (endTime) b.time = 0;
				// Update the bullet's visual position
				KinkyDungeonUpdateSingleBulletVisual(b, end);
			}
			if (!end || (b.bullet.spell && b.bullet.spell.alwaysWarn)) {
				KinkyDungeonSendEvent("bulletAfterTick", {bullet: b, delta: delta, allied: Allied});
				// Update the bullet's visual position
				KinkyDungeonUpdateSingleBulletVisual(b, end);

				let show =
					(KDFactionRelation("Player", b.bullet.faction) < 0.5
						|| (b.bullet.spell && b.bullet.spell.playerEffect)
						|| b.bullet.playerEffect
						|| (b.bullet.spell && b.bullet.spell.alwaysWarn))
					&& !(b.bullet.spell && b.bullet.spell.hideWarnings)
					&& ((b.bullet.spell && b.bullet.spell.alwaysWarn)
						|| b.bullet.hit == "lingering"
						|| (b.bullet.spell && b.bullet.name == b.bullet.spell.name
							&& (b.bullet.spell.onhit == "aoe" || b.bullet.spell.onhit == "dot"))
						|| (b.bullet.trail && !b.bullet.spell?.nonVolatileTrail)
						|| ((b.lifetime > 0 || b.lifetime == undefined) && b.bullet.damage && b.bullet.damage.type && b.bullet.damage.type != "heal" && b.bullet.damage.type != "inert")
					);
				if (KinkyDungeonStatsChoice.get("BulletHell2") || (b.vx || b.vy) && KinkyDungeonStatsChoice.get("BulletHell")) show = false;
				let bxx = b.xx;
				let byy = b.yy;
				let bx = b.x;
				let by = b.y;
				let btime = b.time;
				let bborn = b.born;
				// Lookforward
				d = delta;
				first = true;
				startx = bx;
				starty = by;

				b.warnings = [];

				while (d > 0.1) {
					if (!first && delta > 0) {
						dt = 0.5 * (d - Math.max(0, d - 1))/Math.sqrt(Math.max(1, b.vx*b.vx+b.vy*b.vy));

						if (bborn >= 0) bborn -= dt;
						if (bborn < mod) {
							bxx += b.vx * dt;
							byy += b.vy * dt;
							btime -= dt;
						}

						bx = Math.round(bxx);
						by = Math.round(byy);

						d -= dt;
					} else first = false;

					let outOfRange = false;
					if (b.bullet && b.bullet.origin) {
						let dist = Math.sqrt((b.bullet.origin.x - bx) * (b.bullet.origin.x - bx) + (b.bullet.origin.y - by) * (b.bullet.origin.y - by));
						if (dist > b.bullet.range) outOfRange = true;
					}
					let outOfTime = (b.bullet.lifetime != 0
						&& (btime <= 0.001 || ((b.bullet.damage && !b.bullet.trail) && btime <= 1.001)));
					let checkCollision = (bx != startx || by != starty)
						|| (!b.vx && !b.vy) || (KDistEuclidean(b.vx, b.vy) < 0.9) || b.bullet.aoe; // Check collision for bullets only once they leave their square or if they are slower than one
					if (outOfTime || outOfRange) {
						d = 0;
					}
					if ((!(outOfTime || outOfRange) || (b.bullet.spell?.alwaysWarn)) && checkCollision) {
						let rad = b.bullet.aoe ? b.bullet.aoe : ((b.bullet.spell && b.bullet.spell.aoe && b.bullet.name == b.bullet.spell.name) ? b.bullet.spell.aoe : 0);
						for (let xx = bx - Math.floor(rad); xx <= bx + Math.ceil(rad); xx++) {
							for (let yy = by - Math.floor(rad); yy <= by + Math.ceil(rad); yy++) {
								if (AOECondition(bx, by, xx, yy, rad, KDBulletAoEMod(b))) {
									if (show && !KDBulletWarnings.some((w) => {return w.x == xx && w.y == yy;}))
										KDBulletWarnings.push({x: xx, y: yy, x_orig: b.xx, y_orig: b.yy, scale: 0, color:b.bullet.spell ? (b.bullet.spell.color ? b.bullet.spell.color : "#ff5277") : "#ff5277"});
									if (!b.warnings.includes(xx + "," + yy)) {
										b.warnings.push(xx + "," + yy);
									}
								}
							}
						}
					}
				}
			}


			// A bullet can only damage an enemy in one location at a time
			// Resets at the end of the bullet update!
			// But only for piercing bullets. Non-piercing bullets just expire
			if (!b.bullet.piercing && !b.bullet.pierceEnemies && !b.bullet.noDoubleHit)
				b.alreadyHit = undefined;
		}
	}
}

function KinkyDungeonUpdateSingleBulletVisual(b: any, end: boolean, delay?: number) {
	if (b.spriteID && !b.bullet.noSprite) {
		let bb = KinkyDungeonBulletsVisual.get(b.spriteID);
		let scale = bb ? bb.scale : 0;
		let alpha = bb ? bb.alpha : 0;
		let dd = bb ? bb.delay : delay;
		let spinAngle = bb ? bb.spinAngle : 0;
		let visx = bb ? bb.visual_x : b.visual_x;
		let visy = bb ? bb.visual_y : b.visual_y;
		if (visx == undefined) visx = b.xx;
		if (visy == undefined) visy = b.yy;

		let temp = (!b.vx && !b.vy && b.time <= 1 && !(b.bullet.hit || (b.bullet.trail && !b.bullet.spell?.nonVolatileTrail)));
		let zIndex = (b.vx == 0 && b.vy == 0) ? 2 : 0;
		zIndex += b.bullet.spell?.power || 0;
		KinkyDungeonBulletsVisual.set(b.spriteID, {end: end, zIndex: zIndex, temporary: temp, spin: b.bullet.bulletSpin, spinAngle: spinAngle, name: b.bullet.name, spriteID: b.spriteID, size: b.bullet.width ? b.bullet.width : 1, aoe: (b.bullet.spell && b.bullet.spell.aoe) ? b.bullet.spell.aoe : undefined, vx: b.vx, vy: b.vy, xx: b.xx, yy: b.yy, visual_x: visx, visual_y: visy, updated: true, scale: scale, alpha: alpha, delay: dd});
	}
}

function KinkyDungeonUpdateBulletVisuals(delta: number) {
	if (delta > 0)
		for (let b of KinkyDungeonBulletsVisual.entries()) {
			if (b[1].updated) {
				b[1].updated = false;
			} else if (!b[1].end || b[1].alpha <= 0.01) KinkyDungeonBulletsVisual.delete(b[0]);
		}
}

let KinkyDungeonCurrentTick = 0;

function KinkyDungeonUpdateBulletsCollisions(delta: number, Catchup?: boolean) {
	for (let E = 0; E < KDMapData.Bullets.length; E++) {
		let b = KDMapData.Bullets[E];
		if ((!Catchup && !b.secondary) || (Catchup && b.secondary)) {
			// This is a bit of a brute force way of forcing the bullet to only check for collisions when time has passed, i.e. when delta = 1
			// However the collision check still happens if the bullet was born in between turns, e.g the player uses Leather Package

			if (b.collisionUpdate == undefined || delta > 0) {
				if (!KinkyDungeonBulletsCheckCollision(b, b.time >= 0, undefined, undefined, !(b.bullet.faction == "Player" || (!b.vx && !b.vy) || b.bullet.aoe || (KDistEuclidean(b.vx, b.vy) < 0.9)), delta)) { // (b.bullet.faction == "Player" || (!b.vx && !b.vy) || b.bullet.aoe || (KDistEuclidean(b.vx, b.vy) < 0.9)) &&
					if (!(b.bullet.spell && (b.bullet.spell.piercing || (b.bullet.spell.pierceEnemies && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y)))))) {
						KDMapData.Bullets.splice(E, 1);
						KinkyDungeonBulletsID[b.spriteID] = null;
						KinkyDungeonUpdateSingleBulletVisual(b, true);
						KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:false, outOfTime: false});
						E -= 1;
					}
					KinkyDungeonBulletHit(b, 0);
				}
				if (delta > 0 && !b.collisionUpdate) {
					b.born = 0;
				}
			}
			b.collisionUpdate = true;
		}
	}
}


function KDCheckCollideableBullets(entity: entity, force: boolean) {
	for (let E = 0; E < KDMapData.Bullets.length; E++) {
		let b = KDMapData.Bullets[E];
		if (b.x == entity.x && b.y == entity.y && b.bullet && b.bullet.damage
				&& (b.time > 1 // Only bullets that arent instantly ending
					&& (!entity.player || !(b.vx != 0 || b.vy != 0)))) {// Enemies can run into bullets as they move, but the player can walk into bullets that are moving without being hit
			let pierce = b.bullet.spell && (b.bullet.spell.piercing || b.bullet.spell.pierceEnemies);

			//if (noDirect && b.bullet.damage.damage != 0) continue;
			if (pierce && b.bullet.damage.damage != 0) continue;
			if (!KDBulletCanHitEntity(b, entity) && !force) continue;

			let noDirect = b.bullet.spell && (b.bullet.spell.noDirectHit);
			if (!noDirect) {
				if (entity.player) KDBulletHitPlayer(b, KinkyDungeonPlayerEntity);
				else KDBulletHitEnemy(b, entity, 0, b.bullet.NoMsg);
			}

			if (!pierce) {
				KDMapData.Bullets.splice(E, 1);
				KinkyDungeonBulletsID[b.spriteID] = null;
				KinkyDungeonUpdateSingleBulletVisual(b, true);
				KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:false, outOfTime: false});
				E -= 1;
			}
			KinkyDungeonBulletHit(b, 1);
		}
	}
}

/**
 * @param b
 * @param born
 * @param [outOfTime]
 * @param [outOfRange]
 * @param [d] - Fraction of the timestep that this hit happened in
 * @param [dt] - Timestep
 * @param [end] - If the bullet is dying
 */
function KinkyDungeonBulletHit(b: any, born: number, outOfTime?: boolean, outOfRange?: boolean, d?: number, dt?: number, end?: boolean) {
	if (d > 0 && (b.vx || b.vy) && end) {
		let tt = KinkyDungeonMapGet(b.x, b.y);
		if (!KinkyDungeonMovableTilesEnemy.includes(tt)) {
			b.xx -= b.vx * dt;
			b.yy -= b.vy * dt;
			b.x = Math.round(b.xx);
			b.y = Math.round(b.yy);
		}
	}

	if (b.bullet.hit && b.bullet.spell && b.bullet.hit != b.bullet.spell.secondaryhit && b.bullet.spell.landsfx) {
		if (KDSoundEnabled() && (b.bullet.faction == "Player" || KinkyDungeonVisionGet(b.x, b.y) > 0)) {
			KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/" + b.bullet.spell.landsfx + ".ogg"});
		}
		//KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + b.bullet.spell.landsfx + ".ogg");
	}
	let data = {bullet: b, target: undefined, outOfRange:outOfRange, outOfTime: outOfTime, noise: b.bullet.spell?.noise || b.bullet.noise};
	KinkyDungeonSendEvent("beforeBulletHit", data);

	if (b.bullet.cast && (!b.bullet.cast.chance || KDRandom() < b.bullet.cast.chance) && (!b.bullet.spell || !b.bullet.spell.noCastOnHit)) {
		let xx = b.bullet.cast.tx;
		let yy = b.bullet.cast.ty;
		if (b.bullet.cast.targetID) {
			let enemy = KinkyDungeonFindID(b.bullet.cast.targetID);
			if (enemy) {
				xx = enemy.x;
				yy = enemy.y;
			}
		}
		if (!xx) xx = b.x;
		if (!yy) yy = b.y;
		KinkyDungeonCastSpell(xx, yy, KinkyDungeonFindSpell(b.bullet.cast.spell, true), undefined, undefined, b);
	}

	if (b.bullet.hit == "") {
		let newB = {born: born, time:1, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
			ox: b.x, oy: b.y,
			bullet:{
				source: b.bullet.source,
				bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin,
				hitevents: b.bullet.spell.hitevents,
				faction: b.bullet.faction, lifetime: 1, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height
			}};
		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}
		KDMapData.Bullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false, d);
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "buff" || b.bullet.hit == "buffonly" || b.bullet.hit == "buffnoAoE") {
		if (b.bullet.hit == "buff") {
			let newB = {born: born, time:1, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
				ox: b.x, oy: b.y,
				bullet:{
					source: b.bullet.source,
					bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
					bulletSpin: b.bullet.spell?.hitSpin,
					faction: b.bullet.faction, lifetime: 1, passthrough:true,
					hitevents: b.bullet.spell.hitevents, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
			KDMapData.Bullets.push(newB);
			KinkyDungeonUpdateSingleBulletVisual(newB, false, d);
		}
		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}
		if (b.bullet.spell) {
			let aoe = b.bullet.spell.aoe ? b.bullet.spell.aoe : 0.5;
			if (b.bullet.hit == "buffnoAoE") aoe = 0.5;
			if (b.bullet.spell && (b.bullet.spell.playerEffect || b.bullet.playerEffect) && AOECondition(b.x, b.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, aoe, KDBulletAoEMod(b))) {
				KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, b.bullet.damage.type, b.bullet.playerEffect ? b.bullet.playerEffect : b.bullet.spell.playerEffect, b.bullet.spell, b.bullet.faction, b);
			}
			for (let enemy of KDMapData.Entities) {
				if (((enemy.x == b.x && enemy.y == b.y) || (b.bullet.spell && aoe && AOECondition(b.x, b.y, enemy.x, enemy.y, aoe, KDBulletAoEMod(b))))) {
					for (let buff of b.bullet.spell.buffs) {
						if (buff.enemies
							&& (!buff.noAlly || !b.bullet.faction || KDFactionRelation(b.bullet.faction, KDGetFaction(enemy)) < 0.5)
							&& (!buff.onlyAlly || !b.bullet.faction || KDFactionRelation(b.bullet.faction, KDGetFaction(enemy)) >= 0.5)) {
							if (!enemy.buffs) enemy.buffs = {};
							KinkyDungeonApplyBuffToEntity(enemy, buff);
						}
					}
				}
			}
		}
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "aoe") {
		let newB = {secondary: true, born: born, time:b.bullet.spell.lifetime, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
			ox: b.x, oy: b.y,
			bullet:{faction: b.bullet.faction, spell:b.bullet.spell, bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				source: b.bullet.source,
				hitevents: b.bullet.spell.hitevents,
				bulletSpin: b.bullet.spell?.hitSpin, damage: {
					evadeable:false, noblock: (b.bullet.spell.lifetime > 1.9),
					damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage,
					ignoreshield: b.bullet.spell?.ignoreshield,
					shield_crit: b.bullet.spell?.shield_crit, // Crit thru shield
					shield_stun: b.bullet.spell?.shield_stun, // stun thru shield
					shield_freeze: b.bullet.spell?.shield_freeze, // freeze thru shield
					shield_bind: b.bullet.spell?.shield_bind, // bind thru shield
					shield_snare: b.bullet.spell?.shield_snare, // snare thru shield
					shield_slow: b.bullet.spell?.shield_slow, // slow thru shield
					shield_distract: b.bullet.spell?.shield_distract, // Distract thru shield
					shield_vuln: b.bullet.spell?.shield_vuln, // Vuln thru shield
					tease: b.bullet.spell?.tease,
					addBind: b.bullet.spell?.addBind,
					distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, desireMult: b.bullet.spell.desireMult, bindEff: b.bullet.spell.bindEff,
					bind: b.bullet.spell.bind, crit: b.bullet.spell.crit, bindcrit: b.bullet.spell.bindcrit, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KDMapData.Bullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false, d);

		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}

		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "instant") {
		if (!KinkyDungeonBulletsCheckCollision(b, true, true, d)) {
			if (!(b.bullet.spell && (b.bullet.spell.piercing || (b.bullet.spell.pierceEnemies && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y)))))) {
				let ind = KDMapData.Bullets.indexOf(b);
				if (data.noise) {
					KinkyDungeonMakeNoise(data.noise, b.x, b.y);
				}
				if (ind > -1)
					KDMapData.Bullets.splice(ind, 1);
				KinkyDungeonBulletsID[b.spriteID] = null;
				KinkyDungeonUpdateSingleBulletVisual(b, true, d);
				KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:outOfRange, outOfTime: outOfTime});
			}
		}
		let newB = {born: born, time:1, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
			ox: b.x, oy: b.y,
			bullet:{
				source: b.bullet.source,
				hitevents: b.bullet.spell.hitevents,
				bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin,
				faction: b.bullet.faction, lifetime: 1, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KDMapData.Bullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false);
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "lingering") {
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
		let rad = (b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0;
		for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
			for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
				if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletAoEMod(b), b.ox, b.oy)) {
					let dd = KDistEuclidean(X, Y) / rad;
					let LifetimeBonus = (b.bullet.spell.lifetimeHitBonus) ? Math.floor(KDRandom() * b.bullet.spell.lifetimeHitBonus) : 0;
					let newB = {delay: dd, born: born, time:b.bullet.spell.lifetime + LifetimeBonus, x:b.x+X, y:b.y+Y, vx:0, vy:0, xx:b.x+X, yy:b.y+Y,
						ox: b.x, oy: b.y,
						source: b.bullet.source,
						spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
						bullet:{faction: b.bullet.faction, spell:b.bullet.spell, block: (b.bullet.blockhit ? b.bullet.blockhit : 0),
							blockType: (b.bullet.blockTypehit ? b.bullet.blockTypehit : undefined),
							volatile: (b.bullet.volatilehit ? b.bullet.volatilehit : undefined),
							bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight, hit: b.bullet.spell?.secondaryhit,
							bulletSpin: b.bullet.spell?.hitSpin,
							effectTileLinger: b.bullet.spell.effectTileLinger, effectTileDurationModLinger: b.bullet.spell.effectTileDurationModLinger,
							hitevents: b.bullet.spell.hitevents,
							passthrough: b.bullet.spell.noTerrainHit,
							damage: {
								evadeable:false, noblock: (b.bullet.spell.lifetime > 1.9),
								ignoreshield: b.bullet.spell?.ignoreshield,
								shield_crit: b.bullet.spell?.shield_crit, // Crit thru shield
								shield_stun: b.bullet.spell?.shield_stun, // stun thru shield
								shield_freeze: b.bullet.spell?.shield_freeze, // freeze thru shield
								shield_bind: b.bullet.spell?.shield_bind, // bind thru shield
								shield_snare: b.bullet.spell?.shield_snare, // snare thru shield
								shield_slow: b.bullet.spell?.shield_slow, // slow thru shield
								shield_distract: b.bullet.spell?.shield_distract, // Distract thru shield
								shield_vuln: b.bullet.spell?.shield_vuln, // Vuln thru shield
								tease: b.bullet.spell?.tease,
								addBind: b.bullet.spell?.addBind,
								damage:b.bullet.spell.power, type:b.bullet.spell.damage, bind: b.bullet.spell.bind, crit: b.bullet.spell.crit, bindcrit: b.bullet.spell.bindcrit, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time,
								distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, desireMult: b.bullet.spell.desireMult, bindEff: b.bullet.spell.bindEff,
							}, lifetime: b.bullet.spell.lifetime + LifetimeBonus, name:b.bullet.name+"Hit", width:1, height:1}};
					KDMapData.Bullets.push(newB);

					if (data.noise) {
						KinkyDungeonMakeNoise(data.noise, b.x, b.y);
					}
					KinkyDungeonUpdateSingleBulletVisual(newB, false, dd);
				}
			}

	} else if (b.bullet.hit == "heal") {
		let newB = {born: born, time:b.bullet.spell.lifetime, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
			ox: b.x, oy: b.y,
			bullet:{faction: b.bullet.faction, spell:b.bullet.spell, bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin,
				hitevents: b.bullet.spell.hitevents,
				source: b.bullet.source,
				damage: {
					damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage,
					ignoreshield: b.bullet.spell?.ignoreshield,
					shield_crit: b.bullet.spell?.shield_crit, // Crit thru shield
					shield_stun: b.bullet.spell?.shield_stun, // stun thru shield
					shield_freeze: b.bullet.spell?.shield_freeze, // freeze thru shield
					shield_bind: b.bullet.spell?.shield_bind, // bind thru shield
					shield_snare: b.bullet.spell?.shield_snare, // snare thru shield
					shield_slow: b.bullet.spell?.shield_slow, // slow thru shield
					shield_distract: b.bullet.spell?.shield_distract, // Distract thru shield
					shield_vuln: b.bullet.spell?.shield_vuln, // Vuln thru shield
					tease: b.bullet.spell?.tease,
					addBind: b.bullet.spell?.addBind,
					distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, desireMult: b.bullet.spell.desireMult, bindEff: b.bullet.spell.bindEff,
					bind: b.bullet.spell.bind, crit: b.bullet.spell.crit, bindcrit: b.bullet.spell.bindcrit, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time
				}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KDMapData.Bullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false);

		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}

		if (b.bullet.spell && (b.bullet.spell.playerEffect || b.bullet.playerEffect) && AOECondition(b.x, b.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, b.spell.aoe, KDBulletAoEMod(b))) {
			KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, b.bullet.damage.type, b.bullet.playerEffect ? b.bullet.playerEffect : b.bullet.spell.playerEffect, b.bullet.spell, b.bullet.faction, b);
		}
		for (let enemy of KDMapData.Entities) {
			if ((b.reflected
				|| (!b.bullet.spell || !b.bullet.faction
					|| (!KDFactionHostile(b.bullet.faction, enemy))
				))
				&& ((enemy.x == b.x && enemy.y == b.y) || (b.bullet.spell && b.bullet.spell.aoe &&
					AOECondition(b.x, b.y, enemy.x, enemy.y, b.bullet.spell.aoe, KDBulletAoEMod(b))))) {
				let origHP = enemy.hp;
				enemy.hp = Math.min(enemy.hp + b.bullet.spell.power, enemy.Enemy.maxhp);
				//KDDamageQueue.push({floater: `+${Math.round((enemy.hp - origHP) * 10)}`, Entity: enemy, Color: "#ffaa00", Time: 3});
				if (b.bullet.faction == "Player" || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0)
					KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#ffaa00", KDToggles.FastFloaters ? 1 : 3);
				if (b.bullet.faction == "Player")
					KDHealRepChange(enemy, enemy.hp - origHP);
			}
		}
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "cast" && b.bullet.spell && b.bullet.spell.spellcasthit) {
		let cast = b.bullet.spell.spellcasthit;
		let rad = (b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0;
		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}
		if (cast.countPerCast) {
			for (let cc = 0; cc < cast.countPerCast; cc++) {
				let spell = KinkyDungeonFindSpell(cast.spell, true);
				let xx = b.x + Math.round(rad * (1 - 2*KDRandom()));
				let yy = b.y + Math.round(rad * (1 - 2*KDRandom()));
				KinkyDungeonCastSpell(xx, yy, spell, undefined, undefined, b);
			}
		} else {
			for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
				for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
					if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletAoEMod(b)) && (!cast.chance || KDRandom() < cast.chance)) {
						let spell = KinkyDungeonFindSpell(cast.spell, true);
						let xx = b.x + X;
						let yy = b.y + Y;
						KinkyDungeonCastSpell(xx, yy, spell, undefined, undefined, b);
					}
				}
		}

		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "teleport") {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(b.x, b.y))) {
			let newB = {born: born, time:b.bullet.spell.lifetime, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
				ox: b.x, oy: b.y,
				bullet:{faction: b.bullet.faction, spell:b.bullet.spell,
					source: b.bullet.source,
					bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
					bulletSpin: b.bullet.spell?.hitSpin,
					hitevents: b.bullet.spell.hitevents,
					damage: {
						damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage, boundBonus: b.bullet.spell.boundBonus,
						ignoreshield: b.bullet.spell?.ignoreshield,
						shield_crit: b.bullet.spell?.shield_crit, // Crit thru shield
						shield_stun: b.bullet.spell?.shield_stun, // stun thru shield
						shield_freeze: b.bullet.spell?.shield_freeze, // freeze thru shield
						shield_bind: b.bullet.spell?.shield_bind, // bind thru shield
						shield_snare: b.bullet.spell?.shield_snare, // snare thru shield
						shield_slow: b.bullet.spell?.shield_slow, // slow thru shield
						shield_distract: b.bullet.spell?.shield_distract, // Distract thru shield
						shield_vuln: b.bullet.spell?.shield_vuln, // Vuln thru shield
						tease: b.bullet.spell?.tease,
						addBind: b.bullet.spell?.addBind,
						distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, desireMult: b.bullet.spell.desireMult, bindEff: b.bullet.spell.bindEff,
						bind: b.bullet.spell.bind, crit: b.bullet.spell.crit, bindcrit: b.bullet.spell.bindcrit, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height
				}};
			KDMapData.Bullets.push(newB);
			KinkyDungeonUpdateSingleBulletVisual(newB, false);
			if (data.noise) {
				KinkyDungeonMakeNoise(data.noise, b.x, b.y);
			}

			if (KinkyDungeonEnemyAt(b.x, b.y)) {
				let point = KinkyDungeonGetNearbyPoint(b.x, b.y, true, undefined, false, false);
				if (point) {
					KinkyDungeonSetFlag("teleported", 1);
					let tdata = {
						x: point.x,
						y: point.y,
						cancel: false,
						entity: KDPlayer(),
						willing: true,
					};
					KinkyDungeonSendEvent("beforeTeleport", tdata);
					if (!tdata.cancel) {
						KDMovePlayer(point.x, point.y, false);
						KinkyDungeonSendTextMessage(10, TextGet("KDTeleportNearby"), "#e7cf1a", 2, undefined, undefined, undefined, "Combat");
						KinkyDungeonSendEvent("teleport", tdata);
					} else {
						KinkyDungeonSendTextMessage(10, TextGet("KDTeleportFail"), "#e7cf1a", 2, undefined, undefined, undefined, "Combat");
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SoftShield.ogg");
					}
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDTeleportFail"), "#e7cf1a", 2, undefined, undefined, undefined, "Combat");
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SoftShield.ogg");
				}
			} else {
				KinkyDungeonSetFlag("teleported", 1);
				let tdata = {
					x: b.x,
					y: b.y,
					cancel: false,
					entity: KDPlayer(),
					willing: true,
				};
				KinkyDungeonSendEvent("beforeTeleport", tdata);
				if (!tdata.cancel) {
					KDMovePlayer(b.x, b.y, false);
					KinkyDungeonSendEvent("teleport", tdata);
				} else {
					KinkyDungeonSendTextMessage(10, TextGet("KDTeleportFail"), "#e7cf1a", 2, undefined, undefined, undefined, "Combat");
					KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/SoftShield.ogg");
				}
			}


			//KinkyDungeonMoveTo(b.x, b.y, true);
		}
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "summon") {
		if (data.noise) {
			KinkyDungeonMakeNoise(data.noise, b.x, b.y);
		}
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	}

	if (b.bullet.summon && b.bullet.summon) {
		let created = 0;
		let type = "";
		for (let sum of b.bullet.summon) {
			if (!sum.chance || KDRandom() < sum.chance) {
				let summonType = sum.name; // Second operand is the enemy type
				if (!type) type = summonType;
				let count = sum.count ? sum.count : 1;
				let rad = (b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0;
				if (count > 0) {
					let faction = (b.bullet.spell && b.bullet.spell.defaultFaction) ? undefined : b.bullet.faction;
					//if (!faction && b.bullet.spell && b.bullet.spell.enemySpell) faction = "Enemy";
					//else
					if (!faction && b.bullet.spell && b.bullet.spell.allySpell) faction = "Player";

					if (b.bullet.faction) faction = b.bullet.faction;
					if (sum.faction) faction = sum.faction;
					let e = KinkyDungeonSummonEnemy(b.x, b.y,
						summonType, count, rad, sum.strict,
						sum.time ? sum.time : undefined, sum.hidden,
						sum.goToTarget, faction, faction && KDFactionRelation("Player", faction) <= -0.5,
						sum.minRange, sum.aware, undefined, sum.hideTimer, undefined,
						KDBulletAoEMod(b), sum.bound ? b.bullet.source : undefined, sum.weakBinding, sum.teleportTime,
						b.ox, b.oy,
					);
					created += e.length;
				}
			}
		}
		if (!b.bullet.spell || !b.bullet.spell.noSumMsg) {
			if (created == 1) KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSummonSingle"+type), "white", 2, undefined, undefined, b, "Combat");
			else if (created > 1) KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonSummonMulti"+type).replace("SummonCount", "" + created), "white", 3, undefined, undefined, b, "Combat");
		}
	}


	KinkyDungeonSendEvent("afterBulletHit", data);
}


/**
 * @param x
 * @param y
 * @param summonType
 * @param count
 * @param rad
 * @param [strict]
 * @param [lifetime]
 * @param [hidden]
 * @param [goToTarget]
 * @param [faction]
 * @param [hostile]
 * @param [minrad]
 * @param [startAware]
 * @param [noBullet]
 * @param [hideTimer]
 * @param [pathfind]
 * @param [mod]
 * @param [boundTo]
 * @param [weakBinding]
 * @param [teleportTime]
 * @param [ox]
 * @param [oy]
 */
function KinkyDungeonSummonEnemy (
	x:              number,
	y:              number,
	summonType:     string | enemy,
	count:          number,
	rad:            number,
	strict?:        boolean,
	lifetime?:      number,
	hidden?:        boolean,
	goToTarget?:    boolean,
	faction?:       string,
	hostile?:       boolean,
	minrad?:        number,
	startAware?:    boolean,
	noBullet?:      boolean,
	hideTimer?:     boolean,
	pathfind?:      boolean,
	mod?:           string,
	boundTo?:       number,
	weakBinding?:   boolean,
	teleportTime?:  number,
	ox?:            number,
	oy?:            number
): entity[]
{
	let slots = [];
	for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
		for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
			if (AOECondition(x, y, x + X, y + Y, rad, mod, ox, oy) && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
				if ((x + X > 0 && y + Y > 0 && x + X < KDMapData.GridWidth && y + Y < KDMapData.GridHeight))
					slots.push({x:X, y:Y});
			}
		}

	if (slots.length == 0) return [];
	let created = [];
	let maxcounter = 0;
	let Enemy = KinkyDungeonGetEnemyByName(summonType);
	for (let C = 0; C < count && (KDMapData.Entities.length < 300 || faction == "Player" || faction == "Ambush" || faction == "Prisoner") && maxcounter < count * 30; C++) {
		let slot = slots[Math.floor(KDRandom() * slots.length)];
		if (Enemy && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x+slot.x, y+slot.y))
			&& (KinkyDungeonNoEnemy(x+slot.x, y+slot.y, true) || (KinkyDungeonNoEnemy(x+slot.x, y+slot.y, false) && Enemy.noblockplayer && KDistChebyshev(x+slot.x - KinkyDungeonPlayerEntity.x, y+slot.y - KinkyDungeonPlayerEntity.y) < 1.5))
			&& (!strict || KinkyDungeonCheckPath(x, y, x+slot.x, y+slot.y, false))
			&& (!hidden || (KinkyDungeonVisionGet(x+slot.x, y+slot.y) < 1))) {
			let path = (hidden || pathfind) ? KinkyDungeonFindPath(
				x+slot.x, y+slot.y,
				goToTarget ? KinkyDungeonTargetX : x, goToTarget ? KinkyDungeonTargetY : y,
				false, false,
				false, Enemy.tags.opendoors ? KinkyDungeonMovableTilesSmartEnemy : KinkyDungeonMovableTilesEnemy,
			) : null;

			if ((!hidden && !pathfind) || path) {
				let e: entity = {summoned: true, boundTo: boundTo, weakBinding: weakBinding, faction: faction, hostile: hostile ? 100 : undefined, hideTimer: hideTimer, rage: Enemy.summonRage ? 9999 : undefined, Enemy: Enemy,
					id: KinkyDungeonGetEnemyID(), gx: goToTarget ? KinkyDungeonTargetX : undefined, gy: goToTarget ? KinkyDungeonTargetY : undefined, ambushtrigger: startAware,
					x:x+slot.x, y:y+slot.y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, shield: Enemy.shield, movePoints: 0, attackPoints: 0, lifetime: lifetime, maxlifetime: lifetime, path: path};
				KDProcessCustomPatron(Enemy, e, 0);
				if (teleportTime) {
					e.teleporting = teleportTime;
					e.teleportingmax = teleportTime;
				}
				KDAddEntity(e);
				if (!noBullet) {
					let spell = KinkyDungeonFindSpell("Summon", true);
					if (spell) {
						KinkyDungeonCastSpell(e.x, e.y, spell, undefined, undefined, undefined);
					}
				}
				if (startAware) {
					e.vp = 2;
					e.aware = true;
				}
				if (e.Enemy.tags?.defensive) KinkyDungeonSetEnemyFlag(e, "Defensive", -1);
				created.push(e);
			}
		} else C -= 1;
		maxcounter += 1;
	}
	return created;
}

function KinkyDungeonBulletDoT(b: any) {
	KinkyDungeonBulletHit(b, 1.1);
}

function KinkyDungeonBulletTrail(b: any): boolean {
	let avoidPoint = b.bullet.spell.noTrailOnPlayer ? {x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y} : null;
	let trail = false;
	if (b.bullet.spell.trail) {
		if (b.bullet.spell.trail == "lingering" && !b.bullet.trail) {
			let aoe = b.bullet.spell.trailspawnaoe ? b.bullet.spell.trailspawnaoe : 0.0;
			let rad = Math.ceil(aoe/2);
			for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
				for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
					if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletTrailAoEMod(b)) && KDRandom() < b.bullet.spell.trailChance && (!avoidPoint || avoidPoint.x != X + b.x || avoidPoint.y != Y + b.y)) {
						trail = true;
						let newB = {born: 0, time:b.bullet.spell.trailLifetime + (b.bullet.spell.trailLifetimeBonus ? Math.floor(KDRandom() * b.bullet.spell.trailLifetimeBonus) : 0), x:b.x + X, y:b.y + Y, vx:0, vy:0, xx:b.x + X, yy:b.y + Y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Trail" + CommonTime(),
							bullet:{faction: b.bullet.faction, trail: true, hit: b.bullet.spell.trailHit, spell:b.bullet.spell, playerEffect:b.bullet.spell.trailPlayerEffect,
								source: b.bullet.source,
								bulletColor: b.bullet.spell?.trailColor, bulletLight: b.bullet.spell?.trailLight,
								hitevents: b.bullet.spell.hitevents,
								bulletSpin: b.bullet.spell?.hitSpin, damage: {

									evadeable: b.bullet.spell.trailEvadeable, noblock: b.bullet.spell.trailNoBlock,
									damage:b.bullet.spell.trailPower, type:b.bullet.spell.trailDamage, boundBonus: b.bullet.spell.boundBonus,
									ignoreshield: b.bullet.spell?.ignoreshield,
									shield_crit: b.bullet.spell?.shield_crit, // Crit thru shield
									shield_stun: b.bullet.spell?.shield_stun, // stun thru shield
									shield_freeze: b.bullet.spell?.shield_freeze, // freeze thru shield
									shield_bind: b.bullet.spell?.shield_bind, // bind thru shield
									shield_snare: b.bullet.spell?.shield_snare, // snare thru shield
									shield_slow: b.bullet.spell?.shield_slow, // slow thru shield
									shield_distract: b.bullet.spell?.shield_distract, // Distract thru shield
									shield_vuln: b.bullet.spell?.shield_vuln, // Vuln thru shield
									tease: b.bullet.spell?.tease,
									addBind: b.bullet.spell?.addBind,
									distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, desireMult: b.bullet.spell.desireMult, bindEff: b.bullet.spell.bindEff,
									bind: b.bullet.spell.trailBind, crit: b.bullet.spell.crit, bindcrit: b.bullet.spell.bindcrit, bindType: b.bullet.spell.bindType, time:b.bullet.spell.trailTime}, lifetime: b.bullet.spell.trailLifetime, name:b.bullet.name+"Trail", width:1, height:1}};
						KDMapData.Bullets.push(newB);
						KinkyDungeonUpdateSingleBulletVisual(newB, false);
					}
				}
		} else if (b.bullet.spell.trail == "cast" && !b.bullet.trail && b.bullet.spell && b.bullet.spell.trailcast) {
			let aoe = b.bullet.spell.trailspawnaoe ? b.bullet.spell.trailspawnaoe : 0.0;
			let rad = Math.ceil(aoe/2);
			for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
				for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
					if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletTrailAoEMod(b)) && KDRandom() < b.bullet.spell.trailChance && (!avoidPoint || avoidPoint.x != X + b.x || avoidPoint.y != Y + b.y)) {
						trail = true;
						let cast = b.bullet.spell.trailcast;
						let spell = KinkyDungeonFindSpell(cast.spell, true);
						if (spell) {
							KinkyDungeonCastSpell(b.x + X, b.y + Y, spell, undefined, undefined, b);
						}
					}
				}
		}
	}
	if (b.bullet.effectTileTrail) {
		KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTileTrail, b.bullet.effectTileDurationModTrail, (b.bullet.spell.effectTileTrailAoE) ? b.bullet.spell.effectTileTrailAoE : 0.5, avoidPoint, b.bullet.spell.effectTileDensityTrail, KDBulletTrailAoEMod(b));
	}
	return trail;
}

function KinkyDungeonBulletsCheckCollision(bullet: any, AoE: boolean, force: boolean, d: number, inWarningOnly?: boolean, _delta?: number) {
	let mapItem = KinkyDungeonMapGet(bullet.x, bullet.y);
	if (bullet.vx || bullet.vy) // Moving projectiles get blocked by grates and walls, but not still objects
		if (!bullet.bullet.passthrough && !bullet.bullet.piercing && !KinkyDungeonOpenObjects.includes(mapItem)) return false;

	KDBulletEffectTiles(bullet);

	if (bullet.bullet.noEnemyCollision && !(bullet.bullet && bullet.bullet.alwaysCollideTags)) return true;

	if (bullet.delay && !d) d = bullet.delay;

	let hitEnemy = false;
	if (bullet.bullet.damage && (bullet.time > 0 || force)) {
		if ((AoE || (bullet.vx != 0 || bullet.vy != 0))) { // Moving bullets always have a chance to hit, while AoE only has a chance to hit when AoE is explicitly being checked
			if (bullet.bullet.aoe ? KDBulletAoECanHitEntity(bullet, KinkyDungeonPlayerEntity) : KDBulletCanHitEntity(bullet, KinkyDungeonPlayerEntity, inWarningOnly)) {
				if (!bullet.bullet.spell || bullet.born < 1 || (bullet.vx == 0 && bullet.vy == 0) || bullet.bullet.spell.enemySpell) { // Projectiles just born cant hurt you, unless they're enemy projectiles
					//if (!(!bullet.secondary && bullet.bullet.spell && bullet.bullet.spell.noDirectDamage))
					KDBulletHitPlayer(bullet, KinkyDungeonPlayerEntity);
					hitEnemy = true;
				}
			}
			let nomsg = bullet.bullet && bullet.bullet.spell && bullet.bullet.spell.enemyspell && !bullet.reflected;
			for (let enemy of KDMapData.Entities) {
				let overrideCollide = !bullet.bullet.aoe ? false : (bullet.bullet.spell && bullet.bullet.alwaysCollideTags && bullet.bullet.alwaysCollideTags.some((tag: string) => {return enemy.Enemy.tags[tag];}));
				if (bullet.bullet.aoe ? KDBulletAoECanHitEntity(bullet, enemy) : KDBulletCanHitEntity(bullet, enemy, inWarningOnly, overrideCollide)) {
					//if (!(!bullet.secondary && bullet.bullet.spell && bullet.bullet.spell.noDirectDamage)) {
					KDBulletHitEnemy(bullet, enemy, d, nomsg);
					nomsg = true;
					//}
					hitEnemy = true;
				}
			}

			KDUpdateBulletEffects(bullet, d);

		}
	}
	if (!bullet.bullet.aoe && hitEnemy) return false;

	if (!(bullet.bullet.block > 0) && (bullet.vx != 0 || bullet.vy != 0 || bullet.bullet.volatile)) {
		for (let b2 of KDMapData.Bullets) {
			if (b2 != bullet && b2.bullet.block > 0 && b2.x == bullet.x && b2.y == bullet.y) {
				if (!b2.bullet.blockType || b2.bullet.blockType.includes(bullet.bullet.damage?.type)) {
					b2.bullet.block -= bullet.bullet.damage.damage;
					if (b2.bullet.block <= 0) b2.bullet.block = -1;

					//if (bullet.bullet.volatile) bullet.time = 0;
					return false;
				}
			}
		}
	} else if (bullet.bullet.block == -1) {
		//if (bullet.bullet.volatile) bullet.time = 0;
		return false; // Shields expire
	}

	if (bullet.bullet.lifetime == -1) return false; // Instant spells

	if (!bullet.bullet.passthrough && !KinkyDungeonOpenObjects.includes(mapItem)) return false;
	return true;
}

function KDBulletAoECanHitEntity(bullet: any, enemy: entity): boolean {
	if (enemy.player) {
		return (bullet.bullet.spell && (bullet.bullet.spell.playerEffect || bullet.bullet.playerEffect)
			&& AOECondition(bullet.x, bullet.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, bullet.bullet.aoe || 0.5, KDBulletAoEMod(bullet)))
			&& (!bullet.bullet.spell || !bullet.bullet.spell.noUniqueHits || !KDUniqueBulletHits.get(KDBulletID(bullet, KinkyDungeonPlayerEntity)));
	} else {
		return (bullet.reflected
			|| (!bullet.bullet.spell || !bullet.bullet.faction
				|| (!KDFactionFavorable(bullet.bullet.faction, enemy) && (!bullet.bullet.damage || bullet.bullet.damage.type != "heal"))
				|| (!KDFactionHostile(bullet.bullet.faction, enemy) && (bullet.bullet.damage && bullet.bullet.damage.type == "heal"))
			))
				&& AOECondition(bullet.x, bullet.y, enemy.x, enemy.y, bullet.bullet.aoe || 0.5, KDBulletAoEMod(bullet))
				&& (!bullet.bullet.spell || !bullet.bullet.spell.noUniqueHits || !KDUniqueBulletHits.get(KDBulletID(bullet, enemy)));
	}
}
function KDBulletCanHitEntity(bullet: any, enemy: entity, inWarningOnly?: boolean, overrideCollide?: boolean): boolean {
	if (enemy.player) {
		return bullet.bullet.spell && (bullet.bullet.spell.playerEffect || bullet.bullet.playerEffect)
			&& (!bullet.bullet.noEnemyCollision || (bullet.bullet.spell && bullet.bullet.alwaysCollideTags && bullet.bullet.alwaysCollideTags.includes("PlayerChar")))
			&& KinkyDungeonPlayerEntity.x == bullet.x && KinkyDungeonPlayerEntity.y == bullet.y
			&& (!inWarningOnly || (bullet.warnings && bullet.warnings.includes(KinkyDungeonPlayerEntity.lastx + "," + KinkyDungeonPlayerEntity.lasty)))
			&& (!bullet.bullet.spell || !bullet.bullet.spell.noUniqueHits || !KDUniqueBulletHits.get(KDBulletID(bullet, KinkyDungeonPlayerEntity)));
	} else {
		return (enemy.x == bullet.x && enemy.y == bullet.y) && (bullet.reflected || overrideCollide
			|| (!bullet.bullet.spell || !bullet.bullet.faction
				|| (!KDFactionFavorable(bullet.bullet.faction, enemy) && (!bullet.bullet.damage || bullet.bullet.damage.type != "heal"))
				|| (!KDFactionHostile(bullet.bullet.faction, enemy) && (bullet.bullet.damage && bullet.bullet.damage.type == "heal"))
			))
				&& (!bullet.bullet.noEnemyCollision || overrideCollide)
				&& (!inWarningOnly || (bullet.warnings && bullet.warnings.includes(enemy.lastx + "," + enemy.lasty)))
				&& (!bullet.bullet.spell || !bullet.bullet.spell.noUniqueHits || !KDUniqueBulletHits.get(KDBulletID(bullet, enemy)));
	}
}

function KDBulletEffectTiles(bullet: any) {
	if (bullet.bullet.spell && bullet.bullet.spell.type == "dot") {
		if (bullet.bullet.spell.effectTileDoT) {
			KDCreateAoEEffectTiles(bullet.x, bullet.y, bullet.bullet.spell.effectTileDoT, bullet.bullet.spell.effectTileDurationModDoT,
				(bullet.bullet.spell.effectTileDistDoT ? bullet.bullet.spell.effectTileDistDoT : (bullet.bullet.spell.effectTileAoE ? bullet.bullet.spell.effectTileAoE : ((bullet.bullet.spell.aoe) ? bullet.bullet.spell.aoe : 0.5))), undefined, bullet.bullet.spell.effectTileDensityDoT, KDBulletAoEMod(bullet));
		}
		if (bullet.bullet.spell.effectTileDoT2) {
			KDCreateAoEEffectTiles(bullet.x, bullet.y, bullet.bullet.spell.effectTileDoT2, bullet.bullet.spell.effectTileDurationModDoT,
				(bullet.bullet.spell.effectTileDistDoT ? bullet.bullet.spell.effectTileDistDoT : (bullet.bullet.spell.effectTileAoE ? bullet.bullet.spell.effectTileAoE : ((bullet.bullet.spell.aoe) ? bullet.bullet.spell.aoe : 0.5))), undefined, bullet.bullet.spell.effectTileDensityDoT, KDBulletAoEMod(bullet));
		}
	}

	if (bullet.bullet.effectTileLinger) {
		if (bullet.bullet.effectTileLinger) {
			KDCreateEffectTile(bullet.x, bullet.y, bullet.bullet.effectTileLinger, bullet.bullet.effectTileDurationModLinger);
		}
	}
}

function KDBulletHitPlayer(bullet: any, player: entity) {
	let pf = bullet.bullet.playerEffect ? bullet.bullet.playerEffect : bullet.bullet.spell.playerEffect;
	if (pf) {
		KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, bullet.bullet.damage.type, pf, bullet.bullet.spell, bullet.bullet.faction, bullet);
		KDUniqueBulletHits.set(KDBulletID(bullet, player), true);
	}
}



/**
 * @param bullet
 * @param enemy
 * @param d
 * @param nomsg
 */
function KDBulletHitEnemy(bullet: any, enemy: entity, d: number, nomsg: boolean) {
	KinkyDungeonSendEvent("bulletHitEnemy", {bullet: bullet, enemy: enemy});
	KDUniqueBulletHits.set(KDBulletID(bullet, enemy), true);
	if (bullet.bullet.damage.type == "heal") {
		let origHP = enemy.hp;
		enemy.hp = Math.min(enemy.hp + bullet.bullet.spell.power, enemy.Enemy.maxhp);
		if (bullet.bullet.faction == "Player" || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0)
			KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#ffaa00", KDToggles.FastFloaters ? 1 : 3);
		if (bullet.bullet.faction == "Player")
			KDHealRepChange(enemy, enemy.hp - origHP);
	} else //if (bullet.bullet.faction == "Player" || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0)
	{
		// Avoid damaging the enemy if its a no direct damage spell
		if (!(!bullet.secondary && bullet.bullet.spell && bullet.bullet.spell.noDirectDamage) && bullet.bullet.damage.type != "inert")
			KinkyDungeonDamageEnemy(enemy, bullet.bullet.damage, true, nomsg, bullet.bullet.spell, bullet, undefined, d);

		// Apply whatever it would apply to the player
		let pf = bullet.bullet.playerEffect ? bullet.bullet.playerEffect : bullet.bullet.spell.playerEffect;
		if ((bullet.bullet.damage.bindTags || bullet.bullet.spell.bindTags)
			|| bullet.bullet.damage.bindType || bullet.bullet.spell.bindType || pf)
			if (pf) {
				let tags =
					(bullet.bullet.damage.bindTags
						|| bullet.bullet.spell.bindTags
						|| (pf?.tag ? [pf.tag] : undefined)
						|| pf?.tags
					)
					|| KDGetBulletBindingTags(bullet.bullet.damage.bindType
						|| bullet.bullet.spell.bindType, pf, false);
				if (tags) {
					KDBindEnemyWithTags(enemy.id, tags, bullet.bullet.damage.bind || bullet.bullet.damage.power, (bullet.bullet.spell?.power || 0), !pf?.realBind, undefined, true, true, pf?.count);
				}
			}
	}
}

// Gets ID for unique bullet hits
function KDBulletID(bullet: any, enemy: entity): string {
	if (enemy.player)
		return (bullet.name) + (bullet.bullet.spell) + "_player";
	return (bullet.name) + (bullet.bullet.spell) + "_" + (enemy.id);
}


function KinkyDungeonLaunchBullet(x: number, y: number, targetx: number, targety: number, speed: number, bullet: any, miscast: boolean, ox: number, oy: number): any {
	let direction = (!targetx && !targety) ? 0 : Math.atan2(targety, targetx);
	let vx = (targetx != 0 && targetx != undefined) ? Math.cos(direction) * speed : 0;
	let vy = (targety != 0 && targety != undefined) ? Math.sin(direction) * speed : 0;
	let lifetime = bullet.lifetime;
	if (miscast) {
		vx = 0;
		vy = 0;
		//lifetime = 1;
	}
	let b = {born: 1, time:lifetime, x:x, y:y, vx:vx, vy:vy, xx:x, yy:y, spriteID: KinkyDungeonGetEnemyID() + bullet.name + CommonTime(),
		ox: ox, oy: oy,
		bullet:bullet, trail:bullet.spell.trail, trailEffectTile: bullet.spell.effectTileTrail};
	KDMapData.Bullets.push(b);
	KinkyDungeonUpdateSingleBulletVisual(b, false);
	return b;
}

let KDLastFightDelta = 0;


function KinkyDungeonDrawFight(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number) {
	let delta = CommonTime() - KDLastFightDelta;
	KDLastFightDelta = CommonTime();
	for (let damage of KDDamageQueue) {
		if (!damage.Delay || KDTimescale * (performance.now() - KDLastTick) > damage.Delay) {
			if (damage.sfx && KDSoundEnabled()) KinkyDungeonPlaySound(damage.sfx);

			if (damage.floater && !KDToggles.NoDmgFloaters) {
				KinkyDungeonSendFloater(damage.Entity, damage.floater, damage.Color, (KDToggles.FastFloaters ? 0.3 : 1) * damage.Time, undefined, undefined, damage.size);
			}

			KDDamageQueue.splice(KDDamageQueue.indexOf(damage), 1);
		}
	}

	if (KDToggles.ForceWarnings || KDMouseInPlayableArea())
		for (let t of KDBulletWarnings) {
			let scale = t.scale || 0.01;
			if (scale < 1) t.scale = Math.max(0, Math.min(1, (t.scale || 0) + delta * 0.005/KDAnimSpeed));
			else scale = 1;
			let tx = t.x;
			let ty = t.y;
			let txvis = (t.x - t.x_orig)*scale + t.x_orig;
			let tyvis = (t.y - t.y_orig)*scale + t.y_orig;

			if (tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(tx, ty) > 0) {

				KDDraw(kdwarningboardOver, kdpixisprites, tx + "," + ty + "_w" + t.color, KinkyDungeonRootDirectory + "WarningColorSpell.png",
					(txvis - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (tyvis - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
						tint: string2hex(t.color || "#ff5555"),
						zIndex: -0.1,
						alpha: 0.5,
					});
				KDDraw(kdwarningboard, kdpixisprites, tx + "," + ty + "_w_b" + t.color, KinkyDungeonRootDirectory + "WarningBacking.png",
					(txvis - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (tyvis - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
						tint: string2hex(t.color || "#ff5555"),
						zIndex: -0.2,
						alpha: 0.5,
					});
				KDDraw(kdwarningboard, kdpixisprites, tx + "," + ty + "_w_b_h", KinkyDungeonRootDirectory + "WarningBackingHighlight" + ".png",
					(txvis - CamX+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay, (tyvis - CamY+0.5-0.5*scale)*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay*scale, KinkyDungeonGridSizeDisplay*scale, undefined, {
						zIndex: -0.21,
						alpha: 0.5,
					});
			}
		}

	for (let bullet of KinkyDungeonBulletsVisual.values()) {
		if (!bullet.delay || KDTimescale * (performance.now() - KDLastTick) > bullet.delay) {
			let sprite = bullet.name;

			let dd = KinkyDungeonUpdateVisualPosition(bullet, KinkyDungeonDrawDelta);
			let tx = bullet.visual_x;
			let ty = bullet.visual_y;
			let scale = bullet.scale != undefined ? bullet.scale : 1.0;
			let alpha = bullet.alpha != undefined ? bullet.alpha : 1.0;
			let aoe = bullet.aoe ? Number(bullet.aoe) : 3;

			if (KDBulletTransparency) {
				if (bullet.vx || bullet.vy) {
					alpha *= 0.7;
				} else {
					alpha *= 0.1;
				}
			}

			if ((bullet.end) && dd == 0 && (!bullet.scale || bullet.scale <= 0.0)) {
				KinkyDungeonBulletsVisual.delete(bullet.spriteID);
			} else if (bullet.xx >= CamX && bullet.yy >= CamY && bullet.xx < CamX + KinkyDungeonGridWidthDisplay && bullet.yy < CamY + KinkyDungeonGridHeightDisplay
				&& (KinkyDungeonVisionGet(Math.round(tx), Math.round(ty)) > 0 || KDistChebyshev(tx - KinkyDungeonPlayerEntity.x, ty - KinkyDungeonPlayerEntity.y) < aoe) && alpha > 0) {

				if (!bullet.end && bullet.temporary && alpha >= 1.0 && scale >= 1.0) {
					bullet.end = true;
				}

				KDDraw(kdbulletboard, kdpixisprites, bullet.spriteID, KinkyDungeonRootDirectory + "Bullets/" + sprite + ".png",
					(tx - CamX + 0.5)*KinkyDungeonGridSizeDisplay,
					(ty - CamY + 0.5)*KinkyDungeonGridSizeDisplay,
					bullet.size*scale*KinkyDungeonGridSizeDisplay,
					bullet.size*scale*KinkyDungeonGridSizeDisplay,
					(!bullet.vy && !bullet.vx) ? KDAnimQuantize(Math.PI/3 * (bullet.spin || 1), bullet.spinAngle) : KDAnimQuantize(Math.PI/3 * (bullet.spin || 1), bullet.spinAngle) + Math.atan2(bullet.vy, bullet.vx), {
						alpha : alpha,
						zIndex: (bullet.zIndex || 0),
					}, true);
			}
			bullet.delay = undefined;
		}
	}
}

function KinkyDungeonSendWeaponEvent(Event: string, data: any) {
	if (!KDMapHasEvent(KDEventMapWeapon, Event)) return;
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.events) {
		for (let e of KinkyDungeonPlayerDamage.events) {
			if (e.trigger == Event && !e.offhandonly && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
				KinkyDungeonHandleWeaponEvent(Event, e, KinkyDungeonPlayerDamage, data);
			}
		}
	}
	if (KDGameData.Offhand
		&& KinkyDungeonInventoryGetWeapon(KDGameData.Offhand)) {
		let weapon = KDWeapon(KinkyDungeonInventoryGetWeapon(KDGameData.Offhand));
		if (KinkyDungeonInventoryGetWeapon(KDGameData.Offhand).events) {
			for (let e of KinkyDungeonInventoryGetWeapon(KDGameData.Offhand).events) {
				if (e.trigger == Event && e.offhand && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
					KinkyDungeonHandleWeaponEvent(Event, e, KDWeapon(weapon), data);
				}
			}
		}
		for (let e of weapon.events) {
			if (e.trigger == Event && e.offhand && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
				KinkyDungeonHandleWeaponEvent(Event, e, KDWeapon(weapon), data);
			}
		}
	}
}

function KinkyDungeonSendBulletEvent(Event: string, b: any, data: any) {
	if (!KDMapHasEvent(KDEventMapBullet, Event)) return;
	if (b && b.bullet) {
		if (b.bullet.events)
			for (let e of b.bullet.events) {
				if (e.trigger == Event) {
					KinkyDungeonHandleBulletEvent(Event, e, b, data);
				}
			}

		if (b.bullet.hitevents) {
			for (let e of b.bullet.hitevents) {
				if (e.trigger == Event) {
					KinkyDungeonHandleBulletEvent(Event, e, b, data);
				}
			}
		}
	} else {
		for (let bb of KDMapData.Bullets) {
			if (bb.bullet?.events)
				for (let e of bb.bullet.events) {
					if (e.trigger == Event) {
						KinkyDungeonHandleBulletEvent(Event, e, bb, data);
					}
				}
			if (bb.bullet?.hitevents)
				for (let e of bb.bullet.hitevents) {
					if (e.trigger == Event) {
						KinkyDungeonHandleBulletEvent(Event, e, bb, data);
					}
				}
		}
	}

}


function KDHealRepChange(enemy: entity, amount: number) {
	// De-aggro an enemy if you heal them to full
	if (enemy.hostile && amount > 0) {
		if (enemy.hp >= enemy.Enemy.maxhp - 0.5) {
			enemy.hostile = 0;
		}
	} else if ((!enemy.allied || enemy.allied <= 400) && amount > 0) {
		// Befriend enemies if you save them
		if (enemy.hp <= 0.25 * enemy.Enemy.maxhp && enemy.allied <= 400) {
			enemy.allied = 400;
		} else if (enemy.allied < 15) enemy.allied = 15;
	}
	// Raise rep based on amount
	let amountRep = amount * 0.001;
	if (KDHostile(enemy)) amountRep *= 0.5;
	else if (KDFactionRelation("Player", KDGetFactionOriginal(enemy)) > 0.45) amountRep *= 0;
	else if (KDFactionRelation("Player", KDGetFactionOriginal(enemy)) > 0.35) amountRep *= 0.25;
	else if (KDFactionRelation("Player", KDGetFactionOriginal(enemy)) > 0.25) amountRep *= 0.5;
	if (amountRep > 0 && !KinkyDungeonHiddenFactions.has(KDGetFactionOriginal(enemy))) {
		if (amountRep > 0.01) amountRep = 0.01;
		KinkyDungeonChangeFactionRep(KDGetFactionOriginal(enemy), amountRep);
	}
}

function KDApplyGenBuffs(entity: entity, buff: string, time: number) {
	let buffs = KDBuffReference[buff];
	if (buffs && entity) {
		for (let b of buffs) {
			let newBuff = Object.assign({}, b);
			if (newBuff && time) newBuff.duration = time;
			KinkyDungeonApplyBuffToEntity(entity, newBuff);
		}
	}
}

function KDSilenceEnemy(enemy: entity, time: number) {
	if (!enemy.Enemy?.tags?.silenceimmune) {
		if (enemy.Enemy?.tags?.silenceresist) time /= 2;
		else if (enemy.Enemy?.tags?.silenceweakness) time *= 2;
		if (!enemy.silence) enemy.silence = 0;
		enemy.silence = Math.max(time, enemy.silence);
	}
}
function KDBlindEnemy(enemy: entity, time: number) {
	if (!enemy.Enemy?.tags?.blindimmune) {
		if (enemy.Enemy?.tags?.blindresist) time /= 2;
		else if (enemy.Enemy?.tags?.blindweakness) time *= 2;
		if (!enemy.blind) enemy.blind = 0;
		enemy.blind = Math.max(time, enemy.blind);
	}

}
function KDDisarmEnemy(enemy: entity, time: number) {
	if (!enemy.Enemy?.tags?.disarmimmune) {
		if (enemy.Enemy?.tags?.disarmresist) time /= 2;
		else if (enemy.Enemy?.tags?.disarmweakness) time *= 2;
		if (!enemy.disarm) enemy.disarm = 0;
		enemy.disarm = Math.max(time, enemy.disarm);
	}
}

let KDConditions: Record<string, (e: KinkyDungeonEvent, data: any) => boolean> = {
	"DamageTypeTeasing": (_e, data) => {
		return data.damage && KDIsTeasing(data.damage);
	},
	"DamageType": (e, data) => {
		return data.damage && data.damage.type == e.damage;
	},
	"spellType": (e, data) => {
		return data.spell?.tags?.includes(e.kind);
	},
};

function KDCheckCondition(e: KinkyDungeonEvent, data: any): boolean {
	if (!e.condition) return true;
	if (KDConditions[e.condition]) return KDConditions[e.condition](e, data);
	return false;
}

let KDPrereqs: Record<string, (enemy: entity, e: KinkyDungeonEvent, data: any) => boolean> = {
	"HasWill": (_enemy, _e, _data) => {
		return KinkyDungeonStatWill >= 0.1;
	},
	"noCorruption": (_enemy, _e, _data) => {
		return !KinkyDungeonFlags.get("CurseTypeCorruption")
		|| (KinkyDungeonFlags.get("CurseTypeLight") && KinkyDungeonFlags.get("CurseTypeCorruption")
			&& KinkyDungeonFlags.get("CurseTypeLight") > KinkyDungeonFlags.get("CurseTypeCorruption"));
	},
	"AlreadyCursed": (_enemy, e, _data) => {
		if (KinkyDungeonPlayerTags.get("CursedSet")) return false;
		if (e.tags && !KinkyDungeonGetRestraint({tags: [...e.tags],},
			MiniGameKinkyDungeonLevel,
			(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), true, "")) return false;
		for (let inv of KinkyDungeonAllRestraintDynamic()) {
			let item = inv.item;
			if (item.events.some((event) => {return event.trigger == "CurseTransform" && event.kind == "transform";})) return true;
		}
		return false;
	},
	"NoChastity": (enemy, _e, _data) => {return KDEntityBuffedStat(enemy, "Chastity") < 0.01;},
	"blinded": (enemy, _e, _data) => {return enemy.blind > 0;},
	"silenced": (enemy, _e, _data) => {return enemy.silence > 0;},
	"disarmed": (enemy, _e, _data) => {return enemy.disarm > 0;},
	"bound": (enemy, _e, _data) => {return enemy.boundLevel > 0;},
	"Waiting": (enemy, _e, _data) => {return (enemy && !enemy.player) ? enemy.idle : KinkyDungeonLastTurnAction == "Wait";},
	"damageType": (_enemy, e, data) => {
		switch (e.kind) {
			case "melee": return KinkyDungeonMeleeDamageTypes.includes(data.Damage?.type);
			case "magic": return !KinkyDungeonMeleeDamageTypes.includes(data.Damage?.type);
		}
		return data.Damage?.type == 'e.kind';
	},
	"wepDamageType": (_enemy, e, data) => {
		switch (e.kind) {
			case "melee": return KinkyDungeonMeleeDamageTypes.includes(KinkyDungeonPlayerDamage?.type);
			case "magic": return !KinkyDungeonMeleeDamageTypes.includes(KinkyDungeonPlayerDamage?.type);
		}
		return data.Damage?.type == 'e.kind';
	},
	"afterAmbush": (enemy, _e, _data) => {
		return !enemy?.ambushtrigger;
	},
	"HaveDildoBatPlus": (_enemy, _e, _data) => {
		return KinkyDungeonPlayerWeapon == "DildoBatPlus";
	},
	"LightLoad": (_enemy, e, _data) => {
		if (e.requireEnergy && KDGameData.AncientEnergyLevel < e.energyCost) return false;
		return !(
			KinkyDungeonLastAction == "Attack"
			|| KinkyDungeonLastAction == "Cast"
			|| KinkyDungeonLastAction == "Struggle");
	},
	"HeavyLoad": (_enemy, e, _data) => {
		if (e.requireEnergy && KDGameData.AncientEnergyLevel < e.energyCost) return false;
		return !(
			KinkyDungeonLastAction == "Attack"
			|| KinkyDungeonLastAction == "Move"
			|| KinkyDungeonLastAction == "Cast"
			|| KinkyDungeonLastAction == "Struggle");
	},
	"Loaded": (_enemy, _e, _data) => { // Really crude code
		return KinkyDungeonPlayerBuffs
			&& KinkyDungeonPlayerBuffs[KinkyDungeonPlayerDamage.name + "Load"]
			&& KinkyDungeonPlayerBuffs[KinkyDungeonPlayerDamage.name + "Load"].aura == undefined;
	},
};
function KDCheckPrereq(enemy: entity, prereq?: string, e?: KinkyDungeonEvent, data?: any): boolean {
	if (!prereq) return true;
	if (KDPrereqs[prereq]) return KDPrereqs[prereq](enemy, e, data);
	return false;
}

function KDBulletAoEMod(b: any) {
	return b?.bullet?.aoetype || b?.bullet?.spell?.aoetype;
}
function KDBulletTrailAoEMod(b: any) {
	return b?.bullet?.aoetypetrail || b?.bullet?.spell?.aoetypetrail;
}

/**
 * @param bx
 * @param by
 * @param xx
 * @param yy
 * @param rad
 * @param [modifier]
 * @param [originx]
 * @param [originy]
 */
function AOECondition(bx: number, by: number, xx: number, yy: number, rad: number, modifier: string = "", originx?: number, originy?: number): boolean {
	if (!originx) originx = bx;
	if (!originy) originx = by;
	switch (modifier) {
		case "vert":
			if (bx != xx) return false;
			break;
		case "horiz":
			if (by != yy) return false;
			break;
		case "cross":
			if (by != yy && bx != xx) return false;
			break;
		case "box":
			return KDistChebyshev(bx - xx, by - yy) <= rad;
	}
	if (KDAOETypes[modifier]) return KDAOETypes[modifier](bx, by, xx, yy, rad, modifier, originx, originy);
	return KDistEuclidean(bx - xx, by - yy) <= rad;
}

/**
 * @param xx
 * @param yy
 * @param name
 */
function KDCreateParticle(xx: number, yy: number, name: string) {
	let newB = {born: 0, time:2, x:Math.round(xx), y:Math.round(yy), vx:0, vy:0, xx:xx, yy:yy, spriteID: KinkyDungeonGetEnemyID() + name + CommonTime(),
		ox: xx, oy: yy,
		bullet:{faction: "Rage", spell:undefined, damage: undefined, lifetime: 2, passthrough:true, name:name, width:1, height:1}};
	KDMapData.Bullets.push(newB);
	KinkyDungeonUpdateSingleBulletVisual(newB, false);
}

function KDIsTeasing(Damage: any): boolean {
	return Damage && (Damage.tease || KinkyDungeonTeaseDamageTypes.includes(Damage.type));
}

/**
 * @param x
 * @param y
 * @param aoe
 * @param Damage
 * @param [Attacker]
 */
function KDDealEnvironmentalDamage(x: number, y: number, aoe: number, Damage: any, Attacker?: entity) {
	for (let enemy of KDNearbyEnemies(x, y, aoe)) {
		KinkyDungeonDamageEnemy(enemy, Damage, true, true, undefined, undefined, Attacker, 0.1);
	}
	if (KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y) {
		KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, Damage.type, {name: "EnvDamage", power: Damage.damage, damage: Damage.type, flags: ["EnvDamage"]}, undefined, KDGetFaction(Attacker), undefined);
	}
}



function KDCanOffhand(item: item): boolean {
	let data = {
		item: item,
		is2handed: KDWeapon(item)?.clumsy,
		is2handedPrimary: KinkyDungeonPlayerDamage?.clumsy,
		canOffhand: !KinkyDungeonPlayerDamage?.clumsy && KDWeapon(item)?.events?.some((e) => {
			return e.offhand;
		}),
	};

	KinkyDungeonSendEvent("canOffhand", data);

	return data.item && data.canOffhand;
}

/**
 * Returns whether or not a weapon takes a damage penalty from not being wielded properly
 * e.g. staffs
 * @param weapon
 */
function KDWeaponNoDamagePenalty(weapon: Named): boolean {
	if (KDWeapon({name: weapon.name})?.noDamagePenalty) return true;
	// Quik n dirty
	if (KinkyDungeonWeaponVariants[weapon.name]?.events?.some((e) => {
		return e.type == "noDamagePenalty" && e.trigger == "calcEvasion";})) return true;
	return false;
}


/**
 * @param weapon
 */
function KDWeaponIsMagic(weapon: Named): boolean {
	if (KDWeapon({name: weapon.name})?.magic) return true;
	// Quik n dirty
	if (KinkyDungeonWeaponVariants[weapon.name]?.events?.some((e) => {return e.type == "IsMagic" && e.trigger == "calcEvasion";})) return true;
	return false;
}

function KDEvasiveManeuversCost() {
	let eva = KinkyDungeonPlayerEvasion();
	return (5.0 * eva) + 1 * KinkyDungeonSlowLevel;
}

/**
 * @param entity
 */
function KDEntityBlocksExp(entity: entity): boolean {
	return entity.Enemy?.tags?.bulwark || KDEntityBuffedStat(entity, "Bulwark") > 0;
}

function KDCrackTile(x: number, y: number, allowCrack: boolean, data: any) {
	let origTile = KinkyDungeonMapGet(x, y);
	KinkyDungeonSendEvent("beforeCrackTile", data);
	if (allowCrack || KDCrackableTiles.includes(origTile)) {

		let Mend = KDMendableTiles.includes(data.origTile);
		KinkyDungeonMapSet(x, y, '0');
		if (KinkyDungeonTilesGet(x + ',' + y)) {
			delete KinkyDungeonTilesGet(x + ',' + y).Type;
		}
		KDCreateEffectTile(x, y, {
			name: Mend ? "Rubble" : "RubbleNoMend",
			duration: 9999,
		}, 0);
		KinkyDungeonUpdateLightGrid = true;

		KinkyDungeonSendEvent("crackTile", data);
	}
}

function KDBindEnemyWithTags(id: number, tags: string[], amount: number = 0, power: number = 0, forceConjure: boolean = true, maxTries: number = 100, allowOverride: boolean = false,
	allowVariants: boolean = true, maxAdded: number = 10) {
	let entity = KDGetGlobalEntity(id);
	if (entity) {
		let maxBinding = entity.boundLevel + amount;
		let expected = KDGetExpectedBondageAmountTotal(id, entity);
		let regenEligible = () => {
			restraintsEligible = KDGetNPCEligibleRestraints_fromTags(
				id,
				tags,
				{
					forceEffLevel: KDGetEffLevel() + power,
					allowVariants: allowVariants,
					noOverride: !allowOverride,
					forceConjure: forceConjure,
				}
			);
		}
		let restraintsEligible: EligibleRestraintEntry[] = [];
		regenEligible();
		let iterations = 0;
		let added = 0;

		while (added < maxAdded && expected < maxBinding && iterations++ < maxTries && restraintsEligible.length > 0) {
			let restraintTry = restraintsEligible[Math.floor(KDRandom() * restraintsEligible.length)];
			let bondageStats = KDGetRestraintBondageStats(restraintTry.restraint, entity);
			if ((expected + bondageStats.amount < maxBinding || (iterations > maxTries/2 &&
				(!KDGetNPCRestraints(id) || !KDGetNPCRestraints(id)[restraintTry.slot.id])
			)) && (!amount || added < amount)) {
				// Apply the restraint
				let variant: item = null;
				if (restraintTry.applyVariant) {
					let restraintVariant = KDApplyVarToInvVar(
						restraintTry.restraint,
						restraintTry.applyVariant);

					variant = KDGetInventoryVariant(
						restraintVariant,
						restraintTry.applyVariant.prefix,
						restraintTry.applyVariant.curse,
						undefined,
						undefined,
						restraintTry.applyVariant.suffix,
						restraintTry.faction || KDDefaultNPCBindPalette,
						restraintTry.applyVariant.powerBonus
					);
				}


				KinkyDungeonSetEnemyFlag(entity, "bound", 1);
				KDSetNPCRestraint(id, restraintTry.slot.id, {
					name: variant?.name || restraintTry.restraint.name,
					inventoryVariant: variant?.name,
					id: variant?.id || KinkyDungeonGetItemID(),
					lock: variant?.lock || restraintTry.lock,
					conjured: restraintTry.forceConjure,
					faction: restraintTry.faction || KDDefaultNPCBindPalette,
					events: variant?.events || undefined,
				});
				added += bondageStats.amount;
				// Refresh the stats
				expected = KDGetExpectedBondageAmountTotal(id, entity);

				regenEligible();
			}
		}
	}

}