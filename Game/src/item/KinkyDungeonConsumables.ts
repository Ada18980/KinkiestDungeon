"use strict";

interface ItemEffect {
	name: string,
	range?: number,
	components: string[],
	onUse: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	onMiscast: (result: ItemEffectResult, item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	onFailure: (result: ItemEffectResult, item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemEffectResult,
	canAttempt: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => boolean,
	onAttempt: (item: item, quantity: number, user: entity, target: entity, tx: number, ty: number) => ItemAttemptResult,
	delayedTags?: string[],
}

interface ItemEffectResult {
	/** Whether it succeeded or not */
	success: boolean,
	/** Which component failed */
	componentfailure: string,
	/** Potions with a 'miscast' effect have a flag that is true if they miscasted */
	miscast: boolean,
	/** list of entities affected by the potion */
	affected: entity[],
	/** quantity consumed */
	consumed: number,
	/** timetodo */
	time: number,
}

interface ItemAttemptResult {
	/** Whether it succeeded or not */
	success: boolean,
	/** Which component failed */
	componentfailure: string,
	/** Chance of failure */
	failureChance: number,
	/** Chance of miscast on a success */
	miscastChance: number,
	/** Can force a miscast on an attempt, for example an item might force potions to fail */
	miscast: boolean,
	/** timetodo */
	time: number,
	/** delayed action */
	delayed?: boolean,
	quantity: number,
}

/**
 * @param item
 */
function KDConsumable(item: Named): consumable {
	return KinkyDungeonConsumables[item.name];
}

function KinkyDungeonFindConsumable(Name: string): consumable {
	for (let con of Object.values(KinkyDungeonConsumables)) {
		if (con.name == Name) return con;
	}
	return undefined;
}

/** Returns an abbreviated consumable.  */
function KinkyDungeonFindBasic(Name: string): any {
	for (let con of Object.values(KinkyDungneonBasic)) {
		if (con.name == Name) return con;
	}
	return undefined;
}

function KinkyDungeonFindConsumableOrBasic(Name: string): consumable | any {
	for (let con of Object.values(KinkyDungeonConsumables)) {
		if (con.name == Name) return con;
	}

	for (let con of Object.values(KinkyDungneonBasic)) {
		if (con.name == Name) return con;
	}
	return undefined;
}

function KinkyDungeonGetInventoryItem(Name: string, Filter: string = Consumable): itemPreviewEntry {
	let Filtered = KinkyDungeonFilterInventory(Filter);
	for (let item of Filtered) {
		if (item.name == Name) return item;
	}
	return null;
}

function KinkyDungeonConsumableCount(Name: string): number {
	if (KinkyDungeonInventoryGet(Name)) {
		if (KinkyDungeonInventoryGet(Name).quantity == undefined) return 1;
		else return KinkyDungeonInventoryGet(Name).quantity;
	}
	let item = KinkyDungeonGetInventoryItem(Name, Consumable);
	if (item && item.item && item.item.quantity) {
		return item.item.quantity;
	}
	return 0;
}

function KinkyDungeonItemCount(Name: string): number {
	if (KinkyDungeonInventoryGet(Name)) {
		if (KinkyDungeonInventoryGet(Name).quantity == undefined) return 1;
		else return KinkyDungeonInventoryGet(Name).quantity;
	}
	let item = KinkyDungeonGetInventoryItem(Name);
	if (item && item.item && item.item.quantity) {
		return item.item.quantity;
	}
	return 0;
}

function KinkyDungeonGetShopItem(_Level: number, Rarity: number, _Shop: boolean, ShopItems: any[], uniqueTags: Record<string, boolean> = {}) {
	let Table = [];
	let params = KinkyDungeonMapParams[(KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint)];
	if (params.ShopExclusives) {
		for (let exc of params.ShopExclusives) {
			Table.push(exc);
		}
	}
	if (KinkyDungeonStatsChoice.get('arousalMode')) {
		if (params.ShopExclusivesArousal) {
			for (let exc of params.ShopExclusivesArousal) {
				Table.push(exc);
			}
		}
	}
	let Shopable: Record<string, any> = Object.entries(KinkyDungeonConsumables).filter(([_k, v]) => (v.shop));
	for (let S = 0; S < Shopable.length; S++) {
		let s = Shopable[S][1];
		s.shoptype = Consumable;
		if ((KinkyDungeonStatsChoice.get('arousalMode') || !KinkyDungeonConsumables[s.name].arousalMode))
			Table.push(s);
	}
	Shopable = Object.entries(KinkyDungneonBasic).filter(([_k, v]) => (v.shop));
	for (let S = 0; S < Shopable.length; S++) {
		let s = Shopable[S][1];
		s.shoptype = "basic";
		if ((!s.ignoreInventory || !KinkyDungeonInventoryGet(s.ignoreInventory)) && (KinkyDungeonStatsChoice.get('arousalMode') || !s.arousalMode))
			Table.push(s);
	}
	Shopable = Object.entries(KinkyDungneonShopRestraints).filter(([_k, v]) => (v.shop));
	for (let S = 0; S < Shopable.length; S++) {
		let s = Shopable[S][1];
		s.shoptype = LooseRestraint;
		if (!KinkyDungeonInventoryGet(s.name) && (KinkyDungeonStatsChoice.get('arousalMode') || !s.arousalMode))
			Table.push(s);
	}
	Shopable = Object.entries(KinkyDungeonWeapons).filter(([_k, v]) => (v.shop));
	for (let S = 0; S < Shopable.length; S++) {
		let s = Shopable[S][1];
		s.shoptype = Weapon;
		if (!KinkyDungeonInventoryGet(s.name) && (KinkyDungeonStatsChoice.get('arousalMode') || !KinkyDungeonWeapons[s.name].arousalMode))
			Table.push(s);
	}

	// No duplicates or uniqueTag dupes
	for (let R = Rarity; R >= 0; R--) {
		let available = Table.filter((item) => (item.rarity == R && !ShopItems.some((item2) => {return item2.name == item.name;})));
		available = available.filter((item) => {

			return !item.uniqueTags || !item.uniqueTags.some((t: string) => {return uniqueTags[t];});
		});
		if (available.length > 0) return available[Math.floor(KDRandom() * available.length)];
	}
	return null;
}


interface KDChangeConsumableData {
	src: string,
	type: string,
	trig: string,
	item: item,
	consumable: consumable,
	Quantity: number,
	container?: KDContainer,
	cancel: boolean,
}

/**
 * @param consumable
 * @param Quantity
 */
function KDChangeConsumable(src: string, type: string, trig: string,
	consumable: consumable, Quantity: number, container?: KDContainer): boolean {
	let item = container ? container.items[consumable.name] : KinkyDungeonInventoryGetConsumable(consumable.name);

	let data: KDChangeConsumableData = {
		src: src,
		type: type,
		trig: trig,
		item: item,
		consumable: consumable,
		Quantity: Quantity,
		container: container,
		cancel: false,
	}

	KinkyDungeonSendEvent("changeconsumable", data);

	if (data.cancel) return false;

	consumable = data.consumable;
	Quantity = data.Quantity;
	container = data.container;
	src = data.src;
	type = data.type;
	trig = data.trig;
	item = data.item;

	let before = KinkyDungeonItemCount(consumable.name);

	if (item) {
		item.quantity = (item.quantity || 1) + Quantity;
		if (item.quantity <= 0) {
			if (container)
				delete container.items[consumable.name]
			else
				KinkyDungeonInventoryRemove(item);
		}

		if (KDToggles.InvLimit && !container) {
			let after = KinkyDungeonItemCount(consumable.name);
			if (after > before) {
				let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
				if (after > max) {
					KinkyDungeonInventoryGet(consumable.name).quantity = max;
					KDAddConsumable(consumable.name, after - max, KDGetContainer(
						"PlayerChest", undefined, undefined, true, KDPlayerChestFilters
					));
					KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
						.replace("${Item}", KDGetItemNameString(consumable.name))
						.replace("${Count}", "" + (after - max))
					, KDBaseWhite, 1);
				}
			}

		}


		return true;
	}

	if (Quantity >= 0) {
		if (container) {
			container.items[consumable.name] = {name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity};
		} else {
			KinkyDungeonInventoryAdd({name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity});
		}

		if (KDToggles.InvLimit && !container) {
			let after = KinkyDungeonItemCount(consumable.name);
			if (after > before) {
				let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
				if (after > max) {
					KinkyDungeonInventoryGet(consumable.name).quantity = max;
					KDAddConsumable(consumable.name, after - max, KDGetContainer(
						"PlayerChest", undefined, undefined, true, KDPlayerChestFilters
					));
					KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
						.replace("${Item}", KDGetItemNameString(consumable.name))
						.replace("${Count}", "" + (after - max))
					, KDBaseWhite, 1);
				}
			}

		}


		return true;
	}

	return false;
}


/**
 * @deprecated
 * @param consumable
 * @param Quantity
 */
function KinkyDungeonChangeConsumable(consumable: consumable, Quantity: number, container?: KDContainer): boolean {
	let item = container ? container.items[consumable.name] : KinkyDungeonInventoryGetConsumable(consumable.name);

	let data: KDChangeConsumableData = {
		src: "",
		type: "",
		trig: "",
		item: item,
		consumable: consumable,
		Quantity: Quantity,
		container: container,
		cancel: false,
	}

	KinkyDungeonSendEvent("changeconsumable", data);

	if (data.cancel) return false;

	consumable = data.consumable;
	Quantity = data.Quantity;
	container = data.container;
	item = data.item;

	let before = KinkyDungeonItemCount(consumable.name);

	if (item) {
		item.quantity = (item.quantity || 1) + Quantity;
		if (item.quantity <= 0) {
			if (container)
				delete container.items[consumable.name]
			else
				KinkyDungeonInventoryRemove(item);
		}

		if (KDToggles.InvLimit && !container) {
			let after = KinkyDungeonItemCount(consumable.name);
			if (after > before) {
				let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
				if (after > max) {
					KinkyDungeonInventoryGet(consumable.name).quantity = max;
					KDAddConsumable(consumable.name, after - max, KDGetContainer(
						"PlayerChest", undefined, undefined, true, KDPlayerChestFilters
					));
					KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
						.replace("${Item}", KDGetItemNameString(consumable.name))
						.replace("${Count}", "" + (after - max))
					, KDBaseWhite, 1);
				}
			}

		}

		return true;
	}



	if (Quantity >= 0) {
		if (container) {
			container.items[consumable.name] = {name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity};
		} else {
			KinkyDungeonInventoryAdd({name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity});
		}



		if (KDToggles.InvLimit && !container) {
			let after = KinkyDungeonItemCount(consumable.name);
			if (after > before) {
				let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(consumable.name), KDPlayer());
				if (after > max) {
					KinkyDungeonInventoryGet(consumable.name).quantity = max;
					KDAddConsumable(consumable.name, after - max, KDGetContainer(
						"PlayerChest", undefined, undefined, true, KDPlayerChestFilters
					));
					KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
						.replace("${Item}", KDGetItemNameString(consumable.name))
						.replace("${Count}", "" + (after - max))
					, KDBaseWhite, 1);
				}
			}

		}

	}

	return false;
}

/**
 * @param name
 * @param Quantity
 */
function KDAddConsumable(name: string, Quantity: number, container?: KDContainer): boolean {
	let item = container ? container.items[name] : KinkyDungeonInventoryGetConsumable(name);
	if (item) {
		item.quantity = (item.quantity || 1) + Quantity;
		if (item.quantity <= 0) {
			if (container)
				delete container.items[name]
			else
				KinkyDungeonInventoryRemove(item);
		}
		return true;
	}

	let before = KinkyDungeonItemCount(name);

	if (Quantity > 0) {
		if (container) {
			container.items[name] = {name: name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity};
		} else {
			KinkyDungeonInventoryAdd({name: name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity});
		}
	}


	if (KDToggles.InvLimit && !container) {
		let after = KinkyDungeonItemCount(name);
		if (after > before) {
			let max = KDMaxInventoryStorage(KinkyDungeonInventoryGet(name), KDPlayer());
			if (after > max) {
				KinkyDungeonInventoryGet(name).quantity = max;
				KDAddConsumable(name, after - max, KDGetContainer(
					"PlayerChest", undefined, undefined, true, KDPlayerChestFilters
				));
				KinkyDungeonSendTextMessage(8, TextGet("KDMovedToStorage")
					.replace("${Item}", KDGetItemNameString(name))
					.replace("${Count}", "" + (after - max))
				, KDBaseWhite, 1);
			}
		}

	}

	return false;
}

function KinkyDungeonConsumableEffect(Consumable: consumable, type: string, inv: item) {
	if (!type) type = Consumable.type;

	if (KDConsumableEffects[type]) {
		KDConsumableEffects[type](Consumable, KDPlayer(), inv);
	} else if (type == "spell") {
		KinkyDungeonCastSpell(KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y, KinkyDungeonFindSpell(Consumable.spell, true), undefined, undefined, undefined);
		KDStunTurns(1, true);
	} else if (type == "targetspell") {
		KDCloseQuickInv();
		if (KinkyDungeonDrawState == "Inventory") KinkyDungeonDrawState = "Game";
		KinkyDungeonTargetingSpell = KinkyDungeonFindSpell(Consumable.spell, true);
		KinkyDungeonTargetingSpellItem = Consumable;
		KinkyDungeonTargetingSpellWeapon = null;
	} else if (type == "charge") {
		KDChangeCharge(Consumable.name, type, "consumable", Consumable.amount);
		//KDGameData.AncientEnergyLevel = Math.min(Math.max(0, KDGameData.AncientEnergyLevel + Consumable.amount), 1.0);
		if (!KinkyDungeonStatsChoice.get("LostTechnology"))
			KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSourceSpent, 1);
	} else if (type == "buff") {
		KinkyDungeonApplyBuffToEntity(KinkyDungeonPlayerEntity, {id: Consumable.name, type: Consumable.buff, power: Consumable.power, duration: Consumable.duration, aura: Consumable.aura});
	} else if (type == "recharge") {
		//KinkyDungeonChangeConsumable(KinkyDungeonConsumables.AncientPowerSource, 1);
		//KinkyDungeonAddGold(-Consumable.rechargeCost);
		//KDStunTurns(1);
	} else if (type == "shrineRemove") {
		KinkyDungeonRemoveRestraintsWithShrine(Consumable.shrine);
		KDStunTurns(1, true);
	} else if (type == "goldKey") {
		for (let r of KinkyDungeonPlayerGetRestraintsWithLocks(["Gold"])) {
			KinkyDungeonLock(r, "Blue");
		}
	}
}

function KinkyDungeonConsumableEffectNPC(Consumable: consumable, entity: entity, type: string, inv: item) {
	if (!type) type = Consumable.type;

	if (KDConsumableEffects[type]) {
		KDConsumableEffects[type](Consumable, entity, inv);
	}
}



function KinkyDungeonPotionCollar() {
	for (let r of KinkyDungeonAllRestraintDynamic()) {
		if (KDRestraint(r.item).potionCollar) return true;
	}
	return false;
}

function KinkyDungeonCanDrink(byEnemy?: boolean, strict?: boolean): boolean {
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).allowPotions) return true;
	}
	if (KDGroupBlocked("ItemMouth", byEnemy)) return false;
	return KinkyDungeonCanTalk(!strict);
}

function KinkyDungeonAttemptConsumable(Name: any, Quantity: number, target: entity = null, tx: number = 0, ty: number = 0): boolean {
	if (KDGameData.SleepTurns > 0 || KDGameData.SlowMoveTurns > 0) return false;
	let item = KinkyDungeonGetInventoryItem(Name, Consumable);
	if (!item) return false;
	let itemEffect = KDConsumable(item.item).itemEffect;

	if (itemEffect) {
		// Use new itemEffect API
		let effect = KDItemEffects[itemEffect];
		if (effect.canAttempt(item.item, Quantity, KDPlayer(), target, tx, ty)) {

			let res = effect.onAttempt(item.item, Quantity, KDPlayer(), target, tx, ty);
			if (res.success) {
				if (res.delayed && res.time > 0) {
					let maxtime = KDConsumable(item.item).delay || 2;
					for (let i = 1; i <= maxtime; i++)
						KDAddDelayedAction({
							commit: i == maxtime ? "ConsumableEffect" : undefined,
							update: i < maxtime ? "ConsumableEffect" : undefined,
							data: {
								Name: Name,
								Quantity: Quantity,
								id: target?.id,
								tX: tx,
								tY: ty,
								noAggro: false,
								itemEffect: itemEffect,
							},
							time: i,
							tick: i - 1,
							maxtime: maxtime,
							tags: effect.delayedTags || ["Action", "Remove", "Restrain"],
						});
					KDDelayedActionStart();
					//KDStunTurns(KDConsumable(item.item).delay || 2, true);
				} else {
					let res2 = effect.onUse(item.item, Quantity, KDPlayer(), target, tx, ty);
					if (res2.miscast) {
						effect.onMiscast(res2, item.item, Quantity, KDPlayer(), target, tx, ty);
					} else if (!res2.success) {
						effect.onFailure(res2, item.item, Quantity, KDPlayer(), target, tx, ty);
					}
					return true;
				}
				return false;
			}

			return false;

		} else return false;
	}

	if (KDConsumable(item.item).prereq && KDConsumablePrereq[KDConsumable(item.item).prereq]) {
		if (KDConsumablePrereq[KDConsumable(item.item).prereq](item.item, Quantity)) {
			KinkyDungeonUseConsumable(Name, Quantity);
			return true;
		} else return false;
	}

	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "unusuable") {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnusable"), KDBaseRed, 1);
		return false;
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "goldKey") {
		if (KinkyDungeonPlayerGetRestraintsWithLocks(["Gold"]).length == 0) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonMistressKeyFail"), KDBaseRed, 1);
			return false;
		}
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "charge" && KDGameData.AncientEnergyLevel >= 1) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFullpower"), KDBaseRed, 1);
		return false;
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "recharge") {
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonInventoryItemAncientPowerSourceSpentUseFail"), KDBaseRed, 1);
		return false;
	}

	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "shrineRemove" && KinkyDungeonGetRestraintsWithShrine(KDConsumable(item.item).shrine).length < 1) {
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonNoItemToRemove"), "pink", 1);
		return false;
	}

	let needMouth = item.item && KDConsumable(item.item) && ((KDConsumable(item.item).potion && !KDConsumable(item.item).gagFloor) || KDConsumable(item.item).needMouth);
	let needArms = !(item.item && KDConsumable(item.item) && KDConsumable(item.item).noHands);
	let strictness = KinkyDungeonStrictness(false, "ItemHands");
	let maxStrictness = (item.item && KDConsumable(item.item) && KDConsumable(item.item).maxStrictness) ? KDConsumable(item.item).maxStrictness : 1000;

	if (needMouth && ((!KDConsumable(item.item).potion && ((KDConsumable(item.item).gagMax &&
		KinkyDungeonGagTotal() > KDConsumable(item.item).gagMax) || (!KDConsumable(item.item).gagMax && !KinkyDungeonCanTalk(true))))
		|| (KDConsumable(item.item).potion && !KinkyDungeonCanDrink()))) {
		let allowPotions = KinkyDungeonPotionCollar();
		if (KDConsumable(item.item).potion && allowPotions) {
			//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
		} else {
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), KDBaseRed, 1);

			KDResetAlternateInventoryRender();
			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();

			return false;
		}
	}
	if (!(KinkyDungeonHasHelp())
		&& needArms
		&& !KinkyDungeonStatsChoice.get("Psychic")
		&& !(item.item && KDConsumable(item.item).potion
			&& !KinkyDungeonIsArmsBound()
			&& (!KinkyDungeonStatsChoice.has("WeakGrip")
				|| !KinkyDungeonIsHandsBound(false, false)))
		&& (KinkyDungeonIsHandsBound(false, true)
			|| (KinkyDungeonStatsChoice.has("WeakGrip")
					&& item.item
					&& KDConsumable(item.item).potion))
		&& !KinkyDungeonCanUseFeet()) {
		let allowPotions = KinkyDungeonPotionCollar();
		let nohands = KinkyDungeonIsHandsBound(false, true);
		let failmsg = "KinkyDungeonCantUsePotions";
		if (!nohands && !KinkyDungeonCanDrink(false, true)) {
			failmsg = "KinkyDungeonCantUsePotionsKneelNoMouth";
			nohands = true;
		}

		if (KDConsumable(item.item).potion && allowPotions) {
			//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
		} else if (!nohands && KinkyDungeonCanKneel() && KDGameData.KneelTurns < 1) {
			if (!KDGameData.KneelTurns) KDGameData.KneelTurns = 2;
			else KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, 2);
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsKneel"), "#e7cf1a", 1);

			KDResetAlternateInventoryRender();
			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KinkyDungeonAdvanceTime(1, true, true);

			return false;
		} else if (nohands || KDGameData.KneelTurns < 1) {
			//KinkyDungeonAdvanceTime(1);
			KinkyDungeonSendActionMessage(7, TextGet(failmsg), KDBaseRed, 1);

			KDResetAlternateInventoryRender();
			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			return false;
		}
	}

	if (strictness >= maxStrictness) {
		//KinkyDungeonAdvanceTime(1);
		KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsStrict"), KDBaseRed, 1);

		KDResetAlternateInventoryRender();
		if (KinkyDungeonTextMessageTime > 0)
			KinkyDungeonDrawState = "Game";


		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return false;
	}

	if (KDConsumable(item.item).postreq && KDConsumablePrereq[KDConsumable(item.item).postreq]) {
		if (KDConsumablePrereq[KDConsumable(item.item).postreq](item.item, Quantity)) {
			KDDelayedActionPrune(["Action", "Consume"]);
			if (KDConsumable(item.item).delay || (KDConsumable(item.item).potion && KinkyDungeonStatsChoice.has("SavourTheTaste"))) {
				let maxtime = KDConsumable(item.item).delay || 2;
				for (let i = 1; i <= maxtime; i++)
					KDAddDelayedAction({
						commit: i == maxtime ? "Consumable" : undefined,
						update: i < maxtime ? "Consumable" : undefined,
						data: {
							Name: Name,
							Quantity: Quantity,
						},
						time: i,
						tick: i - 1,
						maxtime: maxtime,
						tags: ["Action", "Remove", "Restrain"],
					});
				KDDelayedActionStart();
				//KDStunTurns(KDConsumable(item.item).delay || 2, true);
			} else KinkyDungeonUseConsumable(Name, Quantity);
			return true;
		} else return false;
	}
	KDDelayedActionPrune(["Action", "Consume"]);
	if (KDConsumable(item.item).delay || (KDConsumable(item.item).potion && KinkyDungeonStatsChoice.has("SavourTheTaste"))) {
		let maxtime = KDConsumable(item.item).delay || 2;
		for (let i = 1; i <= maxtime; i++)
			KDAddDelayedAction({
				commit: i == maxtime ? "Consumable" : undefined,
				update: i < maxtime ? "Consumable" : undefined,
				data: {
					Name: Name,
					Quantity: Quantity,
				},
				time: i,
				tick: i - 1,
				maxtime: maxtime,
				tags: ["Action", "Remove", "Restrain"],
			});

		KDDelayedActionStart();
		//KDStunTurns(KDConsumable(item.item).delay || 2, true);
	} else KinkyDungeonUseConsumable(Name, Quantity);
	return true;
}

function KinkyDungeonUseConsumable(Name: string, Quantity: number): boolean {
	let item = KinkyDungeonGetInventoryItem(Name, Consumable);
	if (!item || item.item.quantity < Quantity) return false;

	for (let I = 0; I < Quantity; I++) {
		KinkyDungeonConsumableEffect(KDConsumable(item.item), "", item.item);
		if (KDConsumable(item.item).sideEffects) {
			for (let effect of KDConsumable(item.item).sideEffects) {
				KinkyDungeonConsumableEffect(KDConsumable(item.item), effect, item.item);
			}
		}
	}
	if (!KDConsumable(item.item).noConsumeOnUse)
		KinkyDungeonChangeConsumable(KDConsumable(item.item), -(KDConsumable(item.item).useQuantity ? KDConsumable(item.item).useQuantity : 1) * Quantity);

	if (KinkyDungeonConsumableVariants[item.item.inventoryVariant || item.item.name]) {
		if (!KDGameData.IdentifiedObj) KDGameData.IdentifiedObj = {};
		KDGameData.IdentifiedObj[item.item.inventoryVariant || item.item.name] = 2;
	}
	KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonInventoryItem" + Name + "Use"), KDBaseMint, 1);
	if (KDConsumable(item.item).sfx) {
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + KDConsumable(item.item).sfx + ".ogg");
	}
	return true;
}


function KDGetCheapestLatexSolvent(tag: string = "latexsolvent"): string {
	let cheapest = "";
	let cheapestcost = -1000;
	for (let c of KinkyDungeonAllConsumable()) {
		if (KDConsumable(c) && KDConsumable(c)[tag]
			&& (cheapestcost == -1000 || KDConsumable(c)[tag] < cheapestcost)) {
				cheapest = c.inventoryVariant || c.name;
				cheapestcost = KDConsumable(c)[tag]
		}
	}

	return cheapest;
}

let KDItemEffects: Record<string, ItemEffect> = {

}

function KDGetGagMult(Consumable: consumable, entity: entity, msg: boolean) {
	if (entity == KDPlayer()) {
		let gagFloor = Consumable.gagFloor ? Consumable.gagFloor : 0;
		let gagMult = (Consumable.potion && gagFloor != 1.0) ? Math.max(0, gagFloor + (1 - gagFloor) * (1 - Math.max(0, Math.min(1.0, KinkyDungeonGagTotal(true))))) : 1.0;
		if (msg && gagMult < 0.999) {
			KinkyDungeonSendTextMessage(8, TextGet("KinkyDungeonConsumableLessEffective"), KDBaseRed, 2);
		}
		return {gagFloor, gagMult};
	}

	return {gagFloor: undefined, gagMult: 0};
}

function KDTargetConsumable(inv: item, Quantity: number, itemEffect?: string): ItemEffectResult {
	let Consumable = KDConsumable(inv);
	if (!Consumable) return;
	let range = KDGetPotionRange(inv, itemEffect);
	KDCloseQuickInv();
	if (KinkyDungeonDrawState == "Inventory") {
		KinkyDungeonDrawState = "Game";
		KDResetAlternateInventoryRender();
	}
	KinkyDungeonTargetingSpell =
		{name: "useConsumable", components: [], level:1, type:"special", special: "useConsumable", noMiscast: true, manacost: 0,
			quantity: Quantity, itemEffect: itemEffect,
			noconsume: true, // needed as the ItemEffect code handles this
			onhit:"", time:25, power: 0, range: range != undefined ? range : Consumable.range, size: 1, damage: ""};;
	KinkyDungeonTargetingSpellItem = Consumable;
	KinkyDungeonTargetingSpellWeapon = null;
	return {
		success: true,
		componentfailure: "",
		miscast: false,
		affected: [],
		consumed: 0,
		time: 0,
	};
}

function KDStandardConsumableHandsCheck(item: item, Quantity: number): boolean {
	let needArms = !(item && KDConsumable(item) && KDConsumable(item).noHands);
	let strictness = KinkyDungeonStrictness(false, "ItemHands");
	let maxStrictness = (item && KDConsumable(item) && KDConsumable(item).maxStrictness) ? KDConsumable(item).maxStrictness : 1000;


	if (!(KinkyDungeonHasHelp())
		&& needArms
		&& !KinkyDungeonStatsChoice.get("Psychic")
		&& !(item && KDConsumable(item).potion
			&& !KinkyDungeonIsArmsBound()
			&& (!KinkyDungeonStatsChoice.has("WeakGrip")
				|| !KinkyDungeonIsHandsBound(false, false)))
		&& (KinkyDungeonIsHandsBound(false, true)
			|| (KinkyDungeonStatsChoice.has("WeakGrip")
			&& item
			&& KDConsumable(item).potion))
		&& !KinkyDungeonCanUseFeet()) {
		let allowPotions = KinkyDungeonPotionCollar();
		let nohands = KinkyDungeonIsHandsBound(false, true);
		let failmsg = "KinkyDungeonCantUsePotions";
		if (!nohands && !KinkyDungeonCanDrink(false, true)) {
			failmsg = "KinkyDungeonCantUsePotionsKneelNoMouth";
			nohands = true;
		}

		if (KDConsumable(item).potion && allowPotions) {
			//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
		} else if (!nohands && KinkyDungeonCanKneel() && KDGameData.KneelTurns < 1) {
			if (!KDGameData.KneelTurns) KDGameData.KneelTurns = 2;
			else KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, 2);
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsKneel"), "#e7cf1a", 1);

			KDResetAlternateInventoryRender();
			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KinkyDungeonAdvanceTime(1, true, true);

			return false;
		} else if (nohands || KDGameData.KneelTurns < 1) {
			//KinkyDungeonAdvanceTime(1);
			KinkyDungeonSendActionMessage(7, TextGet(failmsg), KDBaseRed, 1);

			KDResetAlternateInventoryRender();
			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			return false;
		}
	}

	if (strictness >= maxStrictness) {
		//KinkyDungeonAdvanceTime(1);
		KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsStrict"), KDBaseRed, 1);

		KDResetAlternateInventoryRender();
		if (KinkyDungeonTextMessageTime > 0)
			KinkyDungeonDrawState = "Game";


		KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		KinkyDungeonDressPlayer();
		return false;
	}

	if (KDConsumable(item).postreq && KDConsumablePrereq[KDConsumable(item).postreq]) {
		if (KDConsumablePrereq[KDConsumable(item).postreq](item, Quantity)) {
			KDDelayedActionPrune(["Action", "Consume"]);

			return true;
		} else return false;
	}
	return true;
}

interface KDInventoryMaxData {
	item: item,
	max: number,
	bonus: number,
	mult: number,
	entity: entity,
}

function KDGetItemBaseMax(item: item): number {
	switch (item?.type) {
		case Restraint:
		case LooseRestraint:
			return KDRestraint(item)?.armor ? 5 : 100;

		case Consumable:
			return KDConsumable(item)?.maxInventory ? KDConsumable(item).maxInventory : 10;

		case Weapon:
		case Outfit:
			return 1;
		default: return 1000000;
	}
}

function KDMaxInventoryStorage(item: item, entity: entity) {
	if (entity.player) {
		let data: KDInventoryMaxData = {
			item: item,
			max: KDGetItemBaseMax(item),
			bonus: 0,
			mult: 1,
			entity: entity,
		}
		KinkyDungeonSendEvent("calcInvMax", data);

		data.max = Math.max(0, data.max + data.bonus) * data.mult;
		return data.max;
	}
	return 1000000;
}


function KDIsFood(item: item) {
	return !!KDConsumable(item)?.food;
}