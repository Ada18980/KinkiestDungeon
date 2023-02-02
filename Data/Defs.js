"use strict";

let LAYERS_BASE = [
	"Mask",
	"Blindfold",
	"Gag",
	// Head
	"Eyes",
	"Head",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	"Chest",



	// Left arm clothes
	"SleeveLeft",
	"GloveLeft",

	// Left arm body - reserved for body and catsuits
	"HandLeft",
	"ArmLeft",


	// Lower body clothes with a bit more bulk
	"PantLeft",
	"PantRight",
	"Pants",
	// Lower body underwear
	"StockingLeft",
	"StockingRight",
	"Panties",

	// Lower body body - reserved for body and catsuits
	"FootLeft",
	"LegLeft",
	"FootRight",
	"LegRight",
	"FootRightKneel",
	"Butt",
	"TorsoUpper",
	"TorsoLower",
	"Torso",

	// Right arm clothes
	"SleeveRight",
	"GloveRight",

	// Right arm body - reserved for body and catsuits
	"HandRight",
	"ArmRight",

	// Clothes that go behind
	"Coat",
	"Cape",
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