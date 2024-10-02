"use strict";

let KDDoorKnobChance = 0.1; // Chance to open door with mitts and arms bound
let KDDoorKnobChanceArms = 0.5; // Chance to open door with mitts but no arm bindings
let KDDoorAttractChance = 0.25; // Chance to attract someone by banging
let KDDoorAttractChanceArms = 0.1; // Chance to attract someone by rattling

/** These weapons can get removed if you start the game with them*/
let kdStartWeapons = ["Knife", "Dirk", "Sword", "Shield"];

let KDPerkParams = {
	KDEnemyDamageMult: 2.5, // Increase in enemy damage effect
	KDEnemyResistBuff: 0.85, // Buff to tease damage
	KDEnemyArmorBoost: 2.0, // Extra armor enemies get
};

let KDCategoriesStart = [
	{name: "Toggles", buffs: [], debuffs: [],},
	{name: "Toggles2", buffs: [], debuffs: [],},
	{name: "Multiclass", buffs: [], debuffs: [],},
	{name: "Major", buffs: [], debuffs: [],},
	{name: "Restraints", buffs: [], debuffs: [],},
	{name: "Restriction", buffs: [], debuffs: [],},
	{name: "Senses", buffs: [], debuffs: [],},
	{name: "Training", buffs: [], debuffs: [],},
	{name: "Kinky", buffs: [], debuffs: [],},
	{name: "Damage", buffs: [], debuffs: [],},
	{name: "Combat", buffs: [], debuffs: [],},
	{name: "Magic", buffs: [], debuffs: [],},
	//{name: "Components", buffs: [], debuffs: [],},
	{name: "Enemies", buffs: [], debuffs: [],},
	{name: "Common", buffs: [], debuffs: [],},
	{name: "Map", buffs: [], debuffs: [],},
	{name: "Start", buffs: [], debuffs: [],},
	{name: "Boss", buffs: [], debuffs: [],},
];

let KDKinkyPerks = [
	"Doorknobs",
	"Grounded",
	"CantTouchThat",
	"Nowhere",
	"TightRestraints",
	"MagicHands",
	"HighSecurity",
	"MoreKinkyFurniture",
	"NoHelp",
	"ExclusionsApply",
	"Blackout",
	"SelfBondage",
	"Rigger",
	"NovicePet",
	"EnemyResist",
	"CommonToyPleasure",
	"CommonToyEdge",
	"CommonToyDeny",
	"CommonToyTease",
	"BondageLover",
	"Flexible",
];

let KDPerkIcons = {
	"Pacifist" : () => {return true;},
	"BerserkerRage" : () => {return true;},
	"BoundPower" : () => {return true;},
	"UnstableMagic" : () => {return true;},
	"BurningDesire" : () => {return true;},
	"FrigidPersonality" : () => {return true;},
	"ImmovableObject" : () => {return KinkyDungeonStatWill >= KinkyDungeonStatWillMax * 0.90;},
	"GroundedInReality" : () => {return KinkyDungeonPlayerDamage && KinkyDungeonStatMana >= KinkyDungeonStatManaMax * 0.999;},
	"LikeTheWind" : () => {return KinkyDungeonStatStamina >= KinkyDungeonStatStaminaMax * 0.95;},
	"LeastResistance" : () => {return KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.01;},
	//"DistractionCast" : () => {return KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax * 0.99;},
};

let KDPerkUpdateStats = {
	"Rigger": () => {
		/*KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger1",
			type: "glueDamageBuff",
			power: KDRiggerDmgBoost,
			duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger2",
			type: "chainDamageBuff",
			power: KDRiggerDmgBoost,
			duration: 2
		});*/
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Rigger3",
			type: "BindAmp",
			power: KDRiggerBindBoost,
			duration: 2
		});
	},
	"Ticklish": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Ticklish", type: "tickleDamageResist", power: -0.5, duration: 2
		});
	},
	"Stoic": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Stoic", type: "tickleDamageResist", power: 0.82, duration: 2
		});
	},
	"Lascivious": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Lascivious", type: "gropeDamageResist", power: -0.5, duration: 2
		});
	},
	"Unperturbed": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "Unperturbed", type: "gropeDamageResist", power: 0.82, duration: 2
		});
	},
	"PainTolerance": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "PainTolerance", type: "painDamageResist", power: 2.0, duration: 2
		});
	},
	"Sticky": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "StickySituation", type: "glueDamageResist", power: -0.4, duration: 2
		});
	},
	"EnemyResist": () => {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist", type: "TeaseBuff", power: KDPerkParams.KDEnemyResistBuff, duration: 2
		});
		/*KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist1", type: "soulDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist2", type: "tickleDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist3", type: "painDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist4", type: "gropeDamageBuff", power: KDEnemyResistBuff, duration: 2
		});
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
			id: "EnemyResist5", type: "charmDamageBuff", power: KDEnemyResistBuff, duration: 2
		});*/
	},
	"BoundPower": () => {
		KDDamageAmpPerks += KDBoundPowerLevel *  KDBoundPowerMult;
	},
	"BerserkerRage": () => {
		KDDamageAmpPerksMelee += KDBerserkerAmp * KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax;
	},
	"Dodge": () => {
		if (KinkyDungeonMiscastChance < 0.001) {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
				id: "FocusedDodge", type: "Evasion", power: 0.4, duration: 1, sfxApply: "Fwoosh"
			});
		}
	},
	"StartShadow": () =>{
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity,
			{
				id: "Cursed", type: "Cursed", power: 10, duration: 9999, infinite: true,aura: "#4488ff",aurasprite: "Null",
				events: [
					{type: "Cursed", trigger: "tick", count: 1},
				]});
	},
	"UnstableMagic": () => {
		KDDamageAmpPerksSpell += KDUnstableAmp * Math.min(1, Math.max(KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax, KinkyDungeonMiscastChance));
	},

	"CommonLatex": () => {
		KDExtraEnemyTags.latexRestraints = 0;
		KDExtraEnemyTags.latexRestraintsHeavy = 5;
	},
	"CommonLeather": () => {
		KDExtraEnemyTags.leatherRestraints = 0;
		KDExtraEnemyTags.leatherRestraintsHeavy = 5;
	},
	"CommonMaid": () => {
		KDExtraEnemyTags.maidRestraints = 0;
		KDExtraEnemyTags.maidVibeRestraintsLimited = 0;
	},
	"CommonWolf": () => {
		KDExtraEnemyTags.wolfRestraints = 0;
		KDExtraEnemyTags.wolfCuffs = 3;
		KDExtraEnemyTags.wolfGear = 0;
	},
	"CommonDress": () => {
		KDExtraEnemyTags.dressRestraints = 0;
	},
	"CommonFuuka": () => {
		KDExtraEnemyTags.mikoRestraints = 0;
	},
	"CommonWarden": () => {
		KDExtraEnemyTags.wardenCuffs = 0;
	},
	"CommonCyber": () => {
		KDExtraEnemyTags.cyberdollrestraints = 0;
		KDExtraEnemyTags.cyberdollchastity = 5;
		KDExtraEnemyTags.cyberdollheavy = 10;
	},
	"CommonExp": () => {
		KDExtraEnemyTags.expRestraints = 0;
	},
	"CommonKitty": () => {
		KDExtraEnemyTags.kittyRestraints = 0;
	},
	"CommonToyPleasure": () => {
		KDExtraEnemyTags.toyPleasure = 0;
		KDExtraEnemyTags.toyPleasureMid = 5;
		KDExtraEnemyTags.toyPleasureIntense = 10;
	},
	"CommonToyEdge": () => {
		KDExtraEnemyTags.toyEdge = 0;
		KDExtraEnemyTags.toyEdgeMid = 5;
		KDExtraEnemyTags.toyEdgeIntense = 10;
	},
	"CommonToyDeny": () => {
		KDExtraEnemyTags.toyDeny = 0;
		KDExtraEnemyTags.toyDenyMid = 5;
		KDExtraEnemyTags.toyDenyIntense = 10;
	},
	"CommonToyTease": () => {
		KDExtraEnemyTags.toyTease = 0;
		KDExtraEnemyTags.toyTeaseMid = 5;
		KDExtraEnemyTags.toyTeaseIntense = 10;
	},
};

let KDPerkCount: Record<string, () => string> = {
	"BerserkerRage": () => {
		return " "
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.25 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.5 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.75 ? "! " : "");
	},
	"UnstableMagic": () => {
		return " "
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.25 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.5 ? "! " : "")
			+ (KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax > 0.75 ? "! " : "");
	},
	"BoundPower": () => {
		return KDBoundPowerLevel > 0 ? Math.round(KDBoundPowerLevel * 100) + "%" : "";
	},
};

let KinkyDungeonStatsPresets: Record<string, KDPerk> = {
	"MC_Fighter":  {category: "Multiclass", id: "MC_Fighter", debuff: true, cost: 2, blockclass: ["Fighter"], tags: ["start", "mc"]},
	"MC_Rogue":  {category: "Multiclass", id: "MC_Rogue", cost: 2, blockclass: ["Rogue"], tags: ["start", "mc"]},
	"MC_Wizard":  {category: "Multiclass", id: "MC_Wizard", debuff: true, cost: 2, blockclass: ["Mage"], tags: ["start", "mc"]},
	"MC_Peasant":  {category: "Multiclass", id: "MC_Peasant", debuff: true, cost: 1, blockclass: ["Peasant"], tags: ["start", "mc"]},
	"MC_Trainee":  {category: "Multiclass", id: "MC_Trainee", cost: 2, requireArousal: true, blockclass: ["Trainee"], tags: ["start", "mc"]},


	"More_Armbinders":  {category: "Toggles", id: "More_Armbinders", cost: 0, block: ["Less_Armbinders"]},
	"More_Jackets":  {category: "Toggles", id: "More_Jackets", cost: 0, block: ["Less_Jackets"]},
	"More_Boxbinders":  {category: "Toggles", id: "More_Boxbinders", cost: 0, block: ["Less_Boxbinders"]},
	"More_Yokes":  {category: "Toggles", id: "More_Yokes", cost: 0, block: ["Less_Yokes"]},

	"Less_Armbinders":  {category: "Toggles", id: "Less_Armbinders", cost: 0, block: ["More_Armbinders"], debuff: true,},
	"Less_Jackets":  {category: "Toggles", id: "Less_Jackets", cost: 0, block: ["More_Jackets"], debuff: true,},
	"Less_Boxbinders":  {category: "Toggles", id: "Less_Boxbinders", cost: 0, block: ["More_Boxbinders"], debuff: true,},
	"Less_Yokes":  {category: "Toggles", id: "Less_Yokes", cost: 0, block: ["More_Yokes"], debuff: true,},

	"NovicePet":  {category: "Major", id: "NovicePet", cost: 1},
	"Fortify_Barricade":  {category: "Major", id: "Fortify_Barricade", cost: -2},
	"Fortify_Trap":  {category: "Enemies", id: "Fortify_Trap", cost: -1},
	"CurseSeeker":  {category: "Major", id: "CurseSeeker", cost: -3},
	"DirectionVision":  {category: "Major", id: "DirectionVision", cost: -2},
	"DirectionSlow":  {category: "Major", id: "DirectionSlow", cost: -1, block: ["DirectionSlow2"]},
	"DirectionSlow2":  {category: "Major", id: "DirectionSlow2", cost: -2, block: ["DirectionSlow"]},
	"FutileStruggles":  {category: "Restraints", id: "FutileStruggles", cost: -1},
	"SecondWind":  {category: "Restraints", id: "SecondWind", cost: 1},

	"Stranger": {startPriority: 1000, category: "Enemies", id: "Stranger", cost: 0, block: ["Bandit", "WrongNeighborhood"], tags: ["start"]},
	"Bandit": {startPriority: 1000, category: "Enemies", id: "Bandit", cost: 0, block: ["Stranger", "WrongNeighborhood"], tags: ["start"]},
	"WrongNeighborhood": {startPriority: 1000, category: "Major", id: "WrongNeighborhood", cost: -1, block: ["Bandit", "Stranger"], tags: ["start"]},

	"Strong": {category: "Restraints", id: 0, cost: 2, block: ["Weak"]},
	"Weak": {category: "Restraints", id: 1, cost: -1, block: ["Strong"]},
	"Flexible": {category: "Restraints", id: 2, cost: 2, block: ["Inflexible"]},
	"Inflexible": {category: "Restraints", id: 3, cost: -1, block: ["Flexible"]},
	"Locksmith": {category: "Restraints", id: 4, cost: 2, block: ["Clueless"]},
	"Clueless": {category: "Restraints", id: 5, cost: -1, block: ["Locksmith"]},
	"HighSecurity": {category: "Restraints", id: 48, cost: -1},
	//"SearchParty": {category: "Enemies", id: 51, cost: -1},
	"NoWayOut": {category: "Restraints", id: 52, cost: -1},
	"TightRestraints": {category: "Restraints", id: 54, cost: -1},
	"KinkyPrison":  {category: "Restraints", id: "KinkyPrison", cost: -1},
	"MagicHands": {category: "Restraints", id: "MagicHands", cost: -1},
	"KeepOutfit":  {category: "Restraints", id: "KeepOutfit", cost: 0},
	"CursedLocks": {category: "Restraints", id: "CursedLocks", cost: -1},
	"FranticStruggle": {category: "Restraints", id: "FranticStruggle", cost: 1},
	"Unchained": {category: "Kinky", id: 26, cost: 2, block: ["Damsel"]},
	"Damsel": {category: "Kinky", id: 27, cost: -1, block: ["Unchained"]},
	"Artist": {category: "Kinky", id: 28, cost: 2, block: ["Bunny"]},
	"Bunny": {category: "Kinky", id: 29, cost: -1, block: ["Artist"]},
	"Slippery": {category: "Kinky", id: 30, cost: 2, block: ["Doll"]},
	"Doll": {category: "Kinky", id: 31, cost: -1, block: ["Slippery"]},
	"Escapee": {category: "Kinky", id: 32, cost: 2, block: ["Dragon"]},
	"Dragon": {category: "Kinky", id: 33, cost: -1, block: ["Escapee"]},
	"Dodge": {category: "Combat", id: 18, cost: 3, block: ["Distracted"]},
	"Distracted": {category: "Combat", id: 19, cost: -1, block: ["Dodge"]},
	"Submissive": {startPriority: 0, category: "Kinky", id: 10, cost: 0},
	"Wanted": {category: "Kinky", id: 11, cost: -1},
	"QuickDraw": {category: "Combat", id: 55, cost: 1, block: ["Disorganized"]},
	"Disorganized": {category: "Combat", id: 57, cost: -2, block: ["QuickDraw", "QuickScribe"]},
	"Brawler": {category: "Combat", id: 20, cost: 1, block: ["UnarmedSuck"]},
	"UnarmedSuck": {category: "Combat", id: "UnarmedSuck", cost: -1, block: ["Brawler"]},
	"UnarmedGrope": {category: "Combat", id: "UnarmedGrope", cost: 0, tags: ["unarmedreplace"], blocktags: ["unarmedreplace"]},
	"UnarmedPain": {category: "Combat", id: "UnarmedPain", cost: 0, tags: ["unarmedreplace"], blocktags: ["unarmedreplace"]},
	"UnarmedTickle": {category: "Combat", id: "UnarmedTickle", cost: 0, tags: ["unarmedreplace"], blocktags: ["unarmedreplace"]},
	"Clumsy": {category: "Combat", id: 21, cost: -1},

	//"Slayer": {category: "Magic", id: 34, cost: 3},
	//"Magician": {category: "Magic", id: 36, cost: 3},
	//"Conjurer": {category: "Magic", id: 35, cost: 3},

	"Unfocused": {category: "Combat", id: "Unfocused", cost: -2},
	"BondageLover": {category: "Kinky", id: 15, cost: -1},
	"Undeniable": {category: "Kinky", id: "Undeniable", cost: -1},
	"Needs": {category: "Kinky", id: "Needs", cost: -1},
	"BoundPower": {category: "Combat", id: 40, cost: 3},
	"SavourTheTaste": {category: "Combat", id: "SavourTheTaste", cost: -1},
	"ResilientFoes": {category: "Enemies", id: "ResilientFoes", cost: -1},
	"KillSquad": {category: "Major", id: 41, cost: -3, block: ["Conspicuous"]},
	"Stealthy": {category: "Major", id: 38, cost: 0},
	"HighProfile": {category: "Major", id: "HighProfile", cost: 0},
	"Conspicuous": {category: "Enemies", id: 39, cost: -1, block: ["KillSquad"]},
	"Dominant": {category: "Map", id: "Dominant", cost: 2, block: ["Oppression"]},
	"Oppression": {category: "Map", id: 50, cost: -1, block: ["Dominant"]},
	"Supermarket": {category: "Map", id: 42, cost: 1},
	"PriceGouging": {category: "Map", id: 43, cost: -2},
	"Psychic": {category: "Restraints", id: 6, cost: 4},

	"Pristine": {category: "Map", id: 22, cost: -1},
	"LostTechnology": {category: "Major", buff: true, id: 23, cost: -1},
	//"Blessed": {category: "Map", id: 8, cost: 1},
	"Cursed": {category: "Major", id: 9, cost: -3},
	"Studious": {category: "Magic", id: 12, cost: 2, tags: ["start"]},
	//"Novice": {category: "Magic", id: 7, cost: -1},
	//"Meditation": {category: "Magic", id: 13, cost: 2},
	//"DistractionCast":  {category: "Magic", id: "DistractionCast", cost: 2},
	"Clearheaded":  {category: "Magic", id: "Clearheaded", cost: 1, block: ["ArousingMagic"]},
	"ArousingMagic":  {category: "Magic", id: "ArousingMagic", cost: -1, block: ["Clearheaded"]},
	//"QuickScribe": {category: "Magic", id: 56, cost: 1, block: ["Disorganized"]},
	"BerserkerRage": {category: "Combat", id: "BerserkerRage", cost: 3},
	"UnstableMagic": {category: "Magic", id: "UnstableMagic", cost: 2},
	"Vengeance": {category: "Enemies", id: "Vengeance", cost: -1},
	"AbsoluteFocus": {category: "Magic", id: "AbsoluteFocus", cost: -1},

	"SelfBondage": {category: "Start", id: "SelfBondage", cost: 0, tags: ["start"]},
	"HeelTraining": {category: "Start", id: "HeelTraining", cost: 0, tags: ["start"]},
	"ClassicHeels": {category: "Toggles", id: "ClassicHeels", cost: 0, tags: ["start"], blocktags: ["heels"]},

	"MasteryHeels": {category: "Training", id: "MasteryHeels", cost: -1, tags: ["heels"], block: ["ClassicHeels"]},
	"PoorBalance": {category: "Combat", id: "PoorBalance", cost: -1, tags: ["heels"], block: ["ClassicHeels"]},
	"HeadStartHeels": {category: "Training", id: "HeadStartHeels", cost: 1, tags: ["start", "heels"], block: ["ClassicHeels"]},

	"Hogtied": {startPriority: 50, category: "Start", id: "Hogtied", cost: -1, tags: ["start"]},
	"StartObsidian": {startPriority: 5, category: "Start", id: "StartObsidian", cost: -2, outfit: "Obsidian", tags: ["start"]},
	"StartWolfgirl": {startPriority: 10, category: "Start", id: "StartWolfgirl", cost: -2, outfit: "Wolfgirl", tags: ["start"]},
	"StartMaid": {startPriority: 20, category: "Start", id: "StartMaid", cost: -2, outfit: "Maid", tags: ["start"]},
	"StartLatex": {startPriority: 15, category: "Start", id: "StartLatex", cost: -2, tags: ["start"]},
	"StartShadow": {startPriority: 1, category: "Start", id: "StartShadow", cost: -1, tags: ["start"]},

	"StartLatexIntegration": {startPriority: 1000, category: "Boss", id: "StartLatexIntegration", cost: -1, locked: true, buff: true, tags: ["start"]},

	"StartCyberDollStorage": {startPriority: 1000, category: "Boss", id: "StartCyberDollStorage", cost: -1, locked: true, buff: true, tags: ["start"]},
	"StartCyberDoll": {startPriority: 7, category: "Boss", id: "StartCyberDoll", cost: -2, locked: true, tags: ["start"]},

	"DollmakerVisor": {startPriority: 31, category: "Boss", id: "DollmakerVisor", cost: -1, block: ["DollmakerMask"], locked: true, tags: ["start"]},
	"DollmakerMask": {startPriority: 31, category: "Boss", id: "DollmakerMask", cost: -1, block: ["DollmakerVisor"], locked: true, tags: ["start"]},
	"FuukaCollar": {startPriority: 40, category: "Boss", buff: true, id: "FuukaCollar", cost: -2, locked: true, tags: ["start"]},
	"WardenBelt": {startPriority: 42, category: "Boss", buff: true, id: "WardenBelt", cost: -2, locked: true, tags: ["start"]},
	"QuakeCollar": {startPriority: -100, category: "Boss", buff: true, id: "QuakeCollar", cost: 2, locked: true, tags: ["start"]},


	"CommonCyber": {category: "Boss", id: "CommonCyber", cost: -1, locked: true},
	"CommonFuuka": {category: "Boss", id: "CommonFuuka", buff: true, cost: -1, locked: true},
	"CommonWarden": {category: "Boss", id: "CommonWarden", buff: true, cost: -1, locked: true},

	"BulletHell": {category: "Enemies", id: "BulletHell", cost: -2, block: ["BulletHell2"]},
	"BulletHell2": {category: "Enemies", id: "BulletHell2", cost: -3, block: ["BulletHell"]},



	"Nowhere": {category: "Enemies", id: "Nowhere", cost: -1},
	"LivingCollars": {category: "Enemies", id: "LivingCollars", cost: -2},
	"StunBondage": {category: "Enemies", id: "StunBondage", cost: -2},
	"Prisoner": {category: "Start", id: "Prisoner", cost: 0},

	"Panic": {category: "Map", id: "Panic", cost: -1},
	"Panic2": {category: "Map", id: "Panic2", cost: -1},

	"Rusted": {category: "Map", id: "Rusted", cost: 1},


	"OnlyBrats": {category: "Toggles", id: "OnlyBrats", cost: 0, tags: ["start"], block: ["NoBrats"]},
	"NoPolice": {category: "Toggles", id: "NoPolice", cost: 0, tags: ["start"], debuff: true},
	"MoreKinkyFurniture": {category: "Toggles", id: "MoreKinkyFurniture", cost: 0, tags: ["start"]},
	"NoBrats": {category: "Toggles", id: "NoBrats", cost: 0, tags: ["start"], debuff: true, block: ["OnlyBrats"]},
	"NoNurse": {category: "Toggles", id: "NoNurse", cost: 0, tags: ["start"], debuff: true},
	"TapePref": {category: "Toggles", id: "TapePref", cost: 0, tags: ["start"], block: ["TapeOptout"]},
	"TapeOptout": {category: "Toggles", id: "TapeOptout", cost: 0, tags: ["start"], debuff: true, block: ["TapePref"]},
	"SlimePref": {category: "Toggles", id: "SlimePref", cost: 0, tags: ["start"], block: ["SlimeOptout"]},
	"SlimeOptout": {category: "Toggles", id: "SlimeOptout", cost: 0, tags: ["start"], debuff: true, block: ["SlimePref"]},
	"BubblePref": {category: "Toggles", id: "BubblePref", cost: 0, tags: ["start"], block: ["BubbleOptout"]},
	"BubbleOptout": {category: "Toggles", id: "BubbleOptout", cost: 0, tags: ["start"], debuff: true, block: ["BubblePref"]},

	"NoBlindfolds": {category: "Toggles", id: "NoBlindfolds", cost: 1, tags: ["start"], block: ["Blackout", "TotalBlackout"]},
	"Unmasked": {category: "Toggles", id: "Unmasked", cost: 0, tags: ["start"]},
	"NoHood": {category: "Toggles2", id: "NoHood", cost: 0, tags: ["start"]},
	"NoSenseDep": {category: "Toggles2", id: "NoSenseDep", cost: 0, tags: ["start"], debuff: true},
	"NoKigu": {category: "Toggles", id: "NoKigu", cost: 0, tags: ["start"], debuff: true},

	"NoDoll": {category: "Toggles", id: "NoDoll", cost: 0, tags: ["start"], debuff: true},
	"NoPet": {category: "Toggles", id: "NoPet", cost: 0, tags: ["start"], debuff: true},
	"NoHelp": {category: "Toggles", id: "NoHelp", cost: 0, tags: ["start"]},

	"Estim": {category: "Toggles", id: "Estim", cost: 0, tags: ["start"]},



	"Quickness": {category: "Combat", id: "Quickness", cost: 2},

	"BoundCrusader": {category: "Kinky", id: "BoundCrusader", cost: -1},
	"FreeBoob1":  {category: "Restraints", id: "FreeBoob1", cost: 1, block: ["FreeBoob2"], requireArousal: true},
	"FreeBoob2":  {category: "Restraints", id: "FreeBoob2", cost: 2, block: ["FreeBoob1"], requireArousal: true},

	"Trespasser": {category: "Map", id: "Trespasser", cost: -2},


	"Butterfingers":  {category: "Restriction", id: "Butterfingers", cost: -1},
	"WeakGrip":  {category: "Restriction", id: "WeakGrip", cost: -1},



	"Blackout":  {category: "Senses", id: "Blackout", cost: -1, block: ["TotalBlackout", "NoBlindfolds"]},
	"TotalBlackout":  {category: "Senses", id: "TotalBlackout", cost: -2, block: ["Blackout", "Forgetful", "NoBlindfolds"]},
	"Forgetful": {category: "Senses", id: "Forgetful", cost: -1, block: ["TotalBlackout"]},
	"NightOwl": {category: "Senses", id: "NightOwl", cost: 2, block: ["NightBlindness", "MutualDarkness"]},
	//"MutualDarkness": {category: "Senses", id: "NightOwl", cost: 2, block: ["NightBlindness", "NightOwl"]},
	"Stalker": {category: "Senses", id: "Stalker", cost: 2,},
	"NightBlindness": {category: "Senses", id: "NightBlindness", cost: -1, block: ["NightOwl", "MutualDarkness"]},
	"Nearsighted": {category: "Senses", id: "Nearsighted", cost: -1, block: ["ArchersEye"]},
	"KeenHearing": {category: "Senses", id: "KeenHearing", cost: 1},
	"ArchersEye": {category: "Senses", id: "ArchersEye", cost: 1, block: ["Nearsighted"]},

	"Stoic":  {category: "Damage", id: "Stoic", cost: 1, block: ["Ticklish"]},
	"Ticklish":  {category: "Damage", id: "Ticklish", cost: -1, block: ["Stoic"]},
	"Unperturbed":  {category: "Damage", id: "Unperturbed", cost: 1, block: ["Lascivious"]},
	"Lascivious":  {category: "Damage", id: "Lascivious", cost: -1, block: ["Unperturbed"]},
	"Masochist":  {category: "Damage", id: "Masochist", cost: -1},
	"PainTolerance":  {category: "Damage", id: "PainTolerance", cost: 1},

	"Rigger": {category: "Damage", id: 24, cost: 2},
	"ExclusionsApply": {category: "Major", id: "ExclusionsApply", cost: -3, buff: true,},
	"Pacifist": {category: "Major", buff: true, id: 25, cost: -2},
	"EnemyResist": {category: "Enemies", id: "EnemyResist", cost: 0},
	"EnemyArmor": {category: "Enemies", id: "EnemyArmor", cost: -1},
	"EnemyDamage": {category: "Enemies", id: "EnemyDamage", cost: -1},
	"BurningDesire":  {category: "Damage", id: "BurningDesire", cost: 1},
	"FrigidPersonality":  {category: "Damage", id: "FrigidPersonality", cost: 2},
	"GroundedInReality":  {category: "Damage", id: "GroundedInReality", cost: 2},
	"LikeTheWind":  {category: "Damage", id: "LikeTheWind", cost: 1},
	"ImmovableObject":  {category: "Damage", id: "ImmovableObject", cost: 2},
	"LeastResistance":  {category: "Damage", id: "LeastResistance", cost: 1},

	"Sticky":  {category: "Damage", id: "Sticky", cost: -1},
	"Breathless":  {category: "Damage", id: "Breathless", cost: -1},

	"CommonMaid": {category: "Common", id: "CommonMaid", cost: -1, costGroup: "common"},
	"CommonLatex": {category: "Common", id: "CommonLatex", cost: -1, costGroup: "common"},
	"CommonLeather": {category: "Common", id: "CommonLeather", cost: -1, costGroup: "common"},
	"CommonExp": {category: "Common", id: "CommonExp", cost: -1, costGroup: "common"},
	"CommonDress": {category: "Common", id: "CommonDress", cost: -1, costGroup: "common"},
	"CommonWolf": {category: "Common", id: "CommonWolf", cost: -1, costGroup: "common"},
	"CommonKitty": {category: "Common", id: "CommonKitty", cost: -1, costGroup: "common"},
	"CommonToyPleasure": {category: "Common", id: "CommonToyPleasure", cost: 0, requireArousal: true},
	"CommonToyEdge": {category: "Common", id: "CommonToyEdge", cost: 0, requireArousal: true},
	"CommonToyDeny": {category: "Common", id: "CommonToyDeny", cost: 0, requireArousal: true},
	"CommonToyTease": {category: "Common", id: "CommonToyTease", cost: 0, requireArousal: true},

	"Incantation":  {category: "Restriction", id: "Incantation", cost: -1, block: ["SmoothTalker"]},
	"SmoothTalker":  {category: "Restriction", id: "SmoothTalker", cost: 2, block: ["Incantation"]},
	"SomaticPlus": {category: "Restriction", id: "SomaticPlus", cost: 2, block: ["SomaticMinus"]},
	"SomaticMinus": {category: "Restriction", id: "SomaticMinus", cost: -1, block: ["SomaticPlus"]},
	"HeelWalker": {category: "Restriction", id: 53, cost: 2, block: ["PoorForm"]},
	"PoorForm": {category: "Restriction", id: "PoorForm", cost: -1, block: ["HeelWalker"]},

	"Doorknobs":  {category: "Restriction", id: "Doorknobs", cost: -1},
	"CantTouchThat":  {category: "Restriction", id: "CantTouchThat", cost: -2},
	"Grounded":  {category: "Restriction", id: "Grounded", cost: -1},


	"MapLarge": {category: "Map", id: "MapLarge", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
	"MapHuge": {category: "Map", id: "MapHuge", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
	"MapGigantic": {category: "Map", id: "MapGigantic", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},
	"MapAbsurd": {category: "Map", id: "MapAbsurd", cost: 0, tags: ["start", "mapsize"], blocktags: ["mapsize"]},

	"TrustFall": {category: "Restriction", id: "TrustFall", cost: -1, tags: ["heels"], block: ["ClassicHeels"]},
};



function KDGetPerkCost(perk: KDPerk): number {
	if (!perk) return 0;
	if (!perk.costGroup) return perk.cost;
	let costGroups = {};
	let first = false;
	// Only the first one has a cost
	for (let p of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsPresets[p] && KinkyDungeonStatsPresets[p].costGroup) {
			if (!first) {
				first = true;
				if (KinkyDungeonStatsPresets[p].id == perk.id) {
					return KinkyDungeonStatsPresets[p].cost;
				}
			}
			costGroups[KinkyDungeonStatsPresets[p].costGroup] = KinkyDungeonStatsPresets[p].cost;
		}
	}
	if (costGroups[perk.costGroup] != undefined && perk.cost >= costGroups[perk.costGroup]) return 0;
	else return perk.cost;
}

function KinkyDungeonGetStatPoints(Stats: Map<any, any>): number {
	let total = KinkyDungeonStatsChoice.get("vhardperksMode") ? -25
		: (KinkyDungeonStatsChoice.get("hardperksMode") ? -10
		: (KinkyDungeonStatsChoice.get("perksMode") ? 10
		: 0));
	for (let k of Stats.keys()) {
		if (Stats.get(k)) {
			if (KinkyDungeonStatsPresets[k]) {
				total -= KDGetPerkCost(KinkyDungeonStatsPresets[k]);
			}
		}
	}
	return total;
}

/**
 * Determine if a perk can be picked with a certain number of points remaining
 * @param Stat
 * @param [points]
 */
function KinkyDungeonCanPickStat(Stat: string, points?: number): boolean {
	let stat = KinkyDungeonStatsPresets[Stat];
	if (!stat) return false;
	if (KDGetPerkCost(stat) > 0 && (points != undefined ? points : KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice)) < KDGetPerkCost(stat)) return false;
	if (!KDValidatePerk(stat)) return false;
	for (let k of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsChoice.get(k)) {
			if (KinkyDungeonStatsPresets[k] && KinkyDungeonStatsPresets[k].block && KinkyDungeonStatsPresets[k].block.includes(Stat)) {
				return false;
			}
			if (KinkyDungeonStatsPresets[k] && stat.tags && KinkyDungeonStatsPresets[k].blocktags) {
				for (let t of KinkyDungeonStatsPresets[k].blocktags)
					if (stat.tags.includes(t)) return false;
			}
		}
	}
	return true;
}

/**
 * General validation for a perk
 * @param stat
 */
function KDValidatePerk(stat: KDPerk): boolean {
	if (stat.requireArousal && !KinkyDungeonStatsChoice.get("arousalMode")) return false;
	if (stat.blockclass) {
		for (let t of stat.blockclass)
			if (KinkyDungeonClassMode == t) return false;
	}
	return true;
}

/**
 * Determines if perk1 is blocked by another perk or in general
 * @param perk1
 * @param perk2
 */
function KDPerkBlocked(perk1: string, perk2: string): boolean {
	if (KinkyDungeonStatsPresets[perk2] && KinkyDungeonStatsPresets[perk1]) {
		if (!KDValidatePerk(KinkyDungeonStatsPresets[perk1])) return false;
		if (KinkyDungeonStatsPresets[perk2].block && KinkyDungeonStatsPresets[perk2].block.includes(perk1)) {
			return true;
		}
		if (KinkyDungeonStatsPresets[perk2] && KinkyDungeonStatsPresets[perk1].tags && KinkyDungeonStatsPresets[perk2].blocktags) {
			for (let t of KinkyDungeonStatsPresets[perk2].blocktags)
				if (KinkyDungeonStatsPresets[perk1].tags.includes(t)) return true;
		}
	}
	return false;
}

function KinkyDungeonCanUnPickStat(Stat: string): boolean {
	let stat = KinkyDungeonStatsPresets[Stat];
	if (!stat) return false;
	if (KDGetPerkCost(stat) < 0 && KinkyDungeonGetStatPoints(KinkyDungeonStatsChoice) < -KDGetPerkCost(stat)) return false;
	for (let k of KinkyDungeonStatsChoice.keys()) {
		if (KinkyDungeonStatsChoice.get(k)) {
			if (KinkyDungeonStatsPresets[k] && KinkyDungeonStatsPresets[k].require == Stat) {
				return false;
			}
		}
	}
	return true;
}


function KDInitPerks() {
	let magicHands = KinkyDungeonStatsChoice.has("MagicHands");
	if (!magicHands) {
		// We use magichands for the start scenarios
		KinkyDungeonStatsChoice.set("MagicHands", true);
	}
	KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints();
	for (let perk of [...KinkyDungeonStatsChoice.keys()].filter((e) => {return KDPerkStart[e] != undefined;})
		.sort((a, b) => {
			return ((KinkyDungeonStatsPresets[a] && KinkyDungeonStatsPresets[a].startPriority) || -1) - ((KinkyDungeonStatsPresets[b] && KinkyDungeonStatsPresets[b].startPriority) || -1);
		})) {
		if (KinkyDungeonStatsChoice.get(perk) && KDPerkStart[perk]) {
			KDPerkStart[perk]();
			console.log("started with perk " + perk);
		}
	}
	if (!magicHands)
		KinkyDungeonStatsChoice.delete("MagicHands");
}

let KDPerkStart = {
	Studious: () => {
		KinkyDungeonSpellPoints += 1;
	},

	Submissive: () => {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicCollar"), 0, true, "Red", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("BasicLeash"), 0, true, "", false, undefined, undefined, undefined, true);
	},
	Pacifist: () =>{
		KinkyDungeonInventoryAddWeapon("Rope");
	},
	Rigger: () =>{
		KinkyDungeonInventoryAddWeapon("Rope");
		KinkyDungeonInventoryAddWeapon("Scissors");
	},
	Unchained: () =>{
		KDAddConsumable("RedKey", 1);
	},

	FuukaCollar: () =>{
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoCollar2"), 0, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoDress"), 0, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("MikoGag"), 0, true, undefined, false, undefined, undefined, undefined, true);

		KDFixPlayerClothes("Fuuka");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	QuakeCollar: () =>{
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("QuakeCollar"), 0, true, undefined, false, undefined, undefined, undefined, true);
	},
	WardenBelt: () =>{
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("WardenBelt"), 0, true, undefined, false, undefined, undefined, undefined, true);
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	Prisoner: () =>{
		KDGameData.PrisonerState = 'parole';
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	Slayer: () =>{
		KDPushSpell(KinkyDungeonFindSpell("Firebolt"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},
	Conjurer: () =>{
		KDPushSpell(KinkyDungeonFindSpell("ChainBolt"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},
	Magician: () =>{
		KDPushSpell(KinkyDungeonFindSpell("Dagger"));
		KinkyDungeonSpellChoices[0] = KinkyDungeonSpells.length - 1;
	},

	Brawler: () =>{
		KinkyDungeonInventoryAddWeapon("Knife");
		KDSetWeapon("Knife");
		KinkyDungeonGetPlayerWeaponDamage(KinkyDungeonCanUseWeapon());
	},
	NovicePet: () =>{
		KinkyDungeonInventoryAddLoose("MagicPetsuit");
	},
	SelfBondage: () =>{
		if (KinkyDungeonStatsChoice.get("arousalMode")) {
			KinkyDungeonInventoryAddLoose("TrapBelt");
			KinkyDungeonInventoryAddLoose("TrapVibe");
			if (!KinkyDungeonStatsChoice.get("arousalModePlugNoFront")) {
				KinkyDungeonInventoryAddLoose("TrapPlug");
			}
		}
		if (KinkyDungeonStatsChoice.get("arousalModePlug")) {
			KinkyDungeonInventoryAddLoose("RearVibe1");
		}
		KinkyDungeonInventoryAddLoose("TrapMittens");
		KinkyDungeonInventoryAddLoose("TrapCuffs");
		KinkyDungeonInventoryAddLoose("TrapGag");
		KinkyDungeonInventoryAddLoose("TrapBlindfold");
		KinkyDungeonInventoryAddLoose("TrapArmbinder");
		KinkyDungeonInventoryAddLoose("RopeSnakeArmsBoxtie");
		KinkyDungeonInventoryAddLoose("RopeSnakeArmsWrist");
		KinkyDungeonInventoryAddLoose("RopeSnakeLegs");
		KinkyDungeonInventoryAddLoose("RopeSnakeFeet");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsArms");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsLegs");
		KinkyDungeonInventoryAddLoose("SturdyLeatherBeltsFeet");
	},
	HeelTraining: () =>{
		KDGameData.Training.Heels = {
			training_points: 0,
			training_stage: 0,
			turns_skipped: 0,
			turns_total: 0,
			turns_trained: 0,
		};
		KinkyDungeonAddRestraintIfWeaker("TrainingHeels", 20, true, "HiSec", false, undefined, undefined, undefined, true);
	},
	HeadStartHeels: () =>{
		KDGameData.Training.Heels = {
			training_points: 0,
			training_stage: 5,
			turns_skipped: 0,
			turns_total: 0,
			turns_trained: 0,
		};
		KinkyDungeonInventoryAddLoose("TrainingHeels");

	},
	StartLatex: () =>{
		KDAddQuest("LatexDoll");
		KinkyDungeonChangeRep("Latex", 10);
		KDCustomDefeatUniforms.DollShoppe();
		KDFixPlayerClothes("Dressmaker");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	DollmakerVisor: () =>{
		KinkyDungeonAddRestraintIfWeaker("DollmakerVisor", 5, true, "Gold", false, undefined, undefined, undefined, true);
		KDFixPlayerClothes("Dollsmith");
	},
	DollmakerMask: () =>{
		KinkyDungeonAddRestraintIfWeaker("DollmakerMask", 5, true, "Gold", false, undefined, undefined, undefined, true);
		KDFixPlayerClothes("Dollsmith");
	},
	StartCyberDollStorage: () =>{
		KinkyDungeonChangeRep("Metal", -25);

		KDFixPlayerClothes("AncientRobot");
		KDEnterDollTerminal(false);
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	StartLatexIntegration: () =>{
		KDFixPlayerClothes("AncientRobot");
		KDAddSpecialStat("LatexIntegration", KDPlayer(), 100, true);

		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
	},
	StartCyberDoll: () =>{
		KDAddQuest("EscapedDoll");
		KinkyDungeonChangeRep("Metal", 10);

		KDCustomDefeatUniforms.CyberDoll();
		KDFixPlayerClothes((KinkyDungeonStatsChoice.get("DollmakerVisor") || KinkyDungeonStatsChoice.get("DollmakerMask") || KinkyDungeonStatsChoice.get("CommonCyber")) ? "Dollsmith" : "AncientRobot");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
		KDAddConsumable("RedKey", -1000);
		KDAddConsumable("Pick", -1000);
	},
	StartMaid: () =>{
		KDAddQuest("MaidSweeper");
		KDChangeFactionRelation("Player", "Maidforce", 0.2 - KDFactionRelation("Player", "Maidforce"), true);
		KDCustomDefeatUniforms.MaidSweeper();

		KinkyDungeonInventoryAddLoose("DusterGag");
		KDFixPlayerClothes("Maidforce");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
		KDAddConsumable("RedKey", -1000);
		KDAddConsumable("Pick", -1000);
	},
	StartWolfgirl: () =>{
		KDChangeFactionRelation("Player", "Nevermere", 0.2 - KDFactionRelation("Player", "Nevermere"), true);
		KDCustomDefeatUniforms.WolfgirlHunters();
		KDAddQuest("WolfgirlHunters");
		KDFixPlayerClothes("Nevermere");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
		KDAddConsumable("RedKey", -1000);
		KDAddConsumable("Pick", -1000);
	},
	StartObsidian: () =>{
		KDChangeFactionRelation("Player", "Elemental", 0.2 - KDFactionRelation("Player", "Elemental"), true);

		KDAddQuest("ElementalSlave");
		KDCustomDefeatUniforms.ElementalSlave();

		KDFixPlayerClothes("Elemental");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
		KDAddConsumable("RedKey", -1000);
		KDAddConsumable("Pick", -1000);
	},
	Hogtied: () =>{
		KDAddQuest("Nawashi");
		KDCustomDefeatUniforms.RopeDojo();

		for (let w of kdStartWeapons) {
			if (KinkyDungeonInventoryGet(w)) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet(w));
		}
		KDFixPlayerClothes("Jail");
		if (!KDHasSpell("ZeroResistance")) KDPushSpell(KinkyDungeonFindSpell("ZeroResistance"));
		KDAddConsumable("RedKey", -1000);
		KDAddConsumable("Pick", -1000);
	},
	Bandit: () =>{
		for (let key of Object.keys(KinkyDungeonFactionTag)) {
			KDSetFactionRelation("Player", key, -0.55);
		}
		KDChangeFactionRelation("Player", "Bandit", 0.1 - KDFactionRelation("Player", "Bandit"), true);
		KDChangeFactionRelation("Player", "Nevermere", 0.1 - KDFactionRelation("Player", "Nevermere"), true);
	},

	Stranger: () => {
		for (let key of Object.keys(KinkyDungeonFactionTag)) {
			if (!KinkyDungeonHiddenFactions.has(key))
				KDSetFactionRelation("Player", key, -1 + 0.45 * KDRandom() + 0.45 * KDRandom() + 0.45 * KDRandom());
		}
	},
	WrongNeighborhood: () => {
		for (let key of Object.keys(KinkyDungeonFactionTag)) {
			if (!KinkyDungeonHiddenFactions.has(key)) {
				KDSetFactionRelation("Player", key, -1);
				for (let key2 of Object.keys(KinkyDungeonFactionTag)) {
					KDSetFactionRelation(key, key2, 0.5);
				}
			}
		}
	},
	Cursed: () => {
		KinkyDungeonChangeFactionRep("Angel", -100);
		for (let rep of Object.keys(KinkyDungeonShrineBaseCosts)) {
			KinkyDungeonChangeRep(rep, 0);
		}
	},
	MC_Trainee: () => {
		KDPushSpell(KinkyDungeonFindSpell("DistractionCast"));
	},
	MC_Wizard: () => {
		KDPushSpell(KinkyDungeonFindSpell("ManaRegen"));
	},
	MC_Rogue: () => {
		KDPushSpell(KinkyDungeonFindSpell("RogueTargets"));
	},
	MC_Peasant: () => {
		KDPushSpell(KinkyDungeonFindSpell("Peasant"));
	},
	MC_Fighter: () => {
		KDPushSpell(KinkyDungeonFindSpell("BattleRhythm"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("Offhand"));
		KinkyDungeonSpellChoices.push(KinkyDungeonSpells.length - 1);
		KDPushSpell(KinkyDungeonFindSpell("FighterOffhand"));

	},
};


let KDPerksFilter = "";

let KDPerksButtonWidth = 298;
let KDPerksButtonWidthPad = 2;
let KDPerksButtonHeight = 44;
let KDPerksButtonHeightPad = 2;
let KDPerksXPad = 50;
let KDPerksYPad = 50;
let KDPerksYStart = 220;
let KDPerksXStart = 50;
let KDPerksMaxY = 900;
let KDPerksScroll = KDPerksButtonWidth * 2 + KDPerksButtonWidthPad * 2 + KDPerksXPad;
let KDPerksIndex = 0;
let KDPerksIndexUI = 0;
let KDPerksIndexUIWeight = 4;

let KDCategories = [

];

function KinkyDungeonDrawPerks(NonSelectable: boolean): boolean {
	let fadeColor = NonSelectable ? "#808080" : "#999999";
	let X = Math.round(KDPerksXStart - KDPerksScroll * KDPerksIndexUI);
	let Y = KDPerksYStart;
	let Y_alt = KDPerksYStart;
	if (CommonIsMobile) KDPerksIndexUIWeight = 1;
	KDPerksIndexUI = (KDPerksIndex + (KDPerksIndexUIWeight - 1) * KDPerksIndexUI) / KDPerksIndexUIWeight;

	/*MainCanvas.beginPath();
	MainCanvas.lineWidth = 3;
	MainCanvas.strokeStyle = KDBorderColor;
	MainCanvas.moveTo(50, 120);
	MainCanvas.lineTo(1950, 120);
	MainCanvas.stroke();
	MainCanvas.closePath();*/

	let tooltip = false;
	let catsdrawn = 0;
	let catsdrawnStrict = 0;

	function inView() {
		return X > -2 * KDPerksButtonWidth - KDPerksButtonWidthPad && X < 2000 - KDPerksButtonWidth;
	}
	function inViewStrict() {
		return X > 0 && X < 2000 - KDPerksButtonWidth;
	}

	let indexX = 0;
	let indexList = {};

	let firstDrawn = "";

	let filled_x = {

	};

	let perksdrawn = 0;

	for (let c of KDCategories) {
		Y = Math.max(Y, Y_alt);
		let height = KDPerksYPad + KDPerksButtonHeight*Math.max(c.buffs.length, c.debuffs.length);
		if (Y + height > KDPerksMaxY) {
			X += (KDPerksButtonWidth + KDPerksButtonWidthPad)*2 + KDPerksXPad;
			indexX += 1;
			Y = KDPerksYStart;
		}

		let oldY = Y;
		let oldYAlt = Y_alt;
		Y += KDPerksYPad;
		Y_alt = Y;

		let drawn = 0;
		for (let stat of c.buffs.concat(c.debuffs)) {
			if ((!stat[1].locked || KDUnlockedPerks.includes(stat[0]))
				&& (NonSelectable || !KDPerksFilter || TextGet("KinkyDungeonStat" + ("" + stat[1].id)).toLocaleLowerCase().includes(KDPerksFilter.toLocaleLowerCase()))) {
				let YY = (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) ? Y_alt : Y;
				let XX = (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) ? X + KDPerksButtonWidth + KDPerksButtonWidthPad : X;

				drawn++;
				perksdrawn++;
				if (inView()) {
					let colorAvailable = NonSelectable ?
					fadeColor :
					KDGetPerkCost(stat[1]) > 0 ?
						"#aaaacc" :
						KDGetPerkCost(stat[1]) < 0 ?
							"#ccaaaa" :
							"#aaaacc";
					let colorSelected = KDGetPerkCost(stat[1]) > 0 ? "#eeeeff" : KDGetPerkCost(stat[1]) < 0 ? "#ffeeee" : "#eeeeff";
					let colorExpensive = KDGetPerkCost(stat[1]) > 0 ? "#555588" : KDGetPerkCost(stat[1]) < 0 ? "#885555" : "#555588";

					//perksdrawn++;x
					DrawButtonKDExTo(kdUItext, stat[0], (_bdata) => {
						if (!KinkyDungeonStatsChoice.get(stat[0]) && KinkyDungeonCanPickStat(stat[0])) {
							KinkyDungeonStatsChoice.set(stat[0], true);
							localStorage.setItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig, JSON.stringify(Array.from(KinkyDungeonStatsChoice.keys())));
						} else if (KinkyDungeonStatsChoice.get(stat[0])) {
							KinkyDungeonStatsChoice.delete(stat[0]);
							localStorage.setItem('KinkyDungeonStatsChoice' + KinkyDungeonPerksConfig, JSON.stringify(Array.from(KinkyDungeonStatsChoice.keys())));
						}
						if (KDClipboardDisabled) {
							let txt = "";
							for (let k of KinkyDungeonStatsChoice.keys()) {
								if (!k.startsWith("arousal") && !k.endsWith("Mode")) txt += (txt ? "|" : "") + k;
							}
							ElementValue("KDCopyPerks", txt);
						}
						return true;
					}, !NonSelectable && (KinkyDungeonState == "Stats" || (KinkyDungeonDrawState == "Perks2" && KDDebugPerks)), XX, YY, KDPerksButtonWidth, KDPerksButtonHeight,
					TextGet("KinkyDungeonStat" + (stat[1].id)) + ` (${KDGetPerkCost(stat[1])})`,
						(!KinkyDungeonStatsChoice.get(stat[0]) && KinkyDungeonCanPickStat(stat[0])) ? colorAvailable : (KinkyDungeonStatsChoice.get(stat[0]) ? colorSelected : (NonSelectable ? colorAvailable : colorExpensive)),
						KinkyDungeonStatsChoice.get(stat[0]) ? (KinkyDungeonRootDirectory + "UI/TickPerk.png") : "",
						undefined, false, true,
						KinkyDungeonStatsChoice.get(stat[0]) ? "rgba(140, 140, 140, 0.5)" : KDButtonColor,
						undefined, undefined, {
							noTextBG: true,
							unique: true,
						});
					if (MouseIn(XX, YY, KDPerksButtonWidth, KDPerksButtonHeight)) {
						DrawTextFitKD(TextGet("KinkyDungeonStatDesc" + (stat[1].id)), 1000, 150, 1500, KDTextWhite, KDTextGray1);
						DrawTextFitKD(TextGet("KinkyDungeonStatCost").replace("AMOUNT", KDGetPerkCost(stat[1]) + ""), 1000, 190, 1400, KDTextWhite, KDTextGray1);
						tooltip = true;
					}
				}
				if (!filled_x[X]) {
					FillRectKD(kdUItext, kdpixisprites, c.name, {
						Left: X - KDPerksButtonWidthPad,
						Top: KDPerksYStart,
						Width: 2 * KDPerksButtonWidth + 3 * KDPerksButtonWidthPad,
						Height: KDPerksMaxY - KDPerksYStart,
						Color: KDTextGray0,
						LineWidth: 1,
						zIndex: 60,
						alpha: 0.4,
					});
					filled_x[X] = X;
				}
				if (!stat[1].buff && (stat[1].cost < 0 || stat[1].debuff)) Y_alt += KDPerksButtonHeight + KDPerksButtonHeightPad;
				else Y += KDPerksButtonHeight + KDPerksButtonHeightPad;
			}
		}

		if (drawn > 0) {
			DrawTextFitKDTo(kdUItext, TextGet("KDCategory" + c.name), X + KDPerksButtonWidth + KDPerksButtonWidthPad/2, oldY + KDPerksYPad - KDPerksButtonHeight/2 - 5, KDPerksButtonWidth*2, "#ffffff",
				undefined, undefined, undefined, undefined, undefined, undefined, true);
			//MainCanvas.textAlign = "left";
			//MainCanvas.textAlign = "center";
			if (inView()) {
				catsdrawn += 1;
			}
			if (inViewStrict()) {
				catsdrawnStrict += 1;
				if (!firstDrawn) firstDrawn = c.name;
			}
		} else {
			Y = oldY;
			Y_alt = oldYAlt;
		}
		indexList[c.name] = indexX;
	}


	DrawButtonKDEx("perks>", (_bdata) => {
		if (catsdrawn > 2 && !(document.activeElement?.id == 'PerksFilter')) {
			KDPerksIndex += 1;
		}
		return true;
	}, true, 1750, 50, 100, 50, ">>", KDTextWhite);

	DrawButtonKDEx("perks<", (_bdata) => {
		if (KDPerksIndex > 0 && !(document.activeElement?.id == 'PerksFilter')) {
			KDPerksIndex -= 1;
		}
		return true;
	}, true, 150, 50, 100, 50, "<<", KDTextWhite);

	let procList = KDCategoriesStart.map((e) => {return e.name;});
	let adjLists = GetAdjacentList(procList, procList.indexOf(firstDrawn), catsdrawnStrict);
	let left = adjLists.left;
	let right = adjLists.right;

	drawVertList(left.reverse(), 380, tooltip ? 85 : 190, 250, 25, tooltip ? 4 : 8, 18, (data: any) => {
		return (_bdata: any) => {
			KDPerksIndex = indexList[data.name];
			return true;
		};
	}, "KDCategory");
	drawVertList(right, 1620, tooltip ? 85 : 190, 250, 25, tooltip ? 4 : 8, 18, (data: any) => {
		return (_bdata: any) => {
			KDPerksIndex = Math.max(0, indexList[data.name] - 2);
			return true;
		};
	}, "KDCategory");

	if ((catsdrawn < 3 || perksdrawn == 0) && KDPerksIndex > 0) KDPerksIndex -= 1;


	return tooltip;
}

/**
 * @param list
 * @param x
 * @param y
 * @param w
 * @param h
 * @param max
 * @param fontSize
 * @param clickfnc
 * @param prefix
 */
function drawVertList(list: any[], x: number, y: number, w: number, h: number, max: number, fontSize: number, clickfnc: (a: any) => ((a: any) => boolean), prefix: string) {
	for (let i = 0; i < list.length && i < max; i++) {
		let name = list[i];
		DrawButtonKDEx(name + x + "," + y, clickfnc({name: name}), true, x - w/2, y - (h+1) * i, w, h, TextGet(prefix + name), KDTextWhite, undefined, undefined, undefined, true, undefined, fontSize);
	}
}


/**
 * @param list
 * @param x
 * @param y
 * @param w
 * @param h
 * @param max
 * @param fontSize
 * @param clickfnc
 * @param prefix
 * @param reverse
 */
function drawHorizList(list: any[], x: number, y: number, w: number, h: number, max: number, fontSize: number, clickfnc: (a: any) => ((a: any) => boolean), prefix: string, reverse: boolean) {
	for (let i = 0; i < list.length && i < max; i++) {
		let name = list[i];
		DrawButtonKDEx(name + x + "," + y, clickfnc({name: name}), true, x + (reverse ? -1 : 1) * (w+1) * i - w/2, y, w, h,
			TextGet(prefix + name), KDTextWhite, undefined, undefined, undefined, true, KDButtonColor, fontSize);
	}
}

/**
 * @param existing
 * @param [debuff]
 */
function KDGetRandomPerks(existing: Record<string, boolean>, debuff?: boolean): string[] {
	let poscandidate = null;
	let poscandidates = [];
	let singlepointcandidates = [];
	let negcandidates = [];
	if (!debuff) {
		for (let p of Object.entries(KinkyDungeonStatsPresets)) {
			if (!existing[p[0]] && !KinkyDungeonStatsChoice.get(p[0]) && KinkyDungeonCanPickStat(p[0], 999)) { // No dupes
				if ((!p[1].tags || !p[1].tags.includes("start"))) {
					if (!p[1].locked || KDUnlockedPerks.includes(p[0])) {
						if (KDGetPerkCost(p[1]) > 0) {
							poscandidates.push(p);
							if (KDGetPerkCost(p[1]) == 1)
								singlepointcandidates.push(p);
						} else if (KDGetPerkCost(p[1]) < 0) {
							negcandidates.push(p);
						}
					}
				}
			}
		}

		poscandidate = poscandidates[Math.floor(poscandidates.length * KDRandom())];
		if (!poscandidate) return [];
	} else {
		for (let p of Object.entries(KinkyDungeonStatsPresets)) {
			if (!existing[p[0]] && !KinkyDungeonStatsChoice.get(p[0]) && KinkyDungeonCanPickStat(p[0], 999)) { // No dupes
				if ((!p[1].tags || !p[1].tags.includes("start"))) {
					if (!p[1].locked || KDUnlockedPerks.includes(p[0])) {
						if (KDGetPerkCost(p[1]) < 0) {
							negcandidates.push(p);
						}
					}
				}
			}
		}
	}


	let netcost = debuff ? 0 : KDGetPerkCost(poscandidate[1]);
	let perks = poscandidate ? [poscandidate[0]] : [];
	if (debuff || KDGetPerkCost(poscandidate[1]) > 1) {
		negcandidates = negcandidates.filter((p) => {
			return (KinkyDungeonCanPickStat(p[0], 999))
				&& (debuff || !KDPerkBlocked(p[0], poscandidate[0]))
				&& (-KDGetPerkCost(p[1]) >= (debuff ? 0 : (KDGetPerkCost(poscandidate[1]) - 1)));
		});
		let negperk = null;
		if (negcandidates.length > 0) {
			negperk = negcandidates[Math.floor(negcandidates.length * KDRandom())];
			perks.push(negperk[0]);
			netcost += KDGetPerkCost(negperk[1]);
		}

		if (!debuff && netcost < 0 && negperk) {
			singlepointcandidates = negcandidates.filter((p) => {
				return (KinkyDungeonCanPickStat(p[0], 999)
				&& p[0] != poscandidate[0]
				&& p[0] != negperk[0]
				&& !KDPerkBlocked(p[0], poscandidate[0])
				&& !KDPerkBlocked(p[0], negperk[0]));
			});
			let newperk = singlepointcandidates[Math.floor(singlepointcandidates.length * KDRandom())];
			perks = [perks[0], newperk[0], perks[1]];
		}
	}
	return perks;
}

/**
 * @param perks
 */
function KDGetPerkShrineBondage(perks: string[]): string[] {
	let ret = [];
	if (!KinkyDungeonStatsChoice.get("perkNoBondage")) {
		let cost = 0;

		for (let p of perks) {
			if (KinkyDungeonStatsPresets[p]) {
				cost += KDGetPerkCost(KinkyDungeonStatsPresets[p]);
			}
		}

		let chancePos = KinkyDungeonStatsChoice.get("perkBondage") ? 1.0 : 0.5;
		let chanceNeg = KinkyDungeonStatsChoice.get("perkBondage") ? 1.0 : 0.25;
		let prev = "";
		let theme = "";
		let randTheme = () => {
			prev = theme;
			return CommonRandomItemFromList(prev, [
				"leatherRestraints",
				"latexRestraints",
				"mithrilRestraints",
				"obsidianRestraints",
				"cyberdollrestraints",
				"controlHarness",
				"dragonRestraints",
				"expRestraints",
				"dressRestraints",
				"maidRestraints",
			]);
		};
		theme = randTheme();

		let getRestraints = () => {
			let restraints = [];
			for (let i = 0; i < 11; i++) {
				if (restraints.length == 0) {
					if (i > 0)
						randTheme();
					restraints = KDGetRestraintsEligible({tags: [theme, theme+"Heavy", theme+"Chastity"]}, KDGetEffLevel(), (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
						true, "Gold");
					restraints = restraints.filter((r) => {
						return !ret.includes(r.restraint.name);
					});
				} else break;
			}
			return restraints;
		};

		for (let i = 0; i < (Math.abs(cost) || 1); i++) {
			if (cost > 0 && KDRandom() < chancePos) {
				let rests = getRestraints();
				if (rests?.length > 0) ret.push(rests[Math.floor(KDRandom() * rests.length)].restraint.name);
			} else if (cost <= 0 && KDRandom() < chanceNeg) {
				let rests = getRestraints();
				if (rests?.length > 0) ret.push(rests[Math.floor(KDRandom() * rests.length)].restraint.name);
			}
		}

	}

	return ret;
}
