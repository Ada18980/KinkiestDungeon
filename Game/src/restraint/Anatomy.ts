let GroupHeights: {[_: string]: number} = {
	ItemHood: 3,
	ItemHead: 3,
	ItemEars: 3,
	ItemMouth: 2.5,
	ItemNeck: 2,
	ItemNeckRestraints: 2,
	ItemBreast: 1,
	ItemNipples: 1,
	ItemArms: 1,
	ItemHands: 0,
	ItemTorso: 0,
	ItemPelvis: -1,
	ItemVulva: -1.25,
	ItemButt: -1.25,
	ItemVulvaPiercings: -1.25,
	ItemLegs: -1.5,
	ItemFeet: -2.5,
	ItemBoots: -3,
};

let KDPoseHeights: {[_: string]: number} = {
	// Arms
	Free: 0,
	Yoked: 2,
	Front: 1,
	Crossed: 0,
	Boxtie: 0,
	Wristtie: -1,
	Up: 2,

	// Legs
	Kneel: 2,
	KneelClosed: 2,
	Hogtie: 0,
	Spread: 0,
	Closed: 0,

};

interface GroupHeightData {
	C: Character;
    group: string;
	height: number,
}
function KDGetGroupHeight(C: Character, group: string) {
	let data: GroupHeightData = {
		C: C,
		group: group,
		height: 0
	}

	data.height = GroupHeights[data.group] || 0;

	if (group == "ItemHands") {
		let pose = KDGetPoseOfType(data.C, "Arms");

		data.height += KDPoseHeights[pose] || 0;
	} else
	if (["ItemLegs", "ItemBoots", "ItemFeet"].includes(group)) {
		let pose = KDGetPoseOfType(data.C, "Legs");

		data.height += KDPoseHeights[pose] || 0;

		if (group != "ItemLegs" && (KNEELPOSES.includes(pose) || HOGTIEPOSES.includes(pose))) {
			data.height += HOGTIEPOSES.includes(pose) ? (group == "ItemBoots" ? 2 : 1) : (group == "ItemBoots" ? 3 : 2);
		}

	}

	KinkyDungeonSendEvent("getGroupHeight", data);

	return data.height;
}

let GroupDepths: {[_: string]: number} = {
	ItemMouth: 0.5,
	ItemHead: 0.5,
	ItemBreast: 1,
	ItemNipples: 1,
	ItemVulva: 0.5,
	ItemButt: -0.5,
	ItemVulvaPiercings: 0.5,
};

let KDPoseDepths: {[_: string]: number} = {
	// Arms
	Free: 0,
	Yoked: 0,
	Front: 1,
	Crossed: 1,
	Boxtie: -1,
	Wristtie: -1,
	Up: -1,

	// Legs
	Kneel: 2,
	KneelClosed: 2,
	Hogtie: 1,
	Spread: 0,
	Closed: 0,

};

interface GroupDepthData {
	C: Character;
    group: string;
	depth: number,
}
function KDGetGroupDepth(C: Character, group: string) {
	let data: GroupDepthData = {
		C: C,
		group: group,
		depth: GroupDepths[group] || 0
	}

	if (group == "ItemHands") {
		let pose = KDGetPoseOfType(data.C, "Arms");

		data.depth += KDPoseDepths[pose] || 0;
	} else
	if (["ItemLegs", "ItemBoots", "ItemFeet"].includes(group)) {
		let pose = KDGetPoseOfType(data.C, "Legs");

		let depth = KDPoseDepths[pose] || 0;
		if (depth > 0 && depth < 3 && group != "ItemLegs") {
			depth -= 2;
		}

		data.depth += depth;

	}

	KinkyDungeonSendEvent("getGroupDepth", data);

	return data.depth;
}