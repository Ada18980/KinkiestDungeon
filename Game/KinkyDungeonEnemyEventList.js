"use strict";

/**
 * Play is actions enemies do when they are NEUTRAL
 * @type {Record<string, EnemyEvent>}
 */
let KDIntentEvents = {
	"leashFurniture": {
		play: true,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			if (allied) return 0;
			if (!enemy.Enemy.tags.leashing) return 0;
			if (KinkyDungeonFlags.get("Released")) return 0;
			if (KDGameData.PrisonerState == 'jail') return 0;
			if (KinkyDungeonGetRestraintItem("ItemDevices")) return 0;
			if (enemy.playWithPlayer > 0) return 0;
			if (KDSelfishLeash(enemy)) return 0;
			if (KDEnemyHasFlag(enemy, "noHarshPlay")) return 0;
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"]);
			return nearestfurniture && KDistChebyshev(enemy.x - nearestfurniture.x, enemy.y - nearestfurniture.y) < 14 ? (hostile ? 120 : 40) : 0;
		},
		trigger: (enemy, AIData) => {
			KDResetIntent(enemy, AIData);
			enemy.IntentAction = 'leashFurniture';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"]);
			enemy.IntentLeashPoint = nearestfurniture;
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, AIData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 12 + Math.floor(KDRandom() * 12);
			enemy.playWithPlayerCD = 30;
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 7);
			return KDSettlePlayerInFurniture(enemy, AIData);
		},
		maintain: (enemy, delta) => {
			if ((KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && (KDEnemyHasFlag(enemy, "motivated") || KDHostile(enemy)))
				|| KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
				if (enemy.playWithPlayer < 10) {
					enemy.playWithPlayer = 10;
					KDSetPlayCD(enemy, 2.5);
				}// else enemy.playWithPlayer += delta;
			}
			return false;
		},
	},
	"Ignore": {
		nonaggressive: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return 90;
		},
		trigger: (enemy, AIData) => {
		},
	},
	"Play": {
		play: true,
		nonaggressive: true,
		// This is the basic 'it's time to play!' dialogue
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return (KDEnemyHasFlag(enemy, "HelpMe")) ?
				0
				: (!enemy?.playWithPlayer ? (allied ? 10 : 110) : 0);
		},
		trigger: (enemy, AIData) => {
			KDResetIntent(enemy, AIData);
			enemy.playWithPlayer = 8 + Math.floor(KDRandom() * (5 * Math.min(5, Math.max(enemy.Enemy.attackPoints || 0, enemy.Enemy.movePoints || 0))));
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 7);
			KDSetPlayCD(enemy, 3.5);
			if (AIData.domMe) enemy.playWithPlayer = Math.floor(enemy.playWithPlayer * 0.7);
			KDAddThought(enemy.id, "Play", 4, enemy.playWithPlayer);

			let index = Math.floor(Math.random() * 3);
			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			if (AIData.domMe) {
				if (KDIsBrat(enemy))
					suff = "Brat" + suff;
				else
					suff = "Sub" + suff;
			}
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + index).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 12, 3);
		},
	},
	"freeFurniture": {
		// This is called to make an enemy free you from furniture
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return 0;
		},
		trigger: (enemy, AIData) => {
			// n/a
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 100);
		},
		maintain: (enemy, delta, AIData) => {
			if (KinkyDungeonGetRestraintItem("ItemDevices")) {
				if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
					KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
					KDResetIntent(enemy, undefined);
					if (KDGameData.PrisonerState == 'jail' && KDIntentEvents.CaptureJail.weight(enemy, AIData, AIData.allied, AIData.hostile, AIData.aggressive) > 0) {
						KDIntentEvents.CaptureJail.trigger(enemy, {});
					}
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
					if (enemy.playWithPlayer > 0)
						enemy.playWithPlayerCD = Math.max(enemy.playWithPlayer, 30);
					KinkyDungeonSetFlag("Released", 90);
					KinkyDungeonSetFlag("nojailbreak", 15);
				} else {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
				}
				if (enemy.playWithPlayer > 0)
					enemy.playWithPlayer = 12;
				return true;
			}
			return false;
		},
	},
	"Capture": {
		aggressive: true,
		noplay: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return 100;
		},
		trigger: (enemy, AIData) => {
			enemy.playWithPlayer = 0;
		},
	},
	"CaptureJail": {
		// Capture and bring to jail
		aggressive: true,
		nonaggressive: true,
		noplay: true,
		forceattack: true,
		overrideIgnore: true, // Even friendly will do it...
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return hostile && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) && (KinkyDungeonFlags.has("Released")) ?
				((KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"]) && !KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"])) ? 0 : 100)
			: 0;
		},
		trigger: (enemy, AIData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
			enemy.playWithPlayer = 0;
			enemy.IntentAction = 'CaptureJail';
			let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
			enemy.IntentLeashPoint = nj ? nj : Object.assign({type: "jail", radius: 1}, KDMapData.StartPosition);
			if (!nj) KinkyDungeonSetFlag("LeashToPrison", -1, 1);
		},
		maintain: (enemy, delta, AIData) => {
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (KDPlayerLeashed(KinkyDungeonPlayerEntity) && !tethered) {
				enemy.gx = KinkyDungeonPlayerEntity.x;
				enemy.gy = KinkyDungeonPlayerEntity.y;
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
					enemy.IntentLeashPoint = nj ? nj : Object.assign({ type: "jail", radius: 1 }, KDMapData.StartPosition);
					if (!nj)
						KinkyDungeonSetFlag("LeashToPrison", -1, 1);
				}

				enemy.gx = enemy.IntentLeashPoint?.x || KDMapData.StartPosition.y;
				enemy.gy = enemy.IntentLeashPoint?.y || KDMapData.StartPosition.x;
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);

				// TODO add release case based on alliance
			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
		arrive: (enemy, AIData) => {
			if (KDGameData.PrisonerState == 'parole') {
				KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Mistake").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 6, 8);
				KDBreakTether(KinkyDungeonPlayerEntity);
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, AIData);
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				return true;
			}
			AIData.defeat = true;
			KDBreakTether(KinkyDungeonPlayerEntity);
			return false;
		},
	},
	"TempLeash": {
		aggressive: false,
		nonaggressive: true,
		noplay: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return (AIData?.playerDist > 2.99
				&& KinkyDungeonGetRestraintItem("ItemNeck") && KinkyDungeonGetRestraintItem("ItemNeckRestraints")
				&& !KinkyDungeonFlags.has("TempLeashCD")
				&& KDGameData.PrisonerState == 'parole'
				&& KDStrictPersonalities.includes(KDJailPersonality(enemy))
				&& KDEnemyCanTalk(enemy)
				&& !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) ?
				100 // Very high just to test
				: 0;
		},
		trigger: (enemy, AIData) => {
			let duration = 40 + Math.round(KDRandom()*30);
			KinkyDungeonSetFlag("TempLeash", duration);
			KinkyDungeonSetFlag("TempLeashCD", duration*2);
			KinkyDungeonSetFlag("noResetIntent", 12);
			enemy.playWithPlayer = 12;
			enemy.playWithPlayerCD = 40;
			enemy.IntentAction = 'TempLeash';
			KinkyDungeonSendDialogue(enemy,
				TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashTime").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				KDGetColor(enemy), 14, 10);
			KDAddThought(enemy.id, "Play", 7, enemy.playWithPlayer);

		},
		maintain: (enemy, delta, AIData) => {
			if (!KinkyDungeonFlags.has("TempLeash") || !(KinkyDungeonGetRestraintItem("ItemNeck") && KinkyDungeonGetRestraintItem("ItemNeckRestraints"))) {
				enemy.IntentAction = '';
				enemy.IntentLeashPoint = null;
				if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
					KDBreakTether(KinkyDungeonPlayerEntity);
					enemy.playWithPlayer = 0;
					enemy.playWithPlayerCD = 30;
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndNow").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
						KDGetColor(enemy), 7, 10);
				}
			} else {
				if (AIData?.playerDist < 5.5) {
					if (enemy.playWithPlayer < 10 && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						enemy.playWithPlayer = 10;
					}// else enemy.playWithPlayer += delta;
					KinkyDungeonSetFlag("noResetIntentFull", 10);
				}

				// Enemies will still be able to play with you!
				KinkyDungeonSetFlag("overrideleashprotection", 2);

				if (KinkyDungeonFlags.get("TempLeash") == 10) {
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndSoon").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
						KDGetColor(enemy), 7, 7);
				}
				if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
						// Leash the player if they are close
						KinkyDungeonAttachTetherToEntity(4.5, enemy);
						if (KinkyDungeonGetRestraintItem("ItemDevices")) {
							KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
						}
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Leashed").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 5, 10);

						KDAddThought(enemy.id, "Happy", 6, enemy.playWithPlayer);
					}
				} else {
					// We will wander more than usual
					KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
				}

			}
			return false;
		},
	},
	"CaptureDoll": {
		// Capture and bring to dropoff
		aggressive: true,
		nonaggressive: true,
		noplay: true,
		forceattack: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return hostile && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) && (KinkyDungeonFlags.has("Released") && KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"])) ? 200 : 0;
		},
		trigger: (enemy, AIData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
			enemy.playWithPlayer = 0;
			enemy.IntentAction = 'CaptureDoll';
			enemy.IntentLeashPoint = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"]);
		},
		arrive: (enemy, AIData) => {
			if (KDGameData.PrisonerState == 'parole') {
				KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Mistake").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 6, 8);
				KDBreakTether(KinkyDungeonPlayerEntity);
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, AIData);
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				return true;
			}
			AIData.defeat = true;
			KDBreakTether(KinkyDungeonPlayerEntity);
			return false;
		},
	},
	"CaptureDemon": {
		aggressive: true,
		nonaggressive: true,
		noplay: true,
		forceattack: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			return hostile && (enemy.Enemy.tags.leashing && enemy.Enemy.tags.demon) && KDPlayerLeashed(KinkyDungeonPlayerEntity) ? 2000 : 0;
		},
		trigger: (enemy, AIData) => {
			let point = KinkyDungeonGetRandomEnemyPointCriteria((x,y) => {
				return KDistEuclidean(x - enemy.x, y - enemy.y) < 10 && KDistEuclidean(x - KinkyDungeonPlayerEntity.x, y - KinkyDungeonPlayerEntity.y) > 4;
			}, true, false, enemy);
			if (point) {
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				/** Create the portal */
				KDCreateEffectTile(point.x, point.y, {
					name: "Portals/DarkPortal",
				}, 0);

				enemy.playWithPlayer = 0;
				enemy.IntentAction = 'CaptureDemon';
				enemy.IntentLeashPoint = {
					x: point.x,
					y: point.y,
					type: "DemonPortal",
					radius: 1.0,
				};
			}
		},
		maintain: (enemy, delta) => {
			if (!enemy.IntentLeashPoint || !KDEffectTileTags(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y).demonportal || !KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KDResetIntent(enemy, AIData);
				return true;
			}
			return false;
		},
		arrive: (enemy, AIData) => {
			if (!enemy.IntentLeashPoint || !KDEffectTileTags(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y).demonportal || !KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				return false;
			}
			KDResetIntent(enemy, AIData);
			KDBreakTether(KinkyDungeonPlayerEntity);
			AIData.defeat = true;
			KDCustomDefeat = KDEnterDemonTransition;
			return true;
		},
	},
	"leashFurnitureAggressive": {
		noplay: true,
		aggressive: true,
		// This will make the enemy want to leash you
		weight: (enemy, AIData, allied, hostile, aggressive) => {
			if (!enemy.Enemy.tags.leashing) return 0;
			if (KinkyDungeonFlags.get("Released")) return 0;
			if (KDGameData.PrisonerState == 'jail') return 0;
			if (KDSelfishLeash(enemy)) return 0;
			if (KinkyDungeonGetRestraintItem("ItemDevices")) return 0;
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"]);
			return nearestfurniture && KDistChebyshev(enemy.x - nearestfurniture.x, enemy.y - nearestfurniture.y) < 14 ? (hostile ? 120 : (AIData.domMe ? 0 : 40)) : 0;
		},
		trigger: (enemy, AIData) => {
			KDResetIntent(enemy, AIData);
			enemy.IntentAction = 'leashFurnitureAggressive';
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"]);
			enemy.IntentLeashPoint = nearestfurniture;

			KDAddThought(enemy.id, "Jail", 5, 3);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, AIData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			let res = KDSettlePlayerInFurniture(enemy, AIData, ["callGuardJailerOnly"]);
			if (res) {
				for (let e of KDMapData.Entities) {
					if (e.hostile < 9000) e.hostile = 0;
					if (e.attackPoints > 0) e.attackPoints = 0;
					if (!e.ceasefire) e.ceasefire = 1;
				}
				KDGameData.PrisonerState = 'jail';
			}
			return res;
		},
		maintain: (enemy, delta) => {
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5
				|| KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
				if (enemy.playWithPlayer < 10) {
					enemy.playWithPlayer = 10;
				}// else enemy.playWithPlayer += delta;
			}
			return false;
		},
	},
};

/**
 *
 * @param {entity} enemy
 * @param {any} AIData
 */
function KDResetIntent(enemy, AIData) {
	enemy.IntentLeashPoint = null;
	enemy.IntentAction = "";
}

/**
 * Helper function called to leash player to the nearest furniture
 * @param {entity} enemy
 * @param {any} AIData
 * @returns {boolean}
 */
function KDSettlePlayerInFurniture(enemy, AIData, tags, guardDelay = 24) {
	let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"]);
	let tile = KinkyDungeonTilesGet(nearestfurniture.x + "," + nearestfurniture.y);
	let type = tile ? tile.Furniture : undefined;

	let ee = KinkyDungeonEnemyAt(nearestfurniture.x, nearestfurniture.y);
	if (ee && ee != enemy) {
		KDKickEnemy(ee);
	}
	if (enemy.x == nearestfurniture.x && enemy.y == nearestfurniture.y)
		KDMoveEntity(enemy, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, true, undefined, undefined, true);
	KDMovePlayer(nearestfurniture.x, nearestfurniture.y, false);
	if (KinkyDungeonPlayerEntity.x == nearestfurniture.x && KinkyDungeonPlayerEntity.y == nearestfurniture.y) {
		let furn = KDFurniture[type];
		if (furn) {
			KinkyDungeonSetFlag("GuardCalled", guardDelay);
			if (tags) {
				for (let t of tags) {
					KinkyDungeonSetFlag(t, guardDelay + 60);
				}
			}
			let rest = KinkyDungeonGetRestraint(
				{tags: [furn.restraintTag]}, MiniGameKinkyDungeonLevel,
				KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint],
				true,
				"",
				true,
				false,
				false);
			KinkyDungeonAddRestraintIfWeaker(rest, 0, true);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");
			KinkyDungeonMakeNoise(10, nearestfurniture.x, nearestfurniture.y);
		}

		KDResetAllAggro();
		KDResetAllIntents();
		KDBreakTether(KinkyDungeonPlayerEntity);
		return true;
	}
	return false;
}