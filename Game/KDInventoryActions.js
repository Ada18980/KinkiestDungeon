"use strict";

/**
 * @type {Record<string, KDInventoryActionDef>}
 */
let KDInventoryAction = {
	"RemoveCurseOrHex": {
		valid: (player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel);
		},
		/** Happens when you click the button */
		click: (player, item) => {
			if (KDHasRemovableCurse(item, KDGameData.CurseLevel) || KDHasRemovableHex(item, KDGameData.CurseLevel)) {
				if (KDHasRemovableCurse(item, KDGameData.CurseLevel))
					item.curse = undefined;
				let removeHexes = {};
				for (let e of KDGetRemovableHex(item, KDGameData.CurseLevel)) {
					removeHexes[e.original] = true;
				}
				let newEvents = [];
				for (let event of item.events) {
					if (!event.original || !removeHexes[event.original]) newEvents.push(event);
				}
				item.events = newEvents;
				let transform = false;
				for (let event of newEvents) {
					if (event.trigger == "CurseTransform") transform = true;
				}
				if (!transform) {
					for (let event of newEvents) {
						if (event.trigger == "curseCount") {
							newEvents.splice(newEvents.indexOf(event), 1);
							break;
						}
					}
				}

				if (KDGetInventoryVariant(item)) {
					KDGetInventoryVariant(item).events = JSON.parse(JSON.stringify(item.events));
				}

				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Evil.ogg");

				if (KDGameData.UsingConsumable) {
					KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonInventoryItem" + KDGameData.UsingConsumable + "Use"), "#ff5555", 1, true);
					let con = KinkyDungeonInventoryGetConsumable(KDGameData.UsingConsumable);
					if (con) {
						if (con.quantity > 1) con.quantity -= 1;
						else {
							KDGameData.InventoryAction = "";
							KDGameData.UsingConsumable = "";
							KinkyDungeonInventoryRemove(con);
						}
					}
					KinkyDungeonLastAction = "";
					KinkyDungeonAdvanceTime(1, true, true);
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction
					|| !(KinkyDungeonAllRestraintDynamic().some((r) => {return KDHasRemovableCurse(r.item, KDGameData.CurseLevel) || KDHasRemovableHex(r.item, KDGameData.CurseLevel);}))) {
					KDGameData.UsingConsumable = "";
					return true;
				}
			}
			return false;
		},
	},
	"Bondage": {
		/** Returns if the button is greyed out */
		valid: (player, item) => {
			if (!(item?.type == LooseRestraint)) return false;
			if (KDRestraintSpecial(item) || KDRestraint(item).armor) return false;
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					return true;
				}
			}
			return false;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
			for (let enemy of nearby) {
				if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
					let level = KDRestraint(item).power;
					let type = KDRestraintBondageType(item);
					let status = KDRestraintBondageStatus(item);
					let mult = (KDSpecialBondage[type]) ? (KDSpecialBondage[type].enemyBondageMult || 1) : 1;
					KDTieUpEnemy(enemy, level*mult, type); // TODO
					if (status.belt) {
						KinkyDungeonApplyBuffToEntity(enemy, KDChastity, {});
					}
					if (status.toy) {
						KinkyDungeonApplyBuffToEntity(enemy, KDToy, {});
					}
					if (status.plug) {
						KinkyDungeonApplyBuffToEntity(enemy, KDEntityBuffedStat(enemy, "Plug") > 0 ? KDDoublePlugged : KDPlugged, {});
					}
					if (status.blind) {
						enemy.blind = Math.max(enemy.blind || 0, status.blind);
					}
					if (status.silence) {
						enemy.silence = Math.max(enemy.silence || 0, status.silence);
					}
					if (status.bind) {
						enemy.bind = Math.max(enemy.bind || 0, status.bind);
					}
					if (status.slow) {
						enemy.slow = Math.max(enemy.slow || 0, status.slow);
					}
					if (status.disarm) {
						enemy.disarm = Math.max(enemy.disarm || 0, status.disarm);
					}

					if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/LockLight.ogg");

					if (item.quantity > 1) item.quantity -= 1;
					else KinkyDungeonInventoryRemove(item);
					KinkyDungeonAdvanceTime(1, true, true);

					break;
				}
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				let nearby = KDNearbyEnemies(player.x, player.y, 1.5);
				for (let enemy of nearby) {
					if (enemy.id == KDGameData.BondageTarget && (KinkyDungeonIsDisabled(enemy) || (enemy.playWithPlayer && KDCanDom(enemy)))) {
						return false;
					}
				}
				return true;
			}
			return false;
		},
	},
};