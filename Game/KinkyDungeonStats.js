"use strict";
// Player entity
let KinkyDungeonPlayerEntity = null; // The current player entity

let KDSleepWillFraction = 0.5;
let KDSleepWillFractionJail = 0.5;

function KDGetSleepWillFraction() {
	if (KDGameData.PrisonerState == 'jail') return KDSleepWillFractionJail;
	return KDSleepWillFraction;
}

// Distraction -- It lowers your stamina regen
let KDMaxStat = 40; // Maximum any stat can get boosted to
let KDMaxStatStart = 10; // Start of stats
let KDMaxStatStartPool = 40; // Start of stats


let KDSleepRegenWill = KDSleepWillFractionJail * KDMaxStatStart/40;

let KinkyDungeonStatDistractionMax = KDMaxStatStart;
let KinkyDungeonStatDistractionLower = 0;
let KinkyDungeonStatDistractionLowerCap = 0.9;
let KinkyDungeonStatArousalLowerRegenSleep = 0; // Decrease lower distraction in sleep?
let KinkyDungeonDistractionUnlockSuccessMod = 0.5; // Determines how much harder it is to insert a key while aroused. 1.0 is half success chance, 2.0 is one-third, etc.
let KinkyDungeonStatDistraction = 0;
let KinkyDungeonCrotchRopeDistraction = 0.4;
let KinkyDungeonStatDistractionRegen = -1.0;
let KinkyDungeonStatDistractionRegenPerUpgrade = KinkyDungeonStatDistractionRegen*0.5;
let KDNoUnchasteBraMult = 0.9;
let KDNoUnchasteMult = 0.8;
let KDDistractionDecayMultDistractionMode = 0.25;
let KDDistractedAmount = 0.15;
let KinkyDungeonStatDistractionMiscastChance = 0.7; // Miscast chance at max distraction
let KinkyDungeonMiscastChance = 0;
let KinkyDungeonVibeLevel = 0;
let KinkyDungeonTeaseLevel = 0;
let KinkyDungeonTeaseLevelBypass = 0;
let KinkyDungeonOrgasmVibeLevel = 0;
let KinkyDungeonDistractionPerVibe = 0.05; // How much distraction per turn per vibe energy cost
let KinkyDungeonDistractionPerPlug = 0.1; // How much distraction per move per plug level
let KinkyDungeonVibeCostPerIntensity = 0.15;

let KinkyDungeonStatWillpowerExhaustion = 0;
let KinkyDungeonSleepTurnsMax = 41;
let KinkyDungeonSlowMoveTurns = 0;
// Note that things which increase max distraction (aphrodiasic) also increase the max stamina drain. This can end up being very dangerous as being edged at extremely high distraction will drain all your energy completely, forcing you to wait until the torment is over or the drugs wear off

// Stamina -- your MP. Used to cast spells and also struggle
let KinkyDungeonStatStaminaMax = KDMaxStatStart;
let KinkyDungeonStatStamina = KinkyDungeonStatStaminaMax;
let KinkyDungeonStatStaminaRegen = 0.5;
let KinkyDungeonStatStaminaRegenPerUpgrade = 0.0;
let KinkyDungeonStatStaminaRegenPerUpgradeWill = 0.1;
let KDNarcolepticRegen = -0.06;
let KinkyDungeonStatStaminaRegenJail = 0.125;
let KinkyDungeonStatStaminaRegenSleep = KinkyDungeonStatStaminaMax/40;
let KinkyDungeonStatStaminaRegenSleepBedMultiplier = 1.5;
let KinkyDungeonStatStaminaRegenWait = 0;
let KinkyDungeoNStatStaminaLow = 4;
let KDSprintCost = 1; // Cost of sprinting
let KDSprintCostSlowLevel = [0, 0.5, 1.0, 2.0]; // Extra cost per slow level
let KinkyDungeonStatWillMax = KDMaxStatStart;
let KinkyDungeonStatWill = KinkyDungeonStatWillMax;
let KinkyDungeonStatWillRate = 0;
let KinkyDungeonStatManaMax = KDMaxStatStart;
let KinkyDungeonStatMana = KinkyDungeonStatManaMax;
let KinkyDungeonStatManaPool = KinkyDungeonStatManaMax;
let KinkyDungeonStatManaPoolMax = KDMaxStatStartPool;
let KDManaPoolRatio = 1.0; // 1 point of mana costs 1 points of pool mana
let KinkyDungeonStatManaRate = 0;
let KinkyDungeonStatManaRegen = 0; // How fast stamina that is converted to mana regenerates
let KinkyDungeonStatManaLowRegen = 0; // How fast stamina that is converted to mana regenerates when low
let KDMeditationRegen = 0.1;
let KinkyDungeonStatManaRegenLowThreshold = 5; // Threshold for fast mana regen
let KinkyDungeonStatManaPoolRegen = 0.01; // Threshold for pool mana regen, % of max mana
let KinkyDungeonStatStaminaRegenPerSlowLevel = -0.03; // It costs stamina to move while bound
let KinkyDungeonStatStaminaCostStruggle = -3.0; // It costs stamina to struggle
let KinkyDungeonStatStaminaCostRemove = -0.5; // It costs stamina to struggle
let KinkyDungeonStatStaminaCostTool = -0.2; // It costs stamina to cut, but much less
let KinkyDungeonStatStaminaCostPick = -0.1; // It costs stamina to pick, but much less


let KinkyDungeonStatWillCostStruggle = 0; // It costs will to struggle
let KinkyDungeonStatWillCostRemove = 0; // It costs will to struggle
let KinkyDungeonStatWillCostTool = 0; // It costs will to cut, but much less
let KinkyDungeonStatWillCostPick = 0; // It costs stamina to pick, but much less
let KinkyDungeonStatWillCostUnlock = 0; // It costs stamina to pick, but much less

let KinkyDungeonStatWillCostEscape = -0.2; // It costs will to struggle out of an item
let KinkyDungeonStatWillBonusEscape = 0.2; // Bonus for Second Wind

let KinkyDungeonStaminaRate = KinkyDungeonStatStaminaRegen;

// Current Status
let KinkyDungeonStatBeltLevel = 0; // Chastity bra does not add belt level
let KinkyDungeonStatPlugLevel = 0; // Cumulative with front and rear plugs
let KinkyDungeonPlugCount = 0;
let KinkyDungeonStatVibeLevel = 0; // Cumulative with diminishing returns for multiple items
let KinkyDungeonStatEdged = false; // If all vibrating effects are edging, then this will be true

let KinkyDungeonStatDistractionGainChaste = -0.1; // Cumulative w/ groin and bra


// Restraint stats

let KinkyDungeonSlowLevel = 0; // Adds to the number of move points you need before you move
let KinkyDungeonMovePoints = 0;

let KinkyDungeonBlindLevelBase = 0; // Base, increased by buffs and such, set to 0 after consumed in UpdateStats
let KinkyDungeonBlindLevel = 0; // Blind level 1: -33% vision, blind level 2: -67% vision, Blind level 3: Vision radius = 1
let KinkyDungeonStatBlind = 0; // Used for temporary blindness
let KinkyDungeonStatFreeze = 0; // Used for temporary freeze
let KinkyDungeonStatBind = 0; // Used for temporary bind
let KinkyDungeonDeaf = false; // Deafness reduces your vision radius to 0 if you are fully blind (blind level 3)
let KinkyDungeonSleepiness = 0; // Sleepiness
let KinkyDungeonSleepinessMax = 10;

// Other stats
let KinkyDungeonGold = 0;
let KinkyDungeonLockpicks = 0;
// 3 types of keys, for 4 different types of padlocks. The last type of padlock requires all 3 types of keys to unlock
// The red keys are one-use only as the lock traps the key
// The green keys are multi-use, but jam often
// The blue keys cannot be picked or cut.
// Monsters are not dextrous enough to steal keys from your satchel, although they may spill your satchel on a nearby tile
let KinkyDungeonRedKeys = 0;
let KinkyDungeonBlueKeys = 0;

let KinkyDungeonHasCrotchRope = false;

// Combat
let KinkyDungeonTorsoGrabChance = 0.4;
let KinkyDungeonTorsoGrabChanceBonus = 0.2;
let KinkyDungeonWeaponGrabChance = 1.0;

/**
 * Your inventory contains items that are on you
 * @type {Map<string, Map<string, item>>}
 */
let KinkyDungeonInventory = new Map();
function KDInitInventory() {
	KinkyDungeonInventory = new Map();
	for (const c of [Consumable, Restraint, LooseRestraint, Weapon, Outfit]) {
		KinkyDungeonInventory.set(c, new Map());
	}
}

let KinkyDungeonPlayerTags = new Map();

let KinkyDungeonCurrentDress = "Default";
let KinkyDungeonUndress = 0; // Level of undressedness

// Current list of spells
/**
 * @type {spell[]}
 */
let KinkyDungeonSpells = [];
let KinkyDungeonPlayerBuffs = {};

// Temp - for multiplayer in future
let KinkyDungeonPlayers = [];

// For items like the cursed collar which make more enemies appear
let KinkyDungeonDifficulty = 0;

let KinkyDungeonSubmissiveMult = 0;

let KinkyDungeonSpellPoints = 3;

let KDClassStart = {
	"Fighter": () => { // Fighter
		KinkyDungeonInventoryAddWeapon("Knife");
		KinkyDungeonInventoryAddWeapon("Sword");
		KDGameData.PreviousWeapon = "Knife";
		KDSetWeapon("Sword");
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("WPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("WPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("IronWill"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonRedKeys = 1;
		KinkyDungeonLockpicks = 1;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 2);
	},
	"Rogue": () => { // Rogue
		KinkyDungeonInventoryAddWeapon("Rope");
		KinkyDungeonInventoryAddWeapon("Dirk");
		KDGameData.PreviousWeapon = "Rope";
		KDSetWeapon("Dirk");
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("SPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("SPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Sneaky"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonLockpicks = 2;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionStamina, 2);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	},
	"Mage": () => { // Mage
		KinkyDungeonInventoryAddWeapon("Knife");
		KinkyDungeonInventoryAddWeapon("ArcaneCrystal");
		KDGameData.PreviousWeapon = "Knife";
		KDSetWeapon("ArcaneCrystal");
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("Analyze"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
		KinkyDungeonSpells.push(KinkyDungeonFindSpell("MPUp1"));
		KinkyDungeonSpellPoints = 3;
		KinkyDungeonRedKeys = 1;
		KinkyDungeonGold = 100;

		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionMana, 3);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionFrigid, 1);
		KinkyDungeonChangeConsumable(KinkyDungeonConsumables.PotionWill, 1);
	},
	"Peasant": () => { // Peasant
		KinkyDungeonSpells = [];
		KinkyDungeonSpellChoices = [];
	},
};

function KinkyDungeonDefaultStats(Load) {
	KinkyDungeonPenanceCosts = {};
	KinkyDungeonLostItems = [];
	KinkyDungeonFastMove = true;
	KinkyDungeonResetEventVariables();
	KinkyDungeonSetDress("Default", "Default");
	KDGameData.KinkyDungeonSpawnJailers = 0;
	KDGameData.KinkyDungeonSpawnJailersMax = 0;
	KinkyDungeonGold = 0;
	KinkyDungeonLockpicks = 0;
	KinkyDungeonRedKeys = 0;
	KinkyDungeonBlueKeys = 0;


	KinkyDungeonHasCrotchRope = false;

	KinkyDungeonSubmissiveMult = 0;

	KDGameData.HeartTaken = false;

	KDSetWeapon(null);
	KinkyDungeonSpellPoints = 0;

	KinkyDungeonStatDistractionMax = KDMaxStatStart;
	KinkyDungeonStatStaminaMax = KDMaxStatStart;
	KinkyDungeonStatManaMax = KDMaxStatStart;
	KinkyDungeonStatWillMax = KDMaxStatStart;
	KinkyDungeonStaminaRate = KinkyDungeonStatStaminaRegen;

	KinkyDungeonStatBlind = 0;
	KinkyDungeonSlowMoveTurns = 0;
	KDGameData.SleepTurns = 0;
	KinkyDungeonStatBind = 0;
	KinkyDungeonStatFreeze = 0;


	KinkyDungeonPlayerBuffs = {};

	KinkyDungeonMovePoints = 0;
	KDInitInventory();
	KinkyDungeonInventoryAdd({name: "Default", type: Outfit});
	KinkyDungeonInventoryAddWeapon("Unarmed");
	KDSetWeapon("Unarmed");
	KinkyDungeonPlayerTags = new Map();

	KinkyDungeonPlayerDamage = KinkyDungeonPlayerDamageDefault;

	// Initialize all the other systems
	KinkyDungeonResetMagic();
	KinkyDungeonInitializeDresses();
	KinkyDungeonShrineInit();

	if (KDClassStart[KinkyDungeonClassMode]) KDClassStart[KinkyDungeonClassMode]();

	KinkyDungeonSetMaxStats();

	KinkyDungeonStatDistraction = 0;
	KinkyDungeonStatDistractionLower = 0;
	KinkyDungeonStatStamina = KinkyDungeonStatStaminaMax;
	KinkyDungeonStatMana = KinkyDungeonStatManaMax;
	KinkyDungeonStatManaPool = KinkyDungeonStatManaPoolMax;
	KinkyDungeonStatWill = KinkyDungeonStatWillMax;

	KDOrigStamina = KinkyDungeonStatStaminaMax * 10;
	KDOrigMana = KinkyDungeonStatManaMax * 10;
	KDOrigWill = KinkyDungeonStatWillMax * 10;
	KDOrigDistraction = 0;

	if (param_test == 'godmode') {
		KinkyDungeonSeeAll = true;
		KinkyDungeonSpellPoints = 9001;
	}

	if (!Load) {
		for (let perk of [...KinkyDungeonStatsChoice.keys()].filter((e) => {return KDPerkStart[e] != undefined;})
			.sort((a, b) => {
				return ((KinkyDungeonStatsPresets[a] && KinkyDungeonStatsPresets[a].startPriority) || -1) - ((KinkyDungeonStatsPresets[b] && KinkyDungeonStatsPresets[b].startPriority) || -1);
			})) {
			if (KinkyDungeonStatsChoice.get(perk) && KDPerkStart[perk]) {
				KDPerkStart[perk](Load);
				console.log("started with perk " + perk);
			}
		}
	}

	KinkyDungeonDressPlayer();
	CharacterRefresh(KinkyDungeonPlayer);
}

let KDMaxVisionDist = 8;

function KinkyDungeonGetVisionRadius() {
	let data = {
		brightness: KinkyDungeonMapBrightness,
		blindlevel: KinkyDungeonBlindLevel,
		noperipheral: KinkyDungeonDeaf || KinkyDungeonStatBlind > 0
	};
	KinkyDungeonSendEvent("calcVision", data);
	return (KDGameData.SleepTurns > 2) ? 1 : (Math.max((data.noperipheral) ? 1 : 2, Math.round(KDMaxVisionDist-data.blindlevel)));
}

function KinkyDungeonInterruptSleep() {
	KDGameData.SleepTurns = 0;
	KDGameData.PlaySelfTurns = 0;
	if (KinkyDungeonTempWait && !KDGameData.KinkyDungeonLeashedPlayer)
		KinkyDungeonAutoWait = false;
}

let KDBaseDamageTypes = {
	arouseTypes: ["grope", "charm", "happygas"],
	bypassTeaseTypes: ["charm", "happygas"],
	distractionTypesWeakNeg: ["pain", "acid"],
	distractionTypesWeak:["soul"],
	distractionTypesStrong:["tickle", "grope", "charm", "souldrain", "happygas"],
	teaseTypes: ["grope", "charm"],
	staminaTypesWeak:["drain", "stun", "fire", "glue", "chain", "tickle", "electric", "soul"],
	staminaTypesStrong:["ice", "frost", "poison", "crush", "souldrain"],
	manaTypesWeak:["electric", "drain"],
	manaTypesStrong:[],
	willTypesVeryWeak:["tickle", "souldrain"],
	willTypesWeak:["ice", "frost", "poison", "stun", "electric", "acid", "grope", "pierce", "slash", "crush", "unarmed", "glue", "chain"],
	willTypesStrong:["cold", "fire", "charm", "soul", "pain"],
};

function KinkyDungeonDealDamage(Damage, bullet, noAlreadyHit) {
	if (bullet && !noAlreadyHit) {
		if (!bullet.alreadyHit) bullet.alreadyHit = [];
		// A bullet can only damage an enemy once per turn
		if (bullet.alreadyHit.includes("player")) return {happened: 0, string: ""};
		bullet.alreadyHit.push("player");
	}

	let data = {
		dmg: Damage.damage,
		type: Damage.type,
		flags: Damage.flags,
		time: Damage.time,
		armor: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor"),
		armorbreak: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ArmorBreak"),
		spellResist: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist"),
		buffresist: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, Damage.type + "DamageResist"))
			* (KinkyDungeonMeleeDamageTypes.includes(Damage.type) ?
			KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "meleeDamageResist"))
			: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "magicDamageResist"))),
		arouseAmount: 0,
		arouseMod: 1,
		arouseTypes: Object.assign([], KDBaseDamageTypes.arouseTypes),
		bypassTeaseTypes: Object.assign([], KDBaseDamageTypes.bypassTeaseTypes),
		distractionTypesWeakNeg: Object.assign([], KDBaseDamageTypes.distractionTypesWeakNeg),
		teaseTypes: Object.assign([], KDBaseDamageTypes.teaseTypes),
		distractionTypesWeak: Object.assign([], KDBaseDamageTypes.distractionTypesWeak),
		distractionTypesStrong: Object.assign([], KDBaseDamageTypes.distractionTypesStrong),
		staminaTypesWeak: Object.assign([], KDBaseDamageTypes.staminaTypesWeak),
		staminaTypesStrong: Object.assign([], KDBaseDamageTypes.staminaTypesStrong),
		manaTypesWeak: Object.assign([], KDBaseDamageTypes.manaTypesWeak),
		manaTypesStrong: Object.assign([], KDBaseDamageTypes.manaTypesStrong),
		willTypesVeryWeak: Object.assign([], KDBaseDamageTypes.willTypesVeryWeak),
		willTypesWeak: Object.assign([], KDBaseDamageTypes.willTypesWeak),
		willTypesStrong: Object.assign([], KDBaseDamageTypes.willTypesStrong),
		stats: [],
		newstats: [],
		damaged: false,
	};

	if (KinkyDungeonStatsChoice.get("Masochist")) {
		let types = ["pain", "electric", "slash", "pierce", "crush", "fire", "ice", "frost", "acid"];
		data.distractionTypesStrong.push(...types);
		data.arouseMod = Math.max(data.arouseMod, 2.0);
		data.arouseTypes.push(...types);
		if (data.distractionTypesWeakNeg.includes("pain"))
			data.distractionTypesWeakNeg = data.distractionTypesWeakNeg.splice(data.distractionTypesWeakNeg.indexOf("pain"), 1);
		if (data.distractionTypesWeakNeg.includes("acid"))
			data.distractionTypesWeakNeg = data.distractionTypesWeakNeg.splice(data.distractionTypesWeakNeg.indexOf("acid"), 1);
	}

	if (data.arouseTypes.includes(data.type) && !data.arouseAmount) {
		data.arouseAmount = 0.2;
	}
	if (data.arouseAmount < 0) data.arouseAmount = 0;

	KinkyDungeonSendEvent("beforePlayerDamage", data);

	data.dmg *= data.buffresist;

	if (data.armorbreak > 0) data.armor -= Math.min(Math.max(0, data.armor), data.armorbreak);

	if (data.armor && KinkyDungeonMeleeDamageTypes.includes(data.type)) data.dmg = Math.max(0, data.dmg * KDArmorFormula(data.dmg, data.armor));
	else if (data.spellResist && !KinkyDungeonMeleeDamageTypes.includes(data.type)) data.dmg = Math.max(0, data.dmg * KDArmorFormula(data.dmg, data.armor));

	if (data.dmg > 0) {
		let buffreduction = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageReduction");
		if (buffreduction && data.dmg > 0) {
			data.dmg = Math.max(data.dmg - buffreduction, 0);
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "damageTaken", 1);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/Shield.ogg");
		}
	}


	let str = "";

	if (data.dmg > 0)
		data.stats = [
			KinkyDungeonStatDistraction,
			KinkyDungeonStatDistractionLower,
			KinkyDungeonStatMana,
			KinkyDungeonStatWill,
			KinkyDungeonStatStamina,
		];

	if (data.teaseTypes.includes(data.type)) {
		let amt = data.dmg;
		if (data.bypassTeaseTypes.includes(data.type)) {
			KinkyDungeonTeaseLevelBypass += amt;
		} else {
			KinkyDungeonTeaseLevel += amt;
		}
	}

	if (data.distractionTypesWeak.includes(data.type)) {
		let amt = data.dmg/2 * data.arouseMod;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}dp`;
		KinkyDungeonChangeDistraction(amt, true, data.arouseAmount);
	}
	if (data.distractionTypesWeakNeg.includes(data.type)) {
		let amt = -data.dmg/2 * data.arouseMod;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}dp`;
		KinkyDungeonChangeDistraction(amt, true);
	}
	if (data.distractionTypesStrong.includes(data.type)) {
		let amt = data.dmg * data.arouseMod;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}dp`;
		KinkyDungeonChangeDistraction(amt, true, data.arouseAmount);
	}
	if (data.staminaTypesStrong.includes(data.type)) {
		let amt = -data.dmg;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}sp`;
		KinkyDungeonChangeStamina(amt);
	} else if (data.staminaTypesWeak.includes(data.type)) {
		let amt = -data.dmg/2;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}sp`;
		KinkyDungeonChangeStamina(amt);
	}
	if (data.manaTypesStrong.includes(data.type)) {
		let amt = -data.dmg;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}mp`;
		KinkyDungeonChangeMana(amt);
	} else if (data.manaTypesWeak.includes(data.type)) {
		let amt = -data.dmg/2;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}mp`;
		KinkyDungeonChangeMana(amt);
	}
	if (data.willTypesStrong.includes(data.type)) {
		let amt = -data.dmg;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}wp`;
		KinkyDungeonChangeWill(amt, true);
	} else if (data.willTypesWeak.includes(data.type)) {
		let amt = -data.dmg/2;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}wp`;
		KinkyDungeonChangeWill(amt, true);
	} else if (data.willTypesVeryWeak.includes(data.type)) {
		let amt = -data.dmg/4;
		if (str) str = str + ", ";
		str = str + `${Math.round(amt*10)}wp`;
		KinkyDungeonChangeWill(amt, true);
	}
	KinkyDungeonInterruptSleep();

	if (data.dmg > 0 && KinkyDungeonStatsChoice.get("Breathless")) {
		let sleepAmount = data.dmg > 3 ? 6 : (data.dmg > 1 ? 4 : 2);
		if (["chain", "poison", "crush"].includes(data.type))
			KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, KinkyDungeonSleepiness + sleepAmount);
	}

	if (KinkyDungeonStatFreeze > 0 && KinkyDungeonMeleeDamageTypes.includes(data.type)) {
		KinkyDungeonChangeWill(-data.dmg, true);
		KinkyDungeonStatFreeze = 0;
	}
	KDOrigWill = Math.floor(KinkyDungeonStatWill * 10);





	if (data.dmg > 0) {
		data.newstats = [
			KinkyDungeonStatDistraction,
			KinkyDungeonStatDistractionLower,
			KinkyDungeonStatMana,
			KinkyDungeonStatWill,
			KinkyDungeonStatStamina,
		];

		let changed = false;
		for (let i = 0; i < data.stats.length; i++) {
			if (data.stats[i] != data.newstats[i]) {
				changed = true;
				break;
			}
		}
		if (changed && KinkyDungeonDamageTypes[data.type]) {
			data.damaged = true;
			KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(data.dmg * 10), KinkyDungeonDamageTypes[data.type].color, undefined, undefined,
				` ${TextGet("KinkyDungeonDamageType" + KinkyDungeonDamageTypes[data.type].name)} dmg`);
		}
	}

	KinkyDungeonSendEvent("afterPlayerDamage", data);

	return {happened: data.dmg, string: str};
}

function KinkyDungeonUpdateDialogue(entity, delta) {
	if (!KinkyDungeonSlowMoveTurns && !KinkyDungeonStatFreeze && !KDGameData.PlaySelfTurns)
		if (entity.dialogue) {
			if (entity.dialogueDuration > delta) {
				entity.dialogueDuration = Math.max(0, entity.dialogueDuration - delta);
			} else {
				entity.dialogue = null;
			}
		}
}

/**
 *
 * @param {entity} entity
 * @param {string} dialogue
 * @param {string} color
 * @param {number} duration
 * @param {number} priority
 * @param {boolean} [force]
 * @param {boolean} [nooverride]
 */
function KinkyDungeonSendDialogue(entity, dialogue, color, duration, priority, force, nooverride) {
	if (!force && !KDEnemyCanTalk(entity)) {
		return;
	}
	if (!entity.dialogue || !entity.dialoguePriority || entity.dialoguePriority <= priority + (nooverride ? 1 : 0)) {
		entity.dialogue = dialogue;
		entity.dialogueColor = color;
		entity.dialogueDuration = duration;
		entity.dialoguePriority = priority;
		if (!entity.player) {
			KinkyDungeonSendTextMessage(0, `${TextGet("Name" + entity.Enemy.name)}: ${dialogue}`, color, 0, true, false, entity);
			KDAllowDialogue = false;
		}
	}
}

let KDOrigStamina = KDMaxStatStart*10;
let KDOrigMana = KDMaxStatStart*10;
let KDOrigWill = KDMaxStatStart*10;
let KDOrigCharge = 1000;
let KDOrigDistraction = 0;

function KinkyDungeonChangeDistraction(Amount, NoFloater, lowerPerc) {
	if (Amount > 1) {
		KDNoRegenFlag = true;
	}
	KinkyDungeonStatDistraction += Amount;
	KinkyDungeonStatDistraction = Math.min(Math.max(0, KinkyDungeonStatDistraction), KinkyDungeonStatDistractionMax);
	if (!KDGameData.DistractionCooldown) {
		KDGameData.DistractionCooldown = 0;
	}
	let cdBonus = KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax ? Math.min(4, Math.max(1, Math.ceil(Amount/1.5))) : 0;
	KDGameData.DistractionCooldown = Math.max(KDGameData.DistractionCooldown, 3 + cdBonus, KinkyDungeonSlowMoveTurns + 1 + cdBonus);

	if (lowerPerc) {
		KinkyDungeonStatDistractionLower += Amount * lowerPerc;
		KinkyDungeonStatDistractionLower = Math.min(Math.max(0, KinkyDungeonStatDistractionLower), KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerCap);
	}
	if (!NoFloater && Math.abs(KDOrigDistraction - Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistraction * 100)) >= 0.99) {
		//KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100) - KDOrigDistraction, "#ff00ff", undefined, undefined, "% distraction");
		let amount = Math.min(1, Math.max(0, (Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100) - KDOrigDistraction) / 100));
		amount *= amount;
		amount = Math.max(amount, amount * 0.5 + 0.5 * KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax);
		amount = Math.round(10 * amount);
		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet("KinkyDungeonChangeDistraction" + amount), "#ff00ff", 2, 1);
		KDOrigDistraction = Math.max(0, Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100));
	}
}
function KinkyDungeonChangeStamina(Amount, NoFloater, Pause, NoSlow) {
	KinkyDungeonStatStamina += Amount;
	KinkyDungeonStatStamina = Math.min(Math.max(0, KinkyDungeonStatStamina), KinkyDungeonStatStaminaMax);
	if (!NoFloater && Math.abs(KDOrigStamina - Math.floor(KinkyDungeonStatStamina * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatStamina * 10) - KDOrigStamina, "#44ff66", undefined, undefined, " sp");
		KDOrigStamina = Math.floor(KinkyDungeonStatStamina * 10);
	}
	if (Pause) {
		if (!(KDGameData.StaminaPause > Pause))
			KDGameData.StaminaPause = Pause;
		if (!(KDGameData.StaminaSlow > 5) && !NoSlow)
			KDGameData.StaminaSlow = 5;
	}
}
/**
 *
 * @param {number} Amount]
 * @param {boolean} [NoFloater]
 * @param {number} [PoolAmount]
 * @param {boolean} [Pause]
 * @param {boolean} [spill]
 */
function KinkyDungeonChangeMana(Amount, NoFloater, PoolAmount, Pause, spill) {
	let manaAmt = KinkyDungeonStatMana;
	KinkyDungeonStatMana += Amount;
	KinkyDungeonStatMana = Math.min(Math.max(0, KinkyDungeonStatMana), KinkyDungeonStatManaMax);
	manaAmt = KinkyDungeonStatMana - manaAmt;
	if (!PoolAmount) PoolAmount = 0;
	if (spill && manaAmt != Amount) PoolAmount += (Amount - manaAmt) * KDManaPoolRatio;
	if (PoolAmount) {
		KinkyDungeonStatManaPool += PoolAmount;
		KinkyDungeonStatManaPool = Math.min(Math.max(0, KinkyDungeonStatManaPool), KinkyDungeonStatManaPoolMax);
	}
	if (!NoFloater && Math.abs(KDOrigMana - Math.floor(KinkyDungeonStatMana * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatMana * 10) - KDOrigMana, "#4499ff", undefined, undefined, " mp");
		KDOrigMana = Math.floor(KinkyDungeonStatMana * 10);
	}
	if (Pause) {
		if (!(KDGameData.ManaSlow > 10))
			KDGameData.ManaSlow = 10;
	}
}
function KinkyDungeonChangeWill(Amount, NoFloater) {
	KinkyDungeonStatWill += Amount;
	KinkyDungeonStatWill = Math.min(Math.max(0, KinkyDungeonStatWill), KinkyDungeonStatWillMax);
	if (!NoFloater && Math.abs(KDOrigWill - Math.floor(KinkyDungeonStatWill * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatWill * 10) - KDOrigWill, "#ff4444", undefined, undefined, " wp");
		KDOrigWill = Math.floor(KinkyDungeonStatWill * 10);
	}
}


function KinkyDungeonChangeCharge(Amount, NoFloater) {
	if (!KDGameData.AncientEnergyLevel) KDGameData.AncientEnergyLevel = 0;
	KDGameData.AncientEnergyLevel = Math.min(1, KDGameData.AncientEnergyLevel + Amount);
	if (!NoFloater && Math.abs(KDOrigCharge - Math.floor(KDGameData.AncientEnergyLevel * 1000)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KDGameData.AncientEnergyLevel * 1000 * 10) - KDOrigCharge, "#ffff44", undefined, undefined, " charge");
		KDOrigCharge = Math.floor(KDGameData.AncientEnergyLevel * 1000);
	}
}

function KinkyDungeonHasStamina(Cost, AddRate) {
	let s = KinkyDungeonStatStamina;
	if (AddRate) s += KinkyDungeonStaminaRate;

	return s >= Cost;
}
function KinkyDungeonHasWill(Cost, AddRate) {
	let s = KinkyDungeonStatWill;
	if (AddRate) s += KinkyDungeonStatWillRate;

	return s >= Cost;
}
function KinkyDungeonHasMana(Cost, AddRate) {
	let s = KinkyDungeonStatMana;
	if (AddRate) s += KinkyDungeonStatManaRate;

	return s >= Cost;
}

function KinkyDungeonSetMaxStats(delta) {
	// Upgradeable stats
	KinkyDungeonStatStaminaMax = KDMaxStatStart;
	KinkyDungeonStatDistractionMax = KDMaxStatStart;
	KinkyDungeonStatManaMax = KDMaxStatStart;
	KinkyDungeonStatManaPoolMax = KDMaxStatStartPool;
	KinkyDungeonStatWillMax = KDMaxStatStart;
	KinkyDungeonSpellChoiceCount = 21;
	KinkyDungeonSummonCount = 2;
	let data = {
		distractionRate: 0,
		staminaRate: KinkyDungeonStatStaminaRegen,
		delta: delta,
	};


	for (let s of KinkyDungeonSpells) {
		if (s.name == "SPUp1") {
			KinkyDungeonStatStaminaMax += 5;
			data.staminaRate += KinkyDungeonStatStaminaRegenPerUpgrade;
		}
		if (s.name == "APUp1") {
			KinkyDungeonStatDistractionMax += 5;
			data.distractionRate += KinkyDungeonStatDistractionRegenPerUpgrade;
		}
		if (s.name == "WPUp1") {
			KinkyDungeonStatWillMax += 5;
			data.staminaRate += KinkyDungeonStatStaminaRegenPerUpgradeWill;
		}
		if (s.name == "MPUp1") KinkyDungeonStatManaMax += 5;
		//if (s.name == "SpellChoiceUp1" || s.name == "SpellChoiceUp2" || s.name == "SpellChoiceUp3") KinkyDungeonSpellChoiceCount += 1;
		if (s.name == "SummonUp1" || s.name == "SummonUp2") KinkyDungeonSummonCount += 2;
	}

	KinkyDungeonSendEvent("calcMaxStats", data);

	return {distractionRate: data.distractionRate, staminaRate: data.staminaRate};
}

function KinkyDungeonCanUseWeapon(NoOverride, e) {
	let flags = {
		HandsFree: false,
	};
	if (!NoOverride)
		KinkyDungeonSendEvent("getWeapon", {event: e, flags: flags});
	return flags.HandsFree || KinkyDungeonPlayerDamage.noHands || (!KinkyDungeonIsHandsBound(false, true) && (!KinkyDungeonStatsChoice.get("WeakGrip") || !KinkyDungeonIsArmsBound(false, true)));
}

let KDBlindnessCap = 0;
let KDBoundPowerLevel = 0;
let KDNoRegenFlag = false;

function KDGetDistractionRate(delta) {
	let mult = KDNoRegenFlag ? 0 : 1;
	KDNoRegenFlag = false;
	let distractionRate = (KinkyDungeonVibeLevel == 0 && KDGameData.OrgasmNextStageTimer < 4 && !(KDGameData.DistractionCooldown > 0)) ? (!KinkyDungeonStatsChoice.get("arousalMode") ? KinkyDungeonStatDistractionRegen * KDDistractionDecayMultDistractionMode * mult : (KDGameData.PlaySelfTurns < 1 ? mult * KinkyDungeonStatDistractionRegen*(
		(KinkyDungeonChastityMult() > 0.9 ? KDNoUnchasteMult : (KinkyDungeonChastityMult() > 0 ? KDNoUnchasteBraMult : 1.0))) : 0)) : (KinkyDungeonDistractionPerVibe * KinkyDungeonVibeLevel);

	if (KDGameData.OrgasmStamina > 0 && delta > 0) {
		let amount = KDGameData.OrgasmStamina/24;
		KDGameData.OrgasmStamina = Math.max(0, KDGameData.OrgasmStamina*0.98 - delta/70);
		distractionRate += -amount;
	}

	let distractionBonus = KinkyDungeonSetMaxStats(delta).distractionRate;
	if (KDGameData.PlaySelfTurns < 1) distractionRate += distractionBonus;
	if (!KDGameData.DistractionCooldown) KDGameData.DistractionCooldown = 0;
	if (KDGameData.DistractionCooldown > 0) KDGameData.DistractionCooldown = Math.max(0, KDGameData.DistractionCooldown - delta);
	return distractionRate;
}

function KinkyDungeonUpdateStats(delta) {
	KDBoundPowerLevel = 0;
	KDBoundPowerLevel += 0.1 * Math.max(0, Math.min(1, KinkyDungeonBlindLevel / 3));
	if (KinkyDungeonIsArmsBound(false, false)) KDBoundPowerLevel += 0.2;
	if (KinkyDungeonIsHandsBound(false, false)) KDBoundPowerLevel += 0.2;
	KDBoundPowerLevel += 0.1 * KinkyDungeonChastityMult();
	KDBoundPowerLevel += 0.2 * KinkyDungeonGagTotal();
	KDBoundPowerLevel += 0.2 * Math.max(0, Math.min(1, KinkyDungeonSlowLevel / 2));
	if (KDBoundPowerLevel > 1) KDBoundPowerLevel = 1;
	if (KinkyDungeonStatsChoice.get("BoundPower")) {
		KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {
			id:"BoundPower",
			type: "Evasion",
			duration: 1,
			power: KDBoundPowerLevel * KDBoundPowerMult,
		});
	}

	KinkyDungeonPlayers = [KinkyDungeonPlayerEntity];

	KDBlindnessCap = 7;
	KinkyDungeonSendEvent("calcStats", {});
	// Initialize
	KinkyDungeonCalculateVibeLevel(delta);
	if (KinkyDungeonVibeLevel > 0 && KinkyDungeonCanPlayWithSelf() && KDGameData.SleepTurns > 0 && KDGameData.SleepTurns < 5) {
		KinkyDungeonInterruptSleep();
		KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSleepDeprivation"), "pink", 3);
	}
	KinkyDungeonDifficulty = KinkyDungeonNewGame * 20;
	if (KinkyDungeonStatsChoice.get("hardMode")) KinkyDungeonDifficulty += 10;
	KinkyDungeonTeaseLevel = Math.max(KinkyDungeonTeaseLevel * (1 - KinkyDungeonChastityMult()) + (delta > 0 ? KinkyDungeonTeaseLevelBypass : 0), 0);
	if (KinkyDungeonVibeLevel > 0 || KinkyDungeonTeaseLevel > 0) {
		KDGameData.OrgasmNextStageTimer = Math.min(KDOrgasmStageTimerMax, KDGameData.OrgasmNextStageTimer + delta);
		let Chance = (KDGameData.OrgasmStage >= KinkyDungeonMaxOrgasmStage) ? 1.0 : (KDOrgasmStageTimerMaxChance + (1 - KinkyDungeonStatWill/KinkyDungeonStatWillMax) * KinkyDungeonStatDistractionLower / KinkyDungeonStatDistractionMax);
		if ((KinkyDungeonTeaseLevel > 0 || KDGameData.OrgasmNextStageTimer >= KDOrgasmStageTimerMax) && (KDRandom() < Chance && KinkyDungeonControlsEnabled())) {
			if (KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage) {
				if (KinkyDungeonCanPlayWithSelf() && !KinkyDungeonInDanger()) {
					KinkyDungeonDoPlayWithSelf(KinkyDungeonTeaseLevel);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonPlaySelfAutomatic" + (KinkyDungeonIsArmsBound() ? "Bound" : "")), "#FF5BE9", 5);
				} else {
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPlaySelfTease"), "#FF5BE9", 2);
				}
				KDGameData.OrgasmStage += 1;
				KDGameData.OrgasmNextStageTimer = 1;
			} else {
				if (KinkyDungeonCanOrgasm() && KDGameData.OrgasmStamina < 0.5 && KDGameData.PlaySelfTurns < 1) {
					KinkyDungeonDoTryOrgasm(KinkyDungeonTeaseLevel);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonOrgasmAutomatic"), "#FF5BE9", KinkyDungeonOrgasmStunTime + 1, true);
					KDGameData.OrgasmNextStageTimer = 1;
				}
			}
		}
	} else if (KDGameData.OrgasmNextStageTimer > 0) {
		KDGameData.OrgasmNextStageTimer = Math.max(0, KDGameData.OrgasmNextStageTimer - delta);
	}

	let distractionRate = KDGetDistractionRate(delta);
	let arousalPercent = distractionRate > 0 ? 0.04 : 0;

	if (KDGameData.OrgasmStage > 0 && KDRandom() < 0.25 && KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.75) KDGameData.OrgasmStage = Math.max(0, KDGameData.OrgasmStage - delta);
	if (KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax * 0.99) KDGameData.OrgasmTurns = Math.min(KDGameData.OrgasmTurns + delta, KinkyDungeonOrgasmTurnsMax);
	else KDGameData.OrgasmTurns = Math.max(KDGameData.OrgasmTurns - delta, 0);


	let sleepRegen = KinkyDungeonStatStaminaRegenSleep * KinkyDungeonStatStaminaMax / KDMaxStatStart;
	let sleepRegenDistraction = KinkyDungeonStatArousalLowerRegenSleep * KinkyDungeonStatDistractionMax / KDMaxStatStart;
	if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) == 'B') sleepRegen *= 2;
	let stamMult = KDGameData.StaminaSlow > 0 ? Math.max(0.5, (!KinkyDungeonCanStand() ? 0.5 : 1.0) - 0.1 * KDGameData.StaminaSlow) : 1.0;
	let stamRegen = KDGameData.StaminaPause > 0 ? 0 : KinkyDungeonSetMaxStats().staminaRate * stamMult;
	if (delta > 0 && KDGameData.StaminaPause > 0) KDGameData.StaminaPause -= delta;
	if (delta > 0 && KDGameData.StaminaSlow > 0) KDGameData.StaminaSlow -= delta;
	if (delta > 0 && KDGameData.KneelTurns > 0) KDGameData.KneelTurns -= delta;
	KinkyDungeonStaminaRate = KDGameData.SleepTurns > 0 && KDGameData.SleepTurns < KinkyDungeonSleepTurnsMax - 1? sleepRegen : stamRegen;
	let statData = {
		manaPoolRegen: KinkyDungeonStatManaPoolRegen,
		player: KinkyDungeonPlayerEntity,
	};
	KinkyDungeonSendEvent("calcManaPool", statData);
	KinkyDungeonStatManaRate = (KinkyDungeonStatMana < KinkyDungeonStatManaRegenLowThreshold && KinkyDungeonStatsChoice.get("Meditation")) ?
		Math.max(KinkyDungeonStatManaPool > 0 ? (statData.manaPoolRegen * KinkyDungeonStatManaMax) : 0, KDMeditationRegen)
		: 0;
	let ManaPoolDrain = 0;
	if (KinkyDungeonStatManaRate == 0 && KinkyDungeonStatManaPool > 0) {
		KinkyDungeonStatManaRate = KinkyDungeonStatManaPool - Math.max(0, KinkyDungeonStatManaPool - statData.manaPoolRegen * KinkyDungeonStatManaMax);
		if (KDGameData.ManaSlow > 0) {
			KinkyDungeonStatManaRate *= Math.max(0.1, 1 - 0.1 * KDGameData.ManaSlow);
		}
		KinkyDungeonStatManaRate = Math.min(KinkyDungeonStatManaRate, KinkyDungeonStatManaMax - KinkyDungeonStatMana);
		ManaPoolDrain = KinkyDungeonStatManaRate * KDManaPoolRatio;
	}

	// Update the player tags based on the player's groups
	KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints(delta);

	let blind = Math.max(KinkyDungeonBlindLevelBase, KinkyDungeonGetBlindLevel());
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness")) blind = Math.max(0, blind + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness"));
	KinkyDungeonBlindLevel = Math.min(KDBlindnessCap, blind);
	if (KinkyDungeonBlindLevel > 0 && KinkyDungeonStatsChoice.has("Unmasked")) KinkyDungeonBlindLevel += 1;
	if (KinkyDungeonStatBlind > 0) KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel, 6);
	//if (KinkyDungeonStatStamina < 2) KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel, Math.round(6 - 3*KinkyDungeonStatStamina));
	KinkyDungeonDeaf = KinkyDungeonPlayer.IsDeaf();

	// Unarmed damage calc
	KinkyDungeonPlayerDamage = KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());

	KinkyDungeonUpdateStruggleGroups();
	// Slowness calculation
	KinkyDungeonCalculateSlowLevel();
	let sleepRate = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sleepiness");
	if ((sleepRate && sleepRate > 0) || KinkyDungeonSleepiness > 0) {
		KinkyDungeonSleepiness = Math.min(KinkyDungeonSleepinessMax, KinkyDungeonSleepiness + sleepRate * delta);
		if (KinkyDungeonSleepiness > 2.99) {
			KinkyDungeonSlowLevel = Math.max(KinkyDungeonSlowLevel, 2);
			//KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel + Math.floor(KinkyDungeonSleepiness/2), 5);
			KinkyDungeonApplyBuff(KinkyDungeonPlayerBuffs, {id: "Sleepy", aura: "#222222", type: "AttackStamina", duration: 3, power: -1, player: true, enemies: false, tags: ["attack", "stamina"]});
		}
		if (KinkyDungeonSleepiness > 0) {
			KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel + Math.floor(KinkyDungeonSleepiness*0.5), Math.min(Math.round(KinkyDungeonSleepiness*0.7), 6));
		}
		if (KinkyDungeonSleepiness > 0) {
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonSleepy"), "#ff0000", 1, true);
		}
	}
	if ((!sleepRate || sleepRate <= 0) && KinkyDungeonSleepiness > 0) KinkyDungeonSleepiness = Math.max(0, KinkyDungeonSleepiness - delta);

	// Cap off the values between 0 and maximum
	KinkyDungeonStatDistraction += distractionRate*delta;
	if (sleepRegenDistraction > 0 && KDGameData.SleepTurns > 0) {
		KinkyDungeonStatDistractionLower -= sleepRegenDistraction*delta;
	} else {
		KinkyDungeonStatDistractionLower += distractionRate*delta * arousalPercent;
	}
	KinkyDungeonStatStamina += KinkyDungeonStaminaRate*delta;
	KinkyDungeonStatMana += KinkyDungeonStatManaRate;
	KinkyDungeonStatManaPool -= ManaPoolDrain;

	if (KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave) {
		let EdgeDrainAmount = KinkyDungeonStatDistractionLower < KinkyDungeonStatDistractionLowerCap ? KinkyDungeonOrgasmExhaustionAmountWillful : KinkyDungeonOrgasmExhaustionAmount;
		KinkyDungeonChangeWill(EdgeDrainAmount);
		let vibe = KinkyDungeonVibeLevel > 0 ? "Vibe" : "";
		let suff = KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage ? (KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage / 2 ? "0" : "1") : "2";
		KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonOrgasmExhaustion" + vibe + suff), "#ff0000", 2, true);
	}

	KinkyDungeonStatBlind = Math.max(0, KinkyDungeonStatBlind - delta);
	KinkyDungeonStatFreeze = Math.max(0, KinkyDungeonStatFreeze - delta);
	KinkyDungeonStatBind = Math.max(0, KinkyDungeonStatBind - delta);

	KinkyDungeonCapStats();

	KDOrigDistraction = Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100);
	KDOrigStamina = Math.floor(KinkyDungeonStatStamina * 10);
	KDOrigMana = Math.floor(KinkyDungeonStatMana * 10);

	KinkyDungeonCalculateMiscastChance();

	KinkyDungeonHasCrotchRope = false;
	let drains = [];


	for (let item of KinkyDungeonFullInventory()) {
		if (item.type == Restraint) {
			if (KDRestraint(item).difficultyBonus) {
				KinkyDungeonDifficulty += KDRestraint(item).difficultyBonus;
			}
			if (KDRestraint(item).crotchrope) KinkyDungeonHasCrotchRope = true;
			if (KDRestraint(item).enchantedDrain) {
				if (KDGameData.AncientEnergyLevel > 0) {
					//maxDrain = Math.max(maxDrain, KDRestraint(item).enchantedDrain);
					drains.push(KDRestraint(item).enchantedDrain);
				}
				//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - KDRestraint(item).enchantedDrain * delta);
			}
		}
	}
	if (drains.length > 0 && delta > 0) {
		drains = drains.sort().reverse();
		for (let i = 0; i < drains.length; i++) {
			KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - (
				drains[i]/(i + 1)
			) * delta);
		}
	}

	KinkyDungeonSubmissiveMult = KinkyDungeonCalculateSubmissiveMult();

	if (!KDGameData.TimeSinceLastVibeEnd) KDGameData.TimeSinceLastVibeEnd = {};
	if (!KDGameData.TimeSinceLastVibeStart) KDGameData.TimeSinceLastVibeStart = {};

	for (let type of Object.entries(KDGameData.TimeSinceLastVibeStart)) {
		if (!KDGameData.TimeSinceLastVibeStart[type[0]]) KDGameData.TimeSinceLastVibeStart[type[0]] = 1;
		else KDGameData.TimeSinceLastVibeStart[type[0]] += delta;
	}
	for (let type of Object.entries(KDGameData.TimeSinceLastVibeEnd)) {
		if (!KDGameData.TimeSinceLastVibeEnd[type[0]]) KDGameData.TimeSinceLastVibeEnd[type[0]] = 1;
		else KDGameData.TimeSinceLastVibeEnd[type[0]] += delta;
	}

	KDUpdatePerksBonus();

	if (delta > 0) {
		KinkyDungeonTeaseLevel = 0;
		KinkyDungeonTeaseLevelBypass = 0;
	}

	if (KinkyDungeonSlowLevel > 9) KDGameData.CagedTime = (KDGameData.CagedTime || 0) + delta;
	else KDGameData.CagedTime = 0;
}

let KDDamageAmpPerks = 0;
let KDDamageAmpPerksMelee = 0;
let KDDamageAmpPerksMagic = 0;
let KDDamageAmpPerksSpell = 0;
let KDDamageAmpEnvironmental = 0;
let KDExtraEnemyTags = {};

function KDGetEnvironmentalDmg() {
	return KinkyDungeonMultiplicativeStat(-KDDamageAmpEnvironmental);
}

function KDUpdatePerksBonus() {
	KDDamageAmpPerks = 0;
	KDDamageAmpPerksMagic = 0;
	KDDamageAmpPerksMelee = 0;
	KDDamageAmpPerksSpell = 0;
	KDDamageAmpEnvironmental = 0;
	KDExtraEnemyTags = {};
	for (let perk of KinkyDungeonStatsChoice.keys()) {
		if (KDPerkUpdateStats[perk]) KDPerkUpdateStats[perk]();
	}
	KinkyDungeonSendEvent("perksBonus", {});
}

function KinkyDungeonCalculateMiscastChance() {
	let flags = {
		miscastChance: Math.max(0, KinkyDungeonStatDistractionMiscastChance * Math.min(1, KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax)),
	};
	if (KinkyDungeonStatsChoice.has("AbsoluteFocus")) {
		flags.miscastChance = Math.min(flags.miscastChance * 2, 1);
	}
	if (KinkyDungeonStatsChoice.get("Distracted")) flags.miscastChance += KDDistractedAmount;
	if (KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax > 0.99 && KinkyDungeonStatsChoice.get("DistractionCast")) flags.miscastChance -= 1.0;
	KinkyDungeonSendEvent("calcMiscast", {flags: flags});
	KinkyDungeonMiscastChance = flags.miscastChance;
}

function KinkyDungeonGetBlindLevel() {
	let blindness = 0;
	for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
		let inv = inv2.item;
		if (KDRestraint(inv).blindfold) blindness = Math.max(Math.min(5, blindness + 1), KDRestraint(inv).blindfold);
	}
	return blindness ? blindness : 0;
}

function KinkyDungeonCapStats() {
	KinkyDungeonStatDistractionLower = Math.max(0, Math.min(KinkyDungeonStatDistractionLower, KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerCap));
	KinkyDungeonStatDistraction = Math.max(KinkyDungeonStatDistractionLower, Math.min(KinkyDungeonStatDistraction, KinkyDungeonStatDistractionMax));
	KinkyDungeonStatStamina = Math.max(0, Math.min(KinkyDungeonStatStamina, KinkyDungeonStatStaminaMax));
	KinkyDungeonStatMana = Math.max(0, Math.min(KinkyDungeonStatMana, KinkyDungeonStatManaMax));
	KinkyDungeonStatManaPool = Math.max(0, Math.min(KinkyDungeonStatManaPool, KinkyDungeonStatManaPoolMax));

	// Negate floating point err...
	if (KinkyDungeonStatMana > KinkyDungeonStatManaMax - 0.001) KinkyDungeonStatMana = KinkyDungeonStatManaMax;
	if (KinkyDungeonStatWill > KinkyDungeonStatWillMax - 0.001) KinkyDungeonStatWill = KinkyDungeonStatWillMax;
}

function KinkyDungeonLegsBlocked() {
	if (KinkyDungeonPlayer.Pose.includes("Hogtie")) return true;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv) && KDRestraint(inv).blockfeet) return true;
	}
	return false;
}

function KinkyDungeonCanStand() {
	return !KinkyDungeonPlayer.Pose.includes("Kneel") && !(KDGameData.KneelTurns > 0);
}
function KinkyDungeonCanKneel() {
	return true;
}

function KinkyDungeonCalculateSlowLevel(delta) {
	KinkyDungeonSlowLevel = 0;
	if (KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).immobile;})) {KinkyDungeonSlowLevel += 100; KinkyDungeonMovePoints = -1;}
	else {
		for (let inv of KinkyDungeonAllRestraint()) {
			if ((KDRestraint(inv).blockfeet || KDRestraint(inv).hobble)) KinkyDungeonSlowLevel += 1;
		}
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).blockfeet) {
				KinkyDungeonSlowLevel = Math.max(KinkyDungeonSlowLevel, 2);
				break;
			}
		}
		if (!KinkyDungeonCanStand()) KinkyDungeonSlowLevel = Math.max(3, KinkyDungeonSlowLevel + 1);
		if (KinkyDungeonPlayer.Pose.includes("Hogtied")) KinkyDungeonSlowLevel = Math.max(4, KinkyDungeonSlowLevel + 1);
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).freeze) KinkyDungeonSlowLevel = Math.max(2, KinkyDungeonSlowLevel);
		}
		if (!KinkyDungeonHasStamina(0.01)) KinkyDungeonSlowLevel = Math.max(1, KinkyDungeonSlowLevel);
	}
	let origSlowLevel = KinkyDungeonSlowLevel;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel")) KinkyDungeonSlowLevel += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel");
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MoveSpeed")) KinkyDungeonSlowLevel = Math.max(0, KinkyDungeonSlowLevel - KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MoveSpeed"));
	KinkyDungeonSlowLevel = Math.max(0, KinkyDungeonSlowLevel);
	if (delta > 0 && KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevelEnergyDrain")) KDGameData.AncientEnergyLevel =
		Math.max(0, KDGameData.AncientEnergyLevel - Math.max(0, origSlowLevel - KinkyDungeonSlowLevel) * KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevelEnergyDrain"));
}
/**
 * Returns the total level of gagging, 1.0 or higher meaning "fully gagged" and 0.0 being able to speak.
 * @param   {boolean} [AllowFlags] - Whether or not flags such as allowPotions and blockPotions should override the final result
 * @return  {number} - The gag level, sum of all gag properties of worn restraints
 */
function KinkyDungeonGagTotal(AllowFlags) {
	let total = 0;
	let allow = false;
	let prevent = false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).gag) total += KDRestraint(inv).gag;
		if (KDRestraint(inv).allowPotions) allow = true;
	}
	if (AllowFlags) {
		if (prevent) return 1.00;
		else if (allow) return 0.0;
	}
	return total;
}

function KinkyDungeonCanTalk(Loose) {
	for (let inv of KinkyDungeonAllRestraint()) {
		if ((Loose ? KinkyDungeonGagTotal() >= 0.99 : KDRestraint(inv).gag)) return false;
	}
	return true;
}

function KinkyDungeonCalculateSubmissiveMult() {
	let base = 0;
	for (let item of KinkyDungeonAllRestraint()) {
		if (item.type == Restraint) {
			let power = Math.sqrt(Math.max(0, KinkyDungeonGetLockMult(item.lock) * KDRestraint(item).power));
			base = Math.max(power, base + power/5);
		}
	}

	base *= 0.28;

	let mult = Math.max(0, 0.2 + 0.8 * (KinkyDungeonGoddessRep.Ghost + 50)/100);
	let amount = Math.max(0, base * mult);
	//console.log(amount);
	return amount;
}

function KinkyDungeonCanPlayWithSelf() {
	if (!KinkyDungeonStatsChoice.get("arousalMode")) return false;
	return KinkyDungeonStatDistraction > KinkyDungeonDistractionSleepDeprivationThreshold * KinkyDungeonStatDistractionMax && KinkyDungeonHasStamina(-KinkyDungeonOrgasmCost);
}

function KinkyDungeonCanTryOrgasm() {
	if (!KinkyDungeonStatsChoice.get("arousalMode")) return false;
	return KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax - 0.01 && (KinkyDungeonHasStamina(-KinkyDungeonOrgasmCost) || KDGameData.OrgasmStage > 3) && KDGameData.OrgasmStamina < 1;
}

/**
 * @param {number} [tease] - The teasing power
 * @returns {{orig: number, final: number}}
 */
function KDGetPlaySelfPower(tease) {
	let OrigAmount = Math.max(tease ? Math.min(KinkyDungeonPlayWithSelfPowerMax, tease) : 0, KinkyDungeonPlayWithSelfPowerMin + (KinkyDungeonPlayWithSelfPowerMax - KinkyDungeonPlayWithSelfPowerMin)*KDRandom());
	let amount = Math.max(0, OrigAmount - KinkyDungeonChastityMult() * KinkyDungeonPlayWithSelfChastityPenalty);

	return {orig: OrigAmount, final: amount};
}

function KinkyDungeonDoPlayWithSelf(tease) {
	let affinity = KinkyDungeonGetAffinity(false, "Edge");
	KinkyDungeonAlert = 3; // Alerts nearby enemies because of your moaning~
	let power = KDGetPlaySelfPower(tease);
	let OrigAmount = power.orig;
	let amount = power.final;
	let bound = KinkyDungeonIsArmsBound();
	if (bound && !affinity) amount = Math.max(0, Math.min(amount, OrigAmount - KinkyDungeonPlayWithSelfBoundPenalty));
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfBonus) amount += KinkyDungeonPlayerDamage.playSelfBonus;
	KinkyDungeonChangeDistraction(amount * KinkyDungeonPlayWithSelfMult, false, 0.05);
	KinkyDungeonChangeStamina(KinkyDungeonPlayCost);
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfSound) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/" + KinkyDungeonPlayerDamage.playSelfSound + ".ogg");
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfMsg) {
		KinkyDungeonSendActionMessage(10, TextGet(KinkyDungeonPlayerDamage.playSelfMsg), "#FF5BE9", 4);
	} else if (KinkyDungeonIsArmsBound()) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPlaySelfBound"), "#FF5BE9", 4);
	} else if (KinkyDungeonChastityMult() > 0.9) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChastityDeny"), "#FF5BE9", 4);
	} else KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPlaySelf"), "#FF5BE9", 4);
	KDGameData.PlaySelfTurns = 3;
	KDGameData.DistractionCooldown = Math.max(KDGameData.DistractionCooldown, 13);

	if (affinity) {
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonPlayCorner"), "#88FF00", 4);
	}
	return amount;
}

let KinkyDungeonOrgasmVibeLevelMult = 5;
let KinkyDungeonOrgasmChanceBase = -0.1;
let KinkyDungeonOrgasmChanceScaling = 1.1;
let KinkyDungeonMaxOrgasmStage = 7;
let KinkyDungeonOrgasmStageVariation = 4; // determines the text message variation

let KinkyDungeonDistractionSleepDeprivationThreshold = 0.25;
let KinkyDungeonPlaySelfOrgasmThreshold = 3; // Note that it is impossible if you have a belt on, but possible if you only have a bra on

let KinkyDungeonOrgasmTurnsMax = 10;
let KinkyDungeonOrgasmTurnsCrave = 8;
let KinkyDungeonPlayWithSelfPowerMin = 3;
let KinkyDungeonPlayWithSelfPowerMax = 6;
let KinkyDungeonPlayWithSelfPowerVibeWand = 5;
let KinkyDungeonPlayWithSelfChastityPenalty = 5;
let KinkyDungeonPlayWithSelfBoundPenalty = 3;
let KinkyDungeonOrgasmExhaustionAmount = -0.02;
let KinkyDungeonOrgasmExhaustionAmountWillful = -0.005;

let KDOrgasmStageTimerMax = 10; // Turns for orgasm stage timer to progress naturally
let KDOrgasmStageTimerMaxChance = 0.1; // Chance for the event to happen

let KDWillpowerMultiplier = 0.5;

let KinkyDungeonOrgasmCost = -8;
let KinkyDungeonOrgasmCostPercent = 0.7;
let KinkyDungeonOrgasmWillpowerCost = -2;
let KinkyDungeonEdgeCost = -1;
let KinkyDungeonPlayCost = -0.05;

let KinkyDungeonOrgasmStunTime = 4;
let KinkyDungeonPlayWithSelfMult = 0.25;

/**
 * Try to let go...
 * @param {number} [Bonus]
 */
function KinkyDungeonDoTryOrgasm(Bonus) {
	let chance = KinkyDungeonOrgasmChanceBase + KinkyDungeonOrgasmChanceScaling*(KDGameData.OrgasmTurns/KinkyDungeonOrgasmTurnsMax);
	let denied = KinkyDungeonVibratorsDeny(chance);

	let amount = denied ? 0 : KinkyDungeonOrgasmVibeLevel * KinkyDungeonOrgasmVibeLevelMult;
	let playSelfAmount = Bonus != undefined ? Bonus : KinkyDungeonDoPlayWithSelf();
	//if (playSelfAmount > KinkyDungeonOrgasmVibeLevel) {
	amount += playSelfAmount;
	//}
	let msg = "KinkyDungeonOrgasm";
	let msgTime = 4;

	if (amount > KinkyDungeonPlaySelfOrgasmThreshold && KDRandom() < chance) {
		// You finally shudder and tremble as a wave of pleasure washes over you...
		KinkyDungeonStatBlind = 6;
		KinkyDungeonOrgasmStunTime = 4;
		KDGameData.OrgasmStamina = KinkyDungeonStatDistraction;
		KinkyDungeonChangeStamina(Math.min(KinkyDungeonOrgasmCost, -KinkyDungeonOrgasmCostPercent * KinkyDungeonStatStamina));
		KinkyDungeonChangeWill(KinkyDungeonOrgasmWillpowerCost);
		KinkyDungeonStatDistractionLower = 0;
		KinkyDungeonAlert = 7; // Alerts nearby enemies because of your moaning~
		KDGameData.PlaySelfTurns = 3;
	} else {
		KinkyDungeonChangeStamina(KinkyDungeonEdgeCost);
		// You close your eyes and breath rapidly in anticipation...
		// You feel frustrated as the stimulation isn't quite enough...
		// You groan with pleasure as you keep close to the edge...
		// You whimper as you rub your legs together furiously...
		// You tilt your head back and moan as your heart beats faster...
		// Your whole body shakes, but you don't quite go over the edge...
		// This is starting to feel like torture...
		// You let out a frustrated scream as the torment continues...
		// You simmer just under the edge, heart racing, breathing quickly...
		// You let out an anguished moan as release dances just out of reach...
		// You squirm helplessly as your futile struggles simply arouse you more...
		KDGameData.OrgasmTurns = Math.min(KDGameData.OrgasmTurns + amount, KinkyDungeonOrgasmTurnsMax); // Progress the meter if you're not ready yet...
		KDGameData.OrgasmStage = Math.min(KinkyDungeonMaxOrgasmStage, KDGameData.OrgasmStage + 1); // Stage of denial
		if (KDGameData.CurrentVibration) {
			if (KDGameData.CurrentVibration.denialsLeft > 0 || KDGameData.CurrentVibration.denialsLeft == undefined) {
				KDGameData.CurrentVibration.denyTimeLeft = KDGameData.CurrentVibration.denyTime;
				if (KDGameData.CurrentVibration.denialsLeft > 0) KDGameData.CurrentVibration.denialsLeft -= 1;
			}
		}
		if (denied && KinkyDungeonVibeLevel > 0) msg = "KinkyDungeonDeny";
		else msg = "KinkyDungeonEdge";
	}

	let msgIndex = Math.min(KinkyDungeonMaxOrgasmStage, KDGameData.OrgasmStage) + Math.floor(Math.random() * KinkyDungeonOrgasmStageVariation);
	KinkyDungeonSendActionMessage(10, TextGet(msg + ("" + msgIndex)), "#FF5BE9", msgTime);
}

function KinkyDungeonIsChaste(Breast) {
	for (let inv of KinkyDungeonAllRestraint()) {
		if ((!Breast && KDRestraint(inv).chastity) || (Breast && KDRestraint(inv).chastitybra)) return true;
	}
}

function KinkyDungeonChastityMult() {
	let chaste = 0.0;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).chastity) chaste += 1;
		else if (KDRestraint(inv).chastitybra) chaste += 0.2;
	}
	return chaste;
}
