"use strict";
// Glossary of spell effects
// manacost: Number of turns of no stamina regen after casting the spell. Stacks
// Components: Components required to cast the spell. All of them need to be met
// Level: Determines mana cost and availability. On enemies, increases cooldown
// Power: Determines damage
// Type: "bolt" is a projectile. "inert" is a static delayed blast. "self" is a spell that casts on the player.
// Delay: If the spell's type is "inert", this determines how long before it explodes
// Range: Max targeting range
// damage: damage TYPE. Various damage types have different effects, see KinkyDungeonDealDamage
// speed: speed of a "bolt" projectile
// playerEffect: What happens when the effect hits a player
// trail, trailchance, traildamage, traillifetime: for lingering projectiles left behind the projectile
// onhit: What happens on AoE. Deals aoedamage damage, or just power otherwise

let KDCommandWord: spell = {name: "CommandWord", tags: ["command", "binding", "utility", "defense"], sfx: "Magic", school: "Conjure", manacost: 6, components: ["Verbal"], level:1, type:"special", special: "CommandWord", noMiscast: true,
	onhit:"", time:25, power: 2, range: 2.8, size: 1, damage: ""};
let KDBondageSpell: spell = {name: "Bondage", tags: ["binding", "utility", "offense", "truss"], quick: true, school: "Any", manacost: 0, components: ["Arms"], level:1, spellPointCost: 0, type:"special", special: "Bondage", noMiscast: true,
	onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""};
let KDZeroResistanceSpell: spell = {name: "ZeroResistance", tags: ["utility", "defense"], quick: true, school: "Any", manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", noMiscast: true,
	events: [
		{type: "ZeroResistance", trigger: "tick", },
	],
	onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""};

/**
 * These are starting spells
 */
let KinkyDungeonSpellsStart: spell[] = [
	//{name: "FleetFooted", sfx: "FireSpell", school: "Illusion", manacost: 0.5, components: [], level:1, type:"passive",
	//events: [{type: "FleetFooted", trigger: "beforeMove", power: 1}, {type: "FleetFooted", trigger: "afterMove"}, {type: "FleetFooted", trigger: "beforeTrap", msg: "KinkyDungeonFleetFootedIgnoreTrapFail", chance: 0.35}]},
];

// Filters
let filters = genericfilters.concat(...["buff", "bolt", "aoe", "dot", "offense", "defense", "utility"]);
/** Extra filters, indexed according to the learnable spells menu */
let filtersExtra = [
	["upgrade", "magic"],
	["upgrade", "magic"],
	["will", "stamina", "mana", "damage"],
	["will", "stamina", "mana", "binding"],
	["fire", "ice", "earth", "electric", "air", "water"],
	["binding", "latex", "summon", "physics", "metal", "leather", "rope"],
	["stealth", "light", "shadow", "knowledge"],
];

let KDColumnLabels = [
	["Verbal", "Arms", "Legs", "Passive"],
	["Elements", "Conjure", "Illusion", "Other"],
	["Unique", "Active", "Passive", "Upgrades"],
	["Strength", "Dexterity", "Intelligence", "Misc"],
	["Verbal", "Arms", "Legs", "Passive"],
	["Verbal", "Arms", "Legs", "Passive"],
	["Verbal", "Arms", "Legs", "Passive"],
];

let KinkyDungeonSpellPages = [
	"All",
	"Upgrade",
	"Class",
	"Upgrades",
	"Elements",
	"Conjure",
	"Illusion",
];

let KinkyDungeonSpellPagesDefault = {
	"All": true,
	"Upgrade": true,
	"Class": true,
	"Upgrades": true,
	"Elements": true,
	"Conjure": true,
	"Illusion": true,
};

let KDSpellColumns = {

};

function KDAddSpellPage(page: string, columnLabels: string[] = []) {
	if (!KDGameData.AllowedSpellPages) KDGameData.AllowedSpellPages = {};
	KDGameData.AllowedSpellPages[page] = columnLabels;
}

/**
 * These spells occur in the menu and the player can learn them
 * Spells with NoBuy cannot be bought, but can be looked at.
 * Spells with NoMenu do not appear in the menu until the player has them
 */
let KinkyDungeonLearnableSpells = [
	//Page -1: All learnable
	[
		[],
	],
	//Page 0: Spell Tree
	[
		// Elements
		["ApprenticeFire", "ApprenticeLightning", "ApprenticeAir", "ApprenticeIce", "ApprenticeWater", "ApprenticeEarth"],
		// Conjure
		["ApprenticeRope", "ApprenticeLeather", "ApprenticeMetal", "ApprenticeLatex", "ApprenticePhysics", "ApprenticeSummon", "FloatingWeapon"],
		// Illusion
		["ApprenticeLight", "ApprenticeShadow", "ApprenticeMystery", "ApprenticeProjection", "ApprenticeKnowledge"],
		// Special exclusive
		["AllyCommand"],
	],

	// Class specific
	[
		[
			"Bondage", "ZeroResistance", "DesperateStruggle", "LeashSkill",
			"BattleRhythm", "ManaRegen", "Peasant", "RogueTargets", "DistractionCast",
			"Offhand", "RogueOffhand", "WizardOffhand", "UnconventionalWarfare", "GuerillaFighting",


		],
		[
			"RaiseDefenses", "BreakFree", "Enrage", "LimitSurge", "Charge", "BladeDance",
			"ToolsOfTheTrade", "EvasiveManeuvers",
			"ArcaneBlast", "AkashicConflux", "ArcaneBarrier",


			"ChaoticOverflow", "DistractionBurst", "DistractionShield",
		],
		[
			"Gunslinger", "BattleTrance", "CombatManeuver",
			"ProblemSolving",
			"ManaRegenFast","ManaRegenFast2","ManaRegenPlus","ManaRegenPlus2",
			"Sowing",
			"OrgasmMana1", "EdgeMana1",
		],
		[
			"SecondWind1",
			"BattleCrit", "BattleCost",
			"RogueTraps", "RogueTraps2", "RogueStudy",
			"ManaHarvesting",
			"OrgasmBuff", "MagicalOverload",
		],
	],
	//Page 4: Upgrades
	[
		// Strength
		["IronWill", "SteadfastGuard", "WillStruggle", "Parry", "WillParry", "SteelParry", "GuardBoost", "DaggerParry", "Riposte", "PhysDamage"],
		// Dex
		["Athlete", "CombatTraining", "Sneaky", "Accurate1", "Accurate2", "Accurate3", "Evasive1", "Evasive2", "Evasive3", "Vault", "ArrowFireSpell", "ArrowVineSpell", "NovicePet1", "NovicePet2", "NovicePet3", "NovicePetX", "RogueBind", "RogueEscape"],
		// Intellect
		["SummonUp1", "SummonUp2", "StaffUser1", "StaffUser2", "StaffUser3"],
		// Misc
		["CriticalStrike", "OrgasmFrequency", "OrgasmFrequency2", "OrgasmResist"],
	],
	//Page 1: Elements
	[
		// Verbal
		["Firecracker", "Incinerate", "Gust", "Freeze", "FlashFreeze", "Hailstorm", "IceBreath", "Tremor", "Earthquake", "Shield", "GreaterShield", "IronBlood", "Electrify", "Thunderstorm", "StaticSphere", "Rainstorm"],
		// Arms
		["Firebolt", "Fireblast", "Fireball", "WindBlast", "Icebolt", "Snowball", "IceOrb", "Icicles", "IceLance", "StoneSkin", "Shock", "Crackle", "LightningBolt", "WaterBall", "TidalBall"],
		// Legs
		["Ignite", "Fissure", "Sleet", "BoulderLaunch", "BigBoulderLaunch", "Earthform", "EarthformRing", "EarthformMound", "EarthformLine", "EarthformArc", "BoulderKick", "Volcanism", "FlameRune", "FreezeRune", "LightningRune",],
		// Passive
		["FlameBlade", "Burning", "TemperaturePlay", "Strength", "Shatter", "IcePrison", "LightningRod"],
	],

	//Page 2: Conjuration
	[
		// Verbal
		["TelekineticSlash", "KineticLance", "CommandWord", "CommandWordGreater", "CommandDisenchant", "CommandRelease", "CommandCapture", "CommandBind", "CommandVibrate", "CommandOrgasm", "ZoneOfExcitement", "Lockdown", "Chastity", "ZoneOfPurity", "Blink", "TransportationPortal", "BanishPortal", "Bomb", "RopeBoltLaunch", "RopeBoltLaunchMany", "EnchantRope", "RopeStrike", "Leap", "Leap2", "Leap3", "CommandSlime", "Spread", "Awaken", "Animate", "AnimateLarge", "AnimatePuppet", "Coalesce", "FireElemental", "AirMote"],
		// Arms
		["RecoverObject", "RecoverObject2", "TickleCloud", "FeatherCloud", "Swap", "ChainBolt", "SteelRainPlug", "SteelRainBurst", "DisplayStand", "SummonGag", "SummonAMGag", "SummonLatexGag", "SummonBlindfold", "SummonCuffs", "SummonLeatherCuffs", "SummonArmbinder", "SummonStraitjacket", "SummonLatexArmbinder", "SummonLegbinder", "SummonLatexLegbinder", "SummonHarness", "Petsuit", "SlimeBall", "ElasticGrip", "WaterMote"],
		// Legs
		["NegateRune", "Sagitta", "Snare", "Wall", "Quickness", "Quickness2", "Quickness3", "Quickness4", "Quickness5", "SlimeSplash", "Slime", "SlimeEruption", "SlimeWall", "SlimeWallVert", "LatexWallVert", "SlimeWallHoriz", "LatexWallHoriz", "LatexWall", "SlimeToLatex", "LiquidMetal", "LiquidMetalBurst", "Ally", "NatureSpirit", "StormCrystal", "EarthMote", "Golem"],
		// Passive
		["CommandRange", "Psychokinesis", "KineticMastery", "SagittaAssault", "Frustration", "ChainStrike", "Ropework", "LeatherBurst", "LeatherWhip", "OneWithSlime", "SlimeWalk", "SlimeMimic", "Engulf"],
	],

	//Page 3: Illusion
	[
		// Verbal
		["Flash", "GreaterFlash", "FocusedFlash", "Heal", "Heal2", "ShadowWarrior", "Shroud", "Invisibility", "GreaterInvisibility", "Sonar"],
		// Arms
		["ShadowBlade", "ShadowSlash", "Dagger", "TrueSteel", "Ring", "Light", "Corona"],
		// Legs
		["HolyOrb", "ShadowDance", "Evasion", "Camo", "Decoy"],
		// Passive
		["Analyze", "TheShadowWithin", "TrueSight", "EnemySense"],
	],

];

/**
 * @param page
 * @param list
 */
function KDDefineSpellPage(page: string, list: string[][]) {
	KinkyDungeonSpellPages.push(page);
	KinkyDungeonLearnableSpells.push(list);
}


/**
 * Spells that the player can choose
 */
let KinkyDungeonSpellList: Record<string, spell[]> = { // List of spells you can unlock in the 3 books. When you plan to use a mystic seal, you get 3 spells to choose from.
	"Any": [
		KDBondageSpell,
		KDZeroResistanceSpell,

		{name: "AllyCommand", tags: ["utility"], school: "Any", spellPointCost: 1, learnPage: ["Command"],
			hideLearned: true,
			autoLearn: [
				"AllyToggle",
				"AllyAttention",
				"AllyDeselect",
				"AllyMove",
				"AllyOnMe",
				"AllyDisperse",
				"AllyAggressive",
				"AllyDefensive",
				"AllyDeselectAll",
				"AllyHold",
				"AllyCancelHold",
			],
			manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "AllyToggle", tags: ["utility"], prerequisite: "AllyCommand", quick: true, school: "Any", manacost: 0, components: [], level:1, spellPointCost: 0, type:"special", special: "AllyToggle", noMiscast: true,
			onhit:"", time:25, power: 0, range: 10, size: 1, damage: ""},
		{name: "AllyAttention", tags: ["utility"], prerequisite: "AllyCommand", quick: true, school: "Any", manacost: 0, components: [], aoe: 1.5, level:1, spellPointCost: 0, type:"special", special: "AllyAttention", noMiscast: true,
			onhit:"", time:25, power: 0, range: 10, size: 1, damage: ""},
		{name: "AllyDeselect", tags: ["utility"], prerequisite: "AllyCommand", quick: true, school: "Any", manacost: 0, components: [], aoe: 1.5, level:1, spellPointCost: 0, type:"special", special: "AllyDeselect", noMiscast: true,
			onhit:"", time:25, power: 0, range: 10, size: 1, damage: ""},
		{name: "AllyMove", tags: ["utility"], prerequisite: "AllyCommand", quick: true, school: "Any", manacost: 0, components: [], level:1, spellPointCost: 0, type:"special", special: "AllyMove", noMiscast: true,
			onhit:"", time:25, power: 0, range: 10, size: 1, damage: ""},

		{name: "AllyOnMe", tags: ["utility", "defense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyOnMe", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyDisperse", tags: ["utility", "defense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyDisperse", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyDefensive", tags: ["utility", "defense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyDefensive", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyAggressive", tags: ["utility", "defense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyAggressive", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyHold", tags: ["utility", "defense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyHold", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyCancelHold", tags: ["utility", "offense"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyCancelHold", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "AllyDeselectAll", tags: ["utility"], prerequisite: "AllyCommand", quick: true, school: "Any",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			events: [
				{type: "AllyDeselectAll", trigger: "toggleSpell", },
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "DesperateStruggle", tags: ["will", "utility"], school: "Any",
			spellPointCost: 1,
			customCost: "DesperateStruggle",
			manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "DesperateStruggle", trigger: "toggleSpell", power: 0.5, dist: 7, time: 3, cost: 2},
			]},


		{name: "LeashSkill", color: "#e64539", noMiscast: true, spellPointCost: 1, school: "Any",
			staminacost: 1,
			sfx: "Miss", manacost: 0, components: ["Arms"], level:1, type:"special", special: "LeashSpell",
			onhit:"", power: 0, delay: 0, range: 1.5, damage: "chain", speed: 2},

		{name: "SPUp1", school: "Any", hide: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "WPUp1", school: "Any", hide: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "APUp1", hide: true, school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "APUp2", hide: true, school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "APUp3", hide: true, school: "Any", manacost: 0, components: [], level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "MPUp1", hide: true, school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "MPUp2", hide: true, school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "MPUp3", hide: true, school: "Any", manacost: 0, components: [], level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SummonUp1", tags: ["upgrade"], hideLearned: true, hideUnlearnable: true, school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SummonUp2", tags: ["upgrade"], hideLearned: false, hideUnlearnable: true, prerequisite: "SummonUp1", school: "Any", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "OrgasmResist", tags: ["will", "utility"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "OrgasmResistBuff", trigger: "tick"},
				{type: "OrgasmResist", trigger: "calcInvolOrgasmChance", power: 0},
				{type: "ChangeEdgeDrain", trigger: "calcEdgeDrain", mult: 0.3},
				{type: "Buff", trigger: "tick", power: 1.0, buffType: "soulDamageResist"},
				{type: "Buff", trigger: "tick", power: 1.0, buffType: "charmDamageResist"},
			]},

		{name: "Athlete", tags: ["stamina", "utility"], school: "Any", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.67, buffType: "SprintEfficiency"},
		]},
		{name: "Sneaky", tags: ["buff", "utility"], school: "Any", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.5, prereq: "Waiting", buffType: "Sneak", mult: 1, tags: ["SlowDetection", "move", "cast"]},
		]},
		{name: "Evasive1", tags: ["buff", "defense"], school: "Any", spellPointCost: 1, hideLearned: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.1, buffType: "Evasion"},
		]},
		{name: "Evasive2", tags: ["buff", "defense"], school: "Any", spellPointCost: 1, hideLearned: true, prerequisite: "Evasive1", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.15, buffType: "Evasion"},
		]},
		{name: "Evasive3", tags: ["buff", "defense"], school: "Any", spellPointCost: 1, prerequisite: "Evasive2", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.25, buffType: "Evasion"},
		]},

		{name: "Accurate1", tags: ["buff", "offense"], school: "Any", spellPointCost: 1, hideLearned: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.1, buffType: "Accuracy"},
		]},
		{name: "Accurate2", tags: ["buff", "offense"], school: "Any", spellPointCost: 1, hideLearned: true, prerequisite: "Accurate1", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.15, buffType: "Accuracy"},
		]},
		{name: "Accurate3", tags: ["buff", "offense"], school: "Any", spellPointCost: 1, prerequisite: "Accurate2", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.25, buffType: "Accuracy"},
		]},


		{name: "PhysDamage", tags: ["buff", "offense", "will"], school: "Any", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.2, buffType: "meleeDamageBuff"},
		]},



		{name: "CriticalStrike", tags: ["damage", "offense", "buff"], school: "Any", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			//{trigger: "beforePlayerAttack", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
			//{trigger: "calcDisplayDamage", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
			{trigger: "calcCrit", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
		]},
		{name: "MagicalOverload", tags: ["damage", "offense", "buff"], school: "Special", classSpecific: "Trainee", prerequisite: "DistractionCast", hideWithout: "DistractionCast", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{trigger: "calcCrit", type: "MagicalOverload", prereq: "damageType", kind: "magic", power: 0.25},
		]},
		{name: "CriticalStrikeMagic", tags: ["damage", "offense", "buff"], school: "Any", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			//{trigger: "beforePlayerAttack", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
			//{trigger: "calcDisplayDamage", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
			{trigger: "calcCrit", type: "CritBoost", prereq: "damageType", kind: "magic", power: 0.5},
		]},
		{name: "Vault", tags: ["damage", "utility", "buff"], prerequisite: "Evasive1", school: "Any", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{trigger: "canSprint", type: "VaultBasic"},
		]},
		{name: "VaultAdv", tags: ["damage", "utility", "buff"], prerequisite: "Vault", school: "Any", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{trigger: "canSprint", type: "Vault"},
		]},
		{name: "IronWill", tags: ["will", "defense"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "IronWill", trigger: "calcMaxStats", power: 0.4},
		]},
		{name: "SteadfastGuard", tags: ["will", "defense"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "SteadfastGuard", trigger: "calcMaxStats", mult: 0.5, power: 5, },
		]},
		{name: "WillStruggle", tags: ["will", "utility"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "WillStruggle", mult: 0.01, power: 5, StruggleType: "Struggle", trigger: "beforeStruggleCalc", msg: "KinkyDungeonSpellWillStruggleMsg"},
		]},
		{name: "Riposte", tags: ["will", "offense"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Riposte", trigger: "blockPlayer"},
		]},
		{name: "Parry", tags: ["will", "defense"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Parry", power: 0.15, trigger: "tick"},
		]},
		{name: "GuardBoost", tags: ["defense"], prerequisite: "WillParry", school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "GuardBoost", trigger: "tick"},
		]},
		{name: "WillParry", tags: ["defense"], prerequisite: "Parry", school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "WillParry", mult: 0.005, trigger: "tick"},
		]},
		{name: "SteelParry", tags: ["defense"], prerequisite: "WillParry", school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "SteelParry", mult: 0.005, trigger: "tick"},
		]},
		{name: "DaggerParry", tags: ["defense"], prerequisite: "Parry", school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "DaggerParry", power: 0.15, trigger: "tick"},
		]},
		{name: "StaffUser1", tags: ["utility"], school: "Any", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "StaffUser1", trigger: "calcMultMana", power: 0.8},
		]},
		{name: "ManaPoolUp", tags: ["utility"], hideUnlearnable: true, school: "Any", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0.5, damage: "inert", events: [
			{type: "IncreaseManaPool", trigger: "calcMaxStats", power: 10},
		]},
		{name: "StaffUser3", tags: ["utility"], prerequisite: "StaffUser1", school: "Any", manacost: 0, components: [], level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "StaffUser3", trigger: "calcMultMana", power: 0.75},
		]},
	],
	"Special": [
		{name: "Offhand", tags: ["utility", "defense", "offense"], quick: true, school: "Special", prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			mixedPassive: true,
			events: [
				{type: "Offhand", trigger: "toggleSpell", },
				{type: "Offhand", trigger: "draw", always: true,},
				{type: "Offhand", trigger: "tick", always: true,},
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "UnconventionalWarfare", tags: ["utility", "defense", "offense"], quick: true, school: "Special", prerequisite: "CombatTraining", classSpecific: "Fighter", hideWithout: "BattleRhythm",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"passive", defaultOff: true,
			mixedPassive: true,
			events: [
				{type: "UnconventionalWarfare", trigger: "toggleSpell", },
				{type: "UnconventionalWarfare", trigger: "calcDamage", always: true, delayedOrder: 2},
				{type: "UnconventionalWarfare", trigger: "getWeapon", always: true, delayedOrder: 2},
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

		{name: "GuerillaFighting", tags: ["utility", "defense", "offense"], school: "Special", prerequisite: "RogueTargets", classSpecific: "Rogue", hideWithout: "RogueTargets",
			manacost: 0, components: [], level:1, spellPointCost: 0, type:"", passive: true,
			events: [
				{type: "GuerillaFighting", trigger: "calcDamage", always: true, delayedOrder: 1},
				{type: "GuerillaFighting", trigger: "getWeapon", always: true, delayedOrder: 1},
			],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},



		{name: "RogueOffhand", tags: ["utility", "defense", "offense"], school: "Special", prerequisite: "RogueTargets", classSpecific: "Rogue", hideWithout: "RogueTargets",
			hideLearned: true, hideWith: "Offhand",
			events: [
				{trigger: "canOffhand", type: "RogueOffhand"},
			],
			manacost: 0, components: [], level:1, spellPointCost: 1, type:"", passive: true, autoLearn: ["Offhand"],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},
		{name: "WizardOffhand", tags: ["utility", "defense", "offense"], school: "Special", prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen",
			hideLearned: true, hideWith: "Offhand",
			events: [
				{trigger: "canOffhand", type: "WizardOffhand"},
				{trigger: "tick", type: "WizardOffhand"},
			],
			manacost: 0, components: [], level:1, spellPointCost: 1, type:"", passive: true, autoLearn: ["Offhand"],
			onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},
		{name: "RogueTargets", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", prerequisite: "Null", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			//{type: "RogueTargets", trigger: "tick"},
			//{type: "RogueTargets", trigger: "postQuest"},
			//{type: "RogueTargets", trigger: "kill"},
			//{type: "RogueTargets", trigger: "draw"},
			{type: "RogueTargets", trigger: "duringCrit", mult: 1.5},
		]},
		{name: "RogueBind", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", prerequisite: "RogueTargets", hideWithout: "RogueTargets", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "RogueBind", trigger: "duringCrit"},
			{type: "RogueBind", trigger: "calcBindCrit", power: 0.4},
		]},
		{name: "RogueTraps", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", prerequisite: "RogueTargets", hideWithout: "RogueTargets", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "RogueTraps", trigger: "beforeCast"},
		]},
		{name: "RogueTraps2", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", prerequisite: "RogueTraps", hideWithout: "RogueTargets", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "RogueTraps2", trigger: "beforeCrit"},
		]},
		{name: "RogueEscape", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", prerequisite: "RogueTargets", hideWithout: "RogueTargets", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "RogueEscape", trigger: "postApply", power: 2, time: 12},
			{type: "RogueEscape", trigger: "affinity", dist: 1.5},
		]},


		{name: "ProblemSolving", tags: ["utility", "defense", "evasion"], school: "Special", manacost: 0, components: [],
			classSpecific: "Rogue", prerequisite: "RogueTargets", hideWithout: "RogueTargets", level:1,
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
				{type: "ProblemSolving", mult: 0.2, power: 0.4, trigger: "beforeStruggleCalc", msg: "KinkyDungeonSpellProblemSolvingMsg"},
				//{type: "ProblemSolving", mult: 0.2, power: 0.25, trigger: "beforeStruggleCalc", msg: "KinkyDungeonSpellProblemSolvingMsg"},
			]},
		{name: "EvasiveManeuvers", tags: ["utility", "defense", "evasion"], school: "Special", manacost: 0, components: [],
			defaultOff: true,
			classSpecific: "Rogue", prerequisite: "RogueTargets", hideWithout: "RogueTargets", level:1, customCost: "evasive",
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
				{type: "EvasiveManeuvers", trigger: "tickAfter"},
				{type: "EvasiveManeuvers", trigger: "calcPlayerEvasionEvent"},
				{type: "EvasiveManeuvers", trigger: "toggleSpell"},
			]},


		{name: "RogueStudy", tags: ["utility"], school: "Special", manacost: 0, components: [], classSpecific: "Rogue", learnFlags: ["AdvTooltips"], prerequisite: "ToolsOfTheTrade", hideWithout: "RogueTargets", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Multiply", trigger: "calcHearing", mult: 1.15},
		]},
		{name: "ToolsOfTheTrade", tags: ["will", "mana", "utility"], prerequisite: "RogueTargets", classSpecific: "Rogue", hideWithout: "RogueTargets", school: "Special",
			manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ToolsOfTheTrade", trigger: "toggleSpell"},
			]},

		{name: "Peasant", tags: ["plant", "offense"], school: "Special", manacost: 0, components: [], classSpecific: "Peasant", prerequisite: "Null", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Peasant", trigger: "beforeDamageEnemy", mult: 1.2},
		]},
		{name: "Sowing", tags: ["plant", "utility"], prerequisite: "Peasant", classSpecific: "Peasant", hideWithout: "Peasant", school: "Special", manacost: 0, components: [], level:1,
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Sowing", trigger: "kill"},
			]},

		{name: "ArcaneBlast", tags: ["arcane", "offense", "aoe"], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", noise: 4.5, sfx: "Shock", castCondition: "hasArcaneEnergy",
			customCost: "arcane_blast",
			effectTileDurationModTrail: 2, effectTileTrail: {
				name: "Sparks",
				duration: 3,
			},
			events: [
				{type: "ArcaneStore", trigger: "spellTrigger"},
				{type: "ArcaneStore", trigger: "playerCast"},
				{type: "ArcaneBlast", trigger: "playerCast", mult: 0.25},
			],
			school: "Special", manacost: 1, components: [], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 0.0, delay: 0, time: 1, range: 8, speed: 8, size: 1, damage: "arcane",
			trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0},



		{name: "StaffUser2", tags: ["utility"], school: "Special", prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0.5, damage: "inert", events: [
			{type: "IncreaseManaPool", trigger: "calcMaxStats", power: 40},
		]},

		{name: "ArcaneBarrier", tags: ["arcane", "will", "utility"], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", school: "Special", manacost: 0, components: [], level:1,
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			mixedPassive: true,
			events: [
				{type: "ArcaneStore", trigger: "spellTrigger", always: true},
				{type: "ArcaneStore", trigger: "playerCast", always: true},
				//{type: "ArcaneEnergyBondageResist", trigger: "tick", power: 200, mult: 4},
				//{type: "ArcaneBarrier", trigger: "duringPlayerDamage", power: 0},
				{type: "ArcaneBarrier", trigger: "tick", mult: 0.5, power: 1, count: 5},
			]},


		{name: "BattleRhythm", tags: ["fight", "will", "stamina"], prerequisite: "Null", hideUnlearnable: true, school: "Special",
			manacost: 0, components: [], level:1,
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			mixedPassive: true,
			events: [
				{type: "BattleRhythmStore", trigger: "beforePlayerLaunchAttack", always: true},
				{type: "BattleRhythm", trigger: "doAttackCalculation"},
				{type: "BREvasionBlock", trigger: "tick", mult: 0.1, power: 0.1},
				{type: "BRDecay", trigger: "tick", power: 0.01, always: true,},
			]},

		{name: "BattleTrance", tags: ["fight", "will", "stamina"], prerequisite: "Enrage", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1,
			type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "BattleTrance", trigger: "afterPlayerAttack",},
				{type: "BattleTrance", trigger: "tick",},
			]},

		{name: "CombatManeuver", tags: ["fight", "will", "stamina"], prerequisite: "BattleTrance",
			classSpecific: "Fighter",
			hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1,
			type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			passive: true,
			events: [
			]},

		{name: "Gunslinger", tags: ["fight", "will", "ranged", "offense"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1,
			type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", passive: true,
			events: [
				{type: "Gunslinger", trigger: "afterChangeCharge", mult: 0.2},
			]},

		{name: "Enrage", tags: ["will", "defense"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", staminacost: 8,
			customCost: "Enrage", manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Enrage", trigger: "toggleSpell", power: 10, time: 100, dist: 12},
			]},

		{name: "BladeDance", tags: ["stamina", "utility", "offense"], school: "Special", prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", sfx: "Miss", spellPointCost: 1,
			events: [
				{trigger: "afterBulletHit", type: "BladeDance", dist: 1.5, power: 0.5, mult: 0.75, prereq: "wepDamageType", kind: "melee"},
			],
			noMiscast: true,
			staminacost: 6,
			manacost: 0, components: ["Legs"], noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 0, lifetime:1, range: 1.5, damage: ""}, // A quick blink


		{name: "Charge", tags: ["stamina", "utility", "offense"], school: "Special", prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", manacost: 0, customCost: "SprintPlusAttack", components: [], level:1, type:"special", special: "Charge", noMiscast: true,
			onhit:"", time:25, power: 0, range: 2.99, size: 1, damage: ""},

		{name: "RaiseDefenses", tags: ["stamina", "defense"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special",
			staminacost: 9, manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "RaiseDefenses", trigger: "toggleSpell", mult: 1.0, time: 10},
			]},
		{name: "BreakFree", tags: ["will", "defense"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special",
			customCost: "BreakFree", manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "BreakFree", trigger: "toggleSpell", mult: 0.01, power: 0.2, time: 60, cost: .20},
			]},


		{name: "LimitSurge", tags: ["will", "stamina", "utility"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", customCost: "LimitSurge", manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "LimitSurge", trigger: "toggleSpell", power: 5.0, mult: 1.0, time: 2},
			]},

		{name: "CombatTraining", tags: ["will", "stamina", "utility"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1, type:"", passive: true, onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "CombatTraining", trigger: "attackCost", power: 0.4, mult: 0.01},
				{type: "CombatTrainingSlowResist", trigger: "tick"},
				{type: "CombatTrainingSlowRecovery", trigger: "tickAfter"},
			]},

		{name: "BattleCrit", tags: ["will", "stamina", "offense"], prerequisite: "Gunslinger", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1, type:"", passive: true, onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{trigger: "calcCrit", type: "BattleCrit", mult: 0.01},
			]},

		{name: "BattleCost", tags: ["will", "stamina", "offense"], prerequisite: "BattleRhythm", classSpecific: "Fighter", hideWithout: "BattleRhythm", school: "Special", manacost: 0, components: [], level:1, type:"", passive: true, onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{trigger: "beforePlayerLaunchAttack", type: "BattleCost", mult: 0.01},
			]},


		{name: "SecondWind0", tags: ["mana", "utility"], school: "Special", manacost: 0, components: [], prerequisite: "Null", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SecondWind1", tags: ["mana", "utility"], spellPointCost: 2, school: "Special", manacost: 0, components: [], prerequisite: "SecondWind0", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "NovicePet0", tags: ["mana", "utility"], school: "Special", manacost: 0, components: [], prerequisite: "Null", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "NovicePet1", tags: ["mana", "utility"], spellPointCost: 1, school: "Special", manacost: 0, components: [], hideLearned: true, prerequisite: "NovicePet0", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "NovicePet2", tags: ["mana", "utility"], spellPointCost: 1, school: "Special", manacost: 0, components: [], hideLearned: true, prerequisite: "NovicePet1", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "NovicePet3", tags: ["mana", "utility"], spellPointCost: 1, school: "Special", manacost: 0, components: [], prerequisite: "NovicePet2", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "NovicePetX", tags: ["mana", "utility"], spellPointCost: 3, school: "Special", manacost: 0, components: [], hideLearned: true, prerequisite: "NovicePet3", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},



		{name: "ManaRegen", tags: ["mana", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Mage", prerequisite: "Null", hideUnlearnable: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0,
			decreaseCost:true, range: 0, lifetime: 0, power: 0, damage: "inert", events: [

				{type: "ManaRegenSuspend", trigger: "afterPlayerCast", time:16},
				{type: "ManaRegenSuspend", trigger: "afterSpellTrigger", time:16},
				{type: "ManaRegenSuspend", trigger: "playerAttack", time:16},
				//{type: "ManaRegenOld", trigger: "tick", mult: 0.2, power: 0.5},
				{type: "ManaRegen", trigger: "beforeMultMana", mult: 0.2},
			]},
		{name: "ManaRegenPlus", tags: ["mana", "offense"], school: "Special", manacost: 0, components: [], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",},
		{name: "ManaRegenPlus2", tags: ["mana", "offense"], school: "Special", manacost: 0, components: [], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",},
		{name: "ManaRegenFast", spellPointCost: 1, tags: ["mana", "offense"], school: "Special", manacost: 0, components: [], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", hideLearned: true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",},
		{name: "ManaRegenFast2", spellPointCost: 2, tags: ["mana", "offense"], school: "Special", manacost: 0, components: [], prerequisite: "ManaRegenFast", classSpecific: "Mage", hideWithout: "ManaRegen", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",},

		{name: "ManaHarvesting", tags: ["mana", "offense"], school: "Special", manacost: 0, components: [], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen",
			level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ArcaneStore", trigger: "spellTrigger", always: true},
				{type: "ArcaneStore", trigger: "playerCast", always: true},
				{type: "ManaHarvesting", trigger: "kill", always: true},
			]
		},



		{name: "AkashicConflux", tags: ["will", "mana", "utility"], prerequisite: "ArcaneBlast", classSpecific: "Mage", hideWithout: "ManaRegen", school: "Special",
			customCost: "arcane_akashic",
			manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ArcaneStore", trigger: "spellTrigger"},
				{type: "ArcaneStore", trigger: "playerCast"},
				{type: "AkashicConflux", trigger: "toggleSpell", power: 10.0, time: 3},
			]},

		{name: "ChaoticOverflow", tags: ["will", "mana", "utility"], castCondition: "requireCrystallable", prerequisite: "DistractionCast", hideWithout: "DistractionCast", school: "Special", manacost: 0, components: [], defaultOff: true, time: 10, level:1, type:"passive", onhit:"", delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ChaoticOverflow", trigger: "toggleSpell", time: 10, mult: 0.25},
			]},


		{name: "DistractionShield", tags: ["will", "defense"], prerequisite: "DistractionCast", hideWithout: "DistractionCast", school: "Special", manacost: 2.5, components: [], defaultOff: true, time: 10, level:1, type:"passive", onhit:"", delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "DistractionShield", trigger: "toggleSpell", power: 0.5, mult: 0.1, time: 10}, // power: shield per DP, mult: percentage gained as Desire
			]},

		{name: "DistractionBurst", tags: ["will", "offense"], prerequisite: "OrgasmMana1", hideWithout: "DistractionCast", school: "Special", manacost: 7, components: [], defaultOff: true, time: 10, level:1, type:"passive", onhit:"", delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "DistractionBurst", trigger: "toggleSpell", mult: 0.25, power: 3, aoe: 2.99, crit: 2, damage: "charm"},
			]},

		{name: "ManaRecharge", tags: ["will", "mana", "utility"], prerequisite: "ManaRegen", classSpecific: "Mage", hideWithout: "ManaRegen", school: "Special", manacost: 0, components: [], defaultOff: true, level:1, type:"passive", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ManaRecharge", trigger: "toggleSpell", power: 8.0, mult: 0.1, damage: "soul", count: 3},
			]},

		{name: "DistractionCast", tags: ["will", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Trainee", prerequisite: "Null", hideUnlearnable: true, decreaseCost:true, level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "DistractionCast", trigger: "calcMiscast"},
			{type: "DistractionCast", trigger: "tick"},
			{type: "DistractionCast", trigger: "playerCast"},
		]},
		{name: "OrgasmMana1", tags: ["will", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Trainee", prerequisite: "DistractionCast", hideWithout: "DistractionCast", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			blockedBy: ["EdgeMana1"], events: [
				{type: "RestoreOrgasmMana", trigger: "orgasm", power: 5.0},
			]},
		{name: "OrgasmBuff", tags: ["will", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Trainee", prerequisite: "OrgasmMana1", hideWithout: "DistractionCast", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "SatisfiedDamageBuff", trigger: "tick", power: 0.1},
				{type: "OrgasmDamageBuff", trigger: "orgasm", power: 0.4, time: 8},
			]},


		{name: "OrgasmFrequency", tags: ["will", "utility"], arousalMode: true, school: "Special", manacost: 0, components: [], level:1, hideLearned: true, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ChangeOrgasmStamina", trigger: "orgasm", mult: 0.3},
				{type: "ChangeSPCost", trigger: "tryOrgasm", mult: 0.5},
			]},
		{name: "OrgasmFrequency2", tags: ["will", "utility"], arousalMode: true, school: "Special", prerequisite: "OrgasmFrequency", hideUnlearnable: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "ChangeOrgasmStamina", trigger: "orgasm", mult: 0.1},
				{type: "ChangeSPCost", trigger: "tryOrgasm", mult: 0.5},
				{type: "ChangeWPCost", trigger: "tryOrgasm", mult: 0.5},
			]},
		{name: "EdgeMana1", tags: ["will", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Trainee", prerequisite: "DistractionCast", hideWithout: "DistractionCast", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			blockedBy: ["OrgasmMana1"], events: [
				{type: "RestoreEdgeMana", trigger: "tick", power: 0.1},
				{type: "EdgeRegenBoost", trigger: "calcManaPool", power: 0.04},
				//{type: "RestoreDenyMana", trigger: "deny", power: 4.0},
			]},
		{name: "DenyMana", tags: ["will", "utility"], school: "Special", manacost: 0, components: [], classSpecific: "Trainee", prerequisite: "EdgeMana1", hideWithout: "DistractionCast", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "RestoreDenyMana", trigger: "deny", power: 4.0},
			]},
	],
	"Elements": [
		{goToPage: 4, name: "ApprenticeFire", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Firebolt"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 4, name: "ApprenticeWater", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["WaterBall"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 4, name: "ApprenticeEarth", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["StoneSkin"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 4, name: "ApprenticeAir", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["WindBlast"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 4, name: "ApprenticeLightning", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Electrify"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Buff", trigger: "tick", power: 0.5, buffType: "blindResist"},
			],},
		{goToPage: 4, name: "ApprenticeIce", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Freeze"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "Earthform", tags: ["earth", "utility", "summon"], autoLearn: ["EarthformRing", "EarthformMound", "EarthformLine", "EarthformArc"], prerequisite: "ApprenticeEarth", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "BoulderKick", tags: ["earth", "offense", "utility"], sfx: "HeavySwing", school: "Elements", prerequisite: "Earthform", manacost: 1, components: [], level:1, type:"special", special: "BoulderKick", noMiscast: true,
			onhit:"", power: 4.0, range: 1.5, size: 1, damage: ""},
		{name: "Volcanism", tags: ["earth", "fire", "offense"], sfx: "FireSpell", school: "Elements", prerequisite: "Earthform", manacost: 6, components: [], level:1, type:"special", special: "Volcanism", noMiscast: true,
			filterTags: ["summonedRock"], onhit:"", power: 6.0, range: 5.99, aoe: 2.5, size: 1, damage: ""},
		{name: "EarthformRing", secret: true, tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, minRange: 0, landsfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 4, components: ["Legs"], prerequisite: ["Earthform"],
			level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", faction: "Rock", count: 30, minRange: 2.5, time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 2.5, size: 1, aoe: 3.99, lifetime: 1, damage: "inert",
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}, effectTileDensity: 0.3},
		{name: "EarthformMound", secret: true, tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, minRange: 0, landsfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 3, components: ["Legs"], prerequisite: ["Earthform"],
			level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", count: 9, faction: "Rock", time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 4, size: 1, aoe: 1.5, lifetime: 1, damage: "inert",
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}},
		{name: "EarthformArc", secret: true, tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, minRange: 0, landsfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 2.5, components: ["Legs"], prerequisite: ["Earthform"],
			aoetype: 'arc',
			spellPointCost: 0,
			level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", count: 9, faction: "Rock", time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 3.5, size: 1, aoe: 2.5, lifetime: 1, damage: "inert",
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}},

		{name: "EarthformLine", secret: true, tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, sfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 2, components: ["Legs"], level:1, type:"bolt", prerequisite: ["Earthform"],
			piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 3, delay: 0, range: 4.99, speed: 7, size: 1, damage: "inert",
			trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0, trailOnSelf: true,
			trailcast: {spell: "EarthformSingle", target: "onhit", directional:true, offset: false},
			effectTileDurationModTrail: 40, effectTileTrail: {
				name: "Cracked",
				duration: 100,
			},
		},


		{name: "TemperaturePlay", tags: ["fire", "ice", "offense"], prerequisite: ["ApprenticeIce", "ApprenticeFire"], school: "Elements", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "TemperaturePlay", trigger: "beforeDamageEnemy", power: 0.3},
		]},

		{name: "Burning", tags: ["fire", "offense"], prerequisite: "ApprenticeFire", school: "Elements", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Burning", trigger: "beforeDamageEnemy", damage: "fire"},
		]},
		{name: "IcePrison", tags: ["ice", "offense"], prerequisite: "ApprenticeIce", school: "Elements", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "IcePrison", trigger: "afterDamageEnemy"},
		]},
		{name: "LightningRod", tags: ["electric", "air", "defense", "utility"], prerequisite: "ApprenticeLightning", school: "Elements", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "LightningRod", trigger: "playerCast", power: 3.0},
		]},
		{name: "Incinerate", prerequisite: "Firecracker", tags: ["fire", "aoe", "dot", "offense", "denial"], noUniqueHits: true, noise: 3, landsfx: "FireSpell", school: "Elements", manacost: 8,
			upcastFrom: "Firecracker", upcastLevel: 1, hitSpin: 1,
			pierceEnemies: true,
			hideWarnings: true,
			components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 1, power: 2.5, range: 2.5, size: 3, aoe: 1.5, lifetime: 6, damage: "fire", playerEffect: {name: "Damage"},
			effectTileDurationMod: 12, effectTile: {
				name: "Ember",
				duration: -6,
			}
		},

		{name: "Tremor", prerequisite: "ApprenticeEarth", tags: ["earth", "offense", "utility"], sfx: "Telekinesis", school: "Elements", manacost: 2, components: ["Verbal"], level:1,
			type:"hit", onhit:"instant", evadeable: true, noblock: true, time:8, power: 2, range: 3.99, size: 3, lifetime: 1, aoe: 1.5, damage: "crush",
			events: [{trigger: "beforeDamageEnemy", type: "MakeVulnerable", time: 2}],
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}, effectTileDensity: 0.5,
		},

		{name: "Earthquake", prerequisite: "Tremor", landsfx: "Telekinesis", school: "Elements", manacost: 9, components: ["Verbal"], level:1, type:"inert", onhit:"cast",
			upcastFrom: "Tremor", upcastLevel: 2,
			dot: true, time: 4, delay: 6, range: 2.99, size: 5, aoe: 1.5, lifetime: 1, power: 1, damage: "inert", noEnemyCollision: true, noTerrainHit: true,
			spellcasthit: {spell: "Tremor", target: "onhit", chance: 1.0, countPerCast: 2, directional:false, offset: false}, channel: 7},

		{name: "Firecracker", prerequisite: "ApprenticeFire", landsfx: "Lightning", tags: ["fire", "aoe", "offense"], noUniqueHits: true, noise: 7, sfx: "FireSpell", school: "Elements", manacost: 4,
			components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 1, power: 3.5, range: 3.99, size: 3, aoe: 1, lifetime: 1, damage: "fire", playerEffect: {name: "Damage"},
			effectTileDurationMod: 8, effectTile: {
				name: "Ember",
				duration: -4,
			}
		},


		{name: "Hailstorm", color: "#92e8c0", prerequisite: "ApprenticeIce", tags: ["ice", "aoe", "dot", "offense", "utility", "denial"], noUniqueHits: true, noise: 3, sfx: "FireSpell", school: "Elements", manacost: 7,
			components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 1, power: 1.0, time: 2, range: 2.5, size: 3, aoe: 1.5, lifetime: 8, damage: "frost", playerEffect: {name: "Damage"},
			pierceEnemies: true,
			effectTileDurationMod: 12, effectTile: {
				name: "Ice",
				duration: -6,
			}
		},
		{name: "Rainstorm", prerequisite: "ApprenticeWater", tags: ["water", "soap", "aoe", "dot", "offense", "utility", "denial"], noUniqueHits: true, noise: 3, sfx: "FireSpell", school: "Elements", manacost: 4.5,
			components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 3, power: 3.5, time: 2, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "soap",
			pierceEnemies: true,
			effectTileDurationMod: 8, effectTile: {
				name: "Water",
				duration: 14,
			}
		},
		{name: "FlashFreeze", color: "#92e8c0", tags: ["ice", "utility", "offense", "aoe"], prerequisite: "Freeze", sfx: "Freeze", school: "Elements", manacost: 5, components: ["Verbal"],
			level:2, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 2.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "ice",
			events: [{type: "ElementalOnDrench", trigger: "bulletHitEnemy", damage: "ice", time: 8, power: 0.0},]},
		{name: "Sleet", color: "#92e8c0", tags: ["ice", "aoe", "dot", "offense", "denial"], prerequisite: "ApprenticeIce", effectTileDurationMod: 10,
			playerEffect: {name: "DamageIfChill", damage: "ice", power: 0.5},
			effectTile: {
				name: "Ice",
				duration: 20,
			}, hitSpin: 0.5, bulletSpin: 0.25, noUniqueHits: true, noblock: true, noise: 8, sfx: "FireSpell", school: "Elements", manacost: 10, components: ["Legs"], level:1, pierceEnemies: true,
			type:"inert", onhit:"aoe", delay: 1, power: 1, range: 4.5, size: 5, aoe: 2.9, lifetime: 15, time: 2, damage: "frost"},
		{name: "WindBlast", tags: ["air", "bolt", "offense", "utility"],
			prerequisite: "ApprenticeAir", sfx: "FireSpell", school: "Elements", manacost: 2.5, components: ["Arms"], level:1, type:"bolt",
			projectileTargeting:true, onhit:"", power: 1.0, time: 2, delay: 0, range: 2.99, damage: "stun", speed: 3, hitSpin: 1, bulletSpin: 1,
			pierceEnemies: true,
			shotgunCount: 3, shotgunDistance: 4, shotgunSpread: 3, shotgunSpeedBonus: 1,
			events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 1.0, dist: 1.0},]},
		{name: "Gust", tags: ["air", "bolt", "offense", "utility"],
			prerequisite: "ApprenticeAir", sfx: "FireSpell", school: "Elements", manacost: 4.5, components: ["Verbal"], level:1, type:"bolt",
			projectileTargeting:true, onhit:"", power: 1.5, delay: 0, range: 7.99, damage: "stun", speed: 1, hitSpin: 1, bulletSpin: 1,
			pierceEnemies: true,
			shotgunCount: 3, shotgunDistance: 8, shotgunSpread: .25, shotgunSpeedBonus: 2,
			events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 0.8, dist: 1.0},]},

		{name: "Firebolt", tags: ["fire", "bolt", "offense"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt",
			noise: 3,
			bulletColor: 0xb83716, bulletLight: 4,
			hitColor: 0xe64539, hitLight: 6,
			hideWarnings: true,
			projectileTargeting:true, onhit:"", power: 4.0, delay: 0, range: 50, damage: "fire", speed: 3, playerEffect: {name: "Damage"},
			effectTileDurationMod: 3, effectTile: {
				name: "Ember",
				duration: 3,
			}}, // Throws a fireball in a direction that moves 1 square each turn
		{name: "Fireblast", prerequisite: "Firebolt", tags: ["fire", "bolt", "aoe", "offense"], sfx: "FireSpell", school: "Elements", manacost: 5.5, components: ["Arms"], level:1,
			noise: 5, noDirectDamage: true,
			upcastFrom: "Firebolt", upcastLevel: 1,
			hideWarnings: true,
			bulletColor: 0xb83716, bulletLight: 6.5,
			hitColor: 0xe64539, hitLight: 8,
			landsfx: "Lightning",
			type:"bolt", projectileTargeting:true, onhit:"aoe", power: 6, delay: 0, range: 50, aoe: 1.5, size: 3, lifetime:1, damage: "fire", speed: 2, playerEffect: {name: "Damage"},
			effectTileDurationModTrail: 8, effectTileTrail: {
				name: "Ember",
				duration: 2,
			},
			effectTileDurationMod: 6, effectTile: {
				name: "Ember",
				duration: 5,
			}}, // Throws a fireball in a direction that moves 1 square each turn

		{name: "Fireball", prerequisite: "Fireblast", tags: ["fire", "bolt", "aoe", "offense"], sfx: "FireSpell", school: "Elements", manacost: 10, components: ["Arms"], level:1,
			noise: 8, noDirectDamage: true,
			upcastFrom: "Firebolt", upcastLevel: 2,
			bulletColor: 0xb83716, bulletLight: 8,
			hitColor: 0xe64539, hitLight: 11,
			landsfx: "Lightning",
			hideWarnings: true,
			type:"bolt", projectileTargeting:true, onhit:"aoe", power: 10, delay: 0, range: 50, aoe: 2.8, size: 5, lifetime:1, damage: "fire", speed: 1.5, playerEffect: {name: "Damage"},
			effectTileDurationModTrail: 12, effectTileTrail: {
				name: "Ember",
				duration: 4,
			},
			effectTileDurationMod: 8, effectTile: {
				name: "Ember",
				duration: 7,
			}}, // Throws a fireball in a direction that moves 1 square each turn

		{name: "Freeze", color: "#92e8c0", tags: ["ice", "utility", "offense"], prerequisite: "ApprenticeIce", sfx: "Freeze", school: "Elements", manacost: 3, components: ["Verbal"],
			effectTileDurationMod: 10, effectTile: {
				name: "Ice",
				duration: 20,
			},
			noise: 1.5,
			noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, time:6, power: 3, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "frost",
			events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 6, power: 0},]},
		{name: "Icebolt", tags: ["ice", "bolt", "offense"], prerequisite: "ApprenticeIce", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt",
			bulletColor: 0x92e4e8, bulletLight: 3,
			hitColor: 0x92e4e8, hitLight: 5,
			effectTileDurationMod: 10, effectTile: {
				name: "Ice",
				duration: 20,
			},
			projectileTargeting:true, onhit:"", time: 4,  power: 3.5, delay: 0, range: 50, damage: "frost", speed: 3, playerEffect: {name: "Chill", damage: "ice", power: 3, time: 3},
			events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 4, power: 0},]},
		{name: "Snowball", color: "#92e8c0", tags: ["ice", "bolt", "offense"], prerequisite: "ApprenticeIce", sfx: "Freeze", hitsfx: "LesserFreeze", school: "Elements", manacost: 5, components: ["Arms"], level:1, type:"bolt",
			noise: 5,
			bulletColor: 0x92e4e8, bulletLight: 6,
			projectileTargeting:true, onhit:"lingering", time: 3,  power: 2.0, delay: 0, lifetime: 6, lifetimeHitBonus: 2, range: 50, aoe: 2.5, damage: "frost", speed: 3, playerEffect: {name: "Damage"},
			effectTileDurationMod: 2, effectTile: {
				name: "Ice",
				duration: 6,
			}, effectTileDensity: 0.5},
		{name: "IceLance", color: "#92e8c0", tags: ["ice", "bolt", "offense", "aoe"], prerequisite: "Icicles", sfx: "Lightning", hitsfx: "Freeze", school: "Elements", pierceEnemies: true,
			noise: 4,
			upcastFrom: "Icicles", upcastLevel: 2,
			manacost: 7, components: ["Arms"], level:1, type:"bolt",
			bulletColor: 0x92e4e8, bulletLight: 4,
			hitColor: 0x92e4e8, hitLight: 7,
			effectTileDurationModTrail: 10, effectTileTrail: {
				name: "Ice",
				duration: 20,
			},
			projectileTargeting:true, onhit:"", time: 3,  power: 10, delay: 0, range: 50, damage: "frost", speed: 6, playerEffect: {name: "Damage"},
			events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 3, power: 0},]},
		{name: "IceOrb", color: "#92e8c0", tags: ["ice", "bolt", "offense", "utility", "aoe"], prerequisite: "Snowball", sfx: "LesserFreeze", hitsfx: "LesserFreeze", school: "Elements",
			noise: 6,
			upcastFrom: "Snowball", upcastLevel: 1,
			manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, pierceEnemies: true, delay: 0, range: 50, damage: "frost", speed: 2,
			bulletColor: 0x92e4e8, bulletLight: 5,
			effectTileDurationModTrail: 4, effectTileTrailAoE: 1.5, noTrailOnPlayer: true, effectTileTrail: {
				name: "Ice",
				duration: 10,
			}},
		{name: "Icicles", tags: ["ice", "bolt", "offense"], prerequisite: "Icebolt", sfx: "MagicSlash", school: "Elements", manacost: 6, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
			noise: 3,
			spellcast: {spell: "Icicle", target: "target", directional:true, offset: false}, channel: 3},
		{name: "BoulderLaunch", tags: ["earth", "bolt", "offense"], prerequisite: "ApprenticeEarth", sfx: "Telekinesis", school: "Elements", manacost: 2, components: ["Legs"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 4, delay: 1, power: 4, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "Boulder", target: "target", directional:true, offset: false}, channel: 1},
		{name: "BigBoulderLaunch", tags: ["earth", "bolt", "offense", "aoe"], prerequisite: "BoulderLaunch", sfx: "Telekinesis", school: "Elements",
			upcastFrom: "BoulderLaunch", upcastLevel: 2,
			manacost: 6, components: ["Legs"], projectileTargeting: true, noTargetPlayer: true, noEnemyCollision: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 8, delay: 1, power: 12, range: 50, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "BigBoulder", target: "target", directional:true, offset: false}, channel: 1},
		{name: "Electrify", tags: ["electric", "offense"], prerequisite: "ApprenticeLightning", noise: 6,
			effectTileDurationMod: 2, effectTile: {
				name: "Sparks",
				duration: 3,
			},
			sfx: "FireSpell", landsfx: "Shock", school: "Elements", manacost: 5, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 9, time: 4, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}}, // A series of light shocks incapacitate you
		{name: "Shock", tags: ["electric", "bolt", "offense", "dot"], prerequisite: "ApprenticeLightning", sfx: "FireSpell",
			effectTileDurationMod: 2, effectTile: {
				name: "Sparks",
				duration: 3,
			},
			school: "Elements", manacost: 5, components: ["Arms"], noEnemyCollision: true, level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 2.5, delay: 0, range: 50, damage: "inert", speed: 1,
			events: [{type: "CastSpellNearbyEnemy", trigger: "bulletTick", spell: "ShockStrike", aoe: 1.5},]},
		{name: "Crackle", tags: ["electric", "offense", "aoe"], prerequisite: "Shock", noise: 6, sfx: "Shock",
			effectTileDurationModTrail: 2, effectTileTrail: {
				name: "Sparks",
				duration: 3,
			},
			school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 4.0, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
			trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0, playerEffect: {name: "Shock", time: 1}},
		{name: "Fissure", tags: ["fire", "denial", "dot", "aoe", "offense"], noUniqueHits: true, prerequisite: "Ignite", noise: 7, sfx: "FireSpell", school: "Elements", manacost: 8, components: ["Legs"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 5.5, delay: 0, range: 4, speed: 4, size: 1, damage: "fire",
			trailPower: 1.5, trailLifetime: 6, piercingTrail: true, trailDamage:"fire", trail:"lingering", trailChance: 1, playerEffect: {name: "DamageNoMsg", hitTag: "Fissure", time: 1, damage:"fire", power: 3}},
		//{name: "Shield", sfx: "MagicSlash", school: "Elements", manacost: 1, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, level:1, type:"inert", block: 10, onhit:"", power: 0,delay: 2, range: 1.5, size: 1, damage: ""}, // Creates a shield that blocks projectiles for 1 turn
		{name: "Shield", tags: ["shield", "defense"], prerequisite: "ApprenticeEarth", sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Verbal"], mustTarget: true, level:1, type:"buff",
			buffs: [
				{id: "Shield", type: "SpellResist", aura: "#73efe8", duration: 50, power: 3.0, player: true, enemies: true, tags: ["defense", "damageTaken"]},
			], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "GreaterShield", tags: ["shield", "defense", "utility"], prerequisite: "Shield", spellPointCost: 1, sfx: "MagicSlash", school: "Elements", manacost: 1, components: ["Verbal"],
			noTargetEnemies: true, noTargetPlayer: true, level:1, type:"inert", block: 20, onhit:"", power: 0, delay: 5, range: 2.99, size: 1, damage: ""}, // Creates a shield that blocks projectiles for 5 turns
		{name: "IceBreath", tags: ["ice", "denial", "offense", "utility", "aoe"], prerequisite: "Hailstorm", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 8,
			upcastFrom: "Hailstorm", upcastLevel: 1,
			components: ["Verbal"], level:1, type:"inert", onhit:"lingering", time: 1, delay: 1, range: 3, size: 3, aoe: 1.5, lifetime: 10, power: 5, lifetimeHitBonus: 5, damage: "ice"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "LightningBolt", tags: ["electric", "aoe", "offense"], prerequisite: "Crackle", noise: 11, sfx: "Lightning",
			school: "Elements", spellPointCost: 1, manacost: 9.5, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 8.5, delay: 0, time: 2, range: 50, speed: 50, size: 1, damage: "electric",
			upcastFrom: "Crackle", upcastLevel: 2,
			trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "Shock", time: 3},
			effectTileDurationModTrail: 4, effectTileDensityTrail: 0.6, effectTileTrail: {
				name: "Sparks",
				duration: 2,
			}
		},
		{name: "StoneSkin", tags: ["earth", "buff", "defense"], prerequisite: "ApprenticeEarth", sfx: "Bones", school: "Elements", manacost: 5.5, components: ["Arms"], mustTarget: true, level:1, type:"buff", buffs: [{id: "StoneSkin", aura: "#FF6A00", type: "Armor", duration: 50, power: 2.0, player: true, enemies: true, tags: ["defense", "armor"]}], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "IronBlood", tags: ["earth", "buff", "offense"], prerequisite: "ApprenticeEarth", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
			buffs: [
				{id: "IronBlood", aura: "#ff5277", type: "AttackStamina", duration: 99999, cancelOnReapply: true, endSleep: true, power: 1, player: true, enemies: false, tags: ["attack", "stamina"]},
				{id: "IronBlood2", type: "ManaCostMult", duration: 99999, cancelOnReapply: true, endSleep: true, power: 0.25, player: true, enemies: false, tags: ["manacost"]},
			], onhit:"", time:30, power: 0, range: 2, size: 1, damage: ""},
		{name: "FlameBlade", tags: ["fire", "aoe", "offense", "buff"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements", manacost: 3, components: [], level:1, type:"passive", events: [{type: "FlameBlade", trigger: "playerAttack"}]},
		{name: "Strength", tags: ["earth", "struggle", "buff", "utility", "offense"], prerequisite: "ApprenticeEarth", sfx: "FireSpell", school: "Elements", manacost: 1, components: [], level:1, type:"passive", events: [
			//{type: "ElementalEffect", power: 2, damage: "crush", trigger: "playerAttack"},
			{trigger: "beforePlayerAttack", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
			{trigger: "calcDisplayDamage", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
			{type: "ModifyStruggle", mult: 1.5, power: 0.2, StruggleType: "Struggle", trigger: "beforeStruggleCalc", msg: "KinkyDungeonSpellStrengthStruggle"},
		]},
		{name: "Ignite", tags: ["fire", "aoe", "dot", "buff"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements",
			manacost: 2, spellPointCost: 1, components: ["Legs"], mustTarget: true, noTargetEnemies: true, exceptionFactions: ["Player", "Rock"], level:1, type:"buff",
			buffs: [
				{id: "Ignite", aura: "#ff8400", type: "SpellCastConstant", duration: 6, power: 10.0, player: true, enemies: true, spell: "Ignition", tags: ["offense"]},
			],
			onhit:"", time:6, power: 1.5, range: 2.9, size: 1, damage: ""},

		{name: "Thunderstorm", tags: ["aoe", "utility", "offense", "electric"], prerequisite: "ApprenticeLightning", spellPointCost: 1, sfx: "Fwoosh", school: "Elements", manacost: 4, components: ["Verbal"], level:1, type:"inert", buffs: [
			Object.assign({}, KDConduction),
		], bulletSpin: 0.1, onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
		{name: "StaticSphere", tags: ["electric", "metal", "summon", "aoe", "offense"], prerequisite: "Thunderstorm", sfx: "MagicSlash", school: "Elements", manacost: 8,
			upcastFrom: "Thunderstorm", upcastLevel: 2,
			components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, level:1, type:"hit", noSprite: true, onhit:"summon",
			summon: [{name: "StaticSphere", count: 1, time: 12, bound: true}], power: 1.5, time: 12, delay: -1, range: 6, size: 1, aoe: 0, lifetime: 1, damage: "inert"},

		{name: "LightningRune", castCondition: "noStationaryBullet", tags: ["electric", "offense", "defense", "utility", "trap", "trapReducible"], prerequisite: "ApprenticeLightning", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 2,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", time: 5, delay: 3, power: 4.5, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LightningRuneStrike", target: "onhit", directional:false, offset: false}, channel: 2},
		{name: "FlameRune", castCondition: "noStationaryBullet", tags: ["fire", "offense", "defense", "trap", "trapReducible"], prerequisite: "ApprenticeFire", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 2,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", delay: 3, power: 5.5, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "FlameRuneStrike", target: "onhit", directional:false, offset: false}, channel: 2},
		{name: "FreezeRune", castCondition: "noStationaryBullet", tags: ["ice", "offense", "defense", "utility", "trap", "trapReducible"], prerequisite: "ApprenticeIce", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 5,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", time: 30, delay: 3, power: 3, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "FreezeRuneStrike", target: "onhit", directional:false, offset: false}, channel: 2},

		{name: "WaterBall", color: "#4f7db8", tags: ["water", "soap", "bolt", "offense", "utility"], prerequisite: "ApprenticeWater", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"buff",
			power: 3.5, delay: 0, range: 50, damage: "soap", speed: 3, playerEffect: {name: "Drench"},
			buffs: [
				Object.assign({}, KDDrenched),
				Object.assign({}, KDDrenched2),
				Object.assign({}, KDDrenched3),
			],
			effectTileDurationMod: 40, effectTile: {
				name: "Water",
				duration: 40,
			},
		},
		{name: "TidalBall", color: "#4f7db8", tags: ["water", "soap", "bolt", "offense", "utility"], prerequisite: "WaterBall", sfx: "FireSpell", school: "Elements", manacost: 6, components: ["Arms"], level:1, type:"bolt", size: 3, aoe: 1.5, projectileTargeting:true, onhit:"",  power: 3.5, pierceEnemies: true, delay: 0, range: 50, damage: "soap", speed: 1,
			upcastFrom: "WaterBall", upcastLevel: 1, bulletAoE: 1.5,
			effectTileDurationModTrail: 100, effectTileTrailAoE: 1.5, noTrailOnPlayer: true, effectTileTrail: {
				name: "Water",
				duration: 40,
			}},

		// Passive spells
		{name: "Shatter", tags: ["ice", "aoe", "offense"], prerequisite: "ApprenticeIce", school: "Elements", manacost: 1, components: [], power: 1.5, time: 4, level:1, type:"passive", events: [
			{type: "Shatter", trigger: "enemyStatusEnd"},
			{type: "Shatter", trigger: "beforePlayerAttack"},
			{type: "Shatter", trigger: "kill"},
		]},

	],
	"Conjure": [
		{goToPage: 5, name: "ApprenticeRope", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["RopeBoltLaunch"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "ApprenticeMetal", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["SummonCuffs"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "ApprenticeLeather", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["SummonGag"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "ApprenticeSummon", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Ally"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "ApprenticeLatex", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["SlimeBall"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "ApprenticePhysics", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Wall"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 5, name: "FloatingWeapon", increasingCost: true, tags: ["magic"], autoLearn: ["RecoverObject"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				//{type: "FloatingWeapon", trigger: "playerAttack"},
				{type: "HandsFree", trigger: "getWeapon", delayedOrder: 3},
				{type: "FloatingWeapon", trigger: "calcDamage2", delayedOrder: 3},
				{type: "FloatingWeapon", trigger: "draw"},
			]
		},

		{name: "Psychokinesis", tags: ["telekinesis", "defense", "utility"], prerequisite: "FloatingWeapon", school: "Conjure",
			spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
				{type: "Psychokinesis", trigger: "calcComp", requiredTag: "telekinesis"},
				{type: "Psychokinesis", trigger: "calcCompPartial", requiredTag: "telekinesis"},
				{type: "Psychokinesis", trigger: "afterPlayerCast", requiredTag: "telekinesis", mult: 2},

			]},

		{name: "KineticMastery", tags: ["telekinesis", "defense", "utility"], prerequisite: "TelekineticSlash", school: "Conjure",
			learnFlags: ["KineticMastery"],
			spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0,
			lifetime: 0, power: 0, damage: "inert", events: [
				{type: "KineticMastery", trigger: "beforeMultMana", requiredTag: "kinetic", mult: 0.7},
			]},


		{name: "RecoverObject", prerequisite: "FloatingWeapon", tags: ["telekinesis", "utility"], sfx: "Teleport", school: "Conjure", manacost: 4.0, components: ["Arms"], level:1,
			type:"special", special: "RecoverObject",
			onhit:"", time:0, power: 1.0, range: 4.99, size: 1, damage: "glue"},

		{name: "RecoverObject2", prerequisite: "RecoverObject", tags: ["telekinesis", "utility"], sfx: "Teleport", school: "Conjure", manacost: 8.0, components: ["Arms"], level:1,
			upcastFrom: "RecoverObject", upcastLevel: 1,
			type:"special", special: "RecoverObject",
			onhit:"", time:0, power: 1.0, range: 7.99, aoe: 2.5, size: 1, damage: "glue"},

		{name: "TelekineticSlash", castCondition: "FloatingWeapon", prerequisite: "FloatingWeapon", tags: ["telekinesis", "kinetic", "offense"], sfx: "FireSpell", school: "Conjure",
			manacost: 5.0, components: ["Verbal"], level:1,
			type:"special", special: "TelekineticSlash", aoetype: "slash", aoe: 1,
			events: [
				{trigger: "calcMana", type: "HeavyKinetic", power: 1.0},
			],
			onhit:"", time:0, power: 1.0, range: 2.5, size: 1, damage: "crush"},

		{name: "KineticLance", castCondition: "FloatingWeapon", prerequisite: "TelekineticSlash", tags: ["telekinesis", "kinetic", "offense"], sfx: "Lightning", school: "Conjure",
			noise: 6,
			manacost: 6, components: ["Verbal"], level:1, type:"bolt", pierceEnemies: true, projectileTargeting:true, onhit:"", power: 0.0, delay: 0, time: 1, range: 6, speed: 7, size: 3, damage: "crush",
			events: [
				{trigger: "bulletHitEnemy", type: "KineticLance", mult: 1.6, power: 3.0},
				{trigger: "bulletDestroy", type: "KineticLance"},
				{trigger: "calcMana", type: "HeavyKinetic", power: 1.5},
			],
		},

		{name: "Sagitta", castCondition: "FloatingWeapon", prerequisite: "TelekineticSlash", tags: ["telekinesis", "kinetic", "offense", "sagitta"], sfx: "FireSpell", school: "Conjure",
			meleeOrigin: true, noTargetPlayer: true, noEnemyCollision: true, CastInWalls: true, lifetime: 1,
			events: [
				{trigger: "calcMana", type: "HeavyKinetic", power: 0.5},
			],
			manacost: 1.5, components: ["Legs"], level:1, type:"hit", projectileTargeting:true, onhit:"aoe", power: 0.0, delay: 0, time: 1, range: 4.99, speed: 5, size: 1, damage: "pierce",
			spellcast: {spell: "SagittaBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "SagittaAssault", aimAtTarget: true, noTargetMoveDir: true, offset: false},

		},
		{name: "SagittaAssault", prerequisite: "Sagitta", tags: ["buff", "offense", "telekinesis"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: [], level:1, passive: true, type:"",
			events: [{type: "SagittaAssault", trigger: "playerCast", power: 3}]},

		{name: "CommandWordGreater", tags: ["command", "binding", "utility", "defense"], sfx: "Magic",
			school: "Conjure", manacost: 14, components: ["Verbal"], level:1, type:"special", special: "CommandWord", noMiscast: true,
			prerequisite: "CommandWord",
			onhit:"", time:100, power: 10, aoe: 0.5, range: 4.5, size: 1, damage: ""},

		{name: "Bomb", color: "#ff5277", prerequisite: "ApprenticeSummon", tags: ["aoe", "offense"], noise: 5, sfx: "FireSpell", school: "Conjure", manacost: 5, components: ["Verbal"], level:1,
			aoetype: "crossCrack",
			hitevents: [
				{trigger: "afterBulletHit", type: "Crack"},
			],
			block: 1.5, noTerrainHit: true, volatilehit: true, blockType: [...KDIgnitionSources],
			effectTileDurationMod: 7, hitSpin: 0.2, effectTile: {
				name: "Smoke",
				duration: -1,
			}, type:"inert", onhit:"lingering", time: 3, delay: 5, power: 10, range: 3, size: 3, aoe: 2, lifetime: 1, damage: "stun", playerEffect: {name: "Damage"},},

		{name: "FeatherCloud", color: "#ffffff", prerequisite: "TickleCloud", tags: ["tickle", "aoe", "dot", "offense", "utility", "denial"], noUniqueHits: true, noise: 1, landsfx: "Tickle", hitsfx: "Tickle", school: "Elements", manacost: 4,
			components: ["Arms"], hitSpin: 0.7, bulletSpin: 0.4, level:1, type:"inert", onhit:"aoe", delay: 1, power: 2.0, distract: 6.0, range: 2.5, size: 3, aoe: 1, pierceEnemies: true,
			lifetime: 3, damage: "tickle", playerEffect: {name: "Damage"},
		},
		{name: "TickleCloud", color: "#ffffff", prerequisite: "ApprenticeSummon", tags: ["tickle", "aoe", "dot", "offense", "utility", "denial"], piercing: true, noUniqueHits: true, noise: 1, landsfx: "Tickle", hitsfx: "Tickle", school: "Elements", manacost: 2,
			components: ["Arms"], hitSpin: 1, bulletSpin: 0.4, level:1, type:"dot", onhit:"aoe", delay: 9, power: 0.5, range: 3.99, size: 1, aoe: 0.5, lifetime: 1, damage: "tickle", playerEffect: {name: "Damage"},
		},//, distractEff: 2.0
		{name: "Snare", color: "#ff8899", castCondition: "noStationaryBullet", tags: ["rope", "binding", "denial", "utility", "offense", "trap", "trapReducible"],
			prerequisite: "ApprenticeRope", noise: 0, sfx: "Fwoosh", school: "Conjure", spellPointCost: 1, manacost: 2,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", delay: 3, power: 5.5, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "RopeRuneStrike", target: "onhit", directional:false, offset: false}, channel: 2},

		{name: "LeatherBurst", prerequisite: "ApprenticeLeather", tags: ["buff", "offense", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: [], level:1, passive: true, type:"",
			events: [{type: "LeatherBurst", trigger: "playerCast", power: 3}]},

		{name: "SummonGag", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 1.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "GagBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonAMGag", prerequisite: "SummonGag", tags: ["leather", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
			upcastFrom: "SummonGag", upcastLevel: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "AMGagBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonArmbinder", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "armbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			upcastFrom: "SummonLeatherCuffs", upcastLevel: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "ArmbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLegbinder", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "legbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 4, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LegbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},

		{name: "SummonLatexGag", prerequisite: "SlimeToLatex", tags: ["latex", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 1.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LatexGagBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLatexArmbinder", prerequisite: "SlimeToLatex", tags: ["latex", "bolt", "binding", "burst", "armbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LatexArmbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLatexLegbinder", prerequisite: "SlimeToLatex", tags: ["latex", "bolt", "binding", "burst", "legbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 4, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LatexLegbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},

		{name: "SummonBlindfold", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "blindfold", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 1.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "BlindfoldBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLeatherCuffs", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "cuffs", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 2.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 1, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LeatherCuffsBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonCuffs", prerequisite: "ApprenticeMetal", tags: ["metal", "bolt", "binding", "burst", "cuffs", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 2, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 3, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "CuffsBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonHarness", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "harness", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "HarnessBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonStraitjacket", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "straitjacket", "utility", "offense"], components: ["Arms"], noise: 1,
			upcastFrom: "SummonLeatherCuffs", upcastLevel: 2,
			sfx: "MagicSlash", school: "Conjure", manacost: 7, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 12, range: 6, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "StraitjacketBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},


		{name: "Petsuit", prerequisite: "SummonHarness", tags: ["leather", "summon", "utility", "petsuit"], sfx: "Magic", school: "Conjure", manacost: 1, components: [], level:1,
			type:"special", special: "Petsuit",
			onhit:"", time:0, power: 0.0, range: 2.99, size: 1, aoe: 0.5, damage: "glue"},

		{name: "DisplayStand", prerequisite: "ApprenticeMetal", tags: ["metal", "summon", "utility", "petsuit"], sfx: "Magic", school: "Conjure", manacost: 1, components: [], level:1,
			type:"special", special: "DisplayStand",
			onhit:"", time:0, power: 0.0, range: 2.99, size: 1, aoe: 0.5, damage: "glue"},

		{name: "RopeBoltLaunch", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "MagicSlash", school: "Conjure",
			manacost: 3, components: ["Verbal"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 1, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
			spellcast: {spell: "RopeBolt", target: "target", directional:true, aimAtTarget: true, offset: false}},

		{name: "RopeBoltLaunchMany", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "RopeBoltLaunch", sfx: "MagicSlash", school: "Conjure",
			upcastFrom: "RopeBoltLaunch", upcastLevel: 1,
			manacost: 7, components: ["Verbal"], projectileTargeting: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 9, power: 1, range: 8, meleeOrigin: true, noDirectionOffset: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
			followCaster: true,
			spellcast: {spell: "RopeBoltLaunchSingle", target: "target", directional:true, aimAtTarget: true, offset: false}},
		{name: "EnchantRope", color: "#ffae70", tags: ["rope", "utility", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "Freeze", school: "Conjure", manacost: 5.5, components: ["Verbal"],
			level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 1.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "arcane",
			playerEffect: {name: "EnchantRope", power: 2},
			events: [
				{type: "EnchantRope", trigger: "bulletHitEnemy", mult: 1.0},
			]},
		{name: "RopeStrike", prerequisite: "RopeBoltLaunch", tags: ["rope", "binding", "aoe", "offense"], sfx: "MagicSlash", effectTileDurationMod: 10, effectTile: {
			name: "Ropes",
			duration: 20,
		}, bulletSpin: 1, school: "Conjure", manacost: 3.5, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 1, power: 3, bind: 5, time: 6, range: 3.5, size: 3, aoe: 1.5, lifetime: 1, damage: "chain",  bindType: "Rope", playerEffect: {name: "MagicRope", time: 4, tags: ["ropeMagicWeak"], msg: "Rope"}},
		{name: "Slime", color: "#ff00ff", prerequisite: "SlimeSplash", tags: ["latex", "slime", "aoe", "offense"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeSplash", upcastLevel: 1,
			requireLOS: true,
			effectTileDurationMod: 12, effectTile: {
				name: "Slime",
				duration: 8,
			},
			onhit:"lingering", time: 4, delay: 1, range: 3.5, size: 3, aoe: 1.5, lifetime: 3, power: 3.5, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeSplash", color: "#ff00ff", prerequisite: "ApprenticeLatex", tags: ["latex", "slime", "aoe", "offense"], landsfx: "MagicSlash", school: "Conjure",
			manacost: 1.4, components: ["Legs"], level:1, type:"inert",
			requireLOS: true,
			effectTileDurationMod: 4, effectTile: {
				name: "Slime",
				duration: 6,
			},
			onhit:"lingering", time: 0, delay: 1, range: 2.5, size: 1, aoe: 1.01, lifetime: 1, power: 1, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeEruption", color: "#ff00ff", prerequisite: "Slime", tags: ["latex", "slime", "aoe", "denial", "offense"], landsfx: "MagicSlash", school: "Conjure", manacost: 7, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeSplash", upcastLevel: 2,
			requireLOS: true,
			effectTileDurationMod: 16, effectTile: {
				name: "Slime",
				duration: 8,
			},
			onhit:"lingering", time: 4, delay: 1, range: 4, size: 3, aoe: 2.99, lifetime: 8, power: 4, lifetimeHitBonus: 4, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}},
		//{name: "PinkGas", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"lingering", time: 1, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 9999, damage: "stun", playerEffect: {name: "PinkGas", time: 3}}, // Dizzying gas, increases distraction
		{name: "ChainBolt", color: "#ffffff", prerequisite: "ApprenticeMetal", tags: ["metal", "binding", "bolt", "offense"], noise: 5,
			sfx: "FireSpell", school: "Conjure", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 0, power: 2.5, delay: 0, range: 50, damage: "chain", speed: 3, bindType: "Metal",
			playerEffect: {name: "SingleChain", time: 1}, effectTileDurationMod: 10, effectTile: {
				name: "Chains",
				duration: 20,
			},
			events: [
				{type: "ElementalIfHalfBound", trigger: "bulletHitEnemy", damage: "crush", power: 5.0, time: 4},
			]

		},
		{name: "SlimeBall", color: "#ff00ff", prerequisite: "ApprenticeLatex", tags: ["latex", "slime", "denial", "bolt", "offense"], noise: 1, sfx: "FireSpell", school: "Conjure", manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 3,  power: 4, delay: 0, range: 50, damage: "glue", speed: 2,
			trailPower: 2, trailLifetime: 10, trailTime: 3,
			bindTags: ["slimeRestraintsRandom"], trailDamage:"glue", trail:"lingering", trailChance: 1.0, playerEffect: {name: "Slime", time: 3}, trailPlayerEffect: {name: "Slime", power: 1.0, time: 3},
			effectTileDurationModTrail: 4, effectTileTrail: {
				name: "Slime",
				duration: 4,
			}}, // Throws a ball of slime which oozes more slime

		{name: "Swap", tags: ["physics", "utility", "offense"], prerequisite: "ApprenticePhysics", sfx: "Teleport",
			school: "Conjure", manacost: 5.5, components: ["Arms"], level:1, type:"special", special: "Swap", noMiscast: true,
			onhit:"", time:25, power: 2, range: 3.5, size: 1, damage: ""},
		{name: "Leap", prerequisite: "ApprenticePhysics", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", spellPointCost: 1, autoLearn: ["Leap2", "Leap3"],
			events: [
				{trigger: "afterBulletHit", type: "Phase"},
			],
			manacost: 1.5, components: ["Verbal"], requireLOS: true, noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 0, lifetime:1, range: 1.5, damage: ""}, // A quick blink
		{name: "Leap2", prerequisite: "Leap", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", spellPointCost: 1,
			upcastFrom: "Leap", upcastLevel: 1,
			manacost: 3, components: ["Verbal"], requireLOS: true, noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 0, lifetime:1, range: 2.5, damage: ""}, // A quick blink
		{name: "Leap3", prerequisite: "Leap", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", spellPointCost: 1,
			upcastFrom: "Leap", upcastLevel: 2,
			manacost: 4.5, components: ["Verbal"], requireLOS: true, noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 0, lifetime:1, range: 3.9, damage: ""}, // A quick blink



		{name: "Blink", prerequisite: "ApprenticeSummon", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", CastInDark: true, channel: 2,
			events: [
				{trigger: "afterBulletHit", type: "FlashPortal"},
				{trigger: "bulletTick", type: "FlashPortal", dist: 1.5},
			],
			manacost: 4, components: ["Verbal"], level:1, type:"inert", power: 0.1, onhit:"teleport", delay: 2, lifetime:1, range: 5.99, damage: "arcane"}, // portal

		{name: "TransportationPortal", prerequisite: "Blink", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", CastInDark: true, channel: 3,
			upcastFrom: "Blink", upcastLevel: 1,
			events: [
				{trigger: "afterBulletHit", type: "TransportationPortal"},
				{trigger: "bulletTick", type: "TransportationPortal", dist: 2.99},
			],
			manacost: 6, components: ["Verbal"], level:1, type:"inert", power: 0.1, onhit:"teleport", delay: 3, lifetime:1, range: 5.99, damage: "arcane"},

		{name: "BanishPortal", prerequisite: "TransportationPortal", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", CastInDark: true, channel: 3,
			upcastFrom: "Blink", upcastLevel: 2,
			events: [
				{trigger: "afterBulletHit", type: "BanishPortal"},
				{trigger: "bulletTick", type: "BanishPortal", dist: 2.99},
			],
			manacost: 10, components: ["Verbal"], level:1, type:"inert", power: 0.1, onhit:"", delay: 3, lifetime:1, range: 5.99, damage: "inert"},

		{name: "Wall", prerequisite: "ApprenticePhysics", tags: ["summon", "utility", "defense", "physics"], sfx: "MagicSlash", school: "Conjure",
			type:"special", special: "Wall",
			onhit:"", time:8, power: 0, range: 6, size: 1, damage: "",
			manacost: 3, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, noSprite: true,},
		{name: "Quickness", prerequisite: "ApprenticePhysics", tags: ["utility", "offense", "defense", "physics"], sfx: "Teleport", school: "Conjure",
			manacost: 3, components: ["Legs"], defaultOff: true, level:1, type:"passive", onhit:"", time: 3, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Quickness", trigger: "toggleSpell", power: 10.0, time: 3},
			]},
		{name: "Quickness2", prerequisite: "ApprenticePhysics", tags: ["utility", "offense", "defense", "physics"], sfx: "Teleport", school: "Conjure",
			manacost: 6.0, components: ["Legs"], defaultOff: true, level:1, type:"passive", onhit:"", time: 10, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Quickness2", trigger: "toggleSpell", power: 2.0, time: 10, mult: 0.5},
			]},
		{name: "Quickness3", prerequisite: "Quickness2", upcastFrom: "Quickness2", upcastLevel: 1, tags: ["utility", "offense", "defense", "physics"], sfx: "Teleport", school: "Conjure",
			manacost: 10.0, components: ["Legs"], defaultOff: true, level:1, type:"passive", onhit:"", time: 10, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Quickness2", trigger: "toggleSpell", power: 3.0, time: 10, mult: .75},
			]},
		{name: "Quickness4", prerequisite: "Quickness3", upcastFrom: "Quickness2", upcastLevel: 2, tags: ["utility", "offense", "defense", "physics"], sfx: "Teleport", school: "Conjure",
			manacost: 15.0, components: ["Legs"], defaultOff: true, level:1, type:"passive", onhit:"", time: 10, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Quickness2", trigger: "toggleSpell", power: 4.0, time: 10, mult: 100},
			]},
		{name: "Quickness5", prerequisite: "Quickness4", upcastFrom: "Quickness2", upcastLevel: 3, tags: ["utility", "offense", "defense", "physics"], sfx: "Teleport", school: "Conjure",
			manacost: 20.0, components: ["Legs"], defaultOff: true, level:1, type:"passive", onhit:"", time: 10, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "Quickness2", trigger: "toggleSpell", power: 10.0, time: 1, mult: 100},
			]},
		{name: "Ally", prerequisite: "ApprenticeSummon", tags: ["summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 8, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", onhit:"summon", noSprite: true, summon: [{name: "Ally", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 2.9, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{name: "FireElemental", prerequisite: "ApprenticeSummon", tags: ["fire", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 12, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "FireElemental", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "WaterMote", prerequisite: "ApprenticeSummon", tags: ["water", "soap", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 12, components: ["Arms"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "WaterMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "AirMote", prerequisite: "ApprenticeSummon", tags: ["air", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 12, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "AirMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "EarthMote", prerequisite: "ApprenticeSummon", tags: ["earth", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 12, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "EarthMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "NatureSpirit", prerequisite: "Ally", tags: ["nature", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 18, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "NatureSpirit", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},

		{name: "Golem", prerequisite: "Ally", tags: ["summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 24, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:3, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "Golem", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 2.5, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{name: "StormCrystal", prerequisite: "ApprenticeSummon", tags: ["summon", "denial", "offense"], noise: 7, sfx: "MagicSlash", school: "Conjure", manacost: 10, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "StormCrystal", count: 1, time: 9999, bound: true}], power: 0, time: 30, delay: -1, range: 2.5, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{noAggro: true, name: "Heal", prerequisite: "ApprenticeLight",  bulletSpin: 0.1, hitSpin: 0.4, noise: 3, sfx: "FireSpell", school: "Conjure", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 1, power: 1.5, range: 4.5, size: 5, aoe: 2.9, lifetime: 4, time: 2, damage: "heal", channel: 4},
		{noAggro: true, buff: true, heal: true, name: "Heal2", prerequisite: "ApprenticeLight", sfx: "MagicSlash", school: "Conjure", manacost: 3, components: ["Verbal"], noTargetPlayer: true, mustTarget: true, level:1, type:"hit",
			events: [
				{type: "Buff", trigger: "tick", power: 1.0, buffType: "blindResist"},
			],
			onhit:"heal", time:2, lifetime: 1, delay: 1, power: 4.5, aoe: 0.9, range: 7, size: 1, damage: "inert"},
		/*{name: "FloatingWeapon", prerequisite: "ApprenticePhysics", tags: ["buff", "offense", "physics"], sfx: "MagicSlash", school: "Conjure", manacost: 2, components: [], level:3, type:"passive",
			events: [
				{type: "FloatingWeapon", trigger: "playerAttack"},
				{type: "HandsFree", trigger: "getWeapon"},
				{type: "HandsFree", trigger: "calcDamage"},
				{type: "ArmsFree", trigger: "calcDamage"},
			]},*/
		{name: "Lockdown", prerequisite: "ApprenticeMetal", tags: ["metal", "lock", "binding", "utility", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 4.5, components: ["Verbal"], mustTarget: true, level:1,
			/*buffs: [
				{id: "Lockdown", aura: "#a96ef5", type: "Locked", duration: 8, power: 1.0, player: true, enemies: true, tags: ["lock", "debuff"]},
				{id: "Lockdown2", type: "MoveSpeed", duration: 8, power: -1.0, player: false, enemies: true, noAlly: true, tags: ["slow", "debuff"]},
				{id: "Lockdown3", type: "AttackSlow", duration: 8, power: 1.0, player: false, enemies: true, noAlly: true, tags: ["slow", "debuff"]},
			], */
			type:"special", special: "Lockdown",
			onhit:"", time:8, power: 0, range: 1.5, size: 1, damage: ""},
		{name: "Chastity", prerequisite: "Lockdown", tags: ["metal", "binding", "utility"], sfx: "MagicSlash", school: "Conjure", manacost: 3.5, components: ["Verbal"], mustTarget: true, level:1,
			type:"special", special: "Chastity",
			onhit:"", time:8, power: 3.5, range: 1.5, size: 1, damage: ""},
		{name: "ZoneOfPurity", color: "#e7cf1a", prerequisite: "Chastity", tags: ["metal", "binding", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 7, components: ["Verbal"], level:1, type:"inert",
			onhit:"aoe", power: 0, delay: 40, range: 4.5, size: 3, lifetime: 1, aoe: 2.5, damage: "charm",
			events: [{trigger: "bulletTick", type: "ZoneOfPurity", aoe: 2.5, power: 0.01}]
		},
		{name: "ZoneOfExcitement", color: "#ff8888", prerequisite: "CommandVibrate", tags: ["binding", "utility"], sfx: "MagicSlash", school: "Conjure", manacost: 3.5, components: ["Verbal"], level:1, type:"inert",
			onhit:"aoe", power: 0, delay: 30, range: 4.5, size: 3, lifetime: 1, aoe: 1.99, damage: "charm",
			events: [{trigger: "bulletTick", type: "ZoneOfExcitement", aoe: 1.99, power: 0.5}]
		},
		{name: "Frustration", tags: ["metal", "offense", "utility"], prerequisite: "Chastity", sfx: "FireSpell", school: "Conjure", manacost: 0, components: [], level:1, type:"passive", events: [
			{type: "Frustration", trigger: "tickAfter"}
		]},


		{name: "CommandCapture", prerequisite: "CommandDisenchant", tags: ["command", "binding", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 4.5, components: ["Verbal"], mustTarget: true, level:1,
			type:"special", special: "CommandCapture",
			onhit:"", time:0, power: 2.5, range: 3.5, bind: 5, size: 1, aoe: 1.5, damage: "chain"},
		{name: "CommandBind", prerequisite: "CommandDisenchant", tags: ["command", "binding", "offense", "aoe"], sfx: "MagicSlash", school: "Conjure", manacost: 4.5, components: ["Verbal"], level:1,
			type:"special", special: "CommandBind",
			onhit:"", time:0, power: 0, range: 2.5, size: 1, aoe: 2.5, damage: "inert"},
		{name: "CommandDisenchant", prerequisite: "CommandWord", tags: ["command", "offense", "aoe"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Verbal"], level:1,
			type:"special", special: "CommandDisenchant",
			onhit:"", time:0, power: 3.0, range: 3.5, size: 1, aoe: 3.5, damage: "inert"},
		{name: "CommandVibrate", prerequisite: "CommandWord", tags: ["command", "offense", "aoe", "sexy"], sfx: "MagicSlash", school: "Conjure", manacost: 4.5, components: ["Verbal"], level:1,
			type:"special", special: "CommandVibrate",
			onhit:"", time:30, power: 5, range: 3.5, size: 1, aoe: 3.5, damage: "charm"},
		{name: "CommandOrgasm", prerequisite: "CommandVibrate", tags: ["command", "offense", "aoe", "sexy"], sfx: "MagicSlash", school: "Conjure", manacost: 4.5, components: ["Verbal"], level:1,
			type:"special", special: "CommandOrgasm",
			onhit:"", time:0, power: 5, range: 7, size: 1, aoe: 4.99, damage: "charm"},
		{name: "CommandRelease", prerequisite: "CommandDisenchant", tags: ["command", "binding", "defense"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Verbal"], level:1,
			type:"special", special: "CommandRelease",
			onhit:"", time:0, power: 10.0, range: 2.5, size: 1, aoe: 1.5, damage: "inert"},
		KDCommandWord,
		{name: "CommandRange", prerequisite: "CommandWordGreater", tags: ["command", "binding", "utility"],
			sfx: "MagicSlash", school: "Conjure", manacost: 0, components: ["Verbal"], level:1,
			type:"", passive: true,
			events: [
				{trigger: "beforeCalcComp", type: "ReplaceVerbalIfFail", requiredTag: "truss"},// No delayedOrder since it has no cost
				{trigger: "calcSpellRange", type: "AddRange", requiredTag: "command", power: 1},
				{trigger: "calcSpellRange", type: "AddRange", requiredTag: "truss", power: 2},
			],
			onhit:"", time:0, power: 10.0, range: 2.5, size: 1, aoe: 1.5, damage: "inert"},

		{name: "NegateRune", prerequisite: "CommandDisenchant", tags: ["command", "offense", "aoe"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: ["Legs"], level:1,
			type:"special", special: "NegateRune",
			onhit:"", time:0, power: 3.0, range: 1.5, size: 1, aoe: 0.5, damage: "inert"},

		{name: "CommandSlime", prerequisite: "ApprenticeLatex", tags: ["command", "slime", "defense"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Verbal"], level:1,
			type:"special", special: "CommandSlime",
			onhit:"", time:0, power: 9.9, range: 2.5, size: 1, aoe: 1.5, damage: "inert"},

		{name: "SlimeWalk", tags: ["slime", "latex", "defense"], prerequisite: "ApprenticeLatex", school: "Conjure", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.5, buffType: "glueDamageResist"},
		]},

		{name: "SlimeWall", tags: ["latex", "utility", "slime", "wall"], autoLearn: ["SlimeWallHoriz", "SlimeWallVert"], prerequisite: "ApprenticeLatex", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SlimeWallVert", secret: true, spellPointCost: 0, color: "#ff00ff", hideUnlearnable: true, prerequisite: "SlimeWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			onhit:"lingering", aoetype: "vert", pierceEnemies: true, time: 2, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			buffs: [KDSlimed]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeWallHoriz", secret: true, spellPointCost: 0, color: "#ff00ff", hideUnlearnable: true, prerequisite: "SlimeWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			onhit:"lingering", aoetype: "horiz", pierceEnemies: true, time: 2, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			buffs: [KDSlimed]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

		{name: "LatexWall", tags: ["latex", "utility", "slime", "wall"], autoLearn: ["LatexWallVert", "LatexWallHoriz"],
			prerequisite: "SlimeWall", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "LatexWallVert", secret: true, spellPointCost: 0, color: "#aa00ff", hideUnlearnable: true, prerequisite: "LatexWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeWallVert", upcastLevel: 1,
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			onhit:"lingering", aoetype: "vert", pierceEnemies: true, time: 0, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitevents: [
				{trigger: "bulletHitEnemy", type: "LatexWall", power: 5, damage: "glue", time: 6},
			],
			buffs: [KDEncased]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "LatexWallHoriz", secret: true, spellPointCost: 0, color: "#aa00ff", hideUnlearnable: true, prerequisite: "LatexWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeWallHoriz", upcastLevel: 1,
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			onhit:"lingering", aoetype: "horiz", pierceEnemies: true, time: 0, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitevents: [
				{trigger: "bulletHitEnemy", type: "LatexWall", power: 5, damage: "glue", time: 6},
			],
			buffs: [KDEncased]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

		{name: "Coalesce", prerequisite: "Spread", tags: ["latex", "slime", "aoe", "utility", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Verbal"], level:1,
			type:"special", special: "Coalesce",
			requireLOS: true,
			onhit:"", time:0, power: 0.5, range: 3.5, size: 1, aoe: 2.5, damage: "glue"},

		{name: "ElasticGrip", prerequisite: "ApprenticeLatex", tags: ["latex", "utility"], sfx: "FireSpell", school: "Conjure", manacost: 2, components: ["Arms"], level:1,
			type:"special", special: "ElasticGrip",
			onhit:"", time:0, power: 1.0, range: 7.99, size: 1, damage: "glue"},

		{name: "SlimeToLatex", prerequisite: "ApprenticeLatex", tags: ["latex", "aoe", "utility", "denial"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:1,
			type:"special", special: "SlimeToLatex",
			onhit:"", time:0, power: 2, range: 3.0, size: 1, aoe: 1.5, damage: "glue"},

		{name: "LiquidMetal", prerequisite: "ApprenticeMetal", tags: ["latex", "metal", "aoe", "utility", "denial"], sfx: "MagicSlash", school: "Conjure", manacost: 5, components: ["Legs"], level:1,
			type:"special", special: "LiquidMetal",
			onhit:"", time:0, power: 2, range: 3.0, size: 1, aoe: 1.5, damage: "glue"},

		{name: "LiquidMetalBurst", color: "#aaaaaa", prerequisite: "ApprenticeMetal", tags: ["latex", "metal", "aoe", "offense"], landsfx: "FireSpell", school: "Conjure", manacost: 7, components: ["Legs"], level:1, type:"inert",
			castCondition: "LiquidMetalBurst",
			requireLOS: true,
			effectTileDurationMod: 12, effectTile: {
				name: "LiquidMetal",
				duration: 24,
			},
			onhit:"aoe", time: 4, delay: 3, lifetime: 1, evadeable: true, range: 6.99, size: 3, aoe: 1.5, power: 9, bindType: "Metal", bind: 80, damage: "crush", playerEffect: {name: "LiquidMetalEngulf", damage: "crush", power: 9}},

		{name: "Engulf", tags: ["latex", "slime", "buff", "offense"], prerequisite: "ApprenticeLatex", sfx: "MagicSlash", school: "Conjure", manacost: 0.8, components: [], level:1, type:"passive", events: [
			{type: "ElementalEffect", power: 1, addBind: true, damage: "glue", bindType: "Slime", bindEff: 1.5, trigger: "playerAttack"},
			{type: "EffectTileAoE", aoe: 1.1, kind: "Slime", duration: 7, trigger: "playerAttack", cost: 0},
		]},
		{name: "ChainStrike", tags: ["chain", "metal", "buff", "offense"], prerequisite: "ApprenticeMetal", sfx: "MagicSlash", school: "Conjure", manacost: 0.7, components: [], level:1, type:"passive", events: [
			{type: "ElementalEffect", power: 1, addBind: true, damage: "chain", bindType: "Metal", bindEff: 1.25, trigger: "playerAttack"},
			{type: "EffectTileAoE", aoe: 1.1, kind: "Chains", duration: 16, trigger: "playerAttack", cost: 0},
		]},
		{name: "LeatherWhip", tags: ["leather", "buff", "offense"], prerequisite: "ApprenticeLeather", sfx: "MagicSlash", school: "Conjure", manacost: 0.6, components: [], level:1, type:"passive", events: [
			{type: "ElementalEffect", power: 1, addBind: true, damage: "pain", bindType: "Leather", bindEff: 2.5, trigger: "playerAttack"},
			{type: "EffectTileAoE", aoe: 1.1, kind: "Belts", duration: 12, trigger: "playerAttack", cost: 0},
		]},
		{name: "Ropework", tags: ["rope", "buff", "offense"], prerequisite: "ApprenticeRope", sfx: "MagicSlash", school: "Conjure", manacost: 0.7, components: [], level:1, type:"passive", events: [
			{type: "ElementalEffect", power: 1, addBind: true, damage: "chain", bindType: "Rope", bindEff: 4, trigger: "playerAttack"},
			{type: "EffectTileAoE", aoe: 1.1, kind: "Ropes", duration: 12, trigger: "playerAttack", cost: 0},
		]},

		{name: "Awaken", prerequisite: "Spread", tags: ["slime", "latex", "binding", "offense", "aoe"], sfx: "MagicSlash", school: "Conjure", manacost: 2.0, components: ["Verbal"], level:1,
			type:"special", special: "Awaken",
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2.5, damage: "inert"},

		{name: "Spread", prerequisite: "ApprenticeLatex", tags: ["slime", "latex", "utility",], sfx: "MagicSlash", school: "Conjure", manacost: 1.0, components: ["Verbal"], level:1,
			type:"special", special: "Spread",
			requireLOS: true,
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2, damage: "inert"},

		{name: "Animate", prerequisite: "Awaken", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 6, components: ["Verbal"], level:1,
			type:"special", special: "Animate", upcastFrom: "Awaken", upcastLevel: 1,
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 1.5, damage: "inert"},

		{name: "AnimateLarge", prerequisite: "Animate", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 10, components: ["Verbal"], level:1,
			type:"special", special: "AnimateLarge", upcastFrom: "Awaken", upcastLevel: 2,
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 1.1, damage: "inert"},

		{name: "AnimatePuppet", prerequisite: "Awaken", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 6, components: ["Verbal"], level:2,
			type:"special", special: "AnimatePuppet",
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2.5, damage: "inert"},

		{name: "OneWithSlime", tags: ["slime", "latex", "utility"], prerequisite: "ApprenticeLatex", school: "Elements", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "OneWithSlime", trigger: "calcComp", requiredTag: "slime"},
			{type: "OneWithSlime", trigger: "calcCompPartial", requiredTag: "slime"},
		]},

		{name: "SlimeMimic", tags: ["slime", "latex", "utility"], prerequisite: "ApprenticeLatex", school: "Elements", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "SlimeMimic", trigger: "tick"},
		]},


		{name: "SteelRainPlug", color: "#ffffff", tags: ["binding", "metal", "bolt", "offense"], prerequisite: "ApprenticeMetal", sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 2, components: ["Arms"], level:1, type:"bolt",
			projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "pierce", speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "pierce", power: 2, tag: "plugSpell"},
			bulletColor: 0xffffff, bulletLight: 1,
			tease: true,
			events: [
				{type: "PlugEnemy", trigger: "bulletHitEnemy"},
			]
		},
		{name: "SteelRainBurst", tags: ["binding", "metal", "bolt", "offense"], prerequisite: "SteelRainPlug", sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 5, components: ["Arms"], level:1,
			upcastFrom: "SteelRainPlug", upcastLevel: 1,
			projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			shotgunCount: 4, shotgunDistance: 4, shotgunSpread: 1, shotgunSpeedBonus: 1,
			spellcast: {spell: "SteelRainPlug", target: "target", directional:true, randomDirectionPartial: true, aimAtTarget: true, noTargetMoveDir: true, offset: false}},


	],
	"Illusion": [
		{goToPage: 6, name: "ApprenticeShadow", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Dagger"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 6, name: "ApprenticeLight", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Flash"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 6, name: "ApprenticeMystery", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Camo"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 6, name: "ApprenticeProjection", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["Decoy"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 6, name: "ApprenticeKnowledge", increasingCost: true, tags: ["magic", "randomfree"], autoLearn: ["TrueSteel"], learnFlags: ["AdvTooltips"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "Analyze", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge"], school: "Illusion", manacost: 2.5, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive",
			events: [{type: "Analyze", trigger: "toggleSpell", power: 5, time: 20}, {type: "Analyze", trigger: "tick", power: 5, time: 20}]},

		{name: "Light", prerequisite: "ApprenticeLight", tags: ["buff", "utility", "light"], school: "Illusion", manacost: 2, spellPointCost: 1, defaultOff: true, cancelAutoMove: true, time: 12, components: [], level:1, type:"passive",
			events: [{type: "Light", trigger: "getLights", power: 12, time: 12}, {type: "Light", trigger: "toggleSpell", power: 12, time: 12}]},


		{name: "ShadowDance", prerequisite: "ApprenticeShadow", tags: ["shadow", "utility", "defense"], sfx: "MagicSlash", school: "Illusion", spellPointCost: 1,
			castCondition: "ShadowDance",
			manacost: 2.5, components: ["Legs"], requireLOS: true, noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 0, lifetime:1, range: 4.99, damage: ""},

		{name: "TheShadowWithin", tags: ["shadow", "utility"], school: "Illusion", manacost: 0, components: [],  learnFlags: ["TheShadowWithin"], prerequisite: "ShadowDance", level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert",
			events: [
				{type: "TheShadowWithin", trigger: "calcMultMana", mult: 2},
			],
		},


		{name: "Dagger", prerequisite: "ApprenticeShadow", tags: ["bolt", "shadow", "offense"], sfx: "MagicSlash", school: "Illusion", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, noDoubleHit: true, piercing: true, onhit:"", power: 2.5, time: 0, delay: 0, range: 6, damage: "cold", speed: 4, playerEffect: {name: "Damage"}}, // Throws a fireball in a direction that moves 1 square each turn
		{name: "Flash", color: "#ffffff", prerequisite: "ApprenticeLight", tags: ["light", "utility", "aoe", "offense"], noise: 8, sfx: "FireSpell",
			hitColor: 0xffffff, hitLight: 6,
			hitevents: [
				{type: "BlindAll", trigger: "bulletHitEnemy", time: 8},
			],
			school: "Illusion", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 0, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 4}},
		{name: "Ring", prerequisite: "ApprenticeLight", tags: ["aoe", "utility", "stealth"],
			noise: 10, sfx: "MagicSlash", school: "Illusion",
			manacost: 1, components: ["Arms"], level:1, type:"inert", onhit:"aoe",
			time: 2, delay: 4, power: 1, range: 6.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun"},
		{name: "GreaterFlash", color: "#ffffff", tags: ["light", "utility", "aoe", "offense"], prerequisite: "Flash", spellPointCost: 1,
			upcastFrom: "Flash", upcastLevel: 1,
			hitColor: 0xffffff, hitLight: 8,
			hitevents: [
				{type: "BlindAll", trigger: "bulletHitEnemy", time: 17},
			],
			noise: 10, sfx: "FireSpell", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 2, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 6}}, // Much greater AoE. Careful not to get caught!
		{name: "FocusedFlash", color: "#ffffff", tags: ["light", "utility", "aoe", "offense"], prerequisite: "GreaterFlash", spellPointCost: 1,
			upcastFrom: "Flash", upcastLevel: 2,
			hitColor: 0xffffff, hitLight: 11,
			hitevents: [
				{type: "BlindAll", trigger: "bulletHitEnemy", time: 31},
			],
			noise: 10, sfx: "FireSpell", school: "Illusion", manacost: 7, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 4, delay: 2, power: 1, range: 2.5, size: 5, aoe: 2.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 10}}, // Longer delay, but the stun lasts much longer.
		{name: "Shroud", prerequisite: "ApprenticeShadow", tags: ["aoe", "buff", "utility", "stealth", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert",
			noise: 3.5,// Attracts some enemies
			buffs: [
				{id: "Shroud", type: "Evasion", power: 7.0, player: true, enemies: true, tags: ["darkness"], range: 1.5},
				{id: "Shroud2", aura: "#444488", type: "Sneak", power: 4.0, player: true, duration: 8, enemies: false, tags: ["darkness"], range: 1.5}
			], onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4.5, size: 3, damage: "",
			effectTileDurationModPre: 3, effectTilePre: {
				name: "Smoke",
				duration: 8,
			}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
		{name: "Invisibility", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "stealth", "defense"], sfx: "Invis", school: "Illusion", manacost: 6, components: ["Verbal"], mustTarget: true, level:1, type:"buff",
			buffs: [
				{id: "Invisibility", aura: "#888888", type: "Sneak", duration: 12, power: 15.0, player: true, enemies: true, tags: ["invisibility"]},
				{id: "Invisibility2", type: "SlowDetection", duration: 12, power: 0.5, player: true, enemies: false, tags: ["invisibility"]},
			], onhit:"", time:12, power: 0, range: 2, size: 1, damage: ""},
		{name: "GreaterInvisibility", prerequisite: "Invisibility", tags: ["buff", "utility", "stealth", "defense"], sfx: "Invis", school: "Illusion", manacost: 10, components: ["Verbal"], mustTarget: true, level:1, type:"buff",
			upcastFrom: "Invisibility", upcastLevel: 1,
			buffs: [
				{id: "Invisibility", aura: "#888888", type: "Sneak", duration: 15, power: 20.0, player: true, enemies: true, tags: ["invisibility"]},
				{id: "Invisibility2", type: "SlowDetection", duration: 15, power: 0.5, player: true, enemies: false, tags: ["invisibility"]},
				{id: "GreaterInvisibility", aura: "#a45fd7", type: "Invisible", duration: 15, power: 1.5, player: true, currentCount: -1, maxCount: 1, tags: ["invisibility", "attack", "cast"]}
			], onhit:"", time:15, power: 0, range: 2, size: 1, damage: ""},
		{name: "TrueSteel", prerequisite: "ApprenticeKnowledge", tags: ["offense", "stealth", "knowledge"], sfx: "MagicSlash", school: "Illusion", manacost: 2, components: ["Arms"], noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, time:1, power: 4, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "slash",
			events: [{trigger: "beforeDamageEnemy", type: "MultiplyDamageStealth", power: 2.5, humanOnly: true}]
		},
		{name: "Camo", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "stealth", "defense"], sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Legs"], mustTarget: true, noTargetEnemies: true, level:1, type:"buff",
			buffs: [
				{id: "Camo", aura: "#3b7d4f", type: "SlowDetection", duration: 50, power: 49.0, player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["SlowDetection", "moveOpen", "attack", "cast"]}
			], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "ShadowBlade", prerequisite: "ApprenticeShadow", tags: ["buff", "offense", "shadow"], sfx: "MagicSlash", school: "Illusion", manacost: 6, components: ["Arms"], mustTarget: true, level:1, type:"buff",
			buffs: [{id: "ShadowBlade", aura: "#7022a0", type: "AttackDmg", duration: 50, power: 2.0, player: true, enemies: true, maxCount: 5, tags: ["attack", "damage"]}], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "ShadowSlash", tags: ["aoe", "offense", "shadow"], prerequisite: "ShadowBlade", sfx: "Evil", school: "Illusion", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, piercing: true, noTerrainHit: true, noEnemyCollision: true, onhit:"aoe", power: 4, delay: 0, range: 1.5, aoe: 1.5, size: 3, lifetime:1, damage: "cold", speed: 1, time: 2,
			hitevents: [
				{trigger: "bulletHitEnemy", type: "ShadowSlash"},
			],
			trailspawnaoe: 1.5, trailPower: 0, trailLifetime: 1, trailHit: "", trailDamage:"inert", trail:"lingering", trailChance: 0.4},
		{name: "Decoy", tags: ["summon", "utility", "stealth", "defense"], prerequisite: "ApprenticeProjection", sfx: "MagicSlash", school: "Illusion", manacost: 6, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "Decoy", count: 1, time: 20}], power: 0, time: 20, delay: -1, range: 4, size: 1, aoe: 0, lifetime: 1, damage: "fire"},

		{name: "HolyOrb", prerequisite: "ApprenticeLight", tags: ["light", "summon", "defense"], sfx: "MagicSlash", school: "Illusion", manacost: 14, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "HolyOrb", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},

		{name: "ShadowWarrior", prerequisite: "ApprenticeShadow", tags: ["summon", "offense", "shadow", "dot"], sfx: "MagicSlash", school: "Illusion", manacost: 10, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "ShadowWarrior", count: 1, time: 12}], power: 6, time: 12, delay: -1, range: 3.5, size: 1, aoe: 0, lifetime: 1, damage: "inert"},

		{name: "Corona", color: "#ffffff",
			bulletColor: 0xffff77, bulletLight: 5,
			tags: ["light", "offense"], prerequisite: "Light", sfx: "MagicSlash", school: "Illusion", spellPointCost: 1, manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "CoronaBeam", target: "target", directional:true, offset: false}, channel: 2},
		{name: "TrueSight", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge"], school: "Illusion", manacost: 0.8, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive", events: [
			{type: "TrueSight", trigger: "vision"},
			{type: "TrueSight", trigger: "toggleSpell"},
			{type: "Blindness", trigger: "calcStats", power: -1},
			{type: "AccuracyBuff", trigger: "tick", power: 0.4},
		]},
		{name: "EnemySense", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge", "sound"], school: "Illusion", manacost: 0, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive",
			events: [
				{type: "Multiply", trigger: "calcHearing", mult: 3.0},
				{type: "Multiply", trigger: "calcVision", mult: 0.1},
				{type: "PassTime", trigger: "toggleSpell", time: 1}
			]},

		{name: "Sonar", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge", "sound"], school: "Illusion", manacost: 2, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive",
			events: [
				{type: "Sonar", trigger: "toggleSpell", dist: 8, power: 8, time: 1}
			],},
		{name: "Evasion", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 5, components: ["Legs"], mustTarget: true, level:1, type:"buff",
			buffs: [
				{id: "Evasion", type: "Evasion", labelcolor: "#a288b6", duration: 25, power: 3.0, player: true, enemies: true, maxCount: 5, tags: ["defense", "incomingHit"]},
			], onhit:"", time:25, power: 0, range: 2, size: 1, damage: ""},


		{name: "ArrowFireSpell", prerequisite: "ApprenticeFire", tags: ["offense", "aoe", "arrow"], school: "Elements", manacost: 0, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive",
			events: [
				{type: "ArrowFireSpell", trigger: "playerCast", tags: ["arrowreplace"], spell: "ArrowFire", power: 2, aoe: 1.5, time: 3, energyCost: .03, damage: "fire"},
				{type: "ExclusiveTag", trigger: "toggleSpell", tags: ["arrow"]}
			]},
		{name: "ArrowVineSpell", prerequisite: "ApprenticeWater", tags: ["offense", "binding", "utility", "arrow"], school: "Elements", manacost: 0, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive",
			events: [
				{type: "ArrowVineSpell", trigger: "playerCast", tags: ["arrowreplace"], spell: "ArrowVine", bind: 5, time: 3, energyCost: .02, bindType: "Vine", damage: "chain"},
				{type: "ExclusiveTag", trigger: "toggleSpell", tags: ["arrow"]}
			]},
	],
};
/**
 * Spells that are not in the base spell lists
 */
let KinkyDungeonSpellListEnemies: spell[] = [
	{name: "AwakenStrike", tags: ["offense", "latex", "slime", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 2.5, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "glue",
		playerEffect: {name: "Bind", damage: "glue", power: 3, tag: "slimeRestraints"},
		events: [
			{trigger: "bulletHitEnemy", type: "EncaseBound"},
		],
	},

	{name: "CommandVibrateVibeRemote", prerequisite: "CommandWord", tags: ["command", "offense", "aoe", "sexy"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: ["Verbal"], level:2,
		type:"special", special: "CommandVibrateLV2",
		onhit:"", time:30, power: 5, range: 3.5, size: 1, aoe: 3.5, damage: "charm"},
	{name: "CommandVibrateBagOfGoodies", prerequisite: "CommandWord", tags: ["command", "offense", "aoe", "sexy"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: ["Verbal"], level:1,
		chargecost: 0.015,
		type:"special", special: "CommandVibrate",
		onhit:"", time:15, power: 5, range: 3.5, size: 1, aoe: 2.5, damage: "charm"},


	/** The following are particle effects */
	{name: "OrgasmStrike", tags: ["offense", "nature", "binding"], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyCM1", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyCM2", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyCM3", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyLock1", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EnemyMiscast", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, noblock: true, power: 0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "Summon", faction: "Enemy", school: "Any", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", time:0, power: 0, delay: 0, range: 4, size: 1, lifetime: 1, damage: "inert"},
	{name: "BladeDanceBullet", bulletSpin: 0.5, school: "Any", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", time:0, power: 0, delay: 0, range: 4, size: 3, lifetime: 1, damage: "inert"},
	{name: "DistractionBurstBullet", bulletSpin: 0.5, school: "Any", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", time:0, power: 0, delay: 0, range: 4, size: 1, lifetime: 1, damage: "inert"},

	/** End particle effects */

	{name: "BindRope", tags: ["offense", "rope", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, noblock: true, power: 3.0, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "chain",
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "ropeRestraints"},
	},
	{name: "BindFabric", tags: ["offense", "fabric", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, noblock: true, power: 3.0, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "glue",
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "ribbonRestraints"},
	},
	{name: "BindVine", tags: ["offense", "nature", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, noblock: true, power: 3.0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "crush",
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "vineRestraints"},
	},
	{name: "BindChain", tags: ["offense", "metal", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, noblock: true, power: 3.0, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "crush",
		events: [{trigger: "bulletHitEnemy", type: "DisarmHumanoid", time: 8}],
		playerEffect: {name: "Bind", damage: "crush", power: 2, tag: "chainRestraints"},
	},
	{name: "BindBelt", tags: ["offense", "leather", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: true, noblock: true, power: 0, bind: 4.0, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "chain",
		events: [{type: "MakeVulnerable", trigger: "beforeDamageEnemy", time: 3,},],
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "leatherRestraints"},
	},


	{name: "SagittaBolt", castCondition: "FloatingWeapon", prerequisite: "TelekineticSlash", tags: ["telekinesis", "offense"], sfx: "Lightning", school: "Conjure",
		manacost: 1.5, components: ["Legs"], level:1, type:"bolt", slowStart: true, projectileTargeting:true, onhit:"", power: 0.0, delay: 0, time: 1, range: 4.99, speed: 5, size: 1, damage: "pierce",
		bulletLifetime: 5,
		events: [
			{trigger: "bulletHitEnemy", type: "Sagitta", mult: 0.4, power: 1},
		],
	},

	{name: "GagBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "chain", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "gagSpell"},
		events: [
			{type: "ElementalIfNotSilenced", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 8},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "AMGagBolt", tags: ["binding", "leather", "bolt", "offense", "antimagic"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		bindType: "Magic",
		tease: true,
		projectileTargeting:true, onhit:"", time: 0,  power: 5, delay: 0, range: 15, damage: "arcane", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "arcane", power: 2, tags: ["gagSpell", "antiMagic", "forceAntiMagic"]},
		events: [
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 15},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "ArmbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, noblock: true, damage: "chain", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "armbinderSpell"},
		events: [
			{type: "RemoveBlock", trigger: "bulletHitEnemy", power: 2},
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 14},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "silenced"},
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "blinded"},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "LegbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 11,  power: 4.0, delay: 0, range: 15, damage: "chain", noblock: true, speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 4, tag: "legbinderSpell"},
		events: [
			{type: "ElementalIfNotSnared", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},


	{name: "LatexGagBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		bindType: "Latex",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "glue", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 2, tag: "latexgagSpell"},
		events: [
			{type: "ElementalIfNotSilenced", trigger: "bulletHitEnemy", damage: "glue", power: 0, bind: 4},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 15},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{name: "LatexArmbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, noblock: true, damage: "glue", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 2, tag: "latexarmbinderSpell"},
		events: [
			{type: "RemoveBlock", trigger: "bulletHitEnemy", power: 2},
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 14},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "silenced"},
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "blinded"},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{name: "LatexLegbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 11,  power: 4.0, delay: 0, range: 15, damage: "glue", noblock: true, speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 4, tag: "latexlegbinderSpell"},
		events: [
			{type: "ElementalIfNotSnared", trigger: "bulletHitEnemy", damage: "glue", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{enemySpell: true, name: "EnemyEnchantRope", castCondition: "EnemyEnchantRope", color: "#ff5277", tags: ["rope", "utility", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "Freeze", school: "Conjure", manacost: 5.5, components: ["Verbal"],
		level:1, type:"inert", onhit:"aoe", evadeable: false, noblock: true, power: 1.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "arcane", delay: 1,
		playerEffect: {name: "EnchantRope", power: 1},
		events: [
			{type: "EnchantRope", trigger: "bulletHitEnemy", mult: 0.5},
		]},

	{enemySpell: true, name: "EnemyEnchantRope2", castCondition: "EnemyEnchantRope2", color: "#92e8c0", tags: ["rope", "utility", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "Freeze", school: "Conjure", manacost: 5.5, components: ["Verbal"],
		level:1, type:"inert", onhit:"aoe", evadeable: false, noblock: true, power: 1.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "arcane", delay: 1,
		playerEffect: {name: "EnchantRope", power: 3},
		events: [
			{type: "EnchantRope", trigger: "bulletHitEnemy", mult: 1.0},
		]},

	{enemySpell: true, name: "EnemyEnchantRope3", castCondition: "EnemyEnchantRope3", color: "#92e8c0", tags: ["rope", "utility", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "Freeze", school: "Conjure", manacost: 5.5, components: ["Verbal"],
		level:1, type:"inert", onhit:"aoe", evadeable: false, noblock: true, power: 1.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "arcane", delay: 1,
		playerEffect: {name: "EnchantRope", power: 4},
		events: [
			{type: "EnchantRope", trigger: "bulletHitEnemy", mult: 1.0},
		]},

	{enemySpell: true, name: "EnemyLatexRestraintBolt", tags: ["binding", "leather", "bolt", "offense"], sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 4, components: ["Arms"], level:1, type:"bolt",
		bindType: "Latex", slowStart: true, color: "#9abcf7",
		alwaysWarn: true,
		projectileTargeting:true, onhit:"", time: 0,  power: 3.0, delay: 0, range: 15, damage: "glue", speed: 3.5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", time: 3, power: 3, tags: ["latexheelSpell", "latexcatsuitSpell", "latexcorsetSpell"]},
		effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{enemySpell: true, name: "EnemyLatexGagBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 4, components: ["Arms"], level:1, type:"bolt",
		slowStart: true, color: "#9abcf7",
		alwaysWarn: true,
		bindType: "Latex",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "glue", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 2, tag: "latexgagSpell"},
		events: [
			{type: "ElementalIfNotSilenced", trigger: "bulletHitEnemy", damage: "glue", power: 0, bind: 4},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 15},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{enemySpell: true, name: "EnemyLatexArmbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 5, components: ["Arms"], level:1, type:"bolt",
		slowStart: true, color: "#9abcf7",
		alwaysWarn: true,
		bindType: "Latex",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, noblock: true, damage: "glue", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 2, tag: "latexarmbinderSpell"},
		events: [
			{type: "RemoveBlock", trigger: "bulletHitEnemy", power: 2},
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 14},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "silenced"},
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "blinded"},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
	},
	{enemySpell: true, name: "EnemyLatexLegbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 5, components: ["Arms"], level:1, type:"bolt",
		slowStart: true, color: "#9abcf7",
		alwaysWarn: true,
		bindType: "Latex",
		projectileTargeting:true, onhit:"", time: 11,  power: 4.0, delay: 0, range: 15, damage: "glue", noblock: true, speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "glue", power: 4, tag: "latexlegbinderSpell"},
		events: [
			{type: "ElementalIfNotSnared", trigger: "bulletHitEnemy", damage: "glue", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},

	{enemySpell: true, name: "EnemySummonLatexRestraint", prerequisite: "ApprenticeLatex", tags: ["latex", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
		sfx: "MagicSlash", school: "Conjure", manacost: 5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
		time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "EnemyLatexRestraintBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
	{enemySpell: true, name: "EnemySummonLatexGag", prerequisite: "ApprenticeLatex", tags: ["latex", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
		castCondition: "latexGagSpell",
		sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
		time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "EnemyLatexGagBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
	{enemySpell: true, name: "EnemySummonLatexArmbinder", prerequisite: "SummonLatexGag", tags: ["latex", "bolt", "binding", "burst", "armbinder", "utility", "offense"], components: ["Arms"], noise: 1,
		castCondition: "latexArmbinderSpell",
		sfx: "MagicSlash", school: "Conjure", manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
		time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "EnemyLatexArmbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
	{enemySpell: true, name: "EnemySummonLatexLegbinder", prerequisite: "SummonLatexGag", tags: ["latex", "bolt", "binding", "burst", "legbinder", "utility", "offense"], components: ["Arms"], noise: 1,
		castCondition: "latexLegbinderSpell",
		sfx: "MagicSlash", school: "Conjure", manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
		time: 0, delay: 1, power: 4, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "EnemyLatexLegbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "RubberBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},


	{name: "LeatherCuffsBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 1.0, bind: 4, delay: 0, range: 15, damage: "chain", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "leathercuffsSpell"},
		events: [
			{type: "ApplyGenBuff", trigger: "bulletHitEnemy", buff: "RestraintDisarmLight", time: 9999},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "BlindfoldBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "chain", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "blindfoldSpell"},
		events: [
			{type: "ElementalIfNotBlinded", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 20},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "CuffsBolt", tags: ["binding", "metal", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 4, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 3.0, delay: 0, range: 15, damage: "chain", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 3, tag: "cuffsSpell"},
		events: [
			{type: "ElementalIfNotDisarmed", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 6},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Chains",
			duration: 20,
		},
	},
	{name: "HarnessBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, damage: "chain", noblock: true, speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 5, tag: "harnessSpell"},
		events: [
			{type: "BoundBonus", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "StraitjacketBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"buff", time: 0, bind: 12, power: 1.0, delay: 0, range: 6, noblock: true, damage: "crush", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 5, tag: "jacketSpell"},
		buffs: [
			{id: "StraitjacketBolt", aura: "#ff4400", type: "Locked", duration: 14, power: 2.0, player: true, enemies: true, tags: ["lock", "debuff"]},
		],
		events: [
			{type: "RemoveBlock", trigger: "bulletHitEnemy", power: 3},
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 10},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.75, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},

	// A puff of smoke
	{name: "SmokePuff", school: "Illusion", manacost: 1, components: ["Verbal"], level:1, type:"inert", buffs: [
		{id: "SmokePuff", type: "Evasion", power: 3.0, player: true, enemies: true, tags: ["darkness"], range: 0.5},
		{id: "SmokePuff2", type: "Sneak", power: 3.0, player: true, duration: 1, enemies: true, tags: ["darkness"], range: 0.5}
	], onhit:"", time:5, aoe: 0.5, power: 0, delay: 2, delayRandom: 5, range: 4, size: 1, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "SteamPuff", school: "Illusion", manacost: 1, components: ["Verbal"], level:1, type:"inert", buffs: [
		{id: "SmokePuff", type: "Evasion", power: 5.0, player: true, enemies: true, tags: ["darkness"], range: 0.5},
		{id: "SmokePuff2", type: "Sneak", power: 3.0, player: true, duration: 1, enemies: true, tags: ["darkness"], range: 0.5}
	], onhit:"", time:5, aoe: 0.5, power: 0, delay: 2, delayRandom: 5, range: 4, size: 1, damage: ""},

	{name: "LesserInvisibility", sfx: "MagicSlash", school: "Illusion", manacost: 0, components: ["Verbal"], mustTarget: true, level:1, type:"buff", buffs: [{id: "LesserInvisibility", aura: "#888888", type: "Sneak", duration: 10, power: 3, player: true, enemies: true, tags: ["invisibility"]}], onhit:"", time:10, power: 0, range: 1.5, size: 1, damage: ""},


	// Divine Gifts
	{name: "Disarm", tags: ["weapon"], sfx: "Chain", school: "Illusion", manacost: 0, components: [], level:1, type:"special", special: "Disarm", noMiscast: true,
		onhit:"", time:5, power: 0, range: 3.99, size: 1, damage: ""},
	{name: "Freedom", sfx: "Magic", hitsfx: "Struggle", school: "Conjure", manacost: 15, components: [], mustTarget: true, selfTargetOnly: true, level:5, type:"hit",
		onhit:"instant", time:4, lifetime: 1, bind: 8, delay: 1, power: 4, aoe: 2.99, range: 1.5, size: 5, damage: "chain", playerEffect: {name: "RemoveLowLevelRope"}},

	{allySpell: true, name: "BeltStrike", noise: 2, sfx: "Struggle", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 4, delay: 0, range: 4, speed: 4, size: 1, damage: "inert",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0,
		trailcast: {spell: "SingleBelt", target: "onhit", directional:true, offset: false}},

	{allySpell: true, name: "SingleBelt", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, bind: 4, range: 2, size: 1, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings",  text: "KinkyDungeonTrapBindingsLeatherWeak", tags: ["leatherRestraints", "leatherRestraintsHeavy"], power: 3, damage: "chain", count: 2, noGuard: true}},
	{allySpell: true, name: "Slimethrower", landsfx: "FireSpell", noMiscast: true, manacost: 0, components: ["Legs"], level:1, type:"hit", onhit:"lingering", time: 3, range: 3.9, power: 3.5, size: 1, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{allySpell: true, name: "Slimethrower2", landsfx: "FireSpell", manacost: 0, components: [], level:1, type:"hit", onhit:"lingering", time: 3, range: 3.9, power: 2.5, size: 1, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{name: "SlimeSuit", sfx: "MagicSlash", school: "Illusion", manacost: 5, components: [], level:1, type:"special", special: "dress", outfit: "SlimeSuit", noMiscast: true,
		onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

	{name: "DildoBatBuff", sfx: "Vibe", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, level:1, type:"buff", noMiscast: true,
		buffs: [
			{
				id: "DildoBatBuff", type: "DildoBatBuff", duration: 11, power: 3.0, player: true, enemies: false, tags: [],
				aura: "#ffff55", events: [
					{trigger: "playerAttack", type: "ElementalEffect", crit: 3.0, power: 3.0, damage: "charm", prereq: "HaveDildoBatPlus"},
				]
			},
		], onhit:"", time:10, power: 3.0, range: 2, size: 1, damage: "",
	},

	{name: "SlimeForm", sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Verbal"], mustTarget: true, level:1, type:"buff", noMiscast: true,
		buffs: [
			{id: "SlimeForm", type: "glueDamageResist", aura: "#ff00ff", duration: 25, power: 0.5, player: true, enemies: false, tags: ["defense"]},
			{id: "SlimeForm2", type: "Squeeze", duration: 25, power: 0.5, player: true, enemies: false, tags: ["mobility"]},
			{id: "SlimeForm3", type: "Evasion", duration: 25, power: 0.5, player: true, enemies: false, tags: ["defense"]},
			{id: "SlimeForm4", type: "Counterattack", duration: 25, power: 2.5, player: true, enemies: false, tags: ["counter"], events: [
				{trigger: "beforeAttack", type: "CounterattackDamage", power: 2.5, damage: "glue", prereq: "hit-hostile"},
			]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: "",
		extraCast: [{spell: "Slimethrower2"}, {spell: "SlimeSuit"}]},
	{name: "AvatarForm", sfx: "PowerMagic", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, level:1, type:"buff", noMiscast: true,
		buffs: [
			{id: "AvatarFire", aura: "#f1641f", type: "event", duration: 9999, infinite: true, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_fire", "trigger_fire"], events: [
				{trigger: "calcMana", type: "AvatarFire", power: 5.0},
			]},
			{id: "AvatarWater", aura: "#2789cd", type: "event", duration: 9999, infinite: true, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_water", "trigger_water"], events: [
				{trigger: "calcMana", type: "AvatarWater", power: 5.0},
			]},
			{id: "AvatarAir", aura: "#c9d4fd", type: "event", duration: 9999, infinite: true, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_air", "trigger_air"], events: [
				{trigger: "calcMana", type: "AvatarAir", power: 5.0},
			]},
			{id: "AvatarEarth", aura: "#61a53f", type: "event", duration: 9999, infinite: true, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_earth", "trigger_earth"], events: [
				{trigger: "calcMana", type: "AvatarEarth", power: 5.0},
			]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: ""},


	// Rest of the spells
	{name: "ShockStrike", sfx: "Shock", manacost: 1, bulletColor: 0x8888ff, bulletLight: 2,
		hitColor: 0x8888ff, hitLight: 6, components: ["Arms"], level:1, type:"hit", noTerrainHit: true, onhit:"aoe", time: 1, delay: 1, power: 2.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "StaticSphereStrike", sfx: "Shock", manacost: 2, bulletColor: 0x8888ff, bulletLight: 2,
		hitColor: 0x8888ff, hitLight: 6, components: ["Verbal"], level:1, type:"hit", noTerrainHit: true, onhit:"aoe", time: 1, delay: 1, power: 1.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "LightningRuneStrike", bulletColor: 0x8888ff, bulletLight: 2, tags: ["electric", "trap", "rune"],
		hideWarnings: true,
		crit: 2,
		events: [
			{trigger: "countRune", type: "rune"},
		],
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		hitColor: 0x8888ff, hitLight: 6, hitsfx: "Shock", manacost: 2, components: ["Legs"], level:1, type:"dot",
		noTerrainHit: true, onhit:"", time: 4, delay: 3000, power: 4.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "FlameRuneStrike", bulletColor: 0xb83716, bulletLight: 2, tags: ["fire", "trap", "rune"],
		hideWarnings: true,
		crit: 2,
		events: [
			{trigger: "countRune", type: "rune"},
		],
		hitColor: 0xe64539, hitLight: 6, hitsfx: "Lightning", manacost: 2, components: ["Legs"], noDirectHit: true,
		level:1, type:"dot", noTerrainHit: true, onhit:"aoe", delay: 3000, power: 5.5, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "fire"},
	{name: "RopeRuneStrike", bulletColor: 0xff73ef, bulletLight: 2, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		crit: 2,
		effectTileDurationMod: 10, effectTile: {
			name: "Ropes",
			duration: 20,
		},
		events: [
			{trigger: "countRune", type: "rune"},
		],
		hitColor: 0xff73ef, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["ropeMagicWeak"], msg: "Rope"},
		noTerrainHit: true, onhit:"aoe", delay: 3000, noDirectHit: true,
		power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},
	{name: "FreezeRuneStrike", hitsfx: "Freeze", manacost: 2, bulletColor: 0x8888ff, bulletLight: 2, tags: ["ice", "trap", "rune"],
		hideWarnings: true,
		crit: 2,
		events: [
			{trigger: "countRune", type: "rune"},
		],
		hitColor: 0x8888ff, hitLight: 6, components: ["Legs"], level:1, type:"dot", noTerrainHit: true, onhit:"", time: 30, delay: 3000, power: 3.0, range: 2, size: 3, aoe: 0.5, lifetime: 1, damage: "ice"},
	{name: "EarthformSingle", tags: ["earth", "utility", "summon"], noSprite: true, minRange: 0, landsfx: "Bones", hideUnlearnable: true, manacost: 4, components: ["Legs"], prerequisite: ["Earthform"],
		level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", faction: "Rock" , count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 4, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},

	{name: "DarkShroud", sfx: "FireSpell", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "DarkShroud", type: "Evasion", power: 1.5, player: false, enemies: true, tags: ["heavydarkness"], range: 1.5},],
		onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: "",
		effectTileDurationModPre: 3, effectTilePre: {
			name: "Smoke",
			duration: 8,
		}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Slippery", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
		buffs: [
			{id: "Slippery", aura: "#4fd658", type: "BoostStruggle", duration: 100, power: 0.1, player: true, enemies: false, tags: ["struggle"]},
		], onhit:"", time:100, power: 0, range: 2, size: 1, damage: ""},
	{name: "Cutting", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
		buffs: [
			{id: "Cutting", aura: "#e7cf1a", type: "BoostCutting", duration: 10, power: 0.3, player: true, enemies: false, tags: ["struggle"]},
			{id: "Cutting2", type: "BoostCuttingMinimum", duration: 10, power: 0.8, player: true, enemies: false, tags: ["struggle", "allowCut"]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: ""},
	{enemySpell: true, name: "EnemyCorona",
		bulletColor: 0xffff77, bulletLight: 5,
		minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "EnemyCoronaBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "EnemyCoronaBeam",
		trailColor: 0xffff77, trailLight: 3, slowStart: true, color: "#ffff88", noise: 1,
		events: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 12},
		],
		sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 4, delay: 0, range: 8, speed: 50, size: 1, damage: "holy",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "CoronaShock", time: 3}},
	{enemySpell: true, name: "MonolithBeam",
		bulletColor: 0xff5555, bulletLight: 5,
		minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "MonolithBeamBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "MonolithBeamBeam",
		trailColor: 0xff5555, trailLight: 3, slowStart: true, color: "#ff5555", noise: 1,
		sfx: "MagicSlash", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 6, delay: 0, range: 8, speed: 50, size: 1, damage: "soul",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "CrystalBind", time: 3}},

	{enemySpell: true, name: "ObserverBeam", noDirectionOffset: true, color: "#bc4a9b",
		bulletColor: 0xff5555, bulletLight: 5,
		minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 6, range: 6, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "ObserverBeamBeam", target: "target", directional: false, offset: false}, channel: 2},
	{enemySpell: true, name: "ObserverBeamBeam",
		trailColor: 0xff5555, trailLight: 3, slowStart: true, color: "#bc4a9b", noDoubleHit: true,
		sfx: "Evil", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, piercing: true, nonVolatile: true, onhit:"", power: 6, delay: 0, range: 6, speed: 50, size: 1, damage: "soul",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "ObserverBeam", count: 1}},


	{enemySpell: true, name: "ClericBeam",
		bulletColor: 0x88ff88, bulletLight: 5,
		color: "#88ff88", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "ClericBeamBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "ClericBeamBeam",
		trailColor: 0x88ff88, trailLight: 3, slowStart: true, color: "#88ff88", noise: 1,
		sfx: "MagicSlash", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 6, delay: 0, range: 8, speed: 50, size: 1, damage: "fire",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "MysticShock", time: 3}},



	{name: "Pickaxe", tags: ["pickaxe", "melee"], color: "#88ff88", sfx: "HeavySwing", manacost: 0, noMiscast: true, components: [], level: 1,
		type:"special",
		special: "Pickaxe",
		faction: "Player",
		staminacost: 0,
		CastInWalls: true,
		onhit:"", power: 2.5, delay: 0, range: 1.5, damage: "pierce", speed: 1.5},

	{name: "ArrowNormal", tags: ["arrowreplace"], color: "#88ff88", sfx: "Arrow", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		faction: "Player",
		staminacost: 2,
		crit: 1.5,
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		projectileTargeting:true, onhit:"", power: 2.5, delay: 0, range: 7.5, damage: "pierce", speed: 2.5},
	{name: "ArrowRecurve", tags: ["arrowreplace"], color: "#88ff88", sfx: "Arrow", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		faction: "Player",
		staminacost: 3.5,
		crit: 1.5,
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 8.5, damage: "pierce", speed: 3},
	{name: "ArrowLongbow", tags: ["arrowreplace"], color: "#88ff88", sfx: "Arrow", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		faction: "Player",
		staminacost: 6.0,
		crit: 1.5,
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		projectileTargeting:true, onhit:"", power: 6.0, delay: 0, range: 10, damage: "pierce", speed: 3.5},
	{name: "ArrowBolt", tags: ["arrowreplace"], color: "#88ff88", sfx: "ArrowBolt", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		crit: 2.0,
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		faction: "Player",
		projectileTargeting:true, onhit:"", power: 6.5, delay: 0, range: 10, damage: "pierce", speed: 3},
	{name: "ArrowBoltPistol", tags: ["arrowreplace"], color: "#88ff88", sfx: "ArrowBolt", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		crit: 2.0,
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		faction: "Player",
		projectileTargeting:true, onhit:"", power: 4.5, delay: 0, range: 7.5, damage: "pierce", speed: 2.5},
	{name: "ArrowBoltHeavy", tags: ["arrowreplace"], color: "#88ff88", sfx: "ArrowBolt", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt",
		crit: 2.5, pierceEnemies: true,
		faction: "Player",
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		projectileTargeting:true, onhit:"", power: 7, delay: 0, range: 14, damage: "pierce", speed: 4},

	{name: "ArrowFire", tags: ["arrowspecial"], color: "#e7cf1a", sfx: "FireSpell", landsfx: "Lightning", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt", projectileTargeting:true,
		crit: 1.5,
		faction: "Player",
		effectTileDurationMod: 12, effectTile: {
			name: "Ember",
			duration: -4,
		},
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		onhit:"aoe", power: 4, noDirectDamage: true, delay: 0, range: 7.5, aoe: 1.5, lifetime: 1, damage: "fire", speed: 2.5, playerEffect: {name: "HeatBlast", time: 1, damage: "fire", power: 4}},
	{name: "ArrowVine", tags: ["arrowspecial"], color: "#55ff55", sfx: "FireSpell", landsfx: "MagicSlash", manacost: 0, noMiscast: true, components: [], level: 1, type:"bolt", projectileTargeting:true,
		crit: 1.5,
		faction: "Player",
		bindType: "Vine",
		effectTileDurationMod: 10, effectTile: {
			name: "Vines",
			duration: 20,
		},
		events: [
			{trigger: "bulletHitEnemy", type: "Arrow"},
		],
		onhit:"", power: 4, delay: 0, range: 7.5, bind: 8, lifetime: 1, damage: "chain", speed: 2.5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "vineRestraints"}},

	{name: "BlasterBlast", hitsfx: "Shock", sfx: "Laser", school: "Elements", manacost: 0, components: [], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.5, time: 1, delay: 0,
		bulletColor: 0xffff00, bulletLight: 5, noMiscast: true,
		events: [
			{trigger: "bulletHitEnemy", type: "Blaster"},
		],
		range: 8, speed: 3, size: 1, damage: "electric", playerEffect: {name: "Shock", time: 3}},
	{enemySpell: true, name: "EnemyBlast", noFirstChoice: true, hitsfx: "Shock", sfx: "Laser", school: "Elements", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.5, time: 1, delay: 0,
		bulletColor: 0x00ffff, bulletLight: 5,
		range: 8, speed: 3, size: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}},

	{allySpell: true, name: "AllyHolyBolt", hitsfx: "Shock", sfx: "Laser", school: "Elements", manacost: 4, components: [], level:1, type:"bolt", projectileTargeting:true, onhit:"aoe", power: 2.0, time: 1, delay: 0, aoe: 1.5, lifetime: 1,
		bulletColor: 0xffff88, bulletLight: 5,
		events: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 8},
		],
		range: 7.99, speed: 2, size: 1, damage: "holy"},


	{name: "BondageBust", noise: 7, sfx: "Laser", school: "Illusion", manacost: 0, components: [], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		bulletColor: 0xffff00, bulletLight: 5,
		spellcast: {spell: "BondageBustBeam", target: "target", directional:true, offset: false}, noMiscast: true, channel: 1},
	{name: "BondageBustBeam", hitsfx: "Shock", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 3, time: 3, delay: 0, range: 8, speed: 50, size: 1, damage: "electric",
		trailColor: 0xffff00, trailLight: 3, crit: 1.5, bind: 3, bindType: "Energy",
		events: [
			{trigger: "bulletHitEnemy", type: "Blaster"},
		],
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "Shock", time: 3}},
	{name: "HeartArrow", sfx: "MagicSlash", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "soul", speed: 2,
		events: [
			{type: "GreaterRage", trigger: "bulletHitEnemy"},
		],
	},


	{enemySpell: true, name: "BearTrap", tags: ["fire", "offense", "defense"], noise: 0, sfx: "Miss", school: "Elements", spellPointCost: 1, manacost: 4,
		components: ["Legs"], level:1, type:"inert",
		selfcast: true,
		onhit:"aoe", delay: 2, power: 2, range: 2.99, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "BearTrapStrike", target: "onhit", directional:false, offset: false}},
	{enemySpell: true, name: "BearTrapStrike", bulletColor: 0xaaaaaa, hideWarnings: true,
		hitsfx: "Clang", manacost: 2, components: ["Legs"], level:1, type:"dot", noTerrainHit: true, onhit:"", delay: 20, power: 1, range: 2, bind: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "chain",
		playerEffect: {name: "BearTrapStun", count: 1, power: 2.0, damage: "chain", time: 3}},

	{name: "MoiraiScissors", tags: ["defense", "offense"], school: "Special", chargecost: 0.05, manacost: 0, customCost: "SprintPlusAttack", components: [], level:1, type:"special", special: "MoiraiScissors", noMiscast: true,
		onhit:"", time:25, power: -1, range: 4.5, size: 1, damage: ""},

	{name: "CoronaBeam", sfx: "FireSpell",
		trailColor: 0xffff77, trailLight: 3, noise: 2, crit: 1.5,
		events: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 12},
		],
		school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 12, delay: 0, range: 8, speed: 50, size: 1, damage: "holy",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1},
	{name: "AllyCrackle", sfx: "Shock", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 4, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0},
	{allySpell: true, name: "AllyFirebolt", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4.5, delay: 0, range: 50, damage: "fire", speed: 3},
	{allySpell: true, name: "AllyWindBlast", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", power: 2.0, time: 2, delay: 0, range: 50, damage: "stun", speed: 1, hitSpin: 1, bulletSpin: 1,
		events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 1.0, dist: 1.0},]},
	{enemySpell: true, name: "EnemyWindBlast", tags: ["air", "bolt", "offense", "utility"],
		slowStart: true,
		prerequisite: "ApprenticeAir", sfx: "FireSpell", school: "Elements", manacost: 2.5, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", power: 1.0, time: 2, delay: 0, range: 2.99, damage: "stun", speed: 3, hitSpin: 1, bulletSpin: 1,
		shotgunCount: 3, shotgunDistance: 4, shotgunSpread: 3, shotgunSpeedBonus: 1,
		playerEffect: {name: "EnemyWindBlast", power: 0.5, damage: "stun", dist: 1.0},
		events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 1.0, dist: 1.0},]},
	{allySpell: true, name: "AllyShadowStrike", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 6, time: 2, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold"},
	{allySpell: true, name: "HeelShadowStrike", sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 2.5, time: 4, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold"},
	{allySpell: true, name: "FlameStrike", sfx: "FireSpell", school: "Element", manacost: 6, components: [], level:1, type:"inert", onhit:"aoe", noTerrainHit: true, power: 3, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "fire"},
	{allySpell: true, name: "ShatterStrike", sfx: "MagicSlash", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 1.5, delay: 1, range: 1.5, time: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "frost"},
	{name: "Ignition", faction: "Rage", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 1.5, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "fire", playerEffect: {name: "Ignition", power: 1, damage: "fire"}},
	{name: "VolcanicStrike", school: "Element", manacost: 0, components: [], level:1, hitsfx: "Lightning", type:"hit", onhit:"instant", noTerrainHit: true, power: 6.0, delay: 1, range: 1.5, size: 5, aoe: 2.99, damageFlags: ["VolcanicDamage"], lifetime: 1, damage: "fire", playerEffect: {name: "Damage"}},
	{allySpell: true, name: "ArcaneStrike", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 2.5, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "arcane"},
	{enemySpell: true, name: "ShadowStrike", sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 6, time: 2, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold", playerEffect: {name: "ShadowStrike", damage: "cold", power: 4, count: 1}},


	{name: "RopeBolt", color: "#e7cf1a", sfx: "Miss", school: "Conjure", manacost: 1, tags: ["rope"], components: ["Verbal"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"",  power: 1.0, bind: 3.2, delay: 0, range: 50, damage: "chain", bindType: "Rope", speed: 3, playerEffect: {name: "SingleRope"},
		evadeable: true,
		effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Ropes",
			duration: 20,
		},},


	{enemySpell: true, name: "WitchRopeBoltLaunchMany", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "RopeBoltLaunch", sfx: "MagicSlash", school: "Conjure",
		upcastFrom: "RopeBoltLaunch", upcastLevel: 1, specialCD: 20, hideWarnings: true,
		noSprite: true,
		manacost: 5, components: ["Verbal"], projectileTargeting: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 6, power: 1, range: 7, meleeOrigin: true, noDirectionOffset: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		followCaster: true,
		spellcast: {spell: "WitchRopeBoltLaunchSingle", target: "target", directional:true, aimAtTarget: true, offset: false}},
	{enemySpell: true, name: "WitchRopeBoltLaunchSingle", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "ApprenticeRope", school: "Conjure",
		manacost: 1, components: ["Verbal"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 1, range: 9, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		noMiscast: false, noCastOnHit: false, fastStart: true, hideWarnings: true, landsfx: "FireSpell",sfx: "FireSpell",hitsfx: "FireSpell",
		shotgunCount: 1, shotgunDistance: 6, shotgunSpread: 0.1, shotgunSpeedBonus: 0, shotgunFan: true,
		spellcast: {spell: "WitchRope", target: "target", directional:true, randomDirectionPartial: true, aimAtTarget: true, noTargetMoveDir: true, offset: false}},

	{name: "RopeBoltLaunchSingle", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "MagicSlash", school: "Conjure",
		manacost: 1, components: ["Verbal"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 1, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		noMiscast: false, noCastOnHit: false,
		shotgunCount: 1, shotgunDistance: 6, shotgunSpread: 0.1, shotgunSpeedBonus: 0, shotgunFan: true,
		spellcast: {spell: "RopeBolt", target: "target", directional:true, randomDirectionPartial: true, aimAtTarget: true, noTargetMoveDir: true, offset: false}},


	{name: "Icicle", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4,
		power: 3, delay: 0, range: 50, damage: "frost", speed: 2, playerEffect: {name: "Damage"},
		evadeable: true,
		bulletColor: 0x92e4e8, bulletLight: 3,
		events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 3, power: 0},]},
	{name: "Boulder", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 3, components: ["Arms"], level:1,
		noise: 5,
		type:"bolt", projectileTargeting:true, onhit:"", block: 8, time: 4,  power: 4, delay: 0, range: 50, damage: "crush", speed: 2, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns
	{allySpell: true, name: "BoulderKicked", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4,  power: 4, delay: 0, range: 50, damage: "crush", speed: 3.5, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns
	{name: "BigBoulder", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 7, components: ["Arms"], level:1, type:"bolt", noDirectDamage: true,
		noise: 7,
		projectileTargeting:true, alwaysCollideTags: ["summonedRock"], onhit:"aoe", block: 20, time: 8,  power: 12, aoe: 1.5, size: 3, delay: 0, lifetime: 1, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns


	{enemySpell: true, name: "Ribbons", color: "#6700ff", noise: 6, sfx: "Struggle", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 3, delay: 0, range: 4, speed: 4, size: 1, damage: "inert",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0,
		trailcast: {spell: "SingleRibbon", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "SingleRibbon", color: "#6700ff", sfx: "Struggle", manacost: 4, components: [], level:1,
		effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Fabric",
			duration: 20,
		},
		type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, range: 2, size: 1, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings",  text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], power: 3, damage: "chain", count: 1, noGuard: true}},

	{enemySpell: true, msg: true, name: "AreaElectrify", minRange: 0, landsfx: "Shock", school: "Conjure", specialCD: 10, manacost: 10, components: ["Legs"], level:1, type:"inert", onhit:"cast",
		dot: true, time: 4, delay: 3, range: 2.5, size: 3, aoe: 2.5, lifetime: 1, power: 1, damage: "inert",
		spellcasthit: {spell: "WitchElectrify", target: "onhit", chance: 0.22, directional:false, offset: false}, channel: 2},

	{enemySpell: true, name: "IceDragonBreath", color: "#00ffff", sfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", time: 1, power: 4, delay: 0, range: 4, speed: 50, size: 1, damage: "inert",
		trailPower: 4, trailLifetime: 1, trailLifetimeBonus: 4, trailTime: 3, trailspawnaoe: 1.5, trailDamage:"ice", trail:"lingering", trailChance: 0.3, trailPlayerEffect: {name: "Freeze", damage: "ice", time: 3}},
	{enemySpell: true, name: "IceDragonBreathPrepare", color: "#00ffff", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 5, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "IceDragonBreath", target: "target", directional:true, offset: false}, channel: 2},

	{enemySpell: true, name: "IceSlow", color: "#00ffff", sfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 1, delay: 0, time: 2, range: 4, speed: 50, size: 1, damage: "inert",
		trailPower: 4, trailLifetime: 2, trailLifetimeBonus: 8, trailTime: 3, trailspawnaoe: 1.5, trailDamage:"ice", trail:"lingering", trailChance: 0.5, trailPlayerEffect: {name: "Chill", time: 3, damage: "ice", power: 1}},
	{enemySpell: true, name: "IceSlowPrepare", color: "#00ffff", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 12, range: 5, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "IceSlow", target: "target", directional:true, offset: false}, channel: 1},

	{name: "SmokeBomb", tags: ["aoe", "buff", "utility", "stealth", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 0, components: [], level:1, type:"inert", buffs: [
		{id: "Shroud", type: "Evasion", power: 7.0, player: true, enemies: true, tags: ["darkness"], range: 1.5},
		{id: "Shroud2", aura: "#444488", type: "Sneak", power: 4.0, player: true, duration: 8, enemies: false, tags: ["darkness"], range: 1.5}
	], onhit:"", time:14, aoe: 1.5, power: 0, delay: 8, range: 3.5, size: 3, damage: "",
	noise: 1,
	noMiscast: true,
	effectTileDurationModPre: 3, effectTilePre: {
		name: "Smoke",
		duration: 8,
	}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.

	{enemySpell: true, name: "EnemyFlashBomb", color: "#ff2200", minRange: 0, sfx: "Miss", landsfx: "Lightning", school: "Illusion", manacost: 3, specialCD: 12, components: ["Verbal"], hideWarnings: true,
		hitColor: 0xffffff, hitLight: 7,
		noise: 4,
		hitevents: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 9},
		],
		level:1, type:"inert", onhit:"aoe", time: 0, delay: 1, power: 1, range: 3.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 3}},

	{name: "FlashBomb", color: "#ff2200", minRange: 0, sfx: "Miss", landsfx: "Lightning", school: "Illusion", manacost: 0, specialCD: 12, components: ["Verbal"], hideWarnings: true,
		noise: 4,
		hitColor: 0xffffff, hitLight: 7,
		noMiscast: true,
		hitevents: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 20},
		],
		level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 1, range: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 6}},
	{name: "Flashbang", color: "#ff2200", minRange: 0, landsfx: "Lightning", school: "Illusion", manacost: 0, specialCD: 12, components: ["Verbal"], hideWarnings: true,
		noise: 9,
		hitColor: 0xffffff, hitLight: 7,
		noMiscast: true,
		hitevents: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 30},
		],
		level:1, type:"hit", onhit:"aoe", time: 6, delay: 1, power: 1, range: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 7}},
	{enemySpell: true, name: "EnemyFlash", color: "#ffffff", minRange: 0, noise: 8, sfx: "FireSpell", school: "Illusion", manacost: 4, components: ["Verbal"], level:1,
		hitColor: 0xffffff, hitLight: 7,
		hitevents: [
			{type: "BlindAll", trigger: "bulletHitEnemy", time: 7},
		],
		type:"inert", onhit:"aoe", time: 3, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 4}},

	{enemySpell: true, name: "SleepGas", color: "#4fd658", sfx: "Miss", school: "Illusion", manacost: 4, specialCD: 24, components: ["Verbal"], level:1, type:"inert", passthrough: true, noTerrainHit: true, buffs: [
		{id: "SleepGas", type: "SleepinessGas", power: 1, player: true, enemies: false, tags: ["sleep", "gas"], range: 1.5}], onhit:"", time:6, aoe: 1.5, power: 1, delay: 8, range: 4, size: 3, damage: "poison", playerEffect: {name: "DamageNoMsg", damage: "poison", power: 1}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.


	{enemySpell: true, name: "GlueBomb", color: "#e7cf1a", minRange: 2.5, sfx: "Miss", school: "Conjure",
		manacost: 2, specialCD: 12, components: ["Arms"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3.5, range: 4.5, size: 3, aoe: 1.5, lifetime: 1,
		effectTileDurationMod: 10, effectTileAoE: 1.5, effectTile: {
			name: "Glue",
			duration: 20,
		},
		damage: "glue", playerEffect: {name: "Glue", count: 3, damage: "glue", power: 4, time: 1}},

	{enemySpell: true, name: "Glue", color: "#e7cf1a", landsfx: "Freeze", school: "Conjure",
		manacost: 9, components: ["Arms"], level:1, type:"inert", onhit:"lingering", time: 4, delay: 1, range: 4, size: 3, aoe: 1.5, lifetime: 24, power: 4, lifetimeHitBonus: 76, damage: "glue",
		playerEffect: {name: "Glue", count: 1, damage: "glue", power: 4, time: 1}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

	{enemySpell: true, name: "RedSlime", sfx: "Miss", manacost: 4, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 4, delay: 0, range: 50, damage: "glue", speed: 1.5, playerEffect: {name: "DamageNoMsg", power: 4, damage: "glue"},
		spellcast: {spell: "SummonSingleRedSlime", target: "onhit", directional:false, offset: false, strict: true}},

	{enemySpell: true, name: "AmpuleBlue", sfx: "Miss", manacost: 5, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 4, delay: 0, range: 50, damage: "glue", speed: 1, playerEffect: {name: "AmpuleBlue", damage: "glue", power: 4, count: 1}},
	{enemySpell: true, name: "LatexBubble", bindType: "Slime", color: "#2789cd", sfx: "RubberBolt", manacost: 4, specialCD: 14, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		pierceEnemies: true,
		time: 3, power: 2, delay: 0, range: 12, damage: "glue", speed: 1, trailLifetime: 10, trailDamage:"glue", trail:"lingering", trailPower: 2, trailChance: 1.0, playerEffect: {name: "LatexBubble", time: 12, power: 2, damage: "glue"},
	},
	{enemySpell: true, name: "AmpuleGreen", sfx: "Miss", manacost: 4, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		spellcast: {spell: "SleepGas", target: "onhit", directional:false, offset: false}},
	{enemySpell: true, name: "AmpuleYellow", sfx: "Miss", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		effectTileDurationMod: 10, effectTileAoE: 1.5, effectTile: {
			name: "Glue",
			duration: 20,
		},
		//spellcast: {spell: "Glue", target: "onhit", directional:false, offset: false}
	},
	{enemySpell: true, name: "AmpuleRed", sfx: "Miss", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		spellcast: {spell: "SummonRedSlime", target: "onhit", directional:true, offset: false}},

	{name: "ManyOrbs", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "ZombieOrbMini", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 2.5, offset: false}, channel: 3},
	{enemySpell: true, name: "ZombieOrbMini", sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 1.5, delay: 0, range: 50, damage: "chain", speed: 1,
		playerEffect: {name: "MysticShock", time: 3}},

	{enemySpell: true, name: "ZombieOrb", sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 2, delay: 0, range: 50, damage: "chain", speed: 1,
		playerEffect: {name: "CharmWraps", power: 2, damage: "ice", time: 1}},
	{enemySpell: true, name: "ZombieOrbIce", color: "#00ffff", specialCD: 12, sfx: "MagicSlash", hitsfx: "Freeze", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, time: 3, onhit:"", power: 3, delay: 0, range: 50, damage: "ice", speed: 1,
		playerEffect: {name: "Freeze", power: 4, damage: "ice", time: 4}},

	{enemySpell: true, name: "SarcoEngulf", castCondition: "sarcoEngulf", color: "#ff2200", sfx: "Fwoosh", effectTileDurationMod: 10, effectTileDensity: 0.33, effectTile: {
		name: "FabricGreen",
		duration: 20,
	}, manacost: 3, minRange: 0, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 3, range: 2.5, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "SarcoEngulf", power: 2, damage: "chain"}},

	{enemySpell: true, name: "SarcoHex", castCondition: "sarcoHex", color: "#ff2200", sfx: "Fwoosh", manacost: 3, minRange: 0, components: ["Verbal"],
		level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, range: 2.5, size: 3, aoe: 1, lifetime: 1, damage: "charm", playerEffect: {name: "SarcoHex", power: 2}},


	{enemySpell: true, name: "RopeEngulf", color: "#ff2200", sfx: "Struggle", effectTileDurationMod: 10, effectTileDensity: 0.33, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 3, minRange: 0, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4.5, range: 2, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "RopeEngulf", power: 3}},
	{enemySpell: true, name: "RopeEngulfWeak", color: "#ff2200", sfx: "Struggle", effectTileDurationMod: 10, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 3, range: 3.5, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "RopeEngulfWeak", power: 1, damage: "chain"}},
	{enemySpell: true, name: "Entangle", color: "#88ff88", minRange: 0, sfx: "Struggle", effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Vines",
		duration: 20,
	}, manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 4, range: 6, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "VineEngulf", power: 2}},

	{enemySpell: true, name: "BubbleBurst", color: "#88ffff", minRange: 0, sfx: "Grope", landsfx: "RubberBolt", effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Water",
		duration: 20,
	}, manacost: 4, specialCD: 12, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 5, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "soap", channel: 2,
	playerEffect: {name: "WaterBubble", power: 5}},

	{enemySpell: true, name: "BubbleBurstLatex", color: "#88aaff", minRange: 0, sfx: "Grope", landsfx: "RubberBolt", effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "LatexThinBlue",
		duration: 20,
	}, manacost: 6, specialCD: 17, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 5, power: 6, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", channel: 4,
	playerEffect: {name: "LatexBubble", power: 6}},

	{enemySpell: true, name: "BubbleBurstSlime", color: "#ff00ff", minRange: 0, sfx: "Grope", landsfx: "RubberBolt", effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Slime",
		duration: 20,
	}, manacost: 4, specialCD: 16, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 5, power: 6, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", channel: 4,
	playerEffect: {name: "SlimeBubble", power: 6, time: 4}},

	{enemySpell: true, name: "CursingCircle", color: "#FF5277", minRange: 0, sfx: "Fwoosh", bulletSpin: 0.1, specialCD: 12,
		selfcast: true, noTerrainHit: true,
		manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 4, delay: 3, power: 4, range: 7, size: 5, aoe: 2.5, lifetime: 1, damage: "soul",
		playerEffect: {name: "CursingCircle", count: 1, kind: "cursedCollar", power: 3.5, damage: "soul", time: 40}},
	{enemySpell: true, name: "CursingCircle2", color: "#8f52ff", minRange: 0, sfx: "Fwoosh", bulletSpin: 0.1, specialCD: 12,
		selfcast: true, noTerrainHit: true,
		manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 4, delay: 3, power: 4, range: 7, size: 5, aoe: 2.5, lifetime: 1, damage: "soul",
		playerEffect: {name: "CursingCircle", count: 1, kind: "cursedCollar2", power: 3.5, damage: "soul", time: 40}},

	{enemySpell: true, name: "GravityPull", meleeOrigin: true, color: "#dddddd", minRange: 0, sfx: "Teleport", bulletSpin: 0.25, hideWarnings: true,
		manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 1, range: 3.5, size: 5, aoe: 2.5, lifetime: 1, damage: "cold", playerEffect: {name: "GravityPull", dist: 2}},

	{enemySpell: true, name: "GravityPullEarth", specialCD: 7, color: "#ff8933", minRange: 0, sfx: "Teleport", bulletSpin: 0.25, hideWarnings: true,
		manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 3, delay: 2, power: 1, range: 4.5, size: 5, aoe: 2.5, lifetime: 1, damage: "crush", playerEffect: {name: "GravityPull", dist: 2, power: 2, damage: "crush"}},

	{enemySpell: true, name: "CrushingFate", color: "#dddddd", minRange: 0, sfx: "MagicSlash", bulletSpin: 0.25,
		manacost: 7, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 4, delay: 6, power: 5, range: 7, size: 5, aoe: 2.5, lifetime: 1, damage: "crush", playerEffect: {name: "MoonBondage", count: 2, kind: "mithrilRestraints"}},
	{enemySpell: true, name: "BoundByFate", color: "#dddddd", minRange: 0, sfx: "MagicSlash", bulletSpin: -0.25,
		manacost: 7, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, range: 7, size: 3, aoe: 1.5, lifetime: 1, damage: "soul", playerEffect: {name: "BoundByFate", time: 6}},
	{enemySpell: true, name: "Taunt", color: "#ff5555", minRange: 0, sfx: "MagicSlash", bulletSpin: -0.25,
		manacost: 6, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 5.5, range: 5.5, size: 3, aoe: 1.5, lifetime: 1, damage: "soul", playerEffect: {name: "Taunted", time: 6}},


	{name: "Gunpowder", landsfx: "Bones", tags: ["fire", "aoe", "offense"], noise: 0, sfx: "FireSpell", school: "Elements", manacost: 0,
		noMiscast: true,
		components: ["Arms"], level:1, type:"hit", onhit:"aoe", delay: 1, power: 0, range: 3.5, size: 3, aoe: 1, lifetime: 1, damage: "inert",
		effectTileDurationMod: 0, effectTile: {
			name: "Gunpowder",
			duration: 400,
		}
	},
	{name: "UniversalSolvent", landsfx: "Acid",
		tags: ["acid", "alchemy", "offense", "utility"], noise: 0, sfx: "PotionDrink", school: "Elements", manacost: 0,
		noMiscast: true, noAggro: true,
		components: [], special: "UniversalSolvent",
		level:1, type:"special", onhit:"aoe", delay: 1, power: 9, range: 2.5, size: 3, aoe: 0.5, lifetime: 1, damage: "acid",
		effectTileDurationMod: 2, effectTile: {
			name: "Acid",
			duration: 4,
		}
	},

	{enemySpell: true, name: "Feathers", color: "#ffffff", sfx: "Tickle", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 5, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "tickle", playerEffect: {name: "Damage"}},
	{enemySpell: true, name: "NurseBola", color: "#ff2200", sfx: "Miss", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "NurseBola"}}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "NurseSyringe", color: "#ff00ff", minRange: 1.5, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, speed: 1,
		type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "pain", playerEffect: {name: "NurseSyringe", power: 4, type: "poison", time: 8},},
	{enemySpell: true, name: "RibbonBurst", color: "#ff00ff", sfx: "MagicSlash", manacost: 5, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 4, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings",  text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], power: 3, damage: "chain", count: 2, noGuard: true}},
	{enemySpell: true, name: "Spores", bulletSpin: 0.1, color: "#6733aa", sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 3, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "Spores", power: 2, damage: "poison"}},
	{enemySpell: true, name: "DragonFlowerSpores", bulletSpin: 0.1, hideWarnings: true, selfcast: true, color: "#6733aa", sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:1, type:"inert",
		onhit:"aoe", time: 5, delay: 2, power: 1.5, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {
			name: "DragonFlowerSpores",
			power: 1.5, amount: 0.75, damage: "poison"
		}},


	{enemySpell: true, name: "SporesHappy", bulletSpin: 0.1, color: "#ff00ff", sfx: "FireSpell", noCastMsg: true, selfcast: true, manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 2.5, range: 3, size: 3, aoe: 1.5, lifetime: 1, damage: "happygas", playerEffect: {name: "SporesHappy", power: 2.5, damage: "happygas"}},
	{enemySpell: true, name: "SporesSick", bulletSpin: 0.1, color: "#55ff55", noCastMsg: true, hitsfx: "DamageWeak", selfcast: true, manacost: 0, components: ["Verbal"], level:1, type:"hit", onhit:"aoe", time: 5, delay: 0, power: 0.5, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "SporesSick", power: 0.5, damage: "poison"}},
	{enemySpell: true, name: "SoulCrystalBind", color: "#ff5277", minRange: 0, sfx: "Evil", manacost: 7, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 6, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "drain", playerEffect: {name: "ObsidianEngulf", count: 1, power: 6, damage: "drain"}},

	{name: "BombItem", color: "#ff5277", prerequisite: "ApprenticeSummon", tags: ["aoe", "offense"], noise: 5, sfx: "FireSpell", school: "Conjure", manacost: 5, components: ["Verbal"], level:1,
		aoetype: "XcrossCrack",
		hitevents: [
			{trigger: "afterBulletHit", type: "Crack"},
		],
		block: 1.5, noTerrainHit: true, volatilehit: true, blockType: ["stun", "holy", ...KDIgnitionSources],
		effectTileDurationMod: 7, hitSpin: 0.2, effectTile: {
			name: "Smoke",
			duration: -1,
		}, type:"inert", onhit:"lingering", time: 3, delay: 5, power: 10, range: 3, size: 3, aoe: 2, lifetime: 1, damage: "stun", playerEffect: {name: "Damage"}},

	{name: "DynamiteItem", color: "#ff5277", prerequisite: "ApprenticeSummon", tags: ["aoe", "offense"], noise: 10, sfx: "Lightning", school: "Conjure", manacost: 5, components: ["Verbal"], level:1,
		aoetype: "XcrossCrack",
		events: [
			{trigger: "bulletTick", type: "EndChance", chance: 0.25, count: 8},
		],
		hitevents: [
			{trigger: "afterBulletHit", type: "Crack"},
			{trigger: "bulletHitEnemy", type: "BreakArmor", power: 2},
		],
		block: 0.5, noTerrainHit: true, volatilehit: true, blockType: ["stun", "holy", ...KDIgnitionSources],
		effectTileDurationMod: 7, hitSpin: 0.2, effectTile: {
			name: "Cracked",
			duration: 13,
		}, type:"inert", onhit:"lingering", time: 7, delay: 10, power: 14, range: 3, size: 3, aoe: 3.99, lifetime: 1, damage: "stun", playerEffect: {name: "Damage"}},


	{name: "C4Item", color: "#ff5277", prerequisite: "ApprenticeSummon", tags: ["aoe", "offense"], noise: 15, sfx: "Lightning", school: "Conjure", manacost: 5, components: ["Verbal"], level:1,
		hitevents: [
			{trigger: "afterBulletHit", type: "Crack"},
			{trigger: "bulletHitEnemy", type: "BreakArmor", power: 5},
		],
		block: 4, noTerrainHit: true, volatilehit: true, blockType: ["stun", "holy", ...KDIgnitionSources],
		effectTileDurationMod: 70, hitSpin: 0.2, effectTile: {
			name: "RubbleNoMend",
			duration: 130,
		}, type:"inert", onhit:"lingering", time: 10, delay: 60, power: 21, range: 3, size: 3, aoe: 4.99, lifetime: 1, damage: "stun", playerEffect: {name: "Damage"}},

	{enemySpell: true, name: "MinerBomb", color: "#ff2200", selfcast: true, noise: 5, sfx: "FireSpell", hitsfx: "FireSpell", school: "Conjure", manacost: 5, components: ["Verbal"], level:1, hideWarnings: true,
		aoetype: "crossCrack",
		hitevents: [
			{trigger: "afterBulletHit", type: "Crack"},
		],

		block: 1.5, noTerrainHit: true, volatile: true, blockType: [...KDIgnitionSources],
		effectTileDurationMod: 7, effectTile: {
			name: "Smoke",
			duration: -1,
		}, type:"inert", onhit:"lingering", delay: 5, power: 6, range: 3, size: 3, aoe: 2, lifetime: 1, damage: "fire", playerEffect: {name: "HeatBlast", time: 3, damage: "fire", power: 6}},

	{name: "ManyChains", sfx: "MagicSlash", minRange: 0, manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "WitchChainBolt", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1, offset: false}, channel: 3},

	{enemySpell: true, name: "WitchChainBolt", color: "#ffffff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", bind: 12, time: 6,  power: 6, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleChain", time: 1}, effectTileDurationMod: 10, effectTile: {
		name: "Chains",
		duration: 20,
	},}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "MagicChain", color: "#ff00ff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 6,  power: 4, bindType: "Metal", bind: 3, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleMagicBind", time: 1, msg: "MChain", tags: ["chainRestraintsMagic"], sfx: "Chain"}, effectTileDurationMod: 10, effectTile: {
		name: "Chains",
		duration: 20,
	},},
	{enemySpell: true, name: "MagicBelt", color: "#ff00ff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 6,  power: 4, bindType: "Leather", bind: 6, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleMagicBind", time: 1, msg: "MBelt", tags: ["beltRestraintsMagic"], sfx: "MagicSlash"}, effectTileDurationMod: 10, effectTile: {
		name: "Belts",
		duration: 20,
	},},
	{enemySpell: true, name: "MagicRope", color: "#ff00ff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 6,  power: 4, bindType: "Rope", bind: 8, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleMagicBind", time: 1, msg: "MRope", tags: ["ropeMagicStrong"], sfx: "MagicSlash"}, effectTileDurationMod: 10, effectTile: {
		name: "Ropes",
		duration: 20,
	},},
	{enemySpell: true, name: "BanditBola",  bindType: "Rope", color: "#ff2200", sfx: "Miss", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1.5, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "BanditBola"}}, // Throws a chain which stuns the target for 1 turn



	{enemySpell: true, name: "WitchRope",  bindType: "Rope", color: "#ffae70", sfx: "Miss", effectTileDurationMod: 10, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "chain", speed: 3, playerEffect: {name: "SingleRope"}},
	{allySpell: true, name: "PlayerBola",  bindType: "Rope", fastStart: true, color: "#ff2200", noMiscast: true, sfx: "Miss", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4, power: 3, bind: 9, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "BanditBola", time: 1}}, // Throws a chain which stuns the target for 1 turn

	{allySpell: true, name: "LeashSpell", fastStart: true, color: "#e64539", noMiscast: true,
		sfx: "Miss", manacost: 0, components: ["Arms"], level:1, type:"special", special: "LeashSpell",
		onhit:"", power: 0, delay: 0, range: 1.5, damage: "chain", speed: 2},

	{enemySpell: true, name: "RestrainingDevice", bindType: "Metal", color: "#19fac1", sfx: "Miss", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		effectTileDurationMod: 8, effectTile: {
			name: "Chains",
			duration: 10,
		},
		power: 6, delay: 0, range: 3.99, damage: "chain", speed: 1, playerEffect: {name: "RestrainingDevice", count: 3, time: 3, power: 5, damage: "chain"}},

	{enemySpell: true, name: "MiniCable", bindType: "Metal", color: "#19fac1", sfx: "MechLaunch", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		effectTileDurationMod: 8, effectTile: {
			name: "Chains",
			duration: 10,
		},
		power: 6, delay: 0, range: 4.99, damage: "chain", speed: 1, playerEffect: {name: "RestrainingDevice", count: 1, time: 3, power: 5, damage: "chain"}},
	{enemySpell: true, name: "ManyCables", sfx: "MechEngage", minRange: 0, manacost: 12, color: "#19fac1", projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
		time: 5, delay: 3, power: 3, range: 6.99, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "MiniCable", sfx: "MechLaunch", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1, offset: false}, channel: 3},

	{name: "ManyShadowHands", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "ShadowBolt", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1.5, offset: false}, channel: 3},
	{name: "ManyObsidianBolts", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "ObsidianBolt", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1.5, offset: false}, channel: 3},
	{name: "ManyMithrilBolts", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "MithrilBolt", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1.5, offset: false}, channel: 3},

	{enemySpell: true, name: "ShadowGrasp",  bindType: "Magic", color: "#ff00ff", minRange: 0, landsfx: "MagicSlash", manacost: 7, components: ["Legs"], level:1, type:"inert", onhit:"aoe",
		bulletSpin: 0.5, hitSpin: 0.3,
		time: 2, delay: 1, range: 4, power: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "cold", playerEffect: {name: "ShadowBolt", count: 3, time: 4, power: 5, damage: "cold"},
	},

	{enemySpell: true, name: "FuukaOrb",  bindType: "Magic", color: "#aaaaaa", sfx: "Evil",
		//hideWarnings: true,
		minRange: 0,
		hitSpin: 0.25,
		noDirectionOffset: true,
		manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 8, delay: 0, range: 50, damage: "arcane", speed: 0.5,
		playerEffect: {name: "FuukaOrb", type: "Purple", count: 1, time: 30, power: 4, damage: "arcane"}},

	{enemySpell: true, name: "FuukaOrbMulti",  bindType: "Magic", color: "#aaaaaa", sfx: "Evil",
		//hideWarnings: true,
		shotgunCount: 3, shotgunDistance: 6, shotgunSpread: 1, shotgunSpeedBonus: 0, shotgunFan: true,
		minRange: 0,
		hitSpin: 0.25,
		noDirectionOffset: true,
		manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 8, delay: 0, range: 50, damage: "arcane", speed: 0.5,
		playerEffect: {name: "FuukaOrb", type: "Purple", count: 1, time: 30, power: 4, damage: "arcane"}},

	{enemySpell: true, name: "ShadowGraspMulti", bindType: "Magic", color: "#aa55ff", sfx: "Evil",
		bulletColor: 0xaa55ff,
		bulletLight: 4,
		bulletSpin: 0.25,
		hitSpin: 0.25,
		castCondition: "notImmobile",
		//hideWarnings: true,
		noTerrainHit: true,
		shotgunCount: 5, shotgunDistance: 6, shotgunSpread: 2, shotgunSpeedBonus: 0, shotgunFan: true,
		minRange: 0,
		noDirectionOffset: true,
		manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 2, time: 12, delay: 0, range: 50, damage: "ice", speed: 0.5,
		playerEffect: {name: "ShadowSeal", type: "Purple", count: 1, time: 30, power: 4, damage: "ice"}},

	{enemySpell: true, name: "SealingBolt", faction: "Natural",  bindType: "Magic", color: "#6a15fa", sfx: "Evil", manacost: 5, components: ["Arms"], level:1, type:"bolt",
		pierceEnemies: true,
		projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "cold", speed: 2, playerEffect: {name: "ShadowBolt", count: 1, time: 3, power: 3, damage: "cold"}},

	{enemySpell: true, name: "ShadowBolt",  bindType: "Magic", color: "#6a15fa", sfx: "Evil", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "cold", speed: 2, playerEffect: {name: "ShadowBolt", count: 1, time: 3, power: 3, damage: "cold"}},
	{enemySpell: true, name: "ObsidianBolt",  bindType: "Metal", color: "#ff5277", sfx: "Evil", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "cold", speed: 2, playerEffect: {name: "ObsidianBolt", count: 1, time: 3, power: 3, damage: "cold"}},
	{enemySpell: true, name: "LockBullet",  bindType: "Magic", color: "#9f96d5", sfx: "LockLight",
		minRange: 0,
		noDirectionOffset: true,
		manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 1, pierceEnemies: true, delay: 0, range: 50, damage: "chain", speed: 2,
		playerEffect: {name: "LockBullet", type: "Purple", count: 1, time: 9, power: 2, damage: "chain"}},

	{enemySpell: true, name: "LatexSpray",  bindType: "Latex", color: "#2789cd", sfx: "RubberBolt",
		manacost: 2.5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 3.5, pierceEnemies: true, delay: 0, range: 5.5, damage: "glue", speed: 1.5,
		playerEffect: {name: "LatexSpray", count: 1, time: 4, power: 2.5, mult: 1, damage: "glue"}},


	{enemySpell: true, name: "MithrilBolt",  bindType: "Rope", color: "#999999", sfx: "Evil", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "cold", speed: 2, playerEffect: {name: "MithrilBolt", count: 1, time: 3, power: 3, damage: "cold"}},
	{enemySpell: true, name: "RubberBolt",  bindType: "Slime", color: "#ff3388", sfx: "RubberBolt", manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 4, delay: 0, range: 50, damage: "glue", speed: 2, playerEffect: {name: "RubberBolt", count: 1, time: 4, power: 4, damage: "glue"}},
	{enemySpell: true, name: "EncaseBolt",  bindType: "Slime", color: "#a04abd", sfx: "RubberBolt", manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "glue", speed: 2, playerEffect: {name: "EncaseBolt", count: 1, time: 4, power: 2, damage: "glue"}},
	{enemySpell: true, name: "EncaseBoltDrone",  bindType: "Slime", color: "#a04abd", sfx: "RubberBolt", manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "glue", speed: 2, playerEffect: {name: "EncaseBoltDrone", count: 1, time: 4, power: 1, damage: "glue"}},

	{enemySpell: true, name: "RubberNuke", bindType: "Slime", color: "#ff3388", sfx: "Missile", manacost: 8, components: ["Arms"],
		spellcast: {spell: "RubberNukeExplosion", target: "onhit", directional:true, offset: false},
		events: [{type: "RubberMissileHoming", trigger: "bulletAfterTick", power: 1.0, dist: 5.5, count: 0.25, limit: 0.7},],
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 12, delay: 0, range: 50, damage: "crush", speed: 0.5, playerEffect: {name: "RubberMissile", count: 4, time: 4, power: 8, damage: "glue"}},
	{enemySpell: true, name: "RubberNukeExplosion", landsfx: "Lightning", bindType: "Slime", school: "Element", manacost: 0, components: [],
		effectTileDurationMod: 3, effectTile: {
			name: "Slime",
			duration: 12,
		},
		level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 20, delay: 1, range: 2.5, size: 5, aoe: 2.5, lifetime: 1, damage: "glue"},

	{enemySpell: true, name: "RubberMissile", bindType: "Slime", color: "#ff3388", sfx: "Missile", manacost: 8, components: ["Arms"],
		spellcast: {spell: "RubberMissileExplosion", target: "onhit", directional:true, offset: false},
		events: [{type: "RubberMissileHoming", trigger: "bulletAfterTick", power: 1.0, dist: 5.5, count: 0.5, limit: 0.7},],
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2.0, delay: 0, range: 50, damage: "crush", speed: 0.5, playerEffect: {name: "RubberMissile", count: 2, time: 4, power: 4, damage: "glue"}},
	{enemySpell: true, name: "RubberMissileExplosion", landsfx: "Lightning", bindType: "Slime", school: "Element", manacost: 0, components: [],
		effectTileDurationMod: 3, effectTile: {
			name: "Slime",
			duration: 12,
		},
		level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 1.5, bind: 7, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "glue"},



	{enemySpell: true, slowStart: true, name: "EnemySteelRainPlug", color: "#ffffff", tags: ["binding", "metal", "bolt", "offense"], prerequisite: "ApprenticeMetal", sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 2, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "pierce", speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "pierce", power: 2, tag: "plugSpell"},
		bulletColor: 0xffffff, bulletLight: 1,
		events: [
			{type: "PlugEnemy", trigger: "bulletHitEnemy"},
		]
	},
	{enemySpell: true, name: "EnemySteelRainBurst", tags: ["binding", "metal", "bolt", "offense"], prerequisite: "SteelRainPlug", sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 5, components: ["Arms"], level:1,
		upcastFrom: "SteelRainPlug", upcastLevel: 1,
		projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, type:"inert", onhit:"aoe",
		time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		shotgunCount: 4, shotgunDistance: 4, shotgunSpread: 1, shotgunSpeedBonus: 1,
		spellcast: {spell: "SteelRainPlug", target: "target", directional:true, randomDirectionPartial: true, aimAtTarget: true, noTargetMoveDir: true, offset: false}},

	{enemySpell: true, name: "RestrainingBolt",  bindType: "Magic",
		color: "#ffaa57", sfx: "Miss",
		hitsfx: "FireSpell", manacost: 3, components: ["Arms"], level: 1, type:"bolt",
		projectileTargeting:true, slowStart: true, onhit:"", power: 3, bind: 2.5, delay: 0,
		range: 10.5, damage: "chain",
		speed: 4, playerEffect: {name: "RestrainingBolt", count: 1, dist: 1, sfx: "MagicSlash"}},

	{name: "EnemyWinterblast", enemySpell: true, color: "#92e8c0", tags: ["ice", "bolt", "offense", "utility", "aoe"], prerequisite: "Snowball", sfx: "LesserFreeze", hitsfx: "LesserFreeze", school: "Elements",
		noise: 2,
		specialCD: 9,
		manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, pierceEnemies: true, delay: 0, range: 50, damage: "frost", speed: 2,
		bulletColor: 0x92e4e8, bulletLight: 5,
		effectTileDurationModTrail: 4, effectTileTrailAoE: 1.5, effectTileTrail: {
			name: "Ice",
			duration: 10,
		},
		playerEffect: {name: "Chill", damage: "ice", power: 1, time: 3},
		events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 4, power: 0},],

	},
	{enemySpell: true, name: "DragonIceBolt", color: "#92e8c0", tags: ["ice", "bolt", "offense"], sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt",
		effectTileDurationMod: 10, effectTile: {
			name: "Ice",
			duration: 20,
		},
		minRange: 0,
		shotgunCount: 3, shotgunDistance: 6, shotgunSpread: 0.6, shotgunSpeedBonus: 0, shotgunFan: true,
		castCondition: "DragonChanneled",
		onhit:"", time: 4,  power: 1, delay: 0, range: 50, damage: "ice", speed: 2, playerEffect: {name: "Chill", damage: "ice", power: 1, time: 3},
		events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 4, power: 0},]},

	{enemySpell: true, name: "IceBreathChannel", bindType: "Magic", color: "#92e8c0", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 1, components: ["Arms"],
		hitSpin: 0.5, bulletSpin: 0.5,
		pierceEnemies: true,
		hideWarnings: true,
		selfcast: true,
		castCondition: "NotDragonChanneled",
		events: [
			{type: "MagicMissileChannel", trigger: "bulletTick"},
			{type: "IceBreathChannel", trigger: "bulletDestroy", time: 9},
		],
		level:1, type:"inert", onhit:"aoe", delay: 5, power: 0, range: 10, size: 3, lifetime: 1, damage: "inert"
	},

	{enemySpell: true, name: "MagicMissileChannel", bindType: "Magic", color: "#ffaa77", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 1, components: ["Arms"],
		specialCD: 8,
		hitSpin: 0.5, bulletSpin: 0.5,
		pierceEnemies: true,
		hideWarnings: true,
		selfcast: true,
		castCondition: "MagicMissileChannel",
		events: [
			{type: "v", trigger: "bulletTick"},
			{type: "MagicMissileChannel", trigger: "bulletDestroy", count: 8, spell: "MagicMissile2", dist: 10, time: 21},
		],
		level:1, type:"inert", onhit:"aoe", delay: 6, power: 0, range: 10, size: 3, lifetime: 1, damage: "inert"
	},


	{enemySpell: true, name: "MagicMissile", bindType: "Magic", color: "#ffaa77", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 4, components: ["Arms"],
		faction: "Warden",
		hitSpin: 1, bulletSpin: 1,
		bulletLifetime: 12,
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2.4, delay: 0, range: 12, damage: "arcane", speed: 2, playerEffect: {name: "MagicMissile", count: 2, dist: 1, sfx: "MagicSlash"}},
	{enemySpell: true, name: "MagicMissile2", bindType: "Magic", color: "#ffaa77", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 4, components: ["Arms"],
		faction: "Warden",
		hitSpin: 2, bulletSpin: 1.4,
		minRange: 0,
		bulletLifetime: 12,
		noDirectionOffset: true,
		events: [{type: "RubberMissileHoming", trigger: "bulletAfterTick", power: 0.9, dist: 15, count: 0.2, limit: 0},],
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2.4, delay: 0, range: 12, damage: "arcane", speed: 2, playerEffect: {name: "MagicMissile", count: 1, dist: 1, sfx: "MagicSlash"}},

	{enemySpell: true, name: "WardenCageDrop", color: "#ffffff", minRange: 0, landsfx: "MagicSlash", manacost: 2, components: [], level:1, type:"inert", onhit:"aoe",
		castCondition: "WardenCageDrop",
		power: 2.5, time: 1, delay: 5, range: 8, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "CageDrop", time: 1}},

	{enemySpell: true, name: "ShadowShroud",  tags: ["aoe", "buff", "utility", "stealth", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 2, components: ["Verbal"], level:1, type:"inert",
		specialCD: 8,
		onhit:"", time:13, aoe: 1.5, power: 0, delay: 18, range: 9.5, size: 3, damage: "",
		events: [{type: "CreateSmoke", trigger: "bulletTick", kind: "Smoke", aoe: 2.5, chance: 0.25},]},

	{enemySpell: true, name: "ShadowShroudGirl",  tags: ["aoe", "buff", "utility", "stealth", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 0, components: ["Verbal"], level:1, type:"inert",
		specialCD: 14,
		minRange: 0,
		selfcast: true,
		onhit:"", time:13, aoe: 1.5, power: 0, delay: 9, range: 9.5, size: 1, damage: "",
		events: [{type: "CreateSmoke", trigger: "bulletTick", kind: "Smoke", aoe: 3.5, chance: 0.5},]},

	{enemySpell: true, name: "ShadowShroudTele",  tags: ["aoe", "buff", "utility", "stealth", "defense"], school: "Illusion", manacost: 1, components: ["Verbal"], level:1, type:"hit",
		onhit:"", time:8, aoe: 6.5, power: 0, delay: 8, range: 12, size: 3, damage: "", noSprite: true,
		events: [
			{trigger: "afterBulletHit", type: "ShadowShroudTele", aoe: 6.5},
		]
	},

	{enemySpell: true, name: "DarkTele",  tags: ["aoe", "buff", "utility", "stealth", "defense"], school: "Illusion", manacost: 0, components: ["Verbal"], level:1, type:"hit",
		onhit:"", time:8, aoe: 6.5, power: 0, delay: 8, range: 12, size: 3, damage: "", noSprite: true,
		minRange: 0,
		events: [
			{trigger: "afterBulletHit", type: "DarkTele", aoe: 6.5},
		]
	},

	{enemySpell: true, name: "ShadowBubble", bindType: "Magic", color: "#9574ff", sfx: "FireSpell", landsfx: "Teleport", manacost: 1, components: ["Arms"],
		minRange: 0,
		bulletLifetime: 12,
		noDirectionOffset: true,
		events: [
			{type: "RubberMissileHoming", trigger: "bulletAfterTick", power: 0.4, dist: 15, count: 0.2, limit: 0}
		],
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "cold", speed: 0.5,
		playerEffect: {name: "Bind", damage: "cold", power: 2, tag: "shadowLatexRestraints"}},


	{enemySpell: true, name: "OneBarMissile", bindType: "Metal", color: "#ffffff", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 6, components: ["Arms"], specialCD: 25,
		noTerrainHit: true,
		pierceEnemies: true,
		faction: "Warden",
		minRange: 0,
		bulletLifetime: 50,
		noDirectionOffset: true,
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0, trailOnSelf: true,
		trailcast: {spell: "SummonOneBar", target: "onhit", directional:true, offset: false},
		effectTileDurationModTrail: 4, effectTileTrail: {
			name: "Cracked",
			duration: 50,
		},
		events: [{type: "RubberMissileHoming", trigger: "bulletAfterTick", power: 0.4, dist: 15, count: 0.2, limit: 0},],
		bind: 8,
		level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: .1, delay: 0, range: 50, damage: "crush", speed: 0.5, playerEffect: {name: "Bind", damage: "pierce", power: 7.2, tag: "onebar"}},
	{enemySpell: true, name: "SummonOneBar", noSprite: true, minRange: 0, manacost: 2, specialCD: 12,
		noSumMsg: true,
		faction: "Warden",
		effectTileDurationModTrail: 12, effectTileTrail: {
			name: "Chains",
			duration: 10,
		},
		effectTileDensity: 0.15,
		effectTileAoE: 1.5,
		components: ["Verbal"], level:4, type:"hit", onhit:"summon", summon: [{name: "OneBar", faction: "Enemy", count: 1, time: 0, bound: true}], power: 0, time: 10, delay: 0, range: 40, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},


	{enemySpell: true, name: "CelestialBolt",  bindType: "Rope", color: "#ffff44", sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "holy", bind: 6, speed: 4, playerEffect: {name: "CelestialBolt", count: 2, time: 3, power: 3, damage: "holy"}},
	{enemySpell: true, name: "WolfCrackle", color: "#8789fd", tags: ["electric", "offense", "aoe"], prerequisite: "Shock", noise: 6, sfx: "Shock", slowStart: true,
		effectTileDurationModTrail: 2, effectTileTrail: {
			name: "Sparks",
			duration: 3,
		},
		school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.0, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0, playerEffect: {name: "Shock", time: 1}},


	{enemySpell: true, name: "MummyBolt", color: "#88ff88", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "soul", speed: 3, playerEffect: {name: "MysticShock", time: 3}},
	{enemySpell: true, name: "RobotBolt", color: "#ff5277", sfx: "Laser", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "electric", speed: 2, playerEffect: {name: "RobotShock", time: 2}},
	{enemySpell: true, name: "RubberBullets",  bindType: "Slime", color: "#e7cf1a", minRange: 2.9, sfx: "Gunfire", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "glue", speed: 3, playerEffect: {name: "RubberBullets", power: 4, count: 1, damage: "glue"}},

	{enemySpell: true, name: "Minigun", castCondition: "Windup_Ready", bindType: "Slime", color: "#e7cf1a", minRange: 1.5, sfx: "MiniFire", manacost: 0, components: ["Arms"],
		fastStart: true,
		shotgunCount: 3, shotgunDistance: 6, shotgunSpread: 1.5, shotgunSpeedBonus: 1.5,
		level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 1, time: 0, delay: 0, range: 50, damage: "glue", speed: 1.5, playerEffect: {name: "RubberBullets", power: 1, count: 1, damage: "glue"}},
	{enemySpell: true, name: "MinigunWindup", castCondition: "Windup_Start", minRange: 1.5,
		tags: [], sfx: "MiniWind", school: "Any", manacost: 0, components: [], noise: 3,
		noTargetPlayer: true, mustTarget: true, level:1, type:"special", onhit:"", special: "Windup", noSprite: true, evadeable: false, noblock: true, power: 0, time: 3, range: 20, size: 1, lifetime: 1, aoe: 0.5, damage: "inert",
	},

	{enemySpell: true, name: "Vineexp", color: "#88ff88", bindType: "Vine", minRange: 0, landsfx: "Bones", manacost: 5,
		effectTileDurationMod: 8, effectTile: {
			name: "Vines",
			duration: 20,
		},
		components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 2.5, bind: 2.2, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "grope", playerEffect: {name: "VineEngulf", power: 2}},

	{enemySpell: true, name: "Bubbleexp", color: "#4444ff", bindType: "Magic", minRange: 0, landsfx: "Bones", manacost: 5, block: 5,
		effectTileDurationMod: 8, effectTile: {
			name: "Water",
			duration: 20,
		},
		components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 2.0, bind: 1, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "soap", playerEffect: {name: "WaterBubble", time: 8, power: 2, damage: "soap"}},
	{enemySpell: true, name: "Fireexp", color: "#e7cf1a", minRange: 0, landsfx: "FireSpell", manacost: 5,
		effectTileDurationMod: 2, effectTile: {
			name: "Ember",
			duration: 3,
		},
		components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "fire", playerEffect: {name: "HeatBlast", time: 1, damage: "fire", power: 5}},
	{enemySpell: true, name: "Iceexp", color: "#00ffff", minRange: 0, landsfx: "Freeze", manacost: 5,
		effectTileDurationMod: 5, effectTile: {
			name: "Ice",
			duration: 5,
		},
		components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "ice", playerEffect: {name: "Chill", damage: "ice", power: 3, time: 3}},

	{enemySpell: true, name: "TomeArcane", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant",
		noTerrainHit: true, power: 5, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "arcane", playerEffect: {name: "HeatBlast", time: 1, damage: "arcane", power: 5}},

	{enemySpell: true, name: "TomeBondage", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant",
		noTerrainHit: true, power: 2.0, bind: 10, bindType: "Magic", delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings",  text: "KinkyDungeonTrapBindingsMagicChainsWeak", tags: ["chainRestraintsMagic"], count: 3, power: 5.0, damage: "chain"}},

	{enemySpell: true, name: "HeatBolt", color: "#e7cf1a", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "fire",
		speed: 2, playerEffect: {name: "HeatBlast", time: 1, damage: "fire", power: 5}},
	{enemySpell: true, name: "CrystalBolt", color: "#ff5277", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 2.5, delay: 0, range: 8, damage: "soul",
		shotgunCount: 5, shotgunDistance: 6, shotgunSpread: 1, shotgunSpeedBonus: 0, shotgunFan: true,
		meleeOrigin: true,
		events: [
			{trigger: "afterBulletHit", type: "CrystalBolt"},
		],
		speed: 2.5, playerEffect: {name: "CrystalBind", time: 1}},
	{enemySpell: true, name: "CrystalBoltSingle", color: "#ff5277", sfx: "FireSpell", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 2.5, delay: 0, range: 8, damage: "soul",
		meleeOrigin: true,
		events: [
			{trigger: "afterBulletHit", type: "CrystalBolt"},
		],
		speed: 2.5, playerEffect: {name: "CrystalBind", time: 1}},

	{name: "CrystalSlash", tags: ["aoe", "offense", "crystal"], sfx: "MagicSlash", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		minRange: 0,
		color: "#92e8c0",
		projectileTargeting:true, piercing: true, noTerrainHit: true, noEnemyCollision: true, onhit:"aoe", power: 4, delay: 0, range: 1.5, aoe: 1.5, size: 3, lifetime:1, damage: "soul", speed: 1, time: 2,
		playerEffect: {name: "CrystalBind", time: 1, count: 2},

	},

	{enemySpell: true, name: "CrystalShock", hideWarnings: true, color: "#ff5277", minRange: 0, bulletSpin: 0.25, landsfx: "MagicSlash", manacost: 4, components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "souldrain", playerEffect: {name: "CrystalBind", time: 1}},

	{enemySpell: true, name: "CrystalShockBolt", color: "#ff5277", sfx: "FireSpell", manacost: 3, specialCD: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 8, damage: "soul",
		size: 3,
		shotgunCount: 1, shotgunDistance: 6, shotgunSpread: 1, shotgunSpeedBonus: 0, meleeOrigin: true,
		events: [
			{trigger: "afterBulletHit", type: "CrystalShockBolt", dist: 5},
		],
		speed: 1.25, playerEffect: {name: "CrystalBind", time: 1, count: 3}},
	{enemySpell: true, noFirstChoice: true, name: "Hairpin", color: "#ffffff", minRange: 2.9, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "pain", speed: 2, playerEffect: {name: "Hairpin", power: 2, damage: "pain", time: 1}},

	{enemySpell: true, name: "PoisonBreath", color: "#4fa460", sfx: "FireSpell", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe",
		time: 5, delay: 2, power: 1.5, range: 2.6, size: 3, aoe: 1.5,
		lifetime: 3, damage: "poison", playerEffect: {name: "PoisonBreath", power: 2, amount: 0.1, time: 12, damage: "poison"}},

	{enemySpell: true, name: "DragonVine", bindType: "Vine", color: "#88ff88", sfx: "Miss", effectTileDurationMod: 10, effectTile: {
		name: "Vines",
		duration: 20,
	}, manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "chain", speed: 2.5, playerEffect: {name: "VineEngulf", power: 2}},

	{enemySpell: true, name: "DragonSlash", bindType: "Vine", color: "#88ff88", sfx: "Miss", effectTileDurationMod: 10, effectTile: {
		name: "Vines",
		duration: 20,
	}, manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "chain", speed: 2.5, playerEffect:
		{name: "PoisonSlash", power: 2, amount: 0.25, time: 12}},

	{enemySpell: true, name: "PoisonDragonBlast",  bindType: "Vine", color: "#88ff88", sfx: "FireSpell", hitsfx: "Bones", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "grope", speed: 3, effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Vines",
		duration: 20,
	}, playerEffect: {name: "VineEngulf", power: 2}},
	{enemySpell: true, name: "NatureMoteBolt",  bindType: "Vine", color: "#88ff88", sfx: "FireSpell", hitsfx: "Bones", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 2, time: 3, bind: 3, delay: 0, range: 50, damage: "chain", speed: 1.5, effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Vines",
		duration: 20,
	}},
	{enemySpell: true, name: "ElfArrow",  bindType: "Vine", color: "#88ff88", sfx: "Miss", hitsfx: "FireSpell", manacost: 3, components: ["Arms"], level: 1, type:"bolt", projectileTargeting:true, slowStart: true, onhit:"", power: 4, bind: 6, delay: 0, range: 12, damage: "chain", speed: 4, playerEffect: {name: "EnchantedArrow", power: 2, count: 1}},
	{enemySpell: true, name: "CursedArrow",  bindType: "Magic", color: "#aa77ff", sfx: "Miss", hitsfx: "FireSpell", manacost: 5, components: ["Arms"], level: 1, type:"bolt", projectileTargeting:true, slowStart: true, onhit:"", power: 3, bind: 3, delay: 0, range: 7.99, damage: "cold", speed: 4, playerEffect: {name: "SingleMagicBind", time: 1, msg: "MBelt", tags: ["beltRestraintsMagic"], sfx: "MagicSlash"}},
	{enemySpell: true, name: "ShadowOrb", color: "#8833ff", minRange: 2.9, sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 5, damage: "inert", speed: 2, playerEffect: {name: ""},
		spellcast: {spell: "ShadowScythe", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "ShadowScythe", color: "#0000ff", sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:1, type:"inert", noTerrainHit: true, onhit:"aoe", time: 5, delay: 1, power: 3.5, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "cold", playerEffect: {name: "ShadowBind", time: 4}},
	{enemySpell: true, name: "WitchSlime",  bindType: "Slime", color: "#ff00ff", minRange: 0, landsfx: "MagicSlash", manacost: 7, components: ["Legs"], level:1, type:"inert", onhit:"lingering",
		time: 2, delay: 1, range: 4, power: 2, size: 3, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3},
		effectTileDurationModLinger: 8, effectTileLinger: {
			name: "Slime",
			duration: 10,
		},}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{enemySpell: true, name: "RubberSlime",  bindType: "Slime", color: "#ff00ff", minRange: 0, landsfx: "MagicSlash", manacost: 7, components: ["Legs"], level:1, type:"inert", onhit:"lingering",
		time: 2, delay: 1, range: 4, power: 2, size: 3, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue", playerEffect: {name: "EncaseBolt", count: 1, time: 4, power: 5, damage: "glue"},
		effectTileDurationModLinger: 8, effectTileLinger: {
			name: "Slime",
			duration: 10,
		},}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{enemySpell: true, name: "WitchSlimeBall", bindType: "Slime", color: "#ff00ff", sfx: "RubberBolt", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		time: 2,  power: 2, delay: 0, range: 50, damage: "glue", speed: 1, trailLifetime: 10, trailDamage:"glue", trail:"lingering", trailPower: 2, trailChance: 1.0, playerEffect: {name: "Slime", time: 3},
		effectTileDurationModTrail: 4, effectTileTrail: {
			name: "Slime",
			duration: 4,
		}
	}, // Throws a ball of slime which oozes more slime
	{enemySpell: true, name: "SlimePuddle", bindType: "Slime", color: "#ff00ff", sfx: "FireSpell", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"lingering",
		time: 2, power: 2, lifetime: 5, lifetimeHitBonus: 5, aoe: 1.5, delay: 0, range: 50, damage: "glue", speed: 1, playerEffect: {name: "SlimeTrap", time: 3},
		effectTileDurationModLinger: 8, effectTileLinger: {
			name: "Slime",
			duration: 10,
		},
	},

	{enemySpell: true, name: "MiniSlime", color: "#ff00ff", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 1, level:1, type:"bolt", projectileTargeting:true, onhit:"",
		time: 2, power: 2, delay: 0, range: 9, damage: "glue", speed: 1, playerEffect: {name: "MiniSlime", time: 2},
		effectTileDurationMod: 8, effectTile: {
			name: "Slime",
			duration: 10,
		},}, // Throws a ball of slime which oozes more slime
	{enemySpell: true, name: "VineSlimeBall", color: "#ff00ff", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 1, level:1, type:"bolt", projectileTargeting:true, onhit:"",
		time: 2, power: 2.5, delay: 0, range: 9, damage: "glue", speed: 1, playerEffect: {name: "Slime", time: 2},
		effectTileDurationMod: 8, effectTile: {
			name: "Slime",
			duration: 14,
		},}, // Throws a ball of slime which oozes more slime
	{enemySpell: true, name: "ManySlimes", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "MiniSlime", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1, offset: false}, channel: 3},

	// Bandit trader
	{enemySpell: true, name: "PoisonDagger", color: "#ff00ff", minRange: 1.5, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, speed: 1,
		type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "poison", playerEffect: {name: "PoisonDagger", power: 4, type: "poison", time: 8},},
	{enemySpell: true, name: "LustBomb", color: "#ff5277", minRange: 0, sfx: "Miss", school: "Illusion", manacost: 2, specialCD: 12, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 2.5, range: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "charm", playerEffect: {name: "LustBomb", damage: "charm", power: 3.5 }},


	// Fungal spells
	{enemySpell: true, name: "CrystalPuff", color: "#b37bdc", minRange: 0, landsfx: "MagicSlash", manacost: 4, components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 3, aoe: 0.75, lifetime: 1, damage: "souldrain", playerEffect: {name: "CrystalBind", time: 1}},
	{enemySpell: true, name: "HighBolt", color: "#8888ff", sfx: "MagicSlash", manacost: 3, specialCD: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 6, delay: 0, range: 50, damage: "arcane", speed: 1, playerEffect: {name: "Flummox", time: 1, damage: "arcane", power: 6}},

	// Shockwitch spells
	{enemySpell: true, name: "WitchElectrify", color: "#8888ff", minRange: 0, landsfx: "Shock", manacost: 5,
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}}, // A series of light shocks incapacitate you
	{enemySpell: true, name: "WitchElectricOrb", color: "#8888ff", sfx: "MagicSlash", manacost: 4, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 0, delay: 0, range: 5, damage: "electric", speed: 1, playerEffect: {name: ""},
		spellcast: {spell: "WitchElectricBurst", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "WitchElectricBurst", sfx: "Shock", manacost: 4, components: ["Verbal"], level:1, type:"hit",
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		noTerrainHit: true, onhit:"aoe", time: 5, delay: 1, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}},

	// Elemental witch spells
	{enemySpell: true, name: "WitchWaterBall", color: "#4f7db8", tags: ["water", "soap", "bolt", "offense", "utility"], sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"buff",
		power: 3.0, delay: 0, range: 50, damage: "soap", speed: 3, playerEffect: {name: "Drench"},
		buffs: [
			Object.assign({}, KDDrenched),
			Object.assign({}, KDDrenched2),
			Object.assign({}, KDDrenched3),
		],
		effectTileDurationMod: 40, effectTile: {
			name: "Water",
			duration: 40,
		},
	},
	{enemySpell: true, name: "WitchIcebolt", color: "#92e8c0", tags: ["ice", "bolt", "offense"], sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:1, type:"bolt",
		effectTileDurationMod: 10, effectTile: {
			name: "Ice",
			duration: 20,
		},
		projectileTargeting:true, onhit:"", time: 4,  power: 3.5, delay: 0, range: 50, damage: "frost", speed: 2, playerEffect: {name: "Chill", damage: "ice", power: 3, time: 3},
		events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 4, power: 0},]},

	{enemySpell: true, name: "WitchBoulder", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", block: 8, time: 4,  power: 4, delay: 0, range: 50, damage: "crush", speed: 2, playerEffect: {name: "WitchBoulder", time: 2}},

	{enemySpell: true, name: "SummonSlimeMold", noSprite: true, minRange: 0, sfx: "Bones", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "SlimeMold", count: 1, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},

	{enemySpell: true, name: "SummonSkeleton", landsfx: "Bones", minRange: 0, manacost: 8, components: ["Verbal"], level:3, type:"inert", onhit:"summon", summon: [{name: "SummonedSkeleton", count: 1, time: 12, strict: true, bound: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 4, size: 3, aoe: 2.1, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonSkeletons", landsfx: "Bones", minRange: 0, manacost: 18, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "SummonedSkeleton", count: 4, time: 16, strict: true, bound: true, weakBinding: true}], power: 0, time: 16, delay: 1, range: 4, size: 3, aoe: 2.6, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonZombies", landsfx: "Bones", specialCD:16, minRange: 0, manacost: 4, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "SummonedZombie", count: 2, time: 200, strict: true, minRange: 1.5, bound: true, weakBinding: true}], power: 0, time: 16, delay: 1, range: 4, size: 3, aoe: 4.6, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonDrones", landsfx: "Teleport", specialCD: 12, selfcast: true, minRange: 0, manacost: 4, components: ["Verbal"], level:4, type:"inert", onhit:"summon",
		summon: [{name: "SummonedDrone", count: 1, strict: true, bound: true, time: 80, faction: "Ambush"}], power: 0, time: 15, delay: 3, range: 8, size: 3, aoe: 4.6, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonCaptureDrones", landsfx: "Teleport", specialCD: 7, minRange: 0, manacost: 4, components: ["Verbal"], level:4, type:"inert", onhit:"summon",
		summon: [{name: "SummonedCaptureDrone", count: 1, strict: true, bound: true, time: 90, faction: "Ambush"}], power: 0, time: 15, delay: 3, range: 14, size: 3, aoe: 4.6, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "RopeAttack", hitsfx: "Struggle", manacost: 6, components: ["Verbal"], level:4, type:"hit", onhit:"null", noSprite: true, noSumMsg: true, summon: [
		{name: "LearnedRope", count: 1, chance: 0.5, time: 20, strict: true, bound: true},
		{name: "UnforseenRope", count: 1, chance: 0.5, time: 20, strict: true, bound: true}
	], power: 0, time: 12, delay: 1, range: 8, size: 3, aoe: 10, lifetime: 1, damage: "fire"},
	{enemySpell: true, name: "GhostAttack", hitsfx: "Evil", manacost: 8, components: ["Verbal"], level:4, type:"hit", onhit:"null", noSprite: true, noSumMsg: true, summon: [
		{name: "Ghost", count: 1, time: 20, strict: true, bound: true, aware: true,},
	], power: 0, time: 12, delay: 1, range: 8, size: 3, aoe: 10, lifetime: 1, damage: "fire"},
	{enemySpell: true, name: "GagGeistAttack", hitsfx: "Evil", castCondition: "NoGag", manacost: 7, components: ["Verbal"], level:4, type:"hit", onhit:"null", noSprite: true, noSumMsg: true, summon: [
		{name: "GagGeist", count: 1, time: 20, strict: true, bound: true, aware: true,},
	], power: 0, time: 12, delay: 1, range: 8, size: 3, aoe: 10, lifetime: 1, damage: "fire"},
	{enemySpell: true, name: "SummonCrystals", noSprite: true, minRange: 0, landsfx: "Freeze", manacost: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ChaoticCrystal", teleportTime: 1, count: 3, time: 10, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 2.01, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonChainWalls", noSprite: true, minRange: 0, landsfx: "MagicSlash", manacost: 2, specialCD: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ChainWall", count: 3, time: 0, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 3.5, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonForceFields", noSprite: true, minRange: 0, landsfx: "MagicSlash", manacost: 2, specialCD: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ForceField", count: 3, time: 0, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 3.5, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonForceFieldsGuardian", noSprite: true, minRange: 0, landsfx: "MagicSlash", manacost: 2, specialCD: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ForceFieldGuardian", count: 3, time: 0, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 3.5, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonTickleHand", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "TickleHand", teleportTime: 1, count: 3, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonShadowHand", noSprite: true, minRange: 0, sfx: "Evil", castCondition: "shadowHand3count", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "ShadowHand", teleportTime: 3, count: 1, time: 40, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonMikoGhosts", noSprite: true, minRange: 0, specialCD: 20, sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "MikoGhost", count: 8, minRange: 8, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 12.9, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonSingleTickleHand", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "TickleHand", teleportTime: 1, count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonEnemyGag", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Gag", teleportTime: 1, count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonEnemyGag2", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 3, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Gag", teleportTime: 1, count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonCuff", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Cuffs", teleportTime: 1, count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonLock", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Lock", teleportTime: 1, count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonRedSlime", noSprite: true, minRange: 0, sfx: "Freeze", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "RedSlime", count: 1, time: 12, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 2.01, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonSingleRedSlime", noSprite: true, minRange: 0, sfx: "Freeze", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "RedSlime", count: 1, time: 12, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonLatexElemental", noSprite: true, sfx: "MagicSlash", manacost: 6, specialCD: 40, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "ElementalLatex", teleportTime: 3, count: 1, time: 40, bound: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonWolfDrone", noSprite: true, sfx: "MagicSlash", castCondition: "wolfDrone", manacost: 3, specialCD: 10, components: ["Verbal"], level:1, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "WolfDrone", teleportTime: 1, count: 1, time: 40, bound: true}], power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonRopeTentacle", noSprite: true, sfx: "MagicSlash", castCondition: "ropeKraken", manacost: 2, specialCD: 4, components: ["Verbal"], level:1,
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "RopeMinion", count: 1, bound: true}],
		power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {},
	},
	{enemySpell: true, name: "SummonSarcoTentacle", noSprite: true, sfx: "Evil", castCondition: "sarcoKraken", manacost: 2, specialCD: 4, components: ["Verbal"], level:1,
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "SarcoMinion", count: 1, bound: true}],
		power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {},
	},
	{enemySpell: true, name: "SummonSlimeMinion", noSprite: true, sfx: "Evil", castCondition: "slimeKraken", manacost: 2, specialCD: 4, components: ["Verbal"], level:1,
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "SmallSlimeLeaper", count: 1, bound: true}],
		power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {},
	},
	{enemySpell: true, name: "SummonSlime", noSprite: true, minRange: 0, sfx: "Bones", manacost: 3, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "SmallSlimeLeaper", count: 1, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},

	{enemySpell: true, name: "ExplosiveBarrel", minRange: 0, sfx: "Lightning", school: "Elements", manacost: 4, components: [], mustTarget: true, level:1, type:"hit",
		onhit:"aoe", time:5, lifetime: 1, delay: 0, power: 6, aoe: 1.5, range: 8, size: 3, damage: "fire", playerEffect: {name: "HeatBlast", time: 1, damage: "fire", power: 6}},

	{enemySpell: true, name: "SummonTapeDrone", noSprite: true, sfx: "MagicSlash", castCondition: "wolfTapeDrone", manacost: 3, specialCD: 10, components: ["Verbal"], level:1, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "WolfDrone", count: 1, time: 40, weakBinding: true, bound: true}], power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "MirrorImage", noSprite: true, minRange: 0, selfcast: true, sfx: "FireSpell", manacost: 12, components: ["Verbal"], level:4, castRange: 50, type:"inert", onhit:"summon", summon: [{name: "MaidforceStalkerImage", count: 1, time: 12}], power: 0, time: 12, delay: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "inert",
		spellcast: {spell: "DarkShroud", target: "origin", directional:false, offset: false}},

	{enemySpell: true, name: "SummonDragonVinePlant", noSprite: true, minRange: 0, sfx: "Bones", manacost: 4, components: ["Verbal"], level:4, specialCD: 8,
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "DragonVinePlant", teleportTime: 1, aware: true,bound: true, count: 1, time: 40, strict: true, weakBinding: true,}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 1.5, lifetime: 1, speed: 1},

	{enemySpell: true, name: "SummonDragonFlower", noSprite: true, minRange: 0, sfx: "Bones", manacost: 4, components: ["Verbal"], level:4, specialCD: 16,
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "DragonFlower", teleportTime: 1, aware: true,bound: true, count: 3, time: 20, strict: true, weakBinding: true,}],
		power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.5, lifetime: 1, speed: 1},

	{enemySpell: true, name: "SummonIceWall", noSprite: true, minRange: 0, sfx: "Bones", manacost: 1, components: ["Verbal"], level:1, specialCD: 12,
		castCondition: "iceWallMelee",
		aoetype: 'arc',
		projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "IceWall", aware: true,bound: true, count: 3, time: 20, strict: true, weakBinding: true,}],
		power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.5, lifetime: 1, speed: 1},

	{enemySpell: true, name: "SummonIceWall2", noSprite: true, minRange: 0, sfx: "Bones", manacost: 1, components: ["Verbal"], level:1, specialCD: 12,
		//castCondition: "iceWallMelee",
		aoetype: 'arc', extraDist: 1,
		projectileTargeting:true, castRange: 50, type:"hit", onhit:"summon", summon: [{name: "IceWall", aware: true,bound: true, count: 7, time: 20, strict: true, weakBinding: true,}],
		power: 0, time: 12, delay: 1, range: 7, size: 3, aoe: 3.5, lifetime: 1, speed: 1},

	{enemySpell: true, name: "SummonBookChain", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookChain", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookBelt", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookBelt", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookRope", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookRope", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookBondage", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 24, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookBondage", teleportTime: 1, aware: true,bound: true, count: 1, time: 24, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookNature", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookNature", teleportTime: 1, aware: true,bound: true, count: 2, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookElectric", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookElectric", teleportTime: 1, aware: true,bound: true, count: 1, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookIce", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookIce", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookCelestial", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookCelestial", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookArcane", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookArcane", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookForbidden", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookForbidden", teleportTime: 1, aware: true,bound: true, count: 3, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookSlime", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookSlime", teleportTime: 1, aware: true,bound: true, count: 2, time: 13, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},

	{enemySpell: true, selfcast: true, buff: true, minRange: 0, name: "ArmorUp", sfx: "Bones", school: "Elements", manacost: 8, components: ["Arms"], mustTarget: true, level:1, type:"buff", buffs: [{id: "ArmorUp", type: "Armor", duration: 6, power: 1.0, player: true, enemies: true, tags: ["defense", "armor"]}], onhit:"", time:6, power: 0, range: 2, size: 1, damage: ""},
	{enemySpell: true, selfcast: true, buff: true, minRange: 0, name: "ArmorUpArea", sfx: "MagicSlash", school: "Elements", manacost: 8, components: ["Arms"], mustTarget: true, level:1,
		type:"buff", buffs: [{id: "ArmorUpArea", type: "Armor", duration: 6, power: 2.0, player: false, enemies: true, tags: ["defense", "armor"]}], onhit:"", time:6, power: 0, range: 2.9, aoe: 2.9, size: 1, damage: ""},

	{enemySpell: true, selfcast: true, buff: true, minRange: 0, name: "SpellArmorUpAreaNevermere", sfx: "MagicSlash", school: "Elements", manacost: 8, components: ["Arms"], mustTarget: true, level:1, filterTags: ["wolfPet", "robot"],
		type:"buff", buffs: [
			{id: "SpellArmorUpAreaNevermere", type: "SpellResist", duration: 6, power: 2.0, player: false, enemies: true, tags: ["defense", "spellresist"]},
			{id: "ArmorUpAreaNevermere", type: "Armor", duration: 6, power: 1.5, player: false, enemies: true, tags: ["defense", "armor"]}
		], onhit:"", time:6, power: 0, range: 4.9, aoe: 4.9, size: 1, damage: ""},
	{enemySpell: true, selfcast: true, buff: true, minRange: 0, name: "NevermereBoost", sfx: "MagicSlash", school: "Elements", manacost: 4, specialCD: 18, components: ["Arms"], mustTarget: true, level:1, filterTags: ["wolfSub"],
		type:"buff", buffs: [
			{id: "NevermereBoost", aura: "#ffaaaa", type: "MoveSpeed", duration: 10, power: 1.0, player: false, enemies: true, tags: ["offense", "speed"]},
			{id: "NevermereBoost2", type: "Evasion", duration: 6, power: 0.3, player: false, enemies: true, tags: ["offense", "evasion"]},
			{id: "NevermereBoost3", type: "AttackSpeed", duration: 6, power: 0.5, player: false, enemies: true, tags: ["offense", "attackspeed"]},
		], onhit:"", time:6, power: 0, range: 4.9, aoe: 4.9, size: 1, damage: ""},

	{enemySpell: true, selfcast: true, buff: true, minRange: 0, name: "DollBoost", sfx: "MagicSlash", school: "Elements", manacost: 4, specialCD: 18, components: ["Arms"], mustTarget: true, level:1, filterTags: ["smithdoll"],
		type:"buff", buffs: [
			{id: "NevermereBoost", aura: "#ffaaaa", type: "MoveSpeed", duration: 10, power: 1.0, player: false, enemies: true, tags: ["offense", "speed"]},
			{id: "NevermereBoost2", type: "Evasion", duration: 6, power: 0.3, player: false, enemies: true, tags: ["offense", "evasion"]},
			{id: "NevermereBoost3", type: "AttackSpeed", duration: 6, power: 0.5, player: false, enemies: true, tags: ["offense", "attackspeed"]},
		], onhit:"", time:6, power: 0, range: 4.9, aoe: 4.9, size: 1, damage: ""},

	{name: "DollConvert", tags: ["dummy"], sfx: "Dollify", school: "Illusion", manacost: 0, components: [], level:1, type:"special", special: "DollConvert", noMiscast: true, castCondition: "dollConvert",
		onhit:"", time:5, power: 0, range: 5.5, aoe: 5.5, size: 1, damage: ""},

	{name: "DollConvertMany", tags: ["dummy"], sfx: "Dollify", school: "Illusion", manacost: 0, components: [], level:1, type:"special", special: "DollConvert", noMiscast: true, castCondition: "dollConvert",
		onhit:"", time:5, power: 0, range: 5.5, aoe: 5.5, size: 1, damage: ""},

	{enemySpell: true, buff: true, name: "ParasolBuff", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Arms"], mustTarget: true, level:3, type:"buff",
		buffs: [
			{id: "ParasolBuff", type: "Armor", duration: 5, power: 1.0, player: false, enemies: true, tags: ["defense", "armor"]},
			{id: "ParasolBuff2", type: "Evasion", duration: 5, power: 0.33, player: false, enemies: true, tags: ["defense", "evasion"]},
			{id: "ParasolBuff3", type: "SpellResist", duration: 5, power: 2.5, player: false, enemies: true, tags: ["defense", "spellresist"]},
		], onhit:"", time:5, power: 0, range: 6, size: 1, damage: ""},
	{enemySpell: true, commandword: true, buff: true, buffallies: true, castCondition: "commandword", name: "EnemyCM1", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Arms"], mustTarget: true, level:3, type:"special", special: "Enemy_CM1",
		onhit:"", time:5, power: 0, range: 6, size: 1, damage: "", noCastMsg: true},
	{enemySpell: true, commandword: true, buff: true, buffallies: true, selfbuff: true, castCondition: "commandword", name: "EnemyCM_self", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Arms"], mustTarget: true, level:3, type:"special", special: "Enemy_CM1",
		onhit:"", time:5, power: 0, range: 6, size: 1, damage: "", noCastMsg: true},
	{enemySpell: true, buff: true, name: "ZombieBuff", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Arms"], mustTarget: true, level:3, type:"buff", filterTags: ["zombie", "mummy"],
		buffs: [
			{id: "ZombieBuff", type: "Armor", duration: 8, power: 2.0, player: false, enemies: true, tags: ["defense", "armor"]},
			{id: "ZombieBuff2", type: "MoveSpeed", duration: 8, power: 2.1, player: false, enemies: true, tags: ["offense", "speed"]},
		], onhit:"", time:5, power: 0, range: 6, size: 1, damage: ""},
	{enemySpell: true, buff: true, heal: true, name: "OrbHeal", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Arms"], mustTarget: true, level:3, type:"hit",
		onhit:"heal", time:2, lifetime: 1, delay: 1, power: 2, aoe: 1.5, range: 8, size: 3, damage: "inert"},
	{enemySpell: true, name: "Earthfield", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "Earthfield", type: "Armor", power: 2.0, player: false, enemies: true, noAlly: true, tags: ["armor", "defense"], range: 1.5}], onhit:"", time:6, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Earthrune", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "Earthfield", type: "Armor", power: 2.0, player: true, enemies: true, onlyAlly: true, tags: ["armor", "defense"], range: 1.5}], onhit:"", time:9, aoe: 1.5, power: 0, delay: 9, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Icerune", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 8, components: ["Verbal"], level:1, type:"inert", onhit:"lingering", time: 1, delay: 1, range: 3, size: 3, aoe: 1.5, lifetime: 5, power: 4, lifetimeHitBonus: 3, damage: "ice"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{name: "WaterRune", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert",
		buffs: [
			{id: "WaterRune", type: "SpellResist", power: 3.0, player: true, enemies: true, onlyAlly: true, tags: ["spellresist", "defense"], range: 1.5},
			{id: "WaterRune2", type: "MoveSpeed", power: -1.0, player: false, enemies: true, noAlly: true, tags: ["slow", "debuff"], range: 1.5},
		], onhit:"", time:9, aoe: 1.5, power: 0, delay: 9, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.

	{enemySpell: true, name: "RuneTrap_Rope", bulletColor: 0xff73ef, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Ropes",
			duration: 20,
		},
		effectTileDoT: {
			name: "Ropes",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xff73ef, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["ropeMagicWeak"], msg: "Rope"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Chain", bulletColor: 0xcf52ff, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Chains",
			duration: 20,
		},
		effectTileDoT: {
			name: "Chains",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xcf52ff, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["chainRestraintsMagic"], msg: "Chain"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Ribbon", bulletColor: 0xcf52ff, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Fabric",
			duration: 20,
		},
		effectTileDoT: {
			name: "Fabric",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xcf52ff, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["ribbonRestraints", "magicRibbonsHarsh"], msg: "Ribbon"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Vine", bulletColor: 0x3b7d4f, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Vines",
			duration: 20,
		},
		effectTileDoT: {
			name: "Vines",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x3b7d4f, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["vineRestraints"], msg: "Vine"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Belt", bulletColor: 0xffffff, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Belts",
			duration: 20,
		},
		effectTileDoT: {
			name: "Belts",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xffffff, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["beltRestraints"], msg: "Belt"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Leather", bulletColor: 0xffffff, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Belts",
			duration: 20,
		},
		effectTileDoT: {
			name: "Belts",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xffffff, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["leatherRestraints", "leatherRestraintsHeavy"], msg: "Leather"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "chain"},

	{enemySpell: true, name: "RuneTrap_Latex", bulletColor: 0x4fa4b8, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Belts",
			duration: 20,
		},
		effectTileDoT: {
			name: "LatexThinBlue",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["latexRestraints", "latexRestraintsHeavy"], msg: "Latex"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_VacCube", bulletColor: 0x4fa4b8, tags: ["latex", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Latex",
			duration: 20,
		},
		effectTileDoT: {
			name: "LatexThin",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["latexcube"], msg: "VacCube"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_Bubble", bulletColor: 0x8888ff, tags: ["water", "soap", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Water",
			duration: 20,
		},
		effectTileDoT: {
			name: "Water",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["bubble"], msg: "Bubble"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "soap"},

	{enemySpell: true, name: "RuneTrap_SlimeBubble", bulletColor: 0xff00ff, tags: ["latex", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Slime",
			duration: 20,
		},
		effectTileDoT: {
			name: "Slime",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["slimebubble"], msg: "SlimeBubble"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_LatexSphere", bulletColor: 0xff00ff, tags: ["latex", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
		effectTileDoT: {
			name: "LatexThinBlue",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "RubberBolt", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["latexSphere"], msg: "LatexSphere"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_LatexBall", bulletColor: 0xff00ff, tags: ["latex", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "LatexThinBlue",
			duration: 20,
		},
		effectTileDoT: {
			name: "LatexThinBlue",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0x4fa4b8, hitLight: 6, hitsfx: "RubberBolt", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["ballsuit"], msg: "BallSuit"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_Rubber", bulletColor: 0xff5277, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "LatexThin",
			duration: 20,
		},
		effectTileDoT: {
			name: "LatexThin",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xff5277, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 3, tags: ["latexEncaseRandom"], msg: "Rubber"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, name: "RuneTrap_Slime", bulletColor: 0xff5277, tags: ["rope", "trap", "rune"],
		hideWarnings: true,
		effectTileDurationMod: 10, effectTile: {
			name: "Slime",
			duration: 20,
		},
		effectTileDoT: {
			name: "Slime",
			duration: 2,
		}, effectTileDistDoT: 0.5,
		effectTileDoT2: {
			name: "BoobyTrapMagic",
			duration: 2,
		},
		hitColor: 0xff5277, hitLight: 6, hitsfx: "Struggle", manacost: 2, components: ["Legs"], level:1, type:"dot",
		playerEffect: {name: "MagicRope", time: 3, count: 1, tags: ["slimeRestraints"], msg: "Slime"},
		noTerrainHit: true, onhit:"", delay: 300, power: 2.5, range: 2, time: 8, size: 3, aoe: 1.5, lifetime: 1, bind: 8, damage: "glue"},

	{enemySpell: true, faction: "Trap", name: "TrapCharmWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsCharmWeak", tags: ["ribbonRestraints"], power: 4, count: 4}},
	{enemySpell: true, faction: "Trap", name: "TrapRibbons", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], power: 10, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapShackleWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsShackleWeak", tags: ["shackleRestraints"], power: 6, count: 2}},
	{enemySpell: true, faction: "Trap", name: "TrapMummyWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsMummyWeak", tags: ["mummyRestraints"], power: 8, count: 2}},
	{enemySpell: true, faction: "Trap", name: "TrapRopeWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsRopeWeak", tags: ["ropeMagicWeak", "clothRestraints"], power: 6, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapRopeStrong", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsRopeStrong", tags: ["ropeMagicStrong", "ropeAuxiliary", "clothRestraints", "tapeRestraints"], power: 10, count: 4}},
	{enemySpell: true, faction: "Trap", name: "TrapRopeHoly", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "holy", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsRopeHoly", tags: ["celestialRopes"], power: 10, count: 2}},
	{enemySpell: true, faction: "Trap", name: "TrapLeatherWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsLeatherWeak", tags: ["leatherRestraints", "leatherRestraintsHeavy"], power: 8, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapCableWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsCableWeak", tags: ["hitechCables"], power: 6, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapSlimeWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsSlimeWeak", tags: ["slimeRestraints"], power: 5, count: 2}},
	{enemySpell: true, faction: "Trap", name: "TrapMagicChainsWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsMagicChainsWeak", tags: ["chainRestraintsMagic"], power: 7, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapShadowLatex", sfx: "Evil", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "cold", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsShadowLatex", tags: ["shadowLatexRestraints"], power: 12, count: 3}},
	{enemySpell: true, faction: "Trap", name: "TrapObsidian", sfx: "Evil", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "cold", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsObsidian", tags: ["obsidianRestraints"], power: 9, count: 3}},
	{enemySpell: true, faction: "Trap", distract: 10, name: "TrapCrystal", sfx: "Freeze", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "arcane", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsCrystal", tags: ["crystalRestraints"], power: 9, count: 3}},
	{nonmagical: true, faction: "Trap", enemySpell: true, name: "TrapLatex", sfx: "MagicSlash", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "arcane", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsLatex", tags: ["latexRestraints", "latexRestraintsHeavy", "redLatexBasic"], power: 7, count: 3}},
	{faction: "Trap", enemySpell: true, name: "TrapLatexBubble", sfx: "Grope", manacost: 6, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 2, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsLatexBubble", tags: ["latexSphere"], power: 6, count: 1}},
	{faction: "Trap", enemySpell: true, name: "TrapLatexBall", sfx: "Grope", manacost: 6, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 2, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapBindings", realBind: true, text: "KinkyDungeonTrapBindingsLatexBall", tags: ["ballSuit"], power: 6, count: 1}},
	{nonmagical: true, enemySpell: true, name: "TrapSleepDart", hideWarnings: true, sfx: "Gunfire", manacost: 1, components: [], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "poison", speed: 2, playerEffect: {name: "TrapSleepDart", realBind: true, power: 5}},
	{enemySpell: true, faction: "Trap", distract: 20, name: "TrapLustCloud", sfx: "Freeze", manacost: 1, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "happygas", playerEffect: {name: "TrapLustCloud", realBind: true, damage: "happygas", power: 8 }},
	{enemySpell: true, faction: "Trap", name: "TrapSCloud", sfx: "Freeze", manacost: 1, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "TrapSPCloud", realBind: true, damage: "poison", power: 5.0 }},
	{nonmagical: true, enemySpell: true, name: "SleepDart", sfx: "Miss", manacost: 1, components: [], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "poison", speed: 1, playerEffect: {name: "TrapSleepDart", realBind: true, power: 5}},
];

KDDefineSpellPage("Command", [
	["AllyToggle", "AllyAttention", "AllyDeselect", "AllyDeselectAll"],
	["AllyMove"],
	["AllyOnMe", "AllyDisperse", "AllyHold", "AllyCancelHold"],
	["AllyDefensive", "AllyAggressive"],
]);


let KDSpecialBondage: Record<string, KDBondage> = {
	"Energy": {
		priority: 25,
		color: "#e7cf1a",
		struggleRate: 0.7,
		powerStruggleBoost: 0.3,
		healthStruggleBoost: 1.5,
		mageStruggleBoost: 1.5,
		enemyBondageMult: 1.0,
	},
	"Magic": {
		priority: -5,
		color: "#92e8c0",
		struggleRate: 0.6,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
		mageStruggleBoost: 1.75,
		enemyBondageMult: 0.8,
	},
	"Leather": {
		priority: 0,
		color: "#ad2f45",
		struggleRate: 1.0,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
		enemyBondageMult: 1.0,
	},
	"Null": {
		priority: 100,
		color: "#ff5555",
		struggleRate: 1,
		powerStruggleBoost: 0.5,
		healthStruggleBoost: 0.8,
		enemyBondageMult: 1.0,
	},
	"Latex": {
		priority: -8,
		color: "#87b5c4",
		struggleRate: 1.05,
		powerStruggleBoost: 0.6,
		healthStruggleBoost: 1.2,
		enemyBondageMult: 0.8,
		latex: true,
	},
	"Rope": {
		priority: -3,
		color: "#ffae70",
		struggleRate: 4.0,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
		enemyBondageMult: 2.0,
	},
	"MagicRope": {
		priority: -4,
		color: "#b7e892",
		struggleRate: 1.5,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
		mageStruggleBoost: 1.4,
		enemyBondageMult: 2.0,
	},
	"Metal": {
		priority: 10,
		color: "#aaaaaa",
		struggleRate: 0.4,
		powerStruggleBoost: 0.25,
		healthStruggleBoost: 1.0,
		enemyBondageMult: 0.6,
	},
	"Slime": {
		priority: -10,
		color: "#f23db7",
		struggleRate: 1.5,
		powerStruggleBoost: 2.0,
		healthStruggleBoost: 0.75,
		enemyBondageMult: 1.75,
		mageStruggleBoost: 0.3,
		latex: true,
	},
	"Tape": {
		priority: -5,
		color: "#3454f4",
		struggleRate: 1.35,
		powerStruggleBoost: 0.75,
		healthStruggleBoost: 1.5,
		enemyBondageMult: 1.5,
	},
	"Vine": {
		priority: -7,
		color: "#4fd658",
		struggleRate: 1.25,
		powerStruggleBoost: 2.0,
		healthStruggleBoost: 1.0,
		mageStruggleBoost: 0.1,
		enemyBondageMult: 1.5,
	},
	"Ice": {
		priority: -15,
		color: "#00ffff",
		struggleRate: 0.6,
		powerStruggleBoost: 3.0,
		healthStruggleBoost: 0.7,
		mageStruggleBoost: 0.7,
		enemyBondageMult: 0.5,
	},
	"Furniture": {
		priority: -100,
		color: "#aaaaaa",
		struggleRate: 1.2,
		powerStruggleBoost: 2.0,
		healthStruggleBoost: 2.0,
		enemyBondageMult: 1.0,
	},
};

let KDMagicDefs = {
	RopeKraken_TentacleCost:0.05,
	RopeKraken_TentacleThreshold: 0.16,
	RopeKraken_TentacleCountMin: 1,
	RopeKraken_TentacleCountShare: 0.29, //1 tentacle max per this much hp
	SarcoKraken_TentacleCost:0.00,
	SarcoKraken_TentacleThreshold: 0.05,
	SarcoKraken_TentacleCountMin: 1,
	SarcoKraken_TentacleCountMax: 3,
	SarcoKraken_TentacleCountShare: 0.2, //1 tentacle max per this much hp
	SlimeKraken_TentacleCost:0.08,
	SlimeKraken_TentacleThreshold: 0.1,
	SlimeKraken_TentacleCountMin: 4,
	SlimeKraken_TentacleCountShare: 0.1, //1 slime max per this much hp
};

let KDCastConditions: Record<string, (enemy: entity, target: entity, spell?: spell) => boolean> = {
	"latexLegbinderSpell": (_enemy, target) => {
		if (target.player) {
			let restraint = KinkyDungeonGetRestraint({tags: ["latexlegbinderSpell"]}, 100, "tmb");
			if (!restraint) return false;
			return true;
		}
		return true;
	},
	"iceWallMelee": (enemy, target) => {
		return enemy.hp < enemy.Enemy.maxhp/2 && KDistEuclidean(enemy.x-target.x, enemy.y - target.y) < 3;
	},
	"latexGagSpell": (_enemy, target) => {
		if (target.player) {
			let restraint = KinkyDungeonGetRestraint({tags: ["latexgagSpell"]}, 100, "tmb");
			if (!restraint) return false;
			return true;
		}
		return true;
	},
	"latexArmbinderSpell": (_enemy, target) => {
		if (target.player) {
			let restraint = KinkyDungeonGetRestraint({tags: ["latexarmbinderSpell"]}, 100, "tmb");
			if (!restraint) return false;
			return true;
		}
		return true;
	},
	"notImmobile": (_enemy, _target) => {
		if (KinkyDungeonSlowLevel < 10) return true;
		return false;
	},
	"Windup_Start": (enemy, _target) => {
		if (!KDEnemyHasFlag(enemy, "windup")) return true;
		return false;
	},
	"Windup_Ready": (enemy, _target) => {
		if (KDEnemyHasFlag(enemy, "windup")) return true;
		return false;
	},
	"commandword": (enemy, target) => {
		if (KDEnemyHasFlag(enemy, "commandword")) return false;
		return KDEntityHasBuffTags(target, "commandword");
	},
	"dollConvert": (enemy, _target, spell) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, KDGetSpellRange(spell)).filter((en) => {return en.Enemy?.tags.smithdoll;}).length > 3 || KDNearbyEnemies(enemy.x, enemy.y, spell.aoe).filter((en) => {return !en.allied && en.Enemy?.tags.dollmakerconvert;}).length < 1) return false;
		return true;
	},
	"dollConvertMany": (enemy, _target, spell) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, KDGetSpellRange(spell)).filter((en) => {return en.Enemy?.tags.smithdoll;}).length > 8 || KDNearbyEnemies(enemy.x, enemy.y, spell.aoe).filter((en) => {return !en.allied && en.Enemy?.tags.dollmakerconvert;}).length < 1) return false;
		return true;
	},
	"wolfDrone": (enemy, _target) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.wolfdrone;}).length > 3) return false;
		return true;
	},
	"wolfTapeDrone": (enemy, _target) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.wolfdrone;}).length > 3) return false;
		return true;
	},
	"shadowHand3count": (enemy, _target) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.name == "ShadowHand";}).length > 3) return false;
		return true;
	},
	"ropeKraken": (enemy, _target) => {
		if (enemy.hp <= KDMagicDefs?.RopeKraken_TentacleThreshold) return false;
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.krakententacle;}).length
			> KDMagicDefs?.RopeKraken_TentacleCountMin + Math.floor(enemy.hp/enemy.Enemy.maxhp/KDMagicDefs?.RopeKraken_TentacleCountShare)) return false;
		return true;
	},
	"slimeKraken": (enemy, _target) => {
		if (enemy.hp <= KDMagicDefs?.SlimeKraken_TentacleThreshold) return false;
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.latexTrap;}).length
			> KDMagicDefs?.SlimeKraken_TentacleCountMin + Math.floor(enemy.hp/enemy.Enemy.maxhp/KDMagicDefs?.SlimeKraken_TentacleCountShare)) return false;
		return true;
	},
	"sarcoKraken": (enemy, target) => {
		if (target.player) {
			if (KinkyDungeonPlayerTags.get("Sarcophagus")) return false;

			let restraint = KinkyDungeonGetRestraint({tags: ["mummyRestraints"]}, 100, "tmb");
			if (!restraint) return false;
		}
		if (enemy.hp <= KDMagicDefs?.SarcoKraken_TentacleThreshold) return false;
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.sarcotentacle;}).length
			> Math.min(KDMagicDefs?.SarcoKraken_TentacleCountMax - 1, KDMagicDefs?.SarcoKraken_TentacleCountMin + Math.floor(enemy.hp/enemy.Enemy.maxhp/KDMagicDefs?.SarcoKraken_TentacleCountShare))) return false;
		return true;
	},
	"sarcoEngulf": (_enemy, target) => {
		if (target.player && !KinkyDungeonPlayerTags.get("Sarcophagus")) {
			let restraint = KinkyDungeonGetRestraint({tags: ["mummyRestraints"]}, 100, "tmb");
			if (!restraint) return false;
			return true;
		}
		return false;
	},
	"sarcoHex": (_enemy, target) => {
		if (target.player && !KinkyDungeonPlayerTags.get("Sarcophagus")) {
			let restraint = KinkyDungeonGetRestraint({tags: ["mummyRestraints"]}, 100, "tmb");
			if (!restraint) return true;
			return false;
		}
		return false;
	},
	"NoGag": (_enemy, target) => {
		if (target.player && !KinkyDungeonPlayerTags.get("ItemMouthFull")) {
			return true;
		}
		return false;
	},
	"EnemyEnchantRope": (_enemy, target) => {
		if (target.player && KinkyDungeonPlayerTags.get("RopeSnake")) {
			return true;
		}
		else if (target?.specialBoundLevel?.Rope > 0) return true;
		return false;
	},
	"EnemyEnchantRope2": (_enemy, target) => {
		if (target.player && (KinkyDungeonPlayerTags.get("RopeSnake") || KinkyDungeonPlayerTags.get("WeakMagicRopes"))) {
			return true;
		}
		else if (target?.specialBoundLevel?.Rope > 0) return true;
		return false;
	},
	"MagicMissileChannel": (enemy, _target) => {
		return !KDEnemyHasFlag(enemy, "MagicMissileChannelFinished");
	},
	"NotDragonChanneled": (enemy, _target) => {
		return !KDEnemyHasFlag(enemy, "dragonChannel") && !KDEnemyHasFlag(enemy, "dragonChannelCD");
	},
	"DragonChanneled": (enemy, _target) => {
		return KDEnemyHasFlag(enemy, "dragonChannel");
	},

	"WardenCageDrop": (_enemy, target) => {
		if (target.player && KinkyDungeonPlayerTags.get("OneBar")) {
			return true;
		}
		return false;
	},
};

let KDPlayerCastConditions: Record<string, (player: entity, x: number, y: number) => boolean> = {
	"hasArcaneEnergy": (_player, _x, _y) => {
		return KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ArcaneEnergy") > 0;
	},
	"noStationaryBullet": (player, x, y) => {
		return !KDMapData.Bullets.some((b) => {
			return b.x == x && b.y == y && !(b.bullet?.source != player?.id);
		});
	},
	"ShadowDance": (player, x, y) => {
		return (KinkyDungeonFlags.get("TheShadowWithin") || KinkyDungeonBrightnessGet(player.x, player.y) < KDShadowThreshold || KDNearbyEnemies(player.x, player.y, 1.5).some((en) => {return en.Enemy?.tags?.shadow;}))
			&& (KinkyDungeonBrightnessGet(x, y) < KDShadowThreshold || KDNearbyEnemies(x, y, 1.5).some((en) => {return en.Enemy?.tags?.shadow;}));
	},
	"LiquidMetalBurst": (_player, x, y) => {

		return KDEffectTileTags(x, y).liquidmetal;
	},
	"weapon": (_player, _x, _y) => {
		return KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed;
	},
	"FloatingWeapon": (_player, _x, _y) => {
		return KinkyDungeonPlayerDamage && !KinkyDungeonPlayerDamage.unarmed && (!KinkyDungeonPlayerDamage.noHands || KinkyDungeonPlayerDamage.telekinetic);
	},


};



let KDCustomCost: Record<string, (data: any) => void> = {
	"SprintPlusAttack": (data) => {
		data.cost = Math.round(10 * -(KDAttackCost() + KDSprintCost())) + "SP";
		data.color = "#88ff88";
	},
	"LimitSurge": (data) => {
		data.cost = "50WP";
		data.color = "#ff5555";
	},
	"DesperateStruggle": (data) => {
		data.cost = "20WP";
		data.color = "#ff5555";
	},
	"stamina": (data) => {
		data.cost = Math.round(10 * KinkyDungeonGetStaminaCost(data.spell)) + "SP";
		data.color = "#88ff88";
	},
	"arcane_blast": (data) => {
		data.cost = Math.min(KinkyDungeonStatManaMax * 2.5, Math.round(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "ArcaneEnergy") * 10)) + "E";
		data.color = "#8888ff";
	},
	"arcane_akashic": (data) => {
		data.cost = "100E";
		data.color = "#e7cf1a";
	},
	"rhythm": (data) => {
		data.cost = "";
	},
	"evasive": (data) => {
		data.cost = Math.round(10 * KDEvasiveManeuversCost()) + "SP";
		data.color = "#88ff88";
	},

	"Enrage": (data) => {
		if (KinkyDungeonFlags.get("Enraged")) {
			data.cost = Math.round(KinkyDungeonFlags.get("Enraged")) + " " + TextGet("KDTurns");
			data.color = "#ffffff";
		}
	},
};
