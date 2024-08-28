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
	forceConjure: string,
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

function KDGetNPCRestraintPower(restraint: NPCRestraint): number {
	let power = KDRestraint(restraint)?.power || 0;
	if (restraint.inventoryVariant) {
		if (KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power)
			power += KinkyDungeonRestraintVariants[restraint.inventoryVariant]?.power;
	} else if (restraint.powerbonus) power += restraint.powerbonus;

	return 0;
}

function KDGetNPCEligibleRestraints_fromTags(id: number, tags: string[], options: {
	forceEffLevel?: number,
	allowedRestraints?: restraint[],
	allowedRestraintNames?: string[],
	noOverride?: boolean,
	allowVariants?: boolean,
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
				for (let t of tags.keys()) {
					if (restraint.enemyTags[t] != undefined) {
						weight += restraint.enemyTags[t];
						enabled = true;
					}
				}

				if (restraint.enemyTagsMult)
					for (let t of tags.keys()) {
						if (restraint.enemyTagsMult[t] != undefined) {
							weight *= restraint.enemyTagsMult[t];
						}
					}
				if (enabled) {
					cache.push({r: restraint, w:weight});
				}
			}
		}
	}

	// Filter by what we can apply
	let cachePossible: {r: restraint, w: number, v?: ApplyVariant, row: NPCBindingGroup, sgroup: NPCBindingSubgroup}[] = [];

	if (options?.noOverride) {
		// Simple function
		for (let c of cache) {
			let variants: ApplyVariant[] = [undefined];
			if (c.r.ApplyVariants) {
				for (let variant of Object.entries(c.r.ApplyVariants)) {
					if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
						&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => {
							return tags.includes(tag) != undefined;
						}))) {
							variants.push(KDApplyVariants[variant[0]]);
					}
				}
			}
			for (let v of variants) {
				let slot = KDGetNPCBindingSlotForItem(c.r, id, false);
				if (slot) cachePossible.push({r: c.r, w: c.w, v: v, row: slot.row, sgroup: slot.sgroup});
			}
		}
	} else {
		// Complex function
		// We dont do variants atm, TODO
		for (let c of cache) {
			let variants: ApplyVariant[] = [undefined];
			if (c.r.ApplyVariants) {
				for (let variant of Object.entries(c.r.ApplyVariants)) {
					if (effLevel >= KDApplyVariants[variant[0]].minfloor && !(effLevel >= KDApplyVariants[variant[0]].maxfloor)
						&& (!variant[1].enemyTags || Object.keys(variant[1].enemyTags).some((tag) => {
							return tags.includes(tag) != undefined;
						}))) {
							variants.push(KDApplyVariants[variant[0]]);
					}
				}
			}
			for (let v of variants) {
				let power = KDGetNPCRestraintPower(
					{
						name: c.r.name,
						powerbonus: v?.powerBonus,
						id: -1,
						lock: "",
					}
				);
				let slot = KDGetNPCBindingSlotForItem(c.r, id, false, power);
				if (slot) cachePossible.push({r: c.r, w: c.w, v: v, row: slot.row, sgroup: slot.sgroup});
			}

		}
	}


	return ret;
}