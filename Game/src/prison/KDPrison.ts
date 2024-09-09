'use strict';

/**
 * @param x
 * @param y
 */
function KDGetNearestFactionGuard(x: number, y: number): entity {
	let condition = (en: entity) => {
		return (KDEnemyHasFlag(en, "mapguard")
			|| (
				KDGetFaction(en) == KDGetMainFaction()
				&& en.Enemy?.tags.jailer
			)) && !KDHelpless(en) && !KinkyDungeonIsDisabled(en);
	};

	if (KinkyDungeonJailGuard()?.aware && condition(KinkyDungeonJailGuard())) return KinkyDungeonJailGuard();

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
	return cand || KinkyDungeonJailGuard();
}

/**
 * @param player
 */
function KDPrisonCommonGuard(player: entity, _call: boolean = false): entity {
	// Suppress standard guard call behavior
	KinkyDungeonSetFlag("SuppressGuardCall", 10);
	let guard = KDGetNearestFactionGuard(player.x, player.y);
	if (guard)
		KDGameData.JailGuard = guard.id;

	return KinkyDungeonJailGuard();
}


/**
 * Gets the groups and restraints to add based on a set of jail tags
 * @param player
 * @param jailLists
 * @param lock
 * @param maxPower
 */
function KDPrisonGetGroups(_player: entity, jailLists: string[], lock: string, maxPower: number): KDJailGetGroupsReturn {
	let groupsToStrip: string[] = [];
	let itemsToApply: {item: string; variant: string}[] = [];
	let itemsApplied = {};
	let itemsToKeep: Record<string, boolean> = {};
	let itemsToStrip: Record<string, boolean> = {};

	// First populate the items
	let jailList = KDGetJailRestraints(jailLists, false, false);

	// Next we go over the prison groups and figure out if there is anything in that group
	for (let prisonGroup of KDPRISONGROUPS) {
		let strip = false;
		for (let g of prisonGroup) {
			let restraints = KinkyDungeonGetJailRestraintsForGroup(g, jailList, false, lock);
			let restraints2 = KinkyDungeonGetJailRestraintsForGroup(g, jailList, true, lock, true, true);
			if (restraints2.length > 0) {
				for (let r of restraints2) {
					itemsToKeep[r.restraint.name] = true;
				}
				let restraintStack = KDDynamicLinkList(KinkyDungeonGetRestraintItem(g), true);
				if (restraintStack.length > 0) {
					for (let r of restraintStack) {
						if (KinkyDungeonRestraintPower(r, true) < maxPower) {
							strip = true;
							itemsToStrip[r?.id] = true;
						}
					}
				}
			}
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
		itemsToKeep: itemsToKeep,
		itemsToStrip: itemsToStrip,
	};
}

/**
 * Throttles prison checks
 * @param player
 */
function KDPrisonTick(_player: entity): boolean {
	if (!KinkyDungeonFlags.get("prisonCheck")) {
		KinkyDungeonSetFlag("prisonCheck", 3 + Math.floor(KDRandom() * 3));
		return true;
	}
	return false;
}

/**
 * @param player
 */
function KDPrisonIsInFurniture(player: entity): boolean {
	if (KinkyDungeonPlayerTags.get("Furniture")) {
		let tile = KinkyDungeonTilesGet(player.x + "," + player.y);
		if (tile?.Furniture) {
			return true;
		}
	}
	return false;
}

/**
 * @param player
 * @param state
 */
function KDGoToSubState(_player: entity, state: string): string {
	KDMapData.PrisonStateStack.unshift(KDMapData.PrisonState);
	return state;
}

/**
 * @param player
 */
function KDPopSubstate(_player: entity): string {
	let state = KDMapData.PrisonStateStack[0];
	if (state) {
		KDMapData.PrisonStateStack.splice(0, 1);
		return state;
	}
	return KDPrisonTypes[KDMapData.PrisonType]?.default_state || "";
}


/**
 * Resets the prison state stack
 * @param player
 * @param state
 */
function KDSetPrisonState(_player: entity, state: string): string {
	if (KDMapData.PrisonStateStack?.length > 0) {
		for (let s of KDMapData.PrisonStateStack) {
			if (KDPrisonTypes[KDMapData.PrisonType].states[s].finally) KDPrisonTypes[KDMapData.PrisonType].states[s].finally(0, state, true);
		}
	}

	KDMapData.PrisonStateStack = [];
	return state;
}

/**
 * @param player
 */
function KDCurrentPrisonState(_player: entity): string {
	return KDMapData.PrisonState;
}
