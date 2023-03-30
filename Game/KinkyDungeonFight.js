"use strict";
let KinkyDungeonKilledEnemy = null;
let KinkyDungeonAlert = 0;

let KDBrawlerAmount = 1.0;
let KDClumsyAmount = 0.7;
let KDUnfocusedParams = {
	AmountMin: 0.9,
	AmountMax: 0.6,
	ThreshMin: 0.1,
	ThreshMax: 0.9,
};
let KDDodgeAmount = 0.75;
let KinkyDungeonMissChancePerBlind = 0.1; // Max 3
let KinkyDungeonMissChancePerSlow = 0.1; // Max 3
let KinkyDungeonBullets = []; // Bullets on the game board
/**
 * @type {Map<string, {end: boolean, temporary: boolean, spin: number, spinAngle: number, name: string, size: number, spriteID: string, xx:number, yy:number, visual_x: number, visual_y: number, aoe?: boolean, updated: boolean, vx: number, vy: number, scale: number, alpha: number, delay: number}>}
 */
let KinkyDungeonBulletsVisual = new Map(); // Bullet sprites on the game board
let KinkyDungeonBulletsID = {}; // Bullets on the game board
let KDVulnerableDmg = 1.0;
let KDVulnerableDmgMult = 0.33;
let KDVulnerableHitMult = 1.33;
let KDPacifistReduction = 0.1;
let KDRiggerDmgBoost = 0.2;
let KDRiggerBindBoost = 0.3;
let KDStealthyDamageMult = 0.7;
let KDStealthyEvaMult = 0.8;
let KDResilientDamageMult = 0.7;
let KDStealthyEnemyCountMult = 1.7;
let KDBoundPowerMult = 0.4;
let KDBerserkerAmp = 0.3;
let KDUnstableAmp = 0.6;

let KinkyDungeonOpenObjects = KinkyDungeonTransparentObjects; // Objects bullets can pass thru
let KinkyDungeonMeleeDamageTypes = ["unarmed", "crush", "slash", "pierce", "grope", "pain", "chain", "tickle"];
let KinkyDungeonTeaseDamageTypes = ["tickle", "charm", "grope", "pain", "happygas", "poison", "drain", "souldrain"];
let KinkyDungeonStunDamageTypes = ["fire", "electric", "stun"];
let KinkyDungeonBindDamageTypes = ["chain", "glue"];
let KinkyDungeonFreezeDamageTypes = ["ice"];
let KinkyDungeonSlowDamageTypes = ["crush", "slash", "pierce", "frost", "cold", "poison"];
let KinkyDungeonVulnerableDamageTypes = ["tickle", "acid", "magicbind"];


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
let KinkyDungeonPlayerWeapon = null;
let KinkyDungeonPlayerWeaponLastEquipped = "";
/** @type {weapon} */
let KinkyDungeonPlayerDamageDefault = {name: "", dmg: 2, chance: 0.9, type: "unarmed", unarmed: true, rarity: 0, shop: false, sfx: "Unarmed"};
/** @type {weapon} */
let KinkyDungeonPlayerDamage = KinkyDungeonPlayerDamageDefault;

let KinkyDungeonDamageTypes = {
	acid: {name: "acid", color: "#c8d45d", bg: "black"},
	cold: {name: "cold", color: "#554bd4", bg: "black"},
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
	glue: {name: "glue", color: "#E200D0", bg: "black"},
	stun: {name: "stun", color: "white", bg: "black"},
	chain: {name: "chain", color: "white", bg: "black"},
	tickle: {name: "tickle", color: "white", bg: "black"},
	crush: {name: "crush", color: "white", bg: "black"},
	grope: {name: "grope", color: "white", bg: "black"},
	slash: {name: "slash", color: "white", bg: "black"},
	pierce: {name: "pierce", color: "white", bg: "black"},
	pain: {name: "pain", color: "white", bg: "black"},
	unarmed: {name: "unarmed", color: "white", bg: "black"},
	magic: {name: "magic", color: "#00FF90", bg: "black"},
	melee: {name: "melee", color: "#aaaaaa", bg: "black"},
	spell: {name: "spell", color: "#00FF90", bg: "black"},
};

/**
 *
 * @param {item} item
 * @returns {weapon}
 */
function KDWeapon(item) {
	return KinkyDungeonWeapons[item.name];
}

function KinkyDungeonFindWeapon(Name) {
	for (let con of Object.values(KinkyDungeonWeapons)) {
		if (con.name == Name) return con;
	}
	return undefined;
}

function KinkyDungeonWeaponCanCut(RequireInteract, MagicOnly) {
	if (KinkyDungeonPlayerWeapon
		&& KinkyDungeonWeapons[KinkyDungeonPlayerWeapon].cutBonus != undefined
		&& (!MagicOnly || KinkyDungeonWeapons[KinkyDungeonPlayerWeapon].magic != undefined)
		&& (!RequireInteract || !KinkyDungeonIsHandsBound(false, false, 0.55))) return true;
	if (KinkyDungeonPlayerBuffs) {
		for (let b of Object.values(KinkyDungeonPlayerBuffs)) {
			if (b && b.tags && (b.tags.includes("allowCutMagic") || (!MagicOnly && b.tags.includes("allowCut")))) return true;
		}
	}
	return false;
}

// We reset the pity timer on weapon switch to prevent issues
function KDSetWeapon(Weapon, forced) {
	if (!Weapon) Weapon = 'Unarmed';
	KinkyDungeonEvasionPityModifier = 0;
	KinkyDungeonPlayerWeapon = Weapon;
	if (!forced)
		KinkyDungeonPlayerWeaponLastEquipped = Weapon;
}

function KinkyDungeonGetPlayerWeaponDamage(HandsFree, NoOverride) {
	let flags = {
		KDDamageHands: true.valueOf,
	};
	if (!NoOverride)
		KinkyDungeonSendEvent("calcDamage", {flags: flags});

	let damage = KinkyDungeonPlayerDamageDefault;
	// @ts-ignore
	KinkyDungeonPlayerDamage = {};
	let weapon = KinkyDungeonWeapons[KinkyDungeonPlayerWeapon];
	if (weapon && weapon.noHands) HandsFree = true;
	if (!HandsFree || (KinkyDungeonStatsChoice.get("Brawler") && !KinkyDungeonPlayerWeapon)) {
		damage = KinkyDungeonPlayerDamageDefault;
		if (!NoOverride)
			KDSetWeapon('Unarmed', true);
	} else if (KinkyDungeonPlayerWeapon && KinkyDungeonWeapons[KinkyDungeonPlayerWeapon]) {
		damage = KinkyDungeonWeapons[KinkyDungeonPlayerWeapon];
	}

	Object.assign(KinkyDungeonPlayerDamage, damage);

	let handBondage = KDHandBondageTotal();
	if (handBondage && (flags.KDDamageHands || weapon.unarmed) && (!weapon || !weapon.noHands || weapon.unarmed)) {
		KinkyDungeonPlayerDamage.chance *= 0.5 + Math.max(0, 0.5 * Math.min(1, handBondage));
	}
	if (KinkyDungeonStatsChoice.get("Brawler") && !KinkyDungeonPlayerDamage.name) {
		KinkyDungeonPlayerDamage.dmg += KDBrawlerAmount;
	} else {
		if (KinkyDungeonSlowLevel > 1 && (!KinkyDungeonPlayerDamage.name || weapon.unarmed)) {
			KinkyDungeonPlayerDamage.dmg /= 2;
		}
	}
	if ((KinkyDungeonPlayer.Pose.includes("Hogtied") || KinkyDungeonPlayer.Pose.includes("Kneel")) && (flags.KDDamageHands || weapon.unarmed) && (!weapon || !weapon.noHands || weapon.unarmed)) {
		KinkyDungeonPlayerDamage.chance /= 1.5;
	}

	return KinkyDungeonPlayerDamage;
}


let KinkyDungeonEvasionPityModifier = 0; // Current value
let KinkyDungeonEvasionPityModifierIncrementPercentage = 0.5; // Percent of the base hit chance to add

function KinkyDungeonGetEvasion(Enemy, NoOverride, IsSpell, IsMagic, cost) {
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
	if (Enemy && Enemy.Enemy && Enemy.Enemy.tags.ghost && (IsMagic || (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.magic))) hitChance = Math.max(hitChance, 1.0);

	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Accuracy")) {
		hitChance *= KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Accuracy"));
	}

	if (!IsSpell) hitChance *= KinkyDungeonPlayerDamage.chance;
	if (Enemy && Enemy.bind > 0) hitChance *= 3;
	else if (Enemy && Enemy.slow > 0) hitChance *= 2;
	if (Enemy && (Enemy.stun > 0 || Enemy.freeze > 0)) hitChance *= 5;
	else {
		if (Enemy && Enemy.distraction > 0) hitChance *= 1 + Math.min(1, Enemy.distraction / Enemy.Enemy.maxhp);
		if (Enemy) hitChance *= 1 + 0.25 * KDBoundEffects(Enemy);
	}
	if (Enemy && Enemy.vulnerable) hitChance *= KDVulnerableHitMult;

	if (!IsSpell) {
		if (flags.KDEvasionSight)
			hitChance = Math.min(hitChance, Math.max(0.1, hitChance - Math.min(3, KinkyDungeonBlindLevel) * KinkyDungeonMissChancePerBlind));
		if (flags.KDEvasionSlow && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.name && KinkyDungeonSlowLevel > 0) hitChance *= 1.0 - Math.max(0.5, KinkyDungeonMissChancePerSlow * KinkyDungeonSlowLevel);
	}
	return hitChance;
}

function KinkyDungeonAggro(Enemy, Spell, Attacker, Faction) {
	if (Enemy && Enemy.Enemy && (!Spell || !Spell.enemySpell) && (!Faction || Faction == "Player") && !(Enemy.rage > 0) && (!Attacker || Attacker.player || Attacker.Enemy.allied)) {
		if ((Enemy.playWithPlayer || !KDHostile(Enemy)) && KDCanDom(Enemy)) {
			KDAddThought(Enemy.id, "Embarrassed", 5, 1);
			Enemy.distraction = (Enemy.distraction || 0) + Enemy.Enemy.maxhp * 0.1;
			KDAddOpinion(Enemy, 10);
		} else {
			if (Enemy && !Enemy.Enemy.allied) {
				KinkyDungeonSetFlag("PlayerCombat", 8);
				KinkyDungeonAggroAction('attack', {enemy: Enemy});
			}
		}
	}
}

function KDPlayerEvasionPenalty() {
	let evasionPenalty = .25 * KinkyDungeonSlowLevel;

	return evasionPenalty;
}

function KinkyDungeonPlayerEvasion() {
	let playerEvasionMult = 1.0;
	let playerEvasionPenalty = KDPlayerEvasionPenalty();
	let val = playerEvasionMult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Evasion") - playerEvasionPenalty);

	return val;
}
function KinkyDungeonGetPlayerStat(stat, mult) {
	let data = {
		mult: mult,
		stat: !mult ? KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat) : KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, stat)),
	};
	KinkyDungeonSendEvent("calcPlayer" + stat, data);

	return data.stat;
}

function KDRestraintBlockPower(block, power) {
	return KinkyDungeonMultiplicativeStat(block / Math.max(1, power));
}

function KinkyDungeonEvasion(Enemy, IsSpell, IsMagic, Attacker) {
	let hitChance = KinkyDungeonGetEvasion(Enemy, undefined, IsSpell, IsMagic, true);
	if (KDHostile(Enemy) && KinkyDungeonStatsChoice.get("Stealthy")) {
		hitChance *= KDStealthyEvaMult;
	}

	if (!Enemy) KinkyDungeonSleepTime = 0;

	KinkyDungeonAggro(Enemy, undefined, Attacker);

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

let KDDamageEquivalencies = {
	"frost": "ice",
	"happygas": "charm",
	"souldrain": "soul",
	"drain": "soul",
	"shock": "electric",
};

/**
 *
 * @param {Record<string, boolean>} tags
 * @param {string} type
 * @param {string} resist
 * @returns {boolean}
 */
function KinkyDungeonGetImmunity(tags, type, resist) {
	let t = type;
	if (KDDamageEquivalencies[type]) t = KDDamageEquivalencies[type];

	for (let i = 0; i < 10 && KinkyDungeonDamageTypesExtension[t]; i++) {
		if (KinkyDungeonDamageTypesExtension[t] && resist != "weakness" && resist != "severeweakness") t = KinkyDungeonDamageTypesExtension[t];
	}
	if (tags && (tags[t + resist]
		|| ((KinkyDungeonMeleeDamageTypes.includes(t) && (type != "unarmed" || !resist.includes("weakness"))) && tags["melee" + resist])
		|| (!KinkyDungeonMeleeDamageTypes.includes(t) && tags["magic"+resist])))
		return true;
	return false;
}

let KDDamageQueue = [];

function KDArmorFormula(DamageAmount, Armor) {
	if (DamageAmount <= 0) return 1;
	if (Armor < 0) return Math.min(3, (DamageAmount - Armor) / DamageAmount);
	return DamageAmount / (DamageAmount + Armor);
}


function KinkyDungeonDamageEnemy(Enemy, Damage, Ranged, NoMsg, Spell, bullet, attacker, Delay, noAlreadyHit) {
	if (bullet && !noAlreadyHit) {
		if (!bullet.alreadyHit) bullet.alreadyHit = [];
		// A bullet can only damage an enemy once per turn
		if (bullet.alreadyHit.includes(Enemy.id)) return 0;
		bullet.alreadyHit.push(Enemy.id);
	}

	let predata = {
		aggro: false,
		faction: "Enemy",
		enemy: Enemy,
		spell: Spell,
		bullet: bullet,
		attacker: attacker,
		type: (Damage) ? Damage.type : 0,
		bufftype: (Damage) ? Damage.type : 0,
		time: (Damage) ? Damage.time : 0,
		dmg: (Damage) ? Damage.damage : 0,
		bind: (Damage) ? Damage.bind : 0,
		bindType: (Damage) ? Damage.bindType : 0,
		flags: (Damage) ? Damage.flags : undefined,
		boundBonus: (Damage) ? Damage.boundBonus : 0,
		bindEff: (Damage) ? Damage.bindEff : 0,
		distract: (Damage) ? Damage.distract : 0,
		distractEff: (Damage) ? Damage.distractEff : 0,
		incomingDamage: Damage,
		dmgDealt: 0,
		freezebroke: false,
		froze: 0,
		vulnerable: (Enemy.vulnerable || (KDHostile(Enemy) && !Enemy.aware)) && Damage && !Damage.novulnerable && (!Enemy.Enemy.tags || !Enemy.Enemy.tags.nonvulnerable),
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

	KinkyDungeonSendEvent("beforeDamageEnemy", predata);

	if (!predata.dmg) predata.dmg = 0;
	//let type = (Damage) ? Damage.type : "";
	let effect = false;
	let resistStun = 0;
	let resistSlow = 0;
	let resistDamage = 0;
	let spellResist = (Damage && Enemy.Enemy.armor && !KinkyDungeonMeleeDamageTypes.includes(predata.type)) ? Enemy.Enemy.spellResist : 0;
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResist")) spellResist += KinkyDungeonGetBuffedStat(Enemy.buffs, "SpellResist");
	let armor = (Damage && Enemy.Enemy.armor && KinkyDungeonMeleeDamageTypes.includes(predata.type)) ? Enemy.Enemy.armor : 0;
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "Armor")) armor += KinkyDungeonGetBuffedStat(Enemy.buffs, "Armor");
	if (KinkyDungeonGetBuffedStat(Enemy.buffs, "ArmorBreak")) armor -= Math.min(Math.max(0, armor), KinkyDungeonGetBuffedStat(Enemy.buffs, "ArmorBreak"));

	if (Enemy.freeze > 0 && Damage && KinkyDungeonMeleeDamageTypes.includes(predata.type)) {
		predata.dmg *= 2;
	}

	let miss = !(!Damage || !Damage.evadeable || KinkyDungeonEvasion(Enemy, (true && Spell), !KinkyDungeonMeleeDamageTypes.includes(predata.type), attacker));
	if (Damage && !miss) {
		if (KinkyDungeonStatsChoice.get("Pacifist") && KDHostile(Enemy) && Enemy.Enemy.bound && !KinkyDungeonTeaseDamageTypes.includes(predata.type) && predata.type != "glue" && predata.type != "chain") {
			predata.dmg *= KDPacifistReduction;
		}
		KDUpdatePerksBonus();
		let DamageAmpBonusPerks = KDDamageAmpPerks
			+ (KinkyDungeonMeleeDamageTypes.includes(predata.type) ? KDDamageAmpPerksMelee : 0)
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

		if (predata.type == "fire" && Enemy.freeze > 0) {
			predata.dmg *= 1.4;
		}

		if (damageAmp) predata.dmg *= damageAmp;

		let time = predata.time ? predata.time : 0;
		if (spellResist && !KinkyDungeonMeleeDamageTypes.includes(predata.type)) {
			if (time)
				time = Math.max(0, Math.ceil(time * KDArmorFormula(predata.dmg, spellResist)));
			predata.dmg = Math.max(0, predata.dmg * KDArmorFormula(predata.dmg, spellResist));
		}


		if (Enemy.Enemy.tags) {
			if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, predata.type, "severeweakness")) resistDamage = -2;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, predata.type, "weakness")) resistDamage = -1;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, predata.type, "immune")) resistDamage = 2;
			else if (KinkyDungeonGetImmunity(Enemy.Enemy.tags, predata.type, "resist")) resistDamage = 1;

			if (Enemy.Enemy.tags.unstoppable) resistStun = 2;
			else if (Enemy.Enemy.tags.unflinching) resistStun = 1;
			if (Enemy.Enemy.tags.unslowable) resistSlow = 2;
			else if (Enemy.Enemy.tags.slowresist) resistSlow = 1;

		}

		if (Enemy.boundLevel > 0 && (KinkyDungeonTeaseDamageTypes.includes(predata.type) || Damage.tease)) {
			let eff = KDBoundEffects(Enemy);
			let mult = 1.0;
			if (eff > 0) {
				mult += 0.5;
			}
			if (eff > 3) {
				mult += 0.5;
			}
			predata.dmg *= mult;
		}
		if (Enemy.boundLevel > 0 && Damage && Damage.boundBonus) {
			let eff = KDBoundEffects(Enemy);
			predata.dmg += Damage.boundBonus * eff;
		}

		let killed = Enemy.hp > 0;
		let forceKill = false;



		if (predata.type != "inert" && resistDamage < 2) {
			if (resistDamage == 1 || (resistStun > 0 && predata.type == "stun")) {
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
				KinkyDungeonTickBuffTag(Enemy.buffs, "damageTaken", 1);
				KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Shield.ogg");
			}

			if (Enemy.freeze > 0 && predata.dmgDealt > 0) {
				if ((KinkyDungeonMeleeDamageTypes.includes(predata.type))) {
					Enemy.freeze = 0;
				} else if (!["ice", "frost"].includes(predata.type)) {
					Enemy.freeze = Math.max(0, Enemy.freeze - predata.dmgDealt * (predata.type == "fire" ? 0.75 : 0.25));
				}
				if (Enemy.freeze == 0) {
					predata.freezebroke = true;
				}
			}

			if (KDHostile(Enemy)) {
				if (KinkyDungeonStatsChoice.get("Stealthy"))
					predata.dmgDealt *= KDStealthyDamageMult;

				if (KinkyDungeonStatsChoice.get("ResilientFoes"))
					predata.dmgDealt *= KDResilientDamageMult;
			}

			KinkyDungeonSendEvent("duringDamageEnemy", predata);

			if (Spell && Spell.hitsfx) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Spell.hitsfx + ".ogg");
			else if (!(Spell && Spell.hitsfx) && predata.dmgDealt > 0 && bullet) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/DealDamage.ogg");
			if (Damage && Damage.damage) {
				if (predata.faction == "Player" || KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0)
					KDDamageQueue.push({floater: Math.round(Math.min(predata.dmgDealt, Enemy.hp)*10), Entity: Enemy, Color: "#ff4444", Delay: Delay});
				//KinkyDungeonSendFloater(Enemy, Math.round(Math.min(predata.dmgDealt, Enemy.hp)*10), "#ff4444");
			}
			//forceKill = (Enemy.hp <= Enemy.Enemy.maxhp*0.1 || Enemy.hp <= 0.52) && KDistChebyshev(Enemy.x - KinkyDungeonPlayerEntity.x, Enemy.y - KinkyDungeonPlayerEntity.y) < 1.5;

			Enemy.hp -= predata.dmgDealt;
			if (Enemy.hp > 0 && Enemy.hp <= 0.51 && predata.dmgDealt > 2.01 && !forceKill && KDBoundEffects(Enemy) < 4) Enemy.hp = 0;
			if (predata.dmgDealt > 0) Enemy.revealed = true;
		}

		if ((resistStun < 2 && resistDamage < 2) && (KinkyDungeonStunDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
			effect = true;
			if (!Enemy.stun) KDAddThought(Enemy.id, "Status", 5, 1);
			if (!Enemy.stun) Enemy.stun = 0;
			if (resistStun == 1 || resistDamage == 1)
				Enemy.stun = Math.max(Enemy.stun, Math.min(Math.floor(time/2), time-1)); // Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
			else Enemy.stun = Math.max(Enemy.stun, time);
		}
		if ((resistStun < 2 && resistDamage < 2) && (KinkyDungeonFreezeDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
			effect = true;
			if (!Enemy.freeze) KDAddThought(Enemy.id, "Freeze", 5, 1);
			if (!(Enemy.freeze > 0)) Enemy.freeze = 0;
			let preFreeze = Enemy.freeze > 0;
			if (resistDamage == 1 || resistStun == 1)
				Enemy.freeze = Math.max(Enemy.freeze, Math.min(Math.floor(time/2), time-1)); // Enemies with ice resistance have freeze reduced to 1/2, and anything that freezes them for one turn doesn't affect them
			else Enemy.freeze = Math.max(Enemy.freeze, time);
			predata.froze = (Enemy.freeze > 0 && !preFreeze) ? Enemy.freeze : 0;
		}

		if ((resistStun < 2 && resistDamage < 2) && (KinkyDungeonBindDamageTypes.includes(predata.type))) { // Being immune to the damage stops the bind
			effect = true;
			if (!Enemy.bind) Enemy.bind = 0;
			if (resistDamage == 1 || resistStun == 1)
				Enemy.bind = Math.max(Enemy.bind, Math.min(Math.floor(time/2), time-1)); // Enemies with resistance have bind reduced to 1/2, and anything that binds them for one turn doesn't affect them
			else Enemy.bind = Math.max(Enemy.bind, time);
		}
		if ((predata.dmg || predata.bind) && Enemy.Enemy.bound && (resistDamage < 2) && (predata.bind || KinkyDungeonBindingDamageTypes.includes(predata.type))) {
			effect = true;
			if (!Enemy.boundLevel) Enemy.boundLevel = 0;
			let efficiency = predata.bindEff ? predata.bindEff : 1.0;
			if (resistStun == -2) {
				efficiency *= 2;
			} else if (resistStun == -1) {
				efficiency *= 1.5;
			}
			if (resistDamage == 1 || resistStun == 1) {
				efficiency *= 0.75;
			}
			if (resistDamage == 2) {
				efficiency *= 0.5;
			}
			if (resistStun == 2) {
				efficiency *= 0.5;
			}
			if (predata.vulnerable || Enemy.boundLevel > Enemy.Enemy.maxhp) {
				efficiency *= 2;
			}

			if (!(Enemy.boundLevel > 0)) {
				let Thought = "Annoyed";
				if (KDStrictPersonalities.includes(Enemy.personality)) Thought = "Struggle";
				else if (KDLoosePersonalities.includes(Enemy.personality)) Thought = "Embarrassed";
				KDAddThought(Enemy.id, Thought, 5, 2);
			}


			let amt = efficiency * (predata.bind ? predata.bind : predata.dmg);
			if (predata.vulnerable && efficiency * (predata.bind ? predata.bind : predata.dmg) > 0.01 && Enemy.boundLevel < Enemy.Enemy.maxhp * 0.4) {
				amt += Enemy.Enemy.maxhp * 0.2;
			}
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
			KDTieUpEnemy(Enemy, amt, predata.bindType, predata.dmg);
		}
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

				Enemy.distraction += efficiency * (predata.distract ? predata.distract : predata.dmg);
				if (predata.vulnerable && efficiency * (predata.distract ? predata.distract : predata.dmg) > 0.01 && Enemy.distraction < Enemy.Enemy.maxhp * 0.5) {
					Enemy.distraction += Enemy.Enemy.maxhp * 0.25;
				}
			}
		}

		if (!forceKill && KDBoundEffects(Enemy) > 3 && (Enemy.hp < 0 || (Enemy.hp <= Enemy.Enemy.maxhp * 0.1))) {
			if ((predata.faction == "Player" || KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0) && Enemy.hp > 0.001) {
				let Thought = "GiveUp";
				if (KDStrictPersonalities.includes(Enemy.personality)) Thought = "Fire";
				else if (KDLoosePersonalities.includes(Enemy.personality)) Thought = "Play";
				if (!(Enemy.boundLevel > 0)) KDAddThought(Enemy.id, Thought, 6, 3);
				KDAddThought(Enemy.id, Thought, 6, 3);
				KDDamageQueue.push({floater: TextGet("KDHelpless"), Entity: {x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, Color: "white", Time: 2, Delay: Delay});
			}
			if (killed)
				Enemy.hp = 0.001;
		}

		if ((resistSlow < 2 && resistDamage < 2) && (KinkyDungeonSlowDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
			effect = true;
			if (!Enemy.slow) KDAddThought(Enemy.id, "Annoyed", 5, 1);
			if (!Enemy.slow) Enemy.slow = 0;
			if (resistSlow == 1 || resistDamage == 1)
				Enemy.slow = Math.max(Enemy.slow, Math.min(Math.floor(time/2), time-1)); // Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
			else Enemy.slow = Math.max(Enemy.slow, time);
		}
		if ((resistDamage < 2) && (KinkyDungeonVulnerableDamageTypes.includes(predata.type))) { // Being immune to the damage stops the stun as well
			effect = true;
			if (!Enemy.vulnerable) KDAddThought(Enemy.id, "Status", 4, 1);
			if (!Enemy.vulnerable) Enemy.vulnerable = 0;
			if (resistDamage == 1)
				Enemy.vulnerable = Math.max(Enemy.vulnerable, Math.min(Math.floor(time/2), time-1)); // Enemies with stun resistance have stuns reduced to 1/2, and anything that stuns them for one turn doesn't affect them
			else Enemy.vulnerable = Math.max(Enemy.vulnerable, time);
		}
	}

	if (KDBoundEffects(Enemy) > 3) {
		if (!Enemy.vulnerable) Enemy.vulnerable = 0;
		Enemy.vulnerable = Math.max(Enemy.vulnerable, 1);
	}

	predata.aggro = predata.type != "heal" && predata.type != "inert" && (!Spell || !Spell.allySpell) && (!bullet || !bullet.spell || !bullet.spell.allySpell);

	KinkyDungeonSendEvent("afterDamageEnemy", predata);

	let atkname = (Spell) ? TextGet("KinkyDungeonSpell" + Spell.name) : TextGet("KinkyDungeonBasicAttack");
	let damageName = TextGet("KinkyDungeonDamageType" + predata.type);
	if (!NoMsg && !Spell) atkname = TextGet("KinkyDungeonBasicDamage");

	if (Enemy.hp <= 0) {
		KinkyDungeonKilledEnemy = Enemy;
	}
	let mod = "";
	if (resistDamage == 1) mod = "Weak";
	if (resistDamage == 2) mod = "Immune";
	if (resistDamage == -1) mod = "Strong";
	if (resistDamage == -2) mod = "VeryStrong";
	if (Damage && !mod && spellResist > 0 && !KinkyDungeonMeleeDamageTypes.includes(predata.type)) mod = "SpellResist";

	if (predata.faction == "Player" || predata.faction == "Rage") {
		if (!Enemy.playerdmg) Enemy.playerdmg = 0.01;
		Enemy.playerdmg += predata.dmgDealt;
	}

	if (!NoMsg && (predata.dmgDealt > 0 || !Spell || effect) && (!Damage || Damage.damage > 0)) KinkyDungeonSendActionMessage(4 + predata.dmgDealt * 0.01, (Damage && predata.dmgDealt > 0) ?
		TextGet((Ranged) ? "PlayerRanged" + mod : "PlayerAttack" + mod).replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)).replace("AttackName", atkname).replace("DamageDealt", "" + Math.round(predata.dmgDealt * 10)).replace("DamageType", ("" + damageName).toLowerCase())
		: TextGet("PlayerMiss" + ((Damage && !miss) ? "Armor" : "")).replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)),
			(Damage && (predata.dmg > 0 || effect)) ? "orange" : "#ff0000", 2, undefined, undefined, Enemy);

	if (Enemy && Enemy.Enemy && KDAmbushAI(Enemy) && Spell) {
		Enemy.ambushtrigger = true;
	}

	if (!Damage && predata.type != "inert" && predata.dmgDealt <= 0) {
		KDAddThought(Enemy.id, "Laugh", 4, 1);
		KDDamageQueue.push({floater: TextGet("KDMissed"), Entity: {x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, Color: "white", Time: 2, Delay: Delay});
		if (KDRandom() < actionDialogueChanceIntense)
			KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (Enemy.Enemy.playLine ? Enemy.Enemy.playLine : "") + "MissedMe").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5, false, true);

		if (KDToggles.Sound && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx.Miss) {
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx.Miss + ".ogg");
		}
		//KinkyDungeonSendFloater({x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, TextGet("KDMissed"), "white", 2);
	} else if (Damage && Damage.damage > 0 && predata.type != "inert" && predata.dmgDealt <= 0 && !miss) {
		if (predata.faction == "Player" || KinkyDungeonVisionGet(Enemy.x, Enemy.y) > 0) {
			KDAddThought(Enemy.id, "Laugh", 5, 3);
			if (KDRandom() < actionDialogueChanceIntense)
				KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (Enemy.Enemy.playLine ? Enemy.Enemy.playLine : "") + "MissedMe").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5, false, true);
			KDDamageQueue.push({floater: TextGet("KDBlocked"), Entity: {x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, Color: "white", Time: 2, Delay: Delay});
		}

		let type = KinkyDungeonMeleeDamageTypes.includes(predata.type) ? "Block" : "Resist";
		if (KDToggles.Sound && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx[type]) {
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx[type] + ".ogg");
		}
		//KinkyDungeonSendFloater({x: Enemy.x - 0.5 + Math.random(), y: Enemy.y - 0.5 + Math.random()}, TextGet("KDBlocked"), "white", 2);
	} else if (predata.dmgDealt > 0 && KDToggles.Sound && Enemy.Enemy.cueSfx && Enemy.Enemy.cueSfx.Damage) {
		KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + Enemy.Enemy.cueSfx.Damage + ".ogg");
		if (KDRandom() < actionDialogueChance)
			KinkyDungeonSendDialogue(Enemy, TextGet("KinkyDungeonRemindJail" + (Enemy.Enemy.playLine ? Enemy.Enemy.playLine : "") + "Hit").replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), KDGetColor(Enemy), 4, 5);
	}

	if (predata.aggro)
		KinkyDungeonAggro(Enemy, Spell, attacker, predata.faction);

	if (predata.dmg > 0) {
		KinkyDungeonTickBuffTag(Enemy.buffs, "takeDamage", 1);
		KinkyDungeonSetEnemyFlag(Enemy, "wander", 0);
	}
	return predata.dmg;
}

function KinkyDungeonDisarm(Enemy, suff) {
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
			let weapon = KinkyDungeonPlayerDamage.name;

			let dropped = {x:foundslot.x, y:foundslot.y, name: weapon};

			KDSetWeapon('Unarmed', true);
			KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
			KinkyDungeonInventoryRemove(KinkyDungeonInventoryGetWeapon(weapon));

			KinkyDungeonGroundItems.push(dropped);
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonDisarm" + (suff ? suff : "")), "#ff0000", 2);

			return true;
		}
	}
	return false;
}

function KinkyDungeonAttackEnemy(Enemy, Damage) {
	let disarm = false;
	if (Enemy.Enemy && Enemy.Enemy.disarm && Enemy.disarmflag > 0) {
		if (Enemy.stun > 0 || Enemy.freeze > 0 || Enemy.blind > 0 || (Enemy.playWithPlayer && !Enemy.hostile)) Enemy.disarmflag = 0;
		else if (Enemy.Enemy && Enemy.Enemy.disarm && Enemy.disarmflag >= 0.97 && KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed) {
			Enemy.disarmflag = 0;
			disarm = true;
		}
	}
	let evaded = KinkyDungeonEvasion(Enemy, undefined, undefined, KinkyDungeonPlayerEntity);
	let dmg = Damage;
	let buffdmg = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackDmg");
	let predata = {
		targetX: Enemy.x,
		targetY: Enemy.y,
		enemy: Enemy,
		evaded: evaded,
		miss: !evaded,
		disarm: disarm,
		eva: !disarm && evaded,
		Damage: Damage,
		buffdmg: buffdmg,
		vulnConsumed: false,
		vulnerable: (Enemy.vulnerable || (KDHostile(Enemy) && !Enemy.aware)) && dmg && !dmg.novulnerable && (!Enemy.Enemy.tags || !Enemy.Enemy.tags.nonvulnerable),
	};
	KinkyDungeonSendEvent("beforePlayerAttack", predata);

	if (predata.buffdmg) dmg.damage = Math.max(0, dmg.damage + predata.buffdmg);

	if (predata.vulnerable && (predata.eva)) {
		predata.vulnConsumed = true;
		let dmgBonus = Math.max(Math.min(2 * dmg.damage, KDVulnerableDmg), dmg.damage * KDVulnerableDmgMult);
		dmg.damage = Math.max(0, dmg.damage + dmgBonus);
		KinkyDungeonSendTextMessage(4, TextGet((Enemy.vulnerable || Enemy.distraction > Enemy.Enemy.maxhp) ? "KinkyDungeonVulnerable" : "KinkyDungeonUnseen")
			.replace("AMOUNT", "" + Math.round(10 * dmgBonus))
			.replace("EnemyName", TextGet("Name" + Enemy.Enemy.name)), "lightgreen", 2);
	}


	let hp = Enemy.hp;
	KinkyDungeonDamageEnemy(Enemy, (predata.eva) ? dmg : null, undefined, undefined, undefined, undefined, KinkyDungeonPlayerEntity);
	if (predata.eva && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.sfx) {
		if (KDToggles.Sound) KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/" + KinkyDungeonPlayerDamage.sfx + ".ogg"});
		//AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + KinkyDungeonPlayerDamage.sfx + ".ogg");
	} else if (!predata.eva) if (KDToggles.Sound) KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/Miss.ogg"});
	//AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
	if (disarm) {
		KinkyDungeonDisarm(Enemy);
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
		targetX: Enemy.x,
		targetY: Enemy.y,
		enemy: Enemy,
		miss: !evaded,
		disarm: disarm,
		damage: Damage,
		vulnConsumed: predata.vulnConsumed,
	};
	KinkyDungeonSendEvent("playerAttack", data);

	KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "damage", 1);
	KinkyDungeonTickBuffTag(Enemy.buffs, "incomingHit", 1);
	if (predata.eva)
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "hit", 1);


	KinkyDungeonSendEvent("afterPlayerAttack", data);

	if (data.vulnConsumed) {
		Enemy.vulnerable = 0;
	}
}

let KDBulletWarnings = [];
let KDUniqueBulletHits = new Map();


function KDUpdateBulletEffects(b, d) {
	// At the start we guarantee interactions
	if (!b.bullet.noInteractTiles) {
		let rad = b.bullet.aoe || 0.5;
		for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
			for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
				if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletAoEMod(b)) && (X != 0 || Y != 0)) {
					KDEffectTileInteractions(b.x + X, b.y + Y, b, d);
				}
			}
	}
}

function KinkyDungeonUpdateBullets(delta, Allied) {
	if (Allied) KDUniqueBulletHits = new Map();
	if (delta > 0)
		for (let b of KinkyDungeonBullets) {
			if ((Allied && b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell) || (!Allied && !(b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell))) {
				KinkyDungeonSendEvent("bulletTick", {bullet: b, delta: delta, allied: Allied});
				if (b.bullet && b.bullet.dot) {
					KinkyDungeonBulletDoT(b);
				}
				if (b.bullet.cast && b.bullet.spell && b.bullet.spell.castDuringDelay && (!b.bullet.cast.chance || KDRandom() < b.bullet.cast.chance) && b.time > 1) {
					let xx = b.bullet.cast.tx;
					let yy = b.bullet.cast.ty;
					if (b.bullet.cast.targetID) {
						let enemy = KinkyDungeonFindID(b.bullet.cast.targetID);
						if (enemy) {
							xx = enemy.x;
							yy = enemy.y;
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
	if (Allied) {
		KDBulletWarnings = [];
	}
	for (let E = 0; E < KinkyDungeonBullets.length; E++) {
		let b = KinkyDungeonBullets[E];

		if ((Allied && b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell) || (!Allied && !(b.bullet && b.bullet.spell && !b.bullet.spell.enemySpell))) {
			let d = delta;
			let first = true;
			let justBorn = false;
			let trailSquares = [];
			let startx = b.x;
			let starty = b.y;
			let end = false;
			let mod = (b.bullet.spell && !b.bullet.spell.slowStart && (b.bullet.spell.fastStart || (b.bullet.spell.speed > b.bullet.spell.range * 0.8 && b.bullet.spell.speed > 1) || (!b.bullet.spell.enemySpell && !b.bullet.spell.allySpell && (b.vx != 0 || b.vy != 0)))) ? 1 : 0;

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
					if (!(b.bullet.spell && ((!b.bullet.trail && (b.bullet.spell.piercing || (b.bullet.spell.pierceEnemies && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y))))) || (b.bullet.trail && b.bullet.spell.piercingTrail))) || outOfRange || outOfTime)
						end = true;
					if (end) {
						d = 0;
						KinkyDungeonBullets.splice(E, 1);
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

				let show = (KDFactionRelation("Player", b.bullet.faction) < 0.5 || (b.bullet.spell && b.bullet.spell.playerEffect) || b.bullet.playerEffect || (b.bullet.spell && b.bullet.spell.alwaysWarn))
					&& !(b.bullet.spell && b.bullet.spell.hideWarnings)
					&& ((b.bullet.spell && b.bullet.spell.alwaysWarn)
						|| (b.bullet.hit == "lingering" || (b.bullet.spell && b.bullet.name == b.bullet.spell.name && (b.bullet.spell.onhit == "aoe" || b.bullet.spell.onhit == "dot")))
						|| ((b.lifetime > 0 || b.lifetime == undefined) && b.bullet.damage && b.bullet.damage.type && b.bullet.damage.type != "heal" && b.bullet.damage.type != "inert")
					);
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
					let outOfTime = (b.bullet.lifetime != 0 && ((!b.bullet.damage && btime <= 0.001) || ((b.bullet.damage) && btime <= 1.001)));
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
										KDBulletWarnings.push({x: xx, y: yy, color:b.bullet.spell ? (b.bullet.spell.color ? b.bullet.spell.color : "#ff0000") : "#ff0000"});
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

function KinkyDungeonUpdateSingleBulletVisual(b, end, delay) {
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

		let temp = (!b.vx && !b.vy && b.time <= 1 && !b.bullet.hit);
		KinkyDungeonBulletsVisual.set(b.spriteID, {end: end, temporary: temp, spin: b.bullet.bulletSpin, spinAngle: spinAngle, name: b.bullet.name, spriteID: b.spriteID, size: b.bullet.width ? b.bullet.width : 1, aoe: (b.bullet.spell && b.bullet.spell.aoe) ? b.bullet.spell.aoe : undefined, vx: b.vx, vy: b.vy, xx: b.xx, yy: b.yy, visual_x: visx, visual_y: visy, updated: true, scale: scale, alpha: alpha, delay: dd});
	}
}

function KinkyDungeonUpdateBulletVisuals(delta) {
	if (delta > 0)
		for (let b of KinkyDungeonBulletsVisual.entries()) {
			if (b[1].updated) {
				b[1].updated = false;
			} else if (!b[1].end || b[1].alpha <= 0.01) KinkyDungeonBulletsVisual.delete(b[0]);
		}
}

let KinkyDungeonCurrentTick = 0;

function KinkyDungeonUpdateBulletsCollisions(delta, Catchup) {
	for (let E = 0; E < KinkyDungeonBullets.length; E++) {
		let b = KinkyDungeonBullets[E];
		if ((!Catchup && !b.secondary) || (Catchup && b.secondary)) {
			if (!KinkyDungeonBulletsCheckCollision(b, b.time >= 0, undefined, undefined, !(b.bullet.faction == "Player" || (!b.vx && !b.vy) || b.bullet.aoe || (KDistEuclidean(b.vx, b.vy) < 0.9)))) { // (b.bullet.faction == "Player" || (!b.vx && !b.vy) || b.bullet.aoe || (KDistEuclidean(b.vx, b.vy) < 0.9)) &&
				if (!(b.bullet.spell && (b.bullet.spell.piercing || (b.bullet.spell.pierceEnemies && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y)))))) {
					KinkyDungeonBullets.splice(E, 1);
					KinkyDungeonBulletsID[b.spriteID] = null;
					KinkyDungeonUpdateSingleBulletVisual(b, true);
					KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:false, outOfTime: false});
					E -= 1;
				}
				KinkyDungeonBulletHit(b, 1);
			}
		}
	}
}


function KDCheckCollideableBullets(entity, force) {
	for (let E = 0; E < KinkyDungeonBullets.length; E++) {
		let b = KinkyDungeonBullets[E];
		if (b.x == entity.x && b.y == entity.y && b.bullet && b.bullet.damage
				&& (b.time > 1 // Only bullets that arent instantly ending
					&& (!entity.player || !(b.vx != 0 || b.vy != 0)))) {// Enemies can run into bullets as they move, but the player can walk into bullets that are moving without being hit
			let pierce = b.bullet.spell && (b.bullet.spell.piercing || b.bullet.spell.pierceEnemies);
			let noDirect = b.bullet.spell && (b.bullet.spell.noDirectDamage);
			if (noDirect && b.bullet.damage.damage != 0) continue;
			if (pierce && b.bullet.damage.damage != 0) continue;
			if (!KDBulletCanHitEntity(b, entity) && !force) continue;

			if (entity.player) KDBulletHitPlayer(b, KinkyDungeonPlayerEntity);
			else KDBulletHitEnemy(b, entity, 0, b.bullet.NoMsg);
			if (!pierce) {
				KinkyDungeonBullets.splice(E, 1);
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
 *
 * @param {any} b
 * @param {number} born
 * @param {boolean} [outOfTime]
 * @param {boolean} [outOfRange]
 * @param {number} [d] - Fraction of the timestep that this hit happened in
 * @param {number} [dt] - Timestep
 * @param {boolean} [end] - If the bullet is dying
 */
function KinkyDungeonBulletHit(b, born, outOfTime, outOfRange, d, dt, end) {
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
		if (KDToggles.Sound && (b.bullet.faction == "Player" || KinkyDungeonVisionGet(b.x, b.y) > 0)) {
			KDDamageQueue.push({sfx: KinkyDungeonRootDirectory + "Audio/" + b.bullet.spell.landsfx + ".ogg"});
		}
		//KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + b.bullet.spell.landsfx + ".ogg");
	}
	KinkyDungeonSendEvent("beforeBulletHit", {bullet: b, target: undefined, outOfRange:outOfRange, outOfTime: outOfTime});

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
			bullet:{
				bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin,
				hitevents: b.bullet.spell.hitevents,
				faction: b.bullet.faction, lifetime: 1, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height
			}};
		KinkyDungeonBullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false, d);
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "buff" || b.bullet.hit == "buffonly" || b.bullet.hit == "buffnoAoE") {
		if (b.bullet.hit == "buff") {
			let newB = {born: born, time:1, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
				bullet:{
					bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
					bulletSpin: b.bullet.spell?.hitSpin,
					faction: b.bullet.faction, lifetime: 1, passthrough:true,
					hitevents: b.bullet.spell.hitevents, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
			KinkyDungeonBullets.push(newB);
			KinkyDungeonUpdateSingleBulletVisual(newB, false, d);
		}
		if (b.bullet.spell) {
			let aoe = b.bullet.spell.aoe ? b.bullet.spell.aoe : 0.5;
			if (b.bullet.hit == "buffnoAoE") aoe = 0.5;
			if (b.bullet.spell && (b.bullet.spell.playerEffect || b.bullet.playerEffect) && AOECondition(b.x, b.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, aoe, KDBulletAoEMod(b))) {
				KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, b.bullet.damage.type, b.bullet.playerEffect ? b.bullet.playerEffect : b.bullet.spell.playerEffect, b.bullet.spell, b.bullet.faction, b);
			}
			for (let enemy of KinkyDungeonEntities) {
				if (((enemy.x == b.x && enemy.y == b.y) || (b.bullet.spell && aoe && AOECondition(b.x, b.y, enemy.x, enemy.y, aoe, KDBulletAoEMod(b))))) {
					for (let buff of b.bullet.spell.buffs) {
						if (buff.enemies
							&& (!buff.noAlly || !b.bullet.faction || KDFactionRelation(b.bullet.faction, KDGetFaction(enemy)) < 0.5)
							&& (!buff.onlyAlly || !b.bullet.faction || KDFactionRelation(b.bullet.faction, KDGetFaction(enemy)) >= 0.5)) {
							if (!enemy.buffs) enemy.buffs = {};
							KinkyDungeonApplyBuff(enemy.buffs, buff);
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
			bullet:{faction: b.bullet.faction, spell:b.bullet.spell, bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin, damage: {
					damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage,
					hitevents: b.bullet.spell.hitevents,
					distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, bindEff: b.bullet.spell.bindEff,
					bind: b.bullet.spell.bind, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KinkyDungeonBullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false, d);

		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "instant") {
		if (!KinkyDungeonBulletsCheckCollision(b, true, true, d)) {
			if (!(b.bullet.spell && (b.bullet.spell.piercing || (b.bullet.spell.pierceEnemies && KinkyDungeonTransparentObjects.includes(KinkyDungeonMapGet(b.x, b.y)))))) {
				let ind = KinkyDungeonBullets.indexOf(b);
				if (ind > -1)
					KinkyDungeonBullets.splice(ind, 1);
				KinkyDungeonBulletsID[b.spriteID] = null;
				KinkyDungeonUpdateSingleBulletVisual(b, true, d);
				KinkyDungeonSendEvent("bulletDestroy", {bullet: b, target: undefined, outOfRange:outOfRange, outOfTime: outOfTime});
			}
		}
		let newB = {born: born, time:1, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(), bullet:{
			hitevents: b.bullet.spell.hitevents,
			bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
			bulletSpin: b.bullet.spell?.hitSpin,
			faction: b.bullet.faction, lifetime: 1, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KinkyDungeonBullets.push(newB);
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
				if (AOECondition(b.x, b.y, b.x + X, b.y + Y, rad, KDBulletAoEMod(b))) {
					let dd = KDistEuclidean(X, Y) / rad;
					let LifetimeBonus = (b.bullet.spell.lifetimeHitBonus) ? Math.floor(KDRandom() * b.bullet.spell.lifetimeHitBonus) : 0;
					let newB = {delay: dd, born: born, time:b.bullet.spell.lifetime + LifetimeBonus, x:b.x+X, y:b.y+Y, vx:0, vy:0, xx:b.x+X, yy:b.y+Y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
						bullet:{faction: b.bullet.faction, spell:b.bullet.spell, block: (b.bullet.blockhit ? b.bullet.blockhit : 0),
							bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight, hit: b.bullet.spell?.secondaryhit,
							bulletSpin: b.bullet.spell?.hitSpin,
							effectTileLinger: b.bullet.spell.effectTileLinger, effectTileDurationModLinger: b.bullet.spell.effectTileDurationModLinger,
							hitevents: b.bullet.spell.hitevents,
							damage: {
								damage:b.bullet.spell.power, type:b.bullet.spell.damage, bind: b.bullet.spell.bind, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time,
								distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, bindEff: b.bullet.spell.bindEff,
							}, lifetime: b.bullet.spell.lifetime + LifetimeBonus, name:b.bullet.name+"Hit", width:1, height:1}};
					KinkyDungeonBullets.push(newB);
					KinkyDungeonUpdateSingleBulletVisual(newB, false, dd);
				}
			}

	} else if (b.bullet.hit == "heal") {
		let newB = {born: born, time:b.bullet.spell.lifetime, x:b.x, y:b.y, vx:0, vy:0, xx:b.x, yy:b.y, spriteID: KinkyDungeonGetEnemyID() + b.bullet.name+"Hit" + CommonTime(),
			bullet:{faction: b.bullet.faction, spell:b.bullet.spell, bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
				bulletSpin: b.bullet.spell?.hitSpin,
				damage: {
					damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage,
					hitevents: b.bullet.spell.hitevents,
					distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, bindEff: b.bullet.spell.bindEff,
					bind: b.bullet.spell.bind, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time
				}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height}};
		KinkyDungeonBullets.push(newB);
		KinkyDungeonUpdateSingleBulletVisual(newB, false);

		if (b.bullet.spell && (b.bullet.spell.playerEffect || b.bullet.playerEffect) && AOECondition(b.x, b.y, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, b.spell.aoe, KDBulletAoEMod(b))) {
			KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, b.bullet.damage.type, b.bullet.playerEffect ? b.bullet.playerEffect : b.bullet.spell.playerEffect, b.bullet.spell, b.bullet.faction, b);
		}
		for (let enemy of KinkyDungeonEntities) {
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
					KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#ffaa00", 3);
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
				bullet:{faction: b.bullet.faction, spell:b.bullet.spell,
					bulletColor: b.bullet.spell?.hitColor, bulletLight: b.bullet.spell?.hitLight,
					bulletSpin: b.bullet.spell?.hitSpin,
					damage: {
						damage:(b.bullet.spell.aoedamage) ? b.bullet.spell.aoedamage : b.bullet.spell.power, type:b.bullet.spell.damage, boundBonus: b.bullet.spell.boundBonus,
						hitevents: b.bullet.spell.hitevents,
						distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, bindEff: b.bullet.spell.bindEff,
						bind: b.bullet.spell.bind, bindType: b.bullet.spell.bindType, time:b.bullet.spell.time}, aoe: b.bullet.spell.aoe, lifetime: b.bullet.spell.lifetime, passthrough:true, name:b.bullet.name+"Hit", width:b.bullet.width, height:b.bullet.height
				}};
			KinkyDungeonBullets.push(newB);
			KinkyDungeonUpdateSingleBulletVisual(newB, false);

			KinkyDungeonMoveTo(b.x, b.y, true);
		}
		if (b.bullet.effectTile) {
			KDCreateAoEEffectTiles(b.x, b.y, b.bullet.effectTile, b.bullet.effectTileDurationMod, (b.bullet.spell.effectTileAoE ? b.bullet.spell.effectTileAoE : ((b.bullet.spell.aoe) ? b.bullet.spell.aoe : 0.5)), undefined, b.bullet.spell.effectTileDensity, KDBulletAoEMod(b));
		}
	} else if (b.bullet.hit == "summon") {
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
					if (!faction && b.bullet.spell && b.bullet.spell.enemySpell) faction = "Enemy";
					else if (!faction && b.bullet.spell && b.bullet.spell.allySpell) faction = "Player";

					if (b.bullet.faction) faction = b.bullet.faction;
					if (sum.faction) faction = sum.faction;
					let e = KinkyDungeonSummonEnemy(b.x, b.y, summonType, count, rad, sum.strict, sum.time ? sum.time : undefined, sum.hidden, sum.goToTarget, faction, faction && KDFactionRelation("Player", faction) <= -0.5, sum.minRange, undefined, undefined, sum.hideTimer, undefined, KDBulletAoEMod(b), sum.bound ? b.bullet.source : undefined, sum.weakBinding);
					created += e;
				}
			}
		}
		if (!b.bullet.spell || !b.bullet.spell.noSumMsg) {
			if (created == 1) KinkyDungeonSendTextMessage(6, TextGet("KinkyDungeonSummonSingle"+type), "white", 2, undefined, undefined, b);
			else if (created > 1) KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonSummonMulti"+type).replace("SummonCount", "" + created), "white", 3, undefined, undefined, b);
		}
	}
}


function KinkyDungeonSummonEnemy(x, y, summonType, count, rad, strict, lifetime, hidden, goToTarget, faction, hostile, minrad, startAware, noBullet, hideTimer, pathfind, mod, boundTo, weakBinding) {
	let slots = [];
	for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
		for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
			if (AOECondition(x, y, x + X, y + Y, rad, mod) && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
				if ((x + X > 0 && y + Y > 0 && x + X < KinkyDungeonGridWidth && y + Y < KinkyDungeonGridHeight))
					slots.push({x:X, y:Y});
			}
		}

	if (slots.length == 0) return 0;
	let created = 0;
	let maxcounter = 0;
	let Enemy = KinkyDungeonGetEnemyByName(summonType);
	for (let C = 0; C < count && (KinkyDungeonEntities.length < 300 || faction == "Player" || faction == "Ambush" || faction == "Prisoner") && maxcounter < count * 30; C++) {
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
				let e = {summoned: true, boundTo: boundTo, weakBinding: weakBinding, faction: faction, hostile: hostile ? 100 : undefined, hideTimer: hideTimer, rage: Enemy.summonRage ? 9999 : undefined, Enemy: Enemy, id: KinkyDungeonGetEnemyID(), gx: goToTarget ? KinkyDungeonTargetX : undefined, gy: goToTarget ? KinkyDungeonTargetY : undefined,
					x:x+slot.x, y:y+slot.y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0, lifetime: lifetime, maxlifetime: lifetime, path: path};
				KDProcessCustomPatron(Enemy, e);
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
				created += 1;
			}
		} else C -= 1;
		maxcounter += 1;
	}
	return created;
}

function KinkyDungeonBulletDoT(b) {
	KinkyDungeonBulletHit(b, 1.1);
}

function KinkyDungeonBulletTrail(b) {
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
								bulletColor: b.bullet.spell?.trailColor, bulletLight: b.bullet.spell?.trailLight,
								bulletSpin: b.bullet.spell?.hitSpin, damage: {
									damage:b.bullet.spell.trailPower, type:b.bullet.spell.trailDamage, boundBonus: b.bullet.spell.boundBonus,
									hitevents: b.bullet.spell.hitevents,
									distract: b.bullet.spell.distract, distractEff: b.bullet.spell.distractEff, bindEff: b.bullet.spell.bindEff,
									bind: b.bullet.spell.trailBind, bindType: b.bullet.spell.bindType, time:b.bullet.spell.trailTime}, lifetime: b.bullet.spell.trailLifetime, name:b.bullet.name+"Trail", width:1, height:1}};
						KinkyDungeonBullets.push(newB);
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
							KinkyDungeonCastSpell(b.x + X, b.y + Y, spell, undefined, undefined, undefined);
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

function KinkyDungeonBulletsCheckCollision(bullet, AoE, force, d, inWarningOnly, delta) {
	let mapItem = KinkyDungeonMapGet(bullet.x, bullet.y);
	if (!bullet.bullet.passthrough && !bullet.bullet.piercing && !KinkyDungeonOpenObjects.includes(mapItem)) return false;

	KDBulletEffectTiles(bullet);

	if (bullet.bullet.noEnemyCollision && !(bullet.bullet && bullet.bullet.alwaysCollideTags)) return true;

	if (bullet.delay && !d) d = bullet.delay;

	let hitEnemy = false;
	if (bullet.bullet.damage && (bullet.time > 0 || force)) {
		if ((AoE || (bullet.vx != 0 || bullet.vy != 0))) { // Moving bullets always have a chance to hit, while AoE only has a chance to hit when AoE is explicitly being checked
			if (bullet.bullet.aoe ? KDBulletAoECanHitEntity(bullet, KinkyDungeonPlayerEntity) : KDBulletCanHitEntity(bullet, KinkyDungeonPlayerEntity, inWarningOnly)) {
				if (!bullet.bullet.spell || bullet.born < 1 || (bullet.vx == 0 && bullet.vy == 0) || bullet.bullet.spell.enemySpell) { // Projectiles just born cant hurt you, unless they're enemy projectiles
					if (!(!bullet.secondary && bullet.bullet.spell && bullet.bullet.spell.noDirectDamage))
						KDBulletHitPlayer(bullet, KinkyDungeonPlayerEntity);
					hitEnemy = true;
				}
			}
			let nomsg = bullet.bullet && bullet.bullet.spell && bullet.bullet.spell.enemyspell && !bullet.reflected;
			for (let enemy of KinkyDungeonEntities) {
				let overrideCollide = !bullet.bullet.aoe ? false : (bullet.bullet.spell && bullet.bullet.alwaysCollideTags && bullet.bullet.alwaysCollideTags.some((tag) => {return enemy.Enemy.tags[tag];}));
				if (bullet.bullet.aoe ? KDBulletAoECanHitEntity(bullet, enemy) : KDBulletCanHitEntity(bullet, enemy, inWarningOnly, overrideCollide)) {
					if (!(!bullet.secondary && bullet.bullet.spell && bullet.bullet.spell.noDirectDamage)) {
						KDBulletHitEnemy(bullet, enemy, d, nomsg);
						nomsg = true;
					}
					hitEnemy = true;
				}
			}

			KDUpdateBulletEffects(bullet, d);

		}
	}
	if (!bullet.bullet.aoe && hitEnemy) return false;

	if (!(bullet.bullet.block > 0) && bullet.vx != 0 || bullet.vy != 0) {

		for (let b2 of KinkyDungeonBullets) {
			if (b2 != bullet && b2.bullet.block > 0 && b2.x == bullet.x && b2.y == bullet.y) {
				b2.bullet.block -= bullet.bullet.damage.damage;
				if (b2.bullet.block <= 0) b2.bullet.block = -1;

				return false;
			}
		}
	} else if (bullet.bullet.block == -1) return false; // Shields expire

	if (bullet.bullet.lifetime == -1) return false; // Instant spells

	if (!bullet.bullet.passthrough && !KinkyDungeonOpenObjects.includes(mapItem)) return false;
	return true;
}

function KDBulletAoECanHitEntity(bullet, enemy) {
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
function KDBulletCanHitEntity(bullet, enemy, inWarningOnly, overrideCollide) {
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

/**
 *
 * @param {any} bullet
 */
function KDBulletEffectTiles(bullet) {
	if (bullet.bullet.spell && bullet.bullet.spell.type == "dot") {
		if (bullet.bullet.spell.effectTileDoT) {
			KDCreateAoEEffectTiles(bullet.x, bullet.y, bullet.bullet.spell.effectTileDoT, bullet.bullet.spell.effectTileDurationModDoT, (bullet.bullet.spell.effectTileAoE ? bullet.bullet.spell.effectTileAoE : ((bullet.bullet.spell.aoe) ? bullet.bullet.spell.aoe : 0.5)), undefined, bullet.bullet.spell.effectTileDensityDoT, KDBulletAoEMod(bullet));
		}
	}

	if (bullet.bullet.effectTileLinger) {
		if (bullet.bullet.effectTileLinger) {
			KDCreateEffectTile(bullet.x, bullet.y, bullet.bullet.effectTileLinger, bullet.bullet.effectTileDurationModLinger);
		}
	}
}

function KDBulletHitPlayer(bullet, player) {
	let pf = bullet.bullet.playerEffect ? bullet.bullet.playerEffect : bullet.bullet.spell.playerEffect;
	if (pf) {
		KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, bullet.bullet.damage.type, pf, bullet.bullet.spell, bullet.bullet.faction, bullet);
		KDUniqueBulletHits.set(KDBulletID(bullet, player), true);
	}
}

/**
 *
 * @param {any} bullet
 * @param {entity} enemy
 * @param {number} d
 * @param {boolean} nomsg
 */
function KDBulletHitEnemy(bullet, enemy, d, nomsg) {
	KinkyDungeonSendEvent("bulletHitEnemy", {bullet: bullet, enemy: enemy});
	KDUniqueBulletHits.set(KDBulletID(bullet, enemy), true);
	if (bullet.bullet.damage.type == "heal") {
		let origHP = enemy.hp;
		enemy.hp = Math.min(enemy.hp + bullet.bullet.spell.power, enemy.Enemy.maxhp);
		if (bullet.bullet.faction == "Player" || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0)
			KinkyDungeonSendFloater(enemy, `+${Math.round((enemy.hp - origHP) * 10)}`, "#ffaa00", 3);
		if (bullet.bullet.faction == "Player")
			KDHealRepChange(enemy, enemy.hp - origHP);
	} else if (bullet.bullet.faction == "Player" || KinkyDungeonVisionGet(enemy.x, enemy.y) > 0)
		KinkyDungeonDamageEnemy(enemy, bullet.bullet.damage, true, nomsg, bullet.bullet.spell, bullet, undefined, d);
}

// Gets ID for unique bullet hits
function KDBulletID(bullet, enemy) {
	if (enemy.player)
		return (bullet.name) + (bullet.bullet.spell) + "_player";
	return (bullet.name) + (bullet.bullet.spell) + "_" + (enemy.id);
}


function KinkyDungeonLaunchBullet(x, y, targetx, targety, speed, bullet, miscast) {
	let direction = (!targetx && !targety) ? 0 : Math.atan2(targety, targetx);
	let vx = (targetx != 0 && targetx != undefined) ? Math.cos(direction) * speed : 0;
	let vy = (targety != 0 && targety != undefined) ? Math.sin(direction) * speed : 0;
	let lifetime = bullet.lifetime;
	if (miscast) {
		vx = 0;
		vy = 0;
		//lifetime = 1;
	}
	let b = {born: 1, time:lifetime, x:x, y:y, vx:vx, vy:vy, xx:x, yy:y, spriteID: KinkyDungeonGetEnemyID() + bullet.name + CommonTime(), bullet:bullet, trail:bullet.spell.trail, trailEffectTile: bullet.spell.effectTileTrail};
	KinkyDungeonBullets.push(b);
	KinkyDungeonUpdateSingleBulletVisual(b, false);
	return b;
}

function KinkyDungeonDrawFight(canvasOffsetX, canvasOffsetY, CamX, CamY) {
	for (let damage of KDDamageQueue) {
		if (!damage.Delay || KDTimescale * (performance.now() - KDLastTick) > damage.Delay) {
			if (damage.sfx && KDToggles.Sound) KinkyDungeonPlaySound(damage.sfx);

			if (damage.floater) {
				KinkyDungeonSendFloater(damage.Entity, damage.floater, damage.Color, damage.Time);
			}

			KDDamageQueue.splice(KDDamageQueue.indexOf(damage), 1);
		}
	}

	for (let t of KDBulletWarnings) {
		let tx = t.x;
		let ty = t.y;
		//  && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tx, ty))
		if (tx >= CamX && ty >= CamY && tx < CamX + KinkyDungeonGridWidthDisplay && ty < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(tx, ty) > 0) {
			KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w" + t.color, KinkyDungeonRootDirectory + "WarningColorSpell.png",
				(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
				KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
					tint: string2hex(t.color || "#ff5555"),
					zIndex: 1.31,
					alpha: 0.75,
				});
			KDDraw(kdgameboard, kdpixisprites, tx + "," + ty + "_w_b" + t.color, KinkyDungeonRootDirectory + "WarningBacking.png",
				(tx - CamX)*KinkyDungeonGridSizeDisplay, (ty - CamY)*KinkyDungeonGridSizeDisplay,
				KinkyDungeonSpriteSize, KinkyDungeonSpriteSize, undefined, {
					tint: string2hex(t.color || "#ff5555"),
					zIndex: -0.2,
					alpha: 0.6
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

			if ((bullet.end) && dd == 0 && (!bullet.scale || bullet.scale <= 0.0)) {
				KinkyDungeonBulletsVisual.delete(bullet.spriteID);
			} else if (bullet.xx >= CamX && bullet.yy >= CamY && bullet.xx < CamX + KinkyDungeonGridWidthDisplay && bullet.yy < CamY + KinkyDungeonGridHeightDisplay
				&& (KinkyDungeonVisionGet(Math.round(tx), Math.round(ty)) > 0 || KDistChebyshev(tx - KinkyDungeonPlayerEntity.x, ty - KinkyDungeonPlayerEntity.y) < aoe) && alpha > 0) {

				if (!bullet.end && bullet.temporary && alpha >= 1.0 && scale >= 1.0) {
					bullet.end = true;
				}

				KDDraw(kdgameboard, kdpixisprites, bullet.spriteID, KinkyDungeonRootDirectory + "Bullets/" + sprite + ".png",
					(tx - CamX + 0.5)*KinkyDungeonGridSizeDisplay,
					(ty - CamY + 0.5)*KinkyDungeonGridSizeDisplay,
					bullet.size*scale*KinkyDungeonGridSizeDisplay,
					bullet.size*scale*KinkyDungeonGridSizeDisplay,
					(!bullet.vy && !bullet.vx) ? bullet.spinAngle : bullet.spinAngle + Math.atan2(bullet.vy, bullet.vx), {
						alpha : alpha,
						zIndex: -0.01,
					}, true);
			}
			bullet.delay = undefined;
		}
	}
}

function KinkyDungeonSendWeaponEvent(Event, data) {
	if (!KDMapHasEvent(KDEventMapWeapon, Event)) return;
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.events) {
		for (let e of KinkyDungeonPlayerDamage.events) {
			if (e.trigger == Event && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
				KinkyDungeonHandleWeaponEvent(Event, e, KinkyDungeonPlayerDamage, data);
			}
		}
	}
}

function KinkyDungeonSendBulletEvent(Event, b, data) {
	if (!KDMapHasEvent(KDEventMapBullet, Event)) return;
	if (b && b.bullet && b.bullet.events)
		for (let e of b.bullet.events) {
			if (e.trigger == Event) {
				KinkyDungeonHandleBulletEvent(Event, e, b, data);
			}
		}
	if (b && b.bullet && b.bullet.hitevents)
		for (let e of b.bullet.hitevents) {
			if (e.trigger == Event) {
				KinkyDungeonHandleBulletEvent(Event, e, b, data);
			}
		}
}


function KDHealRepChange(enemy, amount) {
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
	if (amountRep > 0 && !KinkyDungeonHiddenFactions.includes(KDGetFactionOriginal(enemy))) {
		if (amountRep > 0.01) amountRep = 0.01;
		KinkyDungeonChangeFactionRep(KDGetFactionOriginal(enemy), amountRep);
	}
}

function KDApplyGenBuffs(entity, buff, time) {
	let buffs = KDBuffReference[buff];
	if (buffs && entity) {
		for (let b of buffs) {
			let newBuff = Object.assign({}, b);
			if (newBuff && time) newBuff.duration = time;
			KinkyDungeonApplyBuffToEntity(entity, newBuff);
		}
	}
}

function KDSilenceEnemy(enemy, time) {
	if (!enemy.silence) enemy.silence = 0;
	enemy.silence = Math.max(time, enemy.silence);
}
function KDBlindEnemy(enemy, time) {
	if (!enemy.blind) enemy.blind = 0;
	enemy.blind = Math.max(time, enemy.blind);
}
function KDDisarmEnemy(enemy, time) {
	if (!enemy.disarm) enemy.disarm = 0;
	enemy.disarm = Math.max(time, enemy.disarm);
}

let KDPrereqs = {
	"NoChastity": (enemy, e, data) => {return KDEntityBuffedStat(enemy, "Chastity") < 0.01;},
	"blinded": (enemy, e, data) => {return enemy.blind > 0;},
	"silenced": (enemy, e, data) => {return enemy.silence > 0;},
	"disarmed": (enemy, e, data) => {return enemy.disarm > 0;},
	"bound": (enemy, e, data) => {return enemy.boundLevel > 0;},
	"Waiting": (enemy, e, data) => {return (enemy && !enemy.player) ? enemy.idle : KinkyDungeonLastTurnAction == "Wait";},
	"damageType": (enemy, e, data) => {
		switch (e.kind) {
			case "melee": return KinkyDungeonMeleeDamageTypes.includes(data.Damage?.type);
			case "magic": return !KinkyDungeonMeleeDamageTypes.includes(data.Damage?.type);
		}
		return data.Damage?.type == 'e.kind';
	},
};
function KDCheckPrereq(enemy, prereq, e, data) {
	if (!prereq) return true;
	if (KDPrereqs[prereq]) return KDPrereqs[prereq](enemy, e, data);
	return false;
}

function KDBulletAoEMod(b) {
	return b?.bullet?.aoetype || b?.bullet?.spell?.aoetype;
}
function KDBulletTrailAoEMod(b) {
	return b?.bullet?.aoetypetrail || b?.bullet?.spell?.aoetypetrail;
}

/**
 *
 * @param {number} bx
 * @param {number} by
 * @param {number} xx
 * @param {number} yy
 * @param {number} rad
 * @param {string} modifier
 */
function AOECondition(bx, by, xx, yy, rad, modifier = "") {
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
	return KDistEuclidean(bx - xx, by - yy) <= rad;
}

/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} name
 */
function KDCreateParticle(xx, yy, name) {
	let newB = {born: 0, time:2, x:Math.round(xx), y:Math.round(yy), vx:0, vy:0, xx:xx, yy:yy, spriteID: KinkyDungeonGetEnemyID() + name + CommonTime(),
		bullet:{faction: "Rage", spell:undefined, damage: undefined, lifetime: 2, passthrough:true, name:name, width:1, height:1}};
	KinkyDungeonBullets.push(newB);
	KinkyDungeonUpdateSingleBulletVisual(newB, false);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {number} aoe
 * @param {any} Damage
 * @param {entity} Damage
 */
function KDDealEnvironmentalDamage(x, y, aoe, Damage, Attacker) {
	for (let enemy of KDNearbyEnemies(x, y, aoe)) {
		KinkyDungeonDamageEnemy(enemy, Damage, true, true, undefined, undefined, Attacker, 0.1);
	}
	if (KinkyDungeonPlayerEntity.x == x && KinkyDungeonPlayerEntity.y == y) {
		KinkyDungeonPlayerEffect(KinkyDungeonPlayerEntity, Damage.type, {name: "EnvDamage", power: Damage.damage, damage: Damage.type}, undefined, KDGetFaction(Attacker), undefined);
	}
}