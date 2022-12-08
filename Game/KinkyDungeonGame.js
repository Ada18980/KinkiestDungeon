"use strict";

let KinkyDungeonGagMumbleChance = 0.02;
let KinkyDungeonGagMumbleChancePerRestraint = 0.0025;

let MiniGameKinkyDungeonCheckpoint = "grv";
let MiniGameKinkyDungeonShortcut = "grv";
let MiniGameKinkyDungeonMainPath = "grv";
let MiniGameKinkyDungeonLevel = -1;
/**
 * @type Record<string, string>
 */
let KinkyDungeonMapIndex = {};

/**
 * @type {number[]}
 */
let KinkyDungeonBoringness = [];

let KinkyDungeonVisionGrid = [];
let KinkyDungeonColorGrid = [];
let KinkyDungeonShadowGrid = [];
let KinkyDungeonBrightnessGrid = [];
let KinkyDungeonFogGrid = [];
let KinkyDungeonUpdateLightGrid = true;
let KinkyDungeonGrid = "";
let KinkyDungeonGrid_Last = "";
let KinkyDungeonGridSize = 50;
let KinkyDungeonGridWidth = 31;
let KinkyDungeonGridHeight = 19;

let KinkyDungeonGridSizeDisplay = 72;
let KinkyDungeonGridWidthDisplay = 2000/KinkyDungeonGridSizeDisplay;//17;
let KinkyDungeonGridHeightDisplay = 1000/KinkyDungeonGridSizeDisplay;//9;

let KinkyDungeonMoveDirection = KinkyDungeonGetDirection(0, 0);

let KinkyDungeonTextMessagePriority = 0;
let KinkyDungeonTextMessage = "";
let KinkyDungeonTextMessageNoPush = false;
let KinkyDungeonTextMessageTime = 0;
let KinkyDungeonTextMessageColor = "white";

let KinkyDungeonActionMessagePriority = 0;
let KinkyDungeonActionMessage = "";
let KinkyDungeonActionMessageNoPush = false;
let KinkyDungeonActionMessageTime = 0;
let KinkyDungeonActionMessageColor = "white";

let KinkyDungeonSpriteSize = 72;

let KinkyDungeonCanvas = document.createElement("canvas");
let KinkyDungeonContext = null;
let KinkyDungeonCanvasFow = document.createElement("canvas");
let KinkyDungeonContextFow = null;
let KinkyDungeonCanvasPlayer = document.createElement("canvas");
let KinkyDungeonContextPlayer = null;

/** @type {entity[]} */
let KinkyDungeonEntities = [];
let KinkyDungeonTerrain = [];

let KinkyDungeonPOI = [];

let KinkyDungeonMapBrightness = 5;

let KinkyDungeonGroundTiles = "023w][?/";
let KinkyDungeonWallTiles = "14";
let KinkyDungeonMovableTilesEnemy = KinkyDungeonGroundTiles + "HBlSsRrdTgL"; // Objects which can be moved into: floors, debris, open doors, staircases
let KinkyDungeonMovableTilesSmartEnemy = "D" + KinkyDungeonMovableTilesEnemy; //Smart enemies can open doors as well
let KinkyDungeonMovableTiles = "OPCAMG$Y+=-F" + KinkyDungeonMovableTilesSmartEnemy; // Player can open chests, orbs, shrines, chargers
let KinkyDungeonTransparentObjects = KinkyDungeonMovableTiles.replace("D", "").replace("g", "").replace("Y", "") + "OoAaMmCcBlb+=-FX"; // Light does not pass thru doors or grates or shelves
let KinkyDungeonTransparentMovableObjects = KinkyDungeonMovableTiles.replace("D", "").replace("g", ""); // Light does not pass thru doors or grates

let KDOpenDoorTiles = ["DoorOpen", "DoorVertContOpen", "DoorVertOpen"];

let KDRandomDisallowedNeighbors = "AasSHcCHDdOoPp+F"; // tiles that can't be neighboring a randomly selected point
let KDTrappableNeighbors = "DA+-F"; // tiles that might have traps bordering them with a small chance
let KDTrappableNeighborsLikely = "COP="; // tiles that might have traps bordering them with a big chance

/**
 * @type {Record<string, {x: number, y: number, tags?:string[]}>}
 */
let KinkyDungeonRandomPathablePoints = {};
/** @type {Record<string, any>} */
let KinkyDungeonTiles = {};
/** @type {Record<string, Record<string, effectTile>>} */
let KinkyDungeonEffectTiles = {};
/** @type {Record<string, any>} */
let KinkyDungeonTilesMemory = {};
/** @type {Record<string, any>} */
let KinkyDungeonTilesSkin = {};



let KinkyDungeonTargetTile = null;
let KinkyDungeonTargetTileLocation = "";

const KinkyDungeonBaseLockChance = 0.1;
const KinkyDungeonScalingLockChance = 0.1; // Lock chance per 6 floors. Does not affect the guaranteed locked chest each level
const KinkyDungeonBlueLockChance = -0.1;
const KinkyDungeonBlueLockChanceScaling = 0.015; // per floor
const KinkyDungeonBlueLockChanceScalingMax = 0.4;
const KinkyDungeonGoldLockChance = -0.25; // Chance that a blue lock is replaced with a gold lock
const KinkyDungeonGoldLockChanceScaling = 0.015; // per floor
const KinkyDungeonGoldLockChanceScalingMax = 0.25;
const KinkyDungeonPurpleLockChance = 0; // Chance that a red lock is replaced with a purple lock
const KinkyDungeonPurpleLockChanceScaling = 0.02; // per floor
const KinkyDungeonPurpleLockChanceScalingMax = 0.6;

let KinkyDungeonCurrentMaxEnemies = 1;

let KinkyDungeonNextDataSendTime = 0;
const KinkyDungeonNextDataSendTimeDelay = 500; // Send on moves every 0.5 second
let KinkyDungeonNextDataSendTimeDelayPing = 5000; // temporary ping
let KinkyDungeonNextDataSendStatsTimeDelay = 3000; // Send stats every 3s to save bandwidth
let KinkyDungeonNextDataSendStatsTime = 0;

let KinkyDungeonNextDataLastTimeReceived = 0;
let KinkyDungeonNextDataLastTimeReceivedTimeout = 15000; // Clear data if more than 15 seconds of no data received

let KinkyDungeonLastMoveDirection = null;
let KinkyDungeonTargetingSpell = null;

/**
 * Item to decrement by 1 when spell is cast
 */
let KinkyDungeonTargetingSpellItem = null;
let KinkyDungeonTargetingSpellWeapon = null;

/**
 * Game stops when you reach this level
 */
let KinkyDungeonMaxLevel = 20;

let KinkyDungeonLastMoveTimer = 0;
let KinkyDungeonLastMoveTimerStart = 0;
let KinkyDungeonLastMoveTimerCooldown = 175;
let KinkyDungeonLastMoveTimerCooldownStart = 50;

let KinkyDungeonPatrolPoints = [];
let KinkyDungeonStartPosition = {x: 1, y: 1};
let KinkyDungeonEndPosition = {x: 1, y: 1};
let KinkyDungeonShortcutPosition = null;
let KinkyDungeonJailLeash = 3;
let KinkyDungeonJailLeashX = 3;

let KinkyDungeonSaveInterval = 10;

let KinkyDungeonSFX = [];

/**
 *
 * @param {string} location
 * @param {Record<string, effectTile>} value
 */
function KinkyDungeonEffectTilesSet(location, value) {
	KinkyDungeonEffectTiles[location] = value;
}
/**
 *
 * @param {string} location
 * @returns {Record<string, effectTile>}
 */
function KinkyDungeonEffectTilesGet(location) {
	return KinkyDungeonEffectTiles[location];
}


/**
 *
 * @param {string} location
 * @param {any} value
 */
function KinkyDungeonTilesSet(location, value) {
	KinkyDungeonTiles[location] = value;
}
/**
 *
 * @param {string} location
 * @returns {any}
 */
function KinkyDungeonTilesGet(location) {
	return KinkyDungeonTiles[location];
}

/**
 *
 * @param {string} location
 */
function KinkyDungeonTilesDelete(location) {
	delete KinkyDungeonTiles[location];
}

function KDAlreadyOpened(x, y) {
	if (KDGameData.AlreadyOpened) {
		for (let ao of KDGameData.AlreadyOpened) {
			if (ao.x == x && ao.y == y) {
				return true;
			}
		}
	}
	return false;
}

function KinkyDungeonPlaySound(src, entity) {
	if (KinkyDungeonSound && !KinkyDungeonSFX.includes(src)) {
		if (!entity || KinkyDungeonVisionGet(entity.x, entity.y) > 0) {
			AudioPlayInstantSoundKD(src);
			KinkyDungeonSFX.push(src);
		}
	}
}

function KinkyDungeonSetCheckPoint(Checkpoint, AutoSave, suppressCheckPoint) {
	if (Checkpoint != undefined) MiniGameKinkyDungeonCheckpoint = Checkpoint;
	else if (Math.floor(MiniGameKinkyDungeonLevel / 10) == MiniGameKinkyDungeonLevel / 10)
		MiniGameKinkyDungeonCheckpoint = KDDefaultJourney[Math.min(KDDefaultJourney.length - 1, Math.floor((MiniGameKinkyDungeonLevel) / KDLevelsPerCheckpoint))];
}

function KinkyDungeonNewGamePlus() {
	KDInitializeJourney(KDGameData.Journey);

	MiniGameKinkyDungeonLevel = 1;
	KinkyDungeonSetCheckPoint("grv", true);
	KinkyDungeonCreateMap(KinkyDungeonMapParams.grv, 1);
	KinkyDungeonNewGame += 1;

	for (let t of KDResertNGTags) {
		if (KinkyDungeonFlags.has(t))
			KinkyDungeonFlags.delete(t);
	}
}

function KDResetData(Data) {
	if (!Data) Data = KDGameDataBase;
	KDGameData = JSON.parse(JSON.stringify( Data));
}
function KDResetEventData(Data) {
	if (!Data) Data = KDEventDataBase;
	KDEventData = JSON.parse(JSON.stringify( Data));
}

function KinkyDungeonInitialize(Level, Load) {
	KDGameData.RespawnQueue = [];
	KDInitFactions(true);
	CharacterReleaseTotal(KinkyDungeonPlayer);
	KDResetData();
	KDResetEventData();
	//Object.assign(KDGameData, KDGameDataBase);

	KinkyDungeonRefreshRestraintsCache();
	KinkyDungeonRefreshEnemiesCache();
	KinkyDungeonRefreshOutfitCache();
	//KinkyDungeonRefreshEnemyCache();
	KinkyDungeonFlags = new Map();

	KinkyDungeonDressSet();
	if (KinkyDungeonConfigAppearance) {
		localStorage.setItem("kinkydungeonappearance", LZString.compressToBase64(CharacterAppearanceStringify(KinkyDungeonPlayer)));
		KinkyDungeonConfigAppearance = false;
	}
	CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayer));
	KinkyDungeonDressPlayer();
	KinkyDungeonDrawState = "Game";

	KinkyDungeonMapIndex = {};
	for (let map of KDDefaultJourney) {
		KinkyDungeonMapIndex[map] = map;
	}
	for (let map of KDDefaultAlt) {
		KinkyDungeonMapIndex[map] = map;
	}

	for (let e of KinkyDungeonEntities) {
		KDClearItems(e);
	}
	KinkyDungeonEntities = [];
	KDUpdateEnemyCache = true;
	KinkyDungeonBullets = [];

	KinkyDungeonTextMessage = "";
	KinkyDungeonActionMessage = "";
	MiniGameKinkyDungeonLevel = Level;
	KinkyDungeonSetCheckPoint();

	KDInitCanvas();

	KinkyDungeonDefaultStats(Load);

	// Set up the first level
	//KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[0]], 0);
}

function KDInitCanvas() {
	KinkyDungeonContextPlayer = KinkyDungeonCanvasPlayer.getContext("2d");
	KinkyDungeonCanvasPlayer.width = KinkyDungeonGridSizeDisplay;
	KinkyDungeonCanvasPlayer.height = KinkyDungeonGridSizeDisplay;

	KinkyDungeonContext = KinkyDungeonCanvas.getContext("2d");
	KinkyDungeonCanvas.height = KinkyDungeonCanvasPlayer.height*KinkyDungeonGridHeightDisplay;

	KinkyDungeonContextFow = KinkyDungeonCanvasFow.getContext("2d");
	KinkyDungeonCanvasFow.width = KinkyDungeonCanvas.width;
	KinkyDungeonCanvasFow.height = KinkyDungeonCanvas.height;
}

function KDCreateBoringness() {
	let start = performance.now();
	// Initialize boringness array
	KinkyDungeonBoringness = [];
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++)
			KinkyDungeonBoringness.push(0); // 0 = no boringness
	}

	// First we find shortest path to exit
	let path = KinkyDungeonFindPath(KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false);

	let pathLength = path ? path.length : 100;

	// Now we find the path to the start/end of every INDIVIDUAL tile
	// Boringness = delta between (startLength + endLength) and (pathLength)
	for (let X = 0; X < KinkyDungeonGridWidth; X++) {
		for (let Y = 0; Y < KinkyDungeonGridHeight; Y++) {
			if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))) {
				let startLength = KinkyDungeonFindPath(X, Y, KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false);
				if (startLength) {
					let endLength = KinkyDungeonFindPath(X, Y, KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false);
					if (endLength) {
						let delta = Math.abs((startLength.length + endLength.length) - pathLength);
						KinkyDungeonBoringSet(X, Y, delta);
					}
				}
			}
		}
	}

	console.log("Time to create Boring" + (performance.now() - start));
}

// Starts the the game at a specified level
/**
 *
 * @param {floorParams} MapParams
 * @param {number} Floor
 * @param {boolean} [testPlacement]
 * @param {boolean} [seed]
 */
function KinkyDungeonCreateMap(MapParams, Floor, testPlacement, seed) {
	for (let iterations = 0; iterations < 100; iterations++) {
		KDPathfindingCacheFails = 0;
		KDPathfindingCacheHits = 0;
		KDPathCache = new Map();
		KDThoughtBubbles = new Map();
		KinkyDungeonSpecialAreas = [];
		KinkyDungeonShortcutPosition = null;
		KinkyDungeonRescued = {};
		KDGameData.ChampionCurrent = 0;
		KinkyDungeonAid = {};
		KDGameData.KinkyDungeonPenance = false;
		KDRestraintsCache = new Map();
		KDEnemiesCache = new Map();
		KDEnemyCache = new Map();
		KinkyDungeonGrid = "";
		KinkyDungeonTiles = {};
		KinkyDungeonTilesSkin = {};
		KinkyDungeonEffectTiles = {};
		KinkyDungeonTargetTile = null;
		KinkyDungeonTargetTileLocation = "";
		KinkyDungeonGroundItems = []; // Clear items on the ground
		KinkyDungeonBullets = []; // Clear all bullets
		KDGameData.OfferFatigue = 0;
		KDGameData.KeyringLocations = [];

		KinkyDungeonEndPosition = null;

		KinkyDungeonPatrolPoints = [];

		if (KDGameData.JailKey == undefined) {
			KDGameData.JailKey = false;
		}

		KDGameData.JailPoints = [];

		KDGameData.RescueFlag = false;

		KinkyDungeonTotalSleepTurns = 0;

		KinkyDungeonFastMovePath = [];

		// These are generated before the seed as they depend on the player's restraints and rep
		KinkyDungeonGenerateShop(MiniGameKinkyDungeonLevel);
		let shrinefilter = KinkyDungeonGetMapShrines(MapParams.shrines);
		let traptypes = MapParams.traps.concat(KinkyDungeonGetGoddessTrapTypes());

		if (iterations == 0) {
			//console.log(seed);
			if (!seed) {
				KDGameData.AlreadyOpened = [];
				KDrandomizeSeed(true);
				KDGameData.LastMapSeed = KinkyDungeonSeed;
				// Reset the chase if this is a new floor
				if (KDGameData.PrisonerState == "chase") {
					KDGameData.PrisonerState = "";
				}
			}
			console.log("Map Seed: " + KinkyDungeonSeed);
			KDsetSeed(KinkyDungeonSeed);
			//console.log(KDRandom());
		}

		let mapMod = null;
		if (KDGameData.MapMod) {
			mapMod = KDMapMods[KDGameData.MapMod];
		}


		// Create enemies first so we can spawn them in the set pieces if needed
		let allies = KinkyDungeonGetAllies();
		KinkyDungeonEntities = allies;
		KDUpdateEnemyCache = true;

		let altRoom = KDGameData.RoomType;
		let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);

		if (altType && altType.nokeys) {
			KDGameData.KeysNeeded = false;
		} else KDGameData.KeysNeeded = true;

		let height = MapParams.min_height * 2 + 2*Math.floor(0.5*KDRandom() * (MapParams.max_height * 2 - MapParams.min_height * 2));
		let width = MapParams.min_width * 2 + 2*Math.floor(0.5*KDRandom() * (MapParams.max_width * 2 - MapParams.min_width * 2));

		// They have to be odd for the maze generator to work
		height += 1 - height % 2;
		width += 1 - width % 2;

		KDStageBossGenerated = true;
		let bossRules = false;
		if (altType) {
			bossRules = altType.bossroom;
			if (bossRules) {
				KinkyDungeonSetFlag("BossDialogue" + altType.name, 0);
				KDStageBossGenerated = false;
			}
			height = altType.height;
			width = altType.width;
		}
		KinkyDungeonSetFlag("BossUnlocked", 0);
		if (altType && !bossRules && altType.nokeys) {
			KinkyDungeonSetFlag("BossUnlocked", -1);
		}

		KinkyDungeonCanvas.width = KinkyDungeonCanvasPlayer.width*KinkyDungeonGridWidthDisplay;
		KinkyDungeonGridHeight = height;
		KinkyDungeonGridWidth = width;


		// Generate the grid
		for (let X = 0; X < height; X++) {
			for (let Y = 0; Y < width; Y++)
				KinkyDungeonGrid = KinkyDungeonGrid + '1';
			KinkyDungeonGrid = KinkyDungeonGrid + '\n';
		}

		// We only rerender the map when the grid changes
		KinkyDungeonGrid_Last = "";
		KinkyDungeonUpdateLightGrid = true;

		// Setup variables
		let startpos = 1 + 2*Math.floor(KDRandom()*0.5 * (height - 2));
		if (startpos < 3) startpos = 3; // ...
		if (startpos % 2 != 1) startpos += 1; // startpos MUST be odd


		//console.log(KDRandom());
		// Use primm algorithm with modification to spawn random rooms in the maze
		let openness = MapParams.openness;
		let density = MapParams.density;
		let hallopenness = MapParams.hallopenness ? MapParams.hallopenness : MapParams.openness;
		let chargerchance = MapParams.chargerchance ? MapParams.chargerchance : 0.75;
		let litchargerchance = MapParams.litchargerchance ? MapParams.litchargerchance : 0.1;
		let chargercount = MapParams.chargercount ? MapParams.chargercount : 4;
		let crackchance = MapParams.crackchance;
		let barchance = MapParams.barchance;
		let treasurechance = 1.0; // Chance for an extra locked chest
		let treasurecount = MapParams.chestcount; // Max treasure chest count
		//if (KDGameData.KinkyDungeonSpawnJailers > 0) treasurecount = 0;
		let shrinechance = MapParams.shrinechance; // Chance for an extra shrine
		let ghostchance = MapParams.ghostchance; // Chance for a ghost
		let manaChance = MapParams.manaChance ? MapParams.manaChance : 0.3;
		let shrinecount = MapParams.shrinecount; // Max treasure chest count
		let rubblechance = MapParams.rubblechance; // Chance of lootable rubble
		if (KinkyDungeonStatsChoice.get("Pristine")) rubblechance = 0;
		//if (KinkyDungeonGoddessRep.Prisoner && KDGameData.KinkyDungeonSpawnJailers > 0) doorlockchance = doorlockchance + (KDGameData.KinkyDungeonSpawnJailers / KDGameData.KinkyDungeonSpawnJailersMax) * (1.0 - doorlockchance) * (KinkyDungeonGoddessRep.Prisoner + 50)/100;
		let trapChance = MapParams.trapchance; // Chance of a pathway being split between a trap and a door
		let doorlocktrapchance = MapParams.doorlocktrapchance ? MapParams.doorlocktrapchance : MapParams.trapchance;
		let minortrapChance = MapParams.minortrapChance ? MapParams.minortrapChance : trapChance/3;
		// Door algorithm is defunct
		//let grateChance = MapParams.grateChance;
		let gasChance = (MapParams.gaschance && KDRandom() < MapParams.gaschance) ? (MapParams.gasdensity ? MapParams.gasdensity : 0) : 0;
		let gasType = MapParams.gastype ? MapParams.gastype : 0;
		let brickchance = MapParams.brickchance; // Chance for brickwork to start being placed
		let wallRubblechance = MapParams.wallRubblechance ? MapParams.wallRubblechance : 0;
		let barrelChance = MapParams.barrelChance ? MapParams.barrelChance : 0.045;
		let foodChance = MapParams.foodChance ? MapParams.foodChance : 0.2;
		let cageChance = MapParams.cageChance ? MapParams.cageChance : 0.25;
		let wallhookchance = MapParams.wallhookchance ? MapParams.wallhookchance : 0.025;
		let ceilinghookchance = MapParams.ceilinghookchance ? MapParams.ceilinghookchance : 0.03;
		let torchchance = MapParams.torchchance ? MapParams.torchchance : 0.35;
		let torchlitchance = MapParams.torchlitchance ? MapParams.torchlitchance : 0.75;
		let torchchanceboring = MapParams.torchchanceboring ? MapParams.torchchanceboring : 0.85;
		let torchreplace = (altType && altType.torchreplace) ? altType.torchreplace : (MapParams.torchreplace ? MapParams.torchreplace : null);

		//console.log(KDRandom());
		let shrineTypes = [];
		let shrinelist = [];
		let chargerlist = [];
		let chestlist = [];
		let startTime = performance.now();
		let genType = !altType ? "TileMaze" : altType.genType;

		// MAP GENERATION

		let VisitedRooms = [];

		KinkyDungeonStartPosition = {x: 1, y: startpos * 2};

		KinkyDungeonMapSet(1, startpos, '0', VisitedRooms);

		KinkyDungeonPOI = [];
		let POI = KinkyDungeonPOI;


		// Place the player!
		KinkyDungeonPlayerEntity = {MemberNumber:Player.MemberNumber, x: KinkyDungeonStartPosition.x, y:KinkyDungeonStartPosition.y, player:true};


		let traps = [];

		let spawnPoints = [];

		let data = {
			params: MapParams,
			chestlist: chestlist,
			traps: traps,
			shrinelist: shrinelist,
			chargerlist: chargerlist,
			spawnpoints: spawnPoints,
		};

		KinkyDungeonCreateMapGenType[genType](POI, VisitedRooms, width, height, openness, density, hallopenness, data);

		//console.log(KDRandom());
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for maze creation`);
			startTime = performance.now();
		}
		width = KinkyDungeonGridWidth;
		height = KinkyDungeonGridHeight;

		KinkyDungeonResetFog();

		KinkyDungeonPlayerEntity.x = KinkyDungeonStartPosition.x;
		KinkyDungeonPlayerEntity.y = KinkyDungeonStartPosition.y;


		if (!altType || !altType.noWear)
			KinkyDungeonReplaceDoodads(crackchance, barchance, wallRubblechance, wallhookchance, ceilinghookchance, width, height, altType); // Replace random internal walls with doodads
		//console.log(KDRandom());
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for doodad creation`);
			startTime = performance.now();
		}
		KinkyDungeonPlaceStairs(KinkyDungeonGetMainPath(Floor), KinkyDungeonStartPosition.y, width, height, altType && altType.nostairs); // Place the start and end locations
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for stair creation`);
			startTime = performance.now();
		}


		// Now we create the boringness matrix
		KDCreateBoringness();

		KinkyDungeonPlaceSetPieces(POI, traps, chestlist, shrinelist, chargerlist, spawnPoints, false, width, height);

		if (!((KinkyDungeonNearestJailPoint(1, 1) || (altType && altType.nojail)) && (!altType || KDStageBossGenerated || !bossRules))) {
			console.log("This map failed to generate! Please screenshot and send your save code to Ada on deviantart or discord!");
			continue;
		}

		if (altType && !altType.noFurniture)
			KinkyDungeonPlaceFurniture(barrelChance, cageChance, width, height, altType); // Replace random internal walls with doodads

		if (altType && !altType.noFood)
			KinkyDungeonPlaceFood(foodChance, width, height, altType); // Replace random internal walls with doodads

		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for setpiece generation`);
			startTime = performance.now();
		}
		// Recreate boringness
		KDCreateBoringness();

		if (!testPlacement) {
			if (!altType || altType.shortcut)
				KinkyDungeonPlaceShortcut(KinkyDungeonGetShortcut(Floor), width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for shortcut creation`);
				startTime = performance.now();
			}
			if (!altType || altType.chests)
				KinkyDungeonPlaceChests(chestlist, treasurechance, treasurecount, rubblechance, Floor, width, height); // Place treasure chests inside dead ends
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for chest creation`);
				startTime = performance.now();
			}
			let traps2 = [];//KinkyDungeonPlaceDoors(doorchance, nodoorchance, doorlockchance, trapChance, grateChance, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for door creation`);
				startTime = performance.now();
			}
			for (let t of traps2) {
				traps.push(t);
			}

			if (altType && !altType.notorches)
				KinkyDungeonPlaceTorches(torchchance, torchlitchance, torchchanceboring, width, height, altType, torchreplace);

			// Recreate boringness
			KDCreateBoringness();
			let orbcount = 2;
			if (altType && altType.orbs != undefined) orbcount = altType.orbs;
			if (!altType || altType.shrines)
				KinkyDungeonPlaceShrines(shrinelist, shrinechance, shrineTypes, shrinecount, shrinefilter, ghostchance, manaChance, orbcount, (altType && altType.noShrineTypes) ? altType.noShrineTypes : [], Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for shrine creation`);
				startTime = performance.now();
			}
			if (!altType || altType.chargers)
				KinkyDungeonPlaceChargers(chargerlist, chargerchance, litchargerchance, chargercount, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for charger creation`);
				startTime = performance.now();
			}
			KinkyDungeonPlaceBrickwork(brickchance, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for brickwork creation`);
				startTime = performance.now();
			}
			if (!altType || !altType.notraps)
				KinkyDungeonPlaceTraps(traps, traptypes, minortrapChance, doorlocktrapchance, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for trap creation`);
				startTime = performance.now();
			}
			KinkyDungeonPlacePatrols(4, width, height);if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for patrol point creation`);
				startTime = performance.now();
			}

			if ((!altType || !altType.nolore))
				KinkyDungeonPlaceLore(width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for lore creation`);
				startTime = performance.now();
			}
			if ((MiniGameKinkyDungeonLevel % KDLevelsPerCheckpoint == 2 || MiniGameKinkyDungeonLevel % KDLevelsPerCheckpoint == 4 || ((MiniGameKinkyDungeonLevel % KDLevelsPerCheckpoint == 1 || MiniGameKinkyDungeonLevel % KDLevelsPerCheckpoint == 3) && KDDefaultAlt.includes(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]))) && (!altType || altType.heart))
				KinkyDungeonPlaceHeart(width, height, Floor);
			if (!altType || altType.specialtiles)
				KinkyDungeonPlaceSpecialTiles(gasChance, gasType, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for special tile creation`);
				startTime = performance.now();
			}
			KinkyDungeonGenNavMap();
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for navmap creation`);
				startTime = performance.now();
			}

			KinkyDungeonUpdateStats(0);

			let tags = Object.assign([], MapParams.enemyTags);
			if (mapMod && mapMod.tags) {
				// Add in any mapmod tags
				for (let t of mapMod.tags) {
					if (!tags.includes(t))
						tags.push(t);
				}
			}

			KDGameData.JailFaction = [];
			if (mapMod?.jailType) KDGameData.JailFaction.push(mapMod.jailType);
			else if (altType?.jailType) KDGameData.JailFaction.push(altType.jailType);

			KDGameData.GuardFaction = [];
			if (mapMod?.guardType) KDGameData.GuardFaction.push(mapMod.guardType);
			else if (altType?.guardType) KDGameData.GuardFaction.push(mapMod.guardType);

			// Place enemies after player
			if (!altType || altType.enemies) {
				let bonus = (mapMod && mapMod.bonusTags) ? mapMod.bonusTags : undefined;
				if (altType && altType.bonusTags) {
					if (!bonus) bonus = altType.bonusTags;
					else bonus = Object.assign(Object.assign(Object.assign({}, bonus)), altType.bonusTags);
				}
				KinkyDungeonPlaceEnemies(spawnPoints, false, tags, bonus, Floor, width, height, altRoom);
			}
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for enemy creation`);
				startTime = performance.now();
			}

			if (MapParams.worldGenCode) MapParams.worldGenCode();

			KinkyDungeonReplaceVert(width, height);
		}

		if (KDGameData.PrisonerState == 'jail' && seed) {
			// The above condition is the condition to start in jail
			// We move the player to the jail after generating one
			let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			if (nearestJail) {

				KDMovePlayer(nearestJail.x, nearestJail.y, false);
				KDLockNearbyJailDoors(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			}
		}

		if (KDGameData.KinkyDungeonSpawnJailers > 0) KDGameData.KinkyDungeonSpawnJailers -= 1;
		if (KDGameData.KinkyDungeonSpawnJailers > 3 && KDGameData.KinkyDungeonSpawnJailers < KDGameData.KinkyDungeonSpawnJailersMax - 1) KDGameData.KinkyDungeonSpawnJailers -= 1; // Reduce twice as fast when you are in deep...

		// Set map brightness
		KinkyDungeonMapBrightness = MapParams.brightness;
		KinkyDungeonMakeGhostDecision();

		// Place the jail keys AFTER making the map!
		KinkyDungeonLoseJailKeys(false, bossRules); // if (!KDGameData.JailKey || (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail') || boss)

		if ((KinkyDungeonNearestJailPoint(1, 1) || (altType && altType.nojail)) && (!altType || KDStageBossGenerated || !bossRules)) iterations = 100000;
		else console.log("This map failed to generate! Please screenshot and send your save code to Ada on deviantart or discord!");

		if (iterations == 100000) {
			KDQuestTick(KDGameData.Quests);
			if (altType && altType.tickFlags)
				KinkyDungeonSendEvent("tickFlags", {delta: 1});
			KinkyDungeonSendEvent("postQuest", {});

			for (let e of KinkyDungeonGetAllies()) {
				KDMoveEntity(e, KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, false);
				e.visual_x = KinkyDungeonStartPosition.x;
				e.visual_y = KinkyDungeonStartPosition.y;
			}
		}
	}

	KDPathCache = new Map();
	KDPathCacheIgnoreLocks = new Map();
}

let KDStageBossGenerated = false;

/**
 * Creates a list of all tiles accessible and not hidden by doors
 */
function KinkyDungeonGenNavMap() {
	KinkyDungeonRandomPathablePoints = {};
	let accessible = KinkyDungeonGetAccessible(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		let tags = [];
		if (!KinkyDungeonTilesGet(a[0]) || !KinkyDungeonTilesGet(a[0]).OffLimits)
			KinkyDungeonRandomPathablePoints[a[0]] = {x: X, y:Y, tags:tags};
	}
}

// Checks everything that is accessible to the player
function KinkyDungeonGetAccessible(startX, startY, testX, testY) {
	let tempGrid = {};
	let checkGrid = {};
	checkGrid[(startX + "," + startY)] = {x: startX, y: startY};
	while (Object.entries(checkGrid).length > 0) {
		for (let g of Object.entries(checkGrid)) {
			let X = g[1].x;
			let Y = g[1].y;
			for (let XX = -1; XX <= 1; XX++)
				for (let YY = -1; YY <= 1; YY++) {
					let testLoc = ((X+XX) + "," + (Y+YY));
					let locked = (testX != undefined && testY != undefined && X+XX == testX && Y+YY == testY)
						|| (KinkyDungeonTilesGet("" + (X+XX) + "," + (Y+YY)) && KinkyDungeonTilesGet("" + (X+XX) + "," + (Y+YY)).Lock);
					if (!checkGrid[testLoc] && !tempGrid[testLoc] && X+XX > 0 && X+XX < KinkyDungeonGridWidth-1 && Y+YY > 0 && Y+YY < KinkyDungeonGridHeight-1
						&& KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X+XX, Y+YY)) && !locked) {
						checkGrid[testLoc] = {x:X+XX,y:Y+YY};
						tempGrid[testLoc] = {x:X+XX,y:Y+YY};
					}
				}

			delete checkGrid[g[0]];
		}
	}

	return tempGrid;
}

// Checks everything that is accessible to the player, treating all doors as walls
function KinkyDungeonGetAccessibleRoom(startX, startY) {
	let tempGrid = {};
	let checkGrid = {};
	checkGrid[startX + "," + startY] = {x: startX, y: startY};
	while (Object.entries(checkGrid).length > 0) {
		for (let g of Object.entries(checkGrid)) {
			for (let XX = -1; XX <= 1; XX++)
				for (let YY = -1; YY <= 1; YY++) {
					let test = ((g[1].x+XX) + "," + (g[1].y+YY));
					let Tiles = KinkyDungeonMovableTiles.replace("D", "").replace("d", "");
					if (!checkGrid[test] && !tempGrid[test] && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(g[1].x+XX, g[1].y+YY))) {
						if (Tiles.includes(KinkyDungeonMapGet(g[1].x+XX, g[1].y+YY)))
							checkGrid[test] = {x: g[1].x+XX, y:g[1].y+YY};
						tempGrid[test] = true;
					}
				}

			delete checkGrid[g[0]];
		}
	}

	return Object.keys(tempGrid);
}

// Tests if the player can reach the end stair even if the test spot is blocked
function KinkyDungeonIsAccessible(testX, testY) {
	let accessible = KinkyDungeonGetAccessible(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, testX, testY);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		if (KinkyDungeonMapGet(X, Y) == 's') return true;
	}
	return false;
}

// Tests if the player can reach the spot from the start point
function KinkyDungeonIsReachable(testX, testY, testLockX, testLockY) {
	let accessible = KinkyDungeonGetAccessible(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, testLockX, testLockY);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		if (X == testX && Y == testY) return true;
	}
	return false;
}

function KinkyDungeonGetAllies() {
	let temp = [];
	for (let e of KinkyDungeonEntities) {
		if (e.Enemy && e.Enemy.keepLevel) {
			KDMoveEntity(e, KinkyDungeonStartPosition.x, KinkyDungeonStartPosition.y, false);
			e.visual_x = KinkyDungeonStartPosition.x;
			e.visual_y = KinkyDungeonStartPosition.y;
			temp.push(e);
		}
	}

	return temp;
}

// @ts-ignore
// @ts-ignore
function KinkyDungeonPlaceEnemies(spawnPoints, InJail, Tags, BonusTags, Floor, width, height, altRoom) {
	KinkyDungeonHuntDownPlayer = false;
	KinkyDungeonFirstSpawn = true;
	KinkyDungeonSearchTimer = 0;

	let enemyCount = 8 + Math.floor(Math.sqrt(Floor) + width/16 + height/16 + KinkyDungeonDifficulty/7);
	if (KinkyDungeonStatsChoice.get("Stealthy")) enemyCount = Math.round(enemyCount * KDStealthyEnemyCountMult);
	let neutralCount = 0.4 * enemyCount;
	let count = 0;
	let ncount = 0;
	let tries = 0;
	let miniboss = false;
	let boss = false;
	let jailerCount = 0;
	let EnemyNames = [];

	if (altRoom) {
		if (altRoom.enemyMult) {
			enemyCount *= altRoom.enemyMult;
			neutralCount *= altRoom.enemyMult;
		}
	}

	// Determine factions to spawn
	let factions = Object.keys(KinkyDungeonFactionTag);
	let primaryFaction = factions[Math.floor(KDRandom() * factions.length)];
	let randomFactions = [
		primaryFaction
	];

	// Add up to one friend of the faction and one enemy
	let allyCandidates = [];
	for (let f of factions) {
		if (KDFactionRelation(primaryFaction, f) > 0.2) allyCandidates.push(f);
	}
	let enemyCandidates = [];
	for (let f of factions) {
		if (KDFactionRelation(primaryFaction, f) < -0.2) enemyCandidates.push(f);
	}

	let factionAllied = allyCandidates.length > 0 ? allyCandidates[Math.floor(KDRandom() * allyCandidates.length)] : "";
	let factionEnemy = enemyCandidates.length > 0 ? enemyCandidates[Math.floor(KDRandom() * enemyCandidates.length)] : "";

	if (factionAllied) randomFactions.push(factionAllied);
	if (factionEnemy) randomFactions.push(factionEnemy);

	KDGameData.JailFaction.push(primaryFaction);
	KDGameData.GuardFaction.push(primaryFaction);
	if (factionAllied) {
		KDGameData.GuardFaction.push(factionAllied);
	}

	console.log(randomFactions[0] + "," + randomFactions[1] + "," + randomFactions[2]);

	// These tags are disallowed unless working in the specific box
	let filterTags = ["boss", "miniboss", "elite", "minor"];
	let filterTagsCluster = ["boss", "miniboss"];

	let spawnBoxes = [
		{requiredTags: ["boss"], tags: [], currentCount: 0, maxCount: 0.025},
		{requiredTags: ["miniboss"], tags: [], currentCount: 0, maxCount: 0.075},
		{requiredTags: ["elite"], tags: [], currentCount: 0, maxCount: 0.15},
		{requiredTags: ["minor"], tags: [], currentCount: 0, maxCount: 0.1},
	];
	if (KDGameData.MapMod) {
		let mapMod = KDMapMods[KDGameData.MapMod];
		if (mapMod && mapMod.spawnBoxes) {
			for (let m of mapMod.spawnBoxes) {
				spawnBoxes.unshift(Object.assign({}, m));
			}
		}
	} else {
		for (let rf of randomFactions) {
			spawnBoxes.push({requiredTags: [KinkyDungeonFactionTag[rf]], filterTags: ["boss", "miniboss"], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.15, bias: rf == factionEnemy ? 2 : 1});
			spawnBoxes.push({requiredTags: ["miniboss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.1, bias: rf == factionEnemy ? 2 : 1});
			spawnBoxes.push({requiredTags: ["boss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.01, bias: rf == factionEnemy ? 2 : 1});
		}
	}

	let currentCluster = null;

	let spawns = [];
	for (let sp of spawnPoints) {
		spawns.push(sp);
	}

	let enemyPoints = [];

	// Create a quasirandom distribution
	// This is to get the enemies more spread out
	// Higher dd = more spread out
	let dd = 3.5;
	for (let X = 1; X < width - 1.01 - dd; X += dd)
		for (let Y = 1; Y < width - 1.01 - dd; Y += dd) {
			enemyPoints.push({x: Math.round(X + KDRandom() * dd), y: Math.round(Y + KDRandom() * dd)});
		}

	let eep = [];
	// Shuffle
	while (enemyPoints.length > 0) {
		let index = Math.floor(KDRandom() * enemyPoints.length);
		eep.push(enemyPoints[index]);
		enemyPoints.splice(index, 1);
	}

	// Sort so that smaller rooms are prioritized
	enemyPoints.sort((a, b) => {
		let sizea = KinkyDungeonGetAccessibleRoom(a.x, a.y).length;
		let sizeb = KinkyDungeonGetAccessibleRoom(b.x, b.y).length;
		return sizeb - sizea;

	});

	let culledSpawns = false;
	// Create this number of enemies
	while (((count < enemyCount) || (spawns.length > 0)) && tries < 10000) {
		if (count >= enemyCount && !culledSpawns) {
			spawns = spawns.filter((spawn) => {
				return spawn.force;
			});
			culledSpawns = true;
			if (spawns.length == 0) break;
		}

		let pointIndex = Math.floor(KDRandom() * 0.5 * enemyPoints.length);
		let point = enemyPoints[pointIndex];
		let X = point ? point.x : (1 + Math.floor(KDRandom()*(width - 1)));
		let Y = point ? point.y : (1 + Math.floor(KDRandom()*(height - 1)));



		if (point && KinkyDungeonBoringGet(X, Y) > 0 && KDRandom() < 0.5) {
			continue;
			// Half of all enemies will be placed along the main path
		}

		if (point) {
			enemyPoints.splice(pointIndex);
		}

		let required = [];
		let spawnPoint = false;
		let AI = undefined;
		let tags = [];

		if (currentCluster && !(3 * KDRandom() < currentCluster.count)) {
			required.push(currentCluster.required);
			X = currentCluster.x - 2 + Math.floor(KDRandom() * 5);
			Y = currentCluster.y - 2 + Math.floor(KDRandom() * 5);

			if (!KinkyDungeonCheckPath(currentCluster.x, currentCluster.y, X, Y, false, true)) {
				if (5 * KDRandom() < currentCluster.count) currentCluster = null;
				continue;
			}
		} else {
			currentCluster = null;
			if (spawns.length > 0 && KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(spawns[0].x, spawns[0].y))) {
				spawnPoint = true;
				let specific = false;
				if (spawns[0].required) {
					required = Object.assign([], spawns[0].required);
					for (let t of required) {
						if (filterTags.includes(t)) filterTags.splice(filterTags.indexOf(t), 1);
					}
				}

				if (spawns[0].tags) {
					specific = true;
					tags = spawns[0].tags;
					for (let t of tags) {
						if (filterTags.includes(t)) filterTags.splice(filterTags.indexOf(t), 1);
					}
				}

				if (spawns[0].ftags) {
					for (let t of spawns[0].ftags) {
						filterTags.push(t);
					}
				}

				if (!specific) {
					tags.push(randomFactions[Math.floor(randomFactions.length * KDRandom())]);
				}
				X = spawns[0].x;
				Y = spawns[0].y;
				AI = spawns[0].AI;
				spawns.splice(0, 1);
			}
		}

		let playerDist = 8;
		let PlayerEntity = KinkyDungeonNearestPlayer({x:X, y:Y});

		let spawnBox_filter = spawnBoxes.filter((bb) => {
			return bb.currentCount < bb.maxCount * enemyCount && (!bb.bias
				// This part places allied faction toward the center of the map and enemy faction around the edges
				|| (bb.bias == 1 && X > width * 0.25 && X < width * 0.75 && Y > height * 0.25 && Y < height * 0.75)
				|| (bb.bias == 2 && (X < width * 0.25 || X > width * 0.75) && (Y < height * 0.25 || Y > height * 0.75))
			);
		});
		let box = null;
		if (spawnBox_filter.length > 0) {
			box = spawnBox_filter[Math.floor(KDRandom() * spawnBox_filter.length)];
		}

		if (box && (!spawnPoint || box.addToSpawn) && !currentCluster) {
			if (!spawnPoint) {
				for (let rtag of box.requiredTags) {
					if (filterTags.includes(rtag)) filterTags.splice(filterTags.indexOf(rtag), 1);
					required.push(rtag);
				}
				if (box.filterTags)
					for (let ftag of box.filterTags) {
						if (!filterTags.includes(ftag)) filterTags.push(ftag);
					}
			}
			for (let tag of box.tags) {
				if (filterTags.includes(tag)) filterTags.splice(filterTags.indexOf(tag), 1);
				tags.push(tag);
			}
		} else {
			box = null;
		}

		if ((spawnPoint && KinkyDungeonNoEnemy(X, Y, true)) || ((!KinkyDungeonTilesGet("" + X + "," + Y) || !KinkyDungeonTilesGet("" + X + "," + Y).OffLimits)
			&& Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) > playerDist && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
			&& KinkyDungeonNoEnemy(X, Y, true) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits))) {

			if (KDGameData.KinkyDungeonSpawnJailers > 0 && jailerCount < KDGameData.KinkyDungeonSpawnJailersMax) tags.push("jailer");
			if (KinkyDungeonMapGet(X, Y) == 'R' || KinkyDungeonMapGet(X, Y) == 'r') tags.push("rubble");
			if (KinkyDungeonMapGet(X, Y) == 'D' || KinkyDungeonMapGet(X, Y) == 'd') tags.push("door");
			if (KinkyDungeonMapGet(X, Y) == 'g') tags.push("grate");
			if (!KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y+1)) && !KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y-1))) tags.push("passage");
			else if (!KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X+1, Y)) && !KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X-1, Y))) tags.push("passage");
			else if (KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X+1, Y+1))
					&& KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X+1, Y-1))
					&& KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X-1, Y+1))
					&& KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X-1, Y-1))) tags.push("open");

			for (let XX = X-1; XX <= X+1; XX += 1)
				for (let YY = Y-1; YY <= Y+1; YY += 1)
					if (!(XX == X && YY == Y)) {
						if (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X') tags.push("adjWall");
						if (KinkyDungeonMapGet(XX, YY) == 'D' || KinkyDungeonMapGet(XX, YY) == 'd') tags.push("adjDoor");
						if (KinkyDungeonMapGet(XX, YY) == 'D') tags.push("adjClosedDoor");
						if (KinkyDungeonMapGet(XX, YY) == 'c' || KinkyDungeonMapGet(XX, YY) == 'C') tags.push("adjChest");
						if (KinkyDungeonMapGet(XX, YY) == 'r' || KinkyDungeonMapGet(XX, YY) == 'R') tags.push("adjRubble");

					}

			if (miniboss) tags.push("miniboss");
			if (boss) tags.push("boss");

			KinkyDungeonAddTags(tags, Floor);
			for (let t of Tags) {
				tags.push(t);
			}
			if (randomFactions.length > 0 && !box && !currentCluster && !spawnPoint)
				tags.push(randomFactions[Math.floor(randomFactions.length * KDRandom())]);
			if (required.length == 0) required = undefined;
			let Enemy = KinkyDungeonGetEnemy(
				tags,
				Floor + KinkyDungeonDifficulty/5,
				KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
				KinkyDungeonMapGet(X, Y),
				required,
				ncount > neutralCount && (!box || !box.ignoreAllyCount),
				BonusTags,
				currentCluster ? filterTagsCluster : filterTags);
			if (box && !Enemy) {
				box.currentCount += 0.05;
			}
			if (Enemy && (!InJail || (Enemy.tags.jailer || Enemy.tags.jail || Enemy.tags.leashing))) {
				let e = {Enemy: Enemy, id: KinkyDungeonGetEnemyID(), x:X, y:Y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0, AI: AI};
				KDAddEntity(e);
				// Give it a custom name, 5% chance
				if (KDPatronCustomEnemies.get(Enemy.name) && KDRandom() < 0.05) {
					let customs = KDPatronCustomEnemies.get(Enemy.name).filter((element) => {
						return (element.prisoner && Enemy.specialdialogue && Enemy.specialdialogue.includes("Prisoner")) || (element.free && !Enemy.specialdialogue);
					});
					if (customs.length > 0) {
						let custom = customs[Math.floor(customs.length * KDRandom())];
						e.CustomName = custom.name;
						e.CustomNameColor = custom.color;
						e.CustomSprite = custom.customSprite;
					}
				}
				let incrementCount = 1;
				KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
				let shop = KinkyDungeonGetShopForEnemy(e, false);
				if (shop) {
					KinkyDungeonSetEnemyFlag(e, "Shop", -1);
					KinkyDungeonSetEnemyFlag(e, shop, -1);
				}
				let loadout = KinkyDungeonGetLoadoutForEnemy(e, false);
				KDSetLoadout(e, loadout);

				if (!spawnPoint && !currentCluster && Enemy.clusterWith) {
					let clusterChance = 0.5; //1.1 + 0.9 * MiniGameKinkyDungeonLevel/KinkyDungeonMaxLevel;
					if (Enemy.tags.boss) clusterChance = 0;
					else if (Enemy.tags.miniboss) clusterChance = 0;
					else if (Enemy.tags.elite) clusterChance = 0.15;
					//else if (Enemy.tags.elite || Enemy.tags.miniboss) clusterChance *= 0.6;
					if (KDRandom() < clusterChance)
						currentCluster = {
							x : X,
							y : Y,
							required: Enemy.clusterWith,
							count: 1,
							AI: Enemy.guardChance && KDRandom() < Enemy.guardChance ? "looseguard" : undefined,
						};
				} else if (currentCluster) currentCluster.count += 1;
				if (!currentCluster && Enemy.guardChance && KDRandom() < Enemy.guardChance) {
					e.AI = "looseguard";
				} else if (currentCluster && currentCluster.AI) e.AI = currentCluster.AI;
				if (Enemy.tags.mimicBlock && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))) KinkyDungeonMapSet(X, Y, '3');
				if (Enemy.tags.minor) incrementCount = 0.2; else incrementCount = currentCluster ? 0.5 : 1.0; // Minor enemies count as 1/5th of an enemy
				if (Enemy.difficulty) incrementCount += Enemy.difficulty;
				if (Enemy.tags.boss) {
					//boss = true;
				}
				else if (Enemy.tags.miniboss) miniboss = true; // Adds miniboss as a tag
				if (Enemy.tags.removeDoorSpawn && KinkyDungeonMapGet(X, Y) == "d") {
					KinkyDungeonMapSet(X, Y, '0');
					KinkyDungeonTilesDelete(X + "," + Y);
				}
				if (Enemy.tags.jailer) jailerCount += 1;

				if (Enemy.summon) {
					for (let sum of Enemy.summon) {
						if (!sum.chance || KDRandom() < sum.chance)
							KinkyDungeonSummonEnemy(X, Y, sum.enemy, sum.count, sum.range, sum.strict);
					}
				}
				if (incrementCount) count += spawnPoint ? 0.025 : incrementCount;
				if (!spawnPoint && box)
					box.currentCount += incrementCount;
				if (KDFactionRelation("Player", KDGetFaction(e)) > -0.5) {
					ncount += 1;
				}
				EnemyNames.push(Enemy.name + `_${box?`box-${box.requiredTags}, ${box.tags}`:""},${currentCluster?"cluster":""},${spawnPoint}`);
			}
		}
		tries += 1;
	}
	console.log(EnemyNames);

	KinkyDungeonCurrentMaxEnemies = KinkyDungeonEntities.length;
}

let KinkyDungeonSpecialAreas = [];

function KinkyDungeonGetClosestSpecialAreaDist(x ,y) {
	let minDist = 10000;
	for (let area of KinkyDungeonSpecialAreas) {
		let dist = KDistChebyshev(x - area.x, y - area.y) - area.radius;
		if (dist < minDist) minDist = dist;
	}

	return minDist;
}

// Type 0: empty border, hollow
// Type 1: hollow, no empty border
// Type 2: only empty space
// Type 3: completely filled
function KinkyDungeonCreateRectangle(Left, Top, Width, Height, Border, Fill, Padding, OffLimits, NoWander, flexCorner) {
	let pad = Padding ? Padding : 0;
	let borderType = (Border) ? '1' : '0';
	let fillType = (Fill) ? '1' : '0';
	for (let X = -pad; X < Width + pad; X++)
		for (let Y = - pad; Y < Height + pad; Y++) {
			if (X + Left < KinkyDungeonGridWidth-1 && Y + Top < KinkyDungeonGridHeight-1 && X + Left > 0 && Y + Top > 0) {
				let setTo = "";
				let offlimit = true;
				if (X < 0 || Y < 0 || X >= Width || Y >= Height) {
					setTo = '0';
					offlimit = false;
				} else {
					if (X == 0 || X == Width - 1 || Y == 0 || Y == Height-1) {
						setTo = borderType;
					} else setTo = fillType;
				}
				if (setTo != "" && KinkyDungeonMapGet(Left + X, Top + Y) != "s") {
					KinkyDungeonMapSet(Left + X, Top + Y, setTo);
					delete KinkyDungeonEffectTiles[(Left + X) + "," + (Top + Y)];
					if (offlimit && OffLimits) {
						KinkyDungeonTilesSet((Left + X) + "," + (Top + Y), {OffLimits: true, NoWander: NoWander});
					}
				}
			}


			/*
			if ((X == cellWidth || X == 0) && (Y > KinkyDungeonStartPosition.y - cellHeight && Y < KinkyDungeonStartPosition.y + cellHeight)) {
				wall = true;
				if (KDRandom() < barchance) bar = true;
			}
			if (Y == KinkyDungeonStartPosition.y - cellHeight && X <= cellWidth || Y == KinkyDungeonStartPosition.y + cellHeight && X <= cellWidth) {
				wall = true;
				if (KDRandom() < grateChance/(grateCount*3) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y+1)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y-1))) grate = true;
			}
			if (X == cellWidth && Y == KinkyDungeonStartPosition.y) {
				wall = false;
				door = true;
			}
			if (door) {
				KinkyDungeonMapSet(X, Y, 'D');
				KinkyDungeonTilesGet(X + "," + Y] = {Type: "Door"};
				if (lock) KinkyDungeonTilesGet(X + "," + Y].Lock = lock;
			} else if (wall) {
				if (bar)
					KinkyDungeonMapSet(X, Y, 'b');
				else if (grate) {
					KinkyDungeonMapSet(X, Y, 'g');
					grateCount += 1;
				} else
					KinkyDungeonMapSet(X, Y, '1');
			} else KinkyDungeonMapSet(X, Y, '0');*/
		}

	if (flexCorner) {
		// flexCorner is a feature to place doodads to avoid unnecessary passageways into other tiles
		if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad - 1, Top -pad))
			&& !KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad, Top -pad - 1))
			&& KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad - 1, Top -pad - 1))) {
			KinkyDungeonMapSet(Left -pad, Top -pad, 'X');
		}
		if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad - 1, Top -1 + Height + pad))
			&& !KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad, Top -1 + Height + pad + 1))
			&& KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-pad - 1, Top -1 + Height + pad + 1))) {
			KinkyDungeonMapSet(Left-pad, Top -1 + Height + pad, 'X');
		}
		if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad + 1, Top -pad))
			&& !KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad, Top -pad - 1))
			&& KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad + 1, Top -pad - 1))) {
			KinkyDungeonMapSet(Left-1 + Height + pad, Top -pad, 'X');
		}
		if (!KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad + 1, Top -1 + Height + pad))
			&& !KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad, Top -1 + Height + pad + 1))
			&& KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(Left-1 + Height + pad + 1, Top -1 + Height + pad + 1))) {
			KinkyDungeonMapSet(Left-1 + Height + pad, Top -1 + Height + pad, 'X');
		}
	}
}

function KinkyDungeonPlaceStairs(checkpoint, startpos, width, height, noStairs) {
	// Starting stairs are predetermined and guaranteed to be open
	KinkyDungeonMapSet(1, startpos, 'S');
	/*if (startpos > 1) KinkyDungeonMapSet(2, startpos - 1, '0');
	KinkyDungeonMapSet(2, startpos, '0');
	if (startpos < KinkyDungeonGridHeight-1) KinkyDungeonMapSet(2, startpos + 1, '0');
	if (startpos > 1) KinkyDungeonMapSet(3, startpos - 1, '0');
	KinkyDungeonMapSet(3, startpos, '0');
	if (startpos < KinkyDungeonGridHeight-1) KinkyDungeonMapSet(3, startpos + 1, '0');*/

	if (!noStairs) {
		// Ending stairs are not.
		let placed = false;

		if (KinkyDungeonEndPosition) {
			placed = true;
			KinkyDungeonMapSet(KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, 's');
		}

		// shop around for space if that didn't work for some reason
		if (!placed)
			for (let X = width - 2; X > 0.75 * width - 2 && !placed; X--)
				for (let L = 100; L > 0; L -= 1) { // Try up to 100 times
					//let X = width - 2;
					let Y = 1 + 2*Math.floor(KDRandom()*0.5 * (height - 2));
					if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))) {
						// Check the 3x3 area
						let wallcount = 0;
						for (let XX = X-1; XX <= X+1; XX += 1)
							for (let YY = Y-1; YY <= Y+1; YY += 1)
								if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X'))
									wallcount += 1;
						if (wallcount == 7
							|| (wallcount >= 5
								&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
								&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1'))) {
							placed = true;
							KinkyDungeonMapSet(X, Y, 's');
							KinkyDungeonEndPosition = {x: X, y: Y};
							L = 0;
							break;
						}
					}
				}

		if (!placed) // Loosen the constraints
			for (let L = 100; L > 0; L -= 1) { // Try up to 100 times
				let X = width - 2 - Math.floor(KDRandom() * width/(4));
				let Y = 1 + Math.floor(KDRandom() * (height - 2));
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))) {
					KinkyDungeonMapSet(X, Y, 's');
					KinkyDungeonEndPosition = {x: X, y: Y};
					L = 0;
				}
			}

	}

	MiniGameKinkyDungeonMainPath = checkpoint;
	if (MiniGameKinkyDungeonMainPath != MiniGameKinkyDungeonCheckpoint) KinkyDungeonSkinArea({skin: MiniGameKinkyDungeonMainPath}, KinkyDungeonEndPosition.x, KinkyDungeonEndPosition.y, 8.5);
	KinkyDungeonSpecialAreas.push({x: KinkyDungeonEndPosition.x, y: KinkyDungeonEndPosition.y, radius: 2});
}

function KinkyDungeonSkinArea(skin, X, Y, Radius, NoStairs) {
	for (let xx = Math.floor(X - Radius); xx <= Math.ceil(X + Radius); xx++) {
		for (let yy = Math.floor(Y - Radius); yy <= Math.ceil(Y + Radius); yy++) {
			if (xx >= 0 && xx <= KinkyDungeonGridWidth - 1 && yy >= 0 && yy <= KinkyDungeonGridHeight - 1) {
				if (KDistEuclidean(xx - X, yy - Y) <= Radius + 0.01 && (!NoStairs || KinkyDungeonMapGet(xx, yy) != 's')) {
					if (!KinkyDungeonTilesSkin[xx + "," + yy]) {
						KinkyDungeonTilesSkin[xx + "," + yy] =  skin;
					} else {
						//
					}
				}
			}
		}
	}
}


// @ts-ignore
function KinkyDungeonGetMainPath(level) {
	let params = KinkyDungeonMapParams[MiniGameKinkyDungeonCheckpoint];
	let paths = params ? params.mainpath : null;
	let path = null;
	let chanceRoll = KDRandom(); // This is always rolled, in order to not break saves
	if (paths) {
		for (let p of paths) {
			if (p.Level == MiniGameKinkyDungeonLevel) {
				path = p;
				break;
			}
		}
	}
	if (path) {
		if (chanceRoll < path.chance || !path.chance) {
			return path.checkpoint;
		}
	}
	if ((MiniGameKinkyDungeonLevel + 1) % 6 == 0) {
		return KDDefaultJourney[Math.min(KDDefaultJourney.length - 1, Math.floor((MiniGameKinkyDungeonLevel + 1) / KDLevelsPerCheckpoint))];
	}
	return MiniGameKinkyDungeonCheckpoint;
}

// @ts-ignore
function KinkyDungeonGetShortcut(level) {
	let params = KinkyDungeonMapParams[MiniGameKinkyDungeonCheckpoint];
	let paths = params ? params.shortcuts : null;
	let path = null;
	let chanceRoll = KDRandom(); // This is always rolled, in order to not break saves
	if (paths) {
		for (let p of paths) {
			if (p.Level == MiniGameKinkyDungeonLevel) {
				path = p;
				break;
			}
		}
	}
	if (path) {
		if (chanceRoll < path.chance || !path.chance) {
			return path.checkpoint;
		}
	}
	return "grv";
}

function KinkyDungeonPlaceShortcut(checkpoint, width, height) {

	if (checkpoint != "grv") {

		// Ending stairs are not.
		let placed = false;
		let xx = 0;
		let yy = 0;

		for (let L = 1000; L > 0; L -= 1) { // Try up to 1000 times
			let X = Math.floor(width * 0.75) - 2 - Math.floor(KDRandom() * width/2);
			let Y = 1 + 2*Math.floor(KDRandom()*0.5 * (height - 2));
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
				// Check the 3x3 area
				let wallcount = 0;
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1)
						if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X'))
							wallcount += 1;
				if (wallcount == 7
					|| (wallcount >= 5
						&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
						&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1'))) {
					placed = true;
					KinkyDungeonMapSet(X, Y, 'H');
					KinkyDungeonShortcutPosition = {x:X, y:Y};
					xx = X;
					yy = Y;
					L = 0;
					break;
				}
			}
		}

		if (!placed) // Loosen the constraints
			for (let L = 1000; L > 0; L -= 1) { // Try up to 1000 times
				let X = Math.floor(width * 0.75) - 2 - Math.floor(KDRandom() * width/2);
				let Y = 1 + Math.floor(KDRandom() * (height - 2));
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))
					&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
					KinkyDungeonMapSet(X, Y, 'H');
					L = 0;
					placed = true;
					xx = X;
					yy = Y;
					KinkyDungeonShortcutPosition = {x:X, y:Y};
				}
			}

		if (placed) {
			MiniGameKinkyDungeonShortcut = checkpoint;
			if (MiniGameKinkyDungeonShortcut != MiniGameKinkyDungeonCheckpoint) KinkyDungeonSkinArea({skin: MiniGameKinkyDungeonShortcut}, xx, yy, 4.5, true);
		}
	}
}


let KDMinBoringness = 0; // Minimum boringness for treasure spawn

function KinkyDungeonPlaceChests(chestlist, treasurechance, treasurecount, rubblechance, Floor, width, height) {

	let chestPoints = new Map();

	for (let s of chestlist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			chestPoints.set(s.x + "," + s.y, true);
	}

	let extra = KDRandom() < treasurechance;
	treasurecount += (extra ? 1 : 0);

	if (KinkyDungeonStatsChoice.get("Stealthy")) treasurecount *= 2;

	if (chestlist.length < treasurecount) {
		// Populate the chests
		for (let X = 1; X < width; X += 1)
			for (let Y = 1; Y < height; Y += 1) {
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && KDistChebyshev(X - KinkyDungeonStartPosition.x, Y - KinkyDungeonStartPosition.y) > 10 &&
				(!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
					// Check the 3x3 area
					let wallcount = 0;
					let adjcount = 0;
					let diagadj = 0;
					for (let XX = X-1; XX <= X+1; XX += 1)
						for (let YY = Y-1; YY <= Y+1; YY += 1) {
							if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X')) {
								wallcount += 1;
								// Adjacent wall
								if (XX == X || YY == Y) adjcount += 1;
							} else if (!(XX == X && YY == Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY))) {
								if (!(XX == X || YY == Y)) {// Diagonal floor. We check the adjacent floors around the diagonals to determine if this is an alcove or a passage
									if (XX == X + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X + 1, Y))) diagadj += 1;
									else if (XX == X - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X - 1, Y))) diagadj += 1;
									else if (YY == Y + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y + 1))) diagadj += 1;
									else if (YY == Y - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y - 1))) diagadj += 1;
								}
							}
						}

					if (wallcount == 7
						|| (wallcount >= 4 && (wallcount - adjcount - diagadj == 0 || (wallcount == 5 && adjcount == 2 && diagadj == 1) || (wallcount > 4 && adjcount == 3 && diagadj == 7 - wallcount))
							&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
							&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1')
							&& (!(KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X-1, Y) == '1') || (wallcount > 4 && adjcount == 3 && diagadj == 7 - wallcount))
							&& (!(KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '1') || (wallcount > 4 && adjcount == 3 && diagadj == 7 - wallcount)))) {
						if (!chestPoints.get((X+1) + "," + (Y))
							&& !chestPoints.get((X-1) + "," + (Y))
							&& !chestPoints.get((X+1) + "," + (Y+1))
							&& !chestPoints.get((X+1) + "," + (Y-1))
							&& !chestPoints.get((X-1) + "," + (Y+1))
							&& !chestPoints.get((X-1) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y+1))
							&& !chestPoints.get((X) + "," + (Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y+1))) {
							chestlist.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y)});
							chestPoints.set(X + "," + Y, true);
						}
					}
				}
			}
	}

	// Truncate down to max chest count in a location-neutral way
	let count = 0;
	// Removed due to the way the jail system was reworked
	let alreadyOpened = 0;//(KinkyDungeonChestsOpened.length > Floor) ? KinkyDungeonChestsOpened[Floor] : 0;
	if (KinkyDungeonNewGame < 1) treasurecount -= alreadyOpened;
	let list = [];
	let maxBoringness = Math.max(...KinkyDungeonBoringness);
	while (chestlist.length > 0) {
		let N = Math.floor(KDRandom()*chestlist.length);
		let chest = chestlist[N];
		if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
		if (chest.boringness > 0)
			chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
		else
			chest.boringness = chest.boringness + 0.05 * KDRandom() * maxBoringness;
		if (chest.priority) {
			list.unshift(chest);
		} else list.push(chest);

		chestlist.splice(N, 1);
	}
	list.sort((a, b) => {
		let boringa = a.boringness ? a.boringness : 0;
		let boringb = b.boringness ? b.boringness : 0;
		if (a.priority) boringa += 1000;
		if (b.priority) boringb += 1000;
		return boringb - boringa;

	});
	let silverchest = 0;
	while (list.length > 0) {
		let N = 0;
		if (count < treasurecount) {
			let chest = list[N];
			KinkyDungeonMapSet(chest.x, chest.y, 'C');

			// Add a lock on the chest! For testing purposes ATM
			let lock = KinkyDungeonGenerateLock((extra && count == 0) ? true : false, Floor);
			if (chest.Loot) lock = chest.Lock;
			if (silverchest == 0 && !chest.Loot) {
				silverchest += 1;
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {
					Loot: "silver", Roll: KDRandom(), NoTrap: chest.NoTrap, Faction: chest.Faction,
					lootTrap: KDGenChestTrap(false, chest.x, chest.y, "silver", lock, chest.noTrap),});
			} else if (lock) {
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {
					NoTrap: chest.NoTrap, Type: "Lock", Lock: lock,
					Loot: lock == "Blue" ? "blue" : (chest.Loot ? chest.Loot : "chest"),
					Faction: chest.Faction,
					Roll: KDRandom(),
					Special: lock == "Blue",
					RedSpecial: lock == "Red",
					lootTrap: KDGenChestTrap(false, chest.x, chest.y, (chest.Loot ? chest.Loot : "chest"), lock, chest.noTrap),});
			} else KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {Loot: chest.Loot ? chest.Loot : "chest", Faction: chest.Faction, Roll: KDRandom(),
				NoTrap: chest.NoTrap,
				lootTrap: KDGenChestTrap(false, chest.x, chest.y, (chest.Loot ? chest.Loot : "chest"), lock, chest.noTrap),});

			if (KDAlreadyOpened(chest.x, chest.y)) {
				KinkyDungeonMapSet(chest.x, chest.y, 'c');
				KinkyDungeonTilesDelete("" + chest.x + "," +chest.y);
			}
			count += 1;
		} /*else {

			let chest = list[N];
			if (KDRandom() < rubblechance) {
				KinkyDungeonMapSet(chest.x, chest.y, 'R');
				if (KDAlreadyOpened(chest.x, chest.y)) KinkyDungeonMapSet(chest.x, chest.y, 'r');
			} else if (KDRandom() * KDRandom() < rubblechance - 0.01) KinkyDungeonMapSet(chest.x, chest.y, '/');
			//else if (KDRandom() < rubblechance - 0.05) KinkyDungeonMapSet(chest.x, chest.y, 'r');

		}*/
		list.splice(N, 1);
	}


	for (let tile of Object.entries(KinkyDungeonTiles)) {
		if (tile[1].lootTrap) {
			let x = parseInt(tile[0].split(',')[0]);
			let y = parseInt(tile[0].split(',')[1]);
			let spawned = 0;
			let mult = tile[1].lootTrap.mult;
			let trap = tile[1].lootTrap.trap;
			//let duration = tile[1].lootTrap.duration;
			let maxspawn = 1 + Math.round(Math.min(2 + KDRandom() * 2, KinkyDungeonDifficulty/25) + Math.min(2 + KDRandom() * 2, 0.5*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
			if (mult) maxspawn *= mult;
			let requireTags = trap ? [trap] : undefined;

			let tags = ["trap", trap];
			KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);

			for (let i = 0; i < 30; i++) {
				if (spawned < maxspawn) {
					let Enemy = KinkyDungeonGetEnemy(
						tags, MiniGameKinkyDungeonLevel + KinkyDungeonDifficulty/5,
						KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
						'0', requireTags, true);
					if (Enemy) {
						let point = KinkyDungeonGetNearbyPoint(x, y, true, undefined, undefined, false, (xx, yy) => {
							return !KDEffectTileTags(xx, yy).rune;
						});

						//KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 7, true, (duration || Enemy.tags.construct) ? (duration || 40) : undefined, undefined, false, "Ambush", true, 1.5, true, undefined, true, true);
						if (point) {
							if (!KinkyDungeonTilesGet(point.x + ',' + point.y)) KinkyDungeonTilesSet(point.x + ',' + point.y, {});
							KinkyDungeonTilesGet(point.x + ',' + point.y).lootTrapEnemy = Enemy.name;
							KDCreateEffectTile(point.x, point.y, {
								name: "Runes",
								duration: 9999,
							}, 0);
							if (Enemy.tags.minor) spawned += 0.5;
							else if (Enemy.tags.elite) spawned += 1.5;
							else if (Enemy.tags.miniboss) spawned += 2;
							else if (Enemy.tags.boss) spawned += 4;
							else spawned += 1;
							if (Enemy.summonTags) {
								for (let t of Enemy.summonTags) {
									if (!tags.includes(t)) tags.push(t);
								}
							}
							if (Enemy.summonTagsMulti) {
								for (let t of Enemy.summonTagsMulti) {
									tags.push(t);
								}
							}
						}
					}
				}
			}
		}
	}
}


function KinkyDungeonPlaceLore(width, height) {
	let loreList = [];

	// Populate the lore
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits) && KDRandom() < 0.6) loreList.push({x:X, y:Y});

	let count = 0;
	let maxcount = 2;
	while (loreList.length > 0) {
		let N = Math.floor(KDRandom()*loreList.length);
		KinkyDungeonGroundItems.push({x:loreList[N].x, y:loreList[N].y, name: "Lore"});
		count += 1;
		if (count >= maxcount)
			return count;
	}
	return count;
}

function KinkyDungeonPlaceHeart(width, height, Floor) {
	let heartList = [];

	// Populate the lore
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) heartList.push({x:X, y:Y});

	while (heartList.length > 0) {
		let N = Math.floor(KDRandom()*heartList.length);
		if (!KDGameData.HeartTaken) {
			KinkyDungeonGroundItems.push({x:heartList[N].x, y:heartList[N].y, name: "Heart"});
		}
		return true;
	}

}



// @ts-ignore
// @ts-ignore
// @ts-ignore
function KinkyDungeonPlaceShrines(shrinelist, shrinechance, shrineTypes, shrinecount, shrinefilter, ghostchance, manaChance, orbcount, filterTypes, Floor, width, height) {
	KinkyDungeonCommercePlaced = 0;


	let shrinePoints = new Map();

	for (let s of shrinelist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			shrinePoints.set(s.x + "," + s.y, true);
	}

	let maxcount = shrinecount + orbcount;


	let tablets = {
		//"Cursed": 0,
		"Determination": 0,
	};
	let tabletsAmount = {
		//"Cursed": 1,
		"Determination": 3,
	};
	for (let goddess of Object.keys(KinkyDungeonShrineBaseCosts)) {
		tablets[goddess] = 0;
		tabletsAmount[goddess] = Math.max(0, KinkyDungeonGoddessRep[goddess] / 5);
		maxcount += Math.floor(Math.max(0, KinkyDungeonGoddessRep[goddess] / 5));
	}


	if (shrinelist <= maxcount)
		// Populate the chests
		for (let X = 1; X < width; X += 1)
			for (let Y = 1; Y < height; Y += 1)
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KinkyDungeonStartPosition.x), Math.abs(Y - KinkyDungeonStartPosition.y)) > KinkyDungeonJailLeash
					&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
					// Check the 3x3 area
					let wallcount = 0;
					let adjcount = 0;
					let diagadj = 0;
					for (let XX = X-1; XX <= X+1; XX += 1)
						for (let YY = Y-1; YY <= Y+1; YY += 1) {
							if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X')) {
								wallcount += 1;
								// Adjacent wall
								if (XX == X || YY == Y) adjcount += 1;
							} else if (!(XX == X && YY == Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY))) {
								if (!(XX == X || YY == Y)) {// Diagonal floor. We check the adjacent floors around the diagonals to determine if this is an alcove or a passage
									if (XX == X + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X + 1, Y))) diagadj += 1;
									else if (XX == X - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X - 1, Y))) diagadj += 1;
									else if (YY == Y + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y + 1))) diagadj += 1;
									else if (YY == Y - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y - 1))) diagadj += 1;
								}
							}
						}

					if (wallcount == 7
						|| (wallcount >= 4 && (wallcount - adjcount - diagadj == 0 || (wallcount == 5 && adjcount == 2 && diagadj == 1) || (wallcount == 6 && adjcount == 3 && diagadj == 1))
							&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
							&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1')
							&& (!(KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X-1, Y) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1))
							&& (!(KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1)))) {
						if (!shrinePoints.get((X+1) + "," + (Y))
							&& !shrinePoints.get((X-1) + "," + (Y))
							&& !shrinePoints.get((X+1) + "," + (Y+1))
							&& !shrinePoints.get((X+1) + "," + (Y-1))
							&& !shrinePoints.get((X-1) + "," + (Y+1))
							&& !shrinePoints.get((X-1) + "," + (Y-1))
							&& !shrinePoints.get((X) + "," + (Y+1))
							&& !shrinePoints.get((X) + "," + (Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y+1))) {
							shrinelist.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y)});
							shrinePoints.set(X + "," + Y, true);
						}
					}


				} else if (KinkyDungeonMapGet(X, Y) == "R" || KinkyDungeonMapGet(X, Y) == "r")
					shrinelist.push({x:X, y:Y});

	// Truncate down to max chest count in a location-neutral way
	let count = 0;

	let orbs = 0;
	let list = [];
	let maxBoringness = Math.max(...KinkyDungeonBoringness);
	while (shrinelist.length > 0) {
		let N = Math.floor(KDRandom()*shrinelist.length);
		let chest = shrinelist[N];
		if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
		if (chest.boringness > 0)
			chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
		else
			chest.boringness = chest.boringness + 0.05 * KDRandom() * maxBoringness;
		if (chest.priority) {
			list.unshift(chest);
		} else list.push(chest);

		shrinelist.splice(N, 1);
	}
	list.sort((a, b) => {
		let boringa = a.boringness ? a.boringness : 0;
		let boringb = b.boringness ? b.boringness : 0;
		if (a.priority) boringa += 1000;
		if (b.priority) boringb += 1000;
		return boringb - boringa;

	});
	while (list.length > 0) {
		let N = 0;
		if (count <= shrinecount) {

			let shrine = list[N];
			if (count == shrinecount && KDRandom() > shrinechance)
				KinkyDungeonMapSet(shrine.x, shrine.y, 'a');
			else {
				let playerTypes = KinkyDungeonRestraintTypes(shrinefilter);
				/**
				 * @type {{type: string, drunk?: boolean}}
				 */
				let stype = shrineTypes.length < orbcount ? {type: "Orb"}
					: (shrineTypes.length == orbcount && playerTypes.length > 0 ?
						{type: playerTypes[Math.floor(KDRandom() * playerTypes.length)]}
						: KinkyDungeonGenerateShrine(Floor, filterTypes, manaChance));
				let type = stype.type;
				let tile = 'A';
				if (type != "Orb" && shrineTypes.includes(type) && (KDRandom() < 0.5 || type == "Commerce")) type = "";
				if (type == "Orb") {
					if (orbs < orbcount) {
						tile = 'O';
						orbs += 1;
					} else tile = 'o';
					if (KDAlreadyOpened(shrine.x, shrine.y)) {
						tile = 'o';
					}
					shrineTypes.push("Orb");
				} else if (type) {
					if (KDAlreadyOpened(shrine.x, shrine.y)) {
						tile = 'a';
					} else {
						KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Shrine", Name: type, drunk: stype.drunk});
					}
					shrineTypes.push(type);
				} else if (!shrineTypes.includes("Ghost") || KDRandom() < 0.5) {
					shrineTypes.push("Ghost");
					tile = 'G';
					KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Ghost"});
				} else tile = 'a';

				KinkyDungeonMapSet(shrine.x, shrine.y, tile);
				//console.log(`Placed ${type} in boringness ${KinkyDungeonBoringGet(shrine.x, shrine.y)}, prioritized? ${shrine.priority}`);
			}

			count += 1;
		} else for (let goddess of Object.keys(tablets)) {
			if (tablets[goddess] < tabletsAmount[goddess]) {
				let shrine = list[N];
				KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Tablet", Name: goddess, Light: 3, lightColor: 0x8888ff});
				KinkyDungeonMapSet(shrine.x, shrine.y, 'M');

				tablets[goddess] += 1;
			}
		}

		list.splice(N, 1);
	}
}


function KinkyDungeonPlaceChargers(chargerlist, chargerchance, litchargerchance, chargercount, Floor, width, height) {
	let chargerPoints = new Map();

	for (let s of chargerlist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			chargerPoints.set(s.x + "," + s.y, true);
	}


	if (chargerlist.length < chargercount)
		// Populate the chests
		for (let X = 1; X < width; X += 1)
			for (let Y = 1; Y < height; Y += 1)
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KinkyDungeonStartPosition.x), Math.abs(Y - KinkyDungeonStartPosition.y)) > KinkyDungeonJailLeash
					&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
					// Check the 3x3 area
					let wallcount = 0;
					let adjcount = 0;
					let diagadj = 0;
					for (let XX = X-1; XX <= X+1; XX += 1)
						for (let YY = Y-1; YY <= Y+1; YY += 1) {
							if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X')) {
								wallcount += 1;
								// Adjacent wall
								if (XX == X || YY == Y) adjcount += 1;
							} else if (!(XX == X && YY == Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY))) {
								if (!(XX == X || YY == Y)) {// Diagonal floor. We check the adjacent floors around the diagonals to determine if this is an alcove or a passage
									if (XX == X + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X + 1, Y))) diagadj += 1;
									else if (XX == X - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X - 1, Y))) diagadj += 1;
									else if (YY == Y + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y + 1))) diagadj += 1;
									else if (YY == Y - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y - 1))) diagadj += 1;
								}
							}
						}

					if (wallcount == 7 || wallcount == 0
						|| (wallcount >= 4 && (wallcount - adjcount - diagadj == 0 || (wallcount == 5 && adjcount == 2 && diagadj == 1) || (wallcount == 6 && adjcount == 3 && diagadj == 1))
							&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
							&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1')
							&& (!(KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X-1, Y) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1))
							&& (!(KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1)))) {
						if (!chargerPoints.get((X+1) + "," + (Y))
							&& !chargerPoints.get((X-1) + "," + (Y))
							&& !chargerPoints.get((X+1) + "," + (Y+1))
							&& !chargerPoints.get((X+1) + "," + (Y-1))
							&& !chargerPoints.get((X-1) + "," + (Y+1))
							&& !chargerPoints.get((X-1) + "," + (Y-1))
							&& !chargerPoints.get((X) + "," + (Y+1))
							&& !chargerPoints.get((X) + "," + (Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y+1))) {
							chargerlist.push({x:X, y:Y});
							chargerPoints.set(X + "," + Y, true);
						}
					}


				}

	// Truncate down to max chest count in a location-neutral way
	let count = 0;
	let list = [];
	while (chargerlist.length > 0) {
		let N = Math.floor(KDRandom()*chargerlist.length);
		let chest = chargerlist[N];
		if (chest.priority) {
			list.unshift(chest);
		} else list.push(chest);
		chargerlist.splice(N, 1);
	}
	while (list.length > 0) {
		let N = 0;
		if (count <= chargercount) {

			let charger = list[N];
			let tile = KDRandom() > chargerchance ? '-' : (KDRandom() < litchargerchance ? '=' : '+');

			if (tile != '-') {
				KinkyDungeonTilesSet("" + charger.x + "," +charger.y, {Type: "Charger", NoRemove: tile == '=', lightColor: KDChargerColor, Light: (tile == '=' ? KDChargerLight : undefined)});
			}

			KinkyDungeonMapSet(charger.x, charger.y, tile);

			count += (tile == '-' ? 0.4 : 1.0);
		}

		list.splice(N, 1);
	}
}

let KinkyDungeonCommercePlaced = 0;

/**
 *
 * @param {number} Floor
 * @param {number} manaChance
 * @param {string[]} filterTypes
 * @returns
 */
function KinkyDungeonGenerateShrine(Floor, filterTypes, manaChance) {
	let Params = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]];
	let drunk = !(KDRandom() < manaChance);

	if (Params.shrines) {

		let shrineWeightTotal = 0;
		let shrineWeights = [];

		for (let shrine of Params.shrines) {
			shrineWeights.push({shrine: shrine, weight: shrineWeightTotal});
			if (!filterTypes || !filterTypes.includes(shrine.Type)) {
				shrineWeightTotal += shrine.Weight;
				if (shrine.Type == "Commerce" && KinkyDungeonStatsChoice.has("Supermarket")) {
					shrineWeightTotal += 15; // Increase weight of shop shrines
				}
			}

		}

		let selection = KDRandom() * shrineWeightTotal;

		for (let L = shrineWeights.length - 1; L >= 0; L--) {
			if (selection > shrineWeights[L].weight) {
				return {type: shrineWeights[L].shrine.Type, drunk: drunk};
			}
		}
	}

	return {type: ""};
}


// @ts-ignore
function KinkyDungeonPlaceSpecialTiles(gaschance, gasType, Floor, width, height) {
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			// Happy Gas
			if (KinkyDungeonMapGet(X, Y) == '0') {
				let chance = 0;
				// Check the 3x3 area
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						if (!(XX == X && YY == Y) && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(XX, YY)))
							chance += gaschance;
					}

				if (KDRandom() < chance)
					KinkyDungeonMapSet(X, Y, gasType);
			}
}

// @ts-ignore
// @ts-ignore
// @ts-ignore
function KinkyDungeonPlaceBrickwork( brickchance, Floor, width, height) {
	// Populate the chests
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonMapGet(X, Y) == '0') {
				let chance = brickchance;
				// Check the 3x3 area
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						if (!(XX == X && YY == Y) && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(XX, YY)))
							chance += 0.01;
						if (KinkyDungeonMapGet(XX, YY) == 'A')
							chance += 0.5;
						else if (KinkyDungeonMapGet(XX, YY) == 'a')
							chance += 0.25;
					}

				if (KDRandom() < chance)
					KinkyDungeonMapSet(X, Y, '2');
			}
}

// @ts-ignore
// @ts-ignore
// @ts-ignore
function KinkyDungeonPlaceTraps( traps, traptypes, trapchance, doorlocktrapchance, Floor, width, height) {
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			let hosttile = KinkyDungeonMapGet(X, Y);
			let chance = KDTrappableNeighbors.includes(hosttile) ? trapchance * trapchance : (KDTrappableNeighborsLikely.includes(hosttile) ? trapchance : 0);
			// Check the 3x3 area
			if (chance > 0) {
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						let tile = KinkyDungeonMapGet(XX, YY);
						if (KinkyDungeonGroundTiles.includes(tile)) {
							if (KDRandom() < chance) {
								traps.push({x: XX, y: YY});
							}
						}
					}
			}
			if (hosttile == 'L' && KinkyDungeonStatsChoice.has("Nowhere") && KDRandom() < 0.25) {
				let tile = KinkyDungeonTilesGet(X + "," + Y) ? KinkyDungeonTilesGet(X + "," + Y) : {};
				KinkyDungeonTilesSet(X + "," + Y, Object.assign(tile, {
					Type: "Trap",
					Trap: tile.Furniture ? tile.Furniture + "Trap" : "BarrelTrap",
				}));
			}
		}
	for (let trap of traps) {
		if (KinkyDungeonMapGet(trap.x, trap.y) != 'T') {
			if ((KinkyDungeonMapGet(trap.x, trap.y) == 'D' || KinkyDungeonMapGet(trap.x, trap.y) == 'd') && KDRandom() < doorlocktrapchance) {
				if (KinkyDungeonTilesGet(trap.x + "," + trap.y)) {
					KinkyDungeonTilesGet(trap.x + "," + trap.y).StepOffTrap = "DoorLock";
					KinkyDungeonTilesGet(trap.x + "," + trap.y).Lock = undefined;
					for (let item of KinkyDungeonGroundItems) {
						if (item.x == trap.x && item.y == trap.y && item.name == "Gold") {
							KinkyDungeonGroundItems.splice(KinkyDungeonGroundItems.indexOf(item), 1);
						}
					}
				}
			} else {
				KinkyDungeonMapSet(trap.x, trap.y, 'T');
				let t = KinkyDungeonGetTrap(traptypes, Floor, []);
				let tile = KinkyDungeonTilesGet(trap.x + "," + trap.y);
				KinkyDungeonTilesSet(trap.x + "," + trap.y, {
					Type: "Trap",
					Trap: t.Name,
					Restraint: t.Restraint,
					Enemy: t.Enemy,
					Spell: t.Spell,
					Power: t.Power,
					OffLimits: tile?.OffLimits,
				});
			}
		}
	}


}

// @ts-ignore
function KinkyDungeonPlacePatrols(Count, width, height) {
	for (let i = 1; i <= Count; i++) {
		if (KinkyDungeonPatrolPoints.length < Count)
			for (let L = 1000; L > 0; L -= 1) { // Try up to 1000 times
				let X = Math.floor(i * width / (Count + 1)) + Math.floor(KDRandom() * width/(Count + 1));
				let Y = Math.floor(KDRandom()*height);
				if (!KinkyDungeonPointInCell(X, Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
					KinkyDungeonPatrolPoints.push({x: X, y: Y});
					break;
				}
			}
	}
}

/**
 *
 * @returns {number}
 */
function KDGetEffLevel() {
	let effLevel = MiniGameKinkyDungeonLevel + Math.round(KinkyDungeonDifficulty/5);
	if (KinkyDungeonNewGame) effLevel += KinkyDungeonMaxLevel;

	return effLevel;
}

/**
 * @returns {string}
 */
function KDRandomizeRedLock() {
	let level = KDGetEffLevel();
	if (KDRandom() < -0.1 + Math.min(0.5, level * 0.03)) return "Red_Hi";
	if (KDRandom() < 0.25 + Math.min(0.55, level * 0.03)) return "Red_Med";
	return "Red";
}

/**
 * Generates a lock
 * @param {boolean} [Guaranteed]
 * @param {number} [Floor]
 * @param {boolean} [AllowGold]
 * @param {string} [Type] - Used to customize the type
 * @returns {string}
 */
function KinkyDungeonGenerateLock(Guaranteed, Floor, AllowGold, Type) {
	let level = (Floor) ? Floor : MiniGameKinkyDungeonLevel;
	//let Params = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]];

	let chance = (level == 0) ? 0 : KinkyDungeonBaseLockChance;
	chance += KinkyDungeonScalingLockChance * level / KDLevelsPerCheckpoint;

	if (Guaranteed) chance = 1.0;

	let lock = undefined;

	if (KDRandom() < chance) {
		// Now we get the amount failed by
		// Default: red lock
		let locktype = KDRandom();
		let locktype2 = KDRandom();

		let modifiers = "";
		let bmax = KinkyDungeonBlueLockChanceScalingMax + Math.min(0.25, KinkyDungeonDifficulty * 0.002);
		let pmax = KinkyDungeonPurpleLockChanceScalingMax + Math.min(0.8, KinkyDungeonDifficulty * 0.004);
		let BlueChance = Math.min(KinkyDungeonBlueLockChance + (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.5 : 1.0) * level * KinkyDungeonBlueLockChanceScaling, (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.6 : 1.0) * bmax);
		let PurpleChance = Math.min(KinkyDungeonPurpleLockChance + (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.5 : 1.0) * level * KinkyDungeonPurpleLockChanceScaling, (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.6 : 1.0) * pmax);

		if (KinkyDungeonStatsChoice.get("HighSecurity")) {
			BlueChance *= 1.5;
			BlueChance += 0.05;
			PurpleChance *= 1.5;
			PurpleChance += 0.05;
		}
		if (locktype2 < PurpleChance && locktype2*PurpleChance > locktype*BlueChance) {
			lock =  "Purple" + modifiers;
		} else if (locktype < BlueChance) {
			let max = KinkyDungeonGoldLockChanceScalingMax + Math.min(0.4, KinkyDungeonDifficulty * 0.001);
			let GoldChance = Math.min(KinkyDungeonGoldLockChance + (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.6 : 1.0) * level * KinkyDungeonGoldLockChanceScaling, (KinkyDungeonStatsChoice.get("HighSecurity") ? 1.9 : 1.0) * max);

			if (AllowGold && KDRandom() < GoldChance) lock = "Gold" + modifiers;
			else lock = "Blue" + modifiers;
		} else {
			lock = KDRandomizeRedLock() + modifiers;
		}
	}
	if (Type == "Door") {
		if (lock.includes("Blue") || lock.includes("Gold")) lock = KDRandomizeRedLock();
	}

	return lock;
}

function KinkyDungeonPlaceDoors(doorchance, nodoorchance, doorlockchance, trapChance, grateChance, Floor, width, height) {
	let doorlist = [];
	let doorlist_2ndpass = [];
	let trapLocations = [];

	// Populate the doors
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && KinkyDungeonMapGet(X, Y) != 'D' && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
				// Check the 3x3 area
				let wallcount = 0;
				let up = false;
				let down = false;
				let left = false;
				let right = false;
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						let get = KinkyDungeonMapGet(XX, YY);
						if (!(XX == X && YY == Y) && (get == '1' || get == 'X' || get == 'C')) {
							wallcount += 1; // Get number of adjacent walls
							if (XX == X+1 && YY == Y && get == '1') right = true;
							else if (XX == X-1 && YY == Y && get == '1') left = true;
							else if (XX == X && YY == Y+1 && get == '1') down = true;
							else if (XX == X && YY == Y-1 && get == '1') up = true;
						} else if (get == 'D') // No adjacent doors
							wallcount = 100;
					}
				if (wallcount < 5 && ((up && down) != (left && right)) && KDRandom() > nodoorchance) { // Requirements: 4 doors and either a set in up/down or left/right but not both
					doorlist.push({x:X, y:Y});
					doorlist_2ndpass.push({x:X, y:Y});
				}
			}

	while (doorlist.length > 0) {
		let N = Math.floor(KDRandom()*doorlist.length);

		let door = doorlist[N];
		let X = door.x;
		let Y = door.y;

		let closed = KDRandom() < doorchance;
		KinkyDungeonMapSet(X, Y, (closed ? 'D' : 'd'));
		KinkyDungeonTilesSet("" + X + "," + Y, {Type: "Door"});
		if (closed && KDRandom() < doorlockchance && KinkyDungeonIsAccessible(X, Y)) {
			KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor);
		}

		doorlist.splice(N, 1);
	}

	while (doorlist_2ndpass.length > 0) {
		let N = Math.floor(KDRandom()*doorlist_2ndpass.length);
		let minLockedRoomSize = 12;
		let maxPlayerDist = 4;

		let door = doorlist_2ndpass[N];
		let X = door.x;
		let Y = door.y;

		let roomDoors = [];

		let trap = KDRandom() < trapChance;
		let grate = KDRandom() < grateChance;

		if ((trap || grate) && KinkyDungeonTilesGet(X + "," + Y) && !KinkyDungeonTilesGet(X + "," + Y).NoTrap && !KinkyDungeonTilesGet(X + "," + Y).OffLimits) {
			let accessible = KinkyDungeonGetAccessibleRoom(X, Y);

			if (accessible.length > minLockedRoomSize) {
				for (let a of accessible) {
					let split = a.split(',');
					let XX = parseInt(split[0]);
					let YY = parseInt(split[1]);
					let tileType = KinkyDungeonMapGet(XX, YY);
					if ((tileType == "D" || tileType == 'd') && !KinkyDungeonTilesGet(a).Lock && XX != X && YY != Y) {
						roomDoors.push({x: XX, y: YY});
					}
				}
				let rooms = [];
				let room2 = KinkyDungeonGetAccessibleRoom(X, Y);
				for (let ddoor of roomDoors) {
					rooms.push({door: ddoor, room: room2});
				}
				for (let room of rooms) {
					let success = room.room.length == accessible.length;
					for (let tile of accessible) {
						if (!room.room.includes(tile)) {
							success = false;
							break;
						}
					}
					if (success) {
						if (!KinkyDungeonTilesGet(room.door.x + "," + room.door.y).Lock && !KinkyDungeonTilesGet(X + "," + Y).Lock && !KinkyDungeonTilesGet(room.door.x + "," + room.door.y).NoTrap
							&& ((KinkyDungeonGetAccessibleRoom(X+1, Y).length != KinkyDungeonGetAccessibleRoom(X-1, Y).length
								&& KinkyDungeonIsReachable(X+1, Y, X, Y) && KinkyDungeonIsReachable(X-1, Y, X, Y))
							|| (KinkyDungeonGetAccessibleRoom(X, Y+1).length != KinkyDungeonGetAccessibleRoom(X, Y-1).length)
								&& KinkyDungeonIsReachable(X, Y+1, X, Y) && KinkyDungeonIsReachable(X, Y-1, X, Y))
							&& KinkyDungeonIsAccessible(X, Y)) {
							let lock = false;
							//console.log(X + "," + Y + " locked")
							if (trap && Math.max(Math.abs(room.door.x - KinkyDungeonPlayerEntity.x), Math.abs(room.door.y - KinkyDungeonPlayerEntity.y)) > maxPlayerDist) {
								// Place a trap or something at the other door if it's far enough from the player
								if (KDDebug)
									console.log("Trap at " + X + "," + Y);
								trapLocations.push({x: room.door.x, y: room.door.y});
								if (KDRandom() < 0.1) {
									let dropped = {x:room.door.x, y:room.door.y, name: "Gold", amount: 1};
									KinkyDungeonGroundItems.push(dropped);
								}
								lock = true;
							} else if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(room.door.x, room.door.y+1)) && ((grate && (!room.room || room.room.length > minLockedRoomSize))
									|| (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y+1)) && Math.max(Math.abs(room.door.x - KinkyDungeonPlayerEntity.x), Math.abs(room.door.y - KinkyDungeonPlayerEntity.y)) <= maxPlayerDist))
									&& room.door.y != KinkyDungeonStartPosition.y) {
								// Place a grate instead
								KinkyDungeonMapSet(room.door.x, room.door.y, 'g');
								lock = true;
							}
							if (lock) {
								KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor, false, "Door");
								KinkyDungeonMapSet(X, Y, 'D');
							}
						}
						break;
					}
				}
			}
		}
		doorlist_2ndpass.splice(N, 1);
	}
	return trapLocations;
}

function KinkyDungeonReplaceDoodads(Chance, barchance, wallRubblechance, wallhookchance, ceilinghookchance, width, height, altType) {
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < Chance)
				KinkyDungeonMapSet(X, Y, '4');
			else
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < wallRubblechance && !KinkyDungeonTilesSkin[X + "," + Y]) {
				KinkyDungeonMapSet(X, Y, 'Y');
				if (KDAlreadyOpened(X, Y)) {
					KinkyDungeonMapSet(X, Y, '1');
				}
			}

		}


	if (altType && !altType.noClutter) {
		// Make it so you dont ever move through square corners
		for (let X = 1; X < width - 1; X += 1)
			for (let Y = 1; Y < height - 1; Y += 1) {
				let tl = KinkyDungeonMapGet(X, Y);
				let tr = KinkyDungeonMapGet(X+1, Y);
				let bl = KinkyDungeonMapGet(X, Y+1);
				let br = KinkyDungeonMapGet(X+1, Y+1);
				if (tl == '1' && br == '1' && KinkyDungeonMovableTilesEnemy.includes(tr) && KinkyDungeonMovableTilesEnemy.includes(bl))
					KinkyDungeonMapSet(X, Y, 'X');
				else if (tr == '1' && bl == '1' && KinkyDungeonMovableTilesEnemy.includes(tl) && KinkyDungeonMovableTilesEnemy.includes(br))
					KinkyDungeonMapSet(X, Y+1, 'X');
			}

		for (let X = 1; X < width-1; X += 1)
			for (let Y = 1; Y < height-1; Y += 1) {
				if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < barchance
						&& ((KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X-1, Y) == '0' && KinkyDungeonMapGet(X+1, Y) == '0')
							|| (KinkyDungeonMapGet(X-1, Y) == '1' && KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X, Y-1) == '0' && KinkyDungeonMapGet(X, Y+1) == '0'))) {
					KinkyDungeonMapSet(X, Y, 'b');
				} else if ((KinkyDungeonMapGet(X, Y) == '2' || KinkyDungeonMapGet(X, Y) == '0') && (
					(KDRandom() < wallhookchance && KinkyDungeonMapGet(X-1, Y) == '1' && KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X+1, Y) == '0' && KinkyDungeonMapGet(X+1, Y-1) == '0' && KinkyDungeonMapGet(X+1, Y+1) == '0')
						|| (KDRandom() < wallhookchance && KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X-1, Y) == '0' && KinkyDungeonMapGet(X-1, Y-1) == '0' && KinkyDungeonMapGet(X-1, Y+1) == '0')
						|| (KDRandom() < wallhookchance && KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X, Y+1) == '0' && KinkyDungeonMapGet(X+1, Y+1) == '0' && KinkyDungeonMapGet(X-1, Y+1) == '0')
						|| (KDRandom() < wallhookchance && KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X, Y-1) == '0' && KinkyDungeonMapGet(X+1, Y-1) == '0' && KinkyDungeonMapGet(X-1, Y-1) == '0'))) {
					KinkyDungeonMapSet(X, Y-1, ','); // Wall hook
				} else if (KDRandom() < ceilinghookchance && (KinkyDungeonMapGet(X, Y) == '2' || KinkyDungeonMapGet(X, Y) == '0' &&
						(KinkyDungeonMapGet(X-1, Y) != '1'
						&& KinkyDungeonMapGet(X+1, Y) != '1'
						&& KinkyDungeonMapGet(X, Y-1) != '1'
						&& KinkyDungeonMapGet(X, Y+1) != '1'
						&& KinkyDungeonMapGet(X+1, Y+1) != '1'
						&& KinkyDungeonMapGet(X+1, Y-1) != '1'
						&& KinkyDungeonMapGet(X-1, Y+1) != '1'
						&& KinkyDungeonMapGet(X-1, Y-1) != '1'
						))) {
					KinkyDungeonMapSet(X, Y, '?'); // Ceiling hook
				}
			}
	}

}

function KinkyDungeonPlaceFurniture(barrelChance, cageChance, width, height, altType) {
	// Add special stuff
	if (!altType || !altType.noClutter)
		for (let X = 1; X < width-1; X += 1)
			for (let Y = 1; Y < height-1; Y += 1) {
				if (KinkyDungeonMapGet(X, Y) == '0' && !(KinkyDungeonTilesGet(X + "," + Y) && KinkyDungeonTilesGet(X + "," + Y).OffLimits)
					&& (KinkyDungeonMapGet(X+1, Y) != 'd' && KinkyDungeonMapGet(X+1, Y) != 'D'
						&& KinkyDungeonMapGet(X-1, Y) != 'd' && KinkyDungeonMapGet(X-1, Y) != 'D'
						&& KinkyDungeonMapGet(X, Y+1) != 'd' && KinkyDungeonMapGet(X, Y+1) != 'D'
						&& KinkyDungeonMapGet(X, Y-1) != 'd' && KinkyDungeonMapGet(X, Y-1) != 'D')
					&& ((KDRandom() < barrelChance*4 && KinkyDungeonMapGet(X-2, Y) == '1' && KinkyDungeonMapGet(X+2, Y) == '1' && KinkyDungeonMapGet(X, Y-2) == '1' && KinkyDungeonMapGet(X, Y+2) == '1')
						|| (KDRandom() < barrelChance*2 && KinkyDungeonMapGet(X-1, Y-1) == '1' && KinkyDungeonMapGet(X+1, Y-1) == '1' && KinkyDungeonMapGet(X-1, Y+1) == '1' && KinkyDungeonMapGet(X-1, Y+1) == '1')
						|| (KDRandom() < barrelChance && KinkyDungeonMapGet(X-1, Y) == '1' && KinkyDungeonMapGet(X+1, Y) == '0' && KinkyDungeonMapGet(X+1, Y-1) == '0' && KinkyDungeonMapGet(X+1, Y+1) == '0')
						|| (KDRandom() < barrelChance && KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X-1, Y) == '0' && KinkyDungeonMapGet(X-1, Y-1) == '0' && KinkyDungeonMapGet(X-1, Y+1) == '0')
						|| (KDRandom() < barrelChance && KinkyDungeonMapGet(X, Y-1) == '1' && KinkyDungeonMapGet(X, Y+1) == '0' && KinkyDungeonMapGet(X+1, Y+1) == '0' && KinkyDungeonMapGet(X-1, Y+1) == '0')
						|| (KDRandom() < barrelChance && KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '0' && KinkyDungeonMapGet(X+1, Y-1) == '0' && KinkyDungeonMapGet(X-1, Y-1) == '0'))) {
					KinkyDungeonMapSet(X, Y, 'L'); // Barrel
					if (KDRandom() < cageChance) {
						let furn = KDRandom() ? "Cage" : "DisplayStand";
						KinkyDungeonTilesSet(X + "," + Y, {Furniture: furn});
						KDGameData.JailPoints.push({x: X, y: Y, type: "furniture", radius: 1}); // , requireFurniture: true Standing in the cage alone will prevent jailbreak--good for stealth!
					}
				}
			}
}

let KDFood = [
	{
		Food: "",
		Weight: 10,
	},
	{
		Food: "Plate",
		Weight: 1,
	},
	{
		Food: "Cookies",
		Weight: 8,
	},
	{
		Food: "Pizza",
		Weight: 4,
	},
];

function KinkyDungeonPlaceFood(foodChance, width, height, altType) {

	if (altType && altType.noClutter) return;

	let foodPoints = new Map();
	let foodList = [];


	// Populate the chests
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KinkyDungeonStartPosition.x), Math.abs(Y - KinkyDungeonStartPosition.y)) > KinkyDungeonJailLeash
				&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits)) {
				// Check the 3x3 area
				let wallcount = 0;
				let adjcount = 0;
				let diagadj = 0;
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						if (!(XX == X && YY == Y) && (KinkyDungeonMapGet(XX, YY) == '1' || KinkyDungeonMapGet(XX, YY) == 'X')) {
							wallcount += 1;
							// Adjacent wall
							if (XX == X || YY == Y) adjcount += 1;
						} else if (!(XX == X && YY == Y) && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(XX, YY))) {
							if (!(XX == X || YY == Y)) {// Diagonal floor. We check the adjacent floors around the diagonals to determine if this is an alcove or a passage
								if (XX == X + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X + 1, Y))) diagadj += 1;
								else if (XX == X - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X - 1, Y))) diagadj += 1;
								else if (YY == Y + 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y + 1))) diagadj += 1;
								else if (YY == Y - 1 && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y - 1))) diagadj += 1;
							}
						}
					}

				if (wallcount == 7
					|| (wallcount >= 4 && (wallcount - adjcount - diagadj == 0 || (wallcount == 5 && adjcount == 2 && diagadj == 1) || (wallcount == 6 && adjcount == 3 && diagadj == 1))
						&& (KinkyDungeonMapGet(X+1, Y) == '1' || KinkyDungeonMapGet(X-1, Y) == '1')
						&& (KinkyDungeonMapGet(X, Y+1) == '1' || KinkyDungeonMapGet(X, Y-1) == '1')
						&& (!(KinkyDungeonMapGet(X+1, Y) == '1' && KinkyDungeonMapGet(X-1, Y) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1))
						&& (!(KinkyDungeonMapGet(X, Y+1) == '1' && KinkyDungeonMapGet(X, Y-1) == '1') || (wallcount == 6 && adjcount == 3 && diagadj == 1)))) {
					if (!foodPoints.get((X+1) + "," + (Y))
						&& !foodPoints.get((X-1) + "," + (Y))
						&& !foodPoints.get((X+1) + "," + (Y+1))
						&& !foodPoints.get((X+1) + "," + (Y-1))
						&& !foodPoints.get((X-1) + "," + (Y+1))
						&& !foodPoints.get((X-1) + "," + (Y-1))
						&& !foodPoints.get((X) + "," + (Y+1))
						&& !foodPoints.get((X) + "," + (Y-1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y-1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y-1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y-1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y+1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y+1))
						&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y+1))) {
						foodList.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y), priority: 0});
						foodPoints.set(X + "," + Y, true);
					}
				}


			} else if (KinkyDungeonMapGet(X, Y) == "R" || KinkyDungeonMapGet(X, Y) == "r")
				foodList.push({x:X, y:Y});

	// Truncate down to max chest count in a location-neutral way
	let count = 0;
	let list = [];
	let maxBoringness = Math.max(...KinkyDungeonBoringness);
	while (foodList.length > 0) {
		let N = Math.floor(KDRandom()*foodList.length);
		let chest = foodList[N];
		if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
		if (chest.boringness > 0)
			chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
		else
			chest.boringness = chest.boringness + 0.05 * KDRandom() * maxBoringness;
		if (chest.priority) {
			list.unshift(chest);
		} else list.push(chest);

		foodList.splice(N, 1);
	}
	list.sort((a, b) => {
		let boringa = a.boringness ? a.boringness : 0;
		let boringb = b.boringness ? b.boringness : 0;
		if (a.priority) boringa += 1000;
		if (b.priority) boringb += 1000;
		return boringb - boringa;

	});
	let foodcount = list.length * foodChance;
	while (list.length > 0) {
		let N = 0;
		if (count <= foodcount) {

			let shrine = list[N];
			let tile = 'F';
			let type = undefined;

			let WeightTotal = 0;
			let Weights = [];

			for (let obj of Object.values(KDFood)) {
				Weights.push({event: obj, weight: WeightTotal});
				WeightTotal += obj.Weight;
			}

			let selection = KDRandom() * WeightTotal;

			for (let L = Weights.length - 1; L >= 0; L--) {
				if (selection > Weights[L].weight) {
					type =  Weights[L].event.Food;
					break;
				}
			}

			KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Food: type, Type: "Food"});

			KinkyDungeonMapSet(shrine.x, shrine.y, tile);

			count += 1;
		}
		list.splice(N, 1);
	}
}
function KinkyDungeonPlaceTorches(torchchance, torchlitchance, torchchanceboring, width, height, altType, torchreplace) {
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			if (KinkyDungeonMapGet(X, Y) == '1'
				&& KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y + 1))
				&& !KinkyDungeonEffectTilesGet((X - 1) + "," + (Y+1))
				&& !KinkyDungeonEffectTilesGet((X) + "," + (Y+1))
				&& !KinkyDungeonEffectTilesGet((X + 1) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X - 1) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X + 1) + "," + (Y+1))
				&& KDRandom() < torchchance + KinkyDungeonBoringGet(X, Y) * torchchanceboring) {
				let spr = torchreplace ? torchreplace.sprite : "Torch";
				if ((!torchreplace || torchreplace.unlitsprite) && KDRandom() > torchlitchance) {
					spr = torchreplace ? torchreplace.unlitsprite : "TorchUnlit";
				}
				KDCreateEffectTile(X, Y + 1, {
					name: spr,
					duration: 9999,
				}, 0);
				//KinkyDungeonMapSet(X, Y, 't');
				//KinkyDungeonTilesSet(X + "," + Y, {Type: "Torch", Light: torchreplace ? torchreplace.brightness : KDTorchLight, Offset: true, Skin: torchreplace ? torchreplace.sprite : undefined});
			}
		}
}

/**
 * Replace vertical wall '1' with '|'
 * @param {number} width
 * @param {number} height
 */
function KinkyDungeonReplaceVert(width, height) {
	for (let X = 0; X <= width-1; X += 1)
		for (let Y = 0; Y <= height-1; Y += 1) {
			let tileUp = KinkyDungeonMapGet(X, Y);
			let tileBelow = KinkyDungeonMapGet(X, Y + 1);
			if (
				( // These are the tiles that get replaced
					tileUp == '1'
					|| tileUp == '4'
				) && ( // These are the tiles that trigger a replacement
					tileBelow == '1'
					|| tileBelow == '4'
					|| tileBelow == 'd'
					|| tileBelow == 'D'
					|| tileBelow == ','
				)) {
				// meep
			}
			//if (tileUp == '4')
			//KinkyDungeonMapSetForce(X, Y, '\\');
			//else
			//KinkyDungeonMapSetForce(X, Y, '|');
		}
}


function KinkyDungeonMazeWalls(Cell, Walls, WallsList) {
	if (Walls[(Cell.x+1) + "," + Cell.y]) WallsList[(Cell.x+1) + "," + Cell.y] = {x:Cell.x+1, y:Cell.y};
	if (Walls[(Cell.x-1) + "," + Cell.y]) WallsList[(Cell.x-1) + "," + Cell.y] = {x:Cell.x-1, y:Cell.y};
	if (Walls[Cell.x + "," + (Cell.y+1)]) WallsList[Cell.x + "," + (Cell.y+1)] = {x:Cell.x, y:Cell.y+1};
	if (Walls[Cell.x + "," + (Cell.y-1)]) WallsList[Cell.x + "," + (Cell.y-1)] = {x:Cell.x, y:Cell.y-1};
}

function KinkyDungeonMapSet(X, Y, SetTo, VisitedRooms) {
	let height = KinkyDungeonGridHeight;
	let width = KinkyDungeonGridWidth;

	if (X > 0 && X < width-1 && Y > 0 && Y < height-1) {
		KinkyDungeonGrid = KinkyDungeonGrid.replaceAt(X + Y*(width+1), SetTo);
		if (VisitedRooms)
			VisitedRooms.push({x: X, y: Y});
		return true;
	}
	return false;
}
function KinkyDungeonMapSetForce(X, Y, SetTo, VisitedRooms) {
	let width = KinkyDungeonGridWidth;

	KinkyDungeonGrid = KinkyDungeonGrid.replaceAt(X + Y*(width+1), SetTo);
	if (VisitedRooms)
		VisitedRooms.push({x: X, y: Y});
	return true;

}


function KinkyDungeonBoringGet(X, Y) {
	return KinkyDungeonBoringness[X + Y*(KinkyDungeonGridWidth)];
}

function KinkyDungeonBoringSet(X, Y, SetTo) {
	if (X >= 0 && X <= KinkyDungeonGridWidth-1 && Y >= 0 && Y <= KinkyDungeonGridHeight-1) {
		KinkyDungeonBoringness[X + Y*(KinkyDungeonGridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonMapGet(X, Y) {
	//let height = KinkyDungeonGrid.split('\n').length;
	//let width = //KinkyDungeonGrid.split('\n')[0].length;

	return KinkyDungeonGrid[X + Y*(KinkyDungeonGridWidth+1)];
}

function KinkyDungeonVisionSet(X, Y, SetTo) {
	if (X >= 0 && X <= KinkyDungeonGridWidth-1 && Y >= 0 && Y <= KinkyDungeonGridHeight-1) {
		KinkyDungeonVisionGrid[X + Y*(KinkyDungeonGridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonBrightnessSet(X, Y, SetTo, monotonic) {
	if (X >= 0 && X <= KinkyDungeonGridWidth-1 && Y >= 0 && Y <= KinkyDungeonGridHeight-1) {
		if (!monotonic || SetTo > KinkyDungeonBrightnessGrid[X + Y*(KinkyDungeonGridWidth)])
			KinkyDungeonBrightnessGrid[X + Y*(KinkyDungeonGridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonColorSet(X, Y, SetTo, monotonic) {
	if (X >= 0 && X <= KinkyDungeonGridWidth-1 && Y >= 0 && Y <= KinkyDungeonGridHeight-1) {
		if (!monotonic || SetTo > KinkyDungeonColorGrid[X + Y*(KinkyDungeonGridWidth)])
			KinkyDungeonColorGrid[X + Y*(KinkyDungeonGridWidth)] = SetTo;
		return true;
	}
	return false;
}
function KinkyDungeonShadowSet(X, Y, SetTo, monotonic) {
	if (X >= 0 && X <= KinkyDungeonGridWidth-1 && Y >= 0 && Y <= KinkyDungeonGridHeight-1) {
		if (!monotonic || SetTo > KinkyDungeonShadowGrid[X + Y*(KinkyDungeonGridWidth)])
			KinkyDungeonShadowGrid[X + Y*(KinkyDungeonGridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonVisionGet(X, Y) {
	return KinkyDungeonVisionGrid[X + Y*(KinkyDungeonGridWidth)];
}

function KinkyDungeonBrightnessGet(X, Y) {
	return KinkyDungeonBrightnessGrid[X + Y*(KinkyDungeonGridWidth)];
}
function KinkyDungeonColorGet(X, Y) {
	return KinkyDungeonColorGrid[X + Y*(KinkyDungeonGridWidth)];
}
function KinkyDungeonShadowGet(X, Y) {
	return KinkyDungeonShadowGrid[X + Y*(KinkyDungeonGridWidth)];
}

function KinkyDungeonFogGet(X, Y) {
	return KinkyDungeonFogGrid[X + Y*(KinkyDungeonGridWidth)];
}

let canvasOffsetX = 0;
let canvasOffsetY = 0;
const canvasOffsetX_ui = 500;
const canvasOffsetY_ui = 164;

// returns an object containing coordinates of which direction the player will move after a click, plus a time multiplier
function KinkyDungeonGetDirection(dx, dy) {

	let X = 0;
	let Y = 0;

	if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
		return {x:0, y:0, delta:1};

	// Cardinal directions first - up down left right
	if (dy > 0 && Math.abs(dx) < Math.abs(dy)/2.61312593) Y = 1;
	else if (dy < 0 && Math.abs(dx) < Math.abs(dy)/2.61312593) Y = -1;
	else if (dx > 0 && Math.abs(dy) < Math.abs(dx)/2.61312593) X = 1;
	else if (dx < 0 && Math.abs(dy) < Math.abs(dx)/2.61312593) X = -1;

	// Diagonals
	else if (dy > 0 && dx > dy/2.61312593) {Y = 1; X = 1;}
	else if (dy > 0 && -dx > dy/2.61312593) {Y = 1; X = -1;}
	else if (dy < 0 && dx > -dy/2.61312593) {Y = -1; X = 1;}
	else if (dy < 0 && -dx > -dy/2.61312593) {Y = -1; X = -1;}

	return {x:X, y:Y, delta:Math.round(Math.sqrt(X*X+Y*Y)*2)/2}; // Delta is always in increments of 0.5
}

// GetDirection, but it also pivots randomly 45 degrees to either side
function KinkyDungeonGetDirectionRandom(dx, dy) {
	let dir = KinkyDungeonGetDirection(dx, dy);
	let pivot = Math.floor(KDRandom()*3)-1;

	if (dir.x == 0 && dir.y == 1) dir.x = pivot;
	else if (dir.x == 0 && dir.y == -1) dir.x = -pivot;
	else if (dir.x == 1 && dir.y == 0) dir.y = pivot;
	else if (dir.x == -1 && dir.y == 0) dir.y = -pivot;
	else if (dir.x == 1 && dir.y == 1) {if (pivot == 1) {dir.y = 0;} else if (pivot == -1) {dir.x = 0;}}
	else if (dir.x == 1 && dir.y == -1) {if (pivot == 1) {dir.x = 0;} else if (pivot == -1) {dir.y = 0;}}
	else if (dir.x == -1 && dir.y == 1) {if (pivot == 1) {dir.x = 0;} else if (pivot == -1) {dir.y = 0;}}
	else if (dir.x == -1 && dir.y == -1) {if (pivot == 1) {dir.y = 0;} else if (pivot == -1) {dir.x = 0;}}

	dir.delta = Math.round(Math.sqrt(dir.x*dir.x+dir.y*dir.y)*2)/2;
	return dir; // Delta is always in increments of 0.5
}


let KinkyDungeonAutoWaitSuppress = false;

function KinkyDungeonControlsEnabled() {
	return !KinkyDungeonInspect && KinkyDungeonSlowMoveTurns < 1 && KinkyDungeonStatFreeze < 1 && KDGameData.SleepTurns < 1 && !KDGameData.CurrentDialog && !KinkyDungeonMessageToggle;
}

function KDStartSpellcast(tx, ty, SpellToCast, enemy, player, bullet) {
	let spell = KinkyDungeonFindSpell(SpellToCast.name, true);
	let spellname = undefined;
	if (spell) {
		spellname = spell.name;
		spell = undefined;
	} else spell = SpellToCast;
	return KDSendInput("tryCastSpell", {tx: tx, ty: ty, spell: spell, spellname: spellname, enemy: enemy, player: player, bullet: bullet});
}

// Click function for the game portion
// @ts-ignore
// @ts-ignore
// @ts-ignore
function KinkyDungeonClickGame(Level) {
	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	// @ts-ignore
	CharacterRefresh = () => {KDRefresh = true;};
	// @ts-ignore
	CharacterAppearanceBuildCanvas = () => {};

	// First we handle buttons
	let prevSpell = KinkyDungeonTargetingSpell;
	let prevInv = KinkyDungeonShowInventory;
	if (KDGameData.CurrentDialog) {
		let result = false;
		try {
			result = KDHandleDialogue();
		} finally {
			// @ts-ignore
			CharacterRefresh = _CharacterRefresh;
			// @ts-ignore
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
			// Done, converted to input
		}
		return result;
	}
	if (KinkyDungeonControlsEnabled() && KinkyDungeonHandleHUD()) {
		try {
			if (prevSpell) {
				if (prevInv) KDCloseQuickInv();
				else KinkyDungeonTargetingSpell = null;
			}
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			KinkyDungeonGameKey.keyPressed = [
				false,
				false,
				false,
				false,
				false,
				false,
				false,
				false,
			];
			if (KinkyDungeonAutoWaitSuppress) KinkyDungeonAutoWaitSuppress = false;
			else if (KinkyDungeonAutoWait) {
				KinkyDungeonAutoWait = false;
				if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Damage.ogg");
			}
		} finally {
			// @ts-ignore
			CharacterRefresh = _CharacterRefresh;
			// @ts-ignore
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		}
		return;
	}
	// beep
	else if (KinkyDungeonAutoWait && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)) {
		KinkyDungeonAutoWait = false;

		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Damage.ogg");
	}
	// If no buttons are clicked then we handle move
	else if (KinkyDungeonControlsEnabled() && KinkyDungeonDrawState == "Game") {
		try {

			if (KDModalArea || KinkyDungeonTargetTile) {
				KDModalArea = false;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
			} else {
				KinkyDungeonSetMoveDirection();

				if (KinkyDungeonTargetingSpell) {
					if (MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)) {
						if (KinkyDungeoCheckComponents(KinkyDungeonTargetingSpell).length == 0 || (
							(KinkyDungeonStatsChoice.get("Slayer") && KinkyDungeonTargetingSpell.school == "Elements")
							|| (KinkyDungeonStatsChoice.get("Conjurer") && KinkyDungeonTargetingSpell.school == "Conjure")
							|| (KinkyDungeonStatsChoice.get("Magician") && KinkyDungeonTargetingSpell.school == "Illusion"))) {
							if (KinkyDungeonSpellValid) {
								KDStartSpellcast(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonTargetingSpell, undefined, KinkyDungeonPlayerEntity, undefined);

								KinkyDungeonTargetingSpell = null;
							}
						} else KinkyDungeonTargetingSpell = null;
					} else KinkyDungeonTargetingSpell = null;
				} else if (KinkyDungeonIsPlayer() && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)) {
					let fastMove = KinkyDungeonFastMove && !KinkyDungeonToggleAutoSprint;
					if (fastMove && Math.max(Math.abs(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x), Math.abs(KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y)) > 1
						&& (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0 || KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0 || KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonTargetX, KinkyDungeonPlayerEntity.y - KinkyDungeonTargetY) < 1.5)) {
						let requireLight = KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0;
						let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY, false, false, false, KinkyDungeonMovableTilesEnemy, requireLight, false, true);
						if (path) {
							KinkyDungeonFastMovePath = path;
							KinkyDungeonSleepTime = 100;
						}
					} else if (!fastMove || Math.max(Math.abs(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x), Math.abs(KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y)) <= 1) {
						KDSendInput("move", {dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint});
					}
				}
			}
		} finally {
			// @ts-ignore
			CharacterRefresh = _CharacterRefresh;
			// @ts-ignore
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		}
	}

	// @ts-ignore
	CharacterRefresh = _CharacterRefresh;
	// @ts-ignore
	CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
	return;
}

function KinkyDungeonGetMovable() {
	let MovableTiles = KinkyDungeonMovableTiles;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Squeeze") > 0) MovableTiles = MovableTiles + "b";
	return MovableTiles;
}

function KinkyDungeonListenKeyMove() {
	if (KinkyDungeonLastMoveTimer < performance.now() && KinkyDungeonControlsEnabled() && KinkyDungeonDrawState == "Game") {
		let moveDirection = null;
		let moveDirectionDiag = null;

		let MovableTiles = KinkyDungeonGetMovable();

		if ((KinkyDungeonGameKey.keyPressed[0]) && MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x,  KinkyDungeonPlayerEntity.y - 1))) moveDirection = KinkyDungeonGetDirection(0, -1);
		else if ((KinkyDungeonGameKey.keyPressed[1]) && MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x,  KinkyDungeonPlayerEntity.y + 1))) moveDirection = KinkyDungeonGetDirection(0, 1);
		else if ((KinkyDungeonGameKey.keyPressed[2]) && MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x - 1,  KinkyDungeonPlayerEntity.y))) moveDirection = KinkyDungeonGetDirection(-1, 0);
		else if ((KinkyDungeonGameKey.keyPressed[3]) && MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + 1,  KinkyDungeonPlayerEntity.y))) moveDirection = KinkyDungeonGetDirection(1, 0);
		// Diagonal moves
		if ((KinkyDungeonGameKey.keyPressed[4]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[0])) moveDirectionDiag = KinkyDungeonGetDirection(-1, -1);
		else if ((KinkyDungeonGameKey.keyPressed[5]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[0])) moveDirectionDiag = KinkyDungeonGetDirection(1, -1);
		else if ((KinkyDungeonGameKey.keyPressed[6]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[1])) moveDirectionDiag = KinkyDungeonGetDirection(-1, 1);
		else if ((KinkyDungeonGameKey.keyPressed[7]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[1])) moveDirectionDiag = KinkyDungeonGetDirection(1, 1);

		if ((KinkyDungeonGameKey.keyPressed[8])) {moveDirection = KinkyDungeonGetDirection(0, 0); moveDirectionDiag = null;}

		if (moveDirectionDiag && MovableTiles.includes(KinkyDungeonMapGet(moveDirectionDiag.x + KinkyDungeonPlayerEntity.x,  moveDirectionDiag.y + KinkyDungeonPlayerEntity.y))) {
			moveDirection = moveDirectionDiag;
		}

		if (moveDirection) {
			if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimerStart > 0) {

				let _CharacterRefresh = CharacterRefresh;
				let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
				// @ts-ignore
				CharacterRefresh = () => {KDRefresh = true;};
				// @ts-ignore
				CharacterAppearanceBuildCanvas = () => {};

				try {
					KDSendInput("move", {dir: moveDirection, delta: 1, AllowInteract: KinkyDungeonLastMoveTimer == 0, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false});
					KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown;
				} finally {
					// @ts-ignore
					CharacterRefresh = _CharacterRefresh;
					// @ts-ignore
					CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
				}
			} else if (KinkyDungeonLastMoveTimerStart == 0) {
				KinkyDungeonLastMoveTimerStart = performance.now()+ KinkyDungeonLastMoveTimerCooldownStart;
			}


		}
	}
	if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimer == 0) KinkyDungeonLastMoveTimerStart = 0;
	if (!KinkyDungeonGameKey.keyPressed.some((element)=>{return element;})) { KinkyDungeonLastMoveTimer = 0;}
}

function KinkyDungeonGameKeyDown() {
	let moveDirection = null;

	if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKey)) {
		switch (KinkyDungeonKeybindingCurrentKey) {
			// Log, Passing, Door, Auto Struggle, Auto Pathfind
			case KinkyDungeonKeyToggle[0]: KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle; break;
			case KinkyDungeonKeyToggle[1]: KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass; break;
			case KinkyDungeonKeyToggle[2]: KinkyDungeonToggleAutoDoor = !KinkyDungeonToggleAutoDoor; break;
			case KinkyDungeonKeyToggle[3]: KinkyDungeonFastStruggle = !KinkyDungeonFastStruggle; break;
			case KinkyDungeonKeyToggle[4]: KinkyDungeonFastMove = !KinkyDungeonFastMove; break;
			case KinkyDungeonKeyToggle[5]: KinkyDungeonInspect = !KinkyDungeonInspect; break;
		}
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	}

	if (KinkyDungeonState == "TileEditor") {
		if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileU");
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileL");
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileD");
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileR");
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		}
	}

	if (KDGameData.CurrentDialog) return;
	if (!KinkyDungeonControlsEnabled()) return;


	if (moveDirection) {
		KDSendInput("move", {dir: moveDirection, delta: 1, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false});
		return true;
	// @ts-ignore
	} else if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKey)) {
		if (KinkyDungeonDrawState == "Magic") {
			if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
				KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
			}
			KinkyDungeonClickSpellChoice(KinkyDungeonKeySpell.indexOf(KinkyDungeonKeybindingCurrentKey), KinkyDungeonCurrentPage);
		} else {
			// @ts-ignore
			KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
			KinkyDungeonHandleSpell();
		}
		return true;
	} else if (KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
		// @ts-ignore
		KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
		KinkyDungeonRangedAttack();
		return true;
	} else if (KinkyDungeonKeyUpcast.includes(KinkyDungeonKeybindingCurrentKey)) {
		// @ts-ignore
		if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeyUpcast[0]) {
			KDSendInput("upcast", {});
		} else {
			KDSendInput("upcastcancel", {});
		}
		return true;
	} else if (KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKey)) {
		KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonKeySpellPage.includes(KinkyDungeonKeybindingCurrentKey)) {
		KDCycleSpellPage();
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
		KDSwitchWeapon();
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonState == "Stats") {
		if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("perks>");
		} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("perks<");
		}
	} else if (KinkyDungeonDrawState != "Restart" && KinkyDungeonDrawState != "Keybindings" && KinkyDungeonDrawState != "Perks2") {
		if (KinkyDungeonDrawState == "Inventory" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentPageInventory += 1;
			} else if (KinkyDungeonCurrentPageInventory > 0) {
				KinkyDungeonCurrentPageInventory -= 1;
			} else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonDrawState = "Game";
			}
		} else if (KinkyDungeonDrawState == "Magic" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentPage += 1;
				if (KinkyDungeonCurrentPage >= KinkyDungeonSpells.length) {
					KinkyDungeonCurrentPage = 0;
				}
			} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentPage > 0) {
				KinkyDungeonCurrentPage -= 1;
			} else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
				if (KinkyDungeonPreviewSpell) {
					if (KinkyDungeonPreviewSpell.hideLearned) KinkyDungeonDrawState = "MagicSpells";
					KDSendInput("spellLearn", {SpellName: KinkyDungeonPreviewSpell.name});
				}
				else KinkyDungeonDrawState = "MagicSpells";
			}
		} else if (KinkyDungeonDrawState == "MagicSpells" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentSpellsPage += 1;
				if (KinkyDungeonCurrentSpellsPage >= KinkyDungeonLearnableSpells.length) KinkyDungeonCurrentSpellsPage = 0;
			} else if (KinkyDungeonCurrentSpellsPage > 0) {
				KinkyDungeonCurrentSpellsPage -= 1;
			} else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonDrawState = "Game";
			}
		} else
		if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKey)) {
			switch (KinkyDungeonKeybindingCurrentKey) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Reputation" ? "Game" : "Reputation"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells"; break;
				case KinkyDungeonKeyMenu[4]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook"; break;
			}
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		}
	}
	KinkyDungeonKeybindingCurrentKey = '';
	return false;
}


function KinkyDungeonGameKeyUp(lastPress) {
	//if (KDGameData.CurrentDialog) return;
	//if (!KinkyDungeonControlsEnabled()) return;
	let delta = CommonTime() - lastPress;

	// Holding for a minute = fail
	if (delta > 60000) return;
	// tap = fail
	if (delta < 250) return;


	if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
		if (KinkyDungeonDrawState == "Game") {
			KinkyDungeonTargetingSpell = null;
		}
		return true;
	} else if (KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
		KinkyDungeonTargetingSpell = null;
		return true;
	} else if (KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
		KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonKeySpellPage.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
		KDCycleSpellPage(true);
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
		KDSwitchWeapon();
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonDrawState != "Restart" && KinkyDungeonDrawState != "Keybindings" && KinkyDungeonDrawState != "Perks2") {
		if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
			switch (KinkyDungeonKeybindingCurrentKeyRelease) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Reputation" ? "Game" : "Reputation"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells"; break;
				case KinkyDungeonKeyMenu[4]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook"; break;
			}
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
			switch (KinkyDungeonKeybindingCurrentKeyRelease) {
				// Log, Passing, Door, Auto Struggle, Auto Pathfind
				case KinkyDungeonKeyToggle[0]: KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle; break;
				case KinkyDungeonKeyToggle[1]: KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass; break;
				case KinkyDungeonKeyToggle[2]: KinkyDungeonToggleAutoDoor = !KinkyDungeonToggleAutoDoor; break;
				case KinkyDungeonKeyToggle[3]: KinkyDungeonFastStruggle = !KinkyDungeonFastStruggle; break;
				case KinkyDungeonKeyToggle[4]: KinkyDungeonFastMove = !KinkyDungeonFastMove; break;
				case KinkyDungeonKeyToggle[5]: KinkyDungeonInspect = !KinkyDungeonInspect; break;
			}
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Click.ogg");
			return true;
		}
	}
	KinkyDungeonKeybindingCurrentKey = '';
	return false;
}

function KinkyDungeonSendTextMessage(priority, text, color, time, noPush, noDupe, entity) {
	if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1) return false;
	if (text) {
		if (!noPush)
			if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1].text) {
				if (KDLogIndex > 0) KDLogIndex += 1;
				KinkyDungeonMessageLog.push({text: text, color: color, time: KinkyDungeonCurrentTick});
			}

		if ( priority >= KinkyDungeonTextMessagePriority || KinkyDungeonActionMessageTime < 0.5) {
			KinkyDungeonTextMessageTime = time;
			KinkyDungeonTextMessage = text;
			KinkyDungeonTextMessageColor = color;
			KinkyDungeonTextMessagePriority = priority;
			KinkyDungeonTextMessageNoPush = noPush;
			return true;
		}
	}
	return false;
}


function KinkyDungeonSendActionMessage(priority, text, color, time, noPush, noDupe, entity) {
	if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1) return false;
	if (text) {
		if (!noPush)
			if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1].text){
				if (KDLogIndex > 0) KDLogIndex += 1;
				KinkyDungeonMessageLog.push({text: text, color: color, time: KinkyDungeonCurrentTick});
			}
		if ( priority >= KinkyDungeonActionMessagePriority || KinkyDungeonActionMessageTime < 0.5) {
			KinkyDungeonActionMessageTime = time;
			KinkyDungeonActionMessage = text;
			KinkyDungeonActionMessageColor = color;
			KinkyDungeonActionMessagePriority = priority;
			KinkyDungeonActionMessageNoPush = noPush;
			return true;
		}
	}
	return false;
}

let KinkyDungeonNoMoveFlag = false;

function KDAttackCost() {
	let attackCost = KinkyDungeonStatStaminaCostAttack;
	if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.staminacost) attackCost = -KinkyDungeonPlayerDamage.staminacost;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")) {
		attackCost = Math.min(0, attackCost * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")));
	}
	return attackCost;
}

function KinkyDungeonLaunchAttack(Enemy, skip) {
	let attackCost = KDAttackCost();
	let capture = false;

	if (Enemy && KDHelpless(Enemy) && Enemy.hp < 0.52) {
		attackCost = 0;
		capture = true;
	}
	let noadvance = false;
	if (KinkyDungeonHasStamina(Math.abs(attackCost), true)) {
		if (!KDGameData.ConfirmAttack && (!KinkyDungeonAggressive(Enemy) || KDAllied(Enemy)) && !(Enemy.playWithPlayer && KDCanDom(Enemy))) {
			if ((!Enemy.lifetime || Enemy.lifetime > 9000) && !Enemy.Enemy.tags.notalk) { // KDAllied(Enemy)
				let d = Enemy.Enemy.specialdialogue ? Enemy.Enemy.specialdialogue : "GenericAlly";
				if (Enemy.specialdialogue) d = Enemy.specialdialogue; // Special dialogue override
				KDStartDialog(d, Enemy.Enemy.name, true, Enemy.personality, Enemy);
				noadvance = true;
			}
			/*} else if (KDEnemyHasFlag(Enemy, "Shop")) {
				for (let shop of KDShops) {
					if (KDEnemyHasFlag(Enemy, shop.name)) {
						KDStartDialog(shop.name, Enemy.Enemy.name, true, Enemy.personality, Enemy);
						noadvance = true;
						break;
					}
				}
				if (!KDGameData.CurrentDialog) {
					KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), "#ff0000", 1);
					KDGameData.ConfirmAttack = true;
					noadvance = true;
				}
			}*/
			else {
				KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), "#ff0000", 1);
				KDGameData.ConfirmAttack = true;
				noadvance = true;
			}

		} else {
			if (!capture) {
				if (attackCost < 0 && KinkyDungeonStatsChoice.has("BerserkerRage")) {
					KinkyDungeonChangeDistraction(0.7 - 0.5 * attackCost, false, 0.33);
				}
				KinkyDungeonAttackEnemy(Enemy, {
					damage: KinkyDungeonPlayerDamage.dmg,
					type: KinkyDungeonPlayerDamage.type,
					distract: KinkyDungeonPlayerDamage.distract,
					distractEff: KinkyDungeonPlayerDamage.distractEff,
					bind: KinkyDungeonPlayerDamage.bind,
					bindType: KinkyDungeonPlayerDamage.bindType,
					bindEff: KinkyDungeonPlayerDamage.bindEff,
					boundBonus: KinkyDungeonPlayerDamage.boundBonus,
					novulnerable: KinkyDungeonPlayerDamage.novulnerable,
					tease: KinkyDungeonPlayerDamage.tease});

				KinkyDungeonChangeStamina(attackCost, false, 1);
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "attack", 1);
			} else {
				KinkyDungeonAggro(Enemy, undefined, KinkyDungeonPlayerEntity);
				Enemy.hp = 0;
				KinkyDungeonKilledEnemy = Enemy;
				KinkyDungeonSendEvent("capture", {enemy: Enemy, attacker: KinkyDungeonPlayerEntity, skip: skip});
				KinkyDungeonChangeStamina(attackCost, false, 1);
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "capture", 1);
			}

			KinkyDungeonLastAction = "Attack";
			KDGameData.ConfirmAttack = false;
		}
	} else {
		KinkyDungeonWaitMessage();
	}

	if (!noadvance) {
		KinkyDungeonInterruptSleep();
		if (!skip)
			KinkyDungeonAdvanceTime(1);
	}
}

function KinkyDungeonMove(moveDirection, delta, AllowInteract, SuppressSprint) {
	let moveX = moveDirection.x + KinkyDungeonPlayerEntity.x;
	let moveY = moveDirection.y + KinkyDungeonPlayerEntity.y;
	let moved = false;
	let Enemy = KinkyDungeonEnemyAt(moveX, moveY);
	let allowPass = Enemy
		&& !Enemy.Enemy.immobile
		&& ((!KinkyDungeonAggressive(Enemy) && !Enemy.playWithPlayer) || (KDHelpless(Enemy)))
		&& (KinkyDungeonToggleAutoPass || KDEnemyHasFlag(Enemy, "passthrough") || (KinkyDungeonFlags.has("Passthrough")) || Enemy.Enemy.noblockplayer);
	if (Enemy && !allowPass) {
		if (AllowInteract) {
			KDDelayedActionPrune(["Action", "Attack"]);
			KinkyDungeonLaunchAttack(Enemy);
		}
	} else {
		let MovableTiles = KinkyDungeonGetMovable();
		let moveObject = KinkyDungeonMapGet(moveX, moveY);
		if (MovableTiles.includes(moveObject) && (KinkyDungeonNoEnemy(moveX, moveY) || (Enemy && Enemy.allied) || allowPass)) { // If the player can move to an empy space or a door
			KDGameData.ConfirmAttack = false;
			let quick = false;

			if (KinkyDungeonTilesGet("" + moveX + "," + moveY) && KinkyDungeonTilesGet("" + moveX + "," + moveY).Type && ((KinkyDungeonToggleAutoDoor && moveObject == 'd' && KinkyDungeonTargetTile == null && KinkyDungeonNoEnemy(moveX, moveY, true))
				|| (KinkyDungeonTilesGet("" + moveX + "," + moveY).Type != "Trap" && (KinkyDungeonTilesGet("" + moveX + "," + moveY).Type != "Door" || (KinkyDungeonTilesGet("" + moveX + "," + moveY).Lock && KinkyDungeonTilesGet("" + moveX + "," + moveY).Type == "Door"))))) {
				if (AllowInteract) {
					KDDelayedActionPrune(["Action", "World"]);
					KinkyDungeonTargetTileLocation = "" + moveX + "," + moveY;
					KinkyDungeonTargetTile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);
					if (moveObject == 'd') {
						KinkyDungeonCloseDoor({targetTile: KinkyDungeonTargetTileLocation});
					} else {
						KinkyDungeonTargetTileMsg();
					}

				}
			} else if (moveX != KinkyDungeonPlayerEntity.x || moveY != KinkyDungeonPlayerEntity.y) {
				KDDelayedActionPrune(["Action", "Move"]);
				let newDelta = 1;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				if (!KinkyDungeonHandleMoveObject(moveX, moveY, moveObject)) {// Move
					// We can pick up items inside walls, in case an enemy drops it into bars
					KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
					KinkyDungeonNoMoveFlag = false;
					KinkyDungeonConfirmStairs = false;
					KinkyDungeonSendEvent("beforeMove", {x:moveX, y:moveY});
					if (!KinkyDungeonNoMoveFlag) {
						//if (KinkyDungeonHasStamina(0)) { // You can only move if your stamina is > 0
						KinkyDungeonMovePoints = Math.min(Math.ceil(KinkyDungeonSlowLevel + 1), KinkyDungeonMovePoints + delta); // Can't store extra move points

						if (KinkyDungeonFlags.has("Quickness") && KinkyDungeonSlowLevel < 9) {
							KinkyDungeonMovePoints = 1;
							quick = true;
						}

						if (KinkyDungeonStatBind) KinkyDungeonMovePoints = 0;

						if (KinkyDungeonMovePoints >= 1) {// Math.max(1, KinkyDungeonSlowLevel) // You need more move points than your slow level, unless your slow level is 1
							if (Enemy && allowPass) {
								KDMoveEntity(Enemy, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true);
								if (KinkyDungeonFlags.has("Passthrough"))
									KinkyDungeonSetFlag("Passthrough", 2);
							}
							newDelta = Math.max(newDelta, KinkyDungeonMoveTo(moveX, moveY, SuppressSprint));
							KinkyDungeonLastAction = "Move";
							moved = true;
							if (KinkyDungeonSound) {
								if (quick) {
									KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/Miss.ogg");
								} else {
									if (moveObject == 'w')
										KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/FootstepWater.ogg");
									else KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "/Audio/Footstep.ogg");
								}

							}

							if (moveObject == 'g') {
								KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonGrateEnter"), "white", 3);
								KinkyDungeonSlowMoveTurns = Math.max(KinkyDungeonSlowMoveTurns, 1);
								KDGameData.SleepTurns = CommonTime() + 250;
							}
						}

						// Messages to inform player they are slowed
						let plugLevel = Math.round(Math.min(3, KinkyDungeonStatPlugLevel));
						let dict = KinkyDungeonPlugCount > 1 ? "plugs" : "plug";
						let dicts = KinkyDungeonPlugCount > 1 ? "" : "s";
						if (KinkyDungeonSlowLevel == 0 && KinkyDungeonPlugCount > 0) KinkyDungeonSendTextMessage(0, TextGet("KinkyDungeonPlugWalk" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
						if (KinkyDungeonSlowLevel == 1 && !KinkyDungeonStatsChoice.has("HeelWalker")) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonSlowed" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
						else if (KinkyDungeonSlowLevel == 2) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHopping" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "orange", 2, true);
						else if (KinkyDungeonSlowLevel == 3) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonInching" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff0000", 2, true);
						else if (KinkyDungeonSlowLevel > 3 && KinkyDungeonSlowLevel < 10) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrawling" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff0000", 2, true);
						else if (KinkyDungeonSlowLevel >= 10) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCantMove" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff0000", 2, true);

						let moveMult = Math.max(1, KinkyDungeonSlowLevel);

						if (KinkyDungeonStatsChoice.has("Quickness")) {
							KinkyDungeonSetFlag("BlockQuicknessPerk", 3 + moveMult);
						}
						if (quick) moveMult = 1;
						if (KinkyDungeonSlowLevel > 9) moveMult = 1;
						if ((moveDirection.x != 0 || moveDirection.y != 0)) {
							if (KinkyDungeonSlowLevel > 1 || (!KinkyDungeonStatsChoice.has("HeelWalker") && KinkyDungeonSlowLevel > 0)) {
								if (KinkyDungeonSlowLevel < 10) {
									KinkyDungeonChangeStamina(moveMult * (KinkyDungeonStatStaminaRegenPerSlowLevel * KinkyDungeonSlowLevel) * delta, false, moveMult, true);
								}
							}
							let plugIncreaseAmount = (KinkyDungeonStatPlugLevel * KinkyDungeonDistractionPerPlug * moveMult);
							KinkyDungeonStatDistraction += plugIncreaseAmount;
							if (plugIncreaseAmount > 0) KinkyDungeonStatDistractionLower += plugIncreaseAmount * 0.33;
							if (KinkyDungeonHasCrotchRope) {
								if (KinkyDungeonStatPlugLevel == 0) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrotchRope"), "pink", 2);
								KinkyDungeonStatDistraction += (KinkyDungeonCrotchRopeDistraction * moveMult);

								if (moveMult > 0) KinkyDungeonStatDistractionLower += (KinkyDungeonCrotchRopeDistraction * moveMult) * 0.33;
							}
							//if (KinkyDungeonVibeLevel == 0 && KinkyDungeonStatPlugLevel > 0 && !KinkyDungeonHasCrotchRope) KinkyDungeonStatDistraction += KDGetDistractionRate(delta) * delta;
						} else if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax) {
							KinkyDungeonWaitMessage();
						}
						KinkyDungeonMovePoints = Math.min(KinkyDungeonMovePoints + 1, 0);

						if (moveObject == 'R') {
							if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Coins.ogg");
							KinkyDungeonLoot(MiniGameKinkyDungeonLevel, MiniGameKinkyDungeonCheckpoint, "rubble");

							KinkyDungeonMapSet(moveX, moveY, 'r');
							KinkyDungeonAggroAction('rubble', {});
						}
						//}
					}

				}
				KinkyDungeonInterruptSleep();
				//for (let d = 0; d < newDelta; d++)
				// KinkyDungeonAdvanceTime(1, false, d != 0); // was moveDirection.delta, but became too confusing
				if (newDelta > 1 && newDelta < 10 && !quick) {
					KinkyDungeonSlowMoveTurns = newDelta -1;
					KinkyDungeonSleepTime = CommonTime() + 200;
				}
				KinkyDungeonAdvanceTime(quick ? 0 : 1);
			} else {
				KinkyDungeonMovePoints = Math.min(KinkyDungeonMovePoints + 1, 0);
				KinkyDungeonWaitMessage();
				KinkyDungeonAdvanceTime(1); // was moveDirection.delta, but became too confusing
			}
		} else if (KinkyDungeonGroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
			// We can pick up items inside walls, in case an enemy drops it into bars
			KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
			KinkyDungeonInterruptSleep();
			KinkyDungeonAdvanceTime(1);
		} else { // If we are blind we can bump into walls!
			if (KinkyDungeonGetVisionRadius() <= 1) {
				if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Footstep.ogg");
				KinkyDungeonSendActionMessage(2, TextGet("KDWallBump"), "white", 2);
				KinkyDungeonInterruptSleep();
				KinkyDungeonAdvanceTime(1);
			}
		}
	}

	KinkyDungeonLastMoveDirection = moveDirection;

	return moved;
}

function KinkyDungeonWaitMessage(NoTime) {
	if (!KinkyDungeonAutoWait) {
		if (KinkyDungeonStatWillpowerExhaustion > 1) KinkyDungeonSendActionMessage(3, TextGet("WaitSpellExhaustion"), "orange", 2);
		else if (!KinkyDungeonHasStamina(2.5, false)) KinkyDungeonSendActionMessage(1, TextGet("WaitExhaustion"
			+ (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.33 ?
				((KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.67 ?
					"ArousedHeavy"
					: "Aroused"))
					: "")), "yellow", 2);
		else KinkyDungeonSendActionMessage(1, TextGet("Wait" + (KinkyDungeonStatDistraction > 12 ? "Aroused" : "")), "silver", 2);
	}

	if (!NoTime && KinkyDungeonStatStamina < KinkyDungeoNStatStaminaLow)
		KinkyDungeonStatStamina += KinkyDungeonStatStaminaRegenWait;

	KinkyDungeonLastAction = "Wait";
	KinkyDungeonTrapMoved = false;
}


// Returns th number of turns that must elapse
function KinkyDungeonMoveTo(moveX, moveY, SuppressSprint) {
	//if (KinkyDungeonNoEnemy(moveX, moveY, true)) {
	let stepOff = false;
	let xx = KinkyDungeonPlayerEntity.x;
	let yy = KinkyDungeonPlayerEntity.y;
	if (KinkyDungeonPlayerEntity.x != moveX || KinkyDungeonPlayerEntity.y != moveY) {
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerBuffs, "move", 1);
		stepOff = true;
	}
	if (xx != moveX || yy != moveY) {
		KinkyDungeonTrapMoved = true;
	}
	let willSprint = KinkyDungeonToggleAutoSprint && (xx != moveX || yy != moveY) && !SuppressSprint;
	let cencelled = KDMovePlayer(moveX, moveY, true, willSprint);

	if (stepOff) KinkyDungeonHandleStepOffTraps(xx, yy, moveX, moveY);

	KinkyDungeonMovePoints = 0;
	KinkyDungeonSetFlag("Quickness", 0);
	if (KinkyDungeonStatsChoice.has("Quickness")) {
		KinkyDungeonSetFlag("BlockQuicknessPerk", 4);
	}
	if (!cencelled && willSprint) {
		if (KDCanSprint()) {
			let unblocked = KinkyDungeonSlowLevel > 1;
			if (!unblocked) {
				let nextPosX = moveX*2 - xx;
				let nextPosY = moveY*2 - yy;
				let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
				if (KinkyDungeonMovableTilesEnemy.includes(nextTile) && KinkyDungeonNoEnemy(nextPosX, nextPosY)) {
					unblocked = true;
				}
			}
			if (unblocked) {
				let sprintCostMult = KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SprintEfficiency"));
				KinkyDungeonChangeStamina((-KDSprintCost - KDSprintCostSlowLevel[Math.round(KinkyDungeonSlowLevel)]) * sprintCostMult, false, 1);
				KinkyDungeonSendActionMessage(5, TextGet("KDSprinting" + (KinkyDungeonSlowLevel > 1 ? "Hop" : "")), "lightgreen", 2);
				if (KinkyDungeonSlowLevel < 2) {
					// Move faster
					KDMovePlayer(moveX*2 - xx, moveY*2 - yy, true);
				}
			}

			return 1;
		}
	}
	return Math.max(1, KinkyDungeonSlowLevel);
	//}
	//return 0;
}

function KDCanSprint() {
	return KinkyDungeonSlowLevel < 4 && KinkyDungeonHasStamina(KDSprintCost + KDSprintCostSlowLevel[Math.round(KinkyDungeonSlowLevel)]) && KinkyDungeonCanStand();
}

let KinkyDungeonLastAction = "";
let KinkyDungeonLastTurnAction = "";
let KDDrawUpdate = 0;
let KDVisionUpdate = 0;

let KDLastTick = 0;

function KinkyDungeonAdvanceTime(delta, NoUpdate, NoMsgTick) {

	KDLastTick = performance.now();

	if (delta > 0 && CommonTime() > lastFloaterRefresh + 1000) {
		KDEntitiesFloaterRegisty = new Map();
		lastFloaterRefresh = CommonTime();
	}


	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	// @ts-ignore
	CharacterRefresh = () => {KDRefresh = true;};
	// @ts-ignore
	CharacterAppearanceBuildCanvas = () => {};
	let start = performance.now();

	for (let inv of KinkyDungeonAllRestraint()) {
		if (inv.lock && KDLocks[inv.lock] && KDLocks[inv.lock].levelStart) {
			KDLocks[inv.lock].levelStart(inv);
		}
	}

	if (KinkyDungeonMovePoints < -1 && KDGameData.KinkyDungeonLeashedPlayer < 1) KinkyDungeonMovePoints += delta;
	if (delta > 0) {
		KDDrawUpdate = delta;
		KDVisionUpdate = delta;
	}
	KDRecentRepIndex = 0;
	KinkyDungeonRestraintAdded = false;
	KinkyDungeonSFX = [];
	KDPlayerHitBy = [];

	//if (KinkyDungeonMovePoints < 0 && KinkyDungeonStatBind < 1) KinkyDungeonMovePoints = 0;
	KinkyDungeonUpdateAngel(delta);

	KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);

	KinkyDungeonResetEventVariablesTick(delta);
	KinkyDungeonSendEvent("tick", {delta: delta});

	// Here we move enemies and such
	KinkyDungeonUpdateLightGrid = true;
	if (!NoMsgTick) {
		if (KinkyDungeonTextMessageTime > 0) KinkyDungeonTextMessageTime -= 1;
		if (KinkyDungeonTextMessageTime <= 0) KinkyDungeonTextMessagePriority = 0;
		if (KinkyDungeonActionMessageTime > 0) KinkyDungeonActionMessageTime -= 1;
		if (KinkyDungeonActionMessageTime <= 0) KinkyDungeonActionMessagePriority = 0;
	}

	// Updates the character's stats
	KinkyDungeonCurrentTick += 1;
	if (KinkyDungeonCurrentTick > 100000) KinkyDungeonCurrentTick = 0;
	KinkyDungeonItemCheck(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, MiniGameKinkyDungeonLevel); //console.log("Item Check " + (performance.now() - now));
	KinkyDungeonUpdateBuffs(delta);
	KinkyDungeonUpdateEnemies(delta, true); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: true});
	KinkyDungeonUpdateBullets(delta, true); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta); //console.log("Bullet Check " + (performance.now() - now));
	KinkyDungeonUpdateEnemies(delta, false); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: false});

	KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);
	KinkyDungeonUpdateBullets(delta); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta, true); //"catchup" phase for explosions!

	KinkyDungeonUpdateJailKeys();

	KinkyDungeonUpdateTileEffects(delta);
	KDUpdateEffectTiles(delta);
	for (let E = 0; E < KinkyDungeonEntities.length; E++) {
		let enemy = KinkyDungeonEntities[E];
		if (KinkyDungeonEnemyCheckHP(enemy, E)) { E -= 1; continue;}
	}

	KinkyDungeonUpdateStats(delta);

	let toTile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	KinkyDungeonHandleMoveToTile(toTile);
	// else if (KinkyDungeonStatWillpower == 0) {
	// KinkyDungeonState = "Lose";
	//}

	// Handle delayed actions
	if (!KDGameData.DelayedActions) KDGameData.DelayedActions = [];
	for (let action of KDGameData.DelayedActions) {
		action.time -= delta;
		if (action.time <= 0) {
			if (KDDelayedActionCommit[action.commit]) {
				KDDelayedActionCommit[action.commit](action);
			}
		} else if (action.update && KDDelayedActionUpdate[action.update]) {
			KDDelayedActionUpdate[action.update](action);
		}
	}

	// Tim actions that have happened
	KDGameData.DelayedActions = KDGameData.DelayedActions.filter((action) => {
		return action.time > 0;
	});

	if (!NoUpdate)
		KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);

	if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax * 0.5) {
		let msg = "KinkyDungeonStaminaWarningMed";
		if (KinkyDungeonStatStamina < 5) msg = "KinkyDungeonStaminaWarningLow";
		if (KinkyDungeonStatStamina < 2.5) msg = "KinkyDungeonStaminaWarningNone";
		if (!KinkyDungeonSendActionMessage(1, TextGet(msg), "#ff8800", 1, true))
			KinkyDungeonSendTextMessage(1, TextGet(msg), "#ff8800", 1, true);
	}
	let gagchance = KinkyDungeonGagMumbleChance;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv))
			gagchance += KinkyDungeonGagMumbleChancePerRestraint;
	}
	if (!KinkyDungeonCanTalk() && KDRandom() < gagchance) {
		let msg = "KinkyDungeonGagMumble";
		let gagMsg = Math.floor(KDRandom() * 5);
		const GagEffect = -2 + SpeechGetGagLevel(KinkyDungeonPlayer, ["ItemMouth", "ItemMouth2", "ItemMouth3"]);
		gagMsg += GagEffect/3;
		gagMsg = Math.max(0, Math.min(7, Math.floor(gagMsg)));

		if (KDRandom() < KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax) msg = "KinkyDungeonGagMumbleAroused";

		msg = msg + gagMsg;

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), "#ffffff", 2, 0);
	}
	let end = performance.now();
	if (KDDebug) console.log(`Tick ${KinkyDungeonCurrentTick} took ${(end - start)} milliseconds.`);

	KinkyDungeonLastTurnAction = KinkyDungeonLastAction;
	KinkyDungeonLastAction = "";

	if (KDGameData.AncientEnergyLevel > 1) KDGameData.AncientEnergyLevel = 1;

	KinkyDungeonUpdateBulletVisuals(delta);

	// @ts-ignore
	CharacterRefresh = _CharacterRefresh;
	// @ts-ignore
	CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;

	if (KinkyDungeonInDanger()) KinkyDungeonSetFlag("DangerFlag",  3);
	if (KinkyDungeonStatsChoice.has("Quickness") && !KinkyDungeonFlags.has("BlockQuicknessPerk")) {
		KinkyDungeonSetFlag("Quickness", -1);
	}

	if (KinkyDungeonMovePoints < 0 || KinkyDungeonStatBlind) {
		KinkyDungeonSetFlag("Quickness", 0);
	}
	KinkyDungeonSendEvent("tickAfter", {delta: delta});

	KinkyDungeonUpdateStats(0);

	KinkyDungeonDressPlayer();
	KDGetEnemyCache();

	KDAllowDialogue = true;
}
let KDAllowDialogue = true;

let lastFloaterRefresh = 0;

function KinkyDungeonTargetTileMsg() {
	if (KDObjectMessages[KinkyDungeonTargetTile.Type]) {
		KDObjectMessages[KinkyDungeonTargetTile.Type]();
	} else if (KinkyDungeonTargetTile.Lock) {
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Locked.ogg");
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObjectLock").replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name)), "white", 1, false, true);
	} else {
		let suff = "";
		if (KinkyDungeonTargetTile.Name == "Commerce") suff = "Commerce";
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObject" + KinkyDungeonTargetTile.Type + suff).replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name)), "white", 1);
	}
}

/**
 * Sets an item in the character appearance
 * @param {Character} C - The character whose appearance should be changed
 * @param {string} Group - The name of the corresponding groupr for the item
 * @param {Asset|null} ItemAsset - The asset collection of the item to be changed
 * @param {string|string[]} NewColor - The new color (as "#xxyyzz" hex value) for that item
 * @param {number} [DifficultyFactor=0] - The difficulty, on top of the base asset difficulty, that should be assigned
 * to the item
 * @param {number} [ItemMemberNumber=-1] - The member number of the player adding the item - defaults to -1
 * @param {boolean} [Refresh=true] - Determines, wether the character should be redrawn after the item change
 * @param {item} [item] - The item, to pass to the event
 * @returns {Item} - the item itself
 */
function KDAddAppearance(C, Group, ItemAsset, NewColor, DifficultyFactor, ItemMemberNumber, Refresh, item) {
	DifficultyFactor = 0;

	// Unlike the stock function, we do NOT remove the previous one
	let data = {
		color: NewColor,
		item: item,
	};

	KinkyDungeonSendEvent("onWear", data);

	// Add the new item to the character appearance
	if (ItemAsset != null) {
		/** @type {Item} */
		const NA = {
			Asset: ItemAsset,
			Difficulty: parseInt((ItemAsset.Difficulty == null) ? 0 : ItemAsset.Difficulty) + parseInt(DifficultyFactor),
			Color: data.color,
			Property: ItemAsset.CharacterRestricted ? {ItemMemberNumber: ItemMemberNumber == null ? -1 : ItemMemberNumber} : undefined
		};
		C.Appearance.push(NA);
		return NA;
	}
	return null;
}

function KinkyDungeonCloseDoor(data) {
	KinkyDungeonTargetTileLocation = data.targetTile;
	KinkyDungeonTargetTile = null;
	KinkyDungeonMapSet(parseInt(KinkyDungeonTargetTileLocation.split(',')[0]), parseInt(KinkyDungeonTargetTileLocation.split(',')[1]), "D");
	KinkyDungeonTargetTileLocation = "";
	if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/DoorClose.ogg");
	if (!KDLastKeyTime[KinkyDungeonKeyToggle[2]])
		KinkyDungeonToggleAutoDoor = false;
	KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonCloseDoorDone"), "white", 2);
	KinkyDungeonAdvanceTime(1, true);
	KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);
}

/**
 * @type {Map<string, entity>}
 */
let KDEnemyCache = null;
let KDUpdateEnemyCache = true;

function KDGetEnemyCache() {
	if (KDUpdateEnemyCache || !KDEnemyCache) {
		KDUpdateEnemyCache = false;
		KDEnemyCache = new Map();
		for (let e of KinkyDungeonEntities) {
			KDEnemyCache.set(e.x + "," + e.y, e);
		}
	}
	return KDEnemyCache;
}

let KDTileQuery = "";
let KDTileLast = null;

/**
 *
 * @param {number} [x]
 * @param {number} [y]
 */
function KDTile(x, y) {
	if (x == undefined) x = KinkyDungeonPlayerEntity.x;
	if (y == undefined) y = KinkyDungeonPlayerEntity.y;
	let q = x + "," + y;
	if (q == KDTileQuery) return KDTileLast;
	else {
		let t = KinkyDungeonTilesGet(q);
		KDTileLast = t;
		KDTileQuery = q;
		return t;
	}
}

/**
 *
 * @param {number} [x]
 * @param {number} [y]
 */
function KDTileDelete(x, y) {
	if (x == undefined) x = KinkyDungeonPlayerEntity.x;
	if (y == undefined) y = KinkyDungeonPlayerEntity.y;
	KinkyDungeonTilesDelete(x + "," + y);
}

/**
 * Stuns the player for [turns] turns
 * @param {number} turns
 */
function KDStunTurns(turns) {
	KinkyDungeonSlowMoveTurns = Math.max(KinkyDungeonSlowMoveTurns, turns);
	KinkyDungeonSleepTime = CommonTime() + 200;
}
