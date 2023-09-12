let ARMPOSES = ["Free", "Boxtie", "Wristtie", "Yoked", "Front", "Up", "Crossed"];
/** List of poses where the left wrist is invisible */
let WRISTHIDELEFT = ["Boxtie", "Wristtie", "Up", "Crossed"];
/** List of poses where the right wrist is invisible */
let WRISTHIDERIGHT = ["Boxtie", "Wristtie", "Up"];
/** Poses where the torso needs a correction */
let SHOULDERPOSES = ["Up"];
/** Poses where the arms are hidden (usually b/c forearms are visible) */
let HIDEARMPOSES = [];
let FOREARMPOSES = ["Front", "Crossed"];
let CROSSARMPOSES = ["Crossed"];
let HANDRIGHTPOSES = ["Free", "Boxtie", "Yoked"];
let HANDLEFTPOSES = ["Free", "Yoked"];
let FOREHANDRIGHTPOSES = ["Front"];
let FOREHANDLEFTPOSES = ["Front"];
let LEGPOSES = ["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"];
let FOOTRIGHTPOSES = ["Spread", "Closed"];
let FOOTLEFTPOSES = ["Spread", "Closed", "Kneel", "KneelClosed"];
let KNEELPOSES = ["Kneel", "KneelClosed"];
let STANDPOSES = ["Spread", "Closed"];
let CLOSEDPOSES = ["KneelClosed", "Closed"];
let SPREADPOSES = ["Spread", "Kneel"];
let SPREADCLOSEDPOSES = ["Hogtie"];
/** Expressions */

let EYETYPES = ["Neutral", "Surprised", "Dazed", "Closed", "Angry"];
let EYEPOSES = EYETYPES.map((pose) => {return "Eyes" + pose;});
let EYE2POSES = EYETYPES.map((pose) => {return "Eyes2" + pose;});
let BROWTYPES = ["Neutral", "Angry", "Annoyed", "Sad", "Surprised"];
let BROWPOSES = BROWTYPES.map((pose) => {return "Brows" + pose;});
let BROW2POSES = BROWTYPES.map((pose) => {return "Brows2" + pose;});
let MOUTHPOSES = ["MouthNeutral", "MouthDazed", "MouthDistracted", "MouthEmbarrassed", "MouthFrown", "MouthSmile", "MouthSurprised", "MouthPout"];
let BLUSHPOSES = ["BlushLow", "BlushMedium", "BlushHigh", "BlushExtreme"];
/** Standard GlobalDefaultOverrides, this should be for any pose that's meant to use mostly normal assets */
let STANDARD_DEFAULTS = ["Hogtie"];

let PoseProperties: {[_: string]: PoseProperty} = {
	Hogtie: {
		rotation: -95,
		pri_rotation: 1,
		offset_x: 0.32,
		offset_y: 0.1,
		pri_offset: 2,
		global_default: "Closed",
		mods: [{
			Layer: "Head",
			rotation: 30,
			rotation_x_anchor: 1190/MODELWIDTH,
			rotation_y_anchor: 690/MODELHEIGHT,
			offset_x: 1190/MODELWIDTH,
			offset_y: 690/MODELHEIGHT,
		}],
	},
	Kneel: {
		offset_y: 0.15,
		pri_offset: 1,
	},
	KneelClosed: {
		offset_y: 0.15,
		pri_offset: 1,
		global_default: "Kneel",
		mods: [{
			Layer: "ShoeLeft",
			rotation: -5.84,
			rotation_x_anchor: 915/MODELWIDTH,
			rotation_y_anchor: 2160/MODELHEIGHT,
			offset_x: 915/MODELWIDTH,
			offset_y: 2160/MODELHEIGHT,
		}],
	},
	Front: {
		global_default: "Boxtie",
	},
	Crossed: {
		global_default: "Front",
	},
};

/**
 * Get the pose from the pose array with the highest value of checkvar
 */
function ModelGetMaxPose(Poses: {[_: string]: boolean}, CheckVar: string, FilterVar: string | null = null): string {
	let maxPose = "";
	for (let p of Object.keys(Poses)) {
		if (PoseProperties[p] && PoseProperties[p][CheckVar] != undefined
			&& (!FilterVar || PoseProperties[p][FilterVar])
			&& (!maxPose || PoseProperties[p][CheckVar] > PoseProperties[maxPose][CheckVar])
		) {
			maxPose = p;
		}
	}
	return maxPose;
}

function ModelGetPoseOffsets(Poses) {
	let pose = ModelGetMaxPose(Poses, "pri_offset");
	let x = 0;
	let y = 0;
	if (PoseProperties[pose]?.offset_x) x = PoseProperties[pose]?.offset_x;
	if (PoseProperties[pose]?.offset_y) y = PoseProperties[pose]?.offset_y;
	return {X_Offset: x, Y_Offset: y};
}

function ModelGetPoseRotation(Poses) {
	let pose = ModelGetMaxPose(Poses, "pri_rotation");
	let x = 0.5;
	let y = 0.5;
	let r = 0;
	if (PoseProperties[pose]?.rotation_x_anchor) x = PoseProperties[pose]?.rotation_x_anchor;
	if (PoseProperties[pose]?.rotation_y_anchor) y = PoseProperties[pose]?.rotation_y_anchor;
	if (PoseProperties[pose]?.rotation) r = PoseProperties[pose]?.rotation;
	return {rotation: r, X_Anchor: x, Y_Anchor: y};
}

function ModelGetPoseMods(Poses): {[_: string]: PoseMod[]} {
	let mods: {[_: string]: PoseMod[]} = {};
	for (let p of Object.keys(Poses)) {
		if (PoseProperties[p]?.mods) {
			for (let mod of PoseProperties[p].mods) {
				if (!mods[mod.Layer]) mods[mod.Layer] = [];
				mods[mod.Layer].push(mod);
			}
		}
	}
	return mods;
}


function CheckPoseOrTags(C: Character, tag: string) {
	if (C == KinkyDungeonPlayer) {
		if (KinkyDungeonPlayerTags.get(tag)) return true;
	}
	if (KDCurrentModels.get(C)?.Poses[tag]) {
		return true;
	}
	return false;
}

function KDGetAvailablePosesLegs(C: Character): string[] {
	let poses: Record<string, boolean> = {};
	for (let p of LEGPOSES) {
		poses[p] = true;
	}
	if (C == KinkyDungeonPlayer) {
		let closed = false;
		let spread = false;
		// Logic for the player
		if (CheckPoseOrTags(C, "FeetLinked")) {
			delete poses.Spread;
			closed = true;
		} else if (CheckPoseOrTags(C, "ForceKneel")) {
			delete poses.Closed;
		}
		if (!closed && CheckPoseOrTags(C, "FeetSpreader")) {
			delete poses.Closed;
			spread = true;
		}
		if (CheckPoseOrTags(C, "Hogties")) {
			for (let p of STANDPOSES) {
				delete poses[p];
			}
			for (let p of KNEELPOSES) {
				delete poses[p];
			}
		} else if (CheckPoseOrTags(C, "ForceKneel")) {
			for (let p of STANDPOSES) {
				delete poses[p];
			}
		}

		if (closed) {
			for (let p of SPREADPOSES) {
				delete poses[p];
			}
		} else if (spread) {
			for (let p of CLOSEDPOSES) {
				delete poses[p];
			}
		}
	} else {
		// Logic for NPC
		// ???
	}

	return Object.keys(poses);
}


function KDGetAvailablePosesArms(C: Character): string[] {
	let poses: Record<string, boolean> = {};
	for (let p of ARMPOSES) {
		poses[p] = true;
	}

	// TODO make this extensible!!!!
	if (CheckPoseOrTags(C, "Yokes")) {
		poses = {Yoked: true};
	} else if (CheckPoseOrTags(C, "Armbinders")) {
		poses = {Wristtie: true};
	} else if (CheckPoseOrTags(C, "Boxbinders")) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Straitjackets")) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Boxties")) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Wristties")) {
		poses = {Wristtie: true};
	}
	if (KinkyDungeonIsArmsBound(false, false)) {
		delete poses.Free;
		if (!CheckPoseOrTags(C, "HandsFront")) {
			delete poses.Front;
		}
		if (CheckPoseOrTags(C, "HandsBehind") || CheckPoseOrTags(C, "HandsFront")) {
			delete poses.Up;
			delete poses.Front;
		}
		if (CheckPoseOrTags(C, "HandsUp")) {
			delete poses.Boxtie;
			delete poses.Wristtie;
			delete poses.Front;
			delete poses.Yoked;
		}
		if (!CheckPoseOrTags(C, "Yoked")) {
			delete poses.Yoked;
		} else {
			delete poses.Front;
			delete poses.Boxtie;
			delete poses.Wristtie;
		}
	}
	//} else {
	// Logic for NPC
	// ???
	//}

	return Object.keys(poses);
}

function RefreshTempPoses(Character: Character, Restraints: boolean) {
	for (let pose of Object.keys(KDCurrentModels.get(Character).TempPoses))
		delete KDCurrentModels.get(Character).Poses[pose];
	KDCurrentModels.get(Character).TempPoses = {};

	/*for (let m of KDCurrentModels.get(Character).Models.values()) {
		if (m.AddPose) {
			for (let pose of m.AddPose) {
				KDCurrentModels.get(Character).Poses[pose] = true;
			}
		}
	}*/

	if (Restraints && Character == KinkyDungeonPlayer)
		for (let rest of KinkyDungeonAllRestraintDynamic()) {
			let inv = rest.item;
			if (KDRestraint(inv).addPose)
				for (let tag of KDRestraint(inv).addPose) {
					if (!KDCurrentModels.get(Character).TempPoses[tag]) KDCurrentModels.get(Character).TempPoses[tag] = true;
				}
		}
}