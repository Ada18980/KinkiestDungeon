"use strict";
/**
 * @type {Record<mapKey,floorParams>}
 */
const KinkyDungeonMapParams = {
	"grv":{//DungeonName0,-Graveyard-
		"background" : "RainyForstPathNight",
		"openness" : 3, // Openness of rooms
		"density" : 3, // Density of tunnels (inverse of room spawn chance)
		"crackchance" : 0.07,
		"barchance" : 0.2,
		"brightness" : 7,
		"chestcount" : 5,
		"shrinecount" : 11,
		"shrinechance" : 0.75,
		"ghostchance" : 1,
		"doorchance" : 0.67,
		"nodoorchance" : 0.1,
		"doorlockchance" : -0.1,
		"trapchance" : 0.5,
		"grateChance" : 0.4,
		"rubblechance" : 0.4,
		"brickchance" : 0.1,
		"cacheInterval" : 1,
		"forbiddenChance" : 0.7, // If a forbidden gold chance is generated. Otherwise a silver chest will appear
		"forbiddenGreaterChance" : 0.33, // Chance after a forbidden area is generated with a restraint, otherwise its a lesser gold chest
		"torchchance": 0.35,
		"torchchanceboring": 1.0,

		music: {
			"AREA1-GRAVEYARD.ogg": 10,
			"GENERIC-DOLLRACK.ogg": 4,
		},

		tagModifiers: {
			"temple": 0.4,
			"jungle": 0,
			"cavern": 0,
		},

		enemyTags: ["magical", "zombie", "leather", "tape", "ribbon"],

		"setpieces": [
			{Type: "Bedroom", Weight: 3},
			{Type: "Graveyard", Weight: 6},
			{Type: "Altar", Weight: 3},
			{Type: "SmallAltar", Weight: 18},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "QuadCell", Weight: 3},
			{Type: "Storage", Weight: 5},
		],

		"shortcuts": [
			{Level: 1, checkpoint: "tmb", chance: 1.0},
			{Level: 3, checkpoint: "tmb", chance: 1.0},
		],
		"mainpath": [
			{Level: 4, checkpoint: "cat"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapCharmWeak", Level: 0, Power: 1, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLustCloud", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "SummonedSkeleton", strict: true, Level: 0, Power: 4, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "Bandit", strict: true, Level: 0, Power: 1, Weight: 10},
		],

		factionList: ["Bandit", "Apprentice", "Bountyhunter", "Elemental", "Dragon", "Maidforce"],

		"min_width" : 5,
		"max_width" : 7,
		"min_height" : 5,
		"max_height" : 6,
		"defeat_outfit": "Prisoner",
		"shrines": [
			//{Type: "Charms", Weight: 5},
			{Type: "Latex", Weight: 3},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Leather", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 2},
			{Type: "Will", Weight: 7},]


	},
	"cat":{// DungeonName1,-Catacombs-
		"background" : "Dungeon",
		"openness" : 0,
		"density" : 2,
		"crackchance" : 0.09,
		"barchance" : 0.2,
		"brightness" : 4,
		"chestcount" : 7,
		"shrinecount" : 12,
		"chargerchance": 0.5,
		"litchargerchance": 0.5,
		"chargercount": 7,
		"shrinechance" : 0.6,
		"ghostchance" : 0.5,
		"doorchance" : 0.8,
		"nodoorchance" : 0.05,
		"doorlockchance" : -0.05,
		"trapchance" : 0.65,
		"grateChance" : 0.1,
		"rubblechance" : 0.3,
		"brickchance" : 0.4,
		"cacheInterval" : 1,
		"forbiddenChance" : 0.72,
		"forbiddenGreaterChance" : 0.33,
		cageChance: 0.8,
		torchchance: 0.05,
		torchchanceboring: 0.7,

		music: {
			"GENERIC-DOLLRACK.ogg": 10,
			"AREA2-ANCIENTTOMBS.ogg": 2,
		},

		tagModifiers: {
			"narrow": 2,
			"dungeon": 2,
			"open": 0.5,
			"jungle": 0,
			"cavern": 0,
		},

		"setpieces": [
			{Type: "Bedroom", Weight: 2},
			{Type: "Altar", Weight: 3},
			{Type: "QuadCell", Weight: 8},
			{Type: "Storage", Weight: 5},
			{Type: "SmallAltar", Weight: 18},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "ExtraCell", Weight: 10},
		],

		"shortcuts": [
			{Level: 5, checkpoint: "lib", chance: 0.5},
			{Level: 6, checkpoint: "lib", chance: 1.0},
			{Level: 7, checkpoint: "lib", chance: 0.25},
			{Level: 8, checkpoint: "lib", chance: 0.25},
		],
		"mainpath": [
			{Level: 8, checkpoint: "jng"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapShackleWeak", Level: 0, Power: 1, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLustCloud", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "SummonedSkeleton", strict: true, Level: 0, Power: 4, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "HeavySkeleton", extraTag: "Single", strict: true, Level: 0, Power: 2, Weight: 2},
			{Name: "SpawnEnemies", Enemy: "Bandit", strict: true, Level: 0, Power: 2, Weight: 10},
		],

		"min_width" : 5,
		"max_width" : 7,
		"min_height" : 5,
		"max_height" : 6,

		factionList: ["AncientRobot", "Bandit", "Apprentice", "Bountyhunter", "Bast", "Dragon", "Maidforce", "Alchemist"],

		enemyTags: ["skeleton", "metal", "rope", "leather"],
		"defeat_outfit": "Dungeon",
		"shrines": [
			{Type: "Latex", Weight: 3},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Leather", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 2},
			{Type: "Will", Weight: 7},]

	},
	"jng":{//DungeonName2,-Underground Jungle-
		"background" : "DeepForest",
		noReplace: "b",
		"openness" : 1,
		"density" : 1,
		"crackchance" : 0.15,
		"barchance" : 0.05,
		"brightness" : 6,
		"chestcount" : 7,
		"shrinecount" : 13,
		"shrinechance" : 0.4,
		"ghostchance" : 0.5,
		"doorchance" : 0.2,
		"nodoorchance" : 0.7,
		"doorlockchance" : -0.05,
		"trapchance" : 0.4,
		"grateChance" : 0.1,
		"rubblechance" : 0.25,
		"brickchance" : 0.25,
		"cacheInterval" : 1,
		"forbiddenChance" : 0.72,
		"forbiddenGreaterChance" : 0.33,
		torchchance: 0.2,
		torchchanceboring: 0.25,

		tagModifiers: {
			"open": 6,
			"door": 0.5,
			"jungle": 100,
			"cavern": 60,
		},

		music: {
			"AREA5-UNDERGROUNDJUNGLE.ogg": 10,
		},

		"setpieces": [
			{Type: "Altar", Weight: 6},
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "JungleLight", Weight: 8},
			{Type: "Fireflies", Weight: 40},
		],

		"shortcuts": [
			{Level: 9, checkpoint: "cry", chance: 1.0},
			{Level: 10, checkpoint: "cry", chance: 1.0},
		],
		"mainpath": [
			{Level: 12, checkpoint: "tmp"},
		],

		"traps": [
			{Name: "CustomVine", Level: 0, Power: 1, Weight: 30},
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 10},
			{Name: "SpecificSpell", Spell: "TrapSlimeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 10},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 10},
			{Name: "SpecificSpell", Spell: "TrapLustCloud", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "Bandit", strict: true, Level: 0, Power: 3, Weight: 10},
		],

		"min_width" : 5,
		"max_width" : 6,
		"min_height" : 5,
		"max_height" : 5,

		factionList: ["AncientRobot", "Nevermere", "Bandit", "Bountyhunter", "Elf", "Bast", "Dragon", "Maidforce", "Alchemist"],

		enemyTags: ["plant", "jungle", "slime", "earth"],
		"defeat_outfit": "LatexPrisoner",
		"shrines": [
			{Type: "Latex", Weight: 5},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Leather", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 5},
			{Type: "Will", Weight: 5},]
	},
	"tmp":{//DungeonName3,-Lost Temple-
		"background" : "SpookyForest",
		"openness" : 2,
		"density" : 2,
		"crackchance" : 0.05,
		"barchance" : 0.1,
		"brightness" : 3,
		"chestcount" : 7,
		"chargerchance": 0.9,
		"litchargerchance": 0.2,
		"chargercount": 10,
		"shrinecount" : 10,
		"shrinechance" : 0.5,
		"ghostchance" : 0.5,
		"doorchance" : 0.9,
		"nodoorchance" : 0.25,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.8,
		"rubblechance" : 0.35,
		"brickchance" : 0.1,
		"floodchance" : 0.33,
		"gaschance" : 0.5, // Chance for gas to appear on the level
		"gasdensity" : 0.1, // Chance for a passage to be filled with happy gas
		"gastype" : ']', // Gas type
		"cacheInterval" : 1,
		"forbiddenChance" : 0.8,
		"forbiddenGreaterChance" : 0.4,
		torchchance: 0.4,
		torchchanceboring: -0.4,
		torchlitchance: 0.15,
		torchreplace: {
			sprite: "Lantern",
			unlitsprite: "LanternUnlit",
			brightness: 6,
		},

		music: {
			"AREA7-LOSTTEMPLE.ogg": 14,
			"AREA9-BELLOWS.ogg": 2,
		},

		tagModifiers: {
			"jungle": 0,
			"cavern": 0,
			"temple": 3,
		},
		globalTags: {
			"temple": true,
		},

		shadowColor: 0x000703,

		"setpieces": [
			{Type: "Bedroom", Weight: 1},
			{Type: "Altar", Weight: 6},
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "Magicflies", Weight: 12},
		],

		"shortcuts": [
			{Level: 13, checkpoint: "ore", chance: 1.0},
		],
		"mainpath": [
			{Level: 17, checkpoint: "bel"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapSlimeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 10},
			{Name: "SpecificSpell", Spell: "TrapShackleWeak", Level: 0, Power: 3, Weight: 10},
			{Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "GreaterSkeleton", strict: true, Level: 0, Power: 3, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "HeavySkeleton", strict: true, Level: 0, Power: 1, Weight: 10},
		],

		"min_width" : 5,
		"max_width" : 7,
		"min_height" : 5,
		"max_height" : 5,

		factionList: ["Apprentice", "Bandit", "Bountyhunter", "Elemental", "Dragon", "Maidforce", "Alchemist"],

		enemyTags: ["skeleton", "temple", "ghost", "magical"],
		"defeat_outfit": "LatexPrisoner",
		"shrines": [
			{Type: "Latex", Weight: 5},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Leather", Weight: 3},
			{Type: "Metal", Weight: 5},
			{Type: "Rope", Weight: 3},
			{Type: "Will", Weight: 7},],

		"lockmult" : 1.5,
	},
	"tmb":{//DungeonName11,-Ancient Tombs-
		"background" : "EgyptianTomb",
		"openness" : 1,
		"density" : 3,
		"crackchance" : 0.06,
		"barchance" : 0.05,
		"brightness" : 3,
		"chestcount" : 9,
		"chargerchance": 0.8,
		"litchargerchance": 0.65,
		"chargercount": 6,
		"shrinecount" : 13,
		"shrinechance" : 0.5,
		"ghostchance" : 0.5,
		"doorchance" : 0.4,
		"nodoorchance" : 0.25,
		"doorlockchance" : -0.05,
		"trapchance" : 0.65,
		"grateChance" : 0.3,
		"rubblechance" : 0.35,
		"brickchance" : 0.4,
		"cacheInterval" : 1,
		// Side routes have more high-value loot
		"forbiddenChance" : 1.0,
		"forbiddenGreaterChance" : 0.45,
		torchchance: 0.1,
		torchchanceboring: 0.1,

		music: {
			"AREA2-ANCIENTTOMBS.ogg": 10,
		},

		worldGenCode: () => {
			for (let X = 1; X < KinkyDungeonGridWidth - 1; X++) {
				for (let Y = 1; Y < KinkyDungeonGridHeight - 1; Y++) {
					if (KinkyDungeonMapGet(X, Y) == 'X' && KDRandom() < 0.15 + 0.45 * Math.min(1, KinkyDungeonDifficulty/30)) {
						KinkyDungeonMapSet(X, Y, '3');
						DialogueCreateEnemy(X, Y, "MummyCursed");
					}
				}
			}
		},

		"setpieces": [
			{Type: "Altar", Weight: 6},
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "Storage", Weight: 7},
		],

		tagModifiers: {
			"temple": 2,
			"jungle": 0,
			"cavern": 0,
		},
		globalTags: {
			"egyptian": true,
		},

		"shortcuts": [
			{Level: 3, checkpoint: "cry", chance: 1.0},
		],
		"mainpath": [
			{Level: 4, checkpoint: "cat"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapMummyWeak", Level: 0, Power: 1, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLustCloud", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "SummonedSkeleton", strict: true, Level: 0, Power: 5, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "Bandit", strict: true, Level: 0, Power: 3, Weight: 10},
		],

		"min_width" : 5,
		"max_width" : 6,
		"min_height" : 5,
		"max_height" : 7,

		factionList: ["Bast", "Bandit", "AncientRobot", "Elemental", "Dragon"],

		enemyTags: ["mummy", "ghost", "tape", "ribbon", "nature"],
		"defeat_outfit": "Bast",
		"shrines": [
			{Type: "Latex", Weight: 3},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 4},
			{Type: "Leather", Weight: 6},
			{Type: "Will", Weight: 7},]
	},
	"lib":{//DungeonName12,-Magic Library-
		"background" : "MagicSchoolLaboratory",
		noReplace: "Ddb",
		"openness" : 5,
		"density" : 6,
		"crackchance" : 0.0,
		"wallRubblechance" : 0.035,
		"barchance" : 0.1,
		"brightness" : 6,
		"chestcount" : 10,
		"chargerchance": 0.8,
		"litchargerchance": 0.25,
		"chargercount": 6,
		"shrinecount" : 15,
		"shrinechance" : 0.5,
		"ghostchance" : 0.5,
		"doorchance" : 0.0,
		"nodoorchance" : 1.0,
		"doorlockchance" : -0.05,
		"trapchance" : 0.3,
		"grateChance" : 0.7,
		"rubblechance" : 0.3,
		"brickchance" : 0.01,
		"cacheInterval" : 1,
		// Side routes have more high-value loot
		"forbiddenChance" : 1.0,
		"forbiddenGreaterChance" : 0.45,
		torchchance: 0.6,
		torchchanceboring: -0.4,
		torchreplace: {
			sprite: "TorchOrb",
			brightness: 4,
		},

		music: {
			"AREA4-MAGICLIBRARY.ogg": 10,
			"GENERIC-DOLLRACK.ogg": 4,
		},

		"setpieces": [
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
		],

		tagModifiers: {
			"urban": 2,
			"jungle": 0,
			"cavern": 0,
		},

		"shortcuts": [
			{Level: 7, checkpoint: "cat", chance: 1.0},
		],
		"mainpath": [
			{Level: 8, checkpoint: "ore"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapRopeStrong", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "Dressmaker", strict: true, Level: 0, Power: 2, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "Librarian", strict: true, Level: 4, Power: 1, Weight: 5},
		],

		"min_width" : 5,
		"max_width" : 5,
		"min_height" : 5,
		"max_height" : 5,

		factionList: ["Elf", "Bandit", "Apprentice", "Elemental", "Dragon", "Maidforce", "Alchemist"],

		enemyTags: ["book", "witch", "dressmaker", "magical"],
		"defeat_outfit": "Prisoner",
		"shrines": [
			{Type: "Latex", Weight: 3},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 4},
			{Type: "Leather", Weight: 6},
			{Type: "Will", Weight: 7},]
	},
	"cry":{//DungeonName13,-Crystal Cave-
		"background" : "MagicSchoolEscape",
		"openness" : 6,
		"density" : 2,
		"crackchance" : 0.11,
		"barchance" : 0.03,
		"brightness" : 5,
		"chargerchance": 1.0,
		"litchargerchance": 1.0,
		"chargercount": 4,
		"chestcount" : 10,
		"shrinecount" : 13,
		"shrinechance" : 0.8,
		"ghostchance" : 0.5,
		"doorchance" : 0.05,
		"nodoorchance" : 0.5,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.45,
		"brickchance" : 0.2,
		torchchance: 0.3,
		torchchanceboring: 0.1,

		music: {
			"AREA6-CRYSTALCAVE.ogg": 10,
			"AREA9-BELLOWS.ogg": 3,
		},

		shadowColor: 0x080311,

		"gaschance" : 0.33, // Chance for gas to appear on the level
		"gasdensity" : 0.05, // Chance for a passage to be filled with happy gas
		"gastype" : '[', // Gas type

		"floodchance" : 0.25,
		"cacheInterval" : 1,
		// Side routes have more high-value loot
		"forbiddenChance" : 1.0,
		"forbiddenGreaterChance" : 0.45,

		tagModifiers: {
			"open": 4,
			"jungle": 20,
			"cavern": 80,
			"urban": 0.5,
			"door": 0.5,
		},

		"setpieces": [
			{Type: "Altar", Weight: 6},
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
			{Type: "Storage", Weight: 2},
			{Type: "Magicflies", Weight: 40},
		],

		"shortcuts": [
			{Level: 9, checkpoint: "jng", chance: 0.33},
			{Level: 10, checkpoint: "jng", chance: 0.4},
			{Level: 11, checkpoint: "jng", chance: 1.0},
		],
		"mainpath": [
			{Level: 4, checkpoint: "cry"},
			{Level: 6, checkpoint: "cat"},
			{Level: 12, checkpoint: "ore"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapRopeWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLeatherWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapLustCloud", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "Bandit", strict: true, Level: 0, Power: 3, Weight: 10},
		],

		"min_width" : 4,
		"max_width" : 5,
		"min_height" : 5,
		"max_height" : 7,

		factionList: ["Nevermere", "Elf", "Bandit", "Apprentice", "Bountyhunter", "Elemental", "Dragon", "Maidforce", "Alchemist"],

		enemyTags: ["mushroom", "slimeBonus", "crystalline", "earth", "slime", "shadow"],
		"defeat_outfit": "Prisoner",
		"shrines": [
			{Type: "Latex", Weight: 3},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 4},
			{Type: "Leather", Weight: 6},
			{Type: "Will", Weight: 7},]
	},

	"ore":{//DungeonName8,-Orrery-
		"background" : "SpookyForest",
		"openness" : 2,
		"density" : 2,
		"crackchance" : 0.05,
		"barchance" : 0.1,
		"brightness" : 1,
		"chestcount" : 7,
		"chargerchance": 0.9,
		"litchargerchance": 0.2,
		"chargercount": 10,
		"shrinecount" : 10,
		"shrinechance" : 0.5,
		"ghostchance" : 0.7,
		"doorchance" : 0.9,
		"nodoorchance" : 0.25,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.8,
		"rubblechance" : 0.35,
		"brickchance" : 0.1,
		"cacheInterval" : 1,
		"forbiddenChance" : 1.0,
		"forbiddenGreaterChance" : 0.45,
		torchlitchance: 0.2,
		torchchance: 1.0,
		torchchanceboring: -0.4,
		torchreplace: {
			sprite: "IllusOrb",
			unlitsprite: "IllusOrbDead",
			brightness: 2,
		},

		music: {
			"AREA8-ORRERY.ogg": 30,
		},

		factionList: ["Apprentice", "Elf", "Bandit", "Dressmaker", "Bountyhunter", "Elemental", "Dragon", "Maidforce", "Alchemist"],

		tagModifiers: {
			"jungle": 0,
			"cavern": 0,
			"temple": 3,
			"urban": 0.4,
			"dungeon": 0,
		},
		globalTags: {
			"temple": true,
			"orrery": true,
		},

		shadowColor: 0x000703,

		"setpieces": [
			{Type: "Bedroom", Weight: 1},
			{Type: "Altar", Weight: 6},
			{Type: "SmallAltar", Weight: 20},
			{Type: "GuardedChest", Weight: 30},
			{Type: "LargeGuardedChest", Weight: 20},
		],

		"shortcuts": [
			{Level: 14, checkpoint: "tmp", chance: 1.0},
		],
		"mainpath": [
			{Level: 17, checkpoint: "bel"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapRopeHoly", Level: 0, Power: 3, Weight: 30},
			{Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", Enemy: "ShadowHand", strict: true, Level: 0, Power: 3, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "TickleTerror", strict: true, Level: 0, Power: 1, Weight: 10},
			{Name: "SpawnEnemies", Enemy: "HugHorror", strict: true, Level: 0, Power: 1, Weight: 10},
		],

		"min_width" : 5,
		"max_width" : 7,
		"min_height" : 5,
		"max_height" : 7,

		enemyTags: ["shadowcreature", "magical", "shadow", "elemental", "angel"],
		"defeat_outfit": "LatexPrisoner",
		"shrines": [
			{Type: "Latex", Weight: 5},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 10},
			{Type: "Leather", Weight: 5},
			{Type: "Metal", Weight: 3},
			{Type: "Rope", Weight: 5},
			{Type: "Will", Weight: 7},],

		"lockmult" : 1.6,
	},

	"bel":{//DungeonName8,-Orrery-
		"background" : "SpookyForest",
		"openness" : 1,
		"density" : 9,
		"crackchance" : 0.12,
		"barchance" : 0.1,
		"brightness" : 1,
		"chestcount" : 7,
		"chargerchance": 0.8,
		"litchargerchance": 0.2,
		"chargercount": 0,
		"shrinecount" : 10,
		"shrinechance" : 0.5,
		"ghostchance" : 0.7,
		"doorchance" : 0.9,
		"nodoorchance" : 0.25,
		"doorlockchance" : -0.05,
		"trapchance" : 0.1,
		"grateChance" : 0.8,
		"rubblechance" : 0.35,
		"brickchance" : 0.0,
		"cacheInterval" : 1,
		"forbiddenChance" : 1.0,
		"forbiddenGreaterChance" : 0.45,
		torchlitchance: 0.45,
		torchchance: 1.0,
		torchchanceboring: -0.7,
		torchreplace: {
			sprite: "Lantern",
			unlitsprite: "LanternUnlit",
			brightness: 5,
		},

		music: {
			"AREA9-BELLOWS.ogg": 30,
		},

		tagModifiers: {
			"jungle": 0,
			"cavern": 0,
			"temple": 0.0,
			"urban": 0,
			"industrial": 2.0,
			"dungeon": 0,
			"factory": 2.0,
			"bellows": 3.0,
		},
		globalTags: {
			"factory": true,
			"bellows": true,
			"industrial": true,
		},

		shadowColor: 0x000703,

		"setpieces": [
			{Type: "Bedroom", Weight: 1},
			{Type: "LargeGuardedChest", Weight: 20},
		],

		"shortcuts": [
		],
		"mainpath": [
			{Level: 21, checkpoint: "grv"},
		],

		"traps": [
			{Name: "CustomSleepDart", Level: 0, Power: 1, Weight: 20},
			{Name: "SpecificSpell", Spell: "TrapMagicChainsWeak", Level: 0, Power: 3, Weight: 30},
			{Name: "SpawnEnemies", strict: true, Enemy: "Drone", Level: 0, Power: 3, Weight: 100},
			{Name: "SpawnEnemies", strict: true, Enemy: "CaptureBot", Level: 0, Power: 2, Weight: 100},
		],

		"min_width" : 6,
		"max_width" : 8,
		"min_height" : 4,
		"max_height" : 4,

		factionList: ["Nevermere", "AncientRobot", "Bandit", "Dressmaker", "Bountyhunter", "Maidforce", "Alchemist"],

		enemyTags: ["dollsmith", "dollrare", "oldrobot", "oldrobotturret", "tech", "metal", "electric", "fire"],
		"defeat_outfit": "DollSuit",
		"shrines": [
			{Type: "Latex", Weight: 5},
			{Type: "Commerce", Weight: 0},
			{Type: "Elements", Weight: 5},
			{Type: "Conjure", Weight: 5},
			{Type: "Illusion", Weight: 5},
			{Type: "Leather", Weight: 7},
			{Type: "Metal", Weight: 10},
			{Type: "Rope", Weight: 3},
			{Type: "Will", Weight: 7},],

		"lockmult" : 2.0,
	},
};


/*"fun":{//DungeonName4,-Fungal Caverns-
		"openness" : 4,
		"density" : 4,
		"crackchance" : 0.15,
		"barchance" : 0.15,
		"brightness" : 7,
		"chestcount" : 5,
		"shrinecount" : 10,
		"shrinechance" : 0.8,
		"ghostchance" : 0.5,
		"doorchance" : 0.05,
		"nodoorchance" : 0.5,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.9,
		"brickchance" : 0.2,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 15,
		"max_width" : 25,
		"min_height" : 15,
		"max_height" : 25,
	},
	"blw":{//DungeonName5,-The Bellows-
		"openness" : 1,
		"density" : 1,
		"crackchance" : 0.05,
		"barchance" : 0.03,
		"brightness" : 8,
		"chestcount" : 6,
		"shrinecount" : 8,
		"shrinechance" : 0.75,
		"ghostchance" : 0.5,
		"doorchance" : 0.67,
		"nodoorchance" : 0.1,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.7,
		"brickchance" : 0.3,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 25,
		"max_width" : 51,
		"min_height" : 13,
		"max_height" : 15,

		"lockmult" : 2.0,
	},
	"des":{//DungeonName6,-Underground Desert-
		"openness" : 4,
		"density" : 2,
		"crackchance" : 0.13,
		"barchance" : 0.03,
		"brightness" : 5,
		"chestcount" : 4,
		"shrinecount" : 12,
		"shrinechance" : 0.5,
		"ghostchance" : 0.5,
		"doorchance" : 0.0,
		"nodoorchance" : 0.3,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.3,
		"brickchance" : 0.3,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 25,
		"max_width" : 31,
		"min_height" : 17,
		"max_height" : 25,
	},
	"ice":{//DungeonName7,-Kingdom of Ice-
		"openness" : 2,
		"density" : 1,
		"crackchance" : 0.12,
		"barchance" : 0.03,
		"brightness" : 4,
		"chestcount" : 4,
		"shrinecount" : 10,
		"shrinechance" : 0.8,
		"ghostchance" : 0.5,
		"doorchance" : 0.8,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"nodoorchance" : 0.2,
		"rubblechance" : 0.5,
		"brickchance" : 0.7,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 25,
		"max_width" : 31,
		"min_height" : 13,
		"max_height" : 19,

		"lockmult" : 2.0,
	},
	"mar":{//DungeonName8,-Marble Halls-
		"openness" : 4,
		"density" : 1,
		"crackchance" : 0.12,
		"barchance" : 0.03,
		"brightness" : 8,
		"chestcount" : 8,
		"shrinecount" : 8,
		"shrinechance" : 0.75,
		"ghostchance" : 0.5,
		"doorchance" : 1.0,
		"nodoorchance" : 0.0,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.7,
		"brickchance" : 0.5,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 15,
		"max_width" : 21,
		"min_height" : 25,
		"max_height" : 37,

		"lockmult" : 1.5,
	},
	"lab":{//DungeonName9,-Ancient Laboratory-
		"openness" : 2,
		"density" : 1,
		"crackchance" : 0.08,
		"barchance" : 0.03,
		"brightness" : 4,
		"chestcount" : 10,
		"shrinecount" : 6,
		"shrinechance" : 0.75,
		"ghostchance" : 0.5,
		"doorchance" : 1.0,
		"nodoorchance" : 0.0,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 0.6,
		"brickchance" : 0.9,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 25,
		"max_width" : 31,
		"min_height" : 13,
		"max_height" : 19,

		"lockmult" : 4.0,
	},
	"man":{//DungeonName10,-The Mansion-
		"openness" : 10,
		"density" : 1,
		"crackchance" : 0.05,
		"barchance" : 0.03,
		"brightness" : 100,
		"chestcount" : 0,
		"shrinecount" : 0,
		"shrinechance" : 0.25,
		"ghostchance" : 0.5,
		"doorchance" : 1.0,
		"nodoorchance" : 0.0,
		"doorlockchance" : -0.05,
		"trapchance" : 0.5,
		"grateChance" : 0.7,
		"rubblechance" : 1.0,
		"brickchance" : 0.7,

		"traps": [
			{Name: "SpawnEnemies", strict: true, Enemy: "SummonedSkeleton", Level: 0, Power: 4, Weight: 100},
		],

		"min_width" : 31,
		"max_width" : 31,
		"min_height" : 19,
		"max_height" : 19,

		"lockmult" : 0.0,
	},*/