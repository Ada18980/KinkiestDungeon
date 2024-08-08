
interface KDPersistentNPC {
	Name: string,
	id: number,
	entity: entity,
	mapX: number, mapY: number,
	room: string,
	/** NPC is captured by enemies and therefore cannot be affected */
	captured: boolean,
	/** Preferential capture here */
	captureFaction?: string,
	/** NPC is in collection currently. Set to false when spawned out of collection. Otherwise set to true only when adding to the collection.*/
	collect: boolean,
	opinion: number,
	/** If true, the NPC is here to stay */
	jailed?: boolean,
	/** NPC is special and should remain persistent */
	special?: boolean,

	/** Visual */
	outfit?: string,
	hairstyle?: string,
	bodystyle?: string,
	facestyle?: string,
	cosplaystyle?: string,
}

interface WorldCoord {
	mapX: number,
	mapY: number,
	room: string,
}

let KDPersistentNPCs: {[_ : string]: KDPersistentNPC} = {};

/** A 'graveyard' so to speak to store all NPCs which have been removed so they get deleted when spawned*/
let KDDeletedIDs: {[_ : string]: number} = {};


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

			KDSetNPCLocation(id, KDGetCurrentLocation());

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
	let entity = KinkyDungeonFindID(id);
	if (entity) return entity;
	if (KDIsNPCPersistent(id))
		return KDGetPersistentNPC(id).entity;
	return undefined;
}

function KDIsNPCPersistent(id: number): boolean {
	return KDPersistentNPCs[id] != undefined;
}

function KDGetPersistentNPC(id: number, entity?: entity): KDPersistentNPC {
	if (!KDPersistentNPCs[id]) {

		let enemy = entity || KinkyDungeonFindID(id);
		if (enemy) {
			let entry = {
				Name: enemy.CustomName || KDGetEnemyName(enemy),
				id: enemy.id,
				entity: enemy,
				mapX: KDCurrentWorldSlot.x,
				mapY: KDCurrentWorldSlot.y,
				room: KDGameData.RoomType,
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
			KDPersistentNPCs[enemy.id] = entry;
		}
	}
	KDUpdatePersistentNPC(id);
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
function KDSetNPCLocation(id: number, coord: WorldCoord): boolean {
	let npc = KDPersistentNPCs[id];
	if (npc) {
		let altered = false;
		if (npc.mapX != coord.mapX) {
			altered = true;
			npc.mapX = coord.mapX;
		}
		if (npc.mapY != coord.mapY) {
			altered = true;
			npc.mapY = coord.mapY;
		}
		if (npc.room != coord.room) {
			altered = true;
			npc.room = coord.room;
		}
		return altered;
	}
	return false;
}
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

function KDGetCapturedPersistent(Level: number, RoomType: string, MapMod: string, faction: string): KDPersistentNPC[] {
	let altType = KDGetAltType(Level, MapMod, RoomType);
	let mapFaction = faction || altType?.faction || KDMapMods[MapMod ? MapMod : KDGameData.MapMod]?.faction;

	if (!mapFaction) mapFaction = ""; // Default to no faction

	let capturedPersistent = Object.values(KDPersistentNPCs).filter((npc) => {
		return npc.captured && !npc.jailed;
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
			if (!mapFaction || mapFaction == npc.captureFaction
				|| (eligible_faction.length == 0 && KDFactionRelation(mapFaction, KDGetFaction(npc.entity)))) {
				eligible.push(npc);
				if (mapFaction && mapFaction == npc.captureFaction) {
					eligible_faction.push(npc);
				}
			}
		}
		npc.entity.Enemy = oldEnemy;
	}

	if (eligible_faction.length > 0) eligible = eligible_faction;

	return eligible;
}