"use strict";
// Escape chances
// Struggle : How difficult it is to struggle out of the item. Shouldn't be below 0.1 as that would be too tedious. Negative values help protect against spells.
// Cut : How difficult it is to cut with a knife. Metal items should have 0, rope and leather should be low but possible, and stuff like tape should be high
// Remove : How difficult it is to get it off by unbuckling. Most items should have a high chance if they have buckles, medium chance if they have knots, and low chance if they have a difficult mechanism.
// Pick : How hard it is to pick the lock on the item. Higher level items have more powerful locks. The general formula is 0.33 for easy items, 0.1 for medium items, 0.05 for hard items, and 0.01 for super punishing items
// Unlock : How hard it is to reach the lock. Should be higher than the pick chance, and based on accessibility. Items like the

// Note that there is a complex formula for how the chances are manipulated based on whether your arms are bound. Items that bind the arms are generally unaffected, and items that bind the hands are unaffected, but they do affect each other

// Power is a scale of how powerful the restraint is supposed to be. It should roughly match the difficulty of the item, but can be higher for special items. Power 10 or higher might be totally impossible to struggle out of.

// These are groups that the game is not allowed to remove because they were tied at the beginning
let KinkyDungeonRestraintsLocked = [];

let KDWillEscapePenalty = 0.25;
let KDWillEscapePenaltyArms = 0.1;
let KDWillEscapePenaltyStart = 0.0;
let KDWillEscapePenaltyStartArms = 0.0;
let KDWillEscapePenaltyEnd = 0.0;

let KDMinEscapeRate = 0.2;
let KDMinPickRate = 0.2;
let KDStruggleTime = 3;

/**
 *
 * @returns {number}
 */
function KDGetWillPenalty() {
	let perc = KinkyDungeonStatWill/KinkyDungeonStatWillMax;
	let scale = 0;
	let scalestart = KDWillEscapePenaltyStart;
	let max = KDWillEscapePenalty;
	if (!KinkyDungeonIsArmsBound(true)) {
		scalestart = KDWillEscapePenaltyStartArms;
		max = KDWillEscapePenaltyArms;
	}
	if (perc < scalestart) {
		if (scalestart - KDWillEscapePenaltyEnd > 0)
			scale = Math.min(1.0, (scalestart - perc) / (scalestart - KDWillEscapePenaltyEnd));
		else if (perc <= 0) scale = 1.0;
	}
	return scale * max;
}

let KinkyDungeonCurrentEscapingItem = null;
let KinkyDungeonCurrentEscapingMethod = null;
let KinkyDungeonStruggleTime = 0;

let KinkyDungeonMultiplayerInventoryFlag = false;
let KinkyDungeonItemDropChanceArmsBound = 0.2; // Chance to drop item with just bound arms and not bound hands.

//let KinkyDungeonKnifeBreakChance = 0.15;
let KinkyDungeonKeyJamChance = 0.33;
let KinkyDungeonKeyPickBreakAmount = 12; // Number of tries per pick on average 5-11
let KinkyDungeonKeyPickBreakAmountBase = 12; // Number of tries per pick on average 5-11
let KinkyDungeonPickBreakProgress = 0;
let KinkyDungeonKnifeBreakAmount = 10; // Number of tries per knife on average 6-12
let KinkyDungeonKnifeBreakAmountBase = 10; // Number of tries per knife on average 6-12
let KinkyDungeonKnifeBreakProgress = 0;
let KinkyDungeonEnchKnifeBreakAmount = 24; // Number of tries per knife on average
let KinkyDungeonEnchKnifeBreakAmountBase = 24; // Number of tries per knife on average
let KinkyDungeonEnchKnifeBreakProgress = 0;

let KinkyDungeonMaxImpossibleAttempts = 3; // base, more if the item is close to being impossible

let KinkyDungeonEnchantedKnifeBonus = 0.1; // Bonus whenever you have an enchanted knife

let KDLocksmithBonus = 0.15; // Locksmith background
let KDLocksmithSpeedBonus = 1.1;
let KDCluelessBonus = -0.2; // Clueless background
let KDCluelessSpeedBonus = 0.5;

let KDFlexibleBonus = 0.1;
let KDFlexibleSpeedBonus = 1.5;
let KDInflexibleBonus = -0.1;
let KDInflexibleSpeedBonus = 0.75;

let KDUnchainedBonus = 0.12;
let KDDamselBonus = -0.2;
let KDDamselPickAmount = 6;
let KDArtistBonus = 0.15;
let KDBunnyBonus = -0.2;
let KDBunnyKnifeAmount = 5;
let KDBunnyEnchKnifeAmount = 12;
let KDSlipperyBonus = 0.15;
let KDDollBonus = -0.2;
let KDEscapeeBonus = 0.12;
let KDDragonBonus = -0.2;

let KDStrongBonus = 0.15;
let KDWeakBonus = -0.15;

let KDBondageLoverAmount = 1;

/**
 * @type {Map<string, restraint>}
 */
let KinkyDungeonRestraintsCache = new Map();

/**
 * gets a restraint
 * @param {item} item
 * @returns {restraint}
 */
function KDRestraint(item) {
	return KinkyDungeonRestraintsCache.get(item.name);
}

/**
 * gets a restraint
 * @param {item} item
 * @returns {boolean}
 */
function KDItemIsMagic(item) {
	let res = KinkyDungeonRestraintsCache.get(item.name);
	if (!res.magic) return false;
	let disenchlevel = KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Disenchant");
	return !(disenchlevel > res.power);
}


// Format: strict group => [list of groups the strictness applies to]
const KinkyDungeonStrictnessTable = new Map([
	["ItemHood", ["ItemHead", "ItemEars","ItemMouth","ItemMouth2","ItemMouth3"]],
	["ItemHead", ["ItemEars"]],
	["ItemMouth", ["ItemHead", "ItemEars"]],
	["ItemMouth2", ["ItemHead", "ItemEars"]],
	["ItemMouth3", ["ItemHead", "ItemEars"]],
	["ItemNeck", ["ItemMouth", "ItemArms"]],
	["ItemArms", ["ItemHands"]],
	["ItemTorso", ["ItemArms", "ItemLegs", "ItemPelvis", "ItemBreast"]],
	["ItemLegs", ["ItemFeet", "ItemBoots"]],
	["ItemFeet", ["ItemBoots"]],
]);

/**
 * @type {Map<string, {r: restraint, w:number}[]>}
 */
let KDRestraintsCache = new Map();

/**
 *
 * @param {entity} Entity
 * @param {number} CamX
 * @param {number} CamY
 * @returns {void}
 */
function KinkyDungeonDrawTether(Entity, CamX, CamY) {
	for (let inv of KinkyDungeonAllRestraint()) {
		if (inv && KDRestraint(inv).tether && inv.tx && inv.ty) {
			let vx = inv.tx;
			let vy = inv.ty;
			if (inv.tetherToLeasher && KinkyDungeonLeashingEnemy()) {
				vx = KinkyDungeonLeashingEnemy().visual_x;
				vy = KinkyDungeonLeashingEnemy().visual_y;
			}
			if (inv.tetherToGuard && KinkyDungeonJailGuard()) {
				vx = KinkyDungeonJailGuard().visual_x;
				vy = KinkyDungeonJailGuard().visual_y;
			}

			//let dist = KDistEuclidean(inv.tx - Entity.visual_x, inv.ty - Entity.visual_y);
			let xx = canvasOffsetX + (Entity.visual_x - CamX)*KinkyDungeonGridSizeDisplay;
			let yy = canvasOffsetY + (Entity.visual_y - CamY)*KinkyDungeonGridSizeDisplay;
			let txx = canvasOffsetX + (vx - CamX)*KinkyDungeonGridSizeDisplay;
			let tyy = canvasOffsetY + (vy - CamY)*KinkyDungeonGridSizeDisplay;
			let dx = (txx - xx);
			let dy = (tyy - yy);
			let dd = 0.1; // Increments
			for (let d = 0; d < 1; d += dd) {
				let yOffset = 30 * Math.sin(Math.PI * d);
				let yOffset2 = 30 * Math.sin(Math.PI * (d + dd));

				MainCanvas.beginPath();
				MainCanvas.lineWidth = 4;
				MainCanvas.moveTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*d, KinkyDungeonGridSizeDisplay*0.8 + yOffset + yy + dy*d);
				MainCanvas.lineTo(KinkyDungeonGridSizeDisplay/2 + xx + dx*(d+dd), KinkyDungeonGridSizeDisplay*0.8 + yOffset2 + yy + dy*(d+dd));
				// @ts-ignore
				MainCanvas.strokeStyle = KDRestraint(inv).Color[0] ? KDRestraint(inv).Color[0] : KDRestraint(inv).Color;//(color == "Default") ? "#aaaaaa" : color;
				MainCanvas.stroke();
			}
			return;
		}
	}
}


function KDIsPlayerTethered() {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether && (inv.tx || inv.ty)) {
		return true;
	}
	let found = KinkyDungeonFindID(KDGameData.KinkyDungeonLeashingEnemy);
	if (!found) KDGameData.KinkyDungeonLeashingEnemy = 0;
	return KDGameData.KinkyDungeonLeashedPlayer > 0;
}
function KinkyDungeonAttachTetherToEntity(dist, entity) {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether) {
		inv.tetherEntity = entity.id;
		if (dist) inv.tetherLength = dist;
	}
}

function KDBreakTether() {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether) {
		inv.tetherToLeasher = false;
		inv.tetherToGuard = false;
		inv.tetherEntity = undefined;
		inv.tx = undefined;
		inv.ty = undefined;
	}
}

let KDLeashPullCost = 0.5;
let KDLeashPullKneelTime = 8;

/**
 *
 * @param {boolean} Msg
 * @param {entity} Entity
 * @param {number} [xTo]
 * @param {number} [yTo]
 * @returns {boolean}
 */
function KinkyDungeonUpdateTether(Msg, Entity, xTo, yTo) {
	if (Entity.player && KinkyDungeonFlags.get("pulled")) return false;
	else if (KDEnemyHasFlag(Entity, "pulled")) return false;
	let exceeded = false;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).tether && (inv.tx && inv.ty || inv.tetherToLeasher || inv.tetherToGuard || inv.tetherEntity)) {
			let tether = inv.tetherLength ? inv.tetherLength : KDRestraint(inv).tether;

			if (inv.tetherToLeasher && KinkyDungeonLeashingEnemy()) {
				inv.tx = KinkyDungeonLeashingEnemy().x;
				inv.ty = KinkyDungeonLeashingEnemy().y;
			} else if (inv.tetherToLeasher && !KinkyDungeonLeashingEnemy()) {
				inv.tetherToLeasher = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}
			if (inv.tetherToGuard && KinkyDungeonJailGuard()) {
				inv.tx = KinkyDungeonJailGuard().x;
				inv.ty = KinkyDungeonJailGuard().y;
			} else if (inv.tetherToGuard && !KinkyDungeonJailGuard()) {
				inv.tetherToGuard = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}
			if (inv.tetherEntity && KinkyDungeonFindID(inv.tetherEntity) && !KinkyDungeonIsDisabled(KinkyDungeonFindID(inv.tetherEntity))) {
				inv.tx = KinkyDungeonFindID(inv.tetherEntity).x;
				inv.ty = KinkyDungeonFindID(inv.tetherEntity).y;
			} else if (inv.tetherEntity) {
				inv.tetherEntity = undefined;
				inv.tx = undefined;
				inv.ty = undefined;
			}

			if (inv.tx && inv.ty) KDGameData.KinkyDungeonLeashedPlayer = Math.max(KDGameData.KinkyDungeonLeashedPlayer, 5);

			if (xTo || yTo) {// This means we arre trying to move
				if (KDistChebyshev(xTo-inv.tx, yTo-inv.ty) > KDRestraint(inv).tether) {
					if (Msg) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTetherTooShort").replace("TETHER", TextGet("Restraint" + inv.name)), "#ff0000", 2, true);
					return false;
				}
			} else {// Then we merely update
				for (let i = 0; i < 10; i++) {
					let playerDist = KDistChebyshev(Entity.x-inv.tx, Entity.y-inv.ty);
					if (playerDist > tether) {
						let slot = null;
						let path = KinkyDungeonFindPath(Entity.x, Entity.y, inv.tx, inv.ty, false, !Entity.player, false, KinkyDungeonMovableTilesEnemy);
						if (path && path.length > 0 && KDistEuclidean(path[0].x - inv.tx, path[0].y - inv.ty) > -0.01 + KDistEuclidean(Entity.x - inv.tx, Entity.y - inv.ty) && KDistChebyshev(path[0].x - Entity.x, path[0].y - Entity.y) < 1.5) slot = path[0];
						if (!slot) {
							let mindist = playerDist;
							for (let X = Entity.x-1; X <= Entity.x+1; X++) {
								for (let Y = Entity.y-1; Y <= Entity.y+1; Y++) {
									if ((X !=  Entity.x || Y != Entity.y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-inv.tx, Y-inv.ty) < mindist) {
										mindist = KDistEuclidean(X-inv.tx, Y-inv.ty);
										slot = {x:X, y:Y};
									}
								}
							}
						}
						if (!slot) { //Fallback
							slot = {x:inv.tx, y:inv.ty};
						}
						if (slot) {
							let enemy = KinkyDungeonEnemyAt(slot.x, slot.y);
							if (enemy) {
								let slot2 = null;
								let mindist2 = playerDist;
								for (let X = enemy.x-1; X <= enemy.x+1; X++) {
									for (let Y = enemy.y-1; Y <= enemy.y+1; Y++) {
										if ((X !=  enemy.x || Y != enemy.y) && KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(X, Y)) && KDistEuclidean(X-Entity.x, Y-Entity.y) < mindist2) {
											mindist2 = KDistEuclidean(X-Entity.x, Y-Entity.y);
											slot2 = {x:X, y:Y};
										}
									}
								}
								if (slot2) {
									KDMoveEntity(enemy, slot2.x, slot2.y, false);
								} else {
									let pointSwap = KinkyDungeonGetNearbyPoint(slot.x, slot.y, true, undefined, true, true);
									if (pointSwap)
										KDMoveEntity(enemy, pointSwap.x, pointSwap.y, false);
									else
										KDMoveEntity(enemy, Entity.x, Entity.y, false);
								}
							}

							KDMoveEntity(Entity, slot.x, slot.y, false);
							if (Entity.player) KinkyDungeonSetFlag("pulled", 1);
							else KinkyDungeonSetEnemyFlag(Entity, "pulled");
							if (Entity.player) {
								if (KinkyDungeonCanStand()) {
									KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, KDLeashPullKneelTime + KinkyDungeonSlowMoveTurns);
									KinkyDungeonChangeStamina(-KDLeashPullCost, false, true);
								}
								KinkyDungeonInterruptSleep();
								KinkyDungeonSendEvent("leashTug", {Entity: Entity, slot: slot, item: inv});
								if (KinkyDungeonLeashingEnemy()) {
									KinkyDungeonSetEnemyFlag(KinkyDungeonLeashingEnemy(), "harshpull", 5);
								}
								if (Msg) KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonTetherPull").replace("TETHER", TextGet("Restraint" + inv.name)), "#ff0000", 2, true);

							}

						}
					}
				}
			}
		}
	}

	return exceeded;
}


/**
 * Gets the length of the neck tether
 * @returns {number}
 */
function KinkyDungeonTetherLength() {
	let inv = KinkyDungeonGetRestraintItem("ItemNeckRestraints");
	if (inv && KDRestraint(inv).tether && inv.tx && inv.ty) {
		return KDRestraint(inv).tether;
	}
	return undefined;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonKeyGetPickBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonPickBreakProgress += mult;

	if (KinkyDungeonPickBreakProgress > KinkyDungeonKeyPickBreakAmount/1.5) chance = (KinkyDungeonPickBreakProgress - KinkyDungeonKeyPickBreakAmount/1.5) / (KinkyDungeonKeyPickBreakAmount + 1);

	return chance;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonGetKnifeBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonKnifeBreakProgress += mult;

	if (KinkyDungeonKnifeBreakProgress > KinkyDungeonKnifeBreakAmount/1.5) chance = (KinkyDungeonKnifeBreakProgress - KinkyDungeonKnifeBreakAmount/1.5) / (KinkyDungeonKnifeBreakAmount + 1);

	return chance;
}

/**
 *
 * @param {number} [modifier]
 * @returns {number}
 */
function KinkyDungeonGetEnchKnifeBreakChance(modifier) {
	let mult = (modifier) ? modifier : 1.0;
	let chance = 0;

	KinkyDungeonEnchKnifeBreakProgress += mult;

	if (KinkyDungeonEnchKnifeBreakProgress > KinkyDungeonEnchKnifeBreakAmount/1.5) chance = (KinkyDungeonEnchKnifeBreakProgress - KinkyDungeonEnchKnifeBreakAmount/1.5) / (KinkyDungeonEnchKnifeBreakAmount + 1);

	return chance;
}

function KinkyDungeonIsLockable(restraint) {
	if (restraint && restraint.escapeChance && (restraint.escapeChance.Pick != undefined || restraint.escapeChance.Unlock != undefined)) return true;
	return false;
}

/**
 *
 * @param {item} item
 * @param {string} lock
 */
function KinkyDungeonLock(item, lock) {
	if (lock != "") {
		if (KinkyDungeonIsLockable(KDRestraint(item))) {
			item.lock = lock;
			if (lock == "Gold") item.lockTimer = Math.min(KinkyDungeonMaxLevel - 1, MiniGameKinkyDungeonLevel + 2);
			InventoryLock(KinkyDungeonPlayer, InventoryGet(KinkyDungeonPlayer, KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group), "IntricatePadlock", Player.MemberNumber, true);
			item.pickProgress = 0;
			if (InventoryGet(KinkyDungeonPlayer,  KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group) && !KinkyDungeonRestraintsLocked.includes(KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group))
				InventoryLock(Player, InventoryGet(Player,  KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group), "IntricatePadlock", null, true);
		}
	} else {
		item.lock = lock;
		InventoryUnlock(KinkyDungeonPlayer,  KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group);
		if (!KinkyDungeonRestraintsLocked.includes( KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group))
			InventoryUnlock(Player, KDRestraint(item).AssetGroup ? KDRestraint(item).AssetGroup : KDRestraint(item).Group);
	}

}

/**
 *
 * @param {string} shrine
 * @returns {item[]}
 */
function KinkyDungeonGetRestraintsWithShrine(shrine, ignoreGold, recursive) {
	/**
	 * @type {item[]}
	 */
	let ret = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && (ignoreGold || item.lock != "Gold")) {
			ret.push(item);
		}
		if (recursive) {
			let link = item.dynamicLink;
			while (link) {
				if (KDRestraint(link).shrine && KDRestraint(link).shrine.includes(shrine) && (ignoreGold || link.lock != "Gold")) {
					ret.push(link);
				}
				link = link.dynamicLink;
			}
		}
	}

	return ret;
}

/**
 *
 * @param {string} shrine
 * @returns {number}
 */
function KinkyDungeonRemoveRestraintsWithShrine(shrine, maxCount, recursive) {
	let count = 0;

	for (let i = 0; i < (maxCount ? maxCount : 100); i++) {
		/**
		 * @type {item[]}
		 */
		let items = KinkyDungeonAllRestraint().filter((r) => {return KDRestraint(r).shrine && KDRestraint(r).shrine.includes(shrine) && r.lock != "Gold";});
		// Get the most powerful item
		let item = items.length > 0 ? items.reduce((prev, current) => (KDRestraint(prev).power * KinkyDungeonGetLockMult(prev.lock) > KDRestraint(current).power * KinkyDungeonGetLockMult(current.lock)) ? prev : current) : null;
		if (item) {
			KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false, true);
			KDSendStatus('escape', item.name, "shrine_" + shrine);
			count++;
		}

		if (recursive) {
			// Get all items, including dynamically linked ones
			items = KinkyDungeonGetRestraintsWithShrine(shrine, true, true);

			// Get the most powerful item
			item = items.length > 0 ? items.reduce((prev, current) => (KDRestraint(prev).power * KinkyDungeonGetLockMult(prev.lock) > KDRestraint(current).power * KinkyDungeonGetLockMult(current.lock)) ? prev : current) : null;
			if (item) {
				let groupItem = KinkyDungeonGetRestraintItem(KDRestraint(item).Group);
				if (groupItem == item) {
					KinkyDungeonRemoveRestraint(KDRestraint(item).Group, false, false, false, true);
					KDSendStatus('escape', item.name, "shrine_" + shrine);
					count++;
				} else {
					let host = groupItem;
					let link = host.dynamicLink;
					while (link) {
						if (link == item) {
							KinkyDungeonRemoveDynamicRestraint(host, false, false);
							KDSendStatus('escape', item.name, "shrine_" + shrine);
							count++;
							link = null;
						} else {
							host = link;
							link = link.dynamicLink;
						}
					}
				}
			}
		}
	}


	return count;
}

/**
 *
 * @param {string} shrine
 * @returns {number}
 */
function KinkyDungeonUnlockRestraintsWithShrine(shrine) {
	let count = 0;

	for (let item of KinkyDungeonAllRestraint()) {
		if (item.lock && KDRestraint(item).shrine && KDRestraint(item).shrine.includes(shrine) && KDLocks[item.lock] && !KDLocks[item.lock].shrineImmune) {

			KinkyDungeonLock(item, "");
			count++;
		}
	}

	return count;
}

/**
 *
 * @returns {item[]}
 */
function KinkyDungeonPlayerGetLockableRestraints() {
	/**
	 * @type {item[]}
	 */
	let ret = [];

	for (let item of KinkyDungeonAllRestraint()) {
		if (!item.lock && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Pick != undefined) {
			ret.push(item);
		}
	}

	return ret;
}

/**
 * @param {string[]} Locks
 * @returns {item[]}
 */
function KinkyDungeonPlayerGetRestraintsWithLocks(Locks, recursive) {
	/**
	 * @type {item[]}
	 */
	let ret = [];

	for (let itemhost of (recursive ? KinkyDungeonAllRestraintDynamic() : KinkyDungeonAllRestraint())) {
		// @ts-ignore
		let item = itemhost.item ? itemhost.item : itemhost;
		if (item && item.lock && Locks.includes(item.lock)) {
			ret.push(item);
		}
	}

	return ret;
}

/**
 *
 * @param {string} lock
 */
function KinkyDungeonRemoveKeysUnlock(lock) {
	if (KDLocks[lock]) KDLocks[lock].removeKeys({unlock: true});
}

/**
 *
 * @param {string} lock
 * @returns {string}
 */
function KinkyDungeonGetKey(lock) {
	if (KDLocks[lock]) return KDLocks[lock].key;
	return "";
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasGhostHelp() {
	return ((KinkyDungeonTargetTile && ((KinkyDungeonTargetTile.Type == "Ghost" && KinkyDungeonTargetTile.GhostDecision <= 0) || KinkyDungeonTargetTile.Type == "Angel")));
}


/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasAllyHelp() {
	return (KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some(
		(enemy) => {
			return (KDEnemyHasFlag(enemy, "HelpMe") || enemy.Enemy.tags.alwayshelp)
				&& enemy.Enemy.bound
				&& !enemy.Enemy.tags.nohelp
				&& !KDHelpless(enemy)
				&& KDBoundEffects(enemy) < 4;
		})
		|| KDNearbyEnemies(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, 1.5).some((enemy) => {
			return enemy.Enemy.bound
				&& !enemy.Enemy.tags.nohelp
				&& KDAllied(enemy)
				&& !KDHelpless(enemy)
				&& KDBoundEffects(enemy) < 4;
		})
	);
}

KinkyDungeonSetFlag("HelpMeFlag", 20);
/**
 *
 * @returns {boolean}
 */
function KinkyDungeonHasAngelHelp() {
	return (KinkyDungeonTargetTile && KinkyDungeonTargetTile.Type == "Angel");
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonIsWearingLeash() {
	for (let restraint of KinkyDungeonAllRestraint()) {
		if (KDRestraint(restraint) && KDRestraint(restraint).leash) {
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {boolean} Message - Show a message?
 * @param {string} affinity
 * @returns {boolean}
 */
function KinkyDungeonGetAffinity(Message, affinity, group) {
	let effectTiles = KDGetEffectTiles(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
	let groupIsHigh = !group || (
		group.startsWith("ItemM")
		|| group == "ItemArms"
		|| (group == "ItemHands" || !KinkyDungeonIsArmsBound())
		|| group == "ItemEars"
		|| group == "ItemHood"
		|| group == "ItemHead"
		|| group == "ItemNeck"
		|| group == "ItemNeckAccessories"
		|| group == "ItemNeckRestraints"
	);
	let canStand = KinkyDungeonCanStand();
	if (effectTiles)
		for (let t of Object.values(effectTiles)) {
			if (t.affinities && t.affinities.includes(affinity)) return true;
			else if (canStand && groupIsHigh && t.affinitiesStanding && t.affinitiesStanding.includes(affinity)) return true;
		}
	if (affinity == "Hook") {
		let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (tile == '?') {
			if (canStand && groupIsHigh) return true;
			else KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonHookHighFail"), "#ff0000", 2);
		} else if (KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y - 1) == ',') return true;
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Edge") {
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile = KinkyDungeonMapGet(X, Y);
				if (tile == 'A'
					|| tile == 'a'
					|| tile == 'c'
					|| tile == 'O'
					|| tile == '-'
					|| tile == '='
					|| tile == '+'
					|| tile == 'o'
					|| tile == 'B') {
					return true;
				} else if (tile == 'C' && Message) {
					KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedOpenChest"), "#ff0000", 2);
				}
			}
		}
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Sticky") {
		return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
	} else if (affinity == "Sharp") {
		if (((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;})) || KinkyDungeonWeaponCanCut(true)) return true;
		if (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) && (!KinkyDungeonIsArmsBound() || KinkyDungeonStatsChoice.has("Psychic") || KinkyDungeonWallCrackAndKnife(false))) return true;
		let tile = KinkyDungeonMapGet(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
		if (tile == '/') {
			if (Message)
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapUse"), "lightgreen", 2);
			return true;
		}
		for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
			for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
				let tile2 = KinkyDungeonMapGet(X, Y);
				if (tile2 == '-'
					|| tile == 'a') {
					if (Message)
						KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonScrapObjectUse"), "lightgreen", 2);
					return true;
				}
			}
		}
		return false;
	}
	return KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp();
}

function KinkyDungeonWallCrackAndKnife(Message) {
	for (let X = KinkyDungeonPlayerEntity.x - 1; X <= KinkyDungeonPlayerEntity.x + 1; X++) {
		for (let Y = KinkyDungeonPlayerEntity.y - 1; Y <= KinkyDungeonPlayerEntity.y + 1; Y++) {
			if (X == KinkyDungeonPlayerEntity.x || Y == KinkyDungeonPlayerEntity.y) {
				let tile = KinkyDungeonMapGet(X, Y);
				if (tile == '4' || tile == '\\') {
					if (!KinkyDungeonIsArmsBound(true) || KinkyDungeonCanStand()) {
						if (Message) {
							if (!KinkyDungeonIsArmsBound(true))
								KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrack"), "lightgreen", 2);
							else KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonUseCrackLegs"), "lightgreen", 2);
						}
						return true;
					} else {
						if (Message) {
							KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedCrack"), "#ff0000", 2);
						}
						return false;
					}
				}
			}
		}
	}
	return false;
}

/**
 * Determines if the entire dynamic item tree has at least one inaccessable item
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeAccessible(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).inaccessible) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity item
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeChastity(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastity) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Determines if the entire dynamic item tree has at least one chastity bra item
 * @param {item} item
 * @returns {boolean}
 */
function KDIsTreeChastityBra(item) {
	let link = item;
	while (link && KDRestraint(link)) {
		if (KDRestraint(link).chastitybra) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 *
 * @param {string} Group - Group
 * @param {boolean} [External] - By enemies or by player?
 * @returns {boolean}
 */
// @ts-ignore
function KDGroupBlocked(Group, External) {
	if (KinkyDungeonPlayerTags.get("ChastityLower") && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) return true;
	if (KinkyDungeonPlayerTags.get("ChastityUpper") && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) return true;
	if (KinkyDungeonPlayerTags.get("Block_" + Group)) return true;

	let belt = KinkyDungeonGetRestraintItem("ItemPelvis");

	if (belt && KDRestraint(belt) && KDRestraint(belt).chastity && ["ItemVulva", "ItemVulvaPiercings", "ItemButt"].includes(Group)) return true;

	let bra = KinkyDungeonGetRestraintItem("ItemBreast");

	if (bra && KDRestraint(bra) && KDRestraint(bra).chastitybra && ["ItemNipples", "ItemNipplesPiercings"].includes(Group)) return true;

	let hood = KinkyDungeonGetRestraintItem("ItemHood");

	if (hood && KDRestraint(hood) && KDRestraint(hood).gag && Group.includes("ItemM")) return true;

	//let mask = KinkyDungeonGetRestraintItem("ItemHead");

	//if (mask && KDRestraint(mask) && KDRestraint(mask).gag && Group.includes("ItemM")) return true;

	let arms = KinkyDungeonGetRestraintItem("ItemArms");

	if (arms && !KDIsTreeAccessible(arms) && Group.includes("ItemHands")) return true;

	return false;
	//let device = null;

	//if (device && KDRestraint(device) && KDRestraint(device).enclose) return true;

}

function KinkyDungeonCanUseKey() {
	return !KinkyDungeonIsHandsBound(true) || KinkyDungeonStatsChoice.has("Psychic");
}

/**
 *
 * @param {boolean} [ApplyGhost] - Can you receive help in this context?
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
function KinkyDungeonIsHandsBound(ApplyGhost, Other) {
	let blocked = InventoryItemHasEffect(InventoryGet(KinkyDungeonPlayer, "ItemHands"), "Block", true) || KDGroupBlocked("ItemHands");
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).bindhands) {
			blocked = true;
			break;
		}
	}
	let help = ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp());
	if (!Other && (!ApplyGhost || !(help)) && KinkyDungeonStatsChoice.get("Butterfingers") && KinkyDungeonIsArmsBound(ApplyGhost, Other)) return true;
	return (!ApplyGhost || !(help)) &&
		blocked;
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonCanUseFeet() {
	return KinkyDungeonStatsChoice.get("Flexible") && KinkyDungeonSlowLevel < 1;
}

/**
 *
 * @param {boolean} [ApplyGhost]
 * @param {boolean} [Other] - Is this on yourself or another?
 * @returns {boolean}
 */
function KinkyDungeonIsArmsBound(ApplyGhost, Other) {
	let blocked = InventoryItemHasEffect(InventoryGet(KinkyDungeonPlayer, "ItemArms"), "Block", true) || KDGroupBlocked("ItemArms");
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).bindarms) {
			blocked = true;
			break;
		}
	}
	return (!ApplyGhost || !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) &&
		blocked;
}

/**
 *
 * @param {boolean} ApplyGhost
 * @param {string} Group
 * @returns {number}
 */
function KinkyDungeonStrictness(ApplyGhost, Group) {
	if (ApplyGhost && (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) return 0;
	let strictness = 0;
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).Group != Group && ((KDRestraint(inv).strictness && KDRestraint(inv).strictness > strictness) || inv.dynamicLink))  {
			let strictGroups = KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
			if (strictGroups) {
				for (let s of strictGroups) {
					if (s == Group) {
						if (KDRestraint(inv).strictness > strictness)
							strictness = KDRestraint(inv).strictness;
						if (inv.dynamicLink) {
							for (let invLink of KDDynamicLinkList(inv)) {
								if (KDRestraint(invLink).strictness > strictness)
									strictness = KDRestraint(invLink).strictness;
							}
						}
						break;
					}
				}
			}
		}
	}
	return strictness;
}

/**
 * Gets the list of restraint nammes affecting the Group
 * @param {string} Group
 * @returns {string[]}
 */
function KinkyDungeonGetStrictnessItems(Group) {
	let list = [];
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).Group != Group && (KDRestraint(inv).strictness || inv.dynamicLink))  {
			let strictGroups = KinkyDungeonStrictnessTable.get(KDRestraint(inv).Group);
			if (strictGroups) {
				for (let s of strictGroups) {
					if (s == Group) {
						// Add the top item
						if (KDRestraint(inv).strictness)
							list.push(KDRestraint(inv).name);
						// Add the items underneath it!!
						if (inv.dynamicLink) {
							for (let invLink of KDDynamicLinkList(inv)) {
								if (KDRestraint(invLink).strictness)
									list.push(KDRestraint(invLink).name);
							}
						}
						break;
					}
				}
			}
		}
	}
	return list;
}


/**
 *
 * @returns {number}
 */
function KinkyDungeonGetPickBaseChance() {
	let bonus = 0;
	if (KinkyDungeonStatsChoice.get("Locksmith")) bonus += KDLocksmithBonus;
	if (KinkyDungeonStatsChoice.get("Clueless")) bonus += KDCluelessBonus;
	if (KinkyDungeonStatsChoice.get("LocksmithMaster")) bonus += 0.15;
	return 0.33 / (1.0 + 0.02 * MiniGameKinkyDungeonLevel) + bonus;
}

/**
 *
 * @returns {boolean}
 */
function KinkyDungeonPickAttempt() {
	let Pass = "Fail";
	let escapeChance = KinkyDungeonGetPickBaseChance();
	let cost = KinkyDungeonStatStaminaCostPick;
	let wcost = KinkyDungeonStatWillCostPick;
	let lock = KinkyDungeonTargetTile.Lock;
	if (!KinkyDungeonTargetTile.pickProgress) KinkyDungeonTargetTile.pickProgress = 0;

	if (!lock) return;

	KinkyDungeonInterruptSleep();

	if (KDLocks[lock] && !KDLocks[lock].pickable) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + lock + "Lock"), "orange", 2, true);
		Pass = "Fail";
	}

	let handsBound = KinkyDungeonIsHandsBound(false, true) && !KinkyDungeonCanUseFeet();
	let armsBound = KinkyDungeonIsArmsBound();
	let strict = KinkyDungeonStrictness(false, "ItemHands");
	if (!strict) strict = 0;
	if (!KinkyDungeonPlayer.CanInteract()) escapeChance /= 2;
	if (armsBound) escapeChance = Math.max(0.0, escapeChance - 0.25);
	if (handsBound && strict < 0.5) escapeChance = Math.max(0, escapeChance - 0.5);
	else if (strict) escapeChance = Math.max(0, escapeChance - strict);

	escapeChance /= 1.0 + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax*KinkyDungeonDistractionUnlockSuccessMod;

	let chargecosts = true;
	if (wcost > 0 && !KinkyDungeonHasWill(-wcost, false)) {
		chargecosts = false;
		KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), "#ff0000", 2, true);
	} else if (!KinkyDungeonHasStamina(-cost, true)) {
		chargecosts = false;
		KinkyDungeonWaitMessage(true);
	} else if (KinkyDungeonTargetTile && KinkyDungeonTargetTile.pickProgress >= 1){//KDRandom() < escapeChance
		Pass = "Success";
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Unlock.ogg");
	} else if (KDLocks[lock] && KDLocks[lock].breakChance({})) { // Blue locks cannot be picked or cut!
		Pass = "Break";
		KinkyDungeonLockpicks -= 1;
		KinkyDungeonPickBreakProgress = 0;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/PickBreak.ogg");
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
		KinkyDungeonLockpicks -= 1;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Miss.ogg");
	} else {
		KinkyDungeonTargetTile.pickProgress += escapeChance;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Pick.ogg");
	}
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonAttemptPick" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff0000", 1);
	if (chargecosts) {
		KinkyDungeonChangeStamina(cost, 1);
		KinkyDungeonChangeWill(wcost);
	}
	return Pass == "Success";
}

/**
 *
 * @param {string} lock
 * @returns {boolean}
 */
function KinkyDungeonUnlockAttempt(lock) {
	let Pass = "Fail";
	let escapeChance = 1.0;

	KinkyDungeonInterruptSleep();

	let handsBound = KinkyDungeonIsHandsBound(false, true) && !KinkyDungeonCanUseFeet();
	let armsBound = KinkyDungeonIsArmsBound();
	let strict = KinkyDungeonStrictness(false, "ItemHands");
	if (!strict) strict = 0;
	if (!KinkyDungeonPlayer.CanInteract()) escapeChance /= 2;
	if (armsBound) escapeChance = Math.max(0.1, escapeChance - 0.25);
	if (handsBound && strict < 0.5) escapeChance = Math.max(0, escapeChance - 0.5);
	else if (strict) escapeChance = Math.max(0, escapeChance - strict);

	if (KinkyDungeonStatsChoice.get("Psychic")) escapeChance = Math.max(escapeChance, 0.33);
	if (KDRandom() < escapeChance)
		Pass = "Success";
	KinkyDungeonSendActionMessage(2, TextGet("KinkyDungeonStruggleUnlock" + Pass).replace("TargetRestraint", TextGet("KinkyDungeonObject")), (Pass == "Success") ? "lightgreen" : "#ff0000", 1);
	if (Pass == "Success") {
		KinkyDungeonRemoveKeysUnlock(lock);
		if (KDLocks[lock] && KDLocks[lock].loot_special && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonSpecialLoot = true;
		else if (KDLocks[lock] && KDLocks[lock].loot_locked && KinkyDungeonTargetTile && KinkyDungeonTargetTile.Loot == "normal") KinkyDungeonLockedLoot = true;
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Unlock.ogg");
		return true;
	} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
		let keytype = KinkyDungeonGetKey(lock);
		if (keytype) {
			KinkyDungeonDropItem({name: keytype+"Key"}, KinkyDungeonPlayerEntity, true);
			KDLocks[lock].removeKeys({dropped: true});
		}
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Miss.ogg");
	} else {
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Pick.ogg");
	}
	return false;
}

/** Gets the affinity of a restraint */
function KDGetRestraintAffinity(item, data) {
	data.item = item;
	data.affinity = "";
	data.overrideAffinity = false;
	if (KDRestraint(item) && KDRestraint(item).affinity) {
		if (KDRestraint(item).affinity[data.StruggleType]) {
			for (let a of KDRestraint(item).affinity[data.StruggleType]) {
				data.affinity = a;
				if (KinkyDungeonGetAffinity(false, a, data.StruggleGroup)) break;
			}
		}
	}
	KinkyDungeonSendEvent("beforeAffinityCalc", data);
	if (!data.overrideAffinity && data.affinity == "") {
		switch (data.StruggleType) {
			case "Struggle": data.affinity = "Hook"; break;
			case "Remove": data.affinity = "Edge"; break;
			case "Cut": data.affinity = "Sharp"; break;
			case "Pick": data.affinity = ""; break;
			case "Unlock": data.affinity = "Sticky"; break;
		}
	}
	return data.affinity;
}

function KDGetEscapeChance(restraint, StruggleType, escapeChancePre, limitChancePre, ApplyGhost, ApplyPlayerBonus, Msg) {
	let escapeChance = escapeChancePre != undefined ? escapeChancePre : KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
	let limitChance = limitChancePre != undefined ? limitChancePre : (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.05);

	if ((!ApplyGhost || !(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())) && !ApplyPlayerBonus) {
		if (StruggleType == "Pick") {
			if (KinkyDungeonStatsChoice.get("Locksmith")) escapeChance += KDLocksmithBonus;
			if (KinkyDungeonStatsChoice.get("Clueless")) escapeChance += KDCluelessBonus;
		} else if (StruggleType == "Remove" || StruggleType == "Unlock") {
			if (KinkyDungeonStatsChoice.get("Flexible")) escapeChance += KDFlexibleBonus;
			if (KinkyDungeonStatsChoice.get("Inflexible")) escapeChance += KDInflexibleBonus;
		} else if (StruggleType == "Struggle") {
			if (KinkyDungeonStatsChoice.get("Strong")) escapeChance += KDStrongBonus;
			if (KinkyDungeonStatsChoice.get("Weak")) escapeChance += KDWeakBonus;
		}
	}

	if (KinkyDungeonStatsChoice.get("Unchained") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal"))
		escapeChance += KDUnchainedBonus;
	if (KinkyDungeonStatsChoice.get("Damsel") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Metal")) {
		escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDamselBonus)
			limitChance = KDDamselBonus;
	}
	if (KinkyDungeonStatsChoice.get("HighSecurity")) {
		KinkyDungeonKeyPickBreakAmount = KDDamselPickAmount;
	} else {
		KinkyDungeonKeyPickBreakAmount = KinkyDungeonKeyPickBreakAmountBase;
	}

	if (KinkyDungeonStatsChoice.get("FreeSpirit") && (KDRestraint(restraint).chastity || KDRestraint(restraint).chastitybra)) escapeChance += 0.5;
	if (KinkyDungeonStatsChoice.get("Artist") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope"))
		escapeChance += KDArtistBonus;
	if (KinkyDungeonStatsChoice.get("Bunny") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Rope")) {
		escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDBunnyBonus)
			limitChance = KDBunnyBonus;
	}
	if (KinkyDungeonStatsChoice.get("ShoddyKnives")) {
		KinkyDungeonKnifeBreakAmount = KDBunnyKnifeAmount;
		KinkyDungeonEnchKnifeBreakAmount = KDBunnyEnchKnifeAmount;
	} else {
		KinkyDungeonKnifeBreakAmount = KinkyDungeonKnifeBreakAmountBase;
		KinkyDungeonEnchKnifeBreakAmount = KinkyDungeonEnchKnifeBreakAmountBase;
	}

	if (KinkyDungeonStatsChoice.get("Slippery") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex"))
		escapeChance += KDSlipperyBonus;
	else if (KinkyDungeonStatsChoice.get("Doll") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Latex")) {
		escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDollBonus)
			limitChance = KDDollBonus;
	}

	if (KinkyDungeonStatsChoice.get("Escapee") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather"))
		escapeChance += KDEscapeeBonus;
	else if (KinkyDungeonStatsChoice.get("Dragon") && KDRestraint(restraint).shrine && KDRestraint(restraint).shrine.includes("Leather")) {
		escapeChance /= 1.5;
		if (StruggleType != "Pick"  && StruggleType != "Unlock" && limitChance > 0 && limitChance < KDDragonBonus)
			limitChance = KDDragonBonus;
	}

	let data = {
		restraint: restraint,
		escapeChance: escapeChance,
		limitChance: limitChance,
		struggleType: StruggleType,
		escapeChancePre: escapeChancePre,
		limitChancePre: limitChancePre,
		ApplyGhost: ApplyGhost,
		ApplyPlayerBonus: ApplyPlayerBonus,
		Msg: Msg,
	};
	KinkyDungeonSendEvent("perksStruggleCalc", data);

	return {
		escapeChance: data.escapeChance,
		limitChance: data.limitChance,
	};

}

let KDUnboundAffinityOverride = {
	"Sticky": true,
	"Edge": true,
	"Hook": true,
};

function KDGetDynamicItem(group, index) {
	let restraint = KinkyDungeonGetRestraintItem(group);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		if (surfaceItems[index]) {
			host = surfaceItems[index - 1];
			restraint = surfaceItems[index];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}
	return {restraint: restraint, host: host};
}

// Lockpick = use tool or cut
// Otherwise, just a normal struggle
/**
 *
 * @param {string} struggleGroup
 * @param {string} StruggleType
 * @returns {string}
 */
function KinkyDungeonStruggle(struggleGroup, StruggleType, index) {
	let restraint = KinkyDungeonGetRestraintItem(struggleGroup);
	let host = restraint;
	if (index) {
		let surfaceItems = KDDynamicLinkListSurface(restraint);
		if (surfaceItems[index]) {
			host = surfaceItems[index - 1];
			restraint = surfaceItems[index];
		}
		else console.log("Error! Please report the item combination and screenshot to Ada!");
	}
	let failSuffix = "";
	if (restraint && KDRestraint(restraint).failSuffix && KDRestraint(restraint).failSuffix[StruggleType]) {
		failSuffix = KDRestraint(restraint).failSuffix[StruggleType];
	}
	if (!restraint) return "Fail";
	KinkyDungeonCurrentEscapingItem = restraint;
	KinkyDungeonCurrentEscapingMethod = StruggleType;
	KinkyDungeonStruggleTime = CommonTime() + 750;
	let Pass = "Fail";
	let restraintEscapeChancePre = KDRestraint(restraint).escapeChance[StruggleType] != undefined ? KDRestraint(restraint).escapeChance[StruggleType] : 1.0;
	let helpChance = (KDRestraint(restraint).helpChance != undefined && KDRestraint(restraint).helpChance[StruggleType] != undefined) ? KDRestraint(restraint).helpChance[StruggleType] : 0.0;
	let limitChance = (KDRestraint(restraint).limitChance != undefined && KDRestraint(restraint).limitChance[StruggleType] != undefined) ? KDRestraint(restraint).limitChance[StruggleType] :
		((StruggleType == "Unlock" || StruggleType == "Pick") ? 0 : 0.05);
	if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) {
		KinkyDungeonSetFlag("HelpMeFlag", 8);
		if (helpChance)
			restraintEscapeChancePre = helpChance;
		limitChance = 0;
	}
	if (KinkyDungeonHasAngelHelp()) {
		restraintEscapeChancePre += 0.1;
	}

	let affinity = KDGetRestraintAffinity(restraint, {StruggleType: StruggleType});

	/**
	 * @type {{
	 * restraint: item,
	 * struggleType: string,
	 * struggleGroup: string,
	 * escapeChance: number,
	 * origEscapeChance: number,
	 * helpChance: number,
	 * limitChance: number,
	 * strict: number,
	 * cutSpeed: number,
	 * affinity: string,
	 * hasAffinity: boolean,
	 * restraintEscapeChance: number,
	 * cost: number,
	 * wcost: number,
	 * escapePenalty: number,
	 * willEscapePenalty: number,
	 * canCutMagic: boolean,
	 * }}
	 */
	let data = {
		restraint: restraint,
		struggleType: StruggleType,
		struggleGroup: struggleGroup,
		escapeChance: restraintEscapeChancePre,
		origEscapeChance: restraintEscapeChancePre,
		limitChance: limitChance,
		helpChance: helpChance,
		cutSpeed: 0.25,
		affinity: affinity,
		strict: KinkyDungeonStrictness(true, struggleGroup),
		hasAffinity: KinkyDungeonGetAffinity(true, affinity, struggleGroup),
		restraintEscapeChance: KDRestraint(restraint).escapeChance[StruggleType],
		cost: KinkyDungeonStatStaminaCostStruggle,
		wcost: KinkyDungeonStatWillCostStruggle,
		escapePenalty: 0,
		willEscapePenalty: KDGetWillPenalty(),
		canCutMagic: KinkyDungeonWeaponCanCut(true, true),
	};

	if (StruggleType == "Cut") data.cost = KinkyDungeonStatStaminaCostTool;
	else if (StruggleType == "Pick") data.cost = KinkyDungeonStatStaminaCostPick;
	else if (StruggleType == "Remove") data.cost = KinkyDungeonStatStaminaCostRemove;
	else if (StruggleType == "Unlock") data.cost = KinkyDungeonStatStaminaCostPick;
	if (StruggleType == "Cut") data.wcost = KinkyDungeonStatWillCostTool;
	else if (StruggleType == "Pick") data.wcost = KinkyDungeonStatWillCostPick;
	else if (StruggleType == "Remove") data.wcost = KinkyDungeonStatWillCostRemove;
	else if (StruggleType == "Unlock") data.wcost = KinkyDungeonStatWillCostUnlock;
	KinkyDungeonInterruptSleep();
	if (StruggleType == "Unlock") data.cost = 0;
	KinkyDungeonSendEvent("beforeStruggleCalc", data);
	if (!restraint.pickProgress) restraint.pickProgress = 0;
	if (!restraint.struggleProgress) restraint.struggleProgress = 0;
	if (!restraint.unlockProgress) restraint.unlockProgress = 0;
	if (!restraint.cutProgress) restraint.cutProgress = 0;
	let EC = KDGetEscapeChance(restraint, StruggleType, data.escapeChance, data.limitChance, true, true, true);
	data.escapeChance = EC.escapeChance;
	data.limitChance = EC.limitChance;

	data.origEscapeChance = data.escapeChance;

	let increasedAttempts = false;

	let handsBound = KinkyDungeonIsHandsBound(true) && !KinkyDungeonCanUseFeet();

	// Bonuses go here. Buffs dont get added to orig escape chance, but
	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle")) data.escapeChance += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostStruggle");
	if (StruggleType == "Cut") {
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCutting")) data.escapeChance += KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCutting");
		if (data.hasAffinity) {
			if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp() || !KinkyDungeonPlayerDamage) {
				let maxBonus = 0;
				let weaponsToTest = KinkyDungeonAllWeapon();//KinkyDungeonCanUseWeapon() ? KinkyDungeonAllWeapon() : [KinkyDungeonPlayerDamage];
				for (let inv of weaponsToTest) {
					if (KDWeapon(inv).cutBonus > maxBonus) maxBonus = KDWeapon(inv).cutBonus;
					if (KDWeapon(inv).cutBonus != undefined && KDWeapon(inv).magic) data.canCutMagic = true;
				}
				data.escapeChance += maxBonus;
				data.origEscapeChance += maxBonus;
			} else if (KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.cutBonus) {
				data.escapeChance += KinkyDungeonPlayerDamage.cutBonus;
				data.origEscapeChance += KinkyDungeonPlayerDamage.cutBonus;
			}
		}
		if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCuttingMinimum")) data.escapeChance = Math.max(data.escapeChance, KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "BoostCuttingMinimum"));
	}
	if (StruggleType == "Cut" && !KDRestraint(restraint).magic && KinkyDungeonWeaponCanCut(true, true)) {
		data.escapeChance += KinkyDungeonEnchantedKnifeBonus;
		data.origEscapeChance += KinkyDungeonEnchantedKnifeBonus;
	}
	let escapeSpeed = 2.0;

	// Finger extensions will help if your hands are unbound. Some items cant be removed without them!
	// Mouth counts as a finger extension on your hands if your arms aren't tied
	let armsBound = KinkyDungeonIsArmsBound(true);
	let armsBoundOverride = false;
	let handsBoundOverride = false;

	if (KDUnboundAffinityOverride[affinity] && (!handsBound || handsBoundOverride) && (!armsBound || armsBoundOverride)) data.hasAffinity = true;

	if (StruggleType == "Remove" &&
		(!handsBound && (KinkyDungeonWeaponCanCut(true) || KinkyDungeonLockpicks > 0)
		|| (struggleGroup == "ItemHands" && KinkyDungeonCanTalk() && !armsBound))) {
		data.escapeChance = Math.max(data.escapeChance, Math.min(1, data.escapeChance + 0.15));
		data.origEscapeChance = Math.max(data.origEscapeChance, Math.min(1, data.origEscapeChance + 0.15));
	}

	// You can tug using unbound hands
	// REMOVED due to same thing as Unbound Affinity Override
	/*if (StruggleType == "Struggle" &&
		(!handsBound && !armsBound && struggleGroup != "ItemHands" && struggleGroup != "ItemArms")) {
		escapeSpeed *= 1.4;
		data.escapeChance = Math.max(data.escapeChance, Math.min(1, data.escapeChance + 0.05));
		data.origEscapeChance = Math.max(data.origEscapeChance, Math.min(1, data.origEscapeChance + 0.05));
	}*/

	// Psychic doesnt modify original chance, so that you understand its the perk helping you
	if (StruggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.25);

	let edgeBonus = 0.12;
	if (StruggleType == "Struggle" && data.hasAffinity) data.escapeChance += edgeBonus;

	if (KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown")) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonBuffLockdownTry"), "#ff0000", 1);
		data.escapeChance -= KinkyDungeonGetBuffedStat(KinkyDungeonPlayerBuffs, "Lockdown") * 0.1;
	}

	if ((StruggleType == "Struggle") && !data.hasAffinity && data.escapeChance <= 0 && data.escapeChance >= -edgeBonus && (!KDRestraint(restraint).alwaysEscapable || !KDRestraint(restraint).alwaysEscapable.includes(StruggleType))) {
		let typesuff = "";
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
		if (affinity && !KinkyDungeonGetAffinity(false, affinity, struggleGroup)) typesuff = "Wrong" + affinity;
		if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + StruggleType + "NeedEdge" + typesuff), "#ff0000", 2, true);
		KinkyDungeonLastAction = "Struggle";
		KinkyDungeonSendEvent("struggle", {
			restraint: restraint,
			group: struggleGroup,
			struggleType: StruggleType,
			result: "NeedEdge",
		});
		return "NeedEdge";
	}


	if (data.escapeChance <= 0) {
		if (!restraint.attempts) restraint.attempts = 0;
		if (restraint.attempts < KinkyDungeonMaxImpossibleAttempts) {
			increasedAttempts = true;
			restraint.attempts += 0.5;
			if (StruggleType == "Struggle") restraint.attempts += 0.5;
			if (data.escapeChance <= -0.5) restraint.attempts += 0.5;
		} else {
			let typesuff = "";
			if (data.origEscapeChance <= 0 && data.helpChance) typesuff = "3";
			else if (KDRestraint(restraint).specStruggleTypes && KDRestraint(restraint).specStruggleTypes.includes(StruggleType)) typesuff = "2";
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
			if (typesuff == "" && failSuffix) typesuff = failSuffix;
			if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + StruggleType + "Impossible" + typesuff), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: restraint,
				group: struggleGroup,
				struggleType: StruggleType,
				result: "Impossible",
			});
			KinkyDungeonChangeStamina(data.cost, 1);
			KinkyDungeonChangeWill(data.wcost);
			if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);
			KinkyDungeonAdvanceTime(1);
			return "Impossible";
		}
	}

	// Struggling is unaffected by having arms bound
	let minAmount = 0.1 - Math.max(0, 0.01*KDRestraint(restraint).power);
	if (StruggleType == "Remove" && !data.hasAffinity) minAmount = 0;
	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && StruggleType != "Struggle" && (struggleGroup != "ItemArms" && struggleGroup != "ItemHands" ) && (handsBound || armsBound)) data.escapeChance /= 1.5;
	if (StruggleType != "Struggle" && struggleGroup != "ItemArms" && armsBound) data.escapeChance = Math.max(minAmount, data.escapeChance - 0.3);

	// Covered hands makes it harder to unlock, and twice as hard to remove
	if (((StruggleType == "Pick" && !KinkyDungeonStatsChoice.get("Psychic")) || StruggleType == "Unlock" || StruggleType == "Remove") && struggleGroup != "ItemHands" && handsBound)
		data.escapeChance = (StruggleType == "Remove" && data.hasAffinity) ? data.escapeChance / 2 : Math.max(0, data.escapeChance - 0.5);

	if (StruggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if ((StruggleType == "Remove") && !data.hasAffinity && data.escapeChance == 0 && (!KDRestraint(restraint).alwaysEscapable || !KDRestraint(restraint).alwaysEscapable.includes(StruggleType))) {
		let typesuff = "";
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
		if (affinity && !KinkyDungeonGetAffinity(false, affinity, struggleGroup)) typesuff = "Wrong" + affinity;
		if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + StruggleType + "NeedEdge" + typesuff), "#ff0000", 2, true);
		KinkyDungeonLastAction = "Struggle";
		KinkyDungeonSendEvent("struggle", {
			restraint: restraint,
			group: struggleGroup,
			struggleType: StruggleType,
			result: "NeedEdge",
		});
		return "NeedEdge";
	}

	let possible = data.escapeChance > 0;
	// Strict bindings make it harder to escape
	if (data.strict) data.escapeChance = Math.max(0, data.escapeChance - data.strict);

	if (StruggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.2);

	if (possible && data.escapeChance == 0 && (!KDRestraint(restraint).alwaysEscapable || !KDRestraint(restraint).alwaysEscapable.includes(StruggleType))) {
		let typesuff = "";
		if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
		if (typesuff == "" && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) typesuff = typesuff + "Aroused";
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + StruggleType + "Strict" + typesuff), "#ff0000", 2, true);
		KinkyDungeonLastAction = "Struggle";
		KinkyDungeonSendEvent("struggle", {
			restraint: restraint,
			group: struggleGroup,
			struggleType: StruggleType,
			result: "Strict",
		});
		return "Strict";
	}

	// Reduce cutting power if you dont have hands
	if (StruggleType == "Cut" && !KinkyDungeonWeaponCanCut(true) && KinkyDungeonIsHandsBound(true)) {
		if (KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;})) {
			if (KinkyDungeonWallCrackAndKnife(true)) {
				data.escapeChance *= 0.92;
			} else if (!KinkyDungeonIsArmsBound(true)) {
				data.escapeChance *= 0.7;
			} else if (KinkyDungeonStatsChoice.get("Psychic")) {
				data.escapeChance *= 0.55;
			} else if (data.hasAffinity) {
				data.escapeChance *= 0.4;
			} else {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonNeedGrip"), "#ff0000", 2);
				data.escapeChance *= 0.0;
			}
		} else if (data.hasAffinity) data.escapeChance *= 0.4;
		else data.escapeChance = 0;

		data.escapeChance = Math.max(0, data.escapeChance - 0.05);

	}

	if (!(KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && (StruggleType == "Pick" || StruggleType == "Unlock" || StruggleType == "Remove")) data.escapeChance /= 1.0 + KinkyDungeonStatDistraction/KinkyDungeonStatDistractionMax*KinkyDungeonDistractionUnlockSuccessMod;

	if (KDGroupBlocked(struggleGroup) && !KDRestraint(restraint).alwaysStruggleable) data.escapeChance = 0;

	// Blue locks make it harder to escape an item
	let lockType = restraint.lock && KDLocks[restraint.lock] ? KDLocks[restraint.lock] : null;

	if (lockType && lockType.penalty && lockType.penalty[StruggleType]) data.escapeChance = Math.max(0, data.escapeChance - lockType.penalty[StruggleType]);

	if (StruggleType == "Cut" && struggleGroup != "ItemHands" && handsBound)
		data.escapeChance = data.escapeChance / 2;

	// Struggling is affected by tightness
	if (data.escapeChance > 0 && StruggleType == "Struggle") {
		for (let T = 0; T < restraint.tightness; T++) {
			data.escapeChance *= 0.8; // Tougher for each tightness, however struggling will reduce the tightness
		}
	}

	if (StruggleType == "Pick") data.escapeChance *= KinkyDungeonGetPickBaseChance();

	if (StruggleType == "Unlock" && KinkyDungeonStatsChoice.get("Psychic")) data.escapeChance = Math.max(data.escapeChance, 0.15);

	if (data.escapePenalty > 0) {
		data.escapeChance = Math.max(0, data.escapeChance - data.escapePenalty);
	}

	let belt = null;
	let bra = null;

	if (struggleGroup == "ItemVulva" || struggleGroup == "ItemVulvaPiercings" || struggleGroup == "ItemButt") belt = KinkyDungeonGetRestraintItem("ItemPelvis");
	if (belt && KDRestraint(belt) && KDRestraint(belt).chastity) data.escapeChance = 0.0;

	if (struggleGroup == "ItemNipples" || struggleGroup == "ItemNipplesPiercings") bra = KinkyDungeonGetRestraintItem("ItemBreast");
	if (bra && KDRestraint(bra) && KDRestraint(bra).chastitybra) data.escapeChance = 0.0;


	if (data.escapeChance <= 0 && (!KDRestraint(restraint).alwaysEscapable || !KDRestraint(restraint).alwaysEscapable.includes(StruggleType))) {
		if (!restraint.attempts) restraint.attempts = 0;
		if (restraint.attempts < KinkyDungeonMaxImpossibleAttempts || increasedAttempts) {
			if (!increasedAttempts) {
				restraint.attempts += 0.5;
				if (data.escapeChance <= -0.5) restraint.attempts += 0.5;
			}
		} else {
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
			let suff = "";
			if (suff == "" && failSuffix) suff = failSuffix;
			if (KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = suff + "Aroused";
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggle" + StruggleType + "ImpossibleBound" + suff), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: restraint,
				group: struggleGroup,
				struggleType: StruggleType,
				result: "Impossible",
			});
			KinkyDungeonChangeStamina(data.cost, 1);
			KinkyDungeonChangeWill(data.wcost);
			if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);
			KinkyDungeonAdvanceTime(1);
			return "Impossible";
		}
	}

	if (KDRestraint(restraint) && KDRestraint(restraint).escapeMult != undefined) data.escapeChance *= KDRestraint(restraint).escapeMult;

	if (KDRestraint(restraint) && KDRestraint(restraint).struggleMult && KDRestraint(restraint).struggleMult[StruggleType] != undefined)
		data.escapeChance *= KDRestraint(restraint).struggleMult[StruggleType];

	if (data.escapeChance > 0) {
		// Min struggle speed is always 0.05 = 20 struggle attempts
		let minSpeed = (KDRestraint(restraint).struggleMinSpeed && KDRestraint(restraint).struggleMinSpeed[StruggleType]) ? KDRestraint(restraint).struggleMinSpeed[StruggleType] : 0.05;
		data.escapeChance = Math.max(data.escapeChance, minSpeed);
	}

	if (KDRestraint(restraint) && KDRestraint(restraint).struggleMaxSpeed && KDRestraint(restraint).struggleMaxSpeed[StruggleType] != undefined)
		data.escapeChance = Math.min(data.escapeChance, KDRestraint(restraint).struggleMaxSpeed[StruggleType]);

	// Handle cases where you can't even attempt to unlock or pick
	if (lockType && (StruggleType == "Unlock" && !lockType.canUnlock(data))
		|| (StruggleType == "Pick" && lockType && !lockType.pickable)) {
		if (StruggleType == "Unlock")
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleUnlockNo" + restraint.lock + "Key"), "orange", 2, true);
		else
			KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonStruggleCantPick" + restraint.lock + "Lock"), "orange", 2, true);
	} else {

		// Limit of what you can struggle to given current limit chance
		let maxLimit = 100;


		// Main struggling block
		if ((data.wcost > 0 && !KinkyDungeonHasWill(-data.wcost, false)) && (data.escapeChance <= data.willEscapePenalty && !KinkyDungeonHasWill(0.01, false))) {
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.NoWill) ? KDRestraint(restraint).sfxEscape.NoWill : "Struggle")
				+ ".ogg");
			KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), "#ff0000", 2, true);
			KinkyDungeonLastAction = "Struggle";
			KinkyDungeonSendEvent("struggle", {
				restraint: restraint,
				group: struggleGroup,
				struggleType: StruggleType,
				result: "Will",
			});
			return "Will";
		} else if (!KinkyDungeonHasStamina(-data.cost, true)) {
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.NoStamina) ? KDRestraint(restraint).sfxEscape.NoStamina : "Struggle")
				+ ".ogg");
			KinkyDungeonWaitMessage(true);
		} else if (data.escapeChance > 0) {

			let extraLim = (StruggleType == "Pick" && lockType.pick_lim) ? Math.max(0, lockType.pick_lim) : 0;
			let extraLimPenalty = (StruggleType == "Pick") ? extraLim * restraint.pickProgress : 0;
			let extraLimThreshold = Math.min(1, (data.escapeChance / extraLim));
			// One last check: check limits
			if ((data.limitChance > 0 || extraLim > 0) && data.escapeChance > 0) {
				let threshold = 0.75;
				if (data.limitChance > data.escapeChance) {
					threshold = Math.min(threshold, 0.9*(data.escapeChance / data.limitChance));
				}
				let limitProgress = restraint.struggleProgress ? (StruggleType == "Struggle" ?
					(restraint.struggleProgress < threshold ? threshold * restraint.struggleProgress : 1.0) :
					Math.min(1, 1.15 - 1.15 * restraint.struggleProgress))
					: (StruggleType == "Struggle" ? 0 : 1);
				let limitPenalty = Math.max(0, Math.min(1, limitProgress) * data.limitChance, extraLimPenalty);
				let maxPossible = 1;
				if ((data.limitChance > 0 && data.limitChance > data.escapeChance && StruggleType == "Struggle")) {
					// Find the intercept
					maxPossible = threshold;
				}
				if (extraLim > data.escapeChance) {
					// Find the intercept
					maxPossible = Math.min(extraLimThreshold, maxPossible);
				}


				// Prevent struggling past this
				if (maxPossible < 1) maxLimit = maxPossible;

				if (extraLimPenalty > 0 && extraLimPenalty > limitPenalty) {
					data.escapeChance -= extraLimPenalty;
					if (data.escapeChance <= 0) {
						// Replace with frustrated moan later~
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit"), "#ff0000", 2, true);
						KinkyDungeonLastAction = "Struggle";
						KinkyDungeonSendEvent("struggle", {
							restraint: restraint,
							group: struggleGroup,
							struggleType: StruggleType,
							result: "LimitExtra",
						});
						return "LimitExtra";
					}
				} else if (limitPenalty > 0) {
					data.escapeChance -= limitPenalty;
					if (data.escapeChance <= 0) {
						// Replace with frustrated moan later~
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
						KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Limit"), "#ff0000", 2, true);
						KinkyDungeonLastAction = "Struggle";
						KinkyDungeonSendEvent("struggle", {
							restraint: restraint,
							group: struggleGroup,
							struggleType: StruggleType,
							result: "Limit",
						});
						return "Limit";
					}
				}
			}

			if (data.escapeChance > 0 && KinkyDungeonHasWill(0.01, false)) {
				data.escapeChance -= data.willEscapePenalty;
				if (data.escapeChance <= 0) {
					// Replace with frustrated moan later~
					if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
						+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.NoWill) ? KDRestraint(restraint).sfxEscape.NoWill : "Struggle")
						+ ".ogg");
					KinkyDungeonSendActionMessage(10, TextGet("KDWillStruggle"), "#ff0000", 2, true);
					KinkyDungeonLastAction = "Struggle";
					KinkyDungeonSendEvent("struggle", {
						restraint: restraint,
						group: struggleGroup,
						struggleType: StruggleType,
						result: "Will",
					});
					return "Will";
				}
			}

			if (data.escapeChance <= 0) {
				if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/Struggle.ogg");
				// Replace with frustrated moan later~
				KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeon" + StruggleType + "Barely"), "#ff0000", 2, true);
				KinkyDungeonLastAction = "Struggle";
				KinkyDungeonSendEvent("struggle", {
					restraint: restraint,
					group: struggleGroup,
					struggleType: StruggleType,
					result: "Barely",
				});
				return "Barely";
			}

			// Pass block
			let progress = restraint.cutProgress ? restraint.cutProgress : 0;

			if (((StruggleType == "Cut" && progress >= 1 - data.escapeChance)
					|| (StruggleType == "Pick" && restraint.pickProgress >= 1 - data.escapeChance)
					|| (StruggleType == "Unlock" && restraint.unlockProgress >= 1 - data.escapeChance)
					|| (StruggleType == "Remove" && progress >= 1 - data.escapeChance)
					|| (progress >= 1 - data.escapeChance))
				&& !(StruggleType == "Pick" && lockType && !lockType.canPick(data))) {
				Pass = "Success";
				KDSuccessRemove(StruggleType, restraint, lockType, index, data, host);
			} else {
				// Failure block for the different failure types
				if (StruggleType == "Cut") {
					if (((handsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound) || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound)) && KinkyDungeonWeaponCanCut(true) && KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name) {
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.KnifeDrop) ? KDRestraint(restraint).sfxEscape.KnifeDrop : "Miss")
							+ ".ogg");
						Pass = "Drop";
						KinkyDungeonDisarm(KinkyDungeonPlayerEntity, "Cut");
					} else {
						if (KDItemIsMagic(restraint) && !data.canCutMagic) {
							if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
								+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.NoMagic) ? KDRestraint(restraint).sfxEscape.NoMagic : "SoftShield")
								+ ".ogg");
							Pass = "Fail";
						} else {
							if (KinkyDungeonSound) {
								if (KDItemIsMagic(restraint))
									AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
									+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.MagicCut) ? KDRestraint(restraint).sfxEscape.MagicCut : "Cut")
									+ ".ogg");
								else AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
									+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.Cut) ? KDRestraint(restraint).sfxEscape.Cut : "Cut")
									+ ".ogg");
							}
							let mult = 1.0 - 0.9 * Math.min(1.0, progress);
							if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
							if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
							// Speed = minimum for cutting
							let speed = data.cutSpeed * mult + Math.max(0, data.escapeChance) * 0.5;
							mult *= 0.7 + 0.3 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
							KDAddDelayedStruggle(
								escapeSpeed * speed * (0.3 + 0.2 * KDRandom() + 0.6 * Math.max(0, (KinkyDungeonStatStamina)/KinkyDungeonStatStaminaMax)),
								KDStruggleTime, StruggleType, struggleGroup, index, data,
								restraint.cutProgress, maxLimit
							);
							if (speed > 0) {
								let debris = "";
								let debrisFlag = KDRestraint(restraint).Group + "deb";
								if (!KinkyDungeonFlags.get(debrisFlag)) {
									if (KDRestraint(restraint)?.debris && KDRandom() < KDRestraint(restraint)?.debrisChance ? KDRestraint(restraint)?.debrisChance : 1.0) debris = KDRestraint(restraint)?.debris;
								}

								if (debris) {
									KinkyDungeonSetFlag(debrisFlag, 4);
									KDCreateDebris(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, {
										aoe: 1.5,
										dist: 0.5,
										kind: debris,
										number: 1,
									});
								}
							}
						}
					}
				} else if (StruggleType == "Pick") {
					if (lockType && lockType.breakChance(data)) { // Chance to break pick
						Pass = "Break";
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.PickBreak) ? KDRestraint(restraint).sfxEscape.PickBreak : "PickBreak")
							+ ".ogg");
						KinkyDungeonLockpicks -= 1;
						KinkyDungeonPickBreakProgress = 0;
					} else if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.PickDrop) ? KDRestraint(restraint).sfxEscape.PickDrop : "Miss")
							+ ".ogg");
						Pass = "Drop";
						KinkyDungeonDropItem({name: "Pick"}, KinkyDungeonPlayerEntity, true);
						KinkyDungeonLockpicks -= 1;
					} else {
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.Pick) ? KDRestraint(restraint).sfxEscape.Pick : "Pick")
							+ ".ogg");
						if (!restraint.pickProgress) restraint.pickProgress = 0;
						let mult = 0.5 + 0.6 * (progress);
						if (KinkyDungeonStatsChoice.get("Locksmith")) mult *= KDLocksmithSpeedBonus;
						if (KinkyDungeonStatsChoice.get("Clueless")) mult *= KDCluelessSpeedBonus;
						mult *= 0.5 + 0.5 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
						KDAddDelayedStruggle(
							escapeSpeed * mult * (data.escapeChance > 0 ? (KDMinPickRate * (data.escapeChance > 0.5 ? 2 : 1)) : 0) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction)/KinkyDungeonStatDistractionMax)),
							KDStruggleTime, StruggleType, struggleGroup, index, data,
							restraint.pickProgress, maxLimit
						);
					}
				} else if (StruggleType == "Unlock") {
					if (!KinkyDungeonStatsChoice.get("Psychic") && (handsBound || (armsBound && KDRandom() < KinkyDungeonItemDropChanceArmsBound))) {
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.KeyDrop) ? KDRestraint(restraint).sfxEscape.KeyDrop : "Miss")
							+ ".ogg");
						Pass = "Drop";
						let keytype = KinkyDungeonGetKey(restraint.lock);
						if (keytype) {
							KinkyDungeonDropItem({name: keytype+"Key"}, KinkyDungeonPlayerEntity, true);
							KinkyDungeonRemoveKeysUnlock(restraint.lock);
						}
					} else {
						if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
							+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.Pick) ? KDRestraint(restraint).sfxEscape.Pick : "Pick")
							+ ".ogg");
						let mult = 0.4 + 0.65 * (progress);
						if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
						if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
						mult *= 0.7 + 0.3 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
						KDAddDelayedStruggle(
							escapeSpeed * mult * Math.max(data.escapeChance > 0 ? KDMinEscapeRate : 0, data.escapeChance) * (0.8 + 0.4 * KDRandom() - 0.4 * Math.max(0, (KinkyDungeonStatDistraction)/KinkyDungeonStatDistractionMax)),
							KDStruggleTime, StruggleType, struggleGroup, index, data,
							restraint.unlockProgress, maxLimit
						);
					}
				} else if (StruggleType == "Remove") {
					if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
						+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.Remove) ? KDRestraint(restraint).sfxEscape.Remove : "Struggle")
						+ ".ogg");
					let mult = 0.3 + 1.0 * (progress);
					if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
					if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
					mult *= 0.7 + 0.3 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
					KDAddDelayedStruggle(
						escapeSpeed * mult * Math.max(data.escapeChance > 0 ? KDMinEscapeRate : 0, data.escapeChance) * (0.5 + 0.4 * KDRandom() + 0.3 * Math.max(0, (KinkyDungeonStatStamina)/KinkyDungeonStatStaminaMax)),
						KDStruggleTime, StruggleType, struggleGroup, index, data,
						restraint.struggleProgress, maxLimit
					);
				} else if (StruggleType == "Struggle") {
					if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
						+ ((KDRestraint(restraint).sfxEscape && KDRestraint(restraint).sfxEscape.Struggle) ? KDRestraint(restraint).sfxEscape.Struggle : "Struggle")
						+ ".ogg");
					let mult = 1.25 - 0.75 * (progress);
					if (KinkyDungeonStatsChoice.get("Flexible")) mult *= KDFlexibleSpeedBonus;
					if (KinkyDungeonStatsChoice.get("Inflexible")) mult *= KDInflexibleSpeedBonus;
					mult *= 0.7 + 0.3 * (KinkyDungeonStatWill / KinkyDungeonStatWillMax);
					KDAddDelayedStruggle(
						escapeSpeed * mult * Math.max(data.escapeChance > 0 ? KDMinEscapeRate : 0, data.escapeChance) * (0.5 + 0.4 * KDRandom() + 0.3 * Math.max(0, (KinkyDungeonStatStamina)/KinkyDungeonStatStaminaMax)),
						KDStruggleTime, StruggleType, struggleGroup, index, data,
						restraint.struggleProgress, maxLimit
					);
				}
			}

			// Aftermath
			let suff = "";
			if (Pass == "Fail" && data.escapeChance > 0 && data.origEscapeChance <= 0) {
				if ((KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp()) && data.helpChance) suff = "3";
				else suff = "2";
			} else if (Pass == "Fail") {
				if (suff == "" && failSuffix) suff = failSuffix;
			}
			if ((suff == "" || (Pass == "Fail" && suff == failSuffix)) && (Pass == "Fail" || Pass == "Success") && KinkyDungeonStatDistraction > KinkyDungeonStatDistractionMax*0.1) suff = suff + "Aroused";
			KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonStruggle" + StruggleType + Pass + suff).replace("TargetRestraint", TextGet("Restraint" + KDRestraint(restraint).name)), (Pass == "Success") ? "lightgreen" : "#ff0000", 2);

			KinkyDungeonChangeStamina(data.cost, 1);
			KinkyDungeonChangeWill(data.wcost);
			if (KinkyDungeonStatsChoice.get("BondageLover")) KinkyDungeonChangeDistraction(KDBondageLoverAmount, false, 0.5);

			if (Pass != "Success") {
				// Reduce the progress
				if (StruggleType == "Struggle") {
					restraint.pickProgress = Math.max(0, restraint.pickProgress * 0.5 - 0.01);
					restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
				} else if (StruggleType == "Pick") {
					restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
				} else if (StruggleType == "Unlock") {
					restraint.pickProgress = Math.max(0, restraint.pickProgress* 0.5 - 0.01);
				} if (StruggleType == "Remove") {
					restraint.pickProgress = Math.max(0, restraint.pickProgress* 0.5 - 0.01);
					restraint.unlockProgress = Math.max(0, restraint.unlockProgress * 0.5 - 0.01);
				}

				// reduces the tightness of the restraint slightly
				if (StruggleType == "Struggle") {
					let tightness_reduction = 1;

					// eslint-disable-next-line no-unused-vars
					for (let _item of KinkyDungeonAllRestraint()) {
						tightness_reduction *= 0.8; // Reduced tightness reduction for each restraint currently worn
					}

					restraint.tightness = Math.max(0, restraint.tightness - tightness_reduction);
				}
			} else if (KinkyDungeonHasGhostHelp() || KinkyDungeonHasAllyHelp())
				KinkyDungeonChangeRep("Ghost", 1);
		}

		KinkyDungeonSendEvent("struggle", {
			restraint: restraint,
			group: struggleGroup,
			struggleType: StruggleType,
			result: Pass,
		});
		KinkyDungeonLastAction = "Struggle";
		if (StruggleType == "Struggle") {
			KinkyDungeonMakeNoise(4, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			KinkyDungeonAlert = 3;
		}
		KinkyDungeonAdvanceTime(1);
		if (Pass == "Success") KinkyDungeonCurrentEscapingItem = null;
		return Pass;
	}
	return "Impossible";
}

/**
 * "Return the first restraint item in the game that belongs to the given group."
 * @param {string} group - The group of the restraint item you want to get.
 * @returns {item} The item that matches the group.
 */
function KinkyDungeonGetRestraintItem(group) {
	for (let item of KinkyDungeonAllRestraint()) {
		if (item.type == Restraint && KDRestraint(item).Group == group) {
			return item;
		}
	}
	return null;
}

/**
 * Refreshes the restraints map
 */
function KinkyDungeonRefreshRestraintsCache() {
	KinkyDungeonRestraintsCache = new Map();
	for (let r of KinkyDungeonRestraints) {
		KinkyDungeonRestraintsCache.set(r.name, r);
	}
}


/**
 *
 * @param {string} Name
 * @returns {restraint}
 */
function KinkyDungeonGetRestraintByName(Name) {
	if (KinkyDungeonRestraintsCache.size > 0) {
		return KinkyDungeonRestraintsCache.get(Name);
	} else {
		KinkyDungeonRefreshRestraintsCache();
		return KinkyDungeonRestraintsCache.get(Name);
	}
}

/**
 *
 * @param {string} Lock
 * @returns {number}
 */
function KinkyDungeonGetLockMult(Lock) {
	if (KDLocks[Lock]) return KDLocks[Lock].lockmult;

	return 1;
}

/** Tags which the 'agnostic' option on KinkyDungeonGetRestraint does not override */
let KDNoOverrideTags = [
	"NoVibes",
	"Unmasked",
	"Unchained",
	"Damsel",
];

/**
 *
 * @param {KDHasTags} enemy
 * @param {*} Level
 * @param {*} Index
 * @param {*} Bypass
 * @param {*} Lock
 * @param {*} RequireWill
 * @param {*} LeashingOnly
 * @param {*} NoStack
 * @param {*} extraTags
 * @param {*} agnostic - Determines if playertags and current bondage are ignored
 * @param {{minPower?: number, maxPower?: number, onlyLimited?: boolean, noUnlimited?: boolean, noLimited?: boolean, onlyUnlimited?: boolean, ignore?: string[], require?: string[], looseLimit?: boolean, ignoreTags?: string[]}} [filter] - Filters for items
 * @returns
 */
function KinkyDungeonGetRestraint(enemy, Level, Index, Bypass, Lock, RequireWill, LeashingOnly, NoStack, extraTags, agnostic, filter) {
	let restraintWeightTotal = 0;
	if (KinkyDungeonStatsChoice.has("NoWayOut")) RequireWill = false;
	let restraintWeights = [];
	let willPercent = (Math.min(KinkyDungeonStatWill / KinkyDungeonStatWillMax, 1 - KinkyDungeonStatDistraction / KinkyDungeonStatDistractionMax))
		/(1 + (KinkyDungeonGoddessRep.Ghost + 50)/100);

	if (KinkyDungeonSlowLevel > 0) willPercent = willPercent * (0.6 + 0.4 * Math.min(1, Math.max(0, 1 - KinkyDungeonSlowLevel/3)));

	let tags = new Map();
	if (enemy.tags.length) {
		for (let t of enemy.tags) {
			tags.set(t, true);
		}
	} else {
		for (let t of Object.keys(enemy.tags)) {
			tags.set(t, true);
		}
	}
	if (extraTags)
		for (let t of Object.entries(extraTags)) {
			if (Level >= t[1])
				tags.set(t[0], true);
		}

	if (filter?.ignoreTags) {
		for (let ft of filter.ignoreTags) {
			tags.delete(ft);
		}
	}

	let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");
	let cache = [];
	for (let restraint of KinkyDungeonRestraints) {
		let effLevel = Level;
		if (KinkyDungeonStatsChoice.has("TightRestraints")) {
			effLevel *= KDTightRestraintsMult;
			effLevel += KDTightRestraintsMod;
		}
		if ((effLevel >= restraint.minLevel || KinkyDungeonNewGame > 0) && (!restraint.maxLevel || effLevel < restraint.maxLevel) && (restraint.allFloors || restraint.floors[Index])) {
			if (!restraint.arousalMode || arousalMode) {
				let enabled = false;
				let weight = 0;
				for (let t of tags.keys())
					if (restraint.enemyTags[t] != undefined) {
						weight += restraint.enemyTags[t];
						enabled = true;
					}
				if (enabled) {
					cache.push({r: restraint, w:weight});
				}
			}
		}
	}

	let start = performance.now();
	for (let r of cache) {
		let restraint = r.r;
		if (filter) {
			if (filter.maxPower && r.r.power > filter.maxPower) continue;
			if (filter.minPower && r.r.power < filter.minPower && (!filter.looseLimit || !r.r.limited) && !r.r.unlimited) continue;
			if (filter.onlyUnlimited && r.r.limited) continue;
			if (filter.noUnlimited && r.r.unlimited) continue;
			if (filter.noLimited && r.r.limited) continue;
			if (filter.onlyLimited && !r.r.limited && !r.r.unlimited) continue;
			if (filter.ignore && filter.ignore.includes(r.r.name)) continue;
			if (filter.require && !filter.require.includes(r.r.name)) continue;
		}
		if ((!LeashingOnly || (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints"))
			&& (!RequireWill || !restraint.maxwill || willPercent <= restraint.maxwill || (LeashingOnly && (restraint.Group == "ItemNeck" || restraint.Group == "ItemNeckRestraints"))))
			if (agnostic || KDCanAddRestraint(restraint, Bypass, Lock, NoStack, undefined, KinkyDungeonStatsChoice.has("MagicHands") ? true : undefined)) {

				restraintWeights.push({restraint: restraint, weight: restraintWeightTotal});
				let weight = r.w;
				weight += restraint.weight;
				if (restraint.playerTags)
					for (let tag in restraint.playerTags)
						if ((!agnostic || !KDNoOverrideTags.includes(tag)) && KinkyDungeonPlayerTags.get(tag)) weight += restraint.playerTags[tag];
				restraintWeightTotal += Math.max(0, weight);
			}
	}
	let end = performance.now();
	if (KDDebug)
		console.log(`Took ${end - start} milliseconds to generate restraints for enemy`);

	let selection = KDRandom() * restraintWeightTotal;

	for (let L = restraintWeights.length - 1; L >= 0; L--) {
		if (selection > restraintWeights[L].weight) {
			return restraintWeights[L].restraint;
		}
	}

}

// @ts-ignore
// @ts-ignore
function KinkyDungeonUpdateRestraints(delta) {
	let playerTags = new Map();
	for (let inv of KinkyDungeonAllRestraint()) {
		let group = KDRestraint(inv).Group;
		if (group) {
			if (KDGroupBlocked(group)) playerTags.set(group + "Blocked", true);
			playerTags.set(group + "Full", true);
			playerTags.set(inv.name + "Worn", true);
		}
	}
	for (let sg of KinkyDungeonStruggleGroupsBase) {
		let group = sg;
		if (group == "ItemM") {
			if (!KinkyDungeonGetRestraintItem("ItemMouth")) playerTags.set("ItemMouth" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemMouth2")) playerTags.set("ItemMouth2" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemMouth3")) playerTags.set("ItemMouth3" + "Empty", true);
		} else if (group == "ItemH") {
			if (!KinkyDungeonGetRestraintItem("ItemHood")) playerTags.set("ItemHood" + "Empty", true);
			if (!KinkyDungeonGetRestraintItem("ItemHead")) playerTags.set("ItemHead" + "Empty", true);
		} else if (!KinkyDungeonGetRestraintItem(group)) playerTags.set(group + "Empty", true);
	}
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).addTag)
			for (let tag of KDRestraint(inv).addTag) {
				if (!playerTags.get(tag)) playerTags.set(tag, true);
			}
		if (KDRestraint(inv).chastity)
			playerTags.set("ChastityLower", true);
		if (KDRestraint(inv).chastitybra)
			playerTags.set("ChastityUpper", true);
		if (KDRestraint(inv).hobble)
			playerTags.set("Hobble", true);
		if (KDRestraint(inv).blockfeet)
			playerTags.set("BoundFeet", true);
		if (KDRestraint(inv).bindarms)
			playerTags.set("BoundHands", true);
		if (KDRestraint(inv).bindhands)
			playerTags.set("BoundHands", true);
		if (KDRestraint(inv).blindfold)
			playerTags.set("Blindfolded", true);
		if (KDRestraint(inv).shrine) {
			for (let tag of KDRestraint(inv).shrine) {
				if (!playerTags.get(tag)) playerTags.set(tag, true);
			}
			let link = inv.dynamicLink;
			while (link) {
				for (let tag of KDRestraint(link).shrine) {
					if (!playerTags.get(tag)) playerTags.set(tag, true);
				}
				link = link.dynamicLink;
			}
		}

	}
	if (KinkyDungeonStatsChoice.get("Deprived")) playerTags.set("NoVibes", true);
	if (KinkyDungeonStatsChoice.get("Unmasked")) playerTags.set("Unmasked", true);
	if (KinkyDungeonStatsChoice.get("Unchained")) playerTags.set("Unchained", true);
	if (KinkyDungeonStatsChoice.get("Damsel")) playerTags.set("Damsel", true);

	let tags = [];
	KinkyDungeonAddTags(tags, MiniGameKinkyDungeonLevel);
	for (let t of tags) {
		playerTags.set(t, true);
	}
	return playerTags;
}

/**
 *
 * @param {item} item
 * @param {boolean} [NoLink]
 * @param {restraint} [toLink]
 * @returns
 */
function KinkyDungeonRestraintPower(item, NoLink, toLink) {
	if (item && item.type == Restraint) {
		let lockMult = item ? KinkyDungeonGetLockMult(item.lock) : 1;
		let power = (item.lock ? KDRestraint(item).power * lockMult : KDRestraint(item).power);

		if (item.dynamicLink && !NoLink) {
			let link = item.dynamicLink;
			if (!toLink || !KinkyDungeonIsLinkable(KinkyDungeonGetRestraintByName(link.name), toLink, link)) {
				let lock = link.lock;
				let mult = lock ? KinkyDungeonGetLockMult(lock) : 1;
				let pp = link ? (KDRestraint({name: link.name}).power) : 0;
				power = Math.max(power, pp * mult);
			}
		}
		return power;
	}
	return 0;
}

/**
 * @param {restraint} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [item]
 * @param {string} [newLock]
 * @returns {boolean}
 */
// @ts-ignore
function KinkyDungeonLinkableAndStricter(oldRestraint, newRestraint, item, newLock) {
	if (oldRestraint && newRestraint) {
		return KinkyDungeonIsLinkable(oldRestraint, newRestraint, item);
		//}
	}
	return false;
}

function KinkyDungeonGenerateRestraintTrap() {
	let enemy = KinkyDungeonGetEnemy(["chestTrap"], MiniGameKinkyDungeonLevel, KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint], '0', ["chestTrap"]);
	if (enemy) return enemy.name;
	return "GreedyGhast";
}

function KDGetLockVisual(item) {
	//if (KinkyDungeonBlindLevel > 0) return `Locks/Blind.png`;
	return `Locks/${item.lock}.png`;
}

/**
 *
 * @param {restraint} restraint
 * @param {boolean} Bypass
 * @param {boolean} NoStack
 * @param {string} Lock
 * @param {item} [r]
 * @param {boolean} [Deep]
 * @param {boolean} [noOverpower]
 * @returns {boolean} - Restraint can be added
 */
function KDCanAddRestraint(restraint, Bypass, Lock, NoStack, r, Deep, noOverpower) {
	// Limits
	if (restraint.shrine && restraint.shrine.includes("Vibes") && KinkyDungeonPlayerTags.get("NoVibes")) return false;
	if (restraint.arousalMode && !KinkyDungeonStatsChoice.get("arousalMode")) return false;
	if (restraint.Group == "ItemButt" && !KinkyDungeonStatsChoice.get("arousalModePlug")) return false;
	if (restraint.Group == "ItemNipplesPiercing" && !KinkyDungeonStatsChoice.get("arousalModePiercing")) return false;

	if (restraint.requireSingleTagToEquip) {
		let pass = false;
		for (let tag of restraint.requireSingleTagToEquip) {
			if (KinkyDungeonPlayerTags.has(tag)) {
				pass = true;
				break;
			}
		}
		if (!pass) return false;
	}
	if (!r) r = KinkyDungeonGetRestraintItem(restraint.Group);
	let power = KinkyDungeonRestraintPower(r, false, restraint);
	let linkUnder = KDGetLinkUnder(r, restraint, Bypass, NoStack, Deep);

	let linkableCurrent = r && KDRestraint(r) && KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

	if (linkUnder) return true;

	// We raise the power if the current item cannot be linked, but the item underneath also cannot be linked
	let link = r?.dynamicLink;
	while (link && !linkableCurrent) {
		let linkableUnder = KinkyDungeonLinkableAndStricter(KDRestraint(link), restraint, link);
		if (!linkableUnder) {
			power = Math.max(power, KinkyDungeonRestraintPower(link, false, restraint));
			link = link.dynamicLink;
		} else {
			link = null;
		}
	}

	let newLock = (Lock && KinkyDungeonIsLockable(restraint)) ? Lock : KDProcessLock(restraint.DefaultLock);
	if (
		// Nothing to overwrite so we good
		!r
		// We can link
		|| linkableCurrent
		// We are weak enough to override
		|| (!KDRestraint(r).enchanted
			&& (!noOverpower && power < restraint.power * KinkyDungeonGetLockMult(newLock)))
	) {
		if (Bypass || restraint.bypass || !KDGroupBlocked(restraint.Group, true))
			return true; // Recursion!!
	}
	return false;
}

/**
 * Returns the first restraint in the stack that can link the given restraint
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @param {boolean} [Deep] - Whether or not it can look deeper into the stack
 * @returns {item}
 */
function KDGetLinkUnder(currentRestraint, restraint, bypass, NoStack, Deep) {
	let link = currentRestraint;
	while (link) {
		if (KDCanLinkUnder(link, restraint, bypass, NoStack)) {
			return link;
		}
		if (Deep)
			link = link.dynamicLink;
		else link = null;
	}
	return null;
}

/**
 * Returns whether or not the restraint can go under the currentRestraint
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @returns {boolean}
 */
function KDCanLinkUnder(currentRestraint, restraint, bypass, NoStack) {
	let linkUnder = currentRestraint
		&& (bypass || (KDRestraint(currentRestraint).accessible))
		&& KinkyDungeonIsLinkable(restraint, KDRestraint(currentRestraint), currentRestraint)
		&& (!currentRestraint.dynamicLink || KinkyDungeonIsLinkable(KDRestraint(currentRestraint.dynamicLink), restraint, currentRestraint.dynamicLink));

	if (!linkUnder) return false;
	if (
		KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack)
	) {
		return true;
	}
}

/**
 *
 * @param {item} currentRestraint
 * @param {restraint} restraint
 * @param {boolean} [bypass]
 * @param {boolean} [NoStack]
 * @returns {boolean}
 */
function KDCheckLinkSize(currentRestraint, restraint, bypass, NoStack) {
	return (restraint.linkCategory && KDLinkCategorySize(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), restraint.linkCategory) + KDLinkSize(restraint) <= (NoStack ? 0.1 : 1.0))
		|| (!restraint.linkCategory && !KDDynamicLinkList(KinkyDungeonGetRestraintItem(KDRestraint(currentRestraint).Group), true).some((item) => {return restraint.name == item.name;}));
}

/**
 * @param {restraint | string} restraint
 * @param {number} [Tightness]
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Trapped]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {string} [faction]
 * @param {boolean} [Deep] - whether or not it can go deeply in the stack
 * @param {string} [Curse] - Curse to apply
 * @returns {number}
 */
function KinkyDungeonAddRestraintIfWeaker(restraint, Tightness, Bypass, Lock, Keep, Trapped, events, faction, Deep, Curse) {
	if (typeof restraint === "string") restraint = KinkyDungeonGetRestraintByName(restraint);
	if (KDCanAddRestraint(restraint, Bypass, Lock, false, undefined, Deep)) {
		let r = KinkyDungeonGetRestraintItem(restraint.Group);
		let linkUnder = null;
		linkUnder = KDGetLinkUnder(r, restraint, Bypass, undefined, Deep);
		let linkableCurrent = r
			&& KDRestraint(r)
			&& KinkyDungeonLinkableAndStricter(KDRestraint(r), restraint, r);

		let ret = 0;
		let alwaysLinkUnder = false;
		if (!linkableCurrent && linkUnder && (!linkableCurrent || !restraint.inaccessible || alwaysLinkUnder)) {
			// Insert the item underneath
			ret = Math.max(1, Tightness);
			linkUnder.dynamicLink = {name: restraint.name, type: Restraint, events:events ? events : Object.assign([], restraint.events), tightness: Tightness, lock: "", faction: faction, dynamicLink: linkUnder.dynamicLink };
			KinkyDungeonLock(linkUnder.dynamicLink, Lock);

			if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
				KDCurses[Curse].onApply(linkUnder.dynamicLink, linkUnder);
			}
			if (r) KDUpdateLinkCaches(r);
		} else {
			ret = KinkyDungeonAddRestraint(restraint, Tightness + Math.round(0.1 * KinkyDungeonDifficulty), Bypass, Lock, Keep, false, !linkableCurrent, events, faction, undefined, undefined, Curse);
		}
		if (Trapped) {
			let rest = KinkyDungeonGetRestraintItem(restraint.Group);
			if (rest && KDRestraint(rest) && KDRestraint(rest).trappable && !rest.trap) {
				rest.trap = KinkyDungeonGenerateRestraintTrap();
			}
		}
		return ret;
	}
	return 0;
}

/**
 *
 * @param {restraint} oldRestraint
 * @param {restraint} newRestraint
 * @param {item} [item]
 * @returns {boolean}
 */
function KinkyDungeonIsLinkable(oldRestraint, newRestraint, item) {
	if (!oldRestraint.nonbinding && newRestraint.nonbinding) return false;
	if (item && !KDCheckLinkSize(item, newRestraint, false, false)) return false;
	if (item && !KDCheckLinkTotal(item, newRestraint)) return false;
	if (oldRestraint && newRestraint && oldRestraint && oldRestraint.LinkableBy && newRestraint.shrine) {
		for (let l of oldRestraint.LinkableBy) {
			for (let s of newRestraint.shrine) {
				if (l == s) {
					return true;
				}
			}
		}
	}
	if (oldRestraint && newRestraint && oldRestraint && oldRestraint.Link) {
		if (newRestraint.name == oldRestraint.Link) return true;
	}
	return false;
}

/**
 * Checks if all the items linked under allow this item
 * @param {item} oldRestraint
 * @param {restraint} newRestraint
 * @returns {boolean}
 */
function KDCheckLinkTotal(oldRestraint, newRestraint) {
	if (KDRestraint(oldRestraint).Link && KDRestraint(oldRestraint).Link == newRestraint.name) {
		return true;
	}
	if (newRestraint.UnLink && oldRestraint.name == newRestraint.UnLink) {
		return true;
	}
	let link = oldRestraint;
	if (oldRestraint.linkCache) {
		for (let s of newRestraint.shrine) {
			if (oldRestraint.linkCache.includes(s)) return true;
		}
	}
	while (link) {
		let pass = false;
		let r = KDRestraint(link);
		if (r.LinkableBy && newRestraint.shrine) {
			for (let l of r.LinkableBy) {
				if (!pass)
					for (let s of newRestraint.shrine) {
						if (l == s) {
							pass = true;
						}
					}
			}
		}
		if (!pass) return false;
		link = link.dynamicLink;
	}
	return true;
}

/**
 * Gets the linkability cache
 * @param {item} restraint
 */
function KDUpdateLinkCaches(restraint) {
	let link = restraint;
	while (link) {
		link.linkCache = KDGetLinkCache(link);
		link = link.dynamicLink;
	}
}

/**
 * Gets the linkability cache
 * @param {item} restraint
 * @returns {string[]}
 */
function KDGetLinkCache(restraint) {
	let cache = Object.assign([], KDRestraint(restraint).LinkableBy);
	let link = restraint.dynamicLink;
	while (link) {
		let r = KDRestraint(link);
		if (r.LinkableBy) {
			for (let l of cache) {
				if (!r.LinkableBy.includes(l)) cache.splice(cache.indexOf(l), 1);
			}
		} else return [];
		link = link.dynamicLink;
	}
	return cache;
}

let KinkyDungeonRestraintAdded = false;
let KinkyDungeonCancelFlag = false;

/**
 * @param {restraint} restraint
 * @param {number} Tightness
 * @param {boolean} [Bypass]
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {boolean} [Link]
 * @param {boolean} [SwitchItems]
 * @param {KinkyDungeonEvent[]} [events]
 * @param {boolean} [Unlink]
 * @param {string} [faction]
 * @param {item} [dynamicLink]
 * @param {string} [Curse] - Curse to apply
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch messages
 * @returns
 */
function KinkyDungeonAddRestraint(restraint, Tightness, Bypass, Lock, Keep, Link, SwitchItems, events, faction, Unlink, dynamicLink, Curse, autoMessage = true) {
	KDDelayedActionPrune(["Restrain"]);
	KDStruggleGroupLinkIndex = {};
	let start = performance.now();
	let tight = (Tightness) ? Tightness : 0;
	let AssetGroup = restraint.AssetGroup ? restraint.AssetGroup : restraint.Group;
	if (restraint) {
		if (!KDGroupBlocked(restraint.Group, true) || Bypass) {
			KinkyDungeonEvasionPityModifier = 0;
			KinkyDungeonMiscastPityModifier = 0;
			let r = KinkyDungeonGetRestraintItem(restraint.Group);
			let linkable = !Unlink && (!Link && r && KinkyDungeonIsLinkable(KDRestraint(r), restraint, r));
			let linked = false;
			if (linkable) {
				linked = true;
				KinkyDungeonCancelFlag = KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse, autoMessage);
			}

			let eventsAdd = false;
			let oldevents = null;
			let prevR = null;

			// Some confusing stuff here to prevent recursion. If Link = true this means we are in the middle of linking, we dont want to do that
			if (!KinkyDungeonCancelFlag) {
				// We block events because there may be linking happening...
				KinkyDungeonRemoveRestraint(restraint.Group, Keep && !Link, Link || Unlink, undefined, undefined, r && r.dynamicLink && restraint.name == r.dynamicLink.name);

				let newR = KinkyDungeonGetRestraintItem(restraint.Group);
				// Run events AFTER
				if (r && r.events) {
					oldevents = r.events;
					eventsAdd = newR != undefined;
					prevR = r;
				}

				r = newR;
				//if (prevR.dynamicLink && KinkyDungeonIsLinkable(KDRestraint(prevR.dynamicLink), KDRestraint(r))) {
				////r.dynamicLink = prevR.dynamicLink;
				//KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep);
				//}
				KinkyDungeonCancelFlag = r != undefined;

			}



			let color = (typeof restraint.Color === "string") ? [restraint.Color] : restraint.Color;
			if (restraint.factionColor && faction && KinkyDungeonFactionColors[faction]) {
				for (let i = 0; i < restraint.factionColor.length; i++) {
					for (let n of restraint.factionColor[i]) {
						color[n] = KinkyDungeonFactionColors[faction][i]; // 0 is the primary color
					}
				}
			}

			// If we did not link an item (or unlink one) then we proceed as normal
			if (!KinkyDungeonCancelFlag) {
				KinkyDungeonRemoveRestraint(restraint.Group, Keep, false, undefined, undefined, r && r.dynamicLink&& restraint.name == r.dynamicLink.name);
				if (restraint.remove)
					for (let remove of restraint.remove) {
						InventoryRemove(KinkyDungeonPlayer, remove);
					}
				if (restraint.removeShrine)
					for (let remove of restraint.removeShrine) {
						for (let removeR of KinkyDungeonAllRestraint()) {
							let host = removeR;
							let link = removeR.dynamicLink;
							let iter = 0;
							while (link && iter < 100) {
								if (KDRestraint(link).shrine && KDRestraint(link).shrine.includes(remove)) {
									KinkyDungeonRemoveDynamicRestraint(host, Keep, false);
									host = removeR;
									link = removeR.dynamicLink;
								} else {
									host = link;
									link = link.dynamicLink;
								}
								iter += 1;
							}

							if (KDRestraint(removeR).shrine && KDRestraint(removeR).shrine.includes(remove)) {
								KinkyDungeonRemoveRestraint(KDRestraint(removeR).Group, Keep, false, false, false, false);
							}
						}
					}
				//KDInventoryWear(restraint.Asset, AssetGroup,  undefined, color);
				KinkyDungeonSendFloater({x: 1100, y: 600 - KDRecentRepIndex * 40}, `+${TextGet("Restraint" + restraint.name)}!`, "pink", 5, true);
				KDRecentRepIndex += 1;
				//let placed = InventoryGet(KinkyDungeonPlayer, AssetGroup);
				//let placedOnPlayer = false;
				//if (!placed) console.log(`Error placing ${restraint.name} on player!!!`);
				if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable() && !KinkyDungeonRestraintsLocked.includes(AssetGroup) && AssetGroup != "ItemHead" && InventoryAllow(
					Player, AssetGet("3DCGFemale", restraint.AssetGroup, restraint.Asset)) &&
					(!InventoryGetLock(InventoryGet(Player, AssetGroup))
					|| (InventoryGetLock(InventoryGet(Player, AssetGroup)).Asset.OwnerOnly == false && InventoryGetLock(InventoryGet(Player, AssetGroup)).Asset.LoverOnly == false))) {
					InventoryWear(Player, restraint.Asset, AssetGroup, color);
					//placedOnPlayer = true;
				}
				/*if (placed && !placed.Property) placed.Property = {};
				if (restraint.Type) {
					KinkyDungeonPlayer.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
					let options = window["Inventory" + ((AssetGroup.includes("ItemMouth")) ? "ItemMouth" : AssetGroup) + restraint.Asset + "Options"];
					if (!options) options = TypedItemDataLookup[`${AssetGroup}${restraint.Asset}`].options; // Try again
					const option = options.find(o => o.Name === restraint.Type);
					ExtendedItemSetType(KinkyDungeonPlayer, options, option);
					if (placedOnPlayer) {
						Player.FocusGroup = AssetGroupGet("Female3DCG", AssetGroup);
						ExtendedItemSetType(Player, options, option);
						Player.FocusGroup = null;
					}
					KinkyDungeonPlayer.FocusGroup = null;
				}
				if (restraint.Modules) {
					let data = ModularItemDataLookup[AssetGroup + restraint.Asset];
					let asset = data.asset;
					let modules = data.modules;
					// @ts-ignore
					InventoryGet(KinkyDungeonPlayer, AssetGroup).Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
					if (placedOnPlayer) {
						// @ts-ignore
						InventoryGet(Player, AssetGroup).Property = ModularItemMergeModuleValues({ asset, modules }, restraint.Modules);
					}
				}
				if (restraint.OverridePriority) {
					if (!InventoryGet(KinkyDungeonPlayer, AssetGroup).Property) InventoryGet(KinkyDungeonPlayer, AssetGroup).Property = {OverridePriority: restraint.OverridePriority};
					else InventoryGet(KinkyDungeonPlayer, AssetGroup).Property.OverridePriority = restraint.OverridePriority;
				}*/
				if (color) {
					// @ts-ignore
					//KDCharacterAppearanceSetColorForGroup(KinkyDungeonPlayer, color, AssetGroup);
					//if (placedOnPlayer)
					// @ts-ignore
					//KDCharacterAppearanceSetColorForGroup(Player, color, AssetGroup);
				}
				let item = {name: restraint.name, type: Restraint, curse: Curse, events:events ? events : Object.assign([], restraint.events), tightness: tight, lock: "", faction: faction, dynamicLink: dynamicLink };
				KinkyDungeonInventoryAdd(item);

				if (Curse && KDCurses[Curse] && KDCurses[Curse].onApply) {
					KDCurses[Curse].onApply(item, undefined);
				}

				if (Lock) KinkyDungeonLock(item, Lock);
				else if (restraint.DefaultLock && !Unlink) KinkyDungeonLock(item, KDProcessLock(restraint.DefaultLock));

				KDUpdateLinkCaches(item);
			} else if ((!Link && !linked) || SwitchItems) {
				KinkyDungeonCancelFlag = false;
				// Otherwise, if we did unlink an item, and we are not in the process of linking (very important to prevent loops)
				// Then we link the new item to the unlinked item if possible
				r = KinkyDungeonGetRestraintItem(restraint.Group);
				if (SwitchItems) {
					KinkyDungeonAddRestraintIfWeaker(restraint, Tightness, Bypass, Lock, Keep, false, undefined, faction, undefined, Curse);
				} else if (r && KDRestraint(r) && KinkyDungeonIsLinkable(KDRestraint(r), restraint, r)) {
					KinkyDungeonLinkItem(restraint, r, Tightness, Lock, Keep, faction, Curse);
				}
			}
			// Run events AFTER the swappen
			if (oldevents) {
				if (prevR.events) {
					for (let e of oldevents) {
						if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent("postRemoval", e, prevR, {item: prevR, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined});
						}
					}
				}
				KinkyDungeonSendEvent("postRemoval", {item: prevR, add: eventsAdd, keep: Keep, Link: Link, shrine: undefined});
			}
			KinkyDungeonCancelFlag = false;
		}

		//KinkyDungeonWearForcedClothes();

		KinkyDungeonPlayerTags = KinkyDungeonUpdateRestraints(); // We update the restraints but no time drain on batteries, etc

		KinkyDungeonCalculateSlowLevel();
		KinkyDungeonCheckClothesLoss = true; // We signal it is OK to check whether the player should get undressed due to restraints

		KinkyDungeonDressPlayer();
		KinkyDungeonMultiplayerInventoryFlag = true; // Signal that we can send the inventory now
		KinkyDungeonSleepTime = 0;
		KinkyDungeonUpdateStruggleGroups();
		if (!KinkyDungeonRestraintAdded) {
			KinkyDungeonRestraintAdded = true;
			let sfx = (restraint && restraint.sfx) ? restraint.sfx : "Struggle";
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/" + sfx + ".ogg");
		}
		let end = performance.now();
		if (KDDebug)
			console.log(`Took ${end - start} milliseconds to add restraint ${restraint.name}`);
		return Math.max(1, restraint.power);
	}
	return 0;
}

/**
 * It removes a restraint from the player
 * @param {string} Group - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [Add] - If true, this is part of the process of adding another item and should not trigger infinite recursion
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @param {boolean} [Shrine] - If the item is being removed from a shrine, this is true.
 * @param {boolean} [UnLink] - If the item is being removed as part of an unlinking process
 * @returns {boolean} true if the item was removed, false if it was not.
 */
function KinkyDungeonRemoveRestraint(Group, Keep, Add, NoEvent, Shrine, UnLink) {
	KDDelayedActionPrune(["Remove"]);
	KDStruggleGroupLinkIndex = {};
	for (let item of KinkyDungeonAllRestraint()) {
		const rest = KinkyDungeonRestraintsCache.get(item.name);
		if (rest.Group == Group) {
			let AssetGroup = rest && rest.AssetGroup ? rest.AssetGroup : Group;
			if (!NoEvent)
				KinkyDungeonSendEvent("remove", {item: rest, add: Add, keep: Keep, shrine: Shrine});

			if (!KinkyDungeonCancelFlag && !Add && !UnLink) {
				KinkyDungeonCancelFlag = KinkyDungeonUnLinkItem(item, Keep);
			}

			if (!KinkyDungeonCancelFlag) {
				if (ArcadeDeviousChallenge && KinkyDungeonDeviousDungeonAvailable() && !KinkyDungeonRestraintsLocked.includes(AssetGroup) && InventoryGet(Player, AssetGroup) &&
					(!InventoryGetLock(InventoryGet(Player, AssetGroup)) || (InventoryGetLock(InventoryGet(Player, AssetGroup))?.Asset.OwnerOnly == false && InventoryGetLock(InventoryGet(Player, Group))?.Asset.LoverOnly == false))
					&& Group != "ItemHead") {
					InventoryRemove(Player, AssetGroup);
					if (Group == "ItemNeck" && !Add) {
						InventoryRemove(Player, "ItemNeckAccessories");
						InventoryRemove(Player, "ItemNeckRestraints");
					}
				}

				if (rest.inventory && (Keep || ((rest.enchanted || rest.alwaysKeep) && !KinkyDungeonInventoryGetLoose(rest.inventoryAs|| rest.name)))) {
					if (rest.inventoryAs) {
						let origRestraint = KinkyDungeonGetRestraintByName(rest.inventoryAs);
						if (!KinkyDungeonInventoryGetLoose(origRestraint.name)) {
							KinkyDungeonInventoryAdd({name: origRestraint.name, type: LooseRestraint, events:origRestraint.events, quantity: 1});
						} else {
							if (!KinkyDungeonInventoryGetLoose(origRestraint.name).quantity) KinkyDungeonInventoryGetLoose(origRestraint.name).quantity = 0;
							KinkyDungeonInventoryGetLoose(origRestraint.name).quantity += 1;
						}
					} else {
						if (!KinkyDungeonInventoryGetLoose(rest.name)) {
							KinkyDungeonInventoryAdd({name: rest.name, type: LooseRestraint, events:rest.events, quantity: 1});
						} else {
							if (!KinkyDungeonInventoryGetLoose(rest.name).quantity) KinkyDungeonInventoryGetLoose(rest.name).quantity = 0;
							KinkyDungeonInventoryGetLoose(rest.name).quantity += 1;
						}

					}
				}

				InventoryRemove(KinkyDungeonPlayer, AssetGroup);

				for (let _item of KinkyDungeonInventory.get(Restraint).values()) {
					if (_item && KDRestraint(_item).Group == Group) {
						KinkyDungeonInventoryRemove(_item);
						break;
					}
				}


				if (rest.Group == "ItemNeck" && !Add && KinkyDungeonGetRestraintItem("ItemNeckRestraints")) KinkyDungeonRemoveRestraint("ItemNeckRestraints", KDRestraint(KinkyDungeonGetRestraintItem("ItemNeckRestraints")).inventory);

				if (!NoEvent) {
					if (rest.events) {
						for (let e of rest.events) {
							if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
								KinkyDungeonHandleInventoryEvent("postRemoval", e, rest, {item: rest, add: Add, keep: Keep, shrine: Shrine});
							}
						}
					}
					KinkyDungeonSendEvent("postRemoval", {item: rest, add: Add, keep: Keep, shrine: Shrine});
				}

				let sfx = (rest && rest.sfxRemove) ? rest.sfxRemove : "Struggle";
				if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/" + sfx + ".ogg");

				KinkyDungeonCalculateSlowLevel();
				KinkyDungeonCheckClothesLoss = true;
				KinkyDungeonDressPlayer();

				KinkyDungeonMultiplayerInventoryFlag = true;
				KinkyDungeonUpdateStruggleGroups();

			}
			KinkyDungeonCancelFlag = false;
			if (KinkyDungeonPlayerWeapon != KinkyDungeonPlayerWeaponLastEquipped && KinkyDungeonInventoryGet(KinkyDungeonPlayerWeaponLastEquipped)) {
				KDSetWeapon(KinkyDungeonPlayerWeaponLastEquipped);
			}
			return true;
		}
	}
	return false;
}

function KDIInsertRestraintUnderneath(restraint) {

	return false;
}

/**
 * It removes the item's dynamic link
 * @param {item} hostItem - The group of the item to remove.
 * @param {boolean} [Keep] - If true, the item will be kept in the player's inventory.
 * @param {boolean} [NoEvent] - If true, the item will not trigger any events.
 * @returns {boolean} true if the item was removed, false if it was not.
 */
function KinkyDungeonRemoveDynamicRestraint(hostItem, Keep, NoEvent) {
	let item = hostItem.dynamicLink;
	if (item) {
		const rest = KDRestraint(item);
		if (!NoEvent)
			KinkyDungeonSendEvent("remove", {item: rest, keep: Keep, shrine: false, dynamic: true});

		if (!KinkyDungeonCancelFlag) {
			if (rest.inventory && (Keep || rest.enchanted || rest.alwaysKeep) && !KinkyDungeonInventoryGetLoose(rest.name)) {
				if (rest.inventoryAs) {
					let origRestraint = KinkyDungeonGetRestraintByName(rest.inventoryAs);
					if (!KinkyDungeonInventoryGetLoose(origRestraint.name)) {
						KinkyDungeonInventoryAdd({name: origRestraint.name, type: LooseRestraint, events:origRestraint.events, quantity: 1});
					} else KinkyDungeonInventoryGetLoose(origRestraint.name).quantity += 1;
				} else KinkyDungeonInventoryAdd({name: rest.name, type: LooseRestraint, events:rest.events});
			}

			// Remove the item itself by unlinking it from the chain
			hostItem.dynamicLink = item.dynamicLink;
			let r = KinkyDungeonGetRestraintItem(KDRestraint(hostItem).Group);
			if (r) KDUpdateLinkCaches(r);

			if (!NoEvent) {
				if (rest.events) {
					for (let e of rest.events) {
						if (e.trigger == "postRemoval" && (!e.requireEnergy || ((!e.energyCost && KDGameData.AncientEnergyLevel > 0) || (e.energyCost && KDGameData.AncientEnergyLevel > e.energyCost)))) {
							KinkyDungeonHandleInventoryEvent("postRemoval", e, rest, {item: rest, keep: Keep, shrine: false, dynamic: true});
						}
					}
				}
				KinkyDungeonSendEvent("postRemoval", {item: rest, keep: Keep, shrine: false, dynamic: true});
			}

			let sfx = (rest && rest.sfxRemove) ? rest.sfxRemove : "Struggle";
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/" + sfx + ".ogg");

			KinkyDungeonCalculateSlowLevel();
			KinkyDungeonCheckClothesLoss = true;
			KinkyDungeonDressPlayer();

			KinkyDungeonMultiplayerInventoryFlag = true;
			KinkyDungeonUpdateStruggleGroups();
		}
		KinkyDungeonCancelFlag = false;
		return true;
	}
	return false;
}

/**
 * "Returns an array of all the shrine types that have at least one restraint item."
 *
 * The function takes one argument, `ShrineFilter`, which is an array of shrine types. If the argument is not provided, the
 * function will return all shrine types. If the argument is provided, the function will only return shrine types that are
 * in the argument
 * @param ShrineFilter - An array of strings, each string being the name of a shrine.
 * @returns An array of all the restraint types that can be used in the shrine.
 */
function KinkyDungeonRestraintTypes(ShrineFilter) {
	let ret = [];

	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).shrine) {
			for (let shrine of KDRestraint(inv).shrine) {
				if (ShrineFilter.includes(shrine) && !ret.includes(shrine)) ret.push(shrine);
			}
		}
	}

	return ret;
}


/**
 *
 * @param {restraint} newRestraint
 * @param {item} oldItem
 * @param {number} tightness
 * @param {string} [Lock]
 * @param {boolean} [Keep]
 * @param {string} [faction]
 * @param {string} [Curse]
 * @param {boolean} [autoMessage] - Whether or not to automatically dispatch a message
 * @returns {boolean}
 */
function KinkyDungeonLinkItem(newRestraint, oldItem, tightness, Lock, Keep, faction, Curse, autoMessage = true) {
	if (newRestraint && oldItem && oldItem.type == Restraint) {
		if (newRestraint) {
			KinkyDungeonAddRestraint(newRestraint, tightness, true, Lock, Keep, true, undefined, undefined, faction, undefined, oldItem, Curse);
			let newItem = KinkyDungeonGetRestraintItem(newRestraint.Group);
			if (newItem)
				newItem.dynamicLink = oldItem;
			if (newRestraint.UnLink && KDRestraint(oldItem).Link == newRestraint.name) {
				oldItem.name = newRestraint.UnLink;
				oldItem.events = Object.assign([], KDRestraint(oldItem).events);
			}
			KDUpdateLinkCaches(newItem);
			if (autoMessage && KDRestraint(oldItem).Link)
				KinkyDungeonSendTextMessage(7, TextGet("KinkyDungeonLink" + oldItem.name), "#ff0000", 2);
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {item} item
 * @param {boolean} Keep
 * @returns
 */
// @ts-ignore
function KinkyDungeonUnLinkItem(item, Keep, dynamic) {
	//if (!data.add && !data.shrine)
	if (item.type == Restraint) {
		/**
		 * @type {item}
		 */
		let UnLink = null;
		if (item.dynamicLink) {
			UnLink = item.dynamicLink;
		}
		if (UnLink) {
			let newRestraint = KinkyDungeonGetRestraintByName(UnLink.name);
			if (newRestraint) {
				KinkyDungeonAddRestraint(newRestraint, UnLink.tightness, true, UnLink.lock, Keep, undefined, undefined, undefined, UnLink.faction, true, UnLink.dynamicLink);

				KinkyDungeonSendEvent("postRemoval", {item: null, keep: Keep, shrine: false, Link: false, dynamic: true});
				if (KDRestraint(item).UnLink) {
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink" + item.name), "lightgreen", 2);
				} else
					KinkyDungeonSendTextMessage(3, TextGet("KinkyDungeonUnLink"), "lightgreen", 2);
				return true;
			}
		}
	}
	return false;
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {{aoe: number, number: number, dist: number, kind: string, duration?: number, durationExtra?: number}} options
 */
function KDCreateDebris(x, y, options) {
	let count = options.number ? options.number : 1;
	let rad = options.aoe ? options.aoe : 1.5;
	let minrad = options.dist;
	for (let i = 0; i < count; i++) {
		let slots = [];
		for (let X = -Math.ceil(rad); X <= Math.ceil(rad); X++)
			for (let Y = -Math.ceil(rad); Y <= Math.ceil(rad); Y++) {
				if (Math.sqrt(X*X+Y*Y) <= rad && (!minrad || Math.sqrt(X*X+Y*Y) >= minrad)) {
					if ((x + X > 0 && y + Y > 0 && x + X < KinkyDungeonGridWidth && y + Y < KinkyDungeonGridHeight)
						&& KinkyDungeonMovableTilesEnemy.includes(KinkyDungeonMapGet(x + X, y + Y)))
						slots.push({x:X, y:Y});
				}
			}

		if (slots.length > 0) {
			let slot = slots[Math.floor(KDRandom() * slots.length)];
			if (slot) {
				KDCreateEffectTile(x + slot.x, y + slot.y, {
					name: options.kind,
					duration: options.duration
				}, options.durationExtra || 0);
			}
		}

	}
}

/**
 *
 * @param {string} StruggleType
 * @param {item} restraint
 * @param {KDLockType} lockType
 * @param {number} index
 * @param {any} data
 * @param {item} host
 */
function KDSuccessRemove(StruggleType, restraint, lockType, index, data, host) {
	let progress = restraint.cutProgress ? restraint.cutProgress : 0;
	let destroyChance = (StruggleType == "Cut" || restraint.cutProgress) ? 1.0 : 0;
	if (restraint.struggleProgress && restraint.struggleProgress > 0) {
		progress += restraint.struggleProgress;
		destroyChance = restraint.cutProgress / progress;
	}
	let destroy = false;

	KinkyDungeonFastStruggleType = "";
	KinkyDungeonFastStruggleGroup = "";

	if (StruggleType == "Pick" || StruggleType == "Unlock") {
		if (StruggleType == "Unlock") {
			if (lockType && lockType.canUnlock(data)) {
				if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
					+ ((KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Unlock) ? KDRestraint(restraint).sfxFinishEscape.Unlock : "Unlock")
					+ ".ogg");
				KinkyDungeonRemoveKeysUnlock(restraint.lock);
				KinkyDungeonLock(restraint, "");
			}
		} else {
			if (KinkyDungeonSound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Unlock) ? KDRestraint(restraint).sfxFinishEscape.Unlock : "Unlock")
				+ ".ogg");
			KinkyDungeonLock(restraint, "");
		}
	} else {
		if (KinkyDungeonSound) {
			if (StruggleType == "Cut") AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Cut) ? KDRestraint(restraint).sfxFinishEscape.Cut : "Cut")
				+ ".ogg");
			else if (StruggleType == "Remove") AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Remove) ? KDRestraint(restraint).sfxFinishEscape.Remove : "Unbuckle")
				+ ".ogg");
			else AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
				+ ((KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Struggle) ? KDRestraint(restraint).sfxFinishEscape.Struggle : "Struggle")
				+ ".ogg");
		}
		if (KDRandom() < destroyChance) {
			KinkyDungeonSendTextMessage(9, TextGet("KinkyDungeonStruggleCutDestroy").replace("TargetRestraint", TextGet("Restraint" + restraint.name)), "#ff0000", 2);
			destroy = true;
		}
		let trap = restraint.trap;
		KDSendStatus('escape', restraint.name, StruggleType);
		if (KinkyDungeonSound && destroy) {
			if (KDRestraint(restraint).sfxFinishEscape && KDRestraint(restraint).sfxFinishEscape.Destroy) {
				AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "/Audio/"
					+ (KDRestraint(restraint).sfxFinishEscape.Destroy)
					+ ".ogg");
			}
		}
		if (index) {
			KinkyDungeonRemoveDynamicRestraint(host, (StruggleType != "Cut") || !destroy, false);
		} else {
			KinkyDungeonRemoveRestraint(KDRestraint(restraint).Group, (StruggleType != "Cut") || !destroy);
		}
		if (KinkyDungeonStatsChoice.get("FutileStruggles") && data.escapeChance < 0.25) KinkyDungeonChangeWill(KinkyDungeonStatWillCostEscape);
		else if (KinkyDungeonStatsChoice.get("SecondWind") && data.escapeChance < 0.25) KinkyDungeonChangeWill(KinkyDungeonStatWillBonusEscape);
		if (trap) {
			let summon = KinkyDungeonSummonEnemy(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, trap, 1, 2.5);
			if (summon) {
				KinkyDungeonSendTextMessage(10, TextGet("KinkyDungeonSummonTrapMonster"), "#ff0000", 2);
			}
		}
	}
	return destroy;
}

function KDAddDelayedStruggle(amount, time, StruggleType, struggleGroup, index, data, progress = 0, limit = 100) {
	let cur = progress;
	for (let t = 1; t <= time; t++) {
		let plus = amount/time * Math.max(0, 1 - (limit > 0 ? (cur / limit) : 1));
		if (plus > 0 && plus < 0.04) plus = 0.04;
		cur += plus;
		KDAddDelayedAction({
			commit: "Struggle",
			data: {
				group: struggleGroup,
				index: index,
				amount: plus,
				escapeData: data,
			},
			time: t,
			tags: ["Action", "Remove", "Restrain", "Hit"],
		});
	}
}