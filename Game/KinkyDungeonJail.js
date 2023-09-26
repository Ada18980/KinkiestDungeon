"use strict";

/** Time spent in cage before guards start getting teleported */
let KDMaxCageTime = 100;

/** Only these have jail events */
let KDJailFilters = ['jail'];

function KDAssignGuardAction(guard, xx, yy) {
	let eventWeightTotal = 0;
	let eventWeights = [];

	for (let event of Object.values(KDGuardActions)) {
		eventWeights.push({event: event, weight: eventWeightTotal});
		eventWeightTotal += event.weight(guard, xx, yy);
	}

	let selection = KDRandom() * eventWeightTotal;

	for (let L = eventWeights.length - 1; L >= 0; L--) {
		if (selection > eventWeights[L].weight) {
			eventWeights[L].event.assign(guard, xx, yy);
			return;
		}
	}
}

function KDGetJailEvent(guard, xx, yy) {
	let eventWeightTotal = 0;
	let eventWeights = [];

	for (let event of Object.values(KDJailEvents)) {
		eventWeights.push({event: event, weight: eventWeightTotal});
		eventWeightTotal += event.weight(guard, xx, yy);
	}

	let selection = KDRandom() * eventWeightTotal;

	for (let L = eventWeights.length - 1; L >= 0; L--) {
		if (selection > eventWeights[L].weight) {
			return eventWeights[L].event.trigger;
		}
	}
	return (g, x, y) => {};
}


function KinkyDungeonLoseJailKeys(Taken, boss, enemy) {
	// KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'chase'
	if (KinkyDungeonFlags.has("BossUnlocked")) return;
	if (KDGameData.JailKey) {
		if (Taken) {
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonRemoveJailKey"), "#ff0000", 3);
			if (enemy) {
				if (!enemy.items) enemy.items = [];
				if (!enemy.items.includes("Keyring"))
					enemy.items.push("Keyring");
			}
		}
		KDGameData.JailKey = false;
	}
	if (boss) {
		KDGameData.JailKey = false;
		KDMapData.GroundItems = KDMapData.GroundItems.filter((item) => {return item.name != "Keyring";});
	}
}

function KinkyDungeonUpdateJailKeys() {
	if (!KDGameData.JailKey) {
		let altRoom = KinkyDungeonAltFloor(KDGameData.RoomType);
		if ((!altRoom || !altRoom.nokeys) && (!KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) || !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel).nokeys)) {
			let keyCount = KDMapData.GroundItems.filter((item) => {return item.name == "Keyring";}).length;
			for (let i = 0; i < 2 - keyCount; i++) {
				KinkyDungeonPlaceJailKeys();
			}
		}
	}
}

function KinkyDungeonAggroFaction(faction, noAllyRepPenalty) {
	let list = [];
	let list2 = [];
	for (let enemy of KDMapData.Entities) {
		if (enemy.Enemy.tags.peaceful) continue;
		let enemyfaction = KDGetFaction(enemy);
		if ((enemyfaction == faction || KDFactionRelation(enemyfaction, faction) > 0.4)) {
			let dist = KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y);
			if (KinkyDungeonCheckLOS(enemy, KinkyDungeonPlayerEntity, dist, enemy.Enemy.visionRadius, false, true)) {
				list.push(enemy);
			}
		} else if (enemyfaction == "Player" && KDGetFactionOriginal(enemy) == faction) {
			let dist = KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y);
			if (KinkyDungeonCheckLOS(enemy, KinkyDungeonPlayerEntity, dist, enemy.Enemy.visionRadius, false, true)) {
				list2.push(enemy);
			}
		}
	}
	if (faction) {
		let amount = 0.04;
		if (list.length > 0) {
			for (let e of list) {
				if (!e.allied) {
					KDMakeHostile(e);
				}
			}

			KinkyDungeonChangeFactionRep(faction, -amount);
			return true;
		} else if (list2.length > 0 && !noAllyRepPenalty) {
			KinkyDungeonChangeFactionRep(faction, -amount);
			return false;
		}
	}

	return false;
}

function KinkyDungeonPlayerIsVisibleToJailers() {
	let list = [];
	for (let enemy of KDMapData.Entities) {
		if (KDHostile(enemy) && !(enemy.rage > 0) && (enemy.Enemy.tags.leashing || enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
			if (KinkyDungeonTrackSneak(enemy, 0, KinkyDungeonPlayerEntity) && KinkyDungeonCheckLOS(
				enemy,
				KinkyDungeonPlayerEntity,
				KDistChebyshev(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y),
				enemy.Enemy.visionRadius,
				false,
				true,
				1)) {
				list.push(enemy);
			}
		}
	}
	if (list.length > 0) return list[Math.floor(Math.random() * list.length)];
	return null;
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KinkyDungeonCanPlay(enemy) {
	return (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail' || (!KDHostile(enemy)
		&& !(KDAllied(enemy) && !KDEnemyHasFlag(enemy, "allyPlay"))))
		&& (enemy.ambushtrigger || !KDAIType[KDGetAI(enemy)] || !KDAIType[KDGetAI(enemy)].ambush)
		&& !enemy.Enemy.Behavior?.noPlay;
}

function KinkyDungeonCheckRelease() {
	if (KDGameData.RoomType) {
		let altRoom = KinkyDungeonAltFloor(KDGameData.RoomType);
		if (altRoom && altRoom.noRelease) return altRoom.releaseOnLowSec ? (KinkyDungeonGoddessRep.Prisoner >= KDSecurityLevelHiSec ? -1 : 1) : -1;
	}
	let sub = KinkyDungeonGoddessRep.Ghost + 50;
	let security = KinkyDungeonGoddessRep.Prisoner + 50;
	if (sub == undefined || isNaN(sub)) sub = 0;
	if (security == undefined || isNaN(security)) security = 0;
	let turns = KDGameData.JailTurns - security;
	for (let i = 0; i < KDJailReleaseTurns.length; i++) {
		let condition = KDJailReleaseTurns[i];
		if (sub >= condition.minSub && turns >= condition.releaseTurns) return i;
	}
	return -1;
}

/** Max turns for the alert timer until the whole map becomes hostile */
let KDMaxAlertTimer = 14;
let KDMaxAlertTimerAggro = 300;

/**
 *
 * @param {string} action
 * @param {{enemy?: entity, x?: number, y?: number, faction?: string}} data
 */
function KinkyDungeonAggroAction(action, data) {
	let e = null;
	switch (action) {
		// Attacking ALWAYS makes the enemy angry
		case 'attack':
			KinkyDungeonStartChase(data.enemy, "Attack");
			break;

		// Magic ALWAYS makes the enemy angry
		case 'magic':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonStartChase(e, "Spell");
			}
			break;
		// Magic ALWAYS makes the enemy angry
		case 'item':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonStartChase(e, "SpellItem");
			}
			break;

		// Having a guard called ALWAYS makes the enemy angry
		case 'call':
			KinkyDungeonStartChase(data.enemy, "");
			break;

		// Chests ALWAYS make the enemy angry
		case 'chest':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonStartChase(e, "Chest");
			}
			if (data.faction)
				KinkyDungeonAggroFaction(data.faction);
			break;

		// Chests ALWAYS make the enemy angry
		case 'rubble':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonPlayExcuse(e, "Loot");
			}
			break;

		// Altars ALWAYS make the enemy angry
		case 'shrine':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonStartChase(e, "Shrine");
			}
			break;

		// Chests ALWAYS make the enemy angry
		case 'orb':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonStartChase(e, "Orb");
			}
			break;

		case 'struggle':
			if (data.enemy) // KDGameData.PrisonerState == "parole" &&
				KinkyDungeonPlayExcuse(data.enemy, "Struggle");
			break;

		case 'unrestrained':
			if (KDGameData.PrisonerState == "parole" && data.enemy)
				KinkyDungeonPlayExcuse(data.enemy, "Free");
			break;

		// Roaming free only makes them angry if you are a prisoner
		case 'jailbreak':
			if (KDGameData.PrisonerState == "jail"){
				KinkyDungeonStartChase(data.enemy, "Jailbreak");
			}
			break;

		// Roaming free only makes them angry if you are a prisoner
		case 'key':
			e = KinkyDungeonPlayerIsVisibleToJailers();
			if (e) {
				KinkyDungeonPlayExcuse(e, "Key");
			}
			break;
	}
}

/**
 * @type {string[]}
 */
let KDLocalChaseTypes = ["Refusal", "Attack", "Spell", "SpellItem", "Shrine", "Orb", "Chest"];
/**
 * @type {string[]}
 */
let KDSevereTypes = ["Attack"];

/**
 *
 * @param {entity} enemy
 * @param {string} Type
 * @param {string} [faction]
 * @param {boolean} [force]
 */
function KinkyDungeonStartChase(enemy, Type, faction, force) {
	if (!force && enemy && (!enemy.aware && !(enemy.vp > 0.5))) return;
	if ((!enemy && !KDLocalChaseTypes.includes(Type))) {
		if (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') {
			KinkyDungeonChangeRep("Ghost", -10);
			if (KinkyDungeonFlags.has("PlayerCombat") || (KinkyDungeonPlayerDamage && !isUnarmed(KinkyDungeonPlayerDamage)))
				KinkyDungeonChangeRep("Prisoner", 20);
			KDGameData.PrisonerState = "chase";
			KinkyDungeonInterruptSleep();
		}
		if (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'chase')
			KDGameData.PrisonerState = "chase";
	} else if (KDLocalChaseTypes.includes(Type) && (enemy || faction)) {
		for (let e of KDMapData.Entities) {
			if ((KDHostile(e)
				|| (KDSevereTypes.includes(Type)
					&& KDFactionAllied(faction ? faction : KDGetFaction(enemy), e)
					&& KDGetHonor(KDGetFaction(e), faction ? faction : KDGetFaction(enemy)) < 0.1))
				&& (!enemy || !enemy.Enemy.tags.peaceful)
				&& KinkyDungeonCheckLOS(e, KinkyDungeonPlayerEntity, 7, 8, false, false)) {
				if (!enemy || e == enemy || KDEnemyCanSignalOthers(enemy)) {
					if (!(e.hostile > 0) &&
						(e.Enemy.tags.jail || e.Enemy.tags.jailer || KDGetEnemyPlayLine(e))) {
						let h = KDGetFaction(e) == (faction ? faction : KDGetFaction(enemy)) ? "Defend" : "DefendHonor";
						let suff = KDGetEnemyPlayLine(e) ? KDGetEnemyPlayLine(e) + h : h;
						let index = ("" + Math.floor(Math.random() * 3));

						if (!e.dialogue || !e.dialogueDuration)
							KinkyDungeonSendDialogue(e, TextGet("KinkyDungeonRemindJailChase" + suff + index).replace("EnemyName", TextGet("Name" + e.Enemy.name)), KDGetColor(e), 7, (!KDGameData.PrisonerState) ? 3 : 5);
					}
					if (!e.hostile) e.hostile = KDMaxAlertTimerAggro;
					else KDMakeHostile(e);//e.hostile = Math.max(KDMaxAlertTimerAggro, e.hostile);
					e.ceasefire = undefined;
				}
			}
		}
	}

	if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") > -0.1 && !enemy.Enemy.tags.peaceful) {
		if (!enemy.hostile) KDMakeHostile(enemy);//enemy.hostile = KDMaxAlertTimerAggro;
		else KDMakeHostile(enemy);//Math.max(KDMaxAlertTimerAggro, enemy.hostile);
		enemy.ceasefire = undefined;
	}
	if (Type && enemy?.hostile && (enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
		let suff = KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) + Type : Type;
		let index = (Type == "Attack" || Type == "Spell") ? ("" + Math.floor(Math.random() * 3)) : "";

		if (!enemy.dialogue || !enemy.dialogueDuration)
			KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailChase" + suff + index).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, (!KDGameData.PrisonerState) ? 3 : 5);
	}
}

/**
 *
 * @param {entity} enemy
 * @param {string} Type
 */
function KinkyDungeonPlayExcuse(enemy, Type) {
	if (Type == "Free" && enemy && enemy.Enemy.noChaseUnrestrained) {
		return;
	}
	if (KinkyDungeonCanPlay(enemy) && !(enemy.playWithPlayer > 0) && enemy.aware && !(enemy.playWithPlayerCD > 0) && (enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
		enemy.playWithPlayer = 17;
		KinkyDungeonSetEnemyFlag(enemy, "playstart", 3);
		if (Type == "Key") {
			enemy.playWithPlayer = 30;
			enemy.playWithPlayerCD = enemy.playWithPlayer;
		}
		KDSetPlayCD(enemy, 2.5);
		let suff = KDGetEnemyPlayLine(enemy) ? KDGetEnemyPlayLine(enemy) + Type : Type;
		KinkyDungeonSendDialogue(enemy, TextGet("KinkyDungeonRemindJailPlay" + suff).replace("EnemyName", TextGet("Name" + enemy.Enemy.name)), KDGetColor(enemy), 4, 4);
	}
}

/**
 *
 * @param {entity} enemy
 * @param {number} mult
 * @param {number} base
 */
function KDSetPlayCD(enemy, mult, base = 10) {
	enemy.playWithPlayerCD = Math.max(enemy.playWithPlayerCD || 0, base * mult + (enemy.playWithPlayer || 0) * mult);
}

/**
 *
 * @param {string} Group
 * @returns {restraint}
 */
function KinkyDungeonGetJailRestraintForGroup(Group) {
	/**
	 * @type {restraint}
	 */
	let cand = null;
	let candLevel = 0;
	for (let r of KDGetJailRestraints()) {
		let level = 0;
		if (KinkyDungeonGoddessRep.Prisoner) level = Math.max(0, KinkyDungeonGoddessRep.Prisoner + 50);
		if (!r.Level || level >= r.Level) {
			let candidate = KinkyDungeonGetRestraintByName(r.Name);
			if (candidate.Group == Group && (!candidate.nonbinding || cand == null)) {
				if (candLevel == 0 || r.Level > candLevel) {
					cand = candidate;
					candLevel = candidate.nonbinding ? 0 : r.Level;
				}
			}
		}
	}
	return cand;
}

function KinkyDungeonGetJailRestraintLevelFor(Name) {
	for (let r of KDGetJailRestraints()) {
		if (r.Name === Name) {
			return r.Level;
		}
	}
	return -1;
}

/**
 *
 * @param {string[]} [filter] - Have to be in a jail, not a dropoff
 * @returns {boolean}
 */
function KinkyDungeonInJail(filter) {
	return KinkyDungeonPlayerInCell(false, false, filter);//KDGameData.KinkyDungeonSpawnJailers > 0 && KDGameData.KinkyDungeonSpawnJailers + 1 >= KDGameData.KinkyDungeonSpawnJailersMax;
}


function KinkyDungeonPlaceJailKeys() {
	let jailKeyList = [];

	// Populate the key
	for (let X = 1; X < KDMapData.GridWidth; X += 1)
		for (let Y = 1; Y < KDMapData.GridHeight; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))
				&& KDistChebyshev(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y) > 15
				&& KDistChebyshev(X - KDMapData.EndPosition.x, Y - KDMapData.EndPosition.y) > 15
				&& (!KDMapData.ShortcutPosition || KDistChebyshev(X - KDMapData.ShortcutPosition.x, Y - KDMapData.ShortcutPosition.y) > 15)
				&& (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OffLimits))
				jailKeyList.push({x:X, y:Y});

	let i = 0;

	while (jailKeyList.length > 0) {
		let N = Math.floor(KDRandom()*jailKeyList.length);
		let slot = jailKeyList[N];
		if (KDGameData.KeyringLocations && i < KDGameData.KeyringLocations.length) {
			slot = KDGameData.KeyringLocations[Math.floor(KDRandom() * KDGameData.KeyringLocations.length)];
		}
		if (i < 1000 && !KDMapData.GroundItems.some((item) => {return item.name == "Keyring" && KDistChebyshev(item.x - slot.x, item.y - slot.y) < KDMapData.GridHeight / 3;})) {
			KDMapData.GroundItems.push({x:slot.x, y:slot.y, name: "Keyring"});
		}
		i++;
		return true;
	}

}

function KinkyDungeonHandleJailSpawns(delta) {
	if (KDGameData.JailTurns) KDGameData.JailTurns += delta;
	else KDGameData.JailTurns = 1;
	if (KinkyDungeonInJail(KDJailFilters)) KDGameData.JailRemoveRestraintsTimer += delta;

	let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, ["jail"]);

	if (!nearestJail) return;

	let xx = nearestJail.x + KinkyDungeonJailLeashX;
	let yy = nearestJail.y;
	let playerInCell = (Math.abs(KinkyDungeonPlayerEntity.x - nearestJail.x) < KinkyDungeonJailLeashX - 1 && Math.abs(KinkyDungeonPlayerEntity.y - nearestJail.y) <= KinkyDungeonJailLeash);

	// This is an important piece to make it so guards don't clog up the jail space
	for (let enemy of KDMapData.Entities) {
		if (enemy.gxx == xx && enemy.gyy == yy && enemy != KinkyDungeonJailGuard()) {
			enemy.AI = KDGetAIOverride(enemy, "hunt") || "hunt";
		}
	}

	// Start jail event, like spawning a guard, spawning rescues, etc
	if (KinkyDungeonInJail(KDJailFilters) && KDGameData.PrisonerState == "jail" && (KDGameData.KinkyDungeonGuardSpawnTimer <= 1 || KDGameData.SleepTurns == 3) && !KinkyDungeonJailGuard() && playerInCell) {
		KDGetJailEvent(KinkyDungeonJailGuard(), xx, yy)(KinkyDungeonJailGuard(), xx, yy);
	} else if (KDGameData.KinkyDungeonGuardSpawnTimer > 0 && KDGameData.SleepTurns < 1 && !KinkyDungeonAngel()) KDGameData.KinkyDungeonGuardSpawnTimer -= delta;

	// Assign and handle the current jail action if there is a guard
	if (KinkyDungeonJailGuard() && KDGameData.KinkyDungeonGuardTimer > 0 && KDGameData.KinkyDungeonGuardTimerMax - KDGameData.KinkyDungeonGuardTimer > 6 && KDGameData.PrisonerState == 'jail') {
		if (KDGuardActions[KinkyDungeonJailGuard().CurrentAction] && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].assignable && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].assignable(KinkyDungeonJailGuard(), xx, yy)) {
			KDAssignGuardAction(KinkyDungeonJailGuard(), xx, yy);
		}
	}

	if (KinkyDungeonJailGuard()) {
		if (KDGuardActions[KinkyDungeonJailGuard().CurrentAction] && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].handle) {
			KDGuardActions[KinkyDungeonJailGuard().CurrentAction].handle(KinkyDungeonJailGuard(), xx, yy, delta);
		}

		// Return guard to wandering if the jail is over
		if (KDGameData.PrisonerState != 'jail') {
			KinkyDungeonJailGuard().CurrentAction = "jailWander";
		}

		KinkyDungeonJailGuard().gxx = KDGameData.PrisonerState == 'jail' && KDGameData.KinkyDungeonGuardTimer > 0 ? KinkyDungeonJailGuard().gx : xx;
		KinkyDungeonJailGuard().gyy = KDGameData.PrisonerState == 'jail' && KDGameData.KinkyDungeonGuardTimer > 0 ? KinkyDungeonJailGuard().gy : yy;
		if (KDGameData.KinkyDungeonGuardTimer > 0) {
			// Decrease timer when not on a tour
			if (!KinkyDungeonFlags.has("notickguardtimer") && !KinkyDungeonAngel()) {
				KDGameData.KinkyDungeonGuardTimer -= 1;
				if (KDGameData.KinkyDungeonGuardTimer <= 0) {
					KinkyDungeonJailGuard().gx = xx;
					KinkyDungeonJailGuard().gy = yy;
				}
			}
		} else {
			// Leave the cell and lock the door
			// Despawn jailer
			if (KinkyDungeonJailGuard()
				&& KinkyDungeonJailGuard().x == xx
				&& KinkyDungeonJailGuard().y == yy
				&& (!KinkyDungeonJailGuard().IntentAction || KinkyDungeonJailGuard().IntentAction.startsWith('jail'))
				&& KDGameData.PrisonerState
				&& !KinkyDungeonJailGuard().hostile
				&& !KinkyDungeonFlags.has("notickguardtimer")
				&& !KinkyDungeonFlags.has("nojailbreak")) {
				let g = KinkyDungeonJailGuard();
				console.log("Despawned guard");
				KDClearItems(g);
				KDSpliceIndex(KDMapData.Entities.indexOf(KinkyDungeonJailGuard()), 1);
				if (KinkyDungeonTilesGet((xx-1) + "," + yy) && KinkyDungeonTilesGet((xx-1) + "," + yy).Type == "Door") {
					KinkyDungeonMapSet(xx-1, yy, 'D');
					if (KDGameData.PrisonerState == 'jail')
						KinkyDungeonTilesGet((xx-1) + "," + yy).Lock = KinkyDungeonGenerateLock(true, MiniGameKinkyDungeonLevel);
					if (KDGameData.PrisonerState == 'jail' && KinkyDungeonVisionGet(g.x, g.y))
						KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonGuardDisappear").replace("EnemyName", TextGet("Name" + g.Enemy.name)), "#ff0000", 6);
					if (KinkyDungeonPlayerInCell(true))
						KinkyDungeonChangeRep("Ghost", 1 + KDGameData.KinkyDungeonPrisonExtraGhostRep);
					KDGameData.KinkyDungeonPrisonExtraGhostRep = 0;
				}
			} else if (!KinkyDungeonJailGuard().IntentAction || KinkyDungeonJailGuard().IntentAction.startsWith('jail')) {
				KinkyDungeonJailGuard().gx = xx;
				KinkyDungeonJailGuard().gy = yy;
			}
		}
	}

	// Unlock all jail doors when chasing
	if (!KDGameData.PrisonerState || KDGameData.PrisonerState == 'chase') {
		for (let T of Object.values(KDMapData.Tiles)) {
			if (T.Lock && T.Type == "Door" && T.Jail) T.Lock = undefined;
		}
	}

	if (!KinkyDungeonJailGuard()) {
		KDGameData.KinkyDungeonGuardTimer = 0;
	} else {
		if (KDHelpless(KinkyDungeonJailGuard())) {
			KDGameData.KinkyDungeonJailGuard = 0;
		}
		if (KinkyDungeonJailGuard() && KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y) > 10 && KDGameData.KinkyDungeonGuardTimer < 4) {
			KDGameData.KinkyDungeonJailGuard = 0;
		}
	}
	if (!KDMapData.Entities.includes(KinkyDungeonJailGuard())) {
		if (KDGameData.KinkyDungeonGuardSpawnTimer == 0 || KinkyDungeonJailGuard())
			KDGameData.KinkyDungeonGuardSpawnTimer = 14 + Math.floor(KDRandom() * (KDGameData.KinkyDungeonGuardSpawnTimerMax - KDGameData.KinkyDungeonGuardSpawnTimerMin));
		KDGameData.KinkyDungeonJailGuard = 0;
	}
}

function KinkyDungeonLockableItems() {
	let LockableGroups = [];
	for (let gr of KinkyDungeonStruggleGroupsBase) {
		let g = gr;
		if (gr == "ItemM") {
			g = "ItemMouth";
		}
		if (gr == "ItemH") {
			g = "ItemHead";
		}
		let currentItem = KinkyDungeonGetRestraintItem(g);
		if (currentItem && !currentItem.lock && KinkyDungeonIsLockable(KDRestraint(currentItem))) {
			LockableGroups.push(g);
		}
	}
	return LockableGroups;
}

function KinkyDungeonMissingJailUniform() {
	let MissingGroups = [];
	for (let gr of KinkyDungeonStruggleGroupsBase) {
		let g = gr;
		if (gr == "ItemM") {
			if (KinkyDungeonGetRestraintItem("ItemMouth2")) g = "ItemMouth3";
			else if (KinkyDungeonGetRestraintItem("ItemMouth")) g = "ItemMouth2";
			else g = "ItemMouth";
		}
		if (gr == "ItemH") {
			if (KinkyDungeonGetRestraintItem("ItemHood")) g = "ItemHood";
			else g = "ItemHood";
		}
		let rest = KinkyDungeonGetJailRestraintForGroup(g);
		let currentItem = KinkyDungeonGetRestraintItem(g);
		if (rest
			&& (!currentItem || (
				KDCanAddRestraint(rest,
					KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
					undefined,
					!KinkyDungeonStatsChoice.has("TightRestraints") ? true : undefined,
					undefined,
					KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard())
				&& (!currentItem.dynamicLink || !KDDynamicLinkList(currentItem, true).some((item) => {return rest.name == item.name;})))
			)
			&& (KinkyDungeonStatsChoice.get("arousalMode") || !rest.arousalMode)
			&& (KinkyDungeonStatsChoice.get("arousalModePlug") || rest.Group != "ItemButt")
			&& (KinkyDungeonStatsChoice.get("arousalModePiercing") || !rest.piercing)) {
			MissingGroups.push(g);
		}
	}
	return MissingGroups;
}

function KinkyDungeonTooMuchRestraint() {
	let Groups = ["ItemArms", "ItemHands", "ItemHead", "ItemMouth", "ItemMouth2", "ItemMouth3", "ItemHood", "ItemLegs", "ItemFeet", "ItemHands"];

	for (let g of KinkyDungeonStruggleGroupsBase) {
		let rest = KinkyDungeonGetJailRestraintForGroup(g);
		if (rest && !Groups.includes(g)) Groups.push(g);
	}
	let RemoveGroups = [];
	for (let g of Groups) {
		let rest = KinkyDungeonGetJailRestraintForGroup(g);
		let currentItem = KinkyDungeonGetRestraintItem(g);
		let cutoffpower = KinkyDungeonStatsChoice.get("KinkyPrison") ? -50 : 4;
		let lockMult = currentItem ? Math.max(1, KinkyDungeonGetLockMult(currentItem.lock, currentItem) - 0.5) : (currentItem && KinkyDungeonIsLockable(KDRestraint(currentItem)) ? 0.4 : 1);
		if (
			(!rest && currentItem && KDRestraint(currentItem).power * lockMult <= Math.max(cutoffpower + 0.1, rest ? rest.power : cutoffpower)) // There shouldnt be one here
			|| (rest && currentItem && currentItem && rest.name != currentItem.name
				&& (KDRestraint(currentItem).power < rest.power || KDRestraint(currentItem).power * lockMult <= Math.max(cutoffpower + 0.1, rest ? rest.power : cutoffpower))) // Wrong item equipped
		) {
			if (!currentItem || (!currentItem.curse && !KDRestraint(currentItem).curse && !KDRestraint(currentItem).enchanted))
				RemoveGroups.push(g);
		}
	}
	return RemoveGroups;
}

/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} type
 */
function KinkyDungeonHandleLeashTour(xx, yy, type) {
	// Remove the leash when we are done
	if (!KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints && KinkyDungeonJailGuard().x === KinkyDungeonJailGuard().NextJailLeashTourWaypointX && KinkyDungeonJailGuard().y === KinkyDungeonJailGuard().NextJailLeashTourWaypointY) {
		let leashItemToRemove = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
		if (leashItemToRemove) {
			KinkyDungeonRemoveRestraint("ItemNeckRestraints", false);
			let msg = TextGet("KinkyDungeonRemoveRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
			msg = msg.replace("OldRestraintName", TextGet("Restraint"+leashItemToRemove.name));
			KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
		}
		KDGameData.KinkyDungeonPrisonExtraGhostRep += 2;
		let entity = KinkyDungeonJailGuard() ? KinkyDungeonJailGuard() : KinkyDungeonPlayerEntity;
		let nearestJail = KinkyDungeonNearestJailPoint(entity.x, entity.y);
		let jailRadius = (nearestJail && nearestJail.radius) ? nearestJail.radius : 1.5;
		let playerInCell = nearestJail ? (Math.abs(KinkyDungeonPlayerEntity.x - nearestJail.x) < jailRadius - 1 && Math.abs(KinkyDungeonPlayerEntity.y - nearestJail.y) <= jailRadius)
			: null;
		if (!playerInCell) {
			let point = {x: nearestJail.x, y: nearestJail.y};//KinkyDungeonGetNearbyPoint(nearestJail.x, nearestJail.y, true, undefined, true);
			if (point) {
				KDMovePlayer(point.x, point.y, false);
			}
		}

		if (KinkyDungeonJailGuard()?.KinkyDungeonJailTourInfractions < 1) {
			let item = "CookieJailer";
			KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), TextGet("KinkyDungeonJailerReleaseGoodGirl").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name)), "#ffff00", 4, 9);
			KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonJailerReleaseGoodGirlMsg")
				.replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name))
				.replace("ItemName", TextGet("KinkyDungeonInventoryItem" + item)),
			"#88ff88", 1);
			KinkyDungeonChangeConsumable(KinkyDungeonFindConsumable(item), 1);
		}

		let enemy = KinkyDungeonEnemyAt(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (enemy) enemy.x += 1;
		KinkyDungeonJailGuard().CurrentAction = "jailWander";
		KDGameData.KinkyDungeonJailTourTimer = KDGameData.KinkyDungeonJailTourTimerMin + Math.floor((KDGameData.KinkyDungeonJailTourTimerMax - KDGameData.KinkyDungeonJailTourTimerMin) * KDRandom());
		KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().x;
		KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().y;
	} else {
		// Run the leash
		let playerDist = KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y);//Math.sqrt((KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x)*(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x) + (KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y)*(KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y));
		let wearingLeash = KinkyDungeonIsWearingLeash();
		if (!wearingLeash) {
			let touchesPlayer = KinkyDungeonCheckLOS(KinkyDungeonJailGuard(), KinkyDungeonPlayerEntity, playerDist, 1.5, false, false);
			if (touchesPlayer) {
				if (!KinkyDungeonGetRestraintItem("ItemNeck")) {
					let collar = KinkyDungeonGetRestraintByName("BasicCollar");
					KinkyDungeonAddRestraintIfWeaker(collar, KinkyDungeonJailGuard().Enemy.power, true, "", undefined, undefined, undefined, KDGetFaction(KinkyDungeonJailGuard()), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard());
					let msg = TextGet("KinkyDungeonAddRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
					msg = msg.replace("NewRestraintName", TextGet("Restraint"+collar.name));
					KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					KinkyDungeonJailGuard().NextJailLeashTourWaypointX = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().NextJailLeashTourWaypointY = KinkyDungeonJailGuard().y;
					KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().y;
				} else {
					let leash = KinkyDungeonGetRestraintByName("BasicLeash");
					KinkyDungeonAddRestraintIfWeaker(leash, KinkyDungeonJailGuard().Enemy.power, true, "", undefined, undefined, undefined, KDGetFaction(KinkyDungeonJailGuard()), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard());
					let msg = TextGet("KinkyDungeonAddRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
					msg = msg.replace("NewRestraintName", TextGet("Restraint"+leash.name));
					KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					KinkyDungeonJailGuard().NextJailLeashTourWaypointX = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().NextJailLeashTourWaypointY = KinkyDungeonJailGuard().y;
					KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().y;
				}
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard());
			} else {
				KinkyDungeonJailGuard().gx = KinkyDungeonPlayerEntity.x;
				KinkyDungeonJailGuard().gy = KinkyDungeonPlayerEntity.y;
			}
		} else if (!KinkyDungeonTetherLength()) {
			KinkyDungeonJailGuard().gx = KinkyDungeonPlayerEntity.x;
			KinkyDungeonJailGuard().gy = KinkyDungeonPlayerEntity.y;
			if (playerDist < 1.5) {
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard());
			}
		} else if (KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints > 0
            && (KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonJailGuard().NextJailLeashTourWaypointX, KinkyDungeonJailGuard().y - KinkyDungeonJailGuard().NextJailLeashTourWaypointY) < 2
            || (KDRandom() < 0.05 && KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonJailGuard().NextJailLeashTourWaypointX, KinkyDungeonJailGuard().y - KinkyDungeonJailGuard().NextJailLeashTourWaypointY) < 5)
			|| KDRandom() < 0.01)) {
			KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints--;
			if (KinkyDungeonJailGuard().NextJailLeashTourWaypointX > KinkyDungeonJailLeashX + 2) {
				if (KDRandom() < 0.5 && KinkyDungeonLastAction == "Move") {
					let index = "0";
					if (KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions < 1) {
						index = "" + Math.floor(KDRandom() * 6);
						//KinkyDungeonChangeRep("Ghost", 8);
					}
					KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), TextGet("KinkyDungeonJailerGoodGirl" + index).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name)), "#ffff00", 4, 9);
				}
			}
			KinkyDungeonJailGuardGetLeashWaypoint(xx, yy, type);
		} else {
			let pullDist = 2.5;//KinkyDungeonTetherLength() - 1;//KinkyDungeonJailGuard().Enemy.pullDist ? KinkyDungeonJailGuard().Enemy.pullDist : 1;
			if (playerDist < 1.5) {
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard());
			}
			if (playerDist > pullDist && KinkyDungeonSlowLevel < 2 && KinkyDungeonCheckProjectileClearance(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y)) {
				// Guard goes back towards the player and reminds them
				let msg = TextGet("KinkyDungeonRemindJailTour" + KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
				let msgPrev = TextGet("KinkyDungeonRemindJailTour" + Math.max(0, KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions-1)).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
				if (KinkyDungeonLastAction == "Move") {

					KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), msg, "#ffff00", 4, 7 + KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions);
					if (KinkyDungeonJailGuard().gx != KinkyDungeonPlayerEntity.x || KinkyDungeonJailGuard().gy != KinkyDungeonPlayerEntity.y && KinkyDungeonTextMessage != msgPrev) {
						KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions = Math.min(3, KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions + 1);
					}
				}
				if (KinkyDungeonJailGuard()?.KinkyDungeonJailTourInfractions == 3 && KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints > 1) KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints = 1;
				KinkyDungeonJailGuard().gx = KinkyDungeonPlayerEntity.x;
				KinkyDungeonJailGuard().gy = KinkyDungeonPlayerEntity.y;
				KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);
			} else {

				KDGameData.KinkyDungeonLeashedPlayer = 2;
				KDGameData.KinkyDungeonLeashingEnemy = KinkyDungeonJailGuard().id;
				KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().NextJailLeashTourWaypointX;
				KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().NextJailLeashTourWaypointY;
				let guardPath = KinkyDungeonFindPath(KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, KinkyDungeonJailGuard().gx, KinkyDungeonJailGuard().gy, false, false, true, KinkyDungeonMovableTilesEnemy);
				if (guardPath && guardPath.length > 0 && KDistChebyshev(guardPath[0].x - KinkyDungeonJailGuard().x, guardPath[0].y - KinkyDungeonJailGuard().y) < 1.5) {
					if (guardPath[0].x === KinkyDungeonPlayerEntity.x && guardPath[0].y === KinkyDungeonPlayerEntity.y) {
						// Swap the player and the guard
						KinkyDungeonTargetTile = null;
						KinkyDungeonTargetTileLocation = "";
						KDMovePlayer(KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, false);
						if (KinkyDungeonJailGuard()) {
							KinkyDungeonJailGuard().x = guardPath[0].x;
							KinkyDungeonJailGuard().y = guardPath[0].y;
						}
					}
					let enemy = KinkyDungeonEnemyAt(guardPath[0].x, guardPath[0].y);
					if (enemy) {
						KDMoveEntity(enemy, KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, true, undefined, undefined, true);
						if (KinkyDungeonJailGuard()) {
							KinkyDungeonJailGuard().x = guardPath[0].x;
							KinkyDungeonJailGuard().y = guardPath[0].y;
						}
					}
				} else KinkyDungeonJailGuardGetLeashWaypoint(xx, yy, type);
				KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);
			}
		}
	}
}

/**
 *
 * @param {number} xx
 * @param {number} yy
 * @param {string} type
 */
function KinkyDungeonJailGuardGetLeashWaypoint(xx, yy, type) {
	if (type == "transfer") {
		// Go back to a random mcell
		let nearestJail = KinkyDungeonRandomJailPoint(["jail"], [KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)]);
		if (nearestJail) {
			KinkyDungeonJailGuard().NextJailLeashTourWaypointX = nearestJail.x;
			KinkyDungeonJailGuard().NextJailLeashTourWaypointY = nearestJail.y;
			KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().NextJailLeashTourWaypointX;
			KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().NextJailLeashTourWaypointY;
		}
	} else {
		if (KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints === 0) {
			// Go back to the cell's bed
			let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			KinkyDungeonJailGuard().NextJailLeashTourWaypointX = nearestJail.x;
			KinkyDungeonJailGuard().NextJailLeashTourWaypointY = nearestJail.y;
			KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().NextJailLeashTourWaypointX;
			KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().NextJailLeashTourWaypointY;
		} else {
			// Get a random next waypoint in an acceptable range outside of the cell
			let randomPoint = KinkyDungeonJailGetLeashPoint(xx, yy, KinkyDungeonJailGuard());
			KinkyDungeonJailGuard().NextJailLeashTourWaypointX = randomPoint.x;
			KinkyDungeonJailGuard().NextJailLeashTourWaypointY = randomPoint.y;
			KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().NextJailLeashTourWaypointX;
			KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().NextJailLeashTourWaypointY;
		}
	}
}

function KinkyDungeonJailGetLeashPoint(xx, yy, enemy) {
	let randomPoint = { x: xx, y: yy };
	for(let i = 0; i < 40; ++i) {
		let candidatePoint = KinkyDungeonGetRandomEnemyPoint(true, false, enemy);
		if (candidatePoint) {
			let distanceFromCell = Math.sqrt((xx - candidatePoint.x) * (xx - candidatePoint.x) + (yy - candidatePoint.y) * (yy - candidatePoint.y));
			if (distanceFromCell > KinkyDungeonJailLeash * 2 && distanceFromCell < KinkyDungeonJailLeash * 6) {
				randomPoint = candidatePoint;
				break;
			}
		}
	}
	return randomPoint;
}

/**
 * @param {boolean} [any]
 * @param {boolean} [qualified] - Makes sure the player is qualified
 * @param {string[]} [filter]
 * @returns {boolean} - Returns if the player is inside the nearest jail cell
 */
function KinkyDungeonPlayerInCell(any, qualified, filter) {
	if (!filter && KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.Jail) {
		return true;
	}
	let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, filter, any, qualified);
	if (!nearestJail || nearestJail.type != "jail") return false;
	return KDistChebyshev(KinkyDungeonPlayerEntity.x - nearestJail.x, KinkyDungeonPlayerEntity.y - nearestJail.y) < 2;
	//return (Math.abs(KinkyDungeonPlayerEntity.x - KDMapData.StartPosition.x) < KinkyDungeonJailLeashX - 1 && Math.abs(KinkyDungeonPlayerEntity.y - KDMapData.StartPosition.y) <= KinkyDungeonJailLeash);
}

function KinkyDungeonPointInCell(x, y, radius = 2) {
	let nearestJail = KinkyDungeonNearestJailPoint(x, y);
	if (!nearestJail) return false;
	return KDistChebyshev(x - nearestJail.x, y - nearestJail.y) < radius;
	//return (Math.abs(x - KDMapData.StartPosition.x) < KinkyDungeonJailLeashX - 1 && Math.abs(y - KDMapData.StartPosition.y) <= KinkyDungeonJailLeash);
}

function KinkyDungeonPassOut(noteleport) {
	KDDefeatedPlayerTick();
	KDBreakTether(KinkyDungeonPlayerEntity);
	KDGameData.KinkyDungeonLeashedPlayer = 0;
	KinkyDungeonBlindLevel = 6;
	KinkyDungeonStatBlind = 10;
	KinkyDungeonUpdateLightGrid = true;
	KDGameData.AlertTimer = 0;
	KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["passout"]);
	KinkyDungeonSendEvent("passout", {});

	KinkyDungeonStripInventory(false);

	if (KinkyDungeonCurrentDress == "Default")
		KinkyDungeonSetDress("Bikini", "Bikini");
	KinkyDungeonDressPlayer();

	KinkyDungeonChangeStamina(-100);
	KinkyDungeonChangeMana(-100);
	KinkyDungeonChangeDistraction(-100);

	KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonPassOut"), "#ff0000", 5);
	KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPassOut2"), "#ff0000", 5);


	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDGameData.JailKey = false;
	KDResetAllAggro();
	KinkyDungeonSaveGame();

	if (!noteleport) {
		let point = KinkyDungeonGetRandomEnemyPoint(true, false, undefined);
		if (point) {
			KDMovePlayer(point.x, point.y, false);
		}
	}


	for (let e of  KDMapData.Entities) {
		if (e.hostile < 9000) e.hostile = 0;
		if (e.vp > 0) e.vp = 0;
		if (e.aware) e.aware = false;
		if (e.maxlifetime && e.maxlifetime < 9000) e.lifetime = 0;
		KDExpireFlags(e);
	}

	KinkyDungeonLoseJailKeys();
	KinkyDungeonSlowMoveTurns = 10;
}

function KDGetJailDoor(x, y) {
	let point = KinkyDungeonNearestJailPoint(x, y);
	if (point) {
		x = point.x;
		y = point.y;
	}
	x += KinkyDungeonJailLeashX - 1;
	return {tile: KinkyDungeonTilesGet((x) + "," + y), x: x, y: y};
}

function KDDefeatedPlayerTick() {
	KinkyDungeonSetFlag("playerDefeated", 1);
}

function KDEnterDemonTransition() {
	KinkyDungeonSetFlag("refusedShopkeeperRescue", 5); // To prevent spawning instantly
	KDGameData.PrisonerState = 'jail';
	//KDGameData.RoomType = "DemonTransition"; // We do a tunnel every other room
	//KDGameData.MapMod = ""; // Reset the map mod
	KDGameData.CurrentDialog = "";
	let params = KinkyDungeonMapParams.DemonTransition;
	KinkyDungeonCreateMap(params, "DemonTransition", "", MiniGameKinkyDungeonLevel, undefined, undefined, undefined, undefined, undefined, "");

	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).removePrison && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze || KDRestraint(inv).immobile)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}

	KinkyDungeonDressPlayer();
	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");

	KDGameData.JailKey = false;

	KDMovePlayer(KDMapData.StartPosition.x, KDMapData.StartPosition.y, false);

	KinkyDungeonLoseJailKeys();
	KDResetAllAggro();

	KinkyDungeonSaveGame();
}

function KDEnterDollTerminal(willing, cancelDialogue = true) {
	KinkyDungeonSetFlag("refusedShopkeeperRescue", 5); // To prevent spawning instantly
	KDGameData.PrisonerState = 'jail';
	//KDGameData.RoomType = "DollRoom"; // We do a tunnel every other room
	//KDGameData.MapMod = ""; // Reset the map mod
	if (cancelDialogue) KDGameData.CurrentDialog = "";
	let params = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]];
	KDGameData.DollRoomCount = 0;
	KinkyDungeonCreateMap(params, "DollRoom", "", MiniGameKinkyDungeonLevel, undefined, undefined, undefined, undefined, undefined, "");

	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).removePrison && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze || KDRestraint(inv).immobile)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}

	if (!willing) {
		let defeat_outfit = "DollSuit";
		if (KinkyDungeonPlayerTags.has("Cyber")) defeat_outfit = "CyberDoll";
		if (KinkyDungeonStatsChoice.has("KeepOutfit")) defeat_outfit = "Default";

		KinkyDungeonSetDress(defeat_outfit, defeat_outfit);
	}

	KinkyDungeonDressPlayer();
	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDGameData.JailKey = false;

	KDMovePlayer(Math.floor(KDMapData.GridWidth/2), Math.floor(KDMapData.GridHeight/2), false);

	KinkyDungeonLoseJailKeys();
	KDResetAllAggro();

	KinkyDungeonSaveGame();
}

function KinkyDungeonDefeat(PutInJail, leashEnemy) {
	KinkyDungeonInterruptSleep();

	if (KinkyDungeonTempWait)
		KDDisableAutoWait();

	KDDefeatedPlayerTick();
	KDBreakTether(KinkyDungeonPlayerEntity);
	KDGameData.CurrentDialog = "";
	KDGameData.CurrentDialogStage = "";
	KDGameData.KinkyDungeonLeashedPlayer = 0;
	if (KinkyDungeonFlags.get("JailIntro"))
		KinkyDungeonSetFlag("JailRepeat", -1);
	KinkyDungeonBlindLevel = 3;
	KinkyDungeonStatBlind = 3;
	KinkyDungeonUpdateLightGrid = true;
	if (!KDGameData.TimesJailed) KDGameData.TimesJailed = 1;
	else KDGameData.TimesJailed += 1;
	KDGameData.JailTurns = 0;
	//if (PutInJail)
	// KDGameData.PriorJailbreaks = 0;
	KDGameData.PrisonerState = "jail";
	KDGameData.AlertTimer = 0;
	let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	if (!nearestJail) {
		nearestJail = Object.assign({type: "jail", radius: 1}, KDMapData.StartPosition);
	}
	KDSendStatus('jailed');
	KDSendEvent('jail');
	KDGameData.WarningLevel = 0;
	KDGameData.AncientEnergyLevel = 0;
	KDGameData.JailRemoveRestraintsTimer = 0;
	//MiniGameKinkyDungeonLevel = Math.min(MiniGameKinkyDungeonLevel, Math.max(Math.floor(MiniGameKinkyDungeonLevel/10)*10, MiniGameKinkyDungeonLevel - KinkyDungeonSpawnJailers + KinkyDungeonSpawnJailersMax - 1));
	KinkyDungeonSendEvent("defeat", {});

	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).removePrison && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}
	KDGameData.KinkyDungeonPrisonReduction = 0;
	//let firstTime = KDGameData.KinkyDungeonSpawnJailersMax == 0;
	KDGameData.KinkyDungeonGuardSpawnTimer = 4 + Math.floor(KDRandom() * (KDGameData.KinkyDungeonGuardSpawnTimerMax - KDGameData.KinkyDungeonGuardSpawnTimerMin));
	KDGameData.KinkyDungeonSpawnJailersMax = 2;
	if (KinkyDungeonGoddessRep.Prisoner) KDGameData.KinkyDungeonSpawnJailersMax += Math.round(6 * (KinkyDungeonGoddessRep.Prisoner + 50)/100);
	//let securityBoost = (firstTime) ? 0 : Math.max(2, Math.ceil(4 * (KDGameData.KinkyDungeonSpawnJailersMax - KDGameData.KinkyDungeonSpawnJailers + 1)/KDGameData.KinkyDungeonSpawnJailersMax));

	KinkyDungeonStatBlind = 3;

	//MiniGameKinkyDungeonLevel = Math.floor((MiniGameKinkyDungeonLevel + Math.max(0, KinkyDungeonSpawnJailersMax - KinkyDungeonSpawnJailers))/5)*5;
	//MiniGameKinkyDungeonLevel = Math.floor(MiniGameKinkyDungeonLevel/2)*2;
	KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonLeashed"), "#ff0000", 3);
	if (!KinkyDungeonJailedOnce) {
		KinkyDungeonJailedOnce = true;
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonLeashed2"), "#ff0000", 3);
	}
	let params = KinkyDungeonMapParams[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint]];
	KDGameData.KinkyDungeonSpawnJailers = KDGameData.KinkyDungeonSpawnJailersMax;
	let defeat_outfit = params.defeat_outfit;
	// Handle special cases
	let collar = KinkyDungeonGetRestraintItem("ItemNeck");
	if (collar && KDRestraint(collar)) {
		if (KDRestraint(collar).name == "DragonCollar") defeat_outfit = "Dragon";
		if (KDRestraint(collar).name == "MaidCollar") defeat_outfit = "Maid";
		if (KDRestraint(collar).name == "ExpCollar") defeat_outfit = "BlueSuitPrison";
		if (KDRestraint(collar).name == "WolfCollar") defeat_outfit = "Wolfgirl";
		if (KDRestraint(collar).name == "MithrilCollar") defeat_outfit = "Elven";
		if (KDRestraint(collar).name == "ObsidianCollar") defeat_outfit = "Obsidian";
	}
	if (KinkyDungeonStatsChoice.has("KeepOutfit")) defeat_outfit = "Default";

	KinkyDungeonSetDress(defeat_outfit, "JailUniform");
	KinkyDungeonDressPlayer();
	KinkyDungeonStripInventory(true);

	if (defeat_outfit != params.defeat_outfit) {
		if (!KinkyDungeonInventoryGet(defeat_outfit)) KinkyDungeonInventoryAdd({name: defeat_outfit, type: Outfit, id: KinkyDungeonGetItemID()});
	} else if (!KinkyDungeonInventoryGet("JailUniform")) KinkyDungeonInventoryAdd({name: "JailUniform", type: Outfit, id: KinkyDungeonGetItemID()});

	//KinkyDungeonChangeRep("Ghost", 1 + Math.round(KinkyDungeonSpawnJailers/2));
	//KinkyDungeonChangeRep("Prisoner", securityBoost); // Each time you get caught, security increases...

	KinkyDungeonDressPlayer();
	if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDGameData.JailKey = false;
	KinkyDungeonSaveGame();

	if (PutInJail) {
		//KDGameData.RoomType = "Jail"; // We do a tunnel every other room
		//KDGameData.MapMod = ""; // Reset the map mod
		let forceFaction = undefined;
		if (leashEnemy && KDFactionProperties[KDGetFaction(leashEnemy)]) {
			forceFaction = KDGetFaction(leashEnemy);
		}
		KinkyDungeonCreateMap(params, "Jail", "", MiniGameKinkyDungeonLevel, undefined, undefined, forceFaction, undefined, undefined, "");

		KinkyDungeonSetFlag("LeashToPrison", 0);

		nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);

	}

	KDMovePlayer(nearestJail.x + (nearestJail.direction?.x || 0), nearestJail.y + (nearestJail.direction?.y || 0), false);
	if (nearestJail.direction) {
		KinkyDungeonSetFlag("conveyed", 1);
	}
	if (nearestJail.restraint) {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(nearestJail.restraint), KDGetEffLevel(),false, undefined);
	}
	if (nearestJail.restrainttags) {
		let restraint = KinkyDungeonGetRestraint({tags: nearestJail.restrainttags}, KDGetEffLevel(),KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], false, undefined);
		if (restraint)
			KinkyDungeonAddRestraintIfWeaker(restraint, KDGetEffLevel(),false, undefined);
	}

	KinkyDungeonLoseJailKeys();

	let leash = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (leash && (leash.tx || leash.ty)) {
		leash.tx = undefined;
		leash.ty = undefined;
	}
	KDGameData.KinkyDungeonSpawnJailers = KDGameData.KinkyDungeonSpawnJailersMax - 1;

	// Lock all jail doors
	for (let X = 1; X < KDMapData.GridWidth - 1; X++)
		for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
			let tile = KinkyDungeonTilesGet(X + "," + Y);
			if (tile && tile.Jail && tile.ReLock && (KinkyDungeonMapGet(X, Y) == 'd' || KinkyDungeonMapGet(X, Y) == 'D')) {
				KinkyDungeonMapSet(X, Y, 'D');
				if (tile && !tile.Lock) {
					tile.Lock = "Red";
					KDUpdateDoorNavMap();
				}
			}
		}

	KDKickEnemies(nearestJail);
	KDResetAllAggro();
}

/**
 *
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDEnemyIsTemporary(enemy) {
	return enemy.Enemy.tags.temporary || (enemy.lifetime > 0);
}

/** Kicks enemies away, and also out of offlimits zones if they are aware */
function KDKickEnemies(nearestJail, ignoreAware) {
	let atLeastOneAware = false;
	let enemies = [];
	let already = new Map();
	for (let e of  KDMapData.Entities) {
		if (!e.Enemy.tags.temporary && !KDIsImmobile(e) && e.spawnX && e.spawnY) {
			if (e.aware && KDHostile(e) && KinkyDungeonCheckLOS(e, KinkyDungeonPlayerEntity, KDistEuclidean(e.x - KinkyDungeonPlayerEntity.x, e.y - KinkyDungeonPlayerEntity.y),
				10, true, false)) {
				atLeastOneAware = true;
			} else e.aware = false;
			if (!ignoreAware || !e.aware)
				if (!nearestJail || (e.x == nearestJail.x && e.y == nearestJail.y) || (!e.Enemy.tags.prisoner && !e.Enemy.tags.peaceful && !KDEnemyHasFlag(e, "imprisoned"))) {
					if (!nearestJail || KDistChebyshev(e.x - nearestJail.x, e.y - nearestJail.y) <= 4 || (e.aware || e.vp > 0.01 || e.aggro > 0)) {
						e.x = e.spawnX;
						e.y = e.spawnY;
						e.path = undefined;
						e.gx = e.x;
						e.gy = e.y;
						already.set(e, true);
						KDUpdateEnemyCache = true;
					}
				}
		}
	}
	for (let e of KDMapData.Entities) {
		if (!e.Enemy.tags.temporary) {
			if (e.aware && !KDIsImmobile(e) && KDHostile(e) && KinkyDungeonCheckLOS(e, KinkyDungeonPlayerEntity, KDistEuclidean(e.x - KinkyDungeonPlayerEntity.x, e.y - KinkyDungeonPlayerEntity.y),
				10, true, false)) {
				atLeastOneAware = true;
			} else e.aware = false;
			if (!ignoreAware || !e.aware)
				if (!nearestJail || (e.x == nearestJail.x && e.y == nearestJail.y) || (!e.Enemy.tags.prisoner && !e.Enemy.tags.peaceful && !KDEnemyHasFlag(e, "imprisoned"))) {
					if (!KDIsImmobile(e))
						if (!already.get(e) && (!nearestJail || KDistChebyshev(e.x - nearestJail.x, e.y - nearestJail.y) <= 4 || (e.aware || e.vp > 0.01 || e.aggro > 0))) {
							let p = KinkyDungeonGetRandomEnemyPoint(true);
							if (p) {
								e.x = p.x;
								e.y = p.y;
								e.path = undefined;
								e.gx = e.x;
								e.gy = e.y;
								KDUpdateEnemyCache = true;
							}
						}

					if (!KDEnemyHasFlag(e, "imprisoned") && e.boundLevel && !KDHelpless(e)) e.boundLevel = 0;
				}
			if (e.hostile < 9000) e.hostile = 0;
			KDExpireFlags(e);
			KDResetIntent(e, {});
			enemies.push(e);
		}
	}
	KDMapData.Entities = enemies;
	KDUpdateEnemyCache = true;
	return atLeastOneAware;
}

function KDResetAllIntents() {
	for (let e of  KDMapData.Entities) {
		if (e.IntentAction && !KDIntentEvents[e.IntentAction].noMassReset)
			KDResetIntent(e);
	}
}
function KDResetAllAggro() {
	for (let e of KDMapData.Entities) {
		if (e.hostile && !KDIntentEvents[e.IntentAction]?.noMassReset)
			e.hostile = 0;
	}
}

/**
 * Moves an enemy to a random position on the map
 * @param {entity} e
 */
function KDKickEnemy(e) {
	if (!e.Enemy.tags.temporary) {
		if (!e.Enemy.tags.prisoner && !KDEnemyHasFlag(e, "imprisoned")) {
			let p = KinkyDungeonGetRandomEnemyPoint(true);
			if (p) {
				e.x = p.x;
				e.y = p.y;
				e.path = undefined;
				e.gx = e.x;
				e.gy = e.y;
			}


			if (e.boundLevel && e.boundLevel < 9000) e.boundLevel = 0;
		}
		if (e.hostile < 9000) e.hostile = 0;
		KDExpireFlags(e);
		KDResetIntent(e, {});
	}
	KDClearItems(e);
}

/**
 * Moves an enemy to a random position on the map
 * @param {entity} e
 */
function KDKickEnemyLocal(e) {
	let point = KinkyDungeonGetNearbyPoint(e.x, e.y, true, undefined, true, true);
	if (point) {
		KDMoveEntity(e, point.x, point.y, false);
	}
}

function KinkyDungeonStripInventory(KeepPicks) {
	KinkyDungeonRedKeys = 0;
	KinkyDungeonBlueKeys = 0;
	KinkyDungeonLockpicks = KeepPicks ? (Math.min(Math.max(0, Math.round(3 * (1 - (KinkyDungeonGoddessRep.Prisoner + 50)/100))), KinkyDungeonLockpicks)) : 0;

	let newInv = KinkyDungeonInventory.get(Restraint);
	let HasBound = false;
	let boundWeapons = [];
	if (HasBound) {
		// TODO add bound weapons here
	}
	KinkyDungeonAddLostItems(KinkyDungeonFullInventory(), HasBound);
	KDInitInventory();
	KinkyDungeonInventory.set(Restraint, newInv);
	KinkyDungeonInventoryAddWeapon("Unarmed");
	KDSetWeapon(null, true);
	for (let b of boundWeapons) {
		KinkyDungeonInventoryAddWeapon(b);
	}
}

function KDExpireFlags(enemy) {
	if (enemy.flags) {
		for (let f of Object.entries(enemy.flags)) {
			if (f[1] > 0 && f[1] < 9000) enemy.flags[f[0]] = 0;
		}
	}
}

/**
 * Gets the jail outfit of the guard, or using overrideTags instead of the guard's taggs
 * @param {string[]} [overrideTags]
 * @param {boolean} [requireJail]
 * @param {boolean} [requireParole]
 * @returns {{Name: string, Level: number}[]}
 */
function KDGetJailRestraints(overrideTags, requireJail, requireParole) {
	let restraints = [];
	//let pris = {};
	let guard = KinkyDungeonJailGuard();
	let tags = overrideTags ? overrideTags : [];
	if (!overrideTags) {
		if (!guard) tags.push("jailer");
		else {
			for (let t of Object.keys(KinkyDungeonJailGuard().Enemy.tags)) {
				if (KDJailOutfits[t] && (!requireJail || KDJailOutfits[t].jail) && (!requireParole || KDJailOutfits[t].parole)) tags.push(t);
			}
		}
	}

	let newtags = [];

	for (let t of tags) {
		newtags.push(t);
	}

	for (let t of tags) {
		let tag = KDJailOutfits[t];
		if (tag.overridelowerpriority) {
			// Go over all tags and remove those with lower priority
			let pri = tag.priority;
			for (let tt of newtags) {
				let tag2 = KDJailOutfits[tt];
				if (tag2.priority < pri) newtags.splice(newtags.indexOf(tt), 1);
			}
		}
	}

	tags = newtags;

	for (let t of tags) {
		for (let r of KDJailOutfits[t].restraints) {
			//let restraint = KinkyDungeonRestraintsCache.get(r.Name);
			//if (restraint && (!pris[restraint.Group] || r.priority > pris[restraint.Group])) {
			restraints.push(r);
			//pris[restraint.Group] = r.priority;
			//}
		}
	}

	return restraints;
}