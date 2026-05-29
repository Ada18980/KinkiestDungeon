
interface KDCreateMapReturnData {
	newMapDataObject: KDMapDataType,
	oldMapDataObject: KDMapDataType,
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
	useExisting:    boolean = true,
	origMapType:     string = "",
	direction:       number = 0,
	forceEscape?:    string
): KDCreateMapReturnData
{
	// every time a map is created or moved the preference flags are updated
	KDUpdatePreferenceFlags();
	KDResetDialogue();

	KDTileModes = {};
	KDUpdateOptionGame(false);
	KDBreakTether(KDPlayer());

	KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["removeNewMap"]);
	KDGameData.PreferredJailPointTick = 0;

	// Create enemies first so we can spawn them in the set pieces if needed
	let allies = KinkyDungeonGetAllies();
	let mapMod = KDMapData.MapMod ? KDMapMods[KDMapData.MapMod] : null;
	let altRoom = KDMapData.RoomType;
	let altType: AltType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Floor);


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


	KDSelectLabel(KDPlayer(), null);

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
		let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
		KDCreateWorldLocation(constantX ? 0 : worldLocation.x, worldLocation.y,
			KDGameData.JourneyX, KDGameData.JourneyY, altType?.makeMain ? altRoom : (journeySlot?.RoomType || ""));
		if (altType?.makeMain || !altType) {
			KDPruneWorld();
		}
	}
	let location = KDWorldMap[(constantX ? 0 : worldLocation.x) + "," + worldLocation.y];

	let js = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
	if (js.HiddenRooms) delete js.HiddenRooms[RoomType];

	if (useExisting && location.data[KDGameData.RoomType]) {
		let oldMapData = KDLoadMapFromWorld(worldLocation.x, worldLocation.y, KDGameData.RoomType, direction, constantX);

		


		if (location.jx == undefined) location.jx = KDGameData.JourneyX;
		if (location.jy == undefined) location.jy = KDGameData.JourneyY;
		// Repopulate
		altType = KDGetAltType(MiniGameKinkyDungeonLevel);
		if (!altType?.loadscript || altType.loadscript(false)) {
			if (!altType?.noPersistentPrisoners && !mapMod?.noPersistentPrisoners)
				KDRepopulatePersistentNPCs();
			if (!altType?.noPersistentSpawn && !mapMod?.noPersistentSpawn)
				// Spawn wandering persistent NPCs depending on spawn AI
				KDSpawnPersistentNPCs({
					mapX: worldLocation.x,
					mapY: worldLocation.y,
					room: KDGameData.RoomType,
				}, true);
		}
		UpdateRegiments({
			mapX: worldLocation.x,
			mapY: worldLocation.y,
			room: KDGameData.RoomType,
		});

		KDGameData.ShortcutIndex = KDGameData.RoomType;
		return {
			newMapDataObject: KDMapData,
			oldMapDataObject: oldMapData,
		};
	}

	// Filter out the allies
	KDMapData.Entities = KDMapData.Entities.filter((enemy) => {
		return !allies.includes(enemy);
	});
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;
	// Else make a new one
	let oldMapData = KDSaveRoom(KDCurrentWorldSlot, KDMapData.ConstantX);



	let maxIter = 100;
	for (let iterations = 0; iterations <= maxIter; iterations++) {
		if (iterations > 0) {
			// Clear so party prisoners are reused
			for (let en of [...KDMapData.Entities]) {
				KDRemoveEntity(en, false, true, true);
			}
		}
		/** @type {KDMapData} */
		KDMapData = KDDefaultMapData(worldLocation?.x || 0, worldLocation?.y || MiniGameKinkyDungeonLevel, KDGameData.RoomType, KDGameData.MapMod);
		KDSetWorldSlot(worldLocation.x, worldLocation.y);

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
		KDMapData.ShortcutPositions = {};
		KDMapData.PatrolPoints = [];
		KDMapData.JailPoints = [];
		KDMapData.GroundItems = []; // Clear items on the ground


		// These are generated before the seed as they depend on the player's restraints and rep
		KDMapData.PoolUses = Math.min(KDMapData.PoolUses, KinkyDungeonStatsChoice.get("Blessed") ? 0 : 1);
		KDMapData.ShopItems = [];
		KDMapData.ShopItems = KinkyDungeonGenerateShop(MiniGameKinkyDungeonLevel);
		let shrinefilter = KinkyDungeonGetMapShrines(MapParams.shrines);
		let traptypes = MapParams.traps.concat(KinkyDungeonGetGoddessTrapTypes());
		traptypes = traptypes.filter((t) => {
			return !t.BlockedByPerks || !t.BlockedByPerks.some((perk) => {
				return !!KinkyDungeonStatsChoice.get(perk)
			});
		});
		mapMod = null;
		if (KDGameData.MapMod) {
			mapMod = KDMapMods[KDGameData.MapMod];
		}

		let slot = KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()));
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
		if (MapParams.enemyTags_single) {
			if (!KDMapData.enemyTags) 
				KDMapData.enemyTags = [];
			let tt = CommonRandomItemFromList(null, MapParams.enemyTags_single);
			if (tt) {
				tags.push(tt);
				KDMapData.enemyTags.push(tt);
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

		let randomFactions = KDChooseFactions(factionList, Floor, [], bonus, true);
		let factionEnemy = randomFactions[2] || "Bandit";
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
		KinkyDungeonPlayerEntity = {MemberNumber:DefaultPlayer.MemberNumber, id: -1, x: KDMapData.StartPosition.x, y:KDMapData.StartPosition.y, player:true};


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


		if (!altType || !altType.noWear) {
			KinkyDungeonGenNavMap(KDMapData.StartPosition);
			KinkyDungeonReplaceDoodads(crackchance, barchance, wallRubblechance, wallhookchance, ceilinghookchance, width, height, altType); // Replace random internal walls with doodads
		}

		if (!altType || altType.allowJailEntrances || altType.placeJailEntrances || slot?.main == KDGameData.RoomType)
			KinkyDungeonPlaceJailEntrances(width, height, altType);
			//console.log(KDRandom());
		if (KDDebug) {
			console.log(`${performance.now() - startTime} ms for doodad creation`);
			startTime = performance.now();
		}
		KinkyDungeonPlaceStairs(KDMapData.StartPosition.y, width, height,
			altType && altType.nostairs, altType && altType.nostartstairs,
			KDPersonalAlt[KDGameData.RoomType] ? KDPersonalAlt[KDGameData.RoomType].UpStairsFrom : origMapType); // Place the start and end locations

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
			KDPruneEntrances(width, height);
			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for navmap creation`);
				startTime = performance.now();
			}

			KinkyDungeonUpdateStats(0);




			KinkyDungeonReplaceVert(width, height);
		}




		if (MapParams.beforeWorldGenCode) MapParams.beforeWorldGenCode(KDGetCurrentLocation());
		if (altType?.beforeWorldGenScript) altType?.beforeWorldGenScript(KDGetCurrentLocation());
		if (mapMod?.beforeWorldGenScript) mapMod?.beforeWorldGenScript(KDGetCurrentLocation());
		if (KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()))?.main == KDGameData.RoomType) {
			// Run the sideroom WorldGenScripts
			let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
			let sideRooms = journeySlot?.SideRooms || [];
			for (let sr of sideRooms) {
				if (KDSideRooms[sr]?.beforeWorldGenScript) KDSideRooms[sr].beforeWorldGenScript(KDGetCurrentLocation());
			}
			if (journeySlot.HiddenRooms) delete journeySlot.HiddenRooms[RoomType];
		}


		if (KDTileToTest
			|| ((KinkyDungeonNearestJailPoint(1, 1)
					|| (altType && altType.nojail))
				&& (!altType
					|| KDStageBossGenerated
					|| !bossRules)
				&& ((!altType?.genCriteria
						&& KDCheckMainPath())
					|| altType?.genCriteria(iterations)))) iterations = maxIter;
		else console.log("This map failed to generate! Please screenshot and send your save code to Ada on deviantart or discord!");

		if (iterations == maxIter) {
			// Place enemies after player
			if (!altType || altType.enemies) {
				let globaltags = null;
				if (MapParams.globalEnemyTags) globaltags = [...MapParams.globalEnemyTags];
				if (mapMod?.tags) {
					if (globaltags == null) {
						globaltags = [];
					}
					for (let tag of mapMod.tags) {
						globaltags.push(tag);
					}
				}

				KinkyDungeonPlaceEnemies(spawnPoints, false, globaltags, bonus, Floor, width, height, altType,
					randomFactions, factionEnemy);
			}



			if (KDDebug) {
				console.log(`${performance.now() - startTime} ms for enemy creation`);
				startTime = performance.now();
			}

			if (MapParams.worldGenCode) MapParams.worldGenCode(KDGetCurrentLocation());
			if (altType?.worldGenScript) altType?.worldGenScript(KDGetCurrentLocation());
			if (mapMod?.worldGenScript) mapMod?.worldGenScript(KDGetCurrentLocation());
			if (KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()))?.main == KDGameData.RoomType) {
				// Run the sideroom WorldGenScripts
				let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
				let sideRooms = journeySlot?.SideRooms || [];
				for (let sr of sideRooms) {
					if (KDSideRooms[sr]?.worldGenScript) KDSideRooms[sr].worldGenScript(KDGetCurrentLocation());
				}
			}


			KDBuildLairs();
			KDPlacePlayerBasedOnDirection(direction, KDGameData.ShortcutIndex);



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


			KDUnPackEnemies(KDMapData);
			if (!KinkyDungeonMapIndex.grv)
				KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);

			KinkyDungeonSendEvent("postMapgen", {});

			if (altType && altType.tickFlags) {
				KinkyDungeonSendEvent("tickFlags", {delta: 1});
				KinkyDungeonUpdateBuffs(0, true);
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
						KDMapData.EscapeMethod = KDGetRandomEscapeMethod(KDGameData.RoomType, KDGameData.MapMod,
							MiniGameKinkyDungeonLevel, KDMapData.MapFaction
						);
					}
				}

				KDGameData.SelectedEscapeMethod = "Key";

				let mm = KDGetEscapeMethod(Floor);
				if (mm && mm != "None")
					KinkyDungeonSendActionMessage(10, TextGet("KDEscapeMethodDesc_" + mm),
					KDBaseWhite, 10);
				KDEscapeWorldgenStart(mm);
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
				e = KDAddEntity(e, true);
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

		if (!altType?.noPersistentSpawn && !mapMod?.noPersistentSpawn)
			// Spawn wandering persistent NPCs depending on spawn AI
			KDSpawnPersistentNPCs({
				mapX: worldLocation.x,
				mapY: worldLocation.y,
				room: KDGameData.RoomType,
			}, true);
	}

	KinkyDungeonGenNavMap();

	UpdateRegiments({
		mapX: worldLocation.x,
		mapY: worldLocation.y,
		room: KDGameData.RoomType,
	});

	KDGameData.ShortcutIndex = KDGameData.RoomType;
	return {
		newMapDataObject: KDMapData,
		oldMapDataObject: oldMapData,
	}
}

let KDStageBossGenerated = false;

/**
 * Creates a list of all tiles accessible and not hidden by doors or dangerous
 */
function KinkyDungeonGenNavMap(fromPoint?: { x: number, y: number }) {
	if (!fromPoint) fromPoint = KDMapData.EndPosition || KDMapData.StartPosition;
	KDMapData.RandomPathablePoints = {};
	RandomPathList = [];
	let accessible = KinkyDungeonGetAccessible(fromPoint.x, fromPoint.y,
		undefined, undefined, KinkyDungeonMovableTilesSmartEnemy
	);
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
function KinkyDungeonGetAccessible(startX: number, startY: number, testX?: number, testY?: number, interactable?: string): GridEntry {
	let tempGrid = {};
	let checkGrid: GridEntry = {};
	if (!interactable) interactable = KDInteractableTiles;
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
						&& interactable.includes(KinkyDungeonMapGet(X+XX, Y+YY)) && !locked) {
						if (KinkyDungeonMovableTilesSmartEnemy.includes(
							KinkyDungeonMapGet(X+XX, Y+YY)))
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
	let Tiles = KDInteractableTiles.replace("D", "").replace("d", "");
	let MTiles = KinkyDungeonMovableTilesSmartEnemy.replace("D", "").replace("d", "");
					
	while (Object.entries(checkGrid).length > 0) {
		for (let g of Object.entries(checkGrid)) {
			for (let XX = -1; XX <= 1; XX++)
				for (let YY = -1; YY <= 1; YY++) {
					let test = ((g[1].x+XX) + "," + (g[1].y+YY));
					if (!checkGrid[test] && !tempGrid[test] && KDInteractableTiles.includes(KinkyDungeonMapGet(g[1].x+XX, g[1].y+YY))) {
						if (MTiles.includes(KinkyDungeonMapGet(g[1].x+XX, g[1].y+YY)))
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
	let primaryFaction = KDGetByWeight(KDGetFactionProps(factions, Floor, KDCurrIndex(), Tags, BonusTags));
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

	let factionAllied = allyCandidates.length > 0 ? KDGetByWeight(KDGetFactionProps(allyCandidates, Floor, KDCurrIndex(), Tags, BonusTags)) : "";
	let factionEnemy = enemyCandidates.length > 0 ? KDGetByWeight(KDGetFactionProps(enemyCandidates, Floor, KDCurrIndex(), Tags, BonusTags)) : "";

	if (factionAllied && KDRandom() < 0.33) randomFactions.push(factionAllied);
	if (factionEnemy && KDRandom() < 0.6) randomFactions.push(factionEnemy);

	if (Set) {
		KDMapData.MapFaction = primaryFaction;
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

function KinkyDungeonPlaceEnemies(spawnPoints: any[], InJail: boolean, mapmodtags: string[], BonusTags: any,
	Floor: number, width: number, height: number, altRoom?: any, randomFactions?: any[], factionEnemy?: any) {
	KinkyDungeonHuntDownPlayer = false;
	KinkyDungeonFirstSpawn = true;
	KinkyDungeonSearchTimer = 0;

	let tagList: Record<string, string[]> = {};
	

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

	let boxdata = {
		filterTagsBase: filterTagsBase,
		filterTagsSpawn: filterTagsSpawn,
		filterTagsCluster: filterTagsCluster,
		spawnBoxes: undefined,
		MapMod: KDGameData.MapMod,
		randomFactions: [...randomFactions],
		factionEnemy: factionEnemy,
		priority: 0,
	}

	KinkyDungeonSendEvent("beforeGetSpawnBoxes", boxdata)
	if (!boxdata.spawnBoxes) {
		boxdata.spawnBoxes = [
			{requiredTags: ["boss"], tags: [], currentCount: 0, maxCount: 0.025},
			{requiredTags: ["miniboss"], tags: [], currentCount: 0, maxCount: 0.075},
			{requiredTags: ["elite"], tags: [], currentCount: 0, maxCount: 0.15},
			{requiredTags: ["minor"], tags: [], currentCount: 0, maxCount: 0.1},
		];
	}
	
	KinkyDungeonSendEvent("getSpawnBoxes", boxdata)
	if (boxdata.MapMod) {
		let mapMod = KDMapMods[boxdata.MapMod];
		if (mapMod && mapMod.spawnBoxes) {
			for (let m of mapMod.spawnBoxes) {
				boxdata.spawnBoxes.unshift(Object.assign({}, m));
			}
		}
	} else if (boxdata.randomFactions) {
		for (let rf of boxdata.randomFactions) {
			if (rf != undefined) {
				boxdata.spawnBoxes.push({ignoreAllyCount: true, requiredTags: [KinkyDungeonFactionTag[rf]], filterTags: ["boss", "miniboss"], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.15, bias: rf == factionEnemy ? 2 : 1});
				boxdata.spawnBoxes.push({ignoreAllyCount: true, requiredTags: ["miniboss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.1, bias: rf == factionEnemy ? 2 : 1});
				boxdata.spawnBoxes.push({ignoreAllyCount: true, requiredTags: ["boss", KinkyDungeonFactionTag[rf]], tags: [KinkyDungeonFactionTag[rf]], currentCount: 0, maxCount: 0.01, bias: rf == factionEnemy ? 2 : 1});
			}
		}
	}

	KinkyDungeonSendEvent("afterGetSpawnBoxes", boxdata)

	filterTagsBase = boxdata.filterTagsBase;
	filterTagsSpawn = boxdata.filterTagsSpawn;
	filterTagsCluster = boxdata.filterTagsCluster;


	let currentCluster = null;

	let spawns: SpawnEntry[] = [];
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

	let GlobalTags = [];
	
	KinkyDungeonAddTags(GlobalTags, Floor);
	if (mapmodtags) {
		for (let tag of mapmodtags) {
			GlobalTags.push(tag);
		}
	}
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
		let forceIndex: string = undefined;
		let keys = false;
		let noPlay = false;

		let LabelType = "";

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
				if (spawns[0].noPlay) noPlay = true;
				if (spawns[0].keys) keys = true;
				AI = spawns[0].AI;
				levelBoost = spawns[0].levelBoost || 0;
				forceIndex = spawns[0].forceIndex;
				faction = spawns[0].faction;
				spawns.splice(0, 1);
				if (AI && KDAIType[AI]?.guard
					&& KDMapData.RandomPathablePoints["" + X + "," + Y]
				) {
					LabelType = "Deploy";
				} else if (KDMapData.RandomPathablePoints["" + X + "," + Y]) {
					LabelType = "Patrol";
				}
			}
		}

		let playerDist = 9;
		let PlayerEntity = KDMapData.StartPosition;

		let spawnBox_filter = boxdata.spawnBoxes.filter((bb) => {
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


			for (let t of GlobalTags) {
				tags.push(t);
			}
			let biome = KDMapData.Checkpoint;
			if (KDMapData.TilesAlternate != null && KDMapData.TilesAlternate[X + ',' + Y]) {
				biome = KDMapData.TilesAlternate[X + ',' + Y].biome || biome;
			}
			if (!tagList[biome]) {
				tagList[biome] = [];
				let tags = Object.assign([], KinkyDungeonMapParams[biome].enemyTags);
				if (tags?.length > 0) {
					// Add in any mapmod tags
					for (let t of tags) {
						tagList[biome].push(t);
					}
				}
				if (KDMapData.enemyTags?.length > 0) {
					// Add in any mapmod tags
					for (let t of KDMapData.enemyTags) {
						tagList[biome].push(t);
					}
				}
			}
			for (let t of tagList[biome]) {
				tags.push(t);
			}
			if (randomFactions.length > 0 && !box && !currentCluster && !spawnPoint)
				tags.push(randomFactions[Math.floor(randomFactions.length * KDRandom())]);
			if (required.length == 0) required = undefined;
			let Enemy = KinkyDungeonGetEnemy(
				tags,
				KDGetEffLevel() + levelBoost,
				forceIndex || KDCurrIndex(),
				KinkyDungeonMapGet(X, Y),
				required,
				{
					requireHostile: ((!altRoom || altRoom.reduceNeutrals) && ncount > neutralCount && (!box || !box.ignoreAllyCount)) ? "Player" : "",
					requireAllied: altRoom?.factionSpawnsRequired ? (KDGetMainFaction() || KDFactionProperties[KDGetMainFaction()]?.jailAlliedFaction) : "",
					requireNonHostile: altRoom?.neutralSpawnsRequired ? KDGetMainFaction() : "",
				},
				BonusTags,
				currentCluster ? filterTagsCluster : filterTags, );
			if (!Enemy) {
				Enemy = KinkyDungeonGetEnemy(
					tags,
					KDGetEffLevel() + levelBoost,
					forceIndex || KDCurrIndex(),
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
				let e: entity = {Enemy: Enemy, id: KinkyDungeonGetEnemyID(), x:X, y:Y, hp: (Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, shield: Enemy.shield,
					movePoints: 0, attackPoints: 0, AI: KDGetAITypeOverride(Enemy, AI) || AI || Enemy.AI, faction: faction};
				if (spawnPoint) {
					e.spawnX = X;
					e.spawnY = Y;

					e.homeCoord = KDGetCurrentLocation();
					if (keys) {
						e['keys'] = true;
					}
				}


				if (LabelType) {
					KDAddLabel({
						assigned: e.id,
						name: LabelType,
						type: LabelType,
						x: X,
						y: Y,
						guard: (KDGetAI(e) && KDAIType[KDGetAI(e)]?.guard) ? true : undefined,
					});
				}

				// we add our loadout after
				e = KDAddNewEntity(e, undefined, undefined, true);
				if (noPlay) {
					KinkyDungeonSetEnemyFlag(e, "noPlay", -1);
				}
				let clusterChance = 0.5; //1.1 + 0.9 * MiniGameKinkyDungeonLevel/KinkyDungeonMaxLevel;
				let clusterLeader = !spawnPoint && !currentCluster && Enemy.clusterWith && KDRandom() < clusterChance;
				// Give it a custom name, higher chance if cluster
				let custom = KDProcessCustomPatron(Enemy, e, (clusterLeader) ? 1.0 : (!currentCluster ? 0.1 : 0.0), true);
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
				KDRunCreationScript(e, KDGetCurrentLocation());

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


function KinkyDungeonGetClosestSpecialAreaDist(x: number, y: number): number {
	let minDist = 10000;
	if (!KDMapData.SpecialAreas) KDMapData.SpecialAreas = [];
	for (let area of KDMapData.SpecialAreas) {
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

	if (!KDMapData.SpecialAreas) KDMapData.SpecialAreas = [];
	if (!nostartstairs) {
		KinkyDungeonMapSet(KDMapData.StartPosition.x, KDMapData.StartPosition.y, 'S');
		KinkyDungeonTilesSet(KDMapData.StartPosition.x + ',' + KDMapData.StartPosition.y, {
			RoomType: origMapType == "JourneyFloor" ? "ShopStart" : origMapType,
		});
		KDMapData.SpecialAreas.push({x: KDMapData.StartPosition.x, y: KDMapData.StartPosition.y, radius: 2});
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


		if (KDMapData.ShortcutPositions && Object.values(KDMapData.ShortcutPositions).length > 0) {
			let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
			if (journeySlot?.SideRooms) {
				for (let i = 0; i < journeySlot?.SideRooms.length || i < Object.values(KDMapData.ShortcutPositions).length; i++) {
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
								if (!KDMapData.SpecialAreas) KDMapData.SpecialAreas = [];
								KDMapData.SpecialAreas.push({x: pos.x, y: pos.y, radius: 2});
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
		KDMapData.SpecialAreas.push({x: KDMapData.EndPosition.x, y: KDMapData.EndPosition.y, radius: 2});
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
						KDCurrIndex(),
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
	let hearts = 0;
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
		let spells = KDGetRandomSpells(orbcount);
		let spellind = 0;

		if (count <= shrinecount) {

			let shrine = list[NN];
			if (!shrine) break;
			if (count == shrinecount && KDRandom() > shrinechance)
				KinkyDungeonMapSet(shrine.x, shrine.y, 'a');
			else {
				let placedChampion = !allowQuests || !KDGameData.Champion;
				let playerTypes = KinkyDungeonRestraintTypes(shrinefilter);
				let stype: {type: string, drunk?: boolean} =
					shrineTypes.length < orbcount
						? {type: "Orb"}
					: (
						(KDGameData.Champion && !placedChampion && shrineTypes.length == orbcount)
							? {type: KDGameData.Champion}
							: ((shrineTypes.length ==
									((KDGameData.Champion && allowQuests)
										? orbcount + 1
										: orbcount)
								&& playerTypes.length > 0)
								? {type: playerTypes[Math.floor(KDRandom() * playerTypes.length)]}
								: KinkyDungeonGenerateShrine(Floor, filterTypes, manaChance)));
				let type = stype.type;
				let tile = 'A';
				if (type != "Orb" && shrineTypes.includes(type) && (KDRandom() < 0.5 || type == "Commerce")) type = "";
				if (type == "Orb") {
					if (orbs < orbcount) {
						tile = 'O';



						if (KinkyDungeonStatsChoice.get("randomMode") && spells.length > 0) {
							let spell = spells[spellind++];
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
					let questAdded = "";
					if (allowQuests && quests < KDMAXGODDESSQUESTS) {
						let quest = KDGetShrineQuest(KDMapData, KinkyDungeonTilesGet("" + shrine.x + "," +shrine.y));
						if (quest) {
							KDSetShrineQuest(KDMapData, KinkyDungeonTilesGet("" + shrine.x + "," +shrine.y),
								quest);
							quests += 1;
							questAdded = quest;
						}
					}
					KDMapData.ShrineList.push({
						type: type,
						quest: questAdded,
						x: shrine.x,
						y: shrine.y,
					});
					shrineTypes.push(type);
					placedChampion = true;
				} else if (placedChampion && !shrineTypes.includes("Ghost") || KDRandom() < 0.5) {
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
				if (goddess == 'Heart') hearts += 1;
				KinkyDungeonTilesSet("" + shrine.x + "," +shrine.y, {Type: "Tablet", Name: goddess, Light: 3, lightColor: 0x8888ff});
				KinkyDungeonMapSet(shrine.x, shrine.y, 'M');

				tablets[goddess] += 1;
				break;
			}
		}

		list.splice(NN, 1);
	}
	return quests + Math.min(hearts, 2);
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

function KDGetMapParams(): floorParams {
	return KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
}

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
					KDAddLabel({
						assigned: -1,
						name: "Patrol",
						type: "Patrol",
						x: X,
						y: Y,
					});
					break;
				}
			}
	}
}


function KDCheckMainPath() {

	// main path
	if (!(KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y, KDMapData.EndPosition.x, KDMapData.EndPosition.y,
		false, false, false, KinkyDungeonMovableTilesSmartEnemy,
		false, false, false, undefined, false,
		undefined, false, true)?.length > 0)) return false;

	if (KDMapData.ShortcutPositions && Object.values(KDMapData.ShortcutPositions).length > 0) {
		// only 1st 2
		for (let i = 0; i < 2; i++) {
			if (KDMapData.ShortcutPositions[i]) {
				// shortcut path
				if (!(KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y,
					KDMapData.ShortcutPositions[i].x, KDMapData.ShortcutPositions[i].y,
					false, false, false, KinkyDungeonMovableTilesSmartEnemy,
					false, false, false, undefined, false,
					undefined, false, true)?.length > 0)) return false;
			}
		}
	}

	if (KDMapData.ShrineList) {
		for (let shrine of KDMapData.ShrineList) {
			if (shrine.quest) {
				// all quests must be accessible
				if (!(KinkyDungeonFindPath(KDMapData.StartPosition.x, KDMapData.StartPosition.y,
					shrine.x, shrine.y,
					false, false, false, KinkyDungeonMovableTilesSmartEnemy,
					false, false, false, undefined, false,
					undefined, false, true)?.length > 0)) return false;
			}
		}
	}

	return true;
}

function KDPruneEntrances
	// Prunes existing entrances on the map, making sure they are accessible
	(width: number, height: number) {
	let successfulEntrances: LairEntrance[] = [];
	for (let entrance of KDMapData.PotentialEntrances) {
		let X = entrance.x;
		let Y = entrance.y;
		let checkTiles: KDPoint[] = [
			{x: X, y: Y},
		];
		if (entrance.Excavate?.length > 0) {
			checkTiles.push(...entrance.Excavate);
		}
		let pass = false;
		for (let tile of checkTiles) {
			let u = (KDPointWanderable(tile.x, tile.y - 1)
				&& !KDEffectTileTags(tile.x, tile.y - 1).nomapgen);
			let d = (KDPointWanderable(tile.x, tile.y + 1)
				&& !KDEffectTileTags(tile.x, tile.y + 1).nomapgen);
			let r = (KDPointWanderable(tile.x + 1, tile.y)
				&& !KDEffectTileTags(tile.x + 1, tile.y).nomapgen);
			let l = (KDPointWanderable(tile.x - 1, tile.y)
				&& !KDEffectTileTags(tile.x - 1, tile.y).nomapgen);
			if (u || d || r || l) {
				pass = true;
				break;
			}
		}
		if (pass) {
			successfulEntrances.push(entrance);
		}
	}
	KDMapData.PotentialEntrances = successfulEntrances;

}