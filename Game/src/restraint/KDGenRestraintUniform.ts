// This file contains functions that help create a set of /NPCRestraints/ objects to apply to NPCs based on the following parameter options:
// - A set of restraint tags + optionally list of allowed restraint items
// - A standalone list of allowed restraint items
// - A standalone list of raw materials
// - A list of /item/ objects
// - Any combination of the above, prioritizing equipping stuff from item lists, then specific items, then tags, then raw materials
// There are also 'lockrules' which are params that can be applied to establish rules for the types of locks added to restraints, and conjuration status

// Also included is a function to generate the above based on an array of SpecialBondageTypes in order to dynamically generate bondage

interface EligibleRestraintEntry {
	restraint: restraint,
	applyVariant: ApplyVariant,
	lock: string,
	forceConjure: boolean,

	/** eligible row */
	row: NPCBindingGroup,
	/** Eligible slot */
	slot: NPCBindingSubgroup,
	faction?: string,
}

function KDGetNPCBindingSlotForItem(restraint: restraint, id: number, treatAsEmpty: boolean = false, power?: number): {row: NPCBindingGroup, sgroup: NPCBindingSubgroup} {
	let restraints = KDGetNPCRestraints(id);
	for (let row of NPCBindingGroups) {
		for (let sgroup of [row.encaseGroup, ...row.layers]) {
			if (KDRowItemIsValid(
				restraint, sgroup, row, restraints, treatAsEmpty, power
			)) return {row: row, sgroup: sgroup};
		}

	}
	return null;
}

/**
 *
 * @param bindType - bind type, used for lookup
 * @param playerEffect - checks if it has a tag, overrides if true, otherwise uses bindtype
 * @param merge - merge bindType and playerEffect
 */
function KDGetBulletBindingTags(bindType: string, playerEffect: any, merge: boolean): string[] {
	let ret: string[] = [];
	if (bindType && KDBindTypeTagLookup[bindType]) ret = [...KDBindTypeTagLookup[bindType]];
	if (!merge && ret.length > 0) return ret;
	if (playerEffect?.tag) {
		ret.push(playerEffect.tag);
	}
	if (playerEffect?.tags) {
		ret.push(...playerEffect.tags);
	}
	return ret;
}

function KDGetNPCRestraintPower(restraint: NPCRestraint): number {
	let power = KDRestraint(restraint)?.power || 0;
	if (restraint.inventoryVariant) {
		if (KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power)
			power += KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power;
	} else if (restraint.powerbonus) power += restraint.powerbonus;

	return power;
}

function KDGetNPCEligibleRestraints_fromTags(id: number, tags: string[], options: {
	forceEffLevel?: number,
	allowedRestraints?: restraint[],
	allowedRestraintNames?: string[],
	noOverride?: boolean,
	allowVariants?: boolean,
	forceLock?: string, // If it does have defaultlock it forces this still
	fallbackLock?: string, // If it doesnt have defaultLock
	forceCurse?: string,
	forceConjure?: boolean,
}): EligibleRestraintEntry[] {
	let ret: EligibleRestraintEntry[] = [];
	let effLevel = (options?.forceEffLevel != undefined ? options.forceEffLevel : undefined) || KDGetEffLevel();

	let arousalMode = KinkyDungeonStatsChoice.get("arousalMode");

	let cache: {r: restraint, w: number, v?: ApplyVariant}[] = [];

	// Build the cache
	for (let restraint of options?.allowedRestraints || KinkyDungeonRestraints) {

		if ((
			effLevel >= restraint.minLevel
				|| KinkyDungeonNewGame > 0
				|| (restraint.ignoreMinLevelTags?.some((t) => {return tags.includes(t);}))
				|| options?.allowedRestraintNames?.includes(restraint.name)
		) && (
			!restraint.maxLevel
				|| effLevel < restraint.maxLevel
				|| (restraint.ignoreMaxLevelTags?.some((t) => {return tags.includes(t);}))
		) && (
			restraint.allFloors
				|| restraint.floors[KinkyDungeonMapIndex[MiniGameKinkyDungeonCheckpoint] || MiniGameKinkyDungeonCheckpoint]
				|| (restraint.ignoreFloorTags?.some((t) => {return tags.includes(t);}))

		)) {
			if (!restraint.arousalMode || arousalMode) {
				let enabled = false;
				let weight = restraint.weight;
				for (let t of tags) {
					if (restraint.enemyTags[t] != undefined) {
						weight += restraint.enemyTags[t];
						enabled = true;
					}
				}

				if (restraint.enemyTagsMult)
					for (let t of tags) {
						if (restraint.enemyTagsMult[t] != undefined) {
							weight *= restraint.enemyTagsMult[t];
						}
					}
				if (enabled && weight > 0) {
					cache.push({r: restraint, w:weight});
				}


				if (enabled && options?.allowVariants && restraint.ApplyVariants) {
					for (let variant of Object.entries(restraint.ApplyVariants)) {

						if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
							&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some(
						(tag) => {return tags.includes(tag);}))) {

							let w = weight * (variant[1].weightMult || 1) + (variant[1].weightMod || 0);

							if (variant[1].enemyTags)
								for (let tag in variant[1].enemyTags)
									if (tags[tag]) w += variant[1].enemyTags[tag];

							if (variant[1].enemyTagsMult)
								for (let tag in variant[1].enemyTagsMult)
									if (tags[tag]) w *= variant[1].enemyTagsMult[tag];


							if (w) {
								cache.push({
									r: restraint,
									v: KDApplyVariants[variant[0]],
									w: w,
								});
							}
						}
					}
				}
			}
		}
	}

	// Filter by what we can apply
	let cachePossible: {r: restraint, w: number, v?: ApplyVariant, row: NPCBindingGroup, sgroup: NPCBindingSubgroup}[] = [];

	if (options?.noOverride) {
		// Simple function
		for (let c of cache) {
			/*if (c.r.ApplyVariants) {
				for (let variant of Object.entries(c.r.ApplyVariants)) {
					if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
						&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => {
							return tags.includes(tag) != undefined;
						}))) {
							variants.push(KDApplyVariants[variant[0]]);
					}
				}
			}*/
			//for (let v of variants) {
			let slot = KDGetNPCBindingSlotForItem(c.r, id, false);
			if (slot) cachePossible.push({r: c.r, w: c.w, v: c.v, row: slot.row, sgroup: slot.sgroup});
			//}
		}
	} else {
		// Complex function
		// We dont do variants atm, TODO
		for (let c of cache) {
			/*let variants: ApplyVariant[] = [undefined];
			if (c.r.ApplyVariants) {
				for (let variant of Object.entries(c.r.ApplyVariants)) {
					if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
						&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => {
							return tags.includes(tag) != undefined;
						}))) {
							variants.push(KDApplyVariants[variant[0]]);
					}
				}
			}*/
			//for (let v of variants) {
			let power = KDGetNPCRestraintPower(
				{
					name: c.r.name,
					powerbonus: c.v?.powerBonus,
					id: -1,
					lock: "",
				}
			);
			let slot = KDGetNPCBindingSlotForItem(c.r, id, false, power);
			if (slot) cachePossible.push({r: c.r, w: c.w, v: c.v, row: slot.row, sgroup: slot.sgroup});
			//}

		}
	}

	for (let cp of cachePossible) {
		ret.push({
			applyVariant: cp.v,
			forceConjure: cp.r.forceConjure || options?.forceConjure,
			lock: KinkyDungeonIsLockable(cp.r) ?
				(options?.forceLock != undefined ? options.forceLock : cp.r.DefaultLock) || options?.fallbackLock
				: undefined,
			restraint: cp.r,
			row: cp.row,
			slot: cp.sgroup
		});
	}


	return ret;
}