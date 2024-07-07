interface NPCRestraint {
	name: string,
	lock: string,
}

function KDDrawNPCRestrain(restraints: NPCRestraint[], x: number, y: number) {

}

function KDGetNPCRestraints(id: number): NPCRestraint[] {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	let value = KDGameData.NPCRestraints["" + id];
	if (!value)
		return [];
	else return value;
}

function KDSetNPCRestraints(id: number, restraints: NPCRestraint[]) {
	if (!KDGameData.NPCRestraints)
		KDGameData.NPCRestraints = {};
	KDGameData.NPCRestraints["" + id] = restraints;
}