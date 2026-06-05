"use strict";



/**
 * Play is actions enemies do when they are NEUTRAL
 */
let KDIntentEvents: Record<string, EnemyEvent> = {
	"leashFurniture": {
		play: true,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (enemy, _aiData, allied, hostile, _aggressive) => {
			if (allied) return 0;
			if (!enemy.Enemy.tags.leashing) return 0;
			if (KinkyDungeonFlags.get("Released")) return 0;
			if (KDGameData.PrisonerState == 'jail') return 0;
			if (KinkyDungeonGetRestraintItem("ItemDevices")) return 0;
			if (enemy.playWithPlayer > 0) return 0;
			if (KDSelfishLeash(enemy)) return 0;
			if (KDEnemyHasFlag(enemy, "noHarshPlay")) return 0;
			if (KDEnemyHasFlag(enemy, "dontChase")) return 0;
			let mult = hostile ? 3 : 1;
			if (enemy.Enemy?.Behavior?.leashCondition) {
				if (!KDLeashConditions[enemy.Enemy.Behavior.leashCondition].check(enemy, (_aiData as KDAIData).player))
					return 0;
			}

			if (KinkyDungeonFlags.get("LeashToPrison")) mult = hostile ? 0 : 0.1;
			let player = KDPlayer();
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
			return nearestfurniture && KDistChebyshev(enemy.x - nearestfurniture.x, enemy.y - nearestfurniture.y) < 14 ? (mult * 40 * (KDGameData.PrisonerState == 'parole' ? 0 : 1)) : 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashFurniture';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			let player = KDPlayer();
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
			enemy.IntentLeashPoint = nearestfurniture;
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);
			KinkyDungeonSetEnemyFlag(enemy, "intent_startChecking", 5);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 12 + Math.floor(KDRandom() * 12);
			enemy.playWithPlayerCD = 30;
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 7);
			KDResetAllIntents(true);
			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			return KDSettlePlayerInFurniture(enemy, (aiData as KDAIData));
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(player);
			if (KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5 && !tethered && KDPlayerLeashed(player)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = player.x;
					enemy.gy = player.y;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					if (!KDEntityHasFlag(enemy, "intent_startChecking")) {
						enemy.IntentAction = '';
						enemy.IntentLeashPoint = null;
						enemy.gx = enemy.IntentLeashPoint?.x;
						enemy.gy = enemy.IntentLeashPoint?.y;
					}
					
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
				} else {
					enemy.gx = enemy.IntentLeashPoint.x;
					enemy.gy = enemy.IntentLeashPoint.y;
					let player = KDPlayer();
					let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
					if (!nearestfurniture) {
						enemy.IntentAction = '';
						enemy.IntentLeashPoint = null;
					} else
					if (KDistChebyshev(enemy.IntentLeashPoint.x - enemy.x, enemy.IntentLeashPoint.y - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
						KDIntentEvents.leashFurniture.arrive(enemy, aiData);
					}
				}

				// If they are not attacking player

			}
			if ((KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && (KDEnemyHasFlag(enemy, "motivated") || KDHostile(enemy)))
				|| KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
				if (enemy.playWithPlayer < 10) {
					enemy.playWithPlayer = 10;
					KDSetPlayCD(enemy, 2.5);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
					KinkyDungeonSetEnemyFlag(enemy, "seePlayer", 2);
				}// else enemy.playWithPlayer += delta;
			}
			return false;
		},
	},
	leashToPoint: {
		play: true,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashToPoint';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			enemy.IntentLeashPoint = {
				radius: (aiData as KDEventTriggerDataPoint).radius || 1,
				x: (aiData as KDEventTriggerDataPoint).point?.x || 1,
				y: (aiData as KDEventTriggerDataPoint).point?.y || 1,
				type: "point",
			};
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, _aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 0;
			enemy.playWithPlayerCD = 80;
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 0);
			KDResetAllAggro();
			if (KDGameData.PrisonerState == 'chase') KDGameData.PrisonerState = 'jail';
			KDResetAllIntents();
			KDBreakTether(KinkyDungeonPlayerEntity);

			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			enemy.gx = KinkyDungeonPlayerEntity.x;
			enemy.gy = KinkyDungeonPlayerEntity.y;
			return true;
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					enemy.IntentAction = '';
					enemy.IntentLeashPoint = null;
					enemy.gx = enemy.IntentLeashPoint?.x;
					enemy.gy = enemy.IntentLeashPoint?.y;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
				}
			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
	},

	leashToPoint_Furn: {
		play: true,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashToPoint_Furn';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			enemy.IntentLeashPoint = {
				radius: (aiData as KDEventTriggerDataPoint).radius || 1,
				x: (aiData as KDEventTriggerDataPoint).point?.x || 1,
				y: (aiData as KDEventTriggerDataPoint).point?.y || 1,
				type: "point",
			};
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, aiData) => {
			let res = true;
			if (enemy.IntentLeashPoint) {
				
				let furniture = KinkyDungeonNearestJailPoint(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, ["furniture"]);
				if (furniture && furniture.x == enemy.IntentLeashPoint.x && furniture.y == enemy.IntentLeashPoint.y) {
					res = KDSettlePlayerInFurniture(enemy, (aiData as KDAIData),
						undefined, undefined, undefined, furniture);
				}
				
			}

			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 0;
			enemy.playWithPlayerCD = 80;
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 0);
			KDResetAllAggro();
			if (KDGameData.PrisonerState == 'chase') KDGameData.PrisonerState = 'jail';
			KDResetAllIntents();
			KDBreakTether(KinkyDungeonPlayerEntity);

			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			enemy.gx = KinkyDungeonPlayerEntity.x;
			enemy.gy = KinkyDungeonPlayerEntity.y;
			return res;
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				

				if (!enemy.IntentLeashPoint) {
					enemy.IntentAction = '';
					enemy.IntentLeashPoint = null;
					enemy.gx = enemy.IntentLeashPoint?.x;
					enemy.gy = enemy.IntentLeashPoint?.y;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
				} else {
					if (KDistChebyshev(enemy.IntentLeashPoint.x - enemy.x, enemy.IntentLeashPoint.y - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
						KDIntentEvents.leashToPoint_Furn.arrive(enemy, aiData);
					}
				}


			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
	},
	"leashStorage": {
		play: true,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashStorage';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			let nearestfurniture = KDRandomJailPoint(enemy.x, enemy.y, ["storage"]);
			enemy.IntentLeashPoint = nearestfurniture;
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 0;
			enemy.playWithPlayerCD = 80;
			KDGameData.PrisonerState = 'jail';
			KDResetAllAggro(KinkyDungeonPlayerEntity);
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 0);
			KDResetAllIntents(true);
			return KDSettlePlayerInFurniture(enemy, (aiData as KDAIData), undefined, undefined, ["storage"]);
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					let nj = KDRandomJailPoint(enemy.x, enemy.y, ["storage"]);
					enemy.IntentLeashPoint = nj;
				} else {
					enemy.gx = enemy.IntentLeashPoint?.x || KDMapData.StartPosition.y;
					enemy.gy = enemy.IntentLeashPoint?.y || KDMapData.StartPosition.x;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);

					if (KDistChebyshev(enemy.IntentLeashPoint.x - enemy.x, enemy.IntentLeashPoint.y - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
						KDIntentEvents.leashStorage.arrive(enemy, aiData);
					}
				}





			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
	},
	
	"initiateDialogue": {
		play: false,
		nonaggressive: true,
		// This will make the enemy want to leash you
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'initiateDialogue';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			//let nearestfurniture = KDRandomJailPoint(enemy.x, enemy.y, ["storage"]);
			//enemy.IntentLeashPoint = nearestfurniture;
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			//KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			/*let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);*/
		},
		arrive: (enemy, aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			let dialogue = enemy.intentDialogue;
			if (dialogue) {
				KDStartDialog(enemy.intentDialogue, enemy.Enemy?.name, true, KDGetPersonality(enemy), enemy);
			}
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 0;
			enemy.playWithPlayerCD = 50;
			KDResetAllAggro(KinkyDungeonPlayerEntity);
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 0);
			KDResetAllIntents(true);
			return !!dialogue;
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			enemy.aware = true;

			enemy.gx = KDPlayer().x;
			enemy.gy = KDPlayer().y;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);

			if (KDistChebyshev(KDPlayer().x - enemy.x, KDPlayer().y - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
				KDIntentEvents.initiateDialogue.arrive(enemy, aiData);
			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
	},
	"leashCell": {
		play: true,
		nonaggressive: true,
		noMassReset: true,
		// This will make the enemy want to leash you
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashCell';
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 140);
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
			enemy.IntentLeashPoint = nearestfurniture;
			enemy.playWithPlayer = 22;
			KDSetPlayCD(enemy, 3);

			KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
			KinkyDungeonSetEnemyFlag(enemy, "motivated", 50);

			KDAddThought(enemy.id, "Jail", 5, enemy.playWithPlayer);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
			enemy.playWithPlayer = 0;
			enemy.playWithPlayerCD = 80;
			KDGameData.PrisonerState = 'jail';
			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			KDResetAllAggro(KinkyDungeonPlayerEntity);
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 0);
			KDResetAllIntents(true);
			KDGameData.KinkyDungeonPrisonExtraGhostRep -= 1;
			return KDPutInJail(KinkyDungeonPlayerEntity, enemy, null);
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
					enemy.IntentLeashPoint = nj;
				} else {
					enemy.gx = enemy.IntentLeashPoint?.x || KDMapData.StartPosition.y;
					enemy.gy = enemy.IntentLeashPoint?.y || KDMapData.StartPosition.x;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);

					if (KDistChebyshev(enemy.IntentLeashPoint.x - enemy.x, enemy.IntentLeashPoint.y - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
						KDIntentEvents.leashCell.arrive(enemy, aiData);
					}
				}
			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
	},
	"Ignore": {
		nonaggressive: true,
		// This is the basic leash to jail mechanic
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 90;
		},
		trigger: (_enemy, _aiData) => {
		},
	},
	"Play": {
		play: true,
		nonaggressive: true,
		// This is the basic 'it's time to play!' dialogue
		weight: (enemy, _aiData, allied, _hostile, _aggressive) => {
			if (KDHelpless(enemy)) return 0;
			return (KDEnemyHasFlag(enemy, "HelpMe")) ?
				0
				: (!enemy?.playWithPlayer ? (allied ? 10 : 110) : 0);
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.playWithPlayer = 8 + Math.floor(KDRandom() * (5 * Math.min(5, Math.max(enemy.Enemy.attackPoints || 0, enemy.Enemy.movePoints || 0))));
			KinkyDungeonSetEnemyFlag(enemy, "playstart", 7);
			KDSetPlayCD(enemy, 3.5);
			if ((aiData as KDAIData).domMe) enemy.playWithPlayer = Math.floor(enemy.playWithPlayer * 0.7);
			KDAddThought(enemy.id, "Play", 4, enemy.playWithPlayer);

			let index = Math.floor(Math.random() * 3);
			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			if ((aiData as KDAIData).domMe) {
				if (KDIsBrat(enemy))
					suff = "Brat" + suff;
				else
					suff = "Sub" + suff;
			}
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + index,
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 12, 3);
		},
	},
	"freeFurniture": {
		// This is called to make an enemy free you from furniture
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, _aiData) => {
			// n/a
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 100);
		},
		maintain: (enemy, _delta, aiData) => {
			if (KinkyDungeonGetRestraintItem("ItemDevices")) {
				if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
					KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
					KDResetIntent(enemy, undefined);
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", -1);
					KinkyDungeonSetFlag("Released", 90);
					KinkyDungeonSetFlag("nojailbreak", 15);
					if (KDGameData.PrisonerState == 'jail' && KDIntentEvents.CaptureJail.weight(enemy, aiData, (aiData as KDAIData).allied, true, true) > 0) {
						KDIntentEvents.CaptureJail.trigger(enemy, {});
					}
					if (enemy.playWithPlayer > 0)
						enemy.playWithPlayerCD = Math.max(enemy.playWithPlayer, 30);
				} else {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
				}
				if (enemy.playWithPlayer > 0)
					enemy.playWithPlayer = 12;
				KinkyDungeonSetEnemyFlag(enemy, "seePlayer", 4);
				return true;
			}
			return false;
		},
	},
	"Capture": {
		aggressive: true,
		noplay: true,
		// This is the basic leash to jail mechanic
		weight: (_enemy, _aiData, _allied, _hostile, _aggressive) => {
			return 100;
		},
		trigger: (enemy, _aiData) => {
			enemy.playWithPlayer = 0;
		},
	},
	"CaptureJail": {
		// Capture and bring to jail
		aggressive: true,
		nonaggressive: false,
		noplay: true,
		forceattack: true,
		overrideIgnore: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, aiData, _allied, hostile, _aggressive) => {
			//if (KinkyDungeonAltFloor(KDGameData.RoomType)?.isPrison) return 0;
			if (enemy.Enemy?.Behavior?.leashCondition) {
				if (!KDLeashConditions[enemy.Enemy.Behavior.leashCondition].check(enemy, (aiData as KDAIData).player))
					return 0;
			}
			let player = KDPlayer();
			if (KinkyDungeonLeashingEnemy() && KinkyDungeonLeashingEnemy() != enemy) return 0;
			return (hostile
				&& (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing)
				&& ((KinkyDungeonFlags.has("Released"))
			|| (
				!KDIsNearbyFurniture(enemy, player, 14)
			)
		)
				&& !KDEnemyHasFlag(enemy, "dontChase")) ?
				((KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"])
					&& !KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"])) ? 0 : 100)
			: 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
			enemy.playWithPlayer = 0;
			enemy.IntentAction = 'CaptureJail';


			let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
			let pos = KDGetFallbackJailPoint(0);
			if (!nj || (KinkyDungeonFlags.get("LeashToPrison")
				&& !(KinkyDungeonAltFloor(KDGameData.RoomType)?.isPrison)
			) || KDSelfishLeash(enemy)) {
				nj = null;
				if (KDGenHighSecCondition(!nj, enemy)) {
					pos = KDGetHighSecLoc(enemy, !KDSelfishLeash(enemy));
				}
				KinkyDungeonSetFlag("LeashToPrison", -1, 1);
			}
			enemy.IntentLeashPoint = nj ? nj : Object.assign({ type: "jail", radius: 1, entrance: true}, pos);

		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			let tethered = KDIsPlayerTethered(KinkyDungeonPlayerEntity);
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !tethered && KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KinkyDungeonAttachTetherToEntity(2.5, enemy, player);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
				return true;
			}
			else if (!tethered) {
				if (enemy.aware) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
					KDTryToLeash(enemy, player, delta, false,
						(KDBoundPowerLevel < 0.5 || !KinkyDungeonHasWill(0.1)) && (aiData as KDAIData).canAttack);
				}
			} else if (tethered && KDIsPlayerTetheredToEntity(KinkyDungeonPlayerEntity, enemy)) {
				enemy.aware = true;

				if (!enemy.IntentLeashPoint) {
					let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
					let pos = KDGetFallbackJailPoint(0);
					if (!nj || (KinkyDungeonFlags.get("LeashToPrison")
						&& !(KinkyDungeonAltFloor(KDGameData.RoomType)?.isPrison)
					) || KDSelfishLeash(enemy)) {
						if (KDGenHighSecCondition(!nj, enemy)) {
							pos = KDGetHighSecLoc(enemy, !KDSelfishLeash(enemy));
						}
						KinkyDungeonSetFlag("LeashToPrison", -1, 1);
					}
					enemy.IntentLeashPoint = nj ? nj : Object.assign({ type: "jail", radius: 1, entrance: true}, pos);
				}

				enemy.gx = enemy.IntentLeashPoint?.x || KDMapData.StartPosition.y;
				enemy.gy = enemy.IntentLeashPoint?.y || KDMapData.StartPosition.x;
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);

				// If they are not attacking player
				if (KDistChebyshev(enemy.gx - enemy.x, enemy.gy - enemy.y) < 1.5 && !(aiData as KDAIData).aggressive) {
					KDIntentEvents.CaptureJail.arrive(enemy, aiData);
				}
				// TODO add release case based on alliance
			}
			if (enemy.playWithPlayer < 10) {
				enemy.playWithPlayer = 10;
			}
			return false;
		},
		arrive: (enemy, aiData) => {
			if (KDGameData.PrisonerState == 'parole' && !KDSelfishLeash(enemy)) {
				KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Mistake",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 6, 8);
				KDBreakTether(KinkyDungeonPlayerEntity);
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, aiData);
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				if (KinkyDungeonAutoWait) {
					KDUpdateWaitTime(KDDelayWaitTime());
				}
				return true;
			} else if (KDGameData.PrisonerState == 'jail') {
				let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
				if (!enemy.IntentLeashPoint || !enemy.IntentLeashPoint.entrance)
					KDPutInJail(KinkyDungeonPlayerEntity, enemy, nj ? nj : KDMapData.StartPosition);
				KDResetIntent(enemy, aiData);
				//KDBreakTether(KinkyDungeonPlayerEntity);
				if (!nj)
					(aiData as KDAIData).defeat = true;
			} else {
				let nj = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
				if (!enemy.IntentLeashPoint || !enemy.IntentLeashPoint.entrance)
					KDPutInJail(KinkyDungeonPlayerEntity, enemy, nj ? nj : KDMapData.StartPosition);
				KDResetIntent(enemy, aiData);
				//KDBreakTether(KinkyDungeonPlayerEntity);
				(aiData as KDAIData).defeat = true;
			}
			KDResetAllAggro();
			KDResetAllIntents();
			return false;
		},
	},
	"ToyWithPlayer": {
		// Capture and bring to jail
		aggressive: true,
		nonaggressive: false,
		noplay: true,
		forceattack: true,
		overrideIgnore: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, _aiData, _allied, hostile, _aggressive) => {
			if (!["", "Dom", "Sub", "Brat"].includes(KDJailPersonality(enemy))) return 0;
			if (KinkyDungeonLeashingEnemy() || KDGameData.PrisonerState == 'chase') return 0;
			if (KDBoundPowerLevel < 0.5) return 0;
			if (!KDEnemyCanTalk(enemy) || !enemy.Enemy?.bound) return 0;
			if (KinkyDungeonFlags.get("PlayerCombat") || KinkyDungeonFlags.get("ToyedWith")) return 0;
			return (hostile && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) && !KDEnemyHasFlag(enemy, "dontChase")) ?
				KDBoundPowerLevel * 10 + (KinkyDungeonFlags.get("CallForHelp") ? 40 : 0)
			: 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 20);
			KinkyDungeonSetEnemyFlag(enemy, "toyWithPlayer", 20 + Math.floor(KDRandom() * 10));
			for (let en of KDNearbyEnemies(enemy.x, enemy.y, 10)) {
				if (en != enemy) en.ceasefire = 20;
			}
			enemy.playWithPlayer = 0;
			enemy.IntentAction = 'ToyWithPlayer';
			KinkyDungeonSetFlag("ToyedWith", 100);

			KinkyDungeonSendDialogue(enemy, TextGet("KDCombatLine_YoureFinished_" + KDJailPersonality(enemy) + Math.floor(Math.random() * 3),
									KDGetGenericDialogueParams(KDPlayer(), enemy)), KDGetColor(enemy), 9, 10);

		},
		maintain: (enemy, _delta, _aiData) => {
			if (KinkyDungeonFlags.get("PlayerCombat")
				|| !KDEnemyHasFlag(enemy, "toyWithPlayer")
				|| KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) > 5.5) {
				KDResetIntent(enemy);
				KinkyDungeonAggroAction('attack', {enemy: enemy});
				return false;
			}
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 5.5) {

				KinkyDungeonSetEnemyFlag(enemy, "nobind", 2);
				KinkyDungeonSetEnemyFlag(enemy, "noleash", 2);
				KinkyDungeonSetEnemyFlag(enemy, "nosteal", 2);
				KinkyDungeonSetEnemyFlag(enemy, "alwayswill", 2);

				enemy.gx = KinkyDungeonPlayerEntity.x;
				enemy.gy = KinkyDungeonPlayerEntity.y;
				return true;
			}
			return false;
		},
	},
	"TempLeash": {
		aggressive: false,
		nonaggressive: true,
		//play: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, aiData, _allied, _hostile, _aggressive) => {
			if (enemy.Enemy?.Behavior?.leashCondition) {
				if (!KDLeashConditions[enemy.Enemy.Behavior.leashCondition].check(enemy, (aiData as KDAIData).player))
					return 0;
			}
			return ((aiData as KDAIData)?.playerDist < 6.99
				&& enemy != KinkyDungeonJailGuard()
				&& KinkyDungeonPlayerTags.get("Collars") && KinkyDungeonGetRestraintItem("ItemNeckRestraints")
				&& !KinkyDungeonFlags.has("TempLeashCD")
				&& (KDGameData.PrisonerState == 'parole' || KinkyDungeonGoddessRep.Ghost > 0 || KDEnemyHasFlag(enemy, "allowLeashWalk"))
				&& (KDGameData.PrisonerState != 'jail' || (!KDHostile(enemy) && !KinkyDungeonPlayerInCell(true)))
				//&& KDStrictPersonalities.includes(KDJailPersonality(enemy))
				&& KDEnemyCanTalk(enemy)
				&& !KinkyDungeonInDanger()
				&& !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) ?
				((KDStrictPersonalities.includes(KDJailPersonality(enemy)) || KDJailPersonality(enemy) == "Robot") ? 100 : 10)
				: 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "templeashpause", 3);
			let duration = 60 + Math.round(KDRandom()*40);
			KinkyDungeonSetFlag("TempLeash", duration);
			KinkyDungeonSetFlag("TempLeashCD", duration*2);
			KinkyDungeonSetFlag("noResetIntent", 12);
			KinkyDungeonSetFlag("nojailbreak", 12);

			if (!KDHostile(enemy))
				KinkyDungeonSetEnemyFlag(enemy, "noHarshPlay", 12);

			enemy.playWithPlayer = 12;
			enemy.playWithPlayerCD = 40;
			enemy.IntentAction = 'TempLeash';
			if (KDGameData.HeelPower > 0)
				KDTickTraining("Heels", KDGameData.HeelPower > 0,
					KDGameData.HeelPower <= 0, 4, 25);
			KinkyDungeonSendDialogue(enemy,
				TextGet("KinkyDungeonJailer" + (KDEnemyCanTalk(enemy) ? KDJailPersonality(enemy) : "Gagged") + "LeashTime",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				KDGetColor(enemy), 14, 10);
			KDAddThought(enemy.id, "Play", 7, enemy.playWithPlayer);

		},
		maintain: (enemy, _delta, aiData) => {
			if (!KDHostile(enemy))
				KinkyDungeonSetEnemyFlag(enemy, "noHarshPlay", 12);

			if (!KinkyDungeonFlags.has("TempLeash")
				|| !(KinkyDungeonPlayerTags.get("Collars")
				&& KinkyDungeonGetRestraintItem("ItemNeckRestraints"))) {
				if (!(KinkyDungeonPlayerTags.get("Collars")
					&& KinkyDungeonGetRestraintItem("ItemNeckRestraints"))
					|| KDGameData.PrisonerState != 'jail'
					|| KDIsInPartyID(enemy.id)) {
					enemy.IntentAction = '';
					enemy.IntentLeashPoint = null;
					KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);

					if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
						if (!KinkyDungeonFlags.has("TempLeash") && KDGameData.HeelPower > 0)
							KDTickTraining("Heels", KDGameData.HeelPower > 0,
								false, 6, 25);
						KDBreakTether(KinkyDungeonPlayerEntity);
						enemy.playWithPlayer = 0;
						enemy.playWithPlayerCD = 30;
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndNow",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 7, 10);
					}
				} else {
					// Bring back!
					if ((aiData as KDAIData)?.playerDist < 7.5) {
						if (enemy.playWithPlayer < 10 && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
							enemy.playWithPlayer = 10;
							KinkyDungeonSetFlag("nojailbreak", 2);
						}// else enemy.playWithPlayer += delta;
						KinkyDungeonSetFlag("noResetIntentFull", 10);
					}

					// Enemies will still be able to play with you!
					KinkyDungeonSetFlag("overrideleashprotection", 2);

					if (!KinkyDungeonFlags.get("TempLeashReturn")) {
						KinkyDungeonSetFlag("TempLeashReturn", 40);
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndReturn",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 7, 7);
					}
					if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						enemy.gx = KinkyDungeonPlayerEntity.x;
						enemy.gy = KinkyDungeonPlayerEntity.y;
						if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !KDEntityHasFlag(enemy, "templeashpause")) {
							let player = KDPlayer();
							// Leash the player if they are close
							KinkyDungeonAttachTetherToEntity(4.5, enemy, player);
							if (KinkyDungeonGetRestraintItem("ItemDevices")) {
								KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
							}
							KinkyDungeonSetEnemyFlag(enemy, "templeashpause", 3);
							KinkyDungeonSendDialogue(enemy,
								TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Leashed",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
								KDGetColor(enemy), 5, 10);

							KDAddThought(enemy.id, "Happy", 6, enemy.playWithPlayer);
						}
					} else {
						// We will wander more than usual
						KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
						KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
						if (enemy.idle || (KDistChebyshev(enemy.x - enemy.gx, enemy.y - enemy.gy) < 4)) {
							KDResetGuardSpawnTimer();
							let player = KDPlayer();
							let furn = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
							let jail =  KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
							let newPoint = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail", "furniture"], undefined, undefined, undefined, KDGetFurnitureCriteria(player));
							if (newPoint) {
								enemy.keys = true;
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
								KinkyDungeonSetEnemyFlag(enemy, "wander", 300);
								KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 300);
								if ((furn && KDistChebyshev(enemy.x - furn.x, enemy.y - furn.y) < 1.5)
									|| (jail && KDistChebyshev(enemy.x - jail.x, enemy.y - jail.y) < 1.5)) {
									if (newPoint && newPoint.x == furn?.x && newPoint.y == furn?.y) {
										KDSettlePlayerInFurniture(enemy, (aiData as KDAIData));
										KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
									} else {
										let nearestJail = KinkyDungeonNearestJailPoint(enemy.x, enemy.y);
										let jailRadius = (nearestJail && nearestJail.radius) ? nearestJail.radius : 1.5;
										let playerInCell = nearestJail ? (Math.abs(KinkyDungeonPlayerEntity.x - nearestJail.x) < jailRadius - 1 && Math.abs(KinkyDungeonPlayerEntity.y - nearestJail.y) <= jailRadius)
											: null;
										if (!playerInCell) {
											let point = {x: nearestJail.x, y: nearestJail.y};//KinkyDungeonGetNearbyPoint(nearestJail.x, nearestJail.y, true, undefined, true);
											if (point) {
												let lastx = KinkyDungeonPlayerEntity.x;
												let lasty = KinkyDungeonPlayerEntity.y;
												KDMovePlayer(point.x, point.y, false);
												KDMoveEntity(enemy, lastx, lasty, true);
												KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
												KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
												let newPoint2 = KinkyDungeonGetRandomEnemyPoint(true,
													false, enemy);
												if (newPoint2) {
													enemy.path = undefined;
													KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
													KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
													enemy.gx = newPoint2.x;
													enemy.gy = newPoint2.y;
												} else {
													enemy.path = undefined;
													KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
													KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
													enemy.gx = KDMapData.EndPosition.x;
													enemy.gy = KDMapData.EndPosition.y;
												}
											}
										}
										KDBreakTether(KinkyDungeonPlayerEntity);
									}
									enemy.IntentAction = '';
									enemy.IntentLeashPoint = null;
									KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
									KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
								}
							} else {
								enemy.IntentAction = '';
								enemy.IntentLeashPoint = null;
								KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
								KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
							}

						}
					}
				}

			} else {
				if ((aiData as KDAIData)?.playerDist < 5.5) {
					if (enemy.playWithPlayer < 10 && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						enemy.playWithPlayer = 10;
					}// else enemy.playWithPlayer += delta;
					KinkyDungeonSetFlag("noResetIntentFull", 10);
				}

				// Enemies will still be able to play with you!
				KinkyDungeonSetFlag("overrideleashprotection", 2);

				let returnToJail = KDGameData.PrisonerState == 'jail';

				if (KinkyDungeonFlags.get("TempLeash") == 10 && returnToJail) {
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndReturn",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
						KDGetColor(enemy), 7, 7);
				}
				if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
						let player = KDPlayer();
						// Leash the player if they are close
						KinkyDungeonAttachTetherToEntity(4.5, enemy, player);
						if (KinkyDungeonGetRestraintItem("ItemDevices")) {
							KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
						}
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Leashed",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 5, 10);

						KDAddThought(enemy.id, "Happy", 6, enemy.playWithPlayer);
					}
				} else {
					// We will wander more than usual
					KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
					KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
					if (enemy.idle) {
						KDResetGuardSpawnTimer();
						if (KDRandom() < 0.33) {
							let newPoint = KinkyDungeonGetRandomEnemyPoint(false,
								enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
							if (newPoint) {
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
							}
						} else {
							let newPoint = KinkyDungeonGetNearbyPoint(enemy.x, enemy.y, false);
							if (newPoint) {
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
							}
						}

					}
				}

			}
			return false;
		},
	},
	"Cuddle": {
		aggressive: false,
		nonaggressive: true,
		//play: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, aiData, _allied, _hostile, _aggressive) => {
			return ((aiData as KDAIData)?.playerDist < 6.99
				&& enemy != KinkyDungeonJailGuard()
				&& KinkyDungeonPlayerTags.get("Collars") && KinkyDungeonGetRestraintItem("ItemNeckRestraints")
				&& !KinkyDungeonFlags.has("TempLeashCD")
				&& (KDGameData.PrisonerState == 'parole' || KinkyDungeonGoddessRep.Ghost > 0 || KDEnemyHasFlag(enemy, "allowLeashWalk"))
				&& (KDGameData.PrisonerState != 'jail' || (!KDHostile(enemy) && !KinkyDungeonPlayerInCell(true)))
				//&& KDStrictPersonalities.includes(KDJailPersonality(enemy))
				&& KDEnemyCanTalk(enemy)
				&& !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) ?
				((KDStrictPersonalities.includes(KDJailPersonality(enemy)) || KDJailPersonality(enemy) == "Robot") ? 100 : 10)
				: 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "templeashpause", 3);
			let duration = 60 + Math.round(KDRandom()*40);
			KinkyDungeonSetFlag("TempLeash", duration);
			KinkyDungeonSetFlag("TempLeashCD", duration*2);
			KinkyDungeonSetFlag("noResetIntent", 12);
			KinkyDungeonSetFlag("nojailbreak", 12);

			if (!KDHostile(enemy))
				KinkyDungeonSetEnemyFlag(enemy, "noHarshPlay", 12);

			enemy.playWithPlayer = 12;
			enemy.playWithPlayerCD = 40;
			enemy.IntentAction = 'TempLeash';
			if (KDGameData.HeelPower > 0)
				KDTickTraining("Heels", KDGameData.HeelPower > 0,
					KDGameData.HeelPower <= 0, 4, 25);
			KinkyDungeonSendDialogue(enemy,
				TextGet("KinkyDungeonJailer" + (KDEnemyCanTalk(enemy) ? KDJailPersonality(enemy) : "Gagged") + "LeashTime",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				KDGetColor(enemy), 14, 10);
			KDAddThought(enemy.id, "Play", 7, enemy.playWithPlayer);

		},
		maintain: (enemy, _delta, aiData) => {
			if (!KDHostile(enemy))
				KinkyDungeonSetEnemyFlag(enemy, "noHarshPlay", 12);

			if (!KinkyDungeonFlags.has("TempLeash") || !(KinkyDungeonPlayerTags.get("Collars") && KinkyDungeonGetRestraintItem("ItemNeckRestraints"))) {
				if (!(KinkyDungeonPlayerTags.get("Collars") && KinkyDungeonGetRestraintItem("ItemNeckRestraints")) || KDGameData.PrisonerState != 'jail') {
					enemy.IntentAction = '';
					enemy.IntentLeashPoint = null;
					KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
					KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);

					if (KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
						if (!KinkyDungeonFlags.has("TempLeash") && KDGameData.HeelPower > 0)
							KDTickTraining("Heels", KDGameData.HeelPower > 0,
								KDGameData.HeelPower <= 0, 6, 25);
						KDBreakTether(KinkyDungeonPlayerEntity);
						enemy.playWithPlayer = 0;
						enemy.playWithPlayerCD = 30;
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndNow",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 7, 10);
					}
				} else {
					// Bring back!
					if ((aiData as KDAIData)?.playerDist < 7.5) {
						if (enemy.playWithPlayer < 10 && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
							enemy.playWithPlayer = 10;
							KinkyDungeonSetFlag("nojailbreak", 2);
						}// else enemy.playWithPlayer += delta;
						KinkyDungeonSetFlag("noResetIntentFull", 10);
					}

					// Enemies will still be able to play with you!
					KinkyDungeonSetFlag("overrideleashprotection", 2);

					if (!KinkyDungeonFlags.get("TempLeashReturn")) {
						KinkyDungeonSetFlag("TempLeashReturn", 40);
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndReturn",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 7, 7);
					}
					if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						enemy.gx = KinkyDungeonPlayerEntity.x;
						enemy.gy = KinkyDungeonPlayerEntity.y;
						if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5 && !KDEntityHasFlag(enemy, "templeashpause")) {
							let player = KDPlayer();
							// Leash the player if they are close
							KinkyDungeonAttachTetherToEntity(4.5, enemy, player);
							if (KinkyDungeonGetRestraintItem("ItemDevices")) {
								KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
							}
							KinkyDungeonSetEnemyFlag(enemy, "templeashpause", 3);
							KinkyDungeonSendDialogue(enemy,
								TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Leashed",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
								KDGetColor(enemy), 5, 10);

							KDAddThought(enemy.id, "Happy", 6, enemy.playWithPlayer);
						}
					} else {
						// We will wander more than usual
						KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
						KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
						if (enemy.idle || (KDistChebyshev(enemy.x - enemy.gx, enemy.y - enemy.gy) < 4)) {
							KDResetGuardSpawnTimer();
							let player = KDPlayer();
							let furn = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
							let jail =  KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail"]);
							let newPoint = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["jail", "furniture"], undefined, undefined, undefined, KDGetFurnitureCriteria(player));
							if (newPoint) {
								enemy.keys = true;
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
								KinkyDungeonSetEnemyFlag(enemy, "wander", 300);
								KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 300);
								if ((furn && KDistChebyshev(enemy.x - furn.x, enemy.y - furn.y) < 1.5)
									|| (jail && KDistChebyshev(enemy.x - jail.x, enemy.y - jail.y) < 1.5)) {
									if (newPoint && newPoint.x == furn?.x && newPoint.y == furn?.y) {
										KDSettlePlayerInFurniture(enemy, (aiData as KDAIData));
										KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
									} else {
										let nearestJail = KinkyDungeonNearestJailPoint(enemy.x, enemy.y);
										let jailRadius = (nearestJail && nearestJail.radius) ? nearestJail.radius : 1.5;
										let playerInCell = nearestJail ? (Math.abs(KinkyDungeonPlayerEntity.x - nearestJail.x) < jailRadius - 1 && Math.abs(KinkyDungeonPlayerEntity.y - nearestJail.y) <= jailRadius)
											: null;
										if (!playerInCell) {
											let point = {x: nearestJail.x, y: nearestJail.y};//KinkyDungeonGetNearbyPoint(nearestJail.x, nearestJail.y, true, undefined, true);
											if (point) {
												let lastx = KinkyDungeonPlayerEntity.x;
												let lasty = KinkyDungeonPlayerEntity.y;
												KDMovePlayer(point.x, point.y, false);
												KDMoveEntity(enemy, lastx, lasty, true);
												KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
												KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
												let newPoint2 = KinkyDungeonGetRandomEnemyPoint(true,
													false, enemy);
												if (newPoint2) {
													enemy.path = undefined;
													KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
													KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
													enemy.gx = newPoint2.x;
													enemy.gy = newPoint2.y;
												} else {
													enemy.path = undefined;
													KinkyDungeonSetEnemyFlag(enemy, "blocked", 24);
													KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
													enemy.gx = KDMapData.EndPosition.x;
													enemy.gy = KDMapData.EndPosition.y;
												}
											}
										}
										KDBreakTether(KinkyDungeonPlayerEntity);
									}
									enemy.IntentAction = '';
									enemy.IntentLeashPoint = null;
									KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
									KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
								}
							} else {
								enemy.IntentAction = '';
								enemy.IntentLeashPoint = null;
								KinkyDungeonSetEnemyFlag(enemy, "wander", 7);
								KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 0);
							}

						}
					}
				}

			} else {
				if ((aiData as KDAIData)?.playerDist < 5.5) {
					if (enemy.playWithPlayer < 10 && !KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
						enemy.playWithPlayer = 10;
					}// else enemy.playWithPlayer += delta;
					KinkyDungeonSetFlag("noResetIntentFull", 10);
				}

				// Enemies will still be able to play with you!
				KinkyDungeonSetFlag("overrideleashprotection", 2);

				if (KinkyDungeonFlags.get("TempLeash") == 10 && KDGameData.PrisonerState == 'jail') {
					KinkyDungeonSendDialogue(enemy,
						TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "LeashEndReturn",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
						KDGetColor(enemy), 7, 7);
				}
				if (!KDIsPlayerTethered(KinkyDungeonPlayerEntity)) {
					enemy.gx = KinkyDungeonPlayerEntity.x;
					enemy.gy = KinkyDungeonPlayerEntity.y;
					if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5) {
						let player = KDPlayer();
						// Leash the player if they are close
						KinkyDungeonAttachTetherToEntity(4.5, enemy, player);
						if (KinkyDungeonGetRestraintItem("ItemDevices")) {
							KinkyDungeonRemoveRestraint("ItemDevices", false, false, false);
						}
						KinkyDungeonSendDialogue(enemy,
							TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Leashed",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
							KDGetColor(enemy), 5, 10);

						KDAddThought(enemy.id, "Happy", 6, enemy.playWithPlayer);
					}
				} else {
					// We will wander more than usual
					KinkyDungeonSetEnemyFlag(enemy, "wander", 0);
					KinkyDungeonSetEnemyFlag(enemy, "genpath", 0);
					if (enemy.idle) {
						KDResetGuardSpawnTimer();
						if (KDRandom() < 0.33) {
							let newPoint = KinkyDungeonGetRandomEnemyPoint(false,
								enemy.tracking && KinkyDungeonHuntDownPlayer && KDGameData.PrisonerState != "parole" && KDGameData.PrisonerState != "jail");
							if (newPoint) {
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
							}
						} else {
							let newPoint = KinkyDungeonGetNearbyPoint(enemy.x, enemy.y, false);
							if (newPoint) {
								enemy.gx = newPoint.x;
								enemy.gy = newPoint.y;
							}
						}

					}
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
		weight: (enemy, aiData, _allied, hostile, _aggressive) => {
			if (enemy.Enemy?.Behavior?.leashCondition) {
				if (!KDLeashConditions[enemy.Enemy.Behavior.leashCondition].check(enemy, (aiData as KDAIData).player))
					return 0;
			}
			return hostile && (enemy.Enemy.tags.jailer || enemy.Enemy.tags.jail || enemy.Enemy.tags.leashing) && (KinkyDungeonFlags.has("Released")
			&& !KDEnemyHasFlag(enemy, "dontChase") && KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"])) ? 200 : 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 30);
			enemy.playWithPlayer = 0;
			enemy.IntentAction = 'CaptureDoll';
			enemy.IntentLeashPoint = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["dropoff"]);
		},
		arrive: (enemy, aiData) => {
			if (KDGameData.PrisonerState == 'parole' && !KDSelfishLeash(enemy)) {
				KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonJailer" + KDJailPersonality(enemy) + "Mistake",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 6, 8);
				KDBreakTether(KinkyDungeonPlayerEntity);
				if (enemy.IntentLeashPoint)
					KDMovePlayer(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y, false, false);
				KDResetIntent(enemy, aiData);
				if (KinkyDungeonAutoWait) {
					KDUpdateWaitTime(KDDelayWaitTime());
				}
				enemy.playWithPlayer = 0;
				enemy.playWithPlayerCD = 24;
				return true;
			}
			(aiData as KDAIData).defeat = true;
			//KDBreakTether(KinkyDungeonPlayerEntity);
			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			return false;
		},
	},
	"Follow": {
		// Follow for 2 turns
		aggressive: true,
		nonaggressive: true,
		noplay: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, aiData, _allied, hostile, _aggressive) => {
			return 0;
		},
		trigger: (enemy, _aiData) => {
			KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
			enemy.playWithPlayer = 2;
			enemy.IntentAction = 'Follow';
			enemy.IntentLeashPoint = undefined;
		},
		maintain: (enemy, delta, aiData) => {
			let player = KDPlayer();
			if (enemy.aware && KDistChebyshev(enemy.x - player.x, enemy.y - player.y) > 1.5) {
				enemy.gx = player.x;
				enemy.gy = player.y;
				KinkyDungeonSetEnemyFlag(enemy, "overrideMove", 12);
				KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 2);
			}
			return true;
		},
		decideAttack: (enemy, delta, AIData) => {
			return !!KinkyDungeonFlags.get("PlayerCombat");
		}
	},
	"CaptureDemon": {
		aggressive: true,
		nonaggressive: true,
		noplay: true,
		forceattack: true,
		// This is the basic leash to jail mechanic
		weight: (enemy, _aiData, _allied, hostile, _aggressive) => {
			return hostile && (enemy.Enemy.tags.leashing && enemy.Enemy.tags.demon) && KDPlayerLeashed(KinkyDungeonPlayerEntity) ? 2000 : 0;
		},
		trigger: (enemy, _aiData) => {
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
		maintain: (enemy, _delta, aiData) => {
			if (!enemy.IntentLeashPoint || !KDEffectTileTags(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y).demonportal || !KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				KDResetIntent(enemy, aiData);
				return true;
			}
			return false;
		},
		arrive: (enemy, aiData) => {
			if (!enemy.IntentLeashPoint || !KDEffectTileTags(enemy.IntentLeashPoint.x, enemy.IntentLeashPoint.y).demonportal || !KDPlayerLeashed(KinkyDungeonPlayerEntity)) {
				return false;
			}
			KDResetIntent(enemy, aiData);
			KDBreakTether(KinkyDungeonPlayerEntity);
			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			(aiData as KDAIData).defeat = true;
			KDCustomDefeat = "DemonTransition";
			KDCustomDefeatEnemy = enemy;
			return true;
		},
	},
	"leashFurnitureAggressive": {
		noplay: true,
		aggressive: true,
		// This will make the enemy want to leash you
		weight: (enemy, aiData, _allied, hostile, _aggressive) => {
			if (!enemy.Enemy.tags.leashing) return 0;
			if (KinkyDungeonLeashingEnemy() && KinkyDungeonLeashingEnemy() != enemy) return 0;
			if (KinkyDungeonFlags.get("Released")) return 0;
			if (KinkyDungeonFlags.get("LeashToPrison")) return 0;
			if (KDGameData.PrisonerState == 'jail') return 0;
			if (KDSelfishLeash(enemy)) return 0;
			if (KinkyDungeonGetRestraintItem("ItemDevices")
				&& KinkyDungeonSlowLevel >= 9 && KDGameData.PrisonerState != 'chase') return 0;
			if (KDEnemyHasFlag(enemy, "dontChase")) return 0;
			if (enemy.Enemy?.Behavior?.leashCondition) {
				if (!KDLeashConditions[enemy.Enemy.Behavior.leashCondition].check(enemy, (aiData as KDAIData).player))
					return 0;
			}
			let player = KDPlayer();
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
			return nearestfurniture && KDistChebyshev(enemy.x - nearestfurniture.x, enemy.y - nearestfurniture.y) <= 14 ? (hostile ? 120 : ((aiData as KDAIData).domMe ? 0 : 40)) : 0;
		},
		trigger: (enemy, aiData) => {
			KDResetIntent(enemy, aiData);
			enemy.IntentAction = 'leashFurnitureAggressive';
			let player = KDPlayer();
			let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
			enemy.IntentLeashPoint = nearestfurniture;

			KDAddThought(enemy.id, "Jail", 5, 3);

			let suff = (KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) : "");
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff + "Leash",
									KDGetGenericDialogueParams(KDPlayer(), enemy)).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 3);
		},
		arrive: (enemy, aiData) => {
			// When the enemy arrives at the leash point we move the player to it
			enemy.IntentAction = '';
			enemy.IntentLeashPoint = null;
			let res = KDSettlePlayerInFurniture(enemy, (aiData as KDAIData), ["callGuardJailerOnly"]);
			if (KinkyDungeonAutoWait) {
				KDUpdateWaitTime(KDDelayWaitTime());
			}
			if (res) {
				KDResetAllAggro();
				KDResetAllIntents();
				for (let e of KDMapData.Entities) {
					if (e.hostile < 9000) e.hostile = 0;
					if (e.attackPoints > 0) e.attackPoints = 0;
					if (!e.ceasefire) e.ceasefire = 1;
				}
				KDGameData.PrisonerState = 'jail';
			}
			return res;
		},
		maintain: (enemy, _delta, _aiData) => {
			if (KDistChebyshev(enemy.x - KinkyDungeonPlayerEntity.x, enemy.y - KinkyDungeonPlayerEntity.y) < 1.5
				|| KDIsPlayerTetheredToLocation(KinkyDungeonPlayerEntity, enemy.x, enemy.y, enemy)) {
				if (enemy.playWithPlayer < 10) {
					enemy.playWithPlayer = 10;
				}// else enemy.playWithPlayer += delta;
			}
			let player = KDPlayer();
			
			if (!enemy.IntentLeashPoint) {
					if (!KDEntityHasFlag(enemy, "intent_startChecking")) {
						enemy.IntentAction = '';
						enemy.IntentLeashPoint = null;
						enemy.gx = enemy.IntentLeashPoint?.x;
						enemy.gy = enemy.IntentLeashPoint?.y;
					}
					
					KinkyDungeonSetEnemyFlag(enemy, "noResetIntent", 12);
			} else {
				let nearestfurniture = KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ["furniture"], undefined, undefined, true, KDGetFurnitureCriteria(player));
				if (!nearestfurniture) {
					enemy.IntentAction = '';
					enemy.IntentLeashPoint = null;
				}
			}
			return false;
		},
	},
};

/**
 * @param enemy
 * @param [aiData]
 */
function KDResetIntent(enemy: entity, _aiData?: KDEventDataBoolean) {
	enemy.IntentLeashPoint = null;
	enemy.IntentAction = "";
	delete enemy.intentDialogue;
}

/**
 * Helper function called to leash player to the nearest furniture
 * @param enemy
 * @param aiData
 * @param [tags]
 * @param [guardDelay]
 * @param [ftype]
 */
function KDSettlePlayerInFurniture(enemy: entity, _aiData: KDAIData, tags?: string[], guardDelay: number = 24, ftype: string[] = ["furniture"], forceFurniture?: KDJailPoint): boolean {
	let nearestfurniture = forceFurniture || KinkyDungeonNearestJailPoint(enemy.x, enemy.y, ftype, undefined, 
		undefined, undefined, KDGetFurnitureCriteria(KDPlayer()));
	let tile = KinkyDungeonTilesGet(nearestfurniture.x + "," + nearestfurniture.y);
	let type = tile ? tile.Furniture : undefined;

	let ee = KinkyDungeonEnemyAt(nearestfurniture.x, nearestfurniture.y);
	if (ee && ee != enemy) {
		KDKickEnemy(ee, undefined, true);
	}
	if (enemy.x == nearestfurniture.x && enemy.y == nearestfurniture.y)
		KDMoveEntity(enemy, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y,
			true, undefined, undefined, true);

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

			let res = KDApplyFurnitureRestraint(nearestfurniture.x, nearestfurniture.y, KDPlayer());
			if (!res) {
				return false;
			}
			KinkyDungeonMakeNoise(10, nearestfurniture.x, nearestfurniture.y);
		}

		KDResetAllAggro();
		KDResetAllIntents();
		KDBreakTether(KinkyDungeonPlayerEntity);
		if (KinkyDungeonAutoWait) {
			KDUpdateWaitTime(KDDelayWaitTime());
		}
		return true;
	}
	return false;
}

/**
 * @param enemy
 * @param player
 * @param delta
 * @param slow uses the spell
 */
function KDTryToLeash(enemy: entity, player: entity, delta: number, instant?: boolean, atkOnly?: boolean) {
	if (delta > 0 && KDistChebyshev(enemy.x - player.x, enemy.y - player.y) < 1.5) {
		KDAttachLeashOrCollar(enemy, player, delta, instant, atkOnly);
	}
}


/**
 *
 * @param enemy
 * @param player
 * @param delta
 * @param instant
 * @param slow uses the spell
 */
function KDAttachLeashOrCollar(enemy: entity, player: entity, delta: number = 0, instant?: boolean, atkOnly?: boolean) {
	let newRestraint = KinkyDungeonGetRestraintByName(KDPlayerLeashable(player) ? "BasicLeash" : "BasicCollar");
	if (newRestraint) {
		if (!atkOnly) {
			// Attach a leash or collar
			if (KDEnemyHasFlag(enemy, "applyItem2") || KDEnemyHasFlag(enemy, "applyItem")){
				if (enemy.targetingX != player.x || enemy.targetingY != player.y) {
					delete enemy.targetingX;
					delete enemy.targetingY;
					KinkyDungeonSetEnemyFlag(enemy, "applyItem", 0);
					KinkyDungeonSetEnemyFlag(enemy, "applyItem2", 0);
				}
			}

			if (!instant && (!KDEnemyHasFlag(enemy, "applyItem"))) {
				enemy.targetingX = player.x;
				enemy.targetingY = player.y;
				KinkyDungeonCreateWarningTile(player.x, player.y, enemy.Enemy.color || KDBaseRed,
					1 + delta, 2
				);
				KinkyDungeonSetEnemyFlag(enemy, "applyItem", 2 + delta);
				KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartAdding")
					.replace("RestraintName", TextGet("Restraint" + newRestraint.name))
					.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				"yellow", 2, true);
			} else if (!instant && !KDEnemyHasFlag(enemy, "applyItem2")) {
				KinkyDungeonCreateWarningTile(player.x, player.y, enemy.Enemy.color || KDBaseRed,
					1 + delta,
				);
				KinkyDungeonSetEnemyFlag(enemy, "applyItem2", 1 + delta);
				KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartAdding")
					.replace("RestraintName", TextGet("Restraint" + newRestraint.name))
					.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				"yellow", 2, true);
			} else {
				KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true);
				KinkyDungeonSetEnemyFlag(enemy, "applyItem", 0);
				KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonAddRestraints")
					.replace("NewRestraintName", TextGet("Restraint" + newRestraint.name))
					.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				"yellow", 2, true);
			}
		} else {
			if (!KDEnemyHasFlag(enemy, "applyItemAtk")) {
				if (KDEnemyHasFlag(enemy, "touchedPlayer")) {
					KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true);
					KinkyDungeonSetEnemyFlag(enemy, "applyItemAtk", 4);
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonAddRestraints")
					.replace("NewRestraintName", TextGet("Restraint" + newRestraint.name))
					.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
				"yellow", 2, true);
				} else {
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartAdding")
					.replace("RestraintName", TextGet("Restraint" + newRestraint.name))
					.replace("EnemyName", TextGet("Name" + enemy.Enemy.name)),
						"yellow", 2, true);
				}


			}
		}
	}
}

function KDApplyFurnitureRestraint(x: number, y: number, player: entity) {
	let tile = KinkyDungeonTilesGet(x + "," + y);
	if (!tile) return false;
	let type = tile ? tile.Furniture : undefined;
	if (!type) return false;
	let furn = KDFurniture[type];
	if (!furn) return false;

	if (player == KDPlayer()) {
		let rest = KinkyDungeonGetRestraint(
			{tags: [furn.restraintTag]}, MiniGameKinkyDungeonLevel,
			KDCurrIndex(),
			true,
			"",
			true,
			false,
			false);
		if (rest) {
			KinkyDungeonAddRestraintIfWeaker(rest, 0, true);
			if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Trap.ogg");

			return true;
		}
		else return false;
	}
	return false;
}