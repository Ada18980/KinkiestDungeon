'use strict';

/** @typedef {{action: string, id: string, result: string, favorability: number, delay: number,}} KDAS_Result */
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
	/** Lengthens the duration of waiting between inputs */
	lastDelay: 0,

	/** For the Wiggle action, only moves within this point and only cuts when at the center*/
	/** @type {{x: number, y: number}} */
	wigglePoint: null,
	wiggleDist: 2.99,
};

/** @type {Record<string, {itemweight?: (player: entity, item: item) => number, playerweight?: (player: entity) => number, action: (player: entity) => KDAS_Result}>} */
let KDAutoStruggleActions = {
	"Struggle": {
		itemweight: (player, item) => {
			if (KDGetCurse(item) || KDRestraint(item).good) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Struggle";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);
			let delay = KDAS_SwitchDelay(result);
			return {
				action: action,
				favorability: favor,
				delay: delay,
				id: KDAutoWaitIndexID(player, KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex, action),
				result: result,
			};
		},
	},
	"Remove": {
		itemweight: (player, item) => {
			if (item.lock) return 0;
			if (KDGetCurse(item) || KDRestraint(item).good) return 0;
			if (!KDRestraint(item).alwaysStruggleable && KDGroupBlocked(KDRestraint(item).Group)) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Remove";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);
			let delay = KDAS_SwitchDelay(result);
			return {
				action: action,
				favorability: favor,
				delay: delay,
				id: KDAutoWaitIndexID(player, KDAutoStruggleData.currentFocusGroup, KDAutoStruggleData.currentFocusIndex, action),
				result: result,
			};
		},
	},
	"Cut": {
		itemweight: (player, item) => {
			if (!KDAS_InWigglePoint(player) && !KinkyDungeonWallCrackAndKnife(false)) return 0;
			if (KDGetCurse(item) || KDRestraint(item).good) return 0;
			if (!KDRestraint(item).alwaysStruggleable && KDGroupBlocked(KDRestraint(item).Group)) return 0;
			if (!((KinkyDungeonAllWeapon().some((inv) => {return KDWeapon(inv).light && KDWeapon(inv).cutBonus != undefined;}) || KinkyDungeonGetAffinity(false, "Sharp"))
				&& !(KDRestraint(item) && KDRestraint(item).escapeChance && KDRestraint(item).escapeChance.Cut == undefined))) return 0;
			return 10 / Math.max(1, KDRestraint(item).power);
		},
		action: (player) => {
			let action = "Cut";
			let result = KDSendInput("struggle", {group: KDAutoStruggleData.currentFocusGroup, index: KDAutoStruggleData.currentFocusIndex, type: action});
			let favor = KDAS_SwitchFavor(result);
			let delay = KDAS_SwitchDelay(result);
			if (result == "Drop") KDAS_UpdateWigglePoint(player, true);
			return {
				action: action,
				favorability: favor,
				delay: delay,
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
			return {action: "wait", id: "", result: "fail", delay: 0, favorability: KinkyDungeonStatStamina > (Math.max(KinkyDungeonStatStaminaCostStruggle * 2, KinkyDungeonStatStaminaMax * 0.7)) ? -10
				: (KinkyDungeonStatStamina > KinkyDungeonStatStaminaCostStruggle * 2 ? -4 : -1)};
		},
	},
	"Wiggle": {
		playerweight: (player) => {
			return KDAutoStruggleData.lastActionQueue.some((action) => {return action.result == "Drop" || action.result == "NeedEdge";}) ?
				((KDAffinityList.some((affinity) => {return KinkyDungeonGetAffinity(false, affinity);})) ? 5 : 50)
				: ((KDAffinityList.some((affinity) => {return KinkyDungeonGetAffinity(false, affinity);})) ? 0.5 : (2 + Math.min(8, KDAutoStruggleData.overallDespair/10)));
		},
		action: (player) => {
			let wigglePoints = KDAS_GetMovableWigglePoint(player, Math.random() < 0.5);
			let point = wigglePoints[Math.floor(Math.random() * wigglePoints.length)] || {x: 0, y: 0};
			KDSendInput("move", {dir: {x:point.x - player.x, y: point.y-player.y, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
			KinkyDungeonSendActionMessage(6, TextGet("KDWiggle"), "#aaaaaa", 1);
			if (KDAffinityList.some((affinity) => {return KinkyDungeonGetAffinity(false, affinity);})) {
				KDAutoStruggleData.decidedAction = "";
			}
			return {action: "wiggle", id: "", result: "fail", delay: 1, favorability: KinkyDungeonStatStamina > (Math.max(KinkyDungeonStatStaminaCostStruggle * 2, KinkyDungeonStatStaminaMax * 0.7)) ? -3
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

	KDAutoStruggleData.wigglePoint = null;

	KDAutoStruggleData.lastTick = KinkyDungeonCurrentTick;
}

/**
 * Updates the wiggle point
 * @param {entity} player
 * @param {boolean} [force]
 */
function KDAS_UpdateWigglePoint(player, force) {
	let wpx = KDAutoStruggleData.wigglePoint?.x;
	let wpy = KDAutoStruggleData.wigglePoint?.y;
	if (force || (!KDAutoStruggleData.wigglePoint || KDistChebyshev(player.x - wpx, player.y - wpy) > 1.5)) {
		KDAutoStruggleData.wigglePoint = {x: player.x, y: player.y};
	}
}

/**
 * Returns if the player is on the wiggle point or not
 * @param {entity} player
 * @returns {boolean}
 */
function KDAS_InWigglePoint(player) {
	KDAS_UpdateWigglePoint(player);
	return (player.x == KDAutoStruggleData.wigglePoint.x && player.y == KDAutoStruggleData.wigglePoint.y);
}
/**
 * Returns an array of tiles the player can move near the wiggle points
 * @param {entity} player
 * @param {boolean} goCloser - If the player has to move closer to the wiggle point
 * @returns {{x: number, y: number}[]}
 */
function KDAS_GetMovableWigglePoint(player, goCloser) {
	KDAS_UpdateWigglePoint(player);
	let list = [];
	let dist = KDAutoStruggleData.wiggleDist;
	let wpx = KDAutoStruggleData.wigglePoint.x;
	let wpy = KDAutoStruggleData.wigglePoint.y;
	let currentPdist = KDistEuclidean(player.x - wpx, player.y - wpy);
	for (let XX = Math.floor(player.x - dist); XX <= Math.ceil(player.x + dist); XX++) {
		for (let YY = Math.floor(player.y - dist); YY <= Math.ceil(player.y + dist); YY++) {
			let pdist = KDistEuclidean(XX - wpx, YY - wpy);
			if (KinkyDungeonMovableTilesSmartEnemy.includes(KinkyDungeonMapGet(XX, YY))
				&& pdist <= dist
				&& (!goCloser || pdist < currentPdist)
				&& KDistChebyshev(player.x - XX, player.y - YY) < 1.5) {
				list.push({x:XX, y:YY});
			}
		}
	}

	return list;
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
		case "Impossible": return -10;
		case "NeedEdge": return -5;
		case "Drop": return -10;
		case "Limit": return -6;
		case "Strict": return -6;
	}
	return -1;
}

/**
 *
 * @param {string} result
 * @returns {number}
 */
function KDAS_SwitchDelay(result) {
	switch(result) {
		case "Success": return 12;
		case "Fail": return 1;
		case "Impossible": return 4;
		case "NeedEdge": return 3;
		case "Drop": return 9;
		case "Limit": return 6;
		case "Strict": return 3;
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
		KDAutoStruggleData.overallDespair += Math.max(0, - result.favorability);
		KDAutoStruggleData.lastDelay = Math.max(0, result.delay);
	} else {
		// Wait
		KDSendInput("move", {dir: {x:0, y: 0, delta: 0}, delta: 1, AllowInteract: true, AutoDoor: KinkyDungeonToggleAutoDoor, AutoPass: KinkyDungeonToggleAutoPass, sprint: KinkyDungeonToggleAutoSprint, SuppressSprint: KinkyDungeonSuppressSprint}, false, true);
		result = {action: "wait", id: "", result: "fail", favorability: -1, delay: 0};
	}
	if (result)
		KDAutoStruggleData.lastActionQueue.unshift(result);

	KDAutoStruggleData.lastActionQueue = KDAutoStruggleData.lastActionQueue.slice(0, 15);

	return result;
}




function KDAutoWaitIndexID(player, group, index, action) {
	return `${group}_${KinkyDungeonGetRestraintItem(group)?.name}_${index}_${action}`;
}