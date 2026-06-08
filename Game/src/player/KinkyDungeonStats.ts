"use strict";
/** Player entity */
let KinkyDungeonPlayerEntity: any = {id: -1, Enemy: undefined, hp: 10, x: 0, y:0, player:true}; // The current player entity


let KDBaseBalanceDmgLevel = 5; // Decides how much heels affect balance loss from attacks. higher = less loss
let KDShadowThreshold = 1.5;

/** Sleep */
let KDSleepWillFraction = 0.5;     // Will restored to this percentage when sleeping
let KDSleepWillFractionJail = 0.5; // Will restored to this percentage when sleeping in Jail

/**
 * @returns health to regenerate to during sleep
 */
function KDGetSleepWillRegenHealthTo() {
	return Math.ceil(KinkyDungeonStatWillMax * (KDGameData.PrisonerState == 'jail' ? KDSleepWillFractionJail : KDSleepWillFraction));
}

/**
 * Can the player sleep in a bed?
 */
function KDCanSleep(x: number, y: number) {
	let willUnderTreshold = KinkyDungeonStatWill < KDGetSleepWillRegenHealthTo();
	let jailedOrNotSleptOnLevel = (KinkyDungeonPlayerInCell() && KDGameData.PrisonerState == "jail") || !KinkyDungeonFlags.get('slept');
	let isArtificial = KinkyDungeonFlags.get("Artificial");
	let altSleep = KDGetAltSleep(x, y);
	return willUnderTreshold && jailedOrNotSleptOnLevel && (!!altSleep || !isArtificial);
}


function KDGetAltSleep(x: number, y: number): string {
	if (KinkyDungeonFlags.get("DollSleep")) {
		let tile = KinkyDungeonTilesGet(x + ',' + y);
		if (tile?.Furniture && KDFurniture[tile.Furniture]?.dollsleep)
			return "DollSleep";
	}
	return "";

}

function KDGetPreferredAltSleepType(): string {
	if (KinkyDungeonFlags.get("DollSleep")) {
		return "DollSleep";
	}
	return "";

}

/**
 * @returns Tooltip why player is unable to sleep at bed
 */
function KDCanSleepTooltip(x: number, y: number) {
	let isArtificial = KinkyDungeonFlags.get("Artificial");
	let altSleep = KDGetAltSleep(x, y);

	if (!altSleep && isArtificial) {
		return "KDBedIsArtificial" + KDGetPreferredAltSleepType();
	}
	
	if(KinkyDungeonFlags.get('slept') && !(KinkyDungeonPlayerInCell() && KDGameData.PrisonerState == "jail")) {
		return "KDBedSleptLevel";
	}
	if(KinkyDungeonStatWill >= KDGetSleepWillRegenHealthTo()) {
		return "KDBedWillNotLow";
	}

	

	console.error("KDCanSleepTooltip should not reach this point")
	return "KDBedWillNotLow";
}

/**
 * Set state required for player to sleep
 */
function KDSleep(entity?: entity, amount: number = 0) {
	if (!entity) entity = KDPlayer();
	if (!amount) amount = KinkyDungeonSleepTurnsMax;
	let data = {
		amount: amount,
		entity: entity,
		cancelSleep: false,
	}
	KinkyDungeonSendEvent("sleep", data);
	if (!data.cancelSleep) {
		KinkyDungeonSetFlag("slept", -1); // prevent sleeping again on this floor
		if (KinkyDungeonPlayerInCell(true) && KDGameData.PrisonerState == 'jail' && amount >= KinkyDungeonSleepTurnsMax) {
			KinkyDungeonChangeRep("Ghost", KinkyDungeonIsArmsBound() ? 5 : 2);
		}
		KDGameData.SleepTurns = data.amount; // sleep for this number of turns
		KDChangeMana("player","sleep", "tick", KinkyDungeonStatManaMax, false, 0, false, true); // restore full mana instantly
	}
	KinkyDungeonSendEvent("sleepStart", data);
}

/**
 * Apply healing when player sleeps each turn
 */
function KDSleepTick() {
	let regenToWill = KDGetSleepWillRegenHealthTo(); // regenerate to this health by the time sleep is done
	let healingPerTurn = regenToWill / KinkyDungeonSleepTurnsMax; // regenerate this much will per turn
	if (KinkyDungeonStatWill < regenToWill) {
		let willBefore = KinkyDungeonStatWill;
		KDChangeWill("player","wait", "tick", healingPerTurn, false);
		// if we've overshot the target percentage then clamp to it
		if(willBefore <= regenToWill && KinkyDungeonStatWill > regenToWill) {
			KinkyDungeonStatWill = regenToWill;
		}
	}
}

let KDOrgAfterglowTime = 10;

// Ratio of max shield to willpower max
let KDShieldRatio = 1;

// Distraction -- It lowers your stamina regen
let KDMaxStat = 40; // Maximum any stat can get boosted to
let KDMaxStatStart = 10; // Start of stats
let KDMaxStatStartPool = 40; // Start of stats

let KDStamDamageThresh = 0.3;
let KDStamDamageThreshBonus = 0.01;

let KinkyDungeonStatDistractionMax = KDMaxStatStart;
let KDDistractionLowerPercMult = 0.1;
let KinkyDungeonStatDistractionLower = 0;
let KinkyDungeonStatDistractionLowerCap = 1.0;
let KinkyDungeonStatDistractionLowerDecayTo = 0.75;
let KinkyDungeonStatDistractionLowerDecayRate = 0.003; // per turn -- about 50 turns to decay 15% to the limit
let KinkyDungeonStatArousalLowerRegenSleep = 0; // Decrease lower distraction in sleep?
let KinkyDungeonDistractionUnlockSuccessMod = 0.5; // Determines how much harder it is to insert a key while aroused. 1.0 is half success chance, 2.0 is one-third, etc.
let KinkyDungeonStatDistraction = 0;
let KinkyDungeonCrotchRopeDistraction = 0.4;
let KinkyDungeonStatDistractionRegen = -1.0;
let KinkyDungeonStatDistractionRegenPerUpgrade = KinkyDungeonStatDistractionRegen*0.1;
let KDNoUnchasteBraMult = 0.9;
let KDNoUnchasteMult = 0.8;
let KDDistractionDecayMultDistractionMode = 0.25;
let KDDistractedAmount = 0.15;
let KinkyDungeonStatDistractionMiscastChance = 0.7; // Miscast chance at max distraction
let KinkyDungeonMiscastChance = 0;
let KinkyDungeonVibeLevel = 0;
let KinkyDungeonTeaseLevel = 0;
/** This is super powerful teasing that bypasses chastity */
let KinkyDungeonTeaseLevelBypass = 0;
let KinkyDungeonOrgasmVibeLevel = 0;
let KinkyDungeonDistractionPerVibe = 0.2; // How much distraction per turn per vibe energy cost
let KinkyDungeonDistractionPerPlug = 0.1; // How much distraction per move per plug level
let KinkyDungeonVibeCostPerIntensity = 0.15;

let KinkyDungeonStatWillpowerExhaustion = 0;
let KinkyDungeonSleepTurnsMax = 41;
// Note that things which increase max distraction (aphrodiasic) also increase the max stamina drain. This can end up being very dangerous as being edged at extremely high distraction will drain all your energy completely, forcing you to wait until the torment is over or the drugs wear off

// Stamina -- your MP. Used to cast spells and also struggle
let KinkyDungeonStatStaminaMax = KDMaxStatStart;
let KinkyDungeonStatStamina = KinkyDungeonStatStaminaMax;
let KinkyDungeonStatStaminaRegen = 0.5;
let KinkyDungeonStatStaminaRegenPerUpgrade = 0.0;
let KinkyDungeonStatStaminaRegenPerUpgradeWill = 0.02;
let KDNarcolepticRegen = -0.06;
let KinkyDungeonStatStaminaRegenJail = 0.125;
let KinkyDungeonStatStaminaRegenSleep = KinkyDungeonStatStaminaMax/40;
let KinkyDungeonStatStaminaRegenSleepBedMultiplier = 1.5;
let KinkyDungeonStatStaminaRegenWait = 0.5;
let KinkyDungeoNStatStaminaLow = 4;
let KDSprintCostBase = 1.5; // Cost of sprinting
let KDSprintCostSlowLevel = [0.5, 1.0, 0.0, 0.5, 1.0, 1.5, 2.0]; // Extra cost per slow level
let KDSprintAdjustSlowed = 1.5; // this is added on if slow level > 1
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

let KinkyDungeonHasCrotchRope = false;

// Combat
let KinkyDungeonTorsoGrabChance = 0.4;
let KinkyDungeonTorsoGrabChanceBonus = 0.2;
let KinkyDungeonWeaponGrabChance = 1.0;

/**
 * Your inventory contains items that are on you
 */
let KinkyDungeonInventory: Map<string, Map<string, item>> = new Map();
function KDInitInventory() {
	KinkyDungeonInventory = new Map();
	for (const c of [Consumable, Restraint, LooseRestraint, Weapon, Outfit]) {
		KinkyDungeonInventory.set(c, new Map());
	}
}

let KinkyDungeonPlayerTags: Map<string, boolean> = new Map();
let NPCTags: Map<Character, Map<string, boolean>> = new Map();
let KDEntityRestraintMetadata: Map<number, EntityRestraintMetadata> = new Map();
interface EntityRestraintMetadata {
	blockedtags: Record<string, number>,
}

let KinkyDungeonCurrentDress = "Default";
let KinkyDungeonUndress = 0; // Level of undressedness

/** Current list of spells */
let KinkyDungeonSpells: spell[] = [];
// FIXME: This object should be formally specified as some point.
let KinkyDungeonPlayerBuffs: Record<string, KDBuff> = {};

// Temp - for multiplayer in future
let KinkyDungeonPlayers = [];

// For items like the cursed collar which make more enemies appear
let KinkyDungeonDifficulty = 0;

let KinkyDungeonSubmissiveMult = 0;

let KinkyDungeonSpellPoints = 3;

function KinkyDungeonDefaultStats(_Load?: any) {
	KinkyDungeonPenanceCosts = {};
	KinkyDungeonLostItems = [];
	KinkyDungeonFastMove = true;
	KinkyDungeonResetEventVariables();
	KinkyDungeonSetDress("Default", "Default");
	KDGameData.KinkyDungeonSpawnJailers = 0;
	KDGameData.KinkyDungeonSpawnJailersMax = 0;
	KinkyDungeonGold = 0;

	KDGameData.Balance = 1;


	KinkyDungeonHasCrotchRope = false;

	KinkyDungeonSubmissiveMult = 0;

	KDGameData.HeartTaken = false;

	KDSetWeapon(null);
	KinkyDungeonSpellPoints = 0;

	KinkyDungeonStatDistractionMax = KDMaxStatStart;
	KinkyDungeonStatStaminaMax = KDMaxStatStart;
	KinkyDungeonStatManaMax = KDMaxStatStart;
	KinkyDungeonStatManaPoolMax = KinkyDungeonStatManaPool;
	KinkyDungeonStatWillMax = KDMaxStatStart;
	KinkyDungeonStaminaRate = KinkyDungeonStatStaminaRegen;

	KinkyDungeonStatBlind = 0;
	KDGameData.SlowMoveTurns = 0;
	KDGameData.SleepTurns = 0;
	KinkyDungeonStatBind = 0;
	KinkyDungeonStatFreeze = 0;


	KinkyDungeonPlayerBuffs = {};

	KDGameData.MovePoints = 0;
	KDInitInventory();
	KinkyDungeonInventoryAdd({name: "Default", type: Outfit, id: KinkyDungeonGetItemID()});
	KinkyDungeonInventoryAddWeapon("Unarmed");
	KDSetWeapon("Unarmed");
	KDResetPlayerTags();
	NPCTags = new Map();
	KDEntityRestraintMetadata = new Map();


	KinkyDungeonPlayerDamage = KinkyDungeonPlayerDamageDefault;

	// Initialize all the other systems
	KinkyDungeonResetMagic();
	KinkyDungeonInitializeDresses();
	KinkyDungeonShrineInit();

	if (KDClassStart[KinkyDungeonClassMode]) KDClassStart[KinkyDungeonClassMode](true);
	KDGameData.Class = KinkyDungeonClassMode;

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


	KinkyDungeonDressPlayer();
	CharacterRefresh(KinkyDungeonPlayer);
}


function KinkyDungeonGetVisionRadius() {
	let data = {
		brightness: KDMapData.MapBrightness,
		blindlevel: KinkyDungeonBlindLevel,
		blindlevelBonus: 0,
		noperipheral: KinkyDungeonDeaf || KinkyDungeonStatBlind > 0,
		blindMult: (KinkyDungeonStatsChoice.get("Blackout") || KinkyDungeonStatsChoice.get("TotalBlackout")) ? 2 : 1,
		visionMult: 1.0,
		max: 8,
		min: KinkyDungeonStatsChoice.get("TotalBlackout") ? 0.5 : (KinkyDungeonStatsChoice.get("Blackout") ? 1.5 : 2.9),
		nightVision: 1.0,
		blindRadius: KDGameData.visionBlind || 0,
	};
	if (KinkyDungeonStatsChoice.get("NightBlindness") && KinkyDungeonBrightnessGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) < KDShadowThreshold) {
		data.min = Math.min(data.min, KDGameData.visionAdjust < -0.1 ? 1.5 : 0.5);
	}
	KinkyDungeonSendEvent("calcVision", data);
	if (data.blindRadius > 0) {
		data.blindlevelBonus += KDGameData.MaxVisionDist * data.blindRadius;
	}
	KDGameData.MaxVisionDist = data.max;
	KDGameData.MinVisionDist = data.min;
	KDGameData.NightVision = data.nightVision;
	return (KDGameData.SleepTurns > 2) ? 1 : (Math.max((data.noperipheral) ? 1 : 2, Math.round(data.visionMult*(KDGameData.MaxVisionDist-data.blindlevelBonus-data.blindlevel * data.blindMult))));
}


/**
 * @param entity
 */
function KDEntitySenses(entity: entity): {radius: number, mult: number, vision: number, visionmult: number, blindsight: number} {
	let data = {
		noise: 0,
		base: entity.Enemy.Awareness?.hearingRadius || entity.Enemy.visionRadius,
		deaflevel: 0,
		hearingMult: entity.Enemy.Awareness?.hearingMult || 1.0,
		vision: entity.Enemy.visionRadius,
		visionMult: entity.Enemy.Awareness?.vision || 1.0,
		blindsight: entity.Enemy.blindSight,
	};
	KinkyDungeonSendEvent("calcEntityHearing", data);
	return {
		radius: Math.round((data.base-data.deaflevel) * data.hearingMult),
		mult: data.hearingMult,
		vision: data.vision,
		visionmult: data.visionMult,
		blindsight: data.blindsight,
	};
}

function KDDeafLevel(): number {
	let data = {
		deaflevel: 0,
		deafMaxWeight: 0.75,
		deafTotalWeight: 0.25,
		maxDeaf: 0,
		totalDeaf: 0,
		restraints: KinkyDungeonAllRestraintDynamic().filter((inv) => {return KDRestraint(inv.item)?.deaf;})
	};


	for (let inv of data.restraints) {
		let deaf = KDRestraint(inv.item).deaf;
		data.maxDeaf = Math.max(deaf, data.maxDeaf);
		data.totalDeaf += deaf;
	}

	KinkyDungeonSendEvent("calcDeaf", data);

	data.deaflevel = data.deafMaxWeight * data.maxDeaf + data.deafTotalWeight * data.totalDeaf;

	return data.deaflevel;
}

/**
 * @param [entity]
 */
function KinkyDungeonGetHearingRadius(entity?: entity): {radius: number, mult: number} {
	if (!entity) entity = KDPlayer();
	if (entity.player) {
		let data = {
			entity: entity,
			noise: 0,
			base: 8,
			deaflevel: KDDeafLevel(),
			hearingMult: 1.0,
		};
		KinkyDungeonSendEvent("calcHearing", data);
		return {
			radius: Math.round((data.base * 5 / (5 + data.deaflevel)) * data.hearingMult),
			mult: data.hearingMult,
		};
	} else {
		let data = {
			entity: entity,
			noise: 0,
			base: 8,
			deaflevel: 0,//KinkyDungeonDeaf ? 4 : 0,
			hearingMult: 1.0,
		};
		KinkyDungeonSendEvent("calcEnemyHearing", data);
		return {
			radius: Math.round((data.base-data.deaflevel) * data.hearingMult),
			mult: data.hearingMult,
		};
	}
}

/**
 * Returns if the player is automatically doing stuff
 */
function KDIsAutoAction(): boolean {
	return KinkyDungeonAutoWait || KinkyDungeonAutoWaitStruggle || KDAutoWaitDelayed
		|| (KDGameData.SlowMoveTurns && KDGameData.DelayedActions?.length > 0);
}

/** Only stops AutoWait */
function KDCancelAutoWait() {
	KinkyDungeonAutoWait = false;
	KinkyDungeonAutoWaitStruggle = false;
	KinkyDungeonTempWait = false;
}

/**
 * Disables all automatic actions
 */
function KDDisableAutoWait() {
	KDCancelAutoWait();
	KinkyDungeonFastMovePath = [];
	KDAutoWaitDelayed = false;
	KDSendInput("autoprune", {force: true});
}

function KinkyDungeonInterruptSleep() {
	if (KDGameData.SleepTurns  > 0) {
		let data = {
			interrupt: true,
		};
		KinkyDungeonSendEvent("sleepEnd", data);
	}
	KDGameData.SleepTurns = 0;
	KDGameData.PlaySelfTurns = 0;
	if (KinkyDungeonTempWait && !KDGameData.KinkyDungeonLeashedPlayer && !KinkyDungeonGetRestraintItem("ItemDevices") && !KinkyDungeonFlags.get("ZeroResistance")) {
		KDAutoWaitDelayed = false;
		KinkyDungeonAutoWait = false;
	}
	if (KinkyDungeonInDanger()) KinkyDungeonAutoWaitStruggle = false;	
}

let KDBaseDamageTypes = {
	knockbackTypes: ["fire", "electric", "shock", "tickle", "cold", "slash", "grope", "pierce", "soul", "plush", "charm"],
	knockbackTypesStrong: ["blast", "stun", "crush", "soap", "poison", "pain", "arcane"],
	arouseTypes: ["grope", "plush", "charm", "happygas"],
	bypassTeaseTypes: ["charm", "happygas"],
	distractionTypesWeakNeg: ["pain", "acid"],
	distractionTypesWeak:["soul", "plush"],
	distractionTypesStrong:["tickle", "grope", "charm", "souldrain", "happygas", "estim"],
	teaseTypes: ["grope", "charm", "plush"],
	staminaTypesWeak:["drain", "stun", "fire", "glue", "chain", "tickle", "electric", "shock"],
	staminaTypesStrong:["ice", "frost", "poison", "crush", "souldrain"],
	manaTypesWeak:["electric", "estim", "drain"],
	manaTypesStrong:[],
	willTypesVeryWeak:["tickle", "souldrain"],
	willTypesWeak:["ice", "frost", "poison", "stun", "electric", "estim", "acid", "soap", "grope", "pierce", "slash", "crush", "unarmed", "glue", "chain"],
	willTypesStrong:["cold", "fire", "charm", "soul", "pain", "shock", "plush", "arcane"],
};

function KDGetStamDamageThresh() {
	let data = {
		thresh: KDStamDamageThresh,
		bonus: 0,
	};

	if (KDGameData.StatMaxBonus) {
		data.bonus += KDStamDamageThreshBonus * KDGameData.StatMaxBonus.AP;
	}

	KinkyDungeonSendEvent("calcStamDamageThresh", data);

	data.thresh += data.bonus;
	return data.thresh;
}

/**
 * @param bullet
 * @param entity
 * @param [suppressAdd]
 */
function KDBulletAlreadyHit(bullet: KDBullet, entity: entity, suppressAdd?: boolean): boolean {
	if (bullet) {
		let name = entity.player ? "player" : String(entity.id);
		if (!bullet.alreadyHit) bullet.alreadyHit = [];
		// A bullet can only damage an enemy once per turn
		if (bullet.alreadyHit.includes(name)) return true;
		if (!suppressAdd)
			bullet.alreadyHit.push(name);
	}
	return false;
}


interface damageInfoMinor {
	damage:     number;
	type:       string;
	time?: number,
	flags?: string[],

	src?: string,
	srctype?: string,
	srctrig?: string,

	distract?: number,

	crit?: number,
	addBind?: boolean,
	bindcrit?: number,
	bind?: number,
	bindType?: string,
	noInterrupt?: boolean,
}


interface damageInfo extends damageInfoMinor {
	name?: string;
	flags?:     string[];
	time?:      number;
	bind?:      number;
	bindEff?: number,
	sfx?: string,
	crit?:      number;
	bindcrit?:  number;
	bindType?:  string;
	distract?:  number;
	distractEff?: number,
	desireMult?: number,
	addBind?: boolean;
	realBind?: boolean,

	nodisarm?: boolean,
	nocrit?: boolean,
	noblock?: boolean,
	evadeable?: boolean,
	nokill?: boolean,
	armormult?: number,

	ignoreshield?: boolean,

	boundBonus?: number,
	novulnerable?: boolean,
	tease?: boolean,

	shield_crit?: boolean, // Crit thru shield
	shield_stun?: boolean, // stun thru shield
	shield_freeze?: boolean, // freeze thru shield
	shield_bind?: boolean, // bind thru shield
	shield_snare?: boolean, // snare thru shield
	shield_slow?: boolean, // slow thru shield
	shield_distract?: boolean, // Distract thru shield
	shield_vuln?: boolean, // Vuln thru shield
	bindTags?: string[],
	power?: number;
}

function KDDoPerkDamageTypeChanges(data: any) {
	if (KinkyDungeonStatsChoice.get("Estim")) {
		data.distractionTypesStrong.push("electric");
		data.arouseTypes.push("electric");
		if (data.staminaTypesWeak.includes("electric"))
			data.staminaTypesWeak = data.staminaTypesWeak.splice(data.staminaTypesWeak.indexOf("pain"), 1);
		if (data.type == "electric" || data.type == "estim") {
			KinkyDungeonSetFlag("tickle", 3);
		}
	}
	if (KinkyDungeonStatsChoice.get("Less_Tickle") && data.type == "tickle") {
		data.type = "plush";
	}
}

function KinkyDungeonDealDamage(Damage: damageInfoMinor, bullet?: KDBullet, noAlreadyHit?: boolean, noInterrupt?: boolean, noMsg?: boolean, src?: string) {
	if (bullet && !noAlreadyHit) {
		if (KDBulletAlreadyHit(bullet, KinkyDungeonPlayerEntity)) return {happened: 0, string: ""};
	}

	let data = {
		dmgOrig: Damage.damage,
		dmg: Damage.damage,
		type: Damage.type,
		flags: Damage.flags,
		time: Damage.time,
		distract: Damage.distract || 0,
		armor: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Armor"),
		armorbreak: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ArmorBreak"),
		spellResist: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SpellResist"),
		buffresist: KDBuffResist(KinkyDungeonPlayerBuffs, Damage.type),
		arouseAmount: 0,
		arouseMod: 1,
		knockbackTypesStrong: Object.assign([], KDBaseDamageTypes.knockbackTypesStrong),
		knockbackTypes: Object.assign([], KDBaseDamageTypes.knockbackTypes),
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
		dmgShield: 0,
		noInterrupt: noInterrupt || Damage.noInterrupt,
	};

	KDDoPerkDamageTypeChanges(data);
	let types = ["pain", "electric", "slash", "pierce", "crush", "fire", "ice", "frost", "acid", "arcane", "stun", "blast"];

	if (data.type == "chain" || data.type == "glue") {
		KinkyDungeonSetFlag("restrained", 1);
		if (data.type == "glue")
			KinkyDungeonSetFlag("slimed", 5);
		else KinkyDungeonSetFlag("restrained_recently", 4);
	}

	if (types.includes(data.type)) {
		if (data.type == "pain") {
			KinkyDungeonSetFlag("spank", 2);
		}
		KinkyDungeonSetFlag("pain", 4);
	}
	if (KinkyDungeonStatsChoice.get("Masochist")) {

		data.distractionTypesStrong.push(...types);
		data.arouseMod = Math.max(data.arouseMod, 2.0);
		data.arouseTypes.push(...types);
		if (data.distractionTypesWeakNeg.includes("pain"))
			data.distractionTypesWeakNeg = data.distractionTypesWeakNeg.splice(data.distractionTypesWeakNeg.indexOf("pain"), 1);
		if (data.distractionTypesWeakNeg.includes("acid"))
			data.distractionTypesWeakNeg = data.distractionTypesWeakNeg.splice(data.distractionTypesWeakNeg.indexOf("acid"), 1);

	}
	if (data.type == "tickle") {
		KinkyDungeonSetFlag("tickle", 3);
	}
	if (data.arouseTypes.includes(data.type) && !data.arouseAmount) {
		data.arouseAmount = 0.2;
		if (data.type == "charm") {
			KinkyDungeonSetFlag("headpat", 2);
		} else if (data.type == "psychic") {
			KinkyDungeonSetFlag("psychic", 2);
		} else if (data.type == "plush") {
			KinkyDungeonSetFlag("soft", 2);
		} else {
			KinkyDungeonSetFlag("grope", 3);
		}
	} else if (data.type == "pierce") {
		KinkyDungeonSetFlag("insert", 3);
	}


	if (data.arouseAmount < 0) data.arouseAmount = 0;

	KinkyDungeonSendEvent("beforePlayerDamage", data);

	data.dmg *= data.buffresist;


	if (data.armorbreak > 0) data.armor -= Math.min(Math.max(0, data.armor), data.armorbreak);

	if (data.armor && KinkyDungeonMeleeDamageTypes.includes(data.type)) data.dmg = Math.max(0, data.dmg * KDArmorFormula(data.dmg, data.armor));
	else if (data.spellResist && !KinkyDungeonMeleeDamageTypes.includes(data.type)) data.dmg = Math.max(0, data.dmg * KDArmorFormula(data.dmg, data.spellResist));

	if (data.dmg > 0) {
		let buffreduction = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "DamageReduction");
		if (buffreduction && data.dmg > 0) {
			data.dmg = Math.max(data.dmg - buffreduction, 0);
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "damageTaken", 1);
			KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Shield.ogg");
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

	if (KinkyDungeonStatsChoice.get("EnemyDamage")) {
		data.dmg *= KDPerkParams.KDEnemyDamageMult;
	}


	KinkyDungeonSendEvent("duringPlayerDamage", data);

	if (data.dmg > 0 && KDGameData.KneelTurns <= 0 && (
		data.knockbackTypesStrong.includes(data.type)
		|| data.knockbackTypes.includes(data.type)
	)) {
		if ((KDGameData.HeelPowerEffective > 0 || data.type == "plush") && data.knockbackTypes.includes(data.type)) {
			let amt = data.dmg;
			KDChangeBalanceSrc(data.type, "knockback", "dmg", (KDBaseBalanceDmgLevel + KDGameData.HeelPowerEffective) / KDBaseBalanceDmgLevel * 0.5*-KDBalanceDmgMult() * amt*KDFitnessMult(), true, true);
		} else if (data.knockbackTypesStrong.includes(data.type)) {
			let amt = data.dmg;
			KDChangeBalanceSrc(data.type, "knockback", "dmg", (KDBaseBalanceDmgLevel + KDGameData.HeelPowerEffective) / KDBaseBalanceDmgLevel * -KDBalanceDmgMult() * amt*KDFitnessMult(), true, true);
		}
	}

	if (!KinkyDungeonIgnoreShieldTypes.includes(data.type) && KDGameData.Shield && data.dmg > 0) {
		let amt = data.dmg;

		data.dmg -= KDGameData.Shield;
		if (!noMsg) {
			KinkyDungeonSendTextMessage(6, TextGet("KDShieldAbsorb").replace("AMNT", "" + Math.round(10 * (amt - Math.max(0, data.dmg)))), "#92e8c0", 1);
			KDDamageQueue.push({floater: Math.round((amt - Math.max(0, data.dmg))*10) + ` ${TextGet("KinkyDungeonDamageType" + KinkyDungeonDamageTypes[data.type].name)} ${TextGet("KDdmg")}`,
				Entity: KinkyDungeonPlayerEntity, Color: "#92e8c0", Delay: 0, size: 12 + Math.floor(Math.min(24, Math.round((amt - Math.max(0, data.dmg))*3)))});
		}

		let shieldDmg = Math.max(0, Math.min(KDGameData.Shield, amt - Math.max(0, data.dmg)));
		KDDamagePlayerShield(shieldDmg, KDPlayer());
		if (data.dmg < 0) data.dmg = 0;
		data.dmgShield += shieldDmg;
	}






	if (data.dmg > 0) {

		if (data.teaseTypes.includes(data.type) || (
			KinkyDungeonStatsChoice.get("Masochist") && data.distractionTypesStrong.includes(data.type)
		)) {
			let amt = data.dmg;
			if (data.bypassTeaseTypes.includes(data.type) || KinkyDungeonStatsChoice.get("Masochist")) {
				KinkyDungeonTeaseLevelBypass += amt * (1 + (0.01 * (KinkyDungeonGoddessRep.Passion + 50) || 0));
			} else {
				KinkyDungeonTeaseLevel += amt * (1 + (0.01 * (KinkyDungeonGoddessRep.Passion + 50) || 0));
			}
		}

		if (data.distractionTypesWeak.includes(data.type)) {
			let amt = data.dmg/2 * data.arouseMod + data.distract;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}dp`;
			KDChangeDistraction(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true, data.arouseAmount);
		}
		if (data.distractionTypesWeakNeg.includes(data.type)) {
			let amt = -data.dmg/2 * data.arouseMod + data.distract;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}dp`;
			KDChangeDistraction(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true);
		}
		if (data.distractionTypesStrong.includes(data.type)) {
			let amt = data.dmg * data.arouseMod + data.distract;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}dp`;
			KDChangeDistraction(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true, data.arouseAmount);
		}
		if (data.staminaTypesStrong.includes(data.type)) {
			let amt = -data.dmg;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}sp`;
			KDChangeStamina(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, false, 0, false, KDGetStamDamageThresh());
		} else if (data.staminaTypesWeak.includes(data.type)) {
			let amt = -data.dmg/2;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}sp`;
			KDChangeStamina(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, false, 0, false, KDGetStamDamageThresh());
		}
		if (data.manaTypesStrong.includes(data.type)) {
			let amt = -data.dmg;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}mp`;
			KDChangeMana(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt);
		} else if (data.manaTypesWeak.includes(data.type)) {
			let amt = -data.dmg/2;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}mp`;
			KDChangeMana(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt);
		}
		if (data.willTypesStrong.includes(data.type)) {
			let amt = -data.dmg;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}wp`;
			KDChangeWill(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true);
		} else if (data.willTypesWeak.includes(data.type)) {
			let amt = -data.dmg/2;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}wp`;
			KDChangeWill(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true);
		} else if (data.willTypesVeryWeak.includes(data.type)) {
			let amt = -data.dmg/4;
			if (str) str = str + ", ";
			str = str + `${Math.round(amt*10)}wp`;
			KDChangeWill(src || (data.arouseAmount > 0 ? "tease" : "dmg"), data.type,"playerDmg", amt, true);
		}
		if (!data.noInterrupt)
			KinkyDungeonInterruptSleep();

		if (data.dmg > 0 && KinkyDungeonStatsChoice.get("Breathless") && !KinkyDungeonStatsChoice.get("Artificial")) {
			let sleepAmount = data.dmg > 3 ? 6 : (data.dmg > 1 ? 4 : 2);
			if (["chain", "poison", "crush"].includes(data.type))
				KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness, KinkyDungeonSleepiness + sleepAmount);
		}

		if (KinkyDungeonStatFreeze > 0 && KinkyDungeonMeleeDamageTypes.includes(data.type)) {
			KDChangeWill(data.type, "freeze", "playerDmg", -data.dmg, true);
			KinkyDungeonStatFreeze = 0;
		}
		KDOrigWill = Math.floor(KinkyDungeonStatWill * 10);


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
			KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(data.dmg * 10), KinkyDungeonDamageTypes[data.type].color, 5, undefined,
				` ${TextGet("KinkyDungeonDamageType" + KinkyDungeonDamageTypes[data.type].name)} ${TextGet("KDdmg")}`,
				16 + Math.floor(Math.min(32, data.dmg*3)), TextGet("KDTook"));
		}
	}

	KinkyDungeonSendEvent("afterPlayerDamage", data);

	return {happened: data.dmg, string: str};
}

function KinkyDungeonUpdateDialogue(entity: entity, delta: number) {
	if (KDGameData.SlowMoveTurns < 1 && !KinkyDungeonStatFreeze && !KDGameData.PlaySelfTurns)
		if (entity.dialogue) {
			if (entity.dialogueDuration > delta) {
				entity.dialogueDuration = Math.max(0, entity.dialogueDuration - delta);
			} else {
				entity.dialogue = null;
			}
		}
}

/**
 * @param entity
 * @param dialogue
 * @param color
 * @param duration
 * @param priority
 * @param [force]
 * @param [nooverride]
 */
function KinkyDungeonSendDialogue(entity: entity, dialogue: string, color: string, duration: number, priority: number, force?: boolean, nooverride?: boolean): void {
	if (!force && !KDEnemyCanTalk(entity) && !entity.player) {
		if (!entity.Enemy.nonHumanoid && entity.Enemy.bound) {
			let suff = "";
			if (KDIsBrattyPersonality(entity)) suff = "Brat";
			else if (KDIsSubbyPersonality(entity)) suff = "Sub";
			entity.dialogue = TextGet("KinkyDungeonRemindJailPlay" + suff + "Gagged" + Math.floor(KDRandom() * 3));
			entity.dialogueColor = color;
			entity.dialogueDuration = 4;
			entity.dialoguePriority = 1;
			if (dialogue && KDCanHearEnemy(KDPlayer(), entity) || KDCanSeeEnemy(entity)) {
				KinkyDungeonSendTextMessage(0, `${TextGet("Name" + entity.Enemy.name)}: ${entity.dialogue}`, color, 0, false, false, entity, "Dialogue");
			}
			KDEnemyAddSound(entity, 7);
			if (KDRandom() < 0.5)
				KDSendGagParticles(entity);
		}
		return;
	}
	if (!entity.dialogue || !entity.dialoguePriority || entity.dialoguePriority <= priority + (nooverride ? 1 : 0)) {
		entity.dialogue = dialogue;
		entity.dialogueColor = color;
		entity.dialogueDuration = duration;
		entity.dialoguePriority = priority;
		if (!entity.player) {
			KDEnemyAddSound(entity, 12);
			if (dialogue && KDCanHearEnemy(KDPlayer(), entity) || KDCanSeeEnemy(entity)) {
				KinkyDungeonSendTextMessage(0, `${TextGet("Name" + entity.Enemy.name)}: ${entity.dialogue}`, color, 0, false, false, entity, "Dialogue");
			}
			KDAllowDialogue = false;
		}
	}
}

let KDOrigStamina = KDMaxStatStart*10;
let KDOrigMana = KDMaxStatStart*10;
let KDOrigWill = KDMaxStatStart*10;
let KDOrigCharge = 1000;
let KDOrigBalance = 100;
let KDOrigDistraction = 0;
let KDOrigDesire = 0;

function KDChangeDistraction(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, lowerPerc?: number, minimum: number = 0, noEvent?: boolean): number {

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let data = {
		src: src,
		type: type,
		trig: type,
		Amount: Amount,
		NoFloater: NoFloater,
		lowerPerc: lowerPerc,
		minimum: minimum,
		amountChanged: 0,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainDistraction"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossDistraction"))
		),
	};
	if (!noEvent)
		KinkyDungeonSendEvent("changeDistraction", data);
	Amount = data.Amount * data.mult;
	lowerPerc = data.lowerPerc;
	minimum = data.minimum;
	NoFloater = data.NoFloater;
	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let minLevel = Math.min(KinkyDungeonStatDistractionMax * minimum, KinkyDungeonStatDistraction); // Cannot go below this or current
	if (Amount > 0) {
		KDNoRegenFlag = true;
	}

	if (!noEvent)
		KinkyDungeonSendEvent("duringChangeDistraction", data);
	let amountChanged = KinkyDungeonStatDistraction;
	KinkyDungeonStatDistraction += Amount;
	KinkyDungeonStatDistraction = Math.min(Math.max(minLevel, KinkyDungeonStatDistraction), KinkyDungeonStatDistractionMax);

	amountChanged = KinkyDungeonStatDistraction - amountChanged;
	if (!KDGameData.DistractionCooldown) {
		KDGameData.DistractionCooldown = 0;
	}
	if (Amount > 0) {
		let cdBonus = KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax ? Math.min(4, Math.max(1, Math.ceil(Amount/1.5))) : 0;
		KDGameData.DistractionCooldown = Math.max(KDGameData.DistractionCooldown, 3 + cdBonus, KDGameData.SlowMoveTurns + 1 + cdBonus);

		
	}

	if (lowerPerc) {
		if (Amount * lowerPerc > 0) {
			KDDistractionFlashLastTime = CommonTime();
			KDDistractionFlashStrength = Math.max(Amount * lowerPerc * 0.15, KDDistractionFlashStrength);
		}


		KDChangeDesire(src, type, trig, Amount * lowerPerc, NoFloater);
		
	}
	if (!NoFloater && Math.abs(KDOrigDistraction - Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100)) >= 0.99) {
		//KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100) - KDOrigDistraction, "#ff00ff", undefined, undefined, "% distraction");
		let amount = Math.min(1, Math.max(0, (Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100) - KDOrigDistraction) / 100));
		amount *= amount;
		amount = Math.max(amount, amount * 0.5 + 0.5 * KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax);
		amount = Math.round(10 * amount);

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet("KinkyDungeonChangeDistraction" + (KinkyDungeonCanTalk() ? "" : "Gag") + amount), "#ff00ff", 2, 1);
		KDOrigDistraction = Math.max(0, Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100));
	}


	if (isNaN(KinkyDungeonStatDistraction)) {
		console.trace();
		KinkyDungeonStatDistraction = 0;
	}

	data.amountChanged = amountChanged;

	if (!noEvent)
		KinkyDungeonSendEvent("afterChangeDistraction", data);

	if (Math.ceil(data.amountChanged) > 0) {
		KinkyDungeonSetFlag("recentDistract", Math.min(10, Math.ceil(data.amountChanged)));
	}
	
	if (data.amountChanged > 0) {
		if (KDToggles.ArousalHearts)
			for (let i = 0; i < data.amountChanged * 10 && i < 100; i++) {
				KDCreateArousalParticle(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, 0);
			}
	}

	return amountChanged;
}



function KDChangeDesire(src: string, type: string, trig: string, Amount: number, NoFloater: boolean): number {

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let data = {
		src: src,
		type: type,
		trig: type,
		Amount: Amount,
		amountChanged: 0,
		NoFloater: NoFloater,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainDesire"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossDesire"))
		),
	};
	KinkyDungeonSendEvent("changeDesire", data);
	Amount = data.Amount * data.mult;
	NoFloater = data.NoFloater;
	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let amountChanged = KinkyDungeonStatDistractionLower;
	KinkyDungeonStatDistractionLower += Amount;
	KinkyDungeonStatDistractionLower = Math.min(Math.max(0, KinkyDungeonStatDistractionLower), KinkyDungeonStatDistractionMax);
	amountChanged = KinkyDungeonStatDistractionLower - amountChanged;
	if (!KDGameData.DistractionCooldown) {
		KDGameData.DistractionCooldown = 0;
	}

	if (!NoFloater && Math.abs(KDOrigDesire - Math.floor(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * 100)) >= 0.99) {
		//KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * 100) - KDOrigDistraction, "#ff00ff", undefined, undefined, "% distraction");
		let amount = Math.min(1, Math.max(0, (Math.floor(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * 100) - KDOrigDesire) / 100));
		amount *= amount;
		amount = Math.max(amount, amount * 0.5 + 0.5 * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax);
		amount = Math.round(10 * amount);

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet("KinkyDungeonChangeDistraction" + (KinkyDungeonCanTalk() ? "" : "Gag") + amount), "#ff00ff", 2, 1);

		KDOrigDesire = Math.max(0, Math.floor(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax * 100));
	}


	if (isNaN(KinkyDungeonStatDistractionLower)) {
		console.trace();
		KinkyDungeonStatDistractionLower = 0;
	}
	data.amountChanged = amountChanged;
	KinkyDungeonSendEvent("afterChangeDesire", data);
	
	if (Math.ceil(data.amountChanged) > 0) {
		KinkyDungeonSetFlag("recentDesire", Math.min(10, Math.ceil(data.amountChanged)));
	}

	if (data.amountChanged > 0) {
		if (KinkyDungeonFlags.get("blockdesiredecay") != -1)
			KinkyDungeonSetFlag("blockdesiredecay", 
			Math.max(1, 
					Math.max(Math.min(10, Math.ceil(data.amountChanged)), 
					KinkyDungeonFlags.get("blockdesiredecay") || 0)));
		if (KDToggles.ArousalHearts)
			for (let i = 0; i < data.amountChanged * 10 && i < 100; i++) {
				KDCreateArousalParticle(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax, 0);
			}
	}

	return amountChanged;
}

function KDChangeStamina(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, Pause?: number, NoSlow?: boolean, minimum: number = 0, slowFloor: number = 5, Regen: boolean = false) {

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let data = {
		src: src,
		type: type,
		trig: type,
		NoFloater: NoFloater,
		Amount: Amount,
		NoSlow: NoSlow,
		minimum: minimum,
		Pause: Pause,
		slowFloor: slowFloor,
		regen: Regen,
		Cap: KinkyDungeonStatStaminaMax,
		mult: Math.max(0,
			Amount > 0 ? Math.max(0, 1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainStamina"))
			: Math.max(0, 1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossStamina"))
		),
	};
	KinkyDungeonSendEvent("changeStamina", data);
	NoFloater = data.NoFloater;
	Amount = data.Amount*data.mult;


	NoSlow = data.NoSlow;
	minimum = data.minimum;
	slowFloor = data.slowFloor;
	Pause = data.Pause;

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let minLevel = Math.min(KinkyDungeonStatStaminaMax * minimum, KinkyDungeonStatStamina); // Cannot go below this or current
	let stamPre = KinkyDungeonStatStamina;
	KinkyDungeonStatStamina += Amount;
	KinkyDungeonStatStamina = Math.min(
		Math.max(minLevel, KinkyDungeonStatStamina),
		Amount > 0 ? Math.max(stamPre, data.Cap) : KinkyDungeonStatStamina);
	if (!NoFloater && Math.abs(KDOrigStamina - Math.floor(KinkyDungeonStatStamina * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatStamina * 10) - KDOrigStamina,
		"#44ff66", undefined, undefined, " sp", undefined, Amount > 0 ? "+" : undefined);
		KDOrigStamina = Math.floor(KinkyDungeonStatStamina * 10);
	}
	if (Pause) {
		if (!(KDGameData.StaminaPause > Pause))
			KDGameData.StaminaPause = Pause;
		if (!(KDGameData.StaminaSlow > 5) && !NoSlow)
			KDGameData.StaminaSlow = Math.min(5, (KDGameData.StaminaSlow || 0) + 1.5);
	}

	if (isNaN(KinkyDungeonStatStamina)) {
		console.trace();
		KinkyDungeonStatStamina = 0;
	}
}
/**
 * @param Amount
 * @param [NoFloater]
 * @param [PoolAmount]
 * @param [Pause]
 * @param [spill]
 */
function KDChangeMana(src: string, type: string, trig: string, Amount: number,
	NoFloater?: boolean, PoolAmount?: number, Pause?: boolean, spill?: boolean, minimum: number = 0) {

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let data = {
		src: src,
		type: type,
		trig: type,
		NoFloater: NoFloater,
		Amount: Amount,
		PoolAmount: PoolAmount,
		minimum: minimum,
		Pause: Pause,
		spill: spill,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainMana"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossMana"))
		),
	};
	KinkyDungeonSendEvent("changeMana", data);
	NoFloater = data.NoFloater;
	Amount = data.Amount * data.mult;
	PoolAmount = data.PoolAmount;
	minimum = data.minimum;
	Pause = data.Pause;
	spill = data.spill;

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let minLevel = Math.min(KinkyDungeonStatManaMax * minimum, KinkyDungeonStatMana); // Cannot go below this or current
	let manaAmt = KinkyDungeonStatMana;
	KinkyDungeonStatMana += Amount;
	KinkyDungeonStatMana = Math.min(Math.max(minLevel, KinkyDungeonStatMana), KinkyDungeonStatManaMax);
	manaAmt = KinkyDungeonStatMana - manaAmt;
	if (!PoolAmount) PoolAmount = 0;
	if (spill && manaAmt != Amount) PoolAmount += (Amount - manaAmt) * KDManaPoolRatio;
	if (PoolAmount) {
		KinkyDungeonStatManaPool += PoolAmount;
		KinkyDungeonStatManaPool = Math.min(Math.max(0, KinkyDungeonStatManaPool), KinkyDungeonStatManaPoolMax);
	}
	if (!NoFloater && Math.abs(KDOrigMana - Math.floor(KinkyDungeonStatMana * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatMana * 10) - KDOrigMana,
		"#4499ff", undefined, undefined, " mp", undefined, Amount > 0 ? "+" : undefined);
		KDOrigMana = Math.floor(KinkyDungeonStatMana * 10);
	}
	if (Pause) {
		if (!(KDGameData.ManaSlow > 10))
			KDGameData.ManaSlow = 10;
	}

	if (isNaN(KinkyDungeonStatMana)) {
		console.trace();
		KinkyDungeonStatMana = 0;
	}
}
function KDChangeWill(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean, minimum: number = 0): number {

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let data = {
		src: src,
		type: type,
		trig: type,
		NoFloater: NoFloater,
		Amount: Amount,
		minimum: minimum,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainWill"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossWill"))
		),
		amountChanged: 0,
	};
	let amountChanged = KinkyDungeonStatWill;
	KinkyDungeonSendEvent("changeWill", data);
	NoFloater = data.NoFloater;
	Amount = data.Amount * data.mult;
	minimum = data.minimum;

	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}
	let minLevel = Math.min(KinkyDungeonStatWillMax * minimum, KinkyDungeonStatWill); // Cannot go below this or current
	KinkyDungeonStatWill += Amount;
	KinkyDungeonStatWill = Math.min(Math.max(minLevel, KinkyDungeonStatWill), KinkyDungeonStatWillMax);
	if (!NoFloater && Math.abs(KDOrigWill - Math.floor(KinkyDungeonStatWill * 10)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KinkyDungeonStatWill * 10) - KDOrigWill,
		"#ff4444", Amount > 0 ? 5 : undefined, undefined, " wp", undefined, Amount > 0 ? "+" : undefined);
		KDOrigWill = Math.floor(KinkyDungeonStatWill * 10);
	}

	if (isNaN(KinkyDungeonStatWill)) {
		console.trace();
		KinkyDungeonStatWill = 0;
	}

	amountChanged = KinkyDungeonStatWill - amountChanged;

	data.amountChanged = amountChanged;
	
	KinkyDungeonSendEvent("afterChangeWill", data);


	if (Math.ceil(data.amountChanged) > 0) {
		KinkyDungeonSetFlag("recentWill", Math.min(10, Math.ceil(data.amountChanged)));
	}

	return amountChanged;
}


function KDChangeBalanceSrc(src: string, type: string, trig: string, Amount: number, NoFloater: boolean, allowFall?: boolean, forcePauseAmt?: number) {
	if (KinkyDungeonStatsChoice.get("ClassicHeels") && src == "heels" && Amount < 0) return 0;
	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let data = {
		src: src,
		type: type,
		trig: type,
		NoFloater: NoFloater,
		Amount: Amount,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainBalance"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossBalance"))
		),
		amountChanged: 0,
	};
	KinkyDungeonSendEvent("changeBalance", data);
	NoFloater = data.NoFloater;
	Amount = data.Amount * data.mult;

	if (!KDGameData.Balance) KDGameData.Balance = 0;
	let orig = KDGameData.Balance;
	KDGameData.Balance = Math.min(1, Math.max(0, KDGameData.Balance + Amount));
	if (Amount < 0) KDPauseBalance(forcePauseAmt ? forcePauseAmt : (3 + Math.min(10, Math.floor(-Amount * 10))));

	data.amountChanged = KDGameData.Balance - orig;
	KinkyDungeonSendEvent("afterChangeBalance", data);
	if (!NoFloater && Math.abs(KDOrigBalance - Math.floor(KDGameData.Balance * 100)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KDGameData.Balance * 100) - KDOrigBalance,
		"#ffff44", undefined, undefined, " balance", undefined, Amount > 0 ? "+" : undefined);
		KDOrigBalance = Math.floor(KDGameData.Balance * 100);
	}

	if (KDGameData.Balance <= 0 && allowFall) {
		KDTrip(1);
	}

	if (isNaN(KDGameData.Balance)) {
		console.trace();
		KDGameData.Balance = 0;
	}
	return data.amountChanged;
}

function KDChangeCharge(src: string, type: string, trig: string, Amount: number, NoFloater?: boolean) {
	if (isNaN(Amount)) {
		console.trace();
		Amount = 0;
	}

	let data = {
		src: src,
		type: type,
		trig: type,
		NoFloater: NoFloater,
		Amount: Amount,
		mult: Math.max(0,
			Amount > 0 ? (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatGainCharge"))
			: (1 + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "StatLossCharge"))
		),
		amountChanged: undefined,
	};
	KinkyDungeonSendEvent("changeCharge", data);
	NoFloater = data.NoFloater;
	Amount = data.Amount * data.mult;

	if (!KDGameData.AncientEnergyLevel) KDGameData.AncientEnergyLevel = 0;
	let orig = KDGameData.AncientEnergyLevel;
	KDGameData.AncientEnergyLevel = Math.min(1, Math.max(0, KDGameData.AncientEnergyLevel + Amount));

	data.amountChanged = KDGameData.AncientEnergyLevel - orig;
	KinkyDungeonSendEvent("afterChangeCharge", data);
	if (!NoFloater && Math.abs(KDOrigCharge - Math.floor(KDGameData.AncientEnergyLevel * 1000)) >= 0.99) {
		KinkyDungeonSendFloater(KinkyDungeonPlayerEntity, Math.floor(KDGameData.AncientEnergyLevel * 1000) - KDOrigCharge,
		"#ffff44", undefined, undefined, " charge", undefined, Amount > 0 ? "+" : undefined);
		KDOrigCharge = Math.floor(KDGameData.AncientEnergyLevel * 1000);
	}


	if (isNaN(KDGameData.AncientEnergyLevel)) {
		console.trace();
		KDGameData.AncientEnergyLevel = 0;
	}
}

function KinkyDungeonHasStamina(Cost: number, AddRate?: boolean): boolean {
	let s = KinkyDungeonStatStamina;
	if (AddRate) s += KinkyDungeonStaminaRate;

	return s >= Cost;
}
function KinkyDungeonHasWill(Cost: number, AddRate?: boolean): boolean {
	let s = KinkyDungeonStatWill;
	if (AddRate) s += KinkyDungeonStatWillRate;

	return s >= Cost;
}
/**
 * @param Cost
 * @param [AddRate]
 */
function KinkyDungeonHasMana(Cost: number, AddRate?: boolean): boolean {
	let s = KinkyDungeonStatMana;
	if (AddRate) s += KinkyDungeonStatManaRate;

	return s >= Cost;
}

function KinkyDungeonSetMaxStats(delta?: any) {
	// Upgradeable stats
	KinkyDungeonStatStaminaMax = KDMaxStatStart;
	KinkyDungeonStatDistractionMax = KDMaxStatStart;
	KinkyDungeonStatManaMax = KDMaxStatStart;
	KinkyDungeonStatManaPoolMax = KDMaxStatStartPool;
	KinkyDungeonStatWillMax = KDMaxStatStart;
	//KinkyDungeonSpellChoiceCount = 30;
	KinkyDungeonSummonCount = 2;
	let data = {
		distractionRate: 0,
		staminaRate: KinkyDungeonStatStaminaRegen,
		delta: delta,
	};

	let initStats = !KDGameData.StatMaxBonus;
	if (initStats) {
		KDGameData.StatMaxBonus = {
			AP: 0,
			MP: 0,
			SP: 0,
			WP: 0,
		};
	}
	for (let s of KinkyDungeonSpells) {
		if (initStats) {
			if (s.name == "SPUp1") {
				KDGameData.StatMaxBonus.SP += 5;
			}
			if (s.name == "APUp1") {
				KDGameData.StatMaxBonus.AP += 5;
			}
			if (s.name == "WPUp1") {
				KDGameData.StatMaxBonus.WP += 5;
			}
			if (s.name == "MPUp1") {
				KDGameData.StatMaxBonus.MP += 5;
			}

		}



		//if (s.name == "SpellChoiceUp1" || s.name == "SpellChoiceUp2" || s.name == "SpellChoiceUp3") KinkyDungeonSpellChoiceCount += 1;
		if (s.name == "SummonUp1" || s.name == "SummonUp2") KinkyDungeonSummonCount += 2;
	}


	KinkyDungeonStatStaminaMax += KDGameData.StatMaxBonus.SP;
	data.staminaRate += KinkyDungeonStatStaminaRegenPerUpgrade * KDGameData.StatMaxBonus.SP;

	KinkyDungeonStatDistractionMax += KDGameData.StatMaxBonus.AP;
	if (KinkyDungeonVibeLevel == 0 && !(KDGameData.DistractionCooldown > 0))
		data.distractionRate += KDGameData.StatMaxBonus.AP * KinkyDungeonStatDistractionRegenPerUpgrade;

	KinkyDungeonStatWillMax += KDGameData.StatMaxBonus.WP;
	data.staminaRate += KDGameData.StatMaxBonus.WP * KinkyDungeonStatStaminaRegenPerUpgradeWill;

	KinkyDungeonStatManaMax += KDGameData.StatMaxBonus.MP;

	KinkyDungeonSendEvent("calcMaxStats", data);

	return {distractionRate: data.distractionRate, staminaRate: data.staminaRate};
}

/**
 * @param [NoOverride]
 * @param [e]
 * @param [weapon]
 */
function KinkyDungeonCanUseWeapon(NoOverride?: boolean, e?: boolean, weapon?: weapon): boolean {
	let flags = {
		HandsFree: false,
		clumsy: weapon?.clumsy,
		weapon: weapon,
		treatAsHandsBound: false,
		treatAsArmsBound: false,
	};
	if (!NoOverride)
		KinkyDungeonSendEvent("getWeapon", {event: e, flags: flags});
	return flags.HandsFree
		|| weapon?.noHands
		|| (!(flags.treatAsHandsBound || KinkyDungeonIsHandsBound(false, true))
			&& ((!KinkyDungeonStatsChoice.get("WeakGrip") && !flags.clumsy)
				|| !(flags.treatAsArmsBound
					|| KinkyDungeonIsArmsBound(false, true))));
}

let KDBlindnessCap = 0;
let KDBoundPowerLevel = 0;
let KDNoRegenFlag = false;

function KDGetDistractionRate(delta: number): number {
	let mult = KDNoRegenFlag ? 0 : 1;
	KDNoRegenFlag = false;
	let VibeDistractionRate = 0;
	let VibeTargetLevel = 0;
	// Vibrators are less effective the more aroused you are
	if (KinkyDungeonVibeLevel > 0) {
		VibeTargetLevel = 0.3 + 0.2 * KinkyDungeonVibeLevel + 0.5 * 0.01 * (KinkyDungeonGoddessRep.Passion + 50);
		VibeTargetLevel = KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax + (1 - KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionMax) * VibeTargetLevel;
		VibeDistractionRate = Math.max(0, (VibeTargetLevel - KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax) * KinkyDungeonDistractionPerVibe * KinkyDungeonVibeLevel);
		mult = Math.min(Math.max(0, (-VibeTargetLevel + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax)), 1);
	}

	let distractionRate = (VibeDistractionRate == 0 && !(KDGameData.DistractionCooldown > 0)) ? (!KinkyDungeonStatsChoice.get("arousalMode") ?
		KinkyDungeonStatDistractionRegen * KDDistractionDecayMultDistractionMode * mult : (KDGameData.PlaySelfTurns < 1 ? mult * KinkyDungeonStatDistractionRegen*(
			(KinkyDungeonChastityMult() > 0.9 ? KDNoUnchasteMult : (KinkyDungeonChastityMult() > 0 ? KDNoUnchasteBraMult : 1.0))) : 0)) :
		VibeDistractionRate;

	let distractionBonus = KinkyDungeonSetMaxStats(delta).distractionRate;
	if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionLower) {
		distractionRate = Math.max(0, distractionRate);
	} else if (KDGameData.PlaySelfTurns < 1) distractionRate += distractionBonus;

	if (distractionRate < 0 && KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionLower && KinkyDungeonStatDistraction + distractionRate < KinkyDungeonStatDistractionLower) {
		distractionRate = Math.max(distractionRate, (KinkyDungeonStatDistractionLower - KinkyDungeonStatDistraction) * (
			KinkyDungeonStatDistractionLower > 0 ? 0.25 : 1
		));
	}

	if (KDGameData.OrgasmStamina > 0 && delta > 0) {
		let amount = (KDGameData.OrgasmStamina || 0)/24;
		KDGameData.OrgasmStamina = Math.max(0, KDGameData.OrgasmStamina*0.98 - delta/70);
		distractionRate += -amount;
	}

	if (KinkyDungeonStatDistraction < KinkyDungeonStatDistractionLower) {
		distractionRate +=
		Math.min(
			Math.max(0, 0.1*(KinkyDungeonStatDistractionLower - KinkyDungeonStatDistraction)),
			KDGetDistractionDesireRate());
	}
	if (!KDGameData.DistractionCooldown) KDGameData.DistractionCooldown = 0;
	if (KDGameData.DistractionCooldown > 0) KDGameData.DistractionCooldown = Math.max(0, KDGameData.DistractionCooldown - delta);



	return distractionRate;
}

function KDGetDistractionDesireRate() {
	let data = {
		amount: KDDistractionLowerPercMult * KinkyDungeonStatDistractionMax,
		mult: 1,
		bonus: 0,
	};

	KinkyDungeonSendEvent("desireRate", data);
	return data.amount * data.mult + data.bonus;
}


/**
 * @param delta
 */
function KinkyDungeonUpdateStats(delta: number): void {
	KDBoundPowerLevel = 0;
	KDBoundPowerLevel += 0.1 * Math.max(0, Math.min(1, KinkyDungeonBlindLevel / 3));
	if (KinkyDungeonIsArmsBound(false, false)) KDBoundPowerLevel += 0.2;
	if (KinkyDungeonIsHandsBound(false, false, 0.65)) KDBoundPowerLevel += 0.075;
	if (KinkyDungeonIsHandsBound(false, false, 0.99)) KDBoundPowerLevel += 0.075;
	KDBoundPowerLevel += 0.1 * KinkyDungeonChastityMult();
	KDBoundPowerLevel += 0.2 * KinkyDungeonGagTotal();
	if (KDGameData.KneelTurns > 0) {
		if (KinkyDungeonSlowLevel > 2) KDBoundPowerLevel += 0.15;
	} else KDBoundPowerLevel += 0.15 * Math.max(0, Math.min(1, KinkyDungeonSlowLevel / 2));
	KDBoundPowerLevel += 0.1 * Math.max(0, Math.min(1, KDGameData.HeelPowerEffective / 4));
	if (KDBoundPowerLevel > 1) KDBoundPowerLevel = 1;
	if (KinkyDungeonStatsChoice.get("BoundPower")) {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id:"BoundPower",
			type: "Evasion",
			duration: 1,
			power: KDBoundPowerLevel * KDBoundPowerMult,
		});
	}

	KDGameData.Restriction = KDGetRestriction();

	KinkyDungeonPlayers = [KinkyDungeonPlayerEntity];

	KDBlindnessCap = 7;
	KinkyDungeonSendEvent("calcStats", {});
	// Initialize
	KinkyDungeonCalculateVibeLevel(delta);
	if (KinkyDungeonVibeLevel > 0 && KinkyDungeonCanPlayWithSelf() && KDGameData.SleepTurns > 0 && KDGameData.SleepTurns < 5) {
		//KinkyDungeonInterruptSleep();
		//KinkyDungeonSendActionMessage(5, TextGet("KinkyDungeonSleepDeprivation"), "pink", 3);
	}
	KinkyDungeonDifficulty = KinkyDungeonNewGame * 20;
	//if (KinkyDungeonStatsChoice.get("hardMode")) KinkyDungeonDifficulty += 10;
	KinkyDungeonTeaseLevel = Math.max(KinkyDungeonTeaseLevel * (1 - KinkyDungeonChastityMult()) + (delta > 0 ? KinkyDungeonTeaseLevelBypass : 0), 0);
	if (delta > 0 && KinkyDungeonTeaseLevel) {
		KDDistractionFlashLastTime = CommonTime();
		KDDistractionFlashStrength = Math.max(KinkyDungeonTeaseLevel, KDDistractionFlashStrength);
	}
	if (KinkyDungeonVibeLevel > 0 || KinkyDungeonTeaseLevel > 0) {
		KDGameData.OrgasmNextStageTimer = Math.min(KDOrgasmStageTimerMax, KDGameData.OrgasmNextStageTimer + delta);
		let data = {
			invol_chance: (KDGameData.OrgasmStage >= KinkyDungeonMaxOrgasmStage) ?
				1.0 :
				(KDInvolChanceBase + KDWillpowerInvolChanceMult * (1 - KinkyDungeonStatWill/KinkyDungeonStatWillMax) + KDPassionInvolChanceMult * (0.01 * (KinkyDungeonGoddessRep.Passion + 50) || 0)),
			invol_satisfied_threshold: KinkyDungeonStatDistractionMax * 0.75,
		};
		KinkyDungeonSendEvent("calcInvolOrgasmChance", data);
		if ((KinkyDungeonTeaseLevel > 0 || KDGameData.OrgasmNextStageTimer >= KDOrgasmStageTimerMax) && (KDRandom() < data.invol_chance && KinkyDungeonControlsEnabled())) {
			if (KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage) {
				if (KinkyDungeonCanPlayWithSelf() && KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > KDGetPlaySelfThreshold() && !KinkyDungeonInDanger()) {
					KinkyDungeonDoPlayWithSelf(KinkyDungeonTeaseLevel);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonPlaySelfAutomatic" + (KinkyDungeonIsArmsBound() ? "Bound" : "")), "#FF5BE9", 5);
				} else {
					KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPlaySelfTease"), "#FF5BE9", 2);
				}
				KDGameData.OrgasmStage += 1;
				KDGameData.OrgasmNextStageTimer = 1;
			} else {
				if (KinkyDungeonCanOrgasm() && (KDGameData.OrgasmStamina < 0.5 || KinkyDungeonStatDistraction >= data.invol_satisfied_threshold) && KDGameData.PlaySelfTurns < 1) {
					KinkyDungeonDoTryOrgasm(KinkyDungeonTeaseLevel, KinkyDungeonTeaseLevel > 0 ? 1 : 2);
					KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonOrgasmAutomatic"), "#FF5BE9", KinkyDungeonOrgasmStunTime + 1, true);
					KDGameData.OrgasmNextStageTimer = 1;
				}
			}
		}
	} else if (KDGameData.OrgasmNextStageTimer > 0) {
		KDGameData.OrgasmNextStageTimer = Math.max(0, KDGameData.OrgasmNextStageTimer - delta);
	}

	let distractionRate = KDGetDistractionRate(delta);

	if (delta > 0 && KinkyDungeonVibeLevel > 0) {
		KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonVibing" + Math.max(0, Math.min(5, Math.round(KinkyDungeonVibeLevel)))), "#ff88ff", 2, true, true);
	}
	let arousalPercent = distractionRate > 0 && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionLower ? 0.01 : 0;

	if (KDGameData.OrgasmStage > 0 && !KinkyDungeonFlags.get("orgasmStageTimer") && KinkyDungeonStatDistraction < KinkyDungeonStatDistractionMax * 0.75) {
		KDGameData.OrgasmStage = Math.max(0, KDGameData.OrgasmStage - delta);
		KinkyDungeonSetFlag("orgasmStageTimer", 20 + Math.round(KDRandom() * 20));
	}
	if (KinkyDungeonStatDistraction >= KinkyDungeonStatDistractionMax * 0.99) KDGameData.OrgasmTurns = Math.min(KDGameData.OrgasmTurns + delta, KinkyDungeonOrgasmTurnsMax);
	else KDGameData.OrgasmTurns = Math.max(KDGameData.OrgasmTurns - delta, 0);


	let sleepRegen = KinkyDungeonStatStaminaRegenSleep * KinkyDungeonStatStaminaMax / KDMaxStatStart;
	let sleepRegenDistraction = KinkyDungeonStatArousalLowerRegenSleep * KinkyDungeonStatDistractionMax / KDMaxStatStart;
	if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y) == 'B') sleepRegen *= 2;
	let stamMult = KDGameData.StaminaSlow > 0 ? Math.max(0.5, (KDForcedToGround() ? 0.5 : 1.0) - 0.1 * KDGameData.StaminaSlow) : 1.0;
	let stamRegen = KDGameData.StaminaPause > 0 ? 0 : KinkyDungeonSetMaxStats().staminaRate * stamMult;

	// Process wait equation
	if (delta > 0 && KDGameData.StaminaPause > 0) KDGameData.StaminaPause -= delta;
	if (delta > 0 && KDGameData.StaminaSlow > 0) KDGameData.StaminaSlow -= delta;
	if (delta > 0 && KDGameData.ManaSlow > 0) KDGameData.ManaSlow -= delta;


	let curTurns = KDGameData.KneelTurns;

	let KneelStats = KDGetKneelStats(delta, true);
	let minKneel = KneelStats.minKneel;
	let kneelRate = KneelStats.kneelRate;


	if (delta > 0 && KDGameData.KneelTurns > minKneel) KDGameData.KneelTurns -= delta*kneelRate;
	if (KDGameData.Crouch) KDGameData.KneelTurns = Math.max(1, KDGameData.KneelTurns || 0);
	if (KDGameData.Wait > 0) {
		if (delta > 0) {
			KDGameData.Wait -= delta;
			if (delta > 0 && KDGameData.StaminaPause > 0) KDGameData.StaminaPause -= delta;
			if (delta > 0 && KDGameData.StaminaSlow > 0) KDGameData.StaminaSlow -= delta;
		}

		stamRegen *= 2;
	}

	if (curTurns != KDGameData.KneelTurns && KDGameData.KneelTurns <= 0) {
		KDCancelAutoWait();
	}

	if (KDGameData.AncientEnergyLevel > 0.01) {
		if (!KinkyDungeonFlags.get("tut_charge")) {
			KinkyDungeonSetFlag("tut_charge", -1);
			KinkyDungeonSendTextMessage(10, TextGet("KDTut_Charge2"), KDTutorialColor, 10);
			KinkyDungeonSendTextMessage(10, TextGet("KDTut_Charge"), KDTutorialColor, 10);
		}
	}

	KinkyDungeonStaminaRate = KDGameData.SleepTurns > 0 && KDGameData.SleepTurns < KinkyDungeonSleepTurnsMax - 1? sleepRegen : stamRegen;

	let statData = {
		manaPoolRegen: KinkyDungeonStatManaPoolRegen,
		player: KinkyDungeonPlayerEntity,
	};
	KinkyDungeonSendEvent("calcManaPool", statData);
	KinkyDungeonSendEvent("afterCalcManaPool", statData);
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
	KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints(KinkyDungeonPlayer, -1, delta);
	
	KDEntityRestraintMetadata.set(KDPlayer().id, KDUpdateRestraintMetadata(KDPlayer().id, delta));

	let blind = Math.max(KinkyDungeonBlindLevelBase, KinkyDungeonGetBlindLevel());
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness")) blind = Math.max(0, blind + KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Blindness"));
	KinkyDungeonBlindLevel = Math.min(KDBlindnessCap, blind);
	//if (KinkyDungeonBlindLevel > 0 && KinkyDungeonStatsChoice.has("Unmasked")) KinkyDungeonBlindLevel += 1;
	if (KinkyDungeonStatBlind > 0) KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel, 6);
	//if (KinkyDungeonStatStamina < 2) KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel, Math.round(6 - 3*KinkyDungeonStatStamina));
	KinkyDungeonDeaf = false;//KinkyDungeonPlayer.IsDeaf();

	// Unarmed damage calc
	if (KinkyDungeonPlayerWeapon && !KinkyDungeonInventoryGet(KinkyDungeonPlayerWeapon))
		KDSetWeapon(null);
	KinkyDungeonPlayerDamage = KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon(undefined, undefined, KinkyDungeonPlayerDamage));

	KinkyDungeonUpdateStruggleGroups();
	// Slowness calculation
	KinkyDungeonCalculateSlowLevel(delta);
	KDGameData.HeelPowerEffective = KinkyDungeonCalculateHeelLevel(delta);
	KDGameData.HeelPower = KinkyDungeonCalculateHeelLevel(delta, true);
	let sleepRate = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Sleepiness")
		+ (KDIsImmuneToGas(KDPlayer()) ? 0 : (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SleepinessGas")
			* KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "happygasDamageResist") * 2)))
		+ (KDIsImmuneToDrugs(KDPlayer()) ? 0 : (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SleepinessPoison")
			* KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "poisonDamageResist"))));
	if ((sleepRate && sleepRate > 0) || KinkyDungeonSleepiness > 0) {
		KinkyDungeonSleepiness = Math.min(KinkyDungeonSleepinessMax, KinkyDungeonSleepiness + sleepRate * delta);
		if (KinkyDungeonSleepiness > 2.99) {
			KinkyDungeonSlowLevel = Math.max(KinkyDungeonSlowLevel, 2);
			//KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel + Math.floor(KinkyDungeonSleepiness/2), 5);
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "Sleepy",
				aura: "#767676ff",
				type: "AttackStamina",
				duration: 3,
				power: -1,
				player: true,
				enemies: false,
				tags: ["attack", "stamina"]
			});
		}
		if (KinkyDungeonSleepiness > 0) {
			KinkyDungeonBlindLevel = Math.max(KinkyDungeonBlindLevel + Math.floor(KinkyDungeonSleepiness*0.5), Math.min(Math.round(KinkyDungeonSleepiness*0.7), 6));
		}
		if (KinkyDungeonSleepiness > 0) {
			KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonSleepy"), KDBaseRed, 1, true);
		}
		if (KinkyDungeonSleepiness > 4.99) {
			KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, 2);
		}
	}
	if ((!sleepRate || sleepRate <= 0) && KinkyDungeonSleepiness > 0) KinkyDungeonSleepiness = Math.max(0, KinkyDungeonSleepiness - delta);

	// Cap off the values between 0 and maximum
	if (Math.abs(distractionRate) > 0.0001) {
		KDChangeDistraction("player", "regen", "tick", distractionRate*delta, true, arousalPercent);
	} else if (!KinkyDungeonFlags.get("blockdesiredecay")) {
		let amt = ((!KinkyDungeonFlags.get("recentDistract") && KinkyDungeonStatDistractionLower > KinkyDungeonStatDistractionLowerDecayTo * KinkyDungeonStatDistractionMax) ? -Math.min(Math.min(KinkyDungeonStatDistractionLower - 
				KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerDecayTo,
		KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerDecayRate * delta
			)) : 0);
		if (amt < 0)
			KDChangeDesire("player", "decay","tick", 
					amt * (0.25) / (0.25 + KinkyDungeonChastityMult()), true)
	}
	
	if (sleepRegenDistraction > 0 && KDGameData.SleepTurns > 0) {
		KinkyDungeonStatDistractionLower -= sleepRegenDistraction*delta;
	} else {
		//KinkyDungeonStatDistractionLower += distractionRate*delta * arousalPercent;
	}

	KDChangeStamina("player", "regen", "tick", KinkyDungeonStaminaRate*delta, true, undefined, true, undefined, undefined, true);
	KDGameData.Wait = Math.max(0, KDGameData.Wait);

	KinkyDungeonStatMana += KinkyDungeonStatManaRate;
	KinkyDungeonStatManaPool -= ManaPoolDrain;

	if (KDIsEdged(KinkyDungeonPlayerEntity)) {
		let data = {
			delta: delta,
			edgeDrain: KinkyDungeonStatDistractionLower < KinkyDungeonStatDistractionLowerCap ? KinkyDungeonOrgasmExhaustionAmountWillful : KinkyDungeonOrgasmExhaustionAmount,
		};
		KinkyDungeonSendEvent("calcEdgeDrain", data);
		KDChangeWill("player", "edge", "tick", data.edgeDrain);
		let vibe = KinkyDungeonVibeLevel > 0 ? "Vibe" : "";
		let suff = KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage ? (KDGameData.OrgasmStage < KinkyDungeonMaxOrgasmStage / 2 ? "0" : "1") : "2";
		KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonOrgasmExhaustion" + vibe + suff), KDBaseRed, 2, true);
	}

	if (!KinkyDungeonHasWill(0.1)) {
		// Add Surrender debuff
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "NoWP",
			duration: 1,
			buffSprite: true,
			aura: KDBaseRed,
			auraSprite: "NoWP",
			type: "EvasionPenalty",
			power: 1,
			flashing: true,
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "NoWP2",
			duration: 1,
			type: "BlockPenalty",
			power: 1,
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "NoWP3",
			duration: 1,
			type: "RestraintBlockPenalty",
			power: 1,
		});
	}

	KinkyDungeonStatBlind = Math.max(0, KinkyDungeonStatBlind - delta);
	KinkyDungeonStatFreeze = Math.max(0, KinkyDungeonStatFreeze - delta);
	KinkyDungeonStatBind = Math.max(0, KinkyDungeonStatBind - delta);

	if (delta > 0) {
		//@ts-ignore
		if (KDGameData.BalancePause == true) {
			KDGameData.BalancePause = 1;
		}
		if (!KDGameData.BalancePause && !KDGameData.BalancePauseImm)
			KDChangeBalanceSrc("player", "balance", "tick", (KDGameData.KneelTurns > 0 ? 1.5 : 1.0) * KDGetBalanceRate()*delta, true);
		else {
			KDChangeBalanceSrc("player", "balance", "tick", (KDGameData.BalancePauseImm ? 0.01 : (5 / (10 + KDGameData.BalancePause)))
				* (KDGameData.KneelTurns > 0 ? 1.5 : 1.0) * KDGetBalanceRate()*delta, true);
		}
		if (KDGameData.BalancePauseImm) KDGameData.BalancePauseImm = false;
		else KDGameData.BalancePause = Math.max(0, KDGameData.BalancePause-delta);
	}

	KinkyDungeonCapStats();

	KDOrigDistraction = Math.floor(KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax * 100);
	KDOrigStamina = Math.floor(KinkyDungeonStatStamina * 10);
	KDOrigMana = Math.floor(KinkyDungeonStatMana * 10);

	KinkyDungeonCalculateMiscastChance();

	KinkyDungeonHasCrotchRope = false;
	let drains = [];


	for (let pair of KinkyDungeonAllRestraintDynamic()) {
		let item = pair.item;
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
let KDExtraEnemyTags: Record<string, any> = {};

function KDGetEnvironmentalDmg() {
	return KinkyDungeonMultiplicativeStat(-KDDamageAmpEnvironmental);
}

function KDUpdatePerksBonus() {
	KDDamageAmpPerks = 0;
	KDDamageAmpPerksMagic = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "magicDamageBuff");
	KDDamageAmpPerksMelee = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "meleeDamageBuff");
	KDDamageAmpPerksSpell = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "spellDamageBuff");
	KDDamageAmpEnvironmental = 0;
	KDExtraEnemyTags = {};
	for (let perk of KinkyDungeonStatsChoice.keys()) {
		if (KDPerkUpdateStats[perk]) KDPerkUpdateStats[perk]();
	}
	KinkyDungeonSendEvent("perksBonus", {});
}

function KinkyDungeonCalculateMiscastChance() {
	let flags = {
		miscastChance: Math.max(0, 
			KinkyDungeonStatDistractionMiscastChance * Math.min(1, 
				KinkyDungeonStatDistraction / (KinkyDungeonStatDistractionMax||1))),
		satisfiedAmount: 0.3,
	};
	if (KinkyDungeonStatsChoice.has("AbsoluteFocus")) {
		flags.miscastChance = Math.min(flags.miscastChance * 2, 1);
	}
	if (KinkyDungeonStatsChoice.get("Distracted")) flags.miscastChance += KDDistractedAmount;
	if (KDEntityBuffedStat(KDPlayer(), "MiscastChance")) flags.miscastChance += KDEntityBuffedStat(KDPlayer(), "MiscastChance");
	KinkyDungeonSendEvent("calcMiscast", flags);
	if (flags.satisfiedAmount && KDGameData.OrgasmStamina > 0.5) flags.miscastChance = Math.max(0, flags.miscastChance - flags.satisfiedAmount);
	KinkyDungeonMiscastChance = Math.max(0, flags.miscastChance || 0);
}

function KinkyDungeonGetBlindLevel() {
	let blindness = 0;
	for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
		let inv = inv2.item;
		if (KDRestraint(inv).blindfold) blindness = Math.max(Math.min(8, blindness + 1), KDRestraint(inv).blindfold);
	}
	let data = {
		player: KinkyDungeonPlayerEntity,
		blindness: blindness ? blindness*1.5 : 0,
	};
	KinkyDungeonSendEvent("calcBlind", data);
	return data.blindness;
}

function KinkyDungeonCapStats() {
	KinkyDungeonStatDistractionLower = Math.max(0, Math.min(KinkyDungeonStatDistractionLower, KinkyDungeonStatDistractionMax * KinkyDungeonStatDistractionLowerCap));
	KinkyDungeonStatDistraction = Math.max(0, Math.min(KinkyDungeonStatDistraction, KinkyDungeonStatDistractionMax));
	KinkyDungeonStatStamina = Math.max(0, Math.min(KinkyDungeonStatStamina, KinkyDungeonStatStaminaMax));
	KinkyDungeonStatMana = Math.max(0, Math.min(KinkyDungeonStatMana, KinkyDungeonStatManaMax));
	KinkyDungeonStatManaPool = Math.max(0, Math.min(KinkyDungeonStatManaPool, KinkyDungeonStatManaPoolMax));

	// Negate floating point err...
	if (KinkyDungeonStatMana > KinkyDungeonStatManaMax - 0.001) KinkyDungeonStatMana = KinkyDungeonStatManaMax;
	if (KinkyDungeonStatWill > KinkyDungeonStatWillMax - 0.001) KinkyDungeonStatWill = KinkyDungeonStatWillMax;
}

function KDIsHogtied(C?: Character): boolean {
	if (!C) C = KinkyDungeonPlayer;
	return  KDCurrentModels.get(C)?.Poses.Hogtie;
}
function KDIsKneeling(C?: any): boolean {
	if (!C) C = KinkyDungeonPlayer;
	return KDCurrentModels.get(C)?.Poses.Kneel || KDCurrentModels.get(C)?.Poses.KneelClosed;
}

function KinkyDungeonLegsBlocked() {
	if (KDIsHogtied()) return true;
	return KinkyDungeonFlags.get("BoundFeet");
}

function KinkyDungeonCanStand() {
	return !KDIsKneeling() && !KDIsHogtied() && !(KDGameData.KneelTurns > 0);
}
function KinkyDungeonCanKneel() {
	return true;
}

function KinkyDungeonCalculateHeelLevel(_delta: number, overrideKneel?: boolean): number {
	let heelpower = 0;
	if (overrideKneel || (!KDForcedToGround() && KinkyDungeonCanStand()))
		for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
			let inv = inv2.item;
			if ((KDRestraint(inv)?.heelpower)) {
				let power = KDRestraint(inv).power * KDRestraint(inv).heelpower;
				heelpower = Math.max(heelpower, power);
			}
		}
	if (heelpower && heelpower < 2) heelpower = 2;
	return Math.max(0,
		Math.pow(heelpower, 0.75)
		+ KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "HeelPower")
		+ Math.max(0, KinkyDungeonSleepiness));
}

function KinkyDungeonCalculateSlowLevel(delta?: number) {
	KinkyDungeonSlowLevel = 0;
	if (KinkyDungeonAllRestraint().some((r) => {return KDRestraint(r).immobile;})) {KinkyDungeonSlowLevel += 100;}
	else {
		for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
			let inv = inv2.item;
			if ((KDRestraint(inv).blockfeet || KDRestraint(inv).hobble || (KinkyDungeonStatsChoice.get("ClassicHeels") && KDRestraint(inv).heelpower))) {
				let hobbleAmount = KDRestraint(inv).hobble || (KinkyDungeonStatsChoice.get("ClassicHeels") ? Math.round(KDRestraint(inv).heelpower + 0.1) : 1) || 1;
				KinkyDungeonSlowLevel = Math.min(Math.max(3, hobbleAmount), KinkyDungeonSlowLevel + hobbleAmount);
			}
		}
		for (let inv2 of KinkyDungeonAllRestraintDynamic()) {
			let inv = inv2.item;
			if (KDRestraint(inv).blockfeet) {
				KinkyDungeonSlowLevel = Math.max(KinkyDungeonSlowLevel, 2);
				break;
			}
		}
		// If your hands are free you are faster
		if (!KinkyDungeonCanStand() || KDForcedToGround()) {
			KinkyDungeonSlowLevel = Math.max(KinkyDungeonIsArmsBound() ? 3 : 2, KinkyDungeonSlowLevel + 1);
			if (delta > 0 && KDForcedToGround())
				KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, delta);
		}
		if (KDIsHogtied()) KinkyDungeonSlowLevel = Math.max(KinkyDungeonIsArmsBound() ? 4 : 3, KinkyDungeonSlowLevel + 1);
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).freeze) KinkyDungeonSlowLevel = Math.max(2, KinkyDungeonSlowLevel);
		}
		if (!KinkyDungeonHasStamina(0.01)) KinkyDungeonSlowLevel = Math.max(1, KinkyDungeonSlowLevel);
	}
	if (KinkyDungeonStatsChoice.get("PoorForm") && KinkyDungeonSlowLevel > 0) KinkyDungeonSlowLevel += 1;
	let origSlowLevel = KinkyDungeonSlowLevel;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel")) KinkyDungeonSlowLevel += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevel");
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MoveSpeed")) KinkyDungeonSlowLevel = Math.max(0, KinkyDungeonSlowLevel - KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MoveSpeed"));
	KinkyDungeonSlowLevel = Math.max(0, KinkyDungeonSlowLevel);
	if (KinkyDungeonStatsChoice.get("PoorForm") && KinkyDungeonSlowLevel > 0) KinkyDungeonSlowLevel = Math.max(2, KinkyDungeonSlowLevel);

	if (KDGameData.Crouch) {
		// Force slowness when crouching
		if (KinkyDungeonSlowLevel < 2 && delta > 0 && KinkyDungeonLastAction == "Move") {
			KinkyDungeonSendActionMessage(9, TextGet("KDPetsuitCrawl"), KDBaseWhite, 1, true);
		}
		KinkyDungeonSlowLevel = Math.max(2, KinkyDungeonSlowLevel);
	}
	if (delta > 0 && KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevelEnergyDrain")) KDGameData.AncientEnergyLevel =
		Math.max(0, KDGameData.AncientEnergyLevel - Math.max(0, origSlowLevel - KinkyDungeonSlowLevel) * KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SlowLevelEnergyDrain"));

	if (KinkyDungeonSlowLevel > 9) {
		KDGameData.MovePoints = Math.min(-1, KDGameData.MovePoints);
	}
}
/**
 * Returns the total level of gagging, 1.0 or higher meaning "fully gagged" and 0.0 being able to speak.
 * @param   [AllowFlags] - Whether or not flags such as allowPotions and blockPotions should override the final result
 * @return  - The gag level, sum of all gag properties of worn restraints
 */
function KinkyDungeonGagTotal(AllowFlags?: boolean, gagMult: number = 1): number {
	if (KinkyDungeonStatsChoice.get("SmoothTalker")) gagMult = 0.8;
	let total = 0;
	let allow = false;
	let prevent = false;
	for (let rest of KinkyDungeonAllRestraintDynamic()) {
		let inv = rest.item;
		if (KDRestraint(inv).gag) total += gagMult * KDRestraint(inv).gag;
		if (KDRestraint(inv).allowPotions) allow = true;
	}
	if (AllowFlags) {
		if (prevent) return 1.00;
		else if (allow) return 0.0;
	}
	return total;
}
/**
 * Returns the total level of gagging, 1.0 or higher meaning "fully gagged" and 0.0 being able to speak.
 * @param   [AllowFlags] - Whether or not flags such as allowPotions and blockPotions should override the final result
 * @return  - The gag level, sum of all gag properties of worn restraints
 */
function KDIsGaggedFast(): boolean {
	return !!KinkyDungeonPlayerTags.get("Gagged");
}

function KinkyDungeonCanTalk(Loose?: boolean): boolean {
	for (let inv of KinkyDungeonAllRestraint()) {
		if ((Loose ? KinkyDungeonGagTotal() >= 0.99 : KDRestraint(inv).gag)) return false;
	}
	return true;
}

function KinkyDungeonCalculateSubmissiveMult() {
	let base = 0;
	for (let item of KinkyDungeonAllRestraint()) {
		if (item.type == Restraint) {
			let power = Math.sqrt(Math.max(0, KinkyDungeonGetLockMult(item.lock, item) * KDRestraint(item).power));
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
	return (KinkyDungeonStatDistraction > KinkyDungeonDistractionSleepDeprivationThreshold * KinkyDungeonStatDistractionMax || KDGameData.OrgasmStamina > 0.5) && KinkyDungeonHasStamina(-KDGetOrgasmCost());
}

function KinkyDungeonCanTryOrgasm() {
	if (!KinkyDungeonStatsChoice.get("arousalMode")) return false;
	let data = {
		player: KinkyDungeonPlayerEntity,
		threshold: KinkyDungeonStatDistractionMax - 0.01,
		satisfiedthreshold: KinkyDungeonStatDistractionMax * 0.5,
	};
	KinkyDungeonSendEvent("calcOrgThresh", data);
	return KinkyDungeonStatDistraction >= data.threshold && (KinkyDungeonHasStamina(-KDGetOrgasmCost()) || KDGameData.OrgasmStage > 3) && (KDGameData.OrgasmStamina < 1 || KinkyDungeonStatDistraction > data.satisfiedthreshold);
}

function KDGetOrgasmCost() {
	return Math.max(KinkyDungeonOrgasmCost, -KinkyDungeonOrgasmCostPercent * KinkyDungeonStatStamina);
}

/**
 * @param [tease] - The teasing power
 */
function KDGetPlaySelfPower(tease?: number): {orig: number, final: number}  {
	let OrigAmount = Math.max(
		tease ? Math.min(KinkyDungeonPlayWithSelfPowerMax, tease) : 0,
		KinkyDungeonPlayWithSelfPowerMin + (KinkyDungeonPlayWithSelfPowerMax - KinkyDungeonPlayWithSelfPowerMin)*KDRandom());
	let amount = Math.max(0, OrigAmount - KinkyDungeonChastityMult() * KinkyDungeonPlayWithSelfChastityPenalty);

	return {orig: OrigAmount, final: amount};
}

function KinkyDungeonDoPlayWithSelf(tease?: number): number {
	let affinity = KinkyDungeonGetAffinity(false, "Edge");
	let power = KDGetPlaySelfPower(tease);
	let OrigAmount = power.orig;
	let amount = power.final;
	let bound = KinkyDungeonIsArmsBound();
	if (bound && !affinity) amount = Math.max(0, Math.min(amount, OrigAmount - KinkyDungeonPlayWithSelfBoundPenalty));
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfBonus) amount += KinkyDungeonPlayerDamage.playSelfBonus;
	if (affinity) amount += 1;

	let data = {
		player: KinkyDungeonPlayerEntity,
		amount: amount,
		cost: KinkyDungeonPlayCost,
		bound: bound,
		playTime: 3,
		playSound: true,
		playMsg: true,
		affinity: affinity,
		OrigAmount: OrigAmount,
		power: power,
		alertRadius: 4.5 - 4*Math.min(1, KinkyDungeonGagTotal()),
		distractionCooldown: Math.max(KDGameData.DistractionCooldown, 13),
	};

	KinkyDungeonSendEvent("playSelf", data);

	//KinkyDungeonAlert = Math.max(KinkyDungeonAlert || 0, data.alertRadius); // Alerts nearby enemies because of your moaning~

	KinkyDungeonMakeNoise(data.alertRadius, KDPlayer().x, KDPlayer().y);

	KDChangeDistraction("player", "playSelf", "playSelf", Math.sqrt(Math.max(0, data.amount * KinkyDungeonPlayWithSelfMult)) * KinkyDungeonStatDistractionMax/KDMaxStatStart, false, 0.12);
	KDChangeStamina("player", "playSelf", "playSelf", data.cost, true, 3);
	if (data.playSound) {
		if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfSound) KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + KinkyDungeonPlayerDamage.playSelfSound + ".ogg");
	}
	if (data.playMsg) {
		if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.playSelfMsg) {
			KinkyDungeonSendActionMessage(10, TextGet(KinkyDungeonPlayerDamage.playSelfMsg), "#FF5BE9", 4);
		} else if (KinkyDungeonIsArmsBound()) {
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPlaySelfBound"), "#FF5BE9", 4);
		} else if (KinkyDungeonChastityMult() > 0.9) {
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChastityDeny"), "#FF5BE9", 4);
		} else KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPlaySelf"), "#FF5BE9", 4);
		if (affinity)
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonPlayCorner"), "#9bd45d", 4);
	}
	KDGameData.PlaySelfTurns = data.playTime;
	KinkyDungeonSetFlag("PlayWithSelf", KDGameData.PlaySelfTurns + 3);
	KDGameData.DistractionCooldown = data.distractionCooldown;

	return amount;
}

/** Percentage of vibe level that is turned into playSelfPower to try to have an orgasm*/
let KinkyDungeonOrgasmVibeLevelPlayPowerMult = 1.0;
let KinkyDungeonOrgasmChanceBase = -0.1;
let KinkyDungeonOrgasmChanceScaling = 1.45;
//let KinkyDungeonOrgasmChanceScalingDesire = 0.5;
let KinkyDungeonMaxOrgasmStage = 7;
let KinkyDungeonOrgasmStageVariation = 4; // determines the text message variation

/** Threshold at which the player can play with herself */
let KinkyDungeonDistractionSleepDeprivationThreshold = 0.001;
/** Threshold at which the player will automatically play with herself if able*/
let KinkyDungeonDistractionPlaySelfThreshold = 0.9;
let KinkyDungeonPlaySelfOrgasmThreshold = 3; // Note that it is impossible if you have a belt on, but possible if you only have a bra on

let KinkyDungeonOrgasmTurnsMax = 10;
let KinkyDungeonOrgasmTurnsCrave = 8;
let KinkyDungeonPlayWithSelfPowerMin = 4.5;
let KinkyDungeonPlayWithSelfPowerMax = 5.5;
let KDDesireScalingOrgasmPower = 0.5;
let KinkyDungeonPlayWithSelfPowerVibeWand = 4;
let KinkyDungeonPlayWithSelfChastityPenalty = 4.5;
let KinkyDungeonPlayWithSelfBoundPenalty = 2.0;
let KinkyDungeonOrgasmExhaustionAmount = -0.02;
let KinkyDungeonOrgasmExhaustionAmountWillful = -0.005;

let KDOrgasmStageTimerMax = 10; // Turns for orgasm stage timer to progress naturally
let KDWillpowerInvolChanceMult = 0.1; // Chance for the event to happen
let KDInvolChanceBase = -0.2;
let KDPassionInvolChanceMult = 0.6;


let KDWillpowerMultiplier = 0.5;

let KinkyDungeonOrgasmCost = -8;
let KinkyDungeonOrgasmCostPercent = 0.7;
let KinkyDungeonOrgasmWillpowerCost = -2.5;
let KinkyDungeonEdgeCost = -1;
let KinkyDungeonEdgeWillpowerCost = -0.1;
let KinkyDungeonPlayCost = -0.1;

let KinkyDungeonOrgasmStunTime = 4;
let KinkyDungeonPlayWithSelfMult = 0.5;

function KDGetPlaySelfThreshold() {
	return KinkyDungeonDistractionPlaySelfThreshold - 0.01 * (
		0.4 * (KinkyDungeonGoddessRep.Passion + 50) + 0.9*(KinkyDungeonGoddessRep.Frustration + 50)
	);
}

/**
 * Try to let go...
 * @param [Bonus]
 * @param [Auto] - whether this was automatically triggered or not. 0 = manual, 1 = forced by enemy/vibe, 2 - player character can't resist
 */
function KinkyDungeonDoTryOrgasm(Bonus?: number, Auto?: number) {
	let chance = KinkyDungeonOrgasmChanceBase
		+ KinkyDungeonOrgasmVibeLevel * 0.1
		+ KinkyDungeonOrgasmChanceScaling*(KDGameData.OrgasmTurns/KinkyDungeonOrgasmTurnsMax)
		* (KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax);
	let denied = KinkyDungeonVibratorsDeny(chance);

	let amount = denied ? 0 : KinkyDungeonOrgasmVibeLevel * KinkyDungeonOrgasmVibeLevelPlayPowerMult;
	amount += KDDesireScalingOrgasmPower*(KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax);
	let playSelfAmount = Bonus != undefined ? Bonus : KinkyDungeonDoPlayWithSelf();
	//if (playSelfAmount > KinkyDungeonOrgasmVibeLevel) {
	//console.log(`${playSelfAmount} + ${amount}`);
	amount += playSelfAmount;
	//}
	let msg = "KinkyDungeonOrgasm";
	let msgTime = KinkyDungeonOrgasmStunTime+10;
	


	let data = {
		auto: Auto,
		player: KinkyDungeonPlayerEntity,
		playSelfAmount: Bonus != undefined ? 0 : playSelfAmount,
		bonus: Bonus || 0,
		eventBonus: 0,
		eventMult: 1,
		amount: amount,
		chance: chance,
		denied: denied,
		Bonus: Bonus,
		edgespcost: KinkyDungeonEdgeCost,
		edgewpcost: KinkyDungeonEdgeWillpowerCost * (1 + KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax),
		spcost: KDGetOrgasmCost(),
		wpcost: KinkyDungeonOrgasmWillpowerCost * (1 + KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax),
		stunTime: Math.round(KinkyDungeonOrgasmStunTime * (1 + KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax)),
		playSound: true,
		playMsg: true,
		alertRadius: Math.round(4 * (1 + 1.5*KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax)),
		satisfaction: Math.max(0.1, KinkyDungeonStatDistractionLower * 1.75),
		distractionCooldown: Math.max(KDGameData.DistractionCooldown, 13),
		cancelOrgasm: false,
		denialChangeFactor: KDDenialChangeFactor,
		lowerFloorTo: Math.max(0,
			KinkyDungeonStatDistractionLower
			* (1
				- 0.75 * Math.max(0.01, KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax)**2
				- 0.2 * KDGameData.OrgasmStage/KinkyDungeonMaxOrgasmStage)
			- KinkyDungeonStatDistractionMax*0.2 * Math.max(0.01, KinkyDungeonStatDistractionLower/KinkyDungeonStatDistractionLowerCap / KinkyDungeonStatDistractionMax))**1.5,
	};

	KinkyDungeonSendEvent("tryOrgasm", data);

	if (data.denialChangeFactor) {
		let amt = KDEntityGetBuff(KDPlayer(), "Denial")?.power || 0;
		amt *= data.denialChangeFactor;
		if (amt) {
			KDAddDenial(KDPlayer(), amt);
		}
	}

	data.amount += data.eventBonus;
	data.amount *= data.eventMult;

	if (data.cancelOrgasm) return;
	if (data.amount > KinkyDungeonPlaySelfOrgasmThreshold
			* KDDenialFactorBase / Math.max(0, KDGetDenialLevel(KDPlayer()))
		&& KDRandom() < data.chance && !KinkyDungeonFlags.get("nogasm")) {
		// You finally shudder and tremble as a wave of pleasure washes over you...
		KinkyDungeonStatBlind = data.stunTime + 2;
		//KinkyDungeonOrgasmStunTime = 4;
		KinkyDungeonSetFlag("OrgSuccess", data.stunTime + 3);
		KinkyDungeonSetFlag("OrgAfterglow", data.stunTime + 3 + KDOrgAfterglowTime);

		KinkyDungeonSetFlag("PlayerOrgasm", data.stunTime);
		KinkyDungeonSetFlag("nogasm", data.stunTime + Math.floor(KDRandom() * 3));
		KinkyDungeonSetFlag("PlayerOrgasmFilter", data.stunTime + 1);
		KDGameData.OrgasmStamina = data.satisfaction;
		KDChangeStamina(data.auto ? "auto" : "player", "orgasm", "tryOrgasm", data.spcost);
		KDChangeWill(data.auto ? "auto" : "player", "orgasm", "tryOrgasm", data.wpcost);
		KinkyDungeonStatDistractionLower = data.lowerFloorTo;
		KinkyDungeonAlert = Math.max(KinkyDungeonAlert || 0, data.alertRadius); // Alerts nearby enemies because of your moaning~
		KDGameData.PlaySelfTurns = data.stunTime;
		// Balance
		KDChangeBalanceSrc(data.auto ? "auto" : "player", "orgasm", "tryOrgasm", (KDBaseBalanceDmgLevel + KDGameData.HeelPowerEffective) / KDBaseBalanceDmgLevel * 0.5*-KDBalanceDmgMult() * 4*KDFitnessMult(), true, true);
		KinkyDungeonSendEvent("orgasm", data);

		KDAddDenial(KDPlayer(), KDDenialFromOrgasm);

	} else {
		KDChangeStamina(data.auto ? "auto" : "player", "edge", "tryOrgasm", data.edgespcost);
		KDChangeWill(data.auto ? "auto" : "player", "edge", "tryOrgasm", data.edgewpcost);
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
		if (denied && KinkyDungeonVibeLevel > 0) {
			msg = "KinkyDungeonDeny";
			KinkyDungeonSetFlag("OrgDenied", KDGameData.PlaySelfTurns + 3);
			KDChangeDistraction(data.auto ? "auto" : "player", "deny", "tryOrgasm", -KinkyDungeonStatDistraction);
			KinkyDungeonSendEvent("deny", data);
			KDAddDenial(KDPlayer(), KDDenialFromDeny);
		} else {
			msg = "KinkyDungeonEdge";
			KinkyDungeonSetFlag("OrgEdged", KDGameData.PlaySelfTurns + 3);
			KinkyDungeonSendEvent("edge", data);
			KDAddDenial(KDPlayer(), KDDenialFromEdge);
		}
	}

	if (data.playMsg) {
		let msgIndex = Math.min(KinkyDungeonMaxOrgasmStage, KDGameData.OrgasmStage) + Math.floor(Math.random() * KinkyDungeonOrgasmStageVariation);
		KinkyDungeonSendActionMessage(10, TextGet(msg + ("" + msgIndex)), "#FF5BE9", msgTime);
	}

}

function KinkyDungeonIsChaste(Breast: boolean): boolean {
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		if ((!Breast && KDRestraint(inv.item).chastity) || (Breast && KDRestraint(inv.item).chastitybra)) return true;
	}
}

function KinkyDungeonChastityMult(): number {
	let chaste = 0.0;
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		if (KDRestraint(inv.item).chastity) chaste += 1;
		else if (KDRestraint(inv.item).chastitybra) chaste += 0.2;
	}
	return chaste;
}

/**
 * @param buffs
 * @param type
 */
function KDBuffResist(buffs: any, type: string): number {
	if (KDDamageEquivalencies[type]) type = KDDamageEquivalencies[type];
	return KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(buffs, type + "DamageResist"))
		* (KinkyDungeonMeleeDamageTypes.includes(type) ?
		KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(buffs, "meleeDamageResist"))
		: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(buffs, "magicDamageResist")));
}

/**
 * @param player
 */
function KDIsEdged(_player: entity): boolean {
	return KDGameData.OrgasmTurns > KinkyDungeonOrgasmTurnsCrave && !(KDGameData.OrgasmStamina > 0);
}


function KDForcedToGround() {
	return (KinkyDungeonPlayerTags.get("ForceKneel") || KinkyDungeonPlayerTags.get("ForceHogtie") || KinkyDungeonPlayerTags.get("Hogties"));
}
function KDBalanceDmgMult() {
	let mult = KinkyDungeonStatsChoice.get("PoorBalance") ? 1.5 : 1;
	return mult * KinkyDungeonMultiplicativeStat(-KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BalanceDamageMult"));
}
function KDFitnessMult(_player?: any): number {
	let mult = 0.5/KinkyDungeonStatWillMax + 0.5/KinkyDungeonStatStaminaMax;
	return mult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "FitnessMult"));
}
function KDMentalMult(_player: entity) {
	let mult = 0.5/KinkyDungeonStatDistractionMax + 0.5/KinkyDungeonStatManaMax;
	return mult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MentalMult"));
}
function KDEnduranceMult(_player: entity) {
	let mult = 0.5/KinkyDungeonStatWillMax + 0.5/KinkyDungeonStatDistractionMax;
	return mult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "EnduranceMult"));
}
function KDReflexMult(_player: entity) {
	let mult = 0.5/KinkyDungeonStatStaminaMax + 0.5/KinkyDungeonStatDistractionMax;
	return mult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ReflexMult"));
}
function KDPowerMult(_player: entity) {
	let mult = 0.5/KinkyDungeonStatWillMax + 0.5/KinkyDungeonStatManaMax;
	return mult * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "PowerMult"));
}

/**
 * @param player
 */
function KDIsBlindfolded(_player: entity): boolean {
	return !!(KinkyDungeonPlayerTags.get("Blindfolds") || KinkyDungeonPlayerTags.get("Masks") || KinkyDungeonPlayerTags.get("Hoods") || KinkyDungeonPlayerTags.get("BlockEyes"));
}


/**
 * @param player
 */
function KDCanHack(_player: entity): boolean {
	return !!(KinkyDungeonPlayerTags.get("Cyberjack"));
}


function KDGetInertia(player: entity): number {
	let data = {
		player: player,
		inertia: KDEntityBuffedStat(player, "Inertia"),
		base: player.player ? (
			KinkyDungeonStatsChoice.get("DirectionSlow2") ? 2 : (
				KinkyDungeonStatsChoice.get("DirectionSlow") ? 1 : 0
			)
		) : 0,
	};

	KinkyDungeonSendEvent("inertia", data);

	data.base += data.inertia
	return data.base;
}

interface KDKneelData {
	baseRate: number,
	kneelRate: number,
	delta: number,
	msg: boolean,
	minKneel: number,
}

function KDIsGrounded() {
	return KinkyDungeonStatsChoice.get("Grounded") && (KinkyDungeonIsArmsBound() && KinkyDungeonLegsBlocked());
}

function KDGetKneelStats(delta: number, msg: boolean): KDKneelData {
	let data: KDKneelData = {
		baseRate: KinkyDungeonStatsChoice.get("PoorBalance") ? 0.5 : 1,
		kneelRate: 1,
		minKneel: 0,
		delta: delta,
		msg: msg,
	};
	KinkyDungeonSendEvent("beforeKneelRate", data);

	data.kneelRate = data.baseRate * (KinkyDungeonIsArmsBound() ? 0.85 : 1);

	if (KinkyDungeonSlowLevel > 2) data.kneelRate *= 0.85;
	let restriction = KDGameData.Restriction || 0;
	if (restriction) {
		data.kneelRate *= 10 / (10 + restriction);
	}


	if (KDIsGrounded()) {
		data.minKneel = 1;
	}

	if (KDGameData.KneelTurns > 0 && !KDForcedToGround() && !KDGameData.Crouch && (data.kneelRate < data.baseRate || data.minKneel > 0)) {

		if (KinkyDungeonHasHelp()) {
			data.kneelRate = data.baseRate;
			if (data.minKneel > 0) {
				data.minKneel = 0;
			}
			if (msg)
				KinkyDungeonSendTextMessage(4, TextGet("KDGetUpAlly"), KDBaseWhite,1, !(KDGameData.KneelTurns <= delta*data.kneelRate));

		} else if (KinkyDungeonStatsChoice.get("Grounded") && KinkyDungeonGetAffinity(false, "Corner", undefined, undefined)) {
			data.minKneel = 0;
			data.kneelRate = Math.min(data.baseRate * 1.4, data.kneelRate + 0.2);
			if (msg)
				KinkyDungeonSendTextMessage(4, TextGet("KDGetUpCorner"), KDBaseWhite,1, !(KDGameData.KneelTurns <= delta*data.kneelRate));
		} else if (KinkyDungeonStatsChoice.get("Grounded") && KinkyDungeonGetAffinity(false, "Wall", undefined, undefined)) {
			data.minKneel = 0;
			data.kneelRate *= 0.65;
			//if (KDGameData.KneelTurns <= kneelRate) {
				if (msg)
					KinkyDungeonSendTextMessage(4, TextGet("KDGetUpWall"), KDBaseWhite,1, !(KDGameData.KneelTurns <= delta*data.kneelRate));
			//}
		}

		if (msg) {
			if (data.minKneel > 0) {
				KinkyDungeonSendActionMessage(1, TextGet("KDKneelCannot"), KDBaseOrange,1, true);
			} else if (data.kneelRate < 1) {
				KinkyDungeonSendTextMessage(4, TextGet("KDKneelSlow"), KDBaseWhite,1, true);
			}
		}

	}

	KinkyDungeonSendEvent("afterKneelRate", data);

	return data;
}

interface KDDenialData {
	entity: entity,
	base: number,
	mult: number,
	bonus: number,
}

function KDGetDenialLevel(entity: entity) {
	let data: KDDenialData = {
		entity: entity,
		base: KDDenialFactorBase,
		mult: KinkyDungeonMultiplicativeStat(-KDEntityBuffedStat(entity, "DenialMult")),
		bonus: KDEntityBuffedStat(entity, "DenialBonus"),
	};

	KinkyDungeonSendEvent("beforeCalcDenialLevel", data);
	KinkyDungeonSendEvent("calcDenialLevel", data);
	KinkyDungeonSendEvent("afterCalcDenialLevel", data);

	return (data.base + data.bonus) * data.mult;
}

let KDDenialDuration = 10;
let KDDenialFactorBase = 100;
let KDDenialFromDeny = 25;
let KDDenialFromOrgasm = -100;
let KDDenialFromEdge = 5;
let KDDenialChangeFactor = -0.05;

function KDAddDenial(entity: entity, amount: number) {
	let buff = KDEntityGetBuff(entity, "Denial");
	let power = (buff?.power || 0) + amount;
	if (power > 0) {
		if (buff) buff.power = power;
		else KinkyDungeonApplyBuffToEntity(entity, {
			id: "Denial",
			type: "DenialBonus",
			hide: true,
			power: power,
			resetDurationTime: KDDenialDuration,
			resetDurationPower: 1,
			duration: KDDenialDuration,
		});
	} else if (buff) {
		KinkyDungeonExpireBuff(entity, "Denial");
	}
	
}

function KDPauseBalance(turns: number) {
	KDGameData.BalancePause = Math.max((KDGameData.BalancePause || 0), turns);
	KDGameData.BalancePauseImm = true;
}