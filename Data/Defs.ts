let LAYERS_BASE = [
	"HatDeco",
	"Hat",
	"HeadbandDeco",
	"Headband",
	"HairFront",
	"Mask",
	"Brows",
	// Head items
	"Blindfold",
	"BlindfoldWrap",
	"GagMuzzleStraps",
	"GagMuzzle",
	"GagFlatStraps",
	"GagFlat",
	"GagStraps",
	"Gag",
	"GagWrap",
	// Hair mid
	"Hair",
	"Circlet",
	// Head
	"Eyes",
	"Mouth",
	"Blush",
	"Head",


	"Yoke",

	// Clothes that go over the chest and hang down
	"Shoulders",

	// Hair mid
	"HairMid",


	// Collar and collar accessories
	"CollarAcc",
	"Collar",

	// Bondage
	"BindForeWristLeft",
	"BindForeWristRight",
	"BindForeArmLeft",
	"BindForeArmRight",
	"BindForeHandLeft",
	"BindForeHandRight",

	"ForeWrists",


	// Forearms (only in HandsFront)
	"ForeWristLeft",
	"ForeArmLeft",

	"ForeSleeveLeft",
	"ForeSleeveDecoLeft",
	"GloveLeft",
	"ForeHandLeft",

	"ForeWristRight",
	"ForeArmRight",

	"ForeSleeveRight",
	"ForeSleeveDecoRight",
	"GloveRight",
	"ForeHandRight",



	// This slot is for things like breastplates and things that go over
	"WrappingChest",

	"Jacket",
	"ChestDeco",
	"ChestStraps",
	"Chestplate",

	// Bondage
	"BindWristLeft",
	"BindWristRight",
	"BindArmLeft",
	"BindArmRight",
	"BindHandLeft",
	"BindHandRight",

	// Certain pieces of armor go over the shirt
	"BeltBondage",
	"BeltCharm",
	"Belt",
	"BeltDeco",

	"BaggyShirt",

	// Skirts that dont follow shilhouette
	"OverSkirtDeco",
	"OverSkirt",
	"Greaves",



	// Chest is breasts, should only intersect on bottom and side edges, top is indeterminate
	"Straps",
	"NecklaceCharm",
	"Necklace",

	// Skirts that dont follow shilhouette and are puffy
	"SkirtPoofyLeftLeg",

	"HarnessOver",
	"BindChest",
	"BraChest",
	"Chest",

	"WrappingTorso",

	"StrapsUnderbust",

	// For form-fitting stuff that nonetheless goes over a shirt
	"Bustier",
	"Shirt",
	// For things that go directly under the breasts
	"Underbust",
	// For things that go around armpit area--mainly ropes and stuff that goes under the breasts
	"Underarms",
	"Bra",

	"HarnessMid",
	"CorsetOver",

	// Skirts that dont follow shilhouette and are puffy
	"SkirtPoofyDeco",
	"SkirtPoofy",


	// Corsets that go under harness and skirt
	"Corset",

	// Skirts that are slim and follow the shilhouette
	"SkirtDeco",
	"Skirt",

	"KneeAccLeft",
	"KneeAccRight",
	// Over feet Bondage
	"Thighs",
	"Thighs3",
	"Thighs2",
	"Thighs1",
	"Ankles",
	"Ankles3",
	"Ankles2",
	"Ankles1",
	"AnkleLeft",
	"AnkleRight",

	// Pants
	"PantsAccLeft",
	"PantLeft",

	"PantsAccRight",
	"PantRight",
	"Pants",

	"HarnessUnder",

	"BeltBack",

	// Left arm clothes
	"ForeArmBondageLeft",
	"SleeveDecoLeft",
	"SleeveLeft",

	// Left arm body - reserved for body and catsuits
	"WristLeft",
	"HandLeft",
	"ArmLeft",

	// Shoes
	"ShoeLeftOver",
	"ShoeRightOver",
	"OverShoes",
	"ShoeLeftDeco",
	"ShoeLeft",
	"ShoeRightDeco",
	"ShoeRight",



	// Lower body underwear
	"OverSocks",
	"StockingLeft",
	"StockingRight",

	"Panties",

	// Upper body underwear and bodysuits
	"CorsetLiner",
	"Bodysuit",


	// Lower body body - reserved for body and catsuits
	// Note that the lower torso is complex, you should avoid internal overlaps as much as possible
	// External overlaps are fine, e.g. right leg goes over
	"FootLeft",
	"LegLeft",
	"FootRight",
	"LegRight",
	"ShoeLeftHogtie",
	"SockLeftHogtie",
	"FootLeftHogtie",
	"ShoeRightKneel",
	"SockRightKneel",
	"FootRightKneel",
	"ShoulderLeft",
	"ShoulderRight",
	"TorsoUpper",
	"Butt",
	"TorsoLower",
	"Torso",

	// Right arm clothes
	"SleeveDecoRight",
	"SleeveRight",

	// Right arm body - reserved for body and catsuits
	"WristRight",
	"HandRight",
	"ArmRight",

	// Clothes that go behind
	"BeltFarBack",
	"Coat",
	"Cape",

	// Hair and hat back
	"HairBack",
	"HatBack",
];

/** Handy way of referencing multiple layers */
let LayerGroups = {
	"ChestBinding": ToMap([
		"Chest",
		"Shirt",
	]),

	// region slime
	"SlimeLegs": ToMap([
		"Thighs",
		"Thighs3",
		"Thighs2",
		"Thighs1",
		"PantLeft",
		"PantRight",
	]),
	"SlimeFeet": ToMap([
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
	]),
	"Shoes": ToMap([
		"ShoeLeft",
		"ShoeRight",
		"ShoeLeftOver",
		"ShoeRightOver",
		"SockLeft",
		"SockRight",
		"ShoeRightKneel",
		"ShoeLeftHogtie",
	]),
	"SlimeAnkles": ToMap([
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
	]),
	"SlimeTorsoLower": ToMap([
		"OverSkirt",
		"Pants",
	]),
	// endregion

	// region armor
	"Boots": ToMap([
		"Ankles",
		"Ankles3",
		"Ankles2",
		"Ankles1",
		"AnkleLeft",
		"AnkleRight",
	]),
	// endregion

	// Region rope
	"Rope1": ToMap([
		"Shirt",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
		"TorsoUpper"
	]),
	"RopeTorso": ToMap([
		"Shirt",
		"CorsetLiner",
		// Skirts that dont follow shilhouette and are puffy
		"SkirtPoofyDeco",
		"SkirtPoofy",
		// Skirts that are slim and follow the shilhouette
		"SkirtDeco",
		"Skirt",

		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Panties",

		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
	]),

	"RopeFore": ToMap([
		"ForeSleeveLeft",
		"ForeSleeveDecoLeft",
		"GloveLeft",
		"ForeHandLeft",

		"ForeWristRight",
		"ForeArmRight",

		"ForeSleeveRight",
		"ForeSleeveDecoRight",
		"GloveRight",
		"ForeHandRight",
	]),

	"RopeThighs": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"Panties",

		"TorsoUpper",
		"Butt",
		"TorsoLower",
		"Torso",
		"LegLeft",
		"LegRight",

		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),
	"RopeCalf": ToMap([
		"PantLeft",
		"PantRight",
		"Pants",

		// Shoes
		"ShoeLeftDeco",
		"ShoeLeft",
		"ShoeRightDeco",
		"ShoeRight",

		"OverSocks",
		"StockingLeft",
		"StockingRight",

		"LegLeft",
		"LegRight",

		"ShoeLeftHogtie",
		"SockLeftHogtie",
		"FootLeftHogtie",
		"ShoeRightKneel",
		"SockRightKneel",
		"FootRightKneel",
	]),
	"ToeTie": ToMap([
		"ShoeLeft", "ShoeRight", "ShoeLeftHogtie", "ShoeRightKneel"
	]),
	// endregion

	// region metal
	"Yoke": ToMap([
		"Shirt",
		"GloveLeft",
		"GloveRight",
		"SleeveLeft",
		"SleeveDecoLeft",
		"SleeveRight",
		"SleeveDecoRight",
		"ArmLeft",
		"ArmRight",
	]),
	// endregion
};



let LayerProperties = {
	Eyes: {
		Parent: "Head",
	},
	Hair: {
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
	Blush: {
		Parent: "Head",
	},
	Brows: {
		Parent: "Head",
	},
	Ears: {
		Parent: "Head",
	},
	Nose: {
		Parent: "Head",
	},
	Hat: {Parent: "Head",},
	Headband: {Parent: "Head"},
	Mask: {Parent: "Head"},
	Blindfold: {Parent: "Head"},
	GagMuzzleStraps: {Parent: "Head"},
	GagMuzzle: {Parent: "Head"},
	GagFlatStraps: {Parent: "Head"},
	GagFlat: {Parent: "Head"},
	GagStraps: {Parent: "Head"},
	Gag: {Parent: "Head"},
	Circlet: {Parent: "Head"},
	HatBack: {Parent: "Head"},
};

let Hardpoints = {
	Front: {
		Parent: "Torso",
		X: 1162,
		Y: 1790,
		Angle: Math.PI*1.5,
	},
	Rear: {
		Parent: "Torso",
		X: 1127,
		Y: 1799,
		Angle: Math.PI*1.5,
	},
	Chest: {
		Parent: "Torso",
		X: 1144,
		Y: 1127,
		Angle: Math.PI*1.0,
	},
	BreastLeft: {
		Parent: "Chest",
		X: 950,
		Y: 1127,
		Angle: Math.PI*1.0,
	},
	BreastRight: {
		Parent: "Chest",
		X: 1350,
		Y: 1127,
		Angle: Math.PI*1.0,
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