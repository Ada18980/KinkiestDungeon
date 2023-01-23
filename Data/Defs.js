"use strict";

let LAYERS_BASE = [
	"Eyes",
	"Head",
	"Chest",
	"HandLeft",
	"ArmLeft",
	"FootLeft",
	"LegLeft",
	"FootRight",
	"LegRight",
	"FootRightKneel",
	"Butt",
	"TorsoUpper",
	"TorsoLower",
	"Torso",
	"HandRight",
	"ArmRight",
];

let LayerProperties = {
	Eyes: {
		Parent: "Head",
	},
	HairFront: {
		Parent: "Head",
	},
	HairMiddle: {
		Parent: "Head",
	},
	HairBack: {
		Parent: "Head",
	},
	Mouth: {
		Parent: "Head",
	},
	Ears: {
		Parent: "Head",
	},
	Nose: {
		Parent: "Head",
	},
};

// Constants
/** Internal value for layering */
let LAYER_INCREMENT = 1000;

let MODELHEIGHT = 3500;
let MODELWIDTH = 2480;
/** Model scale to UI scalee */
let MODEL_SCALE = 1000/MODELHEIGHT;
let MODEL_XOFFSET = Math.floor((- MODELWIDTH * MODEL_SCALE)/2);