"use strict";

let KDMarketRateDecay = 0.95;

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
	"RemoveMagicLock": {
		valid: (player, item) => {
			if (!(item?.type == Restraint)) return false;
			return KDMagicLocks.includes(item.lock);
		},
		/** Happens when you click the button */
		click: (player, item) => {
			if (KDMagicLocks.includes(item.lock)) {
				KinkyDungeonLock(item, "");

				KinkyDungeonSendTextMessage(4, TextGet("KinkyDungeonPurpleLockRemove"), "#ffff00", 2);
				KinkyDungeonChangeMana(-KDGameData.InventoryActionManaCost || 0);
				if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Magic.ogg");

				KDGameData.InventoryAction = "";
				KinkyDungeonLastAction = "Cast";
				KinkyDungeonAdvanceTime(1, true, true);
			}
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (!KinkyDungeonHasMana(KDGameData.InventoryActionManaCost) || !(KinkyDungeonPlayerGetRestraintsWithLocks(KDMagicLocks).length > 0)) {
					return true;
				}
			}
			return false;
		},
	},
	"Offhand": {
		valid: (player, item) => {
			if (!(item?.type == Weapon && KDCanOffhand(item))) return false;
			return KinkyDungeonCanUseWeapon(false, undefined, KDWeapon(item));
		},
		/** Happens when you click the button */
		click: (player, item) => {
			KDGameData.Offhand = item.name;
			KDGameData.OffhandOld = item.name;
			KinkyDungeonAdvanceTime(1, true, true);
			KinkyDungeonDrawState = "Game";
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"Sell": {
		text:  (player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)
			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost((KDRestraint(item) ? item : undefined) || (KinkyDungeonFindConsumable(item.name) ? KinkyDungeonFindConsumable(item.name) : KinkyDungeonFindWeapon(item.name)), true, true));
			return TextGet("KDInventoryActionSell").replace("VLU", value + "");
		},
		valid: (player, item) => {
			return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let mult = 1;
			let quantity = 1;
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost((KDRestraint(item) ? item : undefined) || (KinkyDungeonFindConsumable(item.name) ? KinkyDungeonFindConsumable(item.name) : KinkyDungeonFindWeapon(item.name)), true, true));
			let itemInv = KinkyDungeonInventoryGet(item.name);
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -1);
			else if (itemInv.quantity > 1) itemInv.quantity -= 1;
			else KinkyDungeonInventoryRemove(itemInv);
			KinkyDungeonAddGold(value);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + 1;
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSell")
				.replace("ITM", TextGet( (itemInv.type == LooseRestraint ? "Restraint" : "KinkyDungeonInventoryItem") + item.name))
				.replace("VLU", "" + value)
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
					return true;
				}
			}
			return false;
		},
	},
	"SellBulk": {
		text:  (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost((KDRestraint(item) ? item : undefined) || (KinkyDungeonFindConsumable(item.name) ? KinkyDungeonFindConsumable(item.name) : KinkyDungeonFindWeapon(item.name)), true, true));
			return TextGet("KDInventoryActionSell").replace("VLU", value + "");
		},
		valid: (player, item) => {
			return item?.type == Weapon || item?.type == LooseRestraint || item?.type == Consumable;
		},
		/** Happens when you click the button */
		click: (player, item) => {
			let mult = 1;
			let quantity = ((item.quantity) ? item.quantity : 1);
			let quantitystart = 0;
			if (KDGameData.ItemsSold && KDGameData.ItemsSold[item.name]) {
				quantitystart = KDGameData.ItemsSold[item.name];
			}
			// Use partial sum formula (maths)

			mult = ((KDMarketRateDecay**(quantitystart + quantity) - 1))/(KDMarketRateDecay - 1) - ((KDMarketRateDecay**(quantitystart) - 1))/(KDMarketRateDecay - 1);
			let value = Math.round(mult * KDGameData.SellMarkup * KinkyDungeonItemCost((KDRestraint(item) ? item : undefined) || (KinkyDungeonFindConsumable(item.name) ? KinkyDungeonFindConsumable(item.name) : KinkyDungeonFindWeapon(item.name)), true, true));
			let itemInv = KinkyDungeonInventoryGet(item.name);
			if (itemInv.type == Consumable)
				KinkyDungeonChangeConsumable(KDConsumable(itemInv), -itemInv.quantity);
			else KinkyDungeonInventoryRemove(itemInv);
			if (!KDGameData.ItemsSold) KDGameData.ItemsSold = {};
			KDGameData.ItemsSold[item.name] = (KDGameData.ItemsSold[item.name] || 0) + quantity;
			KinkyDungeonAddGold(value);
			if (KDToggles.Sound) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/Coins.ogg");
			KinkyDungeonSendTextMessage(10, TextGet("KDSellBulk")
				.replace("ITM", TextGet( (itemInv.type == LooseRestraint ? "Restraint" : "KinkyDungeonInventoryItem") + item.name))
				.replace("VLU", "" + value)
				.replace("#", "" + (itemInv.quantity || 1))
			, "#ffffff", 2);
		},
		/** Return true to cancel it */
		cancel: (player, delta) => {
			if (delta > 0) {
				if (KinkyDungeonLastTurnAction) {
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
					KDTieUpEnemy(enemy, level*mult, type);
					KinkyDungeonSendTextMessage(10,
						TextGet("KDTieUpEnemy")
							.replace("RSTR", KDGetItemName(item))//TextGet("Restraint" + KDRestraint(item)?.name))
							.replace("ENNME", TextGet("Name" + enemy.Enemy.name))
							.replace("AMNT", "" + Math.round(100 * enemy.boundLevel / enemy.Enemy.maxhp)),
						"#ffffff", 1);
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