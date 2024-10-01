"use strict";

/** Affects security level based on owning faction */
let KDMainFactionSecurityMod = 35;

/** Time spent in cage before guards start getting teleported */
let KDMaxCageTime = 100;

/** max keys on the map at once **/
let KDMaxKeys = 2;

/** Only these have jail events */
let KDJailFilters = ['jail'];

function KDAssignGuardAction(guard: entity, xx: number, yy: number): void {
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

function KDGetJailEvent(guard: entity, xx: number, yy: number): (g: entity, x: number, y: number) => void {
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
	return (_g, _x, _y) => {};
}


function KinkyDungeonLoseJailKeys(Taken?: boolean, boss?: boolean, enemy?: entity): void {
	// KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'chase'
	if (KinkyDungeonFlags.has("BossUnlocked")) return;
	if (KDMapData.KeysHeld > 0) {
		if (Taken) {
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonRemoveJailKey"), "#ff5277", 3);
			if (enemy) {
				if (!enemy.items) enemy.items = [];
				if (!enemy.items.includes("Keyring"))
					enemy.items.push("Keyring");
			}
		}
		KDMapData.KeysHeld--;
	}
	if (boss) {
		KDMapData.KeysHeld--;
		KDMapData.GroundItems = KDMapData.GroundItems.filter((item) => {return item.name != "Keyring";});
	}
}

function KinkyDungeonUpdateJailKeys() {
	if (KDMapData.EscapeMethod != "Key") return;
	if (KDMapData.KeysHeld < 3) {
		let altRoom = KinkyDungeonAltFloor(KDGameData.RoomType);
		if ((!altRoom || !altRoom.nokeys) && (!KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel) || !KinkyDungeonBossFloor(MiniGameKinkyDungeonLevel).nokeys)) {
			KinkyDungeonPlaceJailKeys();
		}
	}
}

function KinkyDungeonAggroFaction(faction: string, noAllyRepPenalty?: boolean, securityPenalty: number = 0): boolean {
	if (faction == "Player") return false;
	let list = [];
	let list2 = [];
	for (let enemy of KDMapData.Entities) {
		if (enemy.Enemy.tags.peaceful) continue;
		let enemyfaction = KDGetFaction(enemy);
		if (enemyfaction == "Player") continue;
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
				if (!KDAllied(e)) {
					KDMakeHostile(e);
				}
			}

			KinkyDungeonChangeFactionRep(faction, -amount);
			return true;
		} else if (list2.length > 0 && !noAllyRepPenalty) {
			KinkyDungeonChangeFactionRep(faction, -amount);
			return false;
		} else if (securityPenalty) KinkyDungeonChangeRep("Prisoner", securityPenalty);
	}

	return false;
}

function KinkyDungeonPlayerIsVisibleToJailers() {
	let list = [];
	for (let enemy of KDMapData.Entities) {
		if (KDHostile(enemy) && !(enemy.rage > 0) && (enemy.Enemy.tags.leashing || enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy))) {
			if (KinkyDungeonTrackSneak(enemy, 0, KinkyDungeonPlayerEntity) > 0.9 && KinkyDungeonCheckLOS(
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
 * @param playChance
 * @param enemy
 */
function KDCalcPlayChance(playChance: number, enemy: entity): number {
	// Reduce chance of play in combat
	if (KinkyDungeonFlags.get("PlayerCombat")) playChance *= 0.2;
	if (!KinkyDungeonFlags.get("wander")) playChance *= 0.75;
	if (enemy.path?.length > 2) playChance *= 0.1;
	if (KDGameData.otherPlaying > 0) playChance *= Math.max(0.05, 1 - 0.35 * KDGameData.otherPlaying);

	if (KinkyDungeonFlags.get("playLikely")) playChance += 0.5;

	if (KDEnemyHasFlag(enemy, "Shop") || KDEnemyHasFlag(enemy, "HelpMe")) playChance = 0;

	if (KinkyDungeonStatsChoice.get("Undeniable")) {
		if (playChance < 0.1) playChance = 0.1;
		else playChance = 0.9;
	}

	if (KinkyDungeonFlags.get("noPlay")) playChance = 0;

	return playChance;
}

/**
 * @param enemy
 */
function KinkyDungeonCanPlay(enemy: entity): boolean {

	return (KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'jail' || (!KDHostile(enemy)
		&& !(KDAllied(enemy) && !KDEnemyHasFlag(enemy, "allyPlay"))))
		&& (enemy.ambushtrigger || !KDAIType[KDGetAI(enemy)] || !KDAIType[KDGetAI(enemy)].ambush)
		&& !enemy.Enemy.Behavior?.noPlay
		&& enemy.hp > 0.52;
}

function KinkyDungeonCheckRelease() {
	if (KDMapData.JailFaction?.length > 0 && KDFactionRelation("Jail", KDMapData.JailFaction[0]) < -0.15) return -1;
	if (KDGameData.RoomType) {
		let altRoom = KinkyDungeonAltFloor(KDGameData.RoomType);
		if (altRoom && altRoom.noRelease) return altRoom.releaseOnLowSec ? (KDGetEffSecurityLevel() >= KDSecurityLevelHiSec ? -1 : 1) : -1;
	}
	let sub = KinkyDungeonGoddessRep.Ghost + 50;
	let security = KDGetEffSecurityLevel() + 50;
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
 * @param action
 * @param data
 */
function KinkyDungeonAggroAction(action: string, data: {enemy?: entity, x?: number, y?: number, faction?: string, force?: boolean}): void {
	if (data?.faction == "Player") return;
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
			if (data.faction) {
				KinkyDungeonAggroFaction(data.faction, false, KDChestSecurity(data));

			}
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
			if (KDGameData.PrisonerState == "jail" || data.force){
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

let KDLocalChaseTypes: string[] = ["Refusal", "Attack", "Spell", "SpellItem", "Shrine", "Orb", "Chest"];
let KDSevereTypes: string[] = ["Attack"];

/**
 * @param enemy
 * @param Type
 * @param [faction]
 * @param [force]
 */
function KinkyDungeonStartChase(enemy: entity, Type: string, faction?: string, force?: boolean) {
	if (!force && enemy && (!enemy.aware && !(enemy.vp > 0.5))) return;
	if (KDGetFaction(enemy) == "player") return;
	if ((!enemy && !KDLocalChaseTypes.includes(Type))) {
		if (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole') {
			KinkyDungeonChangeRep("Ghost", -10);
			if (KinkyDungeonFlags.has("PlayerCombat") || (KinkyDungeonPlayerDamage && !isUnarmed(KinkyDungeonPlayerDamage)))
				KinkyDungeonChangeRep("Prisoner", 20);
			else KinkyDungeonChangeRep("Prisoner", 5);
			KDGameData.PrisonerState = "chase";
			KinkyDungeonInterruptSleep();
		}
		if (KDGameData.PrisonerState == 'jail' || KDGameData.PrisonerState == 'parole' || KDGameData.PrisonerState == 'chase')
			KDGameData.PrisonerState = "chase";
	} else if (KDLocalChaseTypes.includes(Type) && (enemy || faction)) {
		for (let e of KDMapData.Entities) {
			if ((KDHostile(e, undefined)
				|| (KDSevereTypes.includes(Type)
					&& KDFactionAllied(faction ? faction : KDGetFaction(enemy), e, undefined,
						-KDOpinionRepMod(e, KDPlayer())) // We lower the strength of faction alliances based on opinion
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
 * @param enemy
 * @param Type
 */
function KinkyDungeonPlayExcuse(enemy: entity, Type: string): void {
	if (Type == "Free" && enemy && enemy.Enemy.noChaseUnrestrained) {
		return;
	}
	let playChance = KDCalcPlayChance(1.0, enemy);
	if (KinkyDungeonCanPlay(enemy) && !(enemy.playWithPlayer > 0) && enemy.aware && !(enemy.playWithPlayerCD > 0) && (enemy.Enemy.tags.jail || enemy.Enemy.tags.jailer || KDGetEnemyPlayLine(enemy)) && KDRandom() < playChance) {
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
 * @param enemy
 * @param mult
 * @param base
 */
function KDSetPlayCD(enemy: entity, mult: number, base: number = 10): void {
	enemy.playWithPlayerCD = Math.max(enemy.playWithPlayerCD || 0, base * mult + (enemy.playWithPlayer || 0) * mult);
}

/**
 * @param Group
 * @param [jailRestraintList]
 * @param [lock]
 */
function KinkyDungeonGetJailRestraintForGroup(Group: string, jailRestraintList?: KDJailRestraint[], lock?: string): {restraint: restraint, variant: string} {
	if (!jailRestraintList) {
		jailRestraintList = KDGetJailRestraints();
	}

	/**
	 */
	let cand: restraint = null;
	let variant = "";
	let candLevel = 0;
	let currentItem = KinkyDungeonGetRestraintItem(Group);
	// Try first with ones that are linkable
	if (currentItem) {
		// Go for priority candidates first
		for (let r of jailRestraintList) {
			let level = 0;
			if (KDGetEffSecurityLevel()) level = Math.max(0, KDGetEffSecurityLevel() + 50);
			if (!r.Level || level >= r.Level) {
				let candidate = KinkyDungeonGetRestraintByName(r.Name);
				if (candidate.Group == Group && (!candidate.nonbinding || cand == null)) {
					if ((candLevel == 0 || r.Level > candLevel) && (KDJailCondition(r)) && KDPriorityCondition(r)) {
						if (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), candidate, undefined, lock)) {
							cand = candidate;
							variant = r.Variant;
							candLevel = candidate.nonbinding ? 0 : r.Level;
						}

					}
				}
			}
		}
		if (!cand) {
			for (let r of jailRestraintList) {
				let level = 0;
				if (KDGetEffSecurityLevel()) level = Math.max(0, KDGetEffSecurityLevel() + 50);
				if (!r.Level || level >= r.Level) {
					let candidate = KinkyDungeonGetRestraintByName(r.Name);
					if (candidate.Group == Group && (!candidate.nonbinding || cand == null)) {
						if ((candLevel == 0 || r.Level > candLevel) && (KDJailCondition(r))) {
							if (KinkyDungeonLinkableAndStricter(KDRestraint(currentItem), candidate, undefined, lock)) {
								cand = candidate;
								variant = r.Variant;
								candLevel = candidate.nonbinding ? 0 : r.Level;
							}

						}
					}
				}
			}
		}
	}
	// Otherwise go for the regular candidate
	if (!cand) {
		for (let r of jailRestraintList) {
			let level = 0;
			if (KDGetEffSecurityLevel()) level = Math.max(0, KDGetEffSecurityLevel() + 50);
			if (!r.Level || level >= r.Level) {
				let candidate = KinkyDungeonGetRestraintByName(r.Name);
				if (candidate.Group == Group && (!candidate.nonbinding || cand == null)) {

					if ((candLevel == 0 || r.Level > candLevel) && KDIsEligible(KDRestraint({name: r.Name})) && (KDJailCondition(r)) && KDPriorityCondition(r)) {
						cand = candidate;
						variant = r.Variant;
						candLevel = candidate.nonbinding ? 0 : r.Level;
					}
				}
			}
		}
		if (!cand)
			for (let r of jailRestraintList) {
				let level = 0;
				if (KDGetEffSecurityLevel()) level = Math.max(0, KDGetEffSecurityLevel() + 50);
				if (!r.Level || level >= r.Level) {
					let candidate = KinkyDungeonGetRestraintByName(r.Name);
					if (candidate.Group == Group && (!candidate.nonbinding || cand == null)) {
						if ((candLevel == 0 || r.Level > candLevel) && KDIsEligible(KDRestraint({name: r.Name})) && (KDJailCondition(r))) {
							cand = candidate;
							variant = r.Variant;
							candLevel = candidate.nonbinding ? 0 : r.Level;
						}
					}
				}
			}
	}
	return {restraint: cand, variant: variant};
}


/**
 * @param Group
 * @param [jailRestraintList]
 * @param [agnostic] - Dont care about whether it can be put on or not
 * @param [lock]
 * @param [ignoreLevel]
 * @param [ignoreWarn]
 */
function KinkyDungeonGetJailRestraintsForGroup(Group: string, jailRestraintList?: KDJailRestraint[], agnostic: boolean = false, lock?: string, ignoreLevel: boolean = false, _ignoreWorn: boolean = false): {restraint: restraint, variant: string, def: KDJailRestraint}[] {
	if (!jailRestraintList) {
		jailRestraintList = KDGetJailRestraints();
	}

	let cands: {restraint: restraint, variant: string, def: KDJailRestraint}[] = [];
	for (let pri of [true, false]) {
		for (let r of jailRestraintList) {
			let level = 0;
			if (ignoreLevel) level = 1000;
			else if (KDGetEffSecurityLevel()) level = Math.max(0, KDGetEffSecurityLevel() + 50);
			if (!r.Level || level >= r.Level) {
				let candidate = KinkyDungeonGetRestraintByName(r.Name);
				if (candidate.Group == Group) {
					if (
						(KDJailCondition(r) && (!pri || KDPriorityCondition(r)))
						&& (agnostic ||
							KDCanAddRestraint(KinkyDungeonGetRestraintByName(r.Name),
								KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
								lock,
								!KinkyDungeonStatsChoice.has("TightRestraints") ? true : undefined,
								undefined,
								KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined,
								KinkyDungeonJailGuard(), false, undefined, undefined,
								(r.Variant && KDApplyVariants[r.Variant]?.powerBonus) ? KDApplyVariants[r.Variant].powerBonus : 0)
						)
					) {
						cands.push({restraint: candidate, variant: r.Variant, def: r});
					}
				}
			}
		}
	}

	return cands;
}

/**
 * @param r
 */
function KDJailCondition(r: KDJailRestraint): boolean {
	if (r.Condition && KDJailConditions[r.Condition]) {
		return KDJailConditions[r.Condition](r);
	}
	return true;
}

/**
 * @param r
 */
function KDPriorityCondition(r: KDJailRestraint): boolean {
	if (r.Priority && KDJailConditions[r.Priority]) {
		return KDJailConditions[r.Priority](r);
	}
	return false;
}


function KinkyDungeonGetJailRestraintLevelFor(Name: string): number {
	for (let r of KDGetJailRestraints()) {
		if (r.Name === Name) {
			return r.Level;
		}
	}
	return -1;
}

/**
 * @param [filter] - Have to be in a jail, not a dropoff
 */
function KinkyDungeonInJail(filter: string[]): boolean {
	return KinkyDungeonPlayerInCell(false, false, filter);//KDGameData.KinkyDungeonSpawnJailers > 0 && KDGameData.KinkyDungeonSpawnJailers + 1 >= KDGameData.KinkyDungeonSpawnJailersMax;
}


function KinkyDungeonPlaceJailKeys() {
	let jailKeyList = [];

	// Populate the key
	for (let X = 1; X < KDMapData.GridWidth; X += 1)
		for (let Y = 1; Y < KDMapData.GridHeight; Y += 1)
			if (KinkyDungeonGroundTiles.includes(KinkyDungeonMapGet(X, Y))
                && KDMapData.RandomPathablePoints[(X) + ',' + (Y)]
                && KDistChebyshev(X - KinkyDungeonPlayerEntity.x, Y - KinkyDungeonPlayerEntity.y) > 15
                && KDistChebyshev(X - KDMapData.EndPosition.x, Y - KDMapData.EndPosition.y) > 15
                && (!KinkyDungeonTilesGet(X + "," + Y) || !KinkyDungeonTilesGet(X + "," + Y).OL))
				jailKeyList.push({x:X, y:Y});

	let keyCount = Math.max(0, KDMaxKeys - KDMapData.GroundItems.filter((item) => {return item.name == "Keyring";}).length);
	let placed = 0;
	let i = 0;

	while (jailKeyList.length > 0 && placed < keyCount) {
		let N = Math.floor(KDRandom()*jailKeyList.length);
		let slot = jailKeyList[N];
		if (KDGameData.KeyringLocations && i < KDGameData.KeyringLocations.length) {
			slot = KDGameData.KeyringLocations[Math.floor(KDRandom() * KDGameData.KeyringLocations.length)];
			i++;
		}
		if (
			!KDMapData.GroundItems.some((item) => {return item.name == "Keyring" && KDistChebyshev(item.x - slot.x, item.y - slot.y) < KDMapData.GridHeight / 3;})) {
			KDMapData.GroundItems.push({x:slot.x, y:slot.y, name: "Keyring"});
			placed += 1;
		}
		jailKeyList.splice(N, 1);
	}
}

function KinkyDungeonHandleJailSpawns(delta: number): void {
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
	if (KinkyDungeonInJail(KDJailFilters) && KDGameData.PrisonerState == "jail" && (KDGameData.GuardSpawnTimer <= 1 || KDGameData.SleepTurns == 3) && !KinkyDungeonJailGuard() && playerInCell) {
		KDGetJailEvent(KinkyDungeonJailGuard(), xx, yy)(KinkyDungeonJailGuard(), xx, yy);
	} else if (KDGameData.GuardSpawnTimer > 0 && KDGameData.SleepTurns < 1 && !KinkyDungeonAngel()) KDGameData.GuardSpawnTimer -= delta;

	// Assign and handle the current jail action if there is a guard
	if (KinkyDungeonJailGuard() && KDGameData.GuardTimer > 0 && KDGameData.GuardTimerMax - KDGameData.GuardTimer > 6 && KDGameData.PrisonerState == 'jail') {
		if (KDGuardActions[KinkyDungeonJailGuard().CurrentAction] && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].assignable && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].assignable(KinkyDungeonJailGuard(), xx, yy)) {
			KDAssignGuardAction(KinkyDungeonJailGuard(), xx, yy);
		}
	}

	if (KinkyDungeonJailGuard() && !KinkyDungeonJailGuard().IntentAction && !KinkyDungeonJailGuard().action) {
		if (KDGuardActions[KinkyDungeonJailGuard().CurrentAction] && KDGuardActions[KinkyDungeonJailGuard().CurrentAction].handle) {
			KDGuardActions[KinkyDungeonJailGuard().CurrentAction].handle(KinkyDungeonJailGuard(), xx, yy, delta);
		}

		// Return guard to wandering if the jail is over
		if (KDGameData.PrisonerState != 'jail') {
			KinkyDungeonJailGuard().CurrentAction = "jailWander";
		}

		KinkyDungeonJailGuard().gxx = KDGameData.PrisonerState == 'jail' && KDGameData.GuardTimer > 0 ? KinkyDungeonJailGuard().gx : xx;
		KinkyDungeonJailGuard().gyy = KDGameData.PrisonerState == 'jail' && KDGameData.GuardTimer > 0 ? KinkyDungeonJailGuard().gy : yy;
		if (KDGameData.GuardTimer > 0 && KinkyDungeonJailGuard()) {
			// Decrease timer when not on a tour
			if (!KinkyDungeonFlags.has("notickguardtimer") && !KinkyDungeonAngel()) {
				KDGameData.GuardTimer -= 1;
				if (KDGameData.GuardTimer <= 0) {
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
				KDRemoveEntity(KinkyDungeonJailGuard());
				let doorOff = 1;
				//KDSpliceIndex(KDMapData.Entities.indexOf(KinkyDungeonJailGuard()), 1);
				// Close the door
				if (KinkyDungeonTilesGet((xx-doorOff) + "," + yy) && 'dD'.includes(KinkyDungeonMapGet(xx-doorOff, yy))) {
					KinkyDungeonMapSet(xx-doorOff, yy, 'D');
					if (KDGameData.PrisonerState == 'jail') {
						KinkyDungeonTilesGet((xx-doorOff) + "," + yy).Type = "Door";
						KinkyDungeonTilesGet((xx-doorOff) + "," + yy).Lock = KinkyDungeonGenerateLock(true, KDGetEffLevel(), false, "Door", {x: (xx-doorOff), y: yy, tile: KinkyDungeonTilesGet((xx-doorOff) + "," + yy)});
					}
					if (KDGameData.PrisonerState == 'jail' && KinkyDungeonVisionGet(g.x, g.y))
						KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonGuardDisappear").replace("EnemyName", TextGet("Name" + g.Enemy.name)), "#ff5277", 6);
					if (KinkyDungeonPlayerInCell(true))
						KinkyDungeonChangeRep("Ghost", 1 + KDGameData.KinkyDungeonPrisonExtraGhostRep);
					KDGameData.KinkyDungeonPrisonExtraGhostRep = 0;
				}
			} else if (!KinkyDungeonJailGuard().IntentAction || KinkyDungeonJailGuard().IntentAction.startsWith('jail')) {
				if (!KinkyDungeonFlags.has("notickguardtimer")
					&& !KinkyDungeonFlags.has("nojailbreak")) {
					// Return so that they can despawn
					KinkyDungeonJailGuard().gx = xx;
					KinkyDungeonJailGuard().gy = yy;
				}
			}
		}
	}

	// Unlock all jail doors when chasing
	if (!KDGameData.PrisonerState || KDGameData.PrisonerState == 'chase') {
		for (let T of Object.values(KDMapData.Tiles)) {
			if (T.Lock && T.Type == "Door" && T.Jail) {
				T.OGLock = T.Lock;
				T.Lock = undefined;
			}
		}
	}

	if (!KinkyDungeonJailGuard()) {
		KDGameData.GuardTimer = 0;
		if (KinkyDungeonLeashingEnemy()?.Enemy?.tags?.jailer || KinkyDungeonLeashingEnemy()?.Enemy?.tags?.jail) {
			if (KinkyDungeonLeashingEnemy().CurrentAction)
				KDGameData.JailGuard = KinkyDungeonLeashingEnemy().id;
		}
		if (!KinkyDungeonJailGuard()) {
			// In case enemy got interrupted
			for (let en of KDMapData.Entities) {
				if (!KDHelpless(en) && en.CurrentAction) {
					KDGameData.JailGuard = en.id;
				}
			}
		}
	} else {
		if (KDHelpless(KinkyDungeonJailGuard())) {
			KDGameData.JailGuard = 0;
		}
		if (KinkyDungeonJailGuard() && KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y) > 10 && KDGameData.GuardTimer < 4) {
			KDGameData.JailGuard = 0;
		}
	}
	if (!KDMapData.Entities.includes(KinkyDungeonJailGuard())) {
		if (KDGameData.GuardSpawnTimer == 0 || KinkyDungeonJailGuard())
			KDGameData.GuardSpawnTimer = 14 + Math.floor(KDRandom() * (KDGameData.GuardSpawnTimerMax - KDGameData.GuardSpawnTimerMin));
		KDGameData.JailGuard = 0;
	}
	if (KDGameData.GuardSpawnTimerMax == undefined) {
		// Fix the save file

		KDGameData.JailGuard = 0;
		KDGameData.GuardSpawnTimer = 0;
		KDGameData.GuardSpawnTimerMax = 80;
		KDGameData.GuardSpawnTimerMin = 50;
		KDGameData.GuardTimer = 0;
		KDGameData.GuardTimerMax = 24;
	}
}

function KinkyDungeonLockableItems() {
	let LockableGroups = [];
	for (let g of KinkyDungeonStruggleGroupsBase) {
		let currentItem = KinkyDungeonGetRestraintItem(g);
		if (currentItem && !currentItem.lock && KinkyDungeonIsLockable(KDRestraint(currentItem))) {
			LockableGroups.push(g);
		}
	}
	return LockableGroups;
}

function KinkyDungeonMissingJailUniform() {
	let MissingGroups = [];
	for (let g of KinkyDungeonStruggleGroupsBase) {

		let jrest = KinkyDungeonGetJailRestraintForGroup(g);
		let rest = jrest.restraint;
		let currentItem = KinkyDungeonGetRestraintItem(g);
		if (rest
			&& (!currentItem || (
				KDCanAddRestraint(rest,
					KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined,
					undefined,
					!KinkyDungeonStatsChoice.has("TightRestraints") ? true : undefined,
					undefined,
					KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard(), false, undefined, undefined, (jrest.variant && KDApplyVariants[jrest.variant]?.powerBonus) ? KDApplyVariants[jrest.variant].powerBonus : 0)
				&& (!currentItem.dynamicLink || !KDDynamicLinkList(currentItem, true).some((item) => {return rest.name == item.name;})))
			)
			&& (KinkyDungeonStatsChoice.get("arousalMode") || !rest.arousalMode)
			&& (!KinkyDungeonStatsChoice.get("arousalModePlugNoFront") || !(rest.shrine.includes("Plugs") && rest.Group == "ItemVulva"))
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
	let allowedRestraints = {};
	KDGetJailRestraints().forEach((rest) => {
		allowedRestraints[rest.Name] = true;
	});
	let RemoveGroups = [];
	for (let g of Groups) {
		let jrest = KinkyDungeonGetJailRestraintForGroup(g);
		let rest = jrest.restraint;
		let currentItem = KinkyDungeonGetRestraintItem(g);
		let cutoffpower = KinkyDungeonStatsChoice.get("KinkyPrison") ? -50 : 4;
		let lockMult = currentItem ? Math.max(1, KinkyDungeonGetLockMult(currentItem.lock, currentItem) - 0.5) : (currentItem && KinkyDungeonIsLockable(KDRestraint(currentItem)) ? 0.4 : 1);
		if (
			((!rest && currentItem && KinkyDungeonRestraintPower(currentItem, false) + 0.01 <= Math.max(cutoffpower + 0.1, rest ? rest.power : cutoffpower)) // There shouldnt be one here
			|| (rest && currentItem && currentItem && rest.name != currentItem.name && !allowedRestraints[currentItem.name]
				&& (KinkyDungeonRestraintPower(currentItem, false) + 0.01 < rest.power || KDRestraint(currentItem).power * lockMult <= Math.max(cutoffpower + 0.1, rest ? rest.power : cutoffpower)))) // Wrong item equipped
		) {
			if (!currentItem || (!currentItem.curse && !KDRestraint(currentItem).curse && !KDRestraint(currentItem).enchanted))
				RemoveGroups.push(g);
		}
	}
	return RemoveGroups;
}

/**
 * @param player
 * @param enemy
 * @param point
 */
function KDPutInJail(player: entity, enemy: entity, point: { x: number, y: number }): void {
	let entity = enemy ? enemy : player;
	let nearestJail = KinkyDungeonNearestJailPoint(entity.x, entity.y);
	let jailRadius = (nearestJail && nearestJail.radius) ? nearestJail.radius : 1.5;
	let playerInCell = nearestJail ? (Math.abs(player.x - nearestJail.x) < jailRadius - 1 && Math.abs(player.y - nearestJail.y) <= jailRadius)
		: null;
	if (!playerInCell) {
		//let point = {x: nearestJail.x, y: nearestJail.y};//KinkyDungeonGetNearbyPoint(nearestJail.x, nearestJail.y, true, undefined, true);
		if (!point) point = KinkyDungeonNearestJailPoint((enemy || player).x, (enemy || player).y, ["jail"]);
		if (point) {
			KDBreakTether(player);
			if (player.player)
				KDMovePlayer(point.x, point.y, false);
			else
				KDMoveEntity(player, point.x, point.y, false);
		}
	}
}

/**
 * @param xx
 * @param yy
 * @param type
 */
function KinkyDungeonHandleLeashTour(xx: number, yy: number, type: string): void {
	let player = KDPlayer();
	// Remove the leash when we are done
	if (KDIsPlayerTetheredToEntity(KDPlayer(), KinkyDungeonJailGuard()) && !KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints) {

		let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y);
		if (KDistChebyshev(KinkyDungeonJailGuard().x - nearestJail.x, KinkyDungeonJailGuard().y - nearestJail.y) < 1.5) {
			let leashItemToRemove = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
			if (leashItemToRemove) {
				KinkyDungeonRemoveRestraint("ItemNeckRestraints", false);
				let msg = TextGet("KinkyDungeonRemoveRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
				msg = msg.replace("OldRestraintName", TextGet("Restraint"+leashItemToRemove.name));
				KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
			}
			KDGameData.KinkyDungeonPrisonExtraGhostRep += 2;

			KDPutInJail(KinkyDungeonPlayerEntity, KinkyDungeonJailGuard(), null);

			if (KinkyDungeonJailGuard()?.KinkyDungeonJailTourInfractions < 1) {
				let item = "CookieJailer";
				KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), TextGet("KinkyDungeonJailerReleaseGoodGirl").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name)), "#e7cf1a", 4, 9);
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonJailerReleaseGoodGirlMsg")
					.replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name))
					.replace("ItemName", KDGetItemNameString(item)),
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
			KinkyDungeonJailGuard().gx = nearestJail.x;
			KinkyDungeonJailGuard().gy = nearestJail.y;
		}

	} else {
		// Run the leash
		let playerDist = KDistChebyshev(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x, KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y);//Math.sqrt((KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x)*(KinkyDungeonJailGuard().x - KinkyDungeonPlayerEntity.x) + (KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y)*(KinkyDungeonJailGuard().y - KinkyDungeonPlayerEntity.y));
		let wearingLeash = KinkyDungeonIsWearingLeash();
		if (!wearingLeash) {
			let touchesPlayer = KinkyDungeonCheckLOS(KinkyDungeonJailGuard(), KinkyDungeonPlayerEntity, playerDist, 1.5, false, false);
			if (touchesPlayer) {
				if (!KinkyDungeonPlayerTags.get("Collars")) {
					let collar = KinkyDungeonGetRestraintByName("BasicCollar");
					KinkyDungeonAddRestraintIfWeaker(collar, KinkyDungeonJailGuard().Enemy.power, true, "", undefined, undefined, undefined, KDGetFaction(KinkyDungeonJailGuard()), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard(), false);
					let msg = TextGet("KinkyDungeonAddRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
					msg = msg.replace("NewRestraintName", TextGet("Restraint"+collar.name));
					KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					if (type == "transfer") {
						let guard = KinkyDungeonJailGuard();
						let nearestJail = KinkyDungeonRandomJailPoint(["jail"], [KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)]);
						if (nearestJail) {
							guard.NextJailLeashTourWaypointX = nearestJail.x;
							guard.NextJailLeashTourWaypointY = nearestJail.y;
							guard.gx = guard.NextJailLeashTourWaypointX;
							guard.gy = guard.NextJailLeashTourWaypointY;
						}
					} else {

						KinkyDungeonJailGuard().NextJailLeashTourWaypointX = KinkyDungeonJailGuard().x;
						KinkyDungeonJailGuard().NextJailLeashTourWaypointY = KinkyDungeonJailGuard().y;
					}
					KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().y;
				} else {
					let leash = KinkyDungeonGetRestraintByName("BasicLeash");
					KinkyDungeonAddRestraintIfWeaker(leash, KinkyDungeonJailGuard().Enemy.power, true, "", undefined, undefined, undefined, KDGetFaction(KinkyDungeonJailGuard()), KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined, undefined, KinkyDungeonJailGuard(), false);
					let msg = TextGet("KinkyDungeonAddRestraints").replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
					msg = msg.replace("NewRestraintName", TextGet("Restraint"+leash.name));
					KinkyDungeonSendTextMessage(5, msg, "yellow", 1);
					KinkyDungeonJailGuard().NextJailLeashTourWaypointX = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().NextJailLeashTourWaypointY = KinkyDungeonJailGuard().y;
					if (type == "transfer") {
						let guard = KinkyDungeonJailGuard();
						let nearestJail = KinkyDungeonRandomJailPoint(["jail"], [KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y)]);
						if (nearestJail) {
							guard.NextJailLeashTourWaypointX = nearestJail.x;
							guard.NextJailLeashTourWaypointY = nearestJail.y;
							guard.gx = guard.NextJailLeashTourWaypointX;
							guard.gy = guard.NextJailLeashTourWaypointY;
						}
					} else {

						KinkyDungeonJailGuard().NextJailLeashTourWaypointX = KinkyDungeonJailGuard().x;
						KinkyDungeonJailGuard().NextJailLeashTourWaypointY = KinkyDungeonJailGuard().y;
					}
					KinkyDungeonJailGuard().gx = KinkyDungeonJailGuard().x;
					KinkyDungeonJailGuard().gy = KinkyDungeonJailGuard().y;
				}
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard(), player);
			} else {
				KinkyDungeonJailGuard().gx = KinkyDungeonPlayerEntity.x;
				KinkyDungeonJailGuard().gy = KinkyDungeonPlayerEntity.y;
			}
		} else if (!KDGetTetherLength(KinkyDungeonPlayerEntity)) {
			KinkyDungeonJailGuard().gx = KinkyDungeonPlayerEntity.x;
			KinkyDungeonJailGuard().gy = KinkyDungeonPlayerEntity.y;
			if (playerDist < 1.5) {
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard(), player);
			}
		} else if (KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints > 0
            && (KDistChebyshev(
				KinkyDungeonJailGuard().x - KinkyDungeonJailGuard().NextJailLeashTourWaypointX,
				KinkyDungeonJailGuard().y - KinkyDungeonJailGuard().NextJailLeashTourWaypointY) < 2
            || (KDRandom() < 0.05 && KDistChebyshev(
				KinkyDungeonJailGuard().x - KinkyDungeonJailGuard().NextJailLeashTourWaypointX,
				KinkyDungeonJailGuard().y - KinkyDungeonJailGuard().NextJailLeashTourWaypointY) < 5)
			|| KDRandom() < 0.01)) {
			KinkyDungeonJailGuard().RemainingJailLeashTourWaypoints--;
			if (KinkyDungeonJailGuard().NextJailLeashTourWaypointX > KinkyDungeonJailLeashX + 2) {
				if (KinkyDungeonLastAction == "Move") {
					if (KDRandom() < 0.5) {
						let index = "0";
						if (KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions < 1) {
							index = "" + Math.floor(KDRandom() * 6);
							//KinkyDungeonChangeRep("Ghost", 8);
						}
						KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), TextGet("KinkyDungeonJailerGoodGirl" + index).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name)), "#e7cf1a", 4, 9);
					}
					KDTickTraining("Heels", KDGameData.HeelPower > 0 && !(KDGameData.KneelTurns > 0),
						KDGameData.HeelPower <= 0, 2, 20);
				}
			}
			KinkyDungeonJailGuardGetLeashWaypoint(xx, yy, type);
		} else {
			let enemy = KinkyDungeonJailGuard();
			let pullDist = (KinkyDungeonLastAction == "Move"
				&& KDistEuclidean(KinkyDungeonPlayerEntity.x - enemy.x, KinkyDungeonPlayerEntity.y - enemy.y)
					> KDistEuclidean(KinkyDungeonPlayerEntity.lastx - enemy.x, KinkyDungeonPlayerEntity.lasty - enemy.y)
				) ? 1.5 : 3.5;
			if (playerDist < 1.5) {
				KinkyDungeonAttachTetherToEntity(2, KinkyDungeonJailGuard(), player);
			}
			if (playerDist > pullDist && KinkyDungeonSlowLevel < 2 && KinkyDungeonCheckProjectileClearance(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y)) {
				// Guard goes back towards the player and reminds them
				let msg = TextGet("KinkyDungeonRemindJailTour" + KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
				let msgPrev = TextGet("KinkyDungeonRemindJailTour" + Math.max(0, KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions-1)).replace("EnemyName", TextGet("Name" + KinkyDungeonJailGuard().Enemy.name));
				if (KinkyDungeonLastAction == "Move") {

					KinkyDungeonSendDialogue(KinkyDungeonJailGuard(), msg, "#e7cf1a", 6, 7 + KinkyDungeonJailGuard().KinkyDungeonJailTourInfractions);
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

					/*if (guardPath[0].x === KinkyDungeonPlayerEntity.x && guardPath[0].y === KinkyDungeonPlayerEntity.y) {
						// Swap the player and the guard
						KinkyDungeonTargetTile = null;
						KinkyDungeonTargetTileLocation = "";
						KDMovePlayer(KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, false);
						if (KinkyDungeonJailGuard()) {
							KinkyDungeonJailGuard().x = guardPath[0].x;
							KinkyDungeonJailGuard().y = guardPath[0].y;
						}
					}
					let en = KinkyDungeonEnemyAt(guardPath[0].x, guardPath[0].y);
					if (en) {
						KDMoveEntity(en, KinkyDungeonJailGuard().x, KinkyDungeonJailGuard().y, true, undefined, undefined, true);
						if (KinkyDungeonJailGuard()) {
							KinkyDungeonJailGuard().x = guardPath[0].x;
							KinkyDungeonJailGuard().y = guardPath[0].y;
						}
					}*/
				} else KinkyDungeonJailGuardGetLeashWaypoint(xx, yy, type);
				KinkyDungeonUpdateTether(true, KinkyDungeonPlayerEntity);
			}
		}
	}
}

function KDGetEffSecurityLevel(faction?: string, Cap?: boolean): number {
	if (!faction) faction = KDGetMainFaction();
	let basemod =
		(KinkyDungeonStatsChoice.get("NoWayOut") ? 10 : 0)
		+ (KinkyDungeonStatsChoice.get("KinkyPrison") ? 10 : 0)
		+ (KinkyDungeonStatsChoice.get("TightRestraints") ? 10 : 0);

	if (faction) {
		let mod = basemod-KDFactionRelation("Player", faction) * KDMainFactionSecurityMod;
		if (!Cap) return mod + KinkyDungeonGoddessRep.Prisoner;
		return Math.max(-50, Math.min(50, mod + KinkyDungeonGoddessRep.Prisoner));
	}
	return basemod+KinkyDungeonGoddessRep.Prisoner;
}

/**
 * @param xx
 * @param yy
 * @param type
 */
function KinkyDungeonJailGuardGetLeashWaypoint(xx: number, yy: number, type: string): void {
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

function KinkyDungeonJailGetLeashPoint(xx: number, yy: number, enemy: entity): { x: number, y: number } {
	let randomPoint = { x: xx, y: yy };
	for(let i = 0; i < 40; ++i) {
		let candidatePoint = KinkyDungeonGetRandomEnemyPoint(true, false, enemy);
		if (candidatePoint && !(KinkyDungeonEnemyAt(candidatePoint.x, candidatePoint.y)?.Enemy?.immobile)) {
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
 * @param [any]
 * @param [qualified] - Makes sure the player is qualified
 * @param [filter]
 * @returns - Returns if the player is inside the nearest jail cell
 */
function KinkyDungeonPlayerInCell(any?: boolean, qualified?: boolean, filter?: string[]): boolean {
	if (!filter && KinkyDungeonTilesGet(KinkyDungeonPlayerEntity.x + "," + KinkyDungeonPlayerEntity.y)?.Jail) {
		return true;
	}
	let nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, filter, any, qualified);
	if (!nearestJail || nearestJail.type != "jail") return false;
	return KDistChebyshev(KinkyDungeonPlayerEntity.x - nearestJail.x, KinkyDungeonPlayerEntity.y - nearestJail.y) < 2;
	//return (Math.abs(KinkyDungeonPlayerEntity.x - KDMapData.StartPosition.x) < KinkyDungeonJailLeashX - 1 && Math.abs(KinkyDungeonPlayerEntity.y - KDMapData.StartPosition.y) <= KinkyDungeonJailLeash);
}

function KinkyDungeonPointInCell(x: number, y: number, radius: number = 2): boolean {
	let nearestJail = KinkyDungeonNearestJailPoint(x, y);
	if (!nearestJail) return false;
	return KDistChebyshev(x - nearestJail.x, y - nearestJail.y) < radius;
	//return (Math.abs(x - KDMapData.StartPosition.x) < KinkyDungeonJailLeashX - 1 && Math.abs(y - KDMapData.StartPosition.y) <= KinkyDungeonJailLeash);
}

function KinkyDungeonPassOut(noteleport?: boolean) {
	KDDefeatedPlayerTick();
	KDBreakTether(KinkyDungeonPlayerEntity);
	KDGameData.KinkyDungeonLeashedPlayer = 0;
	KinkyDungeonBlindLevel = 6;
	KinkyDungeonStatBlind = 10;
	KinkyDungeonUpdateLightGrid = true;
	KDGameData.AlertTimer = 0;
	KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["passout"]);
	KinkyDungeonSendEvent("passout", {});

	KDApplyLivingCollars();

	KinkyDungeonStripInventory();

	if (KinkyDungeonCurrentDress == "Default")
		KinkyDungeonSetDress("Bikini", "Bikini");
	KinkyDungeonDressPlayer();

	KinkyDungeonChangeStamina(-100);
	KinkyDungeonChangeMana(-100);
	KinkyDungeonChangeDistraction(-100);

	KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonPassOut"), "#ff5277", 5);
	KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonPassOut2"), "#ff5277", 5);


	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDMapData.KeysHeld = 0;
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
	KDGameData.SlowMoveTurns = 10;
}

function KDGetJailDoor(x: number, y: number): { tile: any; x: number; y: number } {
	let point = KinkyDungeonNearestJailPoint(x, y);
	if (point) {
		x = point.x;
		y = point.y;
	}
	x += KinkyDungeonJailLeashX - 1;
	return {tile: KinkyDungeonTilesGet((x) + "," + y), x: x, y: y};
}

function KDDefeatedPlayerTick(nodefeat?: boolean) {
	KinkyDungeonSetFlag("refusedShopkeeperRescue", 5); // To prevent spawning instantly
	KinkyDungeonRemoveBuffsWithTag(KinkyDungeonPlayerEntity, ["removeDefeat"]);
	KDGameData.JailGuard = 0;
	KDGameData.KinkyDungeonLeashingEnemy = 0;
	KDBreakTether(KinkyDungeonPlayerEntity);
	if (!nodefeat)
		KinkyDungeonSetFlag("playerDefeated", 1);
}


function KDEnterDemonTransition() {
	KDDefeatedPlayerTick();
	//KDGameData.RoomType = "DemonTransition"; // We do a tunnel every other room
	//KDGameData.MapMod = ""; // Reset the map mod
	KDGameData.CurrentDialog = "";
	let params = KinkyDungeonMapParams.DemonTransition;
	KinkyDungeonCreateMap(params, "DemonTransition", "", MiniGameKinkyDungeonLevel, undefined, undefined, undefined, undefined, undefined, "");

	for (let inv of KinkyDungeonAllRestraint()) {
		if ((KDRestraint(inv).removePrison || KDRestraint(inv).forceRemovePrison) && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).forceRemovePrison || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze || KDRestraint(inv).immobile)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}

	KinkyDungeonDressPlayer();
	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");

	KDMapData.KeysHeld = 0;

	KDMovePlayer(KDMapData.StartPosition.x, KDMapData.StartPosition.y, false);

	KinkyDungeonLoseJailKeys();
	KDResetAllAggro();

	KinkyDungeonSaveGame();
}

function KDEnterDollTerminal(willing: boolean, cancelDialogue: boolean = true, forceOutfit: boolean = true): void {
	let dollStand = KinkyDungeonPlayerTags.get("Dollstand");

	KDDefeatedPlayerTick(!willing);
	KDGameData.PrisonerState = 'jail';
	if (cancelDialogue) KDGameData.CurrentDialog = "";
	let faction = KDGetMainFaction() == "Dollsmith" ? "Dollsmith" : "AncientRobot";
	let params = KinkyDungeonMapParams[alts.DollStorage?.genType || (KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
	KDGameData.DollRoomCount = 0;
	KinkyDungeonCreateMap(params, "DollStorage", "", MiniGameKinkyDungeonLevel, undefined, undefined, faction, undefined, undefined, "");

	for (let inv of KinkyDungeonAllRestraint()) {
		if ((KDRestraint(inv).removePrison || KDRestraint(inv).forceRemovePrison) && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).forceRemovePrison || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze || KDRestraint(inv).immobile)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}

	if (forceOutfit && !willing) {
		let defeat_outfit = "CyberDoll";
		if (KDGetMainFaction() == "Dollsmith") defeat_outfit = "DollSuit";
		if (KinkyDungeonStatsChoice.has("KeepOutfit")) defeat_outfit = "Default";

		KinkyDungeonSetDress(defeat_outfit, defeat_outfit);
	}

	KDFixPlayerClothes("Dollsmith");
	KinkyDungeonDressPlayer();
	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDMapData.KeysHeld = 0;

	//KDMovePlayer(Math.floor(KDMapData.GridWidth/2), Math.floor(KDMapData.GridHeight/2), false);

	KinkyDungeonLoseJailKeys();
	KDResetAllAggro();

	if (dollStand && !KinkyDungeonPlayerTags.get("dollStand")) {
		KDPlayerEffectRestrain(undefined, 1, ["dollstand"], KDGetMainFaction(), false, true, false, false, false);
	}

	KinkyDungeonSaveGame();
}

function KDApplyLivingCollars() {
	let options = {ApplyVariants: true, allowLowPower: true};
	let collars = KDGetRestraintsEligible({tags: ["livingCollar"]}, 24, "grv", true, undefined, undefined, undefined, undefined, undefined, true, undefined, undefined, undefined, undefined, undefined, undefined, undefined, options);
	let eligible = [];
	for (let item of collars) {
		let collar = item.restraint;
		let events = collar.events;
		for (let e of events) {
			if (e.type == "livingRestraints") {
				let newtags = [];
				if (!collar.cloneTag) {
					newtags = e.tags;
				} else {
					newtags.push(collar.cloneTag);
					for (let tag of e.cloneTags) {
						newtags.push(collar.cloneTag + tag);
					}
				}
				let count = 0;
				for (let inv of KinkyDungeonAllRestraintDynamic()) {
					let found = false;
					for (let tag of newtags) {
						if (KDRestraint(inv.item).enemyTags[tag] != undefined) {
							found = true;
							break;
						}
					}
					if (found) {
						count++;
					}
				}
				if (count >= e.count) {
					eligible.push(collar);
				}
			}
		}
	}
	if (eligible.length == 0)
		return;

	if (KinkyDungeonStatsChoice.has("TightRestraints")) {
		for (let item of eligible) {
			if (KinkyDungeonAddRestraintIfWeaker(item, 8, true, undefined, false, undefined, undefined, undefined, true)) {
				KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonLivingAppear").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightblue", 2);
			}
		}
	} else {
		let item = eligible[Math.floor(KDRandom() * eligible.length)];
		if (KinkyDungeonAddRestraintIfWeaker(item, 8, true, undefined, false, undefined, undefined, undefined, true)) {
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonLivingAppear").replace("RESTRAINTNAME", TextGet("Restraint" + item.name)), "lightblue", 2);
		}
	}
}

function KinkyDungeonDefeat(PutInJail?: boolean, leashEnemy?: entity) {
	KinkyDungeonInterruptSleep();
	KDBreakAllLeashedTo(KinkyDungeonPlayerEntity);

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

	if (KinkyDungeonStatsChoice.get("LivingCollars"))
		KDApplyLivingCollars();

	for (let inv of KinkyDungeonAllRestraint()) {
		if ((KDRestraint(inv).removePrison || KDRestraint(inv).forceRemovePrison) && (!KinkyDungeonStatsChoice.get("KinkyPrison") || KDRestraint(inv).forceRemovePrison || KDRestraint(inv).removeOnLeash || KDRestraint(inv).freeze || KDRestraint(inv).immobile)) {
			KinkyDungeonRemoveRestraint(KDRestraint(inv).Group, false);
		}
	}
	KDGameData.KinkyDungeonPrisonReduction = 0;
	//let firstTime = KDGameData.KinkyDungeonSpawnJailersMax == 0;
	KDResetGuardSpawnTimer();
	KDGameData.KinkyDungeonSpawnJailersMax = 2;
	KDGameData.KinkyDungeonSpawnJailersMax += Math.round(6 * (KDGetEffSecurityLevel(undefined, true) + 50)/100);
	//let securityBoost = (firstTime) ? 0 : Math.max(2, Math.ceil(4 * (KDGameData.KinkyDungeonSpawnJailersMax - KDGameData.KinkyDungeonSpawnJailers + 1)/KDGameData.KinkyDungeonSpawnJailersMax));

	KinkyDungeonStatBlind = 3;

	//MiniGameKinkyDungeonLevel = Math.floor((MiniGameKinkyDungeonLevel + Math.max(0, KinkyDungeonSpawnJailersMax - KinkyDungeonSpawnJailers))/5)*5;
	//MiniGameKinkyDungeonLevel = Math.floor(MiniGameKinkyDungeonLevel/2)*2;
	KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonLeashed"), "#ff5277", 3);
	if (!KinkyDungeonJailedOnce) {
		KinkyDungeonJailedOnce = true;
		KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonLeashed2"), "#ff5277", 3);
	}
	let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
	KDGameData.KinkyDungeonSpawnJailers = KDGameData.KinkyDungeonSpawnJailersMax;
	let defeat_outfit = params.defeat_outfit;
	// Handle special cases
	let collar = KinkyDungeonGetRestraintItem("ItemNeck");
	if (collar && KDRestraint(collar) && KinkyDungeonPlayerTags.get("Collars")) {
		if (KDRestraint(collar).name == "DragonCollar") defeat_outfit = "Dragon";
		if (KDRestraint(collar).name == "MaidCollar") defeat_outfit = "Maid";
		if (KDRestraint(collar).name == "ExpCollar") defeat_outfit = "BlueSuitPrison";
		if (KDRestraint(collar).name == "WolfCollar") defeat_outfit = "Wolfgirl";
		if (KDRestraint(collar).name == "MithrilCollar") defeat_outfit = "Elven";
		if (KDRestraint(collar).name == "ObsidianCollar") defeat_outfit = "Obsidian";
	}
	if (KDGetMainFaction() && KDFactionProperties[KDGetMainFaction()]?.jailOutfit) defeat_outfit = KDFactionProperties[KDGetMainFaction()]?.jailOutfit;
	if (KinkyDungeonStatsChoice.has("KeepOutfit")) defeat_outfit = "Default";

	KinkyDungeonSetDress(defeat_outfit, "JailUniform");
	KinkyDungeonStripInventory();

	if (defeat_outfit != params.defeat_outfit) {
		if (!KinkyDungeonInventoryGet(defeat_outfit)) KinkyDungeonInventoryAdd({name: defeat_outfit, type: Outfit, id: KinkyDungeonGetItemID()});
	} else if (!KinkyDungeonInventoryGet("JailUniform")) KinkyDungeonInventoryAdd({name: "JailUniform", type: Outfit, id: KinkyDungeonGetItemID()});

	//KinkyDungeonChangeRep("Ghost", 1 + Math.round(KinkyDungeonSpawnJailers/2));
	//KinkyDungeonChangeRep("Prisoner", securityBoost); // Each time you get caught, security increases...

	KinkyDungeonDressPlayer();
	if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/StoneDoor_Close.ogg");

	KDMapData.KeysHeld = 0;

	if (PutInJail) {
		//KDGameData.RoomType = "Jail"; // We do a tunnel every other room
		//KDGameData.MapMod = ""; // Reset the map mod
		let forceFaction = undefined;
		if (leashEnemy && (KDFactionProperties[KDGetFaction(leashEnemy)] || KDFactionProperties[KDGetFactionOriginal(leashEnemy)])) {
			if (KDFactionProperties[KDGetFaction(leashEnemy)])
				forceFaction = KDGetFaction(leashEnemy);
			else
				forceFaction = KDGetFactionOriginal(leashEnemy);
		}
		KinkyDungeonCreateMap(params, "Jail", "", MiniGameKinkyDungeonLevel, undefined, undefined, forceFaction, undefined, undefined, "");

		KinkyDungeonSetFlag("LeashToPrison", 0);

		nearestJail = KinkyDungeonNearestJailPoint(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);

	}

	let outfit = KDOutfit({name: KinkyDungeonCurrentDress});
	KDFixPlayerClothes(outfit?.palette || KinkyDungeonPlayer.Palette || KDGetMainFaction() || (KDToggles.ForcePalette ? KDDefaultPalette : "Jail"));
	KinkyDungeonDressPlayer();

	KDMovePlayer(nearestJail.x + (nearestJail.direction?.x || 0), nearestJail.y + (nearestJail.direction?.y || 0), false);
	if (nearestJail.direction) {
		KinkyDungeonSetFlag("conveyed", 1);
	}
	if (nearestJail.restraint) {
		KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName(nearestJail.restraint), KDGetEffLevel(),false, undefined);
	}
	if (nearestJail.restrainttags) {
		let restraint = KinkyDungeonGetRestraint({tags: nearestJail.restrainttags}, KDGetEffLevel(),(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint), false, undefined);
		if (restraint)
			KinkyDungeonAddRestraintIfWeaker(restraint, KDGetEffLevel(),false, undefined);
	}

	KinkyDungeonLoseJailKeys();

	KDGameData.KinkyDungeonSpawnJailers = KDGameData.KinkyDungeonSpawnJailersMax - 1;

	// Lock all jail doors
	for (let X = 1; X < KDMapData.GridWidth - 1; X++)
		for (let Y = 1; Y < KDMapData.GridHeight - 1; Y++) {
			let tile = KinkyDungeonTilesGet(X + "," + Y);
			if (tile && ((tile.Jail && tile.ReLock) || tile.OGLock) && (KinkyDungeonMapGet(X, Y) == 'd' || KinkyDungeonMapGet(X, Y) == 'D')) {
				KinkyDungeonMapSet(X, Y, 'D');
				if (tile && !tile.Lock
					&& (!tile.Jail || (KDGameData.PrisonerState == 'jail' || KDistChebyshev(KDPlayer().x - X, KDPlayer().y - Y) > 2.5))) {
					tile.Lock = tile.OGLock || "Red";
					tile.Type = "Door";
					KDUpdateDoorNavMap();
				}
			}
		}

	KDKickEnemies(nearestJail, false, MiniGameKinkyDungeonLevel);
	KDResetAllAggro();

	KDRepairRubble(true);

	KinkyDungeonSaveGame();
}

/**
 * @param JailBorderOnly
 */
function KDRepairRubble(JailBorderOnly: boolean) {
	let tile = null;
	for (let X = 0; X < KDMapData.GridWidth - 1; X++) {
		for (let Y = 0; Y < KDMapData.GridHeight - 1; Y++) {
			let yes = !JailBorderOnly;
			let effectTags = KDEffectTileTags(X, Y);
			if (effectTags.seal) {
				if (!yes) {
					for (let XX = -1; XX <= 1; XX++)
						for (let YY = -1; YY <= 1; YY++)
							if (!yes) {
								tile = KinkyDungeonTilesGet((X + XX) + ',' + (Y + YY));
								if (tile && (tile.Jail || tile.OL || tile.NW)) {
									yes = true;
								}
							}
				}
				if (yes) {
					let effectTiles = KDGetEffectTiles(X, Y);

					for (let et of Object.values(effectTiles)) {
						if (et.duration < 9000 || et.tags?.includes("seal")) {
							et.duration = 0;
						}
					}
					KinkyDungeonMapSet(X, Y, '4');
				}
			}
		}
	}
}

/**
 * @param enemy
 */
function KDEnemyIsTemporary(enemy: entity): boolean {
	return enemy.Enemy.tags.temporary || (enemy.lifetime > 0);
}

/**
 * Kicks enemies away, and also out of offlimits zones if they are aware
 * @param nearestJail
 * @param ignoreAware
 * @param Level
 * @param [noCull]
 */
function KDKickEnemies(nearestJail: any, ignoreAware: boolean, Level: number, noCull?: boolean): boolean {

	let altRoom = KDMapData.RoomType;
	let mapMod = KDMapData.MapMod ? KDMapMods[KDMapData.MapMod] : null;
	let altType = altRoom ? KinkyDungeonAltFloor((mapMod && mapMod.altRoom) ? mapMod.altRoom : altRoom) : KinkyDungeonBossFloor(Level);

	let canCull = !noCull && (altType?.alwaysRegen || (altType && !(altType?.makeMain || altType?.persist)));
	let atLeastOneAware = false;
	let enemies = [];
	let already = new Map();
	for (let e of  KDMapData.Entities) {
		if (!e.Enemy?.tags.temporary && !KDIsImmobile(e) && e.spawnX && e.spawnY) {
			if (e.aware && KDHostile(e) && KinkyDungeonCheckLOS(e, KinkyDungeonPlayerEntity, KDistEuclidean(e.x - KinkyDungeonPlayerEntity.x, e.y - KinkyDungeonPlayerEntity.y),
				10, true, false)) {
				atLeastOneAware = true;
			} else e.aware = false;
			if (!e.leash && (!ignoreAware || !e.aware))
				if (!nearestJail || (e.x == nearestJail.x && e.y == nearestJail.y) || (!e.Enemy.tags?.prisoner && !e.Enemy.tags?.peaceful && !KDEnemyHasFlag(e, "imprisoned"))) {
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
					if (!e.leash && !KDIsImmobile(e))
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

					if (!KDEnemyHasFlag(e, "imprisoned") && e.boundLevel && !KDHelpless(e)) {
						KDSetToExpectedBondage(e, -1);
					}
				}
			if (e.hostile < 9000) e.hostile = 0;
			if (e.playWithPlayer > 0) {
				e.playWithPlayer = 0;
				e.playWithPlayerCD = 10;
			}
			KDExpireFlags(e);
			KDResetIntent(e, {});
			if (e.boundLevel && !KDIsImprisoned(e)) {
				if (canCull && KDHelpless(e)) {
					KDRemoveEntity(e, false, true, true);
				} else {
					enemies.push(e);
				}
				if (KDGetFaction(e) != "Player"
					&& KDFactionRelation(KDGetFaction(e), KDMapData.MapFaction) > 0.5) {
					KDRunNPCEscapeTick(e.id, 12 + Math.floor(24 * KDRandom()));
				}
			} else {
				enemies.push(e);
			}
		}
	}
	KDMapData.Entities = enemies;
	KDCommanderRoles = new Map();
	KDUpdateEnemyCache = true;
	return atLeastOneAware;
}

function KDResetAllIntents(nonHostileOnly?: boolean, endPlay: number = 30, _player?: void) {
	for (let e of  KDMapData.Entities) {
		if (!nonHostileOnly || !KinkyDungeonAggressive(e)) {
			if (endPlay) {
				KDSetPlayCD(e, 2, 10);
				e.playWithPlayer = 0;
				e.dialogue = "";
			}
			if (e.IntentAction && !KDIntentEvents[e.IntentAction].noMassReset)
				KDResetIntent(e);
		}

	}
}
function KDResetAllAggro(_player?: void): void {
	KDGameData.HostileFactions = [];
	for (let e of KDMapData.Entities) {
		if (e.hostile && !KDIntentEvents[e.IntentAction]?.noMassReset)
			e.hostile = 0;
	}
}
function KDForceWanderFar(player: any, radius: number = 10) {
	let enemies = KDNearbyEnemies(player.x, player.y, radius);
	for (let en of enemies) {
		if (en.gx == player.x && en.gy == player.y) {
			KDWanderEnemy(en);
		}
	}

}

/**
 * @param en
 */
function KDWanderEnemy(en: entity) {
	en.gx = en.x;
	en.gy = en.y;
	KinkyDungeonSetEnemyFlag(en, "forceWFar", 5);
	KinkyDungeonSetEnemyFlag(en, "wander", 0);
}

/**
 * Moves an enemy to a random position on the map
 * @param e
 */
function KDKickEnemy(e: entity, minDist: number = 10, force: boolean = false) {
	if (!e.Enemy.tags.temporary || force) {
		if (!e.Enemy.tags.prisoner && !KDEnemyHasFlag(e, "imprisoned")) {
			let p = (e.spawnX != undefined && e.spawnY != undefined) ? {x: e.spawnX, y: e.spawnY} : undefined;
			if (!p  ||  KDistEuclidean (e.x - (e.spawnX != undefined ? e.spawnX : e.x),
				                    e.y - (e.spawnY != undefined ? e.spawnY : e.y)) < minDist)
			{
				p = KinkyDungeonGetRandomEnemyPoint(true);
			}
			if (p) {
				e.x = p.x;
				e.y = p.y;
				e.path = undefined;
				e.gx = e.x;
				e.gy = e.y;
			}


			if (e.boundLevel) KDSetToExpectedBondage(e, -1);
		}
		if (e.hostile < 9000) e.hostile = 0;
		KDExpireFlags(e);
		KDResetIntent(e, {});
	}
	KDClearItems(e);
}

/**
 * Moves an enemy to a random position nearby
 * @param e
 */
function KDKickEnemyLocal(e: entity) {
	let point = KinkyDungeonGetNearbyPoint(e.x, e.y, true, undefined, true, true);
	if (point) {
		KDMoveEntity(e, point.x, point.y, false);
	}
}

function KinkyDungeonStripInventory() {
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

function KDExpireFlags(enemy: entity) {
	if (enemy.flags) {
		for (let f of Object.entries(enemy.flags)) {
			if (f[1] > 0 && f[1] < 9000) enemy.flags[f[0]] = 0;
		}
	}
}

/**
 * Gets the jail outfit of the guard, or using overrideTags instead of the guard's taggs
 * @param [overrideTags]
 * @param [requireJail]
 * @param [requireParole]
 */
function KDGetJailRestraints(overrideTags?: string[], requireJail?: boolean, requireParole?: boolean): KDJailRestraint[] {
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
		if (tag?.overridelowerpriority) {
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

/**
 */
let KDCustomDefeats: Record<string, (enemy: entity) => void> = {
	"DemonTransition": (_enemy) => {
		KDEnterDemonTransition();
	},
	WolfgirlHunters: (enemy) => {
		KinkyDungeonDefeat(true, enemy);
		KDCustomDefeatUniforms.WolfgirlHunters();
	},
	MaidSweeper: (enemy) => {
		KinkyDungeonDefeat(true, enemy);
		KDCustomDefeatUniforms.MaidSweeper();
	},
	DollShoppe: (enemy) => {
		KinkyDungeonDefeat(true, enemy);
		KDCustomDefeatUniforms.DollShoppe();
	},
	CyberDoll: (enemy) => {
		KinkyDungeonDefeat(true, enemy);
		KDCustomDefeatUniforms.CyberDoll();
	},
	ElementalSlave: (enemy) => {
		KinkyDungeonDefeat(true, enemy);
		KDCustomDefeatUniforms.ElementalSlave();
	},
	DollStorage: (enemy) => {
		if (KinkyDungeonFlags.has("LeashToPrison"))
			KDEnterDollTerminal(false, false, false);
		else
			KinkyDungeonDefeat(false, enemy);
	},


	RopeDojo: (_enemy) => {
		KinkyDungeonPassOut(false);
		KDCustomDefeatUniforms.RopeDojo();
	},
};

let KDCustomDefeatUniforms = {
	WolfgirlHunters: () => {
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: (i < (KinkyDungeonStatsChoice.has("NoWayOut") ? 3 : 1) ? ["wolfCuffs"] : ["wolfGear", "wolfRestraints", "linkRegular"])}, 12, "grv", true, "Red");
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Red", undefined, undefined, undefined, undefined, true);
				if (r.Link) {
					let newRestraint = KinkyDungeonGetRestraintByName(r.Link);
					KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true, "Red", undefined, undefined, undefined, undefined, true);
				}
			}
		}
		let outfit = {name: "Wolfgirl", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Wolfgirl")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("Wolfgirl", "Wolfgirl");
	},
	MaidSweeper: () => {
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["maidRestraints", "maidVibeRestraints", "noMaidJacket", "handcuffer", "linkRegular"]}, 12, "grv", true, "Purple");
			if (r)
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", undefined, undefined, undefined, undefined, true);
		}
		let outfit = {name: "Maid", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("Maid")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("Maid", "Maid");
	},
	DollShoppe: () => {
		KinkyDungeonAddRestraintIfWeaker("LatexCatsuit", 5, true, "Red", false, undefined, undefined, "Jail", true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["latexRestraints", "latexStart", "latexCollar", "latexRestraintsForced"]}, 12, "grv", true, "Purple", false, false, false);
			if (r)
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", undefined, undefined, undefined, "Jail", true);
		}
		if (!KinkyDungeonStatsChoice.get("NoKigu"))
			KinkyDungeonAddRestraintIfWeaker(KinkyDungeonGetRestraintByName("KiguMask"), 0, true, "Purple");
	},

	CyberDoll: () => {
		KinkyDungeonAddRestraintIfWeaker("ControlHarness", 5, true, "Cyber3", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("TrackingCollar", 5, true, "Cyber3", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("TrackingModule", 5, true, "Cyber", false, undefined, undefined, "Dollsmith", true);


		KinkyDungeonAddRestraintIfWeaker("CyberBelt", 5, true, "Cyber3", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("CyberBra", 5, true, "Cyber3", false, undefined, undefined, "Dollsmith", true);

		KinkyDungeonAddRestraintIfWeaker("CyberHeels", 5, true, "Cyber", false, undefined, undefined, "Dollsmith", true);
		//KinkyDungeonAddRestraintIfWeaker("CyberBallGag", 5, true, "Red", false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("CyberPlugGag", 5, true, "Cyber2", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("CyberMuzzle", 5, true, "Cyber", false, undefined, undefined, "Dollsmith", true);
		//KinkyDungeonAddRestraintIfWeaker("DollmakerVisor", 5, true, "Gold", false, undefined, undefined, undefined, true);

		KinkyDungeonAddRestraintIfWeaker("CyberMittens", 5, true, "Cyber2", false, undefined, undefined, "Dollsmith", true);

		KinkyDungeonAddRestraintIfWeaker("CyberArmCuffs", 5, true, "Cyber2", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("CyberLegCuffs", 5, true, "Cyber2", false, undefined, undefined, "Dollsmith", true);
		KinkyDungeonAddRestraintIfWeaker("CyberAnkleCuffs", 5, true, "Cyber2", false, undefined, undefined, "Dollsmith", true);

		//KinkyDungeonAddRestraintIfWeaker("CyberDollJacket", 5, true, "Red", false, undefined, undefined, undefined, true);

		KinkyDungeonSetDress("CyberDoll", "CyberDoll");
	},

	RopeDojo: () => {
		KinkyDungeonAddRestraintIfWeaker("RopeSnakeArmsWrist", 8, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("TrapMittens", 5, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("Stuffing", 5, true, undefined, false, undefined, undefined, undefined, true);
		KinkyDungeonAddRestraintIfWeaker("HarnessPanelGag", 5, true, undefined, false, undefined, undefined, undefined, true);
		if (!KinkyDungeonStatsChoice.get("NoBlindfolds"))
			KinkyDungeonAddRestraintIfWeaker("TrapBlindfold", 5, true, undefined, false, undefined, undefined, undefined, true);
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["ropeRestraints", "ropeRestraints2", "ropeRestraintsHogtie", "ropeRestraintsWrist", "tapeRestraints", "genericToys"]}, 24, "grv", true, undefined);
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 8, true, undefined, false, undefined, undefined, undefined, true);
				let item = r;
				for (let j = 0; j < 2; j++) {
					if (item && item.Link) {
						let newRestraint = KinkyDungeonGetRestraintByName(item.Link);
						KinkyDungeonAddRestraintIfWeaker(newRestraint, 8, true, undefined, undefined, undefined, undefined, undefined, true);
						item = newRestraint;
					}
				}
			}
		}
	},

	ElementalSlave: () => {
		for (let i = 0; i < 30; i++) {
			let r = KinkyDungeonGetRestraint({tags: ["obsidianRestraints", "ornateChastity", "genericToys", "linkRegular"]}, 12, "grv", true, "Red");
			if (r) {
				KinkyDungeonAddRestraintIfWeaker(r, 0, true, r.Group == "ItemNeck" ? "Blue" : "Purple", false, undefined, undefined, undefined, true);
				let item = r;
				for (let j = 0; j < 2; j++) {
					if (item && item.Link) {
						let newRestraint = KinkyDungeonGetRestraintByName(item.Link);
						KinkyDungeonAddRestraintIfWeaker(newRestraint, 0, true, "Purple", undefined, undefined, undefined, undefined, true);
						item = newRestraint;
					}
				}
			}
		}
		let outfit = {name: "ElementalDress", id: KinkyDungeonGetItemID(), type: Outfit};
		if (!KinkyDungeonInventoryGet("ElementalDress")) KinkyDungeonInventoryAdd(outfit);
		//if (KinkyDungeonInventoryGet("Default")) KinkyDungeonInventoryRemove(KinkyDungeonInventoryGet("Default"));
		KinkyDungeonSetDress("ElementalDress", "ElementalDress");
	},
};

function KDFixPlayerClothes(faction: string) {
	for (let inv of KinkyDungeonAllRestraintDynamic()) {
		inv.item.faction = faction;
	}
}

function KDResetGuardSpawnTimer() {
	KDGameData.GuardSpawnTimer = 4 + Math.floor(KDRandom() * (KDGameData.GuardSpawnTimerMax - KDGameData.GuardSpawnTimerMin));
}

let KDChestRank = {
	"gold": 3,
	"lessergold": 3,
	"silver": 2,
	"storage": 0,
};
let KDChestPenalty = {
	"gold": 0,
	"lessergold": 3,
	"silver": 2,
	"storage": 0,
};

/**
 * @param data
 */
function KDChestSecurity(data: {enemy?: entity, x?: number, y?: number, faction?: string}): number {
	if (data.x) {
		let tile = KinkyDungeonTilesGet(data.x + "," + data.y);
		if (tile) {
			if (KDChestPenalty[tile.Loot] != undefined) return KDChestPenalty[tile.Loot];
			return 1;
		}
	}


	return 0.25;
}

function KDGetHiSecDialogue(enemy: entity): string {
	if (enemy) {
		let faction = KDGetFaction(enemy);
		if (KDFactionProperties[faction]?.customHiSecDialogue) {
			return KDFactionProperties[faction].customHiSecDialogue(enemy);
		}
	}
	return "JailerHiSec";
}
