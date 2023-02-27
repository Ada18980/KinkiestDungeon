'use strict';

/** @typedef {{action: string, id: string, result: string, favorability: number}} KDAS_Result */
/** @typedef {{action: string, id: string, group: string, index: number}} KDAS_Action */

let KDAutoStruggleData = {
	lastTick: 0,
	/** @type {KDAS_Result[]} */
	lastActionQueue: [],
	decidedAction: "",

	/** State params for PC focus */
	/** @type {{action: KDAS_Action, weight: number}[]} */
	possibleActions: [],
	/** Measure of despair accumulated with each item, downgrades the item in terms of weight
	 * @type {Record<string, number>}
	*/
	totalDespair: {},

	currentFocusGroup: "",
	currentFocusIndex: 0,
	/** Despair is the PCs measure of whether to give up and try something else*/
	currentFocusDespair: 0,
	/** DespairTarget is the PC's value decided for how much effort she is willing to put in */
	currentFocusDespairTarget: 0,

	/** Overalldespair determines how much individual hope the protag has for restraints working */
	overallDespair: 0,

};

/** @type {Record<string, {itemweight?: (player: entity, item: item) => number, playerweight?: (player: entity) => number, action: (player: entity) => KDAS_Result}>} */
let KDAutoStruggleActions = {
	"Struggle": {
		itemweight: (player, item) => {
			if (item.curse || KDRestraint(item).curse) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Struggle";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);
			return {
				action: action,
				favorability: favor,
				id: KDAutoWaitIndexID(player, KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex, action),
				result: result,
			};
		},
	},
	"Remove": {
		itemweight: (player, item) => {
			if (item.lock) return 0;
			if (item.curse || KDRestraint(item).curse) return 0;
			if (!KDRestraint(item).alwaysStruggleable && KDGroupBlocked(KDRestraint(item).Group)) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Remove";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);

			return {
				action: action,
				favorability: favor,
				id: KDAutoWaitIndexID(player, KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex, action),
				result: result,
			};
		},
	},
	"Cut": {
		itemweight: (player, item) => {
			if (item.curse || KDRestraint(item).curse) return 0;
			if (!KDRestraint(item).alwaysStruggleable && KDGroupBlocked(KDRestraint(item).Group)) return 0;
			if (!((KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) || KinkyDungeonGetAffinity(false, "Sharp"))
				&& !(KDRestraint(item) && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Cut == undefined))) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Cut";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);

			return {
				action: action,
				favorability: favor,
				id: KDAutoWaitIndexID(player, KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex, action),
				result: result,
			};
		},
	},
	"Wait": {
		playerweight: (player) => {
			return 20*Math.max(0,  - KinkyDungeonStatStamina - KinkyDungeonStatStaminaCostStruggle * 2);
		},
		action: (player) => {
			KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
			return {action: "wait", id: "", result: "fail", favorability: KinkyDungeonStatStamina > (Math.max(KinkyDungeonStatStaminaCostStruggle * 2, KinkyDungeonStatStaminaMax * 0.7)) ? -10
				: (KinkyDungeonStatStamina > KinkyDungeonStatStaminaCostStruggle * 2 ? -2 : -1)};
		},
	},
};

/**
 * Function to reset certain state variables of auto struggle
 */
function KDInitAutoStruggle() {
	KDAutoStruggleData.possibleActions = [];
	KDAutoStruggleData.lastActionQueue = [];
	KDAutoStruggleData.decidedAction = "";

	KDAutoStruggleData.currentFocusGroup = "";
	KDAutoStruggleData.currentFocusIndex = 0;
	KDAutoStruggleData.currentFocusDespair = 0;
	KDAutoStruggleData.currentFocusDespairTarget = 0;


	KDAutoStruggleData.overallDespair = 0;
	KDAutoStruggleData.totalDespair = {};

	KDAutoStruggleData.lastTick = KinkyDungeonCurrentTick;
}

/**
 *
 * @param {string} result
 * @returns {number}
 */
function KDAS_SwitchFavor(result) {
	switch(result) {
		case "Success": return 5;
		case "Fail": return -1;
		case "Impossible": return -5;
		case "NeedEdge": return -4;
		case "Drop": return -1;
		case "Limit": return -2;
		case "Strict": return -2;
	}
	return -1;
}

/**
 * Master function for handling the Auto Struggle state machine
 * @param {entity} player
 */
function KDHandleAutoStruggle(player) {
	if (KinkyDungeonCurrentTick > KDAutoStruggleData.lastTick + 10) {
		// Reset the data if it's stale
		KDInitAutoStruggle();
	}
	KDAutoStruggleData.lastTick = KinkyDungeonCurrentTick;

	// Examine the state of things
	KDAutoStruggleEvaluate(player);
	// Actually do something
	KDAutoStruggleMakeDecision(player);
	// Run the decision that was made
	let result = KDAutoStruggleRunDecision(player);

	console.log(result);
}

/**
 * Updates the KDAutoStruggleData state data to accurately reflect the player
 * @param {entity} player
 */
function KDAutoStruggleEvaluate(player) {
	KDAutoStruggleData.possibleActions = [];

	// First get actions with an itemweight
	for (let inv of KinkyDungeonAllRestraint()) {
		let items = KDDynamicLinkListSurface(inv);
		let link = items[0];
		let index = 0;
		let group = KDRestraint(inv).Group;
		while (link) {
			for (let action of Object.entries(KDAutoStruggleActions)) {
				if (action[1].itemweight) {
					KDAutoStruggleData.possibleActions.push({
						action: {
							action: action[0],
							group: group,
							index: index,
							id: KDAutoWaitIndexID(player, group, index, action[0]),
						},
						weight: action[1].itemweight(player, link),
					});
				}
			}

			index += 1;
			link = items[index];
		}
	}

	// Now to get other actions that dont have an itemweight
	for (let action of Object.entries(KDAutoStruggleActions)) {
		if (action[1].playerweight) {
			KDAutoStruggleData.possibleActions.push({
				action: {
					action: action[0],
					group: "",
					index: 0,
					id: KDAutoWaitIndexID(player, "", 0, action[0]),
				},
				weight: action[1].playerweight(player),
			});
		}
	}
}


/**
 * Updates the KDAutoStruggleData decidedAction variable
 * @param {entity} player
 */
function KDAutoStruggleMakeDecision(player) {
	if (KDAutoStruggleData.decidedAction && KDAutoStruggleData.currentFocusDespair < KDAutoStruggleData.currentFocusDespairTarget
		&& (!KDAutoStruggleData.currentFocusGroup || (KinkyDungeonGetRestraintItem(KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex)))) {
		// Keep doing what you doing
	} else {
		let totalWeight = 0;
		let currentWeights = [];
		for (let action of KDAutoStruggleData.possibleActions) {
			totalWeight += action.weight * (1 / (1 + 0.01 * (KDAutoStruggleData.totalDespair[action.action.id]||0)));
			currentWeights.push({action: action.action, weight: totalWeight});
		}
		let selection = Math.random() * totalWeight;
		for (let action of currentWeights) {
			if (action.weight > selection) {
				KDAutoStruggleData.decidedAction = action.action.action;
				KDAutoStruggleData.currentFocusGroup = action.action.group;
				KDAutoStruggleData.currentFocusindex = action.action.index;
				KDAutoStruggleData.currentFocusDespair = 0;
				KDAutoStruggleData.currentFocusDespairTarget = 10;
				break;
			}
		}
	}


}

/**
 * Executes the run decision
 * @param {entity} player
 */
function KDAutoStruggleRunDecision(player) {
	/** @type {KDAS_Result} */
	let result = null;
	if (KDAutoStruggleActions[KDAutoStruggleData.decidedAction]) {
		result = KDAutoStruggleActions[KDAutoStruggleData.decidedAction].action(player);
		KDAutoStruggleData.currentFocusDespair = Math.max(0, (KDAutoStruggleData.currentFocusDespair || 0) - result.favorability);
		KDAutoStruggleData.totalDespair[result.id] = Math.max(0, (KDAutoStruggleData.totalDespair[result.id] || 0) - result.favorability);
	} else {
		// Wait
		KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
		result = {action: "wait", id: "", result: "fail", favorability: -1};
	}
	if (result)
		KDAutoStruggleData.lastActionQueue.unshift(result);

	KDAutoStruggleData.lastActionQueue = KDAutoStruggleData.lastActionQueue.slice(0, 5);

	return result;
}




function KDAutoWaitIndexID(player, group, index, action) {
	return `${group}_${KinkyDungeonGetRestraintItem(group)?.name}_${index}_${action}`;
}