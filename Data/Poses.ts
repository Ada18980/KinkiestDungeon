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
let ANKLERIGHTPOSES = ["Spread", "Closed"];
let ANKLELEFTPOSES = ["Spread", "Closed", "Kneel", "KneelClosed"];
let FOOTRIGHTPOSES = ["Spread", "Closed"];
let FOOTLEFTPOSES = ["Spread", "Closed", "Kneel", "KneelClosed"];
let CALFRIGHTPOSES = ["Spread", "Closed"];
let CALFLEFTPOSES = ["Spread", "Closed", "Kneel", "KneelClosed", "Hogtie"];
let KNEELPOSES = ["Kneel", "KneelClosed"];
let HOGTIEPOSES = ["Hogtie"];
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
	UprightHogtie: {
		filter_pose: ["Hogtie"],
		rotation: 0,
		pri_rotation: 2,
		offset_x: 0,
		offset_y: 0.1,
		pri_offset: 3,
		global_default: "Closed",
		mods: [
		{
			Layer: "Head",
			rotation: -30,
			rotation_x_anchor: 1190/MODELWIDTH,
			rotation_y_anchor: 690/MODELHEIGHT,
			offset_x: 1190/MODELWIDTH,
			offset_y: 690/MODELHEIGHT,
		},
		{
			Layer: "BG",
			rotation: -90,
			rotation_x_anchor: .5,
			rotation_y_anchor: .5,
			offset_x: .5,
			offset_y: .4,
		}
		]
	},
	SuspendedHogtie: {
		filter_pose: ["Hogtie"],
		rotation: 0,
		pri_rotation: 2,
		offset_x: 0,
		offset_y: 0.0,
		pri_offset: 4,
		global_default: "Closed",
		mods: [
		{
			Layer: "Head",
			rotation: -30,
			rotation_x_anchor: 1190/MODELWIDTH,
			rotation_y_anchor: 690/MODELHEIGHT,
			offset_x: 1190/MODELWIDTH,
			offset_y: 690/MODELHEIGHT,
		},
		{
			Layer: "BG",
			rotation: -90,
			rotation_x_anchor: .5,
			rotation_y_anchor: .5,
			offset_x: .5,
			offset_y: .5,
		}
		]
	},
	Hogtie: {
		rotation: -90,
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
		},{
			Layer: "BG",
			rotation: 90,
			//rotation_x_anchor: .5,
			//rotation_y_anchor: .5,
			//offset_x: 0.641,
			//offset_y: 0.273,
			rotation_x_anchor: .5,
			rotation_y_anchor: .5,
			offset_x: 0.641,
			offset_y: 0.273,
		}
		],
	},

	Kneel: {
		offset_y: 0.15,
		pri_offset: 1,
		mods: [{
			Layer: "BG",
			offset_x: 0,
			offset_y: -.15,
		},

		{
			Layer: "Tail",
			rotation: -75,
			rotation_x_anchor: 1300/MODELWIDTH,
			rotation_y_anchor: 1600/MODELHEIGHT,
			offset_x: 1300/MODELWIDTH,
			offset_y: 1600/MODELHEIGHT,
		},
	],
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
		},{
			Layer: "BG",
			offset_x: 0,
			offset_y: -.15,
		},

		{
			Layer: "Tail",
			rotation: -75,
			rotation_x_anchor: 1300/MODELWIDTH,
			rotation_y_anchor: 1600/MODELHEIGHT,
			offset_x: 1300/MODELWIDTH,
			offset_y: 1600/MODELHEIGHT,
		},],
	},
	Front: {
		global_default: "Boxtie",
	},
	Crossed: {
		global_default: "Boxtie",
	},
};

/**
 * Get the pose from the pose array with the highest value of checkvar
 */
function ModelGetMaxPose(Poses: {[_: string]: boolean}, CheckVar: string, FilterVar: string | null = null): string {
	let maxPose = "";
	for (let p of Object.keys(Poses)) {
		if (PoseProperties[p] && PoseProperties[p][CheckVar] != undefined
			&& (!PoseProperties[p].filter_pose || PoseProperties[p].filter_pose.some((pose) => {return Poses[pose];}))
			&& (!FilterVar || PoseProperties[p][FilterVar])
			&& (!maxPose || PoseProperties[p][CheckVar] > PoseProperties[maxPose][CheckVar])
		) {
			maxPose = p;
		}
	}
	return maxPose;
}

function ModelGetPoseOffsets(Poses: {[_: string]: boolean}) {
	let pose = ModelGetMaxPose(Poses, "pri_offset");
	let x = 0;
	let y = 0;
	if (PoseProperties[pose]?.offset_x) x = PoseProperties[pose]?.offset_x;
	if (PoseProperties[pose]?.offset_y) y = PoseProperties[pose]?.offset_y;
	return {X_Offset: x, Y_Offset: y};
}

function ModelGetPoseRotation(Poses: {[_: string]: boolean}) {
	let pose = ModelGetMaxPose(Poses, "pri_rotation");
	let x = 0.5;
	let y = 0.5;
	let r = 0;
	if (PoseProperties[pose]?.rotation_x_anchor) x = PoseProperties[pose]?.rotation_x_anchor;
	if (PoseProperties[pose]?.rotation_y_anchor) y = PoseProperties[pose]?.rotation_y_anchor;
	if (PoseProperties[pose]?.rotation) r = PoseProperties[pose]?.rotation;
	return {rotation: r, X_Anchor: x, Y_Anchor: y};
}

function ModelGetPoseMods(Poses: {[_: string]: boolean}): {[_: string]: PoseMod[]} {
	let mods: {[_: string]: PoseMod[]} = {};
	for (let p of Object.keys(Poses)) {
		if (PoseProperties[p]?.mods) {
			if (!PoseProperties[p].filter_pose || PoseProperties[p].filter_pose.some((pose) => {return Poses[pose];}))
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
		if (["FeetLinked", "Legbinders", "LegBind", "Hobbleskirts"].some((tag) => {return CheckPoseOrTags(C, tag);})) {
			delete poses.Spread;
			delete poses.Kneel;
			closed = true;
		} else if (CheckPoseOrTags(C, "ForceKneel")) {
			delete poses.Spread;
			delete poses.Closed;
		}
		if (!closed && CheckPoseOrTags(C, "FeetSpreader")) {
			delete poses.Closed;
			spread = true;
		}
		if (CheckPoseOrTags(C, "Hogties") || CheckPoseOrTags(C, "ForceHogtie")) {
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

		if (CheckPoseOrTags(C, "BlockHogtie")) {
			for (let p of HOGTIEPOSES) {
				delete poses[p];
			}
		}
		if (CheckPoseOrTags(C, "BlockKneel")) {
			for (let p of KNEELPOSES) {
				delete poses[p];
			}
		}
		if (CheckPoseOrTags(C, "DiscourageHogtie") && Object.keys(poses).length > Object.keys(HOGTIEPOSES).length) {
			for (let p of HOGTIEPOSES) {
				delete poses[p];
			}
		}
		if (CheckPoseOrTags(C, "DiscourageKneel") && Object.keys(poses).length > Object.keys(KNEELPOSES).length) {
			for (let p of KNEELPOSES) {
				delete poses[p];
			}
		}
		if (CheckPoseOrTags(C, "DiscourageStand") && Object.keys(poses).length > Object.keys(STANDPOSES).length) {
			for (let p of STANDPOSES) {
				delete poses[p];
			}
		}
	} else {
		// Logic for NPC
		// ???
	}

	if (Object.keys(poses).length == 0) {
		if (CheckPoseOrTags(C, "DefaultStand")) {
			poses = {Hogtie: true};
		} else if (CheckPoseOrTags(C, "DefaultKneel")) {
			poses = {Hogtie: true};
		} else {
			poses = {Hogtie: true};
		}
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
	} else if (CheckPoseOrTags(C, "Straitjackets") || CheckPoseOrTags(C, "Crossties")) {
		poses = {Crossed: true};
	} else if (CheckPoseOrTags(C, "Boxties")) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Wristties")) {
		poses = {Wristtie: true};
	} else if (CheckPoseOrTags(C, "Petsuits") || CheckPoseOrTags(C, "Fiddles")) {
		poses = {Front: true};
	}
	if (KinkyDungeonIsArmsBound(false, false)) {
		delete poses.Free;
		if (!CheckPoseOrTags(C, "HandsFrontAllowed") && !CheckPoseOrTags(C, "HandsFront") && !CheckPoseOrTags(C, "Petsuits") && !CheckPoseOrTags(C, "Fiddles")) {
			delete poses.Front;
		}
		if (!CheckPoseOrTags(C, "HandsCrossed") && !CheckPoseOrTags(C, "HandsCrossedAllowed") && !CheckPoseOrTags(C, "Straitjackets") && !CheckPoseOrTags(C, "Crossties")) {
			delete poses.Crossed;
		}
		if (CheckPoseOrTags(C, "HandsBehind")) {
			
			if (!(CheckPoseOrTags(C, "Yokes")))
				delete poses.Yoked;
			if (!(CheckPoseOrTags(C, "Butterfly") || CheckPoseOrTags(C, "HandsUp")))
				delete poses.Up;
			if (!(CheckPoseOrTags(C, "Petsuits") || CheckPoseOrTags(C, "Fiddles")))
				delete poses.Front;
			if (!(CheckPoseOrTags(C, "Straitjackets") || CheckPoseOrTags(C, "Crossties")))
				delete poses.Crossed;
		}
		if (CheckPoseOrTags(C, "ElbowTied") && poses.Wristtie) {
			delete poses.Boxtie;
			delete poses.Up;
		}
		if (CheckPoseOrTags(C, "HandsUp")) {
			delete poses.Boxtie;
			delete poses.Wristtie;
			delete poses.Front;
			delete poses.Yoked;
			delete poses.Crossed;
		} else if (!CheckPoseOrTags(C, "HandsUpAllowed")) {
			delete poses.Up;
		}
		if (!CheckPoseOrTags(C, "Yoked")) {
			delete poses.Yoked;
		} else {
			delete poses.Front;
			delete poses.Boxtie;
			delete poses.Wristtie;
			delete poses.Crossed;
		}
	}

	if (CheckPoseOrTags(C, "PreferWristtie") && poses.Wristtie) {
		poses = {Wristtie: true};
	}

	if (CheckPoseOrTags(C, "PreferBoxtie") && poses.Boxtie) {
		poses = {Boxtie: true};
	}

	if (CheckPoseOrTags(C, "PreferCrossed") && poses.Crossed) {
		poses = {Crossed: true};
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
			if (KDRestraint(inv).addPoseIfTopLevel && KinkyDungeonGetRestraintItem(KDRestraint(inv).Group) == inv)
				for (let tag of KDRestraint(inv).addPoseIfTopLevel) {
					if (!KDCurrentModels.get(Character).TempPoses[tag]) KDCurrentModels.get(Character).TempPoses[tag] = true;
				}


		}

	if (KDToggles.ChastityOption) {
		KDCurrentModels.get(Character).TempPoses.ChastityOption = true;
	}
	if (KDToggles.ChastityBraOption) {
		KDCurrentModels.get(Character).TempPoses.ChastityBraOption = true;
	}
}