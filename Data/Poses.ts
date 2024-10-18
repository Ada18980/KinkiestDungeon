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

let EYETYPES = ["Neutral", "Surprised", "Dazed", "Closed", "Angry", "Sly", "Heart"];
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
		pri_offsetx: 3,
		pri_offsety: 3,
		global_default: "Closed",
		mods: [
		{
			Layer: "Head",
			rotation: -30,
			rotation_x_anchor: 1190,
			rotation_y_anchor: 690,
			offset_x: 1190,
			offset_y: 690,
		},{
			Layer: "BG",
			rotation: -90,
			rotation_x_anchor: .5*MODELWIDTH,
			rotation_y_anchor: .5*MODELHEIGHT,
			offset_x: 0.68*MODELWIDTH,
			offset_y: 0.6*MODELHEIGHT,
		}
		]
	},
	TippedHogtie: {
		filter_pose: ["Hogtie"],
		rotation: -125,
		pri_rotation: 2,
		offset_y: 0.1,
		pri_offsety: 3,
		global_default: "Closed",
		mods: [
		{
			Layer: "BG",
			rotation: 125,
			rotation_x_anchor: .5*MODELWIDTH,
			rotation_y_anchor: .5*MODELHEIGHT,
			offset_x: 0.641*MODELWIDTH,
			offset_y: 0.273*MODELHEIGHT,
		}
		]
	},
	BubbleHogtie: {
		filter_pose: ["Hogtie"],
		rotation: -90,
		pri_rotation: 1.1,
		offset_x: .5,
		offset_xFlip: .1,
		pri_offsetx: 6,
		offset_y: 0.1,
		pri_offsety: 3,
		global_default: "Closed",
		mods: [
		{
			Layer: "Head",
			rotation: -30,
			rotation_x_anchor: 1190,
			rotation_y_anchor: 690,
			offset_x: 1190,
			offset_y: 690,
		},
		{
			Layer: "BG",
			rotation: -90,
			rotation_x_anchor: .5*MODELWIDTH,
			rotation_y_anchor: .5*MODELHEIGHT,
			offset_x: 0.641*MODELWIDTH,
			offset_y: 0.6*MODELHEIGHT,
		}
		]
	},
	SuspendedHogtie: {
		filter_pose: ["Hogtie"],
		rotation: 0,
		pri_rotation: 2,
		offset_x: 0,
		offset_y: 0.0,
		pri_offsetx: 4,
		pri_offsety: 4,
		global_default: "Closed",
		mods: [
		{
			Layer: "Head",
			rotation: -30,
			rotation_x_anchor: 1190,
			rotation_y_anchor: 690,
			offset_x: 1190,
			offset_y: 690,
		},{
			Layer: "BG",
			rotation: -90,
			rotation_x_anchor: .5*MODELWIDTH,
			rotation_y_anchor: .5*MODELHEIGHT,
			offset_x: 0.82*MODELWIDTH,
			offset_y: 0.6*MODELHEIGHT,
		}
		]
	},

	Hogtie: {
		rotation: -90,
		pri_rotation: 1,
		offset_x: 0.52,
		offset_xFlip: 0.17,
		offset_y: 0.2,
		pri_offsetx: 2,
		pri_offsety: 2,
		global_default: "Closed",
		mods: [{
			Layer: "Head",
			rotation: 30,
			rotation_x_anchor: 1190,
			rotation_y_anchor: 690,
			offset_x: 1190,
			offset_y: 690,
		},{
			Layer: "BG",
			rotation: 90,
			//rotation_x_anchor: .5,
			//rotation_y_anchor: .5,
			//offset_x: 0.641,
			//offset_y: 0.273,
			rotation_x_anchor: .5*MODELWIDTH,
			rotation_y_anchor: .5*MODELHEIGHT,
			offset_x: 0.641*MODELWIDTH,
			offset_y: 0.273*MODELHEIGHT,
		}
		],
	},


	SuspendedKneel: {
		filter_pose: ["Kneel", "KneelClosed"],
		offset_y: 0,
		pri_offsetx: 3,
		pri_offsety: 3,
		mods: [
			{
				Layer: "BG",
				offset_x: 0,
				offset_y: -.3*MODELHEIGHT,
			},
		]
	},
	KneelDown: {
		filter_pose: ["Kneel", "KneelClosed"],
		offset_y: .3,
		pri_offsetx: 2,
		pri_offsety: 2,
		mods: [
			{
				Layer: "BG",
				offset_x: 0*MODELWIDTH,
				offset_y: -.15*MODELHEIGHT,
			},
		]
	},
	ShiftRight: {
		offset_x: .2,
		offset_xFlip: -0.2,
		pri_offsetx: 5,
	},
	Kneel: {
		offset_y: 0.15,
		pri_offsetx: 1,
		pri_offsety: 1,
		mods: [{
			Layer: "BG",
			offset_x: 0*MODELWIDTH,
			offset_y: -.15*MODELHEIGHT,
		},

		{
			Layer: "Tail",
			rotation: -75,
			rotation_x_anchor: 1300,
			rotation_y_anchor: 1600,
			offset_x: 1300,
			offset_y: 1600,
		},
	],
	},
	KneelClosed: {
		offset_y: 0.15,
		pri_offsetx: 1,
		pri_offsety: 1,
		global_default: "Kneel",
		mods: [{
			Layer: "ShoeLeft",
			rotation: -5.84,
			rotation_x_anchor: 915,
			rotation_y_anchor: 2160,
			offset_x: 915,
			offset_y: 2160,
		},{
			Layer: "StockingLeftKneel",
			rotation: -5.84,
			rotation_x_anchor: 915,
			rotation_y_anchor: 2160,
			offset_x: 915,
			offset_y: 2160,
		},{
			Layer: "BG",
			offset_x: 0*MODELWIDTH,
			offset_y: -.15*MODELHEIGHT,
		},

		{
			Layer: "Tail",
			rotation: -75,
			rotation_x_anchor: 1300,
			rotation_y_anchor: 1600,
			offset_x: 1300,
			offset_y: 1600,
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

function ModelGetPoseOffsets(Poses: {[_: string]: boolean}, Flip: boolean) {
	let pose = ModelGetMaxPose(Poses, "pri_offsetx");
	let x = (Flip ? PoseProperties[pose]?.offset_xFlip : 0) || PoseProperties[pose]?.offset_x || 0;
	pose = ModelGetMaxPose(Poses, "pri_offsety");
	let y = 0;
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

function CheckPoseOrTags(C: Character, tag: string, tags: Map<string, boolean> = null, tagsOnly: boolean = false) {
	if (C == KinkyDungeonPlayer || tags) {
		if (tags ? tags.get(tag) : KinkyDungeonPlayerTags.get(tag)) return true;
	} else if (NPCTags.get(C)) {
		if (NPCTags.get(C).get(tag)) return true;
	}
	if (!tagsOnly) {
		if (KDCurrentModels.get(C)?.Poses[tag]) {
			return true;
		}
		if (KDCurrentModels.get(C)?.TempPoses && KDCurrentModels.get(C)?.TempPoses[tag]) {
			return true;
		}
	}

	return false;
}

function KDGetAvailablePosesLegs(C: Character, tags: Map<string, boolean> = null, tagsOnly: boolean = false): string[] {
	let poses: Record<string, boolean> = {};
	for (let p of LEGPOSES) {
		poses[p] = true;
	}
	//if (C == KinkyDungeonPlayer) {
	let closed = false;
	let spread = false;
	// Logic for the player
	if (["FeetLinked", "Legbinders", "LegBind", "Hobbleskirts"].some((tag) => {return CheckPoseOrTags(C, tag, tags, tagsOnly);})) {
		delete poses.Spread;
		delete poses.Kneel;
		closed = true;
	} else if (CheckPoseOrTags(C, "ForceKneel", tags, tagsOnly)) {
		delete poses.Spread;
		delete poses.Closed;
	}
	if (!closed && CheckPoseOrTags(C, "FeetSpreader", tags, tagsOnly)) {
		delete poses.Closed;
		spread = true;
	}
	if (CheckPoseOrTags(C, "Hogties", tags, tagsOnly) || CheckPoseOrTags(C, "ForceHogtie", tags, tagsOnly)) {
		for (let p of STANDPOSES) {
			delete poses[p];
		}
		for (let p of KNEELPOSES) {
			delete poses[p];
		}
	} else if (CheckPoseOrTags(C, "ForceKneel", tags, tagsOnly)) {
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

	if (CheckPoseOrTags(C, "BlockHogtie", tags, tagsOnly)) {
		for (let p of HOGTIEPOSES) {
			delete poses[p];
		}
	}
	if (CheckPoseOrTags(C, "BlockKneel", tags, tagsOnly)) {
		for (let p of KNEELPOSES) {
			delete poses[p];
		}
	}
	if (CheckPoseOrTags(C, "DiscourageHogtie", tags, tagsOnly) && Object.keys(poses).length > Object.keys(HOGTIEPOSES).length) {
		for (let p of HOGTIEPOSES) {
			delete poses[p];
		}
	}
	if (CheckPoseOrTags(C, "DiscourageKneel", tags, tagsOnly) && Object.keys(poses).length > Object.keys(KNEELPOSES).length) {
		for (let p of KNEELPOSES) {
			delete poses[p];
		}
	}
	if (CheckPoseOrTags(C, "DiscourageStand", tags, tagsOnly) && Object.keys(poses).length > Object.keys(STANDPOSES).length) {
		for (let p of STANDPOSES) {
			delete poses[p];
		}
	}


	if (Object.keys(poses).length == 0) {
		if (CheckPoseOrTags(C, "DefaultStand", tags, tagsOnly)) {
			poses = {Closed: true};
		} else if (CheckPoseOrTags(C, "DefaultKneel", tags, tagsOnly)) {
			poses = {Kneel: true};
		} else {
			poses = {Hogtie: true};
		}
	}
	//} else {
	// Logic for NPC
	// ???
	//}

	return Object.keys(poses);
}


function KDGetAvailablePosesArms(C: Character, tags: Map<string, boolean> = undefined): string[] {
	let poses: Record<string, boolean> = {};
	for (let p of ARMPOSES) {
		poses[p] = true;
	}

	// TODO make this extensible!!!!
	if (CheckPoseOrTags(C, "Yokes", tags)) {
		poses = {Yoked: true};
	} else if (CheckPoseOrTags(C, "Armbinders", tags)) {
		poses = {Wristtie: true};
	} else if (CheckPoseOrTags(C, "Boxbinders", tags)) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Straitjackets", tags) || CheckPoseOrTags(C, "Crossties", tags)) {
		poses = {Crossed: true};
	} else if (CheckPoseOrTags(C, "Boxties", tags)) {
		poses = {Boxtie: true};
	} else if (CheckPoseOrTags(C, "Wristties", tags)) {
		poses = {Wristtie: true};
	} else if (CheckPoseOrTags(C, "Petsuits", tags) || CheckPoseOrTags(C, "Fiddles", tags)) {
		poses = {Front: true};
	}
	if (KinkyDungeonIsArmsBoundC(C, false, false)) {
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

function RefreshTempPoses(Character: Character, Restraints: boolean, Buffs: boolean = true) {
	KDRefreshPoseOptions(Character);

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

	if (Buffs) {
		if (Character == KinkyDungeonPlayer) {
			for (let buff of Object.values(KinkyDungeonPlayerBuffs)) {
				if (buff.pose && buff.duration >= 0) {
					KDCurrentModels.get(Character).TempPoses[buff.pose] = true;
				}
			}
		} else {
			let entity = KDGetCharacterEntity(Character);
			if (entity?.buffs)
				for (let buff of Object.values(entity.buffs)) {
					if (buff.pose && buff.duration >= 0) {
						KDCurrentModels.get(Character).TempPoses[buff.pose] = true;
					}
				}
		}

	}

	if (Restraints) {
		for (let inv of KDGetRestraintsForID(KDGetCharacterID(Character))) {
			if (KDRestraint(inv)?.addPose)
				for (let tag of KDRestraint(inv).addPose) {
					if (!KDCurrentModels.get(Character).TempPoses[tag]) KDCurrentModels.get(Character).TempPoses[tag] = true;
				}
			if (KDRestraint(inv)?.addPoseIfTopLevel && KinkyDungeonGetRestraintItem(KDRestraint(inv).Group) == inv)
				for (let tag of KDRestraint(inv).addPoseIfTopLevel) {
					if (!KDCurrentModels.get(Character).TempPoses[tag]) KDCurrentModels.get(Character).TempPoses[tag] = true;
				}


		}
	}



	KDRefreshPoseOptions(Character);
}

function KDRefreshPoseOptions(Character: Character) {
	if (KDToggles.ChastityOption) {
		KDCurrentModels.get(Character).TempPoses.ChastityOption = true;
		KDCurrentModels.get(Character).Poses.ChastityOption = true;
	}
	if (KDToggles.CrotchRopeOption || (Character == KinkyDungeonPlayer && KinkyDungeonPlayerTags.get("ChastityBelts"))) {
		KDCurrentModels.get(Character).TempPoses.OptionCrotchRope = true;
		KDCurrentModels.get(Character).Poses.OptionCrotchRope = true;
	}
	if (KinkyDungeonDrawState != "Game" || KinkyDungeonState != "Game") {
		KDCurrentModels.get(Character).TempPoses.Menu = true;
		KDCurrentModels.get(Character).Poses.Menu = true;
	}
	if (KDToggles.ChastityOption2) {
		KDCurrentModels.get(Character).TempPoses.ChastityOption2 = true;
		KDCurrentModels.get(Character).Poses.ChastityOption2 = true;
	}
	if (!KDToggles.Nipples) {
		KDCurrentModels.get(Character).TempPoses.HideNipples = true;
		KDCurrentModels.get(Character).Poses.HideNipples = true;
	}
	if (KDToggles.NippleToysHide) {
		KDCurrentModels.get(Character).TempPoses.HideNippleToys = true;
		KDCurrentModels.get(Character).Poses.HideNippleToys = true;
	}
	if (KDToggles.NipplePiercingsHide) {
		KDCurrentModels.get(Character).TempPoses.HideNipplePiercings = true;
		KDCurrentModels.get(Character).Poses.HideNipplePiercings = true;
	}
	if (KDToggles.NippleToysOption) {
		KDCurrentModels.get(Character).TempPoses.NippleToysOption = true;
		KDCurrentModels.get(Character).Poses.NippleToysOption = true;
	}
	if (KDToggles.DynamicArmor && KinkyDungeonState == "Game") {
		KDCurrentModels.get(Character).TempPoses.DynamicArmor = true;
		KDCurrentModels.get(Character).Poses.DynamicArmor = true;
	}

	if (KDToggles.ChastityBraOption) {
		KDCurrentModels.get(Character).TempPoses.ChastityBraOption = true;
		KDCurrentModels.get(Character).Poses.ChastityBraOption = true;
	}
}

function KDRefreshPoseOptionsMC(MC: ModelContainer) {
	if (KDToggles.CrotchRopeOption) {
		MC.Poses.OptionCrotchRope = true;
	}
	if (KDToggles.ChastityOption) {
		MC.Poses.ChastityOption = true;
	}
	if (KDToggles.ChastityOption2) {
		MC.Poses.ChastityOption2 = true;
	}
	if (!KDToggles.Nipples) {
		MC.Poses.HideNipples = true;
	}
	if (KDToggles.NippleToysHide) {
		MC.Poses.HideNippleToys = true;
	}
	if (KDToggles.NipplePiercingsHide) {
		MC.Poses.HideNipplePiercings = true;
	}
	if (KDToggles.NippleToysOption) {
		MC.Poses.NippleToysOption = true;
	}
	if (KDToggles.DynamicArmor && KinkyDungeonState == "Game") {
		MC.Poses.DynamicArmor = true;
	}
	if (KDToggles.ChastityBraOption) {
		MC.Poses.ChastityBraOption = true;
	}
}