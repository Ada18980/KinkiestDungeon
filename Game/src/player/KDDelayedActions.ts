'use strict';

/**
 * Prunes delayed actions with tags
 * @param tags
 */
function KDDelayedActionPrune(tags: string[]) {
	KDGameData.DelayedActions = KDGameData.DelayedActions ? KDGameData.DelayedActions.filter((action) => {
		for (let t of tags) {
			if (action.tags.includes(t)) return false;
		}
		return true;
	}) : [];

}

/**
 * Adds a delayed action
 * @param action
 */
function KDAddDelayedAction(action: KDDelayedAction) {
	if (!action.maxtime) action.maxtime = action.time;
	KDGameData.DelayedActions.push(Object.assign({}, action));
}

/**
 * This is processed for delayed actions
 */
let KDDelayedActionUpdate: Record<string, (action: KDDelayedAction) => void> = {
	"RequireWill": (action) => {
		if (!(KinkyDungeonStatWill > 0)) action.time = 0;
	},
};

/**
 * This is processed for delayed actions
 */
let KDDelayedActionCommit: Record<string, (action: KDDelayedAction) => void> = {



	"ConsumableEffect": (action) => {
		let item = KinkyDungeonGetInventoryItem(action.data.Name);
		let consumable = KDConsumable(item.item);
		if (action.data.itemEffect) {
			// Use new itemEffect API
			let effect = KDItemEffects[action.data.itemEffect];
			let entity = action.data.id ? KinkyDungeonFindID(action.data.id) || KDLookupID(action.data.id) : undefined;
			let result = effect.onUse(item.item, action.data.Quantity, KDPlayer(),
				entity,
				action.data.tX, action.data.tY);
			if (result.miscast) {
				effect.onMiscast(result, item.item, action.data.Quantity, KDPlayer(),
					action.data.id ? KinkyDungeonFindID(action.data.id) || KDLookupID(action.data.id) : undefined,
					action.data.tX, action.data.tY);
				return;
			} else if (!result.success) {
				effect.onFailure(result, item.item, action.data.Quantity, KDPlayer(),
					action.data.id ? KinkyDungeonFindID(action.data.id) || KDLookupID(action.data.id) : undefined,
					action.data.tX, action.data.tY);
				return;
			}

			if (result.consumed > 0) {
				KDChangeConsumable("entity_" + entity?.id,
					"item", "cast", consumable,
					-(KDConsumable(item.item).useQuantity != undefined ? KDConsumable(item.item).useQuantity : 1));

			}
			if (result.success) {
				if (!action.data.noAggro)
					KinkyDungeonAggroAction('item', {});
			}

			if (result.time) {
				if (result.time == 1) {
					KinkyDungeonAdvanceTime(1);
				} else {
					KDStunTurns(result.time, true);
				}
			}
		}
	},
	"Consumable": (action) => {
		if (KinkyDungeonGetInventoryItem(action.data.Name))
			KinkyDungeonUseConsumable(action.data.Name, action.data.Quantity);
	},
	"Armor": (action) => {
		if (KinkyDungeonGetInventoryItem(action.data.Name))
			KinkyDungeonUseConsumable(action.data.Name, action.data.Quantity);
	},
	"EquipRestraint": (action) => {
		KDDoEquipDelayed(action.data,
			action.data.player ? KDGetGlobalEntity(action.data.player) : KDPlayer())
	},
	"EquipGenericRestraint": (action) => {
		KDDoEquipGenericDelayed(action.data,
			action.data.player ? KDGetGlobalEntity(action.data.player) : KDPlayer())
	},
	"Struggle": (action) => {
		/**
		 * Data format:
		 * group: string
		 * index: number
		 * amount: number
		 * escapeData: escape data
		 */
		let dynamic = KDGetDynamicItem(action.data.group, action.data.index);
		let restraint = dynamic.restraint;
		let host = dynamic.host;
		if (restraint) {
			KDChangeStamina(action.data.escapeData.struggleGroup, action.data.escapeData.struggleType,
				"struggle", 0, true, 1);

			KinkyDungeonSetFlag(action.data.escapeData.struggleType, 1);
			KinkyDungeonSetFlag("escaping", 2);
			let lockType = restraint.lock && KDLocks[restraint.lock] ? KDLocks[restraint.lock] : null;
			let struggleType = action.data.escapeData.struggleType;
			if (struggleType == "Struggle" || struggleType == "Remove" || struggleType == "Cut") {
				if (struggleType == "Cut")
					restraint.cutProgress += action.data.amount;
				else restraint.struggleProgress += action.data.amount;
				let progress = (restraint.struggleProgress || 0) + (restraint.cutProgress || 0);
				if (progress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KDSuccessRemove(struggleType, restraint, lockType, action.data.index, action.data.escapeData, host);
				} else if (action.data?.delta > 0) {
					//KDStunTurns(action.data?.delta, true);
				}

			} else if (struggleType == "Unlock") {
				KinkyDungeonSetFlag("unlocking", 2);
				restraint.unlockProgress += action.data.amount;
				if (restraint.unlockProgress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KinkyDungeonRemoveKeysUnlock(restraint.lock);
					KinkyDungeonLock(restraint, "", false, false, false, true);
				} else if (action.data?.delta > 0) {
					//KDStunTurns(action.data?.delta, true);
				}
			} else if (struggleType == "Pick") {
				KinkyDungeonSetFlag("picking", 2);
				restraint.pickProgress += action.data.amount;
				if (restraint.pickProgress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KinkyDungeonLock(restraint, "", false, false, true);
				} else if (action.data?.delta > 0) {
					//KDStunTurns(action.data?.delta, true);
				}
			}
		}
	},
};
