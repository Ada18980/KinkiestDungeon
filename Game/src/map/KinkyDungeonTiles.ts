"use strict";


let KDCancelEvents = {
	JourneyChoice: (_x, _y, _tile, _data) => {
		KinkyDungeonState = "JourneyMap";
	},
};
let KDCancelFilters = {
	JourneyChoice: (_x, _y, _tile, data: any) => {
		// This one is set by event
		if (!KDGameData.JourneyTarget && data.AdvanceAmount > 0) {
			if (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Connections.length > 0)
				return "JourneyChoice";
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
	KDMapData.EscapeMethod = data.escapeMethod;
	return data.escapeMethod;
}

function KDGetRandomEscapeMethod() {
	let choices = [];
	for (let method in KinkyDungeonEscapeTypes) {
		if (KinkyDungeonEscapeTypes[method].selectValid) {
			choices.push(method);
		}
	}
	let choice = Math.floor(KDRandom()*choices.length);
	return choices[choice];
}

/**
 * Creates combined record of tags
 * @param x
 * @param y
 */
function KDEffectTileTags(x: number, y: number): Record<string, boolean> {
	let ret: Record<string, boolean> = {};
	let tiles = KDGetEffectTiles(x, y);
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

	if (toTile != 'H' && !KDCanEscape(KDGetEscapeMethod(MiniGameKinkyDungeonLevel))) {
		KinkyDungeonSendActionMessage(10, KDGetEscapeDoorText(KDGetEscapeMethod(MiniGameKinkyDungeonLevel)), "#ffffff", 1);
	}
	else if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.AltStairAction) {
		KDStairsAltAction[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction](toTile, suppressCheckPoint);
	}
	else {
		if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity) && (!KinkyDungeonJailGuard()
			|| !KDGetTetherLength(KinkyDungeonPlayerEntity)
			|| (!(KDistEuclidean(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y) <= KDGetTetherLength(KinkyDungeonPlayerEntity) + 2)))) {

			let tile = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y);
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
				mapMod: KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.MapMod || journeyTile?.MapMod,
				faction: KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.Faction || journeyTile?.Faction,
				escapeMethod: KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.EscapeMethod || journeyTile?.EscapeMethod,
				cancelevent: "",
				cancelfilter: tile?.CancelFilter,
				SideRoom: tile?.SideRoom,
				ShortcutIndex: tile?.ShortcutIndex,
			};
			KinkyDungeonSendEvent("beforeStairCancelFilter", data);
			if (data.cancelfilter) {
				if (data.cancelfilter && KDCancelFilters[data.cancelfilter]) {
					data.cancelevent = KDCancelFilters[data.cancelfilter](KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, tile, data);
				}
			}
			KinkyDungeonSendEvent("beforeStairCancel", data);
			if (data.cancelevent) {
				if (KDCancelEvents[data.cancelevent]) {
					KDCancelEvents[data.cancelevent](KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, tile, data);
				}
			} else {
				if (altRoom?.onExit) altRoom.onExit(data); // Handle any special contitions
				KinkyDungeonSendEvent("beforeHandleStairs", data);

				if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
					KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
					DialogSetReputation("Gaming", KinkyDungeonRep);
				}
				MiniGameVictory = false;

				if (altRoom?.alwaysRegen || (altRoom && !(altRoom?.makeMain || altRoom?.persist))) {
					// Clear all enemies and remove them so that we pick up allies
					for (let en of [...KDMapData.Entities]) {
						if (!KDIsInParty(en) && !KDCanBringAlly(en))
							KDRemoveEntity(en, false, true, true);
					}
				}

				let newLocation = KDAdvanceLevel(data, MiniGameKinkyDungeonLevel + data.AdvanceAmount > KDGameData.HighestLevelCurrent); // Advance anyway
				// We increment the save, etc, after the tunnel
				if (MiniGameKinkyDungeonLevel > KDGameData.HighestLevelCurrent) {
					if (!data.overrideProgression) {
						if (KDGameData.PriorJailbreaks > 0) KDGameData.PriorJailbreaksDecay = (KDGameData.PriorJailbreaksDecay + 1) || 1;

						if (MiniGameKinkyDungeonLevel > 1) {
							KDAdvanceTraining();
							// Reduce security level when entering a new area
							KinkyDungeonChangeRep("Prisoner", -4);

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
							MiniGameKinkyDungeonLevel = 1;
							//KDMapData.MainPath = "grv";
							KinkyDungeonState = "End";
							MiniGameVictory = true;
							suppressCheckPoint = true;
						}
					}
					if (!data.overrideRoomType) {
						if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
							roomType = ""; // We let the boss spawn naturally
						} else {
							roomType = ""; // TODO add more room types
						}
					}
				} else {
					if (tile?.RoomType != undefined) {
						roomType = tile.RoomType;
						KDGameData.MapMod = ""; // Reset the map mod
					} else if (!data.overrideRoomType) {
						roomType = (altRoom?.skiptunnel) ? "" : "PerkRoom"; // We do a perk room, then a tunnel
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
					let Journey = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.Journey;
					if (Journey) {
						KDGameData.Journey = Journey;
						KDInitializeJourney(KDGameData.Journey, MiniGameKinkyDungeonLevel);
					}
				}


				if (!data.overrideRoomType) {
					let RoomType = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.RoomType
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
						data.faction, newLocation, !altRoomTarget || !altRoomTarget.alwaysRegen, altRoom?.persist ? originalRoom : (KDGetWorldMapLocation(newLocation)?.main || data.JourneyTile?.RoomType || ""),
						AdvanceAmount > 0
							? (0)
							: (toTile == 'S' ? 1 : 0),
						data.escapeMethod);

					if (data.ShortcutIndex >= 0) {
						KDGameData.ShortcutIndex = data.ShortcutIndex;
					} else {
						KDGameData.ShortcutIndex = -1;
					}
					if (altRoom?.afterExit) altRoom.afterExit(data); // Handle any special contitions
					KinkyDungeonSendEvent("AfterAdvance", data);
					let saveData = LZString.compressToBase64(JSON.stringify(KinkyDungeonSaveGame(true)));
					if (KDGameData.RoomType == "PerkRoom" && MiniGameKinkyDungeonLevel >= 1 && MiniGameKinkyDungeonLevel == KDGameData.HighestLevelCurrent) { //  && Math.floor(MiniGameKinkyDungeonLevel / 3) == MiniGameKinkyDungeonLevel / 3
						if ((!KinkyDungeonStatsChoice.get("saveMode")) && !suppressCheckPoint) {
							KinkyDungeonState = "Save";
							ElementCreateTextArea("saveDataField");
							ElementValue("saveDataField", saveData);
						}
					}
					KinkyDungeonSaveGame();
					KDSendStatus('nextLevel');
				} else {
					KDSendStatus('end');
				}
			}
		} else {
			KinkyDungeonSendActionMessage(10, TextGet("ClimbDownFail"), "#ffffff", 1);
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
function KDGetEffectTiles(x: number, y: number): Record<string, effectTile> {
	let str = x + "," + y;
	return KinkyDungeonEffectTilesGet(str) ? KinkyDungeonEffectTilesGet(str) : {};
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
		case "ice": {
			return Math.max(0, Math.min(1, .25 + 0.25 * Math.sin(CommonTime()/5000)));
		}
	}
}

let KDTileModes: Record<string, boolean> = {};


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
				if (color != undefined) op['tint'] = color;
				KDDraw(kdeffecttileboard, kdpixisprites, tileid, KinkyDungeonRootDirectory + "EffectTiles/" + sprite + ".png",
					(tile.x + (tile.xoffset ? tile.xoffset : 0) - CamX)*KinkyDungeonGridSizeDisplay, (tile.y - CamY + (tile.yoffset ? tile.yoffset : 0))*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, KDAnimQuantize(Math.PI/4 * (tile.spin || 1), tile.spinAngle), op);
			}
		}
	}
}

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
function KDMoveEntity(enemy: entity, x: number, y: number, willing: boolean, dash?: boolean, forceHitBullets?: boolean, ignoreBlocked?: boolean) {
	enemy.lastx = enemy.x;
	enemy.lasty = enemy.y;
	let cancel = {cancelmove: false, returnvalue: false};
	for (let newTile of Object.values(KDGetEffectTiles(x, y))) {
		if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
			cancel = KDEffectTileMoveOnFunctions[newTile.name](enemy, newTile, willing, {x: x - enemy.x, y: y - enemy.y}, dash);
		}
	}
	if (!ignoreBlocked && KinkyDungeonEntityAt(x, y)) cancel.cancelmove = true;
	if (!cancel.cancelmove) {
		enemy.x = x;
		enemy.y = y;

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


function KDMovePlayer(moveX: number, moveY: number, willing: boolean, sprint?: boolean, forceHitBullets?: boolean, suppressNoise?: boolean): boolean {
	KinkyDungeonPlayerEntity.lastx = KinkyDungeonPlayerEntity.x;
	KinkyDungeonPlayerEntity.lasty = KinkyDungeonPlayerEntity.y;
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
			&& !(entity.Enemy.tags.unstoppable || (entity.Enemy.tags.unflinching && !KinkyDungeonIsDisabled(entity)))) {
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

function KDAdvanceLevel(data: any, closeConnections: boolean = true): { x: number, y: number } {
	MiniGameKinkyDungeonLevel += data.AdvanceAmount;
	let currentSlot = KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];

	if (KDGameData.JourneyTarget) {
		KDGameData.JourneyX = KDGameData.JourneyTarget.x;
		KDGameData.JourneyY = KDGameData.JourneyTarget.y;
		KDGameData.JourneyTarget = null;
	} else {
		KDGameData.JourneyY = MiniGameKinkyDungeonLevel;
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
	return {
		x: KDCurrentWorldSlot.x + data.Xdelta,
		y: KDCurrentWorldSlot.y + data.AdvanceAmount,
	};
}



let KDAdvanceAmount: Record<string, (altRoom: any, altRoomNext: any) => number> = {
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

