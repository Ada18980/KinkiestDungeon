"use strict";

let KDHandsfreeChestTypes = ["shadow", "lessershadow", "gold", "robot", "kitty"];

let KDCornerTiles = {
	'A': true,
	'a': true,
	'c': true,
	'o': true,
	'O': true,
	'-': true,
	'=': true,
	'+': true,
	'B': true,
	'M': true,
	'm': true,
	'F': true,
};

/**
 * Updates local tiles such as conveyors
 */
let KDTileUpdateFunctionsLocal: Record<string, (delta: number, X?: number, Y?: number) => void> = {
	"]": (delta, X, Y) => {// Happy Gas!
		if (delta > 0)
			KDDealEnvironmentalDamage(X, Y, 0.5, {
				type: "happygas",
				damage: 0.0,
				time: 0,
				bind: 0,
				distract: 2.5,
			});
	},
	"[": (delta, X, Y) => {// Sleepy Gas!
		if (delta > 0)
			KDDealEnvironmentalDamage(X, Y, 0.5, {
				type: "poison",
				damage: 0.0,
				time: 4,
				bind: 0,
			});
	},
	'z': (_delta, X, Y) => {
		let entity = KinkyDungeonEntityAt(X, Y);
		if (entity) return;
		let mapTile = KinkyDungeonTilesGet(X + "," + Y);
		if (mapTile?.wireType == "AutoDoor_HoldOpen" || mapTile?.wireType == "AutoDoor_HoldClosed") {
			let tags = KDEffectTileTags(X, Y);
			if ((!tags.signal && mapTile.wireType == "AutoDoor_HoldOpen")
				|| (tags.signal && mapTile.wireType == "AutoDoor_HoldClosed")) {
				KinkyDungeonMapSet(X, Y, 'Z');
			}
		}
	},
	'Z': (_delta, X, Y) => {
		let mapTile = KinkyDungeonTilesGet(X + "," + Y);
		if (mapTile?.wireType == "AutoDoor_HoldOpen" || mapTile?.wireType == "AutoDoor_HoldClosed") {
			let tags = KDEffectTileTags(X, Y);
			if ((tags.signal && mapTile.wireType == "AutoDoor_HoldOpen")
				|| (!tags.signal && mapTile.wireType == "AutoDoor_HoldClosed")) {
				KinkyDungeonMapSet(X, Y, 'z');
			}
		}
	},
	"w": (_delta, X, Y) => {
		KDCreateEffectTile(X, Y, {
			name: "Water",
			duration: 2,
		}, 0);
	},
	"W": (_delta, X, Y) => {
		KDCreateEffectTile(X, Y, {
			name: "Water",
			duration: 2,
		}, 0);
	},
	"V": (delta, X, Y) => {
		KDConveyor(delta, X, Y);
	},
	"v": (delta, X, Y) => {
		KDConveyor(delta, X, Y);
	},
	"N": (delta, X, Y) => {
		let tile = KinkyDungeonTilesGet(X + "," + Y);
		let tU = KinkyDungeonTilesGet(X + "," + (Y - 1));
		let tD = KinkyDungeonTilesGet(X + "," + (Y + 1));
		let tR = KinkyDungeonTilesGet((X + 1) + "," + Y);
		let tL = KinkyDungeonTilesGet((X - 1) + "," + Y);

		if (tU?.DY == 1) tile.DY = 1;
		else if (tD?.DY == -1) tile.DY = -1;
		else if (tL?.DX == 1) tile.DX = 1;
		else if (tR?.DX == -1) tile.DX = -1;

		let entity = KinkyDungeonEntityAt(X, Y);
		let BMType = KDBondageMachineFunctions[tile.Binding];

		if (entity) {
			let eligible = false;
			if (entity.player) {
				if (!KinkyDungeonFlags.get("processed")) {
					eligible = BMType.eligible_player(tile, X, Y, entity);
					if (eligible) {
						if (BMType.function_player(tile, delta, X, Y, entity)) return;
					}
				}
			} else if (entity.Enemy?.bound) {
				if (entity.Enemy.tags.prisoner) KDStaggerEnemy(entity);
				if (!KDEnemyHasFlag(entity, "processed")) {
					eligible = BMType.eligible_enemy(tile, X, Y, entity);
					if (eligible) {
						if (BMType.function_enemy(tile, delta, X, Y, entity)) return;
					}
				}
			}
		}

		KDConveyor(delta, X, Y);
	},
	"u": (delta, X, Y) => {
		let tile = KinkyDungeonTilesGet(X + "," + Y);

		if (!tile.cd) tile.cd = 0;
		if (tile.cd <= 0) {
			if (tile.count == undefined || tile.count > 0) {
				// Too many dolls!!!
				if (KDGameData.DollCount > 30) return;
				let nearbyEnemyCount = KDNearbyEnemies(X, Y, 4.5);
				if (nearbyEnemyCount.length > 6) return;
				let start = true;
				let ind = tile.index;
				// Loop through and cycle if needed
				while (start || ind != tile.index) {
					start = false;
					let tx = ind == 0 ? -1 : (ind == 2 ? 1 : 0);
					let ty = ind == 1 ? -1 : (ind == 3 ? 1 : 0);

					// Create a doll on a conveyor if needed
					let entity = KinkyDungeonEntityAt(X + tx, Y + ty);
					let tiletype = KinkyDungeonMapGet(X + tx, Y + ty);
					let tiledest = KinkyDungeonTilesGet((X + tx) + ',' + (Y + ty));
					if ((tiletype == 'V' || tiletype == 'v') && tiledest?.SwitchMode != "Off" && !entity) {
						tile.cd = tile.rate;
						let e = DialogueCreateEnemy(X + tx, Y + ty, tile.dollType || "FactoryDoll");
						KinkyDungeonSetEnemyFlag(e, "conveyed", 1);
						if (tile.count != undefined) tile.count -= 1;
						break;
					}
					ind += 1;
					ind = ind % 4;
				}
				tile.index = ind;
			}
		} else {
			tile.cd -= delta;
		}
	},
	"t": (_delta, X, Y) => {
		// Consume prisoners on the tile
		let entity = KinkyDungeonEntityAt(X, Y);
		if (entity && !entity.player) {
			if (entity.Enemy?.tags.prisoner || KDHelpless(entity)) {
				KDStaggerEnemy(entity);
				if (!KDEnemyHasFlag(entity, "conveyed")) {
					KDClearItems(entity);
					entity.hp = 0;
				}
			} else {
				// kick them out...
				KDKickEnemyLocal(entity);
			}

		} else if (entity?.player && !KinkyDungeonFlags.get("nodollterm")) {
			if (KinkyDungeonFlags.get("conveyed")) {
				KDStartDialog("DollTerminal_Forced", "", true, "");
			} else {
				KDStartDialog("DollTerminal_Step", "", true, "");
			}
		}
	},
};

/**
 * Return value: whether or not to continue to allow peripheral tile updates
 */
let KDBondageMachineFunctions: Record<string, KDBondageMachineFunc> = {
	"Latex": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ['latexEncase', 'latexCatsuits']}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			KDBasicRestraintsMachine_Player(['latexEncase', 'latexCatsuits'], 2, "KDEncasement");
			return false;
		},
		eligible_enemy: (_tile, _x, _y, _entity) => {
			return true;
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			KDTieUpEnemy(entity, 4.0, "Latex", "glue");
			if (KDBoundEffects(entity) > 2 ) {
				KDTieUpEnemy(entity, 4.0, "Latex", "glue");
				KinkyDungeonApplyBuffToEntity(entity, KDEncasedDoll);
			}
			if (KDBoundEffects(entity) < 1 ) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
				KinkyDungeonSetEnemyFlag(entity, "processed", 1);
				return true;
			}
			return false;
		},
	},
	"Metal": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ["hitechCables", "cableGag", "controlHarness"]}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			KDBasicRestraintsMachine_Player(["hitechCables", "cableGag", "controlHarness"], 2, "KDMetalMachine");
			return false;
		},
		eligible_enemy: (_tile, _x, _y, _entity) => {
			return true;
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			KDTieUpEnemy(entity, 4.0, "Metal", "chain");
			if (KDBoundEffects(entity) < 1 ) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
				KinkyDungeonSetEnemyFlag(entity, "processed", 1);
				return true;
			}
			return false;
		},
	},
	"Doll": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ["cyberdollrestraints"]}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			KDBasicRestraintsMachine_Player(["cyberdollrestraints"], 2, "KDDollMachine");
			return false;
		},
		eligible_enemy: (_tile, _x, _y, _entity) => {
			return true;
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			KDTieUpEnemy(entity, 4.0, "Metal", "chain");
			if (KDBoundEffects(entity) < 1 ) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
				KinkyDungeonSetEnemyFlag(entity, "processed", 1);
				return true;
			}
			return false;
		},
	},
	"Tape": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ["autoTape"]}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			KDBasicRestraintsMachine_Player(["autoTape"], 2, "KDTapeMachine");
			return false;
		},
		eligible_enemy: (_tile, _x, _y, _entity) => {
			return true;
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			KDTieUpEnemy(entity, 4.0, "Tape", "glue");
			if (KDBoundEffects(entity) < 1 ) {
				KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
				KinkyDungeonSetEnemyFlag(entity, "processed", 1);
				return true;
			}
			return false;
		},
	},
	"Plug": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ['machinePlug']}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			return KDBasicRestraintsMachine_Player(['machinePlug'], 1, "KDPlugMachine") != 0;
		},
		eligible_enemy: (_tile, _x, _y, entity) => {
			return (entity.boundLevel > 0 || KDEntityGetBuff(entity, "Chastity")) && !(entity.buffs && KinkyDungeonGetBuffedStat(entity.buffs, "Plug") >= 2);
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			if (!KinkyDungeonGetBuffedStat(entity.buffs, "Plug")) {
				KDPlugEnemy(entity);
				if (KinkyDungeonGetBuffedStat(entity.buffs, "Plug") > 0) {
					KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
					KinkyDungeonSetEnemyFlag(entity, "processed", 1);
					return true;
				}
			}
			return false;
		},
	},
	"Chastity": {
		eligible_player: (_tile, _x, _y, _entity) => {
			return KDGetRestraintsEligible({tags: ['machineChastity', 'cyberdollchastity']}, 10, 'grv', false, undefined, undefined, undefined, false).length > 0;
		},
		function_player: (_tile, _delta, _x, _y, _entity) => {
			return KDBasicRestraintsMachine_Player(['machineChastity', 'cyberdollchastity'], 1, "KDChastityMachine") != 0;
		},
		eligible_enemy: (_tile, _x, _y, entity) => {
			return entity.boundLevel > 0 && !KDEntityGetBuff(entity, "Chastity");
		},
		function_enemy: (_tile, _delta, _x, _y, entity) => {
			KDTieUpEnemy(entity, 2.0, "Metal", "chain");
			if (!KDEntityGetBuff(entity, "Chastity")) {
				KinkyDungeonApplyBuffToEntity(entity, KDChastity);
				if (KDEntityGetBuff(entity, "Chastity")) {
					KinkyDungeonSetEnemyFlag(entity, "conveyed", 1);
					KinkyDungeonSetEnemyFlag(entity, "processed", 1);
					return true;
				}
			}
			return false;
		},
	},
};

/**
 * @param tags
 * @param count
 * @param msg
 */
function KDBasicRestraintsMachine_Player(tags: string[], count: number, msg: string) {
	let succ = 0;
	for (let i = 0; i < count; i++) {
		let restraint = KinkyDungeonGetRestraint({tags: tags}, 10, 'grv', false, undefined, undefined, undefined, false,
			undefined, undefined, undefined, undefined, undefined, undefined, undefined, {
				allowLowPower: true,
			}
		);
		if (restraint) {
			succ = KinkyDungeonAddRestraintIfWeaker(restraint, KDGetEffLevel(),false, undefined, undefined, undefined, undefined, "AncientRobot", true) || succ;
		}
	}
	if (succ) {
		KinkyDungeonSetFlag("conveyed", 2);
		KinkyDungeonSetFlag("processed", 3);
		KinkyDungeonSendTextMessage(8, TextGet(msg), "#ffff44", 2);
	}
	return succ;
}

/**
 * Return value: whether or not to continue to allow peripheral tile updates
 */
let KDTileUpdateFunctions: Record<string, (delta: number) => boolean> = {
	"W": (_delta) => { // Happy Gas!
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, KDWaterSlow);
		KinkyDungeonSendTextMessage(5, TextGet("KDWaterIsWet"), "#4fa4b8", 1);
		return true;
	},
	"]": (delta) => { // Happy Gas!
		KinkyDungeonChangeDistraction(1 * delta * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "happygasDamageResist") * 2), false, 0.1);
		KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonHappyGas"), "pink", 1);
		return true;
	},
	"[": (_delta) => { // Happy Gas!
		KinkyDungeonSleepiness = Math.max(KinkyDungeonSleepiness + (2) * KinkyDungeonMultiplicativeStat(KDEntityBuffedStat(KinkyDungeonPlayerEntity, "happygasDamageResist") * 2), 5);
		KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonSporeGas"), "pink", 1);
		return true;
	},
	"L" : (delta) => { // Barrel
		if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)
			&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture) {
			let furn = KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture];
			if (furn) {
				furn.tickFunction(delta);
			}
		} else {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel", type: "SlowDetection", duration: 1, power: 9.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel3", type: "Sneak", duration: 1, power: 1.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel2", type: "SlowLevel", duration: 1, power: 1, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Slow", "move", "cast"]});
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonBarrel"), "lightgreen", 1, true);
		}
		return true;
	},
	"c" : (delta) => { // Unopened chest
		if (KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)
			&& KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture) {
			let furn = KDFurniture[KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).Furniture];
			if (furn) {
				furn.tickFunction(delta);
			}
		} else {
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel", type: "SlowDetection", duration: 1, power: 9.0, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["SlowDetection", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel3", type: "Sneak", duration: 1, power: 1.95, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Sneak", "darkness", "move", "cast"]});
			KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: "barrel2", type: "SlowLevel", duration: 1, power: 1, player: true, enemies: true, endSleep: true, maxCount: 1, tags: ["Slow", "move", "cast"]});
			KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonBarrelChest"), "lightgreen", 1, true);
		}
		return true;
	},
	"?": (_delta) =>  { // High hook
		KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonHookHigh"), "lightgreen", 1, true);
		return true;
	},
	"/": (_delta) =>  { // Low hook
		KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonScrap"), "lightgreen", 1, true);
		return true;
	},
};

/**
 * Return true if movement is stopped
 */
let KDMoveObjectFunctions: Record<string, (moveX: number, moveY: number) => boolean> = {
	'B': (_moveX, _moveY) => {
		/*if (!KinkyDungeonFlags.get("slept") && !KinkyDungeonFlags.get("nobed") && KinkyDungeonStatWill < KinkyDungeonStatWillMax * 0.49) {
			KDGameData.InteractTargetX = moveX;
			KDGameData.InteractTargetY = moveY;
			KDStartDialog("Bed", "", true);
		}*/

		if (!KinkyDungeonFlags.get("1stBed")) {
			KinkyDungeonSendTextMessage(10, TextGet("KDBedHelp"), "#ffffff", 12, undefined, undefined, undefined, "");
			KinkyDungeonSetFlag("1stBed", -1);
		}
		return false;
	},
	'@': (_moveX, _moveY) => {
		if (!KinkyDungeonFlags.get("nobutton")) {
			KDStartDialog("Button", "", true);
		}
		return false;
	},
	'l': (moveX, moveY) => {
		if (!KinkyDungeonFlags.get("noleyline") && KinkyDungeonStatManaPool < KinkyDungeonStatManaPoolMax && KDTile(moveX, moveY) && KDTile(moveX, moveY).Leyline) {
			KDMovePlayer(moveX, moveY, true, false);
			KDStartDialog("Leyline", "", true);
		}
		return false;
	},
	';': (moveX, moveY) => {
		if (!KinkyDungeonFlags.get("noportal") && KDTile(moveX, moveY) && KDTile(moveX, moveY).Portal) {
			KDMovePlayer(moveX, moveY, true, false);
			KDStartDialog(KDTile(moveX, moveY).Portal, "", true);
		}
		return false;
	},
	'D': (moveX, moveY) => { // Open the door
		KDAttemptDoor(moveX, moveY);

		return true;
	},
	'R': (moveX, moveY) => {
		let allowManip = KDAllowUseItems(true);
		if (allowManip) {
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonLoot(MiniGameKinkyDungeonLevel, MiniGameKinkyDungeonCheckpoint, "rubble");

			KinkyDungeonMapSet(moveX, moveY, 'r');
			KinkyDungeonAggroAction('rubble', {});
		} else {
			KinkyDungeonSendActionMessage(6, TextGet("KDCantTouchThat"), "#ff8933",1, false, true);
			return false;
		}

		return true;
	},
	'C': (moveX, moveY) => { // Open the chest
		let chestType = KinkyDungeonTilesGet(moveX + "," +moveY) && KinkyDungeonTilesGet(moveX + "," +moveY).Loot ? KinkyDungeonTilesGet(moveX + "," +moveY).Loot : "chest";
		let allowManip = KDHandsfreeChestTypes.includes(chestType) || KDAllowUseItems(true);
		if (allowManip) {

			let faction = KinkyDungeonTilesGet(moveX + "," +moveY) && KinkyDungeonTilesGet(moveX + "," +moveY).Faction ? KinkyDungeonTilesGet(moveX + "," +moveY).Faction : undefined;
			let noTrap = KinkyDungeonTilesGet(moveX + "," +moveY) && KinkyDungeonTilesGet(moveX + "," +moveY).NoTrap ? KinkyDungeonTilesGet(moveX + "," +moveY).NoTrap : false;
			let lootTrap = KinkyDungeonTilesGet(moveX + "," +moveY) && KinkyDungeonTilesGet(moveX + "," +moveY).lootTrap ? KinkyDungeonTilesGet(moveX + "," +moveY).lootTrap : undefined;
			let roll = KinkyDungeonTilesGet(moveX + "," +moveY) ? KinkyDungeonTilesGet(moveX + "," +moveY).Roll : KDRandom();
			if (faction && !KinkyDungeonChestConfirm) {
				KinkyDungeonChestConfirm = true;
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonChestFaction").replace("FACTION", TextGet("KinkyDungeonFaction" + faction)), "#ff5277", 2, true);
				return true;
			} else {
				if (KDHandsfreeChestTypes.includes(chestType)) {
					KinkyDungeonSendTextMessage(7, TextGet("KDAutoChest"), "#ffffff",1, false, true);
				}
				let data = {
					chestType: chestType,
					roll: roll,
					x: moveX,
					y: moveY,
					tile: KinkyDungeonTilesGet(moveX + "," +moveY),
					noTrap: noTrap,
					level: MiniGameKinkyDungeonLevel,
					index: (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint),
					lootTrap: lootTrap,
					aggro: true,
				};
				KinkyDungeonSendEvent("beforeChest", data);
				if (data.aggro)
					KinkyDungeonAggroAction('chest', {faction: faction, x: moveX, y: moveY});
				chestType = data.chestType;
				roll = data.roll;
				noTrap = data.noTrap;
				lootTrap = data.lootTrap;
				KDMapData.ChestsOpened++;
				// Open container
				KDUI_CurrentContainer = KDGetContainer("Chest", {x: moveX, y: moveY}, KDGetCurrentLocation(),
					true)?.name;

				KinkyDungeonLoot(data.level, data.index, chestType, roll, data.tile, undefined, noTrap, undefined, undefined, KDGameData.Containers[KDUI_CurrentContainer]);
				if (KDUI_CurrentContainer) {
					KDGenerateMinorLoot(chestType, KDGetCurrentLocation(), data.tile, moveX, moveY, KDGameData.Containers[KDUI_CurrentContainer]);
				}
				if (KDUI_CurrentContainer && KDGameData.Containers[KDUI_CurrentContainer]
					&& Object.values(KDGameData.Containers[KDUI_CurrentContainer].items).length > 0) {
					if (KDToggles.Autoloot) {
						let container = KDGameData.Containers[KDUI_CurrentContainer];
						for (let inv of Object.values(container.items)) {
							let q = inv.quantity;
							let suff = "";
							if ((inv.type != Weapon || !KinkyDungeonInventoryGetWeapon(inv.name))) {
								for (let i = 0; i < (q || 1); i++) {
									if (container.items[inv?.name]
										&& (inv.type != Weapon || !KinkyDungeonInventoryGetWeapon(inv.name))
									) {
										let item = KinkyDungeonInventoryGetSafe(inv.name);
										if (!item) {
											item = JSON.parse(JSON.stringify(container.items[inv.name]));
											item.quantity = 1;
											KinkyDungeonInventoryAdd(item);
										} else item.quantity = (item.quantity || 1) + 1;
										if (container.items[inv.name].quantity > 1) {
											container.items[inv.name].quantity -= 1;
										} else {
											delete container.items[inv.name];
										}

									}
								}
							} else if (inv.type == Weapon && KinkyDungeonInventoryGetWeapon(inv.name)) {
								suff = TextGet("KDNotPickedUp");
							}

							KinkyDungeonSendTextMessage(2,
								TextGet("KDAutoLoot") + `${KDGetItemName(inv)} x${inv.quantity || 1}` + suff,
								"#88ff88", 2)
						}
					} else {
						KDUI_ContainerBackScreen = KinkyDungeonDrawState;
						KinkyDungeonDrawState = "Container";
						KinkyDungeonCurrentFilter = "All";
						KDUI_Container_LastSelected = "Chest";
					}
				}
				if (lootTrap) {
					KDMapData.TrapsTriggered++;
					KDTrigPanic(true);
					KDSpawnLootTrap(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, lootTrap.trap, lootTrap.mult, lootTrap.duration);
				}
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/ChestOpen.ogg");
				KinkyDungeonMapSet(moveX, moveY, 'c');
				KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
			}
		} else {
			KinkyDungeonSendActionMessage(6, TextGet("KDCantTouchThat"), "#ff8933",1, false, true);
		}


		return true;
	},
	'Y': (moveX, moveY) => { // Open the chest
		let allowManip = KDAllowUseItems(true);
		if (allowManip) {
			let chestType = (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint) == "lib" ? "shelf" : "rubble";
			KinkyDungeonLoot(MiniGameKinkyDungeonLevel, (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), chestType);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonMapSet(moveX, moveY, 'X');
			KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
		} else {
			KinkyDungeonSendActionMessage(6, TextGet("KDCantTouchThat"), "#ff8933",1, false, true);
		}
		return true;
	},
	'O': (moveX, moveY) => { // Open the chest
		if (KinkyDungeonIsPlayer())
			KinkyDungeonTakeOrb(1, moveX, moveY); // 1 spell point
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
		KDGameData.AlreadyOpened.push({x: moveX, y: moveY});
		return true;
	},
	'P': (moveX, moveY) => { // Open the chest
		if (KinkyDungeonIsPlayer()) {
			KDPerkConfirm = false;
			KinkyDungeonTakePerk(1, moveX, moveY); // 1 perk choice
		}
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");
		return true;
	},
	'-': (_moveX, _moveY) => { // Open the chest
		KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonObjectChargerDestroyed"), "#999999", 1, true);
		return true;
	},
};


/**
 * Return is whether or not something the player should know about happened
 */
let KDEffectTileFunctionsStandalone: Record<string, (delta, tile: effectTile) => boolean> = {
	"Inferno": (_delta, tile) => {
		if (tile.duration > 4 && KDRandom() < 0.3 && !(tile.pauseDuration > 0)) {
			KDCreateAoEEffectTiles(tile.x, tile.y,  {
				name: "Ember",
				duration: 1,
			}, 4, 1.5, undefined, 0.5);
		}
		return true;
	},
	"Vines": (_delta, tile) => {
		KDGrow(tile, "Vines");
		return false;
	},
	"Soap": (_delta, tile) => {
		if (!KDEffectTileTags(tile.x, tile.y).wet) {
			tile.duration = 0;
		}
		return false;
	},
	"SlimeBurning": (_delta, tile) => {
		if (tile.duration > 0 && !(tile.pauseDuration > 0)) {
			KDCreateEffectTile(tile.x, tile.y, {
				name: "Inferno",
				duration: 2,
			}, 1); // Create blaze
			if (KDRandom() < 0.3) {
				KDCreateAoEEffectTiles(tile.x, tile.y,  {
					name: "Ember",
					duration: 1,
				}, 4, 1.5, undefined, 0.5);
			}
		}
		return true;
	},
	"Torch": (_delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"TorchUnlit": (_delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"Lantern": (_delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"LanternUnlit": (_delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"TorchOrb": (_delta, tile) => {
		if (tile.duration > 9000) {
			tile.duration = 9999;
		}
		return true;
	},
	"ManaFull": (_delta, tile) => {
		KDCreateEffectTile(tile.x, tile.y, {
			name: "WireSparks",
			duration: 2,
		}, 0);
		return false;
	},
};

function KDSlimeImmuneEntity(entity: entity) {
	if (entity.player) {
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") >= 0.45) return true;
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).slimeWalk) {
				return true;
			}
		}
	} else return KDSlimeImmune(entity);
}

function KDSoapImmuneEntity(entity: entity) {
	if (entity.player) {
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "soapDamageResist") >= 0.45) return true;
		for (let inv of KinkyDungeonAllRestraint()) {
			if (KDRestraint(inv).soapWalk) {
				return true;
			}
		}
	} else return KDSoapImmune(entity);
}

function KDSlimeWalker(entity: entity) {
	if (KDSlimeImmuneEntity(entity)) return true;
	else if (!entity.player && KDIsFlying(entity)) return true;
	return false;
}

function KDSoapWalker(entity: entity) {
	if (KDSoapImmuneEntity(entity)) return true;
	else if (!entity.player && KDIsFlying(entity)) return true;
	return false;
}

/**
 * @param enemy
 */
function KDSlimeImmune(enemy: entity): boolean {
	return enemy.Enemy?.tags.slime
		//|| KinkyDungeonGetImmunity(enemy.Enemy?.tags, enemy.Enemy?.Resistance?.profile, "glue", "resist")
		|| KinkyDungeonGetImmunity(enemy.Enemy?.tags, enemy.Enemy?.Resistance?.profile, "glue", "immune")
		|| enemy.Enemy?.tags.slimewalk
		|| KDEntityBuffedStat(enemy, "glueDamageResist") >= 0.45;
}
/**
 * @param enemy
 */
function KDSoapImmune(enemy: entity): boolean {
	return enemy.Enemy?.tags.slime
		//|| KinkyDungeonGetImmunity(enemy.Enemy?.tags, enemy.Enemy?.Resistance?.profile, "glue", "resist")
		|| KinkyDungeonGetImmunity(enemy.Enemy?.tags, enemy.Enemy?.Resistance?.profile, "soap", "immune")
		|| enemy.Enemy?.tags.soapwalk
		|| KDEntityBuffedStat(enemy, "soapDamageResist") >= 0.45;
}
/**
 * These happen when stepped on
 * Return is whether or not something the player should know about happened
 */
let KDEffectTileFunctions: Record<string, (delta: number, entity: entity, tile: effectTile) => boolean> = {
	"PressurePlateHold": (_delta, _entity, tile) => {
		KDCreateEffectTile(tile.x, tile.y, {
			name: "WireSparks",
			duration: 2,
		}, 0);
		return false;
	},


	"MotionLamp": (_delta, _entity, tile) => {
		KDCreateEffectTile(tile.x, tile.y, {
			name: "MotionLampLight",
			duration: 12,
		}, 0);
		return false;
	},
	"ManaFull": (_delta, _entity, _tile) => {
		KinkyDungeonSendTextMessage(8, TextGet("KDManaStationCharged"), "#7799ff");
		return false;
	},
	"ManaEmpty": (_delta, entity, tile) => {
		if (entity.player) {
			if (KinkyDungeonStatMana + KinkyDungeonStatManaPool >= 5) {
				KinkyDungeonChangeMana(-5, false, 0, true, true);
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "ManaPartial",
					duration: 9999, infinite: true,
				}, 0);
				KinkyDungeonSendTextMessage(9, TextGet("KDManaStationDrain1"), "#7799ff");
				return true;
			} else {
				KinkyDungeonSendTextMessage(9, TextGet("KDManaStationFail"), "#7799ff");
			}
		}
		return false;
	},
	"ManaPartial": (_delta, entity, tile) => {
		if (entity.player) {
			if (KinkyDungeonStatMana + KinkyDungeonStatManaPool >= 5) {
				KinkyDungeonChangeMana(-5, false, 0, true, true);
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "ManaFull",
					duration: 9999, infinite: true,
				}, 0);
				KinkyDungeonSendTextMessage(9, TextGet("KDManaStationDrain2"), "#7799ff");
				return true;
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KDManaStationFail"), "#7799ff");
			}
		}

		return false;
	},

	"PressurePlate": (_delta, _entity, tile) => {
		let tags = KDEffectTileTags(tile.x, tile.y);
		if (!tags.ppactive) {
			KDCreateEffectTile(tile.x, tile.y, {
				name: "WireSparks",
				duration: 2,
			}, 0);
		}
		KDCreateEffectTile(tile.x, tile.y, {
			name: "PressurePlateActive",
			duration: 2,
		}, 0);
		return false;
	},
	"PressurePlateOneUse": (_delta, _entity, tile) => {
		KDCreateEffectTile(tile.x, tile.y, {
			name: "WireSparks",
			duration: 2,
		}, 0);
		tile.duration = 0;
		return false;
	},
	"SlimeBurning": (_delta, entity, tile) => {
		if (!KDEntityHasBuff(entity, "Drenched")) {
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				if (KinkyDungeonVisionGet(tile.x, tile.y) > 0.5 && !KinkyDungeonFlags.get("1stLatex")) {
					KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp2"), "#ffffff", 12, undefined, undefined, undefined, "");
					KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp1"), "#ffffff", 12, undefined, undefined, undefined, "");
					KinkyDungeonSetFlag("1stLatex", -1);
				}
				KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
				return true;
			}
		}
		return false;
	},
	"Slime": (_delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!KDEntityHasBuff(entity, "Drenched")) {
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				if (KinkyDungeonVisionGet(tile.x, tile.y) > 0.5 && !KinkyDungeonFlags.get("1stLatex")) {
					KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp2"), "#ffffff", 12, undefined, undefined, undefined, "");
					KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp1"), "#ffffff", 12, undefined, undefined, undefined, "");
					KinkyDungeonSetFlag("1stLatex", -1);
				}
				KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
				return true;
			}
		}
		return false;
	},
	"Glue": (_delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!KDEntityHasBuff(entity, "Drenched")) {
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				KinkyDungeonApplyBuffToEntity(entity, KDSlimed, {
					aurasprite: "Glued",
				});
				return true;
			}
		}
		return false;
	},
	"Latex": (_delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else {
			let result = false;
			// Latex slimes entities that are on it
			let slimeWalker = KDSlimeWalker(entity);
			if (!slimeWalker) {
				if (!KDEntityHasBuff(entity, "Drenched")) {
					if (KinkyDungeonVisionGet(tile.x, tile.y) > 0.5 && !KinkyDungeonFlags.get("1stLatex")) {
						KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp2"), "#ffffff", 12, undefined, undefined, undefined, "");
						KinkyDungeonSendTextMessage(10, TextGet("KDLatexHelp1"), "#ffffff", 12, undefined, undefined, undefined, "");
						KinkyDungeonSetFlag("1stLatex", -1);
					}
					KinkyDungeonApplyBuffToEntity(entity, KDSlimed);
					result = true;
				}
			}
			// Latex also constantly applies binding
			if (result) { //  || KDEntityBuffedStat(entity, "SlimeProgress")
				if (entity.player) {
					let latexData = {
						cancelDamage: false,
						dmg: KDLatexDmg*KDGetEnvironmentalDmg(),
						type: "glue",
					};
					KinkyDungeonSendEvent("tickLatexPlayer", latexData);
					if (!latexData.cancelDamage)
						KinkyDungeonDealDamage({damage: latexData.dmg*KDGetEnvironmentalDmg(), type: latexData.type});
				} else if (KDCanBind(entity)) {
					let latexData = {
						cancelDamage: entity.boundLevel > entity.Enemy.maxhp + KDLatexBind,
						enemy: entity,
						dmg: 0,
						bind: KDLatexBind*KDGetEnvironmentalDmg(),
						type: "glue",
					};
					KinkyDungeonSendEvent("tickLatex", latexData);
					if (!latexData.cancelDamage) {
						KinkyDungeonDamageEnemy(entity, {
							type: "glue",
							damage: 0,
							bind: KDLatexBind*KDGetEnvironmentalDmg(),
							flags: ["DoT"]
						}, false, true, undefined, undefined, undefined, "Rage");
						if (entity.boundLevel >= entity.Enemy.maxhp) {
							KinkyDungeonApplyBuffToEntity(entity, KDEncased);
						}
					}
				}
				return true;
			}
		}
		return false;
	},
	"Bubble": (_delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else {
			// Latex slimes entities that are on it
			let slimeWalker = KDSoapImmuneEntity(entity);
			if (!slimeWalker) {
				if (!KDEntityHasBuff(entity, "WaterBubble")) {
					KDApplyBubble(entity, 4, KDGetEnvironmentalDmg() * KDBubbleDmg);
					return true;
				}
			}
		}
		return false;
	},
	"LiquidMetal": (_delta, entity, tile) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else {
			let result = (entity.player && !(KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "glueDamageResist") >= 0.75))
			|| (!entity.player && !entity.Enemy.tags?.metal);
			let slimeWalker = entity.player && KDSlimeWalker(entity);
			if (!slimeWalker) {
				result = true;
			}
			// Liquid Metal also constantly applies binding
			if (result || KDEntityBuffedStat(entity, "SlimeProgress")) {
				if (entity.player) {
					let latexData = {
						cancelDamage: false,
						dmg: 1.25*KDLatexDmg*KDGetEnvironmentalDmg(),
						type: "glue",
						bindType: "Metal",
					};
					KinkyDungeonSendEvent("tickLatexPlayer", latexData);
					if (!latexData.cancelDamage)
						KinkyDungeonPlayerEffect(entity, "glue", {name: "LiquidMetalPatch", power: 2, count: 1, damage: "glue"}, undefined, undefined, undefined, undefined);
				} else if (KDCanBind(entity)) {
					let latexData = {
						cancelDamage: entity.boundLevel > entity.Enemy.maxhp + KDLatexBind,
						enemy: entity,
						dmg: 0,
						bind: 1.25*KDLatexBind*KDGetEnvironmentalDmg(),
						type: "glue",
						bindType: "Metal",
					};
					KinkyDungeonSendEvent("tickLatex", latexData);
					if (!latexData.cancelDamage) {
						KinkyDungeonDamageEnemy(entity, {
							type: "glue",
							damage: 0,
							bindType: "Metal",
							bind: 1.25*KDLatexBind*KDGetEnvironmentalDmg(),
							flags: ["DoT"]
						}, false, true, undefined, undefined, undefined, "Rage");
						if (entity.boundLevel >= entity.Enemy.maxhp) {
							KinkyDungeonApplyBuffToEntity(entity, KDEncasedMetal);
						}
					}
				}
				return true;
			}
		}

		if (entity.player && KinkyDungeonPlayerBuffs.Slipping && !KinkyDungeonFlags.get("slipped")) {
			KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
			KinkyDungeonSetFlag("slipped", 1);
		}
		return true;
	},
	"Ice": (_delta, entity, _tile) => {
		if ((!entity.player && !entity.Enemy.tags.ice && !entity.Enemy.tags.nofreeze) || (entity.player && !KDChillWalk(entity)))
			KinkyDungeonApplyBuffToEntity(entity, KDChilled);
		if (entity.player && KinkyDungeonPlayerBuffs.Slipping && !KinkyDungeonFlags.get("slipped")) {
			KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
			KinkyDungeonSetFlag("slipped", 1);
		}
		return true;
	},
	"Soap": (_delta, entity, _tile) => {
		if (entity.player && KinkyDungeonPlayerBuffs.Slipping && !KinkyDungeonFlags.get("slipped")) {
			KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
			KinkyDungeonSetFlag("slipped", 1);
		}
		return true;
	},
	"Water": (_delta, entity, tile) => {
		if (tile.pauseSprite == tile.name + "Frozen") {
			if (entity.player && KinkyDungeonPlayerBuffs.Slipping && !KinkyDungeonFlags.get("slipped")) {
				KDSlip({x: KinkyDungeonPlayerEntity.x - KinkyDungeonPlayerEntity.lastx, y: KinkyDungeonPlayerEntity.y - KinkyDungeonPlayerEntity.lasty});
				KinkyDungeonSetFlag("slipped", 1);
			}
		} else if (KDWettable(entity)) {
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched);
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched2);
			KinkyDungeonApplyBuffToEntity(entity, KDDrenched3);
		}
		return true;
	},
	"Inferno": (delta, entity, _tile) => {
		if (entity.player) {
			KinkyDungeonDealDamage({
				type: "fire",
				damage: 1*KDGetEnvironmentalDmg(),
				time: 0,
				bind: 0,
				flags: ["BurningDamage"]
			});
			KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonInfernoBurn"), "#ff5277", 2);
		} else {
			KinkyDungeonDamageEnemy(entity, {
				type: "fire",
				damage: 1*KDGetEnvironmentalDmg(),
				time: 0,
				bind: 0,
				flags: ["BurningDamage"]
			}, false, true, undefined, undefined, undefined);
		}
		if (KDEntityHasBuff(entity, "Drenched")) {
			KDEntityGetBuff(entity, "Drenched").duration = Math.max(0, KDEntityGetBuff(entity, "Drenched").duration - 4 * delta);
		}
		return true;
	},
};

/**
 * Return is whether or not something the player should know about happened
 */
let KDEffectTileCreateFunctionsCreator: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean> = {
	"Ropes": (newTile, existingTile) => {
		KDInferno(newTile, existingTile, 4);
		return true;
	},
	"Gunpowder": (newTile, existingTile) => {
		KDInferno(newTile, existingTile, 20);
		return true;
	},
	"Vines": (newTile, existingTile) => {
		KDInferno(newTile, existingTile, 6);
		return true;
	},
	"Ice": (newTile, existingTile) => {
		if (existingTile.tags.includes("freezeover")) {
			existingTile.pauseDuration = newTile.duration;
			existingTile.pauseSprite = existingTile.name + "Frozen";
		} else if (existingTile.tags.includes("hot")) {
			newTile.duration = 0;
		} else if (existingTile.tags.includes("conductcold")) {
			KDCreateEffectTile(existingTile.x + 1, existingTile.y, {
				name: "Chill",
				duration: 2,
			}, 2);
		}
		return true;
	},
	"Slime": (newTile, existingTile) => {
		if (existingTile.tags.includes("ice")) {
			newTile.pauseDuration = newTile.duration;
			newTile.pauseSprite = newTile.name + "Frozen";
		} else if (existingTile.tags.includes("ignite")) {
			newTile.duration = 0;
			KDCreateEffectTile(newTile.x, newTile.y, {
				name: "SlimeBurning",
				duration: existingTile.duration/2,
			}, 0);
		}
		return true;
	},
	"Latex": (_newTile, existingTile) => {
		if (existingTile.tags.includes("slime")) {
			existingTile.duration = 0;
		}
		return true;
	},
	"LiquidMetal": (_newTile, existingTile) => {
		if (existingTile.tags.includes("slime") || existingTile.tags.includes("latex")) {
			existingTile.duration = 0;
		}
		return true;
	},
	"Water": (newTile, existingTile) => {
		if (existingTile.tags.includes("ice")) {
			newTile.pauseDuration = newTile.duration;
			newTile.pauseSprite = newTile.name + "Frozen";
		}
		return true;
	},
	"Ember": (newTile, existingTile) => {
		if (existingTile.tags.includes("fire")) {
			newTile.pauseDuration = existingTile.duration;
			newTile.pauseSprite = newTile.name;
		}
		return true;
	},
	"Sparks": (_newTile, existingTile) => {
		if (existingTile.tags.includes("conductive")) {
			let rt = KDEffectTileTags(existingTile.x + 1, existingTile.y);
			let lt = KDEffectTileTags(existingTile.x - 1, existingTile.y);
			let ut = KDEffectTileTags(existingTile.x, existingTile.y - 1);
			let dt = KDEffectTileTags(existingTile.x, existingTile.y + 1);
			let dmg = {
				type: "electric",
				damage: 2.0,
				time: 0,
				bind: 0,
				flags: ["EchoDamage"],
			};
			if (!rt.electric && rt.conductive) {
				KDCreateEffectTile(existingTile.x + 1, existingTile.y, {
					name: "Sparks",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x + 1, existingTile.y, 0.5, dmg, undefined);
			}
			if (!lt.electric && lt.conductive) {
				KDCreateEffectTile(existingTile.x - 1, existingTile.y, {
					name: "Sparks",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x - 1, existingTile.y, 0.5, dmg, undefined);
			}
			if (!dt.electric && dt.conductive) {
				KDCreateEffectTile(existingTile.x, existingTile.y + 1, {
					name: "Sparks",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x, existingTile.y + 1, 0.5, dmg, undefined);
			}
			if (!ut.electric && ut.conductive) {
				KDCreateEffectTile(existingTile.x, existingTile.y - 1, {
					name: "Sparks",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x, existingTile.y - 1, 0.5, dmg, undefined);
			}
		}
		return true;
	},
	"Chill": (_newTile, existingTile) => {
		if (existingTile.tags.includes("conductcold")) {
			let rt = KDEffectTileTags(existingTile.x + 1, existingTile.y);
			let lt = KDEffectTileTags(existingTile.x - 1, existingTile.y);
			let ut = KDEffectTileTags(existingTile.x, existingTile.y - 1);
			let dt = KDEffectTileTags(existingTile.x, existingTile.y + 1);
			let dmg = {
				type: "frost",
				damage: 0.5,
				time: 4,
				bind: 0,
				flags: ["EchoDamage"],
			};
			if (!rt.chill && rt.conductcold) {
				KDCreateEffectTile(existingTile.x + 1, existingTile.y, {
					name: "Chill",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x + 1, existingTile.y, 0.5, dmg, undefined);
			}
			if (!lt.chill && lt.conductcold) {
				KDCreateEffectTile(existingTile.x - 1, existingTile.y, {
					name: "Chill",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x - 1, existingTile.y, 0.5, dmg, undefined);
			}
			if (!dt.chill && dt.conductcold) {
				KDCreateEffectTile(existingTile.x, existingTile.y + 1, {
					name: "Chill",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x, existingTile.y + 1, 0.5, dmg, undefined);
			}
			if (!ut.chill && ut.conductcold) {
				KDCreateEffectTile(existingTile.x, existingTile.y - 1, {
					name: "Chill",
					duration: 2,
				}, 2);
				KDDealEnvironmentalDamage(existingTile.x, existingTile.y - 1, 0.5, dmg, undefined);
			}
		}
		return true;
	},
	"WireSparks": (newTile, existingTile) => {
		// Wire => takes both input and output
		// Wireout => only outputs signal, does not conduct
		if (existingTile.tags.includes("wire")
			|| existingTile.tags.includes("wireout") || newTile.data?.force) {
			let mapTile = KinkyDungeonTilesGet(newTile.x + ',' + newTile.y);
			if (mapTile?.wireType) {
				if (KDActivateMapTile[mapTile.wireType](mapTile, newTile.x, newTile.y)) {
					return true;
				}
			}

			let rt = KDEffectTileTags(existingTile.x + 1, existingTile.y);
			let lt = KDEffectTileTags(existingTile.x - 1, existingTile.y);
			let ut = KDEffectTileTags(existingTile.x, existingTile.y - 1);
			let dt = KDEffectTileTags(existingTile.x, existingTile.y + 1);
			if (!rt.signalFrame && (rt.wire || rt.wireend) && !rt.vert && !existingTile.tags?.includes("vert")) {
				KDCreateEffectTile(existingTile.x + 1, existingTile.y, {
					name: "WireSparksAct",
					duration: 1,
				}, 0);
				KDCreateEffectTile(existingTile.x + 1, existingTile.y, {
					name: "WireSparks",
					duration: 2,
				}, 0);
			}
			if (!lt.signalFrame && (lt.wire || lt.wireend) && !lt.vert && !existingTile.tags?.includes("vert")) {
				KDCreateEffectTile(existingTile.x - 1, existingTile.y, {
					name: "WireSparksAct",
					duration: 1,
				}, 0);
				KDCreateEffectTile(existingTile.x - 1, existingTile.y, {
					name: "WireSparks",
					duration: 2,
				}, 0);
			}
			if (!dt.signalFrame && (dt.wire || dt.wireend) && !dt.horiz && !existingTile.tags?.includes("horiz")) {
				KDCreateEffectTile(existingTile.x, existingTile.y + 1, {
					name: "WireSparksAct",
					duration: 1,
				}, 0);
				KDCreateEffectTile(existingTile.x, existingTile.y + 1, {
					name: "WireSparks",
					duration: 2,
				}, 0);
			}
			if (!ut.signalFrame && (ut.wire || ut.wireend) && !ut.horiz && !existingTile.tags?.includes("horiz")) {
				KDCreateEffectTile(existingTile.x, existingTile.y - 1, {
					name: "WireSparksAct",
					duration: 1,
				}, 0);
				KDCreateEffectTile(existingTile.x, existingTile.y - 1, {
					name: "WireSparks",
					duration: 2,
				}, 0);
			}
		}
		return true;

	},
};

/**
 * Return is whether or not something the player should know about happened
 * Return type is whether or not the signal should stop (true) or pass (false)
 */
let KDActivateMapTile: Record<string, (tile: any, x: number, y: number) => boolean> = {
	"increment": (tile, _x, _y) => {
		if (!tile.count) tile.count = 0;
		tile.count += 1;
		return false;
	},
	"AutoDoor_Toggle": (_tile, x, y) => {
		let entity = KinkyDungeonEntityAt(x, y);
		if (entity) return true;

		if (KinkyDungeonMapGet(x, y) == 'Z')
			KinkyDungeonMapSet(x, y, 'z');
		else
			KinkyDungeonMapSet(x, y, 'Z');
		return false;
	},
	"Conveyor_Toggle": (tile, _x, _y) => {
		if (tile.SwitchMode == "Off") tile.SwitchMode = "On";
		else tile.SwitchMode = "Off";
		return false;
	},
	"Conveyor_Switch": (tile, _x, _y) => {
		if (tile.DX) tile.DX *= -1;
		else if (tile.DY) tile.DY *= -1;
		return false;
	},
	"AutoDoor_HoldOpen": (_tile, x, y) => {
		KinkyDungeonMapSet(x, y, 'z');
		return false;
	},
	"AutoDoor_HoldClosed": (_tile, x, y) => {
		let entity = KinkyDungeonEntityAt(x, y);
		if (entity) return false;

		KinkyDungeonMapSet(x, y, 'Z');
		return false;
	},
	"AutoDoor_Open": (_tile, x, y) => {
		KinkyDungeonMapSet(x, y, 'z');
		return false;
	},
	"AutoDoor_Close": (_tile, x, y) => {
		let entity = KinkyDungeonEntityAt(x, y);
		if (entity) return false;

		KinkyDungeonMapSet(x, y, 'Z');
		return false;
	},

};

/**
 * Return is whether or not something the player should know about happened
 */
let KDEffectTileCreateFunctionsExisting: Record<string, (newTile: effectTile, existingTile: effectTile) => boolean> = {
	"Ropes": (newTile, existingTile) => {
		KDInferno(existingTile, newTile, 4);
		return true;
	},
	"Gunpowder": (newTile, existingTile) => {
		KDInferno(existingTile, newTile, 20);
		return true;
	},
	"Vines": (newTile, existingTile) => {
		KDInferno(existingTile, newTile, 6);
		return true;
	},
	"TorchUnlit": (newTile, existingTile) => {
		if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Torch",
				duration: 9999, infinite: true,
			}, 0);
		}
		return true;
	},
	"Sack": (newTile, existingTile) => {
		if (newTile?.tags?.includes("snuffable")) {
			newTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: newTile.name + "Unlit",
				duration: 9999, infinite: true,
			}, 0);
		} else if (newTile?.tags?.includes("fire") || newTile?.tags?.includes("ignite")) {
			existingTile.duration = 0;
		}
		return true;
	},
	"Torch": (newTile, existingTile) => {
		if (newTile.tags.includes("freeze")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "TorchUnlit",
				duration: 9999, infinite: true,
			}, 0);
		}
		return true;
	},
	"Latex": (newTile, _existingTile) => {
		if (newTile.tags.includes("slime")) {
			newTile.duration = 0;
		}
		return true;
	},
	"LiquidMetal": (newTile, _existingTile) => {
		if (newTile.tags.includes("slime") || newTile.tags.includes("latex")) {
			newTile.duration = 0;
		}
		return true;
	},
	"LanternUnlit": (newTile, existingTile) => {
		if (newTile.tags.includes("fire") || newTile.tags.includes("ignite")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Lantern",
				duration: 9999, infinite: true,
			}, 0);
		}
		return true;
	},
	"SlimeBurning": (newTile, existingTile) => {
		if (newTile.tags.includes("ice") || newTile.tags.includes("water")) {
			existingTile.duration = 0;
			KDCreateEffectTile(existingTile.x, existingTile.y, {
				name: "Slime",
				duration: existingTile.duration*2,
			}, 0);
		}
		return true;
	},
};

/**
 * Return is whether or not the move should be interrupted
 */
let KDEffectTileMoveOnFunctions: Record<string, (entity: entity, tile: effectTile, willing: boolean, dir: { x: number, y: number }, sprint: boolean) => {cancelmove: boolean, returnvalue: boolean}> = {
	"Cracked": (entity, tile, _willing, _dir, _sprint) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!entity.Enemy || (!entity.Enemy.tags.earth && !entity.Enemy.tags.unstoppable)) {
			KinkyDungeonApplyBuffToEntity(entity, KDUnsteady);
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady2);
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady3);
			} else if (!entity.Enemy || !entity.Enemy.tags.unflinching) {
				if (!entity.vulnerable) entity.vulnerable = 1;
				else entity.vulnerable = Math.max(entity.vulnerable, 1);
			}
		}
		return {cancelmove: false, returnvalue: false};
	},

	"Rubble": (entity, tile, _willing, _dir, _sprint) => {
		if (tile.pauseDuration > 0) {
			// Meep
		} else if (!entity.Enemy || (!entity.Enemy.tags.earth && !entity.Enemy.tags.unstoppable)) {
			KinkyDungeonApplyBuffToEntity(entity, KDUnsteady);
			if (entity.player) {
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady2);
				KinkyDungeonApplyBuffToEntity(entity, KDUnsteady3);
			} else if (!entity.Enemy || !entity.Enemy.tags.unflinching) {
				if (!entity.vulnerable) entity.vulnerable = 1;
				else entity.vulnerable = Math.max(entity.vulnerable, 1);
			}
		}
		return {cancelmove: false, returnvalue: false};
	},
	"LiquidMetal": (entity, _tile, willing, dir, sprint) => {
		if (sprint && entity.player && willing && (dir.x || dir.y) && !KinkyDungeonFlags.get("slipped")) {
			KDSlip(dir);
			KinkyDungeonSetFlag("slipped", 1);
			return {cancelmove: true, returnvalue: true};
		}
		return {cancelmove: false, returnvalue: false};
	},
	"Ice": (entity, _tile, willing, dir, sprint) => {
		if (sprint && entity.player && willing && (dir.x || dir.y) && !KinkyDungeonFlags.get("slipped")) {
			KDSlip(dir);
			KinkyDungeonSetFlag("slipped", 1);
			return {cancelmove: true, returnvalue: true};
		}
		return {cancelmove: false, returnvalue: false};
	},
	"Soap": (entity, _tile, willing, dir, sprint) => {
		if (sprint && entity.player && willing && (dir.x || dir.y) && !KinkyDungeonFlags.get("slipped")) {
			KDSlip(dir);
			KinkyDungeonSetFlag("slipped", 1);
			return {cancelmove: true, returnvalue: true};
		}
		return {cancelmove: false, returnvalue: false};
	},
	"Water": (entity, tile, willing, dir, sprint) => {
		if (tile.pauseSprite == tile.name + "Frozen") {
			if (sprint && entity.player && willing && (dir.x || dir.y) && !KinkyDungeonFlags.get("slipped")) {
				KDSlip(dir);
				KinkyDungeonSetFlag("slipped", 1);
				return {cancelmove: true, returnvalue: true};
			}
		}
		return {cancelmove: false, returnvalue: false};
	},
};


/**
 * Return is idk
 */
let KDEffectTileBulletFunctions: Record<string, (b, tile: effectTile, d) => boolean> = {
	"Ropes": (b, tile, d) => {
		KDIgnition(b, tile, d);
		return true;
	},
	"Gunpowder": (b, tile, d) => {
		KDIgnition(b, tile, d);
		return true;
	},
	"Vines": (b, tile, d) => {
		KDIgnition(b, tile, d);
		return true;
	},
	"SlimeBurning": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (type == "soap") {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Bubble",
					duration: 2,
				}, 3);
			} else
			if (KDSlimeExtinguishTypes.includes(type)) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Slime",
					duration: tile.duration*2,
				}, 0); // Put out fire
				tile.duration = 0;
			}
		}
		return true;
	},
	"Slime": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (type == "soap") {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Bubble",
					duration: 2,
				}, 3);
			} else
			if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "SlimeBurning",
					duration: tile.duration*0.5,
				}, 0); // Put out lantern
				tile.duration = 0;
			}
		}
		return true;
	},
	"Ember": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (type == "stun" && b.bullet.damage.damage > 1) {
				let newT = KDCreateEffectTile(tile.x, tile.y, {
					name: "Inferno",
					duration: 5,
				}, 5); // Create blaze
				if (newT)
					tile.pauseDuration = newT.duration;
			} else if ((type == "ice" || type == "frost" || type == "soap")) {
				tile.duration = 0;
				KDSmokePuff(tile.x, tile.y, 1.5, 0.1, true);
			}
		}
		return true;
	},
	"Glue": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (type == "soap" || type == "acid") {
				tile.duration = 0;
				//KDSmokePuff(tile.x, tile.y, 1.5, 0.1, true);
			}
		}
		return true;
	},
	"Torch": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (KDTorchExtinguishTypes.includes(type)) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "TorchUnlit",
					duration: 9999, infinite: true,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"TorchUnlit": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type))) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Torch",
					duration: 9999, infinite: true,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"Lantern": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if (KDTorchExtinguishTypes.includes(type)) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "LanternUnlit",
					duration: 9999, infinite: true,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"LanternUnlit": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type))) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Lantern",
					duration: 9999, infinite: true,
				}, 0); // Put out lantern
			}
		}
		return true;
	},
	"Ice": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((KDIgnitionSources.includes(type)) && b.bullet.damage.damage > 0) {
				tile.duration = 0;
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Water",
					duration: 2,
				}, 5); // Create water
			} else if ((type == "ice" || type == "frost") && tile.duration < 4 && tile.duration > 0) {
				tile.duration = 4;
			}
		}
		return true;
	},
	"Water": (b, tile, _d) => {
		if (b.bullet.damage) {
			let type = b.bullet.damage.type;
			if ((type == "ice" || type == "frost")) {
				KDCreateEffectTile(tile.x, tile.y, {
					name: "Ice",
					duration: 3,
				}, 1); // Create ice
			} else {
				if (type == "fire" && b.bullet.damage.damage > 0) {
					tile.duration = 0;
					KDSmokePuff(tile.x, tile.y, 1.5, 0.1, true);
					KDCreateAoEEffectTiles(tile.x, tile.y, {
						name: "Steam",
						duration: 6,
					}, 2, 2.5, undefined, 0.75);
				}
				if (type == "electric" && b.bullet.damage.damage > 0) {
					KDCreateEffectTile(tile.x, tile.y, {
						name: "Sparks",
						duration: 3,
					}, 1); // Create sparks
				}
			}
		}
		return true;
	},
};


let KDStairsAltAction = {
	"RandomTeleport": (_toTile, _suppressCheckPoint) => {
		// Delete the stairs and teleport the player to a random location on another set of stairs
		KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '2');
		delete KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction;
		let point = KinkyDungeonGetRandomEnemyPointCriteria((x: number, y: number) => {
			return KinkyDungeonMapGet(x, y) == 's'
				&& KinkyDungeonTilesGet(x + "," + y)?.AltStairAction == "RandomTeleport";
		}, false, false, undefined, undefined, undefined, true);
		if (point) {
			KDMovePlayer(point.x, point.y, false);
			KinkyDungeonMapSet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, '2');
			delete KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y).AltStairAction;

			KinkyDungeonSendTextMessage(10, TextGet("KDRandomStairTeleport"), "#ff5555", 5);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Teleport.ogg");
		} else {
			KinkyDungeonSendTextMessage(10, TextGet("KDRandomStairTeleportFail"), "#ff5555", 5);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Teleport.ogg");
		}
	},
	"Null": (_toTile, _suppressCheckPoint) => {
		// Beep
	}
};

function KDAttemptDoor(moveX: number, moveY: number) {
	KinkyDungeonAdvanceTime(1, true);
	let open = !KinkyDungeonStatsChoice.get("Doorknobs") || !KinkyDungeonIsHandsBound(true, true, 0.45);
	if (!open) {
		if (KinkyDungeonCanUseFeet(false)) {
			KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobFeet"), "#88ff88", 2);
			open = true;
		} else {
			let grace = 0;
			if (KinkyDungeonFlags.get("failUnfairFirst") && !KinkyDungeonFlags.get("failUnfair")) grace = 0.4;
			let armsbound = KinkyDungeonIsArmsBound(true, true);
			if (KDRandom() - grace < (armsbound ? KDDoorKnobChance : KDDoorKnobChanceArms)) {
				KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobSuccess" + ((armsbound) ? "" : "Arms")), "#88ff88", 2);
				open = true;
			} else if (KDRandom() - grace < (armsbound ? KDDoorAttractChance : KDDoorAttractChanceArms) && DialogueBringNearbyEnemy(moveX, moveY, 10, true)) {
				KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobAttract" + ((armsbound) ? "" : "Arms")), "#ff5555", 2);
				KinkyDungeonMakeNoise(armsbound ? 6 : 3, moveX, moveY);
				open = true;
			} else {
				KinkyDungeonSendActionMessage(10, TextGet("KDDoorknobFail" + (armsbound ? "" : "Arms")), "#ff5555", 2);
				KinkyDungeonMakeNoise(armsbound ? 6 : 3, moveX, moveY);
				if (!KinkyDungeonFlags.get("failUnfairFirst")) {
					KinkyDungeonSetFlag("failUnfair", 5);
					KinkyDungeonSetFlag("failUnfairFirst", 10);
				}
				if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Locked.ogg");
			}
		}
	}
	if (open) {
		KinkyDungeonMapSet(moveX, moveY, 'd');

		// For private doors, aggro the faction
		let faction = KinkyDungeonTilesGet(moveX + "," +moveY) && KinkyDungeonTilesGet(moveX + "," +moveY).Faction ? KinkyDungeonTilesGet(moveX + "," +moveY).Faction : undefined;
		if (faction) {
			KinkyDungeonAggroFaction(faction, true);
		}

		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/DoorOpen.ogg");
	}
}
