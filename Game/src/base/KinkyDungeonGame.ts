"use strict";


let KDFocusableTextFields = [
	"PerksFilter",
	"InvFilter",
	"CollFilter",
	"QInvFilter",
	"MagicFilter",
];

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

let KinkyDungeonPOI = [];

let KinkyDungeonStairTiles = 'sSH';
let KDDefaultAvoidTiles = "gtVN@";
let KinkyDungeonGroundTiles = "023wW][?/";
let KinkyDungeonWallTiles = "14,6f";
let KDCrackableTiles = '4Xaom-';
let KDMendableTiles = '4';
let KinkyDungeonBlockTiles = "14,6bgX7f";
let KinkyDungeonMovableTilesEnemy = KinkyDungeonGroundTiles + "HB@l;SsRrdzTgLcNVvt5"; // Objects which can be moved into: floors, debris, open doors, staircases
// 5 is skinned floor, you can give it whatever sprite you want
// 6 is skinned wall, you can give it whatever sprite you want
let KinkyDungeonMovableTilesSmartEnemy = "D" + KinkyDungeonMovableTilesEnemy; //Smart enemies can open doors as well
let KinkyDungeonMovableTiles = "OPCAMG$Y+=-F67" + KinkyDungeonMovableTilesSmartEnemy; // Player can open chests, orbs, shrines, chargers
// 5 = floor object, passable
// 6 = wall object, block passage
// 7 = transparent wall object

let KDRandomDisallowedNeighbors = ",?/RAasSHcCHDdOoPp+FZzgtuVvN567"; // tiles that can't be neighboring a randomly selected point
let KDTrappableNeighbors = "DA+-F@"; // tiles that might have traps bordering them with a small chance
let KDTrappableNeighborsLikely = "COP="; // tiles that might have traps bordering them with a big chance

let KinkyDungeonTransparentObjects = KinkyDungeonMovableTiles
	.replace("D", "")
	.replace("g", "") // grate
	.replace("Y", "") // wall rubble
	+ "OoAaMmCcB@lb+=-FXu7";
let KinkyDungeonTransparentMovableObjects = KinkyDungeonMovableTiles
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


/**
 * @param [RoomType]
 * @param [MapMod]
 */
function KDDefaultMapData(RoomType: string = "", MapMod: string = ""): KDMapDataType {
	return {
		Checkpoint: MiniGameKinkyDungeonCheckpoint,
		Title: "",

		RepopulateQueue: [],

		Labels: {},
		PrisonState: "",
		PrisonStateStack: [],
		PrisonType: "",
		data: {},

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
		Grid : "",
		Traffic : [],
		GridWidth : 31,
		GridHeight : 19,
		MapBrightness : 5,
		PatrolPoints : [],
		StartPosition : {x: 1, y: 1},
		EndPosition : {x: 1, y: 1},
		ShortcutPositions : [],
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
	};
}

KDMapData = KDDefaultMapData();


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
function KinkyDungeonEffectTilesGet(location: string): Record<string, effectTile> {
	return KDMapData.EffectTiles[location];
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

function KinkyDungeonNewGamePlus(): void {
	MiniGameKinkyDungeonLevel = 0;

	KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);
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

	KinkyDungeonSetCheckPoint("grv", true);
	KDGameData.HighestLevelCurrent = 1;
	KinkyDungeonCreateMap(KinkyDungeonMapParams.grv, "ShopStart", "", 1);
	KinkyDungeonNewGame += 1;


	KDGameData.ElevatorsUnlocked = {};

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
function KDResetEventData(Data?: any) {
	if (!Data) Data = KDEventDataBase;
	KDEventData = JSON.parse(JSON.stringify( Data));
}



function KinkyDungeonInitialize(Level: number, Load?: any) {
	KDWorldMap = {};
	KDMapData = KDDefaultMapData();
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
	// Refresh the character
	CharacterAppearanceRestore(KinkyDungeonPlayer, CharacterAppearanceStringify(KinkyDungeonPlayer,
		KDGetCharMetadata(KinkyDungeonPlayer)
	), false, true);
	KinkyDungeonDrawState = "Game";
	KDRefreshCharacter.set(KinkyDungeonPlayer, true);
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
	MiniGameKinkyDungeonLevel = Level;
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

	let pathLength = path ? path.length : 100;

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
function KDCreateWorldLocation(x: number, y: number, _main: string = "") {
	KDWorldMap[x + ',' + y] = {
		data: {},
		x: x,
		y: y,
		main: "",
		name: "Tile" + x + ',' + y,
		color: "#ffffff"
	};
}

/**
 * @param slot
 * @param saveconstantX
 */
function KDSaveRoom(slot: { x: number, y: number }, saveconstantX: boolean) {
	slot = slot || KDCurrentWorldSlot;
	let CurrentLocation = KDWorldMap[(saveconstantX ? 0 : slot.x) + "," + slot.y];
	if (!CurrentLocation) KDCreateWorldLocation(0, slot.y);

	// Pack enemies
	KDPackEnemies(KDMapData);
	// Remove navmap cause it will be regenned

	KDMapData.RandomPathablePoints = {};
	RandomPathList = [];

	let CurrentMapData = JSON.parse(JSON.stringify(KDMapData));

	if (CurrentLocation) {
		CurrentLocation.data[CurrentMapData.RoomType] = CurrentMapData;
	}
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
function KDLoadMapFromWorld(x: number, y: number, room: string, direction: number = 0, constantX?: boolean, ignoreAware: boolean = true) {
	let origx = x;
	if (constantX) x = 0;

	if (!KDWorldMap[x + ',' + y]) return false;
	if (!KDWorldMap[x + ',' + y].data[room]) return false;

	// Create enemies first so we can spawn them in the set pieces if needed
	let allies = KinkyDungeonGetAllies();
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return !allies.includes(enemy);
	});
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;

	KDKickEnemies(undefined, ignoreAware, y); // Shuffle enemy locations

	KDSaveRoom(KDCurrentWorldSlot, KDMapData.ConstantX);

	// Load the room
	let NewMapData = JSON.parse(JSON.stringify(KDWorldMap[x + ',' + y].data[room]));

	// UnPack enemies
	KDSyncPersistentEntities(y, NewMapData, true);
	KDUnPackEnemies(NewMapData);

	// Filter non-present enemies
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return (!KDGetNPCLocation(enemy.id) || KDCompareLocation(KDGetNPCLocation(enemy.id), KDGetCurrentLocation()));
	});

	KDMapData = NewMapData;
	KDGameData.RoomType = KDMapData.RoomType;
	KDGameData.MapMod = KDMapData.MapMod;
	MiniGameKinkyDungeonCheckpoint = KDMapData.Checkpoint || MiniGameKinkyDungeonCheckpoint;

	KDInitTempValues();
	if (!KDMapData.Traffic || KDMapData.Traffic.length == 0) KDGenerateBaseTraffic();
	KinkyDungeonGenNavMap();

	KDPlacePlayerBasedOnDirection(direction, KDGameData.ShortcutIndex);

	KDCurrentWorldSlot = {
		x: origx,
		y: y,
	};
	let aware = KDKickEnemies(undefined, ignoreAware, y); // Shuffle enemy locations
	if (ignoreAware && aware) {
		//KinkyDungeonLoseJailKeys();
		KinkyDungeonSetFlag("stairslocked", 10);
		KinkyDungeonSendActionMessage(10, TextGet("KDClimbUpTrapped"), "#ff5277", 3);
	}

	for (let e of allies) {
		KDAddEntity(e, true);
	}

	for (let e of KinkyDungeonGetAllies()) {
		let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
		if (!point) point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, undefined, true);
		if (!point) point = {x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y};
		KDMoveEntity(e, point.x, point.y, false,undefined, undefined, true);
		e.visual_x = point.x;
		e.visual_y = point.y;
	}
	return true;
}

/**
 * @param [direction]
 * @param [sideRoomIndex]
 */
function KDPlacePlayerBasedOnDirection(direction: number = 0, sideRoomIndex: number = -1) {
	if (sideRoomIndex >= 0 && KDMapData.ShortcutPositions && KDMapData.ShortcutPositions[sideRoomIndex]) {
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, x: KDMapData.ShortcutPositions[sideRoomIndex].x, y:KDMapData.ShortcutPositions[sideRoomIndex].y, player:true};
	} else if (direction == 1 && KDMapData.EndPosition) {
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, x: KDMapData.EndPosition.x, y:KDMapData.EndPosition.y, player:true};
	} else {
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, x: KDMapData.StartPosition.x, y:KDMapData.StartPosition.y, player:true};
	}
}

function KDInitTempValues(seed?: boolean): void {
	KDGameData.ChestsGenerated = [];
	KDPathfindingCacheFails = 0;
	KDPathfindingCacheHits = 0;
	KDPathCache = new Map();
	KDThoughtBubbles = new Map();
	KinkyDungeonSpecialAreas = [];
	KinkyDungeonRescued = {};
	KDGameData.ChampionCurrent = 0;
	KinkyDungeonAid = {};
	KDGameData.KinkyDungeonPenance = false;
	KDRestraintsCache = new Map();
	KDEnemiesCache = new Map();
	KDEnemyCache = new Map();
	KinkyDungeonTargetTile = null;
	KinkyDungeonTargetTileLocation = "";

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
function KDUpdateOptionGame(): void {
	if (KinkyDungeonStatsChoice.get("NoForceGreet") && !KDGameData.NoForceGreet) {
		KDGameData.NoForceGreet = true;
	} else if (!KinkyDungeonStatsChoice.get("NoForceGreet") && KDGameData.NoForceGreet) {
		KDGameData.NoForceGreet = false;
	}
}

/**
 * Starts the the game at a specified level
 * Example usage:
 * KinkyDungeonCreateMap(KinkyDungeonMapParams.grv, 1, false, undefined, "", undefined, true);
 * @param MapParams
 * @param RoomType
 * @param MapMod
 * @param Floor
 * @param [testPlacement]
 * @param [seed]
 * @param [forceFaction]
 * @param [worldLocation]
 * @param [useExisting]
 * @param [origMapType]
 * @param [direction]
 * @param [forceEscape]
 */
function KinkyDungeonCreateMap (
	MapParams:       floorParams,
	RoomType:        string,
	MapMod:          string,
	Floor:           number,
	testPlacement?:  boolean,
	seed?:           boolean,
	forceFaction?:   string,
	worldLocation?:  { x: number, y: number },
	useExisting?:    boolean,
	origMapType:     string = "",
	direction:       number = 0,
	forceEscape?:    string
): void
{
	KDUpdateOptionGame();
	KDBreakTether(KDPlayer());

	KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["removeNewMap"]);
	// Create enemies first so we can spawn them in the set pieces if needed
	let allies = KinkyDungeonGetAllies();
	let mapMod = KDMapData.MapMod ? KDMapMods[KDMapData.MapMod] : null;
	let altRoom = KDMapData.RoomType;
	let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);


	// Strip non-persistent items
	if (!KDMapData.GroundItems) KDMapData.GroundItems = [];
	let allPersistent = altType?.keepItems;
	let persistentItems = KDMapData.GroundItems.filter((item) => {
		return allPersistent || (KDDroppedItemProperties[item.name] && KDDroppedItemProperties[item.name].persistent);
	});
	let lostItems = KDMapData.GroundItems.filter((item) => {
		return !(allPersistent || (KDDroppedItemProperties[item.name] && KDDroppedItemProperties[item.name].persistent));
	});

	KDMapData.GroundItems = persistentItems;

	if (!KDGameData.PersistentItems) KDGameData.PersistentItems = {};
	KDGameData.PersistentItems[RoomType + "," + KDCurrentWorldSlot.x + "," + KDCurrentWorldSlot.y] = {};
	for (let item of KDMapData.GroundItems) {
		KDGameData.PersistentItems[RoomType + "," + KDCurrentWorldSlot.x + "," + KDCurrentWorldSlot.y][item.name] =
			(KDGameData.PersistentItems[RoomType + "," + KDCurrentWorldSlot.x + "," + KDCurrentWorldSlot.y][item.name] || 0) + (item.amount || 1);
	}
	for (let item of lostItems) {
		KDAddLostItemSingle(item.name, item.amount || 1);
	}

	// Setup
	// Remove enemies if the room isnt main and wont regen

	// ...

	KDGameData.RoomType = RoomType;
	KDGameData.MapMod = MapMod;
	mapMod = null;
	if (KDGameData.MapMod) {
		mapMod = KDMapMods[KDGameData.MapMod];
	}

	altRoom = KDGameData.RoomType;
	altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);

	let constantX = altType?.constantX;

	if (!worldLocation) worldLocation = {x: KDCurrentWorldSlot.x, y: KDCurrentWorldSlot.y};
	if (!KDWorldMap[(constantX ? 0 : worldLocation.x) + "," + worldLocation.y]) {
		KDCreateWorldLocation(constantX ? 0 : worldLocation.x, worldLocation.y, altType?.makeMain ? altRoom : "");
		if (altType?.makeMain || !altType) {
			KDPruneWorld();
		}
	}
	let location = KDWorldMap[(constantX ? 0 : worldLocation.x) + "," + worldLocation.y];

	if (useExisting && location.data[KDGameData.RoomType]) {
		KDLoadMapFromWorld(worldLocation.x, worldLocation.y, KDGameData.RoomType, direction, constantX);

		// Repopulate
		altType = KDGetAltType(MiniGameKinkyDungeonLevel);
		if (!altType?.loadscript || altType.loadscript(false)) {
			if (!altType?.noPersistentPrisoners && !mapMod?.noPersistentPrisoners)
				KDRepopulatePersistentNPCs();
		}
		UpdateRegiments({
			mapX: worldLocation.x,
			mapY: worldLocation.y,
			room: KDGameData.RoomType,
		});

		return;
	}

	// Filter out the allies
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return !allies.includes(enemy);
	});
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;
	// Else make a new one
	KDSaveRoom(KDCurrentWorldSlot, KDMapData.ConstantX);

	let maxIter = 100;
	for (let iterations = 0; iterations <= maxIter; iterations++) {
		if (iterations > 0) {
			// Clear so party prisoners are reused
			for (let en of [...KDMapData.Entities]) {
				KDRemoveEntity(en, false, true, true);
			}
		}
		/** @type {KDMapData} */
		KDMapData = KDDefaultMapData(KDGameData.RoomType, KDGameData.MapMod);
		KDCurrentWorldSlot = worldLocation;

		KDInitTempValues(seed);
		KDMapData.Grid = "";
		KDMapData.Traffic = [];
		KDMapData.Tiles = {};
		KDMapData.TilesSkin = {};
		KDMapData.EffectTiles = {};
		KDMapData.Bullets = []; // Clear all bullets
		KDMapData.Entities = []; // Clear all entities
		KDCommanderRoles = new Map();
		KDMapData.EndPosition = null;
		KDMapData.ShortcutPositions = [];
		KDMapData.PatrolPoints = [];
		KDMapData.JailPoints = [];
		KDMapData.GroundItems = []; // Clear items on the ground


		// These are generated before the seed as they depend on the player's restraints and rep
		KDMapData.PoolUses = Math.min(KDMapData.PoolUses, KinkyDungeonStatsChoice.get("Blessed") ? 0 : 1);
		KDMapData.ShopItems = [];
		KDMapData.ShopItems = KinkyDungeonGenerateShop(MiniGameKinkyDungeonLevel);
		let shrinefilter = KinkyDungeonGetMapShrines(MapParams.shrines);
		let traptypes = MapParams.traps.concat(KinkyDungeonGetGoddessTrapTypes());

		mapMod = null;
		if (KDGameData.MapMod) {
			mapMod = KDMapMods[KDGameData.MapMod];
		}


		altRoom = KDGameData.RoomType;
		altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);

		if (altType && altType.nokeys) {
			KDGameData.KeysNeeded = false;
		} else KDGameData.KeysNeeded = true;

		if (altType?.constantX) KDMapData.ConstantX = true;

		// make it more consistent
		let random = KDRandom();
		let mapSizeBonus = (!altType || altType.sizeBonus) ? KDGetMapSize() : 0;
		let height = (MapParams.min_height) * 2 + Math.ceil(mapSizeBonus*0.5)
			+ 2*Math.floor(0.5*random * (MapParams.max_height * 2 - MapParams.min_height * 2 + Math.floor(mapSizeBonus*0.5)));
		let width = (MapParams.min_width) * 2 + Math.ceil(mapSizeBonus*0.5)
			+ 2*Math.floor(0.5*(1 - random) * (MapParams.max_width * 2 - MapParams.min_width * 2 + Math.floor(mapSizeBonus*0.5)));


		height = Math.max(2, height);
		width = Math.max(2, width);

		if (KDTileToTest) {
			altType = alts.TestTile;
			width = Math.ceil(KDTileToTest.w /2) + 7;
			height = Math.ceil(KDTileToTest.h /2) + 7;

		}


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
			KDMapData.KeysHeld = 0;
		}
		KinkyDungeonSetFlag("BossUnlocked", 0);
		if (altType && !bossRules && altType.nokeys) {
			KinkyDungeonSetFlag("BossUnlocked", -1);
		}

		KinkyDungeonCanvas.width = KinkyDungeonCanvasPlayer.width*KinkyDungeonGridWidthDisplay;
		KDMapData.GridHeight = height;
		KDMapData.GridWidth = width;


		// Generate the grid
		for (let X = 0; X < height; X++) {
			for (let Y = 0; Y < width; Y++)
				KDMapData.Grid = KDMapData.Grid + '1';
			KDMapData.Grid = KDMapData.Grid + '\n';
		}
		KDGenerateBaseTraffic(width, height);

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
		if (KinkyDungeonStatsChoice.get("Pristine")) rubblechance *= 0.3;
		//if (KinkyDungeonGoddessRep.Prisoner && KDGameData.KinkyDungeonSpawnJailers > 0) doorlockchance = doorlockchance + (KDGameData.KinkyDungeonSpawnJailers / KDGameData.KinkyDungeonSpawnJailersMax) * (1.0 - doorlockchance) * (KinkyDungeonGoddessRep.Prisoner + 50)/100;
		let trapChance = MapParams.trapchance; // Chance of a pathway being split between a trap and a door
		let doorlocktrapchance = MapParams.doorlocktrapchance != undefined ? MapParams.doorlocktrapchance : MapParams.trapchance;
		let doortrapchance = MapParams.doortrapchance || 0.4;
		let minortrapChance = MapParams.minortrapChance ? MapParams.minortrapChance : trapChance/10;
		// Door algorithm is defunct
		let grateChance = MapParams.grateChance;
		let doorchance = MapParams.doorchance;
		let nodoorchance = MapParams.nodoorchance;
		let doorlockchance = MapParams.doorlockchance;
		let gasChance = ((!altType || !altType.noClutter) && MapParams.gaschance && KDRandom() < MapParams.gaschance) ? (MapParams.gasdensity ? MapParams.gasdensity : 0) : 0;
		let gasType = MapParams.gastype ? MapParams.gastype : "0";
		let brickchance = MapParams.brickchance; // Chance for brickwork to start being placed
		let wallRubblechance = MapParams.wallRubblechance ? MapParams.wallRubblechance : 0;
		let barrelChance = MapParams.barrelChance ? MapParams.barrelChance : 0.08;
		let foodChance = MapParams.foodChance ? MapParams.foodChance : 0.2;
		let cageChance = MapParams.cageChance ? MapParams.cageChance : 0.25;
		let wallhookchance = MapParams.wallhookchance ? MapParams.wallhookchance : 0.025;
		let ceilinghookchance = MapParams.ceilinghookchance ? MapParams.ceilinghookchance : 0.03;
		let torchchance = MapParams.torchchance ? MapParams.torchchance : 0.35;
		let torchlitchance = MapParams.torchlitchance ? MapParams.torchlitchance : 0.75;
		let torchchanceboring = MapParams.torchchanceboring ? MapParams.torchchanceboring : 0.85;
		let torchreplace = (altType && altType.torchreplace) ? altType.torchreplace : (MapParams.torchreplace ? MapParams.torchreplace : null);
		let factionList = MapParams.factionList;

		if (forceFaction) factionList = [forceFaction];

		// Determine faction tags
		let tags = Object.assign([], MapParams.enemyTags);
		if (mapMod && mapMod.tags) {
			// Add in any mapmod tags
			for (let t of mapMod.tags) {
				if (!tags.includes(t))
					tags.push(t);
			}
		}

		KDMapData.JailFaction = [];
		if (mapMod?.jailType) KDMapData.JailFaction.push(mapMod.jailType);
		else if (altType?.jailType) KDMapData.JailFaction.push(altType.jailType);

		KDMapData.GuardFaction = [];
		if (mapMod?.guardType) KDMapData.GuardFaction.push(mapMod.guardType);
		else if (altType?.guardType) KDMapData.GuardFaction.push(altType.guardType);
		let bonus = (mapMod && mapMod.bonusTags) ? mapMod.bonusTags : undefined;
		if (altType && altType.bonusTags) {
			if (!bonus) bonus = altType.bonusTags;
			else bonus = Object.assign(Object.assign(Object.assign({}, bonus)), altType.bonusTags);
		}

		let randomFactions = KDChooseFactions(factionList, Floor, tags, bonus, true);
		let factionEnemy = randomFactions[2] || forceFaction || "Bandit";
		if (forceFaction) {
			KDMapData.MapFaction = forceFaction;
			KDMapData.JailFaction = [forceFaction];
			KDMapData.GuardFaction = [forceFaction];
		}

		//console.log(KDRandom());
		let shrineTypes = [];
		let shrinelist = [];
		let chargerlist = [];
		let chestlist = [];
		let startTime = performance.now();
		let genType = !altType ? "TileMaze" : altType.genType;

		// MAP GENERATION

		let VisitedRooms = [];

		KDMapData.StartPosition = {x: 1, y: startpos * 2};

		KinkyDungeonMapSet(1, startpos, '0', VisitedRooms);

		KinkyDungeonPOI = [];
		let POI = KinkyDungeonPOI;
		KDMapData.Labels = {};
		KDMapData.data = {};
		KDMapData.PrisonState = "";
		KDMapData.PrisonStateStack = [];


		// Place the player!
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, x: KDMapData.StartPosition.x, y:KDMapData.StartPosition.y, player:true};


		let traps = [];

		let spawnPoints = [];

		let data = {
			params: MapParams,
			Floor: Floor,
			chestlist: chestlist,
			traps: traps,
			shrinelist: shrinelist,
			chargerlist: chargerlist,
			spawnpoints: spawnPoints,
			notraps: altType?.notraps,
			MapData: KDMapData,
		};

		KDMapData.CategoryIndex = {};

		KinkyDungeonCreateMapGenType[genType](POI, VisitedRooms, width, height, openness, density, hallopenness, data);

		//console.log(KDRandom());
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for maze creation`);
			startTime = performance.now();
		}
		width = KDMapData.GridWidth;
		height = KDMapData.GridHeight;

		KinkyDungeonResetFog();

		KinkyDungeonPlayerEntity.x = KDMapData.StartPosition.x;
		KinkyDungeonPlayerEntity.y = KDMapData.StartPosition.y;


		if (!altType || !altType.noWear)
			KinkyDungeonReplaceDoodads(crackchance, barchance, wallRubblechance, wallhookchance, ceilinghookchance, width, height, altType); // Replace random internal walls with doodads
		//console.log(KDRandom());
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for doodad creation`);
			startTime = performance.now();
		}
		KinkyDungeonPlaceStairs(KDMapData.StartPosition.y, width, height, altType && altType.nostairs, altType && altType.nostartstairs,
			origMapType); // Place the start and end locations

		KDPlacePlayerBasedOnDirection(direction);

		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for stair creation`);
			startTime = performance.now();
		}

		let noBoring = altType?.noboring;

		// Now we create the boringness matrix
		KDCreateBoringness(noBoring);

		if (!altType?.noSetpiece)
			KinkyDungeonPlaceSetPieces(POI, traps, chestlist, shrinelist, chargerlist, spawnPoints, false, width, height);

		if (!((KinkyDungeonNearestJailPoint(1, 1) || (altType && altType.nojail)) && (!altType || KDStageBossGenerated || !bossRules))) {
			console.log("This map failed to generate! Please screenshot and send your save code to Ada on deviantart or discord!");
			continue;
		}

		KinkyDungeonGenNavMap();

		if (altType && !altType.noFurniture)
			KinkyDungeonPlaceFurniture(barrelChance, cageChance, width, height, altType); // Replace random internal walls with doodads

		if (altType && !altType.noFood)
			KinkyDungeonPlaceFood(foodChance, width, height, altType); // Replace random internal walls with doodads

		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for setpiece generation`);
			startTime = performance.now();
		}
		// Recreate boringness
		KDCreateBoringness(noBoring);

		if (!testPlacement) {
			//if (!altType || altType.shortcut)
			//KinkyDungeonPlaceShortcut(KinkyDungeonGetShortcut(Floor, altType), width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for shortcut creation`);
				startTime = performance.now();
			}
			if (!altType || altType.chests)
				KinkyDungeonPlaceChests(MapParams, chestlist, spawnPoints, shrinelist, treasurechance, treasurecount, rubblechance, Floor, width, height); // Place treasure chests inside dead ends
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for chest creation`);
				startTime = performance.now();
			}
			let traps2 = [];
			if (!altType || altType.placeDoors)
				traps2 = KinkyDungeonPlaceDoors(doorchance, doortrapchance, nodoorchance, doorlockchance, trapChance, grateChance, Floor, width, height,
				!altType ? KDPlaceMode.MODE_MODIFYPOTENTIALANDEXISTING : (altType.doorPlaceMode || KDPlaceMode.MODE_PLACENEW));
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
			KDCreateBoringness(noBoring);
			let orbcount = Math.min(2, Math.max(2 * (MiniGameKinkyDungeonLevel + KinkyDungeonNewGame*KinkyDungeonMaxLevel) - KDGameData.CollectedOrbs, 0));
			if (altType && altType.orbs != undefined) orbcount = altType.orbs;
			if (!altType || altType.shrines) {
				let modify = 0;
				let allowHearts = (!altType || altType.heart) && KDGameData.CollectedHearts*0.5 < (MiniGameKinkyDungeonLevel + KinkyDungeonMaxLevel*KinkyDungeonNewGame);
				if (allowHearts) modify = 2;
				let quests = KinkyDungeonPlaceShrines(chestlist, shrinelist, shrinechance, shrineTypes, shrinecount,
					shrinefilter, ghostchance, manaChance, orbcount, (altType && altType.noShrineTypes) ? altType.noShrineTypes : [],
					Floor, width, height, !altType || (altType.makeMain && !altType.noQuests), allowHearts);
				if (
				//(
				//(KDGameData.SelectedEscapeMethod && KinkyDungeonEscapeTypes[KDGameData.SelectedEscapeMethod]?.requireMaxQuests)
				//|| (forceEscape && KinkyDungeonEscapeTypes[forceEscape]?.requireMaxQuests)
				//)

					// Force max goddess quests
					(!altType || (altType.makeMain && !altType.noQuests))
					&& quests < KDMAXGODDESSQUESTS + modify) {
					console.log("This map failed to generate due to shrine count! Please screenshot and send your save code to Ada on deviantart or discord!");
					continue;
				}
			}
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
			if (!altType || !altType.nobrick)
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
			if (!altType || !altType.nopatrols)
				KinkyDungeonPlacePatrols(4, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for patrol point creation`);
				startTime = performance.now();
			}

			if ((!altType || !altType.nolore))
				KinkyDungeonPlaceLore(width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for lore creation`);
				startTime = performance.now();
			}
			if (!altType || altType.specialtiles)
				KinkyDungeonPlaceSpecialTiles(gasChance, gasType, Floor, width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for special tile creation`);
				startTime = performance.now();
			}
			KinkyDungeonGenNavMap();
			KDLowPriorityNavMesh();
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for navmap creation`);
				startTime = performance.now();
			}

			KinkyDungeonUpdateStats(0);



			// Place enemies after player
			if (!altType || altType.enemies) {

				KinkyDungeonPlaceEnemies(spawnPoints, false, tags, bonus, Floor, width, height, altType,
					randomFactions, factionEnemy);
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
		let lightingParams = null;
		if (altType?.lightParams) lightingParams = KinkyDungeonMapParams[altType.lightParams];
		else if (altType?.skin) lightingParams = KinkyDungeonMapParams[altType.skin];
		KDMapData.MapBrightness = altType?.brightness || lightingParams?.brightness || MapParams.brightness;
		KinkyDungeonMakeGhostDecision();

		// Place the jail keys AFTER making the map!
		KinkyDungeonLoseJailKeys(false, bossRules);


		if (KDTileToTest || ((KinkyDungeonNearestJailPoint(1, 1) || (altType && altType.nojail)) && (!altType || KDStageBossGenerated || !bossRules)
			&& KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y, KDMapData.EndPosition.x, KDMapData.EndPosition.y,
				false, false, false, KinkyDungeonMovableTilesSmartEnemy,
				false, false, false, undefined, false,
				undefined, false, true)?.length > 0)) iterations = maxIter;
		else console.log("This map failed to generate! Please screenshot and send your save code to Ada on deviantart or discord!");

		if (iterations == maxIter) {
			KDUnPackEnemies(KDMapData);
			if (!KinkyDungeonMapIndex.grv)
				KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);

			KinkyDungeonSendEvent("postMapgen", {});

			if (altType && altType.tickFlags) {
				KinkyDungeonSendEvent("tickFlags", {delta: 1});
				KDTickSpecialStats();
			}

			KDQuestWorldgenStart(KDGameData.Quests);

			if (KDGameData.RoomType == "" || forceEscape) {
				if (!KDGameData.SelectedEscapeMethod) KDGameData.SelectedEscapeMethod = "Key";
				KDMapData.EscapeMethod = KDGameData.SelectedEscapeMethod;
				if (forceEscape) {
					KDMapData.EscapeMethod = forceEscape;
				} else {
					if (KinkyDungeonStatsChoice.get("escaperandom")) {
						KDMapData.EscapeMethod = KDGetRandomEscapeMethod();
						let choices = [];
						for (let method in KinkyDungeonEscapeTypes) {
							if (KinkyDungeonEscapeTypes[method].selectValid) {
								choices.push(method);
							}
						}
						let choice = Math.floor(KDRandom()*choices.length);
						KDMapData.EscapeMethod = choices[choice];
					}
				}

				KDGameData.SelectedEscapeMethod = "Key";
				KDEscapeWorldgenStart(KDGetEscapeMethod(Floor));
			}
			KinkyDungeonSendEvent("postQuest", {altType: altType});

			if (altType?.prisonType) {
				let prisonType = KDPrisonTypes[altType.prisonType];
				KDMapData.PrisonStateStack = [];
				KDMapData.PrisonState = prisonType.starting_state;
				KDMapData.PrisonType = prisonType.name;
				for (let state of Object.values(prisonType.states)) {
					if (state.init) {
						state.init(MapParams);
					}
				}
				KinkyDungeonSendEvent("postPrisonIntro", {altType: altType});
			}


			for (let e of allies) {
				KDAddEntity(e, true);
				let point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, true, true);
				if (!point) point = KinkyDungeonGetNearbyPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, undefined, true);
				if (!point) point = {x: KinkyDungeonPlayerEntity.x, y: KinkyDungeonPlayerEntity.y};
				KDMoveEntity(e, point.x, point.y, false,undefined, undefined, true);
				e.visual_x = point.x;
				e.visual_y = point.y;
			}

			KDUnPackEnemies(KDMapData);
			/*for (let e of KinkyDungeonGetAllies()) {

			}*/
			KDUpdateEnemyCache = true;

			KinkyDungeonAdvanceTime(0);
		}
	}

	location.data[KDGameData.RoomType] = KDMapData;

	KDTileToTest = null;
	KDPathCache = new Map();
	KDPathCacheIgnoreLocks = new Map();
	KDRedrawFog = 2;
	KDUpdateEnemyCache = true;
	KDUnPackEnemies(KDMapData);
	// Filter non-present enemies
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return (!KDGetNPCLocation(enemy.id) || KDCompareLocation(KDGetNPCLocation(enemy.id), KDGetCurrentLocation()));
	});
	KinkyDungeonAdvanceTime(0);

	if (!altType?.loadscript || altType.loadscript(true)) {
		if (!altType?.noPersistentPrisoners && !mapMod?.noPersistentPrisoners)
			KDRepopulatePersistentNPCs();
	}

	KinkyDungeonGenNavMap();

	UpdateRegiments({
		mapX: worldLocation.x,
		mapY: worldLocation.y,
		room: KDGameData.RoomType,
	});

}

let KDStageBossGenerated = false;

/**
 * Creates a list of all tiles accessible and not hidden by doors or dangerous
 */
function KinkyDungeonGenNavMap(fromPoint?: { x: number, y: number }) {
	if (!fromPoint) fromPoint = KDMapData.EndPosition || KDMapData.StartPosition;
	KDMapData.RandomPathablePoints = {};
	RandomPathList = [];
	let accessible = KinkyDungeonGetAccessible(fromPoint.x, fromPoint.y);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		let tags = [];
		if (!KinkyDungeonTilesGet(a[0]) || !KinkyDungeonTilesGet(a[0]).OL)
			if (!KDDefaultAvoidTiles.includes(KinkyDungeonMapGet(X, Y))) {
				if (!KDMapData.RandomPathablePoints[a[0]]) RandomPathList.push({x: X, y:Y, tags:tags});
				KDMapData.RandomPathablePoints[a[0]] = {x: X, y:Y, tags:tags};
			}

	}
	KDUpdateChokes = true;
}


/**
 * Create a web of low priority accessways
 */
function KDLowPriorityNavMesh() {
	let NavMap = [];
	for (let x = 4; x < KDMapData.GridWidth; x += KDTE_Scale) {
		for (let y = 4; y < KDMapData.GridWidth; y += KDTE_Scale) {
			if (KDMapData.RandomPathablePoints[(x) + ',' + (y)]) {
				NavMap.push({x:x, y:y});
			} else if (KDMapData.RandomPathablePoints[(x + 1) + ',' + (y)]) {
				NavMap.push({x:x+1, y:y});
			} else if (KDMapData.RandomPathablePoints[(x - 1) + ',' + (y)]) {
				NavMap.push({x:x-1, y:y});
			} else if (KDMapData.RandomPathablePoints[(x) + ',' + (y + 1)]) {
				NavMap.push({x:x, y:y+1});
			} else if (KDMapData.RandomPathablePoints[(x) + ',' + (y - 1)]) {
				NavMap.push({x:x, y:y-1});
			}
		}
	}
	for (let a of NavMap) {
		for (let b of NavMap) {
			if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(a.x, a.y))
				&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(b.x, b.y))) {
				let path = KinkyDungeonFindPath(a.x, a.y, b.x, b.y, false, false, false, KinkyDungeonMovableTilesSmartEnemy,
					false, false, false, undefined, false,
					(x, y, xx, yy) => {
						return KDistTaxicab(x - xx, y - yy);
					}, true,true);
				if (path)
					for (let p of path) {
						//let tile = KinkyDungeonTilesGet(p.x + "," + p.y) || {};
						//tile.HT = true; // High traffic
						KDMapData.Traffic[p.y][p.x] = 0;
						//KinkyDungeonTilesSet(p.x + "," + p.y, tile);
					}
			}
		}
	}

}

type GridEntry = {
	[ _: string ]: { x: number, y: number }
};

// Checks everything that is accessible to the player
function KinkyDungeonGetAccessible(startX: number, startY: number, testX?: number, testY?: number): GridEntry {
	let tempGrid = {};
	let checkGrid: GridEntry = {};
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
					if (!checkGrid[testLoc] && !tempGrid[testLoc] && X+XX > 0 && X+XX < KDMapData.GridWidth-1 && Y+YY > 0 && Y+YY < KDMapData.GridHeight-1
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
function KinkyDungeonGetAccessibleRoom(startX: number, startY: number): string[] {
	let tempGrid = {};
	let checkGrid: GridEntry = {};
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
function KinkyDungeonIsAccessible(testX: number, testY: number): boolean {
	let accessible = KinkyDungeonGetAccessible(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, testX, testY);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		if (KinkyDungeonMapGet(X, Y) == 's') return true;
	}
	return false;
}

// Tests if the player can reach the spot from the start point
function KinkyDungeonIsReachable(testX: number, testY: number, testLockX: number, testLockY: number): boolean {
	let accessible = KinkyDungeonGetAccessible(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, testLockX, testLockY);
	for (let a of Object.entries(accessible)) {
		let X = a[1].x;
		let Y = a[1].y;
		if (X == testX && Y == testY) return true;
	}
	return false;
}

function KinkyDungeonGetAllies(): entity[] {
	let temp = [];
	for (let e of KDMapData.Entities) {
		if (KDCanBringAlly(e)) {
			temp.push(e);
		}
	}

	return temp;
}

/**
 * @param enemy
 */
function KDIsImprisoned(enemy: entity): boolean {
	return enemy && KDEntityHasFlag(enemy, "imprisoned");
}


/**
 * @param e
 */
function KDCanBringAlly(e: entity): boolean {
	return e.Enemy &&
		(((e.Enemy.keepLevel || KDIsInParty(e)) && KDAllied(e) && !KDHelpless(e))
		|| (e.leash && e.leash.entity == KDPlayer().id))
	&& !KDIsImprisoned(e);
}

function KDChooseFactions(factionList: string[], Floor: number, Tags: string[], BonusTags: Record<string, {bonus: number, mult: number}>, Set: boolean): string[] {
	// Determine factions to spawn
	let factions = factionList || Object.keys(KinkyDungeonFactionTag);
	let primaryFaction = KDGetByWeight(KDGetFactionProps(factions, Floor, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), Tags, BonusTags));
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

	let factionAllied = allyCandidates.length > 0 ? KDGetByWeight(KDGetFactionProps(allyCandidates, Floor, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), Tags, BonusTags)) : "";
	let factionEnemy = enemyCandidates.length > 0 ? KDGetByWeight(KDGetFactionProps(enemyCandidates, Floor, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), Tags, BonusTags)) : "";

	if (factionAllied && KDRandom() < 0.33) randomFactions.push(factionAllied);
	if (factionEnemy && KDRandom() < 0.6) randomFactions.push(factionEnemy);

	if (Set) {
		KDMapData.JailFaction.push(primaryFaction);
		KDMapData.GuardFaction.push(primaryFaction);
		if (factionAllied) {
			KDMapData.GuardFaction.push(factionAllied);
		}
	}
	// Fill
	if (randomFactions.length == 1) randomFactions.push("Bandit", "Bandit");
	else if (randomFactions.length == 2) randomFactions.push("Bandit");

	console.log(randomFactions[0] + "," + randomFactions[1] + "," + randomFactions[2]);
	return randomFactions;
}

type SpawnBox = {
	requiredTags:      string[],
	tags:              string[],
	currentCount:      number,
	maxCount:          number,
	filterTags?:       string[],
	ignoreAllyCount?:  boolean,
	bias?:             number,
}

function KinkyDungeonPlaceEnemies(spawnPoints: any[], InJail: boolean, Tags: string[], BonusTags: any, Floor: number, width: number, height: number, altRoom?: any, randomFactions?: any[], factionEnemy?: any) {
	KinkyDungeonHuntDownPlayer = false;
	KinkyDungeonFirstSpawn = true;
	KinkyDungeonSearchTimer = 0;

	let enemyCount = 4 + Math.floor(Math.sqrt(Floor) + width/10 + height/10 + Math.sqrt(KinkyDungeonDifficulty));
	if (KinkyDungeonStatsChoice.get("Stealthy")) enemyCount = Math.round(enemyCount * KDStealthyEnemyCountMult);
	let neutralCount = 0.4 * enemyCount; // Cant have more than 40% of the level NOT be hostile
	if (KDTileToTest) {
		enemyCount = 1;
	}
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

	// These tags are disallowed unless working in the specific box
	let filterTagsBase = ["boss", "miniboss", "elite", "minor"];
	let filterTagsSpawn = ["boss", "miniboss"];
	let filterTagsCluster = ["boss", "miniboss"];

	let spawnBoxes: SpawnBox[] = [
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
			if (rf != undefined) {
				spawnBoxes.push({ignoreAllyCount: true, requiredTags: [KinkyDungeonFactionTag[rf]], filterTags: ["boss", "miniboss"], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.15, bias: rf == factionEnemy ? 2 : 1});
				spawnBoxes.push({ignoreAllyCount: true, requiredTags: ["miniboss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.1, bias: rf == factionEnemy ? 2 : 1});
				spawnBoxes.push({ignoreAllyCount: true, requiredTags: ["boss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.01, bias: rf == factionEnemy ? 2 : 1});
			}
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
			currentCluster = null;
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
		let faction = undefined;
		let tags = [];
		let levelBoost = 0;
		let forceIndex = undefined;
		let keys = false;

		let filterTags = JSON.parse(JSON.stringify(filterTagsBase));

		if (altRoom && altRoom.factionSpawnsRequired) {
			let jt = KDMapData.JailFaction?.length > 0 ? KinkyDungeonFactionTag[KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]] : "jailer";
			if (jt) tags.push(jt);
		}

		if (currentCluster && !(3 * KDRandom() < currentCluster.count) && !culledSpawns) {
			filterTags = JSON.parse(JSON.stringify(filterTagsCluster));
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

				filterTags = JSON.parse(JSON.stringify(filterTagsSpawn));
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
					tags = JSON.parse(JSON.stringify(spawns[0].tags));
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
				if (spawns[0].keys) keys = true;
				AI = spawns[0].AI;
				levelBoost = spawns[0].levelBoost || 0;
				forceIndex = spawns[0].forceIndex;
				faction = spawns[0].faction;
				spawns.splice(0, 1);
			}
		}

		let playerDist = 9;
		let PlayerEntity = KDMapData.StartPosition;

		let spawnBox_filter = spawnBoxes.filter((bb) => {
			return bb.currentCount < bb.maxCount * enemyCount && (!bb.bias
				// This part places allied faction toward the center of the map and enemy faction around the edges
				|| (bb.bias == 1 && X > width * 0.25 && X < width * 0.75 && Y > height * 0.25 && Y < height * 0.75)
				|| (bb.bias == 2 && !(X > width * 0.25 && X < width * 0.75 && Y > height * 0.25 && Y < height * 0.75))
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

		if ((spawnPoint && KinkyDungeonNoEnemy(X, Y, true)) || (
			KDMapData.RandomPathablePoints["" + X + "," + Y] && !culledSpawns
			//(!KinkyDungeonTilesGet("" + X + "," + Y) || !KinkyDungeonTilesGet("" + X + "," + Y).OL)
			&& Math.sqrt((X - PlayerEntity.x) * (X - PlayerEntity.x) + (Y - PlayerEntity.y) * (Y - PlayerEntity.y)) > playerDist && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y))
			&& KinkyDungeonNoEnemy(X, Y, true) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL))) {

			if (KDGameData.KinkyDungeonSpawnJailers > 0 && jailerCount < KDGameData.KinkyDungeonSpawnJailersMax) tags.push("jailer");
			if (KinkyDungeonMapGet(X, Y) == 'R' || KinkyDungeonMapGet(X, Y) == 'r') tags.push("rubble");
			if (KinkyDungeonMapGet(X, Y) == 'D' || KinkyDungeonMapGet(X, Y) == 'd') tags.push("door");
			if (KinkyDungeonMapGet(X, Y) == 'g') tags.push("grate");
			if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y+1)) && !KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y-1))) tags.push("passage");
			else if (!KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X+1, Y)) && !KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X-1, Y))) tags.push("passage");
			else if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X+1, Y+1))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X+1, Y-1))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X-1, Y+1))
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X-1, Y-1))) tags.push("open");

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
				KDGetEffLevel() + levelBoost,
				forceIndex || (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
				KinkyDungeonMapGet(X, Y),
				required,
				{
					requireHostile: ((!altRoom || altRoom.reduceNeutrals) && ncount > neutralCount && (!box || !box.ignoreAllyCount)) ? "Player" : "",
					requireAllied: altRoom?.factionSpawnsRequired ? (KDGetMainFaction() || KDFactionProperties[KDGetMainFaction()]?.jailAlliedFaction) : "",
					requireNonHostile: altRoom?.neutralSpawnsRequired ? KDGetMainFaction() : "",
				},
				BonusTags,
				currentCluster ? filterTagsCluster : filterTags);
			if (!Enemy) {
				Enemy = KinkyDungeonGetEnemy(
					tags,
					KDGetEffLevel() + levelBoost,
					forceIndex || (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
					KinkyDungeonMapGet(X, Y),
					required,
					{
						requireHostile: ((!altRoom || altRoom.reduceNeutrals) && ncount > neutralCount && (!box || !box.ignoreAllyCount)) ? "Player" : "",
						requireAllied: altRoom?.factionSpawnsRequired ? (KDFactionProperties[KDGetMainFaction()]?.jailBackupFaction || KDFactionProperties[KDGetMainFaction()]?.jailAlliedFaction || KDGetMainFaction()) : "",
						requireNonHostile: altRoom?.neutralSpawnsRequired ? KDGetMainFaction() : "",
					},
					BonusTags,
					currentCluster ? filterTagsCluster : filterTags);
			}
			if (!Enemy) {
				tries += 50; // to prevent long load times
			}
			if (box && !Enemy) {
				box.currentCount += 0.05;
			}
			if (Enemy && (!InJail || (Enemy.tags.jailer || Enemy.tags.jail || Enemy.tags.leashing))) {
				let e = {Enemy: Enemy, id: KinkyDungeonGetEnemyID(), x:X, y:Y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, shield: Enemy.shield,
					movePoints: 0, attackPoints: 0, AI: KDGetAITypeOverride(Enemy, AI) || AI || Enemy.AI, faction: faction};
				if (spawnPoint) {
					e['spawnX'] = X;
					e['spawnY'] = Y;
					if (keys) {
						e['keys'] = true;
					}
				}
				KDAddEntity(e);
				let clusterChance = 0.5; //1.1 + 0.9 * MiniGameKinkyDungeonLevel/KinkyDungeonMaxLevel;
				let clusterLeader = !spawnPoint && !currentCluster && Enemy.clusterWith && KDRandom() < clusterChance;
				// Give it a custom name, higher chance if cluster
				let custom = KDProcessCustomPatron(Enemy, e, (clusterLeader) ? 1.0 : (!currentCluster ? 0.1 : 0.0));
				let incrementCount = 1;
				KinkyDungeonSetEnemyFlag(e, "NoFollow", -1);
				let shop = KinkyDungeonGetShopForEnemy(e, false);
				if (shop) {
					KinkyDungeonSetEnemyFlag(e, "Shop", -1);
					KinkyDungeonSetEnemyFlag(e, shop, -1);
					KDSetShopMoney(e);
				}
				let loadout = KinkyDungeonGetLoadoutForEnemy(e, false);
				KDSetLoadout(e, loadout);

				if (!spawnPoint && !currentCluster && Enemy.clusterWith) {
					if (Enemy.tags.boss) clusterChance = 0;
					else if (Enemy.tags.miniboss) clusterChance = 0;
					else if (Enemy.tags.elite) clusterChance = 0.15;
					//else if (Enemy.tags.elite || Enemy.tags.miniboss) clusterChance *= 0.6;
					if (clusterLeader)
						currentCluster = {
							x : X,
							y : Y,
							required: Enemy.clusterWith,
							count: 1,
							AI: Enemy.guardChance && KDRandom() < Enemy.guardChance ? "looseguard" : undefined,
						};
				} else if (currentCluster) currentCluster.count += 1;
				if (!currentCluster && Enemy.guardChance && KDRandom() < Enemy.guardChance) {
					if (KDCanOverrideAI(e))
						e.AI = "looseguard";
					else e.AI = KDGetAIOverride(e, 'looseguard');
				} else if (currentCluster && currentCluster.AI) e.AI = KDGetAIOverride(e, currentCluster.AI);
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
						if (!sum.chance || KDRandom() < sum.chance) {
							let enemies = KinkyDungeonSummonEnemy(X, Y, sum.enemy, sum.count, sum.range, sum.strict);
							if (custom?.pets) {
								for (let i = 0; i < enemies.length; i++) {
									let en = enemies[i];
									KDProcessCustomPatronPet(custom.pets, en, i);
								}
							}

						}
					}
				}
				if (incrementCount) count += spawnPoint ? 0.025 : incrementCount;
				if (!spawnPoint && box)
					box.currentCount += incrementCount;
				if (KDFactionRelation("Player", KDGetFaction(e)) > -0.5) {
					ncount += incrementCount;
				}
				EnemyNames.push(Enemy.name + `_${box?`box-${box.requiredTags}, ${box.tags}`:""},${currentCluster?"cluster":""},${spawnPoint}`);
			}
		}
		tries += 1;
	}
	console.log(EnemyNames);

	KinkyDungeonCurrentMaxEnemies = KDMapData.Entities.length;
}

let KinkyDungeonSpecialAreas = [];

function KinkyDungeonGetClosestSpecialAreaDist(x: number, y: number): number {
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
function KinkyDungeonCreateRectangle (
	Left:         number,
	Top:          number,
	Width:        number,
	Height:       number,
	Border?:      boolean,
	Fill?:        boolean,
	Padding?:     number | boolean,
	OL?:          boolean,
	NW?:          boolean,
	flexCorner?:  boolean,
	Jail?:        boolean
): void
{
	let pad = (typeof Padding === 'number') ? Padding : +Padding;
	let borderType = (Border) ? '1' : '0';
	let fillType = (Fill) ? '1' : '0';
	for (let X = -pad; X < Width + pad; X++)
		for (let Y = - pad; Y < Height + pad; Y++) {
			if (X + Left < KDMapData.GridWidth-1 && Y + Top < KDMapData.GridHeight-1 && X + Left > 0 && Y + Top > 0) {
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
				if (setTo != "" && KinkyDungeonMapGet(Left + X, Top + Y) != "s" && KinkyDungeonMapGet(Left + X, Top + Y) != "H") {
					KinkyDungeonMapSet(Left + X, Top + Y, setTo);
					delete KDMapData.EffectTiles[(Left + X) + "," + (Top + Y)];
					if (offlimit && (OL || Jail || NW)) {
						KinkyDungeonTilesSet((Left + X) + "," + (Top + Y), {OL: OL, Jail: Jail, NW: NW});
					}
				}
			}


			/*
			if ((X == cellWidth || X == 0) && (Y > KDMapData.StartPosition.y - cellHeight && Y < KDMapData.StartPosition.y + cellHeight)) {
				wall = true;
				if (KDRandom() < barchance) bar = true;
			}
			if (Y == KDMapData.StartPosition.y - cellHeight && X <= cellWidth || Y == KDMapData.StartPosition.y + cellHeight && X <= cellWidth) {
				wall = true;
				if (KDRandom() < grateChance/(grateCount*3) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y+1)) && KinkyDungeonMovableTiles.includes(KinkyDungeonMapGet(X, Y-1))) grate = true;
			}
			if (X == cellWidth && Y == KDMapData.StartPosition.y) {
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

function KinkyDungeonPlaceStairs(_startpos: number, width: number, height: number, noStairs: boolean, nostartstairs: boolean, origMapType: string): void {
	// Starting stairs are predetermined and guaranteed to be open
	if (!nostartstairs) {
		KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');
		KinkyDungeonTilesSet(KDMapData.StartPosition.x + ',' + KDMapData.StartPosition.y, {
			RoomType: origMapType == "JourneyFloor" ? "ShopStart" : origMapType,
		});
		KinkyDungeonSpecialAreas.push({x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y, radius: 2});
	}
	/*if (startpos > 1) KinkyDungeonMapSet(2, startpos - 1, '0');
	KinkyDungeonMapSet(2, startpos, '0');
	if (startpos < KDMapData.GridHeight-1) KinkyDungeonMapSet(2, startpos + 1, '0');
	if (startpos > 1) KinkyDungeonMapSet(3, startpos - 1, '0');
	KinkyDungeonMapSet(3, startpos, '0');
	if (startpos < KDMapData.GridHeight-1) KinkyDungeonMapSet(3, startpos + 1, '0');*/

	if (!noStairs) {
		// Ending stairs are not.
		let placed = false;

		if (KDMapData.EndPosition) {
			placed = true;
			KinkyDungeonMapSet(KDMapData.EndPosition.x, KDMapData.EndPosition.y, 's');
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
							KDMapData.EndPosition = {x: X, y: Y};
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
					KDMapData.EndPosition = {x: X, y: Y};
					L = 0;
				}
			}


		if (KDMapData.ShortcutPositions?.length > 0) {
			let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
			if (journeySlot?.SideRooms) {
				for (let i = 0; i < journeySlot?.SideRooms.length || i < KDMapData.ShortcutPositions.length; i++) {
					let pos = KDMapData.ShortcutPositions[i];
					if (pos) {
						let sideRoom = KDSideRooms[journeySlot?.SideRooms[i]];
						if (sideRoom) {
							let tile = KinkyDungeonTilesGet(pos.x + ',' + pos.y) || {};
							tile.SideRoom = sideRoom.name;
							tile.ShortcutIndex = i;
							tile.MapMod = sideRoom.mapMod;
							tile.Faction = sideRoom.faction;
							tile.EscapeMethod = sideRoom.escapeMethod;
							tile.RoomType = sideRoom.altRoom;
							KinkyDungeonTilesSet(pos.x + ',' + pos.y, tile);
							KinkyDungeonMapSet(pos.x, pos.y, 'H');
							if (sideRoom.stairCreation(tile, pos.x, pos.y)) {
								KinkyDungeonSpecialAreas.push({x: KDMapData.EndPosition.x, y: KDMapData.EndPosition.y, radius: 2});
							}
						} else {
							let tile = KinkyDungeonTilesGet(pos.x + ',' + pos.y) || {};
							tile.Skin = "CollapsedStairs";
							KinkyDungeonTilesSet(pos.x + ',' + pos.y, tile);
							KinkyDungeonMapSet(pos.x, pos.y, 'r');

						}
					}
				}
			}
		}
		KinkyDungeonSpecialAreas.push({x: KDMapData.EndPosition.x, y: KDMapData.EndPosition.y, radius: 2});
	}

	if (!KDMapData.EndPosition) KDMapData.EndPosition = JSON.parse(JSON.stringify(KDMapData.StartPosition));
	//KDMapData.MainPath = checkpoint;
	//if (KDMapData.MainPath != MiniGameKinkyDungeonCheckpoint && !nostartstairs) KinkyDungeonSkinArea({skin: KDMapData.MainPath}, KDMapData.EndPosition.x, KDMapData.EndPosition.y, 4.99);
}

function KinkyDungeonSkinArea(skin: any, X: number, Y: number, Radius: number, NoStairs?: boolean) {
	for (let xx = Math.floor(X - Radius); xx <= Math.ceil(X + Radius); xx++) {
		for (let yy = Math.floor(Y - Radius); yy <= Math.ceil(Y + Radius); yy++) {
			if (xx >= 0 && xx <= KDMapData.GridWidth - 1 && yy >= 0 && yy <= KDMapData.GridHeight - 1) {
				if (KDistEuclidean(xx - X, yy - Y) <= Radius + 0.01 && (!NoStairs || KinkyDungeonMapGet(xx, yy) != 's')) {
					if (!KDMapData.TilesSkin[xx + "," + yy]) {
						KDMapData.TilesSkin[xx + "," + yy] = JSON.parse(JSON.stringify(skin));
					} else {
						KDMapData.TilesSkin[xx + "," + yy].skin = skin.skin;
					}
				}
			}
		}
	}
}



let KDMinBoringness = 0; // Minimum boringness for treasure spawn

function KinkyDungeonPlaceChests(params: floorParams, chestlist: any[], spawnPoints: any[], shrinelist: any[], treasurechance: number, treasurecount: number, rubblechance: number, Floor: number, width: number, height: number) {

	let shrinePoints = new Map();

	for (let s of shrinelist) {
		shrinePoints.set(s.x + "," + s.y, true);
	}
	let chestPoints = new Map();

	for (let s of chestlist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			chestPoints.set(s.x + "," + s.y, true);
	}

	let specialdata = {
		altType: KDGetAltType(MiniGameKinkyDungeonLevel),
		specialChests: (params.specialChests ? JSON.parse(JSON.stringify(params.specialChests)) : {}) as Record<string, number>,
	};

	KinkyDungeonSendEvent("specialChests", specialdata);

	console.log(specialdata.specialChests);

	let extra = KDRandom() < treasurechance;
	treasurecount += (extra ? 1 : 0);
	for (let c of Object.values(specialdata.specialChests)) {
		treasurecount += c;
	}

	if (KinkyDungeonStatsChoice.get("Stealthy")) treasurecount *= 2;

	if (chestlist.length < treasurecount) {
		// Populate the chests
		for (let X = 1; X < width; X += 1)
			for (let Y = 1; Y < height; Y += 1) {
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && KDistChebyshev(X - KDMapData.StartPosition.x, Y - KDMapData.StartPosition.y) > 10 &&
				(!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL)) {
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
							&& (!(!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X+1, Y)) && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X-1, Y)))
								|| (wallcount > 4 && adjcount == 3 && diagadj == 7 - wallcount))
							&& (!(!KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y+1)) && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y-1)))
								|| (wallcount > 4 && adjcount == 3 && diagadj == 7 - wallcount)))) {
						if (!chestPoints.get((X+1) + "," + (Y))
							&& !chestPoints.get((X-1) + "," + (Y))
							&& !chestPoints.get((X+1) + "," + (Y+1))
							&& !chestPoints.get((X+1) + "," + (Y-1))
							&& !chestPoints.get((X-1) + "," + (Y+1))
							&& !chestPoints.get((X-1) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y+1))
							&& !chestPoints.get((X) + "," + (Y-1))
							&& !shrinePoints.get((X) + "," + (Y))
							&& !shrinePoints.get((X+1) + "," + (Y))
							&& !shrinePoints.get((X-1) + "," + (Y))
							&& !shrinePoints.get((X+1) + "," + (Y+1))
							&& !shrinePoints.get((X+1) + "," + (Y-1))
							&& !shrinePoints.get((X-1) + "," + (Y+1))
							&& !shrinePoints.get((X-1) + "," + (Y-1))
							&& !shrinePoints.get((X) + "," + (Y+1))
							&& !shrinePoints.get((X) + "," + (Y-1))
							&& wallcount != 8
							&& !KinkyDungeonEnemyAt(X, Y)
							&& !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
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
	let maxBoringness = Math.max(...KDMapExtraData.Boringness);
	while (chestlist.length > 0) {
		let N = Math.floor(KDRandom()*chestlist.length);
		let chest = chestlist[N];
		if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
		if (chest.boringness > maxBoringness * 0.2)
			chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
		else
			chest.boringness = chest.boringness + 0.02 * KDRandom() * maxBoringness;
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
			let lock = KinkyDungeonGenerateLock((extra && count == 0) ? true : false, Floor, false, "Chest", {x: chest.x, y: chest.y, tile: KinkyDungeonTilesGet("" + chest.x + "," + chest.y)});
			if (chest.Loot) lock = chest.Lock;
			if (silverchest == 0 && !chest.Loot) {
				silverchest += 1;
				KDGameData.ChestsGenerated.push("silver");
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {
					Loot: "silver", Roll: KDRandom(), NoTrap: chest.noTrap, Faction: chest.Faction,
					lootTrap: KDGenChestTrap(false, chest.x, chest.y, "silver", lock, chest.noTrap),});
			} else if (Object.values(specialdata.specialChests).some((num) => {return num > 0;})) {
				let filtered = Object.keys(specialdata.specialChests).filter((stype) => {return specialdata.specialChests[stype] > 0;});
				let type = filtered[Math.floor(KDRandom() * filtered.length)];
				specialdata.specialChests[type] -= 1;
				let data = {
					lock: lock,
					noTrap: chest.noTrap,
					type: type,
					loot: type,
					faction: chest.Faction,
					specialChests: specialdata.specialChests,
					guaranteedTrap: false,
				};
				KinkyDungeonSendEvent("genSpecialChest", data);
				KDGameData.ChestsGenerated.push(type);
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {
					Loot: data.loot, Roll: KDRandom(), NoTrap: data.noTrap, Faction: data.faction, Type: data.lock ? "Lock" : undefined, Lock: data.lock,
					Special: data.lock == "Blue",
					RedSpecial: data.lock == "Red",
					lootTrap: KDGenChestTrap(data.guaranteedTrap || false, chest.x, chest.y, data.type, data.lock, data.noTrap),});
			} else if (lock) {
				KDGameData.ChestsGenerated.push(lock == "Blue" ? "blue" : (chest.Loot ? chest.Loot : "chest"));
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {
					NoTrap: chest.NoTrap, Type: "Lock", Lock: lock,
					Loot: lock == "Blue" ? "blue" : (chest.Loot ? chest.Loot : "chest"),
					Faction: chest.Faction,
					Roll: KDRandom(),
					Special: lock == "Blue",
					RedSpecial: lock == "Red",
					lootTrap: KDGenChestTrap(false, chest.x, chest.y, (chest.Loot ? chest.Loot : "chest"), lock, chest.noTrap),});
			} else {
				KDGameData.ChestsGenerated.push(chest.Loot ? chest.Loot : "chest");
				KinkyDungeonTilesSet("" + chest.x + "," +chest.y, {Loot: chest.Loot ? chest.Loot : "chest", Faction: chest.Faction, Roll: KDRandom(),
					NoTrap: chest.NoTrap,
					lootTrap: KDGenChestTrap(false, chest.x, chest.y, (chest.Loot ? chest.Loot : "chest"), lock, chest.noTrap),});
			}

			if (!KinkyDungeonTilesGet(chest.x + ',' + chest.y)?.lootTrap) {
				// Chests in the open receive an extra guard
				let point = KinkyDungeonGetNearbyPoint(chest.x, chest.y, true, undefined, true, false);
				// Try again but a short dist away
				if (!point) point = KinkyDungeonGetNearbyPoint(chest.x, chest.y, true, undefined, false, false);
				if (point) {
					let t = ["jailer"];
					if (KinkyDungeonFactionTag[KDGetMainFaction()]) {
						t.push(KinkyDungeonFactionTag[KDGetMainFaction()]);
					}
					spawnPoints.push({x:point.x, y:point.y, required: t, AI: "guard", priority: true, force: true, keys: true, faction: KinkyDungeonTilesGet(chest.x + ',' + chest.y)?.Faction || KDGetMainFaction() || "Enemy"});
					if (!KinkyDungeonTilesGet(chest.x + ',' + chest.y).Faction) {
						KinkyDungeonTilesGet(chest.x + ',' + chest.y).Faction = KDGetMainFaction();
					}
				}
			}

			if (KDAlreadyOpened(chest.x, chest.y)) {
				//KinkyDungeonMapSet(chest.x, chest.y, 'c');
				//KinkyDungeonTilesDelete("" + chest.x + "," +chest.y);
			}
			count += 1;
		} else {

			let chest = list[N];
			if (KinkyDungeonTilesGet(chest.x + ',' + chest.y)) {
				delete KinkyDungeonTilesGet(chest.x + ',' + chest.y).Faction;
				delete KinkyDungeonTilesGet(chest.x + ',' + chest.y).Type;
				delete KinkyDungeonTilesGet(chest.x + ',' + chest.y).Lock;
				delete KinkyDungeonTilesGet(chest.x + ',' + chest.y).lootTrap;

			}
			if (KDRandom() < rubblechance) {
				KinkyDungeonMapSet(chest.x, chest.y, 'R');
			} else if (KDRandom() * KDRandom() < rubblechance - 0.01) KinkyDungeonMapSet(chest.x, chest.y, '/');
			else if (KDRandom() < rubblechance - 0.05) KinkyDungeonMapSet(chest.x, chest.y, 'r');

		}
		list.splice(N, 1);
	}


	for (let tile of Object.entries(KDMapData.Tiles)) {
		if (tile[1].lootTrap) {
			let x = parseInt(tile[0].split(',')[0]);
			let y = parseInt(tile[0].split(',')[1]);
			let spawned = 0;
			let mult = tile[1].lootTrap.mult;
			let trap = tile[1].lootTrap.trap;
			let time = tile[1].lootTrap.time || 3;
			//let duration = tile[1].lootTrap.duration;
			let maxspawn = 1 + Math.round(Math.min(2 + KDRandom() * 2, KinkyDungeonDifficulty/25) + Math.min(2 + KDRandom() * 2, 0.5*MiniGameKinkyDungeonLevel/KDLevelsPerCheckpoint));
			if (mult) maxspawn *= mult;
			let requireTags = trap ? [trap] : undefined;

			let tags = ["trap", trap];
			KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);

			for (let i = 0; i < 30; i++) {
				if (spawned < maxspawn) {
					let Enemy = KinkyDungeonGetEnemy(
						tags, KDGetEffLevel(),
						(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
						'0', requireTags, {requireHostile: "Player"});
					if (Enemy) {
						let point = KinkyDungeonGetNearbyPoint(x, y, true, undefined, undefined, true, (xx, yy) => {
							return !KDEffectTileTags(xx, yy).rune;
						});

						//KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, Enemy.name, 1, 7, true, (duration || Enemy.tags.construct) ? (duration || 40) : undefined, undefined, false, "Ambush", true, 1.5, true, undefined, true, true);
						if (point) {
							if (!KinkyDungeonTilesGet(point.x + ',' + point.y)) KinkyDungeonTilesSet(point.x + ',' + point.y, {});
							KinkyDungeonTilesGet(point.x + ',' + point.y).lootTrapEnemy = Enemy.name;
							KinkyDungeonTilesGet(point.x + ',' + point.y).lootTrapTime = time;
							KDCreateEffectTile(point.x, point.y, {
								name: "Runes",
								duration: 9999, infinite: true,
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


function KinkyDungeonPlaceLore(width: number, height: number): number {
	let loreList = [];

	// Populate the lore
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL) && KDRandom() < 0.6) loreList.push({x:X, y:Y});

	let count = 0;
	let maxcount = 2;
	while (loreList.length > 0) {
		let N = Math.floor(KDRandom()*loreList.length);
		KDMapData.GroundItems.push({x:loreList[N].x, y:loreList[N].y, name: "Lore"});
		count += 1;
		if (count >= maxcount)
			return count;
	}
	return count;
}

function KinkyDungeonPlaceHeart(width: number, height: number, _Floor: number): boolean {
	let heartList = [];

	// Populate the lore
	for (let X = 1; X < width; X += 1)
		for (let Y = 1; Y < height; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))
				&& KDMapData.RandomPathablePoints[(X) + ',' + (Y)]
				&& !KinkyDungeonEnemyAt(X, Y)
				&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL)
				&& KDistChebyshev(X - KDMapData.StartPosition.x, Y - KDMapData.StartPosition.y) > 8
			) heartList.push({x:X, y:Y});

	while (heartList.length > 0) {
		let N = Math.floor(KDRandom()*heartList.length);
		if (!KDGameData.HeartTaken) {
			KDMapData.GroundItems.push({x:heartList[N].x, y:heartList[N].y, name: "Heart"});
		}
		return true;
	}

}



function KinkyDungeonPlaceShrines (
	chestlist:     any[],
	shrinelist:    any[],
	shrinechance:  number,
	shrineTypes:   any[],
	shrinecount:   number,
	shrinefilter:  string[],
	_ghostchance:  number,
	manaChance:    number,
	orbcount:      number,
	filterTypes:   string[],
	Floor:         number,
	width:         number,
	height:        number,
	allowQuests:   boolean,
	allowHearts:   boolean
): number
{
	KinkyDungeonCommercePlaced = 0;


	let chestPoints = new Map();

	for (let s of chestlist) {
		chestPoints.set(s.x + "," + s.y, true);
	}

	let shrinePoints = new Map();
	let shrinePointsBackup = new Map();

	for (let s of shrinelist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			shrinePoints.set(s.x + "," + s.y, true);
	}

	let maxcount = shrinecount + orbcount;

	let shrinelistBackup = [];


	let tablets = {
		//"Cursed": 0,
		"Determination": 0,
	};
	let tabletsAmount = {
		//"Cursed": 1,
		"Determination": 3,
	};

	if (allowHearts) {
		tablets['Heart'] = 0;
		tabletsAmount['Heart'] = 2;
	}
	for (let goddess of Object.keys(KinkyDungeonShrineBaseCosts)) {
		tablets[goddess] = 0;
		let amt = 0;
		if (KinkyDungeonGoddessRep[goddess] >= 5) {
			amt += 1;
		}
		if (KinkyDungeonGoddessRep[goddess] >= 15) {
			amt += 1;
		}
		if (KinkyDungeonGoddessRep[goddess] >= 35) {
			amt += 1;
		}
		tabletsAmount[goddess] = amt;
		maxcount += amt;
	}

	let isDoodad = (X: number, Y: number) => {
		return "aXmo".includes(KinkyDungeonMapGet(X, Y));
	};
	if (shrinelist.length <= maxcount)
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
						if (!shrinePoints.get((X+1) + "," + (Y))
							&& !shrinePoints.get((X-1) + "," + (Y))
							&& !shrinePoints.get((X+1) + "," + (Y+1))
							&& !shrinePoints.get((X+1) + "," + (Y-1))
							&& !shrinePoints.get((X-1) + "," + (Y+1))
							&& !shrinePoints.get((X-1) + "," + (Y-1))
							&& !shrinePoints.get((X) + "," + (Y+1))
							&& !shrinePoints.get((X) + "," + (Y-1))
							&& !chestPoints.get((X+1) + "," + (Y))
							&& !chestPoints.get((X-1) + "," + (Y))
							&& !chestPoints.get((X+1) + "," + (Y+1))
							&& !chestPoints.get((X+1) + "," + (Y-1))
							&& !chestPoints.get((X-1) + "," + (Y+1))
							&& !chestPoints.get((X-1) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y+1))
							&& !chestPoints.get((X) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y))
							&& wallcount != 8
							&& !KinkyDungeonEnemyAt(X, Y)
							&& !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y-1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X-1, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X, Y+1))
							&& !KDRandomDisallowedNeighbors.includes(KinkyDungeonMapGet(X+1, Y+1))) {
							if (isDoodad(X, Y)) {
								shrinelistBackup.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y)});
								shrinePointsBackup.set(X + "," + Y, true);
							} else {
								shrinelist.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y)});
								shrinePoints.set(X + "," + Y, true);
							}

						}
					}


				} else if (isDoodad(X, Y)) {
					let yes = false;
					for (let XX = X-1; XX <= X+1; XX += 1)
						for (let YY = Y-1; YY <= Y+1; YY += 1) {
							if (!yes && !(XX == X && YY == Y) && KDPointWanderable(XX, YY)) {
								yes = true;
							}
						}
					if (yes) {
						shrinelistBackup.push({x:X, y:Y, boringness: KinkyDungeonBoringGet(X, Y)});
						shrinePointsBackup.set(X + "," + Y, true);
					}
				}


	// If we STILL dont have enough, we expand the criteria
	if (shrinelist.length <= maxcount)
		for (let X = 1; X < width; X += 1)
			for (let Y = 1; Y < height; Y += 1)
				if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y)) && Math.max(Math.abs(X - KDMapData.StartPosition.x), Math.abs(Y - KDMapData.StartPosition.y)) > KinkyDungeonJailLeash
					&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL)) {
					// Check the 3x3 area
					let wallcount = 0;
					for (let XX = X-1; XX <= X+1; XX += 1)
						for (let YY = Y-1; YY <= Y+1; YY += 1) {
							if (!(XX == X && YY == Y) && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(XX, YY))) {
								wallcount += 1;
							}
						}

					if (wallcount == 0 // Open spaces and 1 off spaces
						|| wallcount == 1) {
						if (!shrinePoints.get((X+1) + "," + (Y))
							&& !shrinePoints.get((X-1) + "," + (Y))
							&& !shrinePoints.get((X+1) + "," + (Y+1))
							&& !shrinePoints.get((X+1) + "," + (Y-1))
							&& !shrinePoints.get((X-1) + "," + (Y+1))
							&& !shrinePoints.get((X-1) + "," + (Y-1))
							&& !shrinePoints.get((X) + "," + (Y+1))
							&& !shrinePoints.get((X) + "," + (Y-1))
							&& !chestPoints.get((X+1) + "," + (Y))
							&& !chestPoints.get((X-1) + "," + (Y))
							&& !chestPoints.get((X+1) + "," + (Y+1))
							&& !chestPoints.get((X+1) + "," + (Y-1))
							&& !chestPoints.get((X-1) + "," + (Y+1))
							&& !chestPoints.get((X-1) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y+1))
							&& !chestPoints.get((X) + "," + (Y-1))
							&& !chestPoints.get((X) + "," + (Y))
							&& !KinkyDungeonEnemyAt(X, Y)
							&& !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
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


				}





	// Truncate down to max chest count in a location-neutral way
	let count = 0;

	let orbs = 0;
	let list = [];
	let maxBoringness = Math.max(...KDMapExtraData.Boringness);
	while (shrinelist.length > 0) {
		let N = Math.floor(KDRandom()*shrinelist.length);
		let chest = shrinelist[N];
		if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
		if (chest.boringness > maxBoringness * 0.2)
			chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
		else
			chest.boringness = chest.boringness + 0.02 * KDRandom() * maxBoringness;
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

	let quests = 0;
	let backfillBackup = false;

	while (list.length > 0 || !backfillBackup) {
		if (list.length < 10 && !backfillBackup) {
			if (shrinelistBackup.length > 0) {
				while (shrinelistBackup.length > 0) {
					let N = Math.floor(KDRandom()*shrinelistBackup.length);
					let chest = shrinelistBackup[N];
					if (!chest.boringness) chest.boringness = KinkyDungeonBoringGet(chest.x, chest.y);
					if (chest.boringness > maxBoringness * 0.2)
						chest.boringness = chest.boringness + (0.05 + 0.1 * KDRandom()) * maxBoringness;
					else
						chest.boringness = chest.boringness + 0.02 * KDRandom() * maxBoringness;
					list.push(chest);

					shrinelistBackup.splice(N, 1);
				}
				list.sort((a, b) => {
					let boringa = a.boringness ? a.boringness : 0;
					let boringb = b.boringness ? b.boringness : 0;
					if (a.priority) boringa += 1000;
					if (b.priority) boringb += 1000;
					return boringb - boringa;

				});
			}
			backfillBackup = true;
		}

		let NN = 0;
		if (count <= shrinecount) {

			let shrine = list[NN];
			if (!shrine) break;
			if (count == shrinecount && KDRandom() > shrinechance)
				KinkyDungeonMapSet(shrine.x, shrine.y, 'a');
			else {
				let placedChampion = !allowQuests;
				let playerTypes = KinkyDungeonRestraintTypes(shrinefilter);
				let stype: {type: string, drunk?: boolean} = shrineTypes.length < orbcount ? {type: "Orb"}
					: ((KDGameData.Champion && !placedChampion && shrineTypes.length == orbcount) ? {type: KDGameData.Champion} :
						((shrineTypes.length == ((KDGameData.Champion && allowQuests) ? orbcount + 1 : orbcount) && playerTypes.length > 0) ?
							{type: playerTypes[Math.floor(KDRandom() * playerTypes.length)]}
								: KinkyDungeonGenerateShrine(Floor, filterTypes, manaChance)));
				let type = stype.type;
				let tile = 'A';
				if (type != "Orb" && shrineTypes.includes(type) && (KDRandom() < 0.5 || type == "Commerce")) type = "";
				if (type == "Orb") {
					if (orbs < orbcount) {
						tile = 'O';

						if (KinkyDungeonStatsChoice.get("randomMode") && KDGetRandomSpell()) {
							let spell = KDGetRandomSpell();
							KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Orb", Spell: spell.name, Light: 5, lightColor: 0x28B4FF});
						} else
							KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Orb", Light: 5, lightColor: 0x28B4FF});



						orbs += 1;
					} else tile = 'o';
					if (KDAlreadyOpened(shrine.x, shrine.y)) {
						//tile = 'o';
					}
					shrineTypes.push("Orb");
				} else if (type) {
					KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Shrine", Name: type, drunk: stype.drunk});
					if (allowQuests && quests < KDMAXGODDESSQUESTS) {
						let quest = KDGetShrineQuest(KDMapData, KinkyDungeonTilesGet("" + shrine.x + "," +shrine.y));
						if (quest) {
							KDSetShrineQuest(KDMapData, KinkyDungeonTilesGet("" + shrine.x + "," +shrine.y),
								quest);
							quests += 1;
						}
					}
					shrineTypes.push(type);
					placedChampion = true;
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
				let shrine = list[NN];
				if (goddess == 'Heart') quests += 1;
				KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Tablet", Name: goddess, Light: 3, lightColor: 0x8888ff});
				KinkyDungeonMapSet(shrine.x, shrine.y, 'M');

				tablets[goddess] += 1;
				break;
			}
		}

		list.splice(NN, 1);
	}
	return quests;
}


function KinkyDungeonPlaceChargers(chargerlist: any[], chargerchance: number, litchargerchance: number, chargercount: number, _Floor: number, width: number, height: number): void {
	let chargerPoints = new Map();

	for (let s of chargerlist) {
		if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(s.x, s.y)))
			chargerPoints.set(s.x + "," + s.y, true);
	}


	if (chargerlist.length < chargercount)
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
							&& !(Object.keys(KDGetEffectTiles(X, Y)).length > 0)
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
 * @param Floor
 * @param manaChance
 * @param filterTypes
 */
function KinkyDungeonGenerateShrine(_Floor: number, filterTypes: string[], manaChance: number) {
	let Params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
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


function KinkyDungeonPlaceSpecialTiles(gaschance: number, gasType: string, _Floor: number, width: number, height: number): void {
	if (gaschance > 0) {
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

}

function KinkyDungeonPlaceBrickwork( brickchance: number, _Floor: number, width: number, height: number) {
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

function KinkyDungeonPlaceTraps(traps: any[], traptypes: any[], trapchance: number, doorlocktrapchance: number, Floor: number, width: number, height: number): void {
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
					for (let item of KDMapData.GroundItems) {
						if (item.x == trap.x && item.y == trap.y && item.name == "Gold") {
							KDMapData.GroundItems.splice(KDMapData.GroundItems.indexOf(item), 1);
						}
					}
				}
			} else {
				KinkyDungeonMapSet(trap.x, trap.y, 'T');
				let t = KinkyDungeonGetTrap(traptypes, Floor, []);
				if (!t) continue;
				let tile = KinkyDungeonTilesGet(trap.x + "," + trap.y);
				if (t.StepOffTrap) {
					KinkyDungeonTilesSet(trap.x + "," + trap.y, {
						StepOffTrap: t.Name,
						Restraint: t.Restraint,
						Enemy: t.Enemy,
						FilterTag: t.FilterTag,
						FilterBackup: t.FilterBackup,
						Spell: t.Spell,
						Hostile: t.Hostile,
						Faction: t.Faction,
						extraTag: t.extraTag,
						Power: t.Power,
						OL: tile?.OL,
					});
				} else {
					KinkyDungeonTilesSet(trap.x + "," + trap.y, {
						Type: "Trap",
						Trap: t.Name,
						Restraint: t.Restraint,
						Enemy: t.Enemy,
						Hostile: t.Hostile,
						Faction: t.Faction,
						FilterTag: t.FilterTag,
						FilterBackup: t.FilterBackup,
						Spell: t.Spell,
						extraTag: t.extraTag,
						Power: t.Power,
						OL: tile?.OL,
					});
				}

				if (KDRandom() < 0.05) {
					let dropped = {x:trap.x, y:trap.y, name: "Gold", amount: 1};
					KDMapData.GroundItems.push(dropped);
				}
				let spell = t.Spell ? KinkyDungeonFindSpell(t.Spell, true) : null;
				if (spell && !spell.nonmagical) {
					KDCreateEffectTile(trap.x, trap.y, {
						name: "RunesTrap",
						duration: 9999, infinite: true,
					}, 0);
				}
			}
		}
	}


}

function KinkyDungeonPlacePatrols(Count: number, width: number, height: number): void {
	for (let i = 1; i <= Count; i++) {
		if (KDMapData.PatrolPoints.length < Count)
			for (let L = 1000; L > 0; L -= 1) { // Try up to 1000 times
				let X = Math.floor(i * width / (Count + 1)) + Math.floor(KDRandom() * width/(Count + 1));
				let Y = Math.floor(KDRandom()*height);
				if (!KinkyDungeonPointInCell(X, Y, 6)
					&& KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))
					&& (!KinkyDungeonTilesGet(X + "," + Y) || (!KinkyDungeonTilesGet(X + "," + Y).OL && !KinkyDungeonTilesGet(X + "," + Y).NW))) {
					KDMapData.PatrolPoints.push({x: X, y: Y});
					break;
				}
			}
	}
}

function KDGetEffLevel(): number {
	let effLevel = MiniGameKinkyDungeonLevel + Math.round(KinkyDungeonDifficulty/5);
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
	for (let X = 1; X < width-1; X += 1)
		for (let Y = 1; Y < height-1; Y += 1) {
			let category = (KDMapData.CategoryIndex ? KDGetCategoryIndex(X, Y)?.category : {}) as {category: string, tags: string[]};
			if (category?.tags?.includes("noWear")) continue;
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < Chance) {
				KinkyDungeonMapSet(X, Y, '4');
				// Cracks then expand in a random direction twice
				let curXOld = X;
				let curYOld = Y;
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
						} else {
							curX -= xd;
							curY -= yd;
						}
					}
				}

			} else
			if (KinkyDungeonMapGet(X, Y) == '1' && KDRandom() < wallRubblechance && !KDMapData.TilesSkin[X + "," + Y]) {
				KinkyDungeonMapSet(X, Y, 'Y');
				if (KDAlreadyOpened(X, Y)) {
					//KinkyDungeonMapSet(X, Y, '1');
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
						let furn = KDRandom() < (KinkyDungeonStatsChoice.get("MoreKinkyFurniture") ? 0.6 : 0.9) ? "Cage" : "DisplayStand";
						KinkyDungeonTilesSet(X + "," + Y, {Type: "Furniture", Furniture: furn});
						KDMapData.JailPoints.push({x: X, y: Y, type: "furniture", radius: 1}); // , requireFurniture: true Standing in the cage alone will prevent jailbreak--good for stealth!
					}
				}
			}
}

let KDFood = {
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
	Pizza: {
		Food: "Pizza",
		Weight: 4,
	},
};

function KinkyDungeonPlaceFood(foodChance: number, width: number, height: number, altType: any) {

	if (altType && altType.noClutter) return;

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

function KinkyDungeonPlaceTorches(torchchance: number, torchlitchance: number, torchchanceboring: number, width: number, height: number, _altType: any, torchreplace: any) {
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

let canvasOffsetX = 0;
let canvasOffsetY = 0;
const canvasOffsetX_ui = 500;
const canvasOffsetY_ui = 164;

interface MoveDirection {
	x: number,
	y: number,
	delta: number,
}

// returns an object containing coordinates of which direction the player will move after a click, plus a time multiplier
function KinkyDungeonGetDirection(dx: number, dy: number): MoveDirection {

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


let KinkyDungeonAutoWaitSuppress = false;

function KinkyDungeonControlsEnabled() {
	return !KinkyDungeonInspect && KDGameData.SlowMoveTurns < 1 && KinkyDungeonStatFreeze < 1 && KDGameData.SleepTurns < 1 && !KDGameData.CurrentDialog && !KinkyDungeonMessageToggle;
}

function KDStartSpellcast(tx: number, ty: number, SpellToCast: spell, enemy: any, player: any, bullet: any, data: any) {
	let spell = KinkyDungeonFindSpell(SpellToCast.name, true);
	let spellname = undefined;
	if (spell) {
		spellname = spell.name;
		spell = undefined;
	} else spell = SpellToCast;
	return KDSendInput("tryCastSpell", {tx: tx, ty: ty, spell: spell, spellname: spellname, enemy: enemy, player: player, bullet: bullet, ...data});
}

// Click function for the game portion
function KinkyDungeonClickGame(_Level?: number) {
	let _CharacterRefresh = CharacterRefresh;
	let _CharacterAppearanceBuildCanvas = CharacterAppearanceBuildCanvas;
	CharacterRefresh = () => {KDRefresh = true;};
	CharacterAppearanceBuildCanvas = () => {};

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
						let requireLight = KinkyDungeonVisionGet(KinkyDungeonTargetX, KinkyDungeonTargetY) > 0;
						let path = KinkyDungeonFindPath(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTargetX, KinkyDungeonTargetY,
							true, false, false, KinkyDungeonMovableTilesEnemy, requireLight, false, true,
							undefined, false, undefined, false, true);
						if (path) {
							KDSetFocusControl("");
							KinkyDungeonFastMovePath = path;
							KinkyDungeonSleepTime = 100;
							KinkyDungeonSetFlag("startPath", 1);
						} else if (KDistChebyshev(KinkyDungeonPlayerEntity.x - KinkyDungeonTargetX, KinkyDungeonPlayerEntity.y - KinkyDungeonTargetY) < 1.5) {
							KDSetFocusControl("");
							KDSendInput("move", {dir: KinkyDungeonMoveDirection, delta: 1, AllowInteract: true, AutoDoor: false, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint});
						}
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
	let MovableTiles = KinkyDungeonMovableTiles;
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
function KinkyDungeonGameKeyDown() {
	let moveDirection = null;

	if (KinkyDungeonKeyEnter[0] == KinkyDungeonKeybindingCurrentKey
		&& document.activeElement && KDFocusableTextFields.includes(document.activeElement.id)) {
		// @ts-ignore
		document.activeElement.blur();
	}
	if ((document.activeElement && KDFocusableTextFields.includes(document.activeElement.id))) return true;

	for (let b of Object.entries(KDButtonsCache)) {
		if (b[1].hotkeyPress == KinkyDungeonKeybindingCurrentKey) {
			KDClickButton(b[0]);
			return true;
		}
	}

	for (let keybinding of Object.values(KDKeyCheckers)) {
		if (keybinding()) return true;
	}
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


	if (moveDirection && KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game") {
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
	} else if (KinkyDungeonKeySpellConfig.includes(KinkyDungeonKeybindingCurrentKey)) {
		if (KinkyDungeonState == "Game") {
			let index = 1 + KinkyDungeonKeySpellConfig.indexOf(KinkyDungeonKeybindingCurrentKey);
			if (localStorage.getItem('KinkyDungeonSpellsChoice' + String (index))) {
				KinkyDungeonSpellsConfig = String (index);
				KinkyDungeonLoadSpellsConfig();
			}
		}
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeyWeapon.includes(KinkyDungeonKeybindingCurrentKey)) {
		KinkyDungeonSpellPress = KinkyDungeonKeybindingCurrentKey;
		KinkyDungeonRangedAttack();
		return true;
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeyUpcast.includes(KinkyDungeonKeybindingCurrentKey)) {
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
	} else if (KinkyDungeonState == "Game" && KinkyDungeonDrawState == "Game" && KinkyDungeonKeySpellPage.includes(KinkyDungeonKeybindingCurrentKey)) {
		KDCycleSpellPage();
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


				KDRefreshCharacter.set(KinkyDungeonPlayer, true);
				KinkyDungeonDressPlayer();
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
				case KinkyDungeonKeyMenu[5]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Quest" ? "Game" : "Quest"; break;
				case KinkyDungeonKeyMenu[6]: KinkyDungeonDrawState = (KinkyDungeonDrawState == "Collection" || KinkyDungeonDrawState == "Bondage") ? "Game" : "Collection"; break;
				case KinkyDungeonKeyMenu[7]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Facilities" ? "Game" : "Facilities"; break;
				case KinkyDungeonKeyMenu[8]: KinkyDungeonDrawState = "Restart"; break;
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
			switch (KinkyDungeonKeybindingCurrentKey) {
				// QuikInv, Inventory, Reputation, Magic, Log
				case KinkyDungeonKeyMenu[0]: KinkyDungeonShowInventory = !KinkyDungeonShowInventory; break;
				case KinkyDungeonKeyMenu[1]: KinkyDungeonDrawState = "Inventory"; break;
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = "Reputation"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = "MagicSpells"; break;
				case KinkyDungeonKeyMenu[4]: KinkyDungeonDrawState = "Logbook"; break;
				case KinkyDungeonKeyMenu[5]: KinkyDungeonDrawState = "Quest"; break;
				case KinkyDungeonKeyMenu[6]: KinkyDungeonDrawState = "Collection"; break;
				case KinkyDungeonKeyMenu[7]: KinkyDungeonDrawState = "Facilities"; break;
				case KinkyDungeonKeySkip[0]:
				case KinkyDungeonKeyMenu[8]:
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

	if (KinkyDungeonState == "Game") {
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
			} else if (KinkyDungeonDrawState == "Game" && KinkyDungeonKeySpellPage.includes(KinkyDungeonKeybindingCurrentKeyRelease)) {
				KDCycleSpellPage(true);
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
				case KinkyDungeonKeyMenu[2]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Reputation" ? "Game" : "Reputation"; break;
				case KinkyDungeonKeyMenu[3]: KinkyDungeonDrawState = KinkyDungeonDrawState == "MagicSpells" ? "Game" : "MagicSpells"; break;
				case KinkyDungeonKeyMenu[4]: KinkyDungeonDrawState = KinkyDungeonDrawState == "Logbook" ? "Game" : "Logbook"; break;
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

function KDAttackCost(weapon?: weapon) {
	let data = {
		attackCost: KinkyDungeonStatStaminaCostAttack,
		bonus: KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStaminaBonus"),
		mult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "AttackStamina")),
	};
	if (!weapon) weapon = KinkyDungeonPlayerDamage;
	if (weapon && weapon.staminacost) data.attackCost = -weapon.staminacost;

	KinkyDungeonSendEvent("attackCost", data);

	data.attackCost = Math.min(0, (data.attackCost + data.bonus) * data.mult);
	return data.attackCost;
}

/**
 * @param Enemy
 * @param [skip]
 */
function KinkyDungeonLaunchAttack(Enemy: entity, skip?: number): string {
	let attackCost = KDAttackCost();
	let capture = false;
	let result = "fail";
	if (!Enemy.Enemy) return result;
	if (Enemy) {
		KDTurnToFace(Enemy.x - KinkyDungeonPlayerEntity.x, Enemy.y - KinkyDungeonPlayerEntity.y);
	}

	let teasesub = !KDHostile(Enemy) && KinkyDungeonAggressive(Enemy) && KDCanDom(Enemy) && Enemy.hp > 0.51
		&& !KDEntityHasFlag(Enemy, "stopplay");
	if (!teasesub && Enemy && KDHelpless(Enemy) && Enemy.hp < 0.52) {
		attackCost = 0;
		capture = true;
	}
	let noadvance = false;
	if (KinkyDungeonHasStamina(Math.abs(attackCost), true)) {
		if (!KDGameData.ConfirmAttack && (KDIsImprisoned(Enemy) || ((!KinkyDungeonAggressive(Enemy) || KDAllied(Enemy)) && !(Enemy.playWithPlayer && KDCanDom(Enemy))))) {
			let d = Enemy.Enemy.specialdialogue ? Enemy.Enemy.specialdialogue : "GenericAlly";
			if (Enemy.specialdialogue) d = Enemy.specialdialogue; // Special dialogue override
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
					KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), "#ff5277", 1);
					KDGameData.ConfirmAttack = true;
					noadvance = true;
				}
			}*/
			else {
				KinkyDungeonSendActionMessage(10, TextGet("KDGameData.ConfirmAttack"), "#ff5277", 1);
				KDGameData.ConfirmAttack = true;
				noadvance = true;
				result = "confirm";
			}

		} else {
			if (!capture) {
				let damageInfo: damageInfo = {
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
				let data = {
					orighp: Enemy.hp,
					origbinding: Enemy.boundLevel,
					target: Enemy,
					attackCost: attackCost,
					skipTurn: false,
					attackData: damageInfo
				};
				KinkyDungeonSendEvent("beforePlayerLaunchAttack", data);
				if (attackCost < 0 && KinkyDungeonStatsChoice.has("BerserkerRage")) {
					KinkyDungeonChangeDistraction(0.7 - 0.5 * data.attackCost, false, 0.33);
				}
				if (KDGameData.HeelPower > 0)
					KDChangeBalance(data.attackCost * KDGetBalanceCost() * (0.75 + 0.5 * KDRandom()) * KDBalanceAttackMult*10*KDFitnessMult(), true);

				let origHP = Enemy.hp;
				if (KinkyDungeonAttackEnemy(data.target, data.attackData)) {
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
						"#ffffff", 2, undefined, undefined, undefined, "Action");
				} else {
					KinkyDungeonSendActionMessage(3.5,
						TextGet("KDAttackMiss").replace("TargetEnemy", TextGet("Name" + Enemy.Enemy.name)).replace("DamageDealt", "" + Math.round(dmgTotal * 10)),
						"#ffffff", 2, undefined, undefined, undefined, "Action", "Combat");
				}

				if (data.skipTurn) skip = 1;
				KinkyDungeonChangeStamina(data.attackCost, false, 1);
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "attack", 1);
				KinkyDungeonSetFlag("armattack", 1);
				KinkyDungeonSetEnemyFlag(data.target, "targetedForAttack", 4);
			} else {
				if ((Enemy.lifetime > 9000 || !Enemy.maxlifetime))
					KinkyDungeonAggro(Enemy, undefined, KinkyDungeonPlayerEntity);
				Enemy.hp = 0;
				KinkyDungeonKilledEnemy = Enemy;
				KinkyDungeonSendEvent("capture", {enemy: Enemy, attacker: KinkyDungeonPlayerEntity, skip: skip});
				if (!KDIDHasFlag(Enemy.id, "capOpPen")) {
					KDSetIDFlag(Enemy.id, "capOpPen", -1);
					KDAddOpinionPersistent(Enemy.id, -50);
				}
				KinkyDungeonChangeStamina(attackCost, false, 1);
				KinkyDungeonTickBuffTag(KinkyDungeonPlayerEntity, "capture", 1);
				if (KDGameData.Collection[Enemy.id + ""]) {
					KDGameData.Collection[Enemy.id + ""].status = "";
					KDSortCollection();
				}
				KDFreeNPC(Enemy);
				Enemy.hp = 0;
				KDSetToExpectedBondage(Enemy, 0);
				KinkyDungeonSetEnemyFlag(Enemy, "cap", noadvance ? 1 : 2);
				KDAddCollection(Enemy);
				if (KDIsNPCPersistent(Enemy.id)) {
					KDGetPersistentNPC(Enemy.id).collect = true;
					KDGetPersistentNPC(Enemy.id).captured = false;
					KDUpdatePersistentNPC(Enemy.id);
				}
				//KDAddOpinionPersistent(Enemy.id, -50);
				result = "capture";
			}

			KinkyDungeonLastAction = "Attack";
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

function KinkyDungeonMove(moveDirection: {x: number, y: number }, delta: number, AllowInteract: boolean, SuppressSprint?: boolean): boolean {
	let moveX = moveDirection.x + KinkyDungeonPlayerEntity.x;
	let moveY = moveDirection.y + KinkyDungeonPlayerEntity.y;
	let moved = false;
	let Enemy = KinkyDungeonEnemyAt(moveX, moveY);
	let passThroughSprint = false;
	let nextPosX = moveX*2-KinkyDungeonPlayerEntity.x;
	let nextPosY = moveY*2-KinkyDungeonPlayerEntity.y;
	let nextTile = KinkyDungeonMapGet(nextPosX, nextPosY);
	if (KinkyDungeonMovableTilesEnemy.includes(nextTile) && KinkyDungeonNoEnemy(nextPosX, nextPosY) && KinkyDungeonToggleAutoSprint) {
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
	if (Enemy && !allowPass && !passThroughSprint) {
		if (AllowInteract) {
			KDDelayedActionPrune(["Action", "Attack"]);
			KinkyDungeonLaunchAttack(Enemy);
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
				// We can pick up items inside walls, in case an enemy drops it into bars
				KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
				if (!KinkyDungeonHandleMoveObject(moveX, moveY, moveObject)) {// Move
					KinkyDungeonNoMoveFlag = false;
					KinkyDungeonConfirmStairs = false;
					KinkyDungeonSendEvent("beforeMove", {x:moveX, y:moveY});
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
							&& (KinkyDungeonStatsChoice.get("DirectionSlow") || KinkyDungeonStatsChoice.get("DirectionSlow2"))) {
							let D = Math.abs(KinkyDungeonPlayerEntity.facing_y - lastFacingY)**2
								+ Math.abs(KinkyDungeonPlayerEntity.facing_x - lastFacingX)**2;
							let dotProd = KinkyDungeonPlayerEntity.facing_y*lastFacingY + KinkyDungeonPlayerEntity.facing_x*lastFacingX;

							if (dotProd < 0 || ((D > 1 && (lastFacingY || lastFacingX)) && KinkyDungeonStatsChoice.get("DirectionSlow2"))) {
								KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 0);
								if (D > 2) KinkyDungeonSendTextMessage(10, TextGet("KDTurn2"), "#ffffff", 1);
								else KinkyDungeonSendTextMessage(9, TextGet("KDTurn1"), "#ffffff", 1);
							}
						}

						if (KinkyDungeonFlags.has("Quickness") && KinkyDungeonSlowLevel < 9) {
							KDGameData.MovePoints = KinkyDungeonSlowLevel + 1;
							quick = true;
						}

						if (KinkyDungeonStatBind) KDGameData.MovePoints = Math.min(0, KDGameData.MovePoints);
						//let MovePoints = KDGameData.MovePoints;

						let willSprint = KinkyDungeonToggleAutoSprint && !SuppressSprint;

						if (KDGameData.MovePoints >= 1) {// Math.max(1, KinkyDungeonSlowLevel) // You need more move points than your slow level, unless your slow level is 1
							let xx = KinkyDungeonPlayerEntity.x;
							let yy = KinkyDungeonPlayerEntity.y;

							newDelta = Math.max(newDelta, KinkyDungeonMoveTo(moveX, moveY, willSprint, allowPass));
							if (newDelta > 0) {
								if (Enemy && allowPass) {
									KDMoveEntity(Enemy, xx, yy, true,undefined, undefined, true);
									if (KinkyDungeonFlags.has("Passthrough"))
										KinkyDungeonSetFlag("Passthrough", 2);
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
									KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonGrateEnter"), "white", 3);
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
						else if (KinkyDungeonSlowLevel == 3) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonInching" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff5277", 2, true);
						else if (KinkyDungeonSlowLevel > 3 && KinkyDungeonSlowLevel < 10) KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrawling" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff5277", 2, true);
						else if (KinkyDungeonSlowLevel >= 10) KinkyDungeonSendActionMessage(1, TextGet("KinkyDungeonCantMove" + plugLevel).replace("plugs", dict).replace("(s)", dicts), "#ff5277", 2, true);

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
										KinkyDungeonChangeStamina(moveMult * (KinkyDungeonStatStaminaRegenPerSlowLevel * KinkyDungeonSlowLevel) * delta, false, moveMult, true);
									}
								}
								if (KDGameData.HeelPower > 0 && !KDGameData.Crouch ) {

									KDChangeBalance(-KDGetBalanceCost() * (0.75 + 0.5 * KDRandom()) * (1 + Math.max(-inertia, 0) * KDBalanceInertiaMult)*moveMult, true);
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
							if (KinkyDungeonStatStamina < KinkyDungeonStatStaminaMax) {
								KinkyDungeonWaitMessage(false, quick ? 0 : 1);
							}
							KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
						}
						/*if (moved) {
							if (MovePoints > 0) {
								newDelta = Math.max(1, newDelta - MovePoints);
							}
						}*/

						//}
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
						KinkyDungeonSleepTime = CommonTime() + 200;
					} else {
						KDGameData.MovePoints = Math.min(KDGameData.MovePoints, 1-newDelta);
					}
				}
				if (!(KDGameData.KneelTurns > 0))
					KDGameData.BalancePause = true;
			} else {
				//KDChangeBalance((KDGameData.KneelTurns > 0 ? 1.5 : 1.0) * KDGetBalanceRate()*delta, true);
				KDGameData.MovePoints = Math.min(KDGameData.MovePoints + 1, 0);
				KinkyDungeonPlayerEntity.facing_x = 0;
				KinkyDungeonPlayerEntity.facing_y = 0;
				KinkyDungeonWaitMessage(false, 1);
				KinkyDungeonAdvanceTime(1); // was moveDirection.delta, but became too confusing
			}
		} else if (KDMapData.GroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
			// We can pick up items inside walls, in case an enemy drops it into bars
			KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
			KinkyDungeonInterruptSleep();
			KinkyDungeonAdvanceTime(1);
		} else { // If we are blind we can bump into walls!
			if (KinkyDungeonVisionGet(moveX, moveY) <= 1) {
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Footstep.ogg");
				KinkyDungeonSendActionMessage(2, TextGet("KDWallBump"), "white", 2);
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

function KinkyDungeonWaitMessage(NoTime: boolean, delta: number): void {
	if (!KDIsAutoAction()) {
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

	if (!NoTime && delta > 0) {
		if (!KDGameData.Wait) KDGameData.Wait = 0;
		KDGameData.Wait += delta;
	}

	KinkyDungeonLastAction = "Wait";
	KinkyDungeonTrapMoved = false;
}


/**
 * Returns th number of turns that must elapse
 * Sets MovePoints to 0
 */
function KinkyDungeonMoveTo(moveX: number, moveY: number, willSprint: boolean, _allowPass: boolean) {
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
	let cencelled = !KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity, moveX, moveY) ? KDMovePlayer(moveX, moveY, true, willSprint) : true;


	if (stepOff) KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity, xx, yy, moveX, moveY);

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
				let data = {
					player: KinkyDungeonPlayerEntity,
					xTo: moveX*2 - xx,
					yTo: moveY*2 - yy,
					cancelSprint: false,
					sprintCost: 0,
				};

				data.sprintCost = KDSprintCost(data);

				KinkyDungeonSendEvent("sprint", data);


				if (!data.cancelSprint) {
					KinkyDungeonSetFlag("sprinted", 2);
					KinkyDungeonChangeStamina(data.sprintCost, false, 1);
					KinkyDungeonSendActionMessage(5, TextGet("KDSprinting" + (KinkyDungeonSlowLevel > 1 ? "Hop" : "")), "lightgreen", 2);
					KDChangeBalance(-KDGetBalanceCost() * (0.5 + 1 * KDRandom()) * KDBalanceSprintMult*10*KDFitnessMult(), true);
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

function KDCanSprint() {
	let data = {
		canSprint: KDBalanceSprint(),
		mustStand: true,
		mustNotBeSlow: true,
	};
	KinkyDungeonSendEvent("canSprint", data);
	return data.canSprint && (!data.mustNotBeSlow || KinkyDungeonSlowLevel < 4)
		&& KinkyDungeonHasStamina(KDSprintCostBase + KDSprintCostSlowLevel[Math.min(Math.round(KinkyDungeonSlowLevel), KDSprintCostSlowLevel.length)])
		&& (!data.mustStand || (KinkyDungeonCanStand() && !KDForcedToGround()));
}

let KinkyDungeonLastAction = "";
let KinkyDungeonLastTurnAction = "";
let KDDrawUpdate = 0;
let KDVisionUpdate = 0;

let KDLastTick = 0;

function KinkyDungeonAdvanceTime(delta: number, NoUpdate?: boolean, NoMsgTick?: boolean) {
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
		KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);

	for (let enemy of KDMapData.Entities) {
		if (enemy.leash)
			KinkyDungeonUpdateTether(false, enemy);
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
	KinkyDungeonCurrentTick += delta;
	if (KinkyDungeonCurrentTick > 100000) KinkyDungeonCurrentTick = 0;
	KinkyDungeonItemCheck(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, MiniGameKinkyDungeonLevel); //console.log("Item Check " + (performance.now() - now));
	if (pauseTime && delta > 0) {
		delta = 0;
		KinkyDungeonFlags.set("TimeSlowTick", 1);
	} else pauseTime = false;
	KDGameData.ShieldDamage = 0;
	KDUpdateCollectionFlags(delta);
	for (let value of Object.values(KDGameData.Collection))
		KDTickCollectionWanderCollectionEntry(value);
	KinkyDungeonUpdateBuffs(delta, pauseTime);
	KinkyDungeonUpdateEnemies(delta, true); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: true});
	KinkyDungeonUpdateBullets(delta, true); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta); //console.log("Bullet Check " + (performance.now() - now));
	KinkyDungeonUpdateEnemies(delta, false); //console.log("Enemy Check " + (performance.now() - now));
	KinkyDungeonSendEvent("afterEnemyTick", {delta: delta, allied: false});

	KinkyDungeonUpdateBullets(delta); //console.log("Bullets Check " + (performance.now() - now));
	KinkyDungeonUpdateBulletsCollisions(delta, true); //"catchup" phase for explosions!



	KDUpdateEffectTiles(delta);
	KinkyDungeonUpdateTileEffects(delta);
	for (let E = 0; E < KDMapData.Entities.length; E++) {
		let enemy = KDMapData.Entities[E];
		if (KinkyDungeonEnemyCheckHP(enemy, E)) { E -= 1; continue;}
	}

	KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);

	for (let enemy of KDMapData.Entities) {
		if (enemy.leash)
			KinkyDungeonUpdateTether(false, enemy);
	}
	KinkyDungeonUpdateJailKeys();

	KDCommanderUpdate(delta);

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
	let runActions = Object.assign([], KDGameData.DelayedActions);
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

	if (!NoUpdate)
		KinkyDungeonMultiplayerUpdate(KinkyDungeonNextDataSendTimeDelay);

	if (KinkyDungeonStatStamina < 5) {
		let msg = "KinkyDungeonStaminaWarningMed";
		if (KinkyDungeonStatStamina < 2.5) msg = "KinkyDungeonStaminaWarningLow";
		if (KinkyDungeonStatStamina < 1) msg = "KinkyDungeonStaminaWarningNone";
		if (!KinkyDungeonSendActionMessage(1, TextGet(msg), "#448844", 1, true))
			KinkyDungeonSendTextMessage(1, TextGet(msg), "#448844", 1, true);
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

		KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, TextGet(msg), "#ffffff", 2, 0);

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

	KinkyDungeonSendEvent("tickAfter", {delta: delta});

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
	}

	// Prune when time advances
	if (delta > 0) {
		KDPruneInventoryVariants(true, true, true);
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

function KinkyDungeonTargetTileMsg() {
	if (KDObjectMessages[KinkyDungeonTargetTile.Type]) {
		KDObjectMessages[KinkyDungeonTargetTile.Type]();
	} else if (KinkyDungeonTargetTile.Lock) {
		if (KinkyDungeonTargetTile.Faction)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
				.replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), "#ff5277", 2, true);
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Locked.ogg");
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObjectLock")
			.replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name))
			.replace("LKTP", TextGet(`Kinky${KinkyDungeonTargetTile.Lock}Lock`))
		, "#ffffff", 1, true);
	} else {
		let suff = "";
		if (KinkyDungeonTargetTile.Faction)
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonObjectFaction")
				.replace("FACTION", TextGet("KinkyDungeonFaction" + KinkyDungeonTargetTile.Faction)), "#ff5277", 2, true);
		if (KinkyDungeonTargetTile.Name == "Commerce") suff = "Commerce";
		KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonObject" + KinkyDungeonTargetTile.Type + suff).replace("TYPE", TextGet("KinkyDungeonShrine" + KinkyDungeonTargetTile.Name)), "#ffffff", 1, true);
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
	item?:       Item,
	Properties?: Record<string, LayerProperties>
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
		};
		NA.Model.Filters = NA.Filters || NA.Model.Filters;
		NA.Model.Properties = NA.Properties || NA.Model.Properties;
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
		KinkyDungeonSendTextMessage(8, TextGet("KDCantCloseDoor"), "#ff8933", 2);
	else {
		KinkyDungeonTargetTileLocation = x + ',' + y;
		KinkyDungeonTargetTile = null;
		KinkyDungeonMapSet(x, y, "D");
		KinkyDungeonTargetTileLocation = "";
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/DoorClose.ogg");
		KinkyDungeonSendActionMessage(3, TextGet("KinkyDungeonCloseDoorDone"), "white", 2);
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
			if (e.Enemy.events) {
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
	KinkyDungeonSleepTime = CommonTime() + 200;
}

/**
 * Kneels the player for [turns] turns
 * @param turns
 */
function KDKneelTurns(turns: number) {
	KinkyDungeonSetFlag("playerStun", turns + 1);
	KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns || 0, turns);
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
function KDGetAltType(Floor: number, MapMod?: string, RoomType?: string): any {
	let mapMod = null;
	if (MapMod ? MapMod : KDGameData.MapMod) {
		mapMod = KDMapMods[MapMod ? MapMod : KDGameData.MapMod];
	}
	let altRoom = RoomType ? RoomType : KDGameData.RoomType;
	let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);
	return altType;
}

/**
 *
 * @param player
 * @param Enemy
 */
function KDCanPassEnemy(_player: entity, Enemy: entity): boolean {
	return !KDIsImmobile(Enemy)
	&& ((!KinkyDungeonAggressive(Enemy) && !Enemy.playWithPlayer) || (KDHelpless(Enemy)))
	&& ((KinkyDungeonToggleAutoPass
		&& (
			!KDGameData.FocusControlToggle || (
				(KDGameData.FocusControlToggle.AutoPassHelplessEnemies || !(KDHostile(Enemy) && KDHelpless(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassHelplessAllies || !(!KDHostile(Enemy) && KDHelpless(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassAllies || !(KDAllied(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassNeutral || !(!KDAllied(Enemy) && !KDAllied(Enemy))) &&
				(KDGameData.FocusControlToggle.AutoPassShop || !(KDEnemyHasFlag(Enemy, "Shop"))) &&
				(KDGameData.FocusControlToggle.AutoPassSpecial || !(Enemy.specialdialogue || Enemy.Enemy.specialdialogue)) &&
				(KDGameData.FocusControlToggle.AutoPassSummons || !(Enemy.Enemy.allied))
			)
		))
		|| KDEnemyHasFlag(Enemy, "passthrough")
		|| (KinkyDungeonFlags.has("Passthrough"))
		|| Enemy.Enemy.noblockplayer);
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
 */
function KDSprintCost(sprintdata?: any): number {
	let data = {
		sprintdata: sprintdata,
		sprintCostMult: KinkyDungeonMultiplicativeStat(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "SprintEfficiency")),
		cost: (-KDSprintCostBase - KDSprintCostSlowLevel[Math.round(KinkyDungeonSlowLevel)]),
		boost: 0,
	};

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


function KDTurnToFace(dx: number, dy: number) {
	KinkyDungeonPlayerEntity.facing_x = Math.min(1, Math.abs(dx)) * Math.sign(dx);
	KinkyDungeonPlayerEntity.facing_y = Math.min(1, Math.abs(dy)) * Math.sign(dy);

	if (KinkyDungeonPlayerEntity.facing_x || KinkyDungeonPlayerEntity.facing_y) {
		KinkyDungeonPlayerEntity.facing_x_last = KinkyDungeonPlayerEntity.facing_x;
		KinkyDungeonPlayerEntity.facing_y_last = KinkyDungeonPlayerEntity.facing_y;
	}
}


function KDAddRepopQueue(repopdata: RepopQueueData, data: KDMapDataType) {
	if (!data.RepopulateQueue)
		data.RepopulateQueue = [];

	data.RepopulateQueue.push(repopdata);
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
