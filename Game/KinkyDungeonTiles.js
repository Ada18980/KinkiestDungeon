"use strict";


let KDCancelEvents = {
	JourneyChoice: (x, y, tile, data) => {
		KinkyDungeonState = "JourneyMap";
	},
};
let KDCancelFilters = {
	JourneyChoice: (x, y, tile, data) => {
		// This one is set by event
		if (!KDGameData.JourneyTarget && data.AdvanceAmount > 0) {
			if (KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY]?.Connections.length > 0)
				return "JourneyChoice";
		}
		return "";
	},
};

/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
function KDWettable(entity) {
	return entity.player || (!entity.Enemy.tags.acidimmune && !entity.Enemy.tags.acidresist && !entity.Enemy.tags.nowet);
}

/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
function KDConducting(entity) {
	return entity.player || (!entity.Enemy.tags.electricimmune && !entity.Enemy.tags.electric && !entity.Enemy.tags.noconduct);
}

function KinkyDungeonHandleTilesEnemy(enemy, delta) {
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
 * @param {number} delta
 */
function KDPeripheralTileEffects(delta) {
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
 * @param {number} delta
 */
function KinkyDungeonUpdateTileEffects(delta) {
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

function KinkyDungeonHandleMoveToTile(toTile) {
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

function KDCanEscape(method) {
	return KinkyDungeonEscapeTypes[method].check();
}

function KDGetEscapeMinimapText(method) {
	return KinkyDungeonEscapeTypes[method].minimaptext();
}

function KDGetEscapeDoorText(method) {
	return KinkyDungeonEscapeTypes[method].doortext();
}

function KDGetEscapeMethod(level) {
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
 * @param {number} x
 * @param {number} y
 * @returns {Record<String, boolean>}
 */
function KDEffectTileTags(x, y) {
	/** @type {Record<String, boolean>} */
	let ret = {};
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



function KinkyDungeonHandleStairs(toTile, suppressCheckPoint) {
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
			|| !KinkyDungeonTetherLength()
			|| (!(KDistEuclidean(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y) <= KinkyDungeonTetherLength() + 2)))) {

			let tile = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y);
			let journeyTile = KDGameData.JourneyTarget ? KDGameData.JourneyMap[KDGameData.JourneyTarget.x + ',' + KDGameData.JourneyTarget.y]
				: KDGameData.JourneyMap[KDGameData.JourneyX + ',' + KDGameData.JourneyY];

			let roomType = "";
			//let currCheckpoint = MiniGameKinkyDungeonCheckpoint;
			let originalRoom = KDGameData.RoomType;
			let altRoom = KDGameData.RoomType ? KinkyDungeonAltFloor(KDGameData.RoomType) : KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel);
			let altRoomTarget = (tile && tile.RoomType) ? KinkyDungeonAltFloor(tile.RoomType) : journeyTile?.RoomType;
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
				}/* else if (toTile == 'H') {
					KinkyDungeonSetCheckPoint(KDMapData.ShortcutPath, true, suppressCheckPoint);
				}*/

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
					let saveData = KinkyDungeonSaveGame(true);
					if (KDGameData.RoomType == "PerkRoom" && MiniGameKinkyDungeonLevel >= 1) { //  && Math.floor(MiniGameKinkyDungeonLevel / 3) == MiniGameKinkyDungeonLevel / 3
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

function KinkyDungeonHandleMoveObject(moveX, moveY, moveObject) {
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
 *
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function KDHasEffectTile(x, y) {
	return KinkyDungeonEffectTilesGet(x + "," + y) != undefined;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {Record<string, effectTile>}
 */
function KDGetEffectTiles(x, y) {
	let str = x + "," + y;
	return KinkyDungeonEffectTilesGet(str) ? KinkyDungeonEffectTilesGet(str) : {};
}

function KDGetSpecificEffectTile(x, y, tile) {
	return KDGetEffectTiles(x, y)[tile];
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {effectTileRef} tile
 * @param {number} durationMod
 * @returns {effectTile}
 */
function KDCreateEffectTile(x, y, tile, durationMod) {
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

function KDInteractNewTile(newTile) {
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
 *
 * @param {number} x
 * @param {number} y
 * @param {effectTileRef} tile
 * @param {number} [durationMod]
 * @param {number} [rad]
 * @param {{x: number, y: number}} [avoidPoint]
 * @param {number} [density]
 * @param {string} mod - explosion modifier
 */
function KDCreateAoEEffectTiles(x, y, tile, durationMod, rad, avoidPoint, density, mod = "") {
	for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
		for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
			if (KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, Y + y)) && AOECondition(x, y, x+X, y+Y, rad, mod) && (!avoidPoint || avoidPoint.x != X + x || avoidPoint.y != Y + y) && (density == undefined || KDRandom() < density)) {
				KDCreateEffectTile(x + X, y + Y, tile, durationMod);
			}
		}
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {string[]} tagsToRemove
 * @param {number} [rad]
 * @param {{x: number, y: number}} [avoidPoint]
 * @param {number} [density]
 * @param {string} mod - explosion modifier
 */
function KDRemoveAoEEffectTiles(x, y, tagsToRemove, rad, avoidPoint, density, mod = "") {
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
 * @param {string} id
 * @param {number} alpha
 * @param {string} fade
 * @param {number} delta
 */
function KDApplyAlpha(id, alpha, fade, delta) {
	if (!fade) return 1.0;
	switch (fade) {
		case "random": {
			if (alpha >= 1 || alpha <= 0) KDTileModes[id] = !KDTileModes[id];
			return Math.max(0, Math.min(1, alpha + (KDTileModes[id] ? -delta*0.001 : delta*0.001)));
		}
		case "sine3000": {
			return Math.max(0, Math.min(1, .5 + 0.25 * Math.sin(CommonTime()/3000)));
		}
	}
}

/** @type {Record<string, boolean>} */
let KDTileModes = {
};


let KDLastEffTileUpdate = 0;
function KDDrawEffectTiles(canvasOffsetX, canvasOffsetY, CamX, CamY) {
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
					op.anchorx = 0.5;
					op.anchory = 0.5;
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
				if (color != undefined) op.tint = color;
				KDDraw(kdeffecttileboard, kdpixisprites, tileid, KinkyDungeonRootDirectory + "EffectTiles/" + sprite + ".png",
					(tile.x + (tile.xoffset ? tile.xoffset : 0) - CamX)*KinkyDungeonGridSizeDisplay, (tile.y - CamY + (tile.yoffset ? tile.yoffset : 0))*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, tile.spinAngle, op);
			}
		}
	}
}

/**
 *
 * @param {effectTile} tile
 * @returns {boolean}
 */
function KDCanSeeEffectTile(tile) {
	if (KinkyDungeonState != "TileEditor" && tile.tags?.includes("hiddenmagic")) {
		let rad = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MagicalSight");
		if (rad <= 0 || KDistEuclidean(tile.x - KinkyDungeonPlayerEntity.x, tile.y - KinkyDungeonPlayerEntity.y) > rad) return false;
	}
	return true;
}


function KDUpdateEffectTiles(delta) {
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
 *
 * @param {number} delta
 * @param {entity} entity
 * @param {effectTile} tile
 */
function KinkyDungeonUpdateSingleEffectTile(delta, entity, tile,) {
	if (tile.duration > 0 && KDEffectTileFunctions[tile.functionName || tile.name]) {
		KDEffectTileFunctions[tile.functionName || tile.name](delta, entity, tile);
	}
}
/**
 *
 * @param {number} delta
 * @param {effectTile} tile
 */
function KinkyDungeonUpdateSingleEffectTileStandalone(delta, tile,) {
	if (tile.noWalls && !KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(tile.x, tile.y))) {
		tile.duration = 0;
	}
	if (tile.duration > 0 && KDEffectTileFunctionsStandalone[tile.functionName || tile.name]) {
		KDEffectTileFunctionsStandalone[tile.functionName || tile.name](delta, tile);
	}
}



/**
 *
 * @param {any} b
 * @param {effectTile} tile
 * @param {number} d
 */
function KinkyDungeonBulletInteractionSingleEffectTile(b, tile, d) {
	if (tile.duration > 0 && KDEffectTileBulletFunctions[tile.functionName || tile.name]) {
		KDEffectTileBulletFunctions[tile.functionName || tile.name](b, tile, d);
	}
}


function KDEffectTileInteractions(x, y, b, d) {
	for (let examinedTile of Object.values(KDGetEffectTiles(x, y))) {
		if (examinedTile) KinkyDungeonBulletInteractionSingleEffectTile(b, examinedTile, d);
	}
}

/**
 * Moves an entity
 * @param {entity} enemy
 * @param {number} x
 * @param {number} y
 * @param {boolean} willing
 * @param {boolean} [ignoreBlocked] - Ignore if the target is blocked--important if swapping
 */
function KDMoveEntity(enemy, x, y, willing, dash, forceHitBullets, ignoreBlocked) {
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

function KDStaggerEnemy(enemy) {
	enemy.fx = undefined;
	enemy.fy = undefined;
	enemy.movePoints = 0;
}


function KDMovePlayer(moveX, moveY, willing, sprint, forceHitBullets, suppressNoise) {
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

function KDSlip(dir) {
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
function KDInferno(existingTile, newTile, duration) {
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
 * @param {effectTile} tile
 * @param {string} type
 * @param {number} duration
 * @param {number} chance
 * @returns {boolean}
 */
function KDGrow( tile, type, duration = 20, chance = 0.1, refreshDuration = 20) {
	if (KDEffectTileTags(tile.x, tile.y).water && KDRandom() < chance) {
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
 * @param {*} b
 * @param {effectTile} tile
 * @param {*} d
 */
function KDIgnition(b, tile, d) {
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
 * @param {number} delta
 * @param {number} X
 * @param {number} Y
 */
function KDConveyor(delta, X, Y, unwilling) {
	let tile = KinkyDungeonTilesGet(X + "," + Y);
	if (!tile || tile.SwitchMode == "Off") return;
	let entity = KinkyDungeonEntityAt(X, Y);
	let tiletype = KinkyDungeonMapGet(X + (tile.DX || 0), Y + (tile.DY || 0));
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
			if (entity.Enemy.tags.prisoner) KDStaggerEnemy(entity);
			if (!KDEnemyHasFlag(entity, "conveyed") && (!tile.Sfty || KinkyDungeonIsDisabled(entity) || unwilling || KDEnemyHasFlag(entity, "conveyed_rec"))) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 2);
				KinkyDungeonSetEnemyFlag(entity, "conveyed_rec", 4);
				KDMoveEntity(entity, X + (tile.DX || 0), Y + (tile.DY || 0), false, false, true);
			}
		}
	}
}

function KDAdvanceLevel(data, closeConnections = true) {
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



let KDAdvanceAmount = {
	'S': (altRoom, altRoomPrevious) => { // Stairs up
		return (altRoomPrevious?.skiptunnel ? -1 : 0);
	},
	's': (altRoom, altRoomPrevious) => { // Stairs down
		return (altRoom?.skiptunnel ? 1 : 0);
	},
	'H': (altRoom, altRoomPrevious) => { // Stairs down
		return 0;
	},
};