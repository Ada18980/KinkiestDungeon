"use strict";

interface KDLair {
	Name: string,
	RoomType: string,
	OwnerNPC?: number,
	OwnerFaction?: string,
	/** Required entrance type for each entry room*/
	Entrance: Record<string, string>,
	/** For cases with an entrance that is not main, to a non lair*/
	EntranceTo: Record<string, string>,

	/** Optional override type */
	PlaceScriptOverride?: string,
	Hidden?: boolean,
	UpStairsFrom?: string,
	data?: any,
}
let KDPersonalAlt: {[_ : string]: KDLair} = {};

interface lairType {
	/** Entrances from which type of room, otherwise DefaultEntrance*/
	Entrances?: Record<string, string>,
	DefaultEntrance: string
	/** Entrances to the other room from this lair, otherwise DefaultEntranceFrom*/
	EntrancesFrom?: Record<string, string>,
	DefaultEntranceFrom: string
}

let KDLairTypes: Record<string, lairType> = {
	DragonLair: {
		Entrances: {},
		DefaultEntrance: "Cave",
		EntrancesFrom: {},
		DefaultEntranceFrom: "Cave",
	},
	Jail: {
		Entrances: {},
		DefaultEntrance: "Jail",
		EntrancesFrom: {},
		DefaultEntranceFrom: "Jail",
	},
	DollStorage: {
		Entrances: {},
		DefaultEntrance: "Jail",
		EntrancesFrom: {},
		DefaultEntranceFrom: "Jail",
	},
}

function KDGenerateLairNameFromEnemy(RoomType: string, enemy: entity): string {
	return TextGet("KDPersonalizedRoom")
	//RMNME of CHTRNME the ENMYNME
		.replace("RMNME", TextGet("KDSideRoom_" + RoomType))
		.replace("CHTRNME", KDGetPersistentNPC(enemy.id)?.Name)
		.replace("ENMYNME", TextGet("Name" + enemy.Enemy.name));
}



function KDGetLairs(slot: KDWorldSlot, id?: number): [string, string][] {
	if (id) {
		return slot?.lairs ? Object.entries(slot.lairs).filter((lair) => {
			return lair[0].startsWith(id + "_");
		}) : [];
	}
	return slot?.lairs ? Object.entries(slot.lairs) : [];
}
function KDGetOutposts(slot: KDWorldSlot, faction?: number): [string, string][] {
	if (faction) {
		return slot?.outposts ? Object.entries(slot.outposts).filter((outpost) => {
			return outpost[0].startsWith(faction + "_");
		}) : [];
	}
	return slot?.outposts ? Object.entries(slot.outposts) : [];
}

function KDAddLair(
	slot: KDWorldSlot,
	/** Room to place the lair entrance in */
	room: string,
	/** altType of the lair */
	alt: string,
	id: number,
	hidden: boolean,
	/** Entrance of the lair inside room */
	entrance: string,
	/** Room that this is from, only relevant if different from room*/
	fromRoom?: string,
	/** Entrance of the room in the fromRoom, not the room*/
	fromRoomEntrance?: string,
	/** Entrance of the fromRoom from within the lair, only relevant if fromRoom diffs from room*/
	entranceFrom?: string,
	alwaysGet?: boolean): string {
	let lairid = KDOutpostID(id + "", alt, slot);

	//id + "_" + alt + `,${slot.x},${slot.y}`;
	let jx = slot.jx || 0;
	let jy = slot.jy || slot.y;
	let journeySlot = KDGameData.JourneyMap[jx + ',' + jy];
	if (!slot.lairs) {
		slot.lairs = {};
	}
	let placed = false;
	if (slot.lairs[lairid] == undefined) {
		slot.lairs[lairid] = room;
		KDPersonalAlt[lairid] = {
			Name: lairid,
			RoomType: alt,
			OwnerNPC: id,
			Entrance: {},
			EntranceTo: {},
			Hidden: hidden,
			UpStairsFrom: fromRoom != undefined ? fromRoom : room,
		};
		KDPersonalAlt[lairid].Entrance[room] = entrance;

		if (journeySlot) {
			journeySlot.SideRooms.push(lairid);
			if (!journeySlot.HiddenRooms) {
				journeySlot.HiddenRooms = {};
			}
			if (hidden)
				journeySlot.HiddenRooms[lairid] = true;
		}
		if (slot.data[room]) {
			// We have to retroactively place the lair
			if (!slot.data[room].LairsToPlace) {
				slot.data[room].LairsToPlace = [];
			}
			slot.data[room].LairsToPlace.push(lairid);
			if (slot.data[room] == KDMapData) {
				// Build the lair instantly
				KDBuildLairs();
			}
			placed = true;
		} else {
			// We have to retroactively place the lair
			if (!slot.lairsToPlace) {
				slot.lairsToPlace = {};
			}
			if (!slot.lairsToPlace[room]) {
				slot.lairsToPlace[room] = [];
			}
			slot.lairsToPlace[room].push(lairid);
			placed = true;
		}
	}
	let gen = false;
	if (fromRoom != undefined && KDDoLairOutpostConnections(
		slot,
		lairid,
		fromRoom,
		fromRoomEntrance,
		entranceFrom))
			gen = true;

	if (KDDoLairOutpostConnections(
	slot,
	lairid,
	room,
	entrance,
	entranceFrom))
		gen = true;

	if (gen) KDBuildLairs();
	return (placed || alwaysGet) ? lairid : undefined;
}

function KDOutpostID(faction: string, alt: string, slot: KDPoint) {
	return faction + "_" + alt + `,${slot.x},${slot.y}`;
}

function KDAddOutpost(
	slot: KDWorldSlot,
	/** Room to place the lair entrance in */
	room: string,
	/** altType of the lair */
	alt: string,
	faction: string,
	hidden: boolean,
	/** Entrance of the lair inside room */
	entrance: string,
	/** Room that this is from, only relevant if different from room*/
	fromRoom?: string,
	/** Entrance of the room in the fromRoom, not the room*/
	fromRoomEntrance?: string,
	/** Entrance of the fromRoom from within the lair, only relevant if fromRoom diffs from room*/
	entranceFrom?: string,
	alwaysGet: boolean = true): string {
	let outpostid = KDOutpostID(faction, alt, slot);
	let jx = slot.jx || 0;
	let jy = slot.jy || slot.y;
	let journeySlot = KDGameData.JourneyMap[jx + ',' + jy];
	if (!slot.outposts) {
		slot.outposts = {};
	}
	let placed = false;
	if (slot.outposts[outpostid] == undefined) {
		slot.outposts[outpostid] = room;
		KDPersonalAlt[outpostid] = {
			Name: outpostid,
			RoomType: alt,
			OwnerFaction: faction,
			Entrance: {},
			EntranceTo: {},
			UpStairsFrom: fromRoom != undefined ? fromRoom : room,
		};
		KDPersonalAlt[outpostid].Entrance[room] = entrance;

		if (journeySlot) {
			journeySlot.SideRooms.push(outpostid);
			if (!journeySlot.HiddenRooms) {
				journeySlot.HiddenRooms = {};
			}
			if (hidden)
				journeySlot.HiddenRooms[outpostid] = true;
		}
		if (slot.data[room]) {
			// We have to retroactively place the lair
			if (!slot.data[room].LairsToPlace) {
				slot.data[room].LairsToPlace = [];
			}
			slot.data[room].LairsToPlace.push(outpostid);
			if (slot.data[room] == KDMapData) {
				// Build the lair instantly
				KDBuildLairs();
			}
			placed = true;
		} else {
			// We have to retroactively place the lair
			if (!slot.lairsToPlace) {
				slot.lairsToPlace = {};
			}
			if (!slot.lairsToPlace[room]) {
				slot.lairsToPlace[room] = [];
			}
			slot.lairsToPlace[room].push(outpostid);
			placed = true;
		}
	}
	let gen = false

	if (fromRoom != undefined && KDDoLairOutpostConnections(
		slot,
		outpostid,
		fromRoom,
		fromRoomEntrance,
		entranceFrom))
			gen = true;

	if (KDDoLairOutpostConnections(
	slot,
	outpostid,
	room,
	entrance,
	entranceFrom))
		gen = true;


	if (gen) KDBuildLairs();
	return (placed || alwaysGet) ? outpostid : undefined;
}

function KDDoLairOutpostConnections(slot: KDWorldSlot, id: string,
	roomFrom: string,
	entranceType: string,
	entranceTypeFrom: string): boolean {
	if (!KDPersonalAlt[id]) return false;
	let ret = false;
	if (!slot.lairsToPlace) {
		slot.lairsToPlace = {};
	}
	if (
		// Check target room for entrances
		(
			!slot.lairsToPlace[roomFrom]?.includes(id)
			&& !slot.data[roomFrom]?.LairsToPlace?.includes(id)
			&& !(slot.data[roomFrom]?.UsedEntrances && slot.data[roomFrom]?.UsedEntrances[id])
		) && roomFrom != id
	) {
		KDPersonalAlt[id].Entrance[roomFrom] = entranceType;
		if (slot.data[roomFrom]) {
			if (!slot.data[roomFrom].LairsToPlace) {
				slot.data[roomFrom].LairsToPlace = [];
			}
			if (!slot.data[roomFrom].LairsToPlace.includes(id))
				slot.data[roomFrom].LairsToPlace.push(id);
		} else {
			if (!slot.lairsToPlace[roomFrom]) {
				slot.lairsToPlace[roomFrom] = [];
			}
			if (!slot.lairsToPlace[roomFrom].includes(id))
				slot.lairsToPlace[roomFrom].push(id);
		}
		ret = true;
	}

	// If this lair doesnt have an entrance
	if (
		KDPersonalAlt[id].UpStairsFrom != roomFrom
		// Check target room for entrances
		&& (
			!slot.lairsToPlace[id]?.includes(roomFrom)
			&& !slot.data[id]?.LairsToPlace?.includes(roomFrom)
			&& !(slot.data[id]?.UsedEntrances && slot.data[id]?.UsedEntrances[roomFrom])
		) && roomFrom != id
	) {
		if (KDPersonalAlt[roomFrom])
			KDPersonalAlt[roomFrom].Entrance[id] = entranceTypeFrom;
		else KDPersonalAlt[id].EntranceTo[roomFrom] = entranceTypeFrom;
		if (slot.data[id]) {
			if (!slot.data[id].LairsToPlace) {
				slot.data[id].LairsToPlace = [];
			}
			if (!slot.data[id].LairsToPlace.includes(roomFrom))
				slot.data[id].LairsToPlace.push(roomFrom);
		} else {
			if (!slot.lairsToPlace[id]) {
				slot.lairsToPlace[id] = [];
			}
			if (!slot.lairsToPlace[id].includes(roomFrom))
				slot.lairsToPlace[id].push(roomFrom);
		}

		ret = true;
	}

	return ret;
}

/** Builds lairs for currently loaded map data */
function KDBuildLairs() {
	let data = KDMapData;

	// Load up the array if theres any that dont actually exist yet
	let slot = KDGetWorldMapLocation({x: data.mapX, y: data.mapY});
	if (slot) {
		if (!slot.lairsToPlace) {
			slot.lairsToPlace = {};
		}
		if (slot.lairsToPlace && slot.lairsToPlace[KDMapData.RoomType]?.length > 0) {
			if (!data.LairsToPlace) {
				data.LairsToPlace = [];
			}
			data.LairsToPlace.push(...slot.lairsToPlace[KDMapData.RoomType]);
			slot.lairsToPlace[KDMapData.RoomType] = undefined;
		}
	}


	/** Setup */
	let lairsToPlace = data.LairsToPlace || [];
	let lairsNotPlaced: string[] = [];
	let lairsPlaced: string[] = [];

	/** Iterate */
	for (let lairName of lairsToPlace) {
		let lair = KDPersonalAlt[lairName];
		if (!lair && !KDPersonalAlt[data.RoomType]) {
			lairsNotPlaced.push(lairName);
			return;
		}
		let entrance = lair ? KDFindEntrance(lair, data) : KDFindEntranceTo(KDPersonalAlt[data.RoomType], lairName, data);
		if (entrance) {
			if (KDPlaceLairEntrance(lair, data, entrance, lairName)) {
				lairsPlaced.push(lairName);
				data.UsedEntrances[lairName] = entrance;
				let ind = data.PotentialEntrances.findIndex((ent) => {
					return ent.x == entrance.x && ent.y == entrance.y;
				});
				if (ind >= 0)
					data.PotentialEntrances.splice(ind, 1);
			} else {
				lairsNotPlaced.push(lairName);
			}
		} else {
			lairsNotPlaced.push(lairName);
		}
	}

	/** Finalize */
	if (lairsNotPlaced.length == 0) {
		data.LairsToPlace = undefined;
	} else {
		data.LairsToPlace = lairsNotPlaced;
	}
}

/** Filters and gets an entrance for the lair based on global lair data and map type */
function KDFindEntrance(lair: KDLair, data: KDMapDataType): LairEntrance {
	let highestEntrances: LairEntrance[] = [];
	let min = -1000000;
	let highestEntranceLevel = min;
	let potentialEntrances = (data.PotentialEntrances || []).filter((entrance) => {
		return lair.Entrance[data.RoomType] == entrance.Type;
	});
	for (let entrance of potentialEntrances) {
		let value = (entrance.priority || 0) + (!KDLairEntranceFilterScript[lair.Entrance[data.RoomType]] ? min
			: KDLairEntranceFilterScript[lair.Entrance[data.RoomType]](lair, data, entrance));
		if (value > highestEntranceLevel) {
			highestEntranceLevel = value;
			highestEntrances = [];
		}
		if (value >= highestEntranceLevel) {
			highestEntrances.push(entrance);
		}
	}
	if (highestEntrances.length > 0) {
		return highestEntrances[Math.floor(KDRandom() * highestEntrances.length)];
	}
	return null;
}

/** Filters and gets an entrance for the lair based on global lair data and map type */
function KDFindEntranceTo(lairFrom: KDLair, roomTo: string, data: KDMapDataType): LairEntrance {
	let highestEntrances: LairEntrance[] = [];
	let min = -1000000;
	let highestEntranceLevel = min;
	let potentialEntrances = (data.PotentialEntrances || []).filter((entrance) => {
		return lairFrom.EntranceTo[roomTo] == entrance.Type;
	});
	for (let entrance of potentialEntrances) {
		let value = (entrance.priority || 0) + (!KDLairEntranceFilterScript[lairFrom.EntranceTo[roomTo]] ? min
			: KDLairEntranceFilterScript[lairFrom.EntranceTo[roomTo]](null, data, entrance, roomTo));
		if (value > highestEntranceLevel) {
			highestEntranceLevel = value;
			highestEntrances = [];
		}
		if (value >= highestEntranceLevel) {
			highestEntrances.push(entrance);
		}
	}
	if (highestEntrances.length > 0) {
		return highestEntrances[Math.floor(KDRandom() * highestEntrances.length)];
	}
	return null;
}

/** Runs the associated place script for the lair based on global lair data */
function KDPlaceLairEntrance(lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string): boolean {
	if (KDLairEntrancePlaceScript[entrance.PlaceScript]) {
		return KDLairEntrancePlaceScript[entrance.PlaceScript](lair, data, entrance, roomTo);
	}
	return false;
}