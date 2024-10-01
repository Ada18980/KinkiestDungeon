"use strict";

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

function KinkyDungeonItemCount(Name: string): number {
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


/**
 * @param consumable
 * @param Quantity
 */
function KinkyDungeonChangeConsumable(consumable: consumable, Quantity: number): boolean {
	let item = KinkyDungeonInventoryGetConsumable(consumable.name);
	if (item) {
		item.quantity += Quantity;
		if (item.quantity <= 0) {
			KinkyDungeonInventoryRemove(item);
		}
		return true;
	}

	if (Quantity >= 0) {
		KinkyDungeonInventoryAdd({name: consumable.name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity});
	}

	return false;
}

/**
 * @param name
 * @param Quantity
 */
function KDAddConsumable(name: string, Quantity: number): boolean {
	let item = KinkyDungeonInventoryGetConsumable(name);
	if (item) {
		item.quantity += Quantity;
		if (item.quantity <= 0) {
			KinkyDungeonInventoryRemove(item);
		}
		return true;
	}

	if (Quantity > 0) {
		KinkyDungeonInventoryAdd({name: name, id: KinkyDungeonGetItemID(), type: Consumable, quantity: Quantity});
	}

	return false;
}

function KinkyDungeonConsumableEffect(Consumable: consumable, type?: string) {
	if (!type) type = Consumable.type;

	if (KDConsumableEffects[type]) {
		KDConsumableEffects[type](Consumable);
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
		KinkyDungeonChangeCharge(Consumable.amount);
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

function KinkyDungeonPotionCollar() {
	for (let r of KinkyDungeonAllRestraint()) {
		if (KDRestraint(r).potionCollar) return true;
	}
	return false;
}

function KinkyDungeonCanDrink(byEnemy?: boolean): boolean {
	for (let inv of KinkyDungeonAllRestraint()) {
		if (KDRestraint(inv).allowPotions) return true;
	}
	if (KDGroupBlocked("ItemMouth", byEnemy)) return false;
	return KinkyDungeonCanTalk(true);
}

function KinkyDungeonAttemptConsumable(Name: any, Quantity: number): boolean {
	if (KDGameData.SleepTurns > 0 || KDGameData.SlowMoveTurns > 0) return false;
	let item = KinkyDungeonGetInventoryItem(Name, Consumable);
	if (!item) return false;


	if (KDConsumable(item.item).prereq && KDConsumablePrereq[KDConsumable(item.item).prereq]) {
		if (KDConsumablePrereq[KDConsumable(item.item).prereq](item.item, Quantity)) {
			KinkyDungeonUseConsumable(Name, Quantity);
			return true;
		} else return false;
	}

	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "unusuable") {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonUnusable"), "#ff5277", 1);
		return false;
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "goldKey") {
		if (KinkyDungeonPlayerGetRestraintsWithLocks(["Gold"]).length == 0) {
			KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonMistressKeyFail"), "#ff5277", 1);
			return false;
		}
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "charge" && KDGameData.AncientEnergyLevel >= 1) {
		KinkyDungeonSendActionMessage(10, TextGet("KinkyDungeonFullpower"), "#ff5277", 1);
		return false;
	}
	if (item.item && KDConsumable(item.item) && KDConsumable(item.item).type == "recharge") {
		KinkyDungeonSendActionMessage(8, TextGet("KinkyDungeonInventoryItemAncientPowerSourceSpentUseFail"), "#ff5277", 1);
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

	if (needMouth && ((!KDConsumable(item.item).potion && ((KDConsumable(item.item).gagMax && KinkyDungeonGagTotal() > KDConsumable(item.item).gagMax) || (!KDConsumable(item.item).gagMax && !KinkyDungeonCanTalk(true))))
		|| (KDConsumable(item.item).potion && !KinkyDungeonCanDrink()))) {
		let allowPotions = KinkyDungeonPotionCollar();
		if (KDConsumable(item.item).potion && allowPotions) {
			//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
		} else {
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonPotionGagged"), "#ff5277", 1);

			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();

			return false;
		}
	}
	if (!(KinkyDungeonHasHelp()) && needArms && !KinkyDungeonStatsChoice.get("Psychic") && !(item.item && KDConsumable(item.item).potion && !KinkyDungeonIsArmsBound() && (!KinkyDungeonStatsChoice.has("WeakGrip") || !KinkyDungeonIsHandsBound(false, false))) && (KinkyDungeonIsHandsBound(false, true) || (KinkyDungeonStatsChoice.has("WeakGrip") && item.item && KDConsumable(item.item).potion)) && !KinkyDungeonCanUseFeet()) {
		let allowPotions = KinkyDungeonPotionCollar();
		let nohands = KinkyDungeonIsHandsBound(false, true);
		if (KDConsumable(item.item).potion && allowPotions) {
			//KDGameData.AncientEnergyLevel = Math.max(0, KDGameData.AncientEnergyLevel - energyCost);
		} else if (!nohands && KinkyDungeonCanKneel() && KDGameData.KneelTurns < 1) {
			if (!KDGameData.KneelTurns) KDGameData.KneelTurns = 2;
			else KDGameData.KneelTurns = Math.max(KDGameData.KneelTurns, 2);
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsKneel"), "#e7cf1a", 1);

			if (KinkyDungeonTextMessageTime > 0)
				KinkyDungeonDrawState = "Game";

			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
			KinkyDungeonDressPlayer();
			KinkyDungeonAdvanceTime(1, true, true);

			return false;
		} else if (nohands || KDGameData.KneelTurns < 1) {
			//KinkyDungeonAdvanceTime(1);
			KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotions"), "#ff5277", 1);

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
		KinkyDungeonSendActionMessage(7, TextGet("KinkyDungeonCantUsePotionsStrict"), "#ff5277", 1);

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
				KDAddDelayedAction({
					commit: "Consumable",
					data: {
						Name: Name,
						Quantity: Quantity,
					},
					time: KDConsumable(item.item).delay || 2,
					tags: ["Action", "Remove", "Restrain"],
				});
				KDStunTurns(KDConsumable(item.item).delay || 2, true);
			} else KinkyDungeonUseConsumable(Name, Quantity);
			return true;
		} else return false;
	}
	KDDelayedActionPrune(["Action", "Consume"]);
	if (KDConsumable(item.item).delay || (KDConsumable(item.item).potion && KinkyDungeonStatsChoice.has("SavourTheTaste"))) {
		KDAddDelayedAction({
			commit: "Consumable",
			data: {
				Name: Name,
				Quantity: Quantity,
			},
			time: KDConsumable(item.item).delay || 2,
			tags: ["Action", "Remove", "Restrain"],
		});
		KDStunTurns(KDConsumable(item.item).delay || 2, true);
	} else KinkyDungeonUseConsumable(Name, Quantity);
	return true;
}

function KinkyDungeonUseConsumable(Name: string, Quantity: number): boolean {
	let item = KinkyDungeonGetInventoryItem(Name, Consumable);
	if (!item || item.item.quantity < Quantity) return false;

	for (let I = 0; I < Quantity; I++) {
		KinkyDungeonConsumableEffect(KDConsumable(item.item));
		if (KDConsumable(item.item).sideEffects) {
			for (let effect of KDConsumable(item.item).sideEffects) {
				KinkyDungeonConsumableEffect(KDConsumable(item.item), effect);
			}
		}
	}
	if (!KDConsumable(item.item).noConsumeOnUse)
		KinkyDungeonChangeConsumable(KDConsumable(item.item), -(KDConsumable(item.item).useQuantity ? KDConsumable(item.item).useQuantity : 1) * Quantity);

	KinkyDungeonSendActionMessage(9, TextGet("KinkyDungeonInventoryItem" + Name + "Use"), "#88FF88", 1);
	if (KDConsumable(item.item).sfx) {
		if (KDSoundEnabled()) AudioPlayInstantSoundKD(KinkyDungeonRootDirectory + "Audio/" + KDConsumable(item.item).sfx + ".ogg");
	}
	return true;
}
