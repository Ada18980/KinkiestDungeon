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
// onhit: What happens on AoE. Deals aoepower damage, or just power otherwise

let KDCommandWord = {name: "CommandWord", tags: ["command", "binding", "utility", "defense"], sfx: "Magic", school: "Conjure", manacost: 9, components: ["Verbal"], level:1, type:"special", special: "CommandWord", noMiscast: true,
	onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""};

/**
 * These are starting spells
 */
let KinkyDungeonSpellsStart = [
	KDCommandWord,
	//{name: "FleetFooted", sfx: "FireSpell", school: "Illusion", manacost: 0.5, components: [], level:1, type:"passive",
	//events: [{type: "FleetFooted", trigger: "beforeMove", power: 1}, {type: "FleetFooted", trigger: "afterMove"}, {type: "FleetFooted", trigger: "beforeTrap", msg: "KinkyDungeonFleetFootedIgnoreTrapFail", chance: 0.35}]},
];

// Filters
let filters = genericfilters.concat(...["buff", "bolt", "aoe", "dot", "offense", "defense", "utility"]);
/** Extra filters, indexed according to the learnable spells menu */
let filtersExtra = [
	["upgrade", "magic"],
	["fire", "ice", "earth", "electric", "air", "water"],
	["binding", "slime", "summon", "physics", "metal", "leather", "rope"],
	["stealth", "light", "shadow", "knowledge"],
	["will", "stamina", "mana", "damage"],
];

let KDColumnLabels = [
	["Elements", "Conjure", "Illusion", "Other"],
	["Verbal", "Arms", "Legs", "Passive"],
	["Verbal", "Arms", "Legs", "Passive"],
	["Verbal", "Arms", "Legs", "Passive"],
	["Strength", "Dexterity", "Intelligence", "Misc"],
];

let KinkyDungeonSpellPages = [
	"Upgrade",
	"Elements",
	"Conjure",
	"Illusion",
	"Upgrades",
];

/**
 * These spells occur in the menu and the player can learn them
 * Spells with NoBuy cannot be bought, but can be looked at.
 * Spells with NoMenu do not appear in the menu until the player has them
 */
let KinkyDungeonLearnableSpells = [
	//Page 0: Spell Tree
	[
		// Elements
		["ApprenticeFire", "ApprenticeLightning", "ApprenticeAir", "ApprenticeIce", "ApprenticeWater", "ApprenticeEarth"],
		// Conjure
		["ApprenticeRope", "ApprenticeLeather", "ApprenticeMetal", "ApprenticeLatex", "ApprenticePhysics", "ApprenticeSummon"],
		// Illusion
		["ApprenticeLight", "ApprenticeShadow", "ApprenticeMystery", "ApprenticeProjection", "ApprenticeKnowledge"],
	],

	//Page 1: Elements
	[
		// Verbal
		["Firecracker", "Incinerate", "Freeze", "FlashFreeze", "Hailstorm", "IceBreath", "Tremor", "Earthquake", "Shield", "GreaterShield", "IronBlood", "Electrify", "Thunderstorm", "StaticSphere", "Rainstorm"],
		// Arms
		["Firebolt", "Fireball", "WindBlast", "Icebolt", "Snowball", "IceOrb", "Icicles", "IceLance", "StoneSkin", "Shock", "Crackle", "LightningBolt", "WaterBall", "TidalBall"],
		// Legs
		["Ignite", "Fissure", "Sleet", "BoulderLaunch", "BigBoulderLaunch", "Earthform", "EarthformRing", "EarthformMound", "EarthformLine", "BoulderKick", "Volcanism", "FlameRune", "FreezeRune", "LightningRune",],
		// Passive
		["FlameBlade", "Burning", "TemperaturePlay", "Strength", "Shatter", "IcePrison", "LightningRod"],
	],

	//Page 2: Conjuration
	[
		// Verbal
		["CommandWord", "CommandDisenchant", "CommandRelease", "CommandCapture", "CommandBind", "CommandVibrate", "CommandOrgasm", "ZoneOfExcitement", "Lockdown", "Chastity", "ZoneOfPurity", "Heal", "Heal2", "Bomb", "RopeBoltLaunch", "RopeStrike", "Leap", "Blink", "CommandSlime", "Spread", "Awaken", "Animate", "AnimateLarge", "AnimatePuppet", "Coalesce", "FireElemental", "AirMote"],
		// Arms
		["TickleCloud", "FeatherCloud", "ChainBolt", "SteelRainPlug", "SteelRainBurst", "DisplayStand", "SummonGag", "SummonBlindfold", "SummonCuffs", "SummonLeatherCuffs", "SummonArmbinder", "SummonStraitjacket", "SummonLegbinder", "SummonHarness", "Petsuit", "SlimeBall", "ElasticGrip", "WaterMote"],
		// Legs
		["Snare", "Wall", "SlimeSplash", "Slime", "SlimeEruption", "SlimeWall", "SlimeWallVert", "LatexWallVert", "SlimeWallHoriz", "LatexWallHoriz", "LatexWall", "SlimeToLatex", "StormCrystal", "Ally", "EarthMote", "Golem"],
		// Passive
		["Frustration", "LeatherBurst", "OneWithSlime", "SlimeWalk", "SlimeMimic", "Engulf", "FloatingWeapon"],
	],

	//Page 3: Illusion
	[
		// Verbal
		["Flash", "GreaterFlash", "FocusedFlash", "ShadowWarrior", "Shroud", "Invisibility"],
		// Arms
		["ShadowBlade", "ShadowSlash", "Dagger", "TrueSteel", "Ring", "Light", "Corona"],
		// Legs
		["Evasion", "Camo", "Decoy"],
		// Passive
		["Analyze", "TrueSight", "EnemySense"],
	],

	//Page 4: Upgrades
	[
		// Strength
		["IronWill"],
		// Dex
		["Athlete", "Sneaky", "Evasive1", "Evasive2", "Evasive3"],
		// Intellect
		["SummonUp1", "SummonUp2", "StaffUser1", "StaffUser2", "StaffUser3"],
		// Misc
		["CriticalStrike"],
	],
];




/**
 * Spells that the player can choose
 * @type {Record<string, spell[]>}
 */
let KinkyDungeonSpellList = { // List of spells you can unlock in the 3 books. When you plan to use a mystic seal, you get 3 spells to choose from.
	"Elements": [
		{goToPage: 1, name: "ApprenticeFire", tags: ["magic"], autoLearn: ["Firebolt"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 1, name: "ApprenticeWater", tags: ["magic"], autoLearn: ["WaterBall"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 1, name: "ApprenticeEarth", tags: ["magic"], autoLearn: ["StoneSkin"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 1, name: "ApprenticeAir", tags: ["magic"], autoLearn: ["WindBlast"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 1, name: "ApprenticeLightning", tags: ["magic"], autoLearn: ["Electrify"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 1, name: "ApprenticeIce", tags: ["magic"], autoLearn: ["Freeze"], hideLearned: true, hideUnlearnable: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "Earthform", tags: ["earth", "utility", "summon"], hide: true, autoLearn: ["EarthformRing", "EarthformMound", "EarthformLine"], prerequisite: "ApprenticeEarth", hideLearned: true, school: "Elements", manacost: 0, spellPointCost: 1, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "BoulderKick", tags: ["earth", "offense", "utility"], sfx: "HeavySwing", school: "Elements", prerequisite: "Earthform", manacost: 1, components: [], level:1, type:"special", special: "BoulderKick", noMiscast: true,
			onhit:"", power: 4.0, range: 1.5, size: 1, damage: ""},
		{name: "Volcanism", tags: ["earth", "fire", "offense"], sfx: "FireSpell", school: "Elements", prerequisite: "Earthform", manacost: 6, components: [], level:2, type:"special", special: "Volcanism", noMiscast: true,
			filterTags: ["summonedRock"], onhit:"", power: 6.0, range: 5.99, aoe: 2.5, size: 1, damage: ""},
		{name: "EarthformRing", tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, minRange: 0, landsfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 4, components: ["Legs"], prerequisite: ["Earthform"],
			level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", count: 30, minRange: 2.5, time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 2.5, size: 1, aoe: 3.99, lifetime: 1, damage: "inert",
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}, effectTileDensity: 0.3},
		{name: "EarthformMound", tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, minRange: 0, landsfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 3, components: ["Legs"], prerequisite: ["Earthform"],
			level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", count: 9, time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 4, size: 1, aoe: 1.5, lifetime: 1, damage: "inert",
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}},

		{name: "EarthformLine", tags: ["earth", "utility", "summon"], noSprite: true, noise: 6, sfx: "Bones", school: "Elements", hideUnlearnable: true, manacost: 2, components: ["Legs"], level:2, type:"bolt", prerequisite: ["Earthform"],
			piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 3, delay: 0, range: 4.99, speed: 7, size: 1, damage: "inert",
			trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0, trailOnSelf: true,
			trailcast: {spell: "EarthformSingle", target: "onhit", directional:true, offset: false},
			effectTileDurationModTrail: 40, effectTileTrail: {
				name: "Cracked",
				duration: 100,
			},
		},

		{name: "SPUp1", school: "Any", hide: true, manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "WPUp1", school: "Any", hide: true, manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "TemperaturePlay", tags: ["fire", "ice", "offense"], prerequisite: ["ApprenticeIce", "ApprenticeFire"], school: "Elements", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "TemperaturePlay", trigger: "beforeDamageEnemy", power: 0.3},
		]},
		{name: "IronWill", tags: ["will", "defense"], school: "Elements", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "IronWill", trigger: "calcMaxStats", power: 0.4},
		]},
		{name: "StaffUser1", tags: ["utility"], school: "Elements", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "StaffUser1", trigger: "afterCalcMana", power: 0.8},
		]},
		{name: "StaffUser2", tags: ["utility"], prerequisite: "StaffUser1", school: "Elements", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0.5, damage: "inert", events: [
			{type: "IncreaseManaPool", trigger: "calcMaxStats", power: 10},
		]},
		{name: "StaffUser3", tags: ["utility"], prerequisite: "StaffUser2", school: "Elements", manacost: 0, components: [], level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "StaffUser3", trigger: "beforeMultMana", power: 0.75},
		]},
		{name: "Burning", tags: ["fire", "offense"], prerequisite: "ApprenticeFire", school: "Elements", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Burning", trigger: "beforeDamageEnemy", damage: "fire"},
		]},
		{name: "IcePrison", tags: ["ice", "offense"], prerequisite: "ApprenticeIce", school: "Elements", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "IcePrison", trigger: "afterDamageEnemy"},
		]},
		{name: "LightningRod", tags: ["electric", "air", "defense", "utility"], prerequisite: "ApprenticeLightning", school: "Elements", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "LightningRod", trigger: "playerCast", power: 3.0},
		]},
		{name: "Incinerate", prerequisite: "Firecracker", tags: ["fire", "aoe", "dot", "offense", "denial"], noUniqueHits: true, noise: 3, landsfx: "FireSpell", school: "Elements", manacost: 8,
			upcastFrom: "Firecracker", upcastLevel: 1, hitSpin: 1,
			components: ["Verbal"], level:2, type:"inert", onhit:"aoe", delay: 1, power: 2.5, range: 2.5, size: 3, aoe: 1.5, lifetime: 6, damage: "fire", playerEffect: {name: "Damage"},
			effectTileDurationMod: 12, effectTile: {
				name: "Ember",
				duration: -6,
			}
		},

		{name: "Tremor", prerequisite: "ApprenticeEarth", tags: ["earth", "offense", "utility"], sfx: "Telekinesis", school: "Elements", manacost: 2, components: ["Verbal"], level:1,
			type:"hit", onhit:"instant", evadeable: true, time:8, power: 2, range: 3.99, size: 3, lifetime: 1, aoe: 1.5, damage: "crush",
			events: [{trigger: "beforeDamageEnemy", type: "MakeVulnerable", time: 8}],
			effectTileDurationMod: 40, effectTile: {
				name: "Cracked",
				duration: 100,
			}, effectTileDensity: 0.5,
		},

		{name: "Earthquake", prerequisite: "Tremor", landsfx: "Telekinesis", school: "Elements", manacost: 9, components: ["Verbal"], level:3, type:"inert", onhit:"cast",
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
			components: ["Verbal"], level:2, type:"inert", onhit:"aoe", delay: 1, power: 1.0, time: 2, range: 2.5, size: 3, aoe: 1.5, lifetime: 8, damage: "frost", playerEffect: {name: "Damage"},
			effectTileDurationMod: 12, effectTile: {
				name: "Ice",
				duration: -6,
			}
		},
		{name: "Rainstorm", prerequisite: "ApprenticeWater", tags: ["ice", "aoe", "dot", "offense", "utility", "denial"], noUniqueHits: true, noise: 3, sfx: "FireSpell", school: "Elements", manacost: 4.5,
			components: ["Verbal"], level:1, type:"inert", onhit:"aoe", delay: 3, power: 3.5, time: 2, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "acid",
			effectTileDurationMod: 8, effectTile: {
				name: "Water",
				duration: 14,
			}
		},
		{name: "Freeze", color: "#92e8c0", tags: ["ice", "utility", "offense"], prerequisite: "ApprenticeIce", sfx: "Freeze", school: "Elements", manacost: 3, components: ["Verbal"], noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, time:6, power: 0, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "ice"},
		{name: "FlashFreeze", color: "#92e8c0", tags: ["ice", "utility", "offense", "aoe"], prerequisite: "Freeze", sfx: "Freeze", school: "Elements", manacost: 5, components: ["Verbal"],
			level:2, type:"hit", onhit:"instant", evadeable: false, power: 2.0, range: 2.99, size: 3, lifetime: 1, aoe: 1.5, damage: "ice",
			events: [{type: "ElementalOnDrench", trigger: "bulletHitEnemy", damage: "ice", time: 8, power: 0.0},]},
		{name: "Sleet", color: "#92e8c0", tags: ["ice", "aoe", "dot", "offense", "denial"], prerequisite: "ApprenticeIce", effectTileDurationMod: 10, effectTile: {
			name: "Ice",
			duration: 20,
		}, hitSpin: 0.5, bulletSpin: 0.25, noUniqueHits: true, noise: 8, sfx: "FireSpell", school: "Elements", manacost: 10, components: ["Legs"], level:3, type:"inert", onhit:"aoe", delay: 1, power: 1, range: 4.5, size: 5, aoe: 2.9, lifetime: 15, time: 2, damage: "frost"},
		{name: "WindBlast", tags: ["air", "bolt", "offense", "utility"], prerequisite: "ApprenticeAir", sfx: "FireSpell", school: "Elements", manacost: 5, components: ["Arms"], level:1, type:"bolt",
			projectileTargeting:true, onhit:"", power: 2.0, time: 2, delay: 0, range: 50, damage: "stun", speed: 2, hitSpin: 1, bulletSpin: 1,
			shotgunCount: 3, shotgunDistance: 4, shotgunSpread: 3, shotgunSpeedBonus: 1,
			events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 1.0, dist: 1.0},]},


		{name: "Firebolt", tags: ["fire", "bolt", "offense"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt",
			bulletColor: 0xb83716, bulletLight: 4,
			hitColor: 0xe64539, hitLight: 6,
			projectileTargeting:true, onhit:"", power: 4.0, delay: 0, range: 50, damage: "fire", speed: 3, playerEffect: {name: "Damage"},
			effectTileDurationMod: 3, effectTile: {
				name: "Ember",
				duration: 3,
			}}, // Throws a fireball in a direction that moves 1 square each turn
		{name: "Fireball", prerequisite: "Firebolt", tags: ["fire", "bolt", "aoe", "offense"], noise: 3, sfx: "FireSpell", school: "Elements", manacost: 7, components: ["Arms"], level:3,
			upcastFrom: "Firebolt", upcastLevel: 2,
			bulletColor: 0xb83716, bulletLight: 5.5,
			hitColor: 0xe64539, hitLight: 8,
			type:"bolt", projectileTargeting:true, onhit:"aoe", power: 6, delay: 0, range: 50, aoe: 1.5, size: 3, lifetime:1, damage: "fire", speed: 2, playerEffect: {name: "Damage"},
			effectTileDurationModTrail: 8, effectTileTrail: {
				name: "Smoke",
				duration: 2,
			},
			effectTileDurationMod: 6, effectTile: {
				name: "Ember",
				duration: 4,
			}}, // Throws a fireball in a direction that moves 1 square each turn
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
			bulletColor: 0x92e4e8, bulletLight: 6,
			projectileTargeting:true, onhit:"lingering", time: 3,  power: 2.0, delay: 0, lifetime: 6, lifetimeHitBonus: 2, range: 50, aoe: 2.5, damage: "frost", speed: 3, playerEffect: {name: "Damage"},
			effectTileDurationMod: 2, effectTile: {
				name: "Ice",
				duration: 6,
			}, effectTileDensity: 0.5},
		{name: "IceLance", color: "#92e8c0", tags: ["ice", "bolt", "offense", "aoe"], prerequisite: "Icicles", sfx: "Lightning", hitsfx: "Freeze", school: "Elements", pierceEnemies: true,
			upcastFrom: "Icicles", upcastLevel: 2,
			manacost: 7, components: ["Arms"], level:3, type:"bolt",
			bulletColor: 0x92e4e8, bulletLight: 4,
			hitColor: 0x92e4e8, hitLight: 7,
			effectTileDurationModTrail: 10, effectTileTrail: {
				name: "Ice",
				duration: 20,
			},
			projectileTargeting:true, onhit:"", time: 3,  power: 10, delay: 0, range: 50, damage: "frost", speed: 6, playerEffect: {name: "Damage"},
			events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 3, power: 0},]},
		{name: "IceOrb", color: "#92e8c0", tags: ["ice", "bolt", "offense", "utility", "aoe"], prerequisite: "Snowball", sfx: "LesserFreeze", hitsfx: "LesserFreeze", school: "Elements",
			upcastFrom: "Snowball", upcastLevel: 1,
			manacost: 4, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, pierceEnemies: true, delay: 0, range: 50, damage: "frost", speed: 2,
			bulletColor: 0x92e4e8, bulletLight: 5,
			effectTileDurationModTrail: 4, effectTileTrailAoE: 1.5, noTrailOnPlayer: true, effectTileTrail: {
				name: "Ice",
				duration: 10,
			}},
		{name: "Icicles", tags: ["ice", "bolt", "offense"], prerequisite: "Icebolt", noise: 3, sfx: "MagicSlash", school: "Elements", manacost: 6, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
			spellcast: {spell: "Icicle", target: "target", directional:true, offset: false}, channel: 3},
		{name: "BoulderLaunch", tags: ["earth", "bolt", "offense"], prerequisite: "ApprenticeEarth", sfx: "Telekinesis", school: "Elements", manacost: 2, components: ["Legs"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 4, delay: 1, power: 4, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "Boulder", target: "target", directional:true, offset: false}, channel: 1},
		{name: "BigBoulderLaunch", tags: ["earth", "bolt", "offense", "aoe"], prerequisite: "BoulderLaunch", sfx: "Telekinesis", school: "Elements",
			upcastFrom: "BoulderLaunch", upcastLevel: 2,
			manacost: 6, components: ["Legs"], projectileTargeting: true, noTargetPlayer: true, noEnemyCollision: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 8, delay: 1, power: 12, range: 50, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
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
			school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 4.0, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
			trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0, playerEffect: {name: "Shock", time: 1}},
		{name: "Fissure", tags: ["fire", "denial", "dot", "aoe", "offense"], noUniqueHits: true, prerequisite: "Ignite", noise: 7, sfx: "FireSpell", school: "Elements", manacost: 8, components: ["Legs"], level:3, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 5.5, delay: 0, range: 4, speed: 4, size: 1, damage: "fire",
			trailPower: 1.5, trailLifetime: 6, piercingTrail: true, trailDamage:"fire", trail:"lingering", trailChance: 1, playerEffect: {name: "DamageNoMsg", hitTag: "Fissure", time: 1, damage:"fire", power: 3}},
		//{name: "Shield", sfx: "MagicSlash", school: "Elements", manacost: 1, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, level:1, type:"inert", block: 10, onhit:"", power: 0, delay: 2, range: 1.5, size: 1, damage: ""}, // Creates a shield that blocks projectiles for 1 turn
		{name: "Shield", tags: ["shield", "defense"], prerequisite: "ApprenticeEarth", sfx: "MagicSlash", school: "Elements", manacost: 4, components: ["Verbal"], mustTarget: true, level:1, type:"buff",
			buffs: [
				{id: "Shield", type: "SpellResist", aura: "#73efe8", duration: 50, power: 3.0, player: false, enemies: true, tags: ["defense", "damageTaken"]},
			], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "GreaterShield", tags: ["shield", "defense", "utility"], prerequisite: "Shield", spellPointCost: 1, sfx: "MagicSlash", school: "Elements", manacost: 1, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, level:2, type:"inert", block: 20, onhit:"", power: 0, delay: 5, range: 2.99, size: 1, damage: ""}, // Creates a shield that blocks projectiles for 5 turns
		{name: "IceBreath", tags: ["ice", "denial", "offense", "utility", "aoe"], prerequisite: "Hailstorm", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 8,
			upcastFrom: "Hailstorm", upcastLevel: 1,
			components: ["Verbal"], level:2, type:"inert", onhit:"lingering", time: 1, delay: 1, range: 3, size: 3, aoe: 1.5, lifetime: 10, power: 5, lifetimeHitBonus: 5, damage: "ice"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "LightningBolt", tags: ["electric", "aoe", "offense"], prerequisite: "Crackle", noise: 11, sfx: "Lightning",
			school: "Elements", spellPointCost: 2, manacost: 8, components: ["Arms"], level:3, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 8.5, delay: 0, time: 2, range: 50, speed: 50, size: 1, damage: "electric",
			upcastFrom: "Crackle", upcastLevel: 2,
			trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "Shock", time: 3},
			effectTileDurationModTrail: 4, effectTileDensityTrail: 0.6, effectTileTrail: {
				name: "Sparks",
				duration: 2,
			}
		},
		{name: "StoneSkin", tags: ["earth", "buff", "defense"], prerequisite: "ApprenticeEarth", sfx: "Bones", school: "Elements", manacost: 6, components: ["Arms"], mustTarget: true, level:1, type:"buff", buffs: [{id: "StoneSkin", aura: "#FF6A00", type: "Armor", duration: 50, power: 2.0, player: true, enemies: true, tags: ["defense", "armor"]}], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "IronBlood", tags: ["earth", "buff", "offense"], prerequisite: "ApprenticeEarth", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
			buffs: [
				{id: "IronBlood", aura: "#ff0000", type: "AttackStamina", duration: 99999, cancelOnReapply: true, endSleep: true, power: 1, player: true, enemies: false, tags: ["attack", "stamina"]},
				{id: "IronBlood2", type: "ManaCostMult", duration: 99999, cancelOnReapply: true, endSleep: true, power: 0.25, player: true, enemies: false, tags: ["manacost"]},
			], onhit:"", time:30, power: 0, range: 2, size: 1, damage: ""},
		{name: "FlameBlade", tags: ["fire", "aoe", "offense", "buff"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements", manacost: 3, components: [], level:1, type:"passive", events: [{type: "FlameBlade", trigger: "playerAttack"}]},
		{name: "Strength", tags: ["earth", "struggle", "buff", "utility", "offense"], prerequisite: "ApprenticeEarth", sfx: "FireSpell", school: "Elements", manacost: 1, components: [], level:1, type:"passive", events: [
			//{type: "ElementalEffect", power: 2, damage: "crush", trigger: "playerAttack"},
			{trigger: "beforePlayerAttack", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
			{trigger: "calcDisplayDamage", type: "BoostDamage", prereq: "damageType", kind: "melee", power: 2},
			{type: "ModifyStruggle", mult: 1.5, power: 0.2, StruggleType: "Struggle", trigger: "beforeStruggleCalc", msg: "KinkyDungeonSpellStrengthStruggle"},
		]},
		{name: "Ignite", tags: ["fire", "aoe", "dot", "buff"], prerequisite: "ApprenticeFire", sfx: "FireSpell", school: "Elements", manacost: 2, spellPointCost: 1, components: ["Legs"], mustTarget: true, noTargetEnemies: true, level:2, type:"buff",
			buffs: [
				{id: "Ignite", aura: "#ff8400", type: "SpellCastConstant", duration: 6, power: 10.0, player: true, enemies: true, spell: "Ignition", tags: ["offense"]},
			],
			onhit:"", time:6, power: 1.5, range: 2.9, size: 1, damage: ""},

		{name: "Thunderstorm", tags: ["aoe", "utility", "offense", "electric"], prerequisite: "ApprenticeLightning", spellPointCost: 1, sfx: "Fwoosh", school: "Elements", manacost: 4, components: ["Verbal"], level:2, type:"inert", buffs: [
			Object.assign({}, KDConduction),
		], bulletSpin: 0.1, onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
		{name: "StaticSphere", tags: ["electric", "metal", "summon", "aoe", "offense"], prerequisite: "Thunderstorm", sfx: "MagicSlash", school: "Elements", manacost: 8,
			upcastFrom: "Thunderstorm", upcastLevel: 2,
			components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, level:3, type:"hit", noSprite: true, onhit:"summon",
			summon: [{name: "StaticSphere", count: 1, time: 12, bound: true}], power: 1.5, time: 12, delay: -1, range: 6, size: 1, aoe: 0, lifetime: 1, damage: "inert"},

		{name: "LightningRune", tags: ["electric", "offense", "defense", "utility"], prerequisite: "ApprenticeLightning", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 2,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", time: 5, delay: 3, power: 4.5, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LightningRuneStrike", target: "onhit", directional:false, offset: false}, channel: 5},
		{name: "FlameRune", tags: ["fire", "offense", "defense"], prerequisite: "ApprenticeFire", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 2,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", delay: 3, power: 5.5, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "FlameRuneStrike", target: "onhit", directional:false, offset: false}, channel: 5},
		{name: "FreezeRune", tags: ["ice", "offense", "defense", "utility"], prerequisite: "ApprenticeIce", noise: 0, sfx: "Fwoosh", school: "Elements", spellPointCost: 1, manacost: 5,
			components: ["Legs"], noTargetPlayer: true, CastInWalls: false, level:1, type:"inert",
			onhit:"aoe", time: 30, delay: 3, power: 3, range: 2.99, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "FreezeRuneStrike", target: "onhit", directional:false, offset: false}, channel: 5},

		{name: "WaterBall", color: "#4f7db8", tags: ["water", "bolt", "offense", "utility"], prerequisite: "ApprenticeWater", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"buff",
			power: 3.5, delay: 0, range: 50, damage: "acid", speed: 3, playerEffect: {name: "Drench"},
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
		{name: "TidalBall", color: "#4f7db8", tags: ["water", "bolt", "offense", "utility"], prerequisite: "WaterBall", sfx: "FireSpell", school: "Elements", manacost: 6, components: ["Arms"], level:2, type:"bolt", size: 3, aoe: 1.5, projectileTargeting:true, onhit:"",  power: 3.5, pierceEnemies: true, delay: 0, range: 50, damage: "acid", speed: 1,
			upcastFrom: "WaterBall", upcastLevel: 1,
			effectTileDurationModTrail: 100, effectTileTrailAoE: 1.5, noTrailOnPlayer: true, effectTileTrail: {
				name: "Water",
				duration: 40,
			}},

		// Passive spells
		{name: "Shatter", tags: ["ice", "aoe", "offense"], prerequisite: "ApprenticeIce", school: "Elements", manacost: 1, components: [], power: 1.5, time: 4, level:2, type:"passive", events: [
			{type: "Shatter", trigger: "enemyStatusEnd"},
			{type: "Shatter", trigger: "beforePlayerAttack"},
			{type: "Shatter", trigger: "kill"},
		]},

	],
	"Conjure": [
		{goToPage: 2, name: "ApprenticeRope", tags: ["magic"], autoLearn: ["RopeBoltLaunch"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 2, name: "ApprenticeMetal", tags: ["magic"], autoLearn: ["SummonCuffs"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 2, name: "ApprenticeLeather", tags: ["magic"], autoLearn: ["SummonGag"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 2, name: "ApprenticeSummon", tags: ["magic"], autoLearn: ["Ally"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 2, name: "ApprenticeLatex", tags: ["magic"], autoLearn: ["SlimeBall"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 2, name: "ApprenticePhysics", tags: ["magic"], autoLearn: ["Wall"], hideLearned: true, hideUnlearnable: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "MPUp1", hide: true, school: "Any", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "MPUp2", hide: true, school: "Any", manacost: 0, components: [], level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "MPUp3", hide: true, school: "Any", manacost: 0, components: [], level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SummonUp1", hide: true, tags: ["upgrade"], hideLearned: true, hideUnlearnable: true, school: "Any", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SummonUp2", hide: true, tags: ["upgrade"], hideLearned: false, hideUnlearnable: true, prerequisite: "SummonUp1", school: "Any", manacost: 0, components: [], level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "Bomb", color: "#ff0000", prerequisite: "ApprenticeSummon", tags: ["aoe", "offense"], noise: 5, sfx: "FireSpell", school: "Conjure", manacost: 5, components: ["Verbal"], level:2,
			effectTileDurationMod: 7, hitSpin: 0.2, effectTile: {
				name: "Smoke",
				duration: -1,
			}, type:"inert", onhit:"aoe", time: 3, delay: 5, power: 10, range: 3, size: 3, aoe: 1.5, lifetime: 1, damage: "fire", playerEffect: {name: "Damage"}, channel: 1},

		{name: "FeatherCloud", color: "#ffffff", prerequisite: "TickleCloud", tags: ["tickle", "aoe", "dot", "offense", "utility", "denial"], noUniqueHits: true, noise: 1, landsfx: "Tickle", hitsfx: "Tickle", school: "Elements", manacost: 4,
			components: ["Arms"], hitSpin: 0.7, bulletSpin: 0.4, level:2, type:"inert", onhit:"aoe", delay: 1, power: 3.0, distract: 6.0, range: 2.5, size: 3, aoe: 1, lifetime: 3, damage: "tickle", playerEffect: {name: "Damage"},
		},
		{name: "TickleCloud", color: "#ffffff", prerequisite: "ApprenticeSummon", tags: ["tickle", "aoe", "dot", "offense", "utility", "denial"], piercing: true, noUniqueHits: true, noise: 1, landsfx: "Tickle", hitsfx: "Tickle", school: "Elements", manacost: 2,
			components: ["Arms"], hitSpin: 1, bulletSpin: 0.4, level:1, type:"dot", onhit:"aoe", delay: 9, power: 0.8, range: 3.99, size: 1, aoe: 0.5, lifetime: 1, damage: "tickle", playerEffect: {name: "Damage"},
		},//, distractEff: 2.0
		{name: "Snare", color: "#ff8899", prerequisite: "ApprenticeRope", tags: ["rope", "binding", "denial", "utility", "offense"], sfx: "FireSpell",
			school: "Conjure", manacost: 2, components: ["Legs"], noTargetEnemies: true, level:1, type:"inert", onhit:"lingering", lifetime:90, bindType: "Rope",
			time: 8, bind: 15, delay: 5, range: 1, damage: "stun", playerEffect: {name: "MagicRope", time: 3}}, // Creates a magic rope trap that creates magic ropes on anything that steps on it. They are invisible once placed. Enemies get rooted, players get fully tied!

		{name: "LeatherBurst", prerequisite: "ApprenticeLeather", tags: ["buff", "offense", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0, components: [], level:1, passive: true, type:"",
			events: [{type: "LeatherBurst", trigger: "playerCast", power: 3}]},
		{name: "SummonGag", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "gag", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 1.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "GagBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonBlindfold", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "blindfold", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 1.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 2, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "BlindfoldBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonArmbinder", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "armbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			upcastFrom: "SummonLeatherCuffs", upcastLevel: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "ArmbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLeatherCuffs", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "cuffs", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 2.5, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 1, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LeatherCuffsBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonCuffs", prerequisite: "ApprenticeMetal", tags: ["metal", "bolt", "binding", "burst", "cuffs", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 2, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 3, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "CuffsBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonLegbinder", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "legbinder", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 4, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "LegbinderBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonHarness", prerequisite: "ApprenticeLeather", tags: ["leather", "bolt", "binding", "burst", "harness", "utility", "offense"], components: ["Arms"], noise: 1,
			sfx: "MagicSlash", school: "Conjure", manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 5, range: 12, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "HarnessBolt", target: "target", directional:true, randomDirectionFallback: true, alwaysRandomBuff: "LeatherBurst", aimAtTarget: true, noTargetMoveDir: true, offset: false}},
		{name: "SummonStraitjacket", prerequisite: "SummonLeatherCuffs", tags: ["leather", "bolt", "binding", "burst", "straitjacket", "utility", "offense"], components: ["Arms"], noise: 1,
			upcastFrom: "SummonLeatherCuffs", upcastLevel: 2,
			sfx: "MagicSlash", school: "Conjure", manacost: 7, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe",
			time: 0, delay: 1, power: 12, range: 6, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "StraitjacketBolt", target: "target", directional:true, randomDirectionFallback: true, aimAtTarget: true, noTargetMoveDir: true, offset: false}},


		{name: "Petsuit", prerequisite: "SummonHarness", tags: ["leather", "summon", "utility", "petsuit"], sfx: "Magic", school: "Conjure", manacost: 1, components: [], level:2,
			type:"special", special: "Petsuit",
			onhit:"", time:0, power: 0.0, range: 2.99, size: 1, aoe: 0.5, damage: "glue"},

		{name: "DisplayStand", prerequisite: "ApprenticeMetal", tags: ["metal", "summon", "utility", "petsuit"], sfx: "Magic", school: "Conjure", manacost: 1, components: [], level:2,
			type:"special", special: "DisplayStand",
			onhit:"", time:0, power: 0.0, range: 2.99, size: 1, aoe: 0.5, damage: "glue"},

		{name: "RopeBoltLaunch", tags: ["rope", "bolt", "binding", "offense"], prerequisite: "ApprenticeRope", sfx: "MagicSlash", school: "Conjure",
			manacost: 3, components: ["Verbal"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 1, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
			spellcast: {spell: "RopeBolt", target: "target", directional:true, offset: false}},

		{name: "RopeStrike", prerequisite: "RopeBoltLaunch", tags: ["rope", "binding", "aoe", "offense"], sfx: "MagicSlash", effectTileDurationMod: 10, effectTile: {
			name: "Ropes",
			duration: 20,
		}, bulletSpin: 1, school: "Conjure", manacost: 3.5, components: ["Verbal"], level:2, type:"inert", onhit:"aoe", delay: 1, power: 3, bind: 4, time: 6, range: 3.5, size: 3, aoe: 1.5, lifetime: 1, damage: "chain",  bindType: "Rope", playerEffect: {name: "MagicRope", time: 4}},
		{name: "Slime", color: "#ff00ff", prerequisite: "SlimeSplash", tags: ["latex", "slime", "aoe", "offense"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeSplash", upcastLevel: 1,
			effectTileDurationMod: 12, effectTile: {
				name: "Slime",
				duration: 8,
			},
			onhit:"lingering", time: 4, delay: 1, range: 3.5, size: 3, aoe: 1.5, lifetime: 3, power: 4, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeSplash", color: "#ff00ff", prerequisite: "ApprenticeLatex", tags: ["latex", "slime", "aoe", "offense"], landsfx: "MagicSlash", school: "Conjure", manacost: 1.4, components: ["Legs"], level:1, type:"inert",
			effectTileDurationMod: 4, effectTile: {
				name: "Slime",
				duration: 6,
			},
			onhit:"lingering", time: 0, delay: 1, range: 2.5, size: 1, aoe: 1.01, lifetime: 1, power: 1, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeEruption", color: "#ff00ff", prerequisite: "Slime", tags: ["latex", "slime", "aoe", "denial", "offense"], landsfx: "MagicSlash", school: "Conjure", manacost: 7, components: ["Legs"], level:2, type:"inert",
			upcastFrom: "SlimeSplash", upcastLevel: 2,
			effectTileDurationMod: 16, effectTile: {
				name: "Slime",
				duration: 8,
			},
			onhit:"lingering", time: 4, delay: 1, range: 4, size: 3, aoe: 2.99, lifetime: 8, power: 5, lifetimeHitBonus: 4, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}},
		//{name: "PinkGas", manacost: 4, components: ["Verbal"], level:2, type:"inert", onhit:"lingering", time: 1, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 9999, damage: "stun", playerEffect: {name: "PinkGas", time: 3}}, // Dizzying gas, increases distraction
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
			trailPower: 4, trailLifetime: 10, trailTime: 3, trailDamage:"glue", trail:"lingering", trailChance: 1.0,
			effectTileDurationModTrail: 4, effectTileTrail: {
				name: "Slime",
				duration: 4,
			}}, // Throws a ball of slime which oozes more slime
		{name: "Leap", prerequisite: "ApprenticePhysics", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure",
			manacost: 3, components: ["Verbal"], noTargetDark: true, noTargetEnemies: true, level:2, type:"hit", onhit:"teleport", delay: 1, lifetime:1, range: 3, damage: ""}, // A quick blink which takes effect instantly, but requires legs to be free
		{name: "Blink", prerequisite: "Leap", tags: ["physics", "utility", "defense"], sfx: "Teleport", school: "Conjure", upcastFrom: "Leap", upcastLevel: 2,
			manacost: 6, components: ["Verbal"], noTargetEnemies: true, level:1, type:"hit", onhit:"teleport", delay: 1, lifetime:1, range: 5.99, damage: ""}, // A slow blink with short range, but it uses verbal components
		{name: "Wall", prerequisite: "ApprenticePhysics", tags: ["summon", "utility", "defense", "physics"], sfx: "MagicSlash", school: "Conjure", manacost: 3, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "Wall", count: 1, time: 10, bound: true}], power: 0, time: 10, delay: -1, range: 6, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{name: "Ally", prerequisite: "ApprenticeSummon", tags: ["summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 8, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:1, type:"hit", onhit:"summon", noSprite: true, summon: [{name: "Ally", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 2.9, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{name: "FireElemental", prerequisite: "ApprenticeSummon", tags: ["fire", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 15, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "FireElemental", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "WaterMote", prerequisite: "ApprenticeSummon", tags: ["water", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 15, components: ["Arms"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "WaterMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "AirMote", prerequisite: "ApprenticeSummon", tags: ["air", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 15, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "AirMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "EarthMote", prerequisite: "ApprenticeSummon", tags: ["earth", "summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 15, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "EarthMote", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 3.5, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},
		{name: "Golem", prerequisite: "Ally", tags: ["summon", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 20, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:3, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "Golem", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: -1, range: 2.5, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{name: "StormCrystal", prerequisite: "ApprenticeSummon", tags: ["summon", "denial", "offense"], noise: 7, sfx: "MagicSlash", school: "Conjure", manacost: 10, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, piercing: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "StormCrystal", count: 1, time: 9999, bound: true}], power: 0, time: 30, delay: -1, range: 2.5, size: 1, aoe: 0.5, lifetime: 1, damage: "fire"},
		{noAggro: true, name: "Heal", prerequisite: "ApprenticeSummon",  bulletSpin: 0.1, hitSpin: 0.4, noise: 3, sfx: "FireSpell", school: "Conjure", manacost: 4, components: ["Verbal"], level:3, type:"inert", onhit:"aoe", delay: 1, power: 1.5, range: 4.5, size: 5, aoe: 2.9, lifetime: 4, time: 2, damage: "heal", channel: 4},
		{noAggro: true, buff: true, heal: true, name: "Heal2", prerequisite: "ApprenticeSummon", sfx: "MagicSlash", school: "Conjure", manacost: 3, components: ["Verbal"], noTargetPlayer: true, mustTarget: true, level:1, type:"hit",
			onhit:"heal", time:2, lifetime: 1, delay: 1, power: 4.5, aoe: 0.9, range: 7, size: 1, damage: "inert"},
		{name: "FloatingWeapon", prerequisite: "ApprenticePhysics", tags: ["buff", "offense", "physics"], sfx: "MagicSlash", school: "Conjure", manacost: 2, components: [], level:3, type:"passive",
			events: [{type: "FloatingWeapon", trigger: "playerAttack"}, {type: "HandsFree", trigger: "getWeapon"}, {type: "HandsFree", trigger: "calcDamage"}]},
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
		{name: "ZoneOfPurity", color: "#ffff00", prerequisite: "Chastity", tags: ["metal", "binding", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 7, components: ["Verbal"], level:1, type:"inert",
			onhit:"aoe", power: 0, delay: 40, range: 4.5, size: 3, lifetime: 1, aoe: 2.5, damage: "charm",
			events: [{trigger: "bulletTick", type: "ZoneOfPurity", aoe: 2.5, power: 0.5}]
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
		{name: "CommandRelease", prerequisite: "CommandDisenchant", tags: ["command", "binding", "defense"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Verbal"], level:3,
			type:"special", special: "CommandRelease",
			onhit:"", time:0, power: 10.0, range: 2.5, size: 1, aoe: 1.5, damage: "inert"},
		KDCommandWord,

		{name: "CommandSlime", prerequisite: "ApprenticeLatex", tags: ["command", "slime", "defense"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Verbal"], level:1,
			type:"special", special: "CommandSlime",
			onhit:"", time:0, power: 9.9, range: 2.5, size: 1, aoe: 1.5, damage: "inert"},

		{name: "SlimeWalk", tags: ["slime", "latex", "defense"], prerequisite: "ApprenticeLatex", school: "Conjure", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.5, buffType: "glueDamageResist"},
		]},

		{name: "SlimeWall", tags: ["latex", "utility", "slime", "wall"], hide: true, autoLearn: ["SlimeWallHoriz", "SlimeWallVert"], prerequisite: "ApprenticeLatex", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 1, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "SlimeWallVert", color: "#ff00ff", hideUnlearnable: true, prerequisite: "SlimeWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			onhit:"lingering", aoetype: "vert", pierceEnemies: true, time: 2, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			buffs: [KDSlimed]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "SlimeWallHoriz", color: "#ff00ff", hideUnlearnable: true, prerequisite: "SlimeWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Legs"], level:1, type:"inert",
			onhit:"lingering", aoetype: "horiz", pierceEnemies: true, time: 2, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			buffs: [KDSlimed]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

		{name: "LatexWall", tags: ["latex", "utility", "slime", "wall"], hide: true, autoLearn: ["LatexWallVert", "LatexWallHoriz"],
			prerequisite: "SlimeWall", hideLearned: true, school: "Conjure", manacost: 0, spellPointCost: 2, components: [], level:1, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "LatexWallVert", color: "#aa00ff", hideUnlearnable: true, prerequisite: "LatexWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeWallVert", upcastLevel: 1,
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			onhit:"lingering", aoetype: "vert", pierceEnemies: true, time: 0, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitevents: [
				{trigger: "bulletHitEnemy", type: "LatexWall", power: 5, damage: "glue", time: 6},
			],
			buffs: [KDEncased]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
		{name: "LatexWallHoriz", color: "#aa00ff", hideUnlearnable: true, prerequisite: "LatexWall", tags: ["latex", "slime", "defense", "aoe", "denial", "utility", "wall"], landsfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:1, type:"inert",
			upcastFrom: "SlimeWallHoriz", upcastLevel: 1,
			hitColor: 0xff00ff, hitLight: 2.5, bulletColor: 0xff00ff, bulletLight: 3.5,
			onhit:"lingering", aoetype: "horiz", pierceEnemies: true, time: 0, delay: 2, range: 4, size: 3, aoe: 2.5, lifetime: 20, power: 0, lifetimeHitBonus: 4, damage: "glue", secondaryhit: "buffnoAoE",
			hitevents: [
				{trigger: "bulletHitEnemy", type: "LatexWall", power: 5, damage: "glue", time: 6},
			],
			buffs: [KDEncased]}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

		{name: "Coalesce", prerequisite: "Spread", tags: ["latex", "slime", "aoe", "utility", "offense"], sfx: "MagicSlash", school: "Conjure", manacost: 4, components: ["Verbal"], level:2,
			type:"special", special: "Coalesce",
			onhit:"", time:0, power: 0.5, range: 3.5, size: 1, aoe: 2.5, damage: "glue"},

		{name: "ElasticGrip", prerequisite: "ApprenticeLatex", tags: ["latex", "utility"], sfx: "FireSpell", school: "Conjure", manacost: 2, components: ["Arms"], level:1,
			type:"special", special: "ElasticGrip",
			onhit:"", time:0, power: 1.0, range: 7.99, size: 1, damage: "glue"},

		{name: "SlimeToLatex", prerequisite: "ApprenticeLatex", tags: ["latex", "aoe", "utility", "denial"], sfx: "MagicSlash", school: "Conjure", manacost: 9, components: ["Legs"], level:2,
			type:"special", special: "SlimeToLatex",
			onhit:"", time:0, power: 2, range: 3.0, size: 1, aoe: 1.5, damage: "glue"},

		{name: "Engulf", tags: ["latex", "slime", "buff", "offense"], prerequisite: "ApprenticeLatex", sfx: "MagicSlash", school: "Conjure", manacost: 1.5, components: [], level:1, type:"passive", events: [
			{type: "ElementalEffect", power: 2, damage: "glue", trigger: "playerAttack", cost: 1.0},
			{type: "EffectTile", kind: "Slime", duration: 8, trigger: "playerAttack", cost: 0.5},
		]},

		{name: "Awaken", prerequisite: "Spread", tags: ["slime", "latex", "binding", "offense", "aoe"], sfx: "MagicSlash", school: "Conjure", manacost: 2.0, components: ["Verbal"], level:1,
			type:"special", special: "Awaken",
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2.5, damage: "inert"},

		{name: "Spread", prerequisite: "ApprenticeLatex", tags: ["slime", "latex", "utility",], sfx: "MagicSlash", school: "Conjure", manacost: 1.0, components: ["Verbal"], level:1,
			type:"special", special: "Spread",
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2, damage: "inert"},

		{name: "Animate", prerequisite: "Awaken", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 6, components: ["Verbal"], level:1,
			type:"special", special: "Animate", upcastFrom: "Awaken", upcastLevel: 1,
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 1.5, damage: "inert"},

		{name: "AnimateLarge", prerequisite: "Animate", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 10, components: ["Verbal"], level:2,
			type:"special", special: "AnimateLarge", upcastFrom: "Awaken", upcastLevel: 2,
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 1.1, damage: "inert"},

		{name: "AnimatePuppet", prerequisite: "Awaken", tags: ["slime", "latex", "summon"], sfx: "MagicSlash", school: "Conjure", manacost: 6, components: ["Verbal"], level:3,
			type:"special", special: "AnimatePuppet",
			onhit:"", time:0, power: 0, range: 3.99, size: 1, aoe: 2.5, damage: "inert"},

		{name: "OneWithSlime", tags: ["slime", "latex", "utility"], prerequisite: "ApprenticeLatex", school: "Elements", spellPointCost: 3, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "OneWithSlime", trigger: "calcComp", requiredTag: "slime"},
		]},

		{name: "SlimeMimic", tags: ["slime", "latex", "utility"], prerequisite: "ApprenticeLatex", school: "Elements", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "SlimeMimic", trigger: "tick"},
		]},


		{name: "SteelRainPlug", color: "#ffffff", tags: ["binding", "metal", "bolt", "offense"], prerequisite: "ApprenticeMetal", sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 2, components: ["Arms"], level:1, type:"bolt",
			projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "pierce", speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "pierce", power: 2, tag: "plugSpell"},
			bulletColor: 0xffffff, bulletLight: 1,
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
		{goToPage: 3, name: "ApprenticeShadow", tags: ["magic"], autoLearn: ["Dagger"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 3, name: "ApprenticeLight", tags: ["magic"], autoLearn: ["Flash"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 3, name: "ApprenticeMystery", tags: ["magic"], autoLearn: ["Camo"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 3, name: "ApprenticeProjection", tags: ["magic"], autoLearn: ["Decoy"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{goToPage: 3, name: "ApprenticeKnowledge", tags: ["magic"], autoLearn: ["TrueSteel"], hideLearned: true, hideUnlearnable: true, school: "Illusion", manacost: 0, spellPointCost: 1, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},

		{name: "Athlete", tags: ["stamina", "utility"], school: "Illusion", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.67, buffType: "SprintEfficiency"},
		]},
		{name: "Sneaky", tags: ["buff", "utility"], school: "Illusion", spellPointCost: 1, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.5, prereq: "Waiting", buffType: "Sneak", mult: 1, tags: ["SlowDetection", "move", "cast"]},
		]},
		{name: "Evasive1", tags: ["buff", "defense"], school: "Illusion", spellPointCost: 1, hideLearned: true, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.1, buffType: "Evasion"},
		]},
		{name: "Evasive2", tags: ["buff", "defense"], school: "Illusion", spellPointCost: 1, hideLearned: true, prerequisite: "Evasive1", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.15, buffType: "Evasion"},
		]},
		{name: "Evasive3", tags: ["buff", "defense"], school: "Illusion", spellPointCost: 1, prerequisite: "Evasive2", manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{type: "Buff", trigger: "tick", power: 0.25, buffType: "Evasion"},
		]},
		{name: "CriticalStrike", tags: ["damage", "offense", "buff"], school: "Illusion", spellPointCost: 2, manacost: 0, components: [], level:1, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert", events: [
			{trigger: "beforePlayerAttack", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
			{trigger: "calcDisplayDamage", type: "CritBoost", prereq: "damageType", kind: "melee", power: 0.5},
		]},

		{name: "Analyze", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge"], school: "Illusion", manacost: 2.5, defaultOff: true, cancelAutoMove: true, costOnToggle: true, components: [], level:1, type:"passive",
			events: [{type: "Analyze", trigger: "toggleSpell", power: 5, time: 20}, {type: "Analyze", trigger: "tick", power: 5, time: 20}]},

		{name: "APUp1", hide: true, school: "Any", manacost: 0, components: [], level:2, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "APUp2", hide: true, school: "Any", manacost: 0, components: [], level:3, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "APUp3", hide: true, school: "Any", manacost: 0, components: [], level:4, passive: true, type:"", onhit:"", time: 0, delay: 0, range: 0, lifetime: 0, power: 0, damage: "inert"},
		{name: "Dagger", prerequisite: "ApprenticeShadow", tags: ["bolt", "shadow", "offense"], sfx: "MagicSlash", school: "Illusion", manacost: 2, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, noDoubleHit: true, piercing: true, onhit:"", power: 2.5, time: 0, delay: 0, range: 6, damage: "cold", speed: 4, playerEffect: {name: "Damage"}}, // Throws a fireball in a direction that moves 1 square each turn
		{name: "Flash", color: "#ffffff", prerequisite: "ApprenticeLight", tags: ["light", "utility", "aoe", "offense"], noise: 8, sfx: "FireSpell",
			hitColor: 0xffffff, hitLight: 6,
			school: "Illusion", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 4, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 4}},
		{name: "Ring", prerequisite: "ApprenticeLight", tags: ["aoe", "utility", "stealth"], noise: 10, sfx: "MagicSlash", school: "Illusion", manacost: 1, components: ["Arms"], level:1, type:"inert", onhit:"aoe", time: 2, delay: 1, power: 1, range: 7, size: 3, aoe: 1.5, lifetime: 1, damage: "stun"},
		{name: "GreaterFlash", color: "#ffffff", tags: ["light", "utility", "aoe", "offense"], prerequisite: "Flash", spellPointCost: 1,
			upcastFrom: "Flash", upcastLevel: 1,
			hitColor: 0xffffff, hitLight: 8,
			noise: 10, sfx: "FireSpell", school: "Illusion", manacost: 5, components: ["Verbal"], level:2, type:"inert", onhit:"aoe", time: 8, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 6}}, // Much greater AoE. Careful not to get caught!
		{name: "FocusedFlash", color: "#ffffff", tags: ["light", "utility", "aoe", "offense"], prerequisite: "GreaterFlash", spellPointCost: 1,
			upcastFrom: "Flash", upcastLevel: 2,
			hitColor: 0xffffff, hitLight: 11,
			noise: 10, sfx: "FireSpell", school: "Illusion", manacost: 7, components: ["Verbal"], level:3, type:"inert", onhit:"aoe", time: 12, delay: 2, power: 1, range: 2.5, size: 5, aoe: 2.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 10}}, // Longer delay, but the stun lasts much longer.
		{name: "Shroud", prerequisite: "ApprenticeShadow", tags: ["aoe", "buff", "utility", "stealth", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [
			{id: "Shroud", type: "Evasion", power: 7.0, player: true, enemies: true, tags: ["darkness"], range: 1.5},
			{id: "Shroud2", aura: "#444488", type: "Sneak", power: 4.0, player: true, duration: 8, enemies: false, tags: ["darkness"], range: 1.5}
		], onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: "",
		effectTileDurationModPre: 3, effectTilePre: {
			name: "Smoke",
			duration: 8,
		}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
		{name: "Invisibility", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "stealth", "defense"], sfx: "Invis", school: "Illusion", manacost: 8, components: ["Verbal"], mustTarget: true, level:3, type:"buff",
			buffs: [
				{id: "Invisibility", aura: "#888888", type: "Sneak", duration: 10, power: 10.0, player: true, enemies: true, tags: ["invisibility"]},
				{id: "Invisibility2", type: "SlowDetection", duration: 14, power: 0.5, player: true, enemies: false, tags: ["invisibility"]},
			], onhit:"", time:14, power: 0, range: 2, size: 1, damage: ""},
		{name: "TrueSteel", prerequisite: "ApprenticeKnowledge", tags: ["offense", "stealth", "knowledge"], sfx: "MagicSlash", school: "Illusion", manacost: 2, components: ["Arms"], noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, time:1, power: 4, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "slash",
			events: [{trigger: "beforeDamageEnemy", type: "MultiplyDamageStealth", power: 2.5, humanOnly: true}]
		},
		{name: "Camo", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "stealth", "defense"], sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Legs"], mustTarget: true, noTargetEnemies: true, level:2, type:"buff",
			buffs: [
				{id: "Camo", aura: "#3b7d4f", type: "SlowDetection", duration: 50, power: 49.0, player: true, enemies: true, endSleep: true, currentCount: -1, maxCount: 1, tags: ["SlowDetection", "move", "cast"]}
			], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "ShadowBlade", prerequisite: "ApprenticeShadow", tags: ["buff", "offense", "shadow"], sfx: "MagicSlash", school: "Illusion", manacost: 6, components: ["Arms"], mustTarget: true, level:2, type:"buff",
			buffs: [{id: "ShadowBlade", aura: "#7022a0", type: "AttackDmg", duration: 50, power: 2.0, player: true, enemies: true, maxCount: 5, tags: ["attack", "damage"]}], onhit:"", time:50, power: 0, range: 2, size: 1, damage: ""},
		{name: "ShadowSlash", tags: ["aoe", "offense", "shadow"], prerequisite: "ShadowBlade", sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, piercing: true, noTerrainHit: true, noEnemyCollision: true, onhit:"aoe", power: 4.5, delay: 0, range: 1.5, aoe: 1.5, size: 3, lifetime:1, damage: "cold", speed: 1, time: 2,
			trailspawnaoe: 1.5, trailPower: 0, trailLifetime: 1.1, trailHit: "", trailDamage:"inert", trail:"lingering", trailChance: 0.4},
		{name: "Decoy", tags: ["summon", "utility", "stealth", "defense"], prerequisite: "ApprenticeProjection", sfx: "MagicSlash", school: "Illusion", manacost: 6, components: ["Legs"], noTargetEnemies: true, noTargetPlayer: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "Decoy", count: 1, time: 20}], power: 0, time: 20, delay: -1, range: 4, size: 1, aoe: 0, lifetime: 1, damage: "fire"},
		{name: "ShadowWarrior", prerequisite: "ApprenticeShadow", tags: ["summon", "offense", "shadow", "dot"], sfx: "MagicSlash", school: "Illusion", manacost: 10, components: ["Verbal"], noTargetEnemies: true, noTargetPlayer: true, level:2, type:"hit", noSprite: true, onhit:"summon", summon: [{name: "ShadowWarrior", count: 1, time: 12}], power: 6, time: 12, delay: -1, range: 3.5, size: 1, aoe: 0, lifetime: 1, damage: "inert"},
		{name: "Corona", color: "#ffffff",
			bulletColor: 0xffff77, bulletLight: 5,
			tags: ["light", "offense"], prerequisite: "Light", noise: 4, sfx: "MagicSlash", school: "Illusion", spellPointCost: 1, manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
			spellcast: {spell: "CoronaBeam", target: "target", directional:true, offset: false}, channel: 2},
		{name: "TrueSight", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge"], school: "Illusion", manacost: 1, defaultOff: true, cancelAutoMove: true, components: [], level:1, type:"passive", events: [
			{type: "TrueSight", trigger: "vision"},
			{type: "Blindness", trigger: "calcStats", power: -1},
			{type: "AccuracyBuff", trigger: "tick", power: 0.4},
		]},
		{name: "EnemySense", prerequisite: "ApprenticeKnowledge", tags: ["buff", "utility", "knowledge"], school: "Illusion", manacost: 2, defaultOff: true, cancelAutoMove: true, costOnToggle: true, components: [], level:2, type:"passive",
			events: [{type: "EnemySense", trigger: "draw", dist: 12, distStealth: 6}]},
		{name: "Light", prerequisite: "ApprenticeLight", tags: ["buff", "utility", "light"], school: "Illusion", manacost: 2, spellPointCost: 1, defaultOff: true, cancelAutoMove: true, costOnToggle: true, time: 12, components: [], level:2, type:"passive",
			events: [{type: "Light", trigger: "getLights", power: 12, time: 12}, {type: "Light", trigger: "toggleSpell", power: 12, time: 12}]},
		{name: "Evasion", prerequisite: "ApprenticeMystery", tags: ["buff", "utility", "defense"], sfx: "Fwoosh", school: "Illusion", manacost: 5, components: ["Legs"], mustTarget: true, level:1, type:"buff",
			buffs: [
				{id: "Evasion", type: "Evasion", labelcolor: "#a288b6", duration: 25, power: 3.0, player: true, enemies: true, maxCount: 5, tags: ["defense", "incomingHit"]},
			], onhit:"", time:25, power: 0, range: 2, size: 1, damage: ""},
	],
};
/**
 * Spells that are not in the base spell lists
 * @type {spell[]}
 */
let KinkyDungeonSpellListEnemies = [
	{name: "AwakenStrike", tags: ["offense", "latex", "slime", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 2.5, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "glue",
		playerEffect: {name: "Bind", damage: "glue", power: 3, tag: "slimeRestraints"},
		events: [
			{trigger: "bulletHitEnemy", type: "EncaseBound"},
		],
	},

	/** The following are particle effects */
	{name: "OrgasmStrike", tags: ["offense", "nature", "binding"], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyCM1", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EffectEnemyLock1", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 0, time: 10, range: 1.5, size: 3, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "EnemyMiscast", tags: [], sfx: "FireSpell", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "inert",
	},
	{name: "Summon", faction: "Enemy", school: "Conjure", manacost: 0, components: ["Verbal"], level:1, type:"hit", onhit:"instant", time:0, power: 0, delay: 0, range: 4, size: 1, lifetime: 1, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.

	/** End particle effects */

	{name: "BindRope", tags: ["offense", "rope", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 3.0, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "chain",
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "ropeRestraints"},
	},
	{name: "BindFabric", tags: ["offense", "fabric", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 3.0, time: 5, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "glue",
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "ribbonRestraints"},
	},
	{name: "BindVine", tags: ["offense", "nature", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 3.0, time: 10, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "crush",
		playerEffect: {name: "Bind", damage: "crush", power: 2, tag: "vineRestraints"},
	},
	{name: "BindChain", tags: ["offense", "metal", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 3.0, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "crush",
		events: [{trigger: "bulletHitEnemy", type: "DisarmHumanoid", time: 8}],
		playerEffect: {name: "Bind", damage: "crush", power: 2, tag: "chainRestraints"},
	},
	{name: "BindBelt", tags: ["offense", "leather", "binding"], sfx: "MagicSlash", school: "Conjure", manacost: 0.5, components: ["Verbal"],
		noTargetPlayer: true, mustTarget: true, level:1, type:"hit", onhit:"instant", evadeable: false, power: 0, bind: 4.0, range: 1.5, size: 1, lifetime: 1, aoe: 0.5, damage: "chain",
		events: [{type: "MakeVulnerable", trigger: "beforeDamageEnemy", time: 3,},],
		playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "leatherRestraints"},
	},

	{name: "GagBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 2.0, delay: 0, range: 15, damage: "chain", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "gagSpell"},
		events: [
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 15},
			{type: "ElementalIfNotSilenced", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "ArmbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "HeavySwing", school: "Conjure", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, damage: "chain", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 2, tag: "armbinderSpell"},
		events: [
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 14},
			{type: "SilenceHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "silenced"},
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 14, prereq: "blinded"},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
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
			{type: "BlindHumanoid", trigger: "bulletHitEnemy", time: 20},
			{type: "ElementalIfNotBlinded", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "CuffsBolt", tags: ["binding", "metal", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 4, components: ["Arms"], level:2, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 3.0, delay: 0, range: 15, damage: "chain", speed: 5, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 3, tag: "cuffsSpell"},
		events: [
			{type: "DisarmHumanoid", trigger: "bulletHitEnemy", time: 6},
			{type: "ElementalIfNotDisarmed", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 4},
		], effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Chains",
			duration: 20,
		},
	},
	{name: "LegbinderBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:2, type:"bolt",
		projectileTargeting:true, onhit:"", time: 11,  power: 4.0, delay: 0, range: 15, damage: "chain", speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 4, tag: "legbinderSpell"},
		events: [
			{type: "ElementalIfNotSnared", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "HarnessBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:2, type:"bolt",
		projectileTargeting:true, onhit:"", time: 0,  power: 5.0, delay: 0, range: 15, damage: "crush", speed: 3, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 5, tag: "harnessSpell"},
		events: [
			{type: "BoundBonus", trigger: "bulletHitEnemy", damage: "chain", power: 0, bind: 5},
		], effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
			name: "Belts",
			duration: 20,
		},
	},
	{name: "StraitjacketBolt", tags: ["binding", "leather", "bolt", "offense"], minRange: 1.5, sfx: "MagicSlash", hitsfx: "LightSwing", school: "Conjure", manacost: 6, components: ["Arms"], level:2, type:"bolt",
		projectileTargeting:true, onhit:"buff", time: 0, bind: 12, power: 1.0, delay: 0, range: 6, damage: "crush", speed: 2, bulletLifetime: 5, playerEffect: {name: "Bind", damage: "chain", power: 5, tag: "jacketSpell"},
		buffs: [
			{id: "StraitjacketBolt", aura: "#ff4400", type: "Locked", duration: 14, power: 2.0, player: true, enemies: true, tags: ["lock", "debuff"]},
		],
		events: [
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

	{name: "LesserInvisibility", sfx: "MagicSlash", school: "Illusion", manacost: 0, components: ["Verbal"], mustTarget: true, level:3, type:"buff", buffs: [{id: "LesserInvisibility", aura: "#888888", type: "Sneak", duration: 10, power: 3, player: true, enemies: true, tags: ["invisibility"]}], onhit:"", time:10, power: 0, range: 1.5, size: 1, damage: ""},


	// Divine Gifts
	{name: "Disarm", tags: ["weapon"], sfx: "Chain", school: "Illusion", manacost: 0, components: [], level:1, type:"special", special: "Disarm", noMiscast: true,
		onhit:"", time:5, power: 0, range: 3.99, size: 1, damage: ""},
	{name: "Freedom", sfx: "Magic", hitsfx: "Struggle", school: "Conjure", manacost: 15, components: [], mustTarget: true, selfTargetOnly: true, level:5, type:"hit",
		onhit:"instant", time:4, lifetime: 1, bind: 8, delay: 1, power: 4, aoe: 2.99, range: 1.5, size: 5, damage: "chain", playerEffect: {name: "RemoveLowLevelRope"}},

	{allySpell: true, name: "BeltStrike", noise: 2, sfx: "Struggle", school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 4, delay: 0, range: 4, speed: 4, size: 1, damage: "inert",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0,
		trailcast: {spell: "SingleBelt", target: "onhit", directional:true, offset: false}},

	{allySpell: true, name: "SingleBelt", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, bind: 4, range: 2, size: 1, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsLeatherWeak", tags: ["leatherRestraints", "leatherRestraintsHeavy"], power: 3, damage: "chain", count: 2, noGuard: true}},
	{allySpell: true, name: "Slimethrower", landsfx: "FireSpell", manacost: 0, components: ["Legs"], level:2, type:"hit", onhit:"lingering", time: 3, range: 3.9, power: 3.5, size: 1, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{allySpell: true, name: "Slimethrower2", landsfx: "FireSpell", manacost: 0, components: [], level:2, type:"hit", onhit:"lingering", time: 3, range: 3.9, power: 2.5, size: 1, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{name: "SlimeSuit", sfx: "MagicSlash", school: "Illusion", manacost: 5, components: [], level:1, type:"special", special: "dress", outfit: "SlimeSuit", noMiscast: true,
		onhit:"", time:25, power: 0, range: 1.5, size: 1, damage: ""},

	{name: "SlimeForm", sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Verbal"], mustTarget: true, level:3, type:"buff", noMiscast: true,
		buffs: [
			{id: "SlimeForm", type: "glueDamageResist", aura: "#ff00ff", duration: 25, power: 0.5, player: true, enemies: false, tags: ["defense"]},
			{id: "SlimeForm2", type: "Squeeze", duration: 25, power: 0.5, player: true, enemies: false, tags: ["mobility"]},
			{id: "SlimeForm3", type: "Evasion", duration: 25, power: 0.5, player: true, enemies: false, tags: ["defense"]},
			{id: "SlimeForm4", type: "Counterattack", duration: 25, power: 2.5, player: true, enemies: false, tags: ["counter"], events: [
				{trigger: "beforeAttack", type: "CounterattackDamage", power: 2.5, damage: "glue"},
			]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: "",
		extraCast: [{spell: "Slimethrower2"}, {spell: "SlimeSuit"}]},
	{name: "AvatarForm", sfx: "PowerMagic", school: "Elements", manacost: 8, components: ["Verbal"], mustTarget: true, level:3, type:"buff", noMiscast: true,
		buffs: [
			{id: "AvatarFire", aura: "#f1641f", type: "event", duration: 9999, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_fire"], events: [
				{trigger: "calcMana", type: "AvatarFire", power: 5.0},
			]},
			{id: "AvatarWater", aura: "#2789cd", type: "event", duration: 9999, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_water"], events: [
				{trigger: "calcMana", type: "AvatarWater", power: 5.0},
			]},
			{id: "AvatarAir", aura: "#c9d4fd", type: "event", duration: 9999, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_air"], events: [
				{trigger: "calcMana", type: "AvatarAir", power: 5.0},
			]},
			{id: "AvatarEarth", aura: "#61a53f", type: "event", duration: 9999, power: 5, player: true, enemies: false, maxCount: 1, tags: ["cast_earth"], events: [
				{trigger: "calcMana", type: "AvatarEarth", power: 5.0},
			]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: ""},


	// Rest of the spells
	{name: "ShockStrike", sfx: "Shock", manacost: 1, bulletColor: 0x8888ff, bulletLight: 2,
		hitColor: 0x8888ff, hitLight: 6, components: ["Arms"], level:1, type:"hit", noTerrainHit: true, onhit:"aoe", time: 1, delay: 1, power: 2.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "StaticSphereStrike", sfx: "Shock", manacost: 2, bulletColor: 0x8888ff, bulletLight: 2,
		hitColor: 0x8888ff, hitLight: 6, components: ["Verbal"], level:1, type:"hit", noTerrainHit: true, onhit:"aoe", time: 1, delay: 1, power: 1.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "LightningRuneStrike", bulletColor: 0x8888ff, bulletLight: 2,
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		hitColor: 0x8888ff, hitLight: 6, hitsfx: "Shock", manacost: 2, components: ["Legs"], level:1, type:"dot", noTerrainHit: true, onhit:"", time: 4, delay: 300, power: 4.5, range: 2, size: 1, aoe: 0.5, lifetime: 1, damage: "electric"},
	{name: "FlameRuneStrike", bulletColor: 0xb83716, bulletLight: 2,
		hitColor: 0xe64539, hitLight: 6, hitsfx: "Lightning", manacost: 2, components: ["Legs"], level:1, type:"dot", noTerrainHit: true, onhit:"", delay: 300, power: 5.5, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "fire"},
	{name: "FreezeRuneStrike", hitsfx: "Freeze", manacost: 2, bulletColor: 0x8888ff, bulletLight: 2,
		hitColor: 0x8888ff, hitLight: 6, components: ["Legs"], level:1, type:"dot", noTerrainHit: true, onhit:"", time: 30, delay: 300, power: 3.0, range: 2, size: 3, aoe: 0.5, lifetime: 1, damage: "ice"},
	{name: "EarthformSingle", tags: ["earth", "utility", "summon"], noSprite: true, minRange: 0, landsfx: "Bones", hideUnlearnable: true, manacost: 4, components: ["Legs"], prerequisite: ["Earthform"],
		level:1, type:"hit", onhit:"summon", summon: [{name: "EarthenMonolith", count: 1, time: 9999, bound: true}], power: 0, time: 9999, delay: 1, range: 4, size: 1, aoe: 0.5, lifetime: 1, damage: "inert"},

	{name: "DarkShroud", sfx: "FireSpell", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "DarkShroud", type: "Evasion", power: 1.5, player: false, enemies: true, tags: ["heavydarkness"], range: 1.5},],
		onhit:"", time:8, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: "",
		effectTileDurationModPre: 3, effectTilePre: {
			name: "Smoke",
			duration: 8,
		}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Slippery", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
		buffs: [
			{id: "Slippery", aura: "#00ff00", type: "BoostStruggle", duration: 10, power: 0.1, player: true, enemies: false, tags: ["struggle"]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: ""},
	{name: "Cutting", sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Verbal"], mustTarget: true, selfTargetOnly: true, level:1, type:"buff", channel: 4,
		buffs: [
			{id: "Cutting", aura: "#ffff00", type: "BoostCutting", duration: 10, power: 0.3, player: true, enemies: false, tags: ["struggle"]},
			{id: "Cutting2", type: "BoostCuttingMinimum", duration: 10, power: 0.8, player: true, enemies: false, tags: ["struggle", "allowCut"]},
		], onhit:"", time:10, power: 0, range: 2, size: 1, damage: ""},
	{enemySpell: true, name: "EnemyCorona",
		bulletColor: 0xffff77, bulletLight: 5,
		minRange: 0, noise: 4, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "EnemyCoronaBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "EnemyCoronaBeam",
		trailColor: 0xffff77, trailLight: 3,
		sfx: "FireSpell", school: "Elements", manacost: 0, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 4, delay: 0, range: 8, speed: 50, size: 1, damage: "fire",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "CoronaShock", time: 3}},
	{enemySpell: true, name: "MonolithBeam",
		bulletColor: 0xff5555, bulletLight: 5,
		minRange: 0, noise: 4, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "MonolithBeamBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "MonolithBeamBeam",
		trailColor: 0xff5555, trailLight: 3,
		sfx: "MagicSlash", school: "Elements", manacost: 0, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 6, delay: 0, range: 8, speed: 50, size: 1, damage: "chain",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "CrystalBind", time: 3}},

	{enemySpell: true, name: "ClericBeam",
		bulletColor: 0x88ff88, bulletLight: 5,
		color: "#88ff88", minRange: 0, noise: 4, sfx: "MagicSlash", school: "Illusion", manacost: 7, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false,
		spellcast: {spell: "ClericBeamBeam", target: "target", directional:true, offset: false}, channel: 2},
	{enemySpell: true, name: "ClericBeamBeam",
		trailColor: 0x88ff88, trailLight: 3,
		sfx: "MagicSlash", school: "Elements", manacost: 0, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 6, delay: 0, range: 8, speed: 50, size: 1, damage: "fire",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "MysticShock", time: 3}},

	{name: "BlasterBlast", hitsfx: "Shock", sfx: "Laser", school: "Elements", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.5, time: 1, delay: 0,
		bulletColor: 0xffff00, bulletLight: 5,
		range: 8, speed: 3, size: 1, damage: "electric", playerEffect: {name: "Shock", time: 3}},
	{enemySpell: true, name: "EnemyBlast", noFirstChoice: true, hitsfx: "Shock", sfx: "Laser", school: "Elements", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.5, time: 1, delay: 0,
		bulletColor: 0x00ffff, bulletLight: 5,
		range: 8, speed: 3, size: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}},

	{name: "BondageBust", noise: 7, sfx: "Laser", school: "Illusion", manacost: 0, components: [], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		bulletColor: 0xffff00, bulletLight: 5,
		spellcast: {spell: "BondageBustBeam", target: "target", directional:true, offset: false}, noMiscast: true, channel: 1},
	{name: "BondageBustBeam", hitsfx: "Shock", school: "Elements", manacost: 0, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 3, time: 3, delay: 0, range: 8, speed: 50, size: 1, damage: "electric",
		trailColor: 0xffff00, trailLight: 3,
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1, playerEffect: {name: "Shock", time: 3}},
	{name: "HeartArrow", sfx: "MagicSlash", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "soul", speed: 2,
		events: [
			{type: "GreaterRage", trigger: "bulletHitEnemy"},
		],
	},

	{name: "CoronaBeam", sfx: "FireSpell",
		trailColor: 0xffff77, trailLight: 3,
		school: "Elements", manacost: 0, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, nonVolatile: true, onhit:"", power: 12, delay: 0, range: 8, speed: 50, size: 1, damage: "fire",
		trailHit: "", trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1},
	{name: "AllyCrackle", sfx: "Shock", school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 4, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0},
	{allySpell: true, name: "AllyFirebolt", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4.5, delay: 0, range: 50, damage: "fire", speed: 3},
	{allySpell: true, name: "AllyWindBlast", sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"", power: 2.0, time: 2, delay: 0, range: 50, damage: "stun", speed: 1, hitSpin: 1, bulletSpin: 1,
		events: [{type: "Knockback", trigger: "bulletHitEnemy", power: 1.0, dist: 1.0},]},
	{allySpell: true, name: "AllyShadowStrike", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 6, time: 2, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold"},
	{allySpell: true, name: "HeelShadowStrike", sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 2.5, time: 4, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold"},
	{allySpell: true, name: "FlameStrike", sfx: "FireSpell", school: "Element", manacost: 6, components: [], level:1, type:"inert", onhit:"aoe", noTerrainHit: true, power: 3, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "fire"},
	{allySpell: true, name: "ShatterStrike", sfx: "MagicSlash", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 1.5, delay: 1, range: 1.5, time: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "frost"},
	{name: "Ignition", faction: "Rage", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 1.5, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "fire", playerEffect: {name: "Ignition", power: 1, damage: "fire"}},
	{name: "VolcanicStrike", school: "Element", manacost: 0, components: [], level:1, hitsfx: "Lightning", type:"hit", onhit:"instant", noTerrainHit: true, power: 6.0, delay: 1, range: 1.5, size: 5, aoe: 2.99, damageFlags: ["VolcanicDamage"], lifetime: 1, damage: "fire", playerEffect: {name: "Damage"}},
	{allySpell: true, name: "ArcaneStrike", school: "Element", manacost: 0, components: [], level:1, type:"hit", onhit:"instant", noTerrainHit: true, power: 2.5, delay: 1, range: 1.5, size: 3, aoe: 1.5, lifetime: 1, damage: "soul"},
	{enemySpell: true, name: "ShadowStrike", sfx: "MagicSlash", school: "Illusion", manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", power: 6, time: 2, delay: 1, range: 1.5, size: 1, aoe: 0.75, lifetime: 1, damage: "cold", playerEffect: {name: "ShadowStrike", damage: "cold", power: 4, count: 1}},

	{name: "RopeBolt", color: "#ffff00", sfx: "Miss", school: "Conjure", manacost: 1, tags: ["rope"], components: ["Verbal"], level:1, type:"bolt",
		projectileTargeting:true, onhit:"",  power: 2.0, bind: 2.2, delay: 0, range: 50, damage: "chain", bindType: "Rope", speed: 3, playerEffect: {name: "SingleRope"},
		effectTileDurationMod: 10, effectTileAoE: 0.5, effectTile: {
			name: "Ropes",
			duration: 20,
		},},


	{name: "Icicle", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4,
		power: 3, delay: 0, range: 50, damage: "frost", speed: 2, playerEffect: {name: "Damage"},
		bulletColor: 0x92e4e8, bulletLight: 3,
		events: [{type: "ElementalOnSlowOrBindOrDrench", trigger: "bulletHitEnemy", damage: "ice", time: 3, power: 0},]},
	{name: "Boulder", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", block: 8, time: 4,  power: 4, delay: 0, range: 50, damage: "crush", speed: 2, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns
	{name: "BoulderKicked", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4,  power: 4, delay: 0, range: 50, damage: "crush", speed: 2, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns
	{name: "BigBoulder", sfx: "Bones", hitsfx: "HeavySwing", school: "Elements", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, alwaysCollideTags: ["summonedRock"], onhit:"aoe", block: 20, time: 8,  power: 12, aoe: 1.5, size: 3, delay: 0, lifetime: 1, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Damage"}}, // Throws a blast of ice which stuns the target for 4 turns


	{enemySpell: true, name: "Ribbons", color: "#6700ff", noise: 6, sfx: "Struggle", school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, castRange: 3, nonVolatile: true, onhit:"", power: 3, delay: 0, range: 4, speed: 4, size: 1, damage: "inert",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"cast", trailChance: 1.0,
		trailcast: {spell: "SingleRibbon", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "SingleRibbon", color: "#6700ff", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 4, range: 2, size: 1, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], power: 3, damage: "chain", count: 1, noGuard: true}},

	{enemySpell: true, msg: true, name: "AreaElectrify", minRange: 0, landsfx: "Shock", school: "Conjure", specialCD: 10, manacost: 10, components: ["Legs"], level:1, type:"inert", onhit:"cast",
		dot: true, time: 4, delay: 3, range: 2.5, size: 3, aoe: 2.5, lifetime: 1, power: 1, damage: "inert",
		spellcasthit: {spell: "WitchElectrify", target: "onhit", chance: 0.22, directional:false, offset: false}, channel: 2},

	{enemySpell: true, name: "IceDragonBreath", color: "#00ffff", sfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", time: 1, power: 4, delay: 0, range: 4, speed: 50, size: 1, damage: "inert",
		trailPower: 4, trailLifetime: 1, trailLifetimeBonus: 4, trailTime: 3, trailspawnaoe: 1.5, trailDamage:"ice", trail:"lingering", trailChance: 0.3, trailPlayerEffect: {name: "Freeze", time: 3}},
	{enemySpell: true, name: "IceDragonBreathPrepare", color: "#00ffff", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 12, range: 5, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "IceDragonBreath", target: "target", directional:true, offset: false}, channel: 2},

	{enemySpell: true, name: "IceSlow", color: "#00ffff", sfx: "Freeze", school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 1, delay: 0, time: 2, range: 4, speed: 50, size: 1, damage: "inert",
		trailPower: 4, trailLifetime: 2, trailLifetimeBonus: 8, trailTime: 3, trailspawnaoe: 1.5, trailDamage:"ice", trail:"lingering", trailChance: 0.5, trailPlayerEffect: {name: "Chill", time: 3, damage: "ice", power: 1}},
	{enemySpell: true, name: "IceSlowPrepare", color: "#00ffff", minRange: 0, sfx: "MagicSlash", school: "Illusion", manacost: 8, components: ["Arms"], projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:2, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 12, range: 5, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert",
		spellcast: {spell: "IceSlow", target: "target", directional:true, offset: false}, channel: 1},

	{enemySpell: true, name: "FlashBomb", color: "#ff2200", minRange: 0, sfx: "Miss", school: "Illusion", manacost: 3, specialCD: 12, components: ["Verbal"],
		hitColor: 0xffffff, hitLight: 7,
		level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 1, range: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 3}},
	{enemySpell: true, name: "EnemyFlash", color: "#ffffff", minRange: 0, noise: 8, sfx: "FireSpell", school: "Illusion", manacost: 4, components: ["Verbal"], level:1,
		hitColor: 0xffffff, hitLight: 7,
		type:"inert", onhit:"aoe", time: 3, delay: 1, power: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "stun", playerEffect: {name: "Blind", time: 4}},

	{enemySpell: true, name: "SleepGas", color: "#00ff00", sfx: "Miss", school: "Illusion", manacost: 4, specialCD: 24, components: ["Verbal"], level:1, type:"inert", passthrough: true, noTerrainHit: true, buffs: [
		{id: "SleepGas", type: "Sleepiness", power: 1, player: true, enemies: false, tags: ["sleep"], range: 1.5}], onhit:"", time:6, aoe: 1.5, power: 1, delay: 8, range: 4, size: 3, damage: "poison", playerEffect: {name: "DamageNoMsg", damage: "poison", power: 1}}, // Creates a shroud. Enemies within are hard to hit with melee attacks.

	{enemySpell: true, name: "Glue", color: "#ffff00", landsfx: "Freeze", school: "Conjure", manacost: 9, components: ["Legs"], level:1, type:"inert", onhit:"lingering", time: 4, delay: 1, range: 4, size: 3, aoe: 1.5, lifetime: 24, power: 4, lifetimeHitBonus: 76, damage: "glue", playerEffect: {name: "Glue", count: 1, damage: "glue", power: 4, time: 1}}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!

	{enemySpell: true, name: "RedSlime", sfx: "Miss", manacost: 4, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 4, delay: 0, range: 50, damage: "glue", speed: 1.5, playerEffect: {name: "DamageNoMsg", power: 4, damage: "glue"},
		spellcast: {spell: "SummonSingleRedSlime", target: "onhit", directional:false, offset: false, strict: true}},

	{enemySpell: true, name: "AmpuleBlue", sfx: "Miss", manacost: 5, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 4, delay: 0, range: 50, damage: "glue", speed: 1, playerEffect: {name: "AmpuleBlue", damage: "glue", power: 4, count: 1}},

	{enemySpell: true, name: "AmpuleGreen", sfx: "Miss", manacost: 4, specialCD: 15, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		spellcast: {spell: "SleepGas", target: "onhit", directional:false, offset: false}},
	{enemySpell: true, name: "AmpuleYellow", sfx: "Miss", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		spellcast: {spell: "Glue", target: "onhit", directional:false, offset: false}},
	{enemySpell: true, name: "AmpuleRed", sfx: "Miss", manacost: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 1, delay: 0, range: 50, damage: "crush", speed: 1, playerEffect: {name: "Ampule", damage: "inert"},
		spellcast: {spell: "SummonRedSlime", target: "onhit", directional:true, offset: false}},

	{name: "ManyOrbs", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "ZombieOrbMini", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 2.5, offset: false}, channel: 3},
	{enemySpell: true, name: "ZombieOrbMini", sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 1.5, delay: 0, range: 50, damage: "chain", speed: 1,
		playerEffect: {name: "MysticShock", time: 3}},

	{enemySpell: true, name: "ZombieOrb", sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 2, delay: 0, range: 50, damage: "chain", speed: 1,
		playerEffect: {name: "CharmWraps", power: 2, damage: "ice", time: 1}},
	{enemySpell: true, name: "ZombieOrbIce", color: "#00ffff", specialCD: 12, sfx: "MagicSlash", hitsfx: "Freeze", manacost: 2, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, time: 3, onhit:"", power: 3, delay: 0, range: 50, damage: "ice", speed: 1,
		playerEffect: {name: "Freeze", power: 4, damage: "ice", time: 4}},

	{enemySpell: true, name: "RopeEngulf", color: "#ff2200", sfx: "Struggle", effectTileDurationMod: 10, effectTileDensity: 0.33, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 4, minRange: 0, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 6, range: 2, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "RopeEngulf", power: 2}},
	{enemySpell: true, name: "RopeEngulfWeak", color: "#ff2200", sfx: "Struggle", effectTileDurationMod: 10, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 3, range: 3.5, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "RopeEngulfWeak", power: 1, damage: "chain"}},
	{enemySpell: true, name: "Entangle", color: "#88ff88", minRange: 0, sfx: "Struggle", effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Vines",
		duration: 20,
	}, manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 4, range: 6, size: 3, aoe: 1, lifetime: 1, damage: "chain", playerEffect: {name: "VineEngulf", power: 2}},
	{enemySpell: true, name: "Feathers", color: "#ffffff", sfx: "Tickle", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 8, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "tickle", playerEffect: {name: "Damage"}},
	{enemySpell: true, name: "NurseBola", color: "#ff2200", sfx: "Miss", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "NurseBola"}}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "NurseSyringe", color: "#ff00ff", minRange: 1.5, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, speed: 1,
		type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "pain", playerEffect: {name: "NurseSyringe", power: 4, type: "chain", time: 8},},
	{enemySpell: true, name: "RibbonBurst", color: "#ff00ff", sfx: "MagicSlash", manacost: 5, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 4, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], power: 3, damage: "chain", count: 2, noGuard: true}},
	{enemySpell: true, name: "Spores", color: "#6733aa", sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 3, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "Spores", power: 2, damage: "poison"}},
	{enemySpell: true, name: "SporesHappy", color: "#ff00ff", sfx: "FireSpell", noCastMsg: true, selfcast: true, manacost: 3, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 0.5, range: 3, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "SporesHappy", power: 2, damage: "poison", distraction: 10}},
	{enemySpell: true, name: "SporesSick", color: "#55ff55", noCastMsg: true, hitsfx: "DamageWeak", selfcast: true, manacost: 0, components: ["Verbal"], level:1, type:"hit", onhit:"aoe", time: 5, delay: 0, power: 0.5, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "poison", playerEffect: {name: "SporesSick", power: 2, damage: "poison"}},
	{enemySpell: true, name: "SoulCrystalBind", color: "#ff5277", minRange: 0, sfx: "Evil", manacost: 7, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 2, power: 6, range: 6, size: 3, aoe: 1.5, lifetime: 1, damage: "drain", playerEffect: {name: "ObsidianEngulf", count: 1, power: 6, damage: "drain"}},

	{enemySpell: true, name: "MinerBomb", color: "#ff2200", selfcast: true, noise: 5, sfx: "FireSpell", hitsfx: "FireSpell", school: "Conjure", manacost: 5, components: ["Verbal"], level:2,
		effectTileDurationMod: 7, effectTile: {
			name: "Smoke",
			duration: -1,
		}, type:"inert", onhit:"aoe", delay: 5, power: 6, range: 3, size: 3, aoe: 1.5, lifetime: 1, damage: "fire", playerEffect: {name: "HeatBlast", time: 3, damage: "pain", power: 6}},

	{name: "ManyChains", sfx: "MagicSlash", minRange: 0, manacost: 3, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "WitchChainBolt", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1, offset: false}, channel: 3},

	{enemySpell: true, name: "WitchChainBolt", color: "#ffffff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", bind: 12, time: 6,  power: 6, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleChain", time: 1}, effectTileDurationMod: 10, effectTile: {
		name: "Chains",
		duration: 20,
	},}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "MagicChain", color: "#ff00ff", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 6,  power: 6, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "SingleMagicChain", time: 1}, effectTileDurationMod: 10, effectTile: {
		name: "Chains",
		duration: 20,
	},}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "BanditBola",  bindType: "Rope", color: "#ff2200", sfx: "Miss", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 3, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "BanditBola"}}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "WitchRope",  bindType: "Rope", color: "#ff2200", sfx: "Miss", effectTileDurationMod: 10, effectTile: {
		name: "Ropes",
		duration: 20,
	}, manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 2, delay: 0, range: 50, damage: "chain", speed: 3, playerEffect: {name: "SingleRope"}},
	{allySpell: true, name: "PlayerBola",  bindType: "Rope", fastStart: true, color: "#ff2200", noMiscast: true, sfx: "Miss", manacost: 0, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", time: 4, power: 3, bind: 9, delay: 0, range: 50, damage: "chain", speed: 2, playerEffect: {name: "BanditBola", time: 1}}, // Throws a chain which stuns the target for 1 turn
	{enemySpell: true, name: "RestrainingDevice",  bindType: "Metal", color: "#19fac1", sfx: "Miss", manacost: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",  power: 6, delay: 0, range: 50, damage: "chain", speed: 1, playerEffect: {name: "RestrainingDevice", count: 3, time: 3, power: 5, damage: "crush"}},
	{enemySpell: true, name: "WolfCrackle", color: "#8789fd", tags: ["electric", "offense", "aoe"], prerequisite: "Shock", noise: 6, sfx: "Shock", slowStart: true,
		effectTileDurationModTrail: 2, effectTileTrail: {
			name: "Sparks",
			duration: 3,
		},
		school: "Elements", manacost: 4, components: ["Arms"], level:2, type:"bolt", piercing: true, projectileTargeting:true, nonVolatile: true, onhit:"", power: 2.0, delay: 0, time: 1, range: 4, speed: 4, size: 1, damage: "electric",
		trailPower: 0, trailLifetime: 1.1, trailTime: 4, trailDamage:"inert", trail:"lingering", trailChance: 1.0, playerEffect: {name: "Shock", time: 1}},


	{enemySpell: true, name: "MummyBolt", color: "#88ff88", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "fire", speed: 3, playerEffect: {name: "MysticShock", time: 3}},
	{enemySpell: true, name: "RobotBolt", color: "#ff5277", minRange: 0, sfx: "Laser", manacost: 2, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "electric", speed: 2, playerEffect: {name: "RobotShock", time: 2}},
	{enemySpell: true, name: "RubberBullets",  bindType: "Slime", color: "#ffff00", minRange: 2.9, sfx: "Gunfire", manacost: 2, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "glue", speed: 3, playerEffect: {name: "RubberBullets", power: 4, count: 1, damage: "glue"}},
	{enemySpell: true, name: "HeatBolt", color: "#ffff00", sfx: "FireSpell", manacost: 5, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "fire", speed: 2, playerEffect: {name: "HeatBlast", time: 1, damage: "pain", power: 5}},
	{enemySpell: true, noFirstChoice: true, name: "Hairpin", color: "#ffffff", minRange: 2.9, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "pain", speed: 2, playerEffect: {name: "Hairpin", power: 2, damage: "pain", time: 1}},
	{enemySpell: true, name: "PoisonDragonBlast",  bindType: "Vine", color: "#88ff88", sfx: "FireSpell", hitsfx: "Bones", manacost: 5, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "grope", speed: 3, effectTileDurationMod: 10, effectTileAoE: 1.5, effectTileDensity: 0.5, effectTile: {
		name: "Vines",
		duration: 20,
	}, playerEffect: {name: "VineEngulf", power: 2}},
	{enemySpell: true, name: "ElfArrow",  bindType: "Vine", color: "#88ff88", sfx: "Miss", hitsfx: "FireSpell", manacost: 3, components: ["Arms"], level: 1, type:"bolt", projectileTargeting:true, onhit:"", power: 2, delay: 0, range: 50, damage: "fire", speed: 1, playerEffect: {name: "EnchantedArrow", power: 2, count: 1}},
	{enemySpell: true, name: "ShadowOrb", color: "#8833ff", minRange: 2.9, sfx: "MagicSlash", manacost: 5, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 5, damage: "inert", speed: 2, playerEffect: {name: ""},
		spellcast: {spell: "ShadowScythe", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "ShadowScythe", color: "#0000ff", sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:1, type:"inert", noTerrainHit: true, onhit:"aoe", time: 5, delay: 1, power: 6, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "ShadowBind", time: 4}},
	{enemySpell: true, name: "WitchSlime",  bindType: "Slime", color: "#ff00ff", minRange: 0, landsfx: "MagicSlash", manacost: 7, components: ["Legs"], level:2, type:"inert", onhit:"lingering",
		time: 2, delay: 1, range: 4, power: 2, size: 3, aoe: 1, lifetime: 1, lifetimeHitBonus: 9, damage: "glue", playerEffect: {name: "SlimeTrap", time: 3},
		effectTileDurationModLinger: 8, effectTileLinger: {
			name: "Slime",
			duration: 10,
		},}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{enemySpell: true, name: "WitchSlimeBall", bindType: "Slime", color: "#ff00ff", sfx: "FireSpell", manacost: 6, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"",
		time: 2,  power: 2, delay: 0, range: 50, damage: "glue", speed: 1, trailLifetime: 10, trailDamage:"glue", trail:"lingering", trailPower: 2, trailChance: 1.0, playerEffect: {name: "Slime", time: 3},
		effectTileDurationModTrail: 4, effectTileTrail: {
			name: "Slime",
			duration: 4,
		}
	}, // Throws a ball of slime which oozes more slime
	{enemySpell: true, name: "SlimePuddle", bindType: "Slime", color: "#ff00ff", sfx: "FireSpell", manacost: 3, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"lingering",
		time: 2, power: 2, lifetime: 5, lifetimeHitBonus: 5, aoe: 1.5, delay: 0, range: 50, damage: "glue", speed: 1, playerEffect: {name: "SlimeTrap", time: 3},
		effectTileDurationModLinger: 8, effectTileLinger: {
			name: "Slime",
			duration: 10,
		},
	},

	{enemySpell: true, name: "MiniSlime", color: "#ff00ff", sfx: "MagicSlash", landsfx: "MagicSlash", manacost: 1, level:1, type:"bolt", projectileTargeting:true, onhit:"",
		time: 2, power: 2, delay: 0, range: 50, damage: "glue", speed: 1, playerEffect: {name: "MiniSlime", time: 2},
		effectTileDurationMod: 8, effectTile: {
			name: "Slime",
			duration: 10,
		},}, // Throws a ball of slime which oozes more slime
	{name: "ManySlimes", sfx: "MagicSlash", minRange: 0, manacost: 4, projectileTargeting: true, noTargetPlayer: true, CastInWalls: true, level:1, type:"inert", onhit:"aoe", time: 5, delay: 3, power: 3, range: 8, meleeOrigin: true, size: 1, lifetime: 1, damage: "inert", noMiscast: false, castDuringDelay: true, noCastOnHit: true,
		spellcast: {spell: "MiniSlime", target: "target", directional:true, randomDirection: true, noTargetMoveDir: true, spread: 1, offset: false}, channel: 3},

	// Bandit trader
	{enemySpell: true, name: "PoisonDagger", color: "#ff00ff", minRange: 1.5, sfx: "Miss", manacost: 2, castRange: 6, components: ["Arms"], level:1, speed: 1,
		type:"bolt", projectileTargeting:true, onhit:"", power: 4, delay: 0, range: 50, damage: "poison", playerEffect: {name: "PoisonDagger", power: 4, type: "poison", time: 8},},
	{enemySpell: true, name: "LustBomb", color: "#ff5277", minRange: 0, sfx: "Miss", school: "Illusion", manacost: 2, specialCD: 12, components: ["Verbal"], level:1, type:"inert", onhit:"aoe", time: 5, delay: 1, power: 6, range: 4, size: 3, aoe: 1.5, lifetime: 1, damage: "happygas", playerEffect: {name: "LustBomb", damage: "happygas", power: 4.5 }},

	// Fungal spells
	{enemySpell: true, name: "CrystalPuff", color: "#b37bdc", minRange: 0, landsfx: "MagicSlash", manacost: 4, components: ["Arms"], level:1, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "souldrain", playerEffect: {name: "CrystalBind", time: 1}},
	{enemySpell: true, name: "HighBolt", color: "#8888ff", sfx: "MagicSlash", manacost: 3, specialCD: 7, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"",
		power: 6, delay: 0, range: 50, damage: "poison", speed: 1, playerEffect: {name: "Flummox", time: 1, damage: "poison", power: 6}},

	// Shockwitch spells
	{enemySpell: true, name: "WitchElectrify", color: "#8888ff", minRange: 0, landsfx: "Shock", manacost: 5,
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		components: ["Arms"], level:2, type:"inert", onhit:"aoe", power: 3.5, time: 1, delay: 1, range: 4, size: 1, aoe: 0.75, lifetime: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}}, // A series of light shocks incapacitate you
	{enemySpell: true, name: "WitchElectricOrb", color: "#8888ff", sfx: "MagicSlash", manacost: 4, components: ["Arms"], level:2, type:"bolt", projectileTargeting:true, onhit:"", power: 0, delay: 0, range: 5, damage: "electric", speed: 1, playerEffect: {name: ""},
		spellcast: {spell: "WitchElectricBurst", target: "onhit", directional:true, offset: false}},
	{enemySpell: true, name: "WitchElectricBurst", sfx: "Shock", manacost: 4, components: ["Verbal"], level:1, type:"hit",
		effectTileDurationMod: 2, effectTile: {
			name: "Sparks",
			duration: 3,
		},
		noTerrainHit: true, onhit:"aoe", time: 5, delay: 1, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "electric", playerEffect: {name: "Shock", time: 1}},

	// Elemental witch spells
	{enemySpell: true, name: "WitchWaterBall", color: "#4f7db8", tags: ["water", "bolt", "offense", "utility"], sfx: "FireSpell", school: "Elements", manacost: 3, components: ["Arms"], level:1, type:"bolt", projectileTargeting:true, onhit:"buff",
		power: 3.0, delay: 0, range: 50, damage: "acid", speed: 3, playerEffect: {name: "Drench"},
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
	{enemySpell: true, name: "SummonZombies", landsfx: "Bones", specialCD:16, minRange: 0, manacost: 4, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "SummonedZombie", count: 4, strict: true, minRange: 1.5, bound: true, weakBinding: true}], power: 0, time: 16, delay: 1, range: 4, size: 3, aoe: 4.6, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "RopeAttack", hitsfx: "Struggle", manacost: 6, components: ["Verbal"], level:4, type:"hit", onhit:"null", noSprite: true, noSumMsg: true, summon: [
		{name: "LearnedRope", count: 1, chance: 0.5, time: 20, strict: true, bound: true},
		{name: "UnforseenRope", count: 1, chance: 0.5, time: 20, strict: true, bound: true}
	], power: 0, time: 12, delay: 1, range: 8, size: 3, aoe: 10, lifetime: 1, damage: "fire"},
	{enemySpell: true, name: "SummonCrystals", noSprite: true, minRange: 0, landsfx: "Freeze", manacost: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ChaoticCrystal", count: 3, time: 10, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 2.01, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonChainWalls", noSprite: true, minRange: 0, landsfx: "MagicSlash", manacost: 2, specialCD: 12, components: ["Verbal"], level:4, type:"inert", onhit:"summon", summon: [{name: "ChainWall", count: 3, time: 0, bound: true, weakBinding: true}], power: 0, time: 10, delay: 1, range: 40, size: 1, aoe: 3.5, lifetime: 1, damage: "inert"},
	{enemySpell: true, name: "SummonTickleHand", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "TickleHand", count: 3, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonMikoGhosts", noSprite: true, minRange: 0, specialCD: 20, sfx: "MagicSlash", manacost: 4, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "MikoGhost", count: 8, minRange: 8, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 12.9, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonSingleTickleHand", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "TickleHand", count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonEnemyGag", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Gag", count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonCuff", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Cuffs", count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonLock", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 6, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "Lock", count: 1, time: 12, bound: true, weakBinding: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 3, aoe: 2.6, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonRedSlime", noSprite: true, minRange: 0, sfx: "Freeze", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "RedSlime", count: 1, time: 12, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 2.01, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonSingleRedSlime", noSprite: true, minRange: 0, sfx: "Freeze", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "RedSlime", count: 1, time: 12, strict: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonLatexElemental", noSprite: true, sfx: "MagicSlash", manacost: 6, specialCD: 40, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "ElementalLatex", count: 1, time: 40, bound: true}], power: 0, damage: "inert", time: 12, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonWolfDrone", noSprite: true, sfx: "MagicSlash", castCondition: "wolfDrone", manacost: 3, specialCD: 10, components: ["Verbal"], level:1, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "WolfDrone", count: 1, time: 40, bound: true}], power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "SummonTapeDrone", noSprite: true, sfx: "MagicSlash", castCondition: "wolfTapeDrone", manacost: 3, specialCD: 10, components: ["Verbal"], level:1, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "WolfDrone", count: 1, time: 40, bound: true}], power: 0, damage: "inert", time: 34, delay: 1, range: 0.5, size: 1, aoe: 1.5, lifetime: 1, speed: 1, playerEffect: {}},
	{enemySpell: true, name: "MirrorImage", castCondition: "wolfDrone", noSprite: true, minRange: 0, selfcast: true, sfx: "FireSpell", manacost: 12, components: ["Verbal"], level:4, castRange: 50, type:"inert", onhit:"summon", summon: [{name: "MaidforceStalkerImage", count: 1, time: 12}], power: 0, time: 12, delay: 1, range: 2.5, size: 3, aoe: 1.5, lifetime: 1, damage: "inert",
		spellcast: {spell: "DarkShroud", target: "origin", directional:false, offset: false}},

	{enemySpell: true, name: "SummonBookChain", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookChain", bound: true, count: 3, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookNature", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookNature", bound: true, count: 2, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookElectric", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookElectric", bound: true, count: 1, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookIce", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookIce", bound: true, count: 3, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookCelestial", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookCelestial", bound: true, count: 3, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookArcane", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookArcane", bound: true, count: 3, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookForbidden", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 12, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookForbidden", bound: true, count: 3, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},
	{enemySpell: true, name: "SummonBookSlime", noSprite: true, minRange: 0, sfx: "MagicSlash", manacost: 8, components: ["Verbal"], level:4, projectileTargeting:true, castRange: 50, type:"bolt", onhit:"summon", summon: [{name: "BookSlime", bound: true, count: 2, time: 12, strict: true, weakBinding: true}], power: 0, time: 12, delay: 1, range: 0.5, size: 3, aoe: 3, lifetime: 1, speed: 1},

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
	{enemySpell: true, buff: true, heal: true, name: "OrbHeal", minRange: 0, sfx: "MagicSlash", school: "Elements", manacost: 1, components: ["Arms"], mustTarget: true, level:3, type:"hit",
		onhit:"heal", time:2, lifetime: 1, delay: 1, power: 2, aoe: 1.5, range: 8, size: 3, damage: "inert"},
	{enemySpell: true, name: "Earthfield", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "Earthfield", type: "Armor", power: 2.0, player: false, enemies: true, noAlly: true, tags: ["armor", "defense"], range: 1.5}], onhit:"", time:6, aoe: 1.5, power: 0, delay: 8, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Earthrune", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert", buffs: [{id: "Earthfield", type: "Armor", power: 2.0, player: true, enemies: true, onlyAlly: true, tags: ["armor", "defense"], range: 1.5}], onhit:"", time:9, aoe: 1.5, power: 0, delay: 9, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.
	{name: "Icerune", sfx: "MagicSlash", hitsfx: "Freeze", school: "Elements", manacost: 8, components: ["Verbal"], level:2, type:"inert", onhit:"lingering", time: 1, delay: 1, range: 3, size: 3, aoe: 1.5, lifetime: 5, power: 4, lifetimeHitBonus: 3, damage: "ice"}, // Creates a huge pool of slime, slowing enemies that try to enter. If you step in it, you have a chance of getting trapped!
	{name: "Waterrune", selfcast: true, sfx: "Bones", school: "Illusion", manacost: 5, components: ["Verbal"], level:1, type:"inert",
		buffs: [
			{id: "WaterRune", type: "SpellResist", power: 3.0, player: true, enemies: true, onlyAlly: true, tags: ["spellresist", "defense"], range: 1.5},
			{id: "WaterRune2", type: "MoveSpeed", power: -1.0, player: false, enemies: true, noAlly: true, tags: ["slow", "debuff"], range: 1.5},
		], onhit:"", time:9, aoe: 1.5, power: 0, delay: 9, range: 4, size: 3, damage: ""}, // Creates a shroud. Enemies within are hard to hit with melee attacks.

	{enemySpell: true, name: "TrapCharmWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsCharmWeak", tags: ["ribbonRestraints"], count: 4}},
	{enemySpell: true, name: "TrapRibbons", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 4, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsRibbons", tags: ["magicRibbons"], count: 3}},
	{enemySpell: true, name: "TrapShackleWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsShackleWeak", tags: ["shackleRestraints"], count: 2}},
	{enemySpell: true, name: "TrapMummyWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsMummyWeak", tags: ["mummyRestraints"], count: 2}},
	{enemySpell: true, name: "TrapRopeWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsRopeWeak", tags: ["ropeMagicWeak", "clothRestraints"], count: 3}},
	{enemySpell: true, name: "TrapRopeStrong", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsRopeStrong", tags: ["ropeMagicStrong", "ropeAuxiliary", "clothRestraints", "tapeRestraints"], count: 4}},
	{enemySpell: true, name: "TrapLeatherWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsLeatherWeak", tags: ["leatherRestraints", "leatherRestraintsHeavy"], count: 3}},
	{enemySpell: true, name: "TrapCableWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsCableWeak", tags: ["hitechCables"], count: 3}},
	{enemySpell: true, name: "TrapSlimeWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsSlimeWeak", tags: ["slimeRestraints"], count: 2}},
	{enemySpell: true, name: "TrapMagicChainsWeak", sfx: "Struggle", manacost: 4, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "chain", playerEffect: {name: "TrapBindings", text: "KinkyDungeonTrapBindingsMagicChainsWeak", tags: ["chainRestraintsMagic"], count: 3}},
	{enemySpell: true, name: "TrapSleepDart", sfx: "Gunfire", manacost: 1, components: [], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "pain", speed: 2, playerEffect: {name: "TrapSleepDart", power: 5}},
	{enemySpell: true, name: "TrapLustCloud", sfx: "Freeze", manacost: 1, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapLustCloud", damage: "happygas", power: 8 }},
	{enemySpell: true, name: "TrapSCloud", sfx: "Freeze", manacost: 1, components: [], level:1, type:"inert", onhit:"aoe", passthrough: true, noTerrainHit: true, time: 5, delay: 1, power: 3, range: 2, size: 3, aoe: 1.5, lifetime: 1, damage: "glue", playerEffect: {name: "TrapSPCloud", damage: "pain", power: 5.0 }},
	{enemySpell: true, name: "SleepDart", sfx: "Miss", manacost: 1, components: [], level:1, type:"bolt", projectileTargeting:true, onhit:"", power: 4, time: 0, delay: 0, range: 50, damage: "pain", speed: 1, playerEffect: {name: "TrapSleepDart", power: 5}},
];



/** @type {Record<string, KDBondage>} */
let KDSpecialBondage = {
	"Leather": {
		priority: 0,
		color: "#ad2f45",
		struggleRate: 1.0,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
	},
	"Rope": {
		priority: -3,
		color: "#ffae70",
		struggleRate: 2.0,
		powerStruggleBoost: 1.0,
		healthStruggleBoost: 1.0,
	},
	"Metal": {
		priority: 10,
		color: "#aaaaaa",
		struggleRate: 0.5,
		powerStruggleBoost: 0.25,
		healthStruggleBoost: 1.5,
	},
	"Slime": {
		priority: -10,
		color: "#f23db7",
		struggleRate: 1.5,
		powerStruggleBoost: 2.0,
		healthStruggleBoost: 0.75,
	},
	"Vine": {
		priority: -7,
		color: "#00ff00",
		struggleRate: 1.25,
		powerStruggleBoost: 2.0,
		healthStruggleBoost: 1.0,
	},
	"Ice": {
		priority: -15,
		color: "#00ffff",
		struggleRate: 0.6,
		powerStruggleBoost: 3.0,
		healthStruggleBoost: 0.7,
	},
};

/** @type {Record<string, (enemy: entity, target: entity) => boolean>} */
let KDCastConditions = {
	"commandword": (enemy, target) => {
		if (KDEnemyHasFlag(enemy, "commandword")) return false;
		return KDEntityHasBuffTags(target, "commandword");
	},
	"wolfDrone": (enemy, target) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.wolfdrone;}).length > 3) return false;
		return true;
	},
	"wolfTapeDrone": (enemy, target) => {
		if (KDNearbyEnemies(enemy.x, enemy.y, 10).filter((en) => {return en.Enemy?.tags.wolfdrone;}).length > 3) return false;
		return true;
	},
};