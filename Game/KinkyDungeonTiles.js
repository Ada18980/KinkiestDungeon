"use strict";

/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
function KDWettable(entity) {
	return entity.player || (!entity.Enemy.tags.acidimmune && !entity.Enemy.tags.acidresist && !entity.Enemy.tags.fire && !entity.Enemy.tags.nowet);
}

/**
 *
 * @param {entity} entity
 * @returns {boolean}
 */
function KDConducting(entity) {
	return entity.player || (!entity.Enemy.tags.electricimmune && !entity.Enemy.tags.electricresist && !entity.Enemy.tags.electric && !entity.Enemy.tags.noconduct);
}

function KinkyDungeonHandleTilesEnemy(enemy, delta) {
	let tile = KinkyDungeonMapGet(enemy.x, enemy.y);
	if (tile == 'w') {
		/*
		if (KDWettable(enemy)) {
			if (!enemy.buffs) enemy.buffs = {};
			let b1 = Object.assign({}, KDDrenched);
			b1.duration = 6;
			let b2 = Object.assign({}, KDDrenched2);
			b2.duration = 6;
			let b3 = Object.assign({}, KDDrenched3);
			b3.duration = 6;

			KinkyDungeonApplyBuff(enemy.buffs, b1);
			KinkyDungeonApplyBuff(enemy.buffs, b2);
			KinkyDungeonApplyBuff(enemy.buffs, b3);
		}
		*/
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
	for (let X = 1; X < KinkyDungeonGridWidth-1; X++) {
		for (let Y = 1; Y < KinkyDungeonGridHeight-1; Y++) {
			let tt = KinkyDungeonMapGet(X, Y);
			if (tt == "w") {
				KDCreateEffectTile(X, Y, {
					name: "Water",
					duration: 2,
				}, 0);
			}
		}
	}
}

let KinkyDungeonChestConfirm = false;

function KinkyDungeonHandleMoveToTile(toTile) {
	if (toTile == 's' || toTile == 'H') { // Go down the next stairs
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

function KDCanEscape() {
	return KDGameData.JailKey || KinkyDungeonFlags.has("BossUnlocked");
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
	if (!KDCanEscape()) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonNeedJailKey"), "#ffffff", 1);
	}
	else {
		if (!KinkyDungeonJailGuard() || !KinkyDungeonTetherLength() || (!(KDistEuclidean(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y) <= KinkyDungeonTetherLength() + 2))) {
			if (MiniGameKinkyDungeonLevel > Math.max(KinkyDungeonRep, ReputationGet("Gaming")) || Math.max(KinkyDungeonRep, ReputationGet("Gaming")) > KinkyDungeonMaxLevel) {
				KinkyDungeonRep = Math.max(KinkyDungeonRep, MiniGameKinkyDungeonLevel);
				DialogSetReputation("Gaming", KinkyDungeonRep);
			}
			MiniGameVictory = false;
			let roomType = "";
			let currCheckpoint = MiniGameKinkyDungeonCheckpoint;
			let altRoom = KinkyDungeonAltFloor(KDGameData.RoomType);

			// We increment the save, etc, after the tunnel
			if (KDGameData.RoomType == "Tunnel" || (altRoom && altRoom.skiptunnel)) {

				MiniGameKinkyDungeonLevel += 1;

				if (KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel)) {
					roomType = ""; // We let the boss spawn naturally
				} else {
					roomType = ""; // TODO add more room types
				}

				if (MiniGameKinkyDungeonLevel >= KinkyDungeonMaxLevel) {
					MiniGameKinkyDungeonLevel = 1;
					MiniGameKinkyDungeonMainPath = "grv";
					KinkyDungeonState = "End";
					MiniGameVictory = true;
					suppressCheckPoint = true;
				}
			} else {
				roomType = "PerkRoom"; // We do a perk room, then a tunnel
				KDGameData.MapMod = ""; // Reset the map mod

				// Reduce security level when entering a new area
				if (MiniGameKinkyDungeonCheckpoint != currCheckpoint)
					KinkyDungeonChangeRep("Prisoner", -5);
				else // Otherwise it's just a little bit
					KinkyDungeonChangeRep("Prisoner", -1);

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

			KDGameData.RoomType = roomType;
			if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)) {
				let MapMod = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).MapMod;
				if (MapMod) {
					KDGameData.MapMod = MapMod;
					KDGameData.MapFaction = KDMapMods[KDGameData.MapMod].faction;
				} else {
					KDGameData.MapMod = "";
					KDGameData.MapFaction = "";
				}
				let Journey = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Journey;
				if (Journey) {
					KDGameData.Journey = Journey;
					KDInitializeJourney(KDGameData.Journey);
				}
				let RoomType = KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).RoomType;
				if (RoomType) {
					KDGameData.RoomType = RoomType;
				}
			}


			if (toTile == 's') {
				KinkyDungeonSendActionMessage(10, TextGet("ClimbDown"), "#ffffff", 1);
				KinkyDungeonSetCheckPoint(MiniGameKinkyDungeonMainPath, true, suppressCheckPoint);
			} else if (toTile == 'H') {
				KinkyDungeonSendActionMessage(10, TextGet("ClimbDownShortcut"), "#ffffff", 1);
				KinkyDungeonSetCheckPoint(MiniGameKinkyDungeonShortcut, true, suppressCheckPoint);
			}

			if (KinkyDungeonState != "End") {
				KDGameData.HeartTaken = false;
				KinkyDungeonCreateMap(KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]], MiniGameKinkyDungeonLevel, undefined, undefined);
				let saveData = KinkyDungeonSaveGame(true);
				if (KDGameData.RoomType == "PerkRoom" && Math.floor(MiniGameKinkyDungeonLevel / 3) == MiniGameKinkyDungeonLevel / 3 && KDDefaultJourney.includes(MiniGameKinkyDungeonCheckpoint)) {
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

		} else {
			KinkyDungeonSendActionMessage(10, TextGet("ClimbDownFail"), "#ffffff", 1);
		}
	}
}


let KinkyDungeonConfirmStairs = false;

function KinkyDungeonHandleMoveObject(moveX, moveY, moveObject) {
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
	if (x < 1 || y < 1 || x >= KinkyDungeonGridWidth || y >= KinkyDungeonGridHeight) return null;
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
	let Creator = KDEffectTileCreateFunctionsCreator[newTile.name];
	let Existing = null;
	for (let tile of Object.values(KDGetEffectTiles(newTile.x, newTile.y))) {
		if (tile != newTile) {
			if (Creator) Creator(newTile, tile);
			if (tile.duration > 0) {
				Existing = KDEffectTileCreateFunctionsExisting[tile.name];
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
 * Current alpha vs fade type
 * @param {string} id
 * @param {number} alpha
 * @param {string} fade
 * @param {number} delta
 */
function KDApplyAlpha(id, alpha, fade, delta) {
	if (!fade) return undefined;
	switch (fade) {
		case "random": {
			if (alpha >= 1 || alpha <= 0) KDTileModes[id] = !KDTileModes[id];
			return alpha + (KDTileModes[id] ? -delta*0.001 : delta*0.001);
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
	for (let tileLocation of Object.values(KinkyDungeonEffectTiles)) {
		for (let tile of Object.values(tileLocation)) {
			let sprite = (tile.pauseDuration > 0 && tile.pauseSprite) ? tile.pauseSprite : (tile.skin ? tile.skin : tile.name);
			if (tile.x >= CamX && tile.y >= CamY && tile.x < CamX + KinkyDungeonGridWidthDisplay && tile.y < CamY + KinkyDungeonGridHeightDisplay && KinkyDungeonVisionGet(tile.x, tile.y) > 0) {
				if (tile.tags?.includes("hiddenmagic")) {
					let rad = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "MagicalSight");
					if (rad <= 0 || KDistEuclidean(tile.x - KinkyDungeonPlayerEntity.x, tile.y - KinkyDungeonPlayerEntity.y) > rad) continue;
				}
				let tileid = tile.x + "," + tile.y + "_" + sprite;
				KDDraw(kdgameboard, kdpixisprites, tileid, KinkyDungeonRootDirectory + "EffectTiles/" + sprite + ".png",
					(tile.x + (tile.xoffset ? tile.xoffset : 0) - CamX)*KinkyDungeonGridSizeDisplay, (tile.y - CamY + (tile.yoffset ? tile.yoffset : 0))*KinkyDungeonGridSizeDisplay,
					KinkyDungeonGridSizeDisplay, KinkyDungeonGridSizeDisplay, 0, {
						zIndex: -0.1 + 0.01 * tile.priority,
						alpha: KDApplyAlpha(tileid, kdpixisprites.get(tileid)?.alpha, tile.fade, delta),
					});
			}
		}
	}
}


function KDUpdateEffectTiles(delta) {
	// Update enemies and the player
	for (let examinedTile of Object.values(KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y))) {
		if (examinedTile) KinkyDungeonUpdateSingleEffectTile(delta, KinkyDungeonPlayerEntity, examinedTile);
	}

	for (let enemy of KinkyDungeonEntities) {
		for (let examinedTile of Object.values(KDGetEffectTiles(enemy.x, enemy.y))) {
			if (examinedTile) if (examinedTile) KinkyDungeonUpdateSingleEffectTile(delta, enemy, examinedTile);
		}
	}

	// Tick them down
	for (let loc of Object.entries(KinkyDungeonEffectTiles)) {
		let location = loc[1];
		for (let t of Object.entries(location)) {
			if (t[1].pauseDuration > 0) {
				t[1].pauseDuration -= delta;
			} else {
				if (t[1].duration > 0) t[1].duration -= delta;
			}
			if (t[1].pauseDuration <= 0.001) t[1].pauseSprite = undefined;
			if (t[1].duration <= 0.001) delete location[t[0]];
			else {
				KinkyDungeonUpdateSingleEffectTileStandalone(delta, t[1]);
			}
		}
		if (Object.values(loc[1]).length < 1) {
			delete KinkyDungeonEffectTiles[loc[0]];
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
	if (tile.duration > 0 && KDEffectTileFunctions[tile.name]) {
		KDEffectTileFunctions[tile.name](delta, entity, tile);
	}
}
/**
 *
 * @param {number} delta
 * @param {effectTile} tile
 */
function KinkyDungeonUpdateSingleEffectTileStandalone(delta, tile,) {
	if (tile.duration > 0 && KDEffectTileFunctionsStandalone[tile.name]) {
		KDEffectTileFunctionsStandalone[tile.name](delta, tile);
	}
}



/**
 *
 * @param {any} b
 * @param {effectTile} tile
 * @param {number} d
 */
function KinkyDungeonBulletInteractionSingleEffectTile(b, tile, d) {
	if (tile.duration > 0 && KDEffectTileBulletFunctions[tile.name]) {
		KDEffectTileBulletFunctions[tile.name](b, tile, d);
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
 */
function KDMoveEntity(enemy, x, y, willing, dash, forceHitBullets) {
	enemy.lastx = enemy.x;
	enemy.lasty = enemy.y;
	let cancel = {cancelmove: false, returnvalue: false};
	for (let newTile of Object.values(KDGetEffectTiles(x, y))) {
		if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
			cancel = KDEffectTileMoveOnFunctions[newTile.name](enemy, newTile, willing, {x: x - enemy.x, y: y - enemy.y}, dash);
		}
	}
	if (!cancel.cancelmove) {
		enemy.x = x;
		enemy.y = y;
	}
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
	return cancel.returnvalue;
}


function KDMovePlayer(moveX, moveY, willing, sprint, forceHitBullets) {
	KinkyDungeonPlayerEntity.lastx = KinkyDungeonPlayerEntity.x;
	KinkyDungeonPlayerEntity.lasty = KinkyDungeonPlayerEntity.y;
	let cancel = {cancelmove: false, returnvalue: false};
	for (let newTile of Object.values(KDGetEffectTiles(moveX, moveY))) {
		if (newTile.duration > 0 && KDEffectTileMoveOnFunctions[newTile.name]) {
			cancel = KDEffectTileMoveOnFunctions[newTile.name](KinkyDungeonPlayerEntity, newTile, willing, {x: moveX - KinkyDungeonPlayerEntity.x, y: moveY - KinkyDungeonPlayerEntity.y}, sprint);
		}
	}
	if (!cancel.cancelmove) {
		KinkyDungeonPlayerEntity.x = moveX;
		KinkyDungeonPlayerEntity.y = moveY;
	}
	KinkyDungeonSendEvent("playerMove", {
		cancelmove: cancel.cancelmove, // If true, cancels the move
		returnvalue: cancel.returnvalue, // Returns this
		willing: willing, // True if the player triggers it, false if yoinked by tether
		sprint: sprint, // True if faster than usual
		lastX: KinkyDungeonPlayerEntity.lastx,
		lastY: KinkyDungeonPlayerEntity.lasty,
		moveX: moveX,
		moveY: moveY,
	});
	if (!cancel.cancelmove) {
		KDCheckCollideableBullets(KinkyDungeonPlayerEntity, forceHitBullets);
		KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonTrapMoved);
	}
	return cancel.returnvalue;
}

function KDSlip(dir) {
	let maxSlip = 2;
	let maxReached = 0;
	for (let i = 0; i < maxSlip; i++) {
		let newTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		let oldTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
		if ((newTiles.Ice
			|| oldTiles.Ice)
			&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y))
			&& !KinkyDungeonEnemyAt(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y)) {
			KDMovePlayer(KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y, false, true);
			KinkyDungeonHandleStepOffTraps(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonPlayerEntity.x + dir.x, KinkyDungeonPlayerEntity.y + dir.y);
			KinkyDungeonHandleTraps(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true);
			maxReached = i;
		} else {
			i = maxSlip;
		}

	}
	if (maxReached) {
		KinkyDungeonSendActionMessage(10, TextGet("KDSlipIce"), "yellow", maxReached + 1);
		KinkyDungeonSlowMoveTurns = Math.max(KinkyDungeonSlowMoveTurns, 1);
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
	}
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