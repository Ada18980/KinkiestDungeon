'use strict';

/**
 * @param {number} x
 * @param {number} y
 * @returns {entity}
 */
function KDGetNearestFactionGuard(x, y) {
	let condition = (en) => {
		return (KDEnemyHasFlag(en, "mapguard")
			|| (
				KDGetFaction(en) == KDGetMainFaction()
				&& en.Enemy?.tags.jailer
			)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
	};

	if (KinkyDungeonJailGuard() && condition(KinkyDungeonJailGuard())) return KinkyDungeonJailGuard();

	let dist = KDMapData.GridWidth*KDMapData.GridWidth + KDMapData.GridHeight*KDMapData.GridHeight;
	let cand = null;
	let dd = dist;
	let entities = KDNearbyEnemies(x, y, 10).filter((en) => {return condition(en);});
	if (entities.length == 0) entities = KDMapData.Entities;
	for (let en of entities) {
		if (condition(en)) {
			dd = KDistEuclidean(x-en.x, y-en.y);
			if (dd < dist) {
				dist = dd;
				cand = en;
			}
		}
	}
	return cand;
}

/**
 *
 * @param {entity} player
 * @returns {entity}
 */
function KDPrisonCommonGuard(player, call) {
	// Suppress standard guard call behavior
	KinkyDungeonSetFlag("SuppressGuardCall", 10);
	let guard = KDGetNearestFactionGuard(player.x, player.y);
	KDGameData.JailGuard = guard.id;

	return KinkyDungeonJailGuard();
}


/**
 * Gets the groups and restraints to add based on a set of jail tags
 * @param {entity} player
 * @param {string[]} jailLists
 * @param {string} lock
 * @returns {KDJailGetGroupsReturn}
 */
function KDPrisonGetGroups(player, jailLists, lock) {
	/**
	 * @type {string[]}
	 */
	let groupsToStrip = [];
	/**
	 * @type {{item: string; variant: string}[]}
	 */
	let itemsToApply = [];
	let itemsApplied = {};

	// First populate the items
	let jailList = KDGetJailRestraints(jailLists, false, false);

	// Next we go over the prison groups and figure out if there is anything in that group
	for (let prisonGroup of KDPRISONGROUPS) {
		let strip = false;
		for (let g of prisonGroup) {
			let restraints = KinkyDungeonGetJailRestraintsForGroup(g, jailList, false, lock);
			if (restraints.length > 0) {
				restraints.sort(
					(a, b) => {
						return b.def.Level - a.def.Level;
					}
				);
				for (let r of restraints) {
					if (!itemsApplied[r.restraint.name + "--" + r.variant]) {
						itemsApplied[r.restraint.name + "--" + r.variant] = true;
						itemsToApply.push({item: r.restraint.name, variant: r.variant});
						strip = true;
					}
				}
			}
		}
		// Add the whole prison group if there is one item to apply
		if (strip) {
			groupsToStrip.push(...prisonGroup);
		}
	}

	return {
		groupsToStrip: groupsToStrip,
		itemsToApply: itemsToApply,
	};
}

/**
 * Throttles prison checks
 * @param {entity} player
 * @returns {boolean}
 */
function KDPrisonTick(player) {
	if (!KinkyDungeonFlags.get("prisonCheck")) {
		KinkyDungeonSetFlag("prisonCheck", 3 + Math.floor(KDRandom() * 3));
		return true;
	}
	return false;
}

/**
 *
 * @param {entity} player
 * @returns {boolean}
 */
function KDPrisonIsInFurniture(player) {
	if (KinkyDungeonPlayerTags.get("Furniture")) {
		let tile = KinkyDungeonTilesGet(player.x + "," + player.y);
		if (tile?.Furniture) {
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {entity} player
 * @param {string} state
 * @returns {string}
 */
function KDGoToSubState(player, state) {
	KDMapData.PrisonStateStack.unshift(KDMapData.PrisonState);
	return state;
}

/**
 *
 * @param {entity} player
 * @returns {string}
 */
function KDPopSubstate(player) {
	let state = KDMapData.PrisonStateStack[0];
	if (state) {
		KDMapData.PrisonStateStack.splice(0, 1);
		return state;
	}
	return KDPrisonTypes[KDMapData.PrisonType]?.default_state || "";
}


/**
 * Resets the prison state stack
 * @param {entity} player
 * @param {string} state
 * @returns {string}
 */
function KDSetPrisonState(player, state) {
	KDMapData.PrisonStateStack = [];
	return state;
}

/**
 *
 * @param {entity} player
 * @returns {string}
 */
function KDCurrentPrisonState(player) {
	return KDMapData.PrisonState;
}