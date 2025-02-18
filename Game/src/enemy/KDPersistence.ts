
interface KDPersistentNPC {
	Name: string,
	id: number,
	entity: entity,
	/** the 'true form' of an NPC, stored and used only by scripts */
	trueEntity?: entity,
	mapX: number, mapY: number,
	room: string,
	/** NPC is captured by enemies and therefore cannot be affected */
	captured: boolean,
	/** Preferential capture here */
	captureFaction?: string,
	/** Preferential capture here */
	captureCaptor?: number,
	/** NPC is in collection currently. Set to false when spawned out of collection. Otherwise set to true only when adding to the collection.*/
	collect: boolean,
	opinion: number,
	/** If true, the NPC is here to stay */
	jailed?: boolean,
	/** NPC is special and should remain persistent instead of being deleted */
	special?: boolean,
	/** NPC will NOT get deleted with NG+ */
	permanent?: boolean,
	/** NPC is very skilled and will never be captured */
	alwaysEscape?: boolean,
	/** Wandering AI type, for moving between floors */
	wanderAI?: string,
	/** Spawn AI type, for setting goals and AI*/
	spawnAI?: string,
	/** Special scripting */
	specialScript?: string,

	/** Visual */
	outfit?: string,
	hairstyle?: string,
	bodystyle?: string,
	facestyle?: string,
	cosplaystyle?: string,
	Palette?: string,

	storedParty?: entity[],
	persistentParty?: number[],
	partyLeader?: number,

	spawned?: boolean,

	/** 0 = start, 1 = end, 2 = shortcut */
	fromType?: number,
	/** Shortcut index */
	fromIndex?: string,

	nextWanderTick?: number,
	nextSpawnTick?: number,
	nextScriptTick?: number,

	data?: PersistentNPCData,
}

interface PersistentNPCData {
	wanderTarget?: WorldCoord,
	MaidKnightHeavyID?: number,
	MaidKnightLightID?: number,
}

/** Returns whether or not the NPC was found and data was successfully pushed */
function KDPersistentAddData(id: number, key: string, data: any): boolean {
	let npc = KDPersistentNPCs[id];
	if (npc) {
		if (!npc.data) {
			npc.data = {};
		}
		npc.data[key] = data;
		return true;
	}
	return false;
}

function KDPersistentGetData(id: number, key: string): any {
	let npc = KDPersistentNPCs[id];
	if (npc) {
		if (npc.data) {
			return npc.data[key];
		}
	}
	return undefined;
}


interface WorldCoord {
	mapX: number,
	mapY: number,
	room: string,
}

function KDGetEnemyStoredParty(partyid: number): entity[] {
	let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
	if (npc) {
		return npc.storedParty || [];
	}
	return [];
}
function KDGetEnemyPersistentParty(partyid: number): entity[] {
	let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
	if (npc) {
		return npc.persistentParty?.filter((id) => {
			return KDIsNPCPersistent(id);
		}).map((id) => {
			return KDGetGlobalEntity(id);
		}) || [];
	}
	return [];
}
function KDGetEnemyStoredPartyIDs(partyid: number): number[] {
	let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
	if (npc) {
		return npc.storedParty?.map((en) => {return en.id;}) || [];
	}
	return [];
}
function KDGetEnemyPersistentPartyIDs(partyid: number): number[] {
	let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
	if (npc) {
		return npc.persistentParty?.filter((id) => {
			return KDIsNPCPersistent(id);
		}) || [];
	}
	return [];
}
function KDGetEnemyParty(partyid: number): entity[] {
	return [...KDGetEnemyPersistentParty(partyid), ...KDGetEnemyStoredParty(partyid)];
}
function KDGetEnemyPartyIDs(partyid: number): number[] {
	return [...KDGetEnemyPersistentPartyIDs(partyid), ...KDGetEnemyStoredPartyIDs(partyid)];
}
function KDNPCInParty(pmid: number, partyid: number): boolean {
	let npc = KDGetPersistentNPC(partyid, undefined, false);
	if (KDIsNPCPersistent(pmid)) {
		if (npc.persistentParty) {
			return npc.persistentParty.includes(pmid);
		}
	} else {
		if (npc.storedParty) {
			return npc.storedParty.some((pm) => {return pm.id == pmid;});
		}
	}
	return false;
}
function KDStoreEnemyPartyMember(enemy: entity, partyid: number, location?: WorldCoord): boolean {
	if (!enemy) return false;
	let npc = KDGetPersistentNPC(partyid,
		undefined, undefined, location
	);
	if (npc) {
		if (KDIsNPCPersistent(enemy.id)) {
			if (!npc.persistentParty) npc.persistentParty = [];

			if (!npc.persistentParty.some((pm) => {return enemy.id == pm;})) {
				npc.persistentParty.push(enemy.id);
				KDGetPersistentNPC(enemy.id).partyLeader = partyid;
				enemy.partyLeader = partyid;
				return true;
			}
		} else {
			if (!npc.storedParty) npc.storedParty = [];

			if (!npc.storedParty.some((pm) => {return enemy.id == pm.id;})) {
				npc.storedParty.push(enemy);
				enemy.partyLeader = partyid;
				return true;
			}
		}
	}
	return false;
}
function KDPopEnemyPartyMember(pmid: number, partyid: number, freeFromParty?: boolean): entity {
	let npc = KDIsNPCPersistent(partyid) ? KDGetPersistentNPC(partyid) : undefined;
	if (npc) {
		if (KDIsNPCPersistent(pmid)) {
			if (!npc.persistentParty || npc.persistentParty.length == 0) return null;
			let index = pmid ? npc.persistentParty.findIndex((pm) => {return pmid == pm;}) : 0;
			if (index >= 0) {
				let id = npc.persistentParty.splice(index, 1)[0];
				let pnpc = KDGetPersistentNPC(id);
				pnpc.partyLeader = undefined;
				let en = KDGetGlobalEntity(id);
				if (freeFromParty) en.partyLeader = undefined;
				return en;
			}
		} else {
			if (!npc.storedParty || npc.storedParty.length == 0) return null;
			let index = pmid ? npc.storedParty.findIndex((pm) => {return pmid == pm.id;}) : 0;
			if (index >= 0) {
				let en = npc.storedParty.splice(index, 1)[0];
				if (freeFromParty) en.partyLeader = undefined;
				return en;
			}
		}

	}
	return null;
}

/** Despawns all party members belonging to the party ID */
function KDDespawnParty(partyid: number, mapData: KDMapDataType) {
	let pleader = KinkyDungeonFindID(partyid, mapData);
	for (let en of mapData.Entities) {
		if (en.partyLeader == partyid
			&& (!KDHelpless(en)
				|| KDistChebyshev(en.x - KDPlayer().x, en.y - KDPlayer().y) > 16)
			&& KDEnemyCanDespawn(en.id, mapData,
			pleader ? KDistChebyshev(en.x - pleader.x, en.y - pleader.y) : undefined)) {
			KDRemoveEntity(en, false, false, true, undefined, mapData);
		}
	}
}
/** Helper function to avoid repetition. Returns true if success*/
function KDChangeParty(pmid: number, partyid: number): boolean {
	let en = KDGetGlobalEntity(pmid);
	if (en) {
		let npc = KDGetPersistentNPC(partyid, undefined, true);
		if (npc) {
			if (en.partyLeader) {
				KDPopEnemyPartyMember(pmid, partyid, true);
			}
			KDStoreEnemyPartyMember(en, npc.id, KDGetNPCLocation(npc.id));
		}


	}
	return false;
}

function KDIsPartyLeaderCapturedOrGone(partyid: number) {
	let npc = KDGetPersistentNPC(partyid, undefined, true);
	if (npc) {
		return npc.captured || KDIsImprisoned(KDGetGlobalEntity(partyid));
	}
	return true;
}


function KDIsInEnemyParty(entity: entity) {
	if (entity.partyLeader) {
		let npc = KDGetPersistentNPC(entity.partyLeader, undefined, true);
		if (npc) {
			return true;
		}
	}

	return false;
}

function KDPurgeParty(partyid: number) {
	// Disbands a party
	let npc = KDGetPersistentNPC(partyid, undefined, true);
	if (npc) {
		let party = KDGetEnemyPartyIDs(partyid);
		for (let p of party) {
			let en = KDPopEnemyPartyMember(p, partyid, true);
			if (en && (!en.homeCoord)) {
				en.goToDespawn = true;
			}
		}
		KDPurgePartyGlobal(partyid);
	}
}

function KDPersistentWatch() {
	let slot = KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()));
	if ((!slot.main && !KDMapData.RoomType) || KDMapData.RoomType == slot.main) {
		KDWatchMainPersistent();
	}

}

function KDWatchMainPersistent() {
	// Maid knight
	if (KDGameData.MaidKnightFloor == undefined || KDGameData.MaidKnightFloor == MiniGameKinkyDungeonLevel) {
		KDGameData.MaidKnightFloor = MiniGameKinkyDungeonLevel;
		let point = KinkyDungeonGetRandomEnemyPoint(true);
		if (!point) {
			KDGameData.MaidKnightFloor++;
			if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0) KDGameData.MaidKnightFloor++;
			return;
		}
		let nearpoint = KinkyDungeonGetNearbyPoint(point.x, point.y, true, undefined, true);
		if (!nearpoint) {
			KDGameData.MaidKnightFloor++;
			if (KDGameData.MaidKnightFloor % KDLevelsPerCheckpoint == 0) KDGameData.MaidKnightFloor++;
			return;
		}
		let en = DialogueCreateEnemy(point.x, point.y,"MaidKnightHeavy");
		if (en) {
			KinkyDungeonSetEnemyFlag(en, "leader", -1);
			if (!KDProcessCustomPatron(en.Enemy, en, 0.2, true))
				KDMakePersistent(en, undefined, true);
			KDRunCreationScript(en, KDGetCurrentLocation());
		}
		let en2 = DialogueCreateEnemy(nearpoint.x, nearpoint.y,"MaidKnightLight");
		if (en2) {
			KinkyDungeonSetEnemyFlag(en2, "led", -1);
			if (!KDProcessCustomPatron(en2.Enemy, en2, 0.2, true))
				KDMakePersistent(en2, undefined, true);
			KDRunCreationScript(en2, KDGetCurrentLocation());
			en2.master = {
				range: 4.5,
				loose: true,
				type: "MaidKnightHeavy",
				aggressive: true,
			};
		}
		if (en && en2) {
			let npc = KDGetPersistentNPC(en.id);
			let npc2 = KDGetPersistentNPC(en2.id);
			if (!npc.data) npc.data = {};
			if (!npc2.data) npc2.data = {};
			npc.data.MaidKnightHeavyID = npc.id;
			npc2.data.MaidKnightHeavyID = npc.id;
			npc.data.MaidKnightLightID = npc2.id;
			npc2.data.MaidKnightLightID = npc2.id;
		}
	}
}


function KDMakePersistent(e: entity, custom: any, special: boolean = true) {
	let npc = KDGetPersistentNPC(e.id, e, true);
	KDSetSpawnAndWanderAI(npc, custom?.spawnAI, custom?.wanderAI);
	KDSetSpecialScript(npc, custom?.specialScript);
	if (special)
		npc.special = true;
	if (custom?.name)
		KDGameData.NamesGenerated[custom.name] = e.id;
}
function KDPurgePartyGlobal(pid: number) {
	for (let v of Object.values(KDWorldMap)) {
		if (v.data) {
			for (let d of Object.values(v.data)) {
				if (d?.Entities) {
					for (let en of d.Entities) {
						if (en.partyLeader == pid) {
							delete en.partyLeader;
							if (!en.homeCoord ||
								(en.homeCoord.mapX != d.mapX
									|| en.homeCoord.mapY != d.mapY
									|| en.homeCoord.room != d.RoomType
								)
							) {
								en.goToDespawn = true;
							}
						}
					}
				}
			}
		}
	}
}

/** Gets all party members on this level */
function KDGetPartyOnLevel(partyid: number, spawnedOnly: boolean): entity[] {
	let party = KDGetEnemyParty(partyid);
	let loc = KDGetCurrentLocation();

	return party.filter((en) => {
		return (!spawnedOnly && KDIsNPCPersistent(en.id) && KDCompareLocation(KDGetNPCLocation(en.id), loc))
			|| KinkyDungeonFindID(en.id)
	});
}
/** Gets all party members on a specific coord */
function KDGetPartyAtCoord(partyid: number, spawnedOnly: boolean, coord: WorldCoord): entity[]  {
	let party = KDGetEnemyParty(partyid);
	let mapData = KDGetMapData(coord);

	return party.filter((en) => {
		return (KDIsNPCPersistent(en.id)
			&& (!spawnedOnly || KDGetPersistentNPC(en.id).spawned)
			&& KDCompareLocation(KDGetNPCLocation(en.id), coord))
		|| (mapData && KinkyDungeonFindID(en.id, mapData))
	});
}


function KDMovePersistentNPC(id: number, coord: WorldCoord): boolean {
	let PNPC = KDPersistentNPCs[id];
	if (PNPC) {
		let oldCoord: WorldCoord = {
			room: PNPC.room,
			mapX: PNPC.mapX,
			mapY: PNPC.mapY,
		};


		let altered = false;
		if (PNPC.mapX != coord.mapX) {
			altered = true;
			PNPC.mapX = coord.mapX;
		}
		if (PNPC.mapY != coord.mapY) {
			altered = true;
			PNPC.mapY = coord.mapY;
		}
		if (PNPC.room != coord.room) {
			altered = true;
			PNPC.room = coord.room;
		}

		if (altered) {
			PNPC.spawned = false;
			if (PNPC.persistentParty) {
				for (let pmid of PNPC.persistentParty) {
					if (KDCompareLocation(oldCoord, KDGetNPCLocation(pmid))) {
						// Move with them if they are in same slot, otherwise dont
						let npc = KDGetPersistentNPC(pmid);
						npc.spawned = false;
						npc.room = coord.room;
						npc.mapY = coord.mapY;
						npc.mapX = coord.mapX;
					}
				}
			}
			// Force both caches to refresh
			if (KDGameData.PersistentNPCCache) {
				delete KDGameData.PersistentNPCCache[coordHash(oldCoord)];
				delete KDGameData.PersistentNPCCache[coordHash(coord)];
			}
		}
		return altered;
	}

	return false;
}

function coordHash(coord: WorldCoord) {
	return coord.room + ',' + coord.mapX + ',' + coord.mapY;
}

let KDPersistentNPCs: {[_ : string]: KDPersistentNPC} = {};

/** A 'graveyard' so to speak to store all NPCs which have been removed so they get deleted when spawned*/
let KDDeletedIDs: {[_ : string]: number} = {};


function KDGetPersistentNPCCache(coord: WorldCoord): number[] {
	if (!KDGameData.PersistentNPCCache) KDGameData.PersistentNPCCache = {};
	if (KDGameData.PersistentNPCCache[coordHash(coord)]) {
		return KDGameData.PersistentNPCCache[coordHash(coord)];
	}
	let ret = KDGetPersistentNPCInlevel(coord);

	KDGameData.PersistentNPCCache[coordHash(coord)] = ret;

	return ret;
}


function KDGetPersistentNPCInlevel(coord: WorldCoord): number[] {
	let ids: number[] = [];
	for (let npc of Object.values(KDPersistentNPCs)) {
		if (npc.mapX == coord.mapX && npc.mapY == coord.mapY && npc.room == coord.room) {
			ids.push(npc.id);
		}
	}

	return ids;
}

/**
 * Syncs a persistent NPC with the world entity, if present
 * force param makes it make the NPC persistent if desired
 */
function KDUpdatePersistentNPC(id: number, force: boolean = false) {
	if (KDPersistentNPCs[id] || (force && KDGetPersistentNPC(id))) {
		let enemy = KinkyDungeonFindID(id);
		if (enemy) {
			let entry = KDPersistentNPCs[id];
			entry.entity = enemy;

			let value = KDGameData.Collection[enemy.id + ""];
			if (value) {
				// Mirror mirror in the collection
				// Who is the cutest of them all...
				entry.outfit = value.outfit;
				entry.hairstyle = value.hairstyle;
				entry.bodystyle = value.bodystyle;
				entry.facestyle = value.facestyle;
				entry.cosplaystyle = value.cosplaystyle;

				if (entry.entity.personality != undefined)
					value.personality = entry.entity.personality;
				else if (value.personality != undefined)
					entry.entity.personality = value.personality;
			}

			KDMovePersistentNPC(id, KDGetCurrentLocation());

			if (enemy.opinion == undefined && KDGameData.Collection[id]?.Opinion != undefined) {
				enemy.opinion = KDGameData.Collection[id].Opinion;
			}
		}
	}
}

/**
 * Syncs a persistent NPC with the world entity, in reverse, updating the entity from the persistent one
 */
function KDRefreshPersistentNPC(id: number) {
	if (KDPersistentNPCs[id]) {
		let enemy = KinkyDungeonFindID(id);
		if (enemy) {
			let entry = KDPersistentNPCs[id];
			KDMapData.Entities[KDMapData.Entities.indexOf(enemy)] = entry.entity;
		}
	}
}

function KDGetGlobalEntity(id: number): entity {
	if (id == -1) return KDPlayer();
	let entity = KinkyDungeonFindID(id);
	if (entity) return entity;
	if (KDIsNPCPersistent(id))
		return KDGetPersistentNPC(id).entity;
	return undefined;
}

function KDIsNPCPersistent(id: number): boolean {
	return KDPersistentNPCs[id] != undefined;
}

function KDGetPersistentNPC(id: number, entity?: entity, force: boolean = true, location?: WorldCoord, special?: boolean): KDPersistentNPC {
	let addToParty = 0;
	let addMember: entity = null;
	if (!KDPersistentNPCs[id] && force) {

		let enemy = entity || KinkyDungeonFindID(id);
		if (enemy) {
			if (enemy.partyLeader) {
				if (KDPopEnemyPartyMember(enemy.id, enemy.partyLeader)) {
					addToParty = enemy.partyLeader;
				}

			}
			let entry: KDPersistentNPC = {
				Name: enemy.CustomName || KDGenEnemyName(enemy),
				id: enemy.id,
				entity: enemy,
				mapX: location ? location.mapX : KDCurrentWorldSlot.x,
				mapY: location ? location.mapY : KDCurrentWorldSlot.y,
				room: location ? location.room : KDGameData.RoomType,
				collect: false,
				captured: false,
				opinion: enemy.opinion || 0,

				// Mirror mirror in the collection
				// Who is the cutest of them all...
				outfit: KDGameData.Collection[enemy.id + ""]?.outfit,
				hairstyle: KDGameData.Collection[enemy.id + ""]?.outfit,
				bodystyle: KDGameData.Collection[enemy.id + ""]?.bodystyle,
				facestyle: KDGameData.Collection[enemy.id + ""]?.facestyle,
				cosplaystyle: KDGameData.Collection[enemy.id + ""]?.cosplaystyle,
			};
			if (special || enemy.Enemy?.special) entry.special = true;
			KDPersistentNPCs[enemy.id] = entry;
			if (addToParty)
				addMember = enemy;
			KDUpdatePersistentNPC(id);
		}
	}
	if (addToParty && addMember) {
		KDStoreEnemyPartyMember(addMember, addToParty, location);
		KDUpdatePersistentNPC(id);
	}
	return KDPersistentNPCs[id];
}

function KDGetCurrentLocation(): WorldCoord {
	return {
			mapX: KDCurrentWorldSlot.x,
			mapY: KDCurrentWorldSlot.y,
			room: KDGameData.RoomType,
		};
}
function KDGetNPCLocation(id: number): WorldCoord {
	let npc = KDPersistentNPCs[id];
	if (npc) {
		return {
			mapX: npc.mapX,
			mapY: npc.mapY,
			room: npc.room,
		};
	}
	return undefined;
}
/** Returns true if they are the same */
function KDCompareLocation(loc1: WorldCoord, loc2: WorldCoord): boolean {
	if (loc1.mapX != loc2.mapX) return false;
	if (loc1.mapY != loc2.mapY) return false;
	if (loc1.room != loc2.room) return false;
	return true;
}

function KDRepopulatePersistentNPCs() {
	let jp = KDMapData.JailPoints.filter(
		(p) => {
			if (p.requireLeash) return false;
			// For now only furniture spawns prisoners
			if (!KinkyDungeonTilesGet(p.x + ',' + p.y).Furniture) return false; // requireFurniture
			if (KinkyDungeonEntityAt(p.x, p.y)) return false;
			return true;
		}
	);
	// Suffle
	let jailPoints: KDJailPoint[] = [];
	if (jp.length > 0) {
		while(jp.length > 0) {
			let index = Math.floor(jp.length * KDRandom());
			jailPoints.push(jp[index]);
			jp.splice(index, 1);
		}
	}

	let count = 0;
	let maxCount = jailPoints.length * 0.7;
	for (let point of jailPoints) {
		if (KDRandom() < 0.7) {
			SetpieceSpawnPrisoner(point.x, point.y, true);
			count++;
			if (count >= maxCount) break;
		}
	}
}


function KDSpawnPersistentNPCs(coord: WorldCoord, searchEntities: boolean): number[] {
	let spawned: number[] = [];

	let slot = KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY});
	if (!slot) return spawned; // We dont generate new ones
	let data = slot.data[coord.room];
	if (!data) return spawned; // We dont generate new ones
	let cache = KDGetPersistentNPCCache(coord);



	if (cache.length > 0) {
		// only spawn NPCs that are in the level
		for (let id of cache) {
			let PNPC = KDGetPersistentNPC(id, undefined, false);
			if (PNPC && !PNPC.spawned) {
				let spawnAI = PNPC.spawnAI || "Default";
				let AI = KDPersistentSpawnAIList[spawnAI];
				if (AI && AI.filter(id, data)) {
					if (AI.chance(id, data) > KDRandom()) {
						if (AI.doSpawn(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
							PNPC.nextSpawnTick = AI.cooldown + KinkyDungeonCurrentTick;
						}
					}
				}
			}
		}
	}

	return spawned;
}

function KDRunPersistentNPCScripts(coord: WorldCoord, searchEntities: boolean): number[] {
	let spawned: number[] = [];

	let slot = KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY});
	if (!slot) return spawned; // We dont generate new ones
	let data = slot.data[coord.room];
	let cache = KDGetPersistentNPCCache(coord);



	if (cache.length > 0) {
		// only spawn NPCs that are in the level
		for (let id of cache) {
			let PNPC = KDGetPersistentNPC(id, undefined, false);
			if (PNPC) { //  && !PNPC.spawned
				let specialScript = PNPC.specialScript || "";
				let AI = KDPersistentScriptList[specialScript];
				if (AI && AI.filter(id, data)) {
					if (AI.chance(id, data) > KDRandom()) {
						if (AI.doScript(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
							PNPC.nextScriptTick = AI.cooldown + KinkyDungeonCurrentTick;
						}
					}
				}
			}
		}
	}

	return spawned;
}


function KDWanderPersistentNPCs(coord: WorldCoord, searchEntities: boolean): number[] {
	let spawned: number[] = [];

	let slot = KDGetWorldMapLocation({x: coord.mapX, y: coord.mapY});
	if (!slot) return spawned; // We dont generate new ones
	let data = slot.data[coord.room];
	let cache = KDGetPersistentNPCCache(coord);



	if (cache.length > 0) {
		// only spawn NPCs that are in the level
		for (let id of cache) {
			let PNPC = KDGetPersistentNPC(id, undefined, false);
			// Only wander if the party leader isnt on the floor
			if (PNPC && (!PNPC.partyLeader || !cache.includes(PNPC.partyLeader))) { //  && !PNPC.spawned
				let wanderAI = PNPC.wanderAI || "GoToMain";
				let AI = KDPersistentWanderAIList[wanderAI];
				if (AI && AI.filter(id, data)) {
					if (AI.chance(id, data) > KDRandom()) {
						if (AI.doWander(id, data, searchEntities ? KinkyDungeonFindID(id, data) : undefined)) {
							PNPC.nextWanderTick = AI.cooldown + KinkyDungeonCurrentTick;
						}
					}
				}
			}
		}
	}

	return spawned;
}

/** Captured by NOT PLAYER */
function KDGetCapturedPersistent(Level: number, RoomType: string, MapMod: string, faction: string): KDPersistentNPC[] {
	let altType = KDGetAltType(Level, MapMod, RoomType);
	let mapFaction = faction || altType?.faction || KDMapMods[MapMod ? MapMod : KDGameData.MapMod]?.faction;

	if (!mapFaction) mapFaction = ""; // Default to no faction

	let capturedPersistent = Object.values(KDPersistentNPCs).filter((npc) => {
		return npc.captured && !npc.jailed && !npc.collect;
	});
	let eligible: KDPersistentNPC[] = [];
	let eligible_faction: KDPersistentNPC[] = [];
	for (let npc of capturedPersistent) {
		let oldEnemy = npc.entity.Enemy;
		if (typeof npc.entity.Enemy == "string") {
			// This is to prevent crash but also reduce memory footprint
			npc.entity.Enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
		}else if (!npc.entity.Enemy.maxhp) {
			KDUnPackEnemy(npc.entity);
		}
		if (!KinkyDungeonFindID(npc.id)) {
			if (KDPersonalAlt[KDMapData.RoomType]?.OwnerNPC) {
				if (KDPersonalAlt[KDMapData.RoomType]?.OwnerNPC == npc.captureCaptor
					// Can assign an ownerfaction as well to spawn faction based captures here,
					// e.g. witch lab owned by one witch
					|| KDPersonalAlt[KDMapData.RoomType]?.OwnerFaction == npc.captureFaction) {
					eligible.push(npc);
				}
			} else {
				if (!mapFaction || mapFaction == npc.captureFaction
					|| (eligible_faction.length == 0 && KDFactionRelation(mapFaction, KDGetFaction(npc.entity)))) {
					eligible.push(npc);
					if (mapFaction && mapFaction == npc.captureFaction) {
						eligible_faction.push(npc);
					}
				}
			}

		}
		npc.entity.Enemy = oldEnemy;
	}

	if (eligible_faction.length > 0) eligible = eligible_faction;

	return eligible;
}



function KDSetSpawnAndWanderAI(npc: KDPersistentNPC, customSpawnAI: string, customWanderAI: string) {
	let enemy = npc.entity.Enemy;
	if (typeof npc.entity.Enemy == "string") {
		enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
	}
	let aitype = "Default";
	let waitype = "Default";
	if (customSpawnAI) aitype = customSpawnAI;
	else if (enemy.spawnAISetting) aitype = enemy.spawnAISetting;
	if (customWanderAI) waitype = customWanderAI;
	else if (enemy.wanderAISetting) waitype = enemy.wanderAISetting;

	if (SpawnAISettingList[aitype]) npc.spawnAI = SpawnAISettingList[aitype](npc, enemy);
	if (WanderAISettingList[waitype]) npc.wanderAI = WanderAISettingList[waitype](npc, enemy);
}

function KDSetSpecialScript(npc: KDPersistentNPC, specialScript: string) {
	let enemy = npc.entity.Enemy;
	if (typeof npc.entity.Enemy == "string") {
		enemy = KinkyDungeonGetEnemyByName(npc.entity.Enemy);
	}
	let script = specialScript || "";
	if (!script && enemy.specialScript) script = enemy.specialScript;

	if (SpecialPersistentScriptSettingList[script]) npc.specialScript = SpecialPersistentScriptSettingList[script](npc, enemy);
}

function KDNPCCanWander(id: number): boolean {
	let npc = KDIsNPCPersistent(id) ? KDGetPersistentNPC(id) : null;

	return npc && (!npc.collect && !(KDGameData.Collection[id] && npc.room == "Summit")) && !KDIsInCapturedPartyID(id)
}

function KDGetSideroomWanderTags(slot: KDWorldSlot): Record<string, Record<string, number>> {
	let rooms: Record<string, Record<string, number>> = {};

	let journeySlot = KDGameData.JourneyMap[(slot.jx != undefined ? slot.jx : 0) + ','
		+ (slot.jy != undefined ? slot.jy : slot.y)];

	if (journeySlot) {
		for (let room of journeySlot.SideRooms) {
			if (KDSideRooms[room]?.wandertags) {
				// Only if theres a wander tag
				rooms[KDSideRooms[room]?.altRoom || ""] = Object.assign({}, KDSideRooms[room].wandertags);
			} else
				rooms[KDSideRooms[room]?.altRoom || ""] = {};
		}
	}

	return rooms;
}


function KDGetLairWanderTags(roomFilter: string, slot: KDWorldSlot): Record<string, Record<string, number>> {
	let results: Record<string, Record<string, number>> = {};

	if (slot.outposts) {
		for (let outpost of Object.entries(slot.outposts)) {
			if (roomFilter == undefined || outpost[1] == roomFilter) {
				let tags: Record<string, number> = {};

				let alt = KDPersonalAlt[outpost[0]];
				if (alt) {
					if (alt.OwnerFaction)
						tags["faction_" + alt.OwnerFaction] = 1;

					if (alt.OwnerNPC)
						tags["owner_" + alt.OwnerNPC] = 1;

					if (alt.RoomType)
						tags["type_" + alt.RoomType] = 1;
				}

				if (KinkyDungeonAltFloor(outpost[0])?.wanderTags) {
					Object.assign(tags, KinkyDungeonAltFloor(outpost[0])?.wanderTags);
				}

				results[outpost[0]] = tags;
			}
		}
	}

	return results;
}

function KDGetWeightedAvgWithTags(tags: Record<string, number>, rooms: Record<string, Record<string, number>>): Record<string, number> {
	let results: Record<string, number> = {};

	for (let room of Object.entries(rooms)) {
		let weight = 0;
		for (let tag of Object.entries(tags)) {
			let tagMult = tag[1] * (room[1][tag[0]] || 0);
			weight += tagMult;
		}
		results[room[0]] = Math.max(0, weight);
	}

	return results;
}

function KDGetPersistentWanderWeightsForRoom(AITags: Record<string, number>, coord: WorldCoord, includeMain: boolean = true): Record<string, number> {
	let results: Record<string, number> = {};
	let slot = KDGetWorldMapLocation(KDCoordToPoint(coord));

	if (!slot) return results; // Null

	let sideRooms = KDGetWeightedAvgWithTags(AITags, KDGetSideroomWanderTags(slot));
	let lairs = KDGetWeightedAvgWithTags(AITags, KDGetLairWanderTags(coord.room, slot));
	if (includeMain) {
		let main = slot.main || "";
		sideRooms[main] = (AITags.generic || 0) + (AITags.main || 0);
	}

	return Object.assign(sideRooms, lairs);
}