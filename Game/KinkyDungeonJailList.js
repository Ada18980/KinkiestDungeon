"use strict";

/**
 * @type {Record<string, {weight: (guard: any, xx: any, yy: any) => number, trigger: (guard: any, xx: any, yy: any) => void}>}
 */
let KDJailEvents = {
	"spawnGuard": {
		// Determines the weight
		weight: (guard, xx, yy) => {
			return 70;
		},
		// Occurs when the jail event triggers
		trigger: (g, xx, yy) => {
			// Allow the player to sleep 150 turns after the guard shows up
			if (KinkyDungeonFlags.get("slept") == -1) {
				KinkyDungeonSetFlag("slept", 0);
				KinkyDungeonSetFlag("slept", 150);
			}
			let mainFaction = KDGetMainFaction();
			// Jail tag
			let jt = KDMapData.JailFaction?.length > 0 ? KinkyDungeonFactionTag[[KDMapData.JailFaction[Math.floor(KDRandom() * KDMapData.JailFaction.length)]]] : "jailer";
			let Enemy = KinkyDungeonGetEnemy(["jailGuard", jt], KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', [jt, "jailer"], undefined, undefined, ["gagged"]);
			if (!Enemy) {
				Enemy = KinkyDungeonGetEnemy(["jailGuard", jt], KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', [jt, "jailer"], undefined, undefined, ["gagged"]);
				if (!Enemy) {
					jt = "genericJailer";
					Enemy = KinkyDungeonGetEnemy(["jailGuard", jt], KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', [jt, "jailer"]);
				}
			}
			let guard = {summoned: true, Enemy: Enemy, id: KinkyDungeonGetEnemyID(),
				x:xx, y:yy, gx: xx - 2, gy: yy, CurrentAction: "jailWander", keys: true, AI: KDGetAITypeOverride(Enemy, "guard") || "guard",
				hp: (Enemy && Enemy.startinghp) ? Enemy.startinghp : Enemy.maxhp, movePoints: 0, attackPoints: 0};
			if (mainFaction) guard.faction = mainFaction;
			if (!KinkyDungeonFlags.get("JailIntro")) {
				KinkyDungeonSetFlag("JailIntro", -1);
				KDStartDialog("PrisonIntro", guard.Enemy.name, true, "");
			} else if (KinkyDungeonFlags.get("JailRepeat")) {
				KinkyDungeonSetFlag("JailRepeat",  0);
				KDStartDialog("PrisonRepeat", guard.Enemy.name, true, "");
			}

			if (KinkyDungeonTilesGet((xx-1) + "," + yy) && KinkyDungeonTilesGet((xx-1) + "," + yy).Type == "Door") {
				KinkyDungeonTilesGet((xx-1) + "," + yy).Lock = undefined;
			}
			KDGameData.JailGuard = guard.id;
			if (KinkyDungeonEnemyAt(guard.x, guard.y)) KDKickEnemy(KinkyDungeonEnemyAt(guard.x, guard.y));
			KDAddEntity(guard);
			if (KinkyDungeonVisionGet(guard.x, guard.y))
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonGuardAppear").replace("EnemyName", TextGet("Name" + guard.Enemy.name)), "white", 6);
			KDGameData.GuardTimer = KDGameData.GuardTimerMax;
			KDGameData.GuardSpawnTimer = KDGameData.GuardSpawnTimerMin + Math.floor(KDRandom() * (KDGameData.GuardSpawnTimerMax - KDGameData.GuardSpawnTimerMin));
		},
	},
	"spawnRescue": {
		// Determines the weight
		weight: (guard, xx, yy) => {
			return KDCanSpawnShopkeeper() ? 100 : 0;
		},
		// Occurs when the jail event triggers
		trigger: (g, xx, yy) => {
			KDStartDialog("ShopkeeperRescue", "ShopkeeperRescue", true, "", undefined);
		},
	},
};


for (let rescue of Object.entries(KDPrisonRescues)) {
	KDJailEvents[rescue[0]] = {
		// Determines the weight
		weight: (guard, xx, yy) => {
			if (guard) return 0;
			if (KinkyDungeonStatsChoice.get("norescueMode")) return 0;
			if (KDGameData.JailTurns <= 70 || KDFactionRelation("Player", rescue[1].faction) < 0.09) return 0;
			return 100 * Math.min(0.05, Math.max(0.1, 0.35 * KDFactionRelation("Player", rescue[1].faction)) - 0.005 * (KDGameData.PriorJailbreaks ? (KDGameData.PriorJailbreaks - (KDGameData.PriorJailbreaksDecay || 0)) : 0));
		},
		// Occurs when the jail event triggers
		trigger: (guard, xx, yy) => {
			KDStartDialog(rescue[0], rescue[1].speaker, true, "", undefined);
		},
	};
}

/**
 *
 * @param {boolean} [override] - Override jailing requirement
 * @returns {boolean}
 */
function KDCanSpawnShopkeeper(override) {
	return (KinkyDungeonStatsChoice.get("easyMode") && (override || (KinkyDungeonFlags.get("JailIntro") && !KinkyDungeonFlags.get("JailRepeat"))) && !KinkyDungeonFlags.get("refusedShopkeeperRescue") && !KDIsPlayerTethered(KinkyDungeonPlayerEntity));
}


let KDGuardActions = {
	"jailWander": {
		weight: (guard, xx, yy) => {
			return 100;
		},
		assignable: (guard, xx, yy) => { // Can assign a new behavior on top of this one
			return KDistChebyshev(guard.gx - guard.x, guard.gy - guard.y) < 1.5;
		},
		assign: (guard, xx, yy) => {

		},
		handle: (guard, xx, yy) => {
			// Random meandering about the cell, sometimes stopping near the player
			if (KDRandom() < 0.2) {
				guard.gx = xx - 2;
				if (KDRandom() < 0.5) {
					guard.gx = xx;
					guard.gy = yy + Math.round(KDRandom() * KinkyDungeonJailLeashY * 2 - KinkyDungeonJailLeashY);
				} else
					guard.gy = KinkyDungeonPlayerEntity.y;
			}
			KDGameData.GuardApplyTime = 0;
		},
	},
	"release": {
		weight: (guard, xx, yy) => {
			let missingJailUniform = KinkyDungeonMissingJailUniform();
			return (KinkyDungeonCheckRelease() >= 0 && KinkyDungeonLockableItems().length == 0 && missingJailUniform.length < 1) ? 1000 : 0;
		},
		assign: (guard, xx, yy) => {
			KinkyDungeonInterruptSleep();
			if (KDGetEffSecurityLevel() >= KDSecurityLevelHiSec && KDGameData.RoomType != "Jail" && (!(KDMapData.JailFaction?.length > 0) || KDFactionRelation("Player", KDMapData.JailFaction[0]) < 0.4)) {
				KDStartDialog("JailerHiSec", guard.Enemy.name, true, "", guard);
			} else {
				KinkyDungeonSendDialogue(guard, TextGet("KinkyDungeonRemindJailRelease" + KinkyDungeonCheckRelease()).replace("EnemyName", TextGet("Name" + guard.Enemy.name)), "#ffff00", 4, 8);
				KDGameData.PrisonerState = 'parole';
				guard.CurrentAction = "jailWander";
				// Unlock all jail doors
				for (let T of Object.values(KDMapData.Tiles)) {
					if (T.Type == "Door") {
						if (T.Lock && T.Jail) {
							T.Lock = undefined;
							T.Type = undefined;
						}
					}
				}
			}
		},
		handle: (guard, xx, yy) => {
			guard.gx = KinkyDungeonPlayerEntity.x;
			guard.gy = KinkyDungeonPlayerEntity.y;
		},
	},
	"jailTease": {
		weight: (guard, xx, yy) => {
			return 10 + (KinkyDungeonGoddessRep.Ghost + 50);
		},
		assign: (guard, xx, yy) => {
			// Always a random chance to tease
			guard.CurrentAction = "jailTease";
		},
		handle: (guard, xx, yy, delta) => {
			let playerHasVibrator = Array.from(KinkyDungeonAllRestraint()).some(i => KDRestraint(i).allowRemote);
			guard.gx = xx - 2;
			guard.gy = yy;
			if (playerHasVibrator) {
				let extraCharge = Math.round(2 + (KinkyDungeonGoddessRep.Ghost + 50) * KDRandom() * 0.15);
				KinkyDungeonSendEvent("remoteVibe", {enemy: guard.Enemy.name, power: extraCharge, overcharge: true, noSound: false});
			} else {
				let touchesPlayer = KinkyDungeonCheckLOS(KinkyDungeonJailGuard(), KinkyDungeonPlayerEntity, KDistChebyshev(guard.x - KinkyDungeonPlayerEntity.x, guard.y - KinkyDungeonPlayerEntity.y), 1.5, false, false);
				if (touchesPlayer) {
					KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer - 5, 0);
					let dmg = KinkyDungeonDealDamage({damage: guard.Enemy.power * 1, type: guard.Enemy.dmgType}, undefined, undefined, true);
					if (dmg && dmg.string)
						KinkyDungeonSendTextMessage(5, TextGet("Attack" + guard.Enemy.name).replace("DamageTaken", dmg.string), "yellow", 3);
				} else {
					guard.gx = KinkyDungeonPlayerEntity.x;
					guard.gy = KinkyDungeonPlayerEntity.y;
				}
			}
			if (KDRandom() < 0.02 || (KinkyDungeonStatStamina < 10 && KDRandom() < 0.1))
				guard.CurrentAction = "jailWander";
		}
	},
	"bindings": {
		weight: (guard, xx, yy) => {
			let missingJailUniform = KinkyDungeonMissingJailUniform();
			let tooMuchRestraint = KinkyDungeonTooMuchRestraint();
			let lockableRestraint = KinkyDungeonLockableItems();

			return (
					lockableRestraint.length > 0
					|| missingJailUniform.length > 0
					|| (tooMuchRestraint.length > 0 && KDGameData.JailRemoveRestraintsTimer > KinkyDungeonJailRemoveRestraintsTimerMin)) ? (100 + (missingJailUniform.length > 0 ? 100 : 0)) : 0;
		},
		assign: (guard, xx, yy) => {
			let missingJailUniform = KinkyDungeonMissingJailUniform();
			let tooMuchRestraint = KinkyDungeonTooMuchRestraint();
			let lockableRestraint = KinkyDungeonLockableItems();

			if (missingJailUniform.length > 0 || KDRandom() < 0.2) {
				if (tooMuchRestraint.length > 0 && (KDRandom() < 0.5 || missingJailUniform.length < 1) && KDGameData.JailRemoveRestraintsTimer > KinkyDungeonJailRemoveRestraintsTimerMin) {
					let group = "";
					if (tooMuchRestraint.includes("ItemMouth3")) group = "ItemMouth3";
					else if (tooMuchRestraint.includes("ItemMouth2")) group = "ItemMouth2";
					else if (tooMuchRestraint.includes("ItemMouth")) group = "ItemMouth";
					else group = tooMuchRestraint[Math.floor(tooMuchRestraint.length * KDRandom())];
					if (group) {
						guard.CurrentAction = "jailRemoveRestraints";
						guard.CurrentRestraintSwapGroup = group;
					}

					KinkyDungeonSendDialogue(guard, TextGet("KinkyDungeonJailerRemove").replace("EnemyName", TextGet("Name" + guard.Enemy.name)), "#ffff00", 4, 3);
				} else if (missingJailUniform.length > 0) {
					let group = "";
					if (missingJailUniform.includes("ItemMouth3")) group = "ItemMouth3";
					else if (missingJailUniform.includes("ItemMouth2")) group = "ItemMouth2";
					else if (missingJailUniform.includes("ItemMouth")) group = "ItemMouth";
					else group = missingJailUniform[Math.floor(missingJailUniform.length * KDRandom())];
					if (group) {
						guard.CurrentAction = "jailAddRestraints";
						guard.CurrentRestraintSwapGroup = group;
					}

					KinkyDungeonSendDialogue(guard, TextGet("KinkyDungeonJailerAdd").replace("EnemyName", TextGet("Name" + guard.Enemy.name)), "#ffff00", 4, 3);
				}
			} else if (lockableRestraint.length > 0) {
				let group = "";
				if (lockableRestraint.includes("ItemMouth3")) group = "ItemMouth3";
				else if (lockableRestraint.includes("ItemMouth2")) group = "ItemMouth2";
				else if (lockableRestraint.includes("ItemMouth")) group = "ItemMouth";
				else group = lockableRestraint[Math.floor(lockableRestraint.length * KDRandom())];
				if (group) {
					guard.CurrentAction = "jailLockRestraints";
					guard.CurrentRestraintSwapGroup = group;
				}

				KinkyDungeonSendDialogue(guard, TextGet("KinkyDungeonJailerLock").replace("EnemyName", TextGet("Name" + guard.Enemy.name)), "#ffff00", 4, 3);
			}
		},
		handle: (guard, xx, yy, delta) => {
			// Dummy, this one assigns to a different style
		},
	},
	"jailRemoveRestraints": {
		weight: (guard, xx, yy) => {
			return 0; // Assigned by JailBindings
		},
		assign: (guard, xx, yy) => {
			// Assigned by JailBindings
		},
		handle: (guard, xx, yy, delta) => {
			let applyTime = 2;
			let playerDist = Math.sqrt((guard.x - KinkyDungeonPlayerEntity.x)*(guard.x - KinkyDungeonPlayerEntity.x) + (guard.y - KinkyDungeonPlayerEntity.y)*(guard.y - KinkyDungeonPlayerEntity.y));
			let touchesPlayer = KinkyDungeonCheckLOS(guard, KinkyDungeonPlayerEntity, playerDist, 1.5, false, false);
			if (touchesPlayer) {
				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 2);
				let oldRestraintItem = KinkyDungeonGetRestraintItem(guard.CurrentRestraintSwapGroup);
				if (KDGameData.GuardApplyTime > applyTime) {
					if (oldRestraintItem && KDRestraint(oldRestraintItem) && !KDRestraint(oldRestraintItem).noJailRemove) {
						KinkyDungeonRemoveRestraint(KDRestraint(oldRestraintItem).Group, false, false, false);
						let msg = TextGet("KinkyDungeonRemoveRestraints")
							.replace("EnemyName", TextGet("Name" + guard.Enemy.name));
						//let msg = TextGet("Attack" + guard.Enemy.name + "RemoveRestraints");
						if (oldRestraintItem) msg = msg.replace("OldRestraintName", TextGet("Restraint"+oldRestraintItem.name));
						KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					}
					guard.CurrentAction = "jailWander";
					guard.gx = KinkyDungeonPlayerEntity.x;
					guard.gy = KinkyDungeonPlayerEntity.y;
					KDGameData.GuardApplyTime = 0;
				} else if (oldRestraintItem) {
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartRemoving")
						.replace("EnemyName", TextGet("Name" + guard.Enemy.name))
						.replace("RestraintName", TextGet("Restraint" + oldRestraintItem.name)), "yellow", 2, true);
					KDGameData.GuardApplyTime += delta;
				} else {
					guard.CurrentAction = "jailWander";
					guard.gx = KinkyDungeonPlayerEntity.x;
					guard.gy = KinkyDungeonPlayerEntity.y;
					KDGameData.GuardApplyTime = 0;
				}
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			} else {
				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 2);
				KDGameData.GuardApplyTime = 0;
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			}
		},
	},
	"jailAddRestraints": {
		weight: (guard, xx, yy) => {
			return 0; // Assigned by JailBindings
		},
		assign: (guard, xx, yy) => {
			// Assigned by JailBindings
		},
		handle: (guard, xx, yy, delta) => {
			let applyTime = 2;
			let playerDist = Math.sqrt((guard.x - KinkyDungeonPlayerEntity.x)*(guard.x - KinkyDungeonPlayerEntity.x) + (guard.y - KinkyDungeonPlayerEntity.y)*(guard.y - KinkyDungeonPlayerEntity.y));
			let touchesPlayer = KinkyDungeonCheckLOS(guard, KinkyDungeonPlayerEntity, playerDist, 1.5, false, false);
			if (touchesPlayer) {
				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 7);
				let jrest = KinkyDungeonGetJailRestraintForGroup(guard.CurrentRestraintSwapGroup);
				let newRestraint = jrest.restraint;
				if (KDGameData.GuardApplyTime > applyTime) {
					if (newRestraint) {
						let oldRestraintItem = KinkyDungeonGetRestraintItem(guard.CurrentRestraintSwapGroup);
						let added = KinkyDungeonAddRestraintIfWeaker(newRestraint, 0,
							true, undefined, undefined, undefined, undefined, KDGetFaction(KinkyDungeonJailGuard()),
							KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard(), undefined, undefined, undefined, undefined, (jrest.variant && KDApplyVariants[jrest.variant]) ? KDApplyVariants[jrest.variant] : undefined);
						if (added) {
							let restraintModification = oldRestraintItem ? "ChangeRestraints" : "AddRestraints";
							let msg = TextGet("KinkyDungeon" + restraintModification).replace("EnemyName", TextGet("Name" + guard.Enemy.name));
							if (oldRestraintItem) msg = msg.replace("OldRestraintName", TextGet("Restraint"+oldRestraintItem.name));
							msg = msg.replace("NewRestraintName", TextGet("Restraint"+newRestraint.name));
							KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
						} else
							KinkyDungeonSendTextMessage(5, TextGet("KinkyDungeonJailerCheck"), "yellow", 3, true);
					}
					guard.CurrentAction = "jailWander";
					guard.gx = KinkyDungeonPlayerEntity.x;
					guard.gy = KinkyDungeonPlayerEntity.y;
					KDGameData.GuardApplyTime = 0;
				} else if (newRestraint) {
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartAdding")
						.replace("RestraintName", TextGet("Restraint" + newRestraint.name))
						.replace("EnemyName", TextGet("Name" + guard.Enemy.name)),
					"yellow", 2, true);

					KDGameData.GuardApplyTime += delta;
				}
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			} else {
				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 7);
				KDGameData.GuardApplyTime = 0;
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			}
		},
	},
	"jailLockRestraints": {
		weight: (guard, xx, yy) => {
			return 0; // Assigned by JailBindings
		},
		assign: (guard, xx, yy) => {
			// Assigned by JailBindings
		},
		handle: (guard, xx, yy, delta) => {
			let applyTime = 2;
			let playerDist = Math.sqrt((guard.x - KinkyDungeonPlayerEntity.x)*(guard.x - KinkyDungeonPlayerEntity.x) + (guard.y - KinkyDungeonPlayerEntity.y)*(guard.y - KinkyDungeonPlayerEntity.y));
			let touchesPlayer = KinkyDungeonCheckLOS(guard, KinkyDungeonPlayerEntity, playerDist, 1.5, false, false);
			if (touchesPlayer) {

				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 2);
				let oldRestraintItem = KinkyDungeonGetRestraintItem(guard.CurrentRestraintSwapGroup);
				if (KDGameData.GuardApplyTime > applyTime) {
					if (oldRestraintItem && !oldRestraintItem.lock && KinkyDungeonIsLockable(KDRestraint(oldRestraintItem))) {
						let lock = KinkyDungeonGenerateLock(true, KDGetEffLevel(),false, undefined, {enemy: KinkyDungeonJailGuard()});
						KinkyDungeonLock(oldRestraintItem, lock);
						let msg = TextGet("KinkyDungeonJailerFinishLocking")
							.replace("EnemyName", TextGet("Name" + guard.Enemy.name))
							.replace("RestraintName", TextGet("Restraint"+oldRestraintItem.name))
							.replace("LockType", TextGet("Kinky" + lock + "Lock"));
						KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					}
					guard.CurrentAction = "jailWander";
					guard.gx = KinkyDungeonPlayerEntity.x;
					guard.gy = KinkyDungeonPlayerEntity.y;
					KDGameData.GuardApplyTime = 0;
				} else if (oldRestraintItem) {
					KinkyDungeonSendActionMessage(4, TextGet("KinkyDungeonJailerStartLocking")
						.replace("EnemyName", TextGet("Name" + guard.Enemy.name))
						.replace("RestraintName", TextGet("Restraint" + oldRestraintItem.name)), "yellow", 2, true);
					KDGameData.GuardApplyTime += delta;
				} else {
					guard.CurrentAction = "jailWander";
					guard.gx = guard.x;
					guard.gy = guard.y;
					KDGameData.GuardApplyTime = 0;
				}
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			} else {
				KDGameData.GuardTimer = Math.max(KDGameData.GuardTimer, 2);
				KDGameData.GuardApplyTime = 0;
				guard.gx = KinkyDungeonPlayerEntity.x;
				guard.gy = KinkyDungeonPlayerEntity.y;
			}
		},
	},
	"jailLeashTour": {
		weight: (guard, xx, yy) => {
			KDGameData.KinkyDungeonJailTourTimer = 0;
			return (KDGameData.SleepTurns < 1 && KDGameData.KinkyDungeonJailTourTimer < 1 && KinkyDungeonGoddessRep.Ghost >= -45) ? (5 + Math.max(0, (50 + KinkyDungeonGoddessRep.Ghost)/5)) : 0;
		},
		assign: (guard, xx, yy) => {
			guard.RemainingJailLeashTourWaypoints = 2 + Math.ceil(KDRandom() * 4);
			guard.CurrentAction = "jailLeashTour";
			guard.KinkyDungeonJailTourInfractions = 0;
			KinkyDungeonInterruptSleep();
			let msg = TextGet("KinkyDungeonRemindJailTourStart").replace("EnemyName", TextGet("Name" + guard.Enemy.name));

			KinkyDungeonSendDialogue(guard, msg, "#ffff00", 4, 9);
		},
		handle: (guard, xx, yy, delta) => {
			if (KDGameData.KinkyDungeonJailTourTimer > 0) {
				KDGameData.KinkyDungeonJailTourTimer = Math.max(0, KDGameData.KinkyDungeonJailTourTimer - delta);
			}
			KinkyDungeonSetFlag("nojailbreak", 2);
			KinkyDungeonSetFlag("noclosedoors", 2);
			KinkyDungeonSetFlag("notickguardtimer", 7);
			KinkyDungeonHandleLeashTour(xx, yy, "tour");
		},
	},
	"jailLeashTransfer": {
		weight: (guard, xx, yy) => {
			KDGameData.KinkyDungeonJailTourTimer = 0;
			return (KDGameData.JailTurns > 30 && KinkyDungeonRandomJailPoint(["jail"], [KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)])) ? 5 : 0;
		},
		assign: (guard, xx, yy) => {
			guard.RemainingJailLeashTourWaypoints = 1;
			guard.CurrentAction = "jailLeashTransfer";
			guard.KinkyDungeonJailTourInfractions = 0;
			KinkyDungeonInterruptSleep();
			let msg = TextGet("KinkyDungeonRemindJailTourStartCell").replace("EnemyName", TextGet("Name" + guard.Enemy.name));

			KinkyDungeonSendDialogue(guard, msg, "#ffff00", 4, 9);
		},
		handle: (guard, xx, yy, delta) => {
			if (KDGameData.KinkyDungeonJailTourTimer > 0) {
				KDGameData.KinkyDungeonJailTourTimer = Math.max(0, KDGameData.KinkyDungeonJailTourTimer - delta);
			}
			KinkyDungeonSetFlag("nojailbreak", 2);
			KinkyDungeonSetFlag("noclosedoors", 2);
			KinkyDungeonSetFlag("notickguardtimer", 7);
			KinkyDungeonHandleLeashTour(xx, yy, "transfer");
		},
	},
};


let KinkyDungeonJailRemoveRestraintsTimerMin = 90;
let KinkyDungeonJailedOnce = false;
let KDJailReleaseTurns = [
	{minSub: 0, releaseTurns: 250},
	{minSub: 5, releaseTurns: 140},
	{minSub: 40, releaseTurns: 80},
	{minSub: 90, releaseTurns: 40},
];

let KDSecurityLevelHiSec = 0;

/**
 * @type {Record<string, {overridelowerpriority: boolean, priority: number, jail: boolean, parole: boolean, restraints: {Name: string, Level: number, Variant?: string, Condition?: string}[]}>}
*/
let KDJailOutfits = {
	"jailer": {
		overridelowerpriority: false,
		priority: -1,
		jail: true,
		parole: false,
		restraints: [
			{Name: "Stuffing", Level: 20},
			{Name: "TrapGag", Level: 20},
			{Name: "HighsecBallGag", Level: 50, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "HighsecBallGag", Level: 40},
			{Name: "HighsecMuzzle", Level: 70},
			{Name: "FeetShackles", Level: 25},
			{Name: "HighsecShackles", Level: 40},
			{Name: "LegShackles", Level: 35},
			{Name: "HighsecLegbinder", Level: 35},
			{Name: "WristShackles", Level: 0},
			{Name: "TrapArmbinder", Level: 40},
			{Name: "HighsecArmbinder", Level: 70},
			{Name: "HighsecBoxbinder", Level: 70},
			{Name: "HighsecStraitjacket", Level: 70},
			{Name: "PrisonBelt", Level: 30},
			{Name: "TrapPlug", Level: 30},
			{Name: "TrapPlug2", Level: 45},
			{Name: "TrapPlug3", Level: 60},
			{Name: "TrapPlug4", Level: 75},
			{Name: "TrapPlug5", Level: 90},
			{Name: "TrapBlindfold", Level: 35},
			{Name: "HighsecLegbinder", Level: 95},
			{Name: "TrapBoots", Level: 60},
		],
	},
	"ropeRestraints": {
		overridelowerpriority: false,
		priority: 1,
		jail: true,
		parole: true,
		restraints: [
			{Name: "RopeSnakeCuffs", Level: 0},
			{Name: "RopeSnakeArmsWrist", Level: 0},
			{Name: "RopeSnakeFeet", Level: 20},
			{Name: "RopeSnakeCrotch", Level: 10},
			{Name: "RopeSnakeLegs", Level: 30},
			{Name: "RopeSnakeHogtie", Level: 100},
		],
	},
	"latexRestraints": {
		overridelowerpriority: false,
		priority: 1,
		jail: true,
		parole: false,
		restraints: [
			{Name: "LatexBoots", Level: 40},
			{Name: "LatexBallGag", Level: 10, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "LatexBallGag", Level: 0},
			{Name: "LatexCorset", Level: 65},
			{Name: "LatexLegbinder", Level: 80},
			{Name: "LatexArmbinder", Level: 30},
			{Name: "LatexStraitjacket", Level: 60},
			{Name: "LatexCatsuit", Level: 100},
		],
	},
	"wolfRestraints": {
		overridelowerpriority: true,
		priority: 2,
		jail: true,
		parole: false,
		restraints: [
			{Name: "WolfCuffs", Level: 0},
			{Name: "WolfArmbinder", Level: 30},
			{Name: "WolfAnkleCuffs", Level: 10},
			{Name: "WolfHarness", Level: 20},
			{Name: "ControlHarness", Level: 80},
			{Name: "WolfBallGag", Level: 45, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "WolfBallGag", Level: 30},
			{Name: "WolfCollar", Level: 0},
			{Name: "WolfPanties", Level: 60},
		],
	},
	"expRestraints": {
		overridelowerpriority: true,
		priority: 2,
		jail: true,
		parole: false,
		restraints: [
			{Name: "ExpArmbinder", Level: 0},
			{Name: "ExpArmbinderHarness", Level: 60},
			{Name: "BlacksteelAnkleCuffs", Level: 30},
			{Name: "LatexBallGag", Level: 25, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "LatexBallGag", Level: 5},
			{Name: "ExpCollar", Level: 40},
			{Name: "ExpBoots", Level: 50},
		],
	},
	"dragonRestraints": {
		overridelowerpriority: true,
		priority: 2,
		jail: true,
		parole: false,
		restraints: [
			{Name: "ScaleArmCuffs", Level: 0},
			{Name: "DragonStraps", Level: 20},
			{Name: "ScaleLegCuffs", Level: 60},
			{Name: "ScaleAnkleCuffs", Level: 10},
			{Name: "DragonBoots", Level: 90},
			{Name: "DragonBallGag", Level: 45, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "DragonBallGag", Level: 30},
			{Name: "DragonMuzzleGag", Level: 60},
			{Name: "DragonCollar", Level: 0},
		],
	},
	"dollsmith": {
		overridelowerpriority: true,
		priority: 7,
		jail: true,
		parole: true,
		restraints: [
			{Name: "ControlHarness", Level: 0},
			{Name: "TrackingCollar", Level: 20},
			{Name: "CyberBelt", Level: 0},
			{Name: "CyberBra", Level: 0},
			{Name: "CyberBallGag", Level: 45, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "CyberBallGag", Level: 20},
			{Name: "CyberPlugGag", Level: 40},
			{Name: "CyberMuzzle", Level: 75},
			{Name: "CyberDollJacket", Level: 60},
			{Name: "CyberArmCuffs", Level: 0},
			{Name: "CyberAnkleCuffs", Level: 40},
			{Name: "CyberLegCuffs", Level: 30},
			{Name: "CyberHeels", Level: 49},
		],
	},
	"kittyRestraints": {
		overridelowerpriority: false,
		priority: 2,
		jail: true,
		parole: true,
		restraints: [
			{Name: "KittyPaws", Level: 0},
			{Name: "KittyGag", Level: 25, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "KittyGag", Level: 10},
			{Name: "KittyMuzzle", Level: 45},
			{Name: "KittyBlindfold", Level: 60},
			{Name: "KittySuit", Level: 80},
			{Name: "KittyPetSuit", Level: 100},
		],
	},
	"obsidianRestraints": {
		overridelowerpriority: false,
		priority: 2,
		jail: true,
		parole: false,
		restraints: [
			{Name: "ObsidianArmCuffs", Level: 0},
			{Name: "ObsidianLegCuffs", Level: 60},
			{Name: "ObsidianAnkleCuffs", Level: 10},
			{Name: "ObsidianGag", Level: 45, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "ObsidianGag", Level: 30},
			{Name: "ObsidianCollar", Level: 0},
		],
	},
	"leatherRestraints": {
		overridelowerpriority: false,
		priority: 1,
		jail: true,
		parole: true,
		restraints: [
			{Name: "LeatherArmCuffs", Level: 5},
			{Name: "SturdyLeatherBeltsArms", Level: 40},
			{Name: "SturdyLeatherBeltsLegs", Level: 80},
			{Name: "SturdyLeatherBeltsFeet", Level: 70},
			{Name: "TrapArmbinder", Level: 50},
			{Name: "TrapLegbinder", Level: 60},
			{Name: "TrapMittens", Level: 20},
			{Name: "PanelGag", Level: 35, Variant: "AntiMagic", Condition: "Mage"},
			{Name: "TrapGag", Level: 10},
			{Name: "PanelGag", Level: 30},
			{Name: "TrapHarness", Level: 45},
		],
	},
	"dressRestraints": {
		overridelowerpriority: false,
		priority: 1,
		jail: true,
		parole: true,
		restraints: [
			{Name: "BindingDress", Level: 0},
			{Name: "NippleClamps", Level: 60},
			{Name: "DressBra", Level: 60},
		],
	},
};

/**
 * @type {Record<string, (r: KDJailRestraint) => boolean>}
 */
let KDJailConditions = {
	Mage: (r) => {
		return KinkyDungeonStatManaMax > 17;
	},
	Warrior: (r) => {
		return KinkyDungeonStatWillMax > 17;
	},
	Rogue: (r) => {
		return KinkyDungeonStatStaminaMax > 17;
	},
	Kinky: (r) => {
		return KinkyDungeonStatDistractionMax > 17;
	},
};