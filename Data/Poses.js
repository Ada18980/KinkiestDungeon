"use strict";

let ARMPOSES = ["Free", "Boxtie", "Wristtie", "Yoked", "Front"];
let FOREARMPOSES = ["Front"];
let HANDRIGHTPOSES = ["Free", "Boxtie", "Yoked", "Front"];
let HANDLEFTPOSES = ["Free", "Yoked", "Front"];
let LEGPOSES = ["Spread", "Closed", "Kneel", "Hogtie"];
let FOOTRIGHTPOSES = ["Spread", "Closed"];
let FOOTLEFTPOSES = ["Spread", "Closed", "Kneel"];
let KNEELPOSES = ["Kneel"];
/** Standard GlobalDefaultOverrides, this should be for any pose that's meant to use mostly normal assets */
let STANDARD_DEFAULTS = ["Hogtie"];

/**
 * @type {Record<string, PoseProperty>}
 * */
let PoseProperties = {
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
	Front: {
		global_default: "Boxtie",
	},
};

/**
 * Get the pose from the pose array with the highest value of checkvar
 * @param {Record<string, boolean>} Poses
 * @param {string} CheckVar
 * @param {string} [FilterVar]
 */
function ModelGetMaxPose(Poses, CheckVar, FilterVar) {
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

/** @returns {Record<string, PoseMod[]>} */
function ModelGetPoseMods(Poses) {
	/** @type {Record<string, PoseMod[]>} */
	let mods = {};
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