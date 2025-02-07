"use strict";


interface LairEntrance {
	Type: string,
	x: number,
	y: number,
	Excavate: KDPoint[],
	PlaceScript: string,
	priority?: number,
}

/** PlaceScripts for lairs that override the entrance placescript */
let KDLairTypePlaceScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => boolean> = {
	DragonLair: (lair, data, entrance, roomTo) => {
		// For now...
		return KDLairTypePlaceScript["Cave"](lair, data, entrance, roomTo);
	},
	Cave: (lair, data, entrance, roomTo) => {
		let point = {x: entrance.x, y: entrance.y};
		if ((KinkyDungeonGroundTiles + "4rY").includes(
			KinkyDungeonMapGet(point.x, point.y))
			&& !KinkyDungeonTilesGet(point.x + ',' + point.y)?.Type) {

			KDMakeShortcutStairs(lair, point, data, roomTo);

			KinkyDungeonSkinArea({skin: "cav"}, point.x, point.y, 1.5);

			if (!KDMapData.SpecialAreas) KDMapData.SpecialAreas = [];
			KDMapData.SpecialAreas.push({x: point.x, y: point.y, radius: 2});
			return true;
		}
		return false;
	},
	Wall: (lair, data, entrance, roomTo) => {
		let point = {x: entrance.x, y: entrance.y};
		if (("14").includes(
			KinkyDungeonMapGet(point.x, point.y))
			&& !KinkyDungeonTilesGet(point.x + ',' + point.y)?.Type) {

			KDMakeShortcutStairs(lair, point, data, roomTo);

			//KinkyDungeonSkinArea({skin: "cav"}, point.x, point.y, 1.5);

			if (!KDMapData.SpecialAreas) KDMapData.SpecialAreas = [];
			KDMapData.SpecialAreas.push({x: point.x, y: point.y, radius: 2});
			return true;
		}
		return false;
	},
}

/** Placescripts for lair entrances */
let KDLairEntrancePlaceScript: Record<string, (lairData: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => boolean> = {
	Cave: (lair, data, entrance, roomTo) => {
		// Caves specifically must excavate, then they run specific or Cave LairTypePlaceScript
		// Excavate
		if (entrance.Excavate?.length > 0) {
			for (let tile of entrance.Excavate) {
				// Clear the tiles, but only if they are cracked or ground
				if ((KinkyDungeonGroundTiles + "4").includes(
					KinkyDungeonMapGet(tile.x, tile.y))
					&& !KinkyDungeonTilesGet(tile.x + ',' + tile.y)?.Type) {
					KinkyDungeonMapSet(tile.x, tile.y, 'r');
					KDCreateEffectTile(tile.x, tile.y, {
						name: "RubbleNoMend",
						duration: 9999,
					}, 0);
				}
			}
			KinkyDungeonUpdateLightGrid = true;
			KinkyDungeonGenNavMap();
		}

		// Place script
		return KDLairTypePlaceScript[lair?.PlaceScriptOverride || "Cave"](lair, data, entrance, roomTo);
	},
	Jail: (lair, data, entrance, roomTo) => {
		// Caves specifically must excavate, then they run specific or Cave LairTypePlaceScript
		// Excavate
		if (entrance.Excavate?.length > 0) {
			for (let tile of entrance.Excavate) {
				// Clear the tiles, but only if they are cracked or ground
				if ((KinkyDungeonGroundTiles + "04").includes(
					KinkyDungeonMapGet(tile.x, tile.y))
					&& !KinkyDungeonTilesGet(tile.x + ',' + tile.y)?.Type) {
					KinkyDungeonMapSet(tile.x, tile.y, '2');
				}
			}
			KinkyDungeonUpdateLightGrid = true;
			KinkyDungeonGenNavMap();
		}

		// Place script
		return KDLairTypePlaceScript[lair?.PlaceScriptOverride || "Wall"](lair, data, entrance, roomTo);
	},
}

function KDGenHighSecCondition(force: boolean, enemy: entity) {
	if (((force || KinkyDungeonFlags.has("LeashToPrison"))
			&& !(KinkyDungeonAltFloor(KDGameData.RoomType)?.isPrison))
		|| (
			KDSelfishLeash(enemy)
		)) {

		let altType = KDGetAltType(MiniGameKinkyDungeonLevel);
		let slot = KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()));
		return (!altType || altType.placeJailEntrances || slot?.main == KDGameData.RoomType);
	}
	return false;
}



/** Weighting factor for filterscripts */
let KDLairEntranceFilterScript: Record<string, (lair: KDLair, data: KDMapDataType, entrance: LairEntrance, roomTo?: string) => number> = {
	Cave: (lair, data, entrance, roomTo) => {
		let nearestDist = KinkyDungeonGetClosestSpecialAreaDist(entrance.x, entrance.y);
		if (nearestDist < 3) return -1000;

		// Place script
		return 1;
	},
	Jail: (lair, data, entrance, roomTo) => {
		let nearestDist = KinkyDungeonGetClosestSpecialAreaDist(entrance.x, entrance.y);
		if (nearestDist < 3) return -1000;

		let nearestJail = KinkyDungeonNearestJailPoint(entrance.x, entrance.y, ["jail"]);
		if (nearestJail) {
			return KDistChebyshev(nearestJail.x - entrance.x, nearestJail.y - entrance.y);
		}
		return -1000;
	},
}

function KDMakeShortcutStairs(lair: KDLair, point: KDPoint, data: KDMapDataType, roomTo?: string) {
	KinkyDungeonMapSet(point.x, point.y, 'H');
	let tile = KinkyDungeonTilesGet(point.x + ',' + point.y) || {};
	/** EXTREMELY important to add the journeyslot and position!!!! */
	let slot = KDGetWorldMapLocation({x: data.mapX, y: data.mapY});
	let faction: string = lair?.OwnerFaction || "";
	if (slot) {
		let jx = slot.jx || 0;
		let jy = slot.jy || slot.y;
		let journeySlot = KDGameData.JourneyMap[jx + ',' + jy];
		if (journeySlot) {
			if (!lair) faction = journeySlot.Faction;
			if (!journeySlot.SideRooms.includes(lair ? lair.Name : roomTo))
				journeySlot.SideRooms.push(lair ? lair.Name : roomTo);
			if (!journeySlot.HiddenRooms) {
				journeySlot.HiddenRooms = {};
			}
			if (lair?.Hidden)
				journeySlot.HiddenRooms[lair.Name] = true;
		}
		tile.ShortcutIndex = roomTo != undefined ? roomTo : data.ShortcutPositions.length;
		if (data.ShortcutPositions.includes) {
			// Convert from previous save
			let newObj = {};
			for (let i = 0; i < Object.values(data.ShortcutPositions).length; i++) {
				newObj[i] = data.ShortcutPositions[i];
			}
			data.ShortcutPositions = newObj;
		}
		data.ShortcutPositions[tile.ShortcutIndex] = point;
	} else {
		return false;
	}

	tile.MapMod = "None";
	tile.Faction = faction;
	tile.EscapeMethod = "None";
	tile.RoomType = lair ? lair.Name : roomTo;
	KinkyDungeonTilesSet(point.x + ',' + point.y, tile);
	KinkyDungeonMapSet(point.x, point.y, 'H');
	KDRemoveAoEEffectTiles(point.x, point.y, [], 0.5);
}