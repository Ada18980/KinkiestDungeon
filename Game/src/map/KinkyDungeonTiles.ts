"use strict";


let KDCancelEvents = {
	JourneyChoice: (_x, _y, _tile, data) => {
		if (data.force) return "";
		KinkyDungeonState = "JourneyMap";
		KDGameData.JourneyTarget = null;
		KDGameData.UseJourneyTarget = true;
	},
};
let KDCancelFilters = {
	JourneyChoice: (_x, _y, _tile, data: any) => {
		// This one is set by event
		if (data.force) return "";
		if (!KDGameData.JourneyTarget && data.AdvanceAmount > 0) {
			if (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Connections.length > 0) {
				return "JourneyChoice";
			}
		}
		return "";
	},
	ProtectOldSaves: (_x, _y, _tile, data: any) => {
		// This one is set by event
		if (!KDMapData.RoomType && (KDMapData.mapX == undefined || !(KDGetWorldMapLocation(KDCoordToPoint(KDGetCurrentLocation()))?.jx !== undefined))) {
			return "NoJourneyTarget";
		}
		return "";
	},
};

/**
 * @param entity
 */
function KDWettable(entity: entity): boolean {
	return entity.player || (!entity.Enemy.tags.acidimmune && !entity.Enemy.tags.acidresist && !entity.Enemy.tags.nowet);
}

/**
 * @param entity
 */
function KDConducting(entity: entity): boolean {
	return entity.player || (!entity.Enemy.tags.electricimmune && !entity.Enemy.tags.electric && !entity.Enemy.tags.noconduct);
}

function KinkyDungeonHandleTilesEnemy(enemy: entity, _delta: number): void {
	let tile = KinkyDungeonMapGet(enemy.x, enemy.y);
	if (tile == 'w') {
		if (KDWettable(enemy) && !KDIsFlying(enemy)) {
			if (!enemy.buffs) enemy.buffs = {};
			let b1 = Object.assign({}, KDDrenched);
			b1.duration = 6;
			let b2 = Object.assign({}, KDDrenched2);
			b2.duration = 6;
			let b3 = Object.assign({}, KDDrenched3);
			b3.duration = 6;

			KinkyDungeonApplyBuffToEntity(enemy, b1);
			KinkyDungeonApplyBuffToEntity(enemy, b2);
			KinkyDungeonApplyBuffToEntity(enemy, b3);
			KinkyDungeonApplyBuffToEntity(enemy, KDSlowedSlightly);


		}
	}
}

/**
 * Applies effects based on nearby tiles. Affects only the player
 * @param delta
 */
function KDPeripheralTileEffects(_delta: number) {
	let tileUp = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1);
	let tileL = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x - 1, KinkyDungeonPlayerEntity.y);
	let tileR = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + 1, KinkyDungeonPlayerEntity.y);
	let tileD = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y + 1);
	if (tileUp == ",") {
		// Low hook
		KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonHookLow"), "lightgreen", 1, true);
	} else if (tileUp == "4" || tileL == '4' || tileR == '4' || tileD == '4') {
		// Crack
		KinkyDungeonSendTextMessage(1, TextGet("KinkyDungeonCrack"), "lightgreen", 1, true);
	}
}

/**
 * Applies effects based on the tile you are standing on. Affects only the player
 * @param delta
 */
function KinkyDungeonUpdateTileEffects(delta: number) {
	let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	if (KDTileUpdateFunctions[tile] && KDTileUpdateFunctions[tile](delta)) {
		// Boop
	} else {
		KDPeripheralTileEffects(delta);
	}
	for (let X = 1; X < KDMapData.GridWidth-1; X++) {
		for (let Y = 1; Y < KDMapData.GridHeight-1; Y++) {
			let tt = KinkyDungeonMapGet(X, Y);
			if (KDTileUpdateFunctionsLocal[tt]) KDTileUpdateFunctionsLocal[tt](delta, X, Y);

		}
	}
}


let KinkyDungeonChestConfirm = false;

function KinkyDungeonHandleMoveToTile(toTile: string): void {
	if (toTile == 's' || toTile == 'H' || (toTile == 'S' && (
		MiniGameKinkyDungeonLevel > 0
		//|| (MiniGameKinkyDungeonLevel == 1 && KDGameData.RoomType)
		//|| KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.AltStairAction
		//|| KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.RoomType
	))) { // Go down the next stairs
		if (KinkyDungeonConfirmStairs && KinkyDungeonLastAction == "Wait") {
			KinkyDungeonConfirmStairs = false;
			KinkyDungeonHandleStairs(toTile);
		} else if (!(KDGameData.SleepTurns > 0)) {
			if (KinkyDungeonLastAction == "Move" || KinkyDungeonLastAction == "Wait")
				KinkyDungeonConfirmStairs = true;
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonConfirmStairs"), "white", 1, true);
		}
	}
}

function KDCanEscape(method: string): boolean {
	return KinkyDungeonEscapeTypes[method].check();
}

function KDGetEscapeMinimapText(method: string): string {
	return KinkyDungeonEscapeTypes[method].minimaptext();
}

function KDGetEscapeDoorText(method: string): string {
	return KinkyDungeonEscapeTypes[method].doortext();
}

function KDGetEscapeMethod(_level: number) {
	let alt = KDGetAltType(MiniGameKinkyDungeonLevel);
	if (alt?.escapeMethod)
		return alt.escapeMethod;
	if (alt?.nokeys)
		return "None";
	let data = {altType: alt, escapeMethod: KDMapData.EscapeMethod};
	KinkyDungeonSendEvent("calcEscapeMethod", data);

	if (KinkyDungeonEscapeTypes[data.escapeMethod]) {
		KDMapData.EscapeMethod = data.escapeMethod;
		return data.escapeMethod;
	} else return "None";
}

function KDGetRandomEscapeMethod(RoomType: string, MapMod: string, Level: number, Faction: string) {
	let choices: Record<string, number> = {};
	for (let method of Object.keys(KinkyDungeonEscapeTypes)) {
		let weight = KinkyDungeonEscapeTypes[method].filterRandom ?
			KinkyDungeonEscapeTypes[method].filterRandom(RoomType, MapMod, Level, Faction)
			: 1;
		if (KinkyDungeonEscapeTypes[method].selectValid
			&& (weight >= 1 || KDRandom() < weight)
		) {
			choices[method] = weight;
		}
	}
	return KDGetByWeight(choices);
}

/**
 * Creates combined record of tags
 * @param x
 * @param y
 */
function KDEffectTileTags(x: number, y: number, mapData?: KDMapDataType): Record<string, boolean> {
	let ret: Record<string, boolean> = {};
	let tiles = KDGetEffectTiles(x, y, mapData);
	if (tiles) {
		for (let t of Object.values(tiles)) {
			if (t.tags) {
				for (let tag of t.tags) {
					ret[tag] = true;
				}
			}
		}
	}

	return ret;
}



function KinkyDungeonHandleStairs(toTile: string, suppressCheckPoint?: boolean) {
	if (KinkyDungeonFlags.get("stairslocked")) {
		KinkyDungeonSendActionMessage(10, TextGet("KDStairsLocked").replace("NMB", "" + KinkyDungeonFlags.get("stairslocked")), "#ffffff", 1);
	} else

	if ((toTile == 's' || (toTile == 'S' && KDGetAltType(MiniGameKinkyDungeonLevel)?.noLeave)) && !KDCanEscape(KDGetEscapeMethod(MiniGameKinkyDungeonLevel))) {
		KinkyDungeonSendActionMessage(10, KDGetEscapeDoorText(KDGetEscapeMethod(MiniGameKinkyDungeonLevel)), "#ffffff", 1);
	}
	else if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.AltStairAction) {
		KDStairsAltAction[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction](toTile, suppressCheckPoint);
	}
	else {
		if (!KDPlayer().leash) {
			KDGoThruTile(KDPlayer().x, KDPlayer().y, suppressCheckPoint, false, true);
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("ClimbDownFail"), "#ffffff", 1);
		}
	}
}

function KDGoThruTile(x: number, y: number, suppressCheckPoint: boolean, force: boolean, willing: boolean) {

	// Prune inventory
	KDPruneInventoryVariants(true, true, true);

	KDTickAutorelease();

	KDExploreStairs(x, y);
	let toTile = KinkyDungeonMapGet(x, y);
	if (!KDAdvanceAmount[toTile]) toTile = 'H';
	let tile = KinkyDungeonTilesGet(x + "," + y);
	let altRoom = KDGameData.RoomType ? KinkyDungeonAltFloor(KDGameData.RoomType) : KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel);
	let altRoomTarget = (tile && tile.RoomType) ? KinkyDungeonAltFloor(tile.RoomType) : null;
	let currentAdvanceAmount = KDAdvanceAmount[toTile](altRoom, null);
	let journeyTile = KDGameData.JourneyTarget ? KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y]
		: KDGameData.JourneyMap[KDGameData.JourneyX + ',' + (KDGameData.JourneyY + currentAdvanceAmount)];


	if (!altRoomTarget && !(tile && tile.RoomType)) {
		altRoomTarget = (KinkyDungeonAltFloor(journeyTile?.RoomType));
	}
	let roomType = "";
	//let currCheckpoint = MiniGameKinkyDungeonCheckpoint;
	let originalRoom = KDGameData.RoomType;
	let AdvanceAmount = KDAdvanceAmount[toTile](altRoom, altRoomTarget);

	let data = {
		CurrentJourneyTile: KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY],
		JourneyTile: journeyTile,
		altRoom: altRoom,
		altRoomTarget: altRoomTarget,
		tile: tile,
		AdvanceAmount: AdvanceAmount,
		Xdelta: toTile != 'H' ? (tile?.Xdelta || 0) : (tile?.Xdelta || 0), // TODO allow maneuvering around the world map
		toTile: toTile,
		overrideRoomType: false,
		overrideProgression: false,
		overrideJourney: false,
		mapMod: KinkyDungeonTilesGet(x + "," + y)?.MapMod || journeyTile?.MapMod,
		faction: KinkyDungeonTilesGet(x + "," + y)?.Faction || journeyTile?.Faction,
		escapeMethod: KinkyDungeonTilesGet(x + "," + y)?.EscapeMethod || journeyTile?.EscapeMethod,
		cancelevent: "",
		cancelfilter: tile?.CancelFilter,
		SideRoom: tile?.SideRoom,
		ShortcutIndex: tile?.ShortcutIndex,
		force: force,
		willing: willing,
	};
	KinkyDungeonSendEvent("beforeStairCancelFilter", data);
	if (data.cancelfilter) {
		if (data.cancelfilter && KDCancelFilters[data.cancelfilter]) {
			data.cancelevent = KDCancelFilters[data.cancelfilter](x, y, tile, data);
		}
	}
	KinkyDungeonSendEvent("beforeStairCancel", data);
	if (data.cancelevent) {
		if (KDCancelEvents[data.cancelevent]) {
			KDCancelEvents[data.cancelevent](x, y, tile, data);
		}
	} else {

		let newLocation = KDAdvanceLevel(data, MiniGameKinkyDungeonLevel + data.AdvanceAmount > KDGameData.HighestLevelCurrent,
			true
		);
		let location = KDWorldMap[newLocation.x + "," + newLocation.y];

		KDGenMapCallback = () => {
			if (data.toTile == 's') {
				if (!altRoom?.noAdvance
					&& !tile?.RoomType
					&& (
						// By default only the main advances
						!KDGameData.RoomType // '' is always advance, just for save compat
						|| data.CurrentJourneyTile?.RoomType == (originalRoom || "")
						|| altRoom?.alwaysAdvance)) {
					// advance by default
					if (MiniGameKinkyDungeonLevel == KDGameData.HighestLevelCurrent
						&& data.AdvanceAmount == 0
					) {
						data.overrideRoomType = true;
						KDGameData.RoomType = "PerkRoom";
						data.mapMod = "";
					} else data.AdvanceAmount = 1;
					//data.AdvanceAmount = 0;
				} else {
					// Return to the normal map
					if (!tile?.RoomType) {
						data.overrideRoomType = true;
						let journeySlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];
						if (journeySlot) {
							KDGameData.RoomType = journeySlot.RoomType;
						} else {
							KDGameData.RoomType = "";
						}
					}

					data.AdvanceAmount = 0;
				}
			}


			if (altRoom?.onExit) altRoom.onExit(data); // Handle any special contitions
			KinkyDungeonSendEvent("beforeHandleStairs", data);

			if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
				KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
				DialogSetReputation("Gaming", KinkyDungeonRep);
			}
			MiniGameVictory = false;

			if (altRoom?.alwaysRegen
				|| altRoom?.removePartyMembers
				|| (altRoom && !(altRoom?.makeMain || altRoom?.persist))) {
				// Clear all enemies and remove them so that we pick up allies
				for (let en of [...KDMapData.Entities]) {
					if (!KDIsInParty(en) || !KDCanBringAlly(en))
						KDRemoveEntity(en, false, true, true);
				}
			}

			newLocation = KDAdvanceLevel(data, MiniGameKinkyDungeonLevel + data.AdvanceAmount > KDGameData.HighestLevelCurrent); // Advance anyway


			// We increment the save, etc, after the tunnel
			if (MiniGameKinkyDungeonLevel > KDGameData.HighestLevelCurrent) {
				if (!data.overrideProgression) {
					if (KDGameData.PriorJailbreaks > 0) KDGameData.PriorJailbreaksDecay = (KDGameData.PriorJailbreaksDecay + 1) || 1;

					if (MiniGameKinkyDungeonLevel > 1) {
						KDAdvanceTraining();
						// Reduce security level when entering a new area
						KinkyDungeonChangeRep("Prisoner", -5);

						if (KinkyDungeonStatsChoice.get("Trespasser")) {
							KinkyDungeonChangeRep("Rope", -1);
							KinkyDungeonChangeRep("Metal", -1);
							KinkyDungeonChangeRep("Leather", -1);
							KinkyDungeonChangeRep("Latex", -1);
							KinkyDungeonChangeRep("Will", -1);
							KinkyDungeonChangeRep("Elements", -1);
							KinkyDungeonChangeRep("Conjure", -1);
							KinkyDungeonChangeRep("Illusion", -1);
						}
					}

					if (MiniGameKinkyDungeonLevel >= KinkyDungeonMaxLevel) {
						KDSetWorldSlot(0, 0);
						KinkyDungeonState = "End";
						MiniGameVictory = true;
						suppressCheckPoint = true;
					}
				}
				if (!data.overrideRoomType) {
					roomType = "";
				}
			} else {
				if (tile?.RoomType != undefined) {
					roomType = tile.RoomType;
					KDGameData.MapMod = ""; // Reset the map mod
				} else if (!data.overrideRoomType) {
					// If its an exit stair in the main, we override to the main of next floor
					// The player can never backtrack to old perk rooms

					roomType = data.JourneyTile?.RoomType || "";
					altRoomTarget = KinkyDungeonAltFloor(roomType);
					KDGameData.MapMod = ""; // Reset the map mod
				}
			}
			KDGameData.HighestLevelCurrent = Math.max(KDGameData.HighestLevelCurrent || 1, MiniGameKinkyDungeonLevel);
			KDGameData.HighestLevel = Math.max(KDGameData.HighestLevel || 1, MiniGameKinkyDungeonLevel);


			if (!data.overrideRoomType) {
				KDGameData.RoomType = roomType;
			}
			//if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)) {
			let MapMod = data.mapMod;
			if (MapMod) {
				KDGameData.MapMod = MapMod;
				KDMapData.MapFaction = KDMapMods[KDGameData.MapMod].faction || "";
			} else {
				KDGameData.MapMod = "";
				KDMapData.MapFaction = "";
			}

			if (!data.overrideJourney) {
				let Journey = KinkyDungeonTilesGet(x + "," + y)?.Journey;
				if (Journey != undefined) {
					KDGameData.Journey = Journey;
					KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);
				}
			}


			if (!data.overrideRoomType) {
				let RoomType = KinkyDungeonTilesGet(x + "," + y)?.RoomType
					|| data.JourneyTile?.RoomType;
				if (RoomType) {
					KDGameData.RoomType = RoomType;
				}
			}
			//}


			KinkyDungeonSendActionMessage(10, TextGet("ClimbDown" + toTile), "#ffffff", 1);
			if (toTile == 's') {
				KinkyDungeonSetCheckPoint((KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Checkpoint || 'grv'), true, suppressCheckPoint);
			}



			if (KinkyDungeonState != "End") {
				KinkyDungeonSendEvent("afterHandleStairs", {
					toTile: toTile,
				});
				KDGameData.HeartTaken = false;

				KinkyDungeonCreateMap(KinkyDungeonMapParams[altRoomTarget?.useGenParams ? altRoomTarget.useGenParams : (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Checkpoint || 'grv')], KDGameData.RoomType, KDGameData.MapMod, MiniGameKinkyDungeonLevel, undefined, undefined,
					data.faction, newLocation,
					!altRoomTarget || !altRoomTarget.alwaysRegen,
					// If this is a sideroom, its actually the main that is the upstairs
					(data.JourneyTile?.SideRooms?.includes(KDGameData.RoomType)) ?
						KDGetWorldMapLocation(newLocation)?.main || ""
						: (altRoom?.persist ?
						originalRoom :
						(KDGetWorldMapLocation(newLocation)?.main || data.JourneyTile?.RoomType || "")),
					AdvanceAmount > 0
						? (0)
						: (toTile == 'S' ? 1 : (
							altRoomTarget?.nostartstairs && !altRoomTarget?.startatstartpos ? 1 : 0
						)),
					data.escapeMethod);

				if (data.ShortcutIndex >= 0) {
					KDGameData.ShortcutIndex = data.ShortcutIndex;
				} else {
					KDGameData.ShortcutIndex = KDGameData.RoomType;
				}
				if (altRoom?.afterExit) altRoom.afterExit(data); // Handle any special contitions
				KinkyDungeonSendEvent("AfterAdvance", data);
				let saveData = LZString.compressToBase64(JSON.stringify(KinkyDungeonSaveGame(true)));
				if (KDGameData.RoomType == "PerkRoom" && MiniGameKinkyDungeonLevel >= 1 && MiniGameKinkyDungeonLevel == KDGameData.HighestLevelCurrent) { //  && Math.floor(MiniGameKinkyDungeonLevel / 3) == MiniGameKinkyDungeonLevel / 3
					if ((!KinkyDungeonStatsChoice.get("saveMode")) && !suppressCheckPoint) {
						KinkyDungeonState = "Save";
						KDTextArea("saveDataField", 750, 100, 1000, 230);
						ElementValue("saveDataField", saveData);
					}
				}
				KinkyDungeonSaveGame();
				KDSendStatus('nextLevel');
			} else {
				KDSendStatus('end');
			}
			return "Game";
		};




		if (MiniGameKinkyDungeonLevel < KinkyDungeonMaxLevel - 1
			&& !((!altRoomTarget || !altRoomTarget.alwaysRegen)
			&& (location?.data[KDGameData.RoomType])))
			KinkyDungeonState = "GenMap";
		else {
			KDGenMapCallback();
			KDGenMapCallback = null;
		}
	}
}


let KinkyDungeonConfirmStairs = false;

function KinkyDungeonHandleMoveObject(moveX: number, moveY: number, moveObject: string): boolean {
	if (KDMapData.GroundItems.some((item) => {return item.x == moveX && item.y == moveY;})) {
		// We can pick up items inside walls, in case an enemy drops it into bars
		KinkyDungeonItemCheck(moveX, moveY, MiniGameKinkyDungeonLevel);
	}
	if (KDMoveObjectFunctions[moveObject]) {
		return KDMoveObjectFunctions[moveObject](moveX, moveY);
	}
	return false;
}

/**
 * @param x
 * @param y
 */
function KDHasEffectTile(x: number, y: number): boolean {
	return KinkyDungeonEffectTilesGet(x + "," + y) != undefined;
}

/**
 * @param x
 * @param y
 */
function KDGetEffectTiles(x: number, y: number, mapData?: KDMapDataType): Record<string, effectTile> {
	let str = x + "," + y;

	if (!mapData) mapData = KDMapData;
	return KinkyDungeonEffectTilesGet(str, mapData) ? KinkyDungeonEffectTilesGet(str, mapData) : {};
}

function KDGetSpecificEffectTile(x: number, y: number, tile?: string) {
	return KDGetEffectTiles(x, y)[tile];
}

/**
 * @param x
 * @param y
 * @param tile
 * @param durationMod
 * @returns {effectTile}
 */
function KDCreateEffectTile(x: number, y: number, tile: effectTileRef, durationMod: number): effectTile {
	if (x < 0 || y < 0 || x >= KDMapData.GridWidth || y >= KDMapData.GridHeight) return null;
	let existingTile = KDGetSpecificEffectTile(x, y);
	let duration = (tile.duration ? tile.duration : KDEffectTiles[tile.name].duration) + KDRandom() * (durationMod ? durationMod : 0);
	let createdTile = existingTile;
	if (existingTile && existingTile.duration < tile.duration) {
		existingTile.duration = duration;
	} else {
		let tt = Object.assign({x: x, y: y}, KDEffectTiles[tile.name]);
		Object.assign(tt, tile);
		tt.duration = duration;
		if (!KinkyDungeonEffectTilesGet(x + "," + y)) {
			KinkyDungeonEffectTilesSet(x + "," + y, {});
		}
		KDGetEffectTiles(x, y)[tt.name] = tt;
		createdTile = tt;
	}
	if (createdTile) {
		KDInteractNewTile(createdTile);
		return createdTile;
	}
	return null;
}

function KDInteractNewTile(newTile: effectTile) {
	let Creator = KDEffectTileCreateFunctionsCreator[newTile.functionName || newTile.name];
	let Existing = null;
	for (let tile of Object.values(KDGetEffectTiles(newTile.x, newTile.y))) {
		if (tile != newTile) {
			if (Creator) Creator(newTile, tile);
			if (tile.duration > 0) {
				Existing = KDEffectTileCreateFunctionsExisting[tile.functionName || tile.name];
				if (Existing) Existing(newTile, tile);
			}
		}
	}
}

/**
 * @param x
 * @param y
 * @param tile
 * @param [durationMod]
 * @param [rad]
 * @param [avoidPoint]
 * @param [density]
 * @param mod - explosion modifier
 */
function KDCreateAoEEffectTiles(x: number, y: number, tile: effectTileRef, durationMod?: number, rad?: number, avoidPoint?: { x: number, y: number }, density?: number, mod: string = "") {
	for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
		for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
			if (    KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, Y + y))
			    &&  AOECondition(x, y, x+X, y+Y, rad, mod)
			    &&  (!avoidPoint || avoidPoint.x != X + x || avoidPoint.y != Y + y)
			    &&  (density == undefined || KDRandom() < density))
			{
				KDCreateEffectTile(x + X, y + Y, tile, durationMod);
			}
		}
}

/**
 * @param x
 * @param y
 * @param tagsToRemove
 * @param [rad]
 * @param [avoidPoint]
 * @param [density]
 * @param mod - explosion modifier
 */
function KDRemoveAoEEffectTiles(x: number, y: number, tagsToRemove: string[], rad: number, avoidPoint?: { x: number, y: number }, density?: number, mod: string = "") {
	for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
		for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
			if (AOECondition(x, y, x+X, y+Y, rad, mod) && (!avoidPoint || avoidPoint.x != X + x || avoidPoint.y != Y + y) && (density == undefined || KDRandom() < density)) {
				let tiles = KDGetEffectTiles(x + X, y + Y);
				for (let tile of Object.values(tiles)) {
					if (tagsToRemove.length == 0) {
						tile.duration = 0;
					} else {
						for (let tag of tagsToRemove) {
							if (tile.tags && tile.tags.includes(tag)) {
								tile.duration = 0;
								break;
							}
						}
					}
				}
			}
		}
}

/**
 * Current alpha vs fade type
 * @param id
 * @param alpha
 * @param fade
 * @param delta
 */
function KDApplyAlpha(id: string, alpha: number, fade: string, delta: number) {
	if (!fade) return 1.0;
	switch (fade) {
		case "random": {
			if (alpha >= 1 || alpha <= 0) KDTileModes[id] = !KDTileModes[id];
			return Math.max(0, Math.min(1, alpha + (KDTileModes[id] ? -delta*0.001 : delta*0.001)));
		}
		case "sine3000": {
			return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(CommonTime()/3000)));
		}
		case "sine1000": {
			return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(CommonTime()/1000)));
		}
		case "ice": {
			return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(CommonTime()/2500)));
		}
	}
}

let KDTileModes: Record<string, boolean> = {};


/**
 * Current alpha vs fade type
 * @param id
 * @param x
 * @param y
 * @param tx
 * @param ty
 * @param ease
 * @param delta
 */
function KDEasePosition(x: number, y: number, tx: number, ty: number, speed: number, delta: number, ease: string): KDPoint {
	switch (ease) {
		default: {
			let dd = KDistEuclidean(tx - x, ty - y);
			if (dd > 0) {
				let dx = speed * delta * (tx - x) / dd;
				let dy = speed * delta * (ty - y) / dd;
				if (tx > x)
					x = Math.min(tx, x + dx);
				else if (tx < x)
					x = Math.max(tx, x + dx);

				if (ty > y)
					y = Math.min(ty, y + dy);
				else if (ty < y)
					y = Math.max(ty, y + dy);
			}
			return {x: x, y: y};
		}
	}
}



let KDLastEffTileUpdate = 0;
function KDDrawEffectTiles(_canvasOffsetX: number, _canvasOffsetY: number, CamX: number, CamY: number) {
	let delta = CommonTime() - KDLastEffTileUpdate;
	KDLastEffTileUpdate = CommonTime();
	for (let tileLocation of Object.values(KDMapData.EffectTiles)) {
		for (let tile of Object.values(tileLocation)) {
			let sprite = (tile.pauseDuration > 0 && tile.pauseSprite) ? tile.pauseSprite : (tile.skin ? tile.skin : tile.name);
			if (tile.x >= CamX && tile.y >= CamY && tile.x < CamX + KinkyDungeonGridWidthDisplay && tile.y < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(tile.x, tile.y) > 0) {
				if (!KDCanSeeEffectTile(tile)) continue;
				let tileid = tile.x + "," + tile.y + "_" + sprite;
				let color = undefined;
				if (tile.tags?.includes("terrain")) {
					color = KDGetLightColor(tile.x, tile.y);
				}
				let op = {
					zIndex: -0.1 + 0.01 * tile.priority,
					alpha: KDApplyAlpha(tileid, kdpixisprites.get(tileid)?.alpha, tile.fade, delta),
				};

				if (tile.spin) {
					op['anchorx'] = 0.5;
					op['anchory'] = 0.5;
					if (tile.spinAngle == undefined)
						tile.spinAngle = 0;
					tile.spinAngle += tile.spin * KDTimescale*delta;
					if (tile.spinAngle > Math.PI * 2) tile.spinAngle -= Math.PI*2;
					else if (tile.spinAngle < 0) tile.spinAngle += Math.PI*2;
				}
				if (KDBulletTransparency) {
					if (tile.duration < 9000) {
						op.alpha *= 0.7;
					}
				}
				if (tile.yfade) {
					if (!TileYFade[tileid]) TileYFade[tileid] = KDRandom();
					TileYFade[tileid] = KDApplyAlpha(tileid, TileYFade[tileid], tile.yfade, delta);
				}
				if (color != undefined) op['tint'] = color;
				KDDraw(kdeffecttileboard, kdpixisprites, tileid, KinkyDungeonRootDirectory + "EffectTiles/" + sprite + ".png",
					(tile.x + (tile.xoffset ? tile.xoffset : 0) - CamX)*KinkyDungeonGridSizeDisplay,
					(tile.y - CamY + (tile.yoffset ? tile.yoffset : 0) + (tile.yfadeamount ? tile.yfadeamount*TileYFade[tileid] : 0))*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KDAnimQuantize(Math.PI/4 * (tile.spin || 1), tile.spinAngle), op);
			}
		}
	}
}

let TileYFade: Record<string, number> = {};

/**
 * @param tile
 */
function KDCanSeeEffectTile(tile: effectTile): boolean {
	if (KinkyDungeonState != "TileEditor" && tile.tags?.includes("hiddenmagic")) {
		let rad = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MagicalSight");
		if (rad <= 0 || KDistEuclidean(tile.x - KinkyDungeonPlayerEntity.x, tile.y - KinkyDungeonPlayerEntity.y) > rad) return false;
	}
	return true;
}


function KDUpdateEffectTiles(delta: number): void {
	// Update enemies and the player
	for (let examinedTile of Object.values(KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y))) {
		if (examinedTile) KinkyDungeonUpdateSingleEffectTile(delta, KinkyDungeonPlayerEntity, examinedTile);
	}

	for (let enemy of KDMapData.Entities) {
		for (let examinedTile of Object.values(KDGetEffectTiles(enemy.x, enemy.y))) {
			if (examinedTile) if (examinedTile) KinkyDungeonUpdateSingleEffectTile(delta, enemy, examinedTile);
		}
	}

	// Tick them down
	for (let loc of Object.entries(KDMapData.EffectTiles)) {
		let location = loc[1];
		for (let t of Object.entries(location)) {
			if (t[1].pauseDuration > 0) {
				t[1].pauseDuration -= delta;
			} else if (!t[1].infinite) {
				if (t[1].duration > 0 && t[1].duration < 9000) t[1].duration -= delta;
			}
			if (t[1].pauseDuration <= 0.001) t[1].pauseSprite = undefined;
			if (t[1].duration <= 0.001) delete location[t[0]];
			else {
				KinkyDungeonUpdateSingleEffectTileStandalone(delta, t[1]);
			}
		}
		if (Object.values(loc[1]).length < 1) {
			delete KDMapData.EffectTiles[loc[0]];
		}
	}
}

/**
 * @param delta
 * @param entity
 * @param tile
 */
function KinkyDungeonUpdateSingleEffectTile(delta: number, entity: entity, tile: effectTile): void {
	if (tile.duration > 0 && KDEffectTileFunctions[tile.functionName || tile.name]) {
		KDEffectTileFunctions[tile.functionName || tile.name](delta, entity, tile);
	}
}
/**
 * @param delta
 * @param tile
 */
function KinkyDungeonUpdateSingleEffectTileStandalone(delta: number, tile: effectTile): void {
	if (tile.noWalls && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tile.x, tile.y))) {
		tile.duration = 0;
	}
	if (tile.duration > 0 && KDEffectTileFunctionsStandalone[tile.functionName || tile.name]) {
		KDEffectTileFunctionsStandalone[tile.functionName || tile.name](delta, tile);
	}
}



/**
 * @param b
 * @param tile
 * @param d
 */
function KinkyDungeonBulletInteractionSingleEffectTile(b: any, tile: effectTile, d: number): void {
	if (tile.duration > 0 && KDEffectTileBulletFunctions[tile.functionName || tile.name]) {
		KDEffectTileBulletFunctions[tile.functionName || tile.name](b, tile, d);
	}
}


function KDEffectTileInteractions(x: number, y: number, b: any, d: number): void {
	for (let examinedTile of Object.values(KDGetEffectTiles(x, y))) {
		if (examinedTile) KinkyDungeonBulletInteractionSingleEffectTile(b, examinedTile, d);
	}
}

/**
 * Moves an entity
 * @param enemy
 * @param x
 * @param y
 * @param willing
 * @param [dash]
 * @param [ignoreBlocked] - Ignore if the target is blocked--important if swapping
 * @param [forceHitBullets] - Forces the target to hit stationary bullets if in the way
 */
function KDMoveEntity(enemy: entity, x: number, y: number, willing: boolean, dash?: boolean, forceHitBullets?: boolean, ignoreBlocked?: boolean, noEvent?: boolean, mapData?: KDMapDataType) {
	if (!mapData) mapData = KDMapData;
	if (noEvent) {
		enemy.x = x;
		enemy.y = y;
		if (mapData == KDMapData && (enemy.x != enemy.lastx || enemy.y != enemy.lasty)) KDUpdateEnemyCache = true;
		enemy.lastx = enemy.x;
		enemy.lasty = enemy.y;
		enemy.lastmove = KinkyDungeonCurrentTick;
		return false;
	}
	enemy.lastx = enemy.x;
	enemy.lasty = enemy.y;
	let cancel = {cancelmove: false, returnvalue: false};
	if (mapData == KDMapData)
		for (let newTile of Object.values(KDGetEffectTiles(x, y))) {
			if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
				cancel = KDEffectTileMoveOnFunctions[newTile.name](enemy, newTile, willing, {x: x - enemy.x, y: y - enemy.y}, dash);
			}
		}
	if (!ignoreBlocked && KinkyDungeonEntityAt(x, y, undefined, undefined, undefined, undefined,
		mapData)) cancel.cancelmove = true;
	if (!cancel.cancelmove) {
		enemy.x = x;
		enemy.y = y;

		if (mapData == KDMapData) {
			KinkyDungeonSendEvent("enemyMove", {
				cancelmove: cancel.cancelmove,
				returnvalue: cancel.returnvalue,
				willing: willing,
				sprint: dash,
				lastX: enemy.lastx,
				lastY: enemy.lasty,
				moveX: x,
				moveY: y,
				enemy: enemy,
			});
			KDCheckCollideableBullets(enemy, forceHitBullets);
		}

		enemy.fx = undefined;
		enemy.fy = undefined;
		if (enemy.x != enemy.lastx || enemy.y != enemy.lasty) KDUpdateEnemyCache = true;
	}
	return cancel.returnvalue;
}

/**
 * @param enemy
 */
function KDStaggerEnemy(enemy: entity) {
	enemy.fx = undefined;
	enemy.fy = undefined;
	enemy.movePoints = 0;
	KinkyDungeonSetEnemyFlag(enemy, "stagger", 2);
}


function KDMovePlayer(moveX: number, moveY: number, willing: boolean, sprint?: boolean, forceHitBullets?: boolean, suppressNoise?: boolean, noEvent?: boolean): boolean {
	KinkyDungeonPlayerEntity.lastx = KinkyDungeonPlayerEntity.x;
	KinkyDungeonPlayerEntity.lasty = KinkyDungeonPlayerEntity.y;
	KinkyDungeonPlayerEntity.lastmove = KinkyDungeonCurrentTick;
	let cancel = {cancelmove: false, returnvalue: false};
	for (let newTile of Object.values(KDGetEffectTiles(moveX, moveY))) {
		if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
			cancel = KDEffectTileMoveOnFunctions[newTile.name](KinkyDungeonPlayerEntity, newTile, willing, {x: moveX - KinkyDungeonPlayerEntity.x, y: moveY - KinkyDungeonPlayerEntity.y}, sprint);
		}
	}
	if (!cancel.cancelmove) {
		if (willing) {
			if (moveX > KinkyDungeonPlayerEntity.x) {
				KDFlipPlayer = true;
			} else if (moveX < KinkyDungeonPlayerEntity.x) {
				KDFlipPlayer = false;
			}
		} else {
			KinkyDungeonSetFlag("forceMoved", 1);
		}
		KinkyDungeonPlayerEntity.x = moveX;
		KinkyDungeonPlayerEntity.y = moveY;

	}
	let data = {
		cancelmove: cancel.cancelmove, // If true, cancels the move
		returnvalue: cancel.returnvalue, // Returns this
		willing: willing, // True if the player triggers it, false if yoinked by tether
		sprint: sprint, // True if faster than usual
		lastX: KinkyDungeonPlayerEntity.lastx,
		lastY: KinkyDungeonPlayerEntity.lasty,
		moveX: moveX,
		moveY: moveY,
		sound: (sprint && !suppressNoise) ? (4): 0,
		dist: KDistChebyshev(KinkyDungeonPlayerEntity.lastx - moveX, KinkyDungeonPlayerEntity.lasty - moveY),
	};
	if (!noEvent)
		KinkyDungeonSendEvent("playerMove", data);
	if (data.sound > 0) {
		KinkyDungeonMakeNoise(data.sound, data.moveX, data.moveY);
	}
	if (!cancel.cancelmove) {
		KDCheckCollideableBullets(KinkyDungeonPlayerEntity, forceHitBullets);
		KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTrapMoved);
	}
	return cancel.returnvalue;
}

function KDSlip(dir: { x: number, y: number }): boolean {
	KinkyDungeonFastMovePath = [];
	let maxSlip = 2;
	let maxReached = 0;
	for (let i = 0; i < maxSlip; i++) {
		let newTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		let oldTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
		if ((Object.values(newTiles).some((tile) => {return tile.tags?.includes("slippery")
				|| ((tile.statuses?.frozen || tile.name.includes("Frozen")) && tile.tags?.includes("slipperywhenfrozen"));})
			|| Object.values(oldTiles).some((tile) => {return tile.tags?.includes("slippery")
				|| ((tile.statuses?.frozen || tile.name.includes("Frozen")) && tile.tags?.includes("slipperywhenfrozen"));}))
			&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y))
			&& !KinkyDungeonEnemyAt(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y)) {
			KDMovePlayer(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y, false, true, false, true);
			KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
			KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true);
			maxReached = i;
		} else {
			i = maxSlip;
		}

	}
	if (maxReached) {
		KinkyDungeonSendActionMessage(10, TextGet("KDSlipIce"), "yellow", maxReached + 1);
		KDGameData.SlowMoveTurns = Math.max(KDGameData.SlowMoveTurns, 1);
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "Slipping", type: "none", power: 1.0, duration: 1,});
		return true;
	}
	return false;
}

/**
 * Helper function for flammable tiles
 */
function KDInferno(existingTile: effectTile, newTile: effectTile, duration: number): boolean {
	if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
		existingTile.duration = 0;
		KDCreateEffectTile(existingTile.x, existingTile.y, {
			name: "Inferno",
			duration: duration,
		}, 2);
		return true;
	}
	return false;
}
/**
 *
 * @param tile
 * @param type
 * @param [duration]
 * @param [chance]
 * @param [refreshDuration]
 */
function KDGrow(tile: effectTile, type: string, duration: number = 20, chance: number = 0.1, refreshDuration: number = 20): boolean {
	if (KDEffectTileTags(tile.x, tile.y).wet && KDRandom() < chance) {
		tile.duration = Math.max(tile.duration, refreshDuration);
		let xx = Math.floor(KDRandom() * 3) - 1;
		let yy = Math.floor(KDRandom() * 3) - 1;
		if (xx == 0 && yy == 0) xx = KDRandom() > 0.5 ? 1 : -1;
		KDCreateEffectTile(tile.x + xx, tile.y + yy, {
			name: type,
			duration: duration,
		}, 2);
		return true;
	}
	return false;
}

/**
 * Helper function for flammables
 * @param b
 * @param tile
 * @param d
 */
function KDIgnition(b: any, tile: effectTile, _d: any) {
	if (b.bullet.damage) {
		let type = b.bullet.damage.type;
		if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
			KDCreateEffectTile(tile.x, tile.y, {
				name: "Ember",
				duration: 2,
			}, 1);
		}
	}
}

/**
 * Code for a conveyor tile. DY and DX enable this functionality
 * @param delta
 * @param X
 * @param Y
 * @param [unwilling]
 */
function KDConveyor(_delta: number, X: number, Y: number, unwilling?: boolean) {
	let tile = KinkyDungeonTilesGet(X + "," + Y);
	if (!tile || tile.SwitchMode == "Off") return;
	let entity = KinkyDungeonEntityAt(X, Y);
	let tiletype = KinkyDungeonMapGet(X + (tile.DX || 0), Y + (tile.DY || 0));
	if (entity?.Enemy?.tags.prisoner) {
		KDStaggerEnemy(entity);
	}
	if (entity && KinkyDungeonMovableTilesEnemy.includes(tiletype) && !KinkyDungeonEntityAt(X + (tile.DX || 0), Y + (tile.DY || 0))) {
		if (entity.player) {
			if (!KinkyDungeonFlags.get("conveyed") && (!tile.Sfty || KDPlayerIsStunned() || unwilling || KinkyDungeonFlags.get("conveyed_rec"))) {
				KinkyDungeonSetFlag("conveyed", 2);
				KinkyDungeonSetFlag("conveyed_rec", 3);
				KDMovePlayer(X + (tile.DX || 0), Y + (tile.DY || 0), false, false, true);
				KinkyDungeonSendTextMessage(4, TextGet("KDConveyorPush"), "#ffff44", 2);
			}
		} else if (!KDIsImmobile(entity) && !KDIsFlying(entity) && !entity.Enemy.tags.ignoreconveyor && !entity.Enemy.ethereal
			&& !((entity.Enemy.tags.unstoppable && (!KinkyDungeonIsDisabled(entity) || !KinkyDungeonIsSlowed(entity)))
			 || (entity.Enemy.tags.unflinching && !KinkyDungeonIsDisabled(entity)))) {
			if (!KDEnemyHasFlag(entity, "conveyed") && (!tile.Sfty || KinkyDungeonIsDisabled(entity) || unwilling || KDEnemyHasFlag(entity, "conveyed_rec") || KDEnemyHasFlag(entity, "stagger"))) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 2);
				KinkyDungeonSetEnemyFlag(entity, "conveyed_rec", 4);
				KDMoveEntity(entity, X + (tile.DX || 0), Y + (tile.DY || 0), false, false, true);
			}
		}
	}
}

function KDTickSpecialStats() {
	let player = KDPlayer();
	for (let stat of Object.entries(KDSpecialStats)) {
		let buff = KDEntityGetBuff(player, stat[0] + "Stat");
		if (buff?.power > 0)
			KDAddSpecialStat(stat[0], KDPlayer(), -Math.min(buff.power, stat[1].PerFloor(player, buff?.power || 0)), true, 100);
	}
	KDGameData.LockoutChance = 0;
}

function KDAdvanceLevel(data: any, closeConnections: boolean = true, query: boolean = false): { x: number, y: number } {
	if (!query) {
		MiniGameKinkyDungeonLevel += data.AdvanceAmount;
		let currentSlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];

		if (KDGameData.JourneyTarget && KDGameData.UseJourneyTarget) {
			KDGameData.JourneyX = KDGameData.JourneyTarget.x;
			KDGameData.JourneyY = KDGameData.JourneyTarget.y;
			KDGameData.JourneyTarget = null;
			KDGameData.UseJourneyTarget = false;
		} else {
			// TODO When adding open world feature, have this track better...
			KDGameData.JourneyX = KDGetWorldMapLocation({x: KDCurrentWorldSlot.x, y: MiniGameKinkyDungeonLevel})?.jx || 0;
			KDGameData.JourneyY = MiniGameKinkyDungeonLevel;
			KDGameData.JourneyTarget = null;
		}
		if (currentSlot && closeConnections) {
			for (let c of (currentSlot.Connections)) {
				if (c.x == KDGameData.JourneyX && c.y == KDGameData.JourneyY) {
					currentSlot.Connections = [c];
					break;
				}
			}
			KDCullJourneyMap();
		}
	}

	return {
		x: KDCurrentWorldSlot.x + data.Xdelta,
		y: KDCurrentWorldSlot.y + data.AdvanceAmount,
	};
}



let KDAdvanceAmount: Record<string, (altRoom: AltType, altRoomNext: AltType) => number> = {
	'S': (_altRoom, altRoomNext) => { // Stairs up
		return (altRoomNext?.skiptunnel ? -1 : 0);
	},
	's': (altRoom, altRoomNext) => { // Stairs down
		return (altRoom?.skiptunnel ? 1 : 0);
	},
	'H': (_altRoom, altRoomNext) => { // Stairs down
		return 0;
	},
};

type KDTileType = any;

function KDShouldLock(x: number, y: number, tile: KDTileType): boolean {
	if (tile.OGLock && tile.Jail && KDGameData.PrisonerState == 'parole') {
		let nearestJail = KinkyDungeonNearestJailPoint(x, y);
		if (nearestJail) {
			if (KinkyDungeonPointInCell(KDPlayer().x, KDPlayer().y)) {
				return false;
			}
		}
	}

	return tile.OGLock != undefined;
}
function KDShouldUnLock(x: number, y: number, tile: KDTileType): boolean {
	return true;
}



let KDDangerousTiles = "V[]";

function KDIsTileDangerous(entity: entity, x: number, y: number, mapData: KDMapDataType): boolean {
	let tile = KinkyDungeonMapDataGet(mapData, x, y);
	if (KDDangerousTiles.includes(tile)) return true;
	let tags = KDEffectTileTags(x, y, mapData);

	if (tags.dangerous) return true;
	if (entity) {
		if (tags.slimedanger && !KDSlimeWalker(entity)) return true;
		if (tags.soapdanger && !KDSoapWalker(entity)) return true;
	}

	for (let pd of Object.values(KDPotentialDangers)) {
		if (pd(entity, x, y, mapData, tags)) return true;
	}

	return false;
}

let KDPotentialDangers: Record<string, (entity: entity, x: number, y: number, mapData: KDMapDataType, tags: Record<string, boolean>) => boolean> = {
	firedanger: (entity, x, y, mapData, tags) => {
		return tags.firedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "fire", "immune", 1)
	},
	icedanger: (entity, x, y, mapData, tags) => {
		return tags.icedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "ice", "immune", 1)
	},
	chaindanger: (entity, x, y, mapData, tags) => {
		return tags.chaindanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "chain", "immune", 1)
	},
	gluedanger: (entity, x, y, mapData, tags) => {
		return tags.gluedanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "glue", "immune", 1)
	},
	gasdanger: (entity, x, y, mapData, tags) => {
		return tags.gasdanger && !KinkyDungeonGetImmunity(entity.Enemy?.tags, entity.Enemy?.Resistance?.profile, "poisongas", "immune", 1)
	},
	bullet: (entity, x, y, mapData, tags) => {
		return false; // TODO
	},
	rune: (entity, x, y, mapData, tags) => {
		return false; // TODO
	},
}