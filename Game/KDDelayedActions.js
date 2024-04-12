'use strict';

/** Prunes delayed actions with tags
 * @param {string[]} tags
*/
function KDDelayedActionPrune(tags) {
	KDGameData.DelayedActions = KDGameData.DelayedActions ? KDGameData.DelayedActions.filter((action) => {
		for (let t of tags) {
			if (action.tags.includes(t)) return false;
		}
		return true;
	}) : [];
}

/**
 * Adds a delayed action
 * @param {KDDelayedAction} action
 */
function KDAddDelayedAction(action) {
	KDGameData.DelayedActions.push(Object.assign({}, action));
}

/** This is processed for delayed actions
 * @type {Record<string, (action: KDDelayedAction) => void>}
 */
let KDDelayedActionUpdate = {
	"RequireWill": (action) => {
		if (!(KinkyDungeonStatWill > 0)) action.time = 0;
	},
};
/** This is processed for delayed actions
 * @type {Record<string, (action: KDDelayedAction) => void>}
 */
let KDDelayedActionCommit = {
	"Consumable": (action) => {
		if (KinkyDungeonGetInventoryItem(action.data.Name))
			KinkyDungeonUseConsumable(action.data.Name, action.data.Quantity);
	},
	"Armor": (action) => {
		if (KinkyDungeonGetInventoryItem(action.data.Name))
			KinkyDungeonUseConsumable(action.data.Name, action.data.Quantity);
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
			KinkyDungeonSetFlag("escaping", 2);
			let lockType = restraint.lock && KDLocks[restraint.lock] ? KDLocks[restraint.lock] : null;
			let struggleType = action.data.escapeData.struggleType;
			if (struggleType == "Struggle" || struggleType == "Remove" || struggleType == "Cut") {
				if (struggleType == "Cut" || (struggleType == "Struggle" && KDRestraint(restraint)?.struggleBreak))
					restraint.cutProgress += action.data.amount;
				else restraint.struggleProgress += action.data.amount;
				let progress = (restraint.struggleProgress || 0) + (restraint.cutProgress || 0);
				if (progress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KDSuccessRemove(struggleType, restraint, lockType, action.data.index, action.data.escapeData, host);
				} else if (action.data?.delta > 0) {
					KDStunTurns(action.data?.delta, true);
				}

			} else if (struggleType == "Unlock") {
				KinkyDungeonSetFlag("picking", 2);
				restraint.unlockProgress += action.data.amount;
				if (restraint.unlockProgress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KDSuccessRemove(struggleType, restraint, lockType, action.data.index, action.data.escapeData, host);
				} else if (action.data?.delta > 0) {
					KDStunTurns(action.data?.delta, true);
				}
			} else if (struggleType == "Pick") {
				KinkyDungeonSetFlag("picking", 2);
				restraint.pickProgress += action.data.amount;
				if (restraint.pickProgress > 1) {
					KinkyDungeonSetFlag("escaped", 2);
					KDSuccessRemove(struggleType, restraint, lockType, action.data.index, action.data.escapeData, host);
				} else if (action.data?.delta > 0) {
					KDStunTurns(action.data?.delta, true);
				}
			}
		}
	},
};