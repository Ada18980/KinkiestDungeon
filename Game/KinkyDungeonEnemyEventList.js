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
			KDSetPlayCD(enemy, 2);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (enemy.Enemy.playLine ? enemy.Enemy.playLine : "");
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
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && (KDEnemyHasFlag(enemy, "motivated") || KDHostile(enemy))) {
				if (enemy.playWithPlayer < 10) {
					enemy.playWithPlayer = 10;
					KDSetPlayCD(enemy, 1.5);
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
			KDSetPlayCD(enemy, 2.5);
			if (AIData.domMe) enemy.playWithPlayer = Math.floor(enemy.playWithPlayer * 0.7);
			KDAddThought(enemy.id, "Play", 4, enemy.playWithPlayer);

			let index = Math.floor(Math.random() * 3);
			let suff = (enemy.Enemy.playLine ? enemy.Enemy.playLine : "");
			if (AIData.domMe) {
				if (KDIsBrat(enemy))
					suff = "Brat" + suff;
				else
					suff = "Sub" + suff;
			}
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + index).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
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
		maintain: (enemy, delta) => {
			if (KinkyDungeonGetRestraintItem("ItemDevices")) {
				if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
					KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
					KDResetIntent(enemy, undefined);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
					if (enemy.playWithPlayer > 0)
						enemy.playWithPlayerCD = Math.max(enemy.playWithPlayer, 30);
					KinkyDungeonSetFlag("Released", 24);
					KinkyDungeonSetFlag("nojailbreak", 12);
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
			enemy.IntentLeashPoint = nj ? nj : Object.assign({type: "jail", radius: 1}, KinkyDungeonStartPosition);
			if (!nj) KinkyDungeonSetFlag("LeashToPrison", -1, 1);
		},
		arrive: (enemy, AIData) => {
			if (KDGameData.PrisonerState == 'parole') {
				KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Mistake").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 6, 8);
				KDBreakTether();
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, AIData);
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				return true;
			}
			AIData.defeat = true;
			KDBreakTether();
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
				KDBreakTether();
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, AIData);
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				return true;
			}
			AIData.defeat = true;
			KDBreakTether();
			return false;
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

			let suff = (enemy.Enemy.playLine ? enemy.Enemy.playLine : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash").replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, AIData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			let res = KDSettlePlayerInFurniture(enemy, AIData, ["callGuardJailerOnly"]);
			if (res) {
				for (let e of KinkyDungeonEntities) {
					if (e.hostile < 9000) e.hostile = 0;
					if (e.attackPoints > 0) e.attackPoints = 0;
					if (!e.ceasefire) e.ceasefire = 1;
				}
				KDGameData.PrisonerState = 'jail';
			}
			return res;
		},
		maintain: (enemy, delta) => {
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
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
		KDBreakTether();
		return true;
	}
	return false;
}