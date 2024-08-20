// This file contains functions that help create a set of /NPCRestraints/ objects to apply to NPCs based on the following parameter options:
// - A set of restraint tags + optionally list of allowed restraint items
// - A standalone list of allowed restraint items
// - A standalone list of raw materials
// - A list of /item/ objects
// - Any combination of the above, prioritizing equipping stuff from item lists, then specific items, then tags, then raw materials
// There are also 'lockrules' which are params that can be applied to establish rules for the types of locks added to restraints, and conjuration status

// Also included is a function to generate the above based on an array of SpecialBondageTypes in order to dynamically generate bondage

function KDGetNPCBindingSlotForItem(restraint: restraint, id: number): {row: NPCBindingGroup, sgroup: NPCBindingSubgroup} {
	let restraints = KDGetNPCRestraints(id);
	for (let row of NPCBindingGroups) {
		for (let sgroup of [row.encaseGroup, ...row.layers]) {
			if (KDRowItemIsValid(
				restraint, sgroup, row, restraints
			)) return {row: row, sgroup: sgroup};
		}

	}

	return null;
}