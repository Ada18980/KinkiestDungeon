"use strict";


let KDFocusableTextFields = [
	"PerksFilter",
	"InvFilter",
	"OptionFilter",
	"ConsentFilter",
	"CollFilter",
	"QInvFilter",
	"MagicFilter",
	"RenameNPC",
	"PlayerNameField",
];

let KDSlowedSprintCost = 5.0;

let KDMAXGODDESSQUESTS = 3;

let KDBalanceSprintMult = 3;
let KDBalanceInertiaMult = 1.5;
let KDBalanceAttackMult = 0.4;
let KDBalanceCastArmsMult = 1;
let KDBalanceCastLegsMult = 3;

let KinkyDungeonGagMumbleChanceRestraint = 0.4;
let KinkyDungeonGagMumbleChance = 0.02;
let KinkyDungeonGagMumbleChancePerRestraint = 0.0025;

let MiniGameKinkyDungeonCheckpoint = "grv";
let MiniGameKinkyDungeonLevel = -1;
let KinkyDungeonMapIndex: Record<string, string> = {};

let KDWorldMap: Record<string, KDWorldSlot> = {};
let KDCurrentWorldSlot = {x: 0, y: 0};
let KDMapData: KDMapDataType = {} as KDMapDataType;
/** This data can be regenerated as needed */
let KDMapExtraData = {
	Boringness:     [] as number[],
	VisionGrid:     [] as number[],
	ColorGrid:      [] as number[],
	ShadowGrid:     [] as number[],
	BrightnessGrid: [] as number[],
};

let KinkyDungeonUpdateLightGrid = true;
let KinkyDungeonGrid_Last = "";

let KinkyDungeonGridSizeDisplay = 72;
let KinkyDungeonGridWidthDisplay = 2000/KinkyDungeonGridSizeDisplay;//17;
let KinkyDungeonGridHeightDisplay = 1000/KinkyDungeonGridSizeDisplay;//9;

let KinkyDungeonMoveDirection = KinkyDungeonGetDirection(0, 0);

let KinkyDungeonTextMessagePriority = 0;
let KinkyDungeonTextMessage = "";
let KinkyDungeonTextMessageNoPush = false;
let KinkyDungeonTextMessageTime = 0;
let KinkyDungeonTextMessageColor = KDBaseWhite;

let KinkyDungeonActionMessagePriority = 0;
let KinkyDungeonActionMessage = "";
let KinkyDungeonActionMessageNoPush = false;
let KinkyDungeonActionMessageTime = 0;
let KinkyDungeonActionMessageColor = KDBaseWhite;

let KinkyDungeonSpriteSize = 72;

let KinkyDungeonCanvas = document.createElement("canvas");
let KinkyDungeonContext = null;
let KinkyDungeonCanvasFow = document.createElement("canvas");
let KinkyDungeonContextFow = null;
let KinkyDungeonCanvasPlayer = document.createElement("canvas");
let KinkyDungeonContextPlayer = null;

let KinkyDungeonPOI = [];

let KinkyDungeonStairTiles = 'sSH';
let KDDefaultAvoidTiles = "gtVN@";
let KinkyDungeonGroundTiles = "023wW][?/";
let KDGrowableTiles = '0235][?/t';
let KinkyDungeonWallTiles = "14,6f";
let KDCrackableTiles = '4Xaom-';
let KDMendableTiles = '4';
let KinkyDungeonBlockTiles = "14,6bgX7f";
let KinkyDungeonMovableTilesEnemy = KinkyDungeonGroundTiles + "HB@l;SsRrdzTgLcNVvt5"; // Objects which can be moved into: floors, debris, open doors, staircases
// 5 is skinned floor, you can give it whatever sprite you want
// 6 is skinned wall, you can give it whatever sprite you want
let KinkyDungeonMovableTilesSmartEnemy = "D" + KinkyDungeonMovableTilesEnemy; //Smart enemies can open doors as well
let KDInteractableTiles = "OPCAMG$Y+=-F67" + KinkyDungeonMovableTilesSmartEnemy; // Player can open chests, orbs, shrines, chargers

let KinkyDungeonMovableTiles = KDInteractableTiles; // mod compatibility
// 5 = floor object, passable
// 6 = wall object, block passage
// 7 = transparent wall object

let KDRandomDisallowedNeighbors = ",?/RAasSHcCHDdOoPp+-=FZMmzgtuVvN567"; // tiles that can't be neighboring a randomly selected point
let KDTrappableNeighbors = "DA+-F@"; // tiles that might have traps bordering them with a small chance
let KDTrappableNeighborsLikely = "COP="; // tiles that might have traps bordering them with a big chance

let KinkyDungeonTransparentObjects = KDInteractableTiles
	.replace("D", "")
	.replace("g", "") // grate
	.replace("Y", "") // wall rubble
	+ "OoAaMmCcB@lb+=-FXu7";
let KinkyDungeonTransparentMovableObjects = KDInteractableTiles
	.replace("Z", "") // AutoDoor
	.replace("D", "") // Door
	.replace("g", ""); // Light does not pass thru doors or grates

let KDOpenDoorTiles = ["DoorOpen", "DoorVertOpenCont", "DoorVertOpen"];



let KinkyDungeonTargetTile = null;
let KinkyDungeonTargetTileLocation = "";

const KinkyDungeonBaseLockChance = 0.12;
const KinkyDungeonScalingLockChance = 0.16; // Lock chance per 6 floors. Does not affect the guaranteed locked chest each level
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
let KinkyDungeonTargetingSpell: spell = null;

let KDAutoWaitDelayed: boolean = false;

/**
 * Item to decrement by 1 when spell is cast
 */
let KinkyDungeonTargetingSpellItem = null;
let KinkyDungeonTargetingSpellWeapon = null;

/**
 * Game stops when you reach this level
 */
let KinkyDungeonMaxLevel = 21;

let KinkyDungeonLastMoveTimer = 0;
let KinkyDungeonLastMoveTimerStart = 0;
let KinkyDungeonLastMoveTimerCooldown = 175;
let KinkyDungeonLastMoveTimerCooldownStart = 50;



let KinkyDungeonJailLeash = 3;
let KinkyDungeonJailLeashY = 3;
let KinkyDungeonJailLeashX = 3;

let KinkyDungeonSaveInterval = 10;

let KinkyDungeonSFX = [];


function KDIsStairExplored(x, y) {
	return KDMapData.ExpStair ? !!KDMapData.ExpStair[x + ',' + y] : false;
}
function KDExploreStairs(x, y) {
	if (!KDMapData.ExpStair) KDMapData.ExpStair = {};
	KDMapData.ExpStair[x + ',' + y] = 1;
}

/**
 * @param [RoomType]
 * @param [MapMod]
 */
function KDDefaultMapData(mapX: number, mapY: number, RoomType: string = "", MapMod: string = ""): KDMapDataType {
	return {
		Checkpoint: MiniGameKinkyDungeonCheckpoint,
		Title: "",

		RespawnQueue: [],
		ShrineList: [],

		enemyTags: [],
		mapX: mapX,
		mapY: mapY,

		RepopulateQueue: [],
		

		ExpStair: {},
		TilesAlternate: {},

		SpecialAreas: [],
		Labels: {},
		PrisonState: "",
		PrisonStateStack: [],
		PrisonType: "",
		data: {},

		LairsToPlace: [],
		PotentialEntrances: [],
		UsedEntrances: {},

		Regiments: {},

		RoomType: RoomType,
		MapMod: MapMod,
		RandomPathablePoints: {},
		Tiles: {},
		EffectTiles : {},
		TilesMemory: {},
		TilesSkin: {},

		Bullets: [],

		ConstantX: false,

		GroundItems: [],

		Entities : [],
		FogGrid : [],
		FogMemory : [],
		Grid : "",
		Traffic : [],
		GridWidth : 31,
		GridHeight : 19,
		MapBrightness : 5,
		PatrolPoints : [],
		StartPosition : {x: 1, y: 1},
		EndPosition : {x: 1, y: 1},
		ShortcutPositions : {},
		JailPoints : [],

		ShopItems : [],
		PoolUses : 0,
		PoolUsesGrace : 3,
		CategoryIndex: {},

		JailFaction: [],
		GuardFaction: [],
		MapFaction: "",
		EscapeMethod: "Key",
		KillTarget: "",
		KillQuota: -1,
		TrapQuota: -1,
		TrapsTriggered: 0,
		ChestQuota: -1,
		ChestsOpened: 0,
		QuestQuota: -1,
		QuestsAccepted: 0,
		KeyQuota: -1,
		KeysHeld: 0,

		clickHeadpatted: false,

        PerkShrines: [],
        SelectedPerk: -1
	};
}

KDMapData = KDDefaultMapData(0, 0);


/**
 * @param location
 * @param value
 */
function KinkyDungeonEffectTilesSet(location: string, value: Record<string, effectTile>): void {
	KDMapData.EffectTiles[location] = value;
}
/**
 * @param location
 */
function KinkyDungeonEffectTilesGet(location: string, mapData?: KDMapDataType): Record<string, effectTile> {
	if (!mapData) mapData = KDMapData;
	return mapData.EffectTiles[location];
}



/**
 * @param value
 */
function KDSetPlayerTile(value: any): any {
	KDMapData.Tiles[KinkyDungeonPlayerEntity.x + ',' + KinkyDungeonPlayerEntity.y] = value;
	return value;
}

function KDGetPlayerTile(): any {
	return KDMapData.Tiles[KinkyDungeonPlayerEntity.x + ',' + KinkyDungeonPlayerEntity.y];
}


/**
 * @param location
 * @param value
 */
function KinkyDungeonTilesSet(location: string, value: any): any {
	KDMapData.Tiles[location] = value;
	return value;
}
/**
 * @param location
 */
function KinkyDungeonTilesGet(location: string): any {
	return KDMapData.Tiles[location];
}

/**
 * @param location
 */
function KinkyDungeonTilesDelete(location: string): void {
	delete KDMapData.Tiles[location];
}
/**
 * Clearsa the tile w/o deleting it
 * @param location
 */
function KDClearTile(location: string): void {
	let tile = KDMapData.Tiles[location];
	if (tile.Type) delete tile.Type;
}


/**
 * @param location
 * @param value
 */
function KinkyDungeonSkinSet(location: string, value: any) {
	KDMapData.TilesSkin[location] = value;
}
/**
 * @param location
 */
function KinkyDungeonSkinGet(location: string): any {
	return KDMapData.TilesSkin[location];
}

/**
 * @param location
 */
function KinkyDungeonSkinDelete(location: string) {
	delete KDMapData.TilesSkin[location];
}

function KDAlreadyOpened(x: number, y: number): boolean {
	if (KDGameData.AlreadyOpened) {
		for (let ao of KDGameData.AlreadyOpened) {
			if (ao.x == x && ao.y == y) {
				return true;
			}
		}
	}
	return false;
}

function KinkyDungeonPlaySound(src: string, entity?: entity, vol?: number) {
	if (KDSoundEnabled() && !KinkyDungeonSFX.includes(src)) {
		if (!entity || KinkyDungeonVisionGet(entity.x, entity.y) > 0) {
			/*  TODO: Ensure a missing `vol` parameter passes through as undefined.  */
			AudioPlayInstantSoundKD(src, vol);
			KinkyDungeonSFX.push(src);
		}
	}
}

function KinkyDungeonSetCheckPoint(Checkpoint?: string, _AutoSave?: any, _suppressCheckPoint?: any) {
	if (Checkpoint != undefined) MiniGameKinkyDungeonCheckpoint = Checkpoint;
	else if (Math.floor(MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint) == MiniGameKinkyDungeonLevel / KDLevelsPerCheckpoint)
		MiniGameKinkyDungeonCheckpoint = KDDefaultJourney[Math.min(KDDefaultJourney.length - 1, Math.floor((MiniGameKinkyDungeonLevel) / KDLevelsPerCheckpoint))];
}

function KinkyDungeonNewGamePlus(increaseDiff: boolean): void {
	KDSetWorldSlot(0, 0, 0, 0);

	//KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);
	// Remove all chests and add to lost items
	let lostItems: item[] = [];
	for (let entry of Object.entries(KDGameData.Containers)) {
		if (entry[1].location?.mapY > 0) {
			lostItems.push(...Object.values(entry[1].items));
			delete KDGameData.Containers[entry[0]];
		}
	}
	for (let item of lostItems) {
		KDAddLostItemSingle(item.name, 1);
	}
	let newPersistent: {
		[_: string]: KDPersistentNPC
	} = {};
	// Remove all persistent NPCs not permanent or part of collection
	for (let V of Object.values(KDPersistentNPCs)) {
		if (V.permanent || KDGameData.Collection[V.id + ""]) {
			newPersistent[V.id] = V;
			if (KDGameData.Collection[V.id + ""]) {
				if (V.mapX != 0 || V.mapY != 0 || V.room != "Summit") {
					V.spawned = false;
					V.mapX = 0;
					V.mapY = 0;
					V.room = "Summit";
				}
			} else V.room = "";

		}
	}

	if (increaseDiff) {
		if (KinkyDungeonStatsChoice.get("hardMode")) {
			KinkyDungeonStatsChoice.set("extremeMode", true);
		}
		KinkyDungeonStatsChoice.set("hardMode", true);

		KinkyDungeonHardMode = KinkyDungeonStatsChoice.get("hardMode");
		KinkyDungeonExtremeMode = KinkyDungeonStatsChoice.get("extremeMode");
	}

	KDGameData.PersistentNPCCache = {};
	KDPersistentNPCs = newPersistent;

	KinkyDungeonSetCheckPoint("grv", true);
	KDGameData.HighestLevelCurrent = 0;
	KinkyDungeonCreateMap(KinkyDungeonMapParams.grv, "JourneyFloor", "", 0);
	KinkyDungeonNewGame += 1;


	KDGameData.ElevatorsUnlocked = {};

	KDDeletedIDs = {};

	for (let t of KDResertNGTags) {
		if (KinkyDungeonFlags.has(t))
			KinkyDungeonFlags.delete(t);
	}
}

function KDResetData(Data?: KDGameDataBase): void {
	if (!Data) Data = KDGameDataBase;
	KDGameData = JSON.parse(JSON.stringify( Data));
	KDPersistentNPCs = {};
	KDDeletedIDs = {};
	KDPersonalAlt = {};


	for (let control of Object.keys(KDFocusControlButtons)) {
		KDInitFocusControl(control);
	}
	InitFacilities();
}

function InitPersistentGen() {
	KDGameData.MaidKnightFloor = Math.floor(2 + KDRandom() * KinkyDungeonMaxLevel*0.6);
	if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0) KDGameData.MaidKnightFloor -= 1;
}
function KDResetEventData(Data?: any) {
	if (!Data) Data = KDEventDataBase;
	KDEventData = JSON.parse(JSON.stringify( Data));
}



function KinkyDungeonInitialize(Level: number, Load?: any) {
	KDCollectionIndex = 0;
	KDWorldMap = {};
	KDMapData = KDDefaultMapData(0, 0);
	KDCurrentWorldSlot = {x: 0, y: 0};
	KDUpdateChokes = true;
	KDUpdateItemEventCache = true;
	KinkyDungeonCurrentTick = 0;

	if (StandalonePatched)
		KDInitCurrentPose(true);

	if (!afterLoaded) {
		KDModsAfterLoad();

		KinkyDungeonRefreshRestraintsCache();
		KinkyDungeonRefreshEnemiesCache();
		afterLoaded = true;
	}

	KinkyDungeonMessageLog = [];

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
	// Refresh the character
	CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayer,
		KDGetCharMetadata(KinkyDungeonPlayer)
	), false, true);
	KinkyDungeonDrawState = "Game";
	KDResetAlternateInventoryRender();
	KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	KinkyDungeonCheckClothesLoss = true;
	KinkyDungeonDressPlayer();

	KinkyDungeonMapIndex = {};
	for (let map of KDDefaultJourney) {
		KinkyDungeonMapIndex[map] = map;
	}
	for (let map of KDDefaultAlt) {
		KinkyDungeonMapIndex[map] = map;
	}

	for (let e of KDMapData.Entities) {
		KDClearItems(e);
	}
	KDMapData.Entities = [];
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;
	KDMapData.Bullets = [];
	KDMapData.GroundItems = [];

	KDGameData.Balance = 1;


	KDGameData.Quests = [];

	KinkyDungeonTextMessage = "";
	KinkyDungeonActionMessage = "";
	KDSetWorldSlot(0, Level, 0, 0);
	KinkyDungeonSetCheckPoint();

	KDInitCanvas();

	KinkyDungeonDefaultStats(Load);
	InitFacilities();

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

function KDCreateBoringness(noBoring: boolean) {
	let start = performance.now();
	// Initialize boringness array
	KDMapExtraData.Boringness = [];
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++)
			KDMapExtraData.Boringness.push(0); // 0 = no boringness
	}

	if (noBoring) return;
	// First we find shortest path to exit
	let path = KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y,
		KDMapData.EndPosition?.x || KDMapData.StartPosition.x, KDMapData.EndPosition?.y || KDMapData.StartPosition.y,
		false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false,
		undefined, false, undefined, false, true);

	let pathLength = path ? path.length : 200;

	// Now we find the path to the start/end of every INDIVIDUAL tile
	// Boringness = delta between (startLength + endLength) and (pathLength)
	for (let X = 0; X < KDMapData.GridWidth; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
			if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))) {
				let startLength = KinkyDungeonFindPath(X, Y,
					KDMapData.StartPosition.x, KDMapData.StartPosition.y,
					false, false, false, KinkyDungeonMovableTilesSmartEnemy, false, false, false,
					undefined, false, undefined, false, true);
				if (startLength) {
					let endLength = KinkyDungeonFindPath(X, Y, KDMapData.EndPosition?.x || KDMapData.StartPosition.x, KDMapData.EndPosition?.y || KDMapData.StartPosition.y,
						false, false, true, KinkyDungeonMovableTilesSmartEnemy, false, false, false,
						undefined, false, undefined, false, true);
					if (endLength) {
						let delta = Math.abs((startLength.length + endLength.length) - pathLength);
						KinkyDungeonBoringSet(X, Y, delta);
					} else KinkyDungeonBoringSet(X, Y, 2*pathLength);
				} else KinkyDungeonBoringSet(X, Y, 5*pathLength);
			}
		}
	}

	console.log("Time to create Boring" + (performance.now() - start));
}

function KDGetMapSize(): number {
	if (KinkyDungeonStatsChoice.get("MapLarge")) return 3;
	if (KinkyDungeonStatsChoice.get("MapHuge")) return 6;
	if (KinkyDungeonStatsChoice.get("MapGigantic")) return 9;
	if (KinkyDungeonStatsChoice.get("MapAbsurd")) return 24;
	return 0;
}

function KDGetMazeParams(params: floorParams): { oldest: number, newest: number, chance_STOP: number, opennessMult: number }
{
	if (KinkyDungeonStatsChoice.get("MapLarge")) return {
		oldest: 0.5,
		newest: 0.4,
		chance_STOP: .25 + 0.75*(params.deadend || 0),
		opennessMult: .8,
	};
	if (KinkyDungeonStatsChoice.get("MapHuge")) return {
		oldest: 0.45,
		newest: 0.35,
		chance_STOP: .45 + 0.55*(params.deadend || 0),
		opennessMult: .65,
	};
	if (KinkyDungeonStatsChoice.get("MapGigantic")) return {
		oldest: 0.4,
		newest: 0.25,
		chance_STOP: .55 + 0.45*(params.deadend || 0),
		opennessMult: .45,
	};
	if (KinkyDungeonStatsChoice.get("MapAbsurd")) return {
		oldest: 0.35,
		newest: 0.04,
		chance_STOP: .85 + 0.15*(params.deadend || 0),
		opennessMult: .1,
	};
	return {
		oldest: 0.1,
		newest: 0.8,
		chance_STOP: 0 + (params.deadend || 0),
		opennessMult: 1,
	};
}

/**
 * @param point
 */
function KDGetWorldMapLocation(point: { x: number, y: number }): KDWorldSlot {
	return KDWorldMap[point.x + ',' + point.y];
}


/**
 * Creates a new world location at the specific area
 * @param x
 * @param y
 * @param [main] - The main maptype which you return to
 */
function KDCreateWorldLocation(x: number, y: number, jx: number, jy: number, _main: string = "") {
	KDWorldMap[x + ',' + y] = {
		data: {},
		x: x,
		y: y,
		jx: jx,
		jy: jy,
		main: "",
		name: "Tile" + x + ',' + y,
		color: KDBaseWhite,
		outposts: {},
		lairs: {},
		lairsToPlace: {},
	};
}

/**
 * @param slot
 * @param saveconstantX
 * @returns the new map data object that is saved
 */
function KDSaveRoom(slot: { x: number, y: number }, saveconstantX: boolean): KDMapDataType {
	slot = slot || KDCurrentWorldSlot;
	let CurrentLocation = KDWorldMap[(saveconstantX ? 0 : slot.x) + "," + slot.y];
	if (!CurrentLocation) KDCreateWorldLocation(0, slot.y, KDGameData.JourneyX, KDGameData.JourneyY);

	// Pack enemies
	KDPackEnemies(KDMapData);
	// Remove navmap cause it will be regenned

	KDMapData.RandomPathablePoints = {};
	RandomPathList = [];

	let CurrentMapData = JSON.parse(JSON.stringify(KDMapData));

	if (CurrentLocation) {
		CurrentLocation.data[CurrentMapData.RoomType] = CurrentMapData;
	}
	return CurrentMapData;
}

/**
 * Decompress enemies
 * @param data
 */
function KDUnPackEnemies(data: KDMapDataType) {
	for (let enemy of data.Entities) {
		if (!enemy.modified) {
			enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy.name || enemy.Enemy);
		}
	}
}

/**
 * Decompress persistent entities
 * goes thru all entities on a map, and compares their current location according to persistent NPC record
 * @param Level
 * @param data
 * @param [removeMissing] - Remove enemies that are missing, i.e. their persistent NPC record says they are in another room
 */
function KDSyncPersistentEntities(Level: number, data: KDMapDataType, removeMissing: boolean = true) {
	let newEntities = [];
	for (let enemy of data.Entities) {
		if (KDIsNPCPersistent(enemy.id)) {
			let pers = KDGetPersistentNPC(enemy.id);
			if (removeMissing && (pers.room != data.RoomType || pers.mapY != Level)) {
				enemy = null;
			} else {
				enemy = pers.entity;
			}
		}
		if (enemy)
			newEntities.push(enemy);
	}
	let oldEntities = data.Entities;
	data.Entities = newEntities;
	oldEntities.splice(0, oldEntities.length);
}

/**
 * Decompress enemies
 * @param enemy
 */
function KDUnPackEnemy(enemy: entity) {
	let packed = !enemy.Enemy?.maxhp;
	if (!enemy.modified) {
		enemy.Enemy = KinkyDungeonGetEnemyByName(enemy.Enemy.name || enemy.Enemy);
	}
	return packed;
}
/**
 * Decompress enemies
 * @param enemy
 */
function KDPackEnemy(enemy: entity) {
	if (!enemy.modified) {
		// @ts-ignore
		enemy.Enemy = {name: enemy.Enemy.name};
	}
}
/**
 * Compress enemies to reduce file size
 * @param data
 */
function KDPackEnemies(data: KDMapDataType) {
	for (let enemy of data.Entities) {
		if (!enemy.modified) {
			// @ts-ignore
			enemy.Enemy = {name: enemy.Enemy.name};
		}
	}
}


/**
 * Loads a map from a world location
 * @param x
 * @param y
 * @param room
 * @param [direction] - 0 is default (start position), 1 is end, 2 is south shortcut, 3 is north shortcut
 * @param [constantX]
 * @param [ignoreAware] - Enemies will lock the door if this is true and they see you enter
 */
function KDLoadMapFromWorld(x: number, y: number, room: string, direction: number = 0, constantX?: boolean, ignoreAware: boolean = true): KDMapDataType {
	let origx = x;
	if (constantX) x = 0;

	if (!KDWorldMap[x + ',' + y]) return KDMapData;
	if (!KDWorldMap[x + ',' + y].data[room]) return KDMapData;

	// Create enemies first so we can spawn them in the set pieces if needed
	let allies = KinkyDungeonGetAllies();
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return !allies.includes(enemy);
	});
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;

	KDKickEnemies(undefined, ignoreAware, y); // Shuffle enemy locations

	let retval = KDSaveRoom(KDCurrentWorldSlot, KDMapData.ConstantX);

	// Load the room
	let NewMapData = JSON.parse(JSON.stringify(KDWorldMap[x + ',' + y].data[room]));

	// UnPack enemies
	KDSyncPersistentEntities(y, NewMapData, true);
	KDUnPackEnemies(NewMapData);


	KDMapData = NewMapData;
	KDWorldMap[x + ',' + y].data[room] = KDMapData;
	KDGameData.RoomType = KDMapData.RoomType;
	KDGameData.MapMod = KDMapData.MapMod;
	MiniGameKinkyDungeonCheckpoint = KDMapData.Checkpoint || MiniGameKinkyDungeonCheckpoint;

	// Filter non-present enemies
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return (!KDGetNPCLocation(enemy.id) || KDCompareLocation(KDGetNPCLocation(enemy.id), KDGetCurrentLocation()));
	});

	KDInitTempValues();
	if (!KDMapData.Traffic || KDMapData.Traffic.length == 0) KDGenerateBaseTraffic();
	KinkyDungeonGenNavMap();

	KDSetWorldSlot(x, y);

	KDBuildLairs();
	KDPlacePlayerBasedOnDirection(direction, KDGameData.ShortcutIndex);



	let aware = KDKickEnemies(undefined, ignoreAware, y); // Shuffle enemy locations
	if (ignoreAware && aware) {
		//KinkyDungeonLoseJailKeys();
		KinkyDungeonSetFlag("stairslocked", 10);
		KinkyDungeonSendActionMessage(10, TextGet("KDClimbUpTrapped"), KDBaseRed, 3);
	}

	for (let e of allies) {
		KDAddEntity(e, true, undefined, true);
	}

	for (let e of KinkyDungeonGetAllies()) {
		let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
		if (!point) point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, undefined, true);
		if (!point) point = {x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y};
		KDMoveEntity(e, point.x, point.y, false,undefined, undefined, true);
		e.visual_x = point.x;
		e.visual_y = point.y;
	}
	return retval;
}

/**
 * @param [direction]
 * @param [sideRoomIndex]
 */
function KDPlacePlayerBasedOnDirection(direction: number = 0, sideRoomIndex: string = '-1', nomove: boolean = false) {
	let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
	let sp = KDMapData.ShortcutPositions[sideRoomIndex]
		|| ((journeySlot?.SideRooms && journeySlot.SideRooms[sideRoomIndex]
			&& KDSideRooms[journeySlot.SideRooms[sideRoomIndex]]
		) ? KDMapData.ShortcutPositions[journeySlot.SideRooms[sideRoomIndex]] : undefined);
	if (!sp) {
		if ((journeySlot?.SideRooms && journeySlot.SideRooms.some((sr) => {
			return KDSideRooms[sr]?.altRoom == sideRoomIndex;
		}))) sp = KDMapData.ShortcutPositions[
			journeySlot.SideRooms.findIndex((sr) => {
				return KDSideRooms[sr]?.altRoom == sideRoomIndex;
			})
		];
	}
	if (sideRoomIndex != '-1' && KDMapData.ShortcutPositions && (
		sp
	)) {

		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, id: -1, x:
			sp.x, y:sp.y, player:true};
	} else if ((direction == 1) && KDMapData.EndPosition) {
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, id: -1, x: KDMapData.EndPosition.x, y:KDMapData.EndPosition.y, player:true};
	} else {
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, id: -1, x: KDMapData.StartPosition.x, y:KDMapData.StartPosition.y, player:true};
	}

	if (!nomove) {
		// Kick any enemy under the player away
		KDUpdateEnemyCache = true;
		if (KinkyDungeonEnemyAt(KDPlayer().x, KDPlayer().y)) {
			let en = KinkyDungeonEnemyAt(KDPlayer().x, KDPlayer().y);
			let pp = KinkyDungeonGetNearbyPoint(en.x, en.y, true, undefined,
				undefined, true
			);
			if (pp) {
				en.aware = true;
				KDMoveEntity(en, pp.x, pp.y, false);
			}
		}
	}
}

function KDInitTempValues(seed?: boolean): void {
	KDGameData.ChestsGenerated = [];
	KDPathfindingCacheFails = 0;
	KDPathfindingCacheHits = 0;
	KDPathCache = new Map();
	KDThoughtBubbles = new Map();
	KinkyDungeonRescued = {};
	KDGameData.ChampionCurrent = 0;
	KinkyDungeonAid = {};
	KDGameData.KinkyDungeonPenance = false;
	KDRestraintsCache = new Map();
	KDEnemiesCache = new Map();
	KDEnemyCache = new Map();
	KinkyDungeonTargetTile = null;
	KinkyDungeonTargetTileLocation = "";
	KDModalArea = false;

	KDGameData.OfferFatigue = 0;
	KDGameData.KeyringLocations = [];

	if (KDMapData.KeysHeld == undefined) {
		KDMapData.KeysHeld = 0;
	}

	KDGameData.RescueFlag = false;
	KinkyDungeonTotalSleepTurns = 0;
	KinkyDungeonFastMovePath = [];

	KinkyDungeonShopIndex = 0;

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


	KDStageBossGenerated = true;
	KDUpdateEnemyCache = true;
	KinkyDungeonUpdateLightGrid = true;

	KDPathCache = new Map();
	KDPathCacheIgnoreLocks = new Map();
}

/** Game related options */
function KDUpdateOptionGame(start): void {
	if (KinkyDungeonStatsChoice.get("NoForceGreet") && !KDGameData.NoForceGreet) {
		KDGameData.NoForceGreet = true;
	} else if (!KinkyDungeonStatsChoice.get("NoForceGreet") && KDGameData.NoForceGreet) {
		KDGameData.NoForceGreet = false;
	}

	// Add missing spells, if missing
	for (let kurasu of Object.keys(KDClassStart)) {
		let perkname = "MC_" + (KDClassSynonyms[kurasu] || kurasu);
		if (!!KinkyDungeonStatsChoice.get(perkname) && KDPerkStart[perkname]) {
			KDPerkStart[perkname](start);
		}
	}
}


function KDIsHellFloor(Level?: number): boolean {
	if (Level == undefined) Level = MiniGameKinkyDungeonLevel
	return Level == 12 || Level == 16;
}

function KDGetEffLevel(): number {
	let effLevel = MiniGameKinkyDungeonLevel + Math.round(KinkyDungeonDifficulty/5);
	if (KinkyDungeonNewGame) effLevel += KinkyDungeonMaxLevel;

	return effLevel;
}
function KDGetEffMaxLevel(): number {
	let effLevel = KDGameData.HighestLevel + Math.round(KinkyDungeonDifficulty/5);
	if (KinkyDungeonNewGame) effLevel += KinkyDungeonMaxLevel;

	return effLevel;
}

function KDRandomizeRedLock(): string {
	let level = KDGetEffLevel();
	if (KDRandom() < -0.1 + Math.min(0.5, level * 0.03)) return "Red_Hi";
	if (KDRandom() < 0.25 + Math.min(0.55, level * 0.03)) return "Red_Med";
	return "Red";
}


/**
 * @param [Guaranteed]
 * @param [Floor]
 * @param [AllowGold]
 * @param [Type] - Used to customize the type
 * @param [Data] - Used to customize the type
 */
function KDGetLockList(Guaranteed?: boolean, Floor?: number, AllowGold?: boolean, Type?: string, Data?: any): Record<string, number> {
	let ret: Record<string, number> = {};
	for (let obj of Object.keys(KDLocks)) {
		if (KDLocks[obj].filter(Guaranteed, Floor, AllowGold, Type, Data))
			ret[obj] = KDLocks[obj].weight(Guaranteed, Floor, AllowGold, Type, Data);
	}
	return ret;
}

/**
 * Generates a lock
 * @param [Guaranteed]
 * @param [Floor]
 * @param [AllowGold]
 * @param [Type] - Used to customize the type
 * @param [Data] - Used to customize the type
 */
function KinkyDungeonGenerateLock(Guaranteed?: boolean, Floor?: number, AllowGold?: boolean, Type?: string, Data?: any): string {
	let level = (Floor) ? Floor : KDGetEffLevel();
	//let Params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];

	let chance = (level == 0) ? 0 : KinkyDungeonBaseLockChance;
	chance += KinkyDungeonScalingLockChance * level / KDLevelsPerCheckpoint;

	if (Guaranteed) chance = 1.0;

	let lock = undefined;

	if (KDRandom() < chance) {
		// Get list
		lock = KDGetByWeight(KDGetLockList(Guaranteed, level, AllowGold, Type, Data));

		// Now we get the amount failed by
		// Default: red lock
		/*let locktype = KDRandom();
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
		}*/
	}
	/*if (Type == "Door") {
		if (lock.includes("Blue") || lock.includes("Gold")) lock = KDRandomizeRedLock();
	}*/

	return lock;
}

let KDPlaceMode = {
	MODE_PLACENEW: 0x0,
	MODE_MODIFYPOTENTIALANDEXISTING: 0x1,
	MODE_MODIFYEXISTINGONLY: 0x2,
};
function KinkyDungeonPlaceDoors (
	doorchance:      number,
	doortrapchance:  number,
	nodoorchance:    number,
	doorlockchance:  number,
	trapChance:      number,
	grateChance:     number,
	Floor:           number,
	width:           number,
	height:          number,
	placeMode:       number = KDPlaceMode.MODE_PLACENEW
)
{
	let doorlist = [];
	let doorlist_2ndpass = [];
	let trapLocations = [];

	// Populate the doors
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (    (    (placeMode == KDPlaceMode.MODE_PLACENEW && KinkyDungeonMapGet(X, Y) != 'D' && KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)))
			         ||  ((placeMode == KDPlaceMode.MODE_MODIFYEXISTINGONLY || placeMode == KDPlaceMode.MODE_MODIFYPOTENTIALANDEXISTING) && (KinkyDungeonMapGet(X, Y) == 'd' || KinkyDungeonMapGet(X, Y) == 'D'))
			         ||  (placeMode == KDPlaceMode.MODE_MODIFYPOTENTIALANDEXISTING && (KinkyDungeonTilesGet(X + "," + Y)?.PotentialDoor))
			        )
			    &&  (    !KinkyDungeonTilesGet(X + "," + Y)
			         ||  (!KinkyDungeonTilesGet(X + "," + Y).OL && !KinkyDungeonTilesGet(X + "," + Y).Lock && !KinkyDungeonTilesGet(X + "," + Y).RequiredDoor)))
			{
				// Check the 3x3 area
				let wallcount = 0;
				let up = false;
				let down = false;
				let left = false;
				let right = false;
				for (let XX = X-1; XX <= X+1; XX += 1)
					for (let YY = Y-1; YY <= Y+1; YY += 1) {
						let get = KinkyDungeonMapGet(XX, YY);
						if (!(XX == X && YY == Y) && (!KinkyDungeonMovableTilesEnemy.includes(get))) {
							wallcount += 1; // Get number of adjacent walls
							if ("14,b".includes(get)) {
								if (XX == X+1 && YY == Y && !KinkyDungeonMovableTilesEnemy.includes(get)) right = true;
								else if (XX == X-1 && YY == Y && !KinkyDungeonMovableTilesEnemy.includes(get)) left = true;
								else if (XX == X && YY == Y+1 && !KinkyDungeonMovableTilesEnemy.includes(get)) down = true;
								else if (XX == X && YY == Y-1 && !KinkyDungeonMovableTilesEnemy.includes(get)) up = true;
							}
						} else if (get == 'D') // No adjacent doors
							wallcount = 100;
					}
				if ((placeMode == KDPlaceMode.MODE_PLACENEW ? (wallcount < 5) : (wallcount > 1 && wallcount < 7)) && ((up && down) != (left && right)) && KDRandom() > nodoorchance) { // Requirements: 4 doors and either a set in up/down or left/right but not both
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
			KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor, undefined, "Door", {x: X, y: Y, tile: KinkyDungeonTilesGet("" + X + "," + Y)});
		}

		if (KDRandom() < doortrapchance) {
			trapLocations.push({x: X, y: Y});
		}

		doorlist.splice(N, 1);
	}

	while (doorlist_2ndpass.length > 0) {
		let N = Math.floor(KDRandom()*doorlist_2ndpass.length);
		let minLockedRoomSize = 8;
		let maxPlayerDist = 4;

		let door = doorlist_2ndpass[N];
		let X = door.x;
		let Y = door.y;

		let roomDoors = [];

		let trap = KDRandom() < trapChance;
		let grate = KDRandom() < grateChance;

		if ((trap || grate) && KinkyDungeonTilesGet(X + "," + Y) && !KinkyDungeonTilesGet(X + "," + Y).NoTrap && !KinkyDungeonTilesGet(X + "," + Y).OL) {
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
									KDMapData.GroundItems.push(dropped);
								}
								lock = true;
							} else if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(room.door.x, room.door.y+1)) && ((grate && (!room.room || room.room.length > minLockedRoomSize))
									|| (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y+1)) && Math.max(Math.abs(room.door.x - KinkyDungeonPlayerEntity.x), Math.abs(room.door.y - KinkyDungeonPlayerEntity.y)) <= maxPlayerDist))
									&& room.door.y != KDMapData.StartPosition.y) {
								// Place a grate instead
								KinkyDungeonMapSet(room.door.x, room.door.y, 'g');
								lock = true;
							}
							if (lock) {
								KinkyDungeonTilesGet("" + X + "," + Y).Lock = KinkyDungeonGenerateLock(true, Floor, false, "Door", {x: X, y: Y, tile: KinkyDungeonTilesGet("" + X + "," + Y)});
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

function KinkyDungeonReplaceDoodads(Chance: number, barchance: number, wallRubblechance: number, wallhookchance: number, ceilinghookchance: number, width: number, height: number, altType?: any) {

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

	let addedCave = false;

	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			let category = (KDMapData.CategoryIndex ? KDGetCategoryIndex(X, Y)?.category : {}) as {category: string, tags: string[]};
			if (category?.tags?.includes("noWear")) continue;
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < Chance) {
				KinkyDungeonMapSet(X, Y, '4');
				// Cracks then expand in a random direction twice,
				// and place an exit if the initial tile is connected to nav tile
				let accessible = false;
				for (let x = X - 1; x <= X + 1; x++) {
					for (let y = Y - 1; y <= Y + 1; y++) {
						if (!!KDMapData.RandomPathablePoints[x + ',' + y]) {
							accessible = true;
							x = X + 2;
							y = Y + 2;
							// To break
						}
					}
				}
				let toExcavate: KDPoint[] = [{x: X, y: Y}];

				let curXOld = X;
				let curYOld = Y;
				let lastPoint: KDPoint = null;
				for (let a = 0; a < 2; a++) {
					let curX = curXOld;
					let curY = curYOld;
					for (let i = 0; i < 7; i++) {
						let xd = KDRandom() < 0.33 ? 0 :
							(KDRandom() < 0.5 ? -1 : 1);
						let yd = xd ? 0 : (KDRandom() < 0.5 ? -1 : 1);
						curX += xd;
						curY += yd;
						if ((KinkyDungeonMapGet(curX, curY) == '1'
							&& !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX + 1, curY))
							&& !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX - 1, curY))
							&& !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX, curY + 1))
							&& !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(curX, curY - 1)))
							// Crakcs propagate
							|| KinkyDungeonMapGet(curX, curY) == '4') {
							KinkyDungeonMapSet(curX, curY, '4');
							lastPoint = {x:curX, y:curY};
							toExcavate.push(lastPoint);
						} else {
							curX -= xd;
							curY -= yd;
						}
					}
				}
				if (accessible
					&& lastPoint?.x > 0
					&& lastPoint.y > 0
					&& lastPoint.x < KDMapData.GridWidth - 2
					&& lastPoint.y < KDMapData.GridHeight - 2) {
					KDMapData.PotentialEntrances.push({
						Excavate: toExcavate,
						PlaceScript: "Cave",
						Type: "Cave",
						x: lastPoint.x,
						y: lastPoint.y,
					})
				}

			} else
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < wallRubblechance && !KDMapData.TilesSkin[X + "," + Y]
				&& KDNearbyMapTiles(X, Y, 1.5).some((mt) => {
					return KinkyDungeonGroundTiles.includes(mt.tile)
						&& KDMapData.RandomPathablePoints["" + mt.x + "," + mt.y];
				})) {
				KinkyDungeonMapSet(X, Y, 'Y');
				KDMapData.PotentialEntrances.push({
					Excavate: [{x: X, y: Y}],
					PlaceScript: "Cave",
					Type: "Cave",
					x: X,
					y: Y,
				})
			}

		}
}


function KinkyDungeonPlaceJailEntrances(width: number, height: number, altType?: any) {
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {

			if (KinkyDungeonMapGet(X, Y) == '1' && !KDMapData.TilesSkin[X + "," + Y]
				&& !KinkyDungeonTilesGet(X + "," + Y)?.OL
				&& !KinkyDungeonTilesGet(X + "," + Y)?.Type) {
					let allow = "14";
					let u = allow.includes(KinkyDungeonMapGet(X, Y - 1));
					let d = allow.includes(KinkyDungeonMapGet(X, Y + 1));
					let r = allow.includes(KinkyDungeonMapGet(X + 1, Y));
					let l = allow.includes(KinkyDungeonMapGet(X - 1, Y));
					let ul = allow.includes(KinkyDungeonMapGet(X - 1, Y - 1));
					let dl = allow.includes(KinkyDungeonMapGet(X - 1, Y + 1));
					let ur = allow.includes(KinkyDungeonMapGet(X + 1, Y - 1));
					let dr = allow.includes(KinkyDungeonMapGet(X + 1, Y + 1));

					let sum = 0;
					let corn = 0;
					if (u) sum += 1;
					if (d) sum += 1;
					if (l) sum += 1;
					if (r) sum += 1;
					if (ul) corn += 1;
					if (dl) corn += 1;
					if (ur) corn += 1;
					if (dr) corn += 1;

					if (sum == 3 && corn == 2) {
						if (
							(!u && !ul && !ur)
							|| (!d && !dl && !dr)
							|| (!l && !ul && !dl)
							|| (!r && !ur && !dr)
						) {
							let accessible = false;
							for (let x = X - 1; x <= X + 1; x++) {
								for (let y = Y - 1; y <= Y + 1; y++) {
									if (!!KDMapData.RandomPathablePoints[x + ',' + y]) {
										accessible = true;
										x = X + 2;
										y = Y + 2;
										// To break
									}
								}
							}

							if (accessible
								&& X > 0
								&& Y > 0
								&& X < KDMapData.GridWidth - 2
								&& Y < KDMapData.GridHeight - 2) {
								KDMapData.PotentialEntrances.push({
									Excavate: [],
									PlaceScript: "Jail",
									Type: "Jail",
									x: X,
									y: Y,
								})
							}
						}
					}

			}
		}
}

function KinkyDungeonPlaceFurniture(barrelChance: number, cageChance: number, width: number, height: number, altType: any) {
	// Add special stuff
	if (!altType || !altType.noClutter)
		for (let X = 1; X < width-1; X += 1)
			for (let Y = 1; Y < height-1; Y += 1) {
				let category = (KDMapData.CategoryIndex ? KDGetCategoryIndex(X, Y)?.category : {}) as {category: string, tags: string[]};
				if (category?.tags?.includes("noClutter")) continue;
				if (KinkyDungeonMapGet(X, Y) == '0' && !(KinkyDungeonTilesGet(X + "," + Y) && (KinkyDungeonTilesGet(X + "," + Y).OL || KinkyDungeonTilesGet(X + "," + Y).Skin))
					&& !(Object.values(KinkyDungeonEffectTilesGet(X + ',' + Y) || {})?.length > 0)
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
						let furn = KinkyDungeonStatsChoice.get("MoreKinkyFurniture") ? 0.8 : 0.1;
						KinkyDungeonTilesSet(X + "," + Y, {Type: "Furniture", Furniture: furn});
						KDMapData.JailPoints.push({x: X, y: Y, type: "furniture", radius: 1}); // , requireFurniture: true Standing in the cage alone will prevent jailbreak--good for stealth!
					}
				}
			}
}

interface KDFoodData {
	Food: string,
	Weight: number,
	Theft?: string,
	OnEat?: string,
	FilterPerk?: string,
	inedible?: boolean,
}

let KDFood: Record<string, KDFoodData> = {
	"": {
		Food: "",
		Weight: 10,
	},
	Plate: {
		Food: "Plate",
		inedible: true,
		Weight: 1,
	},
	Cookies: {
		Food: "Cookies",
		Theft: "Cookie",
		Weight: 8,
	},
	Donut: {
		Food: "Donut",
		Theft: "Donut",
		Weight: 6,
	},
	Brownies: {
		Food: "Brownies",
		Theft: "Brownies",
		Weight: 3,
	},
	IceCream: {
		Food: "IceCream",
		Weight: 8,
	},
	Pizza: {
		Food: "Pizza",
		Weight: 12,
	},
	IceCreamPoisoned: {
		Food: "IceCreamPoisoned",
		Weight: 2,
		FilterPerk: "No_SleepFood",
		OnEat: "PoisonedFood",
	},
	PizzaPoisoned: {
		Food: "PizzaPoisoned",
		FilterPerk: "No_SleepFood",
		OnEat: "PoisonedFood",
		Weight: 2,
	},
	
	IceCreamArousal: {
		Food: "IceCreamArousal",
		Weight: 2,
		FilterPerk: "No_ArousalFood",
		OnEat: "ArousalFood",
	},
	PizzaArousal: {
		Food: "PizzaArousal",
		FilterPerk: "No_ArousalFood",
		OnEat: "ArousalFood",
		Weight: 2,
	},
};

let KDOnEatScripts: Record<string, (x: number, y: number, tile: any, food: KDFoodData) => void> = {
	PoisonedFood: (x, y, tile, food) => {
		KinkyDungeonSendTextMessage(10, TextGet("KDFoodPoison", {
			Food: TextGet("KDFoodName" + food.Food).toLocaleLowerCase()
		}), KDBaseRed, 8);
		KinkyDungeonApplyBuffToEntity(KDPlayer(), KDPoisonSleepLong);
		let sfx = "Damage";
		KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
	},
	ArousalFood: (x, y, tile, food) => {
		KinkyDungeonSendTextMessage(10, TextGet("KDFoodArousal", {
			Food: TextGet("KDFoodName" + food.Food).toLocaleLowerCase()
		}), KDBaseRed, 8);
		KinkyDungeonApplyBuffToEntity(KDPlayer(), KDArousalOverTime);
		KinkyDungeonApplyBuffToEntity(KDPlayer(), KDArousalOverTime2);
		
		let sfx = "Damage";
		KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sfx + ".ogg");
	},
}

function KinkyDungeonPlaceFood(foodChance: number, width: number, height: number, altType: AltType) {

	if (altType && altType.noClutter) return;
	if (altType && altType.noTables) return;

	let foodPoints = new Map();
	let foodList = [];


	// Populate the chests
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KDMapData.StartPosition.x), Math.abs(Y - KDMapData.StartPosition.y)) > KinkyDungeonJailLeash
				&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL)) {
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
						&& !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
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


			}// else if (KinkyDungeonMapGet(X, Y) == "R" || KinkyDungeonMapGet(X, Y) == "r")
			//foodList.push({x:X, y:Y});

	// Truncate down to max chest count in a location-neutral way
	let count = 0;
	let list = [];
	let maxBoringness = Math.max(...KDMapExtraData.Boringness);
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
				if (!obj.FilterPerk || !KinkyDungeonStatsChoice.get(obj.FilterPerk)) {
					Weights.push({event: obj, weight: WeightTotal});
					WeightTotal += obj.Weight;
				}
				
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

function KinkyDungeonPlaceTorches(torchchance: number, torchlitchance: number, torchchanceboring: number, width: number, height: number, _altType: any, torchreplace: any) {
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			if (KinkyDungeonMapGet(X, Y) == '1'
				&& KDInteractableTiles.includes(KinkyDungeonMapGet(X, Y + 1))
				&& !KinkyDungeonEffectTilesGet((X - 1) + "," + (Y+1))
				&& !KinkyDungeonEffectTilesGet((X) + "," + (Y+1))
				&& !KinkyDungeonEffectTilesGet((X + 1) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X - 1) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X + 1) + "," + (Y+1))
				&& !KinkyDungeonTilesGet((X) + "," + (Y))
				&& KDRandom() < torchchance + KinkyDungeonBoringGet(X, Y) * torchchanceboring) {
				let spr = torchreplace ? torchreplace.sprite : "Torch";
				if ((!torchreplace || torchreplace.unlitsprite) && KDRandom() > torchlitchance) {
					spr = torchreplace ? torchreplace.unlitsprite : "TorchUnlit";
				}
				let torchref = {
					name: spr,
					duration: 9999, infinite: true,
				};
				KDCreateEffectTile(X, Y + 1, torchref, 0);
			}
		}
}

/**
 * Replace vertical wall '1' with '|'
 * @param width
 * @param height
 */
function KinkyDungeonReplaceVert(width: number, height: number) {
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


/*  TODO: Work out/create the proper types for these.  */
function KinkyDungeonMazeWalls(Cell: any, Walls: GridEntry, WallsList: GridEntry) {
	if (Walls[(Cell.x+1) + "," + Cell.y]) WallsList[(Cell.x+1) + "," + Cell.y] = {x:Cell.x+1, y:Cell.y};
	if (Walls[(Cell.x-1) + "," + Cell.y]) WallsList[(Cell.x-1) + "," + Cell.y] = {x:Cell.x-1, y:Cell.y};
	if (Walls[Cell.x + "," + (Cell.y+1)]) WallsList[Cell.x + "," + (Cell.y+1)] = {x:Cell.x, y:Cell.y+1};
	if (Walls[Cell.x + "," + (Cell.y-1)]) WallsList[Cell.x + "," + (Cell.y-1)] = {x:Cell.x, y:Cell.y-1};
}

/**
 * @param X
 * @param Y
 * @param SetTo
 * @param [VisitedRooms]
 */
function KinkyDungeonMapSet(X: number, Y: number, SetTo: string, VisitedRooms?: any[]): boolean {
	let height = KDMapData.GridHeight;
	let width = KDMapData.GridWidth;

	if (X > 0 && X < width-1 && Y > 0 && Y < height-1) {
		KDMapData.Grid = KDMapData.Grid.replaceAt(X + Y*(width+1), SetTo);
		if (VisitedRooms)
			VisitedRooms.push({x: X, y: Y});
		return true;
	}
	return false;
}
function KinkyDungeonMapSetForce(X: number, Y: number, SetTo: string, VisitedRooms?: any[]): boolean {
	let width = KDMapData.GridWidth;

	KDMapData.Grid = KDMapData.Grid.replaceAt(X + Y*(width+1), SetTo);
	if (VisitedRooms)
		VisitedRooms.push({x: X, y: Y});
	return true;

}


/**
 * @param data
 * @param X
 * @param Y
 * @param SetTo
 */
function KinkyDungeonMapDataSet(data: KDMapDataType, X: number, Y: number, SetTo: string): boolean {
	let height = data.GridHeight;
	let width = data.GridWidth;

	if (X > 0 && X < width-1 && Y > 0 && Y < height-1) {
		data.Grid = data.Grid.replaceAt(X + Y*(width+1), SetTo);
		return true;
	}
	return false;
}

function KinkyDungeonBoringGet(X: number, Y: number): number {
	return KDMapExtraData.Boringness[X + Y*(KDMapData.GridWidth)];
}

function KinkyDungeonBoringSet(X: number, Y: number, SetTo: number) {
	if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1) {
		KDMapExtraData.Boringness[X + Y*(KDMapData.GridWidth)] = SetTo;
		return true;
	}
	return false;
}

/**
 * @param X
 * @param Y
 */
function KinkyDungeonMapGet(X: number, Y: number): string {
	//let height = KDMapData.Grid.split('\n').length;
	//let width = //KDMapData.Grid.split('\n')[0].length;

	return KDMapData.Grid[X + Y*(KDMapData.GridWidth+1)];
}

/**
 * @param data
 * @param X
 * @param Y
 */
function KinkyDungeonMapDataGet(data: KDMapDataType, X: number, Y: number): string {
	return data.Grid[X + Y*(data.GridWidth+1)];
}

function KinkyDungeonVisionSet(X: number, Y: number, SetTo: number): boolean {
	if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1) {
		KDMapExtraData.VisionGrid[X + Y*(KDMapData.GridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonBrightnessSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean {
	if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1) {
		if (!monotonic || SetTo > KDMapExtraData.BrightnessGrid[X + Y*(KDMapData.GridWidth)])
			KDMapExtraData.BrightnessGrid[X + Y*(KDMapData.GridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonColorSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean {
	if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1) {
		if (!monotonic || SetTo > KDMapExtraData.ColorGrid[X + Y*(KDMapData.GridWidth)])
			KDMapExtraData.ColorGrid[X + Y*(KDMapData.GridWidth)] = SetTo;
		return true;
	}
	return false;
}
function KinkyDungeonShadowSet(X: number, Y: number, SetTo: number, monotonic?: boolean): boolean {
	if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1) {
		if (!monotonic || SetTo > KDMapExtraData.ShadowGrid[X + Y*(KDMapData.GridWidth)])
			KDMapExtraData.ShadowGrid[X + Y*(KDMapData.GridWidth)] = SetTo;
		return true;
	}
	return false;
}

function KinkyDungeonVisionGet(X: number, Y: number): number {
	return KDMapExtraData.VisionGrid[X + Y*(KDMapData.GridWidth)];
}

function KinkyDungeonBrightnessGet(X: number, Y: number): number {
	return KDMapExtraData.BrightnessGrid[X + Y*(KDMapData.GridWidth)];
}
function KinkyDungeonColorGet(X: number, Y: number): number {
	return KDMapExtraData.ColorGrid[X + Y*(KDMapData.GridWidth)];
}
function KinkyDungeonShadowGet(X: number, Y: number): number {
	return KDMapExtraData.ShadowGrid[X + Y*(KDMapData.GridWidth)];
}

function KinkyDungeonFogGet(X: number, Y: number): any {
	return KDMapData.FogGrid[X + Y*(KDMapData.GridWidth)];
}
function KinkyDungeonFogSet(X: number, Y: number, val: number): any {
	KDMapData.FogGrid[X + Y*(KDMapData.GridWidth)] = val;
}
function KinkyDungeonFogMemoryGet(X: number, Y: number): any {
	return KDMapData.FogMemory[X + Y*(KDMapData.GridWidth)];
}
function KinkyDungeonFogMemorySet(X: number, Y: number, val: number): any {
	KDMapData.FogMemory[X + Y*(KDMapData.GridWidth)] = val;
}

let canvasOffsetX = 0;
let canvasOffsetY = 0;
const canvasOffsetX_ui = 500;
const canvasOffsetY_ui = 164;

interface MoveDirection {
	x: number,
	y: number,
	delta: number,
}

// factor which affects directionality of grid based directions
let KDDirectionFactor = 1.5;
let KDDirectionFactorScale = 1;

// returns an object containing coordinates of which direction the player will move after a click, plus a time multiplier
// This is optimized for allowing tight aiming around corners
function KinkyDungeonGetDirection(dx: number, dy: number): MoveDirection {

	let X = 0;
	let Y = 0;

	if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5)
		return {x:0, y:0, delta:1};
	const factor = KDDirectionFactor + KDDirectionFactorScale * Math.min(1, KDistChebyshev(dx, dy)/5);

	// Cardinal directions first - up down left right
	if (dy > 0 && Math.abs(dx) < Math.abs(dy)/factor) Y = 1;
	else if (dy < 0 && Math.abs(dx) < Math.abs(dy)/factor) Y = -1;
	else if (dx > 0 && Math.abs(dy) < Math.abs(dx)/factor) X = 1;
	else if (dx < 0 && Math.abs(dy) < Math.abs(dx)/factor) X = -1;

	// Diagonals
	else if (dy > 0 && dx > dy/factor) {Y = 1; X = 1;}
	else if (dy > 0 && -dx > dy/factor) {Y = 1; X = -1;}
	else if (dy < 0 && dx > -dy/factor) {Y = -1; X = 1;}
	else if (dy < 0 && -dx > -dy/factor) {Y = -1; X = -1;}

	if (X == 0 && Y == 0 && (dx || dy)) return KDGetDirGeometric(dx, dy);

	return {x:X, y:Y, delta:Math.round(Math.sqrt(X*X+Y*Y)*2)/2}; // Delta is always in increments of 0.5
}


// Geometric version of GetDirection - obeys euclidean rather than grid logic
function KDGetDirGeometric(dx: number, dy: number): MoveDirection {

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
function KinkyDungeonGetDirectionRandom(dx: number, dy: number) {
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

// GetDirection, but it also pivots randomly 45 degrees to either side
function KDGetAdjacentTiles(dx: number, dy: number): KDPoint[] {
	let list: KDPoint[] = [];

	for (let pivot of [-1, 1]) {
		let dir = KinkyDungeonGetDirection(dx, dy);

		if (dir.x == 0 && dir.y == 1) dir.x = pivot;
		else if (dir.x == 0 && dir.y == -1) dir.x = -pivot;
		else if (dir.x == 1 && dir.y == 0) dir.y = pivot;
		else if (dir.x == -1 && dir.y == 0) dir.y = -pivot;
		else if (dir.x == 1 && dir.y == 1) {if (pivot == 1) {dir.y = 0;} else if (pivot == -1) {dir.x = 0;}}
		else if (dir.x == 1 && dir.y == -1) {if (pivot == 1) {dir.x = 0;} else if (pivot == -1) {dir.y = 0;}}
		else if (dir.x == -1 && dir.y == 1) {if (pivot == 1) {dir.x = 0;} else if (pivot == -1) {dir.y = 0;}}
		else if (dir.x == -1 && dir.y == -1) {if (pivot == 1) {dir.y = 0;} else if (pivot == -1) {dir.x = 0;}}

		list.push(dir);
	}
	return list; // Delta is always in increments of 0.5
}


let KinkyDungeonAutoWaitSuppress = false;

function KinkyDungeonControlsEnabled() {
	return !KinkyDungeonInspect
		&& KDGameData.SlowMoveTurns < 1
		&& KinkyDungeonStatFreeze < 1
		&& KDGameData.SleepTurns < 1
		&& !KDGameData.CurrentDialog
		&& !KinkyDungeonMessageToggle;
}

function KDStartSpellcast(tx: number, ty: number, SpellToCast: spell, enemy: any, player: any, bullet: KDBullet, data: any) {
	let spell = KinkyDungeonFindSpell(SpellToCast.name, true);
	let spellname = undefined;
	if (spell) {
		spellname = spell.name;
		spell = undefined;
	} else spell = SpellToCast;
	return KDSendInput("tryCastSpell", {tx: tx, ty: ty, spell: spell, spellname: spellname, enemy: enemy, player: player, bullet: bullet, ...data});
}

// Click function for the game portion
function KinkyDungeonClickGame(event: MouseEvent, _Level?: number) {
	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};

	// Cycle if we are inspecting tooltip and click
	if (KDShowExtraTooltipMaxCycle > 0 && KinkyDungeonInspect) {
		KDShowExtraTooltipCycle = (KDShowExtraTooltipCycle + 1) % (KDShowExtraTooltipMaxCycle + 1);
		lastExtraTooltipCycleTimeAuto = CommonTime() + lastExtraTooltipCycleTimeAuto_ManualDelay;
	}

	// First we handle buttons
	let prevSpell = KinkyDungeonTargetingSpell;
	let prevInv = (KinkyDungeonShowInventory && !KinkyDungeonTargetingSpell);
	if (KDGameData.CurrentDialog) {
		let result = false;
		try {
			result = KDHandleDialogue();
		} finally {
			CharacterRefresh = _CharacterRefresh;
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
			// Done, converted to input
		}
		return result;
	}
	if (KinkyDungeonControlsEnabled() && KinkyDungeonHandleHUD()) {
		try {
			if (prevSpell) {
				if (prevInv) KDCloseQuickInv();
				else {
					KinkyDungeonTargetingSpell = null;
					KinkyDungeonTargetingSpellItem = null;
					KinkyDungeonTargetingSpellWeapon = null;
				}
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
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
			else if (KDIsAutoAction()) {
				KDDisableAutoWait();
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
			}
		} finally {
			CharacterRefresh = _CharacterRefresh;
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		}

		return;
	}
	// beep
	else if (KDIsAutoAction() && MouseIn(canvasOffsetX, canvasOffsetY, KinkyDungeonCanvas.width, KinkyDungeonCanvas.height)) {
		KDDisableAutoWait();

		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Damage.ogg");
	}
	else if (KDFocusControls) {
		KDSetFocusControl("");
	}
	// If no buttons are clicked then we handle move
	else if ((KinkyDungeonControlsEnabled() || KinkyDungeonInspect) && KinkyDungeonDrawState == "Game") {
		//KDSetFocusControl("");
		try {
			if (KinkyDungeonInspect) {
				KDInspectCamera.x = KinkyDungeonTargetX;
				KDInspectCamera.y = KinkyDungeonTargetY;
				KDInspectCamera.x = Math.max(-KinkyDungeonGridWidthDisplay, Math.min(KDInspectCamera.x, KDMapData.GridWidth));
				KDInspectCamera.y = Math.max(-KinkyDungeonGridHeightDisplay, Math.min(KDInspectCamera.y, KDMapData.GridHeight));
				KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown/2;
				KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
				KinkyDungeonUpdateLightGrid = true; // Rerender since cam moved
			} else if (KDInteracting) {
				KDSendInput("interact", {x: KinkyDungeonTargetX, y: KinkyDungeonTargetY});
			} else if (KDModalArea || KinkyDungeonTargetTile) {
				KDModalArea = false;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
			} else {
				KinkyDungeonSetMoveDirection();

				if (KinkyDungeonTargetingSpell) {
					if (KDMouseInPlayableArea()) {
						//if (KinkyDungeoCheckComponents(KinkyDungeonTargetingSpell).length == 0) {
						if (KinkyDungeonSpellValid) {
							KDStartSpellcast(KinkyDungeonTargetX, KinkyDungeonTargetY, KinkyDungeonTargetingSpell, undefined, KinkyDungeonPlayerEntity, undefined, {targetingSpellItem: KinkyDungeonTargetingSpellItem, targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon});

							KinkyDungeonTargetingSpell = null;
							KinkyDungeonTargetingSpellItem = null;
							KinkyDungeonTargetingSpellWeapon = null;
						}
						/*} else {
							KinkyDungeonTargetingSpell = null;
							KinkyDungeonTargetingSpellItem = null;
							KinkyDungeonTargetingSpellWeapon = null;
						}*/
					} else {
						KinkyDungeonTargetingSpell = null;
						KinkyDungeonTargetingSpellItem = null;
						KinkyDungeonTargetingSpellWeapon = null;
					}
				} else if (KinkyDungeonIsPlayer() && KDMouseInPlayableArea()) {
					let fastMove = KinkyDungeonFastMove && !KinkyDungeonToggleAutoSprint;
					if (fastMove && KDistChebyshev(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x, KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y) > 0.5
					&& (KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0
						|| KinkyDungeonFogGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0
						|| KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonTargetX, KinkyDungeonPlayerEntity.y - KinkyDungeonTargetY) < 1.5)) {
						return !!KDFastMoveTo(KinkyDungeonTargetX, KinkyDungeonTargetY);
					} else if (!fastMove || Math.max(Math.abs(KinkyDungeonTargetX - KinkyDungeonPlayerEntity.x), Math.abs(KinkyDungeonTargetY - KinkyDungeonPlayerEntity.y)) <= 1) {
						KDSetFocusControl("");
						KDSendInput("move", {dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint});
					}
				}
			}
		} finally {
			CharacterRefresh = _CharacterRefresh;
			CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
		}
	}

	CharacterRefresh = _CharacterRefresh;
	CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
	return;
}

function KinkyDungeonGetMovable() {
	let MovableTiles = KDInteractableTiles;
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Squeeze") > 0) MovableTiles = MovableTiles + "b";
	return MovableTiles;
}

function KinkyDungeonListenKeyMove() {
	if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id))) return true;

	if (KinkyDungeonLastMoveTimer < performance.now() && (KinkyDungeonControlsEnabled() || KinkyDungeonInspect)
		&& KinkyDungeonDrawState == "Game" && !KDModalArea) {
		let moveDirection = null;
		let moveDirectionDiag = null;

		let MovableTiles = KinkyDungeonGetMovable();
		let itemsAtTile = (x: number, y: number) => {
			return KDMapData.GroundItems.some((item) => {return item.x == KinkyDungeonPlayerEntity.x + x && item.y == KinkyDungeonPlayerEntity.y + y;});
		};

		if ((KinkyDungeonGameKey.keyPressed[0]) && (KinkyDungeonInspect || itemsAtTile(0, -1) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x,  KinkyDungeonPlayerEntity.y - 1)))) moveDirection = KinkyDungeonGetDirection(0, -1);
		else if ((KinkyDungeonGameKey.keyPressed[1]) && (KinkyDungeonInspect || itemsAtTile(0, +1) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x,  KinkyDungeonPlayerEntity.y + 1)))) moveDirection = KinkyDungeonGetDirection(0, 1);
		else if ((KinkyDungeonGameKey.keyPressed[2]) && (KinkyDungeonInspect || itemsAtTile(-1, 0) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x - 1,  KinkyDungeonPlayerEntity.y)))) moveDirection = KinkyDungeonGetDirection(-1, 0);
		else if ((KinkyDungeonGameKey.keyPressed[3]) && (KinkyDungeonInspect || itemsAtTile(+1, 0) || MovableTiles.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + 1,  KinkyDungeonPlayerEntity.y)))) moveDirection = KinkyDungeonGetDirection(1, 0);
		// Diagonal moves
		if ((KinkyDungeonGameKey.keyPressed[4]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[0])) moveDirectionDiag = KinkyDungeonGetDirection(-1, -1);
		else if ((KinkyDungeonGameKey.keyPressed[5]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[0])) moveDirectionDiag = KinkyDungeonGetDirection(1, -1);
		else if ((KinkyDungeonGameKey.keyPressed[6]) || (KinkyDungeonGameKey.keyPressed[2] && KinkyDungeonGameKey.keyPressed[1])) moveDirectionDiag = KinkyDungeonGetDirection(-1, 1);
		else if ((KinkyDungeonGameKey.keyPressed[7]) || (KinkyDungeonGameKey.keyPressed[3] && KinkyDungeonGameKey.keyPressed[1])) moveDirectionDiag = KinkyDungeonGetDirection(1, 1);

		if ((KinkyDungeonGameKey.keyPressed[8])) {moveDirection = KinkyDungeonGetDirection(0, 0); moveDirectionDiag = null;}

		if (moveDirectionDiag && (KinkyDungeonInspect || itemsAtTile(moveDirectionDiag.x, moveDirectionDiag.y) || MovableTiles.includes(KinkyDungeonMapGet(moveDirectionDiag.x + KinkyDungeonPlayerEntity.x,  moveDirectionDiag.y + KinkyDungeonPlayerEntity.y)))) {
			moveDirection = moveDirectionDiag;
		}

		if (moveDirection) {
			if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimerStart > 0) {

				if (KinkyDungeonInspect) {
					KDInspectCamera.x += moveDirection.x;
					KDInspectCamera.y += moveDirection.y;
					KDInspectCamera.x = Math.max(-KinkyDungeonGridWidthDisplay, Math.min(KDInspectCamera.x, KDMapData.GridWidth));
					KDInspectCamera.y = Math.max(-KinkyDungeonGridHeightDisplay, Math.min(KDInspectCamera.y, KDMapData.GridHeight));
					KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown/2;
					KDLastForceRefresh = CommonTime() - KDLastForceRefreshInterval - 10;
					KinkyDungeonUpdateLightGrid = true; // Rerender since cam moved
				} else if (KDInteracting) {
					KDSendInput("interact", {x: KDPlayer().x + moveDirection.x, y: KDPlayer().y + moveDirection.y});
				} else {
					let _CharacterRefresh = CharacterRefresh;
					let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
					CharacterRefresh = () => {KDRefresh = true;};
					CharacterAppearanceBuildCanvas = () => {};

					try {
						KDSetFocusControl("");
						KDSendInput("move", {dir: moveDirection, delta: 1, AllowInteract: KinkyDungeonLastMoveTimer == 0, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false});
						KinkyDungeonLastMoveTimer = performance.now() + KinkyDungeonLastMoveTimerCooldown;
					} finally {
						CharacterRefresh = _CharacterRefresh;
						CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;
					}
				}

			} else if (KinkyDungeonLastMoveTimerStart == 0) {
				KinkyDungeonLastMoveTimerStart = performance.now()+ KinkyDungeonLastMoveTimerCooldownStart;
			}


		}
	}
	if (KinkyDungeonLastMoveTimerStart < performance.now() && KinkyDungeonLastMoveTimer == 0) KinkyDungeonLastMoveTimerStart = 0;
	if (!KinkyDungeonGameKey.keyPressed.some((element: any)=>{return element;})) { KinkyDungeonLastMoveTimer = 0;}
	//KDSetFocusControl("");
}

let KDShopBuyConfirm = false;

function KDEnter() {
	if (KDRenameNPC) {
		KDRenameNPC = false;
		if (KDSoundEnabled())
			AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + "LockLight" + ".ogg");

	}
}

function KDCheckCustomKeypress(): boolean {
	for (let b of Object.entries(KDButtonsCache)) {
		if (b[1].hotkeyPress == KinkyDungeonKeybindingCurrentKey) {
			if (KDClickButton(b[0], "hotkey", KinkyDungeonKeybindingCurrentKey)) {
				if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeySkip[0]) {
					KinkyDungeonGameKey.keyPressed[9] = false;
				}
				return true;
			}
		}
	}

	for (let keybinding of Object.values(KDKeyCheckers)) {
		if (keybinding()) return true;
	}
	return false;
}
function KinkyDungeonGameKeyDown() {
	let moveDirection = null;

	if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey
		&& document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)) {
		// @ts-ignore
		document.activeElement.blur();
		KDEnter();
	}
	if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id))) return true;

	if (KDCheckCustomKeypress()) return true;
	KDShopBuyConfirm = false;

	if (KinkyDungeonState == "TileEditor") {
		if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileU");
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileL");
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileD");
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("maptileR");
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		}
	}

	if (KDGameData.CurrentDialog) return;
	if (!KinkyDungeonControlsEnabled()) return;

	if (KDCustomKeyDown.some((c) => {return c(KinkyDungeonKeybindingCurrentKey);})) return true;
	else if (moveDirection && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
		KDSendInput("move", {dir: moveDirection, delta: 1, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: false});
		return true;
	} else if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKey)) {
		if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Magic") {
			if (KinkyDungeonSpellChoices.includes(KinkyDungeonCurrentPage)) {
				KDSendInput("spellRemove", {I:KinkyDungeonSpellChoices.indexOf(KinkyDungeonCurrentPage)});
			}
			KinkyDungeonClickSpellChoice(KinkyDungeonKeySpell.indexOf(KinkyDungeonKeybindingCurrentKey), KinkyDungeonCurrentPage);
		} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
			KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
			KinkyDungeonHandleSpell();
		}
		return true;
	} else if (KinkyDungeonKeyTab.includes(KinkyDungeonKeybindingCurrentKey)) {
		if (KinkyDungeonState == "Game") {
			let index = 1 + KinkyDungeonKeyTab.indexOf(KinkyDungeonKeybindingCurrentKey);
			if (localStorage.getItem('KinkyDungeonSpellsChoice' + String (index))) {
				KinkyDungeonSpellsConfig = String (index);
				KinkyDungeonLoadSpellsConfig();
			}
		}
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
		KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
		KinkyDungeonRangedAttack();
		return true;
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game"
		&& KinkyDungeonKeyUpcast.includes(KinkyDungeonKeybindingCurrentKey)) {
		if (KinkyDungeonKeybindingCurrentKey == KinkyDungeonKeyUpcast[0]) {
			KDSendInput("upcast", {});
		} else {
			KDSendInput("upcastcancel", {});
		}
		return true;
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKey)) {
		KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
		KDSwitchWeapon();
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchLoadout.includes(KinkyDungeonKeybindingCurrentKey)) {
		let i = 1 + KinkyDungeonKeySwitchLoadout.indexOf(KinkyDungeonKeybindingCurrentKey);
		// Load the loadout
		KDGameData.CurrentLoadout = i;
		KDLoadQuickLoadout(i, true);

		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
		return true;
	} else if (KinkyDungeonState == "Stats") {
		if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("perks>");
		} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton("perks<");
		}
	} else if (KinkyDungeonDrawState != "Restart" && KinkyDungeonDrawState != "Keybindings" && KinkyDungeonDrawState != "Perks2") {
		if (KinkyDungeonDrawState == "Inventory" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentPageInventory += 1;
			} else if (KinkyDungeonCurrentPageInventory > 0) {
				KinkyDungeonCurrentPageInventory -= 1;
			} else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonDrawState = "Game";
				KDResetAlternateInventoryRender();

				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonDressPlayer();
			}
		} else if (KinkyDungeonDrawState == "Magic" && (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentPage += 1;
				if (KinkyDungeonCurrentPage >= KinkyDungeonSpells.length) {
					KinkyDungeonCurrentPage = 0;
				}
			} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentPage >= 0) {
				KinkyDungeonCurrentPage -= 1;
				if (KinkyDungeonCurrentPage < 0) {
					KinkyDungeonCurrentPage =  KinkyDungeonSpells.length - 1;
				}
			} else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
				if (KinkyDungeonPreviewSpell) {
					if (KinkyDungeonPreviewSpell.hideLearned) KinkyDungeonDrawState = "MagicSpells";
					KDSendInput("spellLearn", {SpellName: KinkyDungeonPreviewSpell.name});
				}
				else KinkyDungeonDrawState = "MagicSpells";
			}
		} else if ((KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage")
				&& (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey)) {
			if (!KDGameData.CollectionSorted) {KDSortCollection();}
			let index = KDGameData.CollectionSorted.findIndex((entry) => {return entry.id == (KDCollectionSelected || -1);});
			if (index > -1) {
				if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
					index += 1;
					if (index >= KDGameData.CollectionSorted.length) {
						index = 0;
					}
				} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentPage >= 0) {
					index -= 1;
					if (index < 0 ) {
						index = KDGameData.CollectionSorted.length - 1;
					}
				}
				if (index > -1 && KDGameData.CollectionSorted[index]) {
					KDCollectionSelected = KDGameData.CollectionSorted[index].id;
					KDResetCollectionUI();
					index = KDGameData.CollectionSorted.findIndex((entry) => {return entry.id == (KDCollectionSelected || -1);});
					while (index >= KDCollectionIndex + KDCollectionColumns*KDCollectionRows) {
						KDCollectionIndex += KDCollectionColumns;
					}
					while (index < KDCollectionIndex) {
						KDCollectionIndex -= KDCollectionColumns;
					}

				}
			}

		} else if (KinkyDungeonDrawState == "MagicSpells"
			&& (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey
				|| KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey
				|| KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey
				|| KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey
				|| KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey)) {
			if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonCurrentSpellsPage += 1;
				if (KinkyDungeonCurrentSpellsPage >= KinkyDungeonLearnableSpells.length) KinkyDungeonCurrentSpellsPage = 0;
			} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey && KinkyDungeonCurrentSpellsPage >= 0) {
				KinkyDungeonCurrentSpellsPage -= 1;
				if (KinkyDungeonCurrentSpellsPage < 0) KinkyDungeonCurrentSpellsPage = KinkyDungeonLearnableSpells.length - 1;
			} else if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
				KDClickButton("spellsUp");
			} else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
				KDClickButton("spellsDown");
			}
			else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonDrawState = "Game";
				KDResetAlternateInventoryRender();


				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonDressPlayer();
			}
		} else
		if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKey)) {
			switch (KinkyDungeonKeybindingCurrentKey) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory"; break;
				//case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Reputation" ? "Game" : "Reputation"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook"; break;
				//case KinkyDungeonKeyMenu[5]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Quest" ? "Game" : "Quest"; break;
				//case KinkyDungeonKeyMenu[6]: KinkyDungeonDrawState = (KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage") ? "Game" : "Collection"; break;
				//case KinkyDungeonKeyMenu[7]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Facilities" ? "Game" : "Facilities"; break;
				/*case KinkyDungeonKeyMenu[9]: {
					KinkyDungeonDrawState = KinkyDungeonDrawState == "JourneyMap" ? "Game" : "JourneyMap";
					KDGameData.UseJourneyTarget = false;
					break;}*/
				case KinkyDungeonKeyMenu[4]: {
					KinkyDungeonDrawState = "Restart";
					KDConfirmDeleteSave = false;
					if (KDDebugMode) {
						ElementCreateTextArea("DebugEnemy");
						ElementValue("DebugEnemy", "Maidforce");
						ElementCreateTextArea("DebugItem");
						ElementValue("DebugItem", "TrapArmbinder");
					} else {
						if (document.getElementById("DebugEnemy")) {
							ElementRemove("DebugEnemy");
						}
						if (document.getElementById("DebugItem")) {
							ElementRemove("DebugItem");
						}
					}
					break;
				}
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		}
	} else if (KinkyDungeonDrawState == "Restart"

		&& !(
			// @ts-ignore
			(CommonIsMobile || document.activeElement?.type == "text" || document.activeElement?.type == "textarea")
		)
	) {
		if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKey)) {
			KDResetAlternateInventoryRender();
			switch (KinkyDungeonKeybindingCurrentKey) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KDShowInventory(null); break;
				//case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = "Reputation"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = "MagicSpells"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = "Logbook"; break;
				//case KinkyDungeonKeyMenu[5]: KinkyDungeonDrawState = "Quest";
				//	KDSortQuests(KDPlayer()); break;
				//case KinkyDungeonKeyMenu[6]: KinkyDungeonDrawState = "Collection"; break;
				//case KinkyDungeonKeyMenu[7]: KinkyDungeonDrawState = "Facilities"; break;
				/*case KinkyDungeonKeyMenu[9]: {
					KinkyDungeonDrawState = "JourneyMap"; 
					KDGameData.UseJourneyTarget = false;
					break;}*/
				case KinkyDungeonKeySkip[0]:
				case KinkyDungeonKeyMenu[4]:
					KinkyDungeonDrawState = "Game"; break;
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		}
	}
	KinkyDungeonKeybindingCurrentKey = '';
	return false;
}




function KinkyDungeonGameKeyUp(lastPress: number): boolean {
	//if (KDGameData.CurrentDialog) return;
	//if (!KinkyDungeonControlsEnabled()) return;
	let delta = CommonTime() - lastPress;

	if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id))) return true;


	// Holding for a minute = fail
	if (delta > 60000) return;
	// tap = fail
	if (delta < 250 && !(KDToggles.ShiftLatch && !KinkyDungeonKeybindingCurrentKey.includes("Shift") && KinkyDungeonKeybindingCurrentKeyRelease.includes("Shift"))) return;

	if (KDCustomKeyUp.some((c) => {return c(KinkyDungeonKeybindingCurrentKey);})) return true;
	else if (KinkyDungeonState == "Game") {
		if (document.activeElement) {
			if (KinkyDungeonKeySpell.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
				if (KinkyDungeonDrawState == "Game") {
					KinkyDungeonTargetingSpell = null;
					KinkyDungeonTargetingSpellItem = null;
					KinkyDungeonTargetingSpellWeapon = null;
				}
				return true;
			} else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
				KinkyDungeonTargetingSpell = null;
				return true;
			} else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeySprint.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
				KinkyDungeonToggleAutoSprint = !KinkyDungeonToggleAutoSprint;
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
				return true;
			} else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeySwitchWeapon.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
				KDSwitchWeapon();
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
				return true;
			}
		}
		if (KinkyDungeonKeyMenu.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
			switch (KinkyDungeonKeybindingCurrentKeyRelease) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: if (KinkyDungeonDrawState == 'Game') KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Inventory" ? "Game" : "Inventory"; break;
				//case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Reputation" ? "Game" : "Reputation"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook"; break;
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		} else if (KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKeyRelease) && KinkyDungeonDrawState == 'Game') {
			switch (KinkyDungeonKeybindingCurrentKeyRelease) {
				// Log, Passing, Door, Auto Struggle, Auto Pathfind
				//case KinkyDungeonKeyToggle[0]: KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle; break;
				case KinkyDungeonKeyToggle[1]: KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass; break;
				case KinkyDungeonKeyToggle[2]: KDInteracting = !KDInteracting; break;
				case KinkyDungeonKeyToggle[3]: KDAutoStruggleClick(); break;
				case KinkyDungeonKeyToggle[4]: KinkyDungeonFastMove = !KinkyDungeonFastMove; break;
				case KinkyDungeonKeyToggle[5]: KinkyDungeonInspect = !KinkyDungeonInspect; KinkyDungeonUpdateLightGrid = true; break;
				case KinkyDungeonKeyToggle[10]: KDBulletTransparency = !KDBulletTransparency; break;
				case KinkyDungeonKeyToggle[12]: KDStatusToggle = !KDStatusToggle; break;
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		}
	}

	KinkyDungeonKeybindingCurrentKey = '';
	return false;
}

function KinkyDungeonSendTextMessage(priority: number, text: string, color: string, time?: number, noPush?: boolean, noDupe?: boolean, entity?: entity, filter: string = "Self"): boolean {
	if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1) return false;
	if (text) {
		if (!noPush)
			if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1].text) {
				if (KDLogIndex > 0) KDLogIndex += 1;
				KinkyDungeonMessageLog.push({text: text, color: color, time: KinkyDungeonCurrentTick, filter: filter});
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


function KinkyDungeonSendActionMessage(priority: number, text: string, color: string, time: number, noPush?: boolean, noDupe?: boolean, entity?: entity, filter: string = "Action", antifilter?: any): boolean {
	if (entity && KinkyDungeonVisionGet(entity.x, entity.y) < 1) return false;
	if (text) {
		if (!noPush)
			if (!noDupe || KinkyDungeonMessageLog.length == 0 || !KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1] || text != KinkyDungeonMessageLog[KinkyDungeonMessageLog.length-1].text){
				if (KDLogIndex > 0) KDLogIndex += 1;
				KinkyDungeonMessageLog.push({text: text, color: color, time: KinkyDungeonCurrentTick, filter: filter, antifilter: antifilter});
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

function KDAttackCost(weapon?: weapon, noEvent?: boolean) {
	let data = {
		attackCost: KinkyDungeonStatStaminaCostAttack,
		stamPenType: KDWeaponStamPenType(KinkyDungeonPlayerDamage),
		orig: KinkyDungeonStatStaminaCostAttack,
		bonus: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStaminaBonus"),
		mult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")),
	};
	if (!weapon) weapon = KinkyDungeonPlayerDamage;
	if (weapon && weapon.staminacost) data.attackCost = -weapon.staminacost;

	if (!noEvent) {
		if (KDSTAMPENTYPE[data.stamPenType]?.onAttack) {
			KDSTAMPENTYPE[data.stamPenType].onAttack(data);
		}

		KinkyDungeonSendEvent("attackCost", data);
	}

	data.attackCost = Math.min(0, (data.attackCost + data.bonus) * data.mult);
	return data;
}

/** Capture enemy instead of attacking. */
function KDShouldCapture(Enemy: entity) {
	return Enemy && KDHelpless(Enemy) && Enemy.hp < 0.52;
}

/** Tease enemy instead of attacking */
function KDShouldTease(Enemy: entity) {
	return !KDHostile(Enemy) && KDCanDom(Enemy) && Enemy.hp > 0.51
		&& !KDEntityHasFlag(Enemy, "stopplay");
}

/**
 * @param Enemy
 * @param [skip]
 */
function KinkyDungeonLaunchAttack(Enemy: entity, skip?: number): string {
	let ac = KDAttackCost();
	let attackCost = ac.attackCost;
	let capture = false;
	let result = "fail";
	if (!Enemy.Enemy) return result;
	if (Enemy) {
		KDTurnToFace(Enemy.x - KinkyDungeonPlayerEntity.x, Enemy.y - KinkyDungeonPlayerEntity.y);
	}

	let teasesub = KDShouldTease(Enemy);
	if (!teasesub && KDShouldCapture(Enemy)) {
		attackCost = 0;
		capture = true;
	}
	let noadvance = false;
	let talk = KDTalkToEnemy(Enemy);
	if (KinkyDungeonHasStamina(Math.abs(attackCost), true) || talk) {
		if (talk) {
			let d = Enemy.Enemy.specialdialogue ? Enemy.Enemy.specialdialogue : "GenericAlly";
			if ((!Enemy.specialdialogue && !Enemy.prisondialogue) && KDIsImprisoned(Enemy)) d = "PrisonerJailBug";
			else if (Enemy.prisondialogue && KDIsImprisoned(Enemy)) d = Enemy.prisondialogue; // Special dialogue override
			else if (Enemy.specialdialogue) d = Enemy.specialdialogue; // Special dialogue override
			if (d || ((!Enemy.lifetime || Enemy.lifetime > 9000) && !Enemy.Enemy.tags.notalk)) { // KDAllied(Enemy)

				KDStartDialog(d, Enemy.Enemy.name, true, Enemy.personality, Enemy);
				noadvance = true;
				result = "dialogue";
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
					KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), KDBaseRed, 1);
					KDGameData.ConfirmAttack = true;
					noadvance = true;
				}
			}*/
			else {
				KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), KDBaseRed, 1);
				KDGameData.ConfirmAttack = true;
                if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ClickError.ogg");
				noadvance = true;
				result = "confirm";
			}

		} else {
			if (!capture) {
				let res = KDDoAttack(Enemy, teasesub, attackCost, skip);
				if (res.result) result = res.result;
				skip = res.skip;

			} else {
				KDDoCapture(Enemy, attackCost, noadvance, skip);
				//KDAddOpinionPersistent(Enemy.id, -50);
				result = "capture";
			}

			KinkyDungeonLastAction = "Attack"; KDPauseBalance(5);
			KDGameData.ConfirmAttack = false;
		}
	} else {
		KinkyDungeonWaitMessage(false, 1);
	}

	if (!noadvance) {
		KinkyDungeonInterruptSleep();
		if (!skip)
			KinkyDungeonAdvanceTime(1);
	}
	return result;
}

function KDDoAttack(Enemy: entity, teasesub: boolean, attackCost: number, skip: number) {
	let result = "";
	let damageInfo: damageInfo = {
		name: KinkyDungeonPlayerDamage.name,
		damage: KinkyDungeonPlayerDamage.damage,
		type: KinkyDungeonPlayerDamage.type,
		distract: KinkyDungeonPlayerDamage.distract,
		distractEff: KinkyDungeonPlayerDamage.distractEff,
		desireMult: KinkyDungeonPlayerDamage.desireMult,
		bind: KinkyDungeonPlayerDamage.bind,
		bindType: KinkyDungeonPlayerDamage.bindType,
		bindEff: KinkyDungeonPlayerDamage.bindEff,

		nodisarm: KinkyDungeonPlayerDamage.nodisarm,
		nocrit: KinkyDungeonPlayerDamage.nocrit,
		noblock: KinkyDungeonPlayerDamage.noblock,
		nokill: KinkyDungeonPlayerDamage.nokill,
		evadeable: false,

		addBind: KinkyDungeonPlayerDamage.addBind,
		bindcrit: KinkyDungeonPlayerDamage.bindcrit,
		crit: KinkyDungeonPlayerDamage.crit,
		sfx: KinkyDungeonPlayerDamage.sfx,
		time: KinkyDungeonPlayerDamage.time,

		ignoreshield: KinkyDungeonPlayerDamage.ignoreshield,
		shield_crit: KinkyDungeonPlayerDamage.shield_crit, // Crit thru shield
		shield_stun: KinkyDungeonPlayerDamage.shield_stun, // stun thru shield
		shield_freeze: KinkyDungeonPlayerDamage.shield_freeze, // freeze thru shield
		shield_bind: KinkyDungeonPlayerDamage.shield_bind, // bind thru shield
		shield_snare: KinkyDungeonPlayerDamage.shield_snare, // snare thru shield
		shield_slow: KinkyDungeonPlayerDamage.shield_slow, // slow thru shield
		shield_distract: KinkyDungeonPlayerDamage.shield_distract, // Distract thru shield
		shield_vuln: KinkyDungeonPlayerDamage.shield_vuln, // Vuln thru shield
		boundBonus: KinkyDungeonPlayerDamage.boundBonus,
		novulnerable: KinkyDungeonPlayerDamage.novulnerable,
		tease: KinkyDungeonPlayerDamage.tease};

	if (KinkyDungeonPlayerDamage.stam50mult && KinkyDungeonStatStamina/KinkyDungeonStatStaminaMax >= 0.50) {
		damageInfo.damage *= KinkyDungeonPlayerDamage.stam50mult;
	}
	let data = {
		orighp: Enemy.hp,
		origbinding: Enemy.boundLevel,
		target: Enemy,
		attackCost: attackCost,
		attackCostOrig: KinkyDungeonPlayerDamage.staminacost ? -KinkyDungeonPlayerDamage.staminacost : 0,
		skipTurn: false,
		attackData: damageInfo
	};
	KinkyDungeonSendEvent("beforePlayerLaunchAttack", data);
	if (attackCost < 0 && KinkyDungeonStatsChoice.has("BerserkerRage")) {
		KDChangeDistraction("BerserkerRage", "perk", "attack", 0.7 - 0.5 * data.attackCost, false, 0.33);
	}
	if (KDGameData.HeelPowerEffective > 0)
		KDChangeBalanceSrc("heels", "debuff", "attack", data.attackCost * KDGetBalanceCost() * (0.75 + 0.5 * KDRandom()) * KDBalanceAttackMult*10*KDFitnessMult(), true, true, 1);

	let origHP = Enemy.hp;
	if (KinkyDungeonAttackEnemy(data.target, data.attackData, undefined, undefined, KinkyDungeonPlayerDamage)) {
		result = "hit";
	} else {
		result = "miss";
	}

	if (teasesub && origHP > 0.5) {
		Enemy.hp = Math.max(0.51, Enemy.hp);
		KinkyDungeonSetEnemyFlag(Enemy, "stopplay", 4);

		KDAddThought(Enemy.id, "PlayDone", 10, 8);
		Enemy.playWithPlayer = Math.min(Enemy.playWithPlayer || 0, 1);
		KDSetPlayCD(Enemy, 1.5, 3);
	}

	let dmgTotal = -(Enemy.hp - data.orighp);
	let bondageTotal = (Enemy.boundLevel - data.origbinding);
	if (dmgTotal > 0) {
		let atk = bondageTotal > 0 ? "KDAttackBind" : "KDAttack";
		KinkyDungeonSendActionMessage(3.5,
			TextGet(atk)
				.replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name))
				.replace("DamageDealt", "" + Math.round(dmgTotal * 10))
				.replace("BondageDealt", "" + Math.round(bondageTotal * 10)),
			KDBaseWhite, 2, undefined, undefined, undefined, "TotalDamage");
	} else {
		KinkyDungeonSendActionMessage(3.5,
			TextGet("KDAttackMiss").replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)).replace("DamageDealt", "" + Math.round(dmgTotal * 10)),
			KDBaseWhite, 2, undefined, undefined, undefined, "Action", "Combat");
	}

	if (data.skipTurn) skip = 1;
	KDChangeStamina("attack", "weapon", "attack", data.attackCost, false, 1);
	KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "attack", 1);
	if (!KinkyDungeonPlayerDamage.noHands) {
		KinkyDungeonSetFlag("armattack", 1);
		let nearby = KDNearbyEnemies(KDPlayer().x, KDPlayer().y, 10, undefined, true)
			.filter((en) => {return !!en.aware;});
		let f = "";
		for (let en of nearby) {
			f = "saw_Arms";
			if (!en.flags || !en.flags[f])
			KDSetIDFlag(en.id, f, -1);
		}
	}
	KinkyDungeonSetEnemyFlag(data.target, "targetedForAttack", 4);
	return {result: result, skip: skip};
}


function KDDoCapture(Enemy: entity, attackCost: number, noadvance: boolean, skip: number) {
	if ((Enemy.lifetime > 9000 || !Enemy.maxlifetime))
		KinkyDungeonAggro(Enemy, undefined, KinkyDungeonPlayerEntity);
	Enemy.hp = 0;
	KinkyDungeonKilledEnemy = Enemy;

	KDGameData.Guilt = Math.max(0, (KDGameData.Guilt || 0) + KDEnemyRank(Enemy))

	KinkyDungeonSendEvent("capture", {enemy: Enemy, attacker: KinkyDungeonPlayerEntity, skip: skip});
	if (!KDIDHasFlag(Enemy.id, "capOpPen")) {
		KDSetIDFlag(Enemy.id, "capOpPen", -1);
		KDAddOpinionPersistent(Enemy.id, -50);
	}
	KDChangeStamina("capture", "capture", "attack", attackCost, false, 1);
	KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "capture", 1);
	if (KDGameData.Collection[Enemy.id + ""]) {
		KDGameData.Collection[Enemy.id + ""].status = "";
		KDSortCollection();
	}
	KDFreeNPC(Enemy);
	Enemy.hp = 0;
	KDSetToExpectedBondage(Enemy, 0);
	KinkyDungeonSetEnemyFlag(Enemy, "cap", noadvance ? 1 : 2);
	if (KDDoCollect(Enemy)) {
		KDAddCollection(Enemy);
	}
	else {
		KDFreeNPCRestraints(Enemy.id, KDPlayer().id);
		KDReleasePenaltyEntity(Enemy, KDPlayer().id);

		KinkyDungeonSendTextMessage(10, TextGet("KDAutoReleased_NonNotable")
			.replace("NME", KDGetEnemyTypeName(Enemy)),
KDBaseWhite, 4);
	}
	if (KDIsNPCPersistent(Enemy.id)) {
		KDGetPersistentNPC(Enemy.id).collect = true;
		KDTPToSummit(Enemy.id);
		KDGetPersistentNPC(Enemy.id).captured = false;
		KDUpdatePersistentNPC(Enemy.id);
	}
}

function KDPlayerCanMove(player, x, y) {
	return KinkyDungeonGetMovable().includes(KinkyDungeonMapGet(x, y));
}

function KinkyDungeonMove(moveDirection: {x: number, y: number }, delta: number, AllowInteract: boolean, SuppressSprint?: boolean,
	forceSprint?: boolean): boolean {
	let moveX = moveDirection.x + KinkyDungeonPlayerEntity.x;
	let moveY = moveDirection.y + KinkyDungeonPlayerEntity.y;
	let moved = false;
	let Enemy = KinkyDungeonEnemyAt(moveX, moveY);
	let passThroughSprint = false;
	let nextPosX = moveX*2-KinkyDungeonPlayerEntity.x;
	let nextPosY = moveY*2-KinkyDungeonPlayerEntity.y;
	let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
	if (forceSprint) SuppressSprint = false;
	if (KinkyDungeonMovableTilesEnemy.includes(nextTile)
		&& KinkyDungeonNoEnemy(nextPosX, nextPosY) && (forceSprint || KinkyDungeonToggleAutoSprint)) {
		let data = {
			canSprint: KDCanSprint(),
			passThru: false,
			nextPosx: moveX,
			nextPosy: moveY,
		};
		KinkyDungeonSendEvent("canSprint", data);
		if (data.canSprint && data.passThru && !SuppressSprint) {
			passThroughSprint = true;
		}
	}

	let allowPass: boolean = Enemy
		&& KDCanPassEnemy(KinkyDungeonPlayerEntity, Enemy);
	if (Enemy && KDEnemyHasFlag(Enemy, "forcetalk") && KinkyDungeonFastMove) {
		allowPass = false;
		KinkyDungeonSetEnemyFlag(Enemy, "forcetalk", 0);
	}
	if (Enemy && !allowPass && !passThroughSprint) {
		if (AllowInteract) {
			KDDelayedActionPrune(["Action", "Attack"]);
			KinkyDungeonInterruptSleep();
			KinkyDungeonLaunchAttack(Enemy);
			KinkyDungeonFastMovePath = [];
		}
	} else {
		let MovableTiles = KinkyDungeonGetMovable();
		let moveObject = KinkyDungeonMapGet(moveX, moveY);
		if (MovableTiles.includes(moveObject) && (passThroughSprint || KinkyDungeonNoEnemy(moveX, moveY) || (Enemy && KDAllied(Enemy)) || allowPass)) { // If the player can move to an empy space or a door
			KDGameData.ConfirmAttack = false;
			let quick = false;

			if (KinkyDungeonTilesGet("" + moveX + "," + moveY)
				&& KinkyDungeonTilesGet("" + moveX + "," + moveY).Type
				&& (
					(
						(
							KDObjectDraw[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type]
							|| KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type]
						)
						&& (KinkyDungeonTilesGet("" + moveX + "," + moveY).Type != "Door"
							|| (
								KinkyDungeonMapGet(moveX, moveY) == 'D'
							&& KinkyDungeonTilesGet("" + moveX + "," + moveY).Lock
							&& KinkyDungeonTilesGet("" + moveX + "," + moveY).Type == "Door"))))) {
				if (AllowInteract) {
					if (KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type]) {
						KDObjectClick[KinkyDungeonTilesGet("" + moveX + "," + moveY).Type](moveX, moveY);
						if (KDMapData.GroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
							// We can pick up items inside walls, in case an enemy drops it into bars
							KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
						}
					} else {
						KDDelayedActionPrune(["Action", "World"]);
						KinkyDungeonTargetTileLocation = "" + moveX + "," + moveY;
						KinkyDungeonTargetTile = KinkyDungeonTilesGet(KinkyDungeonTargetTileLocation);

						KinkyDungeonInterruptSleep();

						KinkyDungeonTargetTileMsg();
						if (KDMapData.GroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
							// We can pick up items inside walls, in case an enemy drops it into bars
							KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
							KinkyDungeonInterruptSleep();
							KinkyDungeonAdvanceTime(1);
						}
					}
				}
			} else if (moveX != KinkyDungeonPlayerEntity.x || moveY != KinkyDungeonPlayerEntity.y) {
				KDDelayedActionPrune(["Action", "Move"]);
				let newDelta = 1;
				KinkyDungeonTargetTile = null;
				KinkyDungeonTargetTileLocation = "";
				KDModalArea = false;
				// We can pick up items inside walls, in case an enemy drops it into bars
				KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
				if (!KinkyDungeonHandleMoveObject(moveX, moveY, moveObject)) {// Move
					KinkyDungeonNoMoveFlag = false;
					KinkyDungeonConfirmStairs = false;
					KinkyDungeonSendEvent("beforeMove", {x:moveX, y:moveY});
					let sprintcost = KDSprintCost();
					if (!KinkyDungeonNoMoveFlag) {
						//if (KinkyDungeonHasStamina(0)) { // You can only move if your stamina is > 0
						if (isNaN(KDGameData.MovePoints)) KDGameData.MovePoints = 0;
						KDGameData.MovePoints = Math.min(Math.ceil(KinkyDungeonSlowLevel + 1), KDGameData.MovePoints + delta); // Can't store extra move points

						let lastFacingX = KinkyDungeonPlayerEntity.facing_x || 0;
						let lastFacingY = KinkyDungeonPlayerEntity.facing_y || 0;


						KinkyDungeonPlayerEntity.facing_x = Math.min(1, Math.abs(moveX - KinkyDungeonPlayerEntity.x)) * Math.sign(moveX - KinkyDungeonPlayerEntity.x);
						KinkyDungeonPlayerEntity.facing_y = Math.min(1, Math.abs(moveY - KinkyDungeonPlayerEntity.y)) * Math.sign(moveY - KinkyDungeonPlayerEntity.y);
						if (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y) {
							KinkyDungeonPlayerEntity.facing_x_last = KinkyDungeonPlayerEntity.facing_x;
							KinkyDungeonPlayerEntity.facing_y_last = KinkyDungeonPlayerEntity.facing_y;
						}
						let inertia = KinkyDungeonPlayerEntity.facing_y*lastFacingY + KinkyDungeonPlayerEntity.facing_x*lastFacingX;
						if ((KinkyDungeonPlayerEntity.facing_y || KinkyDungeonPlayerEntity.facing_x)
							&& (KDGetInertia(KDPlayer()) > 0)) {
							let D = Math.abs(KinkyDungeonPlayerEntity.facing_y - lastFacingY)**2
								+ Math.abs(KinkyDungeonPlayerEntity.facing_x - lastFacingX)**2;
							let dotProd = KinkyDungeonPlayerEntity.facing_y*lastFacingY + KinkyDungeonPlayerEntity.facing_x*lastFacingX;

							if (dotProd < 0 || ((D > 1 && (lastFacingY || lastFacingX)) && KDGetInertia(KDPlayer()) > 1)) {
								KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 0);
								if (D > 2) KinkyDungeonSendTextMessage(10, TextGet("KDTurn2"), KDBaseWhite, 1);
								else KinkyDungeonSendTextMessage(9, TextGet("KDTurn1"), KDBaseWhite, 1);
							}
						}

						if (KinkyDungeonFlags.has("Quickness") && KinkyDungeonSlowLevel < 9) {
							KDGameData.MovePoints = KinkyDungeonSlowLevel + 1;
							quick = true;
						}

						if (KinkyDungeonStatBind) KDGameData.MovePoints = Math.min(0, KDGameData.MovePoints);
						//let MovePoints = KDGameData.MovePoints;

						let willSprint = (forceSprint || KinkyDungeonToggleAutoSprint) && !SuppressSprint;

						if (KDGameData.MovePoints >= 1 || (willSprint && KDCanSprint(sprintcost))) {// Math.max(1, KinkyDungeonSlowLevel) // You need more move points than your slow level, unless your slow level is 1
							let xx = KinkyDungeonPlayerEntity.x;
							let yy = KinkyDungeonPlayerEntity.y;
							let dx = (Enemy?.x || 0) - KinkyDungeonPlayerEntity.x;
							let dy = (Enemy?.y || 0) - KinkyDungeonPlayerEntity.y;

							newDelta = Math.max(newDelta, KinkyDungeonMoveTo(moveX, moveY,
								willSprint, allowPass, sprintcost));
							if (newDelta > 0) {
								if (Enemy && allowPass) {
									// push by default
									
									let pushTile = (KinkyDungeonFlags.has("PassthroughAll") || KDEnemyHasFlag(Enemy, "passthrough"))
										? undefined
										: KDGetPushTile(Enemy, dx, dy);
									if (pushTile && KDMoveEntity(Enemy, pushTile.x, pushTile.y, true,undefined, undefined, true)) {
										pushTile = undefined;
									}
									if (!pushTile) {
										// fallback is swap
										KDMoveEntity(Enemy, xx, yy, true,undefined, undefined, true);
									}

									if (KinkyDungeonFlags.has("Passthrough"))
										KinkyDungeonSetFlag("Passthrough", 2);
									if (KinkyDungeonFlags.has("PassthroughAll"))
										KinkyDungeonSetFlag("PassthroughAll", 2);

									if (KinkyDungeonFlags.has("PassthroughP"))
										KinkyDungeonSetFlag("PassthroughP", 2);
									if (KinkyDungeonFlags.has("PassthroughPAll"))
										KinkyDungeonSetFlag("PassthroughPAll", 2);
									if (Enemy.Enemy?.stunWhenSwap) {
										Enemy.stun = Math.max(Enemy.stun || 0, 2);
									}
								}
								KinkyDungeonLastAction = "Move";
								moved = true;
								if (KDSoundEnabled()) {
									if (quick) {
										KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Miss.ogg");
									} else {
										if (moveObject == 'w' || moveObject == 'W')
											KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/FootstepWater.ogg");
										else KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/Footstep.ogg");
									}

								}

								if (moveObject == 'g') {
									KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonGrateEnter"), KDBaseWhite, 3);
									//KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, 1);
									KDStunTurns(1, true);
									//KDGameData.KneelTurns = CommonTime() + 250;
								}
							}
						}

						// Messages to inform player they are slowed
						let plugLevel = Math.round(Math.min(3, KinkyDungeonStatPlugLevel));
						let dict = KinkyDungeonPlugCount > 1 ? "plugs" : "plug";
						let dicts = KinkyDungeonPlugCount > 1 ? "" : "s";
						if (KinkyDungeonSlowLevel == 0 && KinkyDungeonPlugCount > 0) KinkyDungeonSendTextMessage(0, TextGet("KinkyDungeonPlugWalk" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
						if (KinkyDungeonSlowLevel == 1 && !KinkyDungeonStatsChoice.has("HeelWalker")) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonSlowed" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "yellow", 2, true);
						else if (KinkyDungeonSlowLevel == 2) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHopping" + (KDGameData.Crouch ? "Crouch" : "") + plugLevel).replace("plugs", dict).replace("(s)", dicts), "orange", 2, true);
						else if (KinkyDungeonSlowLevel == 3) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonInching" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);
						else if (KinkyDungeonSlowLevel > 3 && KinkyDungeonSlowLevel < 10) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrawling" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);
						else if (KinkyDungeonSlowLevel >= 10) KinkyDungeonSendActionMessage(1, TextGet("KinkyDungeonCantMove" + plugLevel).replace("plugs", dict).replace("(s)", dicts), KDBaseRed, 2, true);

						let moveMult = Math.max(1, KinkyDungeonSlowLevel);

						if (KinkyDungeonStatsChoice.has("Quickness")) {
							KinkyDungeonSetFlag("BlockQuicknessPerk", 3 + moveMult);
						}
						if (quick) moveMult = 1;
						if (KinkyDungeonSlowLevel > 9) moveMult = 1;
						if ((moveDirection.x != 0 || moveDirection.y != 0)) {
							if (moved) {
								if (KinkyDungeonSlowLevel > 1 || (!KinkyDungeonStatsChoice.has("HeelWalker") && KinkyDungeonSlowLevel > 0)) {
									if (KinkyDungeonSlowLevel < 10) {
										KDChangeStamina("slow", "debuff", "move", moveMult * (KinkyDungeonStatStaminaRegenPerSlowLevel * KinkyDungeonSlowLevel) * delta, false, moveMult, true);
									}
								}
								if (KDGameData.HeelPowerEffective > 0 && !KDGameData.Crouch ) {

									KDChangeBalanceSrc("heels", "debuff", "move", -KDGetBalanceCost() * (0.75 + 0.5 * KDRandom()) * (1 + Math.max(-inertia, 0) * KDBalanceInertiaMult)*moveMult, true, true, 1);
								} else {
									//KDChangeBalance((KDGameData.KneelTurns > 0 ? 0.5 : 0.25) * KDGetBalanceRate()*delta, true);
								}
								let plugIncreaseAmount = (KinkyDungeonStatPlugLevel * KinkyDungeonDistractionPerPlug);
								KinkyDungeonStatDistraction += plugIncreaseAmount;
								if (plugIncreaseAmount > 0) KinkyDungeonStatDistractionLower += plugIncreaseAmount * 0.2;
								if (KinkyDungeonHasCrotchRope) {
									if (KinkyDungeonStatPlugLevel == 0) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrotchRope"), "pink", 2);
									KinkyDungeonStatDistraction += (KinkyDungeonCrotchRopeDistraction);

									if (moveMult > 0) KinkyDungeonStatDistractionLower += (KinkyDungeonCrotchRopeDistraction) * 0.2;
								}
							}
						} else {
							KinkyDungeonWaitMessage(false, quick ? 0 : 1, KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax);

							KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
						}
						/*if (moved) {
							if (MovePoints > 0) {
								newDelta = Math.max(1, newDelta - MovePoints);
							}
						}*/

						//}

						if (KinkyDungeonSlowLevel >= 10) {
							let data: KDFailMoveData = {
								player: KinkyDungeonPlayerEntity,
								moveX: moveX,
								moveY: moveY,
								cancelSprint: false,
							};
							KinkyDungeonSendEvent("failMove", data)
						}
					}

					if (KDGameData.Balance <= 0 && !KDGameData.Crouch && newDelta < 10 && !quick) {
						KDTrip(delta + Math.max(1, newDelta));
					}
					KinkyDungeonAdvanceTime(quick ? 0 : 1);
				}
				KinkyDungeonInterruptSleep();
				//for (let d = 0; d < newDelta; d++)
				// KinkyDungeonAdvanceTime(1, false, d != 0); // was moveDirection.delta, but became too confusing

				if (newDelta > 1 && newDelta < 10 && !quick) {
					if (KDToggles.LazyWalk && !KinkyDungeonInDanger()) {
						KDGameData.SlowMoveTurns = newDelta - 1;
						KDUpdateWaitTime(200);
					} else {
						KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 1-newDelta);
					}
				}
				if (KDGameData.MovePoints < 0) {
					if (!KinkyDungeonFlags.get("tut_slo")) {
						KinkyDungeonSendTextMessage(10, TextGet("KDTut_Slowed"), KDTutorialColor, 10);
						KinkyDungeonSetFlag("tut_slo", -1);
					}
				}
				if (!(KDGameData.KneelTurns > 0))
					KDPauseBalance(5);
			} else {
				//KDChangeBalance((KDGameData.KneelTurns > 0 ? 1.5 : 1.0) * KDGetBalanceRate()*delta, true);
				KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
				KinkyDungeonPlayerEntity.facing_x = 0;
				KinkyDungeonPlayerEntity.facing_y = 0;
				KinkyDungeonWaitMessage(false, 1);
				KinkyDungeonAdvanceTime(1); // was moveDirection.delta, but became too confusing
			}
		} else if (KDCrackableTiles.includes(moveObject)) {
			// If the player is trying to move into a cracked wall while they have a pickaxe in their inventory, let's let them mine from it
            if (KDEntityHasBuff(KinkyDungeonPlayerEntity,"TryingToMine") && KinkyDungeonPlayerDamage.digSpell) {
				KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });
                KDDelayedActionPrune(["Action", "Cast"]);
				let sp = KinkyDungeonFindSpell(KinkyDungeonPlayerDamage.digSpell || "Pickaxe", true);
				if (sp) {
					let res: { result: string, data: any } = KinkyDungeonCastSpell(
						moveX,
						moveY, sp,
						undefined,
						KDPlayer(),
						undefined, undefined,
						{
							targetingSpellWeapon: KinkyDungeonTargetingSpellWeapon,
						});
					if (res.result == "Cast" && sp.sfx) {
						KinkyDungeonPlaySound(KinkyDungeonRootDirectory + "Audio/" + sp.sfx + ".ogg");
					}
					if (res.result != "Fail" && !sp.quick) {
						KinkyDungeonAdvanceTime(res.data.delta);
					}
					KinkyDungeonInterruptSleep();
				}
            } else if (KDEntityHasBuff(KinkyDungeonPlayerEntity,"TryingToMine")) {
				let wpn = Array.from(KinkyDungeonInventory.get(Weapon).values()).find((item) => {
					return KDWeapon(item)?.digSpell && KinkyDungeonCanUseWeapon(false, undefined,
						KDWeapon(item));
				});
				if (KDWeapon(wpn)?.digSpell) {
					KDSwitchWeapon(wpn.inventoryVariant || wpn.name);
				}
			} else if (KinkyDungeonPlayerDamage.digSpell) {
                KinkyDungeonSendActionMessage(2, TextGet("KDWallAttemptToMine"), KDBaseWhite, 2);
                KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });
            } else if (Array.from(KinkyDungeonInventory.get(Weapon).values()).some((item) => {
				return KDWeapon(item)?.digSpell && KinkyDungeonCanUseWeapon(false, undefined,
					KDWeapon(item));
			})) {
                KinkyDungeonSendActionMessage(2, TextGet("KDWallAttemptToMine"), KDBaseWhite, 2);
                KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {
                    id: "TryingToMine",
                    type: "confirm",
                    power: 1,
                    duration: 5
                });

            }
        } else if (KDMapData.GroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
			// We can pick up items inside walls, in case an enemy drops it into bars
			KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
			KinkyDungeonInterruptSleep();
			KinkyDungeonAdvanceTime(1);
		} else { // If we are blind we can bump into walls!
			if (KinkyDungeonVisionGet(moveX, moveY) <= 1) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Footstep.ogg");
				KinkyDungeonSendActionMessage(2, TextGet("KDWallBump"), KDBaseWhite, 2);
				KinkyDungeonInterruptSleep();
				// Due to rendering system
				if (moveDirection.y <= 0)
					KDRevealTile(moveX, moveY + 1, 2);
				if (moveDirection.y >= 0)
					KDRevealTile(moveX, moveY - 1, 2);
				KDRevealTile(moveX, moveY, 2);
				KinkyDungeonAdvanceTime(1);
			}

		}
	}

	KinkyDungeonLastMoveDirection = moveDirection;

	if (moved) {
		KinkyDungeonSetFlag("moved", 2);
	}

	return moved;
}

function KinkyDungeonWaitMessage(NoTime: boolean, delta: number, msg: boolean = true): void {
	if (!KDIsAutoAction()) {
		if (msg) {
			if (KinkyDungeonStatWillpowerExhaustion > 1) KinkyDungeonSendActionMessage(3, TextGet("WaitSpellExhaustion"), "orange", 2);
			else if (!KinkyDungeonHasStamina(2.5, false)) KinkyDungeonSendActionMessage(1, TextGet("WaitExhaustion"
				+ (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.33 ?
					((KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.67 ?
						"ArousedHeavy"
						: "Aroused"))
						: "")), "yellow", 2);
			else KinkyDungeonSendActionMessage(1, TextGet("Wait" + (KinkyDungeonStatDistraction > 12 ? "Aroused" : "")), "silver", 2,
				undefined, undefined, undefined, "Action");
		}

	}

	if (!NoTime && delta > 0) {
		if (!KDGameData.Wait) KDGameData.Wait = 0;
		KDGameData.Wait += delta;
		KDSetIDFlag(KDPlayer().id, "negativeSlowLevel", 0);
	}

	KinkyDungeonLastAction = "Wait";
	KinkyDungeonTrapMoved = false;
}


/**
 * Returns th number of turns that must elapse
 * Sets MovePoints to 0
 */
function KinkyDungeonMoveTo(moveX: number, moveY: number, willSprint: boolean, _allowPass: boolean, sprintCost?: number) {
	//if (KinkyDungeonNoEnemy(moveX, moveY, true)) {
	let stepOff = false;
	let xx = KinkyDungeonPlayerEntity.x;
	let yy = KinkyDungeonPlayerEntity.y;
	if (KinkyDungeonPlayerEntity.x != moveX || KinkyDungeonPlayerEntity.y != moveY) {
		KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "move", 1);
		if (KDNearbyMapTiles(moveX, moveY, 1.5).some((tile) => {return (tile.x == moveX || tile.y == moveY) && !KinkyDungeonMovableTilesEnemy.includes(tile.tile);})) {
			KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "moveWall", 1);
		} else KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "moveOpen", 1);
		stepOff = true;
	}
	if (xx != moveX || yy != moveY) {
		KinkyDungeonTrapMoved = true;
	}
	let cencelled = !KinkyDungeonUpdateTether(0, true, KinkyDungeonPlayerEntity, moveX, moveY) ? KDMovePlayer(moveX, moveY, true, willSprint) : true;


	if (stepOff) KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity, xx, yy, moveX, moveY);

	KinkyDungeonSetFlag("Quickness", 0);
	if (KinkyDungeonStatsChoice.has("Quickness")) {
		KinkyDungeonSetFlag("BlockQuicknessPerk", 4);
	}
	if (!cencelled && willSprint) {
		if (KDCanSprint(sprintCost)) {
			let unblocked = KinkyDungeonSlowLevel > 1 || KDGameData.MovePoints < 0;
			if (!unblocked) {
				let nextPosX = moveX*2 - xx;
				let nextPosY = moveY*2 - yy;
				let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
				if (KinkyDungeonMovableTilesEnemy.includes(nextTile) && KinkyDungeonNoEnemy(nextPosX, nextPosY)) {
					unblocked = true;
				}
			}
			if (unblocked) {
				let data = {
					player: KinkyDungeonPlayerEntity,
					xTo: moveX*2 - xx,
					yTo: moveY*2 - yy,
					cancelSprint: false,
					sprintCost: 0,
				};

				data.sprintCost = KDSprintCost(data, sprintCost);

				KinkyDungeonSendEvent("sprint", data);


				if (!data.cancelSprint) {
					KinkyDungeonSetFlag("sprinted", 2);
					KDChangeStamina("sprint", "move", "sprint", data.sprintCost, false, 1);
					KinkyDungeonSendActionMessage(5, TextGet("KDSprinting" + (KinkyDungeonSlowLevel > 1 ? "Hop" : "")), KDBaseLightGreen, 2);
					KDChangeBalanceSrc("sprint", "move", "sprint", -KDGetBalanceCost() * (0.5 + 1 * KDRandom()) * KDBalanceSprintMult*10*KDFitnessMult(), true);
					KinkyDungeonSetFlag("sprint", 2);
					if (KinkyDungeonSlowLevel < 2) {
						// Move faster
						KinkyDungeonTrapMoved = true;
						KDMovePlayer(moveX*2 - xx, moveY*2 - yy, true);
					}
				}
			}
			KDGameData.MovePoints = 0;
			return 1;
		}
	}
	if (cencelled || (xx == KinkyDungeonPlayerEntity.x && yy == KinkyDungeonPlayerEntity.y)) {
		KDGameData.MovePoints = 0;
		KDSetIDFlag(KDPlayer().id, "negativeSlowLevel", 0);
		return 0;
	}
	KDGameData.MovePoints = 0;
	return Math.max(1, KinkyDungeonSlowLevel);
	//}
	//return 0;
}

function KDBalanceSprint() {
	let threshold = 0.5 * KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BalanceSprintThreshold"));
	return KDGameData.Balance >= threshold;
}

function KDCanSprint(cost?: number) {
	let data = {
		canSprint: KDBalanceSprint(),
		mustStand: true,
		mustNotBeSlow: true,
		cost: cost != undefined ? cost : KDSprintCost()
	};
	KinkyDungeonSendEvent("canSprint", data);
	return data.canSprint && (!data.mustNotBeSlow || KinkyDungeonSlowLevel < 4)
		&& KinkyDungeonHasStamina(-data.cost)
		&& (!data.mustStand || (KinkyDungeonCanStand() && !KDForcedToGround()));
}

let KinkyDungeonLastAction = "";
let KinkyDungeonLastTurnAction = "";
let KDDrawUpdate = 0;
let KDVisionUpdate = 0;

let KDLastTick = 0;

function KinkyDungeonAdvanceTime(delta: number, NoUpdate?: boolean, NoMsgTick?: boolean) {
	if (delta > 0) {
		KDEventData.sounddesc = [];
	}
	if (!KinkyDungeonPlayerEntity.id) KinkyDungeonPlayerEntity.id = -1;

	if (delta > 0) {
		// Player sound decay
		let loudest = 0;

		for (let source of Object.values(KDPlayerNoiseSources)) {
			loudest = Math.max(loudest, source.calc(KDPlayer()));
		}
		// Player gets quieter faster
		KDPlayer().sound = Math.max(Math.max(0, (KDPlayer().sound || 0)*0.75 - 2*delta), loudest);
	}

	KDUpdateFog = true;
	KDLastTick = performance.now();

	KDGameData.WarningTiles = {};

	if (delta > 0 && CommonTime() > lastFloaterRefresh + 1000) {
		KDEntitiesFloaterRegisty = new Map();
		lastFloaterRefresh = CommonTime();
	}



	let pauseTime = false;
	if (delta > 0) {
		let timeslow = KDEntityBuffedStat(KinkyDungeonPlayerEntity, "TimeSlow");
		if (timeslow) {
			if (!KinkyDungeonFlags.get("TimeSlow")) {
				KinkyDungeonSetFlag("TimeSlow", timeslow);
			} else {
				pauseTime = true;
			}
		}
	}



	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};
	let start = performance.now();

	if (KDGameData.MovePoints < -1 && KDGameData.KinkyDungeonLeashedPlayer < 1) KDGameData.MovePoints += delta;
	if (delta > 0) {
		KDDrawUpdate = delta;
		KDVisionUpdate = delta;
	}
	KDRecentRepIndex = 0;
	KinkyDungeonRestraintAdded = false;
	KinkyDungeonSFX = [];
	KDPlayerHitBy = [];

	KinkyDungeonUpdateAngel(delta);

	let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
	if (altType?.updatescript) {
		altType.updatescript(delta);
	}

	if (KDPlayer().leash)
		KinkyDungeonUpdateTether(delta, true, KinkyDungeonPlayerEntity);

	for (let enemy of KDMapData.Entities) {
		if (enemy.leash)
			KinkyDungeonUpdateTether(delta, false, enemy);
	}

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
	KinkyDungeonItemCheck(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, MiniGameKinkyDungeonLevel); //console.log("Item Check " + (performance.now() - now));
	if (pauseTime && delta > 0) {
		delta = 0;
		KinkyDungeonFlags.set("TimeSlowTick", 1);
	} else pauseTime = false;

	for (let enemy of KDMapData.Entities) {
		if (enemy.leash)
			KinkyDungeonUpdateTether(delta, false, enemy);
	}

	KDGameData.ShieldDamage = 0;
	KDUpdateCollectionFlags(delta);
	KDUpdatePersistentNPCFlags(delta);
	for (let value of Object.values(KDGameData.Collection))
		KDTickCollectionWanderCollectionEntry(value);
	KinkyDungeonUpdateBuffs(delta, false);
	KinkyDungeonUpdateEnemies(delta, true); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: true});
	
	for (let E = 0; E < KDMapData.Entities.length; E++) {
		let enemy = KDMapData.Entities[E];
		KDUnPackEnemy(enemy);
		if (KinkyDungeonEnemyCheckHP(enemy, E, KDMapData)) { E -= 1; continue;}
		if (KDCheckDespawn(enemy, E, KDMapData)) { E -= 1; continue;}
	}
	KinkyDungeonUpdateBullets(delta, true); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta); //console.log("Bullet Check " + (performance.now() - now));
	KinkyDungeonUpdateEnemies(delta, false); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: false});


	KinkyDungeonUpdateBullets(delta); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta, true); //"catchup" phase for explosions!

	KinkyDungeonParseExtraWarningTiles(delta); // Add custom warning indicators!

	KDUpdateEffectTiles(delta);
	KinkyDungeonUpdateTileEffects(delta);
	for (let E = 0; E < KDMapData.Entities.length; E++) {
		let enemy = KDMapData.Entities[E];
		KDUnPackEnemy(enemy);
		if (KinkyDungeonEnemyCheckHP(enemy, E, KDMapData)) { E -= 1; continue;}
		if (KDCheckDespawn(enemy, E, KDMapData)) { E -= 1; continue;}
	}

	KinkyDungeonUpdateTether(0, true, KinkyDungeonPlayerEntity);

	for (let enemy of KDMapData.Entities) {
		if (enemy.leash)
			KinkyDungeonUpdateTether(0, false, enemy);
	}
	KinkyDungeonUpdateJailKeys();

	KDCommanderUpdate(delta);


	if (KDCustomDefeat) {
		KDRunDefeatForEnemy();
	}

	if (pauseTime) {
		delta = 1;
		KinkyDungeonFlags.set("TimeSlowTick", 0);
	}

	KinkyDungeonUpdateStats(delta);

	let toTile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	KinkyDungeonHandleMoveToTile(toTile);
	// else if (KinkyDungeonStatWillpower == 0) {
	// KinkyDungeonState = "Lose";
	//}

	// Handle delayed actions
	if (!KDGameData.DelayedActions) KDGameData.DelayedActions = [];
	let runActions: KDDelayedAction[] = Object.assign([], KDGameData.DelayedActions);
	// Trim actions that have happened
	KDGameData.DelayedActions = KDGameData.DelayedActions.filter((action) => {
		return action.time - delta > 0;
	});
	for (let action of runActions) {
		action.time -= delta;
		if (action.time <= 0) {
			if (KDDelayedActionCommit[action.commit]) {
				KDDelayedActionCommit[action.commit](action);
			}
		} else if (action.update && KDDelayedActionUpdate[action.update]) {
			KDDelayedActionUpdate[action.update](action);
		}
	}
	if (KDGameData.DelayedActions?.length == 0) KDAutoWaitDelayed = false;

	if (!NoUpdate)
		KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);

	if (KinkyDungeonStatStamina < 5) {
		let msg = "KinkyDungeonStaminaWarningMed";
		if (KinkyDungeonStatStamina < 2.5) msg = "KinkyDungeonStaminaWarningLow";
		if (KinkyDungeonStatStamina < 1) msg = "KinkyDungeonStaminaWarningNone";
		if (!KinkyDungeonSendActionMessage(1, TextGet(msg), KDBaseForest, 1, true))
			KinkyDungeonSendTextMessage(1, TextGet(msg), KDBaseForest, 1, true);
	}
	let gagchance = KinkyDungeonGagMumbleChance;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv))
			gagchance += KinkyDungeonGagMumbleChancePerRestraint;
	}
	if (!KinkyDungeonCanTalk() && KDRandom() < gagchance) {
		let msg = "KinkyDungeonGagMumble";
		let gagMsg = Math.floor(KDRandom() * 5);
		const GagEffect = KinkyDungeonGagTotal() * 5;
		gagMsg += GagEffect;
		gagMsg = Math.max(0, Math.min(7, Math.floor(gagMsg)));

		if (KDRandom() < KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax) msg = "KinkyDungeonGagMumbleAroused";

		msg = msg + gagMsg;

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), KDBaseWhite, 2, 0);

		if (KDToggles.GagParticles) {
			KDSendGagParticles(KDPlayer());
		}
	}
	let end = performance.now();
	if (KDDebug) console.log(`Tick ${KinkyDungeonCurrentTick} took ${(end - start)} milliseconds.`);

	KinkyDungeonLastTurnAction = KinkyDungeonLastAction;
	KinkyDungeonLastAction = "";

	if (KDGameData.AncientEnergyLevel > 1) KDGameData.AncientEnergyLevel = 1;

	KinkyDungeonUpdateBulletVisuals(delta);

	CharacterRefresh = _CharacterRefresh;
	CharacterAppearanceBuildCanvas = _CharacterAppearanceBuildCanvas;

	if (KinkyDungeonInDanger()) KinkyDungeonSetFlag("DangerFlag",  3);
	if ((KinkyDungeonStatsChoice.has("Quickness") && !KinkyDungeonFlags.has("BlockQuicknessPerk"))) {
		KinkyDungeonSetFlag("Quickness", -1);
	} else if (KDEntityBuffedStat(KinkyDungeonPlayerEntity, "Quickness")) {
		KinkyDungeonSetFlag("Quickness", 1);
	}
	if (KDGameData.MovePoints < 0 || KinkyDungeonStatBlind) {
		KinkyDungeonSetFlag("Quickness", 0);
	}

	for (let en of KDMapData.Entities) {
		if (KDEnemyHasFlag(en, "removeVuln")) {
			en.vulnerable = 0;
		}
	}

	if (delta > 0) {
		KDTickMaps(delta,
			MiniGameKinkyDungeonLevel - KDMapTickRange,
			MiniGameKinkyDungeonLevel + KDMapTickRange,
			false,
			true,
			true
		);
	}
	KinkyDungeonCurrentTick += delta;
	if (KinkyDungeonCurrentTick > 100000) KinkyDungeonCurrentTick = 0;

	KinkyDungeonSendEvent("tickAfter", {delta: delta});

	if (KinkyDungeonStatsChoice.get("Forgetful")) {
		for (let X = 0; X < KDMapData.GridWidth; X++) {
			for (let Y = 0; Y < KDMapData.GridHeight; Y++) {
				if (X >= 0 && X <= KDMapData.GridWidth-1 && Y >= 0 && Y <= KDMapData.GridHeight-1 && !(KinkyDungeonVisionGet(X, Y) > 0.1)) {
					if (KinkyDungeonFogMemoryGet(X, Y) > 0) {
						KinkyDungeonFogMemorySet(X, Y, Math.max(0, KinkyDungeonFogMemoryGet(X, Y) - delta));
					} else if (KinkyDungeonFogMemoryGet(X, Y) == 0) {
						KinkyDungeonFogSet(X, Y, 0);
					}
				}
			}
		}
	}

	KinkyDungeonUpdateStats(0);

	KDTickNeeds(delta);


	let Dstart = performance.now();

	KDUpdateForceOutfit(KinkyDungeonPlayer);
	KinkyDungeonDressPlayer();

	if (KDDebug) console.log(`Dressing ${KinkyDungeonCurrentTick} took ${(performance.now() - Dstart)} milliseconds.`);
	KDGetEnemyCache();

	KDAllowDialogue = true;

	if (KDGameData.InventoryAction && KDInventoryAction[KDGameData.InventoryAction].cancel(KinkyDungeonPlayerEntity, delta)) {
		KDGameData.InventoryAction = "";
		KDGameData.InventoryActionContainer = [];
	}

	if (KDGameData.InventoryActionContainer?.length > 0 && KDGameData.InventoryActionContainer[0] != KDGameData.InventoryAction) {
		KDGameData.InventoryActionContainer = [];
	}


	if (KDRestraintDebugLog.length > 100) {
		KDRestraintDebugLog = KDRestraintDebugLog.splice(0, 10);
	}
	KDQuestTick(KDGameData.Quests, delta);
	KinkyDungeonUpdateFlags(delta);


	if (delta > 0) {
		if (KDGameData.RevealedTiles) {
			for (let entry of Object.entries(KDGameData.RevealedTiles)) {
				KDGameData.RevealedTiles[entry[0]] = entry[1] - delta;
				if (KDGameData.RevealedTiles[entry[0]] < 0) {
					delete KDGameData.RevealedTiles[entry[0]];
				}
			}
		}
		if (KDGameData.RevealedFog) {
			for (let entry of Object.entries(KDGameData.RevealedFog)) {
				KDGameData.RevealedFog[entry[0]] = entry[1] - delta;
				if (KDGameData.RevealedFog[entry[0]] < 0) {
					delete KDGameData.RevealedFog[entry[0]];
				}
			}
		}
	}

	if (!KDGameData.CurrentDialog) {
		KDCustomExpTmp = {};
	}

}
let KDEntityFlagCache = new Map();
let KDUpdateEntityFlagCache = false;


function KDGetEntityFlagCache() {
	if (!KDEntityFlagCache || KDUpdateEntityFlagCache) {
		KDEntityFlagCache = new Map();

		for (let npc of Object.values(KDPersistentNPCs)) {
			if (npc.entity?.flags) {
				if (Object.entries(npc.entity.flags).some((f) => {
					return f[1] >= 0;
				})) {
					KDEntityFlagCache.set(npc, true);
				}
			}
		}

		KDUpdateEntityFlagCache = false;
	}
}


let KDItemEventCache = new Map();
let KDUpdateItemEventCache = false;

function KDGetItemEventCache() {
	if (!KDItemEventCache || KDUpdateItemEventCache) {
		KDItemEventCache = new Map();
		let set = false;
		for (let inv of KinkyDungeonAllRestraintDynamic()) {
			//set = false;
			if (!KDRestraint(inv.item)) continue;
			if (!set && KDRestraint(inv.item)?.events) {
				for (let e of KDRestraint(inv.item)?.events) {
					if (!KDItemEventCache.get(e.trigger)) KDItemEventCache.set(e.trigger, new Map());
					KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
					//set = true;
				}
			}
			if (!set && inv.item.events) {
				for (let e of inv.item.events) {
					if (!KDItemEventCache.get(e.trigger)) KDItemEventCache.set(e.trigger, new Map());
					KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
					//set = true;
				}
			}
			if (!set && KDCurses[KDGetCurse(inv.item)]?.events) {
				for (let e of KDCurses[KDGetCurse(inv.item)]?.events) {
					if (!KDItemEventCache.get(e.trigger)) KDItemEventCache.set(e.trigger, new Map());
					KDItemEventCache.get(e.trigger).set(KDRestraint(inv.item).Group, true);
					//set = true;
				}
			}
		}
		KDUpdateItemEventCache = false;
	}
}

let KDAllowDialogue = true;

let lastFloaterRefresh = 0;

function KinkyDungeonTargetTileMsg(): boolean {
	if (KDObjectMessages[KinkyDungeonTargetTile.Type]) {
		return KDObjectMessages[KinkyDungeonTargetTile.Type]();

	} else if (KinkyDungeonTargetTile.Lock) {
		KinkyDungeonTargetTile.LockSeen =
			KinkyDungeonTargetTile.Lock;
		if (KinkyDungeonTargetTile.Faction)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
				.replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), KDBaseRed, 2, true);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Locked.ogg");
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObjectLock")
			.replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name))
			.replace("LKTP", TextGet(`Kinky${KinkyDungeonTargetTile.Lock}Lock`))
		, KDBaseWhite, 1, true);
		return true;
	} else {

		KinkyDungeonTargetTile.LockSeen = undefined;
		let suff = "";
		if (KinkyDungeonTargetTile.Faction)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
				.replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), KDBaseRed, 2, true);
		if (KinkyDungeonTargetTile.Name == "Commerce") suff = "Commerce";
		let Type = KinkyDungeonTargetTile.Type;
		if (Type
			&& ObjectTypeTooltipOverride[Type]
			&& KinkyDungeonTargetTile[Type]
			&& ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]]) {
			Type = ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]];
		}
		// Allow recursion... once
		if (Type
			&& ObjectTypeTooltipOverride[Type]
			&& KinkyDungeonTargetTile[Type]
			&& ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]]) {
			Type = ObjectTypeTooltipOverride[Type][KinkyDungeonTargetTile[Type]];
		}
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObject" + Type + suff).replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name)), KDBaseWhite, 1, true);

		return true;
	}
}

/**
 * Sets an item in the character appearance
 * @param C - The character whose appearance should be changed
 * @param Group - The name of the corresponding groupr for the item
 * @param ItemAsset - The asset collection of the item to be changed
 * @param NewColor - The new color (as "#xxyyzz" hex value) for that item
 * @param [DifficultyFactor] - The difficulty, on top of the base asset difficulty, that should be assigned
 * to the item
 * @param [ItemMemberNumber] - The member number of the player adding the item - defaults to -1
 * @param [Refresh] - Determines, wether the character should be redrawn after the item change
 * @param [item] - The item, to pass to the event
 * @returns - the item itself
 */
function KDAddAppearance (
	C:                 Character,
	_Group:            string,
	ItemAsset:         any,
	NewColor:          string | string[],
	DifficultyFactor:  number = 0,
	ItemMemberNumber:  number = -1,
	_Refresh:          boolean = true,
	item?:             Item
): Item
{
	DifficultyFactor = 0;

	// Unlike the stock function, we do NOT remove the previous one
	let data = {
		color: NewColor,
		item: item,
	};

	KinkyDungeonSendEvent("onWear", data);

	// Add the new item to the character appearance
	if (ItemAsset != null) {
		const NA: Item = {
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


/**
 * Sets an item in the character appearance
 * @param C - The character whose appearance should be changed
 * @param Group - The name of the corresponding groupr for the item
 * @param ItemModel - The asset collection of the item to be changed
 * @param NewColor - The new color (as "#xxyyzz" hex value) for that item
 * @param filters - The item, to pass to the event
 * @param [item] - The item, to pass to the event
 * @param [Properties] - The item, to pass to the event
 * @returns - the item itself
 */
function KDAddModel (
	C:           Character,
	_Group:      string,
	ItemModel:   Model,
	NewColor:    string | string[],
	filters:     Record<string, LayerFilter>,
	item?:       item,
	Properties?: Record<string, LayerPropertiesType>,
	factionFilters?: Record<string, FactionFilterDef>,
): Item
{

	// Unlike the stock function, we do NOT remove the previous one
	let data = {
		color: NewColor,
		item: item,
	};

	KinkyDungeonSendEvent("onWear", data);

	// Add the new item to the character appearance
	if (ItemModel != null) {
		const NA: Item = {
			Model: JSON.parse(JSON.stringify(ItemModel)),
			Difficulty: 0,//parseInt((ItemModel.Difficulty == null) ? 0 : ItemModel.Difficulty) + parseInt(DifficultyFactor),
			Color: data.color,
			Property: undefined,
			Filters: filters,
			Properties: Properties,
			factionFilters: factionFilters,
		};
		NA.Model.Filters = NA.Filters || NA.Model.Filters;
		NA.Model.Properties = NA.Properties || NA.Model.Properties;
		NA.Model.factionFilters = NA.factionFilters || NA.Model.factionFilters;
		for (let i = 0; i < C.Appearance.length; i++) {
			if (C.Appearance[i]?.Model?.Name == NA.Model.Name) {
				C.Appearance[i] = NA;
				return NA;
			}
		}
		C.Appearance.push(NA);
		return NA;
	}
	return null;
}

function KinkyDungeonCloseDoor(x: number, y: number) {
	if (KinkyDungeonStatsChoice.get("Doorknobs") && KinkyDungeonIsArmsBound(true) && KinkyDungeonIsHandsBound(true, true, 0.5))
		KinkyDungeonSendTextMessage(8, TextGet("KDCantCloseDoor"), KDBaseOrange, 2);
	else {
		KinkyDungeonTargetTileLocation = x + ',' + y;
		KinkyDungeonTargetTile = null;
		KinkyDungeonMapSet(x, y, "D");
		KinkyDungeonTargetTileLocation = "";
		KDModalArea = false;
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/DoorClose.ogg");
		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonCloseDoorDone"), KDBaseWhite, 2);
		KinkyDungeonAdvanceTime(1, true);
	}
}

let KDEnemyCache: Map<string, entity> = null;
let KDEnemyEventCache: Map<string, Map<number, boolean>> = null;
let KDUpdateEnemyCache = true;
let KDIDCache = new Map();

function KDGetEnemyCache() {
	if (KDUpdateEnemyCache || !KDEnemyCache) {
		KDUpdateEnemyCache = false;
		KDEnemyCache = new Map();
		KDEnemyEventCache = new Map();
		KDIDCache = new Map();
		for (let e of KDMapData.Entities) {
			KDEnemyCache.set(e.x + "," + e.y, e);
			if (e.Enemy?.events) {
				for (let event of e.Enemy.events) {
					if (!KDEnemyEventCache.get(event.trigger)) {
						KDEnemyEventCache.set(event.trigger, new Map());
					}
					KDEnemyEventCache.get(event.trigger).set(e.id, true);
				}
			}
			KDEnemyCache.set(e.x + "," + e.y, e);
			KDIDCache.set(e.id, e);
		}
	}
	return KDEnemyCache;
}

let KDTileQuery = "";
let KDTileLast = null;

/**
 * @param [x]
 * @param [y]
 */
function KDTile(x?: number, y?: number): any {
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
 * @param [x]
 * @param [y]
 */
function KDTileDelete(x?: number, y?: number): void {
	if (x == undefined) x = KinkyDungeonPlayerEntity.x;
	if (y == undefined) y = KinkyDungeonPlayerEntity.y;
	KinkyDungeonTilesDelete(x + "," + y);
}

/**
 * Stuns the player for [turns] turns
 * @param turns
 * @param [noFlag] - Doesn't add the 'stun' flag which makes the game think you are in trouble
 */
function KDStunTurns(turns: number, noFlag?: boolean) {
	if (!noFlag)
		KinkyDungeonSetFlag("playerStun", turns + 1);
	KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, turns);
	KDUpdateWaitTime(200);
}

/**
 * Kneels the player for [turns] turns
 * @param turns
 */
function KDKneelTurns(turns: number) {
	KinkyDungeonSetFlag("playerStun", turns + 1);
	KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, turns);
}

type KDTNamedAndWeighted = {
	name: string,
	weight: number,
}


function ListToRecord<T extends KDTNamedAndWeighted>(list: T[]): Record<string, T> {
	let obj: Record<string, T> = {};

	for (let o of list) {
		obj[o.name] = o;
	}

	return obj;
}


type KDTWeighted = {
	weight?: number,
}

/**
 * Get a random item from a list while making sure not to pick the previous one.
 * @param ItemPrevious - Previously selected item from the given list
 * @param ItemList - List for which to pick a random item from
 * @returns The randomly selected item from the list
 */
function GetByWeight<T extends KDTWeighted>(list: Record<string, T>): T {
	let WeightTotal = 0;
	let Weights = [];
	let type: T = null;

	for (let obj of Object.entries(list)) {
		Weights.push({obj: obj[1], weight: WeightTotal});
		WeightTotal += obj[1].weight;
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			type = Weights[L].obj;
			break;
		}
	}
	return type;
}



/**
 * Picks a string based on weights
 * @param list - a list of weights with string keys
 * @returns - the key that was selected
 */
function KDGetByWeight(list: Record<string, number>): string {
	let WeightTotal = 0;
	let Weights = [];
	let type = "";

	for (let obj of Object.entries(list)) {
		Weights.push({obj: obj[0], weight: WeightTotal});
		WeightTotal += obj[1];
	}

	let selection = KDRandom() * WeightTotal;

	for (let L = Weights.length - 1; L >= 0; L--) {
		if (selection > Weights[L].weight) {
			type =  Weights[L].obj;
			break;
		}
	}
	return type;
}

let KDKeyCheckers = {
	"Toggles": () => {
		if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KinkyDungeonKeyToggle.includes(KinkyDungeonKeybindingCurrentKey)) {
			switch (KinkyDungeonKeybindingCurrentKey) {
				// Log, Passing, Door, Auto Struggle, Auto Pathfind
				//case KinkyDungeonKeyToggle[0]: KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle; break;
				case KinkyDungeonKeyToggle[1]: KinkyDungeonToggleAutoPass = !KinkyDungeonToggleAutoPass; break;
				case KinkyDungeonKeyToggle[2]: KDInteracting = !KDInteracting; break;
				case KinkyDungeonKeyToggle[3]: KDAutoStruggleClick(); break;
				case KinkyDungeonKeyToggle[4]: KinkyDungeonFastMove = !KinkyDungeonFastMove; break;
				case KinkyDungeonKeyToggle[5]: KinkyDungeonInspect = !KinkyDungeonInspect; KinkyDungeonUpdateLightGrid = true; break;
				case KinkyDungeonKeyToggle[10]: KDBulletTransparency = !KDBulletTransparency; break;
				case KinkyDungeonKeyToggle[12]: KDStatusToggle = !KDStatusToggle; break;
			}
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Click.ogg");
			return true;
		}
	},
	"Zoom": () => {
		if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game') {
			switch (KinkyDungeonKeybindingCurrentKey) {
				// Log, Passing, Door, Auto Struggle, Auto Pathfind
				//case KinkyDungeonKeyToggle[0]: KinkyDungeonMessageToggle = !KinkyDungeonMessageToggle; break;
				case KinkyDungeonKeyMap[1]: KDChangeZoom(-1);

					return true;
				case KinkyDungeonKeyMap[2]: KDChangeZoom(+1);
					return true;
			}
			return false;
		}
	},

	"Shop": () => {
		if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KinkyDungeonTargetTile?.Type == "Shrine" && KinkyDungeonTargetTile.Name == "Commerce") {
			if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonShopIndex = (KinkyDungeonShopIndex + 1) % KDMapData.ShopItems.length;
				KDShopBuyConfirm = false;
				return true;
			} else if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
				KinkyDungeonShopIndex = KinkyDungeonShopIndex - 1;
				if (KinkyDungeonShopIndex < 0) KinkyDungeonShopIndex = KDMapData.ShopItems.length - 1;
				KDShopBuyConfirm = false;
				return true;
			} else if (KinkyDungeonKey[3] == KinkyDungeonKeybindingCurrentKey || KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
				let cost = KinkyDungeonShrineCost("Commerce");
				if (cost <= KinkyDungeonGold) {
					if (!KDShopBuyConfirm) KDShopBuyConfirm = true;
					else {
						KDSendInput("shrineBuy", {type: "Commerce", shopIndex: KinkyDungeonShopIndex});
						KDShopBuyConfirm = false;
					}
				}
				return true;
			} else if (KinkyDungeonKey[1] == KinkyDungeonKeybindingCurrentKey) {
				KDShopBuyConfirm = false;
				return true;
			}
		}
	},

	"Dialogue": () => {
		if (KDGameData.CurrentDialog && !(KDGameData.SlowMoveTurns > 0)) {

			if (KinkyDungeonState == 'Game' && KinkyDungeonDrawState == 'Game' && KDGameData.CurrentDialog) {
				if (KinkyDungeonKey[2] == KinkyDungeonKeybindingCurrentKey) {
					if (KDDialogueData.CurrentDialogueIndex < KDMaxDialogue - 1)
						KDDialogueData.CurrentDialogueIndex += 1;
					else
						KDClickButton("dialogueDOWN");
					return true;
				} else if (KinkyDungeonKey[0] == KinkyDungeonKeybindingCurrentKey) {
					if (KDDialogueData.CurrentDialogueIndex > 0)
						KDDialogueData.CurrentDialogueIndex = Math.max(0, KDDialogueData.CurrentDialogueIndex - 1);
					else
						KDClickButton("dialogueUP");
					return true;
				} else if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey) {
					KDClickButton(KDOptionOffset + "dialogue" + (KDDialogueData.CurrentDialogueIndex));
					return true;
				} else if (KinkyDungeonKeySkip[0] == KinkyDungeonKeybindingCurrentKey) {
					// Get the current dialogue and traverse down the tree
					let dialogue = KDGetDialogue();
					if (dialogue.options) {
						let entries = Object.entries(dialogue.options);

						let II = -KDOptionOffset;
						let gagged = KDDialogueGagged();
						for (let i = 0; i < entries.length && II < KDMaxDialogue; i++) {
							if ((!entries[i][1].prerequisiteFunction || entries[i][1].prerequisiteFunction(gagged, KinkyDungeonPlayerEntity))
								&& (!entries[i][1].gagRequired || gagged)
								&& (!entries[i][1].gagDisabled || !gagged)) {
								if (II >= 0) {
									if (entries[i][0] == "Leave" || entries[i][0] == "Continue" || entries[i][1].skip) {
										KDClickButton(KDOptionOffset + "dialogue" + (II));
										return true;
									}
								}
								II += 1;
							}
						}
					}
					return true;
				}
			}
		}
	},
};

/**
 *
 * @param Floor
 * @param [MapMod]
 * @param [RoomType]
 */
function KDGetAltType(Floor: number, MapMod?: string, RoomType?: string): AltType {
	let mapMod = null;
	if (MapMod != undefined ? MapMod : KDGameData.MapMod) {
		mapMod = KDMapMods[MapMod ? MapMod : KDGameData.MapMod];
	}
	let altRoom = RoomType != undefined ? RoomType : KDGameData.RoomType;
	let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);
	return altType;
}


/**
 *
 * @param player
 * @param Enemy
 */
function KDCanPassEnemy(_player: entity, Enemy: entity, force?: boolean, ignoreIfAlready?: boolean): boolean {
	return !KDIsImmobile(Enemy)
	&& ((!KinkyDungeonAggressive(Enemy) && !Enemy.playWithPlayer) || (KDHelpless(Enemy)))
	&& ((force || (KinkyDungeonToggleAutoPass
		&& (
			!KDGameData.FocusControlToggle || (
				(KDGameData.FocusControlToggle.AutoPassHelplessEnemies || !(KDHostile(Enemy) && KDHelpless(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassHelplessAllies || !(!KDHostile(Enemy) && KDHelpless(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassAllies || !(KDAllied(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassNeutral || !(!KDAllied(Enemy) && !KDAllied(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassShop || !(KDEnemyHasFlag(Enemy, "Shop"))) &&
				(KDGameData.FocusControlToggle.AutoPassSpecial || !(Enemy.specialdialogue ||
					(Enemy.prisondialogue && KDIsImprisoned(Enemy)) || Enemy.Enemy.specialdialogue)) &&
				(KDGameData.FocusControlToggle.AutoPassSummons || !(Enemy.Enemy.allied))
			)
		))) || (
			!ignoreIfAlready && (
				KDEnemyHasFlag(Enemy, "passthrough")
				|| (KinkyDungeonFlags.has("Passthrough"))
				|| Enemy.Enemy.noblockplayer)
		) || (
			ignoreIfAlready && !(
				KDEnemyHasFlag(Enemy, "passthrough")
				|| (KinkyDungeonFlags.has("Passthrough"))
				|| Enemy.Enemy.noblockplayer)
			)
		)

}


/**
 * @param x
 * @param y
 * @param [pad]
 */
function KDIsInBounds(x: number, y: number, pad: number = 1): boolean {
	return x >= pad && x <= KDMapData.GridWidth-pad-1 && y >= pad && y <= KDMapData.GridHeight-pad-1;
}

/**
 * @param sprintdata
 * @param accountForSlow - doubles effective cost if slowlevel > 1
 */
function KDSprintCost(sprintdata?: any, sprintCost?: number, accountForSlow: boolean = false): number {
	if (sprintCost != undefined) return sprintCost;
	let data = {
		sprintdata: sprintdata,
		sprintCostMult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SprintEfficiency")),
		cost: 0,
		boost: 0,
		sprintCostOverride: sprintCost,
	};
	data.cost = (-KDSprintCostBase - KDSprintCostSlowLevel[Math.min(KDSprintCostSlowLevel.length-1, 
		Math.round(KinkyDungeonSlowLevel))] + (
			(accountForSlow && KinkyDungeonSlowLevel > 1) ? -KDSprintAdjustSlowed : 0
		));
	if (KDGameData.MovePoints < 0) data.cost -= KDSlowedSprintCost;


	KinkyDungeonSendEvent("calcSprint", data);

	return (data.cost + data.boost) * data.sprintCostMult;
}


/**
 * @param map
 * @param flag
 */
function KDSetMapFlag(map: KDMapDataType, flag: string) {
	if (!map) return;
	if (!map.flags) {
		map.flags = [];
	}
	if (!map.flags.includes(flag)) {
		map.flags.push(flag);
	}
}

/**
 * @param C
 */
function KDUpdateForceOutfit(C: Character) {
	let forceOutfit = "";
	let forceOutfitPri = 0;
	let r = null;
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		r = KDRestraint(inv.item);
		if (r?.forceOutfit && (r.forceOutfitPriority || r.power) >= forceOutfitPri) {
			forceOutfitPri = r.forceOutfitPriority || r.power;
			forceOutfit = r.forceOutfit;
		}
	}
	if (forceOutfit && KinkyDungeonCurrentDress != forceOutfit) {
		KinkyDungeonSetDress(forceOutfit, forceOutfit, C);
	}
}

function KDGenerateBaseTraffic(width?: number, height?: number) {
	KDMapData.Traffic = [];
	if (typeof width === 'undefined'  ||  typeof height === 'undefined')
		return;

	// Generate the grid
	for (let X = 0; X < height; X++) {
		let row = [];
		for (let Y = 0; Y < width; Y++)
			row.push(5);
		KDMapData.Traffic.push(row);
	}
}

/**
 * Prunes all rooms with prune: true
 */
function KDPruneWorld() {
	for (let slot of Object.values(KDWorldMap)) {
		for (let entry of Object.entries(slot.data)) {
			let alt = KDGetAltType(slot.y, entry[1].MapMod, entry[1].RoomType);
			if (alt?.prune || alt?.alwaysRegen) {
				// Remove all chests and add to lost items
				let lostItems: item[] = [];
				for (let entry of Object.entries(KDGameData.Containers)) {
					if (entry[1].location?.mapY == slot.y
						&& entry[1].location?.mapX == slot.x
						&& entry[1].location?.room == entry[0]
					) {
						lostItems.push(...Object.values(entry[1].items));
						delete KDGameData.Containers[entry[0]];
					}
				}
				for (let item of lostItems) {
					KDAddLostItemSingle(item.name, 1);
				}

				delete slot.data[entry[0]];
			}
		}
	}
}


function KDEnemyTurnToFace(enemy: entity, x: number, y: number) {
	enemy.fx = x;
	enemy.fy = y;
	if (enemy.fx > enemy.x)
		enemy.flip = true;
	else if (enemy.fx < enemy.x)
		enemy.flip = false;
}

function KDTurnToFace(dx: number, dy: number): boolean {
	let origx = KinkyDungeonPlayerEntity.facing_x;
	let origy = KinkyDungeonPlayerEntity.facing_y;

	KinkyDungeonPlayerEntity.facing_x = Math.min(1, Math.abs(dx)) * Math.sign(dx);
	KinkyDungeonPlayerEntity.facing_y = Math.min(1, Math.abs(dy)) * Math.sign(dy);

	if (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y) {
		KinkyDungeonPlayerEntity.facing_x_last = KinkyDungeonPlayerEntity.facing_x;
		KinkyDungeonPlayerEntity.facing_y_last = KinkyDungeonPlayerEntity.facing_y;
	}
	return origx != KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y != origy;
}


function KDAddRepopQueue(repopdata: RepopQueueData, data: KDMapDataType) {
	if (!data.RepopulateQueue)
		data.RepopulateQueue = [];

	data.RepopulateQueue.push(repopdata);
}

function KDRepopQueueGet(data: KDMapDataType, x: number, y: number): RepopQueueData[] {
	if (data.RepopulateQueue?.length > 0) {
		return data.RepopulateQueue.filter((q) => {return q.x == x && q.y == y;})
	}
	return [];
}

function KDUpdateRepopQueue(data: KDMapDataType, delta: number) {
	// Obv only if there is any thing to repop
	if (data.RepopulateQueue?.length > 0) {
		// subtract delta from time
		for (let e of data.RepopulateQueue) {
			e.time -= delta;
		}
		let currentTodo = data.RepopulateQueue.filter((entry) => {
			return entry.time < 0;
		});
		// Sort the todo list to repop in order
		currentTodo = currentTodo.sort((a, b) => {
			return a.time - b.time;
		});
		// Repop
		for (let current of currentTodo) {
			let point: KDPoint = null;
			if (!KinkyDungeonEntityAt(
				current.x, current.y, false, undefined, undefined, true
			)) {
				point = {
					x: current.x,
					y: current.y,
				};
			} else if (current.loose) {
				point = KinkyDungeonGetNearbyPoint(current.x, current.y, true, undefined, false, true);
			}
			if (point) {
				current.entity.x = point.x;
				current.entity.y = point.y;
				current.entity.visual_x = point.x;
				current.entity.visual_y = point.y;
				KDAddEntity(current.entity, false, false, true,
					data);
				// Remove these from queue
				let ind = data.RepopulateQueue.indexOf(current);
				if (ind >= 0)
					data.RepopulateQueue.splice(
						ind, 1
					);
			}
		}
	}
}


function KDTPToSummit(id: number) {
	let npc = KDGetPersistentNPC(id);
	if (npc) {
		KDMovePersistentNPC(id, {
			mapX: 0,
			mapY: 0,
			room: "Summit",
		})
	}
}


function KDWaitTimeDelayedAction(forceDanger?: boolean) {
	return ((forceDanger != undefined ? forceDanger : KinkyDungeonInDanger()) ? 250 : 0)
		+ 250 * (0.25 + KDAnimSpeed * 0.75)
}

function KDDelayedActionStart() {
	if (KDToggles.AutoWaitDelayed)
		KDAutoWaitDelayed = true;
	//KinkyDungeonAdvanceTime(1);
	if (KDAutoWaitDelayed) {
		let wt = KDWaitTimeDelayedAction();
		KDUpdateWaitTime(wt);
	}
}

function KDTalkToEnemy(Enemy: entity) {
	return (KDIsImprisoned(Enemy)
		|| ((!KinkyDungeonAggressive(Enemy) || KDAllied(Enemy))
		&& !(Enemy.playWithPlayer && KDCanDom(Enemy))));
}

function KDFastMoveTo(xx: number, yy: number): number {
	if (KDistChebyshev(xx - KinkyDungeonPlayerEntity.x, yy - KinkyDungeonPlayerEntity.y) > 0.5
		&& (KinkyDungeonVisionGet(xx, yy) > 0
			|| KinkyDungeonFogGet(xx, yy) > 0
			|| KDistChebyshev(KinkyDungeonPlayerEntity.x - xx, KinkyDungeonPlayerEntity.y - yy) < 1.5)) {
		let requireLight = KinkyDungeonVisionGet(xx, yy) > 0;
		let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, xx, yy,
			true, false, false,
			KDToggles.FastMoveDoors ? KinkyDungeonMovableTilesSmartEnemy : KinkyDungeonMovableTilesEnemy,
			requireLight, false, true,
			undefined, false, undefined, false, true, KDToggles.FastMovePassable);
		if (path) {
			KDSetFocusControl("");
			KinkyDungeonFastMovePath = path;
			KDUpdateWaitTime(1);
			KinkyDungeonSetFlag("startPath", 1);
			return path.length;
		} else if (KDistChebyshev(KinkyDungeonPlayerEntity.x - xx, KinkyDungeonPlayerEntity.y - yy) < 1.5) {
			KDSetFocusControl("");
			KDSendInput("move", {dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint});
			return 1;
		}
	}
	return 0;
}

let KDOverrideWaitTimeThreshold = 950;

function KDUpdateWaitTime(delay: number, force: boolean = false, nooverride: boolean = false) {
	if (force) KinkyDungeonSleepTime = CommonTime() + delay;
	else {
		let ct = CommonTime();
		if (!nooverride && KinkyDungeonSleepTime > ct) {
			let diff = KinkyDungeonSleepTime - ct;
			if (diff < KDOverrideWaitTimeThreshold) {
				// override since we got a shorter delay thats below the thresh
				KinkyDungeonSleepTime = CommonTime() + delay;
				return;
			}
		}
		KinkyDungeonSleepTime = Math.max(KinkyDungeonSleepTime, CommonTime() + delay);


	}

}


let KDCustomKeyDown = [
	(key) => {
		if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game"
			&& key == KinkyDungeonKeySpellPage[0] && KDShowExtraTooltipMaxCycle > 0
		) {
			KDShowExtraTooltipCycle = (KDShowExtraTooltipCycle + 1) % (KDShowExtraTooltipMaxCycle + 1);
			lastExtraTooltipCycleTimeAuto = CommonTime() + lastExtraTooltipCycleTimeAuto_ManualDelay;
			return true;
		}
		return false;
	},
];
let KDCustomKeyUp = [
];

interface KDFailMoveData  {
	player: entity,
	moveX: number,
	moveY: number,
	cancelSprint: boolean,
}